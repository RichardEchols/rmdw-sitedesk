import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  FileText,
  Grid2X2,
  HardHat,
  MapPin,
  MessageSquareText,
  MoreHorizontal,
  Search,
  Send,
  Users,
  Wrench,
  X,
} from 'lucide-react'
import { activeJobs, attentionItems, properties, quoteLines, timeline } from '../data'
import { Brand } from '../components/Brand'
import { ProofPhoto, type ProofPhotoKind } from '../components/ProofPhoto'
import type { OfficeSection, View, WorkflowState } from '../types'

const navItems = [
  { label: 'Today' as const, icon: Grid2X2 },
  { label: 'Requests' as const, icon: ClipboardList },
  { label: 'Jobs' as const, icon: HardHat },
  { label: 'Schedule' as const, icon: CalendarDays },
  { label: 'Quotes' as const, icon: FileText },
  { label: 'Customers' as const, icon: Users },
]

type OfficeProps = {
  workflow: WorkflowState
  onUpdate: (next: Partial<WorkflowState>) => void
  onNavigate: (view: View) => void
}

export function Office({ workflow, onUpdate, onNavigate }: OfficeProps) {
  const [section, setSection] = useState<OfficeSection>('Today')
  const [triageOpen, setTriageOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [selectedJob, setSelectedJob] = useState('JOB-2521')

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2800)
  }

  const convertRequest = () => {
    onUpdate({ requestConverted: true })
    setTriageOpen(false)
    showToast('JOB-2521 created and assigned to Jordan Lee')
  }

  return (
    <div className="office-shell">
      <aside className="sidebar">
        <Brand />
        <nav aria-label="Office navigation">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.label}
                className={section === item.label ? 'is-active' : ''}
                onClick={() => setSection(item.label)}
              >
                <Icon size={19} strokeWidth={1.8} />
                <span>{item.label}</span>
                {item.label === 'Requests' && !workflow.requestConverted && <i>1</i>}
              </button>
            )
          })}
        </nav>
        <div className="sidebar__bottom">
          <button className="sidebar__workspace" onClick={() => onNavigate('request')}>
            <span className="avatar">MP</span>
            <span>
              <strong>Maya Patel</strong>
              <small>Office coordinator</small>
            </span>
            <ChevronRight size={16} />
          </button>
        </div>
      </aside>

      <main className="office-main">
        <header className="office-header">
          <div>
            <h1>{section === 'Today' ? 'Good morning, Maya' : section}</h1>
            <p>{section === 'Today' ? 'Tuesday, August 11  ·  3 items need attention' : sectionSubtitle(section)}</p>
          </div>
          <div className="office-header__actions">
            <button className="icon-button" aria-label="Search"><Search size={18} /></button>
            <button className="button button--secondary" onClick={() => onNavigate('request')}>
              Customer request
            </button>
            <button className="button button--primary" onClick={() => setTriageOpen(true)}>
              Triage request <ArrowRight size={17} />
            </button>
          </div>
        </header>

        {section === 'Today' && (
          <Today
            workflow={workflow}
            selectedJob={selectedJob}
            setSelectedJob={setSelectedJob}
            onTriage={() => setTriageOpen(true)}
            onNavigate={onNavigate}
          />
        )}
        {section === 'Requests' && <Requests workflow={workflow} onTriage={() => setTriageOpen(true)} />}
        {section === 'Jobs' && <Jobs workflow={workflow} onNavigate={onNavigate} />}
        {section === 'Schedule' && <Schedule />}
        {section === 'Quotes' && <Quotes workflow={workflow} onNavigate={onNavigate} />}
        {section === 'Customers' && <Customers />}
      </main>

      {triageOpen && (
        <TriageDrawer
          converted={workflow.requestConverted}
          onClose={() => setTriageOpen(false)}
          onConvert={convertRequest}
        />
      )}
      {toast && <div className="toast"><CheckCircle2 size={18} /> {toast}</div>}
    </div>
  )
}

