"use client"

import { useState } from "react"
import { Plane, Check } from "lucide-react"
import { LANGUAGES, type Locale } from "@/lib/i18n"
import { useLanguage } from "@/lib/language-context"

type LanguageSelectionProps = {
  onContinue: () => void
}

export function LanguageSelection({ onContinue }: LanguageSelectionProps) {
  const { locale, setLocale, t } = useLanguage()
  const [selected, setSelected] = useState<Locale>(locale)

  function handleSelect(code: Locale) {
    setSelected(code)
    setLocale(code)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-16 h-16 bg-cabin-navy rounded-2xl flex items-center justify-center mb-6">
          <Plane className="w-8 h-8 text-card" />
        </div>

        <h1 className="text-3xl font-bold text-cabin-navy text-center text-balance mb-2">
          {t.welcomeTitle}
        </h1>
        <p className="text-muted-foreground text-center text-balance mb-8 max-w-sm">
          {t.welcomeSubtitle}
        </p>

        <div className="w-full max-w-md grid grid-cols-2 gap-3">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={`relative flex flex-col items-center gap-1 p-4 rounded-xl border-2 transition-all ${
                selected === lang.code
                  ? "border-cabin-gold bg-card shadow-sm"
                  : "border-border bg-card hover:border-cabin-gold/50"
              }`}
              aria-pressed={selected === lang.code}
            >
              {selected === lang.code && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-cabin-gold rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-cabin-navy" />
                </div>
              )}
              <span className="font-semibold text-cabin-navy text-sm">
                {lang.nativeName}
              </span>
              <span className="text-muted-foreground text-xs">{lang.name}</span>
            </button>
          ))}
        </div>

        <button
          onClick={onContinue}
          className="mt-8 w-full max-w-md bg-cabin-navy text-card font-semibold py-4 rounded-xl hover:opacity-90 transition-opacity text-base"
        >
          {t.continueBtn}
        </button>
      </div>

      <footer className="py-4 text-center text-muted-foreground text-xs">
        {t.poweredBy}
      </footer>
    </div>
  )
}
