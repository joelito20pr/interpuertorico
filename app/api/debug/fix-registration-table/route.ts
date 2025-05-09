import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    console.log("Checking EventRegistration table structure...")

    // Check if the table exists
    const tableExists = await db`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'EventRegistration'
      ) as exists
    `

    if (!tableExists[0].exists) {
      console.log("EventRegistration table does not exist, creating it...")

      // Create the table
      await db`
        CREATE TABLE "EventRegistration" (
          id TEXT PRIMARY KEY,
          "eventId" TEXT NOT NULL,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT,
          "guardianName" TEXT,
          "numberOfAttendees" INTEGER DEFAULT 1,
          "paymentStatus" TEXT DEFAULT 'PENDING',
          "paymentReference" TEXT,
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          "confirmationStatus" TEXT DEFAULT 'PENDING'
        )
      `

      return NextResponse.json({
        success: true,
        message: "EventRegistration table created successfully",
        action: "created",
      })
    }

    // Table exists, check columns
    console.log("EventRegistration table exists, checking columns...")

    // Get existing columns
    const columns = await db`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'EventRegistration'
    `

    const columnNames = columns.map((col) => col.column_name)
    console.log("Existing columns:", columnNames)

    // Check for missing columns and add them
    const requiredColumns = [
      { name: "id", type: "TEXT", default: null },
      { name: "eventId", type: "TEXT", default: null },
      { name: "name", type: "TEXT", default: null },
      { name: "email", type: "TEXT", default: null },
      { name: "phone", type: "TEXT", default: null },
      { name: "guardianName", type: "TEXT", default: null },
      { name: "numberOfAttendees", type: "INTEGER", default: "1" },
      { name: "paymentStatus", type: "TEXT", default: "'PENDING'" },
      { name: "paymentReference", type: "TEXT", default: null },
      { name: "createdAt", type: "TIMESTAMP WITH TIME ZONE", default: "NOW()" },
      { name: "updatedAt", type: "TIMESTAMP WITH TIME ZONE", default: "NOW()" },
      { name: "confirmationStatus", type: "TEXT", default: "'PENDING'" },
    ]

    const missingColumns = []
    const addedColumns = []

    for (const col of requiredColumns) {
      if (!columnNames.includes(col.name)) {
        console.log(`Adding missing column: ${col.name}`)

        let defaultClause = ""
        if (col.default !== null) {
          defaultClause = ` DEFAULT ${col.default}`
        }

        await db.query(`ALTER TABLE "EventRegistration" ADD COLUMN "${col.name}" ${col.type}${defaultClause}`)

        addedColumns.push(col.name)
        missingColumns.push(col)
      }
    }

    // Check if registrationDate column exists and needs to be migrated
    if (columnNames.includes("registrationDate") && !columnNames.includes("createdAt")) {
      console.log("Migrating data from registrationDate to createdAt...")

      // Add createdAt column if it doesn't exist
      if (!columnNames.includes("createdAt")) {
        await db.query(`ALTER TABLE "EventRegistration" ADD COLUMN "createdAt" TIMESTAMP WITH TIME ZONE`)
        addedColumns.push("createdAt")
      }

      // Copy data from registrationDate to createdAt
      await db.query(`UPDATE "EventRegistration" SET "createdAt" = "registrationDate"`)

      // Drop registrationDate column
      await db.query(`ALTER TABLE "EventRegistration" DROP COLUMN "registrationDate"`)
    }

    return NextResponse.json({
      success: true,
      message:
        addedColumns.length > 0
          ? `Added ${addedColumns.length} missing columns to EventRegistration table`
          : "EventRegistration table structure is correct",
      existingColumns: columnNames,
      addedColumns: addedColumns,
      missingColumns: missingColumns,
    })
  } catch (error) {
    console.error("Error fixing EventRegistration table:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error fixing EventRegistration table",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
