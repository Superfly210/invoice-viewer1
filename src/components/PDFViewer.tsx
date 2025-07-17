import { useState, useEffect, useRef } from "react";
import { Minus, Plus, Maximize, ChevronUp, ChevronDown, Loader2, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type PDFViewerProps = {
  pdfUrl?: string | null;
  onPageChange?: (currentPage: number, totalPages: number) => void;
};

export const PDFViewer = ({ pdfUrl, onPageChange }: PDFViewerProps) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!pdfUrl) return;
    
    setLoading(true);
    setError(null);
    
    // Process Google Drive URL to get direct view/download link
    try {
      // Google Drive URLs can be in different formats
      // For sharing links like: https://drive.google.com/file/d/{fileId}/view?usp=sharing
      const fileIdMatch = pdfUrl.match(/\/file\/d\/([^\/]+)/);
      
      if (fileIdMatch && fileIdMatch[1]) {
        const fileId = fileIdMatch[1];
        // Direct link for embedding/viewing
        setProcessedUrl(`https://drive.google.com/file/d/${fileId}/preview`);
      } else if (pdfUrl.includes('drive.google.com')) {
        // Try to handle other Google Drive URL formats
        setProcessedUrl(pdfUrl);
      } else {
        // If it's already a direct URL, use it as is
        setProcessedUrl(pdfUrl);
      }
      
      // Reset zoom level and page to defaults when loading a new PDF
      setZoomLevel(100);
      setCurrentPage(1);
      // Try to get actual page count from the PDF or use a reasonable default
      setTotalPages(1);
      
    } catch (err) {
      console.error("Error processing PDF URL:", err);
      setError("Unable to process the PDF URL");
    } finally {
      setLoading(false);
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
    setZoomLevel(prev => Math.min(prev + 10, 200));
    // Note: Zoom controls don't work with Google Drive embedded PDFs due to iframe limitations
    console.log("Zoom in to:", zoomLevel + 10);
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 50));
    // Note: Zoom controls don't work with Google Drive embedded PDFs due to iframe limitations
    console.log("Zoom out to:", zoomLevel - 10);
  };

  const fitToWidth = () => {
    setZoomLevel(100);
    // Note: Fit to width doesn't work with Google Drive embedded PDFs due to iframe limitations
    console.log("Fit to width");
  };

  const rotateView = () => {
    const newRotation = (rotation + 90) % 360;
    setRotation(newRotation);
    // Note: Rotation doesn't work with Google Drive embedded PDFs due to iframe limitations
    console.log("Rotate to:", newRotation);
  };

  const previousPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      console.log("Going to previous page:", newPage);
      setCurrentPage(newPage);
      // Note: Page navigation doesn't work with Google Drive embedded PDFs due to iframe limitations
      // Google Drive preview controls its own navigation internally
    }
  };

  const nextPage = () => {
    // Since we can't detect the actual page count from Google Drive, allow navigation
    const newPage = currentPage + 1;
    console.log("Going to next page:", newPage);
    setCurrentPage(newPage);
    // Note: Page navigation doesn't work with Google Drive embedded PDFs due to iframe limitations
    // Google Drive preview controls its own navigation internally
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
          <span className="text-sm">{zoomLevel}%</span>
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
            disabled={false}
            className="h-8 w-8"
            title="Next Page"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-0 bg-slate-100 relative">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
            <span className="ml-2 text-slate-500">Loading PDF...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-red-500 text-center p-4">
              <p className="font-semibold">Error loading PDF</p>
              <p className="mt-2">{error}</p>
            </div>
          </div>
        ) : processedUrl ? (
          <iframe
            ref={iframeRef}
            src={processedUrl}
            className="w-full h-full border-0"
            title="PDF Document"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            onLoad={() => {
              console.log("PDF iframe loaded");
              // Apply any rotation that was set
              if (rotation !== 0 && iframeRef.current) {
                iframeRef.current.style.transform = `rotate(${rotation}deg)`;
                iframeRef.current.style.transformOrigin = 'center';
              }
            }}
            style={{
              userSelect: 'text',
              WebkitUserSelect: 'text',
              MozUserSelect: 'text',
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-600">No PDF URL available</p>
          </div>
        )}
      </div>
    </div>
  );
};
