"use client"

import { useState } from "react"
import { Check, MapPin, Package, ChevronDown, ChevronUp, Bell } from "lucide-react"
import type { CrewRequest } from "@/lib/crew-types"
import { CATEGORY_ICONS, LANGUAGE_FLAGS } from "@/lib/crew-types"

type TripStop = {
  request: CrewRequest
  pickupItem: string
  galleyNote?: string
  delivered: boolean
}

type C3TripPlanProps = {
  requests: CrewRequest[]
  newRequests?: CrewRequest[]
  onDelivered: (requestId: string) => void
  onComplete: () => void
  onAddRequest: (req: CrewRequest) => void
}

function sortByRow(reqs: CrewRequest[]): CrewRequest[] {
  return [...reqs].sort((a, b) => {
    const rowA = parseInt(a.seat)
    const rowB = parseInt(b.seat)
    return rowA - rowB
  })
}

function buildPickupList(reqs: CrewRequest[]): Record<string, number> {
  const pickup: Record<string, number> = {}
  for (const r of reqs) {
    const key = r.translatedText.split(" ×")[0].split("(")[0].trim()
    pickup[key] = (pickup[key] ?? 0) + (r.quantity ?? 1)
  }
  return pickup
}

export function C3TripPlan({ requests, newRequests = [], onDelivered, onComplete, onAddRequest }: C3TripPlanProps) {
  const [stops, setStops] = useState<TripStop[]>(() =>
    sortByRow(requests).map((r) => ({
      request: r,
      pickupItem: r.translatedText,
      delivered: r.status === "delivered",
    }))
  )
  const [showBanner, setShowBanner] = useState(newRequests.length > 0)
  const [expandedGalley, setExpandedGalley] = useState(false)

  const pickupList   = buildPickupList(requests)
  const deliveredCnt = stops.filter((s) => s.delivered).length
  const totalCnt     = stops.length
  const progressPct  = totalCnt > 0 ? (deliveredCnt / totalCnt) * 100 : 0
  const allDone      = deliveredCnt === totalCnt

  function toggleDelivered(idx: number) {
    setStops((prev) =>
      prev.map((s, i) => {
        if (i !== idx) return s
        const newDelivered = !s.delivered
        if (newDelivered) onDelivered(s.request.id)
        return { ...s, delivered: newDelivered }
      })
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* New request banner */}
      {showBanner && newRequests.length > 0 && (
        <div className="mx-4 mt-3 bg-amber-50 border border-amber-300 rounded-2xl p-3 flex items-center gap-3">
          <Bell className="w-5 h-5 text-amber-600 flex-shrink-0 animate-bounce" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-amber-800">New request received mid-trip</p>
            {newRequests.map((r) => (
              <p key={r.id} className="text-xs text-amber-700 truncate">
                Seat {r.seat}: {r.translatedText}
              </p>
            ))}
          </div>
          <button
            onClick={() => {
              newRequests.forEach(onAddRequest)
              setShowBanner(false)
              setStops((prev) => [
                ...prev,
                ...newRequests.map((r) => ({
                  request: r, pickupItem: r.translatedText, delivered: false,
                })),
              ])
            }}
            className="px-3 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-lg whitespace-nowrap"
          >
            Add to trip
          </button>
          <button onClick={() => setShowBanner(false)} className="text-amber-500 text-xs">Skip</button>
        </div>
      )}

      {/* Progress */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-cabin-navy">Trip Progress</span>
          <span className="text-xs font-black text-cabin-gold">{deliveredCnt}/{totalCnt}</span>
        </div>
        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-cabin-gold rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Galley pickup list (collapsible) */}
      <div className="mx-4 mb-3 bg-card border border-border rounded-2xl overflow-hidden">
        <button
          onClick={() => setExpandedGalley(!expandedGalley)}
          className="w-full flex items-center justify-between px-4 py-3"
        >
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-cabin-navy" />
            <span className="text-sm font-bold text-cabin-navy">Galley Pickup List</span>
            <span className="bg-cabin-gold text-cabin-navy text-xs font-black rounded-full w-5 h-5 flex items-center justify-center">
              {Object.keys(pickupList).length}
            </span>
          </div>
          {expandedGalley ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
        {expandedGalley && (
          <div className="px-4 pb-3 space-y-1 border-t border-border">
            {Object.entries(pickupList).map(([item, qty]) => (
              <div key={item} className="flex items-center justify-between text-sm">
                <span className="text-cabin-navy">{item}</span>
                <span className="font-bold text-cabin-gold bg-cabin-navy px-2 py-0.5 rounded-full text-xs">
                  ×{qty}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delivery sequence */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="w-4 h-4 text-cabin-navy" />
          <span className="text-xs font-bold text-cabin-navy uppercase tracking-wide">Delivery Sequence</span>
        </div>

        {stops.map((stop, idx) => {
          const emoji = CATEGORY_ICONS[stop.request.category] ?? "📋"
          const flag  = LANGUAGE_FLAGS[stop.request.originalLanguage] ?? "🌐"
          const isNext = !stop.delivered && stops.slice(0, idx).every((s) => s.delivered)

          return (
            <div
              key={stop.request.id}
              className={`rounded-2xl border-2 p-3 flex items-center gap-3 transition-all ${
                stop.delivered
                  ? "border-green-200 bg-green-50 opacity-70"
                  : isNext
                  ? "border-cabin-gold bg-cabin-gold/5 shadow-sm"
                  : "border-border bg-card"
              }`}
            >
              {/* Stop number / check */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 ${
                stop.delivered
                  ? "bg-green-500 text-white"
                  : isNext
                  ? "bg-cabin-gold text-cabin-navy"
                  : "bg-muted text-muted-foreground"
              }`}>
                {stop.delivered ? <Check className="w-4 h-4" /> : idx + 1}
              </div>

              {/* Seat */}
              <div className="w-12 text-center">
                <div className="font-black text-cabin-navy text-base">{stop.request.seat}</div>
                <div className="text-[10px] text-muted-foreground">Zone {stop.request.zone}</div>
              </div>

              {/* Item */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{emoji}</span>
                  <span className={`text-sm font-semibold truncate ${stop.delivered ? "line-through text-muted-foreground" : "text-cabin-navy"}`}>
                    {stop.request.translatedText}
                  </span>
                </div>
                {stop.request.notes && (
                  <p className="text-xs text-amber-600 italic truncate">⚠️ {stop.request.notes}</p>
                )}
                <span className="text-[10px] text-muted-foreground">{flag} {stop.request.originalLanguage}</span>
              </div>

              {/* Toggle delivered */}
              <button
                onClick={() => toggleDelivered(idx)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  stop.delivered
                    ? "bg-green-500 text-white"
                    : "bg-cabin-navy text-white hover:opacity-90"
                }`}
              >
                {stop.delivered ? "Done ✓" : "Deliver"}
              </button>
            </div>
          )
        })}
      </div>

      {/* Complete trip */}
      {allDone && (
        <div className="px-4 pb-4 pt-2 border-t border-border">
          <button
            onClick={onComplete}
            className="w-full bg-cabin-success text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md"
          >
            <Check className="w-5 h-5" />
            TRIP COMPLETE — Return to Queue
          </button>
        </div>
      )}
    </div>
  )
}
