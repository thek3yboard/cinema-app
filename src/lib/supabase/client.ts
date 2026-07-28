import { createBrowserClient } from '@supabase/ssr';
import { requireSupabaseConfig } from './config';

let browserClient: ReturnType<typeof createBrowserClient> | undefined;

export function createClient() {
  if (!browserClient) {
    const { supabaseUrl, supabasePublishableKey } = requireSupabaseConfig();
    browserClient = createBrowserClient(supabaseUrl, supabasePublishableKey);
  }

  return browserClient;
}
