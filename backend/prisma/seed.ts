import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaBetterSqlite3({ url: process.env['DATABASE_URL'] || 'file:./dev.db' });
const prisma = new PrismaClient({ adapter } as any);

// ─── Data pools ─────────────────────────────────────────────
const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Quinn', 'Avery', 'Harper', 'Sage', 'Dakota', 'Phoenix', 'River', 'Skyler', 'Blake', 'Cameron', 'Drew', 'Emery', 'Finley', 'Gray', 'Hayden', 'Indi', 'Jamie', 'Kai', 'Lane', 'Marley', 'Noah', 'Oakley', 'Parker', 'Reese', 'Sam', 'Tatum', 'Val', 'Wren', 'Zara', 'Eli', 'Mika', 'Luca', 'Remy', 'Ari', 'Jude', 'Eden', 'Cole', 'Dev', 'Ash', 'Ezra', 'Rowan', 'Soren', 'Tess', 'Nyx'];
const lastNames = ['Chen', 'Patel', 'Kim', 'Silva', 'Nguyen', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Martinez', 'Davis', 'Lopez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts', 'Gomez'];
const domains = ['gmail.com', 'outlook.com', 'proton.me', 'icloud.com', 'yahoo.com'];
const bios = [
    'Hustle harder 💪', 'Building the future 🚀', 'Code. Build. Repeat.', 'Fitness enthusiast & coder', 'Never stop learning 📚',
    'Startup founder in progress', 'Data-driven achiever', 'Creative problem solver', 'Goal crusher 🎯', 'Competitive by nature',
    'AI researcher & maker', 'Full stack developer', 'Content creator & influencer', 'Finance nerd 💰', 'Sports & tech lover',
    'Digital nomad adventurer', 'Open source contributor', 'Product designer & builder', 'Growth hacker', 'Self-improvement junkie',
];
const skillLevels = ['beginner', 'intermediate', 'advanced'];
const categories = ['fitness', 'programming', 'business', 'learning', 'content_creation', 'career', 'finance', 'sports', 'ai', 'startup', 'marketing', 'writing', 'productivity', 'design', 'cybersecurity', 'public_speaking', 'trading', 'research', 'mental_health', 'reading'];
const goalTypes = ['habit', 'project', 'skill', 'challenge'];
const difficulties = ['easy', 'medium', 'hard', 'extreme'];
const timelines = ['1_week', '2_weeks', '1_month', '3_months'];
const roomTypes = ['1v1', 'group', 'free_for_all'];
const proofTypes = ['photo', 'link', 'text', 'any'];
const roomStatuses = ['waiting', 'active', 'completed', 'disputed'];
const roomTitles = [
    '100 Pushups Daily Challenge', '30-Day Code Sprint', 'Read 12 Books Challenge', 'Build a SaaS in 30 Days',
    'Morning Run Streak', 'Learn React in 2 Weeks', 'Trading Bootcamp', 'Content Creation Marathon',
    'Meditation Habit Builder', 'Portfolio Website Sprint', 'Gym 5x/Week Challenge', 'Daily Writing 1000 Words',
    '10K Steps Daily', 'Public Speaking Mastery', 'Finance Tracker Build', 'Design System Challenge',
    'Cybersecurity CTF Prep', 'Research Paper Sprint', 'Mental Health Journaling', 'Language Learning Race',
    'Startup MVP Sprint', 'Marketing Campaign Battle', 'Podcast Launch Challenge', 'Full Stack Project Race',
    'Data Science Competition', 'Algorithm Grinding', 'Open Source Contribution Sprint', 'Freelance Hustle Challenge',
    'Photography 365 Project', 'Cooking Skill Challenge', 'Drawing Daily Practice', 'Music Production Sprint',
];

const interestsData = [
    { name: 'Fitness', description: 'Physical training, workouts, and health goals', icon: '💪', color: '#ef4444' },
    { name: 'Programming', description: 'Software development and coding challenges', icon: '💻', color: '#3b82f6' },
    { name: 'AI', description: 'Artificial intelligence and machine learning', icon: '🤖', color: '#8b5cf6' },
    { name: 'Startup', description: 'Building and launching new businesses', icon: '🚀', color: '#f97316' },
    { name: 'Finance', description: 'Personal finance, investing, and wealth building', icon: '💰', color: '#22c55e' },
    { name: 'Marketing', description: 'Digital marketing and growth strategies', icon: '📢', color: '#ec4899' },
    { name: 'Writing', description: 'Content writing, blogging, and copywriting', icon: '✍️', color: '#14b8a6' },
    { name: 'Productivity', description: 'Time management and efficiency systems', icon: '⚡', color: '#eab308' },
    { name: 'Language Learning', description: 'Learning new languages and communication skills', icon: '🌍', color: '#06b6d4' },
    { name: 'Design', description: 'UI/UX design, graphic design, and visual arts', icon: '🎨', color: '#d946ef' },
    { name: 'Cybersecurity', description: 'Security research, CTFs, and ethical hacking', icon: '🔒', color: '#64748b' },
    { name: 'Public Speaking', description: 'Presentation skills and communication mastery', icon: '🎤', color: '#f43f5e' },
    { name: 'Sports Training', description: 'Athletic training and sports performance', icon: '🏆', color: '#84cc16' },
    { name: 'Entrepreneurship', description: 'Business development and leadership', icon: '📊', color: '#a855f7' },
    { name: 'Trading', description: 'Stock and crypto trading strategies', icon: '📈', color: '#10b981' },
    { name: 'Research', description: 'Academic and scientific research projects', icon: '🔬', color: '#6366f1' },
    { name: 'Career Growth', description: 'Professional development and career advancement', icon: '💼', color: '#0ea5e9' },
    { name: 'Mental Health', description: 'Mindfulness, meditation, and mental wellness', icon: '🧠', color: '#f59e0b' },
    { name: 'Reading Challenge', description: 'Book reading goals and literature exploration', icon: '📚', color: '#8b5cf6' },
    { name: 'Skill Building', description: 'Learning new practical skills and crafts', icon: '🛠️', color: '#78716c' },
];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randFloat(min: number, max: number) { return +(Math.random() * (max - min) + min).toFixed(2); }

async function main() {
    console.log('🌱 Seeding database...');

    // ─── Create 20 Interests ──────────────────────────────────
    console.log('  Creating 20 interests...');
    for (const data of interestsData) {
        await prisma.interest.upsert({
            where: { name: data.name },
            update: {},
            create: { ...data, popularityScore: rand(10, 500) },
        });
    }

    // ─── Create System Settings ───────────────────────────────
    console.log('  Creating system settings...');
    const settingsData = [
        { key: 'platform_fee_percent', value: '5' },
        { key: 'min_entry_fee', value: '1' },
        { key: 'max_deposit', value: '1000' },
        { key: 'maintenance_mode', value: 'false' },
        { key: 'platform_active', value: 'true' },
    ];
    for (const s of settingsData) {
        await prisma.systemSettings.upsert({ where: { key: s.key }, update: {}, create: s });
    }

    // ─── Create 100 Users ─────────────────────────────────────
    console.log('  Creating 100 users...');
    const passwordHash = await bcrypt.hash('password123', 10);
    const userIds: string[] = [];

    // Super admin
    const superAdmin = await prisma.user.create({
        data: {
            email: 'admin@rivalry.app',
            username: 'superadmin',
            passwordHash,
            bio: 'Platform administrator',
            role: 'super_admin',
            status: 'active',
            isVerified: true,
            profile: { create: { skillLevel: 'advanced', reputationScore: 1000, totalWins: 50, totalLosses: 5, totalCompleted: 55, totalPrizeWon: 5000, consistencyScore: 95, interests: JSON.stringify(['Startup', 'Programming', 'AI']) } },
            wallet: { create: { balance: 10000 } },
        },
    });
    userIds.push(superAdmin.id);

    // Admin user
    const admin = await prisma.user.create({
        data: {
            email: 'mod@rivalry.app',
            username: 'admin_mod',
            passwordHash,
            bio: 'Community moderator',
            role: 'admin',
            status: 'active',
            isVerified: true,
            profile: { create: { skillLevel: 'advanced', reputationScore: 800, totalWins: 30, totalLosses: 10, totalCompleted: 40, totalPrizeWon: 2500, consistencyScore: 85, interests: JSON.stringify(['Fitness', 'Marketing']) } },
            wallet: { create: { balance: 5000 } },
        },
    });
    userIds.push(admin.id);

    // 98 regular users with varying profiles
    for (let i = 0; i < 98; i++) {
        const fn = pick(firstNames);
        const ln = pick(lastNames);
        const username = `${fn.toLowerCase()}${ln.toLowerCase()}${rand(1, 999)}`;
        const isTopPerformer = i < 10;
        const isInactive = i >= 80 && i < 90;
        const isSuspended = i >= 90 && i < 95;

        const wins = isTopPerformer ? rand(20, 80) : isInactive ? rand(0, 3) : rand(0, 25);
        const losses = isTopPerformer ? rand(2, 10) : rand(0, 15);
        const completed = wins + losses + rand(0, 5);
        const rep = isTopPerformer ? rand(600, 999) : isInactive ? rand(0, 50) : rand(50, 500);
        const balance = isTopPerformer ? randFloat(500, 5000) : isInactive ? randFloat(0, 50) : randFloat(10, 1000);
        const prizeWon = isTopPerformer ? randFloat(1000, 10000) : randFloat(0, 500);

        const userInterests = [];
        const numInterests = rand(1, 4);
        for (let j = 0; j < numInterests; j++) {
            userInterests.push(pick(interestsData).name);
        }

        try {
            const user = await prisma.user.create({
                data: {
                    email: `${username}@${pick(domains)}`,
                    username,
                    passwordHash,
                    bio: pick(bios),
                    role: 'user',
                    status: isSuspended ? 'suspended' : 'active',
                    isVerified: isTopPerformer || Math.random() > 0.5,
                    profile: {
                        create: {
                            skillLevel: isTopPerformer ? 'advanced' : pick(skillLevels),
                            reputationScore: rep,
                            totalWins: wins,
                            totalLosses: losses,
                            totalCompleted: completed,
                            totalPrizeWon: prizeWon,
                            consistencyScore: isTopPerformer ? randFloat(70, 99) : randFloat(10, 80),
                            interests: JSON.stringify(userInterests),
                        },
                    },
                    wallet: { create: { balance } },
                },
            });
            userIds.push(user.id);
        } catch {
            // skip duplicate username
        }
    }

    console.log(`  Created ${userIds.length} users`);

    // ─── Create Goals for Users ───────────────────────────────
    console.log('  Creating goals...');
    const goalIds: string[] = [];
    for (let i = 0; i < Math.min(userIds.length, 60); i++) {
        const numGoals = rand(1, 3);
        for (let g = 0; g < numGoals; g++) {
            const goal = await prisma.goal.create({
                data: {
                    userId: userIds[i],
                    category: pick(categories),
                    title: `${pick(['Master', 'Build', 'Complete', 'Achieve', 'Launch', 'Learn'])} ${pick(['React', 'Fitness', 'Trading', 'Writing', 'Design', 'AI', 'Marketing', 'Finance'])} ${pick(['Sprint', 'Challenge', 'Goal', 'Project'])}`,
                    description: 'Working hard towards this goal!',
                    goalType: pick(goalTypes),
                    difficulty: pick(difficulties),
                    timeline: pick(timelines),
                    isActive: Math.random() > 0.2,
                },
            });
            goalIds.push(goal.id);
        }
    }

    // ─── Create 100 Competition Rooms ─────────────────────────
    console.log('  Creating 100 rooms...');
    const roomIds: string[] = [];
    for (let i = 0; i < 100; i++) {
        const status = pick(roomStatuses);
        const type = pick(roomTypes);
        const maxPlayers = type === '1v1' ? 2 : type === 'group' ? rand(3, 6) : rand(4, 10);
        const deposit = pick([0, 5, 10, 25, 50, 100, 200]);
        const creatorId = pick(userIds);
        const goalId = goalIds.length > 0 && Math.random() > 0.3 ? pick(goalIds) : null;
        const duration = pick(timelines);

        const startDate = status !== 'waiting' ? new Date(Date.now() - rand(1, 30) * 86400000) : null;
        const endDate = status === 'completed' ? new Date(Date.now() - rand(0, 5) * 86400000) : null;

        const room = await prisma.room.create({
            data: {
                creatorId,
                goalId,
                title: pick(roomTitles) + (i > roomTitles.length ? ` #${i}` : ''),
                description: `Competition room for ${pick(categories)} enthusiasts. ${pick(['Join now!', 'Show what you got!', 'Prove yourself!', 'Let\'s compete!'])}`,
                type,
                status,
                maxPlayers,
                entryDeposit: deposit,
                prizePool: deposit * rand(2, maxPlayers),
                proofType: pick(proofTypes),
                duration,
                startDate,
                endDate,
            },
        });
        roomIds.push(room.id);

        // Add participants
        const numParticipants = Math.min(rand(2, maxPlayers), userIds.length);
        const shuffled = [...userIds].sort(() => Math.random() - 0.5);
        const participantIds = shuffled.slice(0, numParticipants);

        if (!participantIds.includes(creatorId)) participantIds[0] = creatorId;

        for (const uid of participantIds) {
            try {
                await prisma.participant.create({
                    data: {
                        roomId: room.id,
                        userId: uid,
                        status: status === 'completed' ? 'completed' : 'active',
                        progress: status === 'completed' ? 100 : status === 'active' ? randFloat(0, 90) : 0,
                        rank: status === 'completed' ? rand(1, numParticipants) : null,
                    },
                });
            } catch {
                // skip duplicate participant
            }
        }

        // Create roadmap + milestones for active/completed rooms
        if (status === 'active' || status === 'completed') {
            const roadmap = await prisma.roadmap.create({
                data: {
                    roomId: room.id,
                    title: `Roadmap for ${room.title}`,
                    milestones: {
                        create: Array.from({ length: rand(3, 6) }, (_, idx) => ({
                            title: `Week ${idx + 1} Milestone`,
                            description: `Complete the tasks for week ${idx + 1}`,
                            weekNumber: idx + 1,
                            orderIndex: idx,
                        })),
                    },
                },
            });
        }
    }

    // ─── Create Transactions ──────────────────────────────────
    console.log('  Creating transactions...');
    const txTypes = ['top_up', 'deposit', 'withdrawal', 'prize', 'tip', 'platform_fee'];
    for (let i = 0; i < 200; i++) {
        const userId = pick(userIds);
        const wallet = await prisma.wallet.findUnique({ where: { userId } });
        if (!wallet) continue;
        const type = pick(txTypes);
        const amount = type === 'platform_fee' ? -randFloat(1, 20) : type === 'withdrawal' ? -randFloat(10, 100) : randFloat(5, 200);

        await prisma.transaction.create({
            data: {
                walletId: wallet.id,
                type,
                amount,
                description: `${type.replace('_', ' ')} transaction`,
                status: Math.random() > 0.05 ? 'completed' : pick(['pending', 'flagged']),
                roomId: Math.random() > 0.5 && roomIds.length > 0 ? pick(roomIds) : null,
            },
        });
    }

    // ─── Create Posts ─────────────────────────────────────────
    console.log('  Creating feed posts...');
    const postContents = [
        'Just completed my first milestone! 🎉', 'Looking for a rival in fitness 💪', 'Joined an intense coding competition 🔥',
        'My trading strategy is paying off 📈', 'Day 15 of my morning run streak 🏃', 'Built my first full-stack app today!',
        'Meditation is changing my life 🧘', 'Published my 10th blog post ✍️', 'Hit 100 pushups today!', 'Loving this platform!',
    ];
    for (let i = 0; i < 50; i++) {
        await prisma.post.create({
            data: {
                userId: pick(userIds),
                type: pick(['challenge', 'progress', 'invitation', 'update']),
                content: pick(postContents),
                roomId: Math.random() > 0.5 && roomIds.length > 0 ? pick(roomIds) : null,
            },
        });
    }

    // ─── Create Follow Relationships ──────────────────────────
    console.log('  Creating follow relationships...');
    for (let i = 0; i < 150; i++) {
        const followerId = pick(userIds);
        const followingId = pick(userIds);
        if (followerId === followingId) continue;
        try {
            await prisma.follow.create({ data: { followerId, followingId } });
        } catch { /* skip duplicates */ }
    }

    console.log('✅ Seed complete!');
    console.log(`   ${userIds.length} users | ${roomIds.length} rooms | ${interestsData.length} interests`);
    console.log(`   Admin login: admin@rivalry.app / password123`);
    console.log(`   Super admin: admin@rivalry.app / password123`);
}

main()
    .catch((e) => { console.error('Seed failed:', e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
