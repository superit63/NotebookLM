/**
 * Auth Store - Zustand
 * Manages authentication state and user info
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';

interface User {
    id: string;
    username: string;
    role: 'ADMIN' | 'USER';
}

interface AuthState {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    checkAuth: () => void;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            token: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (username: string, password: string) => {
                set({ isLoading: true, error: null });

                try {
                    const response = await api.post('/auth/login', { username, password });
                    const { token, user } = response.data;

                    set({
                        token,
                        user,
                        isAuthenticated: true,
                        isLoading: false,
                    });

                    return true;
                } catch (error: any) {
                    set({
                        error: error.response?.data?.error || 'Đăng nhập thất bại',
                        isLoading: false,
                    });
                    return false;
                }
            },

            logout: () => {
                set({
                    token: null,
                    user: null,
                    isAuthenticated: false,
                });
            },

            checkAuth: () => {
                const { token, user } = get();
                if (token && user) {
                    set({ isAuthenticated: true });
                } else {
                    set({ isAuthenticated: false });
                }
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: 'incosearch-auth',
            partialize: (state) => ({
                token: state.token,
                user: state.user,
            }),
        }
    )
);
