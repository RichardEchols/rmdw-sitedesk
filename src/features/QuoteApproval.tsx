import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  Download,
  FileText,
  HelpCircle,
  MapPin,
  MessageSquareText,
  ShieldCheck,
} from 'lucide-react'
import { Brand, RmdwLink } from '../components/Brand'
import { ProofPhoto } from '../components/ProofPhoto'
import { quoteLines } from '../data'
import type { NavigationProps, WorkflowState } from '../types'

export function QuoteApproval({
  workflow,
  onUpdate,
  onNavigate,
}: NavigationProps & {
  workflow: WorkflowState
  onUpdate: (next: Partial<WorkflowState>) => void
}) {
  const [questionOpen, setQuestionOpen] = useState(false)
  const total = quoteLines.reduce((sum, line) => sum + line.amount, 0)

  const approve = () => {
    onUpdate({ quoteApproved: true })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="customer-portal quote-portal">
      <header className="portal-header"><Brand compact /><span className="portal-header__trust"><ShieldCheck size={16} /> Secure approval link</span><button onClick={() => onNavigate('office')}><ArrowLeft size={15} /> Office demo</button></header>
      <main className="quote-page">
        {workflow.quoteApproved ? (
          <section className="quote-approved">
            <div className="confirmation-icon"><CheckCircle2 size={34} /></div>
            <span>QUOTE Q-10073</span><h1>Approved. We’ll take it from here.</h1><p>You approved $1,860 in additional work for Riverbend Storage — Building C. The office has been notified and will confirm scheduling.</p>
            <div className="decision-receipt"><div><small>Decision</small><strong>Approved</strong></div><div><small>Approved total</small><strong>$1,860</strong></div><div><small>Recorded</small><strong>Aug 11 · 11:06 AM</strong></div></div>
            <button className="button button--primary" onClick={() => onNavigate('closeout')}>View completed work <ArrowRight size={17} /></button>
          </section>
        ) : (
          <>
            <div className="quote-page__heading"><div><span>QUOTE Q-10073</span><h1>Protect the repaired edge from repeat water damage.</h1><p>Review the finding, scope, and price below. Approve when you’re ready—no login required.</p></div><div className="quote-total"><small>Total</small><strong>${total.toLocaleString()}</strong><span>Valid through August 25</span></div></div>
            <section className="quote-context">
              <ProofPhoto kind="before" />
              <div><span className="quote-context__label">ADDITIONAL WORK FOUND ON SITE</span><h2>Extend the drainage channel past the slope break</h2><p>The existing channel stops before runoff clears the repaired concrete. Extending it approximately 12 feet will move water beyond the edge and reduce repeat deterioration.</p><div><span><Building2 size={16} /> Riverbend Storage — Building C</span><span><MapPin size={16} /> Drive aisle · Units C118–C126</span></div></div>
            </section>
            <section className="quote-scope">
              <header><div><h2>Scope & price</h2><p>Everything included in this approval.</p></div><button><Download size={16} /> Download PDF</button></header>
              {quoteLines.map((line, index) => <div className="quote-line" key={line.description}><span>{index + 1}</span><p>{line.description}</p><strong>${line.amount.toLocaleString()}</strong></div>)}
              <footer><span><small>Estimated duration</small><strong>1 day · 2-person crew</strong></span><span><small>Total</small><strong>${total.toLocaleString()}</strong></span></footer>
            </section>
            <section className="quote-terms"><div><CalendarDays size={18} /><span><strong>Scheduling</strong><small>The office will confirm a date after approval.</small></span></div><div><ShieldCheck size={18} /><span><strong>Workmanship</strong><small>Includes site protection, cleanup, and final photo report.</small></span></div><div><FileText size={18} /><span><strong>Billing</strong><small>Invoiced after completed work is documented.</small></span></div></section>
            {questionOpen && <div className="quote-question"><label>Ask the office a question<textarea autoFocus rows={3} placeholder="Type your question here…" /></label><button className="button button--secondary" onClick={() => setQuestionOpen(false)}>Send question</button></div>}
            <div className="quote-actions"><button className="button button--secondary" onClick={() => setQuestionOpen(!questionOpen)}><MessageSquareText size={17} /> Ask a question</button><button className="button button--primary" onClick={approve}><Check size={18} /> Approve ${total.toLocaleString()}</button></div>
            <p className="quote-disclaimer"><ShieldCheck size={14} /> Your approval is securely recorded with the quote version, date, and time.</p>
          </>
        )}
      </main>
      <footer className="portal-footer"><RmdwLink /><span><HelpCircle size={14} /> Questions? Contact Maya at (404) 555-0198</span></footer>
    </div>
  )
}
