import { ArrowRight, BriefcaseBusiness, Building2, HardHat, X } from 'lucide-react'
import { Brand } from './Brand'
import type { View } from '../types'

const roles: Array<{ view: View; title: string; detail: string; context: string; icon: typeof BriefcaseBusiness }> = [
  { view: 'office', title: 'Office workspace', detail: 'Triage, assign, schedule, and keep every job moving.', context: 'Maya Patel · Office coordinator', icon: BriefcaseBusiness },
  { view: 'technician', title: 'Field technician', detail: 'Document work, add proof, and close out an assigned job.', context: 'Jordan Lee · Field technician', icon: HardHat },
  { view: 'request', title: 'Customer portal', detail: 'Report an issue, share media, and follow the work thread.', context: 'Northline Storage Group', icon: Building2 },
]

export function RoleEntry({ active, onClose, onEnter }: { active: View; onClose: () => void; onEnter: (view: View) => void }) {
  return (
    <div className="role-entry" role="dialog" aria-modal="true" aria-labelledby="role-entry-title">
      <div className="role-entry__card">
        <header className="role-entry__header">
          <Brand compact />
          <button onClick={onClose} aria-label="Close role entry"><X size={19} /></button>
        </header>
        <div className="role-entry__intro">
          <span>SITEDESK · BY RMDW · DEMO ACCESS</span>
          <h1 id="role-entry-title">Choose how you want to enter.</h1>
          <p>Explore the same maintenance thread from the office, field, or customer perspective.</p>
        </div>
        <div className="role-entry__roles">
          {roles.map((role) => {
            const Icon = role.icon
            return (
              <button className={active === role.view ? 'is-active' : ''} key={role.view} onClick={() => onEnter(role.view)}>
                <span className="role-entry__icon"><Icon size={21} /></span>
                <span className="role-entry__copy"><strong>{role.title}</strong><small>{role.detail}</small><em>{role.context}</em></span>
                <ArrowRight size={18} />
              </button>
            )
          })}
        </div>
        <footer><span>Fictional demo data · No account or live system access required</span><button onClick={() => onEnter('office')}>Continue in office workspace <ArrowRight size={15} /></button></footer>
      </div>
    </div>
  )
}
