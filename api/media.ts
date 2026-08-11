import { Readable } from 'node:stream'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { get } from '@vercel/blob'
import { getSession, handleError, sql } from './_lib.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed.' })
    const session = await getSession(req)
    if (!session) throw new Error('UNAUTHORIZED')
    const mediaId = typeof req.query.id === 'string' ? req.query.id : ''
    if (!mediaId) throw new Error('INVALID_INPUT')
    const rows = session.role === 'customer'
      ? await sql()`select m.blob_url,m.content_type from sd_media m join sd_jobs j on j.id=m.job_id and j.tenant_id=m.tenant_id join sd_properties p on p.id=j.property_id and p.tenant_id=j.tenant_id where m.id=${mediaId} and m.tenant_id=${session.tenantId} and p.customer_user_id=${session.userId}`
      : session.role === 'technician'
        ? await sql()`select m.blob_url,m.content_type from sd_media m join sd_jobs j on j.id=m.job_id and j.tenant_id=m.tenant_id where m.id=${mediaId} and m.tenant_id=${session.tenantId} and j.assigned_to=${session.userId}`
        : await sql()`select blob_url,content_type from sd_media where id=${mediaId} and tenant_id=${session.tenantId}`
    if (!rows[0]) throw new Error('FORBIDDEN')
    const blob = await get(String(rows[0].blob_url), { access: 'private' })
    if (!blob || blob.statusCode !== 200) return res.status(404).json({ error: 'Media not found.' })
    res.setHeader('Content-Type', String(rows[0].content_type))
    res.setHeader('Content-Length', String(blob.blob.size))
    res.setHeader('Cache-Control', 'private, max-age=300')
    res.setHeader('ETag', blob.blob.etag)
    Readable.fromWeb(blob.stream as never).pipe(res)
  } catch (error) { return handleError(res, error) }
}
