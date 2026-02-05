/**
 * Document Routes
 * Upload, list, delete documents (Admin only for write operations)
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '../middleware/auth';
import { notebookLMService } from '../services/notebooklm';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/documents
 * List all documents
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const { category, status } = req.query;

        const where: any = {};
        if (category) where.category = category;
        if (status) where.status = status;

        const documents = await prisma.document.findMany({
            where,
            orderBy: { uploadedAt: 'desc' },
        });

        res.json({ documents });
    } catch (error) {
        console.error('List documents error:', error);
        res.status(500).json({ error: 'Đã xảy ra lỗi.' });
    }
});

/**
 * GET /api/documents/stats
 * Get document statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
    try {
        const stats = await Promise.all([
            prisma.document.count({ where: { category: 'PRODUCT' } }),
            prisma.document.count({ where: { category: 'COMPETITOR' } }),
            prisma.document.count({ where: { category: 'GUIDELINE' } }),
            prisma.document.count({ where: { status: 'SYNCED' } }),
            prisma.document.count({ where: { status: 'PENDING' } }),
            prisma.document.count({ where: { status: 'ERROR' } }),
        ]);

        res.json({
            byCategory: {
                product: stats[0],
                competitor: stats[1],
                guideline: stats[2],
            },
            byStatus: {
                synced: stats[3],
                pending: stats[4],
                error: stats[5],
            },
            total: stats[0] + stats[1] + stats[2],
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Đã xảy ra lỗi.' });
    }
});

/**
 * GET /api/documents/notebooks
 * List all notebooks from NotebookLM (Admin only)
 */
router.get('/notebooks', requireAdmin, async (req: Request, res: Response) => {
    try {
        const notebooks = await notebookLMService.listNotebooks();
        res.json({ notebooks });
    } catch (error) {
        console.error('List notebooks error:', error);
        res.status(500).json({ error: 'Đã xảy ra lỗi khi lấy danh sách sổ tay.' });
    }
});

/**
 * POST /api/documents
 * Add a new document record (Admin only)
 * Note: Actual file upload handled separately
 */
router.post('/', requireAdmin, async (req: Request, res: Response) => {
    try {
        const { filename, originalPath, category } = req.body;

        if (!filename || !category) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc.' });
        }

        const validCategories = ['PRODUCT', 'COMPETITOR', 'GUIDELINE'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({ error: 'Loại tài liệu không hợp lệ.' });
        }

        const document = await prisma.document.create({
            data: {
                filename,
                originalPath: originalPath || '',
                category,
                status: 'PENDING',
            },
        });

        res.status(201).json({ document });
    } catch (error) {
        console.error('Create document error:', error);
        res.status(500).json({ error: 'Đã xảy ra lỗi.' });
    }
});

/**
 * POST /api/documents/:id/sync
 * Sync a document to NotebookLM (Admin only)
 */
router.post('/:id/sync', requireAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const document = await prisma.document.findUnique({ where: { id } });
        if (!document) {
            return res.status(404).json({ error: 'Không tìm thấy tài liệu.' });
        }

        // Try to sync to NotebookLM
        try {
            const sourceId = await notebookLMService.addSource(document.originalPath);

            await prisma.document.update({
                where: { id },
                data: {
                    status: 'SYNCED',
                    notebookSrcId: sourceId,
                    syncedAt: new Date(),
                },
            });

            res.json({ message: 'Đã đồng bộ thành công!', sourceId });
        } catch (syncError) {
            await prisma.document.update({
                where: { id },
                data: { status: 'ERROR' },
            });

            console.error('Sync error:', syncError);
            res.status(500).json({ error: 'Không thể đồng bộ tài liệu. Vui lòng thử lại.' });
        }
    } catch (error) {
        console.error('Sync document error:', error);
        res.status(500).json({ error: 'Đã xảy ra lỗi.' });
    }
});

/**
 * DELETE /api/documents/:id
 * Delete a document (Admin only)
 */
router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const document = await prisma.document.findUnique({ where: { id } });
        if (!document) {
            return res.status(404).json({ error: 'Không tìm thấy tài liệu.' });
        }

        // TODO: Also remove from NotebookLM if synced
        // if (document.notebookSrcId) {
        //   await notebookLMService.removeSource(document.notebookSrcId);
        // }

        await prisma.document.delete({ where: { id } });

        res.json({ message: 'Đã xóa tài liệu.' });
    } catch (error) {
        console.error('Delete document error:', error);
        res.status(500).json({ error: 'Đã xảy ra lỗi.' });
    }
});

export default router;
