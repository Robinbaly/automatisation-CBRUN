import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

const NAV = [
  { to: '/', label: 'État du stock', icon: '●', end: true },
  { to: '/reception', label: 'Réception', icon: '↓' },
  { to: '/empaquetage', label: 'Empaquetage', icon: '▢' },
  { to: '/etiquetage', label: 'Étiquetage', icon: '◉' },
  { to: '/cadeau-perte', label: 'Cadeau / Perte', icon: '−' },
]

export function Layout({ onLoggedOut }: { onLoggedOut: () => void }) {
  const navigate = useNavigate()

  async function logout() {
    await api.post('/api/logout', {})
    onLoggedOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-[224px] flex-none flex-col gap-6 bg-red-strong p-3.5 text-white">
        <div className="flex items-center gap-2.5 px-2">
          <div className="font-display flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-sm font-semibold">
            CB
          </div>
          <div>
            <div className="font-display text-[15px] leading-tight font-semibold">CB-RUN</div>
            <div className="text-[10.5px] tracking-wide text-white/65 uppercase">Stock</div>
          </div>
        </div>

        <nav className="flex flex-col gap-0.5">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
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

      <main className="min-w-0 flex-1 px-6 py-7 sm:px-9">
        <Outlet />
      </main>
    </div>
  )
}
