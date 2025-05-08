import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { addCorsHeaders, handleCors } from "@/lib/api-utils"

export async function GET(request: Request) {
  // Handle CORS preflight
  const corsResponse = handleCors(request as any)
  if (corsResponse) return corsResponse

  try {
    const results = {
      success: true,
      databaseConnected: false,
      tables: {} as Record<string, { exists: boolean; columns: string[] }>,
      issues: [] as string[],
      recommendations: [] as string[],
    }

    // Test basic database connectivity
    try {
      await db`SELECT 1 as test`
      results.databaseConnected = true
    } catch (error) {
      results.issues.push("Database connection failed")
      results.success = false
      return addCorsHeaders(NextResponse.json(results, { status: 500 }))
    }

    // Check Event table
    try {
      const eventTableCheck = await db`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'Event'
        ) as exists
      `
      const eventTableExists = eventTableCheck[0]?.exists || false
      results.tables["Event"] = { exists: eventTableExists, columns: [] }

      if (eventTableExists) {
        // Check columns
        const columns = await db`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'Event'
        `
        results.tables["Event"].columns = columns.map((col) => col.column_name)

        // Check for required columns
        const requiredColumns = ["id", "title", "date", "location", "shareableSlug"]
        for (const col of requiredColumns) {
          if (!results.tables["Event"].columns.includes(col)) {
            results.issues.push(`Event table is missing required column: ${col}`)
            results.recommendations.push(`Run /api/repair-database to fix schema issues`)
          }
        }
      } else {
        results.issues.push("Event table does not exist")
        results.recommendations.push("Run /api/repair-database to create required tables")
      }
    } catch (error) {
      results.issues.push(`Error checking Event table: ${error instanceof Error ? error.message : String(error)}`)
    }

    // Check EventRegistration table
    try {
      const regTableCheck = await db`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'EventRegistration'
        ) as exists
      `
      const regTableExists = regTableCheck[0]?.exists || false
      results.tables["EventRegistration"] = { exists: regTableExists, columns: [] }

      if (regTableExists) {
        // Check columns
        const columns = await db`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'EventRegistration'
        `
        results.tables["EventRegistration"].columns = columns.map((col) => col.column_name)
      } else {
        results.issues.push("EventRegistration table does not exist")
        results.recommendations.push("Run /api/repair-database to create required tables")
      }
    } catch (error) {
      results.issues.push(
        `Error checking EventRegistration table: ${error instanceof Error ? error.message : String(error)}`,
      )
    }

    // Check if there are any events
    if (results.tables["Event"]?.exists) {
      try {
        const eventCount = await db`SELECT COUNT(*) as count FROM "Event"`
        const count = Number.parseInt(eventCount[0]?.count || "0")

        if (count === 0) {
          results.issues.push("No events found in the database")
          results.recommendations.push("Create an event in the dashboard or run /api/debug/create-sample-event")
        }
      } catch (error) {
        results.issues.push(`Error counting events: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    return addCorsHeaders(NextResponse.json(results))
  } catch (error) {
    console.error("Error checking schema:", error)
    return addCorsHeaders(
      NextResponse.json(
        {
          success: false,
          error: "Error checking schema",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      ),
    )
  }
}
