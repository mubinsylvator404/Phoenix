
import React from 'react';
import { Rocket, Star, Trophy, Award, Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageContent, SuccessStory } from '../types';
import { getDirectDriveLink } from '../utils';

interface SuccessStoriesProps {
  content?: PageContent;
  stories?: SuccessStory[];
}

const SuccessStories: React.FC<SuccessStoriesProps> = ({ content, stories = [] }) => {
  const displayStories = stories.length > 0 ? stories : [
    { id: '1', name: 'Rahat Ahmed', achievement: 'GPA 5.00 (HSC 2023)', institution: 'Kulaura Govt. College', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rahat' },
    { id: '2', name: 'Sumaiya Akter', achievement: 'GPA 5.00 (HSC 2023)', institution: 'MC College', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sumaiya' },
    { id: '3', name: 'Tanvir Hasan', achievement: 'Medical Admission (DMC)', institution: 'Sylhet Govt. College', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tanvir' },
    { id: '4', name: 'Nusrat Jahan', achievement: 'BUET Admission', institution: 'Kulaura Govt. College', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nusrat' },
  ];

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 bg-[#0A0A0A] relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[30%] h-[30%] bg-orange-500/5 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px] animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-5xl mx-auto space-y-8 sm:space-y-10 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3 text-center"
        >
          <div className="inline-block px-3 py-0.5 bg-orange-500/10 border border-orange-500/20 rounded-full">
            <span className="text-orange-500 text-[9px] font-black uppercase tracking-[0.3em]">Hall of Fame</span>
          </div>
          <h1 className="text-xl sm:text-4xl font-black text-white tracking-tighter uppercase leading-tight">
            {content?.title || 'Our Success'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-300">Stories</span>
          </h1>
          <p className="text-[10px] sm:text-sm text-slate-400 font-medium max-w-xl mx-auto leading-relaxed">
            {content?.subtitle || 'Celebrating the extraordinary achievements of our students who have paved their way to excellence through dedication and guidance.'}
          </p>
        </motion.div>

        {/* Featured Story Section */}
        {displayStories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative group"
          >
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/10 via-orange-500/10 to-blue-500/10 rounded-[32px] blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>
            <div className="relative glass-card rounded-2xl sm:rounded-[32px] p-4 sm:p-8 border-white/10 overflow-hidden">
              <div className="grid lg:grid-cols-2 gap-6 items-center">
                <div className="relative max-w-[240px] sm:max-w-[280px] mx-auto lg:mx-0">
                  <div className="aspect-square rounded-2xl sm:rounded-[24px] overflow-hidden border-2 border-white/10 shadow-xl">
                    <img 
                      src={getDirectDriveLink(displayStories[0].image)} 
                      alt={displayStories[0].name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-white shadow-xl rotate-12">
                    <span className="text-lg sm:text-xl font-black text-yellow-400">
                      <Star size={20} fill="currentColor" />
                    </span>
                  </div>
                </div>
                <div className="space-y-4 text-center lg:text-left">
                  <div className="space-y-1">
                    <span className="text-orange-500 font-black uppercase tracking-[0.2em] text-[8px] sm:text-[9px]">Featured Achievement</span>
                    <h2 className="text-lg sm:text-3xl font-black text-white tracking-tight leading-tight">{displayStories[0].name}</h2>
                    <p className="text-sm sm:text-lg text-slate-400 font-bold">{displayStories[0].institution}</p>
                  </div>
                  <div className="p-3 sm:p-4 bg-white/5 rounded-xl sm:rounded-[20px] border border-white/10 inline-block">
                    <p className="text-sm sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-300">
                      {displayStories[0].achievement}
                    </p>
                  </div>
                  <p className="text-[10px] sm:text-xs text-slate-400 leading-relaxed font-medium italic">
                    "The guidance and support I received at Phoenix Edu Care were instrumental in my success. The expert faculty and modern learning environment made all the difference."
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {displayStories.slice(1).map((story, idx) => (
            <motion.div
              key={story.id || idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group relative"
            >
              <div className="relative bg-white/5 border border-white/10 rounded-2xl sm:rounded-[28px] p-3 sm:p-4 space-y-3 sm:space-y-4 hover:bg-white/10 hover:border-white/20 transition-all duration-500 h-full flex flex-col">
                <div className="relative">
                  <div className="w-full aspect-square rounded-xl sm:rounded-[20px] overflow-hidden border border-white/5 group-hover:border-orange-500/30 transition-all duration-500">
                    <img 
                      src={getDirectDriveLink(story.image)} 
                      alt={story.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      referrerPolicy="no-referrer" 
                    />
                  </div>
                </div>

                <div className="space-y-1 flex-grow">
                  <div className="space-y-0.5">
                    <h3 className="text-sm sm:text-base font-black text-white tracking-tight truncate">{story.name}</h3>
                    <p className="text-slate-500 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest truncate">{story.institution}</p>
                  </div>
                  <div className="pt-2 border-t border-white/5">
                    <p className="text-orange-500 font-black text-[10px] sm:text-xs tracking-tight">{story.achievement}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Dynamic Sections from Admin */}
        {content?.sections && content.sections.length > 0 && (
          <div className="pt-12 space-y-12">
            {content.sections.map((section, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-black text-white tracking-tight uppercase italic border-l-4 border-orange-600 pl-4">
                  {section.title}
                </h2>
                <div className="text-slate-400 text-sm leading-relaxed font-medium whitespace-pre-wrap">
                  {section.content}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative p-5 sm:p-10 bg-gradient-to-br from-orange-600 to-orange-800 rounded-2xl sm:rounded-[32px] overflow-hidden shadow-xl"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-[60px] -mr-24 -mt-24"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left space-y-2 max-w-lg">
              <h2 className="text-lg sm:text-2xl font-black text-white leading-tight">Ready to write your own success story?</h2>
              <p className="text-orange-100 text-[10px] sm:text-xs font-medium">
                Join thousands of successful students and start your journey towards academic excellence today.
              </p>
            </div>
            <button className="whitespace-nowrap px-6 py-3 bg-white text-orange-600 rounded-xl sm:rounded-[14px] font-black uppercase tracking-widest hover:bg-orange-50 transition-all shadow-xl hover:scale-105 active:scale-95 text-[9px] sm:text-[10px]">
              Enroll Now <Rocket className="inline-block ml-2" size={24} />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SuccessStories;
