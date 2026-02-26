import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
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

  // We intentionally remove onModuleInit containing await this.$connect().
  // Prisma will automatically connect to the database on the very first query.
  // Explicitly calling $connect() at startup blocks the NestJS bootstrap process
  // if the database is unreachable or slow, causing Render to kill the deploy
  // with a "Port scan timeout" because app.listen() is delayed.

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
