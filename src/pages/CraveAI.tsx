import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI, Type } from "@google/genai";
import { Sparkles, UtensilsCrossed, Send, BrainCircuit, RefreshCcw, Info } from "lucide-react";
import { api } from "../services/api";
import { MenuItem } from "../types";
import { cn } from "../lib/utils";

export default function CraveAI() {
  const [mood, setMood] = useState("");
  const [suggestion, setSuggestion] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const moods = [
    "I want something spicy 🌶️",
    "Light snack for coding 💻",
    "Feeling like a local Goan 🌴",
    "Something sweet and comforting 🍰",
    "Need energy for hackathon ⚡"
  ];

  const getRecommendation = async (userMood: string) => {
    setLoading(true);
    setError(null);
    try {
      const menu = await api.getMenu();
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

      const prompt = `You are "CraveAI", the smart food assistant for Parul University Goa Campus canteen. 
      The student says: "${userMood}". 
      Based on the current menu, recommend ONE best item and explain why in a fun, campus-vibe way.
      
      Current Menu: ${JSON.stringify(menu.map(m => ({ id: m.id, name: m.name, desc: m.description, category: m.category })))}
      
      Respond in JSON format:
      {
        "itemId": "the id of the item",
        "reason": "a short fun explanation",
        "funFact": "a fun fact about the dish or a campus tip"
      }`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              itemId: { type: Type.STRING },
              reason: { type: Type.STRING },
              funFact: { type: Type.STRING }
            },
            required: ["itemId", "reason", "funFact"]
          }
        }
      });

      const data = JSON.parse(response.text.trim());
      const recommendedItem = menu.find(m => m.id === data.itemId);

      setSuggestion({
        item: recommendedItem,
        reason: data.reason,
        funFact: data.funFact
      });
    } catch (err) {
      console.error(err);
      setError("AI is currently full! Please check the menu directly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-12 max-w-4xl mx-auto text-gray-900 dark:text-white">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 rounded-full text-xs font-black uppercase tracking-widest mb-6">
          <Sparkles size={16} /> Powered by Gemini
        </div>
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-6xl font-black tracking-tight mb-4 dark:text-white"
        >
          CRAVE<span className="text-purple-600">AI</span>.
        </motion.h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">Tell us how you feel, and we'll reveal your perfect canteen match.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-1 space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 px-2">Quick Moods</p>
          {moods.map(m => (
            <button
              key={m}
              onClick={() => { setMood(m); getRecommendation(m); }}
              className="w-full p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm font-medium text-left hover:border-purple-200 dark:hover:border-purple-800 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-all group dark:text-white"
            >
              {m}
            </button>
          ))}
          
          <div className="relative mt-8">
            <input 
              type="text" 
              placeholder="Describe your craving..."
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && getRecommendation(mood)}
              className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none pr-12 text-sm dark:text-white"
            />
            <button 
              onClick={() => getRecommendation(mood)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-purple-600 text-white rounded-xl shadow-lg shadow-purple-600/20"
            >
              <Send size={18} />
            </button>
          </div>
        </div>

        <div className="md:col-span-2 min-h-[400px]">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full border-2 border-dashed border-purple-100 dark:border-purple-900/40 rounded-[48px] flex flex-col items-center justify-center p-12 text-center"
              >
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mb-6 animate-spin">
                  <BrainCircuit size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2 dark:text-white">Analyzing your cravings...</h3>
                <p className="text-gray-400 dark:text-gray-500 text-sm">Consulting with our expert AI chef at PU Goa.</p>
              </motion.div>
            ) : suggestion ? (
              <motion.div 
                key="suggestion"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[48px] overflow-hidden shadow-2xl shadow-purple-500/5"
              >
                <div className="relative h-64">
                   <img src={suggestion.item.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8">
                      <p className="text-purple-300 font-bold uppercase tracking-widest text-[10px] mb-2">AI Pick for you</p>
                      <h2 className="text-3xl font-black text-white">{suggestion.item.name}</h2>
                   </div>
                </div>
                <div className="p-8 space-y-6">
                   <div>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">The Reason</p>
                     <p className="text-gray-600 dark:text-gray-400 leading-relaxed italic">"{suggestion.reason}"</p>
                   </div>

                   <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-2xl flex gap-3">
                      <div className="text-purple-600 dark:text-purple-400 shrink-0"><Info size={20} /></div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-purple-400 mb-1">Campus Tip</p>
                        <p className="text-xs text-purple-900 dark:text-purple-300 font-medium">{suggestion.funFact}</p>
                      </div>
                   </div>

                   <div className="flex items-center justify-between pt-4">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Price</p>
                        <p className="text-2xl font-black dark:text-white">₹{suggestion.item.price}</p>
                      </div>
                      <button 
                        onClick={() => setSuggestion(null)}
                        className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-400 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                         <RefreshCcw size={20} />
                      </button>
                      <button className="px-8 py-4 bg-gray-900 dark:bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-600 dark:hover:bg-purple-700 transition-all flex items-center gap-2">
                         Order Now <UtensilsCrossed size={18} />
                      </button>
                   </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[48px] flex flex-col items-center justify-center p-12 text-center text-gray-400"
              >
                <Sparkles className="mb-6 opacity-10" size={80} />
                <h3 className="text-lg font-bold mb-2 dark:text-gray-300">Ready to explore?</h3>
                <p className="text-sm dark:text-gray-500">Select a mood or describe what you want to eat.</p>
              </motion.div>
            )}
          </AnimatePresence>
          
          {error && <p className="text-red-500 text-center mt-4 text-sm font-medium">{error}</p>}
        </div>
      </div>
    </div>
  );
}
