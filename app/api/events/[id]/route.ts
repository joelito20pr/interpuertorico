import { NextResponse } from "next/server"
import { db, testDatabaseConnection } from "@/lib/db"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // First test the database connection
    const connectionTest = await testDatabaseConnection()
    if (!connectionTest.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
          details: connectionTest.error,
        },
        { status: 500 },
      )
    }

    // Delete the event
    await db`DELETE FROM "Event" WHERE id = ${id}`

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting event:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error deleting event",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // First test the database connection
    const connectionTest = await testDatabaseConnection()
    if (!connectionTest.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
          details: connectionTest.error,
        },
        { status: 500 },
      )
    }

    // Get the event
    const result = await db`
      SELECT * FROM "Event" WHERE id = ${id}
    `

    if (!result || result.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Event not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: result[0],
    })
  } catch (error) {
    console.error("Error getting event:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error getting event",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
