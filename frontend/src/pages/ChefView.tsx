import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle2, Play, Check, AlertCircle, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { getDemoActiveItems, getDemoStations, subscribeDemoState, updateDemoItemStatus } from '../lib/demoData';

interface Station {
  station_id: string;
  station_name: string;
  display_name: string;
  color_code: string;
  station_code: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  order_item_id: string;
  station_id: string;
  status: string;
  quantity: number;
  notes: string;
  expected_ready_time: string;
  created_at: string;
  station: Station;
}

export default function ChefView() {
  const { user } = useAuth();
  const [items, setItems] = useState<OrderItem[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const activeItems = getDemoActiveItems();
      const stationData = getDemoStations();
      setItems(activeItems);
      setStations(stationData);
      if (!selectedStation && stationData.length > 0) {
        setSelectedStation(stationData[0].station_id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    return subscribeDemoState(fetchData);
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDemoItemStatus(id, status as any);
    } catch (err) {
      console.error(err);
    }
  };

  const stationItems = items.filter(i => i.station_id === selectedStation);
  const currentStation = stations.find(s => s.station_id === selectedStation);

  if (loading) return <div className="p-8 text-slate-500 font-mono">Loading Terminal...</div>;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="page-title text-2xl md:text-3xl">Chef queue</h2>
          <p className="page-subtitle">Focus on the active station and work orders in sequence.</p>
        </div>
      </div>

      <div className="flex overflow-x-auto bg-slate-900/70 border border-slate-800 rounded-2xl p-2 gap-2 no-scrollbar">
        {stations.map(s => (
          <button
            key={s.station_id}
            onClick={() => setSelectedStation(s.station_id)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all border",
              selectedStation === s.station_id 
                ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20" 
                : "bg-slate-800 border-slate-700 text-slate-400"
            )}
          >
            {s.station_name}
          </button>
        ))}
      </div>

      {/* Main Grid View */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {stationItems.length === 0 ? (
          <div className="empty-state">
            <ShoppingBag className="w-16 h-16 mb-4" />
            <p className="text-sm font-semibold uppercase tracking-[0.3em]">No active items</p>
            <p className="text-[10px] uppercase tracking-[0.28em] mt-2">Switch stations or create a new order to begin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {stationItems.map(item => {
              const isDelayed = new Date() > new Date(item.expected_ready_time) && item.status !== 'READY';
              
              return (
                <div 
                  key={item.id} 
                  className={cn(
                    "panel flex flex-col transition-all",
                    isDelayed ? "border-red-500/50 bg-red-500/5" : "border-slate-800/50"
                  )}
                >
                  <div className={cn("p-6 border-b border-slate-800/50 flex justify-between items-center", isDelayed ? "bg-red-500/10" : "bg-slate-900/30")}>
                    <div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Order ID</span>
                      <div className="text-sm font-black text-white">{item.order_id}</div>
                    </div>
                    <div className="text-right">
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Time</span>
                       <div className={cn("text-sm font-mono font-bold", isDelayed ? "text-red-400" : "text-blue-400")}>
                         {new Date(item.expected_ready_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </div>
                    </div>
                  </div>

                  <div className="p-8 flex-1 flex flex-col justify-between">
                    <div className="mb-8">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <h4 className="text-2xl font-black text-white uppercase leading-tight tracking-tight">
                          {item.quantity}x {item.order_item_id}
                        </h4>
                        <div className={cn(
                          "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                          item.status === 'PENDING' ? "bg-slate-700/30 text-slate-400 border-slate-700" :
                          item.status === 'STARTED' ? "bg-blue-600/20 text-blue-400 border-blue-500/30" :
                          "bg-green-600/20 text-green-400 border-green-500/30"
                        )}>
                          {item.status}
                        </div>
                      </div>
                      {item.notes && (
                        <div className="text-[11px] font-bold text-orange-400 bg-orange-400/5 border border-orange-400/10 p-3 rounded-2xl italic">
                           {item.notes}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      {item.status === 'PENDING' ? (
                        <button 
                          onClick={() => updateStatus(item.id, 'STARTED')}
                          className="android-button flex-1 bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 shadow-blue-900/40"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          Initialize Cook
                        </button>
                      ) : item.status === 'STARTED' ? (
                        <button 
                          onClick={() => updateStatus(item.id, 'READY')}
                          className="android-button flex-1 bg-green-600 hover:bg-green-500 text-white flex items-center justify-center gap-2 shadow-green-900/40"
                        >
                          <Check className="w-5 h-5" />
                          Transmit Ready
                        </button>
                      ) : (
                        <button 
                          onClick={() => updateStatus(item.id, 'SERVED')}
                          className="android-button flex-1 bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center gap-2 border border-slate-700"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Final Release
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer / Status Bar */}
      <div className="bg-slate-900 border-t border-slate-800 p-3 flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            <span>Terminal {currentStation?.station_code}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3" />
            <span>Shift: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
        <div>
          Chef: {user?.name}
        </div>
      </div>
    </div>
  );
}
