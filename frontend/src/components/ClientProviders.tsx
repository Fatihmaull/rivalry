'use client';

import { AuthProvider } from '../context/AuthContext';
import Navbar from './Navbar';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <Navbar />
            <main className="main-content">
                {children}
            </main>
        </AuthProvider>
    );
}
