import { useState, useEffect } from "react";
import { Viewer, Worker, SpecialZoomLevel } from "@react-pdf-viewer/core";
import { zoomPlugin } from "@react-pdf-viewer/zoom";
import { Minus, Plus, Maximize, ChevronUp, ChevronDown, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import styles
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/zoom/lib/styles/index.css";

type PDFViewerProps = {
  pdfUrl?: string | null;
  onPageChange?: (currentPage: number, totalPages: number) => void;
};

// Helper function to convert Google Drive URLs to direct download links
const convertGoogleDriveUrl = (url: string): string => {
  if (!url) return url;
  
  // Check if it's a Google Drive URL
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^\/]+)/);
  if (driveMatch) {
    const fileId = driveMatch[1];
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }
  
  return url;
};

export const PDFViewer = ({ pdfUrl, onPageChange }: PDFViewerProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [rotation, setRotation] = useState(0);
  
  // Convert Google Drive URLs to direct download links
  const processedPdfUrl = pdfUrl ? convertGoogleDriveUrl(pdfUrl) : null;

  // Create plugin instances
  const zoomPluginInstance = zoomPlugin();
  const { ZoomIn, ZoomOut, Zoom } = zoomPluginInstance;

  // Reset state when PDF URL changes
  useEffect(() => {
    setCurrentPage(1);
    setTotalPages(0);
    setRotation(0);
  }, [pdfUrl]);

  // Call the onPageChange callback when currentPage or totalPages changes
  useEffect(() => {
    if (onPageChange && totalPages > 0) {
      onPageChange(currentPage, totalPages);
    }
  }, [currentPage, totalPages, onPageChange]);

  const handleDocumentLoad = (e: any) => {
    setTotalPages(e.doc.numPages);
    setCurrentPage(1);
  };

  const handlePageChange = (e: any) => {
    setCurrentPage(e.currentPage + 1); // react-pdf-viewer uses 0-based index
  };

  const rotateView = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const previousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const nextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="flex flex-col h-full bg-background rounded-lg shadow-sm overflow-hidden">
      <div className="flex justify-between items-center p-3 border-b border-border bg-muted">
        <div className="flex items-center space-x-2">
          <ZoomOut>
            {(props) => (
              <Button 
                onClick={props.onClick} 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                title="Zoom Out"
              >
                <Minus className="h-4 w-4" />
              </Button>
            )}
          </ZoomOut>
          
          <Zoom>
            {(props) => (
              <span className="text-sm">{Math.round(props.scale * 100)}%</span>
            )}
          </Zoom>
          
          <ZoomIn>
            {(props) => (
              <Button 
                onClick={props.onClick} 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                title="Zoom In"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </ZoomIn>
          
          <Button 
            onClick={() => zoomPluginInstance.zoomTo(SpecialZoomLevel.PageWidth)} 
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
            Page {currentPage} / {totalPages || 1}
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

      <div className="flex-1 overflow-auto bg-muted/30">
        {!processedPdfUrl ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No PDF URL available</p>
          </div>
        ) : (
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <div style={{ transform: `rotate(${rotation}deg)`, transformOrigin: 'center' }}>
              <Viewer
                fileUrl={processedPdfUrl}
                plugins={[zoomPluginInstance]}
                defaultScale={SpecialZoomLevel.PageWidth}
                onDocumentLoad={handleDocumentLoad}
                onPageChange={handlePageChange}
                initialPage={currentPage - 1}
              />
            </div>
          </Worker>
        )}
      </div>
    </div>
  );
};
