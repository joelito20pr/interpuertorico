import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const eventId = params.id

    // Get registrations for a specific event
    const registrations = await db`
      SELECT 
        er.id, 
        er."eventId", 
        er.name, 
        er.email, 
        er.phone, 
        er."createdAt"
      FROM "EventRegistration" er
      WHERE er."eventId" = ${eventId}
      ORDER BY er."createdAt" DESC
    `

    // Get event details
    const event = await db`
      SELECT 
        id, 
        title, 
        date, 
        location, 
        "maxAttendees", 
        "shareableSlug"
      FROM "Event"
      WHERE id = ${eventId}
    `

    if (event.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Event not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        event: event[0],
        registrations,
        totalRegistrations: registrations.length,
      },
    })
  } catch (error) {
    console.error("Error fetching event registrations:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error fetching event registrations",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
