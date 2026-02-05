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


import { routerService, CategoryKey } from './router';

// Configuration
// We now load specific IDs. If they aren't set, we might fallback or warn.
// Configuration
// Load IDs from env. Support comma-separated lists by taking the first ID (until multi-query is supported).
const getEnvId = (key: string): string => {
    const val = process.env[key] || '';
    if (val.includes(',')) {
        const first = val.split(',')[0].trim();
        console.warn(`[Config] Multiple IDs found for ${key}. Using first one: ${first}`);
        return first;
    }
    return val.trim();
};

const NOTEBOOK_IDS_MAP: Record<CategoryKey, string> = {
    'EXEOL_OPA': getEnvId('NOTEBOOK_ID_EXEOL_OPA'),
    'EXEOL_GTA': getEnvId('NOTEBOOK_ID_EXEOL_GTA'),
    'EXEOL_CLEAN_4E': getEnvId('NOTEBOOK_ID_EXEOL_CLEAN_4E'),
    'EXEOL_SEPT_FIRST': getEnvId('NOTEBOOK_ID_EXEOL_SEPT_FIRST'),
    'EXEOL_SEPT_E2': getEnvId('NOTEBOOK_ID_EXEOL_SEPT_E2'),
    'EXEOL_RINSEMATIC': getEnvId('NOTEBOOK_ID_EXEOL_RINSEMATIC'),
    'EXEOL_SURF_OPTIMAL': getEnvId('NOTEBOOK_ID_EXEOL_SURF_OPTIMAL'),
    'EXEOL_SURF_30': getEnvId('NOTEBOOK_ID_EXEOL_SURF_30'),
    'EXEOL_WIPE_OPTIMALS': getEnvId('NOTEBOOK_ID_EXEOL_WIPE_OPTIMALS'),
    'COMPETITOR': getEnvId('NOTEBOOK_ID_COMPETITOR'),
    'GENERAL': getEnvId('NOTEBOOK_ID_GENERAL'),
    'UNKNOWN': getEnvId('NOTEBOOK_ID_GENERAL') // Fallback to General
};

const NOTEBOOK_IDS = Object.values(NOTEBOOK_IDS_MAP).filter(id => id.length > 0);
const NOTEBOOK_ID = NOTEBOOK_IDS[0] || '';
const CLI_COMMAND = 'nlm';

interface QueryResponse {
    answer: string;
    citations?: string;
    conversationId?: string;
    notebookUsed?: string; // Inform frontend which notebook was used
}

// ... existing interfaces ...

class NotebookLMService {
    private notebookIds: string[];
    private defaultNotebookId: string;

    constructor() {
        this.notebookIds = NOTEBOOK_IDS;
        this.defaultNotebookId = this.notebookIds[0] || '';

        if (this.notebookIds.length === 0) {
            console.warn('⚠️  Notebook IDs not configured. Set specific NOTEBOOK_ID_* in .env file.');
        } else {
            console.log(`[NotebookLM] Loaded ${this.notebookIds.length} notebook(s).`);
        }
    }

    /**
     * Get all configured notebook IDs
     */
    getNotebookIds(): string[] {
        return this.notebookIds;
    }

