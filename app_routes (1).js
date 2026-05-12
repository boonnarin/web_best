// ============================================================
// CVD Risk Assessment API
// รองรับ schema ใหม่: location (province/country) + ผลประเมิน
// ============================================================

// ============================================================
// Helper: คำนวณ status_code จาก risk_percent
// ============================================================
function getRiskStatus(riskPercent) {
    const pct = Number(riskPercent);
    if (!Number.isFinite(pct)) {
        return {
            status_code: null,
            status_label_th: null,
            status_label_en: null,
            risk_color: null
        };
    }

    if (pct < 5) {
        return {
            status_code: 'very_low',
            status_label_th: 'เสี่ยงน้อยมาก',
            status_label_en: 'Very Low',
            risk_color: '#15803d'
        };
    } else if (pct < 10) {
        return {
            status_code: 'low',
            status_label_th: 'เสี่ยงน้อย',
            status_label_en: 'Low',
            risk_color: '#65a30d'
        };
    } else if (pct < 20) {
        return {
            status_code: 'moderate',
            status_label_th: 'เสี่ยงปานกลาง',
            status_label_en: 'Moderate',
            risk_color: '#d97706'
        };
    } else if (pct < 30) {
        return {
            status_code: 'high',
            status_label_th: 'เสี่ยงสูง',
            status_label_en: 'High',
            risk_color: '#c2410c'
        };
    } else {
        return {
            status_code: 'very_high',
            status_label_th: 'เสี่ยงสูงมาก',
            status_label_en: 'Very High',
            risk_color: '#991b1b'
        };
    }
}

// ============================================================
// Helper: เตรียมข้อมูล location จาก request body
// รองรับทั้งกรณีส่ง ProvinceID/countryID มาตรง ๆ
// หรือส่งแค่ province (ชื่อ) แล้วค่อย lookup
// ============================================================
async function resolveLocation(body, connection) {
    const {
        location_type,
        ProvinceID,
        ProvinceName,
        RegionID,
        countryID,
        countryName,
        province  // legacy field (ชื่อจังหวัดหรือประเทศ)
    } = body;

    // ===== กรณีที่ 1: client ส่ง location_type + ID มาแล้ว =====
    if (location_type === 'province' && ProvinceID) {
        return {
            location_type: 'province',
            ProvinceID,
            ProvinceName: ProvinceName || null,
            RegionID: RegionID || null,
            countryID: null,
            countryName: null,
            province: ProvinceName || province || ''
        };
    }

    if (location_type === 'country' && countryID) {
        return {
            location_type: 'country',
            ProvinceID: null,
            ProvinceName: null,
            RegionID: null,
            countryID,
            countryName: countryName || null,
            province: countryName || province || ''
        };
    }

    // ===== กรณีที่ 2: client ส่งแค่ province (ชื่อ) → ต้อง lookup =====
    if (!province) {
        throw new Error('โปรดระบุที่อยู่ (province หรือ country)');
    }

    // ลองค้นจากตาราง province ก่อน
    const provinceRow = await new Promise((resolve, reject) => {
        connection.query(
            'SELECT ProvinceID, ProvinceName, RegionID FROM province WHERE ProvinceName = ? LIMIT 1',
            [province],
            (err, results) => {
                if (err) return reject(err);
                resolve(results[0] || null);
            }
        );
    });

    if (provinceRow) {
        return {
            location_type: 'province',
            ProvinceID: provinceRow.ProvinceID,
            ProvinceName: provinceRow.ProvinceName,
            RegionID: provinceRow.RegionID,
            countryID: null,
            countryName: null,
            province: provinceRow.ProvinceName
        };
    }

    // ไม่เจอใน province → ลอง country
    const countryRow = await new Promise((resolve, reject) => {
        connection.query(
            'SELECT countryID, countryName FROM country WHERE countryName = ? LIMIT 1',
            [province],
            (err, results) => {
                if (err) return reject(err);
                resolve(results[0] || null);
            }
        );
    });

    if (countryRow) {
        return {
            location_type: 'country',
            ProvinceID: null,
            ProvinceName: null,
            RegionID: null,
            countryID: countryRow.countryID,
            countryName: countryRow.countryName,
            province: countryRow.countryName
        };
    }

    throw new Error(`ไม่พบจังหวัดหรือประเทศ: "${province}"`);
}

