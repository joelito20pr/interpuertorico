import { neon } from "@neondatabase/serverless"
import { sql } from "@vercel/postgres"

// Crear un cliente SQL con manejo de errores
let dbClient
try {
  dbClient = neon(process.env.DATABASE_URL!)
  console.log("Conexión a la base de datos establecida correctamente")
} catch (error) {
  console.error("Error al conectar con la base de datos:", error)
  // Fallback a un cliente vacío que no hará nada
  dbClient = {
    query: async () => ({ rows: [] }),
  }
}

export const db = dbClient

// User functions
export async function getUserByEmail(email: string) {
  try {
    const result = await sql`
      SELECT * FROM "User" WHERE email = ${email} LIMIT 1
    `
    return result.rows[0] || null
  } catch (error) {
    console.error("Error getting user by email:", error)
    return null
  }
}

// Dashboard functions
export async function getDashboardStats() {
  try {
    // Get event count
    const eventCountResult = await sql`SELECT COUNT(*) as count FROM "Event"`
    const eventCount = Number.parseInt(eventCountResult.rows[0]?.count || "0")

    // Get team count
    const teamCountResult = await sql`SELECT COUNT(*) as count FROM "Team"`
    const teamCount = Number.parseInt(teamCountResult.rows[0]?.count || "0")

    // Get member count
    const memberCountResult = await sql`SELECT COUNT(*) as count FROM "Member"`
    const memberCount = Number.parseInt(memberCountResult.rows[0]?.count || "0")

    // Get sponsor count and total amount
    const sponsorResult = await sql`
      SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total 
      FROM "Sponsor" 
      WHERE "paymentStatus" = 'PAID'
    `
    const sponsorCount = Number.parseInt(sponsorResult.rows[0]?.count || "0")
    const totalAmount = Number.parseFloat(sponsorResult.rows[0]?.total || "0")

    // Get recent sponsors
    const recentSponsors = await sql`
      SELECT id, name, amount, "paymentDate", tier
      FROM "Sponsor"
      WHERE "paymentStatus" = 'PAID'
      ORDER BY "paymentDate" DESC
      LIMIT 5
    `

    // Get upcoming events
    const upcomingEvents = await sql`
      SELECT id, title, date, location
      FROM "Event"
      WHERE date > NOW()
      ORDER BY date ASC
      LIMIT 3
    `

    return {
      eventCount,
      teamCount,
      memberCount,
      sponsorCount,
      totalAmount,
      recentSponsors: recentSponsors.rows || [],
      upcomingEvents: upcomingEvents.rows || [],
      goalAmount: 5000, // Meta fija por ahora
    }
  } catch (error) {
    console.error("Error getting dashboard stats:", error)
    return {
      eventCount: 0,
      teamCount: 0,
      memberCount: 0,
      sponsorCount: 0,
      totalAmount: 0,
      recentSponsors: [],
      upcomingEvents: [],
      goalAmount: 5000,
    }
  }
}

// Event functions
export async function getAllEvents() {
  try {
    const result = await sql`
      SELECT * FROM "Event"
      ORDER BY date DESC
    `
    return result.rows || []
  } catch (error) {
    console.error("Error getting all events:", error)
    return []
  }
}

export async function getEventById(id: string) {
  try {
    const result = await sql`
      SELECT * FROM "Event" WHERE id = ${id}
    `
    return result.rows[0] || null
  } catch (error) {
    console.error("Error getting event by id:", error)
    return null
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
    const result = await sql`
      INSERT INTO "Event" (
        id, title, description, date, location, 
        "requiresPayment", price, "stripeLink", "createdAt", "updatedAt"
      ) VALUES (
        ${id}, ${eventData.title}, ${eventData.description}, ${eventData.date}, ${eventData.location},
        ${eventData.requiresPayment}, ${eventData.price}, ${eventData.stripeLink}, NOW(), NOW()
      )
      RETURNING *
    `
    return result.rows[0]
  } catch (error) {
    console.error("Error creating event:", error)
    throw error
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
    const result = await sql`
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
    return result.rows[0]
  } catch (error) {
    console.error("Error updating event:", error)
    throw error
  }
}

export async function deleteEvent(id: string) {
  try {
    await sql`DELETE FROM "Event" WHERE id = ${id}`
    return true
  } catch (error) {
    console.error("Error deleting event:", error)
    throw error
  }
}

// Team functions
export async function getAllTeams() {
  try {
    const result = await sql`
      SELECT * FROM "Team"
      ORDER BY "createdAt" DESC
    `
    return result.rows || []
  } catch (error) {
    console.error("Error getting all teams:", error)
    return []
  }
}

export async function getTeamById(id: string) {
  try {
    const result = await sql`
      SELECT * FROM "Team" WHERE id = ${id}
    `
    return result.rows[0] || null
  } catch (error) {
    console.error("Error getting team by id:", error)
    return null
  }
}

export async function createTeam(teamData: {
  name: string
  category: string
  description: string | null
}) {
  try {
    const id = `team_${Date.now()}`
    const result = await sql`
      INSERT INTO "Team" (id, name, category, description, "createdAt", "updatedAt")
      VALUES (${id}, ${teamData.name}, ${teamData.category}, ${teamData.description}, NOW(), NOW())
      RETURNING *
    `
    return result.rows[0]
  } catch (error) {
    console.error("Error creating team:", error)
    throw error
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
    const result = await sql`
      UPDATE "Team"
      SET 
        name = ${teamData.name},
        category = ${teamData.category},
        description = ${teamData.description},
        "updatedAt" = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    return result.rows[0]
  } catch (error) {
    console.error("Error updating team:", error)
    throw error
  }
}

