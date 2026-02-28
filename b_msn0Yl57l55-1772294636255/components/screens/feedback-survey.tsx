"use client"

import { useState } from "react"
import {
  Star,
  ArrowRight,
  ArrowLeft,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Plane,
  Check,
} from "lucide-react"
import { useLanguage } from "@/lib/language-context"

type FeedbackSurveyProps = {
  onComplete: () => void
  onBack: () => void
}

export function FeedbackSurvey({ onComplete, onBack }: FeedbackSurveyProps) {
  const { t } = useLanguage()
  const [step, setStep] = useState(1)
  const [rating, setRating] = useState(0)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [responseTime, setResponseTime] = useState<string | null>(null)
  const [feedback, setFeedback] = useState("")
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])

  const totalSteps = 3

  const topics = [
    { key: "checkIn", label: t.checkIn },
    { key: "boarding", label: t.boarding },
    { key: "cabinCrew", label: t.cabinCrew },
    { key: "foodAndDrink", label: t.foodAndDrink },
    { key: "comfort", label: t.comfort },
  ]

  const toggleTopic = (key: string) => {
    setSelectedTopics((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-cabin-navy rounded-lg flex items-center justify-center">
            <Plane className="w-4 h-4 text-card" />
          </div>
          <span className="font-bold text-cabin-navy hidden sm:inline">CabinClick</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Progress bar */}
          <div className="flex items-center gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all ${
                  i < step ? "w-8 bg-cabin-gold" : "w-4 bg-muted"
                }`}
              />
            ))}
          </div>
          <span className="text-xs border border-border rounded-full px-3 py-1 text-cabin-navy font-medium">
            STEP {step} OF {totalSteps}
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Step 1: Star Rating */}
        {step === 1 && (
          <div className="text-center max-w-lg w-full">
            <p className="text-cabin-navy font-bold text-xs tracking-wider mb-3 uppercase">
              In-Flight Experience
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-cabin-navy mb-3 text-balance">
              {t.feedbackStep1Title}
            </h1>
            <p className="text-muted-foreground text-sm mb-8">
              {t.feedbackStep1Subtitle}
            </p>

            <div className="flex items-center justify-center gap-3 mb-8" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                  aria-label={`Rate ${star} stars`}
                  aria-pressed={rating >= star}
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= (hoveredStar || rating)
                        ? "fill-cabin-gold text-cabin-gold"
                        : "text-muted fill-muted"
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={rating === 0}
              className="bg-cabin-navy text-card font-semibold py-3 px-12 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
            >
              {t.next}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Response Time */}
        {step === 2 && (
          <div className="text-center max-w-lg w-full">
            <div className="w-14 h-14 bg-[#E8F0FE] rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-7 h-7 text-cabin-navy" />
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-cabin-navy mb-3 text-balance">
              {t.feedbackStep2Title}
            </h1>
            <p className="text-muted-foreground text-sm mb-8">
              {t.feedbackStep2Subtitle}
            </p>

            <div className="flex gap-4 justify-center mb-8">
              {[
                { key: "yes", label: t.yes, icon: ThumbsUp },
                { key: "mostly", label: t.mostly, icon: Clock },
                { key: "no", label: t.no, icon: ThumbsDown },
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => setResponseTime(option.key)}
                  className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 min-w-[100px] transition-all ${
                    responseTime === option.key
                      ? "border-cabin-navy bg-card shadow-md"
                      : "border-border bg-card hover:border-cabin-navy/30"
                  }`}
                  aria-pressed={responseTime === option.key}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      responseTime === option.key ? "bg-[#E8F0FE]" : "bg-muted"
                    }`}
                  >
                    <option.icon
                      className={`w-5 h-5 ${
                        responseTime === option.key
                          ? "text-cabin-navy"
                          : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <span
                    className={`font-medium text-sm ${
                      responseTime === option.key
                        ? "text-cabin-navy"
                        : "text-muted-foreground"
                    }`}
                  >
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Written Feedback */}
        {step === 3 && (
          <div className="text-center max-w-lg w-full">
            <h1 className="text-2xl md:text-3xl font-bold text-cabin-navy mb-3 text-balance">
              {t.feedbackStep3Title}
            </h1>
            <p className="text-muted-foreground text-sm mb-8">
              {t.feedbackStep3Subtitle}
            </p>

            <div className="bg-card rounded-2xl border border-border p-4 mb-6 text-left">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={t.feedbackPlaceholder}
                className="w-full resize-none text-cabin-navy text-sm bg-transparent focus:outline-none min-h-[120px] placeholder:text-muted-foreground"
                aria-label="Feedback text"
              />
              <p className="text-right text-muted-foreground text-xs">{t.optional}</p>
            </div>

            <div className="text-left mb-6">
              <p className="text-cabin-navy font-bold text-xs tracking-wider mb-3">
                {t.whatWasItAbout}
              </p>
              <div className="flex flex-wrap gap-2">
                {topics.map((topic) => (
                  <button
                    key={topic.key}
                    onClick={() => toggleTopic(topic.key)}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                      selectedTopics.includes(topic.key)
                        ? "border-cabin-navy bg-cabin-navy text-card"
                        : "border-border text-cabin-navy hover:border-cabin-navy/50"
                    }`}
                    aria-pressed={selectedTopics.includes(topic.key)}
                  >
                    {topic.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => onComplete()}
                className="text-cabin-navy font-medium text-sm hover:underline"
              >
                {t.skip}
              </button>
              <button
                onClick={onComplete}
                className="bg-cabin-navy text-card font-semibold py-3 px-8 rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                {t.submitFeedback}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Bottom navigation (steps 2 & 3) */}
      {step > 1 && (
        <div className="px-4 pb-6 flex items-center justify-between max-w-lg mx-auto w-full">
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-2 text-cabin-navy text-sm font-medium hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.previousQuestion}
          </button>
          {step < 3 && (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 2 && !responseTime}
              className="bg-cabin-navy text-card font-semibold py-3 px-8 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {t.next}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      <footer className="py-3 text-center text-muted-foreground text-xs">
        {t.poweredBy}
      </footer>
    </div>
  )
}
