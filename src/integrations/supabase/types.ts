export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      afe: {
        Row: {
          AFE_Description: Json | null
          afe_estimate: number
          afe_number: string
          approved_amount: number
          awaiting_approval_amount: number
          created_at: string | null
          id: string
          responsible_user_id: string | null
          updated_at: string | null
        }
        Insert: {
          AFE_Description?: Json | null
          afe_estimate?: number
          afe_number: string
          approved_amount?: number
          awaiting_approval_amount?: number
          created_at?: string | null
          id?: string
          responsible_user_id?: string | null
          updated_at?: string | null
        }
        Update: {
          AFE_Description?: Json | null
          afe_estimate?: number
          afe_number?: string
          approved_amount?: number
          awaiting_approval_amount?: number
          created_at?: string | null
          id?: string
          responsible_user_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "afe_responsible_user_id_fkey"
            columns: ["responsible_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      "Attachment Info": {
        Row: {
          Attach_Markdown: Json | null
          created_at: string
          Email_ID: number | null
          GST_Number: Json | null
          GST_Total: number | null
          id: number
          Invoice_Number: string | null
          Invoicing_Comp_City: string | null
          Invoicing_Comp_Name: string | null
          Invoicing_Comp_Postal_Code: string | null
          Invoicing_Comp_State_Prov: string | null
          Invoicing_Comp_Street: Json | null
          Sub_Total: number | null
          Total: number | null
          WCB_Number: Json | null
        }
        Insert: {
          Attach_Markdown?: Json | null
          created_at?: string
          Email_ID?: number | null
          GST_Number?: Json | null
          GST_Total?: number | null
          id?: number
          Invoice_Number?: string | null
          Invoicing_Comp_City?: string | null
          Invoicing_Comp_Name?: string | null
          Invoicing_Comp_Postal_Code?: string | null
          Invoicing_Comp_State_Prov?: string | null
          Invoicing_Comp_Street?: Json | null
          Sub_Total?: number | null
          Total?: number | null
          WCB_Number?: Json | null
        }
        Update: {
          Attach_Markdown?: Json | null
          created_at?: string
          Email_ID?: number | null
          GST_Number?: Json | null
          GST_Total?: number | null
          id?: number
          Invoice_Number?: string | null
          Invoicing_Comp_City?: string | null
          Invoicing_Comp_Name?: string | null
          Invoicing_Comp_Postal_Code?: string | null
          Invoicing_Comp_State_Prov?: string | null
          Invoicing_Comp_Street?: Json | null
          Sub_Total?: number | null
          Total?: number | null
          WCB_Number?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "Attachment Info_Email_ID_fkey"
            columns: ["Email_ID"]
            isOneToOne: false
            referencedRelation: "Email Information"
            referencedColumns: ["id_"]
          },
        ]
      }
      "Cost Code": {
        Row: {
          Cost_Code: string | null
          created_at: string
          id: number
        }
        Insert: {
          Cost_Code?: string | null
          created_at?: string
          id?: number
        }
        Update: {
          Cost_Code?: string | null
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      cost_centers: {
        Row: {
          code: string
          created_at: string | null
          description: string
          id: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      "Email Information": {
        Row: {
          created_at: string
          Date: string | null
          From: Json | null
          id: Json | null
          id_: number
          "message-id": Json | null
          Subject: Json | null
          threadID: Json | null
          "x-recieved": Json | null
        }
        Insert: {
          created_at?: string
          Date?: string | null
          From?: Json | null
          id?: Json | null
          id_?: number
          "message-id"?: Json | null
          Subject?: Json | null
          threadID?: Json | null
          "x-recieved"?: Json | null
        }
        Update: {
          created_at?: string
          Date?: string | null
          From?: Json | null
          id?: Json | null
          id_?: number
          "message-id"?: Json | null
          Subject?: Json | null
          threadID?: Json | null
          "x-recieved"?: Json | null
        }
        Relationships: []
      }
      "Line Items": {
        Row: {
          AFE_number: Json | null
          Cost_Center: Json | null
          Cost_Code: Json | null
          created_at: string
          Description: Json | null
          id: number
          invoice_id: number
          Qauntity: Json | null
          Rate: Json | null
          Total: Json | null
          Unit_of_Measure: Json | null
        }
        Insert: {
          AFE_number?: Json | null
          Cost_Center?: Json | null
          Cost_Code?: Json | null
          created_at?: string
          Description?: Json | null
          id?: number
          invoice_id: number
          Qauntity?: Json | null
          Rate?: Json | null
          Total?: Json | null
          Unit_of_Measure?: Json | null
        }
        Update: {
          AFE_number?: Json | null
          Cost_Center?: Json | null
          Cost_Code?: Json | null
          created_at?: string
          Description?: Json | null
          id?: number
          invoice_id?: number
          Qauntity?: Json | null
          Rate?: Json | null
          Total?: Json | null
          Unit_of_Measure?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "Line Items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "Attachment Info"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          user_permission: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          user_permission?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          user_permission?: string
          username?: string | null
        }
        Relationships: []
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
