import React from 'react';
import { 
  LayoutDashboard, 
  MapPin, 
  ChefHat, 
  BarChart3, 
  GitFork, 
  LogOut,
  Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: any) => void;
}

export default function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const { user, signOut } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'supervisor'] },
    { id: 'mapping', label: 'Station Mapping', icon: MapPin, roles: ['admin'] },
    { id: 'chef', label: 'Chef View', icon: ChefHat, roles: ['chef', 'admin'] },
    { id: 'flow', label: 'Order Flow', icon: GitFork, roles: ['admin', 'supervisor'] },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['admin'] },
  ];

  const filteredItems = menuItems.filter(item => user && item.roles.includes(user.role));

  return (
    <aside className="w-20 md:w-64 glass flex flex-col h-full border-r border-slate-800">
      <div className="p-6 flex items-center gap-3">
        <h1 className="text-xl font-black tracking-tighter text-blue-400">
          KITCHENFLOW<span className="text-white font-light">KDS</span>
        </h1>
      </div>

      <nav className="flex-1 px-2 space-y-1 mt-4">
        {filteredItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-r-lg transition-all duration-200",
              currentView === item.id 
                ? "bg-blue-500/15 text-blue-400 border-l-4 border-blue-500" 
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            )}
            title={item.label}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span className="hidden md:block font-semibold text-sm uppercase tracking-wide">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-900/50 space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-all">
          <Settings className="w-5 h-5 flex-shrink-0" />
          <span className="hidden md:block text-sm font-medium">Settings</span>
        </button>
        <button 
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-all"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="hidden md:block text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
