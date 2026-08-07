<?php
/**
 * Konkan Curry - Universal form endpoint.
 * ---------------------------------------
 * Any form on the site can POST here. Flow:
 *   1) Validate + reCAPTCHA (if enabled)
 *   2) Save to MySQL (bookings table)
 *   3) Send formatted email to the client via SMTP
 *   4) Optional Google Sheet backup
 *
 * Responds with JSON so the front-end can show inline success/error.
 */

declare(strict_types=1);

$cfg = require __DIR__ . '/config.php';

/* ---------- CORS + JSON headers ---------- */
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
if (!empty($cfg['allowed_origin'])) {
    header('Access-Control-Allow-Origin: ' . $cfg['allowed_origin']);
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
}
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function kc_respond(int $code, array $payload): void
{
    http_response_code($code);
    echo json_encode($payload);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    kc_respond(405, ['ok' => false, 'message' => 'Method not allowed.']);
}

/* ---------- Read input (JSON or form-encoded) ---------- */
$raw  = file_get_contents('php://input');
$data = [];
if ($raw && stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== false) {
    $data = json_decode($raw, true) ?: [];
} else {
    $data = $_POST;
}

/* ---------- Honeypot anti-spam (bots fill hidden fields) ---------- */
if (!empty($data['company'])) {
    // Silently accept but ignore — don't tip off bots.
    kc_respond(200, ['ok' => true, 'message' => 'Thank you.']);
}

/* ---------- Helper: pick first non-empty key ---------- */
function kc_pick(array $d, array $keys): ?string
{
    foreach ($keys as $k) {
        if (isset($d[$k]) && trim((string)$d[$k]) !== '') {
            return trim((string)$d[$k]);
        }
    }
    return null;
}

$formName = kc_pick($data, ['form_name', 'form']) ?? 'reservation';
$fullName = kc_pick($data, ['full_name', 'name', 'fullName']);
$email    = kc_pick($data, ['email']);
$phone    = kc_pick($data, ['phone', 'mobile', 'tel']);
$location = kc_pick($data, ['location', 'branch']);
$bDate    = kc_pick($data, ['booking_date', 'date']);
$bTime    = kc_pick($data, ['booking_time', 'time']);
$guests   = kc_pick($data, ['guests', 'people', 'pax']);
$message  = kc_pick($data, ['message', 'notes', 'msg']);

/* ---------- Validation ---------- */
$errors = [];
if (!$fullName) {
    $errors['full_name'] = 'Name is required.';
}
if (!$phone && !$email) {
    $errors['phone'] = 'Phone or email is required.';
}
if ($email && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Please enter a valid email.';
}
if ($errors) {
    kc_respond(422, ['ok' => false, 'message' => 'Please check the form.', 'errors' => $errors]);
}

/* ---------- reCAPTCHA (if enabled) ---------- */
if (!empty($cfg['recaptcha']['enabled'])) {
    $token = kc_pick($data, ['g-recaptcha-response', 'recaptcha_token', 'recaptcha']);
    if (!$token) {
        kc_respond(422, ['ok' => false, 'message' => 'Please complete the reCAPTCHA.']);
    }
    $verify = @file_get_contents(
        'https://www.google.com/recaptcha/api/siteverify?' . http_build_query([
            'secret'   => $cfg['recaptcha']['secret_key'],
            'response' => $token,
            'remoteip' => $_SERVER['REMOTE_ADDR'] ?? '',
        ])
    );
    $result = json_decode($verify ?: '{}', true);
    if (empty($result['success'])) {
        kc_respond(422, ['ok' => false, 'message' => 'reCAPTCHA verification failed. Please try again.']);
    }
}

/* ---------- Collect any extra custom fields (future-proofing) ---------- */
$known = ['form_name','form','full_name','name','fullName','email','phone','mobile','tel',
          'location','branch','booking_date','date','booking_time','time','guests','people',
          'pax','message','notes','msg','company','g-recaptcha-response','recaptcha_token','recaptcha'];
$extra = [];
foreach ($data as $k => $v) {
    if (!in_array($k, $known, true) && is_scalar($v) && trim((string)$v) !== '') {
        $extra[$k] = trim((string)$v);
    }
}

/* ---------- Save to database ---------- */
$saved = false;
$dbError = '';
try {
    require_once __DIR__ . '/db.php';
    $pdo = kc_db($cfg);
    $stmt = $pdo->prepare("
        INSERT INTO bookings
            (form_name, full_name, email, phone, location, booking_date, booking_time,
             guests, message, extra, ip_address, user_agent)
        VALUES
            (:form_name, :full_name, :email, :phone, :location, :booking_date, :booking_time,
             :guests, :message, :extra, :ip_address, :user_agent)
    ");
    $stmt->execute([
        ':form_name'    => $formName,
        ':full_name'    => $fullName,
        ':email'        => $email,
        ':phone'        => $phone,
        ':location'     => $location,
        ':booking_date' => $bDate,
        ':booking_time' => $bTime,
        ':guests'       => $guests,
        ':message'      => $message,
        ':extra'        => $extra ? json_encode($extra, JSON_UNESCAPED_UNICODE) : null,
        ':ip_address'   => $_SERVER['REMOTE_ADDR'] ?? null,
        ':user_agent'   => substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255),
    ]);
    $saved = true;
} catch (Throwable $e) {
    $dbError = $e->getMessage();
    error_log('[KC booking] DB error: ' . $dbError);
}

/* ---------- Build the labelled field set for email/sheet ---------- */
$mailFields = array_filter([
    'Form'     => ucfirst($formName),
    'Name'     => $fullName,
    'Phone'    => $phone,
    'Email'    => $email,
    'Location' => $location,
    'Date'     => $bDate,
    'Time'     => $bTime,
    'Guests'   => $guests,
    'Message'  => $message,
], fn($v) => $v !== null && $v !== '');
foreach ($extra as $k => $v) {
    $mailFields[ucfirst(str_replace('_', ' ', $k))] = $v;
}

/* ---------- Send email via SMTP ---------- */
require_once __DIR__ . '/mailer.php';
[$mailOk, $mailErr] = kc_send_mail($cfg, $formName, $mailFields, $email);
if (!$mailOk) {
    error_log('[KC booking] Mail error: ' . $mailErr);
}

/* ---------- Optional Google Sheet backup ---------- */
if (!empty($cfg['google_sheet']['enabled']) && !empty($cfg['google_sheet']['webhook_url'])) {
    $payload = json_encode([
        'timestamp'    => date('Y-m-d H:i:s'),
        'form_name'    => $formName,
        'full_name'    => $fullName,
        'phone'        => $phone,
        'email'        => $email,
        'location'     => $location,
        'booking_date' => $bDate,
        'booking_time' => $bTime,
        'guests'       => $guests,
        'message'      => $message,
        'extra'        => $extra ? json_encode($extra, JSON_UNESCAPED_UNICODE) : '',
    ], JSON_UNESCAPED_UNICODE);
    $ch = curl_init($cfg['google_sheet']['webhook_url']);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
        CURLOPT_TIMEOUT        => 8,
    ]);
    curl_exec($ch);
    curl_close($ch);
}

/* ---------- Final response ---------- */
if (!$saved && !$mailOk) {
    kc_respond(500, [
        'ok'      => false,
        'message' => 'Sorry, we could not process your request. Please call us directly.',
    ]);
}

kc_respond(200, [
    'ok'      => true,
    'message' => 'Your reservation has been saved successfully. Our team will call you shortly to confirm your booking.',
    'saved'   => $saved,
    'mailed'  => $mailOk,
]);
