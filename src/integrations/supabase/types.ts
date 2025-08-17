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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      business_dreams: {
        Row: {
          ai_generated_pitch: Json | null
          created_at: string | null
          dream_description: string
          dream_title: string
          id: string
          industry: string | null
          investment_needed: number | null
          location: string | null
          opportunity_checklist: Json | null
          status: string | null
          target_market: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_generated_pitch?: Json | null
          created_at?: string | null
          dream_description: string
          dream_title: string
          id?: string
          industry?: string | null
          investment_needed?: number | null
          location?: string | null
          opportunity_checklist?: Json | null
          status?: string | null
          target_market?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_generated_pitch?: Json | null
          created_at?: string | null
          dream_description?: string
          dream_title?: string
          id?: string
          industry?: string | null
          investment_needed?: number | null
          location?: string | null
          opportunity_checklist?: Json | null
          status?: string | null
          target_market?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      chat_invitations: {
        Row: {
          created_at: string | null
          id: string
          invitee_id: string
          inviter_id: string
          responded_at: string | null
          room_id: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          invitee_id: string
          inviter_id: string
          responded_at?: string | null
          room_id: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          invitee_id?: string
          inviter_id?: string
          responded_at?: string | null
          room_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_invitations_invitee_id_fkey"
            columns: ["invitee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_invitations_inviter_id_fkey"
            columns: ["inviter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_invitations_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          created_at: string | null
          edited_at: string | null
          file_url: string | null
          id: string
          is_deleted: boolean | null
          message: string
          message_type: string | null
          reply_to_message_id: string | null
          room_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string | null
          edited_at?: string | null
          file_url?: string | null
          id?: string
          is_deleted?: boolean | null
          message: string
          message_type?: string | null
          reply_to_message_id?: string | null
          room_id: string
          sender_id: string
        }
        Update: {
          created_at?: string | null
          edited_at?: string | null
          file_url?: string | null
          id?: string
          is_deleted?: boolean | null
          message?: string
          message_type?: string | null
          reply_to_message_id?: string | null
          room_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_reply_to_message_id_fkey"
            columns: ["reply_to_message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_participants: {
        Row: {
          id: string
          is_muted: boolean | null
          joined_at: string | null
          last_read_at: string | null
          role: string | null
          room_id: string
          user_id: string
        }
        Insert: {
          id?: string
          is_muted?: boolean | null
          joined_at?: string | null
          last_read_at?: string | null
          role?: string | null
          room_id: string
          user_id: string
        }
        Update: {
          id?: string
          is_muted?: boolean | null
          joined_at?: string | null
          last_read_at?: string | null
          role?: string | null
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          archived: boolean | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          interest_filter: string[] | null
          is_private: boolean | null
          last_activity: string | null
          location_filter: string | null
          max_participants: number | null
          name: string
          room_type: string | null
          video_call_link: string | null
        }
        Insert: {
          archived?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          interest_filter?: string[] | null
          is_private?: boolean | null
          last_activity?: string | null
          location_filter?: string | null
          max_participants?: number | null
          name: string
          room_type?: string | null
          video_call_link?: string | null
        }
        Update: {
          archived?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          interest_filter?: string[] | null
          is_private?: boolean | null
          last_activity?: string | null
          location_filter?: string | null
          max_participants?: number | null
          name?: string
          room_type?: string | null
          video_call_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cultural_preferences: {
        Row: {
          created_at: string | null
          cultural_identity: string
          id: string
          preference_weight: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          cultural_identity: string
          id?: string
          preference_weight?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          cultural_identity?: string
          id?: string
          preference_weight?: number | null
          user_id?: string
        }
        Relationships: []
      }
      diaspora_timeline_events: {
        Row: {
          created_at: string | null
          created_by: string | null
          cultural_relevance: string[] | null
          description: string | null
          diaspora_regions: string[] | null
          event_date: string
          event_type: string
          id: string
          image_url: string | null
          impact_score: number | null
          source_url: string | null
          tags: string[] | null
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          cultural_relevance?: string[] | null
          description?: string | null
          diaspora_regions?: string[] | null
          event_date: string
          event_type: string
          id?: string
          image_url?: string | null
          impact_score?: number | null
          source_url?: string | null
          tags?: string[] | null
          title: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          cultural_relevance?: string[] | null
          description?: string | null
          diaspora_regions?: string[] | null
          event_date?: string
          event_type?: string
          id?: string
          image_url?: string | null
          impact_score?: number | null
          source_url?: string | null
          tags?: string[] | null
          title?: string
        }
        Relationships: []
      }
      investment_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      investment_flags: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          investment_id: string
          reason: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          investment_id: string
          reason: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          investment_id?: string
          reason?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_flags_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "investments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investment_flags_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investment_flags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_interactions: {
        Row: {
          created_at: string | null
          id: string
          interaction_type: string
          investment_id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          interaction_type: string
          investment_id: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          interaction_type?: string
          investment_id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_interactions_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "investments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investment_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_reviews: {
        Row: {
          cons: string | null
          created_at: string | null
          id: string
          investment_id: string
          pros: string | null
          rating: number
          review_text: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cons?: string | null
          created_at?: string | null
          id?: string
          investment_id: string
          pros?: string | null
          rating: number
          review_text?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cons?: string | null
          created_at?: string | null
          id?: string
          investment_id?: string
          pros?: string | null
          rating?: number
          review_text?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_reviews_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "investments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investment_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      investments: {
        Row: {
          amount: number
          average_rating: number | null
          backers_count: number | null
          business_plan_url: string | null
          business_stage: string | null
          category: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          creator_id: string
          currency: string | null
          deadline: string | null
          description: string
          documents: string[] | null
          expected_returns: string | null
          featured: boolean | null
          funding_goal: number | null
          funding_raised: number | null
          id: string
          images: string[] | null
          is_verified: boolean | null
          location: string | null
          max_investment: number | null
          min_investment: number | null
          pitch_deck_url: string | null
          region: string | null
          reviews_count: number | null
          risk_level: string | null
          sector: string | null
          social_links: Json | null
          status: string | null
          title: string
          updated_at: string | null
          video_pitch_url: string | null
          website_url: string | null
        }
        Insert: {
          amount: number
          average_rating?: number | null
          backers_count?: number | null
          business_plan_url?: string | null
          business_stage?: string | null
          category?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          creator_id: string
          currency?: string | null
          deadline?: string | null
          description: string
          documents?: string[] | null
          expected_returns?: string | null
          featured?: boolean | null
          funding_goal?: number | null
          funding_raised?: number | null
          id?: string
          images?: string[] | null
          is_verified?: boolean | null
          location?: string | null
          max_investment?: number | null
          min_investment?: number | null
          pitch_deck_url?: string | null
          region?: string | null
          reviews_count?: number | null
          risk_level?: string | null
          sector?: string | null
          social_links?: Json | null
          status?: string | null
          title: string
          updated_at?: string | null
          video_pitch_url?: string | null
          website_url?: string | null
        }
        Update: {
          amount?: number
          average_rating?: number | null
          backers_count?: number | null
          business_plan_url?: string | null
          business_stage?: string | null
          category?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          creator_id?: string
          currency?: string | null
          deadline?: string | null
          description?: string
          documents?: string[] | null
          expected_returns?: string | null
          featured?: boolean | null
          funding_goal?: number | null
          funding_raised?: number | null
          id?: string
          images?: string[] | null
          is_verified?: boolean | null
          location?: string | null
          max_investment?: number | null
          min_investment?: number | null
          pitch_deck_url?: string | null
          region?: string | null
          reviews_count?: number | null
          risk_level?: string | null
          sector?: string | null
          social_links?: Json | null
          status?: string | null
          title?: string
          updated_at?: string | null
          video_pitch_url?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investments_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kindness_acts: {
        Row: {
          act_type: string
          beneficiary_count: number | null
          beneficiary_location: string | null
          category: string
          created_at: string
          description: string | null
          evidence_urls: string[] | null
          id: string
          impact_value: number | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
          verification_status: string | null
          verified_by: string | null
        }
        Insert: {
          act_type: string
          beneficiary_count?: number | null
          beneficiary_location?: string | null
          category: string
          created_at?: string
          description?: string | null
          evidence_urls?: string[] | null
          id?: string
          impact_value?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
          verification_status?: string | null
          verified_by?: string | null
        }
        Update: {
          act_type?: string
          beneficiary_count?: number | null
          beneficiary_location?: string | null
          category?: string
          created_at?: string
          description?: string | null
          evidence_urls?: string[] | null
          id?: string
          impact_value?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
          verification_status?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      kindness_metrics: {
        Row: {
          badges_earned: string[] | null
          business_impact_score: number | null
          community_impact_score: number | null
          created_at: string
          current_streak_days: number | null
          education_impact_score: number | null
          funds_facilitated: number | null
          id: string
          last_act_date: string | null
          level_name: string | null
          longest_streak_days: number | null
          mentorship_hours: number | null
          people_helped_count: number | null
          total_kindness_score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          badges_earned?: string[] | null
          business_impact_score?: number | null
          community_impact_score?: number | null
          created_at?: string
          current_streak_days?: number | null
          education_impact_score?: number | null
          funds_facilitated?: number | null
          id?: string
          last_act_date?: string | null
          level_name?: string | null
          longest_streak_days?: number | null
          mentorship_hours?: number | null
          people_helped_count?: number | null
          total_kindness_score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          badges_earned?: string[] | null
          business_impact_score?: number | null
          community_impact_score?: number | null
          created_at?: string
          current_streak_days?: number | null
          education_impact_score?: number | null
          funds_facilitated?: number | null
          id?: string
          last_act_date?: string | null
          level_name?: string | null
          longest_streak_days?: number | null
          mentorship_hours?: number | null
          people_helped_count?: number | null
          total_kindness_score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      message_reactions: {
        Row: {
          created_at: string | null
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      milestone_progress: {
        Row: {
          completed: boolean | null
          completion_date: string | null
          created_at: string | null
          id: string
          milestone_id: string
          notes: string | null
          success_path_id: string
          supporting_documents: string[] | null
        }
        Insert: {
          completed?: boolean | null
          completion_date?: string | null
          created_at?: string | null
          id?: string
          milestone_id: string
          notes?: string | null
          success_path_id: string
          supporting_documents?: string[] | null
        }
        Update: {
          completed?: boolean | null
          completion_date?: string | null
          created_at?: string | null
          id?: string
          milestone_id?: string
          notes?: string | null
          success_path_id?: string
          supporting_documents?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "milestone_progress_success_path_id_fkey"
            columns: ["success_path_id"]
            isOneToOne: false
            referencedRelation: "success_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      personalized_recommendations: {
        Row: {
          clicked_at: string | null
          content_id: string
          content_type: string
          created_at: string | null
          cultural_relevance_score: number | null
          diaspora_relevance_score: number | null
          dismissed_at: string | null
          id: string
          recommendation_reason: string | null
          recommendation_score: number | null
          shown_at: string | null
          user_id: string
        }
        Insert: {
          clicked_at?: string | null
          content_id: string
          content_type: string
          created_at?: string | null
          cultural_relevance_score?: number | null
          diaspora_relevance_score?: number | null
          dismissed_at?: string | null
          id?: string
          recommendation_reason?: string | null
          recommendation_score?: number | null
          shown_at?: string | null
          user_id: string
        }
        Update: {
          clicked_at?: string | null
          content_id?: string
          content_type?: string
          created_at?: string | null
          cultural_relevance_score?: number | null
          diaspora_relevance_score?: number | null
          dismissed_at?: string | null
          id?: string
          recommendation_reason?: string | null
          recommendation_score?: number | null
          shown_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      podcast_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      podcast_comments: {
        Row: {
          comment: string
          created_at: string | null
          id: string
          parent_comment_id: string | null
          podcast_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string | null
          id?: string
          parent_comment_id?: string | null
          podcast_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string | null
          id?: string
          parent_comment_id?: string | null
          podcast_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "podcast_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "podcast_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "podcast_comments_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "podcasts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "podcast_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      podcast_likes: {
        Row: {
          created_at: string | null
          id: string
          podcast_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          podcast_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          podcast_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "podcast_likes_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "podcasts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "podcast_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      podcasts: {
        Row: {
          audio_url: string | null
          category: string | null
          created_at: string | null
          creator_id: string
          description: string | null
          duration: number | null
          episode_number: number | null
          explicit_content: boolean | null
          id: string
          is_premium: boolean | null
          language: string | null
          likes_count: number | null
          listens_count: number | null
          rss_feed_url: string | null
          season_number: number | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          transcript_url: string | null
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          audio_url?: string | null
          category?: string | null
          created_at?: string | null
          creator_id: string
          description?: string | null
          duration?: number | null
          episode_number?: number | null
          explicit_content?: boolean | null
          id?: string
          is_premium?: boolean | null
          language?: string | null
          likes_count?: number | null
          listens_count?: number | null
          rss_feed_url?: string | null
          season_number?: number | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          transcript_url?: string | null
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          audio_url?: string | null
          category?: string | null
          created_at?: string | null
          creator_id?: string
          description?: string | null
          duration?: number | null
          episode_number?: number | null
          explicit_content?: boolean | null
          id?: string
          is_premium?: boolean | null
          language?: string | null
          likes_count?: number | null
          listens_count?: number | null
          rss_feed_url?: string | null
          season_number?: number | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          transcript_url?: string | null
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "podcasts_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_views: {
        Row: {
          id: string
          ip_address: unknown | null
          profile_id: string
          viewed_at: string | null
          viewer_id: string | null
        }
        Insert: {
          id?: string
          ip_address?: unknown | null
          profile_id: string
          viewed_at?: string | null
          viewer_id?: string | null
        }
        Update: {
          id?: string
          ip_address?: unknown | null
          profile_id?: string
          viewed_at?: string | null
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_views_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          business_affiliation: string | null
          city: string | null
          company_name: string | null
          company_position: string | null
          company_website: string | null
          content_categories: string[] | null
          country: string | null
          created_at: string | null
          cultural_identity: string[] | null
          diaspora_generation: string | null
          diaspora_region: string | null
          email: string | null
          facebook_url: string | null
          followers_count: number | null
          full_name: string | null
          home_connection_preferences: Json | null
          id: string
          instagram_url: string | null
          interests: string[] | null
          investment_range_max: number | null
          investment_range_min: number | null
          is_verified: boolean | null
          linkedin_url: string | null
          personalization_settings: Json | null
          phone: string | null
          portfolio_url: string | null
          preferred_language: string | null
          preferred_sectors: string[] | null
          profile_completion_percentage: number | null
          skills: string[] | null
          twitter_url: string | null
          updated_at: string | null
          user_id: string
          user_type: string | null
          verified_investor: boolean | null
          verified_podcaster: boolean | null
          years_of_experience: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          business_affiliation?: string | null
          city?: string | null
          company_name?: string | null
          company_position?: string | null
          company_website?: string | null
          content_categories?: string[] | null
          country?: string | null
          created_at?: string | null
          cultural_identity?: string[] | null
          diaspora_generation?: string | null
          diaspora_region?: string | null
          email?: string | null
          facebook_url?: string | null
          followers_count?: number | null
          full_name?: string | null
          home_connection_preferences?: Json | null
          id?: string
          instagram_url?: string | null
          interests?: string[] | null
          investment_range_max?: number | null
          investment_range_min?: number | null
          is_verified?: boolean | null
          linkedin_url?: string | null
          personalization_settings?: Json | null
          phone?: string | null
          portfolio_url?: string | null
          preferred_language?: string | null
          preferred_sectors?: string[] | null
          profile_completion_percentage?: number | null
          skills?: string[] | null
          twitter_url?: string | null
          updated_at?: string | null
          user_id: string
          user_type?: string | null
          verified_investor?: boolean | null
          verified_podcaster?: boolean | null
          years_of_experience?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          business_affiliation?: string | null
          city?: string | null
          company_name?: string | null
          company_position?: string | null
          company_website?: string | null
          content_categories?: string[] | null
          country?: string | null
          created_at?: string | null
          cultural_identity?: string[] | null
          diaspora_generation?: string | null
          diaspora_region?: string | null
          email?: string | null
          facebook_url?: string | null
          followers_count?: number | null
          full_name?: string | null
          home_connection_preferences?: Json | null
          id?: string
          instagram_url?: string | null
          interests?: string[] | null
          investment_range_max?: number | null
          investment_range_min?: number | null
          is_verified?: boolean | null
          linkedin_url?: string | null
          personalization_settings?: Json | null
          phone?: string | null
          portfolio_url?: string | null
          preferred_language?: string | null
          preferred_sectors?: string[] | null
          profile_completion_percentage?: number | null
          skills?: string[] | null
          twitter_url?: string | null
          updated_at?: string | null
          user_id?: string
          user_type?: string | null
          verified_investor?: boolean | null
          verified_podcaster?: boolean | null
          years_of_experience?: number | null
        }
        Relationships: []
      }
      remittance_insights: {
        Row: {
          amount: number
          anonymized_recipient_id: string | null
          created_at: string
          currency: string
          frequency: string | null
          id: string
          impact_category: string | null
          purpose: string | null
          recipient_country: string
          recipient_region: string | null
          transaction_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          anonymized_recipient_id?: string | null
          created_at?: string
          currency?: string
          frequency?: string | null
          id?: string
          impact_category?: string | null
          purpose?: string | null
          recipient_country: string
          recipient_region?: string | null
          transaction_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          anonymized_recipient_id?: string | null
          created_at?: string
          currency?: string
          frequency?: string | null
          id?: string
          impact_category?: string | null
          purpose?: string | null
          recipient_country?: string
          recipient_region?: string | null
          transaction_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      remittance_patterns: {
        Row: {
          average_monthly_amount: number | null
          created_at: string
          id: string
          impact_summary: Json | null
          last_calculated_at: string | null
          primary_purpose: string | null
          primary_recipient_country: string | null
          recommendations: Json | null
          seasonal_pattern: Json | null
          total_sent_ytd: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          average_monthly_amount?: number | null
          created_at?: string
          id?: string
          impact_summary?: Json | null
          last_calculated_at?: string | null
          primary_purpose?: string | null
          primary_recipient_country?: string | null
          recommendations?: Json | null
          seasonal_pattern?: Json | null
          total_sent_ytd?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          average_monthly_amount?: number | null
          created_at?: string
          id?: string
          impact_summary?: Json | null
          last_calculated_at?: string | null
          primary_purpose?: string | null
          primary_recipient_country?: string | null
          recommendations?: Json | null
          seasonal_pattern?: Json | null
          total_sent_ytd?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rss_feeds: {
        Row: {
          auto_import: boolean | null
          created_at: string | null
          feed_title: string | null
          feed_url: string
          id: string
          last_imported_at: string | null
          user_id: string
        }
        Insert: {
          auto_import?: boolean | null
          created_at?: string | null
          feed_title?: string | null
          feed_url: string
          id?: string
          last_imported_at?: string | null
          user_id: string
        }
        Update: {
          auto_import?: boolean | null
          created_at?: string | null
          feed_title?: string | null
          feed_url?: string
          id?: string
          last_imported_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rss_feeds_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_investments: {
        Row: {
          created_at: string | null
          id: string
          investment_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          investment_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          investment_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_investments_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "investments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_investments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_podcasts: {
        Row: {
          created_at: string | null
          id: string
          podcast_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          podcast_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          podcast_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_podcasts_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "podcasts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_podcasts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          plan_type: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          plan_type?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          plan_type?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      success_paths: {
        Row: {
          business_dream_id: string | null
          created_at: string | null
          goal_description: string
          id: string
          milestones: Json
          progress_tracking: Json | null
          resources: Json | null
          target_completion_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          business_dream_id?: string | null
          created_at?: string | null
          goal_description: string
          id?: string
          milestones: Json
          progress_tracking?: Json | null
          resources?: Json | null
          target_completion_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          business_dream_id?: string | null
          created_at?: string | null
          goal_description?: string
          id?: string
          milestones?: Json
          progress_tracking?: Json | null
          resources?: Json | null
          target_completion_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "success_paths_business_dream_id_fkey"
            columns: ["business_dream_id"]
            isOneToOne: false
            referencedRelation: "business_dreams"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_type: string
          description: string | null
          earned_at: string | null
          icon: string | null
          id: string
          title: string
          user_id: string
        }
        Insert: {
          achievement_type: string
          description?: string | null
          earned_at?: string | null
          icon?: string | null
          id?: string
          title: string
          user_id: string
        }
        Update: {
          achievement_type?: string
          description?: string | null
          earned_at?: string | null
          icon?: string | null
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity: {
        Row: {
          current_room_id: string | null
          id: string
          last_seen: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          current_room_id?: string | null
          id?: string
          last_seen?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          current_room_id?: string | null
          id?: string
          last_seen?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_current_room_id_fkey"
            columns: ["current_room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_connections: {
        Row: {
          created_at: string | null
          id: string
          message: string | null
          requested_id: string
          requester_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message?: string | null
          requested_id: string
          requester_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string | null
          requested_id?: string
          requester_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_connections_requested_id_fkey"
            columns: ["requested_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_connections_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          is_primary: boolean | null
          role: string
          user_id: string
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_primary?: boolean | null
          role: string
          user_id: string
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_primary?: boolean | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      zim_diaspora_businesses: {
        Row: {
          ai_confidence_score: number | null
          business_id: string | null
          business_name: string
          business_type: string
          created_at: string | null
          diaspora_backing_info: string | null
          id: string
          supporting_evidence: Json | null
          tagged_by: string | null
          updated_at: string | null
          verification_status: string | null
          verified_by: string | null
          zimbabwe_roots_story: string | null
        }
        Insert: {
          ai_confidence_score?: number | null
          business_id?: string | null
          business_name: string
          business_type: string
          created_at?: string | null
          diaspora_backing_info?: string | null
          id?: string
          supporting_evidence?: Json | null
          tagged_by?: string | null
          updated_at?: string | null
          verification_status?: string | null
          verified_by?: string | null
          zimbabwe_roots_story?: string | null
        }
        Update: {
          ai_confidence_score?: number | null
          business_id?: string | null
          business_name?: string
          business_type?: string
          created_at?: string | null
          diaspora_backing_info?: string | null
          id?: string
          supporting_evidence?: Json | null
          tagged_by?: string | null
          updated_at?: string | null
          verification_status?: string | null
          verified_by?: string | null
          zimbabwe_roots_story?: string | null
        }
        Relationships: []
      }
      zimbabwe_market_data: {
        Row: {
          category: string | null
          created_at: string | null
          data_type: string
          date_recorded: string
          id: string
          metadata: Json | null
          source: string | null
          value: number | null
          value_text: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          data_type: string
          date_recorded: string
          id?: string
          metadata?: Json | null
          source?: string | null
          value?: number | null
          value_text?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          data_type?: string
          date_recorded?: string
          id?: string
          metadata?: Json | null
          source?: string | null
          value?: number | null
          value_text?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_investment_rating: {
        Args: { investment_id: string }
        Returns: number
      }
      calculate_profile_completion: {
        Args: { profile_id: string }
        Returns: number
      }
      create_direct_message_room: {
        Args: { user1_id: string; user2_id: string }
        Returns: string
      }
      find_users_by_criteria: {
        Args: {
          limit_count?: number
          search_interests?: string[]
          search_location?: string
        }
        Returns: {
          avatar_url: string
          business_affiliation: string
          city: string
          common_interests_count: number
          country: string
          full_name: string
          interests: string[]
          user_id: string
        }[]
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
