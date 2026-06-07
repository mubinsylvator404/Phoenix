
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Target, 
  Zap, 
  Calendar, 
  Users, 
  Video, 
  FileText, 
  Download, 
  ExternalLink, 
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronRight, 
  Award,
  Play,
  Github as Youtube,
  FileDown,
  Clock,
  ArrowRight,
  GraduationCap,
  Microscope,
  Stethoscope,
  PenTool,
  MapPin,
  BookOpen,
  X
} from 'lucide-react';
import { UserRole, OlympiadEvent, OlympiadSpeaker, OlympiadResource, OlympiadVideo } from '../types';

interface OlympiadProps {
  role: UserRole;
  currentUser: any;
  logoImage: string;
  navigate: (p: string) => void;
}

const RESOURCE_TYPES = [
  'Question Paper', 'Solution', 'Result', 'Merit List', 'Event Details'
];

export interface CertificateConfig {
  orgName: string;
  tagline: string;
  certTitle: string;
  subTitle: string;
  sig1Name: string;
  sig1Title: string;
  sig1Org: string;
  sig2Name: string;
  sig2Title: string;
  sig2Org: string;
  sealTitle: string;
  sealSub1: string;
  sealSub2: string;
  themeBackground: string;
  themeOverlay: string;
  themeAccent: string;
  logoImage?: string;
  sig1Image?: string;
  sig2Image?: string;
  sealImage?: string;
  customDescLine1?: string;
  customDescLine2?: string;
  customDescLine3?: string;
  customDescLine4?: string;
  showSeal?: boolean;
}

export const DEFAULT_CERT_CONFIG: CertificateConfig = {
  orgName: 'PHOENIX SUPREME ACADEMY',
  tagline: 'INSPIRING FUTURE SCHOLARS & CHAMPIONS',
  certTitle: 'Certificate of Excellence',
  subTitle: 'This is proudly presented to',
  sig1Name: 'Abdullah Al Mubin',
  sig1Title: 'Founder & CEO',
  sig1Org: 'Phoenix Edu Care',
  sig2Name: 'Academic Director',
  sig2Title: 'Olympiad Co-ordinator',
  sig2Org: 'Evaluation Board',
  sealTitle: 'PHOENIX',
  sealSub1: 'OFFICIAL',
  sealSub2: 'SEAL',
  themeBackground: '#FAF8F4',
  themeOverlay: '#2C3E50',
  themeAccent: '#D4AF37',
  customDescLine1: '',
  customDescLine2: '',
  customDescLine3: '',
  customDescLine4: '',
  showSeal: true
};

interface CertificateCanvasProps {
  participant: any;
  eventTitle: string;
  config?: CertificateConfig;
}

const CertificateCanvas: React.FC<CertificateCanvasProps> = ({ participant, eventTitle, config }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const c = config || DEFAULT_CERT_CONFIG;

  useEffect(() => {
    let active = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Build the dynamic image specifications to load asynchronously
    const imagesToLoad = [
      { key: 'logo', src: c.logoImage },
      { key: 'sig1', src: c.sig1Image },
      { key: 'sig2', src: c.sig2Image },
      { key: 'seal', src: c.sealImage }
    ];

    const loaded: Record<string, HTMLImageElement> = {};
    let pending = imagesToLoad.filter(img => !!img.src).length;

    const render = (imgs: Record<string, HTMLImageElement>) => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Backing style
      ctx.fillStyle = c.themeBackground || '#FAF8F4';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Base double border (gold/accent + deep overlay border)
      ctx.strokeStyle = c.themeAccent || '#D4AF37';
      ctx.lineWidth = 14;
      ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

      ctx.strokeStyle = c.themeOverlay || '#2C3E50';
      ctx.lineWidth = 2;
      ctx.strokeRect(36, 36, canvas.width - 72, canvas.height - 72);

      // Decorative corners
      const cornerPts = [
        { x: 36, y: 36 },
        { x: canvas.width - 36, y: 36 },
        { x: 36, y: canvas.height - 36 },
        { x: canvas.width - 36, y: canvas.height - 36 }
      ];
      cornerPts.forEach(pt => {
        ctx.fillStyle = c.themeAccent || '#D4AF37';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 8, 0, Math.PI * 2);
        ctx.fill();
      });

      // Outer thin gold border
      ctx.strokeStyle = c.themeAccent || '#D4AF37';
      ctx.lineWidth = 1;
      ctx.strokeRect(44, 44, canvas.width - 88, canvas.height - 88);

      // Draw Custom Header Logo or default seal
      let layoutYShift = 0;
      if (imgs.logo) {
        ctx.drawImage(imgs.logo, canvas.width / 2 - 35, 48, 70, 70);
        layoutYShift = 50; // Shift lower text components down
      }

      // Title & tagline
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 36px "Cinzel", "Times New Roman", "Georgia", serif';
      ctx.fillText(c.orgName || 'PHOENIX SUPREME ACADEMY', canvas.width / 2, 95 + layoutYShift);

      ctx.fillStyle = c.themeAccent || '#D4AF37';
      ctx.font = '900 14px "JetBrains Mono", "Fira Code", monospace';
      ctx.fillText(c.tagline || 'INSPIRING FUTURE SCHOLARS & CHAMPIONS', canvas.width / 2, 120 + layoutYShift);

      // Core title with fallback or participation default
      const rawStatus = participant.status || 'Contestant';
      let displayStatus = rawStatus;
      let groupDetails = '';
      const bracketMatch = rawStatus.match(/\(([^)]+)\)/);
      if (bracketMatch) {
         const fullBracket = bracketMatch[1]; // e.g. "Class 10, Group Science"
         // Try to extract only "Group <name>" or filter out anything that has "Class"
         const groupMatch = fullBracket.match(/(Group\s+[^,()]+)/i);
         if (groupMatch) {
           groupDetails = groupMatch[1].trim(); // "Group Science" or "Group Alpha"
         } else {
           // Fallback: split by comma, remove parts containing "Class"
           const parts = fullBracket.split(',').map(p => p.trim());
           const withoutClass = parts.filter(p => !/class/i.test(p));
           groupDetails = withoutClass.join(', ');
         }
         displayStatus = rawStatus.replace(/\([^)]+\)/, '').trim(); // "Contestant"
      }

      const isWinner = /winner|champion|merit|place|rank|gold|silver|bronze|1st|2nd|3rd/i.test(rawStatus) || !!participant.rank;
      const resolvedTitle = c.certTitle && c.certTitle !== 'Certificate of Excellence'
        ? c.certTitle
        : (isWinner ? 'Certificate of Excellence' : 'Certificate of Participation');

      ctx.fillStyle = '#1A252C';
      ctx.font = 'italic italic 58px "Georgia", "Times New Roman", serif';
      ctx.fillText(resolvedTitle, canvas.width / 2, 185 + layoutYShift);

      // Presented statement
      ctx.fillStyle = '#6B7280';
      ctx.font = 'italic 21px "Georgia", "Inter", sans-serif';
      ctx.fillText(c.subTitle || 'This is proudly presented to', canvas.width / 2, 238 + layoutYShift);

      // Participant name
      ctx.fillStyle = '#1F2937';
      ctx.font = 'bold 54px "Georgia", "Times New Roman", serif';
      ctx.fillText(participant.name || '', canvas.width / 2, 302 + layoutYShift);

      // Elegant separator line
      ctx.strokeStyle = c.themeAccent || '#D4AF37';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - 250, 324 + layoutYShift);
      ctx.lineTo(canvas.width / 2 + 250, 324 + layoutYShift);
      ctx.stroke();

      // Combined Beautiful descriptions matching status + group + class
      ctx.fillStyle = '#374151';
      ctx.font = 'normal 19px "Inter", "Georgia", sans-serif';

      const institutionLabel = participant.institution ? `${participant.institution}` : 'their respected institution';
      let descLine1 = '';
      let descLine2 = '';
      let descLine3 = '';
      let descLine4 = `organized by - Team Phoenix.`;

      if (isWinner) {
        descLine1 = `for attaining magnificent laurels as a designated "${participant.rank || displayStatus}"`;
        descLine2 = `representing ${institutionLabel} in the category of ${groupDetails || 'General Scholars Group'}`;
        descLine3 = `during the scientific challenge "${eventTitle}"`;
      } else {
        descLine1 = `for active commitment, high-spirited performance and successful participation as a Contestant`;
        descLine2 = `representing ${institutionLabel} in the category of ${groupDetails || 'Academic Scholars Group'}`;
        descLine3 = `during the scientific challenge "${eventTitle}"`;
      }

      const finalLine1 = (c.customDescLine1 !== undefined && c.customDescLine1 !== '') ? c.customDescLine1 : descLine1;
      const finalLine2 = (c.customDescLine2 !== undefined && c.customDescLine2 !== '') ? c.customDescLine2 : descLine2;
      const finalLine3 = (c.customDescLine3 !== undefined && c.customDescLine3 !== '') ? c.customDescLine3 : descLine3;
      const finalLine4 = (c.customDescLine4 !== undefined && c.customDescLine4 !== '') ? c.customDescLine4 : descLine4;

      ctx.fillText(finalLine1, canvas.width / 2, 374 + layoutYShift);
      ctx.fillText(finalLine2, canvas.width / 2, 408 + layoutYShift);
      ctx.fillText(finalLine3, canvas.width / 2, 442 + layoutYShift);
      ctx.fillText(finalLine4, canvas.width / 2, 476 + layoutYShift);

      // Official Star Stamp Seal
      if (c.showSeal !== false) {
        ctx.save();
        const sealCenterY = 552 + layoutYShift * 0.6;
        ctx.translate(canvas.width / 2, sealCenterY);
        if (imgs.seal) {
          // Draw the uploaded seal image centered
          ctx.drawImage(imgs.seal, -60, -60, 120, 120);
        } else {
          ctx.fillStyle = c.themeAccent || '#D4AF37';
          ctx.strokeStyle = c.themeAccent || '#D4AF37';
          ctx.lineWidth = 3;
          ctx.beginPath();
          // Burst pattern wheel
          for (let i = 0; i < 24; i++) {
            ctx.rotate(Math.PI / 12);
            ctx.rect(-28, -28, 56, 56);
          }
          ctx.globalAlpha = 0.2;
          ctx.fillStyle = c.themeAccent || '#D4AF37';
          ctx.fill();
          ctx.globalAlpha = 1.0;
          ctx.stroke();

          ctx.fillStyle = '#1A252C';
          ctx.font = 'bold 12px "Inter", sans-serif';
          ctx.fillText(c.sealTitle || 'PHOENIX', 0, 0);
          ctx.font = 'bold 9px "JetBrains Mono", monospace';
          ctx.fillText(c.sealSub1 || 'OFFICIAL', 0, 13);
          ctx.fillText(c.sealSub2 || 'SEAL', 0, 23);
        }
        ctx.restore();
      }

      // Left signature block (sig 1)
      const sigLineY = 665;
      ctx.textAlign = 'left';
      ctx.strokeStyle = '#D1D5DB';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(120, sigLineY - 20);
      ctx.lineTo(320, sigLineY - 20);
      ctx.stroke();

      if (imgs.sig1) {
        ctx.drawImage(imgs.sig1, 145, sigLineY - 95, 150, 75);
      }

      ctx.fillStyle = '#1F2937';
      ctx.font = 'italic 22px "Georgia", serif';
      ctx.fillText(c.sig1Name || 'Abdullah Al Mubin', 120, sigLineY);
      ctx.fillStyle = '#6B7280';
      ctx.font = '500 13px "Inter", sans-serif';
      ctx.fillText(c.sig1Title || 'Founder & CEO', 120, sigLineY + 20);
      ctx.fillText(c.sig1Org || 'Phoenix Edu Care', 120, sigLineY + 36);

      // Right signature block (sig 2)
      ctx.textAlign = 'right';
      ctx.beginPath();
      ctx.moveTo(canvas.width - 320, sigLineY - 20);
      ctx.lineTo(canvas.width - 120, sigLineY - 20);
      ctx.stroke();

      if (imgs.sig2) {
        ctx.drawImage(imgs.sig2, canvas.width - 295, sigLineY - 95, 150, 75);
      }

      ctx.fillStyle = '#1F2937';
      ctx.font = 'italic 22px "Georgia", serif';
      ctx.fillText(c.sig2Name || 'Academic Director', canvas.width - 120, sigLineY);
      ctx.fillStyle = '#6B7280';
      ctx.font = '500 13px "Inter", sans-serif';
      ctx.fillText(c.sig2Title || 'Olympiad Co-ordinator', canvas.width - 120, sigLineY + 20);
      ctx.fillText(c.sig2Org || 'Evaluation Board', canvas.width - 120, sigLineY + 36);

      // Verification Metadata Stamp
      ctx.textAlign = 'center';
      ctx.fillStyle = '#9CA3AF';
      ctx.font = 'normal 13px "JetBrains Mono", monospace';
      const certDate = participant.created_at ? new Date(participant.created_at).toLocaleDateString() : new Date().toLocaleDateString();
      ctx.fillText(`Issued Date: ${certDate}`, canvas.width / 2, 729);

      const verificationID = participant.certificate_id || `PX-${Math.floor(100000 + Math.random() * 900000)}`;
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 15px "JetBrains Mono", "Fira Code", monospace';
      ctx.fillText(`Certificate ID: ${verificationID}`, canvas.width / 2, 747);
    };

    if (pending === 0) {
      render({});
      return;
    }

    imagesToLoad.forEach(item => {
      if (!item.src) return;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (!active) return;
        loaded[item.key] = img;
        pending--;
        if (pending === 0) {
          render(loaded);
        }
      };
      img.onerror = () => {
        if (!active) return;
        pending--;
        if (pending === 0) {
          render(loaded);
        }
      };
      img.src = item.src;
    });

    return () => {
      active = false;
    };
  }, [participant, eventTitle, c]);

  const triggerDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/jpeg', 0.95);
    const downloadLink = document.createElement('a');
    downloadLink.download = `Certificate_${participant.name?.replace(/\s+/g, '_') || 'Participant'}.jpg`;
    downloadLink.href = url;
    downloadLink.click();
  };

  const triggerPDFWindow = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/jpeg', 0.95);
    const printDoc = window.open('', '_blank');
    if (!printDoc) {
      alert("Popup blocked! Click the download button below instead or allow popups in system browser.");
      return;
    }
    printDoc.document.write(`
      <html>
        <head>
          <title>Save Certificate - ${participant.name}</title>
          <style>
            body { margin: 0; padding: 0; background-color: #1a1a1a; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; }
            img { max-width: 95%; max-height: 95%; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
            @media print {
              img { max-width: 100%; border-radius: 0; box-shadow: none; }
              body { background-color: white; }
              @page { size: landscape; margin: 0; }
            }
          </style>
        </head>
        <body>
          <img src="${url}" onload="window.print();" />
        </body>
      </html>
    `);
    printDoc.document.close();
  };

  return (
    <div className="bg-[#151515] border border-white/10 rounded-[32px] p-6 lg:p-8 space-y-6 max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
      <div className="absolute -top-[100px] -right-[100px] w-56 h-56 bg-orange-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="text-center space-y-2">
        <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-wider flex items-center justify-center gap-2">
          <Award className="text-orange-500" size={24} /> Verified Achievement Certificate
        </h3>
        <p className="text-slate-400 text-xs">Verify accuracy below and download your official document</p>
      </div>

      <div className="w-full overflow-x-auto border border-white/5 bg-black rounded-2xl flex justify-center py-4 select-none">
        <canvas 
          ref={canvasRef} 
          width={1120} 
          height={800} 
          className="bg-white" 
          style={{ width: '100%', maxWidth: '780px', height: 'auto' }}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <button
          onClick={triggerDownload}
          className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xl shadow-orange-500/20 cursor-pointer"
        >
          <Download size={16} /> Download High-Quality JPG
        </button>
        <button
          onClick={triggerPDFWindow}
          className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <FileDown size={16} /> Save / Print PDF
        </button>
      </div>
    </div>
  );
};

