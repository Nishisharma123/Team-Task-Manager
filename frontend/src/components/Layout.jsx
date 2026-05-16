import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FolderKanban, LogOut, CheckSquare, Sparkles, User, Settings, Bell } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0f]">
      {/* Subtle Background Glow */}
      <div className="glass-glow" />

      {/* Sidebar */}
      <aside className="w-72 flex-shrink-0 flex flex-col border-r border-white/[0.06] z-10">
        {/* Brand Header */}
        <div className="h-20 flex items-center px-8 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-indigo-500 shadow-lg shadow-indigo-500/20">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight leading-none">TaskFlow</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mt-1 font-semibold">Workspace Pro</p>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 px-4 py-8 space-y-8 overflow-y-auto">
          <div>
            <p className="px-4 mb-4 text-[11px] font-bold text-slate-600 uppercase tracking-widest">Main Menu</p>
            <nav className="space-y-1">
              <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <LayoutDashboard className="w-4 h-4" />
                <span>Overview</span>
              </NavLink>
              <NavLink to="/projects" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <FolderKanban className="w-4 h-4" />
                <span>Projects</span>
              </NavLink>
              <button className="nav-item w-full">
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
                <span className="ml-auto w-5 h-5 flex items-center justify-center bg-indigo-500/20 text-indigo-400 text-[10px] rounded-full">3</span>
              </button>
            </nav>
          </div>

          <div>
            <p className="px-4 mb-4 text-[11px] font-bold text-slate-600 uppercase tracking-widest">Settings</p>
            <nav className="space-y-1">
              <button className="nav-item w-full">
                <User className="w-4 h-4" />
                <span>Profile</span>
              </button>
              <button className="nav-item w-full">
                <Settings className="w-4 h-4" />
                <span>Preferences</span>
              </button>
            </nav>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="p-6 border-t border-white/[0.06]">
          <div className="flex items-center gap-4 group">
            <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-sm font-bold text-white shadow-inner">
              {getInitials(user?.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{user?.role === 'admin' ? 'Administrator' : 'Team Member'}</p>
            </div>
            <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto relative z-0">
        <div className="h-20 flex items-center justify-between px-8 border-b border-white/[0.06] bg-[#0a0a0f]/50 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>Workspace</span>
            <span className="opacity-30">/</span>
            <span className="text-white font-medium capitalize">{window.location.pathname.split('/').pop()}</span>
          </div>
          <div className="flex items-center gap-4">
             <button className="btn-secondary py-1.5 text-xs px-4">Support</button>
             <div className="w-px h-4 bg-white/10" />
             <div className="flex items-center gap-2 text-xs text-emerald-400">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
               Live System
             </div>
          </div>
        </div>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
