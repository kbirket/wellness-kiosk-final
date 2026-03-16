// @ts-nocheck
'use client';
import { useState, useEffect, useRef } from 'react';
import { 
  Users, Search, QrCode, CreditCard, X, CheckCircle, 
  AlertCircle, TrendingUp, Calendar, MapPin, Mail, LogOut, 
  ShieldCheck, Phone, Activity, ChevronRight, LayoutDashboard,
  Filter, Download, Bell, FileText, Plus, Smartphone, Clock
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

const QRCode = ({ data, size = 160, darkColor = '#001f3f' }) => {
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
const CENTERS = ['Harper', 'Anthony'];
const centerColors = { Harper: '#f59e0b', Anthony: '#1080ad' };
const DIRECTORS = [
  { username: 'admin', password: 'admin2026', name: 'Administrator', center: 'both' },
  { username: 'harper_director', password: 'harper2026', name: 'Director — Harper', center: 'harper' },
  { username: 'anthony_director', password: 'anthony2026', name: 'Director — Anthony', center: 'anthony' }
];

// Reusable SVG Icons from pro build screenshots
const Icons = {
  dashboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
  members: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  badge: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><line x1="7" y1="12" x2="17" y2="12" /></svg>,
  notif: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
};

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
            phone: r.fields['Phone'] || '(555) 000-0000',
            status: (r.fields['Membership Status'] || 'ACTIVE').toUpperCase(),
            type: (r.fields['Membership Type']?.[0] || 'SINGLE').toUpperCase(),
            center: r.fields['Home Center'] || 'Anthony',
            visits: r.fields['Total Visits'] || 0,
            nextPayment: r.fields['Next Payment Due'] || 'Mar 31, 2026',
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

  // --- UI Components ---

  const ProStatCard = ({ value, label, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200" style={{ borderLeft: `6px solid ${color}` }}>
      <p className="text-5xl font-extrabold mb-1" style={{ color }}>{value}</p>
      <p className="text-xs font-bold text-[#001f3f] uppercase tracking-tight">{label}</p>
    </div>
  );

  const ProListCard = ({ title, children, actions }) => (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-[#001f3f]">{title}</h3>
        {actions}
      </div>
      {children}
    </div>
  );

  const CheckinsList = () => (
    <ProListCard title="Today's Check-ins">
      <div className="space-y-4">
        {visits.length === 0 ? <p className="text-slate-300 italic">Waiting for activity...</p> : visits.map((v, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border">
            <div><p className="font-bold">{v.name}</p><p className="text-[11px] font-bold text-[#f59e0b] uppercase">{v.center} · {v.type}</p></div>
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium"><Clock size={14} /> {new Date(v.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
          </div>
        ))}
      </div>
    </ProListCard>
  );

  const NeedsAttentionList = () => (
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
  );

  const LocationCounts = () => (
    <ProListCard title="By Location">
      <div className="flex gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex-1 border-l-6" style={{ borderLeftColor: centerColors.Harper }}>
          <p className="text-5xl font-extrabold mb-1" style={{ color: centerColors.Harper }}>{members.filter(m => m.center === 'Harper').length}</p>
          <p className="text-xs font-bold text-[#001f3f] uppercase tracking-tight">Harper Wellness Center</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex-1 border-l-6" style={{ borderLeftColor: centerColors.Anthony }}>
          <p className="text-5xl font-extrabold mb-1" style={{ color: centerColors.Anthony }}>{members.filter(m => m.center === 'Anthony').length}</p>
          <p className="text-xs font-bold text-[#001f3f] uppercase tracking-tight">Anthony Wellness Center</p>
        </div>
      </div>
    </ProListCard>
  );

  const MixChart = () => (
    <ProListCard title="Membership Mix">
      <div className="space-y-3">
        {[
          { label: 'Monthly', count: members.filter(m => m.type === 'MONTHLY').length, color: '#001f3f' },
          { label: 'Annual', count: members.filter(m => m.type === 'ANNUAL').length, color: '#1080ad' },
          { label: 'Day Pass / Punch Card', count: members.filter(m => m.type === 'DAY PASS / PUNCH CARD').length, color: '#dd6d22' },
          { label: 'Family', count: members.filter(m => m.type === 'FAMILY').length, color: '#f59e0b' },
        ].map(item => {
          const p = Math.round((item.count / members.length) * 100);
          return (
            <div key={item.label} className="flex items-center gap-4">
              <span className="text-sm font-bold w-48 text-[#001f3f]">{item.label}</span>
              <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${p}%`, backgroundColor: item.color }} /></div>
              <span className="text-xs font-medium w-16 text-slate-400 text-right">{item.count} ({p}%)</span>
            </div>
          );
        })}
      </div>
    </ProListCard>
  );

  const ProDropdown = ({ label, children }) => (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300">
        {/* Placeholder for custom dropdown icons */}
      </div>
      <select className="pl-6 pr-4 py-2 border rounded-xl text-sm font-bold w-48 text-[#001f3f] outline-none bg-white">
        <option>{label}</option>
        {children}
      </select>
    </div>
  );

  const MemberTable = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b">
          <tr>
            <th className="px-8 py-4 w-64">Member</th><th className="px-8 py-4">ID</th><th className="px-8 py-4 w-40">Type</th><th className="px-8 py-4 w-48">Center</th><th className="px-8 py-4 w-32">Status</th><th className="px-8 py-4 w-32">Next Payment</th><th className="px-8 py-4 w-24 text-right">Visits</th><th className="px-8 py-4 w-24">Actions</th>
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
              <td className="px-8 py-5"><span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black tracking-tight">{m.type}</span></td>
              <td className="px-8 py-5 text-slate-600 font-medium">{m.center} Center</td>
              <td className="px-8 py-5"><span className={`px-3 py-1 rounded-full text-[10px] font-black ${m.status === 'ACTIVE' ? 'bg-green-100 text-green-600' : m.status === 'OVERDUE' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>{m.status}</span></td>
              <td className="px-8 py-5 text-slate-600">{m.nextPayment}</td>
              <td className="px-8 py-5 font-bold text-lg text-right">{m.visits}</td>
              <td className="px-8 py-5"><button className="p-2 bg-[#1080ad] text-white rounded-lg shadow-md"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /></svg></button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const NotifTable = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b">
          <tr>
            <th className="px-8 py-4 w-64">Member</th><th className="px-8 py-4 w-40">Type</th><th className="px-8 py-4 w-32">Status</th><th className="px-8 py-4 w-32">Due</th><th className="px-8 py-4 w-24">Actions</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {scopedMembers.filter(m => m.status !== 'ACTIVE').map(m => (
            <tr key={m.id} className="border-b">
              <td className="px-8 py-5">
                <p className="font-bold text-slate-800">{m.firstName} {m.lastName}</p>
                <p className="text-[11px] text-slate-400">{m.email}</p>
              </td>
              <td className="px-8 py-5"><span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black">{m.type}</span></td>
              <td className="px-8 py-5"><span className={`px-3 py-1 rounded-full text-[10px] font-black ${m.status === 'OVERDUE' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>{m.status}</span></td>
              <td className="px-8 py-5 text-slate-600 font-medium">{m.nextPayment}</td>
              <td className="px-8 py-5 flex gap-2"><button className="p-2 bg-[#1080ad] text-white rounded-lg shadow-md"><Mail size={16}/></button><button className="p-2 bg-[#dd6d22] text-white rounded-lg shadow-md"><Phone size={16}/></button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-[#001f3f] flex items-center justify-center font-sans p-6">
        <div className="text-center">
          <img src={LOGO_URL} alt="Logo" className="h-20 mx-auto mb-12 opacity-90" />
          <div className="flex gap-6">
             <button onClick={() => setView('dashboard')} className="bg-white/10 border border-white/20 p-10 rounded-2xl text-white hover:bg-white/20 transition-all flex flex-col items-center gap-4 w-64">
                <ShieldCheck size={48} className="text-[#f59e0b]" />
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
      {/* --- SIDEBAR (Structured like Screenshot) --- */}
      <aside className="w-64 bg-[#001f3f] text-white flex flex-col min-h-screen">
        <div className="p-6 border-b border-white/10"><h1 className="text-xl font-bold tracking-tight">Wellness Centers</h1></div>
        
        {/* Profile */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#f59e0b] flex items-center justify-center font-bold text-lg text-[#001f3f]">A</div>
            <div>
              <p className="text-sm font-bold leading-none">{user.name}</p>
              <p className="text-[11px] text-white/50">{user.username}</p>
            </div>
          </div>
          <button onClick={() => setView('landing')} className="flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg> Sign Out
          </button>
        </div>

        {/* Center Selector */}
        <div className="px-4 mb-8">
          <p className="px-2 text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">Viewing</p>
          <div className="space-y-1">
            {[ { k: 'both', c: '#ffffff' }, { k: 'harper', c: '#f59e0b' }, { k: 'anthony', c: '#1080ad' } ].map(item => (
              <button key={item.k} onClick={() => setViewingCenter(item.k)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${viewingCenter === item.k ? 'bg-white/20 font-bold' : 'text-white/60 hover:bg-white/5'}`}>
                <span className="w-1.5 h-6 rounded-full" style={{ backgroundColor: item.c }} />
                {item.k === 'both' ? 'Both Centers' : `${item.k.charAt(0).toUpperCase() + item.k.slice(1)} Center`}
              </button>
            ))}
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
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all ${activeTab === item.id ? 'bg-[#1080ad] text-white font-bold' : 'text-white/60 hover:bg-white/5'}`}>
              {item.icon} {item.label}
              {item.id === 'notif' && stats.overdue > 0 && <span className="ml-auto w-5 h-5 rounded-full bg-red-500 text-[10px] flex items-center justify-center font-bold tracking-tight">{stats.overdue}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-10">
        <div className="mb-10">
           <h2 className="text-3xl font-bold text-[#001f3f] capitalize tracking-tight">{activeTab}</h2>
           <p className="text-sm text-slate-400 font-medium">{viewingCenter === 'both' ? 'All Centers' : viewingCenter + ' Center'} · Wednesday, March 11, 2026</p>
        </div>

        {/* VIEW: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-5 gap-6">
               {[ { l: 'Total Members', v: stats.total, c: '#001f3f' }, { l: 'Active', v: stats.active, c: '#16a34a' }, { l: 'Overdue', v: stats.overdue, c: '#dc2626' }, { l: 'Expiring', v: stats.expiring, c: '#f59e0b' }, { l: 'Check-ins Today', v: stats.today, c: '#1080ad' } ].map((s, i) => (
                 <ProStatCard key={i} {...s} />
               ))}
            </div>
            <div className="grid grid-cols-2 gap-8">
               <CheckinsList />
               <NeedsAttentionList />
               <LocationCounts />
               <MixChart />
            </div>
          </div>
        )}

        {/* VIEW: MEMBERS */}
        {activeTab === 'members' && (
          <div className="space-y-6">
             <div className="flex justify-between items-center mb-8">
                <div><h2 className="text-3xl font-bold text-[#001f3f] tracking-tight">Members</h2><p className="text-slate-400 font-medium">8 members</p></div>
                <button className="bg-[#001f3f] text-white px-6 py-2 rounded-xl font-bold text-sm shadow-xl shadow-blue-900/10 flex items-center gap-2"><Plus size={16} /> Add Member</button>
             </div>
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex gap-4 items-center">
                <div className="relative flex-1">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                   <input className="pl-12 pr-4 py-2 border rounded-xl text-sm w-full outline-none" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <ProDropdown label="All Types" />
                <ProDropdown label="All Centers" />
                <ProDropdown label="All Status" />
             </div>
             {loading ? <div className="text-center py-20 text-slate-300 font-medium italic">Syncing Airtable...</div> : <MemberTable /> }
          </div>
        )}

        {/* VIEW: NOTIFICATIONS */}
        {activeTab === 'notif' && (
          <div className="space-y-6">
             <div className="flex justify-between items-center mb-8">
                <div><h2 className="text-3xl font-bold text-[#001f3f] tracking-tight">Notifications</h2><p className="text-slate-400 font-medium">Payment reminders via email & SMS</p></div>
                <button className="bg-[#dd6d22] text-white px-8 py-3 rounded-xl font-bold shadow-xl shadow-orange-900/20 flex items-center gap-2"><Bell size={20} /> Send All Due</button>
             </div>
             <ProListCard title="Due for Reminder">
                <NotifTable />
             </ProListCard>
             <ProListCard title="Log">
                <p className="text-center text-slate-300 italic text-sm my-16">No notifications sent yet.</p>
             </div>
          </div>
        )}

        {/* VIEW: BADGE IN */}
        {activeTab === 'badge' && (
          <div className="space-y-6">
             <div className="mb-8">
                <h2 className="text-3xl font-bold text-[#001f3f] tracking-tight mb-1">Badge In</h2>
                <p className="text-slate-400 font-medium">Scan QR or enter member ID</p>
             </div>
             <div className="flex gap-8">
                <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-200 flex-1 text-center">
                   <div className="w-64 h-64 border-2 border-dashed rounded-3xl mx-auto mb-10 flex flex-col items-center justify-center text-slate-300">
                      <QrCode size={48} className="mb-4 opacity-20" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">Scanner Ready</p>
                      <p className="text-[11px] font-bold text-slate-300">Camera in production</p>
                   </div>
                   <p className="text-sm font-bold text-slate-400 mb-4 tracking-tight">Enter member ID:</p>
                   <div className="flex gap-4 max-w-sm mx-auto mb-10">
                      <input className="flex-1 p-4 border rounded-xl outline-none font-mono text-xl text-center" placeholder="e.g. WC-001" id="kiosk_in" />
                      <button onClick={() => {
                        const id = document.getElementById('kiosk_in').value.toUpperCase().trim();
                        const m = members.find(m => m.id === id);
                        if(m) setVisits(prev => [{name: m.firstName + ' ' + m.lastName, center: viewingCenter.toUpperCase(), time: new Date().toISOString(), type: m.type}, ...prev]);
                        document.getElementById('kiosk_in').value = '';
                      }} className="bg-[#001f3f] text-white px-8 rounded-xl font-bold">Check In</button>
                   </div>
                   <p className="text-xs text-slate-400 font-medium">Try: {members.slice(0,4).map(m => m.id).join(', ')}</p>
                </div>
                <div className="w-[440px] space-y-8">
                   <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 min-h-[160px] flex items-center justify-center text-slate-300 italic font-medium">Waiting for scan...</div>
                   <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                      <p className="text-sm font-bold text-[#001f3f] mb-6 tracking-tight">Recent</p>
                      <div className="space-y-4">
                         {visits.slice(0, 8).map((v, i) => (
                           <div key={i} className="flex justify-between items-center text-sm border-b pb-4 last:border-0 border-slate-100">
                              <span className="font-bold text-slate-800">{v.name}</span>
                              <span className="text-xs text-slate-400 font-medium">{new Date(v.time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
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
                 <div className="bg-white p-6 rounded-2xl shadow-xl mb-8 border border-slate-100"><QRCode data={selectedMember.id} size={180} /></div>
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Member Identity</p>
                 <p className="text-xl font-bold text-[#001f3f]">#{selectedMember.id}</p>
              </div>
              <div className="flex-1 p-16">
                 <span className={`px-4 py-1 rounded-full text-[10px] font-black tracking-widest ${selectedMember.status === 'ACTIVE' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{selectedMember.status}</span>
                 <h2 className="text-6xl font-black text-slate-900 mt-6 mb-12 tracking-tighter leading-none">{selectedMember.firstName}<br/>{selectedMember.lastName}</h2>
                 <div className="grid grid-cols-2 gap-10 gap-x-12">
                    <div><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Primary Location</p><p className="text-lg font-bold">{selectedMember.center} Center</p></div>
                    <div><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Billing Plan</p><p className="text-lg font-bold">Standard Billing</p></div>
                    <div><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Engagement</p><p className="text-lg font-bold text-[#1080ad]">{selectedMember.visits} Total Visits</p></div>
                    <div><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Renewal Date</p><p className="text-lg font-bold">{selectedMember.nextPayment}</p></div>
                 </div>
                 <div className="mt-14 flex gap-4">
                    <button className="flex-1 bg-[#001f3f] text-white py-4 rounded-xl font-bold shadow-xl shadow-blue-900/20 active:scale-95 transition-all text-sm">Manual Check-In</button>
                    <button className="px-6 py-4 border-2 rounded-xl text-slate-300 hover:text-blue-500 hover:border-blue-500 transition-all"><Mail size={20}/></button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
