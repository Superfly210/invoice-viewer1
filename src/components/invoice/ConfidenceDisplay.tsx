
import { cn } from "@/lib/utils";

type ConfidenceDisplayProps = {
  confidence: number;
};

export const ConfidenceDisplay = ({ confidence }: ConfidenceDisplayProps) => {
  return (
    <div className="flex items-center">
      <div className="relative w-16 h-5 border border-slate-300 dark:border-slate-600 rounded-sm overflow-hidden">
        <div 
          className={cn(
            "absolute inset-0 h-full",
            confidence >= 90 ? "bg-green-500" :
            confidence >= 75 ? "bg-blue-500" :
            "bg-amber-500"
          )}
          style={{ width: `${confidence}%` }}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-white">
          {confidence}%
        </div>
      </div>
    </div>
  );
};
