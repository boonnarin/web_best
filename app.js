import chalk from 'chalk';
import express from 'express';
import path from 'path';
import fs from 'fs';
import './models/db.js';
import formRoutes from './routes/formRoutes.js';  // ✅ ต้องใช้ .js ถ้าใช้ ES module
import { fileURLToPath } from 'url';
const app = express();

// ใช้ __dirname ใน ES module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.use(express.static(path.join(__dirname, 'public')));

// Router
app.use('/', formRoutes);

// Visit counter
app.get('/visit', (req, res) => {
    const pageName = req.query.page || 'default';
    const filename = `visit-${pageName}.json`; // แก้ชื่อไฟล์ด้วย
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


// Start server
const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log("Listening on port " + chalk.green(port));
});