import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

/**
 * The one and only Supabase client for the whole app.
 *
 * Creating more than one client makes several GoTrueClient instances fight over
 * the same auth storage key. One of them signs in, the others never learn about
 * the session and send requests as the anonymous role, which row level security
 * rejects (this is what broke order history).
 */
export const supabase: SupabaseClient = createClient(
  environment.supabaseUrl,
  environment.supabasePublishableKey,
);
