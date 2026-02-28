"use client"

import { useState } from "react"
import { Send, Globe, Clock, CheckCircle } from "lucide-react"

type NotificationType = {
  key: string
  emoji: string
  label: string
  message: string
}

const NOTIFICATION_PRESETS: NotificationType[] = [
  { key: "trash",      emoji: "🗑️", label: "Trash Collection",      message: "Cabin crew will be collecting trash shortly. Please prepare any items for disposal." },
  { key: "meal",       emoji: "🍽️", label: "Meal Service",          message: "Meal service will begin shortly. Please return your tray tables to the upright position." },
  { key: "drinks",     emoji: "🥂", label: "Drinks Service",         message: "Drinks service starting now. Our crew will be with you in a few minutes." },
  { key: "turbulence", emoji: "⚠️", label: "Turbulence Warning",     message: "We are expecting mild turbulence. Please return to your seat and fasten your seatbelt." },
  { key: "landing",    emoji: "✈️", label: "Prepare for Landing",    message: "We will begin our descent shortly. Please return your seat to the upright position." },
  { key: "custom",     emoji: "✍️", label: "Custom Message",         message: "" },
]

const TARGETS = [
  { key: "all",    label: "All Passengers" },
  { key: "zone-a", label: "Zone A (Business Elite)" },
  { key: "zone-b", label: "Zone B (Premium Economy)" },
  { key: "zone-c", label: "Zone C (Economy Class)" },
  { key: "seat",   label: "Specific Seat" },
]

const DELAY_OPTIONS = [
  { key: "now",  label: "Send Now",    minutes: 0 },
  { key: "5m",   label: "+5 minutes",  minutes: 5 },
  { key: "10m",  label: "+10 minutes", minutes: 10 },
  { key: "30m",  label: "+30 minutes", minutes: 30 },
]

const LANGUAGES = ["EN", "DE", "FR", "ES", "AR", "ZH", "JA", "TR"]

export function C5NotificationComposer() {
  const [selectedPreset, setSelectedPreset] = useState<string>("meal")
  const [target, setTarget]         = useState("all")
  const [seatTarget, setSeatTarget] = useState("")
  const [delay, setDelay]           = useState("now")
  const [message, setMessage]       = useState(
    NOTIFICATION_PRESETS.find((p) => p.key === "meal")?.message ?? ""
  )
  const [sent, setSent] = useState(false)

  const preset = NOTIFICATION_PRESETS.find((p) => p.key === selectedPreset)

  function handlePresetSelect(key: string) {
    setSelectedPreset(key)
    const p = NOTIFICATION_PRESETS.find((n) => n.key === key)
    if (p && p.key !== "custom") setMessage(p.message)
    if (p?.key === "custom") setMessage("")
  }

  function handleSend() {
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  const targetLabel = TARGETS.find((t) => t.key === target)?.label ?? ""
  const delayObj    = DELAY_OPTIONS.find((d) => d.key === delay)

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-4 pt-4 pb-6 space-y-5 max-w-2xl mx-auto w-full">
        {/* Section: Preset type */}
        <div>
          <label className="block text-xs font-bold text-cabin-navy uppercase tracking-wide mb-2">
            Notification Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {NOTIFICATION_PRESETS.map((p) => (
              <button
                key={p.key}
                onClick={() => handlePresetSelect(p.key)}
                className={`rounded-xl border-2 px-3 py-2.5 flex flex-col items-center gap-1 transition-all ${
                  selectedPreset === p.key
                    ? "border-cabin-gold bg-cabin-gold/10"
                    : "border-border bg-card hover:border-cabin-navy/30"
                }`}
              >
                <span className="text-2xl">{p.emoji}</span>
                <span className={`text-xs font-bold text-center leading-tight ${
                  selectedPreset === p.key ? "text-cabin-navy" : "text-muted-foreground"
                }`}>
                  {p.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Section: Message */}
        <div>
          <label className="block text-xs font-bold text-cabin-navy uppercase tracking-wide mb-2">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            rows={3}
            className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-cabin-navy focus:outline-none focus:ring-2 focus:ring-cabin-gold/50 resize-none"
          />
          <div className="mt-1.5 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-cabin-navy" />
            <p className="text-xs text-muted-foreground">
              Auto-translated to all passenger languages:
            </p>
            <div className="flex gap-1">
              {LANGUAGES.map((lang) => (
                <span key={lang} className="text-xs bg-cabin-navy text-cabin-gold px-1.5 py-0.5 rounded font-bold">
                  {lang}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Section: Target */}
        <div>
          <label className="block text-xs font-bold text-cabin-navy uppercase tracking-wide mb-2">
            Target
          </label>
          <div className="flex flex-wrap gap-2">
            {TARGETS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTarget(t.key)}
                className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${
                  target === t.key
                    ? "border-cabin-navy bg-cabin-navy text-white"
                    : "border-border bg-card text-cabin-navy hover:border-cabin-navy/50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {target === "seat" && (
            <input
              type="text"
              value={seatTarget}
              onChange={(e) => setSeatTarget(e.target.value.toUpperCase())}
              placeholder="e.g. 14A"
              maxLength={4}
              className="mt-2 bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-cabin-navy focus:outline-none focus:ring-2 focus:ring-cabin-gold/50 w-28 font-bold"
            />
          )}
        </div>

        {/* Section: Delay */}
        <div>
          <label className="block text-xs font-bold text-cabin-navy uppercase tracking-wide mb-2">
            <Clock className="inline w-3.5 h-3.5 mr-1" />
            Send Timing
          </label>
          <div className="flex gap-2">
            {DELAY_OPTIONS.map((d) => (
              <button
                key={d.key}
                onClick={() => setDelay(d.key)}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${
                  delay === d.key
                    ? "border-cabin-gold bg-cabin-gold/10 text-cabin-navy"
                    : "border-border bg-card text-muted-foreground hover:border-cabin-navy/30"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="bg-cabin-navy rounded-2xl p-4">
          <div className="text-xs text-white/60 font-semibold mb-2 uppercase tracking-wide">Preview</div>
          <div className="bg-white/10 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{preset?.emoji ?? "📣"}</span>
              <span className="text-white font-bold text-sm">{preset?.label ?? "Notification"}</span>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">{message || "No message entered yet…"}</p>
            <div className="mt-2 flex items-center gap-3 text-white/50 text-xs">
              <span>→ {targetLabel}{target === "seat" && seatTarget ? ` (${seatTarget})` : ""}</span>
              <span>·</span>
              <span>{delayObj?.minutes === 0 ? "Sending now" : `Scheduled in ${delayObj?.minutes}m`}</span>
            </div>
          </div>
        </div>

        {/* Send button */}
        {sent ? (
          <div className="w-full bg-cabin-success text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Notification Sent!
          </div>
        ) : (
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="w-full bg-cabin-gold text-cabin-navy font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99] transition-all shadow-md"
          >
            <Send className="w-5 h-5" />
            Send Notification
          </button>
        )}
      </div>
    </div>
  )
}
