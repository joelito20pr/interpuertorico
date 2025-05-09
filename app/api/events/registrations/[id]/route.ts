import { NextResponse } from "next/server"
import { db } from "@/lib/db"

// Endpoint para obtener un registro específico
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const registrationId = params.id

    if (!registrationId) {
      return NextResponse.json(
        {
          success: false,
          message: "ID de registro no proporcionado",
        },
        { status: 400 },
      )
    }

    const registration = await db`
      SELECT * FROM "EventRegistration" WHERE id = ${registrationId}
    `

    if (registration.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Registro no encontrado",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: registration[0],
    })
  } catch (error) {
    console.error("Error al obtener registro:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error al obtener el registro",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

// Endpoint para actualizar un registro
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const registrationId = params.id

    if (!registrationId) {
      return NextResponse.json(
        {
          success: false,
          message: "ID de registro no proporcionado",
        },
        { status: 400 },
      )
    }

    const body = await request.json()

    // Validar datos requeridos
    if (!body.name || !body.email || !body.phone) {
      return NextResponse.json(
        {
          success: false,
          message: "Faltan campos requeridos (nombre, email, teléfono)",
        },
        { status: 400 },
      )
    }

    // Verificar si el registro existe
    const existingRegistration = await db`
      SELECT id FROM "EventRegistration" WHERE id = ${registrationId}
    `

    if (existingRegistration.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Registro no encontrado",
        },
        { status: 404 },
      )
    }

    // Actualizar el registro
    const updatedRegistration = await db`
      UPDATE "EventRegistration" SET
        name = ${body.name},
        email = ${body.email},
        phone = ${body.phone},
        "numberOfAttendees" = ${body.numberOfAttendees || 1},
        "guardianName" = ${body.guardianName || null},
        "confirmationStatus" = ${body.confirmationStatus || "PENDING"},
        ${body.paymentStatus ? `"paymentStatus" = ${body.paymentStatus},` : ""}
        ${body.paymentReference ? `"paymentReference" = ${body.paymentReference},` : ""}
        "updatedAt" = NOW()
      WHERE id = ${registrationId}
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      message: "Registro actualizado correctamente",
      data: updatedRegistration[0],
    })
  } catch (error) {
    console.error("Error al actualizar registro:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error al actualizar el registro",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

// Endpoint para eliminar un registro
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const registrationId = params.id

    if (!registrationId) {
      return NextResponse.json(
        {
          success: false,
          message: "ID de registro no proporcionado",
        },
        { status: 400 },
      )
    }

    // Verificar si el registro existe
    const existingRegistration = await db`
      SELECT id FROM "EventRegistration" WHERE id = ${registrationId}
    `

    if (existingRegistration.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Registro no encontrado",
        },
        { status: 404 },
      )
    }

    // Eliminar el registro
    await db`
      DELETE FROM "EventRegistration" WHERE id = ${registrationId}
    `

    return NextResponse.json({
      success: true,
      message: "Registro eliminado correctamente",
    })
  } catch (error) {
    console.error("Error al eliminar registro:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error al eliminar el registro",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
