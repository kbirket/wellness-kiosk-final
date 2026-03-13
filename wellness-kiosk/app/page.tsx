// @ts-nocheck
'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Users, Search, QrCode, CreditCard, X, CheckCircle, 
  AlertCircle, TrendingUp, Calendar, MapPin, Mail, LogOut, 
  ShieldCheck, Phone, Activity, ChevronRight, LayoutDashboard,
  Filter, Download, Bell, FileText, Plus, Smartphone, Clock
} from 'lucide-react';

// ============================================================
// QR Code Generator Logic (Original)
// ============================================================
const generateQRMatrix = (data: any) => {
  const size = 21;
  const matrix = Array(size).fill(null).map(() => Array(size).fill(false));
  const addFinder = (row: number, col: number) => {
    for (let r = 0; r < 7; r++)
      for (let c = 0; c < 7; c++)
        if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4))
          if (row + r < size && col + c < size) matrix[row + r][col + c] = true;
  };
  addFinder(0, 0); addFinder(0, size - 7); addFinder(size - 7, 0);
  let hash = 0;
  for (let i = 0; i < data.length; i++) hash = ((hash << 5) - hash + data.charCodeAt(i)) | 0;
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (!matrix[r][c]) {
        const val = Math.abs((hash * (r * size + c + 1) * 7919) % 100);
        if (val < 45) matrix[r][c] = true;
      }
  return matrix;
};

const QRCode = ({ data, size = 160, darkColor = '#001f3f' }: any) => {
  const matrix = generateQRMatrix(data || "Empty");
  const cellSize = size / matrix.length;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="#fff" rx="4" />
      {matrix.map((row, r) => row.map((cell, c) => cell ? (
        <rect key={`${r}-${c}`} x={c * cellSize} y={r * cellSize} width={cellSize + 0.5} height={cellSize + 0.5} fill={darkColor} />
      ) : null))}
    </svg>
  );
};

// ============================================================
// Constants & Original Data Structure
// ============================================================
const LOGO_URL = 'https://pattersonhc.org/sites/default/files/wellness_white.png';
const CENTERS = ['Harper', 'Anthony'];
const centerColors = { Harper: '#dba51f', Anthony: '#1080ad' };
const DIRECTORS = [
  { username: 'harper_director', password: 'harper2026', name: 'Director — Harper', center: 'Harper' },
  { username: 'anthony_director', password: 'anthony2026', name: 'Director — Anthony', center: 'Anthony' },
  { username: 'admin', password: 'admin2026', name: 'Administrator', center: 'all' },
  { username: 'dev', password: 'dev2026!', name: 'Developer', center: 'all' }
];
const typeLabels = { single: 'Single', family: 'Family', senior: 'Senior', senior_family: 'Senior Family', student: 'Student', corporate: 'Corporate', corporate_family: 'Corp. Family', daypass: 'Day Pass' };
const typeColors = { single: '#1080ad', family: '#003d6b', senior: '#16a34a', senior_family: '#059669', student: '#8b5cf6', corporate: '#dd6d22', corporate_family: '#c2410c', daypass: '#dba51f' };

