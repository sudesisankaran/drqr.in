import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="py-24 max-w-md mx-auto px-4 text-center">
      <div className="glass-panel rounded-2xl p-8 border border-slate-800 bg-slate-900/95 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-teal-500/15 text-teal-400 border border-teal-500/30 flex items-center justify-center mx-auto mb-4">
          <FileQuestion className="w-8 h-8" />
        </div>

        <h1 className="text-3xl font-extrabold text-white">404 - Page Not Found</h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
          The healthcare resource or link you are looking for does not exist or may have been relocated.
        </p>

        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-lg shadow-teal-600/30 transition-all"
          >
            <Home className="w-4 h-4" />
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
