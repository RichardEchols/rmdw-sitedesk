export async function api(action: string, options?: RequestInit) {
  const response = await fetch(`/api?action=${action}`, { credentials: 'same-origin', ...options, headers: { 'Content-Type': 'application/json', ...options?.headers } })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'SiteDesk could not complete that request.')
  return data
}
