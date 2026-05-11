import React, { useEffect, useState } from 'react';
import { Search, MapPin, Layers, CheckSquare, X, Filter } from 'lucide-react';
import { cn } from '../lib/utils';
import { apiUrl } from '../lib/api';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  station_id: string | null;
  station?: any;
}

interface Station {
  station_id: string;
  station_name: string;
  color_code: string;
}

export default function StationMapping() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [mRes, sRes] = await Promise.all([
        fetch(apiUrl('/api/menu')),
        fetch(apiUrl('/api/stations'))
      ]);
      const mData = await mRes.json();
      const sData = await sRes.json();
      setMenuItems(mData);
      setStations(sData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkAssign = async (stationId: string) => {
    try {
      await Promise.all(selectedIds.map(id => 
        fetch(apiUrl(`/api/menu/${id}/station`), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ station_id: stationId })
        })
      ));
      setSelectedIds([]);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = menuItems.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="p-8 text-slate-500 font-mono">Loading Mapping Data...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Routing Terminal</h2>
          <p className="text-slate-500 text-sm font-medium">Link infrastructure nodes to processing units</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            disabled={selectedIds.length === 0}
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-20 text-white px-4 py-2 rounded-xl border border-slate-700 font-bold uppercase text-[10px] tracking-widest transition-all hover:scale-105 active:scale-95"
          >
            <Layers className="w-4 h-4" />
            Bulk Assign {selectedIds.length > 0 && `(${selectedIds.length})`}
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input 
          type="text" 
          placeholder="SEARCH ASSETS..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-xs font-black uppercase tracking-widest text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
        />
      </div>

      <div className="glass border-slate-800 rounded-3xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-950/50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
              <th className="px-6 py-4 w-12">
                <input 
                  type="checkbox" 
                  onChange={(e) => setSelectedIds(e.target.checked ? filtered.map(i => i.id) : [])}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-500" 
                />
              </th>
              <th className="px-6 py-4">Node Item</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4">Assigned Unit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {filtered.map(item => (
              <tr key={item.id} className="hover:bg-slate-800/30 transition-all">
                <td className="px-6 py-4">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-500" 
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-black text-white uppercase tracking-tight">{item.name}</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{item.category}</div>
                </td>
                <td className="px-6 py-4 font-mono text-slate-500 text-xs tracking-tighter">NODE-0{item.id.slice(0,2)}</td>
                <td className="px-6 py-4">
                  {item.station ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
                       <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.station.color_code }} />
                       <span className="text-[10px] font-black text-white uppercase tracking-widest">{item.station.station_name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest italic tracking-[0.2em]">Unassigned</span>
                      {item.name.toLowerCase().includes('fried') && (
                        <div className="text-[8px] font-bold text-orange-500 uppercase tracking-tighter animate-pulse">
                          Suggestion: FRY STATION
                        </div>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
           <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-6">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">Assign Location</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Set terminal for {selectedIds.length} items</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-500">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {stations.map(s => (
                  <button
                    key={s.station_id}
                    onClick={() => handleBulkAssign(s.station_id)}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800 transition-all group"
                  >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color_code }} />
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">{s.station_name} TERMINAL</span>
                  </button>
                ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
