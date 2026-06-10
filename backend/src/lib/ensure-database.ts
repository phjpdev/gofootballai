import pg from "pg";

function getDatabaseName(connectionString: string): string {
  const url = new URL(connectionString);
  const name = url.pathname.replace(/^\//, "");
  if (!name) {
    throw new Error("DATABASE_URL must include a database name");
  }
  return name;
}

function getAdminConnectionString(connectionString: string): string {
  const url = new URL(connectionString);
  url.pathname = "/postgres";
  return url.toString();
}

export async function ensureDatabase(connectionString: string): Promise<void> {
  const databaseName = getDatabaseName(connectionString);
  const adminClient = new pg.Client({
    connectionString: getAdminConnectionString(connectionString),
  });

  await adminClient.connect();

  try {
    const exists = await adminClient.query<{ exists: boolean }>(
      "SELECT EXISTS (SELECT 1 FROM pg_database WHERE datname = $1) AS exists",
      [databaseName],
    );

    if (!exists.rows[0]?.exists) {
      await adminClient.query(`CREATE DATABASE "${databaseName.replace(/"/g, '""')}"`);
      console.log(`Created database "${databaseName}"`);
    }
  } finally {
    await adminClient.end();
  }
}
