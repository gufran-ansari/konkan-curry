<?php
/**
 * Database connection + auto-provisioning.
 * Creates the database and `bookings` table automatically if they don't exist,
 * so no manual SQL import is needed for local testing.
 */

function kc_db(array $cfg): PDO
{
    $d = $cfg['db'];

    // 1) Connect to the server (no DB selected) and ensure the database exists.
    $serverDsn = "mysql:host={$d['host']};port={$d['port']};charset={$d['charset']}";
    $server = new PDO($serverDsn, $d['user'], $d['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);
    $server->exec(
        "CREATE DATABASE IF NOT EXISTS `{$d['name']}`
         CHARACTER SET {$d['charset']} COLLATE {$d['charset']}_unicode_ci"
    );

    // 2) Connect to the actual database.
    $dsn = "mysql:host={$d['host']};port={$d['port']};dbname={$d['name']};charset={$d['charset']}";
    $pdo = new PDO($dsn, $d['user'], $d['pass'], [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);

    // 3) Ensure the bookings table exists.
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS bookings (
            id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            form_name     VARCHAR(100)  NOT NULL DEFAULT 'reservation',
            full_name     VARCHAR(150)  NOT NULL,
            email         VARCHAR(190)  NULL,
            phone         VARCHAR(40)   NULL,
            location      VARCHAR(100)  NULL,
            booking_date  VARCHAR(40)   NULL,
            booking_time  VARCHAR(40)   NULL,
            guests        VARCHAR(20)   NULL,
            message       TEXT          NULL,
            extra         JSON          NULL,
            page_url      VARCHAR(255)  NULL,
            ip_address    VARCHAR(45)   NULL,
            user_agent    VARCHAR(255)  NULL,
            created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    return $pdo;
}
