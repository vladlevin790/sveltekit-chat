export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      chat: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id?: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
      }
      message: {
        Row: {
          chat: number | null
          id: number
          message: string | null
          time: string | null
          user_id: number | null
        }
        Insert: {
          chat?: number | null
          id?: number
          message?: string | null
          time?: string | null
          user_id?: number | null
        }
        Update: {
          chat?: number | null
          id?: number
          message?: string | null
          time?: string | null
          user_id?: number | null
        }
      }
      rooms: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
      }
      user_chat: {
        Row: {
          id: number
          id_chat: number | null
          id_owner: number | null
          id_user: number | null
        }
        Insert: {
          id?: number
          id_chat?: number | null
          id_owner?: number | null
          id_user?: number | null
        }
        Update: {
          id?: number
          id_chat?: number | null
          id_owner?: number | null
          id_user?: number | null
        }
      }
      users: {
        Row: {
          id: number
          last_login_at: string | null
          password: string
          username: string
        }
        Insert: {
          id?: number
          last_login_at?: string | null
          password: string
          username: string
        }
        Update: {
          id?: number
          last_login_at?: string | null
          password?: string
          username?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_room: {
        Args: {
          name: string
        }
        Returns: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
      }
      is_room_participant: {
        Args: {
          room_id: string
          profile_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
