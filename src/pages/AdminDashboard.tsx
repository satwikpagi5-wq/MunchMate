import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BarChart3, 
  Clock, 
  ChefHat, 
  CheckCircle2, 
  AlertCircle, 
  IndianRupee, 
  Users, 
  ArrowUpRight,
  Search,
  Filter,
  MoreVertical,
  QrCode
} from "lucide-react";
import { api } from "../services/api";
import { Order } from "../types";
import { cn } from "../lib/utils";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"orders" | "financials">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [financials, setFinancials] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Live subscriber for orders
    const unsubscribe = api.subscribeToOrders((data) => {
      setOrders(data);
      setLoading(false);
    });

    // Fetch financials separately (could also be real-time if needed)
    api.getFinancials().then(setFinancials);

    return () => unsubscribe();
  }, []);

  const handleStatusUpdate = async (orderId: string, status: string) => {
    await api.updateOrderStatus(orderId, status);
    // Financials might need re-fetching if status changed
    api.getFinancials().then(setFinancials);
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-orange-100 text-orange-600";
      case "preparing": return "bg-blue-100 text-blue-600";
      case "ready": return "bg-green-100 text-green-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse">Accessing Secure Admin Panel...</div>;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50/50">
      {/* Admin Sidebar */}
      <aside className="w-full lg:w-72 bg-white border-r border-gray-100 p-8 flex flex-col pt-24 lg:pt-8 ">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white">
            <ChefHat size={24} />
          </div>
          <div>
            <h2 className="font-black text-lg">Merchant</h2>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">PU Goa Terminal 01</p>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 px-2">Management</p>
          <button 
            onClick={() => setActiveTab("orders")}
            className={cn(
               "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
               activeTab === "orders" ? "bg-gray-900 text-white shadow-xl shadow-gray-900/10" : "text-gray-500 hover:bg-gray-100"
            )}
          >
            <Clock size={18} />
            Live Orders
            {orders.filter(o => o.status === "pending").length > 0 && (
               <span className="ml-auto w-5 h-5 bg-orange-500 text-white text-[10px] rounded-full flex items-center justify-center">
                 {orders.filter(o => o.status === "pending").length}
               </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab("financials")}
            className={cn(
               "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
               activeTab === "financials" ? "bg-gray-900 text-white shadow-xl shadow-gray-900/10" : "text-gray-500 hover:bg-gray-100"
            )}
          >
            <BarChart3 size={18} />
            Financials
          </button>
        </nav>

        <div className="mt-auto p-6 bg-orange-50 rounded-3xl border border-orange-100">
          <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-2">System Status</p>
          <div className="flex items-center gap-2 text-green-600 text-xs font-bold">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live Sync: Active
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto pt-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">
              {activeTab === "orders" ? "Kitchen Feed" : "Financial Summary"}
            </h1>
            <p className="text-gray-500 text-sm">Managing the daily crunch at Parul Goa.</p>
          </div>

          <div className="flex items-center gap-4">
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
               <input 
                 type="text" 
                 placeholder="Search Order ID..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-gray-900 transition-all w-full md:w-64"
               />
             </div>
          </div>
        </header>

        {activeTab === "orders" ? (
          <div className="space-y-8">
            {/* Stats Overlays */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Average Prep Time</p>
                 <div className="flex items-baseline gap-2">
                   <h3 className="text-3xl font-black">12.5</h3>
                   <span className="text-sm font-bold text-gray-400 uppercase">Mins</span>
                 </div>
               </div>
               <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Active Mates</p>
                 <h3 className="text-3xl font-black">{orders.length}</h3>
               </div>
               <div className="bg-orange-500 p-8 rounded-[32px] shadow-xl shadow-orange-500/20 text-white">
                 <p className="text-[10px] font-bold text-orange-200 uppercase tracking-widest mb-2">Rush Hour Peak</p>
                 <h3 className="text-3xl font-black">1:30 PM</h3>
               </div>
            </div>

            {/* Orders Feed */}
            <div className="grid grid-cols-1 gap-4">
               <AnimatePresence>
                 {filteredOrders.length === 0 ? (
                    <div className="py-20 text-center text-gray-400">No matching orders found.</div>
                 ) : (
                    filteredOrders.map(order => (
                      <motion.div 
                        key={order.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-6 rounded-[32px] border border-gray-100 flex flex-col md:flex-row md:items-center gap-6 group hover:border-gray-200 transition-all shadow-sm"
                      >
                         <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900 group-hover:bg-orange-50 transition-colors">
                           <QrCode size={28} />
                         </div>
                         
                         <div className="flex-1">
                           <div className="flex items-center gap-3 mb-1">
                             <h4 className="font-bold text-sm tracking-tight">{order.id}</h4>
                             <span className={cn("px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest", getStatusColor(order.status))}>
                               {order.status}
                             </span>
                           </div>
                           <p className="text-xs text-gray-500 mb-2 truncate max-w-md">
                             {order.items.map(i => `${i.quantity}x ${i.name}`).join(", ")}
                           </p>
                           <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                             <span className="flex items-center gap-1"><Clock size={12} /> {order.pickupTime}</span>
                             <span className="flex items-center gap-1 border-l pl-4 border-gray-100"><IndianRupee size={12} /> ₹{order.total}</span>
                           </div>
                         </div>

                         <div className="flex items-center gap-2">
                           {order.status === "pending" && (
                              <button 
                                onClick={() => handleStatusUpdate(order.id, "preparing")}
                                className="px-6 py-3 bg-gray-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-[#E2262E] transition-colors"
                              >
                                Start Prep
                              </button>
                           )}
                           {order.status === "preparing" && (
                              <button 
                                onClick={() => handleStatusUpdate(order.id, "ready")}
                                className="px-6 py-3 bg-[#E2262E] text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors"
                              >
                                Mark Ready
                              </button>
                           )}
                           {order.status === "ready" && (
                              <button 
                                onClick={() => handleStatusUpdate(order.id, "delivered")}
                                className="px-6 py-3 bg-green-500 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-green-600 transition-colors"
                              >
                                Picked Up
                              </button>
                           )}
                           <button className="p-3 text-gray-400 hover:bg-gray-50 rounded-xl">
                              <MoreVertical size={18} />
                           </button>
                         </div>
                      </motion.div>
                    ))
                 )}
               </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
             {/* Revenue Stats */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm col-span-1 lg:col-span-2">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Total Revenue Today</p>
                   <div className="flex items-center justify-between">
                     <h3 className="text-5xl font-black tracking-tight">₹{financials?.todayRevenue || "0"}</h3>
                     <div className="flex items-center gap-1 text-green-500 font-black text-xs">
                        <ArrowUpRight size={16} /> +12%
                     </div>
                   </div>
                </div>
                <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Unpaid Pending</p>
                   <h3 className="text-3xl font-black text-orange-500">₹{financials?.pendingPayments || "0"}</h3>
                </div>
                <div className="bg-gray-900 p-8 rounded-[40px] shadow-xl text-white">
                   <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Wallet Credits</p>
                   <h3 className="text-3xl font-black">₹8.4k</h3>
                </div>
             </div>

             {/* Transaction History Table */}
             <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                   <h3 className="font-bold text-xl">Recent Transactions</h3>
                   <div className="flex gap-2">
                      <button className="p-2 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"><Filter size={16} /></button>
                   </div>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                     <thead className="bg-gray-50/50">
                       <tr>
                         <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Order ID</th>
                         <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Method</th>
                         <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Status</th>
                         <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Amount</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                        {financials?.transactions?.map((t: any) => (
                          <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                             <td className="px-8 py-6 text-sm font-bold">{t.orderId}</td>
                             <td className="px-8 py-6">
                               <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                                 <IndianRupee size={14} className="text-orange-500" /> {t.method}
                               </div>
                             </td>
                             <td className="px-8 py-6">
                               <span className={cn(
                                 "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest",
                                 t.status === "Success" ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
                               )}>
                                 {t.status}
                               </span>
                             </td>
                             <td className="px-8 py-6 text-right font-black text-sm">₹{t.amount}</td>
                          </tr>
                        ))}
                     </tbody>
                   </table>
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}
