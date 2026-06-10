import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function initDb(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      username VARCHAR(32) NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role VARCHAR(10) NOT NULL DEFAULT 'member',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE UNIQUE INDEX IF NOT EXISTS users_username_lower_idx
      ON users (LOWER(username));

    CREATE TABLE IF NOT EXISTS records (
      id UUID PRIMARY KEY,
      author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type VARCHAR(10) NOT NULL CHECK (type IN ('text', 'photo', 'video')),
      title VARCHAR(200) NOT NULL,
      content TEXT,
      media_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS records_created_at_idx
      ON records (created_at DESC);
  `);

  await pool.query(`
    DO $$
    BEGIN
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
      ALTER TABLE users ADD CONSTRAINT users_role_check
        CHECK (role IN ('member', 'admin', 'user'));
      UPDATE users SET role = 'member' WHERE role = 'user';
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
      ALTER TABLE users ADD CONSTRAINT users_role_check
        CHECK (role IN ('member', 'admin'));
    EXCEPTION
      WHEN others THEN NULL;
    END $$;
  `);
}

export async function query<T extends pg.QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<pg.QueryResult<T>> {
  return pool.query<T>(text, params);
}

export { pool };
