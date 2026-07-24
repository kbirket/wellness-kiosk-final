'use client';
import { useState, useEffect } from 'react';

/*
  DirectorMobile — a phone-only view for Deanna & Patrick.
  Purpose-built for a thumb: one scrolling column, big tap targets, no tables.
  Covers four things: look up a member, today's blocked list, who's here, log a visit.

  It loads its own data (same API routes the main app uses) so it can run
  independently. Drop it in as app/mobile/page.jsx, or render it from your main
  page when the screen is phone-sized (see the note at the bottom of this file).
*/

const NAVY = '#001f3f';
const GOLD = '#dba51f';
const BLUE = '#1080ad';

// ---- Access codes (change these to whatever you want) ----
const CENTER_CODES = {
  anthony: '1234',   // <-- Anthony's code
  harper: '5678',    // <-- Harper's code
};

// Mirrors the app's getStoplight exactly so a member reads the same on phone and iPad.
function getStoplight(m) {
  if (!m || !m.nextPayment) return 'green';
  const comped = ['HD6', 'HD6 FAMILY', 'HCHF', 'MILITARY', 'MILITARY FAMILY', 'FIRST DAY FREE', 'LIFETIME', 'LIFETIME FAMILY'];
  if (comped.includes(m.type)) return 'green';
  if (m.inactive) return 'red';
  const due = new Date(m.nextPayment + 'T00:00:00');
  const today = new Date();
  const daysPastDue = Math.ceil((today - due) / (1000 * 60 * 60 * 24));
  const daysUntilDue = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  if (m.achAutoPay) return daysPastDue > 7 ? 'red' : 'green';
  if (daysPastDue > 2) return 'red';
  if (daysUntilDue <= 5) return 'yellow';
  return 'green';
}

const STOP = {
  green: { bg: '#dcfce7', fg: '#15803d', label: 'Good' },
  yellow: { bg: '#fef9c3', fg: '#a16207', label: 'Due Soon' },
  red: { bg: '#fee2e2', fg: '#b91c1c', label: 'Needs Attention' },
};

