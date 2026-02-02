/**
 * Reusable UI Components
 */

'use client';

import React from 'react';

// ============================================
// BUTTON
// ============================================
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    children: React.ReactNode;
}

export function Button({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    className = '',
    children,
    disabled,
    ...props
}: ButtonProps) {
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-all rounded-xl';

    const variantClasses = {
        primary: 'gradient-primary text-white hover:opacity-90',
        secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
        danger: 'bg-red-500 text-white hover:bg-red-600',
        ghost: 'bg-transparent hover:bg-gray-100 text-gray-600',
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''
                } ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <>
                    <div className="loading-dot !w-2 !h-2 mr-2"></div>
                    <div className="loading-dot !w-2 !h-2 mr-2"></div>
                    <div className="loading-dot !w-2 !h-2"></div>
                </>
            ) : (
                children
            )}
        </button>
    );
}

// ============================================
// INPUT
// ============================================
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                </label>
            )}
            <input
                className={`w-full px-4 py-3 border rounded-xl transition-all outline-none ${error
                        ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                        : 'border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
                    } ${className}`}
                {...props}
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    );
}

// ============================================
// CARD
// ============================================
interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export function Card({ children, className = '', onClick }: CardProps) {
    return (
        <div
            className={`bg-white rounded-2xl border border-gray-200 shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
                } ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
}

// ============================================
// BADGE
// ============================================
interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
    const variantClasses = {
        default: 'bg-gray-100 text-gray-700',
        success: 'bg-green-100 text-green-700',
        warning: 'bg-yellow-100 text-yellow-700',
        danger: 'bg-red-100 text-red-700',
        info: 'bg-blue-100 text-blue-700',
    };

    return (
        <span
            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${variantClasses[variant]}`}
        >
            {children}
        </span>
    );
}

// ============================================
// SPINNER
// ============================================
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    };

    return (
        <div className={`${sizeClasses[size]} animate-spin`}>
            <svg viewBox="0 0 24 24" fill="none" className="text-primary-600">
                <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="opacity-25"
                />
                <path
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
            </svg>
        </div>
    );
}

// ============================================
// EMPTY STATE
// ============================================
interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            {icon && <div className="mb-4 text-gray-400">{icon}</div>}
            <h3 className="text-lg font-medium text-gray-800 mb-1">{title}</h3>
            {description && <p className="text-gray-500 mb-4">{description}</p>}
            {action}
        </div>
    );
}

// ============================================
// LOADING OVERLAY
// ============================================
export function LoadingOverlay({ message = 'Đang tải...' }: { message?: string }) {
    return (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center">
                <div className="flex justify-center mb-4">
                    <div className="loading-dot"></div>
                    <div className="loading-dot mx-1"></div>
                    <div className="loading-dot"></div>
                </div>
                <p className="text-gray-600">{message}</p>
            </div>
        </div>
    );
}

// ============================================
// TOAST (Simple)
// ============================================
interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'info';
    onClose: () => void;
}

export function Toast({ message, type = 'info', onClose }: ToastProps) {
    const typeClasses = {
        success: 'bg-green-50 border-green-200 text-green-700',
        error: 'bg-red-50 border-red-200 text-red-700',
        info: 'bg-blue-50 border-blue-200 text-blue-700',
    };

    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
    };

    return (
        <div
            className={`fixed bottom-4 right-4 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${typeClasses[type]} animate-in fade-in slide-in-from-bottom z-50`}
        >
            <span className="text-lg">{icons[type]}</span>
            <span>{message}</span>
            <button onClick={onClose} className="ml-2 hover:opacity-70">
                ✕
            </button>
        </div>
    );
}
