"use client"

import { ArrowLeft, Droplet, Clock, Check, Plane } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { CabinHeader } from "@/components/cabin-header"

type RequestTrackingProps = {
  onBack: () => void
  itemName?: string
}

const steps = [
  { key: "submitted", completed: true, active: false },
  { key: "acknowledged", completed: true, active: false },
  { key: "onTheWay", completed: false, active: true },
  { key: "delivered", completed: false, active: false },
]

export function RequestTracking({ onBack, itemName = "Water" }: RequestTrackingProps) {
  const { t } = useLanguage()

  const stepLabels: Record<string, string> = {
    submitted: t.submitted,
    acknowledged: t.acknowledged,
    onTheWay: t.onTheWay,
    delivered: t.delivered,
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CabinHeader showBack onBack={onBack} showUser />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Progress bar */}
        <div className="w-full max-w-lg mb-8">
          <div className="w-full bg-muted rounded-full h-1.5">
            <div
              className="bg-cabin-navy h-1.5 rounded-full transition-all duration-500"
              style={{ width: "66%" }}
            />
          </div>
        </div>

        {/* Request card */}
        <div className="w-full max-w-lg bg-card rounded-2xl shadow-sm border border-border p-8 text-center">
          <div className="w-16 h-16 bg-[#E8F0FE] rounded-full flex items-center justify-center mx-auto mb-4">
            <Droplet className="w-8 h-8 text-cabin-navy" />
          </div>

          <h1 className="text-2xl font-bold text-cabin-navy mb-1 capitalize">{itemName}</h1>
          <p className="text-muted-foreground text-sm mb-4">
            {t.requestNumber} #8392 {" \u2022 "}
            <span className="text-cabin-navy font-semibold">{t.inProgress}</span>
          </p>

          <h2 className="text-lg font-bold text-cabin-navy mb-3">{t.onItsWay}</h2>

          <div className="inline-flex items-center gap-2 bg-[#FFF9E6] rounded-full px-4 py-2 mb-8">
            <Clock className="w-4 h-4 text-cabin-gold" />
            <span className="text-cabin-gold text-sm font-medium">
              {t.estimatedTime}
            </span>
          </div>

          {/* Status timeline */}
          <div className="flex items-start justify-between px-2">
            {steps.map((step, i) => (
              <div key={step.key} className="flex flex-col items-center flex-1">
                <div className="flex items-center w-full">
                  {i > 0 && (
                    <div
                      className={`flex-1 h-0.5 ${
                        step.completed || step.active ? "bg-cabin-navy" : "bg-muted"
                      }`}
                    />
                  )}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      step.completed
                        ? "bg-cabin-navy"
                        : step.active
                        ? "bg-cabin-gold"
                        : "bg-muted"
                    }`}
                  >
                    {step.completed ? (
                      <Check className="w-4 h-4 text-[#FFFFFF]" />
                    ) : step.active ? (
                      <Plane className="w-4 h-4 text-cabin-navy" />
                    ) : (
                      <Check className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 ${
                        steps[i + 1].completed || steps[i + 1].active
                          ? "bg-cabin-navy"
                          : "bg-muted"
                      }`}
                    />
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-medium ${
                    step.completed || step.active
                      ? "text-cabin-navy"
                      : "text-muted-foreground"
                  }`}
                >
                  {stepLabels[step.key]}
                </span>
              </div>
            ))}
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
