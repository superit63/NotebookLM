/**
 * Common Types for INCOSEARCH
 */

export interface User {
    id: string;
    username: string;
    role: 'ADMIN' | 'USER';
    createdAt?: string;
}

export interface Message {
    id: string;
    chatId: string;
    role: 'user' | 'assistant';
    content: string;
    citations?: string;
    createdAt: string;
}

export interface Chat {
    id: string;
    title: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    messages?: Message[];
}

export interface Document {
    id: string;
    filename: string;
    originalPath: string;
    category: 'PRODUCT' | 'COMPETITOR' | 'GUIDELINE';
    status: 'PENDING' | 'SYNCED' | 'ERROR' | 'MERGED';
    notebookSrcId?: string;
    uploadedAt: string;
    syncedAt?: string;
}

export interface ApiError {
    error: string;
    details?: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}

export interface ChatListResponse {
    chats: Chat[];
}

export interface MessageResponse {
    userMessage: Message;
    assistantMessage: Message;
}
