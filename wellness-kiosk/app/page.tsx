// @ts-nocheck
'use client';
import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Users, Search, QrCode, CreditCard, X, CheckCircle, AlertCircle, TrendingUp, Calendar, MapPin, Mail, LogOut, ShieldCheck, Phone, Activity, ChevronRight, LayoutDashboard, Filter, Download, Bell, FileText, Plus, Smartphone, Clock, Camera, UserCircle, Lock, Printer, Trash2, Briefcase, KeyRound, Eye, HelpCircle } from 'lucide-react';

const QRCode = ({ data, size = 160, darkColor = '#001f3f' }) => { const hexColor = darkColor.replace('#', ''); const safeData = encodeURIComponent(data || "WC-000"); const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${safeData}&color=${hexColor}&bgcolor=ffffff`; return <img src={qrUrl} alt="QR Code" style={{ width: size, height: size, display: 'block' }} />; };

const DonutChart = ({ data, totalLabel }) => { const total = data.reduce((sum, d) => sum + d.value, 0) || 1; let currentPercent = 0; const stops = data.filter(d => d.value > 0).map(d => { const percent = (d.value / total) * 100; const stop = `${d.color} ${currentPercent}% ${currentPercent + percent}%`; currentPercent += percent; return stop; }).join(', '); return (<div className="flex items-center justify-center gap-8 print:gap-4"><div className="relative w-48 h-48 print:w-36 print:h-36 rounded-full shadow-sm" style={{ background: stops ? `conic-gradient(${stops})` : '#e2e8f0', printColorAdjust: 'exact' }}><div className="absolute inset-5 print:inset-4 bg-white rounded-full flex flex-col items-center justify-center shadow-inner"><span className="text-3xl print:text-2xl font-black text-[#001f3f] leading-none">{total === 1 && data.every(d => d.value === 0) ? 0 : data.reduce((s,d)=>s+d.value,0)}</span><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest print:text-[7px]">{totalLabel}</span></div></div><div className="space-y-2 flex-1 print:space-y-1">{data.filter(d => d.value > 0).map((d, i) => (<div key={i} className="flex justify-between items-center text-sm print:text-xs border-b border-slate-50 print:border-slate-200 last:border-0 pb-1"><div className="flex items-center gap-2 print:gap-1"><span className="w-3 h-3 print:w-2 print:h-2 rounded-full" style={{ backgroundColor: d.color, printColorAdjust: 'exact' }}></span><span className="font-bold text-slate-600 print:text-black">{d.label}</span></div><span className="font-black text-[#001f3f]">{d.value}</span></div>))}</div></div>); };
const MemberPhoto = ({ src, name, size = 40, className = '' }) => {
  if (src) return <img src={src} alt={name} className={`rounded-full object-cover shrink-0 ${className}`} style={{ width: size, height: size }} />;
  return <div className={`rounded-full bg-slate-200 flex items-center justify-center shrink-0 ${className}`} style={{ width: size, height: size }}><span className="font-black text-slate-400" style={{ fontSize: size * 0.38 }}>{name ? name.charAt(0).toUpperCase() : '?'}</span></div>;
};

const LOGO_URL = 'https://pattersonhc.org/sites/default/files/wellness_white.png';

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

export default function WellnessHub() {
  const [isMounted, setIsMounted] = useState(false);
  const [currentDateString, setCurrentDateString] = useState('');
  const [paymentModal, setPaymentModal] = useState(null);   const [checkNumber, setCheckNumber] = useState(''); const [proratePayment, setProratePayment] = useState(false); const [customPayAmount, setCustomPayAmount] = useState('');
    const [firstPayment, setFirstPayment] = useState({ open: false, prorated: false, method: null, memberData: null });
  const [view, setView] = useState(() => {   if (typeof window !== 'undefined') {     const params = new URLSearchParams(window.location.search);     return params.get('view') || 'landing';   }   return 'landing'; });
  const [user, setUser] = useState(null);
  const [activeMember, setActiveMember] = useState(null);
  const [activeCorp, setActiveCorp] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [members, setMembers] = useState([]);
  const [visits, setVisits] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');   const [memberFilter, setMemberFilter] = useState('all');
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
  const [kioskInput, setKioskInput] = useState('');   const [checkInProcessing, setCheckInProcessing] = useState(false);
  const [pinModal, setPinModal] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [visitors, setVisitors] = useState([]);
  const [showAllCheckins, setShowAllCheckins] = useState(false);   const [checkinDate, setCheckinDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [showAllMemberVisits, setShowAllMemberVisits] = useState(false);
  const [activeClass, setActiveClass] = useState(null);   const [savedClassRosters, setSavedClassRosters] = useState({});
  const [kioskMode, setKioskMode] = useState('Gym');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showAllBriefings, setShowAllBriefings] = useState(false);
  const [toast, setToast] = useState(null);
  const [reportMonth, setReportMonth] = useState(() => {
    const now = new Date();
    return `${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
  });
  
  const [usageBasedCorps, setUsageBasedCorps] = useState(() => { try { return JSON.parse(localStorage.getItem('wellnessUsagePrefs')) || {}; } catch(e) { return {}; } });
  const [expandedCorpId, setExpandedCorpId] = useState(null);
  const [editingCorp, setEditingCorp] = useState(null);
  const [corpPaymentModal, setCorpPaymentModal] = useState(null);
  const [invoiceMenu, setInvoiceMenu] = useState(null);
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
  const [renewMenuOpen, setRenewMenuOpen] = useState(null);
  const [payments, setPayments] = useState([]);
  useEffect(() => { localStorage.setItem('wellnessUsagePrefs', JSON.stringify(usageBasedCorps)); }, [usageBasedCorps]);
// Emergency local backup
  useEffect(() => {
    if (members.length > 0) {
      const backupData = members.map(m => ({
        id: m.id, name: `${m.firstName} ${m.lastName}`, pin: m.password,
        inactive: m.inactive, authAnthony: m.orientationAnthony, authHarper: m.orientationHarper
      }));
      localStorage.setItem('wellness_backup_roster', JSON.stringify(backupData));
    }
  }, [members]);
  useEffect(() => {
    setShowAllMemberVisits(false);
  }, [selectedMember]);
useEffect(() => {
  setShowAllMemberVisits(false);
}, [selectedMember]);
  useEffect(function() {
    setVisits(function(prev) {
      var sorted = prev.slice().sort(function(a, b) { return new Date(b.time) - new Date(a.time); });
      var changed = false;
      for (var i = 0; i < sorted.length; i++) { if (sorted[i] !== prev[i]) { changed = true; break; } }
      return changed ? sorted : prev;
    });
  }, [visits.length]);
  
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
    if (p === 'CORPORATE FAMILY') return 45;      if (p === 'CORPORATE STUDENT') return 20;
    if (['MILITARY', 'MILITARY FAMILY', 'HD6', 'HD6 FAMILY', 'FIRST DAY FREE', 'LIFETIME', 'LIFETIME FAMILY', 'HERITAGE ESTATES'].includes(p)) return 0;
    if (!r[p]) return 0;
    var lumpSum = r[p][b] || r[p]['Month-to-Month'];
    if (b === '6-Month Prepay') return Math.round((lumpSum / 6) * 100) / 100;
    if (b === '12-Month Prepay') return Math.round((lumpSum / 12) * 100) / 100;
    return lumpSum;
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
        if (data.valid) { setSessionToken(savedToken); setLastActivity(Date.now()); if (data.type === 'director' && data.user) { setUser(data.user); setViewingCenter(data.user.center); if (data.user.role === 'business') setActiveTab('reports'); setView('dashboard'); } else if (data.type === 'corporate' && data.corp) { setActiveCorp(data.corp); setView('corp_portal'); } }
        else { localStorage.removeItem('wellnessToken'); localStorage.removeItem('wellnessCenter'); }
      }).catch(() => { localStorage.removeItem('wellnessToken'); });
    }
    if (savedCenter) setViewingCenter(savedCenter);
  }, []);

  const handleLogin = async () => { const u = document.getElementById('u_in').value.toLowerCase().trim(); const p = document.getElementById('p_in').value.trim(); try { const res = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: u, password: p, loginType: 'director' }) }); const data = await res.json(); if (data.success) { setUser(data.user); setSessionToken(data.token); setViewingCenter(data.user.center); setLastActivity(Date.now()); localStorage.setItem('wellnessToken', data.token); localStorage.setItem('wellnessCenter', data.user.center); if (data.user.role === 'business') { setActiveTab('reports'); } setView('dashboard'); } else { alert('Incorrect credentials.'); } } catch (err) { alert('Login failed. Please try again.'); } };
  const handleCorpLogin = async () => { const u = document.getElementById('c_in').value.toLowerCase().trim(); const p = document.getElementById('c_pin').value.trim(); try { const res = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: u, password: p, loginType: 'corporate' }) }); const data = await res.json(); if (data.success) { setActiveCorp(data.corp); setSessionToken(data.token); setLastActivity(Date.now()); localStorage.setItem('wellnessToken', data.token); setView('corp_portal'); } else { alert('Incorrect corporate credentials.'); } } catch (err) { alert('Login failed. Please try again.'); } };
  const handleLogout = () => { setUser(null); setActiveCorp(null); setSessionToken(null); localStorage.removeItem('wellnessToken'); localStorage.removeItem('wellnessCenter'); setView('landing'); };
 const handleMarkOrientation = async (center) => {
    // Determine which field we are flipping
    const field = center === 'anthony' ? 'orientationAnthony' : 'orientationHarper';
    // If it's currently true, we want to set it to false (uncheck it)
    const newValue = !selectedMember[field];

    try {
    const otherField = center === 'anthony' ? 'orientationHarper' : 'orientationAnthony';
      const eitherDone = newValue || selectedMember[otherField];
      const res = await fetch('/api/update-orientation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          airtableId: selectedMember.airtableId, 
          center: center,
          status: newValue
        })
      });
      
      if (res.ok) {
        const updated = { ...selectedMember, [field]: newValue, needsOrientation: !eitherDone };
        setSelectedMember(updated);
        setMembers(prev => prev.map(m => m.airtableId === updated.airtableId ? updated : m));
      }
    } catch (err) { alert("Failed to update orientation."); }
  };
