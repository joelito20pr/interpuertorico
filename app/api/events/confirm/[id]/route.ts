import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")
    const confirm = searchParams.get("confirm")
    const eventId = params.id

    console.log("Confirmación recibida:", { eventId, email, confirm })

    if (!email || !confirm || !eventId) {
      return NextResponse.json(
        {
          success: false,
          message: "Faltan parámetros requeridos",
        },
        { status: 400 },
      )
    }

    // Verificar si existe el registro
    const registrations = await db`
      SELECT id, "confirmationStatus" FROM "EventRegistration" 
      WHERE "eventId" = ${eventId} 
      AND email = ${email}
    `

    console.log("Registros encontrados:", registrations)

    if (registrations.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No se encontró un registro con ese email para este evento",
        },
        { status: 404 },
      )
    }

    // Actualizar el estado de confirmación
    const confirmationStatus = confirm === "yes" ? "CONFIRMED" : "DECLINED"

    const updateResult = await db`
      UPDATE "EventRegistration" 
      SET "confirmationStatus" = ${confirmationStatus}, 
          "updatedAt" = NOW() 
      WHERE id = ${registrations[0].id}
      RETURNING id, "confirmationStatus"
    `

    console.log("Resultado de actualización:", updateResult)

    // Obtener información del evento para la página de confirmación
    const event = await db`
      SELECT title, date, location FROM "Event" 
      WHERE id = ${eventId}
    `

    // Generar HTML para la página de confirmación
    const confirmationHtml = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmación de Asistencia</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
          }
          .card {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            margin-top: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .success {
            color: #4CAF50;
          }
          .declined {
            color: #f44336;
          }
          .event-details {
            margin-top: 20px;
            text-align: left;
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
          }
          .logo {
            max-width: 100px;
            margin-bottom: 20px;
          }
          .button {
            display: inline-block;
            background-color: #0066cc;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <img src="https://interprfc.com/icon.png" alt="Logo" class="logo">
        <div class="card">
          <h1 class="${confirm === "yes" ? "success" : "declined"}">
            ${confirm === "yes" ? "¡Asistencia Confirmada!" : "Asistencia Declinada"}
          </h1>
          <p>
            ${
              confirm === "yes"
                ? "Gracias por confirmar tu asistencia al evento."
                : "Has indicado que no podrás asistir al evento. Esperamos verte en futuros eventos."
            }
          </p>
          
          ${
            event.length > 0
              ? `
          <div class="event-details">
            <h3>Detalles del Evento:</h3>
            <p><strong>Evento:</strong> ${event[0].title}</p>
            <p><strong>Fecha:</strong> ${new Date(event[0].date).toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}</p>
            <p><strong>Ubicación:</strong> ${event[0].location}</p>
          </div>
          `
              : ""
          }
          
          <a href="https://www.interprfc.com" class="button">Volver al sitio</a>
        </div>
      </body>
      </html>
    `

    return new NextResponse(confirmationHtml, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    })
  } catch (error) {
    console.error("Error en confirmación de asistencia:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error al procesar la confirmación",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
