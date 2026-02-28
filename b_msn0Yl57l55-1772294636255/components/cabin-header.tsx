"use client"

import { useState } from "react"
import { ArrowLeft, User, Globe, Check, X } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { LANGUAGES, type Locale } from "@/lib/i18n"
import { CabinLogo } from "@/components/cabin-logo"

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
  const currentFlag = LANGUAGES.find((l) => l.code === locale)?.flag ?? ""

  return (
    <>
      <header className="flex items-center justify-between px-4 py-3 bg-cabin-navy border-b border-white/10 relative z-20">
        {/* Left: back or logo */}
        <div className="flex items-center gap-3 min-w-0">
          {showBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-white/80 hover:text-white font-medium text-sm transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{t.back}</span>
            </button>
          )}

          {/* Brand logo when no flight info and not a sub-screen with title */}
          {!showFlightInfo && !showBack && !title && (
            <CabinLogo size="sm" variant="light" showText />
          )}

          {/* Back + title for sub-screens */}
          {showBack && title && (
            <h1 className="font-bold text-white text-base truncate">{title}</h1>
          )}

          {/* Logo without back arrow when showing title only */}
          {!showBack && title && (
            <h1 className="font-bold text-white text-base">{title}</h1>
          )}
        </div>

        {/* Center: flight info */}
        {showFlightInfo && (
          <div className="flex-1 text-center">
            <p className="font-black text-white text-sm tracking-wide">{flightNumber}</p>
            <p className="text-white/60 text-[10px] tracking-wider">{route}</p>
          </div>
        )}

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          {showLanguageSwitcher && (
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-white/20 text-white text-xs font-bold hover:bg-white/10 transition-colors"
              aria-label={t.changeLanguage}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{currentFlag} {locale.toUpperCase()}</span>
            </button>
          )}
          {showFlightInfo && seat && (
            <span className="px-2 py-1 border border-cabin-gold/60 bg-cabin-gold/10 rounded text-cabin-gold text-xs font-black">
              {seat}
            </span>
          )}
          {showUser && (
            <button
              className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
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
            className="absolute inset-0 bg-cabin-navy/40 backdrop-blur-sm"
            onClick={() => setShowLangMenu(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-border w-72 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-cabin-navy" />
                <h3 className="font-bold text-cabin-navy text-sm">{t.changeLanguage}</h3>
              </div>
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
                    setLocale(lang.code as Locale)
                    setShowLangMenu(false)
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                    locale === lang.code
                      ? "bg-cabin-navy/5 text-cabin-navy"
                      : "hover:bg-muted text-cabin-navy"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl" aria-hidden="true">{lang.flag}</span>
                    <div className="flex flex-col items-start">
                      <span className="font-semibold text-sm">{lang.nativeName}</span>
                      <span className="text-muted-foreground text-xs">{lang.name}</span>
                    </div>
                  </div>
                  {locale === lang.code && (
                    <Check className="w-4 h-4 text-cabin-gold flex-shrink-0" />
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
