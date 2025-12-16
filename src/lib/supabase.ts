/**
 * Supabase Client Configuration
 * MITHAS GLOW - Beauty & Fashion Marketplace
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Environment variables - safely access with fallback
const supabaseUrl = typeof import.meta !== 'undefined' && import.meta.env 
  ? (import.meta.env.VITE_SUPABASE_URL || '') 
  : '';
const supabaseAnonKey = typeof import.meta !== 'undefined' && import.meta.env 
  ? (import.meta.env.VITE_SUPABASE_ANON_KEY || '') 
  : '';

// Create Supabase client with safe defaults
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
  global: {
    headers: {
      'X-Client-Info': 'mithas-glow-web',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Auth helpers
export const auth = {
  /**
   * Sign up with email and password
   */
  signUp: async (email: string, password: string, metadata?: Record<string, any>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { data, error };
  },

  /**
   * Sign in with email and password
   */
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  /**
   * Sign in with phone and OTP
   */
  signInWithPhone: async (phone: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
    });
    return { data, error };
  },

  /**
   * Verify OTP
   */
  verifyOTP: async (phone: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });
    return { data, error };
  },

  /**
   * Sign out
   */
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  /**
   * Get current session
   */
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    return { data, error };
  },

  /**
   * Get current user
   */
  getUser: async () => {
    const { data, error } = await supabase.auth.getUser();
    return { data, error };
  },

  /**
   * Reset password
   */
  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { data, error };
  },

  /**
   * Update password
   */
  updatePassword: async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { data, error };
  },
};

// Storage helpers
export const storage = {
  /**
   * Upload file to storage
   */
  upload: async (
    bucket: string,
    path: string,
    file: File,
    options?: { cacheControl?: string; upsert?: boolean }
  ) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, options);
    return { data, error };
  },

  /**
   * Get public URL for file
   */
  getPublicUrl: (bucket: string, path: string) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  /**
   * Delete file from storage
   */
  delete: async (bucket: string, paths: string[]) => {
    const { data, error } = await supabase.storage.from(bucket).remove(paths);
    return { data, error };
  },

  /**
   * List files in bucket
   */
  list: async (bucket: string, path?: string) => {
    const { data, error } = await supabase.storage.from(bucket).list(path);
    return { data, error };
  },
};

// Real-time helpers
export const realtime = {
  /**
   * Subscribe to table changes
   */
  subscribe: (
    table: string,
    callback: (payload: any) => void,
    filter?: string
  ) => {
    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: filter,
        },
        callback
      )
      .subscribe();

    return channel;
  },

  /**
   * Unsubscribe from channel
   */
  unsubscribe: async (channel: any) => {
    await supabase.removeChannel(channel);
  },
};

// Database query helpers
export const db = {
  /**
   * Execute a query
   */
  from: <T extends keyof Database['public']['Tables']>(table: T) => {
    return supabase.from(table);
  },

  /**
   * Execute RPC function
   */
  rpc: <T extends keyof Database['public']['Functions']>(
    fn: T,
    params?: Database['public']['Functions'][T]['Args']
  ) => {
    return supabase.rpc(fn, params);
  },
};

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && 
            supabaseAnonKey && 
            supabaseUrl !== 'https://placeholder.supabase.co' &&
            supabaseAnonKey !== 'placeholder-key');
};

// Helper to get configuration status
export const getSupabaseStatus = () => {
  const configured = isSupabaseConfigured();
  return {
    configured,
    url: supabaseUrl,
    hasKey: !!supabaseAnonKey,
    message: configured 
      ? '✅ Supabase is configured and ready' 
      : '⚠️ Supabase is not configured. Please add credentials to .env.local'
  };
};

export default supabase;
