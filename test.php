<?php
// ===== เชื่อมต่อฐานข้อมูล =====
$host = "localhost";
$user = "whocvd_savedata";
$pass = "P4t~t000s";
$db   = "whocvd_webdata";

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die(" Connection failed: " . $conn->connect_error);
}

$conn->set_charset("utf8");

// ===== ดึงข้อมูลจังหวัด =====
$province_sql = "SELECT ProvinceName FROM province ORDER BY ProvinceName ASC";
$province_result = $conn->query($province_sql);

// ===== ดึงข้อมูลประเทศ =====
$country_sql = "SELECT countryID, countryName, alpha2_code FROM country ORDER BY countryName ASC";
$country_result = $conn->query($country_sql);
if (!$province_result) {
    die("Province query failed: " . $conn->error);
}
if (!$country_result) {
    die("Country query failed: " . $conn->error);
}
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lab Form</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="css/styles.css">
</head>
<body class="bg-white text-dark">
    <div class="container my-5">
        <form method="POST" action="save_form.php" class="p-4 border rounded-3 shadow-sm bg-light">
            <h2 class="mb-3"><strong>การประเมินความเสี่ยงโรคหัวใจและหลอดเลือดแบบใช้ผลการตรวจเลือด</strong></h2>
            <h3 class="mb-4">Laboratory-based predicted 10-year CVD Risk</h3>

            <!-- จังหวัด -->
            <div class="form-group mb-3">
                <label for="province">จังหวัดที่อยู่ (Province)</label>
                <select id="province" name="province" class="form-control">
                    <option value="">-- กรุณาเลือกจังหวัด --</option>
                    <?php while ($row = $province_result->fetch_assoc()): ?>
                        <option value="<?= htmlspecialchars($row['ProvinceName']) ?>">
                            <?= htmlspecialchars($row['ProvinceName']) ?>
                        </option>
                    <?php endwhile; ?>
                </select>
            </div>

            <!-- ประเทศ -->
            <div class="form-group mb-3">
                <label for="country">Country:</label>
                <select id="country" name="country" class="form-control" required>
                    <option value="">-- กรุณาเลือกประเทศ --</option>
                    <?php while ($row = $country_result->fetch_assoc()): ?>
                        <option value="<?= $row['countryID'] ?>">
                            <?= htmlspecialchars($row['countryName']) ?> (<?= htmlspecialchars($row['alpha2_code']) ?>)
                        </option>
                    <?php endwhile; ?>
                </select>
            </div>

            <!-- ปุ่มบันทึก -->
            <div>
                <button type="submit" class="btn btn-success">บันทึกข้อมูล</button>
            </div>
        </form>
    </div>
</body>
</html>
<?php $conn->close(); ?>

