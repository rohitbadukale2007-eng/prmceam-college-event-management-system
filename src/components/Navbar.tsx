import React from 'react';
import { useEventContext } from '../context/EventContext';
import { Calendar, UserCircle, LogOut, ShieldCheck, GraduationCap } from 'lucide-react';

interface NavbarProps {
  onShowToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onShowToast }) => {
  const { currentUser, logout } = useEventContext();

  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-zinc-900 tracking-tight text-lg">
                  PRMCEAM Events
                </span>
              </div>
              <p className="text-xs text-zinc-500 hidden sm:block">
                College Event Management & Seat Reservation Portal
              </p>
            </div>
          </div>

          {/* User actions */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5 pl-3 border-l border-zinc-200">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm ${
                      currentUser.role === 'admin'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {currentUser.role === 'admin' ? (
                      <ShieldCheck className="w-5 h-5 text-amber-600" />
                    ) : (
                      <GraduationCap className="w-5 h-5 text-indigo-600" />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-zinc-900 truncate max-w-[150px]">
                        {currentUser.name}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          currentUser.role === 'admin'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        {currentUser.role}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-500 block truncate max-w-[160px]">
                      {currentUser.rollNumber ? `Roll: ${currentUser.rollNumber}` : currentUser.email}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    logout();
                    onShowToast('info', 'You have been logged out.');
                  }}
                  className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-600">
                <UserCircle className="w-4 h-4 text-zinc-400" />
                <span>Authentication Required</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
