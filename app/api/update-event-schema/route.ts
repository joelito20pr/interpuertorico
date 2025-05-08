import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    console.log("Starting Event table schema update...")

    // Check if shareableSlug column exists
    const checkShareableSlug = await db`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Event' 
      AND column_name = 'shareableSlug'
    `

    if (checkShareableSlug.length === 0) {
      console.log("Adding shareableSlug column to Event table...")
      await db`
        ALTER TABLE "Event" 
        ADD COLUMN "shareableSlug" TEXT UNIQUE
      `
      console.log("shareableSlug column added successfully")
    } else {
      console.log("shareableSlug column already exists")
    }

    // Check if maxAttendees column exists
    const checkMaxAttendees = await db`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Event' 
      AND column_name = 'maxAttendees'
    `

    if (checkMaxAttendees.length === 0) {
      console.log("Adding maxAttendees column to Event table...")
      await db`
        ALTER TABLE "Event" 
        ADD COLUMN "maxAttendees" INTEGER
      `
      console.log("maxAttendees column added successfully")
    } else {
      console.log("maxAttendees column already exists")
    }

    // Check if EventRegistration table exists
    const checkEventRegistration = await db`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'EventRegistration'
    `

    if (checkEventRegistration.length === 0) {
      console.log("Creating EventRegistration table...")
      await db`
        CREATE TABLE IF NOT EXISTS "EventRegistration" (
          id TEXT PRIMARY KEY,
          "eventId" TEXT NOT NULL REFERENCES "Event"(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          "guardianName" TEXT,
          email TEXT NOT NULL,
          phone TEXT,
          "numberOfAttendees" INTEGER DEFAULT 1,
          "paymentStatus" TEXT DEFAULT 'PENDING',
          "paymentReference" TEXT,
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `

      // Add guardianName column if it doesn't exist
      try {
        await db`
          ALTER TABLE "EventRegistration" 
          ADD COLUMN IF NOT EXISTS "guardianName" TEXT
        `
      } catch (error) {
        console.error("Error adding guardianName column:", error)
      }
      console.log("EventRegistration table created successfully")
    } else {
      console.log("EventRegistration table already exists")
    }

    return NextResponse.json({
      success: true,
      message: "Event schema updated successfully",
    })
  } catch (error) {
    console.error("Error updating Event schema:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error updating Event schema",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
