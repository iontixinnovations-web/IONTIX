# 🔐 Authentication Integration Guide

**Purpose:** Connect React UI components to Supabase authentication  
**Status:** Step-by-step implementation guide  
**Estimated Time:** 1-2 hours

---

## 📋 Overview

This guide walks through integrating real Supabase authentication into your existing MITHAS GLOW UI components.

### What We're Integrating:
1. ✅ User Registration (Email + Phone)
2. ✅ Login (Email + Phone OTP)
3. ✅ Profile Setup & Management
4. ✅ Session Persistence
5. ✅ Protected Routes
6. ✅ Auth State Management

---

## 🎯 Integration Steps

### Step 1: Update App.tsx to Use Real Auth

**Current State:** Mock authentication with local state  
**Target State:** Real Supabase auth with persistent sessions

#### Changes Required:

```typescript
// /App.tsx

import { useState, useEffect, lazy, Suspense } from "react";
import { useAuth } from "./lib/hooks/useAuth"; // ADD THIS
import { useAuthStore } from "./lib/store"; // ADD THIS
import { toast, Toaster } from "sonner@2.0.3";
import { ErrorBoundary } from "./components/ErrorBoundary";

// ... existing lazy imports ...

function App() {
  // REPLACE mock state with real auth
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [currentView, setCurrentView] = useState<View>(() => {
    // Check if user is authenticated on mount
    return isAuthenticated ? "home" : "register";
  });

  // Listen for auth changes
  useEffect(() => {
    if (isAuthenticated && user) {
      // User logged in - navigate to home
      if (currentView === "register" || currentView === "login" || currentView === "otp") {
        setCurrentView("home");
      }
    } else if (!isAuthenticated && !authLoading) {
      // User logged out - navigate to register
      if (currentView !== "register" && currentView !== "login" && currentView !== "otp") {
        setCurrentView("register");
      }
    }
  }, [isAuthenticated, user, authLoading]);

  // Show loading screen while checking auth
  if (authLoading) {
    return <LoadingScreen />;
  }

  // Rest of your component...
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white">
        <Toaster position="top-center" richColors />
        
        {/* Render views based on currentView */}
        {currentView === "register" && (
          <RegisterView
            onRegisterSuccess={() => setCurrentView("profileSetup")}
            onNavigateToLogin={() => setCurrentView("login")}
          />
        )}
        
        {currentView === "login" && (
          <LoginView
            onLoginSuccess={() => setCurrentView("home")}
            onNavigateToRegister={() => setCurrentView("register")}
            onNavigateToOTP={() => setCurrentView("otp")}
          />
        )}
        
        {/* ... other views ... */}
      </div>
    </ErrorBoundary>
  );
}

export default App;
```

---

### Step 2: Update RegisterView.tsx

**File:** `/components/RegisterView.tsx`

#### Add Supabase Integration:

```typescript
import { useState } from 'react';
import { useAuth } from '../lib/hooks/useAuth';
import { toast } from 'sonner@2.0.3';
import { Eye, EyeOff, Mail, Lock, User, Sparkles } from 'lucide-react';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';

interface RegisterViewProps {
  onRegisterSuccess: () => void;
  onNavigateToLogin: () => void;
}

export function RegisterView({ onRegisterSuccess, onNavigateToLogin }: RegisterViewProps) {
  const { signUp, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '' as 'female' | 'male' | '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Gender validation
    if (!formData.gender) {
      newErrors.gender = 'Please select your gender';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    // Call Supabase signup
    const result = await signUp(formData.email, formData.password, {
      full_name: formData.fullName,
      gender: formData.gender as 'female' | 'male',
      display_name: formData.fullName,
    });

    if (result.success) {
      toast.success('Account created successfully! ✨');
      onRegisterSuccess();
    }
    // Error handling is done in useAuth hook
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl text-gray-900 mb-2">
            Welcome to MITHAS Glow
          </h1>
          <p className="text-gray-600">Create your account to start glowing ✨</p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Full Name
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className={`w-full p-3 border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500`}
              placeholder="Enter your full name"
              disabled={isLoading}
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full p-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500`}
              placeholder="your@email.com"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              <Lock className="w-4 h-4 inline mr-1" />
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full p-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 pr-10`}
                placeholder="Create a strong password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
            {formData.password && (
              <PasswordStrengthIndicator password={formData.password} />
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className={`w-full p-3 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500`}
              placeholder="Re-enter your password"
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Gender Selection */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              I'm shopping for
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, gender: 'female' })}
                className={`p-3 border-2 rounded-lg transition ${
                  formData.gender === 'female'
                    ? 'border-pink-500 bg-pink-50'
                    : 'border-gray-300'
                }`}
                disabled={isLoading}
              >
                <span className="text-2xl mb-1 block">👗</span>
                <span className="text-sm">Women</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, gender: 'male' })}
                className={`p-3 border-2 rounded-lg transition ${
                  formData.gender === 'male'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300'
                }`}
                disabled={isLoading}
              >
                <span className="text-2xl mb-1 block">👔</span>
                <span className="text-sm">Men</span>
              </button>
            </div>
            {errors.gender && (
              <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white p-3 rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Creating Account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>

          {/* Login Link */}
          <div className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="text-pink-500 hover:underline"
              disabled={isLoading}
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

---

### Step 3: Update LoginView.tsx

**File:** `/components/LoginView.tsx`

```typescript
import { useState } from 'react';
import { useAuth } from '../lib/hooks/useAuth';
import { toast } from 'sonner@2.0.3';
import { Mail, Lock, Eye, EyeOff, Sparkles, Phone } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: () => void;
  onNavigateToRegister: () => void;
  onNavigateToOTP: () => void;
}

