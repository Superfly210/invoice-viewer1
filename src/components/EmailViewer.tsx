
import { FileText, Paperclip } from "lucide-react";

export const EmailViewer = () => {
  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="flex justify-between items-center p-3 border-b border-slate-200 bg-slate-50">
        <div className="font-medium">From: sarah.johnson@norbridgesupply.com</div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <div className="text-lg font-semibold mb-2">Invoice INV-009876 for Alberta Field Operations</div>
          <div className="text-sm text-slate-500 mb-4">
            Sent: Nov 18, 2024 09:14 AM
          </div>
        </div>

        <div className="prose max-w-none text-slate-700 mb-6">
          <p>Hello,</p>
          <p>Please find attached the invoice (INV-009876) for services provided to Alberta Field Operations during the period of November 1-15, 2024.</p>
          <p>The total amount due is $13,492.50 (including GST). Payment is due within 30 days of receipt.</p>
          <p>If you have any questions regarding this invoice, please don't hesitate to contact our accounting department.</p>
          <p>Thank you for your business!</p>
          <p>Best regards,</p>
          <p>Sarah Johnson<br />Accounts Receivable<br />Norbridge Supply Inc.</p>
        </div>

        <div className="border-t border-slate-200 pt-4">
          <div className="text-sm font-medium mb-2">Attachments (1)</div>
          <div className="flex items-center p-2 bg-slate-50 rounded border border-slate-200">
            <FileText className="h-5 w-5 text-blue-500 mr-2" />
            <div className="flex-1">
              <div className="text-sm font-medium">INV-009876.pdf</div>
              <div className="text-xs text-slate-500">245 KB</div>
            </div>
            <button className="text-sm text-blue-600 flex items-center">
              <Paperclip className="h-4 w-4 mr-1" /> Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
