import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// CORS headers for API responses
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
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
    return new NextResponse(null, { headers: corsHeaders })
  }

  return null
}

export function withCors(res: NextResponse): NextResponse {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.headers.set(key, value)
  })
  return res
}
