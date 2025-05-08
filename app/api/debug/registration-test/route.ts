import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Check if EventRegistration table exists
    const tables = await db`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'EventRegistration'
    `

    const tableExists = tables.length > 0

    // If table exists, check its structure
    let columns = []
    if (tableExists) {
      columns = await db`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'EventRegistration'
        ORDER BY ordinal_position
      `
    }

    // Check if Event table exists and its structure
    const eventTables = await db`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'Event'
    `

    const eventTableExists = eventTables.length > 0

    // If Event table exists, check its structure
    let eventColumns = []
    if (eventTableExists) {
      eventColumns = await db`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'Event'
        ORDER BY ordinal_position
      `
    }

    // Test environment variables
    const envVars = {
      FREE_EMAIL_SERVICE: !!process.env.FREE_EMAIL_SERVICE,
      FREE_EMAIL_USER: !!process.env.FREE_EMAIL_USER,
      FREE_EMAIL_PASS: !!process.env.FREE_EMAIL_PASS,
      FREE_EMAIL_FROM: !!process.env.FREE_EMAIL_FROM,
      ENABLE_WHATSAPP_LINKS: process.env.ENABLE_WHATSAPP_LINKS,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    }

    // Test event data
    const publicEvents = await db`
      SELECT id, title, "shareableSlug", "maxAttendees"
      FROM "Event"
      WHERE "isPublic" = true
      LIMIT 5
    `.catch((e) => {
      return { error: e.message }
    })

    return NextResponse.json({
      status: "success",
      eventRegistration: {
        tableExists,
        columns,
      },
      event: {
        tableExists: eventTableExists,
        columns: eventColumns,
      },
      environmentVariables: envVars,
      publicEvents,
    })
  } catch (error) {
    console.error("Registration test error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to perform registration test",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
