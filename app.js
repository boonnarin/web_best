import chalk from 'chalk';
import express from 'express';
import bodyParser from 'body-parser'; // ← 
import session from 'express-session';
import path from 'path';
import fs from 'fs';
import connection from './models/db.js';

import authRoutes from './routes/authRoutes.js';
import { fileURLToPath } from 'url';

// ใช้ import.meta.url เพื่อกำหนด __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ตั้งค่าการใช้ EJS
app.set('view engine', 'ejs');

// ตั้งค่าพาธที่เก็บไฟล์ view
app.set('views', path.join(__dirname, 'views'));



// ตั้งค่า body-parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware
//กำหนดsession
app.use(session({
    secret: 'session_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // set secure: true หากใช้ HTTPS
}));

// Static files
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
// ตั้งค่า express.static เพื่อให้บริการไฟล์จากโฟลเดอร์ public
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1d'  // ตั้งเวลาแคชไฟล์เป็น 1 วัน
}));

// Router
app.use(authRoutes);

// Visit counter
app.get('/visit', (req, res) => {
    const pageName = req.query.page || 'default';
    const filename = `visit-${pageName}.json`;
    const filepath = path.join(__dirname, filename);

    let current = 0;
    try {
        const data = fs.readFileSync(filepath, 'utf8');
        const json = JSON.parse(data);
        current = json.totalVisits || 0;
    } catch (err) {
        current = 0;
    }
    // เพิ่มจำนวน
    const updated = current + 1;
    fs.writeFileSync(filepath, JSON.stringify({ totalVisits: updated }));

    res.json({ totalVisits: updated });
});

// API สำหรับดึงข้อมูลจังหวัด
app.get('/api/provinces', (req, res) => {
    connection.query('SELECT ProvinceName FROM province ORDER BY ProvinceName ASC', (err, results) => {
        if (err) {
            console.error('❌ Error fetching data:', err);
            return res.status(500).send('Database error');
        }
        res.json(results); // ส่งข้อมูลเป็น JSON
    });
});

// API สำหรับดึงข้อมูล
app.get('/api/country', (req, res) => {
    connection.query('SELECT countryID, countryName, alpha2_code FROM country', (err, results) => {
        if (err) {
            console.error('❌ Error fetching data:', err);
            return res.status(500).send('Database error');
        }
        res.json(results); // ส่งข้อมูลเป็น JSON
    });
});


// เส้นทาง API สำหรับเก็บข้อมูลจากฟอร์ม
app.post('/api/save-form', (req, res) => {
    const { sex, age, smoking_status, diabetes_status, sbp1, sbp2, sbptotal, total_cholesterol, province } = req.body;

    const sql = `INSERT INTO form_lab (sex, age, smoking_status, diabetes_status, sbp1, sbp2, sbptotal, total_cholesterol, province) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    connection.query(sql, [sex, age, smoking_status, diabetes_status, sbp1, sbp2, sbptotal, total_cholesterol, province], (err, result) => {
        if (err) {
            console.error('❌ Error inserting data into DB:', err);
            return res.status(500).send('Error saving data');
        }
        res.send({ result: 'Data saved successfully' });
    });
});


// เส้นทาง API สำหรับเก็บข้อมูลจากฟอร์ม
app.post('/api/save-formnonlab', (req, res) => {
    const { sex, age, smoking_status, sbp1, sbp2, sbptotal, weight, height, province } = req.body;

    const sql = `INSERT INTO form_nonlab (sex, age, smoking_status, sbp1, sbp2, sbptotal, weight, height, province) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    connection.query(sql, [sex, age, smoking_status, sbp1, sbp2, sbptotal, weight, height, province], (err, result) => {
        if (err) {
            console.error('❌ Error inserting data into DB:', err);
            return res.status(500).send('Error saving data');
        }
        res.send({ result: 'Data saved successfully' });
    });
});


// เส้นทางสำหรับทดสอบการเชื่อมต่อฐานข้อมูล
app.get('/test-db', async (req, res) => {
    try {
        // ใช้ promise() ของ mysql2 เพื่อเชื่อมต่อและ query
        const [rows, fields] = await connection.promise().query('SELECT 1');

        // หากการเชื่อมต่อสำเร็จ
        res.send(' Database connected');
    } catch (err) {
        // หากเกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล
        console.error('Database connection failed:', err);
        res.status(500).send('Database connection failed');
    }
});


// Start server
const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log("Listening on port " + chalk.green(port));
});
