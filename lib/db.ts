import { neon } from "@neondatabase/serverless"
import { sql } from "@vercel/postgres"

// Create a SQL client
export const db = neon(process.env.DATABASE_URL!)

// User functions
export async function getUserByEmail(email: string) {
  try {
    const result = await sql`
      SELECT * FROM "User" WHERE email = ${email} LIMIT 1
    `
    return result.rows[0] || null
  } catch (error) {
    console.error("Error getting user by email:", error)
    throw error
  }
}

// Event functions
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
    const result = await sql`
      INSERT INTO "Event" (
        title, description, date, location, 
        "requiresPayment", price, "stripeLink"
      ) VALUES (
        ${eventData.title}, ${eventData.description}, ${eventData.date}, ${eventData.location},
        ${eventData.requiresPayment}, ${eventData.price}, ${eventData.stripeLink}
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

// Registration functions
export async function registerForEvent(data: {
  eventId: string
  playerName: string
  parentName: string
  phone: string
  email: string
  previousClub: string
}) {
  try {
    const result = await sql`
      INSERT INTO "Registration" (
        "eventId", "playerName", "parentName", phone, email, "previousClub"
      ) VALUES (
        ${data.eventId}, ${data.playerName}, ${data.parentName}, 
        ${data.phone}, ${data.email}, ${data.previousClub}
      )
      RETURNING *
    `
    return result.rows[0]
  } catch (error) {
    console.error("Error registering for event:", error)
    throw error
  }
}

// Admin user functions
export async function createAdminUser(name: string, email: string, password: string) {
  try {
    const result = await sql`
      INSERT INTO "User" (name, email, password, role)
      VALUES (${name}, ${email}, ${password}, 'ADMIN')
      RETURNING *
    `
    return result.rows[0]
  } catch (error) {
    console.error("Error creating admin user:", error)
    throw error
  }
}

// Team functions
export async function createTeam(teamData: {
  name: string
  category: string
  description: string | null
}) {
  try {
    const result = await sql`
      INSERT INTO "Team" (name, category, description)
      VALUES (${teamData.name}, ${teamData.category}, ${teamData.description})
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
export async function getMemberByEmail(email: string) {
  try {
    const result = await sql`
      SELECT * FROM "Member" WHERE email = ${email} LIMIT 1
    `
    return result.rows[0] || null
  } catch (error) {
    console.error("Error getting member by email:", error)
    throw error
  }
}

export async function addTeamMember(data: {
  teamId: string
  name: string
  parentName: string | null
  email: string
  phone: string
  isPlayer: boolean
  isParent: boolean
  relatedMemberId: string | null
  password: string | null
}) {
  try {
    const result = await sql`
      INSERT INTO "Member" (
        "teamId", name, "parentName", email, phone, 
        "isPlayer", "isParent", "relatedMemberId", password
      ) VALUES (
        ${data.teamId}, ${data.name}, ${data.parentName}, ${data.email}, ${data.phone},
        ${data.isPlayer}, ${data.isParent}, ${data.relatedMemberId}, ${data.password}
      )
      RETURNING *
    `
    return result.rows[0]
  } catch (error) {
    console.error("Error adding team member:", error)
    throw error
  }
}

// Post functions
export async function createPost(data: {
  teamId: string
  authorId: string
  title: string
  content: string
  isPublic: boolean
}) {
  try {
    const result = await sql`
      INSERT INTO "Post" (
        "teamId", "authorId", title, content, "isPublic"
      ) VALUES (
        ${data.teamId}, ${data.authorId}, ${data.title}, ${data.content}, ${data.isPublic}
      )
      RETURNING *
    `
    return result.rows[0]
  } catch (error) {
    console.error("Error creating post:", error)
    throw error
  }
}

// Comment functions
export async function createComment(data: {
  postId: string
  authorId: string
  content: string
}) {
  try {
    const result = await sql`
      INSERT INTO "Comment" (
        "postId", "authorId", content
      ) VALUES (
        ${data.postId}, ${data.authorId}, ${data.content}
      )
      RETURNING *
    `
    return result.rows[0]
  } catch (error) {
    console.error("Error creating comment:", error)
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
    throw error
  }
}
