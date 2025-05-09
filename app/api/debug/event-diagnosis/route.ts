import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get("id")
    const slug = searchParams.get("slug")

    // Test database connection
    const connectionTest = await db`SELECT NOW() as time`
    const dbConnected = connectionTest && connectionTest.length > 0

    // Check if Event table exists
    const tableCheck = await db`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'Event'
      ) as exists
    `
    const tableExists = tableCheck && tableCheck.length > 0 && tableCheck[0].exists

    // Get all events (limited to 10)
    let allEvents = []
    if (tableExists) {
      allEvents = await db`
        SELECT id, title, "shareableSlug", "isPublic", date
        FROM "Event"
        ORDER BY date DESC
        LIMIT 10
      `
    }

    // Check specific event if ID is provided
    let eventById = null
    if (eventId && tableExists) {
      const result = await db`
        SELECT * FROM "Event" WHERE id = ${eventId}
      `
      eventById = result && result.length > 0 ? result[0] : null
    }

    // Check specific event if slug is provided
    let eventBySlug = null
    if (slug && tableExists) {
      const result = await db`
        SELECT * FROM "Event" WHERE "shareableSlug" = ${slug}
      `
      eventBySlug = result && result.length > 0 ? result[0] : null
    }

    // Check if EventRegistration table exists
    const regTableCheck = await db`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'EventRegistration'
      ) as exists
    `
    const regTableExists = regTableCheck && regTableCheck.length > 0 && regTableCheck[0].exists

    // Get registration columns if table exists
    let registrationColumns = []
    if (regTableExists) {
      registrationColumns = await db`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'EventRegistration'
      `
    }

    // Check API routes
    const apiRoutes = [
      { path: "/api/test", description: "Simple test endpoint" },
      { path: "/api/events/register", description: "Event registration endpoint" },
      { path: "/api/events/register-new", description: "Alternative event registration endpoint" },
      { path: "/api/debug/event-diagnosis", description: "This diagnostic endpoint" },
    ]

    return NextResponse.json({
      success: true,
      diagnostics: {
        database: {
          connected: dbConnected,
          connectionTime: connectionTest?.[0]?.time || null,
        },
        tables: {
          eventTableExists: tableExists,
          registrationTableExists: regTableExists,
          registrationColumns: registrationColumns,
        },
        events: {
          count: allEvents.length,
          list: allEvents,
          eventById: eventById,
          eventBySlug: eventBySlug,
        },
        api: {
          routes: apiRoutes,
          testUrl: "/api/test",
        },
        request: {
          url: request.url,
          method: request.method,
          eventId: eventId,
          slug: slug,
        },
      },
    })
  } catch (error) {
    console.error("Error in event diagnosis:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : null,
      },
      { status: 500 },
    )
  }
}
