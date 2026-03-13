// @ts-nocheck
'use client';
import React, { useState, useEffect } from 'react';
import { 
  Users, Search, QrCode, CreditCard, X, CheckCircle, 
  AlertCircle, TrendingUp, Calendar, MapPin, Mail, LogOut, 
  ShieldCheck, Phone, Activity, ChevronRight, LayoutDashboard,
  Download, Bell, FileText, Plus, Smartphone, Clock
} from 'lucide-react';

// ============================================================
// QR Code Generator Logic
// ============================================================
const generateQRMatrix = (data) => {
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
  for (let i = 0; i < (data?.length || 0); i++) hash = ((hash << 5) - hash + data.charCodeAt(i)) | 0;
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (!matrix[r][c]) {
        const val = Math.abs((hash * (r * size + c + 1) * 7919) % 100);
        if (val < 45) matrix[r][c] = true;
      }
  return matrix;
};

const QRCode = ({ data, size = 160, darkColor = '#003d6b' }) => {
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

// ============================================================
// Constants & Data
// ============================================================
const LOGO_URL = 'https://pattersonhc.org/sites/default/files/wellness_white.png';
const DIRECTORS = [
  { username: 'admin', password: 'admin2026', name: 'Administrator', center: 'both' },
  { username: 'harper_director', password: 'harper2026', name: 'Harper Director', center: 'harper' },
  { username: 'anthony_director', password: 'anthony2026', name: 'Anthony Director', center: 'anthony' }
];

// ============================================================
// MAIN APP
// ============================================================
export default function WellnessHub() {
  const [view, setView] = useState('landing'); 
  const [user, setUser] = useState({ name: 'Administrator', username: 'admin', center: 'both' });
  const [members, setMembers] = useState([]);
  const [visits, setVisits] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingCenter, setViewingCenter] = useState('both');
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(false);

  // Sync with Airtable
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
            status: (r.fields['Membership Status'] || 'ACTIVE').toUpperCase(),
            type: (r.fields['Membership Type']?.[0] || 'SINGLE').toUpperCase(),
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

  const scopedMembers = members.filter(m => viewingCenter === 'both' || m.center.toLowerCase() === viewingCenter);
  const filteredMembers = scopedMembers.filter(m => `${m.firstName} ${m.lastName} ${m.id}`.toLowerCase().includes(searchQuery.toLowerCase()));

  const stats = {
    total: scopedMembers.length,
    active: scopedMembers.filter(m => m.status === 'ACTIVE').length,
    overdue: scopedMembers.filter(m => m.status === 'OVERDUE').length,
    expiring: scopedMembers.filter(m => m.status === 'EXPIRING').length,
    today: visits.length
  };

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-[#003d6b] flex items-center justify-center font-sans p-6">
        <div className="text-center">
          <img src={LOGO_URL} alt="Logo" className="h-20 mx-auto mb-12 opacity-90" />
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
      {/* Sidebar */}
      <aside className="w-64 bg-[#003d6b] text-white flex flex-col min-h-screen">
        <div className="p-6 border-b border-white/10"><h1 className="text-xl font-bold tracking-tight">Wellness Centers</h1></div>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#dba51f] flex items-center justify-center font-bold text-lg">A</div>
            <div><p className="text-sm font-bold leading-none">{user.name}</p><p className="text-[11px] text-white/50">{user.username}</p></div>
          </div>
          <button onClick={() => setView('landing')} className="flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors"><LogOut size={14} /> Sign Out</button>
        </div>
        <div className="px-4 mb-8">
          <p className="px-2 text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">Viewing</p>
          <div className="space-y-1">
            {['Both Centers', 'Harper', 'Anthony'].map(c => {
               const key = c.toLowerCase().split(' ')[0];
               return (
                 <button key={c} onClick={() => setViewingCenter(key)} className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all ${viewingCenter === key ? 'bg-white/20 font-bold' : 'text-white/60 hover:bg-white/5'}`}>{c}</button>
               );
            })}
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm ${activeTab === 'dashboard' ? 'bg-[#1080ad] text-white font-bold' : 'text-white/60 hover:bg-white/5'}`}><LayoutDashboard size={18} /> Dashboard</button>
          <button onClick={() => setActiveTab('members')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm ${activeTab === 'members' ? 'bg-[#1080ad] text-white font-bold' : 'text-white/60 hover:bg-white/5'}`}><Users size={18} /> Members</button>
          <button onClick={() => setActiveTab('badge')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm ${activeTab === 'badge' ? 'bg-[#1080ad] text-white font-bold' : 'text-white/60 hover:bg-white/5'}`}><QrCode size={18} /> Badge In</button>
          <button onClick={() => setActiveTab('notif')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm ${activeTab === 'notif' ? 'bg-[#1080ad] text-white font-bold' : 'text-white/60 hover:bg-white/5'}`}><Bell size={18} /> Notifications</button>
        </nav>
      </aside>

      <main className="flex-1 p-10">
        <div className="mb-10">
           <h2 className="text-3xl font-bold text-[#003d6b] capitalize">{activeTab}</h2>
           <p className="text-sm text-slate-400 font-medium">{viewingCenter === 'both' ? 'All Centers' : viewingCenter + ' Center'} · Friday, March 13, 2026</p>
        </div>

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
                       <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border">
                         <div><p className="font-bold">{v.name}</p><p className="text-[11px] text-slate-400 uppercase font-bold">{v.center} · {v.type}</p></div>
                         <div className="flex items-center gap-2 text-slate-400 text-xs font-medium"><Clock size={14} /> {new Date(v.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                       </div>
                     ))}
                  </div>
               </div>
               <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="text-lg font-bold mb-6 text-[#003d6b]">Needs Attention</h3>
                  <div className="space-y-4">
                     {scopedMembers.filter(m => m.status !== 'ACTIVE').slice(0, 5).map(m => (
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

        {activeTab === 'members' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"><Search size={16} /></div>
                  <input className="pl-10 pr-4 py-2 border rounded-lg text-sm w-80 outline-none" placeholder="Search members..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <button className="bg-[#003d6b] text-white px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2"><Plus size={16} /> Add Member</button>
             </div>
             <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b">
                   <tr>
                      <th className="px-8 py-4">Member</th><th className="px-8 py-4">ID</th><th className="px-8 py-4">Type</th><th className="px-8 py-4">Center</th><th className="px-8 py-4">Status</th><th className="px-8 py-4">Visits</th><th className="px-8 py-4">Actions</th>
                   </tr>
                </thead>
                <tbody className="text-sm">
                   {filteredMembers.map(m => (
                     <tr key={m.id} className="border-b hover:bg-slate-50/80 cursor-pointer" onClick={() => setSelectedMember(m)}>
                        <td className="px-8 py-5">
                           <p className="font-bold text-slate-800">{m.firstName} {m.lastName}</p>
                           <p className="text-[11px] text-slate-400">{m.email}</p>
                        </td>
                        <td className="px-8 py-5 font-mono text-slate-400">{m.id}</td>
                        <td className="px-8 py-5"><span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black">{m.type}</span></td>
                        <td className="px-8 py-5 text-slate-600">{m.center}</td>
                        <td className="px-8 py-5"><span className={`px-3 py-1 rounded-full text-[10px] font-black ${m.status === 'ACTIVE' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{m.status}</span></td>
                        <td className="px-8 py-5 font-bold">{m.visits}</td>
                        <td className="px-8 py-5"><button className="p-2 bg-[#1080ad] text-white rounded-lg"><QrCode size={16}/></button></td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
        )}

        {activeTab === 'badge' && (
          <div className="flex gap-8">
             <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-200 flex-1 text-center">
                <div className="w-64 h-64 border-2 border-dashed rounded-3xl mx-auto mb-10 flex flex-col items-center justify-center text-slate-300">
                   <QrCode size={48} className="mb-4 opacity-20" />
                   <p className="text-[10px] font-bold uppercase tracking-widest">Scanner Ready</p>
                </div>
                <div className="flex gap-4 max-w-sm mx-auto mb-8">
                   <input className="flex-1 p-4 border rounded-xl outline-none font-mono text-xl text-center" placeholder="ID (e.g. WC-001)" id="k_in" />
                   <button onClick={() => {
                     const val = document.getElementById('k_in').value.toUpperCase();
                     const m = members.find(m => m.id === val);
                     if(m) setVisits(prev => [{name: m.firstName + ' ' + m.lastName, center: viewingCenter.toUpperCase(), time: new Date().toISOString(), type: m.type}, ...prev]);
                     document.getElementById('k_in').value = '';
                   }} className="bg-[#003d6b] text-white px-8 rounded-xl font-bold">Check In</button>
                </div>
             </div>
             <div className="w-[440px] bg-white p-8 rounded-3xl shadow-sm border">
                <p className="text-sm font-bold text-[#003d6b] mb-6 tracking-tight">Recent Activity</p>
                <div className="space-y-4">
                   {visits.slice(0, 8).map((v, i) => (
                     <div key={i} className="flex justify-between items-center text-sm border-b pb-4 last:border-0">
                        <span className="font-bold text-slate-800">{v.name}</span>
                        <span className="text-xs text-slate-400 font-medium">{new Date(v.time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}
      </main>

      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001f3f]/90 backdrop-blur-md">
           <div className="bg-white rounded-[2rem] w-full max-w-4xl flex overflow-hidden shadow-2xl relative">
              <button onClick={() => setSelectedMember(null)} className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-all"><X size={24}/></button>
              <div className="w-1/3 bg-slate-50 p-12 flex flex-col items-center justify-center border-r">
                 <div className="bg-white p-6 rounded-2xl shadow-xl mb-8 border"><QRCode data={selectedMember.id} size={180} /></div>
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Membership ID</p>
                 <p className="text-xl font-bold text-[#003d6b]">#{selectedMember.id}</p>
              </div>
              <div className="flex-1 p-16">
                 <span className={`px-4 py-1 rounded-full text-[10px] font-black tracking-widest ${selectedMember.status === 'ACTIVE' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{selectedMember.status}</span>
                 <h2 className="text-6xl font-black text-slate-900 mt-6 mb-12 tracking-tighter leading-none">{selectedMember.firstName}<br/>{selectedMember.lastName}</h2>
                 <div className="grid grid-cols-2 gap-10">
                    <div><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Location</p><p className="text-lg font-bold">{selectedMember.center} Center</p></div>
                    <div><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Billing</p><p className="text-lg font-bold">Standard</p></div>
                    <div><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Engagement</p><p className="text-lg font-bold text-[#1080ad]">{selectedMember.visits} Total Visits</p></div>
                    <div><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Due Date</p><p className="text-lg font-bold">{selectedMember.nextPayment}</p></div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
