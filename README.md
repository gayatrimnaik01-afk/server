# Employee Attendance System

A comprehensive full-stack web application for managing employee attendance with role-based access control, real-time tracking, and detailed reporting.

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Default Credentials](#default-credentials)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Screenshots](#screenshots)

## ✨ Features

### Employee Features
- ✅ **Mark Attendance**: Check-in and check-out with automatic status calculation
- ✅ **Attendance History**: View personal attendance records with monthly filtering
- ✅ **Profile Management**: View and manage personal information
- ✅ **Salary Calculation**: Automatic salary calculation based on attendance

### Manager Features
- ✅ **Dashboard**: Overview of team attendance with analytics and charts
- ✅ **Team Calendar**: Visual calendar view of all employees' attendance
- ✅ **All Attendance**: Comprehensive table view with filtering options
- ✅ **Reports**: Generate and export attendance reports

### System Features
- 🔐 **Authentication**: Secure JWT-based authentication
- 👥 **Role-Based Access**: Separate portals for Employees and Managers
- 📊 **Analytics**: Charts and statistics for attendance tracking
- 🎨 **Modern UI**: Beautiful glassmorphism design with gradient backgrounds
- 📱 **Responsive**: Works on desktop, tablet, and mobile devices

## 🛠️ Tech Stack

### Frontend
- **React** 18.3.1 - UI library
- **React Router** 7.1.1 - Client-side routing
- **Zustand** 5.0.2 - State management
- **Axios** 1.7.9 - HTTP client
- **Recharts** 2.15.0 - Data visualization
- **Lucide React** 0.468.0 - Icons
- **Tailwind CSS** 3.4.17 - Styling
- **Vite** 7.2.4 - Build tool

### Backend
- **Node.js** - Runtime environment
- **Express** 4.21.2 - Web framework
- **Prisma** 6.1.0 - ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Date-fns** 4.1.0 - Date manipulation

## 📦 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** or **yarn** - Comes with Node.js

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd employee-attendance-system
```

### 2. Install Backend Dependencies
```bash
cd server
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../client
npm install
```

## 🔧 Environment Variables

### Backend (.env)
Create a `.env` file in the `server` directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/attendance_db"

# JWT Secret (use a strong random string)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server Port
PORT=5000

# Node Environment
NODE_ENV=development
```

### Frontend
The frontend uses Vite and connects to the backend at `http://localhost:5000` by default. No additional environment variables are required for development.

## 🗄️ Database Setup

### 1. Create PostgreSQL Database
```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE attendance_db;

# Exit
\q
```

### 2. Run Prisma Migrations
```bash
cd server
npx prisma migrate dev --name init
```

### 3. Seed Database with Sample Data
```bash
# Seed users and attendance data
node seed-attendance.js
```

This will create:
- **1 Manager** account
- **11 Employee** accounts
- **Sample attendance** records for the past 7 days

## ▶️ Running the Application

### Development Mode

#### 1. Start Backend Server
```bash
cd server
npm start
```
Server will run on `http://localhost:5000`

#### 2. Start Frontend Development Server
```bash
cd client
npm run dev
```
Frontend will run on `http://localhost:5173`

### Production Build

#### Build Frontend
```bash
cd client
npm run build
```

#### Serve Production Build
```bash
npm run preview
```

## 🔑 Default Credentials

### Manager Account
- **Email**: `manager@company.com`
- **Password**: `password123`
- **Role**: MANAGER

### Employee Accounts
- **Alice Johnson**
  - Email: `alice@company.com`
  - Password: `password123`
  - ID: EMP001

- **Bob Smith**
  - Email: `bob@company.com`
  - Password: `password123`
  - ID: EMP002

- **Carol Williams**
  - Email: `carol@company.com`
  - Password: `password123`
  - ID: EMP003

*(10+ more employee accounts available - check seed file)*

## 📁 Project Structure

```
employee-attendance-system/
├── client/                      # Frontend React application
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   │   ├── Layout.jsx       # Main layout wrapper
│   │   │   ├── Navbar.jsx       # Navigation bar
│   │   │   └── Sidebar.jsx      # Sidebar navigation
│   │   ├── pages/               # Page components
│   │   │   ├── employee/        # Employee portal pages
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── MarkAttendance.jsx
│   │   │   │   ├── History.jsx
│   │   │   │   └── Profile.jsx
│   │   │   ├── manager/         # Manager portal pages
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── TeamCalendar.jsx
│   │   │   │   ├── AllAttendance.jsx
│   │   │   │   └── Reports.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── store/               # Zustand state management
│   │   │   └── authStore.js
│   │   ├── utils/               # Utility functions
│   │   │   ├── api.js           # Axios instance
│   │   │   └── helpers.js       # Helper functions
│   │   ├── App.jsx              # Main app component
│   │   ├── index.css            # Global styles
│   │   └── main.jsx             # Entry point
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/                      # Backend Node.js application
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── migrations/          # Database migrations
│   ├── src/
│   │   ├── controllers/         # Route controllers
│   │   │   ├── auth.controller.js
│   │   │   ├── attendance.controller.js
│   │   │   └── dashboard.controller.js
│   │   ├── middleware/          # Express middleware
│   │   │   ├── auth.middleware.js
│   │   │   └── role.middleware.js
│   │   ├── routes/              # API routes
│   │   │   ├── auth.routes.js
│   │   │   ├── attendance.routes.js
│   │   │   └── dashboard.routes.js
│   │   ├── utils/               # Utility functions
│   │   │   └── jwt.js
│   │   └── app.js               # Express app setup
│   ├── seed-attendance.js       # Database seeder
│   ├── package.json
│   └── .env
│
└── README.md                    # This file
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new employee
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Attendance (Employee)
- `GET /api/attendance/today` - Get today's attendance
- `POST /api/attendance/checkin` - Check in
- `POST /api/attendance/checkout` - Check out
- `GET /api/attendance/history` - Get attendance history
- `GET /api/attendance/my-summary` - Get attendance summary
- `GET /api/attendance/salary` - Get salary calculation

### Attendance (Manager)
- `GET /api/attendance/all` - Get all attendance records
- `GET /api/attendance/team-calendar` - Get team calendar data

### Dashboard
- `GET /api/dashboard/employee` - Employee dashboard stats
- `GET /api/dashboard/manager` - Manager dashboard stats

## 📸 Screenshots

### Login Page
Beautiful gradient background with glassmorphism design.

### Employee Dashboard
- Current month statistics
- Quick check-in/check-out
- Recent attendance overview

### Manager Dashboard
- Team statistics
- Weekly attendance trends
- Department-wise analytics
- Absent employees list

### Team Calendar
Spreadsheet-style view with:
- Employees in rows
- Days in columns
- Color-coded status badges (P/L/H/A)

### Attendance History
Personal attendance records with:
- Monthly filtering
- Summary cards
- Detailed table view

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access control
- ✅ Protected API routes
- ✅ Input validation
- ✅ SQL injection prevention (Prisma ORM)

## 📊 Attendance Status Types

- **PRESENT** - On time (before 9:30 AM)
- **LATE** - Checked in after 9:30 AM
- **HALF_DAY** - Less than 4 hours worked
- **ABSENT** - No check-in recorded

## 🎨 Design Features

- Modern glassmorphism UI
- Gradient backgrounds
- Smooth animations
- Responsive tables
- Color-coded status indicators
- Professional typography
- Consistent spacing and alignment

## 🐛 Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env file
- Verify database exists

### Port Already in Use
- Change PORT in server/.env
- Update API URL in client if needed

### Prisma Migration Issues
```bash
npx prisma migrate reset
npx prisma migrate dev
```

## 📝 License

This project is created for educational purposes.

## 👨‍💻 Author

Created for academic submission.

## 🙏 Acknowledgments

- React team for the amazing framework
- Prisma for the excellent ORM
- Tailwind CSS for the utility-first CSS framework