function sectionSubtitle(section: OfficeSection) {
  const subtitles: Record<OfficeSection, string> = {
    Today: '',
    Requests: 'Review complete context before turning a request into work.',
    Jobs: 'Follow every job from assigned to invoice-ready.',
    Schedule: 'A focused view of technician capacity and site commitments.',
    Quotes: 'Keep additional work moving without customer follow-up gaps.',
    Customers: 'Organizations, properties, locations, and their work history.',
  }
  return subtitles[section]
}

function Today({
  workflow,
  selectedJob,
  setSelectedJob,
  onTriage,
  onNavigate,
}: {
  workflow: WorkflowState
  selectedJob: string
  setSelectedJob: (id: string) => void
  onTriage: () => void
  onNavigate: (view: View) => void
}) {
  const attentionCount = workflow.requestConverted ? 2 : 3
  return (
    <div className="today-view">
      <section className="attention-rail" aria-label="Attention summary">
        <div className="attention-rail__title">
          <span>{attentionCount}</span>
          <strong>Needs attention</strong>
        </div>
        <div><AlertTriangle size={17} /><span><strong>Schedule exception</strong><small>Start window</small></span></div>
        <div><CircleDollarSign size={17} /><span><strong>Quote approval</strong><small>$1,860 waiting</small></span></div>
        {!workflow.requestConverted && <div><MessageSquareText size={17} /><span><strong>New request</strong><small>Ready to triage</small></span></div>}
      </section>

      <div className="today-grid">
        <section className="attention-list section-block">
          <div className="section-heading">
            <div><h2>Needs your attention</h2><p>Ordered by customer impact</p></div>
            <button className="icon-button"><MoreHorizontal size={18} /></button>
          </div>
          {attentionItems
            .filter((item) => !(workflow.requestConverted && item.kind === 'request'))
            .map((item) => (
              <button className="attention-row" key={item.kind} onClick={item.kind === 'request' ? onTriage : undefined}>
                <span className={`attention-row__icon attention-row__icon--${item.kind}`}>
                  {item.kind === 'request' ? <MessageSquareText size={18} /> : item.kind === 'schedule' ? <AlertTriangle size={18} /> : <CircleDollarSign size={18} />}
                </span>
                <span className="attention-row__content">
                  <span><strong>{item.title}</strong><small>{item.meta}</small></span>
                  <b>{item.detail}</b>
                  <small>{item.property}</small>
                </span>
                <ChevronRight size={17} />
              </button>
            ))}
          {workflow.requestConverted && (
            <div className="resolved-state"><Check size={18} /><span><strong>New request triaged</strong><small>Job created and assigned</small></span></div>
          )}
        </section>

        <section className="work-list section-block">
          <div className="section-heading">
            <div><h2>Active work</h2><p>4 jobs across 3 properties</p></div>
            <button className="filter-button">All properties <ChevronDown size={15} /></button>
          </div>
          <div className="work-list__rows">
            {activeJobs.map((job) => (
              <button
                className={`job-row ${selectedJob === job.id ? 'is-selected' : ''}`}
                key={job.id}
                onClick={() => setSelectedJob(job.id)}
              >
                <ProofPhoto kind={job.image as ProofPhotoKind} />
                <span className="job-row__content">
                  <span><b className={`status-dot status-dot--${job.status.toLowerCase().replace(' ', '-')}`}>{job.status}</b><small>{job.id}</small></span>
                  <strong>{job.property}</strong>
                  <small>{job.location}</small>
                  <small>{job.time}</small>
                </span>
                <ChevronRight size={17} />
              </button>
            ))}
          </div>
        </section>

        <JobDetail workflow={workflow} onNavigate={onNavigate} />
      </div>
    </div>
  )
}

