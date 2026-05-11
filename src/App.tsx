import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  UtensilsCrossed, 
  Clock, 
  Armchair, 
  ShoppingCart, 
  Sparkles, 
  Home,
  ChevronRight,
  ChefHat,
  Menu as MenuIcon,
  X
} from "lucide-react";
import { cn } from "./lib/utils";

// Pages
import HomePage from "./pages/Home";
import StorefrontPage from "./pages/Storefront";
import BookingPage from "./pages/Booking";
import QueuePage from "./pages/Queue";
import CraveAI from "./pages/CraveAI";
import LoginPage from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import { AuthProvider, useAuth } from "./context/AuthContext";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const { user, profile, logout } = useAuth();

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Menu", path: "/menu", icon: UtensilsCrossed },
    { name: "Queue", path: "/queue", icon: Clock },
    { name: "Booking", path: "/booking", icon: Armchair },
    { name: "CraveAI", path: "/ai", icon: Sparkles },
    { name: "Admin", path: "/admin", icon: ChefHat },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 flex items-center px-4 md:px-8 justify-between shadow-sm">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white">
          <UtensilsCrossed size={24} />
        </div>
        <span className="font-bold text-xl tracking-tight text-gray-900 hidden sm:block">MunchMate<span className="text-orange-500">.</span></span>
      </Link>

      {/* Desktop Nav */}
      <div className="hidden lg:flex items-center gap-6">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-2 text-sm font-medium transition-colors hover:text-orange-500",
              location.pathname === item.path ? "text-orange-500" : "text-gray-500"
            )}
          >
            <item.icon size={18} />
            {item.name}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4">
        {user && profile && (
          <button 
            onClick={() => setIsProfileOpen(true)}
            className="hidden sm:flex items-center gap-3 mr-2 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100 hover:bg-orange-100 transition-colors"
          >
             <div className="flex items-center gap-1.5 text-xs font-bold text-orange-600">
                <Sparkles size={14} /> {profile.points || 0} Pts
             </div>
             <div className="w-px h-3 bg-orange-200" />
             <div className="text-xs font-bold text-orange-600">
                ₹{profile.walletBalance || 0}
             </div>
          </button>
        )}

        {user ? (
          <div className="flex items-center gap-3">
             <button 
               onClick={() => logout()}
               className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors hidden xl:block"
             >
               Sign Out
             </button>
             <button 
               onClick={() => setIsProfileOpen(true)}
               className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold ring-2 ring-orange-500 ring-offset-2 hover:scale-110 transition-transform"
             >
               {user.email?.[0].toUpperCase() || user.phoneNumber?.slice(-2)}
             </button>
          </div>
        ) : (
          <Link 
            to="/login"
            className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-orange-500 transition-colors"
          >
            Sign In
          </Link>
        )}

        <button className="relative p-2 text-gray-500 hover:text-orange-500 transition-colors">
          <ShoppingCart size={22} />
          <span className="absolute top-0 right-0 w-4 h-4 bg-orange-500 text-white text-[10px] flex items-center justify-center rounded-full">0</span>
        </button>
        
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-gray-500"
        >
          {isOpen ? <X /> : <MenuIcon />}
        </button>
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {isProfileOpen && user && profile && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[40px] shadow-2xl p-8 overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4">
                <button onClick={() => setIsProfileOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gray-900 text-white rounded-3xl flex items-center justify-center text-3xl font-black mx-auto mb-4 shadow-xl shadow-gray-900/20">
                  {user.email?.[0].toUpperCase()}
                </div>
                <h3 className="text-xl font-bold">{profile.isAdmin ? "Merchant Account" : "Student Account"}</h3>
                <p className="text-gray-500 text-sm">{user.email}</p>
              </div>

              <div className="space-y-4">
                <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-orange-400 mb-1">Munch Balance</p>
                    <p className="text-2xl font-black text-orange-600">₹{profile.walletBalance || 0}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-orange-400 mb-1">Crave Points</p>
                    <p className="text-2xl font-black text-orange-600">{profile.points || 0}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-500">Unique Code</span>
                    <span className="text-xs font-mono font-bold bg-white px-2 py-1 rounded-lg border border-gray-100">
                      {profile.merchantCode || profile.uid.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                  {profile.isAdmin && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-500">GST Number</span>
                      <span className="text-xs font-bold">{profile.gstNumber || "N/A"}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-500">Role</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                      profile.isAdmin ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                    )}>
                      {profile.isAdmin ? "Merchant" : "Student"}
                    </span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => { logout(); setIsProfileOpen(false); }}
                className="w-full mt-8 py-4 bg-gray-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-colors shadow-xl shadow-gray-900/10"
              >
                Sign Out
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-0 right-0 bg-white border-b border-gray-100 p-4 flex flex-col gap-4 shadow-xl md:hidden"
          >
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg text-base font-medium transition-colors",
                  location.pathname === item.path ? "bg-orange-50 text-orange-600" : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <item.icon size={20} />
                {item.name}
              </Link>
            ))}
            {user && (
               <button 
               onClick={() => { logout(); setIsOpen(false); }}
               className="flex items-center gap-3 p-3 rounded-lg text-base font-medium text-red-500 hover:bg-red-50"
             >
               <X size={20} />
               Sign Out
             </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-white font-sans text-gray-900">
          <Navbar />
          <main className="pt-16 max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/menu" element={<StorefrontPage />} />
              <Route path="/booking" element={<BookingPage />} />
              <Route path="/queue" element={<QueuePage />} />
              <Route path="/ai" element={<CraveAI />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </main>
          
          {/* Simple Footer */}
          <footer className="mt-20 border-t border-gray-100 py-12 px-8">
            <div className="flex flex-col md:flex-row justify-between gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <UtensilsCrossed className="text-orange-500" />
                  <span className="font-bold text-xl tracking-tight">MunchMate</span>
                </div>
                <p className="text-gray-500 max-w-xs text-sm">
                  The ultimate e-canteen solution balancing study and food at Parul University Goa.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
                <div>
                  <h4 className="font-bold text-sm mb-4 uppercase tracking-widest">Platform</h4>
                  <ul className="space-y-2 text-sm text-gray-500">
                    <li><Link to="/menu" className="hover:text-orange-500">Menu</Link></li>
                    <li><Link to="/booking" className="hover:text-orange-500">Seat Booking</Link></li>
                    <li><Link to="/queue" className="hover:text-orange-500">Queue Tracker</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-sm mb-4 uppercase tracking-widest">Support</h4>
                  <ul className="space-y-2 text-sm text-gray-500">
                    <li><a href="#" className="hover:text-orange-500">Help Center</a></li>
                    <li><a href="#" className="hover:text-orange-500">Feedback</a></li>
                    <li><a href="#" className="hover:text-orange-500">Contact Us</a></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-gray-50 text-center text-xs text-gray-400">
              © 2024 MunchMate PU Goa. Dedicated to the Goa Hackathon.
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}
