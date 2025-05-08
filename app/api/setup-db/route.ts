import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Verify database connection
    const testConnection = await db`SELECT NOW() as time`
    console.log("Database connection successful:", testConnection[0])

    // Create tables if they don't exist
    await createTables()

    return NextResponse.json({
      success: true,
      message: "Database configured successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error configuring database:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error configuring database",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

async function createTables() {
  // Create User table if it doesn't exist
  await db`
    CREATE TABLE IF NOT EXISTS "User" (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE NOT NULL,
      password TEXT,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `

  // Create Team table if it doesn't exist
  await db`
    CREATE TABLE IF NOT EXISTS "Team" (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT,
      description TEXT,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `

  // Create Member table if it doesn't exist
  await db`
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

  // Create Event table if it doesn't exist
  await db`
    CREATE TABLE IF NOT EXISTS "Event" (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      date TIMESTAMP WITH TIME ZONE NOT NULL,
      location TEXT NOT NULL,
      "requiresPayment" BOOLEAN DEFAULT FALSE,
      price TEXT,
      "stripeLink" TEXT,
      "shareableSlug" TEXT UNIQUE,
      "maxAttendees" INTEGER,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `

  // Create EventRegistration table if it doesn't exist
  await db`
    CREATE TABLE IF NOT EXISTS "EventRegistration" (
      id TEXT PRIMARY KEY,
      "eventId" TEXT REFERENCES "Event"(id),
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      "numberOfAttendees" INTEGER DEFAULT 1,
      "paymentStatus" TEXT DEFAULT 'PENDING',
      "paymentReference" TEXT,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `

  // Create Sponsor table if it doesn't exist
  await db`
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

  // Create Post table if it doesn't exist
  await db`
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

  // Insert admin user if it doesn't exist
  const adminExists = await db`SELECT * FROM "User" WHERE email = 'admin@interpr.com'`
  if (adminExists.length === 0) {
    // Password: admin123 (bcrypt hash)
    await db`
      INSERT INTO "User" (id, name, email, password)
      VALUES ('user_admin', 'Administrador', 'admin@interpr.com', '$2a$10$zQSMW7UiBD0OMXVVrRjEVeIY.6P1D1hGcTylTGcqQW.JOtXyFwXHa')
    `
  }

  console.log("Tables created successfully")
}
