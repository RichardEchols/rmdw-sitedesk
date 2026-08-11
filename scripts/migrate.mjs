import { readFile } from 'node:fs/promises'
import pg from 'pg'

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required to run migrations.')
const migration = await readFile(new URL('../migrations/0001_sitedesk.sql', import.meta.url), 'utf8')
const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
try {
  await client.query('begin')
  await client.query(migration)
  await client.query('commit')
} catch (error) {
  await client.query('rollback')
  throw error
} finally {
  await client.end()
}
console.log('SiteDesk database migration complete.')
