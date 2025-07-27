export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      c_community: {
        Row: {
          created_at: string
          detail: string | null
          id: number
          image_url: string
          join_mode: Database["public"]["Enums"]["COMMUNITY_JOIN_MODE"]
          manager_id: string | null
          name: string
        }
        Insert: {
          created_at?: string
          detail?: string | null
          id?: number
          image_url: string
          join_mode?: Database["public"]["Enums"]["COMMUNITY_JOIN_MODE"]
          manager_id?: string | null
          name: string
        }
        Update: {
          created_at?: string
          detail?: string | null
          id?: number
          image_url?: string
          join_mode?: Database["public"]["Enums"]["COMMUNITY_JOIN_MODE"]
          manager_id?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "c_community_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "random_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_community_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "s_staff_with_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_community_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      c_community_members: {
        Row: {
          community_id: number
          created_at: string
          status: Database["public"]["Enums"]["community_member_status"] | null
          user_id: string
        }
        Insert: {
          community_id: number
          created_at?: string
          status?: Database["public"]["Enums"]["community_member_status"] | null
          user_id: string
        }
        Update: {
          community_id?: number
          created_at?: string
          status?: Database["public"]["Enums"]["community_member_status"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "c_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "random_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "s_staff_with_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      c_community_posts: {
        Row: {
          community_id: number
          created_at: string
          created_by: string | null
          detail_html: string | null
          detail_text: string | null
          id: number
          image_url: string | null
          title: string
        }
        Insert: {
          community_id: number
          created_at?: string
          created_by?: string | null
          detail_html?: string | null
          detail_text?: string | null
          id?: number
          image_url?: string | null
          title: string
        }
        Update: {
          community_id?: number
          created_at?: string
          created_by?: string | null
          detail_html?: string | null
          detail_text?: string | null
          id?: number
          image_url?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "c_community_posts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "c_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_community_posts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "random_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_community_posts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "s_staff_with_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "c_community_posts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      concierge: {
        Row: {
          category_id: number
          created_at: string
          extra_data: Json
          id: number
          name: string
          status: string
          user_id: string
        }
        Insert: {
          category_id: number
          created_at?: string
          extra_data: Json
          id?: number
          name: string
          status: string
          user_id: string
        }
        Update: {
          category_id?: number
          created_at?: string
          extra_data?: Json
          id?: number
          name?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "concierge_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "concierge_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "concierge_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "random_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "concierge_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "s_staff_with_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "concierge_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      concierge_category: {
        Row: {
          created_at: string
          detail: Json
          icon: string
          id: number
          title: string
        }
        Insert: {
          created_at?: string
          detail: Json
          icon: string
          id?: number
          title: string
        }
        Update: {
          created_at?: string
          detail?: Json
          icon?: string
          id?: number
          title?: string
        }
        Relationships: []
      }
      concierge_message: {
        Row: {
          concierge_id: number
          created_at: string
          id: number
          image_path: string | null
          message: string | null
          sender_id: string | null
          user_id: string | null
        }
        Insert: {
          concierge_id: number
          created_at?: string
          id?: number
          image_path?: string | null
          message?: string | null
          sender_id?: string | null
          user_id?: string | null
        }
        Update: {
          concierge_id?: number
          created_at?: string
          id?: number
          image_path?: string | null
          message?: string | null
          sender_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "concierge_message_concierge_id_fkey"
            columns: ["concierge_id"]
            isOneToOne: false
            referencedRelation: "concierge"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "concierge_message_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "random_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "concierge_message_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "s_staff_with_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "concierge_message_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "concierge_message_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "random_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "concierge_message_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "s_staff_with_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "concierge_message_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      dep_u_user_roles: {
        Row: {
          id: number
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: number
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: number
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dep_u_user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "random_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dep_u_user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "s_staff_with_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dep_u_user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      m_app_settings: {
        Row: {
          created_at: string
          id: number
          name: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          value: Json
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          value?: Json
        }
        Relationships: []
      }
      m_auto_support_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          image_url: string | null
          send_time: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          send_time?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          send_time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "m_auto_support_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "random_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_auto_support_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "s_staff_with_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "m_auto_support_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      m_industries: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      m_interests: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      m_skills: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      revenue_cat_processed_events: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      s_matches: {
        Row: {
          created_at: string
          id: number
          staff_id: string
          staff_last_seen_at: string | null
          user_id: string
          user_last_seen_at: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          staff_id: string
          staff_last_seen_at?: string | null
          user_id: string
          user_last_seen_at?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          staff_id?: string
          staff_last_seen_at?: string | null
          user_id?: string
          user_last_seen_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "s_matches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "random_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s_matches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "s_staff_with_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s_matches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      s_messages: {
        Row: {
          content: string
          created_at: string
          id: number
          image_url: string | null
          match_id: number
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: number
          image_url?: string | null
          match_id: number
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: number
          image_url?: string | null
          match_id?: number
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "s_messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "s_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      s_staff_categories: {
        Row: {
          id: number
          image: string
          name: string
        }
        Insert: {
          id?: number
          image: string
          name: string
        }
        Update: {
          id?: number
          image?: string
          name?: string
        }
        Relationships: []
      }
      s_staff_categories_rel: {
        Row: {
          staff_category_id: number
          user_id: string
        }
        Insert: {
          staff_category_id: number
          user_id: string
        }
        Update: {
          staff_category_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_staff_category_rel"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "random_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_staff_category_rel"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "s_staff_with_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_staff_category_rel"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s_staff_categories_rel_staff_category_id_fkey"
            columns: ["staff_category_id"]
            isOneToOne: false
            referencedRelation: "s_staff_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s_staff_categories_rel_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "random_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s_staff_categories_rel_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "s_staff_with_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s_staff_categories_rel_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      s_staff_images: {
        Row: {
          id: number
          image_path: string | null
          user_id: string
        }
        Insert: {
          id?: number
          image_path?: string | null
          user_id: string
        }
        Update: {
          id?: number
          image_path?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_staff_images"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "random_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_staff_images"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "s_staff_with_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_staff_images"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s_staff_images_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "random_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s_staff_images_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "s_staff_with_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s_staff_images_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      u_event_attends: {
        Row: {
          event_id: number
          user_id: string
        }
        Insert: {
          event_id: number
          user_id: string
        }
        Update: {
          event_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "u_event_attends_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "u_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "u_event_attends_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "random_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "u_event_attends_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "s_staff_with_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "u_event_attends_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      u_event_categories: {
        Row: {
          created_at: string
          display_order: number | null
          id: number
          image_url: string
          title: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: number
          image_url: string
          title: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: number
          image_url?: string
          title?: string
        }
        Relationships: []
      }
      u_event_reviews: {
        Row: {
          comment: string | null
          created_at: string
          event_id: number
          id: number
          star: number
          title: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          event_id: number
          id?: number
          star: number
          title: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          event_id?: number
          id?: number
          star?: number
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "u_event_reviews_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "u_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "u_event_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "random_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "u_event_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "s_staff_with_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "u_event_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      u_event_tickets: {
        Row: {
          capacity: number | null
          event_id: number
          id: number
          name: string
          price: number | null
        }
        Insert: {
          capacity?: number | null
          event_id: number
          id?: number
          name: string
          price?: number | null
        }
        Update: {
          capacity?: number | null
          event_id?: number
          id?: number
          name?: string
          price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "u_event_tickets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "u_events"
            referencedColumns: ["id"]
          },
        ]
      }
      u_events: {
        Row: {
          address_address1: string | null
          address_address2: string | null
          address_country: string | null
          address_prefecture: string | null
          body_html: string | null
          category: number
          community_id: number | null
          created_at: string
          created_by: string | null
          detail: string
          end_datetime: string | null
          entry_end_datetime: string | null
          entry_start_datetime: string | null
          featured: number | null
          has_after_party: boolean | null
          id: number
          image_url: string
          is_free: boolean | null
          is_published: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          office_name: string | null
          place: string | null
          place_url: string | null
          price: number | null
          short_detail: string | null
          start_datetime: string | null
          sub_category_id: number | null
          total_capacity: number | null
          type: Database["public"]["Enums"]["EVENT_TYPE"]
          use_map: boolean | null
        }
        Insert: {
          address_address1?: string | null
          address_address2?: string | null
          address_country?: string | null
          address_prefecture?: string | null
          body_html?: string | null
          category: number
          community_id?: number | null
          created_at?: string
          created_by?: string | null
          detail: string
          end_datetime?: string | null
          entry_end_datetime?: string | null
          entry_start_datetime?: string | null
          featured?: number | null
          has_after_party?: boolean | null
          id?: number
          image_url: string
          is_free?: boolean | null
          is_published?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          office_name?: string | null
          place?: string | null
          place_url?: string | null
          price?: number | null
          short_detail?: string | null
          start_datetime?: string | null
          sub_category_id?: number | null
          total_capacity?: number | null
          type: Database["public"]["Enums"]["EVENT_TYPE"]
          use_map?: boolean | null
        }
        Update: {
          address_address1?: string | null
          address_address2?: string | null
          address_country?: string | null
          address_prefecture?: string | null
          body_html?: string | null
          category?: number
          community_id?: number | null
          created_at?: string
          created_by?: string | null
          detail?: string
          end_datetime?: string | null
          entry_end_datetime?: string | null
          entry_start_datetime?: string | null
          featured?: number | null
          has_after_party?: boolean | null
          id?: number
          image_url?: string
          is_free?: boolean | null
          is_published?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          office_name?: string | null
          place?: string | null
          place_url?: string | null
          price?: number | null
          short_detail?: string | null
          start_datetime?: string | null
          sub_category_id?: number | null
          total_capacity?: number | null
          type?: Database["public"]["Enums"]["EVENT_TYPE"]
          use_map?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "u_events_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "u_event_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "u_events_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "c_community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "u_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "random_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "u_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "s_staff_with_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "u_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "u_events_sub_category_id_fkey"
            columns: ["sub_category_id"]
            isOneToOne: false
            referencedRelation: "u_event_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      u_job_industries: {
        Row: {
          industry: number
          job: number
          user_id: string
        }
        Insert: {
          industry: number
          job: number
          user_id: string
        }
        Update: {
          industry?: number
          job?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "u_job_industries_industry_fkey"
            columns: ["industry"]
            isOneToOne: false
            referencedRelation: "m_industries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "u_job_industries_job_fkey"
            columns: ["job"]
            isOneToOne: false
            referencedRelation: "u_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      u_jobs: {
        Row: {
          company_established_year: number | null
          company_name: string | null
          created_at: string | null
          homepage: string | null
          id: number
          join_date: string
          left_date: string | null
          position: string | null
          salary_range: string | null
          user_id: string
        }
        Insert: {
          company_established_year?: number | null
          company_name?: string | null
          created_at?: string | null
          homepage?: string | null
          id?: number
          join_date: string
          left_date?: string | null
          position?: string | null
          salary_range?: string | null
          user_id: string
        }
        Update: {
          company_established_year?: number | null
          company_name?: string | null
          created_at?: string | null
          homepage?: string | null
          id?: number
          join_date?: string
          left_date?: string | null
          position?: string | null
          salary_range?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "u_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "random_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "u_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "s_staff_with_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "u_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      u_match_reports: {
        Row: {
          created_at: string
          detail: string
          id: number
          match_id: number
          reporter_id: string
        }
        Insert: {
          created_at?: string
          detail: string
          id?: number
          match_id: number
          reporter_id: string
        }
        Update: {
          created_at?: string
          detail?: string
          id?: number
          match_id?: number
          reporter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_u_match_reports_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "u_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_u_match_reports_reporter_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "random_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_u_match_reports_reporter_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "s_staff_with_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_u_match_reports_reporter_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      u_matches: {
        Row: {
          created_at: string | null
          id: number
          user_1_blocked: boolean | null
          user_2_blocked: boolean | null
          user1_id: string
          user1_last_seen_at: string | null
          user2_id: string
          user2_last_seen_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          user_1_blocked?: boolean | null
          user_2_blocked?: boolean | null
          user1_id: string
          user1_last_seen_at?: string | null
          user2_id: string
          user2_last_seen_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          user_1_blocked?: boolean | null
          user_2_blocked?: boolean | null
          user1_id?: string
          user1_last_seen_at?: string | null
          user2_id?: string
          user2_last_seen_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "u_matches_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "random_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "u_matches_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "s_staff_with_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "u_matches_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "u_matches_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "random_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "u_matches_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "s_staff_with_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "u_matches_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      u_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          image_url: string | null
          match_id: number
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          match_id: number
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          match_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_u_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "random_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_u_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "s_staff_with_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_u_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "u_messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "u_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      u_recommendations: {
        Row: {
          created_at: string | null
          id: number
          last_action_at: string | null
          status: Database["public"]["Enums"]["recommendation_status"] | null
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          last_action_at?: string | null
          status?: Database["public"]["Enums"]["recommendation_status"] | null
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          last_action_at?: string | null
          status?: Database["public"]["Enums"]["recommendation_status"] | null
          user1_id?: string
          user2_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "u_recommendations_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "random_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "u_recommendations_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "s_staff_with_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "u_recommendations_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "u_recommendations_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "random_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "u_recommendations_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "s_staff_with_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "u_recommendations_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      u_user_industries: {
        Row: {
          industry_id: number
          user_id: string
        }
        Insert: {
          industry_id: number
          user_id: string
        }
        Update: {
          industry_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_u_user_industries_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "m_industries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_u_user_industries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "random_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_u_user_industries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "s_staff_with_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_u_user_industries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      u_user_industry_interests: {
        Row: {
          industry: number
          user: string
        }
        Insert: {
          industry: number
          user: string
        }
        Update: {
          industry?: number
          user?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_u_user_industry_interests_industry_fkey"
            columns: ["industry"]
            isOneToOne: false
            referencedRelation: "m_industries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_u_user_industry_interests_user_fkey"
            columns: ["user"]
            isOneToOne: false
            referencedRelation: "random_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_u_user_industry_interests_user_fkey"
            columns: ["user"]
            isOneToOne: false
            referencedRelation: "s_staff_with_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_u_user_industry_interests_user_fkey"
            columns: ["user"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      u_user_interests: {
        Row: {
          interest: number
          user: string
        }
        Insert: {
          interest: number
          user: string
        }
        Update: {
          interest?: number
          user?: string
        }
        Relationships: [
          {
            foreignKeyName: "u_user_interests_interest_fkey"
            columns: ["interest"]
            isOneToOne: false
            referencedRelation: "m_interests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "u_user_interests_user_fkey"
            columns: ["user"]
            isOneToOne: false
            referencedRelation: "random_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "u_user_interests_user_fkey"
            columns: ["user"]
            isOneToOne: false
            referencedRelation: "s_staff_with_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "u_user_interests_user_fkey"
            columns: ["user"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      u_user_reviews: {
        Row: {
          created_at: string
          detail: string | null
          id: number
          reviewer_id: string
          star: number
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          detail?: string | null
          id?: number
          reviewer_id: string
          star: number
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          detail?: string | null
          id?: number
          reviewer_id?: string
          star?: number
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "u_user_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "random_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "u_user_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "s_staff_with_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "u_user_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "u_user_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "random_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "u_user_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "s_staff_with_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "u_user_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      u_user_skills: {
        Row: {
          skill: number
          user: string
        }
        Insert: {
          skill: number
          user: string
        }
        Update: {
          skill?: number
          user?: string
        }
        Relationships: [
          {
            foreignKeyName: "u_user_skills_skill_fkey"
            columns: ["skill"]
            isOneToOne: false
            referencedRelation: "m_skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "u_user_skills_user_fkey"
            columns: ["user"]
            isOneToOne: false
            referencedRelation: "random_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "u_user_skills_user_fkey"
            columns: ["user"]
            isOneToOne: false
            referencedRelation: "s_staff_with_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "u_user_skills_user_fkey"
            columns: ["user"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_review: {
        Row: {
          comment: string | null
          cooperation: number | null
          credibility: number | null
          growth: number | null
          response_speed: number | null
          reviewee_id: string
          reviewer_id: string
          sincerity: number | null
        }
        Insert: {
          comment?: string | null
          cooperation?: number | null
          credibility?: number | null
          growth?: number | null
          response_speed?: number | null
          reviewee_id: string
          reviewer_id: string
          sincerity?: number | null
        }
        Update: {
          comment?: string | null
          cooperation?: number | null
          credibility?: number | null
          growth?: number | null
          response_speed?: number | null
          reviewee_id?: string
          reviewer_id?: string
          sincerity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_review_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "random_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_review_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "s_staff_with_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_review_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_review_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "random_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_review_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "s_staff_with_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_review_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          birthday: string | null
          company_established_year: number | null
          company_homepage: string | null
          company_name: string | null
          created_at: string | null
          email: string | null
          expo_push_notification_token: string | null
          firstname: string | null
          firstname_kana: string | null
          hide_age: boolean | null
          hide_in_recommend: boolean | null
          id: string
          ignore_app_settings: boolean | null
          introduction: string | null
          invited_by: string | null
          is_debug_premium: boolean | null
          job_join_date: string | null
          job_left_date: string | null
          job_position: string | null
          last_active_datetime: string | null
          last_recommended_date: string | null
          lastname: string | null
          lastname_kana: string | null
          line_data: Json | null
          location: string | null
          profile_bg_url: string | null
          revenuecat_app_user_id: string | null
          salary_range: string | null
          sns_link1: string | null
          sns_link2: string | null
          sns_link3: string | null
          staff_status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          birthday?: string | null
          company_established_year?: number | null
          company_homepage?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          expo_push_notification_token?: string | null
          firstname?: string | null
          firstname_kana?: string | null
          hide_age?: boolean | null
          hide_in_recommend?: boolean | null
          id: string
          ignore_app_settings?: boolean | null
          introduction?: string | null
          invited_by?: string | null
          is_debug_premium?: boolean | null
          job_join_date?: string | null
          job_left_date?: string | null
          job_position?: string | null
          last_active_datetime?: string | null
          last_recommended_date?: string | null
          lastname?: string | null
          lastname_kana?: string | null
          line_data?: Json | null
          location?: string | null
          profile_bg_url?: string | null
          revenuecat_app_user_id?: string | null
          salary_range?: string | null
          sns_link1?: string | null
          sns_link2?: string | null
          sns_link3?: string | null
          staff_status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          birthday?: string | null
          company_established_year?: number | null
          company_homepage?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          expo_push_notification_token?: string | null
          firstname?: string | null
          firstname_kana?: string | null
          hide_age?: boolean | null
          hide_in_recommend?: boolean | null
          id?: string
          ignore_app_settings?: boolean | null
          introduction?: string | null
          invited_by?: string | null
          is_debug_premium?: boolean | null
          job_join_date?: string | null
          job_left_date?: string | null
          job_position?: string | null
          last_active_datetime?: string | null
          last_recommended_date?: string | null
          lastname?: string | null
          lastname_kana?: string | null
          line_data?: Json | null
          location?: string | null
          profile_bg_url?: string | null
          revenuecat_app_user_id?: string | null
          salary_range?: string | null
          sns_link1?: string | null
          sns_link2?: string | null
          sns_link3?: string | null
          staff_status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      random_users: {
        Row: {
          avatar_url: string | null
          birthday: string | null
          created_at: string | null
          email: string | null
          expo_push_notification_token: string | null
          firstname: string | null
          firstname_kana: string | null
          hide_age: boolean | null
          id: string | null
          introduction: string | null
          last_recommended_date: string | null
          lastname: string | null
          lastname_kana: string | null
          profile_bg_url: string | null
          sns_link1: string | null
          sns_link2: string | null
          sns_link3: string | null
        }
        Insert: {
          avatar_url?: string | null
          birthday?: string | null
          created_at?: string | null
          email?: string | null
          expo_push_notification_token?: string | null
          firstname?: string | null
          firstname_kana?: string | null
          hide_age?: boolean | null
          id?: string | null
          introduction?: string | null
          last_recommended_date?: string | null
          lastname?: string | null
          lastname_kana?: string | null
          profile_bg_url?: string | null
          sns_link1?: string | null
          sns_link2?: string | null
          sns_link3?: string | null
        }
        Update: {
          avatar_url?: string | null
          birthday?: string | null
          created_at?: string | null
          email?: string | null
          expo_push_notification_token?: string | null
          firstname?: string | null
          firstname_kana?: string | null
          hide_age?: boolean | null
          id?: string | null
          introduction?: string | null
          last_recommended_date?: string | null
          lastname?: string | null
          lastname_kana?: string | null
          profile_bg_url?: string | null
          sns_link1?: string | null
          sns_link2?: string | null
          sns_link3?: string | null
        }
        Relationships: []
      }
      s_staff_with_category: {
        Row: {
          avatar_url: string | null
          category_id: number | null
          category_image: string | null
          category_name: string | null
          created_at: string | null
          firstname: string | null
          firstname_kana: string | null
          id: string | null
          introduction: string | null
          lastname: string | null
          lastname_kana: string | null
          location: string | null
        }
        Relationships: [
          {
            foreignKeyName: "s_staff_categories_rel_staff_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "s_staff_categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      db_pre_request: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      db_pre_request_debug: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      enum_types: {
        Args: Record<PropertyKey, never>
        Returns: {
          enum_name: string
          enum_value: string
        }[]
      }
      get_recommended_profiles: {
        Args: { current_user_id: string; recommend_count: number }
        Returns: {
          avatar_url: string | null
          birthday: string | null
          company_established_year: number | null
          company_homepage: string | null
          company_name: string | null
          created_at: string | null
          email: string | null
          expo_push_notification_token: string | null
          firstname: string | null
          firstname_kana: string | null
          hide_age: boolean | null
          hide_in_recommend: boolean | null
          id: string
          ignore_app_settings: boolean | null
          introduction: string | null
          invited_by: string | null
          is_debug_premium: boolean | null
          job_join_date: string | null
          job_left_date: string | null
          job_position: string | null
          last_active_datetime: string | null
          last_recommended_date: string | null
          lastname: string | null
          lastname_kana: string | null
          line_data: Json | null
          location: string | null
          profile_bg_url: string | null
          revenuecat_app_user_id: string | null
          salary_range: string | null
          sns_link1: string | null
          sns_link2: string | null
          sns_link3: string | null
          staff_status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
        }[]
      }
      get_table_details: {
        Args: { target_table: string }
        Returns: {
          table_name: string
          column_name: string
          is_nullable: string
          data_type: string
          udt_name: string
          character_maximum_length: number
          column_default: string
          is_identity: string
          identity_generation: string
        }[]
      }
      list_public_relations: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
        }[]
      }
      list_public_tables: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
        }[]
      }
      req: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      test_login: {
        Args: { user_email: string; logout_first?: boolean }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "community_admin"
      COMMUNITY_JOIN_MODE: "INVITATION_ONLY" | "OPEN_TO_ALL"
      community_member_status:
        | "INVITED"
        | "REQUESTED"
        | "ACCEPTED"
        | "REQUEST_REJECTED"
        | "REMOVED"
        | "INVITATION_REJECTED"
      EVENT_TYPE: "ONLINE" | "OFFLINE" | "ONDEMAND"
      recommendation_status: "ACCEPTED" | "REJECTED" | "NOT_USED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          level: number | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      prefixes: {
        Row: {
          bucket_id: string
          created_at: string | null
          level: number
          name: string
          updated_at: string | null
        }
        Insert: {
          bucket_id: string
          created_at?: string | null
          level?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          bucket_id?: string
          created_at?: string | null
          level?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prefixes_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_prefixes: {
        Args: { _bucket_id: string; _name: string }
        Returns: undefined
      }
      can_insert_object: {
        Args: { bucketid: string; name: string; owner: string; metadata: Json }
        Returns: undefined
      }
      delete_prefix: {
        Args: { _bucket_id: string; _name: string }
        Returns: boolean
      }
      extension: {
        Args: { name: string }
        Returns: string
      }
      filename: {
        Args: { name: string }
        Returns: string
      }
      foldername: {
        Args: { name: string }
        Returns: string[]
      }
      get_level: {
        Args: { name: string }
        Returns: number
      }
      get_prefix: {
        Args: { name: string }
        Returns: string
      }
      get_prefixes: {
        Args: { name: string }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
        }
        Returns: {
          key: string
          id: string
          created_at: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          start_after?: string
          next_token?: string
        }
        Returns: {
          name: string
          id: string
          metadata: Json
          updated_at: string
        }[]
      }
      operation: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
      search_legacy_v1: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
      search_v1_optimised: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
      search_v2: {
        Args: {
          prefix: string
          bucket_name: string
          limits?: number
          levels?: number
          start_after?: string
        }
        Returns: {
          key: string
          name: string
          id: string
          updated_at: string
          created_at: string
          metadata: Json
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["admin", "staff", "community_admin"],
      COMMUNITY_JOIN_MODE: ["INVITATION_ONLY", "OPEN_TO_ALL"],
      community_member_status: [
        "INVITED",
        "REQUESTED",
        "ACCEPTED",
        "REQUEST_REJECTED",
        "REMOVED",
        "INVITATION_REJECTED",
      ],
      EVENT_TYPE: ["ONLINE", "OFFLINE", "ONDEMAND"],
      recommendation_status: ["ACCEPTED", "REJECTED", "NOT_USED"],
    },
  },
  storage: {
    Enums: {},
  },
} as const

