import { createClient } from '@supabase/supabase-js'

// Find these in your Supabase project settings → API
const SUPABASE_URL = "https://sodyadtrlbwfjaebncqf.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZHlhZHRybGJ3ZmphZWJuY3FmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMTY1MjEsImV4cCI6MjA3NDg5MjUyMX0.HKlEDPazD6qk0AiXcnLhfsKHjoUgVgKKoSB2-0m_-Ic"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
