import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ fullScreen = false, size = 'default', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-4 h-4 text-teal-400',
    default: 'w-8 h-8 text-teal-400',
    large: 'w-12 h-12 text-teal-400',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-teal-500/20 animate-ping absolute inset-0" />
        <Loader2 className={`${sizeClasses[size] || sizeClasses.default} animate-spin`} />
      </div>
      {text && <p className="text-sm font-medium text-slate-300 animate-pulse">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md">
        {spinner}
      </div>
    );
  }

  return <div className="py-8 flex justify-center">{spinner}</div>;
};

export default LoadingSpinner;
