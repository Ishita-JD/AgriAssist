const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const Message = require('./models/Message');

const app = express();
const PORT = process.env.SERVER_PORT || 5000;

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// MongoDB Connection
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected successfully'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));

// ─── Routes ───────────────────────────────────────────────────────────────────

// POST /api/contact  — save a new message
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, email, and message are required.' });
        }

        const newMessage = await Message.create({ name, email, subject, message });
        res.status(201).json({ success: true, data: newMessage });
    } catch (err) {
        console.error('Error saving message:', err);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
});

// GET /api/contact  — retrieve all messages (admin use)
app.get('/api/contact', async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 });
        res.json({ success: true, data: messages });
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
});

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

// ─── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
