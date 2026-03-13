// @ts-nocheck

'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

// ============================================================
// QR Code Generator
// ============================================================
const generateQRMatrix = (data) => {
  const size = 21;
  const matrix = Array(size)
    .fill(null)
    .map(() => Array(size).fill(false));
  const addFinder = (row, col) => {
    for (let r = 0; r < 7; r++)
      for (let c = 0; c < 7; c++)
        if (
          r === 0 ||
          r === 6 ||
          c === 0 ||
          c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        )
          if (row + r < size && col + c < size) matrix[row + r][col + c] = true;
  };
  addFinder(0, 0);
  addFinder(0, size - 7);
  addFinder(size - 7, 0);
  let hash = 0;
  for (let i = 0; i < data.length; i++)
    hash = ((hash << 5) - hash + data.charCodeAt(i)) | 0;
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (!matrix[r][c]) {
        const val = Math.abs((hash * (r * size + c + 1) * 7919) % 100);
        if (val < 45) matrix[r][c] = true;
      }
  return matrix;
};

const QRCode = ({ data, size = 160, darkColor = '#003d6b' }) => {
  const matrix = generateQRMatrix(data);
  const cellSize = size / matrix.length;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="#fff" rx="4" />
      {matrix.map((row, r) =>
        row.map((cell, c) =>
          cell ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize + 0.5}
              height={cellSize + 0.5}
              fill={darkColor}
            />
          ) : null
        )
      )}
    </svg>
  );
};

// ============================================================
// Data & Constants
// ============================================================
const LOGO_URL =
  'https://pattersonhc.org/sites/default/files/wellness_white.png';
const CENTERS = ['Harper', 'Anthony'];
const centerColors = { Harper: '#dba51f', Anthony: '#1080ad' };

const DIRECTORS = [
  {
    username: 'harper_director',
    password: 'harper2026',
    name: 'Director — Harper',
    center: 'Harper',
    role: 'director',
  },
  {
    username: 'anthony_director',
    password: 'anthony2026',
    name: 'Director — Anthony',
    center: 'Anthony',
    role: 'director',
  },
  {
    username: 'admin',
    password: 'admin2026',
    name: 'Administrator',
    center: 'all',
    role: 'admin',
  },
  {
    username: 'dev',
    password: 'dev2026!',
    name: 'Developer',
    center: 'all',
    role: 'dev',
  },
];

const typeLabels = {
  single: 'Single',
  family: 'Family',
  senior: 'Senior',
  senior_family: 'Senior Family',
  student: 'Student (14-22)',
  corporate: 'Corporate',
  corporate_family: 'Corp. Family',
  daypass: 'Day Pass',
};
const typeColors = {
  single: '#1080ad',
  family: '#003d6b',
  senior: '#16a34a',
  senior_family: '#059669',
  student: '#8b5cf6',
  corporate: '#dd6d22',
  corporate_family: '#c2410c',
  daypass: '#dba51f',
};
const billingLabels = {
  month_to_month: 'Month-to-Month',
  auto_draft: 'Auto-Draft',
  '6mo_prepay': '6-Mo Prepay',
  '12mo_prepay': '12-Mo Prepay',
  per_visit: 'Per Visit',
  sponsored: 'Sponsored',
};
const statusColors = {
  active: '#16a34a',
  overdue: '#dc2626',
  expiring: '#f59e0b',
  expired: '#6b7280',
};

const Icons = {
  dashboard: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  members: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  scan: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <line x1="7" y1="12" x2="17" y2="12" />
    </svg>
  ),
  notify: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  search: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  check: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  alert: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  plus: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  mail: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
  phone: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  clock: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  x: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  lock: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  logout: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  report: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
};

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};
const formatTime = (t) =>
  new Date(t).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

// ============================================================
// ENTRY SCREEN
// ============================================================
function EntryScreen({ onDirectorLogin, onKiosk }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'linear-gradient(145deg, #003d6b 0%, #00294a 60%, #001a30 100%)',
        fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: 520, padding: '0 24px' }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ marginBottom: 20 }}>
            <img
              src={LOGO_URL}
              alt="Wellness Centers"
              style={{ height: 80, objectFit: 'contain', opacity: 0.95 }}
            />
          </div>
          <h1
            style={{
              color: '#fff',
              fontSize: 28,
              fontWeight: 700,
              margin: '0 0 8px',
              letterSpacing: '-0.02em',
            }}
          >
            Wellness Hub
          </h1>
          <p
            style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: 0 }}
          >
            Harper & Anthony Wellness Centers
          </p>
        </div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <button
            onClick={onDirectorLogin}
            style={{
              flex: 1,
              maxWidth: 220,
              padding: '28px 20px',
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.06)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              color: '#fff',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
              e.currentTarget.style.borderColor = 'rgba(219,165,31,0.5)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'rgba(219,165,31,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {Icons.lock}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                Director Login
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.5)',
                  lineHeight: 1.4,
                }}
              >
                Full management dashboard with member tracking & notifications
              </div>
            </div>
          </button>
          <button
            onClick={onKiosk}
            style={{
              flex: 1,
              maxWidth: 220,
              padding: '28px 20px',
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.06)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              color: '#fff',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
              e.currentTarget.style.borderColor = 'rgba(16,128,173,0.5)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'rgba(16,128,173,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                iPad Badge-In
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.5)',
                  lineHeight: 1.4,
                }}
              >
                Member check-in kiosk — scan QR code or enter member ID
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// LOGIN SCREEN
// ============================================================
function LoginScreen({ onLogin, onBack }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const handleLogin = () => {
    const d = DIRECTORS.find(
      (d) => d.username === username && d.password === password
    );
    if (d) onLogin(d);
    else {
      setError('Invalid username or password');
      setTimeout(() => setError(''), 3000);
    }
  };
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'linear-gradient(145deg, #003d6b 0%, #00294a 60%, #001a30 100%)',
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      <div style={{ width: 380, padding: '0 24px' }}>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.5)',
            cursor: 'pointer',
            fontSize: 13,
            marginBottom: 24,
          }}
        >
          ← Back to menu
        </button>
        <div
          style={{
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 16,
            padding: '36px 32px',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <img
              src={LOGO_URL}
              alt="Wellness Centers"
              style={{
                height: 48,
                objectFit: 'contain',
                marginBottom: 16,
                opacity: 0.9,
              }}
            />
            <h2
              style={{
                color: '#fff',
                fontSize: 20,
                fontWeight: 700,
                margin: '0 0 4px',
              }}
            >
              Director Login
            </h2>
            <p
              style={{
                color: 'rgba(255,255,255,0.45)',
                fontSize: 13,
                margin: 0,
              }}
            >
              Sign in to manage your wellness center
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.6)',
                  marginBottom: 6,
                }}
              >
                Username
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="e.g. harper_director"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.06)',
                  color: '#fff',
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.6)',
                  marginBottom: 6,
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="Enter password"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.06)',
                    color: '#fff',
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255,255,255,0.4)',
                    cursor: 'pointer',
                    fontSize: 12,
                  }}
                >
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            {error && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: 'rgba(220,38,38,0.15)',
                  border: '1px solid rgba(220,38,38,0.3)',
                  color: '#fca5a5',
                  fontSize: 13,
                  textAlign: 'center',
                }}
              >
                {error}
              </div>
            )}
            <button
              onClick={handleLogin}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 8,
                border: 'none',
                background: '#dba51f',
                color: '#fff',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                marginTop: 4,
              }}
            >
              Sign In
            </button>
          </div>
          <div
            style={{
              marginTop: 20,
              padding: '14px 16px',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.35)',
                marginBottom: 8,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Demo Accounts
            </div>
            <div
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.5)',
                lineHeight: 1.8,
                fontFamily: 'monospace',
              }}
            >
              <div>harper_director / harper2026</div>
              <div>anthony_director / anthony2026</div>
              <div>
                admin / admin2026{' '}
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
                  (both centers)
                </span>
              </div>
              <div
                style={{
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  marginTop: 6,
                  paddingTop: 6,
                }}
              >
                dev / dev2026!{' '}
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
                  (developer)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// KIOSK MODE — iPad Badge-In
