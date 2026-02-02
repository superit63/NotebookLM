/**
 * Authentication Routes
 * Login, Register (admin only), Get current user
 */

import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/auth/login
 * Login with username and password
 */
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin.' });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { username: username.toLowerCase() },
        });

        if (!user) {
            return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Đã xảy ra lỗi. Vui lòng thử lại.' });
    }
});

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.userId },
            select: { id: true, username: true, role: true, createdAt: true },
        });

        if (!user) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Đã xảy ra lỗi.' });
    }
});

/**
 * POST /api/auth/users
 * Create new user (Admin only)
 */
router.post('/users', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
        const { username, password, role = 'USER' } = req.body;

        // Validate
        if (!username || !password) {
            return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin.' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự.' });
        }

        // Check existing
        const existing = await prisma.user.findUnique({
            where: { username: username.toLowerCase() },
        });

        if (existing) {
            return res.status(400).json({ error: 'Tên đăng nhập đã tồn tại.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                username: username.toLowerCase(),
                password: hashedPassword,
                role: role === 'ADMIN' ? 'ADMIN' : 'USER',
            },
            select: { id: true, username: true, role: true, createdAt: true },
        });

        res.status(201).json({ user });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Đã xảy ra lỗi.' });
    }
});

/**
 * GET /api/auth/users
 * List all users (Admin only)
 */
router.get('/users', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, username: true, role: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
        });

        res.json({ users });
    } catch (error) {
        console.error('List users error:', error);
        res.status(500).json({ error: 'Đã xảy ra lỗi.' });
    }
});

/**
 * DELETE /api/auth/users/:id
 * Delete user (Admin only)
 */
router.delete('/users/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Prevent self-delete
        if (id === req.user!.userId) {
            return res.status(400).json({ error: 'Không thể xóa chính mình.' });
        }

        await prisma.user.delete({ where: { id } });

        res.json({ message: 'Đã xóa người dùng.' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Đã xảy ra lỗi.' });
    }
});

export default router;
