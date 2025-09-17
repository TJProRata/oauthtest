import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables before checking them
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.log('Current directory:', __dirname)
  console.log('Looking for .env at:', path.resolve(__dirname, '../../.env'))
  console.log('SUPABASE_URL:', process.env.SUPABASE_URL)
  console.log('SUPABASE_SERVICE_KEY exists:', !!process.env.SUPABASE_SERVICE_KEY)
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)