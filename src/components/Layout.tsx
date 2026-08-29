import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

const NAV = [
  { to: '/', label: 'État du stock', icon: '●', end: true },
  { to: '/reception', label: 'Réception', icon: '↓' },
  { to: '/empaquetage', label: 'Empaquetage', icon: '▢' },
  { to: '/etiquetage', label: 'Étiquetage', icon: '◉' },
  { to: '/cadeau-perte', label: 'Cadeau / Perte', icon: '−' },
]

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-2">
      <div className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-white/95 p-1">
        <img src="/logo-192.png" alt="" className="h-full w-full object-contain" />
      </div>
      <div>
        <div className="font-display text-[15px] leading-tight font-semibold">CB-RUN</div>
        <div className="text-[10.5px] tracking-wide text-white/65 uppercase">Stock</div>
      </div>
    </div>
  )
}

export function Layout({ onLoggedOut }: { onLoggedOut: () => void }) {
  const navigate = useNavigate()
  const [navOpen, setNavOpen] = useState(false)

  async function logout() {
    await api.post('/api/logout', {})
    onLoggedOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Mobile top bar */}
      <header className="relative flex flex-col items-center gap-1.5 bg-red-strong px-3 py-3 text-white md:hidden">
        <button
          onClick={() => setNavOpen(true)}
          aria-label="Ouvrir le menu"
          className="absolute top-1/2 left-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-xl hover:bg-white/10"
        >
          ☰
        </button>
        <div className="text-center leading-tight">
          <span className="font-display text-[15px] font-semibold">CB-RUN</span>{' '}
          <span className="text-[10.5px] tracking-wide text-white/65 uppercase">Stock</span>
        </div>
        <img src="/logo-192.png" alt="CB-RUN" className="h-10 w-10 object-contain" />
      </header>

      {/* Backdrop for mobile drawer */}
      {navOpen && (
        <button
          aria-label="Fermer le menu"
          onClick={() => setNavOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[224px] flex-none flex-col gap-6 bg-red-strong p-3.5 text-white transition-transform duration-200 md:static md:translate-x-0 ${
          navOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="hidden md:block">
          <Brand />
        </div>

        <nav className="mt-1 flex flex-col gap-0.5 md:mt-0">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setNavOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-white/[0.16] text-white' : 'text-white/80 hover:bg-white/[0.08] hover:text-white'
                }`
              }
            >
              <span className="w-[18px] text-center opacity-90">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={logout}
          className="mt-auto rounded-lg border-t border-white/15 px-3 pt-3.5 text-left text-[11.5px] text-white/55 hover:text-white/85"
        >
          Se déconnecter
        </button>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 md:px-9 md:py-7">
        <Outlet />
      </main>
    </div>
  )
}
