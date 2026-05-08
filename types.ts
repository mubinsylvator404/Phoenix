
export enum UserRole {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  GUEST = 'GUEST'
}

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  qualification: string;
  experience: string;
  image: string;
  education?: string;
  email?: string; // For teacher login
  password?: string; // For teacher login
  profileType?: 'text' | 'link' | 'pdf';
  profileContent?: string;
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  classesPerWeek: number;
  fee?: number;
  paymentType?: 'Monthly' | 'One-time';
  assignedTeachers?: string[]; // Array of teacher IDs
  thumbnail?: string;
  description?: string;
  subSubjects?: string[]; // New field for subjects under a course
}

export interface Exam {
  id: string;
  name: string;
  subject: string;
  date: string;
  batch?: string; // New field for batch-wise exams
  totalMarks?: number;
  marks: Record<string, number>; // studentId -> marks
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  batch: string;
  dueDate: string;
  totalMarks: number;
  createdAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  status: 'Pending' | 'Submitted';
  marks?: number;
  submittedAt: string;
  fileUrl?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string; // Acts as primary contact
  password?: string;
  class: 'HSC 1st Year' | 'HSC 2nd Year';
  attendance: number;
  averageScore: number;
  assignments: number; // percentage
  assignmentSubmissions?: AssignmentSubmission[];
  feesPaid: boolean; // Legacy summary field
  subjects: string[];
  isVerified: boolean;
  isBlocked?: boolean;
  dailyAttendance?: Record<string, boolean>; // date (YYYY-MM-DD) -> present (true/false)
  joinDate?: string;
  
  // New Admission Fields
  address?: string;
  dob?: string;
  sscRoll?: string;
  sscReg?: string;
  ownPhone?: string;
  guardianPhone?: string;
  batch?: string; // New field for student batching

  // Granular Payment Statuses
  monthlyFeeStatus?: 'Paid' | 'Due';
  courseFeeStatus?: 'Paid' | 'Due';

  // Course-wise Payment Tracking
  subjectPayments?: Record<string, 'Paid' | 'Due'>; // subjectId -> status (for one-time or general)
  subjectPaymentTypes?: Record<string, 'Monthly' | 'One-time'>; // subjectId -> type
  subjectEnrollmentDates?: Record<string, string>; // subjectId -> date
  
  // Monthly payment tracking: subjectId -> month (YYYY-MM) -> status
  monthlyPayments?: Record<string, Record<string, 'Paid' | 'Due'>>;
  
  feeRecords?: FeeRecord[];
}

export interface FeeRecord {
  id: string;
  receiptNo: string;
  paymentDate: string;
  subjectId: string;
  feeType: 'Monthly' | 'One-time';
  fromDate: string;
  toDate: string;
  paidAmount: number;
  discount: number;
  paymentMode: string;
  remarks: string;
}

export interface SuccessStory {
  id: string;
  name: string;
  achievement: string;
  institution: string;
  image: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  type: string;
  size: string;
  url: string;
  category?: string;
  subject?: string;
}

export interface VideoClass {
  id: string;
  title: string;
  youtubeUrl: string;
  thumbnail?: string;
}

export interface Review {
  id: string;
  userName: string;
  userType: 'Student' | 'Guardian' | 'Other';
  rating: number;
  comment: string;
  createdAt: string;
  isApproved: boolean;
  hscBatch?: string;
  studentName?: string;
  relation?: string;
}

export interface PerformanceInsight {
  status: 'Critical' | 'Warning' | 'Good' | 'Excellent';
  color: string;
  message: string;
}

export interface PartialAdmin {
  id: string;
  name: string;
  email: string;
  password: string;
  permissions: string[]; // e.g., ['Students', 'Teachers', 'Courses', 'Exams', 'Attendance', 'Payments', 'Videos', 'Chatbot', 'Reports']
  avatar?: string;
}

export interface AdminUser {
  name: string;
  email: string;
  password?: string; // New field for dynamic admin login
  avatar?: string;
  partialAdmins?: PartialAdmin[];
}

