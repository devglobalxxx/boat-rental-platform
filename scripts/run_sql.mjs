import pg from 'pg'
const { Client } = pg

const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsdXByenhwdW9yeWl3dnhoZmd3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTgyMjQzNywiZXhwIjoyMDk1Mzk4NDM3fQ.J3yfsbYAJwIUV7llBiwbUF4nGMTEBckn4FUjBFzzNmQ'
const PROJECT_REF = 'xluprzxpuoryiwvxhfgw'

// Try new pooler patterns (aws-1, aws-2)
const HOSTS = [
  'aws-1-eu-west-1.pooler.supabase.com',
  'aws-1-eu-central-1.pooler.supabase.com',
  'aws-1-eu-north-1.pooler.supabase.com',
  'aws-1-us-east-1.pooler.supabase.com',
  'aws-1-us-east-2.pooler.supabase.com',
  'aws-1-us-west-1.pooler.supabase.com',
  'aws-2-eu-west-1.pooler.supabase.com',
  'db.xluprzxpuoryiwvxhfgw.supabase.co',
]

for (const host of HOSTS) {
  const client = new Client({
    host,
    port: host.startsWith('db.') ? 5432 : 6543,
    database: 'postgres',
    user: `postgres.${PROJECT_REF}`,
    password: SERVICE_KEY,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 4000,
  })
  try {
    await client.connect()
    console.log('Connected via', host)
    await client.query("ALTER TABLE profiles ADD COLUMN IF NOT EXISTS signup_notified BOOLEAN NOT NULL DEFAULT false;")
    console.log('✅ MIGRATION DONE')
    await client.end()
    process.exit(0)
  } catch (e) {
    try { await client.end() } catch {}
    console.log('  ✗', host, '—', String(e.message).slice(0,80))
  }
}
process.exit(1)
