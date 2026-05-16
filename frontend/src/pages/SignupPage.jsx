import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, Eye, EyeOff, Loader2, Sparkles, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password, form.role);
      toast.success('Welcome to TaskFlow!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="glass-glow opacity-50" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-[1000px] grid lg:grid-cols-2 card overflow-hidden backdrop-blur-3xl">
        {/* Branding Side */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-indigo-600 relative overflow-hidden text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-700 opacity-90" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
          
          <div className="relative z-10">
             <div className="flex items-center gap-3 mb-12">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg">
                  <CheckSquare className="w-6 h-6 text-indigo-600" />
                </div>
                <span className="text-2xl font-bold tracking-tight">TaskFlow</span>
             </div>
             
             <h2 className="text-4xl font-bold leading-tight mb-6">
                Streamline your team's workflow in minutes.
             </h2>
             <p className="text-indigo-100/80 leading-relaxed max-w-sm">
                Join 50,000+ teams who use TaskFlow to manage projects, track time, and ship products faster.
             </p>
          </div>

          <div className="relative z-10">
             <div className="flex -space-x-3 mb-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-9 h-9 rounded-full border-2 border-indigo-600 bg-indigo-400" />
                ))}
                <div className="w-9 h-9 rounded-full border-2 border-indigo-600 bg-white/10 flex items-center justify-center text-[10px] font-bold">+2k</div>
             </div>
             <p className="text-sm font-medium text-indigo-100">Trusted by modern engineering teams worldwide.</p>
          </div>
        </div>

        {/* Form Side */}
        <div className="p-10 lg:p-16 bg-[#0c0c14]">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-white mb-2">Create an account</h1>
            <p className="text-slate-500 text-sm">Join the next generation of task management.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
                <input type="text" className="input" placeholder="Jane Smith" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Work Email</label>
              <input type="email" className="input" placeholder="jane@company.com" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Password</label>
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
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Your Role</label>
                <select className="input appearance-none" value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  <option value="member">Team Member</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 group">
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Get Started for Free</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-slate-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-white font-bold hover:text-indigo-400 transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
