import React, { useState } from 'react';
import { ArrowRight, ChefHat, ShieldCheck, Users, Lock, Sparkles, BadgeCheck, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { cn } from '../lib/utils';

const roleOptions: { role: UserRole; icon: any; label: string; desc: string }[] = [
  { role: 'admin', icon: ShieldCheck, label: 'Administrator', desc: 'Manage stations, menu, and reports' },
  { role: 'supervisor', icon: Users, label: 'Supervisor', desc: 'Monitor orders and kitchen flow' },
  { role: 'chef', icon: ChefHat, label: 'Kitchen Chef', desc: 'Work the active queue' },
];

export default function Login() {
  const { signIn } = useAuth();
  const [pin, setPin] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || !name || pin.length < 4) return;

    setSubmitting(true);
    setError('');
    try {
      await signIn(`local-${Date.now()}`, name.trim(), selectedRole, pin);
    } catch (loginError) {
      console.error('Login implementation error:', loginError);
      setError('Unable to open session right now. Try demo mode instead.');
    } finally {
      setSubmitting(false);
    }
  };

  const demoLogin = async () => {
    setSubmitting(true);
    setError('');
    try {
      await signIn('demo-admin', 'Demo Admin', 'admin', '1234');
    } catch {
      await signIn(`demo-${Date.now()}`, 'Demo Admin', 'admin', '1234');
    } finally {
      setSubmitting(false);
    }
  };

  const isSubmitDisabled = !selectedRole || !name.trim() || pin.length < 4 || submitting;

  return (
    <div className="min-h-screen px-6 py-10 flex items-center justify-center bg-[#07080D]">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.10),transparent_28%)]" />
      <div className="relative w-full max-w-5xl grid lg:grid-cols-[1.05fr_0.95fr] gap-6">
        <div className="android-card p-8 md:p-10 xl:p-12 flex flex-col justify-between min-h-[760px] overflow-hidden">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] font-black uppercase tracking-[0.3em]">
              <Sparkles className="w-3.5 h-3.5" />
              Kitchen operations platform
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
                KitchenFlow
                <span className="text-blue-400"> KDS</span>
              </h1>
              <p className="max-w-xl text-slate-400 text-sm md:text-base leading-7">
                Track live orders, assign stations, and keep the kitchen moving with a clean, fast interface built for busy service.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: 'Live queue', value: 'Realtime', icon: BadgeCheck },
                { label: 'Fast auth', value: 'PIN access', icon: Lock },
                { label: 'Demo ready', value: 'Seeded data', icon: UserRound },
              ].map((item) => (
                <div key={item.label} className="panel-soft p-4">
                  <item.icon className="w-5 h-5 text-blue-400 mb-4" />
                  <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black">{item.label}</div>
                  <div className="mt-2 text-sm font-semibold text-white">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:block mt-8 panel-soft p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="section-label">What you can do</div>
                <p className="text-sm text-slate-300 mt-2">
                  Open the dashboard, map menu items to stations, manage chefs, send orders, and review analytics from one place.
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="android-card p-6 md:p-8 xl:p-10 shadow-2xl">
          <div className="mb-8">
            <div className="section-label">Sign in</div>
            <h2 className="text-2xl font-black text-white mt-2">Open your kitchen console</h2>
            <p className="text-sm text-slate-400 mt-2">Choose a role, enter a name, and set a 4-digit PIN.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="grid grid-cols-1 gap-3">
              {roleOptions.map((item) => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => setSelectedRole(item.role)}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-2xl border text-left transition-all',
                    selectedRole === item.role
                      ? 'bg-blue-500/10 border-blue-500/40 ring-1 ring-blue-500/20'
                      : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10',
                  )}
                >
                  <div className={cn(
                    'w-11 h-11 rounded-2xl flex items-center justify-center shrink-0',
                    selectedRole === item.role ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400',
                  )}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{item.label}</div>
                    <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500 mt-1">{item.desc}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="section-label">Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your display name"
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-slate-100 placeholder:text-slate-600"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="section-label">PIN</label>
                <span className="text-[10px] text-slate-500 uppercase tracking-[0.25em]">4 digits</span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      'h-14 border rounded-2xl bg-white/5 flex items-center justify-center transition-all',
                      pin.length >= i ? 'border-blue-500/40 bg-blue-500/5' : 'border-white/5',
                    )}
                  >
                    {pin.length >= i && <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '⌫'].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      if (key === 'C') {
                        setPin('');
                      } else if (key === '⌫') {
                        setPin((prev) => prev.slice(0, -1));
                      } else if (pin.length < 4) {
                        setPin((prev) => prev + key.toString());
                      }
                    }}
                    className="h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-lg font-semibold text-white hover:bg-white/10 transition-all"
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-amber-200 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="android-button w-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center gap-3 py-4 text-white"
            >
              {submitting ? 'Opening console...' : 'Open Kitchen'}
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={demoLogin}
              className="w-full py-3 text-slate-400 hover:text-blue-400 text-xs uppercase tracking-[0.3em] font-semibold transition-colors"
            >
              Use demo account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
