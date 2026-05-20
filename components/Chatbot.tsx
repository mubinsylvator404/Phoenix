
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles, GraduationCap, Image as ImageIcon, Paperclip, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'motion/react';
import { ChatbotKnowledge, Teacher, Subject } from '../types';

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  knowledge: ChatbotKnowledge[];
  teachers: Teacher[];
  subjects: Subject[];
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  image?: string;
}

const suggestedQuestions = [
  "Phoenix Science Wisdom 5.0 কী?",
  "Registration link দাও",
  "Event কোথায় হবে?",
  "Exam syllabus কী?",
  "Mark distribution বলো",
  "Group Alpha syllabus",
  "Group Delta syllabus",
  "Engineering admission session কে নিবে?",
  "AI in Education speaker কে?",
  "Medical admission guideline থাকবে?",
  "Event timeline দেখাও",
  "Facebook event link দাও",
  "Phoenix Edu Care এ কী কী course আছে?",
  "Admission process কী?",
  "Admission fee কত?",
  "Monthly fee কত?",
  "HSC Science batch আছে?",
  "SSC batch আছে?",
  "Class কোথায় হয়?",
  "Phoenix Edu Care কোথায় অবস্থিত?",
  "Contact number দাও",
  "Best Physics teacher কে?",
  "Math teacher কারা?",
  "ICT teacher কে?",
  "Biology teacher কে?",
  "English classes আছে?",
  "Model Test হয়?",
  "Online class support আছে?",
  "Class routine কিভাবে পাবো?",
  "Phoenix Edu Care কবে প্রতিষ্ঠিত?",
  "BUET/CUET teacher আছে?",
  "Medical admission guideline কে দিবে?",
  "Engineering admission session কে নিবে?",
  "AI in Education session কে নিবে?",
  "Olympiad এ কারা participate করতে পারবে?"
];

