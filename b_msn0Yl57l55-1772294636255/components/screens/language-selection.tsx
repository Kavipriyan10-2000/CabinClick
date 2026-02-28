"use client"

import { useState, useEffect } from "react"
import { Plane, Check } from "lucide-react"
import { LANGUAGES, type Locale } from "@/lib/i18n"
import { useLanguage } from "@/lib/language-context"

type LanguageSelectionProps = {
  onContinue: () => void
}

export function LanguageSelection({ onContinue }: LanguageSelectionProps) {
  const { locale, setLocale, t } = useLanguage()
  const [selected, setSelected] = useState<Locale>(locale)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  function handleSelect(code: Locale) {
    setSelected(code)
    setLocale(code)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div
        className={`flex-1 flex flex-col items-center justify-center px-4 py-8 transition-all duration-500 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="w-16 h-16 bg-cabin-navy rounded-2xl flex items-center justify-center mb-6 shadow-lg">
          <Plane className="w-8 h-8 text-card" />
        </div>

        <h1 className="text-3xl font-bold text-cabin-navy text-center text-balance mb-2">
          {t.welcomeTitle}
        </h1>
        <p className="text-muted-foreground text-center text-balance mb-8 max-w-sm">
          {t.welcomeSubtitle}
        </p>

        <div className="w-full max-w-md grid grid-cols-2 gap-3">
          {LANGUAGES.map((lang, i) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              style={{ transitionDelay: visible ? `${i * 40}ms` : "0ms" }}
              className={`relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                selected === lang.code
                  ? "border-cabin-gold bg-card shadow-md scale-[1.02]"
                  : "border-border bg-card hover:border-cabin-gold/50 hover:shadow-sm"
              }`}
              aria-pressed={selected === lang.code}
            >
              <span className="text-2xl leading-none" aria-hidden="true">
                {lang.flag}
              </span>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-cabin-navy text-sm leading-tight">
                  {lang.nativeName}
                </span>
                <span className="text-muted-foreground text-xs">{lang.name}</span>
              </div>
              {selected === lang.code && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-cabin-gold rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-cabin-navy" />
                </div>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={onContinue}
          className="mt-8 w-full max-w-md bg-cabin-navy text-card font-semibold py-4 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all text-base shadow-sm"
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
