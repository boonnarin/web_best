import express from 'express';
import { requireLogin } from '../middleware/authMiddleware.js';
import { login, addAdmin } from '../controllers/authController.js';

const router = express.Router();

// เปลี่ยนจาก app.get() เป็น router.get()
router.get('/admin/homeLogin', requireLogin, (req, res) => {
    res.render('homeLogin');  // เรนเดอร์หน้า EJS (แทนการใช้ sendFile)
});

router.post('/admin/login', login);
router.post('/admin/add', addAdmin); // ← เพิ่มบรรทัดนี้


// เพิ่ม route สำหรับ logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('ไม่สามารถออกจากระบบได้');
        }

        res.sendFile('login.html', { root: 'public' });
    });
});
export default router;
