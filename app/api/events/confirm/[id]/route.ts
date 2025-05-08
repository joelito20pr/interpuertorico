import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const eventId = params.id
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get("email")
    const confirm = searchParams.get("confirm")

    console.log("Confirmación recibida:", { eventId, email, confirm })

    // Validar parámetros
    if (!email || !confirm) {
      return new Response("Faltan parámetros requeridos", { status: 400 })
    }

    // Verificar si el registro existe
    const registrations = await db`
      SELECT id, "paymentStatus" FROM "EventRegistration"
      WHERE "eventId" = ${eventId} AND email = ${email}
    `

    console.log("Registros encontrados:", registrations)

    if (!registrations || registrations.length === 0) {
      return new Response("Registro no encontrado", { status: 404 })
    }

    // Actualizar el estado de confirmación
    const confirmationStatus = confirm === "yes" ? "CONFIRMED" : "DECLINED"

    const updateResult = await db`
      UPDATE "EventRegistration"
      SET "paymentStatus" = ${confirmationStatus}, "updatedAt" = NOW()
      WHERE id = ${registrations[0].id}
      RETURNING id, "paymentStatus"
    `

    console.log("Resultado de actualización:", updateResult)

    // Redirigir a una página de confirmación
    const confirmationMessage =
      confirm === "yes"
        ? "¡Gracias por confirmar tu asistencia! Te esperamos en el evento."
        : "Hemos registrado que no podrás asistir. ¡Esperamos verte en futuros eventos!"

    // HTML simple para la página de confirmación
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Confirmación de asistencia</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
          }
          .container {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            margin-top: 40px;
          }
          h1 {
            color: #0066cc;
          }
          .success {
            color: #4CAF50;
          }
          .declined {
            color: #f44336;
          }
          .button {
            display: inline-block;
            background-color: #0066cc;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Inter Puerto Rico</h1>
          <h2 class="${confirm === "yes" ? "success" : "declined"}">
            ${confirm === "yes" ? "¡Asistencia Confirmada!" : "Asistencia Cancelada"}
          </h2>
          <p>${confirmationMessage}</p>
          <a href="https://www.interprfc.com" class="button">Volver al sitio</a>
        </div>
      </body>
      </html>
    `

    return new Response(html, {
      headers: {
        "Content-Type": "text/html",
      },
    })
  } catch (error) {
    console.error("Error al confirmar asistencia:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al procesar la confirmación",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
