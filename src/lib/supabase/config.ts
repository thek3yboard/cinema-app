export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

// Email/password authentication remains available in the codebase, but is off by
// default while the project uses Supabase's rate-limited SMTP service.
export const isEmailAuthEnabled = process.env.NEXT_PUBLIC_ENABLE_EMAIL_AUTH === 'true';

export function requireSupabaseConfig() {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.');
  }

  return { supabaseUrl, supabasePublishableKey };
}
