import '@fontsource/manrope/400.css'
import '@fontsource/manrope/500.css'
import '@fontsource/manrope/600.css'
import '@fontsource/manrope/700.css'
import { AuthGate } from './components/AuthGate'
import { OperationalWorkspace } from './components/OperationalWorkspace'
import './App.css'

export default function App() {
  return <AuthGate>{(user, signOut) => <OperationalWorkspace user={user} signOut={signOut} />}</AuthGate>
}
