import { useState, type FormEvent } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  ImagePlus,
  MapPin,
  ShieldCheck,
  Upload,
  X,
} from 'lucide-react'
import { Brand, RmdwLink } from '../components/Brand'
import { ProofPhoto } from '../components/ProofPhoto'
import type { NavigationProps, WorkflowState } from '../types'

export function CustomerRequest({
  workflow,
  onUpdate,
  onNavigate,
}: NavigationProps & {
  workflow: WorkflowState
  onUpdate: (next: Partial<WorkflowState>) => void
}) {
  const [step, setStep] = useState(workflow.requestSubmitted ? 3 : 1)
  const [uploaded, setUploaded] = useState(true)
  const [urgency, setUrgency] = useState('Standard — within 2 business days')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    onUpdate({ requestSubmitted: true })
    setStep(3)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="customer-portal">
      <header className="portal-header">
        <Brand compact />
        <span className="portal-header__trust"><ShieldCheck size={16} /> Secure customer portal</span>
        <button onClick={() => onNavigate('office')}>Office demo <ArrowRight size={15} /></button>
      </header>

      {step < 3 ? (
        <main className="request-page">
          <div className="request-page__intro">
            <span className="portal-customer"><span>NS</span> Northline Storage Group</span>
            <h1>Tell us what needs attention.</h1>
            <p>Add a few details and photos. The maintenance team will review everything and keep you updated here.</p>
            <div className="request-steps" aria-label={`Step ${step} of 2`}>
              <div className="is-active"><span>{step > 1 ? <Check size={14} /> : 1}</span><strong>Issue details</strong></div>
              <i />
              <div className={step === 2 ? 'is-active' : ''}><span>2</span><strong>Photos & contact</strong></div>
            </div>
          </div>

          <form className="request-form" onSubmit={submit}>
            {step === 1 ? (
              <>
                <div className="form-section-heading"><span>1</span><div><h2>Where is the issue?</h2><p>Choosing the right property helps us route it faster.</p></div></div>
                <label className="field-label">Property<div className="select-control"><Building2 size={18} /><select defaultValue="Riverbend Storage — Building C"><option>Riverbend Storage — Building C</option><option>Oak Mill Storage</option><option>Westhaven Storage</option></select><ChevronDown size={16} /></div></label>
                <label className="field-label">Specific area or location<div className="input-control"><MapPin size={18} /><input defaultValue="Drive aisle · Units C118–C126" /></div><small>Examples: unit range, building, gate, hallway, or parking area</small></label>
                <div className="field-label">What type of issue is this?<div className="issue-options"><button type="button" className="is-selected"><span>▧</span>Concrete / pavement</button><button type="button"><span>⌂</span>Building exterior</button><button type="button"><span>↗</span>Door / access</button><button type="button"><span>•••</span>Something else</button></div></div>
                <label className="field-label">What happened?<textarea defaultValue="The concrete beside the drain has broken away and carts are catching on the edge. Please inspect and make safe." rows={4} /></label>
                <div className="form-footer"><span><Clock3 size={16} /> Usually reviewed within 30 minutes</span><button type="button" className="button button--primary" onClick={() => setStep(2)}>Continue to photos <ArrowRight size={17} /></button></div>
              </>
            ) : (
              <>
                <button type="button" className="back-link" onClick={() => setStep(1)}><ArrowLeft size={16} /> Issue details</button>
                <div className="form-section-heading"><span>2</span><div><h2>Show us what you see.</h2><p>Photos help the team arrive prepared and reduce follow-up.</p></div></div>
                <div className="upload-zone">
                  {uploaded ? (
                    <div className="uploaded-media"><ProofPhoto kind="before" /><div><strong>drainage-edge.jpg</strong><small>2.4 MB · Ready to send</small></div><button type="button" onClick={() => setUploaded(false)}><X size={17} /></button></div>
                  ) : (
                    <label><input type="file" accept="image/*,video/*" onChange={() => setUploaded(true)} /><span><Upload size={22} /></span><strong>Add photos or video</strong><small>Take a photo now or choose from your device</small></label>
                  )}
                  <button type="button" className="upload-zone__add" onClick={() => setUploaded(true)}><ImagePlus size={17} /> Add another</button>
                </div>
                <label className="field-label">How quickly does this need attention?<div className="select-control"><Clock3 size={18} /><select value={urgency} onChange={(e) => setUrgency(e.target.value)}><option>Standard — within 2 business days</option><option>Urgent — safety or access risk</option><option>Plan it — no immediate impact</option></select><ChevronDown size={16} /></div></label>
                <div className="contact-confirm"><span className="avatar">DP</span><div><small>Updates will go to</small><strong>Dana Pierce · dana@example.com</strong></div><button type="button">Edit</button></div>
                <div className="form-footer"><span><ShieldCheck size={16} /> Shared only with your maintenance team</span><button type="submit" className="button button--primary">Send request <ArrowRight size={17} /></button></div>
              </>
            )}
          </form>
        </main>
      ) : (
        <RequestConfirmation onNavigate={onNavigate} />
      )}
      <footer className="portal-footer"><RmdwLink /><span>Need help? (404) 555-0198</span></footer>
    </div>
  )
}

function RequestConfirmation({ onNavigate }: NavigationProps) {
  return (
    <main className="confirmation-page">
      <div className="confirmation-icon"><CheckCircle2 size={34} /></div>
      <span className="portal-customer"><span>NS</span> Northline Storage Group</span>
      <h1>Your request is in.</h1>
      <p>The office has everything it needs to review the concrete issue. We’ll notify you as soon as the work is scheduled.</p>
      <section className="confirmation-card">
        <header><div><small>REQUEST</small><strong>REQ-98432</strong></div><span>Received just now</span></header>
        <div className="confirmation-card__issue"><ProofPhoto kind="before" /><div><strong>Spalled concrete at drainage edge</strong><p>Riverbend Storage — Building C</p><small><MapPin size={13} /> Drive aisle · Units C118–C126</small></div></div>
        <div className="tracking-line"><div className="is-complete"><i><Check size={12} /></i><span><strong>Request received</strong><small>We have your photos and details</small></span></div><div><i>2</i><span><strong>Office review</strong><small>Next: assignment and schedule</small></span></div><div><i>3</i><span><strong>Work scheduled</strong><small>You’ll receive an appointment update</small></span></div></div>
      </section>
      <div className="confirmation-actions"><button className="button button--secondary"><Camera size={17} /> Add another photo</button><button className="button button--primary" onClick={() => onNavigate('office')}>Continue to office triage <ArrowRight size={17} /></button></div>
      <p className="confirmation-note"><CheckCircle2 size={15} /> A tracking link was sent to dana@example.com</p>
    </main>
  )
}
