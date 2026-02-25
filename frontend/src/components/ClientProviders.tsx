'use client';

import { AuthProvider } from '../context/AuthContext';
import ErrorBoundary from './ErrorBoundary';
import Navbar from './Navbar';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <Navbar />
                <main className="main-content">
                    {children}
                </main>
            </AuthProvider>
        </ErrorBoundary>
    );
}
