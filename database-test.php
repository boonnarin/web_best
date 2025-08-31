<?php
$host = "localhost";     // ชื่อ host เช่น localhost หรือ IP
$user = "whocvd_savedata";   // ชื่อ user ของ database
$pass = "P4t~t000s";   // รหัสผ่าน
$db   = "whocvd_webdata";       // ชื่อ database

// สร้างการเชื่อมต่อ
$conn = new mysqli($host, $user, $pass, $db);

// ตรวจสอบการเชื่อมต่อ
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} else {
    echo "Connected successfully to database: " . $db;
}

// ปิดการเชื่อมต่อ
$conn->close();
?>
