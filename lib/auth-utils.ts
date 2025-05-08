import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import { getUserByEmail } from "@/lib/db"

export async function verifyCredentials(email: string, password: string) {
  try {
    const user = await getUserByEmail(email)

    if (!user || !user.password) {
      return null
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    }
  } catch (error) {
    console.error("Error verifying credentials:", error)
    return null
  }
}

export function setAuthCookie(userId: string) {
  cookies().set("auth_user_id", userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  })
}

export function clearAuthCookie() {
  cookies().delete("auth_user_id")
}

export async function getCurrentUser() {
  const userId = cookies().get("auth_user_id")?.value

  if (!userId) {
    return null
  }

  try {
    // Here you would typically fetch the user from the database
    // For simplicity, we'll just return a basic user object
    return {
      id: userId,
      // You can fetch more user details from the database if needed
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}
