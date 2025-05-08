import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Test basic database connectivity
    const connectionTest = await db`SELECT NOW() as time`

    // Check Event table
    let eventTableExists = false
    let eventCount = 0
    let sampleEvent = null

    try {
      const tableCheck = await db`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'Event'
        ) as exists
      `
      eventTableExists = tableCheck[0]?.exists || false

      if (eventTableExists) {
        const countResult = await db`SELECT COUNT(*) as count FROM "Event"`
        eventCount = Number.parseInt(countResult[0]?.count || "0")

        if (eventCount > 0) {
          const eventResult = await db`SELECT * FROM "Event" LIMIT 1`
          sampleEvent = eventResult[0]
        }
      }
    } catch (error) {
      console.error("Error checking Event table:", error)
    }

    return NextResponse.json({
      success: true,
      databaseConnected: true,
      connectionTime: connectionTest[0]?.time,
      eventTable: {
        exists: eventTableExists,
        count: eventCount,
        sample: sampleEvent,
      },
    })
  } catch (error) {
    console.error("Database connection error:", error)
    return NextResponse.json(
      {
        success: false,
        databaseConnected: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
