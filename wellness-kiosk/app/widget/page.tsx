// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { CheckCircle, Activity, CreditCard, UserCircle, LogOut, Dumbbell } from 'lucide-react';

const QRCode = ({ data, size = 120 }) => {
  const safeData = encodeURIComponent(data || "WC-000");
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${safeData}&color=001f3f&bgcolor=transparent`;
  return <img src={qrUrl} alt="QR Code" className="mx-auto rounded-xl mix-blend-multiply" style={{ width: size, height: size }} />;
};

export default function MemberWidget() {
  const [members, setMembers] = useState([]);
  const [workouts, setWorkouts] = useState([]); // NEW: State to hold the workouts!
  const [activeMember, setActiveMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hide the main page background so the widget is transparent on your website!
    document.body.style.background = 'transparent';

    // FETCH 1: Get the members
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
        
        // FETCH 2: Get the saved workouts
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
      // THE MAGIC CONNECTION: This tells the Fitforge website exactly who is logged in!
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
      // Tells Fitforge they logged out
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

  if (loading) return <div className="p-8 text-center text-slate-400 font-bold animate-pulse">Loading secure portal...</div>;

  // --- WIDE LOGIN SCREEN ---
  if (!activeMember) {
    return (
      <div className="bg-white/90 backdrop-blur-md p-6 sm:p-10 rounded-[2rem] shadow-xl border border-slate-100 max-w-5xl mx-auto w-full font-sans">
         <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left border-b md:border-b-0 md:border-r border-slate-200 pb-6 md:pb-0 md:pr-8">
               <UserCircle size={56} className="text-[#1080ad] mx-auto md:mx-0 mb-4" />
               <h2 className="text-3xl font-black text-[#001f3f] tracking-tight">Member Access</h2>
               <p className="text-slate-500 font-medium mt-2">Log in to view your digital badge and automatically sync your Fitforge custom workouts.</p>
            </div>
            <div className="flex-1 w-full space-y-4">
               <input type="email" id="w_email" placeholder="Account Email" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors" />
               <input type="password" id="w_pin" maxLength={4} placeholder="4-Digit Birthday (MMDD)" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] tracking-[0.5em] text-center transition-colors" onKeyDown={e => e.key === 'Enter' && handleLogin()}/>
               <button onClick={handleLogin} className="w-full bg-[#1080ad] text-white p-4 rounded-xl font-bold shadow-lg hover:bg-blue-800 transition-colors text-lg">Sync & Login</button>
            </div>
         </div>
      </div>
    );
  }

  // --- WIDE PORTAL DASHBOARD ---
  const statusColor = getStoplight(activeMember);
  
  // Filter workouts for ONLY the person logged in!
  const myWorkouts = workouts.filter(w => w.memberId === activeMember.id);
  
  return (
    <div className="bg-white/95 backdrop-blur-md p-8 rounded-[2rem] shadow-xl border border-slate-100 max-w-5xl mx-auto w-full font-sans relative overflow-hidden">
       <div className={`absolute top-0 left-0 w-full h-2 ${statusColor === 'green' ? 'bg-[#16a34a]' : statusColor === 'yellow' ? 'bg-[#f59e0b]' : 'bg-[#ef4444]'}`}></div>
       
       <div className="flex justify-between items-start mb-8 pb-6 border-b border-slate-100">
          <div>
            <h1 className="text-3xl font-black text-[#001f3f] tracking-tight">Hi, {activeMember.firstName}!</h1>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${statusColor === 'green' ? 'bg-green-100 text-green-700' : statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
               {statusColor === 'green' ? 'ACTIVE MEMBER' : statusColor === 'yellow' ? 'PAYMENT DUE' : 'ACCOUNT LOCKED'}
            </span>
          </div>
          <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold transition-all">
            <LogOut size={18}/> Sign Out
          </button>
       </div>

       <div className="flex flex-col md:flex-row gap-10 items-start">
          {/* QR Code Column */}
          <div className="flex flex-col items-center justify-center w-full md:w-1/3">
             <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 mb-3 shadow-inner">
                <QRCode data={activeMember.id} size={150} />
             </div>
             <p className="text-xl font-black text-[#001f3f] tracking-widest">{activeMember.id}</p>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Scan at Front Desk</p>
             
             <div className="w-full mt-6 bg-blue-50/50 p-5 rounded-2xl border border-blue-100 text-center">
                <div className="flex items-center justify-center gap-2 text-blue-800 mb-1"><Activity size={18} className="text-[#1080ad]"/><h3 className="font-bold">Lifetime Visits</h3></div>
                <p className="text-4xl font-black text-[#1080ad]">{activeMember.visits}</p>
             </div>
          </div>

          {/* Stats & Workouts Column */}
          <div className="flex-1 w-full flex flex-col h-full space-y-6">
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                 <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-2 text-slate-700 mb-3"><CreditCard size={18} className="text-slate-500"/><h3 className="font-bold">Account Info</h3></div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">Plan: <span className="text-slate-800 ml-1">{activeMember.type}</span></p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-tight mt-2">Renews: <span className={`ml-1 ${statusColor !== 'green' ? 'text-red-500' : 'text-slate-800'}`}>{activeMember.nextPayment || 'N/A'}</span></p>
                 </div>
                 <div className="bg-gradient-to-r from-[#1080ad] to-[#001f3f] p-5 rounded-2xl text-white shadow-lg flex flex-col justify-center">
                    <h3 className="font-bold text-lg flex items-center gap-2"><CheckCircle size={18} className="text-green-400" /> Fitforge Active</h3>
                    <p className="text-sm text-blue-200 mt-1 font-medium leading-tight">Your generated workouts will automatically save to your profile.</p>
                 </div>
             </div>

             {/* THE NEW SAVED WORKOUTS FILING CABINET */}
             <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex-1 flex flex-col max-h-[400px]">
                <h3 className="font-bold text-[#001f3f] mb-4 flex items-center gap-2"><Dumbbell size={18} className="text-[#8b5cf6]"/> My Saved Workouts</h3>
                
                <div className="overflow-y-auto pr-2 space-y-4 custom-scrollbar flex-1">
                    {myWorkouts.length > 0 ? (
                        myWorkouts.map((w, i) => (
                            <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">{new Date(w.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric'})}</span>
                               <p className="text-sm text-slate-700 whitespace-pre-wrap font-medium">{w.routine}</p>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 h-full flex flex-col items-center justify-center">
                           <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 text-slate-300"><Dumbbell size={24} /></div>
                           <p className="text-slate-500 font-bold">No saved workouts yet.</p>
                           <p className="text-xs text-slate-400 mt-1">Use the Fitforge engine to build and save your first routine!</p>
                        </div>
                    )}
                </div>
             </div>

          </div>
       </div>
    </div>
  );
}
