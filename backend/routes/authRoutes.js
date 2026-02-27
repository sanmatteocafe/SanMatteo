const express = require('express');
const router = express.Router();

// POST login (demo mode)
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (email === 'admin@cafe.com' && password === 'admin123') {
        res.json({ success: true, token: 'demo-token', user: { email, role: 'admin' } });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

module.exports = router;
