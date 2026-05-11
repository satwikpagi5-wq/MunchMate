import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { api } from "../services/api";
import { SeatSection } from "../types";
import { 
  Users, 
  Clock, 
  MapPin, 
  Armchair, 
  CheckCircle2, 
  ChevronRight,
  Coffee,
  Trees,
  AirVent
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";

export default function Booking() {
  const [sections, setSections] = useState<SeatSection[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [guests, setGuests] = useState(1);
  const [timeSlot, setTimeSlot] = useState("");
  const [isBooked, setIsBooked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSeats().then(data => {
      setSections(data.sections);
      setLoading(false);
    });
  }, []);

  const timeSlots = [
    "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", 
    "02:00 PM", "04:00 PM", "04:30 PM", "05:00 PM"
  ];

  const handleBooking = async () => {
    if (!selectedSection || !timeSlot) return;
    
    await api.bookSeat({
      sectionId: selectedSection,
      guests,
      time: timeSlot,
      userId: "test-user-123"
    });
    
    setIsBooked(true);
  };

  const getIcon = (name: string) => {
    if (name.includes("AC")) return <AirVent size={24} />;
    if (name.includes("Garden")) return <Trees size={24} />;
    if (name.includes("Balcony")) return <MapPin size={24} />;
    return <Armchair size={24} />;
  };

  if (loading) return <div className="p-20 text-center animate-pulse">Loading Canteen Layout...</div>;

  return (
    <div className="px-4 py-12 max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-black tracking-tight mb-4"
        >
          RESERVE YOUR <span className="text-orange-500">SPOT</span>.
        </motion.h1>
        <p className="text-gray-500">Choose your preferred section and skip the seating hunt.</p>
      </div>

      {!isBooked ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Section Selection */}
          <div className="space-y-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Available Sections</p>
            <div className="space-y-4">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setSelectedSection(section.id)}
                  className={cn(
                    "w-full p-6 border-2 rounded-[32px] text-left transition-all group flex items-center justify-between",
                    selectedSection === section.id 
                      ? "border-orange-500 bg-orange-50/50" 
                      : "border-gray-100 hover:border-gray-200"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                      selectedSection === section.id ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
                    )}>
                      {getIcon(section.name)}
                    </div>
                    <div>
                      <h3 className="font-bold">{section.name}</h3>
                      <p className="text-xs text-gray-500">{section.available} seats ready</p>
                    </div>
                  </div>
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                    selectedSection === section.id ? "border-orange-500 bg-orange-500" : "border-gray-200"
                  )}>
                    {selectedSection === section.id && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="bg-gray-50 p-8 rounded-[48px] border border-white">
            <div className="space-y-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Number of Guests</p>
                <div className="flex items-center gap-4">
                  {[1, 2, 3, 4, 6].map(num => (
                    <button
                      key={num}
                      onClick={() => setGuests(num)}
                      className={cn(
                        "w-12 h-12 rounded-xl font-bold transition-all",
                        guests === num ? "bg-gray-900 text-white" : "bg-white text-gray-400 border border-gray-100"
                      )}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Select Time Slot</p>
                <div className="grid grid-cols-2 gap-2">
                  {timeSlots.map(slot => (
                    <button
                      key={slot}
                      onClick={() => setTimeSlot(slot)}
                      className={cn(
                        "py-3 px-4 rounded-xl text-xs font-bold transition-all",
                        timeSlot === slot ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "bg-white text-gray-500 border border-gray-100"
                      )}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-8 mt-8 border-t border-gray-200/50">
                <button
                  disabled={!selectedSection || !timeSlot}
                  onClick={handleBooking}
                  className="w-full py-5 bg-gray-900 text-white rounded-3xl font-bold hover:bg-orange-500 transition-all shadow-xl shadow-orange-500/10 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Reservation
                  <ChevronRight size={20} />
                </button>
                <p className="text-center text-[10px] text-gray-400 mt-4 font-medium italic">
                  Note: Bookings are valid for 15 mins after the selected time.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-green-500/20">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-4xl font-black mb-4">Seat Reserved!</h2>
          <p className="text-gray-500 mb-12 max-w-sm">
            We've saved your spot in the **{sections.find(s => s.id === selectedSection)?.name}** for {guests} guests at {timeSlot}.
          </p>
          <div className="flex gap-4">
             <button onClick={() => setIsBooked(false)} className="px-8 py-4 bg-gray-100 rounded-2xl font-bold">New Booking</button>
             <Link to="/menu" className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold">Go to Menu</Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
