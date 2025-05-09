import { db } from "@/lib/db"

// Función para generar un enlace de WhatsApp
export function generateWhatsAppLink(phone: string, message: string): string {
  // Limpiar el número de teléfono (eliminar espacios, guiones, paréntesis, etc.)
  const cleanPhone = phone.replace(/[\s\-$$$$.]/g, "")

  // Asegurarse de que el número comience con el código de país
  const formattedPhone = cleanPhone.startsWith("+")
    ? cleanPhone
    : cleanPhone.startsWith("1")
      ? `+1${cleanPhone}`
      : `+1${cleanPhone}`

  // Codificar el mensaje para URL
  const encodedMessage = encodeURIComponent(message)

  // Generar el enlace
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`
}

// Función para registrar un mensaje de WhatsApp en la base de datos
export async function logWhatsAppMessage(
  recipientPhone: string,
  recipientName: string,
  eventId: string,
  message: string,
): Promise<void> {
  try {
    const messageId = `whatsapp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

    await db`
      INSERT INTO "WhatsAppMessage" (
        id, 
        "recipientPhone", 
        "recipientName", 
        "eventId", 
        message, 
        "createdAt"
      ) VALUES (
        ${messageId},
        ${recipientPhone},
        ${recipientName},
        ${eventId},
        ${message},
        NOW()
      )
    `.catch((err) => {
      // Si la tabla no existe, la creamos
      if (err.message.includes('relation "WhatsAppMessage" does not exist')) {
        return db`
          CREATE TABLE "WhatsAppMessage" (
            id TEXT PRIMARY KEY,
            "recipientPhone" TEXT NOT NULL,
            "recipientName" TEXT NOT NULL,
            "eventId" TEXT NOT NULL,
            message TEXT NOT NULL,
            "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            "status" TEXT DEFAULT 'PENDING'
          )
        `.then(() => logWhatsAppMessage(recipientPhone, recipientName, eventId, message))
      }
      throw err
    })
  } catch (error) {
    console.error("Error logging WhatsApp message:", error)
  }
}

// Función para generar múltiples enlaces de WhatsApp
export async function generateWhatsAppLinks(
  eventId: string,
  customMessage?: string,
): Promise<{ name: string; phone: string; link: string }[]> {
  try {
    // Obtener información del evento
    const event = await db`
      SELECT title, date, location FROM "Event" WHERE id = ${eventId}
    `

    if (!event || event.length === 0) {
      throw new Error(`Evento con ID ${eventId} no encontrado`)
    }

    // Obtener todos los registros con números de teléfono
    const registrations = await db`
      SELECT name, email, phone, "guardianName" 
      FROM "EventRegistration" 
      WHERE "eventId" = ${eventId} 
      AND phone IS NOT NULL 
      AND phone != ''
    `

    if (!registrations || registrations.length === 0) {
      return []
    }

    // Formatear fecha del evento
    const formattedDate = new Date(event[0].date).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

    // Generar enlaces para cada registro
    const links = registrations.map((reg) => {
      // Nombre del destinatario (encargado o jugador)
      const recipientName = reg.guardianName || reg.name

      // Crear mensaje
      let message = customMessage
        ? `¡Hola ${recipientName}! ${customMessage}`
        : `¡Hola ${recipientName}! Te recordamos que el evento "${event[0].title}" está programado para pronto.`

      // Añadir detalles del evento
      message += `\n\n*Evento:* ${event[0].title}\n*Fecha:* ${formattedDate}\n*Ubicación:* ${event[0].location}`

      if (reg.guardianName) {
        message += `\n*Jugador:* ${reg.name}`
      }

      // Generar enlace
      const link = generateWhatsAppLink(reg.phone, message)

      // Registrar el mensaje en la base de datos
      logWhatsAppMessage(reg.phone, recipientName, eventId, message).catch(console.error)

      return {
        name: reg.name,
        phone: reg.phone,
        link,
      }
    })

    return links
  } catch (error) {
    console.error("Error generating WhatsApp links:", error)
    return []
  }
}
