import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Scan, History, Plus, Download, ChevronRight, AlertCircle, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import OMRGenerator from '../components/OMRGenerator';
import OMRScanner from '../components/OMRScanner';
import { supabase } from '../services/supabaseService';

const OMRDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'exams' | 'generate' | 'scan' | 'results'>('exams');
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<any>(null);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/omr');
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        setExams([]);
        return;
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        setExams(data);
      } else {
        console.error("Exams data is not an array:", data);
        setExams([]);
      }
    } catch (error) {
      console.error("Error fetching exams:", error);
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteExam = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this exam and all its results? This action is IRREVERSIBLE.")) return;
    
    try {
      const response = await fetch(`/api/omr?id=${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.status === 'success') {
        alert("Exam deleted successfully.");
        fetchExams();
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete exam.");
    }
  };

  const deleteResult = async (id: string) => {
    if (!window.confirm("Delete this student result permanently?")) return;
    
    try {
      const response = await fetch(`/api/omr/results/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.status === 'success') {
        alert("Result deleted successfully.");
        // We'll need a way to refresh OMRResults, but for now we can just alert
        // The user can click refresh button in results tab
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete result.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black text-slate-900 dark:text-white mb-2"
          >
            OMR <span className="text-blue-600">System</span>
          </motion.h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Generate, scan, and evaluate OMR sheets with AI precision.
          </p>
        </header>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white dark:bg-slate-900 p-2 rounded-3xl shadow-sm border dark:border-slate-800 w-fit">
          <button 
            onClick={() => setActiveTab('exams')}
            className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'exams' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <FileText size={18} />
            Exams
          </button>
          <button 
            onClick={() => setActiveTab('generate')}
            className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'generate' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <Plus size={18} />
            Generate Sheet
          </button>
          <button 
            onClick={() => setActiveTab('scan')}
            className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'scan' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <Scan size={18} />
            Scan Sheet
          </button>
          <button 
            onClick={() => setActiveTab('results')}
            className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'results' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <History size={18} />
            Results
          </button>
        </div>

        {/* Content */}
        <div className="min-h-[600px]">
          {activeTab === 'exams' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full flex justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : exams.length > 0 ? (
                exams.map((exam) => (
                  <motion.div 
                    key={exam.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl text-blue-600">
                        <FileText size={24} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                        {exam.total_questions} Questions
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">{exam.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">
                      <span>{exam.options_per_question} Options</span>
                      <span>•</span>
                      <span>{exam.marks_per_question} Marks/Q</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => { setSelectedExam(exam); setActiveTab('generate'); }}
                        className="flex-grow bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white py-3 rounded-2xl font-bold text-xs hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                        <Download size={14} />
                        Sheet
                      </button>
                      <button 
                        onClick={() => { setSelectedExam(exam); setActiveTab('scan'); }}
                        className="flex-grow bg-blue-600 text-white py-3 rounded-2xl font-bold text-xs shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                      >
                        <Scan size={14} />
                        Scan
                      </button>
                      <button 
                        onClick={() => deleteExam(exam.id)}
                        className="p-3 bg-red-50 dark:bg-red-900/10 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                        title="Delete Exam"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 p-20 text-center">
                  <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                    <FileText size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Exams Found</h3>
                  <p className="text-slate-500 mb-8 max-w-md mx-auto">Create your first OMR exam to generate sheets and start scanning results.</p>
                  <button 
                    onClick={() => setActiveTab('generate')}
                    className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:bg-blue-700 transition-all"
                  >
                    Create New Exam
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'generate' && (
            <OMRGenerator onExamCreated={fetchExams} initialExam={selectedExam} />
          )}

          {activeTab === 'scan' && (
            <OMRScanner exams={exams} initialExamId={selectedExam?.id} />
          )}

          {activeTab === 'results' && (
            <OMRResults exams={exams} onDeleteResult={deleteResult} />
          )}
        </div>
      </div>
    </div>
  );
};

const OMRResults: React.FC<{ exams: any[], onDeleteResult?: (id: string) => void }> = ({ exams, onDeleteResult }) => {
  const [results, setResults] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [selectedBatch, setSelectedBatch] = useState<string>('All');
  const [selectedDetail, setSelectedDetail] = useState<any>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // 1. Fetch all OMR results
      const { data: resultsData, error: resultsError } = await supabase
        .from('omr_results')
        .select('*, omr_exams(title)')
        .order('total_score', { ascending: false });
      
      if (resultsError && !resultsError.message?.includes('schema cache')) {
        throw resultsError;
      }

      // 2. Fetch all students for linking
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id, name, batch, own_phone, phone');

      if (studentsError) throw studentsError;

      setResults(resultsData || []);
      setStudents(studentsData || []);
    } catch (error) {
      console.error("Error in OMRResults:", error);
    } finally {
      setLoading(false);
    }
  };

  const batches = ['All', ...new Set(students.map(s => s.batch).filter(Boolean))];
  
  // Filter logic
  let filteredResults = results;
  if (selectedExamId) {
    filteredResults = filteredResults.filter(r => r.exam_id === selectedExamId);
  }

  // Create a display list
  const displayList = () => {
    if (!selectedExamId || selectedBatch === 'All') {
      return filteredResults.map(r => ({
        ...r,
        studentName: r.student_name,
        studentRoll: r.student_roll,
        isLinked: !!r.student_id,
        status: 'Scanned',
        resultId: r.id
      }));
    }

    const batchStudents = students.filter(s => s.batch === selectedBatch);
    const examResults = results.filter(r => r.exam_id === selectedExamId);

    return batchStudents.map(student => {
      const result = examResults.find(r => 
        r.student_id === student.id || 
        (r.student_name && student.name && r.student_name.toLowerCase().trim() === student.name.toLowerCase().trim())
      );

      return {
        id: student.id,
        studentName: student.name,
        studentRoll: student.id.substring(0, 8),
        batch: student.batch,
        total_score: result?.total_score ?? null,
        correct_count: result?.correct_count ?? 0,
        wrong_count: result?.wrong_count ?? 0,
        blank_count: result?.blank_count ?? 0,
        created_at: result?.created_at ?? null,
        status: result ? 'Scanned' : 'Not Scanned',
        resultId: result?.id,
        answers: result?.answers
      };
    }).sort((a, b) => {
      if (a.total_score === null && b.total_score === null) return a.studentName.localeCompare(b.studentName);
      if (a.total_score === null) return 1;
      if (b.total_score === null) return -1;
      return b.total_score - a.total_score;
    });
  };

  const currentDisplay = displayList();

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e91e63]"></div></div>;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border dark:border-slate-800 shadow-xl flex flex-col gap-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-2 flex-grow min-w-[250px]">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#e91e63] ml-2">Exam Selection</label>
            <select 
              value={selectedExamId}
              onChange={e => setSelectedExamId(e.target.value)}
              className="w-full p-4 rounded-2xl border dark:border-slate-800 dark:bg-slate-950 font-bold text-sm outline-none focus:ring-2 focus:ring-[#e91e63] transition-all"
            >
              <option value="">Choose Exam to Analyze...</option>
              {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.title}</option>)}
            </select>
          </div>
          <button 
            onClick={fetchInitialData}
            className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-2xl hover:bg-[#e91e63] hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <History size={18} />
            Refresh
          </button>
          
          <button 
            className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-2xl hover:bg-[#e91e63] hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <Download size={20} />
          </button>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 block">Quick Filter by Batch</label>
          <div className="flex flex-wrap gap-2">
            {batches.map(b => (
              <button
                key={b}
                onClick={() => setSelectedBatch(b)}
                className={`px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all border ${
                  selectedBatch === b 
                  ? 'bg-[#e91e63] border-[#e91e63] text-white shadow-lg shadow-[#e91e63]/20' 
                  : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-[#e91e63]/50'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800">
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Position</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Student Info</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Score</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Evaluated</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800">
              {currentDisplay.length > 0 ? currentDisplay.map((item, idx) => {
                const isScanned = item.status === 'Scanned';
                
                return (
                  <tr 
                    key={item.resultId || item.id || idx} 
                    onClick={() => isScanned && setSelectedDetail(item)}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${!isScanned ? 'opacity-50' : 'cursor-pointer'}`}
                  >
                    <td className="p-6">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${idx < 3 && isScanned ? 'bg-[#e91e63] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                        {idx + 1}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="font-bold text-slate-900 dark:text-white group-hover:text-[#e91e63] transition-colors">{item.studentName || 'Unknown'}</div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Roll: {item.studentRoll || 'N/A'}</div>
                    </td>
                    <td className="p-6">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${isScanned ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                        {isScanned ? 'Evaluated' : 'Pending'}
                      </span>
                    </td>
                    <td className="p-6 text-center">
                      {isScanned ? (
                        <div>
                          <div className="text-2xl font-black text-[#e91e63]">{item.total_score}</div>
                          <div className="flex justify-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-green-600">{item.correct_count}c</span>
                            <span className="text-[10px] font-bold text-red-600">{item.wrong_count}w</span>
                          </div>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="p-6 text-xs text-slate-500 font-medium">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-6">
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); isScanned && setSelectedDetail(item); }}
                          className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-[#e91e63] hover:text-white text-slate-400 rounded-xl transition-all"
                        >
                          <ChevronRight size={18} />
                        </button>
                        {isScanned && item.resultId && (
                          <button 
                            onClick={async (e) => { 
                              e.stopPropagation(); 
                              if (onDeleteResult) {
                                await onDeleteResult(item.resultId);
                                fetchInitialData(); // Refresh after delete
                              }
                            }}
                            className="w-10 h-10 flex items-center justify-center bg-red-50 dark:bg-red-900/10 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all"
                            title="Delete Result"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="p-20 text-center text-slate-400 font-medium">
                    No data to display. Select an exam and batch to view student results.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Modal */}
      <AnimatePresence>
        {selectedDetail && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDetail(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-[3rem] shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">{selectedDetail.studentName}</h3>
                    <span className="text-[10px] font-black uppercase bg-[#e91e63] text-white px-3 py-1 rounded-full">Scored {selectedDetail.total_score}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Roll: {selectedDetail.studentRoll} • Batch: {selectedDetail.batch || 'N/A'}</p>
                </div>
                <button 
                  onClick={() => setSelectedDetail(null)}
                  className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-red-500 transition-all font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-8 space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="p-6 bg-green-50 dark:bg-green-900/10 rounded-[2rem] border border-green-100 dark:border-green-900/30 text-center">
                    <div className="text-3xl font-black text-green-600">{selectedDetail.correct_count}</div>
                    <div className="text-[10px] font-black uppercase text-green-700/60">Correct</div>
                  </div>
                  <div className="p-6 bg-red-50 dark:bg-red-900/10 rounded-[2rem] border border-red-100 dark:border-red-900/30 text-center">
                    <div className="text-3xl font-black text-red-600">{selectedDetail.wrong_count}</div>
                    <div className="text-[10px] font-black uppercase text-red-700/60">Wrong</div>
                  </div>
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-700 text-center">
                    <div className="text-3xl font-black text-slate-400">{selectedDetail.blank_count}</div>
                    <div className="text-[10px] font-black uppercase text-slate-400">Blank</div>
                  </div>
                  <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-[2rem] border border-blue-100 dark:border-blue-900/30 text-center">
                    <div className="text-3xl font-black text-blue-600">{((selectedDetail.correct_count / (selectedDetail.correct_count + selectedDetail.wrong_count + selectedDetail.blank_count)) * 100).toFixed(0)}%</div>
                    <div className="text-[10px] font-black uppercase text-blue-700/60">Accuracy</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black uppercase tracking-widest text-[#e91e63]">Answer Analysis</h4>
                    <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500"></span> Correct</div>
                      <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500"></span> Wrong</div>
                      <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700"></span> Blank</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                    {selectedDetail.answers?.map((ans: any, i: number) => (
                      <div 
                        key={i} 
                        className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all group hover:scale-110 ${
                          ans.status === 'CORRECT' ? 'bg-green-50 border-green-100 dark:bg-green-900/5 dark:border-green-900/20' : 
                          ans.status === 'WRONG' ? 'bg-red-50 border-red-100 dark:bg-red-900/5 dark:border-red-900/20' : 
                          'bg-slate-50 border-slate-100 dark:bg-slate-800/50 dark:border-slate-800'
                        }`}
                      >
                        <span className="text-[8px] font-black text-slate-400">Q{ans.question}</span>
                        <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-black text-xs shadow-sm bg-white dark:bg-slate-900">
                          <span className={ans.status === 'CORRECT' ? 'text-green-600' : ans.status === 'WRONG' ? 'text-red-600' : 'text-slate-400'}>
                            {ans.marked || '—'}
                          </span>
                        </div>
                        {ans.status === 'WRONG' && (
                          <span className="text-[8px] font-bold text-slate-400">{ans.correctOption}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OMRDashboard;
