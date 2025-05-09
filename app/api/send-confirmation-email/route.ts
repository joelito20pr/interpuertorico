import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sendEmailNotification } from "@/lib/email-service"
import { sendFormsparkEmail } from "@/lib/formspark-service"
import { getBaseUrl } from "@/lib/utils"

export async function POST(request) {
  try {
    const body = await request.json()
    const { registrationId, eventId, subject, message } = body

    if (!registrationId || !eventId || !subject || !message) {
      return NextResponse.json(
        {
          success: false,
          message: "Faltan campos requeridos",
        },
        { status: 400 },
      )
    }

    // Obtener información del registro
    const registrations = await db`
      SELECT id, name, email, "guardianName", phone
      FROM "EventRegistration"
      WHERE id = ${registrationId}
    `

    if (registrations.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Registro no encontrado",
        },
        { status: 404 },
      )
    }

    const registration = registrations[0]

    // Obtener información del evento
    const events = await db`
      SELECT id, title, date, location
      FROM "Event"
      WHERE id = ${eventId}
    `

    if (events.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Evento no encontrado",
        },
        { status: 404 },
      )
    }

    const event = events[0]

    // Generar URLs de confirmación
    const baseUrl = getBaseUrl()
    const confirmationUrl = `${baseUrl}/api/events/confirm/${eventId}?email=${encodeURIComponent(
      registration.email,
    )}&confirm=yes`
    const declineUrl = `${baseUrl}/api/events/confirm/${eventId}?email=${encodeURIComponent(
      registration.email,
    )}&confirm=no`

    // Intentar enviar por Formspark primero si está configurado
    let emailResult
    if (process.env.USE_FORMSPARK === "true") {
      emailResult = await sendFormsparkEmail({
        to: registration.email,
        subject,
        message,
        name: registration.guardianName || registration.name,
        eventTitle: event.title,
        eventDate: event.date,
        eventLocation: event.location,
        confirmationUrl,
        declineUrl,
      })
    }

    // Si Formspark no está configurado o falla, usar el servicio de email normal
    if (!emailResult || !emailResult.success) {
      // Generar HTML para el correo
      const html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body {
              font-family: Arial, Helvetica, sans-serif;
              line-height: 1.6;
              color: #333333;
              margin: 0;
              padding: 0;
              -webkit-font-smoothing: antialiased;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .email-wrapper {
              border: 1px solid #dddddd;
              border-radius: 5px;
              padding: 20px;
              background-color: #ffffff;
            }
            .logo-container {
              text-align: center;
              margin-bottom: 20px;
            }
            .logo {
              max-width: 150px;
              height: auto;
            }
            .header {
              color: #0066cc;
              text-align: center;
              margin-bottom: 20px;
              font-size: 24px;
              font-weight: bold;
            }
            .content {
              font-size: 16px;
              margin-bottom: 20px;
            }
            .message {
              white-space: pre-line;
              margin: 20px 0;
            }
            .event-details {
              background-color: #f9f9f9;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .event-details p {
              margin: 5px 0;
            }
            .button-container {
              margin: 25px 0;
              text-align: center;
            }
            .button {
              display: inline-block;
              background-color: #4CAF50;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 5px;
              margin-right: 10px;
              font-weight: bold;
              font-size: 16px;
            }
            .button-decline {
              background-color: #f44336;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eeeeee;
              color: #666666;
              font-size: 14px;
            }
            .footer p {
              margin-bottom: 10px;
            }
            .footer a {
              color: #0066cc;
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="email-wrapper">
              <div class="logo-container">
                <img src="${baseUrl}/logo.png" alt="Inter Puerto Rico FC Logo" class="logo">
              </div>
              
              <h2 class="header">${subject}</h2>
              
              <div class="content">
                <div class="message">${message}</div>
                
                <div class="event-details">
                  <p><strong>Evento:</strong> ${event.title}</p>
                  <p><strong>Fecha:</strong> ${new Date(event.date).toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}</p>
                  <p><strong>Ubicación:</strong> ${event.location}</p>
                </div>
                
                <div class="button-container">
                  <a href="${confirmationUrl}" class="button">Sí, asistiré</a>
                  <a href="${declineUrl}" class="button button-decline">No podré asistir</a>
                </div>
              </div>
              
              <div class="footer">
                <p>Este es un correo electrónico automático, por favor no respondas a este mensaje.</p>
                <p>Inter Puerto Rico FC &copy; ${new Date().getFullYear()}</p>
                <p>
                  <a href="${baseUrl}">Visitar sitio web</a>
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `

      // Enviar correo
      emailResult = await sendEmailNotification({
        to: registration.email,
        subject,
        html,
        eventId,
      })
    }

    // Registrar el envío del correo
    await db`
      INSERT INTO "EmailLog" (
        id,
        recipient,
        subject,
        "eventId",
        "registrationId",
        "createdAt",
        "status"
      ) VALUES (
        ${"email_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7)},
        ${registration.email},
        ${subject},
        ${eventId},
        ${registrationId},
        NOW(),
        ${emailResult.success ? "SENT" : "FAILED"}
      )
    `.catch((err) => {
      console.error("Error logging email:", err)
    })

    return NextResponse.json({
      success: emailResult.success,
      message: emailResult.message,
    })
  } catch (error) {
    console.error("Error sending confirmation email:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error al enviar el correo de confirmación",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      message: "Método no permitido",
    },
    { status: 405 },
  )
}
