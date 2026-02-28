"use client"

import { useState } from "react"
import { AlertTriangle, Check, X } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

type SOSFlowProps = {
  onCancel: () => void
  onComplete: () => void
  seat?: string
}

export function SOSFlow({ onCancel, onComplete, seat = "14A" }: SOSFlowProps) {
  const { t } = useLanguage()
  const [confirmed, setConfirmed] = useState(false)

  function handleConfirm() {
    setConfirmed(true)
  }

  if (confirmed) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md bg-card rounded-2xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-[#D1FAE5] rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-cabin-success" />
          </div>

          <h1 className="text-2xl font-bold text-cabin-navy mb-3">
            {t.alertReceived}
          </h1>
          <p className="text-cabin-navy text-base mb-1">
            {t.alertReceivedMessage}{" "}
            <span className="font-bold">{seat}</span>.
          </p>

          <div className="w-16 h-0.5 bg-cabin-gold mx-auto my-4" />

          <p className="text-muted-foreground text-sm whitespace-pre-line mb-6">
            {t.alertReceivedSubMessage}
          </p>

          <button
            onClick={onComplete}
            className="w-full bg-cabin-navy text-card font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity"
          >
            {t.done}
          </button>
        </div>

        <footer className="mt-8 text-center text-muted-foreground text-xs">
          {t.poweredBy}
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-[#FEE2E2] rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-cabin-red" />
        </div>

        <h1 className="text-2xl font-bold text-cabin-navy mb-3">
          {t.sosTitle}
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          {t.sosConfirmMessage}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleConfirm}
            className="w-full bg-cabin-red text-[#FFFFFF] font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <AlertTriangle className="w-5 h-5" />
            {t.sosConfirm}
          </button>
          <button
            onClick={onCancel}
            className="w-full bg-muted text-cabin-navy font-semibold py-3.5 rounded-xl hover:bg-border transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  )
}
