import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// CORS headers for API responses
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Max-Age": "86400", // 24 hours
}

// Helper function to add CORS headers to any response
export function addCorsHeaders(response: NextResponse) {
  // Add CORS headers to the response
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}

// Handle CORS preflight requests
export function handleCors(request: NextRequest) {
  // Handle preflight requests
  if (request.method === "OPTIONS") {
    console.log("Handling CORS preflight request")
    return new NextResponse(null, {
      status: 204, // No content
      headers: corsHeaders,
    })
  }

  return null
}

// Wrap a response with CORS headers
export function withCors(res: NextResponse): NextResponse {
  console.log("Adding CORS headers to response")
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.headers.set(key, value)
  })
  return res
}
