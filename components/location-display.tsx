import { isValidUrl } from "@/lib/utils"
import { ExternalLink } from "lucide-react"

interface LocationDisplayProps {
  location: string
}

export function LocationDisplay({ location }: LocationDisplayProps) {
  if (isValidUrl(location)) {
    return (
      <a
        href={location}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline flex items-center"
      >
        {location}
        <ExternalLink className="h-4 w-4 ml-1" />
      </a>
    )
  }
  return <span>{location}</span>
}
