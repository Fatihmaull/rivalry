import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Find Rivals — Rivalry',
    description: 'Get matched with rivals pursuing similar goals. Compete head-to-head and stay accountable.',
};

export default function MatchmakingLayout({ children }: { children: React.ReactNode }) {
    return children;
}
