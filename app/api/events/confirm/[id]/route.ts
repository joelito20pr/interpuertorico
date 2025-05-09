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
      SELECT id FROM "EventRegistration" 
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

    // Intentar actualizar todos los campos posibles de confirmación para asegurar compatibilidad
    try {
      await db`
        UPDATE "EventRegistration" 
        SET 
          "confirmationStatus" = ${confirmationStatus},
          "paymentStatus" = ${confirmationStatus},
          "updatedAt" = NOW() 
        WHERE id = ${registrations[0].id}
      `
      console.log("Registro actualizado con éxito:", registrations[0].id)
    } catch (error) {
      console.error("Error al actualizar ambos campos:", error)

      // Intentar actualizar solo confirmationStatus
      try {
        await db`
          UPDATE "EventRegistration" 
          SET "confirmationStatus" = ${confirmationStatus}, "updatedAt" = NOW() 
          WHERE id = ${registrations[0].id}
        `
        console.log("Registro actualizado con confirmationStatus:", registrations[0].id)
      } catch (confirmError) {
        console.error("Error al actualizar confirmationStatus:", confirmError)

        // Intentar actualizar solo paymentStatus
        try {
          await db`
            UPDATE "EventRegistration" 
            SET "paymentStatus" = ${confirmationStatus}, "updatedAt" = NOW() 
            WHERE id = ${registrations[0].id}
          `
          console.log("Registro actualizado con paymentStatus:", registrations[0].id)
        } catch (paymentError) {
          console.error("Error al actualizar paymentStatus:", paymentError)
          throw new Error("No se pudo actualizar ningún campo de estado")
        }
      }
    }

    // Verificar que el registro se actualizó correctamente
    const updatedRegistration = await db`
      SELECT id, "confirmationStatus", "paymentStatus" FROM "EventRegistration" 
      WHERE id = ${registrations[0].id}
    `

    console.log("Estado actualizado:", updatedRegistration)

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
          .debug-info {
            margin-top: 30px;
            font-size: 12px;
            color: #666;
            text-align: left;
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 5px;
          }
          .show-debug {
            cursor: pointer;
            color: #0066cc;
            text-decoration: underline;
            font-size: 12px;
            margin-top: 20px;
            display: inline-block;
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
          
          <div class="debug-info">
            <h4>Información de confirmación:</h4>
            <p><strong>ID del evento:</strong> ${eventId}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Confirmación:</strong> ${confirm}</p>
            <p><strong>Estado de confirmación:</strong> ${confirmationStatus}</p>
            <p><strong>ID del registro:</strong> ${registrations[0]?.id || "No encontrado"}</p>
            <p><strong>Estado actualizado:</strong> ${
              updatedRegistration.length > 0
                ? `confirmationStatus: ${updatedRegistration[0].confirmationStatus || "N/A"}, paymentStatus: ${
                    updatedRegistration[0].paymentStatus || "N/A"
                  }`
                : "No se pudo verificar"
            }</p>
            <p><strong>Fecha y hora:</strong> ${new Date().toISOString()}</p>
          </div>
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
