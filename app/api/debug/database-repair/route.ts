import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { addCorsHeaders, handleCors } from "@/lib/api-utils"

export async function GET(request: NextRequest) {
  // Handle CORS preflight request
  const corsResponse = handleCors(request)
  if (corsResponse) return corsResponse

  try {
    // Verificar conexión a la base de datos
    console.log("Verificando conexión a la base de datos...")
    await sql`SELECT NOW()`
    console.log("Conexión a la base de datos exitosa")

    // Array para almacenar resultados
    const results: { table: string; action: string; success: boolean; message: string }[] = []

    // Verificar y crear tabla de eventos si no existe
    try {
      console.log("Verificando tabla de eventos...")
      const eventTableExists = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'events'
        );
      `

      if (!eventTableExists.rows[0].exists) {
        console.log("Creando tabla de eventos...")
        await sql`
          CREATE TABLE events (
            id VARCHAR(255) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            date TIMESTAMP WITH TIME ZONE,
            location TEXT,
            requiresPayment BOOLEAN DEFAULT FALSE,
            price DECIMAL(10, 2),
            stripeLink TEXT,
            createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            shareableSlug VARCHAR(255),
            maxAttendees INTEGER,
            isPublic BOOLEAN DEFAULT FALSE
          );
        `
        results.push({
          table: "events",
          action: "create",
          success: true,
          message: "Tabla de eventos creada exitosamente",
        })
      } else {
        results.push({ table: "events", action: "check", success: true, message: "Tabla de eventos ya existe" })

        // Verificar columnas de la tabla de eventos
        console.log("Verificando columnas de la tabla de eventos...")

        // Verificar columna shareableSlug
        const hasShareableSlug = await sql`
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'events' AND column_name = 'shareableslug'
          );
        `

        if (!hasShareableSlug.rows[0].exists) {
          console.log("Añadiendo columna shareableSlug a la tabla de eventos...")
          await sql`ALTER TABLE events ADD COLUMN shareableSlug VARCHAR(255);`
          results.push({
            table: "events",
            action: "alter",
            success: true,
            message: "Columna shareableSlug añadida a la tabla de eventos",
          })
        }

        // Verificar columna isPublic
        const hasIsPublic = await sql`
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'events' AND column_name = 'ispublic'
          );
        `

        if (!hasIsPublic.rows[0].exists) {
          console.log("Añadiendo columna isPublic a la tabla de eventos...")
          await sql`ALTER TABLE events ADD COLUMN isPublic BOOLEAN DEFAULT FALSE;`
          results.push({
            table: "events",
            action: "alter",
            success: true,
            message: "Columna isPublic añadida a la tabla de eventos",
          })
        }

        // Verificar columna maxAttendees
        const hasMaxAttendees = await sql`
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'events' AND column_name = 'maxattendees'
          );
        `

        if (!hasMaxAttendees.rows[0].exists) {
          console.log("Añadiendo columna maxAttendees a la tabla de eventos...")
          await sql`ALTER TABLE events ADD COLUMN maxAttendees INTEGER;`
          results.push({
            table: "events",
            action: "alter",
            success: true,
            message: "Columna maxAttendees añadida a la tabla de eventos",
          })
        }
      }
    } catch (error: any) {
      console.error("Error al verificar/crear tabla de eventos:", error)
      results.push({ table: "events", action: "error", success: false, message: `Error: ${error.message}` })
    }

    // Verificar y crear tabla de registros si no existe
    try {
      console.log("Verificando tabla de registros...")
      const registrationTableExists = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'eventregistration'
        );
      `

      if (!registrationTableExists.rows[0].exists) {
        console.log("Creando tabla de registros...")
        await sql`
          CREATE TABLE EventRegistration (
            id SERIAL PRIMARY KEY,
            eventId VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(255),
            team VARCHAR(255),
            registrationDate TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            confirmed BOOLEAN DEFAULT FALSE,
            confirmationDate TIMESTAMP WITH TIME ZONE,
            notes TEXT,
            paymentStatus VARCHAR(50) DEFAULT 'pending',
            paymentMethod VARCHAR(50),
            paymentDate TIMESTAMP WITH TIME ZONE,
            paymentAmount DECIMAL(10, 2),
            paymentReference VARCHAR(255),
            FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE
          );
        `
        results.push({
          table: "eventregistration",
          action: "create",
          success: true,
          message: "Tabla de registros creada exitosamente",
        })
      } else {
        results.push({
          table: "eventregistration",
          action: "check",
          success: true,
          message: "Tabla de registros ya existe",
        })

        // Verificar columnas de la tabla de registros
        console.log("Verificando columnas de la tabla de registros...")

        // Verificar columna team
        const hasTeam = await sql`
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'eventregistration' AND column_name = 'team'
          );
        `

        if (!hasTeam.rows[0].exists) {
          console.log("Añadiendo columna team a la tabla de registros...")
          await sql`ALTER TABLE EventRegistration ADD COLUMN team VARCHAR(255);`
          results.push({
            table: "eventregistration",
            action: "alter",
            success: true,
            message: "Columna team añadida a la tabla de registros",
          })
        }

        // Verificar columna notes
        const hasNotes = await sql`
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'eventregistration' AND column_name = 'notes'
          );
        `

        if (!hasNotes.rows[0].exists) {
          console.log("Añadiendo columna notes a la tabla de registros...")
          await sql`ALTER TABLE EventRegistration ADD COLUMN notes TEXT;`
          results.push({
            table: "eventregistration",
            action: "alter",
            success: true,
            message: "Columna notes añadida a la tabla de registros",
          })
        }
      }
    } catch (error: any) {
      console.error("Error al verificar/crear tabla de registros:", error)
      results.push({ table: "eventregistration", action: "error", success: false, message: `Error: ${error.message}` })
    }

    // Verificar y crear tabla de notificaciones si no existe
    try {
      console.log("Verificando tabla de notificaciones...")
      const notificationTableExists = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'notifications'
        );
      `

      if (!notificationTableExists.rows[0].exists) {
        console.log("Creando tabla de notificaciones...")
        await sql`
          CREATE TABLE notifications (
            id SERIAL PRIMARY KEY,
            type VARCHAR(50) NOT NULL,
            recipient VARCHAR(255) NOT NULL,
            subject VARCHAR(255),
            message TEXT NOT NULL,
            status VARCHAR(50) DEFAULT 'pending',
            createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            sentAt TIMESTAMP WITH TIME ZONE,
            error TEXT,
            metadata JSONB
          );
        `
        results.push({
          table: "notifications",
          action: "create",
          success: true,
          message: "Tabla de notificaciones creada exitosamente",
        })
      } else {
        results.push({
          table: "notifications",
          action: "check",
          success: true,
          message: "Tabla de notificaciones ya existe",
        })
      }
    } catch (error: any) {
      console.error("Error al verificar/crear tabla de notificaciones:", error)
      results.push({ table: "notifications", action: "error", success: false, message: `Error: ${error.message}` })
    }

    // Verificar y actualizar slugs de eventos
    try {
      console.log("Verificando slugs de eventos...")
      const eventsWithoutSlug = await sql`
        SELECT id, title FROM events 
        WHERE shareableSlug IS NULL OR shareableSlug = '';
      `

      if (eventsWithoutSlug.rowCount > 0) {
        console.log(`Actualizando slugs para ${eventsWithoutSlug.rowCount} eventos...`)

        for (const event of eventsWithoutSlug.rows) {
          const baseSlug = event.title
            .toLowerCase()
            .replace(/[^\w\s]/gi, "")
            .replace(/\s+/g, "-")

          const randomSuffix = Math.floor(Math.random() * 1000)
          const newSlug = `${baseSlug}-${randomSuffix}`

          await sql`
            UPDATE events 
            SET shareableSlug = ${newSlug}, isPublic = TRUE 
            WHERE id = ${event.id};
          `
        }

        results.push({
          table: "events",
          action: "update",
          success: true,
          message: `Slugs actualizados para ${eventsWithoutSlug.rowCount} eventos`,
        })
      } else {
        results.push({
          table: "events",
          action: "check",
          success: true,
          message: "Todos los eventos tienen slugs",
        })
      }
    } catch (error: any) {
      console.error("Error al verificar/actualizar slugs de eventos:", error)
      results.push({
        table: "events",
        action: "error",
        success: false,
        message: `Error al actualizar slugs: ${error.message}`,
      })
    }

    // Crear un evento de prueba si no hay eventos
    try {
      console.log("Verificando si existen eventos...")
      const eventCount = await sql`SELECT COUNT(*) FROM events;`

      if (Number.parseInt(eventCount.rows[0].count) === 0) {
        console.log("No hay eventos. Creando evento de prueba...")

        const eventId = `event_${Date.now()}`
        const eventTitle = "Evento de Prueba"
        const eventSlug = `evento-de-prueba-${Math.floor(Math.random() * 1000)}`

        await sql`
          INSERT INTO events (
            id, title, description, date, location, requiresPayment, 
            shareableSlug, isPublic, createdAt, updatedAt
          ) VALUES (
            ${eventId}, 
            ${eventTitle}, 
            'Este es un evento de prueba creado automáticamente', 
            ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()}, 
            'https://maps.app.goo.gl/example', 
            FALSE, 
            ${eventSlug}, 
            TRUE, 
            ${new Date().toISOString()}, 
            ${new Date().toISOString()}
          );
        `

        results.push({
          table: "events",
          action: "create",
          success: true,
          message: `Evento de prueba creado con ID: ${eventId} y slug: ${eventSlug}`,
        })
      } else {
        results.push({
          table: "events",
          action: "check",
          success: true,
          message: `Ya existen ${eventCount.rows[0].count} eventos en la base de datos`,
        })
      }
    } catch (error: any) {
      console.error("Error al verificar/crear evento de prueba:", error)
      results.push({
        table: "events",
        action: "error",
        success: false,
        message: `Error al crear evento de prueba: ${error.message}`,
      })
    }

    // Devolver resultados
    return addCorsHeaders(
      NextResponse.json({
        success: true,
        message: "Diagnóstico y reparación de base de datos completado",
        results,
        timestamp: new Date().toISOString(),
      }),
    )
  } catch (error: any) {
    console.error("Error en diagnóstico/reparación de base de datos:", error)

    return addCorsHeaders(
      NextResponse.json(
        {
          success: false,
          message: "Error en diagnóstico/reparación de base de datos",
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      ),
    )
  }
}

// Manejar solicitudes OPTIONS para CORS
export async function OPTIONS(request: NextRequest) {
  return handleCors(request) || new NextResponse(null, { status: 200 })
}
