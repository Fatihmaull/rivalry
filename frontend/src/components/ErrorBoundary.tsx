'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('ErrorBoundary caught:', error, info.componentStack);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="page container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="glass-card animate-slide-up" style={{ maxWidth: '500px', width: '100%', padding: '48px', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💥</div>
                        <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Something went wrong</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>
                            {this.state.error?.message || 'An unexpected error occurred'}
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button className="btn btn-primary" onClick={this.handleReset}>
                                Try Again
                            </button>
                            <button className="btn btn-outline" onClick={() => window.location.href = '/'}>
                                Go Home
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