function JobDetail({ workflow, onNavigate }: { workflow: WorkflowState; onNavigate: (view: View) => void }) {
  const status = workflow.jobCompleted ? 'Ready to invoice' : 'In progress'
  return (
    <aside className="job-detail section-block">
      <div className="job-detail__topline"><span className={`status-badge ${workflow.jobCompleted ? 'status-badge--ready' : ''}`}>{status}</span><small>JOB-2521</small></div>
      <h2>Riverbend Storage — Building C</h2>
      <p className="job-detail__location"><MapPin size={15} /> Drive aisle · Units C118–C126</p>
      <div className="job-detail__meta">
        <div><Building2 size={18} /><span><small>Customer</small><strong>Northline Storage Group</strong></span></div>
        <div><CalendarDays size={18} /><span><small>Scheduled</small><strong>Today · 8:00–11:00 AM</strong></span></div>
        <div><HardHat size={18} /><span><small>Technician</small><strong>Jordan Lee</strong></span></div>
      </div>
      <div className="job-detail__scope">
        <small>Issue</small>
        <h3>Spalled concrete at drainage edge</h3>
        <p>Section of concrete along the drainage channel has spalled and is a trip hazard.</p>
      </div>
      <div className="job-detail__photos">
        <div className="section-heading section-heading--compact"><div><h3>Proof</h3><p>{workflow.afterPhotoAdded ? 'Before, during & after complete' : '2 of 3 required views'}</p></div><button onClick={() => onNavigate('technician')}>Open field view</button></div>
        <div className="photo-pair">
          <div><ProofPhoto kind="before" /><span>Before</span></div>
          <div><ProofPhoto kind={workflow.afterPhotoAdded ? 'after' : 'during'} /><span>{workflow.afterPhotoAdded ? 'After' : 'During'}</span></div>
        </div>
      </div>
      <div className="timeline">
        <h3>Timeline</h3>
        {timeline.map((item, i) => {
          const done = workflow.jobCompleted || item.done
          return <div className={done ? 'is-done' : ''} key={item.label}><i>{done && <Check size={11} />}</i><span><strong>{workflow.jobCompleted && i === 3 ? 'Job completed' : item.label}</strong><small>{workflow.jobCompleted && i === 3 ? 'Aug 11 · 10:37 AM' : item.time}</small></span></div>
        })}
      </div>
    </aside>
  )
}

function Requests({ workflow, onTriage }: { workflow: WorkflowState; onTriage: () => void }) {
  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="tab-set"><button className="is-active">Needs review <span>{workflow.requestConverted ? 0 : 1}</span></button><button>Converted</button><button>All requests</button></div>
        <button className="filter-button"><Clock3 size={15} /> Newest first <ChevronDown size={14} /></button>
      </div>
      {!workflow.requestConverted ? (
        <button className="request-feature" onClick={onTriage}>
          <ProofPhoto kind="before" />
          <span className="request-feature__body">
            <span className="request-feature__eyeline"><b>NEW · 8:24 AM</b><small>REQ-98432</small></span>
            <h2>Spalled concrete at drainage edge</h2>
            <p>Northline Storage Group · Riverbend Storage — Building C</p>
            <span className="request-feature__details"><MapPin size={15} /> Drive aisle · Units C118–C126 <Camera size={15} /> 2 photos</span>
          </span>
          <span className="request-feature__action">Review request <ChevronRight size={18} /></span>
        </button>
      ) : (
        <div className="empty-success"><CheckCircle2 size={32} /><h2>Inbox clear</h2><p>The Riverbend request is now JOB-2521 and Jordan has been notified.</p></div>
      )}
    </div>
  )
}

