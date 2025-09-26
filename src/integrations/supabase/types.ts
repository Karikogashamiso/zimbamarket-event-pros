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
      device_fingerprints: {
        Row: {
          blocked_reason: string | null
          created_at: string
          device_info: Json
          fingerprint_hash: string
          first_seen_at: string
          fraud_score: number | null
          id: string
          is_blocked: boolean | null
          last_seen_at: string
          order_count: number | null
        }
        Insert: {
          blocked_reason?: string | null
          created_at?: string
          device_info?: Json
          fingerprint_hash: string
          first_seen_at?: string
          fraud_score?: number | null
          id?: string
          is_blocked?: boolean | null
          last_seen_at?: string
          order_count?: number | null
        }
        Update: {
          blocked_reason?: string | null
          created_at?: string
          device_info?: Json
          fingerprint_hash?: string
          first_seen_at?: string
          fraud_score?: number | null
          id?: string
          is_blocked?: boolean | null
          last_seen_at?: string
          order_count?: number | null
        }
        Relationships: []
      }
      events: {
        Row: {
          age_restriction: number | null
          cancellation_reason: string | null
          created_at: string
          description: string | null
          dress_code: string | null
          end_datetime: string | null
          event_category: Database["public"]["Enums"]["event_category"]
          featured_image: string | null
          id: string
          images: string[] | null
          is_cancelled: boolean | null
          is_featured: boolean | null
          is_published: boolean | null
          max_tickets_per_order: number | null
          metadata: Json | null
          organizer_id: string
          sales_end_datetime: string | null
          sales_start_datetime: string | null
          seat_map_id: string | null
          slug: string | null
          special_instructions: string | null
          start_datetime: string
          timezone: string | null
          title: string
          updated_at: string
          venue_id: string
        }
        Insert: {
          age_restriction?: number | null
          cancellation_reason?: string | null
          created_at?: string
          description?: string | null
          dress_code?: string | null
          end_datetime?: string | null
          event_category: Database["public"]["Enums"]["event_category"]
          featured_image?: string | null
          id?: string
          images?: string[] | null
          is_cancelled?: boolean | null
          is_featured?: boolean | null
          is_published?: boolean | null
          max_tickets_per_order?: number | null
          metadata?: Json | null
          organizer_id: string
          sales_end_datetime?: string | null
          sales_start_datetime?: string | null
          seat_map_id?: string | null
          slug?: string | null
          special_instructions?: string | null
          start_datetime: string
          timezone?: string | null
          title: string
          updated_at?: string
          venue_id: string
        }
        Update: {
          age_restriction?: number | null
          cancellation_reason?: string | null
          created_at?: string
          description?: string | null
          dress_code?: string | null
          end_datetime?: string | null
          event_category?: Database["public"]["Enums"]["event_category"]
          featured_image?: string | null
          id?: string
          images?: string[] | null
          is_cancelled?: boolean | null
          is_featured?: boolean | null
          is_published?: boolean | null
          max_tickets_per_order?: number | null
          metadata?: Json | null
          organizer_id?: string
          sales_end_datetime?: string | null
          sales_start_datetime?: string | null
          seat_map_id?: string | null
          slug?: string | null
          special_instructions?: string | null
          start_datetime?: string
          timezone?: string | null
          title?: string
          updated_at?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "organizers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_seat_map_id_fkey"
            columns: ["seat_map_id"]
            isOneToOne: false
            referencedRelation: "seat_maps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      fraud_alerts: {
        Row: {
          alert_type: string
          created_at: string
          details: Json
          entity_id: string
          entity_type: string
          id: string
          resolved_at: string | null
          resolved_by_user_id: string | null
          rule_id: string | null
          severity_level: string
          status: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          details?: Json
          entity_id: string
          entity_type: string
          id?: string
          resolved_at?: string | null
          resolved_by_user_id?: string | null
          rule_id?: string | null
          severity_level?: string
          status?: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          details?: Json
          entity_id?: string
          entity_type?: string
          id?: string
          resolved_at?: string | null
          resolved_by_user_id?: string | null
          rule_id?: string | null
          severity_level?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "fraud_alerts_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "fraud_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      fraud_rules: {
        Row: {
          action_type: string
          created_at: string
          id: string
          is_active: boolean
          parameters: Json
          rule_name: string
          rule_type: string
          severity_level: string
          updated_at: string
        }
        Insert: {
          action_type?: string
          created_at?: string
          id?: string
          is_active?: boolean
          parameters?: Json
          rule_name: string
          rule_type: string
          severity_level?: string
          updated_at?: string
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          is_active?: boolean
          parameters?: Json
          rule_name?: string
          rule_type?: string
          severity_level?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscriptions: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          metadata: Json | null
          source: string
          subscribed_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          metadata?: Json | null
          source?: string
          subscribed_at?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          metadata?: Json | null
          source?: string
          subscribed_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          booking_source: string | null
          booking_status: Database["public"]["Enums"]["booking_status"] | null
          cancelled_at: string | null
          confirmed_at: string | null
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          customer_email: string
          customer_first_name: string
          customer_last_name: string
          customer_phone: string | null
          expires_at: string | null
          id: string
          metadata: Json | null
          order_number: string
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          referral_code: string | null
          service_fee: number | null
          special_requests: string | null
          subtotal: number
          tax_amount: number | null
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          booking_source?: string | null
          booking_status?: Database["public"]["Enums"]["booking_status"] | null
          cancelled_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          customer_email: string
          customer_first_name: string
          customer_last_name: string
          customer_phone?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          order_number: string
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          referral_code?: string | null
          service_fee?: number | null
          special_requests?: string | null
          subtotal: number
          tax_amount?: number | null
          total_amount: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          booking_source?: string | null
          booking_status?: Database["public"]["Enums"]["booking_status"] | null
          cancelled_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          customer_email?: string
          customer_first_name?: string
          customer_last_name?: string
          customer_phone?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          order_number?: string
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          referral_code?: string | null
          service_fee?: number | null
          special_requests?: string | null
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      organizers: {
        Row: {
          address: string | null
          bank_details: Json | null
          business_name: string
          business_registration_number: string | null
          business_type: Database["public"]["Enums"]["business_type"]
          city: string | null
          commission_rate: number | null
          country: string | null
          created_at: string
          description: string | null
          email: string
          id: string
          is_verified: boolean | null
          metadata: Json | null
          phone_number: string | null
          status: string | null
          tax_id: string | null
          updated_at: string
          user_id: string
          verification_documents: Json | null
          website: string | null
        }
        Insert: {
          address?: string | null
          bank_details?: Json | null
          business_name: string
          business_registration_number?: string | null
          business_type: Database["public"]["Enums"]["business_type"]
          city?: string | null
          commission_rate?: number | null
          country?: string | null
          created_at?: string
          description?: string | null
          email: string
          id?: string
          is_verified?: boolean | null
          metadata?: Json | null
          phone_number?: string | null
          status?: string | null
          tax_id?: string | null
          updated_at?: string
          user_id: string
          verification_documents?: Json | null
          website?: string | null
        }
        Update: {
          address?: string | null
          bank_details?: Json | null
          business_name?: string
          business_registration_number?: string | null
          business_type?: Database["public"]["Enums"]["business_type"]
          city?: string | null
          commission_rate?: number | null
          country?: string | null
          created_at?: string
          description?: string | null
          email?: string
          id?: string
          is_verified?: boolean | null
          metadata?: Json | null
          phone_number?: string | null
          status?: string | null
          tax_id?: string | null
          updated_at?: string
          user_id?: string
          verification_documents?: Json | null
          website?: string | null
        }
        Relationships: []
      }
      passenger_checkins: {
        Row: {
          baggage_count: number | null
          baggage_weight_kg: number | null
          boarding_group: string | null
          boarding_priority: number | null
          checked_in_by_user_id: string
          checkin_datetime: string
          checkin_location: string | null
          id: string
          metadata: Json | null
          new_seat_id: string | null
          notes: string | null
          seat_assignment_changed: boolean | null
          special_baggage: Json | null
          ticket_id: string
        }
        Insert: {
          baggage_count?: number | null
          baggage_weight_kg?: number | null
          boarding_group?: string | null
          boarding_priority?: number | null
          checked_in_by_user_id: string
          checkin_datetime?: string
          checkin_location?: string | null
          id?: string
          metadata?: Json | null
          new_seat_id?: string | null
          notes?: string | null
          seat_assignment_changed?: boolean | null
          special_baggage?: Json | null
          ticket_id: string
        }
        Update: {
          baggage_count?: number | null
          baggage_weight_kg?: number | null
          boarding_group?: string | null
          boarding_priority?: number | null
          checked_in_by_user_id?: string
          checkin_datetime?: string
          checkin_location?: string | null
          id?: string
          metadata?: Json | null
          new_seat_id?: string | null
          notes?: string | null
          seat_assignment_changed?: boolean | null
          special_baggage?: Json | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "passenger_checkins_new_seat_id_fkey"
            columns: ["new_seat_id"]
            isOneToOne: false
            referencedRelation: "seats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "passenger_checkins_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          failure_reason: string | null
          fees_amount: number | null
          id: string
          metadata: Json | null
          net_amount: number | null
          order_id: string
          payment_method: string
          payment_provider: string | null
          provider_response: Json | null
          provider_transaction_id: string | null
          retry_count: number | null
          settled_at: string | null
          settlement_amount: number | null
          settlement_currency:
            | Database["public"]["Enums"]["currency_code"]
            | null
          status: Database["public"]["Enums"]["payment_status"] | null
          transaction_type: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          failure_reason?: string | null
          fees_amount?: number | null
          id?: string
          metadata?: Json | null
          net_amount?: number | null
          order_id: string
          payment_method: string
          payment_provider?: string | null
          provider_response?: Json | null
          provider_transaction_id?: string | null
          retry_count?: number | null
          settled_at?: string | null
          settlement_amount?: number | null
          settlement_currency?:
            | Database["public"]["Enums"]["currency_code"]
            | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          failure_reason?: string | null
          fees_amount?: number | null
          id?: string
          metadata?: Json | null
          net_amount?: number | null
          order_id?: string
          payment_method?: string
          payment_provider?: string | null
          provider_response?: Json | null
          provider_transaction_id?: string | null
          retry_count?: number | null
          settled_at?: string | null
          settlement_amount?: number | null
          settlement_currency?:
            | Database["public"]["Enums"]["currency_code"]
            | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
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
      purchase_risk_scores: {
        Row: {
          approved_by_user_id: string | null
          created_at: string
          device_analysis: Json | null
          geolocation_analysis: Json | null
          id: string
          manual_review_required: boolean | null
          order_id: string
          payment_analysis: Json | null
          risk_factors: Json
          risk_score: number
          updated_at: string
          velocity_flags: Json | null
        }
        Insert: {
          approved_by_user_id?: string | null
          created_at?: string
          device_analysis?: Json | null
          geolocation_analysis?: Json | null
          id?: string
          manual_review_required?: boolean | null
          order_id: string
          payment_analysis?: Json | null
          risk_factors?: Json
          risk_score?: number
          updated_at?: string
          velocity_flags?: Json | null
        }
        Update: {
          approved_by_user_id?: string | null
          created_at?: string
          device_analysis?: Json | null
          geolocation_analysis?: Json | null
          id?: string
          manual_review_required?: boolean | null
          order_id?: string
          payment_analysis?: Json | null
          risk_factors?: Json
          risk_score?: number
          updated_at?: string
          velocity_flags?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_risk_scores_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_signing_keys: {
        Row: {
          algorithm: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          key_id: string
          private_key_hash: string
          public_key: string
          revoked_at: string | null
        }
        Insert: {
          algorithm?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_id: string
          private_key_hash: string
          public_key: string
          revoked_at?: string | null
        }
        Update: {
          algorithm?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_id?: string
          private_key_hash?: string
          public_key?: string
          revoked_at?: string | null
        }
        Relationships: []
      }
      refund_requests: {
        Row: {
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          eligibility_notes: string | null
          id: string
          is_eligible: boolean | null
          metadata: Json | null
          order_id: string
          original_amount: number
          payment_transaction_id: string | null
          processed_at: string | null
          processed_by_user_id: string | null
          processing_notes: string | null
          provider_refund_id: string | null
          refund_amount: number
          refund_reason: string
          refund_type: string
          requested_by_user_id: string | null
          service_fee_refund: number | null
          status: Database["public"]["Enums"]["refund_status"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          eligibility_notes?: string | null
          id?: string
          is_eligible?: boolean | null
          metadata?: Json | null
          order_id: string
          original_amount: number
          payment_transaction_id?: string | null
          processed_at?: string | null
          processed_by_user_id?: string | null
          processing_notes?: string | null
          provider_refund_id?: string | null
          refund_amount: number
          refund_reason: string
          refund_type: string
          requested_by_user_id?: string | null
          service_fee_refund?: number | null
          status?: Database["public"]["Enums"]["refund_status"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          eligibility_notes?: string | null
          id?: string
          is_eligible?: boolean | null
          metadata?: Json | null
          order_id?: string
          original_amount?: number
          payment_transaction_id?: string | null
          processed_at?: string | null
          processed_by_user_id?: string | null
          processing_notes?: string | null
          provider_refund_id?: string | null
          refund_amount?: number
          refund_reason?: string
          refund_type?: string
          requested_by_user_id?: string | null
          service_fee_refund?: number | null
          status?: Database["public"]["Enums"]["refund_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "refund_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refund_requests_payment_transaction_id_fkey"
            columns: ["payment_transaction_id"]
            isOneToOne: false
            referencedRelation: "payment_transactions"
            referencedColumns: ["id"]
          },
        ]
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
      seat_maps: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          seat_configuration: Json
          total_capacity: number
          updated_at: string
          venue_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          seat_configuration: Json
          total_capacity: number
          updated_at?: string
          venue_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          seat_configuration?: Json
          total_capacity?: number
          updated_at?: string
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seat_maps_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      seats: {
        Row: {
          base_price_multiplier: number | null
          created_at: string
          id: string
          is_accessible: boolean | null
          metadata: Json | null
          position_x: number | null
          position_y: number | null
          row_name: string | null
          seat_identifier: string
          seat_map_id: string | null
          seat_number: number | null
          seat_type: Database["public"]["Enums"]["seat_type"]
        }
        Insert: {
          base_price_multiplier?: number | null
          created_at?: string
          id?: string
          is_accessible?: boolean | null
          metadata?: Json | null
          position_x?: number | null
          position_y?: number | null
          row_name?: string | null
          seat_identifier: string
          seat_map_id?: string | null
          seat_number?: number | null
          seat_type?: Database["public"]["Enums"]["seat_type"]
        }
        Update: {
          base_price_multiplier?: number | null
          created_at?: string
          id?: string
          is_accessible?: boolean | null
          metadata?: Json | null
          position_x?: number | null
          position_y?: number | null
          row_name?: string | null
          seat_identifier?: string
          seat_map_id?: string | null
          seat_number?: number | null
          seat_type?: Database["public"]["Enums"]["seat_type"]
        }
        Relationships: [
          {
            foreignKeyName: "seats_seat_map_id_fkey"
            columns: ["seat_map_id"]
            isOneToOne: false
            referencedRelation: "seat_maps"
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
      ticket_scans: {
        Row: {
          device_info: Json | null
          gps_latitude: number | null
          gps_longitude: number | null
          id: string
          metadata: Json | null
          notes: string | null
          scan_datetime: string
          scan_location: string | null
          scan_result: string
          scan_type: string
          scanned_by_user_id: string
          ticket_id: string
        }
        Insert: {
          device_info?: Json | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          scan_datetime?: string
          scan_location?: string | null
          scan_result: string
          scan_type: string
          scanned_by_user_id: string
          ticket_id: string
        }
        Update: {
          device_info?: Json | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          scan_datetime?: string
          scan_location?: string | null
          scan_result?: string
          scan_type?: string
          scanned_by_user_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_scans_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_types: {
        Row: {
          base_price: number
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          description: string | null
          early_bird_end_datetime: string | null
          early_bird_price: number | null
          event_id: string | null
          group_discount_percentage: number | null
          group_size_threshold: number | null
          id: string
          includes_benefits: string[] | null
          is_active: boolean | null
          is_refundable: boolean | null
          max_per_order: number | null
          max_quantity: number | null
          name: string
          refund_policy_text: string | null
          sort_order: number | null
          trip_id: string | null
          updated_at: string
        }
        Insert: {
          base_price: number
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          description?: string | null
          early_bird_end_datetime?: string | null
          early_bird_price?: number | null
          event_id?: string | null
          group_discount_percentage?: number | null
          group_size_threshold?: number | null
          id?: string
          includes_benefits?: string[] | null
          is_active?: boolean | null
          is_refundable?: boolean | null
          max_per_order?: number | null
          max_quantity?: number | null
          name: string
          refund_policy_text?: string | null
          sort_order?: number | null
          trip_id?: string | null
          updated_at?: string
        }
        Update: {
          base_price?: number
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          description?: string | null
          early_bird_end_datetime?: string | null
          early_bird_price?: number | null
          event_id?: string | null
          group_discount_percentage?: number | null
          group_size_threshold?: number | null
          id?: string
          includes_benefits?: string[] | null
          is_active?: boolean | null
          is_refundable?: boolean | null
          max_per_order?: number | null
          max_quantity?: number | null
          name?: string
          refund_policy_text?: string | null
          sort_order?: number | null
          trip_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_types_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_types_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "transport_trips"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_validations: {
        Row: {
          created_at: string
          device_fingerprint: string | null
          id: string
          ip_address: unknown | null
          location_data: Json | null
          offline_validation: boolean | null
          signature_verification: boolean | null
          ticket_id: string
          validation_metadata: Json | null
          validation_result: string
          validation_type: string
          validator_user_id: string | null
        }
        Insert: {
          created_at?: string
          device_fingerprint?: string | null
          id?: string
          ip_address?: unknown | null
          location_data?: Json | null
          offline_validation?: boolean | null
          signature_verification?: boolean | null
          ticket_id: string
          validation_metadata?: Json | null
          validation_result: string
          validation_type: string
          validator_user_id?: string | null
        }
        Update: {
          created_at?: string
          device_fingerprint?: string | null
          id?: string
          ip_address?: unknown | null
          location_data?: Json | null
          offline_validation?: boolean | null
          signature_verification?: boolean | null
          ticket_id?: string
          validation_metadata?: Json | null
          validation_result?: string
          validation_type?: string
          validator_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_validations_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          holder_email: string | null
          holder_first_name: string | null
          holder_last_name: string | null
          holder_phone: string | null
          id: string
          metadata: Json | null
          order_id: string
          original_holder_email: string | null
          original_price: number
          paid_price: number
          qr_code_data: string
          scan_location: string | null
          scanned_at: string | null
          scanned_by_user_id: string | null
          seat_id: string | null
          ticket_number: string
          ticket_status: Database["public"]["Enums"]["ticket_status"] | null
          ticket_type_id: string
          transfer_reason: string | null
          transferred_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          holder_email?: string | null
          holder_first_name?: string | null
          holder_last_name?: string | null
          holder_phone?: string | null
          id?: string
          metadata?: Json | null
          order_id: string
          original_holder_email?: string | null
          original_price: number
          paid_price: number
          qr_code_data: string
          scan_location?: string | null
          scanned_at?: string | null
          scanned_by_user_id?: string | null
          seat_id?: string | null
          ticket_number: string
          ticket_status?: Database["public"]["Enums"]["ticket_status"] | null
          ticket_type_id: string
          transfer_reason?: string | null
          transferred_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          holder_email?: string | null
          holder_first_name?: string | null
          holder_last_name?: string | null
          holder_phone?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string
          original_holder_email?: string | null
          original_price?: number
          paid_price?: number
          qr_code_data?: string
          scan_location?: string | null
          scanned_at?: string | null
          scanned_by_user_id?: string | null
          seat_id?: string | null
          ticket_number?: string
          ticket_status?: Database["public"]["Enums"]["ticket_status"] | null
          ticket_type_id?: string
          transfer_reason?: string | null
          transferred_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_seat_id_fkey"
            columns: ["seat_id"]
            isOneToOne: false
            referencedRelation: "seats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_ticket_type_id_fkey"
            columns: ["ticket_type_id"]
            isOneToOne: false
            referencedRelation: "ticket_types"
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
      transport_routes: {
        Row: {
          created_at: string
          destination_venue_id: string
          distance_km: number | null
          estimated_duration_minutes: number | null
          id: string
          intermediate_stops: Json | null
          is_active: boolean | null
          metadata: Json | null
          organizer_id: string
          origin_venue_id: string
          route_code: string | null
          route_name: string
          transport_type: Database["public"]["Enums"]["transport_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          destination_venue_id: string
          distance_km?: number | null
          estimated_duration_minutes?: number | null
          id?: string
          intermediate_stops?: Json | null
          is_active?: boolean | null
          metadata?: Json | null
          organizer_id: string
          origin_venue_id: string
          route_code?: string | null
          route_name: string
          transport_type: Database["public"]["Enums"]["transport_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          destination_venue_id?: string
          distance_km?: number | null
          estimated_duration_minutes?: number | null
          id?: string
          intermediate_stops?: Json | null
          is_active?: boolean | null
          metadata?: Json | null
          organizer_id?: string
          origin_venue_id?: string
          route_code?: string | null
          route_name?: string
          transport_type?: Database["public"]["Enums"]["transport_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transport_routes_destination_venue_id_fkey"
            columns: ["destination_venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_routes_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "organizers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_routes_origin_venue_id_fkey"
            columns: ["origin_venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_trips: {
        Row: {
          arrival_datetime: string
          baggage_allowance: Json | null
          boarding_closes_minutes: number | null
          cancellation_reason: string | null
          check_in_opens_minutes: number | null
          created_at: string
          delay_minutes: number | null
          departure_datetime: string
          id: string
          is_cancelled: boolean | null
          meal_service: boolean | null
          metadata: Json | null
          route_id: string
          sales_end_datetime: string | null
          sales_start_datetime: string | null
          seat_map_id: string | null
          trip_number: string | null
          updated_at: string
          vehicle_identifier: string | null
        }
        Insert: {
          arrival_datetime: string
          baggage_allowance?: Json | null
          boarding_closes_minutes?: number | null
          cancellation_reason?: string | null
          check_in_opens_minutes?: number | null
          created_at?: string
          delay_minutes?: number | null
          departure_datetime: string
          id?: string
          is_cancelled?: boolean | null
          meal_service?: boolean | null
          metadata?: Json | null
          route_id: string
          sales_end_datetime?: string | null
          sales_start_datetime?: string | null
          seat_map_id?: string | null
          trip_number?: string | null
          updated_at?: string
          vehicle_identifier?: string | null
        }
        Update: {
          arrival_datetime?: string
          baggage_allowance?: Json | null
          boarding_closes_minutes?: number | null
          cancellation_reason?: string | null
          check_in_opens_minutes?: number | null
          created_at?: string
          delay_minutes?: number | null
          departure_datetime?: string
          id?: string
          is_cancelled?: boolean | null
          meal_service?: boolean | null
          metadata?: Json | null
          route_id?: string
          sales_end_datetime?: string | null
          sales_start_datetime?: string | null
          seat_map_id?: string | null
          trip_number?: string | null
          updated_at?: string
          vehicle_identifier?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transport_trips_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "transport_routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_trips_seat_map_id_fkey"
            columns: ["seat_map_id"]
            isOneToOne: false
            referencedRelation: "seat_maps"
            referencedColumns: ["id"]
          },
        ]
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
      venues: {
        Row: {
          accessibility_features: string[] | null
          address: string
          amenities: string[] | null
          capacity: number | null
          city: string
          contact_email: string | null
          contact_phone: string | null
          country: string | null
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          metadata: Json | null
          name: string
          organizer_id: string | null
          parking_info: Json | null
          public_transport_info: Json | null
          updated_at: string
          venue_type: string
          website: string | null
        }
        Insert: {
          accessibility_features?: string[] | null
          address: string
          amenities?: string[] | null
          capacity?: number | null
          city: string
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          name: string
          organizer_id?: string | null
          parking_info?: Json | null
          public_transport_info?: Json | null
          updated_at?: string
          venue_type: string
          website?: string | null
        }
        Update: {
          accessibility_features?: string[] | null
          address?: string
          amenities?: string[] | null
          capacity?: number | null
          city?: string
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          name?: string
          organizer_id?: string | null
          parking_info?: Json | null
          public_transport_info?: Json | null
          updated_at?: string
          venue_type?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "venues_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "organizers"
            referencedColumns: ["id"]
          },
        ]
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
      sales_analytics: {
        Row: {
          booking_status: Database["public"]["Enums"]["booking_status"] | null
          business_type: Database["public"]["Enums"]["business_type"] | null
          currency: Database["public"]["Enums"]["currency_code"] | null
          event_category: Database["public"]["Enums"]["event_category"] | null
          order_count: number | null
          organizer_city: string | null
          sales_date: string | null
          ticket_count: number | null
          total_fees: number | null
          total_revenue: number | null
          transport_type: Database["public"]["Enums"]["transport_type"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_risk_score: {
        Args: { order_uuid: string }
        Returns: number
      }
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
      booking_status:
        | "pending"
        | "confirmed"
        | "cancelled"
        | "checked_in"
        | "completed"
      business_type:
        | "event_organizer"
        | "transport_operator"
        | "venue_operator"
        | "club_operator"
      currency_code: "USD" | "ZWL" | "RTGS"
      event_category:
        | "concert"
        | "festival"
        | "conference"
        | "sports"
        | "theater"
        | "club_night"
        | "restaurant"
      payment_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "refunded"
        | "partially_refunded"
      refund_status:
        | "pending"
        | "processing"
        | "approved"
        | "rejected"
        | "completed"
      seat_type:
        | "standard"
        | "premium"
        | "vip"
        | "accessible"
        | "table"
        | "standing"
      ticket_status: "valid" | "used" | "cancelled" | "refunded" | "expired"
      transport_type: "bus" | "flight" | "train" | "ferry"
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
      booking_status: [
        "pending",
        "confirmed",
        "cancelled",
        "checked_in",
        "completed",
      ],
      business_type: [
        "event_organizer",
        "transport_operator",
        "venue_operator",
        "club_operator",
      ],
      currency_code: ["USD", "ZWL", "RTGS"],
      event_category: [
        "concert",
        "festival",
        "conference",
        "sports",
        "theater",
        "club_night",
        "restaurant",
      ],
      payment_status: [
        "pending",
        "processing",
        "completed",
        "failed",
        "refunded",
        "partially_refunded",
      ],
      refund_status: [
        "pending",
        "processing",
        "approved",
        "rejected",
        "completed",
      ],
      seat_type: [
        "standard",
        "premium",
        "vip",
        "accessible",
        "table",
        "standing",
      ],
      ticket_status: ["valid", "used", "cancelled", "refunded", "expired"],
      transport_type: ["bus", "flight", "train", "ferry"],
    },
  },
} as const
