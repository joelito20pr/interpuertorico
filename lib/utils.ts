import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(text: string): string {
  return (
    text
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/--+/g, "-")
      .substring(0, 50) +
    "-" +
    Math.floor(Math.random() * 1000)
  )
}

export function isValidUrl(string: string): boolean {
  try {
    // Intentar crear un objeto URL
    const url = new URL(string)
    // Verificar que el protocolo sea http o https
    return url.protocol === "http:" || url.protocol === "https:"
  } catch (_) {
    return false
  }
}
