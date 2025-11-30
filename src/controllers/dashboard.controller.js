const { PrismaClient } = require('@prisma/client');
const { startOfMonth, endOfMonth, subDays } = require('date-fns');

const prisma = new PrismaClient();

// Employee dashboard stats
const getEmployeeStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Today's status
        const todayAttendance = await prisma.attendance.findUnique({
            where: {
                userId_date: {
                    userId,
                    date: today,
                }
            }
        });

        // This month stats
        const startDate = startOfMonth(now);
        const endDate = endOfMonth(now);

        const monthAttendances = await prisma.attendance.findMany({
            where: {
                userId,
                date: {
                    gte: startDate,
                    lte: endDate,
                }
            }
        });

        const monthStats = {
            present: monthAttendances.filter(a => a.status === 'PRESENT').length,
            absent: monthAttendances.filter(a => a.status === 'ABSENT').length,
            late: monthAttendances.filter(a => a.status === 'LATE').length,
            halfDay: monthAttendances.filter(a => a.status === 'HALF_DAY').length,
        };

        // Total hours this month
        const totalHours = monthAttendances.reduce((sum, a) => sum + (parseFloat(a.totalHours) || 0), 0);

        // Last 7 days
        const sevenDaysAgo = subDays(today, 7);
        const recentAttendances = await prisma.attendance.findMany({
            where: {
                userId,
                date: {
                    gte: sevenDaysAgo,
                    lte: today,
                }
            },
            orderBy: {
                date: 'asc',
            }
        });

        res.json({
            todayStatus: todayAttendance ? {
                checkedIn: !!todayAttendance.checkInTime,
                checkedOut: !!todayAttendance.checkOutTime,
                status: todayAttendance.status,
                checkInTime: todayAttendance.checkInTime,
                checkOutTime: todayAttendance.checkOutTime,
            } : {
                checkedIn: false,
                checkedOut: false,
            },
            monthStats,
            totalHours: totalHours.toFixed(2),
            recentAttendances,
        });
    } catch (error) {
        console.error('Get employee stats error:', error);
        res.status(500).json({ error: 'Failed to get employee stats' });
    }
};

// Manager dashboard stats
const getManagerStats = async (req, res) => {
    try {
        const now = new Date();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Total employees
        const totalEmployees = await prisma.user.count({
            where: {
                role: 'EMPLOYEE',
            }
        });

        // Today's attendance
        const todayAttendances = await prisma.attendance.findMany({
            where: {
                date: today,
            },
            include: {
                user: {
                    select: {
                        name: true,
                        employeeId: true,
                    }
                }
            }
        });

        const presentToday = todayAttendances.filter(a => a.checkInTime && a.status !== 'ABSENT').length;
        const absentToday = totalEmployees - presentToday;
        const lateToday = todayAttendances.filter(a => a.status === 'LATE').length;

        // This month stats
        const startDate = startOfMonth(now);
        const endDate = endOfMonth(now);

        const monthAttendances = await prisma.attendance.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate,
                }
            }
        });

        // Weekly attendance trend (last 7 days)
        const weeklyTrend = [];
        for (let i = 6; i >= 0; i--) {
            const date = subDays(today, i);
            const dayAttendances = await prisma.attendance.findMany({
                where: {
                    date,
                }
            });

            weeklyTrend.push({
                date: date.toISOString().split('T')[0],
                present: dayAttendances.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length,
                absent: dayAttendances.filter(a => a.status === 'ABSENT').length,
            });
        }

        // Department-wise attendance
        const users = await prisma.user.findMany({
            where: {
                role: 'EMPLOYEE',
            },
            select: {
                id: true,
                department: true,
            }
        });

        const departmentStats = {};
        for (const user of users) {
            const dept = user.department || 'Unassigned';
            if (!departmentStats[dept]) {
                departmentStats[dept] = { total: 0, present: 0 };
            }
            departmentStats[dept].total++;

            const attendance = todayAttendances.find(a => a.userId === user.id);
            if (attendance && attendance.checkInTime) {
                departmentStats[dept].present++;
            }
        }

        // Absent employees today
        const absentEmployees = await prisma.user.findMany({
            where: {
                role: 'EMPLOYEE',
                id: {
                    notIn: todayAttendances.filter(a => a.checkInTime).map(a => a.userId),
                }
            },
            select: {
                id: true,
                name: true,
                employeeId: true,
                department: true,
            }
        });

        res.json({
            totalEmployees,
            todayStats: {
                present: presentToday,
                absent: absentToday,
                late: lateToday,
            },
            weeklyTrend,
            departmentStats,
            absentEmployees,
        });
    } catch (error) {
        console.error('Get manager stats error:', error);
        res.status(500).json({ error: 'Failed to get manager stats' });
    }
};

module.exports = {
    getEmployeeStats,
    getManagerStats,
};
