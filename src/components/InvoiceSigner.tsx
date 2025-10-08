import { useState, useRef } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Document, Page, pdfjs } from 'react-pdf';
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Upload, X, FileText } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

const formSchema = z.object({
  date: z.string().min(1, { message: "Date is required." }),
  description: z.string(),
  afe: z.string(),
  costCode: z.string(), // New field
  amount: z.string(),
});

interface FileState {
  file: File;
  formData: z.infer<typeof formSchema>;
  clickPosition: { x: number; y: number; page: number; canvasX: number; canvasY: number } | null;
}

export default function InvoiceSigner() {
  const [fileStates, setFileStates] = useState<FileState[]>([]);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageRef = useRef(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const handleFileChange = (uploadedFiles: File[]) => {
    const newFileStates = uploadedFiles.map(file => ({
      file,
      formData: {
        date: "",
        description: "",
        afe: "",
        amount: "",
      },
      clickPosition: null,
    }));
    setFileStates((prev) => [...prev, ...newFileStates]);
    if (!currentFile && newFileStates.length > 0) {
      loadPdf(newFileStates[0].file);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(e.target.files || []);
    handleFileChange(uploadedFiles);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const uploadedFiles = Array.from(e.dataTransfer.files || []);
    handleFileChange(uploadedFiles.filter(f => f.type === 'application/pdf'));
  };

  const removeFile = (fileToRemove: File) => {
    setFileStates(prev => prev.filter(fs => fs.file !== fileToRemove));
    if (currentFile === fileToRemove) {
      if (fileStates.length > 1) {
        loadPdf(fileStates.find(fs => fs.file !== fileToRemove)!.file);
      } else {
        setCurrentFile(null);
        setPdfUrl('');
        setNumPages(0);
        setCurrentPage(1);
      }
    }
  };

  const loadPdf = (file: File) => {
    setCurrentFile(file);
    const url = URL.createObjectURL(file);
    setPdfUrl(url);
    const fileState = fileStates.find(fs => fs.file === file);
    if (fileState) {
      form.reset(fileState.formData);
    }
    setCurrentPage(1);
  };

  const handlePdfClick = async (e: React.MouseEvent) => {
    if (!currentFile || !pageRef.current) return;

    const pageElement = pageRef.current as HTMLDivElement;
    const canvas = pageElement.querySelector('canvas');
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const arrayBuffer = await currentFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const page = pdfDoc.getPage(currentPage - 1);
    const { width: pageWidth, height: pageHeight } = page.getSize();

    // Adjust for page rotation
    const rotation = page.getRotation().angle;
    let pdfX, pdfY;

    if (rotation === 90) {
      pdfX = (y / rect.height) * pageWidth;
      pdfY = pageHeight - (x / rect.width) * pageHeight;
    } else if (rotation === 180) {
      pdfX = pageWidth - (x / rect.width) * pageWidth;
      pdfY = (y / rect.height) * pageHeight;
    } else if (rotation === 270) {
      pdfX = pageWidth - (y / rect.height) * pageWidth;
      pdfY = (x / rect.width) * pageHeight;
    } else { // 0 or other
      pdfX = (x / rect.width) * pageWidth;
      pdfY = pageHeight - (y / rect.height) * pageHeight;
    }

    setFileStates(prev => prev.map(fs => 
      fs.file === currentFile ? { ...fs, clickPosition: { x: pdfX, y: pdfY, page: currentPage, canvasX: x, canvasY: y } } : fs
    ));
  };

  const handleGenerate = async (values: z.infer<typeof formSchema>) => {
    const currentState = fileStates.find(fs => fs.file === currentFile);
    if (!currentState || !currentState.clickPosition || !values.date) return;

    const arrayBuffer = await currentState.file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const page = pdfDoc.getPage(currentState.clickPosition.page - 1);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const stampText = `Date: ${values.date}
Description: ${values.description}
AFE Number/Cost Center: ${values.afe}
Cost Code: ${values.costCode}
Amount: ${values.amount}`;
    const stampFontSize = 12;
    const stampLineHeight = stampFontSize * 0.1; // Extremely tight spacing (heavy overlap)
    const stampHeight = stampText.split('\n').length * stampLineHeight; // Total height of the stamp text

    page.drawText(stampText, {
      x: currentState.clickPosition.x,
      y: currentState.clickPosition.y - stampHeight, // Adjust y to align top of stamp with click
      size: stampFontSize,
      font,
      color: rgb(0, 0, 0),
      maxWidth: 200,
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
    const signedUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = signedUrl;
    a.download = `signed_${currentState.file.name}`;
    a.click();

    const { data, error } = await supabase.storage.from('signed-invoices').upload(`signed_${currentState.file.name}`, blob, { upsert: true });
    if (error) console.error(error);
    else console.log('Signed PDF uploaded:', data.path);
  };

  const currentFileState = fileStates.find(fs => fs.file === currentFile);

  return (
    <div className="flex h-screen">
      <div className="w-1/4 p-4 border-r space-y-4">
        <div 
          className="border-2 border-dashed border-border rounded-lg p-6 text-center"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-2">
            Drag and drop PDFs here, or click to browse
          </p>
          <input
            type="file"
            multiple
            accept="application/pdf"
            onChange={handleUpload}
            className="hidden"
            id="pdf-upload"
          />
          <Button onClick={() => document.getElementById('pdf-upload')?.click()}>
            Choose Files
          </Button>
        </div>
        <div className="space-y-2">
          {fileStates.map((fs, idx) => (
            <div key={idx} className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer ${currentFile === fs.file ? 'bg-muted' : ''}`} onClick={() => loadPdf(fs.file)}>
              <FileText className="h-6 w-6 text-blue-500" />
              <span className="flex-1 text-sm truncate">{fs.file.name}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => { e.stopPropagation(); removeFile(fs.file); }}
                className="text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div ref={pdfContainerRef} className="w-1/2 p-4 bg-gray-100 flex flex-col items-center justify-center overflow-y-auto" onClick={handlePdfClick}>
        {pdfUrl ? (
          <>
            <div ref={pageRef} className="relative max-w-full max-h-full overflow-hidden">
              <Document file={pdfUrl} onLoadSuccess={({ numPages }) => {
                setNumPages(numPages);
              }} onLoadError={console.error}>
                {pdfContainerRef.current && (
                  <Page
                    pageNumber={currentPage}
                    width={pdfContainerRef.current.clientWidth - 32} // Subtract 2 * 16px padding
                    height={pdfContainerRef.current.clientHeight - 32} // Subtract 2 * 16px padding
                  />
                )}
              </Document>
              {currentFileState?.clickPosition && currentFileState.clickPosition.page === currentPage && (
                <div 
                  className="absolute w-3 h-3 bg-red-500 rounded-full"
                  style={{
                    left: `${currentFileState.clickPosition.canvasX}px`,
                    top: `${currentFileState.clickPosition.canvasY}px`,
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              )}
            </div>
            <div className="flex justify-center items-center space-x-4 mt-4">
              <Button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage <= 1}>Previous</Button>
              <span>Page {currentPage} of {numPages}</span>
              <Button onClick={() => setCurrentPage(p => Math.min(p + 1, numPages))} disabled={currentPage >= numPages}>Next</Button>
            </div>
          </>
        ) : (
          <div className="text-center text-muted-foreground">
            <p>Select a PDF to view</p>
          </div>
        )}
      </div>

      <div className="w-1/4 p-4 border-l">
        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(handleGenerate)} 
            onChange={() => {
              setFileStates(prev => prev.map(fs =>
                fs.file === currentFile ? { ...fs, formData: form.getValues() } : fs
              ));
            }}
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input placeholder="YYYY-MM-DD" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="afe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AFE Number/Cost Center</FormLabel>
                  <FormControl>
                    <Input placeholder="AFE or Cost Center" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="costCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Cost Code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input placeholder="Amount" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={!currentFileState?.clickPosition}>Stamp & Generate</Button>
          </form>
        </Form>
        {currentFileState?.clickPosition && (
          <div className="mt-4 p-2 bg-muted rounded">
            Position set on page {currentFileState.clickPosition.page}
          </div>
        )}
      </div>
    </div>
  );

}