import { useState } from 'react'

type Props = {
  /** Try in order until one loads (e.g. primary poster + backup CDN). */
  srcs: string[]
  alt: string
  className?: string
  imgClassName?: string
}

/** Movie poster with graceful fallbacks when a URL fails (hotlink / block). */
export function MoviePoster({
  srcs,
  alt,
  className = '',
  imgClassName = '',
}: Props) {
  const [index, setIndex] = useState(0)
  const exhausted = index >= srcs.length

  if (exhausted || srcs.length === 0) {
    const initial = alt.trim().charAt(0).toUpperCase() || '?'
    return (
      <div
        className={`flex aspect-[2/3] w-full items-center justify-center bg-gradient-to-br from-zinc-700 via-zinc-900 to-black text-4xl font-bold text-zinc-500 ${className}`}
        role="img"
        aria-label={alt}
      >
        {initial}
      </div>
    )
  }

  const src = srcs[index]
  return (
    <div className={`overflow-hidden ${className}`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={() => setIndex((i) => i + 1)}
        className={`h-full w-full object-cover ${imgClassName}`}
      />
    </div>
  )
}