// ============================================================
// API: เก็บข้อมูลฟอร์ม Lab
// ============================================================
app.post('/api/save-form', async (req, res) => {
    try {
        const {
            name, lastname,
            sex, age, smoking_status, diabetes_status,
            sbp1, sbp2, sbptotal, total_cholesterol,
            risk_percent
        } = req.body;

        // เตรียมข้อมูล location
        const loc = await resolveLocation(req.body, connection);

        // คำนวณ status จาก risk_percent
        const status = getRiskStatus(risk_percent);

        const sql = `
            INSERT INTO form_lab 
                (name, lastname, sex, age, smoking_status, diabetes_status,
                 sbp1, sbp2, sbptotal, total_cholesterol,
                 location_type, ProvinceID, ProvinceName, RegionID, countryID, countryName, province,
                 risk_percent, status_code, status_label_th, status_label_en, risk_color, assessed_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            name || null, lastname || null,
            sex, age, smoking_status, diabetes_status,
            sbp1, sbp2, sbptotal, total_cholesterol,
            loc.location_type, loc.ProvinceID, loc.ProvinceName, loc.RegionID,
            loc.countryID, loc.countryName, loc.province,
            risk_percent || null,
            status.status_code,
            status.status_label_th,
            status.status_label_en,
            status.risk_color,
            risk_percent != null ? new Date() : null
        ];

        connection.query(sql, values, (err, result) => {
            if (err) {
                console.error('❌ Error inserting form_lab:', err);
                return res.status(500).json({ error: 'Error saving data', detail: err.message });
            }
            res.json({
                result: 'Data saved successfully',
                id: result.insertId,
                status: status
            });
        });
    } catch (err) {
        console.error('❌ Error in /api/save-form:', err);
        res.status(400).json({ error: err.message });
    }
});

// ============================================================
// API: เก็บข้อมูลฟอร์ม Non-Lab
// ============================================================
app.post('/api/save-formnonlab', async (req, res) => {
    try {
        const {
            name, lastname,
            sex, age, smoking_status,
            sbp1, sbp2, sbptotal,
            weight, height,
            risk_percent
        } = req.body;

        // เตรียมข้อมูล location
        const loc = await resolveLocation(req.body, connection);

        // คำนวณ status จาก risk_percent
        const status = getRiskStatus(risk_percent);

        const sql = `
            INSERT INTO form_nonlab 
                (name, lastname, sex, age, smoking_status,
                 sbp1, sbp2, sbptotal, weight, height,
                 location_type, ProvinceID, ProvinceName, RegionID, countryID, countryName, province,
                 risk_percent, status_code, status_label_th, status_label_en, risk_color, assessed_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            name || null, lastname || null,
            sex, age, smoking_status,
            sbp1, sbp2, sbptotal, weight, height,
            loc.location_type, loc.ProvinceID, loc.ProvinceName, loc.RegionID,
            loc.countryID, loc.countryName, loc.province,
            risk_percent || null,
            status.status_code,
            status.status_label_th,
            status.status_label_en,
            status.risk_color,
            risk_percent != null ? new Date() : null
        ];

        connection.query(sql, values, (err, result) => {
            if (err) {
                console.error('❌ Error inserting form_nonlab:', err);
                return res.status(500).json({ error: 'Error saving data', detail: err.message });
            }
            res.json({
                result: 'Data saved successfully',
                id: result.insertId,
                status: status
            });
        });
    } catch (err) {
        console.error('❌ Error in /api/save-formnonlab:', err);
        res.status(400).json({ error: err.message });
    }
});

// ============================================================
// API: อัปเดตผลการประเมินภายหลัง (ถ้าต้องการบันทึกผลแยกจากฟอร์ม)
// ============================================================
app.post('/api/update-risk', (req, res) => {
    const { id, table, risk_percent } = req.body;

    if (!id || !table || risk_percent == null) {
        return res.status(400).json({ error: 'โปรดระบุ id, table, risk_percent' });
    }

    if (!['form_lab', 'form_nonlab'].includes(table)) {
        return res.status(400).json({ error: 'table ต้องเป็น form_lab หรือ form_nonlab' });
    }

    const status = getRiskStatus(risk_percent);

    const sql = `
        UPDATE \`${table}\` 
        SET risk_percent = ?, status_code = ?, status_label_th = ?, status_label_en = ?, risk_color = ?, assessed_at = NOW()
        WHERE id = ?
    `;

    const values = [
        risk_percent,
        status.status_code,
        status.status_label_th,
        status.status_label_en,
        status.risk_color,
        id
    ];

    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('❌ Error updating risk:', err);
            return res.status(500).json({ error: 'Update failed', detail: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'ไม่พบ record ที่ระบุ' });
        }
        res.json({ result: 'Risk updated', status });
    });
});

