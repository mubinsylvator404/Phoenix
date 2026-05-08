
import React, { useState } from 'react';
import { ArrowRight, X, Circle, Play, Award, Users, BookOpen, Star, Sparkles, GraduationCap, Building2, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { HomeData, UserRole, Subject, Review } from '../types';
import CounterAnimation from '../components/CounterAnimation';
import InteractiveEngine from '../components/InteractiveEngine';
import { getDirectDriveLink } from '../utils';
import ReviewsSection from './ReviewsSection';

interface HomeProps {
  navigate: (p: string) => void;
  homeData: HomeData;
  role: UserRole;
  subjects: Subject[];
  reviews: Review[];
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
  currentUser: any;
}

const Home: React.FC<HomeProps> = ({ navigate, homeData, role, subjects, reviews, setReviews, currentUser }) => {
  const featuredCourses = subjects.slice(0, 6);
  const [isScholarshipModalOpen, setIsScholarshipModalOpen] = useState(false);

  return (
    <div className="space-y-12 sm:space-y-32 pb-12 sm:pb-32 bg-[#000814] text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 sm:pt-20 px-6 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#FFD700]/5 rounded-full blur-[120px] -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#003566]/10 rounded-full blur-[120px] -z-10 animate-pulse delay-1000"></div>
        
        {/* Grid Lines Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-20"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 lg:p-12 items-center relative">
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8 sm:space-y-12 text-center lg:text-left flex flex-col items-center lg:items-start"
          >
            <div className="flex flex-col gap-6 items-center lg:items-start w-full">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl shadow-lg border-opacity-20"
              >
                <span className="w-1.5 h-1.5 bg-[#FFD700] rounded-full animate-pulse"></span>
                <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400 whitespace-nowrap">Next-Gen Science Learning</span>
              </motion.div>
            </div>

            <div className="relative w-full max-w-sm sm:max-w-2xl mx-auto lg:mx-0">
              {/* Refined subtle gradient glow behind heading for premium feel */}
              <div className="absolute inset-x-0 -top-10 h-32 bg-[#FFD700]/5 blur-[100px] -z-10"></div>
              
              <h1 
                className="font-bold tracking-tight uppercase text-balance flex flex-col gap-1 sm:gap-2"
                style={{ 
                  fontSize: homeData.heroTitleFontSize ? `clamp(2.5rem, 10vw, ${homeData.heroTitleFontSize}px)` : undefined, 
                  lineHeight: 0.9,
                  color: homeData.heroTitleColor?.includes('text-') ? undefined : homeData.heroTitleColor,
                }}
              >
                <motion.span 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="block text-4xl sm:text-5xl md:text-7xl lg:text-[length:inherit] font-medium"
                >
                  {homeData.heroTitle}
                </motion.span>
                <motion.span 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="block bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 text-3xl sm:text-4xl md:text-6xl lg:text-[length:inherit] font-black"
                >
                  {homeData.heroSubtitle}
                </motion.span>
              </h1>
            </div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-base sm:text-lg text-slate-400 max-w-sm sm:max-w-xl mx-auto lg:mx-0 font-light leading-relaxed text-balance opacity-90 px-4 sm:px-0"
            >
              Interactive 3D simulations and AI-driven insights to ignite your potential.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4 sm:pt-6 w-full lg:w-auto px-4 sm:px-0"
            >
              <button 
                onClick={() => navigate('courses')}
                className="group relative px-10 py-4 bg-gradient-to-r from-[#FFD700] via-[#FFC107] to-[#FFA000] text-[#000814] rounded-full font-bold text-sm transition-all duration-300 hover:scale-[1.03] active:scale-95 shadow-[0_10px_30px_-5px_rgba(255,215,0,0.3)] hover:shadow-[0_20px_40px_-5px_rgba(255,215,0,0.4)] uppercase tracking-[0.1em] overflow-hidden"
              >
                <span className="relative z-10">{homeData.heroExploreText}</span>
              </button>
              {homeData.scholarship?.isActive && (
                <button 
                  onClick={() => setIsScholarshipModalOpen(true)}
                  className="group relative px-10 py-4 bg-white/5 backdrop-blur-md text-white rounded-full font-medium text-sm transition-all duration-300 hover:scale-[1.03] active:scale-95 shadow-sm hover:shadow-lg uppercase tracking-[0.1em] border border-white/10"
                >
                  <span className="relative z-10">Scholarship</span>
                </button>
              )}
            </motion.div>
          </motion.div>

          {/* Right Content - 3D Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative min-h-[600px] lg:h-[800px] flex items-center justify-center py-10 lg:py-0"
          >
            {/* Main 3D Object Placeholder (using InteractiveEngine or a stylized version) */}
            <div className="w-full relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#FFD700]/10 to-[#003566]/20 rounded-full blur-[100px] animate-pulse"></div>
              <InteractiveEngine />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Scholarship Section Removed - Now a Modal */}

      {/* Featured Courses Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-10 sm:mb-20 gap-6 md:p-8">
          <div className="space-y-4 sm:space-y-10 text-center md:text-left">
            <h2 className="text-2xl sm:text-6xl md:text-7xl font-black tracking-tighter uppercase leading-[1] sm:leading-none text-balance">
              Featured <span className="text-[#FFD700] drop-shadow-[0_0_30px_rgba(255,215,0,0.3)]">Courses</span>
            </h2>
            <div className="w-16 sm:w-56 h-1.5 sm:h-3 bg-[#FFD700] rounded-full mx-auto md:mx-0 shadow-[0_0_20px_rgba(255,215,0,0.4)]"></div>
          </div>
          <button 
            onClick={() => navigate('courses')}
            className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.4em] text-[#FFD700] hover:text-white transition-all"
          >
            <span>View All Courses</span>
            <ArrowRight className="group-hover:translate-x-3 transition-transform" size={16} />
          </button>
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-10 md:p-8 pb-16">
            {featuredCourses.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -15 }}
                className="glass-card rounded-2xl md:rounded-3xl border-white/5 overflow-hidden group/card cursor-pointer shadow-2xl hover:shadow-blue-500/10 transition-all duration-500"
                onClick={() => navigate('courses')}
              >
                <div className="relative h-48 sm:h-56 overflow-hidden">
                  <img 
                    src={course.thumbnail || `https://picsum.photos/seed/${course.name}/800/600`} 
                    className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-1000"
                    alt={course.name}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#000814] via-[#000814]/20 to-transparent"></div>
                  <div className="absolute top-4 left-4 px-4 py-2 bg-[#FFD700] backdrop-blur-md rounded-lg text-xs font-bold uppercase tracking-widest shadow-lg text-[#000814]">
                    {course.paymentType}
                  </div>
                </div>
                
                <div className="p-6 sm:p-8 space-y-4 sm:space-y-6">
                  <div className="flex items-start gap-4 sm:gap-6">
                    <span className="text-3xl sm:text-5xl filter drop-shadow-lg">{course.icon}</span>
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight uppercase leading-tight text-balance">{course.name}</h3>
                  </div>
                  <p className="text-sm text-slate-400 font-medium line-clamp-3 leading-relaxed opacity-80">{course.description || 'Master the fundamentals with our comprehensive curriculum and expert guidance.'}</p>
                  
                  <div className="flex items-center justify-between pt-4 sm:pt-6 border-t border-white/10">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500">Course Fee</span>
                      <span className="text-xl sm:text-2xl font-black text-white">৳{course.fee}</span>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover/card:bg-[#FFD700] group-hover/card:shadow-[0_0_20px_rgba(255,215,0,0.4)] transition-all duration-500">
                      <ArrowRight className="text-lg sm:text-xl group-hover/card:translate-x-1 transition-transform group-hover/card:text-[#000814]" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 md:p-12">
          <motion.div 
            whileHover={{ scale: 1.02, y: -5 }}
            className="p-8 md:p-10 glass-card rounded-3xl md:rounded-[40px] border-white/5 relative overflow-hidden group shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD700]/5 blur-[100px] group-hover:bg-[#FFD700]/10 transition-all duration-700"></div>
            <CounterAnimation value={homeData.statExperience} className="text-4xl md:text-7xl font-black mb-4 text-[#FFD700] block tracking-tighter" />
            <p className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-[0.4em] leading-relaxed">{homeData.statExperienceLabel || 'Years of Academic Excellence'}</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.02, y: -5 }}
            className="p-8 md:p-10 glass-card rounded-3xl md:rounded-[40px] border-white/5 relative overflow-hidden group shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#003566]/10 blur-[100px] group-hover:bg-[#003566]/20 transition-all duration-700"></div>
            <CounterAnimation value={homeData.statStudents} className="text-4xl md:text-7xl font-black mb-4 text-[#003566] block tracking-tighter" />
            <p className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-[0.4em] leading-relaxed">{homeData.statStudentsLabel || 'Enrolled Future Scientists'}</p>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-10 sm:mb-24 gap-6 md:p-8">
          <div className="space-y-4 sm:space-y-10 text-center md:text-left">
            <h2 className="text-2xl sm:text-6xl md:text-7xl font-black tracking-tighter uppercase leading-[1] sm:leading-none text-balance">
              The Phoenix <span className="text-[#FFD700] drop-shadow-[0_0_30px_rgba(255,215,0,0.3)]">Edge</span>
            </h2>
            <div className="w-16 sm:w-56 h-1.5 sm:h-3 bg-[#FFD700] rounded-full mx-auto md:mx-0 shadow-[0_0_20px_rgba(255,215,0,0.4)]"></div>
          </div>
          <p className="text-slate-400 max-w-lg font-medium text-base sm:text-xl leading-relaxed text-center md:text-left opacity-80 text-balance">
            We don't just teach; we ignite the passion for science through cutting-edge technology and personalized mentorship.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-10 md:p-8">
          {[
            { title: homeData.feature1Title, desc: homeData.feature1Desc, icon: <GraduationCap className="w-12 h-12 sm:w-16 sm:h-16 text-[#FFD700]" />, color: '#FFD700' },
            { title: homeData.feature2Title, desc: homeData.feature2Desc, icon: <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-[#003566]" />, color: '#003566' },
            { title: homeData.feature3Title, desc: homeData.feature3Desc, icon: <BarChart3 className="w-12 h-12 sm:w-16 sm:h-16 text-[#FFD700]" />, color: '#FFD700' }
          ].map((item, i) => (
            <motion.div 
              key={i} 
              whileHover={{ y: -15 }}
              className="group p-8 sm:p-16 glass-card rounded-3xl md:rounded-[64px] border-white/5 hover:border-[#FFD700]/30 transition-all duration-500 relative overflow-hidden shadow-2xl"
            >
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
                className="mb-6 sm:mb-12 p-4 sm:p-6 bg-white/5 rounded-2xl sm:rounded-3xl inline-flex backdrop-blur-md border border-white/10 shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500"
              >
                {item.icon}
              </motion.div>
              <h3 className="text-xl sm:text-3xl font-black mb-4 sm:mb-8 tracking-tight uppercase leading-tight text-balance">{item.title}</h3>
              <p className="text-sm sm:text-lg text-slate-400 leading-relaxed font-medium opacity-80">{item.desc}</p>
              
              {/* Decorative Glow */}
              <div className="absolute -bottom-20 -right-20 w-64 h-64 blur-[100px] transition-all duration-700" style={{ backgroundColor: `${item.color}10` }}></div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Scholarship Modal */}
      {isScholarshipModalOpen && homeData.scholarship && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-[#003566] to-[#001d3d] w-full max-w-4xl max-h-[90vh] sm:max-h-[85vh] rounded-[32px] sm:rounded-[48px] shadow-2xl relative overflow-hidden flex flex-col md:flex-row border border-[#FFD700]/20"
          >
            {/* Close Button */}
            <button 
              onClick={() => setIsScholarshipModalOpen(false)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 w-10 h-10 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <X size={20} />
            </button>

            {/* Image Section */}
            {homeData.scholarship.image && (
              <div className="w-full md:w-2/5 h-48 sm:h-64 md:h-auto relative shrink-0">
                <img src={getDirectDriveLink(homeData.scholarship.image)} alt="Scholarship" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#003566]/80 to-transparent"></div>
              </div>
            )}

            {/* Content Section */}
            <div className={`p-6 sm:p-10 md:p-12 flex-1 flex flex-col overflow-y-auto ${!homeData.scholarship.image ? 'items-center text-center' : ''}`}>
              <div className="my-auto">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 w-max mb-6">
                  <span className="w-2 h-2 bg-[#FFD700] rounded-full animate-pulse"></span>
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-white">Special Opportunity</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tighter uppercase leading-tight mb-4">
                  {homeData.scholarship.title}
                </h2>
                <p className="text-sm sm:text-base text-white/90 font-medium leading-relaxed mb-8 whitespace-pre-wrap">
                  {homeData.scholarship.description}
                </p>
                <a 
                  href={homeData.scholarship.applyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-8 sm:px-12 py-4 bg-[#FFD700] text-[#000814] rounded-full font-black text-sm uppercase tracking-[0.2em] hover:bg-[#FFC107] hover:scale-105 transition-all shadow-xl"
                >
                  Apply Now
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Reviews Section */}
      <ReviewsSection 
        reviews={reviews} 
        setReviews={setReviews} 
        role={role} 
        currentUser={currentUser} 
      />

    </div>
  );
};

export default Home;