export interface FooterData {
  organizationName?: string; // New field for "Phoenix Edu Care"
  description: string;
  address: string;
  phone: string;
  email: string;
  quickLinksTitle?: string; // New field for SS3 title
  quickLinks: { name: string; url: string }[];
  supportLinksTitle?: string; // New field for SS2 title
  supportLinks: { name: string; url: string }[];
  socialLinks?: { name: string; url: string }[];
  youtube?: string;
  facebook?: string;
  linkedin?: string;
  privacyPolicy?: string;
  termsOfService?: string;
  refundPolicy?: string;
}

export interface Founder {
  id: string;
  name: string;
  role: string;
  quote: string;
  bio: string;
  image: string;
}

export interface FeatureCard {
  id: string;
  title: string;
  icon: 'GraduationCap' | 'School' | 'BarChart3' | 'Users' | 'BookOpen' | 'Zap';
  color: string;
}

export interface PageContent {
  title: string;
  subtitle: string;
  content: string;
  sections?: { title: string; content: string }[];
  founders?: Founder[];
  featureCards?: FeatureCard[];
}

export interface ScholarshipData {
  title: string;
  description: string;
  image: string;
  applyLink: string;
  isActive: boolean;
}

export interface HomeData {
  heroTitle: string;
  heroSubtitle?: string; // New field for the orange part of the hero title
  heroBgImage?: string;
  heroTitleSize?: string;
  heroTitleFontSize?: number;
  heroTitleLineHeight?: number;
  heroTitleColor?: string;
  heroTitleWeight?: string;
  heroEnrollText: string;
  heroExploreText: string;
  statExperience: string;
  statExperienceLabel?: string;
  statStudents: string;
  statStudentsLabel?: string;
  feature1Title: string;
  feature1Desc: string;
  feature1Icon: React.ReactNode;
  feature2Title: string;
  feature2Desc: string;
  feature2Icon: React.ReactNode;
  feature3Title: string;
  feature3Desc: string;
  feature3Icon: React.ReactNode;
  testimonialText: string;
  appDownloadUrl?: string; // New field for app download link
  aboutPage?: PageContent;
  privacyPage?: PageContent;
  termsPage?: PageContent;
  refundPage?: PageContent;
  successStoriesPage?: PageContent;
  resourcesPage?: PageContent;
  successStories?: SuccessStory[];
  resources?: ResourceItem[];
  scholarship?: ScholarshipData;
}

export interface ChatbotKnowledge {
  id: string;
  question: string;
  answer: string;
  category?: 'Phoenix' | 'Science' | 'Math' | 'General';
}

export interface Notice {
  id: string;
  type: 'Announcement' | 'Class Schedule';
  date: string;
  time: string;
  subject: string;
  facultyId: string;
  batch: string;
  note?: string;
  createdAt: string;
}

export interface UserAnalytics {
  id: string;
  user_id: string;
  city: string;
  country: string;
  created_at: string;
}

export interface AnalyticsSummary {
  totalUsers: number;
  activeToday: number;
  newLast7Days: number;
  topCities: { name: string; count: number }[];
  topCountries: { name: string; count: number }[];
  growthData: { date: string; count: number }[];
  recentActivity: {
    id: string;
    userName: string;
    userId: string;
    role: string;
    city: string;
    country: string;
    timestamp: string;
  }[];
}

export interface SyllabusProgress {
  id: string;
  batch: string;
  subject: string;
  chapter_name: string;
  teacher_name: string;
  status: 'Pending' | 'Running' | 'Finished';
  total_lectures?: number;
  updated_at: string;
}

export interface OlympiadEvent {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  banner_image?: string;
  date: string;
  status: 'Upcoming' | 'Running' | 'Completed';
  registration_url?: string;
  external_link?: string;
  created_at: string;
}

export interface OlympiadSpeaker {
  id: string;
  olympiad_id: string;
  name: string;
  university: string;
  department: string;
  bio: string;
  image: string;
  topics: string[];
  external_link?: string;
}

export interface OlympiadResource {
  id: string;
  olympiad_id: string;
  title: string;
  type: 'Question Paper' | 'Solution' | 'Result' | 'Merit List' | 'Event Details';
  url: string;
  video_url?: string;
}

export interface OlympiadVideo {
  id: string;
  olympiad_id: string;
  title: string;
  youtube_url: string;
}
