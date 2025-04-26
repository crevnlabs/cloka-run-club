'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import type { IUser } from '@/models/User';

interface AdminContextType {
    isAdmin: boolean;
    adminUser: IUser | null;
    checkAdminStatus: () => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminUser, setAdminUser] = useState<IUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();

    const checkAdminStatus = async () => {
        try {
            // If not authenticated in main context, we're definitely not admin
            if (!isAuthenticated || !user) {
                setIsAdmin(false);
                setAdminUser(null);
                setIsLoading(false);
                return;
            }

            const response = await fetch('/api/admin/check-status');
            const data = await response.json();

            if (data.success && data.user) {
                setIsAdmin(true);
                setAdminUser(data.user);
            } else {
                setIsAdmin(false);
                setAdminUser(null);
            }
        } catch (error) {
            console.error('Error checking admin status:', error);
            setIsAdmin(false);
            setAdminUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await fetch('/api/admin/logout', { method: 'POST' });
            setIsAdmin(false);
            setAdminUser(null);
            router.push('/admin/login');
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    // Check admin status when main auth state changes
    useEffect(() => {
        checkAdminStatus();
    }, [isAuthenticated, user]);

    return (
        <AdminContext.Provider value={{ isAdmin, adminUser, checkAdminStatus, logout, isLoading }}>
            {children}
        </AdminContext.Provider>
    );
}

// Custom hook to use the admin context
export function useAdmin() {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
} 