    /**
     * Query NotebookLM with a question
     */
    async query(question: string, notebookId?: string, conversationId?: string, mode: 'quick' | 'extended' | 'chat' = 'chat'): Promise<QueryResponse> {
        let targetNotebookId = notebookId;

        // If no specific notebook ID requested, use Smart Routing
        if (!targetNotebookId) {
            console.log('[NotebookLM] Auto-routing query...');
            const category = await routerService.classifyQuery(question);
            targetNotebookId = NOTEBOOK_IDS_MAP[category];

            if (!targetNotebookId) {
                console.warn(`[NotebookLM] No notebook found for category ${category}. Falling back to default.`);
                targetNotebookId = this.defaultNotebookId;
            } else {
                console.log(`[NotebookLM] Routed to ${category} (${targetNotebookId})`);
            }
        }

        if (!targetNotebookId) {
            throw new Error('NotebookLM chưa được cấu hình (Không tìm thấy Notebook ID nào).');
        }

        try {
            // Check if we need to perform research first
            if (mode === 'quick' || mode === 'extended') {
                console.log(`[NotebookLM] Starting research (${mode}) for: "${question}"`);
                try {
                    await this.conductResearch(question, targetNotebookId, mode === 'extended' ? 'deep' : 'fast');
                } catch (researchError) {
                    console.error('[NotebookLM] Research failed, falling back to direct query:', researchError);
                }
            }

            // Force Vietnamese for the final answer
            const prompt = `Trả lời bằng Tiếng Việt. ${question}`;

            // Escape the question for shell
            const escapedQuestion = prompt.replace(/"/g, '\\"').replace(/\$/g, '\\$');

            // Build command
            let command = `${CLI_COMMAND} notebook query "${targetNotebookId}" "${escapedQuestion}"`;

            if (conversationId) {
                command += ` --conversation-id "${conversationId}"`;
            }

            console.log(`[NotebookLM] Querying notebook ${targetNotebookId}: ${prompt.substring(0, 50)}...`);

            const { stdout, stderr } = await execAsync(command, {
                timeout: 60000,
                encoding: 'utf8',
                env: {
                    ...process.env,
                    PYTHONIOENCODING: 'utf-8',
                    PYTHONUTF8: '1'
                }
            });

            if (stderr) {
                console.warn('[NotebookLM] Stderr:', stderr);
            }

            const response = this.parseResponse(stdout);

            // Append notebook info
            return {
                ...response,
                notebookUsed: targetNotebookId
            };

        } catch (error: any) {
            console.error('[NotebookLM] Query error:', error.message);
            // ... (keep existing error handling)
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

    private async conductResearch(query: string, notebookId: string, mode: 'fast' | 'deep'): Promise<void> {
        // 1. Start Research
        const escapedQuery = query.replace(/"/g, '\\"');
        const startCmd = `${CLI_COMMAND} research start "${escapedQuery}" --notebook-id "${notebookId}" --mode ${mode}`;

        console.log(`[NotebookLM] Research Start: ${startCmd}`);
        const { stdout: startOut } = await execAsync(startCmd);

        // Extract Task ID
        // "Task ID: 40479b0b-a01b-49dd-9257-9f1fc700bcb1"
        const taskIdMatch = startOut.match(/Task ID:\s*([a-f0-9-]+)/i);
        if (!taskIdMatch) {
            throw new Error('Could not start research: No Task ID return.');
        }
        const taskId = taskIdMatch[1];
        console.log(`[NotebookLM] Research Task ID: ${taskId}`);

        // 2. Poll Status
        await this.pollResearchStatus(notebookId, taskId, mode === 'deep' ? 120000 : 60000);

        // 3. Import
        console.log(`[NotebookLM] Importing research results...`);
        const importCmd = `${CLI_COMMAND} research import "${notebookId}" "${taskId}"`;
        await execAsync(importCmd);
        console.log(`[NotebookLM] Research imported successfully.`);
    }

    private async pollResearchStatus(notebookId: string, taskId: string, timeoutMs: number): Promise<void> {
        const startTime = Date.now();
        const pollInterval = 3000;

        while (Date.now() - startTime < timeoutMs) {
            const cmd = `${CLI_COMMAND} research status "${notebookId}"`; // Status checks notebook's active tasks? Or specific task?
            // CLI guide says: nlm research status <notebook>
            // Output has: Task ID: ... Status: completed

            try {
                const { stdout } = await execAsync(cmd);
                if (stdout.includes(taskId) && stdout.includes('completed')) {
                    return;
                }
            } catch (e) {
                console.warn('Check status failed, retrying...', e);
            }

            await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
        throw new Error('Research timed out.');
    }

    /**
     * Add a source document to NotebookLM
     */
    async addSource(filePath: string, notebookId?: string): Promise<string> {
        const targetNotebookId = notebookId || this.defaultNotebookId;

        if (!targetNotebookId) {
            throw new Error('NotebookLM chưa được cấu hình.');
        }

        try {
            const escapedPath = filePath.replace(/"/g, '\\"');
            const command = `${CLI_COMMAND} source add "${targetNotebookId}" --file "${escapedPath}"`;

            console.log(`[NotebookLM] Adding source to ${targetNotebookId}: ${filePath}`);

            const { stdout } = await execAsync(command, {
                timeout: 120000, // 2 minute timeout for uploads
                encoding: 'utf8',
                env: {
                    ...process.env,
                    PYTHONIOENCODING: 'utf-8',
                    PYTHONUTF8: '1'
                }
            });

            // Parse response to get source ID
            try {
                const parsed = JSON.parse(stdout);
                return parsed.sourceId || parsed.id || 'unknown';
            } catch {
                return 'added_successfully';
            }
        } catch (error: any) {
            console.error('[NotebookLM] Add source error:', error.message);
            throw new Error('Không thể thêm tài liệu vào NotebookLM.');
        }
    }

    /**
     * List all sources in the notebook
     */
    async listSources(notebookId?: string): Promise<any[]> {
        const targetNotebookId = notebookId || this.defaultNotebookId;

        if (!targetNotebookId) {
            return [];
        }

        try {
            const command = `${CLI_COMMAND} source list "${targetNotebookId}"`;
            const { stdout } = await execAsync(command, {
                timeout: 30000,
                encoding: 'utf8',
                env: {
                    ...process.env,
                    PYTHONIOENCODING: 'utf-8',
                    PYTHONUTF8: '1'
                }
            });

            try {
                const parsed = JSON.parse(stdout);
                // Handle different possible JSON structures
                if (Array.isArray(parsed)) return parsed;
                if (parsed.sources && Array.isArray(parsed.sources)) return parsed.sources;
                return [];
            } catch {
                console.warn('[NotebookLM] Failed to parse listSources JSON output');
                return [];
            }
        } catch (error) {
            console.error('[NotebookLM] List sources error:', error);
            return [];
        }
    }

    /**
     * Parse the CLI response
     */
    async listNotebooks(): Promise<any[]> {
        const command = `${CLI_COMMAND} notebook list`;
        try {
            const { stdout } = await execAsync(command, {
                env: {
                    ...process.env,
                    PYTHONIOENCODING: 'utf-8',
                    PYTHONUTF8: '1'
                }
            });

            const lines = stdout.split('\n').filter(line => line.trim());
            const notebooks = [];

            for (const line of lines) {
                // Skip header
                if (line.match(/^ID\s+Title/i)) continue;

                const tokens = line.trim().split(/\s{2,}/); // Split by 2+ spaces to separate columns better
                if (tokens.length < 2) continue;

                // ID is first
                const id = tokens[0];
                // Updated is likely last
                const updated = tokens[tokens.length - 1];
                // Src count likely second to last
                const srcCount = tokens.length >= 3 ? tokens[tokens.length - 2] : '0';
                // Title is whatever is in between
                const title = tokens.slice(1, tokens.length - 2).join(' ') || tokens[1] || '(No Title)';

                notebooks.push({
                    id,
                    title,
                    sourceCount: parseInt(srcCount, 10) || 0,
                    updated
                });
            }
            return notebooks;
        } catch (error) {
            console.error('List notebooks error:', error);
            throw error;
        }
    }

    private parseResponse(stdout: string): QueryResponse {
        // ... existing implementation ...
        try {
            const parsed = JSON.parse(stdout);
            return {
                answer: parsed.answer || parsed.response || parsed.text || stdout,
                citations: parsed.citations ? JSON.stringify(parsed.citations) : undefined,
                conversationId: parsed.conversationIds || parsed.conversation_id
            };
        } catch {
            let cleanText = stdout.replace(/\x1b\[[0-9;]*m/g, '').trim();

            let conversationId = undefined;
            const convoIdMatch = cleanText.match(/Conversation ID:\s*([a-f0-9-]+)/i);
            if (convoIdMatch) {
                conversationId = convoIdMatch[1];
                cleanText = cleanText.replace(/Conversation ID:.*$/im, '').replace(/Use --conversation-id for follow-up questions.*$/im, '').trim();
            }
            return {
                answer: cleanText || 'Không có câu trả lời.',
                conversationId: conversationId
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

            if (this.notebookIds.length === 0) {
                return { ok: false, message: 'NOTEBOOK_IDs not configured' };
            }

            return { ok: true, message: `NotebookLM service ready (${this.notebookIds.length} notebooks)` };
        } catch {
            return { ok: false, message: 'notebooklm-mcp-cli not installed' };
        }
    }
}

// Export singleton instance
export const notebookLMService = new NotebookLMService();
