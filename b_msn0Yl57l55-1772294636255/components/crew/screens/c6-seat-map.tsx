"use client"

import { useState } from "react"
import type { SeatData, CrewRequest, CrewMember } from "@/lib/crew-types"
import { seatStatusColor, minutesAgo } from "@/lib/crew-types"

type C6SeatMapProps = {
  seats: SeatData[]
  requests: CrewRequest[]
  crew: CrewMember[]
  onSeatClick: (seat: SeatData) => void
}

const ZONE_COLORS = {
  A: "border-purple-300 bg-purple-50",
  B: "border-blue-300 bg-blue-50",
  C: "border-emerald-300 bg-emerald-50",
}

const STATUS_LEGEND = [
  { status: "empty",     label: "Empty",          color: "bg-gray-100 border-gray-200" },
  { status: "occupied",  label: "Occupied",        color: "bg-white border-gray-300" },
  { status: "pending",   label: "Has Request",      color: "bg-amber-400 border-amber-500" },
  { status: "serving",   label: "Being Served",     color: "bg-blue-500 border-blue-600" },
  { status: "delivered", label: "Delivered",        color: "bg-green-400 border-green-500" },
  { status: "sos",       label: "SOS",             color: "bg-red-500 border-red-600" },
]

export function C6SeatMap({ seats, requests, crew, onSeatClick }: C6SeatMapProps) {
  const [selectedSeat, setSelectedSeat] = useState<SeatData | null>(null)

  // Group seats by zone then by row
  const zoneSeats: Record<"A" | "B" | "C", SeatData[]> = { A: [], B: [], C: [] }
  for (const seat of seats) zoneSeats[seat.zone].push(seat)

  // Stats per zone
  function zoneStats(zone: "A" | "B" | "C") {
    const zs = zoneSeats[zone]
    return {
      total:     zs.length,
      occupied:  zs.filter((s) => s.status !== "empty").length,
      pending:   zs.filter((s) => s.status === "pending").length,
      serving:   zs.filter((s) => s.status === "serving").length,
      delivered: zs.filter((s) => s.status === "delivered").length,
      sos:       zs.filter((s) => s.status === "sos").length,
    }
  }

  function handleSeatClick(seat: SeatData) {
    setSelectedSeat((prev) => (prev?.id === seat.id ? null : seat))
    onSeatClick(seat)
  }

  function getRequest(seat: SeatData): CrewRequest | undefined {
    return requests.find((r) => r.id === seat.requestId)
  }

  function renderZone(zone: "A" | "B" | "C") {
    const zs      = zoneSeats[zone]
    const rows    = [...new Set(zs.map((s) => s.row))].sort((a, b) => a - b)
    const cols    = [...new Set(zs.map((s) => s.col))].sort()
    const stats   = zoneStats(zone)
    const crewInZone = crew.filter((c) => c.zone === zone || c.zone === "all")

    const zoneLabelMap = { A: "Zone A – Business", B: "Zone B – Economy Front", C: "Zone C – Economy Rear" }

    return (
      <div key={zone} className={`rounded-2xl border-2 ${ZONE_COLORS[zone]} p-4 mb-4`}>
        {/* Zone header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-black text-cabin-navy">{zoneLabelMap[zone]}</h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
              <span>{stats.occupied}/{stats.total} seated</span>
              {stats.pending   > 0 && <span className="text-amber-600 font-bold">⏳ {stats.pending} pending</span>}
              {stats.serving   > 0 && <span className="text-blue-600 font-bold">🚶 {stats.serving} serving</span>}
              {stats.delivered > 0 && <span className="text-green-600 font-bold">✓ {stats.delivered} done</span>}
              {stats.sos       > 0 && <span className="text-red-600 font-bold animate-pulse">🆘 SOS!</span>}
            </div>
          </div>
          <div className="flex -space-x-2">
            {crewInZone.map((c) => (
              <div
                key={c.id}
                title={`${c.name} (${c.status})`}
                className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-black ${
                  c.status === "available" ? "bg-cabin-success" :
                  c.status === "serving"   ? "bg-blue-500" :
                  "bg-gray-400"
                }`}
              >
                {c.initials}
              </div>
            ))}
          </div>
        </div>

        {/* Seat grid */}
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Column headers */}
            <div className="flex items-center mb-1 pl-8">
              {cols.map((col, i) => {
                // Add aisle gap between C and D
                const isAisle = zone === "A" ? col === "C" : col === "C"
                return (
                  <div key={col} className="flex items-center">
                    {isAisle && <div className="w-3" />}
                    <div className="w-9 text-center text-xs font-bold text-muted-foreground">{col}</div>
                  </div>
                )
              })}
            </div>

            {rows.map((row) => {
              const rowSeats = zs.filter((s) => s.row === row)
              return (
                <div key={row} className="flex items-center mb-1">
                  {/* Row number */}
                  <div className="w-7 text-right pr-1.5 text-xs text-muted-foreground font-medium">{row}</div>
                  {cols.map((col) => {
                    const seat = rowSeats.find((s) => s.col === col)
                    const isAisle = zone === "A" ? col === "C" : col === "C"
                    return (
                      <div key={col} className="flex items-center">
                        {isAisle && <div className="w-3" />}
                        {seat ? (
                          <button
                            onClick={() => handleSeatClick(seat)}
                            title={`${seat.id} – ${seat.status}${seat.passenger ? ` (${seat.passenger})` : ""}`}
                            className={`w-9 h-8 rounded-lg border-2 text-[10px] font-black transition-all hover:scale-110 mx-0.5 ${seatStatusColor(seat.status)} ${
                              selectedSeat?.id === seat.id ? "ring-2 ring-cabin-navy ring-offset-1" : ""
                            }`}
                          >
                            {seat.col}
                          </button>
                        ) : (
                          <div className="w-9 h-8 mx-0.5" />
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const selectedRequest = selectedSeat ? getRequest(selectedSeat) : null

  return (
    <div className="flex gap-4 h-full">
      {/* Main seat map */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Legend */}
        <div className="flex flex-wrap gap-2 mb-4">
          {STATUS_LEGEND.map(({ status, label, color }) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className={`w-5 h-5 rounded border-2 ${color}`} />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        {(["A", "B", "C"] as const).map(renderZone)}
      </div>

      {/* Side panel – seat detail */}
      <div className="w-64 border-l border-border bg-card flex flex-col">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="font-black text-cabin-navy text-sm">Seat Detail</h3>
        </div>

        {selectedSeat ? (
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            <div className="text-center">
              <div className={`w-16 h-16 rounded-2xl border-2 mx-auto flex items-center justify-center font-black text-xl ${seatStatusColor(selectedSeat.status)}`}>
                {selectedSeat.id}
              </div>
              <div className="mt-2 text-xs text-muted-foreground capitalize">{selectedSeat.status}</div>
            </div>

            {selectedSeat.passenger && (
              <div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Passenger</div>
                <p className="text-sm font-semibold text-cabin-navy">{selectedSeat.passenger}</p>
              </div>
            )}

            <div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Class</div>
              <p className="text-sm font-semibold text-cabin-navy capitalize">{selectedSeat.class}</p>
            </div>

            <div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Zone</div>
              <p className="text-sm font-semibold text-cabin-navy">Zone {selectedSeat.zone}</p>
            </div>

            {selectedRequest && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <div className="text-xs font-bold text-amber-800 mb-1 uppercase tracking-wide">Active Request</div>
                <p className="text-sm font-semibold text-cabin-navy">{selectedRequest.translatedText}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-amber-600 capitalize font-medium">{selectedRequest.status}</span>
                  <span className="text-xs text-muted-foreground">{minutesAgo(selectedRequest.submittedAt)}</span>
                </div>
                {selectedRequest.notes && (
                  <p className="text-xs text-muted-foreground mt-1 italic">{selectedRequest.notes}</p>
                )}
              </div>
            )}

            {!selectedRequest && selectedSeat.status === "occupied" && (
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-xs">No active requests</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center px-4">
            <div className="text-muted-foreground">
              <div className="text-3xl mb-2">🪑</div>
              <p className="text-sm font-medium">Tap a seat to view details</p>
            </div>
          </div>
        )}

        {/* Zone summary stats */}
        <div className="border-t border-border px-4 py-3 space-y-2">
          <div className="text-xs font-bold text-cabin-navy uppercase tracking-wide mb-2">Zone Summary</div>
          {(["A", "B", "C"] as const).map((zone) => {
            const s = zoneStats(zone)
            return (
              <div key={zone} className="flex items-center gap-2">
                <span className="text-xs font-bold w-14 text-muted-foreground">Zone {zone}</span>
                <div className="flex-1 h-1.5 bg-muted rounded-full">
                  <div
                    className="h-full bg-cabin-gold rounded-full"
                    style={{ width: s.total > 0 ? `${(s.occupied / s.total) * 100}%` : "0%" }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-10 text-right">{s.occupied}/{s.total}</span>
                {s.pending > 0 && (
                  <span className="w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center text-[9px] font-black text-amber-900">
                    {s.pending}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
