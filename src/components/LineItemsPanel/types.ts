/**
 * Types and interfaces for Line Items Panel
 */

import { Tables } from "@/integrations/supabase/types";
import { AttachmentInfo } from "@/hooks/useInvoiceDataFetching";

export type LineItem = Tables<'Line_Items'>;
export type Quantity = Tables<'Quantities'>;

export type FlatLineItem = {
  lineItemId: number;
  quantityId: number | null;
  Description: string | null;
  Date_of_Work: string | null;
  Ticket_Work_Order: string | null;
  Unit_of_Measure: string | null;
  Quantity: number | null;
  Rate: number | null;
  Total: number | null;
  calc_gst: number | null;
  gst_exempt: boolean | null;
  gst_included: boolean | null;
};

export type QuantityRow = {
  id: number;
  line_items_id: number | null;
  Unit_of_Measure: string | null;
  Quantity: number | null;
  Rate: number | null;
  calc_total: number | null;
  calc_gst: number | null;
  gst_exempt: boolean | null;
  gst_included: boolean | null;
};

export interface LineItemsPanelProps {
  currentInvoiceId: number | null;
  currentInvoice?: AttachmentInfo | null;
}

export interface LineItemTotals {
  subtotal: number;
  gst: number;
}

export interface LineItemRowSpans {
  [lineItemId: number]: number;
}
