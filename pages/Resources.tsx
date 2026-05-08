
import React, { useState } from 'react';
import { FileText, Download, Search, BookOpen, GraduationCap, Video, FileCode, Music, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageContent, ResourceItem } from '../types';

interface ResourcesProps {
  content?: PageContent;
  resources?: ResourceItem[];
}

const Resources: React.FC<ResourcesProps> = ({ content, resources = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(resources.map(r => r.category || 'General')))];

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (resource.subject?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || (resource.category || 'General') === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'PDF': return <FileText className="text-red-500" />;
      case 'VIDEO': return <Video className="text-blue-500" />;
      case 'DOC': return <FileCode className="text-blue-400" />;
      case 'LINK': return <ExternalLink className="text-green-500" />;
      default: return <BookOpen className="text-slate-400" />;
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 bg-[#0A0A0A] relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-orange-500/5 rounded-full blur-[100px] animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 text-center"
        >
          <div className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em]">Knowledge Hub</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tighter uppercase leading-tight">
            {content?.title || 'Learning'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">Resources</span>
          </h1>
          <p className="text-xs sm:text-base text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
            {content?.subtitle || 'Access high-quality study materials, lecture notes, and practice exams to boost your HSC preparation.'}
          </p>
        </motion.div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-3xl border border-white/10 backdrop-blur-xl">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              type="text" 
              placeholder="Search resources, subjects..." 
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-blue-500/50 transition-all outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto hide-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
                  selectedCategory === cat 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredResources.map((resource, idx) => (
              <motion.div
                layout
                key={`${resource.id}-${idx}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="group relative"
              >
                <div className="relative h-full bg-white/5 border border-white/10 rounded-[32px] p-6 space-y-4 hover:bg-white/10 hover:border-blue-500/30 transition-all duration-500 flex flex-col">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/10 group-hover:scale-110 transition-transform duration-500">
                      {getIcon(resource.type)}
                    </div>
                    <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest">
                      {resource.size}
                    </span>
                  </div>

                  <div className="space-y-2 flex-grow">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded text-[8px] font-bold uppercase tracking-widest">
                        {resource.subject || 'General'}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-white tracking-tight leading-tight group-hover:text-blue-400 transition-colors">
                      {resource.title}
                    </h3>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-500">
                      <GraduationCap size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{resource.category || 'HSC'}</span>
                    </div>
                    <a 
                      href={resource.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10 active:scale-95"
                    >
                      Access <Download size={14} />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredResources.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
              <Search size={32} className="text-slate-600" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">No resources found</h3>
              <p className="text-slate-500 text-sm">Try adjusting your search or category filters.</p>
            </div>
          </div>
        )}

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
                <h2 className="text-2xl font-black text-white tracking-tight uppercase italic border-l-4 border-blue-600 pl-4">
                  {section.title}
                </h2>
                <div className="text-slate-400 text-sm leading-relaxed font-medium whitespace-pre-wrap">
                  {section.content}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Resources;
