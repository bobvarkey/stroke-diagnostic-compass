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
      patient_presence: {
        Row: {
          created_at: string
          id: string
          last_seen_at: string
          patient_id: string
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_seen_at?: string
          patient_id: string
          user_id: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          last_seen_at?: string
          patient_id?: string
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_presence_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          active_editors: Json | null
          age: number | null
          clinical_data: Json | null
          created_at: string
          created_by: string | null
          demographics: Json | null
          id: string
          last_edited_by: string | null
          last_known_well: string | null
          name: string | null
          patient_id: string
          sex: string | null
          updated_at: string
          weight: number | null
        }
        Insert: {
          active_editors?: Json | null
          age?: number | null
          clinical_data?: Json | null
          created_at?: string
          created_by?: string | null
          demographics?: Json | null
          id?: string
          last_edited_by?: string | null
          last_known_well?: string | null
          name?: string | null
          patient_id: string
          sex?: string | null
          updated_at?: string
          weight?: number | null
        }
        Update: {
          active_editors?: Json | null
          age?: number | null
          clinical_data?: Json | null
          created_at?: string
          created_by?: string | null
          demographics?: Json | null
          id?: string
          last_edited_by?: string | null
          last_known_well?: string | null
          name?: string | null
          patient_id?: string
          sex?: string | null
          updated_at?: string
          weight?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      stroke_activations: {
        Row: {
          activated_by: string | null
          code_level: Database["public"]["Enums"]["stroke_code_level"]
          created_at: string
          id: string
          location: string
          notes: string | null
          nsa_notification_status: string | null
          nsa_notified: boolean
          patient_id: string
        }
        Insert: {
          activated_by?: string | null
          code_level: Database["public"]["Enums"]["stroke_code_level"]
          created_at?: string
          id?: string
          location: string
          notes?: string | null
          nsa_notification_status?: string | null
          nsa_notified?: boolean
          patient_id: string
        }
        Update: {
          activated_by?: string | null
          code_level?: Database["public"]["Enums"]["stroke_code_level"]
          created_at?: string
          id?: string
          location?: string
          notes?: string | null
          nsa_notification_status?: string | null
          nsa_notified?: boolean
          patient_id?: string
        }
        Relationships: []
      }
      stroke_call_logs: {
        Row: {
          activation_id: string
          call_ended_at: string | null
          call_started_at: string | null
          call_status: Database["public"]["Enums"]["stroke_call_status"]
          contact_id: string
          contact_name: string
          created_at: string
          error_message: string | null
          id: string
          phone_number: string
          role: Database["public"]["Enums"]["stroke_contact_role"]
        }
        Insert: {
          activation_id: string
          call_ended_at?: string | null
          call_started_at?: string | null
          call_status?: Database["public"]["Enums"]["stroke_call_status"]
          contact_id: string
          contact_name: string
          created_at?: string
          error_message?: string | null
          id?: string
          phone_number: string
          role: Database["public"]["Enums"]["stroke_contact_role"]
        }
        Update: {
          activation_id?: string
          call_ended_at?: string | null
          call_started_at?: string | null
          call_status?: Database["public"]["Enums"]["stroke_call_status"]
          contact_id?: string
          contact_name?: string
          created_at?: string
          error_message?: string | null
          id?: string
          phone_number?: string
          role?: Database["public"]["Enums"]["stroke_contact_role"]
        }
        Relationships: [
          {
            foreignKeyName: "stroke_call_logs_activation_id_fkey"
            columns: ["activation_id"]
            isOneToOne: false
            referencedRelation: "stroke_activations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stroke_call_logs_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "stroke_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      stroke_contacts: {
        Row: {
          code_level: Database["public"]["Enums"]["stroke_code_level"]
          created_at: string
          id: string
          is_active: boolean
          name: string
          phone_number: string
          priority_order: number
          role: Database["public"]["Enums"]["stroke_contact_role"]
          updated_at: string
        }
        Insert: {
          code_level?: Database["public"]["Enums"]["stroke_code_level"]
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          phone_number: string
          priority_order?: number
          role: Database["public"]["Enums"]["stroke_contact_role"]
          updated_at?: string
        }
        Update: {
          code_level?: Database["public"]["Enums"]["stroke_code_level"]
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          phone_number?: string
          priority_order?: number
          role?: Database["public"]["Enums"]["stroke_contact_role"]
          updated_at?: string
        }
        Relationships: []
      }
      stroke_settings: {
        Row: {
          created_at: string
          facility_id: string
          id: string
          nsa_enabled: boolean
          nsa_phone_number: string | null
          updated_at: string
          voice_message_code_1: string | null
          voice_message_code_2: string | null
        }
        Insert: {
          created_at?: string
          facility_id?: string
          id?: string
          nsa_enabled?: boolean
          nsa_phone_number?: string | null
          updated_at?: string
          voice_message_code_1?: string | null
          voice_message_code_2?: string | null
        }
        Update: {
          created_at?: string
          facility_id?: string
          id?: string
          nsa_enabled?: boolean
          nsa_phone_number?: string | null
          updated_at?: string
          voice_message_code_1?: string | null
          voice_message_code_2?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          is_renewal: boolean | null
          max_users: number
          plan_type: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          is_renewal?: boolean | null
          max_users?: number
          plan_type: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          is_renewal?: boolean | null
          max_users?: number
          plan_type?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_feedback: {
        Row: {
          created_at: string
          id: string
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
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
      [_ in never]: never
    }
    Functions: {
      get_username: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      stroke_call_status:
        | "pending"
        | "calling"
        | "success"
        | "failed"
        | "no_answer"
      stroke_code_level: "code_1" | "code_2"
      stroke_contact_role:
        | "neurologist"
        | "er_physician"
        | "radiologist"
        | "stroke_nurse"
        | "ct_tech"
        | "pharmacist"
        | "neurosurgeon"
        | "icu_physician"
        | "lab_tech"
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
      stroke_call_status: [
        "pending",
        "calling",
        "success",
        "failed",
        "no_answer",
      ],
      stroke_code_level: ["code_1", "code_2"],
      stroke_contact_role: [
        "neurologist",
        "er_physician",
        "radiologist",
        "stroke_nurse",
        "ct_tech",
        "pharmacist",
        "neurosurgeon",
        "icu_physician",
        "lab_tech",
      ],
    },
  },
} as const
