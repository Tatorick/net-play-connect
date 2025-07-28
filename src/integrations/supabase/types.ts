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
      matches: {
        Row: {
          id: string
          team_id: string
          opponent_team: string
          match_date: string
          location: string | null
          sets_won: number
          sets_lost: number
          total_points: number
          opponent_points: number
          status: string
          notes: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          opponent_team: string
          match_date: string
          location?: string | null
          sets_won?: number
          sets_lost?: number
          total_points?: number
          opponent_points?: number
          status?: string
          notes?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          opponent_team?: string
          match_date?: string
          location?: string | null
          sets_won?: number
          sets_lost?: number
          total_points?: number
          opponent_points?: number
          status?: string
          notes?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "auth.users"
            referencedColumns: ["id"]
          }
        ]
      }
      match_events: {
        Row: {
          id: string
          match_id: string
          player_id: string
          team_id: string
          action: string
          result: string
          set_number: number
          point_number: number
          is_point: boolean
          is_error: boolean
          notes: string | null
          timestamp: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          match_id: string
          player_id: string
          team_id: string
          action: string
          result: string
          set_number: number
          point_number: number
          is_point?: boolean
          is_error?: boolean
          notes?: string | null
          timestamp?: string
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          match_id?: string
          player_id?: string
          team_id?: string
          action?: string
          result?: string
          set_number?: number
          point_number?: number
          is_point?: boolean
          is_error?: boolean
          notes?: string | null
          timestamp?: string
          created_by?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_events_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_events_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "auth.users"
            referencedColumns: ["id"]
          }
        ]
      }
      match_sets: {
        Row: {
          id: string
          match_id: string
          set_number: number
          team_points: number
          opponent_points: number
          winner: string | null
          duration_minutes: number | null
          created_at: string
        }
        Insert: {
          id?: string
          match_id: string
          set_number: number
          team_points?: number
          opponent_points?: number
          winner?: string | null
          duration_minutes?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          match_id?: string
          set_number?: number
          team_points?: number
          opponent_points?: number
          winner?: string | null
          duration_minutes?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_sets_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          }
        ]
      }
      players: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          first_name: string
          last_name: string
          email: string
          contact_email: string | null
          guardian_contact: string | null
          team_id: string
          auth_users_id: string
          full_name: string
          document_id: string
          birthdate: string
          position: string
          jersey_number: number
          guardian_name: string | null
          altura: number | null
          peso: number | null
          alcance_ataque: number | null
          alcance_bloqueo: number | null
          salto_vertical: number | null
          salto_horizontal: number | null
          velocidad_30m: number | null
          fecha_medicion: string | null
          notas_fisicas: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          first_name: string
          last_name: string
          email: string
          contact_email?: string | null
          guardian_contact?: string | null
          team_id: string
          auth_users_id: string
          full_name: string
          document_id: string
          birthdate: string
          position: string
          jersey_number: number
          guardian_name?: string | null
          altura?: number | null
          peso?: number | null
          alcance_ataque?: number | null
          alcance_bloqueo?: number | null
          salto_vertical?: number | null
          salto_horizontal?: number | null
          velocidad_30m?: number | null
          fecha_medicion?: string | null
          notas_fisicas?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          first_name?: string
          last_name?: string
          email?: string
          contact_email?: string | null
          guardian_contact?: string | null
          team_id?: string
          auth_users_id?: string
          full_name?: string
          document_id?: string
          birthdate?: string
          position?: string
          jersey_number?: number
          guardian_name?: string | null
          altura?: number | null
          peso?: number | null
          alcance_ataque?: number | null
          alcance_bloqueo?: number | null
          salto_vertical?: number | null
          salto_horizontal?: number | null
          velocidad_30m?: number | null
          fecha_medicion?: string | null
          notas_fisicas?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "players_auth_users_id_fkey"
            columns: ["auth_users_id"]
            isOneToOne: false
            referencedRelation: "auth.users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          }
        ]
      }
      teams: {
        Row: {
          id: string
          name: string
          category: string
          coach_id: string
          club_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          coach_id: string
          club_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          coach_id?: string
          club_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "teams_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          email: string
          full_name: string
          role: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          full_name: string
          role: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          full_name?: string
          role?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "auth.users"
            referencedColumns: ["id"]
          }
        ]
      }
      clubs: {
        Row: {
          id: string
          name: string
          city: string
          province: string
          country: string
          foundation_date: string | null
          email: string
          phone: string | null
          address: string | null
          website: string | null
          facebook: string | null
          instagram: string | null
          twitter: string | null
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          city: string
          province: string
          country: string
          foundation_date?: string | null
          email: string
          phone?: string | null
          address?: string | null
          website?: string | null
          facebook?: string | null
          instagram?: string | null
          twitter?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          city?: string
          province?: string
          country?: string
          foundation_date?: string | null
          email?: string
          phone?: string | null
          address?: string | null
          website?: string | null
          facebook?: string | null
          instagram?: string | null
          twitter?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      coach_main_requests: {
        Row: {
          id: string
          user_id: string
          club_id: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          club_id: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          club_id?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_main_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth.users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_main_requests_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          }
        ]
      }
      club_coach_assignments: {
        Row: {
          id: string
          club_id: string
          coach_user_id: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          club_id: string
          coach_user_id: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          club_id?: string
          coach_user_id?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_coach_assignments_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_coach_assignments_coach_user_id_fkey"
            columns: ["coach_user_id"]
            isOneToOne: false
            referencedRelation: "auth.users"
            referencedColumns: ["id"]
          }
        ]
      }
      friendly_matches: {
        Row: {
          id: string
          coach_id: string
          team_id: string
          club_id: string
          publication_type: string
          category: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          coach_id: string
          team_id: string
          club_id: string
          publication_type: string
          category: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          coach_id?: string
          team_id?: string
          club_id?: string
          publication_type?: string
          category?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "friendly_matches_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "friendly_matches_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendly_matches_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          }
        ]
      }
      match_links: {
        Row: {
          id: string
          match_id: string
          link_url: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          match_id: string
          link_url: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          match_id?: string
          link_url?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_links_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          }
        ]
      }
      topes: {
        Row: {
          id: string
          tipo_publicacion: string
          categoria: string
          fecha_inicio: string
          fecha_fin: string | null
          hora_inicio: string | null
          hora_fin: string | null
          ubicacion: string
          cantidad_sets: number | null
          notas: string | null
          estado: string
          creado_por: string
          equipo_id: string | null
          ofrece_hospedaje: boolean
          ofrece_comida: boolean
          ofrece_transporte: boolean
          ofrece_otros: string | null
          ciudad: string | null
          latitud: number | null
          longitud: number | null
        }
        Insert: {
          id?: string
          tipo_publicacion: string
          categoria: string
          fecha_inicio: string
          fecha_fin?: string | null
          hora_inicio?: string | null
          hora_fin?: string | null
          ubicacion: string
          cantidad_sets?: number | null
          notas?: string | null
          estado: string
          creado_por: string
          equipo_id?: string | null
          ofrece_hospedaje?: boolean
          ofrece_comida?: boolean
          ofrece_transporte?: boolean
          ofrece_otros?: string | null
          ciudad?: string | null
          latitud?: number | null
          longitud?: number | null
        }
        Update: {
          id?: string
          tipo_publicacion?: string
          categoria?: string
          fecha_inicio?: string
          fecha_fin?: string | null
          hora_inicio?: string | null
          hora_fin?: string | null
          ubicacion?: string
          cantidad_sets?: number | null
          notas?: string | null
          estado?: string
          creado_por?: string
          equipo_id?: string | null
          ofrece_hospedaje?: boolean
          ofrece_comida?: boolean
          ofrece_transporte?: boolean
          ofrece_otros?: string | null
          ciudad?: string | null
          latitud?: number | null
          longitud?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "topes_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "topes_equipo_id_fkey"
            columns: ["equipo_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          }
        ]
      }
      topes_registros: {
        Row: {
          id: string
          tope_id: string
          equipo_id: string
          user_id: string
          estado: string
          created_at: string
        }
        Insert: {
          id?: string
          tope_id: string
          equipo_id: string
          user_id: string
          estado: string
          created_at?: string
        }
        Update: {
          id?: string
          tope_id?: string
          equipo_id?: string
          user_id?: string
          estado?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "topes_registros_tope_id_fkey"
            columns: ["tope_id"]
            isOneToOne: false
            referencedRelation: "topes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topes_registros_equipo_id_fkey"
            columns: ["equipo_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topes_registros_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
