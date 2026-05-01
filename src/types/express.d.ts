import type { SupabaseClient, User } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'

type AuthProfile = Database['public']['Tables']['profiles']['Row']

declare global {
  namespace Express {
    interface Request {
      supabase?: SupabaseClient<Database>
      authUser?: User
      authProfile?: AuthProfile
    }
  }
}

export {}
