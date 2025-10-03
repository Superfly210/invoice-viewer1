import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Convert Google Drive URLs to direct download format
const convertGoogleDriveUrl = (url: string): string => {
  if (!url) return url;
  
  // Check if it's a Google Drive URL
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^\/]+)/);
  if (driveMatch) {
    const fileId = driveMatch[1];
    // Use the direct download URL which works better server-side
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }
  
  return url;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      throw new Error('URL is required');
    }

    console.log('Proxying PDF from URL:', url);

    // Convert Google Drive URLs to direct download format
    const processedUrl = convertGoogleDriveUrl(url);
    console.log('Processed URL:', processedUrl);

    // Fetch the PDF from the remote source
    const pdfResponse = await fetch(processedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!pdfResponse.ok) {
      throw new Error(`Failed to fetch PDF: ${pdfResponse.status} ${pdfResponse.statusText}`);
    }

    // Get the PDF content as an array buffer
    const pdfBuffer = await pdfResponse.arrayBuffer();
    console.log('Successfully fetched PDF, size:', pdfBuffer.byteLength, 'bytes');

    // Return the PDF with proper headers
    return new Response(pdfBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error in pdf-proxy function:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
