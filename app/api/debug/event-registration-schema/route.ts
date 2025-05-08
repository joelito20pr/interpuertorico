import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Check table structure
    const tableInfo = await db`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'EventRegistration'
      ORDER BY ordinal_position
    `

    // Check if the table exists
    const tableExists = tableInfo.length > 0

    // Get a sample row if available
    let sampleRow = []
    if (tableExists) {
      sampleRow = await db`
        SELECT * FROM "EventRegistration" LIMIT 1
      `
    }

    return NextResponse.json({
      success: true,
      tableExists,
      columns: tableInfo,
      sampleRow: sampleRow.length > 0 ? sampleRow[0] : null,
    })
  } catch (error) {
    console.error("Error checking EventRegistration schema:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error checking EventRegistration schema",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
