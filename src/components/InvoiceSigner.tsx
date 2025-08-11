import { useState } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Document, Page } from 'react-pdf';
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  date: z.string().min(1, { message: "Date is required." }),
  description: z.string(),
  afe: z.string(),
  amount: z.string(),
});

export default function InvoiceSigner() {
  const [files, setFiles] = useState<File[]>([]);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number; page: number } | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: "",
      description: "",
      afe: "",
      amount: "",
    },
  });

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...uploadedFiles]);
    if (!currentFile && uploadedFiles.length > 0) {
      loadPdf(uploadedFiles[0]);
    }
  };

  const loadPdf = (file: File) => {
    setCurrentFile(file);
    const url = URL.createObjectURL(file);
    setPdfUrl(url);
    form.reset();
    setClickPosition(null);
  };

  const handlePdfClick = async (e: React.MouseEvent) => {
    if (!currentFile) return;

    const viewer = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - viewer.left;
    const y = e.clientY - viewer.top;

    const arrayBuffer = await currentFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const page = pdfDoc.getPage(currentPage - 1);
    const { width, height } = page.getSize();

    const scale = width / viewer.width;
    const pdfX = x * scale;
    const pdfY = height - (y * scale);

    setClickPosition({ x: pdfX, y: pdfY, page: currentPage });
  };

  const handleGenerate = async (values: z.infer<typeof formSchema>) => {
    if (!currentFile || !clickPosition || !values.date) return;

    const arrayBuffer = await currentFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const page = pdfDoc.getPage(clickPosition.page - 1);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const stampText = `Date: ${values.date}\nDescription: ${values.description}\nAFE: ${values.afe}\nAmount: ${values.amount}`;
    page.drawText(stampText, {
      x: clickPosition.x,
      y: clickPosition.y,
      size: 12,
      font,
      color: rgb(0, 0, 0),
      maxWidth: 200,
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const signedUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = signedUrl;
    a.download = `signed_${currentFile.name}`;
    a.click();

    const { data, error } = await supabase.storage.from('signed-invoices').upload(`signed_${currentFile.name}`, blob);
    if (error) console.error(error);
    else console.log('Signed PDF uploaded:', data.path);
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/4 p-4 border-r">
        <Input type="file" multiple accept=".pdf" onChange={handleUpload} />
        <ul>
          {files.map((file, idx) => (
            <li key={idx} onClick={() => loadPdf(file)} className="cursor-pointer">
              {file.name}
            </li>
          ))}
        </ul>
      </div>

      <div className="w-1/2 p-4" onClick={handlePdfClick}>
        {pdfUrl && (
          <Document file={pdfUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
            <Page pageNumber={currentPage} />
          </Document>
        )}
      </div>

      <div className="w-1/4 p-4 border-l">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleGenerate)} className="space-y-8">
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
                  <FormLabel>AFE Number/Cost Code</FormLabel>
                  <FormControl>
                    <Input placeholder="AFE or Cost Code" {...field} />
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
            <Button type="submit">Stamp & Generate</Button>
          </form>
        </Form>
      </div>
    </div>
  );
}