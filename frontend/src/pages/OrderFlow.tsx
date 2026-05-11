import React, { useEffect, useState } from 'react';
import { Send, ShoppingCart, RefreshCw, Layers } from 'lucide-react';
import { cn } from '../lib/utils';
import { apiUrl } from '../lib/api';

interface MenuItem {
  id: string;
  name: string;
  prep_time_minutes: number;
  category: string;
}

export default function OrderFlow() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<{ item: MenuItem; quantity: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(apiUrl('/api/menu'))
      .then((res) => res.json())
      .then((data) => {
        setMenu(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((entry) => entry.item.id === item.id);
      if (existing) {
        return prev.map((entry) => (entry.item.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry));
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) =>
      prev
        .map((entry) =>
          entry.item.id === itemId
            ? { ...entry, quantity: entry.quantity - 1 }
            : entry,
        )
        .filter((entry) => entry.quantity > 0),
    );
  };

  const submitOrder = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    try {
      const resp = await fetch(apiUrl('/api/orders'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNo: `T-${Math.floor(Math.random() * 24) + 1}`,
          items: cart.map((entry) => ({
            menu_item_id: entry.item.id,
            quantity: entry.quantity,
            notes: entry.quantity > 1 ? `Batch of ${entry.quantity}` : 'Standard prep',
          })),
        }),
      });

      if (resp.ok) {
        setCart([]);
        alert('Order sent to kitchen!');
      }
    } catch (error) {
      console.error('Failed to submit order:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-slate-500 font-mono">Loading Menu...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Menu Items</h2>
          <button onClick={() => window.location.reload()} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {menu.map((item) => (
            <button
              key={item.id}
              onClick={() => addToCart(item)}
              className="android-card p-6 text-left hover:border-blue-500/50 transition-all group active:scale-[0.98]"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-black text-white uppercase text-sm group-hover:text-blue-400 transition-colors tracking-tight">
                  {item.name}
                </h3>
                <span className="text-[10px] font-black text-slate-500 px-2 py-0.5 bg-white/5 rounded-full border border-white/5">
                  {item.prep_time_minutes}m
                </span>
              </div>
              <p className="text-[10px] text-slate-600 mt-4 font-black uppercase tracking-[0.2em]">{item.category}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col android-card overflow-hidden h-full shadow-2xl">
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 shadow-inner">
              <ShoppingCart className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Draft Queue</h3>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-tight">Pending Dispatch</p>
            </div>
          </div>
          <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            {cart.reduce((acc, curr) => acc + curr.quantity, 0)} UNITS
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-600">
              <Layers className="w-16 h-16 mb-6 opacity-10" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Queue Neutral</p>
            </div>
          ) : (
            cart.map((entry) => (
              <div
                key={entry.item.id}
                className="flex items-center justify-between p-4 rounded-[2rem] bg-white/5 border border-white/5 animate-in slide-in-from-right-2 duration-300"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center font-black text-blue-400 shadow-inner border border-white/5">
                    {entry.quantity}
                  </div>
                  <div>
                    <div className="text-xs font-black text-white uppercase tracking-wider">{entry.item.name}</div>
                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-tight">
                      {entry.item.prep_time_minutes}m SECURE
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(entry.item.id)}
                  className="p-3 hover:bg-red-500/10 text-slate-600 hover:text-red-500 rounded-2xl transition-colors active:scale-90"
                >
                  <RefreshCw className="w-5 h-5 rotate-45" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-8 bg-white/5 border-t border-white/5">
          <button
            onClick={submitOrder}
            disabled={cart.length === 0 || submitting}
            className={cn(
              'android-button w-full flex items-center justify-center gap-4 py-5 shadow-2xl',
              cart.length === 0 || submitting
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed shadow-none'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/50',
            )}
          >
            {submitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : (
              <>
                <Send className="w-5 h-5" />
                Initialize Global Dispatch
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