export async function deleteTeam(id: string) {
  try {
    await sql`DELETE FROM "Team" WHERE id = ${id}`
    return true
  } catch (error) {
    console.error("Error deleting team:", error)
    throw error
  }
}

// Member functions
export async function getAllMembers() {
  try {
    const result = await sql`
      SELECT m.*, t.name as "teamName"
      FROM "Member" m
      LEFT JOIN "Team" t ON m."teamId" = t.id
      ORDER BY m."createdAt" DESC
    `
    return result.rows || []
  } catch (error) {
    console.error("Error getting all members:", error)
    return []
  }
}

export async function getMembersByTeam(teamId: string) {
  try {
    const result = await sql`
      SELECT * FROM "Member"
      WHERE "teamId" = ${teamId}
      ORDER BY "createdAt" DESC
    `
    return result.rows || []
  } catch (error) {
    console.error("Error getting members by team:", error)
    return []
  }
}

export async function getMemberByEmail(email: string) {
  try {
    const result = await sql`
      SELECT * FROM "Member" WHERE email = ${email} LIMIT 1
    `
    return result.rows[0] || null
  } catch (error) {
    console.error("Error getting member by email:", error)
    return null
  }
}

export async function createMember(memberData: {
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
    const id = `member_${Date.now()}`
    const result = await sql`
      INSERT INTO "Member" (
        id, "teamId", name, "parentName", email, phone, 
        "isPlayer", "isParent", "previousClub", password, "createdAt", "updatedAt"
      ) VALUES (
        ${id}, ${memberData.teamId}, ${memberData.name}, ${memberData.parentName || null}, 
        ${memberData.email}, ${memberData.phone}, ${memberData.isPlayer}, ${memberData.isParent}, 
        ${memberData.previousClub || null}, ${memberData.password || null}, NOW(), NOW()
      )
      RETURNING *
    `
    return result.rows[0]
  } catch (error) {
    console.error("Error creating member:", error)
    throw error
  }
}

// Post and message functions
export async function getAllPosts() {
  try {
    const result = await sql`
      SELECT p.*, u.name as "authorName", t.name as "teamName"
      FROM "Post" p
      LEFT JOIN "User" u ON p."authorId" = u.id
      LEFT JOIN "Team" t ON p."teamId" = t.id
      ORDER BY p."createdAt" DESC
    `
    return result.rows || []
  } catch (error) {
    console.error("Error getting all posts:", error)
    return []
  }
}

export async function getPostsByTeam(teamId: string) {
  try {
    const result = await sql`
      SELECT p.*, u.name as "authorName"
      FROM "Post" p
      LEFT JOIN "User" u ON p."authorId" = u.id
      WHERE p."teamId" = ${teamId}
      ORDER BY p."createdAt" DESC
    `
    return result.rows || []
  } catch (error) {
    console.error("Error getting posts by team:", error)
    return []
  }
}

export async function createPost(postData: {
  teamId: string
  authorId: string
  title: string
  content: string
  isPublic: boolean
}) {
  try {
    const id = `post_${Date.now()}`
    const result = await sql`
      INSERT INTO "Post" (
        id, "teamId", "authorId", title, content, "isPublic", "createdAt", "updatedAt"
      ) VALUES (
        ${id}, ${postData.teamId}, ${postData.authorId}, ${postData.title}, 
        ${postData.content}, ${postData.isPublic}, NOW(), NOW()
      )
      RETURNING *
    `
    return result.rows[0]
  } catch (error) {
    console.error("Error creating post:", error)
    throw error
  }
}

// Helper function for executing queries
export async function query(text: string, params: any[] = []) {
  try {
    const result = await sql.query(text, params)
    return result.rows
  } catch (error) {
    console.error("Error executing query:", error)
    return []
  }
}
