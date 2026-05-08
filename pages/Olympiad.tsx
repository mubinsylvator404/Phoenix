
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Target, 
  Zap, 
  Calendar, 
  Users, 
  Video, 
  FileText, 
  Download, 
  ExternalLink, 
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronRight, 
  Award,
  Play,
  Github as Youtube,
  FileDown,
  Clock,
  ArrowRight,
  GraduationCap,
  Microscope,
  Stethoscope,
  PenTool,
  X
} from 'lucide-react';
import { UserRole, OlympiadEvent, OlympiadSpeaker, OlympiadResource, OlympiadVideo } from '../types';

interface OlympiadProps {
  role: UserRole;
  currentUser: any;
  logoImage: string;
  navigate: (p: string) => void;
}

const RESOURCE_TYPES = [
  'Question Paper', 'Solution', 'Result', 'Merit List', 'Event Details'
];

const Olympiad: React.FC<OlympiadProps> = ({ role, currentUser, logoImage, navigate }) => {
  const isAdmin = role === UserRole.ADMIN;
  const [events, setEvents] = useState<OlympiadEvent[]>([]); 
  const [selectedEvent, setSelectedEvent] = useState<OlympiadEvent | null>(null);
  const [speakers, setSpeakers] = useState<OlympiadSpeaker[]>([]);
  const [resources, setResources] = useState<OlympiadResource[]>([]);
  const [videos, setVideos] = useState<OlympiadVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'materials' | 'results' | 'videos'>('details');
  const [searchQuery, setSearchQuery] = useState('');

  // Customization State (for Hero)
  const [olympiadTitle, setOlympiadTitle] = useState('Phoenix Supreme Olympiad');
  const [olympiadDesc, setOlympiadDesc] = useState('Inspiring Future Scientists, Engineers & Medical Leaders. Join the elite league of academic champions.');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [isSavingHero, setIsSavingHero] = useState(false);

  // Admin Form States
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminMode, setAdminMode] = useState<'event' | 'speaker' | 'resource' | 'video'>('event');
  const [editingItem, setEditingItem] = useState<any>(null);

  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/olympiad/settings');
      if (res.ok) {
        const result = await res.json();
        const data = result.data || result;
        if (data.hero_title) setOlympiadTitle(data.hero_title);
        if (data.hero_description) setOlympiadDesc(data.hero_description);
      }
    } catch (err) {
      console.error("Failed to fetch olympiad settings:", err);
    }
  };

  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncDatabase = async () => {
    setIsSyncing(true);
    try {
      const resp = await fetch('/api/health/sync-schema-olympiad', { method: 'POST' });
      const data = await resp.json();
      if (data.success) {
        alert("Database schema synced successfully! Please refresh the page if you still see errors.");
      } else {
        throw new Error(data.error || "Sync failed");
      }
    } catch (err: any) {
      console.error("Database sync failed:", err);
      alert("Failed to sync database: " + (err.message || String(err)));
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveHeroSettings = async () => {
    setIsSavingHero(true);
    try {
      const resp = await fetch('/api/olympiad/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hero_title: olympiadTitle,
          hero_description: olympiadDesc
        })
      });
      const data = await resp.json();
      if (!data.success) throw new Error(data.error || "Failed to save settings");
      setShowConfigModal(false);
    } catch (err) {
      console.error("Save hero settings failed:", err);
      alert("Failed to save hero settings. Please check your connection.");
    } finally {
      setIsSavingHero(false);
    }
  };

  useEffect(() => {
    if (selectedEvent) {
      fetchEventDetails(selectedEvent.id);
    }
  }, [selectedEvent]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/olympiad/events');
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `API failure: ${res.status}`);
      }
      const result = await res.json();
      const items = Array.isArray(result) ? result : (result.data || []);
      
      if (Array.isArray(items)) {
        setEvents(items);
        // Auto-select first event if none selected
        if (items.length > 0 && !selectedEvent) {
          setSelectedEvent(items[0]);
        }
      }
      setLoadError(null);
    } catch (err: any) {
      console.error("Failed to fetch events:", err);
      setLoadError(err.message || "Connection failed");
    } finally {
      setLoading(false);
    }
  };

  const fetchEventDetails = async (id: string) => {
    // Reset lists to prevent showing data from previous event
    setSpeakers([]);
    setResources([]);
    setVideos([]);
    
    // If it's a dummy event ID, don't try to fetch details from real API
    if (!id || id.startsWith('e')) return;
    
    try {
      const [sRes, rRes, vRes] = await Promise.all([
        fetch(`/api/olympiad/speakers?olympiad_id=${id}`),
        fetch(`/api/olympiad/resources?olympiad_id=${id}`),
        fetch(`/api/olympiad/videos?olympiad_id=${id}`)
      ]);
      
      const sResult = await sRes.json();
      const rResult = await rRes.json();
      const vResult = await vRes.json();
      
      const sData = sResult.data || sResult;
      const rData = rResult.data || rResult;
      const vData = vResult.data || vResult;
      
      setSpeakers(Array.isArray(sData) ? sData : []);
      setResources(Array.isArray(rData) ? rData : []);
      setVideos(Array.isArray(vData) ? vData : []);
    } catch (err) {
      console.error("Failed to fetch event details:", err);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this event and all its data?")) return;
    
    // If it's dummy data, just remove from local state
    if (String(id).startsWith('e')) {
      const updatedEvents = events.filter(e => e.id !== id);
      setEvents(updatedEvents);
      if (selectedEvent?.id === id) setSelectedEvent(updatedEvents[0] || null);
      return;
    }

    try {
      const res = await fetch(`/api/olympiad/events?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Delete failed");
      
      const updatedEvents = events.filter(e => e.id !== id);
      setEvents(updatedEvents);
      if (selectedEvent?.id === id) setSelectedEvent(updatedEvents[0] || null);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed. See console for details.");
    }
  };

  const handleDeleteSpeaker = async (id: string) => {
    if (!window.confirm("Delete this speaker?")) return;
    
    try {
      // Optimistic local update
      setSpeakers(prev => prev.filter(s => s.id !== id));
      
      if (!String(id).includes('_s') && !String(id).startsWith('temp-')) {
        const res = await fetch(`/api/olympiad/speakers?id=${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error("Delete failed");
      }
      
      if (selectedEvent && !selectedEvent.id.startsWith('e')) {
        fetchEventDetails(selectedEvent.id);
      }
    } catch (err) {
      console.error("Delete speaker failed:", err);
      alert("Delete failed. Please retry.");
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!window.confirm("Delete this resource?")) return;
    
    try {
      // Optimistic local update
      setResources(prev => prev.filter(r => r.id !== id));
      
      if (!String(id).includes('_r') && !String(id).startsWith('temp-')) {
        const res = await fetch(`/api/olympiad/resources?id=${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error("Delete failed");
      }
      
      if (selectedEvent && !selectedEvent.id.startsWith('e')) {
        fetchEventDetails(selectedEvent.id);
      }
    } catch (err) {
      console.error("Delete resource failed:", err);
      alert("Delete failed. Please retry.");
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!window.confirm("Delete this video?")) return;
    
    try {
      // Optimistic local update
      setVideos(prev => prev.filter(v => v.id !== id));

      if (!String(id).includes('_v') && !String(id).startsWith('temp-')) {
        const res = await fetch(`/api/olympiad/videos?id=${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error("Delete failed");
      }

      if (selectedEvent && !selectedEvent.id.startsWith('e')) {
        fetchEventDetails(selectedEvent.id);
      }
    } catch (err) {
      console.error("Delete video failed:", err);
      alert("Delete failed. Please retry.");
    }
  };

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         e.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const filteredSpeakers = speakers.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.university?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.topics?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredResources = resources.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVideos = videos.filter(v => 
    v.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Components
  const HeroSection = () => (
    <div className="relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-20">
      {isAdmin && (
        <button 
          onClick={() => setShowConfigModal(true)}
          className="absolute top-24 right-6 z-20 p-4 bg-orange-500 text-white rounded-2xl hover:bg-orange-600 shadow-xl flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
        >
          <Edit2 size={16} /> Edit Hero
        </button>
      )}
      <div className="absolute inset-0 bg-[#0A0A0A]">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-500/10 blur-[120px] rounded-full animate-pulse" />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-black uppercase tracking-[0.3em]"
        >
          <Award size={14} />
          Phoenix Excellence Program
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase leading-none"
        >
          {olympiadTitle.split(' ').slice(0, -2).join(' ')} <br />
          <span className="text-orange-500 drop-shadow-[0_0_30px_rgba(249,115,22,0.3)]">
            {olympiadTitle.split(' ').slice(-2).join(' ')}
          </span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-2xl text-slate-400 font-medium tracking-tight max-w-2xl mx-auto"
        >
          {olympiadDesc}
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 pt-4"
        >
          <button 
            className="px-10 py-5 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-orange-600 transition-all shadow-[0_10px_40px_rgba(249,115,22,0.3)] hover:-translate-y-1 active:scale-95"
          >
            Register Now
          </button>
          <button 
            onClick={() => document.getElementById('events-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-10 py-5 bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white/10 transition-all hover:-translate-y-1 active:scale-95"
          >
            Explore Events
          </button>
        </motion.div>
      </div>
    </div>
  );

  const EventsList = () => (
    <section id="events-section" className="py-24 px-6 max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-4 w-full md:w-auto">
          <div className="flex items-center gap-4">
            <h2 className="text-4xl font-black text-white tracking-tight uppercase">Wisdom Events</h2>
            {isAdmin && (
              <button 
                onClick={() => { setAdminMode('event'); setEditingItem(null); setShowAdminModal(true); }}
                className="p-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-all shadow-lg"
              >
                <Plus size={20} />
              </button>
            )}
          </div>
        </div>

        <div className="relative w-full md:w-80 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-orange-500 transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-bold text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all placeholder:text-slate-600"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredEvents.map((event, idx) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group relative bg-white/5 backdrop-blur-xl rounded-[40px] border border-white/10 overflow-hidden hover:border-orange-500/50 transition-all"
          >
            <div className="aspect-video relative overflow-hidden">
              <img 
                src={event.banner_image || 'https://images.unsplash.com/photo-1544391496-1ca7c97457cd?auto=format&fit=crop&q=80'} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                alt={event.title} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
              <div className="absolute top-4 right-4 flex gap-2">
                {isAdmin && (
                  <>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setAdminMode('event'); setEditingItem(event); setShowAdminModal(true); }}
                      className="p-2 bg-white/20 backdrop-blur-md text-white rounded-lg hover:bg-white/40 transition-all"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event.id); }}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
                <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  event.status === 'Running' ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]' :
                  event.status === 'Upcoming' ? 'bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]' :
                  'bg-slate-700 text-slate-300'
                }`}>
                  {event.status}
                </span>
              </div>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white leading-tight uppercase line-clamp-2">{event.title}</h3>
                <p className="text-sm text-slate-500 line-clamp-2">{event.description}</p>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar size={14} />
                  <span className="text-xs font-bold">{new Date(event.date).toLocaleDateString()}</span>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  {event.registration_url && (
                    <a 
                      href={event.registration_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-green-500/10 text-green-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all whitespace-nowrap"
                    >
                      Register
                    </a>
                  )}
                  {event.external_link && (
                    <a 
                      href={event.external_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-500/10 text-blue-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all flex items-center gap-1 whitespace-nowrap"
                    >
                      Info <ExternalLink size={10} />
                    </a>
                  )}
                  <button 
                    onClick={() => { setSelectedEvent(event); setActiveTab('details'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="p-4 bg-orange-500 text-white rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
                  >
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );

  const EventDetailView = () => {
    if (!selectedEvent) return null;
    
    return (
      <div className="min-h-screen bg-[#0A0A0A] pt-20">
        {/* Back Navigation */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <button 
            onClick={() => setSelectedEvent(null)}
            className="flex items-center gap-2 text-slate-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest"
          >
            <X size={16} />
            Back to Olympiad
          </button>
        </div>

        {/* Event Hero */}
        <div className="relative h-[400px] overflow-hidden">
          <img src={selectedEvent.banner_image} className="w-full h-full object-cover opacity-50" alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent" />
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-7xl px-6 text-center space-y-4">
            {isAdmin && (
              <div className="flex justify-center gap-3 mb-6">
                <button 
                  onClick={() => { setAdminMode('event'); setEditingItem(selectedEvent); setShowAdminModal(true); }}
                  className="px-6 py-3 bg-white/20 backdrop-blur-md text-white rounded-xl hover:bg-white/40 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-white/10"
                >
                  <Edit2 size={14} /> Edit Event Header
                </button>
                <button 
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                  className="px-6 py-3 bg-red-500/20 backdrop-blur-md text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-red-500/10"
                >
                  <Trash2 size={14} /> Delete Event
                </button>
              </div>
            )}
            <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">{selectedEvent.title}</h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm leading-relaxed">{selectedEvent.description}</p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              {selectedEvent.registration_url && (
                <a 
                  href={selectedEvent.registration_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-orange-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
                >
                  Register Now
                </a>
              )}
              {selectedEvent.external_link && (
                <a 
                  href={selectedEvent.external_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  Event Details <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="sticky top-20 z-30 bg-[#0A0A0A]/80 backdrop-blur-3xl border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-center gap-8 md:gap-16 py-6">
            {[
              { id: 'details', label: 'Overview', icon: Target },
              { id: 'materials', label: 'Materials', icon: FileText },
              { id: 'results', label: 'Results', icon: Trophy },
              { id: 'videos', label: 'Sessions', icon: Video },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] transition-all relative ${
                  activeTab === tab.id ? 'text-orange-500' : 'text-slate-500 hover:text-white'
                }`}
              >
                <tab.icon size={16} />
                <span className="hidden md:inline">{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div layoutId="tab-underline" className="absolute -bottom-[21px] left-0 w-full h-0.5 bg-orange-500" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          {activeTab === 'details' && (
            <div className="space-y-24">
              {/* Speakers */}
              <div className="space-y-12">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-black text-white uppercase tracking-tight">Keynote Speakers</h2>
                  {isAdmin && (
                    <button 
                      onClick={() => { setAdminMode('speaker'); setEditingItem({ olympiad_id: selectedEvent.id }); setShowAdminModal(true); }}
                      className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all"
                    >
                      <Plus size={16} /> Add Speaker
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {(filteredSpeakers.length > 0 ? filteredSpeakers : (searchQuery ? [] : speakers)).map((speaker, idx) => (
                    <motion.div
                      key={speaker.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white/5 backdrop-blur-xl rounded-[32px] border border-white/10 p-8 space-y-6 group hover:border-orange-500/30 transition-all relative"
                    >
                      {isAdmin && (
                        <div className="absolute top-6 right-6 flex gap-2 z-10">
                          <button 
                            onClick={() => { setAdminMode('speaker'); setEditingItem(speaker); setShowAdminModal(true); }}
                            className="p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteSpeaker(speaker.id)}
                            className="p-3 bg-red-500/20 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-lg"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                      <div className="relative">
                        <div className="aspect-square rounded-2xl overflow-hidden mb-6 bg-slate-800">
                          <img src={speaker.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={speaker.name} />
                        </div>
                        <div className="absolute -bottom-4 right-4 w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-xl">
                          <GraduationCap size={20} />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <h3 className="text-xl font-black text-white uppercase">{speaker.name}</h3>
                          <p className="text-orange-500 text-[10px] font-black uppercase tracking-widest">{speaker.university}</p>
                          <p className="text-slate-500 text-xs font-bold italic">{speaker.department}</p>
                        </div>
                        <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">{speaker.bio}</p>
                        <div className="pt-4 border-t border-white/5 space-y-2">
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Speaking On:</p>
                          <div className="flex flex-wrap gap-2">
                            {speaker.topics?.map(topic => (
                              <span key={topic} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] text-slate-300">
                                {topic}
                              </span>
                            ))}
                            {speaker.external_link && (
                              <a 
                                href={speaker.external_link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-lg text-[10px] text-orange-500 hover:bg-orange-500 hover:text-white transition-all flex items-center gap-1"
                              >
                                PROFILE <ExternalLink size={10} />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'materials' && (
            <div className="space-y-12">
               <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-white uppercase tracking-tight">Academic Resources</h2>
                {isAdmin && (
                  <button 
                    onClick={() => { setAdminMode('resource'); setEditingItem({ olympiad_id: selectedEvent.id }); setShowAdminModal(true); }}
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all"
                  >
                    <Plus size={16} /> Add Resource
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {(filteredResources.length > 0 ? filteredResources : resources).filter(r => r.type !== 'Result' && r.type !== 'Merit List').map((resource, idx) => (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group bg-white/5 backdrop-blur-xl p-6 rounded-[24px] border border-white/10 hover:border-blue-500/50 transition-all relative"
                  >
                    {isAdmin && (
                      <div className="absolute top-4 right-4 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setAdminMode('resource'); setEditingItem(resource); setShowAdminModal(true); }}
                          className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button 
                          onClick={() => handleDeleteResource(resource.id)}
                          className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                    <div className="w-full flex justify-between items-start mb-6">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                        {resource.type === 'Question Paper' ? <FileText size={20} /> : <Zap size={20} />}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white leading-tight uppercase">{resource.title}</h4>
                      </div>
                      <a 
                        href={resource.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-between w-full p-2 text-xs font-black uppercase text-blue-500 hover:text-white transition-colors"
                      >
                        Download PDF <FileDown size={14} />
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'results' && (
            <div className="space-y-12">
               <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-white uppercase tracking-tight">Event Results</h2>
                {isAdmin && (
                  <button 
                    onClick={() => { setAdminMode('resource'); setEditingItem({ olympiad_id: selectedEvent.id, type: 'Result' }); setShowAdminModal(true); }}
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all"
                  >
                    <Plus size={16} /> Post Result
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {(filteredResources.length > 0 ? filteredResources : (searchQuery ? [] : resources)).filter(r => r.type === 'Result' || r.type === 'Merit List').length === 0 ? (
                  <div className="col-span-full py-20 bg-white/5 rounded-[40px] border border-white/10 border-dashed text-center">
                    <Trophy className="mx-auto text-slate-700 mb-4" size={48} />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">{searchQuery ? 'No results match your search' : 'Results will be announced soon'}</p>
                  </div>
                ) : (
                  (filteredResources.length > 0 ? filteredResources : resources).filter(r => r.type === 'Result' || r.type === 'Merit List').map((result, idx) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group bg-gradient-to-br from-green-500/10 to-transparent p-8 rounded-[32px] border border-green-500/20 flex items-center justify-between gap-6 relative overflow-hidden"
                    >
                      {isAdmin && (
                        <div className="absolute top-4 right-4 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => { setAdminMode('resource'); setEditingItem(result); setShowAdminModal(true); }}
                            className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button 
                            onClick={() => handleDeleteResource(result.id)}
                            className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center text-green-500">
                          <Trophy size={32} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">{result.type}</p>
                          <h4 className="text-xl font-black text-white uppercase">{result.title}</h4>
                        </div>
                      </div>
                      <a 
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-4 bg-green-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-green-600 transition-all flex items-center gap-2"
                      >
                        <Download size={14} />
                        Download
                      </a>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="space-y-12">
               <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-white uppercase tracking-tight">Session Recordings</h2>
                {isAdmin && (
                  <button 
                    onClick={() => { setAdminMode('video'); setEditingItem({ olympiad_id: selectedEvent.id }); setShowAdminModal(true); }}
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all"
                  >
                    <Plus size={16} /> Add Video
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {(filteredVideos.length > 0 ? filteredVideos : (searchQuery ? [] : videos)).map((video, idx) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6 group relative"
                  >
                    {isAdmin && (
                      <div className="absolute top-4 right-4 flex gap-1 z-20">
                        <button 
                          onClick={() => { setAdminMode('video'); setEditingItem(video); setShowAdminModal(true); }}
                          className="p-3 bg-black/60 backdrop-blur-md text-white rounded-full hover:bg-black/80"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteVideo(video.id)}
                          className="p-3 bg-red-600 space-x-2 text-white rounded-full hover:bg-red-700 shadow-xl"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                    <div className="aspect-video bg-slate-800 rounded-[32px] overflow-hidden border border-white/5 shadow-2xl relative">
                      <iframe 
                        className="w-full h-full"
                        src={getYoutubeEmbedUrl(video.youtube_url)} 
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                      />
                    </div>
                    <div className="px-4 space-y-2">
                       <h4 className="text-xl font-black text-white uppercase group-hover:text-orange-500 transition-colors">{video.title}</h4>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const getYoutubeEmbedUrl = (url: string) => {
    try {
      if (url.includes('embed/')) return url;
      const id = url.includes('v=') 
        ? url.split('v=')[1].split('&')[0] 
        : url.split('/').pop()?.split('?')[0];
      return `https://www.youtube.com/embed/${id}`;
    } catch (e) {
      return url;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] selection:bg-orange-500 selection:text-white">
      {selectedEvent ? <EventDetailView /> : (
        <>
          <HeroSection />
          <EventsList />
        </>
      )}

      {/* Hero Config Modal */}
      <AnimatePresence>
        {showConfigModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-white/10 p-10 rounded-[40px] w-full max-w-xl space-y-8"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Olympiad Hero Settings</h3>
                <button onClick={() => setShowConfigModal(false)} className="p-3 text-slate-400 hover:text-white"><X size={24} /></button>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Header Title</label>
                  <input 
                    value={olympiadTitle} 
                    onChange={e => setOlympiadTitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Description Text</label>
                  <textarea 
                    value={olympiadDesc} 
                    onChange={e => setOlympiadDesc(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold h-32" 
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleSyncDatabase}
                    disabled={isSyncing}
                    className="flex-1 py-5 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all disabled:opacity-50"
                  >
                    {isSyncing ? 'Syncing...' : 'Sync DB'}
                  </button>
                  <button 
                    onClick={handleSaveHeroSettings}
                    disabled={isSavingHero}
                    className={`flex-[2] py-5 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all ${isSavingHero ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-600 active:scale-95'}`}
                  >
                    {isSavingHero ? 'Saving...' : 'Apply & Save Changes'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Management Modal */}
      <AnimatePresence>
        {showAdminModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto pt-24 pb-12">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-white/10 p-8 rounded-[40px] w-full max-w-2xl shadow-2xl space-y-8"
            >
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                   <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                    {editingItem?.id ? 'Edit' : 'Create'} {adminMode.charAt(0).toUpperCase() + adminMode.slice(1)}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Olympiad Management Console</p>
                </div>
                <button onClick={() => setShowAdminModal(false)} className="p-3 bg-white/5 text-slate-400 hover:text-white rounded-full">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data: any = Object.fromEntries(formData.entries());
                
                // Clean up empty strings to null or appropriate defaults
                Object.keys(data).forEach(key => {
                  if (data[key] === '') data[key] = null;
                });
                
                // Handle complex fields
                if (data.topics && typeof data.topics === 'string') {
                  data.topics = data.topics.split(',').map((t: string) => t.trim()).filter(Boolean);
                } else if (!data.topics && adminMode === 'speaker') {
                  data.topics = [];
                }
                // Only pass ID if it's not a dummy ID and we are editing
                if (editingItem?.id && !editingItem.id.startsWith('e')) {
                  data.id = editingItem.id;
                }
                
                if (editingItem?.olympiad_id && adminMode !== 'event') {
                  data.olympiad_id = editingItem.olympiad_id;
                }

                try {
                  const endpoint = `/api/olympiad/${adminMode}s`;
                  const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                  });
                  
                  let result;
                  const contentType = res.headers.get("content-type");
                  if (contentType && contentType.includes("application/json")) {
                    const rawResult = await res.json();
                    result = rawResult.data || rawResult;
                    if (rawResult.success === false) throw new Error(rawResult.error || "Server error");
                  } else {
                    const text = await res.text();
                    console.error("Non-JSON response from server:", text);
                    throw new Error("Server Error (Non-JSON): " + (text.substring(0, 100) || "Empty response from server"));
                  }

                  if (!res.ok) {
                    throw new Error(result.details || result.error || `Server Error (${res.status})`);
                  }
                  
                  // Reload data correctly
                  if (adminMode === 'event') {
                    // Fetch fresh list
                    const freshRes = await fetch('/api/olympiad/events');
                    const freshResult = await freshRes.json();
                    const freshEvents = freshResult.data || freshResult;
                    setEvents(Array.isArray(freshEvents) ? freshEvents : []);
                    
                    // If we just edited/created an event, ensure it's selected or updated
                    if (editingItem?.id) {
                      // Update selected event if it's the one we just edited
                      if (selectedEvent?.id === editingItem.id) {
                        const updated = Array.isArray(freshEvents) ? freshEvents.find((ev: any) => ev.id === editingItem.id) : null;
                        if (updated) setSelectedEvent(updated);
                      }
                    } else if (result.id) {
                      // If it's a NEW event, maybe select it?
                      const newcomer = Array.isArray(freshEvents) ? freshEvents.find((ev: any) => ev.id === result.id) : null;
                      if (newcomer) {
                        setSelectedEvent(newcomer);
                      }
                    }
                  } else if (selectedEvent) {
                    // Update details for specific event (speakers, resources, videos)
                    await fetchEventDetails(selectedEvent.id);
                  }
                  
                  setShowAdminModal(false);
                  setEditingItem(null);
                } catch (err: any) {
                  console.error("Save Error:", err);
                  alert("Save Failed: " + err.message);
                }
              }} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                
                {adminMode === 'event' && (
                  <>
                    <div className="md:col-span-2 space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Event Title</label>
                       <input name="title" defaultValue={editingItem?.title} required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Description</label>
                       <textarea name="description" defaultValue={editingItem?.description} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold h-24" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Date</label>
                      <input type="date" name="date" defaultValue={editingItem?.date} required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Banner URL</label>
                       <input name="banner_image" defaultValue={editingItem?.banner_image} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" placeholder="https://..." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Registration URL (Google Form)</label>
                      <input name="registration_url" defaultValue={editingItem?.registration_url} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" placeholder="https://forms.gle/..." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">External Info Link</label>
                      <input name="external_link" defaultValue={editingItem?.external_link} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" placeholder="https://..." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Status</label>
                      <select name="status" defaultValue={editingItem?.status} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold">
                        <option value="Upcoming">Upcoming</option>
                        <option value="Running">Running</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </>
                )}

                {adminMode === 'speaker' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Speaker Name</label>
                      <input name="name" defaultValue={editingItem?.name} required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">University</label>
                      <input name="university" defaultValue={editingItem?.university} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Department</label>
                      <input name="department" defaultValue={editingItem?.department} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Image URL</label>
                      <input name="image" defaultValue={editingItem?.image} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" placeholder="https://..." />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">External Profile Link (LinkedIn/ResearchGate)</label>
                      <input name="external_link" defaultValue={editingItem?.external_link} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" placeholder="https://..." />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Topics (comma separated)</label>
                      <input name="topics" defaultValue={editingItem?.topics?.join(', ')} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" placeholder="AI in Medicine, Robotics, ..." />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Short Bio</label>
                      <textarea name="bio" defaultValue={editingItem?.bio} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold h-24" />
                    </div>
                  </>
                )}

                {adminMode === 'resource' && (
                  <>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Resource Title</label>
                      <input name="title" defaultValue={editingItem?.title} required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Type</label>
                       <select name="type" defaultValue={editingItem?.type} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold">
                         {RESOURCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                       </select>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">File URL / Drive Link</label>
                      <input name="url" defaultValue={editingItem?.url} required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" />
                    </div>
                  </>
                )}

                {adminMode === 'video' && (
                  <>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Video Title</label>
                      <input name="title" defaultValue={editingItem?.title} required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">YouTube URL</label>
                      <input name="youtube_url" defaultValue={editingItem?.youtube_url} required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" placeholder="https://youtube.com/watch?v=..." />
                    </div>
                  </>
                )}

                <div className="md:col-span-2 pt-6">
                  <button type="submit" className="w-full py-5 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest transform transition-all active:scale-95 shadow-xl shadow-orange-500/20">
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Olympiad;
