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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      pcb_chat_messages: {
        Row: {
          chat_session_id: string
          content: string
          created_at: string | null
          id: string
          role: string
          tool_calls: Json | null
        }
        Insert: {
          chat_session_id: string
          content: string
          created_at?: string | null
          id?: string
          role: string
          tool_calls?: Json | null
        }
        Update: {
          chat_session_id?: string
          content?: string
          created_at?: string | null
          id?: string
          role?: string
          tool_calls?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "pcb_chat_messages_chat_session_id_fkey"
            columns: ["chat_session_id"]
            isOneToOne: false
            referencedRelation: "pcb_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      pcb_chat_sessions: {
        Row: {
          created_at: string | null
          id: string
          project_id: string
          title: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id: string
          title?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pcb_chat_sessions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "pcb_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      pcb_design_objects: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          name: string
          project_id: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          name: string
          project_id: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          project_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "pcb_design_objects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "pcb_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      pcb_design_versions: {
        Row: {
          created_at: string | null
          design_snapshot: Json
          id: string
          project_id: string
          summary_text: string | null
          version_number: number
        }
        Insert: {
          created_at?: string | null
          design_snapshot?: Json
          id?: string
          project_id: string
          summary_text?: string | null
          version_number: number
        }
        Update: {
          created_at?: string | null
          design_snapshot?: Json
          id?: string
          project_id?: string
          summary_text?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "pcb_design_versions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "pcb_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      pcb_projects: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          owner_user_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          owner_user_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          owner_user_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      processed_metrics: {
        Row: {
          ai_energy_score: number | null
          created_at: string
          eco_efficiency_rating: string | null
          id: string
          identified_drivers: Json | null
          predicted_consumption: number | null
          telemetry_id: string | null
          user_id: string
        }
        Insert: {
          ai_energy_score?: number | null
          created_at?: string
          eco_efficiency_rating?: string | null
          id?: string
          identified_drivers?: Json | null
          predicted_consumption?: number | null
          telemetry_id?: string | null
          user_id: string
        }
        Update: {
          ai_energy_score?: number | null
          created_at?: string
          eco_efficiency_rating?: string | null
          id?: string
          identified_drivers?: Json | null
          predicted_consumption?: number | null
          telemetry_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "processed_metrics_telemetry_id_fkey"
            columns: ["telemetry_id"]
            isOneToOne: false
            referencedRelation: "raw_telemetry"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      raw_telemetry: {
        Row: {
          accelerator_vendor: string | null
          amd_gpu_wattage: number | null
          amd_memory_gb: number | null
          amd_utilization: number | null
          created_at: string
          facility_id: string | null
          gpu_wattage: number | null
          humidity_pct: number | null
          hvac_status: string | null
          id: string
          model_id: string | null
          nvidia_memory_gb: number | null
          nvidia_utilization: number | null
          raw_payload: Json | null
          temp_c: number | null
          timestamp: string
          tokens_generated: number | null
          tpu_memory_gb: number | null
          tpu_utilization: number | null
          tpu_wattage: number | null
          user_id: string
        }
        Insert: {
          accelerator_vendor?: string | null
          amd_gpu_wattage?: number | null
          amd_memory_gb?: number | null
          amd_utilization?: number | null
          created_at?: string
          facility_id?: string | null
          gpu_wattage?: number | null
          humidity_pct?: number | null
          hvac_status?: string | null
          id?: string
          model_id?: string | null
          nvidia_memory_gb?: number | null
          nvidia_utilization?: number | null
          raw_payload?: Json | null
          temp_c?: number | null
          timestamp?: string
          tokens_generated?: number | null
          tpu_memory_gb?: number | null
          tpu_utilization?: number | null
          tpu_wattage?: number | null
          user_id: string
        }
        Update: {
          accelerator_vendor?: string | null
          amd_gpu_wattage?: number | null
          amd_memory_gb?: number | null
          amd_utilization?: number | null
          created_at?: string
          facility_id?: string | null
          gpu_wattage?: number | null
          humidity_pct?: number | null
          hvac_status?: string | null
          id?: string
          model_id?: string | null
          nvidia_memory_gb?: number | null
          nvidia_utilization?: number | null
          raw_payload?: Json | null
          temp_c?: number | null
          timestamp?: string
          tokens_generated?: number | null
          tpu_memory_gb?: number | null
          tpu_utilization?: number | null
          tpu_wattage?: number | null
          user_id?: string
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          created_at: string
          description: string | null
          id: string
          impact_level: string | null
          metric_id: string | null
          requires_approval: boolean | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          impact_level?: string | null
          metric_id?: string | null
          requires_approval?: boolean | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          impact_level?: string | null
          metric_id?: string | null
          requires_approval?: boolean | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_metric_id_fkey"
            columns: ["metric_id"]
            isOneToOne: false
            referencedRelation: "processed_metrics"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
