
import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, BookOpen, Clock, Users, DollarSign, Sparkles, GraduationCap, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Subject, Teacher } from '../types';

interface CoursesProps {
  subjects: Subject[];
  teachers: Teacher[];
  navigate: (p: string) => void;
}

const Courses: React.FC<CoursesProps> = ({ subjects, teachers, navigate }) => {
  const [selectedCourse, setSelectedCourse] = useState<Subject | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.subSubjects?.some(sub => sub.toLowerCase().includes(searchQuery.toLowerCase())) ||
    teachers.filter(t => s.assignedTeachers?.includes(t.id))
            .some(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getAssignedTeachers = (teacherIds?: string[]) => {
    if (!teacherIds || teacherIds.length === 0) return [];
    return teachers.filter(t => teacherIds.includes(t.id));
  };

  if (selectedCourse) {
    const assigned = getAssignedTeachers(selectedCourse.assignedTeachers);
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white pt-20 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-10 sm:space-y-16">
          <motion.button 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setSelectedCourse(null)}
            className="flex items-center space-x-3 text-slate-400 hover:text-orange-500 transition-colors font-bold uppercase tracking-[0.2em] text-xs group"
          >
            <ArrowLeft className="text-xl group-hover:-translate-x-1 transition-transform" />
            <span>Back to Programs</span>
          </motion.button>

          <div className="space-y-20">
            {/* Course Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 sm:space-y-6 text-center md:text-left"
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mx-auto md:mx-0">
                <span className="text-xl sm:text-2xl">{selectedCourse.icon}</span>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-orange-500">Premium Program</span>
              </div>
              <h1 className="text-xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tighter uppercase leading-[0.95] sm:leading-[0.9] break-words">
                {selectedCourse.name}
              </h1>
              <div className="w-24 sm:w-40 h-1.5 sm:h-2 bg-orange-500 rounded-full mx-auto md:mx-0"></div>
            </motion.div>

            {/* Subjects / Topics Section */}
            {selectedCourse.subSubjects && selectedCourse.subSubjects.length > 0 && (
              <section className="space-y-8 sm:space-y-10">
                <h2 className="text-lg sm:text-3xl font-bold tracking-tight uppercase text-center md:text-left">কোর্স কারিকুলাম</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {selectedCourse.subSubjects.map((sub, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center space-x-4 sm:space-x-6 p-4 sm:p-6 glass-card rounded-2xl sm:rounded-3xl border-white/5 hover:border-orange-500/30 transition-all group"
                    >
                      <span className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 flex items-center justify-center bg-white/5 text-orange-500 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm group-hover:bg-orange-500 group-hover:text-white transition-all">{i + 1}</span>
                      <span className="font-bold text-slate-200 text-sm sm:text-lg">{sub}</span>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Faculties Section */}
            <section className="space-y-8 sm:space-y-10">
              <h2 className="text-lg sm:text-3xl font-bold tracking-tight uppercase text-center md:text-left">Conducted Instructors</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:p-8">
                {assigned.map((t, i) => (
                  <motion.div 
                    key={t.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex flex-col sm:flex-row items-center text-center sm:text-left space-y-4 sm:space-y-0 sm:space-x-8 p-6 sm:p-8 glass-card rounded-2xl sm:rounded-3xl md:rounded-[40px] border-white/5 hover:border-blue-500/30 transition-all group"
                  >
                    <div className="relative">
                      <img 
                        src={t.image || 'https://via.placeholder.com/200'} 
                        className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl object-cover shadow-2xl group-hover:scale-105 transition-transform duration-500" 
                        alt={t.name}
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-5 h-5 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg">
                        <Check size={16} />
                      </div>
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <h3 className="text-lg sm:text-2xl font-bold tracking-tight uppercase">{t.name}</h3>
                      <p className="text-[8px] sm:text-sm font-bold text-slate-500 uppercase tracking-widest">{t.education || t.qualification}</p>
                    </div>
                  </motion.div>
                ))}
                {assigned.length === 0 && (
                  <p className="text-slate-500 font-medium italic text-base">No faculty assigned to this program yet.</p>
                )}
              </div>
            </section>

            {/* About Course Section */}
            <section className="space-y-8 sm:space-y-10">
              <div className="glass-card rounded-3xl sm:rounded-[60px] p-6 sm:p-12 md:p-20 border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[100px] -z-10"></div>
                
                <div className="space-y-8 sm:space-y-10 relative z-10">
                  <h2 className="text-xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter uppercase leading-tight break-words text-center md:text-left">
                    কোর্সটি সম্পর্কে
                  </h2>
                  
                  <p className="text-sm sm:text-xl md:text-2xl text-slate-400 leading-relaxed whitespace-pre-wrap font-medium text-center md:text-left">
                    {selectedCourse.description || "কোর্সটির বিস্তারিত তথ্য শীঘ্রই প্রদান করা হবে। আমাদের সাথেই থাকুন।"}
                  </p>

                  <div className="pt-8 sm:pt-10 flex flex-col items-center gap-6 md:p-8">
                    <div className="flex items-center gap-6 sm:gap-12">
                      <div className="text-center">
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-1 sm:mb-2">Duration</p>
                        <p className="text-lg sm:text-2xl font-bold">{selectedCourse.classesPerWeek} Classes/Week</p>
                      </div>
                      <div className="w-px h-10 sm:h-12 bg-white/10"></div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-1 sm:mb-2">Investment</p>
                        <p className="text-lg sm:text-2xl font-bold text-orange-500">৳{selectedCourse.fee}</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => navigate('admission')}
                      className="w-full sm:w-auto px-10 sm:px-16 py-4 sm:py-6 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all hover:-translate-y-1 active:scale-95 text-base sm:text-xl flex items-center justify-center space-x-4 uppercase tracking-widest"
                    >
                      <span>Enroll Now</span>
                      <ArrowRight className="text-xl sm:text-2xl" />
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-20 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[120px] -z-10"></div>

      <div className="max-w-7xl mx-auto space-y-12 sm:space-y-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 sm:space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Academic Excellence</span>
          </div>
          <h1 className="text-xl sm:text-5xl md:text-6xl lg:text-8xl font-bold tracking-tighter uppercase leading-[0.95] sm:leading-[0.9] break-words">Our HSC Programs</h1>
          <p className="text-sm sm:text-xl text-slate-400 font-medium max-w-2xl mx-auto">Tailored curriculum for Science enthusiasts designed to ignite your potential.</p>

          <div className="max-w-md mx-auto pt-4 sm:pt-8 px-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                <Search size={22} />
              </div>
              <input
                type="text"
                placeholder="Search programs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-[32px] py-6 pl-16 pr-8 text-white font-bold text-base focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-slate-600 focus:bg-white/10 shadow-3xl"
              />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
          {filteredSubjects.map((sub, i) => (
            <motion.div 
              key={sub.id} 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className="group glass-card rounded-2xl sm:rounded-3xl md:rounded-[48px] overflow-hidden border-white/5 hover:border-blue-500/30 transition-all duration-500 flex flex-col relative"
            >
              {/* Thumbnail */}
              <div 
                className="h-40 sm:h-72 overflow-hidden cursor-pointer relative"
                onClick={() => setSelectedCourse(sub)}
              >
                <img 
                  src={sub.thumbnail || `https://picsum.photos/seed/${sub.name}/800/600`} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  alt={sub.name}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent opacity-60"></div>
                <div className="absolute top-4 left-4 sm:top-5 sm:left-8 p-2 sm:p-4 glass-card rounded-xl sm:rounded-2xl border-white/10 backdrop-blur-xl shadow-2xl group-hover:scale-110 transition-transform duration-500">
                  <span className="text-xl sm:text-4xl">{sub.icon}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 sm:p-10 space-y-4 sm:space-y-8 flex-grow flex flex-col justify-between relative">
                <div className="space-y-2 sm:space-y-4">
                  <h3 className="text-base sm:text-3xl font-bold leading-tight tracking-tight uppercase group-hover:text-blue-500 transition-colors cursor-pointer" onClick={() => setSelectedCourse(sub)}>
                    {sub.name}
                  </h3>
                  <div className="flex items-center justify-between text-[9px] sm:text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                    <span className="flex items-center gap-1.5 sm:gap-2">
                      <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-blue-500 rounded-full"></span>
                      {sub.classesPerWeek} Classes/Week
                    </span>
                    <span className="text-blue-500">৳{sub.fee}</span>
                  </div>
                </div>

                <div className="flex gap-3 sm:gap-4">
                  <button 
                    onClick={() => setSelectedCourse(sub)}
                    className="flex-grow py-4 sm:py-5 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-widest text-[10px] sm:text-xs rounded-xl sm:rounded-2xl transition-all border border-white/5"
                  >
                    Details
                  </button>
                  <button 
                    onClick={() => navigate('admission')}
                    className="flex-grow py-4 sm:py-5 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-widest text-[10px] sm:text-xs rounded-xl sm:rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                  >
                    Enroll Now
                  </button>
                </div>
              </div>

              {/* Hover Glow */}
              <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 blur-3xl transition-all duration-500 -z-10"></div>
            </motion.div>
          ))}
        </div>

        {subjects.length === 0 && (
          <div className="text-center py-32 glass-card rounded-3xl md:rounded-[48px] border-white/5">
            <p className="text-3xl text-slate-500 font-bold uppercase tracking-widest">No programs available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
