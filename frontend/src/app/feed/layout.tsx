import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Community Feed — Rivalry',
    description: 'See what other competitors are up to. Follow progress updates, milestone completions, and competition results.',
};

export default function FeedLayout({ children }: { children: React.ReactNode }) {
    return children;
}
