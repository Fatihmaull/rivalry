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
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL_NO_VERIFY === 'true'
        ? { rejectUnauthorized: false }
        : { sslmode: 'require' },
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
