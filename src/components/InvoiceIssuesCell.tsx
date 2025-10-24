import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type InvoiceIssue = {
  type: string;
  message: string;
  severity: "warning" | "error" | "info";
  duplicate_ids?: number[];
};

type InvoiceIssuesCellProps = {
  issues: InvoiceIssue[];
  onNavigateToInvoice?: (invoiceId: number) => void;
};

export const InvoiceIssuesCell: React.FC<InvoiceIssuesCellProps> = ({ 
  issues, 
  onNavigateToInvoice 
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<InvoiceIssue | null>(null);

  if (!issues || issues.length === 0) {
    return (
      <div className="flex items-center justify-center">
        <CheckCircle className="h-4 w-4 text-green-500" />
      </div>
    );
  }

  const handleIssueClick = (issue: InvoiceIssue) => {
    setSelectedIssue(issue);
    setDialogOpen(true);
  };

  const handleNavigate = (invoiceId: number) => {
    setDialogOpen(false);
    if (onNavigateToInvoice) {
      onNavigateToInvoice(invoiceId);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-1">
        {issues.map((issue, index) => (
          <Badge
            key={index}
            variant="outline"
            className="cursor-pointer hover:bg-yellow-50 dark:hover:bg-yellow-950 border-yellow-500 text-yellow-700 dark:text-yellow-400"
            onClick={() => handleIssueClick(issue)}
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            {issue.message}
          </Badge>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              {selectedIssue?.message}
            </DialogTitle>
            <DialogDescription>
              {selectedIssue?.type === "duplicate" && (
                <div className="mt-4">
                  <p className="mb-3 text-sm">
                    This invoice appears to be a duplicate. The following invoice(s) have the same invoice number and company name:
                  </p>
                  <div className="space-y-2">
                    {selectedIssue.duplicate_ids?.map((id) => (
                      <div
                        key={id}
                        className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded border"
                      >
                        <span className="font-mono text-sm">Invoice ID: {id}</span>
                        {onNavigateToInvoice && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleNavigate(id)}
                          >
                            View Invoice
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};
