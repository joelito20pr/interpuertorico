import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("es-PR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("es-PR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function generateSlug(text: string): string {
  // Convertir a minúsculas y reemplazar espacios con guiones
  const baseSlug = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Eliminar caracteres especiales
    .replace(/[\s_-]+/g, "-") // Reemplazar espacios y guiones bajos con guiones
    .replace(/^-+|-+$/g, "") // Eliminar guiones del principio y final

  // Añadir un número aleatorio para evitar colisiones
  const randomSuffix = Math.floor(Math.random() * 10000)
  return `${baseSlug}-${randomSuffix}`
}

export function isValidUrl(string: string): boolean {
  try {
    // Verificar si la cadena comienza con http:// o https://
    if (!string.match(/^https?:\/\//i)) {
      return false
    }

    // Intentar crear un objeto URL
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

export function formatLocation(location: string): string {
  if (isValidUrl(location)) {
    return `<a href="${location}" target="_blank" rel="noopener noreferrer">${location}</a>`
  }
  return location
}
