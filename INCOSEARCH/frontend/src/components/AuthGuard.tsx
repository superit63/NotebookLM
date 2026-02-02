/**
 * Auth Guard Component
 * Redirects to login if not authenticated
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { LoadingOverlay } from './ui';

interface AuthGuardProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
    const router = useRouter();
    const { isAuthenticated, user, checkAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        } else if (requireAdmin && user?.role !== 'ADMIN') {
            router.push('/chat');
        }
    }, [isAuthenticated, user, requireAdmin, router]);

    // Show loading while checking auth
    if (!isAuthenticated) {
        return <LoadingOverlay message="Đang xác thực..." />;
    }

    if (requireAdmin && user?.role !== 'ADMIN') {
        return <LoadingOverlay message="Đang chuyển hướng..." />;
    }

    return <>{children}</>;
}
