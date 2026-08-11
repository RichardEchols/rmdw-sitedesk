import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { ArrowRight, Building2, CheckCircle2, KeyRound, LoaderCircle, LockKeyhole, LogOut, ShieldCheck } from 'lucide-react'
import { Brand } from './Brand'
import { api } from '../lib/api'

export type SignedInUser = { tenantId: string; userId: string; role: 'customer' | 'office' | 'technician' | 'admin'; email: string; fullName: string }

export function AuthGate({ children }: { children: (user: SignedInUser, signOut: () => Promise<void>) => ReactNode }) {
  const [state, setState] = useState<'loading'|'login'|'setup'|'setup-blocked'|'unconfigured'|'ready'>('loading')
  const [user, setUser] = useState<SignedInUser | null>(null)
  const [error, setError] = useState('')

  const refresh = async () => {
    try {
      const status = await api('status')
      if (!status.configured) return setState('unconfigured')
      if (!status.initialized) return setState(status.bootstrapConfigured ? 'setup' : 'setup-blocked')
      try {
        const session = await api('session')
        setUser(session.user); setState('ready')
      } catch { setState('login') }
    } catch { setState('unconfigured') }
  }

  useEffect(() => { void refresh() }, [])

  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError('')
    const form = new FormData(event.currentTarget)
    try { await api('login', { method: 'POST', body: JSON.stringify({ email: form.get('email'), password: form.get('password') }) }); await refresh() }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Sign in failed.') }
  }

  const submitSetup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError('')
    const form = new FormData(event.currentTarget)
    try { await api('bootstrap', { method: 'POST', body: JSON.stringify(Object.fromEntries(form)) }); await refresh() }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Setup failed.') }
  }

  const signOut = async () => { await api('logout', { method: 'POST', body: '{}' }); setUser(null); setState('login') }

  if (state === 'ready' && user) return <>{children(user, signOut)}</>
  return (
    <main className="auth-shell">
      <section className="auth-story">
        <Brand />
        <div className="auth-story__copy"><span>COMMERCIAL PROPERTY MAINTENANCE</span><h1>One clear work thread, from request to invoice.</h1><p>Customer requests, office dispatch, field proof, quote decisions, and closeout stay connected to the property and the people responsible.</p></div>
        <div className="auth-flow"><div><Building2 size={19}/><span><strong>Customer</strong><small>Request and approve</small></span></div><ArrowRight size={16}/><div><ShieldCheck size={19}/><span><strong>Office</strong><small>Triage and dispatch</small></span></div><ArrowRight size={16}/><div><CheckCircle2 size={19}/><span><strong>Field</strong><small>Prove and close</small></span></div></div>
        <small className="auth-story__endorsement">SiteDesk by RMDW · Purpose-built for multi-site service operations</small>
      </section>
      <section className="auth-panel">
        {state === 'loading' && <div className="auth-status"><LoaderCircle className="spin"/><h2>Opening your workspace</h2><p>Verifying the secure session.</p></div>}
        {state === 'unconfigured' && <div className="auth-status"><LockKeyhole/><span>CONFIGURATION REQUIRED</span><h2>Secure services are not connected.</h2><p>SiteDesk is installed, but the server database has not been configured for this deployment. No demo sign-in or false account state is shown.</p></div>}
        {state === 'setup-blocked' && <div className="auth-status"><KeyRound/><span>OWNER SETUP REQUIRED</span><h2>The secure workspace is ready to initialize.</h2><p>The Neon schema is connected. The deployment owner must add a private one-time setup token before the first administrator can be created.</p></div>}
        {state === 'login' && <form className="auth-form" onSubmit={submitLogin}><span>SECURE WORKSPACE</span><h2>Welcome back.</h2><p>Sign in with the account issued by your SiteDesk administrator.</p><label>Work email<input name="email" type="email" autoComplete="username" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" minLength={10} required /></label>{error && <div className="auth-error">{error}</div>}<button className="button button--primary" type="submit">Sign in <ArrowRight size={17}/></button><small><LockKeyhole size={13}/> Encrypted session · Role-based workspace access</small></form>}
        {state === 'setup' && <form className="auth-form" onSubmit={submitSetup}><span>AUTHORIZED INITIAL SETUP</span><h2>Create the first administrator.</h2><p>This one-time step establishes the company workspace. The deployment owner must supply the private setup token.</p><label>Company<input name="company" required maxLength={120}/></label><label>Your name<input name="name" required maxLength={120}/></label><label>Work email<input name="email" type="email" autoComplete="username" required/></label><label>Password<input name="password" type="password" autoComplete="new-password" minLength={10} required/></label><label>Private setup token<input name="token" type="password" autoComplete="off" required/></label>{error && <div className="auth-error">{error}</div>}<button className="button button--primary" type="submit">Create secure workspace <KeyRound size={17}/></button></form>}
      </section>
    </main>
  )
}

export function AccountBar({ user, onSignOut }: { user: SignedInUser; onSignOut: () => void }) {
  return <div className="account-bar"><span><ShieldCheck size={15}/><strong>{user.fullName}</strong><small>{user.role}</small></span><button onClick={onSignOut}><LogOut size={14}/> Sign out</button></div>
}
