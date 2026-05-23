import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';
import 'dotenv/config';

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL não foi informada nas variáveis de ambiente do product-service!',
  );
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });
