/**
 * Chat Routes
 * CRUD for chats and messages, query NotebookLM
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { notebookLMService } from '../services/notebooklm';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/chats
 * List all chats for current user
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const chats = await prisma.chat.findMany({
            where: { userId: req.user!.userId },
            orderBy: { updatedAt: 'desc' },
            include: {
                messages: {
                    take: 1,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        res.json({ chats });
    } catch (error) {
        console.error('List chats error:', error);
        res.status(500).json({ error: 'Đã xảy ra lỗi.' });
    }
});

/**
 * POST /api/chats
 * Create a new chat
 */
router.post('/', async (req: Request, res: Response) => {
    try {
        const { title } = req.body;

        const chat = await prisma.chat.create({
            data: {
                title: title || 'Cuộc hội thoại mới',
                userId: req.user!.userId,
            },
        });

        res.status(201).json({ chat });
    } catch (error) {
        console.error('Create chat error:', error);
        res.status(500).json({ error: 'Đã xảy ra lỗi.' });
    }
});

/**
 * GET /api/chats/:id
 * Get chat with all messages
 */
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const chat = await prisma.chat.findFirst({
            where: { id, userId: req.user!.userId },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });

        if (!chat) {
            return res.status(404).json({ error: 'Không tìm thấy cuộc hội thoại.' });
        }

        res.json({ chat });
    } catch (error) {
        console.error('Get chat error:', error);
        res.status(500).json({ error: 'Đã xảy ra lỗi.' });
    }
});

/**
 * DELETE /api/chats/:id
 * Delete a chat
 */
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Verify ownership
        const chat = await prisma.chat.findFirst({
            where: { id, userId: req.user!.userId },
        });

        if (!chat) {
            return res.status(404).json({ error: 'Không tìm thấy cuộc hội thoại.' });
        }

        await prisma.chat.delete({ where: { id } });

        res.json({ message: 'Đã xóa cuộc hội thoại.' });
    } catch (error) {
        console.error('Delete chat error:', error);
        res.status(500).json({ error: 'Đã xảy ra lỗi.' });
    }
});

/**
 * POST /api/chats/:id/messages
 * Send a message and get AI response
 */
router.post('/:id/messages', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { content, mode = 'quick' } = req.body;

        if (!content || content.trim() === '') {
            return res.status(400).json({ error: 'Vui lòng nhập nội dung câu hỏi.' });
        }

        // Verify chat ownership
        const chat = await prisma.chat.findFirst({
            where: { id, userId: req.user!.userId },
        });

        if (!chat) {
            return res.status(404).json({ error: 'Không tìm thấy cuộc hội thoại.' });
        }

        // Save user message
        const userMessage = await prisma.message.create({
            data: {
                chatId: id,
                role: 'user',
                content: content.trim(),
            },
        });

        // Query NotebookLM
        let aiResponse: { answer: string; citations?: string };
        try {
            aiResponse = await notebookLMService.query(content.trim(), undefined, chat.notebookConversationId || undefined, mode);
        } catch (nlmError) {
            console.error('NotebookLM error:', nlmError);
            aiResponse = {
                answer: 'Xin lỗi, hiện tại không thể kết nối đến hệ thống tra cứu. Vui lòng thử lại sau.',
            };
        }

        // Save AI response
        const assistantMessage = await prisma.message.create({
            data: {
                chatId: id,
                role: 'assistant',
                content: aiResponse.answer,
                citations: aiResponse.citations,
            },
        });

        // Update chat title if first message
        const messageCount = await prisma.message.count({ where: { chatId: id } });
        if (messageCount <= 2) {
            // Auto-generate title from first question
            const title = content.trim().slice(0, 50) + (content.length > 50 ? '...' : '');
            await prisma.chat.update({
                where: { id },
                data: { title },
            });
        }

        // Update chat timestamp
        await prisma.chat.update({
            where: { id },
            data: { updatedAt: new Date() },
        });

        res.json({
            userMessage,
            assistantMessage,
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: 'Đã xảy ra lỗi.' });
    }
});

export default router;
