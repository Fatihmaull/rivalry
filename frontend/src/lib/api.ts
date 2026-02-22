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

    private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
        const token = this.getToken();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...((options.headers as Record<string, string>) || {}),
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_URL}${path}`, {
            ...options,
            headers,
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({ message: 'Request failed' }));
            throw new Error(error.message || `HTTP ${res.status}`);
        }

        return res.json();
    }

    // Auth
    signup(data: { email: string; username: string; password: string }) {
        return this.request<any>('/auth/signup', { method: 'POST', body: JSON.stringify(data) });
    }

    login(data: { email: string; password: string }) {
        return this.request<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) });
    }

    getMe() {
        return this.request<any>('/auth/me');
    }

    // Users
    getUser(id: string) { return this.request<any>(`/users/${id}`); }
    searchUsers(q: string) { return this.request<any[]>(`/users/search?q=${encodeURIComponent(q)}`); }
    updateProfile(data: any) { return this.request<any>('/users/profile', { method: 'PUT', body: JSON.stringify(data) }); }
    followUser(id: string) { return this.request<any>(`/users/${id}/follow`, { method: 'POST' }); }
    unfollowUser(id: string) { return this.request<any>(`/users/${id}/follow`, { method: 'DELETE' }); }
    getUserStats(id: string) { return this.request<any>(`/users/${id}/stats`); }

    // Goals
    getGoals() { return this.request<any[]>('/goals'); }
    createGoal(data: any) { return this.request<any>('/goals', { method: 'POST', body: JSON.stringify(data) }); }
    getCategories() { return this.request<any[]>('/goals/categories'); }

    // Rooms
    listRooms(params?: { status?: string; type?: string; page?: number }) {
        const search = new URLSearchParams();
        if (params?.status) search.set('status', params.status);
        if (params?.type) search.set('type', params.type);
        if (params?.page) search.set('page', String(params.page));
        return this.request<any>(`/rooms?${search.toString()}`);
    }
    getRoom(id: string) { return this.request<any>(`/rooms/${id}`); }
    createRoom(data: any) { return this.request<any>('/rooms', { method: 'POST', body: JSON.stringify(data) }); }
    joinRoom(id: string) { return this.request<any>(`/rooms/${id}/join`, { method: 'POST' }); }
    completeRoom(id: string) { return this.request<any>(`/rooms/${id}/complete`, { method: 'POST' }); }
    getMyRooms() { return this.request<any[]>('/rooms/mine'); }

    // Matchmaking
    findRivals() { return this.request<any[]>('/matchmaking/rivals'); }
    sendInvite(data: { receiverId: string; goalId?: string; message?: string }) {
        return this.request<any>('/matchmaking/invite', { method: 'POST', body: JSON.stringify(data) });
    }
    getInvites() { return this.request<any[]>('/matchmaking/invites'); }

    // Proof
    submitProof(milestoneId: string, data: { type: string; content: string }) {
        return this.request<any>(`/proof/milestone/${milestoneId}`, { method: 'POST', body: JSON.stringify(data) });
    }

    // Wallet
    getWallet() { return this.request<any>('/wallet'); }
    topUp(amount: number) { return this.request<any>('/wallet/topup', { method: 'POST', body: JSON.stringify({ amount }) }); }
    withdraw(amount: number) { return this.request<any>('/wallet/withdraw', { method: 'POST', body: JSON.stringify({ amount }) }); }

    // Feed
    getFeed(page?: number) { return this.request<any[]>(`/feed?page=${page || 1}`); }
    createPost(data: { type: string; content: string }) {
        return this.request<any>('/feed', { method: 'POST', body: JSON.stringify(data) });
    }

    // Observer
    watchRoom(roomId: string) { return this.request<any>(`/observer/rooms/${roomId}/watch`, { method: 'POST' }); }
    tipRoom(roomId: string, amount: number) {
        return this.request<any>(`/observer/rooms/${roomId}/tip`, { method: 'POST', body: JSON.stringify({ amount }) });
    }

    // ─── Admin API ──────────────────────────────────────────
    adminGetStats() { return this.request<any>('/admin/dashboard'); }
    adminGetActivity(limit?: number) { return this.request<any>(`/admin/dashboard/activity?limit=${limit || 20}`); }
    adminGetGrowth() { return this.request<any>('/admin/dashboard/growth'); }

    adminGetUsers(params?: any) {
        const search = new URLSearchParams();
        if (params?.page) search.set('page', String(params.page));
        if (params?.limit) search.set('limit', String(params.limit));
        if (params?.search) search.set('search', params.search);
        if (params?.status) search.set('status', params.status);
        if (params?.role) search.set('role', params.role);
        if (params?.sort) search.set('sort', params.sort);
        return this.request<any>(`/admin/users?${search.toString()}`);
    }
    adminSuspendUser(id: string) { return this.request<any>(`/admin/users/${id}/suspend`, { method: 'POST' }); }
    adminBanUser(id: string) { return this.request<any>(`/admin/users/${id}/ban`, { method: 'POST' }); }
    adminActivateUser(id: string) { return this.request<any>(`/admin/users/${id}/activate`, { method: 'POST' }); }
    adminVerifyUser(id: string) { return this.request<any>(`/admin/users/${id}/verify`, { method: 'POST' }); }
    adminChangeRole(id: string, role: string) { return this.request<any>(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }); }
    adminResetWallet(id: string) { return this.request<any>(`/admin/users/${id}/reset-wallet`, { method: 'POST' }); }
    adminDeleteUser(id: string) { return this.request<any>(`/admin/users/${id}`, { method: 'DELETE' }); }
    adminRemoveFromRoom(userId: string, roomId: string) { return this.request<any>(`/admin/users/${userId}/rooms/${roomId}/remove`, { method: 'POST' }); }

    adminGetRooms(params?: any) {
        const search = new URLSearchParams();
        if (params?.page) search.set('page', String(params.page));
        if (params?.search) search.set('search', params.search);
        if (params?.status) search.set('status', params.status);
        if (params?.type) search.set('type', params.type);
        return this.request<any>(`/admin/rooms?${search.toString()}`);
    }
    adminCancelRoom(id: string) { return this.request<any>(`/admin/rooms/${id}/cancel`, { method: 'POST' }); }
    adminForceEndRoom(id: string) { return this.request<any>(`/admin/rooms/${id}/force-end`, { method: 'POST' }); }
    adminRefundRoom(id: string) { return this.request<any>(`/admin/rooms/${id}/refund`, { method: 'POST' }); }

    adminGetTransactions(params?: any) {
        const search = new URLSearchParams();
        if (params?.page) search.set('page', String(params.page));
        if (params?.type) search.set('type', params.type);
        if (params?.status) search.set('status', params.status);
        return this.request<any>(`/admin/transactions?${search.toString()}`);
    }
    adminFreezeWallet(userId: string) { return this.request<any>(`/admin/wallets/${userId}/freeze`, { method: 'POST' }); }
    adminUnfreezeWallet(userId: string) { return this.request<any>(`/admin/wallets/${userId}/unfreeze`, { method: 'POST' }); }
    adminReverseTransaction(id: string) { return this.request<any>(`/admin/transactions/${id}/reverse`, { method: 'POST' }); }
    adminFlagTransaction(id: string) { return this.request<any>(`/admin/transactions/${id}/flag`, { method: 'POST' }); }

    adminGetInterests() { return this.request<any[]>('/admin/interests'); }
    adminCreateInterest(data: any) { return this.request<any>('/admin/interests', { method: 'POST', body: JSON.stringify(data) }); }
    adminUpdateInterest(id: string, data: any) { return this.request<any>(`/admin/interests/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
    adminDeleteInterest(id: string) { return this.request<any>(`/admin/interests/${id}`, { method: 'DELETE' }); }

    adminGetAnalytics() { return this.request<any>('/admin/analytics'); }

    adminGetSystemSettings() { return this.request<any[]>('/admin/system'); }
    adminUpdateSetting(key: string, value: string) { return this.request<any>(`/admin/system/${key}`, { method: 'PUT', body: JSON.stringify({ value }) }); }

    adminGetAuditLogs(page?: number) { return this.request<any>(`/admin/audit-logs?page=${page || 1}`); }
}

export const api = new ApiClient();

