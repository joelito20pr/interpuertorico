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
    console.log("Datos recibidos para actualización:", body)

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

    // Preparar los campos a actualizar
    const fieldsToUpdate = {
      name: body.name,
      email: body.email,
      phone: body.phone,
      numberOfAttendees: body.numberOfAttendees || 1,
      guardianName: body.guardianName || null,
      updatedAt: new Date(),
    }

    // Añadir campos opcionales si están presentes
    if (body.confirmationStatus) {
      fieldsToUpdate.confirmationStatus = body.confirmationStatus
    }

    if (body.paymentStatus) {
      fieldsToUpdate.paymentStatus = body.paymentStatus
    }

    if (body.paymentReference) {
      fieldsToUpdate.paymentReference = body.paymentReference
    }

    console.log("Campos a actualizar:", fieldsToUpdate)

    // Construir la consulta SQL dinámicamente
    let updateQuery = `
      UPDATE "EventRegistration" SET
        name = ${body.name},
        email = ${body.email},
        phone = ${body.phone},
        "numberOfAttendees" = ${body.numberOfAttendees || 1},
        "guardianName" = ${body.guardianName || null},
        "updatedAt" = NOW()
    `

    // Añadir campos opcionales a la consulta
    if (body.confirmationStatus) {
      updateQuery += `, "confirmationStatus" = ${body.confirmationStatus}`
    }

    if (body.paymentStatus) {
      updateQuery += `, "paymentStatus" = ${body.paymentStatus}`
    }

    if (body.paymentReference) {
      updateQuery += `, "paymentReference" = ${body.paymentReference}`
    }

    // Completar la consulta
    updateQuery += ` WHERE id = ${registrationId} RETURNING *`

    console.log("Consulta SQL:", updateQuery)

    // Ejecutar la consulta
    const updatedRegistration = await db.unsafe(updateQuery)

    console.log("Resultado de la actualización:", updatedRegistration)

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
