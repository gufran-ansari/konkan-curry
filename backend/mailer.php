<?php
/**
 * Email sending via PHPMailer (SMTP) + a clean HTML email template.
 */

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/lib/PHPMailer/Exception.php';
require_once __DIR__ . '/lib/PHPMailer/PHPMailer.php';
require_once __DIR__ . '/lib/PHPMailer/SMTP.php';

/**
 * Build a branded HTML email body from the booking fields.
 */
function kc_build_email_html(string $formName, array $fields, string $logoUrl = ''): string
{
    $rows = '';
    foreach ($fields as $label => $value) {
        if ($value === null || $value === '') {
            continue;
        }
        $label = htmlspecialchars((string)$label, ENT_QUOTES, 'UTF-8');
        $value = nl2br(htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8'));
        $rows .= "
            <tr>
                <td style='padding:10px 16px;border-bottom:1px solid #eee;font-weight:600;color:#8a5a1e;width:38%;vertical-align:top;'>{$label}</td>
                <td style='padding:10px 16px;border-bottom:1px solid #eee;color:#222;'>{$value}</td>
            </tr>";
    }

    $formName = htmlspecialchars($formName, ENT_QUOTES, 'UTF-8');
    $when = date('d M Y, h:i A');

    // Logo cell only renders when a public URL is configured.
    $logoCell = '';
    if (trim($logoUrl) !== '') {
        $logoUrlSafe = htmlspecialchars($logoUrl, ENT_QUOTES, 'UTF-8');
        $logoCell = "
            <td style='vertical-align:middle;text-align:right;width:150px;'>
                <img src='{$logoUrlSafe}' alt='Konkan Curry' width='140' style='display:inline-block;max-width:140px;height:auto;'>
            </td>";
    }

    return "
    <!DOCTYPE html>
    <html>
    <body style='margin:0;padding:0;background:#f4f1ec;font-family:Arial,Helvetica,sans-serif;'>
        <table role='presentation' width='100%' cellpadding='0' cellspacing='0' style='background:#f4f1ec;padding:24px 0;'>
            <tr><td align='center'>
                <table role='presentation' width='600' cellpadding='0' cellspacing='0' style='background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 18px rgba(0,0,0,0.06);'>
                    <tr>
                        <td style='background:#7a3e12;padding:24px 32px;'>
                            <table role='presentation' width='100%' cellpadding='0' cellspacing='0'>
                                <tr>
                                    <td style='vertical-align:middle;'>
                                        <h1 style='margin:0;color:#fff;font-size:22px;letter-spacing:0.5px;'>Konkan Curry</h1>
                                        <p style='margin:6px 0 0;color:#f0d9c2;font-size:14px;'>New enquiry from the website</p>
                                    </td>
                                    {$logoCell}
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style='padding:24px 32px 8px;'>
                            <p style='margin:0 0 4px;color:#333;font-size:15px;'>You received a new <strong>{$formName}</strong> submission.</p>
                            <p style='margin:0 0 16px;color:#999;font-size:12px;'>Received on {$when}</p>
                            <table role='presentation' width='100%' cellpadding='0' cellspacing='0' style='border:1px solid #eee;border-radius:8px;overflow:hidden;'>
                                {$rows}
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style='padding:18px 32px 28px;'>
                            <p style='margin:0;color:#aaa;font-size:12px;'>This is an automated message from the Konkan Curry website booking system.</p>
                        </td>
                    </tr>
                </table>
            </td></tr>
        </table>
    </body>
    </html>";
}

/**
 * Send the booking email. Returns [bool success, string error].
 */
function kc_send_mail(array $cfg, string $formName, array $fields, ?string $replyTo = null): array
{
    $s = $cfg['smtp'];
    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host       = $s['host'];
        $mail->SMTPAuth   = true;
        $mail->Username   = $s['username'];
        $mail->Password   = $s['password'];
        $mail->Port       = (int)$s['port'];
        $mail->CharSet    = 'UTF-8';

        if ($s['encryption'] === 'ssl') {
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        } else {
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        }

        $mail->setFrom($s['from_email'], $s['from_name']);
        $mail->addAddress($s['to_email'], $s['to_name']);

        if ($replyTo && filter_var($replyTo, FILTER_VALIDATE_EMAIL)) {
            $mail->addReplyTo($replyTo);
        }

        $mail->isHTML(true);
        $mail->Subject = 'New ' . ucfirst($formName) . ' — Konkan Curry';
        $mail->Body    = kc_build_email_html($formName, $fields, $s['logo_url'] ?? '');
        $mail->AltBody = kc_build_email_plain($formName, $fields);

        $mail->send();
        return [true, ''];
    } catch (Exception $e) {
        return [false, $mail->ErrorInfo ?: $e->getMessage()];
    }
}

function kc_build_email_plain(string $formName, array $fields): string
{
    $lines = ["New {$formName} submission — Konkan Curry", str_repeat('-', 40)];
    foreach ($fields as $label => $value) {
        if ($value === null || $value === '') {
            continue;
        }
        $lines[] = "{$label}: {$value}";
    }
    return implode("\n", $lines);
}
