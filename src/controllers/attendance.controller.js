const { PrismaClient } = require('@prisma/client');
const { startOfMonth, endOfMonth, startOfDay, endOfDay, differenceInHours, parseISO } = require('date-fns');

const prisma = new PrismaClient();

// Check in
const checkIn = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if already checked in today
        const existingAttendance = await prisma.attendance.findUnique({
            where: {
                userId_date: {
                    userId,
                    date: today,
                }
            }
        });

        if (existingAttendance && existingAttendance.checkInTime) {
            return res.status(400).json({ error: 'Already checked in today' });
        }

        const checkInTime = new Date();
        const checkInHour = checkInTime.getHours();

        // Determine status based on check-in time
        let status = 'PRESENT';
        if (checkInHour >= 10) {
            status = 'LATE';
        }

        // Create or update attendance
        const attendance = await prisma.attendance.upsert({
            where: {
                userId_date: {
                    userId,
                    date: today,
                }
            },
            update: {
                checkInTime,
                status,
            },
            create: {
                userId,
                date: today,
                checkInTime,
                status,
            }
        });

        res.json({
            message: 'Checked in successfully',
            attendance,
        });
    } catch (error) {
        console.error('Check in error:', error);
        res.status(500).json({ error: 'Failed to check in' });
    }
};

// Check out
const checkOut = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find today's attendance
        const attendance = await prisma.attendance.findUnique({
            where: {
                userId_date: {
                    userId,
                    date: today,
                }
            }
        });

        if (!attendance || !attendance.checkInTime) {
            return res.status(400).json({ error: 'Please check in first' });
        }

        if (attendance.checkOutTime) {
            return res.status(400).json({ error: 'Already checked out today' });
        }

        const checkOutTime = new Date();
        const totalHours = differenceInHours(checkOutTime, attendance.checkInTime);

        // Determine status based on total hours
        let status = attendance.status;
        if (totalHours < 4) {
            status = 'HALF_DAY';
        }

        // Update attendance
        const updatedAttendance = await prisma.attendance.update({
            where: {
                id: attendance.id,
            },
            data: {
                checkOutTime,
                totalHours,
                status,
            }
        });

        res.json({
            message: 'Checked out successfully',
            attendance: updatedAttendance,
        });
    } catch (error) {
        console.error('Check out error:', error);
        res.status(500).json({ error: 'Failed to check out' });
    }
};

// Get my attendance history
const getMyHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { month, year } = req.query;

        let whereClause = { userId };

        if (month && year) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = endOfMonth(startDate);

            whereClause.date = {
                gte: startDate,
                lte: endDate,
            };
        }

        const attendances = await prisma.attendance.findMany({
            where: whereClause,
            orderBy: {
                date: 'desc',
            }
        });

        res.json({ attendances });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ error: 'Failed to get attendance history' });
    }
};

// Get monthly summary
const getMySummary = async (req, res) => {
    try {
        const userId = req.user.id;
        const { month, year } = req.query;

        const now = new Date();
        const targetMonth = month ? parseInt(month) - 1 : now.getMonth();
        const targetYear = year ? parseInt(year) : now.getFullYear();

        const startDate = new Date(targetYear, targetMonth, 1);
        const endDate = endOfMonth(startDate);

        const attendances = await prisma.attendance.findMany({
            where: {
                userId,
                date: {
                    gte: startDate,
                    lte: endDate,
                }
            }
        });

        const summary = {
            present: attendances.filter(a => a.status === 'PRESENT').length,
            absent: attendances.filter(a => a.status === 'ABSENT').length,
            late: attendances.filter(a => a.status === 'LATE').length,
            halfDay: attendances.filter(a => a.status === 'HALF_DAY').length,
            totalDays: attendances.length,
        };

        res.json({ summary, month: targetMonth + 1, year: targetYear });
    } catch (error) {
        console.error('Get summary error:', error);
        res.status(500).json({ error: 'Failed to get summary' });
    }
};

// Get today's status
const getTodayStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await prisma.attendance.findUnique({
            where: {
                userId_date: {
                    userId,
                    date: today,
                }
            }
        });

        res.json({ attendance });
    } catch (error) {
        console.error('Get today status error:', error);
        res.status(500).json({ error: 'Failed to get today\'s status' });
    }
};

// Get monthly salary
const getMySalary = async (req, res) => {
    try {
        const userId = req.user.id;
        const { month, year } = req.query;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                hourlyRate: true,
                monthlySalary: true,
            }
        });

        const now = new Date();
        const targetMonth = month ? parseInt(month) - 1 : now.getMonth();
        const targetYear = year ? parseInt(year) : now.getFullYear();

        const startDate = new Date(targetYear, targetMonth, 1);
        const endDate = endOfMonth(startDate);

        const attendances = await prisma.attendance.findMany({
            where: {
                userId,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
                status: {
                    in: ['PRESENT', 'LATE'],
                }
            }
        });

        let salary = 0;

        if (user.monthlySalary) {
            // Fixed monthly salary
            const workingDays = attendances.length;
            const totalWorkingDays = 22; // Assuming 22 working days per month
            salary = (parseFloat(user.monthlySalary) / totalWorkingDays) * workingDays;
        } else if (user.hourlyRate) {
            // Hourly rate
            const totalHours = attendances.reduce((sum, a) => sum + (parseFloat(a.totalHours) || 0), 0);
            salary = totalHours * parseFloat(user.hourlyRate);
        }

        res.json({
            salary: salary.toFixed(2),
            month: targetMonth + 1,
            year: targetYear,
            workingDays: attendances.length,
            totalHours: attendances.reduce((sum, a) => sum + (parseFloat(a.totalHours) || 0), 0),
        });
    } catch (error) {
        console.error('Get salary error:', error);
        res.status(500).json({ error: 'Failed to calculate salary' });
    }
};

