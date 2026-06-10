import "dotenv/config";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set in backend/.env");
  process.exit(1);
}

const url = new URL(connectionString);
const databaseName = url.pathname.replace(/^\//, "");
url.pathname = "/postgres";

const client = new pg.Client({ connectionString: url.toString() });

try {
  await client.connect();
  const exists = await client.query(
    "SELECT EXISTS (SELECT 1 FROM pg_database WHERE datname = $1) AS exists",
    [databaseName],
  );

  if (exists.rows[0]?.exists) {
    console.log(`Database "${databaseName}" already exists.`);
  } else {
    await client.query(`CREATE DATABASE "${databaseName.replace(/"/g, '""')}"`);
    console.log(`Created database "${databaseName}".`);
  }
} catch (error) {
  console.error("Failed to set up database:", error);
  process.exit(1);
} finally {
  await client.end();
}
