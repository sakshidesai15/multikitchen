import React, { useEffect, useState } from 'react';
import { Bell, Search, User, Maximize2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onToggleKds: () => void;
}

export default function Header({ onToggleKds }: HeaderProps) {
  const { user } = useAuth();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 glass sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search orders, stations, or menu items..." 
            className="w-full bg-slate-950/50 border border-slate-800 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-slate-300"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={onToggleKds}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-slate-800 transition-all group"
          title="Full screen"
        >
          <Maximize2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          <span className="hidden lg:block">Full screen</span>
        </button>

        <div className="hidden sm:flex flex-col items-end mr-4">
          <span className="text-sm font-bold text-white tracking-wider">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em] font-bold">
            {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all relative border border-slate-700">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
          </button>
          
          <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
            <div className="flex flex-col items-end">
              <span className="text-sm font-semibold text-white leading-tight">{user?.name}</span>
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">{user?.role}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
              <User className="w-5 h-5 text-slate-300" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
