import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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
  QrCode,
  CreditCard,
  Utensils,
  X,
  Armchair,
  History,
  Calendar
} from "lucide-react";
import { api } from "../services/api";
import { Order, MenuItem } from "../types";
import { cn } from "../lib/utils";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"orders" | "payments" | "financials" | "bookings" | "profile" | "menu" | "history">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [financials, setFinancials] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    price: 0,
    category: "Main Course",
    description: "",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
    available: true,
    rating: 4.5,
    prepTime: "15 min"
  });

  const pendingPayments = orders.filter(o => o.paymentStatus === "Pending UPI");
  const receivedPayments = orders.filter(o => o.paymentStatus === "Paid" || o.paymentStatus === "Paid (Wallet)");

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/login?role=admin");
        return;
      }
      
      // Basic check: In a real app, you'd check a field in Firestore or a custom claim
      // For this app, we'll allow the creator or anyone with 'admin' in their email (demo logic)
      // or specifically the user's email provided in the prompt context.
      const isUserAdmin = user.email === "saatwikpagi5@gmail.com" || user.email?.includes("admin");
      setIsAdmin(isUserAdmin);
      
      if (!isUserAdmin) {
        // Not an admin? Redirect to home
        navigate("/");
        return;
      }
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;

    // Live subscriber for orders
    const unsubscribeOrders = api.subscribeToOrders((data) => {
      setOrders(data);
      setLoading(false);
    });

    // Live subscriber for bookings
    const unsubscribeBookings = api.subscribeToBookings((data) => {
      setBookings(data);
    });

    // Fetch financials
    api.getFinancials().then(setFinancials);

    // Fetch menu
    api.getMenu().then(setMenuItems);

    return () => {
      unsubscribeOrders();
      unsubscribeBookings();
    };
  }, []);

  const handleStatusUpdate = async (orderId: string, status: string) => {
    await api.updateOrderStatus(orderId, status);
    api.getFinancials().then(setFinancials);
  };

  const handleBookingStatus = async (bookingId: string, status: string) => {
    await api.updateBookingStatus(bookingId, status);
  };

  const handlePaymentStatusUpdate = async (orderId: string, status: string) => {
    // In a real app we would update the document in Firestore
    // For now we use the order status update logic or add a new one in api.ts
    await api.updateOrderStatus(orderId, undefined, status);
    api.getFinancials().then(setFinancials);
  };

  const handleToggleAvailability = async (itemId: string, available: boolean) => {
    await api.updateMenuItem(itemId, { available });
    api.getMenu().then(setMenuItems);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      await api.deleteMenuItem(itemId);
      api.getMenu().then(setMenuItems);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.addMenuItem(newItem);
    setIsAddItemModalOpen(false);
    api.getMenu().then(setMenuItems);
    setNewItem({
      name: "",
      price: 0,
      category: "Main Course",
      description: "",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
      available: true,
      rating: 4.5,
      prepTime: "15 min"
    });
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
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50/50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300">
      {/* Admin Sidebar */}
      <aside className="w-full lg:w-72 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 p-8 flex flex-col pt-24 lg:pt-8 ">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-gray-900 dark:bg-orange-500 rounded-xl flex items-center justify-center text-white">
            <ChefHat size={24} />
          </div>
          <div>
            <h2 className="font-black text-lg dark:text-white">Merchant</h2>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">PU Goa Terminal 01</p>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 px-2">Management</p>
          <button 
            onClick={() => setActiveTab("orders")}
            className={cn(
               "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
               activeTab === "orders" ? "bg-gray-900 dark:bg-orange-500 text-white shadow-xl shadow-gray-900/10 dark:shadow-orange-500/10" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
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
            onClick={() => setActiveTab("history")}
            className={cn(
               "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
               activeTab === "history" ? "bg-gray-900 dark:bg-orange-500 text-white shadow-xl shadow-gray-900/10 dark:shadow-orange-500/10" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
          >
            <History size={18} />
            Order History
          </button>
          <button 
            onClick={() => setActiveTab("menu")}
            className={cn(
               "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
               activeTab === "menu" ? "bg-gray-900 dark:bg-orange-500 text-white shadow-xl shadow-gray-900/10 dark:shadow-orange-500/10" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
          >
            <Utensils size={18} />
            Menu Manager
          </button>
          <button 
            onClick={() => setActiveTab("financials")}
            className={cn(
               "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
               activeTab === "financials" ? "bg-gray-900 dark:bg-orange-500 text-white shadow-xl shadow-gray-900/10 dark:shadow-orange-500/10" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
          >
            <BarChart3 size={18} />
            Financials
          </button>
          <button 
            onClick={() => setActiveTab("payments")}
            className={cn(
               "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
               activeTab === "payments" ? "bg-gray-900 dark:bg-orange-500 text-white shadow-xl shadow-gray-900/10 dark:shadow-orange-500/10" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
          >
            <CreditCard size={18} />
            Payment Status
            {pendingPayments.length > 0 && (
               <span className="ml-auto w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                 {pendingPayments.length}
               </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab("bookings")}
            className={cn(
               "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
               activeTab === "bookings" ? "bg-gray-900 dark:bg-orange-500 text-white shadow-xl shadow-gray-900/10 dark:shadow-orange-500/10" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
          >
            <Armchair size={18} />
            Table Bookings
            {bookings.filter(b => b.status === "confirmed").length > 0 && (
               <span className="ml-auto w-5 h-5 bg-blue-500 text-white text-[10px] rounded-full flex items-center justify-center">
                 {bookings.filter(b => b.status === "confirmed").length}
               </span>
            )}
          </button>

          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-8 mb-4 px-2">Account</p>
          <button 
            onClick={() => setActiveTab("profile")}
            className={cn(
               "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
               activeTab === "profile" ? "bg-gray-900 dark:bg-orange-500 text-white shadow-xl shadow-gray-900/10 dark:shadow-orange-500/10" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
          >
            <ChefHat size={18} />
            Store Profile
          </button>
        </nav>

        <div className="mt-auto p-6 bg-orange-50 dark:bg-orange-950/20 rounded-3xl border border-orange-100 dark:border-orange-900/30">
          <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-2">System Status</p>
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-xs font-bold">
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
              {activeTab === "orders" ? "Kitchen Feed" : activeTab === "history" ? "Order History" : activeTab === "menu" ? "Menu Management" : activeTab === "payments" ? "Payment Verification" : activeTab === "financials" ? "Financial Summary" : activeTab === "bookings" ? "Table Bookings" : "Store Profile"}
            </h1>
            <p className="text-gray-500 text-sm">Managing the daily crunch at Parul Goa.</p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4">
             {activeTab === "history" && (
                <div className="flex items-center gap-2">
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">All States</option>
                    <option value="pending">Pending</option>
                    <option value="preparing">Preparing</option>
                    <option value="ready">Ready</option>
                    <option value="delivered">Delivered</option>
                  </select>
                  <input 
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="px-4 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
             )}
             <div className="relative w-full md:w-auto">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
               <input 
                 type="text" 
                 placeholder="Search Order ID..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-orange-500 transition-all w-full md:w-64 dark:text-white"
               />
             </div>
          </div>
        </header>

        {activeTab === "orders" ? (
          <div className="space-y-8">
            {/* Stats Overlays */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-white dark:bg-gray-900 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Average Prep Time</p>
                 <div className="flex items-baseline gap-2">
                   <h3 className="text-3xl font-black dark:text-white">12.5</h3>
                   <span className="text-sm font-bold text-gray-400 uppercase">Mins</span>
                 </div>
               </div>
               <div className="bg-white dark:bg-gray-900 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Active Mates</p>
                 <h3 className="text-3xl font-black dark:text-white">{orders.length}</h3>
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
                        className="bg-white dark:bg-gray-900 p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center gap-6 group hover:border-gray-200 dark:hover:border-gray-700 transition-all shadow-sm"
                      >
                         <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-900 dark:text-white group-hover:bg-orange-50 dark:group-hover:bg-orange-950/20 transition-colors">
                           <QrCode size={28} />
                         </div>
                         
                         <div className="flex-1">
                           <div className="flex items-center gap-3 mb-1">
                             <h4 className="font-bold text-sm tracking-tight dark:text-white">{order.id}</h4>
                             <span className={cn("px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest", getStatusColor(order.status))}>
                               {order.status}
                             </span>
                             <span className="text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                               {order.paymentStatus || "Paid (Wallet)"}
                             </span>
                           </div>
                           <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 truncate max-w-md">
                             {order.items.map(i => `${i.quantity}x ${i.name}`).join(", ")}
                           </p>
                           <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                             <span className="flex items-center gap-1"><Clock size={12} /> {order.pickupTime}</span>
                             <span className="flex items-center gap-1 border-l pl-4 border-gray-100 dark:border-gray-800"><IndianRupee size={12} /> ₹{order.total}</span>
                           </div>
                         </div>

                         <div className="flex items-center gap-2">
                           {order.status === "pending" && (
                              <button 
                                onClick={() => handleStatusUpdate(order.id, "preparing")}
                                className="px-6 py-3 bg-gray-900 dark:bg-orange-500 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-orange-500 dark:hover:bg-orange-600 transition-colors"
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
        ) : activeTab === "history" ? (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Order ID</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Items</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Date/Time</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Status</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {orders
                      .filter(o => {
                        const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase());
                        const matchesStatus = statusFilter === "all" || o.status === statusFilter;
                        const orderDate = new Date(o.timestamp).toISOString().split('T')[0];
                        const matchesDate = !dateFilter || orderDate === dateFilter;
                        return matchesSearch && matchesStatus && matchesDate;
                      })
                      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                      .map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-8 py-6">
                          <span className="text-sm font-black font-mono">{order.id}</span>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-xs text-gray-600 dark:text-gray-400 max-w-xs truncate">
                            {order.items.map(i => `${i.quantity}x ${i.name}`).join(", ")}
                          </p>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase">
                            <Calendar size={12} />
                            {new Date(order.timestamp).toLocaleDateString()} {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                            getStatusColor(order.status)
                          )}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <span className="text-sm font-black dark:text-white">₹{order.total}</span>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-20 text-center text-gray-400 italic font-medium">
                          No order history found for the selected filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === "menu" ? (
          <div className="space-y-8">
            <div className="flex justify-between items-center bg-white dark:bg-gray-900 p-6 rounded-[32px] border border-gray-100 dark:border-gray-800">
               <div>
                  <h3 className="font-bold">Active Inventory</h3>
                  <p className="text-xs text-gray-500">{menuItems.length} items total</p>
               </div>
               <button 
                  onClick={() => setIsAddItemModalOpen(true)}
                  className="px-6 py-3 bg-gray-900 dark:bg-orange-500 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform"
               >
                  Add New Item
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {menuItems.map(item => (
                  <div key={item.id} className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 overflow-hidden group">
                     <div className="relative h-40">
                        <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                        <div className="absolute top-4 right-4">
                           <span className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                              item.available ? "bg-green-500 text-white" : "bg-red-500 text-white"
                           )}>
                              {item.available ? "Live" : "Sold Out"}
                           </span>
                        </div>
                     </div>
                     <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                           <h4 className="font-bold dark:text-white">{item.name}</h4>
                           <span className="font-black text-orange-600">₹{item.price}</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 line-clamp-2">{item.description}</p>
                        
                        <div className="flex gap-2">
                           <button 
                              onClick={() => handleToggleAvailability(item.id, !item.available)}
                              className="flex-1 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-orange-50 dark:hover:bg-orange-950 transition-colors"
                           >
                              {item.available ? "Mark OOS" : "Re-stock"}
                           </button>
                           <button 
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-2 text-gray-400 hover:text-red-500"
                           >
                              <X size={18} />
                           </button>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
          </div>
        ) : activeTab === "payments" ? (
          <div className="space-y-12">
            {/* Pending Section */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
                  <Clock size={20} />
                </div>
                <h2 className="text-2xl font-black">Pending Payments</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingPayments.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-[32px] border border-dashed border-gray-200 dark:border-gray-800">
                    No pending payments. Good job!
                  </div>
                ) : (
                  pendingPayments.map(order => (
                    <div key={order.id} className="bg-white dark:bg-gray-900 p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm">
                      <div className="flex justify-between mb-4">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order ID</p>
                          <p className="font-bold">#{order.id.slice(-6).toUpperCase()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</p>
                          <p className="text-xl font-black text-gray-900 dark:text-white">₹{order.total}</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl mb-6">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-xs font-medium">
                            <span className="text-gray-500 dark:text-gray-400">{item.quantity}x {item.name}</span>
                            <span className="text-gray-900 dark:text-white">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      <button 
                        onClick={() => handlePaymentStatusUpdate(order.id, "Paid")}
                        className="w-full py-4 bg-green-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-green-600/20 hover:scale-[1.02] transition-transform"
                      >
                        Confirm UPI Received
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Received Section */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                  <CheckCircle2 size={20} />
                </div>
                <h2 className="text-2xl font-black text-gray-400">Recently Received</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {receivedPayments.slice(0, 6).map(order => (
                  <div key={order.id} className="bg-gray-50/50 p-5 rounded-[28px] border border-gray-100 opacity-60">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[10px] font-black text-gray-400 uppercase">#{order.id.slice(-4)}</span>
                       <span className="text-sm font-black text-green-600">₹{order.total}</span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-500 truncate">
                      {order.items.map(i => i.name).join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : activeTab === "bookings" ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {bookings.length === 0 ? (
                  <div className="col-span-full py-20 text-center text-gray-400">No active table bookings.</div>
                ) : (
                  bookings.map(booking => (
                    <motion.div 
                      key={booking.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white dark:bg-gray-900 p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm"
                    >
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-900 dark:text-white">
                            <Users size={24} />
                          </div>
                          <div>
                            <h4 className="font-bold dark:text-white">{booking.sectionId}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{booking.guests} Guests • {booking.time}</p>
                          </div>
                        </div>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest",
                          booking.status === "seated" ? "bg-green-100 dark:bg-green-900/20 text-green-600" : 
                          booking.status === "cancelled" ? "bg-red-100 dark:bg-red-900/20 text-red-600" : 
                          "bg-blue-100 dark:bg-blue-900/20 text-blue-600"
                        )}>
                          {booking.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {booking.status === "confirmed" && (
                          <>
                            <button 
                              onClick={() => handleBookingStatus(booking.id, "seated")}
                              className="flex-1 py-3 bg-gray-900 dark:bg-orange-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest"
                            >
                              Mark Seated
                            </button>
                            <button 
                              onClick={() => handleBookingStatus(booking.id, "cancelled")}
                              className="px-4 py-3 border border-gray-100 dark:border-gray-800 text-gray-400 rounded-xl text-xs font-bold uppercase tracking-widest hover:text-red-500"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {booking.status === "seated" && (
                           <div className="w-full py-3 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl text-[10px] font-black uppercase tracking-widest text-center">
                              Guest checked-in
                           </div>
                        )}
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
                <div className="bg-white dark:bg-gray-900 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm col-span-1 lg:col-span-2">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Total Revenue Today</p>
                   <div className="flex items-center justify-between">
                     <h3 className="text-5xl font-black tracking-tight dark:text-white">₹{financials?.todayRevenue || "0"}</h3>
                     <div className="flex items-center gap-1 text-green-500 font-black text-xs">
                        <ArrowUpRight size={16} /> +12%
                     </div>
                   </div>
                </div>
                <div className="bg-white dark:bg-gray-900 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Unpaid Pending</p>
                   <h3 className="text-3xl font-black text-orange-500">₹{financials?.pendingPayments || "0"}</h3>
                </div>
                <div className="bg-gray-900 dark:bg-gray-800 p-8 rounded-[40px] shadow-xl text-white">
                   <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Wallet Credits</p>
                   <h3 className="text-3xl font-black">₹8.4k</h3>
                </div>
             </div>

             {/* Transaction History Table */}
             <div className="bg-white dark:bg-gray-900 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
                   <h3 className="font-bold text-xl">Recent Transactions</h3>
                   <div className="flex gap-2">
                      <button className="p-2 border border-gray-100 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"><Filter size={16} /></button>
                   </div>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                     <thead className="bg-gray-50/50 dark:bg-gray-800/50">
                       <tr>
                         <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Order ID</th>
                         <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Method</th>
                         <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Status</th>
                         <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Amount</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                        {financials?.transactions?.map((t: any) => (
                          <tr key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                             <td className="px-8 py-6 text-sm font-bold dark:text-white">{t.orderId}</td>
                             <td className="px-8 py-6">
                               <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                                 <IndianRupee size={14} className="text-orange-500" /> {t.method}
                               </div>
                             </td>
                             <td className="px-8 py-6">
                               <span className={cn(
                                 "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest",
                                 t.status === "Success" ? "bg-green-100 dark:bg-green-900/20 text-green-600" : "bg-orange-100 dark:bg-orange-900/20 text-orange-600"
                               )}>
                                 {t.status}
                               </span>
                             </td>
                             <td className="px-8 py-6 text-right font-black text-sm dark:text-white">₹{t.amount}</td>
                          </tr>
                        ))}
                     </tbody>
                   </table>
                </div>
             </div>
          </div>
        )}
        {activeTab === "profile" && (
           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             className="max-w-2xl"
           >
             <div className="bg-white dark:bg-gray-900 rounded-[48px] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-xl shadow-black/5">
                <div className="p-12 border-b border-gray-50 dark:border-gray-800 bg-orange-50/30 dark:bg-orange-950/20">
                   <div className="w-24 h-24 bg-gray-900 dark:bg-orange-500 rounded-[32px] flex items-center justify-center text-white mb-6">
                      <ChefHat size={48} />
                   </div>
                   <h2 className="text-3xl font-black dark:text-white">PU Goa Terminal 01</h2>
                   <p className="text-gray-500 font-medium">Main Canteen Branch • Parul University Goa</p>
                </div>
                
                <div className="p-12 space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Merchant Email</p>
                         <p className="font-bold text-lg dark:text-white">{user?.email}</p>
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Merchant ID</p>
                         <p className="font-bold text-lg font-mono text-orange-600">PUG-MR-2024-0812</p>
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">GST Registration</p>
                         <p className="font-bold text-lg dark:text-white">30AAAAA0000A1Z5</p>
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Verified Status</p>
                         <div className="flex items-center gap-2 text-green-600 font-bold">
                            <CheckCircle2 size={20} />
                            Active Merchant
                         </div>
                      </div>
                   </div>

                   <div className="pt-8 border-t border-gray-50 dark:border-gray-800 italic text-sm text-gray-400">
                      If you need to update your merchant details, please contact the Parul University Campus Administration.
                   </div>
                </div>
             </div>
           </motion.div>
        )}
      </main>

      <AnimatePresence>
        {isAddItemModalOpen && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAddItemModalOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-[40px] shadow-2xl p-10 overflow-hidden"
              >
                <div className="flex justify-between items-center mb-8">
                   <h3 className="text-2xl font-black">Add Menu Item</h3>
                   <button onClick={() => setIsAddItemModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                      <X size={20} />
                   </button>
                </div>

                <form onSubmit={handleAddItem} className="space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Item Name</label>
                        <input 
                          type="text" 
                          required
                          value={newItem.name}
                          onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Price (₹)</label>
                        <input 
                          type="number" 
                          required
                          value={newItem.price}
                          onChange={(e) => setNewItem({...newItem, price: Number(e.target.value)})}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Category</label>
                        <select 
                          value={newItem.category}
                          onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
                        >
                           <option>Main Course</option>
                           <option>Snacks</option>
                           <option>Beverages</option>
                           <option>Desserts</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Description</label>
                        <textarea 
                          rows={3}
                          value={newItem.description}
                          onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                   </div>

                   <button 
                     type="submit"
                     className="w-full py-4 bg-gray-900 dark:bg-orange-500 text-white rounded-2xl font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-xl shadow-gray-900/10"
                   >
                     Add to Menu
                   </button>
                </form>
              </motion.div>
           </div>
        )}
      </AnimatePresence>
    </div>
  );
}
