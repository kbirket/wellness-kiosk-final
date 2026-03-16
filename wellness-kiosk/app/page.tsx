// @ts-nocheck
'use client';
import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { 
  Users, Search, QrCode, CreditCard, X, CheckCircle, 
  AlertCircle, TrendingUp, Calendar, MapPin, Mail, LogOut, 
  ShieldCheck, Phone, Activity, ChevronRight, LayoutDashboard,
  Filter, Download, Bell, FileText, Plus, Smartphone, Clock, Camera, UserCircle, Lock
} from 'lucide-react';

const QRCode = ({ data, size = 160, darkColor = '#001f3f' }) => {
  const hexColor = darkColor.replace('#', '');
  const safeData = encodeURIComponent(data || "WC-000");
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${safeData}&color=${hexColor}&bgcolor=ffffff`;
  return <img src={qrUrl} alt="QR Code" style={{ width: size, height: size, display: 'block' }} />;
};

const LOGO_URL = 'https://pattersonhc.org/sites/default/files/wellness_white.png';
const DIRECTORS = [
  { username: 'admin', password: 'admin2026', name: 'System Admin', center: 'both' },
  { username: 'harper', password: 'harper2026', name: 'Harper Director', center: 'harper' },
  { username: 'anthony', password: 'anthony2026', name: 'Anthony Director', center: 'anthony' }
];

export default function WellnessHub() {
  const [isMounted, setIsMounted] = useState(false);
  const [currentDateString, setCurrentDateString] = useState('');
  const [view, setView] = useState('landing'); 
  const [user, setUser] = useState(null);
  const [activeMember, setActiveMember] = useState(null);
  
  const [members, setMembers] = useState([]);
  const [visits, setVisits] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingCenter, setViewingCenter] = useState('both');
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // NEW: State to hold the Airtable error if members fail to load!
  const [apiError, setApiError] = useState('');
  
  const [scannerActive, setScannerActive] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [kioskMessage, setKioskMessage] = useState({text: '', type: '', subtext: ''});
  const [kioskInput, setKioskInput] = useState('');
  const [pinModal, setPinModal] = useState(null); 
  const [pinInput, setPinInput] = useState('');

  const membersRef = useRef(members);
  useEffect(() => { membersRef.current = members; }, [members]);
  const centerRef = useRef(viewingCenter);
  useEffect(() => { centerRef.current = viewingCenter; }, [viewingCenter]);

  useEffect(() => {
    setIsMounted(true);
    setCurrentDateString(new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }));
    const savedUser = localStorage.getItem('wellnessUser');
    const savedCenter = localStorage.getItem('wellnessCenter');
    if (savedUser) { setUser(JSON.parse(savedUser)); setView('dashboard'); }
    if (savedCenter) setViewingCenter(savedCenter);
  }, []);

  const handleLogin = () => {
    const u = document.getElementById('u_in').value.toLowerCase().trim();
    const p = document.getElementById('p_in').value.trim();
    const found = DIRECTORS.find(d => d.username === u && d.password === p);
    if(found) { 
      setUser(found); setViewingCenter(found.center); 
      localStorage.setItem('wellnessUser', JSON.stringify(found));
      localStorage.setItem('wellnessCenter', found.center);
      setView('dashboard'); 
    } else { alert('Incorrect credentials.'); }
  };

  const handleLogout = () => {
    setUser(null); localStorage.removeItem('wellnessUser'); localStorage.removeItem('wellnessCenter'); setView('landing');
  };

  useEffect(() => {
    setLoading(true);
    fetch('/api/members')
      .then(res => res.json())
      .then(data => {
        // CATCHING THE ERROR RIGHT HERE!
        if (data.error) {
           const errMsg = data.error.message || data.error.type || JSON.stringify(data.error);
           setApiError(errMsg);
           setLoading(false);
           return;
        }

        if (data.records) {
          const mapped = data.records.map(r => {
            let planText = r.fields['Plan Name'] ? (Array.isArray(r.fields['Plan Name']) ? r.fields['Plan Name'][0] : r.fields['Plan Name']) : 'UNKNOWN PLAN';
            return {
              airtableId: r.id, 
              id: r.fields['Member ID'] || r.id,
              firstName: r.fields['First Name'] || 'Unknown',
              lastName: r.fields['Last Name'] || '',
              email: r.fields['Email'] || '',
              phone: r.fields['Phone'] || '',
              password: String(r.fields['Password'] || '').trim(), 
              status: (r.fields['Membership Status'] || 'ACTIVE').toUpperCase(),
              type: String(planText).toUpperCase().trim(),
              center: r.fields['Home Center'] || 'Anthony',
              visits: Number(r.fields['Total Visits'] || 0),
              nextPayment: r.fields['Next Payment Due'] || null,
              sponsor: !!r.fields['Corporate Sponsor'],
            };
          });
          setMembers(mapped);
          setApiError(''); // Clear error if successful
        }
        setLoading(false);
      }).catch(err => {
         setApiError(err.message || "Failed to fetch from Vercel");
         setLoading(false);
      });
  }, []);

  const scopedMembers = members.filter(m => viewingCenter === 'both' || (m.center && m.center.toLowerCase().includes(viewingCenter)));
  const filteredMembers = scopedMembers.filter(m => `${m.firstName} ${m.lastName} ${m.id}`.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredVisits = visits.filter(v => viewingCenter === 'both' || (v.center && v.center.toLowerCase().includes(viewingCenter)));
  
  const kioskMatches = kioskInput.length >= 2 
    ? members.filter(m => (m.firstName + ' ' + m.lastName).toLowerCase().includes(kioskInput.toLowerCase()) || m.id.toLowerCase().includes(kioskInput.toLowerCase())).slice(0, 5)
    : [];

  const heatmapData = Array(15).fill(0);
  filteredVisits.forEach(v => {
    const hour = new Date(v.time).getHours();
    if (hour >= 6 && hour <= 20) heatmapData[hour - 6]++;
  });
  const maxVisits = Math.max(...heatmapData, 1);

  const stats = {
    total: scopedMembers.length,
    active: scopedMembers.filter(m => m.status === 'ACTIVE').length,
    overdue: scopedMembers.filter(m => m.status === 'OVERDUE').length,
    expiring: scopedMembers.filter(m => m.status === 'EXPIRING').length,
    today: filteredVisits.length
  };

  const reportStats = {
    single: scopedMembers.filter(m => m.type === 'SINGLE').length,
    family: scopedMembers.filter(m => m.type === 'FAMILY').length,
    seniorCitizen: scopedMembers.filter(m => m.type === 'SENIOR CITIZEN').length,
    seniorFamily: scopedMembers.filter(m => m.type === 'SENIOR FAMILY').length,
    student: scopedMembers.filter(m => m.type.includes('STUDENT')).length,
    corporate: scopedMembers.filter(m => m.type === 'CORPORATE').length,
    corporateFamily: scopedMembers.filter(m => m.type === 'CORPORATE FAMILY').length,
    dayPass: scopedMembers.filter(m => m.type.includes('DAY PASS')).length,
    staff: scopedMembers.filter(m => m.type.includes('HD6') || m.type.includes('HCHF')).length,
  };
  
  const corpOnly = scopedMembers.filter(m => m.sponsor || m.type?.includes('CORPORATE'));
  const corpStats = {
    single: corpOnly.filter(m => m.type?.includes('SINGLE') || m.type?.includes('MONTHLY') || m.type?.includes('ANNUAL')).length,
    family: corpOnly.filter(m => m.type?.includes('FAMILY') && !m.type?.includes('SENIOR') && !m.type?.includes('STUDENT')).length,
    student: corpOnly.filter(m => m.type?.includes('STUDENT')).length,
    senior: corpOnly.filter(m => m.type?.includes('SENIOR') && !m.type?.includes('FAMILY')).length,
    famStudent: corpOnly.filter(m => m.type?.includes('FAMILY') && m.type?.includes('STUDENT')).length,
    famSenior: corpOnly.filter(m => m.type?.includes('FAMILY') && m.type?.includes('SENIOR')).length,
  };

  const familyMembers = activeMember 
    ? members.filter(m => m.id !== activeMember.id && ((m.email && m.email.toLowerCase() === activeMember.email.toLowerCase()) || (m.phone && m.phone === activeMember.phone)))
    : [];

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    const newEmail = document.getElementById('edit_email').value.trim();
    const newPhone = document.getElementById('edit_phone').value.trim();
    setActiveMember({...activeMember, email: newEmail, phone: newPhone});
    setEditMode(false);
    try {
      await fetch('/api/update-member', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ airtableId: activeMember.airtableId, email: newEmail, phone: newPhone }) });
    } catch (err) { alert("App updated locally."); }
    setIsUpdating(false);
  };

  const getStoplight = (member) => {
    if (!member.nextPayment) return 'green'; 
    const due = new Date(member.nextPayment);
    const today = new Date();
    const diffTime = today - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    if (diffDays <= 0) return 'green'; 
    if (diffDays > 0 && diffDays <= 14) return 'yellow'; 
    return 'red'; 
  };

  const processCheckIn = async (memberId, method = "Manual Entry") => {
    const id = memberId.toUpperCase().trim();
    const m = membersRef.current.find(m => m.id === id); 
    
    if(m) {
      const light = getStoplight(m);
      if (light === 'red') {
         setKioskMessage({ text: `Account Locked`, type: 'error', subtext: 'Please see the front desk to update payment.' });
         setTimeout(() => setKioskMessage({ text: '', type: '', subtext: '' }), 4500);
         return false; 
      }

      const currentCenter = centerRef.current;
      const scanCenter = currentCenter === 'both' ? m.center : currentCenter.charAt(0).toUpperCase() + currentCenter.slice(1);
      const currentTime = new Date().toISOString();

      try {
        setKioskMessage({ text: `Syncing...`, type: 'warning', subtext: 'Connecting to database...' });

        const res = await fetch('/api/visits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ airtableId: m.airtableId, center: scanCenter, time: currentTime, method: method })
        });
        
        const result = await res.json();
        
        if (!result.success) {
           console.error("Airtable rejected the save:", result.error);
           setKioskMessage({ text: `Airtable Error!`, type: 'error', subtext: `Error: ${result.error}` });
           setTimeout(() => setKioskMessage({ text: '', type: '', subtext: '' }), 8000);
           return false;
        }

        setVisits(prev => [{name: m.firstName + ' ' + m.lastName, center: scanCenter, time: currentTime, type: m.type}, ...prev]);
        setMembers(prev => prev.map(member => member.id === id ? { ...member, visits: member.visits + 1 } : member));
        if (activeMember && activeMember.id === id) setActiveMember(prev => ({...prev, visits: prev.visits + 1}));

        if (light === 'yellow') {
           setKioskMessage({ text: `Welcome, ${m.firstName}!`, type: 'warning', subtext: 'Friendly reminder: Your account is past due.' });
        } else {
           setKioskMessage({ text: `Welcome, ${m.firstName}!`, type: 'success', subtext: '' });
        }
        setTimeout(() => setKioskMessage({ text: '', type: '', subtext: '' }), 3500); 
        return true;

      } catch (err) { 
        setKioskMessage({ text: `Network Error`, type: 'error', subtext: err.message });
        setTimeout(() => setKioskMessage({ text: '', type: '', subtext: '' }), 5000);
        return false;
      }
    } else {
      setKioskMessage({ text: `ID not found.`, type: 'error', subtext: 'Cannot check in until Members list fully loads!' });
      setTimeout(() => setKioskMessage({ text: '', type: '', subtext: '' }), 3500);
      return false;
    }
  };

  useEffect(() => {
    let scanner = null;
    if (view === 'secret_scanner' && scannerActive) {
      scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: {width: 280, height: 280} }, false);
      scanner.render((decodedText) => {
        processCheckIn(decodedText, "Camera Scan");
      }, () => {});
    }
    return () => { if(scanner) scanner.clear().catch(e => console.error(e)); };
  }, [view, scannerActive]); 

  const handleExportCSV = () => {
    if (filteredMembers.length === 0) return;
    const headers = ["Member ID", "First Name", "Last Name", "Email", "Phone", "Membership Type", "Home Center", "Status", "Total Visits", "Next Payment"];
    const csvRows = [headers.join(','), ...filteredMembers.map(m => `"${m.id}","${m.firstName}","${m.lastName}","${m.email}","${m.phone}","${m.type}","${m.center}","${m.status}","${m.visits}","${m.nextPayment}"`)].join('\n');
    const blob = new Blob([csvRows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `Wellness_Members_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); window.URL.revokeObjectURL(url);
  };

  const handleMonthlySummary = () => {
    const centerName = viewingCenter === 'both' ? 'System-Wide' : viewingCenter.charAt(0).toUpperCase() + viewingCenter.slice(1);
    const csvContent = `
${centerName} Wellness Center ${currentDateString} Summary

STANDARD MEMBERSHIPS
Single:,${reportStats.single}
Family:,${reportStats.family}
Senior Citizen:,${reportStats.seniorCitizen}
Senior Family:,${reportStats.seniorFamily}
Student (14-22):,${reportStats.student}

CORPORATE & STAFF
Corporate:,${reportStats.corporate}
Corporate Family:,${reportStats.corporateFamily}
HD6/HCHF (Staff):,${reportStats.staff}

OTHER INFORMATION
Day Passes:,${reportStats.dayPass}
Total Members:,${stats.total}
`;
    const blob = new Blob([csvContent.trim()], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `${centerName}_Monthly_Summary.csv`;
    a.click(); window.URL.revokeObjectURL(url);
  };

  const ProStatCard = ({ value, label, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200" style={{ borderLeft: `6px solid ${color}` }}>
      <p className="text-5xl font-extrabold mb-1" style={{ color }}>{value}</p>
      <p className="text-xs font-bold text-[#001f3f] uppercase tracking-tight">{label}</p>
    </div>
  );

  const ProListCard = ({ title, children, actions }) => (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-[#001f3f]">{title}</h3>
        {actions}
      </div>
      {children}
    </div>
  );

  if (!isMounted) return <div className="min-h-screen bg-[#001f3f]" />;

  // ============================================================
  // VIEW: LANDING PAGE
  // ============================================================
  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-[#001f3f] flex items-center justify-center font-sans p-6 relative">
        <div className="text-center max-w-5xl w-full relative z-10">
          <img src={LOGO_URL} alt="Logo" className="h-40 mx-auto mb-16 opacity-100 drop-shadow-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <button onClick={() => setView('login')} className="bg-white/10 border border-white/20 p-10 rounded-3xl text-white hover:bg-white/20 transition-all flex flex-col items-center gap-4 group">
                <ShieldCheck size={56} className="text-[#f59e0b] group-hover:scale-110 transition-transform" />
                <span className="text-xl font-bold">Director Portal</span>
             </button>
             <button onClick={() => {setView('kiosk'); setViewingCenter('both'); setKioskInput('');}} className="bg-white/10 border border-white/20 p-10 rounded-3xl text-white hover:bg-white/20 transition-all flex flex-col items-center gap-4 group">
                <Smartphone size={56} className="text-[#1080ad] group-hover:scale-110 transition-transform" />
                <span className="text-xl font-bold">Public Kiosk</span>
             </button>
             <button onClick={() => setView('member_login')} className="bg-white/10 border border-white/20 p-10 rounded-3xl text-white hover:bg-white/20 transition-all flex flex-col items-center gap-4 group border-b-4 border-b-[#16a34a]">
                <UserCircle size={56} className="text-[#16a34a] group-hover:scale-110 transition-transform" />
                <span className="text-xl font-bold">Member Portal</span>
             </button>
          </div>
        </div>
        <button onClick={() => {setView('secret_scanner'); setViewingCenter('both');}} className="absolute bottom-6 right-6 opacity-10 hover:opacity-50 transition-opacity p-4">
           <Lock size={20} className="text-white"/>
        </button>
      </div>
    );
  }

  // ============================================================
  // VIEW: LOCKED-DOWN KIOSK MODE
  // ============================================================
  if (view === 'kiosk') {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
         <button onClick={() => {setView('landing');}} className="absolute top-6 left-6 text-slate-400 hover:text-[#001f3f] flex items-center gap-2 font-bold z-10"><LogOut size={20}/> Staff Exit</button>
         
         {kioskMessage.text && (
           <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center transition-all duration-300 
             ${kioskMessage.type === 'success' ? 'bg-[#16a34a]' : kioskMessage.type === 'warning' ? 'bg-[#eab308]' : 'bg-red-600'}`}>
              {kioskMessage.type === 'success' ? <CheckCircle size={120} className="text-white mb-8 animate-bounce" /> : <AlertCircle size={120} className="text-white mb-8 animate-bounce" />}
              <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter text-center px-4 shadow-sm">{kioskMessage.text}</h1>
              {kioskMessage.subtext && <p className="text-2xl text-white/90 mt-6 font-bold tracking-tight">{kioskMessage.subtext}</p>}
           </div>
         )}

         {pinModal && (
           <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#001f3f]/90 backdrop-blur-sm p-4">
              <div className="bg-white p-12 rounded-[3rem] text-center max-w-sm w-full relative shadow-2xl">
                 <button onClick={() => {setPinModal(null); setPinInput('');}} className="absolute top-6 right-6 text-slate-300 hover:text-red-500"><X size={24}/></button>
                 <Lock size={48} className="text-[#1080ad] mx-auto mb-6" />
                 <h3 className="text-3xl font-black text-[#001f3f] mb-2 tracking-tight">Security PIN</h3>
                 <p className="text-slate-500 font-medium mb-8">Enter your 4-digit birth month and day (MMDD)</p>
                 <input 
                   type="password" 
                   maxLength={4}
                   value={pinInput}
                   onChange={e => setPinInput(e.target.value)}
                   onKeyDown={(e) => {
                     if (e.key === 'Enter') document.getElementById('btn_submit_pin').click();
                   }}
                   className="w-full p-6 text-center text-4xl tracking-[0.5em] border-2 rounded-2xl mb-8 outline-none focus:border-[#1080ad] bg-slate-50"
                   autoFocus
                 />
                 <button id="btn_submit_pin" onClick={() => {
                    if (!pinModal.password || pinInput === pinModal.password) {
                        processCheckIn(pinModal.id, "Kiosk Search & PIN");
                        setPinModal(null);
                        setPinInput('');
                    } else {
                        alert("Incorrect PIN. Please try again or see the front desk.");
                    }
                 }} className="w-full bg-[#1080ad] text-white p-5 rounded-2xl font-bold text-xl shadow-lg hover:bg-blue-800 transition-colors">Verify</button>
              </div>
           </div>
         )}

         <div className="bg-white rounded-[3rem] shadow-2xl p-12 w-full max-w-2xl border-t-8 border-[#1080ad] text-center relative z-0">
            <h2 className="text-5xl font-black text-[#001f3f] mb-4 tracking-tight">Check-In</h2>
            <p className="text-slate-500 mb-12 text-lg font-medium">Type your last name or scan your physical badge.</p>
            
            <div className="relative w-full max-w-md mx-auto mb-10">
              <div className="flex gap-4">
                 <input 
                   className="flex-1 p-6 border-2 rounded-2xl outline-none focus:border-[#1080ad] font-sans text-2xl text-center bg-slate-50" 
                   placeholder="e.g. Smith" 
                   value={kioskInput}
                   onChange={(e) => setKioskInput(e.target.value)}
                   onKeyDown={(e) => {
                     if (e.key === 'Enter') {
                       processCheckIn(kioskInput, "Manual ID Entry");
                       setKioskInput('');
                     }
                   }}
                 />
                 <button onClick={() => {
                   processCheckIn(kioskInput, "Manual ID Entry");
                   setKioskInput('');
                 }} className="bg-[#001f3f] text-white px-10 rounded-2xl font-bold text-xl hover:bg-blue-900 transition-colors shadow-lg">Go</button>
              </div>

              {kioskMatches.length > 0 && (
                <div className="absolute bottom-[115%] left-0 w-full mb-2 bg-white border-2 border-[#1080ad] rounded-2xl shadow-2xl z-30 overflow-hidden text-left flex flex-col-reverse">
                  {kioskMatches.map(m => (
                    <button 
                      key={m.id} 
                      onClick={() => {
                        setPinModal(m); 
                        setKioskInput('');
                      }}
                      className="w-full p-5 border-b border-slate-100 hover:bg-blue-50 transition-colors flex justify-between items-center group"
                    >
                       <div>
                         <p className="font-bold text-[#001f3f] text-xl">{m.firstName} {m.lastName}</p>
                         <p className="text-xs text-slate-400 font-mono tracking-widest">{m.id}</p>
                       </div>
                       <div className="bg-[#1080ad] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md group-hover:scale-105 transition-transform">
                         Tap to Check In
                       </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <img src={LOGO_URL} alt="Logo" className="h-10 mx-auto opacity-30 invert grayscale" />
         </div>
      </div>
    );
  }

  // ============================================================
  // VIEW: SECRET SCANNER PAGE
  // ============================================================
  if (view === 'secret_scanner') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 font-sans relative">
         <button onClick={() => {setView('landing'); setScannerActive(false);}} className="absolute top-6 left-6 text-white/50 hover:text-white flex items-center gap-2 font-bold z-10"><LogOut size={20}/> Exit Scanner</button>
         
         {kioskMessage.text && (
           <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center transition-all duration-300 
             ${kioskMessage.type === 'success' ? 'bg-[#16a34a]' : kioskMessage.type === 'warning' ? 'bg-[#eab308]' : 'bg-red-600'}`}>
              <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter text-center px-4">{kioskMessage.text}</h1>
              {kioskMessage.subtext && <p className="text-2xl text-white/90 mt-6 font-bold tracking-tight">{kioskMessage.subtext}</p>}
           </div>
         )}

         <div className="w-full max-w-lg mx-auto bg-slate-900 border-4 border-slate-800 rounded-3xl overflow-hidden min-h-[400px] flex flex-col items-center justify-center">
            {!scannerActive ? (
              <button onClick={() => setScannerActive(true)} className="bg-[#1080ad] text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2">
                Turn On Camera
              </button>
            ) : (
              <div id="reader" className="w-full h-full"></div>
            )}
         </div>
      </div>
    );
  }

  // ============================================================
  // VIEW: MEMBER LOGIN
  // ============================================================
  if (view === 'member_login') {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-[3rem] shadow-2xl p-10 w-full max-w-md border-t-8 border-[#16a34a]">
          <div className="flex justify-center mb-6"><UserCircle size={64} className="text-[#16a34a]" /></div>
          <h2 className="text-3xl font-black text-center text-[#001f3f] mb-2 tracking-tight">Member Access</h2>
          <p className="text-slate-500 mb-8 text-center font-medium">Log in to view your digital badge.</p>
          
          <div className="space-y-4">
            <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-2">Email Address</label><input type="email" placeholder="you@email.com" id="m_email" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#16a34a] text-lg transition-colors" /></div>
            <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-2">Member ID</label><input type="text" placeholder="e.g. WC-001" id="m_id" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#16a34a] text-lg uppercase transition-colors" onKeyDown={(e) => { if (e.key === 'Enter') document.getElementById('btn_member_login').click(); }}/></div>
          </div>

          <button id="btn_member_login" onClick={() => {
            const email = document.getElementById('m_email').value.toLowerCase().trim();
            const id = document.getElementById('m_id').value.toUpperCase().trim();
            const foundMember = members.find(m => m.id === id && m.email.toLowerCase() === email);
            if(foundMember) { setActiveMember(foundMember); setView('member_portal'); } 
            else { alert('Member not found.'); }
          }} className="w-full bg-[#16a34a] text-white p-5 rounded-2xl font-bold text-lg shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all mt-8">Access My Badge</button>
          
          <button onClick={() => setView('landing')} className="w-full mt-6 text-slate-400 font-bold hover:text-slate-600 transition-colors">Return to Home</button>
        </div>
      </div>
    );
  }

  // ============================================================
  // VIEW: MEMBER PORTAL DASHBOARD
  // ============================================================
  if (view === 'member_portal' && activeMember) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] font-sans pb-20 md:pb-0">
        <nav className="bg-[#001f3f] text-white p-4 shadow-md flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-3">
             <img src={LOGO_URL} alt="Logo" className="h-6" /> 
             <span className="font-bold tracking-tight border-l border-white/20 pl-3">Wellness Portal</span>
          </div>
          <button onClick={() => { setActiveMember(null); setView('landing'); }} className="text-white/60 hover:text-white flex items-center gap-2 text-sm font-medium">
             <LogOut size={16}/> Sign Out
          </button>
        </nav>

        <main className="max-w-md mx-auto p-4 space-y-6 mt-6">
           <div>
             <h1 className="text-3xl font-black text-[#001f3f] tracking-tight mb-1">Hi, {activeMember.firstName}!</h1>
             <p className="text-slate-500
