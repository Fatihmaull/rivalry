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
    const isProd = process.env['NODE_ENV'] === 'production';
    const isExternal = dbUrl.includes('supabase.com') || dbUrl.includes('onrender.com');

    // Force skip SSL verification for any non-local database
    const sslConfig = (isProd || isExternal || process.env['DB_SSL_NO_VERIFY'] === 'true')
      ? { rejectUnauthorized: false }
      : false;

    console.log('🔌 Prisma Connection Config:');
    console.log(`- SSL: ${JSON.stringify(sslConfig)}`);
    console.log(`- Connection URI: ${dbUrl.replace(/:[^:@]+@/, ':****@')}`);

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
