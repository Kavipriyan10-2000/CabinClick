import { Plane } from "lucide-react"

type CabinLogoProps = {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "dark" | "light" | "gold"
  showText?: boolean
  className?: string
}

const sizes = {
  sm: { wrap: "w-8 h-8", icon: "w-4 h-4", text: "text-base" },
  md: { wrap: "w-10 h-10", icon: "w-5 h-5", text: "text-lg" },
  lg: { wrap: "w-14 h-14", icon: "w-7 h-7", text: "text-2xl" },
  xl: { wrap: "w-20 h-20", icon: "w-10 h-10", text: "text-4xl" },
}

const variants = {
  dark: { bg: "bg-cabin-navy", icon: "text-white", text: "text-cabin-navy" },
  light: { bg: "bg-white", icon: "text-cabin-navy", text: "text-white" },
  gold: { bg: "bg-cabin-gold", icon: "text-cabin-navy", text: "text-cabin-navy" },
}

export function CabinLogo({
  size = "md",
  variant = "dark",
  showText = true,
  className = "",
}: CabinLogoProps) {
  const s = sizes[size]
  const v = variants[variant]

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`${s.wrap} ${v.bg} rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0`}
      >
        <Plane className={`${s.icon} ${v.icon} rotate-[-35deg]`} aria-hidden="true" />
      </div>
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={`font-black ${s.text} ${v.text} tracking-tight`}>
            Cabin<span className="text-cabin-gold">Click</span>
          </span>
          {size === "xl" && (
            <span className="text-xs font-medium opacity-60 tracking-widest uppercase" style={{ color: variant === "light" ? "white" : "#6B7A99" }}>
              In-Flight Service
            </span>
          )}
        </div>
      )}
    </div>
  )
}
