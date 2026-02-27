const express = require('express');
const router = express.Router();

let orders = [];

// GET all orders
router.get('/', (req, res) => {
    res.json(orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

// POST new order
router.post('/', (req, res) => {
    const order = {
        id: 'ORD-' + Date.now().toString(36).toUpperCase(),
        ...req.body,
        status: 'pending',
        createdAt: new Date().toISOString(),
    };
    orders.push(order);
    res.status(201).json(order);
});

// PATCH update order status
router.patch('/:id', (req, res) => {
    const idx = orders.findIndex(o => o.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Order not found' });
    orders[idx] = { ...orders[idx], ...req.body };
    res.json(orders[idx]);
});

module.exports = router;
