import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Adds CORS headers to the response
 */
export function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  }
}

/**
 * Handles OPTIONS requests for CORS preflight
 */
export function handleCors(request: NextRequest) {
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: corsHeaders(),
    })
  }
  return null
}

/**
 * Wraps a response with CORS headers
 */
export function withCors(response: NextResponse) {
  Object.entries(corsHeaders()).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}
