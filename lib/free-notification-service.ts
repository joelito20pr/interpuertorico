import nodemailer from "nodemailer"
import { generateWhatsAppLink } from "@/lib/utils"

// Tipos para nuestras notificaciones
export type NotificationType = "registration" | "reminder" | "custom"

export interface NotificationRecipient {
  name: string
  guardianName?: string
  email: string
  phone?: string
}

export interface EventDetails {
  id: string
  title: string
  date: string
  location: string
  slug?: string
}

// Configuración para servicios gratuitos
const freeConfig = {
  // Email gratuito usando Gmail o similar
  email: {
    service: process.env.FREE_EMAIL_SERVICE || "gmail", // gmail, outlook, etc.
    user: process.env.FREE_EMAIL_USER || "",
    pass: process.env.FREE_EMAIL_PASS || "",
    from: process.env.FREE_EMAIL_FROM || "",
  },
  // URL para generar enlaces de WhatsApp
  whatsapp: {
    enabled: process.env.ENABLE_WHATSAPP_LINKS === "true",
  },
}

// Create a transporter only when this module is imported
let emailTransporter: nodemailer.Transporter | null = null

try {
  // Try to create email transporter
  if (process.env.FREE_EMAIL_SERVICE && process.env.FREE_EMAIL_USER && process.env.FREE_EMAIL_PASS) {
    emailTransporter = nodemailer.createTransport({
      service: process.env.FREE_EMAIL_SERVICE,
      auth: {
        user: process.env.FREE_EMAIL_USER,
        pass: process.env.FREE_EMAIL_PASS,
      },
    })
    console.log("Email transporter initialized")
  } else {
    console.warn("Missing email configuration environment variables")
  }
} catch (error) {
  console.error("Failed to initialize email transporter:", error)
}

// Base URL for links
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.interprfc.com"

// Función para generar un enlace de WhatsApp
// export function generateWhatsAppLink(phone: string, message: string): string {
//   // Formatear el número de teléfono (eliminar espacios, guiones, etc.)
//   let formattedPhone = phone.replace(/[\s-()]/g, "")

//   // Asegurarse de que el número tenga el formato internacional con +
//   if (!formattedPhone.startsWith("+")) {
//     // Si comienza con 1, añadir el +
//     if (formattedPhone.startsWith("1")) {
//       formattedPhone = "+" + formattedPhone
//     } else {
//       // Si no comienza con código de país, asumir que es de Puerto Rico (+1)
//       formattedPhone = "+1" + formattedPhone
//     }
//   }

//   // Codificar el mensaje para URL
//   const encodedMessage = encodeURIComponent(message)

//   // Generar el enlace
//   return `https://wa.me/${formattedPhone.replace("+", "")}?text=${encodedMessage}`
// }

// Función para enviar Email usando Nodemailer con cuenta gratuita
// async function sendFreeEmail(to: string, subject: string, htmlContent: string) {
//   const { service, user, pass, from } = freeConfig.email

//   if (!user || !pass) {
//     console.log("[EMAIL DISABLED] Would send to:", to, "Subject:", subject)
//     return { success: false, error: "Email configuration is incomplete" }
//   }

//   try {
//     // Crear transportador de Nodemailer
//     const transporter = nodemailer.createTransport({
//       service,
//       auth: {
//         user,
//         pass,
//       },
//     })

//     // Enviar el email con configuraciones para evitar spam
//     const info = await transporter.sendMail({
//       from: from || user,
//       to,
//       subject,
//       html: htmlContent,
//       headers: {
//         "X-Priority": "1", // Alta prioridad
//         "X-MSMail-Priority": "High",
//         Importance: "High",
//         "X-Mailer": "Inter Puerto Rico Notification System",
//       },
//       // Añadir texto plano para mejorar la entrega
//       text: htmlContent.replace(/<[^>]*>?/gm, ""),
//     })

//     return { success: true, messageId: info.messageId }
//   } catch (error) {
//     console.error("Error sending email:", error)
//     return { success: false, error }
//   }
// }

