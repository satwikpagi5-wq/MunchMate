import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Phone, Lock, ChevronRight, Hash, ShieldCheck, AlertCircle } from "lucide-react";
import { cn } from "../lib/utils";

export default function LoginPage() {
  const [role, setRole] = useState<"student" | "admin">("student");
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"input" | "otp">("input");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if (signInError.message.includes("Invalid login credentials")) {
          // Attempt sign up if login fails
          const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { role } // This is sent to the trigger!
            }
          });
          
          if (signUpError) {
            setError(signUpError.message);
          } else {
            navigate(role === "admin" ? "/admin" : "/");
          }
        } else {
          setError(signInError.message);
        }
      } else {
        navigate(role === "admin" ? "/admin" : "/");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });

      if (error) throw error;
      setStep("otp");
    } catch (err: any) {
      setError("Failed to send code. Make sure format is +[countrycode][number]");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: otp,
        type: 'sms'
      });

      if (error) throw error;
      navigate(role === "admin" ? "/admin" : "/");
    } catch (err: any) {
      setError("Invalid OTP code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-20 relative overflow-hidden">
      {/* Background decoration */}
      <div className={cn(
        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg aspect-square blur-[120px] rounded-full -z-10 transition-colors duration-500",
        role === "student" ? "bg-orange-100/30" : "bg-red-100/30"
      )} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white border border-gray-100 p-8 rounded-[48px] shadow-2xl shadow-black/5"
      >
        {/* Role Selector */}
        <div className="flex gap-2 mb-10 p-1 bg-gray-50 rounded-2xl">
          <button 
            onClick={() => setRole("student")}
            className={cn(
              "flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all",
              role === "student" ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "text-gray-400 hover:text-gray-600"
            )}
          >
            Student
          </button>
          <button 
            onClick={() => setRole("admin")}
            className={cn(
              "flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all",
              role === "admin" ? "bg-[#E2262E] text-white shadow-lg shadow-red-500/20" : "text-gray-400 hover:text-gray-600"
            )}
          >
            Merchant
          </button>
        </div>

        <div className="text-center mb-10">
          <div className={cn(
            "w-16 h-16 rounded-3xl mx-auto flex items-center justify-center text-white mb-6 shadow-xl transition-all duration-500",
            role === "student" ? "bg-orange-500 shadow-orange-500/20" : "bg-[#E2262E] shadow-red-500/20"
          )}>
            {role === "student" ? <Lock size={32} /> : <ShieldCheck size={32} />}
          </div>
          <h2 className="text-3xl font-black tracking-tight mb-2">
            {role === "student" ? "Munch. Study. Repeat." : "Kitchen Control"}
          </h2>
          <p className="text-gray-500 text-sm">
            {role === "student" 
              ? "Join the MunchMate community at PU Goa." 
              : "Access the Merchant Dashboard & Live Orders."}
          </p>
        </div>

        {/* Method Toggle */}
        <div className="flex p-1 bg-gray-50 rounded-2xl mb-8">
          <button 
            onClick={() => { setMethod("email"); setError(null); }}
            className={cn(
               "flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
               method === "email" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <Mail size={16} /> Email
          </button>
          <button 
            onClick={() => { setMethod("phone"); setError(null); }}
            className={cn(
               "flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
               method === "phone" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <Phone size={16} /> Phone
          </button>
        </div>

        <AnimatePresence mode="wait">
          {method === "email" ? (
            <motion.form 
              key="email-form"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleEmailAuth} 
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-4">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                    placeholder={role === "student" ? "student@parul.ac.in" : "admin@parul.ac.in"}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-4">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <button 
                disabled={loading}
                className={cn(
                  "w-full py-5 text-white rounded-3xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl",
                  role === "student" 
                    ? "bg-gray-900 hover:bg-orange-500 shadow-orange-500/10" 
                    : "bg-gray-900 hover:bg-[#E2262E] shadow-red-500/10"
                )}
              >
                {loading ? "Authenticating..." : role === "admin" ? "Enter Admin Dashboard" : "Sign in / Sign up"}
                <ChevronRight size={18} />
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="phone-form"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              {step === "input" ? (
                <form onSubmit={handlePhoneSubmit} className="space-y-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-4">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                      <input 
                        type="tel" 
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                  <button 
                    disabled={loading}
                    className={cn(
                      "w-full py-5 text-white rounded-3xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl",
                      role === "student" 
                        ? "bg-gray-900 hover:bg-orange-500 shadow-orange-500/10" 
                        : "bg-gray-900 hover:bg-[#E2262E] shadow-red-500/10"
                    )}
                  >
                    {loading ? "Sending Code..." : "Send Verification Code"}
                    <ChevronRight size={18} />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleOtpVerify} className="space-y-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-4">6-Digit Code</label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                      <input 
                        type="text" 
                        required
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none text-sm tracking-[1em] text-center font-bold"
                        placeholder="000000"
                      />
                    </div>
                  </div>
                  <button 
                    disabled={loading}
                    className={cn(
                      "w-full py-5 text-white rounded-3xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl",
                      role === "student" ? "bg-orange-500 hover:bg-orange-600" : "bg-[#E2262E] hover:bg-red-700"
                    )}
                  >
                    <ShieldCheck size={20} />
                    {loading ? "Verifying..." : "Verify OTP"}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setStep("input")}
                    className="w-full text-center text-xs text-gray-400 hover:text-gray-600 font-bold uppercase tracking-tighter"
                  >
                    Change Number
                  </button>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 p-4 bg-red-50 text-red-500 rounded-2xl flex items-start gap-3 text-xs"
          >
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <p className="font-medium leading-relaxed">{error}</p>
          </motion.div>
        )}

        <div className="mt-12 pt-8 border-t border-gray-50">
          <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest leading-relaxed">
            By signing in, you agree to the CampusCrave <br />
            <span className="text-gray-900 font-bold">Terms of Service</span> and <span className="text-gray-900 font-bold">Privacy Policy</span>.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
