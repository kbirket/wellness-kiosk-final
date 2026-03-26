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
  const [isScanning, setIsScanning] = useState(false);
  
  const [reportMonth, setReportMonth] = useState(() => {
    const now = new Date();
    return `${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
  });
  
  const [usageBasedCorps, setUsageBasedCorps] = useState(() => { try { return JSON.parse(localStorage.getItem('wellnessUsagePrefs')) || {}; } catch(e) { return {}; } });
  const [expandedCorpId, setExpandedCorpId] = useState(null);
  const [editingCorp, setEditingCorp] = useState(null);
  const [corpPaymentModal, setCorpPaymentModal] = useState(null);
  
  const [showAddVisitorModal, setShowAddVisitorModal] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberPinStep, setMemberPinStep] = useState(null);
  const [memberPinInput, setMemberPinInput] = useState('');
  const [memberLoginError, setMemberLoginError] = useState('');
  const [helpSearch, setHelpSearch] = useState('');
  const [kioskStaffMenu, setKioskStaffMenu] = useState(false);
  const [editingVisitor, setEditingVisitor] = useState(null);
  const [corpSearch, setCorpSearch] = useState('');

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
    if (['MILITARY', 'MILITARY FAMILY', 'HD6', 'HD6 FAMILY', 'FIRST DAY FREE'].includes(p)) return 0;
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
      console.log('[Wellness Hub] Corporate Partners raw:', data.records?.length, 'records', data.records?.map(r => r.fields['Company Name']));
      if (data.records) { setCorporatePartners(data.records.map(r => { const rawName = r.fields['Company Name']; const name = Array.isArray(rawName) ? rawName[0] : (rawName || ''); const rawMatch = r.fields['Sponsor Match']; const sponsorMatch = Array.isArray(rawMatch) ? rawMatch[0] : (rawMatch || name); return { id: r.id, name: String(name).trim(), sponsorMatch: String(sponsorMatch).trim(), contactName: r.fields['Contact Name'] || '', contactEmail: r.fields['Contact Email'] || '', paidMonths: r.fields['Paid Months'] || '', address: r.fields['Street Address'] || '', city: r.fields['City'] || '', state: r.fields['State'] || 'KS', zip: r.fields['Zip'] || '' }; }).filter(p => p.name).sort((a,b) => a.name.localeCompare(b.name))); }
    }).catch(() => {});
    fetch('/api/get-visitors').then(res => res.json()).then(data => {
      if (data.records) {
        setVisitors(data.records.map(r => ({
          airtableId: r.id, firstName: r.fields['First Name'] || '', lastName: r.fields['Last Name'] || '', email: r.fields['Email'] || '', phone: r.fields['Phone'] || '', passType: r.fields['Pass Type'] || '', amountPaid: r.fields['Amount Paid'] || 0, referringProvider: r.fields['Referring Provider'] || '', purchaseDate: r.fields['Purchase Date'] || '', expirationDate: r.fields['Expiration Date'] || '', center: r.fields['Center'] || '', pin: r.fields['PIN'] || '', orientationComplete: !!r.fields['Orientation Complete'], totalVisits: r.fields['Total Visits'] || 0, address: r.fields['Street Address'] || '', city: r.fields['City'] || '', state: r.fields['State'] || '', zip: r.fields['Zip'] || '', notes: r.fields['Notes'] || '', passActivated: r.fields['Pass Activated'] !== false && r.fields['Pass Activated'] !== 'false',
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
          return { airtableId: r.id, id: r.fields['Member ID'] || r.id, firstName: r.fields['First Name'] || 'Unknown', lastName: r.fields['Last Name'] || '', email: r.fields['Email'] || '', phone: r.fields['Phone'] || '', password: finalPassword, status: (r.fields['Membership Status'] || 'ACTIVE').toUpperCase(), type: String(planText).toUpperCase().trim(), center: r.fields['Home Center'] || 'Anthony', visits: Number(r.fields['Total Visits'] || 0), nextPayment: r.fields['Next Payment Due'] || null, sponsor: !!r.fields['Corporate Sponsor'], sponsorName: r.fields['Corporate Sponsor'] ? String(r.fields['Corporate Sponsor']).trim() : '', needsOrientation: !!r.fields['Needs Orientation'], familyName: r.fields['Family Name'] ? (Array.isArray(r.fields['Family Name']) ? r.fields['Family Name'][0] : r.fields['Family Name']) : '', billingMethod: r.fields['Billing Method'] || '', monthlyRate: r.fields['Monthly Rate'] || '', access247: !!r.fields['24/7 Access'], badgeNumber: r.fields['Badge Number'] || '', startDate: r.fields['Start Date'] || null, notes: r.fields['Notes'] || '', discountCode: r.fields['Discount Code'] || '', discountExpiration: r.fields['Discount Expiration'] || null, address: r.fields['Street Address'] || '', city: r.fields['City'] || '', state: r.fields['State'] || 'KS', zip: r.fields['Zip'] || '', paymentMethod: Array.isArray(r.fields['Payment Method']) ? r.fields['Payment Method'][r.fields['Payment Method'].length - 1] : (r.fields['Payment Method'] || '') };
        });
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
  const visitorMatches = kioskInput.length >= 2 ? visitors.filter(v => { const today = new Date(); const exp = new Date(v.expirationDate + 'T23:59:59'); return exp >= today && v.orientationComplete && v.passActivated && (v.firstName + ' ' + v.lastName).toLowerCase().includes(kioskInput.toLowerCase()); }).slice(0, 2) : [];
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
      staff: scopedMembers.filter(m => m.type.includes('HD6')).length, 
      military: scopedMembers.filter(m => m.type.includes('MILITARY')).length 
  };
  
  const planChartData = [{label:'Single',value:reportStats.single,color:'#1080ad'},{label:'Family',value:reportStats.family,color:'#f59e0b'},{label:'Senior',value:reportStats.senior+reportStats.seniorFamily,color:'#16a34a'},{label:'Student',value:reportStats.student,color:'#8b5cf6'},{label:'Corporate',value:reportStats.corporate+reportStats.corporateFamily,color:'#ef4444'},{label:'Other (Staff/Mil/Pass)',value:reportStats.staff+reportStats.military+reportStats.dayPass,color:'#64748b'}];
  const statusChartData = [{label:'Active',value:stats.active,color:'#16a34a'},{label:'Expiring Soon',value:stats.expiring,color:'#f59e0b'},{label:'Overdue / Locked',value:stats.overdue,color:'#ef4444'}];
  const familyMembers = activeMember ? members.filter(m => m.id !== activeMember.id && ((m.email && m.email.toLowerCase() === activeMember.email.toLowerCase()) || (m.phone && m.phone === activeMember.phone))) : [];

  const handleUpdateProfile = async () => { setIsUpdating(true); const newEmail = document.getElementById('edit_email').value.trim(); const newPhone = document.getElementById('edit_phone').value.trim(); setActiveMember({...activeMember, email: newEmail, phone: newPhone}); setEditMode(false); try { await fetch('/api/update-member', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ airtableId: activeMember.airtableId, email: newEmail, phone: newPhone }) }); } catch (err) { alert("App updated locally."); } setIsUpdating(false); };

  const handleAddMemberSubmit = async (e) => {
    e.preventDefault(); setIsAdding(true); setNewMemberPin(null);
    const firstName = e.target.fname.value; const lastName = e.target.lname.value; const email = e.target.email.value; const phone = e.target.phone.value; const plan = e.target.plan.value; const center = e.target.center.value;
    const needsOrientation = e.target.orientation?.checked || false; const isFamily = plan.includes('FAMILY'); const isCorporate = plan.includes('CORPORATE') || plan.includes('HD6');
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
        fetch('/api/get-visitors').then(r => r.json()).then(data => { if (data.records) setVisitors(data.records.map(r => ({ airtableId: r.id, firstName: r.fields['First Name'] || '', lastName: r.fields['Last Name'] || '', email: r.fields['Email'] || '', phone: r.fields['Phone'] || '', passType: r.fields['Pass Type'] || '', amountPaid: r.fields['Amount Paid'] || 0, referringProvider: r.fields['Referring Provider'] || '', purchaseDate: r.fields['Purchase Date'] || '', expirationDate: r.fields['Expiration Date'] || '', center: r.fields['Center'] || '', pin: r.fields['PIN'] || '', orientationComplete: !!r.fields['Orientation Complete'], totalVisits: r.fields['Total Visits'] || 0, address: r.fields['Street Address'] || '', city: r.fields['City'] || '', state: r.fields['State'] || '', zip: r.fields['Zip'] || '', notes: r.fields['Notes'] || '', passActivated: r.fields['Pass Activated'] !== false && r.fields['Pass Activated'] !== 'false' }))); });
      }
    } catch (err) { alert('Renewal failed.'); }
  };

  const handleDeleteMember = async () => { if (!user || user.role !== 'admin') { alert('Only System Admins can delete members.'); return; } if (!window.confirm(`Permanently delete ${selectedMember.firstName} ${selectedMember.lastName}?`)) return; setIsDeleting(true); try { const res = await fetch('/api/delete-member', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ airtableId: selectedMember.airtableId }) }); const result = await res.json(); if (result.success) { setMembers(prev => prev.filter(m => m.airtableId !== selectedMember.airtableId)); setSelectedMember(null); } else { alert('Error: ' + result.error); } } catch (err) { alert('Network error.'); } setIsDeleting(false); };
  const handleResetPin = async (member) => { if (!window.confirm(`Reset PIN for ${member.firstName} ${member.lastName}?`)) return; try { const newPin = String(Math.floor(1000 + Math.random() * 9000)); await fetch('/api/update-pin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ recordId: member.airtableId, newPin }) }); setMembers(prev => prev.map(m => m.airtableId === member.airtableId ? { ...m, password: newPin } : m)); alert(`New PIN for ${member.firstName}: ${newPin}\n\nPlease give this to the member.`); } catch (err) { alert('Could not reset PIN.'); } };
  const getStoplight = (member) => { if (!member.nextPayment) return 'green'; const due = new Date(member.nextPayment + 'T00:00:00'); const today = new Date(); const diffMs = today - due; const daysPastDue = Math.ceil(diffMs / (1000*60*60*24)); const daysUntilDue = Math.ceil((due - today) / (1000*60*60*24)); if (daysPastDue > 2) return 'red'; if (daysUntilDue <= 5) return 'yellow'; return 'green'; };

  const processCheckIn = async (memberId, method = "Manual Entry") => { const id = memberId.toUpperCase().trim(); const m = membersRef.current.find(m => m.id === id); if(m) { if (m.needsOrientation) { setKioskMessage({ text: 'Orientation Required', type: 'error', subtext: 'Please see front desk to complete your orientation.' }); setTimeout(() => setKioskMessage({ text: '', type: '', subtext: '' }), 5000); return false; } const light = getStoplight(m); if (light === 'red') { setKioskMessage({ text: 'Please see front desk.', type: 'error', subtext: 'We need to quickly update your account.' }); setTimeout(() => setKioskMessage({ text: '', type: '', subtext: '' }), 4500); return false; } const currentCenter = centerRef.current; const scanCenter = currentCenter === 'both' ? m.center : currentCenter.charAt(0).toUpperCase() + currentCenter.slice(1); const currentTime = new Date().toISOString(); try { const res = await fetch('/api/visits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ airtableId: m.airtableId, center: scanCenter, time: currentTime, method: method }) }); const result = await res.json(); if (!result.success) { setKioskMessage({ text: 'System Error', type: 'error', subtext: 'Please see the front desk.' }); setTimeout(() => setKioskMessage({ text: '', type: '', subtext: '' }), 4000); return false; } setVisits(prev => [{name: m.firstName + ' ' + m.lastName, center: scanCenter, time: currentTime, type: m.type, method: method}, ...prev]); setMembers(prev => prev.map(member => member.id === id ? { ...member, visits: member.visits + 1 } : member)); if (activeMember && activeMember.id === id) setActiveMember(prev => ({...prev, visits: prev.visits + 1})); if (light === 'yellow') { setKioskMessage({ text: `Welcome, ${m.firstName}!`, type: 'warning', subtext: 'Please see the front desk at your convenience.' }); } else { setKioskMessage({ text: `Welcome, ${m.firstName}!`, type: 'success', subtext: '' }); } setTimeout(() => setKioskMessage({ text: '', type: '', subtext: '' }), 5000); return true; } catch (err) { setKioskMessage({ text: 'Network Error', type: 'error', subtext: 'Please try again.' }); setTimeout(() => setKioskMessage({ text: '', type: '', subtext: '' }), 4000); return false; } } else { setKioskMessage({ text: 'ID not found.', type: 'error', subtext: 'Please see front desk.' }); setTimeout(() => setKioskMessage({ text: '', type: '', subtext: '' }), 3500); return false; } };

  const processVisitorCheckIn = async (visitor) => {
    const currentCenter = centerRef.current;
    const scanCenter = currentCenter === 'both' ? (visitor.center || 'Anthony') : currentCenter.charAt(0).toUpperCase() + currentCenter.slice(1);
    try {
      const res = await fetch('/api/visitor-checkin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ visitorAirtableId: visitor.airtableId, center: scanCenter }) });
      const result = await res.json();
      if (result.success) {
        setVisitors(prev => prev.map(v => v.airtableId === visitor.airtableId ? { ...v, totalVisits: (v.totalVisits || 0) + 1 } : v));
        setVisits(prev => [{ name: visitor.firstName + ' ' + visitor.lastName, center: scanCenter, time: new Date().toISOString(), type: 'VISITOR - ' + (visitor.passType || 'Pass'), method: 'Kiosk Search' }, ...prev]);
        setKioskMessage({ text: `Welcome, ${visitor.firstName}!`, type: 'success', subtext: '' });
        setTimeout(() => setKioskMessage({ text: '', type: '', subtext: '' }), 5000);
      } else {
        setKioskMessage({ text: 'Check-in Error', type: 'error', subtext: result.error || 'Please see the front desk.' });
        setTimeout(() => setKioskMessage({ text: '', type: '', subtext: '' }), 4500);
      }
    } catch (err) {
      setKioskMessage({ text: 'Network Error', type: 'error', subtext: 'Please try again.' });
      setTimeout(() => setKioskMessage({ text: '', type: '', subtext: '' }), 4000);
    }
  };

  useEffect(() => { let scanner = null; if (view === 'secret_scanner' && scannerActive) { scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: {width: 280, height: 280} }, false); scanner.render((decodedText) => { processCheckIn(decodedText, "Camera Scan"); }, () => {}); } return () => { if(scanner) scanner.clear().catch(e => console.error(e)); }; }, [view, scannerActive]);

// --- QR SCANNER ENGINE FOR KIOSK ---
  useEffect(() => {
    let scanner = null;
    if (view === 'kiosk' && isScanning) {
      const timer = setTimeout(() => {
        scanner = new Html5QrcodeScanner("reader", { 
          fps: 20, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true 
        }, false);
        scanner.render((decodedText) => {
          processCheckIn(decodedText, "Kiosk Camera");
          setIsScanning(false);
          if (scanner) { scanner.clear().catch(error => console.error("Failed to clear scanner", error)); }
        }, (error) => {});
      }, 300);
      return () => clearTimeout(timer);
    }
    return () => { if (scanner) { scanner.clear().catch(error => console.error("Scanner cleanup error", error)); } };
  }, [view, isScanning]);

  const handleExportCSV = () => { if (filteredMembers.length === 0) return; const headers = ["Member ID","First Name","Last Name","Email","Phone","Membership Type","Home Center","Status","Total Visits","Next Payment","Sponsor"]; const csvRows = [headers.join(','), ...filteredMembers.map(m => `"${m.id}","${m.firstName}","${m.lastName}","${m.email}","${m.phone}","${m.type}","${m.center}","${m.status}","${m.visits}","${m.nextPayment}","${m.sponsorName}"`)].join('\n'); const blob = new Blob([csvRows], { type: 'text/csv' }); const url = window.URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `Wellness_Members_${new Date().toISOString().slice(0,10)}.csv`; a.click(); window.URL.revokeObjectURL(url); };
  
  const ProStatCard = ({ value, label, color }) => (<div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 print:shadow-none print:border-slate-300" style={{ borderLeft: `6px solid ${color}` }}><p className="text-5xl font-extrabold mb-1 print:text-3xl" style={{ color }}>{value}</p><p className="text-xs font-bold text-[#001f3f] uppercase tracking-tight print:text-[10px]">{label}</p></div>);
  const ProListCard = ({ title, children, actions }) => (<div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 h-full print:h-auto print:p-4 print:shadow-none print:border-slate-300 print:break-inside-avoid"><div className="flex justify-between items-center mb-6 print:mb-2"><h3 className="text-lg font-bold text-[#001f3f] print:text-base">{title}</h3>{actions}</div>{children}</div>);

  // --- MINI BAR CHART FOR REPORTS ---
  const MiniBarChart = ({ data, maxVal }) => {
    const peak = maxVal || Math.max(...data.map(d => d.value), 1);
    return (
      <div className="flex items-end gap-1.5 h-28">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
            <span className="text-[9px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">{d.value}</span>
            <div className="w-full rounded-t-md transition-all duration-500" style={{ height: `${Math.max(4, (d.value / peak) * 100)}%`, backgroundColor: d.color || '#1080ad' }}></div>
            <span className="text-[9px] font-bold text-slate-400 truncate w-full text-center">{d.label}</span>
          </div>
        ))}
      </div>
    );
  };

  // --- HORIZONTAL PROGRESS BAR ---
  const ProgressBar = ({ value, max, color = '#1080ad', label }) => {
    const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
    return (
      <div className="space-y-1">
        {label && <div className="flex justify-between text-xs"><span className="font-bold text-slate-500">{label}</span><span className="font-black text-[#001f3f]">{value} / {max}</span></div>}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }}></div>
        </div>
      </div>
    );
  };

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

  if (view === 'member_login') {
    const searchResults = memberSearch.length >= 2 ? members.filter(m => (m.firstName + ' ' + m.lastName).toLowerCase().includes(memberSearch.toLowerCase()) || m.id.toLowerCase().includes(memberSearch.toLowerCase())).slice(0, 5) : [];
    return (
      <div className="min-h-screen bg-[#001f3f] flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-[3rem] shadow-2xl p-12 w-full max-w-md border-t-8 border-[#16a34a]">
          <div className="flex justify-center mb-6"><UserCircle size={64} className="text-[#16a34a]" /></div>
          <h2 className="text-4xl font-black text-center text-slate-900 mb-2 tracking-tight">Member Portal</h2>
          <p className="text-slate-400 mb-10 text-center font-medium tracking-tight">View your membership details.</p>
          {!memberPinStep ? (
            <div>
              <input type="text" placeholder="Search your name or Member ID" value={memberSearch} onChange={(e) => { setMemberSearch(e.target.value); setMemberLoginError(''); }} className="w-full p-5 bg-slate-100 rounded-2xl mb-2 outline-none border-2 border-transparent focus:border-[#16a34a]/40 text-lg" />
              {searchResults.length > 0 && (
                <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden mb-4">
                  {searchResults.map(m => (
                    <button key={m.id} onClick={() => { setMemberPinStep(m); setMemberPinInput(''); setMemberLoginError(''); }} className="w-full p-4 text-left border-b border-slate-100 last:border-0 hover:bg-[#16a34a]/5 flex justify-between items-center transition-all">
                      <div>
                        <span className="font-bold text-[#001f3f]">{m.firstName} {m.lastName}</span>
                        <span className="text-xs text-slate-400 ml-2">{m.id}</span>
                      </div>
                      <ChevronRight size={16} className="text-slate-300" />
                    </button>
                  ))}
                </div>
              )}
              {memberSearch.length >= 2 && searchResults.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">No members found.</p>
              )}
            </div>
          ) : (
            <div>
              <div className="bg-[#16a34a]/5 rounded-2xl p-4 mb-6 text-center">
                <p className="text-lg font-bold text-[#001f3f]">{memberPinStep.firstName} {memberPinStep.lastName}</p>
                <p className="text-xs text-slate-400">{memberPinStep.id}</p>
              </div>
              <input type="password" placeholder="Enter your 4-digit PIN" maxLength={4} value={memberPinInput} onChange={(e) => {
                const val = e.target.value;
                setMemberPinInput(val);
                setMemberLoginError('');
                if (val.length === 4) {
                  if (val === memberPinStep.password) {
                    setActiveMember(memberPinStep);
                    setView('member_portal');
                    setMemberPinInput('');
                    setMemberSearch('');
                    setMemberPinStep(null);
                  } else {
                    setMemberLoginError('Incorrect PIN. Please try again.');
                    setMemberPinInput('');
                  }
                }
              }} className="w-full p-5 bg-slate-100 rounded-2xl mb-4 outline-none border-2 border-transparent focus:border-[#16a34a]/40 text-lg text-center tracking-[0.3em]" autoFocus />
              {memberLoginError && <p className="text-red-500 text-sm text-center mb-4 font-bold">{memberLoginError}</p>}
              <button onClick={() => { setMemberPinStep(null); setMemberPinInput(''); setMemberLoginError(''); }} className="w-full text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors">Back to Search</button>
            </div>
          )}
          <button onClick={() => { setView('landing'); setMemberSearch(''); setMemberPinStep(null); setMemberPinInput(''); setMemberLoginError(''); }} className="w-full mt-6 text-slate-400 font-bold hover:text-slate-600 transition-colors">Return to Home</button>
        </div>
      </div>
    );
  }

  if (view === 'member_portal' && activeMember) {
    const memberVisits = visits.filter(v => v.name === (activeMember.firstName + ' ' + activeMember.lastName));
    const recentVisits = memberVisits.slice(0, 10);
    const light = getStoplight(activeMember);
    const statusColor = light === 'green' ? '#16a34a' : light === 'yellow' ? '#f59e0b' : '#ef4444';
    const statusLabel = light === 'green' ? 'Good Standing' : light === 'yellow' ? 'Payment Due Soon' : 'Please See Front Desk';
    const currentMember = members.find(m => m.id === activeMember.id) || activeMember;
    return (
      <div className="min-h-screen bg-[#f0f2f5] font-sans">
        <div className="bg-[#001f3f] text-white px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src={LOGO_URL} alt="Logo" className="h-8 opacity-90" />
            <div>
              <p className="font-bold text-lg leading-none">{currentMember.firstName} {currentMember.lastName}</p>
              <p className="text-white/50 text-xs">{currentMember.id}</p>
            </div>
          </div>
          <button onClick={() => { setActiveMember(null); setView('landing'); }} className="flex items-center gap-2 text-white/50 hover:text-white text-sm font-bold transition-colors"><LogOut size={16} /> Sign Out</button>
        </div>
        <div className="max-w-4xl mx-auto p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200" style={{ borderLeft: '6px solid ' + statusColor }}>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Account Status</p>
              <p className="text-2xl font-black" style={{ color: statusColor }}>{statusLabel}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200" style={{ borderLeft: '6px solid #1080ad' }}>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Visits</p>
              <p className="text-4xl font-black text-[#1080ad]">{currentMember.visits}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200" style={{ borderLeft: '6px solid #8b5cf6' }}>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Membership</p>
              <p className="text-xl font-black text-[#001f3f]">{currentMember.type}</p>
              <p className="text-xs text-slate-400 mt-1">{currentMember.billingMethod || 'Month-to-Month'}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-[#001f3f] mb-6">My Details</h3>
              <div className="space-y-4">
                <div className="flex justify-between border-b border-slate-50 pb-3"><span className="text-sm text-slate-400 font-bold">Member ID</span><span className="text-sm font-bold text-[#001f3f]">{currentMember.id}</span></div>
                <div className="flex justify-between border-b border-slate-50 pb-3"><span className="text-sm text-slate-400 font-bold">Home Center</span><span className="text-sm font-bold text-[#001f3f]">{currentMember.center}</span></div>
                <div className="flex justify-between border-b border-slate-50 pb-3"><span className="text-sm text-slate-400 font-bold">Email</span><span className="text-sm font-bold text-[#001f3f]">{currentMember.email || 'Not on file'}</span></div>
                <div className="flex justify-between border-b border-slate-50 pb-3"><span className="text-sm text-slate-400 font-bold">Phone</span><span className="text-sm font-bold text-[#001f3f]">{currentMember.phone || 'Not on file'}</span></div>
                {currentMember.nextPayment && <div className="flex justify-between border-b border-slate-50 pb-3"><span className="text-sm text-slate-400 font-bold">Next Payment</span><span className="text-sm font-bold" style={{ color: statusColor }}>{new Date(currentMember.nextPayment + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span></div>}
                {currentMember.sponsorName && <div className="flex justify-between border-b border-slate-50 pb-3"><span className="text-sm text-slate-400 font-bold">Corporate Sponsor</span><span className="text-sm font-bold text-[#001f3f]">{currentMember.sponsorName}</span></div>}
                {currentMember.startDate && <div className="flex justify-between pb-3"><span className="text-sm text-slate-400 font-bold">Member Since</span><span className="text-sm font-bold text-[#001f3f]">{new Date(currentMember.startDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span></div>}
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-[#001f3f] mb-6">My QR Badge</h3>
              <div className="flex flex-col items-center">
                <QRCode data={currentMember.id} size={180} />
                <p className="mt-4 text-xs text-slate-400 font-bold">Scan at the kiosk for quick check-in</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-[#001f3f] mb-6">Recent Visits</h3>
            {recentVisits.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No visits recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {recentVisits.map((v, i) => (
                  <div key={i} className="flex justify-between items-center border-b border-slate-50 pb-3 last:border-0">
                    <div className="flex items-center gap-3">
                      <CheckCircle size={16} className="text-[#16a34a]" />
                      <span className="text-sm font-bold text-[#001f3f]">{v.center}</span>
                    </div>
                    <span className="text-xs text-slate-400 font-bold">{new Date(v.time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {new Date(v.time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* --- PUBLIC KIOSK VIEW --- */
  if (view === 'kiosk') {
    const kioskMemberMatches = kioskInput.length >= 2 ? members.filter(m => (m.firstName + ' ' + m.lastName).toLowerCase().includes(kioskInput.toLowerCase()) || m.id.toLowerCase().includes(kioskInput.toLowerCase())).slice(0, 4) : [];
    const kioskVisitorMatches = kioskInput.length >= 2 ? visitors.filter(v => { const today = new Date(); const exp = new Date(v.expirationDate + 'T23:59:59'); return exp >= today && v.orientationComplete && v.passActivated && (v.firstName + ' ' + v.lastName).toLowerCase().includes(kioskInput.toLowerCase()); }).slice(0, 2) : [];
    const allKioskMatches = [...kioskMemberMatches.map(m => ({...m, _type: 'member'})), ...kioskVisitorMatches.map(v => ({...v, _type: 'visitor'}))];
    const isHarper = viewingCenter === 'harper';
    const centerColor = isHarper ? '#dd6d22' : '#1080ad';
    const centerColorLight = isHarper ? '#f59e0b' : '#1080ad';
    const centerName = isHarper ? 'Harper' : 'Anthony';
    const centerAddress = isHarper ? '615 W 12th St, Harper, KS 67058' : '309 W Main St, Anthony, KS 67003';
    
    return (
      <div className="fixed inset-0 bg-[#001f3f] z-[100] flex flex-col font-sans overflow-hidden text-slate-900">
        <style>{`
          @keyframes scan { 0% { top: 0%; opacity: 0.3; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0.3; } }
          .animate-scan {
            position: absolute;
            left: 0;
            width: 100%;
            height: 6px;
            background: linear-gradient(to bottom, transparent, #1080ad, transparent);
            box-shadow: 0 0 20px #1080ad;
            animation: scan 2.5s ease-in-out infinite;
            z-index: 50;
          }
        `}</style>

        {viewingCenter === 'both' ? (
          /* CENTER SELECTION SPLASH */
          <div className="flex-1 flex flex-col">
            <div className="h-16 flex items-center justify-between px-8 shrink-0">
              <img src={LOGO_URL} alt="Logo" className="h-6 opacity-50" />
              <button onClick={() => { const pw = prompt("Staff Auth Required:"); if (pw === "2026") { setView('landing'); } else if (pw !== null) { alert("Access Denied"); } }} className="text-white/15 hover:text-white/60 p-2 transition-all"><X size={22} /></button>
            </div>
            <div className="flex-1 flex flex-col md:flex-row p-6 pt-2 gap-6">
              <button onClick={() => setViewingCenter('harper')} className="flex-1 group relative overflow-hidden rounded-[2.5rem] transition-all duration-500 hover:scale-[1.005]">
                <div className="absolute inset-0 bg-gradient-to-br from-[#f59e0b] to-[#dd6d22] opacity-85 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 p-16 flex flex-col items-center justify-center h-full text-white text-center">
                  <h2 className="text-7xl font-black tracking-tighter leading-tight text-white">HARPER</h2>
                  <p className="text-2xl font-light tracking-[0.25em] uppercase opacity-70 mt-2">Wellness Center</p>
                  <div className="mt-14 px-12 py-5 bg-white text-[#dd6d22] rounded-full font-black text-xl tracking-wide">TOUCH TO START</div>
                </div>
              </button>
              <button onClick={() => setViewingCenter('anthony')} className="flex-1 group relative overflow-hidden rounded-[2.5rem] transition-all duration-500 hover:scale-[1.005]">
                <div className="absolute inset-0 bg-gradient-to-br from-[#1080ad] to-[#003d6b] opacity-85 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 p-16 flex flex-col items-center justify-center h-full text-white text-center">
                  <h2 className="text-7xl font-black tracking-tighter leading-tight text-white">ANTHONY</h2>
                  <p className="text-2xl font-light tracking-[0.25em] uppercase opacity-70 mt-2">Wellness Center</p>
                  <div className="mt-14 px-12 py-5 bg-white text-[#003d6b] rounded-full font-black text-xl tracking-wide">TOUCH TO START</div>
                </div>
              </button>
            </div>
          </div>
        ) : (
          /* CHECK-IN SCREEN — SPLIT LAYOUT */
          <div className="flex-1 flex">
            {/* Left panel — center branding */}
            <div className="w-[42%] flex flex-col items-center justify-between p-10" style={{ background: 'linear-gradient(180deg, #0a3158, #001f3f)', borderRight: `4px solid ${centerColor}` }}>
              <img src={LOGO_URL} alt="Logo" className="h-8 opacity-40" />
              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-[0.4em] mb-3" style={{ color: centerColor }}>Welcome to</p>
                <h1 className="text-5xl font-black text-white tracking-tight leading-[1.05]">{centerName}<br/>Wellness<br/>Center</h1>
                <p className="text-white/20 text-xs mt-4 leading-relaxed">{centerAddress}</p>
              </div>
              <button onClick={() => { const pw = prompt("Staff Auth Required:"); if (pw === "2026") { setKioskStaffMenu(true); } else if (pw !== null) { alert("Access Denied"); } }} className="flex items-center gap-2 text-white/10 hover:text-white/40 transition-all text-xs">
                <Lock size={12} /> <span className="font-bold tracking-wider uppercase">Staff</span>
              </button>
            </div>

            {/* Right panel — check-in area */}
            <div className="flex-1 bg-[#f5f6f8] flex flex-col items-center justify-center px-10 py-8 relative">
              <p className="text-xs font-black text-slate-400 uppercase tracking-[0.25em] mb-8">Check in</p>
              
              {/* Search input */}
              <div className="w-full max-w-md relative">
                <div className="bg-white border-2 border-slate-200 rounded-2xl px-7 py-5 flex items-center gap-4 focus-within:border-slate-400 transition-colors shadow-sm">
                  <Search size={22} className="text-slate-300 shrink-0" />
                  <input className="w-full bg-transparent text-xl font-bold outline-none text-[#001f3f] placeholder-slate-300" placeholder="Type your name..." value={kioskInput} onChange={(e) => setKioskInput(e.target.value)} />
                </div>
                {allKioskMatches.length > 0 && (
                  <div className="absolute top-full mt-3 left-0 right-0 bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden z-50">
                    {allKioskMatches.map((m, idx) => (
                      <button key={m._type + '-' + (m.airtableId || m.id || idx)} onClick={() => { setPinModal({...m, _kioskType: m._type}); setKioskInput(''); }} className="w-full px-7 py-4 text-left border-b border-slate-100 last:border-0 hover:bg-slate-50 flex justify-between items-center group transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-black text-[#001f3f] group-hover:text-[#1080ad] transition-colors">{m.firstName} {m.lastName}</span>
                          {m._type === 'visitor' && <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-[9px] font-black uppercase tracking-wider">Visitor</span>}
                        </div>
                        <ChevronRight size={18} className="text-slate-200 group-hover:text-slate-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 my-6">
                <div className="h-px w-12 bg-slate-200"></div>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.15em]">or</span>
                <div className="h-px w-12 bg-slate-200"></div>
              </div>

              {/* Scan button */}
              <button onClick={() => setIsScanning(true)} className="bg-[#001f3f] text-white px-8 py-4 rounded-xl font-bold text-sm tracking-wider uppercase flex items-center gap-3 hover:bg-[#002d5a] transition-colors shadow-md">
                <Camera size={20} /> Scan Badge
              </button>

              {/* Success/Error message */}
              {kioskMessage.text && (
                <div className={`mt-8 px-8 py-4 rounded-xl text-lg font-black ${kioskMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : kioskMessage.type === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {kioskMessage.text}
                  {kioskMessage.subtext && <span className="block text-xs font-bold mt-1 opacity-70">{kioskMessage.subtext}</span>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STAFF MENU OVERLAY */}
        {kioskStaffMenu && (
          <div className="fixed inset-0 bg-[#001f3f]/95 backdrop-blur-xl z-[250] flex items-center justify-center p-6">
            <div className="bg-white rounded-[2.5rem] p-12 w-full max-w-sm text-center shadow-2xl">
              <ShieldCheck size={40} className="text-[#dba51f] mx-auto mb-4" />
              <h3 className="text-2xl font-black text-[#001f3f] mb-2">Staff Menu</h3>
              <p className="text-sm text-slate-400 mb-8">What would you like to do?</p>
              <div className="space-y-3">
                <button onClick={() => { setKioskStaffMenu(false); setViewingCenter('both'); }} className="w-full bg-[#1080ad] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#0d6d94] transition-colors">Switch Center</button>
                <button onClick={() => { setKioskStaffMenu(false); setView('landing'); setViewingCenter('both'); }} className="w-full bg-[#001f3f] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#002d5a] transition-colors">Main Menu</button>
                <button onClick={() => setKioskStaffMenu(false)} className="w-full text-slate-400 py-3 font-bold hover:text-slate-600 transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* SCANNER OVERLAY */}
        {isScanning && (
          <div className="fixed inset-0 bg-[#001226]/95 backdrop-blur-2xl z-[200] flex flex-col items-center justify-center p-6">
            <button onClick={() => setIsScanning(false)} className="absolute top-10 right-10 text-white/20 hover:text-white"><X size={60} /></button>
            <div className="mb-12 text-center">
              <h2 className="text-white text-4xl font-black mb-4 tracking-[0.2em] uppercase">Badge Scanner</h2>
              <p className="text-[#1080ad] font-bold tracking-widest animate-pulse uppercase text-sm">Align QR Code within the markers</p>
            </div>
            <div className="relative w-full max-w-xl aspect-square bg-black/40 rounded-[5rem] overflow-hidden border-2 border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
               <div id="reader" className="w-full h-full scale-110"></div>
               <div className="animate-scan"></div>
            </div>
            <button onClick={() => setIsScanning(false)} className="mt-16 text-white/40 font-black text-xl uppercase tracking-[0.3em]">Cancel Scan</button>
          </div>
        )}

        {/* PIN VERIFICATION */}
        {pinModal && (
          <div className="fixed inset-0 bg-[#001f3f]/98 backdrop-blur-3xl z-[300] flex items-center justify-center p-6">
            <div className={`bg-white rounded-[3rem] p-14 w-full max-w-xl text-center shadow-2xl border-t-[8px] ${pinModal._kioskType === 'visitor' ? 'border-[#8b5cf6]' : 'border-[#1080ad]'}`}>
              <h2 className="text-4xl font-black text-slate-900 mb-10 tracking-tight uppercase">Verify PIN</h2>
              <p className="text-2xl font-bold text-slate-400 mb-2 uppercase tracking-widest">Hello, {pinModal.firstName}!</p>
              {pinModal._kioskType === 'visitor' && <p className="text-sm font-black text-purple-500 mb-8 uppercase tracking-widest">Visitor Pass</p>}
              {pinModal._kioskType !== 'visitor' && <div className="mb-8"></div>}
              <input type="password" maxLength={4} autoFocus className={`w-full p-7 bg-slate-50 rounded-2xl text-center text-7xl tracking-[0.4em] font-black mb-10 outline-none border-4 border-slate-100 text-slate-900 ${pinModal._kioskType === 'visitor' ? 'focus:border-[#8b5cf6]' : 'focus:border-[#1080ad]'}`}
                onChange={(e) => {
                  if (e.target.value.length === 4) {
                    const enteredPin = e.target.value;
                    if (pinModal._kioskType === 'visitor') {
                      if (enteredPin === pinModal.pin) {
                        processVisitorCheckIn(pinModal);
                        setPinModal(null);
                      } else { alert("Incorrect PIN"); e.target.value = ''; }
                    } else {
                      if (enteredPin === pinModal.password) { processCheckIn(pinModal.id, "Kiosk Search"); setPinModal(null); }
                      else { alert("Incorrect PIN"); e.target.value = ''; }
                    }
                  }
                }} 
              />
              <button onClick={() => setPinModal(null)} className="text-slate-300 font-black text-lg uppercase tracking-widest">Cancel</button>
            </div>
          </div>
        )}
        <div className="h-8 bg-black/20 flex items-center justify-center shrink-0"><span className="text-[8px] text-white/15 font-bold tracking-[0.3em] uppercase">{centerName || 'Wellness'} Center Terminal</span></div>
      </div>
    );
  }

  if (view === 'corp_login') { return (<div className="min-h-screen bg-[#001f3f] flex items-center justify-center p-4 font-sans"><div className="bg-white rounded-[3rem] shadow-2xl p-12 w-full max-w-md border-t-8 border-[#8b5cf6]"><div className="flex justify-center mb-6"><Briefcase size={64} className="text-[#8b5cf6]" /></div><h2 className="text-4xl font-black text-center text-slate-900 mb-2 tracking-tight">Partner Login</h2><p className="text-slate-400 mb-10 text-center font-medium tracking-tight">Access your employee wellness roster.</p><input type="text" placeholder="Company Username" id="c_in" className="w-full p-5 bg-slate-100 rounded-2xl mb-4 outline-none border-2 border-transparent focus:border-purple-500/20 text-lg" onKeyDown={(e) => e.key === 'Enter' && handleCorpLogin()} /><input type="password" placeholder="Access PIN" id="c_pin" className="w-full p-5 bg-slate-100 rounded-2xl mb-8 outline-none border-2 border-transparent focus:border-purple-500/20 text-lg" onKeyDown={(e) => e.key === 'Enter' && handleCorpLogin()} /><button onClick={handleCorpLogin} className="w-full bg-[#8b5cf6] text-white p-5 rounded-2xl font-bold text-xl shadow-xl hover:bg-purple-700 transition-all">Sign In</button><button onClick={() => setView('landing')} className="w-full mt-6 text-slate-400 font-bold hover:text-slate-600 transition-colors">Return to Home</button></div></div>); }

  if (view === 'corp_portal' && activeCorp) { const corpMembers = members.filter(m => m.sponsorName.toLowerCase() === activeCorp.companyName.toLowerCase()); const totalCorpVisits = corpMembers.reduce((sum, m) => sum + m.visits, 0); const singlePlans = corpMembers.filter(m => m.type.includes('SINGLE')).length; const familyPlans = corpMembers.filter(m => m.type.includes('FAMILY')).length; return (<div className="min-h-screen bg-[#f0f2f5] font-sans print:bg-white"><nav className="bg-[#001f3f] text-white p-4 shadow-md flex justify-between items-center sticky top-0 z-10 print:hidden"><div className="flex items-center gap-3"><img src={LOGO_URL} alt="Logo" className="h-6" /><span className="font-bold tracking-tight border-l border-white/20 pl-3">Corporate Partner Portal</span></div><button onClick={handleLogout} className="bg-red-500/20 text-red-100 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold transition-all"><LogOut size={16}/> Logout</button></nav><main className="max-w-5xl mx-auto p-8 space-y-8 mt-4 print:p-0 print:m-0 print:max-w-none print:mt-0"><div className="flex justify-between items-end print:hidden"><div><h1 className="text-4xl font-black text-[#001f3f] tracking-tight mb-1">{activeCorp.companyName} Wellness Roster</h1><p className="text-slate-500 font-medium">Review your enrolled employees and gym utilization.</p></div><button onClick={() => window.print()} className="bg-white border border-slate-200 text-[#001f3f] px-6 py-3 rounded-xl font-bold text-sm shadow-sm flex items-center gap-2 hover:bg-slate-50 transition-all"><Printer size={16} /> Print Roster</button></div><div className="hidden print:block mb-6 border-b-4 border-[#001f3f] pb-6 text-center"><img src={LOGO_URL} alt="Logo" className="h-12 mx-auto mb-4 invert grayscale" /><h1 className="text-3xl font-black text-[#001f3f] tracking-tight">{activeCorp.companyName} Wellness Roster</h1><p className="text-slate-500 font-bold uppercase tracking-widest mt-2">{currentDateString}</p></div><div className="grid grid-cols-1 md:grid-cols-4 gap-6 print:grid-cols-4 print:gap-4"><ProStatCard value={corpMembers.length} label="Total Enrolled" color="#001f3f" /><ProStatCard value={totalCorpVisits} label="Total Visits" color="#1080ad" /><ProStatCard value={singlePlans} label="Individual Plans" color="#16a34a" /><ProStatCard value={familyPlans} label="Family Plans" color="#f59e0b" /></div><div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden print:border-slate-300 print:shadow-none print:rounded-none"><div className="p-6 border-b border-slate-100 bg-slate-50 print:bg-white print:p-4"><h3 className="text-lg font-bold text-[#001f3f]">Employee Directory</h3></div><table className="w-full text-left border-collapse print:text-sm"><thead className="bg-white text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 print:border-b-2 print:border-slate-800"><tr><th className="px-8 py-4 print:py-2">Employee Name</th><th className="px-8 py-4 print:py-2">Member ID</th><th className="px-8 py-4 print:py-2">Plan Type</th><th className="px-8 py-4 print:py-2 text-right">Lifetime Visits</th></tr></thead><tbody className="text-sm">{corpMembers.length === 0 ? (<tr><td colSpan="4" className="text-center py-12 text-slate-400 font-medium italic">No employees currently enrolled.</td></tr>) : (corpMembers.map(m => (<tr key={m.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors print:border-slate-200"><td className="px-8 py-5 print:py-2 font-bold text-slate-800">{m.firstName} {m.lastName}</td><td className="px-8 py-5 print:py-2 font-mono text-slate-400">{m.id}</td><td className="px-8 py-5 print:py-2"><span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 print:bg-transparent print:px-0 print:text-black text-[10px] font-black tracking-tight">{m.type}</span></td><td className="px-8 py-5 print:py-2 text-right font-black text-[#1080ad] print:text-black text-lg print:text-base">{m.visits}</td></tr>)))}</tbody></table></div></main></div>); }

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
        <nav className="flex-1 px-4 space-y-1">{[{id:'dashboard',label:'Dashboard',icon:<LayoutDashboard size={18}/>},{id:'members',label:'Members',icon:<Users size={18}/>},{id:'classes',label:'Classes',icon:<Calendar size={18}/>},{id:'badge',label:'Staff Check-In',icon:<QrCode size={18}/>},{id:'notif',label:'Notifications',icon:<Bell size={18}/>},{id:'visitors',label:'Visitors',icon:<Eye size={18}/>},{id:'corporate',label:'Corporate',icon:<Briefcase size={18}/>},{id:'reports',label:'Reports',icon:<FileText size={18}/>},{id:'help',label:'Help & Training',icon:<HelpCircle size={18}/>}].map(item => (<button key={item.id} onClick={() => { setActiveTab(item.id); setKioskInput(''); setHelpSearch(''); }} className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all ${activeTab === item.id ? 'bg-[#1080ad] text-white font-bold' : 'text-white/60 hover:bg-white/5'}`}>{item.icon} {item.label}{item.id === 'notif' && stats.overdue > 0 && <span className="ml-auto w-5 h-5 rounded-full bg-red-500 text-[10px] flex items-center justify-center font-bold tracking-tight">{stats.overdue}</span>}</button>))}</nav>
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
                    const todayByPlan = todayVisits.reduce((acc, v) => { acc[v.type] = (acc[v.type] || 0) + 1; return acc; }, {});
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
                          <button onClick={() => setShowAllCheckins(!showAllCheckins)} className="w-full py-2 mt-2 text-sm font-bold text-[#1080ad] hover:text-[#001f3f] transition-colors bg-blue-50/50 rounded-lg border border-blue-100 hover:bg-blue-50">
                            {showAllCheckins ? 'Collapse List ↑' : `See All ${todayVisits.length} Check-ins →`}
                          </button>
                        )}
                      </div>
                    );
                  })()}
                </ProListCard>
                <ProListCard title="Account Health">
                  <div className="py-4"><DonutChart data={statusChartData} totalLabel="Accounts" /></div>
                </ProListCard>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ProListCard title="Membership Breakdown">
                  <div className="py-4"><DonutChart data={planChartData} totalLabel="Members" /></div>
                </ProListCard>
                <ProListCard title="Peak Hours Heatmap">
                  <div className="flex items-end justify-between h-48 mt-8 gap-2">
                    {heatmapData.map((count,i) => { const hp = count===0?5:(count/maxVisits)*100; const hl = (i+6)>12?`${(i+6)-12}P`:`${i+6}A`; return (<div key={i} className="flex-1 flex flex-col items-center gap-2 group"><div className="w-full bg-blue-100 rounded-t-md relative flex items-end justify-center group-hover:bg-blue-200 transition-colors" style={{height:'100%'}}><div className="w-full bg-[#1080ad] rounded-t-md transition-all duration-500 relative" style={{height:`${hp}%`}}><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-[#001f3f] opacity-0 group-hover:opacity-100 transition-opacity">{count}</span></div></div><span className="text-[10px] font-bold text-slate-400">{hl}</span></div>); })}
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
          const displayedClasses = allClasses.filter(c => { const isRightCenter = viewingCenter === 'both' || c.center === viewingCenter; const isRightDay = c.days === 'Mon - Fri' ? (todayIdx >= 1 && todayIdx <= 5) : c.days.includes(todayName); return isRightCenter && isRightDay; });
          const todayStr = new Date().toDateString();
          return (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-8"><div><h2 className="text-3xl font-bold text-[#001f3f] tracking-tight">Class Attendance</h2><p className="text-slate-400 font-medium">Select a class to log attendee check-ins.</p></div><div className="bg-white px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 shadow-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long' })} Schedule</div></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {displayedClasses.map((c, i) => {
                  const classVisits = filteredVisits.filter(v => new Date(v.time).toDateString() === todayStr && v.method === `Class: ${c.name}`);
                  return (
                    <div key={i} className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-t-4 ${c.color} flex flex-col justify-between`}>
                      <div>
                        <div className="flex justify-between items-start mb-4"><div><h3 className="font-black text-[#001f3f] text-lg leading-tight">{c.name}</h3><p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{c.center === 'anthony' ? 'Anthony Center' : 'Harper Center'}</p><p className="text-sm font-medium text-slate-500 mt-1">{c.days}</p></div><span className="bg-slate-50 text-slate-600 px-3 py-1 rounded-lg text-xs font-black whitespace-nowrap">{c.time}</span></div>
                        {classVisits.length > 0 && (<div className="mt-4 bg-slate-50 rounded-xl p-3 border border-slate-100"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Current Roster</p><div className="flex flex-wrap gap-1.5">{classVisits.slice(0, 6).map((v, idx) => (<span key={idx} className="bg-white border border-slate-200 text-slate-700 text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">{v.name.split(' ')[0]} {v.name.split(' ')[1] ? v.name.split(' ')[1].charAt(0) + '.' : ''}</span>))}{classVisits.length > 6 && (<span className="bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">+{classVisits.length - 6} more</span>)}</div></div>)}
                      </div>
                      <div className="flex justify-between items-end mt-6"><div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Check-ins</p><p className="text-3xl font-black text-[#1080ad] leading-none">{classVisits.length} <span className="text-sm text-slate-400 font-bold">/ {c.capacity}</span></p></div><button onClick={() => setActiveClass(c)} className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-5 py-3 rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center justify-center gap-2"><Users size={16} /> Manage Roster</button></div>
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
                          <input autoFocus className="flex-1 p-5 border-2 border-slate-200 rounded-2xl outline-none focus:border-[#1080ad] text-2xl bg-slate-50" placeholder="e.g. Smith" value={kioskInput} onChange={(e) => setKioskInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { processCheckIn(kioskInput, `Class: ${activeClass.name}`); setKioskInput(''); } }} />
                          <button onClick={() => { processCheckIn(kioskInput, `Class: ${activeClass.name}`); setKioskInput(''); }} className="bg-[#001f3f] text-white px-8 rounded-2xl font-bold text-xl hover:bg-blue-900 transition-colors shadow-lg">Check In</button>
                        </div>
                        {kioskMatches.length > 0 && (<div className="absolute top-[80%] left-0 right-0 mt-2 bg-white border-2 border-[#1080ad] rounded-2xl shadow-2xl z-50 overflow-hidden text-left">{kioskMatches.map(m => (<button key={m._type + (m.airtableId || m.id)} onClick={() => { processCheckIn(m.id, `Class: ${activeClass.name}`); setKioskInput(''); }} className="w-full p-4 border-b border-slate-100 hover:bg-blue-50 transition-colors flex justify-between items-center group"><div><p className="font-bold text-[#001f3f] text-lg">{m.firstName} {m.lastName}</p></div><div className="bg-[#1080ad] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md group-hover:scale-105 transition-transform">Check In</div></button>))}</div>)}
                        {kioskMessage.text && (<div className={`mt-6 p-4 rounded-xl text-center font-bold text-lg ${kioskMessage.type==='success'?'bg-green-100 text-green-700':kioskMessage.type==='warning'?'bg-yellow-100 text-yellow-700':'bg-red-100 text-red-700'}`}>{kioskMessage.text}{kioskMessage.subtext && <p className="text-sm mt-1">{kioskMessage.subtext}</p>}</div>)}
                      </div>
                      <div className="w-full md:w-80 bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col h-[400px]">
                        <div className="flex justify-between items-center mb-4"><h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Activity size={14}/> Live Roster</h3><span className="bg-[#1080ad] text-white px-2 py-1 rounded font-bold text-xs">{classVisits.length}</span></div>
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2">{classVisits.length === 0 ? (<p className="text-slate-400 italic text-sm text-center mt-10">Waiting for class check-ins...</p>) : (classVisits.map((v, i) => (<div key={i} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm transition-all duration-300"><p className="font-bold text-slate-800 text-sm">{v.name}</p><p className="text-[10px] font-bold text-[#f59e0b] uppercase mt-1">{new Date(v.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • Checked In</p></div>)))}</div>
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
              <tbody className="text-sm">{visitors.length === 0 ? (<tr><td colSpan="7" className="text-center py-12 text-slate-400 font-medium italic">No visitors yet.</td></tr>) : visitors.map(v => { const expired = new Date(v.expirationDate + 'T23:59:59') < new Date(); return (<tr key={v.airtableId} className="border-b hover:bg-slate-50/80"><td className="px-6 py-4"><p className="font-bold text-slate-800 cursor-pointer hover:text-[#1080ad]" onClick={() => setSelectedVisitor(v)}>{v.firstName} {v.lastName}</p><p className="text-[11px] text-slate-400">{v.email || v.phone || 'No contact info'}{!v.orientationComplete && <span className="ml-2 px-2 py-0.5 rounded text-[9px] font-black bg-blue-100 text-blue-700 uppercase">Needs Orientation</span>}</p></td><td className="px-4 py-4"><span className={`px-3 py-1 rounded-full text-[10px] font-black ${v.passType === 'Day Pass' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>{v.passType}</span></td><td className="px-4 py-4 text-slate-600 text-xs">{v.referringProvider || '—'}</td><td className="px-4 py-4 text-xs"><span className={expired ? 'text-red-500 font-bold' : 'text-slate-600'}>{v.expirationDate ? new Date(v.expirationDate + 'T00:00:00').toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'}) : 'N/A'}</span></td><td className="px-4 py-4"><span className={`px-3 py-1 rounded-full text-[10px] font-black ${expired ? 'bg-red-100 text-red-600' : !v.passActivated ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>{expired ? 'EXPIRED' : !v.passActivated ? 'PENDING' : 'ACTIVE'}</span></td><td className="px-4 py-4 font-black text-[#1080ad]">{v.totalVisits}</td><td className="px-4 py-4 flex gap-2">
                {!v.passActivated && (<button onClick={async () => { if (!window.confirm(`Activate pass for ${v.firstName} ${v.lastName}?`)) return; try { const res = await fetch('/api/update-visitor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ visitorAirtableId: v.airtableId, passActivated: true }) }); const result = await res.json(); if (result.success) { setVisitors(prev => prev.map(vis => vis.airtableId === v.airtableId ? {...vis, passActivated: true} : vis)); } else { alert('Error: ' + result.error); } } catch (err) { alert('Network error.'); } }} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-[10px] font-bold hover:bg-green-700 transition-colors" title="Activate this pass">Activate</button>)}
                {!v.orientationComplete && (<button onClick={async () => { try { const res = await fetch('/api/update-visitor-orientation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ visitorAirtableId: v.airtableId }) }); const result = await res.json(); if (result.success) { setVisitors(prev => prev.map(vis => vis.airtableId === v.airtableId ? {...vis, orientationComplete: true} : vis)); } else { alert('Error: ' + result.error); } } catch (err) { alert('Network error.'); } }} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold hover:bg-blue-700 transition-colors" title="Mark Orientation Complete">Orient</button>)}
                <button onClick={() => setEditingVisitor(v)} className="px-3 py-1.5 bg-slate-500 text-white rounded-lg text-[10px] font-bold hover:bg-slate-600 transition-colors" title="Edit Visitor">Edit</button>
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
          if (periodStr.startsWith('Q')) { const q = parseInt(periodStr.replace('Q', '')); targetMonths = [ (q-1)*3, (q-1)*3 + 1, (q-1)*3 + 2 ]; displayPeriod = `Q${q} ${y}`; } else { targetMonths = [ parseInt(periodStr) - 1 ]; displayPeriod = new Date(y, targetMonths[0]).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }); }
          const currentPeriodVisits = visits.filter(v => { if (!v.time) return false; const d = new Date(v.time); return d.getFullYear() === y && targetMonths.includes(d.getMonth()); });
          return (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4"><div><h2 className="text-3xl font-bold text-[#001f3f] tracking-tight">Corporate Partners</h2><p className="text-slate-400 font-medium">Manage corporate sponsorships and billing rosters.</p></div><div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200"><PeriodSelector value={reportMonth} onChange={(e) => setReportMonth(e.target.value)} /></div></div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
              <Search className="text-slate-300 shrink-0" size={18} />
              <input className="flex-1 outline-none text-sm font-medium text-[#001f3f] placeholder-slate-300" placeholder="Search corporate partners..." value={corpSearch} onChange={e => setCorpSearch(e.target.value)} />
              {corpSearch && <button onClick={() => setCorpSearch('')} className="text-slate-300 hover:text-red-400 transition-colors"><X size={16}/></button>}
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest shrink-0">{corporatePartners.filter(c => c.name.toLowerCase().includes(corpSearch.toLowerCase())).length} of {corporatePartners.length}</span>
            </div>
            <div className="space-y-3">
              {corporatePartners.filter(c => c.name.toLowerCase().includes(corpSearch.toLowerCase())).length === 0 && (
                <div className="text-center py-12 text-slate-400 font-medium italic">No corporate partners match your search.</div>
              )}
              {corporatePartners.filter(c => c.name.toLowerCase().includes(corpSearch.toLowerCase())).map(corp => {
                 const isUsageBased = !!usageBasedCorps[corp.id];
                 const corpMembers = members.filter(mem => mem.sponsorName === corp.sponsorMatch && !mem.type.includes('HD6') && !mem.type.includes('HCHF'));
                 let totalOwed = 0; let totalPeriodVisits = 0;
                 const enrichedMembers = corpMembers.map(mem => { const memVisits = currentPeriodVisits.filter(v => v.name.toLowerCase() === `${mem.firstName} ${mem.lastName}`.toLowerCase()); totalPeriodVisits += memVisits.length; const rate = parseFloat(String(mem.monthlyRate).replace(/[^0-9.]/g, '')) || 0; let memberOwed = 0; let activeMonthsCount = 0; if (isUsageBased) { targetMonths.forEach(mIdx => { const visitedInMonth = memVisits.some(v => new Date(v.time).getMonth() === mIdx); if (visitedInMonth) { memberOwed += rate; activeMonthsCount++; } }); } else { if (mem.status === 'ACTIVE') { memberOwed = rate * targetMonths.length; activeMonthsCount = targetMonths.length; } } totalOwed += memberOwed; return { ...mem, periodVisits: memVisits.length, memberOwed, activeMonthsCount }; });
                 const activeMembersCount = enrichedMembers.filter(m => m.memberOwed > 0 || m.status === 'ACTIVE').length;
                 const paidMatch = corp.paidMonths ? corp.paidMonths.split(',').find(str => str.startsWith(reportMonth)) : null;
                 const isPaid = !!paidMatch;
                 const corpPayMethod = paidMatch && paidMatch.includes(':') ? paidMatch.split(':')[1] : '';
                 const togglePayment = async () => { if (isPaid) { let newPaidMonths = corp.paidMonths || ''; newPaidMonths = newPaidMonths.split(',').filter(mn => !mn.startsWith(reportMonth)).join(','); setCorporatePartners(prev => prev.map(c => c.id === corp.id ? { ...c, paidMonths: newPaidMonths } : c)); try { await fetch('/api/update-corporate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ recordId: corp.id, paidMonths: newPaidMonths }) }); } catch (err) { alert('Failed to sync payment status to Airtable.'); } } else { setCorpPaymentModal({ ...corp, reportMonth, displayPeriod }); } };
                 const downloadCSV = () => { if (corpMembers.length === 0) { alert('No employees enrolled for this partner.'); return; } const headers = ["Employee Name", "Member ID", "Plan Type", "Period Visits", "Months Billed", "Total Billed"]; const rows = enrichedMembers.map(mem => `"${mem.firstName} ${mem.lastName}","${mem.id}","${mem.type}","${mem.periodVisits}","${mem.activeMonthsCount}","$${mem.memberOwed.toFixed(2)}"`); rows.push(`"","","","","",""`); rows.push(`"","","","","TOTAL DUE:","$${totalOwed.toFixed(2)}"`); const csv = [headers.join(','), ...rows].join('\n'); const b = new Blob([csv],{type:'text/csv'}); const u = window.URL.createObjectURL(b); const a = document.createElement('a'); a.href=u; a.download=`${corp.name.replace(/\s+/g, '_')}_Invoice_${reportMonth}.csv`; a.click(); window.URL.revokeObjectURL(u); };
                 const printInvoice = () => { if (corpMembers.length === 0) { alert('No employees enrolled for this partner.'); return; } const isHarper = viewingCenter === 'harper'; const centerName = isHarper ? 'Harper Wellness Center' : 'Anthony Wellness Center'; const centerAddr = isHarper ? '615 W 12th St, Harper, KS 67058' : '309 W Main St, Anthony, KS 67003'; const centerPhone = isHarper ? '(620) 896-1202' : '(620) 842-5190'; const directorName = isHarper ? 'Patrick Johnson' : 'Deanna Smithhisler'; const rows = enrichedMembers.map(mem => `<tr><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${mem.firstName} ${mem.lastName}</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-family: monospace; color: #64748b;">${mem.id}</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${mem.type}</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: bold; color: ${mem.periodVisits > 0 ? '#1080ad' : '#94a3b8'};">${mem.periodVisits}</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${mem.activeMonthsCount}</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: ${mem.memberOwed > 0 ? '#16a34a' : '#94a3b8'};">$${mem.memberOwed.toFixed(2)}</td></tr>`).join(''); const addressBlock = corp.address ? `${corp.address}<br/>${corp.city}, ${corp.state} ${corp.zip}` : 'Address not on file'; const html = `<!DOCTYPE html><html><head><title>Corporate Invoice - ${corp.name} - ${displayPeriod}</title><style>@media print{body{margin:0}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}}body{font-family:Arial,sans-serif;color:#1e293b;margin:0;padding:40px}.hdr{background:#003d6b;padding:20px 44px;display:flex;justify-content:space-between;align-items:center;border-radius:8px 8px 0 0}.hdr-logo{height:40px}.hdr-text{text-align:right;color:white}.hdr-title{font-size:24px;font-weight:900;margin:0}.hdr-sub{font-size:12px;color:#8bb8d9;margin-top:4px;line-height:1.4}.accent{height:4px;background:linear-gradient(to right,#dba51f,#dd6d22);margin-bottom:40px}.bill-to{margin-bottom:30px}.bill-to h2{margin:0 0 5px 0;font-size:14px;color:#64748b;text-transform:uppercase;letter-spacing:1px}.bill-to p{margin:0;font-size:18px;font-weight:900;color:#003d6b}.summary{display:flex;gap:40px;margin-bottom:30px;background:#f8fafc;padding:20px;border-radius:8px;border:1px solid #e2e8f0}.sum-box{text-align:left}.sum-lbl{font-size:10px;font-weight:bold;color:#64748b;text-transform:uppercase;letter-spacing:1px}.sum-val{font-size:24px;font-weight:900;color:#003d6b;margin-top:5px}.sum-val.due{color:#16a34a}table{width:100%;border-collapse:collapse;margin-bottom:30px;font-size:12px}th{background:#003d6b;color:white;text-align:left;padding:12px 10px;font-size:10px;text-transform:uppercase;letter-spacing:1px}th.right{text-align:right}th.center{text-align:center}.total-row td{background:#fff;border-top:2px solid #003d6b;padding-top:20px;font-size:14px}.total-lbl{text-align:right;font-weight:900;color:#1e293b;text-transform:uppercase}.total-val{font-size:20px;font-weight:900;color:#16a34a;text-align:right}.sign{margin-top:40px;font-size:14px}.sign-name{font-weight:bold;color:#003d6b;margin-top:5px}.sign-title{color:#64748b;font-size:12px}</style></head><body><div class="hdr"><img src="${LOGO_URL}" class="hdr-logo" /><div class="hdr-text"><h1 class="hdr-title">Corporate Invoice</h1><div class="hdr-sub">${centerName}<br/>${centerAddr} | ${centerPhone}</div></div></div><div class="accent"></div><div class="bill-to"><h2>Billed To:</h2><p>${corp.name}</p><p style="font-size: 14px; font-weight: normal; color: #475569; margin-top: 4px;">Attn: ${corp.contactName || 'Benefits Administrator'}<br/>${addressBlock}</p></div><div class="summary"><div class="sum-box"><div class="sum-lbl">Billing Period</div><div class="sum-val" style="font-size: 18px;">${displayPeriod}</div></div><div class="sum-box"><div class="sum-lbl">${isUsageBased ? 'Active Employees' : 'Total Enrolled'}</div><div class="sum-val" style="font-size: 18px;">${activeMembersCount}</div></div><div class="sum-box"><div class="sum-lbl">Total Amount Due</div><div class="sum-val due" style="font-size: 18px;">$${totalOwed.toFixed(2)}</div></div></div><table><thead><tr><th>Employee Name</th><th>Member ID</th><th>Plan Type</th><th class="center">Period Visits</th><th class="center">Months Billed</th><th class="right">Amount Billed</th></tr></thead><tbody>${rows}</tbody><tfoot><tr class="total-row"><td colspan="5" class="total-lbl">Total Corporate Responsibility:</td><td class="total-val">$${totalOwed.toFixed(2)}</td></tr></tfoot></table><div class="sign"><p>Thank you for partnering with Patterson Health Center to keep your team healthy!</p><div class="sign-name">${directorName}</div><div class="sign-title">Director, ${centerName}</div></div></body></html>`; const w = window.open('', '_blank'); w.document.write(html); w.document.close(); setTimeout(() => w.print(), 500); };
                 return (
                   <div key={corp.id} className={`bg-white rounded-2xl shadow-sm border transition-all ${isPaid ? 'border-green-300' : 'border-slate-200'}`}>
                     {/* COMPACT HEADER ROW — always visible */}
                     <button onClick={() => setExpandedCorpId(expandedCorpId === corp.id ? null : corp.id)} className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors rounded-2xl">
                       <div className="flex items-center gap-4 min-w-0">
                         <div className="w-10 h-10 rounded-xl bg-[#8b5cf6]/10 flex items-center justify-center shrink-0"><Briefcase size={18} className="text-[#8b5cf6]" /></div>
                         <div className="min-w-0">
                           <h3 className="font-black text-[#001f3f] text-lg truncate">{corp.name}</h3>
                           <p className="text-[11px] text-slate-400 font-bold">{corpMembers.length} enrolled · {totalPeriodVisits} visits · ${totalOwed.toFixed(2)} owed</p>
                         </div>
                       </div>
                       <div className="flex items-center gap-3 shrink-0">
                         <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{isPaid ? `PAID${corpPayMethod ? ` · ${corpPayMethod.toUpperCase()}` : ''}` : 'UNPAID'}</span>
                         <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform ${expandedCorpId === corp.id ? 'rotate-90 bg-blue-100 text-[#1080ad]' : 'bg-slate-100 text-slate-400'}`}><ChevronRight size={14} /></div>
                       </div>
                     </button>
                     
                     {/* EXPANDED DETAIL — only visible when selected */}
                     {expandedCorpId === corp.id && (
                       <div className="px-6 pb-6 border-t border-slate-100">
                         <div className="pt-5 space-y-4">
                           <div className="flex items-center justify-between">
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Mail size={12}/> {corp.contactEmail || 'No Email on file'}</p>
                             <button onClick={() => setEditingCorp(corp)} className="bg-blue-50 text-[#1080ad] hover:bg-blue-100 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase transition-colors">Edit</button>
                           </div>
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                             <div className="bg-slate-50 p-3 rounded-lg border border-slate-100"><span className="text-[10px] font-bold text-slate-400 uppercase block">Enrolled</span><span className="text-lg font-black text-[#001f3f]">{corpMembers.length}</span></div>
                             <div className="bg-blue-50 p-3 rounded-lg border border-blue-100"><span className="text-[10px] font-bold text-blue-600 uppercase block">Visits</span><span className="text-lg font-black text-[#1080ad]">{totalPeriodVisits}</span></div>
                             <div className="bg-green-50 p-3 rounded-lg border border-green-100"><span className="text-[10px] font-bold text-green-600 uppercase block">Total Owed</span><span className="text-lg font-black text-[#16a34a]">${totalOwed.toFixed(2)}</span></div>
                             {isPaid && <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200"><span className="text-[10px] font-bold text-emerald-600 uppercase block">Paid Via</span><span className="text-lg font-black text-emerald-700">{corpPayMethod ? corpPayMethod.charAt(0).toUpperCase() + corpPayMethod.slice(1) : '—'}</span></div>}
                           </div>
                           <label className="flex items-center gap-2 cursor-pointer group w-fit"><input type="checkbox" checked={isUsageBased} onChange={(e) => setUsageBasedCorps(prev => ({...prev, [corp.id]: e.target.checked}))} className="w-4 h-4 text-[#1080ad] rounded border-slate-300 cursor-pointer" /><span className="text-xs font-bold text-slate-500 uppercase tracking-widest group-hover:text-[#1080ad] transition-colors">Usage-Based Billing</span></label>
                           {/* Employee Roster */}
                           <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden"><div className="max-h-48 overflow-y-auto p-3 space-y-2">{enrichedMembers.length === 0 ? <p className="text-xs text-slate-400 italic p-2">No members enrolled.</p> : enrichedMembers.map(em => (<div key={em.id} className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100 shadow-sm"><div><p className="text-xs font-bold text-slate-800">{em.firstName} {em.lastName}</p><p className="text-[9px] text-slate-400 uppercase tracking-widest">{em.type} • {em.periodVisits} visit{em.periodVisits !== 1 ? 's' : ''}</p></div><span className={`text-xs font-black ${em.memberOwed > 0 ? 'text-[#16a34a]' : 'text-slate-400'}`}>${em.memberOwed.toFixed(2)}</span></div>))}</div></div>
                           {/* Action Buttons */}
                           <div className="flex flex-col gap-2 pt-2">
                             <div className="flex gap-2">
                               <button onClick={printInvoice} className="flex-1 bg-[#16a34a] text-white py-3 rounded-xl text-sm font-bold shadow-sm flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"><Printer size={16}/> Invoice</button>
                               <button onClick={downloadCSV} className="bg-slate-100 text-[#001f3f] px-4 py-3 rounded-xl text-sm font-bold shadow-sm flex items-center justify-center hover:bg-slate-200 transition-colors" title="Download Spreadsheet CSV"><Download size={16}/></button>
                               {corp.contactEmail && (<a href={`mailto:${corp.contactEmail}?subject=${corp.name} Wellness Roster & Invoice - ${displayPeriod}&body=Hello ${corp.contactName || 'Partner'},\n\nPlease find attached your updated wellness center roster and invoice for ${displayPeriod}.\n\nTotal Due: $${totalOwed.toFixed(2)}\n\nThank you for partnering with us to keep your team healthy!\n\n- Patterson Health Center`} className="bg-slate-100 text-slate-600 px-4 py-3 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center" title="Draft Email to Partner"><Mail size={16}/></a>)}
                             </div>
                             <button onClick={togglePayment} className={`w-full py-3 rounded-xl text-sm font-bold shadow-sm transition-colors border ${isPaid ? 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50' : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'}`}>{isPaid ? 'Mark as Unpaid' : 'Mark as Paid'}</button>
                           </div>
                         </div>
                       </div>
                     )}
                   </div>
                 );
              })}
            </div>
          </div>
        )})()}

        {/* ======================== ENHANCED REPORTS TAB ======================== */}
        {activeTab === 'reports' && (() => {
          const [periodStr, yearStr] = reportMonth.split('-');
          const y = parseInt(yearStr);
          let targetMonths = [];
          let displayPeriod = '';
          if (periodStr.startsWith('Q')) { const q = parseInt(periodStr.replace('Q', '')); targetMonths = [ (q-1)*3, (q-1)*3 + 1, (q-1)*3 + 2 ]; displayPeriod = `Q${q} ${y}`; } else { targetMonths = [ parseInt(periodStr) - 1 ]; displayPeriod = new Date(y, targetMonths[0]).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }); }

          const currentPeriodVisits = visits.filter(v => { if (!v.time) return false; const d = new Date(v.time); return d.getFullYear() === y && targetMonths.includes(d.getMonth()); });
          const newMembersThisPeriod = members.filter(mem => { if (!mem.startDate) return false; const d = new Date(mem.startDate); return d.getFullYear() === y && targetMonths.includes(d.getMonth()); });
          const visitCounts = currentPeriodVisits.reduce((acc, v) => { const name = v.name; acc[name] = (acc[name] || 0) + 1; return acc; }, {});
          const topMembers = Object.entries(visitCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

          const twentyOneDaysAgo = new Date(); twentyOneDaysAgo.setDate(twentyOneDaysAgo.getDate() - 21);
          const slippingAway = scopedMembers.filter(mem => { if (mem.status !== 'ACTIVE') return false; const memberVisits = visits.filter(v => v.name.toLowerCase() === (mem.firstName + ' ' + mem.lastName).toLowerCase()); if (memberVisits.length === 0) return true; const lastVisit = new Date(Math.max(...memberVisits.map(v => new Date(v.time)))); return lastVisit < twentyOneDaysAgo; }).slice(0, 8);

          const visitsByPlan = currentPeriodVisits.reduce((acc, v) => { acc[v.type] = (acc[v.type] || 0) + 1; return acc; }, {});

          // --- RETENTION & ENGAGEMENT CALCULATIONS ---
          const activeMembers = scopedMembers.filter(m => m.status === 'ACTIVE');
          const activeMembersWithVisits = activeMembers.filter(m => {
            return currentPeriodVisits.some(v => v.name.toLowerCase() === `${m.firstName} ${m.lastName}`.toLowerCase());
          });
          const engagementRate = activeMembers.length > 0 ? Math.round((activeMembersWithVisits.length / activeMembers.length) * 100) : 0;
          const avgVisitsPerMember = activeMembers.length > 0 ? (currentPeriodVisits.length / activeMembers.length).toFixed(1) : '0';
          const neverVisited = scopedMembers.filter(m => m.visits === 0 && m.status === 'ACTIVE');

          // 90-day retention: members active 90 days ago who are still active
          const ninetyDaysAgo = new Date(); ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
          const membersActiveNinetyAgo = scopedMembers.filter(m => {
            if (!m.startDate) return false;
            return new Date(m.startDate) <= ninetyDaysAgo;
          });
          const retainedMembers = membersActiveNinetyAgo.filter(m => m.status === 'ACTIVE');
          const retentionRate = membersActiveNinetyAgo.length > 0 ? Math.round((retainedMembers.length / membersActiveNinetyAgo.length) * 100) : 100;

          // --- REVENUE CALCULATIONS ---
          const paidMembers = scopedMembers.filter(m => m.status === 'ACTIVE' && !m.type.includes('HD6') && !m.type.includes('HCHF') && !m.type.includes('MILITARY') && m.type !== 'FIRST DAY FREE');
          const revenueByPlan = {};
          const collectedRevenueByPlan = {};
          paidMembers.forEach(m => {
            const rate = parseFloat(String(m.monthlyRate).replace(/[^0-9.]/g, '')) || 0;
            const planLabel = m.type.includes('CORPORATE') ? 'Corporate' : m.type === 'SINGLE' ? 'Single' : m.type.includes('FAMILY') ? 'Family' : m.type.includes('SENIOR') ? 'Senior' : m.type.includes('STUDENT') ? 'Student' : 'Other';
            revenueByPlan[planLabel] = (revenueByPlan[planLabel] || 0) + rate;
            // Only count as collected if individual has payment logged OR is corporate with corp payment logged
            const isCorp = m.type.includes('CORPORATE') || m.sponsorName;
            let isCollected = false;
            if (isCorp) {
              const sponsor = corporatePartners.find(cp => cp.sponsorMatch === m.sponsorName);
              isCollected = sponsor && sponsor.paidMonths && sponsor.paidMonths.split(',').some(str => str.startsWith(reportMonth));
            } else {
              isCollected = !!m.paymentMethod;
            }
            if (isCollected) { collectedRevenueByPlan[planLabel] = (collectedRevenueByPlan[planLabel] || 0) + rate; }
          });
          const revChartData = Object.entries(collectedRevenueByPlan).filter(([_, v]) => v > 0).sort((a, b) => b[1] - a[1]).map(([label, value]) => {
            const colorMap = { Single: '#1080ad', Family: '#f59e0b', Senior: '#16a34a', Student: '#8b5cf6', Corporate: '#ef4444', Other: '#64748b' };
            return { label, value: Math.round(value), color: colorMap[label] || '#64748b' };
          });
          const actualRevenue = paidMembers.filter(m => m.paymentMethod).reduce((sum, m) => sum + (parseFloat(String(m.monthlyRate).replace(/[^0-9.]/g, '')) || 0), 0);
          const corpCollected = corporatePartners.reduce((sum, cp) => {
            const isPaid = cp.paidMonths && cp.paidMonths.split(',').some(str => str.startsWith(reportMonth));
            if (!isPaid) return sum;
            const corpMems = paidMembers.filter(m => m.sponsorName === cp.sponsorMatch);
            return sum + corpMems.reduce((s, m) => s + (parseFloat(String(m.monthlyRate).replace(/[^0-9.]/g, '')) || 0), 0);
          }, 0);
          const totalCollected = actualRevenue + corpCollected;
          const expectedRevenue = paidMembers.reduce((sum, m) => sum + (parseFloat(String(m.monthlyRate).replace(/[^0-9.]/g, '')) || 0), 0);
          const collectionRate = expectedRevenue > 0 ? Math.round((totalCollected / expectedRevenue) * 100) : 0;

          // --- VISITS BY DAY OF WEEK ---
          const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
          const visitsByDay = [0,0,0,0,0,0,0];
          currentPeriodVisits.forEach(v => { const d = new Date(v.time).getDay(); visitsByDay[d]++; });
          const dayChartData = dayNames.map((name, i) => ({ label: name, value: visitsByDay[i], color: i === 0 || i === 6 ? '#94a3b8' : '#1080ad' }));

          // --- BOARD REPORT PRINTER ---
          const printBoardReport = () => {
            const centerName = viewingCenter === 'both' ? 'All Centers' : viewingCenter.charAt(0).toUpperCase() + viewingCenter.slice(1) + ' Wellness Center';
            const directorName = viewingCenter === 'harper' ? 'Patrick Johnson' : viewingCenter === 'anthony' ? 'Deanna Smithhisler' : 'Kristen (Administrator)';

            const planRows = planChartData.filter(d => d.value > 0).map(d => `<tr><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:600;">${d.label}</td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:900;color:#003d6b;">${d.value}</td></tr>`).join('');
            const revRows = revChartData.map(d => `<tr><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:600;">${d.label}</td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:900;color:#16a34a;">$${d.value.toLocaleString()}</td></tr>`).join('');
            const topVisitorRows = topMembers.slice(0,5).map(([name, count], i) => `<tr><td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;"><span style="display:inline-block;width:20px;height:20px;border-radius:50%;background:#dba51f;color:white;text-align:center;line-height:20px;font-size:10px;font-weight:700;margin-right:8px;">${i+1}</span>${name}</td><td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:900;color:#1080ad;">${count}</td></tr>`).join('');

            const html = `<!DOCTYPE html><html><head><title>Board Report - ${displayPeriod}</title><style>@media print{body{margin:0;padding:20px}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}}body{font-family:Arial,sans-serif;color:#1e293b;margin:0;padding:30px;max-width:800px;margin:0 auto}.hdr{background:#003d6b;padding:16px 28px;display:flex;justify-content:space-between;align-items:center;border-radius:8px 8px 0 0}.hdr img{height:32px}.hdr-text{text-align:right;color:white}.hdr-title{font-size:20px;font-weight:900;margin:0}.hdr-sub{font-size:10px;color:#8bb8d9;letter-spacing:1px;margin-top:2px}.accent{height:3px;background:linear-gradient(to right,#dba51f,#dd6d22);margin-bottom:24px}.section{margin-bottom:20px}.section-title{font-size:11px;font-weight:900;color:#64748b;text-transform:uppercase;letter-spacing:2px;margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid #003d6b}.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px}.card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px}.card-val{font-size:28px;font-weight:900;color:#003d6b;margin-bottom:2px}.card-lbl{font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1.5px}.card-accent{border-left:4px solid}.tbl{width:100%;border-collapse:collapse;font-size:12px}th{background:#003d6b;color:white;text-align:left;padding:8px 12px;font-size:9px;text-transform:uppercase;letter-spacing:1px}th.right{text-align:right}.footer{margin-top:30px;padding-top:12px;border-top:2px solid #003d6b;font-size:11px;color:#94a3b8;display:flex;justify-content:space-between}</style></head><body>
            <div class="hdr"><img src="${LOGO_URL}" /><div class="hdr-text"><h1 class="hdr-title">Facility Summary — Board Report</h1><div class="hdr-sub">${centerName} · ${displayPeriod}</div></div></div><div class="accent"></div>
            <div class="section"><div class="section-title">Key Performance Indicators</div><div class="grid" style="grid-template-columns:repeat(4,1fr)"><div class="card card-accent" style="border-color:#1080ad"><div class="card-val" style="color:#1080ad">${currentPeriodVisits.length}</div><div class="card-lbl">Total Visits</div></div><div class="card card-accent" style="border-color:#16a34a"><div class="card-val" style="color:#16a34a">${newMembersThisPeriod.length}</div><div class="card-lbl">New Sign-ups</div></div><div class="card card-accent" style="border-color:#f59e0b"><div class="card-val" style="color:#f59e0b">${avgVisitsPerMember}</div><div class="card-lbl">Avg Visits / Member</div></div><div class="card card-accent" style="border-color:#8b5cf6"><div class="card-val" style="color:#8b5cf6">${retentionRate}%</div><div class="card-lbl">90-Day Retention</div></div></div></div>
            <div class="grid"><div class="section"><div class="section-title">Membership Breakdown</div><table class="tbl"><thead><tr><th>Plan Type</th><th class="right">Members</th></tr></thead><tbody>${planRows}</tbody><tfoot><tr><td style="padding:10px 12px;border-top:2px solid #003d6b;font-weight:900;text-transform:uppercase;font-size:11px;">Total</td><td style="padding:10px 12px;border-top:2px solid #003d6b;text-align:right;font-weight:900;font-size:16px;color:#003d6b;">${scopedMembers.length}</td></tr></tfoot></table></div><div class="section"><div class="section-title">Monthly Revenue by Category</div><table class="tbl"><thead><tr><th>Category</th><th class="right">Amount</th></tr></thead><tbody>${revRows}</tbody><tfoot><tr><td style="padding:10px 12px;border-top:2px solid #003d6b;font-weight:900;text-transform:uppercase;font-size:11px;">Collected Total</td><td style="padding:10px 12px;border-top:2px solid #003d6b;text-align:right;font-weight:900;font-size:16px;color:#16a34a;">$${Math.round(totalCollected).toLocaleString()}</td></tr></tfoot></table></div></div>
            <div class="grid"><div class="section"><div class="section-title">Engagement & Retention</div><div class="grid" style="grid-template-columns:1fr 1fr"><div class="card"><div class="card-val">${engagementRate}%</div><div class="card-lbl">Visited This Period</div></div><div class="card"><div class="card-val">${neverVisited.length}</div><div class="card-lbl">Never Visited (Active)</div></div></div><div style="margin-top:8px"><div style="background:#e2e8f0;border-radius:6px;height:18px;overflow:hidden;position:relative"><div style="background:linear-gradient(to right,#16a34a,#1080ad);height:100%;width:${collectionRate}%;border-radius:6px;transition:width 0.5s"></div></div><div style="display:flex;justify-content:space-between;margin-top:4px;font-size:10px;color:#94a3b8;font-weight:700"><span>Collection Rate</span><span style="color:#003d6b;font-weight:900">${collectionRate}% ($${Math.round(totalCollected).toLocaleString()} of $${Math.round(expectedRevenue).toLocaleString()})</span></div></div></div><div class="section"><div class="section-title">Top 5 Most Active Members</div><table class="tbl"><thead><tr><th>Member</th><th class="right">Visits</th></tr></thead><tbody>${topVisitorRows || '<tr><td colspan="2" style="padding:12px;text-align:center;color:#94a3b8;font-style:italic">No data</td></tr>'}</tbody></table></div></div>
            ${slippingAway.length > 0 ? `<div class="section"><div class="section-title">At-Risk Members (21+ Days Since Last Visit)</div><div style="display:flex;flex-wrap:wrap;gap:8px">${slippingAway.slice(0,8).map(m => `<span style="background:#fef2f2;border:1px solid #fecaca;color:#dc2626;padding:4px 12px;border-radius:6px;font-size:11px;font-weight:700">${m.firstName} ${m.lastName}</span>`).join('')}</div></div>` : ''}
            <div class="footer"><span>Prepared by ${directorName} · Patterson Health Center</span><span>${new Date().toLocaleDateString('en-US', {month:'long',day:'numeric',year:'numeric'})}</span></div></body></html>`;
            const w = window.open('', '_blank'); w.document.write(html); w.document.close(); setTimeout(() => w.print(), 500);
          };

          return (
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-black text-[#001f3f]">Facility Summary Report</h2>
                  <p className="text-sm text-slate-500">Filter your facility data by month or quarter.</p>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <PeriodSelector value={reportMonth} onChange={(e) => setReportMonth(e.target.value)} />
                  <button onClick={() => {
                    if (currentPeriodVisits.length === 0) { alert('No visits to export for this period.'); return; }
                    const csv = ["Date,Time,Name,Center,Plan Type,Check-In Method",...currentPeriodVisits.map(v => `"${new Date(v.time).toLocaleDateString()}","${new Date(v.time).toLocaleTimeString()}","${v.name}","${v.center}","${v.type}","${v.method || 'General Workout'}"`)].join('\n');
                    const b = new Blob([csv],{type:'text/csv'}); const u = window.URL.createObjectURL(b); const a = document.createElement('a'); a.href=u; a.download=`Visits_${reportMonth}.csv`; a.click(); window.URL.revokeObjectURL(u);
                  }} className="px-4 py-2 bg-[#1080ad] text-white rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 hover:bg-blue-800"><Download size={16}/> Visits CSV</button>

                  <button onClick={() => {
                    const activePaidMembers = scopedMembers.filter(m => { if (m.status !== 'ACTIVE') return false; if (m.type.includes('CORPORATE') || m.sponsorName) { const sponsor = corporatePartners.find(cp => cp.sponsorMatch === m.sponsorName); return sponsor && sponsor.paidMonths && sponsor.paidMonths.includes(reportMonth); } return !!m.paymentMethod; });
                    if (activePaidMembers.length === 0) { alert('No completed payments found to report.'); return; }
                    const centerName = viewingCenter === 'both' ? 'All Centers' : viewingCenter.charAt(0).toUpperCase() + viewingCenter.slice(1) + ' Wellness Center';
                    const standardMembers = activePaidMembers.filter(m => !m.type.includes('CORPORATE') && !m.sponsorName);
                    const corporateMembers = activePaidMembers.filter(m => m.type.includes('CORPORATE') || m.sponsorName);
                    const calcTotal = (mems) => mems.reduce((sum, m) => sum + (parseFloat(String(m.monthlyRate).replace(/[^0-9.]/g, '')) || 0), 0);
                    const standardTotal = calcTotal(standardMembers); const corpTotal = calcTotal(corporateMembers); const grandTotal = standardTotal + corpTotal;
                    const getPayMethod = (m) => { if (m.type.includes('CORPORATE') || m.sponsorName) { const sponsor = corporatePartners.find(cp => cp.sponsorMatch === m.sponsorName); if (sponsor && sponsor.paidMonths) { const match = sponsor.paidMonths.split(',').find(str => str.startsWith(reportMonth)); return match && match.includes(':') ? match.split(':')[1] : 'Corp Payment'; } } return m.paymentMethod || 'None Logged'; };
                    const buildTable = (mems, title, total) => { if (mems.length === 0) return ''; const rows = mems.map(m => { const finalRate = parseFloat(String(m.monthlyRate).replace(/[^0-9.]/g, '')) || 0; const payMethod = getPayMethod(m); return `<tr><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${m.firstName} ${m.lastName}</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${m.type}${m.sponsorName ? ` (${m.sponsorName})` : ''}</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${payMethod}</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight:bold; color: #16a34a;">$${finalRate.toFixed(2)}</td></tr>`; }).join(''); return `<h3 style="color:#003d6b; margin-top:30px; margin-bottom:10px; font-size:16px; text-transform:uppercase; letter-spacing:1px;">${title}</h3><table><thead><tr><th>Member Name</th><th>Plan Type</th><th>Payment Method</th><th>Final Rate</th></tr></thead><tbody>${rows}</tbody><tfoot><tr class="total-row"><td colspan="3" class="total-lbl">${title} Revenue:</td><td class="total-val">$${total.toFixed(2)}</td></tr></tfoot></table>`; };
                    const html = `<!DOCTYPE html><html><head><title>Financial Report - ${centerName}</title><style>@media print { body { margin: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } } body { font-family: Arial, sans-serif; color: #1e293b; margin: 0; padding: 40px; } .hdr { background: #003d6b; padding: 20px; display: flex; align-items: center; gap: 15px; border-radius: 8px 8px 0 0; } .hdr img { height: 40px; } .hdr-text { color: white; } .hdr-title { font-size: 24px; font-weight: 900; margin: 0; } .hdr-sub { font-size: 12px; color: #8bb8d9; text-transform: uppercase; letter-spacing: 1px; } .accent { height: 4px; background: linear-gradient(to right, #dba51f, #dd6d22); margin-bottom: 30px; } .summary { display: flex; gap: 40px; margin-bottom: 20px; background: #f8fafc; padding: 15px 20px; border-radius: 8px; border: 1px solid #e2e8f0; } .sum-box { text-align: left; } .sum-lbl { font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase; letter-spacing: 1px; } .sum-val { font-size: 20px; font-weight: 900; color: #003d6b; margin-top: 5px; } table { width: 100%; border-collapse: collapse; font-size: 12px; } th { background: #003d6b; color: white; text-align: left; padding: 12px 10px; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; } td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; } tr:nth-child(even) { background-color: #f8fafc; } .total-row td { background: #fff; border-top: 2px solid #003d6b; border-bottom: none; padding-top: 20px; font-size: 14px; } .total-lbl { text-align: right; font-weight: 900; color: #1e293b; text-transform: uppercase; letter-spacing: 1px; } .total-val { font-size: 16px; font-weight: 900; color: #16a34a; text-align: left; padding-left: 12px;} .grand-total { margin-top: 30px; padding: 20px; background: #003d6b; color: white; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; font-size: 18px; font-weight: 900; }</style></head><body><div class="hdr"><img src="${LOGO_URL}" /><div class="hdr-text"><h1 class="hdr-title">Financial Report</h1><div class="hdr-sub">${centerName} • ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div></div></div><div class="accent"></div><div class="summary"><div class="sum-box"><div class="sum-lbl">Total Paying Accounts</div><div class="sum-val">${activePaidMembers.length}</div></div><div class="sum-box"><div class="sum-lbl">Standard Members</div><div class="sum-val" style="color: #1080ad;">${standardMembers.length}</div></div><div class="sum-box"><div class="sum-lbl">Corporate Members</div><div class="sum-val" style="color: #8b5cf6;">${corporateMembers.length}</div></div></div>${buildTable(standardMembers, 'Standard Memberships', standardTotal)}${buildTable(corporateMembers, 'Corporate Memberships', corpTotal)}<div class="grand-total"><span>TOTAL COLLECTED REVENUE:</span><span>$${grandTotal.toFixed(2)}</span></div></body></html>`;
                    const w = window.open('', '_blank'); w.document.write(html); w.document.close(); setTimeout(() => w.print(), 500);
                  }} className="px-4 py-2 bg-[#16a34a] text-white rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 hover:bg-green-700"><Printer size={16}/> Financials</button>

                  <button onClick={printBoardReport} className="px-4 py-2 bg-[#003d6b] text-white rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 hover:bg-[#001f3f] transition-colors"><FileText size={16}/> Board Report</button>

                  <button onClick={() => {
                    const centerName = viewingCenter === 'both' ? 'All Centers' : viewingCenter.charAt(0).toUpperCase() + viewingCenter.slice(1) + ' Wellness Center';
                    const [pStr, yStr] = reportMonth.split('-');
                    const yr = parseInt(yStr);
                    const mo = parseInt(pStr) - 1;
                    const monthName = new Date(yr, mo).toLocaleDateString('en-US', { month: 'long' });
                    
                    // Visit data for the selected month
                    const monthVisits = visits.filter(v => { if (!v.time) return false; const d = new Date(v.time); return d.getFullYear() === yr && d.getMonth() === mo; });
                    const monthDayPasses = monthVisits.filter(v => v.type && v.type.includes('VISITOR')).length;
                    const daysInMonth = new Date(yr, mo + 1, 0).getDate();
                    const avgPerDay = daysInMonth > 0 ? Math.round(monthVisits.length / daysInMonth) : 0;
                    
                    // Employee + family visits
                    const empVisits = monthVisits.filter(v => !v.type || !v.type.includes('VISITOR'));
                    const corpVisits = empVisits.filter(v => v.type && (v.type.includes('CORPORATE') || v.type.includes('HD6')));
                    
                    // Membership stats
                    const singleCount = scopedMembers.filter(m => m.type === 'SINGLE').length;
                    const familyCount = scopedMembers.filter(m => m.type === 'FAMILY').length;
                    const studentCount = scopedMembers.filter(m => m.type.includes('STUDENT')).length;
                    const seniorCount = scopedMembers.filter(m => m.type === 'SENIOR' || m.type === 'SENIOR CITIZEN').length;
                    const seniorFamCount = scopedMembers.filter(m => m.type === 'SENIOR FAMILY').length;
                    const corpCount = scopedMembers.filter(m => m.type.includes('CORPORATE')).length;
                    const totalClassMembers = scopedMembers.length;
                    
                    // Corporate breakdown
                    const corpMemsSingle = scopedMembers.filter(m => m.type === 'CORPORATE').length;
                    const corpMemsFam = scopedMembers.filter(m => m.type === 'CORPORATE FAMILY').length;
                    const corpMemsStudent = scopedMembers.filter(m => m.type.includes('STUDENT') && m.sponsorName).length;
                    const corpMemsSenior = scopedMembers.filter(m => (m.type.includes('SENIOR')) && m.sponsorName).length;
                    
                    // New members
                    const newMembers = scopedMembers.filter(mem => { if (!mem.startDate) return false; const d = new Date(mem.startDate); return d.getFullYear() === yr && d.getMonth() === mo; });
                    
                    // Day pass visitors this month
                    const dayPassVisitors = visitors.filter(v => v.passType === 'Day Pass' && v.purchaseDate && new Date(v.purchaseDate).getFullYear() === yr && new Date(v.purchaseDate).getMonth() === mo).length;
                    
                    const html = `<!DOCTYPE html><html><head><title>${centerName} ${monthName} ${yr} Summary</title><style>@media print{body{margin:0;padding:15px}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}}body{font-family:Arial,sans-serif;color:#1e293b;margin:0;padding:30px;max-width:850px;margin:0 auto}h1{text-align:center;font-size:22px;color:#003d6b;margin-bottom:24px;font-weight:900}table{width:100%;border-collapse:collapse;margin-bottom:20px;font-size:11px}th,td{border:1px solid #cbd5e1;padding:6px 10px}th{background:#003d6b;color:white;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;font-weight:700}td{font-weight:600}.section-title{font-size:13px;font-weight:900;color:#003d6b;margin:20px 0 8px 0;padding-bottom:4px;border-bottom:2px solid #003d6b}.highlight{background:#fef3c7;font-weight:900}.totals-row td{background:#f1f5f9;font-weight:900;border-top:2px solid #003d6b}.stat-label{background:#f8fafc;font-weight:700;color:#334155}.stat-value{text-align:right;font-weight:900;color:#003d6b;font-size:13px}.right{text-align:right}.center{text-align:center}</style></head><body><h1>${centerName} ${monthName} ${yr} Summary</h1>

<div class="section-title">Monthly Overview</div>
<table><thead><tr><th>Metric</th><th class="right">Value</th></tr></thead><tbody>
<tr><td class="stat-label">Total Visits</td><td class="stat-value">${monthVisits.length}</td></tr>
<tr><td class="stat-label">Average Visits Per Day</td><td class="stat-value">${avgPerDay}</td></tr>
<tr><td class="stat-label">Employee & Family Visits</td><td class="stat-value">${empVisits.length}</td></tr>
<tr><td class="stat-label">Day Passes</td><td class="stat-value">${monthDayPasses}</td></tr>
<tr><td class="stat-label">Corporate Member Visits</td><td class="stat-value">${corpVisits.length}</td></tr>
<tr><td class="stat-label">Total Members</td><td class="stat-value">${totalClassMembers}</td></tr>
</tbody></table>

<div class="section-title">Membership Stats</div>
<table><thead><tr><th>Category</th><th class="right">Count</th></tr></thead><tbody>
<tr><td class="stat-label">Single Memberships</td><td class="stat-value">${singleCount}</td></tr>
<tr><td class="stat-label">Family Memberships</td><td class="stat-value">${familyCount}</td></tr>
<tr><td class="stat-label">Student Memberships</td><td class="stat-value">${studentCount}</td></tr>
<tr><td class="stat-label">Senior Memberships</td><td class="stat-value">${seniorCount}</td></tr>
<tr><td class="stat-label">Family/Senior Memberships</td><td class="stat-value">${seniorFamCount}</td></tr>
<tr><td class="stat-label">Corporate</td><td class="stat-value">${corpCount}</td></tr>
</tbody></table>

<div class="section-title">Corporate Breakdown</div>
<table><thead><tr><th>Category</th><th class="right">Count</th></tr></thead><tbody>
<tr><td class="stat-label">Single Memberships</td><td class="stat-value">${corpMemsSingle}</td></tr>
<tr><td class="stat-label">Family Memberships</td><td class="stat-value">${corpMemsFam}</td></tr>
<tr><td class="stat-label">Student Memberships</td><td class="stat-value">${corpMemsStudent}</td></tr>
<tr><td class="stat-label">Senior Memberships</td><td class="stat-value">${corpMemsSenior}</td></tr>
</tbody></table>

<div class="section-title">Other Information</div>
<table><thead><tr><th>Metric</th><th class="right">Value</th></tr></thead><tbody>
<tr><td class="stat-label">New Members</td><td class="stat-value">${newMembers.length}</td></tr>
<tr><td class="stat-label">Paid-Daily Visitors</td><td class="stat-value">${dayPassVisitors}</td></tr>
</tbody></table>

<div style="margin-top:30px;text-align:center;font-size:10px;color:#94a3b8;border-top:2px solid #003d6b;padding-top:10px">Generated from Patterson HC Wellness Hub · ${new Date().toLocaleDateString('en-US', {month:'long',day:'numeric',year:'numeric'})}</div>
</body></html>`;
                    const w = window.open('', '_blank'); w.document.write(html); w.document.close(); setTimeout(() => w.print(), 500);
                  }} className="px-4 py-2 bg-[#dd6d22] text-white rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 hover:bg-orange-700 transition-colors"><Download size={16}/> Monthly Summary</button>

                  <button onClick={() => {
                    const activePaidMembers = scopedMembers.filter(m => { if (m.status !== 'ACTIVE') return false; if (m.type.includes('CORPORATE') || m.sponsorName) { const sponsor = corporatePartners.find(cp => cp.sponsorMatch === m.sponsorName); return sponsor && sponsor.paidMonths && sponsor.paidMonths.includes(reportMonth); } return !!m.paymentMethod; });
                    if (activePaidMembers.length === 0) { alert('No completed payments found to report.'); return; }
                    const getPayMethod = (m) => { if (m.type.includes('CORPORATE') || m.sponsorName) { const sponsor = corporatePartners.find(cp => cp.sponsorMatch === m.sponsorName); if (sponsor && sponsor.paidMonths) { const match = sponsor.paidMonths.split(',').find(str => str.startsWith(reportMonth)); return match && match.includes(':') ? match.split(':')[1] : 'Corp Payment'; } } return m.paymentMethod || 'None Logged'; };
                    const csv = ["Category,Member Name,Plan Type,Sponsor,Payment Method,Final Rate", ...activePaidMembers.map(m => { const isCorp = m.type.includes('CORPORATE') || m.sponsorName ? 'Corporate' : 'Standard'; return `"${isCorp}","${m.firstName} ${m.lastName}","${m.type}","${m.sponsorName || 'N/A'}","${getPayMethod(m)}","$${parseFloat(String(m.monthlyRate).replace(/[^0-9.]/g, '')) || '0'}"`; })].join('\n');
                    const b = new Blob([csv],{type:'text/csv'}); const u = window.URL.createObjectURL(b); const a = document.createElement('a'); a.href=u; a.download=`Financial_Report_${reportMonth}.csv`; a.click(); window.URL.revokeObjectURL(u);
                  }} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 hover:bg-slate-50"><Download size={16}/> CSV</button>
                </div>
              </div>

              {/* TOP STAT CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-t-4 border-t-blue-500"><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Visits</p><p className="text-4xl font-black text-slate-800">{currentPeriodVisits.length}</p></div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-t-4 border-t-green-500"><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">New Sign-Ups</p><p className="text-4xl font-black text-slate-800">{newMembersThisPeriod.length}</p></div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-t-4 border-t-amber-500"><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">24/7 Passes (New)</p><p className="text-4xl font-black text-slate-800">{newMembersThisPeriod.filter(m => m.access247).length}</p></div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-t-4 border-t-purple-500"><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Orientations</p><p className="text-4xl font-black text-slate-800">{newMembersThisPeriod.filter(m => m.needsOrientation).length}</p></div>
              </div>

              {/* NEW: RETENTION & ENGAGEMENT SECTION */}
              <div className="bg-gradient-to-br from-[#001f3f] to-[#003d6b] rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-48 h-48 bg-white/5 rounded-full"></div>
                <h3 className="text-xs font-black text-white/40 uppercase tracking-widest mb-6 relative z-10">Retention & Engagement — {displayPeriod}</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6 relative z-10">
                  <div>
                    <p className="text-4xl font-black text-white">{retentionRate}<span className="text-lg text-white/60">%</span></p>
                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-1">90-Day Retention</p>
                  </div>
                  <div>
                    <p className="text-4xl font-black text-[#dba51f]">{engagementRate}<span className="text-lg text-[#dba51f]/60">%</span></p>
                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-1">Visited This Period</p>
                  </div>
                  <div>
                    <p className="text-4xl font-black text-[#1080ad]">{avgVisitsPerMember}</p>
                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-1">Avg Visits / Member</p>
                  </div>
                  <div>
                    <p className="text-4xl font-black text-white">{neverVisited.length}</p>
                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-1">Never Visited (Active)</p>
                  </div>
                  <div>
                    <p className="text-4xl font-black" style={{ color: slippingAway.length > 5 ? '#ef4444' : slippingAway.length > 2 ? '#f59e0b' : '#16a34a' }}>{slippingAway.length}</p>
                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-1">Slipping Away (21d+)</p>
                  </div>
                </div>
              </div>

              {/* NEW: REVENUE VISUALS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-md font-black text-[#001f3f] mb-6 flex items-center gap-2"><TrendingUp size={18} className="text-[#16a34a]"/> Collected Revenue by Plan Type</h3>
                  {revChartData.length > 0 ? (
                    <div className="space-y-4">
                      <DonutChart data={revChartData} totalLabel="Revenue" />
                    </div>
                  ) : <p className="text-sm text-slate-400 italic">No payments collected this period.</p>}
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-md font-black text-[#001f3f] mb-6 flex items-center gap-2"><Activity size={18} className="text-[#1080ad]" /> Actual Revenue</h3>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Actual Monthly Revenue</p><p className="text-3xl font-black text-[#16a34a]">${Math.round(totalCollected).toLocaleString()}</p></div>
                        <div className="text-right"><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Expected</p><p className="text-lg font-black text-slate-400">${Math.round(expectedRevenue).toLocaleString()}</p></div>
                      </div>
                    </div>
                    <ProgressBar value={Math.round(totalCollected)} max={Math.round(expectedRevenue)} color="#16a34a" label="Collected vs Expected" />
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                        <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Member Payments</p>
                        <p className="text-2xl font-black text-[#16a34a]">${Math.round(actualRevenue).toLocaleString()}</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                        <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1">Corporate Payments</p>
                        <p className="text-2xl font-black text-[#8b5cf6]">${Math.round(corpCollected).toLocaleString()}</p>
                      </div>
                      <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                        <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Outstanding</p>
                        <p className="text-2xl font-black text-red-500">${Math.round(Math.max(0, expectedRevenue - totalCollected)).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Collection Rate</p>
                      <p className="text-3xl font-black" style={{ color: collectionRate >= 80 ? '#16a34a' : collectionRate >= 50 ? '#f59e0b' : '#ef4444' }}>{collectionRate}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* EXISTING: TOP VISITORS + SLIPPING AWAY */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-md font-black text-[#001f3f] mb-4 flex items-center gap-2">🏆 Top Visitors ({displayPeriod})</h3>
                  {topMembers.length > 0 ? topMembers.map(([name, count], index) => (
                    <div key={name} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl mb-2">
                      <div className="flex items-center gap-3"><span className="w-6 h-6 rounded-full bg-amber-400 text-white flex items-center justify-center text-xs font-bold">{index + 1}</span><span className="font-bold text-slate-700">{name}</span></div>
                      <span className="text-sm font-bold text-blue-600">{count} visits</span>
                    </div>
                  )) : <p className="text-sm text-slate-400">No visits recorded yet.</p>}
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-md font-black text-[#001f3f] mb-4 flex items-center gap-2">⚠️ Slipping Away (21+ Days)</h3>
                  {slippingAway.length > 0 ? slippingAway.map(m => (
                    <div key={m.airtableId} className="flex justify-between items-center bg-red-50 p-3 rounded-xl mb-2 cursor-pointer hover:bg-red-100 transition-colors" onClick={() => setSelectedMember(m)}>
                      <span className="font-bold text-slate-700">{m.firstName} {m.lastName}</span>
                      <span className="text-xs font-bold text-red-600 uppercase">Needs Check-in</span>
                    </div>
                  )) : <p className="text-sm text-slate-400">All active members have visited recently!</p>}
                </div>
              </div>

              {/* EXISTING: VISITS BY PLAN + DAY OF WEEK */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-md font-black text-[#001f3f] mb-4">Visits by Plan Type</h3>
                  <div className="space-y-3">
                    {[{l: 'Single', k: 'SINGLE'}, {l: 'Family', k: 'FAMILY'}, {l: 'Senior', k: 'SENIOR'}, {l: 'Student', k: 'STUDENT'}, {l: 'Corporate', k: 'CORPORATE'}, {l: 'Military', k: 'ACTIVE MILITARY'}].map(plan => {
                      const count = (visitsByPlan[plan.k] || 0) + (plan.k === 'SENIOR' ? (visitsByPlan['SENIOR CITIZEN'] || 0) + (visitsByPlan['SENIOR FAMILY'] || 0) : 0) + (plan.k === 'CORPORATE' ? (visitsByPlan['CORPORATE FAMILY'] || 0) : 0);
                      return (
                        <div key={plan.k} className="flex justify-between items-center border-b border-slate-50 pb-2">
                          <span className="text-sm font-semibold text-slate-600">{plan.l}</span>
                          <span className="font-black text-slate-800">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-md font-black text-[#001f3f] mb-6">Busiest Days of the Week</h3>
                  <MiniBarChart data={dayChartData} />
                </div>
              </div>

            </div>
          );
        })()}

        {activeTab === 'notif' && (<div className="space-y-6"><div className="flex justify-between items-center mb-8"><div><h2 className="text-3xl font-bold text-[#001f3f] tracking-tight">Notifications</h2><p className="text-slate-400 font-medium">Payment reminders</p></div><button className="bg-[#dd6d22] text-white px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2"><Bell size={20}/> Send All Due</button></div><ProListCard title="Due for Reminder"><div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-4"><table className="w-full text-left border-collapse"><thead className="bg-slate-50 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b"><tr><th className="px-8 py-4 w-64">Member</th><th className="px-8 py-4 w-40">Type</th><th className="px-8 py-4 w-32">Status</th><th className="px-8 py-4 w-32">Due</th><th className="px-8 py-4 w-24">Actions</th></tr></thead><tbody className="text-sm">{scopedMembers.filter(m => m.status !== 'ACTIVE').map(m => (<tr key={m.id} className="border-b"><td className="px-8 py-5"><p className="font-bold text-slate-800">{m.firstName} {m.lastName}</p><p className="text-[11px] text-slate-400">{m.email}</p></td><td className="px-8 py-5"><span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black">{m.type}</span></td><td className="px-8 py-5"><span className={`px-3 py-1 rounded-full text-[10px] font-black ${m.status==='OVERDUE'?'bg-red-100 text-red-600':'bg-amber-100 text-amber-600'}`}>{m.status}</span></td><td className="px-8 py-5 text-slate-600 font-medium">{m.nextPayment}</td><td className="px-8 py-5 flex gap-2"><button className="p-2 bg-[#1080ad] text-white rounded-lg shadow-md"><Mail size={16}/></button><button className="p-2 bg-[#dd6d22] text-white rounded-lg shadow-md"><Phone size={16}/></button></td></tr>))}</tbody></table></div></ProListCard></div>)}

        {activeTab === 'badge' && (<div className="space-y-6"><div className="mb-8"><h2 className="text-3xl font-bold text-[#001f3f] tracking-tight mb-1">Staff Check-In</h2><p className="text-slate-400 font-medium">Log a check-in manually or via scanner.</p></div><div className="flex gap-8"><div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-200 flex-1 text-center"><p className="text-sm font-bold text-slate-400 mb-4">Enter Name or ID:</p><div className="relative w-full max-w-sm mx-auto mb-10"><div className="flex gap-4"><input className="flex-1 p-4 border rounded-xl outline-none text-xl text-center bg-slate-100 focus:border-[#1080ad] focus:bg-white transition-colors" placeholder="e.g. Smith" value={kioskInput} onChange={(e) => setKioskInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { processCheckIn(kioskInput, "Staff Scan/Entry"); setKioskInput(''); } }} /><button onClick={() => { processCheckIn(kioskInput, "Staff Scan/Entry"); setKioskInput(''); }} className="bg-[#001f3f] text-white px-8 rounded-xl font-bold hover:bg-blue-900 transition-colors shadow-sm">Check In</button></div>{kioskMatches.length > 0 && (<div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden text-left">{kioskMatches.map(m => (<button key={m._type + (m.airtableId || m.id)} onClick={() => { processCheckIn(m.id, "Staff Override Entry"); setKioskInput(''); }} className="w-full p-4 border-b border-slate-100 last:border-0 hover:bg-blue-50 transition-colors flex justify-between items-center group"><div><p className="font-bold text-[#001f3f] text-lg">{m.firstName} {m.lastName}</p><p className="text-[10px] text-slate-400 uppercase tracking-widest">{m.phone||'No Phone'}</p></div><div className="bg-[#1080ad] text-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm group-hover:scale-105 transition-transform">Select</div></button>))}</div>)}</div>{kioskMessage.text && (<div className={`mt-8 p-4 rounded-xl text-center font-bold text-lg ${kioskMessage.type==='success'?'bg-green-100 text-green-700':kioskMessage.type==='warning'?'bg-yellow-100 text-yellow-700':'bg-red-100 text-red-700'}`}>{kioskMessage.text}{kioskMessage.subtext && <p className="text-sm mt-1">{kioskMessage.subtext}</p>}</div>)}</div></div></div>)}

        {/* --- HELP & TRAINING TAB --- */}
        {activeTab === 'help' && (() => {
          const faqs = [
            { category: "Membership Management", icon: <Users size={20} className="text-[#1080ad]" />, items: [
                { id: 'm1', q: "How do I add a new member?", a: "Click 'Add Member' at the top of the Members tab. Fill out their name, contact info, address, plan type, billing method, and home center. Click Save and their auto-generated 4-digit PIN will appear on screen — give this to the member for kiosk check-in and Member Portal access." },
                { id: 'm2', q: "How do I add a family member?", a: "<b>Option 1 (New Family):</b> Click 'Add Member' and select a FAMILY plan (Family, Senior Family, or Corporate Family). After saving the first member, a blue 'Add Family Member' button appears.<br/><br/><b>Option 2 (Existing Family):</b> Open the primary member's profile and click the purple 'Add to Family' button at the bottom.<br/><br/><b>Note:</b> The primary member is automatically set to Month-to-Month billing. Family members are left blank so their Monthly Rate returns $0 (they're covered under the primary)." },
                { id: 'm3', q: "How do I log a member's payment?", a: "Open the member's profile. Click the green 'Log Payment' button at the bottom. Select their payment method (Cash, Check, Card, or ACH). The system instantly logs the payment and pushes their 'Next Payment Due' date forward by one month." },
                { id: 'm4', q: "What if someone forgets their PIN?", a: "Open their profile card and click the yellow 'Reset PIN' button. The system generates a new random 4-digit code instantly. Give the new PIN to the member — they'll need it for kiosk check-in and Member Portal login." },
                { id: 'm5', q: "How do I manage 24/7 badge access?", a: "Open their profile, click 'Edit Member'. Check the '24/7 Access' box and enter their key fob/badge number in the Badge Number field." },
                { id: 'm6', q: "How do I mark an orientation as complete?", a: "Open their profile and click the 'Mark Complete' button inside the blue warning banner at the top. Until orientation is marked complete, the member will be blocked from checking in at the kiosk." },
                { id: 'm7', q: "How do I print a payment reminder letter?", a: "Open a member's profile card and click the grey 'Print Letter' button. It generates a branded letter formatted for standard windowed envelopes with the Patterson HC header, member details, and amount due." },
                { id: 'm8', q: "What are the billing methods?", a: "<b>Month-to-Month:</b> Standard monthly rate, no commitment.<br/><b>Auto-Draft:</b> Slightly discounted, auto-billed monthly.<br/><b>6-Month Prepay:</b> Pay 6 months upfront at a discount.<br/><b>12-Month Prepay:</b> Pay 12 months upfront at the best rate.<br/><br/>The system auto-calculates the correct Monthly Rate based on plan type + billing method." },
                { id: 'm9', q: "What do the stoplight colors mean on a member?", a: "<b style='color:#16a34a'>Green:</b> Good standing — payment is current.<br/><b style='color:#f59e0b'>Yellow:</b> Payment is 1–14 days overdue. Member can still check in but sees a 'Please see front desk' message.<br/><b style='color:#ef4444'>Red:</b> Payment is 15+ days overdue. Member is blocked from kiosk check-in and must visit the front desk." },
                { id: 'm10', q: "Which members are comped (free)?", a: "HD6, HD6 Family, HCHF, Military, and First Day Free plans are all set to $0 automatically by the pricing engine. These members check in normally at the kiosk." },
                { id: 'm11', q: "How do I edit a member's plan, billing, or personal info?", a: "Open their profile card, click 'Edit Member' at the top. You can change their plan type, billing method, home center, contact info, sponsor, 24/7 access, badge number, discount code, and notes. Click 'Save Changes' when done." },
                { id: 'm12', q: "What happens when I change a member's plan type?", a: "The Monthly Rate auto-recalculates based on the new plan type and their current billing method. For example, switching from Single ($35/mo) to Senior ($22/mo) on Month-to-Month updates the rate immediately." },
                { id: 'm13', q: "How do discount codes work?", a: "In the Add Member or Edit Member form, enter a discount code like '$5' or '$10' in the Discount Code field. The dollar amount is subtracted from the base rate. You can also set a Discount Expiration date after which the full rate resumes." }
            ]},
            { category: "Public Kiosk (iPad / Scanner)", icon: <Smartphone size={20} className="text-[#1080ad]" />, items: [
                { id: 'k1', q: "How does the kiosk work?", a: "From the landing page, tap 'Public Kiosk'. Select Harper or Anthony (or it goes straight to the center if only one is configured). Members and visitors can either:<br/><br/>1. <b>Scan QR Badge</b> — tap the camera button and hold their QR code up<br/>2. <b>Search by name</b> — type their name, tap their result, then enter their 4-digit PIN<br/><br/>After successful check-in, a green 'Welcome' message shows for 5 seconds, then the kiosk resets for the next person." },
                { id: 'k2', q: "Can visitors check in at the kiosk?", a: "Yes! Visitors with an active pass (Day Pass, 2-Week, or Month) who have completed orientation will appear in the kiosk search results with a purple 'Visitor' badge. They enter their PIN just like members. Their visit is logged and their Total Visits count is updated automatically." },
                { id: 'k3', q: "Why can't a member check in at the kiosk?", a: "Three possible reasons:<br/><br/>1. <b>Orientation Required</b> — they haven't been oriented yet. Mark it complete in their profile.<br/>2. <b>Payment Overdue (Red)</b> — they're 15+ days past due. Log a payment or talk to them at the front desk.<br/>3. <b>Wrong PIN</b> — reset their PIN from their profile." },
                { id: 'k4', q: "Why can't a visitor check in at the kiosk?", a: "Two possible reasons:<br/><br/>1. <b>Orientation not complete</b> — mark it complete in the Visitors tab first.<br/>2. <b>Pass expired</b> — their expiration date has passed. You can renew their pass from the Visitors tab." },
                { id: 'k5', q: "How do I exit the kiosk back to the main menu?", a: "Tap the X button in the top-right corner. It will ask for a staff code. Enter <b>2026</b> to return to the landing page. This prevents members from accidentally leaving the kiosk." },
                { id: 'k6', q: "The kiosk is stuck on the Harper/Anthony selection screen.", a: "This is the normal starting state when viewingCenter is set to 'both'. Tap a center to proceed. If you need to switch centers, use the locked exit button (top-left, code 2026) to go back to the dual selection." },
                { id: 'k7', q: "How do I switch the kiosk between centers?", a: "From within a center's check-in screen, tap the 'Exit [center name]' button in the top-left corner and enter code <b>2026</b>. This takes you back to the Harper/Anthony selection screen." },
                { id: 'k8', q: "What does the yellow 'Please see front desk' message mean?", a: "The member's payment is 1–14 days overdue (yellow stoplight). They're still allowed to check in, but the kiosk reminds them to stop by the desk. This gives you a chance to collect payment or discuss their account." }
            ]},
            { category: "Member Portal", icon: <UserCircle size={20} className="text-[#16a34a]" />, items: [
                { id: 'mp1', q: "What is the Member Portal?", a: "The Member Portal lets members log in and view their own account info — membership type, account status (green/yellow/red), total visits, next payment due date, QR badge for kiosk scanning, and their recent visit history. It's read-only; they can't edit anything." },
                { id: 'mp2', q: "How do members access the Member Portal?", a: "From the landing page (the main screen with 4 buttons), tap 'Member Portal'. Search for their name, select it, then enter their 4-digit PIN. They'll see their personal dashboard." },
                { id: 'mp3', q: "Can members change their own info through the portal?", a: "No — the Member Portal is view-only. If a member needs to update their email, phone, or other details, they need to ask a director to make the change through the Director Portal." },
                { id: 'mp4', q: "Can members see their QR code in the portal?", a: "Yes — the Member Portal displays their unique QR badge that they can scan at the kiosk. They can hold their phone up to the kiosk camera for a quick check-in without typing their name or PIN." },
                { id: 'mp5', q: "Can I link directly to the Member Portal from our website?", a: "Yes! Use the URL <b>wellness-kiosk-7k6p.vercel.app?view=member_login</b> and members will land directly on the login screen without seeing the Director Portal button." }
            ]},
            { category: "Corporate Partners", icon: <Briefcase size={20} className="text-[#8b5cf6]" />, items: [
                { id: 'corp1', q: "How does corporate billing work?", a: "Corporate members pay $25/month (single) or $45/month (family) and their employer is invoiced. Go to the Corporate tab, select the billing period, and click 'Invoice' to generate a branded invoice showing each employee, their plan type, visit count, and the total amount due." },
                { id: 'corp2', q: "How do I switch a company to usage-based billing?", a: "On the Corporate tab, check the 'Usage-Based Billing' box on that company's card. When checked, only employees who actually visited during the billing period will appear on the invoice." },
                { id: 'corp3', q: "How do I log a corporate payment?", a: "Click the 'Mark as Paid' button on their company card. Select how they paid (Check, ACH, Card, Cash). This status is saved and shows on the Financial Report." },
                { id: 'corp4', q: "How do I update a company's contact info or address?", a: "On the Corporate tab, click the blue 'Edit' button next to the company name. You can change the HR Contact Name, Email, and full mailing address." },
                { id: 'corp5', q: "How do corporate partners log in themselves?", a: "Companies can use the 'Corporate Portal' button on the landing page. They log in with their company username and access PIN (set up in Airtable). They see a read-only roster of their enrolled employees and visit counts." },
                { id: 'corp6', q: "Can I link directly to the Corporate Portal from our website?", a: "Yes! Use the URL <b>wellness-kiosk-7k6p.vercel.app?view=corp_login</b> and partners will land directly on their login screen." }
            ]},
            { category: "Visitors & Passes", icon: <Eye size={20} className="text-[#16a34a]" />, items: [
                { id: 'v1', q: "What are the visitor pass types?", a: "<b>Day Pass:</b> $5, valid for one day.<br/><b>2-Week Courtesy Pass:</b> Free, valid for 14 days. Great for prospective members or referrals.<br/><b>Month Courtesy Pass:</b> Free, valid for 30 days.<br/><br/>All passes require orientation before the visitor can check in at the kiosk." },
                { id: 'v2', q: "How do I add a new visitor?", a: "Go to the 'Visitors' tab and click 'Add Visitor' in the top right. Fill out their name, contact info, pass type, center, and referring provider. The system will generate their PIN and expiration date automatically." },
                { id: 'v3', q: "How do I renew an expired pass?", a: "In the Visitors tab, find their name and click the 'Renew' button on the right side. Select the new pass type. A fresh PIN and expiration date will be generated." },
                { id: 'v4', q: "How do visitors check in?", a: "After their orientation is marked complete, visitors can check in at the kiosk just like members — search their name and enter their PIN. They show up with a purple 'Visitor' badge in the search results." },
                { id: 'v5', q: "Where do I see expired visitors for follow-up?", a: "The Visitors tab has a 'Conversion Leads' section at the bottom showing all expired visitors with contact info — great for outreach to convert them to full members." },
                { id: 'v6', q: "What happens when a visitor's pass expires?", a: "They can no longer check in at the kiosk — they simply won't appear in the search results. Their record stays in the Visitors tab so you can see their history and contact them about converting to a full membership." },
                { id: 'v7', q: "Can a visitor become a regular member?", a: "Yes — just add them as a new member through the Members tab. Their visitor record stays for historical tracking, and they'll get a new Member ID and PIN for their membership." }
            ]},
            { category: "Classes & Check-ins", icon: <Calendar size={20} className="text-[#f59e0b]" />, items: [
                { id: 'c1', q: "How do I check someone into a class?", a: "Go to the 'Classes' tab and click 'Manage Roster' on the class you are running. A live scanner window will pop up. You can type the attendee's name or they can scan their digital badge." },
                { id: 'c2', q: "How do I manually check someone in?", a: "Go to the 'Staff Check-In' tab (the QR code icon in the sidebar). Type their name and hit 'Check In'. You can also force a check-in from their profile card." },
                { id: 'c3', q: "Does a class check-in count as a regular visit?", a: "Yes — class check-ins are logged the same way as regular kiosk check-ins. They show up in the member's visit count and in the daily check-in log." }
            ]},
            { category: "Reporting & Exports", icon: <FileText size={20} className="text-[#dd6d22]" />, items: [
                { id: 'r1', q: "How do I export today's check-in log?", a: "Go to the Dashboard tab. Under 'Quick Export', click 'Export Today's Check-in Log'. This downloads a CSV with every check-in for the day including visitor check-ins." },
                { id: 'r2', q: "How does the Financial Report work?", a: "Go to Reports, select your month/quarter, and click 'Print Financials' or 'CSV'.<br/><br/><b>Important:</b> This report only shows members who have a logged payment for that period. Unpaid members are hidden so the report is clean for the CFO. It splits into Standard Members and Corporate Members automatically." },
                { id: 'r3', q: "What is the Board Report?", a: "The Board Report generates a one-page printable summary with all KPIs: total visits, new sign-ups, retention rate, average visits per member, revenue breakdown, top visitors, and at-risk members. Perfect for monthly Patterson HC board meetings." },
                { id: 'r4', q: "How do I export the full member list?", a: "Go to the Members tab. Click the 'Export CSV' button at the top. This downloads every member with their ID, name, contact info, plan type, center, status, visits, payment date, and sponsor." },
                { id: 'r5', q: "How do I print a corporate invoice?", a: "Go to the Corporate tab, select the billing period, find the company, and click 'Invoice'. A print-ready invoice opens in a new tab with the Patterson HC header, employee breakdown, visit counts, and total amount due." },
                { id: 'r6', q: "What time period does the dashboard show?", a: "The Dashboard always shows today's check-ins in real-time. The heatmap and stat cards reflect all historical data. The Reports tab lets you filter by specific months or quarters." }
            ]},
            { category: "System & Administration", icon: <ShieldCheck size={20} className="text-[#f59e0b]" />, items: [
                { id: 's1', q: "Who are the directors?", a: "<b>Patrick Johnson</b> — Harper Wellness Center (620) 896-1202<br/><b>Deanna Smithhisler</b> — Anthony Wellness Center (620) 842-5190<br/><br/>Directors log in through the 'Director Portal' button on the landing page." },
                { id: 's2', q: "How does the session timeout work?", a: "Director and Corporate Portal sessions last 8 hours of inactivity. Any click, keystroke, scroll, or touch resets the timer. After 8 hours of no activity, you'll be logged out automatically." },
                { id: 's3', q: "How do I switch between viewing Harper and Anthony?", a: "In the Director Portal sidebar, under 'Viewing', click Harper, Anthony, or Both Centers. This filters all dashboard data, member lists, visits, and reports to that center." },
                { id: 's4', q: "Can I delete a member?", a: "Only System Admins can delete members. Open the member's profile and click the red 'Delete' button. You'll be asked to confirm. This is permanent." },
                { id: 's5', q: "What is the secret scanner?", a: "There's a hidden button in the bottom-right corner of the landing page (very faint lock icon). This opens a simple QR scanner that works across both centers — useful for quick staff check-ins without entering the full kiosk." },
                { id: 's6', q: "Where is the data stored?", a: "All member, visitor, corporate partner, and visit data is stored in Airtable. The Wellness Hub reads and writes to Airtable through API routes hosted on Vercel. The Drupal website (pattersonhc.org) is separate and hosts FitForge." },
                { id: 's7', q: "What is the Wellness Hub URL?", a: "The app lives at <b>wellness-kiosk-7k6p.vercel.app</b>. It auto-deploys from GitHub whenever code changes are pushed. No server management needed." },
                { id: 's8', q: "What staff code exits the kiosk?", a: "The staff code is <b>2026</b>. This is used to exit the kiosk view and to switch between centers within the kiosk." },
                { id: 's9', q: "How do I contact Kristen for system support?", a: "Kristen manages the Wellness Hub system at Patterson HC. Reach out to her for any technical issues, feature requests, or Airtable questions." }
            ]},
            { category: "Troubleshooting", icon: <AlertCircle size={20} className="text-[#ef4444]" />, items: [
                { id: 't1', q: "A member says their PIN isn't working", a: "Open their profile in the Director Portal and click 'Reset PIN'. Give them the new 4-digit code. If the problem persists, make sure they're entering the PIN correctly — it's exactly 4 digits, no letters." },
                { id: 't2', q: "The kiosk camera isn't scanning QR codes", a: "Make sure the member is holding their QR code steady and well-lit. If the camera still won't scan, tap 'Cancel Scan' and have them use the name search instead. If the camera never activates, check that browser permissions allow camera access." },
                { id: 't3', q: "A member shows as 'OVERDUE' but they paid", a: "Their payment may not have been logged in the system. Open their profile, click 'Log Payment', and select the method they used. This will update their status to Active and push the next payment date forward." },
                { id: 't4', q: "The page is loading slowly or showing errors", a: "The Wellness Hub loads all member data from Airtable on startup. If Airtable is slow or temporarily down, the app may take longer to load. Try refreshing the page. If errors persist, check that the Vercel deployment is healthy." },
                { id: 't5', q: "A visitor completed orientation but still can't check in", a: "Make sure their orientation was marked complete in the Director Portal's Visitors tab — not just verbally confirmed. Click the 'Orient' button next to their name, or open their profile and click 'Mark Orientation Complete'." },
                { id: 't6', q: "I accidentally deleted a member", a: "Deletion is permanent in the Wellness Hub. You would need to re-add them as a new member through the Add Member form. Their visit history linked to the old record cannot be recovered, but their visits are still logged in the Visits table in Airtable." }
            ]}
          ];
          const helpSearchLower = helpSearch.toLowerCase();
          const filteredFaqs = helpSearch.length === 0 ? faqs : faqs.map(section => ({
            ...section,
            items: section.items.filter(faq => faq.q.toLowerCase().includes(helpSearchLower) || faq.a.toLowerCase().includes(helpSearchLower))
          })).filter(section => section.items.length > 0);
          const totalResults = filteredFaqs.reduce((sum, s) => sum + s.items.length, 0);
          return (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
              <div className="mb-8 text-center bg-gradient-to-br from-[#001f3f] to-[#1080ad] p-12 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
                 <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                 <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
                 <HelpCircle size={48} className="mx-auto mb-6 text-blue-200" />
                 <h2 className="text-4xl font-black tracking-tight mb-4 relative z-10">Help & Training Center</h2>
                 <p className="text-blue-100 font-medium text-lg max-w-2xl mx-auto relative z-10 mb-8">Your complete guide to managing members, billing, and facility operations.</p>
                 <div className="relative max-w-xl mx-auto z-10">
                   <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40" />
                   <input type="text" placeholder="Search help topics..." value={helpSearch} onChange={(e) => setHelpSearch(e.target.value)} className="w-full pl-14 pr-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 outline-none focus:bg-white/20 focus:border-white/40 transition-all text-lg font-medium" />
                   {helpSearch && <button onClick={() => setHelpSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"><X size={18} /></button>}
                 </div>
              </div>
              {helpSearch && <p className="text-sm text-slate-400 font-bold text-center">{totalResults} result{totalResults !== 1 ? 's' : ''} for "{helpSearch}"</p>}
              <div className="space-y-6">
                {filteredFaqs.map((section, idx) => (
                  <div key={idx} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-100 p-6 flex items-center gap-3"><div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100">{section.icon}</div><h3 className="text-xl font-black text-[#001f3f]">{section.category}</h3></div>
                    <div className="divide-y divide-slate-100">{section.items.map(faq => (
                        <div key={faq.id} className="group">
                          <button onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)} className="w-full text-left p-6 flex justify-between items-center hover:bg-slate-50/50 transition-colors focus:outline-none">
                            <span className={`font-bold text-lg transition-colors pr-8 ${expandedFaq === faq.id ? 'text-[#1080ad]' : 'text-slate-700 group-hover:text-[#1080ad]'}`}>{faq.q}</span>
                            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-300 ${expandedFaq === faq.id ? 'bg-blue-100 text-[#1080ad] rotate-90' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-[#1080ad]'}`}><ChevronRight size={18} /></div>
                          </button>
                          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${(helpSearch && helpSearchLower.length >= 2) || expandedFaq === faq.id ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="p-6 pt-0 text-slate-600 leading-relaxed text-sm" dangerouslySetInnerHTML={{ __html: faq.a }} />
                          </div>
                        </div>
                    ))}</div>
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
              <form onSubmit={async (e) => { e.preventDefault(); const updates = { recordId: editingCorp.id, contactName: e.target.c_contactName.value, contactEmail: e.target.c_contactEmail.value, address: e.target.c_address.value, city: e.target.c_city.value, state: e.target.c_state.value, zip: e.target.c_zip.value }; try { await fetch('/api/update-corporate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) }); setCorporatePartners(prev => prev.map(c => c.id === editingCorp.id ? { ...c, ...updates } : c)); setEditingCorp(null); } catch(err) { alert('Network error updating partner.'); } }} className="space-y-4">
                <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">HR Contact Name</label><input id="c_contactName" defaultValue={editingCorp.contactName} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#1080ad]" /></div>
                <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Contact Email</label><input id="c_contactEmail" type="email" defaultValue={editingCorp.contactEmail} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#1080ad]" /></div>
                <div className="col-span-2"><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Street Address</label><input id="c_address" defaultValue={editingCorp.address} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#1080ad]" /></div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1"><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">City</label><input id="c_city" defaultValue={editingCorp.city} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#1080ad]" /></div>
                  <div className="col-span-1"><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">State</label><input id="c_state" defaultValue={editingCorp.state} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#1080ad]" /></div>
                  <div className="col-span-1"><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Zip</label><input id="c_zip" defaultValue={editingCorp.zip} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#1080ad]" /></div>
                </div>
                <div className="flex gap-3 mt-8"><button type="submit" className="flex-1 bg-[#1080ad] text-white py-4 rounded-xl font-bold hover:bg-blue-800 transition-colors">Save Changes</button><button type="button" onClick={() => setEditingCorp(null)} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-xl font-bold hover:bg-slate-200 transition-colors">Cancel</button></div>
              </form>
           </div>
        </div>
      )}


      {/* EDIT VISITOR MODAL */}
      {editingVisitor && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-[#001f3f]/90 backdrop-blur-md">
           <div className="bg-white rounded-[2rem] w-full max-w-xl p-10 relative shadow-2xl max-h-[90vh] overflow-y-auto">
              <button onClick={() => setEditingVisitor(null)} className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-all"><X size={24}/></button>
              <h2 className="text-3xl font-black text-[#001f3f] mb-2 tracking-tight">Edit Visitor</h2>
              <p className="text-slate-500 font-medium mb-8">Update info for {editingVisitor.firstName} {editingVisitor.lastName}.</p>
              <form onSubmit={async (e) => { e.preventDefault(); const updates = { visitorAirtableId: editingVisitor.airtableId, firstName: e.target.ev_fname.value, lastName: e.target.ev_lname.value, email: e.target.ev_email.value, phone: e.target.ev_phone.value, address: e.target.ev_address.value, city: e.target.ev_city.value, state: e.target.ev_state.value, zip: e.target.ev_zip.value, referringProvider: e.target.ev_provider.value, notes: e.target.ev_notes.value, passType: e.target.ev_pass.value, center: e.target.ev_center.value }; try { const res = await fetch('/api/update-visitor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) }); const result = await res.json(); if (result.success) { setVisitors(prev => prev.map(v => v.airtableId === editingVisitor.airtableId ? { ...v, firstName: updates.firstName, lastName: updates.lastName, email: updates.email, phone: updates.phone, address: updates.address, city: updates.city, state: updates.state, zip: updates.zip, referringProvider: updates.referringProvider, notes: updates.notes, passType: updates.passType, center: updates.center } : v)); setEditingVisitor(null); if (selectedVisitor && selectedVisitor.airtableId === editingVisitor.airtableId) { setSelectedVisitor(prev => ({ ...prev, firstName: updates.firstName, lastName: updates.lastName, email: updates.email, phone: updates.phone, address: updates.address, city: updates.city, state: updates.state, zip: updates.zip, referringProvider: updates.referringProvider, notes: updates.notes, passType: updates.passType, center: updates.center })); } } else { alert('Error: ' + result.error); } } catch (err) { alert('Network error.'); } }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">First Name</label><input id="ev_fname" defaultValue={editingVisitor.firstName} required className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#8b5cf6]" /></div><div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Last Name</label><input id="ev_lname" defaultValue={editingVisitor.lastName} required className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#8b5cf6]" /></div></div>
                <div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Email</label><input type="email" id="ev_email" defaultValue={editingVisitor.email} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#8b5cf6]" /></div><div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Phone</label><input id="ev_phone" defaultValue={editingVisitor.phone} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#8b5cf6]" /></div></div>
                <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Street Address</label><input id="ev_address" defaultValue={editingVisitor.address} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#8b5cf6]" /></div>
                <div className="grid grid-cols-3 gap-3"><div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">City</label><input id="ev_city" defaultValue={editingVisitor.city} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#8b5cf6]" /></div><div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">State</label><input id="ev_state" defaultValue={editingVisitor.state || 'KS'} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#8b5cf6]" /></div><div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Zip</label><input id="ev_zip" defaultValue={editingVisitor.zip} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#8b5cf6]" /></div></div>
                <div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Pass Type</label><select id="ev_pass" defaultValue={editingVisitor.passType} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#8b5cf6] font-bold"><option value="Day Pass">Day Pass ($5)</option><option value="2-Week Courtesy">2-Week Courtesy</option><option value="Month Courtesy">Month Courtesy</option></select></div><div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Center</label><select id="ev_center" defaultValue={editingVisitor.center} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#8b5cf6] font-bold"><option value="Anthony Wellness Center">Anthony</option><option value="Harper Wellness Center">Harper</option></select></div></div>
                <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Referring Provider</label><input id="ev_provider" defaultValue={editingVisitor.referringProvider} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#8b5cf6]" /></div>
                <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Notes</label><input id="ev_notes" defaultValue={editingVisitor.notes} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#8b5cf6]" /></div>
                <div className="flex gap-3 mt-8"><button type="submit" className="flex-1 bg-[#8b5cf6] text-white py-4 rounded-xl font-bold hover:bg-purple-700 transition-colors">Save Changes</button><button type="button" onClick={() => setEditingVisitor(null)} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-xl font-bold hover:bg-slate-200 transition-colors">Cancel</button></div>
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
            <form onSubmit={async (e) => { e.preventDefault(); const formData = { firstName: e.target.vfname.value, lastName: e.target.vlname.value, email: e.target.vemail.value, phone: e.target.vphone.value, address: e.target.vaddress.value, city: e.target.vcity.value, state: e.target.vstate.value, zip: e.target.vzip.value, passType: e.target.vpass.value, center: e.target.vcenter.value, referringProvider: e.target.vprovider.value, notes: e.target.vnotes.value }; try { const res = await fetch('/api/add-visitor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) }); const result = await res.json(); if (result.success) { alert(`Visitor added!\n\nPIN: ${result.pin}\nExpires: ${new Date(result.expirationDate + 'T00:00:00').toLocaleDateString('en-US', {month:'long',day:'numeric',year:'numeric'})}${result.amountPaid > 0 ? `\nAmount: $${result.amountPaid}` : '\nCourtesy pass — no charge'}\n\nGive this PIN to the visitor for kiosk check-in after their first visit.`); setShowAddVisitorModal(false); fetch('/api/get-visitors').then(r => r.json()).then(data => { if (data.records) { setVisitors(data.records.map(r => ({ airtableId: r.id, firstName: r.fields['First Name'] || '', lastName: r.fields['Last Name'] || '', email: r.fields['Email'] || '', phone: r.fields['Phone'] || '', passType: r.fields['Pass Type'] || '', amountPaid: r.fields['Amount Paid'] || 0, referringProvider: r.fields['Referring Provider'] || '', purchaseDate: r.fields['Purchase Date'] || '', expirationDate: r.fields['Expiration Date'] || '', center: r.fields['Center'] || '', pin: r.fields['PIN'] || '', orientationComplete: !!r.fields['Orientation Complete'], totalVisits: r.fields['Total Visits'] || 0, address: r.fields['Street Address'] || '', city: r.fields['City'] || '', state: r.fields['State'] || '', zip: r.fields['Zip'] || '', notes: r.fields['Notes'] || '', passActivated: r.fields['Pass Activated'] !== false && r.fields['Pass Activated'] !== 'false' }))); } }); } else { alert('Error: ' + result.error); } } catch (err) { alert('Network error. Please try again.'); } }} className="space-y-5">
              <div className="grid grid-cols-2 gap-5"><div><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">First Name</label><input id="vfname" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors" /></div><div><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">Last Name</label><input id="vlname" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors" /></div></div>
              <div className="grid grid-cols-2 gap-5"><div><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">Email</label><input type="email" id="vemail" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors" /></div><div><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">Phone</label><input id="vphone" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors" /></div></div>
              <div className="grid grid-cols-2 gap-5"><div className="col-span-2"><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">Street Address</label><input id="vaddress" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors" /></div><div><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">City</label><input id="vcity" placeholder="Harper" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors" /></div><div className="grid grid-cols-2 gap-3"><div><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">State</label><input id="vstate" defaultValue="KS" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors" /></div><div><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">Zip</label><input id="vzip" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors" /></div></div></div>
              <div className="grid grid-cols-2 gap-5"><div><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">Pass Type</label><select id="vpass" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors font-bold text-slate-700"><option value="Day Pass">Day Pass ($5)</option><option value="2-Week Courtesy">2-Week Courtesy (Free)</option><option value="Month Courtesy">Month Courtesy (Free)</option></select></div><div><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">Home Center</label><select id="vcenter" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors font-bold text-slate-700"><option value="Anthony Wellness Center">Anthony</option><option value="Harper Wellness Center">Harper</option></select></div></div>
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
                    <button onClick={() => { setNewMemberPin(null); setShowAddModal(false); setFamilyFlow(null); setSelectedSponsor(''); setCustomSponsor(''); setLoading(true); fetch('/api/members').then(res => res.json()).then(data => { if (data.records) { const mappedMembers = data.records.filter(r => r.fields['First Name'] && r.fields['First Name'] !== '').map(r => { let planText = r.fields['Plan Name'] ? (Array.isArray(r.fields['Plan Name']) ? r.fields['Plan Name'][0] : r.fields['Plan Name']) : 'UNKNOWN PLAN'; let rawPassword = String(r.fields['Password'] || '').trim(); let finalPassword = (rawPassword === '' || rawPassword.includes('ERROR')) ? '1111' : rawPassword; return { airtableId: r.id, id: r.fields['Member ID'] || r.id, firstName: r.fields['First Name'] || 'Unknown', lastName: r.fields['Last Name'] || '', email: r.fields['Email'] || '', phone: r.fields['Phone'] || '', password: finalPassword, status: (r.fields['Membership Status'] || 'ACTIVE').toUpperCase(), type: String(planText).toUpperCase().trim(), center: r.fields['Home Center'] || 'Anthony', visits: Number(r.fields['Total Visits'] || 0), nextPayment: r.fields['Next Payment Due'] || null, sponsor: !!r.fields['Corporate Sponsor'], sponsorName: r.fields['Corporate Sponsor'] ? String(r.fields['Corporate Sponsor']).trim() : '', needsOrientation: !!r.fields['Needs Orientation'], familyName: r.fields['Family Name'] ? (Array.isArray(r.fields['Family Name']) ? r.fields['Family Name'][0] : r.fields['Family Name']) : '', billingMethod: r.fields['Billing Method'] || '', monthlyRate: r.fields['Monthly Rate'] || '', access247: !!r.fields['24/7 Access'], badgeNumber: r.fields['Badge Number'] || '', startDate: r.fields['Start Date'] || null, notes: r.fields['Notes'] || '', discountCode: r.fields['Discount Code'] || '', discountExpiration: r.fields['Discount Expiration'] || null, address: r.fields['Street Address'] || '', city: r.fields['City'] || '', state: r.fields['State'] || 'KS', zip: r.fields['Zip'] || '', paymentMethod: Array.isArray(r.fields['Payment Method']) ? r.fields['Payment Method'][r.fields['Payment Method'].length - 1] : (r.fields['Payment Method'] || '') }; }); setMembers(mappedMembers); } setLoading(false); }); }} className={`${familyFlow ? 'flex-1' : 'w-full'} bg-[#001f3f] text-white px-8 py-4 rounded-xl font-bold`}>Done</button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-3xl font-black text-[#001f3f] mb-2 tracking-tight">{familyFlow ? `Add to ${familyFlow.familyName}` : 'Manual Registration'}</h3>
                  <p className="text-slate-500 font-medium mb-8">{familyFlow ? `Adding a family member to the ${familyFlow.lastName} household.` : 'Add a new member. A random PIN will be generated automatically.'}</p>
                  <form onSubmit={handleAddMemberSubmit} className="space-y-5">
                     <div className="grid grid-cols-2 gap-5"><div><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">First Name</label><input id="fname" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors" /></div><div><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">Last Name</label><input id="lname" required defaultValue={familyFlow ? familyFlow.lastName : ''} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors" /></div></div>
                     <div className="grid grid-cols-2 gap-5"><div><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">Email</label><input type="email" id="email" defaultValue={familyFlow ? familyFlow.email : ''} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors" /></div><div><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">Phone</label><input id="phone" defaultValue={familyFlow ? familyFlow.phone : ''} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors" /></div><div><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">Start Date</label><input type="date" id="startDate" defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors mb-2" /><label className="flex items-center gap-2 ml-2 cursor-pointer group bg-blue-50 border border-blue-100 p-3 rounded-xl hover:bg-blue-100 transition-colors shadow-sm"><input type="checkbox" onChange={(e) => { const dateInput = document.getElementById('startDate'); const d = new Date(); if (e.target.checked) d.setDate(d.getDate() + 1); dateInput.value = d.toISOString().split('T')[0]; }} className="w-5 h-5 rounded border-slate-300 text-[#1080ad] focus:ring-[#1080ad] cursor-pointer" /><span className="text-xs font-bold text-[#1080ad] uppercase tracking-widest">First Day Free (Starts Tomorrow)</span></label></div></div>
                     <div className="grid grid-cols-2 gap-5"><div className="col-span-2"><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">Street Address</label><input id="address" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors" /></div><div><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">City</label><input id="city" placeholder="Harper" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors" /></div><div className="grid grid-cols-2 gap-3"><div><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">State</label><input id="mstate" defaultValue="KS" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors" /></div><div><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">Zip</label><input id="mzip" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors" /></div></div></div>
                     {!familyFlow && (
                       <>
                         <div className="grid grid-cols-2 gap-5"><div><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">Plan Type</label><select id="plan" onChange={e => { const v = e.target.value; if (!v.includes('CORPORATE') && !v.includes('HD6') && !v.includes('HCHF')) { setSelectedSponsor(''); setCustomSponsor(''); } }} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors font-bold text-slate-700"><option value="SINGLE">Single</option><option value="FAMILY">Family</option><option value="SENIOR">Senior</option><option value="SENIOR FAMILY">Senior Family</option><option value="STUDENT">Student (14-22)</option><option value="CORPORATE">Corporate</option><option value="CORPORATE FAMILY">Corporate Family</option><option value="MILITARY">Military</option><option value="MILITARY FAMILY">Military Family</option><option value="HD6">Staff (HD6)</option><option value="HD6 FAMILY">Staff Family (HD6)</option></select></div><div><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">Home Center</label><select id="center" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors font-bold text-slate-700"><option value="Anthony Wellness Center">Anthony</option><option value="Harper Wellness Center">Harper</option></select></div></div>
                         <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">Billing Method</label><select id="billing" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors font-bold text-slate-700"><option value="Month-to-Month">Month-to-Month</option><option value="Auto-Draft">Auto-Draft</option><option value="6-Month Prepay">6-Month Prepay</option><option value="12-Month Prepay">12-Month Prepay</option></select></div>
                         <div id="sponsor-section"><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">Corporate Sponsor</label><select value={selectedSponsor} onChange={e => { setSelectedSponsor(e.target.value); if (e.target.value !== '__other__') setCustomSponsor(''); }} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors font-bold text-slate-700"><option value="">None</option>{corporatePartners.map(cp => (<option key={cp.name} value={cp.sponsorMatch}>{cp.name}</option>))}<option value="__other__">Other (type below)</option></select>{selectedSponsor === '__other__' && (<input placeholder="Enter company name" value={customSponsor} onChange={e => setCustomSponsor(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors mt-3" />)}</div>
                         <div className="grid grid-cols-2 gap-5 mt-2 mb-2"><div><label className="text-xs font-bold text-green-600 uppercase mb-1 ml-2 block tracking-widest">Discount / Promo</label><input id="discount" placeholder="e.g. Farm Bureau $10" className="w-full p-4 bg-green-50 border border-green-200 rounded-xl outline-none focus:border-green-600 font-bold text-green-800 placeholder:text-green-300 transition-colors" /></div><div><label className="text-xs font-bold text-green-600 uppercase mb-1 ml-2 block tracking-widest">Expiration Date</label><input type="date" id="discount_exp" className="w-full p-4 bg-green-50 border border-green-200 rounded-xl outline-none focus:border-green-600 font-bold text-green-800 transition-colors" /></div></div>
                         <label className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4 cursor-pointer hover:bg-amber-100 transition-colors"><input type="checkbox" id="access247" className="w-5 h-5 rounded border-slate-300 text-[#f59e0b] focus:ring-[#f59e0b]" /><div><p className="text-sm font-bold text-amber-800">24/7 Badge Access</p><p className="text-[10px] text-amber-500">Member has a key fob or badge for after-hours access</p></div></label>
                         <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 ml-2 block tracking-widest">24/7 Badge Number</label><input id="badgenum" placeholder="e.g. 1042" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] transition-colors" /></div>
                         <label className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4 cursor-pointer hover:bg-blue-100 transition-colors"><input type="checkbox" id="orientation" defaultChecked={true} className="w-5 h-5 rounded border-slate-300 text-[#1080ad] focus:ring-[#1080ad]" /><div><p className="text-sm font-bold text-blue-800">Needs Orientation</p><p className="text-[10px] text-blue-500">Member will need a facility walkthrough before checking in</p></div></label>
                       </>
                     )}
                     {familyFlow && (
                       <>
                         <input type="hidden" id="plan" value={familyFlow.plan} />
                         <input type="hidden" id="center" value={familyFlow.center} />
                         <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-3"><Users size={18} className="text-blue-600" /><div><p className="text-sm font-bold text-blue-800">{familyFlow.plan} · {familyFlow.center}</p><p className="text-[10px] text-blue-500">Same plan and center as primary member</p></div></div>
                         <label className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4 cursor-pointer hover:bg-blue-100 transition-colors"><input type="checkbox" id="orientation" defaultChecked={true} className="w-5 h-5 rounded border-slate-300 text-[#1080ad] focus:ring-[#1080ad]" /><div><p className="text-sm font-bold text-blue-800">Needs Orientation</p><p className="text-[10px] text-blue-500">This family member also needs a walkthrough</p></div></label>
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
                    {selectedMember.address && (<div className="col-span-2"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Address</p><p className="text-sm font-bold text-slate-800">{[selectedMember.address, selectedMember.city, selectedMember.state, selectedMember.zip].filter(Boolean).join(', ')}</p></div>)}
                    {selectedMember.sponsorName && (<div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Corporate Sponsor</p><p className="text-lg font-bold text-[#dd6d22]">{selectedMember.sponsorName}</p></div>)}
                    {selectedMember.familyName && (<div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Family Group</p><p className="text-lg font-bold text-[#8b5cf6]">{selectedMember.familyName}</p></div>)}
                    {selectedMember.access247 && (<div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">24/7 Access</p><p className="text-lg font-bold text-[#f59e0b]">Badge #{selectedMember.badgeNumber || 'N/A'}</p></div>)}
                    {selectedMember.discountCode && (<div><p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Active Discount</p><p className="text-lg font-black text-[#16a34a]">🎟️ {selectedMember.discountCode} <span className="text-xs font-medium text-slate-500 block mt-1">Expires: {selectedMember.discountExpiration ? new Date(selectedMember.discountExpiration + 'T00:00:00').toLocaleDateString() : 'Never'}</span></p></div>)}
                 </div>
                 {selectedMember.notes && (<div className="col-span-2 mt-6"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Director Notes</p><p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap">{selectedMember.notes}</p></div>)}
                 <div className="col-span-2 mt-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Check-in History</p>
                    {(() => { const memberVisits = visits.filter(v => v.name.toLowerCase() === `${selectedMember.firstName} ${selectedMember.lastName}`.toLowerCase()); const displayVisits = showAllMemberVisits ? memberVisits : memberVisits.slice(0, 5); if (memberVisits.length === 0) return <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100 italic">No recent visits on file.</p>; return (<div><div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">{displayVisits.map((v, i) => (<div key={i} className="flex justify-between items-center bg-blue-50 p-3 rounded-xl border border-blue-100"><span className="font-bold text-slate-800 text-sm flex items-center gap-2"><CheckCircle size={14} className="text-[#1080ad]"/> {v.center} <span className="text-xs font-medium text-slate-500 hidden md:inline ml-1">({v.method || 'General Workout'})</span></span><span className="font-bold text-[#1080ad] text-xs">{new Date(v.time).toLocaleDateString()} @ {new Date(v.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div>))}</div>{memberVisits.length > 5 && (<button onClick={() => setShowAllMemberVisits(!showAllMemberVisits)} className="w-full py-2 mt-3 text-sm font-bold text-[#1080ad] hover:text-[#001f3f] transition-colors bg-blue-50/50 rounded-lg border border-blue-100 hover:bg-blue-50">{showAllMemberVisits ? 'Show Less ↑' : `See All ${memberVisits.length} Visits →`}</button>)}</div>); })()}
                 </div>
                 </>) : (<>
                 <div className="space-y-4 mb-8">
                    <div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">First Name</label><input id="ed_fname" defaultValue={selectedMember.firstName} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#1080ad]" /></div><div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Last Name</label><input id="ed_lname" defaultValue={selectedMember.lastName} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#1080ad]" /></div></div>
                    <div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Email</label><input id="ed_email" defaultValue={selectedMember.email} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#1080ad]" /></div><div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Phone</label><input id="ed_phone" defaultValue={selectedMember.phone} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#1080ad]" /></div></div>
                    <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Street Address</label><input id="ed_address" defaultValue={selectedMember.address} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#1080ad]" /></div>
                    <div className="grid grid-cols-3 gap-3"><div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">City</label><input id="ed_city" defaultValue={selectedMember.city} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#1080ad]" /></div><div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">State</label><input id="ed_state" defaultValue={selectedMember.state || 'KS'} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#1080ad]" /></div><div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Zip</label><input id="ed_zip" defaultValue={selectedMember.zip} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#1080ad]" /></div></div>
                    <div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Plan Type</label><select id="ed_plan" defaultValue={selectedMember.type} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#1080ad] font-bold"><option value="SINGLE">Single</option><option value="FAMILY">Family</option><option value="SENIOR">Senior</option><option value="SENIOR FAMILY">Senior Family</option><option value="STUDENT">Student (14-22)</option><option value="CORPORATE">Corporate</option><option value="CORPORATE FAMILY">Corporate Family</option><option value="MILITARY">Military</option><option value="MILITARY FAMILY">Military Family</option><option value="HD6">Staff (HD6)</option><option value="HD6 FAMILY">Staff Family (HD6)</option></select></div><div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Billing Method</label><select id="ed_billing" defaultValue={selectedMember.billingMethod || 'Month-to-Month'} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#1080ad] font-bold"><option value="Month-to-Month">Month-to-Month</option><option value="Auto-Draft">Auto-Draft</option><option value="6-Month Prepay">6-Month Prepay</option><option value="12-Month Prepay">12-Month Prepay</option></select></div></div>
                    <div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Home Center</label><select id="ed_center" defaultValue={selectedMember.center} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#1080ad] font-bold"><option value="Anthony Wellness Center">Anthony</option><option value="Harper Wellness Center">Harper</option></select></div><div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Corporate Sponsor</label><select id="ed_sponsor" defaultValue={selectedMember.sponsorName} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#1080ad] font-bold"><option value="">None</option>{corporatePartners.map(cp => (<option key={cp.name} value={cp.sponsorMatch}>{cp.name}</option>))}</select></div></div>
                    <div className="grid grid-cols-2 gap-4"><label className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl p-3 cursor-pointer"><input type="checkbox" id="ed_247" defaultChecked={selectedMember.access247} className="w-4 h-4 rounded" /><span className="text-sm font-bold text-amber-800">24/7 Access</span></label><div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Badge Number</label><input id="ed_badge" defaultValue={selectedMember.badgeNumber} className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#1080ad]" /></div></div>
                    <div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-bold text-green-600 uppercase mb-1 block tracking-widest">Discount / Promo</label><input id="ed_discount" defaultValue={selectedMember.discountCode} placeholder="e.g. Farm Bureau $10" className="w-full p-3 bg-green-50 border border-green-200 rounded-xl text-sm outline-none focus:border-green-600 font-bold text-green-800 placeholder:text-green-300" /></div><div><label className="text-xs font-bold text-green-600 uppercase mb-1 block tracking-widest">Expiration Date</label><input type="date" id="ed_discount_exp" defaultValue={selectedMember.discountExpiration || ''} className="w-full p-3 bg-green-50 border border-green-200 rounded-xl text-sm outline-none focus:border-green-600 font-bold text-green-800" /></div></div>
                    <div className="col-span-2 mt-2 mb-4"><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Director Notes</label><textarea id="ed_notes" defaultValue={selectedMember.notes || ''} placeholder="Add private notes about this member..." className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:border-[#1080ad] min-h-[100px]"></textarea></div>
                   <div className="flex gap-3 mt-4">
                      <button onClick={async () => { const selectedPlan = document.getElementById('ed_plan').value; const selectedBilling = document.getElementById('ed_billing').value; const enteredDiscount = document.getElementById('ed_discount').value; const basePrice = getBaseRate(selectedPlan, selectedBilling); const discountMatch = enteredDiscount.match(/\$(\d+)/); const discountAmount = discountMatch ? parseInt(discountMatch[1], 10) : 0; const finalMonthlyRate = Math.max(0, basePrice - discountAmount); const updates = { airtableId: selectedMember.airtableId, firstName: document.getElementById('ed_fname').value, lastName: document.getElementById('ed_lname').value, email: document.getElementById('ed_email').value, phone: document.getElementById('ed_phone').value, address: document.getElementById('ed_address').value, city: document.getElementById('ed_city').value, state: document.getElementById('ed_state').value, zip: document.getElementById('ed_zip').value, plan: selectedPlan, billingMethod: selectedBilling, center: document.getElementById('ed_center').value, sponsor: document.getElementById('ed_sponsor').value, access247: document.getElementById('ed_247').checked, badgeNumber: document.getElementById('ed_badge').value, notes: document.getElementById('ed_notes').value, discountCode: enteredDiscount, discountExpiration: document.getElementById('ed_discount_exp').value, monthlyRate: finalMonthlyRate }; try { const res = await fetch('/api/update-member', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) }); const result = await res.json(); if (result.success || res.ok) { const updated = { ...selectedMember, firstName: updates.firstName, lastName: updates.lastName, email: updates.email, phone: updates.phone, address: updates.address, city: updates.city, state: updates.state, zip: updates.zip, type: updates.plan, billingMethod: updates.billingMethod, center: updates.center, sponsorName: updates.sponsor, access247: updates.access247, badgeNumber: updates.badgeNumber, notes: updates.notes, discountCode: updates.discountCode, discountExpiration: updates.discountExpiration, monthlyRate: updates.monthlyRate }; setSelectedMember(updated); setMembers(prev => prev.map(m => m.airtableId === selectedMember.airtableId ? updated : m)); setEditMode(false); } else { alert('Airtable Error: ' + result.error); } } catch (err) { alert('Network error.'); } }} className="flex-1 bg-[#1080ad] text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors">Save Changes</button>
                      <button onClick={() => setEditMode(false)} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors">Cancel</button>
                    </div>
                 </div>
                 </>)}

                 <div className="mt-14 grid grid-cols-2 md:grid-cols-3 gap-3">
                    <button onClick={() => { processCheckIn(selectedMember.id, "Director Override"); setSelectedMember(null); }} className="col-span-2 md:col-span-3 bg-[#001f3f] text-white py-4 rounded-xl font-bold shadow-xl shadow-blue-900/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"><CheckCircle size={18} /> Force Manual Check-In</button>
                    <button onClick={() => setEditMode(!editMode)} className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white py-4 rounded-xl font-bold shadow-sm transition-all flex flex-col items-center justify-center gap-2 text-xs"><FileText size={20} /> Edit Member</button>
                    {selectedMember.type.includes('FAMILY') && (<button onClick={() => { setFamilyFlow({ familyRecordId: selectedMember.airtableId, familyName: selectedMember.familyName || `${selectedMember.lastName} Family`, lastName: selectedMember.lastName, plan: selectedMember.type, center: selectedMember.center, email: selectedMember.email, phone: selectedMember.phone, corporateSponsor: selectedMember.sponsorName, addedMembers: [] }); setShowAddModal(true); setSelectedMember(null); }} className="bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white py-4 rounded-xl font-bold shadow-sm transition-all flex flex-col items-center justify-center gap-2 text-xs"><Users size={20} /> Add to Family</button>)}
                    <button onClick={() => setPaymentModal(selectedMember)} className="bg-green-50 text-green-600 hover:bg-green-600 hover:text-white py-4 rounded-xl font-bold shadow-sm transition-all flex flex-col items-center justify-center gap-2 text-xs"><CreditCard size={20} /> Log Payment</button>
                    <button onClick={() => { const isHarper = selectedMember.center && selectedMember.center.toLowerCase().includes('harper'); const centerName = isHarper ? 'Harper Wellness Center' : 'Anthony Wellness Center'; const centerAddr = isHarper ? '615 W 12th St, Harper, KS 67058' : '309 W Main St, Anthony, KS 67003'; const centerPhone = isHarper ? '(620) 896-1202' : '(620) 842-5190'; const centerHours = isHarper ? 'M-F 8am-12pm &amp; 5pm-8pm, Sat 9am-noon' : 'M-F 7am-8pm, Sat 8am-1pm'; const directorName = isHarper ? 'Patrick Johnson' : 'Deanna Smithhisler'; const addressBlock = selectedMember.address ? `${selectedMember.address}<br/>${selectedMember.city}, ${selectedMember.state} ${selectedMember.zip}` : 'Address not on file'; const w = window.open('', '_blank'); w.document.write(`<!DOCTYPE html><html><head><title>Payment Reminder - ${selectedMember.firstName} ${selectedMember.lastName}</title><style>@media print{body{margin:0}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}}body{font-family:Arial,sans-serif;color:#1e293b;margin:0}.page{max-width:680px;margin:0 auto}.hdr{background:#003d6b;padding:20px 44px;display:flex;justify-content:space-between;align-items:center}.hdr-left{display:flex;align-items:center;gap:16px}.hdr-logo{height:36px;opacity:.95}.hdr-name{font-size:18px;font-weight:700;color:#fff}.hdr-sub{font-size:10px;color:#8bb8d9;letter-spacing:1px;margin-top:2px}.accent{height:3px;background:linear-gradient(to right,#dba51f,#dd6d22)}.body{padding:32px 44px}.top-row{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px}.addr{font-size:14px;line-height:1.6}.date{font-size:12px;color:#94a3b8}.greeting{font-size:13px;margin-bottom:10px}.intro{font-size:13px;color:#475569;line-height:1.8;margin-bottom:20px}.box{border:1.5px solid #003d6b;border-radius:6px;overflow:hidden;margin-bottom:20px}.box-hdr{background:#003d6b;padding:8px 16px;font-size:10px;font-weight:700;color:#fff;letter-spacing:1.5px}.box-body{padding:2px 16px}.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0}.row:last-child{border-bottom:none}.lbl{font-size:12px;color:#64748b}.val{font-size:12px;font-weight:700;color:#003d6b}.val-due{font-size:12px;font-weight:700;color:#dd6d22}.opts{font-size:12px;color:#475569;line-height:2;margin-bottom:20px;padding-left:10px;border-left:3px solid #dba51f}.opt{padding-left:10px}.opt-b{color:#003d6b;font-weight:700}.disc{font-size:12px;color:#94a3b8;margin-bottom:24px}.sign{font-size:13px;margin-bottom:2px}.sign-name{font-size:13px;font-weight:700;color:#003d6b}.sign-title{font-size:11px;color:#94a3b8}.ftr{border-top:2px solid #003d6b;padding:10px 44px;display:flex;justify-content:space-between;align-items:center;margin-top:24px}.ftr-l{font-size:10px;color:#94a3b8}.ftr-r{font-size:10px;color:#1080ad}</style></head><body><div class="page"><div class="hdr"><div class="hdr-left"><img src="https://pattersonhc.org/sites/default/files/wellness_white.png" class="hdr-logo" /><div><div class="hdr-name">${centerName}</div><div class="hdr-sub">${centerAddr} | ${centerPhone}</div></div></div></div><div class="accent"></div><div class="body"><div class="top-row"><div class="addr"><strong>${selectedMember.firstName} ${selectedMember.lastName}</strong><br/>${addressBlock}</div><div class="date">${new Date().toLocaleDateString('en-US', {month:'long',day:'numeric',year:'numeric'})}</div></div><div class="greeting">Dear ${selectedMember.firstName},</div><div class="intro">Your wellness center membership payment is coming due. Please review the details below and make your payment at your earliest convenience.</div><div class="box"><div class="box-hdr">ACCOUNT DETAILS</div><div class="box-body"><div class="row"><span class="lbl">Member ID</span><span class="val">${selectedMember.id}</span></div><div class="row"><span class="lbl">Membership</span><span class="val">${selectedMember.type}</span></div><div class="row"><span class="lbl">Amount Due</span><span class="val-due">$${selectedMember.monthlyRate || 'See front desk'}</span></div><div class="row"><span class="lbl">Due Date</span><span class="val-due">${selectedMember.nextPayment ? new Date(selectedMember.nextPayment + 'T00:00:00').toLocaleDateString('en-US', {month:'long',day:'numeric',year:'numeric'}) : 'See front desk'}</span></div></div></div><div class="opts"><div class="opt"><span class="opt-b">In person</span> — Front desk: ${centerHours}</div><div class="opt"><span class="opt-b">By phone</span> — ${centerPhone}</div><div class="opt"><span class="opt-b">By mail</span> — ${centerAddr}</div></div><div class="disc">If you have already made your payment, please disregard this notice.</div><div class="sign">Sincerely,</div><div class="sign-name">${directorName}</div><div class="sign-title">Director, ${centerName}</div></div><div class="ftr"><span class="ftr-l">${centerName} | Harper County, KS</span><span class="ftr-r">pattersonhc.org/wellness-centers</span></div></div></body></html>`); 
                      w.document.close(); 
                      setTimeout(() => w.print(), 500); 
                    }} className="bg-slate-50 text-slate-600 hover:bg-slate-600 hover:text-white py-4 rounded-xl font-bold shadow-sm transition-all flex flex-col items-center justify-center gap-2 text-xs"><Printer size={20} /> Payment Letter</button>
                    <button onClick={() => { const isHarper = selectedMember.center && selectedMember.center.toLowerCase().includes('harper'); const centerName = isHarper ? 'Harper Wellness Center' : 'Anthony Wellness Center'; const centerAddr = isHarper ? '615 W 12th St, Harper, KS 67058' : '309 W Main St, Anthony, KS 67003'; const centerPhone = isHarper ? '(620) 896-1202' : '(620) 842-5190'; const centerHours = isHarper ? 'M-F 8am-12pm &amp; 5pm-8pm, Sat 9am-noon' : 'M-F 7am-8pm, Sat 8am-1pm'; const directorName = isHarper ? 'Patrick Johnson' : 'Deanna Smithhisler'; const addressBlock = selectedMember.address ? `${selectedMember.address}<br/>${selectedMember.city}, ${selectedMember.state} ${selectedMember.zip}` : 'Address not on file'; const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(selectedMember.id)}&color=003d6b&bgcolor=ffffff`; const w = window.open('', '_blank'); w.document.write(`<!DOCTYPE html><html><head><title>Welcome - ${selectedMember.firstName} ${selectedMember.lastName}</title><style>@media print{body{margin:0}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}}body{font-family:Arial,sans-serif;color:#1e293b;margin:0}.page{max-width:680px;margin:0 auto}.hdr{background:#003d6b;padding:20px 44px;display:flex;justify-content:space-between;align-items:center}.hdr-left{display:flex;align-items:center;gap:16px}.hdr-logo{height:36px;opacity:.95}.hdr-name{font-size:18px;font-weight:700;color:#fff}.hdr-sub{font-size:10px;color:#8bb8d9;letter-spacing:1px;margin-top:2px}.accent{height:3px;background:linear-gradient(to right,#dba51f,#dd6d22)}.body{padding:32px 44px}.top-row{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px}.addr{font-size:14px;line-height:1.6}.date{font-size:12px;color:#94a3b8}.greeting{font-size:15px;margin-bottom:14px;font-weight:700;color:#003d6b}.intro{font-size:13px;color:#475569;line-height:1.8;margin-bottom:20px}.box{border:1.5px solid #003d6b;border-radius:6px;overflow:hidden;margin-bottom:20px}.box-hdr{background:#003d6b;padding:8px 16px;font-size:10px;font-weight:700;color:#fff;letter-spacing:1.5px}.box-body{padding:2px 16px}.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0}.row:last-child{border-bottom:none}.lbl{font-size:12px;color:#64748b}.val{font-size:12px;font-weight:700;color:#003d6b}.qr-section{text-align:center;margin:24px 0;padding:20px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0}.qr-section img{margin:0 auto 10px auto;display:block}.pin-display{font-size:36px;font-weight:900;letter-spacing:0.3em;color:#003d6b;margin:10px 0}.pin-label{font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:2px}.how-to{font-size:12px;color:#475569;line-height:1.8;margin:16px 0;padding:12px 16px;background:#eff6ff;border-radius:6px;border:1px solid #bfdbfe}.how-to strong{color:#003d6b}.sign{font-size:13px;margin-bottom:2px;margin-top:24px}.sign-name{font-size:13px;font-weight:700;color:#003d6b}.sign-title{font-size:11px;color:#94a3b8}.ftr{border-top:2px solid #003d6b;padding:10px 44px;display:flex;justify-content:space-between;align-items:center;margin-top:24px}.ftr-l{font-size:10px;color:#94a3b8}.ftr-r{font-size:10px;color:#1080ad}</style></head><body><div class="page"><div class="hdr"><div class="hdr-left"><img src="https://pattersonhc.org/sites/default/files/wellness_white.png" class="hdr-logo" /><div><div class="hdr-name">${centerName}</div><div class="hdr-sub">${centerAddr} | ${centerPhone}</div></div></div></div><div class="accent"></div><div class="body"><div class="top-row"><div class="addr"><strong>${selectedMember.firstName} ${selectedMember.lastName}</strong><br/>${addressBlock}</div><div class="date">${new Date().toLocaleDateString('en-US', {month:'long',day:'numeric',year:'numeric'})}</div></div><div class="greeting">Welcome to ${centerName}!</div><div class="intro">We are excited to have you as a member of our wellness center! This letter contains your personal check-in credentials. Please keep this information for your records.</div><div class="box"><div class="box-hdr">YOUR MEMBERSHIP DETAILS</div><div class="box-body"><div class="row"><span class="lbl">Member ID</span><span class="val">${selectedMember.id}</span></div><div class="row"><span class="lbl">Membership Type</span><span class="val">${selectedMember.type}</span></div><div class="row"><span class="lbl">Home Center</span><span class="val">${selectedMember.center}</span></div><div class="row"><span class="lbl">Hours</span><span class="val">${centerHours.replace(/&amp;/g, '&')}</span></div></div></div><div class="qr-section"><p style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px">Your Personal QR Badge</p><img src="${qrUrl}" width="160" height="160" /><p style="font-size:11px;color:#64748b;margin-top:8px">Scan this at the kiosk for quick check-in</p><div style="margin-top:16px;padding-top:16px;border-top:1px solid #e2e8f0"><p class="pin-label">Your 4-Digit PIN</p><p class="pin-display">${selectedMember.password}</p><p style="font-size:10px;color:#94a3b8">Use this PIN when checking in by name at the kiosk</p></div></div><div class="how-to"><strong>How to Check In:</strong><br/>1. Walk up to the check-in kiosk at the front desk<br/>2. <strong>Option A:</strong> Hold this QR code up to the camera<br/>3. <strong>Option B:</strong> Type your name, select yourself, and enter your PIN<br/>4. A green "Welcome" message confirms your check-in!</div><div class="intro">You can also access your account online at <strong>wellness-kiosk-7k6p.vercel.app</strong> — select "Member Portal", find your name, and enter your PIN to view your visit history and membership details.</div><div class="sign">Welcome aboard!</div><div class="sign-name">${directorName}</div><div class="sign-title">Director, ${centerName}</div></div><div class="ftr"><span class="ftr-l">${centerName} | Harper County, KS</span><span class="ftr-r">pattersonhc.org/wellness-centers</span></div></div></body></html>`); w.document.close(); setTimeout(() => w.print(), 500); }} className="bg-[#16a34a]/10 text-[#16a34a] hover:bg-[#16a34a] hover:text-white py-4 rounded-xl font-bold shadow-sm transition-all flex flex-col items-center justify-center gap-2 text-xs"><Mail size={20} /> Welcome Letter</button>
                    
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

      {/* CORPORATE PAYMENT MODAL */}
      {corpPaymentModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm p-8 relative shadow-2xl">
            <button onClick={() => setCorpPaymentModal(null)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500"><X size={20}/></button>
            <div className="text-center mb-6">
              <Briefcase size={40} className="text-[#8b5cf6] mx-auto mb-3" />
              <h3 className="text-xl font-black text-[#001f3f]">Log Corporate Payment</h3>
              <p className="text-sm text-slate-400 mt-1">{corpPaymentModal.name} • {corpPaymentModal.displayPeriod}</p>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Payment Method</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {['Check', 'ACH', 'Card', 'Cash'].map(m => (
                <button key={m} onClick={async () => {
                  const entry = `${corpPaymentModal.reportMonth}:${m}`;
                  const newPaidMonths = corpPaymentModal.paidMonths ? `${corpPaymentModal.paidMonths},${entry}` : entry;
                  
                  setCorporatePartners(prev => prev.map(c => c.id === corpPaymentModal.id ? { ...c, paidMonths: newPaidMonths } : c));
                  setCorpPaymentModal(null);
                  
                  try {
                    await fetch('/api/update-corporate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ recordId: corpPaymentModal.id, paidMonths: newPaidMonths }) });
                  } catch (err) { 
                    alert('Failed to sync payment status to Airtable.'); 
                  }
                }} className="bg-slate-50 hover:bg-[#8b5cf6] hover:text-white text-[#001f3f] font-bold py-4 rounded-xl border border-slate-200 transition-all text-sm">{m}</button>
              ))}
            </div>
            <button onClick={() => setCorpPaymentModal(null)} className="w-full text-slate-400 text-sm font-bold hover:text-slate-600">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
