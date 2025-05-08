import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { generateSlug } from "@/lib/utils"
import { withCors } from "@/lib/api-utils"

export async function GET() {
  try {
    // Check if the Event table exists
    const tableExists = await db`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'Event'
      ) as exists
    `

    if (!tableExists || !tableExists[0]?.exists) {
      return withCors(
        NextResponse.json(
          {
            success: false,
            message: "Event table does not exist",
            recommendation: "Visit /api/repair-database to create the necessary tables",
          },
          { status: 500 },
        ),
      )
    }

    // Check if the shareableSlug column exists
    const columnExists = await db`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'Event' AND column_name = 'shareableSlug'
      ) as exists
    `

    if (!columnExists || !columnExists[0]?.exists) {
      return withCors(
        NextResponse.json(
          {
            success: false,
            message: "shareableSlug column does not exist in Event table",
            recommendation: "Visit /api/update-event-schema to add the shareableSlug column",
          },
          { status: 500 },
        ),
      )
    }

    // Get all events
    const events = await db`
      SELECT id, title FROM "Event"
    `

    if (!events || events.length === 0) {
      return withCors(
        NextResponse.json({
          success: true,
          message: "No events found to update",
        }),
      )
    }

    // Update each event with a new slug
    const updatedEvents = []
    for (const event of events) {
      const slug = generateSlug(event.title)
      const updated = await db`
        UPDATE "Event"
        SET "shareableSlug" = ${slug}, "isPublic" = true
        WHERE id = ${event.id}
        RETURNING id, title, "shareableSlug"
      `
      updatedEvents.push(updated[0])
    }

    return withCors(
      NextResponse.json({
        success: true,
        message: `Updated slugs for ${updatedEvents.length} events`,
        events: updatedEvents,
      }),
    )
  } catch (error) {
    console.error("Error regenerating slugs:", error)
    return withCors(
      NextResponse.json(
        {
          success: false,
          message: "Error regenerating slugs",
          error: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      ),
    )
  }
}
