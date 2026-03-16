// @ts-nocheck
'use client';
import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { 
  Users, Search, QrCode, CreditCard, X, CheckCircle, 
  AlertCircle, TrendingUp, Calendar, MapPin, Mail, LogOut, 
  ShieldCheck, Phone, Activity, ChevronRight, LayoutDashboard,
  Filter, Download, Bell, FileText, Plus, Smartphone, Clock, Camera, UserCircle
} from 'lucide-react';

// ============================================================
// REAL QR Code Generator
// ============================================================
const QRCode = ({ data, size = 160, darkColor = '#001f3f' }) => {
  const hexColor = darkColor.replace('#', '');
  const safeData = encodeURIComponent(data || "WC-000");
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${safeData}&color=${hexColor}&bgcolor=ffffff`;
  
  return (
    <img 
      src={qrUrl} 
      alt={`QR Code for ${data}`} 
      width={size} 
      height={size} 
      style={{ width: size, height: size, display: 'block' }} 
    />
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
  const [scannerActive, setScannerActive] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [kioskMessage, setKioskMessage] = useState({text: '', type: ''});
  
  // NEW: State to control the smart search typing
  const [kioskInput, setKioskInput] = useState('');

  const membersRef = useRef(members);
  useEffect(() => { membersRef.current = members; }, [members]);
  const centerRef = useRef(viewingCenter);
  useEffect(() => { centerRef.current = viewingCenter; }, [viewingCenter]);

  useEffect(() => {
    setIsMounted(true);
    setCurrentDateString(new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }));
    
    const savedUser = localStorage.getItem('wellnessUser');
    const savedCenter = localStorage.getItem('wellnessCenter');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setView('dashboard');
    }
    if (savedCenter) setViewingCenter(savedCenter);
  }, []);

  const handleLogin = () => {
    const u = document.getElementById('u_in').value.toLowerCase().trim();
    const p = document.getElementById('p_in').value.trim();
    const found = DIRECTORS.find(d => d.username === u && d.password === p);
    if(found) { 
      setUser(found); 
      setViewingCenter(found.center); 
      localStorage.setItem('wellnessUser', JSON.stringify(found));
      localStorage.setItem('wellnessCenter', found.center);
      setView('dashboard'); 
    } else { 
      alert('Incorrect username or password. Please try again.'); 
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('wellnessUser');
    localStorage.removeItem('wellnessCenter');
    setView('landing');
  };

  useEffect(() => {
    setLoading(true);
    fetch('/api/members')
      .then(res => res.json())
      .then(data => {
        if (data.records) {
          const mapped = data.records.map(r => {
            let planText = 'UNKNOWN PLAN';
            if (r.fields['Plan Name']) {
              planText = Array.isArray(r.fields['Plan Name']) ? r.fields['Plan Name'][0] : r.fields['Plan Name'];
            }

            return {
              airtableId: r.id, 
              id: r.fields['Member ID'] || r.id,
              firstName: r.fields['First Name'] || 'Unknown',
              lastName: r.fields['Last Name'] || '',
              email: r.fields['Email'] || '',
              phone: r.fields['Phone'] || '',
              status: (r.fields['Membership Status'] || 'ACTIVE').toUpperCase(),
              type: String(planText).toUpperCase(),
              center: r.fields['Home Center'] || 'Anthony',
              visits: Number(r.fields['Total Visits'] || 0),
              nextPayment: r.fields['Next Payment Due'] || 'Mar 31, 2026',
              sponsor: !!r.fields['Corporate Sponsor'],
            };
          });
          setMembers(mapped);
        }
        setLoading(false);
      }).catch(() => setLoading(false));
  }, []);

  const scopedMembers = members.filter(m => viewingCenter === 'both' || (m.center && m.center.toLowerCase().includes(viewingCenter)));
  const filteredMembers = scopedMembers.filter(m => `${m.firstName} ${m.lastName} ${m.id}`.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredVisits = visits.filter(v => viewingCenter === 'both' || (v.center && v.center.toLowerCase().includes(viewingCenter)));
  
  // NEW: Smart Search filtering logic (Only shows if they type 2 or more letters)
  const kioskMatches = kioskInput.length >= 2 
    ? members.filter(m => 
        (m.firstName + ' ' + m.lastName).toLowerCase().includes(kioskInput.toLowerCase()) || 
        m.id.toLowerCase().includes(kioskInput.toLowerCase())
      ).slice(0, 5) // Limit to top 5 so the screen doesn't get overcrowded
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
    single: scopedMembers.filter(m => m.type?.includes('SINGLE') || m.type?.includes('MONTHLY') || m.type?.includes('ANNUAL')).length,
    family: scopedMembers.filter(m => m.type?.includes('FAMILY') && !m.type?.includes('SENIOR') && !m.type?.includes('STUDENT')).length,
    student: scopedMembers.filter(m => m.type?.includes('STUDENT')).length,
    senior: scopedMembers.filter(m => m.type?.includes('SENIOR') && !m.type?.includes('FAMILY')).length,
    famStudent: scopedMembers.filter(m => m.type?.includes('FAMILY') && m.type?.includes('STUDENT')).length,
    famSenior: scopedMembers.filter(m => m.type?.includes('FAMILY') && m.type?.includes('SENIOR')).length,
    corporate: scopedMembers.filter(m => m.sponsor || m.type?.includes('CORPORATE')).length,
    dayPass: scopedMembers.filter(m => m.type?.includes('PASS') || m.type?.includes('PUNCH')).length,
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
    ? members.filter(m => 
        m.id !== activeMember.id && 
        ((m.email && m.email.toLowerCase() === activeMember.email.toLowerCase()) || 
         (m.phone && m.phone === activeMember.phone))
      )
    : [];

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    const newEmail = document.getElementById('edit_email').value.trim();
    const newPhone = document.getElementById('edit_phone').value.trim();
    
    setActiveMember({...activeMember, email: newEmail, phone: newPhone});
    setEditMode(false);

    try {
      await fetch('/api/update-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ airtableId: activeMember.airtableId, email: newEmail, phone: newPhone })
      });
    } catch (err) {
      alert("App updated locally.");
    }
    setIsUpdating(false);
  };

  const processCheckIn = async (memberId, method = "Manual Entry") => {
    const id = memberId.toUpperCase().trim();
    const m = membersRef.current.find(m => m.id === id); 
    
    if(m) {
      const currentCenter = centerRef.current;
      const scanCenter = currentCenter === 'both' ? m.center : currentCenter.charAt(0).toUpperCase() + currentCenter.slice(1);
      const currentTime = new Date().toISOString();
      
      setVisits(prev => [{name: m.firstName + ' ' + m.lastName, center: scanCenter, time: currentTime, type: m.type}, ...prev]);
      
      setMembers(prev => prev.map(member => member.id === id ? { ...member, visits: member.visits + 1 } : member));
      if (activeMember && activeMember.id === id) {
        setActiveMember(prev => ({...prev, visits: prev.visits + 1}));
      }

      setKioskMessage({ text: `Welcome, ${m.firstName}!`, type: 'success' });
      setTimeout(() => setKioskMessage({ text: '', type: '' }), 3500); 

      try {
        await fetch('/api/visits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ airtableId: m.airtableId, center: scanCenter, time: currentTime, method: method })
        });
      } catch (err) {
        console.error("Failed to save visit", err);
      }
      return true;
    } else {
      setKioskMessage({ text: `ID not found. Please see front desk.`, type: 'error' });
      setTimeout(() => setKioskMessage({ text: '', type: '' }), 3500);
      return false;
    }
  };

  useEffect(() => {
    let scanner = null;
    if ((activeTab === 'badge' || view === 'kiosk') && scannerActive) {
      scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: {width: 280, height: 280} }, false);
      scanner.render((decodedText) => {
        processCheckIn(decodedText, "Camera Scan");
        if (view !== 'kiosk') {
          scanner.clear(); 
          setScannerActive(false);
        }
      }, () => {});
    }
    return () => { if(scanner) scanner.clear().catch(e => console.error(e)); };
  }, [activeTab, view, scannerActive]); 

  const handleExportCSV = () => {
    if (filteredMembers.length === 0) return;
    const headers = ["Member ID", "First Name", "Last Name", "Email", "Phone", "Membership Type", "Home Center", "Status", "Total Visits", "Next Payment"];
    const csvRows = [
      headers.join(','),
      ...filteredMembers.map(m => `"${m.id}","${m.firstName}","${m.lastName}","${m.email}","${m.phone}","${m.type}","${m.center}","${m.status}","${m.visits}","${m.nextPayment}"`)
    ].join('\n');
    const blob = new Blob([csvRows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    const centerLabel = viewingCenter === 'both' ? 'All_Centers' : viewingCenter.charAt(0).toUpperCase() + viewingCenter.slice(1);
    a.download = `Wellness_Members_${centerLabel}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); window.URL.revokeObjectURL(url);
  };

  const handleMonthlySummary = () => {
    const centerName = viewingCenter === 'both' ? 'System-Wide' : viewingCenter.charAt(0).toUpperCase() + viewingCenter.slice(1);
    
    const csvContent = `
${centerName} Wellness Center ${currentDateString} Summary

STATS
Single Memberships:,${reportStats.single}
Family Memberships:,${reportStats.family}
Student Memberships:,${reportStats.student}
Senior Memberships:,${reportStats.senior}
Family/Student Memberships:,${reportStats.famStudent}
Family/Senior Memberships:,${reportStats.famSenior}
Corporate:,${reportStats.corporate}
Total Members:,${stats.total}

CORPORATE BREAKDOWN
Single Memberships:,${corpStats.single}
Family Memberships:,${corpStats.family}
Student Memberships:,${corpStats.student}
Senior Memberships:,${corpStats.senior}
Family/Student Memberships:,${corpStats.famStudent}
Family/Senior Memberships:,${corpStats.famSenior}

OTHER INFORMATION
New Members (Est):,0
Gift Cards Purchased:,0
Paid-Daily Visitors:,${reportStats.dayPass}
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
      <div className="min-h-screen bg-[#001f3f] flex items-center justify-center font-sans p-6">
        <div className="text-center max-w-5xl w-full">
          <img src={LOGO_URL} alt="Logo" className="h-20 mx-auto mb-16 opacity-90" />
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
      </div>
    );
  }

  // ============================================================
  // VIEW: LOCKED-DOWN KIOSK MODE (WITH SMART SEARCH)
  // ============================================================
  if (view === 'kiosk') {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
         <button onClick={() => {setView('landing'); setScannerActive(false);}} className="absolute top-6 left-6 text-slate-400 hover:text-[#001f3f] flex items-center gap-2 font-bold z-10"><LogOut size={20}/> Staff Exit</button>
         
         {kioskMessage.text && (
           <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center transition-all duration-300 ${kioskMessage.type === 'success' ? 'bg-[#16a34a]' : 'bg-red-600'}`}>
              {kioskMessage.type === 'success' ? <CheckCircle size={120} className="text-white mb-8 animate-bounce" /> : <AlertCircle size={120} className="text-white mb-8 animate-bounce" />}
              <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter text-center px-4 shadow-sm">{kioskMessage.text}</h1>
           </div>
         )}

         <div className="bg-white rounded-[3rem] shadow-2xl p-12 w-full max-w-2xl border-t-8 border-[#1080ad] text-center relative z-0">
            <h2 className="text-5xl font-black text-[#001f3f] mb-4 tracking-tight">Check-In</h2>
            <p className="text-slate-500 mb-10 text-lg font-medium">Scan your QR code or type your name.</p>
            
            <div className="w-full max-w-md mx-auto mb-10 border-4 border-slate-100 bg-white relative flex flex-col items-center justify-center p-4 rounded-3xl min-h-[300px]">
               {!scannerActive ? (
                 <>
                   <Camera size={64} className="mb-6 text-slate-300" />
                   <button onClick={() => setScannerActive(true)} className="bg-[#1080ad] text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2 shadow-lg hover:bg-blue-700 transition-colors">
                     Turn On Scanner
                   </button>
                   <p className="text-xs text-slate-400 mt-4">(Ensure browser camera is allowed)</p>
                 </>
               ) : (
                 <div className="w-full h-full relative">
                   <div id="reader" className="w-full h-full bg-black"></div>
                 </div>
               )}
            </div>

            <p className="text-sm font-bold text-slate-400 mb-4 tracking-widest uppercase">Or enter Name or ID</p>
            
            {/* THE SMART SEARCH KIOSK WIDGET */}
            <div className="relative w-full max-w-md mx-auto">
              <div className="flex gap-4">
                 <input 
                   className="flex-1 p-5 border-2 rounded-2xl outline-none focus:border-[#1080ad] font-sans text-xl text-center bg-slate-50" 
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

              {/* DROPDOWN FOR SMART SEARCH */}
              {kioskMatches.length > 0 && (
                <div className="absolute bottom-[110%] left-0 w-full mb-2 bg-white border-2 border-[#1080ad] rounded-2xl shadow-2xl z-50 overflow-hidden text-left flex flex-col-reverse">
                  {kioskMatches.map(m => (
                    <button 
                      key={m.id} 
                      onClick={() => {
                        processCheckIn(m.id, "Name Search Entry");
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
          <div className="flex justify-center mb-6">
            <UserCircle size={64} className="text-[#16a34a]" />
          </div>
          <h2 className="text-3xl font-black text-center text-[#001f3f] mb-2 tracking-tight">Member Access</h2>
          <p className="text-slate-500 mb-8 text-center font-medium">Log in to view your digital badge.</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-2">Email Address</label>
              <input type="email" placeholder="you@email.com" id="m_email" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#16a34a] text-lg transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-2">Member ID</label>
              <input type="text" placeholder="e.g. WC-001" id="m_id" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#16a34a] text-lg uppercase transition-colors" onKeyDown={(e) => {
                if (e.key === 'Enter') document.getElementById('btn_member_login').click();
              }}/>
            </div>
          </div>

          <button id="btn_member_login" onClick={() => {
            const email = document.getElementById('m_email').value.toLowerCase().trim();
            const id = document.getElementById('m_id').value.toUpperCase().trim();
            const foundMember = members.find(m => m.id === id && m.email.toLowerCase() === email);
            
            if(foundMember) { 
              setActiveMember(foundMember); 
              setView('member_portal'); 
            } else { 
              alert('We could not find an active account with that Email and Member ID combination.'); 
            }
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
             <div className="w-8 h-8 rounded-full bg-[#16a34a] flex items-center justify-center font-bold text-[#001f3f]">{activeMember.firstName.charAt(0)}</div>
             <span className="font-bold tracking-tight">Wellness Portal</span>
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
              <span className={`mt-4 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${activeMember.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                 {activeMember.status} MEMBER
              </span>
           </div>

           <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-[#001f3f] mb-4 flex items-center gap-2"><Activity size={18} className="text-[#f59e0b]"/> Lifetime Visits</h3>
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                 <span className="text-sm font-bold text-slate-500">Total Check-ins</span>
                 <span className="text-3xl font-black text-[#1080ad]">{activeMember.visits}</span>
              </div>
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
              <h3 className="font-bold text-[#001f3f] mb-4 flex items-center gap-2"><CreditCard size={18} className="text-[#1080ad]"/> Account Status</h3>
              <div className="space-y-4">
                 <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-tight">Plan Type</span>
                    <span className="font-bold text-slate-800">{activeMember.type}</span>
                 </div>
                 <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-tight">Home Center</span>
                    <span className="font-bold text-slate-800">{activeMember.center}</span>
                 </div>
                 <div className="flex justify-between items-center pb-2">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-tight">Next Payment</span>
                    <span className={`font-bold ${activeMember.status === 'OVERDUE' ? 'text-red-500' : 'text-slate-800'}`}>
                      {activeMember.nextPayment || 'N/A'}
                    </span>
                 </div>
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

  // ============================================================
  // VIEW: DIRECTOR LOGIN
  // ============================================================
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

  // ============================================================
  // VIEW: DIRECTOR DASHBOARD
  // ============================================================
  return (
    <div className="flex min-h-screen bg-[#f0f2f5] font-sans text-slate-800">
      <aside className="w-64 bg-[#001f3f] text-white flex flex-col min-h-screen">
        <div className="p-6 border-b border-white/10"><h1 className="text-xl font-bold tracking-tight">Wellness Centers</h1></div>
        
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

      <main className="flex-1 p-10 h-screen overflow-y-auto">
        <div className="mb-10">
           <h2 className="text-3xl font-bold text-[#001f3f] capitalize tracking-tight">{activeTab}</h2>
           <p className="text-sm text-slate-400 font-medium">{viewingCenter === 'both' ? 'All Centers' : viewingCenter.charAt(0).toUpperCase() + viewingCenter.slice(1) + ' Center'} · {currentDateString}</p>
        </div>

        {/* VIEW: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-5 gap-6">
               {[ { l: 'Total Members', v: stats.total, c: '#001f3f' }, { l: 'Active', v: stats.active, c: '#16a34a' }, { l: 'Overdue', v: stats.overdue, c: '#dc2626' }, { l: 'Expiring', v: stats.expiring, c: '#f59e0b' }, { l: 'Check-ins Today', v: stats.today, c: '#1080ad' } ].map((s, i) => (
                 <ProStatCard key={i} {...s} />
               ))}
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
                   {scopedMembers.filter(m => m.status !== 'ACTIVE').slice(0, 5).map(m => (
                     <div key={m.id} className={`flex items-center justify-between p-4 rounded-xl border ${m.status === 'OVERDUE' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
                       <div><p className="font-bold">{m.firstName} {m.lastName}</p><p className="text-[11px] font-bold text-slate-400 uppercase">{m.status === 'OVERDUE' ? `Overdue since ${m.nextPayment}` : `Expiring ${m.nextPayment}`}</p></div>
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black ${m.status === 'OVERDUE' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>{m.status}</span>
                     </div>
                   ))}
                 </div>
               </ProListCard>
            </div>
          </div>
        )}

        {/* VIEW: MEMBERS */}
        {activeTab === 'members' && (
          <div className="space-y-6">
             <div className="flex justify-between items-center mb-8">
                <div><h2 className="text-3xl font-bold text-[#001f3f] tracking-tight">Members</h2><p className="text-slate-400 font-medium">{filteredMembers.length} members</p></div>
                <div className="flex gap-3">
                   <button onClick={handleExportCSV} className="bg-white border border-slate-200 text-[#001f3f] px-6 py-2 rounded-xl font-bold text-sm shadow-sm flex items-center gap-2 hover:bg-slate-50 transition-all">
                      <Download size={16} /> Export Raw Data CSV
                   </button>
                   <button className="bg-[#001f3f] text-white px-6 py-2 rounded-xl font-bold text-sm shadow-xl shadow-blue-900/10 flex items-center gap-2"><Plus size={16} /> Add Member</button>
                </div>
             </div>
             
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex gap-4 items-center">
                <div className="relative flex-1">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                   <input className="pl-12 pr-4 py-2 border rounded-xl text-sm w-full outline-none" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
             </div>
             
             {loading ? <div className="text-center py-20 text-slate-300 font-medium italic">Syncing Airtable...</div> : (
               <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                 <table className="w-full text-left border-collapse">
                   <thead className="bg-slate-50 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b">
                     <tr><th className="px-8 py-4 w-64">Member</th><th className="px-8 py-4">ID</th><th className="px-8 py-4 w-40">Type</th><th className="px-8 py-4 w-48">Center</th><th className="px-8 py-4 w-32">Status</th><th className="px-8 py-4 w-32">Next Payment</th><th className="px-8 py-4 w-24 text-right">Visits</th><th className="px-8 py-4 w-24">Actions</th></tr>
                   </thead>
                   <tbody className="text-sm">
                     {filteredMembers.map(m => (
                       <tr key={m.id} className="border-b hover:bg-slate-50/80 cursor-pointer" onClick={() => setSelectedMember(m)}>
                         <td className="px-8 py-5"><p className="font-bold text-slate-800">{m.firstName} {m.lastName}</p><p className="text-[11px] text-slate-400">{m.email}</p></td>
                         <td className="px-8 py-5 font-mono text-slate-400">{m.id}</td>
                         <td className="px-8 py-5"><span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black tracking-tight">{m.type}</span></td>
                         <td className="px-8 py-5 text-slate-600 font-medium">{m.center}</td>
                         <td className="px-8 py-5"><span className={`px-3 py-1 rounded-full text-[10px] font-black ${m.status === 'ACTIVE' ? 'bg-green-100 text-green-600' : m.status === 'OVERDUE' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>{m.status}</span></td>
                         <td className="px-8 py-5 text-slate-600">{m.nextPayment}</td>
                         <td className="px-8 py-5 font-bold text-lg text-right">{m.visits}</td>
                         <td className="px-8 py-5"><button className="p-2 bg-[#1080ad] text-white rounded-lg shadow-md"><QrCode size={16}/></button></td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             )}
          </div>
        )}

        {/* VIEW: REPORTS */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
             <div className="flex justify-between items-center mb-8">
                <div><h2 className="text-3xl font-bold text-[#001f3f] tracking-tight">Monthly Summary Report</h2><p className="text-slate-400 font-medium">Automated stats breakdown based on current Airtable records.</p></div>
                <button onClick={handleMonthlySummary} className="bg-[#1080ad] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-xl flex items-center gap-2 hover:bg-blue-600 transition-all">
                  <Download size={16} /> Download Excel Summary
                </button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <ProListCard title="Membership Stats">
                 <table className="w-full text-sm">
                   <tbody>
                     <tr className="border-b"><td className="py-3 font-medium text-slate-600">Single Memberships:</td><td className="py-3 font-bold text-right">{reportStats.single}</td></tr>
                     <tr className="border-b"><td className="py-3 font-medium text-slate-600">Family Memberships:</td><td className="py-3 font-bold text-right">{reportStats.family}</td></tr>
                     <tr className="border-b"><td className="py-3 font-medium text-slate-600">Student Memberships:</td><td className="py-3 font-bold text-right">{reportStats.student}</td></tr>
                     <tr className="border-b"><td className="py-3 font-medium text-slate-600">Senior Memberships:</td><td className="py-3 font-bold text-right">{reportStats.senior}</td></tr>
                     <tr className="border-b"><td className="py-3 font-medium text-slate-600">Family/Student Memberships:</td><td className="py-3 font-bold text-right">{reportStats.famStudent}</td></tr>
                     <tr className="border-b"><td className="py-3 font-medium text-slate-600">Family/Senior Memberships:</td><td className="py-3 font-bold text-right">{reportStats.famSenior}</td></tr>
                     <tr className="border-b"><td className="py-3 font-medium text-slate-600">Corporate:</td><td className="py-3 font-bold text-right">{reportStats.corporate}</td></tr>
                     <tr className="bg-slate-50"><td className="py-3 px-2 font-bold text-[#001f3f]">Total Members:</td><td className="py-3 px-2 font-black text-right text-[#001f3f]">{stats.total}</td></tr>
                   </tbody>
                 </table>
               </ProListCard>

               <div className="space-y-8">
                 <ProListCard title="Corporate Breakdown">
                   <table className="w-full text-sm">
                     <tbody>
                       <tr className="border-b"><td className="py-2 font-medium text-slate-600">Single Memberships:</td><td className="py-2 font-bold text-right">{corpStats.single}</td></tr>
                       <tr className="border-b"><td className="py-2 font-medium text-slate-600">Family Memberships:</td><td className="py-2 font-bold text-right">{corpStats.family}</td></tr>
                       <tr className="border-b"><td className="py-2 font-medium text-slate-600">Student Memberships:</td><td className="py-2 font-bold text-right">{corpStats.student}</td></tr>
                       <tr className="border-b"><td className="py-2 font-medium text-slate-600">Senior Memberships:</td><td className="py-2 font-bold text-right">{corpStats.senior}</td></tr>
                       <tr className="border-b"><td className="py-2 font-medium text-slate-600">Family/Student Memberships:</td><td className="py-2 font-bold text-right">{corpStats.famStudent}</td></tr>
                       <tr><td className="py-2 font-medium text-slate-600">Family/Senior Memberships:</td><td className="py-2 font-bold text-right">{corpStats.famSenior}</td></tr>
                     </tbody>
                   </table>
                 </ProListCard>
                 <ProListCard title="Other Information">
                   <table className="w-full text-sm">
                     <tbody>
                       <tr className="border-b"><td className="py-2 font-medium text-slate-600">New Members:</td><td className="py-2 font-bold text-right text-slate-400 italic">Auto-calc coming</td></tr>
                       <tr className="border-b"><td className="py-2 font-medium text-slate-600">Gift Cards Purchased:</td><td className="py-2 font-bold text-right text-slate-400 italic">0</td></tr>
                       <tr><td className="py-2 font-medium text-slate-600">Paid-Daily Visitors:</td><td className="py-2 font-bold text-right">{reportStats.dayPass}</td></tr>
                     </tbody>
                   </table>
                 </ProListCard>
               </div>
             </div>
          </div>
        )}

        {/* VIEW: NOTIFICATIONS */}
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

        {/* VIEW: STAFF BADGE IN (WITH SMART SEARCH) */}
        {activeTab === 'badge' && (
          <div className="space-y-6">
             <div className="mb-8">
                <h2 className="text-3xl font-bold text-[#001f3f] tracking-tight mb-1">Staff Check-In</h2>
                <p className="text-slate-400 font-medium">Manually log a check-in for a member who forgot their badge.</p>
             </div>
             <div className="flex gap-8">
                <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-200 flex-1 text-center">
                   
                   <p className="text-sm font-bold text-slate-400 mb-4 tracking-tight">Enter Name or ID (or use USB scanner):</p>
                   
                   {/* STAFF SMART SEARCH WIDGET */}
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
                                processCheckIn(m.id, "Name Search Entry");
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
                     <div className={`mt-8 p-4 rounded-xl text-center font-bold text-lg ${kioskMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {kioskMessage.text}
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
                 <span className={`px-4 py-1 rounded-full text-[10px] font-black tracking-widest ${selectedMember.status === 'ACTIVE' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{selectedMember.status}</span>
                 <h2 className="text-6xl font-black text-slate-900 mt-6 mb-12 tracking-tighter leading-none">{selectedMember.firstName}<br/>{selectedMember.lastName}</h2>
                 
                 <div className="grid grid-cols-2 gap-8 gap-x-12">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Primary Location</p>
                      <p className="text-lg font-bold text-slate-800">{selectedMember.center}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Membership Type</p>
                      <p className="text-lg font-bold text-slate-800">
                        {selectedMember.type} {selectedMember.sponsor ? <span className="text-[#1080ad] text-sm block">Corporate Sponsored</span> : ''}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact Info</p>
                      <p className="text-sm font-bold text-slate-800 truncate">{selectedMember.email || 'No Email'}<br/>{selectedMember.phone || 'No Phone'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Engagement</p>
                      <p className="text-lg font-bold text-[#1080ad]">{selectedMember.visits} Total Visits</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Renewal Date</p>
                      <p className="text-lg font-bold text-slate-800">{selectedMember.nextPayment}</p>
                    </div>
                 </div>

                 <div className="mt-14 flex gap-4">
                    <button onClick={() => { processCheckIn(selectedMember.id, "Director Override"); setSelectedMember(null); }} className="flex-1 bg-[#001f3f] text-white py-4 rounded-xl font-bold shadow-xl shadow-blue-900/20 active:scale-95 transition-all text-sm">Manual Check-In</button>
                    <button className="px-6 py-4 border-2 rounded-xl text-slate-300 hover:text-blue-500 hover:border-blue-500 transition-all"><Mail size={20}/></button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
