import type { VercelRequest, VercelResponse } from '@vercel/node'
import { body, createSession, destroySession, getSession, handleError, hash, hashPassword, requireRole, requireSameOrigin, sql, textField, verifyPassword } from './_lib.js'

const allowedStatuses = ['requested','triaged','scheduled','in_progress','awaiting_approval','completed','invoice_ready','cancelled']

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store')
  try {
    requireSameOrigin(req)
    const action = String(req.query.action || '')
    if (req.method === 'GET' && action === 'status') {
      if (!process.env.DATABASE_URL) return res.json({ configured: false, initialized: false, bootstrapConfigured: false, uploadsConfigured: Boolean(process.env.BLOB_READ_WRITE_TOKEN) })
      const initialized = Boolean((await sql()`select 1 from sd_users limit 1`)[0])
      return res.json({ configured: true, initialized, bootstrapConfigured: Boolean(process.env.SITEDESK_BOOTSTRAP_TOKEN), uploadsConfigured: Boolean(process.env.BLOB_READ_WRITE_TOKEN) })
    }
    if (req.method === 'POST' && action === 'bootstrap') return await bootstrap(req, res)
    if (req.method === 'POST' && action === 'login') return await login(req, res)
    if (req.method === 'POST' && action === 'logout') { await destroySession(req, res); return res.json({ ok: true }) }

    const session = await getSession(req)
    if (!session) throw new Error('UNAUTHORIZED')
    if (req.method === 'GET' && action === 'session') return res.json({ user: session })
    if (req.method === 'GET' && action === 'workspace') return await workspace(res, session)

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' })
    if (action === 'create-user') return await createUser(req, res, session)
    if (action === 'create-property') return await createProperty(req, res, session)
    if (action === 'create-job') return await createJob(req, res, session)
    if (action === 'update-job') return await updateJob(req, res, session)
    if (action === 'add-update') return await addUpdate(req, res, session)
    if (action === 'create-quote') return await createQuote(req, res, session)
    if (action === 'approve-quote') return await approveQuote(req, res, session)
    return res.status(404).json({ error: 'Unknown action.' })
  } catch (error) { return handleError(res, error) }
}

async function bootstrap(req: VercelRequest, res: VercelResponse) {
  const input = body(req)
  if (!process.env.SITEDESK_BOOTSTRAP_TOKEN || input.token !== process.env.SITEDESK_BOOTSTRAP_TOKEN) throw new Error('BOOTSTRAP_DISABLED')
  const existing = await sql()`select 1 from sd_users limit 1`
  if (existing[0]) throw new Error('ALREADY_BOOTSTRAPPED')
  const company = textField(input, 'company', 120), name = textField(input, 'name', 120)
  const email = textField(input, 'email', 254).toLowerCase(), passwordHash = await hashPassword(textField(input, 'password', 200))
  const slug = company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'workspace'
  const tenant = (await sql()`insert into sd_tenants (name, slug) values (${company}, ${slug}) returning id`)[0]
  const user = (await sql()`insert into sd_users (tenant_id,email,full_name,password_hash,role) values (${tenant.id},${email},${name},${passwordHash},'admin') returning id`)[0]
  await createSession(res, String(tenant.id), String(user.id))
  return res.status(201).json({ ok: true })
}

async function login(req: VercelRequest, res: VercelResponse) {
  const input = body(req), email = textField(input, 'email', 254).toLowerCase(), password = textField(input, 'password', 200)
  const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0]
  const emailHash = hash(email), ipHash = hash(ip + (process.env.SESSION_SECRET || 'sitedesk'))
  const recent = await sql()`select count(*)::int as count from sd_login_attempts where email_hash=${emailHash} and ip_hash=${ipHash} and attempted_at > now() - interval '15 minutes' and succeeded=false`
  if (Number(recent[0]?.count || 0) >= 8) throw new Error('RATE_LIMITED')
  const rows = await sql()`select id,tenant_id,password_hash from sd_users where lower(email)=${email} and is_active=true limit 1`
  const valid = rows[0] ? await verifyPassword(password, String(rows[0].password_hash)) : false
  await sql()`insert into sd_login_attempts (email_hash,ip_hash,succeeded) values (${emailHash},${ipHash},${valid})`
  if (!valid) return res.status(401).json({ error: 'Email or password is incorrect.' })
  await sql()`update sd_users set last_login_at=now() where id=${rows[0].id} and tenant_id=${rows[0].tenant_id}`
  await createSession(res, String(rows[0].tenant_id), String(rows[0].id))
  return res.json({ ok: true })
}

