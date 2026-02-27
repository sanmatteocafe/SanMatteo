const express = require('express');
const router = express.Router();

// In-memory store (replace with Firebase Admin SDK in production)
let menuItems = [
    { id: '1', name: 'Cappuccino', price: 180, category: 'Coffee', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop', description: 'Rich espresso with steamed milk foam' },
    { id: '2', name: 'Espresso', price: 150, category: 'Coffee', image: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400&h=300&fit=crop', description: 'Strong double shot espresso' },
    { id: '3', name: 'Margherita Pizza', price: 350, category: 'Pizza', image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=400&h=300&fit=crop', description: 'Classic tomato, mozzarella & basil' },
    { id: '4', name: 'Avocado Toast', price: 280, category: 'Breakfast', image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=300&fit=crop', description: 'Sourdough, smashed avocado, poached egg' },
    { id: '5', name: 'Chocolate Cake', price: 250, category: 'Desserts', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop', description: 'Triple layered Belgian chocolate' },
    { id: '6', name: 'Berry Smoothie', price: 200, category: 'Drinks', image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop', description: 'Mixed berries with yogurt & honey' },
];

// GET all menu items
router.get('/', (req, res) => {
    res.json(menuItems);
});

// POST new menu item
router.post('/', (req, res) => {
    const item = { id: Date.now().toString(), ...req.body, createdAt: new Date().toISOString() };
    menuItems.push(item);
    res.status(201).json(item);
});

// PUT update menu item
router.put('/:id', (req, res) => {
    const idx = menuItems.findIndex(i => i.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Item not found' });
    menuItems[idx] = { ...menuItems[idx], ...req.body };
    res.json(menuItems[idx]);
});

// DELETE menu item
router.delete('/:id', (req, res) => {
    menuItems = menuItems.filter(i => i.id !== req.params.id);
    res.json({ success: true });
});

module.exports = router;
