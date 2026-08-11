import { useEffect, useState } from 'react'
import '@fontsource/manrope/400.css'
import '@fontsource/manrope/500.css'
import '@fontsource/manrope/600.css'
import '@fontsource/manrope/700.css'
import { DemoJourney } from './components/DemoJourney'
import { RoleEntry } from './components/RoleEntry'
import { Orientation } from './components/Orientation'
import { Office } from './features/Office'
import { CustomerRequest } from './features/CustomerRequest'
import { Technician } from './features/Technician'
import { QuoteApproval } from './features/QuoteApproval'
import { Closeout } from './features/Closeout'
import { AccountBar, AuthGate, type SignedInUser } from './components/AuthGate'
import type { View, WorkflowState } from './types'
import './App.css'

const views: View[] = ['office', 'request', 'technician', 'quote', 'closeout']

function viewFromHash(): View {
  const hash = window.location.hash.replace('#/', '') as View
  return views.includes(hash) ? hash : 'office'
}

function Workspace({ user, signOut }: { user: SignedInUser; signOut: () => Promise<void> }) {
  const [view, setView] = useState<View>(viewFromHash)
  const [journeyOpen, setJourneyOpen] = useState(false)
  const [roleEntryOpen, setRoleEntryOpen] = useState(false)
  const [orientationOpen, setOrientationOpen] = useState(false)
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
    setRoleEntryOpen(false)
    setOrientationOpen(false)
    window.location.hash = `/${next}`
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const updateWorkflow = (next: Partial<WorkflowState>) => {
    setWorkflow((current) => ({ ...current, ...next }))
  }

  const enterRole = (next: View) => {
    navigate(next)
    setOrientationOpen(true)
  }

  useEffect(() => {
    const home: View = user.role === 'technician' ? 'technician' : user.role === 'customer' ? 'request' : 'office'
    const permitted = user.role === 'admin' || user.role === 'office' || (user.role === 'technician' && view === 'technician') || (user.role === 'customer' && ['request', 'quote', 'closeout'].includes(view))
    if (!permitted) navigate(home)
  }, [user.role, view])

  return (
    <>
      <AccountBar user={user} onSignOut={() => void signOut()} />
      {roleEntryOpen && <RoleEntry active={view} onClose={() => setRoleEntryOpen(false)} onEnter={enterRole} />}
      {view === 'office' && <Office workflow={workflow} onUpdate={updateWorkflow} onNavigate={navigate} />}
      {view === 'request' && <CustomerRequest workflow={workflow} onUpdate={updateWorkflow} onNavigate={navigate} />}
      {view === 'technician' && <Technician workflow={workflow} onUpdate={updateWorkflow} onNavigate={navigate} />}
      {view === 'quote' && <QuoteApproval workflow={workflow} onUpdate={updateWorkflow} onNavigate={navigate} />}
      {view === 'closeout' && <Closeout workflow={workflow} onNavigate={navigate} />}
      {(user.role === 'admin' || user.role === 'office') && <DemoJourney active={view} open={journeyOpen} onToggle={() => setJourneyOpen((open) => !open)} onNavigate={navigate} onOpenRoleEntry={() => setRoleEntryOpen(true)} />}
      {orientationOpen && <Orientation view={view} onClose={() => setOrientationOpen(false)} />}
    </>
  )
}

function App() {
  return <AuthGate>{(user, signOut) => <Workspace user={user} signOut={signOut} />}</AuthGate>
}

export default App
