const express = require('express');
const router = express.Router();

let categories = [
    { id: '1', name: 'Coffee' },
    { id: '2', name: 'Pizza' },
    { id: '3', name: 'Breakfast' },
    { id: '4', name: 'Desserts' },
    { id: '5', name: 'Drinks' },
    { id: '6', name: 'Salads' },
];

// GET all categories
router.get('/', (req, res) => {
    res.json(categories);
});

// POST new category
router.post('/', (req, res) => {
    const cat = { id: Date.now().toString(), name: req.body.name, createdAt: new Date().toISOString() };
    categories.push(cat);
    res.status(201).json(cat);
});

// DELETE category
router.delete('/:id', (req, res) => {
    categories = categories.filter(c => c.id !== req.params.id);
    res.json({ success: true });
});

module.exports = router;
