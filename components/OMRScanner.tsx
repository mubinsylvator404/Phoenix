import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Scan, CheckCircle2, XCircle, AlertCircle, RefreshCw, ChevronRight, User, Hash, FileText, Users, Check, Camera, Image as ImageIcon } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { supabase } from '../services/supabaseService';

interface OMRScannerProps {
  exams: any[];
  initialExamId?: string;
}

const OMRScanner: React.FC<OMRScannerProps> = ({ exams, initialExamId }) => {
  const [selectedExamId, setSelectedExamId] = useState(initialExamId || '');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [extractedInfo, setExtractedInfo] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Student Linking State
  const [students, setStudents] = useState<any[]>([]);
  const [batches, setBatches] = useState<string[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase.from('students').select('id, name, batch');
      if (error) throw error;
      if (data) {
        setStudents(data);
        const uniqueBatches = Array.from(new Set(data.map(s => s.batch).filter(Boolean))) as string[];
        setBatches(uniqueBatches);
      }
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
        setPreview(null);
        setImage(null);
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setPreview(dataUrl);
        
        const byteString = atob(dataUrl.split(',')[1]);
        const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });
        const file = new File([blob], "captured_omr.jpg", { type: "image/jpeg" });
        
        setImage(file);
        stopCamera();
        setExtractedInfo(null);
        setResult(null);
        setError(null);
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
      setExtractedInfo(null);
      setResult(null);
      setError(null);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        resolve(base64String.split(',')[1]);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleScan = async () => {
    if (!selectedExamId) return setError("Please select an exam first");
    if (!image) return setError("Please upload an OMR sheet image");

    const selectedExam = exams.find(e => e.id === selectedExamId);
    if (!selectedExam) return setError("Exam details not found");

    setScanning(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const base64Image = await fileToBase64(image);

      const prompt = `You are a high-precision OMR (Optical Mark Recognition) scanner. 
Analyze this OMR sheet image for the exam "${selectedExam.title}". 
Extract exactly ${selectedExam.total_questions} answers.

Return the result STRICTLY as a JSON object with this schema:
{
  "student_name": "string or null",
  "student_roll": "string or null",
  "set_code": "A|B|C|D|null",
  "answers": [
    { "question": 1, "marked": "A|B|C|D|E|null" },
    ...
  ]
}

Guidelines:
- If a bubble is significantly filled, mark it (A, B, C, D, or E).
- If no bubble is filled for a question, use null.
- Ensure the answer array has exactly ${selectedExam.total_questions} items.`;

      const extractionResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { text: prompt },
          { inlineData: { mimeType: image.type, data: base64Image } }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              student_name: { type: Type.STRING },
              student_roll: { type: Type.STRING },
              set_code: { type: Type.STRING },
              answers: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.NUMBER },
                    marked: { type: Type.STRING, nullable: true }
                  },
                  required: ["question"]
                }
              }
            }
          }
        }
      });

      const extractionText = extractionResponse.text;
      if (!extractionText) throw new Error("AI failed to extract data from image");
      
      const info = JSON.parse(extractionText);
      setExtractedInfo(info);
      
      if (info.student_name) {
        const match = students.find(s => s.name?.toLowerCase() === info.student_name.toLowerCase());
        if (match) {
          setSelectedBatch(match.batch || '');
          setSelectedStudentId(match.id);
        }
      }
    } catch (err: any) {
      console.error("Scan error:", err);
      setError(err.message || "An error occurred during scanning. Please try again.");
    } finally {
      setScanning(false);
    }
  };

  const handleFinalize = async () => {
    if (!extractedInfo || !selectedExamId) return;
    setSaving(true);
    setError(null);

    try {
      const verifyResponse = await fetch('/api/omr?action=scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: selectedExamId,
          extractedInfo,
          studentId: selectedStudentId
        })
      });
      
      const data = await verifyResponse.json();
      if (data.status === 'success') {
        setResult(data.result);
      } else {
        throw new Error(data.details || data.error || "Failed to finalize evaluation");
      }
    } catch (err: any) {
      console.error("Save error:", err);
      setError(err.message || "Failed to save result.");
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = selectedBatch 
    ? students.filter(s => s.batch === selectedBatch)
    : students;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Sidebar Controls */}
      <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border dark:border-slate-800 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#e91e63] rounded-2xl text-white">
              <Scan size={20} />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Evaluate Sheet</h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Exam Selection</label>
              <select 
                value={selectedExamId}
                onChange={e => setSelectedExamId(e.target.value)}
                className="w-full p-4 rounded-2xl border dark:border-slate-800 dark:bg-slate-950 font-bold text-sm focus:ring-2 focus:ring-[#e91e63] outline-none transition-all"
              >
                <option value="">Select an exam...</option>
                {Array.isArray(exams) && exams.map(exam => (
                  <option key={exam.id} value={exam.id}>{exam.title}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Source Selection</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { stopCamera(); fileInputRef.current?.click(); }}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-[#e91e63] transition-all"
                    title="Upload from Gallery"
                  >
                    <ImageIcon size={16} />
                  </button>
                  <button 
                    onClick={() => isCameraActive ? stopCamera() : startCamera()}
                    className={`p-2 rounded-lg transition-all ${isCameraActive ? 'bg-red-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-[#e91e63]'}`}
                    title={isCameraActive ? "Stop Camera" : "Open Camera"}
                  >
                    <Camera size={16} />
                  </button>
                </div>
              </div>

              <div 
                className={`w-full aspect-[4/3] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden relative group ${preview || isCameraActive ? 'border-[#e91e63]' : 'border-slate-200 dark:border-slate-800 hover:border-[#e91e63]/50'}`}
              >
                <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageChange} />
                
                {isCameraActive ? (
                  <div className="relative w-full h-full">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                      <button 
                        onClick={capturePhoto}
                        className="w-12 h-12 bg-white rounded-full border-4 border-slate-200 flex items-center justify-center shadow-lg active:scale-90 transition-all"
                      >
                        <div className="w-8 h-8 bg-red-500 rounded-full" />
                      </button>
                    </div>
                  </div>
                ) : preview ? (
                  <div className="relative w-full h-full cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <RefreshCw className="text-white" size={32} />
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4 cursor-pointer w-full h-full flex flex-col items-center justify-center" onClick={() => fileInputRef.current?.click()}>
                    <Upload size={24} className="text-[#e91e63] mx-auto mb-2 opacity-50" />
                    <p className="font-bold text-slate-400 text-xs">Choose Resource</p>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl flex items-center gap-2 text-red-600 text-xs font-bold border border-red-100 dark:border-red-900/20">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <button 
              onClick={handleScan}
              disabled={scanning || !image || !selectedExamId}
              className="w-full bg-[#e91e63] text-white py-5 rounded-[1.5rem] font-black text-xs shadow-2xl shadow-[#e91e63]/20 hover:bg-[#c2185b] transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50 disabled:grayscale"
            >
              {scanning ? <RefreshCw className="animate-spin" size={16} /> : <Scan size={16} />}
              {scanning ? "Evaluating..." : "Start Evaluation"}
            </button>
          </div>
        </div>
      </div>

      {/* Results Display */}
      <div className="lg:col-span-8">
        <AnimatePresence mode="wait">
          {extractedInfo && !result ? (
            <motion.div 
              key="extracted"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border dark:border-slate-800 shadow-xl space-y-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">Verify Identity</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Cross-check profile linking</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 text-orange-600 rounded-2xl flex items-center justify-center animate-pulse">
                  <AlertCircle size={20} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border dark:border-slate-800 flex justify-between items-center group hover:border-[#e91e63] transition-all">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#e91e63] block mb-0.5">Detected Name</label>
                      <div className="font-black text-lg text-slate-900 dark:text-white">{extractedInfo.student_name || 'Not detected'}</div>
                    </div>
                  </div>
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border dark:border-slate-800 flex justify-between items-center group hover:border-[#e91e63] transition-all">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#e91e63] block mb-0.5">Detected Roll</label>
                      <div className="font-black text-lg text-slate-900 dark:text-white">{extractedInfo.student_roll || 'Not detected'}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 bg-slate-50 dark:bg-slate-800/30 p-6 rounded-[2rem] border dark:border-slate-800">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                    <Users size={12} className="text-[#e91e63]" /> Confirm Link
                  </h4>
                  <div className="space-y-4">
                    <select 
                      value={selectedBatch}
                      onChange={e => setSelectedBatch(e.target.value)}
                      className="w-full p-4 rounded-2xl border dark:border-slate-800 dark:bg-slate-950 font-bold text-xs focus:ring-2 focus:ring-[#e91e63] outline-none"
                    >
                      <option value="">Select Batch...</option>
                      {batches.filter(Boolean).map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                    
                    <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                      {filteredStudents.length > 0 ? filteredStudents.map(s => (
                        <button
                          key={s.id}
                          onClick={() => setSelectedStudentId(s.id)}
                          className={`p-3 rounded-xl border text-[10px] font-bold text-left transition-all ${
                            selectedStudentId === s.id 
                            ? 'bg-[#e91e63] border-[#e91e63] text-white shadow-md' 
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-[#e91e63]/50'
                          }`}
                        >
                          {s.name}
                        </button>
                      )) : (
                        <div className="col-span-2 py-4 text-center text-slate-400 text-[10px]">No students found in this batch.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t dark:border-slate-800">
                <button 
                  onClick={() => setExtractedInfo(null)}
                  className="flex-grow py-5 rounded-2xl font-black text-xs uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200"
                >
                  Discard
                </button>
                <button 
                  onClick={handleFinalize}
                  disabled={saving}
                  className="flex-[2] py-5 rounded-2xl font-black text-xs uppercase tracking-widest bg-[#e91e63] text-white shadow-xl flex items-center justify-center gap-3"
                >
                  {saving ? <RefreshCw className="animate-spin" size={16} /> : <Check size={16} />}
                  Save & Evaluate
                </button>
              </div>
            </motion.div>
          ) : result ? (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* Summary Results */}
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border dark:border-slate-800 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8">
                  <div className="w-16 h-16 bg-[#e91e63] rounded-full flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-[#e91e63]/20">
                    {result.total_score}
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{result.student_name}</h3>
                  <div className="flex gap-4 mt-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#e91e63]">Roll: {result.student_roll}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">• Set {result.set_code}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-8 border-t dark:border-slate-800">
                  <div className="bg-green-50 dark:bg-green-900/10 p-5 rounded-[1.5rem] text-center border border-green-100 dark:border-green-900/20">
                    <div className="text-2xl font-black text-green-600">{result.correct_count}</div>
                    <div className="text-[8px] font-black uppercase tracking-widest text-green-700/50">Correct</div>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/10 p-5 rounded-[1.5rem] text-center border border-red-100 dark:border-red-900/20">
                    <div className="text-2xl font-black text-red-600">{result.wrong_count}</div>
                    <div className="text-[8px] font-black uppercase tracking-widest text-red-700/50">Wrong</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-[1.5rem] text-center border dark:border-slate-800">
                    <div className="text-2xl font-black text-slate-400">{result.blank_count}</div>
                    <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">Blank</div>
                  </div>
                </div>
              </div>

              {/* Bubbles Simulation Grid */}
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border dark:border-slate-800 shadow-xl">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Detailed Answer Sheet Analysis</h4>
                  <div className="flex gap-3">
                    <div className="flex items-center gap-1.5 text-[8px] font-black uppercase text-green-600"><div className="w-2 h-2 rounded-full bg-green-500" /> Correct</div>
                    <div className="flex items-center gap-1.5 text-[8px] font-black uppercase text-red-600"><div className="w-2 h-2 rounded-full bg-red-500" /> Wrong</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                  {result.answers?.map((ans: any, i: number) => (
                    <div key={i} className="space-y-2 p-4 bg-slate-50 dark:bg-slate-800/30 rounded-[1.5rem] border dark:border-slate-800">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] font-black text-slate-400">Q{ans.question}</span>
                        {ans.status === 'CORRECT' ? <CheckCircle2 size={12} className="text-green-500" /> : ans.status === 'WRONG' ? <XCircle size={12} className="text-red-500" /> : null}
                      </div>
                      <div className="flex justify-center gap-1">
                        {['A', 'B', 'C', 'D'].map(opt => {
                          const isMarked = ans.marked === opt;
                          const isCorrect = ans.correctOption === opt;
                          let bubbleClass = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-300";
                          
                          if (isMarked && isCorrect) bubbleClass = "bg-green-500 border-green-500 text-white";
                          else if (isMarked && !isCorrect) bubbleClass = "bg-red-500 border-red-500 text-white";
                          else if (!isMarked && isCorrect) bubbleClass = "bg-green-100 border-green-200 text-green-600 dark:bg-green-900/30 dark:border-green-900/50";

                          return (
                            <div 
                              key={opt}
                              className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-black transition-all ${bubbleClass}`}
                            >
                              {opt}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-[600px] bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center p-20 text-center">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 text-slate-200">
                <Scan size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Scanner Idle</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto font-bold uppercase tracking-widest leading-relaxed">Select an exam then upload its sheet to start AI evaluation.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OMRScanner;
