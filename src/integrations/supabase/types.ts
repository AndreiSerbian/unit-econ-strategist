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
      competitor_products: {
        Row: {
          annual_revenue: number | null
          annual_sales: number | null
          competitor_id: string
          created_at: string
          id: string
          name: string
          price: number
          sales_channels: string[] | null
          updated_at: string
        }
        Insert: {
          annual_revenue?: number | null
          annual_sales?: number | null
          competitor_id: string
          created_at?: string
          id?: string
          name: string
          price?: number
          sales_channels?: string[] | null
          updated_at?: string
        }
        Update: {
          annual_revenue?: number | null
          annual_sales?: number | null
          competitor_id?: string
          created_at?: string
          id?: string
          name?: string
          price?: number
          sales_channels?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "competitor_products_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "competitors"
            referencedColumns: ["id"]
          },
        ]
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
      detailed_expenses: {
        Row: {
          created_at: string | null
          expenses: Json
          id: string
          lead_sources: Json | null
          project_id: string
          scenario_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          expenses?: Json
          id?: string
          lead_sources?: Json | null
          project_id: string
          scenario_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          expenses?: Json
          id?: string
          lead_sources?: Json | null
          project_id?: string
          scenario_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "detailed_expenses_project_id_fkey"
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
      logistics_tariffs: {
        Row: {
          created_at: string | null
          id: string
          project_id: string
          tariffs: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id: string
          tariffs?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string
          tariffs?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "logistics_tariffs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      market_overview: {
        Row: {
          created_at: string
          id: string
          market_growth_rate: number
          market_size: number
          project_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          market_growth_rate?: number
          market_size?: number
          project_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          market_growth_rate?: number
          market_size?: number
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "market_overview_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
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
      product_channel_allocations: {
        Row: {
          channel_id: string
          created_at: string | null
          id: string
          price_override: number | null
          product_id: string
          project_id: string
          quantity: number | null
          updated_at: string | null
        }
        Insert: {
          channel_id: string
          created_at?: string | null
          id?: string
          price_override?: number | null
          product_id: string
          project_id: string
          quantity?: number | null
          updated_at?: string | null
        }
        Update: {
          channel_id?: string
          created_at?: string | null
          id?: string
          price_override?: number | null
          product_id?: string
          project_id?: string
          quantity?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_channel_allocations_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "sales_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_channel_allocations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_channel_allocations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      product_materials: {
        Row: {
          created_at: string
          id: string
          material_id: string
          product_id: string
          project_id: string
          quantity_per_unit: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          material_id: string
          product_id: string
          project_id: string
          quantity_per_unit?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          material_id?: string
          product_id?: string
          project_id?: string
          quantity_per_unit?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_materials_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "raw_materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_materials_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_materials_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          avg_order_value: number | null
          churn_rate: number | null
          cost: number
          created_at: string
          defect_rate: number | null
          delivery_type: string | null
          free_to_pay_conversion: number | null
          gmv: number | null
          hourly_rate: number | null
          hours_per_week: number | null
          id: string
          logistics_to_client: number | null
          name: string
          price: number
          project_id: string
          quality: number | null
          quantity: number
          take_rate: number | null
          updated_at: string
          utilization: number | null
          utilization_rate: number | null
          volume_per_unit: number | null
          weight_per_unit: number | null
        }
        Insert: {
          avg_order_value?: number | null
          churn_rate?: number | null
          cost?: number
          created_at?: string
          defect_rate?: number | null
          delivery_type?: string | null
          free_to_pay_conversion?: number | null
          gmv?: number | null
          hourly_rate?: number | null
          hours_per_week?: number | null
          id?: string
          logistics_to_client?: number | null
          name: string
          price?: number
          project_id: string
          quality?: number | null
          quantity?: number
          take_rate?: number | null
          updated_at?: string
          utilization?: number | null
          utilization_rate?: number | null
          volume_per_unit?: number | null
          weight_per_unit?: number | null
        }
        Update: {
          avg_order_value?: number | null
          churn_rate?: number | null
          cost?: number
          created_at?: string
          defect_rate?: number | null
          delivery_type?: string | null
          free_to_pay_conversion?: number | null
          gmv?: number | null
          hourly_rate?: number | null
          hours_per_week?: number | null
          id?: string
          logistics_to_client?: number | null
          name?: string
          price?: number
          project_id?: string
          quality?: number | null
          quantity?: number
          take_rate?: number | null
          updated_at?: string
          utilization?: number | null
          utilization_rate?: number | null
          volume_per_unit?: number | null
          weight_per_unit?: number | null
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
          business_type: string | null
          created_at: string
          currency: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          business_type?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          business_type?: string | null
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
      raw_materials: {
        Row: {
          created_at: string
          distance: number | null
          id: string
          logistics_to_production: number | null
          name: string
          price_per_unit: number
          project_id: string
          transport_type: string | null
          unit: string | null
          updated_at: string
          volume: number | null
          weight: number | null
        }
        Insert: {
          created_at?: string
          distance?: number | null
          id?: string
          logistics_to_production?: number | null
          name: string
          price_per_unit?: number
          project_id: string
          transport_type?: string | null
          unit?: string | null
          updated_at?: string
          volume?: number | null
          weight?: number | null
        }
        Update: {
          created_at?: string
          distance?: number | null
          id?: string
          logistics_to_production?: number | null
          name?: string
          price_per_unit?: number
          project_id?: string
          transport_type?: string | null
          unit?: string | null
          updated_at?: string
          volume?: number | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "raw_materials_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_channels: {
        Row: {
          commission_percent: number | null
          created_at: string | null
          discount_percent: number | null
          fulfillment_cost_per_unit: number | null
          id: string
          logistics_cost_per_unit: number | null
          min_order_quantity: number | null
          name: string
          payment_delay_days: number | null
          project_id: string
          return_rate_percent: number | null
          type: string
          updated_at: string | null
        }
        Insert: {
          commission_percent?: number | null
          created_at?: string | null
          discount_percent?: number | null
          fulfillment_cost_per_unit?: number | null
          id?: string
          logistics_cost_per_unit?: number | null
          min_order_quantity?: number | null
          name: string
          payment_delay_days?: number | null
          project_id: string
          return_rate_percent?: number | null
          type?: string
          updated_at?: string | null
        }
        Update: {
          commission_percent?: number | null
          created_at?: string | null
          discount_percent?: number | null
          fulfillment_cost_per_unit?: number | null
          id?: string
          logistics_cost_per_unit?: number | null
          min_order_quantity?: number | null
          name?: string
          payment_delay_days?: number | null
          project_id?: string
          return_rate_percent?: number | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_channels_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
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
