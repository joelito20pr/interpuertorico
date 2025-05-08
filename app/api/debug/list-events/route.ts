import { NextResponse } from "next/server"
import { db, testDatabaseConnection } from "@/lib/db"

export async function GET() {
  try {
    // Test database connection first
    const connectionTest = await testDatabaseConnection()
    if (!connectionTest.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
          details: connectionTest.error,
        },
        { status: 500 },
      )
    }

    // Check if Event table exists
    const tableCheck = await db`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'Event'
      ) as exists
    `

    const tableExists = tableCheck[0]?.exists || false

    if (!tableExists) {
      return NextResponse.json(
        {
          success: false,
          error: "Event table does not exist",
          suggestion: "Visit /api/repair-database to create the necessary tables",
        },
        { status: 404 },
      )
    }

    // Get all events
    const events = await db`SELECT * FROM "Event" ORDER BY "createdAt" DESC`

    return NextResponse.json({
      success: true,
      count: events.length,
      data: events.map((event) => ({
        id: event.id,
        title: event.title,
        date: event.date,
        shareableSlug: event.shareableSlug,
      })),
    })
  } catch (error) {
    console.error("Error listing events:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error listing events",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
