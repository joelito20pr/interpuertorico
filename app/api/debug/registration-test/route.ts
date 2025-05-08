import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Check if EventRegistration table exists
    const tableCheck = await db`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'EventRegistration'
      ) as exists
    `

    const tableExists = tableCheck[0]?.exists || false

    // Get table structure
    let tableStructure = null
    if (tableExists) {
      tableStructure = await db`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'EventRegistration'
        ORDER BY ordinal_position
      `
    }

    // Test a dummy insert (but rollback)
    let insertTest = { success: false, error: null }

    if (tableExists) {
      try {
        // Start transaction
        await db`BEGIN`

        // Test insert
        const testResult = await db`
          INSERT INTO "EventRegistration" (
            id, name, email, "eventId", "numberOfAttendees", "paymentStatus", "createdAt"
          ) VALUES (
            'test_reg_id', 'Test Name', 'test@example.com', 'test_event_id', 1, 'TEST', NOW()
          )
          RETURNING id
        `

        // Rollback - we don't want to actually insert this test data
        await db`ROLLBACK`

        insertTest = { success: true, result: testResult }
      } catch (error) {
        // Ensure rollback
        await db`ROLLBACK`

        insertTest = {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        }
      }
    }

    // Test event existence
    const eventCheck = await db`
      SELECT id, title, "isPublic", "shareableSlug"
      FROM "Event"
      LIMIT 5
    `

    return NextResponse.json({
      success: true,
      tableExists,
      tableStructure,
      insertTest,
      sampleEvents: eventCheck,
      env: {
        hasDbUrl: !!process.env.DATABASE_URL,
        hasEmailConfig: !!(
          process.env.FREE_EMAIL_SERVICE &&
          process.env.FREE_EMAIL_USER &&
          process.env.FREE_EMAIL_PASS
        ),
        baseUrl: process.env.NEXT_PUBLIC_APP_URL || "not set",
      },
    })
  } catch (error) {
    console.error("Error in registration test:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error testing registration",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
