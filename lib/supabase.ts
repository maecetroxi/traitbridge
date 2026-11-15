import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    'Supabase configuration is missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.',
  )
}

const parsedSupabaseUrl = new URL(supabaseUrl)

if (process.env.NODE_ENV === 'production' && parsedSupabaseUrl.protocol !== 'https:') {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL must use HTTPS in production.')
}

export const supabase = createClient<Database>(supabaseUrl, supabasePublishableKey)