// ============================================================
// MAIN APPLICATION
// ============================================================
export default function WellnessHub() {
  const [view, setView] = useState('landing'); 
  const [user, setUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [visits, setVisits] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notifLog, setNotifLog] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Kiosk Specific States
  const [kioskCenter, setKioskCenter] = useState(null);
  const [kioskInput, setKioskInput] = useState('');
  const [kioskResult, setKioskResult] = useState(null);

  // --- 1. DATA FETCHING ---
  useEffect(() => {
    setLoading(true);
    fetch('/api/members')
      .then(res => res.json())
      .then(data => {
        if (data.records) {
          const mapped = data.records.map(r => ({
            id: r.fields['Member ID'] || r.id,
            firstName: r.fields['First Name'] || 'Unknown',
            lastName: r.fields['Last Name'] || '',
            fullName: r.fields['Full Name'] || 'Unknown Member',
            email: r.fields['Email'] || '',
            phone: r.fields['Phone'] || '',
            status: (r.fields['Membership Status'] || 'Active').toLowerCase(),
            type: (r.fields['Membership Type']?.[0] || 'Single').toLowerCase().replace(/ /g, '_'),
            center: r.fields['Home Center'] || 'Anthony',
            visits: r.fields['Total Visits'] || 0,
            nextPayment: r.fields['Next Payment Due'] || null,
            sponsor: r.fields['Corporate Sponsor'] || null,
            billing: r.fields['Billing Method'] || 'Month-to-Month',
            address: r.fields['Full Address'] || ''
          }));
          setMembers(mapped);
        }
        setLoading(false);
      }).catch(() => setLoading(false));
  }, []);

  // --- 2. LOGIC HELPERS ---
  const stats = {
    total: members.length,
    active: members.filter(m => m.status === 'active').length,
    attention: members.filter(m => m.status === 'overdue' || m.status === 'expiring').length,
    today: visits.length
  };

  const filteredMembers = members.filter(m => 
    `${m.firstName} ${m.lastName} ${m.id}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleKioskCheckIn = () => {
    const id = kioskInput.toUpperCase().trim();
    const member = members.find(m => m.id === id);
    if (member) {
      const newVisit = { name: member.fullName, center: kioskCenter, time: new Date().toISOString(), type: member.type };
      setVisits(prev => [newVisit, ...prev]);
      if (member.status === 'overdue') {
        setKioskResult({ ok: false, title: 'Attention Required', msg: `${member.firstName}, your membership is past due. Please see the desk.`, member });
      } else {
        setKioskResult({ ok: true, title: `Welcome, ${member.firstName}!`, msg: 'Access Granted. Enjoy your workout!', member });
      }
    } else {
      setKioskResult({ ok: false, title: 'Not Found', msg: 'We could not find that Member ID. Please try again.' });
    }
    setKioskInput('');
    setTimeout(() => setKioskResult(null), 5000);
  };

  // --- VIEWS ---

  // A. LANDING
  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-[#001f3f] flex flex-col items-center justify-center p-6 text-white font-sans relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] -mr-48 -mt-48"></div>
        <div className="z-10 text-center max-w-4xl w-full">
          <img src={LOGO_URL} alt="Patterson" className="h-24 mx-auto mb-10 opacity-90" />
          <h1 className="text-7xl font-black mb-4 tracking-tighter italic">WELLNESS HUB</h1>
          <p className="text-blue-200/60 text-xl mb-16 uppercase tracking-[0.5em] font-light">Anthony & Harper Health Centers</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <button onClick={() => setView('login')} className="group bg-white/5 p-12 rounded-[3rem] border border-white/10 hover:bg-white/10 hover:border-blue-400 transition-all text-left">
               <ShieldCheck size={48} className="text-blue-400 mb-6" />
               <h3 className="text-3xl font-bold mb-2">Director Portal</h3>
               <p className="text-slate-400 mb-8 leading-relaxed">Full management suite for membership records, billing, and corporate reporting.</p>
               <div className="flex items-center gap-2 text-blue-400 font-bold group-hover:translate-x-2 transition-transform">Authorize Access <ChevronRight size={20} /></div>
            </button>
            <button onClick={() => setView('kiosk')} className="group bg-white/5 p-12 rounded-[3rem] border border-white/10 hover:bg-white/10 hover:border-emerald-400 transition-all text-left">
               <Smartphone size={48} className="text-emerald-400 mb-6" />
               <h3 className="text-3xl font-bold mb-2">iPad Badge-In</h3>
               <p className="text-slate-400 mb-8 leading-relaxed">Self-service station for members to check-in via QR code or manual ID entry.</p>
               <div className="flex items-center gap-2 text-emerald-400 font-bold group-hover:translate-x-2 transition-transform">Open Kiosk <ChevronRight size={20} /></div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // B. LOGIN
  if (view === 'login') {
    return (
      <div className="min-h-screen bg-[#001f3f] flex items-center justify-center p-4">
        <div className="bg-white rounded-[3rem] shadow-2xl p-12 w-full max-w-md">
          <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Login</h2>
          <p className="text-slate-400 mb-10 font-medium tracking-tight">Enter director credentials to proceed.</p>
          <input type="text" placeholder="Username" id="u_in" className="w-full p-5 bg-slate-100 rounded-2xl mb-4 outline-none border-2 border-transparent focus:border-blue-500/20 text-lg" />
          <input type="password" placeholder="Password" id="p_in" className="w-full p-5 bg-slate-100 rounded-2xl mb-8 outline-none border-2 border-transparent focus:border-blue-500/20 text-lg" />
          <button onClick={() => {
            const u = document.getElementById('u_in').value;
            const p = document.getElementById('p_in').value;
            const found = DIRECTORS.find(d => d.username === u && d.password === p);
            if(found) { setUser(found); setView('dashboard'); } else { alert('Invalid credentials'); }
          }} className="w-full bg-[#001f3f] text-white p-5 rounded-2xl font-bold text-xl shadow-xl hover:bg-blue-900 transition-all">Sign In</button>
          <button onClick={() => setView('landing')} className="w-full mt-6 text-slate-400 font-bold">Cancel</button>
        </div>
      </div>
    );
  }

  // C. KIOSK (iPad Mode)
  if (view === 'kiosk') {
    if (!kioskCenter) {
      return (
        <div className="min-h-screen bg-[#001f3f] flex flex-col items-center justify-center p-6 text-white font-sans">
          <h2 className="text-4xl font-black mb-2">Location Setup</h2>
          <p className="text-blue-200/50 mb-12 uppercase tracking-widest font-bold">Select the center for this iPad</p>
          <div className="flex gap-8">
            {CENTERS.map(c => (
              <button key={c} onClick={() => setKioskCenter(c)} className="w-64 p-12 rounded-[2.5rem] border-2 border-white/10 hover:border-blue-400 bg-white/5 transition-all">
                <div className="text-6xl font-black mb-4" style={{ color: centerColors[c] }}>{c[0]}</div>
                <div className="text-2xl font-bold">{c}</div>
              </button>
            ))}
          </div>
          <button onClick={() => setView('landing')} className="mt-12 text-slate-500 font-bold">Exit Kiosk</button>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-[#001f3f] flex flex-col items-center justify-center p-6 text-white font-sans relative">
        <button onClick={() => setKioskCenter(null)} className="absolute top-8 left-8 text-slate-500 font-bold">← Change Location</button>
        <div className="text-center max-w-xl w-full">
           {!kioskResult ? (
             <>
               <img src={LOGO_URL} className="h-20 mx-auto mb-10" />
               <h2 className="text-5xl font-black mb-4">Welcome!</h2>
               <p className="text-blue-200/50 mb-12 text-lg uppercase tracking-widest font-bold">Scan Badge or Enter ID</p>
               <input 
                autoFocus
                value={kioskInput}
                onChange={(e) => setKioskInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleKioskCheckIn()}
                placeholder="WC-000"
                className="w-full p-8 bg-white/10 rounded-[2rem] text-center text-4xl font-black tracking-widest border-4 border-white/5 outline-none mb-8 placeholder:text-white/5" 
               />
               <button onClick={handleKioskCheckIn} className="w-full py-6 rounded-[2rem] text-2xl font-black uppercase tracking-widest shadow-2xl" style={{ backgroundColor: centerColors[kioskCenter] }}>Check In</button>
             </>
           ) : (
             <div className={`p-16 rounded-[3rem] border-4 ${kioskResult.ok ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-red-500/10 border-red-500/50'}`}>
                <div className={`w-24 h-24 rounded-full mx-auto mb-8 flex items-center justify-center ${kioskResult.ok ? 'bg-emerald-500' : 'bg-red-500'}`}>
                   {kioskResult.ok ? <CheckCircle size={48}/> : <AlertCircle size={48}/>}
                </div>
                <h2 className="text-5xl font-black mb-4">{kioskResult.title}</h2>
                <p className="text-xl text-slate-300 leading-relaxed mb-8">{kioskResult.msg}</p>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                   <div className={`h-full animate-[shrink_5s_linear_forwards] ${kioskResult.ok ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                </div>
                <style>{`@keyframes shrink { from { width: 100%; } to { width: 0%; } }`}</style>
             </div>
           )}
        </div>
      </div>
    );
  }

  // D. DASHBOARD UI
  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans">
      <aside className="w-24 bg-[#001f3f] flex flex-col items-center py-10 text-white shadow-2xl z-20">
        <div className="p-3 bg-blue-500 rounded-2xl shadow-lg mb-12"><Activity size={32} /></div>
        <div className="flex-1 space-y-10">
          <button onClick={() => setActiveTab('overview')} className={`p-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-white/20 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}><LayoutDashboard size={24}/></button>
          <button onClick={() => setActiveTab('members')} className={`p-3 rounded-xl transition-all ${activeTab === 'members' ? 'bg-white/20 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}><Users size={24}/></button>
          <button onClick={() => setActiveTab('notifications')} className={`p-3 rounded-xl transition-all ${activeTab === 'notifications' ? 'bg-white/20 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}><Bell size={24}/></button>
          <button onClick={() => setActiveTab('reports')} className={`p-3 rounded-xl transition-all ${activeTab === 'reports' ? 'bg-white/20 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}><FileText size={24}/></button>
        </div>
        <button onClick={() => { setUser(null); setView('landing'); }} className="p-3 rounded-xl text-slate-400 hover:text-red-400 transition-colors mt-auto"><LogOut size={24} /></button>
      </aside>

      <main className="flex-1 p-8 md:p-12 max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-2 uppercase">Director Portal</h1>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">Patterson Health · {user?.name}</p>
          </div>
          <div className="flex gap-4">
             <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-[#001f3f] text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-blue-900/20 hover:-translate-y-1 transition-all"><Plus size={20}/> New Enrollment</button>
          </div>
        </div>

        {/* TAB: OVERVIEW */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm flex items-center justify-between">
                <div><p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-1">Total</p><h3 className="text-4xl font-black">{stats.total}</h3></div>
                <Users size={32} className="text-slate-200" />
              </div>
              <div className="bg-emerald-50/50 p-8 rounded-[2.5rem] border border-emerald-100 flex items-center justify-between">
                <div><p className="text-emerald-600 font-black uppercase text-[10px] tracking-widest mb-1">Active</p><h3 className="text-4xl font-black text-emerald-600">{stats.active}</h3></div>
                <CheckCircle size={32} className="text-emerald-200" />
              </div>
              <div className="bg-red-50/50 p-8 rounded-[2.5rem] border border-red-100 flex items-center justify-between">
                <div><p className="text-red-600 font-black uppercase text-[10px] tracking-widest mb-1">Due</p><h3 className="text-4xl font-black text-red-600">{stats.attention}</h3></div>
                <AlertCircle size={32} className="text-red-200" />
              </div>
              <div className="bg-blue-50/50 p-8 rounded-[2.5rem] border border-blue-100 flex items-center justify-between">
                <div><p className="text-blue-600 font-black uppercase text-[10px] tracking-widest mb-1">Today</p><h3 className="text-4xl font-black text-blue-600">{stats.today}</h3></div>
                <Clock size={32} className="text-blue-200" />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="bg-white rounded-[3rem] p-10 shadow-xl border overflow-hidden">
                  <h3 className="text-2xl font-black mb-8">Recent Check-ins</h3>
                  <div className="space-y-4">
                     {visits.length === 0 ? <p className="text-slate-300 italic">No check-ins today.</p> : visits.map((v, i) => (
                       <div key={i} className="flex justify-between items-center p-5 bg-slate-50 rounded-[1.5rem]">
                         <div><p className="font-black text-slate-800">{v.name}</p><p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{v.center} Wellness Center</p></div>
                         <div className="text-right"><p className="font-bold text-blue-600">{new Date(v.time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p><p className="text-[10px] font-black uppercase text-slate-300 tracking-tighter">{typeLabels[v.type] || 'Standard'}</p></div>
                       </div>
                     ))}
                  </div>
               </div>
               <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-[#dba51f]/20">
                  <h3 className="text-2xl font-black mb-8 text-[#001f3f]">Center Usage</h3>
                  <div className="space-y-6">
                     {CENTERS.map(c => {
                       const count = members.filter(m => m.center === c).length;
                       const p = Math.round((count / members.length) * 100);
                       return (
                         <div key={c}>
                            <div className="flex justify-between mb-2"><span className="font-black uppercase tracking-widest text-xs">{c} Center</span><span className="font-black">{count} members ({p}%)</span></div>
                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden"><div className="h-full transition-all duration-1000" style={{ width: `${p}%`, backgroundColor: centerColors[c] }}></div></div>
                         </div>
                       );
                     })}
                  </div>
               </div>
            </div>
          </>
        )}

        {/* TAB: MEMBERS */}
        {activeTab === 'members' && (
          <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-white">
            <div className="flex justify-between items-center mb-12">
               <h2 className="text-3xl font-black tracking-tight uppercase">Member Database</h2>
               <div className="relative w-full max-w-md">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={22} />
                 <input type="text" placeholder="Find by Name, Email, or ID..." className="w-full pl-16 pr-6 py-5 rounded-2xl bg-slate-100 border-none outline-none text-lg focus:ring-4 focus:ring-blue-500/10 transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
               </div>
            </div>
            {loading ? <div className="text-center py-20 text-slate-300 font-bold italic">Syncing Airtable...</div> : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMembers.map(m => (
                  <div key={m.id} onClick={() => setSelectedMember(m)} className="group p-8 rounded-[2.5rem] border bg-white hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer relative overflow-hidden">
                     <div className={`absolute top-0 right-0 w-32 h-32 -mr-12 -mt-12 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity ${m.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                     <div className="flex justify-between items-start mb-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] ${m.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>{m.status}</span>
                        <span className="text-xs font-mono text-slate-300 font-black">#{m.id}</span>
                     </div>
                     <h4 className="text-2xl font-black mb-1 leading-tight group-hover:text-blue-700 transition-colors">{m.firstName}<br/>{m.lastName}</h4>
                     <p className="text-slate-400 text-sm font-medium mb-6 truncate">{m.email}</p>
                     <div className="pt-6 border-t flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest p-2 rounded-lg bg-slate-50 text-slate-500">{m.center}</span>
                        <span className="text-sm font-black text-slate-700">{m.visits} <span className="text-xs font-normal text-slate-400">Visits</span></span>
                     </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: NOTIFICATIONS (Restored) */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-white">
             <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black tracking-tight uppercase">Reminders & Log</h2>
                <button onClick={() => alert('Sending bulk reminders...')} className="bg-orange-500 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-orange-600 transition-all flex items-center gap-2">Send All Overdue</button>
             </div>
             <div className="space-y-4">
                {members.filter(m => m.status === 'overdue').map(m => (
                  <div key={m.id} className="flex justify-between items-center p-6 bg-red-50/50 border border-red-100 rounded-3xl">
                     <div><p className="font-black text-red-900">{m.fullName}</p><p className="text-xs text-red-400 font-bold uppercase">Balance Unpaid since {m.nextPayment || 'TBD'}</p></div>
                     <div className="flex gap-4">
                        <button className="p-4 bg-white rounded-xl text-blue-500 border border-blue-100 shadow-sm"><Mail size={20}/></button>
                        <button className="p-4 bg-white rounded-xl text-orange-500 border border-orange-100 shadow-sm"><Phone size={20}/></button>
                     </div>
                  </div>
                ))}
                {notifLog.length === 0 && <p className="text-center py-10 text-slate-300 italic font-medium">No sent logs for this session.</p>}
             </div>
          </div>
        )}

        {/* TAB: REPORTS (Restored) */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-[3rem] p-10 shadow-xl border-l-8 border-[#dd6d22]">
             <div className="flex justify-between items-center mb-12">
               <div><h3 className="text-3xl font-black text-[#001f3f] tracking-tight uppercase">HD6 Corporate Export</h3><p className="text-slate-400 mt-1">Payroll-ready CSV data for employee participation.</p></div>
               <button onClick={() => {
                 const hd6 = members.filter(m => m.sponsor && m.sponsor.includes('Harper'));
                 const csv = ["ID,Name,Email,Visits,Center", ...hd6.map(m => `${m.id},"${m.fullName}",${m.email},${m.visits},${m.center}`)].join('\n');
                 const blob = new Blob([csv], { type: 'text/csv' });
                 const url = window.URL.createObjectURL(blob);
                 const a = document.createElement('a'); a.href = url; a.download = `HD6_Report_${new Date().toISOString().slice(0,10)}.csv`; a.click();
               }} className="bg-[#dd6d22] text-white px-8 py-5 rounded-2xl font-black flex items-center gap-3 shadow-2xl hover:bg-orange-700 transition-all"><Download size={22}/> Download CSV</button>
             </div>
             <div className="grid grid-cols-3 gap-8">
                <div className="bg-slate-50 p-10 rounded-[2.5rem]"><p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.2em]">Employees</p><p className="text-6xl font-black">{members.filter(m => m.sponsor?.includes('Harper')).length}</p></div>
                <div className="bg-slate-50 p-10 rounded-[2.5rem]"><p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.2em]">Total Usage</p><p className="text-6xl font-black text-blue-600">{members.filter(m => m.sponsor?.includes('Harper')).reduce((s, m) => s + m.visits, 0)}</p></div>
             </div>
          </div>
        )}
      </main>

      {/* MODAL: ADD MEMBER (Restored) */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#001f3f]/80 backdrop-blur-md">
           <div className="bg-white rounded-[3rem] w-full max-w-3xl overflow-hidden shadow-2xl p-12">
              <h2 className="text-3xl font-black mb-8 uppercase tracking-tighter">New Enrollment</h2>
              <div className="grid grid-cols-2 gap-6 mb-10">
                 <input placeholder="First Name" className="p-5 bg-slate-100 rounded-2xl outline-none" />
                 <input placeholder="Last Name" className="p-5 bg-slate-100 rounded-2xl outline-none" />
                 <input placeholder="Email" className="p-5 bg-slate-100 rounded-2xl outline-none col-span-2" />
                 <select className="p-5 bg-slate-100 rounded-2xl outline-none">
                    {Object.entries(typeLabels).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                 </select>
                 <select className="p-5 bg-slate-100 rounded-2xl outline-none">
                    {CENTERS.map(c => <option key={c} value={c}>{c} Center</option>)}
                 </select>
              </div>
              <div className="flex gap-4">
                 <button onClick={() => setShowAddModal(false)} className="flex-1 py-5 rounded-2xl font-black text-slate-400">Cancel</button>
                 <button onClick={() => { alert('Saving to Airtable...'); setShowAddModal(false); }} className="flex-1 py-5 bg-[#001f3f] text-white rounded-2xl font-black shadow-xl">Enroll Member</button>
              </div>
           </div>
        </div>
      )}

      {/* MODAL: MEMBER DETAIL */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#001f3f]/90 backdrop-blur-xl" onClick={() => setSelectedMember(null)}></div>
          <div className="bg-white rounded-[4rem] w-full max-w-5xl overflow-hidden shadow-2xl z-10 flex flex-col md:flex-row relative">
            <button onClick={() => setSelectedMember(null)} className="absolute top-10 right-10 p-3 bg-slate-100 rounded-full hover:bg-red-500 hover:text-white transition-all"><X size={24}/></button>
            <div className="md:w-1/3 bg-slate-50 p-16 flex flex-col items-center justify-center border-r">
               <div className="bg-white p-8 rounded-[3rem] shadow-2xl mb-10 border-2 border-white">
                  <QRCode data={selectedMember.id} size={220} />
               </div>
               <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-2">Member ID</p>
               <p className="text-3xl font-black text-[#001f3f] tracking-tighter">#{selectedMember.id}</p>
            </div>
            <div className="flex-1 p-20">
               <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedMember.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>{selectedMember.status}</span>
               <h2 className="text-7xl font-black text-slate-900 mt-6 mb-12 leading-none tracking-tighter">{selectedMember.firstName}<br/>{selectedMember.lastName}</h2>
               <div className="grid grid-cols-2 gap-y-12 gap-x-16">
                  <div><p className="text-[10px] font-black text-slate-300 uppercase mb-2 tracking-widest">Wellness Center</p><p className="text-xl font-bold text-slate-800">{selectedMember.center}</p></div>
                  <div><p className="text-[10px] font-black text-slate-300 uppercase mb-2 tracking-widest">Billing Plan</p><p className="text-xl font-bold text-slate-800">{selectedMember.billing}</p></div>
                  <div><p className="text-[10px] font-black text-slate-300 uppercase mb-2 tracking-widest">History</p><p className="text-xl font-bold text-blue-600">{selectedMember.visits} Check-ins</p></div>
                  <div><p className="text-[10px] font-black text-slate-300 uppercase mb-2 tracking-widest">Renew Date</p><p className="text-xl font-bold text-slate-800">{selectedMember.nextPayment || 'N/A'}</p></div>
               </div>
               <div className="mt-16 flex gap-6">
                  <button onClick={() => { setVisits(prev => [{name: selectedMember.fullName, center: selectedMember.center, time: new Date().toISOString(), type: selectedMember.type}, ...prev]); alert('Manual check-in recorded.'); setSelectedMember(null); }} className="flex-1 bg-[#001f3f] text-white py-6 rounded-3xl font-black shadow-2xl hover:bg-blue-900 transition-all active:scale-95 text-lg">Record Entry</button>
                  <button className="px-8 py-6 border-2 rounded-3xl text-slate-300 hover:text-blue-500 hover:border-blue-500 transition-all"><Mail size={28}/></button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
