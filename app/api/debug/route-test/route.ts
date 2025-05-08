import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "API route test successful",
    timestamp: new Date().toISOString(),
    routes: [
      { path: "/api/debug/route-test", status: "working" },
      { path: "/api/events/register-new", method: "POST", description: "New registration endpoint" },
    ],
  })
}
