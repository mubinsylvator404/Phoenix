
import React, { useState, useEffect } from 'react';
// Login component for authentication
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { UserRole } from '../types';
import { Settings, Cog, ArrowDown, Hand, Zap } from 'lucide-react';

interface LoginProps {
  onLogin: (role: UserRole, email: string, password?: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'admin' ? UserRole.ADMIN : UserRole.STUDENT;

  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isFocused, setIsFocused] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('role') === 'admin') {
      setSelectedRole(UserRole.ADMIN);
    }
  }, [searchParams]);

  const gearControls = useAnimation();
  const weightControls = useAnimation();

  useEffect(() => {
    if (identifier.length > 0 || password.length > 0) {
      gearControls.start({
        rotate: (identifier.length + password.length) * 20,
        transition: { type: 'spring', stiffness: 50 }
      });
    }
  }, [identifier, password, gearControls]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(selectedRole, identifier, password);
  };

  const getRoleColor = () => {
    switch (selectedRole) {
      case UserRole.STUDENT: return 'blue';
      case UserRole.TEACHER: return 'blue';
      case UserRole.ADMIN: return 'orange';
      default: return 'blue';
    }
  };

  const roleColor = getRoleColor();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center px-4 py-24 sm:py-32 relative overflow-hidden">
      {/* Mechanical Elements - Rube Goldberg Style */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20 md:opacity-40">
        {/* Large Gear Top Right */}
        <motion.div 
          animate={gearControls}
          className="absolute -top-20 -right-20 text-slate-700"
        >
          <Settings size={400} strokeWidth={0.5} />
        </motion.div>

        {/* Smaller Gear Interlocked */}
        <motion.div 
          animate={{ rotate: (identifier.length + password.length) * -40 }}
          transition={{ type: 'spring', stiffness: 50 }}
          className="absolute top-[220px] right-[280px] text-slate-800"
        >
          <Cog size={120} strokeWidth={1} />
        </motion.div>

        {/* Pulley System Left */}
        <div className="absolute top-1/4 left-10 md:left-40 flex flex-col items-center">
          <div className="w-1 h-64 bg-slate-800 relative">
            <motion.div 
              animate={{ y: identifier.length * 5 }}
              className="absolute -left-4 top-0 text-slate-600"
            >
              <div className="w-10 h-10 rounded-full border-2 border-slate-700 flex items-center justify-center">
                <div className="w-1 h-1 bg-slate-700 rounded-full" />
              </div>
            </motion.div>
            <motion.div 
              animate={{ y: 200 - (identifier.length * 5) }}
              className="absolute -left-6 bottom-0"
            >
              <div className="w-12 h-16 bg-slate-900 border-2 border-slate-800 rounded-b-lg flex items-center justify-center">
                <span className="text-[10px] font-bold text-slate-700 uppercase">KG</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Connecting Lines (SVG) */}
        <svg className="absolute inset-0 w-full h-full">
          <motion.path 
            d="M 160 250 L 160 500" 
            stroke="currentColor" 
            strokeWidth="1" 
            fill="none" 
            className="text-slate-800"
            strokeDasharray="5,5"
          />
          <motion.path 
            d="M 160 300 Q 300 300 400 400" 
            stroke="currentColor" 
            strokeWidth="1" 
            fill="none" 
            className="text-slate-900"
          />
        </svg>

        {/* Floating Physics Icons */}
        <motion.div 
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 10, 0]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute bottom-20 right-40 text-slate-800"
        >
          <Zap size={80} />
        </motion.div>
      </div>

      {/* Dynamic Background Glow */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={roleColor}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.2 }}
          transition={{ duration: 0.8 }}
          className={`absolute w-[800px] h-[800px] rounded-full blur-[160px] -z-10 opacity-20 bg-${roleColor}-500`}
        />
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card p-6 sm:p-12 rounded-2xl sm:rounded-[48px] border-white/5 space-y-8 sm:space-y-10 relative overflow-hidden z-10"
      >
        <div className={`absolute top-0 left-0 w-full h-1 bg-${roleColor}-500 transition-colors duration-500`}></div>
        
        {/* Mechanical Indicator */}
        <div className="absolute top-4 right-8 flex items-center space-x-2">
          <motion.div 
            animate={{ rotate: isFocused ? 360 : 0 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className={`text-${roleColor}-500/30`}
          >
            <Settings size={20} />
          </motion.div>
          <div className={`w-2 h-2 rounded-full ${isFocused ? `bg-${roleColor}-500 animate-pulse` : 'bg-slate-800'}`} />
        </div>

        <div className="text-center space-y-3 sm:space-y-4">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tighter uppercase break-words">Welcome Back</h2>
          <p className="text-slate-400 font-medium text-[10px] sm:text-sm uppercase tracking-widest">Access your secure dashboard</p>
        </div>

        <div className="flex bg-white/5 p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl border border-white/5">
          {[
            { role: UserRole.STUDENT, label: 'Student', color: 'blue' },
            { role: UserRole.TEACHER, label: 'Teacher', color: 'blue' },
            ...(selectedRole === UserRole.ADMIN ? [{ role: UserRole.ADMIN, label: 'Admin', color: 'orange' }] : [])
          ].map((item) => (
            <button 
              key={item.role}
              type="button"
              onClick={() => setSelectedRole(item.role)}
              className={`flex-1 py-2.5 sm:py-3 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-xl sm:rounded-2xl transition-all duration-300 ${
                selectedRole === item.role 
                  ? `bg-${item.color}-500 text-white shadow-lg shadow-${item.color}-500/20` 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          <div className="space-y-2 sm:space-y-3">
            <label className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-slate-500 ml-4">
              {selectedRole === UserRole.STUDENT ? "Email or Mobile" : selectedRole === UserRole.TEACHER ? "Teacher Email" : "Admin Email"}
            </label>
            <div className="relative">
              <input 
                required
                type="text" 
                value={identifier}
                onFocus={() => setIsFocused('identifier')}
                onBlur={() => setIsFocused(null)}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white/5 border border-white/10 focus:border-white/20 outline-none font-bold transition-all placeholder:text-slate-600 text-sm sm:text-base"
                placeholder={selectedRole === UserRole.STUDENT ? "01700000000" : "EMAIL@PHOENIX.COM"}
              />
              <motion.div 
                animate={{ opacity: isFocused === 'identifier' ? 1 : 0, x: isFocused === 'identifier' ? 0 : -10 }}
                className={`absolute right-5 top-1/2 -translate-y-1/2 text-${roleColor}-500`}
              >
                <Hand size={18} className="rotate-90" />
              </motion.div>
            </div>
          </div>
          <div className="space-y-2 sm:space-y-3">
            <label className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-slate-500 ml-4">Password</label>
            <div className="relative">
              <input 
                required
                type="password" 
                value={password}
                onFocus={() => setIsFocused('password')}
                onBlur={() => setIsFocused(null)}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white/5 border border-white/10 focus:border-white/20 outline-none font-bold transition-all placeholder:text-slate-600 text-sm sm:text-base"
                placeholder="••••••••"
              />
              <motion.div 
                animate={{ opacity: isFocused === 'password' ? 1 : 0, x: isFocused === 'password' ? 0 : -10 }}
                className={`absolute right-5 top-1/2 -translate-y-1/2 text-${roleColor}-500`}
              >
                <Zap size={18} />
              </motion.div>
            </div>
          </div>
          
          <button 
            type="submit" 
            className={`w-full py-4 sm:py-6 text-white font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs rounded-2xl sm:rounded-3xl shadow-xl transition-all hover:-translate-y-1 active:scale-95 bg-${roleColor}-500 hover:bg-${roleColor}-600 shadow-${roleColor}-500/20 flex items-center justify-center space-x-3 group`}
          >
            <span>Login as {selectedRole}</span>
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <ArrowDown size={14} className="-rotate-90" />
            </motion.div>
          </button>
        </form>

        <div className="text-center pt-4">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
            Forgot password? <br/>
            <span className="text-slate-400">Contact administration office</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
