const express = require('express');
const router = express.Router();

// GET /api/billing/:id - Get bill by order ID
router.get('/:id', async (req, res) => {
    try {
        // This would use Firebase Admin SDK in production
        res.json({ message: 'Get bill', orderId: req.params.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/billing - Create a new bill
router.post('/', async (req, res) => {
    try {
        const { orderId, tableNumber, items, total, tax, grandTotal } = req.body;
        const bill = {
            orderId,
            tableNumber,
            items,
            total,
            tax,
            grandTotal,
            printed: true,
            printedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
        };
        res.status(201).json({ message: 'Bill created', bill });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