const Olympiad: React.FC<OlympiadProps> = ({ role, currentUser, logoImage, navigate }) => {
  const isAdmin = role === UserRole.ADMIN;
  const [events, setEvents] = useState<OlympiadEvent[]>([]); 
  const [selectedEvent, setSelectedEvent] = useState<OlympiadEvent | null>(null);
  const [speakers, setSpeakers] = useState<OlympiadSpeaker[]>([]);
  const [resources, setResources] = useState<OlympiadResource[]>([]);
  const [videos, setVideos] = useState<OlympiadVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab ] = useState<'details' | 'materials' | 'results' | 'videos' | 'certificates'>('details');
  const [searchQuery, setSearchQuery] = useState('');

  // Participant certificate checking and admin sync states
  const [certSearchQuery, setCertSearchQuery] = useState('');
  const [searchingCert, setSearchingCert] = useState(false);
  const [certSearchResult, setCertSearchResult] = useState<any[] | null>(null);
  const [selectedParticipantForCert, setSelectedParticipantForCert] = useState<any | null>(null);
  const [allParticipantsCount, setAllParticipantsCount] = useState(0);
  const [sheetUrl, setSheetUrl] = useState('');
  const [isSyncingSheet, setIsSyncingSheet] = useState(false);

  // Customization State (for Hero)
  const [olympiadTitle, setOlympiadTitle] = useState('Phoenix Supreme Olympiad');
  const [olympiadDesc, setOlympiadDesc] = useState('Inspiring Future Scientists, Engineers & Medical Leaders. Join the elite league of academic champions.');
  const [olympiadVenue, setOlympiadVenue] = useState('Virtual / Kulaura');
  const [olympiadDate, setOlympiadDate] = useState('Coming Soon');
  const [olympiadRegLink, setOlympiadRegLink] = useState('');
  const [olympiadHeroImage, setOlympiadHeroImage] = useState('');
  
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [isSavingHero, setIsSavingHero] = useState(false);

  // Certificate template designer state
  const [certConfig, setCertConfig] = useState<CertificateConfig>(DEFAULT_CERT_CONFIG);
  const [isSavingCertConfig, setIsSavingCertConfig] = useState(false);

  // Admin Form States
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminMode, setAdminMode] = useState<'event' | 'speaker' | 'resource' | 'video' | 'participants'>('event');
  const [editingItem, setEditingItem] = useState<any>(null);

  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchParticipantsCount = async (eventId: string) => {
    try {
      const res = await fetch('/api/olympiad?type=participants');
      if (res.ok) {
        const result = await res.json();
        const plist = result.data || [];
        const count = plist.filter((p: any) => p.olympiad_id === eventId).length;
        setAllParticipantsCount(count);
      }
    } catch (err) {
      console.error("Failed to fetch participants count:", err);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchSettings();
  }, []);

  useEffect(() => {
    if (selectedEvent?.id) {
      fetchParticipantsCount(selectedEvent.id);
    }
  }, [selectedEvent?.id, activeTab]);

  const handleSearchCertificate = async () => {
    if (!certSearchQuery.trim()) {
      alert("Please enter your name, roll, or mobile number!");
      return;
    }
    setSearchingCert(true);
    setSelectedParticipantForCert(null);
    setCertSearchResult(null);
    try {
      const res = await fetch(`/api/olympiad?type=participants`);
      if (res.ok) {
        const result = await res.json();
        const allParticipants = result.data || [];
        
        const q = certSearchQuery.toLowerCase().trim();
        const matched = allParticipants.filter((p: any) => {
          const matchEvent = p.olympiad_id === selectedEvent?.id;
          const matchName = p.name?.toLowerCase().includes(q);
          const matchRoll = p.roll?.toLowerCase().includes(q);
          const matchPhone = p.phone?.toLowerCase().includes(q);
          return matchEvent && (matchName || matchRoll || matchPhone);
        });

        setCertSearchResult(matched);
        if (matched.length === 1) {
          setSelectedParticipantForCert(matched[0]);
        } else if (matched.length === 0) {
          alert("No registration records found for this search query in this event.");
        }
      } else {
        alert("Failed to connect to participant registry.");
      }
    } catch (e: any) {
      console.error(e);
      alert("Error searching certificates: " + e.message);
    } finally {
      setSearchingCert(false);
    }
  };

  const handleSyncGoogleSheet = async () => {
    if (!sheetUrl.trim()) {
      alert("Please paste a valid Google Sheets URL!");
      return;
    }
    if (!selectedEvent?.id) {
      alert("No event selected!");
      return;
    }
    setIsSyncingSheet(true);
    try {
      const res = await fetch('/api/olympiad-sync-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheetUrl: sheetUrl.trim(),
          olympiadId: selectedEvent.id
        })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        alert(result.message || "Spreadsheet synced successfully!");
        setAllParticipantsCount(result.count);
        setSheetUrl('');
      } else {
        alert("Error: " + (result.error || "Failed to sync spreadsheet. Please check link sharing settings."));
      }
    } catch (err: any) {
      console.error("Sheets sync error:", err);
      alert("Network error: " + err.message);
    } finally {
      setIsSyncingSheet(false);
    }
  };

  const parseClientCSV = (text: string) => {
    const lines = text.split(/\r?\n/);
    const rows = [];
    for (let line of lines) {
      if (!line.trim()) continue;
      const row = [];
      let insideQuote = false;
      let currentCell = "";
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          insideQuote = !insideQuote;
        } else if (char === ',' && !insideQuote) {
          row.push(currentCell.replace(/^"|"$/g, '').trim());
          currentCell = "";
        } else {
          currentCell += char;
        }
      }
      row.push(currentCell.replace(/^"|"$/g, '').trim());
      rows.push(row);
    }
    return rows;
  };

  const [pastedCsv, setPastedCsv] = useState('');

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/olympiad?type=settings');
      if (res.ok) {
        const result = await res.json();
        const allRows = Array.isArray(result.data) ? result.data : [];
        
        // Find default hero settings row
        const defaultRow = allRows.find((r: any) => r.id === 'default') || allRows[0];
        if (defaultRow) {
          if (defaultRow.hero_title) setOlympiadTitle(defaultRow.hero_title);
          if (defaultRow.hero_description) setOlympiadDesc(defaultRow.hero_description);
          if (defaultRow.venue) setOlympiadVenue(defaultRow.venue);
          if (defaultRow.event_date) setOlympiadDate(defaultRow.event_date);
          if (defaultRow.registration_link) setOlympiadRegLink(defaultRow.registration_link);
          if (defaultRow.hero_image) setOlympiadHeroImage(defaultRow.hero_image);
        }

        // Find certificate template settings row
        const certRow = allRows.find((r: any) => r.id === 'cert_template');
        if (certRow && certRow.hero_description) {
          try {
            const parsed = JSON.parse(certRow.hero_description);
            setCertConfig(parsed);
          } catch (jsonErr) {
            console.error("Failed to parse cert_template config payload:", jsonErr);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch olympiad settings:", err);
    }
  };

  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncDatabase = async () => {
    setIsSyncing(true);
    try {
      const resp = await fetch('/api/sync?action=olympiad', { method: 'POST' });
      const data = await resp.json();
      if (data.success) {
        alert("Database schema synced successfully! Please refresh the page if you still see errors.");
      } else {
        throw new Error(data.error || "Sync failed");
      }
    } catch (err: any) {
      console.error("Database sync failed:", err);
      alert("Failed to sync database: " + (err.message || String(err)));
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveHeroSettings = async () => {
    setIsSavingHero(true);
    try {
      const resp = await fetch('/api/olympiad?type=settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'default',
          hero_title: olympiadTitle,
          hero_description: olympiadDesc,
          venue: olympiadVenue,
          event_date: olympiadDate,
          registration_link: olympiadRegLink,
          hero_image: olympiadHeroImage
        })
      });
      const data = await resp.json();
      if (!data.success) {
        let msg = data.error || "Failed to save settings";
        if (data.details) msg += ` (${data.details})`;
        
        if (msg.toLowerCase().includes('column') || msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('relation')) {
          msg = "Database schema mismatch. Please use the 'Master Sync' button below to update your database.";
        }
        throw new Error(msg);
      }
      if (data.warning) {
        alert("Settings saved partially. Note: " + data.warning + "\n\nTip: Use 'Master Sync' to fix this permanently.");
      }
      setShowConfigModal(false);
    } catch (err: any) {
      console.error("Save hero settings failed:", err);
      // Clean up the error message for the user
      let errorMsg = err.message || String(err);
      if (errorMsg.includes('Unexpected token')) {
        errorMsg = "Server returned an invalid response. This usually means the API route is crashing or Vercel is returning an error page. Check logs.";
      }
      alert(errorMsg);
    } finally {
      setIsSavingHero(false);
    }
  };

  const handleSaveCertConfig = async (configToSave: CertificateConfig) => {
    setIsSavingCertConfig(true);
    try {
      const resp = await fetch('/api/olympiad?type=settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'cert_template',
          hero_title: 'Certificate Template',
          hero_description: JSON.stringify(configToSave)
        })
      });
      const data = await resp.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to save certificate template settings");
      }
      alert("Certificate design template saved successfully!");
    } catch (err: any) {
      console.error("Save certificate settings failed:", err);
      alert("Error saving template design: " + (err.message || String(err)));
    } finally {
      setIsSavingCertConfig(false);
    }
  };

  useEffect(() => {
    if (selectedEvent) {
      fetchEventDetails(selectedEvent.id);
    }
  }, [selectedEvent]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/olympiad?type=events');
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `API failure: ${res.status}`);
      }
      const result = await res.json();
      const items = Array.isArray(result) ? result : (result.data || []);
      
      if (Array.isArray(items)) {
        setEvents(items);
      }
      setLoadError(null);
    } catch (err: any) {
      console.error("Failed to fetch events:", err);
      setLoadError(err.message || "Connection failed");
    } finally {
      setLoading(false);
    }
  };

  const fetchEventDetails = async (id: string) => {
    // Reset lists to prevent showing data from previous event
    setSpeakers([]);
    setResources([]);
    setVideos([]);
    
    // If it's a dummy event ID, don't try to fetch details from real API
    if (!id || id.startsWith('e')) return;
    
    try {
      const [sRes, rRes, vRes] = await Promise.all([
        fetch(`/api/olympiad?type=speakers&olympiad_id=${id}`),
        fetch(`/api/olympiad?type=resources&olympiad_id=${id}`),
        fetch(`/api/olympiad?type=videos&olympiad_id=${id}`)
      ]);
      
      const sResult = await sRes.json();
      const rResult = await rRes.json();
      const vResult = await vRes.json();
      
      const sData = sResult.data || sResult;
      const rData = rResult.data || rResult;
      const vData = vResult.data || vResult;
      
      setSpeakers(Array.isArray(sData) ? sData : []);
      setResources(Array.isArray(rData) ? rData : []);
      setVideos(Array.isArray(vData) ? vData : []);
    } catch (err) {
      console.error("Failed to fetch event details:", err);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this event and all its data?")) return;
    
    // If it's dummy data, just remove from local state
    if (String(id).startsWith('e')) {
      const updatedEvents = events.filter(e => e.id !== id);
      setEvents(updatedEvents);
      if (selectedEvent?.id === id) setSelectedEvent(updatedEvents[0] || null);
      return;
    }

    try {
      const res = await fetch(`/api/olympiad?type=events&id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Delete failed");
      
      const updatedEvents = events.filter(e => e.id !== id);
      setEvents(updatedEvents);
      if (selectedEvent?.id === id) setSelectedEvent(updatedEvents[0] || null);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed. See console for details.");
    }
  };

  const handleDeleteSpeaker = async (id: string) => {
    if (!window.confirm("Delete this speaker?")) return;
    
    try {
      // Optimistic local update
      setSpeakers(prev => prev.filter(s => s.id !== id));
      
      if (!String(id).includes('_s') && !String(id).startsWith('temp-')) {
        const res = await fetch(`/api/olympiad?type=speakers&id=${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error("Delete failed");
      }
      
      if (selectedEvent && !selectedEvent.id.startsWith('e')) {
        fetchEventDetails(selectedEvent.id);
      }
    } catch (err) {
      console.error("Delete speaker failed:", err);
      alert("Delete failed. Please retry.");
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!window.confirm("Delete this resource?")) return;
    
    try {
      // Optimistic local update
      setResources(prev => prev.filter(r => r.id !== id));
      
      if (!String(id).includes('_r') && !String(id).startsWith('temp-')) {
        const res = await fetch(`/api/olympiad?type=resources&id=${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error("Delete failed");
      }
      
      if (selectedEvent && !selectedEvent.id.startsWith('e')) {
        fetchEventDetails(selectedEvent.id);
      }
    } catch (err) {
      console.error("Delete resource failed:", err);
      alert("Delete failed. Please retry.");
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!window.confirm("Delete this video?")) return;
    
    try {
      // Optimistic local update
      setVideos(prev => prev.filter(v => v.id !== id));

      if (!String(id).includes('_v') && !String(id).startsWith('temp-')) {
        const res = await fetch(`/api/olympiad?type=videos&id=${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error("Delete failed");
      }

      if (selectedEvent && !selectedEvent.id.startsWith('e')) {
        fetchEventDetails(selectedEvent.id);
      }
    } catch (err) {
      console.error("Delete video failed:", err);
      alert("Delete failed. Please retry.");
    }
  };

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         e.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const filteredSpeakers = speakers.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.university?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.topics?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredResources = resources.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVideos = videos.filter(v => 
    v.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Components
  const getDirectImageUrl = (url: string) => {
    if (!url) return '';
    try {
      if (url.includes('drive.google.com')) {
        let fileId = '';
        if (url.includes('/d/')) {
          fileId = url.split('/d/')[1].split('/')[0];
        } else if (url.includes('id=')) {
          fileId = url.split('id=')[1].split('&')[0];
        }
        if (fileId) {
          // Use more reliable direct link format
          return `https://lh3.googleusercontent.com/d/${fileId}`;
        }
      }
      return url;
    } catch (e) {
      return url;
    }
  };

  const HeroSection = () => (
    <div className="relative min-h-[60vh] md:min-h-[70vh] flex items-center justify-center overflow-hidden pt-28 md:pt-32 pb-12 md:pb-20">
      {isAdmin && (
        <button 
          onClick={() => setShowConfigModal(true)}
          className="absolute top-24 md:top-32 right-6 z-20 p-3 md:p-4 bg-orange-500 text-white rounded-2xl hover:bg-orange-600 shadow-xl flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
        >
          <Edit2 size={14} /> <span className="hidden sm:inline">Edit Hero</span>
        </button>
      )}
      <div className="absolute inset-0 bg-[#0A0A0A]">
        {olympiadHeroImage ? (
          <img src={getDirectImageUrl(olympiadHeroImage)} className="w-full h-full object-cover opacity-30" alt="" referrerPolicy="no-referrer" />
        ) : (
          <>
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-500/10 blur-[120px] rounded-full animate-pulse" />
          </>
        )}
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center space-y-6 md:space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex flex-wrap items-center justify-center gap-3 md:gap-6 px-4 md:px-6 py-2 md:py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl text-orange-500 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em]"
        >
          <div className="flex items-center gap-1.5 md:gap-2">
            <Award size={12} className="md:w-[14px]" />
            <span>Phoenix Excellence</span>
          </div>
          <div className="hidden sm:block w-px h-3 md:h-4 bg-white/10" />
          <div className="flex items-center gap-1.5 md:gap-2 text-white/70">
            <MapPin size={12} className="text-orange-500 md:w-[14px]" />
            <span>{olympiadVenue}</span>
          </div>
          <div className="hidden sm:block w-px h-3 md:h-4 bg-white/10" />
          <div className="flex items-center gap-1.5 md:gap-2 text-white/70">
            <Calendar size={12} className="text-orange-500 md:w-[14px]" />
            <span>{olympiadDate}</span>
          </div>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[2.75rem] sm:text-5xl md:text-8xl font-black text-white tracking-tighter uppercase leading-[0.95] md:leading-none"
        >
          {olympiadTitle.split(' ').slice(0, -2).join(' ')} <br className="hidden md:block" />
          <span className="text-orange-500 drop-shadow-[0_0_30px_rgba(249,115,22,0.3)]">
            {olympiadTitle.split(' ').slice(-2).join(' ')}
          </span>
        </motion.h1>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="relative max-w-3xl mx-auto group"
        >
          <div className="absolute -inset-x-10 md:-inset-x-20 -inset-y-5 md:-inset-y-10 bg-orange-500/5 blur-[80px] md:blur-[100px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
          
          <div className="relative px-6 py-6 md:px-12 md:py-10 backdrop-blur-sm bg-white/[0.02] border border-white/5 rounded-[24px] md:rounded-[40px] overflow-hidden shadow-2xl shadow-orange-500/5">
            <p className="relative z-10 text-sm md:text-[1.3rem] text-slate-200/90 font-medium tracking-tight leading-relaxed md:leading-[1.8]">
              {olympiadDesc}
            </p>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 md:w-32 h-[1px] bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />
          </div>
        </motion.div>

        {olympiadRegLink && (
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
             className="pt-2 md:pt-4"
           >
             <a 
               href={olympiadRegLink}
               target="_blank"
               rel="noopener noreferrer"
               className="inline-flex items-center gap-2 md:gap-3 px-8 py-4 md:px-10 md:py-5 bg-orange-500 text-white rounded-xl md:rounded-[20px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-2xl shadow-orange-500/20 active:scale-95 text-xs md:text-sm"
             >
               Register Now <ArrowRight size={18} className="md:w-[20px]" />
             </a>
           </motion.div>
        )}
      </div>
    </div>
  );

  const EventsList = () => (
    <section id="events-section" className="py-16 md:py-24 px-6 max-w-7xl mx-auto space-y-8 md:space-y-12">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div className="space-y-3 w-full md:w-auto">
          <div className="flex items-center gap-3 md:gap-4">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase">Wisdom Events</h2>
            {isAdmin && (
              <button 
                onClick={() => { setAdminMode('event'); setEditingItem(null); setShowAdminModal(true); }}
                className="p-2 md:p-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-all shadow-lg"
              >
                <Plus size={18} className="md:w-[20px]" />
              </button>
            )}
          </div>
        </div>

        <div className="relative w-full md:w-80 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-orange-500 transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl py-3.5 md:py-4 pl-12 pr-4 text-white font-bold text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all placeholder:text-slate-600"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {filteredEvents.map((event, idx) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group relative bg-white/5 backdrop-blur-xl rounded-[32px] md:rounded-[40px] border border-white/10 overflow-hidden hover:border-orange-500/50 transition-all"
          >
            <div className="aspect-[16/10] md:aspect-video relative overflow-hidden">
              <img 
                src={getDirectImageUrl(event.banner_image) || 'https://images.unsplash.com/photo-1544391496-1ca7c97457cd?auto=format&fit=crop&q=80'} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                alt={event.title} 
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
              <div className="absolute top-4 right-4 flex gap-2">
                {isAdmin && (
                  <>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setAdminMode('event'); setEditingItem(event); setShowAdminModal(true); }}
                      className="p-1.5 md:p-2 bg-white/20 backdrop-blur-md text-white rounded-lg hover:bg-white/40 transition-all"
                    >
                      <Edit2 size={12} className="md:w-[14px]" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event.id); }}
                      className="p-1.5 md:p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-lg"
                    >
                      <Trash2 size={12} className="md:w-[14px]" />
                    </button>
                  </>
                )}
                <span className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest ${
                  event.status === 'Running' ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]' :
                  event.status === 'Upcoming' ? 'bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]' :
                  'bg-slate-700 text-slate-300'
                }`}>
                  {event.status}
                </span>
              </div>
            </div>
            
            <div className="p-6 md:p-8 space-y-4 md:space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl md:text-2xl font-black text-white leading-tight uppercase line-clamp-2">{event.title}</h3>
                <p className="text-xs md:text-sm text-slate-500 line-clamp-2">{event.description}</p>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar size={14} />
                  <span className="text-[10px] md:text-xs font-bold">{new Date(event.date).toLocaleDateString()}</span>
                </div>
                
                <div className="flex items-center gap-2 justify-end">
                  {event.registration_url && (
                    <a 
                      href={event.registration_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 md:px-4 py-1.5 md:py-2 bg-green-500/10 text-green-500 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all whitespace-nowrap"
                    >
                      Register
                    </a>
                  )}
                  <button 
                    onClick={() => { setSelectedEvent(event); setActiveTab('details'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="p-3 md:p-4 bg-orange-500 text-white rounded-xl md:rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 active:scale-95 transition-transform"
                  >
                    <ArrowRight size={16} className="md:w-[18px]" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );

  const EventDetailView = () => {
    if (!selectedEvent) return null;
    
    return (
      <div className="min-h-screen bg-[#0A0A0A] pt-20">
        {/* Back Navigation */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <button 
            onClick={() => setSelectedEvent(null)}
            className="flex items-center gap-2 text-slate-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest"
          >
            <X size={16} />
            Back to Olympiad
          </button>
        </div>

        {/* Event Hero */}
        <div className="relative h-[300px] md:h-[400px] overflow-hidden">
          <img 
            src={getDirectImageUrl(selectedEvent.banner_image)} 
            className="w-full h-full object-cover opacity-30 scale-110 blur-[1px] md:blur-[2px]" 
            alt="" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/70 md:via-[#0A0A0A]/60 to-[#0A0A0A]/40" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0A0A0A_100%)] opacity-80 md:opacity-60" />
          <div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 w-full max-w-7xl px-6 text-center space-y-4">
            {isAdmin && (
              <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-4 md:mb-6">
                <button 
                  onClick={() => { setAdminMode('event'); setEditingItem(selectedEvent); setShowAdminModal(true); }}
                  className="px-4 md:px-6 py-2 md:py-3 bg-white/10 backdrop-blur-md text-white rounded-lg md:rounded-xl hover:bg-white/20 transition-all flex items-center gap-2 text-[8px] md:text-[10px] font-black uppercase tracking-widest border border-white/10"
                >
                  <Edit2 size={12} className="md:w-[14px]" /> Edit Header
                </button>
                <button 
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                  className="px-4 md:px-6 py-2 md:py-3 bg-red-500/20 backdrop-blur-md text-red-500 rounded-lg md:rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center gap-2 text-[8px] md:text-[10px] font-black uppercase tracking-widest border border-red-500/10"
                >
                  <Trash2 size={12} className="md:w-[14px]" /> Delete
                </button>
              </div>
            )}
            <h1 className="text-3xl md:text-6xl font-black text-white uppercase tracking-tighter leading-tight">{selectedEvent.title}</h1>
            {selectedEvent.subtitle && (
              <p className="text-slate-300/90 max-w-4xl mx-auto text-xs md:text-xl leading-relaxed font-normal tracking-wide line-clamp-2 md:line-clamp-none">{selectedEvent.subtitle}</p>
            )}
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 pt-2 md:pt-4">
              {selectedEvent.registration_url && (
                <a 
                  href={selectedEvent.registration_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 md:px-8 py-3 md:py-4 bg-orange-500 text-white rounded-lg md:rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
                >
                  Register Now
                </a>
              )}
              {selectedEvent.external_link && (
                <a 
                  href={selectedEvent.external_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 md:px-8 py-3 md:py-4 bg-white/5 border border-white/10 text-white rounded-lg md:rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  Details <ExternalLink size={12} className="md:w-[14px]" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="sticky top-[70px] z-30 bg-[#0A0A0A]/90 backdrop-blur-3xl border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-center gap-4 sm:gap-8 md:gap-16 py-4 md:py-6 overflow-x-auto no-scrollbar">
            {[
              { id: 'details', label: 'Overview', icon: Target },
              { id: 'materials', label: 'Materials', icon: FileText },
              { id: 'results', label: 'Results', icon: Trophy },
              { id: 'videos', label: 'Sessions', icon: Video },
              { id: 'certificates', label: 'Certificate', icon: Award },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col md:flex-row items-center gap-1.5 md:gap-3 text-[8px] md:text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] transition-all relative whitespace-nowrap min-w-[60px] md:min-w-0 ${
                  activeTab === tab.id ? 'text-orange-500' : 'text-slate-500 hover:text-white'
                }`}
              >
                <tab.icon size={16} className="md:w-[18px]" />
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div layoutId="tab-underline" className="absolute -bottom-[17px] md:-bottom-[25px] left-0 w-full h-0.5 bg-orange-500" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          {activeTab === 'details' && (
            <div className="space-y-24">
              {/* Event Overview Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Description Card */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="lg:col-span-2 space-y-8"
                >
                  <div className="relative group">
                    {/* Background Blur Accent */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-blue-500/20 rounded-[32px] blur-2xl opacity-50 group-hover:opacity-75 transition duration-1000" />
                    
                    <div className="relative bg-white/[0.03] backdrop-blur-3xl rounded-[32px] border border-white/10 p-6 md:p-12 shadow-2xl overflow-hidden">
                      {/* Decorative elements */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[100px] -mr-32 -mt-32" />
                      
                      <div className="relative space-y-6 md:space-y-8">
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-500 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/30 font-bold">
                            <Target size={20} className="md:w-[24px]" />
                          </div>
                          <div>
                            <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">Event Overview</h3>
                            <div className="h-1 w-10 md:w-12 bg-orange-500 rounded-full mt-1" />
                          </div>
                        </div>
                        
                        <div className="prose prose-invert max-w-none">
                          <div className="text-sm md:text-xl text-slate-300 leading-relaxed md:leading-[1.8] font-medium tracking-tight whitespace-pre-wrap break-words">
                            {selectedEvent.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Quick Info Grid */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between px-4">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Quick Information</h4>
                    <Zap size={14} className="text-orange-500 animate-pulse" />
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:gap-4">
                    {[
                      { label: 'Group / Category', value: selectedEvent.target_group || 'All Groups', icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                      { label: 'Event Date', value: selectedEvent.date || 'To be announced', icon: Calendar, color: 'text-orange-400', bg: 'bg-orange-400/10' },
                      { label: 'Registration Deadline', value: selectedEvent.deadline || 'Limited Seats', icon: Clock, color: 'text-red-400', bg: 'bg-red-400/10' },
                      { label: 'Event Venue', value: selectedEvent.venue || olympiadVenue, icon: MapPin, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                    ].map((item, i) => (
                      <div key={i} className="bg-white/[0.03] border border-white/10 p-5 md:p-6 rounded-[20px] md:rounded-[24px] hover:bg-white/[0.08] hover:border-white/20 transition-all group relative overflow-hidden">
                        <div className="flex items-center gap-4 relative z-10">
                          <div className={`w-10 h-10 md:w-12 md:h-12 ${item.bg} ${item.color} rounded-xl md:rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                            <item.icon size={20} className="md:w-[22px]" />
                          </div>
                          <div>
                            <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-0.5 md:mb-1">{item.label}</p>
                            <p className="text-xs md:text-sm font-bold text-white uppercase tracking-tight leading-tight">{item.value}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedEvent.syllabus && (
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/20 to-transparent rounded-[32px] blur opacity-50" />
                      <div className="relative bg-gradient-to-br from-orange-500/[0.08] to-transparent border border-orange-500/20 p-8 rounded-[32px] space-y-5">
                        <div className="flex items-center gap-3 text-orange-500">
                          <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                            <BookOpen size={16} />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest">Syllabus & Topics</span>
                        </div>
                        <p className="text-sm text-slate-300 leading-[1.8] font-medium tracking-tight bg-black/20 p-4 rounded-xl border border-white/5 italic">
                          "{selectedEvent.syllabus}"
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Speakers */}
              <div className="space-y-12">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-black text-white uppercase tracking-tight">Keynote Speakers</h2>
                  {isAdmin && (
                    <button 
                      onClick={() => { setAdminMode('speaker'); setEditingItem({ olympiad_id: selectedEvent.id }); setShowAdminModal(true); }}
                      className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all"
                    >
                      <Plus size={16} /> Add Speaker
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {(filteredSpeakers.length > 0 ? filteredSpeakers : (searchQuery ? [] : speakers)).map((speaker, idx) => (
                    <motion.div
                      key={speaker.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white/5 backdrop-blur-xl rounded-[24px] md:rounded-[32px] border border-white/10 p-6 md:p-8 space-y-5 md:space-y-6 group hover:border-orange-500/30 transition-all relative"
                    >
                      {isAdmin && (
                        <div className="absolute top-4 md:top-6 right-4 md:right-6 flex gap-2 z-10">
                          <button 
                            onClick={() => { setAdminMode('speaker'); setEditingItem(speaker); setShowAdminModal(true); }}
                            className="p-2 md:p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all"
                          >
                            <Edit2 size={12} className="md:w-[14px]" />
                          </button>
                          <button 
                            onClick={() => handleDeleteSpeaker(speaker.id)}
                            className="p-2 md:p-3 bg-red-500/20 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-lg"
                          >
                            <Trash2 size={12} className="md:w-[14px]" />
                          </button>
                        </div>
                      )}
                      <div className="relative">
                        <div className="aspect-square rounded-xl md:rounded-2xl overflow-hidden mb-4 md:mb-6 bg-slate-800">
                          <img 
                            src={getDirectImageUrl(speaker.image)} 
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                            alt={speaker.name} 
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="absolute -bottom-2 md:-bottom-4 right-2 md:right-4 w-10 h-10 md:w-12 md:h-12 bg-orange-500 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-xl">
                          <GraduationCap size={18} className="md:w-[20px]" />
                        </div>
                      </div>
                      
                      <div className="space-y-3 md:space-y-4">
                        <div className="space-y-0.5 md:space-y-1">
                          <h3 className="text-lg md:text-xl font-black text-white uppercase">{speaker.name}</h3>
                          <p className="text-orange-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest">{speaker.university}</p>
                          <p className="text-slate-500 text-[10px] md:text-xs font-bold italic">{speaker.department}</p>
                        </div>
                        <p className="text-xs md:text-sm text-slate-400 line-clamp-3 leading-relaxed">{speaker.bio}</p>
                        <div className="pt-3 md:pt-4 border-t border-white/5 space-y-2">
                          <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest">Speaking On:</p>
                          <div className="flex flex-wrap gap-1.5 md:gap-2">
                            {speaker.topics?.map(topic => (
                              <span key={topic} className="px-2 md:px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[8px] md:text-[10px] text-slate-300">
                                {topic}
                              </span>
                            ))}
                            {speaker.external_link && (
                              <a 
                                href={speaker.external_link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-2 md:px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-lg text-[8px] md:text-[10px] text-orange-500 hover:bg-orange-500 hover:text-white transition-all flex items-center gap-1"
                              >
                                PROFILE <ExternalLink size={10} />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'materials' && (
            <div className="space-y-12">
               <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-white uppercase tracking-tight">Academic Resources</h2>
                {isAdmin && (
                  <button 
                    onClick={() => { setAdminMode('resource'); setEditingItem({ olympiad_id: selectedEvent.id }); setShowAdminModal(true); }}
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all"
                  >
                    <Plus size={16} /> Add Resource
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {(filteredResources.length > 0 ? filteredResources : resources).filter(r => r.type !== 'Result' && r.type !== 'Merit List').map((resource, idx) => (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group bg-white/5 backdrop-blur-xl p-5 md:p-6 rounded-[20px] md:rounded-[24px] border border-white/10 hover:border-blue-500/50 transition-all relative"
                  >
                    {isAdmin && (
                      <div className="absolute top-4 right-4 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setAdminMode('resource'); setEditingItem(resource); setShowAdminModal(true); }}
                          className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button 
                          onClick={() => handleDeleteResource(resource.id)}
                          className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                    <div className="w-full flex justify-between items-start mb-6">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                        {resource.type === 'Question Paper' ? <FileText size={20} /> : <Zap size={20} />}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white leading-tight uppercase">{resource.title}</h4>
                      </div>
                      <a 
                        href={resource.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-between w-full p-2 text-xs font-black uppercase text-blue-500 hover:text-white transition-colors"
                      >
                        Download PDF <FileDown size={14} />
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'results' && (
            <div className="space-y-12">
               <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-white uppercase tracking-tight">Event Results</h2>
                {isAdmin && (
                  <button 
                    onClick={() => { setAdminMode('resource'); setEditingItem({ olympiad_id: selectedEvent.id, type: 'Result' }); setShowAdminModal(true); }}
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all"
                  >
                    <Plus size={16} /> Post Result
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {(filteredResources.length > 0 ? filteredResources : (searchQuery ? [] : resources)).filter(r => r.type === 'Result' || r.type === 'Merit List').length === 0 ? (
                  <div className="col-span-full py-20 bg-white/5 rounded-[40px] border border-white/10 border-dashed text-center">
                    <Trophy className="mx-auto text-slate-700 mb-4" size={48} />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">{searchQuery ? 'No results match your search' : 'Results will be announced soon'}</p>
                  </div>
                ) : (
                  (filteredResources.length > 0 ? filteredResources : resources).filter(r => r.type === 'Result' || r.type === 'Merit List').map((result, idx) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group bg-gradient-to-br from-green-500/10 to-transparent p-6 md:p-8 rounded-[24px] md:rounded-[32px] border border-green-500/20 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden"
                    >
                      {isAdmin && (
                        <div className="absolute top-4 right-4 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => { setAdminMode('resource'); setEditingItem(result); setShowAdminModal(true); }}
                            className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button 
                            onClick={() => handleDeleteResource(result.id)}
                            className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center text-green-500">
                          <Trophy size={32} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">{result.type}</p>
                          <h4 className="text-xl font-black text-white uppercase">{result.title}</h4>
                        </div>
                      </div>
                      <a 
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-4 bg-green-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-green-600 transition-all flex items-center gap-2"
                      >
                        <Download size={14} />
                        Download
                      </a>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="space-y-12">
               <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-white uppercase tracking-tight">Session Recordings</h2>
                {isAdmin && (
                  <button 
                    onClick={() => { setAdminMode('video'); setEditingItem({ olympiad_id: selectedEvent.id }); setShowAdminModal(true); }}
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all"
                  >
                    <Plus size={16} /> Add Video
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {(filteredVideos.length > 0 ? filteredVideos : (searchQuery ? [] : videos)).map((video, idx) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6 group relative"
                  >
                    {isAdmin && (
                      <div className="absolute top-4 right-4 flex gap-1 z-20">
                        <button 
                          onClick={() => { setAdminMode('video'); setEditingItem(video); setShowAdminModal(true); }}
                          className="p-3 bg-black/60 backdrop-blur-md text-white rounded-full hover:bg-black/80"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteVideo(video.id)}
                          className="p-3 bg-red-600 space-x-2 text-white rounded-full hover:bg-red-700 shadow-xl"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                    <div className="aspect-video bg-slate-800 rounded-[20px] md:rounded-[32px] overflow-hidden border border-white/5 shadow-2xl relative">
                      <iframe 
                        className="w-full h-full"
                        src={getYoutubeEmbedUrl(video.youtube_url)} 
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                      />
                    </div>
                    <div className="px-4 space-y-2">
                       <h4 className="text-xl font-black text-white uppercase group-hover:text-orange-500 transition-colors">{video.title}</h4>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'certificates' && (
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                    <Award className="text-orange-500 font-black animate-pulse" size={32} /> Academic Certificates
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">Claim, verify, and print your certified Phoenix Supreme Olympiad documents.</p>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-3 bg-orange-500/10 border border-orange-500/20 px-5 py-3 rounded-2xl text-orange-400 font-extrabold uppercase tracking-widest text-[10px] shadow-lg shadow-orange-500/5">
                    <Users size={16} /> {allParticipantsCount} Students Enrolled
                  </div>
                )}
              </div>

              {/* Student Search Panel */}
              <div className="bg-gradient-to-b from-[#121212] to-[#0D0D0D] border border-white/5 rounded-[32px] p-6 md:p-8 space-y-6 max-w-4xl mx-auto shadow-xl">
                <div className="space-y-2">
                  <h3 className="text-xl font-blue text-white font-black uppercase tracking-wider">Search Registration Records</h3>
                  <p className="text-slate-400 text-xs">Enter your Name, Registration number/Roll, or Mobile number to load your certificate.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="text"
                      value={certSearchQuery}
                      onChange={(e) => setCertSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchCertificate()}
                      placeholder="e.g. Abid Hasan or Roll PX-023 or 01700..."
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 text-sm focus:border-orange-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <button
                    onClick={handleSearchCertificate}
                    disabled={searchingCert}
                    className="px-8 py-4 bg-orange-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-orange-600 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55 duration-200"
                  >
                    {searchingCert ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Searching...
                      </span>
                    ) : (
                      <>
                        <Search size={14} /> Search Record
                      </>
                    )}
                  </button>
                </div>

                {/* Multiple Matches Selection */}
                {certSearchResult && certSearchResult.length > 1 && (
                  <div className="space-y-3 bg-white/5 p-5 border border-white/10 rounded-2xl">
                    <p className="text-slate-300 font-bold text-xs uppercase tracking-wider">Multiple records found. Please select your name:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                      {certSearchResult.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedParticipantForCert(p)}
                          className={`p-4 border text-left rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                            selectedParticipantForCert?.id === p.id 
                              ? 'border-orange-500 bg-orange-500/10 text-white' 
                              : 'border-white/10 bg-[#151515] hover:bg-white/5 text-slate-300'
                          }`}
                        >
                          <div>
                            <p className="font-extrabold text-sm">{p.name}</p>
                            <p className="text-[10px] text-slate-500 font-semibold">{p.institution || 'No Institution'} • Roll: {p.roll || 'N/A'}</p>
                          </div>
                          <ChevronRight size={16} className={selectedParticipantForCert?.id === p.id ? 'text-orange-500 animate-pulse' : 'text-slate-600'} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Verified Certificate Canvas Panel with Mock Mode for Admins */}
              {(selectedParticipantForCert || (isAdmin && selectedEvent)) && (
                <div className="animate-fadeIn space-y-6">
                  {(!selectedParticipantForCert && isAdmin) && (
                    <div className="bg-orange-500/10 border border-orange-500/20 px-5 py-3 rounded-2xl text-center text-xs font-semibold text-orange-400 max-w-4xl mx-auto">
                      💡 <strong>Design Studio Preview Mode:</strong> Showing live canvas with mock student details so you can customize layout, text, logos and signatures in real-time.
                    </div>
                  )}
                  <CertificateCanvas 
                    participant={selectedParticipantForCert || {
                      name: '',
                      roll: 'PX-2026-778',
                      status: 'Olympiad Winner (Class 10)',
                      rank: '1st Place (Gold Medallist)',
                      institution: 'Kulaura Girls High School',
                      certificate_id: 'ooo',
                      created_at: new Date().toISOString()
                    }} 
                    eventTitle={selectedEvent?.title || 'Phoenix Supreme Olympiad'} 
                    config={certConfig}
                  />
                </div>
              )}

              {/* Dynamic Certificate Template Designer (Admin Only) */}
              {isAdmin && (
                <div className="bg-[#111111] border border-white/5 rounded-[32px] p-6 md:p-8 space-y-6 max-w-4xl mx-auto mt-8 shadow-2xl relative">
                  <div className="absolute top-0 right-0 p-2 bg-orange-500/10 border-l border-b border-orange-500/20 text-orange-500 text-[8px] font-black tracking-widest uppercase rounded-bl-xl">Administrative Designer</div>
                  
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <PenTool className="text-orange-500" size={20} /> Certificate Template Designer
                    </h3>
                    <p className="text-slate-400 text-xs">Edit layout structures, headings, signees, seals, and colors in real-time. Changes sync across all certificates instantly.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#151515] p-5 rounded-3xl border border-white/5">
                    {/* Column 1: Core details */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-orange-500 uppercase tracking-widest border-b border-white/5 pb-2">Header Texts</h4>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Organization Name</label>
                        <input 
                          type="text"
                          value={certConfig.orgName}
                          onChange={(e) => setCertConfig({ ...certConfig, orgName: e.target.value })}
                          className="w-full px-4 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:border-orange-500 focus:outline-none focus:ring-0 transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Tagline / Mission</label>
                        <input 
                          type="text"
                          value={certConfig.tagline}
                          onChange={(e) => setCertConfig({ ...certConfig, tagline: e.target.value })}
                          className="w-full px-4 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:border-orange-500 focus:outline-none focus:ring-0 transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Certificate Title</label>
                        <input 
                          type="text"
                          value={certConfig.certTitle}
                          onChange={(e) => setCertConfig({ ...certConfig, certTitle: e.target.value })}
                          className="w-full px-4 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:border-orange-500 focus:outline-none focus:ring-0 transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Presented Text</label>
                        <input 
                          type="text"
                          value={certConfig.subTitle}
                          onChange={(e) => setCertConfig({ ...certConfig, subTitle: e.target.value })}
                          className="w-full px-4 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:border-orange-500 focus:outline-none focus:ring-0 transition-colors"
                        />
                      </div>

                      {/* Custom Organization Logo Upload Option */}
                      <div className="space-y-1.5 p-3.5 bg-white/5 border border-white/10 rounded-2xl">
                        <label className="text-[10px] font-black text-orange-400 uppercase tracking-wider flex items-center justify-between">
                          <span>Organization Logo (Top Center)</span>
                          {certConfig.logoImage && <span className="text-[8px] text-green-400 font-extrabold uppercase">Uploaded</span>}
                        </label>
                        <div className="flex items-center gap-3">
                          {certConfig.logoImage ? (
                            <img src={certConfig.logoImage} className="w-12 h-12 rounded-lg bg-white border border-white/20 object-contain p-1" alt="Logo preview" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-black/50 border border-white/5 flex items-center justify-center text-slate-600 text-[9px] font-bold">No-Logo</div>
                          )}
                          <div className="flex-1">
                            <input 
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setCertConfig(prev => ({ ...prev, logoImage: reader.result as string }));
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="hidden"
                              id="logo-upload-input"
                            />
                            <div className="flex gap-2">
                              <label 
                                htmlFor="logo-upload-input"
                                className="px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-[10px] font-bold rounded-lg cursor-pointer border border-orange-500/20 active:opacity-85 transition-colors uppercase tracking-wide"
                              >
                                {certConfig.logoImage ? "Change Logo" : "Upload Logo"}
                              </label>
                              {certConfig.logoImage && (
                                <button 
                                  type="button" 
                                  onClick={() => setCertConfig(prev => ({ ...prev, logoImage: undefined }))}
                                  className="px-2 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold rounded-lg border border-red-500/20 transition-all uppercase"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <h4 className="text-xs font-bold text-orange-500 uppercase tracking-widest border-b border-white/5 pt-2 pb-2">Theme Customization</h4>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wide">Backing</label>
                          <input 
                            type="color"
                            value={certConfig.themeBackground}
                            onChange={(e) => setCertConfig({ ...certConfig, themeBackground: e.target.value })}
                            className="w-full h-8 bg-transparent border-0 cursor-pointer p-0"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wide">Borders</label>
                          <input 
                            type="color"
                            value={certConfig.themeOverlay}
                            onChange={(e) => setCertConfig({ ...certConfig, themeOverlay: e.target.value })}
                            className="w-full h-8 bg-transparent border-0 cursor-pointer p-0"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wide">Accents</label>
                          <input 
                            type="color"
                            value={certConfig.themeAccent}
                            onChange={(e) => setCertConfig({ ...certConfig, themeAccent: e.target.value })}
                            className="w-full h-8 bg-transparent border-0 cursor-pointer p-0"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 mt-4">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block font-semibold">Dynamic Theme Presets</label>
                        <div className="flex flex-wrap gap-2">
                          <button 
                            type="button" 
                            onClick={() => setCertConfig({ ...certConfig, themeBackground: '#FAF8F4', themeOverlay: '#2C3E50', themeAccent: '#D4AF37' })}
                            className="px-2 py-1 bg-white/5 hover:bg-white/10 text-[9px] text-white rounded font-bold border border-white/10 transition-colors uppercase tracking-wider"
                          >
                            Royal Obsidian
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setCertConfig({ ...certConfig, themeBackground: '#F4F8F5', themeOverlay: '#1B4332', themeAccent: '#D4AF37' })}
                            className="px-2 py-1 bg-white/5 hover:bg-white/10 text-[9px] text-white rounded font-bold border border-white/10 transition-colors uppercase tracking-wider"
                          >
                            Classic Emerald
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setCertConfig({ ...certConfig, themeBackground: '#F4F6F9', themeOverlay: '#1E3A8A', themeAccent: '#E2B33C' })}
                            className="px-2 py-1 bg-white/5 hover:bg-white/10 text-[9px] text-white rounded font-bold border border-white/10 transition-colors uppercase tracking-wider"
                          >
                            Ocean Sapphire
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setCertConfig({ ...certConfig, themeBackground: '#F9F4F4', themeOverlay: '#7F1D1D', themeAccent: '#D4AF37' })}
                            className="px-2 py-1 bg-white/5 hover:bg-white/10 text-[9px] text-white rounded font-bold border border-white/10 transition-colors uppercase tracking-wider"
                          >
                            Ruby Imperial
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Signees & Stamp */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-orange-500 uppercase tracking-widest border-b border-white/5 pb-2">Left Signatory (Sig 1)</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Name</label>
                          <input 
                            type="text"
                            value={certConfig.sig1Name}
                            onChange={(e) => setCertConfig({ ...certConfig, sig1Name: e.target.value })}
                            className="w-full px-4 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:border-orange-500 focus:outline-none transition-colors"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Title / Role</label>
                          <input 
                            type="text"
                            value={certConfig.sig1Title}
                            onChange={(e) => setCertConfig({ ...certConfig, sig1Title: e.target.value })}
                            className="w-full px-4 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:border-orange-500 focus:outline-none transition-colors"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Organization</label>
                        <input 
                          type="text"
                          value={certConfig.sig1Org}
                          onChange={(e) => setCertConfig({ ...certConfig, sig1Org: e.target.value })}
                          className="w-full px-4 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:border-orange-500 focus:outline-none transition-colors"
                        />
                      </div>

                      {/* Left Signature Upload */}
                      <div className="space-y-1 bg-white/5 p-3 rounded-xl border border-white/10 mt-2">
                        <label className="text-[10px] font-bold text-orange-400 uppercase tracking-wide flex items-center justify-between">
                          <span>Left Signature Image</span>
                          {certConfig.sig1Image && <span className="text-[8px] text-green-400 font-extrabold uppercase">Uploaded</span>}
                        </label>
                        <div className="flex items-center gap-2">
                          {certConfig.sig1Image ? (
                            <img src={certConfig.sig1Image} className="w-16 h-8 rounded bg-white object-contain p-1 border border-white/20" alt="Sig1 preview" />
                          ) : (
                            <div className="w-16 h-8 rounded bg-black/50 border border-white/5 flex items-center justify-center text-slate-600 text-[9px] font-bold">No-Sig</div>
                          )}
                          <div className="flex-1">
                            <input 
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setCertConfig(prev => ({ ...prev, sig1Image: reader.result as string }));
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="hidden"
                              id="sig1-upload-input"
                            />
                            <div className="flex gap-1.5">
                              <label 
                                htmlFor="sig1-upload-input"
                                className="px-2 py-1 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-[9px] font-bold rounded cursor-pointer border border-orange-500/10 active:opacity-85 transition-colors uppercase"
                              >
                                {certConfig.sig1Image ? "Change" : "Upload"}
                              </label>
                              {certConfig.sig1Image && (
                                <button 
                                  type="button" 
                                  onClick={() => setCertConfig(prev => ({ ...prev, sig1Image: undefined }))}
                                  className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[9px] font-bold rounded border border-red-500/10 active:opacity-85 transition-colors uppercase"
                                >
                                  Clear
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <h4 className="text-xs font-bold text-orange-500 uppercase tracking-widest border-b border-white/5 pt-2 pb-2">Right Signatory (Sig 2)</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Name</label>
                          <input 
                            type="text"
                            value={certConfig.sig2Name}
                            onChange={(e) => setCertConfig({ ...certConfig, sig2Name: e.target.value })}
                            className="w-full px-4 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:border-orange-500 focus:outline-none transition-colors"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Title / Role</label>
                          <input 
                            type="text"
                            value={certConfig.sig2Title}
                            onChange={(e) => setCertConfig({ ...certConfig, sig2Title: e.target.value })}
                            className="w-full px-4 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:border-orange-500 focus:outline-none transition-colors"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Organization</label>
                        <input 
                          type="text"
                          value={certConfig.sig2Org}
                          onChange={(e) => setCertConfig({ ...certConfig, sig2Org: e.target.value })}
                          className="w-full px-4 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:border-orange-500 focus:outline-none transition-colors"
                        />
                      </div>

                      {/* Right Signature Upload */}
                      <div className="space-y-1 bg-white/5 p-3 rounded-xl border border-white/10 mt-2">
                        <label className="text-[10px] font-bold text-orange-400 uppercase tracking-wide flex items-center justify-between">
                          <span>Right Signature Image</span>
                          {certConfig.sig2Image && <span className="text-[8px] text-green-400 font-extrabold uppercase">Uploaded</span>}
                        </label>
                        <div className="flex items-center gap-2">
                          {certConfig.sig2Image ? (
                            <img src={certConfig.sig2Image} className="w-16 h-8 rounded bg-white object-contain p-1 border border-white/20" alt="Sig2 preview" />
                          ) : (
                            <div className="w-16 h-8 rounded bg-black/50 border border-white/5 flex items-center justify-center text-slate-600 text-[9px] font-bold">No-Sig</div>
                          )}
                          <div className="flex-1">
                            <input 
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setCertConfig(prev => ({ ...prev, sig2Image: reader.result as string }));
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="hidden"
                              id="sig2-upload-input"
                            />
                            <div className="flex gap-1.5">
                              <label 
                                htmlFor="sig2-upload-input"
                                className="px-2 py-1 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-[9px] font-bold rounded cursor-pointer border border-orange-500/10 active:opacity-85 transition-colors uppercase"
                              >
                                {certConfig.sig2Image ? "Change" : "Upload"}
                              </label>
                              {certConfig.sig2Image && (
                                <button 
                                  type="button" 
                                  onClick={() => setCertConfig(prev => ({ ...prev, sig2Image: undefined }))}
                                  className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[9px] font-bold rounded border border-red-500/10 active:opacity-85 transition-colors uppercase"
                                >
                                  Clear
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <h4 className="text-xs font-bold text-orange-500 uppercase tracking-widest border-b border-white/5 pt-2 pb-2 flex items-center justify-between">
                        <span>Official Stamp Seal</span>
                        <label className="flex items-center gap-1.5 cursor-pointer normal-case text-[10px] font-bold text-slate-400 select-none">
                          <input 
                            type="checkbox"
                            checked={certConfig.showSeal !== false}
                            onChange={(e) => setCertConfig({ ...certConfig, showSeal: e.target.checked })}
                            className="rounded border-white/20 bg-white/5 text-orange-500 focus:ring-orange-500/50 w-3 h-3"
                          />
                          <span>Show Seal on Certificate</span>
                        </label>
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Center Text</label>
                          <input 
                            type="text"
                            value={certConfig.sealTitle}
                            onChange={(e) => setCertConfig({ ...certConfig, sealTitle: e.target.value })}
                            className="w-full px-4 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:border-orange-500 focus:outline-none transition-colors"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Top Sub</label>
                          <input 
                            type="text"
                            value={certConfig.sealSub1}
                            onChange={(e) => setCertConfig({ ...certConfig, sealSub1: e.target.value })}
                            className="w-full px-4 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:border-orange-500 focus:outline-none transition-colors"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Bottom Sub</label>
                          <input 
                            type="text"
                            value={certConfig.sealSub2}
                            onChange={(e) => setCertConfig({ ...certConfig, sealSub2: e.target.value })}
                            className="w-full px-4 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:border-orange-500 focus:outline-none transition-colors"
                          />
                        </div>
                      </div>

                      {/* Official Stamp Seal Image Upload Option */}
                      <div className="space-y-1 bg-white/5 p-3 rounded-xl border border-white/10 mt-2">
                        <label className="text-[10px] font-bold text-orange-400 uppercase tracking-wide flex items-center justify-between">
                          <span>Custom Seal Image (Optional Override)</span>
                          {certConfig.sealImage && <span className="text-[8px] text-green-400 font-extrabold uppercase">Uploaded</span>}
                        </label>
                        <div className="flex items-center gap-2">
                          {certConfig.sealImage ? (
                            <img src={certConfig.sealImage} className="w-12 h-12 rounded bg-white object-contain p-1 border border-white/20" alt="Seal preview" />
                          ) : (
                            <div className="w-12 h-12 rounded bg-black/50 border border-white/5 flex items-center justify-center text-slate-600 text-[9px] font-bold">No-Seal</div>
                          )}
                          <div className="flex-1">
                            <input 
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setCertConfig(prev => ({ ...prev, sealImage: reader.result as string }));
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="hidden"
                              id="seal-upload-input"
                            />
                            <div className="flex gap-1.5">
                              <label 
                                htmlFor="seal-upload-input"
                                className="px-2 py-1 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-[9px] font-bold rounded cursor-pointer border border-orange-500/10 active:opacity-85 transition-colors uppercase"
                              >
                                {certConfig.sealImage ? "Change" : "Upload"}
                              </label>
                              {certConfig.sealImage && (
                                <button 
                                  type="button" 
                                  onClick={() => setCertConfig(prev => ({ ...prev, sealImage: undefined }))}
                                  className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[9px] font-bold rounded border border-red-500/10 active:opacity-85 transition-colors uppercase"
                                >
                                  Clear
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Full Width: Citation Middle Text Overrides */}
                    <div className="col-span-1 md:col-span-2 space-y-4 border-t border-white/5 pt-4">
                      <div>
                        <h4 className="text-xs font-bold text-orange-500 uppercase tracking-widest pb-1 border-b border-white/5 flex items-center justify-between">
                          <span>Middle Description Text Override (Citation)</span>
                          <span className="text-[9px] text-slate-500 font-medium normal-case">Leave blank to use smart auto-generated dynamic texts</span>
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex justify-between">
                            <span>Line 1 (Achievement Designation)</span>
                            <span className="text-[9px] text-slate-600 font-bold lowercase">y: 374px</span>
                          </label>
                          <textarea 
                            rows={2}
                            value={certConfig.customDescLine1 || ''}
                            placeholder='e.g. for active commitment, high-spirited performance and successful participation as a Contestant'
                            onChange={(e) => setCertConfig({ ...certConfig, customDescLine1: e.target.value })}
                            className="w-full px-4 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:border-orange-500 focus:outline-none transition-colors placeholder:text-slate-700"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex justify-between">
                            <span>Line 2 (Representation & Category)</span>
                            <span className="text-[9px] text-slate-600 font-bold lowercase">y: 408px</span>
                          </label>
                          <textarea 
                            rows={2}
                            value={certConfig.customDescLine2 || ''}
                            placeholder='e.g. representing their respected institution in the category of General Scholars Group'
                            onChange={(e) => setCertConfig({ ...certConfig, customDescLine2: e.target.value })}
                            className="w-full px-4 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:border-orange-500 focus:outline-none transition-colors placeholder:text-slate-700"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex justify-between">
                            <span>Line 3 (Challenge / Event reference)</span>
                            <span className="text-[9px] text-slate-600 font-bold lowercase">y: 442px</span>
                          </label>
                          <textarea 
                            rows={2}
                            value={certConfig.customDescLine3 || ''}
                            placeholder='e.g. during the scientific challenge "Phoenix Supreme Olympiad"'
                            onChange={(e) => setCertConfig({ ...certConfig, customDescLine3: e.target.value })}
                            className="w-full px-4 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:border-orange-500 focus:outline-none transition-colors placeholder:text-slate-700"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex justify-between">
                            <span>Line 4 (Organizing Body Signature)</span>
                            <span className="text-[9px] text-slate-600 font-bold lowercase">y: 476px</span>
                          </label>
                          <textarea 
                            rows={2}
                            value={certConfig.customDescLine4 || ''}
                            placeholder='e.g. organized by - Team Phoenix.'
                            onChange={(e) => setCertConfig({ ...certConfig, customDescLine4: e.target.value })}
                            className="w-full px-4 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:border-orange-500 focus:outline-none transition-colors placeholder:text-slate-700"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("Reset layout to standard default values?")) {
                          setCertConfig(DEFAULT_CERT_CONFIG);
                        }
                      }}
                      className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-extrabold uppercase tracking-widest text-[10px] rounded-2xl transition-all cursor-pointer"
                    >
                      Reset Defaults
                    </button>
                    <button
                      type="button"
                      disabled={isSavingCertConfig}
                      onClick={() => handleSaveCertConfig(certConfig)}
                      className="px-7 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90 disabled:opacity-50 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-orange-500/10 cursor-pointer transition-all"
                    >
                      {isSavingCertConfig ? "Saving design..." : "Save Design Template"}
                    </button>
                  </div>
                </div>
              )}

              {/* Admin Panel Controls */}
              {isAdmin && (
                <div className="bg-[#111111] border border-white/5 rounded-[32px] p-6 md:p-8 space-y-6 max-w-4xl mx-auto mt-12 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 bg-orange-500/10 border-l border-b border-orange-500/20 text-orange-500 text-[8px] font-black tracking-widest uppercase rounded-bl-xl">Teacher Control</div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Users className="text-orange-500" size={20} /> Participant Spreadsheet Synchronizer
                    </h3>
                    <p className="text-slate-400 text-xs">Import high-volume student names from Google Sheets or Excel instantly to populate certificates.</p>
                  </div>

                  <div className="p-5 bg-[#151515] border border-white/5 rounded-2xl space-y-4">
                    <p className="text-slate-300 text-xs leading-relaxed font-semibold">
                      💡 <span className="font-bold text-white">How This Works:</span> Share your Google Sheet as <span className="text-orange-400 underline">"Anyone with the link can view"</span>, copy its browser web URL, paste it below, and click Sync. The columns will be auto-matched to map Student Names, Positions / Ranks, Roll Numbers, and Institution names!
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input 
                        type="text"
                        value={sheetUrl}
                        onChange={(e) => setSheetUrl(e.target.value)}
                        placeholder="Paste shared Google Sheets link..."
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 text-xs focus:border-orange-500 focus:outline-none"
                      />
                      <button
                        onClick={handleSyncGoogleSheet}
                        disabled={isSyncingSheet}
                        className="px-6 py-3 bg-orange-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-orange-600 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                      >
                        {isSyncingSheet ? 'Synchronizing...' : 'Sync from Sheet'}
                      </button>
                    </div>
                  </div>

                  {/* Excel Copy-Paste manual sync fallback */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-slate-300 font-bold text-xs uppercase tracking-wide">Fallback: Manual Spreadsheet Paste (CSV)</p>
                      <button 
                        onClick={() => {
                          setPastedCsv("Name,Roll,Status,Rank,Institution\nSamiul Islam,PX-101,Winner,1st Place,Kulaura Government High School\nTahmid Rahman,PX-102,Contestant,,Yousuf Ghani High School\nTasfia Salim,PX-103,Contestant,,Sylhet Cadet College");
                        }}
                        className="text-[10px] text-orange-400 hover:underline uppercase tracking-widest font-black"
                      >
                        Load Template Pattern
                      </button>
                    </div>
                    <textarea
                      value={pastedCsv}
                      onChange={(e) => setPastedCsv(e.target.value)}
                      placeholder="Name,Roll,Status,Rank,Institution&#10;Sadia Jahan,PX-034,Winner,1st Place,Kulaura Girls High School"
                      rows={5}
                      className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white font-mono placeholder-slate-600 text-xs focus:border-orange-500 focus:outline-none"
                    />
                    <button
                      onClick={async () => {
                        if (!pastedCsv.trim()) {
                          alert("Paste CSV data first");
                          return;
                        }
                        setIsSyncingSheet(true);
                        try {
                          const parsedRows = parseClientCSV(pastedCsv.trim());
                          if (parsedRows.length < 2) {
                            alert("Invalid data rows matched");
                            setIsSyncingSheet(false);
                            return;
                          }
                          const headers = parsedRows[0].map(h => h.trim().toLowerCase());
                          const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('student') || h.includes('নাম'));
                          const rollIdx = headers.findIndex(h => h.includes('roll') || h.includes('reg') || h.includes('id') || h.includes('রোল'));
                          const statusIdx = headers.findIndex(h => h.includes('status') || h.includes('category') || h.includes('অবস্থা'));
                          const rankIdx = headers.findIndex(h => h.includes('rank') || h.includes('place') || h.includes('র‍্যাংক'));
                          const instIdx = headers.findIndex(h => h.includes('institution') || h.includes('school') || h.includes('প্রতিষ্ঠান'));
                          
                          if (nameIdx === -1) {
                            alert("Header row must contain 'Name' column header!");
                            setIsSyncingSheet(false);
                            return;
                          }

                          // Fetch existing records first to maintain certificate_id stability
                          let oldParticipants = [];
                          try {
                            const listResp = await fetch('/api/olympiad?type=participants');
                            if (listResp.ok) {
                              const listData = await listResp.json();
                              if (listData && Array.isArray(listData.data)) {
                                oldParticipants = listData.data.filter((p: any) => p.olympiad_id === selectedEvent.id);
                              }
                            }
                          } catch (err) {
                            console.warn("Could not load current participant list:", err);
                          }

                          const certStabilityMap = new Map();
                          oldParticipants.forEach((p: any) => {
                            if (p.certificate_id) {
                              const k = `${p.name || ''}_${p.roll || ''}`.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
                              certStabilityMap.set(k, p.certificate_id);
                            }
                          });

                          const makeStableId = (name: string, roll: string) => {
                            const normName = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
                            const normRoll = roll.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
                            const seed = `${selectedEvent.id}-${normName}-${normRoll}`;
                            let hash = 0;
                            for (let j = 0; j < seed.length; j++) {
                              hash = (hash << 5) - hash + seed.charCodeAt(j);
                              hash = hash & hash;
                            }
                            const num = 100000 + (Math.abs(hash) % 900000);
                            return `PSO-${new Date().getFullYear()}-${num}`;
                          };

                          const finalDataset = [];
                          for (let i = 1; i < parsedRows.length; i++) {
                            const row = parsedRows[i];
                            if (!row[nameIdx] || !row[nameIdx].trim()) continue;

                            const sName = row[nameIdx].trim();
                            const sRoll = rollIdx !== -1 && row[rollIdx] ? row[rollIdx].trim() : String(100 + i);
                            const keyMatch = `${sName}_${sRoll}`.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

                            let stableCertId = '';
                            if (certStabilityMap.has(keyMatch)) {
                              stableCertId = certStabilityMap.get(keyMatch);
                            } else {
                              stableCertId = makeStableId(sName, sRoll);
                            }

                            finalDataset.push({
                              olympiad_id: selectedEvent.id,
                              name: sName,
                              roll: sRoll,
                              status: statusIdx !== -1 && row[statusIdx] ? row[statusIdx].trim() : 'Contestant',
                              rank: rankIdx !== -1 && row[rankIdx] ? row[rankIdx].trim() : null,
                              institution: instIdx !== -1 && row[instIdx] ? row[instIdx].trim() : null,
                              certificate_id: stableCertId
                            });
                          }

                          // Batch insert / delete manually
                          // We can send to consolidated delete table
                          await fetch(`/api/olympiad?type=participants&id=all&olympiad_id=${selectedEvent.id}`, { method: 'DELETE' })
                            .then(r => r.json()).catch(() => ({ error: null }));

                          let savedCount = 0;
                          for (let stud of finalDataset) {
                            const postResp = await fetch(`/api/olympiad?type=participants`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(stud)
                            });
                            if (postResp.ok) savedCount++;
                          }

                          alert(`Synced ${savedCount} records successfully and updated local store list!`);
                          setAllParticipantsCount(savedCount);
                          setPastedCsv('');
                        } catch (e: any) {
                          alert("CSV Parsing Error: " + e.message);
                        } finally {
                          setIsSyncingSheet(false);
                        }
                      }}
                      disabled={isSyncingSheet}
                      className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
                    >
                      {isSyncingSheet ? 'Syncing Paste...' : 'Sync Pasted CSV Data'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const getYoutubeEmbedUrl = (url: string) => {
    try {
      if (url.includes('embed/')) return url;
      const id = url.includes('v=') 
        ? url.split('v=')[1].split('&')[0] 
        : url.split('/').pop()?.split('?')[0];
      return `https://www.youtube.com/embed/${id}`;
    } catch (e) {
      return url;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] selection:bg-orange-500 selection:text-white">
      {selectedEvent ? EventDetailView() : (
        <>
          {HeroSection()}
          {EventsList()}
        </>
      )}

      {/* Hero Config Modal */}
      <AnimatePresence>
        {showConfigModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto pt-24 pb-8">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-white/10 p-10 rounded-[40px] w-full max-w-2xl space-y-8"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Olympiad Global Settings</h3>
                <button onClick={() => setShowConfigModal(false)} className="p-3 text-slate-400 hover:text-white"><X size={24} /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Hero Title</label>
                  <input 
                    value={olympiadTitle} 
                    onChange={e => setOlympiadTitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" 
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Description Text</label>
                  <textarea 
                    value={olympiadDesc} 
                    onChange={e => setOlympiadDesc(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold h-32" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Hero Image URL</label>
                  <input 
                    value={olympiadHeroImage} 
                    onChange={e => setOlympiadHeroImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Global Venue</label>
                  <input 
                    value={olympiadVenue} 
                    onChange={e => setOlympiadVenue(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Global Date</label>
                  <input 
                    value={olympiadDate} 
                    onChange={e => setOlympiadDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Global Reg Link</label>
                  <input 
                    value={olympiadRegLink} 
                    onChange={e => setOlympiadRegLink(e.target.value)}
                    placeholder="https://forms.gle/..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" 
                  />
                </div>
                <div className="md:col-span-2 flex gap-4 pt-4">
                  <button
                    onClick={handleSyncDatabase}
                    disabled={isSyncing}
                    className="flex-1 py-5 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all disabled:opacity-50"
                  >
                    {isSyncing ? 'Syncing...' : 'Master Sync DB'}
                  </button>
                  <button 
                    onClick={handleSaveHeroSettings}
                    disabled={isSavingHero}
                    className={`flex-[2] py-5 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all ${isSavingHero ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-600 active:scale-95'}`}
                  >
                    {isSavingHero ? 'Saving...' : 'Apply & Save Changes'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Management Modal */}
      <AnimatePresence>
        {showAdminModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto pt-24 pb-12">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-white/10 p-8 rounded-[40px] w-full max-w-2xl shadow-2xl space-y-8"
            >
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                   <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                    {editingItem?.id ? 'Edit' : 'Create'} {adminMode.charAt(0).toUpperCase() + adminMode.slice(1)}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Olympiad Management Console</p>
                </div>
                <button onClick={() => setShowAdminModal(false)} className="p-3 bg-white/5 text-slate-400 hover:text-white rounded-full">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data: any = Object.fromEntries(formData.entries());
                
                // Clean up empty strings to null or appropriate defaults
                Object.keys(data).forEach(key => {
                  if (data[key] === '') data[key] = null;
                });
                
                // Handle complex fields
                if (data.topics && typeof data.topics === 'string') {
                  data.topics = data.topics.split(',').map((t: string) => t.trim()).filter(Boolean);
                } else if (!data.topics && adminMode === 'speaker') {
                  data.topics = [];
                }
                // Only pass ID if it's not a dummy ID and we are editing
                if (editingItem?.id && !editingItem.id.startsWith('e')) {
                  data.id = editingItem.id;
                }
                
                if (editingItem?.olympiad_id && adminMode !== 'event') {
                  data.olympiad_id = editingItem.olympiad_id;
                }

                try {
                  const endpoint = `/api/olympiad?type=${adminMode}s`;
                  const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                  });
                  
                  let result;
                  const contentType = res.headers.get("content-type");
                  if (contentType && contentType.includes("application/json")) {
                    const rawResult = await res.json();
                    result = rawResult.data || rawResult;
                    if (rawResult.success === false) throw new Error(rawResult.error || "Server error");
                  } else {
                    const text = await res.text();
                    console.error("Non-JSON response from server:", text);
                    throw new Error("Server Error (Non-JSON): " + (text.substring(0, 100) || "Empty response from server"));
                  }

                  if (!res.ok) {
                    throw new Error(result.details || result.error || `Server Error (${res.status})`);
                  }
                  
                  // Reload data correctly
                  if (adminMode === 'event') {
                    // Fetch fresh list
                    const freshRes = await fetch('/api/olympiad?type=events');
                    const freshResult = await freshRes.json();
                    const freshEvents = freshResult.data || freshResult;
                    setEvents(Array.isArray(freshEvents) ? freshEvents : []);
                    
                    // If we just edited/created an event, ensure it's selected or updated
                    if (editingItem?.id) {
                      // Update selected event if it's the one we just edited
                      if (selectedEvent?.id === editingItem.id) {
                        const updated = Array.isArray(freshEvents) ? freshEvents.find((ev: any) => ev.id === editingItem.id) : null;
                        if (updated) setSelectedEvent(updated);
                      }
                    } else if (result.id) {
                      // If it's a NEW event, maybe select it?
                      const newcomer = Array.isArray(freshEvents) ? freshEvents.find((ev: any) => ev.id === result.id) : null;
                      if (newcomer) {
                        setSelectedEvent(newcomer);
                      }
                    }
                  } else if (selectedEvent) {
                    // Update details for specific event (speakers, resources, videos)
                    await fetchEventDetails(selectedEvent.id);
                  }
                  
                  setShowAdminModal(false);
                  setEditingItem(null);
                } catch (err: any) {
                  console.error("Save Error:", err);
                  alert("Save Failed: " + err.message);
                }
              }} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                
                {adminMode === 'event' && (
                  <>
                    <div className="md:col-span-2 space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Event Title</label>
                       <input name="title" defaultValue={editingItem?.title} required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Description</label>
                       <textarea name="description" defaultValue={editingItem?.description} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold h-24" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Date</label>
                      <input type="date" name="date" defaultValue={editingItem?.date} required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Banner URL</label>
                       <input name="banner_image" defaultValue={editingItem?.banner_image} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" placeholder="https://..." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Registration URL (Google Form)</label>
                      <input name="registration_url" defaultValue={editingItem?.registration_url} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" placeholder="https://forms.gle/..." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">External Info Link</label>
                      <input name="external_link" defaultValue={editingItem?.external_link} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" placeholder="https://..." />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Status</label>
                       <select name="status" defaultValue={editingItem?.status} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold">
                         <option value="Upcoming">Upcoming</option>
                         <option value="Running">Running</option>
                         <option value="Completed">Completed</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Target Group (e.g. SSC/HSC)</label>
                      <input name="target_group" defaultValue={editingItem?.target_group} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" placeholder="SSC to HSC" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Venue</label>
                      <input name="venue" defaultValue={editingItem?.venue} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" placeholder="Kulaura, Moulvibazar" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Registration Deadline</label>
                      <input name="deadline" defaultValue={editingItem?.deadline} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" placeholder="20 May 2026" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Syllabus / Short Topics</label>
                       <textarea name="syllabus" defaultValue={editingItem?.syllabus} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold h-20" placeholder="Basic Science, IQ, Reasoning..." />
                    </div>
                  </>
                )}

                {adminMode === 'speaker' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Speaker Name</label>
                      <input name="name" defaultValue={editingItem?.name} required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">University</label>
                      <input name="university" defaultValue={editingItem?.university} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Department</label>
                      <input name="department" defaultValue={editingItem?.department} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Image URL</label>
                      <input name="image" defaultValue={editingItem?.image} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" placeholder="https://..." />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">External Profile Link (LinkedIn/ResearchGate)</label>
                      <input name="external_link" defaultValue={editingItem?.external_link} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" placeholder="https://..." />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Topics (comma separated)</label>
                      <input name="topics" defaultValue={editingItem?.topics?.join(', ')} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" placeholder="AI in Medicine, Robotics, ..." />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Short Bio</label>
                      <textarea name="bio" defaultValue={editingItem?.bio} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold h-24" />
                    </div>
                  </>
                )}

                {adminMode === 'resource' && (
                  <>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Resource Title</label>
                      <input name="title" defaultValue={editingItem?.title} required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Type</label>
                       <select name="type" defaultValue={editingItem?.type} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold">
                         {RESOURCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                       </select>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">File URL / Drive Link</label>
                      <input name="url" defaultValue={editingItem?.url} required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" />
                    </div>
                  </>
                )}

                {adminMode === 'video' && (
                  <>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Video Title</label>
                      <input name="title" defaultValue={editingItem?.title} required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">YouTube URL</label>
                      <input name="youtube_url" defaultValue={editingItem?.youtube_url} required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold" placeholder="https://youtube.com/watch?v=..." />
                    </div>
                  </>
                )}

                <div className="md:col-span-2 pt-6">
                  <button type="submit" className="w-full py-5 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest transform transition-all active:scale-95 shadow-xl shadow-orange-500/20">
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Olympiad;
