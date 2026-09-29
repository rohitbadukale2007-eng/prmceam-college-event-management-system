import React, { createContext, useContext, useState, useEffect } from 'react';
import { CollegeEvent, Registration, User, UserRole } from '../types';
import { INITIAL_EVENTS, INITIAL_REGISTRATIONS, INITIAL_USERS } from '../data/mockData';

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const PHONE_REGEX = /^(\+?[0-9]{1,3}[- ]?)?[0-9]{10}$/;
export const ROLL_NUMBER_REGEX = /^[a-zA-Z0-9\-_/]{3,20}$/;

// Secret authorization key required for creating new Admin accounts
export const ADMIN_SECRET_KEY = 'ADMIN@PRMCEAM2026';

interface EventContextType {
  currentUser: User | null;
  users: User[];
  events: CollegeEvent[];
  registrations: Registration[];
  login: (email: string, password: string, portalRole: UserRole) => { success: boolean; message: string };
  registerStudent: (data: {
    name: string;
    email: string;
    rollNumber: string;
    contactNumber?: string;
    department?: string;
    password: string;
  }) => { success: boolean; message: string };
  registerAdmin: (data: {
    name: string;
    email: string;
    department?: string;
    password: string;
    adminSecretKey: string;
  }) => { success: boolean; message: string };
  logout: () => void;
  createEvent: (eventData: {
    name: string;
    date: string;
    time: string;
    maxSeats: number;
    venue?: string;
    category?: 'Technical' | 'Cultural' | 'Workshop' | 'Seminar' | 'Sports';
    description?: string;
  }) => { success: boolean; message: string };
  deleteEvent: (eventId: string) => { success: boolean; message: string };
  registerForEvent: (eventId: string) => { success: boolean; message: string };
  cancelRegistration: (registrationId: string) => { success: boolean; message: string };
  getEventRegistrations: (eventId: string) => Registration[];
  getRemainingSeats: (eventId: string) => number;
  isStudentRegistered: (eventId: string, studentId?: string) => boolean;
}

