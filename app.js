require('dotenv').config();
const express = require('express');
const path = require('path');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 50003;

// --- MIDDLEWARES ---
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- STATIC FILES ---
// Serves files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// --- API ROUTES ---
app.get('/api/health', (req, res) => {
    res.json({
        status: 'UP',
        timestamp: new Date(),
        service: 'GateKeeper Access Node',
        environment: process.env.NODE_ENV || 'development'
    });
});

// --- PAGE ROUTING ---
// Explicit routes to map clean URLs to HTML files

// 1. Home Page / Dashboard -> home.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// 2. Check-in Console -> checkin.html
app.get('/checkin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'checkin.html'));
});

// 3. Create Request Page -> request.html
app.get('/request', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'request.html'));
});

// Fallback for SPA-like behavior or 404
app.get('*', (req, res) => {
    // Default to Home if route not found
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// --- SERVER STARTUP (SERVERLESS COMPATIBLE) ---
// Only listen if the file is run directly (not imported as a module).
// This is critical for Vercel/Lambda deployments.
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`
        ================================================
        🛡️  GATEKEEPER ACCESS CONSOLE
        ================================================
        ✓ Server running on port ${PORT}
        ✓ URL: http://localhost:${PORT}
        ✓ Check-in URL: http://localhost:${PORT}/checkin
        ================================================
        `);
    });
}

// Export the app for Vercel or other serverless functions
module.exports = app;
