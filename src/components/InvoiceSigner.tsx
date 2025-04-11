
import { useState, useCallback } from "react";
import { Upload, FileUp, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export const InvoiceSigner = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    // Filter for PDF files
    const pdfFiles = files.filter(file => 
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    );
    
    if (pdfFiles.length === 0) {
      toast({
        title: "Invalid file type",
        description: "Please select PDF files only",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedFiles(prev => [...prev, ...pdfFiles]);
    
    toast({
      title: "Files added",
      description: `${pdfFiles.length} file(s) ready for processing`,
    });
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processFiles = () => {
    toast({
      title: "Processing invoices",
      description: `${selectedFiles.length} invoice(s) submitted for signing`,
    });
    // Reset after processing
    setSelectedFiles([]);
  };
  
  return (
    <div className="flex flex-col h-full p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold dark:text-white">Invoice Signer</h2>
      </div>
      
      <div 
        className={`border-2 border-dashed rounded-lg p-10 text-center flex flex-col items-center justify-center min-h-[300px] ${
          isDragging 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-slate-300 dark:border-slate-600'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload 
          className={`h-16 w-16 mb-4 ${
            isDragging 
              ? 'text-blue-500' 
              : 'text-slate-400 dark:text-slate-500'
          }`} 
        />
        <p className="text-lg mb-2 dark:text-white">
          {isDragging 
            ? 'Drop files here' 
            : 'Drag and drop invoice files here'}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          or
        </p>
        <input
          type="file"
          id="fileInput"
          multiple
          accept=".pdf"
          className="hidden"
          onChange={handleFileInputChange}
        />
        <Button 
          onClick={() => document.getElementById('fileInput')?.click()}
          className="flex items-center"
        >
          <FileUp className="h-4 w-4 mr-2" />
          Browse Files
        </Button>
      </div>
      
      {selectedFiles.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4 dark:text-white">Selected Invoices</h3>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
            <div className="max-h-[300px] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm text-slate-700 dark:text-slate-300">Filename</th>
                    <th className="py-3 px-4 text-right text-sm text-slate-700 dark:text-slate-300">Size</th>
                    <th className="py-3 px-4 text-right text-sm text-slate-700 dark:text-slate-300">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {selectedFiles.map((file, index) => (
                    <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="py-3 px-4 text-sm flex items-center dark:text-white">
                        <File className="h-4 w-4 mr-2 text-blue-500" />
                        {file.name}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-slate-600 dark:text-slate-400">
                        {(file.size / 1024).toFixed(1)} KB
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700 p-4 flex justify-end">
              <Button onClick={processFiles} className="bg-green-500 hover:bg-green-600 text-white">
                Process {selectedFiles.length} Invoice{selectedFiles.length > 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