// Función para crear el contenido de las notificaciones
// function createNotificationContent(
//   type: NotificationType,
//   recipient: NotificationRecipient,
//   event: EventDetails,
//   customMessage?: string,
// ) {
//   // Formatear fecha del evento
//   const formattedDate = new Date(event.date).toLocaleDateString("es-PR", {
//     weekday: "long",
//     year: "numeric",
//     month: "long",
//     day: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//   })

//   // Nombre del destinatario (encargado o jugador)
//   const recipientName = recipient.guardianName || recipient.name

//   // URL del evento - Usar el dominio correcto
//   const baseUrl = "https://www.interprfc.com"
//   const eventUrl = event.slug ? `${baseUrl}/eventos/${event.slug}` : ""

//   // Contenido según el tipo de notificación
//   if (type === "registration") {
//     // Mensaje para nuevo registro
//     const whatsappMessage = `¡Hola ${recipientName}! Tu registro para el evento "${event.title}" ha sido confirmado.\n\n📅 Fecha: ${formattedDate}\n📍 Ubicación: ${event.location}\n\nGracias por registrarte. Te enviaremos recordatorios antes del evento.`

//     const emailSubject = `Confirmación de registro: ${event.title}`
//     const emailBody = `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <h2 style="color: #0066cc;">¡Gracias por registrarte!</h2>
//         <p>Hola ${recipientName},</p>
//         <p>Tu registro para el evento <strong>"${event.title}"</strong> ha sido confirmado.</p>
//         <p><strong>Detalles del evento:</strong></p>
//         <ul>
//           <li><strong>Fecha:</strong> ${formattedDate}</li>
//           <li><strong>Ubicación:</strong> ${event.location}</li>
//           <li><strong>Jugador:</strong> ${recipient.name}</li>
//         </ul>
//         ${eventUrl ? `<p>Puedes ver los detalles del evento en: <a href="${eventUrl}">${eventUrl}</a></p>` : ""}

//         <div style="margin: 20px 0; text-align: center;">
//           <p>¿Confirmas tu asistencia al evento?</p>
//           <a href="${baseUrl}/api/events/confirm/${event.id}?email=${encodeURIComponent(recipient.email)}&confirm=yes" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-right: 10px;">Sí, asistiré</a>
//           <a href="${baseUrl}/api/events/confirm/${event.id}?email=${encodeURIComponent(recipient.email)}&confirm=no" style="display: inline-block; background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">No podré asistir</a>
//         </div>

//         <p>Gracias,<br>Equipo de Inter Puerto Rico</p>
//       </div>
//     `

//     return { whatsappMessage, emailSubject, emailBody }
//   } else if (type === "reminder") {
//     // Mensaje para recordatorio
//     const whatsappMessage = `¡Hola ${recipientName}! Te recordamos que el evento "${event.title}" está programado para mañana.\n\n📅 Fecha: ${formattedDate}\n📍 Ubicación: ${event.location}\n\n¡Esperamos verte allí!`

//     const emailSubject = `Recordatorio: ${event.title} - Mañana`
//     const emailBody = `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <h2 style="color: #0066cc;">Recordatorio de evento</h2>
//         <p>Hola ${recipientName},</p>
//         <p>Te recordamos que el evento <strong>"${event.title}"</strong> está programado para mañana.</p>
//         <p><strong>Detalles del evento:</strong></p>
//         <ul>
//           <li><strong>Fecha:</strong> ${formattedDate}</li>
//           <li><strong>Ubicación:</strong> ${event.location}</li>
//         </ul>
//         ${eventUrl ? `<p>Puedes ver los detalles del evento en: <a href="${eventUrl}">${eventUrl}</a></p>` : ""}

//         <div style="margin: 20px 0; text-align: center;">
//           <p>¿Confirmas tu asistencia al evento?</p>
//           <a href="${baseUrl}/api/events/confirm/${event.id}?email=${encodeURIComponent(recipient.email)}&confirm=yes" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-right: 10px;">Sí, asistiré</a>
//           <a href="${baseUrl}/api/events/confirm/${event.id}?email=${encodeURIComponent(recipient.email)}&confirm=no" style="display: inline-block; background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">No podré asistir</a>
//         </div>

//         <p>¡Esperamos verte allí!</p>
//         <p>Gracias,<br>Equipo de Inter Puerto Rico</p>
//       </div>
//     `

