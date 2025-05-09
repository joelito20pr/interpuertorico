import Image from "next/image"
import Link from "next/link"

interface LogoProps {
  width?: number
  height?: number
  className?: string
  linkClassName?: string
  href?: string
}

export function Logo({ width = 100, height = 100, className = "", linkClassName = "", href = "/" }: LogoProps) {
  const logoElement = (
    <Image
      src="/logo.png"
      alt="Inter Puerto Rico FC Logo"
      width={width}
      height={height}
      className={`object-contain ${className}`}
      priority
    />
  )

  if (href) {
    return (
      <Link href={href} className={`inline-block ${linkClassName}`}>
        {logoElement}
      </Link>
    )
  }

  return logoElement
}
