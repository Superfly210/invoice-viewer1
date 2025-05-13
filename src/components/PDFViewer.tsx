import { useState, useEffect } from "react";
import { Plus, Minus, Maximize, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type PDFViewerProps = {
  pdfUrl?: string | null;
};

export const PDFViewer = ({ pdfUrl }: PDFViewerProps) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 3;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);

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
    } catch (err) {
      console.error("Error processing PDF URL:", err);
      setError("Unable to process the PDF URL");
    } finally {
      setLoading(false);
    }
  }, [pdfUrl]);

  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 200));
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 50));
  };

  const fitToWidth = () => {
    setZoomLevel(100);
  };

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
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
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="text-sm">{zoomLevel}%</span>
          <Button 
            onClick={zoomIn} 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button 
            onClick={fitToWidth} 
            variant="outline" 
            className="text-xs h-8"
          >
            <Maximize className="h-3 w-3 mr-1" /> Fit Width
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            onClick={previousPage} 
            variant="outline" 
            size="icon" 
            disabled={currentPage === 1}
            className="h-8 w-8"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} / {totalPages}
          </span>
          <Button 
            onClick={nextPage} 
            variant="outline" 
            size="icon" 
            disabled={currentPage === totalPages}
            className="h-8 w-8"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 bg-slate-100">
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
            src={processedUrl}
            className="w-full h-full border-0"
            title="PDF Document"
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        ) : (
          <div 
            className="mx-auto bg-white shadow-md overflow-hidden"
            style={{ 
              width: `${zoomLevel}%`, 
              minHeight: '100%',
              transform: `scale(${zoomLevel/100})`,
              transformOrigin: 'top center'
            }}
          >
            {/* Fallback invoice content - when no URL is provided */}
            <div className="p-8 min-h-[1100px]">
              <div className="border-b-2 border-slate-300 pb-4 mb-8">
                <div className="text-2xl font-bold mb-1 text-black">INVOICE</div>
                <div className="text-lg font-semibold text-slate-600">Norbridge Supply Inc.</div>
              </div>
              
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <div className="text-sm text-slate-500 mb-1">BILL TO:</div>
                  <div className="font-medium text-black">Alberta Field Operations</div>
                  <div className="text-black">123 Energy Way</div>
                  <div className="text-black">Calgary, AB T2P 0L4</div>
                  <div className="text-black">Canada</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-black">Invoice Number:</span>
                    <span className="text-black">INV-009876</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-black">Invoice Date:</span>
                    <span className="text-black">2024-11-18</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-black">Due Date:</span>
                    <span className="text-black">2024-12-18</span>
                  </div>
                </div>
              </div>
              
              <table className="w-full mb-8 border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="text-left p-2 border border-slate-300 text-black">Item</th>
                    <th className="text-left p-2 border border-slate-300 text-black">Description</th>
                    <th className="text-right p-2 border border-slate-300 text-black">Quantity</th>
                    <th className="text-right p-2 border border-slate-300 text-black">Unit Price</th>
                    <th className="text-right p-2 border border-slate-300 text-black">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border border-slate-300 text-black">1</td>
                    <td className="p-2 border border-slate-300 text-black">Heavy Equipment Rental - Excavator</td>
                    <td className="text-right p-2 border border-slate-300 text-black">5 days</td>
                    <td className="text-right p-2 border border-slate-300 text-black">$1,250.00</td>
                    <td className="text-right p-2 border border-slate-300 text-black">$6,250.00</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-300 text-black">2</td>
                    <td className="p-2 border border-slate-300 text-black">Field Maintenance Services</td>
                    <td className="text-right p-2 border border-slate-300 text-black">1 service</td>
                    <td className="text-right p-2 border border-slate-300 text-black">$4,500.00</td>
                    <td className="text-right p-2 border border-slate-300 text-black">$4,500.00</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-300 text-black">3</td>
                    <td className="p-2 border border-slate-300 text-black">Supply Materials</td>
                    <td className="text-right p-2 border border-slate-300 text-black">1 package</td>
                    <td className="text-right p-2 border border-slate-300 text-black">$2,100.00</td>
                    <td className="text-right p-2 border border-slate-300 text-black">$2,100.00</td>
                  </tr>
                </tbody>
              </table>
              
              <div className="flex justify-end mb-8">
                <div className="w-64">
                  <div className="flex justify-between py-2">
                    <span className="font-medium text-black">Subtotal:</span>
                    <span className="text-black">$12,850.00</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-medium text-black">GST (5%):</span>
                    <span className="text-black">$642.50</span>
                  </div>
                  <div className="flex justify-between py-2 border-t border-slate-300 font-bold">
                    <span className="text-black">Total:</span>
                    <span className="text-black">$13,492.50</span>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-slate-600">
                <div className="font-medium mb-1">Payment Terms:</div>
                <div>Payment due within 30 days. Please make checks payable to Norbridge Supply Inc.</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
