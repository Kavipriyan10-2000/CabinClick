"use client"

import { useState, useEffect, useRef } from "react"
import { AlertTriangle, Check, X, PhoneCall } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

type SOSFlowProps = {
  onCancel: () => void
  onComplete: () => void
  seat?: string
}

export function SOSFlow({ onCancel, onComplete, seat = "14A" }: SOSFlowProps) {
  const { t } = useLanguage()
  const [confirmed, setConfirmed] = useState(false)
  const [holding, setHolding] = useState(false)
  const [holdProgress, setHoldProgress] = useState(0)
  const holdTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const holdStart = useRef<number>(0)
  const HOLD_DURATION = 1500 // ms to hold

  function startHold() {
    setHolding(true)
    holdStart.current = Date.now()
    holdTimer.current = setInterval(() => {
      const elapsed = Date.now() - holdStart.current
      const progress = Math.min((elapsed / HOLD_DURATION) * 100, 100)
      setHoldProgress(progress)
      if (progress >= 100) {
        clearInterval(holdTimer.current!)
        setConfirmed(true)
      }
    }, 16)
  }

  function stopHold() {
    if (holdTimer.current) clearInterval(holdTimer.current)
    setHolding(false)
    setHoldProgress(0)
  }

  useEffect(() => {
    return () => {
      if (holdTimer.current) clearInterval(holdTimer.current)
    }
  }, [])

  if (confirmed) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md bg-card rounded-2xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-[#D1FAE5] rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
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

          <div className="flex items-center justify-center gap-2 bg-[#D1FAE5] rounded-full px-4 py-2 mb-6">
            <PhoneCall className="w-4 h-4 text-cabin-success" />
            <span className="text-cabin-success text-sm font-semibold">Crew notified — ETA 2 min</span>
          </div>

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
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-200 ${
          holding ? "bg-cabin-red scale-110" : "bg-[#FEE2E2]"
        }`}>
          <AlertTriangle className={`w-10 h-10 transition-colors ${holding ? "text-white" : "text-cabin-red"}`} />
        </div>

        <h1 className="text-2xl font-bold text-cabin-navy mb-3">
          {t.sosTitle}
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-2">
          {t.sosConfirmMessage}
        </p>
        <p className="text-xs text-muted-foreground mb-8 font-medium">
          Hold the button to confirm emergency
        </p>

        <div className="flex flex-col gap-3">
          {/* Hold-to-confirm SOS button */}
          <div className="relative overflow-hidden rounded-xl">
            <button
              onMouseDown={startHold}
              onMouseUp={stopHold}
              onMouseLeave={stopHold}
              onTouchStart={startHold}
              onTouchEnd={stopHold}
              className="w-full bg-cabin-red text-[#FFFFFF] font-bold py-4 rounded-xl flex items-center justify-center gap-2 select-none active:opacity-90 relative z-10"
              aria-label="Hold to confirm emergency"
            >
              {/* Progress fill */}
              <div
                className="absolute inset-0 bg-red-800 rounded-xl transition-none origin-left"
                style={{ transform: `scaleX(${holdProgress / 100})` }}
              />
              <AlertTriangle className="w-5 h-5 relative z-10" />
              <span className="relative z-10">
                {holding
                  ? holdProgress < 50
                    ? "Hold..."
                    : "Almost..."
                  : t.sosConfirm}
              </span>
            </button>
          </div>

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
