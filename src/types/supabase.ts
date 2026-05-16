export type EventCategory =
  | 'gastronomia'
  | 'musica'
  | 'cultura'
  | 'networking'
  | 'deporte'
  | 'fiesta'
  | 'teatro'
  | 'arte'

export type UserRole = 'user' | 'admin' | 'locatario'

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          bio: string
          avatar_url: string | null
          location: string
          role: UserRole
          business_name: string | null
          business_location: string | null
          interests: EventCategory[]
          created_at: string
        }
        Insert: {
          id: string
          name: string
          bio?: string
          avatar_url?: string | null
          location?: string
          role?: UserRole
          business_name?: string | null
          business_location?: string | null
          interests?: EventCategory[]
          created_at?: string
        }
        Update: {
          name?: string
          bio?: string
          avatar_url?: string | null
          location?: string
          role?: UserRole
          business_name?: string | null
          business_location?: string | null
          interests?: EventCategory[]
        }
        Relationships: []
      }
      user_events: {
        Row: {
          id: string
          user_id: string
          event_id: string
          event_title: string | null
          event_image_url: string | null
          event_address: string | null
          action: 'like' | 'save'
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          event_id: string
          event_title?: string | null
          event_image_url?: string | null
          event_address?: string | null
          action: 'like' | 'save'
          created_at?: string
        }
        Update: {
          event_title?: string | null
          event_image_url?: string | null
          event_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'user_events_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      chat_rooms: {
        Row: {
          id: string
          event_title: string
          event_image_url: string | null
          event_address: string | null
          event_date: string | null
          created_at: string
        }
        Insert: {
          id: string
          event_title: string
          event_image_url?: string | null
          event_address?: string | null
          event_date?: string | null
          created_at?: string
        }
        Update: {
          event_title?: string
          event_image_url?: string | null
          event_address?: string | null
          event_date?: string | null
        }
        Relationships: []
      }
      room_members: {
        Row: {
          room_id: string
          user_id: string
          joined_at: string
          last_read_at: string
        }
        Insert: {
          room_id: string
          user_id?: string
          joined_at?: string
          last_read_at?: string
        }
        Update: {
          last_read_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'room_members_room_id_fkey'
            columns: ['room_id']
            isOneToOne: false
            referencedRelation: 'chat_rooms'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'room_members_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      chat_messages: {
        Row: {
          id: string
          room_id: string
          user_id: string
          text: string
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          user_id?: string
          text: string
          created_at?: string
        }
        Update: {
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: 'chat_messages_room_id_fkey'
            columns: ['room_id']
            isOneToOne: false
            referencedRelation: 'chat_rooms'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'chat_messages_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      locatario_events: {
        Row: {
          id: string
          creator_id: string
          title: string
          description: string
          category: EventCategory
          event_date: string
          address: string
          price: number | null
          image_url: string | null
          video_url: string | null
          organizer_name: string
          organizer_avatar: string | null
          lat: number | null
          lng: number | null
          status: 'live' | 'draft' | 'flagged'
          created_at: string
        }
        Insert: {
          id?: string
          creator_id?: string
          title: string
          description?: string
          category: EventCategory
          event_date: string
          address?: string
          price?: number | null
          image_url?: string | null
          video_url?: string | null
          organizer_name?: string
          organizer_avatar?: string | null
          lat?: number | null
          lng?: number | null
          status?: 'live' | 'draft' | 'flagged'
          created_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          title?: string
          description?: string
          category?: EventCategory
          event_date?: string
          address?: string
          price?: number | null
          image_url?: string | null
          video_url?: string | null
          organizer_name?: string
          organizer_avatar?: string | null
          lat?: number | null
          lng?: number | null
          status?: 'live' | 'draft' | 'flagged'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'locatario_events_creator_id_fkey'
            columns: ['creator_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      reports: {
        Row: {
          id: string
          type: 'spam' | 'inappropriate' | 'fake' | 'other'
          description: string
          target_type: 'event' | 'user' | 'comment'
          target_id: string
          reporter_id: string
          status: 'pending' | 'resolved' | 'dismissed'
          resolved_by: string | null
          resolved_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          type: 'spam' | 'inappropriate' | 'fake' | 'other'
          description?: string
          target_type: 'event' | 'user' | 'comment'
          target_id: string
          reporter_id?: string
          status?: 'pending' | 'resolved' | 'dismissed'
          resolved_by?: string | null
          resolved_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          type?: 'spam' | 'inappropriate' | 'fake' | 'other'
          description?: string
          target_type?: 'event' | 'user' | 'comment'
          target_id?: string
          reporter_id?: string
          status?: 'pending' | 'resolved' | 'dismissed'
          resolved_by?: string | null
          resolved_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'reports_reporter_id_fkey'
            columns: ['reporter_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reports_resolved_by_fkey'
            columns: ['resolved_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      transactions: {
        Row: {
          id: string
          type: 'ticket' | 'suscripcion' | 'comision'
          description: string
          amount: number
          status: 'completado' | 'pendiente' | 'reembolsado'
          event_id: string | null
          user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          type: 'ticket' | 'suscripcion' | 'comision'
          description?: string
          amount: number
          status?: 'completado' | 'pendiente' | 'reembolsado'
          event_id?: string | null
          user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          type?: 'ticket' | 'suscripcion' | 'comision'
          description?: string
          amount?: number
          status?: 'completado' | 'pendiente' | 'reembolsado'
          event_id?: string | null
          user_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'transactions_event_id_fkey'
            columns: ['event_id']
            isOneToOne: false
            referencedRelation: 'locatario_events'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'transactions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      token_wallets: {
        Row: {
          id: string
          locatario_id: string
          balance: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          locatario_id: string
          balance?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          balance?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'token_wallets_locatario_id_fkey'
            columns: ['locatario_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      payment_orders: {
        Row: {
          id: string
          locatario_id: string
          provider: 'mercadopago' | 'transbank_webpay'
          pack_code: string
          token_amount: number
          amount_clp: number
          status: 'pending' | 'paid' | 'failed'
          provider_order_id: string | null
          checkout_url: string | null
          provider_payment_id: string | null
          raw_provider_response: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          locatario_id: string
          provider: 'mercadopago' | 'transbank_webpay'
          pack_code: string
          token_amount: number
          amount_clp: number
          status?: 'pending' | 'paid' | 'failed'
          provider_order_id?: string | null
          checkout_url?: string | null
          provider_payment_id?: string | null
          raw_provider_response?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: 'pending' | 'paid' | 'failed'
          provider_order_id?: string | null
          checkout_url?: string | null
          provider_payment_id?: string | null
          raw_provider_response?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'payment_orders_locatario_id_fkey'
            columns: ['locatario_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      promotion_campaigns: {
        Row: {
          id: string
          locatario_id: string
          event_id: string
          type: 'featured' | 'geo_boost' | 'coupon' | 'premium_badge'
          token_cost: number
          starts_at: string
          ends_at: string
          created_at: string
        }
        Insert: {
          id?: string
          locatario_id: string
          event_id: string
          type: 'featured' | 'geo_boost' | 'coupon' | 'premium_badge'
          token_cost: number
          starts_at: string
          ends_at: string
          created_at?: string
        }
        Update: {
          type?: 'featured' | 'geo_boost' | 'coupon' | 'premium_badge'
          token_cost?: number
          starts_at?: string
          ends_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'promotion_campaigns_locatario_id_fkey'
            columns: ['locatario_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'promotion_campaigns_event_id_fkey'
            columns: ['event_id']
            isOneToOne: false
            referencedRelation: 'locatario_events'
            referencedColumns: ['id']
          },
        ]
      }
      coupons: {
        Row: {
          id: string
          campaign_id: string
          title: string
          description: string | null
          qr_token: string
          status: 'active' | 'redeemed' | 'expired'
          expires_at: string | null
          redeemed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          title: string
          description?: string | null
          qr_token: string
          status?: 'active' | 'redeemed' | 'expired'
          expires_at?: string | null
          redeemed_at?: string | null
          created_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          status?: 'active' | 'redeemed' | 'expired'
          expires_at?: string | null
          redeemed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'coupons_campaign_id_fkey'
            columns: ['campaign_id']
            isOneToOne: false
            referencedRelation: 'promotion_campaigns'
            referencedColumns: ['id']
          },
        ]
      }
      profile_followers: {
        Row: {
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: Record<string, never>
        Relationships: [
          {
            foreignKeyName: 'profile_followers_follower_id_fkey'
            columns: ['follower_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'profile_followers_following_id_fkey'
            columns: ['following_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      qr_validations: {
        Row: {
          id: string
          coupon_id: string
          validated_by: string
          validated_at: string
        }
        Insert: {
          id?: string
          coupon_id: string
          validated_by: string
          validated_at?: string
        }
        Update: Record<string, never>
        Relationships: [
          {
            foreignKeyName: 'qr_validations_coupon_id_fkey'
            columns: ['coupon_id']
            isOneToOne: false
            referencedRelation: 'coupons'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'qr_validations_validated_by_fkey'
            columns: ['validated_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      token_transactions: {
        Row: {
          id: string
          wallet_id: string
          amount: number
          type: string
          description: string | null
          reference_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          wallet_id: string
          amount: number
          type: string
          description?: string | null
          reference_id?: string | null
          created_at?: string
        }
        Update: Record<string, never>
        Relationships: [
          {
            foreignKeyName: 'token_transactions_wallet_id_fkey'
            columns: ['wallet_id']
            isOneToOne: false
            referencedRelation: 'token_wallets'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      credit_tokens_for_paid_order: {
        Args: { p_order_id: string }
        Returns: undefined
      }
      consume_tokens_for_campaign: {
        Args: {
          p_locatario_id: string
          p_event_id: string
          p_type: string
          p_token_cost: number
          p_starts_at: string
          p_ends_at: string
        }
        Returns: string
      }
      redeem_promotion_coupon: {
        Args: {
          p_locatario_id: string
          p_qr_token: string
        }
        Returns: string
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}