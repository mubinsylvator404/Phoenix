
import React from 'react';
import { motion } from 'framer-motion';
import { PageContent } from '../types';
import { GraduationCap, School, BarChart3, ChevronDown, ChevronUp, Quote, Users, BookOpen, Zap } from 'lucide-react';

interface AboutProps {
  content?: PageContent;
}

const About: React.FC<AboutProps> = ({ content }) => {
  const [expandedFounder, setExpandedFounder] = React.useState<string | null>(null);
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-slate-50 dark:bg-[#0A0A0A] relative overflow-hidden transition-colors duration-500">
      {/* Premium Science Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 dark:bg-[#003566]/20 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-500/5 dark:bg-[#FFD700]/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.02] dark:opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        {/* Floating Science Icons in Background */}
        <div className="absolute top-[20%] right-[10%] opacity-5 dark:opacity-10 animate-bounce" style={{ animationDuration: '4s' }}>
          <Zap className="w-16 h-16 text-orange-500 dark:text-[#FFD700]" strokeWidth={1} />
        </div>
        <div className="absolute bottom-[20%] left-[10%] opacity-5 dark:opacity-10 animate-bounce" style={{ animationDuration: '6s', animationDelay: '1s' }}>
          <BookOpen className="w-16 h-16 text-blue-600 dark:text-[#003566]" strokeWidth={1} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 sm:space-y-6 text-center"
        >
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-extrabold text-slate-900 dark:text-white tracking-tighter uppercase">
            {content?.title || 'About Us'}
          </h1>
          <p className="text-lg sm:text-2xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-3xl mx-auto">
            {content?.subtitle || 'Igniting Academic Excellence for HSC Science Students in Kulaura since 2021.'}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-[40px] sm:rounded-[60px] p-8 sm:p-16 space-y-12 sm:space-y-20 shadow-[0_30px_100px_rgba(0,0,0,0.04)] dark:shadow-none"
        >
          {content?.content || (content?.sections && content.sections.length > 0) ? (
            <div className="space-y-12">
              {content.content && (
                <div className="space-y-4">
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                    {content.content}
                  </p>
                </div>
              )}
              
              {content.sections?.map((section, i) => (
                <div key={i} className="space-y-4">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">{section.title}</h2>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Our Mission</h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  At Phoenix Edu Care, our mission is to provide high-quality education and guidance to HSC science students, 
                  empowering them to achieve their full potential and excel in their academic journey. 
                  We believe in fostering a deep understanding of scientific concepts through innovative teaching methods 
                  and personalized attention.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Our Vision</h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  To be the leading educational institution in the region, recognized for producing the next generation 
                  of scientists, engineers, and healthcare professionals who will contribute significantly to society.
                </p>
              </div>
            </>
          )}

          {/* Our Founders Section */}
          {content?.founders && content.founders.length > 0 && (
            <div className="pt-16 border-t border-slate-200/60 dark:border-white/10 space-y-16">
              <h2 className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tighter uppercase text-center">
                Our Founders
              </h2>
              <div className="grid grid-cols-1 gap-12 max-w-5xl mx-auto">
                {content.founders.map((founder) => (
                  <div key={founder.id} className="relative bg-white/40 dark:bg-white/5 backdrop-blur-md border border-slate-200/60 dark:border-white/10 rounded-[40px] sm:rounded-[60px] overflow-hidden transition-all duration-500 hover:bg-white dark:hover:bg-white/10 group/card shadow-xl shadow-slate-200/20 dark:shadow-none">
                    {/* Science Background Pattern */}
                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                    
                    <div className="p-8 sm:p-12 flex flex-col md:flex-row items-center md:items-start text-center md:text-left relative z-10 gap-10 md:gap-16">
                      
                      {/* Science Animation & Image */}
                      <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center shrink-0">
                        {/* Atomic Orbits */}
                        <div className="absolute inset-0 rounded-full border border-blue-500/20 dark:border-[#003566]/30 animate-[spin_15s_linear_infinite]">
                          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-orange-500 dark:bg-[#FFD700] rounded-full shadow-[0_0_15px_rgba(249,115,22,0.5)] dark:shadow-[0_0_15px_#FFD700]"></div>
                        </div>
                        <div className="absolute inset-6 rounded-full border border-blue-500/10 dark:border-[#003566]/20 animate-[spin_10s_linear_reverse_infinite]">
                          <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2.5 h-2.5 bg-blue-500 dark:bg-white rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)] dark:shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                        </div>

                        {/* Circle Shape Image */}
                        <div className="w-32 h-32 sm:w-48 sm:h-48 relative z-10 group-hover/card:scale-105 transition-transform duration-500">
                          <div 
                            className="w-full h-full bg-blue-500/5 dark:bg-[#003566]/20 overflow-hidden border-2 border-slate-200 dark:border-[#003566]/30 shadow-2xl relative rounded-full"
                          >
                            <img 
                              src={founder.image} 
                              alt={founder.name} 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            {/* Overlay for premium feel */}
                            <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 dark:from-[#003566]/40 to-transparent opacity-40"></div>
                          </div>
                          {/* Glowing Circle Border */}
                          <div 
                            className="absolute -inset-2 border border-blue-500/20 dark:border-[#003566]/50 -z-10 blur-[4px] opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 rounded-full"
                          ></div>
                        </div>
                      </div>

                      <div className="flex-1 space-y-6">
                        <div>
                          <h3 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight uppercase mb-2">{founder.name}</h3>
                          <p className="text-blue-600 dark:text-[#00A3FF] font-bold uppercase text-sm sm:text-base tracking-[0.4em] drop-shadow-[0_0_10px_rgba(37,99,235,0.1)] dark:drop-shadow-[0_0_15px_rgba(0,163,255,0.4)]">
                            {founder.role}
                          </p>
                        </div>

                        <div className="relative">
                          <Quote className="absolute -top-4 -left-6 w-12 h-12 text-blue-500/5 dark:text-[#003566]/20 -rotate-12" />
                          <p className="text-xl sm:text-2xl text-slate-700 dark:text-slate-300 font-medium italic leading-relaxed relative z-10">
                            "{founder.quote}"
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 dark:border-white/10 bg-white/[0.02]">
                      <button 
                        onClick={() => setExpandedFounder(expandedFounder === founder.id ? null : founder.id)}
                        className="w-full py-6 flex items-center justify-center gap-3 text-blue-600 dark:text-[#00A3FF] font-bold uppercase text-xs tracking-[0.4em] hover:text-blue-700 dark:hover:text-white hover:bg-blue-500/5 dark:hover:bg-[#003566]/10 transition-all duration-300 group"
                      >
                        <span className="relative">
                          Read More about {founder.name}
                          <span className="absolute -bottom-1 left-0 w-0 h-px bg-blue-600 dark:bg-[#00A3FF] transition-all duration-300 group-hover:w-full"></span>
                        </span>
                        {expandedFounder === founder.id ? (
                          <ChevronUp className="w-4 h-4 transition-transform group-hover:-translate-y-1" />
                        ) : (
                          <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-1" />
                        )}
                      </button>
                    </div>

                    {expandedFounder === founder.id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="border-t border-slate-200 dark:border-white/10 bg-white dark:bg-black/40"
                      >
                        <div className="p-8 sm:p-12 text-left space-y-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-1 bg-blue-600 dark:bg-[#003566]"></div>
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-widest">{founder.name}</h4>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap text-sm sm:text-base border-l-2 border-blue-500/20 dark:border-[#003566]/30 pl-6">
                            {founder.bio}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {content?.featureCards && content.featureCards.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6 pt-8">
              {content.featureCards.map((card) => {
                const IconComponent = {
                  GraduationCap,
                  School,
                  BarChart3,
                  Users,
                  BookOpen,
                  Zap
                }[card.icon] || GraduationCap;

                return (
                  <div key={card.id} className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 text-center space-y-4 flex flex-col items-center group transition-all duration-500 hover:bg-white dark:hover:bg-white/10 shadow-sm hover:shadow-md dark:shadow-none">
                    <div className="relative">
                      <div 
                        className="absolute inset-0 blur-2xl rounded-full transition-colors opacity-20 group-hover:opacity-30"
                        style={{ backgroundColor: card.color }}
                      ></div>
                      <IconComponent 
                        className="relative w-10 h-10" 
                        style={{ color: card.color, filter: `drop-shadow(0 0 8px ${card.color}66)` }}
                        strokeWidth={1.2} 
                      />
                    </div>
                    <h3 className="text-slate-900 dark:text-white font-bold uppercase text-[10px] tracking-widest">{card.title}</h3>
                  </div>
                );
              })}
            </div>
          ) : content?.title === 'About Us' && (
            <div className="grid md:grid-cols-3 gap-6 pt-8">
              <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 text-center space-y-4 flex flex-col items-center group transition-all duration-500 hover:bg-white dark:hover:bg-white/10 shadow-sm hover:shadow-md dark:shadow-none">
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-500/10 dark:bg-[#FFD700]/20 blur-2xl rounded-full group-hover:bg-orange-500/20 dark:group-hover:bg-[#FFD700]/30 transition-colors"></div>
                  <GraduationCap className="relative w-10 h-10 text-orange-500 dark:text-[#FFD700] drop-shadow-[0_0_8px_rgba(249,115,22,0.4)] dark:drop-shadow-[0_0_8px_rgba(255,215,0,0.4)]" strokeWidth={1.2} />
                </div>
                <h3 className="text-slate-900 dark:text-white font-bold uppercase text-[10px] tracking-widest">Expert Faculty</h3>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 text-center space-y-4 flex flex-col items-center group transition-all duration-500 hover:bg-white dark:hover:bg-white/10 shadow-sm hover:shadow-md dark:shadow-none">
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-500/10 dark:bg-[#FFD700]/20 blur-2xl rounded-full group-hover:bg-orange-500/20 dark:group-hover:bg-[#FFD700]/30 transition-colors"></div>
                  <School className="relative w-10 h-10 text-orange-500 dark:text-[#FFD700] drop-shadow-[0_0_8px_rgba(249,115,22,0.4)] dark:drop-shadow-[0_0_8px_rgba(255,215,0,0.4)]" strokeWidth={1.2} />
                </div>
                <h3 className="text-slate-900 dark:text-white font-bold uppercase text-[10px] tracking-widest">Modern Facilities</h3>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 text-center space-y-4 flex flex-col items-center group transition-all duration-500 hover:bg-white dark:hover:bg-white/10 shadow-sm hover:shadow-md dark:shadow-none">
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-500/10 dark:bg-[#FFD700]/20 blur-2xl rounded-full group-hover:bg-orange-500/20 dark:group-hover:bg-[#FFD700]/30 transition-colors"></div>
                  <BarChart3 className="relative w-10 h-10 text-orange-500 dark:text-[#FFD700] drop-shadow-[0_0_8px_rgba(249,115,22,0.4)] dark:drop-shadow-[0_0_8px_rgba(255,215,0,0.4)]" strokeWidth={1.2} />
                </div>
                <h3 className="text-slate-900 dark:text-white font-bold uppercase text-[10px] tracking-widest">Proven Results</h3>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default About;