// ============================================================
// API: ดึงข้อมูล form_lab (รวมข้อมูลที่อยู่ + ผลประเมิน)
// ============================================================
app.get('/api/getFormLabData', (req, res) => {
    const sql = `
        SELECT 
            id, name, lastname,
            sex, age, smoking_status, diabetes_status,
            sbp1, sbp2, sbptotal, total_cholesterol,
            location_type, ProvinceID, ProvinceName, RegionID,
            countryID, countryName, province,
            risk_percent, status_code, status_label_th, status_label_en, risk_color,
            assessed_at, submitted_at
        FROM form_lab
        ORDER BY submitted_at DESC
    `;

    connection.query(sql, (err, results) => {
        if (err) {
            console.error('❌ Error fetching form_lab:', err);
            return res.status(500).json({ error: 'Database error', detail: err.message });
        }
        res.json(results);
    });
});

// ============================================================
// API: ดึงข้อมูล form_nonlab
// ============================================================
app.get('/api/getFormNonLabData', (req, res) => {
    const sql = `
        SELECT 
            id, name, lastname,
            sex, age, smoking_status,
            sbp1, sbp2, sbptotal, weight, height,
            location_type, ProvinceID, ProvinceName, RegionID,
            countryID, countryName, province,
            risk_percent, status_code, status_label_th, status_label_en, risk_color,
            assessed_at, submitted_at
        FROM form_nonlab
        ORDER BY submitted_at DESC
    `;

    connection.query(sql, (err, results) => {
        if (err) {
            console.error('❌ Error fetching form_nonlab:', err);
            return res.status(500).json({ error: 'Database error', detail: err.message });
        }
        res.json(results);
    });
});

// ============================================================
// API: ดึงรายชื่อจังหวัด (สำหรับ dropdown)
// ============================================================
app.get('/api/provinces', (req, res) => {
    const sql = `
        SELECT 
            p.ProvinceID, 
            p.ProvinceName, 
            p.RegionID, 
            r.RegionName 
        FROM province p
        LEFT JOIN region r ON r.RegionID = p.RegionID
        ORDER BY p.ProvinceName ASC
    `;

    connection.query(sql, (err, results) => {
        if (err) {
            console.error('❌ Error fetching provinces:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

// ============================================================
// API: ดึงรายชื่อประเทศ
// ============================================================
app.get('/api/country', (req, res) => {
    const sql = `
        SELECT countryID, countryName, alpha2_code 
        FROM country
        ORDER BY countryName ASC
    `;

    connection.query(sql, (err, results) => {
        if (err) {
            console.error('❌ Error fetching countries:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

// ============================================================
// API: สถิติสำหรับ Dashboard (Optional - ใช้เมื่อต้องการ)
// ============================================================
app.get('/api/stats/risk-distribution', (req, res) => {
    const { table = 'form_lab' } = req.query;

    if (!['form_lab', 'form_nonlab'].includes(table)) {
        return res.status(400).json({ error: 'table ต้องเป็น form_lab หรือ form_nonlab' });
    }

    const sql = `
        SELECT 
            status_code,
            status_label_th,
            status_label_en,
            risk_color,
            COUNT(*) AS count
        FROM \`${table}\`
        WHERE status_code IS NOT NULL
        GROUP BY status_code, status_label_th, status_label_en, risk_color
        ORDER BY FIELD(status_code, 'very_low', 'low', 'moderate', 'high', 'very_high')
    `;

    connection.query(sql, (err, results) => {
        if (err) {
            console.error('❌ Error fetching stats:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

// ============================================================
// API: สถิติตามจังหวัด
// ============================================================
app.get('/api/stats/by-province', (req, res) => {
    const { table = 'form_lab' } = req.query;

    if (!['form_lab', 'form_nonlab'].includes(table)) {
        return res.status(400).json({ error: 'table ต้องเป็น form_lab หรือ form_nonlab' });
    }

    const sql = `
        SELECT 
            f.ProvinceID,
            f.ProvinceName,
            r.RegionName,
            COUNT(*) AS total,
            AVG(f.risk_percent) AS avg_risk,
            SUM(CASE WHEN f.status_code = 'high' OR f.status_code = 'very_high' THEN 1 ELSE 0 END) AS high_risk_count
        FROM \`${table}\` f
        LEFT JOIN region r ON r.RegionID = f.RegionID
        WHERE f.location_type = 'province' AND f.ProvinceID IS NOT NULL
        GROUP BY f.ProvinceID, f.ProvinceName, r.RegionName
        ORDER BY total DESC
    `;

    connection.query(sql, (err, results) => {
        if (err) {
            console.error('❌ Error fetching province stats:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});
