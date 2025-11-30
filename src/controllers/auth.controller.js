const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
};

// Register new user
const register = async (req, res) => {
    try {
        const { name, email, password, role, employeeId, department, hourlyRate, monthlySalary } = req.body;

        // Validate required fields
        if (!name || !email || !password || !employeeId) {
            return res.status(400).json({ error: 'Please provide all required fields' });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // Check if employeeId already exists
        const existingEmployeeId = await prisma.user.findUnique({
            where: { employeeId }
        });

        if (existingEmployeeId) {
            return res.status(400).json({ error: 'Employee ID already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'EMPLOYEE',
                employeeId,
                department,
                hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
                monthlySalary: monthlySalary ? parseFloat(monthlySalary) : null,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                employeeId: true,
                department: true,
                hourlyRate: true,
                monthlySalary: true,
                createdAt: true,
            }
        });

        // Generate token
        const token = generateToken(user.id);

        res.status(201).json({
            message: 'User registered successfully',
            user,
            token,
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
};

// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ error: 'Please provide email and password' });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = generateToken(user.id);

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            message: 'Login successful',
            user: userWithoutPassword,
            token,
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
};

// Get current user
const getMe = async (req, res) => {
    try {
        res.json({ user: req.user });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ error: 'Failed to get user data' });
    }
};

module.exports = {
    register,
    login,
    getMe,
};
