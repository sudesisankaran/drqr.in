import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  Building2,
  User,
  LogOut,
  Menu,
  X,
  FilePlus,
  QrCode,
  LayoutDashboard,
  Settings,
  Sparkles
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout, isHospital, isPatient } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-400 p-[1px] shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-teal-400 group-hover:text-emerald-300 transition-colors" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-white group-hover:text-teal-300 transition-colors">
                  Medi<span className="text-teal-400">QR</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">
                  <Sparkles className="w-2.5 h-2.5" /> Healthcare
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block tracking-wide">
                Medical Records & QR Management
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive('/') ? 'text-teal-400 bg-teal-500/10' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/register"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    location.pathname.startsWith('/register') ? 'text-teal-400 bg-teal-500/10' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Register
                </Link>
                <Link
                  to="/login"
                  className="ml-2 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-500/25 transition-all hover:scale-[1.02]"
                >
                  Sign In
                </Link>
              </>
            ) : (
              <>
                <Link
                  to={isHospital ? '/hospital/dashboard' : '/patient/dashboard'}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive('/hospital/dashboard') || isActive('/patient/dashboard')
                      ? 'text-teal-300 bg-teal-500/15 border border-teal-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-teal-400" />
                  Dashboard
                </Link>

                {isPatient ? (
                  <>
                    <Link
                      to="/patient/hospitals/add"
                      className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive('/patient/hospitals/add')
                          ? 'text-teal-300 bg-teal-500/15 border border-teal-500/30'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-cyan-400" />
                      Add Hospital
                    </Link>

                    <Link
                      to="/patient/records/upload"
                      className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive('/patient/records/upload')
                          ? 'text-teal-300 bg-teal-500/15 border border-teal-500/30'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <FilePlus className="w-4 h-4 text-emerald-400" />
                      Upload Record
                    </Link>

                    <Link
                      to="/patient/records"
                      className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive('/patient/records')
                          ? 'text-teal-300 bg-teal-500/15 border border-teal-500/30'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <QrCode className="w-4 h-4 text-purple-400" />
                      My Records
                    </Link>

                    <Link
                      to="/patient/profile"
                      className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive('/patient/profile')
                          ? 'text-teal-300 bg-teal-500/15 border border-teal-500/30'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      Profile
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/records/add"
                      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive('/records/add')
                          ? 'text-teal-300 bg-teal-500/15 border border-teal-500/30'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <FilePlus className="w-4 h-4 text-emerald-400" />
                      Add Hospital Record
                    </Link>

                    <Link
                      to="/settings"
                      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive('/settings')
                          ? 'text-teal-300 bg-teal-500/15 border border-teal-500/30'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      Settings
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>

          {/* User Profile & Actions */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-teal-950 border border-teal-500/30 flex items-center justify-center text-teal-300 font-bold text-xs uppercase">
                  {user?.full_name ? user.full_name.charAt(0) : 'U'}
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold text-white max-w-[140px] truncate">
                    {user?.full_name}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.2 rounded ${
                        isHospital
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                      }`}
                    >
                      {user?.role}
                    </span>
                    <span className="text-[10px] text-slate-400 max-w-[100px] truncate">
                      {user?.email}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 rounded-lg bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950/95 px-4 pt-3 pb-6 space-y-2 animate-fadeIn">
          {!isAuthenticated ? (
            <>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-900"
              >
                Home
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-900"
              >
                Registration
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center mt-2 px-4 py-2.5 rounded-lg bg-teal-600 text-white font-semibold shadow-lg"
              >
                Sign In
              </Link>
            </>
          ) : (
            <>
              <div className="p-3 mb-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="font-semibold text-white text-sm">{user?.full_name}</div>
                <div className="text-xs text-teal-400 capitalize">{user?.role} Account</div>
                <div className="text-xs text-slate-400 truncate">{user?.email}</div>
              </div>

              <Link
                to={isHospital ? '/hospital/dashboard' : '/patient/dashboard'}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-900"
              >
                <LayoutDashboard className="w-4 h-4 text-teal-400" />
                Dashboard
              </Link>

              {isPatient ? (
                <>
                  <Link
                    to="/patient/hospitals/add"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-900"
                  >
                    <Building2 className="w-4 h-4 text-cyan-400" />
                    Add Hospital
                  </Link>
                  <Link
                    to="/patient/records/upload"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-900"
                  >
                    <FilePlus className="w-4 h-4 text-emerald-400" />
                    Upload Record
                  </Link>
                  <Link
                    to="/patient/records"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-900"
                  >
                    <QrCode className="w-4 h-4 text-purple-400" />
                    My Records
                  </Link>
                  <Link
                    to="/patient/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-900"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    Profile
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/records/add"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-900"
                  >
                    <FilePlus className="w-4 h-4 text-emerald-400" />
                    Add Hospital Record
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-900"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    Settings
                  </Link>
                </>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 mt-2 rounded-lg text-rose-400 bg-rose-950/20 border border-rose-900/30 hover:bg-rose-900/30"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
