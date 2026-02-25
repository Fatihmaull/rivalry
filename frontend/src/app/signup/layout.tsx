import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sign Up — Rivalry',
    description: 'Create your Rivalry account and start competing. Set goals, find rivals, and earn prize credits.',
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
    return children;
}
