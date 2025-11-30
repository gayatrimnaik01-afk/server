const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Starting seed...');

    // Create manager
    const managerPassword = await bcrypt.hash('manager123', 10);
    const manager = await prisma.user.upsert({
        where: { email: 'manager@company.com' },
        update: {},
        create: {
            name: 'John Manager',
            email: 'manager@company.com',
            password: managerPassword,
            role: 'MANAGER',
            employeeId: 'MGR001',
            department: 'Management',
            monthlySalary: 80000,
        },
    });

    console.log('Created manager:', manager.email);

    // Create employees
    const employees = [
        {
            name: 'Alice Johnson',
            email: 'alice@company.com',
            password: await bcrypt.hash('employee123', 10),
            role: 'EMPLOYEE',
            employeeId: 'EMP001',
            department: 'Engineering',
            monthlySalary: 50000,
        },
        {
            name: 'Bob Smith',
            email: 'bob@company.com',
            password: await bcrypt.hash('employee123', 10),
            role: 'EMPLOYEE',
            employeeId: 'EMP002',
            department: 'Engineering',
            hourlyRate: 25,
        },
        {
            name: 'Carol Williams',
            email: 'carol@company.com',
            password: await bcrypt.hash('employee123', 10),
            role: 'EMPLOYEE',
            employeeId: 'EMP003',
            department: 'Marketing',
            monthlySalary: 45000,
        },
        {
            name: 'David Brown',
            email: 'david@company.com',
            password: await bcrypt.hash('employee123', 10),
            role: 'EMPLOYEE',
            employeeId: 'EMP004',
            department: 'Sales',
            monthlySalary: 48000,
        },
        {
            name: 'Eve Davis',
            email: 'eve@company.com',
            password: await bcrypt.hash('employee123', 10),
            role: 'EMPLOYEE',
            employeeId: 'EMP005',
            department: 'Engineering',
            monthlySalary: 52000,
        },
    ];

    for (const emp of employees) {
        const employee = await prisma.user.upsert({
            where: { email: emp.email },
            update: {},
            create: emp,
        });
        console.log('Created employee:', employee.email);
    }

    // Create sample attendance records for the last 30 days
    const allEmployees = await prisma.user.findMany({
        where: { role: 'EMPLOYEE' },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        // Skip weekends
        if (date.getDay() === 0 || date.getDay() === 6) continue;

        for (const employee of allEmployees) {
            // Random attendance pattern (90% present)
            const isPresent = Math.random() > 0.1;

            if (isPresent) {
                const checkInHour = 8 + Math.floor(Math.random() * 3); // 8-10 AM
                const checkInMinute = Math.floor(Math.random() * 60);
                const checkInTime = new Date(date);
                checkInTime.setHours(checkInHour, checkInMinute, 0, 0);

                const checkOutHour = 17 + Math.floor(Math.random() * 2); // 5-6 PM
                const checkOutMinute = Math.floor(Math.random() * 60);
                const checkOutTime = new Date(date);
                checkOutTime.setHours(checkOutHour, checkOutMinute, 0, 0);

                const totalHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);

                let status = 'PRESENT';
                if (checkInHour >= 10) {
                    status = 'LATE';
                } else if (totalHours < 4) {
                    status = 'HALF_DAY';
                }

                await prisma.attendance.upsert({
                    where: {
                        userId_date: {
                            userId: employee.id,
                            date: date,
                        }
                    },
                    update: {},
                    create: {
                        userId: employee.id,
                        date: date,
                        checkInTime,
                        checkOutTime,
                        totalHours,
                        status,
                    },
                });
            } else {
                await prisma.attendance.upsert({
                    where: {
                        userId_date: {
                            userId: employee.id,
                            date: date,
                        }
                    },
                    update: {},
                    create: {
                        userId: employee.id,
                        date: date,
                        status: 'ABSENT',
                    },
                });
            }
        }
    }

    console.log('Created sample attendance records for the last 30 days');
    console.log('Seed completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