//     return { whatsappMessage, emailSubject, emailBody }
//   } else if (type === "custom" && customMessage) {
//     // Mensaje personalizado
//     const whatsappMessage = `¡Hola ${recipientName}! ${customMessage}\n\nEvento: ${event.title}\n📅 Fecha: ${formattedDate}\n📍 Ubicación: ${event.location}`

//     const emailSubject = `Mensaje importante: ${event.title}`
//     const emailBody = `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <h2 style="color: #0066cc;">Mensaje importante</h2>
//         <p>Hola ${recipientName},</p>
//         <p>${customMessage}</p>
//         <p><strong>Detalles del evento:</strong></p>
//         <ul>
//           <li><strong>Evento:</strong> ${event.title}</li>
//           <li><strong>Fecha:</strong> ${formattedDate}</li>
//           <li><strong>Ubicación:</strong> ${event.location}</li>
//         </ul>
//         ${eventUrl ? `<p>Puedes ver los detalles del evento en: <a href="${eventUrl}">${eventUrl}</a></p>` : ""}

//         <div style="margin: 20px 0; text-align: center;">
//           <p>¿Confirmas tu asistencia al evento?</p>
//           <a href="${baseUrl}/api/events/confirm/${event.id}?email=${encodeURIComponent(recipient.email)}&confirm=yes" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-right: 10px;">Sí, asistiré</a>
//           <a href="${baseUrl}/api/events/confirm/${event.id}?email=${encodeURIComponent(recipient.email)}&confirm=no" style="display: inline-block; background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">No podré asistir</a>
//         </div>

//         <p>Gracias,<br>Equipo de Inter Puerto Rico</p>
//       </div>
//     `

//     return { whatsappMessage, emailSubject, emailBody }
//   }

//   // Valor por defecto
//   return {
//     whatsappMessage: `Notificación de Inter Puerto Rico: Evento "${event.title}" - ${formattedDate}`,
//     emailSubject: `Notificación: ${event.title}`,
//     emailBody: `<p>Notificación de Inter Puerto Rico para el evento "${event.title}" el ${formattedDate}</p>`,
//   }
// }

