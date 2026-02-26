import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      datasources: {
        db: {
          url: PrismaService.getOptimizedDatabaseUrl(),
        },
      },
    });
  }

  private static getOptimizedDatabaseUrl(): string | undefined {
    let url = process.env.DATABASE_URL;
    if (!url) return undefined;

    // Force IPv4 for Supabase pooler to avoid IPv6 timeouts on Render
    if (url.includes('pooler.supabase.com') && !url.includes('ipv4.pooler.supabase.com')) {
      url = url.replace('pooler.supabase.com', 'ipv4.pooler.supabase.com');
    }

    // Add pgbouncer=true for Supabase pooler on port 6543
    if (url.includes(':6543') && !url.includes('pgbouncer=true')) {
      url += (url.includes('?') ? '&' : '?') + 'pgbouncer=true';
    }

    return url;
  }

  async onModuleInit() {
    this.logger.log('Connecting to PostgreSQL database via Prisma...');
    try {
      await this.$connect();
      this.logger.log('Successfully connected to the database.');
    } catch (error) {
      this.logger.error('Failed to connect to the database', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
