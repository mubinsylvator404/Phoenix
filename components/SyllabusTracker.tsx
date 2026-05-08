
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  PlayCircle, 
  User, 
  ChevronDown, 
  Filter, 
  BarChart3, 
  Calendar,
  Loader2,
  AlertCircle,
  Plus,
  Save,
  TrendingUp,
  ArrowRight,
  X
} from 'lucide-react';
import { SyllabusProgress, Teacher, UserRole } from '../types';
import { TEACHERS } from '../constants';

interface SyllabusTrackerProps {
  role: UserRole;
  currentUser: any;
  batches: string[];
  teachers?: Teacher[];
}

const DEFAULT_CHAPTERS: Record<string, string[]> = {
  'পদার্থবিজ্ঞান ১ম পত্র': [
    'ভৌত জগত ও পরিমাপ',
    'ভেক্টর',
    'গতিবিদ্যা',
    'নিউটনীয় বলবিদ্যা',
    'কাজ,শক্তি ও ক্ষমতা',
    'মহakর্ষ ও অভিকর্ষ',
    'পদার্থের গাঠনিক ধর্ম',
    'পর্যায়বৃত্তিক গতি',
    'তরঙ্গ',
    'আদর্শ গ্যাস ও গ্যাসের গতিতত্ত্ব'
  ],
  'পদার্থবিজ্ঞান ২য় পত্র': [
    'তাপগতিবিদ্যা',
    'স্থির তড়িৎ',
    'চল তড়িৎ',
    'তড়িৎ প্রবাহের চৌম্বক ক্রিয়া ও চুম্বকত্ব',
    'তড়িৎ চৌম্বক আবেশ ও পরিবর্তী প্রবাহ',
    'জ্যামিতিক আলোকবিজ্ঞান',
    'ভৌত আলোকবিজ্ঞান',
    'আধুনিক পদার্থবিজ্ঞানের সূচনা',
    'পরমাণুর মডেল ও নিউক্লিয়ার পদার্থবিজ্ঞান',
    'সেমিকন্ডাক্টর ও ইলেক্ট্রনিক্স',
    'জ্যোতির্বিজ্ঞান'
  ],
  'রসায়ন ১ম পত্র': [
    'ল্যাবরেটরির নিরাপদ ব্যবহার',
    'গুণগত রসায়ন',
    'মৌলের পর্যায়বৃত্ত ধর্ম ও রাসায়নিক বন্ধন',
    'রাসায়নিক পরিবর্তন',
    'কর্মমুখী রসায়ন'
  ],
  'রসায়ন ২য় পত্র': [
    'পরিবেশ রসায়ন',
    'জৈব রসায়ন',
    'পরিমাণগত রসায়ন',
    'তড়িৎ রসায়ন',
    'অর্থনৈতিক রসায়ন'
  ],
  'উচ্চতরগণিত ১ম পত্র': [
    'ম্যাট্রিক্স ও নির্ণায়ক',
    'ভেক্টর',
    'সরলরেখা',
    'বৃত্ত',
    'বিন্যাস ও সমাবেশ',
    'ত্রিকোণমিতিক অনুপাত',
    'সংযুক্ত ও যৌগিক কোণের ত্রিকোণমিতিক অনুপাত',
    'ফাংশন ও ফাংশনের লেখচিত্র',
    'অন্তরীকরণ',
    'যোগজীকরণ'
  ],
  'উচ্চতরগণিত ২য় পত্র': [
    'বাস্তব সংখ্যা ও অসমতা',
    'যোগাশ্রয়ী প্রোগ্রাম',
    'জটিল সংখ্যা',
    'বহুপদী ও বহুপদী সমীকরণ',
    'দ্বিপদী বিস্তৃতি',
    'কনিক',
    'বিপরীত ত্রিকোণমিতিক ফাংশনও ত্রিকোণমিতিক সমীকরণ',
    'স্থিতিবিদ্যা',
    'সমতলে বস্তুকণার গতি',
    'বিস্তার পরিমাপ ও সম্ভাবনা'
  ],
  'উদ্ভিদবিজ্ঞান': [
    'কোষ ও কোষের গঠন',
    'কোষ বিভাজন',
    'কোষ রসায়ন',
    'অণুজীব',
    'শৈবাল ও ছত্রাক',
    'ব্রায়োফাইটা ও টেরিডোফাইটা',
    'নগ্নবীজী ও আবৃতবীজী উদ্ভিদ',
    'টিস্যু ও টিস্যুতন্ত্র',
    'উদ্ভিদ শারীরতত্ত্ব',
    'উদ্ভিদের প্রজনন',
    'জীব প্রযুক্তি',
    'জীবের পরিবেশ, বিস্তার ও সংরক্ষণ'
  ],
  'প্রাণিবিজ্ঞান': [
    'প্রাণীর বিভিন্নতা ও শ্রেণিবিন্যাস',
    'প্রাণীর পরিচিতিঃ হাইড্রা',
    'প্রাণীর পরিচিতি: ঘাসফড়িং',
    'প্রাণীর পরিচিতিঃ রুই মাছ',
    'পরিপাক ও শোষণ',
    'রক্ত ও রক্ত সঞ্চালন',
    'শ্বসন ও শ্বাসক্রিয়া',
    'বর্জ্য ও নিষ্কাশন',
    'চলন ও অঙ্গচালনা',
    'সমন্বয় ও নিয়ন্ত্রণ',
    'মানব জীবনের ধারাবাহিকতা',
    'মানবদেহের প্রতিরক্ষা',
    'জিনতত্ত্ব ও বিবর্তন',
    'প্রাণীর আচরণ'
  ],
  'তথ্য ও যোগাযোগ প্রযুক্তি': [
    'বিশ্ব ও বাংলাদেশ',
    'ডেটা কমিউনিকেশন ও কম্পিউটার নেটওয়ার্ক',
    'সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস',
    'ওয়েব ডিজাইন এবং HTML',
    'প্রোগ্রামিং ভাষা',
    'ডাটাবেইজ ম্যানেজমেন্ট সিস্টেম'
  ],
  'বাংলা ১ম পত্র': [
    'all kobita',
    'all golpo'
  ],
  'বাংলা ২য় পত্র': [
    'বাংলা উচ্চারণের নিয়ম',
    'বাংলা বানানের নিয়ম',
    'বাংলা ভাষার ব্যাকরণিক শব্দশ্রেণি',
    'উপসর্গ',
    'প্রত্যয়',
    'সমাস',
    'বাক্যতত্ত্ব',
    'বাংলা ভাষার অপপ্রয়োগ ও শুদ্ধ প্রয়োগ',
    'কারক'
  ],
  'English 1st paper': [
    'Unit 1',
    'Unit 2',
    'Unit 3',
    'Unit 4',
    'Unit 5',
    'Unit 6',
    'Unit 7',
    'Unit 8',
    'Unit 9',
    'Unit 10',
    'Unit 11',
    'Unit 12'
  ],
  'English 2nd paper': [
    'Articles',
    'Preposition',
    'Completing Sentences with clues',
    'Completing Sentences',
    'Right Form of Verbs',
    'Changing Sentences',
    'Narration',
    'Pronoun Referencing',
    'Modifiers',
    'Sentence Connectors',
    'Synonyms and Antonyms',
    'Punctuation Marks'
  ]
};

