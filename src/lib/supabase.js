import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://bgalouzqjxyacqegfuky.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnYWxvdXpxanh5YWNxZWdmdWt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5NzU5NzQsImV4cCI6MjA1MzU1MTk3NH0.sb_publishable_b4BvkygaMYsfmW0kc5wFRA_AFZF7Tf1'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)