export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      afe: {
        Row: {
          AFE_Description: string | null
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
          AFE_Description?: string | null
          afe_estimate: number
          afe_number: string
          approved_amount: number
          awaiting_approval_amount: number
          created_at?: string | null
          id?: string
          responsible_user_id?: string | null
          updated_at?: string | null
        }
        Update: {
          AFE_Description?: string | null
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
      Attachment_Info: {
        Row: {
          AFE_Numbers: string | null
          Attach_Extract: string | null
          Attach_Local_OCR: string | null
          Attach_Markdown: string | null
          Company_Routed: boolean | null
          "Cost Centers": string | null
          "Cost Codes": string | null
          created_at: string
          Email_ID: string | null
          Email_Info_ID: number | null
          File_Name: string | null
          Google_Drive_ID: string | null
          Google_Drive_URL: string | null
          GST_Number: string | null
          GST_Total: number | null
          id: number
          Invoice_Date: string | null
          Invoice_Number: string | null
          Invoicing_Comp_City: string | null
          Invoicing_Comp_Name: string | null
          Invoicing_Comp_Postal_Code: string | null
          Invoicing_Comp_State_Province: string | null
          Invoicing_Comp_Street: string | null
          md5Checksum: string | null
          Number_Of_Pages: number | null
          Page_Field_Ticket_Starts_On: number | null
          "Responsible User": string | null
          sha1Checksum: string | null
          sha256Checksum: string | null
          Status: string | null
          Sub_Total: number | null
          Total: number | null
          Type_of_Document: string | null
          WCB_Number: string | null
          xmpmm_document_id: string | null
          xmpmm_instanceid: string | null
        }
        Insert: {
          AFE_Numbers?: string | null
          Attach_Extract?: string | null
          Attach_Local_OCR?: string | null
          Attach_Markdown?: string | null
          Company_Routed?: boolean | null
          "Cost Centers"?: string | null
          "Cost Codes"?: string | null
          created_at?: string
          Email_ID?: string | null
          Email_Info_ID?: number | null
          File_Name?: string | null
          Google_Drive_ID?: string | null
          Google_Drive_URL?: string | null
          GST_Number?: string | null
          GST_Total?: number | null
          id?: number
          Invoice_Date?: string | null
          Invoice_Number?: string | null
          Invoicing_Comp_City?: string | null
          Invoicing_Comp_Name?: string | null
          Invoicing_Comp_Postal_Code?: string | null
          Invoicing_Comp_State_Province?: string | null
          Invoicing_Comp_Street?: string | null
          md5Checksum?: string | null
          Number_Of_Pages?: number | null
          Page_Field_Ticket_Starts_On?: number | null
          "Responsible User"?: string | null
          sha1Checksum?: string | null
          sha256Checksum?: string | null
          Status?: string | null
          Sub_Total?: number | null
          Total?: number | null
          Type_of_Document?: string | null
          WCB_Number?: string | null
          xmpmm_document_id?: string | null
          xmpmm_instanceid?: string | null
        }
        Update: {
          AFE_Numbers?: string | null
          Attach_Extract?: string | null
          Attach_Local_OCR?: string | null
          Attach_Markdown?: string | null
          Company_Routed?: boolean | null
          "Cost Centers"?: string | null
          "Cost Codes"?: string | null
          created_at?: string
          Email_ID?: string | null
          Email_Info_ID?: number | null
          File_Name?: string | null
          Google_Drive_ID?: string | null
          Google_Drive_URL?: string | null
          GST_Number?: string | null
          GST_Total?: number | null
          id?: number
          Invoice_Date?: string | null
          Invoice_Number?: string | null
          Invoicing_Comp_City?: string | null
          Invoicing_Comp_Name?: string | null
          Invoicing_Comp_Postal_Code?: string | null
          Invoicing_Comp_State_Province?: string | null
          Invoicing_Comp_Street?: string | null
          md5Checksum?: string | null
          Number_Of_Pages?: number | null
          Page_Field_Ticket_Starts_On?: number | null
          "Responsible User"?: string | null
          sha1Checksum?: string | null
          sha256Checksum?: string | null
          Status?: string | null
          Sub_Total?: number | null
          Total?: number | null
          Type_of_Document?: string | null
          WCB_Number?: string | null
          xmpmm_document_id?: string | null
          xmpmm_instanceid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Attachment Info_Email_Info_ID_fkey"
            columns: ["Email_Info_ID"]
            isOneToOne: false
            referencedRelation: "Email_Info"
            referencedColumns: ["id_"]
          },
        ]
      }
      audit_log: {
        Row: {
          change_type: string
          changed_at: string
          changed_by: string | null
          field_name: string
          id: string
          invoice_id: number
          item_id: number | null
          log_type: string
          new_value: string | null
          old_value: string | null
        }
        Insert: {
          change_type?: string
          changed_at?: string
          changed_by?: string | null
          field_name: string
          id?: string
          invoice_id: number
          item_id?: number | null
          log_type: string
          new_value?: string | null
          old_value?: string | null
        }
        Update: {
          change_type?: string
          changed_at?: string
          changed_by?: string | null
          field_name?: string
          id?: string
          invoice_id?: number
          item_id?: number | null
          log_type?: string
          new_value?: string | null
          old_value?: string | null
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
      cost_codes: {
        Row: {
          code: string | null
          created_at: string
          description: string | null
          id: number
        }
        Insert: {
          code?: string | null
          created_at?: string
          description?: string | null
          id?: number
        }
        Update: {
          code?: string | null
          created_at?: string
          description?: string | null
          id?: number
        }
        Relationships: []
      }
      Email_Info: {
        Row: {
          cc: string | null
          created_at: string
          Date: string | null
          Email_Mark_Down: string | null
          Email_Type: string | null
          Email_Type_Account_Info: boolean | null
          Email_Type_Account_Statement: boolean | null
          Email_Type_Invoice: boolean | null
          Email_Type_Other: boolean | null
          Email_Type_Requesting_Payment: boolean | null
          From: string | null
          id: string | null
          id_: number
          "message-id": string | null
          Subject: string | null
          threadID: string | null
          "x-recieved": string | null
        }
        Insert: {
          cc?: string | null
          created_at?: string
          Date?: string | null
          Email_Mark_Down?: string | null
          Email_Type?: string | null
          Email_Type_Account_Info?: boolean | null
          Email_Type_Account_Statement?: boolean | null
          Email_Type_Invoice?: boolean | null
          Email_Type_Other?: boolean | null
          Email_Type_Requesting_Payment?: boolean | null
          From?: string | null
          id?: string | null
          id_?: number
          "message-id"?: string | null
          Subject?: string | null
          threadID?: string | null
          "x-recieved"?: string | null
        }
        Update: {
          cc?: string | null
          created_at?: string
          Date?: string | null
          Email_Mark_Down?: string | null
          Email_Type?: string | null
          Email_Type_Account_Info?: boolean | null
          Email_Type_Account_Statement?: boolean | null
          Email_Type_Invoice?: boolean | null
          Email_Type_Other?: boolean | null
          Email_Type_Requesting_Payment?: boolean | null
          From?: string | null
          id?: string | null
          id_?: number
          "message-id"?: string | null
          Subject?: string | null
          threadID?: string | null
          "x-recieved"?: string | null
        }
        Relationships: []
      }
      invoice_coding: {
        Row: {
          afe_cost_center: string | null
          afe_number: string | null
          cost_center: string | null
          cost_code: string | null
          created_at: string
          id: number
          invoice_id: number | null
          total: number | null
        }
        Insert: {
          afe_cost_center?: string | null
          afe_number?: string | null
          cost_center?: string | null
          cost_code?: string | null
          created_at?: string
          id?: number
          invoice_id?: number | null
          total?: number | null
        }
        Update: {
          afe_cost_center?: string | null
          afe_number?: string | null
          cost_center?: string | null
          cost_code?: string | null
          created_at?: string
          id?: number
          invoice_id?: number | null
          total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_coding_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "Attachment_Info"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_submissions: {
        Row: {
          additional_comments: string | null
          coding_details: Json
          contact_emails: string[]
          created_at: string
          gst_total: number
          id: string
          invoice_date: string
          invoice_file_path: string
          invoice_total: number
          invoicing_company: string
          sub_total: number
          submitted_at: string
          submitted_by: string | null
          supporting_docs_paths: string[] | null
        }
        Insert: {
          additional_comments?: string | null
          coding_details: Json
          contact_emails: string[]
          created_at?: string
          gst_total: number
          id?: string
          invoice_date: string
          invoice_file_path: string
          invoice_total: number
          invoicing_company: string
          sub_total: number
          submitted_at?: string
          submitted_by?: string | null
          supporting_docs_paths?: string[] | null
        }
        Update: {
          additional_comments?: string | null
          coding_details?: Json
          contact_emails?: string[]
          created_at?: string
          gst_total?: number
          id?: string
          invoice_date?: string
          invoice_file_path?: string
          invoice_total?: number
          invoicing_company?: string
          sub_total?: number
          submitted_at?: string
          submitted_by?: string | null
          supporting_docs_paths?: string[] | null
        }
        Relationships: []
      }
      Line_Items: {
        Row: {
          AFE_number: string | null
          Cost_Center: string | null
          Cost_Code: string | null
          created_at: string
          Date_of_Work: string | null
          Description: string | null
          id: number
          invoice_id: number
          Quantity: number | null
          Rate: number | null
          Ticket_Work_Order: string | null
          Total: number | null
          Unit_of_Measure: string | null
        }
        Insert: {
          AFE_number?: string | null
          Cost_Center?: string | null
          Cost_Code?: string | null
          created_at?: string
          Date_of_Work?: string | null
          Description?: string | null
          id?: number
          invoice_id: number
          Quantity?: number | null
          Rate?: number | null
          Ticket_Work_Order?: string | null
          Total?: number | null
          Unit_of_Measure?: string | null
        }
        Update: {
          AFE_number?: string | null
          Cost_Center?: string | null
          Cost_Code?: string | null
          created_at?: string
          Date_of_Work?: string | null
          Description?: string | null
          id?: number
          invoice_id?: number
          Quantity?: number | null
          Rate?: number | null
          Ticket_Work_Order?: string | null
          Total?: number | null
          Unit_of_Measure?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Line Items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "Attachment_Info"
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
      vendor_info: {
        Row: {
          created_at: string
          gst_number: string | null
          id: number
          invoicing_company_city: string | null
          invoicing_company_name: string | null
          invoicing_company_post_zip_code: string | null
          invoicing_company_province_state: string | null
          invoicing_company_street: string | null
          match_criteria_1: string | null
          match_criteria_2: string | null
          Prompt_Line_Items: string | null
          wcb_number: string | null
        }
        Insert: {
          created_at?: string
          gst_number?: string | null
          id?: number
          invoicing_company_city?: string | null
          invoicing_company_name?: string | null
          invoicing_company_post_zip_code?: string | null
          invoicing_company_province_state?: string | null
          invoicing_company_street?: string | null
          match_criteria_1?: string | null
          match_criteria_2?: string | null
          Prompt_Line_Items?: string | null
          wcb_number?: string | null
        }
        Update: {
          created_at?: string
          gst_number?: string | null
          id?: number
          invoicing_company_city?: string | null
          invoicing_company_name?: string | null
          invoicing_company_post_zip_code?: string | null
          invoicing_company_province_state?: string | null
          invoicing_company_street?: string | null
          match_criteria_1?: string | null
          match_criteria_2?: string | null
          Prompt_Line_Items?: string | null
          wcb_number?: string | null
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
