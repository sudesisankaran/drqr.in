import React, { useEffect, useState } from 'react';
import { ShieldAlert, Lock, AlertTriangle, EyeOff } from 'lucide-react';

/**
 * SecurityShield Component
 * Enforces healthcare security compliance:
 * 1. Disables right-click context menu.
 * 2. Blocks keyboard shortcuts (PrintScreen, Ctrl+P, Ctrl+S, DevTools, Inspect).
 * 3. Window blur detection (Anti-Screen Record / Snipping Tool prevention).
 * 4. CSS user-select: none & print protection.
 * 5. Dynamic security watermark overlay.
 */
const SecurityShield = ({ children, watermarkText = 'CONFIDENTIAL MEDICAL RECORD • NO SCREENSHOT • SECURE SESSION' }) => {
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);
  const [warningMessage, setWarningMessage] = useState(null);

  useEffect(() => {
    // 1. Disable right-click context menu
    const handleContextMenu = (e) => {
      e.preventDefault();
      showSecurityAlert('Right-click is disabled to protect confidential medical records.');
      return false;
    };

    // 2. Intercept screenshot and save keys
    const handleKeyDown = (e) => {
      // PrintScreen key
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        try {
          if (navigator.clipboard) {
            navigator.clipboard.writeText('');
          }
        } catch (_) {}
        showSecurityAlert('Screenshots and screen captures are strictly prohibited on medical records.');
        return false;
      }

      // Ctrl+P (Print) or Ctrl+S (Save) or Ctrl+U (View Source)
      if ((e.ctrlKey || e.metaKey) && ['p', 'P', 's', 'S', 'u', 'U'].includes(e.key)) {
        e.preventDefault();
        showSecurityAlert(`Saving or printing (${e.key.toUpperCase()}) is disabled by medical security policy.`);
        return false;
      }

      // F12 or Ctrl+Shift+I / J / C (DevTools)
      if (
        e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'I', 'j', 'J', 'c', 'C'].includes(e.key))
      ) {
        e.preventDefault();
        showSecurityAlert('Developer tools and inspection are restricted on sensitive health data.');
        return false;
      }
    };

    // 3. Window blur detection: when user opens a snipping tool or screen recording overlay
    const handleBlur = () => {
      setIsWindowBlurred(true);
    };

    const handleFocus = () => {
      setIsWindowBlurred(false);
    };

    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const showSecurityAlert = (msg) => {
    setWarningMessage(msg);
    setTimeout(() => {
      setWarningMessage(null);
    }, 3500);
  };

  return (
    <div className="relative select-none" style={{ WebkitUserSelect: 'none', userSelect: 'none' }}>
      {/* Dynamic diagonal watermark overlay across the document */}
      <div
        className="pointer-events-none fixed inset-0 z-40 overflow-hidden opacity-[0.035] flex flex-wrap items-center justify-around gap-20 p-8 select-none"
        aria-hidden="true"
      >
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className="transform -rotate-25 text-white font-mono font-black text-xs sm:text-sm tracking-widest whitespace-nowrap"
          >
            {watermarkText}
          </div>
        ))}
      </div>

      {/* Security alert toast when blocked action attempted */}
      {warningMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-rose-950/95 text-rose-200 border border-rose-500/40 shadow-2xl backdrop-blur-md text-xs font-semibold">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{warningMessage}</span>
          </div>
        </div>
      )}

      {/* Screen blur overlay when window loses focus (Anti-screenshot / screen-recording overlay) */}
      {isWindowBlurred && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-4 shadow-xl">
            <EyeOff className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Confidential Healthcare Record Hidden
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed">
            Content is temporarily protected while switching windows, screen capturing, or background recording. Please return focus to this browser tab to resume viewing.
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-[11px] font-mono">
            <Lock className="w-3.5 h-3.5 text-teal-400" /> Medical Privacy Shield Active
          </div>
        </div>
      )}

      {/* Content wrapper with print restriction CSS */}
      <div className="print:hidden">
        {children}
      </div>

      {/* Print protection message if someone triggers browser print */}
      <style>{`
        @media print {
          body * {
            display: none !important;
            visibility: hidden !important;
          }
          body::before {
            content: "SECURITY ALERT: Printing or exporting confidential patient health records is strictly prohibited by healthcare privacy regulations.";
            display: block !important;
            visibility: visible !important;
            font-size: 20pt;
            font-family: sans-serif;
            color: #dc2626;
            text-align: center;
            padding: 100px 40px;
          }
        }
      `}</style>
    </div>
  );
};

export default SecurityShield;