// ============================================================
function KioskMode({ members, setMembers, visits, setVisits, onExit }) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [kioskCenter, setKioskCenter] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current && !result) inputRef.current.focus();
  }, [result]);
  useEffect(() => {
    if (result) {
      const t = setTimeout(() => {
        setResult(null);
        setInput('');
      }, 5000);
      return () => clearTimeout(t);
    }
  }, [result]);

  const handleScan = () => {
    const id = input.toUpperCase().trim();
    if (!id) return;
    const member = members.find((m) => m.id === id);
    if (member) {
      const nv = {
        memberId: member.id,
        name: `${member.firstName} ${member.lastName}`,
        center: kioskCenter || member.center,
        time: new Date().toISOString(),
        type: member.type,
      };
      setVisits((prev) => [nv, ...prev]);
      setMembers((prev) =>
        prev.map((m) =>
          m.id === member.id
            ? {
                ...m,
                visits: m.visits + 1,
                lastVisit: new Date().toISOString(),
              }
            : m
        )
      );
      if (member.status === 'overdue')
        setResult({
          ok: false,
          title: 'Payment Overdue',
          msg: `${member.firstName}, your membership payment is past due. Please see the front desk.`,
          member,
        });
      else if (member.status === 'expiring')
        setResult({
          ok: true,
          warn: true,
          title: `Welcome, ${member.firstName}!`,
          msg: `Your membership expires ${formatDate(
            member.nextPayment
          )}. Please renew soon!`,
          member,
        });
      else if (member.type === 'daypass') {
        const p = (member.punchesLeft || 1) - 1;
        setMembers((prev) =>
          prev.map((m) => (m.id === member.id ? { ...m, punchesLeft: p } : m))
        );
        setResult({
          ok: true,
          title: `Welcome, ${member.firstName}!`,
          msg: `Punch used. ${p} visit${p !== 1 ? 's' : ''} remaining.`,
          member,
        });
      } else
        setResult({
          ok: true,
          title: `Welcome back, ${member.firstName}!`,
          msg: `${
            typeLabels[member.type] || 'Standard'
          } membership — Active. Enjoy your visit!`,
          member,
        });
    } else
      setResult({
        ok: false,
        title: 'Not Found',
        msg: "We couldn't find that member ID. Please check your code or see the front desk.",
        member: null,
      });
    setInput('');
  };

  if (!kioskCenter)
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(145deg, #003d6b 0%, #00294a 100%)',
          fontFamily: "'DM Sans', system-ui, sans-serif",
        }}
      >
        <div style={{ textAlign: 'center', padding: '0 24px' }}>
          <button
            onClick={onExit}
            style={{
              position: 'fixed',
              top: 20,
              left: 20,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              fontSize: 12,
              borderRadius: 8,
              padding: '8px 14px',
            }}
          >
            ← Back
          </button>
          <h2
            style={{
              color: '#fff',
              fontSize: 22,
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            Select This iPad's Location
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: 14,
              marginBottom: 32,
            }}
          >
            Which center is this kiosk at?
          </p>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
            {CENTERS.map((c) => (
              <button
                key={c}
                onClick={() => setKioskCenter(c)}
                style={{
                  width: 200,
                  padding: '32px 20px',
                  borderRadius: 16,
                  border: `2px solid ${centerColors[c]}50`,
                  background: `${centerColors[c]}15`,
                  cursor: 'pointer',
                  color: '#fff',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = `${centerColors[c]}30`)
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = `${centerColors[c]}15`)
                }
              >
                <div
                  style={{
                    fontSize: 40,
                    fontWeight: 800,
                    color: centerColors[c],
                    marginBottom: 8,
                  }}
                >
                  {c[0]}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{c}</div>
                <div
                  style={{
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.5)',
                    marginTop: 4,
                  }}
                >
                  Wellness Center
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(160deg, #003d6b 0%, #001a30 100%)',
        fontFamily: "'DM Sans', system-ui, sans-serif",
        padding: '40px 24px',
        position: 'relative',
      }}
    >
      <button
        onClick={onExit}
        style={{
          position: 'fixed',
          top: 12,
          right: 12,
          background: 'rgba(255,255,255,0.05)',
          border: 'none',
          color: 'rgba(255,255,255,0.15)',
          cursor: 'pointer',
          fontSize: 10,
          borderRadius: 6,
          padding: '6px 10px',
        }}
      >
        Exit Kiosk
      </button>
      <div
        style={{
          position: 'fixed',
          top: 16,
          left: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: centerColors[kioskCenter],
          }}
        />
        <span
          style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {kioskCenter} Wellness Center
        </span>
      </div>

      {!result ? (
        <>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <img
              src={LOGO_URL}
              alt="Wellness Centers"
              style={{
                height: 72,
                objectFit: 'contain',
                marginBottom: 24,
                opacity: 0.9,
              }}
            />
            <h1
              style={{
                color: '#fff',
                fontSize: 32,
                fontWeight: 700,
                margin: '0 0 8px',
              }}
            >
              Welcome!
            </h1>
            <p
              style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: 16,
                margin: 0,
              }}
            >
              Scan your QR code or enter your Member ID
            </p>
          </div>
          <div style={{ width: '100%', maxWidth: 400 }}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              placeholder="Member ID (e.g. WC-001)"
              style={{
                width: '100%',
                padding: '18px 20px',
                borderRadius: 12,
                border: '2px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.06)',
                color: '#fff',
                fontSize: 20,
                fontWeight: 600,
                textAlign: 'center',
                outline: 'none',
                boxSizing: 'border-box',
                letterSpacing: '0.04em',
                fontFamily: 'monospace',
                marginBottom: 16,
              }}
            />
            <button
              onClick={handleScan}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: 12,
                border: 'none',
                background: centerColors[kioskCenter],
                color: '#fff',
                fontSize: 18,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Check In
            </button>
          </div>
        </>
      ) : (
        <div
          style={{
            textAlign: 'center',
            maxWidth: 440,
            width: '100%',
            padding: '48px 32px',
            borderRadius: 24,
            background: result.ok
              ? result.warn
                ? 'rgba(245,158,11,0.1)'
                : 'rgba(22,163,74,0.1)'
              : 'rgba(220,38,38,0.1)',
            border: `2px solid ${
              result.ok
                ? result.warn
                  ? 'rgba(245,158,11,0.3)'
                  : 'rgba(22,163,74,0.3)'
                : 'rgba(220,38,38,0.3)'
            }`,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              margin: '0 auto 20px',
              background: result.ok
                ? result.warn
                  ? '#f59e0b'
                  : '#16a34a'
                : '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ color: '#fff', transform: 'scale(1.8)' }}>
              {result.ok ? Icons.check : Icons.alert}
            </div>
          </div>
          <h2
            style={{
              color: '#fff',
              fontSize: 28,
              fontWeight: 700,
              margin: '0 0 8px',
            }}
          >
            {result.title}
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: 16,
              margin: '0 0 20px',
              lineHeight: 1.5,
            }}
          >
            {result.msg}
          </p>
          {result.member && (
            <div style={{ display: 'inline-flex', gap: 8, fontSize: 13 }}>
              <span
                style={{
                  padding: '4px 12px',
                  borderRadius: 20,
                  background: 'rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.6)',
                }}
              >
                {result.member.id}
              </span>
              <span
                style={{
                  padding: '4px 12px',
                  borderRadius: 20,
                  background: 'rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.6)',
                }}
              >
                {typeLabels[result.member.type] || 'Standard'}
              </span>
            </div>
          )}
          <div style={{ marginTop: 24 }}>
            <div
              style={{
                width: '100%',
                height: 4,
                borderRadius: 2,
                background: 'rgba(255,255,255,0.1)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  background: result.ok
                    ? result.warn
                      ? '#f59e0b'
                      : '#16a34a'
                    : '#dc2626',
                  borderRadius: 2,
                  animation: 'shrink 5s linear forwards',
                }}
              />
            </div>
            <p
              style={{
                color: 'rgba(255,255,255,0.3)',
                fontSize: 11,
                marginTop: 8,
              }}
            >
              Returning to scanner...
            </p>
          </div>
          <style>{`@keyframes shrink { from { width: 100%; } to { width: 0%; } }`}</style>
        </div>
      )}
    </div>
  );
}

