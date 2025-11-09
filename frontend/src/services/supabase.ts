import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Generate a unique session ID for the user
export function generateSessionId(): string {
  const stored = localStorage.getItem('sessionId');
  if (stored) return stored;
  
  const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('sessionId', newId);
  return newId;
}

// Get current session ID
export function getSessionId(): string {
  return generateSessionId();
}

// Clear session (for logout/reset)
export function clearSession(): void {
  localStorage.removeItem('sessionId');
}