// @ts-nocheck
'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Users, Search, QrCode, CreditCard, X, CheckCircle, 
  AlertCircle, TrendingUp, Calendar, MapPin, Mail, LogOut, 
  ShieldCheck, Phone, Activity, ChevronRight, LayoutDashboard,
  Filter, Download, Bell, FileText, Plus
} from 'lucide-react';

// ============================================================
// QR Code Generator (Original Logic)
// ============================================================
const generateQRMatrix = (data: any) => {
  const size = 21;
  const matrix = Array(size).fill(null).map(() => Array(size).fill(false));
  const addFinder = (row, col) => {
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
  const matrix = generateQRMatrix(data);
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
// Constants & Original Data
// ============================================================
const LOGO_URL = 'https://pattersonhc.org/sites/default/files/wellness_white.png';
const DIRECTORS = [
  { username: 'harper_director', password: 'harper2026', name: 'Director — Harper', center: 'Harper' },
  { username: 'anthony_director', password: 'anthony2026', name: 'Director — Anthony', center: 'Anthony' },
  { username: 'admin', password: 'admin2026', name: 'Administrator', center: 'all' },
  { username: 'dev', password: 'dev2026!', name: 'Developer', center: 'all' }
];

const typeLabels = { single: 'Single', family: 'Family', senior: 'Senior', senior_family: 'Senior Family', student: 'Student', corporate: 'Corporate', daypass: 'Day Pass' };
const centerColors = { Harper: '#dba51f', Anthony: '#1080ad' };

// ============================================================
// MAIN APPLICATION
// ============================================================
export default function WellnessHub() {
  const [view, setView] = useState('landing'); // landing, login, kiosk, dashboard
  const [user, setUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [visits, setVisits] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // overview, members, kiosk, notifications, reports
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notifLog, setNotifLog] = useState([]);

  // Fetch Data
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
            email: r.fields['Email'] || '',
            phone: r.fields['Phone'] || '',
            status: (r.fields['Membership Status'] || 'Active').toLowerCase(),
            type: (r.fields['Membership Type'] || 'Single').toLowerCase().replace(/ /g, '_'),
            center: r.fields['Home Center'] || 'Anthony',
            visits: r.fields['Total Visits'] || 0,
            nextPayment: r.fields['Next Payment Due'] || null,
            sponsor: r.fields['Corporate Sponsor'] || null
          }));
          setMembers(mapped);
        }
        setLoading(false);
      }).catch(() => setLoading(false));
  }, []);

  // Helpers
  const stats = {
    total: members.length,
    active: members.filter(m => m.status === 'active').length,
    attention: members.filter(m => m.status === 'overdue' || m.status === 'expiring').length
  };

  const filteredMembers = members.filter(m => 
    `${m.firstName} ${m.lastName} ${m.id}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- VIEWS ---

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-[#001f3f] flex flex-col items-center justify-center p-6 text-white overflow-hidden relative font-sans">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -mr-48 -mt-48"></div>
        <div className="z-10 text-center max-w-4xl w-full">
          <img src={LOGO_URL} alt="Logo" className="h-20 mx-auto mb-8 opacity-90" />
          <h1 className="text-6xl font-black mb-4 tracking-tighter">WELLNESS HUB</h1>
          <p className="text-blue-200/60 text-xl mb-16 uppercase tracking-[0.4em] font-light">Patterson Health Centers</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <button onClick={() => setView('login')} className="group bg-white/5 p-10 rounded-[2.5rem] border border-white/10 hover:bg-white/10 hover:border-blue-400 transition-all text-left">
               <ShieldCheck size={40} className="text-blue-400 mb-6" />
               <h3 className="text-2xl font-bold mb-2">Director Portal</h3>
               <p className="text-slate-400 mb-6 text-sm">Manage database, exports, and member billing status.</p>
               <div className="flex items-center gap-2 text-blue-400 font-bold group-hover:translate-x-2 transition-transform">Enter Dashboard <ChevronRight size={18} /></div>
            </button>
            <button onClick={() => setView('kiosk')} className="group bg-white/5 p-10 rounded-[2.5rem] border border-white/10 hover:bg-white/10 hover:border-emerald-400 transition-all text-left">
               <QrCode size={40} className="text-emerald-400 mb-6" />
               <h3 className="text-2xl font-bold mb-2">iPad Badge-In</h3>
               <p className="text-slate-400 mb-6 text-sm">Member self-service kiosk for quick check-in.</p>
               <div className="flex items-center gap-2 text-emerald-400 font-bold group-hover:translate-x-2 transition-transform">Start Scanner <ChevronRight size={18} /></div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-[#001f3f] flex items-center justify-center p-4">
        <div className="bg-white rounded-[2rem] shadow-2xl p-10 w-full max-w-md">
          <h2 className="text-3xl font-black text-center text-slate-900 mb-8">Director Access</h2>
          <input type="text" placeholder="Username" id="user" className="w-full p-4 bg-slate-100 rounded-2xl mb-4 outline-none" />
          <input type="password" placeholder="Password" id="pass" className="w-full p-4 bg-slate-100 rounded-2xl mb-6 outline-none" />
          <button onClick={() => {
            const u = document.getElementById('user').value;
            const p = document.getElementById('pass').value;
            const found = DIRECTORS.find(d => d.username === u && d.password === p);
            if(found) { setUser(found); setView('dashboard'); } else { alert('Invalid Login'); }
          }} className="w-full bg-[#001f3f] text-white p-5 rounded-2xl font-bold text-lg shadow-xl">Sign In</button>
          <button onClick={() => setView('landing')} className="w-full mt-4 text-slate-400 font-bold text-sm">Cancel</button>
        </div>
      </div>
    );
  }

  // --- DASHBOARD UI ---
  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans">
      {/* Sidebar */}
      <aside className="w-24 bg-[#001f3f] flex flex-col items-center py-10 text-white shadow-2xl z-20">
        <div className="p-3 bg-blue-500 rounded-2xl shadow-lg mb-12"><Activity size={32} /></div>
        <div className="flex-1 space-y-8">
          <button onClick={() => setActiveTab('overview')} className={`p-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'}`}><LayoutDashboard size={24}/></button>
          <button onClick={() => setActiveTab('members')} className={`p-3 rounded-xl transition-all ${activeTab === 'members' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'}`}><Users size={24}/></button>
          <button onClick={() => setActiveTab('notifications')} className={`p-3 rounded-xl transition-all ${activeTab === 'notifications' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'}`}><Bell size={24}/></button>
          <button onClick={() => setActiveTab('reports')} className={`p-3 rounded-xl transition-all ${activeTab === 'reports' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'}`}><FileText size={24}/></button>
        </div>
        <button onClick={() => { setUser(null); setView('landing'); }} className="p-3 rounded-xl text-slate-400 hover:text-red-400 transition-colors mt-auto"><LogOut size={24} /></button>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8 md:p-12 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-2">Director Dashboard</h1>
            <p className="text-slate-400 font-medium">System Role: {user?.name} · {user?.center === 'all' ? 'All Centers' : user?.center}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border flex items-center gap-4">
             <div className={`w-3 h-3 rounded-full animate-pulse bg-green-500`}></div>
             <span className="text-sm font-bold text-slate-600 uppercase tracking-widest">Airtable Connected</span>
          </div>
        </div>

        {/* TAB: OVERVIEW */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm flex items-center justify-between">
                <div><p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-2">Total Members</p><h3 className="text-5xl font-black text-slate-900">{stats.total}</h3></div>
                <Users size={48} className="text-slate-200" />
              </div>
              <div className="bg-emerald-50/50 p-8 rounded-[2.5rem] border border-emerald-100 shadow-sm flex items-center justify-between">
                <div><p className="text-emerald-600 font-black uppercase text-[10px] tracking-widest mb-2">Active Access</p><h3 className="text-5xl font-black text-emerald-600">{stats.active}</h3></div>
                <CheckCircle size={48} className="text-emerald-200" />
              </div>
              <div className="bg-red-50/50 p-8 rounded-[2.5rem] border border-red-100 shadow-sm flex items-center justify-between">
                <div><p className="text-red-600 font-black uppercase text-[10px] tracking-widest mb-2">Attention Required</p><h3 className="text-5xl font-black text-red-600">{stats.attention}</h3></div>
                <AlertCircle size={48} className="text-red-200" />
              </div>
            </div>
            <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-slate-200/50 border border-white">
               <h3 className="text-2xl font-black mb-8">Recent System Activity</h3>
               <div className="space-y-4">
                  {visits.length === 0 ? <p className="text-slate-300 italic">No check-ins logged in this session.</p> : visits.slice(0,5).map((v, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                      <span className="font-bold">{v.name}</span>
                      <span className="text-slate-400 text-sm">{v.center} · {new Date(v.time).toLocaleTimeString()}</span>
                    </div>
                  ))}
               </div>
            </div>
          </>
        )}

        {/* TAB: MEMBERS */}
        {activeTab === 'members' && (
          <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-white">
            <div className="flex justify-between items-center mb-10">
               <h2 className="text-3xl font-black">Member Directory</h2>
               <div className="relative w-full max-w-md">
                 <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                 <input type="text" placeholder="Search name or ID..." className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-100 border-none outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMembers.map(m => (
                <div key={m.id} onClick={() => setSelectedMember(m)} className="p-6 rounded-[2rem] border bg-white hover:shadow-2xl transition-all cursor-pointer relative overflow-hidden">
                   <div className="flex justify-between items-start mb-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${m.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{m.status}</span>
                      <span className="text-[10px] font-mono text-slate-300">#{m.id}</span>
                   </div>
                   <h4 className="text-xl font-black mb-1">{m.firstName} {m.lastName}</h4>
                   <p className="text-slate-400 text-xs mb-4">{m.email}</p>
                   <div className="pt-4 border-t flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span>{m.center}</span>
                      <span>{m.visits} Visits</span>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: REPORTS (Original Restoration) */}
        {activeTab === 'reports' && (
          <div className="space-y-8">
            <div className="bg-white rounded-[3rem] p-10 shadow-xl border-l-8 border-[#dd6d22]">
               <div className="flex justify-between items-center mb-6">
                 <div>
                   <h3 className="text-2xl font-black text-[#001f3f]">HD6 Employee Wellness</h3>
                   <p className="text-slate-400">Participation data for corporate partnership.</p>
                 </div>
                 <button onClick={() => {
                   const hd6 = members.filter(m => m.sponsor === 'HD6');
                   const csv = ["ID,Name,Center,Visits", ...hd6.map(m => `${m.id},${m.firstName} ${m.lastName},${m.center},${m.visits}`)].join('\n');
                   const blob = new Blob([csv], { type: 'text/csv' });
                   const url = window.URL.createObjectURL(blob);
                   const a = document.createElement('a'); a.href = url; a.download = 'HD6_Report.csv'; a.click();
                 }} className="bg-[#dd6d22] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-orange-500/20"><Download size={20}/> Export HD6 CSV</button>
               </div>
               <div className="grid grid-cols-3 gap-6">
                 <div className="bg-slate-50 p-6 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Sponsored Count</p>
                    <p className="text-3xl font-black">{members.filter(m => m.sponsor === 'HD6').length}</p>
                 </div>
                 <div className="bg-slate-50 p-6 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Total Usage</p>
                    <p className="text-3xl font-black text-blue-600">{members.filter(m => m.sponsor === 'HD6').reduce((s, m) => s + m.visits, 0)}</p>
                 </div>
               </div>
            </div>
          </div>
        )}
      </main>

      {/* DETAIL MODAL */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#001f3f]/90 backdrop-blur-xl" onClick={() => setSelectedMember(null)}></div>
          <div className="bg-white rounded-[3rem] w-full max-w-4xl overflow-hidden shadow-2xl z-10 flex flex-col md:flex-row relative">
            <button onClick={() => setSelectedMember(null)} className="absolute top-8 right-8 p-2 bg-slate-100 rounded-full hover:bg-red-500 hover:text-white transition-all"><X /></button>
            <div className="md:w-1/3 bg-slate-50 p-12 flex flex-col items-center justify-center border-r">
               <div className="bg-white p-6 rounded-[2.5rem] shadow-xl mb-8 border">
                  <QRCode data={selectedMember.id} size={200} />
               </div>
               <p className="text-xs font-black text-slate-300 uppercase tracking-widest mb-1">Digital Badge ID</p>
               <p className="text-2xl font-black text-[#001f3f]">#{selectedMember.id}</p>
            </div>
            <div className="flex-1 p-16">
               <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedMember.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{selectedMember.status}</span>
               <h2 className="text-6xl font-black text-slate-900 mt-4 mb-8 leading-none">{selectedMember.firstName}<br/>{selectedMember.lastName}</h2>
               <div className="grid grid-cols-2 gap-10">
                  <div><p className="text-[10px] font-black text-slate-300 uppercase mb-1 tracking-widest">Center Location</p><p className="text-lg font-bold">{selectedMember.center}</p></div>
                  <div><p className="text-[10px] font-black text-slate-300 uppercase mb-1 tracking-widest">Membership</p><p className="text-lg font-bold">{typeLabels[selectedMember.type] || 'Standard'}</p></div>
                  <div><p className="text-[10px] font-black text-slate-300 uppercase mb-1 tracking-widest">Total Visits</p><p className="text-lg font-bold text-blue-600">{selectedMember.visits}</p></div>
                  <div><p className="text-[10px] font-black text-slate-300 uppercase mb-1 tracking-widest">Renew Date</p><p className="text-lg font-bold">{selectedMember.nextPayment || 'N/A'}</p></div>
               </div>
               <div className="mt-12 flex gap-4">
                  <button onClick={() => {
                    const nv = { name: `${selectedMember.firstName} ${selectedMember.lastName}`, center: selectedMember.center, time: new Date().toISOString() };
                    setVisits(prev => [nv, ...prev]);
                    alert('Member signed in!');
                  }} className="flex-1 bg-[#001f3f] text-white py-4 rounded-2xl font-bold shadow-lg">Manual Sign-In</button>
                  <button className="px-6 py-4 border rounded-2xl text-slate-400 hover:bg-slate-50 transition-all"><Mail size={20}/></button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
