import type { SupabaseClient, User } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'
import type { UserRole } from '../types/supabase'

type AuthProfile = Database['public']['Tables']['profiles']['Row']

declare global {
  namespace Express {
    interface AuthProfile {
      id: string
      role: UserRole
      business_name: string | null
      business_location: string | null
    }

    interface Request {
      supabase?: SupabaseClient<Database>
      authUser?: User
      authProfile?: AuthProfile
    }
  }
}

export {}
