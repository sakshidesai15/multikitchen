import React, { useState } from 'react';
import { ChefHat, ShieldCheck, Users, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export default function Login() {
  const { signIn } = useAuth();
  const [pin, setPin] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [name, setName] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || !name) return;

    try {
      await signIn(`local-${Date.now()}`, name, selectedRole, pin);
    } catch (error) {
      console.error('Login implementation error:', error);
    }
  };

  const roles: { role: UserRole; icon: any; label: string; desc: string }[] = [
    { role: 'admin', icon: ShieldCheck, label: 'Administrator', desc: 'Manage stations & menu' },
    { role: 'supervisor', icon: Users, label: 'Supervisor', desc: 'Monitor kitchen flow' },
    { role: 'chef', icon: ChefHat, label: 'Kitchen Chef', desc: 'Process station orders' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-start py-12 px-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 to-slate-950 overflow-y-auto">
      <div className="mb-10 flex flex-col items-center text-center shrink-0">
        <h1 className="text-4xl font-black tracking-tighter text-blue-400 uppercase">
          KITCHENFLOW<span className="text-white font-light">KDS</span>
        </h1>
        <div className="text-[10px] text-slate-500 uppercase tracking-[0.4em] mt-2 font-black">Main Terminal Access</div>
      </div>

      <div className="w-full max-w-md android-card p-10 shadow-2xl shrink-0 mb-12">
        <form onSubmit={handleLogin} className="space-y-8">
          <div className="grid grid-cols-1 gap-3">
            {roles.map((item) => (
              <button
                key={item.role}
                type="button"
                onClick={() => setSelectedRole(item.role)}
                className={`flex items-center gap-4 p-5 rounded-[1.5rem] border transition-all text-left group ${
                  selectedRole === item.role
                    ? 'bg-blue-500/10 border-blue-500/50 ring-1 ring-blue-500/20'
                    : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'
                }`}
              >
                <div className={`p-3 rounded-2xl shrink-0 transition-all ${selectedRole === item.role ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/40 translate-y-[-2px]' : 'bg-slate-800 text-slate-500'}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-black text-[11px] text-white uppercase tracking-widest">{item.label}</div>
                  <div className="text-[9px] text-slate-500 uppercase font-black tracking-tight">{item.desc}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-4">Authorized Personnel</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ENTER TERMINAL PSEUDONYM"
              className="w-full bg-white/5 border border-white/5 rounded-[1.5rem] px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-slate-100 font-black text-xs placeholder:text-slate-700 placeholder:uppercase"
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-4">Security PIN</label>
            <div className="grid grid-cols-4 gap-3 px-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-14 border rounded-2xl bg-white/5 flex items-center justify-center transition-all ${pin.length >= i ? 'border-blue-500/50 bg-blue-500/5 shadow-inner' : 'border-white/5'}`}
                >
                  {pin.length >= i && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 mt-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, 'OK'].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    if (key === 'C') setPin('');
                    else if (key === 'OK') {
                      return;
                    } else if (pin.length < 4) {
                      setPin((p) => p + key.toString());
                    }
                  }}
                  className="h-16 bg-white/5 border border-white/5 rounded-[1.5rem] flex items-center justify-center text-xl font-black text-white hover:bg-white/10 active:scale-90 transition-all shadow-sm"
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!selectedRole || !name || pin.length < 4}
            className="android-button w-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center gap-3 py-5"
          >
            Authenticate Link
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="pt-4 border-t border-slate-800 flex justify-center">
            <button
              type="button"
              onClick={async () => {
                try {
                  await signIn('demo-admin', 'Demo Admin', 'admin', '1234');
                } catch {
                  await signIn(`demo-${Date.now()}`, 'Demo Admin', 'admin', '1234');
                }
              }}
              className="text-slate-500 text-[10px] uppercase tracking-[0.3em] font-black hover:text-blue-400 transition-all"
            >
              Enter Demo Mode
            </button>
          </div>
        </form>
      </div>

      <p className="mt-8 text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">
        KitchenFlow v1.0.4 (c) 2026 ResTech Solutions
      </p>
    </div>
  );
}
