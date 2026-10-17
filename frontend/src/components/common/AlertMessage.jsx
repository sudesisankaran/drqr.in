import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const AlertMessage = ({ type = 'info', message, onClose, className = '' }) => {
  if (!message) return null;

  const typeConfig = {
    success: {
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    },
    error: {
      bg: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
      icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    },
    warning: {
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
      icon: <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />,
    },
    info: {
      bg: 'bg-teal-500/10 border-teal-500/30 text-teal-300',
      icon: <Info className="w-5 h-5 text-teal-400 shrink-0" />,
    },
  };

  const current = typeConfig[type] || typeConfig.info;

  return (
    <div className={`p-4 rounded-xl border flex items-start justify-between gap-3 text-sm ${current.bg} ${className}`}>
      <div className="flex items-start gap-3">
        {current.icon}
        <div className="leading-snug">{message}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white shrink-0 p-1 rounded-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default AlertMessage;
