'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useChatStore } from '@/store/chat';
import ReactMarkdown from 'react-markdown';

export default function ChatPage() {
    const router = useRouter();
    const { user, isAuthenticated, logout, checkAuth } = useAuthStore();
    const {
        chats,
        currentChat,
        messages,
        isLoading,
        isSending,
        error,
        fetchChats,
        fetchChat,
        createChat,
        deleteChat,
        sendMessage,
        clearError,
    } = useChatStore();

    const [input, setInput] = useState('');
    const [showSidebar, setShowSidebar] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Check auth on mount
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    // Fetch chats on mount
    useEffect(() => {
        if (isAuthenticated) {
            fetchChats();
        }
    }, [isAuthenticated, fetchChats]);

    // Scroll to bottom when new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleNewChat = async () => {
        const chatId = await createChat();
        if (chatId) {
            fetchChat(chatId);
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

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isSending) return;

        let chatId = currentChat?.id;

        // Create new chat if none selected
        if (!chatId) {
            chatId = await createChat();
            if (!chatId) return;
        }

        const message = input.trim();
        setInput('');
        await sendMessage(chatId, message);
    };

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside
                className={`${showSidebar ? 'w-72' : 'w-0'
                    } bg-white border-r border-gray-200 flex flex-col transition-all duration-300 overflow-hidden`}
            >
                {/* Sidebar Header */}
                <div className="p-4 border-b border-gray-100">
                    <button
                        onClick={handleNewChat}
                        className="w-full gradient-primary text-white py-3 rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Cuộc hội thoại mới
                    </button>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto p-2">
                    {chats.map((chat) => (
                        <div
                            key={chat.id}
                            onClick={() => handleSelectChat(chat.id)}
                            className={`group p-3 rounded-xl cursor-pointer mb-1 transition-all ${currentChat?.id === chat.id
                                    ? 'bg-primary-50 border border-primary-200'
                                    : 'hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700 truncate flex-1">
                                    {chat.title || 'Cuộc hội thoại mới'}
                                </span>
                                <button
                                    onClick={(e) => handleDeleteChat(chat.id, e)}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                                >
                                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}

                    {chats.length === 0 && !isLoading && (
                        <div className="text-center text-gray-400 py-8">
                            <p className="text-sm">Chưa có cuộc hội thoại nào</p>
                        </div>
                    )}
                </div>

                {/* User Info */}
                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                                <span className="text-primary-600 font-medium text-sm">
                                    {user?.username?.[0]?.toUpperCase() || 'U'}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700">{user?.username}</p>
                                <p className="text-xs text-gray-400">{user?.role === 'ADMIN' ? 'Quản trị' : 'Nhân viên'}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Đăng xuất"
                        >
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 gap-4">
                    <button
                        onClick={() => setShowSidebar(!showSidebar)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h1 className="font-semibold text-gray-800">INCOSEARCH</h1>
                    </div>

                    {user?.role === 'ADMIN' && (
                        <button
                            onClick={() => router.push('/admin')}
                            className="ml-auto px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Quản lý
                        </button>
                    )}
                </header>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                    {messages.length === 0 && !currentChat && (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-4 shadow-lg">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">Xin chào!</h2>
                            <p className="text-gray-500 max-w-md">
                                Hãy đặt câu hỏi về sản phẩm, tiêu chuẩn hoặc hướng dẫn. Tôi sẽ giúp bạn tìm kiếm thông tin từ cơ sở dữ liệu nội bộ.
                            </p>

                            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg w-full">
                                {[
                                    'So sánh sản phẩm A và B?',
                                    'Tiêu chuẩn WHO về khử khuẩn?',
                                    'Hướng dẫn sử dụng Exeol OPA?',
                                    'Thông số kỹ thuật GTA?',
                                ].map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        onClick={() => setInput(suggestion)}
                                        className="text-left p-3 bg-white border border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all text-sm text-gray-600"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`mb-4 message-enter ${message.role === 'user' ? 'flex justify-end' : ''}`}
                        >
                            <div
                                className={`max-w-3xl rounded-2xl px-4 py-3 ${message.role === 'user'
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-white border border-gray-200 shadow-sm'
                                    }`}
                            >
                                {message.role === 'assistant' ? (
                                    <div className="markdown-content">
                                        <ReactMarkdown>{message.content}</ReactMarkdown>
                                    </div>
                                ) : (
                                    <p>{message.content}</p>
                                )}

                                {/* Citations */}
                                {message.citations && (
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                        <p className="text-xs text-gray-400 mb-2">Nguồn tham khảo:</p>
                                        <div className="text-xs text-gray-500">
                                            {JSON.parse(message.citations).map((citation: any, index: number) => (
                                                <span key={index} className="inline-block bg-gray-100 px-2 py-1 rounded mr-2 mb-1">
                                                    [{index + 1}] {citation.sourceName || citation.source}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Loading indicator */}
                    {isSending && (
                        <div className="mb-4 message-enter">
                            <div className="max-w-3xl rounded-2xl px-4 py-3 bg-white border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2">
                                    <div className="loading-dot"></div>
                                    <div className="loading-dot"></div>
                                    <div className="loading-dot"></div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Error Toast */}
                {error && (
                    <div className="mx-4 mb-2">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between">
                            <span className="text-red-700 text-sm">{error}</span>
                            <button onClick={clearError} className="text-red-500 hover:text-red-700">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-200">
                    <form onSubmit={handleSend} className="max-w-4xl mx-auto">
                        <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3 border border-gray-200 focus-within:border-primary-300 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Nhập câu hỏi của bạn..."
                                className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                                disabled={isSending}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isSending}
                                className="p-2 gradient-primary text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