async function workspace(res: VercelResponse, s: Awaited<ReturnType<typeof getSession>> & {}) {
  const q = sql()
  const tenant = (await q`select id,name from sd_tenants where id=${s.tenantId}`)[0]
  const users = ['office','admin'].includes(s.role)
    ? await q`select id,email,full_name,role,is_active from sd_users where tenant_id=${s.tenantId} order by full_name`
    : []
  const properties = s.role === 'customer'
    ? await q`select * from sd_properties where tenant_id=${s.tenantId} and customer_user_id=${s.userId} order by name`
    : await q`select * from sd_properties where tenant_id=${s.tenantId} order by name`
  const jobs = s.role === 'customer'
    ? await q`select j.* from sd_jobs j join sd_properties p on p.id=j.property_id and p.tenant_id=j.tenant_id where j.tenant_id=${s.tenantId} and p.customer_user_id=${s.userId} order by j.updated_at desc`
    : s.role === 'technician'
      ? await q`select * from sd_jobs where tenant_id=${s.tenantId} and assigned_to=${s.userId} order by updated_at desc`
      : await q`select * from sd_jobs where tenant_id=${s.tenantId} order by updated_at desc`
  const jobIds = jobs.map((j) => String(j.id))
  const quotes = jobIds.length ? await q`select * from sd_quotes where tenant_id=${s.tenantId} and job_id = any(${jobIds}) order by created_at desc` : []
  const quoteIds = quotes.map((quote) => String(quote.id))
  const quoteLines = quoteIds.length ? await q`select * from sd_quote_lines where tenant_id=${s.tenantId} and quote_id = any(${quoteIds}) order by sort_order` : []
  const updates = jobIds.length ? await q`select * from sd_job_updates where tenant_id=${s.tenantId} and job_id = any(${jobIds}) order by created_at desc limit 200` : []
  const media = jobIds.length ? await q`select * from sd_media where tenant_id=${s.tenantId} and job_id = any(${jobIds}) order by created_at desc` : []
  return res.json({ user: s, tenant, users, properties, jobs, quotes, quoteLines, updates, media })
}

async function createUser(req: VercelRequest, res: VercelResponse, s: NonNullable<Awaited<ReturnType<typeof getSession>>>) {
  requireRole(s, ['admin']); const input=body(req), role=textField(input,'role',30)
  if (!['customer','office','technician','admin'].includes(role)) throw new Error('INVALID_INPUT')
  const email=textField(input,'email',254).toLowerCase(), name=textField(input,'name',120), passwordHash=await hashPassword(textField(input,'password',200))
  const row=(await sql()`insert into sd_users (tenant_id,email,full_name,password_hash,role) values (${s.tenantId},${email},${name},${passwordHash},${role}) returning id,email,full_name,role`)[0]
  return res.status(201).json({ user: row })
}

async function createProperty(req: VercelRequest,res:VercelResponse,s:NonNullable<Awaited<ReturnType<typeof getSession>>>) {
  requireRole(s,['office','admin']); const input=body(req), customer=typeof input.customerUserId==='string'?input.customerUserId:null
  const row=(await sql()`insert into sd_properties (tenant_id,customer_user_id,name,address,location_notes) values (${s.tenantId},${customer},${textField(input,'name',160)},${textField(input,'address',300)},${typeof input.notes==='string'?input.notes.slice(0,1000):null}) returning *`)[0]
  return res.status(201).json({ property: row })
}

async function createJob(req:VercelRequest,res:VercelResponse,s:NonNullable<Awaited<ReturnType<typeof getSession>>>) {
  requireRole(s,['customer','office','admin']); const input=body(req), propertyId=textField(input,'propertyId',80)
  const owned = s.role==='customer' ? await sql()`select id from sd_properties where id=${propertyId} and tenant_id=${s.tenantId} and customer_user_id=${s.userId}` : await sql()`select id from sd_properties where id=${propertyId} and tenant_id=${s.tenantId}`
  if(!owned[0]) throw new Error('FORBIDDEN')
  const priority=typeof input.priority==='string'&&['low','standard','urgent','emergency'].includes(input.priority)?input.priority:'standard'
  const row=(await sql()`insert into sd_jobs (tenant_id,property_id,requested_by,title,description,priority) values (${s.tenantId},${propertyId},${s.userId},${textField(input,'title',180)},${textField(input,'description',4000)},${priority}) returning *`)[0]
  await sql()`insert into sd_job_updates (tenant_id,job_id,author_id,kind,body) values (${s.tenantId},${row.id},${s.userId},'status','Request received')`
  return res.status(201).json({ job: row })
}

