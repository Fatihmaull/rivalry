import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// Use require() to bypass TypeScript module resolution issues in CI/CD (Render)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Pool } = require('pg');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaPg } = require('@prisma/adapter-pg');

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const isProd = process.env['NODE_ENV'] === 'production' || process.env['DATABASE_URL']?.includes('onrender.com') || process.env['DATABASE_URL']?.includes('supabase.com');

    const sslConfig = isProd
      ? { rejectUnauthorized: false }
      : (process.env['DB_SSL_NO_VERIFY'] === 'true' ? { rejectUnauthorized: false } : false);

    console.log(`🔌 Initializing Prisma with SSL: ${JSON.stringify(sslConfig)}`);

    const pool = new Pool({
      connectionString: process.env['DATABASE_URL'],
      ssl: sslConfig,
    });
    const adapter = new PrismaPg(pool);
    super({ adapter } as any);
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
