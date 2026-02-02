/**
 * Chat Store - Zustand
 * Manages chat state, messages, and API calls
 */

import { create } from 'zustand';
import { api } from '@/lib/api';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    citations?: string;
    createdAt: string;
}

interface Chat {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    messages?: Message[];
}

interface ChatState {
    chats: Chat[];
    currentChat: Chat | null;
    messages: Message[];
    isLoading: boolean;
    isSending: boolean;
    error: string | null;

    fetchChats: () => Promise<void>;
    fetchChat: (chatId: string) => Promise<void>;
    createChat: () => Promise<string | null>;
    deleteChat: (chatId: string) => Promise<void>;
    sendMessage: (chatId: string, content: string) => Promise<void>;
    setCurrentChat: (chat: Chat | null) => void;
    clearError: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
    chats: [],
    currentChat: null,
    messages: [],
    isLoading: false,
    isSending: false,
    error: null,

    fetchChats: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/chats');
            set({ chats: response.data.chats, isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.error || 'Không thể tải danh sách chat',
                isLoading: false,
            });
        }
    },

    fetchChat: async (chatId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get(`/chats/${chatId}`);
            const chat = response.data.chat;
            set({
                currentChat: chat,
                messages: chat.messages || [],
                isLoading: false,
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.error || 'Không thể tải chat',
                isLoading: false,
            });
        }
    },

    createChat: async () => {
        try {
            const response = await api.post('/chats', {});
            const newChat = response.data.chat;

            set((state) => ({
                chats: [newChat, ...state.chats],
                currentChat: newChat,
                messages: [],
            }));

            return newChat.id;
        } catch (error: any) {
            set({
                error: error.response?.data?.error || 'Không thể tạo chat mới',
            });
            return null;
        }
    },

    deleteChat: async (chatId: string) => {
        try {
            await api.delete(`/chats/${chatId}`);
            set((state) => ({
                chats: state.chats.filter((c) => c.id !== chatId),
                currentChat: state.currentChat?.id === chatId ? null : state.currentChat,
                messages: state.currentChat?.id === chatId ? [] : state.messages,
            }));
        } catch (error: any) {
            set({
                error: error.response?.data?.error || 'Không thể xóa chat',
            });
        }
    },

    sendMessage: async (chatId: string, content: string) => {
        set({ isSending: true, error: null });

        // Optimistic update: add user message immediately
        const tempUserMessage: Message = {
            id: 'temp-user-' + Date.now(),
            role: 'user',
            content,
            createdAt: new Date().toISOString(),
        };

        set((state) => ({
            messages: [...state.messages, tempUserMessage],
        }));

        try {
            const response = await api.post(`/chats/${chatId}/messages`, { content });
            const { userMessage, assistantMessage } = response.data;

            set((state) => ({
                // Replace temp message with real one, add assistant response
                messages: [
                    ...state.messages.filter((m) => m.id !== tempUserMessage.id),
                    userMessage,
                    assistantMessage,
                ],
                isSending: false,
            }));

            // Update chat title in list
            set((state) => ({
                chats: state.chats.map((c) =>
                    c.id === chatId
                        ? { ...c, title: content.slice(0, 50), updatedAt: new Date().toISOString() }
                        : c
                ),
            }));
        } catch (error: any) {
            // Remove optimistic update on error
            set((state) => ({
                messages: state.messages.filter((m) => m.id !== tempUserMessage.id),
                error: error.response?.data?.error || 'Không thể gửi tin nhắn',
                isSending: false,
            }));
        }
    },

    setCurrentChat: (chat: Chat | null) => {
        set({ currentChat: chat, messages: chat?.messages || [] });
    },

    clearError: () => set({ error: null }),
}));
