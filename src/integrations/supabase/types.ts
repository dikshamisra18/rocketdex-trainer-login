export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      help_requests: {
        Row: {
          actually_submitted: boolean
          captcha_level: number
          created_at: string
          id: string
          message: string
          minigame_completed: boolean
          subject: string
          user_id: string
        }
        Insert: {
          actually_submitted?: boolean
          captcha_level?: number
          created_at?: string
          id?: string
          message: string
          minigame_completed?: boolean
          subject: string
          user_id: string
        }
        Update: {
          actually_submitted?: boolean
          captcha_level?: number
          created_at?: string
          id?: string
          message?: string
          minigame_completed?: boolean
          subject?: string
          user_id?: string
        }
        Relationships: []
      }
      misinformation_cache: {
        Row: {
          created_at: string
          fake_habitat: string | null
          fake_pokemon_size: string | null
          fake_pokemon_type: string | null
          fake_sighting_location: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          fake_habitat?: string | null
          fake_pokemon_size?: string | null
          fake_pokemon_type?: string | null
          fake_sighting_location?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          fake_habitat?: string | null
          fake_pokemon_size?: string | null
          fake_pokemon_type?: string | null
          fake_sighting_location?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "misinformation_cache_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_views: {
        Row: {
          first_viewed_at: string
          id: string
          post_id: string
          user_id: string
          user_visit_count_at_first_view: number
          view_count: number
        }
        Insert: {
          first_viewed_at?: string
          id?: string
          post_id: string
          user_id: string
          user_visit_count_at_first_view?: number
          view_count?: number
        }
        Update: {
          first_viewed_at?: string
          id?: string
          post_id?: string
          user_id?: string
          user_visit_count_at_first_view?: number
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "post_views_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          average_rating: number
          created_at: string
          description: string | null
          habitat: string | null
          id: string
          image_url: string | null
          is_banned: boolean
          misinformation_reports: number
          pokemon_name: string
          pokemon_size: string | null
          pokemon_type: string
          rating_count: number
          sighting_location: string
          title: string
          total_reports: number
          user_id: string
        }
        Insert: {
          average_rating?: number
          created_at?: string
          description?: string | null
          habitat?: string | null
          id?: string
          image_url?: string | null
          is_banned?: boolean
          misinformation_reports?: number
          pokemon_name: string
          pokemon_size?: string | null
          pokemon_type: string
          rating_count?: number
          sighting_location: string
          title: string
          total_reports?: number
          user_id: string
        }
        Update: {
          average_rating?: number
          created_at?: string
          description?: string | null
          habitat?: string | null
          id?: string
          image_url?: string | null
          is_banned?: boolean
          misinformation_reports?: number
          pokemon_name?: string
          pokemon_size?: string | null
          pokemon_type?: string
          rating_count?: number
          sighting_location?: string
          title?: string
          total_reports?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          ban_reason: string | null
          created_at: string
          id: string
          is_banned: boolean
          updated_at: string
          user_id: string
          username: string
          visit_count: number
        }
        Insert: {
          avatar_url?: string | null
          ban_reason?: string | null
          created_at?: string
          id?: string
          is_banned?: boolean
          updated_at?: string
          user_id: string
          username: string
          visit_count?: number
        }
        Update: {
          avatar_url?: string | null
          ban_reason?: string | null
          created_at?: string
          id?: string
          is_banned?: boolean
          updated_at?: string
          user_id?: string
          username?: string
          visit_count?: number
        }
        Relationships: []
      }
      ratings: {
        Row: {
          created_at: string
          id: string
          post_id: string
          rating: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          rating: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          post_id: string
          reason: Database["public"]["Enums"]["report_reason"]
          reporter_id: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          post_id: string
          reason: Database["public"]["Enums"]["report_reason"]
          reporter_id: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          post_id?: string
          reason?: Database["public"]["Enums"]["report_reason"]
          reporter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_visits: {
        Row: {
          id: string
          user_id: string
          visited_at: string
        }
        Insert: {
          id?: string
          user_id: string
          visited_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          visited_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      report_reason:
        | "profanity"
        | "misinformation"
        | "spam"
        | "harassment"
        | "other"
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
    Enums: {
      report_reason: [
        "profanity",
        "misinformation",
        "spam",
        "harassment",
        "other",
      ],
    },
  },
} as const