function fmtTime(t) {
  try { return new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
  catch { return ''; }
}
function fmtDay(t) {
  try { return new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }
  catch { return ''; }
}

export default function DirectorMobile() {
  const [authedCenter, setAuthedCenter] = useState(null); // which center's code was used
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');
  const [tab, setTab] = useState('lookup');
  const [center, setCenter] = useState('both'); // 'both' | 'anthony' | 'harper'

  const [members, setMembers] = useState([]);
  const [visits, setVisits] = useState([]);
  const [blocked, setBlocked] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [classes, setClasses] = useState([]);
  const [activeClass, setActiveClass] = useState(null);
  const [classSearch, setClassSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [openMember, setOpenMember] = useState(null);
  const [toast, setToast] = useState('');

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  async function loadAll() {
    setLoading(true);
    try {
      const [mRes, bRes, vRes, gRes, cRes] = await Promise.all([
        fetch('/api/members').then(r => r.json()).catch(() => ({})),
        fetch('/api/get-blocked-checkins').then(r => r.json()).catch(() => ({})),
        fetch('/api/get-visits').then(r => r.json()).catch(() => ({})),
        fetch('/api/get-visitors').then(r => r.json()).catch(() => ({})),
        fetch('/api/get-classes').then(r => r.json()).catch(() => ({})),
      ]);

      const mm = (mRes.records || []).map(r => ({
        airtableId: r.id,
        id: r.fields['Member ID'] || r.id,
        firstName: r.fields['First Name'] || 'Unknown',
        lastName: r.fields['Last Name'] || '',
        phone: r.fields['Phone'] || '',
        password: r.fields['PIN'] || '',
        status: (r.fields['Membership Status'] || 'ACTIVE').toUpperCase(),
        type: String(r.fields['Membership Type'] || r.fields['Plan'] || '').toUpperCase().trim(),
        center: r.fields['Home Center'] || 'Anthony',
        nextPayment: r.fields['Next Payment Due'] || null,
        achAutoPay: !!r.fields['Auto-Pay ACH'],
        access247: !!r.fields['24/7 Access'],
        inactive: (r.fields['Membership Status'] || '').toUpperCase() === 'INACTIVE',
      }));
      mm.sort((a, b) => (a.lastName || '').localeCompare(b.lastName || '') || (a.firstName || '').localeCompare(b.firstName || ''));
      setMembers(mm);

      setBlocked((bRes.records || []).map(r => ({
        airtableId: r.id,
        memberRecId: (Array.isArray(r.fields['Member']) ? r.fields['Member'][0] : r.fields['Member']) || '',
        memberName: r.fields['Member Name'] || 'Unknown',
        timestamp: r.fields['Timestamp'] || '',
        reason: r.fields['Reason'] || '',
        center: r.fields['Center'] || '',
        outcome: r.fields['Outcome'] || 'Pending',
      })));

      const vv = (vRes.records || []).map(r => {
        const linked = r.fields['Member'] || r.fields['Members'] || [];
        const linkId = Array.isArray(linked) ? linked[0] : linked;
        const fm = mm.find(m => m.airtableId === linkId);
        const fallback = Array.isArray(r.fields['Name']) ? r.fields['Name'][0] : (r.fields['Name'] || 'Unknown');
        return {
          name: fm ? (fm.firstName + ' ' + fm.lastName) : fallback,
          center: r.fields['Center'] || r.fields['Location'] || '',
          time: r.fields['Time'] || r.fields['Check-in Time'] || r.createdTime,
          method: r.fields['Method'] || r.fields['Check-in Method'] || '',
        };
      });
      vv.sort((a, b) => new Date(b.time) - new Date(a.time));
      setVisits(vv);

      setVisitors((gRes.records || []).map(r => ({
        airtableId: r.id,
        firstName: r.fields['First Name'] || '',
        lastName: r.fields['Last Name'] || '',
        passType: r.fields['Pass Type'] || 'Pass',
        center: r.fields['Center'] || '',
        passesRemaining: (r.fields['Passes Remaining'] === undefined || r.fields['Passes Remaining'] === null) ? null : Number(r.fields['Passes Remaining']),
        expirationDate: r.fields['Expiration Date'] || '',
      })));
      const today = new Date();
      const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][today.getDay()];
      const cc = (cRes.records || []).map(r => ({
        airtableId: r.id,
        name: r.fields['Name'] || 'Class',
        center: (r.fields['Center'] || 'Anthony').toLowerCase(),
        days: Array.isArray(r.fields['Days']) ? r.fields['Days'] : (r.fields['Days'] ? [r.fields['Days']] : []),
        time: r.fields['Start Time'] || '',
        instructor: r.fields['Instructor'] || '',
        archived: !!r.fields['Archived'],
      })).filter(c => !c.archived);
      setClasses(cc);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    try { const saved = sessionStorage.getItem('phcMobileCenter'); if (saved === 'anthony' || saved === 'harper') { setAuthedCenter(saved); setCenter(saved); } } catch (e) {}
  }, []);
  useEffect(() => { if (authedCenter) loadAll(); }, [authedCenter]);

  const inCenter = (c) => center === 'both' || (c || '').toLowerCase().includes(center);

  // ----- LOOKUP -----
  const matches = query.trim().length < 2 ? [] : members.filter(m => {
    const q = query.toLowerCase();
    return (m.firstName + ' ' + m.lastName).toLowerCase().includes(q) || String(m.id).toLowerCase().includes(q);
  }).slice(0, 25);

  async function resetPin(m) {
    const entered = window.prompt(`New 4-digit PIN for ${m.firstName} ${m.lastName}.\n\nType 4 digits, or leave blank for a random one:`, '');
    if (entered === null) return;
    const pin = entered.trim() === '' ? String(Math.floor(1000 + Math.random() * 9000)) : entered.trim();
    if (!/^[0-9]{4}$/.test(pin)) { alert('PIN must be exactly 4 digits.'); return; }
    if (pin === '0000' || pin === '1111') { alert('Please avoid 0000 or 1111.'); return; }
    try {
      const res = await fetch('/api/update-pin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ recordId: m.airtableId, newPin: pin }) });
      const result = await res.json().catch(() => ({}));
      if (res.ok && result.success !== false) {
        setMembers(prev => prev.map(x => x.airtableId === m.airtableId ? { ...x, password: pin } : x));
        setOpenMember(prev => prev && prev.airtableId === m.airtableId ? { ...prev, password: pin } : prev);
        flash(`${m.firstName}'s PIN is now ${pin}`);
      } else { alert('Could not update PIN: ' + (result.error || 'unknown error')); }
    } catch { alert('Network error updating PIN.'); }
  }

  // ----- BLOCKED (today, still pending) -----
  const todayStr = new Date().toDateString();
  const blockedToday = blocked.filter(b => {
    if (b.outcome !== 'Pending' || b.reason === 'Cooldown (2-hr)') return false;
    if (!inCenter(b.center)) return false;
    if (!b.timestamp) return false;
    const ts = String(b.timestamp);
    const d = (ts.length === 10 && ts.indexOf('T') === -1) ? new Date(ts + 'T00:00:00') : new Date(ts);
    return !isNaN(d.getTime()) && d.toDateString() === todayStr;
  }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // ----- WHO'S HERE (today's check-ins) -----
  const hereToday = visits.filter(v => {
    try { return new Date(v.time).toDateString() === todayStr && inCenter(v.center); }
    catch { return false; }
  });

  // ----- CLASSES (mark attendance from the room) -----
  const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()];
  const todaysClasses = classes
    .filter(c => inCenter(c.center) && (c.days || []).some(d => String(d).toLowerCase().startsWith(dayName.toLowerCase().slice(0,3))))
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  const rosterFor = (className) => visits.filter(v => v.method === 'Class: ' + className && (() => { try { return new Date(v.time).toDateString() === todayStr; } catch { return false; } })());

  async function markClassAttendee(m, cls) {
    const fullName = m.firstName + ' ' + m.lastName;
    const already = visits.find(v => v.name === fullName && v.method === 'Class: ' + cls.name && (() => { try { return new Date(v.time).toDateString() === todayStr; } catch { return false; } })());
    if (already) { flash(fullName + ' is already on the roster.'); return; }
    const centerLabel = cls.center === 'harper' ? 'Harper Wellness Center' : 'Anthony Wellness Center';
    try {
      const res = await fetch('/api/visits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ airtableId: m.airtableId, center: centerLabel, time: new Date().toISOString(), method: 'Class: ' + cls.name }) });
      const result = await res.json();
      if (result.success) {
        setVisits(prev => [{ name: fullName, center: centerLabel, time: new Date().toISOString(), method: 'Class: ' + cls.name }].concat(prev));
        flash(fullName + ' added to ' + cls.name + '.');
        setClassSearch('');
      } else alert('Could not add: ' + (result.error || 'unknown error'));
    } catch { alert('Network error.'); }
  }

  // ----- LOG A VISIT (members + visitors) -----
  const [logQuery, setLogQuery] = useState('');
  const logMatches = logQuery.trim().length < 2 ? [] : (() => {
    const q = logQuery.toLowerCase();
    const mem = members.filter(m => (m.firstName + ' ' + m.lastName).toLowerCase().includes(q)).slice(0, 12)
      .map(m => ({ kind: 'member', ...m }));
    const vis = visitors.filter(v => (v.firstName + ' ' + v.lastName).toLowerCase().includes(q)).slice(0, 12)
      .map(v => ({ kind: 'visitor', ...v }));
    return mem.concat(vis).slice(0, 20);
  })();

  async function logMemberVisit(m) {
    if (!window.confirm(`Log a visit for ${m.firstName} ${m.lastName} now?`)) return;
    const centerLabel = m.center;
    try {
      const res = await fetch('/api/visits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ airtableId: m.airtableId, center: centerLabel, time: new Date().toISOString(), method: 'Staff Entry' }) });
      const result = await res.json();
      if (result.success) { flash(`Visit logged for ${m.firstName}.`); setLogQuery(''); loadAll(); }
      else alert('Could not log visit: ' + (result.error || 'unknown error'));
    } catch { alert('Network error.'); }
  }

  async function logVisitorVisit(v) {
    const counts = v.passesRemaining !== null;
    if (counts && v.passesRemaining <= 0) { alert(`${v.firstName} has no passes left.`); return; }
    if (!window.confirm(`Log a visit for ${v.firstName} ${v.lastName}?${counts ? ` Uses one pass (${v.passesRemaining - 1} left).` : ''}`)) return;
    try {
      const res = await fetch('/api/visitor-checkin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ visitorAirtableId: v.airtableId, center: v.center, decrementPass: counts }) });
      const result = await res.json();
      if (result.success) { flash(`Visit logged for ${v.firstName}.`); setLogQuery(''); loadAll(); }
      else alert('Could not log visit: ' + (result.error || 'unknown error'));
    } catch { alert('Network error.'); }
  }

  // ---------- UI ----------
  const S = {
    page: { minHeight: '100vh', background: '#f5f6f8', fontFamily: 'system-ui, -apple-system, sans-serif', paddingBottom: 88 },
    header: { background: NAVY, color: '#fff', padding: '14px 16px', borderBottom: `4px solid ${GOLD}`, position: 'sticky', top: 0, zIndex: 20 },
    seg: { display: 'flex', gap: 6, marginTop: 10 },
    segBtn: (on) => ({ flex: 1, padding: '7px 0', borderRadius: 999, border: 'none', fontWeight: 800, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, background: on ? GOLD : 'rgba(255,255,255,0.12)', color: on ? NAVY : '#fff' }),
    body: { padding: 16 },
    input: { width: '100%', padding: '15px 16px', fontSize: 17, border: '2px solid #e2e8f0', borderRadius: 14, outline: 'none', boxSizing: 'border-box' },
    card: { background: '#fff', border: '1px solid #eef2f6', borderRadius: 16, padding: 16, marginBottom: 10, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' },
    pill: (bg, fg) => ({ background: bg, color: fg, fontWeight: 900, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, padding: '4px 9px', borderRadius: 8 }),
    bigBtn: { width: '100%', padding: '15px', borderRadius: 14, border: 'none', background: BLUE, color: '#fff', fontWeight: 800, fontSize: 16, marginTop: 10 },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #e2e8f0', display: 'flex', zIndex: 20 },
    navBtn: (on) => ({ flex: 1, padding: '12px 4px 16px', border: 'none', background: 'transparent', color: on ? BLUE : '#94a3b8', fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.3 }),
    muted: { color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '32px 0', fontSize: 14 },
  };

  // ---- passcode gate ----
  const tryCode = () => {
    const entered = codeInput.trim();
    const match = Object.keys(CENTER_CODES).find(k => CENTER_CODES[k] === entered);
    if (!match) { setCodeError('That code did not match. Try again.'); return; }
    try { sessionStorage.setItem('phcMobileCenter', match); } catch (e) {}
    setAuthedCenter(match); setCenter(match); setCodeError(''); setCodeInput('');
  };

  if (!authedCenter) {
    return (
      <div style={{ minHeight: '100vh', background: NAVY, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', marginBottom: 4 }}>Wellness Hub</div>
        <div style={{ fontSize: 14, color: '#8bb8d9', marginBottom: 28, fontWeight: 600 }}>Enter your center's code</div>
        <input value={codeInput} onChange={e => { setCodeInput(e.target.value); setCodeError(''); }} onKeyDown={e => { if (e.key === 'Enter') tryCode(); }} type="tel" inputMode="numeric" placeholder="Code" style={{ width: '100%', maxWidth: 260, textAlign: 'center', fontSize: 28, letterSpacing: 8, padding: '16px', border: 'none', borderRadius: 16, outline: 'none', fontWeight: 800, color: NAVY, boxSizing: 'border-box' }} autoFocus />
        {codeError && <div style={{ color: '#fca5a5', fontWeight: 700, fontSize: 13, marginTop: 14 }}>{codeError}</div>}
        <button onClick={tryCode} style={{ marginTop: 20, width: '100%', maxWidth: 260, padding: '15px', borderRadius: 14, border: 'none', background: GOLD, color: NAVY, fontWeight: 900, fontSize: 16 }}>Enter</button>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong style={{ fontSize: 18 }}>Wellness Hub</strong>
          <button onClick={loadAll} style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: 'none', borderRadius: 999, padding: '6px 14px', fontWeight: 800, fontSize: 12 }}>Refresh</button>
        </div>
        <div style={S.seg}>
          {['both', 'anthony', 'harper'].map(c => (
            <button key={c} onClick={() => setCenter(c)} style={S.segBtn(center === c)}>
              {c === 'both' ? 'Both' : c}
            </button>
          ))}
        </div>
      </div>

      {toast && <div style={{ position: 'fixed', top: 96, left: 16, right: 16, zIndex: 40, background: NAVY, color: '#fff', padding: '12px 16px', borderRadius: 12, fontWeight: 700, fontSize: 14, textAlign: 'center' }}>{toast}</div>}

      <div style={S.body}>
        {loading && <p style={S.muted}>Loading…</p>}

        {/* ---------- LOOKUP ---------- */}
        {!loading && tab === 'lookup' && (
          <>
            <input style={S.input} placeholder="Search name or member ID" value={query} onChange={e => setQuery(e.target.value)} autoFocus />
            <div style={{ height: 12 }} />
            {query.trim().length < 2 && <p style={S.muted}>Type a name to look someone up.</p>}
            {query.trim().length >= 2 && matches.length === 0 && <p style={S.muted}>No members found.</p>}
            {matches.map(m => {
              const s = STOP[getStoplight(m)];
              return (
                <div key={m.airtableId} style={S.card} onClick={() => setOpenMember(m)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 16, color: '#1e293b' }}>{m.firstName} {m.lastName}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>#{m.id} · {m.type}</div>
                    </div>
                    <span style={S.pill(s.bg, s.fg)}>{s.label}</span>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* ---------- BLOCKED ---------- */}
        {!loading && tab === 'blocked' && (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: NAVY, margin: '4px 0 14px' }}>Blocked Today</h2>
            {blockedToday.length === 0 && <p style={S.muted}>No one blocked today. 🎉</p>}
            {blockedToday.map(b => (
              <div key={b.airtableId} style={S.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: '#1e293b' }}>{b.memberName}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{fmtDay(b.timestamp)} · {fmtTime(b.timestamp)}</div>
                  </div>
                  <span style={S.pill(b.reason === 'Past Due Payment' ? '#fee2e2' : b.reason === 'Inactive Membership' ? '#e2e8f0' : '#fef3c7', b.reason === 'Past Due Payment' ? '#b91c1c' : b.reason === 'Inactive Membership' ? '#475569' : '#a16207')}>{b.reason}</span>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ---------- WHO'S HERE ---------- */}
        {!loading && tab === 'here' && (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: NAVY, margin: '4px 0 4px' }}>Who's Here</h2>
            <p style={{ color: '#94a3b8', fontSize: 13, margin: '0 0 14px' }}>{hereToday.length} checked in today</p>
            {hereToday.length === 0 && <p style={S.muted}>No check-ins yet today.</p>}
            {hereToday.map((v, i) => (
              <div key={i} style={S.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#1e293b' }}>{v.name}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700 }}>{fmtTime(v.time)}</div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ---------- CLASSES ---------- */}
        {!loading && tab === 'classes' && !activeClass && (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: NAVY, margin: '4px 0 4px' }}>Today\u2019s Classes</h2>
            <p style={{ color: '#94a3b8', fontSize: 13, margin: '0 0 14px' }}>{dayName}</p>
            {todaysClasses.length === 0 && <p style={S.muted}>No classes scheduled today at this center.</p>}
            {todaysClasses.map(c => {
              const n = rosterFor(c.name).length;
              return (
                <div key={c.airtableId} style={S.card} onClick={() => { setActiveClass(c); setClassSearch(''); }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 16, color: '#1e293b' }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{c.time}{c.instructor ? ' \u00b7 ' + c.instructor : ''}</div>
                    </div>
                    <span style={S.pill('#e0f2fe', '#0369a1')}>{n} here</span>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {!loading && tab === 'classes' && activeClass && (
          <>
            <button onClick={() => setActiveClass(null)} style={{ background: 'none', border: 'none', color: BLUE, fontWeight: 800, fontSize: 14, padding: '4px 0 10px' }}>\u2190 All classes</button>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: NAVY, margin: '0 0 2px' }}>{activeClass.name}</h2>
            <p style={{ color: '#94a3b8', fontSize: 13, margin: '0 0 14px' }}>{activeClass.time}{activeClass.instructor ? ' \u00b7 ' + activeClass.instructor : ''}</p>

            <input style={S.input} placeholder="Add member to class" value={classSearch} onChange={e => setClassSearch(e.target.value)} />
            <div style={{ height: 10 }} />
            {classSearch.trim().length >= 2 && members.filter(m => (m.firstName + ' ' + m.lastName).toLowerCase().includes(classSearch.toLowerCase())).slice(0, 10).map(m => (
              <div key={m.airtableId} style={{ ...S.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>{m.firstName} {m.lastName}</div>
                <button onClick={() => markClassAttendee(m, activeClass)} style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 16px', fontWeight: 800, fontSize: 14 }}>+ Add</button>
              </div>
            ))}

            <p style={{ fontSize: 11, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, margin: '18px 0 8px' }}>On the roster ({rosterFor(activeClass.name).length})</p>
            {rosterFor(activeClass.name).length === 0 ? (<p style={S.muted}>No one marked yet.</p>) : rosterFor(activeClass.name).map((v, i) => (
              <div key={i} style={{ ...S.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>{v.name}</div>
                <span style={{ color: '#22c55e', fontWeight: 900, fontSize: 18 }}>\u2713</span>
              </div>
            ))}
          </>
        )}

        {/* ---------- LOG VISIT ---------- */}
        {!loading && tab === 'log' && (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: NAVY, margin: '4px 0 14px' }}>Log a Visit</h2>
            <input style={S.input} placeholder="Search member or visitor" value={logQuery} onChange={e => setLogQuery(e.target.value)} />
            <div style={{ height: 12 }} />
            {logQuery.trim().length < 2 && <p style={S.muted}>Search someone to log their visit.</p>}
            {logMatches.map((p, i) => (
              <div key={i} style={S.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: '#1e293b' }}>{p.firstName} {p.lastName}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{p.kind === 'visitor' ? `Visitor · ${p.passType}` : p.type}</div>
                  </div>
                  <button onClick={() => p.kind === 'visitor' ? logVisitorVisit(p) : logMemberVisit(p)} style={{ background: BLUE, color: '#fff', border: 'none', borderRadius: 10, padding: '10px 14px', fontWeight: 800, fontSize: 13 }}>Log</button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* member detail sheet */}
      {openMember && (() => {
        const s = STOP[getStoplight(openMember)];
        return (
          <div onClick={() => setOpenMember(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'flex-end' }}>
            <div onClick={e => e.stopPropagation()} style={{ background: '#fff', width: '100%', borderRadius: '24px 24px 0 0', padding: 24, maxHeight: '82vh', overflowY: 'auto' }}>
              <div style={{ width: 40, height: 5, background: '#e2e8f0', borderRadius: 999, margin: '0 auto 18px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: NAVY }}>{openMember.firstName} {openMember.lastName}</div>
                  <div style={{ color: '#94a3b8', fontWeight: 600, fontSize: 13 }}>#{openMember.id} · {openMember.type}</div>
                </div>
                <span style={S.pill(s.bg, s.fg)}>{s.label}</span>
              </div>

              <div style={{ background: '#f8fafc', borderRadius: 16, padding: 18, margin: '18px 0', textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Kiosk PIN</div>
                <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: 6, color: BLUE }}>{openMember.password || '—'}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 8 }}>
                <div style={{ background: '#f8fafc', borderRadius: 12, padding: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase' }}>Center</div>
                  <div style={{ fontWeight: 700, color: '#334155' }}>{openMember.center}</div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 12, padding: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase' }}>Next Due</div>
                  <div style={{ fontWeight: 700, color: '#334155' }}>{openMember.nextPayment ? fmtDay(openMember.nextPayment + 'T00:00:00') : '—'}</div>
                </div>
              </div>

              {openMember.phone && <a href={`tel:${openMember.phone}`} style={{ ...S.bigBtn, display: 'block', textAlign: 'center', textDecoration: 'none', background: '#f1f5f9', color: NAVY }}>Call {openMember.phone}</a>}
              <button onClick={() => resetPin(openMember)} style={{ ...S.bigBtn, background: GOLD, color: NAVY }}>Change PIN</button>
              <button onClick={() => setOpenMember(null)} style={{ ...S.bigBtn, background: 'transparent', color: '#94a3b8' }}>Close</button>
            </div>
          </div>
        );
      })()}

      {/* bottom nav */}
      <div style={S.nav}>
        {[['lookup', 'Look Up'], ['here', "Who's Here"], ['classes', 'Classes'], ['log', 'Log Visit'], ['blocked', 'Blocked']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={S.navBtn(tab === id)}>{label}</button>
        ))}
      </div>
    </div>
  );
}
