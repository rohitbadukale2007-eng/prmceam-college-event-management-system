import React, { useState } from 'react';
import { useEventContext } from '../context/EventContext';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  GraduationCap, 
  Ticket, 
  Check, 
  XCircle,
  Filter
} from 'lucide-react';

interface StudentDashboardProps {
  onShowToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onShowToast }) => {
  const { 
    currentUser, 
    events, 
    registrations, 
    registerForEvent, 
    cancelRegistration, 
    getRemainingSeats, 
    isStudentRegistered,
    getEventRegistrations
  } = useEventContext();

  const [activeTab, setActiveTab] = useState<'all' | 'my-events'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Filtered student registrations
  const studentRegistrations = registrations.filter(
    (r) => r.studentId === currentUser?.id
  );

  // Filtered upcoming events
  const filteredEvents = events.filter((evt) => {
    const matchesQuery = 
      evt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (evt.venue && evt.venue.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (evt.category && evt.category.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || evt.category === selectedCategory;

    return matchesQuery && matchesCategory;
  });

  const handleRegister = (eventId: string, eventName: string) => {
    const remaining = getRemainingSeats(eventId);
    
    // Explicit Edge Case 1 handling for feedback
    if (isStudentRegistered(eventId)) {
      onShowToast('error', `Duplicate Registration: You are already registered for "${eventName}".`);
      return;
    }

    // Explicit Edge Case 2 handling for feedback
    if (remaining <= 0) {
      onShowToast('error', `Registration Closed: All seats are filled for "${eventName}".`);
      return;
    }

    const res = registerForEvent(eventId);
    if (res.success) {
      onShowToast('success', res.message);
    } else {
      onShowToast('error', res.message);
    }
  };

  const handleCancel = (registrationId: string, eventName: string) => {
    if (window.confirm(`Cancel your registration for "${eventName}"? Your seat will be returned to the pool.`)) {
      const res = cancelRegistration(registrationId);
      if (res.success) {
        onShowToast('info', res.message);
      } else {
        onShowToast('error', res.message);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Student Welcome Header */}
      <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200">
              Student Portal
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              Roll No: {currentUser?.rollNumber || 'Not specified'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight mt-1">
            Welcome, {currentUser?.name || 'Student'}
          </h1>
          <p className="text-sm text-zinc-600 mt-0.5">
            Browse upcoming college events, check real-time seat availability, and reserve your spot.
          </p>
        </div>

        {/* Status Pill Card */}
        <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4 flex items-center gap-4 shrink-0">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-indigo-950 block">
              My Active Passes
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-indigo-700">
                {studentRegistrations.length}
              </span>
              <span className="text-xs text-indigo-600 font-medium">events registered</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Main Tabs */}
          <div className="inline-flex bg-zinc-100 p-1 rounded-xl border border-zinc-200">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Available Events ({events.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('my-events')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'my-events'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>My Registrations ({studentRegistrations.length})</span>
            </button>
          </div>

          {/* Search Input */}
          {activeTab === 'all' && (
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search events, venue, topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
              />
            </div>
          )}
        </div>

        {/* Category Pills (Only in All Events tab) */}
        {activeTab === 'all' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-zinc-400 font-semibold flex items-center gap-1 shrink-0">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            {['All', 'Technical', 'Workshop', 'Seminar', 'Cultural', 'Sports'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full font-semibold transition-all shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-zinc-900 text-white'
                    : 'bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TAB CONTENT 1: ALL AVAILABLE EVENTS */}
      {activeTab === 'all' && (
        <div>
          {filteredEvents.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-zinc-200">
              <Calendar className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-zinc-700">No events found matching your search</p>
              <p className="text-xs text-zinc-400 mt-1">
                Try selecting "All" categories or clear your search query.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => {
                const remaining = getRemainingSeats(event.id);
                const isRegistered = isStudentRegistered(event.id);
                const isFull = remaining === 0;
                const attendees = getEventRegistrations(event.id);
                const percentFilled = Math.min(100, Math.round((attendees.length / event.maxSeats) * 100));

                return (
                  <div
                    key={event.id}
                    className={`bg-white rounded-2xl p-5 border shadow-xs transition-all flex flex-col justify-between ${
                      isRegistered
                        ? 'border-emerald-300 ring-2 ring-emerald-500/10'
                        : isFull
                        ? 'border-zinc-200 opacity-90'
                        : 'border-zinc-200 hover:border-indigo-300'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                          {event.category || 'General'}
                        </span>

                        {isRegistered ? (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" />
                            Registered
                          </span>
                        ) : isFull ? (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            Seats Full
                          </span>
                        ) : remaining <= 3 ? (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                            Only {remaining} {remaining === 1 ? 'seat' : 'seats'} left!
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            {remaining} seats open
                          </span>
                        )}
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-base font-bold text-zinc-900 leading-snug">
                        {event.name}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-2 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>

                      {/* Event Logistics Info */}
                      <div className="mt-4 pt-3 border-t border-zinc-100 space-y-1.5 text-xs text-zinc-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="font-medium text-zinc-800">{event.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span>{event.time}</span>
                        </div>
                        {event.venue && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span className="truncate">{event.venue}</span>
                          </div>
                        )}
                      </div>

                      {/* Live Seat Capacity Bar */}
                      <div className="mt-4 space-y-1.5 bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-600 font-medium">Available Seats:</span>
                          <span
                            className={`font-mono font-bold ${
                              isFull ? 'text-rose-600' : 'text-zinc-900'
                            }`}
                          >
                            {remaining} / {event.maxSeats}
                          </span>
                        </div>

                        <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isFull
                                ? 'bg-rose-500'
                                : percentFilled > 75
                                ? 'bg-amber-500'
                                : 'bg-emerald-600'
                            }`}
                            style={{ width: `${percentFilled}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-5 pt-3 border-t border-zinc-100">
                      {isRegistered ? (
                        <button
                          disabled
                          className="w-full py-2.5 px-4 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-default"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Already Registered</span>
                        </button>
                      ) : isFull ? (
                        <button
                          disabled
                          className="w-full py-2.5 px-4 bg-zinc-100 text-zinc-400 border border-zinc-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed"
                        >
                          <XCircle className="w-4 h-4 text-zinc-400" />
                          <span>Registration Closed (0 Seats)</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRegister(event.id, event.name)}
                          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5"
                        >
                          <Ticket className="w-4 h-4" />
                          <span>Register for Event</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: MY CONFIRMED REGISTRATIONS */}
      {activeTab === 'my-events' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-900">
              My Event Passes ({studentRegistrations.length})
            </h2>
            <span className="text-xs text-zinc-500">
              Confirmed seat reservations under {currentUser?.name}
            </span>
          </div>

          {studentRegistrations.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-zinc-200">
              <Ticket className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-zinc-700">You haven't registered for any events yet</p>
              <p className="text-xs text-zinc-400 mt-1">
                Switch to the "Available Events" tab to find and reserve seats for upcoming college events.
              </p>
              <button
                onClick={() => setActiveTab('all')}
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Browse Events Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studentRegistrations.map((reg) => (
                <div
                  key={reg.id}
                  className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-zinc-300 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                        Pass ID: {reg.id.slice(0, 14)}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" />
                        Confirmed Seat
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-zinc-900 mt-2">{reg.eventName}</h3>

                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-zinc-100 text-xs text-zinc-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span>{reg.eventDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span>{reg.eventTime}</span>
                      </div>
                      {reg.eventVenue && (
                        <div className="col-span-2 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="truncate">{reg.eventVenue}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                    <span className="text-zinc-400">
                      Booked on {new Date(reg.registeredAt).toLocaleDateString()}
                    </span>

                    <button
                      onClick={() => handleCancel(reg.id, reg.eventName)}
                      className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-2.5 py-1 rounded hover:bg-rose-50 transition-colors"
                    >
                      Cancel Pass
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
