'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

export default function Home() {
    const router = useRouter();
    const { isAuthenticated, checkAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        if (isAuthenticated) {
            router.push('/chat');
        } else {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    // Loading state while checking auth
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-healthcare-light to-white">
            <div className="text-center">
                <div className="flex justify-center mb-4">
                    <div className="loading-dot"></div>
                    <div className="loading-dot mx-1"></div>
                    <div className="loading-dot"></div>
                </div>
                <p className="text-gray-500">Đang tải...</p>
            </div>
        </div>
    );
}
