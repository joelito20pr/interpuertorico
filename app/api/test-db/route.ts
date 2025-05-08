import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Test the database connection with a simple query
    const result = await db`SELECT NOW() as time`

    // Return the result
    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      time: result?.[0]?.time,
      databaseUrl: process.env.DATABASE_URL ? "Set (masked for security)" : "Not set",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error testing database connection:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error connecting to database",
        details: error instanceof Error ? error.message : String(error),
        databaseUrl: process.env.DATABASE_URL ? "Set (masked for security)" : "Not set",
      },
      { status: 500 },
    )
  }
}