async function updateJob(req:VercelRequest,res:VercelResponse,s:NonNullable<Awaited<ReturnType<typeof getSession>>>) {
  requireRole(s,['office','technician','admin']); const input=body(req), id=textField(input,'jobId',80), status=textField(input,'status',40)
  if(!allowedStatuses.includes(status)) throw new Error('INVALID_INPUT')
  const rows=s.role==='technician'?await sql()`update sd_jobs set status=${status},completed_at=case when ${status}='completed' then now() else completed_at end where id=${id} and tenant_id=${s.tenantId} and assigned_to=${s.userId} returning *`:await sql()`update sd_jobs set status=${status},assigned_to=coalesce(${typeof input.assignedTo==='string'?input.assignedTo:null},assigned_to),scheduled_start=coalesce(${typeof input.scheduledStart==='string'?input.scheduledStart:null},scheduled_start),scheduled_end=coalesce(${typeof input.scheduledEnd==='string'?input.scheduledEnd:null},scheduled_end),completed_at=case when ${status}='completed' then now() else completed_at end where id=${id} and tenant_id=${s.tenantId} returning *`
  if(!rows[0]) throw new Error('FORBIDDEN'); return res.json({ job: rows[0] })
}

async function addUpdate(req:VercelRequest,res:VercelResponse,s:NonNullable<Awaited<ReturnType<typeof getSession>>>) {
  const input=body(req), id=textField(input,'jobId',80), kind=textField(input,'kind',40)
  if(!['note','status','proof','customer_message','office_review'].includes(kind)) throw new Error('INVALID_INPUT')
  const allowed=s.role==='customer'?await sql()`select j.id from sd_jobs j join sd_properties p on p.id=j.property_id and p.tenant_id=j.tenant_id where j.id=${id} and j.tenant_id=${s.tenantId} and p.customer_user_id=${s.userId}`:s.role==='technician'?await sql()`select id from sd_jobs where id=${id} and tenant_id=${s.tenantId} and assigned_to=${s.userId}`:await sql()`select id from sd_jobs where id=${id} and tenant_id=${s.tenantId}`
  if(!allowed[0]) throw new Error('FORBIDDEN')
  const row=(await sql()`insert into sd_job_updates (tenant_id,job_id,author_id,kind,body) values (${s.tenantId},${id},${s.userId},${kind},${textField(input,'message',4000)}) returning *`)[0]
  return res.status(201).json({ update: row })
}

async function createQuote(req:VercelRequest,res:VercelResponse,s:NonNullable<Awaited<ReturnType<typeof getSession>>>) {
  requireRole(s,['office','admin']); const input=body(req), jobId=textField(input,'jobId',80), lines=Array.isArray(input.lines)?input.lines:[]
  if(!lines.length||lines.length>50) throw new Error('INVALID_INPUT')
  const clean=lines.map((line,index)=>{const l=line as Record<string,unknown>; return {description:textField(l,'description',500),amount:Number(l.amountCents),index}})
  if(clean.some(l=>!Number.isInteger(l.amount)||l.amount<0)) throw new Error('INVALID_INPUT')
  const exists=await sql()`select id from sd_jobs where id=${jobId} and tenant_id=${s.tenantId}`; if(!exists[0]) throw new Error('FORBIDDEN')
  const total=clean.reduce((sum,l)=>sum+l.amount,0), quote=(await sql()`insert into sd_quotes (tenant_id,job_id,status,subtotal_cents) values (${s.tenantId},${jobId},'sent',${total}) returning *`)[0]
  for(const line of clean) await sql()`insert into sd_quote_lines (tenant_id,quote_id,description,amount_cents,sort_order) values (${s.tenantId},${quote.id},${line.description},${line.amount},${line.index})`
  await sql()`update sd_jobs set status='awaiting_approval' where id=${jobId} and tenant_id=${s.tenantId}`
  return res.status(201).json({ quote })
}

async function approveQuote(req:VercelRequest,res:VercelResponse,s:NonNullable<Awaited<ReturnType<typeof getSession>>>) {
  requireRole(s,['customer','admin']); const quoteId=textField(body(req),'quoteId',80)
  const rows=s.role==='customer'?await sql()`update sd_quotes q set status='approved',approved_by=${s.userId},approved_at=now() from sd_jobs j join sd_properties p on p.id=j.property_id and p.tenant_id=j.tenant_id where q.id=${quoteId} and q.tenant_id=${s.tenantId} and j.id=q.job_id and p.customer_user_id=${s.userId} and q.status='sent' returning q.*`:await sql()`update sd_quotes set status='approved',approved_by=${s.userId},approved_at=now() where id=${quoteId} and tenant_id=${s.tenantId} and status='sent' returning *`
  if(!rows[0]) throw new Error('FORBIDDEN'); return res.json({ quote: rows[0] })
}
