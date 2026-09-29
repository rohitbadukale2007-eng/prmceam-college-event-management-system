import React from 'react';
import { CollegeEvent } from '../types';
import { useEventContext } from '../context/EventContext';
import { X, Users, Calendar, MapPin, Clock, UserCheck } from 'lucide-react';

interface AttendeeModalProps {
  event: CollegeEvent | null;
  onClose: () => void;
}

export const AttendeeModal: React.FC<AttendeeModalProps> = ({ event, onClose }) => {
  const { getEventRegistrations, getRemainingSeats } = useEventContext();

  if (!event) return null;

  const attendees = getEventRegistrations(event.id);
  const remainingSeats = getRemainingSeats(event.id);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-zinc-200 bg-zinc-50 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                {event.category || 'Event'}
              </span>
              <span className="text-xs text-zinc-500 font-mono">ID: {event.id}</span>
            </div>
            <h2 className="text-lg font-bold text-zinc-900 mt-1">{event.name}</h2>
            
            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-600 mt-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                {event.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                {event.time}
              </span>
              {event.venue && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                  {event.venue}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-1 rounded-lg hover:bg-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Capacity Summary Bar */}
        <div className="px-6 py-3 bg-zinc-100/70 border-b border-zinc-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-zinc-500">Max Capacity: </span>
              <span className="font-bold text-zinc-800">{event.maxSeats} seats</span>
            </div>
            <div>
              <span className="text-zinc-500">Registered: </span>
              <span className="font-bold text-indigo-700">{attendees.length} students</span>
            </div>
            <div>
              <span className="text-zinc-500">Remaining: </span>
              <span
                className={`font-bold ${
                  remainingSeats === 0 ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                {remainingSeats} seats
              </span>
            </div>
          </div>
          <span
            className={`px-2 py-0.5 text-[11px] font-semibold rounded ${
              remainingSeats === 0
                ? 'bg-rose-100 text-rose-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {remainingSeats === 0 ? 'House Full' : 'Seats Available'}
          </span>
        </div>

        {/* Attendee Table */}
        <div className="p-6 overflow-y-auto flex-1">
          <h3 className="text-sm font-bold text-zinc-800 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Registered Attendees List ({attendees.length})</span>
          </h3>

          {attendees.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-xl">
              <Users className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-zinc-600">No students registered yet</p>
              <p className="text-xs text-zinc-400 mt-0.5">
                When students register from their dashboard, they will appear here.
              </p>
            </div>
          ) : (
            <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Roll Number</th>
                    <th className="py-2.5 px-3">Email Address</th>
                    <th className="py-2.5 px-3">Registered At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {attendees.map((attendee, index) => (
                    <tr key={attendee.id} className="hover:bg-zinc-50/60">
                      <td className="py-2.5 px-3 font-mono text-zinc-400">{index + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-zinc-900 flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{attendee.studentName}</span>
                      </td>
                      <td className="py-2.5 px-3 text-zinc-700 font-mono">
                        {attendee.studentRollNumber || 'N/A'}
                      </td>
                      <td className="py-2.5 px-3 text-zinc-600 font-mono">
                        {attendee.studentEmail}
                      </td>
                      <td className="py-2.5 px-3 text-zinc-500">
                        {new Date(attendee.registeredAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <p className="text-xs text-zinc-500">
            Real-time synchronization with active seat limit.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
