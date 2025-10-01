import { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Minus, Plus, Maximize, ChevronUp, ChevronDown, Loader2, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

type PDFViewerProps = {
  pdfUrl?: string | null;
  onPageChange?: (currentPage: number, totalPages: number) => void;
};

export const PDFViewer = ({ pdfUrl, onPageChange }: PDFViewerProps) => {
  const [scale, setScale] = useState(1.0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [isGoogleDrive, setIsGoogleDrive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageWidth, setPageWidth] = useState<number>(0);

  useEffect(() => {
    if (!pdfUrl) {
      setProcessedUrl(null);
      setIsGoogleDrive(false);
      return;
    }
    
    // Check if it's a Google Drive URL
    const fileIdMatch = pdfUrl.match(/\/file\/d\/([^\/]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      const fileId = fileIdMatch[1];
      // Use Google Docs Viewer for Google Drive (avoids CORS issues)
      const driveUrl = `https://drive.google.com/uc?id=${fileId}&export=download`;
      const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(driveUrl)}&embedded=true`;
      setProcessedUrl(viewerUrl);
      setIsGoogleDrive(true);
    } else if (pdfUrl.includes('drive.google.com')) {
      const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;
      setProcessedUrl(viewerUrl);
      setIsGoogleDrive(true);
    } else {
      // Use react-pdf for direct URLs
      setProcessedUrl(pdfUrl);
      setIsGoogleDrive(false);
    }
    
    // Reset state when URL changes to force re-render
    setCurrentPage(1);
    setRotation(0);
    setScale(1.0);
    setPageWidth(0);
  }, [pdfUrl]);

  // Call the onPageChange callback when currentPage or totalPages changes
  useEffect(() => {
    if (onPageChange && totalPages > 0) {
      onPageChange(currentPage, totalPages);
    }
  }, [currentPage, totalPages, onPageChange]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setTotalPages(numPages);
    setCurrentPage(1);
  };

  const onPageLoadSuccess = (page: any) => {
    const viewport = page.getViewport({ scale: 1 });
    setPageWidth(viewport.width);
    
    // Auto-fit to width with a small delay to ensure container is properly sized
    setTimeout(() => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 32; // Account for padding
        const calculatedScale = containerWidth / viewport.width;
        setScale(calculatedScale);
      }
    }, 50);
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3.0));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const fitToWidth = () => {
    if (containerRef.current && pageWidth > 0) {
      const containerWidth = containerRef.current.clientWidth - 32;
      const calculatedScale = containerWidth / pageWidth;
      setScale(calculatedScale);
    }
  };

  const rotateView = () => {
    setRotation(prev => (prev + 90) % 360);
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

      <div ref={containerRef} className="flex-1 overflow-auto p-4 bg-muted/30 flex items-center justify-center">
        {!processedUrl ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No PDF URL available</p>
          </div>
        ) : isGoogleDrive ? (
          <iframe
            src={processedUrl}
            className="w-full h-full border-0"
            title="PDF Document"
            style={{
              minHeight: '600px',
            }}
          />
        ) : (
          <Document
            key={processedUrl}
            file={processedUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            options={{
              cMapUrl: 'https://unpkg.com/pdfjs-dist@4.8.69/cmaps/',
              cMapPacked: true,
              standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@4.8.69/standard_fonts/',
            }}
            loading={
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading PDF...</span>
              </div>
            }
            error={
              <div className="flex items-center justify-center h-full">
                <div className="text-destructive text-center p-4">
                  <p className="font-semibold">Error loading PDF</p>
                  <p className="mt-2 text-sm">Unable to load document from this source.</p>
                </div>
              </div>
            }
          >
            <Page
              pageNumber={currentPage}
              scale={scale}
              rotate={rotation}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              onLoadSuccess={onPageLoadSuccess}
            />
          </Document>
        )}
      </div>
    </div>
  );
};
