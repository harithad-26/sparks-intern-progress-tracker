import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://bgalouzqjxyacqegfuky.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnYWxvdXpxanh5YWNxZWdmdWt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMDYzODIsImV4cCI6MjA4NDg4MjM4Mn0.eaB1aEiRibdq0JCsubFhEWN5iq-uLKvw4KIHBf-AxGM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)