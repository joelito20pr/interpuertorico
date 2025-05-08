"use server"

import { verifyCredentials, setAuthCookie, clearAuthCookie } from "@/lib/auth-utils"
import { redirect } from "next/navigation"

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { success: false, error: "Email y contraseña son requeridos" }
  }

  const user = await verifyCredentials(email, password)

  if (!user) {
    return { success: false, error: "Credenciales inválidas" }
  }

  setAuthCookie(user.id)

  return { success: true, user }
}

export async function logoutAction() {
  clearAuthCookie()
  redirect("/login")
}
