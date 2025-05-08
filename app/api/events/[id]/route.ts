import { NextResponse } from "next/server"
import { db, testDatabaseConnection } from "@/lib/db"
import { corsHeaders } from "@/lib/api-utils"

// Add OPTIONS method for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    console.log(`Attempting to delete event with ID: ${id}`)

    // First test the database connection
    const connectionTest = await testDatabaseConnection()
    if (!connectionTest.success) {
      console.error("Database connection failed:", connectionTest.error)
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
          details: connectionTest.error,
        },
        { status: 500, headers: corsHeaders },
      )
    }

    // Check if the event exists before deleting
    const eventCheck = await db`SELECT id FROM "Event" WHERE id = ${id}`
    if (!eventCheck || eventCheck.length === 0) {
      console.error(`Event with ID ${id} not found`)
      return NextResponse.json(
        {
          success: false,
          error: "Event not found",
        },
        { status: 404, headers: corsHeaders },
      )
    }

    // Delete the event
    await db`DELETE FROM "Event" WHERE id = ${id}`
    console.log(`Successfully deleted event with ID: ${id}`)

    return NextResponse.json(
      {
        success: true,
        message: "Event deleted successfully",
      },
      { headers: corsHeaders },
    )
  } catch (error) {
    console.error("Error deleting event:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error deleting event",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: corsHeaders },
    )
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    console.log(`Attempting to get event with ID: ${id}`)

    // First test the database connection
    const connectionTest = await testDatabaseConnection()
    if (!connectionTest.success) {
      console.error("Database connection failed:", connectionTest.error)
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
          details: connectionTest.error,
          recommendation: "Check your database connection string and make sure the database is running",
        },
        { status: 500, headers: corsHeaders },
      )
    }

    // Check if Event table exists
    const tableCheck = await db`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'Event'
      ) as exists
    `

    if (!tableCheck[0]?.exists) {
      console.error("Event table does not exist")
      return NextResponse.json(
        {
          success: false,
          error: "Event table does not exist",
          recommendation: "Run /api/repair-database to create required tables",
        },
        { status: 404, headers: corsHeaders },
      )
    }

    // Get the event with better error handling
    try {
      // Log the query we're about to execute for debugging
      console.log(`Executing query: SELECT * FROM "Event" WHERE id = ${id}`)

      const result = await db`
        SELECT * FROM "Event" WHERE id = ${id}
      `

      console.log(`Query result:`, result)

      if (!result || result.length === 0) {
        // If not found, list all available events to help debugging
        const allEvents = await db`SELECT id, title FROM "Event" LIMIT 10`

        console.error(`Event with ID ${id} not found. Available events:`, allEvents)

        return NextResponse.json(
          {
            success: false,
            error: "Event not found",
            message: `No event found with ID: ${id}`,
            availableEvents: allEvents.length > 0 ? allEvents : "No events in database",
            recommendation: "Check the event ID or create a new event",
          },
          { status: 404, headers: corsHeaders },
        )
      }

      console.log(`Successfully retrieved event with ID: ${id}`)
      return NextResponse.json(
        {
          success: true,
          data: result[0],
        },
        { headers: corsHeaders },
      )
    } catch (queryError) {
      console.error("Database query error:", queryError)
      return NextResponse.json(
        {
          success: false,
          error: "Database query error",
          details: queryError instanceof Error ? queryError.message : String(queryError),
        },
        { status: 500, headers: corsHeaders },
      )
    }
  } catch (error) {
    console.error("Error getting event:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error getting event",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: corsHeaders },
    )
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    console.log(`Attempting to update event with ID: ${id}`)

    // First test the database connection
    const connectionTest = await testDatabaseConnection()
    if (!connectionTest.success) {
      console.error("Database connection failed:", connectionTest.error)
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
          details: connectionTest.error,
        },
        { status: 500, headers: corsHeaders },
      )
    }

    // Check if the event exists before updating
    const eventCheck = await db`SELECT id FROM "Event" WHERE id = ${id}`
    if (!eventCheck || eventCheck.length === 0) {
      console.error(`Event with ID ${id} not found`)
      return NextResponse.json(
        {
          success: false,
          error: "Event not found",
        },
        { status: 404, headers: corsHeaders },
      )
    }

    // Parse the request body
    const eventData = await request.json()

    // Validate required fields
    if (!eventData.title || !eventData.date || !eventData.location) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400, headers: corsHeaders },
      )
    }

    // Log the data being sent to the database for debugging
    console.log("Updating event with data:", JSON.stringify(eventData, null, 2))

    // Update the event with better error handling
    try {
      const result = await db`
        UPDATE "Event"
        SET 
          title = ${eventData.title},
          description = ${eventData.description || null},
          date = ${new Date(eventData.date)},
          location = ${eventData.location},
          "requiresPayment" = ${eventData.requiresPayment || false},
          price = ${eventData.price || null},
          "stripeLink" = ${eventData.stripeLink || null},
          "shareableSlug" = ${eventData.shareableSlug || null},
          "maxAttendees" = ${eventData.maxAttendees || null},
          "updatedAt" = NOW()
        WHERE id = ${id}
        RETURNING *
      `

      if (!result || result.length === 0) {
        console.error(`Failed to update event with ID ${id}`)
        return NextResponse.json(
          {
            success: false,
            error: "Failed to update event",
          },
          { status: 500, headers: corsHeaders },
        )
      }

      console.log(`Successfully updated event with ID: ${id}`)
      return NextResponse.json(
        {
          success: true,
          data: result[0],
        },
        { headers: corsHeaders },
      )
    } catch (dbError) {
      console.error("Database error updating event:", dbError)
      return NextResponse.json(
        {
          success: false,
          error: "Database error updating event",
          details: dbError instanceof Error ? dbError.message : String(dbError),
        },
        { status: 500, headers: corsHeaders },
      )
    }
  } catch (error) {
    console.error("Error updating event:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error updating event",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: corsHeaders },
    )
  }
}
