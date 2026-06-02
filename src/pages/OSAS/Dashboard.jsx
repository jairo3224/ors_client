import { useState } from 'react';
import { useNavigate, Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, BarChart2, Users, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import HomePage from './HomePage';
import ReferralsPage from './ReferralsPage';
import ReportsPage from './ReportsPage';
import UsersPage from './UsersPage';
import Footer from '../../components/common/Footer';

const NAV = [
  { label: 'Home',      path: '/osas',          icon: LayoutDashboard },
  { label: 'Referrals', path: '/osas/referrals', icon: FileText },
  { label: 'Reports',   path: '/osas/reports',   icon: BarChart2 },
  { label: 'Users',     path: '/osas/users',     icon: Users },
];

function Hamburger({ open }) {
  return (
    <div className="relative w-5 h-4 cursor-pointer">
      <span className={`absolute left-0 top-0 h-[2px] w-full bg-white rounded transition-all duration-300 ${open ? 'top-1/2 -translate-y-1/2 rotate-45' : ''}`} />
      <span className={`absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-white rounded transition-all duration-300 ${open ? 'opacity-0 w-0' : 'w-full'}`} />
      <span className={`absolute left-0 bottom-0 h-[2px] w-full bg-white rounded transition-all duration-300 ${open ? 'top-1/2 -translate-y-1/2 -rotate-45' : ''}`} />
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="flex flex-col h-screen font-sans overflow-hidden">

      {/* ── Top Bar ── */}
      <header style={{ background: '#4a7c8a' }} className="flex items-center gap-3 px-4 h-14 flex-shrink-0 z-30">
        <button
          onClick={() => setSidebarOpen(o => !o)}
          className="flex items-center justify-center w-9 h-9 rounded hover:bg-white/10 transition-colors"
        >
          <Hamburger open={sidebarOpen} />
        </button>
        <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
          <img src="/spac logo 2.png" alt="logo" className="w-full h-full object-cover"
            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
          <span style={{ display: 'none', color: '#4a7c8a', fontSize: 18, fontWeight: 700 }}>O</span>
        </div>
        <span className="text-white font-medium text-sm">Faculty Referral System — OSAS</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-white/80 text-sm hidden sm:block">
            {user?.first_name} {user?.last_name}
          </span>
          <span className="text-white/60 text-xs hidden sm:block">({user?.role_name})</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">

        {/* ── Backdrop (mobile) ── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ── */}
        <aside
          style={{ background: 'linear-gradient(180deg, #5b8ea0 0%, #4a7c8a 40%, #6a9c80 100%)' }}
          className={`
            flex flex-col py-5 px-3 gap-2 transition-transform duration-300
            fixed lg:static inset-y-0 left-0 z-20 w-[200px]
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden lg:px-0'}
          `}
        >
          {NAV.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/osas'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-full text-white text-sm font-medium transition-colors no-nowrap whitespace-nowrap
                 ${isActive ? 'bg-[#2f5a6a]' : 'bg-[#3d6e7d] hover:bg-[#2f5a6a]'}`
              }
            >
              <Icon size={16} className="flex-shrink-0" />
              <span className="overflow-hidden">{label}</span>
            </NavLink>
          ))}

          <button
            onClick={handleLogout}
            className="mt-auto flex items-center gap-3 px-4 py-3 rounded-full text-white/80 text-sm font-medium bg-transparent hover:bg-white/10 transition-colors border border-white/20 whitespace-nowrap"
          >
            <LogOut size={16} className="flex-shrink-0" />
            <span className="overflow-hidden">Sign Out</span>
          </button>
        </aside>

        {/* ── Main Content ── */}
        <main
          style={{ background: 'linear-gradient(135deg, #b8e0e8 0%, #9ed4c0 40%, #c8d96a 100%)' }}
          className="flex-1 overflow-y-auto p-5 min-w-0"
        >
          <p className="text-xl font-semibold mb-4" style={{ color: '#2a4a30' }}>
            Hi, {user?.first_name || 'OSAS'} 👋
          </p>

          <Routes>
            <Route index element={<HomePage />} />
            <Route path="referrals" element={<ReferralsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="users" element={<UsersPage />} />
          </Routes>
        </main>

      </div>
      <Footer />
    </div>
  );
}
