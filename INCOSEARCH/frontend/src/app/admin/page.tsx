'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';

interface Document {
    id: string;
    filename: string;
    category: string;
    status: string;
    uploadedAt: string;
    syncedAt?: string;
}

interface User {
    id: string;
    username: string;
    role: string;
    createdAt: string;
}

export default function AdminPage() {
    const router = useRouter();
    const { user, isAuthenticated, checkAuth } = useAuthStore();

    const [activeTab, setActiveTab] = useState<'documents' | 'users' | 'notebook'>('documents');
    const [documents, setDocuments] = useState<Document[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [notebooks, setNotebooks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // New user form
    const [showNewUserForm, setShowNewUserForm] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState<'USER' | 'ADMIN'>('USER');

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        } else if (user?.role !== 'ADMIN') {
            router.push('/chat');
        }
    }, [isAuthenticated, user, router]);

    useEffect(() => {
        if (isAuthenticated && user?.role === 'ADMIN') {
            fetchData();
        }
    }, [isAuthenticated, user, activeTab]);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            if (activeTab === 'documents') {
                const response = await api.get<{ documents: Document[] }>('/documents');
                setDocuments(response.data.documents);
            } else if (activeTab === 'users') {
                const response = await api.get<{ users: User[] }>('/auth/users');
                setUsers(response.data.users);
            } else if (activeTab === 'notebook') {
                const response = await api.get<{ notebooks: any[] }>('/documents/notebooks');
                setNotebooks(response.data.notebooks);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Không thể tải dữ liệu');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            await api.post('/auth/users', {
                username: newUsername,
                password: newPassword,
                role: newRole,
            });

            setShowNewUserForm(false);
            setNewUsername('');
            setNewPassword('');
            setNewRole('USER');
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Không thể tạo người dùng');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Bạn có chắc muốn xóa người dùng này?')) return;

        try {
            await api.delete(`/auth/users/${userId}`);
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Không thể xóa người dùng');
        }
    };

    const handleSyncDocument = async (docId: string) => {
        try {
            await api.post(`/documents/${docId}/sync`, {});
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Không thể đồng bộ tài liệu');
        }
    };

    if (!isAuthenticated || user?.role !== 'ADMIN') {
        return null;
    }

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            PRODUCT: 'Sản phẩm',
            COMPETITOR: 'Đối thủ',
            GUIDELINE: 'Hướng dẫn',
        };
        return labels[category] || category;
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            SYNCED: 'bg-green-100 text-green-700',
            PENDING: 'bg-yellow-100 text-yellow-700',
            ERROR: 'bg-red-100 text-red-700',
            MERGED: 'bg-gray-100 text-gray-700',
        };
        const labels: Record<string, string> = {
            SYNCED: 'Đã đồng bộ',
            PENDING: 'Chờ xử lý',
            ERROR: 'Lỗi',
            MERGED: 'Đã gộp',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
                {labels[status] || status}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/chat')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <h1 className="text-xl font-semibold text-gray-800">Quản lý hệ thống</h1>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('documents')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'documents'
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        📄 Tài liệu
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'users'
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        👥 Người dùng
                    </button>
                    <button
                        onClick={() => setActiveTab('notebook')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'notebook'
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        📚 NotebookLM
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center justify-between">
                        <span className="text-red-700">{error}</span>
                        <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Documents Tab */}
                {activeTab === 'documents' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-semibold text-gray-800">Danh sách tài liệu</h2>
                            <span className="text-sm text-gray-500">{documents.length} tài liệu</span>
                        </div>

                        {isLoading ? (
                            <div className="p-8 text-center text-gray-500">Đang tải...</div>
                        ) : documents.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">Chưa có tài liệu nào</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên file</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tải</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {documents.map((doc) => (
                                            <tr key={doc.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm text-gray-700">{doc.filename}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{getCategoryLabel(doc.category)}</td>
                                                <td className="px-4 py-3">{getStatusBadge(doc.status)}</td>
                                                <td className="px-4 py-3 text-sm text-gray-500">
                                                    {new Date(doc.uploadedAt).toLocaleDateString('vi-VN')}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {doc.status === 'PENDING' && (
                                                        <button
                                                            onClick={() => handleSyncDocument(doc.id)}
                                                            className="text-sm text-primary-600 hover:text-primary-800"
                                                        >
                                                            Đồng bộ
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-semibold text-gray-800">Danh sách người dùng</h2>
                            <button
                                onClick={() => setShowNewUserForm(true)}
                                className="px-4 py-2 gradient-primary text-white text-sm rounded-lg hover:opacity-90"
                            >
                                + Thêm người dùng
                            </button>
                        </div>

                        {/* New User Form */}
                        {showNewUserForm && (
                            <div className="p-4 bg-gray-50 border-b border-gray-100">
                                <form onSubmit={handleCreateUser} className="flex items-end gap-4">
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Tên đăng nhập</label>
                                        <input
                                            type="text"
                                            value={newUsername}
                                            onChange={(e) => setNewUsername(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                            required
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Mật khẩu</label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                    <div className="w-32">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Vai trò</label>
                                        <select
                                            value={newRole}
                                            onChange={(e) => setNewRole(e.target.value as 'USER' | 'ADMIN')}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                        >
                                            <option value="USER">Nhân viên</option>
                                            <option value="ADMIN">Quản trị</option>
                                        </select>
                                    </div>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                                    >
                                        Tạo
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowNewUserForm(false)}
                                        className="px-4 py-2 bg-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-300"
                                    >
                                        Hủy
                                    </button>
                                </form>
                            </div>
                        )}

                        {isLoading ? (
                            <div className="p-8 text-center text-gray-500">Đang tải...</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên đăng nhập</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vai trò</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {users.map((u) => (
                                            <tr key={u.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm text-gray-700">{u.username}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {u.role === 'ADMIN' ? 'Quản trị' : 'Nhân viên'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-500">
                                                    {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {u.id !== user?.id && (
                                                        <button
                                                            onClick={() => handleDeleteUser(u.id)}
                                                            className="text-sm text-red-600 hover:text-red-800"
                                                        >
                                                            Xóa
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Notebooks Tab */}
                {activeTab === 'notebook' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-semibold text-gray-800">Danh sách Sổ tay (Notebooks)</h2>
                            <span className="text-sm text-gray-500">{notebooks.length} sổ tay</span>
                        </div>

                        {isLoading ? (
                            <div className="p-8 text-center text-gray-500">Đang tải...</div>
                        ) : notebooks.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">Chưa có dữ liệu từ NotebookLM</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Sources (Src)</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Updated</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {notebooks.map((nb: any, i) => (
                                            <tr key={nb.id || i} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-mono text-gray-500">{nb.id}</td>
                                                <td className="px-4 py-3 text-sm text-gray-700 font-medium">{nb.title || '(No title)'}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600 text-center">{nb.sourceCount}</td>
                                                <td className="px-4 py-3 text-sm text-gray-500 text-right">{nb.updated}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
