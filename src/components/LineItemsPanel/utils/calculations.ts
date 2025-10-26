/**
 * Utility functions for line items calculations
 */

import type { FlatLineItem, LineItemTotals, LineItemRowSpans } from "../types";

/**
 * Calculate totals from line items
 */
export function calculateTotals(flatLineItems: FlatLineItem[]): LineItemTotals {
  const subtotal = flatLineItems.reduce((sum, item) => sum + (item.Total || 0), 0);
  const gst = flatLineItems.reduce((sum, item) => sum + (item.calc_gst || 0), 0);
  
  return { subtotal, gst };
}

/**
 * Calculate row spans for table rendering
 */
export function calculateRowSpans(flatLineItems: FlatLineItem[]): LineItemRowSpans {
  return flatLineItems.reduce((acc, item) => {
    acc[item.lineItemId] = (acc[item.lineItemId] || 0) + 1;
    return acc;
  }, {} as LineItemRowSpans);
}

/**
 * Check if this is the first row for a line item
 */
export function isFirstRowForLineItem(
  lineItemId: number,
  renderedLineItemIds: Set<number>
): boolean {
  const isFirst = !renderedLineItemIds.has(lineItemId);
  if (isFirst) {
    renderedLineItemIds.add(lineItemId);
  }
  return isFirst;
}
