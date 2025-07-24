// routes/formRoutes.js
import express from 'express';
const router = express.Router();

router.post('/', (req, res) => {
    res.send('Form submitted!');
});

export default router;
