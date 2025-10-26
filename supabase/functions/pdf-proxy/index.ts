import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// SECURITY: Restrict CORS to specific origins
// Set ALLOWED_ORIGINS environment variable in Supabase Edge Function settings
// Example: "https://yourdomain.com,https://app.yourdomain.com"
// For development, we allow localhost on any port
const getAllowedOrigin = (requestOrigin: string | null): string => {
  // Production domains - hardcoded for reliability
  const productionOrigins = [
    'https://www.nubuck.site',
    'https://nubuck.site',
  ];
  
  // Get additional origins from environment variable
  const envOrigins = Deno.env.get('ALLOWED_ORIGINS')?.split(',').map(o => o.trim()) || [];
  const allowedOrigins = [...productionOrigins, ...envOrigins];
  
  if (requestOrigin) {
    // Check if origin is in the explicit allowlist
    if (allowedOrigins.includes(requestOrigin)) {
      return requestOrigin;
    }
    
    // DEVELOPMENT: Allow localhost on any port
    // This allows http://localhost:8080, http://localhost:5173, etc.
    if (requestOrigin.startsWith('http://localhost:') || 
        requestOrigin.startsWith('http://127.0.0.1:')) {
      return requestOrigin;
    }
  }
  
  // If no match and we have configured origins, use the first one
  if (allowedOrigins.length > 0) {
    return allowedOrigins[0];
  }
  
  // Fallback for development
  return 'http://localhost:8080';
};

const getCorsHeaders = (requestOrigin: string | null) => ({
  'Access-Control-Allow-Origin': getAllowedOrigin(requestOrigin),
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400', // 24 hours
});

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
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
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
    // SECURITY: Structured logging without exposing sensitive data
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[PDF-PROXY-ERROR]', {
      error: errorMessage,
      timestamp: new Date().toISOString(),
      // Don't log the actual URL to avoid leaking sensitive Google Drive links
    });
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process PDF request',
        errorCode: 'PDF_PROXY_ERROR'
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
