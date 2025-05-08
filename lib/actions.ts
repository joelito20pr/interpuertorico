"use server"

import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { getServerSession as getServerSessionNext } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import * as db from "@/lib/db"

// Dashboard actions
export async function getDashboardData() {
  try {
    const stats = await db.getDashboardStats()
    return { success: true, data: stats }
  } catch (error) {
    console.error("Error al obtener datos del dashboard:", error)
    return { success: false, error: "Error al cargar los datos del dashboard" }
  }
}

// Acciones para eventos
export async function getEvents() {
  try {
    const events = await db.getAllEvents()
    return { success: true, data: events }
  } catch (error) {
    console.error("Error al obtener eventos:", error)
    return { success: false, error: "Error al cargar los eventos" }
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
    const event = await db.createEvent(eventData)

    revalidatePath("/dashboard/eventos")
    return { success: true, data: event }
  } catch (error) {
    console.error("Error al crear evento:", error)
    return { success: false, error: "Error al crear el evento" }
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
    const event = await db.updateEvent(id, eventData)

    revalidatePath(`/dashboard/eventos/${id}`)
    revalidatePath("/dashboard/eventos")
    return { success: true, data: event }
  } catch (error) {
    console.error("Error al actualizar evento:", error)
    return { success: false, error: "Error al actualizar el evento" }
  }
}

export async function deleteEvent(id: string) {
  try {
    await db.deleteEvent(id)

    revalidatePath("/dashboard/eventos")
    return { success: true }
  } catch (error) {
    console.error("Error al eliminar evento:", error)
    return { success: false, error: "Error al eliminar el evento" }
  }
}

// Acciones para equipos
export async function getTeams() {
  try {
    const teams = await db.getAllTeams()
    return { success: true, data: teams }
  } catch (error) {
    console.error("Error al obtener equipos:", error)
    return { success: false, error: "Error al cargar los equipos" }
  }
}

export async function createTeam(teamData: {
  name: string
  category: string
  description: string | null
}) {
  try {
    const team = await db.createTeam(teamData)

    revalidatePath("/dashboard/equipos")
    return { success: true, data: team }
  } catch (error) {
    console.error("Error al crear equipo:", error)
    return { success: false, error: "Error al crear el equipo" }
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
    const team = await db.updateTeam(id, teamData)

    revalidatePath(`/dashboard/equipos/${id}`)
    revalidatePath("/dashboard/equipos")
    return { success: true, data: team }
  } catch (error) {
    console.error("Error al actualizar equipo:", error)
    return { success: false, error: "Error al actualizar el equipo" }
  }
}

export async function deleteTeam(id: string) {
  try {
    await db.deleteTeam(id)

    revalidatePath("/dashboard/equipos")
    return { success: true }
  } catch (error) {
    console.error("Error al eliminar equipo:", error)
    return { success: false, error: "Error al eliminar el equipo" }
  }
}

// Acciones para miembros
export async function getMembers() {
  try {
    const members = await db.getAllMembers()
    return { success: true, data: members }
  } catch (error) {
    console.error("Error al obtener miembros:", error)
    return { success: false, error: "Error al cargar los miembros" }
  }
}

export async function getMembersByTeam(teamId: string) {
  try {
    const members = await db.getMembersByTeam(teamId)
    return { success: true, data: members }
  } catch (error) {
    console.error("Error al obtener miembros del equipo:", error)
    return { success: false, error: "Error al cargar los miembros del equipo" }
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

    const memberData = {
      ...data,
      password: hashedPassword,
    }

    const member = await db.createMember(memberData)

    revalidatePath(`/dashboard/equipos/${data.teamId}`)
    revalidatePath("/dashboard/equipos")
    return { success: true, data: member }
  } catch (error) {
    console.error("Error al crear miembro:", error)
    return { success: false, error: "Error al crear el miembro" }
  }
}

// Acciones para mensajes
export async function getPosts() {
  try {
    const posts = await db.getAllPosts()
    return { success: true, data: posts }
  } catch (error) {
    console.error("Error al obtener mensajes:", error)
    return { success: false, error: "Error al cargar los mensajes" }
  }
}

export async function getPostsByTeam(teamId: string) {
  try {
    const posts = await db.getPostsByTeam(teamId)
    return { success: true, data: posts }
  } catch (error) {
    console.error("Error al obtener mensajes del equipo:", error)
    return { success: false, error: "Error al cargar los mensajes del equipo" }
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

    const post = await db.createPost({
      teamId: data.teamId,
      authorId: session.user.id,
      title: data.title,
      content: data.content,
      isPublic: data.isPublic,
    })

    revalidatePath(`/dashboard/equipos/${data.teamId}`)
    revalidatePath("/dashboard/mensajes")
    return { success: true, data: post }
  } catch (error) {
    console.error("Error al crear mensaje:", error)
    return { success: false, error: "Error al crear el mensaje" }
  }
}

export async function getEventById(id: string) {
  try {
    const event = await db.getEventById(id)
    return { success: true, data: event }
  } catch (error) {
    console.error("Error al obtener evento:", error)
    return { success: false, error: "Error al cargar el evento" }
  }
}
