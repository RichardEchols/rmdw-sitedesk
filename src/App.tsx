import { useEffect, useState } from 'react'
import '@fontsource/manrope/400.css'
import '@fontsource/manrope/500.css'
import '@fontsource/manrope/600.css'
import '@fontsource/manrope/700.css'
import { DemoJourney } from './components/DemoJourney'
import { Office } from './features/Office'
import { CustomerRequest } from './features/CustomerRequest'
import { Technician } from './features/Technician'
import { QuoteApproval } from './features/QuoteApproval'
import { Closeout } from './features/Closeout'
import type { View, WorkflowState } from './types'
import './App.css'

const views: View[] = ['office', 'request', 'technician', 'quote', 'closeout']

function viewFromHash(): View {
  const hash = window.location.hash.replace('#/', '') as View
  return views.includes(hash) ? hash : 'office'
}

function App() {
  const [view, setView] = useState<View>(viewFromHash)
  const [journeyOpen, setJourneyOpen] = useState(false)
  const [workflow, setWorkflow] = useState<WorkflowState>({
    requestSubmitted: false,
    requestConverted: false,
    afterPhotoAdded: false,
    jobCompleted: false,
    quoteApproved: false,
  })

  useEffect(() => {
    const onHashChange = () => setView(viewFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navigate = (next: View) => {
    setView(next)
    setJourneyOpen(false)
    window.location.hash = `/${next}`
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const updateWorkflow = (next: Partial<WorkflowState>) => {
    setWorkflow((current) => ({ ...current, ...next }))
  }

  return (
    <>
      {view === 'office' && <Office workflow={workflow} onUpdate={updateWorkflow} onNavigate={navigate} />}
      {view === 'request' && <CustomerRequest workflow={workflow} onUpdate={updateWorkflow} onNavigate={navigate} />}
      {view === 'technician' && <Technician workflow={workflow} onUpdate={updateWorkflow} onNavigate={navigate} />}
      {view === 'quote' && <QuoteApproval workflow={workflow} onUpdate={updateWorkflow} onNavigate={navigate} />}
      {view === 'closeout' && <Closeout workflow={workflow} onNavigate={navigate} />}
      <DemoJourney active={view} open={journeyOpen} onToggle={() => setJourneyOpen((open) => !open)} onNavigate={navigate} />
    </>
  )
}

export default App
