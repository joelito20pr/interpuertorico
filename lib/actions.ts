"use server"

import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { getServerSession as getServerSessionNext } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { sql } from "@vercel/postgres"

// Dashboard actions
export async function getDashboardData() {
  try {
    // Verificar conexión a la base de datos
    await sql`SELECT NOW() as time`

    // Obtener estadísticas
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
      success: true,
      data: {
        eventCount,
        teamCount,
        memberCount,
        sponsorCount,
        totalAmount,
        recentSponsors: recentSponsors.rows || [],
        upcomingEvents: upcomingEvents.rows || [],
        goalAmount: 5000, // Meta fija por ahora
      },
    }
  } catch (error) {
    console.error("Error al obtener datos del dashboard:", error)
    return {
      success: false,
      error: "Error al cargar los datos del dashboard",
      details: error instanceof Error ? error.message : String(error),
    }
  }
}

// Acciones para eventos
export async function getEvents() {
  try {
    const result = await sql`
      SELECT * FROM "Event"
      ORDER BY date DESC
    `
    return { success: true, data: result.rows || [] }
  } catch (error) {
    console.error("Error al obtener eventos:", error)
    return {
      success: false,
      error: "Error al cargar los eventos",
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

    revalidatePath("/dashboard/eventos")
    return { success: true, data: result.rows[0] }
  } catch (error) {
    console.error("Error al crear evento:", error)
    return {
      success: false,
      error: "Error al crear el evento",
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

    revalidatePath(`/dashboard/eventos/${id}`)
    revalidatePath("/dashboard/eventos")
    return { success: true, data: result.rows[0] }
  } catch (error) {
    console.error("Error al actualizar evento:", error)
    return {
      success: false,
      error: "Error al actualizar el evento",
      details: error instanceof Error ? error.message : String(error),
    }
  }
}

export async function deleteEvent(id: string) {
  try {
    await sql`DELETE FROM "Event" WHERE id = ${id}`

    revalidatePath("/dashboard/eventos")
    return { success: true }
  } catch (error) {
    console.error("Error al eliminar evento:", error)
    return {
      success: false,
      error: "Error al eliminar el evento",
      details: error instanceof Error ? error.message : String(error),
    }
  }
}

// Acciones para equipos
export async function getTeams() {
  try {
    const result = await sql`
      SELECT * FROM "Team"
      ORDER BY "createdAt" DESC
    `
    return { success: true, data: result.rows || [] }
  } catch (error) {
    console.error("Error al obtener equipos:", error)
    return {
      success: false,
      error: "Error al cargar los equipos",
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
    const result = await sql`
      INSERT INTO "Team" (id, name, category, description, "createdAt", "updatedAt")
      VALUES (${id}, ${teamData.name}, ${teamData.category}, ${teamData.description}, NOW(), NOW())
      RETURNING *
    `

    revalidatePath("/dashboard/equipos")
    return { success: true, data: result.rows[0] }
  } catch (error) {
    console.error("Error al crear equipo:", error)
    return {
      success: false,
      error: "Error al crear el equipo",
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

    revalidatePath(`/dashboard/equipos/${id}`)
    revalidatePath("/dashboard/equipos")
    return { success: true, data: result.rows[0] }
  } catch (error) {
    console.error("Error al actualizar equipo:", error)
    return {
      success: false,
      error: "Error al actualizar el equipo",
      details: error instanceof Error ? error.message : String(error),
    }
  }
}

export async function deleteTeam(id: string) {
  try {
    await sql`DELETE FROM "Team" WHERE id = ${id}`

    revalidatePath("/dashboard/equipos")
    return { success: true }
  } catch (error) {
    console.error("Error al eliminar equipo:", error)
    return {
      success: false,
      error: "Error al eliminar el equipo",
      details: error instanceof Error ? error.message : String(error),
    }
  }
}

// Acciones para miembros
export async function getMembers() {
  try {
    const result = await sql`
      SELECT m.*, t.name as "teamName"
      FROM "Member" m
      LEFT JOIN "Team" t ON m."teamId" = t.id
      ORDER BY m."createdAt" DESC
    `
    return { success: true, data: result.rows || [] }
  } catch (error) {
    console.error("Error al obtener miembros:", error)
    return {
      success: false,
      error: "Error al cargar los miembros",
      details: error instanceof Error ? error.message : String(error),
    }
  }
}

export async function getMembersByTeam(teamId: string) {
  try {
    const result = await sql`
      SELECT * FROM "Member"
      WHERE "teamId" = ${teamId}
      ORDER BY "createdAt" DESC
    `
    return { success: true, data: result.rows || [] }
  } catch (error) {
    console.error("Error al obtener miembros del equipo:", error)
    return {
      success: false,
      error: "Error al cargar los miembros del equipo",
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
    const result = await sql`
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
    return { success: true, data: result.rows[0] }
  } catch (error) {
    console.error("Error al crear miembro:", error)
    return {
      success: false,
      error: "Error al crear el miembro",
      details: error instanceof Error ? error.message : String(error),
    }
  }
}

// Acciones para mensajes
export async function getPosts() {
  try {
    const result = await sql`
      SELECT p.*, u.name as "authorName", t.name as "teamName"
      FROM "Post" p
      LEFT JOIN "User" u ON p."authorId" = u.id
      LEFT JOIN "Team" t ON p."teamId" = t.id
      ORDER BY p."createdAt" DESC
    `
    return { success: true, data: result.rows || [] }
  } catch (error) {
    console.error("Error al obtener mensajes:", error)
    return {
      success: false,
      error: "Error al cargar los mensajes",
      details: error instanceof Error ? error.message : String(error),
    }
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
    return { success: true, data: result.rows || [] }
  } catch (error) {
    console.error("Error al obtener mensajes del equipo:", error)
    return {
      success: false,
      error: "Error al cargar los mensajes del equipo",
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
    // Obtener el usuario actual
    const session = await getServerSessionNext(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: "No autorizado" }
    }

    const id = `post_${Date.now()}`
    const result = await sql`
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
    return { success: true, data: result.rows[0] }
  } catch (error) {
    console.error("Error al crear mensaje:", error)
    return {
      success: false,
      error: "Error al crear el mensaje",
      details: error instanceof Error ? error.message : String(error),
    }
  }
}

export async function getEventById(id: string) {
  try {
    const result = await sql`
      SELECT * FROM "Event" WHERE id = ${id}
    `
    return { success: true, data: result.rows[0] || null }
  } catch (error) {
    console.error("Error al obtener evento:", error)
    return {
      success: false,
      error: "Error al cargar el evento",
      details: error instanceof Error ? error.message : String(error),
    }
  }
}

export async function getTeamById(id: string) {
  try {
    const result = await sql`
      SELECT * FROM "Team" WHERE id = ${id}
    `
    return { success: true, data: result.rows[0] || null }
  } catch (error) {
    console.error("Error al obtener equipo:", error)
    return {
      success: false,
      error: "Error al cargar el equipo",
      details: error instanceof Error ? error.message : String(error),
    }
  }
}
