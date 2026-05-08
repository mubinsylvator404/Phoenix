
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Teacher } from '../types';
import { X, ExternalLink, FileText, User, Search } from 'lucide-react';

interface TeachersProps {
  teachers: Teacher[];
}

const Teachers: React.FC<TeachersProps> = ({ teachers }) => {
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  const filteredTeachers = teachers;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[120px] -z-10"></div>

      <div className="max-w-7xl mx-auto space-y-12 sm:space-y-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 sm:space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500">Expert Faculty</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tighter uppercase leading-[0.9] break-words">Meet Your Mentors</h1>
          <p className="text-lg sm:text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
            Learn from the best minds in the industry. Our faculty members are dedicated to your success and academic excellence.
          </p>

        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 md:p-12">
          {filteredTeachers.map((teacher, i) => (
            <motion.div 
              key={teacher.id} 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className="group glass-card rounded-2xl sm:rounded-[48px] overflow-hidden border-white/5 shadow-2xl relative flex flex-col"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="h-64 sm:h-80 overflow-hidden relative">
                <img 
                  src={teacher.image || `https://picsum.photos/seed/${teacher.name}/400/400`} 
                  className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" 
                  alt={teacher.name} 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-60"></div>
                
                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                  <div className="px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 backdrop-blur-md">
                    <span className="text-xs font-bold uppercase tracking-widest text-orange-500">{teacher.subject}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-10 text-center space-y-6 flex-grow flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-2xl sm:text-3xl font-bold leading-tight uppercase tracking-tight group-hover:text-orange-500 transition-colors">
                    {teacher.name}
                  </h3>
                  
                  {teacher.education && (
                    <div className="inline-block px-4 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-500">
                        {teacher.education}
                      </span>
                    </div>
                  )}
                  
                  <p className="text-xs sm:text-sm font-medium text-slate-400 leading-relaxed uppercase tracking-widest">
                    {teacher.qualification}
                  </p>
                </div>

                <div className="pt-6 border-t border-white/5 flex items-center justify-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500">
                      EXP: {teacher.experience}
                    </span>
                  </div>
                  <div className="w-px h-4 bg-white/10"></div>
                  <button 
                    onClick={() => setSelectedTeacher(teacher)}
                    className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white hover:text-orange-500 transition-colors"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {teachers.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 sm:py-32 glass-card rounded-2xl sm:rounded-[48px] border-white/5"
          >
            <p className="text-xl sm:text-2xl text-slate-500 font-bold uppercase tracking-widest">No faculty members currently listed.</p>
          </motion.div>
        )}
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {selectedTeacher && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTeacher(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-3xl bg-[#111] border border-white/10 rounded-3xl sm:rounded-[40px] overflow-hidden shadow-2xl"
            >
              <button 
                onClick={() => setSelectedTeacher(null)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 sm:p-3 bg-white/5 hover:bg-white/10 text-white rounded-full z-10 transition-all"
              >
                <X size={18} />
              </button>

              <div className="grid md:grid-cols-2 h-full max-h-[90vh] overflow-y-auto">
                <div className="h-48 sm:h-64 md:h-full bg-slate-900 relative">
                  <img 
                    src={selectedTeacher.image || `https://picsum.photos/seed/${selectedTeacher.name}/400/400`} 
                    className="w-full h-full object-cover" 
                    alt={selectedTeacher.name} 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent"></div>
                </div>

                <div className="p-6 sm:p-8 md:p-12 space-y-6 sm:space-y-8">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500">{selectedTeacher.subject}</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tighter">{selectedTeacher.name}</h2>
                    <p className="text-slate-400 font-medium uppercase tracking-widest text-xs sm:text-sm">{selectedTeacher.qualification}</p>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Education</p>
                        <p className="text-xs sm:text-sm font-bold text-white">{selectedTeacher.education || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                      <h4 className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Instructor Profile</h4>
                      
                      {selectedTeacher.profileType === 'link' ? (
                        <a 
                          href={selectedTeacher.profileContent} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 sm:p-5 bg-orange-500/10 border border-orange-500/20 rounded-2xl group hover:bg-orange-500/20 transition-all"
                        >
                          <span className="font-bold text-orange-500 uppercase tracking-widest text-[10px] sm:text-xs">View External Portfolio</span>
                          <ExternalLink size={16} className="text-orange-500 group-hover:translate-x-1 transition-transform" />
                        </a>
                      ) : selectedTeacher.profileType === 'pdf' ? (
                        <a 
                          href={selectedTeacher.profileContent} 
                          download={`${selectedTeacher.name}_Profile.pdf`}
                          className="flex items-center justify-between p-4 sm:p-5 bg-blue-500/10 border border-blue-500/20 rounded-2xl group hover:bg-blue-500/20 transition-all"
                        >
                          <span className="font-bold text-blue-500 uppercase tracking-widest text-[10px] sm:text-xs">Download PDF Resume</span>
                          <FileText size={16} className="text-blue-500 group-hover:scale-110 transition-transform" />
                        </a>
                      ) : (
                        <div className="p-4 sm:p-6 bg-white/5 rounded-2xl border border-white/5">
                          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                            {selectedTeacher.profileContent || 'No detailed profile information available yet.'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Teachers;
