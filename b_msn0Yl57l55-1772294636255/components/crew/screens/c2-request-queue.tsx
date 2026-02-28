"use client"

import { useState } from "react"
import { Clock, Check, ChevronRight, Zap, Filter, RefreshCw } from "lucide-react"
import type { CrewRequest, CrewMember } from "@/lib/crew-types"
import { LANGUAGE_FLAGS, CATEGORY_ICONS, minutesAgo, statusColor } from "@/lib/crew-types"

type C2RequestQueueProps = {
  requests: CrewRequest[]
  crew: CrewMember[]
  onAcknowledge: (id: string) => void
  onStartTrip: (zoneRequests: CrewRequest[]) => void
  onSOSClick: (request: CrewRequest) => void
}

const ZONE_TABS = ["All", "Zone A", "Zone B", "Zone C"] as const
type ZoneTab = typeof ZONE_TABS[number]

const STATUS_ORDER: Record<string, number> = {
  sos: 0,
  high: 1,
  pending: 2,
  acknowledged: 3,
  "in-progress": 4,
  delivered: 5,
}

export function C2RequestQueue({
  requests,
  crew,
  onAcknowledge,
  onStartTrip,
  onSOSClick,
}: C2RequestQueueProps) {
  const [activeTab, setActiveTab] = useState<ZoneTab>("All")
  const [showDelivered, setShowDelivered] = useState(false)

  const zoneFilter = activeTab === "All" ? null : activeTab.replace("Zone ", "") as "A" | "B" | "C"

  const filtered = requests
    .filter((r) => {
      if (!zoneFilter) return true
      return r.zone === zoneFilter
    })
    .filter((r) => showDelivered || r.status !== "delivered")
    .sort((a, b) => {
      // SOS always top
      if (a.category === "sos" && b.category !== "sos") return -1
      if (b.category === "sos" && a.category !== "sos") return 1
      // High priority next
      if (a.priority === "high" && b.priority !== "high") return -1
      if (b.priority === "high" && a.priority !== "high") return 1
      // Then by status
      const aOrder = STATUS_ORDER[a.status] ?? 99
      const bOrder = STATUS_ORDER[b.status] ?? 99
      if (aOrder !== bOrder) return aOrder - bOrder
      // Then oldest first
      return a.submittedAt.getTime() - b.submittedAt.getTime()
    })

  const pending    = requests.filter((r) => r.status === "pending").length
  const inProgress = requests.filter((r) => r.status === "in-progress" || r.status === "acknowledged").length
  const delivered  = requests.filter((r) => r.status === "delivered").length

  const zoneRequests = filtered.filter((r) => r.status === "pending" || r.status === "acknowledged")

  function getCrewName(id?: string) {
    return crew.find((c) => c.id === id)?.name.split(" ")[0] ?? "—"
  }

  return (
    <div className="flex flex-col h-full">
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3 px-4 pt-4 pb-3">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
          <div className="text-2xl font-black text-amber-700">{pending}</div>
          <div className="text-xs text-amber-600 font-semibold mt-0.5">Pending</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
          <div className="text-2xl font-black text-blue-700">{inProgress}</div>
          <div className="text-xs text-blue-600 font-semibold mt-0.5">In Progress</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
          <div className="text-2xl font-black text-green-700">{delivered}</div>
          <div className="text-xs text-green-600 font-semibold mt-0.5">Delivered</div>
        </div>
      </div>

      {/* Zone tabs + filters */}
      <div className="flex items-center justify-between px-4 pb-2">
        <div className="flex gap-1">
          {ZONE_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === tab
                  ? "bg-cabin-navy text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowDelivered(!showDelivered)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            showDelivered ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          {showDelivered ? "Hide Done" : "Show Done"}
        </button>
      </div>

      {/* Request list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Check className="w-10 h-10 mb-3 text-cabin-success" />
            <p className="font-semibold text-cabin-navy">All clear!</p>
            <p className="text-sm">No active requests in this zone</p>
          </div>
        )}

        {filtered.map((req) => {
          const isSOS   = req.category === "sos"
          const isHigh  = req.priority === "high"
          const isDone  = req.status === "delivered"
          const flag    = LANGUAGE_FLAGS[req.originalLanguage] ?? "🌐"
          const emoji   = CATEGORY_ICONS[req.category] ?? "📋"

          return (
            <div
              key={req.id}
              onClick={() => isSOS ? onSOSClick(req) : undefined}
              className={`relative rounded-2xl border-2 p-4 transition-all ${
                isSOS
                  ? "border-red-500 bg-red-50 cursor-pointer hover:bg-red-100 animate-pulse"
                  : isHigh
                  ? "border-amber-400 bg-amber-50"
                  : isDone
                  ? "border-green-200 bg-green-50 opacity-70"
                  : "border-border bg-card hover:border-cabin-navy/30"
              }`}
            >
              {/* Priority badge */}
              {(isSOS || isHigh) && (
                <div className={`absolute -top-2 left-4 px-2 py-0.5 rounded-full text-xs font-black ${
                  isSOS ? "bg-red-600 text-white" : "bg-amber-500 text-white"
                }`}>
                  {isSOS ? "🆘 SOS" : "⚡ PRIORITY"}
                </div>
              )}

              <div className="flex items-start gap-3">
                {/* Seat & emoji */}
                <div className="flex flex-col items-center gap-1 min-w-[52px]">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${
                    isSOS ? "bg-red-600 text-white" : isHigh ? "bg-amber-500 text-white" : "bg-cabin-navy text-cabin-gold"
                  }`}>
                    {req.seat}
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium">Zone {req.zone}</span>
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-base">{emoji}</span>
                    <span className="font-bold text-cabin-navy text-sm truncate">{req.translatedText}</span>
                    {req.quantity && req.quantity > 1 && (
                      <span className="bg-cabin-navy text-cabin-gold text-xs font-black rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                        {req.quantity}
                      </span>
                    )}
                  </div>

                  {req.notes && (
                    <p className="text-xs text-muted-foreground italic mb-1 truncate">Note: {req.notes}</p>
                  )}

                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Language */}
                    <span className="text-xs text-muted-foreground">
                      {flag} {req.originalLanguage}
                    </span>

                    {/* Time */}
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {minutesAgo(req.submittedAt)}
                    </span>

                    {/* Status */}
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusColor(req.status)}`}>
                      {req.status}
                    </span>

                    {/* Assigned */}
                    {req.assignedTo && (
                      <span className="text-xs text-muted-foreground">
                        → {getCrewName(req.assignedTo)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action */}
                <div className="flex flex-col gap-2">
                  {req.status === "pending" && !isSOS && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onAcknowledge(req.id) }}
                      className="px-3 py-2 bg-cabin-navy text-white rounded-xl text-xs font-bold flex items-center gap-1 hover:opacity-90 active:scale-[0.97] transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      ACK
                    </button>
                  )}
                  {isSOS && (
                    <div className="px-3 py-2 bg-red-600 text-white rounded-xl text-xs font-black flex items-center gap-1 animate-bounce">
                      <ChevronRight className="w-3.5 h-3.5" />
                      TAP
                    </div>
                  )}
                  {isDone && (
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Start Trip CTA */}
      {zoneRequests.length > 0 && (
        <div className="px-4 pb-4 pt-2 border-t border-border bg-background">
          <button
            onClick={() => onStartTrip(zoneRequests)}
            className="w-full bg-cabin-gold text-cabin-navy font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition-all shadow-md"
          >
            <Zap className="w-5 h-5" />
            START TRIP — {zoneRequests.length} request{zoneRequests.length !== 1 ? "s" : ""}
            {activeTab !== "All" && ` · ${activeTab}`}
          </button>
        </div>
      )}
    </div>
  )
}