// ============================================================
// DIRECTOR DASHBOARD
// ============================================================
function DirectorDashboard({
  user,
  members,
  setMembers,
  visits,
  setVisits,
  onLogout,
}) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCenter, setFilterCenter] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedMember, setSelectedMember] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [scanInput, setScanInput] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [notificationLog, setNotificationLog] = useState([]);
  const [showMemberQR, setShowMemberQR] = useState(null);
  const [globalCenter, setGlobalCenter] = useState(user.center);

  const today = new Date();
  const canSeeAll = true;
  const scopedMembers =
    globalCenter === 'all'
      ? members
      : members.filter((m) => m.center === globalCenter);
  const scopedVisits =
    globalCenter === 'all'
      ? visits
      : visits.filter((v) => v.center === globalCenter);

  const stats = {
    total: scopedMembers.length,
    active: scopedMembers.filter((m) => m.status === 'active').length,
    overdue: scopedMembers.filter((m) => m.status === 'overdue').length,
    expiring: scopedMembers.filter((m) => m.status === 'expiring').length,
    todayVisits: scopedVisits.length,
    harper: members.filter((m) => m.center === 'Harper').length,
    anthony: members.filter((m) => m.center === 'Anthony').length,
  };

  const filteredMembers = scopedMembers.filter((m) => {
    const ms =
      searchQuery === '' ||
      `${m.firstName} ${m.lastName} ${m.id} ${m.email}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    return (
      ms &&
      (filterType === 'all' || m.type === filterType) &&
      (filterCenter === 'all' || m.center === filterCenter) &&
      (filterStatus === 'all' || m.status === filterStatus)
    );
  });

  const handleScan = () => {
    const member = members.find((m) => m.id === scanInput.toUpperCase().trim());
    if (member) {
      setVisits((prev) => [
        {
          memberId: member.id,
          name: `${member.firstName} ${member.lastName}`,
          center: member.center,
          time: new Date().toISOString(),
          type: member.type,
        },
        ...prev,
      ]);
      setMembers((prev) =>
        prev.map((m) =>
          m.id === member.id
            ? {
                ...m,
                visits: m.visits + 1,
                lastVisit: new Date().toISOString(),
              }
            : m
        )
      );
      if (member.status === 'overdue')
        setScanResult({ success: false, member, message: 'PAYMENT OVERDUE' });
      else if (member.status === 'expiring')
        setScanResult({
          success: true,
          member,
          message: `Welcome, ${member.firstName}! Expiring ${member.nextPayment}.`,
          warning: true,
        });
      else if (member.type === 'daypass') {
        const p = (member.punchesLeft || 1) - 1;
        setMembers((prev) =>
          prev.map((m) => (m.id === member.id ? { ...m, punchesLeft: p } : m))
        );
        setScanResult({
          success: true,
          member,
          message: `Welcome, ${member.firstName}! ${p} punches left.`,
        });
      } else
        setScanResult({
          success: true,
          member,
          message: `Welcome back, ${member.firstName}!`,
        });
    } else
      setScanResult({
        success: false,
        member: null,
        message: 'Member not found.',
      });
    setScanInput('');
  };

  const sendReminder = (member, method) =>
    setNotificationLog((prev) => [
      {
        memberId: member.id,
        name: `${member.firstName} ${member.lastName}`,
        method,
        destination: method === 'email' ? member.email : member.phone,
        time: new Date().toISOString(),
        message: `Reminder for ${member.type} (due ${member.nextPayment})`,
      },
      ...prev,
    ]);
  const sendBulkReminders = () =>
    scopedMembers
      .filter((m) => m.status === 'overdue' || m.status === 'expiring')
      .forEach((m) => {
        sendReminder(m, 'email');
        sendReminder(m, 'sms');
      });

  const s = {
    app: {
      fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
      background: '#f0f2f5',
      minHeight: '100vh',
      color: '#1a1a2e',
    },
    sidebar: {
      width: 240,
      background: '#003d6b',
      color: '#fff',
      padding: 0,
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      zIndex: 10,
    },
    nav: { padding: '12px 12px', flex: 1 },
    navItem: (a) => ({
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '10px 12px',
      borderRadius: 8,
      cursor: 'pointer',
      fontSize: 14,
      fontWeight: a ? 600 : 400,
      background: a ? 'rgba(255,255,255,0.15)' : 'transparent',
      color: a ? '#fff' : 'rgba(255,255,255,0.7)',
      transition: 'all 0.15s',
      marginBottom: 4,
      border: 'none',
      width: '100%',
      textAlign: 'left',
    }),
    main: { marginLeft: 240, padding: '28px 32px', maxWidth: 1200 },
    card: {
      background: '#fff',
      borderRadius: 12,
      padding: '20px 24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      border: '1px solid #e8eaed',
    },
    statCard: (c) => ({
      background: '#fff',
      borderRadius: 12,
      padding: '18px 20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      border: '1px solid #e8eaed',
      borderLeft: `4px solid ${c}`,
      flex: 1,
      minWidth: 140,
    }),
    heading: {
      fontSize: 22,
      fontWeight: 700,
      color: '#003d6b',
      margin: '0 0 4px',
      letterSpacing: '-0.02em',
    },
    subheading: { fontSize: 13, color: '#6b7280', margin: 0 },
    badge: (c) => ({
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 600,
      background: `${c}18`,
      color: c,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
    }),
    input: {
      padding: '10px 14px',
      borderRadius: 8,
      border: '1px solid #d1d5db',
      fontSize: 14,
      outline: 'none',
      width: '100%',
      boxSizing: 'border-box',
    },
    btn: (bg, c = '#fff') => ({
      padding: '10px 20px',
      borderRadius: 8,
      border: 'none',
      background: bg,
      color: c,
      fontSize: 14,
      fontWeight: 600,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
    }),
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: 0,
      fontSize: 13,
    },
    th: {
      textAlign: 'left',
      padding: '10px 14px',
      borderBottom: '2px solid #e8eaed',
      color: '#6b7280',
      fontWeight: 600,
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
    },
    td: {
      padding: '12px 14px',
      borderBottom: '1px solid #f3f4f6',
      verticalAlign: 'middle',
    },
  };

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: Icons.dashboard },
    { key: 'members', label: 'Members', icon: Icons.members },
    { key: 'scan', label: 'Badge In', icon: Icons.scan },
    { key: 'notifications', label: 'Notifications', icon: Icons.notify },
    { key: 'reports', label: 'Reports', icon: Icons.report },
  ];
  const centerOpts = [
    { key: 'all', label: 'Both Centers' },
    { key: 'Harper', label: 'Harper' },
    { key: 'Anthony', label: 'Anthony' },
  ];

  return (
    <div style={s.app}>
      <div style={s.sidebar}>
        <div
          style={{
            padding: '16px 16px 14px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <img
            src={LOGO_URL}
            alt="Wellness Centers"
            style={{ height: 36, objectFit: 'contain', opacity: 0.9 }}
          />
        </div>
        <div
          style={{
            padding: '14px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background:
                  user.role === 'dev'
                    ? '#16a34a'
                    : centerColors[user.center] || '#dba51f',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {user.role === 'dev'
                ? '</>'
                : user.role === 'admin'
                ? 'A'
                : user.center[0]}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
                {user.name}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
                {user.username}
                {user.role === 'dev' && (
                  <span
                    style={{
                      marginLeft: 6,
                      padding: '1px 5px',
                      borderRadius: 3,
                      background: 'rgba(22,163,74,0.3)',
                      color: '#86efac',
                      fontSize: 9,
                      fontWeight: 700,
                    }}
                  >
                    DEV
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.4)',
              cursor: 'pointer',
              fontSize: 11,
              padding: 0,
            }}
          >
            {Icons.logout} Sign Out
          </button>
        </div>
        {canSeeAll && (
          <div style={{ padding: '12px 12px 4px' }}>
            <div
              style={{
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'rgba(255,255,255,0.3)',
                padding: '0 4px 6px',
                fontWeight: 600,
              }}
            >
              Viewing
            </div>
            {centerOpts.map((c) => {
              const a = globalCenter === c.key;
              const bg =
                c.key === 'Harper'
                  ? '#dba51f'
                  : c.key === 'Anthony'
                  ? '#1080ad'
                  : 'rgba(255,255,255,0.15)';
              return (
                <button
                  key={c.key}
                  onClick={() => setGlobalCenter(c.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '7px 10px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: a ? 600 : 400,
                    border: 'none',
                    width: '100%',
                    textAlign: 'left',
                    marginBottom: 3,
                    background: a ? bg : 'transparent',
                    color: a ? '#fff' : 'rgba(255,255,255,0.5)',
                    transition: 'all 0.15s',
                  }}
                >
                  {c.label}
                </button>
              );
            })}
            <div
              style={{
                height: 1,
                background: 'rgba(255,255,255,0.08)',
                margin: '8px 0',
              }}
            />
          </div>
        )}
        <nav style={s.nav}>
          {navItems.map((item) => (
            <button
              key={item.key}
              style={s.navItem(activeTab === item.key)}
              onClick={() => setActiveTab(item.key)}
            >
              {item.icon} {item.label}
              {item.key === 'notifications' &&
                scopedMembers.filter((m) => m.status === 'overdue').length >
                  0 && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      background: '#dc2626',
                      color: '#fff',
                      fontSize: 10,
                      fontWeight: 700,
                      borderRadius: 10,
                      padding: '2px 7px',
                    }}
                  >
                    {scopedMembers.filter((m) => m.status === 'overdue').length}
                  </span>
                )}
            </button>
          ))}
        </nav>
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            fontSize: 11,
            color: 'rgba(255,255,255,0.3)',
          }}
        >
          2 Centers · {members.length} Members
        </div>
      </div>

      <div style={s.main}>
        {globalCenter !== 'all' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 16px',
              marginBottom: 20,
              borderRadius: 8,
              background: `${centerColors[globalCenter]}15`,
              border: `1px solid ${centerColors[globalCenter]}40`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: centerColors[globalCenter],
                }}
              />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#003d6b' }}>
                Viewing: {globalCenter} Wellness Center
              </span>
            </div>
            {canSeeAll && (
              <button
                onClick={() => setGlobalCenter('all')}
                style={{
                  background: 'none',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  padding: '4px 12px',
                  fontSize: 12,
                  cursor: 'pointer',
                  color: '#6b7280',
                }}
              >
                Show All
              </button>
            )}
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h1 style={s.heading}>Dashboard</h1>
              <p style={s.subheading}>
                {globalCenter === 'all'
                  ? 'All Centers'
                  : `${globalCenter} Center`}{' '}
                ·{' '}
                {today.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div
              style={{
                display: 'flex',
                gap: 14,
                flexWrap: 'wrap',
                marginBottom: 24,
              }}
            >
              {[
                { v: stats.total, l: 'Total Members', c: '#003d6b' },
                { v: stats.active, l: 'Active', c: '#16a34a' },
                { v: stats.overdue, l: 'Overdue', c: '#dc2626' },
                { v: stats.expiring, l: 'Expiring', c: '#f59e0b' },
                { v: stats.todayVisits, l: 'Check-ins Today', c: '#1080ad' },
              ].map((st, i) => (
                <div key={i} style={s.statCard(st.c)}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: st.c }}>
                    {st.v}
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                    {st.l}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 20,
              }}
            >
              <div style={s.card}>
                <h3
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: '#003d6b',
                    margin: '0 0 16px',
                  }}
                >
                  Today's Check-ins
                </h3>
                {scopedVisits.length === 0 ? (
                  <p style={{ color: '#9ca3af', fontSize: 13 }}>None yet.</p>
                ) : (
                  scopedVisits.slice(0, 6).map((v, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: '#f8fafc',
                        borderRadius: 8,
                        marginBottom: 8,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>
                          {v.name}
                        </div>
                        <div style={{ fontSize: 11, color: '#6b7280' }}>
                          {v.center} · {typeLabels[v.type] || 'Standard'}
                        </div>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 12,
                          color: '#6b7280',
                        }}
                      >
                        {Icons.clock} {formatTime(v.time)}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div style={s.card}>
                <h3
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: '#003d6b',
                    margin: '0 0 16px',
                  }}
                >
                  Needs Attention
                </h3>
                {scopedMembers.filter(
                  (m) => m.status === 'overdue' || m.status === 'expiring'
                ).length === 0 ? (
                  <p
                    style={{
                      color: '#9ca3af',
                      fontSize: 13,
                      textAlign: 'center',
                      padding: 12,
                    }}
                  >
                    All good!
                  </p>
                ) : (
                  scopedMembers
                    .filter(
                      (m) => m.status === 'overdue' || m.status === 'expiring'
                    )
                    .map((m) => (
                      <div
                        key={m.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          marginBottom: 8,
                          background:
                            m.status === 'overdue' ? '#fef2f2' : '#fffbeb',
                          borderRadius: 8,
                          border: `1px solid ${
                            m.status === 'overdue' ? '#fecaca' : '#fde68a'
                          }`,
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>
                            {m.firstName} {m.lastName}
                          </div>
                          <div style={{ fontSize: 11, color: '#6b7280' }}>
                            {m.status === 'overdue'
                              ? `Overdue since ${formatDate(m.nextPayment)}`
                              : `Expiring ${formatDate(m.nextPayment)}`}
                          </div>
                        </div>
                        <span style={s.badge(statusColors[m.status] || '#000')}>
                          {m.status}
                        </span>
                      </div>
                    ))
                )}
              </div>
              {canSeeAll && (
                <div style={s.card}>
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: '#003d6b',
                      margin: '0 0 16px',
                    }}
                  >
                    By Location
                  </h3>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {[
                      { n: 'Harper', ct: stats.harper, cl: '#dba51f' },
                      { n: 'Anthony', ct: stats.anthony, cl: '#1080ad' },
                    ].map((c) => {
                      const a = globalCenter === c.n;
                      return (
                        <div
                          key={c.n}
                          onClick={() => setGlobalCenter(a ? 'all' : c.n)}
                          style={{
                            flex: 1,
                            textAlign: 'center',
                            padding: 16,
                            borderRadius: 10,
                            cursor: 'pointer',
                            background: a ? c.cl : `${c.cl}0a`,
                            border: `2px solid ${a ? c.cl : `${c.cl}20`}`,
                            transition: 'all 0.2s',
                          }}
                        >
                          <div
                            style={{
                              fontSize: 32,
                              fontWeight: 700,
                              color: a ? '#fff' : c.cl,
                            }}
                          >
                            {c.ct}
                          </div>
                          <div
                            style={{
                              fontSize: 13,
                              color: a ? 'rgba(255,255,255,0.8)' : '#6b7280',
                              marginTop: 4,
                            }}
                          >
                            {c.n}
                          </div>
                          <div
                            style={{
                              fontSize: 10,
                              color: a ? 'rgba(255,255,255,0.6)' : '#9ca3af',
                              marginTop: 2,
                            }}
                          >
                            {a ? 'Click for all' : 'Click to filter'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <div style={s.card}>
                <h3
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: '#003d6b',
                    margin: '0 0 16px',
                  }}
                >
                  Membership Mix
                </h3>
                {Object.entries(typeLabels).map(([k, l]) => {
                  const ct = scopedMembers.filter((m) => m.type === k).length;
                  const p =
                    scopedMembers.length > 0
                      ? Math.round((ct / scopedMembers.length) * 100)
                      : 0;
                  return (
                    <div key={k} style={{ marginBottom: 10 }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: 12,
                          marginBottom: 4,
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>{l}</span>
                        <span style={{ color: '#6b7280' }}>
                          {ct} ({p}%)
                        </span>
                      </div>
                      <div
                        style={{
                          height: 8,
                          background: '#f3f4f6',
                          borderRadius: 4,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${p}%`,
                            background: typeColors[k] || '#000',
                            borderRadius: 4,
                            transition: 'width 0.5s',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 20,
              }}
            >
              <div>
                <h1 style={s.heading}>Members</h1>
                <p style={s.subheading}>
                  {filteredMembers.length} member
                  {filteredMembers.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                style={s.btn('#003d6b')}
                onClick={() => setShowAddMember(true)}
              >
                {Icons.plus} Add Member
              </button>
            </div>
            <div
              style={{
                ...s.card,
                marginBottom: 16,
                padding: '14px 20px',
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ position: 'relative', flex: '1 1 200px' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af',
                  }}
                >
                  {Icons.search}
                </span>
                <input
                  style={{ ...s.input, paddingLeft: 36 }}
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                style={{ ...s.input, width: 'auto', minWidth: 120 }}
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                {Object.entries(typeLabels).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
              {canSeeAll && (
                <select
                  style={{ ...s.input, width: 'auto', minWidth: 120 }}
                  value={filterCenter}
                  onChange={(e) => setFilterCenter(e.target.value)}
                >
                  <option value="all">All Centers</option>
                  <option value="Harper">Harper</option>
                  <option value="Anthony">Anthony</option>
                </select>
              )}
              <select
                style={{ ...s.input, width: 'auto', minWidth: 120 }}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="overdue">Overdue</option>
                <option value="expiring">Expiring</option>
              </select>
            </div>
            <div style={{ ...s.card, padding: 0, overflow: 'auto' }}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Member</th>
                    <th style={s.th}>ID</th>
                    <th style={s.th}>Type</th>
                    <th style={s.th}>Center</th>
                    <th style={s.th}>Status</th>
                    <th style={s.th}>Next Payment</th>
                    <th style={s.th}>Visits</th>
                    <th style={s.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((m) => (
                    <tr
                      key={m.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedMember(m)}
                    >
                      <td style={s.td}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>
                          {m.firstName} {m.lastName}
                        </div>
                        <div style={{ fontSize: 11, color: '#6b7280' }}>
                          {m.email}
                        </div>
                      </td>
                      <td
                        style={{
                          ...s.td,
                          fontFamily: 'monospace',
                          fontSize: 12,
                          color: '#6b7280',
                        }}
                      >
                        {m.id}
                      </td>
                      <td style={s.td}>
                        <span style={s.badge(typeColors[m.type] || '#000')}>
                          {typeLabels[m.type] || 'Standard'}
                        </span>
                      </td>
                      <td style={{ ...s.td, fontSize: 13 }}>{m.center}</td>
                      <td style={s.td}>
                        <span
                          style={s.badge(statusColors[m.status] || '#6b7280')}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td style={{ ...s.td, fontSize: 13 }}>
                        {formatDate(m.nextPayment)}
                      </td>
                      <td style={{ ...s.td, fontSize: 13, fontWeight: 600 }}>
                        {m.visits}
                      </td>
                      <td style={s.td}>
                        <button
                          style={{
                            ...s.btn('#1080ad'),
                            padding: '6px 12px',
                            fontSize: 12,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMemberQR(m);
                          }}
                        >
                          QR
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {selectedMember && (
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(0,0,0,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 100,
                }}
                onClick={() => setSelectedMember(null)}
              >
                <div
                  style={{
                    ...s.card,
                    width: 500,
                    maxHeight: '85vh',
                    overflow: 'auto',
                    position: 'relative',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    style={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6b7280',
                    }}
                    onClick={() => setSelectedMember(null)}
                  >
                    {Icons.x}
                  </button>
                  <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        background: selectedMember.sponsor
                          ? '#dd6d22'
                          : '#003d6b',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {selectedMember.firstName[0]}
                      {selectedMember.lastName[0]}
                    </div>
                    <div>
                      <h2
                        style={{
                          fontSize: 20,
                          fontWeight: 700,
                          color: '#003d6b',
                          margin: 0,
                        }}
                      >
                        {selectedMember.firstName} {selectedMember.lastName}
                      </h2>
                      <p
                        style={{
                          fontSize: 13,
                          color: '#6b7280',
                          margin: '4px 0 0',
                        }}
                      >
                        {selectedMember.id} · {selectedMember.center} Center
                      </p>
                      <div
                        style={{
                          display: 'flex',
                          gap: 6,
                          marginTop: 8,
                          flexWrap: 'wrap',
                        }}
                      >
                        <span
                          style={s.badge(
                            typeColors[selectedMember.type] || '#000'
                          )}
                        >
                          {typeLabels[selectedMember.type] || 'Standard'}
                        </span>
                        <span
                          style={s.badge(
                            statusColors[selectedMember.status] || '#000'
                          )}
                        >
                          {selectedMember.status}
                        </span>
                        {selectedMember.billing && (
                          <span style={s.badge('#6b7280')}>
                            {billingLabels[selectedMember.billing] ||
                              selectedMember.billing}
                          </span>
                        )}
                        {selectedMember.sponsor && (
                          <span style={s.badge('#dd6d22')}>
                            {selectedMember.sponsor} Sponsored
                          </span>
                        )}
                        {selectedMember.family && (
                          <span style={s.badge('#8b5cf6')}>
                            Family: {selectedMember.family}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      gap: 12,
                      marginBottom: 20,
                      fontSize: 13,
                    }}
                  >
                    {[
                      { l: 'Email', v: selectedMember.email },
                      { l: 'Phone', v: selectedMember.phone },
                      {
                        l: 'Rate',
                        v: selectedMember.sponsor
                          ? 'Sponsored'
                          : selectedMember.rate
                          ? `$${selectedMember.rate}`
                          : '—',
                      },
                      { l: 'Visits', v: selectedMember.visits, big: true },
                      {
                        l: 'Last Visit',
                        v: formatDate(selectedMember.lastVisit),
                      },
                      {
                        l: 'Member Since',
                        v: formatDate(selectedMember.joinDate),
                      },
                    ].map((f, i) => (
                      <div
                        key={i}
                        style={{
                          padding: 12,
                          background: '#f8fafc',
                          borderRadius: 8,
                        }}
                      >
                        <div
                          style={{
                            color: '#6b7280',
                            fontSize: 11,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: 4,
                          }}
                        >
                          {f.l}
                        </div>
                        <div
                          style={{
                            fontWeight: f.big ? 700 : 400,
                            fontSize: f.big ? 20 : 13,
                          }}
                        >
                          {f.v}
                        </div>
                      </div>
                    ))}
                    {selectedMember.address && (
                      <div
                        style={{
                          gridColumn: '1 / -1',
                          padding: 12,
                          background: '#f8fafc',
                          borderRadius: 8,
                        }}
                      >
                        <div
                          style={{
                            color: '#6b7280',
                            fontSize: 11,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: 4,
                          }}
                        >
                          Mailing Address
                        </div>
                        <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                          {selectedMember.address.street}
                          {selectedMember.address.line2
                            ? `, ${selectedMember.address.line2}`
                            : ''}
                          <br />
                          {selectedMember.address.city},{' '}
                          {selectedMember.address.state}{' '}
                          {selectedMember.address.zip}
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {!selectedMember.sponsor && (
                      <button
                        style={s.btn('#1080ad')}
                        onClick={() => sendReminder(selectedMember, 'email')}
                      >
                        {Icons.mail} Email
                      </button>
                    )}
                    {!selectedMember.sponsor && (
                      <button
                        style={s.btn('#dd6d22')}
                        onClick={() => sendReminder(selectedMember, 'sms')}
                      >
                        {Icons.phone} SMS
                      </button>
                    )}
                    <button
                      style={s.btn('#003d6b')}
                      onClick={() => {
                        setSelectedMember(null);
                        setShowMemberQR(selectedMember);
                      }}
                    >
                      QR Code
                    </button>
                  </div>
                </div>
              </div>
            )}
            {showMemberQR && (
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(0,0,0,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 110,
                }}
                onClick={() => setShowMemberQR(null)}
              >
                <div
                  style={{
                    ...s.card,
                    width: 340,
                    textAlign: 'center',
                    position: 'relative',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    style={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6b7280',
                    }}
                    onClick={() => setShowMemberQR(null)}
                  >
                    {Icons.x}
                  </button>
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: '#003d6b',
                      marginBottom: 4,
                    }}
                  >
                    {showMemberQR.firstName} {showMemberQR.lastName}
                  </h3>
                  <p
                    style={{ fontSize: 12, color: '#6b7280', marginBottom: 16 }}
                  >
                    {showMemberQR.id} · {showMemberQR.center}
                  </p>
                  <div
                    style={{
                      display: 'inline-block',
                      padding: 16,
                      background: '#fff',
                      borderRadius: 12,
                      border: '2px solid #e8eaed',
                      marginBottom: 16,
                    }}
                  >
                    <QRCode data={showMemberQR.id} size={180} />
                  </div>
                  <p
                    style={{
                      fontSize: 12,
                      color: '#6b7280',
                      margin: '0 0 4px',
                    }}
                  >
                    Scan at either center to check in.
                  </p>
                </div>
              </div>
            )}
            {showAddMember && (
              <AddMemberModal
                defaultCenter={
                  globalCenter !== 'all'
                    ? globalCenter
                    : user.center !== 'all'
                    ? user.center
                    : 'Harper'
                }
                onClose={() => setShowAddMember(false)}
                onAdd={(m) => {
                  setMembers((prev) => [...prev, m]);
                  setShowAddMember(false);
                }}
              />
            )}
          </div>
        )}

        {activeTab === 'scan' && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h1 style={s.heading}>Badge In</h1>
              <p style={s.subheading}>Scan QR or enter member ID</p>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 24,
              }}
            >
              <div style={{ ...s.card, textAlign: 'center' }}>
                <div
                  style={{
                    width: 200,
                    height: 200,
                    margin: '0 auto 20px',
                    border: '3px dashed #d1d5db',
                    borderRadius: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 8,
                    color: '#9ca3af',
                    background: '#f8fafc',
                  }}
                >
                  <div style={{ transform: 'scale(2)', opacity: 0.4 }}>
                    {Icons.scan}
                  </div>
                  <span style={{ fontSize: 12 }}>Camera in production</span>
                </div>
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
                  Enter member ID:
                </p>
                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    maxWidth: 300,
                    margin: '0 auto',
                  }}
                >
                  <input
                    style={s.input}
                    placeholder="e.g. WC-001"
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                  />
                  <button style={s.btn('#003d6b')} onClick={handleScan}>
                    Check In
                  </button>
                </div>
              </div>
              <div>
                {scanResult ? (
                  <div
                    style={{
                      ...s.card,
                      borderLeft: `4px solid ${
                        scanResult.success
                          ? scanResult.warning
                            ? '#f59e0b'
                            : '#16a34a'
                          : '#dc2626'
                      }`,
                      background: scanResult.success
                        ? scanResult.warning
                          ? '#fffbeb'
                          : '#f0fdf4'
                        : '#fef2f2',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: scanResult.success
                            ? scanResult.warning
                              ? '#f59e0b'
                              : '#16a34a'
                            : '#dc2626',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {scanResult.success ? Icons.check : Icons.alert}
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>
                        {scanResult.success ? 'Checked In' : 'Failed'}
                      </div>
                    </div>
                    <p
                      style={{
                        fontSize: 14,
                        color: '#374151',
                        margin: '0 0 12px',
                      }}
                    >
                      {scanResult.message}
                    </p>
                    {scanResult.member && (
                      <div
                        style={{
                          padding: 12,
                          background: 'rgba(255,255,255,0.7)',
                          borderRadius: 8,
                          fontSize: 13,
                        }}
                      >
                        <strong>
                          {scanResult.member.firstName}{' '}
                          {scanResult.member.lastName}
                        </strong>{' '}
                        · {scanResult.member.id} · {scanResult.member.center}
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      ...s.card,
                      textAlign: 'center',
                      padding: '48px 24px',
                      color: '#9ca3af',
                    }}
                  >
                    <div
                      style={{
                        transform: 'scale(2)',
                        marginBottom: 16,
                        opacity: 0.3,
                      }}
                    >
                      {Icons.scan}
                    </div>
                    <p>Waiting for scan...</p>
                  </div>
                )}
                <div style={{ ...s.card, marginTop: 16 }}>
                  <h3
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#003d6b',
                      margin: '0 0 12px',
                    }}
                  >
                    Recent
                  </h3>
                  {scopedVisits.slice(0, 5).map((v, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 13,
                        padding: '6px 0',
                        borderBottom: i < 4 ? '1px solid #f3f4f6' : 'none',
                      }}
                    >
                      <span style={{ fontWeight: 500 }}>{v.name}</span>
                      <span style={{ color: '#6b7280', fontSize: 12 }}>
                        {formatTime(v.time)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 20,
              }}
            >
              <div>
                <h1 style={s.heading}>Notifications</h1>
                <p style={s.subheading}>Payment reminders via email & SMS</p>
              </div>
              <button style={s.btn('#dd6d22')} onClick={sendBulkReminders}>
                {Icons.notify} Send All Due
              </button>
            </div>
            <div style={{ ...s.card, marginBottom: 20 }}>
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#003d6b',
                  margin: '0 0 12px',
                }}
              >
                Due for Reminder
              </h3>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Member</th>
                    <th style={s.th}>Type</th>
                    <th style={s.th}>Status</th>
                    <th style={s.th}>Due</th>
                    <th style={s.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {scopedMembers
                    .filter(
                      (m) => m.status === 'overdue' || m.status === 'expiring'
                    )
                    .map((m) => (
                      <tr key={m.id}>
                        <td style={s.td}>
                          <div style={{ fontWeight: 600 }}>
                            {m.firstName} {m.lastName}
                          </div>
                          <div style={{ fontSize: 11, color: '#6b7280' }}>
                            {m.email}
                          </div>
                        </td>
                        <td style={s.td}>
                          <span style={s.badge(typeColors[m.type] || '#000')}>
                            {typeLabels[m.type] || 'Standard'}
                          </span>
                        </td>
                        <td style={s.td}>
                          <span
                            style={s.badge(statusColors[m.status] || '#000')}
                          >
                            {m.status}
                          </span>
                        </td>
                        <td style={{ ...s.td, fontSize: 13 }}>
                          {formatDate(m.nextPayment)}
                        </td>
                        <td style={s.td}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              style={{
                                ...s.btn('#1080ad'),
                                padding: '5px 10px',
                                fontSize: 11,
                              }}
                              onClick={() => sendReminder(m, 'email')}
                            >
                              {Icons.mail}
                            </button>
                            <button
                              style={{
                                ...s.btn('#dd6d22'),
                                padding: '5px 10px',
                                fontSize: 11,
                              }}
                              onClick={() => sendReminder(m, 'sms')}
                            >
                              {Icons.phone}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div style={s.card}>
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#003d6b',
                  margin: '0 0 12px',
                }}
              >
                Log
              </h3>
              {notificationLog.length === 0 ? (
                <p
                  style={{
                    color: '#9ca3af',
                    fontSize: 13,
                    textAlign: 'center',
                    padding: '24px 0',
                  }}
                >
                  No notifications sent yet.
                </p>
              ) : (
                notificationLog.map((n, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: '#f8fafc',
                      borderRadius: 8,
                      marginBottom: 6,
                    }}
                  >
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background:
                            n.method === 'email' ? '#1080ad' : '#dd6d22',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {n.method === 'email' ? Icons.mail : Icons.phone}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>
                          {n.name}
                        </div>
                        <div style={{ fontSize: 11, color: '#6b7280' }}>
                          {n.message}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: '#6b7280' }}>
                      {n.method === 'email' ? 'Email' : 'SMS'} → {n.destination}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ---- REPORTS TAB ---- */}
        {activeTab === 'reports' &&
          (() => {
            const hd6Members = members.filter((m) => m.sponsor === 'HD6');
            const totalSponsoredVisits = hd6Members.reduce(
              (sum, m) => sum + m.visits,
              0
            );
            return (
              <div>
                <div style={{ marginBottom: 20 }}>
                  <h1 style={s.heading}>Reports & Exports</h1>
                  <p style={s.subheading}>
                    Generate reports for corporate partners and internal use
                  </p>
                </div>
                <div
                  style={{
                    ...s.card,
                    marginBottom: 20,
                    border: '1px solid #dd6d2240',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 16,
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: '#003d6b',
                          margin: '0 0 4px',
                        }}
                      >
                        HD6 Employee Wellness Report
                      </h3>
                      <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>
                        Participation data for corporate partner — exportable to
                        CSV
                      </p>
                    </div>
                    <button
                      style={s.btn('#dd6d22')}
                      onClick={() => {
                        const csv = [
                          'Member ID,Name,Email,Center,Membership Type,Total Visits,Last Visit,Join Date',
                          ...hd6Members.map(
                            (m) =>
                              `${m.id},"${m.firstName} ${m.lastName}",${
                                m.email
                              },${m.center},${typeLabels[m.type]},${m.visits},${
                                m.lastVisit || 'N/A'
                              },${m.joinDate}`
                          ),
                        ].join('\n');
                        const blob = new Blob([csv], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `HD6_Wellness_Report_${new Date()
                          .toISOString()
                          .slice(0, 10)}.csv`;
                        a.click();
                      }}
                    >
                      {Icons.report} Export HD6 CSV
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                    {[
                      { v: hd6Members.length, l: 'HD6 Members', c: '#dd6d22' },
                      {
                        v: totalSponsoredVisits,
                        l: 'Total Visits',
                        c: '#1080ad',
                      },
                      {
                        v:
                          hd6Members.length > 0
                            ? Math.round(
                                totalSponsoredVisits / hd6Members.length
                              )
                            : 0,
                        l: 'Avg Visits/Member',
                        c: '#003d6b',
                      },
                      {
                        v: hd6Members.filter((m) => m.status === 'active')
                          .length,
                        l: 'Active',
                        c: '#16a34a',
                      },
                    ].map((st, i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          padding: '12px 16px',
                          background: '#f8fafc',
                          borderRadius: 8,
                          borderLeft: `3px solid ${st.c}`,
                        }}
                      >
                        <div
                          style={{ fontSize: 22, fontWeight: 700, color: st.c }}
                        >
                          {st.v}
                        </div>
                        <div style={{ fontSize: 11, color: '#6b7280' }}>
                          {st.l}
                        </div>
                      </div>
                    ))}
                  </div>
                  <table style={s.table}>
                    <thead>
                      <tr>
                        <th style={s.th}>Employee</th>
                        <th style={s.th}>ID</th>
                        <th style={s.th}>Type</th>
                        <th style={s.th}>Center</th>
                        <th style={s.th}>Total Visits</th>
                        <th style={s.th}>Last Visit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hd6Members.map((m) => (
                        <tr key={m.id}>
                          <td style={s.td}>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>
                              {m.firstName} {m.lastName}
                            </div>
                            <div style={{ fontSize: 11, color: '#6b7280' }}>
                              {m.email}
                            </div>
                          </td>
                          <td
                            style={{
                              ...s.td,
                              fontFamily: 'monospace',
                              fontSize: 12,
                              color: '#6b7280',
                            }}
                          >
                            {m.id}
                          </td>
                          <td style={s.td}>
                            <span style={s.badge(typeColors[m.type] || '#000')}>
                              {typeLabels[m.type] || 'Standard'}
                            </span>
                          </td>
                          <td style={{ ...s.td, fontSize: 13 }}>{m.center}</td>
                          <td
                            style={{ ...s.td, fontSize: 13, fontWeight: 600 }}
                          >
                            {m.visits}
                          </td>
                          <td style={{ ...s.td, fontSize: 13 }}>
                            {formatDate(m.lastVisit)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={s.card}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 16,
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: '#003d6b',
                          margin: '0 0 4px',
                        }}
                      >
                        Membership Breakdown
                      </h3>
                      <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>
                        All members by type and billing method
                      </p>
                    </div>
                    <button
                      style={s.btn('#003d6b')}
                      onClick={() => {
                        const csv = [
                          'Member ID,Name,Email,Phone,Type,Billing,Rate,Status,Center,Sponsor,Visits,Address',
                          ...scopedMembers.map(
                            (m) =>
                              `${m.id},"${m.firstName} ${m.lastName}",${
                                m.email
                              },${m.phone || ''},${typeLabels[m.type]},${
                                billingLabels[m.billing] || m.billing
                              },$${m.rate || 0},${m.status},${m.center},${
                                m.sponsor || ''
                              },${m.visits},"${m.address?.street || ''} ${
                                m.address?.city || ''
                              } ${m.address?.state || ''} ${
                                m.address?.zip || ''
                              }"`
                          ),
                        ].join('\n');
                        const blob = new Blob([csv], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `All_Members_${new Date()
                          .toISOString()
                          .slice(0, 10)}.csv`;
                        a.click();
                      }}
                    >
                      {Icons.report} Export All Members
                    </button>
                  </div>
                  <table style={s.table}>
                    <thead>
                      <tr>
                        <th style={s.th}>Type</th>
                        <th style={s.th}>Count</th>
                        <th style={s.th}>Sponsored</th>
                        <th style={s.th}>Paying</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(typeLabels).map(([k, label]) => {
                        const ofType = scopedMembers.filter(
                          (m) => m.type === k
                        );
                        const sponsored = ofType.filter((m) => m.sponsor);
                        return ofType.length > 0 ? (
                          <tr key={k}>
                            <td style={s.td}>
                              <span style={s.badge(typeColors[k] || '#000')}>
                                {label}
                              </span>
                            </td>
                            <td style={{ ...s.td, fontWeight: 600 }}>
                              {ofType.length}
                            </td>
                            <td style={s.td}>{sponsored.length}</td>
                            <td style={s.td}>
                              {ofType.length - sponsored.length}
                            </td>
                          </tr>
                        ) : null;
                      })}
                      <tr style={{ background: '#f8fafc' }}>
                        <td style={{ ...s.td, fontWeight: 700 }}>Total</td>
                        <td style={{ ...s.td, fontWeight: 700 }}>
                          {scopedMembers.length}
                        </td>
                        <td style={{ ...s.td, fontWeight: 700 }}>
                          {scopedMembers.filter((m) => m.sponsor).length}
                        </td>
                        <td style={{ ...s.td, fontWeight: 700 }}>
                          {scopedMembers.filter((m) => !m.sponsor).length}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
      </div>
    </div>
  );
}

// ============================================================
// ADD MEMBER MODAL
// ============================================================
function AddMemberModal({ defaultCenter, onClose, onAdd }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    line2: '',
    city: 'Medicine Lodge',
    state: 'KS',
    zip: '67104',
    type: 'single',
    billing: 'month_to_month',
    center: defaultCenter,
    sponsor: '',
  });
  const rates = {
    single: {
      month_to_month: 35,
      auto_draft: 32,
      '6mo_prepay': 200,
      '12mo_prepay': 378,
    },
    family: {
      month_to_month: 55,
      auto_draft: 50,
      '6mo_prepay': 313,
      '12mo_prepay': 594,
    },
    senior: {
      month_to_month: 22,
      auto_draft: 20,
      '6mo_prepay': 125,
      '12mo_prepay': 238,
    },
    senior_family: {
      month_to_month: 40,
      auto_draft: 36,
      '6mo_prepay': 228,
      '12mo_prepay': 432,
    },
    student: {
      month_to_month: 20,
      auto_draft: 18,
      '6mo_prepay': 114,
      '12mo_prepay': 216,
    },
    corporate: { month_to_month: 25 },
    corporate_family: { month_to_month: 45 },
    daypass: { per_visit: 5 },
  };
  const isSponsored = form.sponsor === 'HD6';
  const currentRate = isSponsored ? 0 : rates[form.type]?.[form.billing] || 0;
  const billingForType =
    form.type === 'daypass'
      ? ['per_visit']
      : form.type === 'corporate' || form.type === 'corporate_family'
      ? ['month_to_month']
      : ['month_to_month', 'auto_draft', '6mo_prepay', '12mo_prepay'];
  const handleSubmit = () => {
    if (!form.firstName || !form.lastName || !form.email) return;
    const id = `WC-${String(Math.floor(Math.random() * 900) + 100).padStart(
      3,
      '0'
    )}`;
    onAdd({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      address: {
        street: form.street,
        line2: form.line2,
        city: form.city,
        state: form.state,
        zip: form.zip,
      },
      type: form.type,
      billing: isSponsored ? 'sponsored' : form.billing,
      rate: currentRate,
      center: form.center,
      sponsor: form.sponsor || null,
      id,
      status: 'active',
      nextPayment: isSponsored || form.type === 'daypass' ? null : '2026-04-12',
      family: null,
      visits: 0,
      lastVisit: null,
      punchesLeft: form.type === 'daypass' ? 10 : undefined,
      joinDate: new Date().toISOString(),
    });
  };
  const si = {
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid #d1d5db',
    fontSize: 14,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  };
  const lb = {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 4,
  };
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: '24px 28px',
          width: 520,
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: '#003d6b',
            margin: '0 0 20px',
          }}
        >
          Add New Member
        </h3>
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}
        >
          <div>
            <label style={lb}>First Name *</label>
            <input
              style={si}
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
          </div>
          <div>
            <label style={lb}>Last Name *</label>
            <input
              style={si}
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={lb}>Email *</label>
            <input
              style={si}
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={lb}>Phone</label>
            <input
              style={si}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div
            style={{
              gridColumn: '1/-1',
              borderTop: '1px solid #e5e7eb',
              paddingTop: 12,
              marginTop: 4,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: '#003d6b',
                marginBottom: 10,
              }}
            >
              Mailing Address
            </div>
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={lb}>Street Address</label>
            <input
              style={si}
              placeholder="123 Main St"
              value={form.street}
              onChange={(e) => setForm({ ...form, street: e.target.value })}
            />
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={lb}>Apt / Suite / Unit</label>
            <input
              style={si}
              placeholder="Optional"
              value={form.line2}
              onChange={(e) => setForm({ ...form, line2: e.target.value })}
            />
          </div>
          <div>
            <label style={lb}>City</label>
            <input
              style={si}
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </div>
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}
          >
            <div>
              <label style={lb}>State</label>
              <input
                style={si}
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
            </div>
            <div>
              <label style={lb}>ZIP</label>
              <input
                style={si}
                value={form.zip}
                onChange={(e) => setForm({ ...form, zip: e.target.value })}
              />
            </div>
          </div>
          <div
            style={{
              gridColumn: '1/-1',
              borderTop: '1px solid #e5e7eb',
              paddingTop: 12,
              marginTop: 4,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: '#003d6b',
                marginBottom: 10,
              }}
            >
              Membership
            </div>
          </div>
          <div>
            <label style={lb}>Type</label>
            <select
              style={si}
              value={form.type}
              onChange={(e) =>
                setForm({
                  ...form,
                  type: e.target.value,
                  billing:
                    e.target.value === 'daypass'
                      ? 'per_visit'
                      : e.target.value === 'corporate' ||
                        e.target.value === 'corporate_family'
                      ? 'month_to_month'
                      : 'month_to_month',
                })
              }
            >
              {Object.entries(typeLabels).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={lb}>Billing</label>
            <select
              style={si}
              value={form.billing}
              onChange={(e) => setForm({ ...form, billing: e.target.value })}
            >
              {billingForType.map((b) => (
                <option key={b} value={b}>
                  {billingLabels[b]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={lb}>Home Center</label>
            <select
              style={si}
              value={form.center}
              onChange={(e) => setForm({ ...form, center: e.target.value })}
            >
              <option value="Harper">Harper</option>
              <option value="Anthony">Anthony</option>
            </select>
          </div>
          <div>
            <label style={lb}>Corporate Sponsor</label>
            <select
              style={si}
              value={form.sponsor}
              onChange={(e) => setForm({ ...form, sponsor: e.target.value })}
            >
              <option value="">None</option>
              <option value="HD6">HD6 (Comp)</option>
            </select>
          </div>
          {(currentRate > 0 || isSponsored) && (
            <div
              style={{
                gridColumn: '1/-1',
                padding: 12,
                background: isSponsored ? '#f0fdf4' : '#f8fafc',
                borderRadius: 8,
                border: `1px solid ${isSponsored ? '#bbf7d0' : '#e8eaed'}`,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: isSponsored ? '#16a34a' : '#003d6b',
                }}
              >
                {isSponsored
                  ? 'HD6 Sponsored — No charge'
                  : `Rate: $${currentRate}${
                      form.billing.includes('prepay') ? ' (prepaid)' : '/mo'
                    }`}
              </span>
            </div>
          )}
        </div>
        <div
          style={{
            display: 'flex',
            gap: 8,
            justifyContent: 'flex-end',
            marginTop: 20,
          }}
        >
          <button
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              border: '1px solid #d1d5db',
              background: '#fff',
              fontSize: 14,
              cursor: 'pointer',
            }}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              border: 'none',
              background: '#003d6b',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
            onClick={handleSubmit}
          >
            Add Member
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ROOT APP
// ============================================================
export default function App() {
  const [mode, setMode] = useState('entry');
  const [user, setUser] = useState(null);

  const [members, setMembers] = useState([]);
  const [visits, setVisits] = useState([]);

  // THE SECURE SERVER BRIDGE (Vercel will use this to bypass the firewall)
  useEffect(() => {
    fetch('/api/members')
      .then((response) => response.json())
      .then((data) => {
        if (data.records) {
          const realMembers = data.records.map((record) => {
            let memType = 'single';
            if (record.fields['Membership Type']) {
              memType = record.fields['Membership Type']
                .toLowerCase()
                .replace(/ /g, '_');
            }
            return {
              id: record.fields['Member ID'] || record.id,
              firstName: record.fields['First Name'] || 'Unknown',
              lastName: record.fields['Last Name'] || '',
              email: record.fields['Email'] || '',
              phone: record.fields['Phone'] || '',
              type: memType,
              status: record.fields['Membership Status']
                ? record.fields['Membership Status'].toLowerCase()
                : 'active',
              center: record.fields['Home Center'] || 'Anthony',
              visits: record.fields['Total Visits'] || 0,
              nextPayment: record.fields['Next Payment Due'] || null,
            };
          });
          setMembers(realMembers);
        }
      })
      .catch((error) => console.error('Database connection error:', error));
  }, []);

  if (mode === 'entry')
    return (
      <EntryScreen
        onDirectorLogin={() => setMode('login')}
        onKiosk={() => setMode('kiosk')}
      />
    );
  if (mode === 'login')
    return (
      <LoginScreen
        onLogin={(u) => {
          setUser(u);
          setMode('director');
        }}
        onBack={() => setMode('entry')}
      />
    );
  if (mode === 'kiosk')
    return (
      <KioskMode
        members={members}
        setMembers={setMembers}
        visits={visits}
        setVisits={setVisits}
        onExit={() => setMode('entry')}
      />
    );
  if (mode === 'director')
    return (
      <DirectorDashboard
        user={user}
        members={members}
        setMembers={setMembers}
        visits={visits}
        setVisits={setVisits}
        onLogout={() => {
          setUser(null);
          setMode('entry');
        }}
      />
    );
  return null;
}
