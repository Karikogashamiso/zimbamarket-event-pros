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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      booking_analytics: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          referrer: string | null
          service_id: string
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          referrer?: string | null
          service_id: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          referrer?: string | null
          service_id?: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_analytics_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "business_metrics"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "booking_analytics_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_conflicts: {
        Row: {
          conflict_date: string
          conflict_time: string | null
          conflict_type: string
          created_at: string
          description: string | null
          id: string
          resolution_notes: string | null
          resolved: boolean | null
          resolved_at: string | null
          service_id: string
          severity: string
        }
        Insert: {
          conflict_date: string
          conflict_time?: string | null
          conflict_type: string
          created_at?: string
          description?: string | null
          id?: string
          resolution_notes?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          service_id: string
          severity: string
        }
        Update: {
          conflict_date?: string
          conflict_time?: string | null
          conflict_type?: string
          created_at?: string
          description?: string | null
          id?: string
          resolution_notes?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          service_id?: string
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_conflicts_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "business_metrics"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "booking_conflicts_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_requests: {
        Row: {
          created_at: string
          event_date: string | null
          guest_email: string | null
          guest_name: string | null
          guest_phone: string | null
          id: string
          message: string | null
          payment_id: string | null
          payment_status: string | null
          service_id: string
          status: string | null
          total_amount: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_date?: string | null
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          message?: string | null
          payment_id?: string | null
          payment_status?: string | null
          service_id: string
          status?: string | null
          total_amount?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_date?: string | null
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          message?: string | null
          payment_id?: string | null
          payment_status?: string | null
          service_id?: string
          status?: string | null
          total_amount?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_requests_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_requests_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "business_metrics"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "booking_requests_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      business_listings: {
        Row: {
          address: string | null
          amenities: string[] | null
          business_name: string
          capacity_max: number | null
          capacity_min: number | null
          category_id: string
          created_at: string
          description: string
          email: string | null
          featured: boolean | null
          id: string
          images: string[] | null
          location: string
          phone_number: string | null
          price_from: number | null
          price_unit: string | null
          status: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          address?: string | null
          amenities?: string[] | null
          business_name: string
          capacity_max?: number | null
          capacity_min?: number | null
          category_id: string
          created_at?: string
          description: string
          email?: string | null
          featured?: boolean | null
          id?: string
          images?: string[] | null
          location: string
          phone_number?: string | null
          price_from?: number | null
          price_unit?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string | null
          amenities?: string[] | null
          business_name?: string
          capacity_max?: number | null
          capacity_min?: number | null
          category_id?: string
          created_at?: string
          description?: string
          email?: string | null
          featured?: boolean | null
          id?: string
          images?: string[] | null
          location?: string
          phone_number?: string | null
          price_from?: number | null
          price_unit?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_listings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon: string
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          message: string
          phone: string | null
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          message: string
          phone?: string | null
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          message?: string
          phone?: string | null
          subject?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          id: string
          metadata: Json | null
          payment_type: string
          status: string | null
          stripe_payment_intent_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          id?: string
          metadata?: Json | null
          payment_type: string
          status?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          id?: string
          metadata?: Json | null
          payment_type?: string
          status?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      pricing_models: {
        Row: {
          base_price: number
          created_at: string
          demand_threshold: number | null
          dynamic_pricing_enabled: boolean | null
          id: string
          off_peak_multiplier: number | null
          peak_multiplier: number | null
          seasonal_adjustments: Json | null
          service_id: string
          updated_at: string
        }
        Insert: {
          base_price: number
          created_at?: string
          demand_threshold?: number | null
          dynamic_pricing_enabled?: boolean | null
          id?: string
          off_peak_multiplier?: number | null
          peak_multiplier?: number | null
          seasonal_adjustments?: Json | null
          service_id: string
          updated_at?: string
        }
        Update: {
          base_price?: number
          created_at?: string
          demand_threshold?: number | null
          dynamic_pricing_enabled?: boolean | null
          id?: string
          off_peak_multiplier?: number | null
          peak_multiplier?: number | null
          seasonal_adjustments?: Json | null
          service_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricing_models_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "business_metrics"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "pricing_models_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          phone_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          helpful_count: number | null
          id: string
          rating: number
          reviewer_name: string
          service_id: string
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          rating: number
          reviewer_name: string
          service_id: string
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          rating?: number
          reviewer_name?: string
          service_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "business_metrics"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "reviews_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_availability: {
        Row: {
          created_at: string
          current_bookings: number | null
          date: string
          id: string
          is_available: boolean | null
          max_capacity: number | null
          notes: string | null
          price_override: number | null
          service_id: string
          time_slot: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_bookings?: number | null
          date: string
          id?: string
          is_available?: boolean | null
          max_capacity?: number | null
          notes?: string | null
          price_override?: number | null
          service_id: string
          time_slot?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_bookings?: number | null
          date?: string
          id?: string
          is_available?: boolean | null
          max_capacity?: number | null
          notes?: string | null
          price_override?: number | null
          service_id?: string
          time_slot?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_availability_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "business_metrics"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "service_availability_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_images: {
        Row: {
          alt_text: string | null
          created_at: string
          display_order: number | null
          id: string
          image_url: string
          is_primary: boolean | null
          service_id: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url: string
          is_primary?: boolean | null
          service_id: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string
          is_primary?: boolean | null
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_images_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "business_metrics"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "service_images_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          active: boolean | null
          address: string | null
          amenities: string[] | null
          availability_status: string | null
          capacity_max: number | null
          capacity_min: number | null
          category_id: string
          created_at: string
          description: string
          email: string | null
          featured: boolean | null
          full_description: string | null
          id: string
          image_url: string | null
          location: string
          phone_number: string | null
          price_from: number | null
          price_unit: string | null
          rating: number | null
          response_time: string | null
          review_count: number | null
          title: string
          updated_at: string
          verified: boolean | null
          website: string | null
        }
        Insert: {
          active?: boolean | null
          address?: string | null
          amenities?: string[] | null
          availability_status?: string | null
          capacity_max?: number | null
          capacity_min?: number | null
          category_id: string
          created_at?: string
          description: string
          email?: string | null
          featured?: boolean | null
          full_description?: string | null
          id?: string
          image_url?: string | null
          location: string
          phone_number?: string | null
          price_from?: number | null
          price_unit?: string | null
          rating?: number | null
          response_time?: string | null
          review_count?: number | null
          title: string
          updated_at?: string
          verified?: boolean | null
          website?: string | null
        }
        Update: {
          active?: boolean | null
          address?: string | null
          amenities?: string[] | null
          availability_status?: string | null
          capacity_max?: number | null
          capacity_min?: number | null
          category_id?: string
          created_at?: string
          description?: string
          email?: string | null
          featured?: boolean | null
          full_description?: string | null
          id?: string
          image_url?: string | null
          location?: string
          phone_number?: string | null
          price_from?: number | null
          price_unit?: string | null
          rating?: number | null
          response_time?: string | null
          review_count?: number | null
          title?: string
          updated_at?: string
          verified?: boolean | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      translations: {
        Row: {
          context: string | null
          created_at: string
          id: string
          key: string
          language_code: string
          updated_at: string
          value: string
        }
        Insert: {
          context?: string | null
          created_at?: string
          id?: string
          key: string
          language_code: string
          updated_at?: string
          value: string
        }
        Update: {
          context?: string | null
          created_at?: string
          id?: string
          key?: string
          language_code?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          id: string
          preferences: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          preferences?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          preferences?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      business_metrics: {
        Row: {
          booking_conversion_rate: number | null
          inquiry_conversion_rate: number | null
          period: string | null
          service_id: string | null
          service_name: string | null
          total_bookings: number | null
          total_conversions: number | null
          total_inquiries: number | null
          total_views: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      refresh_business_metrics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "business_owner" | "user"
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
      app_role: ["admin", "business_owner", "user"],
    },
  },
} as const
