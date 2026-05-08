
import React from 'react';
import { MapPin, Phone, Mail, Send, Facebook, Youtube, Instagram, Twitter } from 'lucide-react';
import { motion } from 'framer-motion';
import { FooterData } from '../types';

interface ContactProps {
  footerData: FooterData;
}

const Contact: React.FC<ContactProps> = ({ footerData }) => {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[120px] -z-10"></div>

      <div className="max-w-7xl mx-auto space-y-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-500">Contact Us</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tighter uppercase leading-[0.9] break-words">Get In Touch</h1>
          <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
            Have questions? We're here to help. Reach out to our team for any inquiries regarding admissions, courses, or technical support.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-4 md:gap-6 md:p-12">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-4 md:space-y-8"
          >
            <div className="p-6 sm:p-10 glass-card rounded-2xl sm:rounded-[48px] border-white/5 space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-16 h-16 rounded-3xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <MapPin size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold uppercase tracking-tight">Our Campus</h3>
                <p className="text-slate-400 font-medium leading-relaxed">{footerData.address}</p>
              </div>
            </div>

            <div className="p-6 sm:p-10 glass-card rounded-2xl sm:rounded-[48px] border-white/5 space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-16 h-16 rounded-3xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                <Phone size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold uppercase tracking-tight">Direct Contact</h3>
                <p className="text-slate-400 font-medium leading-relaxed">
                  {footerData.phone}<br/>
                  <span className="text-orange-500">{footerData.email}</span>
                </p>
              </div>
            </div>

            {/* Social Media Section */}
            <div className="p-6 sm:p-10 glass-card rounded-2xl sm:rounded-[48px] border-white/5 space-y-8 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold uppercase tracking-tight">Connect With Us</h3>
                <p className="text-slate-400 text-sm font-medium">Follow us on social media for updates and resources.</p>
              </div>
              <div className="flex items-center gap-4">
                {footerData.facebook && (
                  <a href={footerData.facebook} target="_blank" rel="noopener noreferrer" className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all duration-300 group/icon">
                    <svg className="w-6 h-6 fill-current group-hover/icon:scale-110 transition-transform" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}
                {footerData.youtube && (
                  <a href={footerData.youtube} target="_blank" rel="noopener noreferrer" className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 hover:bg-red-600 hover:text-white transition-all duration-300 group/icon">
                    <svg className="w-6 h-6 fill-current group-hover/icon:scale-110 transition-transform" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                )}
                {footerData.linkedin && (
                  <a href={footerData.linkedin} target="_blank" rel="noopener noreferrer" className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 hover:bg-blue-700 hover:text-white transition-all duration-300 group/icon">
                    <svg className="w-6 h-6 fill-current group-hover/icon:scale-110 transition-transform" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6 md:space-y-12"
          >
            <form className="glass-card p-6 sm:p-10 md:p-16 rounded-3xl sm:rounded-[60px] border-white/5 grid md:grid-cols-2 gap-5 md:p-8 relative overflow-hidden">
              
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 ml-4">Your Name</label>
                <input 
                  type="text" 
                  className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:bg-white/10 outline-none font-bold transition-all placeholder:text-slate-600" 
                  placeholder="FULL NAME" 
                />
              </div>
              
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 ml-4">Email Address</label>
                <input 
                  type="email" 
                  className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:bg-white/10 outline-none font-bold transition-all placeholder:text-slate-600" 
                  placeholder="EXAMPLE@EMAIL.COM" 
                />
              </div>

              <div className="md:col-span-2 space-y-3">
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 ml-4">Message</label>
                <textarea 
                  className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:bg-white/10 outline-none font-bold transition-all placeholder:text-slate-600 min-h-[200px] resize-none" 
                  placeholder="HOW CAN WE HELP YOU?"
                ></textarea>
              </div>

              <button className="md:col-span-2 py-6 bg-blue-500 hover:bg-blue-600 text-white font-bold uppercase tracking-[0.2em] text-xs rounded-3xl shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all hover:-translate-y-1 active:scale-95">
                Send Message
              </button>
            </form>

            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="h-80 glass-card rounded-3xl sm:rounded-[60px] overflow-hidden border-white/5 relative group"
            >
              <img 
                src="https://picsum.photos/seed/kulaura/1200/600" 
                className="w-full h-full object-cover grayscale-[0.8] group-hover:grayscale-0 transition-all duration-1000" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-60"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="glass-card p-6 rounded-3xl border-white/10 backdrop-blur-xl text-center space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-500">Campus Location</span>
                  <h4 className="text-xl font-bold uppercase tracking-tight">Kulaura Branch</h4>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
