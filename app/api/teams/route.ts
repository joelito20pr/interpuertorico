import { NextResponse } from "next/server"
import { db, testDatabaseConnection } from "@/lib/db"

export async function GET() {
  try {
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

    // Get all teams
    const teams = await db`
      SELECT * FROM "Team"
      ORDER BY "createdAt" DESC
    `

    return NextResponse.json({
      success: true,
      data: teams || [],
    })
  } catch (error) {
    console.error("Error getting teams:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error loading teams",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
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

    // Parse the request body
    const teamData = await request.json()

    // Validate required fields
    if (!teamData.name || !teamData.category) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 },
      )
    }

    // Create the team
    const id = `team_${Date.now()}`
    const result = await db`
      INSERT INTO "Team" (id, name, category, description, "createdAt", "updatedAt")
      VALUES (${id}, ${teamData.name}, ${teamData.category}, ${teamData.description || null}, NOW(), NOW())
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      data: result[0],
    })
  } catch (error) {
    console.error("Error creating team:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error creating team",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
