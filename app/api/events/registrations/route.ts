import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    // Get all registrations with event details
    const registrations = await db`
      SELECT 
        er.id, 
        er."eventId", 
        er.name, 
        er.email, 
        er.phone, 
        er."createdAt",
        e.title as "eventTitle",
        e.date as "eventDate"
      FROM "EventRegistration" er
      JOIN "Event" e ON er."eventId" = e.id
      ORDER BY er."createdAt" DESC
    `

    return NextResponse.json({
      success: true,
      data: registrations,
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
