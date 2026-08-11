import { ArrowRight, Check, X } from 'lucide-react'
import type { View } from '../types'

const roles: Record<View, { eyebrow: string; title: string; copy: string }> = {
  office: { eyebrow: 'OFFICE WORKSPACE', title: 'Turn a clear request into a finished, billable job.', copy: 'Triage the context, assign the right person, and keep the customer decision moving.' },
  technician: { eyebrow: 'FIELD TECHNICIAN', title: 'Capture the proof that closes the loop.', copy: 'Document the work, flag extra findings, and hand the office a customer-ready closeout.' },
  request: { eyebrow: 'CUSTOMER PORTAL', title: 'One simple place to report an issue and stay informed.', copy: 'Share the context once; the office and field team carry the same work thread forward.' },
  quote: { eyebrow: 'CUSTOMER APPROVAL', title: 'Make the next decision clear and easy to approve.', copy: 'The customer sees the finding, scope, price, and next step in one trusted record.' },
  closeout: { eyebrow: 'CUSTOMER CLOSEOUT', title: 'End with proof, clarity, and an invoice-ready record.', copy: 'The completed job tells the same story from issue to finished work.' },
}

export function Orientation({ view, onClose }: { view: View; onClose: () => void }) {
  const role = roles[view]
  return (
    <aside className="orientation" aria-label="Demo orientation">
      <button className="orientation__close" onClick={onClose} aria-label="Skip orientation"><X size={16} /></button>
      <span>{role.eyebrow}</span>
      <h2>{role.title}</h2>
      <p>{role.copy}</p>
      <div className="orientation__flow"><b><Check size={13} /> Customer context</b><i /><b><Check size={13} /> Office dispatch</b><i /><b><Check size={13} /> Field proof</b></div>
      <button className="orientation__start" onClick={onClose}>Start exploring <ArrowRight size={15} /></button>
    </aside>
  )
}
