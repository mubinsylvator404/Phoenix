
import React from 'react';
import { FooterData } from '../types';

interface FooterProps {
  data: FooterData;
  navigate: (p: string) => void;
}

const Footer: React.FC<FooterProps> = ({ data, navigate }) => {
  const handleInternalLink = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    if (url.startsWith('#') || url === '' || url.includes('example.com')) {
      e.preventDefault();
      // Map common names to internal routes
      const name = e.currentTarget.innerText.toLowerCase();
      if (name.includes('about')) navigate('about');
      else if (name.includes('admission')) navigate('admission');
      else if (name.includes('success')) navigate('success-stories');
      else if (name.includes('classes')) navigate('classes');
      else if (name.includes('contact')) navigate('contact');
      else if (name.includes('privacy')) navigate('privacy');
      else if (name.includes('terms')) navigate('terms');
      else if (name.includes('refund')) navigate('refund');
    }
  };

  return (
    <footer className="bg-[#050505] text-slate-500 py-8 sm:py-12 px-6 border-t border-white/5 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] -z-10"></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6 lg:gap-10">
        <div className="space-y-4 text-left">
          <div className="space-y-3">
            <h3 className="text-white text-lg sm:text-2xl font-black tracking-tighter uppercase cursor-pointer leading-none" onClick={() => navigate('home')}>
              {data.organizationName ? (
                <>
                  {data.organizationName.split(' ')[0]} <span className="text-orange-500">{data.organizationName.split(' ').slice(1).join(' ')}</span>
                </>
              ) : (
                <>Phoenix <span className="text-orange-500">Edu Care</span></>
              )}
            </h3>
            <p className="text-[10px] sm:text-xs leading-relaxed font-medium text-slate-400 max-w-sm">{data.description}</p>
          </div>
        </div>

        <div className="text-left pt-6 md:pt-0 border-t border-white/5 md:border-t-0">
          <h4 className="text-white text-[10px] font-black uppercase tracking-[0.25em] mb-4 md:mb-3 opacity-50">Quick Navigation</h4>
          <ul className="space-y-2">
            {data.quickLinks.map((link, i) => (
              <li key={i}>
                <a 
                  href={link.url} 
                  onClick={(e) => handleInternalLink(e, link.url)}
                  className="text-[10px] md:text-xs font-bold text-slate-300 hover:text-orange-500 transition-all flex items-center justify-start gap-2 group"
                >
                  <div className="w-1 h-1 rounded-full bg-orange-500 scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-left pt-6 md:pt-0 border-t border-white/5 md:border-t-0">
          <h4 className="text-white text-[10px] font-black uppercase tracking-[0.25em] mb-4 md:mb-3 opacity-50">Legal & Support</h4>
          <ul className="space-y-2">
            <li>
              <button 
                onClick={() => {
                  let url = data.privacyPolicy || 'privacy';
                  if (url.includes('example.com')) url = 'privacy';
                  if (url.startsWith('http')) window.location.href = url;
                  else navigate(url);
                }} 
                className="text-[10px] md:text-xs font-bold text-slate-300 hover:text-orange-500 transition-all"
              >
                Privacy Policy
              </button>
            </li>
            <li>
              <button 
                onClick={() => {
                  let url = data.termsOfService || 'terms';
                  if (url.includes('example.com')) url = 'terms';
                  if (url.startsWith('http')) window.location.href = url;
                  else navigate(url);
                }} 
                className="text-[10px] md:text-xs font-bold text-slate-300 hover:text-orange-500 transition-all"
              >
                Terms of Service
              </button>
            </li>
            <li>
              <button 
                onClick={() => {
                  let url = data.refundPolicy || 'refund';
                  if (url.includes('example.com')) url = 'refund';
                  if (url.startsWith('http')) window.location.href = url;
                  else navigate(url);
                }} 
                className="text-[10px] md:text-xs font-bold text-slate-300 hover:text-orange-500 transition-all"
              >
                Refund Policy
              </button>
            </li>
            <li>
              <button 
                onClick={() => navigate('login?role=admin')}
                className="text-[10px] md:text-xs font-bold text-slate-400 hover:text-orange-500 transition-all opacity-50 hover:opacity-100"
              >
                Admin Login
              </button>
            </li>
          </ul>
        </div>

        <div className="space-y-4 text-left pt-6 md:pt-0 border-t border-white/5 md:border-t-0">
          <h4 className="text-white text-[10px] font-black uppercase tracking-[0.25em] mb-4 md:mb-3 opacity-50">Get In Touch</h4>
          <div className="space-y-4">
            <div className="flex items-start justify-start gap-3">
              <span className="text-base md:text-lg">📍</span>
              <p className="text-[10px] md:text-xs font-bold text-slate-300 leading-relaxed">{data.address}</p>
            </div>
            <div className="flex items-center justify-start gap-3">
              <span className="text-base md:text-lg">📞</span>
              <p className="text-[10px] md:text-xs font-bold text-slate-300">{data.phone}</p>
            </div>
            <div className="flex items-center justify-start gap-3">
              <span className="text-base md:text-lg">✉️</span>
              <p className="text-[10px] md:text-xs font-bold text-slate-300">{data.email}</p>
            </div>
          </div>

          {/* Social Links */}
          <div className="pt-4 flex items-center justify-start gap-4">
            {data.facebook && (
              <a href={data.facebook} target="_blank" rel="noopener noreferrer" className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white hover:-translate-y-1 transition-all duration-300">
                <svg className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            )}
            {data.youtube && (
              <a href={data.youtube} target="_blank" rel="noopener noreferrer" className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:bg-red-600 hover:text-white hover:-translate-y-1 transition-all duration-300">
                <svg className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            )}
            {data.linkedin && (
              <a href={data.linkedin} target="_blank" rel="noopener noreferrer" className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:bg-blue-700 hover:text-white hover:-translate-y-1 transition-all duration-300">
                <svg className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-white/5 flex flex-col items-center justify-center gap-4">
        <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-slate-600 text-center">
          &copy; {new Date().getFullYear()} Phoenix Edu Care. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