function Jobs({ workflow, onNavigate }: { workflow: WorkflowState; onNavigate: (view: View) => void }) {
  const columns = ['New', 'Scheduled', 'In progress', 'Awaiting approval', 'Ready to invoice']
  return (
    <div className="content-page jobs-board">
      <div className="page-toolbar"><div className="tab-set"><button className="is-active">Board</button><button>List</button></div><button className="filter-button">All technicians <ChevronDown size={14} /></button></div>
      <div className="board-columns">
        {columns.map((column, index) => (
          <section key={column}>
            <header><span><i className={`board-dot board-dot--${index}`} />{column}</span><b>{column === (workflow.jobCompleted ? 'Ready to invoice' : 'In progress') ? 1 : index === 1 ? 2 : 0}</b></header>
            {column === (workflow.jobCompleted ? 'Ready to invoice' : 'In progress') && (
              <button className="board-card" onClick={() => onNavigate(workflow.jobCompleted ? 'closeout' : 'technician')}>
                <ProofPhoto kind={workflow.jobCompleted ? 'after' : 'before'} />
                <small>JOB-2521</small>
                <strong>Riverbend Storage — Building C</strong>
                <span><MapPin size={13} /> Drive aisle · C118–C126</span>
                <footer><span className="avatar avatar--small">JL</span><span>{workflow.jobCompleted ? 'Proof complete' : 'Today · 8–11 AM'}</span></footer>
              </button>
            )}
            {column === 'Scheduled' && <button className="board-card board-card--plain"><small>JOB-2522</small><strong>Pinecrest Plaza · Unit 12</strong><span><Wrench size={13} /> Roof hatch assessment</span><footer><span className="avatar avatar--small">AB</span><span>Today · 12–2 PM</span></footer></button>}
          </section>
        ))}
      </div>
    </div>
  )
}

function Schedule() {
  const techs = ['Jordan Lee', 'Amari Brooks', 'Nia Thomas']
  return (
    <div className="content-page schedule-page">
      <div className="page-toolbar"><div className="date-nav"><button>‹</button><strong>August 11–15</strong><button>›</button><span>Today</span></div><button className="filter-button">Week <ChevronDown size={14} /></button></div>
      <div className="schedule-grid">
        <div className="schedule-grid__corner">Technician</div>
        {['Tue 11', 'Wed 12', 'Thu 13', 'Fri 14', 'Sat 15'].map((day, i) => <div className={i === 0 ? 'is-today' : ''} key={day}><small>{day.split(' ')[0]}</small><strong>{day.split(' ')[1]}</strong></div>)}
        {techs.map((tech, row) => (
          <div className="schedule-grid__row" key={tech}>
            <div className="tech-cell"><span className="avatar avatar--small">{tech.split(' ').map(n => n[0]).join('')}</span><span><strong>{tech}</strong><small>{row === 0 ? '2 jobs · 5.5 hrs' : '1 job · 2 hrs'}</small></span></div>
            {[0,1,2,3,4].map((day) => <div className="day-cell" key={day}>{day === row && <button className={`schedule-job schedule-job--${row}`}><small>{row === 0 ? '8:00–11:00' : row === 1 ? '12:00–2:00' : '9:00–11:00'}</small><strong>{row === 0 ? 'Riverbend Storage' : row === 1 ? 'Pinecrest Plaza' : 'Lakeside Commons'}</strong><span>{row === 0 ? 'Concrete repair' : row === 1 ? 'Roof hatch' : 'Entry repair'}</span></button>}</div>)}
          </div>
        ))}
      </div>
    </div>
  )
}

function Quotes({ workflow, onNavigate }: { workflow: WorkflowState; onNavigate: (view: View) => void }) {
  const total = quoteLines.reduce((sum, line) => sum + line.amount, 0)
  return (
    <div className="content-page quotes-page">
      <div className="quote-summary"><div><small>Awaiting approval</small><strong>{workflow.quoteApproved ? '0' : '1'}</strong></div><div><small>Approved this month</small><strong>{workflow.quoteApproved ? '9' : '8'}</strong></div><div><small>Approval value</small><strong>{workflow.quoteApproved ? '$0' : '$1,860'}</strong></div></div>
      <article className="quote-row">
        <ProofPhoto kind="before" />
        <div><span className={`status-badge ${workflow.quoteApproved ? 'status-badge--ready' : ''}`}>{workflow.quoteApproved ? 'Approved' : 'Awaiting approval'}</span><h2>Drainage-edge concrete repair</h2><p>Northline Storage Group · Riverbend Storage — Building C</p><small>Q-10073 · Sent today at 10:48 AM</small></div>
        <div className="quote-row__amount"><small>Total</small><strong>${total.toLocaleString()}</strong><button className="button button--secondary" onClick={() => onNavigate('quote')}>{workflow.quoteApproved ? 'View decision' : 'Preview approval'} <ChevronRight size={16} /></button></div>
      </article>
    </div>
  )
}

