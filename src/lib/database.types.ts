// Auto-generated types matching the Supabase database schema.
// Regenerate with: supabase gen types typescript --project-id <id> > src/lib/database.types.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          created_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          created_at?: string
        }
      }
      trips: {
        Row: {
          id: string
          user_id: string
          title: string
          destination: string
          start_date: string
          end_date: string
          adults: number
          children: number
          pets: number
          pet_type: string | null
          budget: number
          holiday_type: string
          pet_friendly: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          destination: string
          start_date: string
          end_date: string
          adults?: number
          children?: number
          pets?: number
          pet_type?: string | null
          budget?: number
          holiday_type?: string
          pet_friendly?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          destination?: string
          start_date?: string
          end_date?: string
          adults?: number
          children?: number
          pets?: number
          pet_type?: string | null
          budget?: number
          holiday_type?: string
          pet_friendly?: boolean
          created_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          trip_id: string
          title: string
          date: string
          time: string | null
          location: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          title: string
          date: string
          time?: string | null
          location?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          title?: string
          date?: string
          time?: string | null
          location?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      packing_items: {
        Row: {
          id: string
          trip_id: string
          item_name: string
          category: string
          checked: boolean
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          item_name: string
          category?: string
          checked?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          item_name?: string
          category?: string
          checked?: boolean
          created_at?: string
        }
      }
      budget: {
        Row: {
          id: string
          trip_id: string
          category: string
          amount: number
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          category: string
          amount: number
          description?: string
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          category?: string
          amount?: number
          description?: string
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
