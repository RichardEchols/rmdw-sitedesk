import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { getSession, handleError, requireSameOrigin, sql } from './_lib.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    requireSameOrigin(req)
    const session = await getSession(req)
    if (!session) throw new Error('UNAUTHORIZED')
    const json = await handleUpload({
      body: req.body as HandleUploadBody,
      request: new Request(`https://${req.headers.host}${req.url}`, { method: 'POST', headers: req.headers as HeadersInit, body: JSON.stringify(req.body) }),
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const payload = JSON.parse(clientPayload || '{}') as { jobId?: string; purpose?: string }
        if (!payload.jobId || !['request','before','during','after','document'].includes(payload.purpose || '')) throw new Error('INVALID_INPUT')
        const rows = session.role === 'customer'
          ? await sql()`select j.id from sd_jobs j join sd_properties p on p.id=j.property_id and p.tenant_id=j.tenant_id where j.id=${payload.jobId} and j.tenant_id=${session.tenantId} and p.customer_user_id=${session.userId}`
          : session.role === 'technician'
            ? await sql()`select id from sd_jobs where id=${payload.jobId} and tenant_id=${session.tenantId} and assigned_to=${session.userId}`
            : await sql()`select id from sd_jobs where id=${payload.jobId} and tenant_id=${session.tenantId}`
        if (!rows[0]) throw new Error('FORBIDDEN')
        return { allowedContentTypes: ['image/jpeg','image/png','image/webp','image/heic','video/mp4','application/pdf'], maximumSizeInBytes: 25 * 1024 * 1024, addRandomSuffix: true, tokenPayload: JSON.stringify({ tenantId: session.tenantId, userId: session.userId, jobId: payload.jobId, purpose: payload.purpose }) }
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const p = JSON.parse(tokenPayload || '{}') as { tenantId:string;userId:string;jobId:string;purpose:string }
        await sql()`insert into sd_media (tenant_id,job_id,uploaded_by,blob_url,pathname,content_type,purpose) values (${p.tenantId},${p.jobId},${p.userId},${blob.url},${blob.pathname},${blob.contentType || 'application/octet-stream'},${p.purpose})`
      },
    })
    return res.json(json)
  } catch (error) { return handleError(res, error) }
}
