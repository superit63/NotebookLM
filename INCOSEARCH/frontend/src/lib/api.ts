/**
 * API Client
 * Axios instance with auth interceptor
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface RequestConfig {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    body?: any;
}

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private getToken(): string | null {
        if (typeof window === 'undefined') return null;

        try {
            const stored = localStorage.getItem('incosearch-auth');
            if (stored) {
                const parsed = JSON.parse(stored);
                return parsed.state?.token || null;
            }
        } catch {
            return null;
        }
        return null;
    }

    private async request<T>(endpoint: string, config: RequestConfig = {}): Promise<{ data: T }> {
        const { method = 'GET', headers = {}, body } = config;

        const token = this.getToken();
        const requestHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            ...headers,
        };

        if (token) {
            requestHeaders['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${this.baseUrl}/api${endpoint}`, {
            method,
            headers: requestHeaders,
            body: body ? JSON.stringify(body) : undefined,
        });

        const data = await response.json();

        if (!response.ok) {
            const error: any = new Error(data.error || 'Request failed');
            error.response = { data, status: response.status };
            throw error;
        }

        return { data };
    }

    async get<T>(endpoint: string): Promise<{ data: T }> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    async post<T>(endpoint: string, body: any): Promise<{ data: T }> {
        return this.request<T>(endpoint, { method: 'POST', body });
    }

    async put<T>(endpoint: string, body: any): Promise<{ data: T }> {
        return this.request<T>(endpoint, { method: 'PUT', body });
    }

    async delete<T>(endpoint: string): Promise<{ data: T }> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }
}

export const api = new ApiClient(API_URL);
