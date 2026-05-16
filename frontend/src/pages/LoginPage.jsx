import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, Eye, EyeOff, Loader2, Sparkles, ChevronRight, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back to TaskFlow!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="glass-glow opacity-50" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-[1000px] grid lg:grid-cols-2 card overflow-hidden backdrop-blur-3xl">
        {/* Branding Side */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-indigo-600 relative overflow-hidden text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-indigo-900 opacity-90" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
          
          <div className="relative z-10">
             <div className="flex items-center gap-3 mb-12">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg">
                  <CheckSquare className="w-6 h-6 text-indigo-600" />
                </div>
                <span className="text-2xl font-bold tracking-tight">TaskFlow</span>
             </div>
             
             <h2 className="text-4xl font-bold leading-tight mb-6">
                Pick up exactly where you left off.
             </h2>
             <p className="text-indigo-100/80 leading-relaxed max-w-sm">
                Access your dashboard, manage your team, and keep your projects moving forward with our powerful workspace.
             </p>
          </div>

          <div className="relative z-10 card p-6 bg-white/10 border-white/20 backdrop-blur-md">
             <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-emerald-400/20 flex items-center justify-center">
                   <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">New Feature</p>
             </div>
             <p className="text-sm text-indigo-100">AI-powered task prioritization is now live for all Pro users.</p>
          </div>
        </div>

        {/* Form Side */}
        <div className="p-10 lg:p-16 bg-[#0c0c14]">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-slate-500 text-sm">Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
              <input type="email" className="input" placeholder="you@company.com" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">Password</label>
                <a href="#" className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300">Forgot password?</a>
              </div>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} className="input pr-12"
                  placeholder="••••••••" value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-white/10 bg-white/5 text-indigo-500 focus:ring-indigo-500/20" />
              <label htmlFor="remember" className="text-xs text-slate-400">Remember me for 30 days</label>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 group">
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Sign In to Account</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-slate-500 text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-white font-bold hover:text-indigo-400 transition-colors">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
