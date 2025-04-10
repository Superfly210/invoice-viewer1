
import { cn } from "@/lib/utils";

type ConfidenceDisplayProps = {
  confidence: number;
};

export const ConfidenceDisplay = ({ confidence }: ConfidenceDisplayProps) => {
  return (
    <div className="flex items-center mt-1">
      <div className="text-xs text-slate-500 mr-2">Confidence:</div>
      <div className="relative w-20 h-6 border border-slate-300 rounded overflow-hidden">
        <div 
          className={cn(
            "absolute inset-0 h-full",
            confidence >= 90 ? "bg-green-500" :
            confidence >= 75 ? "bg-blue-500" :
            "bg-amber-500"
          )}
          style={{ width: `${confidence}%` }}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
          {confidence}%
        </div>
      </div>
    </div>
  );
};
