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
      api_models: {
        Row: {
          active: boolean
          api_cost_usd: number
          created_at: string
          description: string | null
          id: string
          mode_or_variant: string | null
          model_class: string | null
          model_code: string
          model_name: string
          model_type: string | null
          project_id: string
          provider_id: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          api_cost_usd?: number
          created_at?: string
          description?: string | null
          id?: string
          mode_or_variant?: string | null
          model_class?: string | null
          model_code: string
          model_name: string
          model_type?: string | null
          project_id: string
          provider_id?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          api_cost_usd?: number
          created_at?: string
          description?: string | null
          id?: string
          mode_or_variant?: string | null
          model_class?: string | null
          model_code?: string
          model_name?: string
          model_type?: string | null
          project_id?: string
          provider_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_models_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_models_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "api_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      api_providers: {
        Row: {
          base_url: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          project_id: string
          updated_at: string
        }
        Insert: {
          base_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          project_id: string
          updated_at?: string
        }
        Update: {
          base_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_providers_project_id_fkey"
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
      cashflow_lines: {
        Row: {
          category: string
          created_at: string
          formula_config: Json | null
          id: string
          is_active: boolean
          line_type: string
          name: string
          sort_order: number
          source: string
          source_adapter: string | null
          timeline_id: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          formula_config?: Json | null
          id?: string
          is_active?: boolean
          line_type: string
          name: string
          sort_order?: number
          source?: string
          source_adapter?: string | null
          timeline_id: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          formula_config?: Json | null
          id?: string
          is_active?: boolean
          line_type?: string
          name?: string
          sort_order?: number
          source?: string
          source_adapter?: string | null
          timeline_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cashflow_lines_timeline_id_fkey"
            columns: ["timeline_id"]
            isOneToOne: false
            referencedRelation: "cashflow_timelines"
            referencedColumns: ["id"]
          },
        ]
      }
      cashflow_points: {
        Row: {
          amount: number
          created_at: string
          id: string
          is_override: boolean
          line_id: string
          notes: string | null
          period_index: number
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          is_override?: boolean
          line_id: string
          notes?: string | null
          period_index: number
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          is_override?: boolean
          line_id?: string
          notes?: string | null
          period_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "cashflow_points_line_id_fkey"
            columns: ["line_id"]
            isOneToOne: false
            referencedRelation: "cashflow_lines"
            referencedColumns: ["id"]
          },
        ]
      }
      cashflow_timelines: {
        Row: {
          created_at: string
          discount_rate_annual: number
          horizon_periods: number
          id: string
          name: string
          planning_period: string
          project_id: string
          scenario_type: string
          start_date: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount_rate_annual?: number
          horizon_periods?: number
          id?: string
          name?: string
          planning_period?: string
          project_id: string
          scenario_type?: string
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount_rate_annual?: number
          horizon_periods?: number
          id?: string
          name?: string
          planning_period?: string
          project_id?: string
          scenario_type?: string
          start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cashflow_timelines_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      category_channel_stats: {
        Row: {
          category_id: string
          channel_id: string
          created_at: string
          id: string
          is_active: boolean
          share_percent: number | null
          take_rate_override_percent: number | null
          transactions_per_period: number | null
          updated_at: string
        }
        Insert: {
          category_id: string
          channel_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          share_percent?: number | null
          take_rate_override_percent?: number | null
          transactions_per_period?: number | null
          updated_at?: string
        }
        Update: {
          category_id?: string
          channel_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          share_percent?: number | null
          take_rate_override_percent?: number | null
          transactions_per_period?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "category_channel_stats_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "marketplace_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "category_channel_stats_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "sales_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      competitor_metrics: {
        Row: {
          competitor_id: string
          created_at: string
          id: string
          metrics: Json
          updated_at: string
        }
        Insert: {
          competitor_id: string
          created_at?: string
          id?: string
          metrics?: Json
          updated_at?: string
        }
        Update: {
          competitor_id?: string
          created_at?: string
          id?: string
          metrics?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "competitor_metrics_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: true
            referencedRelation: "competitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitor_metrics_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: true
            referencedRelation: "competitors_full"
            referencedColumns: ["id"]
          },
        ]
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
          {
            foreignKeyName: "competitor_products_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "competitors_full"
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
      composite_operation_items: {
        Row: {
          composite_id: string
          created_at: string
          id: string
          operation_id: string
          quantity: number
        }
        Insert: {
          composite_id: string
          created_at?: string
          id?: string
          operation_id: string
          quantity?: number
        }
        Update: {
          composite_id?: string
          created_at?: string
          id?: string
          operation_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "composite_operation_items_composite_id_fkey"
            columns: ["composite_id"]
            isOneToOne: false
            referencedRelation: "composite_operations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "composite_operation_items_operation_id_fkey"
            columns: ["operation_id"]
            isOneToOne: false
            referencedRelation: "operations_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      composite_operations: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          name: string
          project_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name: string
          project_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "composite_operations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_tariffs: {
        Row: {
          avg_distance_km: number | null
          base_cost: number
          cost_per_kg: number | null
          cost_per_m3: number | null
          created_at: string
          currency: string
          delivery_type: string
          id: string
          min_charge: number | null
          name: string
          notes: string | null
          pricing_model: string
          project_id: string
          updated_at: string
        }
        Insert: {
          avg_distance_km?: number | null
          base_cost?: number
          cost_per_kg?: number | null
          cost_per_m3?: number | null
          created_at?: string
          currency?: string
          delivery_type?: string
          id?: string
          min_charge?: number | null
          name: string
          notes?: string | null
          pricing_model?: string
          project_id: string
          updated_at?: string
        }
        Update: {
          avg_distance_km?: number | null
          base_cost?: number
          cost_per_kg?: number | null
          cost_per_m3?: number | null
          created_at?: string
          currency?: string
          delivery_type?: string
          id?: string
          min_charge?: number | null
          name?: string
          notes?: string | null
          pricing_model?: string
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_tariffs_project_id_fkey"
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
      marketplace_categories: {
        Row: {
          avg_check: number
          created_at: string
          description: string | null
          gmv_computed: number | null
          gmv_override: number | null
          id: string
          is_active: boolean
          name: string
          project_id: string
          sort_order: number
          take_rate_percent: number
          transactions_count: number
          updated_at: string
        }
        Insert: {
          avg_check?: number
          created_at?: string
          description?: string | null
          gmv_computed?: number | null
          gmv_override?: number | null
          id?: string
          is_active?: boolean
          name: string
          project_id: string
          sort_order?: number
          take_rate_percent?: number
          transactions_count?: number
          updated_at?: string
        }
        Update: {
          avg_check?: number
          created_at?: string
          description?: string | null
          gmv_computed?: number | null
          gmv_override?: number | null
          id?: string
          is_active?: boolean
          name?: string
          project_id?: string
          sort_order?: number
          take_rate_percent?: number
          transactions_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_categories_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
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
      model_pricing_image: {
        Row: {
          created_at: string
          id: string
          model_id: string
          price_per_image: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          model_id: string
          price_per_image?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          model_id?: string
          price_per_image?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "model_pricing_image_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: true
            referencedRelation: "api_models"
            referencedColumns: ["id"]
          },
        ]
      }
      model_pricing_text: {
        Row: {
          created_at: string
          id: string
          model_id: string
          price_cached_in_1m: number | null
          price_in_1m: number
          price_out_1m: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          model_id: string
          price_cached_in_1m?: number | null
          price_in_1m?: number
          price_out_1m?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          model_id?: string
          price_cached_in_1m?: number | null
          price_in_1m?: number
          price_out_1m?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "model_pricing_text_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: true
            referencedRelation: "api_models"
            referencedColumns: ["id"]
          },
        ]
      }
      operation_usage_forecast: {
        Row: {
          composite_id: string | null
          created_at: string
          expected_usage: number
          id: string
          operation_id: string | null
          project_id: string
          scenario_type: string
          updated_at: string
        }
        Insert: {
          composite_id?: string | null
          created_at?: string
          expected_usage?: number
          id?: string
          operation_id?: string | null
          project_id: string
          scenario_type?: string
          updated_at?: string
        }
        Update: {
          composite_id?: string | null
          created_at?: string
          expected_usage?: number
          id?: string
          operation_id?: string | null
          project_id?: string
          scenario_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "operation_usage_forecast_composite_id_fkey"
            columns: ["composite_id"]
            isOneToOne: false
            referencedRelation: "composite_operations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operation_usage_forecast_operation_id_fkey"
            columns: ["operation_id"]
            isOneToOne: false
            referencedRelation: "operations_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operation_usage_forecast_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      operations_catalog: {
        Row: {
          active: boolean
          api_cost_usd: number
          api_model_id: string | null
          base_it_cost: number | null
          created_at: string
          default_in_tok: number | null
          default_out_tok: number | null
          description: string | null
          id: string
          it_cost: number | null
          margin_usd: number | null
          markup_multiplier: number
          name: string
          operation_code: string
          operation_type: string
          project_id: string
          updated_at: string
          user_price_usd: number | null
        }
        Insert: {
          active?: boolean
          api_cost_usd?: number
          api_model_id?: string | null
          base_it_cost?: number | null
          created_at?: string
          default_in_tok?: number | null
          default_out_tok?: number | null
          description?: string | null
          id?: string
          it_cost?: number | null
          margin_usd?: number | null
          markup_multiplier?: number
          name: string
          operation_code: string
          operation_type?: string
          project_id: string
          updated_at?: string
          user_price_usd?: number | null
        }
        Update: {
          active?: boolean
          api_cost_usd?: number
          api_model_id?: string | null
          base_it_cost?: number | null
          created_at?: string
          default_in_tok?: number | null
          default_out_tok?: number | null
          description?: string | null
          id?: string
          it_cost?: number | null
          margin_usd?: number | null
          markup_multiplier?: number
          name?: string
          operation_code?: string
          operation_type?: string
          project_id?: string
          updated_at?: string
          user_price_usd?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "operations_catalog_api_model_id_fkey"
            columns: ["api_model_id"]
            isOneToOne: false
            referencedRelation: "api_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operations_catalog_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      package_capacities: {
        Row: {
          approx_count: number
          created_at: string
          id: string
          operation_id: string
          package_id: string
        }
        Insert: {
          approx_count?: number
          created_at?: string
          id?: string
          operation_id: string
          package_id: string
        }
        Update: {
          approx_count?: number
          created_at?: string
          id?: string
          operation_id?: string
          package_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_capacities_operation_id_fkey"
            columns: ["operation_id"]
            isOneToOne: false
            referencedRelation: "operations_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_capacities_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "token_packages"
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
            foreignKeyName: "product_channel_allocations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_full"
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
      product_channels: {
        Row: {
          channel_id: string
          channel_share_percent: number | null
          created_at: string
          id: string
          is_active: boolean | null
          price_override: number | null
          product_id: string
          updated_at: string
        }
        Insert: {
          channel_id: string
          channel_share_percent?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          price_override?: number | null
          product_id: string
          updated_at?: string
        }
        Update: {
          channel_id?: string
          channel_share_percent?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          price_override?: number | null
          product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_channels_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "sales_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_channels_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_channels_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_full"
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
            foreignKeyName: "product_materials_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_full"
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
          delivery_tariff_id: string | null
          delivery_type: string | null
          free_to_pay_conversion: number | null
          gmv: number | null
          hourly_rate: number | null
          hours_per_week: number | null
          id: string
          logistics_to_client: number | null
          manual_delivery_cost: number | null
          manual_delivery_override: boolean | null
          name: string
          new_subscribers: number | null
          price: number
          project_id: string
          quality: number | null
          quantity: number
          take_rate: number | null
          updated_at: string
          utilization: number | null
          utilization_rate: number | null
          volume_m3: number | null
          volume_per_unit: number | null
          weight_kg: number | null
          weight_per_unit: number | null
        }
        Insert: {
          avg_order_value?: number | null
          churn_rate?: number | null
          cost?: number
          created_at?: string
          defect_rate?: number | null
          delivery_tariff_id?: string | null
          delivery_type?: string | null
          free_to_pay_conversion?: number | null
          gmv?: number | null
          hourly_rate?: number | null
          hours_per_week?: number | null
          id?: string
          logistics_to_client?: number | null
          manual_delivery_cost?: number | null
          manual_delivery_override?: boolean | null
          name: string
          new_subscribers?: number | null
          price?: number
          project_id: string
          quality?: number | null
          quantity?: number
          take_rate?: number | null
          updated_at?: string
          utilization?: number | null
          utilization_rate?: number | null
          volume_m3?: number | null
          volume_per_unit?: number | null
          weight_kg?: number | null
          weight_per_unit?: number | null
        }
        Update: {
          avg_order_value?: number | null
          churn_rate?: number | null
          cost?: number
          created_at?: string
          defect_rate?: number | null
          delivery_tariff_id?: string | null
          delivery_type?: string | null
          free_to_pay_conversion?: number | null
          gmv?: number | null
          hourly_rate?: number | null
          hours_per_week?: number | null
          id?: string
          logistics_to_client?: number | null
          manual_delivery_cost?: number | null
          manual_delivery_override?: boolean | null
          name?: string
          new_subscribers?: number | null
          price?: number
          project_id?: string
          quality?: number | null
          quantity?: number
          take_rate?: number | null
          updated_at?: string
          utilization?: number | null
          utilization_rate?: number | null
          volume_m3?: number | null
          volume_per_unit?: number | null
          weight_kg?: number | null
          weight_per_unit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_delivery_tariff_id_fkey"
            columns: ["delivery_tariff_id"]
            isOneToOne: false
            referencedRelation: "delivery_tariffs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      products_marketplace: {
        Row: {
          avg_order_value: number | null
          created_at: string
          gmv: number | null
          product_id: string
          take_rate: number | null
          updated_at: string
        }
        Insert: {
          avg_order_value?: number | null
          created_at?: string
          gmv?: number | null
          product_id: string
          take_rate?: number | null
          updated_at?: string
        }
        Update: {
          avg_order_value?: number | null
          created_at?: string
          gmv?: number | null
          product_id?: string
          take_rate?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_marketplace_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_marketplace_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products_full"
            referencedColumns: ["id"]
          },
        ]
      }
      products_production: {
        Row: {
          created_at: string
          defect_rate: number | null
          product_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          defect_rate?: number | null
          product_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          defect_rate?: number | null
          product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_production_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_production_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products_full"
            referencedColumns: ["id"]
          },
        ]
      }
      products_saas: {
        Row: {
          arpu: number | null
          churn_rate: number | null
          created_at: string
          free_to_pay_conversion: number | null
          mrr: number | null
          new_subscribers: number | null
          product_id: string
          updated_at: string
        }
        Insert: {
          arpu?: number | null
          churn_rate?: number | null
          created_at?: string
          free_to_pay_conversion?: number | null
          mrr?: number | null
          new_subscribers?: number | null
          product_id: string
          updated_at?: string
        }
        Update: {
          arpu?: number | null
          churn_rate?: number | null
          created_at?: string
          free_to_pay_conversion?: number | null
          mrr?: number | null
          new_subscribers?: number | null
          product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_saas_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_saas_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products_full"
            referencedColumns: ["id"]
          },
        ]
      }
      products_services: {
        Row: {
          allocation_percent: number | null
          billable_percent: number | null
          billing_model: string | null
          clients_count: number | null
          created_at: string
          estimated_hours_per_project: number | null
          hourly_rate: number | null
          hours_per_week: number | null
          planned_billable_hours_per_period: number | null
          planning_period: string | null
          product_id: string
          retainer_fee: number | null
          updated_at: string
          utilization: number | null
        }
        Insert: {
          allocation_percent?: number | null
          billable_percent?: number | null
          billing_model?: string | null
          clients_count?: number | null
          created_at?: string
          estimated_hours_per_project?: number | null
          hourly_rate?: number | null
          hours_per_week?: number | null
          planned_billable_hours_per_period?: number | null
          planning_period?: string | null
          product_id: string
          retainer_fee?: number | null
          updated_at?: string
          utilization?: number | null
        }
        Update: {
          allocation_percent?: number | null
          billable_percent?: number | null
          billing_model?: string | null
          clients_count?: number | null
          created_at?: string
          estimated_hours_per_project?: number | null
          hourly_rate?: number | null
          hours_per_week?: number | null
          planned_billable_hours_per_period?: number | null
          planning_period?: string | null
          product_id?: string
          retainer_fee?: number | null
          updated_at?: string
          utilization?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_services_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_services_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products_full"
            referencedColumns: ["id"]
          },
        ]
      }
      products_sharing: {
        Row: {
          created_at: string
          product_id: string
          take_rate: number | null
          updated_at: string
          utilization_rate: number | null
        }
        Insert: {
          created_at?: string
          product_id: string
          take_rate?: number | null
          updated_at?: string
          utilization_rate?: number | null
        }
        Update: {
          created_at?: string
          product_id?: string
          take_rate?: number | null
          updated_at?: string
          utilization_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_sharing_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_sharing_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products_full"
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
          planning_period: string | null
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
          planning_period?: string | null
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
          planning_period?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      raw_material_logistics: {
        Row: {
          created_at: string
          distance_km: number | null
          id: string
          logistics_tariff_id: string
          raw_material_id: string
        }
        Insert: {
          created_at?: string
          distance_km?: number | null
          id?: string
          logistics_tariff_id: string
          raw_material_id: string
        }
        Update: {
          created_at?: string
          distance_km?: number | null
          id?: string
          logistics_tariff_id?: string
          raw_material_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "raw_material_logistics_logistics_tariff_id_fkey"
            columns: ["logistics_tariff_id"]
            isOneToOne: false
            referencedRelation: "logistics_tariffs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raw_material_logistics_raw_material_id_fkey"
            columns: ["raw_material_id"]
            isOneToOne: false
            referencedRelation: "raw_materials"
            referencedColumns: ["id"]
          },
        ]
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
      saas_plans: {
        Row: {
          billing_type: Database["public"]["Enums"]["billing_type"]
          churn_rate_percent: number | null
          cost_per_buyer_eur: number | null
          cost_per_subscriber_per_month_eur: number
          created_at: string
          id: string
          is_free_plan: boolean
          name: string
          new_subscribers_per_period: number
          price_eur: number
          product_id: string
          sort_order: number
          subscribers: number
          updated_at: string
        }
        Insert: {
          billing_type?: Database["public"]["Enums"]["billing_type"]
          churn_rate_percent?: number | null
          cost_per_buyer_eur?: number | null
          cost_per_subscriber_per_month_eur?: number
          created_at?: string
          id?: string
          is_free_plan?: boolean
          name: string
          new_subscribers_per_period?: number
          price_eur?: number
          product_id: string
          sort_order?: number
          subscribers?: number
          updated_at?: string
        }
        Update: {
          billing_type?: Database["public"]["Enums"]["billing_type"]
          churn_rate_percent?: number | null
          cost_per_buyer_eur?: number | null
          cost_per_subscriber_per_month_eur?: number
          created_at?: string
          id?: string
          is_free_plan?: boolean
          name?: string
          new_subscribers_per_period?: number
          price_eur?: number
          product_id?: string
          sort_order?: number
          subscribers?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "saas_plans_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "saas_products"
            referencedColumns: ["id"]
          },
        ]
      }
      saas_products: {
        Row: {
          created_at: string
          default_channel_id: string | null
          id: string
          name: string
          planning_period: string
          project_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_channel_id?: string | null
          id?: string
          name: string
          planning_period?: string
          project_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_channel_id?: string | null
          id?: string
          name?: string
          planning_period?: string
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "saas_products_default_channel_id_fkey"
            columns: ["default_channel_id"]
            isOneToOne: false
            referencedRelation: "sales_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saas_products_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_channels: {
        Row: {
          commission_fixed: number | null
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
          commission_fixed?: number | null
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
          commission_fixed?: number | null
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
      token_economics_config: {
        Row: {
          created_at: string
          default_image_markup: number
          default_premium_markup: number
          default_text_markup: number
          id: string
          it_value_usd: number
          project_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_image_markup?: number
          default_premium_markup?: number
          default_text_markup?: number
          id?: string
          it_value_usd?: number
          project_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_image_markup?: number
          default_premium_markup?: number
          default_text_markup?: number
          id?: string
          it_value_usd?: number
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "token_economics_config_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      token_packages: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          expected_sales: number
          id: string
          it_amount: number
          name: string
          price_usd: number
          project_id: string
          scenario_type: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          expected_sales?: number
          id?: string
          it_amount: number
          name: string
          price_usd: number
          project_id: string
          scenario_type?: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          expected_sales?: number
          id?: string
          it_amount?: number
          name?: string
          price_usd?: number
          project_id?: string
          scenario_type?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "token_packages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      competitors_full: {
        Row: {
          created_at: string | null
          id: string | null
          market_share: number | null
          marketing_spend: number | null
          metrics: Json | null
          name: string | null
          pricing: number | null
          project_id: string | null
          quality: number | null
          revenue: number | null
          updated_at: string | null
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
      products_full: {
        Row: {
          allocation_percent: number | null
          avg_order_value: number | null
          billable_percent: number | null
          billing_model: string | null
          churn_rate: number | null
          cost: number | null
          created_at: string | null
          defect_rate: number | null
          delivery_type: string | null
          estimated_hours_per_project: number | null
          free_to_pay_conversion: number | null
          gmv: number | null
          hourly_rate: number | null
          hours_per_week: number | null
          id: string | null
          logistics_to_client: number | null
          marketplace_take_rate: number | null
          name: string | null
          new_subscribers: number | null
          planned_billable_hours_per_period: number | null
          planning_period: string | null
          price: number | null
          project_id: string | null
          quality: number | null
          quantity: number | null
          retainer_fee: number | null
          saas_arpu: number | null
          saas_mrr: number | null
          services_clients_count: number | null
          sharing_take_rate: number | null
          updated_at: string | null
          utilization: number | null
          utilization_rate: number | null
          volume_per_unit: number | null
          weight_per_unit: number | null
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
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      billing_type: "subscription" | "one_time"
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
      billing_type: ["subscription", "one_time"],
    },
  },
} as const
