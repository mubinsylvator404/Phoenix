import React, { useState, useEffect } from 'react';
import { Student, Subject, Teacher, Exam, UserRole, ResourceItem, Assignment, AssignmentSubmission, Notice } from '../types';
import SyllabusTracker from '../components/SyllabusTracker';
import { Download, FileText, Search, Filter, ArrowLeft, Book, BookOpen, FlaskConical, Calculator, Cpu, Languages, Atom, Leaf, LogOut, Users, Pencil, Trash2, X, User, Check, Award, ClipboardList, FileDown, ImageIcon, Plus, LayoutDashboard, Menu, Bell, Calendar, Clock, Scan } from 'lucide-react';
import { motion } from 'motion/react';

interface TeacherDashboardProps {
  teacher: Teacher;
  teachers?: Teacher[];
  onLogout: () => void;
  subjects: Subject[];
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  exams: Exam[];
  setExams: React.Dispatch<React.SetStateAction<Exam[]>>;
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
  deleteExam: (id: string) => void;
  navigate: (p: string) => void;
  resources: ResourceItem[];
  assignments: Assignment[];
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
  notices: Notice[];
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ 
  teacher, teachers = [], onLogout, subjects, students, setStudents, exams, setExams, setTeachers, deleteExam, navigate, resources, assignments, setAssignments, notices
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [enteringMarksFor, setEnteringMarksFor] = useState<Exam | null>(null);
  const [localMarks, setLocalMarks] = useState<Record<string, string>>({});
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [examBatchFilter, setExamBatchFilter] = useState<string>('All');
  
  // Assignment State
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [viewingAssignmentSubmissions, setViewingAssignmentSubmissions] = useState<Assignment | null>(null);
  const [assignmentForm, setAssignmentForm] = useState<Omit<Assignment, 'id' | 'createdAt'>>({
    title: '',
    subject: '',
    batch: 'All',
    dueDate: new Date().toISOString().split('T')[0],
    totalMarks: 100,
    description: ''
  });
  const [submissionMarks, setSubmissionMarks] = useState<Record<string, { marks: number, status: 'Submitted' | 'Pending' }>>({});
  const [leaderboardBatchFilter, setLeaderboardBatchFilter] = useState<string>('All');

