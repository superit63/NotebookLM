/**
 * Sidebar Component
 * Chat list and user info
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useChatStore } from '@/store/chat';
import { formatRelativeTime } from '@/lib/utils';

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const { chats, currentChat, createChat, fetchChat, deleteChat } = useChatStore();
    const [isCreating, setIsCreating] = useState(false);

    const handleNewChat = async () => {
        setIsCreating(true);
        try {
            const chatId = await createChat();
            if (chatId) {
                fetchChat(chatId);
            }
        } finally {
            setIsCreating(false);
        }
    };

    const handleSelectChat = (chatId: string) => {
        fetchChat(chatId);
    };

    const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Bạn có chắc muốn xóa cuộc hội thoại này?')) {
            await deleteChat(chatId);
        }
    };

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <aside
            className={`${isOpen ? 'w-72' : 'w-0'
                } bg-white border-r border-gray-200 flex flex-col transition-all duration-300 overflow-hidden`}
        >
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
                <button
                    onClick={handleNewChat}
                    disabled={isCreating}
                    className="w-full gradient-primary text-white py-3 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isCreating ? (
                        <>
                            <div className="loading-dot !w-2 !h-2 !bg-white"></div>
                            <div className="loading-dot !w-2 !h-2 !bg-white"></div>
                            <div className="loading-dot !w-2 !h-2 !bg-white"></div>
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Cuộc hội thoại mới
                        </>
                    )}
                </button>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto p-2">
                {chats.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                        <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="text-sm">Chưa có cuộc hội thoại nào</p>
                    </div>
                ) : (
                    chats.map((chat) => (
                        <div
                            key={chat.id}
                            onClick={() => handleSelectChat(chat.id)}
                            className={`group relative p-3 rounded-xl cursor-pointer mb-1 transition-all ${currentChat?.id === chat.id
                                    ? 'bg-primary-50 border border-primary-200'
                                    : 'hover:bg-gray-50'
                                }`}
                        >
                            <div className="pr-8">
                                <p className="text-sm text-gray-700 font-medium truncate">
                                    {chat.title || 'Cuộc hội thoại mới'}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {formatRelativeTime(chat.updatedAt || chat.createdAt)}
                                </p>
                            </div>

                            {/* Delete button */}
                            <button
                                onClick={(e) => handleDeleteChat(chat.id, e)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 rounded-lg transition-all"
                                title="Xóa"
                            >
                                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* User Info */}
            <div className="p-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-sm">
                            <span className="text-white font-semibold">
                                {user?.username?.[0]?.toUpperCase() || 'U'}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">{user?.username}</p>
                            <p className="text-xs text-gray-400">
                                {user?.role === 'ADMIN' ? '👑 Quản trị viên' : 'Nhân viên'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                        title="Đăng xuất"
                    >
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
            </div>
        </aside>
    );
}
