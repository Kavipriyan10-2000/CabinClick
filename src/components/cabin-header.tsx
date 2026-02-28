"use client"

import { useState } from "react"
import { ArrowLeft, User, Plane, Globe, Check, X } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { LANGUAGES, type Locale } from "@/lib/i18n"

type CabinHeaderProps = {
  showBack?: boolean
  onBack?: () => void
  title?: string
  showUser?: boolean
  showFlightInfo?: boolean
  flightNumber?: string
  route?: string
  seat?: string
  showLanguageSwitcher?: boolean
}

export function CabinHeader({
  showBack = false,
  onBack,
  title,
  showUser = false,
  showFlightInfo = false,
  flightNumber = "LH441",
  route = "FRANKFURT \u2192 NEW YORK",
  seat = "14A",
  showLanguageSwitcher = true,
}: CabinHeaderProps) {
  const { t, locale, setLocale } = useLanguage()
  const [showLangMenu, setShowLangMenu] = useState(false)

  return (
    <>
      <header className="flex items-center justify-between px-4 py-3 bg-card border-b border-border relative z-20">
        <div className="flex items-center gap-3 min-w-0">
          {showBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-cabin-navy font-medium text-sm hover:opacity-70 transition-opacity"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{t.back}</span>
            </button>
          )}
          {!showFlightInfo && !title && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-cabin-navy rounded-lg flex items-center justify-center">
                <Plane className="w-4 h-4 text-card rotate-[-35deg]" />
              </div>
              <span className="font-bold text-cabin-navy text-lg tracking-tight">CabinClick</span>
            </div>
          )}
          {title && !showFlightInfo && (
            <h1 className="font-bold text-cabin-navy text-lg">{title}</h1>
          )}
        </div>

        {showFlightInfo && (
          <div className="flex-1 text-center">
            <p className="font-bold text-cabin-navy text-sm">{flightNumber}</p>
            <p className="text-muted-foreground text-xs">{route}</p>
          </div>
        )}

        <div className="flex items-center gap-2">
          {showLanguageSwitcher && (
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-border text-cabin-navy text-xs font-bold hover:bg-secondary transition-colors"
              aria-label={t.changeLanguage}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{locale.toUpperCase()}</span>
            </button>
          )}
          {showFlightInfo && seat && (
            <span className="px-2 py-1 border border-cabin-navy rounded text-cabin-navy text-xs font-bold">
              {seat}
            </span>
          )}
          {showUser && (
            <button
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-cabin-navy hover:bg-secondary transition-colors"
              aria-label="User profile"
            >
              <User className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Language dropdown */}
      {showLangMenu && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16">
          <div
            className="absolute inset-0 bg-cabin-navy/20 backdrop-blur-sm"
            onClick={() => setShowLangMenu(false)}
          />
          <div className="relative bg-card rounded-2xl shadow-xl border border-border w-72 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <h3 className="font-bold text-cabin-navy text-sm">{t.changeLanguage}</h3>
              <button
                onClick={() => setShowLangMenu(false)}
                className="text-muted-foreground hover:text-cabin-navy"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-2 pb-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLocale(lang.code)
                    setShowLangMenu(false)
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                    locale === lang.code
                      ? "bg-cabin-gold/10 text-cabin-navy"
                      : "hover:bg-muted text-cabin-navy"
                  }`}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-sm">{lang.nativeName}</span>
                    <span className="text-muted-foreground text-xs">{lang.name}</span>
                  </div>
                  {locale === lang.code && (
                    <Check className="w-4 h-4 text-cabin-gold" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
