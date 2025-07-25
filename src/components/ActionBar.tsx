
import { 
  Check, 
  X, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight,
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

export const ActionBar = ({
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
    <div className="bg-white border-b border-slate-200 p-4 flex flex-wrap justify-between items-center gap-4">
      <div className="flex space-x-2">
        <Button 
          onClick={onApprove} 
          className="bg-green-500 hover:bg-green-600 text-white min-w-[100px]"
        >
          <Check className="h-4 w-4 mr-2" /> Approve
        </Button>
        <Button 
          onClick={onDeny}
          variant="destructive"
          className="min-w-[100px]"
        >
          <X className="h-4 w-4 mr-2" /> Deny
        </Button>
        <Button 
          onClick={onQuarantine}
          className="bg-[#FEF7CD] hover:bg-[#F6E68E] text-amber-800 min-w-[100px]"
        >
          <PauseCircle className="h-4 w-4 mr-2" /> Hold
        </Button>
        <Button 
          onClick={onForward}
          variant="outline"
          className="min-w-[100px]"
        >
          <ArrowRight className="h-4 w-4 mr-2" /> Forward
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Button 
          onClick={onPrevious} 
          variant="outline" 
          size="icon" 
          disabled={currentInvoice === 1}
          className="h-9 w-9"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-slate-700">
          Invoice {currentInvoice} of {totalInvoices}
        </span>
        <Button 
          onClick={onNext} 
          variant="outline" 
          size="icon" 
          disabled={currentInvoice === totalInvoices}
          className="h-9 w-9"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
