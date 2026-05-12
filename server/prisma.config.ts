// Minimal Prisma config for CLI compatibility
import 'dotenv/config';
// @ts-ignore: missing type declarations for 'prisma'
import { defineConfig } from 'prisma';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    db: {
      provider: 'sqlite',
      url: process.env.DATABASE_URL ?? 'file:./dev.db'
    }
  },
  client: {
    adapter: {
      provider: 'sqlite',
      url: process.env.DATABASE_URL ?? 'file:./dev.db'
    }
  }
});
