// @ts-nocheck
'use client';
import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Users, Search, QrCode, CreditCard, X, CheckCircle, AlertCircle, TrendingUp, Calendar, MapPin, Mail, LogOut, ShieldCheck, Phone, Activity, ChevronRight, LayoutDashboard, Filter, Download, Bell, FileText, Plus, Smartphone, Clock, Camera, UserCircle, Lock, Printer, Trash2, Briefcase, KeyRound, Eye, HelpCircle } from 'lucide-react';

const QRCode = ({ data, size = 160, darkColor = '#001f3f' }) => { const hexColor = darkColor.replace('#', ''); const safeData = encodeURIComponent(data || "WC-000"); const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${safeData}&color=${hexColor}&bgcolor=ffffff`; return <img src={qrUrl} alt="QR Code" style={{ width: size, height: size, display: 'block' }} />; };

const DonutChart = ({ data, totalLabel }) => { const total = data.reduce((sum, d) => sum + d.value, 0) || 1; let currentPercent = 0; const stops = data.filter(d => d.value > 0).map(d => { const percent = (d.value / total) * 100; const stop = `${d.color} ${currentPercent}% ${currentPercent + percent}%`; currentPercent += percent; return stop; }).join(', '); return (<div className="flex items-center justify-center gap-8 print:gap-4"><div className="relative w-48 h-48 print:w-36 print:h-36 rounded-full shadow-sm" style={{ background: stops ? `conic-gradient(${stops})` : '#e2e8f0', printColorAdjust: 'exact' }}><div className="absolute inset-5 print:inset-4 bg-white rounded-full flex flex-col items-center justify-center shadow-inner"><span className="text-3xl print:text-2xl font-black text-[#001f3f] leading-none">{total === 1 && data.every(d => d.value === 0) ? 0 : data.reduce((s,d)=>s+d.value,0)}</span><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest print:text-[7px]">{totalLabel}</span></div></div><div className="space-y-2 flex-1 print:space-y-1">{data.filter(d => d.value > 0).map((d, i) => (<div key={i} className="flex justify-between items-center text-sm print:text-xs border-b border-slate-50 print:border-slate-200 last:border-0 pb-1"><div className="flex items-center gap-2 print:gap-1"><span className="w-3 h-3 print:w-2 print:h-2 rounded-full" style={{ backgroundColor: d.color, printColorAdjust: 'exact' }}></span><span className="font-bold text-slate-600 print:text-black">{d.label}</span></div><span className="font-black text-[#001f3f]">{d.value}</span></div>))}</div></div>); };

const LOGO_URL = 'https://pattersonhc.org/sites/default/files/wellness_white.png';

export default function WellnessHub() {
  const [isMounted, setIsMounted] = useState(false);
  const [currentDateString, setCurrentDateString] = useState('');
  const [paymentModal, setPaymentModal] = useState(null);
  const [view, setView] = useState('landing');
  const [user, setUser] = useState(null);
  const [activeMember, setActiveMember] = useState(null);
  const [activeCorp, setActiveCorp] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [members, setMembers] = useState([]);
  const [visits, setVisits] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickSearch, setQuickSearch] = useState('');
  const [viewingCenter, setViewingCenter] = useState('both');
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [scannerActive, setScannerActive] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newMemberPin, setNewMemberPin] = useState(null);
  const [familyFlow, setFamilyFlow] = useState(null);
  const [corporatePartners, setCorporatePartners] = useState([]);
  const [selectedSponsor, setSelectedSponsor] = useState('');
  const [customSponsor, setCustomSponsor] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [kioskMessage, setKioskMessage] = useState({text: '', type: '', subtext: ''});
  const [kioskInput, setKioskInput] = useState('');
  const [pinModal, setPinModal] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [visitors, setVisitors] = useState([]);
  const [showAllCheckins, setShowAllCheckins] = useState(false);
  const [showAllMemberVisits, setShowAllMemberVisits] = useState(false);
  const [activeClass, setActiveClass] = useState(null);
  const [kioskMode, setKioskMode] = useState('Gym');
  const [expandedFaq, setExpandedFaq] = useState(null);
  
  const [reportMonth, setReportMonth] = useState(() => {
    const now = new Date();
    return `${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
  });
  
  const [usageBasedCorps, setUsageBasedCorps] = useState(() => { try { return JSON.parse(localStorage.getItem('wellnessUsagePrefs')) || {}; } catch(e) { return {}; } });
  const [expandedCorpId, setExpandedCorpId] = useState(null);
  const [editingCorp, setEditingCorp] = useState(null);
  
  const [showAddVisitorModal, setShowAddVisitorModal] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);

  useEffect(() => { localStorage.setItem('wellnessUsagePrefs', JSON.stringify(usageBasedCorps)); }, [usageBasedCorps]);

  useEffect(() => {
    setShowAllMemberVisits(false);
  }, [selectedMember]);

  // --- CENTRAL PRICING ENGINE ---
  const getBaseRate = (p, b) => {
    const r = {
      'SINGLE': { 'Month-to-Month': 35, 'Auto-Draft': 32, '6-Month Prepay': 200, '12-Month Prepay': 378 },
      'FAMILY': { 'Month-to-Month': 55, 'Auto-Draft': 50, '6-Month Prepay': 313, '12-Month Prepay': 594 },
      'SENIOR': { 'Month-to-Month': 22, 'Auto-Draft': 20, '6-Month Prepay': 125, '12-Month Prepay': 238 },
      'SENIOR CITIZEN': { 'Month-to-Month': 22, 'Auto-Draft': 20, '6-Month Prepay': 125, '12-Month Prepay': 238 }, 
      'SENIOR FAMILY': { 'Month-to-Month': 40, 'Auto-Draft': 36, '6-Month Prepay': 228, '12-Month Prepay': 432 },
      'STUDENT': { 'Month-to-Month': 20, 'Auto-Draft': 18, '6-Month Prepay': 114, '12-Month Prepay': 216 }
    };
    if (p === 'CORPORATE') return 25;
    if (p === 'CORPORATE FAMILY') return 45;
    if (['MILITARY', 'HD6', 'HCHF', 'FIRST DAY FREE'].includes(p)) return 0;
    return r[p] ? (r[p][b] || r[p]['Month-to-Month']) : 0;
  };

  const membersRef = useRef(members);
  useEffect(() => { membersRef.current = members; }, [members]);
  const centerRef = useRef(viewingCenter);
  useEffect(() => { centerRef.current = viewingCenter; }, [viewingCenter]);

  useEffect(() => {
    setIsMounted(true);
    setCurrentDateString(new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }));
    const savedToken = localStorage.getItem('wellnessToken');
    const savedCenter = localStorage.getItem('wellnessCenter');
    if (savedToken) {
      fetch('/api/verify-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: savedToken }) })
      .then(res => res.json()).then(data => {
        if (data.valid) { setSessionToken(savedToken); setLastActivity(Date.now()); if (data.type === 'director' && data.user) { setUser(data.user); setViewingCenter(data.user.center); setView('dashboard'); } else if (data.type === 'corporate' && data.corp) { setActiveCorp(data.corp); setView('corp_portal'); } }
        else { localStorage.removeItem('wellnessToken'); localStorage.removeItem('wellnessCenter'); }
      }).catch(() => { localStorage.removeItem('wellnessToken'); });
    }
    if (savedCenter) setViewingCenter(savedCenter);
  }, []);

  const handleLogin = async () => { const u = document.getElementById('u_in').value.toLowerCase().trim(); const p = document.getElementById('p_in').value.trim(); try { const res = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: u, password: p, loginType: 'director' }) }); const data = await res.json(); if (data.success) { setUser(data.user); setSessionToken(data.token); setViewingCenter(data.user.center); setLastActivity(Date.now()); localStorage.setItem('wellnessToken', data.token); localStorage.setItem('wellnessCenter', data.user.center); setView('dashboard'); } else { alert('Incorrect credentials.'); } } catch (err) { alert('Login failed. Please try again.'); } };
  const handleCorpLogin = async () => { const u = document.getElementById('c_in').value.toLowerCase().trim(); const p = document.getElementById('c_pin').value.trim(); try { const res = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: u, password: p, loginType: 'corporate' }) }); const data = await res.json(); if (data.success) { setActiveCorp(data.corp); setSessionToken(data.token); setLastActivity(Date.now()); localStorage.setItem('wellnessToken', data.token); setView('corp_portal'); } else { alert('Incorrect corporate credentials.'); } } catch (err) { alert('Login failed. Please try again.'); } };
  const handleLogout = () => { setUser(null); setActiveCorp(null); setSessionToken(null); localStorage.removeItem('wellnessToken'); localStorage.removeItem('wellnessCenter'); setView('landing'); };

  const SESSION_TIMEOUT = 8 * 60 * 60 * 1000;
  useEffect(() => { const u = () => setLastActivity(Date.now()); window.addEventListener('click', u); window.addEventListener('keydown', u); window.addEventListener('scroll', u); window.addEventListener('touchstart', u); return () => { window.removeEventListener('click', u); window.removeEventListener('keydown', u); window.removeEventListener('scroll', u); window.removeEventListener('touchstart', u); }; }, []);
  useEffect(() => { if (!user && !activeCorp) return; const interval = setInterval(() => { if (Date.now() - lastActivity > SESSION_TIMEOUT) { alert('Your session has expired due to inactivity. Please log in again.'); handleLogout(); } }, 60 * 1000); return () => clearInterval(interval); }, [user, activeCorp, lastActivity]);

  useEffect(() => {
    fetch('/api/members').then(res => res.json()).then(data => { /* handled below */ });
    fetch('/api/get-corporate-partners').then(res => res.json()).then(data => {
      if (data.records) { setCorporatePartners(data.records.map(r => ({ id: r.id, name: r.fields['Company Name'] || '', sponsorMatch: r.fields['Sponsor Match'] || r.fields['Company Name'] || '', contactName: r.fields['Contact Name'] || '', contactEmail: r.fields['Contact Email'] || '', paidMonths: r.fields['Paid Months'] || '', address: r.fields['Street Address'] || '', city: r.fields['City'] || '', state: r.fields['State'] || 'KS', zip: r.fields['Zip'] || '' })).filter(p => p.name).sort((a,b) => a.name.localeCompare(b.name))); }
    }).catch(() => {});
    fetch('/api/get-visitors').then(res => res.json()).then(data => {
      if (data.records) {
        setVisitors(data.records.map(r => ({
          airtableId: r.id, firstName: r.fields['First Name'] || '', lastName: r.fields['Last Name'] || '', email: r.fields['Email'] || '', phone: r.fields['Phone'] || '', passType: r.fields['Pass Type'] || '', amountPaid: r.fields['Amount Paid'] || 0, referringProvider: r.fields['Referring Provider'] || '', purchaseDate: r.fields['Purchase Date'] || '', expirationDate: r.fields['Expiration Date'] || '', center: r.fields['Center'] || '', pin: r.fields['PIN'] || '', orientationComplete: !!r.fields['Orientation Complete'], totalVisits: r.fields['Total Visits'] || 0, address: r.fields['Street Address'] || '', city: r.fields['City'] || '', state: r.fields['State'] || '', zip: r.fields['Zip'] || '', notes: r.fields['Notes'] || '',
        })));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch('/api/members').then(res => res.json()).then(data => {
      if (data.error) { setApiError(data.error.message || JSON.stringify(data.error)); setLoading(false); return; }
      if (data.records) {
        const mappedMembers = data.records.filter(r => r.fields['First Name'] && r.fields['First Name'] !== '').map(r => {
          let planText = r.fields['Plan Name'] ? (Array.isArray(r.fields['Plan Name']) ? r.fields['Plan Name'][0] : r.fields['Plan Name']) : 'UNKNOWN PLAN';
          let rawPassword = String(r.fields['Password'] || '').trim();
          let finalPassword = (rawPassword === '' || rawPassword.includes('ERROR')) ? '1111' : rawPassword;
          return { airtableId: r.id, id: r.fields['Member ID'] || r.id, firstName: r.fields['First Name'] || 'Unknown', lastName: r.fields['Last Name'] || '', email: r.fields['Email'] || '', phone: r.fields['Phone'] || '', password: finalPassword, status: (r.fields['Membership Status'] || 'ACTIVE').toUpperCase(), type: String(planText).toUpperCase().trim(), center: r.fields['Home Center'] || 'Anthony', visits: Number(r.fields['Total Visits'] || 0), nextPayment: r.fields['Next Payment Due'] || null, sponsor: !!r.fields['Corporate Sponsor'], sponsorName: r.fields['Corporate Sponsor'] ? String(r.fields['Corporate Sponsor']).trim() : '', needsOrientation: !!r.fields['Needs Orientation'], familyName: r.fields['Family Name'] ? (Array.isArray(r.fields['Family Name']) ? r.fields['Family Name'][0] : r.fields['Family Name']) : '', billingMethod: r.fields['Billing Method'] || '', monthlyRate: r.fields['Monthly Rate'] || '', access247: !!r.fields['24/7 Access'], badgeNumber: r.fields['Badge Number'] || '', startDate: r.fields['Start Date'] || null, notes: r.fields['Notes'] || '', discountCode: r.fields['Discount Code'] || '', discountExpiration: r.fields['Discount Expiration'] || null, address: r.fields['Street Address'] || '', city: r.fields['City'] || '', state: r.fields['State'] || 'KS', zip: r.fields['Zip'] || '', paymentMethod: r.fields['Payment Method'] || '' };
        setMembers(mappedMembers); setApiError('');
        fetch('/api/get-visits').then(res => res.json()).then(visitData => {
          if (visitData.records) { const mappedVisits = visitData.records.map(v => { const linkedArray = v.fields['Member'] || v.fields['Members'] || []; const linkId = linkedArray[0]; const foundMember = mappedMembers.find(m => m.airtableId === linkId); const fallbackName = Array.isArray(v.fields['Name']) ? v.fields['Name'][0] : v.fields['Name'] || 'Unknown Member'; return { name: foundMember ? `${foundMember.firstName} ${foundMember.lastName}` : fallbackName, center: v.fields['Center'] || v.fields['Location'] || 'Both', time: v.fields['Time'] || v.fields['Date'] || v.createdTime, type: foundMember ? foundMember.type : 'Unknown', method: v.fields['Method'] || 'General' }; }); mappedVisits.sort((a,b) => new Date(b.time) - new Date(a.time)); setVisits(mappedVisits); }
          setLoading(false);
        }).catch(err => { console.error("Could not fetch historical visits:", err); setLoading(false); });
      } else { setLoading(false); }
    }).catch(err => { setApiError(err.message || "Failed to fetch from Vercel"); setLoading(false); });
  }, []);

  const scopedMembers = members.filter(m => viewingCenter === 'both' || (m.center && m.center.toLowerCase().includes(viewingCenter)));
  const filteredMembers = scopedMembers.filter(m => `${m.firstName} ${m.lastName} ${m.id}`.toLowerCase().includes(searchQuery.toLowerCase())).sort((a, b) => a.lastName.localeCompare(b.lastName));
  const filteredVisits = visits.filter(v => viewingCenter === 'both' || (v.center && v.center.toLowerCase().includes(viewingCenter)));
  const memberMatches = kioskInput.length >= 2 ? members.filter(m => (m.firstName + ' ' + m.lastName).toLowerCase().includes(kioskInput.toLowerCase()) || m.id.toLowerCase().includes(kioskInput.toLowerCase())).slice(0, 4) : [];
  const visitorMatches = kioskInput.length >= 2 ? visitors.filter(v => { const today = new Date(); const exp = new Date(v.expirationDate + 'T23:59:59'); return exp >= today && v.orientationComplete && (v.firstName + ' ' + v.lastName).toLowerCase().includes(kioskInput.toLowerCase()); }).slice(0, 2) : [];
  const kioskMatches = [...memberMatches.map(m => ({...m, _type: 'member'})), ...visitorMatches.map(v => ({...v, id: 'VISITOR', _type: 'visitor'}))];
  const heatmapData = Array(15).fill(0); filteredVisits.forEach(v => { const hour = new Date(v.time).getHours(); if (hour >= 6 && hour <= 20) heatmapData[hour - 6]++; }); const maxVisits = Math.max(...heatmapData, 1);
  const stats = { total: scopedMembers.length, active: scopedMembers.filter(m => m.status === 'ACTIVE').length, overdue: scopedMembers.filter(m => m.status === 'OVERDUE').length, expiring: scopedMembers.filter(m => m.status === 'EXPIRING').length, today: filteredVisits.filter(v => new Date(v.time).toDateString() === new Date().toDateString()).length };
  
  const reportStats = { 
      single: scopedMembers.filter(m => m.type === 'SINGLE').length, 
      family: scopedMembers.filter(m => m.type === 'FAMILY').length, 
      senior: scopedMembers.filter(m => m.type === 'SENIOR' || m.type === 'SENIOR CITIZEN').length, 
      seniorFamily: scopedMembers.filter(m => m.type === 'SENIOR FAMILY').length, 
      student: scopedMembers.filter(m => m.type.includes('STUDENT')).length, 
      corporate: scopedMembers.filter(m => m.type === 'CORPORATE').length, 
      corporateFamily: scopedMembers.filter(m => m.type === 'CORPORATE FAMILY').length, 
      dayPass: scopedMembers.filter(m => m.type.includes('DAY PASS')).length, 
      staff: scopedMembers.filter(m => m.type.includes('HD6') || m.type.includes('HCHF')).length, 
      military: scopedMembers.filter(m => m.type.includes('MILITARY')).length 
  };
  
  const planChartData = [{label:'Single',value:reportStats.single,color:'#1080ad'},{label:'Family',value:reportStats.family,color:'#f59e0b'},{label:'Senior',value:reportStats.senior+reportStats.seniorFamily,color:'#16a34a'},{label:'Student',value:reportStats.student,color:'#8b5cf6'},{label:'Corporate',value:reportStats.corporate+reportStats.corporateFamily,color:'#ef4444'},{label:'Other (Staff/Mil/Pass)',value:reportStats.staff+reportStats.military+reportStats.dayPass,color:'#64748b'}];
  const statusChartData = [{label:'Active',value:stats.active,color:'#16a34a'},{label:'Expiring Soon',value:stats.expiring,color:'#f59e0b'},{label:'Overdue / Locked',value:stats.overdue,color:'#ef4444'}];
  const familyMembers = activeMember ? members.filter(m => m.id !== activeMember.id && ((m.email && m.email.toLowerCase() === activeMember.email.toLowerCase()) || (m.phone && m.phone === activeMember.phone))) : [];

  const handleUpdateProfile = async () => { setIsUpdating(true); const newEmail = document.getElementById('edit_email').value.trim(); const newPhone = document.getElementById('edit_phone').value.trim(); setActiveMember({...activeMember, email: newEmail, phone: newPhone}); setEditMode(false); try { await fetch('/api/update-member', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ airtableId: activeMember.airtableId, email: newEmail, phone: newPhone }) }); } catch (err) { alert("App updated locally."); } setIsUpdating(false); };

  const handleAddMemberSubmit = async (e) => {
    e.preventDefault(); setIsAdding(true); setNewMemberPin(null);
    const firstName = e.target.fname.value; const lastName = e.target.lname.value; const email = e.target.email.value; const phone = e.target.phone.value; const plan = e.target.plan.value; const center = e.target.center.value;
    const needsOrientation = e.target.orientation?.checked || false; const isFamily = plan.includes('FAMILY'); const isCorporate = plan.includes('CORPORATE') || plan.includes('HD6') || plan.includes('HCHF');
    const sponsor = isCorporate ? (selectedSponsor === '__other__' ? customSponsor : selectedSponsor) : '';
    const address = e.target.address?.value || ''; const city = e.target.city?.value || ''; const mstate = e.target.mstate?.value || 'KS'; const mzip = e.target.mzip?.value || '';
    const billing = e.target.billing?.value || 'Month-to-Month'; const access247 = e.target.access247?.checked || false; const startDate = document.getElementById('startDate').value; const badgeNumber = e.target.badgenum?.value || '';
    const discountCode = e.target.discount?.value || '';
    const discountExpiration = e.target.discount_exp?.value || '';

    const basePrice = getBaseRate(plan, billing);
    const discountMatch = discountCode.match(/\$(\d+)/);
    const discountAmount = discountMatch ? parseInt(discountMatch[1], 10) : 0;
    const finalMonthlyRate = Math.max(0, basePrice - discountAmount);

    if (isFamily && !familyFlow) {
      try {
        const res = await fetch('/api/add-family-member', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ firstName, lastName, email, phone, plan, center, corporateSponsor: sponsor, needsOrientation, startDate, address, city, state: mstate, zip: mzip, billingMethod: billing, access247, badgeNumber, discountCode, discountExpiration, monthlyRate: finalMonthlyRate }) });
        const result = await res.json();
        if (result.success) { setFamilyFlow({ familyRecordId: result.familyRecordId, familyName: result.familyName, lastName, plan, center, email, phone, corporateSponsor: sponsor, addedMembers: [{ name: `${firstName} ${lastName}`, pin: result.pin, isPrimary: true }] }); setNewMemberPin({ name: `${firstName} ${lastName}`, pin: result.pin }); } else { alert('Error: ' + result.error); }
      } catch (err) { alert('Network error. Please try again.'); }
    } else if (isFamily && familyFlow) {
      try {
        const res = await fetch('/api/add-family-member', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ firstName, lastName: familyFlow.lastName, email: email || familyFlow.email, phone: phone || familyFlow.phone, plan: familyFlow.plan, center: familyFlow.center, familyRecordId: familyFlow.familyRecordId, corporateSponsor: familyFlow.corporateSponsor, needsOrientation, address, city, state: mstate, zip: mzip, access247, badgeNumber, discountCode, discountExpiration, monthlyRate: finalMonthlyRate }) });
        const result = await res.json();
        if (result.success) { const updated = { ...familyFlow, addedMembers: [...familyFlow.addedMembers, { name: `${firstName} ${familyFlow.lastName}`, pin: result.pin, isPrimary: false }] }; setFamilyFlow(updated); setNewMemberPin({ name: `${firstName} ${familyFlow.lastName}`, pin: result.pin }); } else { alert('Error: ' + result.error); }
      } catch (err) { alert('Network error. Please try again.'); }
    } else {
      try {
        const res = await fetch('/api/add-member', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ firstName, lastName, email, phone, plan, center, corporateSponsor: sponsor, needsOrientation, address, city, state: mstate, zip: mzip, billingMethod: billing, access247, badgeNumber, startDate, discountCode, discountExpiration, monthlyRate: finalMonthlyRate }) });
        const result = await res.json();
        if (result.success) { setNewMemberPin({ name: `${firstName} ${lastName}`, pin: result.pin || '1111' }); } else { alert('Error: ' + result.error); }
      } catch (err) { alert('Network error. Please try again.'); }
    }
    setIsAdding(false);
  };

  const handleRenewVisitor = async (visitor, newPassType) => {
    const confirmRenew = window.confirm(`Renew ${visitor.firstName} ${visitor.lastName} for a new ${newPassType}?`);
    if (!confirmRenew) return;
    try {
      const res = await fetch('/api/add-visitor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ firstName: visitor.firstName, lastName: visitor.lastName, email: visitor.email, phone: visitor.phone, address: visitor.address, city: visitor.city, state: visitor.state, zip: visitor.zip, passType: newPassType, center: viewingCenter === 'both' ? 'Anthony Wellness Center' : viewingCenter === 'harper' ? 'Harper Wellness Center' : 'Anthony Wellness Center', referringProvider: visitor.referringProvider, notes: `Renewed on ${new Date().toLocaleDateString()}` }) });
      const result = await res.json();
      if (result.success) {
        alert(`Pass Renewed!\n\nNew PIN: ${result.pin}\nExpires: ${result.expirationDate}`);
        fetch('/api/get-visitors').then(r => r.json()).then(data => { if (data.records) setVisitors(data.records.map(r => ({ airtableId: r.id, firstName: r.fields['First Name'] || '', lastName: r.fields['Last Name'] || '', email: r.fields['Email'] || '', phone: r.fields['Phone'] || '', passType: r.fields['Pass Type'] || '', amountPaid: r.fields['Amount Paid'] || 0, referringProvider: r.fields['Referring Provider'] || '', purchaseDate: r.fields['Purchase Date'] || '', expirationDate: r.fields['Expiration Date'] || '', center: r.fields['Center'] || '', pin: r.fields['PIN'] || '', orientationComplete: !!r.fields['Orientation Complete'], totalVisits: r.fields['Total Visits'] || 0, address: r.fields['Street Address'] || '', city: r.fields['City'] || '', state: r.fields['State'] || '', zip: r.fields['Zip'] || '', notes: r.fields['Notes'] || '' }))); });
      }
    } catch (err) { alert('Renewal failed.'); }
  };

  const handleDeleteMember = async () => { if (!user || user.role !== 'admin') { alert('Only System Admins can delete members.'); return; } if (!window.confirm(`Permanently delete ${selectedMember.firstName} ${selectedMember.lastName}?`)) return; setIsDeleting(true); try { const res = await fetch('/api/delete-member', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ airtableId: selectedMember.airtableId }) }); const result = await res.json(); if (result.success) { setMembers(prev => prev.filter(m => m.airtableId !== selectedMember.airtableId)); setSelectedMember(null); } else { alert('Error: ' + result.error); } } catch (err) { alert('Network error.'); } setIsDeleting(false); };
  const handleResetPin = async (member) => { if (!window.confirm(`Reset PIN for ${member.firstName} ${member.lastName}?`)) return; try { const newPin = String(Math.floor(1000 + Math.random() * 9000)); await fetch('/api/update-pin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ recordId: member.airtableId, newPin }) }); setMembers(prev => prev.map(m => m.airtableId === member.airtableId ? { ...m, password: newPin } : m)); alert(`New PIN for ${member.firstName}: ${newPin}\n\nPlease give this to the member.`); } catch (err) { alert('Could not reset PIN.'); } };
  const getStoplight = (member) => { if (!member.nextPayment) return 'green'; const due = new Date(member.nextPayment); const diffDays = Math.ceil((new Date() - due) / (1000*60*60*24)); if (diffDays <= 0) return 'green'; if (diffDays <= 14) return 'yellow'; return 'red'; };

  const processCheckIn = async (memberId, method = "Manual Entry") => { const id = memberId.toUpperCase().trim(); const m = membersRef.current.find(m => m.id === id); if(m) { if (m.needsOrientation) { setKioskMessage({ text: 'Orientation Required', type: 'error', subtext: 'Please see front desk to complete your orientation.' }); setTimeout(() => setKioskMessage({ text: '', type: '', subtext: '' }), 5000); return false; } const light = getStoplight(m); if (light === 'red') { setKioskMessage({ text: 'Please see front desk.', type: 'error', subtext: 'We need to quickly update your account.' }); setTimeout(() => setKioskMessage({ text: '', type: '', subtext: '' }), 4500); return false; } const currentCenter = centerRef.current; const scanCenter = currentCenter === 'both' ? m.center : currentCenter.charAt(0).toUpperCase() + currentCenter.slice(1); const currentTime = new Date().toISOString(); try { const res = await fetch('/api/visits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ airtableId: m.airtableId, center: scanCenter, time: currentTime, method: method }) }); const result = await res.json(); if (!result.success) { setKioskMessage({ text: 'System Error', type: 'error', subtext: 'Please see the front desk.' }); setTimeout(() => setKioskMessage({ text: '', type: '', subtext: '' }), 4000); return false; } setVisits(prev => [{name: m.firstName + ' ' + m.lastName, center: scanCenter, time: currentTime, type: m.type, method: method}, ...prev]); setMembers(prev => prev.map(member => member.id === id ? { ...member, visits: member.visits + 1 } : member)); if (activeMember && activeMember.id === id) setActiveMember(prev => ({...prev, visits: prev.visits + 1})); if (light === 'yellow') { setKioskMessage({ text: `Welcome, ${m.firstName}!`, type: 'warning', subtext: 'Please see the front desk at your convenience.' }); } else { setKioskMessage({ text: `Welcome, ${m.firstName}!`, type: 'success', subtext: '' }); } setTimeout(() => setKioskMessage({ text: '', type: '', subtext: '' }), 3500); return true; } catch (err) { setKioskMessage({ text: 'Network Error', type: 'error', subtext: 'Please try again.' }); setTimeout(() => setKioskMessage({ text: '', type: '', subtext: '' }), 4000); return false; } } else { setKioskMessage({ text: 'ID not found.', type: 'error', subtext: 'Please see front desk.' }); setTimeout(() => setKioskMessage({ text: '', type: '', subtext: '' }), 3500); return false; } };

  useEffect(() => { let scanner = null; if (view === 'secret_scanner' && scannerActive) { scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: {width: 280, height: 280} }, false); scanner.render((decodedText) => { processCheckIn(decodedText, "Camera Scan"); }, () => {}); } return () => { if(scanner) scanner.clear().catch(e => console.error(e)); }; }, [view, scannerActive]);

  const handleExportCSV = () => { if (filteredMembers.length === 0) return; const headers = ["Member ID","First Name","Last Name","Email","Phone","Membership Type","Home Center","Status","Total Visits","Next Payment","Sponsor"]; const csvRows = [headers.join(','), ...filteredMembers.map(m => `"${m.id}","${m.firstName}","${m.lastName}","${m.email}","${m.phone}","${m.type}","${m.center}","${m.status}","${m.visits}","${m.nextPayment}","${m.sponsorName}"`)].join('\n'); const blob = new Blob([csvRows], { type: 'text/csv' }); const url = window.URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `Wellness_Members_${new Date().toISOString().slice(0,10)}.csv`; a.click(); window.URL.revokeObjectURL(url); };
  
  const ProStatCard = ({ value, label, color }) => (<div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 print:shadow-none print:border-slate-300" style={{ borderLeft: `6px solid ${color}` }}><p className="text-5xl font-extrabold mb-1 print:text-3xl" style={{ color }}>{value}</p><p className="text-xs font-bold text-[#001f3f] uppercase tracking-tight print:text-[10px]">{label}</p></div>);
  const ProListCard = ({ title, children, actions }) => (<div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 h-full print:h-auto print:p-4 print:shadow-none print:border-slate-300 print:break-inside-avoid"><div className="flex justify-between items-center mb-6 print:mb-2"><h3 className="text-lg font-bold text-[#001f3f] print:text-base">{title}</h3>{actions}</div>{children}</div>);

  if (!isMounted) return <div className="min-h-screen bg-[#001f3f]" />;

  if (view === 'landing') { return (<div className="min-h-screen bg-[#001f3f] flex items-center justify-center font-sans p-6 relative"><div className="text-center max-w-6xl w-full relative z-10"><img src={LOGO_URL} alt="Logo" className="h-40 mx-auto mb-16 opacity-100 drop-shadow-2xl" /><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"><button onClick={() => { setView('kiosk'); setViewingCenter(viewingCenter === 'both' ? 'anthony' : viewingCenter); setKioskInput(''); }} className="bg-white/10 border border-white/20 p-10 rounded-3xl text-white hover:bg-white/20 transition-all flex flex-col items-center gap-4 group"><Smartphone size={56} className="text-[#1080ad] group-hover:scale-110 transition-transform" /><span className="text-xl font-bold">Public Kiosk</span></button><button onClick={() => setView('member_login')} className="bg-white/10 border border-white/20 p-10 rounded-3xl text-white hover:bg-white/20 transition-all flex flex-col items-center gap-4 group"><UserCircle size={56} className="text-[#16a34a] group-hover:scale-110 transition-transform" /><span className="text-xl font-bold">Member Portal</span></button><button onClick={() => setView('corp_login')} className="bg-white/10 border border-white/20 p-10 rounded-3xl text-white hover:bg-white/20 transition-all flex flex-col items-center gap-4 group"><Briefcase size={56} className="text-[#8b5cf6] group-hover:scale-110 transition-transform" /><span className="text-xl font-bold">Corporate Portal</span></button><button onClick={() => setView('login')} className="bg-white/10 border border-white/20 p-10 rounded-3xl text-white hover:bg-white/20 transition-all flex flex-col items-center gap-4 group border-b-4 border-b-[#f59e0b]"><ShieldCheck size={56} className="text-[#f59e0b] group-hover:scale-110 transition-transform" /><span className="text-xl font-bold">Director Portal</span></button></div></div><button onClick={() => {setView('secret_scanner'); setViewingCenter('both');}} className="absolute bottom-6 right-6 opacity-10 hover:opacity-50 transition-opacity p-4"><Lock size={20} className="text-white"/></button></div>); }

  if (view === 'login') { 
    return (
      <div className="min-h-screen bg-[#001f3f] flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-[3rem] shadow-2xl p-12 w-full max-w-md border-t-8 border-[#f59e0b]">
          <div className="flex justify-center mb-6"><ShieldCheck size={64} className="text-[#f59e0b]" /></div>
          <h2 className="text-4xl font-black text-center text-slate-900 mb-2 tracking-tight">Director Access</h2>
          <p className="text-slate-400 mb-10 text-center font-medium tracking-tight">Log in to manage your wellness center.</p>
          <input type="text" placeholder="Username" id="u_in" className="w-full p-5 bg-slate-100 rounded-2xl mb-4 outline-none border-2 border-transparent focus:border-[#f59e0b]/40 text-lg" onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
          <input type="password" placeholder="Password" id="p_in" className="w-full p-5 bg-slate-100 rounded-2xl mb-8 outline-none border-2 border-transparent focus:border-[#f59e0b]/40 text-lg" onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
          <button onClick={handleLogin} className="w-full bg-[#f59e0b] text-white p-5 rounded-2xl font-bold text-xl shadow-xl hover:bg-amber-600 transition-all">Sign In</button>
          <button onClick={() => setView('landing')} className="w-full mt-6 text-slate-400 font-bold hover:text-slate-600 transition-colors">Return to Home</button>
        </div>
      </div>
    ); 
  }

  if (view === 'corp_login') { return (<div className="min-h-screen bg-[#001f3f] flex items-center justify-center p-4 font-sans"><div className="bg-white rounded-[3rem] shadow-2xl p-12 w-full max-w-md border-t-8 border-[#8b5cf6]"><div className="flex justify-center mb-6"><Briefcase size={64} className="text-[#8b5cf6]" /></div><h2 className="text-4xl font-black text-center text-slate-900 mb-2 tracking-tight">Partner Login</h2><p className="text-slate-400 mb-10 text-center font-medium tracking-tight">Access your employee wellness roster.</p><input type="text" placeholder="Company Username" id="c_in" className="w-full p-5 bg-slate-100 rounded-2xl mb-4 outline-none border-2 border-transparent focus:border-purple-500/20 text-lg" onKeyDown={(e) => e.key === 'Enter' && handleCorpLogin()} /><input type="password" placeholder="Access PIN" id="c_pin" className="w-full p-5 bg-slate-100 rounded-2xl mb-8 outline-none border-2 border-transparent focus:border-purple-500/20 text-lg" onKeyDown={(e) => e.key === 'Enter' && handleCorpLogin()} /><button onClick={handleCorpLogin} className="w-full bg-[#8b5cf6] text-white p-5 rounded-2xl font-bold text-xl shadow-xl hover:bg-purple-700 transition-all">Sign In</button><button onClick={() => setView('landing')} className="w-full mt-6 text-slate-400 font-bold hover:text-slate-600 transition-colors">Return to Home</button></div></div>); }

  if (view === 'corp_portal' && activeCorp) { const corpMembers = members.filter(m => m.sponsorName.toLowerCase() === activeCorp.companyName.toLowerCase()); const totalCorpVisits = corpMembers.reduce((sum, m) => sum + m.visits, 0); const singlePlans = corpMembers.filter(m => m.type.includes('SINGLE')).length; const familyPlans = corpMembers.filter(m => m.type.includes('FAMILY')).length; return (<div className="min-h-screen bg-[#f0f2f5] font-sans print:bg-white"><nav className="bg-[#001f3f] text-white p-4 shadow-md flex justify-between items-center sticky top-0 z-10 print:hidden"><div className="flex items-center gap-3"><img src={LOGO_URL} alt="Logo" className="h-6" /><span className="font-bold tracking-tight border-l border-white/20 pl-3">Corporate Partner Portal</span></div><button onClick={handleLogout} className="bg-red-500/20 text-red-100 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold transition-all"><LogOut size={16}/> Logout</button></nav><main className="max-w-5xl mx-auto p-8 space-y-8 mt-4 print:p-0 print:m-0 print:max-w-none print:mt-0"><div className="flex justify-between items-end print:hidden"><div><h1 className="text-4xl font-black text-[#001f3f] tracking-tight mb-1">{activeCorp.companyName} Wellness Roster</h1><p className="text-slate-500 font-medium">Review your enrolled employees and gym utilization.</p></div><button onClick={() => window.print()} className="bg-white border border-slate-200 text-[#001f3f] px-6 py-3 rounded-xl font-bold text-sm shadow-sm flex items-center gap-2 hover:bg-slate-50 transition-all"><Printer size={16} /> Print Roster</button></div><div className="hidden print:block mb-6 border-b-4 border-[#001f3f] pb-6 text-center"><img src={LOGO_URL} alt="Logo" className="h-12 mx-auto mb-4 invert grayscale" /><h1 className="text-3xl font-black text-[#001f3f] tracking-tight">{activeCorp.companyName} Wellness Roster</h1><p className="text-slate-500 font-bold uppercase tracking-widest mt-2">{currentDateString}</p></div><div className="grid grid-cols-1 md:grid-cols-4 gap-6 print:grid-cols-4 print:gap-4"><ProStatCard value={corpMembers.length} label="Total Enrolled" color="#001f3f" /><ProStatCard value={totalCorpVisits} label="Total Visits" color="#1080ad" /><ProStatCard value={singlePlans} label="Individual Plans" color="#16a34a" /><ProStatCard value={familyPlans} label="Family Plans" color="#f59e0b" /></div><div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden print:border-slate-300 print:shadow-none print:rounded-none"><div className="p-6 border-b border-slate-100 bg-slate-50 print:bg-white print:p-4"><h3 className="text-lg font-bold text-[#001f3f]">Employee Directory</h3></div><table className="w-full text-left border-collapse print:text-sm"><thead className="bg-white text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 print:border-b-2 print:border-slate-800"><tr><th className="px-8 py-4 print:py-2">Employee Name</th><th className="px-8 py-4 print:py-2">Member ID</th><th className="px-8 py-4 print:py-2">Plan Type</th><th className="px-8 py-4 print:py-2 text-right">Lifetime Visits</th></tr></thead><tbody className="text-sm">{corpMembers.length === 0 ? (<tr><td colSpan="4" className="text-center py-12 text-slate-400 font-medium italic">No employees currently enrolled.</td></tr>) : (corpMembers.map(m => (<tr key={m.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors print:border-slate-200"><td className="px-8 py-5 print:py-2 font-bold text-slate-800">{m.firstName} {m.lastName}</td><td className="px-8 py-5 print:py-2 font-mono text-slate-400">{m.id}</td><td className="px-8 py-5 print:py-2"><span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 print:bg-transparent print:px-0 print:text-black text-[10px] font-black tracking-tight">{m.type}</span></td><td className="px-8 py-5 print:py-2 text-right font-black text-[#1080ad] print:text-black text-lg print:text-base">{m.visits}</td></tr>)))}</tbody></table></div></main></div>); }

  if (view === 'kiosk') { 
    const getAutoClass = () => {
      const now = new Date();
      const dayMap = {0:'Sun',1:'Mon',2:'Tue',3:'Wed',4:'Thu',5:'Fri',6:'Sat'};
      const todayName = dayMap[now.getDay()];
      const currentMins = now.getHours() * 60 + now.getMinutes();
      const schedule = [
        { name: 'Low-Impact Aerobics', center: 'anthony', days: 'Mon - Fri', time: '9:30 AM' },
        { name: 'Sit & Get Fit', center: 'anthony', days: 'Mon - Fri', time: '11:00 AM' },
        { name: 'Modified Sit & Get Fit', center: 'anthony', days: 'Mon, Wed, Fri', time: '2:00 PM' },
        { name: 'Low Impact Aerobics', center: 'harper', days: 'Mon, Wed, Fri', time: '10:00 AM' },
        { name: 'Chair Class', center: 'harper', days: 'Mon, Wed, Fri', time: '11:00 AM' }
      ];
      let bestClass = "Class Attendee (Kiosk)";
      let minDiff = 9999;
      schedule.forEach(c => {
        const isRightDay = c.days === 'Mon - Fri' ? (now.getDay() >= 1 && now.getDay() <= 5) : c.days.includes(todayName);
        if ((c.center === viewingCenter || viewingCenter === 'both') && isRightDay) {
          const [t, ampm] = c.time.split(' ');
          let [h, m] = t.split(':').map(Number);
          if (ampm === 'PM' && h !== 12) h += 12;
          if (ampm === 'AM' && h === 12) h = 0;
          const classMins = h * 60 + m;
          const diff = Math.abs(classMins - currentMins);
          if (currentMins >= classMins - 60 && currentMins <= classMins + 30) {
            if (diff < minDiff) { minDiff = diff; bestClass = `Class: ${c.name}`; }
          }
        }
      });
      return bestClass;
    };

    return (<div className="min-h-screen bg-[#f0f2f5] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden"><button onClick={() => {
        const pass = window.prompt("Enter Kiosk Admin PIN to exit:");
        if (pass === "2026") { setView('landing'); } else if (pass) { alert("Incorrect PIN"); }
      }} className="absolute top-6 left-6 text-slate-400 hover:text-red-600 flex items-center gap-2 font-bold z-10 bg-white/50 backdrop-blur-md px-4 py-2 rounded-xl shadow-sm border border-slate-200 transition-all">
        <Lock size={16}/> Staff Exit
      </button>

      <button onClick={() => {
        const pass = window.prompt("Enter Kiosk Admin PIN to switch facility location:");
        if (pass === "2026") { 
            const newCenter = viewingCenter === 'harper' ? 'anthony' : 'harper';
            setViewingCenter(newCenter); 
            localStorage.setItem('wellnessCenter', newCenter);
            alert(`Kiosk successfully locked to ${newCenter.toUpperCase()}.`);
        } else if (pass) { alert("Incorrect PIN"); }
      }} className="absolute top-6 right-6 text-slate-600 hover:text-[#001f3f] flex items-center gap-2 font-bold z-10 bg-white/50 backdrop-blur-md px-4 py-2 rounded-xl shadow-sm border border-slate-200 transition-all">
        <MapPin size={16} className={viewingCenter === 'harper' ? 'text-[#f59e0b]' : 'text-[#1080ad]'} /> 
        {viewingCenter === 'harper' ? '📍 Harper Center Kiosk' : '📍 Anthony Center Kiosk'}
      </button>{kioskMessage.text && (<div className="absolute inset-0 z-50 flex items-center justify-center bg-[#001f3f]/40 backdrop-blur-sm p-4"><div className={`bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md text-center border-t-8 ${kioskMessage.type === 'success' ? 'border-[#16a34a]' : kioskMessage.type === 'warning' ? 'border-[#eab308]' : 'border-red-600'}`}>{kioskMessage.type === 'success' ? (<CheckCircle size={72} className="text-[#16a34a] mx-auto mb-6" />) : (<AlertCircle size={72} className={`mx-auto mb-6 ${kioskMessage.type === 'warning' ? 'text-[#eab308]' : 'text-red-600'}`} />)}<h1 className="text-3xl font-black text-[#001f3f] tracking-tight mb-2">{kioskMessage.text}</h1>{kioskMessage.subtext && <p className="text-slate-500 font-medium text-lg">{kioskMessage.subtext}</p>}</div></div>)}{pinModal && (<div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#001f3f]/90 backdrop-blur-sm p-4"><div className="bg-white p-12 rounded-[3rem] text-center max-w-sm w-full relative shadow-2xl"><button onClick={() => {setPinModal(null); setPinInput('');}} className="absolute top-6 right-6 text-slate-300 hover:text-red-500"><X size={24}/></button><Lock size={48} className="text-[#1080ad] mx-auto mb-6" /><h3 className="text-3xl font-black text-[#001f3f] mb-2 tracking-tight">Security PIN</h3><p className="text-slate-500 font-medium mb-8">Enter your 4-digit security PIN</p><input type="password" maxLength={4} value={pinInput} onChange={e => setPinInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') document.getElementById('btn_submit_pin').click(); }} className="w-full p-6 text-center text-4xl tracking-[0.5em] border-2 rounded-2xl mb-8 outline-none focus:border-[#1080ad] bg-slate-50" autoFocus /><button id="btn_submit_pin" onClick={() => { if (pinModal.isVisitor) { if (pinInput === pinModal.pin) { fetch('/api/visitor-checkin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ visitorAirtableId: pinModal.airtableId, pin: pinInput, center: centerRef.current === 'both' ? pinModal.center : centerRef.current }) }).then(res => res.json()).then(result => { if (result.success) { setKioskMessage({ text: `Welcome, ${pinModal.firstName}!`, type: 'success', subtext: '' }); setVisitors(prev => prev.map(v => v.airtableId === pinModal.airtableId ? {...v, totalVisits: v.totalVisits + 1} : v)); } else if (result.error === 'pass_expired') { setKioskMessage({ text: 'Pass Expired', type: 'error', subtext: 'Please see the front desk.' }); } else { setKioskMessage({ text: 'Error', type: 'error', subtext: result.message || 'Please see front desk.' }); } setTimeout(() => setKioskMessage({ text: '', type: '', subtext: '' }), 3500); }).catch(() => { setKioskMessage({ text: 'Network Error', type: 'error', subtext: 'Please try again.' }); setTimeout(() => setKioskMessage({ text: '', type: '', subtext: '' }), 4000); }); setPinModal(null); setPinInput(''); } else { alert("Incorrect PIN."); } } else { if (!pinModal.password || pinInput === pinModal.password) { processCheckIn(pinModal.id, kioskMode === 'Class' ? getAutoClass() : "Kiosk Search & PIN"); setPinModal(null); setPinInput(''); } else { alert("Incorrect PIN."); } } }} className="w-full bg-[#1080ad] text-white p-5 rounded-2xl font-bold text-xl shadow-lg hover:bg-blue-800 transition-colors">Verify</button></div></div>)}<div className="bg-white rounded-[3rem] shadow-2xl p-12 w-full max-w-2xl border-t-8 border-[#1080ad] text-center relative z-0"><h2 className="text-5xl font-black text-[#001f3f] mb-4 tracking-tight">Check-In</h2><p className="text-slate-500 mb-8 text-lg font-medium">Type your last name to check in.</p>
      
      <div className="flex justify-center mb-8">
        <label className="flex items-center gap-4 bg-white border-2 border-slate-200 rounded-2xl px-8 py-5 cursor-pointer hover:border-[#1080ad] hover:bg-blue-50 transition-all shadow-sm group">
          <input 
            type="checkbox" 
            checked={kioskMode === 'Class'} 
            onChange={(e) => setKioskMode(e.target.checked ? 'Class' : 'Gym')} 
            className="w-7 h-7 rounded-md border-2 border-slate-300 text-[#1080ad] focus:ring-[#1080ad] cursor-pointer" 
          />
          <span className="font-bold text-slate-700 text-xl select-none group-hover:text-[#001f3f] transition-colors">I am attending a class today</span>
        </label>
      </div>

      <div className="relative w-full max-w-md mx-auto mb-10"><div className="flex gap-4"><input className="flex-1 p-6 border-2 rounded-2xl outline-none focus:border-[#1080ad] font-sans text-2xl text-center bg-slate-50" placeholder="e.g. Smith" value={kioskInput} onChange={(e) => setKioskInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { processCheckIn(kioskInput, kioskMode === 'Class' ? getAutoClass() : "Manual ID Entry"); setKioskInput(''); } }} /><button onClick={() => { processCheckIn(kioskInput, kioskMode === 'Class' ? getAutoClass() : "Manual ID Entry"); setKioskInput(''); }} className="bg-[#001f3f] text-white px-10 rounded-2xl font-bold text-xl hover:bg-blue-900 transition-colors shadow-lg">Go</button></div>{kioskMatches.length > 0 && (<div className="absolute bottom-[115%] left-0 w-full mb-2 bg-white border-2 border-[#1080ad] rounded-2xl shadow-2xl z-30 overflow-hidden text-left flex flex-col-reverse">{kioskMatches.map(m => (<button key={m._type + (m.airtableId || m.id)} onClick={() => { if (m._type === 'visitor') { setPinModal({...m, isVisitor: true}); } else { setPinModal(m); } setKioskInput(''); }} className="w-full p-5 border-b border-slate-100 hover:bg-blue-50 transition-colors flex justify-between items-center group"><div><p className="font-bold text-[#001f3f] text-xl">{m.firstName} {m.lastName}</p><p className="text-xs text-slate-400 font-mono tracking-widest">{m._type === 'visitor' ? <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-black text-[9px] uppercase tracking-widest">Visitor · {m.passType}</span> : m.id}</p></div><div className="bg-[#1080ad] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md group-hover:scale-105 transition-transform">Tap to Check In</div></button>))}</div>)}</div><img src={LOGO_URL} alt="Logo" className="h-10 mx-auto opacity-30 invert grayscale" /></div></div>); 
  }

  if (view === 'secret_scanner') { return (<div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 font-sans relative"><button onClick={() => {setView('landing'); setScannerActive(false);}} className="absolute top-6 left-6 text-white/50 hover:text-white flex items-center gap-2 font-bold z-10"><LogOut size={20}/> Exit Scanner</button>{kioskMessage.text && (<div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"><div className={`bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md text-center border-t-8 ${kioskMessage.type === 'success' ? 'border-[#16a34a]' : kioskMessage.type === 'warning' ? 'border-[#eab308]' : 'border-red-600'}`}>{kioskMessage.type === 'success' ? (<CheckCircle size={72} className="text-[#16a34a] mx-auto mb-6" />) : (<AlertCircle size={72} className={`mx-auto mb-6 ${kioskMessage.type === 'warning' ? 'text-[#eab308]' : 'text-red-600'}`} />)}<h1 className="text-3xl font-black text-[#001f3f] tracking-tight mb-2">{kioskMessage.text}</h1>{kioskMessage.subtext && <p className="text-slate-500 font-medium text-lg">{kioskMessage.subtext}</p>}</div></div>)}<div className="w-full max-w-lg mx-auto bg-slate-900 border-4 border-slate-800 rounded-3xl overflow-hidden min-h-[400px] flex flex-col items-center justify-center">{!scannerActive ? (<button onClick={() => setScannerActive(true)} className="bg-[#1080ad] text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2">Turn On Camera</button>) : (<div id="reader" className="w-full h-full"></div>)}</div></div>); }

  if (view === 'member_login') { return (<div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-4 font-sans"><div className="bg-white rounded-[3rem] shadow-2xl p-10 w-full max-w-md border-t-8 border-[#16a34a]"><div className="flex justify-center mb-6"><UserCircle size={64} className="text-[#16a34a]" /></div><h2 className="text-3xl font-black text-center text-[#001f3f] mb-2 tracking-tight">Member Access</h2><p className="text-slate-500 mb-8 text-center font-medium">Log in to view your digital badge and history.</p><div className="space-y-4"><div><label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-2">Email Address</label><input type="email" placeholder="you@email.com" id="m_email" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#16a34a] text-lg transition-colors" /></div><div><label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-2">4-Digit PIN</label><input type="password" maxLength={4} placeholder="Enter PIN" id="m_pin" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#16a34a] text-xl text-center tracking-[0.5em] transition-colors" onKeyDown={(e) => { if (e.key === 'Enter') document.getElementById('btn_member_login').click(); }}/></div></div><button id="btn_member_login" onClick={() => { const email = document.getElementById('m_email').value.toLowerCase().trim(); const pin = document.getElementById('m_pin').value.trim(); const foundMember = members.find(m => m.email.toLowerCase() === email && m.password === pin); if(foundMember) { setActiveMember(foundMember); setView('member_portal'); } else { alert('Incorrect Email or PIN. Contact the front desk if you need a PIN reset.'); } }} className="w-full bg-[#16a34a] text-white p-5 rounded-2xl font-bold text-lg shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all mt-8">Access My Account</button><button onClick={() => setView('landing')} className="w-full mt-6 text-slate-400 font-bold hover:text-slate-600 transition-colors">Return to Home</button></div></div>); }

  if (view === 'member_portal' && activeMember) { const myHistoricalVisits = visits.filter(v => v.name.toLowerCase() === (activeMember.firstName + ' ' + activeMember.lastName).toLowerCase()).slice(0, 10); return (<div className="min-h-screen bg-[#f0f2f5] font-sans pb-20 md:pb-0"><nav className="bg-[#001f3f] text-white p-4 shadow-md flex justify-between items-center sticky top-0 z-10"><div className="flex items-center gap-3"><img src={LOGO_URL} alt="Logo" className="h-6" /><span className="font-bold tracking-tight border-l border-white/20 pl-3">Wellness Portal</span></div><button onClick={() => { setActiveMember(null); setView('landing'); }} className="bg-red-500/20 text-red-100 hover:bg-red-50 hover:text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold transition-all"><LogOut size={16}/> Logout</button></nav><main className="max-w-md mx-auto p-4 space-y-6 mt-6"><div><h1 className="text-3xl font-black text-[#001f3f] tracking-tight mb-1">Hi, {activeMember.firstName}!</h1><p className="text-slate-500 font-medium">Welcome to your digital access portal.</p></div><div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8 flex flex-col items-center justify-center relative overflow-hidden"><div className="absolute top-0 left-0 w-full h-2 bg-[#1080ad]"></div><h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Scan to Check-In</h2><div className="bg-white p-4 rounded-2xl shadow-inner border border-slate-100 mb-6 flex items-center justify-center"><QRCode data={activeMember.id} size={220} /></div><p className="text-2xl font-black text-[#001f3f] tracking-widest">{activeMember.id}</p><span className={`mt-4 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${getStoplight(activeMember) === 'green' ? 'bg-green-100 text-green-700' : getStoplight(activeMember) === 'yellow' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{getStoplight(activeMember) === 'green' ? 'ACTIVE MEMBER' : getStoplight(activeMember) === 'yellow' ? 'PAYMENT DUE' : 'ACCOUNT LOCKED'}</span></div><div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6"><h3 className="font-bold text-[#001f3f] mb-4 flex items-center gap-2"><Activity size={18} className="text-[#f59e0b]"/> Lifetime Visits</h3><div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4"><span className="text-sm font-bold text-slate-500">Total Check-ins</span><span className="text-3xl font-black text-[#1080ad]">{activeMember.visits}</span></div><h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-6 mb-3">Recent Activity</h4>{myHistoricalVisits.length > 0 ? (<div className="space-y-2">{myHistoricalVisits.map((v, i) => (<div key={i} className="flex justify-between items-center bg-blue-50 p-3 rounded-xl border border-blue-100"><span className="text-sm font-bold text-slate-700 flex items-center gap-2"><CheckCircle size={14} className="text-[#1080ad]"/> {v.center}</span><span className="text-xs font-bold text-slate-500">{new Date(v.time).toLocaleDateString()}</span></div>))}</div>) : (<div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center"><p className="text-xs font-bold text-slate-400">Head to the gym to log your next workout!</p></div>)}</div>{familyMembers.length > 0 && (<div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6"><h3 className="font-bold text-[#001f3f] mb-4 flex items-center gap-2"><Users size={18} className="text-[#16a34a]"/> Linked Family Accounts</h3><div className="space-y-3">{familyMembers.map(fm => (<button key={fm.id} onClick={() => setActiveMember(fm)} className="w-full flex items-center justify-between bg-slate-50 p-4 rounded-2xl hover:bg-slate-100 transition-colors border border-slate-100"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-[#1080ad] text-white flex items-center justify-center font-bold text-xs">{fm.firstName.charAt(0)}</div><div className="text-left"><p className="font-bold text-slate-800 text-sm leading-tight">{fm.firstName} {fm.lastName}</p><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{fm.id}</p></div></div><ChevronRight size={16} className="text-slate-400" /></button>))}</div></div>)}<div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6"><h3 className="font-bold text-[#001f3f] mb-4 flex items-center gap-2"><CreditCard size={18} className="text-[#1080ad]"/> Account Info</h3><div className="space-y-4"><div className="flex justify-between items-center border-b border-slate-50 pb-4"><span className="text-sm font-bold text-slate-400 uppercase tracking-tight">Plan Type</span><span className="font-bold text-slate-800">{activeMember.type}</span></div><div className="flex justify-between items-center border-b border-slate-50 pb-4"><span className="text-sm font-bold text-slate-400 uppercase tracking-tight">Home Center</span><span className="font-bold text-slate-800">{activeMember.center}</span></div>{activeMember.access247 && (<div className="flex justify-between items-center border-b border-slate-50 pb-4"><span className="text-sm font-bold text-slate-400 uppercase tracking-tight">24/7 Access</span><span className="font-bold text-[#f59e0b]">Active — Badge #{activeMember.badgeNumber || 'N/A'}</span></div>)}<div className="flex justify-between items-center pb-2"><span className="text-sm font-bold text-slate-400 uppercase tracking-tight">Next Payment</span><span className={`font-bold ${getStoplight(activeMember) !== 'green' ? 'text-red-500' : 'text-slate-800'}`}>{activeMember.nextPayment || 'N/A'}</span></div></div></div><div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6"><div className="flex justify-between items-center mb-4"><h3 className="font-bold text-[#001f3f] flex items-center gap-2"><UserCircle size={18} className="text-[#f59e0b]"/> Contact Info</h3><button onClick={() => setEditMode(!editMode)} className="text-xs font-bold text-[#1080ad] bg-blue-50 px-3 py-1 rounded-lg">{editMode ? 'Cancel' : 'Edit'}</button></div>{!editMode ? (<div className="space-y-4"><div className="flex justify-between items-center border-b border-slate-50 pb-4"><span className="text-sm font-bold text-slate-400 uppercase tracking-tight">Email</span><span className="font-bold text-slate-800 truncate pl-4">{activeMember.email || 'N/A'}</span></div><div className="flex justify-between items-center pb-2"><span className="text-sm font-bold text-slate-400 uppercase tracking-tight">Phone</span><span className="font-bold text-slate-800">{activeMember.phone || 'N/A'}</span></div></div>) : (<div className="space-y-4"><div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Email</label><input id="edit_email" defaultValue={activeMember.email} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#1080ad]" /></div><div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Phone</label><input id="edit_phone" defaultValue={activeMember.phone} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#1080ad]" /></div><button onClick={handleUpdateProfile} disabled={isUpdating} className="w-full bg-[#001f3f] text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-900 transition-colors flex justify-center">{isUpdating ? 'Saving...' : 'Save Changes'}</button></div>)}</div></main></div>); }

  const PeriodSelector = ({ value, onChange }) => (
    <select value={value} onChange={onChange} className="p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] font-bold text-slate-700 cursor-pointer shadow-sm">
      <optgroup label="Monthly">
        {['01-2026','02-2026','03-2026','04-2026','05-2026','06-2026','07-2026','08-2026','09-2026','10-2026','11-2026','12-2026'].map(v => { const [m, y] = v.split('-'); return <option key={v} value={v}>{new Date(y, m - 1).toLocaleDateString('en-US', {month: 'long', year: 'numeric'})}</option>; })}
      </optgroup>
      <optgroup label="Quarterly">
        <option value="Q1-2026">Q1 2026 (Jan - Mar)</option>
        <option value="Q2-2026">Q2 2026 (Apr - Jun)</option>
        <option value="Q3-2026">Q3 2026 (Jul - Sep)</option>
        <option value="Q4-2026">Q4 2026 (Oct - Dec)</option>
      </optgroup>
    </select>
  );
  // MAIN DIRECTOR DASHBOARD
  return (
    <div className="flex min-h-screen bg-[#f0f2f5] font-sans text-slate-800">
      <aside className="w-64 bg-[#001f3f] text-white flex flex-col min-h-screen relative z-10 print:hidden">
        <div className="p-8 border-b border-white/10 flex justify-center"><img src={LOGO_URL} alt="Logo" className="h-10 opacity-90 drop-shadow-md" /></div>
        <div className="p-6"><div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-lg bg-[#f59e0b] flex items-center justify-center font-bold text-lg text-[#001f3f]">{user?.name.charAt(0)}</div><div><p className="text-sm font-bold leading-none">{user?.name}</p><p className="text-[11px] text-white/50">@{user?.username}</p></div></div><button onClick={handleLogout} className="flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors"><LogOut size={14} /> Sign Out</button></div>
        <div className="px-4 mb-8"><p className="px-2 text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">Viewing</p><div className="space-y-1">{[{k:'both',c:'#ffffff'},{k:'harper',c:'#f59e0b'},{k:'anthony',c:'#1080ad'}].map(item => (<button key={item.k} onClick={() => { setViewingCenter(item.k); localStorage.setItem('wellnessCenter', item.k); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${viewingCenter === item.k ? 'bg-white/20 font-bold' : 'text-white/60 hover:bg-white/5'}`}><span className="w-1.5 h-6 rounded-full" style={{ backgroundColor: item.c }} />{item.k === 'both' ? 'Both Centers' : `${item.k.charAt(0).toUpperCase() + item.k.slice(1)}`}</button>))}</div></div>
        <nav className="flex-1 px-4 space-y-1">{[{id:'dashboard',label:'Dashboard',icon:<LayoutDashboard size={18}/>},{id:'members',label:'Members',icon:<Users size={18}/>},{id:'classes',label:'Classes',icon:<Calendar size={18}/>},{id:'badge',label:'Staff Check-In',icon:<QrCode size={18}/>},{id:'notif',label:'Notifications',icon:<Bell size={18}/>},{id:'visitors',label:'Visitors',icon:<Eye size={18}/>},{id:'corporate',label:'Corporate',icon:<Briefcase size={18}/>},{id:'reports',label:'Reports',icon:<FileText size={18}/>},{id:'help',label:'Help & Training',icon:<HelpCircle size={18}/>}].map(item => (<button key={item.id} onClick={() => { setActiveTab(item.id); setKioskInput(''); }} className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all ${activeTab === item.id ? 'bg-[#1080ad] text-white font-bold' : 'text-white/60 hover:bg-white/5'}`}>{item.icon} {item.label}{item.id === 'notif' && stats.overdue > 0 && <span className="ml-auto w-5 h-5 rounded-full bg-red-500 text-[10px] flex items-center justify-center font-bold tracking-tight">{stats.overdue}</span>}</button>))}</nav>
      </aside>

      <main className="flex-1 p-10 h-screen overflow-y-auto relative print:m-0 print:p-0 print:h-auto print:overflow-visible">
        <div className="mb-10 print:hidden"><h2 className="text-3xl font-bold text-[#001f3f] capitalize tracking-tight">{activeTab === 'notif' ? 'Notifications' : activeTab === 'help' ? '' : activeTab}</h2>{activeTab !== 'help' && <p className="text-sm text-slate-400 font-medium">{viewingCenter === 'both' ? 'All Centers' : viewingCenter.charAt(0).toUpperCase() + viewingCenter.slice(1) + ' Center'} · {currentDateString}</p>}</div>

        {activeTab === 'dashboard' && (() => {
          const today = new Date(); const todayStr = today.toDateString(); const weekFromNow = new Date(today.getTime() + 7*24*60*60*1000);
          const dueTodayMembers = scopedMembers.filter(m => m.nextPayment && new Date(m.nextPayment).toDateString() === todayStr);
          const overdueMembers = scopedMembers.filter(m => m.status === 'OVERDUE');
          const orientationMembers = scopedMembers.filter(m => m.needsOrientation);
          const expiringThisWeek = scopedMembers.filter(m => { if (!m.nextPayment || m.status === 'OVERDUE') return false; const d = new Date(m.nextPayment); return d > today && d <= weekFromNow; });
          const briefingItems = [...overdueMembers.map(m => ({name:`${m.firstName} ${m.lastName}`,detail:`Overdue since ${m.nextPayment}`,type:'overdue',id:m.id})),...dueTodayMembers.map(m => ({name:`${m.firstName} ${m.lastName}`,detail:'Payment due today',type:'due',id:m.id})),...orientationMembers.map(m => ({name:`${m.firstName} ${m.lastName}`,detail:'Needs facility orientation',type:'orientation',id:m.id})),...expiringThisWeek.map(m => ({name:`${m.firstName} ${m.lastName}`,detail:`Expires ${m.nextPayment}`,type:'expiring',id:m.id}))];
          const quickResults = quickSearch.length >= 2 ? scopedMembers.filter(m => `${m.firstName} ${m.lastName} ${m.id} ${m.email}`.toLowerCase().includes(quickSearch.toLowerCase())).slice(0,5) : [];
          const exportTodaysLog = () => { const tv = filteredVisits.filter(v => new Date(v.time).toDateString() === todayStr); if (tv.length === 0) { alert('No check-ins today yet.'); return; } const csv = ["Name,Center,Time,Type,Check-In Method",...tv.map(v => `"${v.name}","${v.center}","${new Date(v.time).toLocaleTimeString()}","${v.type}","${v.method || 'General Workout'}"`)].join('\n'); const b = new Blob([csv],{type:'text/csv'}); const u = window.URL.createObjectURL(b); const a = document.createElement('a'); a.href=u; a.download=`Check_Ins_${new Date().toISOString().slice(0,10)}.csv`; a.click(); window.URL.revokeObjectURL(u); };          
          const greeting = today.getHours() < 12 ? 'Good morning' : today.getHours() < 17 ? 'Good afternoon' : 'Good evening';
          
          const ninetyMinsAgo = new Date(Date.now() - 90 * 60 * 1000);
          const currentOccupancy = filteredVisits.filter(v => new Date(v.time) > ninetyMinsAgo).length;
          let occStatus = 'Quiet'; 
          let occColor = '#16a34a';
          if (currentOccupancy > 15 && currentOccupancy <= 35) { occStatus = 'Steady'; occColor = '#f59e0b'; }
          else if (currentOccupancy > 35) { occStatus = 'Busy'; occColor = '#ef4444'; }

          return (
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-[#001f3f] to-[#003d6b] rounded-3xl p-8 text-white relative overflow-hidden"><div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div><div className="relative z-10"><div className="flex justify-between items-start mb-6"><div><h2 className="text-2xl font-black tracking-tight">{greeting}, {user?.name?.split(' ')[0] || 'Director'}.</h2><p className="text-white/60 text-sm font-medium mt-1">{currentDateString} · {viewingCenter === 'both' ? 'All Centers' : viewingCenter.charAt(0).toUpperCase() + viewingCenter.slice(1) + ' Center'}</p></div><div className="flex flex-col items-end gap-2"><div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl"><Activity size={16} className="text-[#dba51f]" /><span className="text-sm font-bold">{stats.today} check-in{stats.today !== 1 ? 's' : ''} today</span></div><div className="flex items-center gap-3 bg-black/30 px-4 py-2 rounded-xl border border-white/10 shadow-inner"><span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: occColor }}></span><span className="relative inline-flex rounded-full h-3 w-3" style={{ backgroundColor: occColor }}></span></span><span className="text-xs font-bold text-white/80 uppercase tracking-widest">Est. Occupancy: <span style={{ color: occColor, fontSize: '14px', marginLeft: '4px' }}>{currentOccupancy} ({occStatus})</span></span></div></div></div>{briefingItems.length === 0 ? (<div className="bg-white/10 rounded-2xl p-6 text-center"><CheckCircle size={32} className="mx-auto mb-2 text-green-400" /><p className="font-bold text-lg">All clear!</p><p className="text-white/50 text-sm">No members need attention right now.</p></div>) : (<div><p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Needs Your Attention ({briefingItems.length})</p><div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[200px] overflow-y-auto pr-2">{briefingItems.slice(0,8).map((item,i) => (<button key={i} onClick={() => { const f = scopedMembers.find(m => m.id === item.id); if (f) setSelectedMember(f); }} className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-xl p-3 text-left transition-all group"><div className={`w-2 h-8 rounded-full flex-shrink-0 ${item.type==='overdue'?'bg-red-500':item.type==='due'?'bg-[#dd6d22]':item.type==='orientation'?'bg-[#1080ad]':'bg-[#dba51f]'}`}></div><div className="flex-1 min-w-0"><p className="font-bold text-sm truncate">{item.name}</p><p className="text-[11px] text-white/50">{item.detail}</p></div><ChevronRight size={14} className="text-white/30 group-hover:text-white/60 flex-shrink-0" /></button>))}</div>{briefingItems.length > 8 && <p className="text-xs text-white/40 mt-3 text-center">+ {briefingItems.length-8} more</p>}</div>)}</div></div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative"><h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Search size={14}/> Quick Member Lookup</h3><div className="relative"><input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] text-sm" placeholder="Type a name, ID, or email..." value={quickSearch} onChange={e => setQuickSearch(e.target.value)} />{quickResults.length > 0 && (<div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden">{quickResults.map(m => (<button key={m.id} onClick={() => { setSelectedMember(m); setQuickSearch(''); }} className="w-full p-4 border-b border-slate-50 last:border-0 hover:bg-blue-50 transition-colors flex justify-between items-center text-left"><div><p className="font-bold text-[#001f3f]">{m.firstName} {m.lastName}</p><p className="text-[10px] text-slate-400">{m.id} · {m.type}</p></div><span className={`px-2 py-1 rounded-full text-[9px] font-black ${getStoplight(m)==='green'?'bg-green-100 text-green-600':getStoplight(m)==='yellow'?'bg-yellow-100 text-yellow-600':'bg-red-100 text-red-600'}`}>{getStoplight(m)==='green'?'ACTIVE':getStoplight(m)==='yellow'?'GRACE':'LOCKED'}</span></button>))}</div>)}</div></div><div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between"><h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><FileText size={14}/> Quick Export</h3><div className="space-y-3"><button onClick={exportTodaysLog} className="w-full bg-[#1080ad] text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"><Download size={16}/> Export Today's Check-in Log</button><button onClick={handleExportCSV} className="w-full bg-slate-100 text-[#001f3f] py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"><Download size={16}/> Export Full Member List</button></div></div></div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ProListCard title="Today's Check-ins">
                  {(() => {
                    const todayStr = new Date().toDateString();
                    const todayVisits = filteredVisits.filter(v => new Date(v.time).toDateString() === todayStr);

                    const todayByPlan = todayVisits.reduce((acc, v) => {
                      acc[v.type] = (acc[v.type] || 0) + 1;
                      return acc;
                    }, {});

                    const displayedVisits = showAllCheckins ? todayVisits : todayVisits.slice(0, 5);

                    return (
                      <div className="space-y-6">
                        {Object.keys(todayByPlan).length > 0 && (
                          <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-100">
                            {Object.entries(todayByPlan).sort((a,b) => b[1] - a[1]).map(([plan, count]) => (
                              <div key={plan} className="bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">{plan}</span>
                                <span className="text-sm font-black text-[#001f3f]">{count}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="space-y-4">
                          {todayVisits.length === 0 ? (
                            <p className="text-slate-400 italic text-sm">Waiting for activity...</p>
                          ) : (
                            displayedVisits.map((v, i) => (
                              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div>
                                  <p className="font-bold text-slate-800">{v.name}</p>
                                  <p className="text-[11px] font-bold text-[#f59e0b] uppercase">
                                    {v.center?.toLowerCase() === 'harper' ? 'Harper Wellness Center' : v.center?.toLowerCase() === 'anthony' ? 'Anthony Wellness Center' : v.center} • {v.type}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                                  <Clock size={14}/> {new Date(v.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        {todayVisits.length > 5 && (
                          <button
                            onClick={() => setShowAllCheckins(!showAllCheckins)}
                            className="w-full py-2 mt-2 text-sm font-bold text-[#1080ad] hover:text-[#001f3f] transition-colors bg-blue-50/50 rounded-lg border border-blue-100 hover:bg-blue-50"
                          >
                            {showAllCheckins ? 'Collapse List ↑' : `See All ${todayVisits.length} Check-ins →`}
                          </button>
                        )}
                      </div>
                    );
                  })()}
                </ProListCard>

                <ProListCard title="Account Health">
                  <div className="py-4">
                    <DonutChart data={statusChartData} totalLabel="Accounts" />
                  </div>
                </ProListCard>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ProListCard title="Membership Breakdown">
                  <div className="py-4">
                    <DonutChart data={planChartData} totalLabel="Members" />
                  </div>
                </ProListCard>
                <ProListCard title="Peak Hours Heatmap">
                  <div className="flex items-end justify-between h-48 mt-8 gap-2">
                    {heatmapData.map((count,i) => { 
                      const hp = count===0?5:(count/maxVisits)*100; 
                      const hl = (i+6)>12?`${(i+6)-12}P`:`${i+6}A`; 
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                          <div className="w-full bg-blue-100 rounded-t-md relative flex items-end justify-center group-hover:bg-blue-200 transition-colors" style={{height:'100%'}}>
                            <div className="w-full bg-[#1080ad] rounded-t-md transition-all duration-500 relative" style={{height:`${hp}%`}}>
                              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-[#001f3f] opacity-0 group-hover:opacity-100 transition-opacity">{count}</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400">{hl}</span>
                        </div>
                      );
                    })}
                  </div>
                </ProListCard>
              </div>

            </div>
          );
        })()}

        {activeTab === 'members' && (<div className="space-y-6"><div className="flex justify-between items-center mb-8"><div><h2 className="text-3xl font-bold text-[#001f3f] tracking-tight">Members</h2></div><div className="flex gap-3"><button onClick={handleExportCSV} className="bg-white border border-slate-200 text-[#001f3f] px-6 py-2 rounded-xl font-bold text-sm shadow-sm flex items-center gap-2 hover:bg-slate-50 transition-all"><Download size={16}/> Export CSV</button><button onClick={() => { setShowAddModal(true); setNewMemberPin(null); setFamilyFlow(null); setSelectedSponsor(''); setCustomSponsor(''); }} className="bg-[#001f3f] text-white px-6 py-2 rounded-xl font-bold text-sm shadow-xl shadow-blue-900/10 flex items-center gap-2 hover:bg-blue-900 transition-colors"><Plus size={16}/> Add Member</button></div></div><div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex gap-4 items-center"><div className="relative flex-1"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} /><input className="pl-12 pr-4 py-2 border rounded-xl text-sm w-full outline-none" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div></div>{loading ? (<div className="text-center py-20 text-slate-300 font-medium italic">Syncing Airtable...</div>) : apiError ? (<div className="bg-red-50 border-2 border-red-200 text-red-700 p-10 rounded-2xl text-center shadow-sm"><AlertCircle size={48} className="mx-auto mb-4 text-red-500" /><h3 className="text-2xl font-black mb-2">Airtable Refused Connection</h3><p className="font-mono text-sm bg-white p-4 rounded-lg border border-red-100 max-w-2xl mx-auto">{apiError}</p></div>) : (<div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-visible pb-24"><table className="w-full text-left border-collapse"><thead className="bg-slate-50 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b"><tr><th className="px-6 py-4 w-56">Member</th><th className="px-4 py-4">ID</th><th className="px-4 py-4 w-36">Type</th><th className="px-4 py-4 w-28">Status</th><th className="px-4 py-4 w-28">Payment</th><th className="px-4 py-4 w-24">Info</th></tr></thead><tbody className="text-sm">{filteredMembers.map(m => { const light = getStoplight(m); return (<tr key={m.id} className="border-b hover:bg-slate-50/80 cursor-pointer" onClick={() => setSelectedMember(m)}><td className="px-6 py-4"><p className="font-bold text-slate-800">{m.firstName} {m.lastName}</p><p className="text-[11px] text-slate-400">{m.email}{m.needsOrientation && <span className="ml-2 px-2 py-0.5 rounded text-[9px] font-black bg-blue-100 text-blue-700 uppercase">Orientation</span>}{m.familyName && <span className="ml-2 px-2 py-0.5 rounded text-[9px] font-black bg-purple-100 text-purple-700 uppercase">{m.familyName}</span>}{m.sponsorName && <span className="ml-2 px-2 py-0.5 rounded text-[9px] font-black bg-orange-100 text-orange-700 uppercase">{m.sponsorName}</span>}{m.access247 && <span className="ml-2 px-2 py-0.5 rounded text-[9px] font-black bg-amber-100 text-amber-700 uppercase">24/7</span>}</p>{m.notes && (<p className="mt-1.5 text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md truncate max-w-[220px]" title={m.notes}><strong>Note:</strong> {m.notes}</p>)}</td><td className="px-4 py-4 font-mono text-slate-400 text-xs">{m.id}</td><td className="px-4 py-4"><span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black tracking-tight">{m.type}</span></td><td className="px-4 py-4"><span className={`px-3 py-1 rounded-full text-[10px] font-black ${light==='green'?'bg-green-100 text-green-600':light==='yellow'?'bg-yellow-100 text-yellow-600':'bg-red-100 text-red-600'}`}>{light==='green'?'ACTIVE':light==='yellow'?'GRACE':'LOCKED'}</span></td><td className="px-4 py-4 text-slate-600 text-xs">{m.nextPayment||'N/A'}</td><td className="px-4 py-4"><button className="p-2 bg-[#1080ad] text-white rounded-lg shadow-md"><QrCode size={16}/></button></td></tr>);})}</tbody></table></div>)}</div>)}

        {activeTab === 'classes' && (() => {
          const allClasses = [
            { name: 'Low-Impact Aerobics', center: 'anthony', days: 'Mon - Fri', time: '9:30 AM', capacity: 25, color: 'border-[#1080ad]' },
            { name: 'Sit & Get Fit', center: 'anthony', days: 'Mon - Fri', time: '11:00 AM', capacity: 20, color: 'border-[#1080ad]' },
            { name: 'Modified Sit & Get Fit', center: 'anthony', days: 'Mon, Wed, Fri', time: '2:00 PM', capacity: 20, color: 'border-[#1080ad]' },
            { name: 'Low Impact Aerobics', center: 'harper', days: 'Mon, Wed, Fri', time: '10:00 AM', capacity: 25, color: 'border-[#f59e0b]' },
            { name: 'Chair Class', center: 'harper', days: 'Mon, Wed, Fri', time: '11:00 AM', capacity: 20, color: 'border-[#f59e0b]' }
          ];

          const todayIdx = new Date().getDay();
          const dayMap = {0:'Sun',1:'Mon',2:'Tue',3:'Wed',4:'Thu',5:'Fri',6:'Sat'};
          const todayName = dayMap[todayIdx];
          
          const displayedClasses = allClasses.filter(c => {
            const isRightCenter = viewingCenter === 'both' || c.center === viewingCenter;
            const isRightDay = c.days === 'Mon - Fri' ? (todayIdx >= 1 && todayIdx <= 5) : c.days.includes(todayName);
            return isRightCenter && isRightDay;
          });

          const todayStr = new Date().toDateString();

          return (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-[#001f3f] tracking-tight">Class Attendance</h2>
                  <p className="text-slate-400 font-medium">Select a class to log attendee check-ins.</p>
                </div>
                <div className="bg-white px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 shadow-sm">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long' })} Schedule
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {displayedClasses.map((c, i) => {
                  const classVisits = filteredVisits.filter(v => new Date(v.time).toDateString() === todayStr && v.method === `Class: ${c.name}`);
                  
                  return (
                    <div key={i} className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-t-4 ${c.color} flex flex-col justify-between`}>
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-black text-[#001f3f] text-lg leading-tight">{c.name}</h3>
                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{c.center === 'anthony' ? 'Anthony Center' : 'Harper Center'}</p>
                            <p className="text-sm font-medium text-slate-500 mt-1">{c.days}</p>
                          </div>
                          <span className="bg-slate-50 text-slate-600 px-3 py-1 rounded-lg text-xs font-black whitespace-nowrap">{c.time}</span>
                        </div>
                        
                        {classVisits.length > 0 && (
                          <div className="mt-4 bg-slate-50 rounded-xl p-3 border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Current Roster</p>
                            <div className="flex flex-wrap gap-1.5">
                              {classVisits.slice(0, 6).map((v, idx) => (
                                <span key={idx} className="bg-white border border-slate-200 text-slate-700 text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
                                  {v.name.split(' ')[0]} {v.name.split(' ')[1] ? v.name.split(' ')[1].charAt(0) + '.' : ''}
                                </span>
                              ))}
                              {classVisits.length > 6 && (
                                <span className="bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
                                  +{classVisits.length - 6} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-end mt-6">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Check-ins</p>
                          <p className="text-3xl font-black text-[#1080ad] leading-none">{classVisits.length} <span className="text-sm text-slate-400 font-bold">/ {c.capacity}</span></p>
                        </div>
                        <button onClick={() => setActiveClass(c)} className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-5 py-3 rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center justify-center gap-2">
                          <Users size={16} /> Manage Roster
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {activeClass && (() => {
                const classVisits = filteredVisits.filter(v => new Date(v.time).toDateString() === todayStr && v.method === `Class: ${activeClass.name}`);

                return (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001f3f]/90 backdrop-blur-md">
                    <div className="bg-white rounded-3xl w-full max-w-4xl p-10 relative shadow-2xl flex flex-col md:flex-row gap-8">
                      <button onClick={() => { setActiveClass(null); setKioskInput(''); }} className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-all z-10"><X size={24}/></button>
                      
                      <div className="flex-1 relative">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 inline-block">Live Class Scanner</span>
                        <h2 className="text-4xl font-black text-[#001f3f] leading-tight mb-2">{activeClass.name}</h2>
                        <p className="text-slate-500 font-medium mb-12 flex items-center gap-2"><Clock size={16}/> {activeClass.time} • {activeClass.center === 'anthony' ? 'Anthony Wellness Center' : 'Harper Wellness Center'}</p>
                        
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Scan Badge or Type Name</label>
                        <div className="flex gap-3">
                          <input 
                            autoFocus
                            className="flex-1 p-5 border-2 border-slate-200 rounded-2xl outline-none focus:border-[#1080ad] text-2xl bg-slate-50" 
                            placeholder="e.g. Smith" 
                            value={kioskInput} 
                            onChange={(e) => setKioskInput(e.target.value)} 
                            onKeyDown={(e) => { 
                              if (e.key === 'Enter') { 
                                processCheckIn(kioskInput, `Class: ${activeClass.name}`); 
                                setKioskInput(''); 
                              } 
                            }} 
                          />
                          <button 
                            onClick={() => { processCheckIn(kioskInput, `Class: ${activeClass.name}`); setKioskInput(''); }} 
                            className="bg-[#001f3f] text-white px-8 rounded-2xl font-bold text-xl hover:bg-blue-900 transition-colors shadow-lg"
                          >
                            Check In
                          </button>
                        </div>

                        {kioskMatches.length > 0 && (
                          <div className="absolute top-[80%] left-0 right-0 mt-2 bg-white border-2 border-[#1080ad] rounded-2xl shadow-2xl z-50 overflow-hidden text-left">
                            {kioskMatches.map(m => (
                              <button key={m._type + (m.airtableId || m.id)} onClick={() => { processCheckIn(m.id, `Class: ${activeClass.name}`); setKioskInput(''); }} className="w-full p-4 border-b border-slate-100 hover:bg-blue-50 transition-colors flex justify-between items-center group">
                                <div><p className="font-bold text-[#001f3f] text-lg">{m.firstName} {m.lastName}</p></div>
                                <div className="bg-[#1080ad] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md group-hover:scale-105 transition-transform">Check In</div>
                              </button>
                            ))}
                          </div>
                        )}

                        {kioskMessage.text && (
                          <div className={`mt-6 p-4 rounded-xl text-center font-bold text-lg ${kioskMessage.type==='success'?'bg-green-100 text-green-700':kioskMessage.type==='warning'?'bg-yellow-100 text-yellow-700':'bg-red-100 text-red-700'}`}>
                            {kioskMessage.text}
                            {kioskMessage.subtext && <p className="text-sm mt-1">{kioskMessage.subtext}</p>}
                          </div>
                        )}
                      </div>

                      <div className="w-full md:w-80 bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col h-[400px]">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Activity size={14}/> Live Roster</h3>
                          <span className="bg-[#1080ad] text-white px-2 py-1 rounded font-bold text-xs">{classVisits.length}</span>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                          {classVisits.length === 0 ? (
                              <p className="text-slate-400 italic text-sm text-center mt-10">Waiting for class check-ins...</p>
                          ) : (
                              classVisits.map((v, i) => (
                              <div key={i} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm transition-all duration-300">
                                  <p className="font-bold text-slate-800 text-sm">{v.name}</p>
                                  <p className="text-[10px] font-bold text-[#f59e0b] uppercase mt-1">
                                  {new Date(v.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • Checked In
                                  </p>
                              </div>
                              ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          );
        })()}

        {activeTab === 'visitors' && (<div className="space-y-6">
          <div className="flex justify-between items-center mb-8">
            <div><h2 className="text-3xl font-bold text-[#001f3f] tracking-tight">Visitors</h2><p className="text-slate-400 font-medium">Day passes, courtesy passes & referrals</p></div>
            <button onClick={() => setShowAddVisitorModal(true)} className="bg-[#001f3f] text-white px-6 py-2 rounded-xl font-bold text-sm shadow-xl shadow-blue-900/10 flex items-center gap-2 hover:bg-blue-900 transition-colors"><Plus size={16}/> Add Visitor</button>
          </div>
          <div className="grid grid-cols-4 gap-6">
            <ProStatCard value={visitors.filter(v => { const exp = new Date(v.expirationDate + 'T23:59:59'); return exp >= new Date(); }).length} label="Active Passes" color="#16a34a" />
            <ProStatCard value={visitors.filter(v => { const exp = new Date(v.expirationDate + 'T23:59:59'); return exp < new Date(); }).length} label="Expired" color="#dc2626" />
            <ProStatCard value={visitors.filter(v => v.passType === 'Day Pass').length} label="Day Passes" color="#1080ad" />
            <ProStatCard value={visitors.filter(v => v.passType !== 'Day Pass').length} label="Courtesy Passes" color="#8b5cf6" />
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-visible pb-24">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b"><tr><th className="px-6 py-4">Visitor</th><th className="px-4 py-4">Pass Type</th><th className="px-4 py-4">Referring Provider</th><th className="px-4 py-4">Expires</th><th className="px-4 py-4">Status</th><th className="px-4 py-4">Visits</th><th className="px-4 py-4">Actions</th></tr></thead>
              <tbody className="text-sm">{visitors.length === 0 ? (<tr><td colSpan="7" className="text-center py-12 text-slate-400 font-medium italic">No visitors yet.</td></tr>) : visitors.map(v => { const expired = new Date(v.expirationDate + 'T23:59:59') < new Date(); return (<tr key={v.airtableId} className="border-b hover:bg-slate-50/80"><td className="px-6 py-4"><p className="font-bold text-slate-800 cursor-pointer hover:text-[#1080ad]" onClick={() => setSelectedVisitor(v)}>{v.firstName} {v.lastName}</p><p className="text-[11px] text-slate-400">{v.email || v.phone || 'No contact info'}{!v.orientationComplete && <span className="ml-2 px-2 py-0.5 rounded text-[9px] font-black bg-blue-100 text-blue-700 uppercase">Needs Orientation</span>}</p></td><td className="px-4 py-4"><span className={`px-3 py-1 rounded-full text-[10px] font-black ${v.passType === 'Day Pass' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>{v.passType}</span></td><td className="px-4 py-4 text-slate-600 text-xs">{v.referringProvider || '—'}</td><td className="px-4 py-4 text-xs"><span className={expired ? 'text-red-500 font-bold' : 'text-slate-600'}>{v.expirationDate ? new Date(v.expirationDate + 'T00:00:00').toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'}) : 'N/A'}</span></td><td className="px-4 py-4"><span className={`px-3 py-1 rounded-full text-[10px] font-black ${expired ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{expired ? 'EXPIRED' : 'ACTIVE'}</span></td><td className="px-4 py-4 font-black text-[#1080ad]">{v.totalVisits}</td><td className="px-4 py-4 flex gap-2">
                {!v.orientationComplete && (<button onClick={async () => { try { const res = await fetch('/api/update-visitor-orientation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ visitorAirtableId: v.airtableId }) }); const result = await res.json(); if (result.success) { setVisitors(prev => prev.map(vis => vis.airtableId === v.airtableId ? {...vis, orientationComplete: true} : vis)); } else { alert('Error: ' + result.error); } } catch (err) { alert('Network error.'); } }} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold hover:bg-blue-700 transition-colors" title="Mark Orientation Complete">Orient</button>)}
                <div className="relative group/renew">
                  <button className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-[10px] font-bold hover:bg-purple-700 transition-colors">Renew Pass</button>
                  <div className="absolute right-0 top-full mt-1 hidden group-hover/renew:block bg-white border border-slate-200 shadow-xl rounded-xl z-50 overflow-hidden w-40">
                    <button onClick={() => handleRenewVisitor(v, 'Day Pass')} className="w-full text-left px-4 py-2 text-[10px] font-bold text-slate-600 hover:bg-slate-50 border-b border-slate-100">Day Pass ($5)</button>
                    <button onClick={() => handleRenewVisitor(v, '2-Week Courtesy')} className="w-full text-left px-4 py-2 text-[10px] font-bold text-slate-600 hover:bg-slate-50 border-b border-slate-100">2-Week Courtesy</button>
                    <button onClick={() => handleRenewVisitor(v, 'Month Courtesy')} className="w-full text-left px-4 py-2 text-[10px] font-bold text-slate-600 hover:bg-slate-50">Month Courtesy</button>
                  </div>
                </div>
              </td></tr>); })}</tbody>
            </table>
          </div>
          {visitors.filter(v => new Date(v.expirationDate + 'T23:59:59') < new Date() && (v.email || v.phone)).length > 0 && (
            <ProListCard title="Conversion Leads — Expired Passes with Contact Info">
              <p className="text-sm text-slate-400 mb-4">These visitors had passes that expired. They have contact info and could be converted to full members.</p>
              <div className="space-y-3">{visitors.filter(v => new Date(v.expirationDate + 'T23:59:59') < new Date() && (v.email || v.phone)).map(v => (<div key={v.airtableId} className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100"><div><p className="font-bold text-slate-800">{v.firstName} {v.lastName}</p><p className="text-[11px] text-slate-400">{v.email} {v.phone ? `· ${v.phone}` : ''}</p><p className="text-[10px] text-purple-500 font-bold">{v.passType} · Referred by {v.referringProvider || 'N/A'} · {v.totalVisits} visit{v.totalVisits !== 1 ? 's' : ''}</p></div><div className="flex gap-2"><button className="p-2 bg-[#1080ad] text-white rounded-lg shadow-md" title="Email"><Mail size={16}/></button><button className="p-2 bg-[#dd6d22] text-white rounded-lg shadow-md" title="Call"><Phone size={16}/></button></div></div>))}</div>
            </ProListCard>
          )}
        </div>)}

        {activeTab === 'corporate' && (() => {
          const [periodStr, yearStr] = reportMonth.split('-');
          const y = parseInt(yearStr);
          let targetMonths = [];
          let displayPeriod = '';

          if (periodStr.startsWith('Q')) {
              const q = parseInt(periodStr.replace('Q', ''));
              targetMonths = [ (q-1)*3, (q-1)*3 + 1, (q-1)*3 + 2 ];
              displayPeriod = `Q${q} ${y}`;
          } else {
              targetMonths = [ parseInt(periodStr) - 1 ];
              displayPeriod = new Date(y, targetMonths[0]).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          }

          const currentPeriodVisits = visits.filter(v => {
            if (!v.time) return false;
            const d = new Date(v.time);
            return d.getFullYear() === y && targetMonths.includes(d.getMonth());
          });

          return (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-[#001f3f] tracking-tight">Corporate Partners</h2>
                <p className="text-slate-400 font-medium">Manage corporate sponsorships and billing rosters.</p>
              </div>
              <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200">
                  <PeriodSelector value={reportMonth} onChange={(e) => setReportMonth(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {corporatePartners.map(corp => {
                 const isUsageBased = !!usageBasedCorps[corp.id];
                 const corpMembers = members.filter(mem => mem.sponsorName === corp.sponsorMatch);
                 
                 let totalOwed = 0;
                 let totalPeriodVisits = 0;

                 // SMART BILLING ENGINE
                 const enrichedMembers = corpMembers.map(mem => {
                     const memVisits = currentPeriodVisits.filter(v => v.name.toLowerCase() === `${mem.firstName} ${mem.lastName}`.toLowerCase());
                     totalPeriodVisits += memVisits.length;
                     
                     const rate = parseFloat(String(mem.monthlyRate).replace(/[^0-9.]/g, '')) || 0;
                     let memberOwed = 0;
                     let activeMonthsCount = 0;

                     if (isUsageBased) {
                         targetMonths.forEach(mIdx => {
                             const visitedInMonth = memVisits.some(v => new Date(v.time).getMonth() === mIdx);
                             if (visitedInMonth) {
                                 memberOwed += rate;
                                 activeMonthsCount++;
                             }
                         });
                     } else {
                         if (mem.status === 'ACTIVE') {
                             memberOwed = rate * targetMonths.length;
                             activeMonthsCount = targetMonths.length;
                         }
                     }
                     totalOwed += memberOwed;
                     return { ...mem, periodVisits: memVisits.length, memberOwed, activeMonthsCount };
                 });

                 const activeMembersCount = enrichedMembers.filter(m => m.memberOwed > 0 || m.status === 'ACTIVE').length;

                 const isPaid = corp.paidMonths && corp.paidMonths.includes(reportMonth);
                 const togglePayment = async () => {
                    let newPaidMonths = corp.paidMonths || '';
                    if (isPaid) {
                       newPaidMonths = newPaidMonths.split(',').filter(mn => mn !== reportMonth).join(',');
                    } else {
                       newPaidMonths = newPaidMonths ? `${newPaidMonths},${reportMonth}` : reportMonth;
                    }
                    setCorporatePartners(prev => prev.map(c => c.id === corp.id ? { ...c, paidMonths: newPaidMonths } : c));
                    try {
                       await fetch('/api/update-corporate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ recordId: corp.id, paidMonths: newPaidMonths }) });
                    } catch (err) { alert('Failed to sync payment status to Airtable.'); }
                 };

                 const downloadCSV = () => {
                    if (corpMembers.length === 0) { alert('No employees enrolled for this partner.'); return; }
                    const headers = ["Employee Name", "Member ID", "Plan Type", "Period Visits", "Months Billed", "Total Billed"];
                    const rows = enrichedMembers.map(mem => `"${mem.firstName} ${mem.lastName}","${mem.id}","${mem.type}","${mem.periodVisits}","${mem.activeMonthsCount}","$${mem.memberOwed.toFixed(2)}"`);
                    rows.push(`"","","","","",""`);
                    rows.push(`"","","","","TOTAL DUE:","$${totalOwed.toFixed(2)}"`);
                    const csv = [headers.join(','), ...rows].join('\n');
                    const b = new Blob([csv],{type:'text/csv'}); const u = window.URL.createObjectURL(b); const a = document.createElement('a'); a.href=u; a.download=`${corp.name.replace(/\s+/g, '_')}_Invoice_${reportMonth}.csv`; a.click(); window.URL.revokeObjectURL(u);
                 };

                 const printInvoice = () => {
                    if (corpMembers.length === 0) { alert('No employees enrolled for this partner.'); return; }
                    const isHarper = viewingCenter === 'harper'; 
                    const centerName = isHarper ? 'Harper Wellness Center' : 'Anthony Wellness Center'; 
                    const centerAddr = isHarper ? '615 W 12th St, Harper, KS 67058' : '309 W Main St, Anthony, KS 67003'; 
                    const centerPhone = isHarper ? '(620) 896-1202' : '(620) 842-5190'; 
                    const directorName = isHarper ? 'Patrick Johnson' : 'Deanna Smithhisler'; 

                    const rows = enrichedMembers.map(mem => `<tr><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${mem.firstName} ${mem.lastName}</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-family: monospace; color: #64748b;">${mem.id}</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${mem.type}</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: bold; color: ${mem.periodVisits > 0 ? '#1080ad' : '#94a3b8'};">${mem.periodVisits}</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${mem.activeMonthsCount}</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: ${mem.memberOwed > 0 ? '#16a34a' : '#94a3b8'};">$${mem.memberOwed.toFixed(2)}</td></tr>`).join('');

                    const addressBlock = corp.address ? `${corp.address}<br/>${corp.city}, ${corp.state} ${corp.zip}` : 'Address not on file';

                    const html = `<!DOCTYPE html><html><head><title>Corporate Invoice - ${corp.name} - ${displayPeriod}</title><style>@media print{body{margin:0}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}}body{font-family:Arial,sans-serif;color:#1e293b;margin:0;padding:40px}.hdr{background:#003d6b;padding:20px 44px;display:flex;justify-content:space-between;align-items:center;border-radius:8px 8px 0 0}.hdr-logo{height:40px}.hdr-text{text-align:right;color:white}.hdr-title{font-size:24px;font-weight:900;margin:0}.hdr-sub{font-size:12px;color:#8bb8d9;margin-top:4px;line-height:1.4}.accent{height:4px;background:linear-gradient(to right,#dba51f,#dd6d22);margin-bottom:40px}.bill-to{margin-bottom:30px}.bill-to h2{margin:0 0 5px 0;font-size:14px;color:#64748b;text-transform:uppercase;letter-spacing:1px}.bill-to p{margin:0;font-size:18px;font-weight:900;color:#003d6b}.summary{display:flex;gap:40px;margin-bottom:30px;background:#f8fafc;padding:20px;border-radius:8px;border:1px solid #e2e8f0}.sum-box{text-align:left}.sum-lbl{font-size:10px;font-weight:bold;color:#64748b;text-transform:uppercase;letter-spacing:1px}.sum-val{font-size:24px;font-weight:900;color:#003d6b;margin-top:5px}.sum-val.due{color:#16a34a}table{width:100%;border-collapse:collapse;margin-bottom:30px;font-size:12px}th{background:#003d6b;color:white;text-align:left;padding:12px 10px;font-size:10px;text-transform:uppercase;letter-spacing:1px}th.right{text-align:right}th.center{text-align:center}.total-row td{background:#fff;border-top:2px solid #003d6b;padding-top:20px;font-size:14px}.total-lbl{text-align:right;font-weight:900;color:#1e293b;text-transform:uppercase}.total-val{font-size:20px;font-weight:900;color:#16a34a;text-align:right}.sign{margin-top:40px;font-size:14px}.sign-name{font-weight:bold;color:#003d6b;margin-top:5px}.sign-title{color:#64748b;font-size:12px}</style></head><body><div class="hdr"><img src="${LOGO_URL}" class="hdr-logo" /><div class="hdr-text"><h1 class="hdr-title">Corporate Invoice</h1><div class="hdr-sub">${centerName}<br/>${centerAddr} | ${centerPhone}</div></div></div><div class="accent"></div><div class="bill-to"><h2>Billed To:</h2><p>${corp.name}</p><p style="font-size: 14px; font-weight: normal; color: #475569; margin-top: 4px;">Attn: ${corp.contactName || 'Benefits Administrator'}<br/>${addressBlock}</p></div><div class="summary"><div class="sum-box"><div class="sum-lbl">Billing Period</div><div class="sum-val" style="font-size: 18px;">${displayPeriod}</div></div><div class="sum-box"><div class="sum-lbl">${isUsageBased ? 'Active Employees' : 'Total Enrolled'}</div><div class="sum-val" style="font-size: 18px;">${activeMembersCount}</div></div><div class="sum-box"><div class="sum-lbl">Total Amount Due</div><div class="sum-val due" style="font-size: 18px;">$${totalOwed.toFixed(2)}</div></div></div><table><thead><tr><th>Employee Name</th><th>Member ID</th><th>Plan Type</th><th class="center">Period Visits</th><th class="center">Months Billed</th><th class="right">Amount Billed</th></tr></thead><tbody>${rows}</tbody><tfoot><tr class="total-row"><td colspan="5" class="total-lbl">Total Corporate Responsibility:</td><td class="total-val">$${totalOwed.toFixed(2)}</td></tr></tfoot></table><div class="sign"><p>Thank you for partnering with Patterson Health Center to keep your team healthy!</p><div class="sign-name">${directorName}</div><div class="sign-title">Director, ${centerName}</div></div></body></html>`;
                    const w = window.open('', '_blank'); w.document.write(html); w.document.close(); setTimeout(() => w.print(), 500);
                 };

                 return (
                   <div key={corp.id} className={`bg-white p-6 rounded-2xl shadow-sm border flex flex-col justify-between transition-all ${isPaid ? 'border-green-300' : 'border-slate-200'}`}>
                     <div>
                       <div className="flex justify-between items-start mb-1">
                         <h3 className="font-black text-[#001f3f] text-xl">{corp.name}</h3>
                         <div className="flex items-center gap-2">
                           <button onClick={() => setEditingCorp(corp)} className="bg-blue-50 text-[#1080ad] hover:bg-blue-100 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase transition-colors">Edit</button>
                           <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                             {isPaid ? 'PAID' : 'UNPAID'}
                           </span>
                         </div>
                       </div>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-4"><Mail size={12}/> {corp.contactEmail || 'No Email on file'}</p>
                       
                       <div className="space-y-2 mb-6">
                         <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                           <span className="text-xs font-bold text-slate-500 uppercase">Enrolled</span>
                           <span className="text-lg font-black text-[#001f3f]">{corpMembers.length}</span>
                         </div>
                         <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg border border-blue-100">
                           <span className="text-xs font-bold text-blue-600 uppercase">Visits ({displayPeriod.split(' ')[0]})</span>
                           <span className="text-lg font-black text-[#1080ad]">{totalPeriodVisits}</span>
                         </div>
                         <div className="flex justify-between items-center bg-green-50 p-3 rounded-lg border border-green-100">
                           <span className="text-xs font-bold text-green-600 uppercase">Total Owed</span>
                           <span className="text-lg font-black text-[#16a34a]">${totalOwed.toFixed(2)}</span>
                         </div>
                       </div>
                       
                       <label className="flex items-center gap-2 mb-6 cursor-pointer group w-fit">
                          <input type="checkbox" checked={isUsageBased} onChange={(e) => setUsageBasedCorps(prev => ({...prev, [corp.id]: e.target.checked}))} className="w-4 h-4 text-[#1080ad] rounded border-slate-300 cursor-pointer" />
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest group-hover:text-[#1080ad] transition-colors">Usage-Based Billing</span>
                       </label>

                       <button onClick={() => setExpandedCorpId(expandedCorpId === corp.id ? null : corp.id)} className="w-full text-left py-2 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-500 hover:text-[#1080ad] transition-colors mb-4">
                         {expandedCorpId === corp.id ? 'Hide Employee Roster ↑' : 'View Employee Roster ↓'}
                       </button>
                       
                       {expandedCorpId === corp.id && (
                         <div className="mb-6 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                            <div className="max-h-48 overflow-y-auto p-3 space-y-2">
                              {enrichedMembers.length === 0 ? <p className="text-xs text-slate-400 italic">No members enrolled.</p> : enrichedMembers.map(em => (
                                <div key={em.id} className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                                   <div>
                                     <p className="text-xs font-bold text-slate-800">{em.firstName} {em.lastName}</p>
                                     <p className="text-[9px] text-slate-400 uppercase tracking-widest">{em.type} • {em.periodVisits} visit{em.periodVisits !== 1 ? 's' : ''}</p>
                                   </div>
                                   <span className={`text-xs font-black ${em.memberOwed > 0 ? 'text-[#16a34a]' : 'text-slate-400'}`}>${em.memberOwed.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                         </div>
                       )}

                     </div>

                     <div className="flex flex-col gap-2">
                       <div className="flex gap-2">
                         <button onClick={printInvoice} className="flex-1 bg-[#16a34a] text-white py-3 rounded-xl text-sm font-bold shadow-sm flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"><Printer size={16}/> Invoice</button>
                         <button onClick={downloadCSV} className="bg-slate-100 text-[#001f3f] px-4 py-3 rounded-xl text-sm font-bold shadow-sm flex items-center justify-center hover:bg-slate-200 transition-colors" title="Download Spreadsheet CSV"><Download size={16}/></button>
                         {corp.contactEmail && (
                           <a href={`mailto:${corp.contactEmail}?subject=${corp.name} Wellness Roster & Invoice - ${displayPeriod}&body=Hello ${corp.contactName || 'Partner'},\n\nPlease find attached your updated wellness center roster and invoice for ${displayPeriod}.\n\nTotal Due: $${totalOwed.toFixed(2)}\n\nThank you for partnering with us to keep your team healthy!\n\n- Patterson Health Center`} className="bg-slate-100 text-slate-600 px-4 py-3 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center" title="Draft Email to Partner"><Mail size={16}/></a>
                         )}
                       </div>
                       <button onClick={togglePayment} className={`w-full py-3 rounded-xl text-sm font-bold shadow-sm transition-colors border ${isPaid ? 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50' : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'}`}>
                         {isPaid ? 'Mark as Unpaid' : 'Mark as Paid'}
                       </button>
                     </div>
                   </div>
                 );
              })}
            </div>
          </div>
        )})()}

        {activeTab === 'reports' && (() => {
          const [periodStr, yearStr] = reportMonth.split('-');
          const y = parseInt(yearStr);
          let targetMonths = [];
          if (periodStr.startsWith('Q')) {
              const q = parseInt(periodStr.replace('Q', ''));
              targetMonths = [ (q-1)*3, (q-1)*3 + 1, (q-1)*3 + 2 ];
          } else {
              targetMonths = [ parseInt(periodStr) - 1 ];
          }

          const currentPeriodVisits = visits.filter(v => {
            if (!v.time) return false;
            const d = new Date(v.time);
            return d.getFullYear() === y && targetMonths.includes(d.getMonth());
          });

          const newMembersThisPeriod = members.filter(mem => {
            if (!mem.startDate) return false;
            const d = new Date(mem.startDate);
            return d.getFullYear() === y && targetMonths.includes(d.getMonth());
          });

          const visitCounts = currentPeriodVisits.reduce((acc, v) => {
            const name = v.name;
            acc[name] = (acc[name] || 0) + 1;
            return acc;
          }, {});
          const topMembers = Object.entries(visitCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

          const twentyOneDaysAgo = new Date();
          twentyOneDaysAgo.setDate(twentyOneDaysAgo.getDate() - 21);
          const slippingAway = members.filter(mem => {
            const memberVisits = visits.filter(v => v.name.toLowerCase() === (mem.firstName + ' ' + mem.lastName).toLowerCase());
            if (memberVisits.length === 0) return true; 
            const lastVisit = new Date(Math.max(...memberVisits.map(v => new Date(v.time))));
            return lastVisit < twentyOneDaysAgo;
          }).slice(0, 5);

          const visitsByPlan = currentPeriodVisits.reduce((acc, v) => {
            acc[v.type] = (acc[v.type] || 0) + 1;
            return acc;
          }, {});

          return (
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-black text-[#001f3f]">Facility Summary Report</h2>
                  <p className="text-sm text-slate-500">Filter your facility data by month or quarter.</p>
                </div>
                <div className="flex gap-4">
                  <PeriodSelector value={reportMonth} onChange={(e) => setReportMonth(e.target.value)} />
                  <button onClick={() => {
                    if (currentPeriodVisits.length === 0) { alert('No visits to export for this period.'); return; }
                    const csv = ["Date,Time,Name,Center,Plan Type,Check-In Method",...currentPeriodVisits.map(v => `"${new Date(v.time).toLocaleDateString()}","${new Date(v.time).toLocaleTimeString()}","${v.name}","${v.center}","${v.type}","${v.method || 'General Workout'}"`)].join('\n');
                    const b = new Blob([csv],{type:'text/csv'}); const u = window.URL.createObjectURL(b); const a = document.createElement('a'); a.href=u; a.download=`Visits_${reportMonth}.csv`; a.click(); window.URL.revokeObjectURL(u);
                  }} className="px-4 py-2 bg-[#1080ad] text-white rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 hover:bg-blue-800"><Download size={16}/> Visits CSV</button>

                  <button onClick={() => {
                    if (scopedMembers.length === 0) { alert('No members found.'); return; }
                    const centerName = viewingCenter === 'both' ? 'All Centers' : viewingCenter.charAt(0).toUpperCase() + viewingCenter.slice(1) + ' Wellness Center';
                    const activeMembers = scopedMembers.filter(m => m.status === 'ACTIVE');
                    const totalRevenue = activeMembers.reduce((sum, m) => { const rate = parseFloat(String(m.monthlyRate).replace(/[^0-9.]/g, '')) || 0; return sum + rate; }, 0);
                    
                    const rows = scopedMembers.map(m => {
                      const finalRate = parseFloat(String(m.monthlyRate).replace(/[^0-9.]/g, '')) || 0;
                      // Looks for CC/Cash/Check, falls back to Auto-Draft/Month-to-Month
                      const payMethod = m.paymentMethod || m.billingMethod || 'N/A'; 
                      return `<tr><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${m.firstName} ${m.lastName}</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${m.type}</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${payMethod}</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight:bold; color: #16a34a;">$${finalRate.toFixed(2)}</td></tr>`;
                    }).join('');

                    const html = `<!DOCTYPE html><html><head><title>Financial Roster - ${centerName}</title><style>@media print { body { margin: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } } body { font-family: Arial, sans-serif; color: #1e293b; margin: 0; padding: 40px; } .hdr { background: #003d6b; padding: 20px; display: flex; align-items: center; gap: 15px; border-radius: 8px 8px 0 0; } .hdr img { height: 40px; } .hdr-text { color: white; } .hdr-title { font-size: 24px; font-weight: 900; margin: 0; } .hdr-sub { font-size: 12px; color: #8bb8d9; text-transform: uppercase; letter-spacing: 1px; } .accent { height: 4px; background: linear-gradient(to right, #dba51f, #dd6d22); margin-bottom: 30px; } .summary { display: flex; gap: 40px; margin-bottom: 20px; background: #f8fafc; padding: 15px 20px; border-radius: 8px; border: 1px solid #e2e8f0; } .sum-box { text-align: left; } .sum-lbl { font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase; letter-spacing: 1px; } .sum-val { font-size: 20px; font-weight: 900; color: #003d6b; margin-top: 5px; } table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 12px; } th { background: #003d6b; color: white; text-align: left; padding: 12px 10px; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; } td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; } tr:nth-child(even) { background-color: #f8fafc; } .total-row td { background: #fff; border-top: 2px solid #003d6b; border-bottom: none; padding-top: 20px; font-size: 14px; } .total-lbl { text-align: right; font-weight: 900; color: #1e293b; text-transform: uppercase; letter-spacing: 1px; } .total-val { font-size: 20px; font-weight: 900; color: #16a34a; text-align: left; padding-left: 12px;}</style></head><body><div class="hdr"><img src="${LOGO_URL}" /><div class="hdr-text"><h1 class="hdr-title">Financial Roster</h1><div class="hdr-sub">${centerName} • ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div></div></div><div class="accent"></div><div class="summary"><div class="sum-box"><div class="sum-lbl">Total Members</div><div class="sum-val">${scopedMembers.length}</div></div><div class="sum-box"><div class="sum-lbl">Active Accounts</div><div class="sum-val" style="color: #16a34a;">${activeMembers.length}</div></div><div class="sum-box"><div class="sum-lbl">Overdue / Locked</div><div class="sum-val" style="color: #dc2626;">${scopedMembers.length - activeMembers.length}</div></div></div><table><thead><tr><th>Member Name</th><th>Plan Type</th><th>Payment Method</th><th>Final Rate</th></tr></thead><tbody>${rows}</tbody><tfoot><tr class="total-row"><td colspan="3" class="total-lbl">Expected Monthly Revenue (Active Members):</td><td class="total-val">$${totalRevenue.toFixed(2)}</td></tr></tfoot></table></body></html>`;
                    const w = window.open('', '_blank'); w.document.write(html); w.document.close(); setTimeout(() => w.print(), 500);
                  }} className="px-4 py-2 bg-[#16a34a] text-white rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 hover:bg-green-700"><Printer size={16}/> Print Financials</button>

                  <button onClick={() => {
                    if (scopedMembers.length === 0) { alert('No members found.'); return; }
                    const csv = ["Member Name,Plan Type,Payment Method,Final Rate",...scopedMembers.map(m => `"${m.firstName} ${m.lastName}","${m.type}","${m.paymentMethod || m.billingMethod || 'N/A'}","$${parseFloat(String(m.monthlyRate).replace(/[^0-9.]/g, '')) || '0'}"`)].join('\n');
                    const b = new Blob([csv],{type:'text/csv'}); const u = window.URL.createObjectURL(b); const a = document.createElement('a'); a.href=u; a.download=`Financial_Roster_${reportMonth}.csv`; a.click(); window.URL.revokeObjectURL(u);
                  }} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 hover:bg-slate-50"><Download size={16}/> CSV</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-t-4 border-t-blue-500">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Visits</p>
                  <p className="text-4xl font-black text-slate-800">{currentPeriodVisits.length}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-t-4 border-t-green-500">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">New Sign-Ups</p>
                  <p className="text-4xl font-black text-slate-800">{newMembersThisPeriod.length}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-t-4 border-t-amber-500">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">24/7 Passes (New)</p>
                  <p className="text-4xl font-black text-slate-800">{newMembersThisPeriod.filter(m => m.access247).length}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-t-4 border-t-purple-500">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Orientations</p>
                  <p className="text-4xl font-black text-slate-800">{newMembersThisPeriod.filter(m => m.needsOrientation).length}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-md font-black text-[#001f3f] mb-4 flex items-center gap-2">🏆 Top Visitors ({reportMonth})</h3>
                  {topMembers.length > 0 ? topMembers.map(([name, count], index) => (
                    <div key={name} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl mb-2">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-amber-400 text-white flex items-center justify-center text-xs font-bold">{index + 1}</span>
                        <span className="font-bold text-slate-700">{name}</span>
                      </div>
                      <span className="text-sm font-bold text-blue-600">{count} visits</span>
                    </div>
                  )) : <p className="text-sm text-slate-400">No visits recorded yet.</p>}
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-md font-black text-[#001f3f] mb-4 flex items-center gap-2">⚠️ Slipping Away (21+ Days)</h3>
                  {slippingAway.length > 0 ? slippingAway.map(m => (
                    <div key={m.email} className="flex justify-between items-center bg-red-50 p-3 rounded-xl mb-2">
                      <span className="font-bold text-slate-700">{m.firstName} {m.lastName}</span>
                      <span className="text-xs font-bold text-red-600 uppercase">Needs Check-in</span>
                    </div>
                  )) : <p className="text-sm text-slate-400">All active members have visited recently!</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-md font-black text-[#001f3f] mb-4">Standard Membership Visits</h3>
                  <div className="space-y-3">
                    {[{l: 'Single', k: 'SINGLE'}, {l: 'Family', k: 'FAMILY'}, {l: 'Senior', k: 'SENIOR'}, {l: 'Student', k: 'STUDENT'}].map(plan => (
                      <div key={plan.k} className="flex justify-between items-center border-b border-slate-50 pb-2">
                        <span className="text-sm font-semibold text-slate-600">{plan.l}</span>
                        <span className="font-black text-slate-800">
                          {(visitsByPlan[plan.k] || 0) + (plan.k === 'SENIOR' ? (visitsByPlan['SENIOR CITIZEN'] || 0) : 0)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-md font-black text-[#001f3f] mb-4">Corporate & Military Visits</h3>
                  <div className="space-y-3">
                    {['CORPORATE', 'CORPORATE FAMILY', 'ACTIVE MILITARY'].map(plan => (
                      <div key={plan} className="flex justify-between items-center border-b border-slate-50 pb-2">
                        <span className="text-sm font-semibold text-slate-600">{plan}</span>
                        <span className="font-black text-slate-800">{visitsByPlan[plan] || 0}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          );
        })()}

        {activeTab === 'notif' && (<div className="space-y-6"><div className="flex justify-between items-center mb-8"><div><h2 className="text-3xl font-bold text-[#001f3f] tracking-tight">Notifications</h2><p className="text-slate-400 font-medium">Payment reminders</p></div><button className="bg-[#dd6d22] text-white px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2"><Bell size={20}/> Send All Due</button></div><ProListCard title="Due for Reminder"><div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-4"><table className="w-full text-left border-collapse"><thead className="bg-slate-50 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b"><tr><th className="px-8 py-4 w-64">Member</th><th className="px-8 py-4 w-40">Type</th><th className="px-8 py-4 w-32">Status</th><th className="px-8 py-4 w-32">Due</th><th className="px-8 py-4 w-24">Actions</th></tr></thead><tbody className="text-sm">{scopedMembers.filter(m => m.status !== 'ACTIVE').map(m => (<tr key={m.id} className="border-b"><td className="px-8 py-5"><p className="font-bold text-slate-800">{m.firstName} {m.lastName}</p><p className="text-[11px] text-slate-400">{m.email}</p></td><td className="px-8 py-5"><span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black">{m.type}</span></td><td className="px-8 py-5"><span className={`px-3 py-1 rounded-full text-[10px] font-black ${m.status==='OVERDUE'?'bg-red-100 text-red-600':'bg-amber-100 text-amber-600'}`}>{m.status}</span></td><td className="px-8 py-5 text-slate-600 font-medium">{m.nextPayment}</td><td className="px-8 py-5 flex gap-2"><button className="p-2 bg-[#1080ad] text-white rounded-lg shadow-md"><Mail size={16}/></button><button className="p-2 bg-[#dd6d22] text-white rounded-lg shadow-md"><Phone size={16}/></button></td></tr>))}</tbody></table></div></ProListCard></div>)}

        {activeTab === 'badge' && (<div className="space-y-6"><div className="mb-8"><h2 className="text-3xl font-bold text-[#001f3f] tracking-tight mb-1">Staff Check-In</h2><p className="text-slate-400 font-medium">Log a check-in manually or via scanner.</p></div><div className="flex gap-8"><div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-200 flex-1 text-center"><p className="text-sm font-bold text-slate-400 mb-4">Enter Name or ID:</p><div className="relative w-full max-w-sm mx-auto mb-10"><div className="flex gap-4"><input className="flex-1 p-4 border rounded-xl outline-none text-xl text-center bg-slate-100 focus:border-[#1080ad] focus:bg-white transition-colors" placeholder="e.g. Smith" value={kioskInput} onChange={(e) => setKioskInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { processCheckIn(kioskInput, "Staff Scan/Entry"); setKioskInput(''); } }} /><button onClick={() => { processCheckIn(kioskInput, "Staff Scan/Entry"); setKioskInput(''); }} className="bg-[#001f3f] text-white px-8 rounded-xl font-bold hover:bg-blue-900 transition-colors shadow-sm">Check In</button></div>{kioskMatches.length > 0 && (<div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden text-left">{kioskMatches.map(m => (<button key={m._type + (m.airtableId || m.id)} onClick={() => { processCheckIn(m.id, "Staff Override Entry"); setKioskInput(''); }} className="w-full p-4 border-b border-slate-100 last:border-0 hover:bg-blue-50 transition-colors flex justify-between items-center group"><div><p className="font-bold text-[#001f3f] text-lg">{m.firstName} {m.lastName}</p><p className="text-[10px] text-slate-400 uppercase tracking-widest">{m.phone||'No Phone'}</p></div><div className="bg-[#1080ad] text-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm group-hover:scale-105 transition-transform">Select</div></button>))}</div>)}</div>{kioskMessage.text && (<div className={`mt-8 p-4 rounded-xl text-center font-bold text-lg ${kioskMessage.type==='success'?'bg-green-100 text-green-700':kioskMessage.type==='warning'?'bg-yellow-100 text-yellow-700':'bg-red-100 text-red-700'}`}>{kioskMessage.text}{kioskMessage.subtext && <p className="text-sm mt-1">{kioskMessage.subtext}</p>}</div>)}</div></div></div>)}

        {/* --- NEW HELP & TRAINING TAB --- */}
        {activeTab === 'help' && (() => {
          const faqs = [
            {
              category: "Membership Management",
              icon: <Users size={20} className="text-[#1080ad]" />,
              items: [
                { id: 'm1', q: "How do I add a family member?", a: "<b>Option 1 (New Family):</b> Click 'Add Member' and select the FAMILY plan. After you save the first member, the success screen will offer a blue 'Add Family Member' button.<br/><br/><b>Option 2 (Existing Family):</b> Open the primary member's profile and click the purple 'Add to Family' button at the bottom." },
                { id: 'm2', q: "How do I log a member's payment?", a: "Open the member's profile. Click the green 'Log Payment' button at the bottom. Select their payment method. The system will instantly log the payment and automatically push their 'Next Payment Due' date forward by one month." },
                { id: 'm3', q: "What if someone forgets their PIN?", a: "Open their profile card and click the yellow 'Reset PIN' button at the bottom. The system will instantly generate a new, random 4-digit code." },
                { id: 'm4', q: "How do I manage 24/7 badge access?", a: "To give someone 24/7 access, open their profile, click 'Edit Member'. Scroll down, check the '24/7 Access' box, and type their key fob/badge number." },
                { id: 'm5', q: "How do I mark an orientation as complete?", a: "Open their profile and click the 'Mark Complete' button inside the blue warning banner at the top." },
                { id: 'm6', q: "How do I print a payment reminder letter?", a: "Open a member's profile card and click the grey 'Print Letter' button. It will generate a custom PDF formatted perfectly for standard windowed envelopes." }
              ]
            },
            {
              category: "Classes & Check-ins",
              icon: <Calendar size={20} className="text-[#f59e0b]" />,
              items: [
                { id: 'c1', q: "How do I check someone into a class?", a: "Go to the 'Classes' tab and click 'Manage Roster' on the class you are running. A live scanner window will pop up. You can either type the attendee's name into the box, or they can scan their digital badge." },
                { id: 'c2', q: "How do I manually check someone in (override)?", a: "Go to the 'Staff Check-In' tab (the QR code icon). Type their name into the box and hit 'Check In'. You can also force a check-in directly from their profile card by clicking 'Force Manual Check-In'." }
              ]
            },
            {
              category: "Corporate & Usage-Based Billing",
              icon: <Briefcase size={20} className="text-[#8b5cf6]" />,
              items: [
                { id: 'corp1', q: "How do I charge a corporate partner based on usage?", a: "1. Go to the Corporate tab.<br/>2. Select the billing period (e.g., Q1 2026).<br/>3. Check the 'Usage-Based Billing' box on that company's card.<br/>4. Click 'Invoice'." },
                { id: 'corp2', q: "How do I update a company's mailing address or HR contact?", a: "Go to the Corporate tab and click the small blue 'Edit' button next to the company's name. A window will pop up allowing you to change their HR Contact Name, Email, and Full Mailing Address." },
                { id: 'corp3', q: "How do I see a company's full employee list?", a: "On the Corporate tab, click the 'View Employee Roster ↓' button at the bottom of any company card to drop down a scrollable list of every enrolled employee." }
              ]
            },
            {
              category: "Visitors & Passes",
              icon: <Eye size={20} className="text-[#16a34a]" />,
              items: [
                { id: 'v1', q: "How do I issue a new Day Pass or Courtesy Pass?", a: "Go to the 'Visitors' tab and click 'Add Visitor' in the top right. Fill out their information and select the pass type." },
                { id: 'v2', q: "How do I renew an expired visitor pass?", a: "Go to the Visitors tab. Find their name in the list, hover your mouse over the purple 'Renew Pass' button on the far right, and click the type of pass they are getting." }
              ]
            },
            {
              category: "Reporting & Exports",
              icon: <FileText size={20} className="text-[#dd6d22]" />,
              items: [
                { id: 'r1', q: "How do I export today's check-in log?", a: "Go to the 'Dashboard' tab. On the right side under 'Quick Export', click 'Export Today's Check-in Log'." },
                { id: 'r2', q: "How do I run a monthly financial report?", a: "Go to the 'Reports' tab. Select the month or quarter you want to view from the dropdown menu at the top. You can then click 'Print Financials' or 'CSV'." }
              ]
            }
          ];

          return (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
              <div className="mb-8 text-center bg-gradient-to-br from-[#001f3f] to-[#1080ad] p-12 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
                 <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                 <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
                 <HelpCircle size={48} className="mx-auto mb-6 text-blue-200" />
                 <h2 className="text-4xl font-black tracking-tight mb-4 relative z-10">Help & Training Center</h2>
                 <p className="text-blue-100 font-medium text-lg max-w-2xl mx-auto relative z-10">Your complete guide to managing members, billing, and facility operations in the custom WellnessHub.</p>
              </div>

              <div className="space-y-6">
                {faqs.map((section, idx) => (
                  <div key={idx} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-100 p-6 flex items-center gap-3">
                       <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100">{section.icon}</div>
                       <h3 className="text-xl font-black text-[#001f3f]">{section.category}</h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {section.items.map(faq => (
                        <div key={faq.id} className="group">
                          <button 
                            onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)} 
                            className="w-full text-left p-6 flex justify-between items-center hover:bg-slate-50/50 transition-colors focus:outline-none"
                          >
                            <span className={`font-bold text-lg transition-colors pr-8 ${expandedFaq === faq.id ? 'text-[#1080ad]' : 'text-slate-700 group-hover:text-[#1080ad]'}`}>
                              {faq.q}
                            </span>
                            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-300 ${expandedFaq === faq.id ? 'bg-blue-100 text-[#1080ad] rotate-90' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-[#1080ad]'}`}>
                              <ChevronRight size={18} />
                            </div>
                          </button>
                          <div 
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedFaq === faq.id ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                          >
                            <div className="p-6 pt-0 text-slate-600 leading-relaxed text-sm" dangerouslySetInnerHTML={{ __html: faq.a }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

      </main>

      {/* VISITOR DETAIL MODAL */}
      {selectedVisitor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001f3f]/90 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl p-12 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button onClick={() => setSelectedVisitor(null)} className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-all"><X size={24}/></button>
            <span className={`px-4 py-1 rounded-full text-[10px] font-black tracking-widest ${new Date(selectedVisitor.expirationDate + 'T23:59:59') < new Date() ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{new Date(selectedVisitor.expirationDate + 'T23:59:59') < new Date() ? 'EXPIRED' : 'ACTIVE PASS'}</span>
            <h2 className="text-5xl font-black text-slate-900 mt-6 mb-10 tracking-tighter leading-none">{selectedVisitor.firstName}<br/>{selectedVisitor.lastName}</h2>
            <div className="grid grid-cols-2 gap-8 gap-x-12">
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pass Type</p><p className="text-lg font-bold text-[#8b5cf6]">{selectedVisitor.passType}</p></div>
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Amount Paid</p><p className="text-lg font-bold text-slate-800">{selectedVisitor.amountPaid > 0 ? `$${selectedVisitor.amountPaid}` : 'Courtesy — Free'}</p></div>
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact</p><p className="text-sm font-bold text-slate-800">{selectedVisitor.email || 'No email'}<br/>{selectedVisitor.phone || 'No phone'}</p></div>
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Referring Provider</p><p className="text-lg font-bold text-[#dd6d22]">{selectedVisitor.referringProvider || 'N/A'}</p></div>
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Purchase Date</p><p className="text-lg font-bold text-slate-800">{selectedVisitor.purchaseDate ? new Date(selectedVisitor.purchaseDate + 'T00:00:00').toLocaleDateString('en-US', {month:'long',day:'numeric',year:'numeric'}) : 'N/A'}</p></div>
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Expiration Date</p><p className={`text-lg font-bold ${new Date(selectedVisitor.expirationDate + 'T23:59:59') < new Date() ? 'text-red-500' : 'text-slate-800'}`}>{selectedVisitor.expirationDate ? new Date(selectedVisitor.expirationDate + 'T00:00:00').toLocaleDateString('en-US', {month:'long',day:'numeric',year:'numeric'}) : 'N/A'}</p></div>
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Center</p><p className="text-lg font-bold text-slate-800">{selectedVisitor.center}</p></div>
              {(selectedVisitor.address || selectedVisitor.city) && (<div className="col-span-2"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Address</p><p className="text-lg font-bold text-slate-800">{[selectedVisitor.address, selectedVisitor.city, selectedVisitor.state, selectedVisitor.zip].filter(Boolean).join(', ')}</p></div>)}
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Visits</p><p className="text-lg font-bold text-[#1080ad]">{selectedVisitor.totalVisits}</p></div>
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Orientation</p><p className="text-lg font-bold text-slate-800">{selectedVisitor.orientationComplete ? 'Complete' : 'Pending'}</p></div>
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">PIN</p><p className="text-lg font-bold font-mono text-slate-800">{selectedVisitor.pin}</p></div>
            </div>
            {selectedVisitor.notes && (<div className="mt-8"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Notes</p><p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">{selectedVisitor.notes}</p></div>)}
            <div className="mt-10 flex gap-4">
              {!selectedVisitor.orientationComplete && (<button onClick={async () => { try { const res = await fetch('/api/update-visitor-orientation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ visitorAirtableId: selectedVisitor.airtableId }) }); const result = await res.json(); if (result.success) { setVisitors(prev => prev.map(v => v.airtableId === selectedVisitor.airtableId ? {...v, orientationComplete: true} : v)); setSelectedVisitor({...selectedVisitor, orientationComplete: true}); } else { alert('Error: ' + result.error); } } catch (err) { alert('Network error.'); } }} className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-colors text-sm">Mark Orientation Complete</button>)}
              <button onClick={() => setSelectedVisitor(null)} className="flex-1 bg-slate-100 text-[#001f3f] py-4 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CORPORATE MODAL */}
      {editingCorp && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-[#001f3f]/90 backdrop-blur-md">
           <div className="bg-white rounded-[2rem] w-full max-w-lg p-10 relative shadow-2xl">
              <button onClick={() => setEditingCorp(null)} className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-all"><X size={24}/></button>
              <h2 className="text-3xl font-black text-[#001f3f] mb-2 tracking-tight">Edit Partner Info</h2>
              <p className="text-slate-500 font-medium mb-8">Update contact and billing details for {editingCorp.name}.</p>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const updates = {
                  recordId: editingCorp.id,
                  contactName: e.target.c_contactName.value,
                  contactEmail: e.target.c_contactEmail.value,
                  address: e.target.c_address.value,
                  city: e.target.c_city.value,
                  state: e.target.c_state.value,
                  zip: e.target.c_zip.value
                };
                try {
                  const res = await fetch('/api/update-corporate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) });
                  setCorporatePartners(prev => prev.map(c => c.id === editingCorp.id ? { ...c, ...updates } : c));
                  setEditingCorp(null);
                } catch(err) {
                  alert('Network error updating partner.');
                }
              }} className="space-y-4">
                <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">HR Contact Name</label><input id="c_contactName" defaultValue={editingCorp.contactName} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#1080ad]" /></div>
                <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Contact Email</label><input id="c_contactEmail" type="email" defaultValue={editingCorp.contactEmail} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#1080ad]" /></div>
                <div className="col-span-2"><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Street Address</label><input id="c_address" defaultValue={editingCorp.address} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#1080ad]" /></div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1"><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">City</label><input id="c_city" defaultValue={editingCorp.city} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#1080ad]" /></div>
                  <div className="col-span-1"><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">State</label><input id="c_state" defaultValue={editingCorp.state} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#1080ad]" /></div>
                  <div className="col-span-1"><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Zip</label><input id="c_zip" defaultValue={editingCorp.zip} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#1080ad]" /></div>
                </div>
                <div className="flex gap-3 mt-8">
                  <button type="submit" className="flex-1 bg-[#1080ad] text-white py-4 rounded-xl font-bold hover:bg-blue-800 transition-colors">Save Changes</button>
                  <button type="button" onClick={() => setEditingCorp(null)} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-xl font-bold hover:bg-slate-200 transition-colors">Cancel</button>
                </div>
              </form>
           </div>
        </div>
      )}

      {/* ADD VISITOR MODAL */}
      {showAddVisitorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001f3f]/90 backdrop-blur-md">
          <div className="bg-white rounded-3xl w-full max-w-xl p-10 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowAddVisitorModal(false)} className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-all z-10"><X size={24}/></button>
            <h3 className="text-3xl font-black text-[#001f3f] mb-2 tracking-tight">Add Visitor</h3>
            <p className="text-slate-500 font-medium mb-8">Register a day pass or courtesy pass visitor.</p>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = { firstName: e.target.vfname.value, lastName: e.target.vlname.value, email: e.target.vemail.value, phone: e.target.vphone.value, address: e.target.vaddress.value, city: e.target.vcity.value, state: e.target.vstate.value, zip: e.target.vzip.value, passType: e.target.vpass.value, center: e.target.vcenter.value, referringProvider: e.target.vprovider.value, notes: e.target.vnotes.value };
              try {
                const res = await fetch('/api/add-visitor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
                const result = await res.json();
                if (result.success) {
                  alert(`Visitor added!\n\nPIN: ${result.pin}\nExpires: ${new Date(result.expirationDate + 'T00:00:00').toLocaleDateString('en-US', {month:'long',day:'numeric',year:'numeric'})}${result.amountPaid > 0 ? `\nAmount: $${result.amountPaid}` : '\nCourtesy pass — no charge'}\n\nGive this PIN to the visitor for kiosk check-in after their first visit.`);
                  setShowAddVisitorModal(false);
                  fetch('/api/get-visitors').then(r => r.json()).then(data => {
                    if (data.records) { setVisitors(data.records.map(r => ({ airtableId: r.id, firstName: r.fields['First Name'] || '', lastName: r.fields['Last Name'] || '', email: r.fields['Email'] || '', phone: r.fields['Phone'] || '', passType: r.fields['Pass Type'] || '', amountPaid: r.fields['Amount Paid'] || 0, referringProvider: r.fields['Referring Provider'] || '', purchaseDate: r.fields['Purchase Date'] || '', expirationDate: r.fields['Expiration Date'] || '', center: r.fields['Center'] || '', pin: r.fields['PIN'] || '', orientationComplete: !!r.fields['Orientation Complete'], totalVisits: r.fields['Total Visits'] || 0, address: r.fields['Street Address'] || '', city: r.fields['City'] || '', state: r.fields['State'] || '', zip: r.fields['Zip'] || '', notes: r.fields['Notes'] || '' }))); }
                  });
                } else { alert('Error: ' + result.error); }
              } catch (err) { alert('Network error. Please try again.'); }
            }} className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">First Name</label><input id="vfname" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors" /></div>
                <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">Last Name</label><input id="vlname" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors" /></div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">Email</label><input type="email" id="vemail" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors" /></div>
                <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">Phone</label><input id="vphone" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors" /></div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2"><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">Street Address</label><input id="vaddress" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors" /></div>
                <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">City</label><input id="vcity" placeholder="Harper" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">State</label><input id="vstate" defaultValue="KS" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors" /></div>
                  <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">Zip</label><input id="vzip" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors" /></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">Pass Type</label><select id="vpass" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors font-bold text-slate-700"><option value="Day Pass">Day Pass ($5)</option><option value="2-Week Courtesy">2-Week Courtesy (Free)</option><option value="Month Courtesy">Month Courtesy (Free)</option></select></div>
                <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">Home Center</label><select id="vcenter" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors font-bold text-slate-700"><option value="Anthony Wellness Center">Anthony</option><option value="Harper Wellness Center">Harper</option></select></div>
              </div>
              <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">Referring Provider / Department</label><input id="vprovider" placeholder="e.g. Dr. Smith, PT Department, Patterson Clinic" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors" /></div>
              <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">Notes</label><input id="vnotes" placeholder="Optional notes" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors" /></div>
              <button type="submit" className="w-full bg-[#8b5cf6] text-white p-5 rounded-xl font-bold mt-4 shadow-lg hover:bg-purple-700 transition-colors text-lg flex items-center justify-center gap-2"><Plus size={18}/> Add Visitor</button>
            </form>
          </div>
        </div>
      )}

      {/* ADD MEMBER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001f3f]/90 backdrop-blur-md">
           <div className="bg-white rounded-3xl w-full max-w-xl p-10 relative shadow-2xl max-h-[90vh] overflow-y-auto">
              <button onClick={() => { setShowAddModal(false); setNewMemberPin(null); setFamilyFlow(null); setSelectedSponsor(''); setCustomSponsor(''); }} className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-all z-10"><X size={24}/></button>
              {newMemberPin ? (
                <div className="flex flex-col items-center justify-center text-center py-4">
                  <CheckCircle size={64} className="text-[#16a34a] mb-6" />
                  <h3 className="text-2xl font-black text-[#001f3f] mb-2">{familyFlow ? (familyFlow.addedMembers.length === 1 ? 'Primary Member Created!' : 'Family Member Added!') : 'Member Created!'}</h3>
                  <p className="text-slate-500 mb-6">Give this PIN to <strong>{newMemberPin.name}</strong></p>
                  <div className="bg-slate-100 px-12 py-6 rounded-2xl mb-6"><p className="text-5xl font-black tracking-[0.3em] text-[#001f3f]">{newMemberPin.pin}</p></div>
                  <p className="text-xs text-slate-400 mb-6">They will use this PIN + their email to log in.</p>
                  {familyFlow && (<div className="w-full bg-slate-50 rounded-xl p-4 mb-6 border border-slate-200"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{familyFlow.familyName} — {familyFlow.addedMembers.length} member{familyFlow.addedMembers.length !== 1 ? 's' : ''}</p>{familyFlow.addedMembers.map((m, i) => (<div key={i} className="flex justify-between items-center py-1"><span className="text-sm font-bold text-slate-700">{m.name} {m.isPrimary ? <span className="text-[9px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded font-black ml-1">PRIMARY</span> : ''}</span><span className="text-sm font-mono text-slate-400">PIN: {m.pin}</span></div>))}</div>)}
                  <div className="flex gap-3 w-full">
                    {familyFlow && (<button onClick={() => { setNewMemberPin(null); }} className="flex-1 bg-[#1080ad] text-white px-6 py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"><Plus size={16}/> Add Family Member</button>)}
                    
                    {/* SILENT REFRESH DONE BUTTON */}
                    <button onClick={() => { 
                      setNewMemberPin(null); 
                      setShowAddModal(false); 
                      setFamilyFlow(null); 
                      setSelectedSponsor(''); 
                      setCustomSponsor(''); 
                      
                      setLoading(true);
                      fetch('/api/members').then(res => res.json()).then(data => {
                        if (data.records) {
                          const mappedMembers = data.records.filter(r => r.fields['First Name'] && r.fields['First Name'] !== '').map(r => {
                            let planText = r.fields['Plan Name'] ? (Array.isArray(r.fields['Plan Name']) ? r.fields['Plan Name'][0] : r.fields['Plan Name']) : 'UNKNOWN PLAN';
                            let rawPassword = String(r.fields['Password'] || '').trim();
                            let finalPassword = (rawPassword === '' || rawPassword.includes('ERROR')) ? '1111' : rawPassword;
                            return { airtableId: r.id, id: r.fields['Member ID'] || r.id, firstName: r.fields['First Name'] || 'Unknown', lastName: r.fields['Last Name'] || '', email: r.fields['Email'] || '', phone: r.fields['Phone'] || '', password: finalPassword, status: (r.fields['Membership Status'] || 'ACTIVE').toUpperCase(), type: String(planText).toUpperCase().trim(), center: r.fields['Home Center'] || 'Anthony', visits: Number(r.fields['Total Visits'] || 0), nextPayment: r.fields['Next Payment Due'] || null, sponsor: !!r.fields['Corporate Sponsor'], sponsorName: r.fields['Corporate Sponsor'] ? String(r.fields['Corporate Sponsor']).trim() : '', needsOrientation: !!r.fields['Needs Orientation'], familyName: r.fields['Family Name'] ? (Array.isArray(r.fields['Family Name']) ? r.fields['Family Name'][0] : r.fields['Family Name']) : '', billingMethod: r.fields['Billing Method'] || '', monthlyRate: r.fields['Monthly Rate'] || '', access247: !!r.fields['24/7 Access'], badgeNumber: r.fields['Badge Number'] || '', startDate: r.fields['Start Date'] || null, notes: r.fields['Notes'] || '', discountCode: r.fields['Discount Code'] || '', discountExpiration: r.fields['Discount Expiration'] || null, address: r.fields['Street Address'] || '', city: r.fields['City'] || '', state: r.fields['State'] || 'KS', zip: r.fields['Zip'] || '', paymentMethod: r.fields['Payment Method'] || '' };
                          });
                          setMembers(mappedMembers);
                        }
                        setLoading(false);
                      });
                    }} className={`${familyFlow ? 'flex-1' : 'w-full'} bg-[#001f3f] text-white px-8 py-4 rounded-xl font-bold`}>Done</button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-3xl font-black text-[#001f3f] mb-2 tracking-tight">{familyFlow ? `Add to ${familyFlow.familyName}` : 'Manual Registration'}</h3>
                  <p className="text-slate-500 font-medium mb-8">{familyFlow ? `Adding a family member to the ${familyFlow.lastName} household.` : 'Add a new member. A random PIN will be generated automatically.'}</p>
                  <form onSubmit={handleAddMemberSubmit} className="space-y-5">
                     <div className="grid grid-cols-2 gap-5">
                        <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">First Name</label><input id="fname" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors" /></div>
                        <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">Last Name</label><input id="lname" required defaultValue={familyFlow ? familyFlow.lastName : ''} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors" /></div>
                     </div>
                     <div className="grid grid-cols-2 gap-5">
                        <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">Email</label><input type="email" id="email" defaultValue={familyFlow ? familyFlow.email : ''} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors" /></div>
                        <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">Phone</label><input id="phone" defaultValue={familyFlow ? familyFlow.phone : ''} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors" /></div>
                        <div>
                          <label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">Start Date</label>
                          <input 
                            type="date" 
                            id="startDate" 
                            defaultValue={new Date().toISOString().split('T')[0]} 
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors mb-2" 
                          />
                          <label className="flex items-center gap-2 ml-2 cursor-pointer group bg-blue-50 border border-blue-100 p-3 rounded-xl hover:bg-blue-100 transition-colors shadow-sm">
                            <input 
                              type="checkbox" 
                              onChange={(e) => {
                                const dateInput = document.getElementById('startDate');
                                const d = new Date();
                                if (e.target.checked) d.setDate(d.getDate() + 1);
                                else d.setDate(d.getDate()); // Resets if unchecked
                                dateInput.value = d.toISOString().split('T')[0];
                              }} 
                              className="w-5 h-5 rounded border-slate-300 text-[#1080ad] focus:ring-[#1080ad] cursor-pointer" 
                            />
                            <span className="text-xs font-bold text-[#1080ad] uppercase tracking-widest">First Day Free (Starts Tomorrow)</span>
                          </label>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-5">
                        <div className="col-span-2"><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">Street Address</label><input id="address" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors" /></div>
                        <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">City</label><input id="city" placeholder="Harper" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors" /></div>
                        <div className="grid grid-cols-2 gap-3">
                          <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">State</label><input id="mstate" defaultValue="KS" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors" /></div>
                          <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">Zip</label><input id="mzip" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors" /></div>
                        </div>
                     </div>
                     {!familyFlow && (
                       <>
                         <div className="grid grid-cols-2 gap-5">
                            <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">Plan Type</label><select id="plan" onChange={e => { const v = e.target.value; if (!v.includes('CORPORATE') && !v.includes('HD6') && !v.includes('HCHF')) { setSelectedSponsor(''); setCustomSponsor(''); } }} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors font-bold text-slate-700"><option value="SINGLE">Single</option><option value="FAMILY">Family</option><option value="SENIOR">Senior</option><option value="SENIOR FAMILY">Senior Family</option><option value="STUDENT">Student (14-22)</option><option value="CORPORATE">Corporate</option><option value="CORPORATE FAMILY">Corporate Family</option><option value="MILITARY">Military</option><option value="HD6">Staff (HD6)</option><option value="HCHF">Staff (HCHF)</option></select></div>
                            <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">Home Center</label><select id="center" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors font-bold text-slate-700"><option value="Anthony Wellness Center">Anthony</option><option value="Harper Wellness Center">Harper</option></select></div>
                         </div>
                         <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">Billing Method</label>
                           <select id="billing" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors font-bold text-slate-700"><option value="Month-to-Month">Month-to-Month</option><option value="Auto-Draft">Auto-Draft</option><option value="6-Month Prepay">6-Month Prepay</option><option value="12-Month Prepay">12-Month Prepay</option></select>
                         </div>
                         <div id="sponsor-section">
                           <label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">Corporate Sponsor</label>
                           <select value={selectedSponsor} onChange={e => { setSelectedSponsor(e.target.value); if (e.target.value !== '__other__') setCustomSponsor(''); }} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors font-bold text-slate-700">
                             <option value="">None</option>
                             {corporatePartners.map(cp => (<option key={cp.name} value={cp.sponsorMatch}>{cp.name}</option>))}
                             <option value="__other__">Other (type below)</option>
                           </select>
                           {selectedSponsor === '__other__' && (<input placeholder="Enter company name" value={customSponsor} onChange={e => setCustomSponsor(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors mt-3" />)}
                         </div>
                         <div className="grid grid-cols-2 gap-5 mt-2 mb-2">
                           <div><label className="text-xs font-bold text-green-600 uppercase mb-1 ml-2 block tracking-widest">Discount / Promo</label><input id="discount" placeholder="e.g. Farm Bureau $10" className="w-full p-4 bg-green-50 border border-green-200 rounded-xl outline-none focus:border-green-600 font-bold text-green-800 placeholder:text-green-300 transition-colors" /></div>
                           <div><label className="text-xs font-bold text-green-600 uppercase mb-1 ml-2 block tracking-widest">Expiration Date</label><input type="date" id="discount_exp" className="w-full p-4 bg-green-50 border border-green-200 rounded-xl outline-none focus:border-green-600 font-bold text-green-800 transition-colors" /></div>
                         </div>
                         <label className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4 cursor-pointer hover:bg-amber-100 transition-colors">
                           <input type="checkbox" id="access247" className="w-5 h-5 rounded border-slate-300 text-[#f59e0b] focus:ring-[#f59e0b]" />
                           <div><p className="text-sm font-bold text-amber-800">24/7 Badge Access</p><p className="text-[10px] text-amber-500">Member has a key fob or badge for after-hours access</p></div>
                         </label>
                         <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">24/7 Badge Number</label><input id="badgenum" placeholder="e.g. 1042" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors" /></div>
                         <label className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4 cursor-pointer hover:bg-blue-100 transition-colors">
                           <input type="checkbox" id="orientation" defaultChecked={true} className="w-5 h-5 rounded border-slate-300 text-[#1080ad] focus:ring-[#1080ad]" />
                           <div><p className="text-sm font-bold text-blue-800">Needs Orientation</p><p className="text-[10px] text-blue-500">Member will need a facility walkthrough before checking in</p></div>
                         </label>
                       </>
                     )}
                     {familyFlow && (
                       <>
                         <input type="hidden" id="plan" value={familyFlow.plan} />
                         <input type="hidden" id="center" value={familyFlow.center} />
                         <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-3"><Users size={18} className="text-blue-600" /><div><p className="text-sm font-bold text-blue-800">{familyFlow.plan} · {familyFlow.center}</p><p className="text-[10px] text-blue-500">Same plan and center as primary member</p></div></div>
                         <label className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4 cursor-pointer hover:bg-blue-100 transition-colors">
                           <input type="checkbox" id="orientation" defaultChecked={true} className="w-5 h-5 rounded border-slate-300 text-[#1080ad] focus:ring-[#1080ad]" />
                           <div><p className="text-sm font-bold text-blue-800">Needs Orientation</p><p className="text-[10px] text-blue-500">This family member also needs a walkthrough</p></div>
                         </label>
                       </>
                     )}
                     <button type="submit" disabled={isAdding} className="w-full bg-[#1080ad] text-white p-5 rounded-xl font-bold mt-4 shadow-lg hover:bg-blue-800 transition-colors text-lg flex items-center justify-center gap-2">{isAdding ? 'Saving to Airtable...' : familyFlow ? 'Add Family Member' : 'Create Member Profile'}</button>
                  </form>
                </>
              )}
           </div>
        </div>
      )}

      {/* MEMBER DETAIL MODAL WITH EDIT MODE */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001f3f]/90 backdrop-blur-md">
           <div className="bg-white rounded-[2rem] w-full max-w-4xl flex overflow-hidden shadow-2xl relative">
              <button onClick={() => { setSelectedMember(null); setEditMode(false); }} className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-all"><X size={24}/></button>
              <div className="w-1/3 bg-slate-50 p-12 flex flex-col items-center justify-center border-r border-slate-100"><div className="bg-white p-6 rounded-2xl shadow-xl mb-8 border border-slate-100"><QRCode data={selectedMember.id} size={180} /></div><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Member Identity</p><p className="text-xl font-bold text-[#001f3f] mb-6">#{selectedMember.id}</p><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Kiosk PIN</p><p className="text-3xl font-black tracking-[0.2em] text-[#1080ad]">{selectedMember.password}</p></div>
              <div className="flex-1 p-16 overflow-y-auto">
                 {selectedMember.needsOrientation && (<div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg flex justify-between items-center"><p className="text-blue-800 font-bold text-sm">This member has not completed their orientation.</p><button onClick={async () => { try { await fetch('/api/update-orientation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ airtableId: selectedMember.airtableId, completed: true }) }); setMembers(prev => prev.map(m => m.airtableId === selectedMember.airtableId ? { ...m, needsOrientation: false } : m)); setSelectedMember({ ...selectedMember, needsOrientation: false }); } catch (err) { alert('Could not update.'); } }} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors whitespace-nowrap ml-4">Mark Complete</button></div>)}
                 <span className={`px-4 py-1 rounded-full text-[10px] font-black tracking-widest ${getStoplight(selectedMember)==='green'?'bg-green-100 text-green-600':getStoplight(selectedMember)==='yellow'?'bg-yellow-100 text-yellow-600':'bg-red-100 text-red-600'}`}>{getStoplight(selectedMember)==='green'?'ACTIVE':getStoplight(selectedMember)==='yellow'?'GRACE PERIOD':'ACCOUNT LOCKED'}</span>
                 <h2 className="text-6xl font-black text-slate-900 mt-6 mb-12 tracking-tighter leading-none">{selectedMember.firstName}<br/>{selectedMember.lastName}</h2>

                 {!editMode ? (<>
                 <div className="grid grid-cols-2 gap-8 gap-x-12">
                    <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Membership Type</p><p className="text-lg font-bold text-slate-800">{selectedMember.type}</p></div>
                    <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact Info</p><p className="text-sm font-bold text-slate-800 truncate">{selectedMember.email || 'No Email'}<br/>{selectedMember.phone || 'No Phone'}</p></div>
                    <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Renewal Date</p><p className={`text-lg font-bold ${getStoplight(selectedMember)!=='green'?'text-red-500':'text-slate-800'}`}>{selectedMember.nextPayment ? new Date(selectedMember.nextPayment + 'T00:00:00').toLocaleDateString('en-US', {month:'long',day:'numeric',year:'numeric'}) : 'N/A'}</p></div>
                    {selectedMember.sponsorName && (<div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Corporate Sponsor</p><p className="text-lg font-bold text-[#dd6d22]">{selectedMember.sponsorName}</p></div>)}
                    {selectedMember.familyName && (<div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Family Group</p><p className="text-lg font-bold text-[#8b5cf6]">{selectedMember.familyName}</p></div>)}
                    {selectedMember.access247 && (<div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">24/7 Access</p><p className="text-lg font-bold text-[#f59e0b]">Badge #{selectedMember.badgeNumber || 'N/A'}</p></div>)}
                    {selectedMember.discountCode && (<div><p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Active Discount</p><p className="text-lg font-black text-[#16a34a]">🎟️ {selectedMember.discountCode} <span className="text-xs font-medium text-slate-500 block mt-1">Expires: {selectedMember.discountExpiration ? new Date(selectedMember.discountExpiration + 'T00:00:00').toLocaleDateString() : 'Never'}</span></p></div>)}
                 </div>
                 {selectedMember.notes && (
                      <div className="col-span-2 mt-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Director Notes</p>
                        <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap">{selectedMember.notes}</p>
                      </div>
                 )}
                 <div className="col-span-2 mt-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Check-in History</p>
                    {(() => {
                      const memberVisits = visits.filter(v => v.name.toLowerCase() === `${selectedMember.firstName} ${selectedMember.lastName}`.toLowerCase());
                      const displayVisits = showAllMemberVisits ? memberVisits : memberVisits.slice(0, 5);
                      
                      if (memberVisits.length === 0) return <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100 italic">No recent visits on file.</p>;
                      
                      return (
                        <div>
                          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                            {displayVisits.map((v, i) => (
                              <div key={i} className="flex justify-between items-center bg-blue-50 p-3 rounded-xl border border-blue-100">
                                <span className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                  <CheckCircle size={14} className="text-[#1080ad]"/> {v.center} 
                                  <span className="text-xs font-medium text-slate-500 hidden md:inline ml-1">({v.method || 'General Workout'})</span>
                                </span>
                                <span className="font-bold text-[#1080ad] text-xs">
                                  {new Date(v.time).toLocaleDateString()} @ {new Date(v.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                              </div>
                            ))}
                          </div>
                          {memberVisits.length > 5 && (
                            <button 
                              onClick={() => setShowAllMemberVisits(!showAllMemberVisits)} 
                              className="w-full py-2 mt-3 text-sm font-bold text-[#1080ad] hover:text-[#001f3f] transition-colors bg-blue-50/50 rounded-lg border border-blue-100 hover:bg-blue-50"
                            >
                              {showAllMemberVisits ? 'Show Less ↑' : `See All ${memberVisits.length} Visits →`}
                            </button>
                          )}
                        </div>
                      );
                    })()}
                 </div>
                 </>) : (<>
                 <div className="space-y-4 mb-8">
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">First Name</label><input id="ed_fname" defaultValue={selectedMember.firstName} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#1080ad]" /></div>
                      <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Last Name</label><input id="ed_lname" defaultValue={selectedMember.lastName} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#1080ad]" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Email</label><input id="ed_email" defaultValue={selectedMember.email} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#1080ad]" /></div>
                      <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Phone</label><input id="ed_phone" defaultValue={selectedMember.phone} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#1080ad]" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Plan Type</label>
                        <select id="ed_plan" defaultValue={selectedMember.type} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#1080ad] font-bold"><option value="SINGLE">Single</option><option value="FAMILY">Family</option><option value="SENIOR">Senior</option><option value="SENIOR FAMILY">Senior Family</option><option value="STUDENT">Student (14-22)</option><option value="CORPORATE">Corporate</option><option value="CORPORATE FAMILY">Corporate Family</option><option value="MILITARY">Military</option><option value="HD6">Staff (HD6)</option><option value="HCHF">Staff (HCHF)</option></select>
                      </div>
                      <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Billing Method</label>
                        <select id="ed_billing" defaultValue={selectedMember.billingMethod || 'Month-to-Month'} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#1080ad] font-bold"><option value="Month-to-Month">Month-to-Month</option><option value="Auto-Draft">Auto-Draft</option><option value="6-Month Prepay">6-Month Prepay</option><option value="12-Month Prepay">12-Month Prepay</option></select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Home Center</label>
                        <select id="ed_center" defaultValue={selectedMember.center} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#1080ad] font-bold"><option value="Anthony Wellness Center">Anthony</option><option value="Harper Wellness Center">Harper</option></select>
                      </div>
                      <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Corporate Sponsor</label>
                        <select id="ed_sponsor" defaultValue={selectedMember.sponsorName} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#1080ad] font-bold"><option value="">None</option>{corporatePartners.map(cp => (<option key={cp.name} value={cp.sponsorMatch}>{cp.name}</option>))}</select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl p-3 cursor-pointer"><input type="checkbox" id="ed_247" defaultChecked={selectedMember.access247} className="w-4 h-4 rounded" /><span className="text-sm font-bold text-amber-800">24/7 Access</span></label>
                      <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Badge Number</label><input id="ed_badge" defaultValue={selectedMember.badgeNumber} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#1080ad]" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-xs font-bold text-green-600 uppercase mb-1 block tracking-widest">Discount / Promo</label><input id="ed_discount" defaultValue={selectedMember.discountCode} placeholder="e.g. Farm Bureau $10" className="w-full p-3 bg-green-50 border border-green-200 rounded-xl text-sm outline-none focus:border-green-600 font-bold text-green-800 placeholder:text-green-300" /></div>
                      <div><label className="text-xs font-bold text-green-600 uppercase mb-1 block tracking-widest">Expiration Date</label><input type="date" id="ed_discount_exp" defaultValue={selectedMember.discountExpiration || ''} className="w-full p-3 bg-green-50 border border-green-200 rounded-xl text-sm outline-none focus:border-green-600 font-bold text-green-800" /></div>
                    </div>
                    <div className="col-span-2 mt-2 mb-4">
                      <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Director Notes</label>
                      <textarea id="ed_notes" defaultValue={selectedMember.notes || ''} placeholder="Add private notes about this member..." className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#1080ad] min-h-[100px]"></textarea>
                    </div>
                   <div className="flex gap-3 mt-4">
                      <button onClick={async () => {
                        // --- SMART PRICE CALCULATOR (EDIT MODE) ---
                        const selectedPlan = document.getElementById('ed_plan').value;
                        const selectedBilling = document.getElementById('ed_billing').value;
                        const enteredDiscount = document.getElementById('ed_discount').value;
                        
                        const basePrice = getBaseRate(selectedPlan, selectedBilling);
                        const discountMatch = enteredDiscount.match(/\$(\d+)/);
                        const discountAmount = discountMatch ? parseInt(discountMatch[1], 10) : 0;
                        const finalMonthlyRate = Math.max(0, basePrice - discountAmount);
                        // ------------------------------------------

                        const updates = { airtableId: selectedMember.airtableId, firstName: document.getElementById('ed_fname').value, lastName: document.getElementById('ed_lname').value, email: document.getElementById('ed_email').value, phone: document.getElementById('ed_phone').value, plan: selectedPlan, billingMethod: selectedBilling, center: document.getElementById('ed_center').value, sponsor: document.getElementById('ed_sponsor').value, access247: document.getElementById('ed_247').checked, badgeNumber: document.getElementById('ed_badge').value, notes: document.getElementById('ed_notes').value, discountCode: enteredDiscount, discountExpiration: document.getElementById('ed_discount_exp').value, monthlyRate: finalMonthlyRate };
                        try {
                          const res = await fetch('/api/update-member', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) });
                          const result = await res.json();
                          if (result.success || res.ok) {
                            const updated = { ...selectedMember, firstName: updates.firstName, lastName: updates.lastName, email: updates.email, phone: updates.phone, type: updates.plan, billingMethod: updates.billingMethod, center: updates.center, sponsorName: updates.sponsor, access247: updates.access247, badgeNumber: updates.badgeNumber, notes: updates.notes, discountCode: updates.discountCode, discountExpiration: updates.discountExpiration, monthlyRate: updates.monthlyRate };
                            setSelectedMember(updated); setMembers(prev => prev.map(m => m.airtableId === selectedMember.airtableId ? updated : m)); setEditMode(false);
                          } else { alert('Airtable Error: ' + result.error); console.log(result); }
                        } catch (err) { alert('Network error.'); }
                      }} className="flex-1 bg-[#1080ad] text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors">Save Changes</button>
                      <button onClick={() => setEditMode(false)} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors">Cancel</button>
                    </div>
                 </div>
                 </>)}

                 <div className="mt-14 grid grid-cols-2 md:grid-cols-3 gap-3">
                    <button onClick={() => { processCheckIn(selectedMember.id, "Director Override"); setSelectedMember(null); }} className="col-span-2 md:col-span-3 bg-[#001f3f] text-white py-4 rounded-xl font-bold shadow-xl shadow-blue-900/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"><CheckCircle size={18} /> Force Manual Check-In</button>
                    <button onClick={() => setEditMode(!editMode)} className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white py-4 rounded-xl font-bold shadow-sm transition-all flex flex-col items-center justify-center gap-2 text-xs"><FileText size={20} /> Edit Member</button>
                    {selectedMember.type.includes('FAMILY') && (
                      <button onClick={() => { 
                        setFamilyFlow({ familyRecordId: selectedMember.airtableId, familyName: selectedMember.familyName || `${selectedMember.lastName} Family`, lastName: selectedMember.lastName, plan: selectedMember.type, center: selectedMember.center, email: selectedMember.email, phone: selectedMember.phone, corporateSponsor: selectedMember.sponsorName, addedMembers: [] }); 
                        setShowAddModal(true); 
                        setSelectedMember(null); 
                      }} className="bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white py-4 rounded-xl font-bold shadow-sm transition-all flex flex-col items-center justify-center gap-2 text-xs"><Users size={20} /> Add to Family</button>
                    )}
                    <button onClick={() => setPaymentModal(selectedMember)} className="bg-green-50 text-green-600 hover:bg-green-600 hover:text-white py-4 rounded-xl font-bold shadow-sm transition-all flex flex-col items-center justify-center gap-2 text-xs"><CreditCard size={20} /> Log Payment</button>
                    
                    {/* ENVELOPE PRINT LETTER BUTTON */}
                    <button onClick={() => { 
                      const isHarper = selectedMember.center && selectedMember.center.toLowerCase().includes('harper'); 
                      const centerName = isHarper ? 'Harper Wellness Center' : 'Anthony Wellness Center'; 
                      const centerAddr = isHarper ? '615 W 12th St, Harper, KS 67058' : '309 W Main St, Anthony, KS 67003'; 
                      const centerPhone = isHarper ? '(620) 896-1202' : '(620) 842-5190'; 
                      const centerHours = isHarper ? 'M-F 8am-12pm &amp; 5pm-8pm, Sat 9am-noon' : 'M-F 7am-8pm, Sat 8am-1pm'; 
                      const directorName = isHarper ? 'Patrick Johnson' : 'Deanna Smithhisler'; 
                      
                      const addressBlock = selectedMember.address ? `${selectedMember.address}<br/>${selectedMember.city}, ${selectedMember.state} ${selectedMember.zip}` : 'Address not on file';

                      const w = window.open('', '_blank'); 
                      w.document.write(`<!DOCTYPE html><html><head><title>Payment Reminder - ${selectedMember.firstName} ${selectedMember.lastName}</title><style>@media print{body{margin:0}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}}body{font-family:Arial,sans-serif;color:#1e293b;margin:0}.page{max-width:680px;margin:0 auto}.hdr{background:#003d6b;padding:20px 44px;display:flex;justify-content:space-between;align-items:center}.hdr-left{display:flex;align-items:center;gap:16px}.hdr-logo{height:36px;opacity:.95}.hdr-name{font-size:18px;font-weight:700;color:#fff}.hdr-sub{font-size:10px;color:#8bb8d9;letter-spacing:1px;margin-top:2px}.accent{height:3px;background:linear-gradient(to right,#dba51f,#dd6d22)}.body{padding:32px 44px}.top-row{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px}.addr{font-size:14px;line-height:1.6}.date{font-size:12px;color:#94a3b8}.greeting{font-size:13px;margin-bottom:10px}.intro{font-size:13px;color:#475569;line-height:1.8;margin-bottom:20px}.box{border:1.5px solid #003d6b;border-radius:6px;overflow:hidden;margin-bottom:20px}.box-hdr{background:#003d6b;padding:8px 16px;font-size:10px;font-weight:700;color:#fff;letter-spacing:1.5px}.box-body{padding:2px 16px}.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0}.row:last-child{border-bottom:none}.lbl{font-size:12px;color:#64748b}.val{font-size:12px;font-weight:700;color:#003d6b}.val-due{font-size:12px;font-weight:700;color:#dd6d22}.opts{font-size:12px;color:#475569;line-height:2;margin-bottom:20px;padding-left:10px;border-left:3px solid #dba51f}.opt{padding-left:10px}.opt-b{color:#003d6b;font-weight:700}.disc{font-size:12px;color:#94a3b8;margin-bottom:24px}.sign{font-size:13px;margin-bottom:2px}.sign-name{font-size:13px;font-weight:700;color:#003d6b}.sign-title{font-size:11px;color:#94a3b8}.ftr{border-top:2px solid #003d6b;padding:10px 44px;display:flex;justify-content:space-between;align-items:center;margin-top:24px}.ftr-l{font-size:10px;color:#94a3b8}.ftr-r{font-size:10px;color:#1080ad}</style></head><body><div class="page"><div class="hdr"><div class="hdr-left"><img src="https://pattersonhc.org/sites/default/files/wellness_white.png" class="hdr-logo" /><div><div class="hdr-name">${centerName}</div><div class="hdr-sub">${centerAddr} | ${centerPhone}</div></div></div></div><div class="accent"></div><div class="body"><div class="top-row"><div class="addr"><strong>${selectedMember.firstName} ${selectedMember.lastName}</strong><br/>${addressBlock}</div><div class="date">${new Date().toLocaleDateString('en-US', {month:'long',day:'numeric',year:'numeric'})}</div></div><div class="greeting">Dear ${selectedMember.firstName},</div><div class="intro">Your wellness center membership payment is coming due. Please review the details below and make your payment at your earliest convenience.</div><div class="box"><div class="box-hdr">ACCOUNT DETAILS</div><div class="box-body"><div class="row"><span class="lbl">Member ID</span><span class="val">${selectedMember.id}</span></div><div class="row"><span class="lbl">Membership</span><span class="val">${selectedMember.type}</span></div><div class="row"><span class="lbl">Amount Due</span><span class="val-due">$${selectedMember.monthlyRate || 'See front desk'}</span></div><div class="row"><span class="lbl">Due Date</span><span class="val-due">${selectedMember.nextPayment ? new Date(selectedMember.nextPayment + 'T00:00:00').toLocaleDateString('en-US', {month:'long',day:'numeric',year:'numeric'}) : 'See front desk'}</span></div></div></div><div class="opts"><div class="opt"><span class="opt-b">In person</span> — Front desk: ${centerHours}</div><div class="opt"><span class="opt-b">By phone</span> — ${centerPhone}</div><div class="opt"><span class="opt-b">By mail</span> — ${centerAddr}</div></div><div class="disc">If you have already made your payment, please disregard this notice.</div><div class="sign">Sincerely,</div><div class="sign-name">${directorName}</div><div class="sign-title">Director, ${centerName}</div></div><div class="ftr"><span class="ftr-l">${centerName} | Harper County, KS</span><span class="ftr-r">pattersonhc.org/wellness-centers</span></div></div></body></html>`); 
                      w.document.close(); 
                      setTimeout(() => w.print(), 500); 
                    }} className="bg-slate-50 text-slate-600 hover:bg-slate-600 hover:text-white py-4 rounded-xl font-bold shadow-sm transition-all flex flex-col items-center justify-center gap-2 text-xs"><Printer size={20} /> Print Letter</button>
                    
                    <button onClick={() => handleResetPin(selectedMember)} className="bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white py-4 rounded-xl font-bold shadow-sm transition-all flex flex-col items-center justify-center gap-2 text-xs"><KeyRound size={20}/> Reset PIN</button>
                    {user?.role === 'admin' && (<button onClick={handleDeleteMember} disabled={isDeleting} className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white py-4 rounded-xl font-bold shadow-sm transition-all flex flex-col items-center justify-center gap-2 text-xs">{isDeleting ? '...' : <Trash2 size={20}/>} Delete</button>)}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {paymentModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm p-8 relative shadow-2xl">
            <button onClick={() => setPaymentModal(null)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500"><X size={20}/></button>
            <div className="text-center mb-6">
              <CreditCard size={40} className="text-[#16a34a] mx-auto mb-3" />
              <h3 className="text-xl font-black text-[#001f3f]">Log Payment</h3>
              <p className="text-sm text-slate-400 mt-1">{paymentModal.firstName} {paymentModal.lastName}</p>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Payment Method</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {['Cash', 'Check', 'Card', 'ACH'].map(m => (
                <button key={m} onClick={async () => {
                  if (!window.confirm(`Log ${m} payment for ${paymentModal.firstName} ${paymentModal.lastName}?`)) return;
                  try {
                    const res = await fetch('/api/log-payment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ airtableId: paymentModal.airtableId, memberName: `${paymentModal.firstName} ${paymentModal.lastName}`, method: m, currentDueDate: paymentModal.nextPayment }) });
                    const result = await res.json();
                    if (result.success) {
                      setMembers(prev => prev.map(mem => mem.airtableId === paymentModal.airtableId ? { ...mem, status: 'ACTIVE', nextPayment: result.nextPaymentDue } : mem));
                      if (selectedMember && selectedMember.airtableId === paymentModal.airtableId) { setSelectedMember({ ...selectedMember, status: 'ACTIVE', nextPayment: result.nextPaymentDue }); }
                      setPaymentModal(null);
                      alert(`Payment logged! Next payment due: ${result.nextPaymentDue}`);
                    } else { alert('Error: ' + result.error); }
                  } catch (err) { alert('Network error. Please try again.'); }
                }} className="bg-slate-50 hover:bg-[#16a34a] hover:text-white text-[#001f3f] font-bold py-4 rounded-xl border border-slate-200 transition-all text-sm">{m}</button>
              ))}
            </div>
            <button onClick={() => setPaymentModal(null)} className="w-full text-slate-400 text-sm font-bold hover:text-slate-600">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
