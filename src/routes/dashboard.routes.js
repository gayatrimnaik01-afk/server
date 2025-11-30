const express = require('express');
const router = express.Router();
const { getEmployeeStats, getManagerStats } = require('../controllers/dashboard.controller');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');

// Employee dashboard
router.get('/employee', authMiddleware, getEmployeeStats);

// Manager dashboard
router.get('/manager', authMiddleware, requireRole('MANAGER'), getManagerStats);

module.exports = router;
