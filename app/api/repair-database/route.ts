import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const results = {
      success: true,
      operations: [] as { operation: string; success: boolean; message?: string; error?: string }[],
    }

    // Check if Event table exists
    try {
      const eventTableCheck = await db`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'Event'
        ) as exists
      `

      const eventTableExists = eventTableCheck[0]?.exists || false

      if (!eventTableExists) {
        // Create Event table
        await db`
          CREATE TABLE "Event" (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            date TIMESTAMP NOT NULL,
            location TEXT NOT NULL,
            "requiresPayment" BOOLEAN DEFAULT false,
            price TEXT,
            "stripeLink" TEXT,
            "shareableSlug" TEXT,
            "maxAttendees" INTEGER,
            "createdAt" TIMESTAMP DEFAULT NOW(),
            "updatedAt" TIMESTAMP DEFAULT NOW()
          )
        `

        results.operations.push({
          operation: "Create Event table",
          success: true,
          message: "Event table created successfully",
        })
      } else {
        // Check if Event table has required columns
        const columns = await db`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'Event'
        `

        const columnNames = columns.map((col) => col.column_name)

        // Check for shareableSlug column
        if (!columnNames.includes("shareableSlug")) {
          await db`ALTER TABLE "Event" ADD COLUMN "shareableSlug" TEXT`
          results.operations.push({
            operation: "Add shareableSlug column",
            success: true,
            message: "Added shareableSlug column to Event table",
          })
        }

        // Check for maxAttendees column
        if (!columnNames.includes("maxAttendees")) {
          await db`ALTER TABLE "Event" ADD COLUMN "maxAttendees" INTEGER`
          results.operations.push({
            operation: "Add maxAttendees column",
            success: true,
            message: "Added maxAttendees column to Event table",
          })
        }
      }
    } catch (error) {
      console.error("Error checking/creating Event table:", error)
      results.operations.push({
        operation: "Check/Create Event table",
        success: false,
        error: error instanceof Error ? error.message : String(error),
      })
    }

    // Check if EventRegistration table exists
    try {
      const regTableCheck = await db`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'EventRegistration'
        ) as exists
      `

      const regTableExists = regTableCheck[0]?.exists || false

      if (!regTableExists) {
        // Create EventRegistration table
        await db`
          CREATE TABLE "EventRegistration" (
            id TEXT PRIMARY KEY,
            "eventId" TEXT NOT NULL REFERENCES "Event"(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            "guardianName" TEXT,
            "confirmationStatus" TEXT DEFAULT 'PENDING',
            "createdAt" TIMESTAMP DEFAULT NOW(),
            "updatedAt" TIMESTAMP DEFAULT NOW()
          )
        `

        results.operations.push({
          operation: "Create EventRegistration table",
          success: true,
          message: "EventRegistration table created successfully",
        })
      } else {
        // Check if EventRegistration table has required columns
        const columns = await db`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'EventRegistration'
        `

        const columnNames = columns.map((col) => col.column_name)

        // Check for guardianName column
        if (!columnNames.includes("guardianName")) {
          await db`ALTER TABLE "EventRegistration" ADD COLUMN "guardianName" TEXT`
          results.operations.push({
            operation: "Add guardianName column",
            success: true,
            message: "Added guardianName column to EventRegistration table",
          })
        }

        // Check for confirmationStatus column
        if (!columnNames.includes("confirmationStatus")) {
          await db`ALTER TABLE "EventRegistration" ADD COLUMN "confirmationStatus" TEXT DEFAULT 'PENDING'`
          results.operations.push({
            operation: "Add confirmationStatus column",
            success: true,
            message: "Added confirmationStatus column to EventRegistration table",
          })
        }
      }
    } catch (error) {
      console.error("Error checking/creating EventRegistration table:", error)
      results.operations.push({
        operation: "Check/Create EventRegistration table",
        success: false,
        error: error instanceof Error ? error.message : String(error),
      })
    }

    // Check if Notification table exists
    try {
      const notifTableCheck = await db`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'Notification'
        ) as exists
      `

      const notifTableExists = notifTableCheck[0]?.exists || false

      if (!notifTableExists) {
        // Create Notification table
        await db`
          CREATE TABLE "Notification" (
            id TEXT PRIMARY KEY,
            "eventId" TEXT NOT NULL REFERENCES "Event"(id) ON DELETE CASCADE,
            "registrationId" TEXT REFERENCES "EventRegistration"(id) ON DELETE CASCADE,
            type TEXT NOT NULL,
            status TEXT NOT NULL,
            "sentAt" TIMESTAMP DEFAULT NOW(),
            "createdAt" TIMESTAMP DEFAULT NOW(),
            "updatedAt" TIMESTAMP DEFAULT NOW()
          )
        `

        results.operations.push({
          operation: "Create Notification table",
          success: true,
          message: "Notification table created successfully",
        })
      }
    } catch (error) {
      console.error("Error checking/creating Notification table:", error)
      results.operations.push({
        operation: "Check/Create Notification table",
        success: false,
        error: error instanceof Error ? error.message : String(error),
      })
    }

    // Check for events with missing slugs and regenerate them
    try {
      const eventsWithoutSlugs = await db`
        SELECT id, title FROM "Event" 
        WHERE "shareableSlug" IS NULL OR "shareableSlug" = ''
      `

      if (eventsWithoutSlugs.length > 0) {
        let regeneratedCount = 0

        for (const event of eventsWithoutSlugs) {
          // Generate a slug from the title
          const baseSlug = event.title
            .toLowerCase()
            .replace(/[^\w\s]/gi, "")
            .replace(/\s+/g, "-")

          // Add a random suffix to ensure uniqueness
          const randomSuffix = Math.floor(Math.random() * 10000)
          const newSlug = `${baseSlug}-${randomSuffix}`

          await db`
            UPDATE "Event" 
            SET "shareableSlug" = ${newSlug}
            WHERE id = ${event.id}
          `

          regeneratedCount++
        }

        results.operations.push({
          operation: "Regenerate missing slugs",
          success: true,
          message: `Regenerated slugs for ${regeneratedCount} events`,
        })
      }
    } catch (error) {
      console.error("Error regenerating slugs:", error)
      results.operations.push({
        operation: "Regenerate missing slugs",
        success: false,
        error: error instanceof Error ? error.message : String(error),
      })
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("Database repair error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
