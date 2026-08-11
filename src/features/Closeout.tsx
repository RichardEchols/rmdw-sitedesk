import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Clock3,
  Download,
  FileCheck2,
  MapPin,
  Printer,
  ShieldCheck,
} from 'lucide-react'
import { Brand, RmdwLink } from '../components/Brand'
import { ProofPhoto } from '../components/ProofPhoto'
import type { NavigationProps, WorkflowState } from '../types'

export function Closeout({ workflow, onNavigate }: NavigationProps & { workflow: WorkflowState }) {
  return (
    <div className="customer-portal closeout-portal">
      <header className="portal-header"><Brand compact /><span className="portal-header__trust"><ShieldCheck size={16} /> Verified job record</span><button onClick={() => onNavigate('office')}><ArrowLeft size={15} /> Office demo</button></header>
      <main className="closeout-page">
        <div className="closeout-page__heading">
          <div><span className="closeout-status"><CheckCircle2 size={16} /> Work complete</span><h1>Concrete edge repaired and site left safe.</h1><p>A clear record of the work completed at Riverbend Storage — Building C.</p></div>
          <div className="closeout-page__actions"><button><Printer size={16} /> Print</button><button><Download size={16} /> Download PDF</button></div>
        </div>
        <section className="closeout-identity">
          <div><small>JOB</small><strong>JOB-2521</strong></div><div><Building2 size={17} /><span><small>Property</small><strong>Riverbend Storage — Building C</strong></span></div><div><MapPin size={17} /><span><small>Location</small><strong>Drive aisle · Units C118–C126</strong></span></div><div><Clock3 size={17} /><span><small>Completed</small><strong>{workflow.jobCompleted ? 'Aug 11 · 10:37 AM' : 'Demo preview'}</strong></span></div>
        </section>
        <section className="closeout-summary">
          <div><span>WORK SUMMARY</span><h2>What we completed</h2><p>Removed failed concrete beside the drainage channel, prepared the sound edge, installed high-strength repair material, and finished the surface flush to reduce the trip hazard.</p><div className="completed-scope"><span><Check size={14} /> Protected the work area</span><span><Check size={14} /> Removed failed material</span><span><Check size={14} /> Installed and finished repair</span><span><Check size={14} /> Cleaned and reopened the site</span></div></div>
          <aside><div className="technician-signoff"><span className="avatar">JL</span><span><small>Completed by</small><strong>Jordan Lee</strong><p>Field technician</p></span></div><div><small>Time on site</small><strong>2 hr 24 min</strong></div><div><small>Office review</small><strong>Maya Patel · 10:44 AM</strong></div></aside>
        </section>
        <section className="proof-story">
          <header><div><span>VISUAL PROOF</span><h2>From issue to finished work</h2></div><p>Captured on site and reviewed by the office.</p></header>
          <div className="proof-story__grid"><figure><ProofPhoto kind="before" /><figcaption><strong>Before</strong><span>8:15 AM</span></figcaption></figure><figure><ProofPhoto kind="during" /><figcaption><strong>During repair</strong><span>9:32 AM</span></figcaption></figure><figure><ProofPhoto kind="after" /><figcaption><strong>After</strong><span>10:32 AM</span></figcaption></figure></div>
        </section>
        <section className="invoice-ready"><span><FileCheck2 size={22} /></span><div><small>OFFICE STATUS</small><h2>Ready to invoice</h2><p>Required work, technician proof, and office review are complete.</p></div><button className="button button--secondary" onClick={() => onNavigate('office')}>Return to Today <ArrowRight size={17} /></button></section>
        <p className="closeout-reference">Keep this page for your records · Job reference JOB-2521</p>
      </main>
      <footer className="portal-footer"><RmdwLink /><span>Questions about this work? (404) 555-0198</span></footer>
    </div>
  )
}
