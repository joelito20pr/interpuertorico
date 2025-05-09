import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { corsHeaders } from "@/lib/api-utils"

// Add OPTIONS method for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    console.log(`Attempting to delete event with ID: ${id}`)

    // First check if the event exists
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

    // Check if there are registrations for this event
    const registrationsCheck = await db`
      SELECT EXISTS (
        SELECT 1 FROM "EventRegistration" WHERE "eventId" = ${id}
      ) as has_registrations
    `

    const hasRegistrations = registrationsCheck[0]?.has_registrations

    // If there are registrations, delete them first
    if (hasRegistrations) {
      console.log(`Deleting registrations for event ${id}`)
      try {
        await db`DELETE FROM "EventRegistration" WHERE "eventId" = ${id}`
      } catch (regError) {
        console.error(`Error deleting registrations for event ${id}:`, regError)
        return NextResponse.json(
          {
            success: false,
            error: "Error deleting event registrations",
            details: regError instanceof Error ? regError.message : String(regError),
          },
          { status: 500, headers: corsHeaders },
        )
      }
    }

    // Check if there are notifications for this event
    try {
      const notificationsCheck = await db`
        SELECT EXISTS (
          SELECT 1 FROM "Notification" WHERE "eventId" = ${id}
        ) as has_notifications
      `

      const hasNotifications = notificationsCheck[0]?.has_notifications

      // If there are notifications, delete them
      if (hasNotifications) {
        console.log(`Deleting notifications for event ${id}`)
        await db`DELETE FROM "Notification" WHERE "eventId" = ${id}`
      }
    } catch (notifError) {
      // Just log the error but continue with event deletion
      console.error(`Error checking/deleting notifications for event ${id}:`, notifError)
    }

    // Now delete the event
    console.log(`Deleting event ${id}`)
    try {
      await db`DELETE FROM "Event" WHERE id = ${id}`
    } catch (eventError) {
      console.error(`Error deleting event ${id}:`, eventError)
      return NextResponse.json(
        {
          success: false,
          error: "Error deleting event",
          details: eventError instanceof Error ? eventError.message : String(eventError),
        },
        { status: 500, headers: corsHeaders },
      )
    }

    console.log(`Successfully deleted event with ID: ${id}`)
    return NextResponse.json(
      {
        success: true,
        message: "Event and all related data deleted successfully",
      },
      { headers: corsHeaders },
    )
  } catch (error) {
    console.error("Error in DELETE event:", error)
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

    // Get the event
    const result = await db`
      SELECT * FROM "Event" WHERE id = ${id}
    `

    if (!result || result.length === 0) {
      console.error(`Event with ID ${id} not found`)
      return NextResponse.json(
        {
          success: false,
          error: "Event not found",
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
          "isPublic" = ${eventData.isPublic !== undefined ? eventData.isPublic : true},
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
