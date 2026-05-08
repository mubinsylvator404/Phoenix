
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  MapPin, 
  Globe, 
  TrendingUp, 
  Calendar,
  Loader2,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { AnalyticsSummary } from '../types';

const COLORS = ['#FFD700', '#003566', '#FF8C00', '#00BFFF', '#32CD32'];

const AnalysisBoard: React.FC = () => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('7'); // '7', '30', '365'

  const fetchAnalytics = async (days: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics?days=${days}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(filter);
  }, [filter]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] space-y-4">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Analytics Board...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 md:p-12 animate-in fade-in duration-700">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/5 backdrop-blur-xl p-8 rounded-[40px] border border-white/10 shadow-2xl">
        <div className="space-y-1">
          <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Analysis Board</h3>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Real-time user insights & growth metrics</p>
        </div>
        
        <div className="flex items-center gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/10">
          {[
            { label: '7 Days', value: '7' },
            { label: '30 Days', value: '30' },
            { label: 'All Time', value: '365' }
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === f.value 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {f.label}
            </button>
          ))}
          <button 
            onClick={() => fetchAnalytics(filter)}
            className="p-2.5 text-slate-400 hover:text-orange-500 transition-colors"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Users', value: data?.totalUsers || 0, icon: <Users />, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Active Today', value: data?.activeToday || 0, icon: <UserCheck />, color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'New (7 Days)', value: data?.newLast7Days || 0, icon: <UserPlus />, color: 'text-orange-400', bg: 'bg-orange-500/10' }
        ].map((stat, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={stat.label}
            className="bg-white/5 backdrop-blur-xl p-8 rounded-[40px] border border-white/10 shadow-xl group hover:border-white/20 transition-all"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-4">
                <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center shadow-inner`}>
                  {React.cloneElement(stat.icon as React.ReactElement<any>, { size: 24 })}
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{stat.label}</p>
                  <h4 className="text-4xl font-black text-white mt-1">{stat.value.toLocaleString()}</h4>
                </div>
              </div>
              <div className="h-full flex items-center">
                <TrendingUp size={40} className="text-white/5 group-hover:text-white/10 transition-colors" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Growth Line Chart */}
        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[40px] border border-white/10 shadow-2xl space-y-8 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LineChartIcon className="text-orange-500" size={20} />
              <h4 className="text-xl font-black text-white uppercase tracking-tight">User Growth Over Time</h4>
            </div>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.growthData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFD700" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FFD700" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                  itemStyle={{ color: '#FFD700', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#FFD700" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Cities Bar Chart */}
        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[40px] border border-white/10 shadow-2xl space-y-8">
          <div className="flex items-center gap-3">
            <BarChart3 className="text-blue-400" size={20} />
            <h4 className="text-xl font-black text-white uppercase tracking-tight">Top Cities</h4>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.topCities} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  width={80}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                />
                <Bar dataKey="count" fill="#FFD700" radius={[0, 10, 10, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Country Distribution Pie Chart */}
        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[40px] border border-white/10 shadow-2xl space-y-8">
          <div className="flex items-center gap-3">
            <PieChartIcon className="text-green-400" size={20} />
            <h4 className="text-xl font-black text-white uppercase tracking-tight">Country Distribution</h4>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.topCountries}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {data?.topCountries.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {data?.topCountries.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[40px] border border-white/10 shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-xl font-black text-white uppercase tracking-tight">Recent Activity</h4>
          <button className="text-[10px] font-black text-orange-500 uppercase tracking-widest hover:underline">View All Logs</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10">
                <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">User Name</th>
                <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Role</th>
                <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Location</th>
                <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data?.recentActivity.map((activity) => (
                <tr key={activity.id} className="group hover:bg-white/5 transition-colors">
                  <td className="py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">{activity.userName}</span>
                      <span className="text-[9px] text-slate-500 font-mono tracking-tighter">{activity.userId}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${
                      activity.role === 'ADMIN' ? 'bg-red-500/10 text-red-400' :
                      activity.role === 'TEACHER' ? 'bg-blue-500/10 text-blue-400' :
                      activity.role === 'STUDENT' ? 'bg-green-500/10 text-green-400' :
                      'bg-slate-500/10 text-slate-400'
                    }`}>
                      {activity.role}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <MapPin size={12} className="text-slate-500" />
                      <span>{activity.city}, {activity.country}</span>
                    </div>
                  </td>
                  <td className="py-4 text-sm text-slate-400 text-right font-mono">
                    {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalysisBoard;
