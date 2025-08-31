//controllers\authController.js
import connection from '../models/db.js';
import bcrypt from 'bcrypt';

// login function
export const login = (req, res) => {
    const { username, password } = req.body;

    const sql = 'SELECT * FROM admins WHERE username = ?';
    connection.query(sql, [username], async (err, results) => {
        if (err) {
            console.error('❌ ข้อผิดพลาดในการดึงข้อมูล:', err);
            return res.status(500).send('เกิดข้อผิดพลาดในระบบ');
        }

        if (results.length === 0) {
            return res.render('homeLogin', { errorMessage: 'ไม่พบชื่อผู้ใช้' });
        }

        const user = results[0];
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (passwordMatch) {
            // ข้อมูลไฟล์ตัวอย่าง
            const files = [
                {
                    name: 'ตัวอย่างไฟล์ A.xlsx',
                    description: 'ไฟล์ตัวอย่าง A',
                    size: '1.2 MB',
                    downloadLink: '#', // ลิงก์ที่ไม่จริง
                },
                {
                    name: 'ตัวอย่างไฟล์ B.xlsx',
                    description: 'ไฟล์ตัวอย่าง B',
                    size: '500 KB',
                    downloadLink: '#', // ลิงก์ที่ไม่จริง
                }
            ];

            return res.render('homeLogin', { successMessage: 'เข้าสู่ระบบสำเร็จ!', files });
        } else {
            return res.render('homeLogin', { errorMessage: 'รหัสผ่านไม่ถูกต้อง' });
        }
    });
};

// addAdmin function
export const addAdmin = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = 'INSERT INTO admins (username, password_hash, email) VALUES (?, ?, ?)';
        connection.query(sql, [username, hashedPassword, email || null], (err, result) => {
            if (err) {
                console.error('❌ เพิ่มผู้ดูแลล้มเหลว:', err);
                return res.status(500).send('เกิดข้อผิดพลาด');
            }

            // เมื่อเพิ่มผู้ดูแลสำเร็จ
            res.render('homeLogin', { successMessage: 'เพิ่มผู้ดูแลสำเร็จ' });
        });
    } catch (error) {
        console.error('❌ bcrypt error:', error);
        res.status(500).send('เกิดข้อผิดพลาดในการเข้ารหัสรหัสผ่าน');
    }
};
