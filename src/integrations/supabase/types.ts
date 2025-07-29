export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      club_coach_assignments: {
        Row: {
          club_id: string
          coach_user_id: string
          created_at: string
          id: string
          status: string
          updated_at: string
        }
        Insert: {
          club_id: string
          coach_user_id: string
          created_at?: string
          id?: string
          status: string
          updated_at?: string
        }
        Update: {
          club_id?: string
          coach_user_id?: string
          created_at?: string
          id?: string
          status?: string
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
            foreignKeyName: "fk_coach_user_profiles"
            columns: ["coach_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      club_representatives: {
        Row: {
          club_id: string
          created_at: string
          full_name: string
          id: string
          info_confirmed: boolean
          national_id: string
          personal_email: string
          phone: string
          role_in_club: string
          terms_accepted: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          club_id: string
          created_at?: string
          full_name: string
          id?: string
          info_confirmed?: boolean
          national_id: string
          personal_email: string
          phone: string
          role_in_club: string
          terms_accepted?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          club_id?: string
          created_at?: string
          full_name?: string
          id?: string
          info_confirmed?: boolean
          national_id?: string
          personal_email?: string
          phone?: string
          role_in_club?: string
          terms_accepted?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_representatives_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      clubs: {
        Row: {
          address: string | null
          city: string
          club_code: string | null
          code_regenerated_at: string | null
          country: string
          created_at: string
          email: string
          facebook: string | null
          foundation_date: string | null
          id: string
          instagram: string | null
          logo_url: string | null
          name: string
          phone: string | null
          province: string
          twitter: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          city: string
          club_code?: string | null
          code_regenerated_at?: string | null
          country: string
          created_at?: string
          email: string
          facebook?: string | null
          foundation_date?: string | null
          id?: string
          instagram?: string | null
          logo_url?: string | null
          name: string
          phone?: string | null
          province: string
          twitter?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string
          club_code?: string | null
          code_regenerated_at?: string | null
          country?: string
          created_at?: string
          email?: string
          facebook?: string | null
          foundation_date?: string | null
          id?: string
          instagram?: string | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          province?: string
          twitter?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      coach_main_request_details: {
        Row: {
          additional_info: string | null
          admin_notes: string | null
          created_at: string | null
          id: string
          rejection_reason: string | null
          request_id: string
          updated_at: string | null
        }
        Insert: {
          additional_info?: string | null
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          rejection_reason?: string | null
          request_id: string
          updated_at?: string | null
        }
        Update: {
          additional_info?: string | null
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          rejection_reason?: string | null
          request_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      coach_main_requests: {
        Row: {
          club_id: string | null
          created_at: string | null
          id: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          club_id?: string | null
          created_at?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          club_id?: string | null
          created_at?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_main_requests_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_main_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      friendly_matches: {
        Row: {
          additional_notes: string | null
          category: string
          club_id: string | null
          coach_id: string
          created_at: string
          expiration_date: string
          id: string
          location: string | null
          match_format: string
          preferred_dates_end: string | null
          preferred_dates_start: string | null
          preferred_time_end: string | null
          preferred_time_start: string | null
          publication_type: string
          specific_date: string | null
          status: string
          team_id: string | null
          updated_at: string
        }
        Insert: {
          additional_notes?: string | null
          category: string
          club_id?: string | null
          coach_id: string
          created_at?: string
          expiration_date: string
          id?: string
          location?: string | null
          match_format: string
          preferred_dates_end?: string | null
          preferred_dates_start?: string | null
          preferred_time_end?: string | null
          preferred_time_start?: string | null
          publication_type: string
          specific_date?: string | null
          status?: string
          team_id?: string | null
          updated_at?: string
        }
        Update: {
          additional_notes?: string | null
          category?: string
          club_id?: string | null
          coach_id?: string
          created_at?: string
          expiration_date?: string
          id?: string
          location?: string | null
          match_format?: string
          preferred_dates_end?: string | null
          preferred_dates_start?: string | null
          preferred_time_end?: string | null
          preferred_time_start?: string | null
          publication_type?: string
          specific_date?: string | null
          status?: string
          team_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      match_events: {
        Row: {
          action: string
          created_at: string | null
          created_by: string | null
          id: string
          is_error: boolean | null
          is_point: boolean | null
          match_id: string | null
          notes: string | null
          player_id: string | null
          point_number: number
          result: string
          set_number: number
          team_id: string | null
          timestamp: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_error?: boolean | null
          is_point?: boolean | null
          match_id?: string | null
          notes?: string | null
          player_id?: string | null
          point_number: number
          result: string
          set_number: number
          team_id?: string | null
          timestamp?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_error?: boolean | null
          is_point?: boolean | null
          match_id?: string | null
          notes?: string | null
          player_id?: string | null
          point_number?: number
          result?: string
          set_number?: number
          team_id?: string | null
          timestamp?: string | null
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
        ]
      }
      match_interests: {
        Row: {
          club_id: string | null
          coach_id: string
          contact_info: string | null
          created_at: string
          id: string
          match_id: string
          message: string | null
          status: string
          team_id: string | null
          updated_at: string
        }
        Insert: {
          club_id?: string | null
          coach_id: string
          contact_info?: string | null
          created_at?: string
          id?: string
          match_id: string
          message?: string | null
          status?: string
          team_id?: string | null
          updated_at?: string
        }
        Update: {
          club_id?: string | null
          coach_id?: string
          contact_info?: string | null
          created_at?: string
          id?: string
          match_id?: string
          message?: string | null
          status?: string
          team_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_interests_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "friendly_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      match_sets: {
        Row: {
          created_at: string | null
          duration_minutes: number | null
          id: string
          match_id: string | null
          opponent_points: number | null
          set_number: number
          team_points: number | null
          winner: string | null
        }
        Insert: {
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          match_id?: string | null
          opponent_points?: number | null
          set_number: number
          team_points?: number | null
          winner?: string | null
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          match_id?: string | null
          opponent_points?: number | null
          set_number?: number
          team_points?: number | null
          winner?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_sets_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          location: string | null
          match_date: string
          notes: string | null
          opponent_points: number | null
          opponent_team: string | null
          sets_lost: number | null
          sets_won: number | null
          status: string | null
          team_id: string | null
          total_points: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          location?: string | null
          match_date: string
          notes?: string | null
          opponent_points?: number | null
          opponent_team?: string | null
          sets_lost?: number | null
          sets_won?: number | null
          status?: string | null
          team_id?: string | null
          total_points?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          location?: string | null
          match_date?: string
          notes?: string | null
          opponent_points?: number | null
          opponent_team?: string | null
          sets_lost?: number | null
          sets_won?: number | null
          status?: string | null
          team_id?: string | null
          total_points?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      player_teams: {
        Row: {
          created_at: string | null
          id: string
          player_id: string
          team_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          player_id: string
          team_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          player_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_teams_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_teams_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          alcance_ataque: number | null
          alcance_bloqueo: number | null
          altura: number | null
          birthdate: string
          contact_email: string | null
          created_at: string
          document_id: string
          fecha_medicion: string | null
          flexibilidad: number | null
          fuerza_brazos: number | null
          fuerza_piernas: number | null
          full_name: string
          guardian_contact: string | null
          guardian_name: string | null
          id: string
          jersey_number: number
          notas_fisicas: string | null
          peso: number | null
          position: string
          resistencia_beep: number | null
          salto_horizontal: number | null
          salto_vertical: number | null
          team_id: string
          updated_at: string
          velocidad_30m: number | null
        }
        Insert: {
          alcance_ataque?: number | null
          alcance_bloqueo?: number | null
          altura?: number | null
          birthdate: string
          contact_email?: string | null
          created_at?: string
          document_id: string
          fecha_medicion?: string | null
          flexibilidad?: number | null
          fuerza_brazos?: number | null
          fuerza_piernas?: number | null
          full_name: string
          guardian_contact?: string | null
          guardian_name?: string | null
          id?: string
          jersey_number: number
          notas_fisicas?: string | null
          peso?: number | null
          position: string
          resistencia_beep?: number | null
          salto_horizontal?: number | null
          salto_vertical?: number | null
          team_id: string
          updated_at?: string
          velocidad_30m?: number | null
        }
        Update: {
          alcance_ataque?: number | null
          alcance_bloqueo?: number | null
          altura?: number | null
          birthdate?: string
          contact_email?: string | null
          created_at?: string
          document_id?: string
          fecha_medicion?: string | null
          flexibilidad?: number | null
          fuerza_brazos?: number | null
          fuerza_piernas?: number | null
          full_name?: string
          guardian_contact?: string | null
          guardian_name?: string | null
          id?: string
          jersey_number?: number
          notas_fisicas?: string | null
          peso?: number | null
          position?: string
          resistencia_beep?: number | null
          salto_horizontal?: number | null
          salto_vertical?: number | null
          team_id?: string
          updated_at?: string
          velocidad_30m?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          role: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name: string
          id?: string
          role: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          role?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      team_coaches: {
        Row: {
          assigned_at: string
          assigned_by: string
          coach_user_id: string
          id: string
          team_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by: string
          coach_user_id: string
          id?: string
          team_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string
          coach_user_id?: string
          id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_coaches_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          category: string
          club_id: string | null
          coach_id: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          category: string
          club_id?: string | null
          coach_id: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          category?: string
          club_id?: string | null
          coach_id?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      topes: {
        Row: {
          cantidad_sets: number | null
          categoria: string
          ciudad: string | null
          creado_por: string
          created_at: string | null
          equipo_id: string
          estado: string
          fecha_fin: string | null
          fecha_inicio: string
          hora_fin: string | null
          hora_inicio: string | null
          id: string
          latitud: number | null
          longitud: number | null
          notas: string | null
          ofrece_comida: boolean | null
          ofrece_hospedaje: boolean | null
          ofrece_otros: string | null
          ofrece_transporte: boolean | null
          tipo_publicacion: string
          ubicacion: string
          updated_at: string | null
          vigencia_hasta: string
        }
        Insert: {
          cantidad_sets?: number | null
          categoria: string
          ciudad?: string | null
          creado_por: string
          created_at?: string | null
          equipo_id: string
          estado?: string
          fecha_fin?: string | null
          fecha_inicio: string
          hora_fin?: string | null
          hora_inicio?: string | null
          id?: string
          latitud?: number | null
          longitud?: number | null
          notas?: string | null
          ofrece_comida?: boolean | null
          ofrece_hospedaje?: boolean | null
          ofrece_otros?: string | null
          ofrece_transporte?: boolean | null
          tipo_publicacion: string
          ubicacion: string
          updated_at?: string | null
          vigencia_hasta: string
        }
        Update: {
          cantidad_sets?: number | null
          categoria?: string
          ciudad?: string | null
          creado_por?: string
          created_at?: string | null
          equipo_id?: string
          estado?: string
          fecha_fin?: string | null
          fecha_inicio?: string
          hora_fin?: string | null
          hora_inicio?: string | null
          id?: string
          latitud?: number | null
          longitud?: number | null
          notas?: string | null
          ofrece_comida?: boolean | null
          ofrece_hospedaje?: boolean | null
          ofrece_otros?: string | null
          ofrece_transporte?: boolean | null
          tipo_publicacion?: string
          ubicacion?: string
          updated_at?: string | null
          vigencia_hasta?: string
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
          },
        ]
      }
      topes_registros: {
        Row: {
          created_at: string | null
          equipo_id: string
          estado: string
          id: string
          mensaje: string | null
          tope_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          equipo_id: string
          estado?: string
          id?: string
          mensaje?: string | null
          tope_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          equipo_id?: string
          estado?: string
          id?: string
          mensaje?: string | null
          tope_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "topes_registros_equipo_id_fkey"
            columns: ["equipo_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topes_registros_tope_id_fkey"
            columns: ["tope_id"]
            isOneToOne: false
            referencedRelation: "topes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topes_registros_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      regenerate_club_code: {
        Args: { club_id_param: string }
        Returns: string
      }
      update_expired_matches: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
