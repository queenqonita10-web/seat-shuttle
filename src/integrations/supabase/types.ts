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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: string | null
          id: string
          module: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: string | null
          id?: string
          module: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: string | null
          id?: string
          module?: string
          user_id?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          created_at: string
          fare: number
          id: string
          passenger_name: string
          passenger_phone: string
          payment_method: string
          payment_status: string
          pickup_point_id: string
          seat_number: string
          status: string
          trip_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          fare?: number
          id: string
          passenger_name: string
          passenger_phone?: string
          payment_method?: string
          payment_status?: string
          pickup_point_id: string
          seat_number: string
          status?: string
          trip_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          fare?: number
          id?: string
          passenger_name?: string
          passenger_phone?: string
          payment_method?: string
          payment_status?: string
          pickup_point_id?: string
          seat_number?: string
          status?: string
          trip_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_locations: {
        Row: {
          driver_id: string
          heading: number | null
          id: string
          lat: number
          lng: number
          speed: number | null
          updated_at: string
        }
        Insert: {
          driver_id: string
          heading?: number | null
          id?: string
          lat: number
          lng: number
          speed?: number | null
          updated_at?: string
        }
        Update: {
          driver_id?: string
          heading?: number | null
          id?: string
          lat?: number
          lng?: number
          speed?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_locations_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: true
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          name: string
          phone: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          name: string
          phone?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string
          phone?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          booking_id: string
          completed_at: string | null
          created_at: string
          currency: string
          error_code: string | null
          error_message: string | null
          fraud_status: string | null
          id: string
          metadata: Json | null
          midtrans_order_id: string
          midtrans_transaction_id: string | null
          payment_method: string
          payment_type: string | null
          snap_redirect_url: string | null
          snap_token: string | null
          status: Database["public"]["Enums"]["payment_status_enum"]
          transaction_status: string | null
          transaction_time: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          booking_id: string
          completed_at?: string | null
          created_at?: string
          currency?: string
          error_code?: string | null
          error_message?: string | null
          fraud_status?: string | null
          id: string
          metadata?: Json | null
          midtrans_order_id: string
          midtrans_transaction_id?: string | null
          payment_method: string
          payment_type?: string | null
          snap_redirect_url?: string | null
          snap_token?: string | null
          status?: Database["public"]["Enums"]["payment_status_enum"]
          transaction_status?: string | null
          transaction_time?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: string
          completed_at?: string | null
          created_at?: string
          currency?: string
          error_code?: string | null
          error_message?: string | null
          fraud_status?: string | null
          id?: string
          metadata?: Json | null
          midtrans_order_id?: string
          midtrans_transaction_id?: string | null
          payment_method?: string
          payment_type?: string | null
          snap_redirect_url?: string | null
          snap_token?: string | null
          status?: Database["public"]["Enums"]["payment_status_enum"]
          transaction_status?: string | null
          transaction_time?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      pickup_points: {
        Row: {
          fare: number
          id: string
          label: string
          route_id: string
          sort_order: number
          time_offset: number
        }
        Insert: {
          fare?: number
          id: string
          label: string
          route_id: string
          sort_order?: number
          time_offset?: number
        }
        Update: {
          fare?: number
          id?: string
          label?: string
          route_id?: string
          sort_order?: number
          time_offset?: number
        }
        Relationships: [
          {
            foreignKeyName: "pickup_points_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          loyalty_points: number
          name: string
          phone: string | null
          total_trips: number
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          loyalty_points?: number
          name?: string
          phone?: string | null
          total_trips?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          loyalty_points?: number
          name?: string
          phone?: string | null
          total_trips?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      routes: {
        Row: {
          created_at: string
          destination: string
          distance: number
          estimated_time: string
          id: string
          is_deleted: boolean
          name: string
          origin: string
          route_code: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          destination: string
          distance?: number
          estimated_time?: string
          id: string
          is_deleted?: boolean
          name: string
          origin: string
          route_code: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          destination?: string
          distance?: number
          estimated_time?: string
          id?: string
          is_deleted?: boolean
          name?: string
          origin?: string
          route_code?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      seat_layout_templates: {
        Row: {
          cols: number
          created_at: string
          id: string
          layout: Json
          name: string
          rows: number
        }
        Insert: {
          cols: number
          created_at?: string
          id: string
          layout?: Json
          name: string
          rows: number
        }
        Update: {
          cols?: number
          created_at?: string
          id?: string
          layout?: Json
          name?: string
          rows?: number
        }
        Relationships: []
      }
      seats: {
        Row: {
          col_num: number
          id: string
          row_num: number
          seat_number: string
          status: string
          trip_id: string
        }
        Insert: {
          col_num: number
          id: string
          row_num: number
          seat_number: string
          status?: string
          trip_id: string
        }
        Update: {
          col_num?: number
          id?: string
          row_num?: number
          seat_number?: string
          status?: string
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seats_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          booking_id: string
          created_at: string
          departure_date: string
          departure_time: string
          id: string
          pickup_point_id: string
          route_id: string
          seat_number: string
          status: string
          tracking_status: string
          trip_id: string
          updated_at: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          departure_date: string
          departure_time: string
          id: string
          pickup_point_id: string
          route_id: string
          seat_number: string
          status?: string
          tracking_status?: string
          trip_id: string
          updated_at?: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          departure_date?: string
          departure_time?: string
          id?: string
          pickup_point_id?: string
          route_id?: string
          seat_number?: string
          status?: string
          tracking_status?: string
          trip_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          created_at: string
          departure_date: string
          departure_time: string
          driver_id: string | null
          id: string
          route_id: string
          status: string
          updated_at: string
          vehicle_id: string | null
          vehicle_type_id: string
        }
        Insert: {
          created_at?: string
          departure_date?: string
          departure_time: string
          driver_id?: string | null
          id: string
          route_id: string
          status?: string
          updated_at?: string
          vehicle_id?: string | null
          vehicle_type_id: string
        }
        Update: {
          created_at?: string
          departure_date?: string
          departure_time?: string
          driver_id?: string | null
          id?: string
          route_id?: string
          status?: string
          updated_at?: string
          vehicle_id?: string | null
          vehicle_type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trips_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_vehicle_type_id_fkey"
            columns: ["vehicle_type_id"]
            isOneToOne: false
            referencedRelation: "vehicle_types"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicle_types: {
        Row: {
          capacity: number
          created_at: string
          id: string
          layout: Json
          name: string
        }
        Insert: {
          capacity: number
          created_at?: string
          id: string
          layout?: Json
          name: string
        }
        Update: {
          capacity?: number
          created_at?: string
          id?: string
          layout?: Json
          name?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          assigned_route_id: string | null
          brand: string
          color: string
          created_at: string
          id: string
          is_deleted: boolean
          layout_template_id: string | null
          license_plate: string
          model: string
          status: string
          updated_at: string
          vehicle_type_id: string
          year: number
        }
        Insert: {
          assigned_route_id?: string | null
          brand: string
          color?: string
          created_at?: string
          id: string
          is_deleted?: boolean
          layout_template_id?: string | null
          license_plate: string
          model: string
          status?: string
          updated_at?: string
          vehicle_type_id: string
          year: number
        }
        Update: {
          assigned_route_id?: string | null
          brand?: string
          color?: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          layout_template_id?: string | null
          license_plate?: string
          model?: string
          status?: string
          updated_at?: string
          vehicle_type_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_assigned_route_id_fkey"
            columns: ["assigned_route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_layout_template_id_fkey"
            columns: ["layout_template_id"]
            isOneToOne: false
            referencedRelation: "seat_layout_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_vehicle_type_id_fkey"
            columns: ["vehicle_type_id"]
            isOneToOne: false
            referencedRelation: "vehicle_types"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Enums: {
      app_role: "admin" | "driver"
      payment_status_enum:
        | "pending"
        | "processing"
        | "success"
        | "failed"
        | "cancelled"
        | "expired"
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
      app_role: ["admin", "driver"],
      payment_status_enum: [
        "pending",
        "processing",
        "success",
        "failed",
        "cancelled",
        "expired",
      ],
    },
  },
} as const
