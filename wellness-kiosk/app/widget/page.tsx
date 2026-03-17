// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { CheckCircle, Activity, CreditCard, UserCircle, LogOut, Dumbbell, QrCode as QrIcon, KeyRound, ShieldCheck } from 'lucide-react';

const QRCode = ({ data, size = 120 }) => {
  const safeData = encodeURIComponent(data || "WC-000");
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${safeData}&color=003d6b&bgcolor=ffffff`;
  return <img src={qrUrl} alt="QR Code" className="mx-auto rounded-xl shadow-sm" style={{ width: size, height: size }} />;
};

export default function MemberWidget() {
  const [members, setMembers] = useState([]);
  const [workouts, setWorkouts] = useState([]); 
  const [activeMember, setActiveMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);

  useEffect(() => {
    document.body.style.background = 'transparent';

    fetch('/api/members')
      .then(res => res.json())
      .then(data => {
        if (data.records) {
          const mapped = data.records.map(r => {
            let planText = r.fields['Plan Name'] ? (Array.isArray(r.fields['Plan Name']) ? r.fields['Plan Name'][0] : r.fields['Plan Name']) : 'UNKNOWN PLAN';
            let rawPassword = String(r.fields['Password'] || '').trim();
            // Initial PIN: birthday (MMDD) or 1111 if not set
            let finalPassword = (rawPassword === '' || rawPassword.includes('ERROR')) ? '1111' : rawPassword;
            // Track whether member has set a custom PIN
            let hasCustomPin = r.fields['Has Custom PIN'] === true || r.fields['Has Custom PIN'] === 'true';
            
            return {
              id: r.fields['Member ID'] || r.id,
              airtableId: r.id,
              firstName: r.fields['First Name'] || 'Unknown',
              lastName: r.fields['Last Name'] || '',
              email: r.fields['Email'] || '',
              password: finalPassword,
              hasCustomPin: hasCustomPin,
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
      // If they haven't set a custom PIN yet, prompt them
      if (!found.hasCustomPin) {
        setShowPinSetup(true);
      }
      window.parent.postMessage({ 
          type: 'FITFORGE_LOGIN', 
          memberId: found.id, 
          name: found.firstName 
      }, '*');
    } else {
      alert('Incorrect email or PIN. Your initial PIN is your birthday (MMDD) or 1111.');
    }
  };

  const handlePinSetup = async () => {
    setPinError('');
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setPinError('PIN must be exactly 4 digits.');
      return;
    }
    if (newPin !== confirmPin) {
      setPinError('PINs do not match. Please try again.');
      return;
    }
    if (newPin === '1111' || newPin === '0000') {
      setPinError('Please choose a more secure PIN.');
      return;
    }

    try {
      // Update PIN in Airtable via API
      await fetch('/api/update-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordId: activeMember.airtableId,
          newPin: newPin
        })
      });

      // Update local state
      setMembers(prev => prev.map(m => 
        m.id === activeMember.id ? { ...m, password: newPin, hasCustomPin: true } : m
      ));
      setActiveMember(prev => ({ ...prev, password: newPin, hasCustomPin: true }));
      setPinSuccess(true);
      setTimeout(() => {
        setShowPinSetup(false);
        setPinSuccess(false);
        setNewPin('');
        setConfirmPin('');
      }, 2000);
    } catch (err) {
      setPinError('Could not update PIN. Please try again or ask staff for help.');
    }
  };

  const handleLogout = () => {
      setActiveMember(null);
      setShowPinSetup(false);
      setNewPin('');
      setConfirmPin('');
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

  // --- PIN SETUP MODAL ---
  if (showPinSetup && activeMember) {
    return (
      <div className="w-full max-w-md mx-auto bg-[#00294a]/95 backdrop-blur-md border border-[#1080ad]/30 rounded-2xl p-8 shadow-2xl font-sans text-center">
        <div className="bg-[#1080ad]/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <KeyRound size={28} className="text-[#1080ad]" />
        </div>

        {pinSuccess ? (
          <>
            <div className="bg-green-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={28} className="text-green-400" />
            </div>
            <h2 className="text-xl font-black text-white mb-2">PIN Updated!</h2>
            <p className="text-sm text-slate-300">Your new PIN is set. Use it next time you log in.</p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-black text-white mb-1">Welcome, {activeMember.firstName}!</h2>
            <p className="text-sm text-slate-300 mb-6">Set a personal 4-digit PIN to secure your account.<br />
              <span className="text-[10px] text-slate-400">You won't need to use your birthday anymore.</span>
            </p>

            <div className="space-y-3 max-w-[240px] mx-auto">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-left">New PIN</label>
                <input 
                  type="password" 
                  maxLength={4} 
                  value={newPin}
                  onChange={e => { setNewPin(e.target.value.replace(/\D/g, '')); setPinError(''); }}
                  placeholder="••••"
                  className="w-full p-3.5 bg-[#001a30] border border-[#1080ad]/30 text-white rounded-xl outline-none focus:border-[#1080ad] tracking-[0.3em] text-center text-lg transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-left">Confirm PIN</label>
                <input 
                  type="password" 
                  maxLength={4} 
                  value={confirmPin}
                  onChange={e => { setConfirmPin(e.target.value.replace(/\D/g, '')); setPinError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handlePinSetup()}
                  placeholder="••••"
                  className="w-full p-3.5 bg-[#001a30] border border-[#1080ad]/30 text-white rounded-xl outline-none focus:border-[#1080ad] tracking-[0.3em] text-center text-lg transition-colors"
                />
              </div>

              {pinError && (
                <div className="text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                  {pinError}
                </div>
              )}

              <button 
                onClick={handlePinSetup} 
                className="w-full bg-[#1080ad] hover:bg-[#0d6d91] text-white py-3.5 rounded-xl font-bold shadow-lg transition-colors text-sm"
              >
                Set My PIN
              </button>
              <button 
                onClick={() => setShowPinSetup(false)} 
                className="w-full text-slate-400 hover:text-slate-200 py-2 text-xs font-medium transition-colors"
              >
                Skip for now
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // --- LOGIN BANNER (Wellness Hub branded) ---
  if (!activeMember) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-[#00294a]/95 backdrop-blur-md border border-[#1080ad]/20 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 font-sans">
         <div className="flex items-center gap-4 text-center md:text-left">
            <div className="bg-[#1080ad]/20 p-3 rounded-full text-[#1080ad] hidden sm:block">
               <UserCircle size={36} />
            </div>
            <div>
               <h2 className="text-2xl font-black text-white tracking-tight">Member Portal</h2>
               <p className="text-sm text-slate-300 font-medium mt-1">Log in to track workouts and view your badge-in QR code.</p>
               <p className="text-[10px] text-slate-400 mt-0.5">First time? Use your email and birthday PIN (MMDD).</p>
            </div>
         </div>
         <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <input type="email" id="w_email" placeholder="Account Email" className="w-full sm:w-56 p-3.5 bg-[#001a30] border border-[#1080ad]/30 text-white rounded-xl outline-none focus:border-[#1080ad] transition-colors text-sm placeholder-slate-500" />
            <input type="password" id="w_pin" maxLength={4} placeholder="PIN" className="w-full sm:w-28 p-3.5 bg-[#001a30] border border-[#1080ad]/30 text-white rounded-xl outline-none focus:border-[#1080ad] tracking-[0.3em] text-center transition-colors text-sm placeholder-slate-500" onKeyDown={e => e.key === 'Enter' && handleLogin()}/>
            <button onClick={handleLogin} className="w-full sm:w-auto bg-[#dba51f] hover:bg-[#c4920f] text-[#003d6b] px-8 py-3.5 rounded-xl font-black shadow-lg transition-colors text-sm whitespace-nowrap">Sign In</button>
         </div>
      </div>
    );
  }

  // --- DASHBOARD (Wellness Hub branded) ---
  const statusColor = getStoplight(activeMember);
  const myWorkouts = workouts.filter(w => w.memberId === activeMember.id);
  const statusBarColor = statusColor === 'green' ? 'bg-green-500' : statusColor === 'yellow' ? 'bg-[#dba51f]' : 'bg-[#dd6d22]';
  
  return (
    <div className="w-full max-w-4xl mx-auto bg-[#00294a]/95 backdrop-blur-md border border-[#1080ad]/20 rounded-2xl shadow-2xl overflow-hidden font-sans">
       
       {/* Top Status Bar */}
       <div className={`h-1.5 w-full ${statusBarColor}`}></div>
       
       <div className="p-6">
           {/* Header */}
           <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#1080ad]/20">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-[#1080ad]/20 text-[#1080ad] rounded-full flex items-center justify-center font-bold text-lg">{activeMember.firstName.charAt(0)}</div>
                 <div>
                    <h1 className="text-xl font-black text-white leading-tight">{activeMember.firstName} {activeMember.lastName}</h1>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{activeMember.id} • {activeMember.type}</p>
                 </div>
              </div>
              <div className="flex items-center gap-2">
                 {activeMember.hasCustomPin && (
                   <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded border border-green-500/20 flex items-center gap-1 hidden sm:flex">
                     <ShieldCheck size={10}/> PIN Set
                   </span>
                 )}
                 {!activeMember.hasCustomPin && (
                   <button onClick={() => setShowPinSetup(true)} className="text-[10px] font-bold text-[#dba51f] bg-[#dba51f]/10 px-2 py-1 rounded border border-[#dba51f]/20 flex items-center gap-1 hover:bg-[#dba51f]/20 transition-colors hidden sm:flex">
                     <KeyRound size={10}/> Set PIN
                   </button>
                 )}
                 <button onClick={handleLogout} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold transition-all border border-red-500/20">
                   <LogOut size={14}/> Sign Out
                 </button>
              </div>
           </div>

           {/* Two Column Layout */}
           <div className="flex flex-col md:flex-row gap-6">
              
              {/* Left: ID & Stats */}
              <div className="w-full md:w-1/3 flex flex-col gap-4">
                 <div className="bg-white p-4 rounded-xl flex flex-col items-center justify-center shadow-inner">
                    <QRCode data={activeMember.id} size={130} />
                    <p className="text-[10px] font-black text-[#003d6b] uppercase tracking-widest mt-3 flex items-center gap-1"><QrIcon size={12}/> Scan to Enter</p>
                 </div>
                 <div className="bg-[#003d6b]/50 border border-[#1080ad]/20 rounded-xl p-4 text-center">
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1 flex items-center justify-center gap-1"><Activity size={12}/> Lifetime Visits</p>
                    <p className="text-3xl font-black text-[#dba51f]">{activeMember.visits}</p>
                 </div>
              </div>

              {/* Right: Workouts */}
              <div className="flex-1 flex flex-col">
                 <div className="flex justify-between items-end mb-3">
                    <h3 className="font-bold text-white flex items-center gap-2 text-sm"><Dumbbell size={16} className="text-[#dba51f]"/> My Saved Workouts</h3>
                    <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded border border-green-500/20 flex items-center gap-1"><CheckCircle size={10}/> Sync Active</span>
                 </div>
                 
                 <div className="bg-[#001a30]/80 border border-[#1080ad]/20 rounded-xl p-3 flex-1 h-[240px] overflow-y-auto">
                    <style>{`
                      .dark-scroll::-webkit-scrollbar { width: 6px; }
                      .dark-scroll::-webkit-scrollbar-track { background: transparent; }
                      .dark-scroll::-webkit-scrollbar-thumb { background: #1080ad40; border-radius: 10px; }
                    `}</style>
                    <div className="space-y-3 dark-scroll h-full pr-1">
                        {myWorkouts.length > 0 ? (
                            myWorkouts.map((w, i) => (
                                <div key={i} className="bg-[#003d6b]/40 border border-[#1080ad]/20 rounded-lg p-4 transition-colors hover:border-[#1080ad]/40">
                                   <span className="text-[10px] font-black text-[#dba51f] uppercase tracking-widest mb-2 block border-b border-[#1080ad]/20 pb-2">{new Date(w.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric'})}</span>
                                   <p className="text-xs text-slate-300 whitespace-pre-wrap font-medium leading-relaxed">{w.routine}</p>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                               <Dumbbell size={32} className="text-[#1080ad] mb-2" />
                               <p className="text-slate-300 text-sm font-bold">No saved workouts yet.</p>
                               <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Generate a workout below and click "Save to Profile"!</p>
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