const SyllabusTracker: React.FC<SyllabusTrackerProps> = ({ role, currentUser, batches, teachers = TEACHERS }) => {
  const [selectedBatch, setSelectedBatch] = useState(batches[0] || 'HSC 2025');
  const [selectedSubject, setSelectedSubject] = useState('পদার্থবিজ্ঞান ১ম পত্র');
  const [teacherFilter, setTeacherFilter] = useState('All');
  const [progress, setProgress] = useState<SyllabusProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [isTableMissing, setIsTableMissing] = useState(false);
  const [finishingChapter, setFinishingChapter] = useState<SyllabusProgress | null>(null);
  const [lecturesCount, setLecturesCount] = useState("0");
  const [selectedStatus, setSelectedStatus] = useState<'Running' | 'Finished' | 'Pending' | null>(null);
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [newChapterName, setNewChapterName] = useState('');
  const [lastError, setLastError] = useState<string | null>(null);

  const subjects = Object.keys(DEFAULT_CHAPTERS);

  const fetchProgress = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/syllabus?batch=${encodeURIComponent(selectedBatch)}&subject=${encodeURIComponent(selectedSubject)}`);
      const contentType = response.headers.get("content-type");
      let result;
      
      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        const text = await response.text();
        console.error("Non-JSON fetch response:", text);
        throw new Error(`Server fetch error (${response.status})`);
      }
      
      if (result.error) {
        console.error("Syllabus API error:", result.error, result.details);
        setIsTableMissing(result.tableMissing || false);
        // Fallback to empty array if API returns error
        setProgress(DEFAULT_CHAPTERS[selectedSubject]?.map(chapterName => ({
          id: `temp-${chapterName}-${selectedBatch}-${selectedSubject}`,
          batch: selectedBatch,
          subject: selectedSubject,
          chapter_name: chapterName,
          teacher_name: 'Unassigned',
          status: 'Pending',
          updated_at: new Date().toISOString()
        })) || []);
        return;
      }
      
      const dataArray = Array.isArray(result) ? result : (result.data || []);
      const normalizedData = dataArray.map((p: any) => ({
        ...p,
        chapter_name: (p.chapter_name || '').normalize('NFC').trim(),
        subject: (p.subject || '').normalize('NFC').trim(),
        batch: (p.batch || '').normalize('NFC').trim()
      }));

      console.log(`[Syllabus] Received ${normalizedData.length} items from server for ${selectedBatch}/${selectedSubject}`);
      setIsTableMissing(result.tableMissing || false);
      
      // Merge with default chapters and include any extra chapters from DB
      const defaultChapters = (DEFAULT_CHAPTERS[selectedSubject] || []).map(n => n.normalize('NFC').trim());
      const dbChapters = normalizedData.filter((p: SyllabusProgress) => {
        return !defaultChapters.some(dn => dn === p.chapter_name);
      });
      
      const mergedProgress = [...defaultChapters.map(chapterName => {
        const existing = normalizedData.find((p: SyllabusProgress) => p.chapter_name === chapterName);
        return existing || {
          id: `temp-${chapterName}-${selectedBatch}-${selectedSubject}`,
          batch: selectedBatch.normalize('NFC').trim(),
          subject: selectedSubject.normalize('NFC').trim(),
          chapter_name: chapterName,
          teacher_name: 'Unassigned',
          status: 'Pending',
          updated_at: new Date().toISOString()
        };
      }), ...dbChapters];
      
      setProgress(mergedProgress);
    } catch (error) {
      console.error("Failed to fetch syllabus progress:", error);
      // Fallback to default chapters on network error
      setProgress(DEFAULT_CHAPTERS[selectedSubject]?.map(chapterName => ({
        id: `temp-${chapterName}-${selectedBatch}-${selectedSubject}`,
        batch: selectedBatch,
        subject: selectedSubject,
        chapter_name: chapterName,
        teacher_name: 'Unassigned',
        status: 'Pending',
        updated_at: new Date().toISOString()
      })) || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [selectedBatch, selectedSubject]);

  const handleUpdate = async (item: SyllabusProgress, updates: Partial<SyllabusProgress>) => {
    if (role === UserRole.STUDENT) return;
    
    // Normalize string fields in updates
    const cleanUpdates: Partial<SyllabusProgress> = { ...updates };
    if (typeof cleanUpdates.chapter_name === 'string') cleanUpdates.chapter_name = cleanUpdates.chapter_name.normalize('NFC').trim();
    if (typeof cleanUpdates.teacher_name === 'string') cleanUpdates.teacher_name = cleanUpdates.teacher_name.normalize('NFC').trim();
    if (typeof cleanUpdates.batch === 'string') cleanUpdates.batch = cleanUpdates.batch.normalize('NFC').trim();
    if (typeof cleanUpdates.subject === 'string') cleanUpdates.subject = cleanUpdates.subject.normalize('NFC').trim();

    const updatedItem = { ...item, ...cleanUpdates, updated_at: new Date().toISOString() };

    // Explicit Validation
    if (updatedItem.status === 'Finished') {
      if (!updatedItem.total_lectures || updatedItem.total_lectures <= 0) {
        setLastError('Total lectures is required and must be greater than 0 to mark chapter as Finished.');
        alert('Validation Error: Total lectures is required and must be greater than 0 to mark chapter as Finished.');
        return; // Halt the update
      }
    }

    if (!updatedItem.batch || !updatedItem.subject || !updatedItem.chapter_name) {
        setLastError('Missing mandatory fields (Batch, Subject, Chapter Name) to perform this update.');
        alert('Validation Error: Mission mandatory fields.');
        return; 
    }

    // Optimistic update
    const prevProgress = [...progress];
    
    // Create payload for server
    const payload = { ...updatedItem };
    if (payload.id && typeof payload.id === 'string' && payload.id.startsWith('temp-')) {
      delete (payload as any).id;
    }

    setProgress(prev => prev.map(p => p.chapter_name.normalize('NFC').trim() === item.chapter_name.normalize('NFC').trim() ? updatedItem : p));
    setSaving(updatedItem.id);

    try {
      const response = await fetch('/api/syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const contentType = response.headers.get("content-type");
      let result;
      
      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        const text = await response.text();
        console.error("Non-JSON response from server:", text);
        throw new Error(`Server error (${response.status}): ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`);
      }
      
      if (!response.ok) {
        const errorMsg = result.details ? `${result.error}: ${result.details}` : (result.error || result.message || "Failed to save");
        throw new Error(errorMsg);
      }

      // If it was a temp chapter, update it with the returned ID from server
      if (updatedItem.id.startsWith('temp-') && result && result.id) {
        setProgress(prev => prev.map(p => p.chapter_name === updatedItem.chapter_name ? result : p));
      }
      
      setLastError(null);
    } catch (error: any) {
      console.error("Failed to update syllabus:", error);
      setProgress(prevProgress); // Revert on failure
      const cleanMessage = error.message.replace('Unexpected token' , 'Response format error').substring(0, 150);
      setLastError(cleanMessage);
      alert(`Save Error: ${cleanMessage}`);
    } finally {
      setSaving(null);
    }
  };

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapterName.trim()) return;

    const normalizedName = newChapterName.trim().normalize('NFC');
    const exists = progress.some(p => p.chapter_name.normalize('NFC').toLowerCase() === normalizedName.toLowerCase());
    if (exists) {
      alert(`Chapter "${normalizedName}" already exists in this subject.`);
      return;
    }

    const newChapterPayload: any = {
      batch: selectedBatch,
      subject: selectedSubject,
      chapter_name: normalizedName,
      teacher_name: 'Unassigned',
      status: 'Pending',
      updated_at: new Date().toISOString()
    };

    setSaving('new-chapter');
    setLastError(null);
    
    try {
      const response = await fetch('/api/syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newChapterPayload)
      });

      const contentType = response.headers.get("content-type");
      let result;
      
      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Server error (${response.status}): ${text.substring(0, 50)}`);
      }

      if (response.ok && result) {
        setProgress(prev => [...prev, result]);
        setNewChapterName('');
        setIsAddingChapter(false);
      } else {
        const errorMsg = result.details ? `${result.error}: ${result.details}` : (result.error || result.message || "Failed to add chapter");
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error("Error adding chapter:", error);
      setLastError(error.message);
      alert(`Add Error: ${error.message}`);
    } finally {
      setSaving(null);
    }
  };

  const handleDeleteChapter = async (item: SyllabusProgress) => {
    if (!window.confirm(`Delete chapter "${item.chapter_name}"?`)) return;

    if (item.id.startsWith('temp-')) {
      setProgress(prev => prev.filter(p => p.chapter_name !== item.chapter_name));
      return;
    }

    setSaving(item.id);
    try {
      const response = await fetch(`/api/syllabus?id=${item.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setProgress(prev => prev.filter(p => p.id !== item.id));
      } else {
        alert("Failed to delete chapter");
      }
    } catch (error) {
      console.error("Error deleting chapter:", error);
    } finally {
      setSaving(null);
    }
  };

  const completedChapters = progress.filter(p => p.status === 'Finished').length;
  const runningChapters = progress.filter(p => p.status === 'Running').length;
  const pendingChapters = progress.filter(p => p.status === 'Pending').length;
  const totalChapters = progress.length;
  const percentage = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

  const filteredProgress = progress.filter(p => {
    const matchesTeacher = teacherFilter === 'All' || p.teacher_name === teacherFilter;
    const matchesStatus = !selectedStatus || p.status === selectedStatus;
    return matchesTeacher && matchesStatus;
  });

  const nextChapter = progress.find(p => p.status === 'Pending' || p.status === 'Running');

  return (
    <div className="space-y-8 p-6 md:p-12 animate-in fade-in duration-700">
      {isTableMissing && role !== UserRole.STUDENT && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-500/10 border border-orange-500/20 p-6 rounded-[32px] flex items-start space-x-4"
        >
          <AlertCircle className="text-orange-500 shrink-0 mt-1" size={24} />
          <div className="space-y-2">
            <h4 className="text-orange-500 font-bold">Database Setup Required</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              The syllabus tracking table has not been created in your Supabase database yet. 
              Changes you make here will not be saved permanently until the table is created.
              Please run the <code className="bg-slate-800 px-2 py-1 rounded text-orange-400">syllabus_schema.sql</code> script in your Supabase SQL Editor.
            </p>
          </div>
        </motion.div>
      )}

      {lastError && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-red-500" />
            <div>
              <p className="text-xs font-bold text-white">Save Error</p>
              <p className="text-[10px] text-red-400 uppercase font-black tracking-widest">{lastError}</p>
            </div>
          </div>
          <button 
            onClick={() => setLastError(null)}
            className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header & Filters */}
      <div className="bg-white dark:bg-white/5 backdrop-blur-xl p-8 rounded-[40px] border border-slate-200 dark:border-white/10 shadow-2xl space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Syllabus Progress</h3>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Track academic milestones batch-wise</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            {role !== UserRole.STUDENT && (
              <button 
                onClick={() => setIsAddingChapter(true)}
                className="px-6 py-3 bg-orange-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center gap-2 shadow-lg shadow-orange-500/20"
              >
                <Plus size={16} />
                Add Chapter
              </button>
            )}
            
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Batch</span>
              <select 
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="px-6 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 transition-all"
              >
                {batches.map(b => <option key={b} value={b} className="bg-white dark:bg-slate-900">{b}</option>)}
              </select>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Subject</span>
              <select 
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-6 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 transition-all"
              >
                {subjects.map(s => <option key={s} value={s} className="bg-white dark:bg-slate-900">{s}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Teacher</span>
              <select 
                value={teacherFilter}
                onChange={(e) => setTeacherFilter(e.target.value)}
                className="px-6 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 transition-all"
              >
                <option value="All" className="bg-white dark:bg-slate-900">All Teachers</option>
                {teachers.map(t => <option key={t.id} value={t.name} className="bg-white dark:bg-slate-900">{t.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-3 gap-4 pt-4">
          <div 
            onClick={() => setSelectedStatus(selectedStatus === 'Running' ? null : 'Running')}
            className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              selectedStatus === 'Running' 
                ? 'bg-yellow-500 border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.3)]' 
                : 'bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/20'
            }`}
          >
            <h4 className={`text-2xl font-black ${selectedStatus === 'Running' ? 'text-black' : 'text-yellow-500'}`}>{runningChapters}</h4>
            <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${selectedStatus === 'Running' ? 'text-black/70' : 'text-yellow-500/70'}`}>Running</p>
          </div>
          <div 
            onClick={() => setSelectedStatus(selectedStatus === 'Finished' ? null : 'Finished')}
            className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              selectedStatus === 'Finished' 
                ? 'bg-green-500 border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.3)]' 
                : 'bg-green-500/10 border-green-500/20 hover:bg-green-500/20'
            }`}
          >
            <h4 className={`text-2xl font-black ${selectedStatus === 'Finished' ? 'text-white' : 'text-green-500'}`}>{completedChapters}</h4>
            <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${selectedStatus === 'Finished' ? 'text-white/70' : 'text-green-500/70'}`}>Complete</p>
          </div>
          <div 
            onClick={() => setSelectedStatus(selectedStatus === 'Pending' ? null : 'Pending')}
            className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              selectedStatus === 'Pending' 
                ? 'bg-slate-500 border-slate-400 shadow-[0_0_20px_rgba(100,116,139,0.3)]' 
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <h4 className={`text-2xl font-black ${selectedStatus === 'Pending' ? 'text-white' : 'text-slate-400'}`}>{pendingChapters}</h4>
            <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${selectedStatus === 'Pending' ? 'text-white/70' : 'text-slate-500'}`}>Pending</p>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4">
          <div className="md:col-span-2 bg-slate-50 dark:bg-white/5 p-6 rounded-3xl border border-slate-100 dark:border-white/10 space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Overall Progress</p>
                <h4 className="text-4xl font-black text-slate-900 dark:text-white">{percentage}%</h4>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Completed</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{completedChapters} / {totalChapters}</p>
              </div>
            </div>
            <div className="h-3 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 shadow-[0_0_20px_rgba(249,115,22,0.4)]"
              />
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-3xl border border-slate-100 dark:border-white/10 flex flex-col justify-center">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Next Chapter</p>
            <h5 className="text-sm font-bold text-slate-900 dark:text-white mt-1 line-clamp-1">
              {nextChapter ? nextChapter.chapter_name : 'All Completed!'}
            </h5>
            {nextChapter && (
              <div className="flex items-center gap-2 mt-2 text-orange-500">
                <ArrowRight size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Recommended</span>
              </div>
            )}
          </div>

          <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-3xl border border-slate-100 dark:border-white/10 flex flex-col justify-center">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Last Updated</p>
            <h5 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
              {progress.length > 0 ? new Date(Math.max(...progress.map(p => new Date(p.updated_at).getTime()))).toLocaleDateString() : 'N/A'}
            </h5>
            <div className="flex items-center gap-2 mt-2 text-slate-500">
              <Calendar size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Timeline</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chapters List */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Syncing Progress...</p>
          </div>
        ) : filteredProgress.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-[40px] border border-white/10">
            <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No chapters found for this filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredProgress.map((item, idx) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={`${item.chapter_name}-${idx}`}
                className={`group relative bg-white/5 backdrop-blur-xl p-6 rounded-3xl border transition-all ${
                  item.status === 'Finished' ? 'border-green-500/20 bg-green-500/5' : 
                  item.status === 'Running' ? 'border-yellow-500/20 bg-yellow-500/5' : 
                  'border-white/10'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <div className="space-y-4 flex-1 w-full">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${
                        item.status === 'Finished' ? 'bg-green-500/20 text-green-500' : 
                        item.status === 'Running' ? 'bg-yellow-500/20 text-yellow-500' : 
                        'bg-white/10 text-slate-400'
                      }`}>
                        {item.status === 'Finished' ? <CheckCircle2 size={20} /> : 
                         item.status === 'Running' ? <PlayCircle size={20} /> : 
                         <Clock size={20} />}
                      </div>
                      <h4 className="text-base font-black text-white uppercase tracking-tight leading-tight">{item.chapter_name}</h4>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 ml-1">
                      <div className="flex items-center gap-2 text-slate-400">
                        <User size={14} className="shrink-0" />
                        {role !== UserRole.STUDENT ? (
                          <select 
                            value={item.teacher_name}
                            onChange={(e) => handleUpdate(item, { teacher_name: e.target.value })}
                            className="bg-transparent text-xs font-bold uppercase tracking-widest focus:outline-none text-white cursor-pointer hover:text-orange-500 transition-colors"
                          >
                            <option value="Unassigned">Unassigned</option>
                            {teachers.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                          </select>
                        ) : (
                          <span className="text-xs font-bold uppercase tracking-widest">{item.teacher_name}</span>
                        )}
                      </div>

                      {item.status === 'Finished' && (
                        <div className="flex items-center gap-2 text-orange-500">
                          <TrendingUp size={14} className="shrink-0" />
                          <span className="text-xs font-black uppercase tracking-widest">
                            {item.total_lectures || 0} Lectures
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-start sm:items-end gap-4 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-0 border-white/5">
                    {role !== UserRole.STUDENT ? (
                      <div className="flex flex-col gap-4 w-full sm:items-end">
                        <div className="flex flex-wrap items-center gap-2">
                          {['Pending', 'Running', 'Finished'].map((s) => (
                            <button
                              key={s}
                              onClick={() => {
                                if (s === 'Finished') {
                                  setFinishingChapter(item);
                                  setLecturesCount(item.total_lectures?.toString() || "0");
                                } else {
                                  handleUpdate(item, { status: s as any });
                                }
                              }}
                              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${
                                item.status === s 
                                  ? s === 'Finished' ? 'bg-green-500 text-white shadow-green-500/20' : 
                                    s === 'Running' ? 'bg-yellow-500 text-black shadow-yellow-500/20' : 
                                    'bg-slate-500 text-white'
                                  : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-slate-300'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center justify-between sm:justify-end w-full gap-4">
                          {saving === item.id && (
                            <div className="flex items-center gap-2 text-orange-500">
                              <Loader2 size={12} className="animate-spin" />
                              <span className="text-[8px] font-black uppercase tracking-widest">Saving...</span>
                            </div>
                          )}
                          {item.id && !item.id.startsWith('temp-') && (
                            <button 
                              onClick={() => handleDeleteChapter(item)}
                              className="px-3 py-1 text-[10px] font-bold text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg uppercase tracking-widest transition-all"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${
                        item.status === 'Finished' ? 'bg-green-500/20 text-green-500 border border-green-500/20' : 
                        item.status === 'Running' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/20' : 
                        'bg-slate-500/20 text-slate-400 border border-white/10'
                      }`}>
                        {item.status}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Visualization Suggestion */}
      <div className="bg-slate-50 dark:bg-white/5 backdrop-blur-xl p-8 rounded-[40px] border border-slate-200 dark:border-white/10 border-dashed">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="text-orange-500" size={20} />
          <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Progress Visualization</h4>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          <span className="text-orange-500 font-bold">Pro Tip:</span> You can visualize this data using a <span className="text-slate-900 dark:text-white font-bold">Radar Chart</span> to compare progress across all subjects, or a <span className="text-slate-900 dark:text-white font-bold">Stacked Bar Chart</span> to show the ratio of Pending vs. Finished chapters for each batch. This helps in identifying subjects that need more attention.
        </p>
      </div>

      {/* Add Chapter Modal */}
      <AnimatePresence>
        {isAddingChapter && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 p-8 rounded-[32px] w-full max-w-sm shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-white tracking-tight">Add Chapter</h3>
                <button onClick={() => setIsAddingChapter(false)} className="text-slate-500 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddChapter} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Chapter Name</label>
                  <input
                    required
                    type="text"
                    value={newChapterName}
                    onChange={(e) => setNewChapterName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    placeholder="e.g. Thermodynamics Part 2"
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving !== null}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
                >
                  {saving !== null ? 'Saving...' : 'Add to Syllabus'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Finish Chapter Modal */}
      <AnimatePresence>
        {finishingChapter && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 p-8 rounded-[32px] w-full max-w-sm shadow-2xl"
            >
              <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Complete Chapter</h3>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                Enter the total number of lectures taken for <strong className="text-white">{finishingChapter.chapter_name}</strong>:
              </p>
              <input
                type="number"
                value={lecturesCount}
                onChange={(e) => setLecturesCount(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-white font-bold mb-8 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                min="0"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setFinishingChapter(null)}
                  className="px-6 py-3 rounded-2xl text-sm font-bold text-slate-400 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleUpdate(finishingChapter, { status: 'Finished', total_lectures: parseInt(lecturesCount) || 0 });
                    setFinishingChapter(null);
                  }}
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-sm font-bold transition-colors shadow-lg shadow-orange-500/20"
                >
                  Save & Finish
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Status List Modal */}
      <AnimatePresence>
        {selectedStatus && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 p-6 rounded-[32px] w-full max-w-lg shadow-2xl max-h-[80vh] flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-white tracking-tight">
                  {selectedStatus === 'Finished' ? 'Completed' : selectedStatus} Chapters
                </h3>
                <button 
                  onClick={() => setSelectedStatus(null)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="overflow-y-auto pr-2 space-y-3 flex-1 custom-scrollbar">
                {progress.filter(p => p.status === selectedStatus).length === 0 ? (
                  <p className="text-slate-500 text-center py-8 text-sm font-bold">No chapters found.</p>
                ) : (
                  progress.filter(p => p.status === selectedStatus).map((item, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-bold text-white">{item.chapter_name}</h4>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{item.teacher_name}</p>
                      </div>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        item.status === 'Finished' ? 'bg-green-500/20 text-green-500' : 
                        item.status === 'Running' ? 'bg-yellow-500/20 text-yellow-500' : 
                        'bg-white/10 text-slate-400'
                      }`}>
                        {item.status === 'Finished' ? <CheckCircle2 size={16} /> : 
                         item.status === 'Running' ? <PlayCircle size={16} /> : 
                         <Clock size={16} />}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SyllabusTracker;
