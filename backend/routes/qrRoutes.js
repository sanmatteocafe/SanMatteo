const express = require('express');
const router = express.Router();

// GET /api/qrcodes - Get all QR codes
router.get('/', async (req, res) => {
    try {
        res.json({ message: 'Get all QR codes' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/qrcodes - Save/create QR code for a table
router.post('/', async (req, res) => {
    try {
        const { tableNumber, qrUrl } = req.body;
        const qrCode = {
            tableNumber,
            qrUrl,
            createdAt: new Date().toISOString(),
        };
        res.status(201).json({ message: 'QR code saved', qrCode });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
