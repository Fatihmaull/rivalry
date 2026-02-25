import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Browse Rooms — Rivalry',
    description: 'Explore active competition rooms. Join challenges, deposit stakes, and compete head-to-head with your rivals.',
};

export default function RoomsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
