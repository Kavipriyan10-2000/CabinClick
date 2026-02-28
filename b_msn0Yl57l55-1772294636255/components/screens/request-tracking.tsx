"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Droplet, Clock, Check, Plane, Package } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { CabinHeader } from "@/components/cabin-header"

type RequestTrackingProps = {
  onBack: () => void
  itemName?: string
}

const STEP_KEYS = ["submitted", "acknowledged", "onTheWay", "delivered"] as const
type StepKey = typeof STEP_KEYS[number]

// Auto-advance: submitted → acknowledged → onTheWay → delivered
const STEP_DELAYS = [0, 4000, 9000, 16000] // ms after mount

export function RequestTracking({ onBack, itemName = "Water" }: RequestTrackingProps) {
  const { t } = useLanguage()
  const [currentStep, setCurrentStep] = useState(1) // 0-indexed; start at acknowledged
  const [countdown, setCountdown] = useState(5) // minutes remaining
  const [pulse, setPulse] = useState(false)

  const stepLabels: Record<StepKey, string> = {
    submitted: t.submitted,
    acknowledged: t.acknowledged,
    onTheWay: t.onTheWay,
    delivered: t.delivered,
  }

  // Auto-advance through steps
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    STEP_DELAYS.forEach((delay, idx) => {
      if (idx <= currentStep) return
      timers.push(
        setTimeout(() => {
          setCurrentStep(idx)
          setPulse(true)
          setTimeout(() => setPulse(false), 600)
        }, delay)
      )
    })
    return () => timers.forEach(clearTimeout)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Countdown timer (counts down from 5 min)
  useEffect(() => {
    if (currentStep >= STEP_KEYS.length - 1) return
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 60000)
    return () => clearInterval(interval)
  }, [currentStep])

  const progressPct = (currentStep / (STEP_KEYS.length - 1)) * 100
  const isDelivered = currentStep === STEP_KEYS.length - 1

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CabinHeader showBack onBack={onBack} showUser />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Progress bar */}
        <div className="w-full max-w-lg mb-8">
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-cabin-navy h-2 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Request card */}
        <div className="w-full max-w-lg bg-card rounded-2xl shadow-sm border border-border p-8 text-center">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-500 ${
              isDelivered ? "bg-[#D1FAE5]" : "bg-[#E8F0FE]"
            } ${pulse ? "scale-110" : "scale-100"}`}
          >
            {isDelivered ? (
              <Check className="w-8 h-8 text-cabin-success" />
            ) : (
              <Droplet className="w-8 h-8 text-cabin-navy" />
            )}
          </div>

          <h1 className="text-2xl font-bold text-cabin-navy mb-1 capitalize">{itemName}</h1>
          <p className="text-muted-foreground text-sm mb-4">
            {t.requestNumber} #8392 {" \u2022 "}
            <span className={`font-semibold ${isDelivered ? "text-cabin-success" : "text-[#3B82F6]"}`}>
              {isDelivered ? t.delivered : t.inProgress}
            </span>
          </p>

          <h2 className="text-lg font-bold text-cabin-navy mb-3">
            {isDelivered ? "🎉 " + t.delivered + "!" : t.onItsWay}
          </h2>

          {!isDelivered && (
            <div className="inline-flex items-center gap-2 bg-[#FFF9E6] rounded-full px-4 py-2 mb-8">
              <Clock className="w-4 h-4 text-cabin-gold" />
              <span className="text-cabin-gold text-sm font-medium">
                {countdown > 1 ? `~${countdown} min` : "< 1 min"} {t.estimatedTime}
              </span>
            </div>
          )}

          {isDelivered && (
            <div className="inline-flex items-center gap-2 bg-[#D1FAE5] rounded-full px-4 py-2 mb-8">
              <Package className="w-4 h-4 text-cabin-success" />
              <span className="text-cabin-success text-sm font-medium">Enjoy your {itemName}!</span>
            </div>
          )}

          {/* Status timeline */}
          <div className="flex items-start justify-between px-2">
            {STEP_KEYS.map((key, i) => {
              const completed = i < currentStep
              const active = i === currentStep
              return (
                <div key={key} className="flex flex-col items-center flex-1">
                  <div className="flex items-center w-full">
                    {i > 0 && (
                      <div
                        className={`flex-1 h-0.5 transition-all duration-500 ${
                          i <= currentStep ? "bg-cabin-navy" : "bg-muted"
                        }`}
                      />
                    )}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                        completed
                          ? "bg-cabin-navy"
                          : active
                          ? `bg-cabin-gold ${pulse ? "scale-125" : "scale-100"}`
                          : "bg-muted"
                      }`}
                    >
                      {completed ? (
                        <Check className="w-4 h-4 text-[#FFFFFF]" />
                      ) : active ? (
                        <Plane className="w-4 h-4 text-cabin-navy" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                      )}
                    </div>
                    {i < STEP_KEYS.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 transition-all duration-500 ${
                          i + 1 <= currentStep ? "bg-cabin-navy" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium text-center transition-colors ${
                      completed || active ? "text-cabin-navy" : "text-muted-foreground"
                    }`}
                  >
                    {stepLabels[key]}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <button
          onClick={onBack}
          className="mt-6 flex items-center gap-2 text-cabin-navy font-medium text-sm border border-cabin-navy rounded-xl px-6 py-3 hover:bg-cabin-navy hover:text-[#FFFFFF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.backToHome}
        </button>
      </main>

      <footer className="py-4 text-center text-muted-foreground text-xs">
        {t.poweredBy}
      </footer>
    </div>
  )
}
