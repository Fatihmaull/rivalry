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
    const dbUrl = process.env['DATABASE_URL'] || '';

    // External databases (Render/Supabase) require skipping verification
    const sslConfig = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1')
      ? false
      : { rejectUnauthorized: false };

    console.log('🔌 Prisma Connection Config:');
    console.log(`- SSL Reject: ${sslConfig ? (sslConfig as any).rejectUnauthorized : 'false'}`);

    const pool = new Pool({
      connectionString: dbUrl,
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
