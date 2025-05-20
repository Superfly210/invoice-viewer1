
import React from "react";
import { Button } from "@/components/ui/button";
import { RotateCw, ChevronLeft, ChevronRight, Maximize } from "lucide-react";

interface PDFControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  onRotate: () => void;
  onFitWidth: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export const PDFControls = ({
  currentPage,
  totalPages,
  onPageChange,
  onRotate,
  onFitWidth,
  onZoomIn,
  onZoomOut,
}: PDFControlsProps) => {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm">
          Page {currentPage}/{totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={onRotate}>
          <RotateCw className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={onFitWidth}>
          <Maximize className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={onZoomOut}>
          -
        </Button>
        <span className="text-sm">100%</span>
        <Button variant="outline" size="sm" onClick={onZoomIn}>
          +
        </Button>
      </div>
    </div>
  );
};
