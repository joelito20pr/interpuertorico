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
      actions: [] as string[],
      errors: [] as string[],
    }

    // Create Event table if it doesn't exist
    try {
      await db`
        CREATE TABLE IF NOT EXISTS "Event" (
          "id" SERIAL PRIMARY KEY,
          "title" TEXT NOT NULL,
          "description" TEXT,
          "date" TIMESTAMP WITH TIME ZONE NOT NULL,
          "location" TEXT NOT NULL,
          "maxParticipants" INTEGER,
          "shareableSlug" TEXT UNIQUE,
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `
      results.actions.push("Event table created or verified")
    } catch (error) {
      results.errors.push(`Error creating Event table: ${error instanceof Error ? error.message : String(error)}`)
      results.success = false
    }

    // Create EventRegistration table if it doesn't exist
    try {
      await db`
        CREATE TABLE IF NOT EXISTS "EventRegistration" (
          "id" SERIAL PRIMARY KEY,
          "eventId" INTEGER NOT NULL,
          "name" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "phone" TEXT,
          "status" TEXT DEFAULT 'pending',
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE
        )
      `
      results.actions.push("EventRegistration table created or verified")
    } catch (error) {
      results.errors.push(
        `Error creating EventRegistration table: ${error instanceof Error ? error.message : String(error)}`,
      )
      results.success = false
    }

    // Check if shareableSlug column exists in Event table
    try {
      const columnCheck = await db`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'Event' AND column_name = 'shareableSlug'
        ) as exists
      `

      if (!columnCheck[0]?.exists) {
        await db`ALTER TABLE "Event" ADD COLUMN "shareableSlug" TEXT UNIQUE`
        results.actions.push("Added shareableSlug column to Event table")
      }
    } catch (error) {
      results.errors.push(
        `Error checking/adding shareableSlug column: ${error instanceof Error ? error.message : String(error)}`,
      )
    }

    // Check if there are events without slugs and generate them
    try {
      const eventsWithoutSlugs = await db`
        SELECT * FROM "Event" 
        WHERE "shareableSlug" IS NULL OR "shareableSlug" = ''
      `

      if (eventsWithoutSlugs.length > 0) {
        for (const event of eventsWithoutSlugs) {
          try {
            // Generate a slug based on the title and ID
            const baseSlug = event.title
              .toLowerCase()
              .replace(/[^\w\s]/gi, "")
              .replace(/\s+/g, "-")

            const slug = `${baseSlug}-${event.id}`

            await db`
              UPDATE "Event" 
              SET "shareableSlug" = ${slug} 
              WHERE "id" = ${event.id}
            `

            results.actions.push(`Generated slug for event ID ${event.id}: ${slug}`)
          } catch (slugError) {
            results.errors.push(
              `Error generating slug for event ID ${event.id}: ${slugError instanceof Error ? slugError.message : String(slugError)}`,
            )
          }
        }
      }
    } catch (error) {
      results.errors.push(`Error fixing event slugs: ${error instanceof Error ? error.message : String(error)}`)
    }

    return addCorsHeaders(NextResponse.json(results))
  } catch (error) {
    console.error("Error repairing database:", error)
    return addCorsHeaders(
      NextResponse.json(
        {
          success: false,
          error: "Error repairing database",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      ),
    )
  }
}
