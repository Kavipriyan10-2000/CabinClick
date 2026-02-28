"use client"

import { useState } from "react"
import { Mic, Keyboard, Info, Sparkles, Send } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { CabinHeader } from "@/components/cabin-header"

type CustomRequestProps = {
  onBack: () => void
  onConfirm: (requestText: string) => void
  isSubmitting?: boolean
}

export function CustomRequest({
  onBack,
  onConfirm,
  isSubmitting = false,
}: CustomRequestProps) {
  const { t, locale } = useLanguage()
  const [requestText, setRequestText] = useState("")
  const [showInterpreted, setShowInterpreted] = useState(false)
  const [isRecording, setIsRecording] = useState(false)

  const interpretedText =
    '"Could I please have a blanket and a bottle of sparkling water when you are next passing through the cabin?"'

  function handleSubmit() {
    if (requestText.trim()) {
      setShowInterpreted(true)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CabinHeader showBack onBack={onBack} title={t.customRequestTitle} />

      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full flex flex-col">
        {/* Text input area */}
        <div className="bg-card rounded-2xl border border-border p-4 mb-4 flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <textarea
              value={requestText}
              onChange={(e) => {
                setRequestText(e.target.value)
                setShowInterpreted(false)
              }}
              placeholder={t.yourRequestPlaceholder}
              className="flex-1 resize-none text-cabin-navy text-base bg-transparent focus:outline-none min-h-[160px] placeholder:text-muted-foreground"
              aria-label="Enter your request"
            />
            <span className="px-2 py-1 bg-muted rounded text-xs font-bold text-cabin-navy ml-2 flex-shrink-0">
              {locale.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border">
            <button
              className="text-muted-foreground hover:text-cabin-navy transition-colors"
              aria-label="Switch to keyboard"
            >
              <Keyboard className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                setIsRecording(!isRecording)
                if (!isRecording && !requestText) {
                  setRequestText(
                    "Could I please have a blanket and a bottle of sparkling water when you are next passing through the cabin?"
                  )
                  setTimeout(() => setShowInterpreted(true), 500)
                }
              }}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                isRecording ? "bg-cabin-red scale-110" : "bg-cabin-gold hover:scale-105"
              }`}
              aria-label={isRecording ? "Stop recording" : "Start voice recording"}
            >
              <Mic className={`w-6 h-6 ${isRecording ? "text-card" : "text-cabin-navy"}`} />
            </button>
            <div className="w-5" />
          </div>
        </div>

        {/* Interpreted request */}
        {showInterpreted && (
          <div className="bg-[#F0F4F8] rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cabin-navy" />
                <span className="text-cabin-navy font-bold text-xs tracking-wider">
                  {t.interpretedRequest}
                </span>
              </div>
              <button className="text-cabin-navy text-xs font-semibold hover:underline">
                {t.edit}
              </button>
            </div>
            <p className="text-cabin-navy text-sm leading-relaxed mb-4">{interpretedText}</p>
            <button
              onClick={() => onConfirm(requestText.trim())}
              disabled={isSubmitting}
              className="w-full bg-cabin-navy text-card font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              {isSubmitting ? "Submitting..." : t.confirmRequest}
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Send Request button - always visible when text is entered */}
        {!showInterpreted && (
          <button
            onClick={handleSubmit}
            disabled={!requestText.trim() || isSubmitting}
            className="w-full bg-cabin-navy text-card font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed mb-4 flex items-center justify-center gap-2"
          >
            {isSubmitting ? "Submitting..." : t.sendRequest}
            <Send className="w-4 h-4" />
          </button>
        )}

        <div className="mt-auto pt-4 flex items-center justify-center gap-2 text-muted-foreground text-xs">
          <Info className="w-3.5 h-3.5" />
          <span>{t.flightRelatedOnly}</span>
        </div>
      </main>
    </div>
  )
}
