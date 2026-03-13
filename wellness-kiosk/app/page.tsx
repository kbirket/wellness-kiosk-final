// @ts-nocheck
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Search, QrCode, CreditCard, X, CheckCircle, 
  AlertCircle, TrendingUp, Calendar, MapPin, Mail, LogOut, 
  ShieldCheck, Phone, Activity, ChevronRight, LayoutDashboard,
  Filter, Download
} from 'lucide-react';

export default function WellnessHub() {
  const [view, setView] = useState('landing'); // landing, admin-login, dashboard
  const [isAdmin, setIsAdmin] = useState(false);
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [activeTab, setActiveTab] = useState('All');

  // 1. Fetch data from your working API bridge
  useEffect(() => {
    if (isAdmin) {
      setLoading(true);
      fetch('/api/members')
        .then(res => res.json())
        .then(data => {
          if (data.records) setMembers(data.records);
          setLoading(false);
        })
        .catch(err => {
          console.error("Fetch failed", err);
          setLoading(false);
        });
    }
  }, [isAdmin]);

  // 2. Logic for Search and Filtering
  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const name = m.fields['Full Name'] || '';
      const id = m.fields['Member ID'] || '';
      const status = m.fields['Membership Status'] || '';
      
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTab = activeTab === 'All' || status === activeTab;
      
      return matchesSearch && matchesTab;
    });
  }, [members, searchQuery, activeTab]);

  // 3. Calculation for Dashboard Stats
  const stats = {
    total: members.length,
    active: members.filter(m => m.fields['Membership Status'] === 'Active').length,
    overdue: members.filter(m => m.fields['Membership Status'] === 'Overdue').length,
    growth: "+12% from last month"
  };

  // --- COMPONENT: LOGIN VIEW ---
  if (view === 'admin-login' && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#001f3f] flex items-center justify-center p-4">
        <div className="bg-white rounded-[2rem] shadow-2xl p-10 w-full max-w-md transform transition-all">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-blue-50 rounded-2xl text-blue-600">
              <ShieldCheck size={40} />
            </div>
          </div>
          <h2 className="text-3xl font-black text-center text-slate-900 mb-2">Director Access</h2>
          <p className="text-center text-slate-500 mb-8 font-medium">Please authorize to manage wellness records.</p>
          
          <div className="space-y-4">
            <input 
              type="password" 
              placeholder="Enter Password" 
              className="w-full p-5 bg-slate-100 border-none rounded-2xl text-lg focus:ring-4 focus:ring-blue-500/20 transition-all outline-none"
              onKeyDown={(e) => e.key === 'Enter' && setIsAdmin(true)}
              autoFocus
            />
            <button 
              onClick={() => setIsAdmin(true)}
              className="w-full bg-[#001f3f] text-white p-5 rounded-2xl font-bold text-lg shadow-xl hover:bg-blue-900 transition-all active:scale-95"
            >
              Sign In
            </button>
            <button onClick={() => setView('landing')} className="w-full text-slate-400 font-bold text-sm">Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  // --- COMPONENT: LANDING VIEW ---
  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-[#001f3f] flex flex-col items-center justify-center p-6 text-white overflow-hidden relative">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-700/10 rounded-full blur-[120px] -ml-48 -mb-48"></div>

        <div className="z-10 text-center max-w-4xl w-full">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 mb-6 backdrop-blur-md">
            <Activity size={16} className="text-blue-400" />
            <span className="text-xs font-black tracking-widest uppercase">System Operational</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black mb-4 tracking-tighter">WELLNESS HUB</h1>
          <p className="text-blue-200/60 text-lg md:text-2xl mb-16 uppercase tracking-[0.4em] font-light">Patterson Health Centers</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div 
              onClick={() => setView('admin-login')}
              className="group bg-white/5 p-10 rounded-[2.5rem] border border-white/10 hover:bg-white/10 hover:border-blue-400 transition-all cursor-pointer text-left relative overflow-hidden"
            >
              <div className="p-5 bg-blue-500/20 rounded-2xl w-fit mb-6 group-hover:bg-blue-500 transition-colors">
                <LayoutDashboard size={32} className="text-blue-400 group-hover:text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Director Portal</h3>
              <p className="text-slate-400 leading-relaxed mb-6">Access member databases, billing status, and center analytics.</p>
              <div className="flex items-center gap-2 text-blue-400 font-bold group-hover:translate-x-2 transition-transform">
                Open Dashboard <ChevronRight size={18} />
              </div>
            </div>

            <div 
              onClick={() => alert('Scanner Mode: Point Camera at Badge')}
              className="group bg-white/5 p-10 rounded-[2.5rem] border border-white/10 hover:bg-white/10 hover:border-emerald-400 transition-all cursor-pointer text-left relative overflow-hidden"
            >
              <div className="p-5 bg-emerald-500/20 rounded-2xl w-fit mb-6 group-hover:bg-emerald-500 transition-colors">
                <QrCode size={32} className="text-emerald-400 group-hover:text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">iPad Check-In</h3>
              <p className="text-slate-400 leading-relaxed mb-6">Kiosk mode for self-service member entry using QR digital badges.</p>
              <div className="flex items-center gap-2 text-emerald-400 font-bold group-hover:translate-x-2 transition-transform">
                Start Kiosk <ChevronRight size={18} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN DASHBOARD VIEW ---
  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar Navigation */}
      <aside className="w-24 bg-[#001f3f] flex flex-col items-center py-10 text-white shadow-2xl z-20">
        <div className="p-3 bg-blue-500 rounded-2xl shadow-lg shadow-blue-500/40 mb-12">
          <Users size={32} />
        </div>
        <div className="flex-1 space-y-8">
          <button className="p-3 rounded-xl bg-white/10 text-white"><LayoutDashboard size={24}/></button>
          <button className="p-3 rounded-xl text-slate-400 hover:text-white transition-colors"><Calendar size={24}/></button>
          <button className="p-3 rounded-xl text-slate-400 hover:text-white transition-colors"><TrendingUp size={24}/></button>
        </div>
        <button 
          onClick={() => {setIsAdmin(false); setView('landing');}} 
          className="p-3 rounded-xl text-slate-400 hover:text-red-400 transition-colors mt-auto"
        >
          <LogOut size={24} />
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 md:p-12 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-2">Director Dashboard</h1>
            <p className="text-slate-400 font-medium">Patterson Wellness Membership Management</p>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all">
              <Download size={18} /> Export List
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {[
            { label: 'Total Members', value: stats.total, color: 'text-slate-900', bg: 'bg-white', icon: Users },
            { label: 'Active Access', value: stats.active, color: 'text-emerald-600', bg: 'bg-emerald-50/50', icon: CheckCircle },
            { label: 'Attention Needed', value: stats.overdue, color: 'text-red-600', bg: 'bg-red-50/50', icon: AlertCircle }
          ].map((card, i) => (
            <div key={i} className={`p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between ${card.bg}`}>
              <div>
                <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-2">{card.label}</p>
                <h3 className={`text-5xl font-black ${card.color}`}>{card.value}</h3>
              </div>
              <card.icon size={48} className={card.color} strokeWidth={1.5} opacity={0.3} />
            </div>
          ))}
        </div>

        {/* Directory Controls */}
        <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-slate-200/50 border border-white">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8 mb-10">
            <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full lg:w-fit">
              {['All', 'Active', 'Overdue'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${
                    activeTab === tab ? 'bg-white text-[#001f3f] shadow-md' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="relative w-full max-w-xl">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
              <input 
                type="text" 
                placeholder="Find a member by name or ID..." 
                className="w-full pl-16 pr-6 py-5 rounded-[2rem] bg-slate-100 border-none text-lg focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Member List Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-200">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-lg font-black italic tracking-widest uppercase">Fetching Records...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredMembers.map(member => (
                <div 
                  key={member.id} 
                  onClick={() => setSelectedMember(member)}
                  className="group bg-white p-8 rounded-[2rem] border border-slate-50 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer relative overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-30 ${
                    member.fields['Membership Status'] === 'Active' ? 'bg-emerald-500' : 'bg-red-500'
                  }`}></div>
                  
                  <div className="flex justify-between items-start mb-6">
                    <div className={`p-4 rounded-2xl ${
                      member.fields['Membership Status'] === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {member.fields['Membership Status'] === 'Active' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                    </div>
                    <span className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black text-slate-400 uppercase">#{member.fields['Member ID']}</span>
                  </div>
                  
                  <h4 className="text-2xl font-black text-slate-900 mb-1 leading-tight group-hover:text-blue-700 transition-colors">
                    {member.fields['Full Name']}
                  </h4>
                  <p className="text-slate-400 font-medium text-sm mb-6 truncate">{member.fields['Email']}</p>
                  
                  <div className="flex items-center gap-4 py-4 border-t border-slate-50">
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Location</p>
                      <p className="text-xs font-bold text-slate-700">{member.fields['Home Center']}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Visits</p>
                      <p className="text-xs font-bold text-slate-700">{member.fields['Total Visits'] || 0}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* DETAILED MEMBER PROFILE MODAL */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#001f3f]/90 backdrop-blur-xl" onClick={() => setSelectedMember(null)}></div>
          
          <div className="bg-white rounded-[3rem] w-full max-w-5xl overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] z-10 flex flex-col md:flex-row relative animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setSelectedMember(null)}
              className="absolute top-8 right-8 p-3 bg-slate-100 rounded-full text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"
            ><X /></button>

            {/* Modal Left: Identity & Badge */}
            <div className="md:w-1/3 bg-slate-50 p-12 flex flex-col items-center justify-center border-r border-slate-100">
               <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl shadow-blue-500/10 mb-8 border-2 border-slate-100">
                  <img 
                    src={`https://quickchart.io/qr?text=${selectedMember.fields['Member ID']}&size=300&dark=001f3f&light=ffffff`} 
                    alt="Digital ID" 
                    className="w-44 h-44"
                  />
               </div>
               <div className="text-center">
                 <h5 className="text-xs font-black text-slate-300 uppercase tracking-[0.3em] mb-2">Member Identity</h5>
                 <p className="text-2xl font-black text-[#001f3f] tracking-tighter">#{selectedMember.fields['Member ID']}</p>
               </div>
               <div className="mt-10 pt-10 border-t border-slate-200 w-full">
                  <button className="w-full bg-[#001f3f] text-white py-4 rounded-2xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-blue-500/20">
                    Sign In Member
                  </button>
               </div>
            </div>

            {/* Modal Right: Details & Status */}
            <div className="flex-1 p-12 md:p-16">
               <div className="flex items-center gap-3 mb-8">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    selectedMember.fields['Membership Status'] === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {selectedMember.fields['Membership Status']}
                  </span>
                  <div className="h-1 w-1 rounded-full bg-slate-300"></div>
                  <span className="text-xs font-bold text-slate-400">Enrolled {selectedMember.fields['Start Date']}</span>
               </div>

               <h2 className="text-6xl font-black text-slate-900 mb-4 tracking-tighter leading-none">
                 {selectedMember.fields['Full Name']}
               </h2>
               <div className="flex flex-wrap gap-6 mb-12">
                 <div className="flex items-center gap-2 text-slate-500 font-bold"><Mail size={18} className="text-blue-500"/> {selectedMember.fields['Email']}</div>
                 <div className="flex items-center gap-2 text-slate-500 font-bold"><Phone size={18} className="text-blue-500"/> (555) 123-4567</div>
               </div>

               <div className="grid grid-cols-2 gap-12">
                 <div className="space-y-8">
                   <div>
                     <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 flex items-center gap-2">
                       <MapPin size={12}/> Primary Wellness Center
                     </p>
                     <p className="text-xl font-bold text-slate-800">{selectedMember.fields['Home Center']}</p>
                   </div>
                   <div>
                     <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 flex items-center gap-2">
                       <CreditCard size={12}/> Billing & Plan
                     </p>
                     <p className="text-xl font-bold text-slate-800">{selectedMember.fields['Billing Method'] || 'Standard Member'}</p>
                   </div>
                 </div>

                 <div className="space-y-8">
                   <div>
                     <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 flex items-center gap-2">
                       <Activity size={12}/> Engagement History
                     </p>
                     <p className="text-xl font-bold text-slate-800">{selectedMember.fields['Total Visits'] || 0} Total Check-ins</p>
                   </div>
                   <div>
                     <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 flex items-center gap-2">
                       <Calendar size={12}/> Renewal Date
                     </p>
                     <p className="text-xl font-bold text-slate-800">{selectedMember.fields['Expiration Date'] || 'N/A'}</p>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
