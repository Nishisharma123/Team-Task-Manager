import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FolderKanban, LogOut, CheckSquare, Sparkles } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white/[0.03] border-r border-white/[0.06] flex flex-col backdrop-blur-xl">
        {/* Logo */}
        <div className="p-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)' }}>
              <CheckSquare className="w-5 h-5 text-white relative z-10" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold gradient-text leading-none">TaskFlow</h1>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-fuchsia-400" /> Team Manager
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1.5">
          <NavLink to="/dashboard" className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
              isActive ? 'nav-active' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`
          }>
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </NavLink>
          <NavLink to="/projects" className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
              isActive ? 'nav-active' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`
          }>
            <FolderKanban className="w-4 h-4" />
            Projects
          </NavLink>
        </nav>

        {/* User */}
        <div className="p-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] cursor-pointer group transition-all duration-200">
            <div className="avatar-ring flex-shrink-0">
              <div className="w-8 h-8 flex items-center justify-center text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                {getInitials(user?.name)}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-slate-500 hover:text-rose-400">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
