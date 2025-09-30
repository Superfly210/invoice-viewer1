import { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from 'react-pdf';
import { Minus, Plus, Maximize, ChevronUp, ChevronDown, Loader2, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

type PDFViewerProps = {
  pdfUrl?: string | null;
  onPageChange?: (currentPage: number, totalPages: number) => void;
};

export const PDFViewer = ({ pdfUrl, onPageChange }: PDFViewerProps) => {
  const [scale, setScale] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  // Measure container width for fit-to-width
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) {
        const width = entries[0].contentRect.width;
        setContainerWidth(width);
      }
    });
    
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Reset state when PDF URL changes
  useEffect(() => {
    if (pdfUrl) {
      setCurrentPage(1);
      setRotation(0);
      setError(null);
    }
  }, [pdfUrl]);

  // Call the onPageChange callback when currentPage or totalPages changes
  useEffect(() => {
    console.log("PDFViewer - page changed:", currentPage, "of", totalPages);
    if (onPageChange) {
      onPageChange(currentPage, totalPages);
    }
  }, [currentPage, totalPages, onPageChange]);

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const fitToWidth = () => {
    setScale(1);
  };

  const rotateView = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setTotalPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error("Error loading PDF:", error);
    setError("Failed to load PDF. Please check the file.");
    setLoading(false);
  };

  const previousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const nextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="flex justify-between items-center p-3 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center space-x-2">
          <Button 
            onClick={zoomOut} 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            title="Zoom Out"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="text-sm">{Math.round(scale * 100)}%</span>
          <Button 
            onClick={zoomIn} 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            title="Zoom In"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button 
            onClick={fitToWidth} 
            variant="outline" 
            className="text-xs h-8"
            title="Fit to Width"
          >
            <Maximize className="h-3 w-3 mr-1" /> Fit Width
          </Button>
          <Button 
            onClick={rotateView} 
            variant="outline" 
            className="text-xs h-8"
            title="Rotate Page"
          >
            <RotateCw className="h-3 w-3 mr-1" /> Rotate
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            onClick={previousPage} 
            variant="outline" 
            size="icon" 
            disabled={currentPage === 1}
            className="h-8 w-8"
            title="Previous Page"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage}
          </span>
          <Button 
            onClick={nextPage} 
            variant="outline" 
            size="icon" 
            disabled={currentPage >= totalPages}
            className="h-8 w-8"
            title="Next Page"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="flex-1 overflow-auto p-4 bg-slate-100 relative flex items-start justify-center"
      >
        {!pdfUrl ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-600">No PDF URL available</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-red-500 text-center p-4">
              <p className="font-semibold">Error loading PDF</p>
              <p className="mt-2">{error}</p>
            </div>
          </div>
        ) : (
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex items-center justify-center h-full py-8">
                <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
                <span className="ml-2 text-slate-500">Loading PDF...</span>
              </div>
            }
          >
            <Page
              pageNumber={currentPage}
              width={containerWidth ? containerWidth * scale * 0.9 : undefined}
              rotate={rotation}
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </Document>
        )}
      </div>
    </div>
  );
};
