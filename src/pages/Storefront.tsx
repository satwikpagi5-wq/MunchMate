import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { api } from "../services/api";
import { MenuItem, Order } from "../types";
import { useAuth } from "../context/AuthContext";
import { 
  Filter, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  ChefHat, 
  Timer,
  ShoppingBag,
  CheckCircle2,
  X,
  ChevronRight,
  Sparkles,
  Zap,
  Wallet,
  Clock as ClockIcon,
  MapPin,
  Users
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "../lib/utils";

export default function Storefront() {
  const { user } = useAuth();
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [pickupTime, setPickupTime] = useState("ASAP");
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "card">("wallet");
  const [selectedLocation, setLocation] = useState("Canteen");

  useEffect(() => {
    api.getMenu().then(data => {
      setMenu(data);
      setLoading(false);
    });
  }, []);

  const categories = ["All", ...new Set(menu.map(item => item.category))];

  const filteredMenu = menu.filter(item => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing?.quantity === 1) {
        return prev.filter(i => i.id !== id);
      }
      return prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i);
    });
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    try {
      const order = await api.placeOrder(cart, total, pickupTime, selectedLocation, user?.uid);
      setPlacedOrder(order);
      setCart([]);
    } catch (error) {
      console.error("Checkout failed:", error);
      // Fallback for demo if not logged in
      if (!user) {
        alert("Please sign in to place an order.");
      }
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse">Loading MunchMate Menu...</div>;

  return (
    <div className="px-4 py-12 flex flex-col md:flex-row gap-12">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 flex-shrink-0">
        <div className="sticky top-24">
          <h2 className="text-2xl font-bold mb-8">Fuel Station</h2>
          
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search food..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 text-sm outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 px-2">Categories</p>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between",
                  selectedCategory === cat ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "text-gray-500 hover:bg-gray-100"
                )}
              >
                {cat}
                {cat === "Special" ? <Sparkles size={14} /> : <Filter size={14} className={selectedCategory === cat ? "opacity-100" : "opacity-0"} />}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Menu Grid */}
      <section className="flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMenu.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={cn(
                "bg-white border rounded-3xl overflow-hidden group hover:shadow-xl hover:shadow-black/5 transition-all",
                item.isExamMode ? "border-purple-100 ring-1 ring-purple-100/50 shadow-lg shadow-purple-500/5" : "border-gray-100"
              )}
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] font-bold uppercase tracking-wider text-orange-600">
                  {item.category}
                </div>
                {item.isExamMode && (
                   <div className="absolute top-4 right-4 px-3 py-1 bg-purple-600 text-white rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg">
                      <Zap size={10} /> Exam Mode
                   </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                {item.macros && (
                  <div className="flex gap-3 mb-3 text-[10px] font-bold text-gray-400">
                    <span className="bg-gray-50 px-2 py-0.5 rounded uppercase">{item.macros.calories} Cal</span>
                    <span className="bg-gray-50 px-2 py-0.5 rounded uppercase">{item.macros.protein} Protein</span>
                  </div>
                )}
                <p className="text-gray-500 text-xs line-clamp-2 mb-4 leading-relaxed">
                  {item.description}
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Price</p>
                    <p className="text-xl font-black text-gray-900">₹{item.price}</p>
                  </div>
                  <button 
                    onClick={() => addToCart(item)}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-lg active:scale-95",
                      item.isExamMode ? "bg-purple-600 text-white" : "bg-gray-900 text-white hover:bg-orange-500"
                    )}
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <button 
          onClick={() => { setPlacedOrder(null); setShowCart(true); }}
          className="fixed bottom-10 right-10 p-5 bg-orange-500 text-white rounded-full shadow-2xl flex items-center gap-3 z-50 hover:scale-105 transition-transform"
        >
          <ShoppingBag />
          <span className="font-bold">{cart.length} <span className="hidden sm:inline">Mates in Cart</span> • ₹{total}</span>
        </button>
      )}

      {/* Cart & Success Modal */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCart(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" 
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[70] p-8 shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between p-8 border-b border-gray-100">
                <h2 className="text-3xl font-black tracking-tight">{placedOrder ? "Ready to Munch!" : "Your Munch Cart"}</h2>
                <button onClick={() => setShowCart(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {placedOrder ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="p-6 bg-white border-2 border-orange-100 rounded-[32px] shadow-xl mb-8">
                      <QRCodeSVG value={placedOrder.qrCode || ""} size={180} />
                    </div>
                    <div className="flex items-center gap-2 mb-4 px-4 py-2 bg-green-50 text-green-600 rounded-full font-bold text-xs">
                       <CheckCircle2 size={16} /> Order {placedOrder.id} Active
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Scan at Canteen Kiosk</h3>
                    <p className="text-gray-500 text-sm max-w-[280px]">
                      Your meal will be prepared for <b>{placedOrder.pickupTime}</b> at <b>{selectedLocation}</b>. Skip the line, just scan and pick!
                    </p>
                    <div className="mt-8 flex gap-3">
                      <Link 
                        to="/queue" 
                        className="px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold text-sm"
                      >
                         Live Tracker
                      </Link>
                      <button 
                        onClick={() => { setShowCart(false); setPlacedOrder(null); }}
                        className="px-6 py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold text-sm"
                      >
                         Back to Menu
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {cart.map(item => (
                        <div key={item.id} className="flex items-center gap-4 group">
                          <img src={item.image} className="w-16 h-16 rounded-2xl object-cover" />
                          <div className="flex-1">
                            <h4 className="font-bold text-sm mb-0.5">{item.name}</h4>
                            <p className="text-orange-500 font-bold text-sm">₹{item.price}</p>
                          </div>
                          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl">
                            <button onClick={() => removeFromCart(item.id)} className="p-1 text-gray-400 hover:text-red-500"><Minus size={14} /></button>
                            <span className="w-4 text-center font-bold text-xs">{item.quantity}</span>
                            <button onClick={() => addToCart(item)} className="p-1 text-gray-400 hover:text-orange-500"><Plus size={14} /></button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-6 bg-gray-50 rounded-[32px] border border-white space-y-6">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                           <ClockIcon size={12} /> Pre-Schedule Pickup
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {["ASAP", "Next Break", "1:30 PM", "4:30 PM"].map(time => (
                            <button
                              key={time}
                              onClick={() => setPickupTime(time)}
                              className={cn(
                                "py-2.5 rounded-xl text-[10px] font-black uppercase transition-all",
                                pickupTime === time ? "bg-gray-900 text-white" : "bg-white text-gray-400 border border-gray-100"
                              )}
                            >
                               {time}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                           <MapPin size={12} /> Delivery Zone
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {["Canteen", "Library Zone", "Block A", "Block B"].map(loc => (
                            <button
                              key={loc}
                              onClick={() => setLocation(loc)}
                              className={cn(
                                "py-2.5 rounded-xl text-[10px] font-black uppercase transition-all",
                                selectedLocation === loc ? "bg-gray-900 text-white" : "bg-white text-gray-400 border border-gray-100"
                              )}
                            >
                               {loc}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                           <Wallet size={12} /> Payment Method
                        </p>
                        <div className="space-y-2">
                           <button 
                             onClick={() => setPaymentMethod("wallet")}
                             className={cn(
                               "w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all text-left",
                               paymentMethod === "wallet" ? "border-orange-500 bg-orange-50/50" : "border-gray-100 bg-white"
                             )}
                           >
                              <div className="flex items-center gap-3">
                                 <Wallet size={18} className="text-orange-500" />
                                 <span className="text-sm font-bold">Munch-Wallet</span>
                              </div>
                              <span className="text-[10px] font-bold text-orange-500">Fast 1-Click</span>
                           </button>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <button 
                          className="w-full p-4 bg-orange-100/50 text-orange-600 rounded-2xl flex items-center justify-center gap-3 font-bold text-[10px] uppercase tracking-widest"
                        >
                           <Users size={16} /> Start Group Session
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {!placedOrder && cart.length > 0 && (
                <div className="mt-auto p-8 border-t border-gray-100 bg-white">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Total Amount</span>
                    <span className="text-3xl font-black">₹{total}</span>
                  </div>
                  <button 
                    onClick={handleCheckout}
                    className="w-full py-5 bg-gray-900 text-white rounded-3xl font-bold hover:bg-orange-500 transition-all shadow-xl shadow-orange-500/10 flex items-center justify-center gap-3"
                  >
                    Place Scheduled Order
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