function Customers() {
  const [selected, setSelected] = useState(0)
  const customer = properties[selected]
  return (
    <div className="content-page customers-page">
      <div className="customer-list">
        <div className="customer-search"><Search size={16} /><input aria-label="Search customers" placeholder="Search organizations or properties" /></div>
        {properties.map((item, index) => <button className={selected === index ? 'is-selected' : ''} key={item.customer} onClick={() => setSelected(index)}><span className="customer-monogram">{item.customer.split(' ').slice(0,2).map(w => w[0]).join('')}</span><span><strong>{item.customer}</strong><small>{item.properties} properties · {item.openJobs} open jobs</small></span><ChevronRight size={16} /></button>)}
      </div>
      <div className="customer-detail">
        <span className="customer-monogram customer-monogram--large">{customer.customer.split(' ').slice(0,2).map(w => w[0]).join('')}</span>
        <h2>{customer.customer}</h2><p>{customer.contact}</p>
        <div className="customer-kpis"><div><strong>{customer.properties}</strong><small>Properties</small></div><div><strong>{customer.openJobs}</strong><small>Open jobs</small></div><div><strong>18</strong><small>Completed YTD</small></div></div>
        <h3>Properties</h3>
        <div className="property-list">{customer.locations.map((location, i) => <button key={location}><Building2 size={18} /><span><strong>{location}</strong><small>{i === 0 ? 'Building C · 1 active job' : 'No active work'}</small></span><ChevronRight size={16} /></button>)}</div>
      </div>
    </div>
  )
}

function TriageDrawer({ converted, onClose, onConvert }: { converted: boolean; onClose: () => void; onConvert: () => void }) {
  const [priority, setPriority] = useState('Standard')
  const [tech, setTech] = useState('Jordan Lee')
  const readiness = useMemo(() => ['Property and location', 'Issue context', 'Customer photos', 'Site contact'], [])
  return (
    <div className="drawer-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="triage-drawer">
        <header><div><small>REQ-98432 · Received 8:24 AM</small><h2>Triage request</h2></div><button className="icon-button" onClick={onClose}><X size={20} /></button></header>
        <div className="triage-drawer__body">
          <div className="triage-photos"><ProofPhoto kind="before" /><ProofPhoto kind="before" /></div>
          <span className="requester-line"><span className="avatar avatar--small">DP</span><span><strong>Dana Pierce</strong><small>Northline Storage Group</small></span><span>Customer portal</span></span>
          <h3>Spalled concrete at drainage edge</h3>
          <p>“The concrete beside the drain has broken away and carts are catching on the edge. Please inspect and make safe.”</p>
          <div className="location-card"><MapPin size={18} /><span><small>Property location</small><strong>Riverbend Storage — Building C</strong><p>Drive aisle · Units C118–C126</p></span></div>
          <div className="readiness-check"><span><strong>Ready to schedule</strong><small>All required context is present</small></span>{readiness.map(item => <div key={item}><Check size={14} />{item}</div>)}</div>
          <div className="form-grid">
            <label>Priority<select value={priority} onChange={(e) => setPriority(e.target.value)}><option>Standard</option><option>Urgent</option><option>Low</option></select></label>
            <label>Assign technician<select value={tech} onChange={(e) => setTech(e.target.value)}><option>Jordan Lee</option><option>Amari Brooks</option><option>Nia Thomas</option></select></label>
            <label className="form-grid__wide">Schedule window<input value="Today · 8:00 AM – 11:00 AM" readOnly /></label>
          </div>
        </div>
        <footer>
          <div><Send size={16} /><span><strong>On creation</strong><small>Jordan and Dana will be notified</small></span></div>
          <button className="button button--primary" onClick={onConvert} disabled={converted}>{converted ? 'Job already created' : 'Create & assign job'} <ArrowRight size={17} /></button>
        </footer>
      </aside>
    </div>
  )
}
