import { NextResponse } from "next/server"

export function GET() {
  return NextResponse.json({ message: "Esta es una respuesta de prueba" })
}

export function POST() {
  return NextResponse.json({ message: "Esta es una respuesta POST de prueba" })
}
