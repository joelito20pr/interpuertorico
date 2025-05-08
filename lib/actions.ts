"use server"

import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { getServerSession as getServerSessionNext } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// Dashboard actions
export async function getDashboardData() {
  try {
    // Verify database connection
    await db`SELECT NOW() as time`

    // Get statistics
    // Get event count
    const eventCountResult = await db`SELECT COUNT(*) as count FROM "Event"`
    const eventCount = Number.parseInt(eventCountResult[0]?.count || "0")

    // Get team count
    const teamCountResult = await db`SELECT COUNT(*) as count FROM "Team"`
    const teamCount = Number.parseInt(teamCountResult[0]?.count || "0")

    // Get member count
    const memberCountResult = await db`SELECT COUNT(*) as count FROM "Member"`
    const memberCount = Number.parseInt(memberCountResult[0]?.count || "0")

    // Get sponsor count and total amount
    const sponsorResult = await db`
      SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total 
      FROM "Sponsor" 
      WHERE "paymentStatus" = 'PAID'
    `
    const sponsorCount = Number.parseInt(sponsorResult[0]?.count || "0")
    const totalAmount = Number.parseFloat(sponsorResult[0]?.total || "0")

    // Get recent sponsors
    const recentSponsors = await db`
      SELECT id, name, amount, "paymentDate", tier
      FROM "Sponsor"
      WHERE "paymentStatus" = 'PAID'
      ORDER BY "paymentDate" DESC
      LIMIT 5
    `

    // Get upcoming events
    const upcomingEvents = await db`
      SELECT id, title, date, location
      FROM "Event"
      WHERE date > NOW()
      ORDER BY date ASC
      LIMIT 3
    `

    return {
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
    }
  } catch (error) {
    console.error("Error getting dashboard data:", error)
    return {
      success: false,
      error: "Error loading dashboard data",
      details: error instanceof Error ? error.message : String(error),
    }
  }
}

// Event actions
export async function getEvents() {
  try {
    const result = await db`
      SELECT * FROM "Event"
      ORDER BY date DESC
    `
    return { success: true, data: result || [] }
  } catch (error) {
    console.error("Error getting events:", error)
    return {
      success: false,
      error: "Error loading events",
      details: error instanceof Error ? error.message : String(error),
    }
  }
}

export async function createEvent(eventData: {
  title: string
  description: string
  date: Date
  location: string
  requiresPayment: boolean
  price: string | null
  stripeLink: string | null
}) {
  try {
    const id = `event_${Date.now()}`
    const result = await db`
      INSERT INTO "Event" (
        id, title, description, date, location, 
        "requiresPayment", price, "stripeLink", "createdAt", "updatedAt"
      ) VALUES (
        ${id}, ${eventData.title}, ${eventData.description}, ${eventData.date}, ${eventData.location},
        ${eventData.requiresPayment}, ${eventData.price}, ${eventData.stripeLink}, NOW(), NOW()
      )
      RETURNING *
    `

    revalidatePath("/dashboard/eventos")
    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error creating event:", error)
    return {
      success: false,
      error: "Error creating event",
      details: error instanceof Error ? error.message : String(error),
    }
  }
}

export async function updateEvent(
  id: string,
  eventData: {
    title: string
    description: string
    date: Date
    location: string
    requiresPayment: boolean
    price: string | null
    stripeLink: string | null
  },
) {
  try {
    const result = await db`
      UPDATE "Event"
      SET 
        title = ${eventData.title},
        description = ${eventData.description},
        date = ${eventData.date},
        location = ${eventData.location},
        "requiresPayment" = ${eventData.requiresPayment},
        price = ${eventData.price},
        "stripeLink" = ${eventData.stripeLink},
        "updatedAt" = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    revalidatePath(`/dashboard/eventos/${id}`)
    revalidatePath("/dashboard/eventos")
    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error updating event:", error)
    return {
      success: false,
      error: "Error updating event",
      details: error instanceof Error ? error.message : String(error),
    }
  }
}

export async function deleteEvent(id: string) {
  try {
    await db`DELETE FROM "Event" WHERE id = ${id}`

    revalidatePath("/dashboard/eventos")
    return { success: true }
  } catch (error) {
    console.error("Error deleting event:", error)
    return {
      success: false,
      error: "Error deleting event",
      details: error instanceof Error ? error.message : String(error),
    }
  }
}

// Team actions
export async function getTeams() {
  try {
    const result = await db`
      SELECT * FROM "Team"
      ORDER BY "createdAt" DESC
    `
    return { success: true, data: result || [] }
  } catch (error) {
    console.error("Error getting teams:", error)
    return {
      success: false,
      error: "Error loading teams",
      details: error instanceof Error ? error.message : String(error),
    }
  }
}

export async function createTeam(teamData: {
  name: string
  category: string
  description: string | null
}) {
  try {
    const id = `team_${Date.now()}`
    const result = await db`
      INSERT INTO "Team" (id, name, category, description, "createdAt", "updatedAt")
      VALUES (${id}, ${teamData.name}, ${teamData.category}, ${teamData.description}, NOW(), NOW())
      RETURNING *
    `

    revalidatePath("/dashboard/equipos")
    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error creating team:", error)
    return {
      success: false,
      error: "Error creating team",
      details: error instanceof Error ? error.message : String(error),
    }
  }
}

export async function updateTeam(
  id: string,
  teamData: {
    name: string
    category: string
    description: string | null
  },
) {
  try {
    const result = await db`
      UPDATE "Team"
      SET 
        name = ${teamData.name},
        category = ${teamData.category},
        description = ${teamData.description},
        "updatedAt" = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    revalidatePath(`/dashboard/equipos/${id}`)
    revalidatePath("/dashboard/equipos")
    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error updating team:", error)
    return {
      success: false,
      error: "Error updating team",
      details: error instanceof Error ? error.message : String(error),
    }
  }
}

