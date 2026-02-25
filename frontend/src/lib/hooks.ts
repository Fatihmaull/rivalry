'use client';

import useSWR, { SWRConfiguration } from 'swr';
import { api } from './api';
import type {
    User,
    UserStats,
    Goal,
    Room,
    RoomListResponse,
    WalletData,
    Post,
    MatchInvite,
    RivalSuggestion,
} from './types';

const defaultConfig: SWRConfiguration = {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
    errorRetryCount: 3,
};

// ─── User Hooks ───────────────────────────────────────────
export function useMe(config?: SWRConfiguration) {
    return useSWR<User>(
        api.getToken() ? '/auth/me' : null,
        () => api.getMe(),
        { ...defaultConfig, ...config },
    );
}

export function useUser(id: string | undefined, config?: SWRConfiguration) {
    return useSWR<User>(
        id ? `/users/${id}` : null,
        () => api.getUser(id!),
        { ...defaultConfig, ...config },
    );
}

export function useUserStats(id: string | undefined, config?: SWRConfiguration) {
    return useSWR<UserStats>(
        id ? `/users/${id}/stats` : null,
        () => api.getUserStats(id!),
        { ...defaultConfig, ...config },
    );
}

// ─── Goal Hooks ───────────────────────────────────────────
export function useGoals(config?: SWRConfiguration) {
    return useSWR<Goal[]>(
        api.getToken() ? '/goals' : null,
        () => api.getGoals(),
        { ...defaultConfig, ...config },
    );
}

// ─── Room Hooks ───────────────────────────────────────────
export function useRoom(id: string | undefined, config?: SWRConfiguration) {
    return useSWR<Room>(
        id ? `/rooms/${id}` : null,
        () => api.getRoom(id!),
        { ...defaultConfig, refreshInterval: 10000, ...config },
    );
}

export function useRooms(params?: { status?: string; type?: string; page?: number }, config?: SWRConfiguration) {
    const key = params ? `/rooms?${JSON.stringify(params)}` : '/rooms';
    return useSWR<RoomListResponse>(
        key,
        () => api.listRooms(params),
        { ...defaultConfig, ...config },
    );
}

export function useMyRooms(config?: SWRConfiguration) {
    return useSWR<Room[]>(
        api.getToken() ? '/rooms/mine' : null,
        () => api.getMyRooms(),
        { ...defaultConfig, ...config },
    );
}

// ─── Wallet Hooks ─────────────────────────────────────────
export function useWallet(config?: SWRConfiguration) {
    return useSWR<WalletData>(
        api.getToken() ? '/wallet' : null,
        () => api.getWallet(),
        { ...defaultConfig, ...config },
    );
}

// ─── Feed Hooks ───────────────────────────────────────────
export function useFeed(page = 1, config?: SWRConfiguration) {
    return useSWR<Post[]>(
        api.getToken() ? `/feed?page=${page}` : null,
        () => api.getFeed(page),
        { ...defaultConfig, ...config },
    );
}

// ─── Matchmaking Hooks ────────────────────────────────────
export function useRivals(config?: SWRConfiguration) {
    return useSWR<RivalSuggestion[]>(
        api.getToken() ? '/matchmaking/rivals' : null,
        () => api.findRivals(),
        { ...defaultConfig, ...config },
    );
}

export function useInvites(config?: SWRConfiguration) {
    return useSWR<MatchInvite[]>(
        api.getToken() ? '/matchmaking/invites' : null,
        () => api.getInvites(),
        { ...defaultConfig, ...config },
    );
}
