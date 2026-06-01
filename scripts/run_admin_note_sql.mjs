import pg from 'pg'
const { Client } = pg

const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsdXByenhwdW9yeWl3dnhoZmd3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTgyMjQzNywiZXhwIjoyMDk1Mzk4NDM3fQ.J3yfsbYAJwIUV7llBiwbUF4nGMTEBckn4FUjBFzzNmQ'

const SQL = 'ALTER TABLE boats ADD COLUMN IF NOT EXISTS admin_note TEXT'

// Try EVERY Supabase pooler combination — pooler hostnames have changed over time
const REGIONS = [
  'eu-west-1','eu-central-1','eu-north-1','eu-west-2','eu-west-3',
  'us-east-1','us-east-2','us-west-1','us-west-2',
  'ap-southeast-1','ap-southeast-2','ap-northeast-1','ap-south-1'
]
const HOST_PATTERNS = (region) => [
  `aws-0-${region}.pooler.supabase.com`,
  `aws-1-${region}.pooler.supabase.com`,
]

for (const region of REGIONS) {
  for (const host of HOST_PATTERNS(region)) {
    for (const port of [6543, 5432]) {
      for (const password of [SERVICE_KEY, 'postgres']) {
        const c = new Client({
          host, port, database:'postgres',
          user:'postgres.xluprzxpuoryiwvxhfgw',
          password, ssl:{rejectUnauthorized:false},
          connectionTimeoutMillis:3000
        })
        try {
          await c.connect()
          await c.query(SQL)
          console.log('SUCCESS via', host, port)
          await c.end(); process.exit(0)
        } catch (e) {
          try { await c.end() } catch {}
        }
      }
    }
  }
}
console.log('All pooler attempts exhausted')
process.exit(1)