const handleSelfieUpload = async (imageData, memberId) => {
    try {
      const res = await fetch('/api/upload-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ airtableId: memberId, fileData: imageData })
      });
      const result = await res.json();
      if (result.success) {
        setMembers(prev => prev.map(m => m.airtableId === memberId ? { ...m, photoUrl: result.photoUrl } : m));
        setActiveMember(prev => ({ ...prev, photoUrl: result.photoUrl }));
        alert("Headshot updated! Check-in to see your new photo.");
      }
    } catch (err) {
      alert("Camera upload failed. Check your connection.");
    }
  };
  const SESSION_TIMEOUT = 8 * 60 * 60 * 1000;
  useEffect(() => { const u = () => setLastActivity(Date.now()); window.addEventListener('click', u); window.addEventListener('keydown', u); window.addEventListener('scroll', u); window.addEventListener('touchstart', u); return () => { window.removeEventListener('click', u); window.removeEventListener('keydown', u); window.removeEventListener('scroll', u); window.removeEventListener('touchstart', u); }; }, []);
  useEffect(() => { if (!user && !activeCorp) return; const interval = setInterval(() => { if (Date.now() - lastActivity > SESSION_TIMEOUT) { alert('Your session has expired due to inactivity. Please log in again.'); handleLogout(); } }, 60 * 1000); return () => clearInterval(interval); }, [user, activeCorp, lastActivity]);

  useEffect(() => {
    fetch('/api/get-corporate-partners').then(res => res.json()).then(data => {
      console.log('[Wellness Hub] Corporate Partners raw:', data.records?.length, 'records', data.records?.map(r => r.fields['Company Name']));
      if (data.records) { setCorporatePartners(data.records.map(r => { const rawName = r.fields['Company Name']; const name = Array.isArray(rawName) ? rawName[0] : (rawName || ''); const rawMatch = r.fields['Sponsor Match']; const sponsorMatch = Array.isArray(rawMatch) ? rawMatch[0] : (rawMatch || name); return { id: r.id, name: String(name).trim(), sponsorMatch: String(sponsorMatch).trim(), contactName: r.fields['Contact Name'] || '', contactEmail: r.fields['Contact Email'] || '', paidMonths: r.fields['Paid Months'] || '', address: r.fields['Street Address'] || '', city: r.fields['City'] || '', state: r.fields['State'] || 'KS', zip: r.fields['Zip'] || '' }; }).filter(p => p.name).sort((a,b) => a.name.localeCompare(b.name))); }
    }).catch(() => {});
     fetch('/api/get-payments').then(res => res.json()).then(data => { if (data.records) { setPayments(data.records.map(function(r) { var memberLink = r.fields['Member'] || []; var memberRecId = Array.isArray(memberLink) ? memberLink[0] || '' : memberLink; return { airtableId: r.id, memberRecId: String(memberRecId).trim(), amount: r.fields['Amount'] || 0, date: r.fields['Payment Date'] || '', method: r.fields['Payment Method'] || '', checkNumber: r.fields['Check Number'] || '', status: r.fields['Status'] || '', notes: r.fields['Notes'] || '' }; })); } }).catch(function() {});
    fetch('/api/get-class-rosters').then(res => res.json()).then(data => {        if (data.records) {          var rosterMap = {};          data.records.forEach(function(r) {            var key = r.fields['Class Name'] + '_' + r.fields['Center'] + '_' + r.fields['Date'];            var attendees = [];            try { attendees = JSON.parse(r.fields['Attendees'] || '[]'); } catch(e) {}            rosterMap[key] = { airtableId: r.id, className: r.fields['Class Name'], center: r.fields['Center'], date: r.fields['Date'], attendees: attendees };          });          setSavedClassRosters(rosterMap);        }      }).catch(function() {});      fetch('/api/get-visitors').then(res => res.json()).then(data => {
      if (data.records) {
        setVisitors(data.records.map(r => ({
          airtableId: r.id, firstName: r.fields['First Name'] || '', lastName: r.fields['Last Name'] || '', email: r.fields['Email'] || '', phone: r.fields['Phone'] || '', passType: r.fields['Pass Type'] || '', amountPaid: r.fields['Amount Paid'] || 0, referringProvider: r.fields['Referring Provider'] || '', purchaseDate: r.fields['Purchase Date'] || '', expirationDate: r.fields['Expiration Date'] || '', center: r.fields['Center'] || '', pin: r.fields['PIN'] || '', orientationComplete: !!r.fields['Orientation Complete'], totalVisits: r.fields['Total Visits'] || 0, address: r.fields['Street Address'] || '', city: r.fields['City'] || '', state: r.fields['State'] || '', zip: r.fields['Zip'] || '', notes: r.fields['Notes'] || '', passesRemaining: r.fields['Passes Remaining'] !== undefined ? Number(r.fields['Passes Remaining']) : null,
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
          return { airtableId: r.id, id: r.fields['Member ID'] || r.id, firstName: r.fields['First Name'] || 'Unknown', lastName: r.fields['Last Name'] || '', email: r.fields['Email'] || '', phone: r.fields['Phone'] || '', password: finalPassword, status: (r.fields['Membership Status'] || 'ACTIVE').toUpperCase(), type: String(planText).toUpperCase().trim(), center: r.fields['Home Center'] || 'Anthony', visits: Number(r.fields['Total Visits'] || 0), nextPayment: r.fields['Next Payment Due'] || null, sponsor: !!r.fields['Corporate Sponsor'], sponsorName: r.fields['Corporate Sponsor'] ? String(r.fields['Corporate Sponsor']).trim() : '', needsOrientation: !!r.fields['Needs Orientation'],               orientationAnthony: r.fields['Orientation Anthony'] !== undefined ? !!r.fields['Orientation Anthony'] : !r.fields['Needs Orientation'],               orientationHarper: r.fields['Orientation Harper'] !== undefined ? !!r.fields['Orientation Harper'] : !r.fields['Needs Orientation'], familyName: r.fields['Family Name'] ? (Array.isArray(r.fields['Family Name']) ? r.fields['Family Name'][0] : r.fields['Family Name']) : '', familyGroupId: r.fields['Family Group'] ? (Array.isArray(r.fields['Family Group']) ? r.fields['Family Group'][0] : r.fields['Family Group']) : '', billingMethod: r.fields['Billing Method'] || '', monthlyRate: r.fields['Monthly Rate'] || '', access247: !!r.fields['24/7 Access'], badgeNumber: r.fields['Badge Number'] || '', startDate: r.fields['Start Date'] || null, notes: r.fields['Notes'] || '', discountCode: r.fields['Discount Code'] || '', discountExpiration: r.fields['Discount Expiration'] || null, address: r.fields['Street Address'] || '', city: r.fields['City'] || '', state: r.fields['State'] || 'KS', zip: r.fields['Zip'] || '', paymentMethod: Array.isArray(r.fields['Payment Method']) ? r.fields['Payment Method'][r.fields['Payment Method'].length - 1] : (r.fields['Payment Method'] || ''), checkNumber: r.fields['Check Number'] || '',inactive: !!r.fields['Inactive'], photoUrl: r.fields['Photo URL'] || (r.fields['Photo'] && r.fields['Photo'].length > 0 ? r.fields['Photo'][0].url : '') };
        });
        setMembers(mappedMembers); setApiError('');
        fetch('/api/get-visits').then(res => res.json()).then(visitData => {
          if (visitData.records) { const mappedVisits = visitData.records.map(v => { const linkedArray = v.fields['Member'] || v.fields['Members'] || []; const linkId = linkedArray[0]; const foundMember = mappedMembers.find(m => m.airtableId === linkId); const fallbackName = Array.isArray(v.fields['Name']) ? v.fields['Name'][0] : v.fields['Name'] || 'Unknown Member'; return { name: foundMember ? `${foundMember.firstName} ${foundMember.lastName}` : fallbackName, center: v.fields['Center'] || v.fields['Location'] || 'Both', time: v.fields['Check-in Time'] || v.fields['Time'] || v.fields['Date'] || v.createdTime, type: foundMember ? foundMember.type : 'Unknown', method: v.fields['Check-in Method'] || v.fields['Method'] || 'General' }; }); mappedVisits.sort((a,b) => new Date(b.time) - new Date(a.time)); setVisits(mappedVisits); }
          setLoading(false);
        }).catch(err => { console.error("Could not fetch historical visits:", err); setLoading(false); });
      } else { setLoading(false); }
    }).catch(err => { setApiError(err.message || "Failed to fetch from Vercel"); setLoading(false); });
  }, []);

  const scopedMembers = members.filter(m => viewingCenter === 'both' || (m.center && m.center.toLowerCase().includes(viewingCenter)));
   const filteredVisits = visits.filter(v => viewingCenter === 'both' || (v.center && v.center.toLowerCase().includes(viewingCenter)));
  const memberMatches = kioskInput.length >= 2 ? members.filter(m => !m.inactive && ((m.firstName + ' ' + m.lastName).toLowerCase().includes(kioskInput.toLowerCase()) || m.id.toLowerCase().includes(kioskInput.toLowerCase()))).slice(0, 4) : [];
  const visitorMatches = kioskInput.length >= 2 ? visitors.filter(v => { const today = new Date(); const exp = new Date(v.expirationDate + 'T23:59:59'); return exp >= today && v.orientationComplete && v.passActivated && (v.firstName + ' ' + v.lastName).toLowerCase().includes(kioskInput.toLowerCase()); }).slice(0, 2) : [];
  const kioskMatches = [...memberMatches.map(m => ({...m, _type: 'member'})), ...visitorMatches.map(v => ({...v, id: 'VISITOR', _type: 'visitor'}))];
  const stats = { total: scopedMembers.length, active: scopedMembers.filter(m => !m.inactive && m.status === 'ACTIVE').length, inactive: scopedMembers.filter(m => m.inactive).length, overdue: scopedMembers.filter(m => !m.inactive && m.status === 'OVERDUE').length, expiring: scopedMembers.filter(m => !m.inactive && m.status === 'EXPIRING').length, today: filteredVisits.filter(v => new Date(v.time).toDateString() === new Date().toDateString()).length };
  
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
  const statusChartData = [{label:'Active',value:stats.active,color:'#16a34a'},{label:'Expiring Soon',value:stats.expiring,color:'#f59e0b'},{label:'Overdue / Locked',value:stats.overdue,color:'#ef4444'},{label:'Inactive',value:stats.inactive,color:'#94a3b8'}];
  const familyMembers = activeMember ? members.filter(m => m.id !== activeMember.id && ((m.email && m.email.toLowerCase() === activeMember.email.toLowerCase()) || (m.phone && m.phone === activeMember.phone))) : [];

  const handleUpdateProfile = async () => { setIsUpdating(true); const newEmail = document.getElementById('edit_email').value.trim(); const newPhone = document.getElementById('edit_phone').value.trim(); setActiveMember({...activeMember, email: newEmail, phone: newPhone}); setEditMode(false); try { await fetch('/api/update-member', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ airtableId: activeMember.airtableId, email: newEmail, phone: newPhone }) }); } catch (err) { alert("App updated locally."); } setIsUpdating(false); };

