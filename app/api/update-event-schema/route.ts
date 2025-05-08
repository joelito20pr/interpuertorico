import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    console.log("Starting Event table schema update...")

    // First check if Event table exists
    const checkEventTable = await db`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'Event'
    `

    if (checkEventTable.length === 0) {
      console.log("Event table does not exist, creating it...")
      await db`
        CREATE TABLE IF NOT EXISTS "Event" (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          date TIMESTAMP WITH TIME ZONE NOT NULL,
          location TEXT NOT NULL,
          "requiresPayment" BOOLEAN DEFAULT false,
          price TEXT,
          "stripeLink" TEXT,
          "isPublic" BOOLEAN DEFAULT false,
          "shareableSlug" TEXT UNIQUE,
          "maxAttendees" INTEGER,
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `
      console.log("Event table created successfully")
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
          "eventId" TEXT NOT NULL,
          name TEXT NOT NULL,
          "guardianName" TEXT,
          email TEXT NOT NULL,
          phone TEXT,
          "numberOfAttendees" INTEGER DEFAULT 1,
          "paymentStatus" TEXT DEFAULT 'PENDING',
          "paymentReference" TEXT,
          "confirmationStatus" TEXT DEFAULT 'PENDING',
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          CONSTRAINT fk_event
            FOREIGN KEY("eventId")
            REFERENCES "Event"(id)
            ON DELETE CASCADE
        )
      `
      console.log("EventRegistration table created successfully")
    } else {
      console.log("EventRegistration table already exists")

      // Check if guardianName column exists
      const checkGuardianName = await db`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'EventRegistration' 
        AND column_name = 'guardianName'
      `

      if (checkGuardianName.length === 0) {
        console.log("Adding guardianName column to EventRegistration table...")
        await db`
          ALTER TABLE "EventRegistration" 
          ADD COLUMN "guardianName" TEXT
        `
        console.log("guardianName column added successfully")
      } else {
        console.log("guardianName column already exists")
      }

      // Check if confirmationStatus column exists
      const checkConfirmationStatus = await db`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'EventRegistration' 
        AND column_name = 'confirmationStatus'
      `

      if (checkConfirmationStatus.length === 0) {
        console.log("Adding confirmationStatus column to EventRegistration table...")
        await db`
          ALTER TABLE "EventRegistration" 
          ADD COLUMN "confirmationStatus" TEXT DEFAULT 'PENDING'
        `
        console.log("confirmationStatus column added successfully")
      } else {
        console.log("confirmationStatus column already exists")
      }
    }

    // Check if shareableSlug column exists in Event table
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

    // Check if maxAttendees column exists in Event table
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

    // Check if isPublic column exists in Event table
    const checkIsPublic = await db`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Event' 
      AND column_name = 'isPublic'
    `

    if (checkIsPublic.length === 0) {
      console.log("Adding isPublic column to Event table...")
      await db`
        ALTER TABLE "Event" 
        ADD COLUMN "isPublic" BOOLEAN DEFAULT false
      `
      console.log("isPublic column added successfully")
    } else {
      console.log("isPublic column already exists")
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