  const handleAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAssignment) {
      setAssignments(prev => prev.map(a => a.id === editingAssignment.id ? { ...editingAssignment, ...assignmentForm } : a));
      alert("Assignment updated successfully.");
    } else {
      const newAssignment: Assignment = {
        id: crypto.randomUUID(),
        ...assignmentForm,
        createdAt: new Date().toISOString()
      };
      setAssignments(prev => [...prev, newAssignment]);
      alert("Assignment published successfully.");
    }
    setIsAssignmentModalOpen(false);
    setEditingAssignment(null);
    setAssignmentForm({
      title: '',
      subject: '',
      batch: 'All',
      dueDate: new Date().toISOString().split('T')[0],
      totalMarks: 100,
      description: ''
    });
  };

  const deleteAssignment = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) return;
    setAssignments(prev => prev.filter(a => a.id !== id));
  };

  const saveAssignmentMarks = (assignmentId: string) => {
    setStudents(prev => prev.map(student => {
      const sub = submissionMarks[student.id];
      if (!sub) return student;

      const existingSubmissions = student.assignmentSubmissions || [];
      const otherSubmissions = existingSubmissions.filter(s => s.assignmentId !== assignmentId);
      
      const newSubmission: AssignmentSubmission = {
        id: crypto.randomUUID(),
        assignmentId,
        studentId: student.id,
        status: sub.status,
        marks: sub.marks,
        submittedAt: new Date().toISOString()
      };

      return {
        ...student,
        assignmentSubmissions: [...otherSubmissions, newSubmission]
      };
    }));
    setViewingAssignmentSubmissions(null);
    setSubmissionMarks({});
    alert("Assignment marks and statuses saved successfully.");
  };

  const [resourceCategory, setResourceCategory] = useState<'SSC' | 'HSC'>('SSC');
  const [selectedResourceSubject, setSelectedResourceSubject] = useState<string>('All');
  const [resourceSearchQuery, setResourceSearchQuery] = useState('');

  const filteredResources = resources.filter(res => {
    const matchesCategory = res.category === resourceCategory;
    const matchesSubject = selectedResourceSubject === 'All' || res.subject === selectedResourceSubject;
    const matchesSearch = res.title.toLowerCase().includes(resourceSearchQuery.toLowerCase());
    return matchesCategory && matchesSubject && matchesSearch;
  });

  const getSubjectIcon = (subject: string) => {
    const s = subject.toLowerCase();
    if (s.includes('physics') || s.includes('পদার্থবিজ্ঞান')) return <Atom size={24} />;
    if (s.includes('chemistry') || s.includes('রসায়ন')) return <FlaskConical size={24} />;
    if (s.includes('biology') || s.includes('উদ্ভিদবিজ্ঞান') || s.includes('প্রাণিবিজ্ঞান') || s.includes('জীব বিজ্ঞান')) return <Leaf size={24} />;
    if (s.includes('math') || s.includes('গণিত')) return <Calculator size={24} />;
    if (s.includes('ict') || s.includes('তথ্য')) return <Cpu size={24} />;
    if (s.includes('english')) return <Languages size={24} />;
    if (s.includes('bangla') || s.includes('বাংলা')) return <Book size={24} />;
    return <BookOpen size={24} />;
  };
  
  // Profile Management
  const [profileForm, setProfileForm] = useState({
    name: teacher.name || '',
    subject: teacher.subject || '',
    qualification: teacher.qualification || '',
    experience: teacher.experience || '',
    image: teacher.image || '',
    education: teacher.education || '',
    profileType: teacher.profileType || 'text',
    profileContent: teacher.profileContent || ''
  });

  useEffect(() => {
    setProfileForm({
      name: teacher.name || '',
      subject: teacher.subject || '',
      qualification: teacher.qualification || '',
      experience: teacher.experience || '',
      image: teacher.image || '',
      education: teacher.education || '',
      profileType: teacher.profileType || 'text',
      profileContent: teacher.profileContent || ''
    });
  }, [teacher]);
  
  // Attendance Management
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, boolean>>({});
  const [selectedBatch, setSelectedBatch] = useState<string>('All');

  const [examForm, setExamForm] = useState({ 
    name: '', 
    subject: '', 
    date: new Date().toISOString().split('T')[0],
    totalMarks: 100
  });

  // Filter subjects assigned to this teacher
  const assignedSubjects = React.useMemo(() => {
    const filtered = subjects.filter(s => {
      const teachers = s.assignedTeachers || [];
      return teachers.some(id => String(id) === String(teacher.id));
    });
    console.log(`[TeacherDashboard] Assigned Subjects for ${teacher.name}:`, filtered.map(s => s.name));
    return filtered;
  }, [subjects, teacher.id, teacher.name]);

  const assignedSubjectNames = React.useMemo(() => assignedSubjects.map(s => s.name), [assignedSubjects]);
  const assignedSubjectIds = React.useMemo(() => assignedSubjects.map(s => s.id), [assignedSubjects]);

  // Filter students enrolled in teacher's subjects
  const myStudents = React.useMemo(() => {
    const filtered = students.filter(s => {
      if (!s.isVerified) return false;
      const studentSubjects = s.subjects || [];
      return studentSubjects.some(sub => 
        assignedSubjectNames.includes(sub) || 
        assignedSubjectIds.includes(sub)
      );
    });
    console.log(`[TeacherDashboard] My Students count:`, filtered.length);
    return filtered;
  }, [students, assignedSubjectNames, assignedSubjectIds]);
  
  // Get unique batches from my students
  const batches = React.useMemo(() => Array.from(new Set(myStudents.map(s => s.batch || 'Unassigned'))).sort(), [myStudents]);

  // Filter students by selected batch
  const filteredStudents = React.useMemo(() => selectedBatch === 'All' 
    ? myStudents 
    : myStudents.filter(s => (s.batch || 'Unassigned') === selectedBatch), [selectedBatch, myStudents]);

  // Filter exams for teacher's subjects
  const myExams = React.useMemo(() => exams.filter(e => assignedSubjectNames.includes(e.subject)), [exams, assignedSubjectNames]);

  useEffect(() => {
    if (assignedSubjectNames.length > 0 && !examForm.subject) {
      setExamForm(prev => ({ ...prev, subject: assignedSubjectNames[0] }));
    }
  }, [assignedSubjectNames]);

  // Sync Attendance list based on date selection
  useEffect(() => {
    const newMap: Record<string, boolean> = {};
    myStudents.forEach(s => {
      if (s.dailyAttendance && s.dailyAttendance[attendanceDate] !== undefined) {
        newMap[s.id] = s.dailyAttendance[attendanceDate];
      } else {
        newMap[s.id] = false;
      }
    });
    setAttendanceMap(newMap);
  }, [attendanceDate, myStudents]);

  const toggleAttendance = (studentId: string) => {
    setAttendanceMap(prev => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  const submitAttendance = async () => {
    // Prepare bulk updates
    const updates = myStudents
      .filter(s => attendanceMap.hasOwnProperty(s.id))
      .map(s => {
        const status = attendanceMap[s.id];
        const newDailyAttendance = { ...(s.dailyAttendance || {}), [attendanceDate]: status };
        const totalDays = Object.keys(newDailyAttendance).length;
        const presentDays = Object.values(newDailyAttendance).filter(val => val === true).length;
        const newPercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;
        const formattedPercentage = parseFloat(newPercentage.toFixed(1));

        return {
          id: s.id,
          daily_attendance: newDailyAttendance,
          attendance: formattedPercentage
        };
      });

    if (updates.length === 0) return;

    try {
      const response = await fetch('/api/students/bulk-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const result = await response.json();
          if (result.success) {
            // Update locally
            setStudents(prev => prev.map(item => {
              const update = updates.find(u => u.id === item.id);
              if (update) {
                return { 
                  ...item, 
                  dailyAttendance: update.daily_attendance, 
                  attendance: update.attendance 
                };
              }
              return item;
            }));
            alert("Attendance records saved successfully for " + attendanceDate);
          } else {
            alert(`Sync partial success. Failures: ${result.failures || result.error || 'Unknown error'}`);
          }
        } else {
          const text = await response.text();
          console.error("Non-JSON sync response:", text);
          alert("Received non-JSON response from server during sync. Please try 'Master Sync' in Admin Dashboard.");
        }
      } else {
        const text = await response.text();
        console.error("Sync error status:", response.status, text);
        alert(`Failed to sync attendance (Status ${response.status}). Please try 'Master Sync' in Admin Dashboard.`);
      }
    } catch (err: any) {
      console.error("Bulk sync error:", err);
      alert("Error: " + err.message);
    }
  };

  const handleExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingExam) {
      setExams(prev => prev.map(ex => ex.id === editingExam.id ? { ...ex, ...examForm } : ex));
      alert("Exam details updated successfully.");
    } else {
      const newExam: Exam = { id: crypto.randomUUID(), ...examForm, marks: {} } as Exam;
      setExams(prev => [...prev, newExam]);
      alert("Exam scheduled and published.");
    }
    setIsExamModalOpen(false);
    setEditingExam(null);
    setExamForm({ ...examForm, name: '' });
  };

  const updateStudentMark = (studentId: string, mark: string) => {
    setLocalMarks(prev => ({ ...prev, [studentId]: mark }));
  };

  const saveMarksBatch = () => {
    if (!enteringMarksFor) return;
    
    const updatedMarks = { ...enteringMarksFor.marks };
    Object.entries(localMarks).forEach(([studentId, markStr]) => {
      if (markStr === '') {
        delete updatedMarks[studentId];
      } else {
        updatedMarks[studentId] = Number(markStr);
      }
    });

    setExams(prev => prev.map(exam => 
      exam.id === enteringMarksFor.id 
        ? { ...exam, marks: updatedMarks } 
        : exam
    ));
    setEnteringMarksFor(null);
    setLocalMarks({});
    alert("Exam marks updated successfully.");
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTeachers(prev => prev.map(t => t.id === teacher.id ? { ...t, ...profileForm } : t));
    alert("Profile updated successfully.");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'profileContent') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileForm(prev => ({ ...prev, [field]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'students', label: 'Students', icon: <Users size={20} /> },
    { id: 'notices', label: 'Notices', icon: <Bell size={20} /> },
    { id: 'attendance', label: 'Attendance', icon: <ClipboardList size={20} /> },
    { id: 'syllabus', label: 'Syllabus', icon: <BookOpen size={20} /> },
    { id: 'exams', label: 'Exams', icon: <FileText size={20} /> },
    { id: 'assignments', label: 'Assignments', icon: <BookOpen size={20} /> },
    { id: 'leaderboard', label: 'Leaderboard', icon: <Award size={20} /> },
    { id: 'resources', label: 'Resources', icon: <Book size={20} /> },
    { id: 'omr', label: 'OMR System', icon: <Scan size={20} /> },
    { id: 'profile', label: 'Settings', icon: <User size={20} /> },
  ];

  useEffect(() => {
    if (activeTab === 'omr') {
      navigate('/omr');
      setActiveTab('overview');
    }
  }, [activeTab, navigate]);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white overflow-hidden">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0B1120] text-white h-full shrink-0">
        <div className="p-6 border-b border-white/10 flex items-center justify-center">
          <h2 className="text-xl font-black tracking-widest uppercase text-white">PHOENIX EDU</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {tabs.map(t => (
            <button 
              key={t.id} 
              onClick={() => setActiveTab(t.id)} 
              className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                activeTab === t.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={onLogout} className="w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsSidebarOpen(false)} />
          <aside className="w-64 bg-[#0B1120] text-white h-full relative z-50 flex flex-col">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-black tracking-widest uppercase text-white">PHOENIX EDU</h2>
              <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {tabs.map(t => (
                <button 
                  key={t.id} 
                  onClick={() => { setActiveTab(t.id); setIsSidebarOpen(false); }} 
                  className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                    activeTab === t.id 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </nav>
            <div className="p-4 border-t border-white/10">
              <button onClick={onLogout} className="w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all">
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 space-y-6 md:space-y-8">
          
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <button onClick={() => setIsSidebarOpen(true)} className="text-slate-600 dark:text-slate-300">
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-black tracking-widest uppercase text-slate-900 dark:text-white">PHOENIX EDU</h2>
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold">
              {teacher.name.charAt(0)}
            </div>
          </div>

          <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-6 md:p-10 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[32px] md:rounded-[48px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.2)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full -mr-48 -mt-48 blur-[100px] transition-all group-hover:bg-blue-500/10" />
            
            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 relative z-10 w-full lg:w-auto text-center sm:text-left">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl sm:rounded-[32px] bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 flex items-center justify-center text-white text-3xl sm:text-4xl font-black shadow-2xl shadow-blue-500/30 transform group-hover:rotate-6 transition-transform shrink-0 border-4 border-white/10 overflow-hidden">
                {teacher.image ? (
                  <img src={teacher.image} className="w-full h-full object-cover" alt={teacher.name} />
                ) : (
                  teacher.name.charAt(0)
                )}
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-tight">{teacher.name}</h1>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-500/20">Teacher Dashboard</span>
                  <span className="px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-500/20">{teacher.subject}</span>
                </div>
              </div>
            </div>
          </header>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[
            { label: 'My Students', value: myStudents.length, color: 'from-blue-600 to-cyan-400', icon: <Users className="text-white" size={28} />, bg: 'bg-blue-500/10' },
            { label: 'My Courses', value: assignedSubjects.length, color: 'from-blue-600 to-cyan-400', icon: <BookOpen className="text-white" size={28} />, bg: 'bg-blue-500/10' },
            { label: 'My Exams', value: myExams.length, color: 'from-orange-600 to-amber-400', icon: <FileText className="text-white" size={28} />, bg: 'bg-orange-500/10' }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group p-8 sm:p-10 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.2)] relative overflow-hidden hover:scale-[1.02] transition-all duration-500"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-5 blur-3xl group-hover:opacity-10 transition-opacity duration-700`} />
              <div className="relative z-10 space-y-6">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-xl shadow-blue-500/20 transform group-hover:rotate-6 transition-transform`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                  <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.value}</h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'students' && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border dark:border-slate-700 overflow-hidden">
            <div className="p-5 md:p-8 border-b dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 dark:bg-slate-900/40">
               <h3 className="text-xl font-bold text-slate-900 dark:text-white">My Student Directory</h3>
               <select 
                 value={selectedBatch} 
                 onChange={(e) => setSelectedBatch(e.target.value)}
                 className="w-full sm:w-auto p-2 rounded-xl border dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-900 dark:text-white"
               >
                 <option value="All">All Batches</option>
                 {batches.map(b => <option key={b} value={b}>{b}</option>)}
               </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <tbody className="divide-y dark:divide-slate-700">
                  {filteredStudents.map(student => (
                    <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-900 group transition-colors">
                      <td className="px-4 sm:px-8 py-5">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-lg">{student.name.charAt(0)}</div>
                          <div>
                            <p className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">{student.name}</p>
                            <p className="text-[10px] sm:text-xs text-slate-400 font-bold">{student.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-8 py-5">
                        <span className="text-[10px] sm:text-xs font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg uppercase tracking-wider">{student.batch || 'No Batch'}</span>
                      </td>
                      <td className="px-4 sm:px-8 py-5"><span className="text-xs sm:text-sm font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">{student.class}</span></td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && <tr><td colSpan={3} className="p-20 text-center font-bold text-slate-400">No students found in this batch.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
      )}

      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 bg-white dark:bg-slate-800 p-5 md:p-8 rounded-3xl md:rounded-[40px] border dark:border-slate-700 shadow-xl">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Attendance Tracker</h3>
              <p className="text-slate-500 font-medium">Record logs for {attendanceDate}.</p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <select 
                value={selectedBatch} 
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="p-4 rounded-2xl border dark:bg-slate-900 border-slate-200 dark:border-slate-700 outline-none font-bold text-xs shadow-inner text-slate-900 dark:text-white"
              >
                <option value="All">All Batches</option>
                {batches.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} className="p-4 rounded-2xl border dark:bg-slate-900 border-slate-200 dark:border-slate-700 outline-none font-bold text-blue-600 shadow-inner" />
              <button onClick={submitAttendance} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold shadow-xl hover:bg-blue-700 transition-all active:scale-95">Save Records</button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-4">
            <div className="px-5 py-3 bg-blue-600/10 border border-blue-500/20 rounded-2xl">
              <p className="text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-widest">
                Filtered: <span className="ml-2">{filteredStudents.filter(s => attendanceMap[s.id] === true).length} / {filteredStudents.length}</span>
              </p>
            </div>
            <div className="px-5 py-3 bg-green-500/10 border border-green-500/20 rounded-2xl">
              <p className="text-green-600 font-bold text-xs uppercase tracking-widest">
                Class Presence: {Object.values(attendanceMap).filter(v => v === true).length} / {myStudents.length}
              </p>
            </div>
          </div>

          {/* Batch-wise Summary - Show always to provide total context */}
          {batches.length > 0 && (
            <div className="flex flex-wrap gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
              {batches.map(batchName => {
                const batchStudents = myStudents.filter(s => (s.batch || 'Unassigned') === batchName);
                const presentCount = batchStudents.filter(s => attendanceMap[s.id] === true).length;
                const isSelected = selectedBatch === batchName;

                return (
                  <div 
                    key={batchName} 
                    onClick={() => setSelectedBatch(isSelected ? 'All' : batchName)}
                    className={`px-6 py-4 border rounded-2xl shadow-md min-w-[140px] transition-all cursor-pointer hover:scale-105 ${isSelected ? 'bg-orange-500/10 border-orange-500/30 ring-1 ring-orange-500/20' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}
                  >
                    <p className={`text-[10px] font-black uppercase tracking-widest leading-none mb-2 ${isSelected ? 'text-orange-500' : 'text-slate-500'}`}>{batchName}</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white leading-none">
                      <span className="text-green-500">{presentCount}</span>
                      <span className="text-slate-400 mx-2">/</span>
                      <span>{batchStudents.length}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          )}
          {/* Select status to mark all */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[32px] border dark:border-slate-700 shadow-xl mb-8">
            <p className="text-slate-900 dark:text-white font-bold text-sm mb-6">Select a status to mark all students' attendance.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="py-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-sm">Holiday</button>
              <button className="py-3 rounded-xl bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 font-bold text-sm">Leave</button>
              <button className="py-3 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 font-bold text-sm">Absent</button>
              <button className="py-3 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 font-bold text-sm">Present</button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl md:rounded-[40px] border dark:border-slate-700 shadow-xl overflow-hidden">
            <div className="flex flex-col divide-y dark:divide-slate-700">
              {filteredStudents.map(student => (
                <div key={student.id} className="p-6 flex flex-col gap-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="font-bold text-lg text-slate-900 dark:text-white">{student.name}</span>
                      <span className="text-xs text-slate-400 font-bold">N/A</span>
                    </div>
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center text-slate-500">
                      <Calendar size={20} />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <button className="py-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold hover:bg-blue-500/10 hover:text-blue-600 transition-all">Holiday</button>
                    <button className="py-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold hover:bg-yellow-500/10 hover:text-yellow-600 transition-all">Leave</button>
                    <button 
                      onClick={() => toggleAttendance(student.id)} 
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${attendanceMap[student.id] === false ? 'bg-red-500/10 text-red-600' : 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white'} hover:bg-red-500/10 hover:text-red-600`}
                    >
                      Absent
                    </button>
                    <button 
                      onClick={() => toggleAttendance(student.id)} 
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${attendanceMap[student.id] === true ? 'bg-green-500/10 text-green-600' : 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white'} hover:bg-green-500/10 hover:text-green-600`}
                    >
                      Present
                    </button>
                  </div>
                </div>
              ))}
              {filteredStudents.length === 0 && <div className="p-10 text-center font-bold text-slate-400">No students found in this batch.</div>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'exams' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-5 md:p-8 rounded-3xl md:rounded-[40px] shadow-sm border dark:border-slate-700">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">My Exam Center</h3>
            <button onClick={() => setIsExamModalOpen(true)} className="bg-orange-500 text-white px-10 py-4 rounded-2xl font-bold text-sm shadow-xl hover:bg-orange-600 transition-all active:scale-95">+ Publish Exam</button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:p-8">
            {myExams.map(e => (
              <div key={e.id} className="bg-white dark:bg-slate-800 p-5 md:p-8 rounded-3xl md:rounded-[40px] border dark:border-slate-700 shadow-xl space-y-5">
                <div className="flex justify-between items-start"><div><h4 className="font-bold text-2xl tracking-tight text-slate-900 dark:text-white">{e.name}</h4><span className="text-xs font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg uppercase tracking-wider">{e.subject}</span></div><span className="text-xs font-bold text-slate-400">{e.date}</span></div>
                <div className="pt-5 border-t dark:border-slate-700 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase">{Object.keys(e.marks).length} Results Logged</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setEditingExam(e);
                        setExamForm({
                          name: e.name,
                          subject: e.subject,
                          date: e.date,
                          totalMarks: e.totalMarks || 100
                        });
                        setIsExamModalOpen(true);
                      }}
                      className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-2xl font-bold hover:bg-blue-600 hover:text-white transition-all"
                    >
                      <Pencil size={16} />
                    </button>
                    <button 
                      onClick={() => {
                        if(window.confirm("Delete this exam?")) deleteExam(e.id);
                      }} 
                      className="p-3 bg-red-50 dark:bg-red-900/30 text-red-500 rounded-2xl font-bold hover:bg-red-600 hover:text-white transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button onClick={() => setEnteringMarksFor(e)} className="bg-slate-100 dark:bg-slate-900 px-6 py-3 rounded-2xl text-xs font-bold hover:bg-orange-500 hover:text-white transition-all shadow-sm">Enter Marks</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exam Marks Entry Modal */}
      {enteringMarksFor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-3xl md:rounded-[48px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-10 border-b dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/40">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Performance Entry</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Exam: {enteringMarksFor.name}</p>
              </div>
              <button onClick={() => setEnteringMarksFor(null)} className="p-4 bg-white dark:bg-slate-700 rounded-[20px] font-bold text-xl hover:text-red-500 shadow-sm transition-all flex items-center justify-center">
                <X size={24} />
              </button>
            </div>
            <div className="px-10 py-6 bg-slate-100 dark:bg-slate-900/50 border-b dark:border-slate-700 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">Filter by Batch</label>
                <select 
                  value={examBatchFilter} 
                  onChange={(e) => setExamBatchFilter(e.target.value)}
                  className="p-3 rounded-xl border dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-bold text-xs outline-none focus:ring-2 ring-blue-500/20 text-slate-900 dark:text-white"
                >
                  <option value="All">All Batches</option>
                  {batches.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-2xl text-xs font-bold uppercase tracking-widest text-center">Max Score: {enteringMarksFor.totalMarks || 100}</div>
            </div>
            <div className="flex-grow overflow-y-auto p-10 space-y-6">
              {myStudents
                .filter(s => {
                  const studentSubjects = s.subjects || [];
                  // Match by name or ID
                  return studentSubjects.some(sub => 
                    sub === enteringMarksFor.subject || 
                    subjects.find(sj => sj.id === sub)?.name === enteringMarksFor.subject
                  );
                })
                .filter(s => examBatchFilter === 'All' || (s.batch || 'Unassigned') === examBatchFilter)
                .map(s => (
                <div key={s.id} className="flex items-center justify-between p-5 md:p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[32px] border border-transparent hover:border-slate-200 transition-all shadow-sm">
                  <div className="flex flex-col">
                    <span className="font-bold text-xl text-slate-900 dark:text-white">{s.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 uppercase">{s.batch || 'Unassigned'}</span>
                      <span className="text-xs font-bold text-slate-400 uppercase">•</span>
                      <span className="text-xs font-bold text-slate-400 uppercase">Score / {enteringMarksFor.totalMarks || 100}</span>
                    </div>
                  </div>
                  <input 
                    type="number" 
                    className="w-28 p-5 rounded-[24px] border dark:bg-slate-800 text-center font-bold text-2xl text-blue-600 focus:ring-4 ring-blue-500/20 shadow-inner" 
                    value={localMarks[s.id] !== undefined ? localMarks[s.id] : (enteringMarksFor.marks[s.id] !== undefined ? enteringMarksFor.marks[s.id] : '')} 
                    onChange={(e) => updateStudentMark(s.id, e.target.value)} 
                  />
                </div>
              ))}
              {myStudents
                .filter(s => {
                  const studentSubjects = s.subjects || [];
                  return studentSubjects.some(sub => 
                    sub === enteringMarksFor.subject || 
                    subjects.find(sj => sj.id === sub)?.name === enteringMarksFor.subject
                  );
                })
                .filter(s => examBatchFilter === 'All' || (s.batch || 'Unassigned') === examBatchFilter)
                .length === 0 && <div className="p-20 text-center font-bold text-slate-400">No students found for the selected batch.</div>}
            </div>
            <div className="p-10 border-t dark:border-slate-700">
              <button 
                onClick={saveMarksBatch} 
                className="w-full py-6 bg-blue-600 text-white font-bold rounded-[28px] shadow-2xl hover:bg-blue-700 transition-all active:scale-95 text-lg"
              >
                Save Results Batch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exam Scheduling Modal */}
      {isExamModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl md:rounded-[48px] shadow-2xl p-6 md:p-12 space-y-4 md:space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Exam Scheduler</h2>
              <button onClick={() => setIsExamModalOpen(false)} className="text-slate-400 font-bold text-2xl hover:text-red-500 transition-all">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleExamSubmit} className="space-y-6">
              <input required type="text" className="w-full p-5 rounded-3xl border dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-bold focus:ring-4 ring-orange-500/20 text-slate-900 dark:text-white" placeholder="Exam Session Label" value={examForm.name || ''} onChange={e => setExamForm({...examForm, name: e.target.value})} />
              <select className="w-full p-5 rounded-3xl border dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-bold focus:ring-4 ring-orange-500/20 text-slate-900 dark:text-white" value={examForm.subject || ''} onChange={e => setExamForm({...examForm, subject: e.target.value})}>
                {assignedSubjectNames.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-3">Exam Date</label>
                  <input required type="date" className="w-full p-5 rounded-3xl border dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-bold focus:ring-4 ring-orange-500/20 text-slate-900 dark:text-white" value={examForm.date || ''} onChange={e => setExamForm({...examForm, date: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-3">Total Marks</label>
                  <input required type="number" className="w-full p-5 rounded-3xl border dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-bold focus:ring-4 ring-orange-500/20 text-slate-900 dark:text-white" value={examForm.totalMarks || 100} onChange={e => setExamForm({...examForm, totalMarks: parseInt(e.target.value)})} />
                </div>
              </div>
              <button type="submit" className="w-full py-6 bg-orange-500 text-white font-bold rounded-[28px] shadow-2xl hover:bg-orange-600 transition-all active:scale-95">Publish Board Schedule</button>
            </form>
          </div>
        </div>
      )}

      {/* TAB: Assignments Management */}
      {activeTab === 'assignments' && (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-slate-800 p-8 rounded-[40px] border dark:border-slate-700 shadow-2xl">
            <div className="space-y-1">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Assignment Hub</h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Manage and track student tasks</p>
            </div>
            <button 
              onClick={() => setIsAssignmentModalOpen(true)}
              className="px-8 py-4 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 flex items-center gap-3"
            >
              <Plus size={18} />
              Publish Assignment
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {assignments
              .filter(a => assignedSubjectNames.includes(a.subject))
              .map(assignment => (
              <motion.div 
                key={assignment.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-800 p-8 rounded-[40px] border dark:border-slate-700 shadow-2xl space-y-6 group hover:border-orange-500/30 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{assignment.title}</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase tracking-widest rounded-full border border-blue-500/20">{assignment.subject}</span>
                      <span className="px-3 py-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[9px] font-black uppercase tracking-widest rounded-full border border-orange-500/20">{assignment.batch}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        setEditingAssignment(assignment);
                        setAssignmentForm(assignment);
                        setIsAssignmentModalOpen(true);
                      }}
                      className="p-2 bg-slate-100 dark:bg-slate-900 text-slate-400 hover:text-blue-500 transition-colors rounded-lg"
                    >
                      <Pencil size={16} />
                    </button>
                    <button 
                      onClick={() => deleteAssignment(assignment.id)}
                      className="p-2 bg-slate-100 dark:bg-slate-900 text-slate-400 hover:text-red-500 transition-colors rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                    <span className="text-slate-500">Due Date</span>
                    <span className="text-slate-900 dark:text-white">{assignment.dueDate}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                    <span className="text-slate-500">Total Marks</span>
                    <span className="text-slate-900 dark:text-white">{assignment.totalMarks}</span>
                  </div>
                </div>

                <button 
                  onClick={() => setViewingAssignmentSubmissions(assignment)}
                  className="w-full py-4 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border dark:border-slate-700"
                >
                  View Submissions
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: Leaderboard Management */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-white dark:bg-slate-800 p-10 rounded-[48px] border dark:border-slate-700 shadow-2xl">
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Academic Leaderboard</h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Top performers across all batches</p>
            </div>
            <select 
              value={leaderboardBatchFilter} 
              onChange={(e) => setLeaderboardBatchFilter(e.target.value)}
              className="p-4 bg-slate-100 dark:bg-slate-900 border dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 transition-all w-full md:w-auto"
            >
              <option value="All">All Batches</option>
              {batches.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Top 3 Podium */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8 items-end pb-10">
              {(() => {
                const ranked = students
                  .filter(s => leaderboardBatchFilter === 'All' || (s.batch || 'Unassigned') === leaderboardBatchFilter)
                  .map(s => {
                    const studentExams = exams.filter(e => e.marks[s.id] !== undefined);
                    const avgScore = studentExams.length > 0 
                      ? studentExams.reduce((acc, e) => acc + (e.marks[s.id] / (e.totalMarks || 100)) * 100, 0) / studentExams.length 
                      : 0;
                    const performance = (avgScore * 0.7) + (s.attendance * 0.3);
                    return { ...s, performance, avgScore };
                  })
                  .sort((a, b) => b.performance - a.performance);

                return [ranked[1], ranked[0], ranked[2]].map((s, i) => {
                  if (!s) return null;
                  const isFirst = i === 1;
                  return (
                    <motion.div 
                      key={s.id}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.2 }}
                      className={`relative flex flex-col items-center ${isFirst ? 'order-first md:order-none' : ''}`}
                    >
                      <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 ${isFirst ? 'border-orange-500 scale-110' : 'border-blue-500'} shadow-2xl overflow-hidden mb-6`}>
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${s.name}`} alt={s.name} className="w-full h-full object-cover" />
                      </div>
                      <div className={`w-full p-8 rounded-[40px] text-center space-y-4 ${isFirst ? 'bg-gradient-to-b from-orange-500 to-amber-600 h-64' : 'bg-white dark:bg-slate-800 border dark:border-slate-700 h-56'}`}>
                        <div className={`w-10 h-10 rounded-full mx-auto -mt-14 flex items-center justify-center font-black text-xl shadow-xl ${isFirst ? 'bg-white text-orange-600' : 'bg-blue-600 text-white'}`}>
                          {i === 1 ? 1 : i === 0 ? 2 : 3}
                        </div>
                        <h4 className={`text-xl font-black tracking-tight ${isFirst ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{s.name}</h4>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${isFirst ? 'text-white/70' : 'text-slate-500'}`}>{s.batch || 'Unassigned'}</p>
                        <div className="pt-4 border-t border-white/10">
                          <p className={`text-2xl font-black ${isFirst ? 'text-white' : 'text-blue-500'}`}>{Math.round(s.performance)}%</p>
                          <p className={`text-[8px] font-bold uppercase tracking-widest ${isFirst ? 'text-white/50' : 'text-slate-600'}`}>Performance Index</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                });
              })()}
            </div>

            {/* Rest of the leaderboard */}
            <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-[48px] border dark:border-slate-700 shadow-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Rank</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Student</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Batch</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Attendance</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Avg. Exam</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Avg. Assignment</th>
                    <th className="px-10 py-6 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Index</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-700">
                  {students
                    .filter(s => leaderboardBatchFilter === 'All' || (s.batch || 'Unassigned') === leaderboardBatchFilter)
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
                      <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all group">
                        <td className="px-10 py-6">
                          <span className="text-lg font-black text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">#{i + 4}</span>
                        </td>
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 border dark:border-slate-700 flex items-center justify-center text-slate-400 font-black">
                              {s.name.charAt(0)}
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white tracking-tight">{s.name}</span>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{s.batch || 'Unassigned'}</span>
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
      )}

      {activeTab === 'resources' && (
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
          {selectedResourceSubject === 'All' ? (
            <div className="space-y-8">
              <div className="bg-white dark:bg-slate-800 p-8 rounded-[40px] shadow-xl border border-slate-100 dark:border-slate-700">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Resource Library</h3>
                    <p className="text-slate-500 font-medium">Browse materials by category and subject.</p>
                  </div>
                  <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border dark:border-slate-700">
                    <button 
                      onClick={() => setResourceCategory('SSC')} 
                      className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${resourceCategory === 'SSC' ? 'bg-white dark:bg-slate-800 shadow-md text-blue-600' : 'text-slate-400'}`}
                    >
                      SSC
                    </button>
                    <button 
                      onClick={() => setResourceCategory('HSC')} 
                      className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${resourceCategory === 'HSC' ? 'bg-white dark:bg-slate-800 shadow-md text-blue-600' : 'text-slate-400'}`}
                    >
                      HSC
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from(new Set(resources.filter(r => r.category === resourceCategory).map(r => r.subject))).map(subject => (
                  <motion.button
                    key={subject}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedResourceSubject(subject)}
                    className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all text-left flex flex-col items-center justify-center gap-4 group"
                  >
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      {getSubjectIcon(subject)}
                    </div>
                    <span className="font-black text-sm text-slate-900 dark:text-white text-center">{subject}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {resources.filter(r => r.subject === subject && r.category === resourceCategory).length} Resources
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] shadow-xl border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setSelectedResourceSubject('All')}
                    className="p-3 bg-slate-100 dark:bg-slate-900 rounded-2xl text-slate-500 hover:text-blue-600 transition-all"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">{selectedResourceSubject}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{resourceCategory} Resources</p>
                  </div>
                </div>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search in subject..." 
                    value={resourceSearchQuery}
                    onChange={(e) => setResourceSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-6 py-3.5 bg-slate-100 dark:bg-slate-900 border-none rounded-2xl text-sm font-bold focus:ring-2 ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map((res) => (
                  <motion.div 
                    key={res.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-lg hover:shadow-2xl transition-all group"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <FileText size={28} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">{res.size}</span>
                    </div>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white mb-4 line-clamp-2">{res.title}</h4>
                    <a 
                      href={res.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full py-4 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all"
                    >
                      <Download size={16} />
                      Download
                    </a>
                  </motion.div>
                ))}
                {filteredResources.length === 0 && (
                  <div className="col-span-full py-20 text-center bg-white dark:bg-slate-800 rounded-[40px] border border-dashed border-slate-200 dark:border-slate-700">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Filter className="text-slate-300" size={32} />
                    </div>
                    <h4 className="text-xl font-bold text-slate-400">No resources found.</h4>
                    <p className="text-slate-500 mt-2">Try adjusting your search query.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {activeTab === 'notices' && (
        <div className="space-y-8 p-6 md:p-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-slate-800 p-8 rounded-[40px] border border-slate-100 dark:border-slate-700 shadow-2xl">
            <div className="space-y-1">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Notice Board</h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Broadcasts relevant to you</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {notices
              .filter(n => n.facultyId === teacher.id || n.facultyId === 'All')
              .length === 0 ? (
                <div className="lg:col-span-3 text-center py-20">
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No notices for you yet</p>
                </div>
              ) : (
                notices
                  .filter(n => n.facultyId === teacher.id)
                  .map(notice => (
                    <motion.div 
                      key={notice.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white dark:bg-slate-800 p-8 rounded-[40px] border border-slate-100 dark:border-slate-700 shadow-2xl space-y-6 relative overflow-hidden group"
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
                      <h4 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{notice.subject}</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-orange-500" />
                            <span className="text-slate-500">Date</span>
                          </div>
                          <span className="text-slate-900 dark:text-white">{notice.date}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-orange-500" />
                            <span className="text-slate-500">Time</span>
                          </div>
                          <span className="text-slate-900 dark:text-white">{notice.time}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                          <span className="text-slate-500 ml-6">Target Batch</span>
                          <span className="text-slate-900 dark:text-white">{notice.batch}</span>
                        </div>
                      </div>
                      {notice.note && (
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                          <p className="text-xs text-slate-600 dark:text-slate-400 italic">"{notice.note}"</p>
                        </div>
                      )}
                    </motion.div>
                  ))
              )}
          </div>
        </div>
      )}

      {activeTab === 'syllabus' && (
        <SyllabusTracker 
          role={UserRole.TEACHER} 
          currentUser={teacher} 
          batches={Array.from(new Set(students.map(s => s.batch || 'Unassigned'))).sort()}
          teachers={teachers}
        />
      )}

      {activeTab === 'profile' && (
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-3xl md:rounded-[40px] shadow-xl border dark:border-slate-700 overflow-hidden">
          <div className="p-8 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Profile Settings</h3>
            <p className="text-slate-500 font-medium">Manage your professional information.</p>
          </div>
          <form onSubmit={handleProfileSubmit} className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">Full Name</label>
                <input 
                  type="text" 
                  value={profileForm.name} 
                  onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                  className="w-full p-4 rounded-2xl border dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-bold focus:ring-4 ring-blue-500/20 text-slate-900 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">Subject Specialty</label>
                <input 
                  type="text" 
                  value={profileForm.subject} 
                  onChange={e => setProfileForm({...profileForm, subject: e.target.value})}
                  className="w-full p-4 rounded-2xl border dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-bold focus:ring-4 ring-blue-500/20 text-slate-900 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">Qualification</label>
                <input 
                  type="text" 
                  value={profileForm.qualification} 
                  onChange={e => setProfileForm({...profileForm, qualification: e.target.value})}
                  className="w-full p-4 rounded-2xl border dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-bold focus:ring-4 ring-blue-500/20 text-slate-900 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">Experience</label>
                <input 
                  type="text" 
                  value={profileForm.experience} 
                  onChange={e => setProfileForm({...profileForm, experience: e.target.value})}
                  className="w-full p-4 rounded-2xl border dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-bold focus:ring-4 ring-blue-500/20 text-slate-900 dark:text-white"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">Education Background</label>
                <textarea 
                  value={profileForm.education} 
                  onChange={e => setProfileForm({...profileForm, education: e.target.value})}
                  rows={3}
                  className="w-full p-4 rounded-2xl border dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-bold focus:ring-4 ring-blue-500/20 text-slate-900 dark:text-white"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">Profile Image</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-900 border dark:border-slate-700 overflow-hidden flex items-center justify-center">
                    {profileForm.image ? (
                      <img src={profileForm.image} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <User className="text-slate-300" size={32} />
                    )}
                  </div>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => handleFileUpload(e, 'image')}
                    className="flex-grow text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">Email Address (Read Only)</label>
                <input 
                  type="email" 
                  value={teacher.email || ''} 
                  disabled
                  className="w-full p-4 rounded-2xl border bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 font-bold text-slate-400 cursor-not-allowed"
                />
              </div>

              <div className="space-y-4 md:col-span-2 pt-4 border-t dark:border-slate-700">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Public Profile View</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Profile Type</label>
                    <select 
                      value={profileForm.profileType} 
                      onChange={e => setProfileForm({...profileForm, profileType: e.target.value as 'text' | 'link' | 'pdf'})}
                      className="w-full p-4 rounded-2xl border dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-bold focus:ring-4 ring-blue-500/20 text-slate-900 dark:text-white"
                    >
                      <option value="text">Detailed Text</option>
                      <option value="link">External Link (URL)</option>
                      <option value="pdf">PDF Document</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">
                      {profileForm.profileType === 'text' ? 'Profile Description' : 
                       profileForm.profileType === 'link' ? 'External URL' : 'Upload PDF'}
                    </label>
                    {profileForm.profileType === 'text' ? (
                      <textarea 
                        value={profileForm.profileContent} 
                        onChange={e => setProfileForm({...profileForm, profileContent: e.target.value})}
                        rows={4}
                        placeholder="Tell students more about yourself..."
                        className="w-full p-4 rounded-2xl border dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-bold focus:ring-4 ring-blue-500/20 text-slate-900 dark:text-white"
                      />
                    ) : profileForm.profileType === 'link' ? (
                      <input 
                        type="url" 
                        value={profileForm.profileContent} 
                        onChange={e => setProfileForm({...profileForm, profileContent: e.target.value})}
                        placeholder="https://example.com/your-profile"
                        className="w-full p-4 rounded-2xl border dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-bold focus:ring-4 ring-blue-500/20 text-slate-900 dark:text-white"
                      />
                    ) : (
                      <div className="space-y-2">
                        <input 
                          type="file" 
                          accept=".pdf"
                          onChange={e => handleFileUpload(e, 'profileContent')}
                          className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {profileForm.profileContent && profileForm.profileContent.startsWith('data:application/pdf') && (
                          <p className="text-[10px] text-green-500 font-bold uppercase ml-2 flex items-center gap-1">
                            <Check size={12} /> PDF Uploaded
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-8 border-t dark:border-slate-700">
              <button 
                type="submit" 
                className="w-full py-5 bg-blue-600 text-white font-bold rounded-2xl shadow-xl hover:bg-blue-700 transition-all active:scale-95 text-lg"
              >
                Save Profile Changes
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Assignment Modal */}
      {isAssignmentModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 border dark:border-white/10 w-full max-w-2xl rounded-[48px] shadow-2xl p-12 space-y-10 overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{editingAssignment ? 'Edit Assignment' : 'New Assignment'}</h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Publish tasks to student batches</p>
              </div>
              <button onClick={() => setIsAssignmentModalOpen(false)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAssignmentSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Assignment Title</label>
                  <input 
                    required 
                    className="w-full p-5 rounded-3xl bg-slate-50 dark:bg-white/5 border dark:border-white/10 text-slate-900 dark:text-white font-bold focus:border-orange-500 transition-all" 
                    value={assignmentForm.title} 
                    onChange={e => setAssignmentForm({...assignmentForm, title: e.target.value})} 
                    placeholder="e.g. Physics Chapter 3 Practice"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Subject</label>
                  <select 
                    required 
                    className="w-full p-5 rounded-3xl bg-slate-50 dark:bg-white/5 border dark:border-white/10 text-slate-900 dark:text-white font-bold focus:border-orange-500 transition-all" 
                    value={assignmentForm.subject} 
                    onChange={e => setAssignmentForm({...assignmentForm, subject: e.target.value})}
                  >
                    <option value="">Select Subject</option>
                    {assignedSubjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Target Batch</label>
                  <select 
                    required 
                    className="w-full p-5 rounded-3xl bg-slate-50 dark:bg-white/5 border dark:border-white/10 text-slate-900 dark:text-white font-bold focus:border-orange-500 transition-all" 
                    value={assignmentForm.batch} 
                    onChange={e => setAssignmentForm({...assignmentForm, batch: e.target.value})}
                  >
                    <option value="All">All Batches</option>
                    {batches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Due Date</label>
                  <input 
                    type="date" 
                    required 
                    className="w-full p-5 rounded-3xl bg-slate-50 dark:bg-white/5 border dark:border-white/10 text-slate-900 dark:text-white font-bold focus:border-orange-500 transition-all" 
                    value={assignmentForm.dueDate} 
                    onChange={e => setAssignmentForm({...assignmentForm, dueDate: e.target.value})} 
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Total Marks</label>
                  <input 
                    type="number" 
                    required 
                    className="w-full p-5 rounded-3xl bg-slate-50 dark:bg-white/5 border dark:border-white/10 text-slate-900 dark:text-white font-bold focus:border-orange-500 transition-all" 
                    value={assignmentForm.totalMarks} 
                    onChange={e => setAssignmentForm({...assignmentForm, totalMarks: parseInt(e.target.value)})} 
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Description / Instructions</label>
                  <textarea 
                    className="w-full p-5 rounded-3xl bg-slate-50 dark:bg-white/5 border dark:border-white/10 text-slate-900 dark:text-white font-medium h-32 focus:border-orange-500 transition-all" 
                    value={assignmentForm.description} 
                    onChange={e => setAssignmentForm({...assignmentForm, description: e.target.value})} 
                    placeholder="Provide details about the assignment..."
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-6 bg-orange-500 text-white font-black rounded-3xl shadow-2xl shadow-orange-500/20 hover:bg-orange-600 transition-all uppercase tracking-widest text-xs">
                {editingAssignment ? 'Update Assignment' : 'Publish Assignment'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* View Submissions Modal */}
      {viewingAssignmentSubmissions && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 border dark:border-white/10 w-full max-w-4xl rounded-[48px] shadow-2xl p-12 space-y-10 overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Submissions</h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{viewingAssignmentSubmissions.title} • {viewingAssignmentSubmissions.batch}</p>
              </div>
              <button onClick={() => setViewingAssignmentSubmissions(null)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="overflow-hidden rounded-[32px] border dark:border-white/10">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-white/5">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Student</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Marks</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-white/5">
                  {students
                    .filter(s => viewingAssignmentSubmissions.batch === 'All' || (s.batch || 'Unassigned') === viewingAssignmentSubmissions.batch)
                    .map(student => {
                      const submission = student.assignmentSubmissions?.find(sub => sub.assignmentId === viewingAssignmentSubmissions.id);
                      const currentMarks = submissionMarks[student.id]?.marks ?? submission?.marks ?? 0;
                      const currentStatus = submissionMarks[student.id]?.status ?? submission?.status ?? 'Pending';

                      return (
                        <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 font-black text-xs">
                                {student.name.charAt(0)}
                              </div>
                              <span className="font-bold text-slate-900 dark:text-white text-sm">{student.name}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <select 
                              value={currentStatus}
                              onChange={(e) => setSubmissionMarks(prev => ({
                                ...prev,
                                [student.id]: { ...prev[student.id], status: e.target.value as any, marks: currentMarks }
                              }))}
                              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all bg-transparent ${currentStatus === 'Submitted' ? 'text-green-500 border-green-500/20' : 'text-orange-500 border-orange-500/20'}`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Submitted">Submitted</option>
                            </select>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-2">
                              <input 
                                type="number" 
                                value={currentMarks}
                                onChange={(e) => setSubmissionMarks(prev => ({
                                  ...prev,
                                  [student.id]: { ...prev[student.id], marks: parseInt(e.target.value), status: currentStatus }
                                }))}
                                className="w-16 p-2 bg-slate-50 dark:bg-white/5 border dark:border-white/10 rounded-xl text-xs font-bold text-slate-900 dark:text-white text-center"
                              />
                              <span className="text-[10px] font-bold text-slate-500">/ {viewingAssignmentSubmissions.totalMarks}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                            {submission?.submittedAt && (
                              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                                {new Date(submission.submittedAt).toLocaleDateString()}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            <button 
              onClick={() => saveAssignmentMarks(viewingAssignmentSubmissions.id)}
              className="w-full py-6 bg-blue-600 text-white font-black rounded-3xl shadow-2xl shadow-blue-500/20 hover:bg-blue-700 transition-all uppercase tracking-widest text-xs"
            >
              Save All Changes
            </button>
          </motion.div>
        </div>
      )}
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
