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
      action_plans: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          impact_score: number | null
          priority: string
          project_id: string
          related_metric: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          impact_score?: number | null
          priority?: string
          project_id: string
          related_metric?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          impact_score?: number | null
          priority?: string
          project_id?: string
          related_metric?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_plans_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      business_tools: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      competitors: {
        Row: {
          created_at: string
          id: string
          market_share: number | null
          marketing_spend: number | null
          name: string
          pricing: number | null
          project_id: string
          quality: number | null
          revenue: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          market_share?: number | null
          marketing_spend?: number | null
          name: string
          pricing?: number | null
          project_id: string
          quality?: number | null
          revenue?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          market_share?: number | null
          marketing_spend?: number | null
          name?: string
          pricing?: number | null
          project_id?: string
          quality?: number | null
          revenue?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "competitors_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_tools: {
        Row: {
          created_at: string
          expense_category: string
          id: string
          project_id: string
          scenario_type: string
          tool_id: string
        }
        Insert: {
          created_at?: string
          expense_category: string
          id?: string
          project_id: string
          scenario_type: string
          tool_id: string
        }
        Update: {
          created_at?: string
          expense_category?: string
          id?: string
          project_id?: string
          scenario_type?: string
          tool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_tools_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_tools_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "business_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      metric_history: {
        Row: {
          avg_check: number | null
          break_even_point: number | null
          cac: number | null
          conversion_rate: number | null
          cpl: number | null
          created_at: string
          fixed_costs: number | null
          id: string
          marketing_costs: number | null
          new_clients: number | null
          profit: number | null
          profit_margin: number | null
          project_id: string
          returning_clients: number | null
          revenue: number | null
          scenario_type: string
          snapshot_date: string
          total_clients: number | null
          variable_costs: number | null
        }
        Insert: {
          avg_check?: number | null
          break_even_point?: number | null
          cac?: number | null
          conversion_rate?: number | null
          cpl?: number | null
          created_at?: string
          fixed_costs?: number | null
          id?: string
          marketing_costs?: number | null
          new_clients?: number | null
          profit?: number | null
          profit_margin?: number | null
          project_id: string
          returning_clients?: number | null
          revenue?: number | null
          scenario_type: string
          snapshot_date?: string
          total_clients?: number | null
          variable_costs?: number | null
        }
        Update: {
          avg_check?: number | null
          break_even_point?: number | null
          cac?: number | null
          conversion_rate?: number | null
          cpl?: number | null
          created_at?: string
          fixed_costs?: number | null
          id?: string
          marketing_costs?: number | null
          new_clients?: number | null
          profit?: number | null
          profit_margin?: number | null
          project_id?: string
          returning_clients?: number | null
          revenue?: number | null
          scenario_type?: string
          snapshot_date?: string
          total_clients?: number | null
          variable_costs?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "metric_history_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          cost: number
          created_at: string
          id: string
          name: string
          price: number
          project_id: string
          quantity: number
          updated_at: string
        }
        Insert: {
          cost?: number
          created_at?: string
          id?: string
          name: string
          price?: number
          project_id: string
          quantity?: number
          updated_at?: string
        }
        Update: {
          cost?: number
          created_at?: string
          id?: string
          name?: string
          price?: number
          project_id?: string
          quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          currency: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scenario_summaries: {
        Row: {
          created_at: string
          id: string
          project_id: string
          recommendations: string | null
          scenario_type: string
          summary: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          recommendations?: string | null
          scenario_type: string
          summary?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          recommendations?: string | null
          scenario_type?: string
          summary?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scenario_summaries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      scenarios: {
        Row: {
          avg_check: number | null
          conversion_rate: number | null
          created_at: string
          fixed_costs: number | null
          id: string
          marketing_costs: number | null
          new_clients: number | null
          project_id: string
          returning_clients: number | null
          revenue: number | null
          scenario_type: string
          total_clients: number | null
          updated_at: string
          variable_costs: number | null
        }
        Insert: {
          avg_check?: number | null
          conversion_rate?: number | null
          created_at?: string
          fixed_costs?: number | null
          id?: string
          marketing_costs?: number | null
          new_clients?: number | null
          project_id: string
          returning_clients?: number | null
          revenue?: number | null
          scenario_type: string
          total_clients?: number | null
          updated_at?: string
          variable_costs?: number | null
        }
        Update: {
          avg_check?: number | null
          conversion_rate?: number | null
          created_at?: string
          fixed_costs?: number | null
          id?: string
          marketing_costs?: number | null
          new_clients?: number | null
          project_id?: string
          returning_clients?: number | null
          revenue?: number | null
          scenario_type?: string
          total_clients?: number | null
          updated_at?: string
          variable_costs?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "scenarios_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      swot_analyses: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_name: string
          entity_type: string
          id: string
          opportunities: string[] | null
          project_id: string
          strengths: string[] | null
          threats: string[] | null
          updated_at: string
          weaknesses: string[] | null
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_name: string
          entity_type: string
          id?: string
          opportunities?: string[] | null
          project_id: string
          strengths?: string[] | null
          threats?: string[] | null
          updated_at?: string
          weaknesses?: string[] | null
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_name?: string
          entity_type?: string
          id?: string
          opportunities?: string[] | null
          project_id?: string
          strengths?: string[] | null
          threats?: string[] | null
          updated_at?: string
          weaknesses?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "swot_analyses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
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