// Manager: Get all employees attendance
const getAllAttendance = async (req, res) => {
    try {
        const { date, status, employeeId } = req.query;

        let whereClause = {};

        if (date) {
            const targetDate = new Date(date);
            targetDate.setHours(0, 0, 0, 0);
            whereClause.date = targetDate;
        }

        if (status) {
            whereClause.status = status;
        }

        if (employeeId) {
            const user = await prisma.user.findUnique({
                where: { employeeId }
            });
            if (user) {
                whereClause.userId = user.id;
            }
        }

        const attendances = await prisma.attendance.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        employeeId: true,
                        department: true,
                    }
                }
            },
            orderBy: {
                date: 'desc',
            }
        });

        res.json({ attendances });
    } catch (error) {
        console.error('Get all attendance error:', error);
        res.status(500).json({ error: 'Failed to get attendance data' });
    }
};

// Manager: Get specific employee attendance
const getEmployeeAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        const { month, year } = req.query;

        let whereClause = { userId: id };

        if (month && year) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = endOfMonth(startDate);

            whereClause.date = {
                gte: startDate,
                lte: endDate,
            };
        }

        const attendances = await prisma.attendance.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        employeeId: true,
                        department: true,
                    }
                }
            },
            orderBy: {
                date: 'desc',
            }
        });

        res.json({ attendances });
    } catch (error) {
        console.error('Get employee attendance error:', error);
        res.status(500).json({ error: 'Failed to get employee attendance' });
    }
};

// Manager: Get team summary
const getTeamSummary = async (req, res) => {
    try {
        const { month, year } = req.query;

        const now = new Date();
        const targetMonth = month ? parseInt(month) - 1 : now.getMonth();
        const targetYear = year ? parseInt(year) : now.getFullYear();

        const startDate = new Date(targetYear, targetMonth, 1);
        const endDate = endOfMonth(startDate);

        const attendances = await prisma.attendance.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate,
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        employeeId: true,
                        department: true,
                    }
                }
            }
        });

        const summary = {
            totalPresent: attendances.filter(a => a.status === 'PRESENT').length,
            totalAbsent: attendances.filter(a => a.status === 'ABSENT').length,
            totalLate: attendances.filter(a => a.status === 'LATE').length,
            totalHalfDay: attendances.filter(a => a.status === 'HALF_DAY').length,
        };

        res.json({ summary, month: targetMonth + 1, year: targetYear });
    } catch (error) {
        console.error('Get team summary error:', error);
        res.status(500).json({ error: 'Failed to get team summary' });
    }
};

// Manager: Export attendance to CSV
const exportAttendance = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        let whereClause = {};

        if (startDate && endDate) {
            whereClause.date = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }

        const attendances = await prisma.attendance.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        name: true,
                        employeeId: true,
                        department: true,
                    }
                }
            },
            orderBy: {
                date: 'desc',
            }
        });

        // Convert to CSV
        const csvHeader = 'Employee ID,Name,Department,Date,Check In,Check Out,Total Hours,Status\n';
        const csvRows = attendances.map(a => {
            return `${a.user.employeeId},${a.user.name},${a.user.department || 'N/A'},${a.date.toISOString().split('T')[0]},${a.checkInTime ? a.checkInTime.toISOString() : 'N/A'},${a.checkOutTime ? a.checkOutTime.toISOString() : 'N/A'},${a.totalHours || 'N/A'},${a.status}`;
        }).join('\n');

        const csv = csvHeader + csvRows;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=attendance-report.csv');
        res.send(csv);
    } catch (error) {
        console.error('Export attendance error:', error);
        res.status(500).json({ error: 'Failed to export attendance' });
    }
};

// Manager: Get who's present today
const getDailyStatus = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendances = await prisma.attendance.findMany({
            where: {
                date: today,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        employeeId: true,
                        department: true,
                    }
                }
            }
        });

        const present = attendances.filter(a => a.checkInTime && a.status !== 'ABSENT');
        const absent = attendances.filter(a => a.status === 'ABSENT' || !a.checkInTime);

        res.json({
            present,
            absent,
            total: attendances.length,
        });
    } catch (error) {
        console.error('Get daily status error:', error);
        res.status(500).json({ error: 'Failed to get daily status' });
    }
};

// Manager: Get team calendar data
const getTeamCalendar = async (req, res) => {
    try {
        const { month, year } = req.query;

        const now = new Date();
        const targetMonth = month ? parseInt(month) - 1 : now.getMonth();
        const targetYear = year ? parseInt(year) : now.getFullYear();

        const startDate = new Date(targetYear, targetMonth, 1);
        const endDate = endOfMonth(startDate);

        const attendances = await prisma.attendance.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate,
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        employeeId: true,
                    }
                }
            },
            orderBy: {
                date: 'asc',
            }
        });

        // Group by date
        const calendarData = {};
        attendances.forEach(a => {
            const dateKey = a.date.toISOString().split('T')[0];
            if (!calendarData[dateKey]) {
                calendarData[dateKey] = [];
            }
            calendarData[dateKey].push({
                userId: a.user.id,
                name: a.user.name,
                employeeId: a.user.employeeId,
                status: a.status,
                checkInTime: a.checkInTime,
                checkOutTime: a.checkOutTime,
            });
        });

        res.json({ calendarData, month: targetMonth + 1, year: targetYear });
    } catch (error) {
        console.error('Get team calendar error:', error);
        res.status(500).json({ error: 'Failed to get team calendar' });
    }
};

module.exports = {
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
};
