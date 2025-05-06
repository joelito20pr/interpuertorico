"use client"

import { useState } from "react"
import { LinkIcon, CheckIcon } from "lucide-react"

interface CopyLinkButtonProps {
  link: string
}

export function CopyLinkButton({ link }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Error al copiar al portapapeles:", err)
    }
  }

  return (
    <button
      type="button"
      onClick={copyToClipboard}
      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
    >
      {copied ? (
        <>
          <CheckIcon className="h-4 w-4 mr-2 text-green-500" />
          <span className="text-green-500">Copiado</span>
        </>
      ) : (
        <>
          <LinkIcon className="h-4 w-4 mr-2" />
          <span>Copiar</span>
        </>
      )}
    </button>
  )
}
