'use client';

import React, { createContext, useContext } from 'react';
import { useAuth, User } from '@/lib/auth-context';

interface AdminContextType {
    isAdmin: boolean;
    isSuperAdmin: boolean;
    adminUser: User | null;
    logout: () => Promise<void>;
    isLoading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
    const { user, logout: authLogout, isLoading } = useAuth();
    const isAdmin = !!user && (user.role === 'admin' || user.role === 'super-admin');
    const isSuperAdmin = !!user && user.role === 'super-admin';
    const adminUser = isAdmin ? user : null;
    const logout = async () => {
        await authLogout();
    };
    return (
        <AdminContext.Provider value={{ isAdmin, isSuperAdmin, adminUser, logout, isLoading }}>
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