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
          AFE_Numbers: Json | null
          Attach_Markdown: Json | null
          "Cost Centers": Json | null
          "Cost Codes": Json | null
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
          Number_Of_Pages: Json | null
          Page_Field_Ticket_Starts_On: Json | null
          Sub_Total: number | null
          Total: number | null
          Type_of_Document: Json | null
          WCB_Number: Json | null
        }
        Insert: {
          AFE_Numbers?: Json | null
          Attach_Markdown?: Json | null
          "Cost Centers"?: Json | null
          "Cost Codes"?: Json | null
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
          Number_Of_Pages?: Json | null
          Page_Field_Ticket_Starts_On?: Json | null
          Sub_Total?: number | null
          Total?: number | null
          Type_of_Document?: Json | null
          WCB_Number?: Json | null
        }
        Update: {
          AFE_Numbers?: Json | null
          Attach_Markdown?: Json | null
          "Cost Centers"?: Json | null
          "Cost Codes"?: Json | null
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
          Number_Of_Pages?: Json | null
          Page_Field_Ticket_Starts_On?: Json | null
          Sub_Total?: number | null
          Total?: number | null
          Type_of_Document?: Json | null
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
      document_metadata: {
        Row: {
          created_at: string | null
          id: string
          schema: string | null
          title: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          schema?: string | null
          title?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          schema?: string | null
          title?: string | null
          url?: string | null
        }
        Relationships: []
      }
      document_rows: {
        Row: {
          dataset_id: string | null
          id: number
          row_data: Json | null
        }
        Insert: {
          dataset_id?: string | null
          id?: number
          row_data?: Json | null
        }
        Update: {
          dataset_id?: string | null
          id?: number
          row_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "document_rows_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "document_metadata"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
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
          Date_of_Work: Json | null
          Description: Json | null
          id: number
          invoice_id: number
          Qauntity: Json | null
          Rate: Json | null
          Ticket_Work_Order: Json | null
          Total: Json | null
          Unit_of_Measure: Json | null
        }
        Insert: {
          AFE_number?: Json | null
          Cost_Center?: Json | null
          Cost_Code?: Json | null
          created_at?: string
          Date_of_Work?: Json | null
          Description?: Json | null
          id?: number
          invoice_id: number
          Qauntity?: Json | null
          Rate?: Json | null
          Ticket_Work_Order?: Json | null
          Total?: Json | null
          Unit_of_Measure?: Json | null
        }
        Update: {
          AFE_number?: Json | null
          Cost_Center?: Json | null
          Cost_Code?: Json | null
          created_at?: string
          Date_of_Work?: Json | null
          Description?: Json | null
          id?: number
          invoice_id?: number
          Qauntity?: Json | null
          Rate?: Json | null
          Ticket_Work_Order?: Json | null
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
      n8n_chat_histories: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
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
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      match_documents: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
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