const handleAddMemberSubmit = async (e) => {
    e.preventDefault(); setIsAdding(true); setNewMemberPin(null);
    const firstName = e.target.fname.value; 
    const lastName = e.target.lname.value; // We are going to make sure we actually USE this!
    const email = e.target.email.value; 
    const phone = e.target.phone.value; 
    const plan = e.target.plan.value; 
    const center = e.target.center.value;
    const needsOrientation = e.target.orientation?.checked || false; 
    const isFamily = plan.includes('FAMILY'); 
    const isCorporate = plan.includes('CORPORATE') || plan.includes('HD6');
    const sponsor = isCorporate ? (selectedSponsor === '__other__' ? customSponsor : selectedSponsor) : '';
    const address = e.target.address?.value || ''; 
    const city = e.target.city?.value || ''; 
    const mstate = e.target.mstate?.value || 'KS'; 
    const mzip = e.target.mzip?.value || '';
    const billing = (plan === 'CORPORATE' || plan === 'CORPORATE FAMILY' || plan === 'CORPORATE STUDENT') ? 'Month-to-Month' : (e.target.billing?.value || 'Month-to-Month'); 
    const access247 = e.target.access247?.checked || false; 
    const startDate = document.getElementById('startDate').value; 
    const badgeNumber = e.target.badgenum?.value || '';
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
        // FIX: We are now sending `lastName` instead of forcing `familyFlow.lastName`
        const res = await fetch('/api/add-family-member', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ firstName, lastName, email: email || familyFlow.email, phone: phone || familyFlow.phone, plan: familyFlow.plan, center: familyFlow.center, familyRecordId: familyFlow.familyRecordId, corporateSponsor: familyFlow.corporateSponsor, needsOrientation, address, city, state: mstate, zip: mzip, access247, badgeNumber, discountCode, discountExpiration, monthlyRate: 0 }) });
        const result = await res.json();
        // FIX: Also updated the success state to use `lastName` instead of `familyFlow.lastName`
        if (result.success) { const updated = { ...familyFlow, addedMembers: [...familyFlow.addedMembers, { name: `${firstName} ${lastName}`, pin: result.pin, isPrimary: false }] }; setFamilyFlow(updated); setNewMemberPin({ name: `${firstName} ${lastName}`, pin: result.pin }); } else { alert('Error: ' + result.error); }
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
        fetch('/api/get-visitors').then(r => r.json()).then(data => { if (data.records) setVisitors(data.records.map(r => ({ airtableId: r.id, firstName: r.fields['First Name'] || '', lastName: r.fields['Last Name'] || '', email: r.fields['Email'] || '', phone: r.fields['Phone'] || '', passType: r.fields['Pass Type'] || '', amountPaid: r.fields['Amount Paid'] || 0, referringProvider: r.fields['Referring Provider'] || '', purchaseDate: r.fields['Purchase Date'] || '', expirationDate: r.fields['Expiration Date'] || '', center: r.fields['Center'] || '', pin: r.fields['PIN'] || '', orientationComplete: !!r.fields['Orientation Complete'], totalVisits: r.fields['Total Visits'] || 0, address: r.fields['Street Address'] || '', city: r.fields['City'] || '', state: r.fields['State'] || '', zip: r.fields['Zip'] || '', notes: r.fields['Notes'] || '', passActivated: r.fields['Pass Activated'] !== false && r.fields['Pass Activated'] !== 'false', passesRemaining: r.fields['Passes Remaining'] !== undefined ? Number(r.fields['Passes Remaining']) : null }))); });
      }
    } catch (err) { alert('Renewal failed.'); }
  };

  const handleDeleteMember = async () => { if (!user || user.role !== 'admin') { alert('Only System Admins can delete members.'); return; } if (!window.confirm(`Permanently delete ${selectedMember.firstName} ${selectedMember.lastName}?`)) return; setIsDeleting(true); try { const res = await fetch('/api/delete-member', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ airtableId: selectedMember.airtableId }) }); const result = await res.json(); if (result.success) { setMembers(prev => prev.filter(m => m.airtableId !== selectedMember.airtableId)); setSelectedMember(null); } else { alert('Error: ' + result.error); } } catch (err) { alert('Network error.'); } setIsDeleting(false); };
  const printReceipt = (member, method, amount, wasProrated, nextDue) => {
    const isHarper = member.center && member.center.toLowerCase().includes('harper');
    const centerName = isHarper ? 'Harper Wellness Center' : 'Anthony Wellness Center';
    const centerAddr = isHarper ? '615 W 12th St, Harper, KS 67058' : '309 W Main St, Anthony, KS 67003';
    const centerPhone = isHarper ? '(620) 896-1202' : '(620) 842-5190';
    const directorName = isHarper ? 'Patrick Johnson' : 'Deanna Smithhisler';
    const receiptNum = 'R-' + Date.now().toString(36).toUpperCase();
    const addressBlock = member.address ? `${member.address}<br/>${member.city}, ${member.state} ${member.zip}` : '';
    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html><html><head><title>Receipt - ${member.firstName} ${member.lastName}</title><style>@page{margin:0.5in}@media print{body{margin:0}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}}body{font-family:Arial,sans-serif;color:#1e293b;margin:0}.page{max-width:680px;margin:0 auto}.hdr{background:#003d6b;padding:20px 44px;display:flex;justify-content:space-between;align-items:center}.hdr-left{display:flex;align-items:center;gap:16px}.hdr-logo{height:36px;opacity:.95}.hdr-name{font-size:18px;font-weight:700;color:#fff}.hdr-sub{font-size:10px;color:#8bb8d9;letter-spacing:1px;margin-top:2px}.accent{height:3px;background:linear-gradient(to right,#dba51f,#dd6d22)}.body{padding:32px 44px}.top-row{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px}.addr{font-size:14px;line-height:1.6}.meta{text-align:right;font-size:12px;color:#64748b;line-height:1.8}.meta-val{color:#003d6b;font-weight:700}.title{font-size:22px;font-weight:900;color:#003d6b;margin-bottom:4px}.subtitle{font-size:12px;color:#16a34a;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:24px}.box{border:1.5px solid #003d6b;border-radius:6px;overflow:hidden;margin-bottom:20px}.box-hdr{background:#003d6b;padding:8px 16px;font-size:10px;font-weight:700;color:#fff;letter-spacing:1.5px}.box-body{padding:2px 16px}.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0}.row:last-child{border-bottom:none}.lbl{font-size:12px;color:#64748b}.val{font-size:12px;font-weight:700;color:#003d6b}.total-row{background:#f0fdf4;border-radius:6px;padding:16px 20px;display:flex;justify-content:space-between;align-items:center;margin:20px 0;border:1.5px solid #bbf7d0}.total-lbl{font-size:14px;font-weight:700;color:#003d6b}.total-val{font-size:28px;font-weight:900;color:#16a34a}.note{font-size:11px;color:#94a3b8;line-height:1.8;margin-top:20px;padding:12px 16px;background:#f8fafc;border-radius:6px;border:1px solid #e2e8f0}.sign{font-size:13px;margin-top:24px;margin-bottom:2px}.sign-name{font-size:13px;font-weight:700;color:#003d6b}.sign-title{font-size:11px;color:#94a3b8}.ftr{border-top:2px solid #003d6b;padding:10px 44px;display:flex;justify-content:space-between;align-items:center;margin-top:24px}.ftr-l{font-size:10px;color:#94a3b8}.ftr-r{font-size:10px;color:#1080ad}</style></head><body><div class="page"><div class="hdr"><div class="hdr-left"><img src="https://pattersonhc.org/sites/default/files/wellness_white.png" class="hdr-logo" /><div><div class="hdr-name">${centerName}</div><div class="hdr-sub">${centerAddr} | ${centerPhone}</div></div></div></div><div class="accent"></div><div class="body"><div class="top-row"><div class="addr"><strong>${member.firstName} ${member.lastName}</strong>${addressBlock ? '<br/>' + addressBlock : ''}</div><div class="meta">Date: <span class="meta-val">${new Date().toLocaleDateString('en-US', {month:'long',day:'numeric',year:'numeric'})}</span><br/>Receipt #: <span class="meta-val">${receiptNum}</span></div></div><div class="title">Payment Receipt</div><div class="subtitle">Payment Received - Thank You</div><div class="box"><div class="box-hdr">PAYMENT DETAILS</div><div class="box-body"><div class="row"><span class="lbl">Member ID</span><span class="val">${member.id}</span></div><div class="row"><span class="lbl">Membership Type</span><span class="val">${member.type}</span></div><div class="row"><span class="lbl">Billing Method</span><span class="val">${member.billingMethod || 'Month-to-Month'}</span></div><div class="row"><span class="lbl">Payment Method</span><span class="val">${method}</span></div>${wasProrated ? '<div class="row"><span class="lbl">Proration</span><span class="val">First month prorated</span></div>' : ''}<div class="row"><span class="lbl">Payment Date</span><span class="val">${new Date().toLocaleDateString('en-US', {month:'long',day:'numeric',year:'numeric'})}</span></div>${nextDue ? '<div class="row"><span class="lbl">Next Payment Due</span><span class="val">' + new Date(nextDue + 'T00:00:00').toLocaleDateString('en-US', {month:'long',day:'numeric',year:'numeric'}) + '</span></div>' : ''}</div></div><div class="total-row"><span class="total-lbl">Amount Paid</span><span class="total-val">$${amount}</span></div><div class="note">This receipt confirms your payment to ${centerName}. Please retain for your records. If you have any questions about your account, contact us at ${centerPhone}.</div><div class="sign">Thank you,</div><div class="sign-name">${directorName}</div><div class="sign-title">Director, ${centerName}</div></div><div class="ftr"><span class="ftr-l">${centerName} | Harper County, KS</span><span class="ftr-r">pattersonhc.org/wellness-centers</span></div></div></body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 500);
  };
    const handleResetPin = async (member) => { if (!window.confirm(`Reset PIN for ${member.firstName} ${member.lastName}?`)) return; try { const newPin = String(Math.floor(1000 + Math.random() * 9000)); await fetch('/api/update-pin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ recordId: member.airtableId, newPin }) }); setMembers(prev => prev.map(m => m.airtableId === member.airtableId ? { ...m, password: newPin } : m)); showToast('New PIN for ' + member.firstName + ': ' + newPin + ' — Please give this to the member.', 'success', 8000); } catch (err) { alert('Could not reset PIN.'); } };
 const getStoplight = (member) => { if (!member || !member.nextPayment) return 'green'; const comped = ['HD6', 'HD6 FAMILY', 'HCHF', 'MILITARY', 'MILITARY FAMILY', 'FIRST DAY FREE', 'LIFETIME', 'LIFETIME FAMILY']; if (comped.includes(member.type)) return 'green'; if (member.inactive) return 'red'; const due = new Date(member.nextPayment + 'T00:00:00'); const today = new Date(); const diffMs = today - due; const daysPastDue = Math.ceil(diffMs / (1000*60*60*24)); const daysUntilDue = Math.ceil((due - today) / (1000*60*60*24)); if (daysPastDue > 2) return 'red'; if (daysUntilDue <= 5) return 'yellow'; return 'green'; };
const filteredMembers = scopedMembers.filter(m => { if (!(m.firstName + ' ' + m.lastName + ' ' + m.id).toLowerCase().includes(searchQuery.toLowerCase())) return false; const today = new Date(); const firstOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1); const paidThisPeriod = m.nextPayment && new Date(m.nextPayment + 'T00:00:00') >= firstOfNextMonth; const isComped = ['HD6', 'HD6 FAMILY', 'HCHF', 'MILITARY', 'MILITARY FAMILY', 'FIRST DAY FREE', 'LIFETIME', 'LIFETIME FAMILY', 'HERITAGE ESTATES'].includes(m.type); if (memberFilter === 'paid') return paidThisPeriod || isComped; if (memberFilter === 'unpaid') return !paidThisPeriod && !isComped; if (memberFilter === 'overdue') return getStoplight(m) === 'red'; if (memberFilter === '247') return m.access247; if (memberFilter === 'orientation') return m.needsOrientation; if (memberFilter === 'inactive') return m.inactive; if (memberFilter === 'corporate') return m.type.includes('CORPORATE') || m.sponsorName; if (memberFilter === 'family') return m.type.includes('FAMILY') || m.familyName; if (memberFilter === 'notes') return m.notes && m.notes.trim() !== ''; return true; }).sort((a, b) => a.lastName.localeCompare(b.lastName));
  const processCheckIn = async (memberId, method = "Manual Entry") => {
    const id = memberId.toUpperCase().trim();
    const m = membersRef.current.find(m => m.id === id);

    if (m) {
      if (m.inactive) {
        setKioskMessage({ text: 'Membership Inactive', type: 'error', subtext: 'Please see the front desk.' });
        setTimeout(() => setKioskMessage({ text: '', type: '', subtext: '' }), 4500);
        return false;
      }

      // Check for location-specific orientation
      const currentLoc = centerRef.current.toLowerCase(); 
      const needsAnthony = currentLoc.includes('anthony') && !m.orientationAnthony;
      const needsHarper = currentLoc.includes('harper') && !m.orientationHarper;

      if (needsAnthony || needsHarper) {
        const centerName = needsAnthony ? "Anthony" : "Harper";
        setKioskMessage({ 
          text: 'Orientation Required', 
          type: 'error', 
          subtext: `Please see front desk to complete your ${centerName} orientation.` 
        });
        setTimeout(() => setKioskMessage({ text: '', type: '', subtext: '' }), 5000);
        return false;
      }

      const light = getStoplight(m);
      if (light === 'red') {
        setKioskMessage({ text: 'Please see front desk.', type: 'error', subtext: 'We need to quickly update your account.' });
        setTimeout(() => setKioskMessage({ text: '', type: '', subtext: '' }), 4500);
        return false;
      }

      const scanCenter = currentLoc === 'both' ? m.center : currentLoc.charAt(0).toUpperCase() + currentLoc.slice(1);
      const currentTime = new Date().toISOString();

      var recentDupe = visits.some(function(v) { return v.name === (m.firstName + ' ' + m.lastName) && (new Date(currentTime) - new Date(v.time)) < 30 * 60 * 1000; });
      if (recentDupe) {
        setKioskMessage({ text: 'Already checked in!', type: 'warning', subtext: m.firstName + ' was checked in less than 5 minutes ago.' });
        setTimeout(function() { setKioskMessage({ text: '', type: '', subtext: '' }); }, 4500);
        return false;
      }

      try {
        const res = await fetch('/api/visits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ airtableId: m.airtableId, center: scanCenter, time: currentTime, method: method })
        });
        const result = await res.json();
        if (!result.success) {
          setKioskMessage({ text: 'System Error', type: 'error', subtext: 'Please see the front desk.' });
          setTimeout(() => setKioskMessage({ text: '', type: '', subtext: '' }), 4000);
          return false;
        }
        setVisits(prev => [{name: m.firstName + ' ' + m.lastName, center: scanCenter, time: currentTime, type: m.type, method: method}, ...prev]);
        setMembers(prev => prev.map(member => member.id === id ? { ...member, visits: member.visits + 1 } : member));
        if (activeMember && activeMember.id === id) setActiveMember(prev => ({...prev, visits: prev.visits + 1}));
        
        if (light === 'yellow') {
          setKioskMessage({ text: `Welcome, ${m.firstName}!`, type: 'warning', subtext: 'Please see the front desk at your convenience.', photoUrl: m.photoUrl });
        } else {
          setKioskMessage({ text: `Welcome, ${m.firstName}!`, type: 'success', subtext: '', photoUrl: m.photoUrl });
        }
        setTimeout(() => setKioskMessage({ text: '', type: '', subtext: '' }), 5000);
        return true;
      } catch (err) {
        setKioskMessage({ text: 'Network Error', type: 'error', subtext: 'Please try again.' });
        setTimeout(() => setKioskMessage({ text: '', type: '', subtext: '' }), 4000);
        return false;
      }
    } else {
      // START OF RECOVERY LOGIC (If member not found in live data)
      const backup = JSON.parse(localStorage.getItem('wellness_backup_roster') || '[]');
      const offlineMember = backup.find(bm => bm.id === id);
      
      if (offlineMember) {
        setKioskMessage({ 
          text: `Welcome, ${offlineMember.name.split(' ')[0]}!`, 
          type: 'warning', 
          subtext: 'Offline mode: Check-in saved locally.' 
        });
        const pending = JSON.parse(localStorage.getItem('pending_visits') || '[]');
        pending.push({ id, time: new Date().toISOString(), center: centerRef.current });
        localStorage.setItem('pending_visits', JSON.stringify(pending));
        setTimeout(() => setKioskMessage({ text: '', type: '', subtext: '' }), 5000);
        return true;
      }
      
      setKioskMessage({ text: 'ID not found.', type: 'error', subtext: 'Please see front desk.' });
      setTimeout(() => setKioskMessage({ text: '', type: '', subtext: '' }), 3500);
      return false;
    }
  };

  const processVisitorCheckIn = async (visitor) => {
    const currentCenter = centerRef.current;
    const scanCenter = currentCenter === 'both' ? (visitor.center || 'Anthony') : currentCenter.charAt(0).toUpperCase() + currentCenter.slice(1);
    try {
      if (visitor.passesRemaining !== null && visitor.passesRemaining !== undefined && visitor.passesRemaining <= 0) { setKioskMessage({ text: 'No passes remaining', type: 'error', subtext: 'Please see the front desk to purchase more.' }); setTimeout(() => setKioskMessage({ text: '', type: '', subtext: '' }), 5000); return; }       const res = await fetch('/api/visitor-checkin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ visitorAirtableId: visitor.airtableId, center: scanCenter, decrementPass: visitor.passesRemaining !== null }) });
      const result = await res.json();
     if (result.success) {
        var newRemaining = visitor.passesRemaining !== null ? visitor.passesRemaining - 1 : null;
        setVisitors(prev => prev.map(v => v.airtableId === visitor.airtableId ? { ...v, totalVisits: (v.totalVisits || 0) + 1, passesRemaining: newRemaining } : v));
        setVisits(prev => [{ name: visitor.firstName + ' ' + visitor.lastName, center: scanCenter, time: new Date().toISOString(), type: 'VISITOR - ' + (visitor.passType || 'Pass'), method: 'Kiosk Search' }, ...prev]);
        var passMsg = newRemaining !== null ? ' (' + newRemaining + ' pass' + (newRemaining !== 1 ? 'es' : '') + ' remaining)' : '';
        var passWarn = newRemaining !== null && newRemaining <= 1;
        setKioskMessage({ text: `Welcome, ${visitor.firstName}!`, type: passWarn ? 'warning' : 'success', subtext: newRemaining !== null ? passMsg + (newRemaining <= 1 ? ' — Please see front desk to purchase more.' : '') : '' });
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

var showToast = function(message, type, duration) { setToast({ message: message, type: type || 'success' }); setTimeout(function() { setToast(null); }, duration || 4000); };

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
                  if (memberPinStep.inactive) {
                    setMemberLoginError('Your membership is currently inactive. Please contact the front desk.');
                    setMemberPinInput('');
                  } else if (val === memberPinStep.password) {
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
            <MemberPhoto src={currentMember.photoUrl} name={currentMember.firstName} size={36} className="border-2 border-white/20" />
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
             <div className="flex flex-col items-center">
  <div className="relative mb-4">
    {/* Member Photo with Camera Overlay */}
    <MemberPhoto src={currentMember.photoUrl} name={currentMember.firstName} size={110} className="border-4 border-white shadow-xl" />
    
    <label className="absolute bottom-0 right-0 bg-[#1080ad] text-white p-2.5 rounded-full cursor-pointer shadow-lg hover:scale-110 active:scale-95 transition-all border-2 border-white">
      <input 
        type="file" 
        accept="image/*" 
        capture="user" 
        className="hidden" 
        onChange={(e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (ev) => handleSelfieUpload(ev.target.result, currentMember.airtableId);
          reader.readAsDataURL(file);
        }} 
      />
      <Camera size={18} />
    </label>
  </div>
  
  <p className="text-[10px] font-black text-[#1080ad] uppercase tracking-widest mb-6">Tap Camera to Update Photo</p>
  
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
    const kioskMemberMatches = kioskInput.length >= 2 ? members.filter(m => !m.inactive && ((m.firstName + ' ' + m.lastName).toLowerCase().includes(kioskInput.toLowerCase()) || m.id.toLowerCase().includes(kioskInput.toLowerCase()))).slice(0, 4) : [];
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
              <button onClick={function() { var pw = ''; var done = false; var overlay = document.createElement('div'); overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,15,40,0.98);z-index:9999;display:flex;align-items:center;justify-content:center'; var box = document.createElement('div'); box.style.cssText = 'background:white;border-radius:24px;padding:48px;text-align:center;max-width:320px;width:90%'; box.innerHTML = '<p style="font-size:12px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:2px;margin-bottom:16px">Staff Auth Required</p><input type="password" maxlength="4" style="width:100%;padding:20px;font-size:32px;text-align:center;letter-spacing:0.3em;border:2px solid #e2e8f0;border-radius:12px;outline:none;font-weight:900" autofocus /><p style="font-size:11px;color:#cbd5e1;margin-top:12px">Enter 4-digit code</p>'; overlay.appendChild(box); document.body.appendChild(overlay); var inp = box.querySelector('input'); inp.addEventListener('input', function() { if (inp.value.length === 4) { if (inp.value === '2026') { document.body.removeChild(overlay); setView('landing'); } else { inp.value = ''; inp.style.borderColor = '#ef4444'; setTimeout(function() { inp.style.borderColor = '#e2e8f0'; }, 500); } } }); overlay.addEventListener('click', function(e) { if (e.target === overlay) document.body.removeChild(overlay); }); }} className="text-white/15 hover:text-white/60 p-2 transition-all"><X size={22} /></button>
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
              <button onClick={function() { var overlay = document.createElement('div'); overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,15,40,0.98);z-index:9999;display:flex;align-items:center;justify-content:center'; var box = document.createElement('div'); box.style.cssText = 'background:white;border-radius:24px;padding:48px;text-align:center;max-width:320px;width:90%'; box.innerHTML = '<p style="font-size:12px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:2px;margin-bottom:16px">Staff Auth Required</p><input type="password" maxlength="4" style="width:100%;padding:20px;font-size:32px;text-align:center;letter-spacing:0.3em;border:2px solid #e2e8f0;border-radius:12px;outline:none;font-weight:900" autofocus /><p style="font-size:11px;color:#cbd5e1;margin-top:12px">Enter 4-digit code</p>'; overlay.appendChild(box); document.body.appendChild(overlay); var inp = box.querySelector('input'); inp.addEventListener('input', function() { if (inp.value.length === 4) { if (inp.value === '2026') { document.body.removeChild(overlay); setKioskStaffMenu(true); } else { inp.value = ''; inp.style.borderColor = '#ef4444'; setTimeout(function() { inp.style.borderColor = '#e2e8f0'; }, 500); } } }); overlay.addEventListener('click', function(e) { if (e.target === overlay) document.body.removeChild(overlay); }); }} className="flex items-center gap-2 text-white/10 hover:text-white/40 transition-all text-xs">
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
                <div className={`mt-8 px-8 py-4 rounded-xl text-lg font-black flex items-center gap-4 ${kioskMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : kioskMessage.type === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {kioskMessage.photoUrl && <MemberPhoto src={kioskMessage.photoUrl} name="" size={56} className="border-2 border-white shadow-md" />}
                  <div>{kioskMessage.text}
                  {kioskMessage.subtext && <span className="block text-xs font-bold mt-1 opacity-70">{kioskMessage.subtext}</span>}
                </div></div>
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

  // MAIN DIRECTOR DASHBOARD
  return (
    <div className="flex min-h-screen bg-[#f0f2f5] font-sans text-slate-800">
      <aside className="w-64 bg-[#001f3f] text-white flex flex-col min-h-screen relative z-10 print:hidden">
        <div className="p-8 border-b border-white/10 flex justify-center"><img src={LOGO_URL} alt="Logo" className="h-10 opacity-90 drop-shadow-md" /></div>
        <div className="p-6"><div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-lg bg-[#f59e0b] flex items-center justify-center font-bold text-lg text-[#001f3f]">{user?.name.charAt(0)}</div><div><p className="text-sm font-bold leading-none">{user?.name}</p><p className="text-[11px] text-white/50">{user?.role === 'business' ? 'Business Office' : `@${user?.username}`}</p></div></div><button onClick={handleLogout} className="flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors"><LogOut size={14} /> Sign Out</button></div>
        <div className="px-4 mb-8"><p className="px-2 text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">Viewing</p><div className="space-y-1">{[{k:'both',c:'#ffffff'},{k:'harper',c:'#f59e0b'},{k:'anthony',c:'#1080ad'}].map(item => (<button key={item.k} onClick={() => { setViewingCenter(item.k); localStorage.setItem('wellnessCenter', item.k); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${viewingCenter === item.k ? 'bg-white/20 font-bold' : 'text-white/60 hover:bg-white/5'}`}><span className="w-1.5 h-6 rounded-full" style={{ backgroundColor: item.c }} />{item.k === 'both' ? 'Both Centers' : `${item.k.charAt(0).toUpperCase() + item.k.slice(1)}`}</button>))}</div></div>
        <nav className="flex-1 px-4 space-y-1">{[{id:'dashboard',label:'Dashboard',icon:<LayoutDashboard size={18}/>},{id:'members',label:'Members',icon:<Users size={18}/>},{id:'classes',label:'Classes',icon:<Calendar size={18}/>},{id:'badge',label:'Staff Check-In',icon:<QrCode size={18}/>},{id:'notif',label:'Notifications',icon:<Bell size={18}/>},{id:'visitors',label:'Visitors',icon:<Eye size={18}/>},{id:'corporate',label:'Corporate',icon:<Briefcase size={18}/>},{id:'payments',label:'Payments',icon:<CreditCard size={18}/>},{id:'reports',label:'Reports',icon:<FileText size={18}/>},{id:'help',label:'Help & Training',icon:<HelpCircle size={18}/>}].filter(item => { if (user?.role === 'business') return ['reports', 'corporate'].includes(item.id); return true; }).map(item => (<button key={item.id} onClick={() => { setActiveTab(item.id); setKioskInput(''); setHelpSearch(''); }} className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all ${activeTab === item.id ? 'bg-[#1080ad] text-white font-bold' : 'text-white/60 hover:bg-white/5'}`}>{item.icon} {item.label}{item.id === 'notif' && stats.overdue > 0 && <span className="ml-auto w-5 h-5 rounded-full bg-red-500 text-[10px] flex items-center justify-center font-bold tracking-tight">{stats.overdue}</span>}</button>))}</nav>
      </aside>

      <main className="flex-1 p-10 h-screen overflow-y-auto relative print:m-0 print:p-0 print:h-auto print:overflow-visible">
        <div className="mb-10 print:hidden"><h2 className="text-3xl font-bold text-[#001f3f] capitalize tracking-tight">{activeTab === 'notif' ? 'Notifications' : activeTab === 'help' ? '' : activeTab}</h2>{activeTab !== 'help' && <p className="text-sm text-slate-400 font-medium">{viewingCenter === 'both' ? 'All Centers' : viewingCenter.charAt(0).toUpperCase() + viewingCenter.slice(1) + ' Center'} · {currentDateString}</p>}</div>

        {activeTab === 'dashboard' && (() => {
          const today = new Date(); const todayStr = today.toDateString(); const weekFromNow = new Date(today.getTime() + 7*24*60*60*1000);
          const dueTodayMembers = scopedMembers.filter(m => m.nextPayment && new Date(m.nextPayment).toDateString() === todayStr);
          const overdueMembers = scopedMembers.filter(m => m.status === 'OVERDUE');
          const orientationMembers = scopedMembers.filter(function(m) { if (!m.needsOrientation) return false; if (viewingCenter === 'anthony') return !m.orientationAnthony; if (viewingCenter === 'harper') return !m.orientationHarper; return !m.orientationAnthony && !m.orientationHarper; });
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
              <div className="bg-gradient-to-br from-[#001f3f] to-[#003d6b] rounded-3xl p-8 text-white relative overflow-hidden"><div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div><div className="relative z-10"><div className="flex justify-between items-start mb-6"><div><h2 className="text-2xl font-black tracking-tight">{greeting}, {user?.name?.split(' ')[0] || 'Director'}.</h2><p className="text-white/60 text-sm font-medium mt-1">{currentDateString} · {viewingCenter === 'both' ? 'All Centers' : viewingCenter.charAt(0).toUpperCase() + viewingCenter.slice(1) + ' Center'}</p></div><div className="flex flex-col items-end gap-2"><div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl"><Activity size={16} className="text-[#dba51f]" /><span className="text-sm font-bold">{stats.today} check-in{stats.today !== 1 ? 's' : ''} today</span></div><div className="flex items-center gap-3 bg-black/30 px-4 py-2 rounded-xl border border-white/10 shadow-inner"><span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: occColor }}></span><span className="relative inline-flex rounded-full h-3 w-3" style={{ backgroundColor: occColor }}></span></span><span className="text-xs font-bold text-white/80 uppercase tracking-widest">Est. Occupancy: <span style={{ color: occColor, fontSize: '14px', marginLeft: '4px' }}>{currentOccupancy} ({occStatus})</span></span></div></div></div>{briefingItems.length === 0 ? (<div className="bg-white/10 rounded-2xl p-6 text-center"><CheckCircle size={32} className="mx-auto mb-2 text-green-400" /><p className="font-bold text-lg">All clear!</p><p className="text-white/50 text-sm">No members need attention right now.</p></div>) : (<div><p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Needs Your Attention ({briefingItems.length})</p><div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[200px] overflow-y-auto pr-2">{briefingItems.slice(0, showAllBriefings ? briefingItems.length : 8).map((item,i) => (<button key={i} onClick={() => { const f = scopedMembers.find(m => m.id === item.id); if (f) setSelectedMember(f); }} className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-xl p-3 text-left transition-all group"><div className={`w-2 h-8 rounded-full flex-shrink-0 ${item.type==='overdue'?'bg-red-500':item.type==='due'?'bg-[#dd6d22]':item.type==='orientation'?'bg-[#1080ad]':'bg-[#dba51f]'}`}></div><div className="flex-1 min-w-0"><p className="font-bold text-sm truncate">{item.name}</p><p className="text-[11px] text-white/50">{item.detail}</p></div><ChevronRight size={14} className="text-white/30 group-hover:text-white/60 flex-shrink-0" /></button>))}</div>{briefingItems.length > 8 && <button onClick={() => setShowAllBriefings(!showAllBriefings)} className="w-full text-xs text-white/40 hover:text-white/80 mt-3 text-center transition-colors cursor-pointer">{showAllBriefings ? 'Show Less ↑' : `+ ${briefingItems.length-8} more ↓`}</button>}</div>)}</div></div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative"><h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Search size={14}/> Quick Member Lookup</h3><div className="relative"><input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1080ad] text-sm" placeholder="Type a name, ID, or email..." value={quickSearch} onChange={e => setQuickSearch(e.target.value)} />{quickResults.length > 0 && (<div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden">{quickResults.map(m => (<button key={m.id} onClick={() => { setSelectedMember(m); setQuickSearch(''); }} className="w-full p-4 border-b border-slate-50 last:border-0 hover:bg-blue-50 transition-colors flex justify-between items-center text-left"><div><p className="font-bold text-[#001f3f]">{m.firstName} {m.lastName}</p><p className="text-[10px] text-slate-400">{m.id} · {m.type}</p></div><span className={`px-2 py-1 rounded-full text-[9px] font-black ${getStoplight(m)==='green'?'bg-green-100 text-green-600':getStoplight(m)==='yellow'?'bg-yellow-100 text-yellow-600':'bg-red-100 text-red-600'}`}>{getStoplight(m)==='green'?'ACTIVE':getStoplight(m)==='yellow'?'GRACE':'LOCKED'}</span></button>))}</div>)}</div></div><div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between"><h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><FileText size={14}/> Quick Export</h3><div className="space-y-3"><button onClick={exportTodaysLog} className="w-full bg-[#1080ad] text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"><Download size={16}/> Export Today's Check-in Log</button><button onClick={handleExportCSV} className="w-full bg-slate-100 text-[#001f3f] py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"><Download size={16}/> Export Full Member List</button></div></div></div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <ProListCard title="Check-in Log" actions={<div className="flex items-center gap-2"><button onClick={() => { var d = new Date(checkinDate + 'T00:00:00'); d.setDate(d.getDate() - 1); setCheckinDate(d.toISOString().split('T')[0]); setShowAllCheckins(false); }} className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-black transition-colors">&lt;</button><input type="date" value={checkinDate} onChange={(e) => { setCheckinDate(e.target.value); setShowAllCheckins(false); }} className="px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm font-bold text-[#001f3f] outline-none focus:border-[#1080ad] cursor-pointer shadow-sm" /><button onClick={() => { var d = new Date(checkinDate + 'T00:00:00'); d.setDate(d.getDate() + 1); setCheckinDate(d.toISOString().split('T')[0]); setShowAllCheckins(false); }} className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-black transition-colors">&gt;</button><button onClick={() => { setCheckinDate(new Date().toISOString().split('T')[0]); setShowAllCheckins(false); }} className="px-3 py-2.5 bg-[#1080ad] text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm">Today</button></div>}>
                  {(() => {
                    const selectedDateStr = new Date(checkinDate + 'T00:00:00').toDateString();
                    const isToday = selectedDateStr === new Date().toDateString();
                    const todayVisits = filteredVisits.filter(v => new Date(v.time).toDateString() === selectedDateStr).sort(function(a, b) { return new Date(b.time) - new Date(a.time); });
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
                            <p className="text-slate-400 italic text-sm">{isToday ? 'Waiting for activity...' : 'No check-ins on this date.'}</p>
                          ) : (
                            displayedVisits.map((v, i) => (
                             <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div>
                                  <p className="font-bold text-slate-800">{v.name}</p>
                                  <p className="text-[11px] font-bold text-[#f59e0b] uppercase">
                                    {v.center?.toLowerCase() === 'harper' ? 'Harper Wellness Center' : v.center?.toLowerCase() === 'anthony' ? 'Anthony Wellness Center' : v.center} • {v.type}
                                  </p>
                                </div>
                                <div className="flex items-center gap-3 text-slate-400 text-xs font-medium">
                                  <Clock size={14}/> {new Date(v.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  <button onClick={function(e) { e.stopPropagation(); if (!window.confirm('Remove check-in for ' + v.name + ' at ' + new Date(v.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + '?')) return; var matchMem = members.find(function(m) { return (m.firstName + ' ' + m.lastName) === v.name; }); if (matchMem) { fetch('/api/delete-visit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ memberAirtableId: matchMem.airtableId, visitTime: v.time, visitCenter: v.center }) }).catch(function(err) { console.error('Delete visit error:', err); }); setMembers(function(prev) { return prev.map(function(m) { return m.id === matchMem.id ? Object.assign({}, m, { visits: Math.max(0, m.visits - 1) }) : m; }); }); } setVisits(function(prev) { return prev.filter(function(visit) { return !(visit.name === v.name && visit.time === v.time && visit.center === v.center); }); }); }} className="text-slate-300 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50" title="Remove this check-in"><X size={14}/></button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        {todayVisits.length > 5 && (
                          <button onClick={() => setShowAllCheckins(!showAllCheckins)} className="w-full py-2 mt-2 text-sm font-bold text-[#1080ad] hover:text-[#001f3f] transition-colors bg-blue-50/50 rounded-lg border border-blue-100 hover:bg-blue-50">
                            {showAllCheckins ? 'Collapse List ↑' : 'See All ' + todayVisits.length + ' Check-ins \u2192'}
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
                <ProListCard title="7-Day Visit Streak">
                  <div className="space-y-3 mt-4">
                    {Array(7).fill(0).map(function(_, i) {
                      var d = new Date(); d.setDate(d.getDate() - (6 - i));
                      var dayStr = d.toDateString();
                      var dayLabel = d.toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric'});
                      var isToday = dayStr === new Date().toDateString();
                      var dayCount = filteredVisits.filter(function(v) { return new Date(v.time).toDateString() === dayStr; }).length;
                      var maxDay = Math.max.apply(null, Array(7).fill(0).map(function(__, j) { var dd = new Date(); dd.setDate(dd.getDate() - (6 - j)); return filteredVisits.filter(function(v) { return new Date(v.time).toDateString() === dd.toDateString(); }).length; })) || 1;
                      var pct = Math.max(4, Math.round((dayCount / maxDay) * 100));
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <span className={"text-[10px] font-bold w-20 text-right " + (isToday ? "text-[#1080ad]" : "text-slate-400")}>{isToday ? 'Today' : dayLabel}</span>
                          <div className="flex-1 h-6 bg-slate-100 rounded-lg overflow-hidden relative">
                            <div className="h-full rounded-lg transition-all duration-700" style={{width: pct + '%', background: isToday ? '#1080ad' : dayCount > 0 ? '#003d6b' : '#e2e8f0'}}></div>
                          </div>
                          <span className={"text-sm font-black w-8 " + (isToday ? "text-[#1080ad]" : dayCount > 0 ? "text-[#001f3f]" : "text-slate-300")}>{dayCount}</span>
                        </div>
                      );
                    })}
                  </div>
                </ProListCard>
              </div>
            </div>
          );
        })()}

        {activeTab === 'members' && (<div className="space-y-6"><div className="flex justify-between items-center mb-8"><div><h2 className="text-3xl font-bold text-[#001f3f] tracking-tight">Members</h2></div><div className="flex gap-3"><button onClick={handleExportCSV} className="bg-white border border-slate-200 text-[#001f3f] px-6 py-2 rounded-xl font-bold text-sm shadow-sm flex items-center gap-2 hover:bg-slate-50 transition-all"><Download size={16}/> Export CSV</button><button onClick={() => { setShowAddModal(true); setNewMemberPin(null); setFamilyFlow(null); setSelectedSponsor(''); setCustomSponsor(''); setFirstPayment({ open: false, prorated: false, method: null, memberData: null }); }} className="bg-[#001f3f] text-white px-6 py-2 rounded-xl font-bold text-sm shadow-xl shadow-blue-900/10 flex items-center gap-2 hover:bg-blue-900 transition-colors"><Plus size={16}/> Add Member</button></div></div><div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4"><div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} /><input className="pl-12 pr-4 py-2 border rounded-xl text-sm w-full outline-none" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div><div className="flex flex-wrap gap-2">{[{k:'all',label:'All Members'},{k:'paid',label:'Paid'},{k:'unpaid',label:'Unpaid'},{k:'overdue',label:'Overdue'},{k:'247',label:'24/7 Access'},{k:'orientation',label:'Needs Orientation'},{k:'inactive',label:'Inactive'},{k:'corporate',label:'Corporate'},{k:'family',label:'Family Plans'},{k:'notes',label:'Has Notes'}].map(f => (<button key={f.k} onClick={() => setMemberFilter(memberFilter === f.k ? 'all' : f.k)} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${memberFilter === f.k ? 'bg-[#001f3f] text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{f.label}</button>))}</div></div>{loading ? (<div className="text-center py-20 text-slate-300 font-medium italic">Syncing Airtable...</div>) : apiError ? (<div className="bg-red-50 border-2 border-red-200 text-red-700 p-10 rounded-2xl text-center shadow-sm"><AlertCircle size={48} className="mx-auto mb-4 text-red-500" /><h3 className="text-2xl font-black mb-2">Airtable Refused Connection</h3><p className="font-mono text-sm bg-white p-4 rounded-lg border border-red-100 max-w-2xl mx-auto">{apiError}</p></div>) : (<div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-visible pb-24"><table className="w-full text-left border-collapse"><thead className="bg-slate-50 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b"><tr><th className="px-6 py-4 w-56">Member</th><th className="px-4 py-4">ID</th><th className="px-4 py-4 w-36">Type</th><th className="px-4 py-4 w-28">Status</th><th className="px-4 py-4 w-28">Payment</th><th className="px-4 py-4 w-24">Info</th></tr></thead><tbody className="text-sm">{filteredMembers.map(m => { const light = getStoplight(m); return (<tr key={m.id} className="border-b hover:bg-slate-50/80 cursor-pointer" onClick={() => setSelectedMember(m)}><td className="px-6 py-4"><div className="flex items-center gap-3"><MemberPhoto src={m.photoUrl} name={m.firstName} size={32} /><div><p className="font-bold text-slate-800">{m.firstName} {m.lastName}</p><p className="text-[11px] text-slate-400">{m.email}{m.needsOrientation && <span className="ml-2 px-2 py-0.5 rounded text-[9px] font-black bg-blue-100 text-blue-700 uppercase">Orientation</span>}{m.familyName && (() => { const fam = members.filter(f => f.familyName === m.familyName && f.airtableId !== m.airtableId); return <span className="ml-2 px-2 py-0.5 rounded text-[9px] font-black bg-purple-100 text-purple-700">{m.familyName}{fam.length > 0 && <span className="font-medium text-purple-500">: {fam.map(f => f.firstName).join(', ')}</span>}</span>; })()}{m.sponsorName && <span className="ml-2 px-2 py-0.5 rounded text-[9px] font-black bg-orange-100 text-orange-700 uppercase">{m.sponsorName}</span>}{m.access247 && <span className="ml-2 px-2 py-0.5 rounded text-[9px] font-black bg-amber-100 text-amber-700 uppercase">24/7</span>}{m.inactive && <span className="ml-2 px-2 py-0.5 rounded text-[9px] font-black bg-red-100 text-red-600 uppercase">Inactive</span>}</p>{m.notes && (<p className="mt-1.5 text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md truncate max-w-[220px]" title={m.notes}><strong>Note:</strong> {m.notes}</p>)}</div></div></td><td className="px-4 py-4 font-mono text-slate-400 text-xs">{m.id}</td><td className="px-4 py-4"><span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black tracking-tight">{m.type}</span></td><td className="px-4 py-4"><span className={`px-3 py-1 rounded-full text-[10px] font-black ${m.inactive?'bg-red-100 text-red-600':light==='green'?'bg-green-100 text-green-600':light==='yellow'?'bg-yellow-100 text-yellow-600':'bg-red-100 text-red-600'}`}>{m.inactive?'INACTIVE':light==='green'?'ACTIVE':light==='yellow'?'GRACE':'LOCKED'}</span></td><td className="px-4 py-4 text-center">{(() => { const isCorp = m.sponsorName && (m.type.includes('CORPORATE') || m.type.includes('HD6') || m.type.includes('HCHF')); const isComped = ['HD6', 'HD6 FAMILY', 'HCHF', 'MILITARY', 'MILITARY FAMILY', 'FIRST DAY FREE', 'LIFETIME', 'LIFETIME FAMILY', 'HERITAGE ESTATES'].includes(m.type); if (isComped) return <div className="relative group inline-flex flex-col items-center"><CheckCircle size={18} className="text-slate-300" /><div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#001f3f] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-10">Comped - no payment required</div></div>; const today = new Date(); const firstOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1); const paidThisPeriod = m.nextPayment && new Date(m.nextPayment + 'T00:00:00') >= firstOfNextMonth; let isPaid = paidThisPeriod; let paidLabel = paidThisPeriod ? `Paid: ${m.paymentMethod || 'Logged'}` : 'Not paid this month'; if (isCorp) { const sponsor = corporatePartners.find(cp => cp.sponsorMatch === m.sponsorName); const corpPaid = sponsor && sponsor.paidMonths && sponsor.paidMonths.split(',').some(str => str.startsWith(reportMonth)); if (corpPaid) { isPaid = true; const method = sponsor.paidMonths.split(',').find(str => str.startsWith(reportMonth)); paidLabel = `Corp Paid: ${method.split(':')[1] || 'Logged'} (${m.sponsorName})`; } else if (!paidThisPeriod) { paidLabel = `Awaiting ${m.sponsorName} payment`; } } return (<div className="relative group inline-flex flex-col items-center">{isPaid ? <CheckCircle size={18} className={isCorp && !paidThisPeriod ? 'text-[#8b5cf6]' : 'text-[#16a34a]'} /> : <X size={18} className="text-red-400" />}<div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#001f3f] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-10">{paidLabel}{m.nextPayment && <span className="block text-white/50">Due: {m.nextPayment}</span>}</div></div>); })()}</td><td className="px-4 py-4"><button className="p-2 bg-[#1080ad] text-white rounded-lg shadow-md"><QrCode size={16}/></button></td></tr>);})}</tbody></table></div>)}</div>)}
        <button onClick={() => {
  const membersToPrint = filteredMembers.filter(m => !m.inactive);
  if (membersToPrint.length === 0) return alert("No active members found.");
  if (!window.confirm(`Generate letters for ${membersToPrint.length} members? \n\n(This might take a few seconds to load all the QR codes).`)) return;

  let html = `<!DOCTYPE html><html><head><title>Bulk Print Letters</title><style>
    @page { margin: 0.4in 0.6in; }
    @media print {
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .page-break { page-break-after: always; }
    }
    body{font-family:Arial,sans-serif;color:#1e293b;margin:0;padding:0}
    .page{max-width:7.5in;margin:0 auto;position:relative;page-break-inside:avoid;}
    .hdr{background:#003d6b;padding:10px 24px;display:flex;align-items:center;gap:12px}
    .hdr-logo{height:24px;opacity:.95}
    .hdr-name{font-size:14px;font-weight:700;color:#fff}
    .hdr-sub{font-size:8px;color:#8bb8d9;letter-spacing:1px;margin-top:1px}
    .accent{height:3px;background:linear-gradient(to right,#dba51f,#dd6d22)}
    .window-addr{margin-top:0.9in;margin-left:0.5in;font-size:12px;line-height:1.5;color:#1e293b;font-weight:600;min-height:0.85in}
    .body{padding-top:0}
    .date{font-size:9px;color:#94a3b8;text-align:right;margin-bottom:6px}
    .greeting{font-size:12px;margin-bottom:6px;font-weight:700;color:#003d6b}
    .intro{font-size:10.5px;color:#475569;line-height:1.4;margin-bottom:8px}
    .section-title{font-size:9px;font-weight:900;color:#003d6b;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px;padding-bottom:2px;border-bottom:2px solid #dba51f;margin-top:10px}
    .cred-section{display:flex;align-items:center;gap:24px;justify-content:center;margin:6px 0;padding:8px 16px;background:#f8fafc;border-radius:6px;border:1px solid #e2e8f0}
    .how-to{font-size:10px;color:#475569;line-height:1.4;margin:6px 0;padding:8px 12px;background:#eff6ff;border-radius:5px;border:1px solid #bfdbfe}
    .how-to strong{color:#003d6b}
    .portal-box{margin:8px 0;padding:10px;background:#f0fdf4;border-radius:6px;border:1.5px solid #bbf7d0;text-align:center}
    .box{border:1.5px solid #003d6b;border-radius:5px;overflow:hidden;margin-bottom:8px}
    .box-hdr{background:#003d6b;padding:4px 12px;font-size:8px;font-weight:700;color:#fff;letter-spacing:1.5px}
    .box-body{padding:0 12px}
    .row{display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #e2e8f0}
    .row:last-child{border-bottom:none}
    .lbl{font-size:10px;color:#64748b}
    .val{font-size:10px;font-weight:700;color:#003d6b}
    .sign{font-size:10px;margin-bottom:1px;margin-top:10px}
    .sign-name{font-size:10px;font-weight:700;color:#003d6b}
    .sign-title{font-size:9px;color:#94a3b8}
  </style></head><body>`;

  membersToPrint.forEach((m, index) => {
    const isHarper = m.center && m.center.toLowerCase().includes('harper');
    const centerName = isHarper ? 'Harper Wellness Center' : 'Anthony Wellness Center';
    const centerAddr = isHarper ? '615 W 12th St, Harper, KS 67058' : '309 W Main St, Anthony, KS 67003';
    const centerPhone = isHarper ? '(620) 896-1202' : '(620) 842-5190';
    const centerHours = isHarper ? 'M-F 8am-12pm &amp; 5pm-8pm, Sat 9am-noon' : 'M-F 7am-8pm, Sat 8am-1pm';
    const directorName = isHarper ? 'Patrick Johnson' : 'Deanna Smithhisler';
    const addressBlock = m.address ? `${m.firstName} ${m.lastName}<br/>${m.address}<br/>${m.city}, ${m.state} ${m.zip}` : `${m.firstName} ${m.lastName}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(m.id)}&color=003d6b&bgcolor=ffffff`;

    html += `<div class="page"><div class="hdr"><img src="https://pattersonhc.org/sites/default/files/wellness_white.png" class="hdr-logo" /><div><div class="hdr-name">${centerName}</div><div class="hdr-sub">${centerAddr} | ${centerPhone}</div></div></div><div class="accent"></div><div class="window-addr">${addressBlock}</div><div class="body"><div class="date">${new Date().toLocaleDateString('en-US', {month:'long',day:'numeric',year:'numeric'})}</div><div class="greeting">Dear ${m.firstName},</div><div class="intro">We are excited to announce a new digital check-in system at ${centerName}! You can now check in quickly at the front desk kiosk using your personal QR code or your name and PIN. You can also view your membership details online through our new Member Portal.</div><div class="section-title">Your Check-In Credentials</div><div class="cred-section"><div style="text-align:center"><p style="font-size:8px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:2px;margin:0 0 4px 0">Your QR Badge</p><img src="${qrUrl}" width="95" height="95" /><p style="font-size:8px;color:#64748b;margin:3px 0 0 0">Hold up to the kiosk camera</p></div><div style="text-align:center;padding-left:20px;border-left:1px solid #e2e8f0"><p style="font-size:8px;color:#94a3b8;text-transform:uppercase;letter-spacing:2px;margin:0">Your 4-Digit PIN</p><p style="font-size:24px;font-weight:900;letter-spacing:0.3em;color:#003d6b;margin:2px 0">${m.password}</p><p style="font-size:8px;color:#94a3b8;margin:0">Use when checking in by name</p><p style="font-size:8px;color:#94a3b8;text-transform:uppercase;letter-spacing:2px;margin:8px 0 0 0">Member ID</p><p style="font-size:14px;font-weight:900;color:#003d6b;font-family:monospace;margin:2px 0 0 0">${m.id}</p></div></div><div class="how-to"><strong>How to Check In at the Kiosk:</strong><br/>1. <strong>Scan</strong> &mdash; Hold this letter (or your phone) up to the kiosk camera to scan the QR code<br/>2. <strong>Search</strong> &mdash; Or type your name, select yourself, and enter your 4-digit PIN<br/>3. A green &ldquo;Welcome&rdquo; message confirms you are checked in!</div><div class="section-title">Your Online Member Portal</div><div class="intro">View your membership status, visit history, and QR code online anytime. No app download required &mdash; just visit the link below from any phone, tablet, or computer.</div><div class="portal-box"><p style="font-size:8px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:2px;margin:0 0 4px 0">Member Portal</p><p style="font-size:13px;font-weight:900;color:#16a34a;margin:0">wellness-kiosk-7k6p.vercel.app/?view=member_login</p><p style="font-size:9px;color:#64748b;margin:4px 0 0 0">Visit link &bull; Search your name &bull; Enter your 4-digit PIN</p></div><div class="box"><div class="box-hdr">YOUR MEMBERSHIP SUMMARY</div><div class="box-body"><div class="row"><span class="lbl">Member ID</span><span class="val">${m.id}</span></div><div class="row"><span class="lbl">Membership Type</span><span class="val">${m.type}</span></div><div class="row"><span class="lbl">Home Center</span><span class="val">${m.center}</span></div><div class="row"><span class="lbl">Hours</span><span class="val">${centerHours.replace(/&amp;/g, '&')}</span></div></div></div><div style="font-size:9.5px;color:#64748b;line-height:1.4;margin-top:10px">Please keep this letter for your records. Your PIN is private &mdash; do not share it with others. If you have any questions about the new system, please ask the front desk staff and we will be happy to help!</div><div class="sign">We look forward to seeing you!</div><div class="sign-name">${directorName}</div><div class="sign-title">Director, ${centerName}</div></div></div>`;

    if (index < membersToPrint.length - 1) {
      html += '<div class="page-break"></div>';
    }
  });

  html += '</body></html>';
  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
  
  // Wait 2.5 seconds before opening print dialog so the 100+ QR code images have time to fetch
  setTimeout(() => w.print(), 2500); 
}} className="bg-red-500 text-white px-6 py-2 rounded-xl font-bold shadow-xl shadow-red-500/20"
>
  🔥 TEMP: BULK PRINT LETTERS
</button>
  <button onClick={() => {
  const membersToPrint = filteredMembers.filter(m => !m.inactive);
  if (membersToPrint.length === 0) return alert("No active members found to print.");
  
  const totalCards = Math.ceil(membersToPrint.length / 3);
  if (!window.confirm(`Generate Double-Sided Premium 3-Up key tags (Logo Focus) for ${membersToPrint.length} members?\n\nThis will use ${totalCards} blank cards.\n\n(Please wait about 5-8 seconds after clicking OK for the ${membersToPrint.length} QR codes to generate before the print menu appears).`)) return;

  let html = `<!DOCTYPE html><html><head><title>Premium Bulk Print 3-Up Tags (Double-Sided)</title><style>
    @page { size: 3.375in 2.125in; margin: 0; }
    @media print { 
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } 
      .card-page { page-break-after: always; }
    }
    body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; background: #fff; }
    .card-page { width: 3.375in; height: 2.125in; display: flex; flex-direction: row; overflow: hidden; box-sizing: border-box; }
    
    /* Front Tag Styles */
    .tag { width: 1.125in; height: 2.125in; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; position: relative; border-right: 1px dashed #f1f5f9; }
    .tag:last-child { border-right: none; }
    
    /* Top space for hole punch */
    .hole-space { height: 0.35in; width: 100%; flex-shrink: 0; background: #fff; }
    
    /* Logo on White - LARGER SIZE */
    .logo-sec { width: 100%; padding: 4px 0; display: flex; justify-content: center; align-items: center; flex-shrink: 0; background: #fff; }
    .logo-sec img { height: 18px; max-width: 95%; object-fit: contain; filter: invert(1); opacity: 0.85; }
    
    /* ID on Colored Background - NO NAME */
    .id-sec { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; padding: 4px; box-sizing: border-box; border-top: 1.5px solid rgba(0,0,0,0.1); border-bottom: 1.5px solid rgba(0,0,0,0.1); }
    .member-id-display { font-size: 14px; font-weight: 900; color: #fff; text-transform: uppercase; text-align: center; line-height: 1.05; letter-spacing: -0.2px; text-shadow: 0px 1px 2px rgba(0,0,0,0.3); }
    
    /* QR on White */
    .qr-wrapper { margin-bottom: 6px; margin-top: 4px; display: flex; flex-direction: column; align-items: center; background: #fff; width: 100%; flex-shrink: 0; }
    .qr-code { width: 0.78in; height: 0.78in; display: block; padding: 2px; background: #fff; border: 1.5px solid #e2e8f0; border-radius: 5px; }
    .scan-text { font-size: 5px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-top: 3px; }

    /* Back Tag Styles - Return to Sender (Same as before) */
    .back-tag { width: 1.125in; height: 2.125in; box-sizing: border-box; background: #fff; display: flex; flex-direction: column; align-items: center; border-right: 1px dashed #f1f5f9; position: relative; }
    .back-tag:last-child { border-right: none; }
    .back-hole-space { height: 0.35in; width: 100%; flex-shrink: 0; background: #fff; }
    .back-content { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; padding: 0 4px; text-align: center; }
    .back-title { font-size: 6px; font-weight: 900; color: #dd6d22; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; line-height: 1.3; }
    .back-text { font-size: 5px; font-weight: 700; color: #475569; line-height: 1.3; margin-bottom: 6px; }
    .back-text strong { color: #001f3f; font-size: 5.5px; display: block; margin-bottom: 1px; }
    .back-accent { height: 3px; width: 100%; background: linear-gradient(to right, #dba51f, #dd6d22); position: absolute; bottom: 0; }
  </style></head><body>`;

  const logoUrl = 'https://pattersonhc.org/sites/default/files/wellness_white.png';
  const genericBackHTML = `
    <div class="back-tag">
      <div class="back-hole-space"></div>
      <div class="back-content">
        <div class="back-title">If found, please<br/>contact us:</div>
        <div class="back-text"><strong>Anthony Wellness Center</strong>309 W Main St<br/>Anthony, KS 67003<br/>(620) 842-5190</div>
        <div class="back-text" style="margin-bottom:0;"><strong>Harper Wellness Center</strong>615 W 12th St<br/>Harper, KS 67058<br/>(620) 896-1202</div>
      </div>
      <div class="back-accent"></div>
    </div>
  `;

  for (let i = 0; i < membersToPrint.length; i += 3) {
    const chunk = membersToPrint.slice(i, i + 3);
    
    // --- PRINT THE FRONT OF THE CARD ---
    html += `<div class="card-page">`;
    chunk.forEach(m => {
      const isHarper = m.center && m.center.toLowerCase().includes('harper');
      const bgGradient = isHarper ? 'linear-gradient(135deg, #f59e0b, #dd6d22)' : 'linear-gradient(135deg, #1080ad, #003d6b)';
      const qrColor = isHarper ? 'dd6d22' : '003d6b';
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(m.id)}&color=${qrColor}&bgcolor=ffffff`;
      
      html += `
        <div class="tag">
          <div class="hole-space"></div>
          <div class="logo-sec">
            <img src="${logoUrl}" />
          </div>
          <div class="id-sec" style="background: ${bgGradient};">
            <div class="member-id-display">ID: ${m.id}</div>
          </div>
          <div class="qr-wrapper">
            <img class="qr-code" src="${qrUrl}" />
            <div class="scan-text">Scan To Enter</div>
          </div>
        </div>
      `;
    });
    for (let j = chunk.length; j < 3; j++) { html += `<div class="tag"></div>`; }
    html += `</div>`; 

    // --- PRINT THE BACK OF THE CARD ---
    html += `<div class="card-page">`;
    html += genericBackHTML + genericBackHTML + genericBackHTML;
    html += `</div>`; 
  }

  html += `</body></html>`;
  
  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
  
  setTimeout(() => w.print(), 4000); 
}} className="bg-red-500 text-white px-6 py-2 rounded-xl font-bold shadow-xl shadow-red-500/20"
>
  🔥 TEMP: BULK PRINT DUAL-SIDED TAGS
</button>
        {activeTab === 'classes' && (() => {
          const allClasses = [
            { name: 'Low-Impact Aerobics', center: 'anthony', days: 'Mon - Fri', time: '9:30 AM', capacity: 25, color: 'border-[#1080ad]' },
            { name: 'Sit & Get Fit', center: 'anthony', days: 'Mon - Fri', time: '11:00 AM', capacity: 20, color: 'border-[#1080ad]' },
            { name: 'Modified Sit & Get Fit', center: 'anthony', days: 'Mon, Wed, Fri', time: '2:00 PM', capacity: 20, color: 'border-[#1080ad]' },
            { name: 'Low Impact Aerobics', center: 'harper', days: 'Mon, Wed, Fri', time: '10:00 AM', capacity: 25, color: 'border-[#f59e0b]' },
            { name: 'Chair Class', center: 'harper', days: 'Mon, Wed, Fri', time: '11:00 AM', capacity: 20, color: 'border-[#f59e0b]' }
          ];
          const selectedClassDate = new Date(checkinDate + 'T00:00:00');
          const todayIdx = selectedClassDate.getDay();
          const dayMap = {0:'Sun',1:'Mon',2:'Tue',3:'Wed',4:'Thu',5:'Fri',6:'Sat'};
          const todayName = dayMap[todayIdx];
          const displayedClasses = allClasses.filter(c => { const isRightCenter = viewingCenter === 'both' || c.center === viewingCenter; const isRightDay = c.days === 'Mon - Fri' ? (todayIdx >= 1 && todayIdx <= 5) : c.days.includes(todayName); return isRightCenter && isRightDay; });
          const todayStr = selectedClassDate.toDateString();
          const isViewingToday = todayStr === new Date().toDateString();
          return (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-8"><div><h2 className="text-3xl font-bold text-[#001f3f] tracking-tight">Class Attendance</h2><p className="text-slate-400 font-medium">Select a class to log attendee check-ins.</p></div><div className="flex items-center gap-3"><div className="flex items-center gap-2"><button onClick={function() { var d = new Date(checkinDate + 'T00:00:00'); d.setDate(d.getDate() - 1); setCheckinDate(d.toISOString().split('T')[0]); }} className="w-9 h-9 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 font-black transition-colors shadow-sm">&lt;</button><input type="date" value={checkinDate} onChange={function(e) { setCheckinDate(e.target.value); }} className="px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm font-bold text-[#001f3f] outline-none focus:border-[#1080ad] cursor-pointer shadow-sm" /><button onClick={function() { var d = new Date(checkinDate + 'T00:00:00'); d.setDate(d.getDate() + 1); setCheckinDate(d.toISOString().split('T')[0]); }} className="w-9 h-9 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 font-black transition-colors shadow-sm">&gt;</button><button onClick={function() { setCheckinDate(new Date().toISOString().split('T')[0]); }} className="px-3 py-2.5 bg-[#1080ad] text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm">Today</button></div><button onClick={function() { var classNames = viewingCenter === 'harper' ? ['Low Impact Aerobics', 'Chair Class'] : viewingCenter === 'anthony' ? ['Low-Impact Aerobics', 'Sit & Get Fit', 'Modified Sit & Get Fit'] : ['Low-Impact Aerobics', 'Sit & Get Fit', 'Modified Sit & Get Fit', 'Low Impact Aerobics', 'Chair Class']; var periodParts = reportMonth.split('-'); var yr = parseInt(periodParts[1]); var mo = parseInt(periodParts[0]) - 1; var monthName = new Date(yr, mo).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }); var monthVisits = visits.filter(function(v) { if (!v.time) return false; var d = new Date(v.time); return d.getFullYear() === yr && d.getMonth() === mo; }); var centerName = viewingCenter === 'both' ? 'All Centers' : viewingCenter.charAt(0).toUpperCase() + viewingCenter.slice(1) + ' Wellness Center'; var classStats = classNames.map(function(cn) { var cv = monthVisits.filter(function(v) { return v.method === 'Class: ' + cn; }); if (cv.length === 0) return null; var dayMap = {}; cv.forEach(function(v) { var dayKey = new Date(v.time).toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric'}); if (!dayMap[dayKey]) dayMap[dayKey] = []; dayMap[dayKey].push(v.name); }); var days = {}; cv.forEach(function(v) { days[new Date(v.time).toDateString()] = true; }); var sess = Object.keys(days).length; return { name: cn, total: cv.length, sessions: sess, avg: sess > 0 ? Math.round(cv.length / sess) : 0, byDay: dayMap }; }).filter(Boolean); if (classStats.length === 0) { alert('No class attendance data for ' + monthName); return; } var classBlocks = classStats.map(function(c) { var dayRows = Object.entries(c.byDay).map(function(entry) { return '<tr><td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#334155;">' + entry[0] + '</td><td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;text-align:center;font-weight:900;color:#1080ad;">' + entry[1].length + '</td><td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;font-size:11px;color:#64748b;">' + entry[1].join(', ') + '</td></tr>'; }).join(''); return '<div style="margin-bottom:24px"><h3 style="font-size:16px;font-weight:900;color:#003d6b;margin-bottom:8px;padding-bottom:4px;border-bottom:3px solid #dba51f;">' + c.name + '</h3><div style="display:flex;gap:20px;margin-bottom:12px"><div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:6px;padding:8px 16px;text-align:center"><div style="font-size:22px;font-weight:900;color:#1080ad">' + c.total + '</div><div style="font-size:8px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px">Total Attendees</div></div><div style="background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:8px 16px;text-align:center"><div style="font-size:22px;font-weight:900;color:#f59e0b">' + c.sessions + '</div><div style="font-size:8px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px">Sessions</div></div><div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:8px 16px;text-align:center"><div style="font-size:22px;font-weight:900;color:#16a34a">' + c.avg + '</div><div style="font-size:8px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px">Avg / Session</div></div></div><table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr><th style="background:#003d6b;color:white;text-align:left;padding:8px 12px;font-size:9px;text-transform:uppercase;letter-spacing:1px">Date</th><th style="background:#003d6b;color:white;text-align:center;padding:8px 12px;font-size:9px;text-transform:uppercase;letter-spacing:1px">Count</th><th style="background:#003d6b;color:white;text-align:left;padding:8px 12px;font-size:9px;text-transform:uppercase;letter-spacing:1px">Attendees</th></tr></thead><tbody>' + dayRows + '</tbody></table></div>'; }).join(''); var totalAtt = classStats.reduce(function(s, c) { return s + c.total; }, 0); var totalSess = classStats.reduce(function(s, c) { return s + c.sessions; }, 0); var html = '<!DOCTYPE html><html><head><title>Class Attendance Report - ' + monthName + '</title><style>@page{margin:0.5in}@media print{body{margin:0;padding:20px}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}}body{font-family:Arial,sans-serif;color:#1e293b;margin:0;padding:30px;max-width:800px;margin:0 auto}</style></head><body><div style="background:#003d6b;padding:16px 28px;display:flex;justify-content:space-between;align-items:center;border-radius:8px 8px 0 0"><img src="' + LOGO_URL + '" style="height:32px" /><div style="text-align:right;color:white"><h1 style="font-size:20px;font-weight:900;margin:0">Class Attendance Report</h1><div style="font-size:10px;color:#8bb8d9;letter-spacing:1px;margin-top:2px">' + centerName + ' · ' + monthName + '</div></div></div><div style="height:3px;background:linear-gradient(to right,#dba51f,#dd6d22);margin-bottom:24px"></div><div style="display:flex;gap:16px;margin-bottom:24px"><div style="flex:1;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;border-left:4px solid #1080ad"><div style="font-size:28px;font-weight:900;color:#1080ad">' + totalAtt + '</div><div style="font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1.5px">Total Class Attendees</div></div><div style="flex:1;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;border-left:4px solid #f59e0b"><div style="font-size:28px;font-weight:900;color:#f59e0b">' + totalSess + '</div><div style="font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1.5px">Total Sessions</div></div><div style="flex:1;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;border-left:4px solid #16a34a"><div style="font-size:28px;font-weight:900;color:#16a34a">' + classStats.length + '</div><div style="font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1.5px">Active Classes</div></div></div>' + classBlocks + '<div style="margin-top:24px;padding-top:12px;border-top:2px solid #003d6b;font-size:11px;color:#94a3b8;display:flex;justify-content:space-between"><span>Prepared by Patterson Health Center · Wellness Hub</span><span>' + new Date().toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'}) + '</span></div></body></html>'; var w = window.open('', '_blank'); w.document.write(html); w.document.close(); setTimeout(function() { w.print(); }, 500); }} className="bg-[#f59e0b] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 hover:bg-amber-600 transition-colors"><Printer size={16}/> Class Report</button><div className="bg-white px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 shadow-sm">{selectedClassDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div></div></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {displayedClasses.map((c, i) => {
                  var classRosterKey = c.name + '_' + c.center + '_' + selectedClassDate.toISOString().split('T')[0]; var classRoster = savedClassRosters[classRosterKey]; var classVisitsFromRoster = classRoster ? classRoster.attendees.map(function(a) { return { name: a.name, time: a.time, type: a.type, center: c.center === 'anthony' ? 'Anthony' : 'Harper', method: 'Class: ' + c.name }; }) : []; var classVisitsFromVisits = filteredVisits.filter(function(v) { return new Date(v.time).toDateString() === todayStr && v.method === 'Class: ' + c.name; }); var classVisits = classVisitsFromRoster.length >= classVisitsFromVisits.length ? classVisitsFromRoster : classVisitsFromVisits;
                  return (
                    <div key={i} className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-t-4 ${c.color} flex flex-col justify-between`}>
                      <div>
                        <div className="flex justify-between items-start mb-4"><div><h3 className="font-black text-[#001f3f] text-lg leading-tight">{c.name}</h3><p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{c.center === 'anthony' ? 'Anthony Center' : 'Harper Center'}</p><p className="text-sm font-medium text-slate-500 mt-1">{c.days}</p></div><span className="bg-slate-50 text-slate-600 px-3 py-1 rounded-lg text-xs font-black whitespace-nowrap">{c.time}</span></div>
                        {classVisits.length > 0 && (<div className="mt-4 bg-slate-50 rounded-xl p-3 border border-slate-100"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Current Roster</p><div className="flex flex-wrap gap-1.5">{classVisits.slice(0, 6).map((v, idx) => (<span key={idx} className="bg-white border border-slate-200 text-slate-700 text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">{v.name.split(' ')[0]} {v.name.split(' ')[1] ? v.name.split(' ')[1].charAt(0) + '.' : ''}</span>))}{classVisits.length > 6 && (<span className="bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">+{classVisits.length - 6} more</span>)}</div></div>)}
                      </div>
                      <div className="flex justify-between items-end mt-6"><div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Attendees</p><p className="text-3xl font-black text-[#1080ad] leading-none">{classVisits.length}</p></div>{isViewingToday ? (<button onClick={() => setActiveClass(c)} className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-5 py-3 rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center justify-center gap-2"><Users size={16} /> Manage Roster</button>) : (<span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{classVisits.length > 0 ? classVisits.length + ' attended' : 'No attendance'}</span>)}</div>
                      {classVisits.length > 0 && (() => { var notCheckedIn = classVisits.filter(function(cv) { return !filteredVisits.some(function(v) { return v.name === cv.name && new Date(v.time).toDateString() === todayStr && v.method !== 'Class: ' + c.name; }); }); if (notCheckedIn.length === 0) return null; return (<div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3"><p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2"><AlertCircle size={12} className="inline mr-1" />{notCheckedIn.length} attendee{notCheckedIn.length !== 1 ? 's' : ''} not checked in at front desk</p><div className="space-y-1.5">{notCheckedIn.map(function(cv, idx) { var mem = members.find(function(m) { return (m.firstName + ' ' + m.lastName) === cv.name; }); return (<div key={idx} className="flex justify-between items-center bg-white p-2 rounded-lg border border-amber-100"><span className="text-xs font-bold text-slate-700">{cv.name}</span><button onClick={function() { if (!mem) { showToast('Member not found.', 'error', 3000); return; } var scanCenter = c.center === 'anthony' ? 'Anthony' : 'Harper'; processCheckIn(mem.id, 'Class Roster Check-In'); }} className="bg-amber-500 text-white px-3 py-1 rounded-lg text-[10px] font-bold hover:bg-amber-600 transition-colors">Check In</button></div>); })}</div></div>); })()}
                    </div>
                  );
                })}
              </div>
              {Object.keys(savedClassRosters).length > 0 && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mt-6">
                  <h3 className="text-lg font-bold text-[#001f3f] mb-4 flex items-center gap-2"><FileText size={18} className="text-[#f59e0b]"/> Saved Class Rosters</h3>
                  <div className="space-y-3">{Object.entries(savedClassRosters).sort(function(a, b) { return b[0].localeCompare(a[0]); }).slice(0, 14).map(function(entry) { var key = entry[0]; var roster = entry[1]; return (<div key={key} className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100"><div><p className="font-bold text-[#001f3f]">{roster.className}</p><p className="text-[11px] text-slate-400 font-bold uppercase">{roster.center === 'anthony' ? 'Anthony' : 'Harper'} Center · {new Date(roster.date + 'T00:00:00').toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric'})} · {roster.attendees.length} attendee{roster.attendees.length !== 1 ? 's' : ''}</p></div><div className="flex items-center gap-2"><button onClick={function() { var csv = ['Name,Type,Time', ...roster.attendees.map(function(a) { return '"' + a.name + '","' + a.type + '","' + new Date(a.time).toLocaleTimeString() + '"';})].join('\n'); var b = new Blob([csv], {type: 'text/csv'}); var u = window.URL.createObjectURL(b); var a = document.createElement('a'); a.href = u; a.download = roster.className.replace(/\s+/g, '_') + '_' + roster.date + '.csv'; a.click(); window.URL.revokeObjectURL(u); }} className="bg-[#1080ad] text-white px-3 py-2 rounded-lg text-[10px] font-bold hover:bg-blue-700 transition-colors flex items-center gap-1"><Download size={12}/> CSV</button><button onClick={function() { if (window.confirm('Delete this roster?')) { if (roster.airtableId) { fetch('/api/delete-class-roster', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rosterId: roster.airtableId }) }).catch(function() {}); } setSavedClassRosters(function(prev) { var updated = Object.assign({}, prev); delete updated[key]; return updated; }); } }} className="text-slate-300 hover:text-red-500 transition-colors p-1"><X size={14}/></button></div></div>); })}</div>
                  {Object.keys(savedClassRosters).length > 14 && <p className="text-xs text-slate-400 text-center mt-3 font-bold">Showing last 14 rosters</p>}
                </div>
              )}
              
              {activeClass && (() => {
                var activeRosterKey = activeClass.name + '_' + activeClass.center + '_' + checkinDate; var activeRoster = savedClassRosters[activeRosterKey]; var classVisitsFromRoster = activeRoster ? activeRoster.attendees.map(function(a) { return { name: a.name, time: a.time, type: a.type, center: activeClass.center === 'anthony' ? 'Anthony' : 'Harper', method: 'Class: ' + activeClass.name }; }) : []; var classVisitsFromVisits = filteredVisits.filter(function(v) { return new Date(v.time).toDateString() === new Date(checkinDate + 'T00:00:00').toDateString() && v.method === 'Class: ' + activeClass.name; }); var classVisits = classVisitsFromRoster.length >= classVisitsFromVisits.length ? classVisitsFromRoster : classVisitsFromVisits;
                return (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001f3f]/90 backdrop-blur-md">
                    <div className="bg-white rounded-3xl w-full max-w-4xl p-10 relative shadow-2xl flex flex-col md:flex-row gap-8">
                      <button onClick={function() { var todayKey = activeClass.name + '_' + activeClass.center + '_' + checkinDate; var roster = savedClassRosters[todayKey]; if (roster && roster.attendees.length > 0) { fetch('/api/save-class-roster', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ className: roster.className, center: roster.center, date: roster.date, attendees: roster.attendees, createdBy: user ? user.name : 'Director' }) }).then(function(res) { return res.json(); }).then(function(result) { if (result.success && result.rosterId) { setSavedClassRosters(function(prev) { var updated = Object.assign({}, prev); if (updated[todayKey]) { updated[todayKey] = Object.assign({}, updated[todayKey], { airtableId: result.rosterId }); } return updated; }); } }).catch(function() {}); } setActiveClass(null); setKioskInput(''); }} className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-all z-10"><X size={24}/></button>                       <button onClick={function() { var todayKey = activeClass.name + '_' + activeClass.center + '_' + checkinDate; var roster = savedClassRosters[todayKey]; if (!roster || roster.attendees.length === 0) { alert('No attendees logged for this class today.'); return; } var csv = ['Name,Type,Time', ...roster.attendees.map(function(a) { return '"' + a.name + '","' + a.type + '","' + new Date(a.time).toLocaleTimeString() + '"'; })].join('\n'); var b = new Blob([csv], {type: 'text/csv'}); var u = window.URL.createObjectURL(b); var a = document.createElement('a'); a.href = u; a.download = activeClass.name.replace(/\s+/g, '_') + '_' + new Date().toISOString().split('T')[0] + '.csv'; a.click(); window.URL.revokeObjectURL(u); }} className="absolute top-6 right-20 bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 z-10"><Download size={14}/> Export</button>
                      <div className="flex-1 relative">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 inline-block">Live Class Scanner</span>
                        <h2 className="text-4xl font-black text-[#001f3f] leading-tight mb-2">{activeClass.name}</h2>
                        <p className="text-slate-500 font-medium mb-12 flex items-center gap-2"><Clock size={16}/> {activeClass.time} • {activeClass.center === 'anthony' ? 'Anthony Wellness Center' : 'Harper Wellness Center'}</p>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Scan Badge or Type Name</label>
                        <div className="flex gap-3">
                          <input autoFocus className="flex-1 p-5 border-2 border-slate-200 rounded-2xl outline-none focus:border-[#1080ad] text-2xl bg-slate-50" placeholder="e.g. Smith" value={kioskInput} onChange={(e) => setKioskInput(e.target.value)}onKeyDown={(e) => { if (e.key === 'Enter') { var foundMember = members.find(function(mem) { return mem.id === kioskInput.toUpperCase().trim() || (mem.firstName + ' ' + mem.lastName).toLowerCase().includes(kioskInput.toLowerCase()); }); if (foundMember) { var rosterTime2 = new Date().toISOString(); var rosterKey2 = activeClass.name + '_' + activeClass.center + '_' + checkinDate; setSavedClassRosters(function(prev) { var existing = prev[rosterKey2] || { className: activeClass.name, center: activeClass.center, date: checkinDate, attendees: [] }; existing.attendees.push({ name: foundMember.firstName + ' ' + foundMember.lastName, time: rosterTime2, type: foundMember.type }); var updated = Object.assign({}, prev); updated[rosterKey2] = existing; return updated; }); setKioskMessage({ text: foundMember.firstName + ' added to class!', type: 'success', subtext: '' }); setTimeout(function() { setKioskMessage({ text: '', type: '', subtext: '' }); }, 3000); } else { setKioskMessage({ text: 'Member not found', type: 'error', subtext: 'Try searching by name.' }); setTimeout(function() { setKioskMessage({ text: '', type: '', subtext: '' }); }, 3000); } setKioskInput(''); } }} />
                          <button onClick={() => { var foundMem = members.find(function(mem) { return mem.id === kioskInput.toUpperCase().trim() || (mem.firstName + ' ' + mem.lastName).toLowerCase().includes(kioskInput.toLowerCase()); }); if (foundMem) { var rosterTime3 = new Date().toISOString(); var rosterKey3 = activeClass.name + '_' + activeClass.center + '_' + checkinDate; setSavedClassRosters(function(prev) { var existing = prev[rosterKey3] || { className: activeClass.name, center: activeClass.center, date: checkinDate, attendees: [] }; existing.attendees.push({ name: foundMem.firstName + ' ' + foundMem.lastName, time: rosterTime3, type: foundMem.type }); var updated = Object.assign({}, prev); updated[rosterKey3] = existing; return updated; }); setKioskMessage({ text: foundMem.firstName + ' added to class!', type: 'success', subtext: '' }); setTimeout(function() { setKioskMessage({ text: '', type: '', subtext: '' }); }, 3000); } else { setKioskMessage({ text: 'Member not found', type: 'error', subtext: 'Try searching by name.' }); setTimeout(function() { setKioskMessage({ text: '', type: '', subtext: '' }); }, 3000); } setKioskInput(''); }}className="bg-[#001f3f] text-white px-8 rounded-2xl font-bold text-xl hover:bg-blue-900 transition-colors shadow-lg">Check In</button>
                        </div>
                        {kioskMatches.length > 0 && (<div className="absolute top-[80%] left-0 right-0 mt-2 bg-white border-2 border-[#1080ad] rounded-2xl shadow-2xl z-50 overflow-hidden text-left">{kioskMatches.map(m => (<button key={m._type + (m.airtableId || m.id)} onClick={() => { var rosterTime = new Date().toISOString(); var rosterKey = activeClass.name + '_' + activeClass.center + '_' + new Date().toISOString().split('T')[0]; setSavedClassRosters(function(prev) { var existing = prev[rosterKey] || { className: activeClass.name, center: activeClass.center, date: new Date().toISOString().split('T')[0], attendees: [] }; existing.attendees.push({ name: m.firstName + ' ' + m.lastName, time: rosterTime, type: m.type || 'VISITOR' }); var updated = Object.assign({}, prev); updated[rosterKey] = existing; return updated; }); setKioskMessage({ text: m.firstName + ' added to class!', type: 'success', subtext: '' }); setTimeout(function() { setKioskMessage({ text: '', type: '', subtext: '' }); }, 3000); setKioskInput(''); }}className="w-full p-4 border-b border-slate-100 hover:bg-blue-50 transition-colors flex justify-between items-center group"><div><p className="font-bold text-[#001f3f] text-lg">{m.firstName} {m.lastName}</p></div><div className="bg-[#1080ad] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md group-hover:scale-105 transition-transform">Check In</div></button>))}</div>)}
                        {kioskMessage.text && (<div className={`mt-6 p-4 rounded-xl text-center font-bold text-lg ${kioskMessage.type==='success'?'bg-green-100 text-green-700':kioskMessage.type==='warning'?'bg-yellow-100 text-yellow-700':'bg-red-100 text-red-700'}`}>{kioskMessage.text}{kioskMessage.subtext && <p className="text-sm mt-1">{kioskMessage.subtext}</p>}</div>)}
                      </div>
                      <div className="w-full md:w-80 bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col h-[400px]">
                        <div className="flex justify-between items-center mb-4"><h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Activity size={14}/> Live Roster</h3><span className="bg-[#1080ad] text-white px-2 py-1 rounded font-bold text-xs">{classVisits.length}</span></div>
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2">{classVisits.length === 0 ? (<p className="text-slate-400 italic text-sm text-center mt-10">Waiting for class check-ins...</p>) : (classVisits.map((v, i) => (<div key={i} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm transition-all duration-300 flex justify-between items-center"><div><p className="font-bold text-slate-800 text-sm">{v.name}</p><p className="text-[10px] font-bold text-[#f59e0b] uppercase mt-1">{new Date(v.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • Checked In</p></div><button onClick={() => { if (window.confirm(`Remove ${v.name} from this class?`)) { setVisits(prev => prev.filter((visit, idx) => !(visit.name === v.name && visit.time === v.time && visit.method === `Class: ${activeClass.name}`))); } }} className="text-slate-300 hover:text-red-500 transition-colors p-1 shrink-0" title="Remove from class"><X size={14}/></button></div>)))}</div>
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
              <tbody className="text-sm">{visitors.length === 0 ? (<tr><td colSpan="7" className="text-center py-12 text-slate-400 font-medium italic">No visitors yet.</td></tr>) : visitors.map(v => { const expired = new Date(v.expirationDate + 'T23:59:59') < new Date(); return (<tr key={v.airtableId} className="border-b hover:bg-slate-50/80"><td className="px-6 py-4"><p className="font-bold text-slate-800 cursor-pointer hover:text-[#1080ad]" onClick={() => setSelectedVisitor(v)}>{v.firstName} {v.lastName}</p><p className="text-[11px] text-slate-400">{v.email || v.phone || 'No contact info'}{!v.orientationComplete && <span className="ml-2 px-2 py-0.5 rounded text-[9px] font-black bg-blue-100 text-blue-700 uppercase">Needs Orientation</span>}</p></td><td className="px-4 py-4"><span className={`px-3 py-1 rounded-full text-[10px] font-black ${v.passType === 'Day Pass' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>{v.passType}</span></td><td className="px-4 py-4 text-slate-600 text-xs">{v.referringProvider || '—'}</td><td className="px-4 py-4 text-xs"><span className={expired ? 'text-red-500 font-bold' : 'text-slate-600'}>{v.expirationDate ? new Date(v.expirationDate + 'T00:00:00').toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'}) : 'N/A'}</span></td><td className="px-4 py-4"><span className={`px-3 py-1 rounded-full text-[10px] font-black ${expired ? 'bg-red-100 text-red-600' : !v.passActivated ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>{expired ? 'EXPIRED' : !v.passActivated ? 'PENDING' : 'ACTIVE'}</span></td><td className="px-4 py-4 font-black text-[#1080ad]">{v.totalVisits}{v.passesRemaining !== null && v.passesRemaining !== undefined && <span className={"ml-2 px-2 py-0.5 rounded-full text-[9px] font-black " + (v.passesRemaining <= 1 ? "bg-red-100 text-red-600" : v.passesRemaining <= 3 ? "bg-amber-100 text-amber-600" : "bg-green-100 text-green-600")}>{v.passesRemaining} left</span>}</td><td className="px-4 py-4 flex gap-2">
                {!v.passActivated && (<button onClick={async () => { if (!window.confirm(`Activate pass for ${v.firstName} ${v.lastName}?`)) return; try { const res = await fetch('/api/update-visitor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ visitorAirtableId: v.airtableId, passActivated: true }) }); const result = await res.json(); if (result.success) { setVisitors(prev => prev.map(vis => vis.airtableId === v.airtableId ? {...vis, passActivated: true} : vis)); } else { alert('Error: ' + result.error); } } catch (err) { alert('Network error.'); } }} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-[10px] font-bold hover:bg-green-700 transition-colors" title="Activate this pass">Activate</button>)}
                {!v.orientationComplete && (<button onClick={async () => { try { const res = await fetch('/api/update-visitor-orientation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ visitorAirtableId: v.airtableId }) }); const result = await res.json(); if (result.success) { setVisitors(prev => prev.map(vis => vis.airtableId === v.airtableId ? {...vis, orientationComplete: true} : vis)); } else { alert('Error: ' + result.error); } } catch (err) { alert('Network error.'); } }} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold hover:bg-blue-700 transition-colors" title="Mark Orientation Complete">Orient</button>)}
                <button onClick={() => setEditingVisitor(v)} className="px-3 py-1.5 bg-slate-500 text-white rounded-lg text-[10px] font-bold hover:bg-slate-600 transition-colors" title="Edit Visitor">Edit</button>
                <div className="relative">
                  <button onClick={() => setRenewMenuOpen(renewMenuOpen === v.airtableId ? null : v.airtableId)} className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-[10px] font-bold hover:bg-purple-700 transition-colors">Renew Pass</button>
                  {renewMenuOpen === v.airtableId && (<>
                    <div className="fixed inset-0 z-40" onClick={() => setRenewMenuOpen(null)}></div>
                    <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 shadow-xl rounded-xl z-50 overflow-hidden w-40">
                      <button onClick={() => { handleRenewVisitor(v, 'Day Pass'); setRenewMenuOpen(null); }} className="w-full text-left px-4 py-2 text-[10px] font-bold text-slate-600 hover:bg-slate-50 border-b border-slate-100">Day Pass ($5)</button>                       <button onClick={() => { var numPasses = prompt('How many prepaid passes?', '8'); if (!numPasses) return; handleRenewVisitor(v, 'Prepaid Passes'); setRenewMenuOpen(null); }} className="w-full text-left px-4 py-2 text-[10px] font-bold text-slate-600 hover:bg-slate-50 border-b border-slate-100">Prepaid Passes</button>
                      <button onClick={() => { handleRenewVisitor(v, '2-Week Courtesy'); setRenewMenuOpen(null); }} className="w-full text-left px-4 py-2 text-[10px] font-bold text-slate-600 hover:bg-slate-50 border-b border-slate-100">2-Week Courtesy</button>
                      <button onClick={() => { handleRenewVisitor(v, 'Month Courtesy'); setRenewMenuOpen(null); }} className="w-full text-left px-4 py-2 text-[10px] font-bold text-slate-600 hover:bg-slate-50">Month Courtesy</button>
                    </div>
                  </>)}
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
                 const corpMembers = members.filter(mem => mem.sponsorName === corp.sponsorMatch);
                 let totalOwed = 0; let totalPeriodVisits = 0;
                 var famPrimary = {}; corpMembers.forEach(function(cm) { if (cm.familyName) { if (!famPrimary[cm.familyName]) { famPrimary[cm.familyName] = cm.airtableId; } else { var existing = corpMembers.find(function(x) { return x.airtableId === famPrimary[cm.familyName]; }); if (existing && existing.type.includes('FAMILY') && !cm.type.includes('FAMILY')) { } else if (!existing || (cm.monthlyRate && !existing.monthlyRate) || (parseFloat(String(cm.monthlyRate).replace(/[^0-9.]/g, '')) > parseFloat(String(existing.monthlyRate).replace(/[^0-9.]/g, '')))) { famPrimary[cm.familyName] = cm.airtableId; } } } }); const enrichedMembers = corpMembers.map(mem => { const memVisits = currentPeriodVisits.filter(v => v.name.toLowerCase() === `${mem.firstName} ${mem.lastName}`.toLowerCase()); totalPeriodVisits += memVisits.length; var rawRate = parseFloat(String(mem.monthlyRate).replace(/[^0-9.]/g, '')) || 0; var isDependent = mem.familyName && famPrimary[mem.familyName] && famPrimary[mem.familyName] !== mem.airtableId; var rate = isDependent ? 0 : rawRate; let memberOwed = 0; let activeMonthsCount = 0; if (isUsageBased) { targetMonths.forEach(mIdx => { const visitedInMonth = memVisits.some(v => new Date(v.time).getMonth() === mIdx); if (visitedInMonth) { memberOwed += rate; activeMonthsCount++; } }); } else { if (mem.status === 'ACTIVE') { memberOwed = rate * targetMonths.length; activeMonthsCount = targetMonths.length; } } totalOwed += memberOwed; return { ...mem, periodVisits: memVisits.length, memberOwed, activeMonthsCount }; });
                 const activeMembersCount = enrichedMembers.filter(m => m.memberOwed > 0 || m.status === 'ACTIVE').length;
                 const paidMatch = corp.paidMonths ? corp.paidMonths.split(',').find(str => str.startsWith(reportMonth)) : null;
                 const isPaid = !!paidMatch;
                 const corpPayMethod = paidMatch && paidMatch.includes(':') ? paidMatch.split(':')[1] : '';
                 const togglePayment = async () => { if (isPaid) { let newPaidMonths = corp.paidMonths || ''; newPaidMonths = newPaidMonths.split(',').filter(mn => !mn.startsWith(reportMonth)).join(','); setCorporatePartners(prev => prev.map(c => c.id === corp.id ? { ...c, paidMonths: newPaidMonths } : c)); try { await fetch('/api/update-corporate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ recordId: corp.id, paidMonths: newPaidMonths }) }); } catch (err) { alert('Failed to sync payment status to Airtable.'); } } else { setCorpPaymentModal({ ...corp, reportMonth, displayPeriod }); } };
                 const downloadCSV = () => { if (corpMembers.length === 0) { alert('No employees enrolled for this partner.'); return; } const headers = ["Employee Name", "Member ID", "Plan Type", "Period Visits", "Months Billed", "Total Billed"]; const rows = enrichedMembers.map(mem => `"${mem.firstName} ${mem.lastName}","${mem.id}","${mem.type}","${mem.periodVisits}","${mem.activeMonthsCount}","$${mem.memberOwed.toFixed(2)}"`); rows.push(`"","","","","",""`); rows.push(`"","","","","TOTAL DUE:","$${totalOwed.toFixed(2)}"`); const csv = [headers.join(','), ...rows].join('\n'); const b = new Blob([csv],{type:'text/csv'}); const u = window.URL.createObjectURL(b); const a = document.createElement('a'); a.href=u; a.download=`${corp.name.replace(/\s+/g, '_')}_Invoice_${reportMonth}.csv`; a.click(); window.URL.revokeObjectURL(u); };
                 const printInvoiceForCenter = (targetCenter) => { if (corpMembers.length === 0) { alert('No employees enrolled for this partner.'); return; } const isHarper = targetCenter === 'harper'; const centerName = isHarper ? 'Harper Wellness Center' : 'Anthony Wellness Center'; const centerAddr = isHarper ? '615 W 12th St, Harper, KS 67058' : '309 W Main St, Anthony, KS 67003'; const centerPhone = isHarper ? '(620) 896-1202' : '(620) 842-5190'; const directorName = isHarper ? 'Patrick Johnson' : 'Deanna Smithhisler'; const splitCorps = ['Harper Industries', 'USD 361', 'Harper County'];                      const isSplitCorp = splitCorps.some(sc => corp.name.toLowerCase().includes(sc.toLowerCase()) || corp.sponsorMatch.toLowerCase().includes(sc.toLowerCase()));                      const buildRow = (mem) => `<tr><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${mem.firstName} ${mem.lastName}</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-family: monospace; color: #64748b;">${mem.id}</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${mem.type}</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: bold; color: ${mem.periodVisits > 0 ? '#1080ad' : '#94a3b8'};">${mem.periodVisits}</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${mem.activeMonthsCount}</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: ${mem.memberOwed > 0 ? '#16a34a' : '#94a3b8'};">$${mem.memberOwed.toFixed(2)}</td></tr>`;                      let rows = '';                      if (isSplitCorp) {                        const anthonyMems = enrichedMembers.filter(em => em.center && em.center.toLowerCase().includes('anthony'));                        const harperMems = enrichedMembers.filter(em => em.center && em.center.toLowerCase().includes('harper'));                        if (anthonyMems.length > 0) { rows += `<tr><td colspan="6" style="padding: 12px 10px 6px; font-weight: 900; color: #1080ad; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #1080ad; background: #f0f9ff;">Anthony Wellness Center (${anthonyMems.length})</td></tr>` + anthonyMems.map(buildRow).join('') + `<tr><td colspan="5" style="padding: 8px 10px; text-align: right; font-weight: 700; color: #64748b; font-size: 11px;">Anthony Subtotal:</td><td style="padding: 8px 10px; text-align: right; font-weight: 900; color: #1080ad;">$${anthonyMems.reduce((s,m) => s + m.memberOwed, 0).toFixed(2)}</td></tr>`; }                        if (harperMems.length > 0) { rows += `<tr><td colspan="6" style="padding: 12px 10px 6px; font-weight: 900; color: #dd6d22; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #dd6d22; background: #fff7ed;">Harper Wellness Center (${harperMems.length})</td></tr>` + harperMems.map(buildRow).join('') + `<tr><td colspan="5" style="padding: 8px 10px; text-align: right; font-weight: 700; color: #64748b; font-size: 11px;">Harper Subtotal:</td><td style="padding: 8px 10px; text-align: right; font-weight: 900; color: #dd6d22;">$${harperMems.reduce((s,m) => s + m.memberOwed, 0).toFixed(2)}</td></tr>`; }                      } else {                        rows = enrichedMembers.map(buildRow).join('');                      } const addressBlock = corp.address ? `${corp.address}<br/>${corp.city}, ${corp.state} ${corp.zip}` : 'Address not on file'; const html = `<!DOCTYPE html><html><head><title>Corporate Invoice - ${corp.name} - ${displayPeriod}</title><style>@media print{body{margin:0}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}}body{font-family:Arial,sans-serif;color:#1e293b;margin:0;padding:40px}.hdr{background:#003d6b;padding:20px 44px;display:flex;justify-content:space-between;align-items:center;border-radius:8px 8px 0 0}.hdr-logo{height:40px}.hdr-text{text-align:right;color:white}.hdr-title{font-size:24px;font-weight:900;margin:0}.hdr-sub{font-size:12px;color:#8bb8d9;margin-top:4px;line-height:1.4}.accent{height:4px;background:linear-gradient(to right,#dba51f,#dd6d22);margin-bottom:40px}.bill-to{margin-bottom:30px}.bill-to h2{margin:0 0 5px 0;font-size:14px;color:#64748b;text-transform:uppercase;letter-spacing:1px}.bill-to p{margin:0;font-size:18px;font-weight:900;color:#003d6b}.summary{display:flex;gap:40px;margin-bottom:30px;background:#f8fafc;padding:20px;border-radius:8px;border:1px solid #e2e8f0}.sum-box{text-align:left}.sum-lbl{font-size:10px;font-weight:bold;color:#64748b;text-transform:uppercase;letter-spacing:1px}.sum-val{font-size:24px;font-weight:900;color:#003d6b;margin-top:5px}.sum-val.due{color:#16a34a}table{width:100%;border-collapse:collapse;margin-bottom:30px;font-size:12px}th{background:#003d6b;color:white;text-align:left;padding:12px 10px;font-size:10px;text-transform:uppercase;letter-spacing:1px}th.right{text-align:right}th.center{text-align:center}.total-row td{background:#fff;border-top:2px solid #003d6b;padding-top:20px;font-size:14px}.total-lbl{text-align:right;font-weight:900;color:#1e293b;text-transform:uppercase}.total-val{font-size:20px;font-weight:900;color:#16a34a;text-align:right}.sign{margin-top:40px;font-size:14px}.sign-name{font-weight:bold;color:#003d6b;margin-top:5px}.sign-title{color:#64748b;font-size:12px}</style></head><body><div class="hdr"><img src="${LOGO_URL}" class="hdr-logo" /><div class="hdr-text"><h1 class="hdr-title">Corporate Invoice</h1><div class="hdr-sub">${centerName}<br/>${centerAddr} | ${centerPhone}</div></div></div><div class="accent"></div><div class="bill-to"><h2>Billed To:</h2><p>${corp.name}</p><p style="font-size: 14px; font-weight: normal; color: #475569; margin-top: 4px;">Attn: ${corp.contactName || 'Benefits Administrator'}<br/>${addressBlock}</p></div><div class="summary"><div class="sum-box"><div class="sum-lbl">Billing Period</div><div class="sum-val" style="font-size: 18px;">${displayPeriod}</div></div><div class="sum-box"><div class="sum-lbl">${isUsageBased ? 'Active Employees' : 'Total Enrolled'}</div><div class="sum-val" style="font-size: 18px;">${activeMembersCount}</div></div><div class="sum-box"><div class="sum-lbl">Total Amount Due</div><div class="sum-val due" style="font-size: 18px;">$${totalOwed.toFixed(2)}</div></div></div><table><thead><tr><th>Employee Name</th><th>Member ID</th><th>Plan Type</th><th class="center">Period Visits</th><th class="center">Months Billed</th><th class="right">Amount Billed</th></tr></thead><tbody>${rows}</tbody><tfoot><tr class="total-row"><td colspan="5" class="total-lbl">Total Corporate Responsibility:</td><td class="total-val">$${totalOwed.toFixed(2)}</td></tr></tfoot></table><div style="background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:6px;padding:16px;margin-top:20px;font-size:11px;color:#475569;line-height:1.8"><strong style="color:#003d6b">Payment Instructions:</strong><br/>Make checks payable to <strong>Patterson Health Center</strong><br/>Mail to: <strong>Patterson Health Center</strong>, Attn: ${centerName}, 485 N. KS HWY 2, Anthony, KS 67003</div><div class="sign"><p>Thank you for partnering with Patterson Health Center to keep your team healthy!</p><div class="sign-name">${directorName}</div><div class="sign-title">Director, ${centerName}</div></div></body></html>`; const w = window.open('', '_blank'); w.document.write(html); w.document.close(); setTimeout(() => w.print(), 500); };
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
                             <div className="bg-slate-50 p-3 rounded-lg border border-slate-100"><span className="text
