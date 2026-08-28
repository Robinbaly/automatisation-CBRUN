import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Reception } from './pages/Reception'
import { Empaquetage } from './pages/Empaquetage'
import { Etiquetage } from './pages/Etiquetage'
import { CadeauPerte } from './pages/CadeauPerte'
import { useSession } from './hooks/useSession'

export function App() {
  const { authenticated, refresh } = useSession()
  const [override, setOverride] = useState<boolean | null>(null)
  const isAuthenticated = override ?? authenticated

  if (isAuthenticated === null) {
    return <div className="flex min-h-screen items-center justify-center text-ink-muted">Chargement…</div>
  }

  return (
    <BrowserRouter>
      <Routes>
        {!isAuthenticated ? (
          <>
            <Route
              path="/login"
              element={
                <Login
                  onLoggedIn={() => {
                    setOverride(true)
                    refresh()
                  }}
                />
              }
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <Route
            element={
              <Layout
                onLoggedOut={() => {
                  setOverride(false)
                }}
              />
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="reception" element={<Reception />} />
            <Route path="empaquetage" element={<Empaquetage />} />
            <Route path="etiquetage" element={<Etiquetage />} />
            <Route path="cadeau-perte" element={<CadeauPerte />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  )
}
