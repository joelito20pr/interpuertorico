import { NextResponse } from "next/server"
import { testDatabaseConnection } from "@/lib/db"
import { addCorsHeaders } from "@/lib/api-utils"

export async function GET() {
  try {
    const result = await testDatabaseConnection()

    return addCorsHeaders(NextResponse.json(result))
  } catch (error) {
    console.error("Error testing database connection:", error)
    return addCorsHeaders(
      NextResponse.json(
        {
          success: false,
          error: "Error testing database connection",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      ),
    )
  }
}