export async function deleteTeam(id: string) {
  try {
    await db`DELETE FROM "Team" WHERE id = ${id}`

    revalidatePath("/dashboard/equipos")
    return { success: true }
  } catch (error) {
    console.error("Error deleting team:", error)
    return {
      success: false,
      error: "Error deleting team",
      details: error instanceof Error ? error.message : String(error),
    }
  }
}

// Member actions
export async function getMembers() {
  try {
    const result = await db`
      SELECT m.*, t.name as "teamName"
      FROM "Member" m
      LEFT JOIN "Team" t ON m."teamId" = t.id
      ORDER BY m."createdAt" DESC
    `
    return { success: true, data: result || [] }
  } catch (error) {
    console.error("Error getting members:", error)
    return {
      success: false,
      error: "Error loading members",
      details: error instanceof Error ? error.message : String(error),
    }
  }
}

export async function getMembersByTeam(teamId: string) {
  try {
    const result = await db`
      SELECT * FROM "Member"
      WHERE "teamId" = ${teamId}
      ORDER BY "createdAt" DESC
    `
    return { success: true, data: result || [] }
  } catch (error) {
    console.error("Error getting team members:", error)
    return {
      success: false,
      error: "Error loading team members",
      details: error instanceof Error ? error.message : String(error),
    }
  }
}

export async function createMember(data: {
  teamId: string
  name: string
  parentName?: string
  email: string
  phone: string
  isPlayer: boolean
  isParent: boolean
  previousClub?: string
  password?: string
}) {
  try {
    let hashedPassword = null
    if (data.password) {
      hashedPassword = await bcrypt.hash(data.password, 10)
    }

    const id = `member_${Date.now()}`
    const result = await db`
      INSERT INTO "Member" (
        id, "teamId", name, "parentName", email, phone, 
        "isPlayer", "isParent", "previousClub", password, "createdAt", "updatedAt"
      ) VALUES (
        ${id}, ${data.teamId}, ${data.name}, ${data.parentName || null}, 
        ${data.email}, ${data.phone}, ${data.isPlayer}, ${data.isParent}, 
        ${data.previousClub || null}, ${hashedPassword}, NOW(), NOW()
      )
      RETURNING *
    `

    revalidatePath(`/dashboard/equipos/${data.teamId}`)
    revalidatePath("/dashboard/equipos")
    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error creating member:", error)
    return {
      success: false,
      error: "Error creating member",
      details: error instanceof Error ? error.message : String(error),
    }
  }
}

// Post actions
export async function getPosts() {
  try {
    const result = await db`
      SELECT p.*, u.name as "authorName", t.name as "teamName"
      FROM "Post" p
      LEFT JOIN "User" u ON p."authorId" = u.id
      LEFT JOIN "Team" t ON p."teamId" = t.id
      ORDER BY p."createdAt" DESC
    `
    return { success: true, data: result || [] }
  } catch (error) {
    console.error("Error getting posts:", error)
    return {
      success: false,
      error: "Error loading posts",
      details: error instanceof Error ? error.message : String(error),
    }
  }
}

export async function getPostsByTeam(teamId: string) {
  try {
    const result = await db`
      SELECT p.*, u.name as "authorName"
      FROM "Post" p
      LEFT JOIN "User" u ON p."authorId" = u.id
      WHERE p."teamId" = ${teamId}
      ORDER BY p."createdAt" DESC
    `
    return { success: true, data: result || [] }
  } catch (error) {
    console.error("Error getting team posts:", error)
    return {
      success: false,
      error: "Error loading team posts",
      details: error instanceof Error ? error.message : String(error),
    }
  }
}

export async function createPost(data: {
  teamId: string
  title: string
  content: string
  isPublic: boolean
}) {
  try {
    // Get current user
    const session = await getServerSessionNext(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const id = `post_${Date.now()}`
    const result = await db`
      INSERT INTO "Post" (
        id, "teamId", "authorId", title, content, "isPublic", "createdAt", "updatedAt"
      ) VALUES (
        ${id}, ${data.teamId}, ${session.user.id}, ${data.title}, 
        ${data.content}, ${data.isPublic}, NOW(), NOW()
      )
      RETURNING *
    `

    revalidatePath(`/dashboard/equipos/${data.teamId}`)
    revalidatePath("/dashboard/mensajes")
    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error creating post:", error)
    return {
      success: false,
      error: "Error creating post",
      details: error instanceof Error ? error.message : String(error),
    }
  }
}

export async function getEventById(id: string) {
  try {
    const result = await db`
      SELECT * FROM "Event" WHERE id = ${id}
    `
    return { success: true, data: result[0] || null }
  } catch (error) {
    console.error("Error getting event:", error)
    return {
      success: false,
      error: "Error loading event",
      details: error instanceof Error ? error.message : String(error),
    }
  }
}

export async function getTeamById(id: string) {
  try {
    const result = await db`
      SELECT * FROM "Team" WHERE id = ${id}
    `
    return { success: true, data: result[0] || null }
  } catch (error) {
    console.error("Error getting team:", error)
    return {
      success: false,
      error: "Error loading team",
      details: error instanceof Error ? error.message : String(error),
    }
  }
}
