// @ts-nocheck
'use client';
import { useState, useEffect, useRef } from 'react';

// ============================================================
// QR Code Generator & Icons (Matching Screenshots)
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

const QRCode = ({ data, size = 160, darkColor = '#003d6b' }: any) => {
  const matrix = generateQRMatrix(data || "WC-000");
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

// Reusable SVG Icons from your professional build
const Icons = {
  dashboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
  members: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  badge: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><line x1="7" y1="12" x2="17" y2="12" /></svg>,
  notif: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
  search: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
  mail: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>,
  phone: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>,
  clock: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
};

// ============================================================
// MAIN APPLICATION
// ============================================================
export default function WellnessHub() {
  const [view, setView] = useState('landing'); 
  const [user, setUser] = useState({ name: 'Administrator', username: 'admin' });
  const [members, setMembers] = useState([]);
  const [visits, setVisits] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingCenter, setViewingCenter] = useState('both'); // both, harper, anthony
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(false);

  // Airtable Sync
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
            status: (r.fields['Membership Status'] || 'Active').toUpperCase(),
            type: (r.fields['Membership Type']?.[0] || 'Single').toUpperCase(),
            center: r.fields['Home Center'] || 'Anthony',
            visits: r.fields['Total Visits'] || 0,
            nextPayment: r.fields['Next Payment Due'] || 'Mar 31, 2026',
            phone: r.fields['Phone'] || '(555) 000-0000'
          }));
          setMembers(mapped);
        }
        setLoading(false);
      }).catch(() => setLoading(false));
  }, []);

  // Filter Logic matching "Viewing" sidebar
  const scopedMembers = members.filter(m => viewingCenter === 'both' || m.center.toLowerCase() === viewingCenter);
  const filteredMembers = scopedMembers.filter(m => `${m.firstName} ${m.lastName} ${m.id}`.toLowerCase().includes(searchQuery.toLowerCase()));

  const stats = {
    total: scopedMembers.length,
    active: scopedMembers.filter(m => m.status === 'ACTIVE').length,
    overdue: scopedMembers.filter(m => m.status === 'OVERDUE').length,
    expiring: scopedMembers.filter(m => m.status === 'EXPIRING').length,
    today: visits.length
  };

  // --- UI COMPONENTS ---

  const Sidebar = () => (
    <aside className="w-64 bg-[#003d6b] text-white flex flex-col min-h-screen">
      <div className="p-6 border-b border-white/10">
        <h1 className="text-xl font-bold tracking-tight">Wellness Centers</h1>
      </div>
      
      {/* Profile Section */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[#dba51f] flex items-center justify-center font-bold text-lg">A</div>
          <div>
            <p className="text-sm font-bold leading-none">{user.name}</p>
            <p className="text-[11px] text-white/50">{user.username}</p>
          </div>
        </div>
        <button onClick={() => setView('landing')} className="flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg> Sign Out
        </button>
      </div>

      {/* Center Filter */}
      <div className="px-4 mb-8">
        <p className="px-2 text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">Viewing</p>
        <div className="space-y-1">
          {['Both Centers', 'Harper', 'Anthony'].map(c => {
             const key = c.toLowerCase().split(' ')[0];
             const active = viewingCenter === key;
             return (
               <button key={c} onClick={() => setViewingCenter(key)} className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all ${active ? 'bg-white/20 font-bold' : 'text-white/60 hover:bg-white/5'}`}>{c}</button>
             );
          })}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Icons.dashboard },
          { id: 'members', label: 'Members', icon: Icons.members },
          { id: 'badge', label: 'Badge In', icon: Icons.badge },
          { id: 'notif', label: 'Notifications', icon: Icons.notif },
        ].map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all ${activeTab === item.id ? 'bg-[#1080ad] text-white font-bold shadow-lg' : 'text-white/60 hover:bg-white/5'}`}>
            {item.icon} {item.label}
            {item.id === 'notif' && stats.overdue > 0 && <span className="ml-auto w-5 h-5 rounded-full bg-red-500 text-[10px] flex items-center justify-center font-bold">{stats.overdue}</span>}
          </button>
        ))}
      </nav>
    </aside>
  );

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-[#003d6b] flex items-center justify-center font-sans p-6">
        <div className="text-center">
          <h1 className="text-white text-4xl font-bold mb-12">Wellness Hub</h1>
          <div className="flex gap-6">
             <button onClick={() => setView('dashboard')} className="bg-white/10 border border-white/20 p-10 rounded-2xl text-white hover:bg-white/20 transition-all flex flex-col items-center gap-4 w-64">
                <ShieldCheck size={48} className="text-[#dba51f]" />
                <span className="text-xl font-bold">Director Login</span>
             </button>
             <button onClick={() => {setView('dashboard'); setActiveTab('badge');}} className="bg-white/10 border border-white/20 p-10 rounded-2xl text-white hover:bg-white/20 transition-all flex flex-col items-center gap-4 w-64">
                <Smartphone size={48} className="text-[#1080ad]" />
                <span className="text-xl font-bold">iPad Badge-In</span>
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f0f2f5] font-sans text-slate-800">
      <Sidebar />

      <main className="flex-1 p-10">
        <div className="mb-10">
           <h2 className="text-3xl font-bold text-[#003d6b] capitalize">{activeTab}</h2>
           <p className="text-sm text-slate-400 font-medium">{viewingCenter === 'both' ? 'All Centers' : viewingCenter + ' Center'} · Wednesday, March 11, 2026</p>
        </div>

        {/* VIEW: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <>
            <div className="grid grid-cols-5 gap-6 mb-8">
               {[
                 { l: 'Total Members', v: stats.total, c: '#003d6b' },
                 { l: 'Active', v: stats.active, c: '#16a34a' },
                 { l: 'Overdue', v: stats.overdue, c: '#dc2626' },
                 { l: 'Expiring', v: stats.expiring, c: '#f59e0b' },
                 { l: 'Check-ins Today', v: stats.today, c: '#1080ad' }
               ].map((s, i) => (
                 <div key={i} className="bg-white p-6 rounded-xl shadow-sm border-l-[6px]" style={{ borderLeftColor: s.c }}>
                    <p className="text-5xl font-bold mb-1" style={{ color: s.c }}>{s.v}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">{s.l}</p>
                 </div>
               ))}
            </div>

            <div className="grid grid-cols-2 gap-8">
               <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="text-lg font-bold mb-6 text-[#003d6b]">Today's Check-ins</h3>
                  <div className="space-y-4">
                     {visits.length === 0 ? <p className="text-slate-300 italic">Waiting for activity...</p> : visits.map((v, i) => (
                       <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                         <div><p className="font-bold">{v.name}</p><p className="text-[11px] text-slate-400 uppercase font-bold">{v.center} · {v.type}</p></div>
                         <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">{Icons.clock} {new Date(v.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                       </div>
                     ))}
                  </div>
               </div>
               <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="text-lg font-bold mb-6 text-[#003d6b]">Needs Attention</h3>
                  <div className="space-y-4">
                     {scopedMembers.filter(m => m.status !== 'ACTIVE').map(m => (
                       <div key={m.id} className={`flex items-center justify-between p-4 rounded-xl border ${m.status === 'OVERDUE' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
                          <div><p className="font-bold">{m.firstName} {m.lastName}</p><p className="text-[11px] text-slate-400 uppercase font-bold">{m.status === 'OVERDUE' ? `Overdue since ${m.nextPayment}` : `Expiring ${m.nextPayment}`}</p></div>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black ${m.status === 'OVERDUE' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>{m.status}</span>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </>
        )}

        {/* VIEW: MEMBERS TABLE */}
        {activeTab === 'members' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
                <div className="flex gap-4 items-center">
                   <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300">{Icons.search}</div>
                      <input className="pl-10 pr-4 py-2 border rounded-lg text-sm w-80 outline-none" placeholder="Search members..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                   </div>
                   <select className="px-4 py-2 border rounded-lg text-sm bg-white outline-none"><option>All Types</option></select>
                   <select className="px-4 py-2 border rounded-lg text-sm bg-white outline-none"><option>All Centers</option></select>
                </div>
                <button className="bg-[#003d6b] text-white px-6 py-2 rounded-lg font-bold text-sm shadow-lg shadow-blue-900/20 hover:bg-[#00294a] transition-all flex items-center gap-2">
                   <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Member
                </button>
             </div>
             <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b">
                   <tr>
                      <th className="px-8 py-4">Member</th>
                      <th className="px-8 py-4">ID</th>
                      <th className="px-8 py-4">Type</th>
                      <th className="px-8 py-4">Center</th>
                      <th className="px-8 py-4">Status</th>
                      <th className="px-8 py-4">Next Payment</th>
                      <th className="px-8 py-4">Visits</th>
                      <th className="px-8 py-4">Actions</th>
                   </tr>
                </thead>
                <tbody className="text-sm">
                   {filteredMembers.map(m => (
                     <tr key={m.id} className="border-b hover:bg-slate-50/80 cursor-pointer transition-colors" onClick={() => setSelectedMember(m)}>
                        <td className="px-8 py-5">
                           <p className="font-bold text-slate-800">{m.firstName} {m.lastName}</p>
                           <p className="text-[11px] text-slate-400">{m.email}</p>
                        </td>
                        <td className="px-8 py-5 font-mono text-slate-400">{m.id}</td>
                        <td className="px-8 py-5"><span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black tracking-tight">{m.type}</span></td>
                        <td className="px-8 py-5 text-slate-600 font-medium">{m.center}</td>
                        <td className="px-8 py-5"><span className={`px-3 py-1 rounded-full text-[10px] font-black ${m.status === 'ACTIVE' ? 'bg-green-100 text-green-600' : m.status === 'OVERDUE' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>{m.status}</span></td>
                        <td className="px-8 py-5 text-slate-600">{m.nextPayment}</td>
                        <td className="px-8 py-5 font-bold">{m.visits}</td>
                        <td className="px-8 py-5"><button className="p-2 bg-[#1080ad] text-white rounded-lg shadow-md"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /></svg></button></td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
        )}

        {/* VIEW: NOTIFICATIONS */}
        {activeTab === 'notif' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-8 bg-white flex justify-between items-center">
                <div>
                   <h3 className="text-xl font-bold text-[#003d6b]">Due for Reminder</h3>
                   <p className="text-xs text-slate-400 font-medium">Payment reminders via email & SMS</p>
                </div>
                <button className="bg-[#dd6d22] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-orange-900/20 flex items-center gap-2">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg> Send All Due
                </button>
             </div>
             <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-y">
                   <tr>
                      <th className="px-8 py-4">Member</th>
                      <th className="px-8 py-4">Type</th>
                      <th className="px-8 py-4">Status</th>
                      <th className="px-8 py-4">Due</th>
                      <th className="px-8 py-4">Actions</th>
                   </tr>
                </thead>
                <tbody>
                   {scopedMembers.filter(m => m.status !== 'ACTIVE').map(m => (
                     <tr key={m.id} className="border-b">
                        <td className="px-8 py-5">
                           <p className="font-bold text-slate-800">{m.firstName} {m.lastName}</p>
                           <p className="text-[11px] text-slate-400">{m.email}</p>
                        </td>
                        <td className="px-8 py-5"><span className="px-3 py-1 rounded-full bg-blue-50 text-blue-500 text-[10px] font-black">{m.type}</span></td>
                        <td className="px-8 py-5"><span className={`px-3 py-1 rounded-full text-[10px] font-black ${m.status === 'OVERDUE' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>{m.status}</span></td>
                        <td className="px-8 py-5 text-slate-600 font-medium">{m.nextPayment}</td>
                        <td className="px-8 py-5 flex gap-2">
                           <button className="p-2 bg-[#1080ad] text-white rounded-lg shadow-md">{Icons.mail}</button>
                           <button className="p-2 bg-[#dd6d22] text-white rounded-lg shadow-md">{Icons.phone}</button>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
             <div className="p-8 border-t bg-slate-50/50 min-h-[200px] flex flex-col">
                <p className="text-xs font-black uppercase text-slate-400 mb-8">Log</p>
                <p className="text-center text-slate-300 italic text-sm my-auto">No notifications sent yet.</p>
             </div>
          </div>
        )}

        {/* VIEW: BADGE IN (KIOSK) */}
        {activeTab === 'badge' && (
          <div className="flex gap-8">
             <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-200 flex-1">
                <div className="w-64 h-64 border-2 border-dashed rounded-3xl mx-auto mb-10 flex flex-col items-center justify-center text-slate-300">
                   <div className="scale-150 opacity-50 mb-4">{Icons.badge}</div>
                   <p className="text-[10px] font-bold uppercase tracking-widest">Camera in production</p>
                </div>
                <p className="text-center text-xs font-bold text-slate-400 uppercase mb-4 tracking-tighter">Enter member ID:</p>
                <div className="flex gap-4 max-w-sm mx-auto mb-8">
                   <input className="flex-1 p-4 border rounded-xl outline-none font-mono text-xl text-center" placeholder="e.g. WC-001" id="kiosk_in" />
                   <button onClick={() => {
                     const id = document.getElementById('kiosk_in').value.toUpperCase();
                     const m = members.find(m => m.id === id);
                     if(m) setVisits(prev => [{name: m.firstName + ' ' + m.lastName, center: viewingCenter.toUpperCase(), time: new Date().toISOString(), type: m.type}, ...prev]);
                     document.getElementById('kiosk_in').value = '';
                   }} className="bg-[#003d6b] text-white px-8 rounded-xl font-bold">Check In</button>
                </div>
                <p className="text-center text-[10px] text-slate-400 font-medium">Try: {members.slice(0,4).map(m => m.id).join(', ')}</p>
             </div>
             <div className="w-[440px] space-y-8">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 min-h-[160px] flex items-center justify-center">
                   <p className="text-slate-300 italic font-medium">Waiting for scan...</p>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                   <p className="text-sm font-bold text-[#003d6b] mb-6 tracking-tight">Recent</p>
                   <div className="space-y-4">
                      {visits.map((v, i) => (
                        <div key={i} className="flex justify-between items-center text-sm border-b pb-4 last:border-0">
                           <span className="font-bold text-slate-800">{v.name}</span>
                           <span className="text-xs text-slate-400 font-medium">{new Date(v.time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        )}
      </main>

      {/* DETAIL MODAL (Matching Original Pro Style) */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001f3f]/90 backdrop-blur-md">
           <div className="bg-white rounded-[2rem] w-full max-w-4xl flex overflow-hidden shadow-2xl relative">
              <button onClick={() => setSelectedMember(null)} className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-all"><X size={24}/></button>
              <div className="w-1/3 bg-slate-50 p-12 flex flex-col items-center justify-center border-r">
                 <div className="bg-white p-6 rounded-2xl shadow-xl mb-8 border border-slate-100">
                    <QRCode data={selectedMember.id} size={180} />
                 </div>
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Member Identity</p>
                 <p className="text-xl font-bold text-[#003d6b]">#{selectedMember.id}</p>
              </div>
              <div className="flex-1 p-16">
                 <span className={`px-4 py-1 rounded-full text-[10px] font-black tracking-widest ${selectedMember.status === 'ACTIVE' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{selectedMember.status}</span>
                 <h2 className="text-6xl font-black text-slate-900 mt-6 mb-12 tracking-tighter leading-none">{selectedMember.firstName}<br/>{selectedMember.lastName}</h2>
                 <div className="grid grid-cols-2 gap-10">
                    <div><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Primary Location</p><p className="text-lg font-bold">{selectedMember.center} Center</p></div>
                    <div><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Billing Method</p><p className="text-lg font-bold">Standard Billing</p></div>
                    <div><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Engagement</p><p className="text-lg font-bold text-[#1080ad]">{selectedMember.visits} Total Visits</p></div>
                    <div><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Renewal Date</p><p className="text-lg font-bold">{selectedMember.nextPayment}</p></div>
                 </div>
                 <div className="mt-12 flex gap-4">
                    <button className="flex-1 bg-[#003d6b] text-white py-4 rounded-xl font-bold shadow-xl shadow-blue-900/20">Manual Sign-In</button>
                    <button className="px-6 py-4 border-2 rounded-xl text-slate-300 hover:text-blue-500 hover:border-blue-500 transition-all"><Mail size={20}/></button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
