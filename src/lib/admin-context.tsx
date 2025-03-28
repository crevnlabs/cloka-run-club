'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { IUser } from '@/models/User';

interface AdminContextType {
    isAdmin: boolean;
    adminUser: IUser | null;
    checkAdminStatus: () => Promise<void>;
    logout: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminUser, setAdminUser] = useState<IUser | null>(null);
    const router = useRouter();

    const checkAdminStatus = async () => {
        try {
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

    useEffect(() => {
        checkAdminStatus();
    }, []);

    return (
        <AdminContext.Provider value={{ isAdmin, adminUser, checkAdminStatus, logout }}>
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
} 