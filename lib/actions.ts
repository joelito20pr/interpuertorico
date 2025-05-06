"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { hash } from "bcrypt"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { cookies } from "next/headers"
import { compare } from "bcrypt"

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
    const event = await db.event.create({
      data: eventData,
    })

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
    const event = await db.event.update({
      where: { id },
      data: eventData,
    })

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
    await db.event.delete({
      where: { id },
    })

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
    // Primero, verificar si ya existe un miembro con este correo electrónico
    let member = await db.member.findFirst({
      where: {
        email: data.email,
      },
    })

    // Si no existe, crear un nuevo miembro
    if (!member) {
      member = await db.member.create({
        data: {
          name: data.playerName,
          parentName: data.parentName,
          email: data.email,
          phone: data.phone,
          previousClub: data.previousClub,
        },
      })
    }

    // Verificar si ya está registrado para este evento
    const existingRegistration = await db.registration.findFirst({
      where: {
        eventId: data.eventId,
        memberId: member.id,
      },
    })

    if (existingRegistration) {
      return {
        success: false,
        error: "Ya estás registrado para este evento",
      }
    }

    // Crear el registro
    const registration = await db.registration.create({
      data: {
        eventId: data.eventId,
        memberId: member.id,
      },
    })

    revalidatePath(`/dashboard/eventos/${data.eventId}`)
    return { success: true, data: registration }
  } catch (error) {
    console.error("Error al registrar:", error)
    return { success: false, error: "Error al procesar el registro" }
  }
}

// Crear usuario administrador (solo para inicialización)
export async function createAdminUser() {
  try {
    const existingAdmin = await db.user.findUnique({
      where: {
        email: "admin@interpr.com",
      },
    })

    if (existingAdmin) {
      return { success: true, message: "El administrador ya existe" }
    }

    const hashedPassword = await hash("admin123", 10)

    await db.user.create({
      data: {
        name: "Administrador",
        email: "admin@interpr.com",
        password: hashedPassword,
      },
    })

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
    const team = await db.team.create({
      data: teamData,
    })

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
    const team = await db.team.update({
      where: { id },
      data: teamData,
    })

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
    await db.team.delete({
      where: { id },
    })

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
    let member = await db.member.findFirst({
      where: {
        email: data.email,
      },
    })

    // Si no existe, crear un nuevo miembro
    if (!member) {
      const memberData = {
        name: data.name,
        parentName: data.parentName,
        email: data.email,
        phone: data.phone,
        teamId: data.teamId,
        isPlayer: data.isPlayer,
        isParent: data.isParent,
        relatedMemberId: data.relatedMemberId,
      }

      // Si se va a crear una cuenta, añadir contraseña
      if (data.createAccount && data.password) {
        const hashedPassword = await hash(data.password, 10)
        Object.assign(memberData, { password: hashedPassword })
      }

      member = await db.member.create({
        data: memberData,
      })
    } else {
      // Si ya existe, actualizar sus datos
      const memberData = {
        name: data.name,
        parentName: data.parentName,
        phone: data.phone,
        teamId: data.teamId,
        isPlayer: data.isPlayer,
        isParent: data.isParent,
        relatedMemberId: data.relatedMemberId,
      }

      // Si se va a crear una cuenta, añadir contraseña
      if (data.createAccount && data.password) {
        const hashedPassword = await hash(data.password, 10)
        Object.assign(memberData, { password: hashedPassword })
      }

      member = await db.member.update({
        where: { id: member.id },
        data: memberData,
      })
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
    // Obtener el usuario actual (debe implementarse con getServerSession)
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: "No autorizado" }
    }

    const post = await db.post.create({
      data: {
        title: data.title,
        content: data.content,
        teamId: data.teamId,
        authorId: session.user.id,
        isPublic: data.isPublic,
      },
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
    // Obtener el usuario actual (debe implementarse con getServerSession)
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: "No autorizado" }
    }

    // Obtener el post para saber a qué equipo pertenece
    const post = await db.post.findUnique({
      where: { id: data.postId },
      select: { teamId: true },
    })

    if (!post) {
      return { success: false, error: "Publicación no encontrada" }
    }

    const comment = await db.comment.create({
      data: {
        content: data.content,
        postId: data.postId,
        authorId: session.user.id,
      },
    })

    revalidatePath(`/dashboard/equipos/${post.teamId}`)
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
    const member = await db.member.findFirst({
      where: {
        email: data.email,
      },
    })

    if (!member || !member.password) {
      return { success: false, error: "Credenciales incorrectas" }
    }

    // Verificar contraseña
    const isPasswordValid = await compare(data.password, member.password)

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
    const post = await db.post.findUnique({
      where: { id: data.postId },
      select: { id: true, teamId: true },
    })

    if (!post) {
      return { success: false, error: "Publicación no encontrada" }
    }

    // Crear comentario
    const comment = await db.comment.create({
      data: {
        content: data.content,
        postId: data.postId,
        authorId: data.memberId,
      },
    })

    revalidatePath(`/portal/mensajes/${data.postId}`)
    return { success: true, data: comment }
  } catch (error) {
    console.error("Error al crear comentario:", error)
    return { success: false, error: "Error al crear el comentario" }
  }
}