export function LoginView({ onLoginSuccess, onNavigateToRegister, onNavigateToOTP }: LoginViewProps) {
  const { signIn, isLoading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await signIn(email, password);
    
    if (result.success) {
      toast.success('Welcome back to MITHAS Glow! ✨');
      onLoginSuccess();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">Sign in to continue your glow journey ✨</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500`}
              placeholder="your@email.com"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              <Lock className="w-4 h-4 inline mr-1" />
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full p-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 pr-10`}
                placeholder="Enter your password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white p-3 rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Signing In...
              </span>
            ) : (
              'Sign In'
            )}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Phone OTP Button */}
          <button
            type="button"
            onClick={onNavigateToOTP}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 border-2 border-gray-300 p-3 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            <Phone className="w-5 h-5" />
            Sign in with Phone (OTP)
          </button>

          {/* Register Link */}
          <div className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onNavigateToRegister}
              className="text-pink-500 hover:underline"
              disabled={isLoading}
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

---

### Step 4: Update OTPView.tsx

**File:** `/components/OTPView.tsx`

```typescript
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../lib/hooks/useAuth';
import { toast } from 'sonner@2.0.3';
import { Phone, ArrowLeft } from 'lucide-react';

interface OTPViewProps {
  onVerifySuccess: () => void;
  onNavigateBack: () => void;
}

export function OTPView({ onVerifySuccess, onNavigateBack }: OTPViewProps) {
  const { signInWithPhone, verifyOTP, isLoading } = useAuth();
  
  const [phone, setPhone] = useState('');
  const [otp, setOTP] = useState(['', '', '', '', '', '']);
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic phone validation
    const phoneRegex = /^[+]?[0-9]{10,15}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      toast.error('Please enter a valid phone number');
      return;
    }

    const result = await signInWithPhone(phone);
    
    if (result.success) {
      setShowOTPInput(true);
      setCountdown(60);
      // Focus first OTP input
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }

    const newOTP = [...otp];
    newOTP[index] = value;
    setOTP(newOTP);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      toast.error('Please enter complete OTP');
      return;
    }

    const result = await verifyOTP(phone, otpCode);
    
    if (result.success) {
      toast.success('Phone verified successfully! ✨');
      onVerifySuccess();
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    const result = await signInWithPhone(phone);
    if (result.success) {
      setCountdown(60);
      toast.success('OTP resent!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={onNavigateBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mb-4">
            <Phone className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl text-gray-900 mb-2">
            {showOTPInput ? 'Enter OTP' : 'Sign in with Phone'}
          </h1>
          <p className="text-gray-600">
            {showOTPInput
              ? `We sent a code to ${phone}`
              : 'We'll send you a verification code'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
          {!showOTPInput ? (
            /* Phone Input Form */
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Include country code (e.g., +91 for India)
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white p-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Sending OTP...
                  </span>
                ) : (
                  'Send OTP'
                )}
              </button>
            </form>
          ) : (
            /* OTP Input Form */
            <div className="space-y-6">
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOTPChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none"
                    disabled={isLoading}
                  />
                ))}
              </div>

              {/* Resend OTP */}
              <div className="text-center text-sm">
                {countdown > 0 ? (
                  <p className="text-gray-500">
                    Resend OTP in {countdown}s
                  </p>
                ) : (
                  <button
                    onClick={handleResendOTP}
                    className="text-pink-500 hover:underline"
                    disabled={isLoading}
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <button
                onClick={handleVerifyOTP}
                disabled={isLoading || otp.join('').length !== 6}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white p-3 rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Verifying...
                  </span>
                ) : (
                  'Verify & Continue'
                )}
              </button>

              <button
                onClick={() => {
                  setShowOTPInput(false);
                  setOTP(['', '', '', '', '', '']);
                  setCountdown(0);
                }}
                className="w-full text-gray-600 text-sm hover:text-gray-900"
                disabled={isLoading}
              >
                Change Phone Number
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

### Step 5: Update ProfileSetupView.tsx

**File:** `/components/ProfileSetupView.tsx`

```typescript
import { useState } from 'react';
import { useAuth } from '../lib/hooks/useAuth';
import { toast } from 'sonner@2.0.3';
import { User, MapPin, Calendar, Sparkles } from 'lucide-react';

interface ProfileSetupViewProps {
  onComplete: () => void;
}

export function ProfileSetupView({ onComplete }: ProfileSetupViewProps) {
  const { user, updateProfile, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    displayName: user?.display_name || user?.full_name || '',
    dateOfBirth: user?.date_of_birth || '',
    city: '',
    interests: [] as string[],
  });

  const interestOptions = [
    'Fashion', 'Makeup', 'Skincare', 'Jewelry', 'Sarees',
    'Lehengas', 'Western Wear', 'Footwear', 'Accessories'
  ];

  const toggleInterest = (interest: string) => {
    if (formData.interests.includes(interest)) {
      setFormData({
        ...formData,
        interests: formData.interests.filter(i => i !== interest),
      });
    } else if (formData.interests.length < 5) {
      setFormData({
        ...formData,
        interests: [...formData.interests, interest],
      });
    } else {
      toast.info('You can select up to 5 interests');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.displayName) {
      toast.error('Display name is required');
      return;
    }

    const result = await updateProfile({
      display_name: formData.displayName,
      date_of_birth: formData.dateOfBirth || null,
      // Store interests in metadata or separate table
    });

    if (result.success) {
      toast.success('Profile setup complete! 🎉');
      onComplete();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl text-gray-900 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-gray-600">Let's personalize your experience ✨</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
          {/* Display Name */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Display Name
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="How should we call you?"
              disabled={isLoading}
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date of Birth (Optional)
            </label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              disabled={isLoading}
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              City (Optional)
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="e.g., Mumbai, Delhi, Bangalore"
              disabled={isLoading}
            />
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Your Interests (Select up to 5)
            </label>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-3 py-1.5 rounded-full text-sm transition ${
                    formData.interests.includes(interest)
                      ? 'bg-pink-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  disabled={isLoading}
                >
                  {interest}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Selected: {formData.interests.length}/5
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white p-3 rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </span>
            ) : (
              'Complete Setup'
            )}
          </button>

          {/* Skip Button */}
          <button
            type="button"
            onClick={onComplete}
            className="w-full text-gray-600 text-sm hover:text-gray-900"
            disabled={isLoading}
          >
            Skip for now
          </button>
        </form>
      </div>
    </div>
  );
}
```

---

## ✅ Testing Checklist

After implementing these changes:

### 1. Registration Flow
- [ ] User can create account with email
- [ ] Validation errors display correctly
- [ ] Password strength indicator works
- [ ] Gender selection works
- [ ] Success toast appears
- [ ] Profile is created in database
- [ ] User redirected to profile setup

### 2. Login Flow
- [ ] User can login with email/password
- [ ] Error handling works
- [ ] Success toast appears
- [ ] User redirected to home
- [ ] Session persists on refresh

### 3. OTP Flow
- [ ] Phone number validation works
- [ ] OTP is sent successfully
- [ ] OTP input auto-focuses
- [ ] Resend OTP works after countdown
- [ ] OTP verification succeeds
- [ ] User redirected to home/profile setup

### 4. Profile Setup
- [ ] Display name updates
- [ ] Date of birth saves
- [ ] Interests selection works
- [ ] Profile updates in database
- [ ] User redirected to home

### 5. Session Management
- [ ] User stays logged in on refresh
- [ ] Logout works correctly
- [ ] Protected routes work
- [ ] Auth state syncs across tabs

---

## 🚀 Next Steps

1. **Test thoroughly:** Use the checklist above
2. **Add protected routes:** Wrap components in auth guards
3. **Implement product CRUD:** Connect shop to Supabase
4. **Enable real-time features:** Add subscriptions for chat/notifications
5. **Deploy:** Set up production environment variables

---

**Ready to proceed with product management integration?** Let me know and I'll create the next guide! 🎯
