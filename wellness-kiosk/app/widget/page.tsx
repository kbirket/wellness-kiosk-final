// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { CheckCircle, Activity, CreditCard, UserCircle, LogOut, Dumbbell, QrCode as QrIcon } from 'lucide-react';

const QRCode = ({ data, size = 120 }) => {
  const safeData = encodeURIComponent(data || "WC-000");
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${safeData}&color=001f3f&bgcolor=ffffff`;
  return <img src={qrUrl} alt="QR Code" className="mx-auto rounded-xl shadow-sm" style={{ width: size, height: size }} />;
};

export default function MemberWidget() {
  const [members, setMembers] = useState([]);
  const [workouts, setWorkouts] = useState([]); 
  const [activeMember, setActiveMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.style.background = 'transparent';

    fetch('/api/members')
      .then(res => res.json())
      .then(data => {
        if (data.records) {
          const mapped = data.records.map(r => {
            let planText = r.fields['Plan Name'] ? (Array.isArray(r.fields['Plan Name']) ? r.fields['Plan Name'][0] : r.fields['Plan Name']) : 'UNKNOWN PLAN';
            let rawPassword = String(r.fields['Password'] || '').trim();
            let finalPassword = (rawPassword === '' || rawPassword.includes('ERROR')) ? '1111' : rawPassword;
            
            return {
              id: r.fields['Member ID'] || r.id,
              firstName: r.fields['First Name'] || 'Unknown',
              lastName: r.fields['Last Name'] || '',
              email: r.fields['Email'] || '',
              password: finalPassword,
              status: (r.fields['Membership Status'] || 'ACTIVE').toUpperCase(),
              type: String(planText).toUpperCase().trim(),
              visits: Number(r.fields['Total Visits'] || 0),
              nextPayment: r.fields['Next Payment Due'] || null
            };
          });
          setMembers(mapped);
        }
        
        fetch('/api/get-workouts')
          .then(res => res.json())
          .then(workoutData => {
             if (workoutData.records) {
                const mappedWorkouts = workoutData.records.map(w => ({
                   id: w.id,
                   memberId: w.fields['Member ID'],
                   date: w.fields['Date'] || w.createdTime,
                   routine: w.fields['Routine']
                }));
                setWorkouts(mappedWorkouts);
             }
             setLoading(false);
          })
          .catch(() => setLoading(false));
      });
  }, []);

  const handleLogin = () => {
    const email = document.getElementById('w_email').value.toLowerCase().trim();
    const pin = document.getElementById('w_pin').value.trim();
    const found = members.find(m => m.email.toLowerCase() === email && m.password === pin);
    
    if(found) {
      setActiveMember(found);
      window.parent.postMessage({ 
          type: 'FITFORGE_LOGIN', 
          memberId: found.id, 
          name: found.firstName 
      }, '*');
    } else {
      alert('Incorrect Email or Birthday PIN.');
    }
  };

  const handleLogout = () => {
      setActiveMember(null);
      window.parent.postMessage({ type: 'FITFORGE_LOGOUT' }, '*');
  };

  const getStoplight = (member) => {
    if (!member.nextPayment) return 'green'; 
    const due = new Date(member.nextPayment);
    const diffDays = Math.ceil((new Date() - due) / (1000 * 60 * 60 * 24)); 
    if (diffDays <= 0) return 'green'; 
    if (diffDays > 0 && diffDays <= 14) return 'yellow'; 
    return 'red'; 
  };

  if (loading) return <div className="p-8 text-center text-slate-400 font-bold animate-pulse">Loading secure connection...</div>;

  // --- SLEEK DARK LOGIN BANNER ---
  if (!activeMember) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-[#1a1c23]/90 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 font-sans">
         <div className="flex items-center gap-4 text-center md:text-left">
            <div className="bg-blue-500/20 p-3 rounded-full text-blue-400 hidden sm:block">
               <UserCircle size={36} />
            </div>
            <div>
               <h2 className="text-2xl font-black text-white tracking-tight">Member Sync</h2>
               <p className="text-sm text-slate-400 font-medium mt-1">Log in to track workouts and view your ID.</p>
            </div>
         </div>
         <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <input type="email" id="w_email" placeholder="Account Email" className="w-full sm:w-56 p-3.5 bg-slate-900 border border-slate-700 text-white rounded-xl outline-none focus:border-blue-500 transition-colors text-sm" />
            <input type="password" id="w_pin" maxLength={4} placeholder="PIN (MMDD)" className="w-full sm:w-32 p-3.5 bg-slate-900 border border-slate-700 text-white rounded-xl outline-none focus:border-blue-500 tracking-[0.3em] text-center transition-colors text-sm" onKeyDown={e => e.key === 'Enter' && handleLogin()}/>
            <button onClick={handleLogin} className="w-full sm:w-auto bg-[#1080ad] hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg transition-colors text-sm whitespace-nowrap">Connect</button>
         </div>
      </div>
    );
  }

  // --- SLEEK DARK DASHBOARD ---
  const statusColor = getStoplight(activeMember);
  const myWorkouts = workouts.filter(w => w.memberId === activeMember.id);
  
  return (
    <div className="w-full max-w-4xl mx-auto bg-[#1a1c23]/95 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden font-sans">
       
       {/* Top Status Bar */}
       <div className={`h-1.5 w-full ${statusColor === 'green' ? 'bg-green-500' : statusColor === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
       
       <div className="p-6">
           {/* Header */}
           <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700/50">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center font-bold text-lg">{activeMember.firstName.charAt(0)}</div>
                 <div>
                    <h1 className="text-xl font-black text-white leading-tight">{activeMember.firstName} {activeMember.lastName}</h1>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{activeMember.id} • {activeMember.type}</p>
                 </div>
              </div>
              <button onClick={handleLogout} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold transition-all border border-red-500/20">
                <LogOut size={14}/> Disconnect
              </button>
           </div>

           {/* Two Column Layout */}
           <div className="flex flex-col md:flex-row gap-6">
              
              {/* Left: ID & Stats */}
              <div className="w-full md:w-1/3 flex flex-col gap-4">
                 <div className="bg-white p-4 rounded-xl flex flex-col items-center justify-center shadow-inner">
                    <QRCode data={activeMember.id} size={130} />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3 flex items-center gap-1"><QrIcon size={12}/> Scan to Enter</p>
                 </div>
                 <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-center gap-1"><Activity size={12}/> Lifetime Visits</p>
                    <p className="text-3xl font-black text-blue-400">{activeMember.visits}</p>
                 </div>
              </div>

              {/* Right: Workouts */}
              <div className="flex-1 flex flex-col">
                 <div className="flex justify-between items-end mb-3">
                    <h3 className="font-bold text-white flex items-center gap-2 text-sm"><Dumbbell size={16} className="text-[#8b5cf6]"/> My Saved Workouts</h3>
                    <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded border border-green-500/20 flex items-center gap-1"><CheckCircle size={10}/> Sync Active</span>
                 </div>
                 
                 <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-3 flex-1 h-[240px] overflow-y-auto">
                    <style>{`
                      .dark-scroll::-webkit-scrollbar { width: 6px; }
                      .dark-scroll::-webkit-scrollbar-track { background: transparent; }
                      .dark-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
                    `}</style>
                    <div className="space-y-3 dark-scroll h-full pr-1">
                        {myWorkouts.length > 0 ? (
                            myWorkouts.map((w, i) => (
                                <div key={i} className="bg-slate-800 border border-slate-700 rounded-lg p-4 transition-colors hover:border-slate-500">
                                   <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 block border-b border-slate-700 pb-2">{new Date(w.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric'})}</span>
                                   <p className="text-xs text-slate-300 whitespace-pre-wrap font-medium leading-relaxed">{w.routine}</p>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                               <Dumbbell size={32} className="text-slate-500 mb-2" />
                               <p className="text-slate-400 text-sm font-bold">No saved workouts yet.</p>
                               <p className="text-xs text-slate-500 mt-1 max-w-[200px]">Generate a workout below and click "Save to Profile"!</p>
                            </div>
                        )}
                    </div>
                 </div>
              </div>

           </div>
       </div>
    </div>
  );
}
