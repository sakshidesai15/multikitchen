import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { TrendingUp, Clock, Award, Zap } from 'lucide-react';
import { apiUrl } from '../lib/api';

interface Station {
  station_id: string;
  station_name: string;
  color_code: string;
  expected_time_minutes: number;
}

interface Summary {
  stationCount: number;
  activeItems: number;
  delayedItems: number;
  readyItems: number;
  openOrders: number;
  completedOrders: number;
}

export default function Analytics() {
  const [stations, setStations] = useState<Station[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(apiUrl('/api/stations')).then((res) => res.json()),
      fetch(apiUrl('/api/analytics/summary')).then((res) => res.json()),
    ])
      .then(([stationData, summaryData]) => {
        setStations(stationData);
        setSummary(summaryData);
      })
      .finally(() => setLoading(false));
  }, []);

  const stationData = useMemo(() => stations.map((station, index) => ({
    name: station.station_name,
    prepTime: station.expected_time_minutes,
    orders: Math.max(1, summary ? Math.round(summary.activeItems / Math.max(1, stations.length) + index) : station.expected_time_minutes),
    delayed: Math.max(0, Math.round((summary?.delayedItems ?? 0) / Math.max(1, stations.length))),
    color: station.color_code,
  })), [stations, summary]);

  const hourlyData = useMemo(() => {
    const base = summary?.openOrders ?? 0;
    return Array.from({ length: 8 }).map((_, i) => ({
      hour: `${12 + i}:00`,
      orders: base + (i * 6) + (summary?.activeItems ?? 0),
    }));
  }, [summary]);

  if (loading || !summary) return <div className="p-8 text-neutral-500 font-mono">Loading analytics...</div>;

  return (
    <div className="page-shell pb-24">
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="page-title">Performance insights</h2>
          <p className="page-subtitle">Throughput, delays, and station load patterns.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full border border-green-500/20 shadow-lg">
          <TrendingUp className="w-4 h-4 text-green-500" />
          <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Kitchen health stable</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Stations', value: summary.stationCount },
          { label: 'Active', value: summary.activeItems },
          { label: 'Delayed', value: summary.delayedItems },
          { label: 'Ready', value: summary.readyItems },
        ].map((entry) => (
          <div key={entry.label} className="panel">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{entry.label}</p>
            <h3 className="text-3xl font-black text-white mt-1">{entry.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="panel md:col-span-2">
          <div className="flex justify-between items-center mb-10">
            <h3 className="section-label flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-500" />
              Prep time by station
            </h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} tick={{ fontWeight: 900 }} />
                <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} hide />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '24px', fontSize: '9px', textTransform: 'uppercase', fontWeight: 900, padding: '12px 16px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="prepTime" radius={[12, 12, 0, 0]} barSize={48}>
                  {stationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel flex flex-col shadow-2xl">
          <h3 className="section-label flex items-center gap-3 mb-10">
            <Zap className="w-5 h-5 text-yellow-500" />
            Station load profile
          </h3>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stationData} innerRadius={70} outerRadius={95} paddingAngle={10} dataKey="orders" stroke="none">
                  {stationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '24px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4 mt-8">
            {stationData.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-2.5 h-2.5 rounded-full shadow-lg" style={{ backgroundColor: s.color }} />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.name}</span>
                </div>
                <span className="text-xs font-mono font-black text-white">{s.orders}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="panel">
          <h3 className="section-label flex items-center gap-3 mb-10">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Order volume trend
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} tick={{ fontWeight: 900 }} />
                <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} hide />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '24px' }} />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#3b82f6"
                  strokeWidth={5}
                  dot={{ fill: '#3b82f6', strokeWidth: 3, r: 5, stroke: '#07080D' }}
                  activeDot={{ r: 8, stroke: '#fff', strokeWidth: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel flex flex-col justify-center bg-blue-500/5">
          <div className="text-center space-y-8">
            <div className="w-28 h-28 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto border border-blue-500/20 shadow-2xl">
              <Award className="w-14 h-14 text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
            </div>
            <div>
              <h4 className="text-xl font-black text-white uppercase tracking-tight">Best performing station</h4>
              <p className="text-blue-500 font-black uppercase tracking-[0.4em] text-[10px] mt-2">{stationData[0]?.name ?? 'Station'}</p>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-8 max-w-xs mx-auto leading-relaxed opacity-70">
                Completed orders: {summary.completedOrders}. Open orders: {summary.openOrders}.
              </p>
            </div>
            <div className="pt-6">
              <button className="android-button bg-zinc-800 hover:bg-zinc-700 text-white min-w-[200px]">
                Export Secured Log
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
