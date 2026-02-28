"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, Phone, UserCheck, X } from "lucide-react"
import type { CrewRequest, CrewMember } from "@/lib/crew-types"
import { LANGUAGE_FLAGS } from "@/lib/crew-types"

type C4SOSAlertProps = {
  request: CrewRequest
  crew: CrewMember[]
  onAcknowledge: (requestId: string, assignedTo: string) => void
  onDismiss: () => void
}

export function C4SOSAlert({ request, crew, onAcknowledge, onDismiss }: C4SOSAlertProps) {
  const [assignedTo, setAssignedTo] = useState<string>("")
  const [pulse, setPulse] = useState(true)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const iv = setInterval(() => {
      setElapsed(Math.floor((Date.now() - request.submittedAt.getTime()) / 1000))
    }, 1000)
    return () => clearInterval(iv)
  }, [request.submittedAt])

  useEffect(() => {
    const iv = setInterval(() => setPulse((p) => !p), 800)
    return () => clearInterval(iv)
  }, [])

  const availableCrew = crew.filter((c) => c.status !== "break")
  const elapsedStr = elapsed < 60 ? `${elapsed}s` : `${Math.floor(elapsed / 60)}m ${elapsed % 60}s`

  const flag = LANGUAGE_FLAGS[request.originalLanguage] ?? "🌐"

  return (
    <div className="fixed inset-0 z-50 bg-red-600 flex flex-col items-center justify-center text-white p-6">
      {/* Pulsing alert icon */}
      <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-all duration-500 ${pulse ? "bg-white/20 scale-110" : "bg-white/10 scale-100"}`}>
        <AlertTriangle className="w-14 h-14 text-white" />
      </div>

      {/* SOS label */}
      <div className="text-xs font-black tracking-[0.4em] text-red-200 uppercase mb-2">
        Emergency Alert
      </div>

      {/* Seat number – huge */}
      <div className="text-8xl font-black tracking-tight mb-1">
        {request.seat}
      </div>
      <div className="text-red-200 text-lg font-medium mb-6">Seat Number</div>

      {/* Divider */}
      <div className="w-16 h-0.5 bg-white/30 mb-6" />

      {/* Message */}
      {request.originalText && (
        <div className="bg-white/10 rounded-2xl px-6 py-4 max-w-md w-full mb-3 text-center">
          <p className="text-xs text-red-200 font-semibold mb-1">
            {flag} Original message ({request.originalLanguage})
          </p>
          <p className="text-white text-sm italic">"{request.originalText}"</p>
        </div>
      )}
      <div className="bg-white/20 rounded-2xl px-6 py-3 max-w-md w-full mb-8 text-center">
        <p className="text-white font-semibold">{request.translatedText}</p>
      </div>

      {/* Elapsed time */}
      <div className="flex items-center gap-2 text-red-200 text-sm mb-8">
        <Phone className="w-4 h-4" />
        <span>Alert active for <span className="font-bold text-white">{elapsedStr}</span></span>
      </div>

      {/* Assign crew */}
      <div className="w-full max-w-md mb-6">
        <label className="block text-red-200 text-xs font-bold uppercase tracking-wide mb-2">
          Assign Crew Member
        </label>
        <select
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-white/50"
        >
          <option value="" className="text-gray-900">Select crew member…</option>
          {availableCrew.map((c) => (
            <option key={c.id} value={c.id} className="text-gray-900">
              {c.name} — Zone {c.zone === "all" ? "Manager" : c.zone}
              {c.status === "serving" ? " (serving)" : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="flex gap-3 w-full max-w-md">
        <button
          onClick={() => onAcknowledge(request.id, assignedTo)}
          disabled={!assignedTo}
          className="flex-1 bg-white text-red-600 font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-lg shadow-lg active:scale-[0.98]"
        >
          <UserCheck className="w-6 h-6" />
          ACKNOWLEDGE
        </button>
        <button
          onClick={onDismiss}
          className="w-14 bg-white/10 border border-white/30 text-white rounded-2xl flex items-center justify-center hover:bg-white/20 transition-colors"
          aria-label="Dismiss (not acknowledge)"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <p className="mt-4 text-red-300 text-xs text-center max-w-sm">
        Dismissing will NOT resolve the alert. The passenger must be attended to physically.
      </p>
    </div>
  )
}
