import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Dashboard — Rivalry',
    description: 'View your active competitions, goals, stats, and progress. Track wins, prize earnings, and rival matchups.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return children;
}
