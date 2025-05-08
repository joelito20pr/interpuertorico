import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { generateSlug } from "@/lib/utils"

export async function GET() {
  try {
    // Get all events without a shareableSlug or with isPublic=true but no slug
    const eventsToUpdate = await db`
      SELECT id, title FROM "Event"
      WHERE "shareableSlug" IS NULL OR ("isPublic" = true AND "shareableSlug" = '')
    `

    const updatedEvents = []

    // Update each event with a new slug
    for (const event of eventsToUpdate) {
      const newSlug = generateSlug(event.title)

      const result = await db`
        UPDATE "Event"
        SET "shareableSlug" = ${newSlug}
        WHERE id = ${event.id}
        RETURNING id, title, "shareableSlug"
      `

      if (result && result.length > 0) {
        updatedEvents.push(result[0])
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updatedEvents.length} events with new slugs`,
      updatedEvents,
    })
  } catch (error) {
    console.error("Error regenerating event slugs:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error regenerating event slugs",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
