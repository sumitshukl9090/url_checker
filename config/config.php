<?php
// Database connection
$dsn = "mysql:host=208.122.192.70;dbname=dmcaf;charset=utf8mb4";
$username = "dmca_admin";
$password = "DogfFQoSi8EVjIN";

try {
    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}
?>
