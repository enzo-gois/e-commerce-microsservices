import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
import 'dotenv/config';

const runMigration = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL não configurada.');
  }

  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1,
  });
  const db = drizzle(pool);

  console.log('Executando migrations...');

  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migrations aplicadas com sucesso!');
  } catch (error) {
    console.error('Erro ao aplciar migrations: ', error);
  } finally {
    await pool.end();
  }
};

runMigration();