const STORAGE_KEY_USERS = 'prmceam_users_v2';
const STORAGE_KEY_EVENTS = 'prmceam_events_v2';
const STORAGE_KEY_REGISTRATIONS = 'prmceam_registrations_v2';
const STORAGE_KEY_CURRENT_USER = 'prmceam_current_user_v2';

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize users
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USERS);
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  // Initialize events
  const [events, setEvents] = useState<CollegeEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EVENTS);
      return saved ? JSON.parse(saved) : INITIAL_EVENTS;
    } catch {
      return INITIAL_EVENTS;
    }
  });

  // Initialize registrations
  const [registrations, setRegistrations] = useState<Registration[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REGISTRATIONS);
      return saved ? JSON.parse(saved) : INITIAL_REGISTRATIONS;
    } catch {
      return INITIAL_REGISTRATIONS;
    }
  });

  // Initialize current user
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_REGISTRATIONS, JSON.stringify(registrations));
  }, [registrations]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    }
  }, [currentUser]);

  // Strict Login Authorization
  const login = (email: string, password: string, portalRole: UserRole): { success: boolean; message: string } => {
    const cleanEmail = email.trim().toLowerCase();
    
    // Validate email format
    if (!EMAIL_REGEX.test(cleanEmail)) {
      return {
        success: false,
        message: 'Invalid email format. Please enter a valid email (e.g. name@college.edu).',
      };
    }

    if (!password) {
      return {
        success: false,
        message: 'Password is required to log in.',
      };
    }

    // Find account by email
    const account = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!account) {
      return {
        success: false,
        message: `Account not found with email "${cleanEmail}". Please check your email or register.`,
      };
    }

    // Strict Role Authorization:
    // If student tries to login on admin portal
    if (portalRole === 'admin' && account.role !== 'admin') {
      return {
        success: false,
        message: 'Access Denied: This account is registered as a Student. Only authorized Administrators can access this portal.',
      };
    }

    // If admin tries to login on student portal
    if (portalRole === 'student' && account.role !== 'student') {
      return {
        success: false,
        message: 'Access Denied: This is an Administrator account. Please use the Admin login portal.',
      };
    }

    // Strict Password Validation
    if (account.password && account.password !== password) {
      return {
        success: false,
        message: 'Invalid credentials. The password you entered is incorrect.',
      };
    }

    setCurrentUser(account);
    return {
      success: true,
      message: `Welcome back, ${account.name}! Authenticated as ${account.role.toUpperCase()}.`,
    };
  };

  // Strict Student Registration
  const registerStudent = (data: {
    name: string;
    email: string;
    rollNumber: string;
    contactNumber?: string;
    department?: string;
    password: string;
  }): { success: boolean; message: string } => {
    const cleanName = data.name.trim();
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanRoll = data.rollNumber.trim().toUpperCase();
    const cleanContact = data.contactNumber ? data.contactNumber.trim() : '';

    if (!cleanName || cleanName.length < 2) {
      return { success: false, message: 'Please enter a valid full name (at least 2 characters).' };
    }

    // Email format validation
    if (!EMAIL_REGEX.test(cleanEmail)) {
      return { success: false, message: 'Invalid email format. Please provide a valid email (e.g. student@college.edu).' };
    }

    // Roll number format validation
    if (!cleanRoll || !ROLL_NUMBER_REGEX.test(cleanRoll)) {
      return {
        success: false,
        message: 'Invalid Roll Number format. Use alphanumeric characters and hyphens (e.g. CS-2024-042).',
      };
    }

    // Contact number validation (if provided)
    if (cleanContact && !PHONE_REGEX.test(cleanContact)) {
      return {
        success: false,
        message: 'Invalid phone number format. Please provide a 10-digit mobile number.',
      };
    }

    // Password validation
    if (!data.password || data.password.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters long.' };
    }

    // Duplicate email check
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return {
        success: false,
        message: `An account is already registered with email "${cleanEmail}". Please log in.`,
      };
    }

    // Duplicate roll number check
    const existingRoll = users.find((u) => u.rollNumber?.toUpperCase() === cleanRoll);
    if (existingRoll) {
      return {
        success: false,
        message: `Roll Number "${cleanRoll}" is already registered by another student.`,
      };
    }

    const newStudent: User = {
      id: `usr-std-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      role: 'student',
      rollNumber: cleanRoll,
      contactNumber: cleanContact || undefined,
      department: data.department?.trim() || 'Engineering',
      password: data.password,
    };

    setUsers((prev) => [...prev, newStudent]);
    setCurrentUser(newStudent);

    return {
      success: true,
      message: `Registration successful! Welcome to the student portal, ${cleanName}.`,
    };
  };

  // Strict Admin Registration (requires security passkey)
  const registerAdmin = (data: {
    name: string;
    email: string;
    department?: string;
    password: string;
    adminSecretKey: string;
  }): { success: boolean; message: string } => {
    const cleanName = data.name.trim();
    const cleanEmail = data.email.trim().toLowerCase();

    if (!cleanName || cleanName.length < 2) {
      return { success: false, message: 'Please enter a valid administrator name.' };
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return { success: false, message: 'Invalid email format. Please provide a valid email (e.g. admin@college.edu).' };
    }

    // Strict Admin Authorization Key check
    if (data.adminSecretKey.trim() !== ADMIN_SECRET_KEY) {
      return {
        success: false,
        message: 'Invalid Admin Authorization Secret Key. Contact college administration for the key.',
      };
    }

    if (!data.password || data.password.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters long.' };
    }

    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return {
        success: false,
        message: `An account is already registered with email "${cleanEmail}". Please log in.`,
      };
    }

    const newAdmin: User = {
      id: `usr-adm-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      role: 'admin',
      department: data.department?.trim() || 'College Administration',
      password: data.password,
    };

    setUsers((prev) => [...prev, newAdmin]);
    setCurrentUser(newAdmin);

    return {
      success: true,
      message: `Admin account created successfully! Welcome, ${cleanName}.`,
    };
  };

  // Logout
  const logout = () => {
    setCurrentUser(null);
  };

  // Remaining seats calculation
  const getRemainingSeats = (eventId: string): number => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return 0;
    const confirmedCount = registrations.filter((r) => r.eventId === eventId).length;
    const remaining = event.maxSeats - confirmedCount;
    return remaining > 0 ? remaining : 0;
  };

  // Check if student is already registered for an event
  const isStudentRegistered = (eventId: string, studentId?: string): boolean => {
    const targetStudentId = studentId || currentUser?.id;
    if (!targetStudentId) return false;
    return registrations.some(
      (r) => r.eventId === eventId && r.studentId === targetStudentId
    );
  };

  // Get attendee list for a specific event
  const getEventRegistrations = (eventId: string): Registration[] => {
    return registrations.filter((r) => r.eventId === eventId);
  };

  // Admin: Create Event with strict number and field validation
  const createEvent = (eventData: {
    name: string;
    date: string;
    time: string;
    maxSeats: number;
    venue?: string;
    category?: 'Technical' | 'Cultural' | 'Workshop' | 'Seminar' | 'Sports';
    description?: string;
  }): { success: boolean; message: string } => {
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, message: 'Unauthorized: Only administrators can create events.' };
    }

    // Required fields check
    if (!eventData.name.trim()) {
      return { success: false, message: 'Event name is required.' };
    }
    if (!eventData.date.trim()) {
      return { success: false, message: 'Event date is required.' };
    }
    if (!eventData.time.trim()) {
      return { success: false, message: 'Event time is required.' };
    }

    // Number format validation: Maximum capacity must be a positive integer >= 1
    const capacityNum = Number(eventData.maxSeats);
    if (isNaN(capacityNum) || !Number.isInteger(capacityNum) || capacityNum < 1) {
      return {
        success: false,
        message: 'Invalid capacity. Maximum seats must be a positive whole number greater than 0.',
      };
    }

    if (capacityNum > 10000) {
      return {
        success: false,
        message: 'Maximum seat capacity cannot exceed 10,000.',
      };
    }

    const newEvent: CollegeEvent = {
      id: `evt-${Date.now()}`,
      name: eventData.name.trim(),
      date: eventData.date,
      time: eventData.time.trim(),
      maxSeats: capacityNum,
      venue: eventData.venue?.trim() || 'College Campus',
      category: eventData.category || 'Technical',
      description: eventData.description?.trim() || 'No description provided.',
      createdBy: currentUser.name,
      createdAt: new Date().toISOString(),
    };

    setEvents((prev) => [newEvent, ...prev]);
    return { success: true, message: `Event "${newEvent.name}" published with ${capacityNum} seats capacity.` };
  };

  // Admin: Delete Event
  const deleteEvent = (eventId: string): { success: boolean; message: string } => {
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, message: 'Unauthorized: Only admins can delete events.' };
    }

    const eventToDelete = events.find((e) => e.id === eventId);
    if (!eventToDelete) {
      return { success: false, message: 'Event not found.' };
    }

    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    setRegistrations((prev) => prev.filter((r) => r.eventId !== eventId));

    return {
      success: true,
      message: `Event "${eventToDelete.name}" and its registration records were deleted.`,
    };
  };

  // Student: Register for Event
  const registerForEvent = (eventId: string): { success: boolean; message: string } => {
    if (!currentUser || currentUser.role !== 'student') {
      return { success: false, message: 'Please log in as a student to register for events.' };
    }

    const event = events.find((e) => e.id === eventId);
    if (!event) {
      return { success: false, message: 'Event not found.' };
    }

    // Edge Case 1: Check duplicate registration attempt
    if (isStudentRegistered(eventId, currentUser.id)) {
      return {
        success: false,
        message: 'Duplicate Registration: You have already registered for this event.',
      };
    }

    // Edge Case 2: Check remaining seats
    const remainingSeats = getRemainingSeats(eventId);
    if (remainingSeats <= 0) {
      return {
        success: false,
        message: 'Registration Closed: All seats for this event are fully booked (0 seats remaining).',
      };
    }

    const newRegistration: Registration = {
      id: `reg-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      eventId: event.id,
      eventName: event.name,
      eventDate: event.date,
      eventTime: event.time,
      eventVenue: event.venue,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentEmail: currentUser.email,
      studentRollNumber: currentUser.rollNumber,
      studentContact: currentUser.contactNumber,
      registeredAt: new Date().toISOString(),
    };

    setRegistrations((prev) => [newRegistration, ...prev]);

    return {
      success: true,
      message: `Registration confirmed for "${event.name}"! 1 seat allocated.`,
    };
  };

  // Student: Cancel Registration
  const cancelRegistration = (registrationId: string): { success: boolean; message: string } => {
    if (!currentUser) {
      return { success: false, message: 'You must be logged in to cancel a registration.' };
    }

    const reg = registrations.find((r) => r.id === registrationId);
    if (!reg) {
      return { success: false, message: 'Registration record not found.' };
    }

    if (currentUser.role !== 'admin' && reg.studentId !== currentUser.id) {
      return { success: false, message: 'Unauthorized action.' };
    }

    setRegistrations((prev) => prev.filter((r) => r.id !== registrationId));

    return {
      success: true,
      message: `Registration for "${reg.eventName}" cancelled. Available seats updated (+1 seat).`,
    };
  };

  return (
    <EventContext.Provider
      value={{
        currentUser,
        users,
        events,
        registrations,
        login,
        registerStudent,
        registerAdmin,
        logout,
        createEvent,
        deleteEvent,
        registerForEvent,
        cancelRegistration,
        getEventRegistrations,
        getRemainingSeats,
        isStudentRegistered,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEventContext = (): EventContextType => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEventContext must be used within an EventProvider');
  }
  return context;
};
