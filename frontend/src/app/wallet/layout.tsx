import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Wallet — Rivalry',
    description: 'Manage your Rivalry credits. Top up, withdraw, and view transaction history.',
};

export default function WalletLayout({ children }: { children: React.ReactNode }) {
    return children;
}
