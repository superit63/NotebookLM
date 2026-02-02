/**
 * NotebookLM Service
 * Wrapper for notebooklm-mcp-cli
 * 
 * This service communicates with NotebookLM through the installed CLI tool.
 * Make sure to run: uv tool install notebooklm-mcp-cli
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Configuration
const NOTEBOOK_ID = process.env.NOTEBOOK_ID || '';
const CLI_COMMAND = 'nlm'; // CLI command after pip install

interface QueryResponse {
    answer: string;
    citations?: string;
}

interface Citation {
    sourceId: string;
    sourceName: string;
    excerpt: string;
}

class NotebookLMService {
    private notebookId: string;

    constructor() {
        this.notebookId = NOTEBOOK_ID;
        if (!this.notebookId) {
            console.warn('⚠️  NOTEBOOK_ID not configured. Set it in .env file.');
        }
    }

    /**
     * Query NotebookLM with a question
     */
    async query(question: string): Promise<QueryResponse> {
        if (!this.notebookId) {
            throw new Error('NotebookLM chưa được cấu hình. Vui lòng liên hệ Admin.');
        }

        try {
            // Escape the question for shell
            const escapedQuestion = question.replace(/"/g, '\\"').replace(/\$/g, '\\$');

            // Execute the CLI command
            const command = `${CLI_COMMAND} notebook query "${this.notebookId}" "${escapedQuestion}" --format json`;

            console.log(`[NotebookLM] Querying: ${question.substring(0, 50)}...`);

            const { stdout, stderr } = await execAsync(command, {
                timeout: 60000, // 60 second timeout
                encoding: 'utf8',
            });

            if (stderr) {
                console.warn('[NotebookLM] Stderr:', stderr);
            }

            // Parse the JSON response
            const response = this.parseResponse(stdout);

            return response;
        } catch (error: any) {
            console.error('[NotebookLM] Query error:', error.message);

            // Handle specific errors
            if (error.message?.includes('ENOENT') || error.message?.includes('not found')) {
                throw new Error('CLI tool chưa được cài đặt. Chạy: uv tool install notebooklm-mcp-cli');
            }

            if (error.message?.includes('timeout')) {
                throw new Error('Timeout khi truy vấn. Vui lòng thử lại.');
            }

            if (error.message?.includes('auth') || error.message?.includes('cookie')) {
                throw new Error('Phiên đăng nhập Google đã hết hạn. Chạy: notebooklm-mcp-auth');
            }

            throw new Error('Không thể truy vấn NotebookLM. Vui lòng thử lại sau.');
        }
    }

    /**
     * Add a source document to NotebookLM
     */
    async addSource(filePath: string): Promise<string> {
        if (!this.notebookId) {
            throw new Error('NotebookLM chưa được cấu hình.');
        }

        try {
            const escapedPath = filePath.replace(/"/g, '\\"');
            const command = `${CLI_COMMAND} source add "${this.notebookId}" --file "${escapedPath}" --format json`;

            console.log(`[NotebookLM] Adding source: ${filePath}`);

            const { stdout } = await execAsync(command, {
                timeout: 120000, // 2 minute timeout for uploads
                encoding: 'utf8',
            });

            // Parse response to get source ID
            const parsed = JSON.parse(stdout);
            return parsed.sourceId || parsed.id || 'unknown';
        } catch (error: any) {
            console.error('[NotebookLM] Add source error:', error.message);
            throw new Error('Không thể thêm tài liệu vào NotebookLM.');
        }
    }

    /**
     * List all sources in the notebook
     */
    async listSources(): Promise<any[]> {
        if (!this.notebookId) {
            return [];
        }

        try {
            const command = `${CLI_COMMAND} source list "${this.notebookId}" --format json`;
            const { stdout } = await execAsync(command, {
                timeout: 30000,
                encoding: 'utf8',
            });

            return JSON.parse(stdout).sources || [];
        } catch (error) {
            console.error('[NotebookLM] List sources error:', error);
            return [];
        }
    }

    /**
     * Parse the CLI response
     */
    private parseResponse(stdout: string): QueryResponse {
        try {
            // Try to parse as JSON first
            const parsed = JSON.parse(stdout);

            return {
                answer: parsed.answer || parsed.response || parsed.text || stdout,
                citations: parsed.citations ? JSON.stringify(parsed.citations) : undefined,
            };
        } catch {
            // If not JSON, return raw text
            // Remove any ANSI codes
            const cleanText = stdout.replace(/\x1b\[[0-9;]*m/g, '').trim();

            return {
                answer: cleanText || 'Không có câu trả lời.',
            };
        }
    }

    /**
     * Check if the service is properly configured
     */
    async healthCheck(): Promise<{ ok: boolean; message: string }> {
        try {
            // Check if CLI is installed
            await execAsync(`${CLI_COMMAND} --version`);

            if (!this.notebookId) {
                return { ok: false, message: 'NOTEBOOK_ID not configured' };
            }

            return { ok: true, message: 'NotebookLM service ready' };
        } catch {
            return { ok: false, message: 'notebooklm-mcp-cli not installed' };
        }
    }
}

// Export singleton instance
export const notebookLMService = new NotebookLMService();
