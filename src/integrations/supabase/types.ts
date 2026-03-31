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
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          booking_ref: string
          check_in: string
          check_out: string
          created_at: string
          customer_id: string
          grand_total: number
          guests_count: number
          id: string
          room_id: string
          room_subtotal: number
          safari_package_id: string | null
          safari_subtotal: number
          special_requests: string | null
          status: Database["public"]["Enums"]["booking_status"]
          taxes: number
          total_nights: number
          updated_at: string
        }
        Insert: {
          booking_ref?: string
          check_in: string
          check_out: string
          created_at?: string
          customer_id: string
          grand_total: number
          guests_count?: number
          id?: string
          room_id: string
          room_subtotal: number
          safari_package_id?: string | null
          safari_subtotal?: number
          special_requests?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          taxes?: number
          total_nights: number
          updated_at?: string
        }
        Update: {
          booking_ref?: string
          check_in?: string
          check_out?: string
          created_at?: string
          customer_id?: string
          grand_total?: number
          guests_count?: number
          id?: string
          room_id?: string
          room_subtotal?: number
          safari_package_id?: string | null
          safari_subtotal?: number
          special_requests?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          taxes?: number
          total_nights?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_safari_package_id_fkey"
            columns: ["safari_package_id"]
            isOneToOne: false
            referencedRelation: "safari_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          date_of_birth: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          id: string
          loyalty_points: number
          nationality: string | null
          notes: string | null
          passport_number: string | null
          total_stays: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id: string
          loyalty_points?: number
          nationality?: string | null
          notes?: string | null
          passport_number?: string | null
          total_stays?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id?: string
          loyalty_points?: number
          nationality?: string | null
          notes?: string | null
          passport_number?: string | null
          total_stays?: number
          updated_at?: string
        }
        Relationships: []
      }
      guest_requests: {
        Row: {
          booking_id: string
          created_at: string
          details: string | null
          guest_id: string
          id: string
          request_type: string
          room_id: string
          status: string
          updated_at: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          details?: string | null
          guest_id: string
          id?: string
          request_type: string
          room_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          details?: string | null
          guest_id?: string
          id?: string
          request_type?: string
          room_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guest_requests_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_requests_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      housekeeping_tasks: {
        Row: {
          assigned_to: string | null
          booking_id: string | null
          completed_at: string | null
          created_at: string
          id: string
          notes: string | null
          room_id: string
          scheduled_date: string
          status: Database["public"]["Enums"]["housekeeping_status"]
          task_type: Database["public"]["Enums"]["housekeeping_task_type"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          booking_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          room_id: string
          scheduled_date?: string
          status?: Database["public"]["Enums"]["housekeeping_status"]
          task_type?: Database["public"]["Enums"]["housekeeping_task_type"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          booking_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          room_id?: string
          scheduled_date?: string
          status?: Database["public"]["Enums"]["housekeeping_status"]
          task_type?: Database["public"]["Enums"]["housekeeping_task_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "housekeeping_tasks_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "housekeeping_tasks_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_requests: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string | null
          id: string
          priority: Database["public"]["Enums"]["maintenance_priority"]
          reported_by: string | null
          resolved_at: string | null
          room_id: string
          status: Database["public"]["Enums"]["maintenance_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["maintenance_priority"]
          reported_by?: string | null
          resolved_at?: string | null
          room_id: string
          status?: Database["public"]["Enums"]["maintenance_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["maintenance_priority"]
          reported_by?: string | null
          resolved_at?: string | null
          room_id?: string
          status?: Database["public"]["Enums"]["maintenance_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_requests_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_log: {
        Row: {
          booking_id: string | null
          channel: string
          created_at: string
          error_message: string | null
          event_type: string
          external_id: string | null
          id: string
          message_preview: string | null
          status: string
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          channel: string
          created_at?: string
          error_message?: string | null
          event_type: string
          external_id?: string | null
          id?: string
          message_preview?: string | null
          status?: string
          user_id: string
        }
        Update: {
          booking_id?: string | null
          channel?: string
          created_at?: string
          error_message?: string | null
          event_type?: string
          external_id?: string | null
          id?: string
          message_preview?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_log_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          channel: string
          created_at: string
          event_type: string
          id: string
          is_enabled: boolean
          user_id: string
        }
        Insert: {
          channel: string
          created_at?: string
          event_type: string
          id?: string
          is_enabled?: boolean
          user_id: string
        }
        Update: {
          channel?: string
          created_at?: string
          event_type?: string
          id?: string
          is_enabled?: boolean
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message: string
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          processed_by: string | null
          receipt_number: string
          status: Database["public"]["Enums"]["payment_status"]
          transaction_ref: string | null
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          id?: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          processed_by?: string | null
          receipt_number?: string
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_ref?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          processed_by?: string | null
          receipt_number?: string
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_ref?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_rules: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          is_active: boolean
          max_hours_before: number | null
          min_nights: number | null
          multiplier: number
          name: string
          priority: number
          room_type: Database["public"]["Enums"]["room_type"] | null
          rule_type: string
          start_date: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          max_hours_before?: number | null
          min_nights?: number | null
          multiplier?: number
          name: string
          priority?: number
          room_type?: Database["public"]["Enums"]["room_type"] | null
          rule_type: string
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          max_hours_before?: number | null
          min_nights?: number | null
          multiplier?: number
          name?: string
          priority?: number
          room_type?: Database["public"]["Enums"]["room_type"] | null
          rule_type?: string
          start_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      quote_requests: {
        Row: {
          created_at: string
          destinations: Json
          email: string
          estimated_days: number | null
          estimated_price: number | null
          full_name: string
          guests_count: number
          id: string
          phone: string | null
          preferred_dates: string | null
          special_requests: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          destinations?: Json
          email: string
          estimated_days?: number | null
          estimated_price?: number | null
          full_name: string
          guests_count?: number
          id?: string
          phone?: string | null
          preferred_dates?: string | null
          special_requests?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          destinations?: Json
          email?: string
          estimated_days?: number | null
          estimated_price?: number | null
          full_name?: string
          guests_count?: number
          id?: string
          phone?: string | null
          preferred_dates?: string | null
          special_requests?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string | null
          comment: string | null
          created_at: string | null
          customer_id: string
          id: string
          is_published: boolean | null
          overall_rating: number | null
          reviewer_name: string | null
          reviewer_nationality: string | null
          room_rating: number | null
          safari_rating: number | null
          service_rating: number | null
          stay_type: string | null
        }
        Insert: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string | null
          customer_id: string
          id?: string
          is_published?: boolean | null
          overall_rating?: number | null
          reviewer_name?: string | null
          reviewer_nationality?: string | null
          room_rating?: number | null
          safari_rating?: number | null
          service_rating?: number | null
          stay_type?: string | null
        }
        Update: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string | null
          customer_id?: string
          id?: string
          is_published?: boolean | null
          overall_rating?: number | null
          reviewer_name?: string | null
          reviewer_nationality?: string | null
          room_rating?: number | null
          safari_rating?: number | null
          service_rating?: number | null
          stay_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          amenities: Json | null
          capacity: number
          created_at: string
          description: string | null
          floor: number
          id: string
          images: Json | null
          price_per_night: number
          room_number: string
          room_type: Database["public"]["Enums"]["room_type"]
          status: Database["public"]["Enums"]["room_status"]
          updated_at: string
        }
        Insert: {
          amenities?: Json | null
          capacity?: number
          created_at?: string
          description?: string | null
          floor?: number
          id?: string
          images?: Json | null
          price_per_night: number
          room_number: string
          room_type?: Database["public"]["Enums"]["room_type"]
          status?: Database["public"]["Enums"]["room_status"]
          updated_at?: string
        }
        Update: {
          amenities?: Json | null
          capacity?: number
          created_at?: string
          description?: string | null
          floor?: number
          id?: string
          images?: Json | null
          price_per_night?: number
          room_number?: string
          room_type?: Database["public"]["Enums"]["room_type"]
          status?: Database["public"]["Enums"]["room_status"]
          updated_at?: string
        }
        Relationships: []
      }
      safari_guides: {
        Row: {
          bio: string | null
          created_at: string | null
          full_name: string
          id: string
          is_available: boolean | null
          languages: string[] | null
          photo_url: string | null
          rating: number | null
          specialties: string[] | null
          updated_at: string | null
          years_experience: number | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          full_name: string
          id?: string
          is_available?: boolean | null
          languages?: string[] | null
          photo_url?: string | null
          rating?: number | null
          specialties?: string[] | null
          updated_at?: string | null
          years_experience?: number | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          is_available?: boolean | null
          languages?: string[] | null
          photo_url?: string | null
          rating?: number | null
          specialties?: string[] | null
          updated_at?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      safari_packages: {
        Row: {
          cover_image: string | null
          created_at: string
          destinations: Json | null
          difficulty_level: Database["public"]["Enums"]["safari_difficulty"]
          duration_days: number
          excludes: string[] | null
          gallery: Json | null
          highlights: string[] | null
          id: string
          includes: string[] | null
          itinerary: Json | null
          max_group_size: number
          name: string
          price_per_person: number
          status: Database["public"]["Enums"]["safari_status"]
          updated_at: string
        }
        Insert: {
          cover_image?: string | null
          created_at?: string
          destinations?: Json | null
          difficulty_level?: Database["public"]["Enums"]["safari_difficulty"]
          duration_days: number
          excludes?: string[] | null
          gallery?: Json | null
          highlights?: string[] | null
          id?: string
          includes?: string[] | null
          itinerary?: Json | null
          max_group_size?: number
          name: string
          price_per_person: number
          status?: Database["public"]["Enums"]["safari_status"]
          updated_at?: string
        }
        Update: {
          cover_image?: string | null
          created_at?: string
          destinations?: Json | null
          difficulty_level?: Database["public"]["Enums"]["safari_difficulty"]
          duration_days?: number
          excludes?: string[] | null
          gallery?: Json | null
          highlights?: string[] | null
          id?: string
          includes?: string[] | null
          itinerary?: Json | null
          max_group_size?: number
          name?: string
          price_per_person?: number
          status?: Database["public"]["Enums"]["safari_status"]
          updated_at?: string
        }
        Relationships: []
      }
      safari_vehicles: {
        Row: {
          capacity: number
          created_at: string | null
          id: string
          image_url: string | null
          name: string
          registration_number: string | null
          status: string | null
          updated_at: string | null
          vehicle_type: string | null
        }
        Insert: {
          capacity?: number
          created_at?: string | null
          id?: string
          image_url?: string | null
          name: string
          registration_number?: string | null
          status?: string | null
          updated_at?: string | null
          vehicle_type?: string | null
        }
        Update: {
          capacity?: number
          created_at?: string | null
          id?: string
          image_url?: string | null
          name?: string
          registration_number?: string | null
          status?: string | null
          updated_at?: string | null
          vehicle_type?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      generate_booking_ref: { Args: never; Returns: string }
      generate_receipt_number: { Args: never; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "guest"
      booking_status:
        | "pending"
        | "confirmed"
        | "checked_in"
        | "checked_out"
        | "cancelled"
      housekeeping_status: "pending" | "in_progress" | "done" | "inspected"
      housekeeping_task_type:
        | "checkout_clean"
        | "stayover_clean"
        | "turndown"
        | "guest_request"
        | "deep_clean"
      maintenance_priority: "low" | "medium" | "high" | "urgent"
      maintenance_status: "reported" | "assigned" | "in_progress" | "completed"
      payment_method: "cash" | "mpesa" | "card" | "bank_transfer"
      payment_status: "pending" | "completed" | "refunded"
      room_status: "available" | "occupied" | "maintenance"
      room_type: "standard" | "deluxe" | "suite" | "villa"
      safari_difficulty: "easy" | "moderate" | "challenging" | "extreme"
      safari_status: "active" | "inactive"
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
      app_role: ["admin", "staff", "guest"],
      booking_status: [
        "pending",
        "confirmed",
        "checked_in",
        "checked_out",
        "cancelled",
      ],
      housekeeping_status: ["pending", "in_progress", "done", "inspected"],
      housekeeping_task_type: [
        "checkout_clean",
        "stayover_clean",
        "turndown",
        "guest_request",
        "deep_clean",
      ],
      maintenance_priority: ["low", "medium", "high", "urgent"],
      maintenance_status: ["reported", "assigned", "in_progress", "completed"],
      payment_method: ["cash", "mpesa", "card", "bank_transfer"],
      payment_status: ["pending", "completed", "refunded"],
      room_status: ["available", "occupied", "maintenance"],
      room_type: ["standard", "deluxe", "suite", "villa"],
      safari_difficulty: ["easy", "moderate", "challenging", "extreme"],
      safari_status: ["active", "inactive"],
    },
  },
} as const
