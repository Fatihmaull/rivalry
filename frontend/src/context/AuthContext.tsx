'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../lib/api';

interface User {
    id: string;
    email: string;
    username: string;
    avatarUrl?: string;
    bio?: string;
    role?: string;
    status?: string;
    isVerified?: boolean;
    profile?: any;
    wallet?: any;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<any>;
    signup: (email: string, username: string, password: string) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = api.getToken();
        if (token) {
            api.getMe()
                .then(setUser)
                .catch(() => {
                    api.setToken(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email: string, password: string) => {
        const res = await api.login({ email, password });
        api.setToken(res.accessToken);
        setUser(res.user);
        return res;
    };

    const signup = async (email: string, username: string, password: string) => {
        const res = await api.signup({ email, username, password });
        api.setToken(res.accessToken);
        setUser(res.user);
    };

    const logout = () => {
        api.setToken(null);
        setUser(null);
    };

    const refreshUser = async () => {
        try {
            const u = await api.getMe();
            setUser(u);
        } catch { }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be inside AuthProvider');
    return ctx;
}
