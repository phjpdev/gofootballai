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

    CREATE TABLE IF NOT EXISTS match_analyses (
      id UUID PRIMARY KEY,
      hkjc_match_id VARCHAR(64) NOT NULL,
      front_end_id VARCHAR(32),
      status VARCHAR(16) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'completed', 'failed')),
      model VARCHAR(64),
      prompt_version VARCHAR(16) NOT NULL DEFAULT 'v1',
      input_snapshot JSONB,
      analysis JSONB,
      raw_response JSONB,
      error_message TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ
    );

    CREATE UNIQUE INDEX IF NOT EXISTS match_analyses_match_prompt_idx
      ON match_analyses (hkjc_match_id, prompt_version);

    CREATE INDEX IF NOT EXISTS match_analyses_status_idx
      ON match_analyses (status);

    CREATE INDEX IF NOT EXISTS match_analyses_expires_at_idx
      ON match_analyses (expires_at);
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

  await pool.query(`
    ALTER TABLE records ADD COLUMN IF NOT EXISTS display_date DATE;
    ALTER TABLE records ADD COLUMN IF NOT EXISTS star_rating REAL;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS vip_expires_at TIMESTAMPTZ;

    CREATE TABLE IF NOT EXISTS featured_items (
      id VARCHAR(32) PRIMARY KEY,
      title VARCHAR(80) NOT NULL,
      tag VARCHAR(40) NOT NULL,
      duration VARCHAR(40) NOT NULL,
      stat VARCHAR(40) NOT NULL,
      image_src TEXT NOT NULL,
      pick_mode VARCHAR(10) NOT NULL CHECK (pick_mode IN ('single', 'multi')),
      sort_order INT NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS home_sections (
      id VARCHAR(16) PRIMARY KEY,
      eyebrow VARCHAR(80),
      title VARCHAR(120) NOT NULL,
      description TEXT NOT NULL,
      image_src TEXT NOT NULL,
      cta_text VARCHAR(40),
      login_prompt VARCHAR(80),
      login_link_text VARCHAR(40),
      sort_order INT NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS top_match_previews (
      id VARCHAR(16) PRIMARY KEY,
      match_id VARCHAR(64) NOT NULL DEFAULT '',
      home_team VARCHAR(80) NOT NULL DEFAULT '',
      away_team VARCHAR(80) NOT NULL DEFAULT '',
      pick_selection VARCHAR(80) NOT NULL DEFAULT '',
      sort_order INT NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS archived_hkjc_matches (
      hkjc_match_id VARCHAR(64) PRIMARY KEY,
      match_date DATE NOT NULL,
      match_data JSONB NOT NULL,
      archived_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS archived_hkjc_matches_match_date_idx
      ON archived_hkjc_matches (match_date DESC);
  `);

  await pool.query(`
    ALTER TABLE top_match_previews ADD COLUMN IF NOT EXISTS home_team VARCHAR(80) NOT NULL DEFAULT '';
    ALTER TABLE top_match_previews ADD COLUMN IF NOT EXISTS away_team VARCHAR(80) NOT NULL DEFAULT '';
    ALTER TABLE top_match_previews ADD COLUMN IF NOT EXISTS pick_selection VARCHAR(80) NOT NULL DEFAULT '';
  `);
}

export async function query<T extends pg.QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<pg.QueryResult<T>> {
  return pool.query<T>(text, params);
}

export { pool };
