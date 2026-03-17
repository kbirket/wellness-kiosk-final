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

// NEW: Beautiful, Native CSS Donut Chart Component!
const DonutChart = ({ data, totalLabel }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  let currentPercent = 0;
  const stops = data.filter(d => d.value > 0).map(d => {
     const percent = (d.value / total) * 100;
     const stop = `${d.color} ${currentPercent}% ${currentPercent + percent}%`;
     currentPercent += percent;
     return stop;
  }).join(', ');
  
  return (
     <div className="flex items-center justify-center gap-8">
       <div className="relative w-48 h-48 rounded-full shadow-sm" style={{ background: stops ? `conic-gradient(${stops})` : '#e2e8f0' }}>
          <div className="absolute inset-5 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
             <span className="text-3xl font-black text-[#001f3f] leading-none">{total === 1 && data.every(d => d.value === 0) ? 0 : data.reduce((s,d)=>s+d.value,0)}</span>
             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{totalLabel}</span>
          </div>
       </div>
       <div className="space-y-2 flex-1">
         {data.filter(d => d.value > 0).map((d, i) => (
           <div key={i} className="flex justify-between items-center text-sm border-b border-slate-50 last:border-0 pb-1">
             <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></span>
                <span className="font-bold text-slate-600">{d.label}</span>
             </div>
             <span className="font-black text-[#001f3f]">{d.value}</span>
           </div>
         ))}
       </div>
     </div>
  );
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
  const [apiError, setApiError] = useState('');
  
  const [scannerActive, setScannerActive] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

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
              needsOrientation: !!r.fields['Needs Orientation'], 
            };
          });
          setMembers(mapped);
          setApiError(''); 
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
    military: scopedMembers.filter(m => m.type.includes('MILITARY')).length,
  };
  
  // Data for the Pie Charts!
  const planChartData = [
    { label: 'Single', value: reportStats.single, color: '#1080ad' },
    { label: 'Family', value: reportStats.family, color: '#f59e0b' },
    { label: 'Senior', value: reportStats.seniorCitizen + reportStats.seniorFamily, color: '#16a34a' },
    { label: 'Student', value: reportStats.student, color: '#8b5cf6' },
    { label: 'Corporate', value: reportStats.corporate + reportStats.corporateFamily, color: '#ef4444' },
    { label: 'Other (Staff/Mil/Pass)', value: reportStats.staff + reportStats.military + reportStats.dayPass, color: '#64748b' }
  ];

  const statusChartData = [
    { label: 'Active', value: stats.active, color: '#16a34a' },
    { label: 'Expiring Soon', value: stats.expiring, color: '#f59e0b' },
    { label: 'Overdue / Locked', value: stats.overdue, color: '#ef4444' },
  ];

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

  const handleAddMemberSubmit = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    const newMemberData = {
        firstName: e.target.fname.value,
        lastName: e.target.lname.value,
        email: e.target.email.value,
        phone: e.target.phone.value,
        plan: e.target.plan.value,
        center: e.target.center.value,
        // NEW: Grabbing the birthday from the form!
        birthday: e.target.birthday.value,
    };

    try {
        const res = await fetch('/api/add-member', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newMemberData)
        });
        const result = await res.json();
        
        if (result.success) {
            setShowAddModal(false);
            window.location.reload(); 
        } else {
            alert('Error adding member: ' + result.error);
        }
    } catch (err) {
        alert('Network error. Please try again.');
    }
    setIsAdding(false);
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
      if (m.needsOrientation) {
         setKioskMessage({ text: `Orientation Required`, type: 'error', subtext: 'Please see front desk to complete your orientation.' });
         setTimeout(() => setKioskMessage({ text: '', type: '', subtext: '' }), 5000);
         return false; 
      }

      const light = getStoplight(m);
      if (light === 'red') {
         setKioskMessage({ text: `Please see front desk.`, type: 'error', subtext: 'We need to quickly update your account.' });
         setTimeout(() => setKioskMessage({ text: '', type: '', subtext: '' }), 4500);
         return false; 
      }

      const currentCenter = centerRef.current;
      const scanCenter = currentCenter === 'both' ? m.center : currentCenter.charAt(0).toUpperCase() + currentCenter.slice(1);
      const currentTime = new Date().toISOString();

      try {
        const res = await fetch('/api/visits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ airtableId: m.airtableId, center: scanCenter, time: currentTime, method: method })
        });
        
        const result = await res.json();
        
        if (!result.success) {
           console.error("Airtable rejected the save:", result.error);
           setKioskMessage({ text: `System Error`, type: 'error', subtext: `Please see the front desk.` });
           setTimeout(() => setKioskMessage({ text: '', type: '', subtext: '' }), 4000);
           return false;
        }

        setVisits(prev => [{name: m.firstName + ' ' + m.lastName, center: scanCenter, time: currentTime, type: m.type}, ...prev]);
        setMembers(prev => prev.map(member => member.id === id ? { ...member, visits: member.visits + 1 } : member));
        if (activeMember && activeMember.id === id) setActiveMember(prev => ({...prev, visits: prev.visits + 1}));

        if (light === 'yellow') {
           setKioskMessage({ text: `Welcome, ${m.firstName}!`, type: 'warning', subtext: 'Please see the front desk at your convenience.' });
        } else {
           setKioskMessage({ text: `Welcome, ${m.firstName}!`, type: 'success', subtext: '' });
        }
        setTimeout(() => setKioskMessage({ text: '', type: '', subtext: '' }), 3500); 
        return true;

      } catch (err) { 
        setKioskMessage({ text: `Network Error`, type: 'error', subtext: 'Please try again.' });
        setTimeout(() => setKioskMessage({ text: '', type: '', subtext: '' }), 4000);
        return false;
      }
    } else {
      setKioskMessage({ text: `ID not found.`, type: 'error', subtext: 'Please see front desk.' });
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

CORPORATE, STAFF & MILITARY
Corporate:,${reportStats.corporate}
Corporate Family:,${reportStats.corporateFamily}
HD6/HCHF (Staff):,${reportStats.staff}
Active Military (Free):,${reportStats.military}

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

  if (view === 'kiosk') {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
         <button onClick={() => {setView('landing');}} className="absolute top-6 left-6 text-slate-400 hover:text-[#001f3f] flex items-center gap-2 font-bold z-10"><LogOut size={20}/> Staff Exit</button>
         
         {kioskMessage.text && (
           <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#001f3f]/40 backdrop-blur-sm p-4 transition-all duration-300">
              <div className={`bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md text-center border-t-8 ${kioskMessage.type === 'success' ? 'border-[#16a34a]' : kioskMessage.type === 'warning' ? 'border-[#eab308]' : 'border-red-600'}`}>
                 {kioskMessage.type === 'success' ? (
                    <CheckCircle size={72} className="text-[#16a34a] mx-auto mb-6" />
                 ) : (
                    <AlertCircle size={72} className={`mx-auto mb-6 ${kioskMessage.type === 'warning' ? 'text-[#eab308]' : 'text-red-600'}`} />
                 )}
                 <h1 className="text-3xl font-black text-[#001f3f] tracking-tight mb-2">{kioskMessage.text}</h1>
                 {kioskMessage.subtext && <p className="text-slate-500 font-medium text-lg">{kioskMessage.subtext}</p>}
              </div>
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
            <p className="text-slate-500 mb-12 text-lg font-medium">Type your last name to check in.</p>
            
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

  if (view === 'secret_scanner') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 font-sans relative">
         <button onClick={() => {setView('landing'); setScannerActive(false);}} className="absolute top-6 left-6 text-white/50 hover:text-white flex items-center gap-2 font-bold z-10"><LogOut size={20}/> Exit Scanner</button>
         
         {kioskMessage.text && (
           <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all duration-300">
              <div className={`bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md text-center border-t-8 ${kioskMessage.type === 'success' ? 'border-[#16a34a]' : kioskMessage.type === 'warning' ? 'border-[#eab308]' : 'border-red-600'}`}>
                 {kioskMessage.type === 'success' ? (
                    <CheckCircle size={72} className="text-[#16a34a] mx-auto mb-6" />
                 ) : (
                    <AlertCircle size={72} className={`mx-auto mb-6 ${kioskMessage.type === 'warning' ? 'text-[#eab308]' : 'text-red-600'}`} />
                 )}
                 <h1 className="text-3xl font-black text-[#001f3f] tracking-tight mb-2">{kioskMessage.text}</h1>
                 {kioskMessage.subtext && <p className="text-slate-500 font-medium text-lg">{kioskMessage.subtext}</p>}
              </div>
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

  if (view === 'member_login') {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-[3rem] shadow-2xl p-10 w-full max-w-md border-t-8 border-[#16a34a]">
          <div className="flex justify-center mb-6"><UserCircle size={64} className="text-[#16a34a]" /></div>
          <h2 className="text-3xl font-black text-center text-[#001f3f] mb-2 tracking-tight">Member Access</h2>
          <p className="text-slate-500 mb-8 text-center font-medium">Log in to view your digital badge and history.</p>
          
          <div className="space-y-4">
            <div>
               <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-2">Email Address</label>
               <input type="email" placeholder="you@email.com" id="m_email" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#16a34a] text-lg transition-colors" />
            </div>
            <div>
               <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-2">4-Digit Birthday (MMDD)</label>
               <input type="password" maxLength={4} placeholder="e.g. 0524" id="m_pin" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#16a34a] text-xl text-center tracking-[0.5em] transition-colors" onKeyDown={(e) => { if (e.key === 'Enter') document.getElementById('btn_member_login').click(); }}/>
            </div>
         </div>

          <button id="btn_member_login" onClick={() => {
            const email = document.getElementById('m_email').value.toLowerCase().trim();
            const pin = document.getElementById('m_pin').value.trim();
            const foundMember = members.find(m => m.email.toLowerCase() === email && m.password === pin);
            if(foundMember) { setActiveMember(foundMember); setView('member_portal'); } 
            else { alert('Incorrect Email or Birthday PIN.'); }
          }} className="w-full bg-[#16a34a] text-white p-5 rounded-2xl font-bold text-lg shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all mt-8">Access My Account</button>
          
          <button onClick={() => setView('landing')} className="w-full mt-6 text-slate-400 font-bold hover:text-slate-600 transition-colors">Return to Home</button>
        </div>
      </div>
    );
  }

  if (view === 'member_portal' && activeMember) {
    const mySessionVisits = visits.filter(v => v.name.toLowerCase() === (activeMember.firstName + ' ' + activeMember.lastName).toLowerCase());

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
             <p className="text-slate-500 font-medium">Welcome to your digital access portal.</p>
           </div>

           <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-[#1080ad]"></div>
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Scan to Check-In</h2>
              <div className="bg-white p-4 rounded-2xl shadow-inner border border-slate-100 mb-6 flex items-center justify-center">
                 <QRCode data={activeMember.id} size={220} />
              </div>
              <p className="text-2xl font-black text-[#001f3f] tracking-widest">{activeMember.id}</p>
              <span className={`mt-4 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${getStoplight(activeMember) === 'green' ? 'bg-green-100 text-green-700' : getStoplight(activeMember) === 'yellow' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                 {getStoplight(activeMember) === 'green' ? 'ACTIVE MEMBER' : getStoplight(activeMember) === 'yellow' ? 'PAYMENT DUE' : 'ACCOUNT LOCKED'}
              </span>
           </div>

           <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-[#001f3f] mb-4 flex items-center gap-2"><Activity size={18} className="text-[#f59e0b]"/> Lifetime Visits</h3>
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4">
                 <span className="text-sm font-bold text-slate-500">Total Check-ins</span>
                 <span className="text-3xl font-black text-[#1080ad]">{activeMember.visits}</span>
              </div>
              
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-6 mb-3">Recent Activity</h4>
              {mySessionVisits.length > 0 ? (
                <div className="space-y-2">
                   {mySessionVisits.map((v, i) => (
                      <div key={i} className="flex justify-between items-center bg-blue-50 p-3 rounded-xl border border-blue-100">
                         <span className="text-sm font-bold text-slate-700 flex items-center gap-2"><CheckCircle size={14} className="text-[#1080ad]"/> {v.center}</span>
                         <span className="text-xs font-bold text-slate-500">{new Date(v.time).toLocaleDateString()}</span>
                      </div>
                   ))}
                </div>
              ) : (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                   <p className="text-xs font-bold text-slate-400">Head to the gym to log your next workout!</p>
                </div>
              )}
           </div>

           {familyMembers.length > 0 && (
             <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
               <h3 className="font-bold text-[#001f3f] mb-4 flex items-center gap-2"><Users size={18} className="text-[#16a34a]"/> Linked Family Accounts</h3>
               <div className="space-y-3">
                 {familyMembers.map(fm => (
                   <button key={fm.id} onClick={() => setActiveMember(fm)} className="w-full flex items-center justify-between bg-slate-50 p-4 rounded-2xl hover:bg-slate-100 transition-colors border border-slate-100">
                     <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-[#1080ad] text-white flex items-center justify-center font-bold text-xs">{fm.firstName.charAt(0)}</div>
                       <div className="text-left">
                         <p className="font-bold text-slate-800 text-sm leading-tight">{fm.firstName} {fm.lastName}</p>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{fm.id}</p>
                       </div>
                     </div>
                     <ChevronRight size={16} className="text-slate-400" />
                   </button>
                 ))}
               </div>
             </div>
           )}

           <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-[#001f3f] mb-4 flex items-center gap-2"><CreditCard size={18} className="text-[#1080ad]"/> Account Info</h3>
              <div className="space-y-4">
                 <div className="flex justify-between items-center border-b border-slate-50 pb-4"><span className="text-sm font-bold text-slate-400 uppercase tracking-tight">Plan Type</span><span className="font-bold text-slate-800">{activeMember.type}</span></div>
                 <div className="flex justify-between items-center border-b border-slate-50 pb-4"><span className="text-sm font-bold text-slate-400 uppercase tracking-tight">Home Center</span><span className="font-bold text-slate-800">{activeMember.center}</span></div>
                 <div className="flex justify-between items-center pb-2"><span className="text-sm font-bold text-slate-400 uppercase tracking-tight">Next Payment</span><span className={`font-bold ${getStoplight(activeMember) !== 'green' ? 'text-red-500' : 'text-slate-800'}`}>{activeMember.nextPayment || 'N/A'}</span></div>
              </div>
           </div>

           <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-[#001f3f] flex items-center gap-2"><UserCircle size={18} className="text-[#f59e0b]"/> Contact Info</h3>
                <button onClick={() => setEditMode(!editMode)} className="text-xs font-bold text-[#1080ad] bg-blue-50 px-3 py-1 rounded-lg">
                  {editMode ? 'Cancel' : 'Edit'}
                </button>
              </div>
              {!editMode ? (
                <div className="space-y-4">
                   <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                      <span className="text-sm font-bold text-slate-400 uppercase tracking-tight">Email</span>
                      <span className="font-bold text-slate-800 truncate pl-4">{activeMember.email || 'N/A'}</span>
                   </div>
                   <div className="flex justify-between items-center pb-2">
                      <span className="text-sm font-bold text-slate-400 uppercase tracking-tight">Phone</span>
                      <span className="font-bold text-slate-800">{activeMember.phone || 'N/A'}</span>
                   </div>
                </div>
              ) : (
                <div className="space-y-4">
                   <div>
                     <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Email</label>
                     <input id="edit_email" defaultValue={activeMember.email} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#1080ad]" />
                   </div>
                   <div>
                     <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Phone</label>
                     <input id="edit_phone" defaultValue={activeMember.phone} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#1080ad]" />
                   </div>
                   <button onClick={handleUpdateProfile} disabled={isUpdating} className="w-full bg-[#001f3f] text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-900 transition-colors flex justify-center">
                     {isUpdating ? 'Saving...' : 'Save Changes'}
                   </button>
                </div>
              )}
           </div>
        </main>
      </div>
    );
  }

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-[#001f3f] flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-[3rem] shadow-2xl p-12 w-full max-w-md">
          <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Director Login</h2>
          <p className="text-slate-400 mb-10 font-medium tracking-tight">Enter director credentials to proceed.</p>
          <input type="text" placeholder="Username" id="u_in" className="w-full p-5 bg-slate-100 rounded-2xl mb-4 outline-none border-2 border-transparent focus:border-blue-500/20 text-lg" onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
          <input type="password" placeholder="Password" id="p_in" className="w-full p-5 bg-slate-100 rounded-2xl mb-8 outline-none border-2 border-transparent focus:border-blue-500/20 text-lg" onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
          <button onClick={handleLogin} className="w-full bg-[#001f3f] text-white p-5 rounded-2xl font-bold text-xl shadow-xl hover:bg-blue-900 transition-all">Sign In</button>
          <button onClick={() => setView('landing')} className="w-full mt-6 text-slate-400 font-bold">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f0f2f5] font-sans text-slate-800">
      <aside className="w-64 bg-[#001f3f] text-white flex flex-col min-h-screen relative z-10">
        <div className="p-8 border-b border-white/10 flex justify-center">
           <img src={LOGO_URL} alt="Logo" className="h-10 opacity-90 drop-shadow-md" />
        </div>
        
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#f59e0b] flex items-center justify-center font-bold text-lg text-[#001f3f]">{user?.name.charAt(0)}</div>
            <div>
              <p className="text-sm font-bold leading-none">{user?.name}</p>
              <p className="text-[11px] text-white/50">@{user?.username}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors">
            <LogOut size={14} /> Sign Out
          </button>
        </div>

        <div className="px-4 mb-8">
          <p className="px-2 text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">Viewing</p>
          <div className="space-y-1">
            {[ { k: 'both', c: '#ffffff' }, { k: 'harper', c: '#f59e0b' }, { k: 'anthony', c: '#1080ad' } ].map(item => (
              <button key={item.k} onClick={() => {
                  setViewingCenter(item.k);
                  localStorage.setItem('wellnessCenter', item.k);
              }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${viewingCenter === item.k ? 'bg-white/20 font-bold' : 'text-white/60 hover:bg-white/5'}`}>
                <span className="w-1.5 h-6 rounded-full" style={{ backgroundColor: item.c }} />
                {item.k === 'both' ? 'Both Centers' : `${item.k.charAt(0).toUpperCase() + item.k.slice(1)}`}
              </button>
            ))}
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
            { id: 'members', label: 'Members', icon: <Users size={18} /> },
            { id: 'badge', label: 'Staff Check-In', icon: <QrCode size={18} /> },
            { id: 'notif', label: 'Notifications', icon: <Bell size={18} /> },
            { id: 'reports', label: 'Reports', icon: <FileText size={18} /> },
          ].map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setKioskInput(''); }} className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all ${activeTab === item.id ? 'bg-[#1080ad] text-white font-bold' : 'text-white/60 hover:bg-white/5'}`}>
              {item.icon} {item.label}
              {item.id === 'notif' && stats.overdue > 0 && <span className="ml-auto w-5 h-5 rounded-full bg-red-500 text-[10px] flex items-center justify-center font-bold tracking-tight">{stats.overdue}</span>}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-10 h-screen overflow-y-auto relative">
        <div className="mb-10">
           <h2 className="text-3xl font-bold text-[#001f3f] capitalize tracking-tight">{activeTab}</h2>
           <p className="text-sm text-slate-400 font-medium">{viewingCenter === 'both' ? 'All Centers' : viewingCenter.charAt(0).toUpperCase() + viewingCenter.slice(1) + ' Center'} · {currentDateString}</p>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-5 gap-6">
               {[ { label: 'Total Members', value: stats.total, color: '#001f3f' }, { label: 'Active', value: stats.active, color: '#16a34a' }, { label: 'Overdue', value: stats.overdue, color: '#dc2626' }, { label: 'Expiring', value: stats.expiring, color: '#f59e0b' }, { label: 'Check-ins Today', value: stats.today, color: '#1080ad' } ].map((s, i) => (
                 <ProStatCard key={i} {...s} />
               ))}
            </div>

            {/* NEW: THE VISUAL DONUT CHARTS ROW! */}
            <div className="grid grid-cols-2 gap-8">
               <ProListCard title="Membership Breakdown">
                  <div className="py-4">
                     <DonutChart data={planChartData} totalLabel="Members" />
                  </div>
               </ProListCard>
               <ProListCard title="Account Health">
                  <div className="py-4">
                     <DonutChart data={statusChartData} totalLabel="Accounts" />
                  </div>
               </ProListCard>
            </div>

            <ProListCard title="Peak Hours Activity Heatmap">
               <div className="flex items-end justify-between h-48 mt-8 gap-2">
                 {heatmapData.map((count, i) => {
                   const heightPercent = count === 0 ? 5 : (count / maxVisits) * 100;
                   const hourLabel = (i + 6) > 12 ? `${(i + 6) - 12}P` : `${i + 6}A`;
                   return (
                     <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                       <div className="w-full bg-blue-100 rounded-t-md relative flex items-end justify-center group-hover:bg-blue-200 transition-colors" style={{ height: '100%' }}>
                         <div className="w-full bg-[#1080ad] rounded-t-md transition-all duration-500 relative" style={{ height: `${heightPercent}%` }}>
                           <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-[#001f3f] opacity-0 group-hover:opacity-100 transition-opacity">{count}</span>
                         </div>
                       </div>
                       <span className="text-[10px] font-bold text-slate-400">{hourLabel}</span>
                     </div>
                   );
                 })}
               </div>
            </ProListCard>

            <div className="grid grid-cols-2 gap-8">
               <ProListCard title="Today's Check-ins">
                 <div className="space-y-4">
                   {filteredVisits.length === 0 ? <p className="text-slate-300 italic">Waiting for activity...</p> : filteredVisits.slice(0,5).map((v, i) => (
                     <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                       <div><p className="font-bold">{v.name}</p><p className="text-[11px] font-bold text-[#f59e0b] uppercase">{v.center} · {v.type}</p></div>
                       <div className="flex items-center gap-2 text-slate-400 text-xs font-medium"><Clock size={14} /> {new Date(v.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                     </div>
                   ))}
                 </div>
               </ProListCard>

               <ProListCard title="Needs Attention">
                 <div className="space-y-4">
                   {scopedMembers.filter(m => m.status !== 'ACTIVE' || m.needsOrientation).slice(0, 5).map(m => (
                     <div key={m.id} className={`flex items-center justify-between p-4 rounded-xl border ${m.status === 'OVERDUE' ? 'bg-red-50 border-red-100' : m.needsOrientation ? 'bg-blue-50 border-blue-100' : 'bg-amber-50 border-amber-100'}`}>
                       <div>
                         <p className="font-bold">{m.firstName} {m.lastName}</p>
                         <p className="text-[11px] font-bold text-slate-400 uppercase">
                           {m.needsOrientation ? 'Needs Orientation' : m.status === 'OVERDUE' ? `Overdue since ${m.nextPayment}` : `Expiring ${m.nextPayment}`}
                         </p>
                       </div>
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black ${m.status === 'OVERDUE' ? 'bg-red-100 text-red-600' : m.needsOrientation ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                         {m.needsOrientation ? 'ORIENTATION' : m.status}
                       </span>
                     </div>
                   ))}
                 </div>
               </ProListCard>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-6">
             <div className="flex justify-between items-center mb-8">
                <div><h2 className="text-3xl font-bold text-[#001f3f] tracking-tight">Members</h2></div>
                <div className="flex gap-3">
                   <button onClick={handleExportCSV} className="bg-white border border-slate-200 text-[#001f3f] px-6 py-2 rounded-xl font-bold text-sm shadow-sm flex items-center gap-2 hover:bg-slate-50 transition-all">
                     <Download size={16} /> Export CSV
                   </button>
                   <button onClick={() => setShowAddModal(true)} className="bg-[#001f3f] text-white px-6 py-2 rounded-xl font-bold text-sm shadow-xl shadow-blue-900/10 flex items-center gap-2 hover:bg-blue-900 transition-colors">
                     <Plus size={16} /> Add Member
                   </button>
                </div>
             </div>
             
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex gap-4 items-center">
                <div className="relative flex-1">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                   <input className="pl-12 pr-4 py-2 border rounded-xl text-sm w-full outline-none" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
             </div>
             
             {loading ? (
               <div className="text-center py-20 text-slate-300 font-medium italic">Syncing Airtable...</div> 
             ) : apiError ? (
               <div className="bg-red-50 border-2 border-red-200 text-red-700 p-10 rounded-2xl text-center shadow-sm">
                  <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
                  <h3 className="text-2xl font-black mb-2">Airtable Refused Connection</h3>
                  <p className="font-mono text-sm bg-white p-4 rounded-lg border border-red-100 max-w-2xl mx-auto">{apiError}</p>
               </div>
             ) : (
               <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                 <table className="w-full text-left border-collapse">
                   <thead className="bg-slate-50 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b">
                     <tr><th className="px-8 py-4 w-64">Member</th><th className="px-8 py-4">ID</th><th className="px-8 py-4 w-40">Type</th><th className="px-8 py-4 w-32">Status</th><th className="px-8 py-4 w-32">Next Payment</th><th className="px-8 py-4 w-24">Actions</th></tr>
                   </thead>
                   <tbody className="text-sm">
                     {filteredMembers.map(m => {
                       const light = getStoplight(m);
                       return (
                       <tr key={m.id} className="border-b hover:bg-slate-50/80 cursor-pointer" onClick={() => setSelectedMember(m)}>
                         <td className="px-8 py-5">
                            <p className="font-bold text-slate-800 flex items-center gap-2">
                               {m.firstName} {m.lastName} 
                            </p>
                            <p className="text-[11px] text-slate-400">
                               {m.email}
                               {m.needsOrientation && <span className="ml-2 px-2 py-0.5 rounded text-[9px] font-black bg-blue-100 text-blue-700 uppercase">Needs Orientation</span>}
                            </p>
                         </td>
                         <td className="px-8 py-5 font-mono text-slate-400">{m.id}</td>
                         <td className="px-8 py-5"><span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black tracking-tight">{m.type}</span></td>
                         <td className="px-8 py-5">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black ${light === 'green' ? 'bg-green-100 text-green-600' : light === 'yellow' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>
                               {light === 'green' ? 'ACTIVE' : light === 'yellow' ? 'GRACE PERIOD' : 'LOCKED'}
                            </span>
                         </td>
                         <td className="px-8 py-5 text-slate-600">{m.nextPayment || 'N/A'}</td>
                         <td className="px-8 py-5"><button className="p-2 bg-[#1080ad] text-white rounded-lg shadow-md"><QrCode size={16}/></button></td>
                       </tr>
                     )})}
                   </tbody>
                 </table>
               </div>
             )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
             <div className="flex justify-between items-center mb-8">
                <div><h2 className="text-3xl font-bold text-[#001f3f] tracking-tight">Monthly Summary Report</h2></div>
                <button onClick={handleMonthlySummary} className="bg-[#1080ad] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-xl flex items-center gap-2 hover:bg-blue-600 transition-all">
                  <Download size={16} /> Download Excel
                </button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <ProListCard title="Standard Memberships">
                 <table className="w-full text-sm">
                   <tbody>
                     <tr className="border-b"><td className="py-3 font-medium text-slate-600">Single:</td><td className="py-3 font-bold text-right">{reportStats.single}</td></tr>
                     <tr className="border-b"><td className="py-3 font-medium text-slate-600">Family:</td><td className="py-3 font-bold text-right">{reportStats.family}</td></tr>
                     <tr className="border-b"><td className="py-3 font-medium text-slate-600">Senior Citizen:</td><td className="py-3 font-bold text-right">{reportStats.seniorCitizen}</td></tr>
                     <tr className="border-b"><td className="py-3 font-medium text-slate-600">Senior Family:</td><td className="py-3 font-bold text-right">{reportStats.seniorFamily}</td></tr>
                     <tr><td className="py-3 font-medium text-slate-600">Student (14-22):</td><td className="py-3 font-bold text-right">{reportStats.student}</td></tr>
                   </tbody>
                 </table>
               </ProListCard>

               <div className="space-y-8">
                 <ProListCard title="Corporate, Staff & Military">
                   <table className="w-full text-sm">
                     <tbody>
                       <tr className="border-b"><td className="py-2 font-medium text-slate-600">Corporate:</td><td className="py-2 font-bold text-right">{reportStats.corporate}</td></tr>
                       <tr className="border-b"><td className="py-2 font-medium text-slate-600">Corporate Family:</td><td className="py-2 font-bold text-right">{reportStats.corporateFamily}</td></tr>
                       <tr className="border-b"><td className="py-2 font-medium text-slate-600">HD6/HCHF (Staff):</td><td className="py-2 font-bold text-right">{reportStats.staff}</td></tr>
                       <tr><td className="py-2 font-medium text-slate-600">Active Military (Free):</td><td className="py-2 font-bold text-right">{reportStats.military}</td></tr>
                     </tbody>
                   </table>
                 </ProListCard>
                 
                 <ProListCard title="Other & Totals">
                   <table className="w-full text-sm">
                     <tbody>
                       <tr className="border-b"><td className="py-2 font-medium text-slate-600">Day Passes:</td><td className="py-2 font-bold text-right">{reportStats.dayPass}</td></tr>
                       <tr className="bg-slate-50"><td className="py-3 px-2 font-bold text-[#001f3f] text-lg">Total Members:</td><td className="py-3 px-2 font-black text-right text-[#001f3f] text-lg">{stats.total}</td></tr>
                     </tbody>
                   </table>
                 </ProListCard>
               </div>
             </div>
          </div>
        )}

        {activeTab === 'notif' && (
          <div className="space-y-6">
             <div className="flex justify-between items-center mb-8">
                <div><h2 className="text-3xl font-bold text-[#001f3f] tracking-tight">Notifications</h2><p className="text-slate-400 font-medium">Payment reminders via email & SMS</p></div>
                <button className="bg-[#dd6d22] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-orange-900/20 flex items-center gap-2"><Bell size={20} /> Send All Due</button>
             </div>
             <ProListCard title="Due for Reminder">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-4">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b">
                      <tr><th className="px-8 py-4 w-64">Member</th><th className="px-8 py-4 w-40">Type</th><th className="px-8 py-4 w-32">Status</th><th className="px-8 py-4 w-32">Due</th><th className="px-8 py-4 w-24">Actions</th></tr>
                    </thead>
                    <tbody className="text-sm">
                      {scopedMembers.filter(m => m.status !== 'ACTIVE').map(m => (
                        <tr key={m.id} className="border-b">
                          <td className="px-8 py-5"><p className="font-bold text-slate-800">{m.firstName} {m.lastName}</p><p className="text-[11px] text-slate-400">{m.email}</p></td>
                          <td className="px-8 py-5"><span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black">{m.type}</span></td>
                          <td className="px-8 py-5"><span className={`px-3 py-1 rounded-full text-[10px] font-black ${m.status === 'OVERDUE' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>{m.status}</span></td>
                          <td className="px-8 py-5 text-slate-600 font-medium">{m.nextPayment}</td>
                          <td className="px-8 py-5 flex gap-2"><button className="p-2 bg-[#1080ad] text-white rounded-lg shadow-md"><Mail size={16}/></button><button className="p-2 bg-[#dd6d22] text-white rounded-lg shadow-md"><Phone size={16}/></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
             </ProListCard>
          </div>
        )}

        {activeTab === 'badge' && (
          <div className="space-y-6">
             <div className="mb-8">
                <h2 className="text-3xl font-bold text-[#001f3f] tracking-tight mb-1">Staff Check-In</h2>
                <p className="text-slate-400 font-medium">Log a check-in manually or via external barcode scanner.</p>
             </div>
             <div className="flex gap-8">
                <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-200 flex-1 text-center">
                   
                   <p className="text-sm font-bold text-slate-400 mb-4 tracking-tight">Enter Name or ID (or plug in external scanner):</p>
                   
                   <div className="relative w-full max-w-sm mx-auto mb-10">
                      <div className="flex gap-4">
                         <input 
                           className="flex-1 p-4 border rounded-xl outline-none font-sans text-xl text-center bg-slate-100 focus:border-[#1080ad] focus:bg-white transition-colors" 
                           placeholder="e.g. Smith" 
                           id="kiosk_in_staff" 
                           value={kioskInput}
                           onChange={(e) => setKioskInput(e.target.value)}
                           onKeyDown={(e) => {
                             if (e.key === 'Enter') {
                               processCheckIn(kioskInput, "Staff Scan/Entry");
                               setKioskInput('');
                             }
                           }}
                         />
                         <button onClick={() => {
                           processCheckIn(kioskInput, "Staff Scan/Entry");
                           setKioskInput('');
                         }} className="bg-[#001f3f] text-white px-8 rounded-xl font-bold hover:bg-blue-900 transition-colors shadow-sm">Check In</button>
                      </div>

                      {kioskMatches.length > 0 && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden text-left">
                          {kioskMatches.map(m => (
                            <button 
                              key={m.id} 
                              onClick={() => {
                                processCheckIn(m.id, "Staff Override Entry");
                                setKioskInput('');
                              }}
                              className="w-full p-4 border-b border-slate-100 last:border-0 hover:bg-blue-50 transition-colors flex justify-between items-center group"
                            >
                               <div>
                                 <p className="font-bold text-[#001f3f] text-lg">{m.firstName} {m.lastName}</p>
                                 <p className="text-[10px] text-slate-400 uppercase tracking-widest">{m.phone || 'No Phone'}</p>
                               </div>
                               <div className="bg-[#1080ad] text-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm group-hover:scale-105 transition-transform">
                                 Select
                               </div>
                            </button>
                          ))}
                        </div>
                      )}
                   </div>
                   
                   {kioskMessage.text && (
                     <div className={`mt-8 p-4 rounded-xl text-center font-bold text-lg ${kioskMessage.type === 'success' ? 'bg-green-100 text-green-700' : kioskMessage.type === 'warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {kioskMessage.text}
                        {kioskMessage.subtext && <p className="text-sm mt-1">{kioskMessage.subtext}</p>}
                     </div>
                   )}

                </div>
                <div className="w-[440px] space-y-8">
                   <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                      <p className="text-sm font-bold text-[#001f3f] mb-6 tracking-tight">Recent Check-ins</p>
                      <div className="space-y-4">
                         {filteredVisits.length === 0 ? (
                           <p className="text-slate-300 italic font-medium text-center py-10">Waiting for scan...</p>
                         ) : filteredVisits.slice(0, 8).map((v, i) => (
                           <div key={i} className="flex justify-between items-center text-sm border-b pb-4 last:border-0 border-slate-100">
                              <div><p className="font-bold text-slate-800">{v.name}</p><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{v.center}</p></div>
                              <span className="text-xs text-slate-500 font-medium">{new Date(v.time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </main>

      {/* --- ADD NEW MEMBER MODAL WITH BIRTHDAY FIELD --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001f3f]/90 backdrop-blur-md">
           <div className="bg-white rounded-3xl w-full max-w-xl p-10 relative shadow-2xl">
              <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-all"><X size={24}/></button>
              <h3 className="text-3xl font-black text-[#001f3f] mb-2 tracking-tight">Manual Registration</h3>
              <p className="text-slate-500 font-medium mb-8">Add a new member to the Airtable database.</p>
              
              <form onSubmit={handleAddMemberSubmit} className="space-y-5">
                 <div className="grid grid-cols-2 gap-5">
                    <div>
                       <label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">First Name</label>
                       <input id="fname" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors" />
                    </div>
                    <div>
                       <label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">Last Name</label>
                       <input id="lname" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors" />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-5">
                    <div>
                       <label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">Email</label>
                       <input type="email" id="email" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors" />
                    </div>
                    <div>
                       <label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">Phone</label>
                       <input id="phone" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors" />
                    </div>
                 </div>
                 {/* NEW: THE BIRTHDAY DATE PICKER */}
                 <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">Birthday (For PIN)</label>
                    <input type="date" id="birthday" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors text-slate-600" />
                 </div>
                 <div className="grid grid-cols-2 gap-5">
                    <div>
                       <label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">Plan Type</label>
                       <select id="plan" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors font-bold text-slate-700">
                          <option value="SINGLE">Single</option>
                          <option value="FAMILY">Family</option>
                          <option value="SENIOR CITIZEN">Senior Citizen</option>
                          <option value="SENIOR FAMILY">Senior Family</option>
                          <option value="STUDENT">Student (14-22)</option>
                          <option value="CORPORATE">Corporate</option>
                          <option value="CORPORATE FAMILY">Corporate Family</option>
                          <option value="MILITARY">Military</option>
                          <option value="HD6">Staff (HD6)</option>
                          <option value="HCHF">Staff (HCHF)</option>
                       </select>
                    </div>
                    <div>
                       <label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">Home Center</label>
                       <select id="center" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors font-bold text-slate-700">
                          <option value="Anthony">Anthony</option>
                          <option value="Harper">Harper</option>
                       </select>
                    </div>
                 </div>
                 <button type="submit" disabled={isAdding} className="w-full bg-[#1080ad] text-white p-5 rounded-xl font-bold mt-8 shadow-lg hover:bg-blue-800 transition-colors text-lg flex items-center justify-center gap-2">
                    {isAdding ? 'Saving to Airtable...' : 'Create Member Profile'}
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* --- MEMBER DETAIL MODAL --- */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001f3f]/90 backdrop-blur-md">
           <div className="bg-white rounded-[2rem] w-full max-w-4xl flex overflow-hidden shadow-2xl relative">
              <button onClick={() => setSelectedMember(null)} className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-all"><X size={24}/></button>
              <div className="w-1/3 bg-slate-50 p-12 flex flex-col items-center justify-center border-r border-slate-100">
                 <div className="bg-white p-6 rounded-2xl shadow-xl mb-8 border border-slate-100">
                    <QRCode data={selectedMember.id} size={180} />
                 </div>
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Member Identity</p>
                 <p className="text-xl font-bold text-[#001f3f]">#{selectedMember.id}</p>
              </div>
              <div className="flex-1 p-16">
                 {selectedMember.needsOrientation && (
                    <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                       <p className="text-blue-800 font-bold text-sm">Action Required: This member has not completed their orientation.</p>
                    </div>
                 )}
                 <span className={`px-4 py-1 rounded-full text-[10px] font-black tracking-widest ${getStoplight(selectedMember) === 'green' ? 'bg-green-100 text-green-600' : getStoplight(selectedMember) === 'yellow' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>
                    {getStoplight(selectedMember) === 'green' ? 'ACTIVE' : getStoplight(selectedMember) === 'yellow' ? 'GRACE PERIOD' : 'ACCOUNT LOCKED'}
                 </span>
                 <h2 className="text-6xl font-black text-slate-900 mt-6 mb-12 tracking-tighter leading-none">{selectedMember.firstName}<br/>{selectedMember.lastName}</h2>
                 
                 <div className="grid grid-cols-2 gap-8 gap-x-12">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Membership Type</p>
                      <p className="text-lg font-bold text-slate-800">{selectedMember.type}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact Info</p>
                      <p className="text-sm font-bold text-slate-800 truncate">{selectedMember.email || 'No Email'}<br/>{selectedMember.phone || 'No Phone'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Renewal Date</p>
                      <p className={`text-lg font-bold ${getStoplight(selectedMember) !== 'green' ? 'text-red-500' : 'text-slate-800'}`}>{selectedMember.nextPayment || 'N/A'}</p>
                    </div>
                 </div>

                 <div className="mt-14 flex gap-4">
                    <button onClick={() => { processCheckIn(selectedMember.id, "Director Override"); setSelectedMember(null); }} className="flex-1 bg-[#001f3f] text-white py-4 rounded-xl font-bold shadow-xl shadow-blue-900/20 active:scale-95 transition-all text-sm">Force Manual Check-In</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
