/**
 * INCOSEARCH Backend - Main Entry Point
 * Express.js API Server
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import chatRoutes from './routes/chat';
import documentRoutes from './routes/documents';

// Import middleware
import { authenticateToken } from './middleware/auth';

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes (require authentication)
app.use('/api/chats', authenticateToken, chatRoutes);
app.use('/api/documents', authenticateToken, documentRoutes);

// ============================================
// ERROR HANDLING
// ============================================
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err.message);
    res.status(500).json({
        error: 'Đã xảy ra lỗi. Vui lòng thử lại sau.',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
    console.log(`
  ╔═══════════════════════════════════════╗
  ║   🔍 INCOSEARCH Backend Server        ║
  ╠═══════════════════════════════════════╣
  ║   Port: ${PORT}                          ║
  ║   Status: Running                     ║
  ╚═══════════════════════════════════════╝
  `);
});

export default app;
