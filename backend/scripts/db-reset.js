const { Client } = require('pg');
const { spawnSync } = require('node:child_process');

const database = process.env.DB_NAME || 'ev_charging_platform';
const adminClient = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '1111',
  database: 'postgres',
});

async function resetDatabase() {
  await adminClient.connect();
  await adminClient.query(
    'SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()',
    [database],
  );
  await adminClient.query(`DROP DATABASE IF EXISTS "${database}"`);
  await adminClient.query(`CREATE DATABASE "${database}"`);
  await adminClient.end();

  const result = spawnSync('npm', ['run', 'migration:run'], {
    stdio: 'inherit',
    shell: true,
  });
  process.exitCode = result.status ?? 1;
}

resetDatabase().catch(async (error) => {
  console.error(error);
  await adminClient.end().catch(() => undefined);
  process.exitCode = 1;
});