const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onClose, knowledge, teachers, subjects }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I am the Phoenix Assistant. How can I help you today? You can ask me about Phoenix Edu Care, Science subjects, Math, ICT, English, or even upload a photo for analysis!',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
      image: selectedImage || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    const currentImage = selectedImage;
    setInput('');
    setSelectedImage(null);
    setIsTyping(true);

    try {
      const response = await getBotResponse(currentInput, currentImage);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I encountered an error. Please try again later.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickSend = async (q: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: q,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await getBotResponse(q, null);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I encountered an error. Please try again later.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const getBotResponse = async (query: string, imageBase64: string | null): Promise<string> => {
    const lowerQuery = query.toLowerCase();

    // 1. Check Admin-provided Knowledge Base (only if no image)
    if (!imageBase64) {
      const matchedKnowledge = knowledge.find(k => 
        lowerQuery.includes(k.question.toLowerCase()) || 
        k.question.toLowerCase().includes(lowerQuery)
      );

      if (matchedKnowledge) {
        return matchedKnowledge.answer;
      }
    }

    // 2. Check for Subject keywords for teacher referral
    const scienceKeywords = ['physics', 'chemistry', 'biology', 'science', 'পদার্থ', 'রসায়ন', 'জীববিজ্ঞান', 'বিজ্ঞান'];
    const mathKeywords = ['math', 'higher math', 'mathematics', 'গণিত', 'উচ্চতর গণিত'];
    const ictKeywords = ['ict', 'information technology', 'আইসিটি', 'তথ্য ও যোগাযোগ প্রযুক্তি'];
    const englishKeywords = ['english', 'grammar', 'literature', 'ইংরেজি'];

    let referral = '';
    const isScience = scienceKeywords.some(kw => lowerQuery.includes(kw));
    const isMath = mathKeywords.some(kw => lowerQuery.includes(kw));
    const isICT = ictKeywords.some(kw => lowerQuery.includes(kw));
    const isEnglish = englishKeywords.some(kw => lowerQuery.includes(kw));

    if (isScience || isMath || isICT || isEnglish) {
      let subjectName = 'Science';
      if (isMath) subjectName = 'Math';
      if (isICT) subjectName = 'ICT';
      if (isEnglish) subjectName = 'English';
      
      const relevantTeachers = teachers.filter(t => 
        t.subject.toLowerCase().includes(subjectName.toLowerCase()) ||
        subjectName.toLowerCase().includes(t.subject.toLowerCase())
      );

      if (relevantTeachers.length > 0) {
        referral = `\n\nFor more specialized help with ${subjectName}, you can talk to our expert teacher(s): ${relevantTeachers.map(t => `${t.name} (${t.qualification}, ${t.education})`).join(', ')}.`;
      }
    }

    // 3. Use AI for general questions via Server-side Proxy
    try {
      const teacherDetails = teachers.map(t => `- ${t.name}: Subject: ${t.subject}, Qualification: ${t.qualification}, Experience: ${t.experience}, Education: ${t.education}`).join('\n');

      const systemPrompt = `You are "Phoenix AI", the official assistant for "Phoenix Edu Care", an educational institution for HSC Science students in Kulaura, Bangladesh. 
      
      YOUR CAPABILITIES:
      1. You are a highly intelligent AI. You can answer ANY question, including science, math, ICT, English, history, coding, etc.
      2. You can analyze images if provided (via Gemini).
      3. You have specific knowledge about "Phoenix Edu Care".
      
      STRICT GUIDELINES:
      - LANGUAGE: Always respond in the SAME LANGUAGE the user uses. If they ask in Bengali, reply in Bengali. If English, reply in English.
      - FORMATTING: Provide well-structured, clean, and organized answers (Gemini/ChatGPT style). Use bullet points, bold text for emphasis, or numbered lists for clarity.
      - CONCISENESS: Be specific and direct. Avoid unnecessary fluff.
      - ESTABLISHMENT YEAR: Phoenix Edu Care was established in 2021. NEVER say 2015.
      - GENDER CONTEXT: Kafi Al Fateha and Shafi Al Muntaha are FEMALE teachers (use "she/her").
      - TEACHER INFO: Abdur Rahman Ruman is a Mathematics teacher (B.Sc in EEE from CUET, Running, 4 years experience).
      - DO NOT share internal/private student data.
      
      TEACHER INFORMATION:
      ${teacherDetails}
      
      INSTITUTION CONTEXT:
      - Name: Phoenix Edu Care.
      - Co-founder: Sazzadul Islam Saju.
      - Location: Main Road (Near West Side of Kulaura Rail Station), Kulaura, Moulvibazar, Bangladesh.
      - Focus: HSC Science students (Physics, Chemistry, Biology, Math, ICT, English).
      - Established: 2021.
      - Features: Expert faculty from top universities (BUET, CUET, SUST, DU, SAU, JUST, DIU), modern digital classrooms, performance tracking, and personalized care.
      - Contact Number: 01779905067, 01787543379 (Students can also visit the office for admission details).
      - Official Website: phoenixeducare.site
      
      PHOENIX SCIENCE WISDOM 5.0 OLYMPIAD:
      - Name: Phoenix Science Wisdom Season 5.
      - Official Registration Link: https://docs.google.com/forms/d/e/1FAIpQLSfBtW2sCWocTl3tNA3VYzuq5PyYVWJRf-4ITJGhg3kVpWbeAw/viewform
      - Official Facebook Event Link: https://www.facebook.com/events/1326004366054114/?rdid=WgveegdAKcjdnkHF&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F18todqkTfV%2F
      - Participation Process: Users can register via the Google Form link above.
      - Registration/Event Queries: When users ask "how to register", "registration link", "event link", "Facebook event", "participation process", or "where to join", ALWAYS provide the registration form link and Facebook event link naturally.
      - Type: Science Based Olympiad.
      - Groups: 
        * Group Alpha: Class 9-10
        * Group Gamma: SSC 2026
        * Group Delta: HSC 2027
        * Group Based Competition: Class 9-10 & SSC 2026
      - Subjects: Physics, Chemistry, Biology.
      - Mark Distribution: Each subject has MCQ (10 marks) and Written (10 marks). Total: 60 Marks, 60 Minutes.
      - Syllabus:
        * Alpha: Physics (Ch 1,2,3,4), Chemistry (Ch 1,2,3,4), Biology (Ch 1,2,3,4).
        * Gamma: Physics (Ch 1,2,3,4), Chemistry (Ch 3,4,5,6,7), Biology (Ch 1,2,3,4).
        * Delta: Physics (Ch 1,4,6,8), Chemistry (Ch 1,3,4), Biology (Ch 1,2,4,8).
        * Group Based: Context Based Scientific Questions, Mathematics (Ch 9,10).
      - Venue: Zela Parishad Auditorium, Kulaura.
      - Date: 4 June 2026 (Thursday).
      - Contact: 01779-905067, 01787-543379.
      - Speakers & Experts:
        * University Admission: Hafijur Rahman Najim (Dept. of Chemistry, JUST).
        * Medical Admission: Musa Ahmed Emon (MBBS 4th Year, Manikganj Medical College).
        * Engineering Admission: Abdur Rahman Ruman (EEE, CUET) & Nayeem Sabur Saadi (EEE, BUET).
        * AI in Education: Abdullah Al Mubin (Software Engineering, DIU).
        * College Admission: K.M Ahab Zaman Aqib (SAU).
      - Timeline:
        * Reporting: 9:00 AM – 10:00 AM
        * Exam: 10:30 AM – 11:30 AM
        * Group Exam: 11:40 AM – 12:10 PM
        * Break: 12:10 PM – 12:30 PM
        * Guideline & QNA: 12:30 PM – 2:30 PM
        * Result Publish & Prize Giving: 2:30 PM – 4:00 PM
      - GROUP EXAM PARTICIPATION RULES:
        * Participation: Students can participate in groups of 2–3 members.
        * Institution Rule: All members must be from the SAME SCHOOL/COLLEGE.
        * Class/Group Rule: Students do NOT need to be from the same class or group (mix of Class 9, 10, SSC 2026 is allowed).
        * Multiple Groups: Multiple groups from the same school can participate.
        * Official Ranking: If multiple groups from the same school participate, ONLY the highest-scoring group from that institution will be officially counted for leaderboard ranking and prizes.`;

      const aiResponse = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          imageBase64,
          systemPrompt
        })
      });

      if (!aiResponse.ok) {
        const contentType = aiResponse.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await aiResponse.json();
          throw new Error(errorData.error || `Server error: ${aiResponse.status}`);
        } else {
          const text = await aiResponse.text();
          console.error("Non-JSON error response:", text.substring(0, 500));
          throw new Error(`Server returned non-JSON response (${aiResponse.status}). The service might be temporarily unavailable.`);
        }
      }

      const contentType = aiResponse.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await aiResponse.json();
        return data.text + referral;
      } else {
        const text = await aiResponse.text();
        console.error("Non-JSON success response:", text.substring(0, 500));
        throw new Error("Server returned an invalid response format. Please try again.");
      }

    } catch (error) {
      console.error("Phoenix AI error details:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes("429") || errorMessage.includes("Quota") || errorMessage.includes("quota")) {
        return "I am currently receiving too many requests. The daily free limit (API Quota) for this key has been reached. Please try again tomorrow or use a different API key.\n\n" + referral;
      }
      
      return "Error: " + errorMessage + "\n\n" + referral;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 z-50 w-80 md:w-96 h-[500px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-orange-500 p-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
            <Bot size={24} />
          </div>
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider">Phoenix AI v1.2</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold opacity-80">Online Assistant</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm break-words overflow-hidden ${
              msg.sender === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm border border-slate-100 dark:border-slate-700 rounded-tl-none'
            }`}>
              <div className="flex items-center gap-2 mb-1 opacity-50 text-xs font-bold uppercase tracking-tighter">
                {msg.sender === 'user' ? <User size={10} /> : <Sparkles size={10} />}
                {msg.sender === 'user' ? 'You' : 'Phoenix AI'}
              </div>
              {msg.image && (
                <img src={msg.image} alt="Uploaded" className="w-full h-auto rounded-lg mb-2 border border-white/20" />
              )}
              <div className="markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.text}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t dark:border-slate-800">
        {/* Suggested Questions Chips */}
        {!selectedImage && messages.length < 10 && (
          <div className="mb-4 flex flex-nowrap overflow-x-auto gap-2 pb-2 no-scrollbar scrollbar-none -mx-1">
            {suggestedQuestions.map((q, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleQuickSend(q)}
                className="flex-shrink-0 px-4 py-1.5 bg-blue-500/5 hover:bg-blue-500 text-blue-600 dark:text-blue-400 hover:text-white border border-blue-500/20 rounded-full text-xs font-bold transition-all whitespace-nowrap active:scale-95"
              >
                {q}
              </motion.button>
            ))}
          </div>
        )}

        {selectedImage && (
          <div className="mb-3 relative inline-block">
            <img src={selectedImage} alt="Preview" className="w-16 h-16 object-cover rounded-xl border-2 border-blue-500 shadow-lg" />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
        <div className="relative flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-blue-600 rounded-xl transition-all active:scale-90"
            title="Upload image"
          >
            <ImageIcon size={20} />
          </button>
          <div className="relative flex-grow flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything..."
              className="w-full pl-4 pr-12 py-3 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none dark:text-white"
            />
            <button 
              onClick={handleSend}
              disabled={(!input.trim() && !selectedImage) || isTyping}
              className="absolute right-2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:scale-100 active:scale-90"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-center gap-2 opacity-30">
          <GraduationCap size={12} />
          <span className="text-xs font-bold uppercase tracking-widest">Powered by Phoenix AI</span>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
