
import React, { useState } from 'react';
import { Clock, User, Mail, MapPin, Calendar, Phone, Lock, GraduationCap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { HomeData } from '../types';

interface AdmissionProps {
  onSubmit: (data: any) => void;
  homeData: HomeData;
}

const Admission: React.FC<AdmissionProps> = ({ onSubmit, homeData }) => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    dob: '',
    sscRoll: '',
    sscReg: '',
    ownPhone: '',
    guardianPhone: '',
    class: 'HSC 1st Year',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full p-6 md:p-12 text-center glass-card rounded-3xl md:rounded-[48px] border-white/5 space-y-4 md:space-y-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-blue-500"></div>
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 animate-pulse">
              <Clock size={64} />
            </div>
          </div>
          <h2 className="text-3xl font-bold uppercase tracking-tight">Registration Successful!</h2>
          <p className="text-slate-400 font-medium leading-relaxed">
            Your account has been created and is currently <b className="text-orange-500">pending verification</b> by our admin team. You can log in once approved using your email and password.
          </p>
          <button 
            onClick={() => setSubmitted(false)}
            className="w-full py-5 bg-white text-black rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-orange-500 hover:text-white transition-all active:scale-95"
          >
            Return to Form
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[120px] -z-10"></div>

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-5 gap-16 items-start">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-10"
          >
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500">Admission Open</span>
              </div>
              <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tighter uppercase leading-[0.9] break-words">Start Your Journey</h1>
              <p className="text-xl text-slate-400 font-medium leading-relaxed">Join Phoenix Edu Care and transform your academic career. Fill out the form to secure your seat in the next-gen learning platform.</p>
            </div>

            <div className="space-y-6">
              {[
                { step: 1, text: 'Register your detailed information' },
                { step: 2, text: 'Wait for Admin Verification' },
                { step: 3, text: 'Login to access Dashboard' }
              ].map((item, i) => (
                <div key={i} className="flex items-center space-x-6 p-6 glass-card rounded-3xl border-white/5">
                  <span className="w-12 h-12 flex items-center justify-center bg-orange-500 text-white rounded-2xl font-bold text-xl shadow-lg shadow-orange-500/20">{item.step}</span>
                  <span className="font-bold uppercase tracking-widest text-xs text-slate-300">{item.text}</span>
                </div>
              ))}
            </div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="p-5 md:p-8 glass-card rounded-3xl md:rounded-[40px] border-white/5 bg-gradient-to-br from-blue-500/5 to-transparent"
            >
              <p className="text-lg font-medium text-slate-300 italic leading-relaxed">"{homeData.testimonialText}"</p>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-8 h-px bg-blue-500"></div>
                <span className="text-xs font-bold uppercase tracking-widest text-blue-500">Student Testimonial</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.form 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleSubmit} 
            className="lg:col-span-3 glass-card p-6 sm:p-10 md:p-16 rounded-3xl sm:rounded-[60px] border-white/5 space-y-8 sm:space-y-10 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-blue-500"></div>
            
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-5 md:p-8">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 ml-4">Full Name</label>
                <input 
                  required 
                  type="text" 
                  className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 focus:border-orange-500/50 focus:bg-white/10 outline-none font-bold transition-all placeholder:text-slate-600" 
                  placeholder="STUDENT FULL NAME" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 ml-4">Email Address</label>
                <input 
                  required 
                  type="email" 
                  className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 focus:border-orange-500/50 focus:bg-white/10 outline-none font-bold transition-all placeholder:text-slate-600" 
                  placeholder="EXAMPLE@EMAIL.COM" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-5 md:p-8">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 ml-4">Date of Birth</label>
                <input 
                  required 
                  type="date" 
                  className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 focus:border-orange-500/50 focus:bg-white/10 outline-none font-bold transition-all text-slate-300" 
                  value={formData.dob}
                  onChange={e => setFormData({...formData, dob: e.target.value})}
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 ml-4">Target Class</label>
                <select 
                  className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 focus:border-orange-500/50 focus:bg-white/10 outline-none font-bold transition-all appearance-none cursor-pointer"
                  value={formData.class}
                  onChange={e => setFormData({...formData, class: e.target.value as any})}
                >
                  <option value="HSC 1st Year">HSC 1ST YEAR</option>
                  <option value="HSC 2nd Year">HSC 2ND YEAR</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 ml-4">Permanent Address</label>
              <input 
                required 
                type="text" 
                className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 focus:border-orange-500/50 focus:bg-white/10 outline-none font-bold transition-all placeholder:text-slate-600" 
                placeholder="VILLAGE/ROAD, POST, THANA, DISTRICT" 
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-5 md:p-8">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 ml-4">SSC Roll Number</label>
                <input 
                  required 
                  type="text" 
                  className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 focus:border-orange-500/50 focus:bg-white/10 outline-none font-bold transition-all placeholder:text-slate-600" 
                  placeholder="6-DIGIT ROLL" 
                  value={formData.sscRoll}
                  onChange={e => setFormData({...formData, sscRoll: e.target.value})}
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 ml-4">SSC Registration ID</label>
                <input 
                  required 
                  type="text" 
                  className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 focus:border-orange-500/50 focus:bg-white/10 outline-none font-bold transition-all placeholder:text-slate-600" 
                  placeholder="10-DIGIT REG ID" 
                  value={formData.sscReg}
                  onChange={e => setFormData({...formData, sscReg: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-5 md:p-8">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 ml-4">Own Phone Number</label>
                <input 
                  required 
                  type="tel" 
                  className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 focus:border-orange-500/50 focus:bg-white/10 outline-none font-bold transition-all placeholder:text-slate-600" 
                  placeholder="+8801..." 
                  value={formData.ownPhone}
                  onChange={e => setFormData({...formData, ownPhone: e.target.value})}
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 ml-4">Guardian Phone Number</label>
                <input 
                  required 
                  type="tel" 
                  className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 focus:border-orange-500/50 focus:bg-white/10 outline-none font-bold transition-all placeholder:text-slate-600" 
                  placeholder="+8801..." 
                  value={formData.guardianPhone}
                  onChange={e => setFormData({...formData, guardianPhone: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 ml-4">Account Password</label>
              <input 
                required 
                type="password" 
                className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:bg-white/10 outline-none font-bold transition-all placeholder:text-slate-600" 
                placeholder="MIN. 6 CHARACTERS" 
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <button 
              type="submit" 
              className="w-full py-6 bg-orange-500 hover:bg-orange-600 text-white font-bold uppercase tracking-[0.2em] text-xs rounded-3xl shadow-[0_0_30px_rgba(249,115,22,0.3)] transition-all hover:-translate-y-1 active:scale-95"
            >
              Register for Admission
            </button>
          </motion.form>
        </div>
      </div>
    </div>
  );
};

export default Admission;
