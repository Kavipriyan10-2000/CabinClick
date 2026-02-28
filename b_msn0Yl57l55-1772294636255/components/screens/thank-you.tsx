"use client"

import { useEffect, useState } from "react"
import { Check } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { CabinLogo } from "@/components/cabin-logo"
import { CabinFooter } from "@/components/cabin-footer"

type ThankYouProps = {
  onDone: () => void
}

export function ThankYou({ onDone }: ThankYouProps) {
  const { t } = useLanguage()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Branded top bar */}
      <header className="flex items-center justify-center px-4 py-4 bg-cabin-navy">
        <CabinLogo size="sm" variant="light" showText />
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div
          className={`text-center max-w-md transition-all duration-600 ${
            visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          {/* Success icon */}
          <div className="relative flex items-center justify-center w-28 h-28 mx-auto mb-8">
            <div className="absolute inset-0 bg-cabin-gold/10 rounded-full animate-ping" />
            <div className="w-24 h-24 bg-cabin-navy rounded-full flex items-center justify-center shadow-xl">
              <Check className="w-12 h-12 text-cabin-gold" />
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-cabin-navy mb-3 text-balance leading-tight">
            {t.thankYouTitle}
          </h1>

          <div className="w-20 h-1.5 bg-cabin-gold mx-auto rounded-full mb-5" />

          <p className="text-muted-foreground text-base mb-10">
            {t.thankYouSubtitle}
          </p>

          <button
            onClick={onDone}
            className="bg-cabin-navy text-white font-bold py-4 px-16 rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all shadow-md"
          >
            {t.done}
          </button>
        </div>
      </div>

      <CabinFooter />
    </div>
  )
}
