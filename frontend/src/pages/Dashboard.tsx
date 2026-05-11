import React, { useEffect, useState } from 'react';
import { Flame, Clock, CheckCircle2, AlertCircle, Activity, LayoutGrid, Users } from 'lucide-react';
import { cn } from '../lib/utils';
import socket from '../lib/socket';
import { apiUrl } from '../lib/api';

interface Station {
  station_id: string;
  station_name: string;
  display_name: string;
  color_code: string;
  expected_time_minutes: number;
  _count: {
    order_items: number;
  };
  chef_mappings?: any[];
}

interface ActiveItem {
  id: string;
  status: string;
  created_at: string;
  expected_ready_time: string;
}

export default function Dashboard() {
  const [stations, setStations] = useState<Station[]>([]);
  const [activeItems, setActiveItems] = useState<ActiveItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [sRes, iRes] = await Promise.all([
        fetch(apiUrl('/api/stations')),
        fetch(apiUrl('/api/active-items'))
      ]);
      const sData = await sRes.json();
      const iData = await iRes.json();
      setStations(sData);
      setActiveItems(iData);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    socket.on('new-item', fetchData);
    socket.on('item-updated', fetchData);
    socket.on('order-created', fetchData);

    return () => {
      socket.off('new-item');
      socket.off('item-updated');
      socket.off('order-created');
    };
  }, []);

  const delayedItems = activeItems.filter(item => {
    const now = new Date();
    const expected = new Date(item.expected_ready_time);
    return now > expected && item.status !== 'READY';
  }).length;

  const stats = [
    { label: 'Active Items', value: activeItems.length, icon: Flame, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { label: 'Delayed', value: delayedItems, icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    { label: 'Ready', value: activeItems.filter(i => i.status === 'READY').length, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    { label: 'Stations', value: stations.length, icon: LayoutGrid, color: 'text-slate-300', bg: 'bg-slate-800/50', border: 'border-slate-700' },
  ];

  if (loading) {
     return <div className="p-8 text-slate-500 font-mono animate-pulse">Loading dashboard...</div>;
  }

  return (
    <div className="page-shell">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Kitchen overview</h2>
          <p className="page-subtitle">Live station activity and order health at a glance.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-1.5 glass rounded-full border border-slate-800 shadow-lg">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live sync online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className={cn("panel flex items-center justify-between transition-all hover:scale-[1.01]", stat.border.replace('border-', 'border-l-4 border-'))}>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-3xl font-black text-white mt-1">{stat.value}</h3>
            </div>
            <div className={cn("p-4 rounded-[1.5rem]", stat.bg)}>
              <stat.icon className={cn("w-6 h-6 shadow-sm", stat.color)} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2 px-2">
            <h3 className="section-label flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              Station health
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stations.map((station) => {
              const activeCount = station._count?.order_items || 0;
              const loadPercentage = Math.min((activeCount / Math.max(1, station.expected_time_minutes)) * 18, 100);
              const color = station.color_code;

              return (
                <div key={station.station_id} className="panel border-l-8 transition-all" style={{ borderLeftColor: color }}>
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider text-white" style={{ backgroundColor: color }}>
                          {station.station_name}
                        </span>
                        <p className="text-[11px] text-slate-500 font-black uppercase mt-4 tracking-widest">{station.display_name}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-black text-slate-300 bg-white/5 px-3 py-1 rounded-full border border-white/5">{station.expected_time_minutes}m SLA</div>
                      </div>
                    </div>
                    
                    <div className="flex items-end justify-between mb-6">
                      <div>
                        <div className="text-5xl font-black text-white leading-none">{activeCount}</div>
                        <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2">Active items</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-[10px] font-black uppercase tracking-widest ${loadPercentage > 80 ? 'text-red-400' : 'text-blue-400'}`}>
                          {loadPercentage.toFixed(0)}% Load
                        </div>
                      </div>
                    </div>

                    <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="h-full rounded-full transition-all duration-1000" 
                        style={{ width: `${loadPercentage}%`, backgroundColor: color }} 
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
           <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2 px-2">
            <Users className="w-4 h-4 text-green-500" />
            Personnel
          </h3>
          <div className="panel space-y-4">
            {stations.map(station => (
              <div key={station.station_id} className="flex items-center justify-between p-4 rounded-3xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-black text-slate-300">
                    {station.station_name[0]}
                  </div>
                  <div>
                    <div className="text-[11px] font-black text-white uppercase tracking-wider">{station.station_name}</div>
                    <div className="text-[9px] text-slate-500 font-black uppercase tracking-tight">
                      {station.chef_mappings && station.chef_mappings.length > 0 
                        ? `${station.chef_mappings.length} ACTIVE` 
                        : 'OFFLINE'
                      }
                    </div>
                  </div>
                </div>
                <div className={cn(
                  "w-2 h-2 rounded-full shadow-lg",
                  station.chef_mappings && station.chef_mappings.length > 0 ? "bg-green-500 animate-pulse" : "bg-red-500"
                )} />
              </div>
            ))}
          </div>

          <div className="glass border-slate-800 rounded-2xl p-6">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">System Notifications</h4>
            <div className="space-y-3">
              <div className="flex gap-3 text-xs">
                <div className="w-1 h-1 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                <p className="text-slate-400">System backup completed successfully at 04:00 AM</p>
              </div>
              <div className="flex gap-3 text-xs">
                <div className="w-1 h-1 bg-orange-500 rounded-full mt-1.5 flex-shrink-0" />
                <p className="text-slate-400">Grill station is currently running above average load.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