// Función principal para enviar notificaciones
export async function sendFreeNotification(
  type: "registration" | "reminder" | "confirmation",
  contactInfo: {
    name: string
    guardianName?: string
    email: string
    phone?: string
  },
  eventInfo: {
    id: string
    title: string
    date: Date | string
    location: string
    slug?: string
  },
) {
  console.log("Sending free notification", { type, contactInfo, eventInfo })

  let emailSent = false
  let whatsappLink = null

  // Format the date
  const eventDate = new Date(eventInfo.date)
  const formattedDate = eventDate.toLocaleDateString("es-PR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  const formattedTime = eventDate.toLocaleTimeString("es-PR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })

  // Try to send email
  if (emailTransporter) {
    try {
      const eventPageUrl = eventInfo.slug
        ? `${BASE_URL}/eventos/${eventInfo.slug}`
        : `${BASE_URL}/dashboard/eventos/${eventInfo.id}`

      const confirmYesUrl = `${BASE_URL}/api/events/confirm/${contactInfo.email}?eventId=${eventInfo.id}&attending=yes`
      const confirmNoUrl = `${BASE_URL}/api/events/confirm/${contactInfo.email}?eventId=${eventInfo.id}&attending=no`

      const emailSubject =
        type === "registration"
          ? `Registro confirmado: ${eventInfo.title}`
          : type === "reminder"
            ? `Recordatorio: ${eventInfo.title} - ${formattedDate}`
            : `Confirmación: ${eventInfo.title}`

      // Logo URL
      const logoUrl = `${BASE_URL}/icon.png`

      // Construct email
      const mailOptions = {
        from: process.env.FREE_EMAIL_FROM || `"Inter Puerto Rico FC" <${process.env.FREE_EMAIL_USER}>`,
        to: contactInfo.email,
        subject: emailSubject,
        headers: {
          "X-Priority": "1 (Highest)",
          "X-MSMail-Priority": "High",
          Importance: "High",
        },
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="${logoUrl}" alt="Inter Puerto Rico FC Logo" style="max-width: 150px;">
            </div>
            <h2 style="color: #333; text-align: center;">
              ${
                type === "registration"
                  ? "¡Registro Confirmado!"
                  : type === "reminder"
                    ? "Recordatorio de Evento"
                    : "Confirmación de Asistencia"
              }
            </h2>
            <p style="margin-bottom: 15px;">Hola ${contactInfo.name},</p>
            <p style="margin-bottom: 15px;">
              ${
                type === "registration"
                  ? "Tu registro para el siguiente evento ha sido recibido con éxito:"
                  : type === "reminder"
                    ? "Te recordamos que tienes un evento próximamente:"
                    : "Por favor confirma tu asistencia al siguiente evento:"
              }
            </p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <h3 style="margin-top: 0; color: #0066cc;">${eventInfo.title}</h3>
              <p><strong>Fecha:</strong> ${formattedDate}</p>
              <p><strong>Hora:</strong> ${formattedTime}</p>
              <p><strong>Lugar:</strong> ${eventInfo.location}</p>
            </div>
            
            ${
              type === "registration" || type === "reminder"
                ? `<p style="margin-bottom: 20px;">Por favor confirma tu asistencia haciendo clic en uno de los siguientes botones:</p>
                <div style="text-align: center; margin-bottom: 20px;">
                  <a href="${confirmYesUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-right: 10px;">Sí, asistiré</a>
                  <a href="${confirmNoUrl}" style="display: inline-block; background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">No podré asistir</a>
                </div>`
                : ""
            }
            
            <p style="margin-bottom: 15px;">
              Para más detalles sobre el evento, puedes visitar la página del evento:
              <a href="${eventPageUrl}" style="color: #0066cc;">Ver Evento</a>
            </p>
            
            <div style="border-top: 1px solid #eaeaea; padding-top: 15px; margin-top: 20px; font-size: 12px; color: #666; text-align: center;">
              <p>Este correo fue enviado por Inter Puerto Rico FC.</p>
              <p>Si tienes alguna pregunta, por favor contáctanos respondiendo a este correo.</p>
            </div>
          </div>
        `,
      }

      // Send the email
      const info = await emailTransporter.sendMail(mailOptions)
      console.log("Email sent:", info.messageId)
      emailSent = true
    } catch (error) {
      console.error("Error sending email:", error)
      // Continue execution even if email fails
    }
  } else {
    console.warn("No email transporter available")
  }

  // Generate WhatsApp link if phone is provided and ENABLE_WHATSAPP_LINKS is true
  if (contactInfo.phone && process.env.ENABLE_WHATSAPP_LINKS === "true") {
    try {
      const message = `Hola ${contactInfo.name}, confirmamos tu registro para el evento "${eventInfo.title}" el ${formattedDate} a las ${formattedTime} en ${eventInfo.location}. Para más información, visita ${BASE_URL}/eventos/${eventInfo.slug || eventInfo.id}`

      whatsappLink = generateWhatsAppLink(contactInfo.phone, message)
      console.log("WhatsApp link generated:", whatsappLink)
    } catch (error) {
      console.error("Error generating WhatsApp link:", error)
      // Continue execution even if WhatsApp link generation fails
    }
  }

  return {
    success: emailSent,
    whatsappLink,
  }
}

// Función para enviar notificaciones masivas
export async function sendFreeBulkNotifications(
  type: NotificationType,
  recipients: NotificationRecipient[],
  event: EventDetails,
  customMessage?: string,
) {
  const results = {
    total: recipients.length,
    successful: 0,
    failed: 0,
    details: [] as any[],
    whatsappLinks: [] as { name: string; phone: string; link: string }[],
  }

  for (const recipient of recipients) {
    try {
      const result = await sendFreeNotification(type, recipient, event, customMessage)

      if (result.success) {
        results.successful++
      } else {
        results.failed++
      }

      if (result.whatsappLink && recipient.phone) {
        results.whatsappLinks.push({
          name: recipient.name,
          phone: recipient.phone,
          link: result.whatsappLink,
        })
      }

      results.details.push({
        recipient: recipient.email,
        success: result.success,
        whatsappLink: result.whatsappLink,
        emailSent: result.email?.success || false,
      })
    } catch (error) {
      console.error(`Error sending notification to ${recipient.email}:`, error)
      results.failed++
      results.details.push({
        recipient: recipient.email,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  return results
}
