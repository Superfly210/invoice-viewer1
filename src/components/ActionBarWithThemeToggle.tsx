
import { 
  CheckCircle, 
  XCircle, 
  CornerUpRight, 
  ChevronLeft,
  PauseCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

type ActionBarProps = {
  onApprove: () => void;
  onDeny: () => void;
  onQuarantine: () => void;
  onForward: () => void;
  currentInvoice: number;
  totalInvoices: number;
  onPrevious: () => void;
  onNext: () => void;
};

export const ActionBarWithThemeToggle = ({
  onApprove,
  onDeny,
  onQuarantine,
  onForward,
  currentInvoice,
  totalInvoices,
  onPrevious,
  onNext,
}: ActionBarProps) => {
  return (
    <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
      <div className="flex items-center space-x-2">
        <Button 
          onClick={onPrevious}
          variant="outline"
          disabled={currentInvoice <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-sm font-medium">
          Invoice {currentInvoice} of {totalInvoices}
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <Button 
          onClick={onApprove}
          className="bg-green-500 hover:bg-green-600 text-white min-w-[100px]"
        >
          <CheckCircle className="h-4 w-4 mr-2" /> Approve
        </Button>
        <Button 
          onClick={onDeny}
          className="bg-red-500 hover:bg-red-600 text-white min-w-[100px]"
        >
          <XCircle className="h-4 w-4 mr-2" /> Deny
        </Button>
        <Button 
          onClick={onQuarantine}
          className="bg-[#FEF7CD] hover:bg-[#F6E68E] text-amber-800 min-w-[100px] dark:bg-amber-700 dark:hover:bg-amber-800 dark:text-white"
        >
          <PauseCircle className="h-4 w-4 mr-2" /> Hold
        </Button>
        <Button 
          onClick={onForward}
          className="min-w-[100px]"
        >
          <CornerUpRight className="h-4 w-4 mr-2" /> Forward
        </Button>
      </div>
    </div>
  );
};
