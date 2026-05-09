
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Student, Subject, AdminUser, Teacher, Exam, VideoClass, FooterData, HomeData, FeeRecord, ChatbotKnowledge, SuccessStory, ResourceItem, PartialAdmin, ScholarshipData, Assignment, AssignmentSubmission, Notice, UserRole } from '../types';
import { getDirectDriveLink } from '../utils';
import SyllabusTracker from '../components/SyllabusTracker';
import { supabase, supabaseUrl } from '../services/supabaseService';
import { 
  Check,
  X,
  Users, 
  BookOpen, 
  GraduationCap, 
  Settings, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle, 
  Ban,
  Star,
  Folder,
  Shield,
  XCircle, 
  Calendar, 
  Video, 
  FileText, 
  Search, 
  CreditCard, 
  Download, 
  Printer, 
  ChevronRight, 
  AlertCircle, 
  Clock, 
  TrendingUp, 
  DollarSign, 
  UserPlus, 
  ShieldCheck, 
  ShieldAlert, 
  MoreVertical, 
  Filter, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  Image as ImageIcon, 
  Save, 
  RefreshCw, 
  RefreshCw as RefreshCcw,
  School,
  Info, 
  MessageSquare, 
  Bot,
  BarChart3,
  User,
  Upload,
  Layout,
  Zap,
  Rocket,
  Database,
  Pencil,
  Gift,
  Award,
  ClipboardList,
  FileDown,
  Menu,
  LayoutDashboard,
  Copy,
  Send,
  Share2,
  Scan
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface AdminDashboardProps {
  onLogout: () => void;
  logo: string;
  setLogo: (val: string) => void;
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  teachers: Teacher[];
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
  exams: Exam[];
  setExams: React.Dispatch<React.SetStateAction<Exam[]>>;
  videoClasses: VideoClass[];
  setVideoClasses: React.Dispatch<React.SetStateAction<VideoClass[]>>;
  deleteStudent: (id: string) => void;
  deleteTeacher: (id: string) => void;
  deleteSubject: (id: string) => void;
  deleteExam: (id: string) => void;
  deleteVideoClass: (id: string) => void;
  chatbotKnowledge: ChatbotKnowledge[];
  setChatbotKnowledge: React.Dispatch<React.SetStateAction<ChatbotKnowledge[]>>;
  deleteChatbotKnowledge: (id: string) => void;
  adminProfile: AdminUser;
  footerData: FooterData;
  homeData: HomeData;
  saveSiteConfig: (logo: string, admin: AdminUser, footer: FooterData, home: HomeData) => Promise<void>;
  isSaving?: boolean;
  forceSyncAll?: () => void;
  currentUser: any;
  assignments: Assignment[];
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
  notices: Notice[];
  setNotices: React.Dispatch<React.SetStateAction<Notice[]>>;
  darkMode: boolean;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  onLogout, logo, setLogo, subjects, setSubjects, students, setStudents, teachers, setTeachers, exams, setExams, videoClasses, setVideoClasses, deleteStudent, deleteTeacher, deleteSubject, deleteExam, deleteVideoClass, chatbotKnowledge, setChatbotKnowledge, deleteChatbotKnowledge, adminProfile, footerData, homeData, saveSiteConfig, isSaving, forceSyncAll, currentUser, assignments, setAssignments, notices, setNotices, darkMode
}) => {
  console.log("AdminDashboard Render. Total Students:", students.length);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [reportStudentId, setReportStudentId] = useState<string>('');
  const [reportBatchFilter, setReportBatchFilter] = useState<string>('All');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    subject: '',
    batch: 'All',
    dueDate: new Date().toISOString().split('T')[0],
    totalMarks: 100,
    description: ''
  });
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [viewingAssignmentSubmissions, setViewingAssignmentSubmissions] = useState<Assignment | null>(null);
  const [submissionMarks, setSubmissionMarks] = useState<Record<string, { marks: number; status: 'Submitted' | 'Pending' }>>({});

  const [leaderboardBatchFilter, setLeaderboardBatchFilter] = useState<string>('All');
  
  const [noticeForm, setNoticeForm] = useState({
    type: 'Announcement' as 'Announcement' | 'Class Schedule',
    date: new Date().toISOString().split('T')[0],
    time: '',
    subject: '',
    facultyId: '',
    batch: 'All',
    note: ''
  });
  const [sentNoticeText, setSentNoticeText] = useState('');
  const [selectedBatchForNotice, setSelectedBatchForNotice] = useState('All');
  
  // Modal visibility states
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isScholarshipModalOpen, setIsScholarshipModalOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [enteringMarksFor, setEnteringMarksFor] = useState<Exam | null>(null);
  const [localMarks, setLocalMarks] = useState<Record<string, string>>({});
  
  // Selection/Editing states
  const [editingCourse, setEditingCourse] = useState<Subject | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [editingVideo, setEditingVideo] = useState<VideoClass | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [addingFeeForStudent, setAddingFeeForStudent] = useState<Student | null>(null);
  const [feeForm, setFeeForm] = useState<any>({
    receiptNo: '1',
    paymentDate: new Date().toISOString().split('T')[0],
    subjectId: '',
    feeType: 'Monthly',
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    paidAmount: 0,
    discount: 0,
    paymentMode: 'Cash',
    remarks: ''
  });
  
  // Attendance Management
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, boolean>>({});
  const [attendanceBatchFilter, setAttendanceBatchFilter] = useState<string>('All');
  const [examBatchFilter, setExamBatchFilter] = useState<string>('All');
  const [paymentBatchFilter, setPaymentBatchFilter] = useState<string>('All');
  const [verifyingStudentId, setVerifyingStudentId] = useState<string | null>(null);
  const [batchInput, setBatchInput] = useState<string>('');
  const [editingFeeRecord, setEditingFeeRecord] = useState<FeeRecord | null>(null);

  // Database Health state
  const [dbHealth, setDbHealth] = useState<any>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  const fetchDbHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const res = await fetch('/api/health/database');
      const data = await res.json();
      
      // Also check row counts for syllabus and attendance
      const { count: studentCount } = await supabase.from('students').select('*', { count: 'exact', head: true });
      const { count: syllabusCount } = await supabase.from('syllabus_progress').select('*', { count: 'exact', head: true });
      
      data.counts = {
        students: studentCount,
        syllabus: syllabusCount
      };
      
      setDbHealth(data);
    } catch (err) {
      console.error("Health check failed:", err);
    } finally {
      setIsCheckingHealth(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchDbHealth();
    }
  }, [activeTab]);

  // Success Stories & Resources
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<SuccessStory | null>(null);
  const [storyForm, setStoryForm] = useState<Partial<SuccessStory>>({ name: '', achievement: '', institution: '', image: '' });

  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<ResourceItem | null>(null);
  const [resourceForm, setResourceForm] = useState<Partial<ResourceItem>>({ title: '', type: 'PDF', size: '', url: '' });
  const [scholarshipForm, setScholarshipForm] = useState<ScholarshipData>(homeData.scholarship || {
    title: 'Academic Excellence Scholarship',
    description: 'We offer scholarships to meritorious students based on their academic performance and financial need.',
    image: '',
    applyLink: '',
    isActive: false
  });

  // Buffered settings for the Settings Tab
  const [tempLogo, setTempLogo] = useState<string>(logo);
  const [tempFooter, setTempFooter] = useState<FooterData>({ ...footerData });
  const [tempHome, setTempHome] = useState<HomeData>({ ...homeData });
  const [tempAdmin, setTempAdmin] = useState<AdminUser>({ ...adminProfile });

  // Form Field logic
  const [courseForm, setCourseForm] = useState<{
    name: string;
    icon: string;
    classesPerWeek: number;
    fee: number;
    paymentType: 'Monthly' | 'One-time';
    assignedTeachers: string[];
    thumbnail: string;
    description: string;
    subSubjects: string[];
  }>({ name: '', icon: '📚', classesPerWeek: 3, fee: 0, paymentType: 'Monthly', assignedTeachers: [], thumbnail: '', description: '', subSubjects: [] });

  const [teacherForm, setTeacherForm] = useState({ 
    name: '', 
    subject: '', 
    qualification: '', 
    experience: '', 
    image: '', 
    education: '', 
    email: '', 
    password: '',
    profileType: 'text' as 'text' | 'link' | 'pdf',
    profileContent: ''
  });
  const [examForm, setExamForm] = useState<{
    name: string;
    subject: string;
    date: string;
    totalMarks: number;
    batch: string;
  }>({ 
    name: '', 
    subject: subjects[0]?.name || 'Physics', 
    date: new Date().toISOString().split('T')[0],
    totalMarks: 100,
    batch: 'All'
  });
  const [videoForm, setVideoForm] = useState({ title: '', youtubeUrl: '' });
  const [studentForm, setStudentForm] = useState<Partial<Student>>({});
  const [chatbotForm, setChatbotForm] = useState<Partial<ChatbotKnowledge>>({
    question: '',
    answer: '',
    category: 'Phoenix'
  });
  const [isChatbotModalOpen, setIsChatbotModalOpen] = useState(false);
  const [editingKnowledge, setEditingKnowledge] = useState<ChatbotKnowledge | null>(null);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [isQuickLinksModalOpen, setIsQuickLinksModalOpen] = useState(false);
  const [isSupportLinksModalOpen, setIsSupportLinksModalOpen] = useState(false);
  const navigate = useNavigate();

  // Partial Admin Management
  const [isPartialAdminModalOpen, setIsPartialAdminModalOpen] = useState(false);
  const [editingPartialAdmin, setEditingPartialAdmin] = useState<PartialAdmin | null>(null);
  const [partialAdminForm, setPartialAdminForm] = useState<Omit<PartialAdmin, 'id'>>({
    name: '',
    email: '',
    password: '',
    permissions: [] as string[]
  });

  const isMasterAdmin = currentUser?.email?.toLowerCase() === adminProfile.email.toLowerCase();

  const hasPermission = (permission: string) => {
    if (isMasterAdmin || permission === 'Profile') return true;
    const partialAdmin = adminProfile.partialAdmins?.find(pa => pa.email === currentUser?.email);
    if (!partialAdmin) return currentUser?.permissions?.includes(permission);
    
    const permissionMap: Record<string, string> = {
      'Overview': 'Overview',
      'Profile': 'Profile',
      'Manage Students': 'Manage Students',
      'Manage Faculty': 'Manage Faculty',
      'Course Control': 'Course Control',
      'Exam Management': 'Exam Management',
      'Financial Oversight': 'Financial Oversight',
      'Content Management': 'Content Management',
      'System Security': 'System Security',
      'AI Assistant': 'AI Assistant',
      'Site Branding': 'Site Branding',
      'Reports': 'Reports',
      'Assignments': 'Assignments',
      'Leaderboard': 'Leaderboard',
      'Syllabus Management': 'Syllabus Management'
    };
    
    return partialAdmin.permissions.includes(permissionMap[permission] || permission);
  };

  // Input Refs
  const teacherPicRef = useRef<HTMLInputElement>(null);
  const adminAvatarRef = useRef<HTMLInputElement>(null);
  const logoUploadRef = useRef<HTMLInputElement>(null);
  const heroBgUploadRef = useRef<HTMLInputElement>(null);
  const scholarshipPicRef = useRef<HTMLInputElement>(null);
  const courseThumbnailRef = useRef<HTMLInputElement>(null);

  // Sync Attendance list based on date selection
  useEffect(() => {
    setAttendanceMap(prev => {
      const newMap = { ...prev };
      students.forEach(s => {
        // Only initialize if not already set for this student
        if (newMap[s.id] === undefined) {
          if (s.dailyAttendance && s.dailyAttendance[attendanceDate] !== undefined) {
            newMap[s.id] = s.dailyAttendance[attendanceDate];
          } else {
            newMap[s.id] = false;
          }
        }
      });
      return newMap;
    });
  }, [students, attendanceDate]);

  // Reset map when date changes
  useEffect(() => {
    const initialMap: Record<string, boolean> = {};
    students.forEach(s => {
      if (s.dailyAttendance && s.dailyAttendance[attendanceDate] !== undefined) {
        initialMap[s.id] = s.dailyAttendance[attendanceDate];
      } else {
        initialMap[s.id] = false;
      }
    });
    setAttendanceMap(initialMap);
  }, [attendanceDate]);

  // Modal form population effects
  useEffect(() => {
    if (editingCourse) setCourseForm({ 
      name: editingCourse.name, 
      icon: editingCourse.icon, 
      classesPerWeek: editingCourse.classesPerWeek,
      fee: editingCourse.fee || 0,
      paymentType: editingCourse.paymentType || 'Monthly',
      assignedTeachers: editingCourse.assignedTeachers || [],
      thumbnail: editingCourse.thumbnail || '',
      description: editingCourse.description || '',
      subSubjects: editingCourse.subSubjects || []
    });
    else setCourseForm({ name: '', icon: '📚', classesPerWeek: 3, fee: 0, paymentType: 'Monthly', assignedTeachers: [], thumbnail: '', description: '', subSubjects: [] });
  }, [editingCourse, isCourseModalOpen]);

  useEffect(() => {
    if (editingTeacher) setTeacherForm({ 
      name: editingTeacher.name, 
      subject: editingTeacher.subject, 
      qualification: editingTeacher.qualification, 
      experience: editingTeacher.experience, 
      image: editingTeacher.image,
      education: editingTeacher.education || '',
      email: editingTeacher.email || '',
      password: editingTeacher.password || '',
      profileType: editingTeacher.profileType || 'text',
      profileContent: editingTeacher.profileContent || ''
    });
    else setTeacherForm({ name: '', subject: '', qualification: '', experience: '', image: '', education: '', email: '', password: '', profileType: 'text', profileContent: '' });
  }, [editingTeacher, isTeacherModalOpen]);

  useEffect(() => {
    if (editingVideo) setVideoForm({ title: editingVideo.title, youtubeUrl: editingVideo.youtubeUrl });
    else setVideoForm({ title: '', youtubeUrl: '' });
  }, [editingVideo, isVideoModalOpen]);

  useEffect(() => {
    if (editingKnowledge) {
      setChatbotForm({
        question: editingKnowledge.question,
        answer: editingKnowledge.answer,
        category: editingKnowledge.category
      });
    } else {
      setChatbotForm({ question: '', answer: '', category: 'Phoenix' });
    }
  }, [editingKnowledge, isChatbotModalOpen]);

  // Sync temp settings when entering tab
  useEffect(() => {
    if (activeTab === 'settings' || activeTab === 'stories' || activeTab === 'resources' || activeTab === 'access' || activeTab === 'profile') {
      setTempFooter({ ...footerData });
      setTempHome({ ...homeData });
      setTempAdmin({ ...adminProfile });
      setTempLogo(logo);
    }
  }, [activeTab]); // Only run when tab changes, not when data changes while editing

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Max dimensions for profile/thumbnails
          const MAX_SIZE = 600;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Use lower quality to keep string short
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          callback(dataUrl);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // --- ATTENDANCE SYNC ---
  useEffect(() => {
    if (activeTab === 'attendance') {
      console.log("[Attendance] Loading existing records for:", attendanceDate);
      const newMap: Record<string, boolean> = {};
      students.forEach(s => {
        if (s.dailyAttendance && s.dailyAttendance[attendanceDate] !== undefined) {
          newMap[s.id] = s.dailyAttendance[attendanceDate];
        }
      });
      setAttendanceMap(newMap);
    }
  }, [attendanceDate, activeTab, students]);

  const handleStudentUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setStudents(prev => prev.map(s => s.id === editingStudent.id ? { ...s, ...studentForm } as Student : s));
    setEditingStudent(null);
    setStudentForm({});
    alert("Student profile updated successfully.");
  };

  const handleVerifyStudent = (studentId: string) => {
    setVerifyingStudentId(studentId);
    setBatchInput('');
  };

  const generateId = () => {
    try {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
      }
    } catch (e) {}
    return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
  };

  const handleStorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentStories = tempHome.successStories || [];
    let updated;
    if (editingStory) {
      updated = currentStories.map(s => s.id === editingStory.id ? { ...s, ...storyForm } as SuccessStory : s);
    } else {
      const newStory = { id: generateId(), ...storyForm } as SuccessStory;
      updated = [...currentStories, newStory];
    }
    const newHome = { ...tempHome, successStories: updated };
    setTempHome(newHome);
    setIsStoryModalOpen(false);
    setEditingStory(null);
    setStoryForm({ name: '', achievement: '', institution: '', image: '' });
    
    // Auto-save to global state
    saveSiteConfig(tempLogo, tempAdmin, tempFooter, newHome);
    alert("Success story saved successfully.");
  };

  const deleteStory = (id: string) => {
    if (window.confirm("Delete this success story?")) {
      const updated = (tempHome.successStories || []).filter(s => s.id !== id);
      const newHome = { ...tempHome, successStories: updated };
      setTempHome(newHome);
      saveSiteConfig(tempLogo, tempAdmin, tempFooter, newHome);
    }
  };

  const handleResourceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentResources = tempHome.resources || [];
    let updated;
    if (editingResource) {
      updated = currentResources.map(r => r.id === editingResource.id ? { ...r, ...resourceForm } as ResourceItem : r);
    } else {
      const newResource = { id: generateId(), ...resourceForm } as ResourceItem;
      updated = [...currentResources, newResource];
    }
    const newHome = { ...tempHome, resources: updated };
    setTempHome(newHome);
    setIsResourceModalOpen(false);
    setEditingResource(null);
    setResourceForm({ title: '', type: 'PDF', size: '', url: '' });
    
    // Auto-save to global state
    saveSiteConfig(tempLogo, tempAdmin, tempFooter, newHome);
    alert("Resource saved successfully.");
  };

  const handleScholarshipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newHome = { ...tempHome, scholarship: scholarshipForm };
    setTempHome(newHome);
    setIsScholarshipModalOpen(false);
    
    // Auto-save to global state
    saveSiteConfig(tempLogo, tempAdmin, tempFooter, newHome);
    alert("Scholarship details updated successfully.");
  };

  const deleteResource = (id: string) => {
    if (window.confirm("Delete this resource?")) {
      const updated = (tempHome.resources || []).filter(r => r.id !== id);
      const newHome = { ...tempHome, resources: updated };
      setTempHome(newHome);
      saveSiteConfig(tempLogo, tempAdmin, tempFooter, newHome);
    }
  };

  const confirmVerification = () => {
    if (!verifyingStudentId) return;
    if (!batchInput.trim()) {
      alert("Please assign a batch tag before verifying.");
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    setStudents(prev => prev.map(s => s.id === verifyingStudentId ? { ...s, isVerified: true, joinDate: s.joinDate || today, batch: batchInput } : s));
    setVerifyingStudentId(null);
    setBatchInput('');
    alert("Student verified and assigned to batch: " + batchInput);
  };

  const toggleAttendance = (studentId: string) => {
    setAttendanceMap(prev => {
      const newVal = !prev[studentId];
      console.log(`[Attendance] Toggling student ${studentId} to ${newVal ? 'Present' : 'Absent'}`);
      return { ...prev, [studentId]: newVal };
    });
  };

  const submitAttendance = async () => {
    console.log("[Attendance] Submitting attendance for date:", attendanceDate);
    
    // Ensure all students are in the map
    const missingStudents = students.filter(s => attendanceMap[s.id] === undefined);
    const finalMap = { ...attendanceMap };
    if (missingStudents.length > 0) {
      missingStudents.forEach(s => { finalMap[s.id] = false; });
    }

    // Prepare bulk updates
    const updates = students.map(s => {
      const status = finalMap[s.id] !== undefined ? finalMap[s.id] : false;
      const newDailyAttendance = { ...(s.dailyAttendance || {}), [attendanceDate]: status };
      
      const days = Object.values(newDailyAttendance);
      const presentCount = days.filter(v => v === true).length;
      const newPercentage = days.length > 0 ? (presentCount / days.length) * 100 : 0;
      const formattedPercentage = parseFloat(newPercentage.toFixed(1));

      return {
        id: s.id,
        daily_attendance: newDailyAttendance,
        attendance: formattedPercentage
      };
    });

    setIsCheckingHealth(true); // Re-use for loading state or add a dedicated one
    try {
      console.log("[Attendance/Client] Requesting bulk sync via /api/attendance/bulk-sync");
      const response = await fetch('/api/attendance/bulk-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      });

      if (response.ok) {
        const result = await response.json();
        console.log("[Attendance/Client] Sync result:", result);
        if (result.success) {
          // Update all students locally at once
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
          alert(`Success! Attendance records saved for ${attendanceDate}.\nTotal Students: ${updates.length}\nTotal Present: ${Object.values(finalMap).filter(v => v === true).length}`);
        } else {
          console.error("[Attendance/Client] Sync partial failure:", result);
          alert(`Sync finished with ${result.failures} failures. Please check server logs.\nTip: You may need to run 'Master Sync' to ensure database columns exist.`);
        }
      } else {
        const errorText = await response.text();
        console.error("[Attendance/Client] Server unreachable or returned error:", response.status, errorText);
        alert(`Failed to reach server for bulk sync (Status ${response.status}).\nResponse: ${errorText.substring(0, 50)}...`);
      }
    } catch (err: any) {
      console.error("Bulk sync error:", err);
      alert("Error during bulk sync: " + err.message);
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[Admin] Submitting teacher form. Editing:", editingTeacher?.id || 'New');
    
    try {
      // Check for duplicate emails (excluding the current teacher being edited)
      const isDuplicateEmail = teachers.some(t => 
        t.email?.toLowerCase() === teacherForm.email?.toLowerCase() && 
        (!editingTeacher || String(t.id) !== String(editingTeacher.id))
      );
      
      if (isDuplicateEmail) {
        alert("This email is already assigned to another teacher. Please use a unique email.");
        return;
      }

      if (editingTeacher) {
        setTeachers(prev => {
          const updated = prev.map(t => String(t.id) === String(editingTeacher.id) ? { ...t, ...teacherForm } : t);
          console.log("[Admin] Updated teacher list size:", updated.length);
          return updated;
        });
        alert("Faculty information updated successfully.");
      } else {
        // Generate a unique ID if crypto.randomUUID is not available
        const newId = (typeof crypto !== 'undefined' && crypto.randomUUID) 
          ? crypto.randomUUID() 
          : `teacher_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
        const newTeacher: Teacher = { 
          id: newId, 
          ...teacherForm,
          profileType: teacherForm.profileType,
          profileContent: teacherForm.profileContent
        } as Teacher;
        
        console.log("[Admin] Registering new teacher:", newTeacher);
        setTeachers(prev => [...prev, newTeacher]);
        alert("New teacher registered successfully.");
      }
      
      // Reset form and close modal
      setIsTeacherModalOpen(false);
      setEditingTeacher(null);
      setTeacherForm({ name: '', subject: '', qualification: '', experience: '', image: '', education: '', email: '', password: '', profileType: 'text', profileContent: '' });
    } catch (err) {
      console.error("[Admin] Teacher Submit Error:", err);
      alert("Failed to save teacher information. Please check console for details.");
    }
  };

  const handleCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[Admin] Submitting course form:", courseForm);
    if (editingCourse) {
      setSubjects(prev => prev.map(s => s.id === editingCourse.id ? { ...s, ...courseForm } : s));
      alert("Course details updated.");
    } else {
      const newSubject: Subject = { id: crypto.randomUUID(), ...courseForm } as Subject;
      console.log("[Admin] Adding new course:", newSubject);
      setSubjects(prev => [...prev, newSubject]);
      alert("New course added to curriculum.");
    }
    setIsCourseModalOpen(false);
    setEditingCourse(null);
  };

  const handleExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingExam) {
      setExams(prev => prev.map(ex => ex.id === editingExam.id ? { ...ex, ...examForm } : ex));
      alert("Exam details updated successfully.");
    } else {
      const newExam: Exam = { 
        id: crypto.randomUUID(), 
        ...examForm, 
        marks: {} 
      } as Exam;
      setExams(prev => [...prev, newExam]);
      alert("Exam scheduled and published.");
    }
    setIsExamModalOpen(false);
    setEditingExam(null);
    setExamForm({
      name: '', 
      subject: subjects[0]?.name || 'Physics', 
      date: new Date().toISOString().split('T')[0],
      totalMarks: 100,
      batch: 'All'
    });
  };

  const handleSaveChatbotKnowledge = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingKnowledge) {
      setChatbotKnowledge(prev => prev.map(k => k.id === editingKnowledge.id ? { ...k, ...chatbotForm } as ChatbotKnowledge : k));
      alert("Knowledge entry updated successfully.");
    } else {
      const newKnowledge: ChatbotKnowledge = {
        id: crypto.randomUUID(),
        ...chatbotForm
      } as ChatbotKnowledge;
      setChatbotKnowledge(prev => [...prev, newKnowledge]);
      alert("Knowledge entry added successfully.");
    }
    setIsChatbotModalOpen(false);
    setEditingKnowledge(null);
    setChatbotForm({ question: '', answer: '', category: 'Phoenix' });
  };

  const handleVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Extract YouTube ID for thumbnail
    let videoId = '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = videoForm.youtubeUrl.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    }
    
    const thumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '';
    
    if (editingVideo) {
      setVideoClasses(prev => prev.map(v => String(v.id) === String(editingVideo.id) ? { ...v, ...videoForm, thumbnail } : v));
      alert("Video class updated successfully.");
    } else {
      const newVideo: VideoClass = { id: crypto.randomUUID(), ...videoForm, thumbnail } as VideoClass;
      setVideoClasses(prev => [...prev, newVideo]);
      alert("Video class published successfully.");
    }
    setIsVideoModalOpen(false);
    setEditingVideo(null);
    setVideoForm({ title: '', youtubeUrl: '' });
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
    alert("Exam marks updated and synced successfully.");
  };

  const handleSaveSiteConfig = async () => {
    try {
      await saveSiteConfig(tempLogo, tempAdmin, tempFooter, tempHome);
      alert("Global site configuration saved and deployed successfully.");
    } catch (err) {
      console.error("Save Config Error:", err);
      alert("Failed to save configuration. Please ensure your database table 'site_config' is correctly set up. Check the console for more details.");
    }
  };

  const handlePartialAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentPartialAdmins = tempAdmin.partialAdmins || [];
    let updated;
    if (editingPartialAdmin) {
      updated = currentPartialAdmins.map(pa => pa.id === editingPartialAdmin.id ? { ...pa, ...partialAdminForm } : pa);
    } else {
      const newPA = { id: generateId(), ...partialAdminForm };
      updated = [...currentPartialAdmins, newPA];
    }
    setTempAdmin({ ...tempAdmin, partialAdmins: updated });
    setIsPartialAdminModalOpen(false);
    setEditingPartialAdmin(null);
    setPartialAdminForm({ name: '', email: '', password: '', permissions: [] });
    alert("Partial admin saved. Remember to click 'Update Access' to sync with database.");
  };

  const deletePartialAdmin = (id: string) => {
    if (window.confirm("Delete this partial admin?")) {
      const updated = (tempAdmin.partialAdmins || []).filter(pa => pa.id !== id);
      setTempAdmin({ ...tempAdmin, partialAdmins: updated });
    }
  };

  // Payment Management Handlers
  const toggleFeeStatus = (studentId: string, type: 'monthly' | 'course') => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const field = type === 'monthly' ? 'monthlyFeeStatus' : 'courseFeeStatus';
        const current = s[field] || 'Due';
        const next = current === 'Paid' ? 'Due' : 'Paid';
        return { ...s, [field]: next, feesPaid: next === 'Paid' };
      }
      return s;
    }));
  };

  const toggleSubjectPayment = (studentId: string, subjectId: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const payments = s.subjectPayments || {};
        const current = payments[subjectId] || 'Due';
        const next = current === 'Paid' ? 'Due' : 'Paid';
        return { ...s, subjectPayments: { ...payments, [subjectId]: next } };
      }
      return s;
    }));
  };

  const toggleMonthlyPayment = (studentId: string, subjectId: string, monthKey: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const allMonthly = s.monthlyPayments || {};
        const subMonthly = allMonthly[subjectId] || {};
        const currentStatus = subMonthly[monthKey] || 'Due';
        const nextStatus = currentStatus === 'Paid' ? 'Due' : 'Paid';
        return {
          ...s,
          monthlyPayments: {
            ...allMonthly,
            [subjectId]: {
              ...subMonthly,
              [monthKey]: nextStatus
            }
          }
        };
      }
      return s;
    }));
  };

  const handleAddFee = () => {
    if (!addingFeeForStudent || !feeForm.subjectId) return;

    const newRecord = {
      ...feeForm,
      id: editingFeeRecord ? editingFeeRecord.id : Math.random().toString(36).substr(2, 9),
      paidAmount: Number(feeForm.paidAmount),
      discount: Number(feeForm.discount)
    };

    setStudents(prev => prev.map(s => {
      if (s.id === addingFeeForStudent.id) {
        let updatedRecords = [...(s.feeRecords || [])];
        if (editingFeeRecord) {
          updatedRecords = updatedRecords.map(r => r.id === editingFeeRecord.id ? newRecord : r);
        } else {
          updatedRecords.push(newRecord);
        }
        
        // Re-calculate statuses based on all records for this subject
        // This ensures "accurate calculations"
        let updatedMonthly = { ...(s.monthlyPayments || {}) };
        let updatedSubjectPayments = { ...(s.subjectPayments || {}) };

        if (newRecord.feeType === 'Monthly') {
          const start = new Date(newRecord.fromDate);
          const end = new Date(newRecord.toDate);
          let curr = new Date(start.getFullYear(), start.getMonth(), 1);
          const subMonthly = { ...(updatedMonthly[newRecord.subjectId] || {}) };
          
          while (curr <= end) {
            const key = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}`;
            subMonthly[key] = 'Paid';
            curr.setMonth(curr.getMonth() + 1);
          }
          updatedMonthly[newRecord.subjectId] = subMonthly;
        } else {
          updatedSubjectPayments[newRecord.subjectId] = 'Paid';
        }

        return { 
          ...s, 
          feeRecords: updatedRecords,
          monthlyPayments: updatedMonthly,
          subjectPayments: updatedSubjectPayments
        };
      }
      return s;
    }));

    // Show success feedback
    alert(`Payment of ${newRecord.paidAmount} BDT for ${addingFeeForStudent.name} has been added and is syncing with the database...`);

    setAddingFeeForStudent(null);
    setEditingFeeRecord(null);
    setFeeForm({
      receiptNo: '1',
      paymentDate: new Date().toISOString().split('T')[0],
      subjectId: '',
      feeType: 'Monthly',
      fromDate: new Date().toISOString().split('T')[0],
      toDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
      paidAmount: 0,
      discount: 0,
      paymentMode: 'Cash',
      remarks: ''
    });
  };

  const handleDeleteFee = (studentId: string, recordId: string) => {
    if (!window.confirm('Are you sure you want to delete this payment record? Statuses might need manual adjustment.')) return;
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          feeRecords: s.feeRecords?.filter(r => r.id !== recordId)
        };
      }
      return s;
    }));
  };

  const handleExportPayments = () => {
    const headers = ['Student Name', 'Batch', 'Receipt No', 'Payment Date', 'Subject', 'Fee Type', 'Amount', 'Discount', 'Mode', 'Remarks'];
    const rows: string[][] = [];

    verifiedStudents.forEach(student => {
      if (paymentBatchFilter !== 'All' && (student.batch || 'Unassigned') !== paymentBatchFilter) return;
      
      student.feeRecords?.forEach(record => {
        const subjectName = subjects.find(s => s.id === record.subjectId)?.name || 'Unknown';
        rows.push([
          student.name,
          student.batch || 'Unassigned',
          record.receiptNo,
          record.paymentDate,
          subjectName,
          record.feeType,
          record.paidAmount.toString(),
          record.discount.toString(),
          record.paymentMode,
          record.remarks || ''
        ]);
      });
    });

    if (rows.length === 0) {
      alert("No payment records found to export.");
      return;
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Phoenix_Payments_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateReport = async (format: 'pdf' | 'jpg') => {
    if (!reportRef.current) return;
    setIsGeneratingReport(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: darkMode ? '#0f172a' : '#ffffff'
      });
      
      if (format === 'pdf') {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Phoenix_Report_${reportStudentId}_${new Date().toISOString().split('T')[0]}.pdf`);
      } else {
        const imgData = canvas.toDataURL('image/jpeg', 0.9);
        const link = document.createElement('a');
        link.href = imgData;
        link.download = `Phoenix_Report_${reportStudentId}_${new Date().toISOString().split('T')[0]}.jpg`;
        link.click();
      }
      alert("Report generated successfully!");
    } catch (err) {
      console.error("Report Generation Error:", err);
      alert("Failed to generate report. Please try again.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

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

  // Link Management
  const handleAddLink = (type: 'quick' | 'support' | 'social') => {
    const newLink = { name: 'New Link', url: '#' };
    if (type === 'quick') setTempFooter(p => ({ ...p, quickLinks: [...p.quickLinks, newLink] }));
    else if (type === 'support') setTempFooter(p => ({ ...p, supportLinks: [...p.supportLinks, newLink] }));
    else if (type === 'social') setTempFooter(p => ({ ...p, socialLinks: [...(p.socialLinks || []), newLink] }));
  };

  const handleRemoveLink = (type: 'quick' | 'support' | 'social', index: number) => {
    if (type === 'quick') {
      setTempFooter(p => {
        const newList = [...p.quickLinks];
        newList.splice(index, 1);
        return { ...p, quickLinks: newList };
      });
    } else if (type === 'support') {
      setTempFooter(p => {
        const newList = [...p.supportLinks];
        newList.splice(index, 1);
        return { ...p, supportLinks: newList };
      });
    } else if (type === 'social') {
      setTempFooter(p => {
        const newList = [...(p.socialLinks || [])];
        newList.splice(index, 1);
        return { ...p, socialLinks: newList };
      });
    }
  };

  const handleUpdateLink = (type: 'quick' | 'support' | 'social', index: number, field: 'name' | 'url', value: string) => {
    if (type === 'quick') {
      setTempFooter(p => {
        const newList = [...p.quickLinks];
        newList[index] = { ...newList[index], [field]: value };
        return { ...p, quickLinks: newList };
      });
    } else if (type === 'support') {
      setTempFooter(p => {
        const newList = [...p.supportLinks];
        newList[index] = { ...newList[index], [field]: value };
        return { ...p, supportLinks: newList };
      });
    } else if (type === 'social') {
      setTempFooter(p => {
        const newList = [...(p.socialLinks || [])];
        newList[index] = { ...newList[index], [field]: value };
        return { ...p, socialLinks: newList };
      });
    }
  };

  const pendingStudents = students.filter(s => !s.isVerified);
  const verifiedStudents = students.filter(s => s.isVerified);
  const batches = Array.from(new Set(verifiedStudents.map(s => s.batch || 'Unassigned'))).sort();
  
  const filteredAttendanceStudents = verifiedStudents.filter(s => attendanceBatchFilter === 'All' || (s.batch || 'Unassigned') === attendanceBatchFilter);
  const filteredExamStudents = verifiedStudents.filter(s => examBatchFilter === 'All' || (s.batch || 'Unassigned') === examBatchFilter);

  const isLogoBase64 = tempLogo.startsWith('data:image');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <TrendingUp size={20} />, perm: 'Overview' },
    { id: 'profile', label: 'Profile', icon: <User size={20} />, perm: 'Profile' },
    { id: 'students', label: 'Students', icon: <Users size={20} />, perm: 'Manage Students' },
    { id: 'teachers', label: 'Faculty', icon: <GraduationCap size={20} />, perm: 'Manage Faculty' },
    { id: 'courses', label: 'Courses', icon: <BookOpen size={20} />, perm: 'Course Control' },
    { id: 'classes', label: 'Classes', icon: <Video size={20} />, perm: 'Course Control' },
    { id: 'exams', label: 'Exams', icon: <FileText size={20} />, perm: 'Exam Management' },
    { id: 'assignments', label: 'Assignments', icon: <ClipboardList size={20} />, perm: 'Assignments' },
    { id: 'notices', label: 'Notices', icon: <MessageSquare size={20} />, perm: 'Overview' },
    { id: 'reports', label: 'Reports', icon: <FileDown size={20} />, perm: 'Reports' },
    { id: 'syllabus', label: 'Syllabus', icon: <BookOpen size={20} />, perm: 'Syllabus Management' },
    { id: 'leaderboard', label: 'Leaderboard', icon: <Award size={20} />, perm: 'Leaderboard' },
    { id: 'attendance', label: 'Attendance', icon: <CheckCircle size={20} />, perm: 'Manage Students' },
    { id: 'payments', label: 'Payments', icon: <CreditCard size={20} />, perm: 'Financial Oversight' },
    { id: 'stories', label: 'Stories', icon: <Star size={20} />, perm: 'Content Management' },
    { id: 'resources', label: 'Resources', icon: <Folder size={20} />, perm: 'Content Management' },
    { id: 'scholarship', label: 'Scholarship', icon: <Zap size={20} />, perm: 'Content Management' },
    { id: 'access', label: 'Access', icon: <Shield size={20} />, perm: 'System Security' },
    { id: 'pending', label: 'Pending', icon: <AlertCircle size={20} />, count: pendingStudents.length, perm: 'Manage Students' },
    { id: 'chatbot', label: 'AI Assistant', icon: <Bot size={20} />, perm: 'AI Assistant' },
    { id: 'omr', label: 'OMR System', icon: <Scan size={20} />, perm: 'Exam Management' },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} />, perm: 'Site Branding' }
  ].filter(t => hasPermission(t.perm));

  const handleLogout = () => {
    onLogout();
  };

  useEffect(() => {
    if (activeTab === 'omr') {
      navigate('/omr');
      setActiveTab('overview');
    }
  }, [activeTab, navigate]);

  const handleSendNotice = () => {
    if (!noticeForm.subject || !noticeForm.facultyId || !noticeForm.time) {
      alert("Please fill all required fields");
      return;
    }
    const newNotice: Notice = {
      id: 'notice-' + Date.now().toString(),
      ...noticeForm,
      createdAt: new Date().toISOString()
    };
    setNotices(prev => [newNotice, ...prev]);
    
    const facultyName = teachers.find(t => t.id === noticeForm.facultyId)?.name || 'Unknown Faculty';
    const text = `📢 ${noticeForm.type.toUpperCase()}\n\nSubject: ${noticeForm.subject}\nFaculty: ${facultyName}\nDate: ${noticeForm.date}\nTime: ${noticeForm.time}\nBatch: ${noticeForm.batch}${noticeForm.note ? '\nNote: ' + noticeForm.note : ''}`;
    setSentNoticeText(text);
  };

  const handleCopyNotice = () => {
    navigator.clipboard.writeText(sentNoticeText);
    alert("Notice copied to clipboard!");
  };

  const handleShareWhatsApp = () => {
    if (!sentNoticeText) return;
    const url = `https://wa.me/?text=${encodeURIComponent(sentNoticeText)}`;
    window.open(url, '_blank');
  };

  const handleSendToAllTeachers = () => {
    if (!sentNoticeText) {
      alert("Please generate a notice first");
      return;
    }
    const newNotice: Notice = {
      id: 'notice-' + Date.now().toString(),
      type: noticeForm.type,
      date: noticeForm.date,
      time: noticeForm.time,
      subject: noticeForm.subject,
      facultyId: 'All',
      batch: noticeForm.batch,
      note: noticeForm.note,
      createdAt: new Date().toISOString()
    };
    setNotices(prev => [newNotice, ...prev]);
    alert("Notice broadcasted to all teachers!");
  };

  const handleSendToBatch = () => {
    if (!sentNoticeText) {
      alert("Please generate a notice first");
      return;
    }
    // Logic to send to specific batch
    // This would typically involve creating a new notice record with the selected batch
    const newNotice: Notice = {
      id: 'notice-' + Date.now().toString(),
      type: noticeForm.type,
      date: noticeForm.date,
      time: noticeForm.time,
      subject: noticeForm.subject,
      facultyId: noticeForm.facultyId,
      batch: selectedBatchForNotice,
      note: noticeForm.note,
      createdAt: new Date().toISOString()
    };
    setNotices(prev => [newNotice, ...prev]);
    alert(`Notice sent to batch ${selectedBatchForNotice}!`);
  };

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
              className={`w-full flex items-center justify-between py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                activeTab === t.id 
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                {t.icon}
                {t.label}
              </div>
              {t.count !== undefined && t.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === t.id ? 'bg-white text-orange-600' : 'bg-slate-800 text-slate-400'}`}>
                  {t.count}
                </span>
              )}
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
                  className={`w-full flex items-center justify-between py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                    activeTab === t.id 
                      ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {t.icon}
                    {t.label}
                  </div>
                  {t.count !== undefined && t.count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === t.id ? 'bg-white text-orange-600' : 'bg-slate-800 text-slate-400'}`}>
                      {t.count}
                    </span>
                  )}
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
      <main className="flex-1 h-full overflow-y-auto relative">
        {/* Futuristic Ambient Glows */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 space-y-6 md:space-y-8">
          
          {/* Database Wellness & Diagnostics */}
          <div className="p-8 bg-slate-900/50 border border-white/5 rounded-[40px] space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <ShieldCheck size={120} />
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-orange-500" size={28} />
                  <h4 className="text-3xl font-black uppercase tracking-tighter text-white">System Health</h4>
                </div>
                <p className="text-slate-400 text-sm font-medium">Diagnostic tools and schema synchronization</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={fetchDbHealth}
                  disabled={isCheckingHealth}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-xs font-black uppercase tracking-widest border border-white/5 flex items-center gap-2 text-white"
                >
                  <RefreshCcw size={14} className={isCheckingHealth ? "animate-spin" : ""} />
                  Refresh Status
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Row Counts */}
              <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
                <div className="p-5 bg-black/40 rounded-3xl border border-white/5 hover:border-orange-500/30 transition-colors">
                   <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">Total Students</p>
                   <p className="text-3xl font-black text-white tabular-nums">{dbHealth?.counts?.students ?? '...'}</p>
                </div>
                <div className="p-5 bg-black/40 rounded-3xl border border-white/5 hover:border-orange-500/30 transition-colors">
                   <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">Syllabus Rows</p>
                   <p className="text-3xl font-black text-white tabular-nums">{dbHealth?.counts?.syllabus ?? '...'}</p>
                </div>
              </div>

              {/* Sync Tools */}
              <div className="md:col-span-2 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button 
                    onClick={async () => {
                      setIsCheckingHealth(true);
                      try {
                        const res = await fetch('/api/health/sync-schema-olympiad', { method: 'POST' });
                        const data = await res.json();
                        alert(data.message || "Olympiad schema synced successfully.");
                      } catch (err: any) { alert("Sync Error: " + err.message); }
                      finally { setIsCheckingHealth(false); fetchDbHealth(); }
                    }}
                    className="group h-32 bg-orange-600/10 hover:bg-orange-600/20 border border-orange-500/20 rounded-3xl flex flex-col items-center justify-center gap-3 transition-all p-6 text-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/20">
                      <GraduationCap size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-orange-400">Fix Olympiad</p>
                      <p className="text-[10px] text-orange-400/60 font-medium whitespace-nowrap">Resolves policy existing errors</p>
                    </div>
                  </button>

                  <button 
                    onClick={async () => {
                      setIsCheckingHealth(true);
                      try {
                        const res = await fetch('/api/health/sync-schema', { method: 'POST' });
                        const data = await res.json();
                        alert(data.message || "Student schema synced successfully.");
                      } catch (err: any) { alert("Sync Error: " + err.message); }
                      finally { setIsCheckingHealth(false); fetchDbHealth(); }
                    }}
                    className="group h-32 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 rounded-3xl flex flex-col items-center justify-center gap-3 transition-all p-6 text-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/20">
                      <School size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-blue-400">Fix Students</p>
                      <p className="text-[10px] text-blue-400/60 font-medium whitespace-nowrap">Syncs student table columns</p>
                    </div>
                  </button>
                </div>

                <div className="p-6 bg-orange-500/5 rounded-3xl border border-orange-500/10 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-500 shrink-0">
                    <Shield size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-black uppercase tracking-widest text-orange-500 mb-1">Configuration Status</p>
                    <p className="text-xs text-orange-400/70 leading-relaxed break-all">
                      Project URL: <span className="font-mono text-white">{supabaseUrl}</span>
                    </p>
                    <p className="mt-2 text-[10px] text-orange-400/50 leading-relaxed italic">
                      If your data is missing, ensure you have set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY in your deployment environment variables.
                    </p>
                    
                    <button 
                      onClick={async () => {
                        if (!confirm("This will attempt to run all database setup scripts to restore missing tables. Already existing tables will be skipped. Proceed?")) return;
                        setIsCheckingHealth(true);
                        try {
                          const res = await fetch('/api/health/sync-all', { method: 'POST' });
                          const contentType = res.headers.get("content-type");
                          
                          if (contentType && contentType.includes("application/json")) {
                            const data = await res.json();
                            if (data.success) {
                              const summary = data.results.map((r: any) => `${r.file}: ${r.status}`).join('\n');
                              alert("Master Sync Processed:\n\n" + summary);
                            } else {
                              alert("Sync Failed (JSON): " + (data.error || data.details || "Unknown error"));
                            }
                          } else {
                            const text = await res.text();
                            console.error("Non-JSON response:", text);
                            alert(`Server Error: Received non-JSON response (Status ${res.status}). \n\nThis usually means the API route was not found or the server crashed. Check console for details.`);
                          }
                        } catch (err: any) { 
                          console.error("Fetch implementation error:", err);
                          alert("Sync Error: " + err.message); 
                        }
                        finally { setIsCheckingHealth(false); fetchDbHealth(); }
                      }}
                      className="mt-4 w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2"
                    >
                      <Database size={14} />
                      Master Database Restore
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="md:hidden flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <button onClick={() => setIsSidebarOpen(true)} className="text-slate-600 dark:text-slate-300">
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-black tracking-widest uppercase text-slate-900 dark:text-white">PHOENIX EDU</h2>
            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 font-bold overflow-hidden">
              <img src={getDirectDriveLink(isMasterAdmin ? tempAdmin.avatar : (tempAdmin.partialAdmins?.find(pa => pa.id === currentUser?.id)?.avatar || tempAdmin.avatar))} className="w-full h-full object-cover" alt="Admin" />
            </div>
          </div>

          {/* Admin Branding Header */}
          <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-5 sm:p-10 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[32px] md:rounded-[48px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.2)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full -mr-48 -mt-48 blur-[100px] transition-all group-hover:bg-orange-500/10" />
            
            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 relative z-10 w-full lg:w-auto text-center sm:text-left">
              <div className="relative group/avatar cursor-pointer shrink-0">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full blur opacity-25 group-hover/avatar:opacity-75 transition duration-1000 group-hover/avatar:duration-200"></div>
                <img 
                  src={getDirectDriveLink(isMasterAdmin ? tempAdmin.avatar : (tempAdmin.partialAdmins?.find(pa => pa.id === currentUser?.id)?.avatar || tempAdmin.avatar))} 
                  className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white dark:border-slate-700 shadow-2xl object-cover" 
                  alt="Admin" 
                />
                <button onClick={() => adminAvatarRef.current?.click()} className="absolute inset-0 bg-black/60 text-white rounded-full opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center text-[10px] font-black uppercase tracking-widest transition-all">Change</button>
                <input 
                  type="file" 
                  hidden 
                  ref={adminAvatarRef} 
                  onChange={(e) => handleFileUpload(e, (b) => {
                    if (isMasterAdmin) {
                      setTempAdmin({...tempAdmin, avatar: b});
                    } else {
                      const updated = (tempAdmin.partialAdmins || []).map(pa => 
                        pa.id === currentUser?.id ? { ...pa, avatar: b } : pa
                      );
                      setTempAdmin({...tempAdmin, partialAdmins: updated});
                    }
                  })} 
                />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-tight">
                  {isMasterAdmin ? tempAdmin.name : (tempAdmin.partialAdmins?.find(pa => pa.id === currentUser?.id)?.name || tempAdmin.name)}
                </h1>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="px-3 py-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-orange-500/20">
                    {isMasterAdmin ? 'System Admin' : 'Partial Admin'}
                  </span>
                  <span className="px-3 py-1 bg-slate-500/10 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-slate-500/20">Management Hub</span>
                </div>
              </div>
            </div>
          </header>

      {/* TAB: Overview Summary */}
      {activeTab === 'overview' && (
        <div className="space-y-12 p-6 md:p-12">
          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              { label: 'Verified Students', value: verifiedStudents.length, color: 'from-blue-600 to-cyan-400', icon: <Users className="text-white" size={28} />, trend: '+12% this month', bg: 'bg-blue-500/10' },
              { label: 'Active Faculty', value: teachers.length, color: 'from-blue-600 to-cyan-400', icon: <GraduationCap className="text-white" size={28} />, trend: 'Stable', bg: 'bg-blue-500/10' },
              { label: 'Current Exams', value: exams.length, color: 'from-orange-600 to-amber-400', icon: <FileText className="text-white" size={28} />, trend: '3 active now', bg: 'bg-orange-500/10' }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group p-6 sm:p-10 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.2)] relative overflow-hidden hover:scale-[1.02] transition-all duration-500"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-5 blur-3xl group-hover:opacity-10 transition-opacity duration-700`} />
                <div className="relative z-10 space-y-6">
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-xl shadow-blue-500/20 transform group-hover:rotate-6 transition-transform`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.value}</h3>
                      <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">{stat.trend}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions & System Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] sm:rounded-[56px] p-6 sm:p-12 space-y-8 sm:space-y-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/5 blur-[100px]"></div>
              <div className="flex items-center justify-between relative z-10">
                <div className="space-y-1">
                  <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter">Command Center</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Instant Administrative Actions</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-xl">
                  <Zap size={20} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 relative z-10">
                {[
                  { label: 'Add Student', icon: <UserPlus size={24} />, tab: 'students', color: 'from-blue-600 to-cyan-500', shadow: 'shadow-blue-500/20' },
                  { label: 'Mark Attendance', icon: <CheckCircle size={24} />, tab: 'attendance', color: 'from-green-600 to-emerald-500', shadow: 'shadow-green-500/20' },
                  { label: 'Post Exam', icon: <FileText size={24} />, tab: 'exams', color: 'from-blue-600 to-cyan-500', shadow: 'shadow-blue-500/20' },
                  { label: 'Scholarship', icon: <Zap size={24} />, tab: 'scholarship', color: 'from-yellow-600 to-orange-500', shadow: 'shadow-yellow-500/20' },
                  { label: 'Manage Fees', icon: <CreditCard size={24} />, tab: 'fees', color: 'from-teal-600 to-emerald-500', shadow: 'shadow-teal-500/20' },
                  { label: 'Update Site', icon: <Settings size={24} />, tab: 'settings', color: 'from-orange-600 to-amber-500', shadow: 'shadow-orange-500/20' }
                ].map((action, i) => (
                  <button 
                    key={i}
                    onClick={() => setActiveTab(action.tab)}
                    className="group flex flex-row sm:flex-col items-center gap-4 sm:gap-6 p-5 sm:p-8 bg-white/5 border border-white/10 rounded-[24px] sm:rounded-[40px] transition-all hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] text-left sm:text-center"
                  >
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white shadow-2xl ${action.shadow} group-hover:scale-110 transition-transform shrink-0`}>
                      {action.icon}
                    </div>
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Database Wellness Card */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 sm:p-12 space-y-8 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px]"></div>
               <div className="flex items-center justify-between relative z-10">
                <div className="space-y-1">
                  <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter text-emerald-400">Database Wellness</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Infrastructure Stability Monitor</p>
                </div>
                <div className="flex flex-col md:flex-row gap-2 relative z-10">
                  <button 
                    onClick={async () => {
                      if (!confirm("This will attempt to fix missing student columns (like daily_attendance). Proceed?")) return;
                      setIsCheckingHealth(true);
                      try {
                        const res = await fetch('/api/health/sync-schema', { method: 'POST' });
                        const text = await res.text();
                        let data: any = {};
                        try {
                          data = JSON.parse(text);
                        } catch (e) {
                          console.error("Non-JSON Response:", text);
                          alert("Server error: " + text.substring(0, 200));
                          return;
                        }

                        if (res.ok) {
                          alert(data.message || "Students table synced successfully!");
                          fetchDbHealth();
                        } else {
                          alert("Sync failed: " + (data.message || data.error || res.statusText));
                        }
                      } catch (e: any) {
                        alert("Network error: " + e.message);
                      } finally {
                        setIsCheckingHealth(false);
                      }
                    }}
                    className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase rounded-xl hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50"
                    disabled={isCheckingHealth}
                  >
                    Fix Student DB
                  </button>
                  <button 
                    onClick={async () => {
                      if (!confirm("This will attempt to create Olympiad tables in Supabase. Proceed?")) return;
                      setIsCheckingHealth(true);
                      try {
                        const res = await fetch('/api/health/sync-schema-olympiad', { method: 'POST' });
                        const text = await res.text();
                        let data: any = {};
                        try {
                          data = JSON.parse(text);
                        } catch (e) {
                          console.error("Non-JSON Response:", text);
                          alert("Server error: " + text.substring(0, 200));
                          return;
                        }

                        if (res.ok) {
                          alert(data.message || "Olympiad tables synced successfully!");
                          fetchDbHealth();
                        } else {
                          if (data.error === "RPC_MISSING") {
                            const shouldCopy = confirm(data.message + "\n\nWould you like to copy the SQL script to clipboard to run it manually in Supabase?");
                            if (shouldCopy && data.sql) {
                              navigator.clipboard.writeText(data.sql);
                              alert("SQL copied! Paste it into your Supabase SQL Editor and click 'Run'.");
                            }
                          } else {
                            alert("Olympiad Fix Failed: " + (data.message || data.error || res.statusText));
                          }
                        }
                      } catch (e: any) {
                        alert("Network error during Olympiad fix: " + e.message);
                      } finally {
                        setIsCheckingHealth(false);
                      }
                    }}
                    className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase rounded-xl hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50"
                    disabled={isCheckingHealth}
                  >
                    Fix Olympiad DB
                  </button>
                  <button 
                    onClick={fetchDbHealth}
                    disabled={isCheckingHealth}
                    className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all ${isCheckingHealth ? 'animate-spin' : ''}`}
                  >
                    <RefreshCw size={20} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                 {dbHealth?.tables ? Object.entries(dbHealth.tables).map(([tableName, status]: [string, any]) => (
                   <div key={tableName} className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${status.exists ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`}></div>
                          <span className="text-sm font-black text-white uppercase tracking-widest">{tableName}</span>
                        </div>
                        <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${status.exists ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          {status.exists ? 'Operational' : 'Critical - Missing Table'}
                        </span>
                      </div>
                      
                      {status.exists && status.columns && (
                        <div className="space-y-2 pt-2 border-t border-white/5">
                          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Column Integrity Check:</p>
                          <div className="flex flex-wrap gap-2">
                             {Object.entries(status.columns).map(([col, exists]: [string, any]) => (
                               <span key={col} className={`text-[8px] font-bold px-2 py-1 rounded-lg border ${exists ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5' : 'border-red-500/30 text-red-500 bg-red-500/5'}`}>
                                 {col}: {exists ? '✓' : '⚠️ Missing'}
                               </span>
                             ))}
                          </div>
                      </div>
                      )}
                   </div>
                 )) : (
                   <div className="col-span-full py-12 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">
                     {isCheckingHealth ? "Scanning Infrastructure..." : "Unable to load health status."}
                   </div>
                 )}
              </div>

              {dbHealth?.tables?.students?.columns?.daily_attendance === false && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 relative z-10">
                   <AlertCircle className="text-red-500 shrink-0" size={18} />
                   <div className="space-y-1">
                      <p className="text-[10px] text-red-400 font-bold leading-relaxed uppercase">
                        <b>Urgent:</b> The 'daily_attendance' column is missing from your 'students' table. Attendance tracking will not persist.
                      </p>
                      <p className="text-[9px] text-slate-500 font-medium">Please contact technical support or check your Supabase schema.</p>
                   </div>
                </div>
              )}
            </div>

            {batches.length === 0 && (
              <div className="p-8 bg-orange-500/10 border border-orange-500/20 rounded-[40px] flex items-start gap-4">
                <AlertCircle className="text-orange-500 shrink-0" size={24} />
                <div className="space-y-2">
                  <h4 className="text-orange-500 font-bold uppercase tracking-tight">Syllabus Setup Warning</h4>
                  <p className="text-sm text-slate-400 font-medium">
                    No verified student batches found. Please verify at least one student and assign them a batch (e.g., 'HSC 2025') to enable batch-wise syllabus tracking.
                  </p>
                </div>
              </div>
            )}
            
            <SyllabusTracker role={UserRole.ADMIN} currentUser={null} batches={batches.length > 0 ? batches : ['HSC 2025', 'HSC 2026', 'Admission', 'SSC 2025']} teachers={teachers} />
          </div>
        </div>
      )}


      {/* TAB: Verified Students Directory */}
      {activeTab === 'students' && (
        <div className="space-y-8 p-6 md:p-12">
          <div className="bg-white/5 backdrop-blur-2xl rounded-[48px] shadow-2xl border border-white/10 overflow-hidden">
            <div className="p-10 md:p-12 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-8 bg-white/5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/5 blur-[100px]"></div>
              <div className="space-y-2 relative z-10">
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Student Directory</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Verified Academic Records</p>
              </div>
              <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
              </div>
            </div>
            <div className="overflow-x-auto hide-scrollbar">
              <table className="w-full text-left min-w-[1000px]">
                <thead>
                  <tr className="bg-white/5">
                    <th className="px-12 py-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Student Profile</th>
                    <th className="px-12 py-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Academic Group</th>
                    <th className="px-12 py-8 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Management</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {verifiedStudents.map(student => (
                    <tr key={student.id} className="hover:bg-white/5 group transition-all">
                      <td className="px-12 py-10">
                        <div className="flex items-center space-x-6">
                          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center text-white font-black text-2xl shadow-2xl group-hover:scale-110 transition-transform duration-500">
                            {student.name.charAt(0)}
                          </div>
                          <div className="space-y-1">
                            <p className="font-black text-white text-xl tracking-tighter flex items-center gap-3">
                              {student.name}
                              {student.isBlocked && (
                                <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-[10px] font-black uppercase tracking-tighter shadow-lg shadow-red-500/10">Suspended</span>
                              )}
                            </p>
                            <p className="text-xs text-slate-500 font-black uppercase tracking-[0.2em]">{student.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-12 py-10">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 border border-blue-500/20 px-5 py-2.5 rounded-xl uppercase tracking-[0.2em]">{student.class}</span>
                          <span className="text-[10px] font-black text-orange-400 bg-orange-500/10 border border-orange-500/20 px-5 py-2.5 rounded-xl uppercase tracking-[0.2em]">{student.batch || 'Unassigned'}</span>
                        </div>
                      </td>
                      <td className="px-12 py-10 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button onClick={() => setViewingStudent(student)} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-lg hover:shadow-blue-600/20 transition-all active:scale-90" title="View Details">
                            <ChevronRight size={20} />
                          </button>
                          <button 
                            onClick={() => {
                              const newStatus = !student.isBlocked;
                              setStudents(prev => prev.map(s => s.id === student.id ? { ...s, isBlocked: newStatus } : s));
                              alert(`Student account ${newStatus ? 'suspended' : 'activated'} successfully.`);
                            }} 
                            className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-all active:scale-90 ${student.isBlocked ? 'text-green-500 hover:bg-green-600 hover:text-white hover:border-green-600 hover:shadow-lg hover:shadow-green-600/20' : 'text-red-500 hover:bg-red-600 hover:text-white hover:border-red-600 hover:shadow-lg hover:shadow-red-600/20'}`}
                            title={student.isBlocked ? "Activate Account" : "Suspend Account"}
                          >
                            {student.isBlocked ? <CheckCircle size={20} /> : <Ban size={20} />}
                          </button>
                          <button onClick={() => { setEditingStudent(student); setStudentForm(student); }} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-orange-600 hover:text-white hover:border-orange-600 hover:shadow-lg hover:shadow-orange-600/20 transition-all active:scale-90" title="Edit Profile">
                            <Edit size={20} />
                          </button>
                          <button onClick={() => deleteStudent(student.id)} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-red-600 hover:text-white hover:border-red-600 hover:shadow-lg hover:shadow-red-600/20 transition-all active:scale-90" title="Delete Record">
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {verifiedStudents.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-40 text-center">
                        <div className="flex flex-col items-center gap-6 opacity-40">
                          <div className="w-24 h-24 rounded-[40px] bg-white/5 border border-white/10 flex items-center justify-center text-slate-600">
                            <Users size={48} />
                          </div>
                          <p className="font-black text-slate-600 uppercase tracking-[0.4em] text-sm">No students verified yet</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Payments Management */}
      {activeTab === 'payments' && (
        <div className="space-y-6 md:space-y-6 md:space-y-12">
          {/* Collection Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-6 md:p-12">
            <div className="p-6 md:p-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl md:rounded-[48px] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-3xl"></div>
              <p className="text-xs font-bold text-slate-500 mb-6 uppercase tracking-[0.2em]">Monthly Collection (Recent)</p>
              <div className="space-y-4">
                {(() => {
                  const monthlyTotals: Record<string, number> = {};
                  students.forEach(s => {
                    s.feeRecords?.forEach(r => {
                      if (r.feeType === 'Monthly') {
                        const date = new Date(r.paymentDate);
                        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                        monthlyTotals[key] = (monthlyTotals[key] || 0) + r.paidAmount;
                      }
                    });
                  });
                  return Object.entries(monthlyTotals).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 4).map(([month, total]) => (
                    <div key={month} className="flex justify-between items-center p-4 bg-white/5 border border-white/5 rounded-2xl">
                      <span className="text-sm font-bold text-white uppercase tracking-tight">{new Date(month + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                      <span className="text-xl font-bold text-green-500 tracking-tighter">{total.toLocaleString()} BDT</span>
                    </div>
                  ));
                })()}
              </div>
            </div>
            <div className="p-6 md:p-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl md:rounded-[48px] shadow-2xl relative overflow-hidden flex flex-col justify-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl"></div>
              <p className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-[0.2em]">One-Time Collection (Total)</p>
              <p className="text-7xl font-bold text-blue-500 tracking-tighter">
                {students.reduce((acc, s) => acc + (s.feeRecords?.filter(r => r.feeType === 'One-time').reduce((sum, r) => sum + r.paidAmount, 0) || 0), 0).toLocaleString()}
                <span className="text-2xl ml-2 text-slate-600">BDT</span>
              </p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-3xl md:rounded-3xl md:rounded-[40px] shadow-2xl border border-white/10 overflow-hidden">
            <div className="p-10 border-b border-white/10 bg-white/5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 md:gap-4 md:gap-6">
               <div className="space-y-1">
                 <h3 className="text-2xl font-bold text-white uppercase tracking-tighter">Master Ledger</h3>
                 <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em]">Unified Payment Controls</p>
               </div>
               <div className="flex flex-wrap items-center gap-4">
                 <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl">
                   <Filter size={14} className="text-slate-500" />
                   <select 
                     className="bg-transparent text-xs font-bold text-white uppercase tracking-widest focus:outline-none"
                     value={paymentBatchFilter}
                     onChange={(e) => setPaymentBatchFilter(e.target.value)}
                   >
                     <option value="All">All Batches</option>
                     {batches.map(b => <option key={b} value={b}>{b}</option>)}
                   </select>
                 </div>
                 <button 
                   onClick={handleExportPayments}
                   className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
                 >
                   <Download size={14} />
                   Export Report
                 </button>
               </div>
            </div>
            <div className="overflow-x-auto hide-scrollbar">
              <table className="w-full text-left min-w-[1000px]">
                <thead>
                  <tr className="bg-white/5">
                    <th className="px-8 py-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Student & Plan</th>
                    <th className="px-8 py-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Monthly Summary</th>
                    <th className="px-8 py-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Course-Wise Breakdown</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {verifiedStudents.filter(s => paymentBatchFilter === 'All' || (s.batch || 'Unassigned') === paymentBatchFilter).map(student => (
                    <tr key={student.id} className="hover:bg-white/5 group transition-colors align-top">
                      <td className="px-8 py-6">
                        <div className="space-y-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white font-bold text-lg">
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-white text-lg tracking-tight">{student.name}</p>
                              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{student.class} • {student.batch || 'Unassigned'}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => { 
                              setAddingFeeForStudent(student); 
                              const firstSub = subjects.find(sub => student.subjects.includes(sub.name));
                              setFeeForm({ 
                                receiptNo: (student.feeRecords?.length || 0) + 1,
                                paymentDate: new Date().toISOString().split('T')[0],
                                subjectId: firstSub?.id || '',
                                feeType: firstSub?.paymentType || 'Monthly',
                                fromDate: new Date().toISOString().split('T')[0],
                                toDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
                                paidAmount: firstSub?.fee || 0,
                                discount: 0,
                                paymentMode: 'Cash',
                                remarks: ''
                              });
                              setEditingFeeRecord(null);
                            }} 
                            className="w-full px-4 py-3 bg-green-500/10 border border-green-500/20 text-green-500 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all flex items-center justify-center gap-2"
                          >
                            <Plus size={14} />
                            Add Payment
                          </button>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <button 
                          onClick={() => toggleFeeStatus(student.id, 'monthly')}
                          className={`px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all border ${
                            student.monthlyFeeStatus === 'Paid' 
                              ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                              : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white'
                          }`}
                        >
                          Monthly: {student.monthlyFeeStatus || 'Due'}
                        </button>
                      </td>
                      <td className="px-8 py-6">
                        <div className="grid grid-cols-1 gap-4">
                          {subjects.filter(s => student.subjects.includes(s.name)).map(sub => {
                            const type = student.subjectPaymentTypes?.[sub.id] || sub.paymentType || 'Monthly';
                            return (
                              <div key={sub.id} className="p-6 bg-white/5 border border-white/5 rounded-[32px] hover:border-white/10 transition-all space-y-4">
                                 <div className="flex items-center justify-between gap-4">
                                   <div className="min-w-0">
                                     <p className="text-sm font-bold text-white uppercase tracking-tight truncate">{sub.name}</p>
                                     <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{sub.fee} BDT • {type}</p>
                                   </div>
                                   {type === 'One-time' && (
                                     <button 
                                       onClick={() => toggleSubjectPayment(student.id, sub.id)}
                                       className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${ (student.subjectPayments?.[sub.id] === 'Paid') ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-white/5 text-slate-500 border border-white/10'}`}
                                     >
                                       {student.subjectPayments?.[sub.id] || 'Due'}
                                     </button>
                                   )}
                                 </div>

                                 {type === 'Monthly' && (
                                   <div className="pt-4 border-t border-white/5">
                                     <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-3">Payment History</p>
                                     <div className="flex flex-wrap gap-2">
                                       {(() => {
                                         const months = [];
                                         const enrollDate = student.subjectEnrollmentDates?.[sub.id] || student.joinDate || new Date().toISOString().split('T')[0];
                                         const start = new Date(enrollDate);
                                         const end = new Date();
                                         let curr = new Date(start.getFullYear(), start.getMonth(), 1);
                                         
                                         while (curr <= end) {
                                           const monthKey = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}`;
                                           const monthLabel = curr.toLocaleString('default', { month: 'short' });
                                           months.push({ key: monthKey, label: monthLabel });
                                           curr.setMonth(curr.getMonth() + 1);
                                         }

                                         return months.reverse().map(m => {
                                           const status = student.monthlyPayments?.[sub.id]?.[m.key] || 'Due';
                                           return (
                                             <button
                                               key={m.key}
                                               onClick={() => toggleMonthlyPayment(student.id, sub.id, m.key)}
                                               className={`px-3 py-1.5 rounded-xl text-[9px] font-bold transition-all border ${
                                                 status === 'Paid' 
                                                   ? 'bg-blue-500 text-white border-blue-600 shadow-lg shadow-blue-500/20' 
                                                   : 'bg-white/5 text-slate-500 border-white/10 hover:border-blue-500'
                                               }`}
                                             >
                                               {m.label}: {status}
                                             </button>
                                           );
                                         });
                                       })()}
                                     </div>
                                   </div>
                                 )}
                              </div>
                            );
                          })}

                          {/* Fee Records History */}
                          {student.feeRecords && student.feeRecords.length > 0 && (
                            <div className="pt-4 border-t border-white/10">
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Recent Transactions</p>
                              <div className="space-y-2">
                                {student.feeRecords.slice().reverse().map(record => (
                                  <div key={record.id} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 text-xs">
                                    <div className="min-w-0">
                                      <p className="font-bold text-white truncate tracking-tight">#{record.receiptNo} • {record.paidAmount} BDT</p>
                                      <p className="text-slate-500 truncate font-bold uppercase tracking-widest">{record.paymentDate} • {subjects.find(s => s.id === record.subjectId)?.name || 'Unknown'}</p>
                                    </div>
                                    <div className="flex gap-3 flex-shrink-0">
                                      <button 
                                        onClick={() => {
                                          setAddingFeeForStudent(student);
                                          setEditingFeeRecord(record);
                                          setFeeForm(record);
                                        }}
                                        className="text-blue-500 hover:text-blue-400 font-bold uppercase tracking-widest"
                                      >
                                        Edit
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteFee(student.id, record.id)}
                                        className="text-red-500 hover:text-red-400 font-bold uppercase tracking-widest"
                                      >
                                        Del
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Profile Management */}
      {activeTab === 'profile' && (
        <div className="space-y-6 md:space-y-12 pb-20">
          {/* Admin Profile Management */}
          <div className="bg-white dark:bg-slate-800 p-6 md:p-12 rounded-3xl md:rounded-[48px] border dark:border-slate-700 shadow-2xl space-y-6 md:space-y-8">
            <h3 className="text-2xl md:text-3xl font-bold">Admin Profile</h3>
            <div className="flex flex-col md:flex-row gap-10 items-center">
              <div className="relative group/avatar cursor-pointer">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full blur opacity-25 group-hover/avatar:opacity-75 transition duration-1000 group-hover/avatar:duration-200"></div>
                <img 
                  src={getDirectDriveLink(isMasterAdmin ? tempAdmin.avatar : (tempAdmin.partialAdmins?.find(pa => pa.id === currentUser?.id)?.avatar || tempAdmin.avatar))} 
                  className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white/20 shadow-2xl object-cover" 
                  alt="Admin" 
                />
                <button 
                  onClick={() => adminAvatarRef.current?.click()} 
                  className="absolute inset-0 bg-black/60 text-white rounded-full opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center text-xs font-bold uppercase tracking-widest transition-all"
                >
                  Change Avatar
                </button>
                <input 
                  type="file" 
                  hidden 
                  ref={adminAvatarRef} 
                  onChange={(e) => handleFileUpload(e, (b) => {
                    if (isMasterAdmin) {
                      setTempAdmin({...tempAdmin, avatar: b});
                    } else {
                      const updated = (tempAdmin.partialAdmins || []).map(pa => 
                        pa.id === currentUser?.id ? { ...pa, avatar: b } : pa
                      );
                      setTempAdmin({...tempAdmin, partialAdmins: updated});
                    }
                  })} 
                />
              </div>
              <div className="flex-1 w-full space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-2">Display Name</label>
                  <input 
                    type="text" 
                    className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold text-xl" 
                    value={isMasterAdmin ? tempAdmin.name : (tempAdmin.partialAdmins?.find(pa => pa.id === currentUser?.id)?.name || '')} 
                    onChange={e => {
                      if (isMasterAdmin) {
                        setTempAdmin({...tempAdmin, name: e.target.value});
                      } else {
                        const updated = (tempAdmin.partialAdmins || []).map(pa => 
                          pa.id === currentUser?.id ? { ...pa, name: e.target.value } : pa
                        );
                        setTempAdmin({...tempAdmin, partialAdmins: updated});
                      }
                    }} 
                  />
                </div>
                <div className="pt-4">
                  <button 
                    onClick={handleSaveSiteConfig}
                    className="bg-orange-500 text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-xl hover:bg-orange-600 transition-all flex items-center gap-2"
                  >
                    Save Profile Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Access & Security Management */}
      {activeTab === 'access' && (
        <div className="space-y-6 md:space-y-6 md:space-y-12 pb-20">
          {/* System Permissions */}
          <div className="bg-white dark:bg-slate-800 p-6 md:p-12 rounded-3xl md:rounded-[48px] border dark:border-slate-700 shadow-2xl space-y-6 md:space-y-8">
            <h3 className="text-2xl md:text-3xl font-bold">System Permissions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'Manage Students', desc: 'Approve, Edit, Block students' },
                { label: 'Manage Faculty', desc: 'Add, Edit, Remove teachers' },
                { label: 'Course Control', desc: 'Modify curriculum & fees' },
                { label: 'Exam Management', desc: 'Publish exams & results' },
                { label: 'Site Branding', desc: 'Logo, Colors, Hero section' },
                { label: 'Content Management', desc: 'Stories, Resources, About' },
                { label: 'Financial Oversight', desc: 'Fee records & payments' },
                { label: 'System Security', desc: 'Admin credentials & access' },
                { label: 'AI Assistant', desc: 'Chatbot knowledge base' }
              ].map((perm, i) => (
                <div key={i} className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border dark:border-slate-700 flex items-start gap-4">
                  <div className="mt-1 w-5 h-5 rounded-md bg-green-500 flex items-center justify-center text-white">
                    <Check size={12} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{perm.label}</p>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{perm.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-orange-500/10 border border-orange-500/20 rounded-3xl">
              <p className="text-xs text-orange-500 font-bold leading-relaxed">
                <b>Note:</b> You are currently logged in as the <b>Master Administrator</b>. All system permissions are granted by default and cannot be revoked for this account.
              </p>
            </div>
          </div>

          {/* Security Credentials */}
          <div className="bg-white dark:bg-slate-800 p-6 md:p-12 rounded-3xl md:rounded-[48px] border dark:border-slate-700 shadow-2xl space-y-6 md:space-y-8">
            <h3 className="text-2xl md:text-3xl font-bold">Security Credentials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2"><label className="text-xs font-bold text-slate-400 uppercase ml-2">Master Email</label><input type="email" className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold text-blue-600" value={tempAdmin.email} onChange={e => setTempAdmin({...tempAdmin, email: e.target.value})} /></div>
              <div className="space-y-2"><label className="text-xs font-bold text-slate-400 uppercase ml-2">Access Password</label><input type="text" className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold" value={tempAdmin.password} onChange={e => setTempAdmin({...tempAdmin, password: e.target.value})} /></div>
            </div>
          </div>

          {/* Partial Admins Management */}
          {isMasterAdmin && (
            <div className="bg-white dark:bg-slate-800 p-6 md:p-12 rounded-3xl md:rounded-[48px] border dark:border-slate-700 shadow-2xl space-y-6 md:space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl md:text-3xl font-bold">Partial Admins</h3>
                <button 
                  onClick={() => { setEditingPartialAdmin(null); setPartialAdminForm({ name: '', email: '', password: '', permissions: [] }); setIsPartialAdminModalOpen(true); }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all"
                >
                  + Add Partial Admin
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(tempAdmin.partialAdmins || []).map((pa) => (
                  <div key={pa.id} className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border dark:border-slate-700 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-lg">{pa.name}</p>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{pa.email}</p>
                      <p className="text-[10px] text-blue-500 font-bold uppercase mt-2">{pa.permissions.length} Permissions Granted</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingPartialAdmin(pa); setPartialAdminForm({ name: pa.name, email: pa.email, password: pa.password, permissions: pa.permissions }); setIsPartialAdminModalOpen(true); }} className="p-3 bg-white dark:bg-slate-800 rounded-xl text-slate-400 hover:text-blue-500 shadow-sm transition-all"><Edit size={16} /></button>
                      <button onClick={() => deletePartialAdmin(pa.id)} className="p-3 bg-white dark:bg-slate-800 rounded-xl text-slate-400 hover:text-red-500 shadow-sm transition-all"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
                {(tempAdmin.partialAdmins || []).length === 0 && (
                  <div className="col-span-2 p-10 text-center text-slate-400 font-bold uppercase tracking-widest border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl">
                    No partial admins configured
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="pt-10 border-t dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4 md:gap-6">
            <div className="flex items-center space-x-3 text-slate-400">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-bold uppercase tracking-widest">Security Sync Active</span>
            </div>
            <div className="flex gap-4">
              <button onClick={handleSaveSiteConfig} className="bg-orange-500 text-white px-16 py-5 rounded-[24px] font-bold text-lg shadow-2xl hover:bg-orange-600 transition-all active:scale-95">Update Access</button>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Pending Admissions Queue */}
      {/* TAB: Success Stories Management */}
      {activeTab === 'stories' && (
        <div className="space-y-6 md:space-y-10 pb-20">
          {/* Page Header Settings */}
          <div className="bg-white dark:bg-slate-800 p-6 md:p-12 rounded-3xl md:rounded-[48px] border dark:border-slate-700 shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl md:text-3xl font-bold">Page Header</h3>
              <button onClick={handleSaveSiteConfig} className="px-6 py-3 bg-orange-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-orange-600 transition-all active:scale-95">Save Header</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">Title</label>
                <input type="text" className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-bold" value={tempHome.successStoriesPage?.title || ''} onChange={e => setTempHome({...tempHome, successStoriesPage: {...(tempHome.successStoriesPage || {title: '', subtitle: '', content: ''}), title: e.target.value}})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">Subtitle</label>
                <input type="text" className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-medium" value={tempHome.successStoriesPage?.subtitle || ''} onChange={e => setTempHome({...tempHome, successStoriesPage: {...(tempHome.successStoriesPage || {title: '', subtitle: '', content: ''}), subtitle: e.target.value}})} />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <h3 className="text-3xl font-bold">Student Hall of Fame</h3>
            <button 
              onClick={() => { setEditingStory(null); setStoryForm({ name: '', achievement: '', institution: '', image: '' }); setIsStoryModalOpen(true); }}
              className="px-8 py-4 bg-orange-500 text-white rounded-2xl font-bold text-sm hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 active:scale-95"
            >
              + Add New Story
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(tempHome.successStories || []).map((story, idx) => {
              const storyId = story.id || `story-${idx}`;
              return (
                <div key={`${storyId}-${idx}`} className="bg-white dark:bg-slate-800 rounded-[32px] border dark:border-slate-700 overflow-hidden shadow-lg group">
                  <div className="aspect-square bg-slate-100 dark:bg-slate-900 relative overflow-hidden">
                    <img src={getDirectDriveLink(story.image)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                      <button onClick={() => { setEditingStory(story); setStoryForm(story); setIsStoryModalOpen(true); }} className="p-4 bg-white text-slate-700 rounded-full hover:scale-110 transition-transform shadow-xl"><Edit size={20} /></button>
                      <button onClick={() => deleteStory(storyId)} className="p-4 bg-red-500 text-white rounded-full hover:scale-110 transition-transform shadow-xl"><Trash2 size={20} /></button>
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="text-xl font-bold mb-1">{story.name}</h4>
                    <p className="text-orange-500 font-bold text-sm mb-2">{story.achievement}</p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{story.institution}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: Resources Management */}
      {/* Partial Admin Modal */}
      {isPartialAdminModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl md:rounded-[48px] shadow-2xl p-10 space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">{editingPartialAdmin ? 'Edit Access' : 'New Partial Admin'}</h2>
              <button onClick={() => setIsPartialAdminModalOpen(false)} className="text-slate-400 hover:text-red-500 font-bold text-2xl transition-all">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handlePartialAdminSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">Full Name</label>
                <input required type="text" className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold" value={partialAdminForm.name} onChange={e => setPartialAdminForm({...partialAdminForm, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">Email Address</label>
                <input required type="email" className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold" value={partialAdminForm.email} onChange={e => setPartialAdminForm({...partialAdminForm, email: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">Login Password</label>
                <input required type="text" className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold" value={partialAdminForm.password} onChange={e => setPartialAdminForm({...partialAdminForm, password: e.target.value})} />
              </div>
              
              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">Grant Permissions</label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border dark:border-slate-700">
                  {[
                    'Overview',
                    'Manage Students',
                    'Manage Faculty',
                    'Course Control',
                    'Exam Management',
                    'Site Branding',
                    'Content Management',
                    'Financial Oversight',
                    'System Security',
                    'AI Assistant',
                    'Reports',
                    'Leaderboard',
                    'Syllabus Management'
                  ].map(perm => (
                    <label key={perm} className="flex items-center p-3 hover:bg-white dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
                        checked={partialAdminForm.permissions.includes(perm)}
                        onChange={e => {
                          const newPerms = e.target.checked 
                            ? [...partialAdminForm.permissions, perm]
                            : partialAdminForm.permissions.filter(p => p !== perm);
                          setPartialAdminForm({...partialAdminForm, permissions: newPerms});
                        }}
                      />
                      <span className="ml-3 text-sm font-bold">{perm}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <button type="submit" className="w-full py-6 bg-blue-600 text-white font-bold rounded-[28px] shadow-2xl hover:bg-blue-700 transition-all active:scale-95">
                {editingPartialAdmin ? 'Update Permissions' : 'Create Partial Admin'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB: Resources Management */}
      {activeTab === 'resources' && (
        <div className="space-y-6 md:space-y-10 pb-20">
          {/* Page Header Settings */}
          <div className="bg-white dark:bg-slate-800 p-6 md:p-12 rounded-3xl md:rounded-[48px] border dark:border-slate-700 shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl md:text-3xl font-bold">Page Header</h3>
              <button onClick={handleSaveSiteConfig} className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95">Save Header</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">Title</label>
                <input type="text" className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-bold" value={tempHome.resourcesPage?.title || ''} onChange={e => setTempHome({...tempHome, resourcesPage: {...(tempHome.resourcesPage || {title: '', subtitle: '', content: ''}), title: e.target.value}})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">Subtitle</label>
                <input type="text" className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-medium" value={tempHome.resourcesPage?.subtitle || ''} onChange={e => setTempHome({...tempHome, resourcesPage: {...(tempHome.resourcesPage || {title: '', subtitle: '', content: ''}), subtitle: e.target.value}})} />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <h3 className="text-3xl font-bold">Study Materials</h3>
            <button 
              onClick={() => { setEditingResource(null); setResourceForm({ title: '', type: 'PDF', size: '', url: '' }); setIsResourceModalOpen(true); }}
              className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
            >
              + Add New Resource
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-[32px] border dark:border-slate-700 overflow-hidden shadow-xl">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50">
                  <th className="px-8 py-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Resource Title</th>
                  <th className="px-8 py-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Type</th>
                  <th className="px-8 py-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Size</th>
                  <th className="px-8 py-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-700">
                {(tempHome.resources || []).map((res, idx) => {
                  const resId = res.id || `res-${idx}`;
                  return (
                    <tr key={`${resId}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                      <td className="px-8 py-6 font-bold">{res.title}</td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-500/20">{res.type}</span>
                      </td>
                      <td className="px-8 py-6 text-slate-400 font-bold text-xs">{res.size}</td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => { setEditingResource(res); setResourceForm(res); setIsResourceModalOpen(true); }} className="p-2 text-slate-400 hover:text-blue-500 transition-colors"><Edit size={18} /></button>
                          <button onClick={() => deleteResource(resId)} className="p-2 text-slate-400 hover:text-red-500 transition-colors border border-slate-700 rounded-lg"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: Scholarship Management */}
      {activeTab === 'scholarship' && (
        <div className="space-y-6 md:space-y-10 pb-20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Scholarship Program</h3>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-[0.2em]">Manage application links and details</p>
            </div>
            <button 
              onClick={() => setIsScholarshipModalOpen(true)}
              className="w-full md:w-auto px-10 py-5 bg-orange-500 text-white rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all shadow-2xl shadow-orange-500/20 active:scale-95 flex items-center justify-center gap-3"
            >
              <Edit size={18} />
              Update Scholarship
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white dark:bg-slate-800 p-8 md:p-12 rounded-[48px] border dark:border-slate-700 shadow-2xl space-y-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full -mr-32 -mt-32 blur-[80px]" />
                
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className={`w-4 h-4 rounded-full ${tempHome.scholarship?.isActive ? 'bg-green-500 animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-slate-300'}`} />
                    <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      {tempHome.scholarship?.isActive ? 'Live on Website' : 'Hidden from Public'}
                    </span>
                  </div>
                  <div className="px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-xl border dark:border-slate-700">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Scholarship ID: SCH-2024</span>
                  </div>
                </div>

                <div className="space-y-6 relative z-10">
                  <h4 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                    {tempHome.scholarship?.title || 'Academic Excellence Scholarship'}
                  </h4>
                  <p className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-2xl">
                    {tempHome.scholarship?.description || 'No description provided yet.'}
                  </p>
                </div>

                <div className="pt-8 border-t dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Application Link</p>
                    <a href={tempHome.scholarship?.applyLink} target="_blank" rel="noreferrer" className="text-blue-500 font-bold hover:underline break-all">
                      {tempHome.scholarship?.applyLink || 'Not set'}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-white dark:bg-slate-800 p-8 rounded-[40px] border dark:border-slate-700 shadow-2xl space-y-6">
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Program Image</h4>
                <div className="aspect-square rounded-[32px] overflow-hidden border-4 border-white dark:border-slate-700 shadow-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center relative group">
                  {tempHome.scholarship?.image ? (
                    <img src={getDirectDriveLink(tempHome.scholarship.image)} className="w-full h-full object-cover" alt="Scholarship" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="text-center space-y-2">
                      <ImageIcon size={48} className="mx-auto text-slate-300" />
                      <p className="text-[10px] font-bold text-slate-400 uppercase">No Image Set</p>
                    </div>
                  )}
                  <button 
                    onClick={() => setIsScholarshipModalOpen(true)}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-black text-xs uppercase tracking-widest"
                  >
                    Change Image
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-cyan-400 p-8 rounded-[40px] shadow-2xl text-white space-y-4">
                <Info size={32} className="text-blue-200" />
                <h4 className="text-xl font-black tracking-tight">Pro Tip</h4>
                <p className="text-sm text-blue-100 font-medium leading-relaxed">
                  Use high-quality banners (16:9 or 4:3) to attract more applicants. You can also use Google Drive links for images.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pending' && (
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl md:rounded-3xl md:rounded-[48px] border border-white/10 shadow-2xl overflow-hidden">
          <div className="p-10 border-b border-white/10 bg-white/5 flex justify-between items-center">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-orange-500 uppercase tracking-tighter">Pending Approvals</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em]">Admission Queue</p>
            </div>
            <div className="px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
              <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">{pendingStudents.length} Applications</span>
            </div>
          </div>
          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full text-left min-w-[800px]">
              <tbody className="divide-y divide-white/5">
                {pendingStudents.map(student => (
                  <tr key={student.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-10 py-8">
                      <div className="flex items-center space-x-6">
                        <div className="w-16 h-16 rounded-[24px] bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center justify-center font-bold text-2xl shadow-lg shadow-orange-500/10">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-white text-xl tracking-tight">{student.name}</p>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{student.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl inline-block">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{student.class}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end gap-4">
                        <button 
                          onClick={() => setViewingStudent(student)} 
                          className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-blue-500 transition-colors"
                        >
                          View Details
                        </button>
                        <button 
                          onClick={() => handleVerifyStudent(student.id)} 
                          className="bg-green-600 text-white px-8 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-green-600/20 hover:bg-green-500 transition-all active:scale-95 flex items-center gap-2"
                        >
                          <Check size={14} />
                          Approve
                        </button>
                        <button 
                          onClick={() => deleteStudent(student.id)} 
                          className="bg-red-500/10 text-red-500 border border-red-500/20 px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
                        >
                          <X size={14} />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pendingStudents.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-32 text-center">
                      <div className="space-y-4 opacity-20">
                        <div className="w-20 h-20 bg-white/10 rounded-full mx-auto flex items-center justify-center">
                          <Check size={40} className="text-white" />
                        </div>
                        <p className="font-bold text-white uppercase tracking-[0.3em] text-sm">Queue Clear</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: Attendance Management Tracker */}
      {activeTab === 'attendance' && (
        <div className="space-y-8 p-4 md:p-6 lg:p-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-white/5 backdrop-blur-2xl p-6 md:p-10 lg:p-12 rounded-[32px] md:rounded-[48px] border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 blur-[120px]"></div>
            <div className="space-y-4 md:space-y-6 relative z-10 w-full lg:w-auto">
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tighter break-words">Attendance Tracker</h3>
              <div className="flex flex-wrap items-center gap-4 md:gap-8">
                <div className="flex items-center gap-3 px-4 py-2 md:px-6 md:py-3 bg-white/5 border border-white/10 rounded-2xl">
                  <Calendar className="text-blue-400" size={18} />
                  <p className="text-slate-300 font-black text-[10px] md:text-xs uppercase tracking-[0.2em]">{attendanceDate}</p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 md:px-6 md:py-3 bg-blue-600/10 border border-blue-500/20 rounded-2xl shadow-lg shadow-blue-500/10">
                  <p className="text-blue-400 font-black text-[10px] md:text-xs uppercase tracking-widest whitespace-nowrap">
                    Filtered: <span className="text-white ml-2">{filteredAttendanceStudents.filter(s => attendanceMap[s.id] === true).length} / {filteredAttendanceStudents.length}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3 px-4 py-2 md:px-6 md:py-3 bg-green-500/10 border border-green-500/20 rounded-2xl">
                  <Users className="text-green-500" size={18} />
                  <p className="text-green-500 font-black text-[10px] md:text-xs uppercase tracking-[0.2em]">
                    Presence: {Object.values(attendanceMap).filter(v => v === true).length} / {verifiedStudents.length}
                  </p>
                </div>
              </div>

              {/* Batch-wise Summary Row - Show always to provide total context */}
              {batches.length > 0 && (
                <div className="flex flex-wrap gap-4 mt-6">
                  {batches.map(batchName => {
                    const batchStudents = verifiedStudents.filter(s => (s.batch || 'Unassigned') === batchName);
                    const presentCount = batchStudents.filter(s => attendanceMap[s.id] === true).length;
                    const isSelected = attendanceBatchFilter === batchName;
                    
                    return (
                      <div 
                        key={batchName} 
                        onClick={() => setAttendanceBatchFilter(isSelected ? 'All' : batchName)}
                        className={`px-4 py-3 border rounded-2xl backdrop-blur-md transition-all cursor-pointer hover:scale-105 ${isSelected ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/20' : 'bg-white/5 border-white/10'}`}
                      >
                        <p className={`text-[8px] font-black uppercase tracking-widest leading-none mb-1 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`}>{batchName}</p>
                        <p className="text-sm font-black text-white leading-none">
                          <span className="text-green-500">{presentCount}</span>
                          <span className="text-slate-500 mx-1">/</span>
                          <span>{batchStudents.length}</span>
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-wrap items-center gap-4 md:gap-6 w-full lg:w-auto relative z-10">
              <div className="flex flex-col gap-2 w-full sm:flex-1">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-4 tracking-[0.2em]">Batch</label>
                <div className="px-4 py-3 md:px-6 md:py-4 bg-white/5 border border-white/10 rounded-2xl focus-within:border-orange-500/50 transition-all">
                  <select 
                    value={attendanceBatchFilter} 
                    onChange={(e) => setAttendanceBatchFilter(e.target.value)}
                    className="bg-transparent text-[10px] md:text-xs font-black text-orange-500 uppercase tracking-widest focus:outline-none w-full cursor-pointer"
                  >
                    <option value="All">All</option>
                    {batches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-2 w-full sm:flex-1">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-4 tracking-[0.2em]">Date</label>
                <div className="px-4 py-3 md:px-6 md:py-4 bg-white/5 border border-white/10 rounded-2xl focus-within:border-blue-500/50 transition-all">
                  <input 
                    type="date" 
                    value={attendanceDate} 
                    onChange={(e) => setAttendanceDate(e.target.value)} 
                    className="bg-transparent text-[10px] md:text-xs font-black text-blue-500 uppercase tracking-widest focus:outline-none w-full cursor-pointer" 
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <p className="text-[10px] font-black text-transparent uppercase ml-4 tracking-[0.2em]">.</p>
                <button 
                  onClick={submitAttendance} 
                  className="h-[50px] md:h-[56px] bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 md:px-12 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-2 group w-full sm:w-auto"
                >
                  <Save size={16} className="group-hover:rotate-12 transition-transform" />
                  Commit
                </button>
              </div>
            </div>
          </div>

          {/* Select status to mark all */}
          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[32px] border border-white/10 shadow-2xl mb-8">
            <p className="text-slate-300 font-bold text-sm mb-6">Select a status to mark all students' attendance.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="py-3 rounded-xl bg-blue-500/20 text-blue-400 font-bold text-sm">Holiday</button>
              <button className="py-3 rounded-xl bg-yellow-500/20 text-yellow-400 font-bold text-sm">Leave</button>
              <button className="py-3 rounded-xl bg-red-500/20 text-red-400 font-bold text-sm">Absent</button>
              <button className="py-3 rounded-xl bg-green-500/20 text-green-400 font-bold text-sm">Present</button>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-[48px] border border-white/10 shadow-2xl overflow-hidden">
            <div className="flex flex-col divide-y divide-white/5">
              {filteredAttendanceStudents.map(student => (
                <div key={student.id} className="p-3 flex items-center justify-between hover:bg-white/5 transition-all gap-4">
                  <div className="flex flex-col">
                    <span className="font-black text-sm text-white tracking-tighter">{student.name}</span>
                    <span className="text-[10px] text-slate-400 font-bold">Batch: {student.batch || 'N/A'}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 shrink-0">
                    <button 
                      onClick={() => toggleAttendance(student.id)} 
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${attendanceMap[student.id] === false ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-white/50'} hover:bg-red-500/20 hover:text-red-400`}
                    >
                      Absent
                    </button>
                    <button 
                      onClick={() => toggleAttendance(student.id)} 
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${attendanceMap[student.id] === true ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-white/50'} hover:bg-green-500/20 hover:text-green-400`}
                    >
                      Present
                    </button>
                  </div>
                </div>
              ))}
              {filteredAttendanceStudents.length === 0 && (
                <div className="p-20 text-center">
                  <div className="flex flex-col items-center gap-6 opacity-40">
                    <Users size={64} className="text-slate-600" />
                    <p className="font-black text-slate-600 uppercase tracking-[0.4em] text-sm">No students in selection</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: Faculty / Teachers List */}
      {activeTab === 'teachers' && (
        <div className="space-y-6 md:space-y-6 md:space-y-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/5 backdrop-blur-xl p-6 md:p-12 rounded-3xl md:rounded-[48px] shadow-2xl border border-white/10 gap-4 md:gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl"></div>
            <div className="space-y-1 relative z-10">
              <h3 className="text-3xl font-bold text-white uppercase tracking-tighter">Faculty Management</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em]">Academic Staff Directory</p>
            </div>
            <button 
              onClick={() => { 
                setEditingTeacher(null); 
                setTeacherForm({ name: '', subject: '', qualification: '', experience: '', image: '', education: '', email: '', password: '', profileType: 'text', profileContent: '' });
                setIsTeacherModalOpen(true); 
              }} 
              className="w-full sm:w-auto bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all active:scale-95 flex items-center justify-center gap-2 relative z-10"
            >
              <Plus size={16} />
              Register Faculty
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-6 md:p-12">
            {teachers.map(t => (
              <div key={t.id} className="bg-white/5 backdrop-blur-xl p-6 md:p-12 rounded-3xl md:rounded-[48px] border border-white/10 shadow-2xl flex flex-col items-center text-center group hover:translate-y-[-8px] transition-all relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-32 h-32 rounded-3xl md:rounded-3xl md:rounded-[40px] overflow-hidden border-4 border-white/5 shadow-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  {t.image ? (
                    <img src={t.image} className="w-full h-full object-cover" alt={t.name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-500/10 text-slate-400">
                      <User size={48} />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-2xl text-white tracking-tight">{t.name}</h4>
                  <div className="px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full inline-block">
                    <p className="text-xs text-orange-500 font-bold uppercase tracking-widest">{t.subject}</p>
                  </div>
                  {t.education && (
                    <p className="text-xs font-bold text-slate-500 mt-2 italic uppercase tracking-widest">{t.education}</p>
                  )}
                </div>
                <div className="mt-8 pt-8 border-t border-white/5 w-full flex justify-center gap-4 md:gap-4 md:gap-6">
                  <button 
                    onClick={() => { 
                      setEditingTeacher(t); 
                      setTeacherForm({
                        name: t.name,
                        subject: t.subject,
                        qualification: t.qualification,
                        experience: t.experience,
                        image: t.image,
                        education: t.education || '',
                        email: t.email || '',
                        password: t.password || '',
                        profileType: t.profileType || 'text',
                        profileContent: t.profileContent || ''
                      });
                      setIsTeacherModalOpen(true); 
                    }} 
                    className="text-xs text-blue-500 font-bold uppercase tracking-widest hover:text-blue-400 transition-colors flex items-center gap-2"
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                  <button 
                    onClick={() => deleteTeacher(t.id)} 
                    className="text-xs text-red-500 font-bold uppercase tracking-widest hover:text-red-400 transition-colors flex items-center gap-2"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: Curriculum / Course Manager */}
      {activeTab === 'courses' && (
        <div className="space-y-6 md:space-y-6 md:space-y-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/5 backdrop-blur-xl p-6 md:p-12 rounded-3xl md:rounded-[48px] shadow-2xl border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl"></div>
            <div className="space-y-1 relative z-10">
              <h3 className="text-3xl font-bold text-white uppercase tracking-tighter">Course Curriculum</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em]">Academic Programs</p>
            </div>
            <button 
              onClick={() => { 
                setEditingCourse(null); 
                setCourseForm({ name: '', icon: '📚', classesPerWeek: 3, fee: 0, paymentType: 'Monthly', assignedTeachers: [], thumbnail: '', description: '', subSubjects: [] });
                setIsCourseModalOpen(true); 
              }} 
              className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all flex items-center gap-2 relative z-10"
            >
              <Plus size={16} />
              Add Course
            </button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 p-6 md:p-12">
            {subjects.map(s => (
              <div key={s.id} className="bg-white/5 backdrop-blur-xl p-6 md:p-12 rounded-3xl md:rounded-[48px] border border-white/10 shadow-2xl group hover:translate-y-[-8px] transition-all relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="w-20 h-20 rounded-[24px] bg-white/5 border border-white/5 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform shadow-xl">
                    {s.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-2xl text-white tracking-tight">{s.name}</h4>
                    <div className="mt-3 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full inline-block">
                      <p className="text-xs text-blue-500 font-bold uppercase tracking-widest">{s.fee} BDT • {s.paymentType}</p>
                    </div>
                  </div>
                  <div className="w-full pt-8 border-t border-white/5 flex justify-center gap-4 md:gap-4 md:gap-6">
                    <button 
                      onClick={() => { 
                        setEditingCourse(s); 
                        setCourseForm({
                          name: s.name,
                          icon: s.icon,
                          classesPerWeek: s.classesPerWeek,
                          fee: s.fee || 0,
                          paymentType: s.paymentType || 'Monthly',
                          assignedTeachers: s.assignedTeachers || [],
                          thumbnail: s.thumbnail || '',
                          description: s.description || '',
                          subSubjects: s.subSubjects || []
                        });
                        setIsCourseModalOpen(true); 
                      }} 
                      className="text-xs font-bold text-blue-500 hover:text-blue-400 uppercase tracking-widest transition-colors flex items-center gap-2"
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                    <button 
                      onClick={() => deleteSubject(s.id)} 
                      className="text-xs font-bold text-red-500 hover:text-red-400 uppercase tracking-widest transition-colors flex items-center gap-2"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: Exam Center Management */}
      {activeTab === 'exams' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 md:p-12 rounded-3xl md:rounded-[40px] shadow-sm border dark:border-slate-700">
            <h3 className="text-2xl font-bold">Exam Center</h3>
            <button onClick={() => setIsExamModalOpen(true)} className="bg-orange-500 text-white px-10 py-4 rounded-2xl font-bold text-sm shadow-xl hover:bg-orange-600 transition-all active:scale-95">+ Publish Exam</button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 p-6 md:p-12">
            {exams.map(e => (
              <div key={e.id} className="bg-white dark:bg-slate-800 p-6 md:p-12 rounded-3xl md:rounded-[40px] border dark:border-slate-700 shadow-xl space-y-5">
                <div className="flex justify-between items-start"><div><h4 className="font-bold text-2xl tracking-tight">{e.name}</h4><span className="text-xs font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg uppercase tracking-wider">{e.subject}</span></div><span className="text-xs font-bold text-slate-400">{e.date}</span></div>
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
                          totalMarks: e.totalMarks || 100,
                          batch: e.batch || 'All'
                        });
                        setIsExamModalOpen(true);
                      }}
                      className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-2xl font-bold hover:bg-blue-600 hover:text-white transition-all"
                    >
                      <Pencil size={16} />
                    </button>
                    <button 
                      onClick={() => {
                        console.log("Exam delete clicked for ID:", e.id);
                        deleteExam(e.id);
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

      {/* TAB: Chatbot Management */}
      {activeTab === 'chatbot' && (
        <div className="space-y-4 md:space-y-4 md:space-y-8">
          <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 md:p-12 rounded-3xl md:rounded-[40px] border dark:border-slate-700 shadow-xl">
            <div>
              <h3 className="text-2xl font-bold">Chatbot Knowledge Base</h3>
              <p className="text-slate-500 font-medium">Train your chatbot with Phoenix-specific information.</p>
            </div>
            <button 
              onClick={() => {
                setEditingKnowledge(null);
                setChatbotForm({ question: '', answer: '', category: 'Phoenix' });
                setIsChatbotModalOpen(true);
              }}
              className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2"
            >
              <Plus size={20} />
              Add Knowledge
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-4 md:gap-6">
            {chatbotKnowledge.map((item) => (
              <div key={item.id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border dark:border-slate-700 shadow-lg space-y-4 relative group">
                <div className="flex justify-between items-start">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-xs font-bold rounded-full uppercase tracking-widest">
                    {item.category}
                  </span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        setEditingKnowledge(item);
                        setChatbotForm(item);
                        setIsChatbotModalOpen(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => deleteChatbotKnowledge(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2">Q: {item.question}</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">A: {item.answer}</p>
                </div>
              </div>
            ))}
            {chatbotKnowledge.length === 0 && (
              <div className="col-span-full p-20 text-center bg-white dark:bg-slate-800 rounded-3xl md:rounded-3xl md:rounded-[40px] border-2 border-dashed dark:border-slate-700">
                <Bot size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="font-bold text-slate-400">No knowledge entries found. Add some to train your chatbot!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: Assignments Management */}
      {activeTab === 'assignments' && (
        <div className="space-y-8 p-6 md:p-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/5 backdrop-blur-xl p-8 rounded-[40px] border border-white/10 shadow-2xl">
            <div className="space-y-1">
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Assignment Hub</h3>
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
            {assignments.map(assignment => (
              <motion.div 
                key={assignment.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/5 backdrop-blur-xl p-8 rounded-[40px] border border-white/10 shadow-2xl space-y-6 group hover:border-orange-500/30 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h4 className="text-xl font-black text-white tracking-tight leading-tight">{assignment.title}</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase tracking-widest rounded-full border border-blue-500/20">{assignment.subject}</span>
                      <span className="px-3 py-1 bg-orange-500/10 text-orange-400 text-[9px] font-black uppercase tracking-widest rounded-full border border-orange-500/20">{assignment.batch}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        setEditingAssignment(assignment);
                        setAssignmentForm(assignment);
                        setIsAssignmentModalOpen(true);
                      }}
                      className="p-2 bg-white/5 text-slate-400 hover:text-blue-500 transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                    <button 
                      onClick={() => deleteAssignment(assignment.id)}
                      className="p-2 bg-white/5 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                    <span className="text-slate-500">Due Date</span>
                    <span className="text-white">{assignment.dueDate}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                    <span className="text-slate-500">Total Marks</span>
                    <span className="text-white">{assignment.totalMarks}</span>
                  </div>
                </div>

                <button 
                  onClick={() => setViewingAssignmentSubmissions(assignment)}
                  className="w-full py-4 bg-white/5 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5"
                >
                  View Submissions
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: Notices Management */}
      {activeTab === 'notices' && (
        <div className="space-y-8 p-6 md:p-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/5 backdrop-blur-xl p-8 rounded-[40px] border border-white/10 shadow-2xl">
            <div className="space-y-1">
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Notice Center</h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Broadcast announcements and class schedules</p>
            </div>
            {sentNoticeText && (
              <button 
                onClick={handleCopyNotice}
                className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center gap-3"
              >
                <Copy size={18} />
                Copy Last Notice
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Notice Creation Form */}
            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[40px] border border-white/10 shadow-2xl space-y-6">
              <h4 className="text-xl font-black text-white uppercase tracking-tight">Create New Notice</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Notice Type</label>
                  <select 
                    className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold focus:border-orange-500 transition-all"
                    value={noticeForm.type}
                    onChange={e => setNoticeForm({...noticeForm, type: e.target.value as any})}
                  >
                    <option value="Announcement">Announcement</option>
                    <option value="Class Schedule">Class Schedule</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Target Batch</label>
                  <select 
                    className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold focus:border-orange-500 transition-all"
                    value={noticeForm.batch}
                    onChange={e => setNoticeForm({...noticeForm, batch: e.target.value})}
                  >
                    <option value="All">All Batches</option>
                    {batches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Subject Name</label>
                  <input 
                    className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold focus:border-orange-500 transition-all"
                    value={noticeForm.subject}
                    onChange={e => setNoticeForm({...noticeForm, subject: e.target.value})}
                    placeholder="e.g. Physics 1st Paper"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Faculty / Teacher</label>
                  <select 
                    className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold focus:border-orange-500 transition-all"
                    value={noticeForm.facultyId}
                    onChange={e => setNoticeForm({...noticeForm, facultyId: e.target.value})}
                  >
                    <option value="">Select Faculty</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Date</label>
                  <input 
                    type="date"
                    className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold focus:border-orange-500 transition-all"
                    value={noticeForm.date}
                    onChange={e => setNoticeForm({...noticeForm, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Time</label>
                  <input 
                    type="time"
                    className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold focus:border-orange-500 transition-all"
                    value={noticeForm.time}
                    onChange={e => setNoticeForm({...noticeForm, time: e.target.value})}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Optional Note</label>
                  <textarea 
                    className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white font-medium h-24 focus:border-orange-500 transition-all"
                    value={noticeForm.note}
                    onChange={e => setNoticeForm({...noticeForm, note: e.target.value})}
                    placeholder="Any additional information..."
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={handleSendNotice}
                  className="flex-[2] py-5 bg-orange-500 text-white font-black rounded-2xl shadow-xl hover:bg-orange-600 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-3"
                >
                  <Send size={18} />
                  Generate & Broadcast Notice
                </button>
                <button 
                  onClick={() => {
                    setNoticeForm({
                      type: 'Announcement',
                      date: new Date().toISOString().split('T')[0],
                      time: '',
                      subject: '',
                      facultyId: '',
                      batch: 'All',
                      note: ''
                    });
                    setSentNoticeText('');
                  }}
                  className="flex-1 py-5 bg-slate-800 text-slate-400 font-black rounded-2xl border border-white/10 hover:bg-slate-700 transition-all uppercase tracking-widest text-[10px]"
                >
                  Clear Form
                </button>
              </div>
            </div>

            {/* Notice Panel */}
            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[40px] border border-white/10 shadow-2xl space-y-8">
              <div className="flex items-center gap-3">
                <MessageSquare className="text-orange-500" size={24} />
                <h4 className="text-xl font-black text-white uppercase tracking-tight">📢 Notice Panel</h4>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">[ Notice Text ]</label>
                <div className="w-full p-6 rounded-3xl bg-slate-900/50 border border-white/5 text-slate-300 font-mono text-sm whitespace-pre-wrap min-h-[150px]">
                  {sentNoticeText || "Generate a notice to see the text here..."}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Teachers Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <GraduationCap size={18} className="text-blue-400" />
                    <span className="text-xs font-black text-white uppercase tracking-widest">👨🏫 Teachers:</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={handleSendToAllTeachers}
                      className="w-full py-3 bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-600/30 transition-all"
                    >
                      [Send All]
                    </button>
                    <button 
                      onClick={handleSendNotice}
                      className="w-full py-3 bg-slate-800 text-slate-400 border border-white/10 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-700 transition-all"
                    >
                      [Send Individually]
                    </button>
                  </div>
                </div>

                {/* Students Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-green-400" />
                    <span className="text-xs font-black text-white uppercase tracking-widest">👨🎓 Students:</span>
                  </div>
                  <div className="space-y-3">
                    <select 
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs focus:border-orange-500 transition-all"
                      value={selectedBatchForNotice}
                      onChange={e => setSelectedBatchForNotice(e.target.value)}
                    >
                      <option value="All">All Batches</option>
                      {batches.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                    <button 
                      onClick={handleSendToBatch}
                      className="w-full py-3 bg-green-600/20 text-green-400 border border-green-500/20 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-green-600/30 transition-all"
                    >
                      [Send to Batch]
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/10">
                <button 
                  onClick={handleShareWhatsApp}
                  className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-green-700 transition-all shadow-xl shadow-green-500/20 flex items-center justify-center gap-3"
                >
                  <Share2 size={16} />
                  📤 Share to WhatsApp
                </button>
                <button 
                  onClick={handleCopyNotice}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3"
                >
                  <Copy size={16} />
                  📋 Copy Notice
                </button>
              </div>
            </div>
          </div>

            {/* Recent Notices List */}
            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[40px] border border-white/10 shadow-2xl space-y-6 overflow-y-auto max-h-[600px]">
              <h4 className="text-xl font-black text-white uppercase tracking-tight">Recent Broadcasts</h4>
              <div className="space-y-4">
                {notices.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 font-bold uppercase tracking-widest text-xs">No notices sent yet</div>
                ) : (
                  notices.map(notice => (
                    <div key={notice.id} className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-3 relative group">
                      <div className="flex justify-between items-start">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${notice.type === 'Announcement' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'}`}>
                          {notice.type}
                        </span>
                        <button 
                          onClick={() => setNotices(prev => prev.filter(n => n.id !== notice.id))}
                          className="text-slate-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <h5 className="text-white font-black text-sm">{notice.subject}</h5>
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>📅 {notice.date}</span>
                        <span>⏰ {notice.time}</span>
                        <span>👨‍🏫 {teachers.find(t => t.id === notice.facultyId)?.name || 'Faculty'}</span>
                        <span>👥 {notice.batch}</span>
                      </div>
                      {notice.note && <p className="text-[10px] text-slate-500 italic">"{notice.note}"</p>}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

      {/* TAB: Analysis Board */}
      {/* TAB: Syllabus Tracker */}
      {activeTab === 'syllabus' && (
        <SyllabusTracker 
          role={hasPermission('Syllabus Management') ? UserRole.ADMIN : UserRole.STUDENT} 
          currentUser={currentUser} 
          batches={batches} 
          teachers={teachers}
        />
      )}

      {/* TAB: Reports Management */}
      {activeTab === 'reports' && (
        <div className="space-y-12 p-6 md:p-12">
          <div className="bg-white/5 backdrop-blur-xl p-8 md:p-12 rounded-[48px] border border-white/10 shadow-2xl space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Academic Reporting</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Generate and export student performance reports</p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <select 
                  value={reportBatchFilter} 
                  onChange={(e) => setReportBatchFilter(e.target.value)}
                  className="p-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold text-white focus:outline-none focus:border-orange-500 transition-all"
                >
                  <option value="All">All Batches</option>
                  {batches.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {verifiedStudents
                .filter(s => reportBatchFilter === 'All' || (s.batch || 'Unassigned') === reportBatchFilter)
                .map(student => (
                  <button 
                    key={student.id}
                    onClick={() => setReportStudentId(student.id)}
                    className={`p-6 rounded-3xl border transition-all text-left flex items-center gap-4 ${reportStudentId === student.id ? 'bg-orange-500/10 border-orange-500 shadow-xl shadow-orange-500/10' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center text-blue-400 font-black text-lg">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white tracking-tight">{student.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{student.batch || 'Unassigned'}</p>
                    </div>
                  </button>
                ))}
            </div>

            {reportStudentId && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-center gap-4">
                  <button 
                    disabled={isGeneratingReport}
                    onClick={() => generateReport('pdf')}
                    className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center gap-3 disabled:opacity-50"
                  >
                    <FileDown size={18} />
                    {isGeneratingReport ? 'Generating PDF...' : 'Download PDF Report'}
                  </button>
                  <button 
                    disabled={isGeneratingReport}
                    onClick={() => generateReport('jpg')}
                    className="px-8 py-4 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 flex items-center gap-3 disabled:opacity-50"
                  >
                    <ImageIcon size={18} />
                    {isGeneratingReport ? 'Generating JPG...' : 'Download JPG Report'}
                  </button>
                </div>

                {/* Report Preview */}
                <div className="flex justify-center">
                  <div 
                    ref={reportRef}
                    className="w-full max-w-[800px] bg-white dark:bg-slate-900 p-12 rounded-[48px] shadow-2xl border dark:border-slate-800 space-y-12 text-slate-900 dark:text-white"
                  >
                    {/* Report Header */}
                    <div className="flex justify-between items-start border-b dark:border-slate-800 pb-10">
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center text-white text-3xl font-black">P</div>
                          <div>
                            <h2 className="text-3xl font-black tracking-tighter uppercase italic">PHOENIX<span className="text-orange-500">.</span></h2>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Academic Excellence Hub</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold">Student Performance Report</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Generated on {new Date().toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="px-4 py-2 bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-orange-500/20 inline-block">Official Document</div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">ID: {reportStudentId.slice(0, 8)}</p>
                      </div>
                    </div>

                    {/* Student Info */}
                    {(() => {
                      const student = verifiedStudents.find(s => s.id === reportStudentId);
                      if (!student) return null;
                      return (
                        <div className="grid grid-cols-2 gap-10">
                          <div className="space-y-6">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-b dark:border-slate-800 pb-2">Student Particulars</h4>
                            <div className="space-y-4">
                              <div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Full Name</p>
                                <p className="text-xl font-black tracking-tight">{student.name}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Batch / Class</p>
                                <p className="text-sm font-bold">{student.batch || 'Unassigned'} • {student.class}</p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-6">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-b dark:border-slate-800 pb-2">Academic Standing</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-1">Attendance</p>
                                <p className="text-2xl font-black text-blue-500">{student.attendance}%</p>
                              </div>
                              <div className="p-4 bg-orange-500/5 rounded-2xl border border-orange-500/10">
                                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-1">Avg. Score</p>
                                <p className="text-2xl font-black text-orange-500">
                                  {(() => {
                                    const studentExams = exams.filter(e => e.marks[student.id] !== undefined);
                                    if (studentExams.length === 0) return 'N/A';
                                    const total = studentExams.reduce((acc, e) => acc + (e.marks[student.id] / (e.totalMarks || 100)) * 100, 0);
                                    return Math.round(total / studentExams.length) + '%';
                                  })()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Results Table */}
                    <div className="space-y-6">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-b dark:border-slate-800 pb-2">Examination History</h4>
                      <div className="overflow-hidden rounded-3xl border dark:border-slate-800">
                        <table className="w-full text-left">
                          <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Exam Name</th>
                              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Subject</th>
                              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Score</th>
                              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y dark:divide-slate-800">
                            {exams
                              .filter(e => e.marks[reportStudentId] !== undefined)
                              .map(e => (
                                <tr key={e.id}>
                                  <td className="px-6 py-4 font-bold text-sm">{e.name}</td>
                                  <td className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{e.subject}</td>
                                  <td className="px-6 py-4 text-center">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black ${(e.marks[reportStudentId] / (e.totalMarks || 100)) >= 0.8 ? 'bg-green-500/10 text-green-500' : (e.marks[reportStudentId] / (e.totalMarks || 100)) >= 0.4 ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'}`}>
                                      {e.marks[reportStudentId]} / {e.totalMarks || 100}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-right text-[10px] font-bold text-slate-400">{e.date}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="space-y-6">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-b dark:border-slate-800 pb-2">Financial Summary</h4>
                      <div className="grid grid-cols-3 gap-6">
                        {(() => {
                          const student = verifiedStudents.find(s => s.id === reportStudentId);
                          if (!student) return null;
                          const totalPaid = (student.feeRecords || []).reduce((acc, r) => acc + r.paidAmount, 0);
                          return (
                            <>
                              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border dark:border-slate-800">
                                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-1">Total Paid</p>
                                <p className="text-xl font-black">{totalPaid} BDT</p>
                              </div>
                              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border dark:border-slate-800">
                                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-1">Monthly Status</p>
                                <p className={`text-xl font-black ${student.monthlyFeeStatus === 'Paid' ? 'text-green-500' : 'text-orange-500'}`}>{student.monthlyFeeStatus || 'Due'}</p>
                              </div>
                              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border dark:border-slate-800">
                                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-1">Last Payment</p>
                                <p className="text-xl font-black">{(student.feeRecords || []).slice(-1)[0]?.paymentDate || 'N/A'}</p>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-10 border-t dark:border-slate-800 flex justify-between items-end">
                      <div className="space-y-4">
                        <div className="w-32 h-12 border-b-2 border-slate-200 dark:border-slate-800"></div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Authorized Signature</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Phoenix Edu Care • Academic Excellence</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: Leaderboard Management */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-12 p-6 md:p-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-white/5 backdrop-blur-xl p-10 rounded-[48px] border border-white/10 shadow-2xl">
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Academic Leaderboard</h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Top performers across all batches</p>
            </div>
            <select 
              value={leaderboardBatchFilter} 
              onChange={(e) => setLeaderboardBatchFilter(e.target.value)}
              className="p-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold text-white focus:outline-none focus:border-orange-500 transition-all w-full md:w-auto"
            >
              <option value="All">All Batches</option>
              {batches.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Top 3 Podium */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8 items-end pb-10">
              {(() => {
                const ranked = verifiedStudents
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
                      <div className={`w-full p-8 rounded-[40px] text-center space-y-4 ${isFirst ? 'bg-gradient-to-b from-orange-500 to-amber-600 h-64' : 'bg-white/5 border border-white/10 h-56'}`}>
                        <div className={`w-10 h-10 rounded-full mx-auto -mt-14 flex items-center justify-center font-black text-xl shadow-xl ${isFirst ? 'bg-white text-orange-600' : 'bg-blue-600 text-white'}`}>
                          {i === 1 ? 1 : i === 0 ? 2 : 3}
                        </div>
                        <h4 className={`text-xl font-black tracking-tight ${isFirst ? 'text-white' : 'text-white'}`}>{s.name}</h4>
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
            <div className="lg:col-span-3 bg-white/5 backdrop-blur-xl rounded-[48px] border border-white/10 shadow-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-white/5">
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
                <tbody className="divide-y divide-white/5">
                  {verifiedStudents
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
                      <tr key={s.id} className="hover:bg-white/5 transition-all group">
                        <td className="px-10 py-6">
                          <span className="text-lg font-black text-slate-600 group-hover:text-white transition-colors">#{i + 4}</span>
                        </td>
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 font-black">
                              {s.name.charAt(0)}
                            </div>
                            <span className="font-bold text-white tracking-tight">{s.name}</span>
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
                          <span className="px-4 py-2 bg-white/5 rounded-xl text-xs font-black text-white">{Math.round(s.performance)}</span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Global Deployment Settings */}
      {activeTab === 'settings' && (
        <div className="space-y-6 md:space-y-6 md:space-y-12 pb-20">
          <div className="bg-white dark:bg-slate-800 p-6 md:p-10 rounded-3xl md:rounded-[48px] border dark:border-slate-700 shadow-2xl space-y-6 md:space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-2xl md:text-3xl font-bold">Branding & Logo</h3>
              <button onClick={() => logoUploadRef.current?.click()} className="w-full sm:w-auto bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold text-xs shadow-xl">Upload Asset</button>
              <input type="file" hidden ref={logoUploadRef} accept="image/*" onChange={(e) => handleFileUpload(e, setTempLogo)} />
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-12 p-6 md:p-12 bg-slate-50 dark:bg-slate-900/50 rounded-3xl md:rounded-[40px]">
                <div className="w-32 h-32 md:w-40 md:h-40 bg-orange-500 rounded-3xl md:rounded-[48px] flex items-center justify-center text-white text-4xl md:text-6xl font-bold shadow-2xl overflow-hidden ring-8 ring-white dark:ring-slate-800">
                  {isLogoBase64 ? <img src={tempLogo} className="w-full h-full object-cover" alt="Logo" /> : tempLogo}
                </div>
                <div className="flex-1 w-full space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Logo Configuration</label>
                    {isLogoBase64 && (
                      <button 
                        onClick={() => setTempLogo('P')}
                        className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:underline"
                      >
                        Reset to Text
                      </button>
                    )}
                  </div>
                  <input 
                    type="text" 
                    className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold text-lg md:text-xl" 
                    value={isLogoBase64 ? "Image Logo Active" : tempLogo} 
                    disabled={isLogoBase64} 
                    onChange={e => setTempLogo(e.target.value)} 
                    placeholder="Enter 1-2 characters for text logo"
                  />
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Organization Name (Navbar)</label>
                    <input 
                      type="text" 
                      className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold" 
                      value={tempFooter.organizationName} 
                      onChange={e => setTempFooter({...tempFooter, organizationName: e.target.value})} 
                    />
                  </div>
                </div>
            </div>
          </div>

          {/* Hero Content Management */}
          <div className="bg-white dark:bg-slate-800 p-6 md:p-10 rounded-3xl md:rounded-[48px] border dark:border-slate-700 shadow-2xl space-y-6 md:space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-2xl md:text-3xl font-bold">Home Hero Section</h3>
              <button onClick={() => heroBgUploadRef.current?.click()} className="w-full sm:w-auto bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold text-xs shadow-xl">Change Background</button>
              <input type="file" hidden ref={heroBgUploadRef} accept="image/*" onChange={(e) => handleFileUpload(e, (b) => setTempHome({...tempHome, heroBgImage: b}))} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
               <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-2">Line Spacing (Drag to Adjust: {tempHome.heroTitleLineHeight || 0.95})</label>
                  <div className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-900 rounded-3xl border dark:border-slate-700">
                    <input 
                      type="range" 
                      min="0.5" 
                      max="2.0" 
                      step="0.05"
                      className="flex-grow h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer accent-orange-600" 
                      value={tempHome.heroTitleLineHeight || 0.95} 
                      onChange={e => setTempHome({...tempHome, heroTitleLineHeight: parseFloat(e.target.value)})} 
                    />
                    <span className="text-sm font-black text-orange-600 w-12 text-center">{tempHome.heroTitleLineHeight || 0.95}</span>
                  </div>
                </div>
               <div className="space-y-2 md:col-span-2">
                 <label className="text-xs font-bold text-slate-400 uppercase ml-2">Main Hero Title (Part 1 - SS3)</label>
                 <input type="text" className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold" value={tempHome.heroTitle} onChange={e => setTempHome({...tempHome, heroTitle: e.target.value})} />
               </div>
               <div className="space-y-2 md:col-span-2">
                 <label className="text-xs font-bold text-slate-400 uppercase ml-2">Main Hero Title (Part 2 - Orange - SS3)</label>
                 <input type="text" className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold text-orange-500" value={tempHome.heroSubtitle || ''} onChange={e => setTempHome({...tempHome, heroSubtitle: e.target.value})} />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-400 uppercase ml-2">Title Size (Tailwind Class)</label>
                 <input type="text" className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold" placeholder="e.g. text-5xl md:text-7xl" value={tempHome.heroTitleSize || ''} onChange={e => setTempHome({...tempHome, heroTitleSize: e.target.value})} />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-400 uppercase ml-2">Title Font Size (Drag to Adjust: {tempHome.heroTitleFontSize || 80}px)</label>
                 <div className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-900 rounded-3xl border dark:border-slate-700">
                   <input 
                     type="range" 
                     min="20" 
                     max="200" 
                     step="1"
                     className="flex-grow h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                     value={tempHome.heroTitleFontSize || 80} 
                     onChange={e => setTempHome({...tempHome, heroTitleFontSize: parseInt(e.target.value)})} 
                   />
                   <span className="text-sm font-black text-blue-600 w-12 text-center">{tempHome.heroTitleFontSize || 80}px</span>
                 </div>
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-400 uppercase ml-2">Title Weight (Tailwind Class)</label>
                 <input type="text" className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold" placeholder="e.g. font-extrabold" value={tempHome.heroTitleWeight || ''} onChange={e => setTempHome({...tempHome, heroTitleWeight: e.target.value})} />
               </div>
               <div className="space-y-2 md:col-span-2">
                 <label className="text-xs font-bold text-slate-400 uppercase ml-2">Title Color (Tailwind Class)</label>
                 <input type="text" className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold" placeholder="e.g. text-slate-900 dark:text-white" value={tempHome.heroTitleColor || ''} onChange={e => setTempHome({...tempHome, heroTitleColor: e.target.value})} />
               </div>
               {tempHome.heroBgImage && (
                 <div className="md:col-span-2 space-y-2">
                   <label className="text-xs font-bold text-slate-400 uppercase ml-2">Background Preview</label>
                   <div className="w-full h-48 rounded-3xl overflow-hidden border dark:border-slate-700">
                     <img src={tempHome.heroBgImage} className="w-full h-full object-cover opacity-50" alt="Hero Preview" />
                   </div>
                 </div>
               )}
               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-400 uppercase ml-2">Enroll Button Label</label>
                 <input type="text" className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold" value={tempHome.heroEnrollText} onChange={e => setTempHome({...tempHome, heroEnrollText: e.target.value})} />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-400 uppercase ml-2">Explore Button Label</label>
                 <input type="text" className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold" value={tempHome.heroExploreText} onChange={e => setTempHome({...tempHome, heroExploreText: e.target.value})} />
               </div>

                <div className="pt-8 border-t dark:border-slate-700 space-y-4 md:space-y-4 md:space-y-8 md:col-span-2">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Statistics (SS1)</h4>
                  <div className="grid md:grid-cols-2 gap-4 md:gap-4 md:gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase ml-2">Years of Excellence (Value)</label>
                        <input type="text" className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold" value={tempHome.statExperience} onChange={e => setTempHome({...tempHome, statExperience: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase ml-2">Years of Excellence (Label)</label>
                        <input type="text" className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold text-sm" placeholder="e.g. Years of Academic Excellence" value={tempHome.statExperienceLabel || ''} onChange={e => setTempHome({...tempHome, statExperienceLabel: e.target.value})} />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase ml-2">Enrolled Students (Value)</label>
                        <input type="text" className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold" value={tempHome.statStudents} onChange={e => setTempHome({...tempHome, statStudents: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase ml-2">Enrolled Students (Label)</label>
                        <input type="text" className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold text-sm" placeholder="e.g. Enrolled Future Scientists" value={tempHome.statStudentsLabel || ''} onChange={e => setTempHome({...tempHome, statStudentsLabel: e.target.value})} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t dark:border-slate-700 space-y-4 md:space-y-4 md:space-y-8 md:col-span-2">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Features (SS2)</h4>
                  {[1, 2, 3].map(num => (
                    <div key={num} className="p-6 bg-slate-50 dark:bg-slate-900/30 rounded-[32px] space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="col-span-2 space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase ml-2">Feature {num} Title</label>
                          <input type="text" className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-bold" value={(tempHome as any)[`feature${num}Title`]} onChange={e => setTempHome({...tempHome, [`feature${num}Title`]: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase ml-2">Icon</label>
                          <input type="text" className="w-full p-4 rounded-2xl border dark:bg-slate-900 text-center text-xl" value={(tempHome as any)[`feature${num}Icon`]} onChange={e => setTempHome({...tempHome, [`feature${num}Icon`]: e.target.value})} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase ml-2">Description</label>
                        <textarea className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-medium h-20" value={(tempHome as any)[`feature${num}Desc`]} onChange={e => setTempHome({...tempHome, [`feature${num}Desc`]: e.target.value})} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-8 border-t dark:border-slate-700 space-y-4 md:space-y-4 md:space-y-8 md:col-span-2">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Testimonial (SS4)</h4>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Admission Page Quote</label>
                    <textarea className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-medium h-24" value={tempHome.testimonialText} onChange={e => setTempHome({...tempHome, testimonialText: e.target.value})} />
                  </div>
                </div>
            </div>
          </div>

          {/* Scholarship Management */}
          <div className="bg-white dark:bg-slate-800 p-6 md:p-10 rounded-3xl md:rounded-[48px] border dark:border-slate-700 shadow-2xl space-y-6 md:space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-2xl md:text-3xl font-bold">Scholarship Program</h3>
              <button 
                onClick={() => {
                  setScholarshipForm(tempHome.scholarship || {
                    title: 'Academic Excellence Scholarship',
                    description: 'We offer scholarships to meritorious students based on their academic performance and financial need.',
                    image: '',
                    applyLink: '',
                    isActive: false
                  });
                  setIsScholarshipModalOpen(true);
                }} 
                className="w-full sm:w-auto bg-orange-500 text-white px-10 py-4 rounded-2xl font-bold text-xs shadow-xl hover:bg-orange-600 transition-all"
              >
                Manage Scholarship
              </button>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl md:rounded-[40px] border dark:border-slate-700">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${tempHome.scholarship?.isActive ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-slate-300'}`} />
                <p className="font-bold text-slate-700 dark:text-slate-200">
                  {tempHome.scholarship?.isActive ? 'Scholarship Program is Active' : 'Scholarship Program is Hidden'}
                </p>
              </div>
              {tempHome.scholarship && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase">Title</p>
                    <p className="font-bold">{tempHome.scholarship.title}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase">Apply Link</p>
                    <p className="text-blue-500 font-medium truncate">{tempHome.scholarship.applyLink}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Metadata & Dynamic Link Management */}
          <div className="bg-white dark:bg-slate-800 p-10 rounded-3xl md:rounded-3xl md:rounded-[48px] border dark:border-slate-700 shadow-2xl space-y-4 md:space-y-4 md:space-y-8">
            <h3 className="text-3xl font-bold">Footer Configuration</h3>
            <div className="space-y-4 md:space-y-4 md:space-y-8">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">Organization Name (SS2)</label>
                <input type="text" className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold text-xl" value={tempFooter.organizationName || ''} onChange={e => setTempFooter({...tempFooter, organizationName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">Bio Description</label>
                <textarea className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-medium min-h-[120px]" value={tempFooter.description} onChange={e => setTempFooter({...tempFooter, description: e.target.value})} />
              </div>
              <div className="grid md:grid-cols-2 gap-4 md:gap-4 md:gap-6">
                <div className="space-y-2 md:col-span-2"><label className="text-xs font-bold text-slate-400 uppercase ml-2">Official Office Address</label><input type="text" className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold" value={tempFooter.address} onChange={e => setTempFooter({...tempFooter, address: e.target.value})} /></div>
                <div className="space-y-2"><label className="text-xs font-bold text-slate-400 uppercase ml-2">Contact Hotline</label><input type="text" className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold" value={tempFooter.phone} onChange={e => setTempFooter({...tempFooter, phone: e.target.value})} /></div>
                <div className="space-y-2"><label className="text-xs font-bold text-slate-400 uppercase ml-2">Public Support Email</label><input type="text" className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold" value={tempFooter.email} onChange={e => setTempFooter({...tempFooter, email: e.target.value})} /></div>
              </div>

              {/* Social Media Links */}
              <div className="space-y-6 pt-10 border-t dark:border-slate-700">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Social Media Presence</h4>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Facebook URL</label>
                    <input type="text" className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-medium" placeholder="https://facebook.com/..." value={tempFooter.facebook || ''} onChange={e => setTempFooter({...tempFooter, facebook: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">YouTube URL</label>
                    <input type="text" className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-medium" placeholder="https://youtube.com/..." value={tempFooter.youtube || ''} onChange={e => setTempFooter({...tempFooter, youtube: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">LinkedIn URL</label>
                    <input type="text" className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-medium" placeholder="https://linkedin.com/..." value={tempFooter.linkedin || ''} onChange={e => setTempFooter({...tempFooter, linkedin: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* Legal Policies */}
              <div className="space-y-6 pt-10 border-t dark:border-slate-700">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Legal Policies (URLs)</h4>
                <p className="text-xs text-slate-500 ml-2">Leave empty to use the internal pages (editable below in Page Content Management).</p>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Privacy Policy URL</label>
                    <input type="text" className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-medium" placeholder="https://..." value={tempFooter.privacyPolicy || ''} onChange={e => setTempFooter({...tempFooter, privacyPolicy: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Terms of Service URL</label>
                    <input type="text" className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-medium" placeholder="https://..." value={tempFooter.termsOfService || ''} onChange={e => setTempFooter({...tempFooter, termsOfService: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Refund Policy URL</label>
                    <input type="text" className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-medium" placeholder="https://..." value={tempFooter.refundPolicy || ''} onChange={e => setTempFooter({...tempFooter, refundPolicy: e.target.value})} />
                  </div>
                </div>
              </div>


              <div className="space-y-6 pt-10 border-t dark:border-slate-700">
                <div className="flex justify-between items-center">
                  <div className="space-y-2 flex-1 mr-4">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Quick Navigation Title (SS3)</label>
                    <input 
                      type="text" 
                      className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-bold" 
                      placeholder="Quick Links" 
                      value={tempFooter.quickLinksTitle || ''} 
                      onChange={e => setTempFooter({...tempFooter, quickLinksTitle: e.target.value})} 
                    />
                  </div>
                  <button onClick={() => setIsQuickLinksModalOpen(true)} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold text-xs shadow-xl hover:bg-blue-700 transition-all flex items-center gap-2 mt-6">
                    <Edit size={14} />
                    Manage Quick Links
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Page Content Management (SS4) */}
          <div className="bg-white dark:bg-slate-800 p-6 md:p-10 rounded-3xl md:rounded-[48px] border dark:border-slate-700 shadow-2xl space-y-6 md:space-y-8">
            <h3 className="text-2xl md:text-3xl font-bold">Page Content Management</h3>
            <div className="space-y-8">
              {/* About Page */}
              <div className="p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[40px] space-y-6">
                <h4 className="text-xl font-bold text-orange-500 uppercase tracking-widest">About Us Page</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Title</label>
                    <input type="text" className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-bold" value={tempHome.aboutPage?.title || ''} onChange={e => setTempHome({...tempHome, aboutPage: {...(tempHome.aboutPage || {title: '', subtitle: '', content: ''}), title: e.target.value}})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Subtitle</label>
                    <input type="text" className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-medium" value={tempHome.aboutPage?.subtitle || ''} onChange={e => setTempHome({...tempHome, aboutPage: {...(tempHome.aboutPage || {title: '', subtitle: '', content: ''}), subtitle: e.target.value}})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Main Content</label>
                    <textarea className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-medium h-32" value={tempHome.aboutPage?.content || ''} onChange={e => setTempHome({...tempHome, aboutPage: {...(tempHome.aboutPage || {title: '', subtitle: '', content: ''}), content: e.target.value}})} />
                  </div>

                  {/* About Us Sections Management */}
                  <div className="pt-6 border-t dark:border-slate-700 space-y-6">
                    <div className="flex justify-between items-center">
                      <h5 className="text-sm font-bold text-slate-500 uppercase tracking-widest">About Us Page Sections</h5>
                      <button 
                        onClick={() => {
                          const newSections = [...(tempHome.aboutPage?.sections || []), { title: 'New Section', content: 'Section content goes here...' }];
                          setTempHome({...tempHome, aboutPage: {...(tempHome.aboutPage || {title: '', subtitle: '', content: ''}), sections: newSections}});
                        }}
                        className="px-4 py-2 bg-orange-500/10 text-orange-500 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-orange-500/20"
                      >
                        Add Section
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {(tempHome.aboutPage?.sections || []).map((section, idx) => (
                        <div key={idx} className="p-6 bg-white dark:bg-slate-800 rounded-3xl border dark:border-slate-700 space-y-4 relative group">
                          <button 
                            onClick={() => {
                              const newSections = (tempHome.aboutPage?.sections || []).filter((_, i) => i !== idx);
                              setTempHome({...tempHome, aboutPage: {...(tempHome.aboutPage || {title: '', subtitle: '', content: ''}), sections: newSections}});
                            }}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <X size={16} />
                          </button>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Section Title</label>
                            <input 
                              type="text" 
                              className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-bold" 
                              value={section.title} 
                              onChange={e => {
                                const newSections = [...(tempHome.aboutPage?.sections || [])];
                                newSections[idx] = { ...newSections[idx], title: e.target.value };
                                setTempHome({...tempHome, aboutPage: {...(tempHome.aboutPage || {title: '', subtitle: '', content: ''}), sections: newSections}});
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Section Content</label>
                            <textarea 
                              className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-medium h-24" 
                              value={section.content} 
                              onChange={e => {
                                const newSections = [...(tempHome.aboutPage?.sections || [])];
                                newSections[idx] = { ...newSections[idx], content: e.target.value };
                                setTempHome({...tempHome, aboutPage: {...(tempHome.aboutPage || {title: '', subtitle: '', content: ''}), sections: newSections}});
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* About Us Founders Management */}
                  <div className="pt-6 border-t dark:border-slate-700 space-y-6">
                    <div className="flex justify-between items-center">
                      <h5 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Our Founders</h5>
                      <button 
                        onClick={() => {
                          const newFounders = [...(tempHome.aboutPage?.founders || []), { id: Date.now().toString(), name: 'New Founder', role: 'Founder & CEO', quote: 'Quote here...', bio: 'Bio here...', image: 'https://picsum.photos/seed/founder/400/400' }];
                          setTempHome({...tempHome, aboutPage: {...(tempHome.aboutPage || {title: '', subtitle: '', content: ''}), founders: newFounders}});
                        }}
                        className="px-4 py-2 bg-blue-500/10 text-blue-500 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-blue-500/20"
                      >
                        Add Founder
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(tempHome.aboutPage?.founders || []).map((founder, idx) => (
                        <div key={founder.id} className="p-6 bg-white dark:bg-slate-800 rounded-3xl border dark:border-slate-700 space-y-4 relative group">
                          <button 
                            onClick={() => {
                              const newFounders = (tempHome.aboutPage?.founders || []).filter((_, i) => i !== idx);
                              setTempHome({...tempHome, aboutPage: {...(tempHome.aboutPage || {title: '', subtitle: '', content: ''}), founders: newFounders}});
                            }}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <X size={16} />
                          </button>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Founder Image</label>
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-2xl overflow-hidden border dark:border-slate-700 bg-slate-100 dark:bg-slate-900 flex-shrink-0">
                                <img 
                                  src={founder.image} 
                                  alt={founder.name} 
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <div className="flex-grow space-y-2">
                                <input 
                                  type="text" 
                                  className="w-full p-3 rounded-xl border dark:bg-slate-900 text-xs font-medium" 
                                  placeholder="Image URL"
                                  value={founder.image} 
                                  onChange={e => {
                                    const newFounders = [...(tempHome.aboutPage?.founders || [])];
                                    newFounders[idx] = { ...newFounders[idx], image: e.target.value };
                                    setTempHome({...tempHome, aboutPage: {...(tempHome.aboutPage || {title: '', subtitle: '', content: ''}), founders: newFounders}});
                                  }}
                                />
                                <div className="flex items-center gap-2">
                                  <label className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-500 rounded-lg font-bold text-[10px] uppercase tracking-widest border border-blue-500/20 cursor-pointer hover:bg-blue-500/20 transition-colors">
                                    <Upload size={12} />
                                    Upload
                                    <input 
                                      type="file" 
                                      className="hidden" 
                                      accept="image/*"
                                      onChange={(e) => {
                                        handleFileUpload(e, (base64) => {
                                          const newFounders = [...(tempHome.aboutPage?.founders || [])];
                                          newFounders[idx] = { ...newFounders[idx], image: base64 };
                                          setTempHome({...tempHome, aboutPage: {...(tempHome.aboutPage || {title: '', subtitle: '', content: ''}), founders: newFounders}});
                                        });
                                      }}
                                    />
                                  </label>
                                  <span className="text-[10px] text-slate-400 italic">Max 500KB</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Name</label>
                            <input 
                              type="text" 
                              className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-bold" 
                              value={founder.name} 
                              onChange={e => {
                                const newFounders = [...(tempHome.aboutPage?.founders || [])];
                                newFounders[idx] = { ...newFounders[idx], name: e.target.value };
                                setTempHome({...tempHome, aboutPage: {...(tempHome.aboutPage || {title: '', subtitle: '', content: ''}), founders: newFounders}});
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Role</label>
                            <input 
                              type="text" 
                              className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-medium" 
                              value={founder.role} 
                              onChange={e => {
                                const newFounders = [...(tempHome.aboutPage?.founders || [])];
                                newFounders[idx] = { ...newFounders[idx], role: e.target.value };
                                setTempHome({...tempHome, aboutPage: {...(tempHome.aboutPage || {title: '', subtitle: '', content: ''}), founders: newFounders}});
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Quote</label>
                            <input 
                              type="text" 
                              className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-medium" 
                              value={founder.quote} 
                              onChange={e => {
                                const newFounders = [...(tempHome.aboutPage?.founders || [])];
                                newFounders[idx] = { ...newFounders[idx], quote: e.target.value };
                                setTempHome({...tempHome, aboutPage: {...(tempHome.aboutPage || {title: '', subtitle: '', content: ''}), founders: newFounders}});
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Bio (Read More)</label>
                            <textarea 
                              className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-medium h-24" 
                              value={founder.bio} 
                              onChange={e => {
                                const newFounders = [...(tempHome.aboutPage?.founders || [])];
                                newFounders[idx] = { ...newFounders[idx], bio: e.target.value };
                                setTempHome({...tempHome, aboutPage: {...(tempHome.aboutPage || {title: '', subtitle: '', content: ''}), founders: newFounders}});
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* About Feature Cards Management */}
                  <div className="pt-12 border-t dark:border-slate-700 space-y-8">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <h5 className="text-sm font-bold text-slate-500 uppercase tracking-widest">About Page Feature Cards</h5>
                        <p className="text-[10px] text-slate-400">Manage the icons and titles at the bottom of the About page.</p>
                      </div>
                      <button 
                        onClick={() => {
                          const newCards = [...(tempHome.aboutPage?.featureCards || []), { id: Date.now().toString(), title: 'New Feature', icon: 'GraduationCap' as const, color: '#FFD700' }];
                          setTempHome({...tempHome, aboutPage: {...(tempHome.aboutPage || {title: '', subtitle: '', content: ''}), featureCards: newCards}});
                        }}
                        className="px-4 py-2 bg-blue-500/10 text-blue-500 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-blue-500/20 flex items-center gap-2"
                      >
                        <Plus size={14} /> Add Card
                      </button>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-6">
                      {(tempHome.aboutPage?.featureCards || []).map((card, idx) => (
                        <div key={card.id} className="p-6 bg-white dark:bg-slate-800 rounded-3xl border dark:border-slate-700 space-y-4 relative group">
                          <button 
                            onClick={() => {
                              const newCards = (tempHome.aboutPage?.featureCards || []).filter((_, i) => i !== idx);
                              setTempHome({...tempHome, aboutPage: {...(tempHome.aboutPage || {title: '', subtitle: '', content: ''}), featureCards: newCards}});
                            }}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                          
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Card Title</label>
                            <input 
                              type="text" 
                              className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-bold" 
                              value={card.title} 
                              onChange={e => {
                                const newCards = [...(tempHome.aboutPage?.featureCards || [])];
                                newCards[idx] = { ...newCards[idx], title: e.target.value };
                                setTempHome({...tempHome, aboutPage: {...(tempHome.aboutPage || {title: '', subtitle: '', content: ''}), featureCards: newCards}});
                              }}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Icon</label>
                              <select 
                                className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-medium"
                                value={card.icon}
                                onChange={e => {
                                  const newCards = [...(tempHome.aboutPage?.featureCards || [])];
                                  newCards[idx] = { ...newCards[idx], icon: e.target.value as any };
                                  setTempHome({...tempHome, aboutPage: {...(tempHome.aboutPage || {title: '', subtitle: '', content: ''}), featureCards: newCards}});
                                }}
                              >
                                <option value="GraduationCap">Graduation Cap</option>
                                <option value="School">School</option>
                                <option value="BarChart3">Bar Chart</option>
                                <option value="Users">Users</option>
                                <option value="BookOpen">Book Open</option>
                                <option value="Zap">Zap</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Color</label>
                              <div className="flex gap-2">
                                <input 
                                  type="color" 
                                  className="w-12 h-12 rounded-xl border-0 p-0 overflow-hidden cursor-pointer bg-transparent" 
                                  value={card.color} 
                                  onChange={e => {
                                    const newCards = [...(tempHome.aboutPage?.featureCards || [])];
                                    newCards[idx] = { ...newCards[idx], color: e.target.value };
                                    setTempHome({...tempHome, aboutPage: {...(tempHome.aboutPage || {title: '', subtitle: '', content: ''}), featureCards: newCards}});
                                  }}
                                />
                                <input 
                                  type="text" 
                                  className="flex-1 p-4 rounded-2xl border dark:bg-slate-900 font-mono text-xs uppercase" 
                                  value={card.color} 
                                  onChange={e => {
                                    const newCards = [...(tempHome.aboutPage?.featureCards || [])];
                                    newCards[idx] = { ...newCards[idx], color: e.target.value };
                                    setTempHome({...tempHome, aboutPage: {...(tempHome.aboutPage || {title: '', subtitle: '', content: ''}), featureCards: newCards}});
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* Privacy Policy Page */}
              <div className="p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[40px] space-y-6">
                <h4 className="text-xl font-bold text-blue-500 uppercase tracking-widest">Privacy Policy Page</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Title</label>
                    <input type="text" className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-bold" value={tempHome.privacyPage?.title || ''} onChange={e => setTempHome({...tempHome, privacyPage: {...(tempHome.privacyPage || {title: '', subtitle: '', content: ''}), title: e.target.value}})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Subtitle</label>
                    <input type="text" className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-medium" value={tempHome.privacyPage?.subtitle || ''} onChange={e => setTempHome({...tempHome, privacyPage: {...(tempHome.privacyPage || {title: '', subtitle: '', content: ''}), subtitle: e.target.value}})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Main Content</label>
                    <textarea className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-medium h-32" value={tempHome.privacyPage?.content || ''} onChange={e => setTempHome({...tempHome, privacyPage: {...(tempHome.privacyPage || {title: '', subtitle: '', content: ''}), content: e.target.value}})} />
                  </div>

                  {/* Privacy Policy Sections Management */}
                  <div className="pt-6 border-t dark:border-slate-700 space-y-6">
                    <div className="flex justify-between items-center">
                      <h5 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Privacy Policy Page Sections</h5>
                      <button 
                        onClick={() => {
                          const newSections = [...(tempHome.privacyPage?.sections || []), { title: 'New Section', content: 'Section content goes here...' }];
                          setTempHome({...tempHome, privacyPage: {...(tempHome.privacyPage || {title: '', subtitle: '', content: ''}), sections: newSections}});
                        }}
                        className="px-4 py-2 bg-blue-500/10 text-blue-500 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-blue-500/20"
                      >
                        Add Section
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {(tempHome.privacyPage?.sections || []).map((section, idx) => (
                        <div key={idx} className="p-6 bg-white dark:bg-slate-800 rounded-3xl border dark:border-slate-700 space-y-4 relative group">
                          <button 
                            onClick={() => {
                              const newSections = (tempHome.privacyPage?.sections || []).filter((_, i) => i !== idx);
                              setTempHome({...tempHome, privacyPage: {...(tempHome.privacyPage || {title: '', subtitle: '', content: ''}), sections: newSections}});
                            }}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <X size={16} />
                          </button>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Section Title</label>
                            <input 
                              type="text" 
                              className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-bold" 
                              value={section.title} 
                              onChange={e => {
                                const newSections = [...(tempHome.privacyPage?.sections || [])];
                                newSections[idx] = { ...newSections[idx], title: e.target.value };
                                setTempHome({...tempHome, privacyPage: {...(tempHome.privacyPage || {title: '', subtitle: '', content: ''}), sections: newSections}});
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Section Content</label>
                            <textarea 
                              className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-medium h-24" 
                              value={section.content} 
                              onChange={e => {
                                const newSections = [...(tempHome.privacyPage?.sections || [])];
                                newSections[idx] = { ...newSections[idx], content: e.target.value };
                                setTempHome({...tempHome, privacyPage: {...(tempHome.privacyPage || {title: '', subtitle: '', content: ''}), sections: newSections}});
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
                 {/* Terms of Service Page */}
              <div className="p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[40px] space-y-6">
                <h4 className="text-xl font-bold text-blue-500 uppercase tracking-widest">Terms of Service Page</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Title</label>
                    <input type="text" className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-bold" value={tempHome.termsPage?.title || ''} onChange={e => setTempHome({...tempHome, termsPage: {...(tempHome.termsPage || {title: '', subtitle: '', content: ''}), title: e.target.value}})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Subtitle</label>
                    <input type="text" className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-medium" value={tempHome.termsPage?.subtitle || ''} onChange={e => setTempHome({...tempHome, termsPage: {...(tempHome.termsPage || {title: '', subtitle: '', content: ''}), subtitle: e.target.value}})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Main Content</label>
                    <textarea className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-medium h-32" value={tempHome.termsPage?.content || ''} onChange={e => setTempHome({...tempHome, termsPage: {...(tempHome.termsPage || {title: '', subtitle: '', content: ''}), content: e.target.value}})} />
                  </div>

                  {/* Terms Sections Management */}
                  <div className="pt-6 border-t dark:border-slate-700 space-y-6">
                    <div className="flex justify-between items-center">
                      <h5 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Terms Page Sections</h5>
                      <button 
                        onClick={() => {
                          const newSections = [...(tempHome.termsPage?.sections || []), { title: 'New Section', content: 'Section content goes here...' }];
                          setTempHome({...tempHome, termsPage: {...(tempHome.termsPage || {title: '', subtitle: '', content: ''}), sections: newSections}});
                        }}
                        className="px-4 py-2 bg-blue-500/10 text-blue-500 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-blue-500/20"
                      >
                        Add Section
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {(tempHome.termsPage?.sections || []).map((section, idx) => (
                        <div key={idx} className="p-6 bg-white dark:bg-slate-800 rounded-3xl border dark:border-slate-700 space-y-4 relative group">
                          <button 
                            onClick={() => {
                              const newSections = (tempHome.termsPage?.sections || []).filter((_, i) => i !== idx);
                              setTempHome({...tempHome, termsPage: {...(tempHome.termsPage || {title: '', subtitle: '', content: ''}), sections: newSections}});
                            }}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <X size={16} />
                          </button>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Section Title</label>
                            <input 
                              type="text" 
                              className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-bold" 
                              value={section.title} 
                              onChange={e => {
                                const newSections = [...(tempHome.termsPage?.sections || [])];
                                newSections[idx] = { ...newSections[idx], title: e.target.value };
                                setTempHome({...tempHome, termsPage: {...(tempHome.termsPage || {title: '', subtitle: '', content: ''}), sections: newSections}});
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Section Content</label>
                            <textarea 
                              className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-medium h-24" 
                              value={section.content} 
                              onChange={e => {
                                const newSections = [...(tempHome.termsPage?.sections || [])];
                                newSections[idx] = { ...newSections[idx], content: e.target.value };
                                setTempHome({...tempHome, termsPage: {...(tempHome.termsPage || {title: '', subtitle: '', content: ''}), sections: newSections}});
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Refund Policy Page */}
              <div className="p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[40px] space-y-6">
                <h4 className="text-xl font-bold text-blue-500 uppercase tracking-widest">Refund Policy Page</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Title</label>
                    <input type="text" className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-bold" value={tempHome.refundPage?.title || ''} onChange={e => setTempHome({...tempHome, refundPage: {...(tempHome.refundPage || {title: '', subtitle: '', content: ''}), title: e.target.value}})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Subtitle</label>
                    <input type="text" className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-medium" value={tempHome.refundPage?.subtitle || ''} onChange={e => setTempHome({...tempHome, refundPage: {...(tempHome.refundPage || {title: '', subtitle: '', content: ''}), subtitle: e.target.value}})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Main Content</label>
                    <textarea className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-medium h-32" value={tempHome.refundPage?.content || ''} onChange={e => setTempHome({...tempHome, refundPage: {...(tempHome.refundPage || {title: '', subtitle: '', content: ''}), content: e.target.value}})} />
                  </div>
                </div>
              </div>

              {/* Success Stories Page */}
              <div className="p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[40px] space-y-6">
                <h4 className="text-xl font-bold text-blue-500 uppercase tracking-widest">Success Stories Page</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Title</label>
                    <input type="text" className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-bold" value={tempHome.successStoriesPage?.title || ''} onChange={e => setTempHome({...tempHome, successStoriesPage: {...(tempHome.successStoriesPage || {title: '', subtitle: '', content: ''}), title: e.target.value}})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Subtitle</label>
                    <input type="text" className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-medium" value={tempHome.successStoriesPage?.subtitle || ''} onChange={e => setTempHome({...tempHome, successStoriesPage: {...(tempHome.successStoriesPage || {title: '', subtitle: '', content: ''}), subtitle: e.target.value}})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Main Content</label>
                    <textarea className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-medium h-32" value={tempHome.successStoriesPage?.content || ''} onChange={e => setTempHome({...tempHome, successStoriesPage: {...(tempHome.successStoriesPage || {title: '', subtitle: '', content: ''}), content: e.target.value}})} />
                  </div>

                  {/* Success Stories Sections Management */}
                  <div className="pt-6 border-t dark:border-slate-700 space-y-6">
                    <div className="flex justify-between items-center">
                      <h5 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Success Stories Page Sections</h5>
                      <button 
                        onClick={() => {
                          const newSections = [...(tempHome.successStoriesPage?.sections || []), { title: 'New Section', content: 'Section content goes here...' }];
                          setTempHome({...tempHome, successStoriesPage: {...(tempHome.successStoriesPage || {title: '', subtitle: '', content: ''}), sections: newSections}});
                        }}
                        className="px-4 py-2 bg-blue-500/10 text-blue-500 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-blue-500/20"
                      >
                        Add Section
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {(tempHome.successStoriesPage?.sections || []).map((section, idx) => (
                        <div key={idx} className="p-6 bg-white dark:bg-slate-800 rounded-3xl border dark:border-slate-700 space-y-4 relative group">
                          <button 
                            onClick={() => {
                              const newSections = (tempHome.successStoriesPage?.sections || []).filter((_, i) => i !== idx);
                              setTempHome({...tempHome, successStoriesPage: {...(tempHome.successStoriesPage || {title: '', subtitle: '', content: ''}), sections: newSections}});
                            }}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <X size={16} />
                          </button>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Section Title</label>
                            <input 
                              type="text" 
                              className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-bold" 
                              value={section.title} 
                              onChange={e => {
                                const newSections = [...(tempHome.successStoriesPage?.sections || [])];
                                newSections[idx] = { ...newSections[idx], title: e.target.value };
                                setTempHome({...tempHome, successStoriesPage: {...(tempHome.successStoriesPage || {title: '', subtitle: '', content: ''}), sections: newSections}});
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Section Content</label>
                            <textarea 
                              className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-medium h-24" 
                              value={section.content} 
                              onChange={e => {
                                const newSections = [...(tempHome.successStoriesPage?.sections || [])];
                                newSections[idx] = { ...newSections[idx], content: e.target.value };
                                setTempHome({...tempHome, successStoriesPage: {...(tempHome.successStoriesPage || {title: '', subtitle: '', content: ''}), sections: newSections}});
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Resources Page */}
              <div className="p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[40px] space-y-6">
                <h4 className="text-xl font-bold text-blue-500 uppercase tracking-widest">Resources Page</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Title</label>
                    <input type="text" className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-bold" value={tempHome.resourcesPage?.title || ''} onChange={e => setTempHome({...tempHome, resourcesPage: {...(tempHome.resourcesPage || {title: '', subtitle: '', content: ''}), title: e.target.value}})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Subtitle</label>
                    <input type="text" className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-medium" value={tempHome.resourcesPage?.subtitle || ''} onChange={e => setTempHome({...tempHome, resourcesPage: {...(tempHome.resourcesPage || {title: '', subtitle: '', content: ''}), subtitle: e.target.value}})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-2">Main Content</label>
                    <textarea className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-medium h-32" value={tempHome.resourcesPage?.content || ''} onChange={e => setTempHome({...tempHome, resourcesPage: {...(tempHome.resourcesPage || {title: '', subtitle: '', content: ''}), content: e.target.value}})} />
                  </div>

                  {/* Resources Sections Management */}
                  <div className="pt-6 border-t dark:border-slate-700 space-y-6">
                    <div className="flex justify-between items-center">
                      <h5 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Resources Page Sections</h5>
                      <button 
                        onClick={() => {
                          const newSections = [...(tempHome.resourcesPage?.sections || []), { title: 'New Section', content: 'Section content goes here...' }];
                          setTempHome({...tempHome, resourcesPage: {...(tempHome.resourcesPage || {title: '', subtitle: '', content: ''}), sections: newSections}});
                        }}
                        className="px-4 py-2 bg-blue-500/10 text-blue-500 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-blue-500/20"
                      >
                        Add Section
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {(tempHome.resourcesPage?.sections || []).map((section, idx) => (
                        <div key={idx} className="p-6 bg-white dark:bg-slate-800 rounded-3xl border dark:border-slate-700 space-y-4 relative group">
                          <button 
                            onClick={() => {
                              const newSections = (tempHome.resourcesPage?.sections || []).filter((_, i) => i !== idx);
                              setTempHome({...tempHome, resourcesPage: {...(tempHome.resourcesPage || {title: '', subtitle: '', content: ''}), sections: newSections}});
                            }}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <X size={16} />
                          </button>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Section Title</label>
                            <input 
                              type="text" 
                              className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-bold" 
                              value={section.title} 
                              onChange={e => {
                                const newSections = [...(tempHome.resourcesPage?.sections || [])];
                                newSections[idx] = { ...newSections[idx], title: e.target.value };
                                setTempHome({...tempHome, resourcesPage: {...(tempHome.resourcesPage || {title: '', subtitle: '', content: ''}), sections: newSections}});
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Section Content</label>
                            <textarea 
                              className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-medium h-24" 
                              value={section.content} 
                              onChange={e => {
                                const newSections = [...(tempHome.resourcesPage?.sections || [])];
                                newSections[idx] = { ...newSections[idx], content: e.target.value };
                                setTempHome({...tempHome, resourcesPage: {...(tempHome.resourcesPage || {title: '', subtitle: '', content: ''}), sections: newSections}});
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-10 border-t dark:border-slate-700 flex justify-center">
            <button 
              onClick={handleSaveSiteConfig} 
              className="bg-blue-600 text-white px-20 py-5 rounded-[24px] font-bold text-lg shadow-2xl hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-3"
            >
              <Save size={20} />
              Save All Site Configuration
            </button>
          </div>
        </div>
      )}

      {/* TAB: Classes Management */}
      {activeTab === 'classes' && (
        <div className="space-y-4 md:space-y-4 md:space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-3xl font-bold">Recorded Classes</h3>
            <button 
              onClick={() => { setEditingVideo(null); setIsVideoModalOpen(true); }}
              className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
            >
              + Add New Class
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-4 md:gap-6">
            {videoClasses.map(video => (
              <div key={video.id} className="bg-white dark:bg-slate-800 rounded-3xl md:rounded-3xl md:rounded-[40px] border dark:border-slate-700 overflow-hidden shadow-lg group">
                <div className="aspect-video bg-slate-100 dark:bg-slate-900 flex items-center justify-center relative overflow-hidden">
                   {video.thumbnail ? (
                     <img src={video.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                   ) : (
                     <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
                       <Video size={32} />
                     </div>
                   )}
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                      <button onClick={() => { 
                        setEditingVideo(video); 
                        setVideoForm({ title: video.title, youtubeUrl: video.youtubeUrl });
                        setIsVideoModalOpen(true); 
                      }} className="p-4 bg-white rounded-full hover:scale-110 transition-transform text-blue-600 shadow-lg">
                        <Pencil size={20} />
                      </button>
                      <button onClick={() => { if(window.confirm("Delete this video class?")) deleteVideoClass(video.id); }} className="p-4 bg-red-500 text-white rounded-full hover:scale-110 transition-transform shadow-lg">
                        <Trash2 size={20} />
                      </button>
                   </div>
                </div>
                <div className="p-6 md:p-12">
                  <h4 className="text-xl font-bold mb-2 truncate">{video.title}</h4>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest truncate">{video.youtubeUrl}</p>
                </div>
              </div>
            ))}
            {videoClasses.length === 0 && (
              <div className="md:col-span-3 py-20 text-center bg-white dark:bg-slate-800 rounded-3xl md:rounded-3xl md:rounded-[40px] border-2 border-dashed dark:border-slate-700">
                <p className="text-xl font-bold text-slate-400">No recorded classes found. Add your first YouTube link!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- MODAL DIALOGS --- */}

      {/* Profile Detail View Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-800 w-full max-w-4xl rounded-3xl md:rounded-[48px] shadow-2xl p-6 md:p-12 overflow-y-auto max-h-[90vh] hide-scrollbar">
            <div className="flex justify-between items-start mb-10">
              <h2 className="text-4xl font-bold">{viewingStudent.name}</h2>
              <button onClick={() => setViewingStudent(null)} className="p-4 bg-slate-100 dark:bg-slate-700 rounded-full font-bold text-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center">
                <X size={24} />
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-10">
               <div className="p-10 bg-slate-50 dark:bg-slate-900/50 rounded-3xl md:rounded-3xl md:rounded-[40px] space-y-5 border border-slate-100 dark:border-slate-700">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Personal Data</p>
                  <p className="text-lg"><b>Class:</b> {viewingStudent.class}</p>
                  <p className="text-lg"><b>DOB:</b> {viewingStudent.dob}</p>
                  <p className="text-lg"><b>Mobile:</b> {viewingStudent.ownPhone}</p>
                  <p className="text-lg"><b>Guardian:</b> {viewingStudent.guardianPhone}</p>
                  <p className="text-lg pt-4 text-slate-500 italic"><b>Address:</b> {viewingStudent.address}</p>
               </div>
               <div className="p-10 bg-slate-50 dark:bg-slate-900/50 rounded-3xl md:rounded-3xl md:rounded-[40px] space-y-5 border border-slate-100 dark:border-slate-700">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Academic Credentials</p>
                  <p className="text-lg"><b>SSC Roll:</b> {viewingStudent.sscRoll}</p>
                  <p className="text-lg"><b>SSC Registration:</b> {viewingStudent.sscReg}</p>
                  <p className="pt-6 font-bold text-2xl text-blue-600">Portal Email: {viewingStudent.email}</p>
                  {viewingStudent.isBlocked && (
                    <div className="mt-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-bold uppercase tracking-widest text-center">
                      Account Suspended
                    </div>
                  )}
                  <div className={`mt-4 px-6 py-3 rounded-2xl font-bold text-center text-xs tracking-widest uppercase ${viewingStudent.isVerified ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {viewingStudent.isVerified ? 'System Verified' : 'Approval Required'}
                  </div>
                  <div className="pt-8 flex gap-4">
                    <button 
                      onClick={() => { setEditingStudent(viewingStudent); setStudentForm(viewingStudent); setViewingStudent(null); }} 
                      className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl hover:bg-blue-700 transition-all"
                    >
                      Edit Profile
                    </button>
                    <button 
                      onClick={() => { deleteStudent(viewingStudent.id); setViewingStudent(null); }} 
                      className="flex-1 py-4 bg-red-100 dark:bg-red-900/30 text-red-600 font-bold rounded-2xl shadow-xl hover:bg-red-600 hover:text-white transition-all"
                    >
                      Delete
                    </button>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Admission Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <form onSubmit={handleStudentUpdate} className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-3xl md:rounded-[48px] shadow-2xl p-6 md:p-12 space-y-4 md:space-y-8 overflow-y-auto max-h-[90vh] hide-scrollbar">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">Edit Admission Record</h2>
              <button type="button" onClick={() => { setEditingStudent(null); setStudentForm({}); }} className="text-slate-400 font-bold text-2xl hover:text-red-500 transition-all">
                <X size={24} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4 md:gap-4 md:gap-6">
              <div className="space-y-2"><label className="text-xs font-bold text-slate-400 uppercase ml-2">Student Name</label><input className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-bold" value={studentForm.name || ''} onChange={e => setStudentForm({...studentForm, name: e.target.value})} /></div>
              <div className="space-y-2"><label className="text-xs font-bold text-slate-400 uppercase ml-2">Class</label><select className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-bold" value={studentForm.class || 'HSC 1st Year'} onChange={e => setStudentForm({...studentForm, class: e.target.value as any})}><option value="HSC 1st Year">HSC 1st Year</option><option value="HSC 2nd Year">HSC 2nd Year</option></select></div>
              <div className="space-y-2"><label className="text-xs font-bold text-slate-400 uppercase ml-2">SSC Roll</label><input className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-bold" value={studentForm.sscRoll || ''} onChange={e => setStudentForm({...studentForm, sscRoll: e.target.value})} /></div>
              <div className="space-y-2"><label className="text-xs font-bold text-slate-400 uppercase ml-2">SSC Reg</label><input className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-bold" value={studentForm.sscReg || ''} onChange={e => setStudentForm({...studentForm, sscReg: e.target.value})} /></div>
              <div className="space-y-2"><label className="text-xs font-bold text-slate-400 uppercase ml-2">Own Mobile</label><input className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-bold" value={studentForm.ownPhone || ''} onChange={e => setStudentForm({...studentForm, ownPhone: e.target.value})} /></div>
              <div className="space-y-2"><label className="text-xs font-bold text-slate-400 uppercase ml-2">Guardian Mobile</label><input className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-bold" value={studentForm.guardianPhone || ''} onChange={e => setStudentForm({...studentForm, guardianPhone: e.target.value})} /></div>
              <div className="space-y-2"><label className="text-xs font-bold text-slate-400 uppercase ml-2">Batch Name (Tag)</label><input className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-bold" placeholder="e.g. Batch 2024, Morning Batch" value={studentForm.batch || ''} onChange={e => setStudentForm({...studentForm, batch: e.target.value})} /></div>
              <div className="space-y-2"><label className="text-xs font-bold text-slate-400 uppercase ml-2">Email (Login ID)</label><input className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-bold" value={studentForm.email || ''} onChange={e => setStudentForm({...studentForm, email: e.target.value})} /></div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">Access Status</label>
                <select className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-bold" value={studentForm.isBlocked ? 'Blocked' : 'Active'} onChange={e => setStudentForm({...studentForm, isBlocked: e.target.value === 'Blocked'})}>
                  <option value="Active">Active (Normal Access)</option>
                  <option value="Blocked">Blocked (Suspended)</option>
                </select>
              </div>
            </div>
            <div className="space-y-2"><label className="text-xs font-bold text-slate-400 uppercase ml-2">Dashboard Password</label><input className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-bold" value={studentForm.password || ''} onChange={e => setStudentForm({...studentForm, password: e.target.value})} /></div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b dark:border-slate-700 pb-2">Course Enrollment & Billing</h3>
              <div className="grid gap-4">
                {subjects.map(sub => {
                  const isEnrolled = studentForm.subjects?.includes(sub.name);
                  return (
                    <div key={sub.id} className={`p-4 rounded-3xl border transition-all ${isEnrolled ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : 'bg-slate-50 border-slate-100 dark:bg-slate-900/50 dark:border-slate-800'}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <input 
                            type="checkbox" 
                            checked={isEnrolled} 
                            onChange={(e) => {
                              const currentSubjects = studentForm.subjects || [];
                              if (e.target.checked) {
                                setStudentForm({...studentForm, subjects: [...currentSubjects, sub.name]});
                              } else {
                                setStudentForm({...studentForm, subjects: currentSubjects.filter(s => s !== sub.name)});
                              }
                            }}
                            className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-lg">{sub.icon}</span>
                          <span className="font-bold">{sub.name}</span>
                        </div>
                        {isEnrolled && (
                          <div className="flex items-center gap-4 md:gap-4 md:gap-6">
                            <div className="flex flex-col">
                              <label className="text-xs font-bold text-slate-400 uppercase">Billing Cycle</label>
                              <select 
                                className="bg-transparent font-bold text-xs outline-none border-b border-slate-200 dark:border-slate-700 pb-1"
                                value={studentForm.subjectPaymentTypes?.[sub.id] || sub.paymentType || 'Monthly'}
                                onChange={(e) => {
                                  const types = studentForm.subjectPaymentTypes || {};
                                  setStudentForm({...studentForm, subjectPaymentTypes: {...types, [sub.id]: e.target.value as any}});
                                }}
                              >
                                <option value="Monthly">Monthly</option>
                                <option value="One-time">One-time</option>
                              </select>
                            </div>
                            <div className="flex flex-col">
                              <label className="text-xs font-bold text-slate-400 uppercase">Enroll Date</label>
                              <input 
                                type="date" 
                                className="bg-transparent font-bold text-xs outline-none border-b border-slate-200 dark:border-slate-700 pb-1"
                                value={studentForm.subjectEnrollmentDates?.[sub.id] || new Date().toISOString().split('T')[0]}
                                onChange={(e) => {
                                  const dates = studentForm.subjectEnrollmentDates || {};
                                  setStudentForm({...studentForm, subjectEnrollmentDates: {...dates, [sub.id]: e.target.value}});
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Monthly Payment Management */}
                      {isEnrolled && (studentForm.subjectPaymentTypes?.[sub.id] === 'Monthly' || (!studentForm.subjectPaymentTypes?.[sub.id] && sub.paymentType === 'Monthly')) && (
                        <div className="mt-4 pt-4 border-t dark:border-slate-700 space-y-3">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Monthly Payment History</label>
                          <div className="flex flex-wrap gap-2">
                            {(() => {
                              const months = [];
                              const enrollDate = studentForm.subjectEnrollmentDates?.[sub.id] || studentForm.joinDate || new Date().toISOString().split('T')[0];
                              const start = new Date(enrollDate);
                              const end = new Date(); // Current date
                              
                              // Generate months from enrollment to current
                              let curr = new Date(start.getFullYear(), start.getMonth(), 1);
                              while (curr <= end) {
                                const monthKey = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}`;
                                const monthLabel = curr.toLocaleString('default', { month: 'short', year: 'numeric' });
                                months.push({ key: monthKey, label: monthLabel });
                                curr.setMonth(curr.getMonth() + 1);
                              }

                              return months.reverse().map(m => {
                                const status = studentForm.monthlyPayments?.[sub.id]?.[m.key] || 'Due';
                                return (
                                  <button
                                    key={m.key}
                                    type="button"
                                    onClick={() => {
                                      const allMonthly = studentForm.monthlyPayments || {};
                                      const subMonthly = allMonthly[sub.id] || {};
                                      const newStatus = status === 'Paid' ? 'Due' : 'Paid';
                                      setStudentForm({
                                        ...studentForm,
                                        monthlyPayments: {
                                          ...allMonthly,
                                          [sub.id]: {
                                            ...subMonthly,
                                            [m.key]: newStatus
                                          }
                                        }
                                      });
                                    }}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                      status === 'Paid' 
                                        ? 'bg-green-500 text-white border-green-600 shadow-sm' 
                                        : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                                    }`}
                                  >
                                    {m.label}: {status}
                                  </button>
                                );
                              });
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <button type="submit" className="w-full py-5 bg-blue-600 text-white font-bold rounded-[24px] shadow-2xl transition-all hover:bg-blue-700 active:scale-95 mt-4">Save Profile Changes</button>
          </form>
        </div>
      )}

      {/* Exam Marks Entry Modal */}
      {enteringMarksFor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-3xl md:rounded-3xl md:rounded-[48px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-10 border-b dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/40">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold">Performance Entry</h2>
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
                  className="p-3 rounded-xl border dark:bg-slate-800 font-bold text-xs outline-none focus:ring-2 ring-blue-500/20"
                >
                  <option value="All">All Batches</option>
                  {batches.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-2xl text-xs font-bold uppercase tracking-widest text-center">Max Score: {enteringMarksFor.totalMarks || 100}</div>
            </div>
            <div className="flex-grow overflow-y-auto p-10 space-y-6 hide-scrollbar">
              {filteredExamStudents.map(s => (
                <div key={s.id} className="flex items-center justify-between p-6 md:p-12 bg-slate-50 dark:bg-slate-900/50 rounded-[32px] border border-transparent hover:border-slate-200 transition-all shadow-sm">
                  <div className="flex flex-col">
                    <span className="font-bold text-xl">{s.name}</span>
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
              {filteredExamStudents.length === 0 && <div className="p-20 text-center font-bold text-slate-400">No students found for the selected batch.</div>}
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

      {/* Teacher Add/Edit Modal */}
      {isTeacherModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl md:rounded-[48px] shadow-2xl p-6 md:p-12 space-y-8 hide-scrollbar">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">{editingTeacher ? 'Edit Teacher' : 'Register Faculty'}</h2>
              <button onClick={() => { setIsTeacherModalOpen(false); setEditingTeacher(null); }} className="text-slate-400 font-bold text-2xl hover:text-red-500 transition-all">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleTeacherSubmit} className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                 <div className="relative group cursor-pointer" onClick={() => teacherPicRef.current?.click()}>
                   <div className="w-36 h-36 rounded-3xl md:rounded-3xl md:rounded-[40px] overflow-hidden border-8 border-blue-100 dark:border-blue-900/30 bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-300 font-bold shadow-2xl">
                     {teacherForm.image ? (
                       <img src={teacherForm.image} className="w-full h-full object-cover" />
                     ) : (
                       <Camera size={48} />
                     )}
                   </div>
                   <input type="file" hidden ref={teacherPicRef} accept="image/*" onChange={(e) => handleFileUpload(e, (b) => setTeacherForm({...teacherForm, image: b}))} />
                 </div>
              </div>
              <input required type="text" className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold outline-none focus:ring-4 ring-blue-500/10" placeholder="Teacher Full Name" value={teacherForm.name || ''} onChange={e => setTeacherForm({...teacherForm, name: e.target.value})} />
              <input required type="text" className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold outline-none focus:ring-4 ring-blue-500/10" placeholder="Academic Background (e.g. BUET, DU)" value={teacherForm.education || ''} onChange={e => setTeacherForm({...teacherForm, education: e.target.value})} />
              <input required type="text" className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold outline-none focus:ring-4 ring-blue-500/10" placeholder="Subject Specialization" value={teacherForm.subject || ''} onChange={e => setTeacherForm({...teacherForm, subject: e.target.value})} />
              <input required type="text" className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold outline-none focus:ring-4 ring-blue-500/10" placeholder="Qualifications" value={teacherForm.qualification || ''} onChange={e => setTeacherForm({...teacherForm, qualification: e.target.value})} />
              <input required type="text" className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold outline-none focus:ring-4 ring-blue-500/10" placeholder="Teaching Experience" value={teacherForm.experience || ''} onChange={e => setTeacherForm({...teacherForm, experience: e.target.value})} />
              <div className="pt-4 border-t dark:border-slate-700 space-y-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-2">Teacher Login Credentials</p>
                <input required type="email" className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold outline-none focus:ring-4 ring-blue-500/10" placeholder="Login Email" value={teacherForm.email || ''} onChange={e => setTeacherForm({...teacherForm, email: e.target.value})} />
                <input required type="text" className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold outline-none focus:ring-4 ring-blue-500/10" placeholder="Login Password" value={teacherForm.password || ''} onChange={e => setTeacherForm({...teacherForm, password: e.target.value})} />
              </div>

              <div className="pt-4 border-t dark:border-slate-700 space-y-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-2">Profile View Type</p>
                <select 
                  className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold outline-none focus:ring-4 ring-blue-500/10"
                  value={teacherForm.profileType}
                  onChange={e => setTeacherForm({...teacherForm, profileType: e.target.value as any, profileContent: ''})}
                >
                  <option value="text">Text Content</option>
                  <option value="link">External Link</option>
                  <option value="pdf">PDF Document</option>
                </select>

                {teacherForm.profileType === 'text' && (
                  <textarea 
                    className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-medium h-32 outline-none focus:ring-4 ring-blue-500/10"
                    placeholder="Enter teacher's detailed profile text..."
                    value={teacherForm.profileContent}
                    onChange={e => setTeacherForm({...teacherForm, profileContent: e.target.value})}
                  />
                )}

                {teacherForm.profileType === 'link' && (
                  <input 
                    type="url" 
                    className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold outline-none focus:ring-4 ring-blue-500/10"
                    placeholder="https://example.com/profile"
                    value={teacherForm.profileContent}
                    onChange={e => setTeacherForm({...teacherForm, profileContent: e.target.value})}
                  />
                )}

                {teacherForm.profileType === 'pdf' && (
                  <div className="space-y-2">
                    <button 
                      type="button"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'application/pdf';
                        input.onchange = (e: any) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              setTeacherForm({...teacherForm, profileContent: ev.target?.result as string});
                            };
                            reader.readAsDataURL(file);
                          }
                        };
                        input.click();
                      }}
                      className="w-full py-4 bg-slate-100 dark:bg-slate-700 rounded-2xl font-bold text-xs flex items-center justify-center gap-2"
                    >
                      <FileText size={16} />
                      {teacherForm.profileContent ? 'PDF Uploaded (Click to Change)' : 'Upload PDF Profile'}
                    </button>
                    {teacherForm.profileContent && (
                      <p className="text-[10px] text-green-500 font-bold text-center uppercase">PDF Asset Ready</p>
                    )}
                  </div>
                )}
              </div>
              <button type="submit" className="w-full py-6 bg-blue-600 text-white font-bold rounded-[28px] shadow-2xl hover:bg-blue-700 transition-all active:scale-95">{editingTeacher ? 'Update Instructor' : 'Save Instructor'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Chatbot Knowledge Modal */}
      {isChatbotModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-3xl md:rounded-3xl md:rounded-[40px] shadow-2xl overflow-hidden border dark:border-slate-700">
            <div className="p-6 md:p-12 border-b dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/40">
              <h3 className="text-2xl font-bold">{editingKnowledge ? 'Edit Knowledge' : 'Add New Knowledge'}</h3>
              <button onClick={() => setIsChatbotModalOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"><XCircle size={24} /></button>
            </div>
            <form onSubmit={handleSaveChatbotKnowledge} className="p-6 md:p-12 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">Category</label>
                <select 
                  className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold outline-none focus:ring-4 focus:ring-blue-500/20 transition-all"
                  value={chatbotForm.category}
                  onChange={e => setChatbotForm({...chatbotForm, category: e.target.value as any})}
                  required
                >
                  <option value="Phoenix">Phoenix Info</option>
                  <option value="Admission">Admission</option>
                  <option value="Payment">Payment</option>
                  <option value="General">General</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">Question / Keyword</label>
                <input 
                  type="text" 
                  className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold outline-none focus:ring-4 focus:ring-blue-500/20 transition-all"
                  placeholder="e.g. What is Phoenix?"
                  value={chatbotForm.question}
                  onChange={e => setChatbotForm({...chatbotForm, question: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">Answer</label>
                <textarea 
                  className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-medium h-32 outline-none focus:ring-4 focus:ring-blue-500/20 transition-all"
                  placeholder="Provide the answer for the chatbot..."
                  value={chatbotForm.answer}
                  onChange={e => setChatbotForm({...chatbotForm, answer: e.target.value})}
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsChatbotModalOpen(false)} className="flex-1 py-5 rounded-3xl font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit" className="flex-2 py-5 rounded-3xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all active:scale-95">
                  {editingKnowledge ? 'Update Knowledge' : 'Save Knowledge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Course Add/Edit Modal */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl md:rounded-[48px] shadow-2xl p-6 md:p-12 space-y-8 hide-scrollbar">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">{editingCourse ? 'Edit Program' : 'New Program'}</h2>
              <button onClick={() => setIsCourseModalOpen(false)} className="text-slate-400 font-bold text-2xl hover:text-red-500 transition-all">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCourseSubmit} className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative group cursor-pointer w-full" onClick={() => courseThumbnailRef.current?.click()}>
                  <div className="w-full h-48 rounded-[32px] overflow-hidden border-4 border-blue-100 dark:border-blue-900/30 bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-300 font-bold shadow-lg">
                    {courseForm.thumbnail ? (
                      <img src={courseForm.thumbnail} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Camera size={32} />
                        <span className="text-xs uppercase tracking-widest font-black">Upload Thumbnail</span>
                      </div>
                    )}
                  </div>
                  <input type="file" hidden ref={courseThumbnailRef} accept="image/*" onChange={(e) => handleFileUpload(e, (b) => setCourseForm({...courseForm, thumbnail: b}))} />
                </div>
              </div>

              <input required type="text" className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold" placeholder="Program Title" value={courseForm.name} onChange={e => setCourseForm({...courseForm, name: e.target.value})} />
              <input required type="text" className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold" placeholder="Subject Icon (Emoji)" value={courseForm.icon} onChange={e => setCourseForm({...courseForm, icon: e.target.value})} />
              
              <textarea 
                className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-medium h-32 resize-none" 
                placeholder="Course Description (Bengali/English)" 
                value={courseForm.description} 
                onChange={e => setCourseForm({...courseForm, description: e.target.value})}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-3">Classes/Week</label>
                  <input required type="number" className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold" value={courseForm.classesPerWeek} onChange={e => setCourseForm({...courseForm, classesPerWeek: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-3">Tuition Fee (BDT)</label>
                  <input required type="number" className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold" value={courseForm.fee} onChange={e => setCourseForm({...courseForm, fee: parseInt(e.target.value)})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-3">Subjects / Topics (Comma separated)</label>
                <textarea 
                  className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-medium h-24 resize-none" 
                  placeholder="e.g. Physics 1st Paper, Physics 2nd Paper, Math 1st Paper" 
                  value={courseForm.subSubjects?.join(', ') || ''} 
                  onChange={e => setCourseForm({...courseForm, subSubjects: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '')})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-3">Billing Cycle</label>
                <select className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold" value={courseForm.paymentType} onChange={e => setCourseForm({...courseForm, paymentType: e.target.value as any})}>
                  <option value="Monthly">Monthly Cycle</option>
                  <option value="One-time">One-time Enrollment</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase ml-3">Assign Faculty</label>
                <div className="max-h-40 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border dark:border-slate-700 space-y-2 hide-scrollbar">
                  {teachers.map(t => (
                    <label key={t.id} className="flex items-center space-x-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded-lg border-2 border-slate-300 dark:border-slate-600 checked:bg-blue-600 transition-all"
                        checked={courseForm.assignedTeachers?.includes(t.id)}
                        onChange={(e) => {
                          const current = courseForm.assignedTeachers || [];
                          if (e.target.checked) {
                            setCourseForm({...courseForm, assignedTeachers: [...current, t.id]});
                          } else {
                            setCourseForm({...courseForm, assignedTeachers: current.filter(id => id !== t.id)});
                          }
                        }}
                      />
                      <span className="text-sm font-bold group-hover:text-blue-600 transition-colors">{t.name} <span className="text-xs opacity-50">({t.subject})</span></span>
                    </label>
                  ))}
                  {teachers.length === 0 && <p className="text-xs text-slate-400 font-bold text-center py-2 uppercase">No teachers registered yet</p>}
                </div>
              </div>

              <button type="submit" className="w-full py-6 bg-blue-600 text-white font-bold rounded-[28px] shadow-2xl hover:bg-blue-700 transition-all active:scale-95">{editingCourse ? 'Save Changes' : 'Initialize Program'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Batch Assignment Modal */}
      {verifyingStudentId && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl md:rounded-[48px] shadow-2xl p-6 md:p-12 space-y-8 hide-scrollbar">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">Assign Batch</h2>
              <button onClick={() => setVerifyingStudentId(null)} className="text-slate-400 font-bold text-2xl hover:text-red-500 transition-all">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-6">
              <p className="text-slate-500 font-medium">Please assign a batch tag for <b>{students.find(s => s.id === verifyingStudentId)?.name}</b> before verifying their admission.</p>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-3">Batch Name / Tag</label>
                <input 
                  type="text" 
                  className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold focus:ring-4 ring-orange-500/20" 
                  placeholder="e.g. Batch 2024, Morning, Evening" 
                  value={batchInput} 
                  onChange={e => setBatchInput(e.target.value)} 
                />
              </div>
              <button 
                onClick={confirmVerification}
                className="w-full py-6 bg-green-600 text-white font-bold rounded-[28px] shadow-2xl hover:bg-green-700 transition-all active:scale-95"
              >
                Confirm & Verify Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exam Scheduling Modal */}
      {isExamModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl md:rounded-3xl md:rounded-[48px] shadow-2xl p-6 md:p-6 md:p-12 space-y-4 md:space-y-4 md:space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">Exam Scheduler</h2>
              <button onClick={() => setIsExamModalOpen(false)} className="text-slate-400 font-bold text-2xl hover:text-red-500 transition-all">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleExamSubmit} className="space-y-6">
              <input required type="text" className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold focus:ring-4 ring-orange-500/20" placeholder="Exam Session Label" value={examForm.name || ''} onChange={e => setExamForm({...examForm, name: e.target.value})} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-3">Subject</label>
                  <select className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold focus:ring-4 ring-orange-500/20" value={examForm.subject || ''} onChange={e => setExamForm({...examForm, subject: e.target.value})}>{subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}</select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-3">Target Batch</label>
                  <select className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold focus:ring-4 ring-orange-500/20" value={examForm.batch || 'All'} onChange={e => setExamForm({...examForm, batch: e.target.value})}>
                    <option value="All">All Batches</option>
                    {batches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-3">Exam Date</label>
                  <input required type="date" className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold focus:ring-4 ring-orange-500/20" value={examForm.date || ''} onChange={e => setExamForm({...examForm, date: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-3">Total Marks</label>
                  <input required type="number" className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold focus:ring-4 ring-orange-500/20" value={examForm.totalMarks || 100} onChange={e => setExamForm({...examForm, totalMarks: parseInt(e.target.value)})} />
                </div>
              </div>
              <button type="submit" className="w-full py-6 bg-orange-500 text-white font-bold rounded-[28px] shadow-2xl hover:bg-orange-600 transition-all active:scale-95">Publish Board Schedule</button>
            </form>
          </div>
        </div>
      )}

      {/* Social Links Modal */}
      {isSocialModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-3xl md:rounded-3xl md:rounded-[48px] shadow-2xl p-6 md:p-6 md:p-12 space-y-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">Social Media Icons (SS1)</h2>
              <button onClick={() => setIsSocialModalOpen(false)} className="text-slate-400 font-bold text-2xl hover:text-red-500 transition-all">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-slate-500 font-medium">Manage your social media presence icons in the footer.</p>
              </div>
              <div className="grid gap-4">
                {(tempFooter.socialLinks || []).map((link, idx) => (
                  <div key={idx} className="flex gap-4 items-center bg-slate-50 dark:bg-slate-900/30 p-4 rounded-[24px] border dark:border-slate-700">
                    <div className="space-y-1 flex-shrink-0">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Label/Icon</label>
                      <input type="text" className="w-24 p-4 rounded-2xl border dark:bg-slate-900 text-sm font-bold text-center" placeholder="FB" value={link.name} onChange={e => handleUpdateLink('social', idx, 'name', e.target.value)} />
                    </div>
                    <div className="space-y-1 flex-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">URL</label>
                      <input type="text" className="w-full p-4 rounded-2xl border dark:bg-slate-900 text-sm font-medium" placeholder="https://facebook.com/..." value={link.url} onChange={e => handleUpdateLink('social', idx, 'url', e.target.value)} />
                    </div>
                    <button onClick={() => handleRemoveLink('social', idx)} className="text-red-500 p-4 hover:scale-110 transition-transform mt-4 bg-red-50 rounded-full">
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
                {(tempFooter.socialLinks || []).length === 0 && (
                  <div className="text-center py-10 border-2 border-dashed dark:border-slate-700 rounded-3xl">
                    <p className="text-slate-400 font-bold">No social icons added yet.</p>
                  </div>
                )}
              </div>
            </div>
            <button onClick={() => setIsSocialModalOpen(false)} className="w-full py-5 bg-blue-600 text-white font-bold rounded-[24px] shadow-2xl hover:bg-blue-700 transition-all">Done Editing</button>
          </div>
        </div>
      )}

      {/* Quick Links Modal */}
      {isQuickLinksModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-3xl md:rounded-3xl md:rounded-[48px] shadow-2xl p-6 md:p-6 md:p-12 space-y-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">Quick Navigation Links</h2>
              <button onClick={() => setIsQuickLinksModalOpen(false)} className="text-slate-400 font-bold text-2xl hover:text-red-500 transition-all">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-slate-500 font-medium">Manage the quick navigation links in the footer.</p>
                <button onClick={() => handleAddLink('quick')} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs hover:bg-blue-700 transition-all">+ Add Link</button>
              </div>
              <div className="grid gap-4">
                {tempFooter.quickLinks.map((link, idx) => (
                  <div key={idx} className="flex gap-4 items-center bg-slate-50 dark:bg-slate-900/30 p-4 rounded-[24px] border dark:border-slate-700">
                    <div className="space-y-1 flex-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Label</label>
                      <input type="text" className="w-full p-4 rounded-2xl border dark:bg-slate-900 text-sm font-bold" placeholder="Home" value={link.name} onChange={e => handleUpdateLink('quick', idx, 'name', e.target.value)} />
                    </div>
                    <div className="space-y-1 flex-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">URL</label>
                      <input type="text" className="w-full p-4 rounded-2xl border dark:bg-slate-900 text-sm font-medium" placeholder="/home" value={link.url} onChange={e => handleUpdateLink('quick', idx, 'url', e.target.value)} />
                    </div>
                    <button onClick={() => handleRemoveLink('quick', idx)} className="text-red-500 p-4 hover:scale-110 transition-transform mt-4 bg-red-50 rounded-full">
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => setIsQuickLinksModalOpen(false)} className="w-full py-5 bg-blue-600 text-white font-bold rounded-[24px] shadow-2xl hover:bg-blue-700 transition-all">Done Editing</button>
          </div>
        </div>
      )}

      {/* Support Links Modal */}
      {isSupportLinksModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-3xl md:rounded-3xl md:rounded-[48px] shadow-2xl p-6 md:p-6 md:p-12 space-y-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold uppercase tracking-tighter">PHOENIX EDU CARE (SS2)</h2>
              <button onClick={() => setIsSupportLinksModalOpen(false)} className="text-slate-400 font-bold text-2xl hover:text-red-500 transition-all">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-slate-500 font-medium">Manage support and policy links in the footer.</p>
                <button onClick={() => handleAddLink('support')} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs hover:bg-blue-700 transition-all">+ Add Link</button>
              </div>
              <div className="grid gap-4">
                {tempFooter.supportLinks.map((link, idx) => (
                  <div key={idx} className="flex gap-4 items-center bg-slate-50 dark:bg-slate-900/30 p-4 rounded-[24px] border dark:border-slate-700">
                    <div className="space-y-1 flex-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Label</label>
                      <input type="text" className="w-full p-4 rounded-2xl border dark:bg-slate-900 text-sm font-bold" placeholder="Privacy Policy" value={link.name} onChange={e => handleUpdateLink('support', idx, 'name', e.target.value)} />
                    </div>
                    <div className="space-y-1 flex-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">URL</label>
                      <input type="text" className="w-full p-4 rounded-2xl border dark:bg-slate-900 text-sm font-medium" placeholder="/privacy" value={link.url} onChange={e => handleUpdateLink('support', idx, 'url', e.target.value)} />
                    </div>
                    <button onClick={() => handleRemoveLink('support', idx)} className="text-red-500 p-4 hover:scale-110 transition-transform mt-4 bg-red-50 rounded-full">
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => setIsSupportLinksModalOpen(false)} className="w-full py-5 bg-blue-600 text-white font-bold rounded-[24px] shadow-2xl hover:bg-blue-700 transition-all">Done Editing</button>
          </div>
        </div>
      )}
      {/* Video Class Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl md:rounded-3xl md:rounded-[48px] shadow-2xl p-6 md:p-6 md:p-12 space-y-4 md:space-y-4 md:space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">{editingVideo ? 'Edit Class' : 'New Class'}</h2>
              <button onClick={() => { setIsVideoModalOpen(false); setEditingVideo(null); }} className="text-slate-400 font-bold text-2xl hover:text-red-500 transition-all">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleVideoSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-3">Class Title</label>
                <input 
                  required 
                  type="text" 
                  className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold focus:ring-4 ring-blue-500/20" 
                  placeholder="e.g. Physics Chapter 1: Motion" 
                  value={videoForm.title || ''} 
                  onChange={e => setVideoForm({...videoForm, title: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-3">YouTube URL</label>
                <input 
                  required 
                  type="url" 
                  className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold focus:ring-4 ring-blue-500/20" 
                  placeholder="https://www.youtube.com/watch?v=..." 
                  value={videoForm.youtubeUrl || ''} 
                  onChange={e => setVideoForm({...videoForm, youtubeUrl: e.target.value})} 
                />
              </div>
              <button type="submit" className="w-full py-6 bg-blue-600 text-white font-bold rounded-[28px] shadow-2xl hover:bg-blue-700 transition-all active:scale-95">
                {editingVideo ? 'Save Changes' : 'Publish Class'}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Add Fee Modal */}
      {addingFeeForStudent && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl md:rounded-3xl md:rounded-[48px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 md:p-12 border-b dark:border-slate-700 flex items-center gap-4">
              <button onClick={() => setAddingFeeForStudent(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-all">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <div>
                <h2 className="text-2xl font-bold">{editingFeeRecord ? 'Edit Fee' : 'Add Fee'} for {addingFeeForStudent.name}</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{addingFeeForStudent.id.slice(0, 8)}</p>
              </div>
            </div>

            <div className="p-6 md:p-12 overflow-y-auto space-y-4 md:space-y-8 hide-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-4 md:gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-3">No. of Receipts</label>
                  <input 
                    type="text" 
                    className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold focus:ring-4 ring-blue-500/20" 
                    value={feeForm.receiptNo} 
                    onChange={e => setFeeForm({...feeForm, receiptNo: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-3">Payment Date</label>
                  <input 
                    type="date" 
                    className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold focus:ring-4 ring-blue-500/20" 
                    value={feeForm.paymentDate} 
                    onChange={e => setFeeForm({...feeForm, paymentDate: e.target.value})} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-3">Subject</label>
                <select 
                  className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold focus:ring-4 ring-blue-500/20" 
                  value={feeForm.subjectId} 
                  onChange={e => {
                    const sub = subjects.find(s => s.id === e.target.value);
                    setFeeForm({...feeForm, subjectId: e.target.value, feeType: sub?.paymentType || 'Monthly'});
                  }}
                >
                  <option value="">Select Subject</option>
                  {subjects.filter(s => addingFeeForStudent.subjects.includes(s.name)).map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="text-center">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Fee • {feeForm.feeType} • {subjects.find(s => s.id === feeForm.subjectId)?.fee || 0}
                </p>
              </div>

              {feeForm.feeType === 'Monthly' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-3">Select Month</label>
                  <input 
                    type="month" 
                    className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold focus:ring-4 ring-blue-500/20" 
                    onChange={e => {
                      if (!e.target.value) return;
                      const [year, month] = e.target.value.split('-');
                      const fromDate = `${year}-${month}-01`;
                      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
                      const toDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
                      setFeeForm({...feeForm, fromDate, toDate});
                    }}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-4 md:gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-3">From Date</label>
                  <input 
                    type="date" 
                    className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold focus:ring-4 ring-blue-500/20" 
                    value={feeForm.fromDate} 
                    onChange={e => setFeeForm({...feeForm, fromDate: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-3">To Date</label>
                  <input 
                    type="date" 
                    className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold focus:ring-4 ring-blue-500/20" 
                    value={feeForm.toDate} 
                    onChange={e => setFeeForm({...feeForm, toDate: e.target.value})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-4 md:gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-3">Paid Amount</label>
                  <input 
                    type="number" 
                    className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold focus:ring-4 ring-blue-500/20" 
                    value={feeForm.paidAmount} 
                    onChange={e => setFeeForm({...feeForm, paidAmount: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-3">Discount</label>
                  <input 
                    type="number" 
                    className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold focus:ring-4 ring-blue-500/20" 
                    value={feeForm.discount} 
                    onChange={e => setFeeForm({...feeForm, discount: e.target.value})} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-3">Payment mode</label>
                <select 
                  className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold focus:ring-4 ring-blue-500/20" 
                  value={feeForm.paymentMode} 
                  onChange={e => setFeeForm({...feeForm, paymentMode: e.target.value})}
                >
                  <option value="Cash">Cash</option>
                  <option value="Bkash">Bkash</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Bank">Bank</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-3">Remarks</label>
                <textarea 
                  className="w-full p-5 rounded-3xl border dark:bg-slate-900 font-bold focus:ring-4 ring-blue-500/20 h-24 hide-scrollbar" 
                  value={feeForm.remarks} 
                  onChange={e => setFeeForm({...feeForm, remarks: e.target.value})} 
                />
              </div>

              <div className="space-y-4 pt-4 border-t dark:border-slate-700">
                <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Collected Fees And Discount</p>
                <div className="flex justify-center items-center gap-5 p-6 md:p-12">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                      <DollarSign size={24} />
                    </div>
                    <span className="text-2xl font-bold">{feeForm.paidAmount || 0}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
                      <Gift size={24} />
                    </div>
                    <span className="text-2xl font-bold text-red-500">{feeForm.discount || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-12 bg-slate-50 dark:bg-slate-900/50">
              <button 
                onClick={handleAddFee}
                className="w-full py-6 bg-blue-600 text-white font-bold rounded-[28px] shadow-2xl hover:bg-blue-700 transition-all active:scale-95"
              >
                {editingFeeRecord ? 'Update Fee' : 'Add Fee'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Success Story Modal */}
      {isStoryModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <form onSubmit={handleStorySubmit} className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-[40px] shadow-2xl p-10 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">{editingStory ? 'Edit Success Story' : 'Add Success Story'}</h2>
              <button type="button" onClick={() => setIsStoryModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-all">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">Student Name</label>
                <input required className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-bold" value={storyForm.name || ''} onChange={e => setStoryForm({...storyForm, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">Achievement</label>
                <input required className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-bold" value={storyForm.achievement || ''} onChange={e => setStoryForm({...storyForm, achievement: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">Institution</label>
                <input required className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-bold" value={storyForm.institution || ''} onChange={e => setStoryForm({...storyForm, institution: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">Image URL</label>
                <div className="flex gap-4 items-center">
                  <input required className="flex-1 p-4 rounded-2xl border dark:bg-slate-900 font-medium" value={storyForm.image || ''} onChange={e => setStoryForm({...storyForm, image: e.target.value})} />
                  {storyForm.image && (
                    <div className="w-12 h-12 rounded-xl border overflow-hidden bg-slate-100">
                      <img src={getDirectDriveLink(storyForm.image)} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button type="submit" className="w-full py-5 bg-orange-500 text-white font-bold rounded-2xl shadow-xl hover:bg-orange-600 transition-all">Save Story</button>
          </form>
        </div>
      )}

      {/* Resource Modal */}
      {isResourceModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <form onSubmit={handleResourceSubmit} className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-[40px] shadow-2xl p-10 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">{editingResource ? 'Edit Resource' : 'Add New Resource'}</h2>
              <button type="button" onClick={() => setIsResourceModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-all">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">Resource Title</label>
                <input required className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-bold" value={resourceForm.title || ''} onChange={e => setResourceForm({...resourceForm, title: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-2">Type</label>
                  <select className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-bold" value={resourceForm.type || 'PDF'} onChange={e => setResourceForm({...resourceForm, type: e.target.value})}>
                    <option value="PDF">PDF</option>
                    <option value="DOCX">DOCX</option>
                    <option value="LINK">LINK</option>
                    <option value="ZIP">ZIP</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-2">Size (e.g. 2.4 MB)</label>
                  <input className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-bold" value={resourceForm.size || ''} onChange={e => setResourceForm({...resourceForm, size: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">Download URL / Link</label>
                <input required className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-medium" value={resourceForm.url || ''} onChange={e => setResourceForm({...resourceForm, url: e.target.value})} />
              </div>
            </div>
            <button type="submit" className="w-full py-5 bg-blue-600 text-white font-bold rounded-2xl shadow-xl hover:bg-blue-700 transition-all">Save Resource</button>
          </form>
        </div>
      )}

      {/* Scholarship Modal */}
      {isScholarshipModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <form onSubmit={handleScholarshipSubmit} className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-[40px] shadow-2xl p-10 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Manage Scholarship</h2>
              <button type="button" onClick={() => setIsScholarshipModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-all">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border dark:border-slate-700">
                <div className="space-y-1">
                  <p className="font-bold">Active Status</p>
                  <p className="text-xs text-slate-500 font-medium">Show or hide scholarship on home page</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setScholarshipForm({...scholarshipForm, isActive: !scholarshipForm.isActive})}
                  className={`w-14 h-8 rounded-full transition-all relative ${scholarshipForm.isActive ? 'bg-green-500' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${scholarshipForm.isActive ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">Scholarship Title</label>
                <input required className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-bold" value={scholarshipForm.title} onChange={e => setScholarshipForm({...scholarshipForm, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">Description</label>
                <textarea required className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-medium h-24" value={scholarshipForm.description} onChange={e => setScholarshipForm({...scholarshipForm, description: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">Apply Link</label>
                <input required className="w-full p-4 rounded-2xl border dark:bg-slate-900 font-medium" value={scholarshipForm.applyLink} onChange={e => setScholarshipForm({...scholarshipForm, applyLink: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">Image URL / Upload</label>
                <div className="flex gap-4 items-center">
                  <input className="flex-1 p-4 rounded-2xl border dark:bg-slate-900 font-medium" value={scholarshipForm.image} onChange={e => setScholarshipForm({...scholarshipForm, image: e.target.value})} placeholder="Paste URL or upload image" />
                  <button 
                    type="button"
                    onClick={() => scholarshipPicRef.current?.click()}
                    className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg hover:bg-blue-700 transition-all"
                  >
                    <ImageIcon size={20} />
                  </button>
                  <input type="file" hidden ref={scholarshipPicRef} accept="image/*" onChange={(e) => handleFileUpload(e, (b) => setScholarshipForm({...scholarshipForm, image: b}))} />
                  {scholarshipForm.image && (
                    <div className="w-12 h-12 rounded-xl border overflow-hidden bg-slate-100">
                      <img src={getDirectDriveLink(scholarshipForm.image)} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button type="submit" className="w-full py-5 bg-blue-600 text-white font-bold rounded-2xl shadow-xl hover:bg-blue-700 transition-all">Save Scholarship Details</button>
          </form>
        </div>
      )}
      {/* Assignment Modal */}
      {isAssignmentModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-[48px] shadow-2xl p-12 space-y-10 overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{editingAssignment ? 'Edit Assignment' : 'New Assignment'}</h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Publish tasks to student batches</p>
              </div>
              <button onClick={() => setIsAssignmentModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAssignmentSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Assignment Title</label>
                  <input 
                    required 
                    className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 text-white font-bold focus:border-orange-500 transition-all" 
                    value={assignmentForm.title} 
                    onChange={e => setAssignmentForm({...assignmentForm, title: e.target.value})} 
                    placeholder="e.g. Physics Chapter 3 Practice"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Subject</label>
                  <select 
                    required 
                    className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 text-white font-bold focus:border-orange-500 transition-all" 
                    value={assignmentForm.subject} 
                    onChange={e => setAssignmentForm({...assignmentForm, subject: e.target.value})}
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Target Batch</label>
                  <select 
                    required 
                    className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 text-white font-bold focus:border-orange-500 transition-all" 
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
                    className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 text-white font-bold focus:border-orange-500 transition-all" 
                    value={assignmentForm.dueDate} 
                    onChange={e => setAssignmentForm({...assignmentForm, dueDate: e.target.value})} 
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Total Marks</label>
                  <input 
                    type="number" 
                    required 
                    className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 text-white font-bold focus:border-orange-500 transition-all" 
                    value={assignmentForm.totalMarks} 
                    onChange={e => setAssignmentForm({...assignmentForm, totalMarks: parseInt(e.target.value)})} 
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Description / Instructions</label>
                  <textarea 
                    className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 text-white font-medium h-32 focus:border-orange-500 transition-all" 
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
            className="bg-slate-900 border border-white/10 w-full max-w-4xl rounded-[48px] shadow-2xl p-12 space-y-10 overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Submissions</h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{viewingAssignmentSubmissions.title} • {viewingAssignmentSubmissions.batch}</p>
              </div>
              <button onClick={() => setViewingAssignmentSubmissions(null)} className="text-slate-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="overflow-hidden rounded-[32px] border border-white/10">
              <table className="w-full text-left">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Student</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Marks</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {verifiedStudents
                    .filter(s => viewingAssignmentSubmissions.batch === 'All' || (s.batch || 'Unassigned') === viewingAssignmentSubmissions.batch)
                    .map(student => {
                      const submission = student.assignmentSubmissions?.find(sub => sub.assignmentId === viewingAssignmentSubmissions.id);
                      const currentMarks = submissionMarks[student.id]?.marks ?? submission?.marks ?? 0;
                      const currentStatus = submissionMarks[student.id]?.status ?? submission?.status ?? 'Pending';

                      return (
                        <tr key={student.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 font-black text-xs">
                                {student.name.charAt(0)}
                              </div>
                              <span className="font-bold text-white text-sm">{student.name}</span>
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
                                className="w-16 p-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white text-center"
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

export default AdminDashboard;
