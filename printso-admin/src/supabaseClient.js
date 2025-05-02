// src/supabaseClient.js (for printso-admin)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_KEY;

// Basic check if variables are loaded (especially important for deployment)
if (!supabaseUrl || !supabaseServiceKey) {
    console.error(
        "Supabase URL or Service Key is missing. " +
        "Ensure .env file exists locally or environment variables are set in deployment."
    );
    // Optionally throw an error or display a message in the app UI
} else {
    console.log("Admin Supabase client initializing..."); // Confirm initialization attempt
}

// Initialize Supabase client using the SERVICE KEY for admin privileges
export const supabase = createClient(supabaseUrl, supabaseServiceKey);