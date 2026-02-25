// ─── Shared TypeScript Interfaces ─────────────────────────
// These types mirror the Prisma models and API responses

// ─── User & Profile ──────────────────────────────────────
export interface UserProfile {
    id: string;
    userId: string;
    interests: string;
    skillLevel: string;
    reputationScore: number;
    totalWins: number;
    totalLosses: number;
    totalCompleted: number;
    totalPrizeWon: number | string;
    consistencyScore: number;
    createdAt: string;
    updatedAt: string;
}

export interface User {
    id: string;
    email: string;
    username: string;
    avatarUrl?: string;
    bio?: string;
    role: string;
    status: string;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
    profile?: UserProfile;
    wallet?: WalletData;
    _count?: {
        followers: number;
        following: number;
    };
}

export interface UserStats {
    totalWins: number;
    totalLosses: number;
    totalCompleted: number;
    totalPrizeWon: number | string;
    reputationScore: number;
    consistencyScore: number;
    activeRooms: number;
    followers: number;
    following: number;
}

// ─── Auth ─────────────────────────────────────────────────
export interface AuthResponse {
    accessToken: string;
    user: User;
}

// ─── Wallet & Transactions ────────────────────────────────
export interface Transaction {
    id: string;
    walletId: string;
    type: string;
    amount: number | string;
    description?: string;
    roomId?: string;
    status: string;
    createdAt: string;
}

export interface WalletData {
    id: string;
    userId: string;
    balance: number | string;
    isFrozen: boolean;
    createdAt: string;
    updatedAt: string;
    transactions: Transaction[];
}

// ─── Goals ────────────────────────────────────────────────
export interface Goal {
    id: string;
    userId: string;
    category: string;
    title: string;
    description?: string;
    goalType: string;
    difficulty: string;
    timeline: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// ─── Rooms ────────────────────────────────────────────────
export interface Participant {
    id: string;
    roomId: string;
    userId: string;
    status: string;
    progress: number;
    rank?: number;
    joinedAt: string;
    updatedAt: string;
    user?: User;
}

export interface Milestone {
    id: string;
    roadmapId: string;
    title: string;
    description?: string;
    weekNumber: number;
    orderIndex: number;
    createdAt: string;
    substeps?: Substep[];
    proofs?: ProofSubmission[];
}

export interface Substep {
    id: string;
    milestoneId: string;
    title: string;
    isCompleted: boolean;
    createdAt: string;
}

export interface Roadmap {
    id: string;
    roomId: string;
    title: string;
    milestones: Milestone[];
}

export interface Room {
    id: string;
    creatorId: string;
    goalId?: string;
    title: string;
    description?: string;
    type: string;
    status: string;
    maxPlayers: number;
    entryDeposit: number | string;
    prizePool: number | string;
    proofType: string;
    duration: string;
    startDate?: string;
    endDate?: string;
    winnerId?: string;
    createdAt: string;
    updatedAt: string;
    creator?: User;
    participants?: Participant[];
    roadmap?: Roadmap;
    _count?: {
        participants: number;
        observers: number;
    };
}

export interface RoomListResponse {
    rooms: Room[];
    total: number;
    page: number;
    totalPages: number;
}

// ─── Proof ────────────────────────────────────────────────
export interface ProofSubmission {
    id: string;
    milestoneId: string;
    userId: string;
    type: string;
    content: string;
    fileUrl?: string;
    status: string;
    createdAt: string;
}

// ─── Feed ─────────────────────────────────────────────────
export interface Comment {
    id: string;
    postId: string;
    userId: string;
    content: string;
    createdAt: string;
    user?: User;
}

export interface Post {
    id: string;
    userId: string;
    type: string;
    content: string;
    imageUrl?: string;
    roomId?: string;
    createdAt: string;
    updatedAt: string;
    user?: User;
    comments?: Comment[];
}

// ─── Matchmaking ──────────────────────────────────────────
export interface MatchInvite {
    id: string;
    senderId: string;
    receiverId: string;
    goalId?: string;
    roomId?: string;
    status: string;
    message?: string;
    createdAt: string;
    updatedAt: string;
    sender?: User;
    receiver?: User;
}

export interface RivalSuggestion {
    user: User;
    score: number;
    sharedGoals: string[];
}

// ─── Admin ────────────────────────────────────────────────
export interface AdminDashboardStats {
    totalUsers: number;
    totalRooms: number;
    totalTransactions: number;
    activeRooms: number;
    totalPrizePool: number;
    newUsersToday: number;
}

export interface AdminActivity {
    id: string;
    type: string;
    description: string;
    createdAt: string;
}

export interface AdminGrowth {
    users: { date: string; count: number }[];
    rooms: { date: string; count: number }[];
    revenue: { date: string; amount: number }[];
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    totalPages: number;
}

export interface AdminUserParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    role?: string;
    sort?: string;
}

export interface AdminRoomParams {
    page?: number;
    search?: string;
    status?: string;
    type?: string;
}

export interface AdminTransactionParams {
    page?: number;
    type?: string;
    status?: string;
}

// ─── Interests ────────────────────────────────────────────
export interface Interest {
    id: string;
    name: string;
    description?: string;
    icon: string;
    color: string;
    popularityScore: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// ─── System Settings ──────────────────────────────────────
export interface SystemSetting {
    id: string;
    key: string;
    value: string;
    updatedBy?: string;
    createdAt: string;
    updatedAt: string;
}

// ─── Audit Logs ───────────────────────────────────────────
export interface AuditLog {
    id: string;
    adminId: string;
    action: string;
    targetType: string;
    targetId?: string;
    details?: string;
    createdAt: string;
    admin?: User;
}

export interface AuditLogResponse {
    logs: AuditLog[];
    total: number;
    page: number;
    totalPages: number;
}
