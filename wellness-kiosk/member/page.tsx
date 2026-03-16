// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { CreditCard, LogOut, UserCircle, Activity, ChevronRight } from 'lucide-react';

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

export default function MemberWidget() {
  const [activeMember, setActiveMember] = useState(null);
  const [members, setMembers] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetch('/api/members')
      .then(res => res.json())
      .then(data => {
        if (data.records) {
          const mapped = data.records.map(r => ({
            airtableId: r.id, 
            id: r.fields['Member ID'] || r.id,
            firstName: r.fields['First Name'] || 'Unknown',
            lastName: r.fields['Last Name'] || '',
            email: r.fields['Email'] || '',
            phone: r.fields['Phone'] || '',
            status: (r.fields['Membership Status'] || 'ACTIVE').toUpperCase(),
            type: (r.fields['Membership Type']?.[0] || 'SINGLE').toUpperCase(),
            center: r.fields['Home Center'] || 'Anthony',
            visits: r.fields['Total Visits'] || 0,
            nextPayment: r.fields['Next Payment Due'] || 'Mar 31, 2026',
          }));
          setMembers(mapped);
        }
      });
  }, []);

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
      alert("Error saving to database.");
    }
    setIsUpdating(false);
  };

  if (!activeMember) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-4 font-sans w-full h-full">
        <div className="bg-white rounded-[3rem] shadow-lg p-10 w-full max-w-md border-t-8 border-[#16a34a]">
          <div className="flex justify-center mb-6"><UserCircle size={64} className="text-[#16a34a]" /></div>
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
            if(foundMember) { setActiveMember(foundMember); } else { alert('Member not found.'); }
          }} className="w-full bg-[#16a34a] text-white p-5 rounded-2xl font-bold text-lg shadow-lg hover:bg-green-700 transition-all mt-8">Access My Badge</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans pb-10 w-full h-full">
      <nav className="bg-[#001f3f] text-white p-4 shadow-md flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-full bg-[#16a34a] flex items-center justify-center font-bold text-[#001f3f]">{activeMember.firstName.charAt(0)}</div>
           <span className="font-bold tracking-tight">Wellness Portal</span>
        </div>
        <button onClick={() => setActiveMember(null)} className="text-white/60 hover:text-white flex items-center gap-2 text-sm font-medium"><LogOut size={16}/> Sign Out</button>
      </nav>
      <main className="max-w-md mx-auto p-4 space-y-6 mt-6">
         <div>
           <h1 className="text-3xl font-black text-[#001f3f] tracking-tight mb-1">Hi, {activeMember.firstName}!</h1>
           <p className="text-slate-500 font-medium">Welcome to your digital access portal.</p>
         </div>
         <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-[#1080ad]"></div>
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Scan to Check-In</h2>
            <div className="bg-white p-4 rounded-2xl shadow-inner border border-slate-100 mb-6"><QRCode data={activeMember.id} size={220} /></div>
            <p className="text-2xl font-black text-[#001f3f] tracking-widest">{activeMember.id}</p>
            <span className={`mt-4 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${activeMember.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{activeMember.status} MEMBER</span>
         </div>
         {familyMembers.length > 0 && (
           <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
             <h3 className="font-bold text-[#001f3f] mb-4 flex items-center gap-2"><Users size={18} className="text-[#16a34a]"/> Linked Family Accounts</h3>
             <div className="space-y-3">
               {familyMembers.map(fm => (
                 <button key={fm.id} onClick={() => setActiveMember(fm)} className="w-full flex items-center justify-between bg-slate-50 p-4 rounded-2xl hover:bg-slate-100 transition-colors border border-slate-100">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-[#1080ad] text-white flex items-center justify-center font-bold text-xs">{fm.firstName.charAt(0)}</div>
                     <div className="text-left"><p className="font-bold text-slate-800 text-sm leading-tight">{fm.firstName} {fm.lastName}</p><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{fm.id}</p></div>
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
               <div className="flex justify-between items-center border-b border-slate-50 pb-4"><span className="text-sm font-bold text-slate-400 uppercase tracking-tight">Plan Type</span><span className="font-bold text-slate-800">{activeMember.type}</span></div>
               <div className="flex justify-between items-center border-b border-slate-50 pb-4"><span className="text-sm font-bold text-slate-400 uppercase tracking-tight">Home Center</span><span className="font-bold text-slate-800">{activeMember.center}</span></div>
               <div className="flex justify-between items-center pb-2"><span className="text-sm font-bold text-slate-400 uppercase tracking-tight">Next Payment</span><span className={`font-bold ${activeMember.status === 'OVERDUE' ? 'text-red-500' : 'text-slate-800'}`}>{activeMember.nextPayment || 'N/A'}</span></div>
            </div>
         </div>
         <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-[#001f3f] flex items-center gap-2"><UserCircle size={18} className="text-[#f59e0b]"/> Contact Info</h3>
              <button onClick={() => setEditMode(!editMode)} className="text-xs font-bold text-[#1080ad] bg-blue-50 px-3 py-1 rounded-lg">{editMode ? 'Cancel' : 'Edit'}</button>
            </div>
            {!editMode ? (
              <div className="space-y-4">
                 <div className="flex justify-between items-center border-b border-slate-50 pb-4"><span className="text-sm font-bold text-slate-400 uppercase tracking-tight">Email</span><span className="font-bold text-slate-800 truncate pl-4">{activeMember.email || 'N/A'}</span></div>
                 <div className="flex justify-between items-center pb-2"><span className="text-sm font-bold text-slate-400 uppercase tracking-tight">Phone</span><span className="font-bold text-slate-800">{activeMember.phone || 'N/A'}</span></div>
              </div>
            ) : (
              <div className="space-y-4">
                 <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Email</label><input id="edit_email" defaultValue={activeMember.email} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#1080ad]" /></div>
                 <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Phone</label><input id="edit_phone" defaultValue={activeMember.phone} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#1080ad]" /></div>
                 <button onClick={handleUpdateProfile} disabled={isUpdating} className="w-full bg-[#001f3f] text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-900 transition-colors flex justify-center">{isUpdating ? 'Saving...' : 'Save Changes'}</button>
              </div>
            )}
         </div>
      </main>
    </div>
  );
}
