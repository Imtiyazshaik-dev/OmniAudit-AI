import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { 
  FileText, 
  UploadCloud, 
  BarChart3, 
  History, 
  ShieldCheck, 
  User, 
  LogOut, 
  Sparkles,
  Building2,
  LogIn,
  ChevronDown,
  Mail,
  MapPin,
  Check,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { INDIAN_GST_STATES, getStateByCode } from '../utils/gstStates';

export default function Navbar() {
  const { user, logout, login, token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [changingState, setChangingState] = useState(false);
  const dropdownRef = useRef(null);

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname === path;
  };
  
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  // Derive current state info from user profile
  const userStateCode = user?.stateCode || '27';
  const currentStateInfo = getStateByCode(userStateCode);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/login');
  };

  const handleStateChange = async (newCode) => {
    setChangingState(true);
    try {
      await axios.put('/api/auth/update-state', { stateCode: newCode });
      if (user) {
        login(token, { ...user, stateCode: newCode });
      }
    } catch (err) {
      console.error("Failed to update state:", err);
    } finally {
      setChangingState(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to={isAuthPage ? "#" : "/dashboard"} className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-400 p-[1px] shadow-glow-indigo transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-zinc-950 rounded-[11px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400 font-sans">
                OmniAudit <span className="text-indigo-400 font-mono">AI</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                v3.6
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 block tracking-wide -mt-1 font-mono">
              IDP &amp; GST COMPLIANCE
            </span>
          </div>
        </Link>

        {/* Navigation Links - HIDDEN on isolated login/register pages */}
        {!isAuthPage && (
          <nav className="hidden md:flex items-center space-x-1 bg-zinc-900/60 p-1.5 rounded-xl border border-zinc-800/60">
            <Link
              to="/dashboard"
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold font-sans transition-all ${
                isActive('/dashboard')
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-glow-indigo'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
            >
              <BarChart3 className={`w-3.5 h-3.5 ${isActive('/dashboard') ? 'text-indigo-400' : ''}`} />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/upload"
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold font-sans transition-all ${
                isActive('/upload')
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-glow-indigo'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
            >
              <UploadCloud className={`w-3.5 h-3.5 ${isActive('/upload') ? 'text-indigo-400' : ''}`} />
              <span>Upload &amp; Audit</span>
            </Link>

            <Link
              to="/gstr-summary"
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold font-sans transition-all ${
                isActive('/gstr-summary')
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-glow-indigo'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
            >
              <FileText className={`w-3.5 h-3.5 ${isActive('/gstr-summary') ? 'text-indigo-400' : ''}`} />
              <span>GSTR Summary</span>
            </Link>

            <Link
              to="/history"
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold font-sans transition-all ${
                isActive('/history')
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-glow-indigo'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
            >
              <History className={`w-3.5 h-3.5 ${isActive('/history') ? 'text-indigo-400' : ''}`} />
              <span>Audit History</span>
            </Link>
          </nav>
        )}

        {/* User Info & Actions */}
        <div className="flex items-center space-x-3">
          
          {!isAuthPage && (
            <>
              {/* Dynamic Audit Invoice Button - ONLY highlights when on /upload route */}
              <Link
                to="/upload"
                className={`hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive('/upload')
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-glow-indigo scale-105'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white'
                }`}
              >
                <Sparkles className={`w-3.5 h-3.5 ${isActive('/upload') ? 'text-indigo-200' : 'text-indigo-400'}`} />
                <span>Audit Invoice</span>
              </Link>

              {/* DYNAMIC User Org State Badge */}
              <div 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 cursor-pointer text-xs font-mono text-zinc-300 transition-colors"
                title="Click to change your Enterprise State"
              >
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>{currentStateInfo.short} ({currentStateInfo.code})</span>
              </div>
            </>
          )}

          {/* Profile & Auth Control Area */}
          {user && !isAuthPage ? (
            <div className="relative border-l border-zinc-800 pl-2" ref={dropdownRef}>
              <div className="flex items-center space-x-2">
                
                {/* Interactive Profile Button */}
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all text-left"
                  title="View Profile Details"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-xs font-extrabold text-white">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <span className="hidden sm:inline-block text-xs font-medium text-zinc-200 font-sans max-w-[100px] truncate">
                    {user.name || 'Auditor'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Direct Sign Out Button */}
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-rose-500/50 hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>

              </div>

              {/* Profile Dropdown Popover */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center space-x-3 pb-3 border-b border-zinc-800">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-400 p-[1px]">
                      <div className="w-full h-full bg-zinc-950 rounded-[11px] flex items-center justify-center font-extrabold text-indigo-400 text-sm">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white tracking-tight">{user.name}</h4>
                      <p className="text-[11px] text-zinc-400 flex items-center space-x-1 mt-0.5">
                        <Mail className="w-3 h-3 text-zinc-500" />
                        <span className="truncate max-w-[170px]">{user.email}</span>
                      </p>
                    </div>
                  </div>

                  {/* Organization & Dynamic State Selector */}
                  <div className="py-3 space-y-3 border-b border-zinc-800 text-xs">
                    <div className="flex items-center justify-between text-zinc-400 font-mono">
                      <span>Organization:</span>
                      <span className="text-white font-semibold">{user.organization || 'OmniAudit Enterprise'}</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-indigo-400" />
                        <span>SWITCH ENTERPRISE STATE (GST LOCATION)</span>
                      </label>
                      <select
                        value={userStateCode}
                        onChange={(e) => handleStateChange(e.target.value)}
                        disabled={changingState}
                        className="w-full p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-indigo-300 font-mono focus:outline-none focus:border-indigo-500"
                      >
                        {INDIAN_GST_STATES.map((st) => (
                          <option key={st.code} value={st.code}>
                            {st.short} ({st.code}) — {st.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      onClick={handleLogout}
                      className="w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold font-mono flex items-center justify-center space-x-2 transition-all"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>SIGN OUT OF ACCOUNT</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="flex items-center space-x-2">
              {location.pathname === '/login' ? (
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-medium shadow-glow-indigo flex items-center space-x-1.5 transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register Account</span>
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 text-xs font-medium flex items-center space-x-1.5 transition-all"
                >
                  <LogIn className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          )}

        </div>

      </div>
    </header>
  );
}
