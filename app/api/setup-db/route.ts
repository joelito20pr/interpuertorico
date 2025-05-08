import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET() {
  try {
    // Verificar conexión a la base de datos
    const testConnection = await sql`SELECT NOW() as time`
    console.log("Conexión a la base de datos exitosa:", testConnection.rows[0])

    // Crear tablas si no existen
    await createTables()

    return NextResponse.json({
      success: true,
      message: "Base de datos configurada correctamente",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error al configurar la base de datos:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al configurar la base de datos",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

async function createTables() {
  // Crear tabla User si no existe
  await sql`
    CREATE TABLE IF NOT EXISTS "User" (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE NOT NULL,
      password TEXT,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `

  // Crear tabla Team si no existe
  await sql`
    CREATE TABLE IF NOT EXISTS "Team" (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT,
      description TEXT,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `

  // Crear tabla Member si no existe
  await sql`
    CREATE TABLE IF NOT EXISTS "Member" (
      id TEXT PRIMARY KEY,
      "teamId" TEXT REFERENCES "Team"(id),
      name TEXT NOT NULL,
      "parentName" TEXT,
      email TEXT,
      phone TEXT,
      "isPlayer" BOOLEAN DEFAULT FALSE,
      "isParent" BOOLEAN DEFAULT FALSE,
      "previousClub" TEXT,
      password TEXT,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `

  // Crear tabla Event si no existe
  await sql`
    CREATE TABLE IF NOT EXISTS "Event" (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      date TIMESTAMP WITH TIME ZONE NOT NULL,
      location TEXT NOT NULL,
      "requiresPayment" BOOLEAN DEFAULT FALSE,
      price TEXT,
      "stripeLink" TEXT,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `

  // Crear tabla Sponsor si no existe
  await sql`
    CREATE TABLE IF NOT EXISTS "Sponsor" (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      company TEXT,
      amount DECIMAL(10,2) NOT NULL,
      tier TEXT,
      "paymentStatus" TEXT DEFAULT 'PENDING',
      "paymentDate" TIMESTAMP WITH TIME ZONE,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `

  // Crear tabla Post si no existe
  await sql`
    CREATE TABLE IF NOT EXISTS "Post" (
      id TEXT PRIMARY KEY,
      "teamId" TEXT REFERENCES "Team"(id),
      "authorId" TEXT REFERENCES "User"(id),
      title TEXT NOT NULL,
      content TEXT,
      "isPublic" BOOLEAN DEFAULT FALSE,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `

  // Insertar usuario admin si no existe
  const adminExists = await sql`SELECT * FROM "User" WHERE email = 'admin@interpr.com'`
  if (adminExists.rowCount === 0) {
    // Contraseña: admin123 (hash bcrypt)
    await sql`
      INSERT INTO "User" (id, name, email, password)
      VALUES ('user_admin', 'Administrador', 'admin@interpr.com', '$2a$10$zQSMW7UiBD0OMXVVrRjEVeIY.6P1D1hGcTylTGcqQW.JOtXyFwXHa')
    `
  }

  console.log("Tablas creadas correctamente")
}
