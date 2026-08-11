import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  FileWarning,
  MapPin,
  MoreHorizontal,
  Navigation,
  Plus,
  Send,
  Sparkles,
} from 'lucide-react'
import { ProofPhoto } from '../components/ProofPhoto'
import type { NavigationProps, WorkflowState } from '../types'

type TechStep = 'work' | 'photos' | 'finding' | 'closeout'

export function Technician({
  workflow,
  onUpdate,
  onNavigate,
}: NavigationProps & {
  workflow: WorkflowState
  onUpdate: (next: Partial<WorkflowState>) => void
}) {
  const [step, setStep] = useState<TechStep>(workflow.jobCompleted ? 'closeout' : 'photos')
  const [findingSaved, setFindingSaved] = useState(false)
  const [toast, setToast] = useState('')

  const addAfterPhoto = () => {
    onUpdate({ afterPhotoAdded: true })
    setToast('After photo added')
    window.setTimeout(() => setToast(''), 2200)
  }

  const completeJob = () => {
    if (!workflow.afterPhotoAdded) return
    onUpdate({ jobCompleted: true })
    setStep('closeout')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const steps: Array<{ id: TechStep; label: string }> = [
    { id: 'work', label: 'Work' },
    { id: 'photos', label: 'Photos' },
    { id: 'finding', label: 'Finding' },
    { id: 'closeout', label: 'Closeout' },
  ]

  return (
    <div className="technician-demo">
      <div className="technician-frame">
        <header className="tech-header">
          <button onClick={() => onNavigate('office')} aria-label="Back to office"><ArrowLeft size={21} /></button>
          <strong>Today · 2 jobs</strong>
          <button aria-label="More options"><MoreHorizontal size={21} /></button>
        </header>
        <main className="tech-content">
          <div className="tech-job-heading">
            <div className="tech-job-heading__line"><span className={workflow.jobCompleted ? 'status-badge status-badge--ready' : 'status-badge'}>{workflow.jobCompleted ? 'Complete' : 'In progress'}</span><small>JOB-2521</small></div>
            <h1>Riverbend Storage — Building C</h1>
            <p><MapPin size={15} /> Drive aisle · Units C118–C126</p>
          </div>

          <div className="tech-site-card">
            <button><Building2 size={18} /><span><small>Customer</small><strong>Northline Storage Group</strong></span><ChevronRight size={17} /></button>
            <button><CalendarDays size={18} /><span><small>Scheduled</small><strong>Today · 8:00–11:00 AM</strong></span><ChevronRight size={17} /></button>
            <button><Navigation size={18} /><span><small>Site contact</small><strong>Dana Pierce · (404) 555-0147</strong></span><ChevronRight size={17} /></button>
          </div>

          <div className="tech-scope">
            <small>WORK ORDER</small><h2>Spalled concrete at drainage edge</h2><p>Make the damaged edge safe, repair the failed section, and document the finished surface.</p>
            <div><span><Check size={14} /> Protect work area</span><span><Check size={14} /> Remove loose material</span><span><Check size={14} /> Install repair & finish</span></div>
          </div>

          <nav className="tech-steps" aria-label="Job workflow">
            {steps.map((item, index) => (
              <button key={item.id} className={step === item.id ? 'is-active' : ''} onClick={() => setStep(item.id)}>
                <span>{workflow.jobCompleted || (item.id === 'photos' && workflow.afterPhotoAdded) ? <Check size={13} /> : index + 1}</span>
                {item.label}
              </button>
            ))}
          </nav>

          {step === 'work' && <WorkStep />}
          {step === 'photos' && <PhotosStep afterPhotoAdded={workflow.afterPhotoAdded} onAdd={addAfterPhoto} />}
          {step === 'finding' && <FindingStep saved={findingSaved} onSave={() => setFindingSaved(true)} />}
          {step === 'closeout' && <CloseoutStep complete={workflow.jobCompleted} onComplete={completeJob} />}
        </main>

        <footer className="tech-action-bar">
          {workflow.jobCompleted ? (
            <button className="button button--primary" onClick={() => onNavigate('closeout')}>View customer closeout <ArrowRight size={17} /></button>
          ) : (
            <>
              <div><strong>{workflow.afterPhotoAdded ? 'Required proof complete' : '1 item left'}</strong><small>{workflow.afterPhotoAdded ? 'Job is ready to close' : 'Add an after photo to complete'}</small></div>
              <button className="button button--primary" disabled={!workflow.afterPhotoAdded} onClick={completeJob}>Complete job <ArrowRight size={17} /></button>
            </>
          )}
        </footer>
        {toast && <div className="tech-toast"><CheckCircle2 size={17} /> {toast}</div>}
      </div>
      <div className="technician-demo__note"><span>Technician view</span><strong>Designed for one-handed field use</strong><button onClick={() => onNavigate('office')}>Return to office <ArrowRight size={15} /></button></div>
    </div>
  )
}

function WorkStep() {
  return (
    <section className="tech-step-panel">
      <div className="tech-step-heading"><div><h2>Work checklist</h2><p>3 of 3 tasks complete</p></div><span className="completion-ring">100%</span></div>
      <div className="work-checklist"><label><input type="checkbox" defaultChecked /><span><strong>Protect work area</strong><small>Cones and pedestrian path in place</small></span></label><label><input type="checkbox" defaultChecked /><span><strong>Remove failed concrete</strong><small>Loose material removed to sound edge</small></span></label><label><input type="checkbox" defaultChecked /><span><strong>Install and finish repair</strong><small>High-strength patch placed and finished</small></span></label></div>
      <div className="time-entry"><Clock3 size={18} /><span><small>Time on site</small><strong>2 hr 24 min</strong></span><button>Review</button></div>
    </section>
  )
}

function PhotosStep({ afterPhotoAdded, onAdd }: { afterPhotoAdded: boolean; onAdd: () => void }) {
  return (
    <section className="tech-step-panel photos-step">
      <div className="tech-step-heading"><div><h2>Job photos</h2><p>Before, during, and after proof</p></div><Camera size={20} /></div>
      <div className="proof-list">
        <div><ProofPhoto kind="before" /><span><strong>Before</strong><small>Required · 8:15 AM</small></span><b><Check size={13} /> Complete</b></div>
        <div><ProofPhoto kind="during" /><span><strong>During</strong><small>1 photo · 9:32 AM</small></span><b><Check size={13} /> Complete</b></div>
        {afterPhotoAdded ? (
          <div><ProofPhoto kind="after" /><span><strong>After</strong><small>Required · Just now</small></span><b><Check size={13} /> Complete</b></div>
        ) : (
          <button className="missing-photo" onClick={onAdd}><span><Camera size={21} /></span><div><strong>After photo</strong><small>Required to complete this job</small></div><b>Required</b></button>
        )}
      </div>
      {!afterPhotoAdded && <button className="camera-button" onClick={onAdd}><Camera size={19} /> Add after photo</button>}
      {afterPhotoAdded && <button className="camera-button camera-button--secondary" onClick={onAdd}><Plus size={18} /> Add another photo</button>}
    </section>
  )
}

function FindingStep({ saved, onSave }: { saved: boolean; onSave: () => void }) {
  return (
    <section className="tech-step-panel finding-step">
      <div className="tech-step-heading"><div><h2>Additional finding</h2><p>Flag work that needs customer approval</p></div><FileWarning size={20} /></div>
      {saved ? (
        <div className="finding-saved"><CheckCircle2 size={28} /><div><strong>Finding sent to the office</strong><p>Drainage extension recommendation is ready for Maya to review and quote.</p></div></div>
      ) : (
        <>
          <label>What did you find?<textarea rows={4} defaultValue="Drainage channel ends before the slope break. Extending the channel about 12 feet would reduce water collecting along this repaired edge." /></label>
          <label>Customer impact<select defaultValue="Prevent future damage"><option>Prevent future damage</option><option>Safety concern</option><option>Access concern</option><option>Cosmetic improvement</option></select></label>
          <button className="button button--primary" onClick={onSave}><Send size={17} /> Send to office for quote</button>
        </>
      )}
    </section>
  )
}

function CloseoutStep({ complete, onComplete }: { complete: boolean; onComplete: () => void }) {
  return (
    <section className="tech-step-panel closeout-step">
      <div className="tech-step-heading"><div><h2>{complete ? 'Job complete' : 'Review closeout'}</h2><p>Customer-ready summary</p></div><ClipboardCheck size={20} /></div>
      <div className="closeout-draft"><span><Sparkles size={16} /> Drafted from approved job notes</span><p>Removed failed concrete beside the drainage channel, prepared the sound edge, installed high-strength repair material, and finished the surface flush to reduce the trip hazard.</p><button>Edit summary</button></div>
      <div className="closeout-checks"><div><Check size={15} /><span><strong>Scope completed</strong><small>3 of 3 work items</small></span></div><div><Check size={15} /><span><strong>Required proof attached</strong><small>Before, during, and after</small></span></div><div><Check size={15} /><span><strong>Site left safe</strong><small>Work area cleaned and reopened</small></span></div></div>
      {!complete && <button className="button button--primary closeout-complete" onClick={onComplete}>Confirm & complete job <ArrowRight size={17} /></button>}
    </section>
  )
}
