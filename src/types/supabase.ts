export type EventCategory =
  | 'gastronomia'
  | 'musica'
  | 'cultura'
  | 'networking'
  | 'deporte'
  | 'fiesta'
  | 'teatro'
  | 'arte'

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
          interests: EventCategory[]
          created_at: string
        }
        Insert: {
          id: string
          name: string
          bio?: string
          avatar_url?: string | null
          location?: string
          interests?: EventCategory[]
          created_at?: string
        }
        Update: {
          name?: string
          bio?: string
          avatar_url?: string | null
          location?: string
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
          created_at: string
        }
        Insert: {
          id: string
          event_title: string
          event_image_url?: string | null
          event_address?: string | null
          created_at?: string
        }
        Update: {
          event_title?: string
          event_image_url?: string | null
          event_address?: string | null
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
          organizer_name: string
          organizer_avatar: string | null
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
          organizer_name?: string
          organizer_avatar?: string | null
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
          organizer_name?: string
          organizer_avatar?: string | null
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
      token_wallets: {
        Row: { id: string; locatario_id: string; balance: number; created_at: string; updated_at: string }
        Insert: { id?: string; locatario_id: string; balance?: number; created_at?: string; updated_at?: string }
        Update: { id?: string; locatario_id?: string; balance?: number; created_at?: string; updated_at?: string }
        Relationships: []
      }
      token_transactions: {
        Row: {
          id: string
          wallet_id: string
          type: 'purchase' | 'consume' | 'refund' | 'adjustment'
          amount: number
          reason: string
          reference_type: string | null
          reference_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          wallet_id: string
          type: 'purchase' | 'consume' | 'refund' | 'adjustment'
          amount: number
          reason: string
          reference_type?: string | null
          reference_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          wallet_id?: string
          type?: 'purchase' | 'consume' | 'refund' | 'adjustment'
          amount?: number
          reason?: string
          reference_type?: string | null
          reference_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      payment_orders: {
        Row: {
          id: string
          locatario_id: string
          provider: 'mercadopago' | 'transbank_webpay'
          pack_code: 'starter' | 'growth' | 'pro'
          token_amount: number
          amount_clp: number
          status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'expired'
          provider_order_id: string | null
          provider_payment_id: string | null
          checkout_url: string | null
          raw_provider_response: Json | null
          created_at: string
          paid_at: string | null
        }
        Insert: {
          id?: string
          locatario_id: string
          provider: 'mercadopago' | 'transbank_webpay'
          pack_code: 'starter' | 'growth' | 'pro'
          token_amount: number
          amount_clp: number
          status?: 'pending' | 'paid' | 'failed' | 'cancelled' | 'expired'
          provider_order_id?: string | null
          provider_payment_id?: string | null
          checkout_url?: string | null
          raw_provider_response?: Json | null
          created_at?: string
          paid_at?: string | null
        }
        Update: {
          id?: string
          locatario_id?: string
          provider?: 'mercadopago' | 'transbank_webpay'
          pack_code?: 'starter' | 'growth' | 'pro'
          token_amount?: number
          amount_clp?: number
          status?: 'pending' | 'paid' | 'failed' | 'cancelled' | 'expired'
          provider_order_id?: string | null
          provider_payment_id?: string | null
          checkout_url?: string | null
          raw_provider_response?: Json | null
          created_at?: string
          paid_at?: string | null
        }
        Relationships: []
      }
      promotion_campaigns: {
        Row: {
          id: string
          locatario_id: string
          event_id: string
          type: 'featured' | 'geo_boost' | 'coupon' | 'premium_badge'
          status: 'active' | 'paused' | 'expired' | 'cancelled'
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
          status?: 'active' | 'paused' | 'expired' | 'cancelled'
          token_cost: number
          starts_at?: string
          ends_at: string
          created_at?: string
        }
        Update: {
          id?: string
          locatario_id?: string
          event_id?: string
          type?: 'featured' | 'geo_boost' | 'coupon' | 'premium_badge'
          status?: 'active' | 'paused' | 'expired' | 'cancelled'
          token_cost?: number
          starts_at?: string
          ends_at?: string
          created_at?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          id: string
          campaign_id: string
          title: string
          description: string | null
          qr_token: string
          status: 'active' | 'redeemed' | 'expired' | 'cancelled'
          expires_at: string
          redeemed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          title: string
          description?: string | null
          qr_token: string
          status?: 'active' | 'redeemed' | 'expired' | 'cancelled'
          expires_at: string
          redeemed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          title?: string
          description?: string | null
          qr_token?: string
          status?: 'active' | 'redeemed' | 'expired' | 'cancelled'
          expires_at?: string
          redeemed_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      qr_validations: {
        Row: {
          id: string
          coupon_id: string
          locatario_id: string
          status: 'valid' | 'invalid' | 'expired' | 'consumed' | 'cancelled'
          scanned_at: string
        }
        Insert: {
          id?: string
          coupon_id: string
          locatario_id: string
          status: 'valid' | 'invalid' | 'expired' | 'consumed' | 'cancelled'
          scanned_at?: string
        }
        Update: {
          id?: string
          coupon_id?: string
          locatario_id?: string
          status?: 'valid' | 'invalid' | 'expired' | 'consumed' | 'cancelled'
          scanned_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      consume_tokens_for_campaign: {
        Args: {
          p_locatario_id: string
          p_event_id: string
          p_type: 'featured' | 'geo_boost' | 'coupon' | 'premium_badge'
          p_token_cost: number
          p_starts_at: string
          p_ends_at: string
        }
        Returns: string
      }
      credit_tokens_for_paid_order: {
        Args: {
          p_order_id: string
        }
        Returns: string
      }
      redeem_promotion_coupon: {
        Args: {
          p_locatario_id: string
          p_qr_token: string
        }
        Returns: string | null
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
