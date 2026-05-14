
import React, { useState, useEffect, useRef } from 'react';
// Force exact version sync to Vercel - 2026-04-04 (Attempt 4 for auto-sync)
import { motion } from 'motion/react';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { UserRole, Student, Subject, AdminUser, Teacher, Exam, VideoClass, FooterData, HomeData, ChatbotKnowledge, Assignment, AssignmentSubmission, Review, Notice, SyllabusProgress } from './types';
import { MOCK_STUDENTS, SUBJECT_INFO, TEACHERS } from './constants';
import { Sun, Moon, MessageSquare, GraduationCap, School, BarChart3, Bell, X } from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Courses from './pages/Courses';
import TeachersPage from './pages/Teachers';
import Classes from './pages/Classes';
import Admission from './pages/Admission';
import Contact from './pages/Contact';
import Login from './pages/Login';
import About from './pages/About';
import SuccessStories from './pages/SuccessStories';
import Resources from './pages/Resources';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import OMRDashboard from './pages/OMRDashboard';
import Olympiad from './pages/Olympiad';
import Chatbot from './components/Chatbot';
import { fetchAllData, syncData, signUpUser, signInUser, deleteData, supabase, safeParse } from './services/supabaseService';

// --- ERROR BOUNDARY ---
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("[App] Error boundary caught error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center text-red-500 mb-6">
            <X size={40} />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight mb-4 text-red-400">System Failure</h1>
          <p className="text-slate-400 max-w-md mb-8 font-medium"> The application encountered a critical runtime error. We have logged the incident. </p>
          <div className="bg-black/40 p-6 rounded-2xl border border-white/5 text-left mb-8 w-full max-w-2xl overflow-auto max-h-64">
            <code className="text-red-400 text-xs block whitespace-pre-wrap">{this.state.error?.message || 'Unknown error'}</code>
            <pre className="text-slate-500 text-[10px] mt-4 font-mono">{this.state.error?.stack}</pre>
          </div>
          <button 
            onClick={() => { localStorage.clear(); window.location.href = '/'; }}
            className="px-8 py-4 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-600 transition-all shadow-xl"
          >
            Clear Data & Restart
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const App: React.FC = () => {
  const navigateHook = useNavigate();
  const location = useLocation();

  const [currentPage, setCurrentPage] = useState<string>(() => {
    const path = window.location.pathname.substring(1) || 'home';
    return path;
  });

  const [user, setUser] = useState<any>(() => {
    try {
      const savedUser = localStorage.getItem('phoenix_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error("[App] Failed to parse saved user:", e);
      return null;
    }
  });

  const [role, setRole] = useState<UserRole>(() => {
    try {
      const savedRole = localStorage.getItem('phoenix_role');
      return (savedRole as UserRole) || UserRole.GUEST;
    } catch (e) {
      return UserRole.GUEST;
    }
  });

  useEffect(() => {
    const path = location.pathname.substring(1) || 'home';
    setCurrentPage(path);
  }, [location]);

  const safeSaveUser = (userData: any, userRole: UserRole) => {
    if (!userData) return;
    try {
      const safeUser = { ...userData };
      // Remove large base64 strings to avoid localStorage quota limits
      if (safeUser.image && safeUser.image.startsWith('data:image')) delete safeUser.image;
      if (safeUser.avatar && safeUser.avatar.startsWith('data:image')) delete safeUser.avatar;
      if (safeUser.thumbnail && safeUser.thumbnail.startsWith('data:image')) delete safeUser.thumbnail;
      
      localStorage.setItem('phoenix_role', userRole);
      localStorage.setItem('phoenix_user', JSON.stringify(safeUser));
    } catch (e) {
      console.error("[App] Error in safeSaveUser:", e);
      // Try saving just the role and ID if full user fails
      try {
        localStorage.setItem('phoenix_role', userRole);
        localStorage.setItem('phoenix_user', JSON.stringify({ id: userData.id, email: userData.email }));
      } catch (innerE) {
        console.error("[App] Critical failure in safeSaveUser:", innerE);
      }
    }
  };
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 200);
      return () => clearInterval(interval);
    }
  }, [isLoading]);
  const [configId, setConfigId] = useState<string | number>(1);
  
  const [logo, setLogo] = useState<string>('P');
  const [adminProfile, setAdminProfile] = useState<AdminUser>({
    name: 'Headmaster Admin',
    email: 'admin@phoenix.com',
    password: 'admin', 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
  });

  const [footerData, setFooterData] = useState<FooterData>({
    organizationName: 'Phoenix Edu Care',
    description: 'Igniting Academic Excellence for HSC Science Students in Kulaura since 2021.',
    address: 'Main Road, Kulaura, Moulvibazar',
    phone: '01779905067, 01787543379',
    email: 'info@phoenix-edu.com',
    quickLinksTitle: 'Quick Navigation',
    quickLinks: [
      { name: 'About Us', url: '#' },
      { name: 'Admissions', url: '#' },
      { name: 'Success Story', url: '#' },
      { name: 'Classes', url: '#' }
    ],
    supportLinksTitle: 'PHOENIX EDU CARE',
    supportLinks: [
      { name: 'Contact Support', url: '#' },
      { name: 'Terms & Conditions', url: '#' },
      { name: 'Privacy Policy', url: '#' }
    ],
    socialLinks: [
      { name: 'Facebook', url: '#' },
      { name: 'YouTube', url: '#' },
      { name: 'LinkedIn', url: '#' }
    ],
    youtube: 'https://youtube.com/@phoenix-edu',
    facebook: 'https://facebook.com/phoenix-edu',
    linkedin: 'https://linkedin.com/company/phoenix-edu',
    privacyPolicy: '',
    termsOfService: '',
    refundPolicy: ''
  });

  const [homeData, setHomeData] = useState<HomeData>({
    heroTitle: 'PHOENIX',
    heroSubtitle: 'EDU CARE',
    heroBgImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80',
    heroTitleSize: 'text-5xl md:text-7xl',
    heroTitleFontSize: 80,
    heroTitleLineHeight: 0.95,
    heroTitleColor: 'text-slate-900 dark:text-white',
    heroTitleWeight: 'font-extrabold',
    heroEnrollText: 'Enroll Now',
    heroExploreText: 'Explore Courses',
    statExperience: '10+',
    statExperienceLabel: 'Years of Academic Excellence',
    statStudents: '2500+',
    statStudentsLabel: 'Enrolled Future Scientists',
    feature1Title: 'Expert Faculty',
    feature1Desc: 'Teachers from top public universities with years of teaching experience.',
    feature1Icon: (
      <div className="relative group">
        <div className="absolute inset-0 bg-[#FFD700]/10 blur-3xl rounded-full group-hover:bg-[#FFD700]/20 transition-colors duration-500"></div>
        <GraduationCap className="relative w-16 h-16 sm:w-20 sm:h-20 text-[#FFD700] drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]" strokeWidth={1.2} />
      </div>
    ),
    feature2Title: 'Modern Facilities',
    feature2Desc: 'Digital classrooms and specialized lab facilities for hands-on learning.',
    feature2Icon: (
      <div className="relative group">
        <div className="absolute inset-0 bg-[#FFD700]/10 blur-3xl rounded-full group-hover:bg-[#FFD700]/20 transition-colors duration-500"></div>
        <School className="relative w-16 h-16 sm:w-20 sm:h-20 text-[#FFD700] drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]" strokeWidth={1.2} />
      </div>
    ),
    feature3Title: 'Performance Heatmap',
    feature3Desc: 'AI-driven system tracking your progress and providing improvement plans.',
    feature3Icon: (
      <div className="relative group">
        <div className="absolute inset-0 bg-[#FFD700]/10 blur-3xl rounded-full group-hover:bg-[#FFD700]/20 transition-colors duration-500"></div>
        <BarChart3 className="relative w-16 h-16 sm:w-20 sm:h-20 text-[#FFD700] drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]" strokeWidth={1.2} />
      </div>
    ),
    testimonialText: 'The Phoenix Edu Care has helped over 2500+ students achieve their dream grades in HSC Science since 2021.',
    scholarship: {
      title: 'Academic Excellence Scholarship',
      description: 'Apply for our 100% tuition fee waiver program for outstanding HSC Science students.',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80',
      applyLink: '#',
      isActive: true
    },
    aboutPage: {
      title: 'About Us',
      subtitle: 'Igniting Academic Excellence for HSC Science Students in Kulaura since 2021.',
      content: 'At Phoenix Edu Care, our mission is to provide high-quality education and guidance to HSC science students, empowering them to achieve their full potential and excel in their academic journey.',
      sections: [
        { title: 'Our Mission', content: 'At Phoenix Edu Care, our mission is to provide high-quality education and guidance to HSC science students, empowering them to achieve their full potential and excel in their academic journey.' },
        { title: 'Our Vision', content: 'To be the leading educational institution in the region, recognized for producing the next generation of scientists, engineers, and healthcare professionals who will contribute significantly to society.' }
      ],
      founders: [
        {
          id: 'f1',
          name: 'Abdullah Al Mubin',
          role: 'Founder & CEO',
          quote: 'Our goal is to simplify science and make it accessible to every student in Kulaura.',
          bio: 'Abdullah Al Mubin is a visionary educator with years of experience in HSC science curriculum. He founded Phoenix Edu Care with the dream of providing top-tier academic support to local students.',
          image: 'https://picsum.photos/seed/mubin/400/400'
        },
        {
          id: 'f2',
          name: 'Co-Founder Name',
          role: 'Co-Founder & Academic Head',
          quote: 'Excellence is not an act, but a habit. We strive for excellence in everything we do.',
          bio: 'Our academic head brings extensive knowledge and passion for teaching, ensuring that our curriculum remains at the forefront of educational standards.',
          image: 'https://picsum.photos/seed/founder2/400/400'
        }
      ],
      featureCards: [
        { id: 'fc1', title: 'Expert Faculty', icon: 'GraduationCap', color: '#FFD700' },
        { id: 'fc2', title: 'Modern Facilities', icon: 'School', color: '#FFD700' },
        { id: 'fc3', title: 'Proven Results', icon: 'BarChart3', color: '#FFD700' }
      ]
    },
    privacyPage: {
      title: 'Privacy Policy',
      subtitle: 'Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.',
      content: 'At Phoenix Edu Care, we are committed to protecting your privacy. We collect information such as your name, email address, and phone number when you register for our courses or contact us. This information is used solely for the purpose of providing you with our educational services and keeping you informed about our programs.',
      sections: [
        { title: 'Information Collection', content: 'We collect personal information that you voluntarily provide to us when you register for courses, subscribe to our newsletter, or contact us through our website.' },
        { title: 'Use of Information', content: 'The information we collect is used to process your enrollment, provide you with access to our resources, and communicate with you about your academic progress and our services.' }
      ]
    },
    termsPage: {
      title: 'Terms of Service',
      subtitle: 'By using our services, you agree to the following terms and conditions.',
      content: 'Welcome to Phoenix Edu Care. By accessing our website and using our services, you agree to comply with and be bound by the following terms and conditions of use. If you disagree with any part of these terms and conditions, please do not use our website.',
      sections: [
        { title: 'Course Enrollment', content: 'Enrollment in our courses is subject to availability and the payment of the required fees. We reserve the right to refuse enrollment to any student at our discretion.' },
        { title: 'Intellectual Property', content: 'All study materials, lecture notes, and resources provided by Phoenix Edu Care are the intellectual property of the institution and are for your personal use only.' }
      ]
    },
    refundPage: {
      title: 'Refund Policy',
      subtitle: 'Our policy regarding refunds for course enrollments and other services.',
      content: 'We strive to provide the best educational experience for our students. However, we understand that circumstances may change. Our refund policy is designed to be fair to both the students and the institution.',
      sections: [
        { title: 'Eligibility for Refund', content: 'Refund requests must be submitted in writing within 7 days of course enrollment. Refunds will be processed on a case-by-case basis, taking into account the resources already accessed by the student.' },
        { title: 'Non-Refundable Fees', content: 'Certain fees, such as registration fees or fees for materials already provided, may be non-refundable.' }
      ]
    },
    successStoriesPage: {
      title: 'Success Stories',
      subtitle: 'Celebrating the achievements of our brilliant students who have excelled in their HSC exams and competitive admissions.',
      content: 'Celebrating the achievements of our brilliant students who have excelled in their HSC exams and competitive admissions.',
      sections: []
    },
    resourcesPage: {
      title: 'Resources',
      subtitle: 'Access high-quality study materials, lecture notes, and practice exams to boost your HSC preparation.',
      content: 'Access high-quality study materials, lecture notes, and practice exams to boost your HSC preparation.',
      sections: []
    },
    successStories: [
      { id: 'ss1', name: 'Samiul Islam', achievement: 'GPA 5.00 (HSC 2023)', institution: 'Kulaura Govt. College', image: 'https://picsum.photos/seed/student1/400/400' },
      { id: 'ss2', name: 'Tahsin Ahmed', achievement: 'BUET Admission 2023', institution: 'Sylhet Cadet College', image: 'https://picsum.photos/seed/student2/400/400' },
      { id: 'ss3', name: 'Nabila Rahman', achievement: 'GPA 5.00 (HSC 2023)', institution: 'Kulaura Govt. College', image: 'https://picsum.photos/seed/student3/400/400' }
    ],
    resources: [
      { id: 'res-hsc-phy1', title: 'পদার্থবিজ্ঞান ১ম পত্র - লেকচার শিট ও নোট', type: 'PDF', size: '2.5 MB', url: 'https://olranks.com/chapters/657615e404d6a0b68a778d92', category: 'HSC', subject: 'পদার্থবিজ্ঞান ১ম পত্র' },
      { id: 'res-hsc-phy2', title: 'পদার্থবিজ্ঞান ২য় পত্র - লেকচার শিট ও নোট', type: 'PDF', size: '2.1 MB', url: 'https://olranks.com/chapters/6576160604d6a0b68a778d94', category: 'HSC', subject: 'পদার্থবিজ্ঞান ২য় পত্র' },
      { id: 'res-hsc-math1', title: 'উচ্চতরগণিত ১ম পত্র - লেকচার শিট ও নোট', type: 'PDF', size: '1.9 MB', url: 'https://olranks.com/chapters/6576161504d6a0b68a778d96', category: 'HSC', subject: 'উচ্চতরগণিত ১ম পত্র' },
      { id: 'res-hsc-math2', title: 'উচ্চতরগণিত ২য় পত্র - লেকচার শিট ও নোট', type: 'PDF', size: '1.7 MB', url: 'https://olranks.com/chapters/6576162404d6a0b68a778d98', category: 'HSC', subject: 'উচ্চতরগণিত ২য় পত্র' },
      { id: 'res-hsc-chem1', title: 'রসায়ন ১ম পত্র - লেকচার শিট ও নোট', type: 'PDF', size: '2.2 MB', url: 'https://olranks.com/chapters/6576163404d6a0b68a778d9a', category: 'HSC', subject: 'রসায়ন ১ম পত্র' },
      { id: 'res-hsc-chem2', title: 'রসায়ন ২য় পত্র - লেকচার শিট ও নোট', type: 'PDF', size: '2.3 MB', url: 'https://olranks.com/chapters/6576164204d6a0b68a778d9c', category: 'HSC', subject: 'রসায়ন ২য় পত্র' },
      { id: 'res-hsc-bio1', title: 'উদ্ভিদবিজ্ঞান - লেকচার শিট ও নোট', type: 'PDF', size: '3.5 MB', url: 'https://olranks.com/chapters/6576165504d6a0b68a778d9e', category: 'HSC', subject: 'উদ্ভিদবিজ্ঞান' },
      { id: 'res-hsc-bio2', title: 'প্রাণিবিজ্ঞান - লেকচার শিট ও নোট', type: 'PDF', size: '3.8 MB', url: 'https://olranks.com/chapters/6576167204d6a0b68a778da0', category: 'HSC', subject: 'প্রাণিবিজ্ঞান' },
      { id: 'res-hsc-ict', title: 'তথ্য ও যোগাযোগ প্রযুক্তি - লেকচার শিট ও নোট', type: 'PDF', size: '1.5 MB', url: 'https://olranks.com/chapters/65784fff76584cb1dabdc61d', category: 'HSC', subject: 'তথ্য ও যোগাযোগ প্রযুক্তি' },
      { id: 'res-hsc-ban1', title: 'বাংলা ১ম পত্র - লেকচার শিট ও নোট', type: 'PDF', size: '4.2 MB', url: 'https://olranks.com/chapters/65acd51f813914f4ad22f55f', category: 'HSC', subject: 'বাংলা ১ম পত্র' },
      { id: 'res-hsc-ban2', title: 'বাংলা ২য় পত্র - লেকচার শিট ও নোট', type: 'PDF', size: '3.1 MB', url: 'https://olranks.com/chapters/65acd53b813914f4ad22f56b', category: 'HSC', subject: 'বাংলা ২য় পত্র' },
      { id: 'res-hsc-eng1', title: 'English 1st paper - Lecture Sheets', type: 'PDF', size: '2.9 MB', url: 'https://olranks.com/chapters/65acd554813914f4ad22f56d', category: 'HSC', subject: 'English 1st paper' },
      { id: 'res-hsc-eng2', title: 'English 2nd paper - Lecture Sheets', type: 'PDF', size: '2.7 MB', url: 'https://olranks.com/chapters/65acd562813914f4ad22f56f', category: 'HSC', subject: 'English 2nd paper' },
      { id: 'res-ssc-phy', title: 'SSC পদার্থবিজ্ঞান - লেকচার শিট ও নোট', type: 'PDF', size: '4.5 MB', url: 'https://olranks.com/chapters/6576168304d6a0b68a778da2', category: 'SSC', subject: 'পদার্থবিজ্ঞান' },
      { id: 'res-ssc-chem', title: 'SSC রসায়ন - লেকচার শিট ও নোট', type: 'PDF', size: '3.2 MB', url: 'https://olranks.com/chapters/6578ac576c9b7d7b5bd84c0f', category: 'SSC', subject: 'রসায়ন' },
      { id: 'res-ssc-math', title: 'SSC সাধারণ গণিত - লেকচার শিট ও নোট', type: 'PDF', size: '2.8 MB', url: 'https://olranks.com/chapters/6578ac7c6c9b7d7b5bd84c11', category: 'SSC', subject: 'সাধারণ গণিত' },
      { id: 'res-ssc-hmath', title: 'SSC উচ্চতর গণিত - লেকচার শিট ও নোট', type: 'PDF', size: '3.0 MB', url: 'https://olranks.com/chapters/6578ac906c9b7d7b5bd84c13', category: 'SSC', subject: 'উচ্চতর গণিত' },
      { id: 'res-ssc-bio', title: 'SSC জীব বিজ্ঞান - লেকচার শিট ও নোট', type: 'PDF', size: '3.5 MB', url: 'https://olranks.com/chapters/6578aca46c9b7d7b5bd84c15', category: 'SSC', subject: 'জীব বিজ্ঞান' },
      { id: 'res-ssc-ict', title: 'SSC তথ্য ও যোগাযোগ প্রযুক্তি - লেকচার শিট ও নোট', type: 'PDF', size: '1.8 MB', url: 'https://olranks.com/chapters/6578ad156c9b7d7b5bd84c17', category: 'SSC', subject: 'তথ্য ও যোগাযোগ প্রযুক্তি' }
    ]
  });

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  
  // Custom setter with logging
  const updateStudentsWithSync = (action: React.SetStateAction<Student[]>) => {
    setStudents(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      console.log("[App] Students state updated. Count:", next.length);
      return next;
    });
  };
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [videoClasses, setVideoClasses] = useState<VideoClass[]>([]);
  const [chatbotKnowledge, setChatbotKnowledge] = useState<ChatbotKnowledge[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [syllabusProgress, setSyllabusProgress] = useState<SyllabusProgress[]>([]);
  const [dismissedNoticeIds, setDismissedNoticeIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('phoenix_dismissed_notices');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('phoenix_dismissed_notices', JSON.stringify(dismissedNoticeIds));
  }, [dismissedNoticeIds]);

  const updateNoticesWithSync = (action: React.SetStateAction<Notice[]>) => {
    setNotices(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      syncData('notices', next);
      return next;
    });
  };

  const updateSyllabusProgressWithSync = (action: React.SetStateAction<SyllabusProgress[]>) => {
    setSyllabusProgress(prev => typeof action === 'function' ? action(prev) : action);
  };

  const [reviews, setReviews] = useState<Review[]>([]);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  // --- SUPABASE HYDRATION & SESSION CHECK ---
  // v1.1 - Updated AI and Corner FAB
  useEffect(() => {
    let retryCount = 0;
    const MAX_RETRIES = 3;

    // Emergency timeout - force loading to stop after 10 seconds no matter what
    const emergencyTimeout = setTimeout(() => {
      if (isLoading) {
        console.warn("[App] Emergency timeout reached. Forcing loading to stop.");
        setIsLoading(false);
      }
    }, 10000);

    const init = async () => {
      console.log("[App] Initializing data and session... Attempt:", retryCount + 1);
      try {
        const data = await fetchAllData();
        
        // Check Supabase Session for Students
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && session.user) {
          // If we have a session, try to find the student record
          if (data && data.students) {
            const student = data.students.find(s => s.email.toLowerCase() === session.user.email?.toLowerCase());
            if (student) {
              setRole(UserRole.STUDENT);
              setUser(student);
              safeSaveUser(student, UserRole.STUDENT);
            }
          }
        } else if (role === UserRole.ADMIN || role === UserRole.TEACHER) {
          if (role === UserRole.TEACHER && user && data && data.teachers) {
            const teacher = data.teachers.find(t => t.id === user.id);
            if (teacher) {
              setUser(teacher);
              safeSaveUser(teacher, UserRole.TEACHER);
            }
          }
        } else {
          setRole(UserRole.GUEST);
          setUser(null);
          localStorage.removeItem('phoenix_role');
          localStorage.removeItem('phoenix_user');
        }

        if (data) {
          // --- STUDENTS ---
          if (data.students && data.students.length > 0) {
            setStudents(data.students);
          } else {
            const backupStudents = localStorage.getItem('phoenix_backup_students');
            if (backupStudents) {
              try { setStudents(JSON.parse(backupStudents)); } catch(e) { setStudents([]); }
            } else {
              setStudents([]);
            }
          }

          // --- TEACHERS ---
          if (data.teachers && data.teachers.length > 0) {
            setTeachers(data.teachers);
          } else {
            const backupTeachers = localStorage.getItem('phoenix_backup_teachers');
            if (backupTeachers) {
              try { setTeachers(JSON.parse(backupTeachers)); } catch(e) { setTeachers([]); }
            } else {
              setTeachers([]);
            }
          }

          // --- SUBJECTS ---
          const allowedSubjectNames = new Set(Object.keys(SUBJECT_INFO));
          if (data.subjects && data.subjects.length > 0) {
            let filteredSubjects = data.subjects.filter((s: any) => allowedSubjectNames.has(s.name));
            setSubjects(filteredSubjects);
          } else {
            const backupSubjects = localStorage.getItem('phoenix_backup_subjects');
            if (backupSubjects) {
              try { setSubjects(JSON.parse(backupSubjects)); } catch(e) { setSubjects([]); }
            } else {
              setSubjects([]);
            }
          }

          setExams(data.exams || []);
          setVideoClasses(data.videoClasses || []);
          setChatbotKnowledge(data.chatbotKnowledge || []);
          setAssignments(data.assignments || []);
          setReviews(data.reviews || []);
          setNotices(data.notices || []);
          setSyllabusProgress(data.syllabusProgress || []);
          
          if (data.config) {
            const cfg = data.config;
            if (cfg.id) setConfigId(cfg.id);
            if (cfg.logo) setLogo(cfg.logo);
            if (cfg.admin_profile || cfg.adminProfile) {
              setAdminProfile(prev => ({ ...prev, ...safeParse(cfg.admin_profile || cfg.adminProfile) }));
            }
            if (cfg.footer_data || cfg.footerData) {
              setFooterData(prev => ({ ...prev, ...safeParse(cfg.footer_data || cfg.footerData) }));
            }
            if (cfg.home_data || cfg.homeData) {
              const hData = safeParse(cfg.home_data || cfg.homeData);
              setHomeData(prev => ({ ...prev, ...hData }));
            }
          }
          setIsLoading(false);
          clearTimeout(emergencyTimeout);
        } else if (retryCount < MAX_RETRIES) {
          retryCount++;
          setTimeout(init, 2000);
        } else {
          setIsLoading(false);
          clearTimeout(emergencyTimeout);
        }
      } catch (err) {
        console.error("[App] fatal init error:", err);
        setIsLoading(false);
        clearTimeout(emergencyTimeout);
      }
    };
    init();
    return () => clearTimeout(emergencyTimeout);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const [isSaving, setIsSaving] = useState(false);
  const lastSyncHash = useRef<string>('');
  const isInitialMount = useRef(true);

  const safeLocalStorageSet = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e: any) {
      // Catch QuotaExceededError and similar
      const isQuotaError = 
        e.name === 'QuotaExceededError' || 
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || 
        e.code === 22 || 
        e.code === 1014 ||
        (e.message && e.message.toLowerCase().includes('quota'));

      if (isQuotaError) {
        console.warn(`[App] LocalStorage quota exceeded for ${key}. Attempting to save slim version...`);
        // Strip large data (images) and try again
        const stripLargeStrings = (obj: any): any => {
          if (Array.isArray(obj)) return obj.map(stripLargeStrings);
          if (obj !== null && typeof obj === 'object') {
            const newObj: any = {};
            for (const k in obj) {
              const val = obj[k];
              if (typeof val === 'string' && (val.length > 1000 || val.startsWith('data:image'))) {
                // Skip large strings or base64 images in backup
                continue;
              }
              newObj[k] = stripLargeStrings(val);
            }
            return newObj;
          }
          return obj;
        };

        try {
          const slimData = stripLargeStrings(data);
          localStorage.setItem(key, JSON.stringify(slimData));
          console.log(`[App] Slim version of ${key} saved successfully.`);
        } catch (innerE) {
          console.error(`[App] Failed to save even slim version of ${key}:`, innerE);
          // Don't remove the item if it's a critical backup, just leave it as is or log it
        }
      } else {
        console.error(`[App] Error saving ${key} to localStorage:`, e);
      }
    }
  };

  // --- PERSISTENCE SYNC ---
  // Improved sync with hash check to prevent "auto-add" loops
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!isLoading) {
      // Improved hash: include counts AND verification status summary to detect approval changes
      const verifiedCount = students.filter(s => s.isVerified).length;
      const currentData = JSON.stringify({
        students: JSON.stringify(students.map(s => ({ id: s.id, v: s.isVerified, a: s.attendance, s: s.averageScore }))), // Slim but representative
        teachers: teachers.length, 
        subjects: subjects.length,
        exams: JSON.stringify(exams),
        videoClasses: videoClasses.length,
        chatbotKnowledge: chatbotKnowledge.length,
        assignments: assignments.length,
        reviews: reviews.length,
        notices: notices.length,
        syllabusProgress: syllabusProgress.length,
        logo,
        adminProfile: JSON.stringify(adminProfile),
        footerData: JSON.stringify(footerData),
        homeData: JSON.stringify(homeData)
      });

      if (currentData === lastSyncHash.current) return;

      const sync = async () => {
        setIsSaving(true);
        lastSyncHash.current = currentData;
        console.log("[App] Starting throttled global sync...");
        try {
          // Backup to localStorage first as a safety net
          safeLocalStorageSet('phoenix_backup_students', students);
          safeLocalStorageSet('phoenix_backup_teachers', teachers);
          safeLocalStorageSet('phoenix_backup_subjects', subjects);
          safeLocalStorageSet('phoenix_backup_exams', exams);
          safeLocalStorageSet('phoenix_backup_videoClasses', videoClasses);
          safeLocalStorageSet('phoenix_backup_chatbot', chatbotKnowledge);
          
          await Promise.all([
            syncData('students', students),
            syncData('teachers', teachers),
            syncData('subjects', subjects),
            syncData('exams', exams),
            syncData('video_classes', videoClasses),
            syncData('chatbot_knowledge', chatbotKnowledge),
            syncData('assignments', assignments),
            syncData('reviews', reviews),
            syncData('notices', notices),
            syncData('syllabus_progress', syllabusProgress)
          ]);
          console.log("[App] Global sync completed.");
        } catch (err) {
          console.error("[App] Global Sync Error:", err);
        } finally {
          setIsSaving(false);
        }
      };

      const timer = setTimeout(sync, 500); // 500ms debounce
      return () => clearTimeout(timer);
    }
  }, [students, teachers, subjects, exams, videoClasses, chatbotKnowledge, assignments, reviews, notices, syllabusProgress, logo, adminProfile, footerData, homeData, isLoading]);

  const navigate = (page: string) => {
    setCurrentPage(page);
    navigateHook(page === 'home' ? '/' : `/${page}`);
    window.scrollTo(0, 0);
  };

  const handleLogin = async (selectedRole: UserRole, identifier: string, password?: string) => {
    const cleanIdentifier = identifier.trim();
    console.log(`[App] Login attempt: Role=${selectedRole}, Identifier=${cleanIdentifier}`);
    
    if (selectedRole === UserRole.STUDENT) {
      try {
        // Step 1: Find student in DB by phone or email to get their actual Supabase Auth email
        // We use quotes around the identifier to handle special characters like @ or +
        // IMPORTANT: Use database column names (snake_case) for the query
        // Step 1: Find student in DB by phone or email
        // We use a more robust query construction
        const filter = `email.eq."${cleanIdentifier}",own_phone.eq."${cleanIdentifier}",phone.eq."${cleanIdentifier}",guardian_phone.eq."${cleanIdentifier}"`;
        const { data: studentRecords, error: fetchError } = await supabase
          .from('students')
          .select('*')
          .or(filter);

        if (fetchError) {
          console.error("[App] Student fetch error:", fetchError);
          // Fallback to local search if Supabase query fails
          const localStudent = students.find(s => 
            (s.email && s.email.toLowerCase() === cleanIdentifier.toLowerCase()) || 
            s.ownPhone === cleanIdentifier || 
            s.phone === cleanIdentifier || 
            s.guardianPhone === cleanIdentifier
          );
          
          if (localStudent) {
            console.log("[App] Found student in local state after Supabase fetch error");
            if (localStudent.password === password) {
              setRole(selectedRole);
              setUser(localStudent);
              safeSaveUser(localStudent, selectedRole);
              navigate('student-dashboard');
              return;
            }
          }
          throw fetchError;
        }

        if (!studentRecords || studentRecords.length === 0) {
          console.warn("[App] No student found with identifier:", cleanIdentifier);
          // One more try: check local state directly in case sync hasn't finished
          const localStudent = students.find(s => 
            s.email?.toLowerCase() === cleanIdentifier.toLowerCase() || 
            s.ownPhone === cleanIdentifier || 
            s.phone === cleanIdentifier || 
            s.guardianPhone === cleanIdentifier
          );
          
          if (localStudent) {
            console.log("[App] Found student in local state after DB miss");
            if (localStudent.password === password) {
              setRole(selectedRole);
              setUser(localStudent);
              safeSaveUser(localStudent, selectedRole);
              navigate('student-dashboard');
              return;
            }
          }

          alert("No student account found with those credentials.");
          return;
        }

        const student = studentRecords[0];
        console.log("[App] Student record found:", student.email);

        // Map database fields to frontend fields if necessary
        const mappedStudent = {
          ...student,
          isVerified: student.is_verified !== undefined ? student.is_verified : student.isVerified,
          password: student.password || ''
        };

        if (!mappedStudent.isVerified) {
          alert("Your admission is still pending admin approval. Please wait for verification.");
          return;
        }

        if (mappedStudent.isBlocked) {
          alert("Your account has been suspended by the administration. Please contact the office.");
          return;
        }

        // Step 2: Attempt Supabase Authentication using the found student's email
        try {
          const loginData = await signInUser(mappedStudent.email, password || '');
          
          if (loginData.user) {
            console.log("[App] Supabase Auth successful for:", mappedStudent.email);
            setRole(selectedRole);
            setUser(mappedStudent);
            safeSaveUser(mappedStudent, selectedRole);
            navigate('student-dashboard');
            return;
          }
        } catch (authErr: any) {
          console.warn("[App] Supabase Auth failed, checking local password fallback:", authErr.message);
          // Fallback: Check if password matches the one stored in the student record
          if (mappedStudent.password && mappedStudent.password === password) {
            console.log("[App] Manual password match successful for student:", mappedStudent.email);
            setRole(selectedRole);
            setUser(mappedStudent);
            safeSaveUser(mappedStudent, selectedRole);
            navigate('student-dashboard');
            return;
          }
          throw authErr;
        }
      } catch (err: any) {
        console.error("Login error:", err);
        alert(err.message || "Incorrect credentials or account not found.");
      }
    } else if (selectedRole === UserRole.TEACHER) {
      const teacher = teachers.find(t => t.email?.toLowerCase() === identifier.toLowerCase() && t.password === password);
      if (teacher) {
        setRole(selectedRole);
        setUser(teacher);
        safeSaveUser(teacher, selectedRole);
        navigate('teacher-dashboard');
      } else {
        alert("Invalid teacher credentials.");
      }
    } else {
      const isMasterAdmin = identifier.toLowerCase() === adminProfile.email.toLowerCase() && password === adminProfile.password;
      const partialAdmin = adminProfile.partialAdmins?.find(pa => pa.email.toLowerCase() === identifier.toLowerCase() && pa.password === password);

      if (isMasterAdmin || partialAdmin) {
         setRole(selectedRole);
         const loggedInUser = partialAdmin ? { ...partialAdmin, role: UserRole.ADMIN } : { ...adminProfile, role: UserRole.ADMIN };
         setUser(loggedInUser);
         safeSaveUser(loggedInUser, selectedRole);
         navigate('admin-dashboard');
      } else {
        alert("Invalid admin credentials.");
      }
    }
  };

  const handleLogout = async () => {
    try {
      // Perform signOut but don't let it block local state clearing if it fails
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Supabase signOut error:", err);
    }
    
    // Clear local state immediately for responsive UI
    setRole(UserRole.GUEST);
    setUser(null);
    localStorage.removeItem('phoenix_role');
    localStorage.removeItem('phoenix_user');
    navigate('home');
  };

  const updateSubjectsWithSync = (action: React.SetStateAction<Subject[]>) => {
    setSubjects(action);
  };

  const updateTeachersWithSync = (action: React.SetStateAction<Teacher[]>) => {
    setTeachers(action);
  };

  const updateExamsWithSync = (action: React.SetStateAction<Exam[]>) => {
    setExams(action);
  };

  const updateVideoClassesWithSync = (action: React.SetStateAction<VideoClass[]>) => {
    setVideoClasses(action);
  };

  const updateAssignmentsWithSync = (action: React.SetStateAction<Assignment[]>) => {
    setAssignments(action);
  };

  const deleteStudentWithSync = async (studentId: string) => {
    console.log("deleteStudentWithSync called with ID:", studentId);
    if (!studentId) {
      console.error("No studentId provided to deleteStudentWithSync");
      return;
    }
    
    const confirmDelete = window.confirm("Are you sure you want to delete this student? This action cannot be undone.");
    if (!confirmDelete) return;

    // Optimistic update
    console.log("Performing optimistic update for student deletion");
    setStudents(prev => {
      const filtered = prev.filter(s => String(s.id) !== String(studentId));
      console.log(`Filtered students: ${prev.length} -> ${filtered.length}`);
      return filtered;
    });

    try {
      console.log("Calling deleteData for students table");
      await deleteData('students', studentId);
      console.log("deleteData successful");
      alert("Student record removed successfully.");
    } catch (err) {
      console.error("Critical Delete Error:", err);
      alert("Student removed from current view. (Backend sync failed)");
    }
  };

  const deleteTeacherWithSync = async (teacherId: string) => {
    console.log("[App] deleteTeacherWithSync called with ID:", teacherId);
    if (!teacherId) {
      console.error("[App] No teacherId provided for deletion");
      return;
    }
    
    if (window.confirm("Are you sure you want to delete this teacher? This will remove their login access and profile.")) {
      console.log("[App] Performing optimistic update for teacher deletion:", teacherId);
      setTeachers(prev => {
        const filtered = prev.filter(t => String(t.id) !== String(teacherId));
        console.log(`[App] Teachers filtered: ${prev.length} -> ${filtered.length}`);
        return filtered;
      });
      
      try {
        console.log("[App] Calling deleteData for teachers table with ID:", teacherId);
        const result = await deleteData('teachers', teacherId);
        console.log("[App] deleteData result:", result);
        alert("Teacher removed successfully.");
      } catch (err: any) {
        console.error("[App] Teacher Delete Error:", err);
        alert("Teacher removed from current view, but backend sync failed: " + (err.message || "Unknown error"));
      }
    }
  };

  const deleteSubjectWithSync = async (subjectId: string) => {
    console.log("deleteSubjectWithSync called with ID:", subjectId);
    if (!subjectId) return;
    if (window.confirm("Are you sure you want to delete this course?")) {
      console.log("Performing optimistic update for subject deletion");
      setSubjects(prev => prev.filter(s => String(s.id) !== String(subjectId)));

      try {
        console.log("Calling deleteData for subjects table");
        await deleteData('subjects', subjectId);
        alert("Course removed successfully.");
      } catch (err) {
        console.error("Course Delete Error:", err);
        alert("Course removed from current view. (Backend sync failed)");
      }
    }
  };

  const deleteExamWithSync = async (examId: string) => {
    console.log("deleteExamWithSync called with ID:", examId);
    if (!examId) return;
    if (window.confirm("Are you sure you want to delete this exam?")) {
      console.log("Performing optimistic update for exam deletion");
      setExams(prev => prev.filter(e => String(e.id) !== String(examId)));

      try {
        console.log("Calling deleteData for exams table");
        await deleteData('exams', examId);
        alert("Exam removed successfully.");
      } catch (err) {
        console.error("Exam Delete Error:", err);
        alert("Exam removed from current view. (Backend sync failed)");
      }
    }
  };

  const deleteVideoClassWithSync = async (videoId: string) => {
    if (!videoId) return;
    if (window.confirm("Are you sure you want to delete this video class?")) {
      setVideoClasses(prev => prev.filter(v => String(v.id) !== String(videoId)));
      try {
        await deleteData('video_classes', videoId);
        alert("Video class removed successfully.");
      } catch (err) {
        console.error("Video Class Delete Error:", err);
        alert("Video class removed from current view. (Backend sync failed)");
      }
    }
  };

  const deleteChatbotKnowledgeWithSync = async (knowledgeId: string) => {
    if (!knowledgeId) return;
    if (window.confirm("Are you sure you want to delete this knowledge entry?")) {
      setChatbotKnowledge(prev => prev.filter(k => String(k.id) !== String(knowledgeId)));
      try {
        await deleteData('chatbot_knowledge', knowledgeId);
        alert("Knowledge entry removed successfully.");
      } catch (err) {
        console.error("Chatbot Knowledge Delete Error:", err);
        alert("Knowledge entry removed from current view. (Backend sync failed)");
      }
    }
  };

  const syncSiteConfig = async (updatedLogo: string, updatedAdmin: AdminUser, updatedFooter: FooterData, updatedHome: HomeData) => {
    return syncData('site_config', {
      id: configId, 
      logo: updatedLogo,
      adminProfile: updatedAdmin,
      footerData: updatedFooter,
      homeData: updatedHome
    });
  };

  const handleAdmissionSubmit = async (newAppData: any) => {
    console.log("[App] Starting admission submission for:", newAppData.email);
    try {
      // Step 1: Sign up in Supabase Auth to add to Users dashboard
      const authData = await signUpUser(newAppData.email, newAppData.password, { name: newAppData.name });
      
      if (!authData.user) throw new Error("Auth registration failed.");
      console.log("[App] Auth registration successful, UID:", authData.user.id);

      // Step 2: Create student record in Database
      const newStudent: Student = {
        id: authData.user.id, // Use Supabase Auth UID as primary key
        name: newAppData.name,
        email: newAppData.email,
        phone: newAppData.ownPhone || newAppData.guardianPhone,
        password: newAppData.password,
        class: newAppData.class,
        attendance: 0,
        averageScore: 0,
        assignments: 0,
        feesPaid: false,
        subjects: subjects.slice(0, 3).map(s => s.name),
        isVerified: false,
        address: newAppData.address,
        dob: newAppData.dob,
        sscRoll: newAppData.sscRoll,
        sscReg: newAppData.sscReg,
        ownPhone: newAppData.ownPhone,
        guardianPhone: newAppData.guardianPhone,
        dailyAttendance: {},
        monthlyFeeStatus: 'Due',
        courseFeeStatus: 'Due',
        subjectPayments: {}
      };
      
      console.log("[App] Adding student to local state and triggering sync...");
      updateStudentsWithSync(prev => [newStudent, ...prev]);
      alert("Admission request submitted successfully! Please wait for admin approval.");
    } catch (err: any) {
      console.error("[App] Admission Error:", err);
      if (err.message?.includes("already registered")) {
        alert("This email is already registered. If you already submitted an application, please wait for admin approval or try logging in.");
      } else {
        alert(err.message || "Failed to submit admission. Please try a different email.");
      }
    }
  };

  if (isLoading) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] overflow-hidden">
        {/* Floating Particles Background */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * 1000, 
                y: Math.random() * 1000,
                opacity: Math.random() * 0.5
              }}
              animate={{ 
                y: [null, Math.random() * -100, Math.random() * 100],
                x: [null, Math.random() * -100, Math.random() * 100],
                opacity: [0.2, 0.5, 0.2]
              }}
              transition={{ 
                duration: 5 + Math.random() * 10, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              className="absolute w-1 h-1 bg-orange-500 rounded-full"
            />
          ))}
        </div>

        <div className="flex flex-col items-center space-y-12 relative z-10">
          {/* Futuristic Ambient Glows */}
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-orange-500/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-[120px] animate-pulse delay-700"></div>
          
          <div className="relative">
            {/* Outer Rotating Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-8 border-2 border-dashed border-orange-500/30 rounded-full"
            />
            
            {/* Inner Rotating Ring */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-4 border border-blue-500/20 rounded-full"
            />

            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                y: [0, -10, 0]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="relative z-10"
            >
              <div className="w-32 h-32 bg-gradient-to-br from-orange-500/20 to-blue-500/20 rounded-[32px] backdrop-blur-xl border border-white/10 flex items-center justify-center text-6xl shadow-2xl">
                <motion.span
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🚀
                </motion.span>
              </div>
            </motion.div>
          </div>
          
          <div className="text-center space-y-6 w-full max-w-xs">
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                PHOENIX<span className="text-orange-500">.</span>
              </h2>
              <div className="flex items-center justify-center gap-3">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping"></div>
                <p className="text-slate-400 font-black tracking-[0.3em] uppercase text-[10px]">
                  Initializing Quantum Learning
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(loadingProgress, 100)}%` }}
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-400 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                />
              </div>
              <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-500">
                <span>System Check</span>
                <span>{Math.round(Math.min(loadingProgress, 100))}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

  const saveSiteConfig = async (updatedLogo: string, updatedAdmin: AdminUser, updatedFooter: FooterData, updatedHome: HomeData) => {
    setIsSaving(true);
    try {
      setLogo(updatedLogo);
      setAdminProfile(updatedAdmin);
      setFooterData(updatedFooter);
      setHomeData(updatedHome);
      
      // Update the current user session if the logged-in user is an admin
      if (role === UserRole.ADMIN && user) {
        const isMaster = user.email.toLowerCase() === updatedAdmin.email.toLowerCase();
        if (isMaster) {
          const updatedUser = { ...updatedAdmin, role: UserRole.ADMIN };
          setUser(updatedUser);
          safeSaveUser(updatedUser, UserRole.ADMIN);
        } else {
          const partial = updatedAdmin.partialAdmins?.find(pa => pa.id === user.id);
          if (partial) {
            const updatedUser = { ...partial, role: UserRole.ADMIN };
            setUser(updatedUser);
            safeSaveUser(updatedUser, UserRole.ADMIN);
          }
        }
      }

      await syncSiteConfig(updatedLogo, updatedAdmin, updatedFooter, updatedHome);
    } catch (err) {
      console.error("[App] saveSiteConfig Error:", err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const forceSyncAll = async () => {
    setIsSaving(true);
    try {
      console.log("[App] Manual Force Sync triggered...");
      await Promise.all([
        syncData('students', students),
        syncData('teachers', teachers),
        syncData('subjects', subjects),
        syncData('exams', exams),
        syncData('video_classes', videoClasses),
        syncData('chatbot_knowledge', chatbotKnowledge),
        syncData('assignments', assignments),
        syncData('reviews', reviews),
        syncData('site_config', {
          id: configId,
          logo,
          adminProfile,
          footerData,
          homeData
        })
      ]);
      alert("Cloud synchronization complete. All data is up to date.");
    } catch (err) {
      console.error("[App] Force Sync Error:", err);
      alert("Sync failed. Please check your connection.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className={`min-h-screen flex flex-col transition-colors duration-200 ${darkMode ? 'dark bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Navbar 
        currentPage={currentPage} 
        navigate={navigate} 
        role={role} 
        onLogout={handleLogout}
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode(!darkMode)}
        logoImage={logo}
        organizationName={footerData.organizationName}
        isSaving={isSaving}
      />

      <Chatbot 
        isOpen={isChatbotOpen} 
        onClose={() => setIsChatbotOpen(false)} 
        knowledge={chatbotKnowledge}
        teachers={teachers}
        subjects={subjects}
      />

      {/* Floating Chatbot Toggle (Corner) */}
      {!isChatbotOpen && (
        <button 
          onClick={() => setIsChatbotOpen(true)}
          className="fixed bottom-6 right-6 z-[60] w-14 h-14 bg-gradient-to-br from-blue-600 to-orange-500 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group"
          title="Phoenix Assistant"
        >
          <MessageSquare size={28} className="group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
        </button>
      )}
      
      <main className="flex-grow pt-20 md:pt-24">
        <Routes>
          <Route path="/" element={<Home navigate={navigate} homeData={homeData} role={role} subjects={subjects} reviews={reviews} setReviews={setReviews} currentUser={user} />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/courses" element={<Courses subjects={subjects} teachers={teachers} navigate={navigate} />} />
          <Route path="/classes" element={<Classes videoClasses={videoClasses} />} />
          <Route path="/teachers" element={<TeachersPage teachers={teachers} />} />
          <Route path="/admission" element={<Admission onSubmit={handleAdmissionSubmit} homeData={homeData} />} />
          <Route path="/contact" element={<Contact footerData={footerData} />} />
          <Route path="/about" element={<About content={homeData.aboutPage} />} />
          <Route path="/privacy" element={<About content={homeData.privacyPage} />} />
          <Route path="/terms" element={<About content={homeData.termsPage} />} />
          <Route path="/refund" element={<About content={homeData.refundPage} />} />
          <Route path="/success-stories" element={<SuccessStories content={homeData.successStoriesPage} stories={homeData.successStories} />} />
          <Route path="/resources" element={<Resources content={homeData.resourcesPage} resources={homeData.resources} />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/olympiad" element={<Olympiad role={role} currentUser={user} logoImage={logo} navigate={navigate} />} />
          
          <Route path="/student-dashboard" element={
            (!user || role !== UserRole.STUDENT) ? (
              <Navigate to="/login" replace />
            ) : (
              <StudentDashboard 
                student={students.find(s => s.id === user.id) || user} 
                exams={exams} 
                onLogout={handleLogout} 
                subjects={subjects} 
                students={students} 
                navigate={navigate} 
                resources={homeData.resources || []} 
                assignments={assignments}
                notices={notices}
              />
            )
          } />
          
          <Route path="/teacher-dashboard" element={
            (!user || role !== UserRole.TEACHER) ? (
              <Navigate to="/login" replace />
            ) : (
              <TeacherDashboard 
                teacher={teachers.find(t => t.id === user.id) || user} 
                teachers={teachers}
                onLogout={handleLogout} 
                subjects={subjects} 
                students={students} 
                setStudents={updateStudentsWithSync} 
                exams={exams} 
                setExams={updateExamsWithSync} 
                setTeachers={updateTeachersWithSync}
                deleteExam={deleteExamWithSync}
                navigate={navigate}
                resources={homeData.resources || []}
                assignments={assignments}
                setAssignments={updateAssignmentsWithSync}
                notices={notices}
              />
            )
          } />
          
          <Route path="/admin-dashboard" element={
            (!user || role !== UserRole.ADMIN) ? (
              <Navigate to="/login" replace />
            ) : (
              <AdminDashboard 
                onLogout={handleLogout} 
                logo={logo} 
                setLogo={(v) => { setLogo(v); syncSiteConfig(v, adminProfile, footerData, homeData); }} 
                subjects={subjects} 
                setSubjects={updateSubjectsWithSync}
                students={students}
                setStudents={updateStudentsWithSync}
                teachers={teachers}
                setTeachers={updateTeachersWithSync}
                exams={exams}
                setExams={updateExamsWithSync}
                videoClasses={videoClasses}
                setVideoClasses={updateVideoClassesWithSync}
                deleteStudent={deleteStudentWithSync}
                deleteTeacher={deleteTeacherWithSync}
                deleteSubject={deleteSubjectWithSync}
                deleteExam={deleteExamWithSync}
                deleteVideoClass={deleteVideoClassWithSync}
                chatbotKnowledge={chatbotKnowledge}
                setChatbotKnowledge={setChatbotKnowledge}
                deleteChatbotKnowledge={deleteChatbotKnowledgeWithSync}
                adminProfile={adminProfile}
                footerData={footerData}
                homeData={homeData}
                saveSiteConfig={saveSiteConfig}
                isSaving={isSaving}
                forceSyncAll={forceSyncAll}
                currentUser={user}
                assignments={assignments}
                setAssignments={updateAssignmentsWithSync}
                notices={notices}
                setNotices={updateNoticesWithSync}
                darkMode={darkMode}
              />
            )
          } />

          <Route path="/omr" element={
            (!user || (role !== UserRole.ADMIN && role !== UserRole.TEACHER)) ? (
              <Navigate to="/login" replace />
            ) : (
              <OMRDashboard />
            )
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer 
        data={footerData} 
        navigate={navigate}
      />

      {/* Notice Notification Overlay */}
      <div className="fixed bottom-24 right-6 z-[999] flex flex-col gap-4 pointer-events-none">
        {notices
          .filter(notice => {
            if (dismissedNoticeIds.includes(notice.id)) return false;
            if (role === UserRole.ADMIN) return false;
            if (role === UserRole.STUDENT) {
              return notice.batch === 'All' || notice.batch === user?.batch;
            }
            if (role === UserRole.TEACHER) {
              return notice.facultyId === user?.id || notice.facultyId === 'All';
            }
            return false;
          })
          .slice(0, 3)
          .map((notice, idx) => (
            <motion.div
              key={notice.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="pointer-events-auto w-80 sm:w-96 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl p-6 relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
              <button 
                onClick={() => setDismissedNoticeIds(prev => [...prev, notice.id])}
                className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
              >
                <X size={18} />
              </button>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600 shrink-0">
                  <Bell size={20} className="animate-bounce" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{notice.type}</span>
                    <span className="text-[10px] font-bold text-slate-400">• {new Date(notice.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">{notice.subject}</h4>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest space-y-1">
                    <p>📅 {notice.date} at {notice.time}</p>
                    <p>👨‍🏫 {teachers.find(t => t.id === notice.facultyId)?.name || 'Faculty'}</p>
                  </div>
                  {notice.note && (
                    <p className="text-[10px] text-slate-500 italic bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg mt-2 border border-slate-100 dark:border-slate-800">
                      "{notice.note}"
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
      </div>
      </div>
    </ErrorBoundary>
  );
};

export default App;
