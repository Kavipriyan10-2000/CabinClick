import { Wifi } from "lucide-react"

export function CabinFooter() {
  return (
    <footer className="py-3 text-center">
      <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-xs">
        <Wifi className="w-3 h-3" />
        <span>
          Powered by{" "}
          <span className="font-bold text-cabin-navy">
            Cabin<span className="text-cabin-gold">Click</span>
          </span>
          {" "}· Onboard WiFi
        </span>
        <span className="mx-2">·</span>
        <a
          href="/crew"
          className="text-cabin-navy font-semibold hover:text-cabin-gold transition-colors"
        >
          Crew →
        </a>
      </div>
    </footer>
  )
}
