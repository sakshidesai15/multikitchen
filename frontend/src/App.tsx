/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StationMapping from './pages/StationMapping';
import ChefView from './pages/ChefView';
import Analytics from './pages/Analytics';
import OrderFlow from './pages/OrderFlow';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import BottomNav from './components/BottomNav';

import { Maximize2 } from 'lucide-react';
import { cn } from './lib/utils';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'mapping' | 'chef' | 'analytics' | 'flow'>('dashboard');
  const [isKdsMode, setIsKdsMode] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'mapping': return <StationMapping />;
      case 'chef': return <ChefView />;
      case 'analytics': return <Analytics />;
      case 'flow': return <OrderFlow />;
      default: return <Dashboard />;
    }
  };

  const toggleKdsMode = () => setIsKdsMode(!isKdsMode);

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      {!isKdsMode && (
        <div className="hidden md:block">
          <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        </div>
      )}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {!isKdsMode && <Header onToggleKds={() => setIsKdsMode(true)} />}
        <main className={cn(
          "flex-1 overflow-y-auto min-h-0",
          isKdsMode ? "p-0" : "p-4 md:p-6 lg:p-8",
          !isKdsMode && "pb-20 md:pb-8" // Add space for bottom nav on mobile
        )}>
          {isKdsMode && (
            <button 
              onClick={() => setIsKdsMode(false)}
              className="fixed top-4 right-4 z-50 p-2 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-full text-slate-500 hover:text-white transition-all shadow-xl"
              title="Exit KDS Mode"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          )}
          <div key={currentView} className="h-full">
            {renderView()}
          </div>
        </main>
        {!isKdsMode && <BottomNav currentView={currentView} onViewChange={setCurrentView} />}
      </div>
    </div>
  );
}


export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
