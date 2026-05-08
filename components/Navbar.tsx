
import React, { useState } from 'react';
import { UserRole } from '../types';
import { Menu, X, Sun, Moon, LogOut, LayoutDashboard, LogIn, MessageSquare } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  navigate: (p: string) => void;
  role: UserRole;
  onLogout: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  logoImage: string;
  organizationName?: string;
  isSaving?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, navigate, role, onLogout, darkMode, toggleDarkMode, logoImage, organizationName, isSaving }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Dynamically filter links: Hide 'Admission' if the user is already logged in
  const navLinks = [
    { name: 'Courses', id: 'courses' },
    { name: 'Olympiad', id: 'olympiad', path: '/olympiad' },
    { name: 'Teachers', id: 'teachers' },
    { name: 'Classes', id: 'classes' },
    { name: 'Success Story', id: 'success-stories' },
    ...(role === UserRole.GUEST ? [{ name: 'Admission', id: 'admission' }] : []),
    { name: 'Contact', id: 'contact' },
  ];

  const handleNavClick = (link: any) => {
    if (link.path) {
      navigate(link.path.substring(1)); // App.tsx navigate prefixes / if not home
    } else {
      navigate(link.id);
    }
    setIsOpen(false);
  };

  const isActive = (id: string) => currentPage === id;

  const isBase64 = logoImage.startsWith('data:image');

  return (
    <nav className="fixed w-full z-50 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-3 sm:gap-4 cursor-pointer group" onClick={() => navigate('home')}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-[0_0_20px_rgba(249,115,22,0.3)] group-hover:scale-110 transition-all duration-500 overflow-hidden shrink-0">
              {isBase64 ? (
                <img src={logoImage} className="w-full h-full object-cover" alt="Logo" />
              ) : (
                logoImage.length > 2 ? <span className="text-[10px] sm:text-xs truncate px-1">{logoImage}</span> : logoImage
              )}
            </div>
            <span className="text-base sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tighter uppercase line-clamp-1">
              {organizationName ? (
                <>
                  {String(organizationName).trim().split(/\s+/).map((word, i) => (
                    <span key={i} className={i > 0 ? "text-orange-500" : ""}>{word} </span>
                  ))}
                </>
              ) : (
                <>Phoenix <span className="text-orange-500">Edu Care</span></>
              )}
            </span>
            {isSaving && (
              <div className="ml-4 flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Saving</span>
              </div>
            )}
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-10">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link)}
                className={`text-xs font-bold uppercase tracking-[0.2em] transition-all relative group ${isActive(link.id) ? 'text-orange-500' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                {link.name}
                <span className={`absolute -bottom-2 left-0 w-full h-0.5 bg-orange-500 transition-all duration-300 ${isActive(link.id) ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100'}`}></span>
              </button>
            ))}

            <div className="h-6 w-px bg-white/10 dark:bg-white/10 mx-2"></div>

            <button 
              onClick={toggleDarkMode}
              className="p-3 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-orange-500/10 hover:text-orange-500 rounded-full transition-all active:scale-95"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {role === UserRole.GUEST ? (
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => navigate('login')}
                  className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-all"
                >
                  Login
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => {
                    if (role === UserRole.ADMIN) navigate('admin-dashboard');
                    else if (role === UserRole.TEACHER) navigate('teacher-dashboard');
                    else navigate('student-dashboard');
                  }}
                  className="px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-500 hover:bg-blue-500/10 border border-blue-500/20 rounded-full transition-all flex items-center gap-2"
                >
                  <LayoutDashboard size={14} />
                  Dashboard
                </button>
                <button 
                  onClick={onLogout}
                  className="p-3 bg-white/5 text-slate-400 hover:bg-red-500 hover:text-white rounded-full transition-all active:scale-95"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Controls */}
          <div className="md:hidden flex items-center space-x-4">
            <button 
              onClick={toggleDarkMode}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="p-2.5 rounded-2xl bg-white/5 dark:bg-white/5 text-slate-400 border border-white/10 dark:border-white/10"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-[#0A0A0A] border-b border-white/5 p-4 sm:p-6 space-y-2 sm:space-y-4 shadow-2xl animate-in slide-in-from-top duration-500 z-40 backdrop-blur-3xl">
          <div className="space-y-1 sm:space-y-2">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link)}
                className={`block w-full text-left py-4 px-6 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs sm:text-sm transition-all ${isActive(link.id) ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                {link.name}
              </button>
            ))}
          </div>
          
          <div className="pt-6 border-t border-white/5 space-y-4">
            {role === UserRole.GUEST ? (
              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={() => { navigate('login'); setIsOpen(false); }} 
                  className="py-5 bg-white/5 text-white rounded-2xl font-bold uppercase tracking-widest text-xs border border-white/10"
                >
                  Login
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    if (role === UserRole.ADMIN) navigate('admin-dashboard');
                    else if (role === UserRole.TEACHER) navigate('teacher-dashboard');
                    else navigate('student-dashboard');
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-3 py-5 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-2xl font-bold uppercase tracking-widest text-xs"
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </button>
                <button 
                  onClick={() => { onLogout(); setIsOpen(false); }} 
                  className="w-full flex items-center justify-center gap-3 py-5 bg-red-500/10 text-red-500 rounded-2xl font-bold uppercase tracking-widest text-xs"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
