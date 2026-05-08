import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Save, Plus, Trash2, ChevronRight, ChevronLeft, FileText, CheckCircle2 } from 'lucide-react';
import jsPDF from 'jspdf';

interface OMRGeneratorProps {
  onExamCreated: () => void;
  initialExam?: any;
}

const OMRGenerator: React.FC<OMRGeneratorProps> = ({ onExamCreated, initialExam }) => {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState(initialExam?.title || '');
  const [totalQuestions, setTotalQuestions] = useState(initialExam?.total_questions || 50);
  const [optionsPerQuestion, setOptionsPerQuestion] = useState(initialExam?.options_per_question || 4);
  const [marksPerQuestion, setMarksPerQuestion] = useState(initialExam?.marks_per_question || 1);
  const [negativeMarks, setNegativeMarks] = useState(initialExam?.negative_marks || 0);
  const [answerKey, setAnswerKey] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (answerKey.length === 0) {
      setAnswerKey(new Array(totalQuestions).fill(''));
    } else if (answerKey.length !== totalQuestions) {
      const newKey = [...answerKey];
      if (answerKey.length < totalQuestions) {
        for (let i = answerKey.length; i < totalQuestions; i++) newKey.push('');
      } else {
        newKey.length = totalQuestions;
      }
      setAnswerKey(newKey);
    }
  }, [totalQuestions]);

  const handleSaveExam = async () => {
    if (!title) return alert("Please enter exam title");
    if (answerKey.some(k => k === '')) return alert("Please fill all answer keys");

    setLoading(true);
    try {
      const response = await fetch('/api/omr/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          total_questions: totalQuestions,
          options_per_question: optionsPerQuestion,
          marks_per_question: marksPerQuestion,
          negative_marks: negativeMarks,
          answer_key: answerKey
        })
      });
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error("Non-JSON response received:", text);
        // Extract the title from HTML if possible (e.g. <title>404 Not Found</title>)
        const titleMatch = text.match(/<title>(.*?)<\/title>/);
        const pageTitle = titleMatch ? titleMatch[1] : "Unknown HTML Page";
        const snippet = text.substring(0, 200).replace(/<[^>]*>/g, '').trim();
        throw new Error(`Server Error (${response.status} ${response.statusText}). Page Title: ${pageTitle}. Snippet: ${snippet || 'Empty Response'}`);
      }

      const data = await response.json();
      if (data.status === 'success') {
        onExamCreated();
        setStep(3); // Go to PDF generation step
      } else {
        const errorMsg = data.details || data.error || "Failed to save exam";
        console.error("Server Error:", data);
        alert(`Error: ${errorMsg}`);
      }
    } catch (error: any) {
      console.error("Error saving exam:", error);
      alert(`Error: ${error.message || "An unexpected error occurred while saving the exam."}`);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4'
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Anchor Points for Alignment (standard OMR markers)
    doc.setFillColor(0, 0, 0);
    doc.rect(10, 10, 8, 3, "F"); // Top Left
    doc.rect(pageWidth - 18, 10, 8, 3, "F"); // Top Right
    doc.rect(10, pageHeight - 13, 8, 3, "F"); // Bottom Left
    doc.rect(pageWidth - 18, pageHeight - 13, 8, 3, "F"); // Bottom Right
    
    // Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("PHOENIX EDU CARE", pageWidth / 2, 25, { align: "center" });
    
    doc.setFontSize(14);
    doc.text(title.toUpperCase(), pageWidth / 2, 32, { align: "center" });
    
    // Header Line
    doc.setLineWidth(0.5);
    doc.line(15, 36, pageWidth - 15, 36);
    
    // Section 1: Roll Number & Set Code
    const studentInfoY = 45;
    
    // Roll Number Section (Professional Grid)
    doc.setFontSize(9);
    doc.text("ROLL NUMBER", 20, studentInfoY);
    const rollX = 20;
    const rollY = studentInfoY + 4;
    const bubbleSize = 5; // Diameter 5mm
    const bubbleRadius = bubbleSize / 2;
    const spacing = 3; // 3mm gap
    const step = bubbleSize + spacing; // 8mm center-to-center
    
    // Roll Number boxes
    doc.setLineWidth(0.5);
    for (let i = 0; i < 6; i++) {
      doc.rect(rollX + i * step - bubbleRadius, rollY - 1, bubbleSize, bubbleSize);
    }
    
    // Roll Number bubbles 0-9
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 6; col++) {
        const bx = rollX + col * step;
        const by = rollY + 8 + row * step;
        doc.circle(bx, by, bubbleRadius, "S");
        doc.setFontSize(6);
        doc.text(row.toString(), bx, by + 1, { align: "center" });
      }
    }
    
    // Set Code Section
    const setX = rollX + 6 * step + 15;
    doc.setFontSize(9);
    doc.text("SET CODE", setX, studentInfoY);
    doc.rect(setX - bubbleRadius, rollY - 1, bubbleSize, bubbleSize);
    for (let i = 0; i < 4; i++) {
        const bx = setX;
        const by = rollY + 8 + i * step;
        doc.circle(bx, by, bubbleRadius, "S");
        doc.setFontSize(7);
        doc.text(String.fromCharCode(65 + i), bx, by + 1, { align: "center" });
    }
    
    // Name & Subject info
    const infoX = setX + 25;
    doc.setFontSize(9);
    doc.text("STUDENT NAME:", infoX, studentInfoY + 5);
    doc.rect(infoX, studentInfoY + 7, 60, 8);
    
    doc.text("SUBJECT:", infoX, studentInfoY + 22);
    doc.rect(infoX, studentInfoY + 24, 60, 8);
    
    // Answer Grid
    const startY = 145; // Below the roll number section
    const colWidth = 45;
    const rowHeight = step; // Consistent 8mm step
    const questionsPerCol = totalQuestions > 50 ? 25 : totalQuestions > 30 ? 25 : 20;
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    
    for (let q = 0; q < totalQuestions; q++) {
      const col = Math.floor(q / questionsPerCol);
      const row = q % questionsPerCol;
      const x = 20 + col * colWidth;
      const y = startY + row * rowHeight;
      
      // Question Number
      doc.setFontSize(8);
      doc.text(`${(q + 1).toString().padStart(2, '0')}`, x - 2, y + 1, { align: "right" });
      
      // Options
      for (let o = 0; o < optionsPerQuestion; o++) {
        const optionLabel = String.fromCharCode(65 + o);
        const ox = x + 5 + o * step;
        doc.setLineWidth(0.5);
        doc.circle(ox, y, bubbleRadius, "S");
        doc.setFontSize(7);
        doc.text(optionLabel, ox, y + 1, { align: "center" });
      }
    }
    
    // Instructions (Sidebar or Bottom)
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    const instructionY = pageHeight - 25;
    doc.text("INSTRUCTIONS: 1. Use black ballpoint pen.  2. Fill bubbles completely.  3. Do not place any markings elsewhere.", 15, instructionY);
    
    // Official Footer
    doc.setFont("helvetica", "bold");
    doc.text("OFFICIAL OMR SHEET - PHOENIX EDU CARE", pageWidth / 2, pageHeight - 10, { align: "center" });
    
    doc.save(`${title.replace(/\s+/g, '_')}_OMR_Real_Standard.pdf`);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[3rem] border dark:border-slate-800 shadow-xl overflow-hidden">
      <div className="flex border-b dark:border-slate-800">
        {[1, 2, 3].map((s) => (
          <div 
            key={s}
            className={`flex-grow py-6 text-center font-black text-xs uppercase tracking-widest transition-all ${step === s ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}
          >
            Step {s}: {s === 1 ? 'Exam Info' : s === 2 ? 'Answer Key' : 'Generate'}
          </div>
        ))}
      </div>

      <div className="p-10">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Exam Title</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Physics First Paper - Model Test 01"
                    className="w-full p-5 rounded-3xl border dark:border-slate-800 dark:bg-slate-950 font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Total Questions</label>
                  <select 
                    value={totalQuestions}
                    onChange={e => setTotalQuestions(parseInt(e.target.value))}
                    className="w-full p-5 rounded-3xl border dark:border-slate-800 dark:bg-slate-950 font-bold focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                  >
                    <option value={10}>10 Questions</option>
                    <option value={15}>15 Questions</option>
                    <option value={20}>20 Questions</option>
                    <option value={25}>25 Questions</option>
                    <option value={50}>50 Questions</option>
                    <option value={75}>75 Questions</option>
                    <option value={100}>100 Questions</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Options per Question</label>
                  <select 
                    value={optionsPerQuestion}
                    onChange={e => setOptionsPerQuestion(parseInt(e.target.value))}
                    className="w-full p-5 rounded-3xl border dark:border-slate-800 dark:bg-slate-950 font-bold focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                  >
                    <option value={4}>4 Options (A, B, C, D)</option>
                    <option value={5}>5 Options (A, B, C, D, E)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Marks per Question</label>
                  <input 
                    type="number" 
                    value={marksPerQuestion}
                    onChange={e => setMarksPerQuestion(parseFloat(e.target.value))}
                    className="w-full p-5 rounded-3xl border dark:border-slate-800 dark:bg-slate-950 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Negative Marks</label>
                  <input 
                    type="number" 
                    value={negativeMarks}
                    onChange={e => setNegativeMarks(parseFloat(e.target.value))}
                    className="w-full p-5 rounded-3xl border dark:border-slate-800 dark:bg-slate-950 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button 
                  onClick={() => setStep(2)}
                  className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-blue-700 transition-all flex items-center gap-2"
                >
                  Next Step
                  <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="mb-8 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Set Correct Answers</h3>
                <div className="text-xs font-black text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-full">
                  {answerKey.filter(k => k !== '').length} / {totalQuestions} Completed
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-4 max-h-[400px] overflow-y-auto p-2">
                {answerKey.map((ans, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="text-[10px] font-black text-slate-400 text-center">Q{idx + 1}</div>
                    <div className="flex gap-1 justify-center">
                      {['A', 'B', 'C', 'D'].slice(0, optionsPerQuestion).map(opt => (
                        <button
                          key={opt}
                          onClick={() => {
                            const newKey = [...answerKey];
                            newKey[idx] = opt;
                            setAnswerKey(newKey);
                          }}
                          className={`w-8 h-8 rounded-lg font-bold text-xs transition-all ${ans === opt ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-10">
                <button 
                  onClick={() => setStep(1)}
                  className="text-slate-500 font-bold text-sm hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-2"
                >
                  <ChevronLeft size={18} />
                  Back
                </button>
                <button 
                  onClick={handleSaveExam}
                  disabled={loading}
                  className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save & Continue'}
                  <Save size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10"
            >
              <div className="w-24 h-24 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-8 text-green-600">
                <CheckCircle2 size={48} />
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Exam Created Successfully!</h3>
              <p className="text-slate-500 mb-10 max-w-md mx-auto font-medium">
                Your exam and answer key have been saved. You can now download the printable OMR sheet.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={generatePDF}
                  className="bg-blue-600 text-white px-12 py-5 rounded-3xl font-black text-sm shadow-2xl shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
                >
                  <Download size={20} />
                  Download OMR Sheet (PDF)
                </button>
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-12 py-5 rounded-3xl font-black text-sm hover:bg-slate-200 transition-all"
                >
                  Finish
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OMRGenerator;
