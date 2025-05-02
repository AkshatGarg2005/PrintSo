// printso-client/src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Compare these values character-by-character with what you pasted
const supabaseUrl = 'https://vhaxeqkycadhbmrdpxfc.supabase.co'; // Use the URL you provided
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoYXhlcWt5Y2FkaGJtcmRweGZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxOTA1NTcsImV4cCI6MjA2MTc2NjU1N30.AOAAZC_0U2OMjMn6c2TchOviIxvZrCq1evxU1dEJAtQ'; // Use the anon key you provided

// Check for typos, extra spaces, or missing characters!

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("CRITICAL: Supabase URL or Anon Key is missing in supabaseClient.js!");
} else {
    console.log("Supabase client initialized with URL:", supabaseUrl.substring(0, 20) + "...");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);