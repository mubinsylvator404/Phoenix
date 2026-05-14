
import React, { useState, useEffect } from 'react';
import { Student, PerformanceInsight, Exam, Subject, ResourceItem, Assignment, Notice, UserRole } from '../types';
import SyllabusTracker from '../components/SyllabusTracker';
import { getPerformanceInsight } from '../services/geminiService';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { Trophy, Star, Award, Download, FileText, Search, Filter, ArrowLeft, Book, BookOpen, FlaskConical, Calculator, Cpu, Languages, Atom, Leaf, BarChart3, Lightbulb, Flame, Bell, Calendar, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  student: Student;
  exams: Exam[];
  onLogout: () => void;
  subjects: Subject[];
  students: Student[];
  navigate: (p: string) => void;
  resources: ResourceItem[];
  assignments: Assignment[];
  notices: Notice[];
}

const HighestScorersTree = ({ exams, students }: { exams: Exam[], students: Student[] }) => {
  const highestScorers = exams.map(exam => {
    let highestMark = -1;
    let highestStudentId = '';
    
    if (exam.marks) {
      Object.entries(exam.marks).forEach(([studentId, mark]) => {
        if (mark > highestMark) {
          highestMark = mark;
          highestStudentId = studentId;
        }
      });
    }

    const student = students.find(s => s.id === highestStudentId);
    
    return {
      examName: exam.name,
      subject: exam.subject,
      highestMark,
      totalMarks: exam.totalMarks || 100,
      studentName: student ? student.name : 'Unknown',
      date: exam.date
    };
  }).filter(h => h.highestMark > -1).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (highestScorers.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-950 via-blue-950 to-slate-950 p-4 sm:p-8 md:p-10 rounded-3xl md:rounded-[40px] shadow-2xl border border-indigo-500/30 text-white relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -mr-48 -mt-48 transition-all duration-1000 group-hover:bg-blue-500/20"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -ml-48 -mb-48 transition-all duration-1000 group-hover:bg-indigo-500/20"></div>
      
      <div className="relative z-10 flex items-center gap-4 sm:gap-6 mb-6 sm:mb-10 md:mb-12">
        <div className="p-3 sm:p-5 bg-white/5 rounded-2xl sm:rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl">
          <Trophy className="w-6 h-6 sm:w-10 sm:h-10 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
        </div>
        <div>
          <h3 className="text-xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600">Hall of Fame</h3>
          <p className="text-[10px] sm:text-xs font-bold text-indigo-300 uppercase tracking-[0.3em] mt-1 sm:mt-2">Highest Scorers Tree</p>
        </div>
      </div>

      <div className="relative pl-4 sm:pl-12 space-y-6 sm:space-y-12 before:absolute before:inset-y-0 before:left-[27px] sm:before:left-[51px] before:w-0.5 sm:before:w-1.5 before:bg-gradient-to-b before:from-yellow-500/60 before:via-blue-500/40 before:to-transparent before:rounded-full">
        {highestScorers.map((scorer, idx) => (
          <div 
            key={idx} 
            className="relative flex items-center gap-3 sm:gap-5 md:p-8 group/item animate-in slide-in-from-left-8 fade-in duration-700 fill-mode-both"
            style={{ animationDelay: `${idx * 150}ms` }}
          >
            <div className="absolute -left-7 sm:-left-14 w-5 h-5 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full border-2 sm:border-4 border-indigo-900 flex items-center justify-center shadow-[0_0_15px_rgba(250,204,21,0.5)] z-10 group-hover/item:scale-125 transition-transform duration-300">
              <Star className="w-2 h-2 sm:w-4 sm:h-4 text-indigo-900 fill-indigo-900" />
            </div>
            
            <div className="flex-1 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 p-3 sm:p-6 rounded-2xl sm:rounded-[32px] transition-all duration-300 group-hover/item:-translate-y-1 group-hover/item:shadow-[0_15px_30px_rgba(139,92,246,0.25)]">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-1.5 sm:gap-4 mb-2 sm:mb-4">
                <div>
                  <p className="text-[10px] sm:text-xs font-bold text-yellow-400 uppercase tracking-widest mb-0">{scorer.subject} • {scorer.date}</p>
                  <h4 className="text-sm sm:text-xl font-bold text-white leading-tight">{scorer.examName}</h4>
                </div>
                <div className="px-2 py-0.5 sm:px-4 sm:py-2 bg-yellow-400/10 border border-yellow-400/20 rounded-lg sm:rounded-2xl flex items-center gap-1 self-start">
                  <Award className="w-3 h-3 sm:w-5 sm:h-5 text-yellow-400" />
                  <span className="font-bold text-yellow-400 text-xs sm:text-lg">{scorer.highestMark} <span className="text-[10px] sm:text-xs text-yellow-400/60 font-bold">/ {scorer.totalMarks}</span></span>
                </div>
              </div>
              
              <div className="mt-2 sm:mt-6 flex items-center gap-2 sm:gap-4 bg-black/20 p-2 sm:p-4 rounded-xl sm:rounded-2xl border border-white/5">
                <div className="w-7 h-7 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-indigo-900 font-bold text-xs sm:text-xl shadow-lg">
                  {scorer.studentName.charAt(0)}
                </div>
                <div>
                  <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mb-0">Top Scorer</p>
                  <p className="text-xs sm:text-2xl font-bold text-white tracking-tight">{scorer.studentName}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AttendanceCalendar = ({ attendance }: { attendance: Record<string, boolean> }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthName = currentMonth.toLocaleString('default', { month: 'long' });

  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);
  const adjustedStartDay = startDay === 0 ? 6 : startDay - 1;

  const days = [];
  for (let i = 0; i < adjustedStartDay; i++) days.push(null);
  for (let i = 1; i <= totalDays; i++) days.push(i);

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const getStatus = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (attendance[dateStr] === true) return 'present';
    if (attendance[dateStr] === false) return 'absent';
    return 'none';
  };

  const currentMonthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const presentCount = Object.entries(attendance).filter(([date, v]) => date.startsWith(currentMonthPrefix) && v === true).length;
  const absentCount = Object.entries(attendance).filter(([date, v]) => date.startsWith(currentMonthPrefix) && v === false).length;

  return (
    <div className="bg-white dark:bg-slate-800 p-4 sm:p-8 md:p-10 rounded-2xl sm:rounded-[40px] shadow-xl border border-slate-100 dark:border-slate-700 space-y-4 sm:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
        <div className="space-y-0">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-tight">Attendance</h3>
          <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Phoenix Edu Care</p>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4 bg-slate-50 dark:bg-slate-900/50 p-1 sm:p-2 rounded-xl border border-slate-100 dark:border-slate-700">
          <button onClick={prevMonth} className="p-1.5 sm:p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all shadow-sm">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <span className="font-bold text-xs sm:text-sm uppercase tracking-tight text-slate-900 dark:text-white min-w-[80px] text-center">{monthName.slice(0,3)} {year}</span>
          <button onClick={nextMonth} className="p-1.5 sm:p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all shadow-sm">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, idx) => (
          <div key={`${d}-${idx}`} className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase py-1">{d}</div>
        ))}
        {days.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} />;
          const status = getStatus(day);
          return (
            <div key={day} className="aspect-square flex items-center justify-center relative group cursor-default">
              <span className={`text-xs sm:text-sm font-bold z-10 transition-colors ${status !== 'none' ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>{day}</span>
              {status === 'present' && <div className="absolute inset-0 bg-green-500 rounded-lg sm:rounded-xl shadow-lg shadow-green-500/20 transform scale-90" />}
              {status === 'absent' && <div className="absolute inset-0 bg-red-500 rounded-lg sm:rounded-xl shadow-lg shadow-red-500/20 transform scale-90" />}
              {status === 'none' && <div className="absolute inset-0 bg-slate-50 dark:bg-slate-900/50 rounded-lg sm:rounded-xl transform scale-90 opacity-0 group-hover:opacity-100 transition-opacity" />}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-4 gap-2 pt-2 sm:pt-4">
        <div className="bg-green-50 dark:bg-green-900/20 p-2 sm:p-3 rounded-xl border border-green-100 dark:border-green-800/30 flex flex-col items-center justify-center transition-transform hover:scale-105">
          <span className="text-green-600 text-[10px] sm:text-xs font-black uppercase tracking-tighter">Present</span>
          <span className="font-black text-green-700 dark:text-green-400 text-sm sm:text-xl">{presentCount}</span>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-2 sm:p-3 rounded-xl border border-red-100 dark:border-red-800/30 flex flex-col items-center justify-center transition-transform hover:scale-105">
          <span className="text-red-600 text-[10px] sm:text-xs font-black uppercase tracking-tighter">Absent</span>
          <span className="font-black text-red-700 dark:text-red-400 text-sm sm:text-xl">{absentCount}</span>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 p-2 sm:p-3 rounded-xl border border-orange-100 dark:border-orange-800/30 flex flex-col items-center justify-center transition-transform hover:scale-105">
          <span className="text-orange-600 text-[10px] sm:text-xs font-black uppercase tracking-tighter">Delay</span>
          <span className="font-black text-orange-700 dark:text-orange-400 text-sm sm:text-xl">0</span>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 sm:p-3 rounded-xl border border-blue-100 dark:border-blue-800/30 flex flex-col items-center justify-center transition-transform hover:scale-105">
          <span className="text-blue-600 text-[10px] sm:text-xs font-black uppercase tracking-tighter">Excuse</span>
          <span className="font-black text-blue-700 dark:text-blue-400 text-sm sm:text-xl">0</span>
        </div>
      </div>
    </div>
  );
};

const PaidFeesList = ({ student, subjects, onBack }: { student: Student, subjects: Subject[], onBack: () => void }) => {
  const paidItems: any[] = [];

  // Use formal feeRecords if available
  if (student.feeRecords && student.feeRecords.length > 0) {
    student.feeRecords.forEach(record => {
      const sub = subjects.find(s => s.id === record.subjectId);
      const date = new Date(record.paymentDate);
      paidItems.push({
        id: record.id,
        date,
        subjectName: sub ? sub.name : 'Unknown Subject',
        fee: record.paidAmount,
        monthLabel: record.feeType === 'Monthly' ? `${new Date(record.fromDate).toLocaleString('default', { month: 'short' })} - ${new Date(record.toDate).toLocaleString('default', { month: 'short', year: 'numeric' })}` : 'One-time',
        fullDateLabel: date.toLocaleString('default', { day: '2-digit', weekday: 'long', month: 'long', year: 'numeric' }),
        receiptNo: record.receiptNo
      });
    });
  } else {
    // Fallback to legacy derived logic
    subjects.forEach(sub => {
      const type = student.subjectPaymentTypes?.[sub.id] || sub.paymentType || 'Monthly';
      if (type === 'Monthly') {
        const payments = student.monthlyPayments?.[sub.id] || {};
        Object.entries(payments).forEach(([monthKey, status]) => {
          if (status === 'Paid') {
            const [year, month] = monthKey.split('-').map(Number);
            const date = new Date(year, month - 1, 1);
            paidItems.push({
              id: `${sub.id}-${monthKey}`,
              date,
              subjectName: sub.name,
              fee: sub.fee,
              monthLabel: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
              fullDateLabel: `01 ${date.toLocaleString('default', { weekday: 'long', month: 'long', year: 'numeric' })}`
            });
          }
        });
      } else if (student.subjectPayments?.[sub.id] === 'Paid') {
          const date = new Date(student.subjectEnrollmentDates?.[sub.id] || student.joinDate || new Date());
          paidItems.push({
              id: `${sub.id}-onetime`,
              date,
              subjectName: sub.name,
              fee: sub.fee,
              monthLabel: 'One-time',
              fullDateLabel: date.toLocaleString('default', { day: '2-digit', weekday: 'long', month: 'long', year: 'numeric' })
          });
      }
    });
  }

  paidItems.sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-all border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">My Paid Fees</h3>
      </div>
      <div className="space-y-4 md:space-y-8">
        {paidItems.map(item => (
          <div key={item.id} className="space-y-2 sm:space-y-3">
            <p className="text-xs sm:text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{item.fullDateLabel}</p>
            <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-[32px] border border-slate-100 dark:border-slate-700 flex justify-between items-center shadow-sm hover:shadow-md transition-all">
              <div className="space-y-0.5 sm:space-y-1">
                <p className="font-bold text-slate-800 dark:text-slate-100 text-base sm:text-lg">{item.subjectName}</p>
                <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                  <p className="text-xs sm:text-xs text-slate-400 font-bold">Fee {item.fee.toLocaleString()} • {item.monthLabel}</p>
                  {item.receiptNo && (
                    <>
                      <span className="hidden sm:inline text-slate-300">•</span>
                      <p className="text-xs sm:text-xs font-bold text-blue-500 uppercase">Receipt: {item.receiptNo}</p>
                    </>
                  )}
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-green-500">{item.fee.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
      {paidItems.length === 0 && (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl md:rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-800">
           <p className="text-slate-400 font-bold uppercase tracking-widest">No paid fees found</p>
        </div>
      )}
    </div>
  );
};

const StudentDashboard: React.FC<Props> = ({ student, exams, onLogout, subjects, students, navigate, resources, assignments, notices }) => {
  const [insight, setInsight] = useState<PerformanceInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'dashboard' | 'profile' | 'resources' | 'leaderboard' | 'notices' | 'syllabus'>('dashboard');
  const [showPaidFees, setShowPaidFees] = useState(false);
  const [selectedResourceSubject, setSelectedResourceSubject] = useState<{name: string, category: string} | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const getSubjectIcon = (subject: string) => {
    const s = subject.toLowerCase();
    if (s.includes('physics') || s.includes('পদার্থবিজ্ঞান')) return <Atom className="w-6 h-6" />;
    if (s.includes('chemistry') || s.includes('রসায়ন')) return <FlaskConical className="w-6 h-6" />;
    if (s.includes('math') || s.includes('গণিত')) return <Calculator className="w-6 h-6" />;
    if (s.includes('biology') || s.includes('উদ্ভিদবিজ্ঞান') || s.includes('প্রাণিবিজ্ঞান')) return <Leaf className="w-6 h-6" />;
    if (s.includes('ict') || s.includes('তথ্য')) return <Cpu className="w-6 h-6" />;
    if (s.includes('bangla') || s.includes('বাংলা')) return <BookOpen className="w-6 h-6" />;
    if (s.includes('english')) return <Languages className="w-6 h-6" />;
    return <Book className="w-6 h-6" />;
  };

  const hscSubjects = Array.from(new Set(resources.filter(r => r.category === 'HSC').map(r => r.subject))).filter(Boolean) as string[];
  const sscSubjects = Array.from(new Set(resources.filter(r => r.category === 'SSC').map(r => r.subject))).filter(Boolean) as string[];

  const filteredResources = resources.filter(res => {
    const matchesSubject = !selectedResourceSubject || (res.subject === selectedResourceSubject.name && res.category === selectedResourceSubject.category);
    const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  // Filter exams based on batch - Relaxed to always include exams where student has marks
  const studentExams = exams.filter(exam => {
    // If student has explicit marks in this exam, ALWAYS show it
    const hasMarks = exam.marks && (
      exam.marks[student.id] !== undefined || 
      Object.keys(exam.marks).some(k => k.toLowerCase() === student.id.toLowerCase())
    );
    
    if (hasMarks) return true;

    // Otherwise follow batch logic
    return !exam.batch || 
      exam.batch === 'All' || 
      exam.batch === student.batch;
  });

  const studentResults = studentExams.map(exam => {
    // Try exact match first, then case-insensitive
    let score = exam.marks ? exam.marks[student.id] : undefined;
    if (score === undefined && exam.marks) {
      const key = Object.keys(exam.marks).find(k => k.toLowerCase() === student.id.toLowerCase());
      if (key) score = exam.marks[key];
    }

    return {
      name: exam.name,
      subject: exam.subject,
      score: score,
      totalMarks: exam.totalMarks || 100,
      date: exam.date
    };
  }).filter(res => res.score !== undefined);

  // Calculate dynamic average score
  const dynamicAverageScore = studentResults.length > 0
    ? parseFloat((studentResults.reduce((acc, curr) => acc + (Number(curr.score) / curr.totalMarks), 0) / studentResults.length * 100).toFixed(1))
    : 0;

  // Calculate total exam percentage
  const totalObtained = studentResults.reduce((acc, curr) => acc + Number(curr.score), 0);
  const totalPossible = studentResults.reduce((acc, curr) => acc + curr.totalMarks, 0);
  const examPercentage = totalPossible > 0 ? parseFloat(((totalObtained / totalPossible) * 100).toFixed(1)) : 0;

  const calculateAttendancePercentage = () => {
    if (!student.dailyAttendance) return 0;
    const records = Object.values(student.dailyAttendance);
    if (records.length === 0) return 0;
    const present = records.filter(v => v === true).length;
    return parseFloat(((present / records.length) * 100).toFixed(1));
  };

  const attendancePercentage = calculateAttendancePercentage();

  // Helper for month keys
  const mKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

  // Calculate Total Paid and Total Due
  const calculateFinancials = () => {
    let totalExpected = 0;
    let paid = student.feeRecords?.reduce((acc, r) => acc + (Number(r.paidAmount) || 0), 0) || 0;

    subjects.filter(s => (student.subjects || []).includes(s.name)).forEach(sub => {
      const type = student.subjectPaymentTypes?.[sub.id] || sub.paymentType || 'Monthly';
      const fee = sub.fee || 0;

      if (type === 'One-time') {
        totalExpected += fee;
        // Fallback for legacy data without records
        if ((!student.feeRecords || student.feeRecords.length === 0) && student.subjectPayments?.[sub.id] === 'Paid') {
          paid += fee;
        }
      } else {
        // Monthly
        const enrollDate = student.subjectEnrollmentDates?.[sub.id] || student.joinDate || new Date().toISOString().split('T')[0];
        const start = new Date(enrollDate);
        const end = new Date();
        let curr = new Date(start.getFullYear(), start.getMonth(), 1);
        
        while (curr <= end) {
          totalExpected += fee;
          // Fallback for legacy data without records
          if (!student.feeRecords || student.feeRecords.length === 0) {
            const monthKey = mKey(curr);
            if (student.monthlyPayments?.[sub.id]?.[monthKey] === 'Paid') {
              paid += fee;
            }
          }
          curr.setMonth(curr.getMonth() + 1);
        }
      }
    });

    const due = Math.max(0, totalExpected - paid);

    return { paid, due };
  };

  const { paid: totalPaid, due: totalDue } = calculateFinancials();

  useEffect(() => {
    const fetchInsight = async () => {
      const data = await getPerformanceInsight(attendancePercentage, dynamicAverageScore, student.assignments);
      setInsight(data);
      setLoading(false);
    };
    fetchInsight();
  }, [student, attendancePercentage, dynamicAverageScore]);

  const statsData = [
    { subject: 'Attendance', value: attendancePercentage, full: 100 },
    { subject: 'Exam Score', value: dynamicAverageScore, full: 100 },
    { subject: 'Assignments', value: student.assignments, full: 100 },
  ];

  const sortedAttendanceDates = Object.keys(student.dailyAttendance || {}).sort().reverse().slice(0, 10);

  // Filter enrolled subjects for detailed billing
  const enrolledSubjectsWithFees = subjects.filter(s => (student.subjects || []).includes(s.name));

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-8">
      <header className="bg-white dark:bg-slate-800 p-6 sm:p-10 md:p-12 rounded-[32px] md:rounded-[48px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-100 dark:border-slate-700 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full -mr-48 -mt-48 blur-[100px] transition-all group-hover:bg-blue-500/10" />
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 lg:gap-10 relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 w-full lg:w-auto text-center sm:text-left">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl sm:rounded-[32px] bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 flex items-center justify-center text-white text-3xl sm:text-4xl font-black shadow-2xl shadow-blue-500/30 transform group-hover:rotate-6 transition-transform shrink-0 border-4 border-white/10">
              {student.name.charAt(0)}
            </div>
            <div className="min-w-0 space-y-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-slate-900 dark:text-white leading-tight uppercase">Welcome, {student.name}</h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-full border border-blue-500/20">{student.class}</span>
                <span className="px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-full border border-indigo-500/20">Science</span>
                <span className="px-3 py-1 bg-slate-500/10 text-slate-600 dark:text-slate-400 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-full border border-slate-500/20">{student.batch || 'No Batch'}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-stretch sm:items-end gap-6 w-full lg:w-auto">
            <div className="flex gap-3 sm:gap-4 w-full sm:w-auto">
              <div 
                onClick={() => setShowPaidFees(true)}
                className="flex-1 sm:flex-none bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 p-4 sm:p-5 rounded-2xl sm:rounded-3xl sm:w-44 cursor-pointer hover:shadow-xl hover:shadow-green-500/10 transition-all group/stat"
              >
                <p className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em] mb-1">Paid Amount</p>
                <p className="text-xl sm:text-2xl font-black text-green-700 dark:text-green-400">{totalPaid} <span className="text-xs opacity-60">BDT</span></p>
              </div>
              <div className="flex-1 sm:flex-none bg-gradient-to-br from-red-500/10 to-rose-500/5 border border-red-500/20 p-4 sm:p-5 rounded-2xl sm:rounded-3xl sm:w-44 shadow-sm">
                <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] mb-1">Due Amount</p>
                <p className="text-xl sm:text-2xl font-black text-red-700 dark:text-red-400">{totalDue} <span className="text-xs opacity-60">BDT</span></p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
              <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl sm:rounded-3xl shadow-inner border border-slate-200/50 dark:border-slate-800/50 overflow-x-auto no-scrollbar">
                <button onClick={() => setActiveView('dashboard')} className={`whitespace-nowrap px-5 sm:px-8 py-2.5 sm:py-2.5 text-xs sm:text-sm font-black rounded-lg sm:rounded-2xl transition-all uppercase tracking-widest ${activeView === 'dashboard' ? 'bg-white dark:bg-slate-700 shadow-xl text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>DASH</button>
                <button onClick={() => setActiveView('leaderboard')} className={`whitespace-nowrap px-5 sm:px-8 py-2.5 sm:py-2.5 text-xs sm:text-sm font-black rounded-lg sm:rounded-2xl transition-all uppercase tracking-widest ${activeView === 'leaderboard' ? 'bg-white dark:bg-slate-700 shadow-xl text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>LEAD</button>
                <button onClick={() => setActiveView('notices')} className={`whitespace-nowrap px-5 sm:px-8 py-2.5 sm:py-2.5 text-xs sm:text-sm font-black rounded-lg sm:rounded-2xl transition-all uppercase tracking-widest ${activeView === 'notices' ? 'bg-white dark:bg-slate-700 shadow-xl text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>NOTICE</button>
                <button onClick={() => setActiveView('syllabus')} className={`whitespace-nowrap px-5 sm:px-8 py-2.5 sm:py-2.5 text-xs sm:text-sm font-black rounded-lg sm:rounded-2xl transition-all uppercase tracking-widest ${activeView === 'syllabus' ? 'bg-white dark:bg-slate-700 shadow-xl text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>SYLLABUS</button>
                <button onClick={() => setActiveView('resources')} className={`whitespace-nowrap px-5 sm:px-8 py-2.5 sm:py-2.5 text-xs sm:text-sm font-black rounded-lg sm:rounded-2xl transition-all uppercase tracking-widest ${activeView === 'resources' ? 'bg-white dark:bg-slate-700 shadow-xl text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>RES</button>
                <button onClick={() => setActiveView('profile')} className={`whitespace-nowrap px-5 sm:px-8 py-2.5 sm:py-2.5 text-xs sm:text-sm font-black rounded-lg sm:rounded-2xl transition-all uppercase tracking-widest ${activeView === 'profile' ? 'bg-white dark:bg-slate-700 shadow-xl text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>PROF</button>
              </div>
              
              <button 
                onClick={onLogout}
                className="px-6 py-3 sm:px-6 sm:py-2.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-xl sm:rounded-3xl font-black text-xs sm:text-sm hover:bg-red-600 hover:text-white transition-all active:scale-95 shadow-xl shadow-slate-500/20 uppercase tracking-widest shrink-0"
              >
                OUT
              </button>
            </div>
          </div>
        </div>
      </header>

      {showPaidFees ? (
        <div className="max-w-3xl mx-auto py-4">
          <PaidFeesList 
            student={student} 
            subjects={subjects} 
            onBack={() => setShowPaidFees(false)} 
          />
        </div>
      ) : activeView === 'dashboard' ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <section className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl sm:rounded-[40px] shadow-xl p-4 sm:p-8 md:p-10 border border-slate-100 dark:border-slate-700 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-3xl transition-all group-hover:bg-blue-500/10" />
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 md:gap-10 items-center sm:items-start relative z-10">
                <div className="flex-1 space-y-4 sm:space-y-6 w-full">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                      <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]" strokeWidth={2.5} />
                    </div>
                    <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Performance Insight</h2>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl flex items-center justify-center text-white shadow-lg animate-pulse" style={{ backgroundColor: insight?.color || '#ccc', boxShadow: `0 8px 24px ${insight?.color}44` }}>
                      {loading ? '...' : (insight?.status === 'Excellent' ? <Star className="w-6 h-6 sm:w-10 sm:h-10 fill-white" strokeWidth={2} /> : <Lightbulb className="w-6 h-6 sm:w-10 sm:h-10 fill-white" strokeWidth={2} />)}
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs font-bold uppercase text-slate-400 tracking-[0.2em]">AI Status</p>
                      <p className="text-lg sm:text-3xl font-black" style={{ color: insight?.color }}>{loading ? '...' : insight?.status}</p>
                    </div>
                  </div>
                  <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl sm:rounded-3xl italic text-slate-600 dark:text-slate-400 border-l-4 border-orange-500 font-medium leading-relaxed text-sm sm:text-base shadow-inner">
                    "{loading ? '...' : insight?.message}"
                  </div>
                </div>
                <div className="w-full sm:w-[240px] lg:w-[280px] aspect-square bg-slate-50 dark:bg-slate-900/30 rounded-2xl sm:rounded-3xl md:rounded-[40px] p-2 sm:p-4 shadow-inner border border-slate-100 dark:border-slate-800">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={statsData}>
                      <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                      <Radar name="Student" dataKey="value" stroke="#3b82f6" strokeWidth={2} fill="#3b82f6" fillOpacity={0.5} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-[40px] shadow-xl border border-slate-100 dark:border-slate-700 flex flex-col justify-center items-center space-y-4">
              <div className="relative w-32 h-32 sm:w-48 sm:h-48 md:w-56 md:h-56">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle className="text-slate-100 dark:text-slate-700 stroke-current" strokeWidth="8" fill="transparent" r="42" cx="50" cy="50" />
                  <circle className="text-blue-600 stroke-current transition-all duration-1000 ease-out" strokeWidth="8" strokeDasharray={`${examPercentage * 2.63}, 263.8`} strokeLinecap="round" fill="transparent" r="42" cx="50" cy="50" transform="rotate(-90 50 50)" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl sm:text-4xl md:text-5xl font-black text-blue-600 tracking-tighter">{examPercentage}%</span>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Avg</span>
                </div>
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm sm:text-lg font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">Marks %</p>
                <p className="text-xs sm:text-sm font-bold text-slate-400">{studentResults.length} exams recorded</p>
              </div>
            </div>
          </div>

          {/* Attendance Tracker */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <AttendanceCalendar attendance={student.dailyAttendance || {}} />
            <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-[40px] shadow-xl border border-slate-100 dark:border-slate-700 flex flex-col justify-center items-center space-y-4">
              <div className="relative w-32 h-32 sm:w-48 sm:h-48 md:w-56 md:h-56">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle className="text-slate-100 dark:text-slate-700 stroke-current" strokeWidth="8" fill="transparent" r="42" cx="50" cy="50" />
                  <circle className="text-indigo-600 stroke-current transition-all duration-1000 ease-out" strokeWidth="8" strokeDasharray={`${attendancePercentage * 2.63}, 251.2`} strokeLinecap="round" fill="transparent" r="42" cx="50" cy="50" transform="rotate(-90 50 50)" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl sm:text-4xl md:text-5xl font-black text-indigo-600 tracking-tighter">{attendancePercentage}%</span>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Attendance</span>
                </div>
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm sm:text-lg font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">Presence Rate</p>
                <p className="text-xs sm:text-sm font-bold text-slate-400">{Object.keys(student.dailyAttendance || {}).length} days tracked</p>
              </div>
            </div>
          </section>

          {/* Assignments & Notifications */}
          {assignments.filter(a => 
            (a.batch === 'All' || a.batch === student.batch) && 
            (!a.subject || student.subjects?.includes(a.subject))
          ).length > 0 && (
            <section className="bg-white dark:bg-slate-800 p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-[40px] shadow-xl border border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Assignments & Notifications</h3>
                </div>
                <span className="px-3 py-1 sm:px-4 sm:py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 text-[10px] sm:text-xs font-black rounded-full uppercase tracking-widest border border-blue-100 dark:border-blue-800">
                  {assignments.filter(a => (a.batch === 'All' || a.batch === student.batch) && (!a.subject || student.subjects?.includes(a.subject))).length} New
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assignments
                  .filter(a => (a.batch === 'All' || a.batch === student.batch) && (!a.subject || student.subjects?.includes(a.subject)))
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 6)
                  .map(assignment => (
                  <div key={assignment.id} className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-500/30 transition-colors group">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">{assignment.title}</h4>
                      {assignment.dueDate && (
                        <span className="text-[10px] font-bold px-2 py-1 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-md whitespace-nowrap">
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">{assignment.description}</p>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span className="px-2 py-1 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">{assignment.subject || 'General'}</span>
                      <div className="flex flex-col items-end">
                        <span className={student.assignmentSubmissions?.find(s => s.assignmentId === assignment.id)?.status === 'Submitted' ? 'text-green-500' : 'text-orange-500'}>
                          {student.assignmentSubmissions?.find(s => s.assignmentId === assignment.id)?.status || 'Pending'}
                        </span>
                        {student.assignmentSubmissions?.find(s => s.assignmentId === assignment.id)?.marks !== undefined && (
                          <span className="text-blue-500">Marks: {student.assignmentSubmissions?.find(s => s.assignmentId === assignment.id)?.marks} / {assignment.totalMarks}</span>
                        )}
                        {student.assignmentSubmissions?.find(s => s.assignmentId === assignment.id)?.marks === undefined && (
                          <span>{assignment.totalMarks} Marks</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Results Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-4 sm:p-8 md:p-10 rounded-2xl sm:rounded-[40px] shadow-xl border border-slate-100 dark:border-slate-700">
               <div className="flex items-center justify-between mb-6 sm:mb-8">
                 <h3 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Exam Results</h3>
                 <span className="px-3 py-1 sm:px-4 sm:py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 text-[10px] sm:text-xs font-black rounded-full uppercase tracking-widest border border-blue-100 dark:border-blue-800">Latest</span>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <tbody className="divide-y dark:divide-slate-700">
                     {studentResults.map((res, i) => (
                       <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors group">
                         <td className="py-4 font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{res.name}</td>
                         <td className="py-4 text-xs sm:text-sm text-slate-500 font-medium">{res.subject}</td>
                         <td className="py-4 text-right font-black text-blue-600 text-sm sm:text-lg">
                           {res.score} <span className="text-[10px] sm:text-xs text-slate-400 font-bold">/ {res.totalMarks}</span>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-red-600 p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-[40px] shadow-2xl text-white space-y-6 sm:space-y-8 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-all duration-700" />
               <div className="relative z-10 space-y-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white shadow-xl">
                  <BookOpen size={32} />
                </div>
                 <h3 className="text-xl sm:text-2xl font-black tracking-tight uppercase">Resources</h3>
                 <p className="text-sm sm:text-base font-medium opacity-90 leading-relaxed">Download lecture sheets, notes, and previous questions.</p>
               </div>
               <button 
                 onClick={() => setActiveView('resources')}
                 className="w-full py-4 sm:py-5 bg-gradient-to-r from-white to-slate-100 text-orange-600 font-black rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 relative z-10 text-xs sm:text-sm uppercase tracking-widest border border-white/20"
               >
                 Explore Library
               </button>
            </div>
          </div>

          {/* Highest Scorers Tree */}
          <HighestScorersTree exams={exams} students={students} />
        </>
      ) : activeView === 'leaderboard' ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-yellow-500/10 rounded-3xl border border-yellow-500/20">
                <Trophy className="w-8 h-8 text-yellow-500" />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Batch Leaderboard</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Ranking for {student.batch || 'Unassigned Batch'}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Top 3 Podium */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
              {students
                .filter(s => (s.batch || 'Unassigned') === (student.batch || 'Unassigned'))
                .map(s => {
                  const studentExams = exams.filter(e => e.marks[s.id] !== undefined);
                  const avgExamScore = studentExams.length > 0 
                    ? studentExams.reduce((acc, e) => acc + (e.marks[s.id] / (e.totalMarks || 100)) * 100, 0) / studentExams.length 
                    : 0;
                  
                  const studentAssignments = assignments.filter(a => s.assignmentSubmissions?.some(sub => sub.assignmentId === a.id && sub.status === 'Submitted'));
                  const avgAssignmentScore = studentAssignments.length > 0
                    ? studentAssignments.reduce((acc, a) => {
                        const sub = s.assignmentSubmissions?.find(sub => sub.assignmentId === a.id);
                        return acc + ((sub?.marks || 0) / (a.totalMarks || 100)) * 100;
                      }, 0) / studentAssignments.length
                    : 0;

                  const performance = (avgExamScore * 0.4) + (avgAssignmentScore * 0.4) + (s.attendance * 0.2);
                  return { ...s, performance, avgExamScore, avgAssignmentScore };
                })
                .sort((a, b) => b.performance - a.performance)
                .slice(0, 3)
                .map((s, idx) => (
                  <motion.div 
                    key={s.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`relative p-8 rounded-[40px] border-2 transition-all hover:-translate-y-2 ${
                      idx === 0 ? 'bg-gradient-to-br from-yellow-500 to-orange-600 border-yellow-400 shadow-2xl shadow-yellow-500/20 text-white' :
                      idx === 1 ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xl' :
                      'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xl'
                    }`}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 shadow-xl flex items-center justify-center border-4 border-slate-50 dark:border-slate-800">
                      <span className={`text-xl font-black ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-slate-400' : 'text-orange-400'}`}>
                        {idx + 1}
                      </span>
                    </div>
                    <div className="flex flex-col items-center text-center space-y-4 pt-4">
                      <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-2xl font-black shadow-inner ${idx === 0 ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'}`}>
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className={`text-xl font-black tracking-tight ${idx === 0 ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{s.name}</h4>
                        <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${idx === 0 ? 'text-white/60' : 'text-slate-400'}`}>Rank {idx + 1}</p>
                      </div>
                      <div className="w-full grid grid-cols-2 gap-2">
                        <div className={`p-3 rounded-2xl ${idx === 0 ? 'bg-white/10' : 'bg-slate-50 dark:bg-slate-900/50'}`}>
                          <p className={`text-[8px] font-black uppercase tracking-widest mb-1 ${idx === 0 ? 'text-white/60' : 'text-slate-400'}`}>Exam</p>
                          <p className={`text-sm font-black ${idx === 0 ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{Math.round(s.avgExamScore)}%</p>
                        </div>
                        <div className={`p-3 rounded-2xl ${idx === 0 ? 'bg-white/10' : 'bg-slate-50 dark:bg-slate-900/50'}`}>
                          <p className={`text-[8px] font-black uppercase tracking-widest mb-1 ${idx === 0 ? 'text-white/60' : 'text-slate-400'}`}>Index</p>
                          <p className={`text-sm font-black ${idx === 0 ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{Math.round(s.performance)}%</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>

            {/* Detailed List */}
            <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-[40px] border border-slate-100 dark:border-slate-700 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b dark:border-slate-700">
                      <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Rank</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Student</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Attendance</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Avg. Exam</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Avg. Assignment</th>
                      <th className="px-10 py-6 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Index</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-slate-700">
                    {students
                      .filter(s => (s.batch || 'Unassigned') === (student.batch || 'Unassigned'))
                      .map(s => {
                        const studentExams = exams.filter(e => e.marks[s.id] !== undefined);
                        const avgExamScore = studentExams.length > 0 
                          ? studentExams.reduce((acc, e) => acc + (e.marks[s.id] / (e.totalMarks || 100)) * 100, 0) / studentExams.length 
                          : 0;
                        
                        const studentAssignments = assignments.filter(a => s.assignmentSubmissions?.some(sub => sub.assignmentId === a.id && sub.status === 'Submitted'));
                        const avgAssignmentScore = studentAssignments.length > 0
                          ? studentAssignments.reduce((acc, a) => {
                              const sub = s.assignmentSubmissions?.find(sub => sub.assignmentId === a.id);
                              return acc + ((sub?.marks || 0) / (a.totalMarks || 100)) * 100;
                            }, 0) / studentAssignments.length
                          : 0;

                        const performance = (avgExamScore * 0.4) + (avgAssignmentScore * 0.4) + (s.attendance * 0.2);
                        return { ...s, performance, avgExamScore, avgAssignmentScore };
                      })
                      .sort((a, b) => b.performance - a.performance)
                      .slice(3)
                      .map((s, i) => (
                        <tr key={s.id} className={`hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all group ${s.id === student.id ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                          <td className="px-10 py-6">
                            <span className="text-lg font-black text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">#{i + 4}</span>
                          </td>
                          <td className="px-10 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 border dark:border-slate-700 flex items-center justify-center text-slate-400 font-black">
                                {s.name.charAt(0)}
                              </div>
                              <span className="font-bold text-slate-900 dark:text-white tracking-tight">{s.name} {s.id === student.id && <span className="ml-2 text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">You</span>}</span>
                            </div>
                          </td>
                          <td className="px-10 py-6">
                            <span className="text-sm font-bold text-blue-500">{s.attendance}%</span>
                          </td>
                          <td className="px-10 py-6">
                            <span className="text-sm font-bold text-orange-500">{Math.round(s.avgExamScore)}%</span>
                          </td>
                          <td className="px-10 py-6">
                            <span className="text-sm font-bold text-green-500">{Math.round(s.avgAssignmentScore)}%</span>
                          </td>
                          <td className="px-10 py-6 text-right">
                            <span className="px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-xl text-xs font-black text-slate-900 dark:text-white">{Math.round(s.performance)}</span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : activeView === 'notices' ? (
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[40px] shadow-xl border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-orange-500/10 rounded-2xl">
                <Bell className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Notice Board</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Important announcements and class schedules</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {notices
                .filter(n => n.batch === 'All' || n.batch === student.batch)
                .length === 0 ? (
                  <div className="md:col-span-2 text-center py-20">
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No notices for your batch yet</p>
                  </div>
                ) : (
                  notices
                    .filter(n => n.batch === 'All' || n.batch === student.batch)
                    .map(notice => (
                      <motion.div 
                        key={notice.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4 relative overflow-hidden group"
                      >
                        <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
                        <div className="flex justify-between items-start">
                          <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${notice.type === 'Announcement' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'}`}>
                            {notice.type}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {new Date(notice.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{notice.subject}</h4>
                        <div className="grid grid-cols-2 gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-orange-500" />
                            <span>{notice.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-orange-500" />
                            <span>{notice.time}</span>
                          </div>
                        </div>
                        {notice.note && (
                          <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <p className="text-xs text-slate-600 dark:text-slate-400 italic">"{notice.note}"</p>
                          </div>
                        )}
                      </motion.div>
                    ))
                )}
            </div>
          </div>
        </section>
      ) : activeView === 'syllabus' ? (
        <SyllabusTracker 
          role={UserRole.STUDENT} 
          currentUser={student} 
          batches={[student.batch || 'Unassigned']} 
        />
      ) : activeView === 'resources' ? (
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[40px] shadow-xl border border-slate-100 dark:border-slate-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  {selectedResourceSubject && (
                    <button 
                      onClick={() => setSelectedResourceSubject(null)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-all"
                    >
                      <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
                    </button>
                  )}
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    {selectedResourceSubject ? `${selectedResourceSubject.name} (${selectedResourceSubject.category})` : 'Resource Library'}
                  </h3>
                </div>
                <p className="text-slate-500 font-medium">
                  {selectedResourceSubject ? 'Browse available materials for this subject.' : 'Access curated study materials for your success.'}
                </p>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search notes..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-6 py-3.5 bg-slate-100 dark:bg-slate-900 border-none rounded-2xl text-sm font-bold focus:ring-2 ring-blue-500/20 w-64"
                />
              </div>
            </div>
          </div>

          {!selectedResourceSubject ? (
            <div className="space-y-12">
              {/* HSC Section */}
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest border-l-4 border-blue-600 pl-4">HSC</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {hscSubjects.map(sub => (
                    <motion.button
                      key={`hsc-${sub}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedResourceSubject({ name: sub, category: 'HSC' })}
                      className="flex items-center gap-4 p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all text-left group"
                    >
                      <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        {getSubjectIcon(sub)}
                      </div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{sub}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* SSC Section */}
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest border-l-4 border-emerald-600 pl-4">SSC</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sscSubjects.map(sub => (
                    <motion.button
                      key={`ssc-${sub}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedResourceSubject({ name: sub, category: 'SSC' })}
                      className="flex items-center gap-4 p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all text-left group"
                    >
                      <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        {getSubjectIcon(sub)}
                      </div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{sub}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((res) => (
                <motion.div 
                  key={res.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all group"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <FileText size={28} />
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${res.category === 'SSC' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                        {res.category}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 mt-1">{res.size}</span>
                    </div>
                  </div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2 line-clamp-2">{res.title}</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">{res.subject}</p>
                  <a 
                    href={res.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full py-4 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all"
                  >
                    <Download size={16} />
                    Download Resource
                  </a>
                </motion.div>
              ))}
              {filteredResources.length === 0 && (
                <div className="col-span-full py-20 text-center bg-white dark:bg-slate-800 rounded-[40px] border border-dashed border-slate-200 dark:border-slate-700">
                  <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Filter className="text-slate-300" size={32} />
                  </div>
                  <h4 className="text-xl font-bold text-slate-400">No resources match your filters.</h4>
                  <p className="text-slate-500 mt-2">Try adjusting your search query.</p>
                </div>
              )}
            </div>
          )}
        </section>
      ) : (
        <section className="bg-white dark:bg-slate-800 p-5 sm:p-8 md:p-10 rounded-2xl md:rounded-[40px] shadow-xl border border-slate-100 dark:border-slate-700 space-y-6 md:space-y-12 animate-in fade-in slide-in-from-bottom-2">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-12 md:p-12">
              <div className="space-y-4">
                 <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest border-l-4 border-blue-600 pl-3">Personal Details</h3>
                 <div className="space-y-3 text-sm sm:text-lg text-slate-700 dark:text-slate-300">
                    <p className="flex flex-col"><b>Name:</b> <span className="truncate font-medium">{student.name}</span></p>
                    <p className="flex flex-col"><b>DOB:</b> <span className="font-medium">{student.dob || 'N/A'}</span></p>
                    <p className="flex flex-col"><b>Address:</b> <span className="font-medium">{student.address || 'N/A'}</span></p>
                    <p className="flex flex-col"><b>Phone:</b> <span className="font-medium">{student.ownPhone || student.phone}</span></p>
                 </div>
              </div>
              <div className="space-y-4">
                 <h3 className="text-sm font-bold text-orange-500 uppercase tracking-widest border-l-4 border-orange-500 pl-3">Academic Info</h3>
                 <div className="space-y-3 text-sm sm:text-lg p-4 sm:p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl sm:rounded-3xl text-slate-700 dark:text-slate-300">
                    <p className="flex flex-col"><b>Class:</b> <span className="font-medium">{student.class}</span></p>
                    <p className="flex flex-col"><b>Roll:</b> <span className="font-medium">{student.sscRoll || 'N/A'}</span></p>
                    <p className="flex flex-col"><b>Reg:</b> <span className="font-medium">{student.sscReg || 'N/A'}</span></p>
                    <p className="flex flex-col"><b>Email:</b> <span className="truncate text-xs font-medium">{student.email}</span></p>
                 </div>
                 
                 <div className="mt-4 space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current Standing</h4>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                       <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Avg</p>
                          <p className="text-lg sm:text-2xl font-black text-blue-700">{examPercentage}%</p>
                       </div>
                       <div className="p-3 sm:p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                          <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Atten</p>
                          <p className="text-lg sm:text-2xl font-black text-indigo-700">{attendancePercentage}%</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Granular Payment Detailed View */}
           <div className="space-y-3">
              <h3 className="text-xs sm:text-xl font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">Tuition Fees</h3>
              <div className="grid gap-2 md:gap-6">
                 {enrolledSubjectsWithFees.map(sub => {
                   const type = student.subjectPaymentTypes?.[sub.id] || sub.paymentType || 'Monthly';
                   const enrollDate = student.subjectEnrollmentDates?.[sub.id] || student.joinDate || new Date().toISOString().split('T')[0];
                   const start = new Date(enrollDate);
                   const end = new Date();
                   let months: { label: string, key: string, status: 'Paid' | 'Due' }[] = [];

                   if (type === 'Monthly') {
                     let curr = new Date(start.getFullYear(), start.getMonth(), 1);
                     while (curr <= end) {
                       const key = mKey(curr);
                       months.push({
                         label: curr.toLocaleString('default', { month: 'short', year: 'numeric' }),
                         key,
                         status: student.monthlyPayments?.[sub.id]?.[key] || 'Due'
                       });
                       curr.setMonth(curr.getMonth() + 1);
                     }
                   }

                   return (
                     <div key={sub.id} className="bg-slate-50 dark:bg-slate-900/50 rounded-xl md:rounded-[32px] border dark:border-slate-700 overflow-hidden group hover:border-blue-500/30 transition-all">
                        <div className="p-2.5 flex flex-row items-center justify-between border-b dark:border-slate-700">
                          <div className="flex items-center gap-2">
                            <span className="text-base sm:text-3xl">{sub.icon}</span>
                            <div>
                              <p className="font-bold text-sm sm:text-lg text-slate-900 dark:text-white leading-tight">{sub.name}</p>
                              <div className="flex items-center gap-1">
                                <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">
                                  {type}
                                </p>
                                <span className="text-[10px] text-slate-300">•</span>
                                <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">
                                  {sub.fee} BDT
                                </p>
                              </div>
                            </div>
                          </div>
                          {type === 'One-time' && (
                            <div className={`px-2 py-1 rounded-md font-bold text-[10px] sm:text-xs uppercase tracking-widest ${student.subjectPayments?.[sub.id] === 'Paid' ? 'bg-green-500 text-white' : 'bg-red-100 text-red-600'}`}>
                              {student.subjectPayments?.[sub.id] || 'Due'}
                            </div>
                          )}
                        </div>
                        
                        {type === 'Monthly' && (
                          <div className="p-2.5 bg-white dark:bg-slate-800/50">
                            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">History</p>
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                              {months.map(m => (
                                <div key={m.key} className={`p-2 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${m.status === 'Paid' ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'}`}>
                                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{m.label.split(' ')[0]}</p>
                                  <p className={`text-[10px] font-bold uppercase tracking-widest ${m.status === 'Paid' ? 'text-green-600' : 'text-red-600'}`}>{m.status}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                     </div>
                   );
                 })}
                 {enrolledSubjectsWithFees.length === 0 && <p className="text-center p-4 text-slate-400 font-bold text-[10px]">No active enrollments found.</p>}
              </div>
           </div>

           <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
              <p className="text-[10px] sm:text-sm italic text-blue-800 dark:text-blue-300">Note: All payments are tracked per semester or monthly cycle.</p>
           </div>
        </section>
      )}
    </div>
  );
};

export default StudentDashboard;
