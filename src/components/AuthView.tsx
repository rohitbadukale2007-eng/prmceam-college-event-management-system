import React, { useState } from 'react';
import { useEventContext, EMAIL_REGEX, PHONE_REGEX, ROLL_NUMBER_REGEX } from '../context/EventContext';
import { UserRole } from '../types';
import { Shield, GraduationCap, ArrowRight, UserPlus, LogIn, Lock, Mail, Phone, Hash, Building2, User, KeyRound } from 'lucide-react';

interface AuthViewProps {
  onShowToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onShowToast }) => {
  const { login, registerStudent, registerAdmin } = useEventContext();

  // Active portal role: 'student' or 'admin'
  const [activePortal, setActivePortal] = useState<UserRole>('student');
  // Mode: 'login' or 'register'
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form fields
  const [name, setName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [adminSecretKey, setAdminSecretKey] = useState('');

  // Inline format error state
  const [emailFormatError, setEmailFormatError] = useState('');
  const [rollFormatError, setRollFormatError] = useState('');
  const [phoneFormatError, setPhoneFormatError] = useState('');

  // Real-time email validation
  const handleEmailChange = (val: string, isRegister: boolean) => {
    if (isRegister) {
      setRegisterEmail(val);
    } else {
      setLoginEmail(val);
    }

    if (val.trim() && !EMAIL_REGEX.test(val.trim())) {
      setEmailFormatError('Please enter a valid email format (e.g., student@college.edu)');
    } else {
      setEmailFormatError('');
    }
  };

  // Real-time roll number validation
  const handleRollChange = (val: string) => {
    setRollNumber(val);
    if (val.trim() && !ROLL_NUMBER_REGEX.test(val.trim())) {
      setRollFormatError('Roll number should be 3-20 letters/digits/hyphens (e.g., CS-2024-042)');
    } else {
      setRollFormatError('');
    }
  };

  // Real-time phone validation
  const handlePhoneChange = (val: string) => {
    setContactNumber(val);
    if (val.trim() && !PHONE_REGEX.test(val.trim())) {
      setPhoneFormatError('Please enter a valid 10-digit contact number');
    } else {
      setPhoneFormatError('');
    }
  };

  // Handle Login submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginEmail.trim()) {
      onShowToast('error', 'Please enter your email address.');
      return;
    }

    if (!EMAIL_REGEX.test(loginEmail.trim())) {
      onShowToast('error', 'Invalid email address format.');
      return;
    }

    if (!loginPassword) {
      onShowToast('error', 'Please enter your password.');
      return;
    }

    const res = login(loginEmail, loginPassword, activePortal);
    if (res.success) {
      onShowToast('success', res.message);
    } else {
      onShowToast('error', res.message);
    }
  };

  // Handle Register submission
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      onShowToast('error', 'Full Name is required.');
      return;
    }

    if (!EMAIL_REGEX.test(registerEmail.trim())) {
      onShowToast('error', 'Please enter a valid email address (e.g., user@college.edu).');
      return;
    }

    if (activePortal === 'student') {
      if (!rollNumber.trim() || !ROLL_NUMBER_REGEX.test(rollNumber.trim())) {
        onShowToast('error', 'Valid student Roll Number is required (e.g. CS-2024-042).');
        return;
      }

      if (contactNumber.trim() && !PHONE_REGEX.test(contactNumber.trim())) {
        onShowToast('error', 'Please enter a valid 10-digit mobile number.');
        return;
      }

      if (!registerPassword || registerPassword.length < 4) {
        onShowToast('error', 'Password must be at least 4 characters long.');
        return;
      }

      const res = registerStudent({
        name: name.trim(),
        email: registerEmail.trim(),
        rollNumber: rollNumber.trim(),
        contactNumber: contactNumber.trim() || undefined,
        department: department.trim() || undefined,
        password: registerPassword,
      });

      if (res.success) {
        onShowToast('success', res.message);
      } else {
        onShowToast('error', res.message);
      }
    } else {
      // Admin registration
      if (!adminSecretKey.trim()) {
        onShowToast('error', 'Admin Authorization Secret Key is required to create an admin account.');
        return;
      }

      if (!registerPassword || registerPassword.length < 4) {
        onShowToast('error', 'Password must be at least 4 characters long.');
        return;
      }

      const res = registerAdmin({
        name: name.trim(),
        email: registerEmail.trim(),
        department: department.trim() || undefined,
        password: registerPassword,
        adminSecretKey: adminSecretKey.trim(),
      });

      if (res.success) {
        onShowToast('success', res.message);
      } else {
        onShowToast('error', res.message);
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-zinc-900 text-white p-6 text-center">
          <h1 className="text-xl font-bold tracking-tight">PRMCEAM Event Registration Portal</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Secure Authentication & Access Management
          </p>

          {/* Portal Switcher: Student Portal vs Admin Portal */}
          <div className="grid grid-cols-2 gap-2 mt-5">
            <button
              type="button"
              onClick={() => {
                setActivePortal('student');
                setEmailFormatError('');
                setRollFormatError('');
                setPhoneFormatError('');
              }}
              className={`p-2.5 rounded-xl border font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
                activePortal === 'student'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Portal</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActivePortal('admin');
                setEmailFormatError('');
                setRollFormatError('');
                setPhoneFormatError('');
              }}
              className={`p-2.5 rounded-xl border font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
                activePortal === 'admin'
                  ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>

        {/* Mode Selector (Login vs Register) */}
        <div className="px-6 pt-5 pb-3 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              {activePortal === 'student' ? 'Student Access' : 'Administrator Access'}
            </span>
            <h2 className="text-base font-bold text-zinc-900">
              {mode === 'login' ? 'Account Login' : 'Create New Account'}
            </h2>
          </div>

          <div className="inline-flex bg-zinc-100 p-1 rounded-lg border border-zinc-200">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
                mode === 'login'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <LogIn className="w-3 h-3" />
              <span>Login</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
                mode === 'register'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <UserPlus className="w-3 h-3" />
              <span>Register</span>
            </button>
          </div>
        </div>

        {/* Portal Notice */}
        <div className="px-6 pt-3">
          {activePortal === 'admin' ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
              <Shield className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">Admin Restricted Area:</strong> Only faculty and authorized event coordinators can log in. Students must use the Student Portal.
              </div>
            </div>
          ) : (
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-start gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">Student Portal:</strong> View upcoming campus events and reserve your seats with your college credentials.
              </div>
            </div>
          )}
        </div>

        {/* Form Body */}
        <div className="p-6">
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  {activePortal === 'admin' ? 'Admin Email Address' : 'Student College Email'} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder={
                      activePortal === 'admin' ? 'admin@college.edu' : 'student@college.edu'
                    }
                    value={loginEmail}
                    onChange={(e) => handleEmailChange(e.target.value, false)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                  />
                </div>
                {emailFormatError && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{emailFormatError}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Enter account password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm text-white shadow-xs transition-colors flex items-center justify-center gap-2 ${
                  activePortal === 'admin'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                <span>Log In as {activePortal === 'admin' ? 'Administrator' : 'Student'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  College Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="name@college.edu"
                    value={registerEmail}
                    onChange={(e) => handleEmailChange(e.target.value, true)}
                    className="w-full pl-9 pr-3.5 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                  />
                </div>
                {emailFormatError && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{emailFormatError}</p>
                )}
              </div>

              {activePortal === 'student' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Roll Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Hash className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="CS-2024-042"
                        value={rollNumber}
                        onChange={(e) => handleRollChange(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 uppercase"
                      />
                    </div>
                    {rollFormatError && (
                      <p className="text-[10px] text-rose-600 mt-1 font-medium leading-tight">{rollFormatError}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Contact Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        placeholder="9876543210"
                        value={contactNumber}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 font-mono"
                      />
                    </div>
                    {phoneFormatError && (
                      <p className="text-[10px] text-rose-600 mt-1 font-medium leading-tight">{phoneFormatError}</p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Department / Branch
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. Computer Science & Engineering"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Create Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="At least 4 characters"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-white border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              {activePortal === 'admin' && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Admin Authorization Secret Key <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-amber-600 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="Enter Admin Passkey"
                      value={adminSecretKey}
                      onChange={(e) => setAdminSecretKey(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 bg-white border border-amber-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Authorization key is required to register faculty administrators.
                  </p>
                </div>
              )}

              <button
                type="submit"
                className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm text-white shadow-xs transition-colors flex items-center justify-center gap-2 mt-2 ${
                  activePortal === 'admin'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                <span>Register {activePortal === 'admin' ? 'Admin' : 'Student'} Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
