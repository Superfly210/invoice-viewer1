
import { AlertTriangle } from "lucide-react";
import { InvoiceFieldData } from "./InvoiceField";

type IssuesSummaryProps = {
  fields: InvoiceFieldData[];
};

export const IssuesSummary = ({ fields }: IssuesSummaryProps) => {
  const issuesCount = fields.filter(field => 
    field.validation === "warning" || field.validation === "error"
  ).length;

  if (issuesCount === 0) return null;

  return (
    <div className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs flex items-center">
      <AlertTriangle className="h-3 w-3 mr-1" />
      {issuesCount} {issuesCount === 1 ? "Issue" : "Issues"} Found
    </div>
  );
};
