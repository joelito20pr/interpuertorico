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

    // Initialize default values
    let eventCount = 0
    let teamCount = 0
    let memberCount = 0
    let sponsorCount = 0
    let totalAmount = 0
    let recentSponsors = []
    let upcomingEvents = []

    // Get statistics with individual try/catch blocks for better error isolation
    try {
      // Get event count
      const eventCountResult = await db`SELECT COUNT(*) as count FROM "Event"`
      eventCount = Number.parseInt(eventCountResult?.[0]?.count || "0")
      console.log("Event count:", eventCount)
    } catch (error) {
      console.error("Error getting event count:", error)
    }

    try {
      // Get team count
      const teamCountResult = await db`SELECT COUNT(*) as count FROM "Team"`
      teamCount = Number.parseInt(teamCountResult?.[0]?.count || "0")
      console.log("Team count:", teamCount)
    } catch (error) {
      console.error("Error getting team count:", error)
    }

    try {
      // Get member count
      const memberCountResult = await db`SELECT COUNT(*) as count FROM "Member"`
      memberCount = Number.parseInt(memberCountResult?.[0]?.count || "0")
      console.log("Member count:", memberCount)
    } catch (error) {
      console.error("Error getting member count:", error)
    }

    try {
      // Get sponsor count and total amount
      const sponsorResult = await db`
        SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total 
        FROM "Sponsor" 
        WHERE "paymentStatus" = 'PAID'
      `
      sponsorCount = Number.parseInt(sponsorResult?.[0]?.count || "0")
      totalAmount = Number.parseFloat(sponsorResult?.[0]?.total || "0")
      console.log("Sponsor count:", sponsorCount, "Total amount:", totalAmount)
    } catch (error) {
      console.error("Error getting sponsor data:", error)
    }

    try {
      // Get recent sponsors
      recentSponsors = await db`
        SELECT id, name, amount, "paymentDate", tier
        FROM "Sponsor"
        WHERE "paymentStatus" = 'PAID'
        ORDER BY "paymentDate" DESC
        LIMIT 5
      `
      console.log("Recent sponsors count:", recentSponsors?.length || 0)
    } catch (error) {
      console.error("Error getting recent sponsors:", error)
    }

    try {
      // Get upcoming events
      upcomingEvents = await db`
        SELECT id, title, date, location
        FROM "Event"
        WHERE date > NOW()
        ORDER BY date ASC
        LIMIT 3
      `
      console.log("Upcoming events count:", upcomingEvents?.length || 0)
    } catch (error) {
      console.error("Error getting upcoming events:", error)
    }

    return NextResponse.json({
      success: true,
      data: {
        eventCount,
        teamCount,
        memberCount,
        sponsorCount,
        totalAmount,
        recentSponsors: recentSponsors || [],
        upcomingEvents: upcomingEvents || [],
        goalAmount: 5000, // Fixed goal for now
      },
    })
  } catch (error) {
    console.error("Error in dashboard API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error loading dashboard data",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
