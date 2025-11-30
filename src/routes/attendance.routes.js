const express = require('express');
const router = express.Router();
const {
    checkIn,
    checkOut,
    getMyHistory,
    getMySummary,
    getTodayStatus,
    getMySalary,
    getAllAttendance,
    getEmployeeAttendance,
    getTeamSummary,
    exportAttendance,
    getDailyStatus,
    getTeamCalendar,
} = require('../controllers/attendance.controller');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');

// Employee routes
router.post('/checkin', authMiddleware, checkIn);
router.post('/checkout', authMiddleware, checkOut);
router.get('/history', authMiddleware, getMyHistory);
router.get('/my-summary', authMiddleware, getMySummary);
router.get('/today', authMiddleware, getTodayStatus);
router.get('/salary', authMiddleware, getMySalary);

// Manager routes
router.get('/all', authMiddleware, requireRole('MANAGER'), getAllAttendance);
router.get('/employee/:id', authMiddleware, requireRole('MANAGER'), getEmployeeAttendance);
router.get('/summary', authMiddleware, requireRole('MANAGER'), getTeamSummary);
router.get('/export', authMiddleware, requireRole('MANAGER'), exportAttendance);
router.get('/daily-status', authMiddleware, requireRole('MANAGER'), getDailyStatus);
router.get('/team-calendar', authMiddleware, requireRole('MANAGER'), getTeamCalendar);

module.exports = router;
