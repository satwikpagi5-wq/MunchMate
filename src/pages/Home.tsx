import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { 
  UtensilsCrossed, 
  Clock, 
  Armchair, 
  Sparkles, 
  ChevronRight, 
  MapPin 
} from "lucide-react";
import { cn } from "../lib/utils";

export default function Home() {
  const features = [
    {
      title: "Digital Menu",
      desc: "Browse and order from our variety of Goan delicacies and snacks.",
      icon: UtensilsCrossed,
      link: "/menu",
      color: "bg-orange-500",
    },
    {
      title: "Live Queue",
      desc: "Track your order status in real-time. No more waiting in lines.",
      icon: Clock,
      link: "/queue",
      color: "bg-blue-500",
    },
    {
      title: "Seat Booking",
      desc: "Prebook your favorite spot for the perfect dine-in experience.",
      icon: Armchair,
      link: "/booking",
      color: "bg-green-500",
    },
    {
      title: "CraveAI",
      desc: "AI recommendations based on your cravings and campus trends.",
      icon: Sparkles,
      link: "/ai",
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="px-4 py-12 md:py-20 overflow-hidden">
      {/* Hero Section */}
      <section className="relative mb-24">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2 mb-6 px-4 py-1.5 bg-orange-50 dark:bg-orange-950/30 rounded-full text-orange-600 font-semibold text-xs uppercase tracking-widest"
          >
            <MapPin size={14} />
            Parul University Goa Campus
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] text-gray-900 dark:text-white mb-8 max-w-4xl"
          >
            FUEL YOUR <span className="text-orange-500">STUDY</span>,<br />
            FIND YOUR <span className="italic font-serif">MATE</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mb-12"
          >
            The smart e-canteen for Parul University Goa. Pre-schedule meals, skip the queue, and maintain your study streak with every bite.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-4"
          >
            <Link 
              to="/menu" 
              className="px-8 py-4 bg-gray-900 dark:bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-500 dark:hover:bg-orange-600 transition-all flex items-center gap-2 group shadow-xl shadow-orange-500/10"
            >
              Start Ordering
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/booking" 
              className="px-8 py-4 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white rounded-2xl font-bold hover:border-orange-200 transition-all"
            >
              Reserve Seat
            </Link>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl aspect-square bg-radial from-orange-50/50 to-transparent blur-3xl opacity-50" />
      </section>

      {/* Categories / Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, idx) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + idx * 0.1 }}
          >
            <Link
              to={feature.link}
              className="block p-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-2 transition-all group"
            >
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6", feature.color)}>
                <feature.icon size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 dark:text-white">{feature.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
                {feature.desc}
              </p>
              <div className="flex items-center text-orange-500 text-sm font-bold group-hover:gap-2 transition-all">
                Learn More <ChevronRight size={16} />
              </div>
            </Link>
          </motion.div>
        ))}
      </section>

      {/* Featured Meal Suggestion (Mock AI placeholder) */}
      <section className="mt-24 p-8 md:p-12 bg-gray-50 dark:bg-gray-900 rounded-[48px] flex flex-col md:flex-row items-center justify-between gap-12 border border-white dark:border-gray-800">
        <div className="max-w-md">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs uppercase tracking-widest mb-4">
            <Sparkles size={16} /> AI Suggestion
          </div>
          <h2 className="text-3xl font-bold mb-4 dark:text-white">Craving something local?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Students currently love the **Chicken Cafreal** with **Fresh Pav**. 
            It's spicing up the campus today!
          </p>
          <Link to="/ai" className="text-gray-900 dark:text-white border-b-2 border-orange-500 pb-1 font-bold text-sm tracking-tight hover:text-orange-500 transition-colors">
            Ask AI for recommendations
          </Link>
        </div>
        <div className="relative w-full max-w-sm aspect-square">
            <img 
                src="https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500&q=80" 
                alt="Chicken Cafreal" 
                className="w-full h-full object-cover rounded-[32px] shadow-2xl skew-x-2" 
            />
            <div className="absolute -bottom-6 -right-6 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex items-center gap-4">
                <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Starting at</p>
                    <p className="text-xl font-black dark:text-white">₹220</p>
                </div>
                <Link to="/menu" className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white">
                    <UtensilsCrossed size={20} />
                </Link>
            </div>
        </div>
      </section>
    </div>
  );
}
