import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { api } from "../services/api";
import { QueueItem } from "../types";
import { 
  Clock, 
  CheckCircle2, 
  ChefHat, 
  Flame, 
  Timer,
  Bell,
  Utensils,
  ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";

export default function Queue() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = api.subscribeToQueue((data) => {
      setQueue(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const preparing = queue.filter(item => item.status === "Preparing");
  const ready = queue.filter(item => item.status === "Ready");

  if (loading) return <div className="p-20 text-center animate-pulse">Checking Order Status...</div>;

  return (
    <div className="px-4 py-12 max-w-5xl mx-auto text-gray-900 dark:text-white">
      <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-black tracking-tight mb-4 dark:text-white"
          >
           LIVE <span className="text-orange-500">QUEUE</span>.
          </motion.h1>
          <p className="text-gray-500 dark:text-gray-400">Tracking current meals being crafted in the kitchen.</p>
        </div>
        
        <div className="flex items-center gap-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-white dark:border-gray-800 shadow-sm">
           <div className="text-center">
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">In Queue</p>
             <p className="text-2xl font-black">{preparing.length}</p>
           </div>
           <div className="w-px h-8 bg-gray-200 dark:bg-gray-800" />
           <div className="text-center">
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Ready for Pickup</p>
             <p className="text-2xl font-black text-green-500">{ready.length}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Preparing Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-950/40 text-orange-600 rounded-xl flex items-center justify-center">
              <ChefHat size={20} />
            </div>
            <h2 className="text-xl font-bold dark:text-white">Kitchen Crafting</h2>
          </div>

          <div className="space-y-4">
            {preparing.length === 0 ? (
              <div className="py-20 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[32px] flex flex-col items-center justify-center text-gray-400">
                <Utensils className="mb-4 opacity-20" size={48} />
                <p className="text-sm font-medium">No active orders</p>
              </div>
            ) : (
              preparing.map((item, idx) => (
                <motion.div
                  key={item.orderId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl flex items-center justify-between group hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-orange-500 transition-colors">
                      <Flame size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm dark:text-white">{item.orderId}</h4>
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Wait: ~12 mins</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-orange-50 dark:bg-orange-950/20 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                    <Timer size={12} />
                    {item.status}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Ready Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-950/40 text-green-600 rounded-xl flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
            <h2 className="text-xl font-bold dark:text-white">Ready to Crave</h2>
          </div>

          <div className="space-y-4">
            {ready.length === 0 ? (
              <div className="py-20 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[32px] flex flex-col items-center justify-center text-gray-400">
                <Bell className="mb-4 opacity-20" size={48} />
                <p className="text-sm font-medium">Clear for now</p>
              </div>
            ) : (
              ready.map((item, idx) => (
                <motion.div
                  key={item.orderId}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 bg-white dark:bg-gray-900 border-2 border-green-100 dark:border-green-900/30 rounded-3xl flex items-center justify-between shadow-lg shadow-green-500/5"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500 text-white rounded-2xl flex items-center justify-center">
                      <Bell size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm tracking-tight dark:text-white">{item.orderId}</h4>
                      <p className="text-[10px] uppercase font-bold text-green-600 tracking-widest">At Counter 01</p>
                    </div>
                  </div>
                  <button className="px-5 py-2 bg-green-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest hover:bg-green-600 transition-colors">
                    Picked Up
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-20 p-8 bg-gray-900 dark:bg-orange-600/10 dark:border dark:border-orange-500/20 text-white rounded-[48px] flex items-center justify-between">
          <div className="max-w-xs">
            <h3 className="text-xl font-bold mb-2">Feeling Hungry?</h3>
            <p className="text-gray-400 text-sm">Wait times are currently lower than average for snacks!</p>
          </div>
          <Link to="/menu" className="px-8 py-4 bg-orange-500 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2 hover:bg-white hover:text-orange-500 transition-all">
             View Menu <ChevronRight size={18} />
          </Link>
      </div>
    </div>
  );
}
