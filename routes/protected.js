const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();

function verifyToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Protected route for all logged-in users
router.get('/dashboard', verifyToken, async (req, res) => {
  res.json({ message: `Welcome ${req.user.email}`, user: req.user });
});

// Admin-only route
router.get('/sales', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
  const sales = await db.query('SELECT * FROM sales ORDER BY id DESC');
  res.json({ sales: sales.rows });
});

module.exports = router;
