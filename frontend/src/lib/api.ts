import type {
    AuthResponse,
    User,
    UserStats,
    Goal,
    Room,
    RoomListResponse,
    WalletData,
    Post,
    MatchInvite,
    RivalSuggestion,
    ProofSubmission,
    AdminDashboardStats,
    AdminActivity,
    AdminGrowth,
    AdminUserParams,
    AdminRoomParams,
    AdminTransactionParams,
    PaginatedResponse,
    Interest,
    SystemSetting,
    AuditLogResponse,
    Transaction,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

class ApiClient {
    private token: string | null = null;

    setToken(token: string | null) {
        this.token = token;
        if (token) {
            if (typeof window !== 'undefined') localStorage.setItem('rivalry_token', token);
        } else {
            if (typeof window !== 'undefined') localStorage.removeItem('rivalry_token');
        }
    }

    getToken(): string | null {
        if (!this.token && typeof window !== 'undefined') {
            this.token = localStorage.getItem('rivalry_token');
        }
        return this.token;
    }

    private async request<T>(path: string, options: RequestInit = {}, retries = 3): Promise<T> {
        const token = this.getToken();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...((options.headers as Record<string, string>) || {}),
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        let lastError: Error | null = null;

        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                const res = await fetch(`${API_URL}${path}`, {
                    ...options,
                    headers,
                });

                if (!res.ok) {
                    const error = await res.json().catch(() => ({ message: 'Request failed' }));
                    // Don't retry 4xx client errors
                    if (res.status >= 400 && res.status < 500) {
                        throw new Error(error.message || `HTTP ${res.status}`);
                    }
                    throw new Error(error.message || `HTTP ${res.status}`);
                }

                return res.json();
            } catch (err) {
                lastError = err as Error;
                // Only retry on network errors or 5xx server errors
                if (attempt < retries - 1 && !lastError.message.match(/^(Unauthorized|Forbidden|Not Found|Bad Request)/)) {
                    await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 500));
                    continue;
                }
                break;
            }
        }

        throw lastError;
    }

    // Auth
    signup(data: { email: string; username: string; password: string }) {
        return this.request<AuthResponse>('/auth/signup', { method: 'POST', body: JSON.stringify(data) });
    }

    login(data: { email: string; password: string }) {
        return this.request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) });
    }

    getMe() {
        return this.request<User>('/auth/me');
    }

    // Users
    getUser(id: string) { return this.request<User>(`/users/${id}`); }
    searchUsers(q: string) { return this.request<User[]>(`/users/search?q=${encodeURIComponent(q)}`); }
    updateProfile(data: Partial<{ bio: string; avatarUrl: string; interests: string; skillLevel: string }>) {
        return this.request<User>('/users/profile', { method: 'PUT', body: JSON.stringify(data) });
    }
    followUser(id: string) { return this.request<{ message: string }>(`/users/${id}/follow`, { method: 'POST' }); }
    unfollowUser(id: string) { return this.request<{ message: string }>(`/users/${id}/follow`, { method: 'DELETE' }); }
    getUserStats(id: string) { return this.request<UserStats>(`/users/${id}/stats`); }

    // Goals
    getGoals() { return this.request<Goal[]>('/goals'); }
    createGoal(data: { category: string; title: string; description?: string; goalType: string; difficulty: string; timeline: string }) {
        return this.request<Goal>('/goals', { method: 'POST', body: JSON.stringify(data) });
    }
    getCategories() { return this.request<string[]>('/goals/categories'); }

    // Rooms
    listRooms(params?: { status?: string; type?: string; page?: number }) {
        const search = new URLSearchParams();
        if (params?.status) search.set('status', params.status);
        if (params?.type) search.set('type', params.type);
        if (params?.page) search.set('page', String(params.page));
        return this.request<RoomListResponse>(`/rooms?${search.toString()}`);
    }
    getRoom(id: string) { return this.request<Room>(`/rooms/${id}`); }
    createRoom(data: { title: string; description?: string; type: string; maxPlayers: number; entryDeposit: number; proofType: string; duration: string; goalId?: string }) {
        return this.request<Room>('/rooms', { method: 'POST', body: JSON.stringify(data) });
    }
    joinRoom(id: string) { return this.request<{ message: string }>(`/rooms/${id}/join`, { method: 'POST' }); }
    completeRoom(id: string) { return this.request<Room>(`/rooms/${id}/complete`, { method: 'POST' }); }
    getMyRooms() { return this.request<Room[]>('/rooms/mine'); }

    // Matchmaking
    findRivals() { return this.request<RivalSuggestion[]>('/matchmaking/rivals'); }
    sendInvite(data: { receiverId: string; goalId?: string; message?: string }) {
        return this.request<MatchInvite>('/matchmaking/invite', { method: 'POST', body: JSON.stringify(data) });
    }
    getInvites() { return this.request<MatchInvite[]>('/matchmaking/invites'); }

    // Proof
    submitProof(milestoneId: string, data: { type: string; content: string }) {
        return this.request<ProofSubmission>(`/proof/milestone/${milestoneId}`, { method: 'POST', body: JSON.stringify(data) });
    }

    // Wallet
    getWallet() { return this.request<WalletData>('/wallet'); }
    topUp(amount: number) { return this.request<WalletData>('/wallet/topup', { method: 'POST', body: JSON.stringify({ amount }) }); }
    withdraw(amount: number) { return this.request<WalletData>('/wallet/withdraw', { method: 'POST', body: JSON.stringify({ amount }) }); }

    // Feed
    getFeed(page?: number) { return this.request<Post[]>(`/feed?page=${page || 1}`); }
    createPost(data: { type: string; content: string }) {
        return this.request<Post>('/feed', { method: 'POST', body: JSON.stringify(data) });
    }

    // Observer
    watchRoom(roomId: string) { return this.request<{ message: string }>(`/observer/rooms/${roomId}/watch`, { method: 'POST' }); }
    tipRoom(roomId: string, amount: number) {
        return this.request<{ message: string }>(`/observer/rooms/${roomId}/tip`, { method: 'POST', body: JSON.stringify({ amount }) });
    }

    // ─── Admin API ──────────────────────────────────────────
    adminGetStats() { return this.request<AdminDashboardStats>('/admin/dashboard'); }
    adminGetActivity(limit?: number) { return this.request<AdminActivity[]>(`/admin/dashboard/activity?limit=${limit || 20}`); }
    adminGetGrowth() { return this.request<AdminGrowth>('/admin/dashboard/growth'); }

    adminGetUsers(params?: AdminUserParams) {
        const search = new URLSearchParams();
        if (params?.page) search.set('page', String(params.page));
        if (params?.limit) search.set('limit', String(params.limit));
        if (params?.search) search.set('search', params.search);
        if (params?.status) search.set('status', params.status);
        if (params?.role) search.set('role', params.role);
        if (params?.sort) search.set('sort', params.sort);
        return this.request<PaginatedResponse<User>>(`/admin/users?${search.toString()}`);
    }
    adminSuspendUser(id: string) { return this.request<User>(`/admin/users/${id}/suspend`, { method: 'POST' }); }
    adminBanUser(id: string) { return this.request<User>(`/admin/users/${id}/ban`, { method: 'POST' }); }
    adminActivateUser(id: string) { return this.request<User>(`/admin/users/${id}/activate`, { method: 'POST' }); }
    adminVerifyUser(id: string) { return this.request<User>(`/admin/users/${id}/verify`, { method: 'POST' }); }
    adminChangeRole(id: string, role: string) { return this.request<User>(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }); }
    adminResetWallet(id: string) { return this.request<{ message: string }>(`/admin/users/${id}/reset-wallet`, { method: 'POST' }); }
    adminDeleteUser(id: string) { return this.request<{ message: string }>(`/admin/users/${id}`, { method: 'DELETE' }); }
    adminRemoveFromRoom(userId: string, roomId: string) { return this.request<{ message: string }>(`/admin/users/${userId}/rooms/${roomId}/remove`, { method: 'POST' }); }

    adminGetRooms(params?: AdminRoomParams) {
        const search = new URLSearchParams();
        if (params?.page) search.set('page', String(params.page));
        if (params?.search) search.set('search', params.search);
        if (params?.status) search.set('status', params.status);
        if (params?.type) search.set('type', params.type);
        return this.request<PaginatedResponse<Room>>(`/admin/rooms?${search.toString()}`);
    }
    adminCancelRoom(id: string) { return this.request<Room>(`/admin/rooms/${id}/cancel`, { method: 'POST' }); }
    adminForceEndRoom(id: string) { return this.request<Room>(`/admin/rooms/${id}/force-end`, { method: 'POST' }); }
    adminRefundRoom(id: string) { return this.request<{ message: string }>(`/admin/rooms/${id}/refund`, { method: 'POST' }); }

    adminGetTransactions(params?: AdminTransactionParams) {
        const search = new URLSearchParams();
        if (params?.page) search.set('page', String(params.page));
        if (params?.type) search.set('type', params.type);
        if (params?.status) search.set('status', params.status);
        return this.request<PaginatedResponse<Transaction>>(`/admin/transactions?${search.toString()}`);
    }
    adminFreezeWallet(userId: string) { return this.request<{ message: string }>(`/admin/wallets/${userId}/freeze`, { method: 'POST' }); }
    adminUnfreezeWallet(userId: string) { return this.request<{ message: string }>(`/admin/wallets/${userId}/unfreeze`, { method: 'POST' }); }
    adminReverseTransaction(id: string) { return this.request<Transaction>(`/admin/transactions/${id}/reverse`, { method: 'POST' }); }
    adminFlagTransaction(id: string) { return this.request<Transaction>(`/admin/transactions/${id}/flag`, { method: 'POST' }); }

    adminGetInterests() { return this.request<Interest[]>('/admin/interests'); }
    adminCreateInterest(data: { name: string; description?: string; icon?: string; color?: string }) {
        return this.request<Interest>('/admin/interests', { method: 'POST', body: JSON.stringify(data) });
    }
    adminUpdateInterest(id: string, data: Partial<{ name: string; description: string; icon: string; color: string; isActive: boolean }>) {
        return this.request<Interest>(`/admin/interests/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    }
    adminDeleteInterest(id: string) { return this.request<{ message: string }>(`/admin/interests/${id}`, { method: 'DELETE' }); }

    adminGetAnalytics() { return this.request<Record<string, unknown>>('/admin/analytics'); }

    adminGetSystemSettings() { return this.request<SystemSetting[]>('/admin/system'); }
    adminUpdateSetting(key: string, value: string) { return this.request<SystemSetting>(`/admin/system/${key}`, { method: 'PUT', body: JSON.stringify({ value }) }); }

    adminGetAuditLogs(page?: number) { return this.request<AuditLogResponse>(`/admin/audit-logs?page=${page || 1}`); }
}

export const api = new ApiClient();
