import React from 'react';
import { 
  LayoutDashboard, 
  MapPin, 
  ChefHat, 
  BarChart3, 
  GitFork
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

interface BottomNavProps {
  currentView: string;
  onViewChange: (view: any) => void;
}

export default function BottomNav({ currentView, onViewChange }: BottomNavProps) {
  const { user } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard, roles: ['admin', 'supervisor'] },
    { id: 'mapping', label: 'Route', icon: MapPin, roles: ['admin'] },
    { id: 'flow', label: 'Flow', icon: GitFork, roles: ['admin', 'supervisor'] },
    { id: 'chef', label: 'Chef', icon: ChefHat, roles: ['chef', 'admin'] },
    { id: 'analytics', label: 'Stats', icon: BarChart3, roles: ['admin'] },
  ];

  const filteredItems = menuItems.filter(item => user && item.roles.includes(user.role));

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-xl border-t border-slate-800 pb-safe-area-inset-bottom">
      <div className="flex justify-around items-center h-16 px-2">
        {filteredItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className="flex flex-col items-center justify-center flex-1 min-w-0"
          >
            <div className={cn(
              "p-1.5 rounded-full transition-all duration-300",
              currentView === item.id 
                ? "bg-blue-500/20 text-blue-400" 
                : "text-slate-500"
            )}>
              <item.icon className="w-5 h-5" />
            </div>
            <span className={cn(
              "text-[9px] font-black uppercase tracking-widest mt-1 transition-colors duration-300",
              currentView === item.id ? "text-blue-400" : "text-slate-500"
            )}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
