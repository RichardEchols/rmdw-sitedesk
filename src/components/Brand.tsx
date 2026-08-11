import { ArrowUpRight } from 'lucide-react'

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? 'brand--compact' : ''}`} aria-label="RMDW SiteDesk">
      <span className="brand__rmdw">RMDW</span>
      <span className="brand__name">SiteDesk</span>
    </div>
  )
}

export function RmdwLink() {
  return (
    <a className="rmdw-link" href="https://rmdw.ai" target="_blank" rel="noreferrer">
      Built by RMDW <ArrowUpRight size={13} />
    </a>
  )
}
