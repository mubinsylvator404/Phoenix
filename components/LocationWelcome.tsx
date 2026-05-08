
import React, { useState, useEffect } from 'react';
import { MapPin, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LocationWelcome: React.FC = () => {
  const [locationData, setLocationData] = useState<{ message: string; city?: string; country?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await fetch('/api/location');
        const data = await response.json();
        setLocationData(data);
      } catch (error) {
        console.error('Failed to fetch location:', error);
        setLocationData({ message: 'Welcome to Phoenix Edu Care' });
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, []);

  return (
    <div className="inline-flex items-center min-h-[40px]">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-slate-400"
          >
            <Loader2 className="w-3 h-3 animate-spin" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Detecting your location...</span>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-lg shadow-orange-500/5 group hover:border-orange-500/30 transition-all duration-300"
          >
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-500/10 text-orange-500">
              <MapPin className="w-3 h-3 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-200">
              {locationData?.message || 'Welcome to Phoenix Edu Care'}
            </span>
            <Sparkles className="w-3 h-3 text-orange-500/50" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LocationWelcome;
