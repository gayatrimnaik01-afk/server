const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/auth.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Root endpoint - Beautiful HTML welcome page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Employee Attendance System API</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-center;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          max-width: 800px;
          width: 100%;
          padding: 50px;
        }
        h1 {
          color: #667eea;
          font-size: 2.5rem;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .status {
          display: inline-block;
          background: #10b981;
          color: white;
          padding: 8px 20px;
          border-radius: 25px;
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 30px;
        }
        .version {
          color: #6b7280;
          font-size: 1rem;
          margin-bottom: 40px;
        }
        h2 {
          color: #374151;
          font-size: 1.5rem;
          margin: 30px 0 20px 0;
          padding-bottom: 10px;
          border-bottom: 2px solid #e5e7eb;
        }
        .endpoint {
          background: #f9fafb;
          border-left: 4px solid #667eea;
          padding: 15px 20px;
          margin: 15px 0;
          border-radius: 8px;
          transition: all 0.3s;
        }
        .endpoint:hover {
          background: #f3f4f6;
          transform: translateX(5px);
        }
        .endpoint-path {
          font-family: 'Courier New', monospace;
          color: #667eea;
          font-weight: 600;
          font-size: 1.1rem;
          margin-bottom: 5px;
        }
        .endpoint-desc {
          color: #6b7280;
          font-size: 0.95rem;
        }
        .icon {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-center;
          color: white;
          font-size: 24px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #9ca3af;
          font-size: 0.9rem;
        }
        a { color: #667eea; text-decoration: none; font-weight: 600; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>
          <span class="icon">🏢</span>
          Employee Attendance System
        </h1>
        <div class="status">✓ API Running</div>
        <div class="version">Version 1.0.0</div>
        
        <h2>📡 Available Endpoints</h2>
        
        <div class="endpoint">
          <div class="endpoint-path">/api/auth</div>
          <div class="endpoint-desc">Authentication endpoints - Login, Register, Get Current User</div>
        </div>
        
        <div class="endpoint">
          <div class="endpoint-path">/api/attendance</div>
          <div class="endpoint-desc">Attendance management - Check In/Out, View History, Export Reports</div>
        </div>
        
        <div class="endpoint">
          <div class="endpoint-path">/api/dashboard</div>
          <div class="endpoint-desc">Dashboard statistics - Employee & Manager analytics</div>
        </div>
        
        <div class="endpoint">
          <div class="endpoint-path">/health</div>
          <div class="endpoint-desc">Health check endpoint - Server status</div>
        </div>
        
        <div class="footer">
          <p>Built with Node.js + Express + PostgreSQL + Prisma</p>
          <p style="margin-top: 10px;">Frontend: <a href="http://localhost:5173">http://localhost:5173</a></p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
