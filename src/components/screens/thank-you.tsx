"use client"

import { Plane, Check } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

type ThankYouProps = {
  onDone: () => void
}

export function ThankYou({ onDone }: ThankYouProps) {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 border-2 border-cabin-navy rounded-full flex items-center justify-center mx-auto mb-8">
          <div className="w-12 h-12 bg-cabin-navy rounded-lg flex items-center justify-center">
            <Plane className="w-6 h-6 text-card" />
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-cabin-navy mb-4 text-balance leading-tight">
          {t.thankYouTitle}
        </h1>

        <div className="w-16 h-1 bg-cabin-gold mx-auto mb-6" />

        <p className="text-muted-foreground text-base mb-10">
          {t.thankYouSubtitle}
        </p>

        <button
          onClick={onDone}
          className="bg-cabin-navy text-card font-semibold py-3.5 px-16 rounded-xl hover:opacity-90 transition-opacity"
        >
          {t.done}
        </button>
      </div>

      <footer className="absolute bottom-6 text-center text-muted-foreground text-xs">
        {t.poweredBy}
      </footer>
    </div>
  )
}
