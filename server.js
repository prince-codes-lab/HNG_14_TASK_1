require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
const profileRoutes = require('./router/profiles');
const connect_db = require('./db');

// ── Middleware ──────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Fixed: 'methods' not 'method', OPTIONS included
app.use(cors({
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    origin: '*'
}));

// ── Routes ──────────────────────────────────────────────
app.use('/api/profiles', profileRoutes);

// ── Fallback: unknown routes ─────────────────────────────
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found'
    });
});

// ── Fallback: uncaught errors ─────────────────────────────
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        status: 'error',
        message: 'Internal server error'
    });
});

// ── Start ─────────────────────────────────────────────────
const start = async () => {
    await connect_db();
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
};

start();