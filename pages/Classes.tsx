
import React from 'react';
import { motion } from 'framer-motion';
import { VideoClass } from '../types';

interface ClassesProps {
  videoClasses: VideoClass[];
}

const Classes: React.FC<ClassesProps> = ({ videoClasses }) => {
  // Function to extract YouTube video ID
  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-500">Video Library</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tighter uppercase leading-[0.9] break-words">Recorded Classes</h1>
          <p className="text-lg sm:text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
            Watch our expert lectures anytime, anywhere. Master complex concepts at your own pace with our high-definition video archive.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-6 md:p-12">
          {videoClasses.map((video, i) => {
            const videoId = getYoutubeId(video.youtubeUrl);
            return (
              <motion.div 
                key={video.id} 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10 }}
                className="group glass-card rounded-2xl sm:rounded-[48px] overflow-hidden border-white/5 shadow-2xl flex flex-col relative"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                {/* Video Embed */}
                <div className="aspect-video w-full overflow-hidden bg-black/40 relative">
                  {videoId ? (
                    <iframe
                      className="w-full h-full grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700"
                      src={`https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&showinfo=0`}
                      title={video.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 font-bold uppercase tracking-widest text-[10px] sm:text-xs">
                      Invalid YouTube URL
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 sm:p-10 space-y-4 sm:space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-500">Lesson Archive</span>
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-600">HD 1080P</span>
                  </div>
                  
                  <h3 className="text-2xl sm:text-3xl font-bold leading-[1.1] uppercase tracking-tight group-hover:text-blue-500 transition-colors">
                    {video.title}
                  </h3>
                  
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <button className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      </div>
                      Watch Now
                    </button>
                    <div className="flex -space-x-2">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-[#0A0A0A] bg-slate-800"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {videoClasses.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 sm:py-32 glass-card rounded-2xl sm:rounded-[48px] border-white/5"
          >
            <p className="text-xl sm:text-2xl text-slate-500 font-bold uppercase tracking-widest">No recorded classes available.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Classes;
