"use server"

import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { getServerSession as getServerSessionNext } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { cookies } from "next/headers"
import * as db from "@/lib/db"

// Acciones para eventos
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
    await db.query(`DELETE FROM "Event" WHERE id = $1`, [id])

    revalidatePath("/dashboard/eventos")
    return { success: true }
  } catch (error) {
    console.error("Error al eliminar evento:", error)
    return { success: false, error: "Error al eliminar el evento" }
  }
}

// Acciones para registros
export async function registerForEvent(data: {
  eventId: string
  playerName: string
  parentName: string
  phone: string
  email: string
  previousClub: string
}) {
  try {
    const registration = await db.registerForEvent(data)

    revalidatePath(`/dashboard/eventos/${data.eventId}`)
    return { success: true, data: registration }
  } catch (error) {
    console.error("Error al registrar:", error)
    return { success: false, error: error instanceof Error ? error.message : "Error al procesar el registro" }
  }
}

// Crear usuario administrador (solo para inicialización)
export async function createAdminUser() {
  try {
    const existingAdmin = await db.getUserByEmail("admin@interpr.com")

    if (existingAdmin) {
      return { success: true, message: "El administrador ya existe" }
    }

    // Usar bcrypt.hash en lugar de hash directamente
    const hashedPassword = await bcrypt.hash("admin123", 10)

    await db.createAdminUser("Administrador", "admin@interpr.com", hashedPassword)

    return { success: true, message: "Administrador creado con éxito" }
  } catch (error) {
    console.error("Error al crear administrador:", error)
    return { success: false, error: "Error al crear administrador" }
  }
}

// Acciones para equipos
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

// Acciones para miembros de equipo
export async function addTeamMember(data: {
  teamId: string
  name: string
  parentName: string
  email: string
  phone: string
  isPlayer: boolean
  isParent: boolean
  relatedMemberId: string | null
  createAccount: boolean
  password: string
}) {
  try {
    // Verificar si ya existe un miembro con este correo electrónico
    const existingMember = await db.getMemberByEmail(data.email)

    let hashedPassword = null
    if (data.createAccount && data.password) {
      // Usar bcrypt.hash en lugar de hash directamente
      hashedPassword = await bcrypt.hash(data.password, 10)
    }

    let member
    if (!existingMember) {
      // Crear nuevo miembro
      member = await db.addTeamMember({
        teamId: data.teamId,
        name: data.name,
        parentName: data.parentName,
        email: data.email,
        phone: data.phone,
        isPlayer: data.isPlayer,
        isParent: data.isParent,
        relatedMemberId: data.relatedMemberId,
        password: hashedPassword,
      })
    } else {
      // Actualizar miembro existente
      member = await db.query(
        `
        UPDATE "Member"
        SET name = $1, "parentName" = $2, phone = $3, "teamId" = $4, 
            "isPlayer" = $5, "isParent" = $6, "relatedMemberId" = $7,
            password = COALESCE($8, password), "updatedAt" = NOW()
        WHERE id = $9
        RETURNING *
      `,
        [
          data.name,
          data.parentName,
          data.phone,
          data.teamId,
          data.isPlayer,
          data.isParent,
          data.relatedMemberId,
          hashedPassword,
          existingMember.id,
        ],
      )
    }

    revalidatePath(`/dashboard/equipos/${data.teamId}`)
    return { success: true, data: member }
  } catch (error) {
    console.error("Error al añadir miembro:", error)
    return { success: false, error: "Error al añadir miembro al equipo" }
  }
}

// Acciones para publicaciones
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
    return { success: true, data: post }
  } catch (error) {
    console.error("Error al crear publicación:", error)
    return { success: false, error: "Error al crear la publicación" }
  }
}

// Acciones para comentarios
export async function createComment(data: {
  postId: string
  content: string
}) {
  try {
    // Obtener el usuario actual
    const session = await getServerSessionNext(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: "No autorizado" }
    }

    // Obtener el post para saber a qué equipo pertenece
    const post = await db.query(
      `
      SELECT "teamId" FROM "Post" WHERE id = $1
    `,
      [data.postId],
    )

    if (!post || post.length === 0) {
      return { success: false, error: "Publicación no encontrada" }
    }

    const comment = await db.createComment({
      postId: data.postId,
      authorId: session.user.id,
      content: data.content,
    })

    revalidatePath(`/dashboard/equipos/${post[0].teamId}`)
    return { success: true, data: comment }
  } catch (error) {
    console.error("Error al crear comentario:", error)
    return { success: false, error: "Error al crear el comentario" }
  }
}

// Acciones para el portal de miembros
export async function loginMember(data: {
  email: string
  password: string
}) {
  try {
    // Buscar miembro por email
    const member = await db.getMemberByEmail(data.email)

    if (!member || !member.password) {
      return { success: false, error: "Credenciales incorrectas" }
    }

    // Usar bcrypt.compare en lugar de compare directamente
    const isPasswordValid = await bcrypt.compare(data.password, member.password)

    if (!isPasswordValid) {
      return { success: false, error: "Credenciales incorrectas" }
    }

    // Establecer cookie de sesión
    cookies().set("member_id", member.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 semana
      path: "/",
    })

    return { success: true }
  } catch (error) {
    console.error("Error al iniciar sesión:", error)
    return { success: false, error: "Error al iniciar sesión" }
  }
}

export async function logoutMember() {
  try {
    cookies().delete("member_id")
    return { success: true }
  } catch (error) {
    console.error("Error al cerrar sesión:", error)
    return { success: false, error: "Error al cerrar sesión" }
  }
}

export async function createMemberComment(data: {
  postId: string
  memberId: string
  content: string
}) {
  try {
    // Verificar que el post existe
    const post = await db.query(
      `
      SELECT id, "teamId" FROM "Post" WHERE id = $1
    `,
      [data.postId],
    )

    if (!post || post.length === 0) {
      return { success: false, error: "Publicación no encontrada" }
    }

    // Crear comentario
    const comment = await db.createComment({
      postId: data.postId,
      authorId: data.memberId,
      content: data.content,
    })

    revalidatePath(`/portal/mensajes/${data.postId}`)
    return { success: true, data: comment }
  } catch (error) {
    console.error("Error al crear comentario:", error)
    return { success: false, error: "Error al crear el comentario" }
  }
}
