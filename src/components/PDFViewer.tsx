
import { useState } from "react";
import { Plus, Minus, Maximize, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export const PDFViewer = () => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 3;

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
        <div 
          className="mx-auto bg-white shadow-md overflow-hidden"
          style={{ 
            width: `${zoomLevel}%`, 
            minHeight: '100%',
            transform: `scale(${zoomLevel/100})`,
            transformOrigin: 'top center'
          }}
        >
          <div className="p-8 min-h-[1100px]">
            <div className="border-b-2 border-slate-300 pb-4 mb-8">
              <div className="text-2xl font-bold mb-1">INVOICE</div>
              <div className="text-lg font-semibold text-slate-600">Norbridge Supply Inc.</div>
            </div>
            
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <div className="text-sm text-slate-500 mb-1">BILL TO:</div>
                <div className="font-medium">Alberta Field Operations</div>
                <div>123 Energy Way</div>
                <div>Calgary, AB T2P 0L4</div>
                <div>Canada</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Invoice Number:</span>
                  <span>INV-009876</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Invoice Date:</span>
                  <span>2024-11-18</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Due Date:</span>
                  <span>2024-12-18</span>
                </div>
              </div>
            </div>
            
            <table className="w-full mb-8 border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="text-left p-2 border border-slate-300">Item</th>
                  <th className="text-left p-2 border border-slate-300">Description</th>
                  <th className="text-right p-2 border border-slate-300">Quantity</th>
                  <th className="text-right p-2 border border-slate-300">Unit Price</th>
                  <th className="text-right p-2 border border-slate-300">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border border-slate-300">1</td>
                  <td className="p-2 border border-slate-300">Heavy Equipment Rental - Excavator</td>
                  <td className="text-right p-2 border border-slate-300">5 days</td>
                  <td className="text-right p-2 border border-slate-300">$1,250.00</td>
                  <td className="text-right p-2 border border-slate-300">$6,250.00</td>
                </tr>
                <tr>
                  <td className="p-2 border border-slate-300">2</td>
                  <td className="p-2 border border-slate-300">Field Maintenance Services</td>
                  <td className="text-right p-2 border border-slate-300">1 service</td>
                  <td className="text-right p-2 border border-slate-300">$4,500.00</td>
                  <td className="text-right p-2 border border-slate-300">$4,500.00</td>
                </tr>
                <tr>
                  <td className="p-2 border border-slate-300">3</td>
                  <td className="p-2 border border-slate-300">Supply Materials</td>
                  <td className="text-right p-2 border border-slate-300">1 package</td>
                  <td className="text-right p-2 border border-slate-300">$2,100.00</td>
                  <td className="text-right p-2 border border-slate-300">$2,100.00</td>
                </tr>
              </tbody>
            </table>
            
            <div className="flex justify-end mb-8">
              <div className="w-64">
                <div className="flex justify-between py-2">
                  <span className="font-medium">Subtotal:</span>
                  <span>$12,850.00</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-medium">GST (5%):</span>
                  <span>$642.50</span>
                </div>
                <div className="flex justify-between py-2 border-t border-slate-300 font-bold">
                  <span>Total:</span>
                  <span>$13,492.50</span>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-slate-600">
              <div className="font-medium mb-1">Payment Terms:</div>
              <div>Payment due within 30 days. Please make checks payable to Norbridge Supply Inc.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
