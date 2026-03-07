import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/libs/db/schema.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: 'file:./db.sqlite',
  },
});
