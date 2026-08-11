import {
  Building2,
  Camera,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileCheck2,
} from 'lucide-react'
import type { View } from '../types'

const steps: Array<{ view: View; label: string; detail: string; icon: typeof Building2 }> = [
  { view: 'request', label: 'Customer request', detail: 'Report with photos', icon: Building2 },
  { view: 'office', label: 'Office triage', detail: 'Review and assign', icon: ClipboardCheck },
  { view: 'technician', label: 'Technician proof', detail: 'Document the work', icon: Camera },
  { view: 'quote', label: 'Quote approval', detail: 'Customer decision', icon: FileCheck2 },
  { view: 'closeout', label: 'Closeout', detail: 'Ready to invoice', icon: CheckCircle2 },
]

export function DemoJourney({
  active,
  open,
  onToggle,
  onNavigate,
}: {
  active: View
  open: boolean
  onToggle: () => void
  onNavigate: (view: View) => void
}) {
  return (
    <div className={`demo-journey ${open ? 'demo-journey--open' : ''}`}>
      {open && (
        <div className="demo-journey__panel">
          <div className="demo-journey__heading">
            <div>
              <strong>Walk the job</strong>
              <span>Five views. One work thread.</span>
            </div>
            <span className="demo-journey__fictional">Fictional demo</span>
          </div>
          <div className="demo-journey__steps">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <button
                  key={step.view}
                  className={active === step.view ? 'is-active' : ''}
                  onClick={() => onNavigate(step.view)}
                >
                  <span className="demo-journey__number">{index + 1}</span>
                  <Icon size={18} />
                  <span>
                    <strong>{step.label}</strong>
                    <small>{step.detail}</small>
                  </span>
                  <ChevronRight size={16} />
                </button>
              )
            })}
          </div>
        </div>
      )}
      <button className="demo-journey__toggle" onClick={onToggle} aria-expanded={open}>
        <span className="demo-journey__pulse" />
        Demo journey
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
