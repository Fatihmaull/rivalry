import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Log In — Rivalry',
    description: 'Sign in to your Rivalry account to compete, track goals, and earn prizes.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
    return children;
}
