"use client"

import { useState } from "react"
import { Plane, MapPin, Clock, ChevronRight, Check } from "lucide-react"
import type { CrewMember } from "@/lib/crew-types"
import { MOCK_CREW } from "@/lib/crew-types"

type C1PreflightProps = {
  onActivate: (details: {
    flightNumber: string
    route: string
    departureTime: string
  }) => Promise<void> | void
  isSubmitting?: boolean
  errorMessage?: string | null
}

const ZONES = [
  { zone: "A", label: "Business Class", rows: "1–6",   seats: 24,  color: "bg-purple-100 border-purple-300 text-purple-800" },
  { zone: "B", label: "Economy Front",  rows: "10–20",  seats: 66,  color: "bg-blue-100 border-blue-300 text-blue-800" },
  { zone: "C", label: "Economy Rear",   rows: "21–30", seats: 60,  color: "bg-emerald-100 border-emerald-300 text-emerald-800" },
]

const SERVICE_TIMELINE = [
  { time: "T+0:00",  label: "Boarding & welcome drinks" },
  { time: "T+0:30",  label: "Doors close, safety demo" },
  { time: "T+1:00",  label: "First meal service" },
  { time: "T+2:00",  label: "Bar & drinks round" },
  { time: "T+4:00",  label: "Second meal / snacks" },
  { time: "T+6:30",  label: "Pre-landing check & trash" },
  { time: "T+7:30",  label: "Landing preparation" },
]

export function C1Preflight({
  onActivate,
  isSubmitting = false,
  errorMessage = null,
}: C1PreflightProps) {
  const [flightNumber, setFlightNumber] = useState("LH441")
  const [route,        setRoute]        = useState("Frankfurt → New York JFK")
  const [aircraft,     setAircraft]     = useState("Boeing 747-8")
  const [departureTime, setDepartureTime] = useState("08:00")
  const [crew,         setCrew]         = useState<CrewMember[]>(MOCK_CREW)
  const [step,         setStep]         = useState(1) // 1 = flight info, 2 = zones, 3 = crew, 4 = timeline
  const [activated,    setActivated]    = useState(false)

  function toggleCrewStatus(id: string) {
    setCrew((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === "available" ? "break" : "available" }
          : c
      )
    )
  }

  async function handleActivate() {
    await onActivate({
      flightNumber,
      route,
      departureTime,
    })
    setActivated(true)
  }

  if (activated) {
    return (
      <div className="flex flex-col h-full items-center justify-center px-6 text-center">
        <div className="w-20 h-20 bg-cabin-success rounded-full flex items-center justify-center mb-6 animate-bounce">
          <Check className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-black text-cabin-navy mb-2">Flight Activated</h2>
        <p className="text-muted-foreground text-base mb-1">{flightNumber} · {route}</p>
        <p className="text-muted-foreground text-sm">Cabin crew stations ready. Boarding request system live.</p>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* Step sidebar */}
      <div className="w-44 border-r border-border bg-muted/30 p-4 flex flex-col gap-2">
        {[
          { n: 1, label: "Flight Info" },
          { n: 2, label: "Zone Setup" },
          { n: 3, label: "Crew Roster" },
          { n: 4, label: "Timeline" },
        ].map(({ n, label }) => (
          <button
            key={n}
            onClick={() => setStep(n)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left ${
              step === n
                ? "bg-cabin-navy text-white"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
              step === n ? "bg-white text-cabin-navy" : "bg-border text-muted-foreground"
            }`}>{n}</span>
            {label}
          </button>
        ))}

        <div className="mt-auto">
            <button
              onClick={handleActivate}
              disabled={isSubmitting}
              className="w-full bg-cabin-gold text-cabin-navy font-black py-3 rounded-xl flex items-center justify-center gap-1.5 hover:opacity-90 transition-all text-sm"
            >
              <Plane className="w-4 h-4" />
              {isSubmitting ? "Activating..." : "Activate"}
            </button>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {step === 1 && (
          <div className="space-y-4 max-w-lg">
            <h2 className="text-xl font-black text-cabin-navy">Flight Information</h2>

            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Flight Number</label>
              <input
                type="text"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                className="w-full bg-card border border-border rounded-xl px-4 py-3 font-bold text-cabin-navy focus:outline-none focus:ring-2 focus:ring-cabin-gold/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Route</label>
              <input
                type="text"
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-cabin-navy focus:outline-none focus:ring-2 focus:ring-cabin-gold/50"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Aircraft</label>
                <input
                  type="text"
                  value={aircraft}
                  onChange={(e) => setAircraft(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-cabin-navy focus:outline-none focus:ring-2 focus:ring-cabin-gold/50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Departure (local)</label>
                <input
                  type="time"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-cabin-navy focus:outline-none focus:ring-2 focus:ring-cabin-gold/50"
                />
              </div>
            </div>

            {/* Quick summary card */}
            <div className="bg-cabin-navy rounded-2xl p-4 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Plane className="w-5 h-5 text-cabin-gold" />
                <span className="font-black text-cabin-gold">{flightNumber}</span>
              </div>
              <p className="text-white/70 text-sm">{route}</p>
              <p className="text-white/60 text-xs mt-1">{aircraft} · Dep. {departureTime}</p>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-2xl font-black text-cabin-gold">74</div>
                  <div className="text-white/50 text-xs">Total Seats</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-cabin-gold">3</div>
                  <div className="text-white/50 text-xs">Zones</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-cabin-gold">{crew.length}</div>
                  <div className="text-white/50 text-xs">Crew</div>
                </div>
              </div>
            </div>

            <button onClick={() => setStep(2)} className="flex items-center gap-2 text-cabin-navy font-bold text-sm hover:opacity-70 transition-opacity">
              Next: Zone Setup <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 max-w-lg">
            <h2 className="text-xl font-black text-cabin-navy">Zone Assignments</h2>
            <p className="text-sm text-muted-foreground">Each zone is served by designated crew members. Assignments can be adjusted.</p>

            {ZONES.map((z) => (
              <div key={z.zone} className={`rounded-2xl border-2 p-4 ${z.color}`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-black text-base">Zone {z.zone} – {z.label}</div>
                    <div className="text-xs opacity-80">Rows {z.rows} · {z.seats} seats</div>
                  </div>
                  <MapPin className="w-5 h-5 opacity-60" />
                </div>
                <div className="flex gap-2 mt-2">
                  {crew.filter((c) => c.zone === z.zone || c.zone === "all").map((c) => (
                    <div key={c.id} className="bg-white/60 rounded-lg px-2 py-1 text-xs font-bold">
                      {c.name.split(" ")[0]}
                      {c.role === "manager" && " 👑"}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <button onClick={() => setStep(3)} className="flex items-center gap-2 text-cabin-navy font-bold text-sm hover:opacity-70">
              Next: Crew Roster <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 max-w-lg">
            <h2 className="text-xl font-black text-cabin-navy">Crew Roster</h2>
            <p className="text-sm text-muted-foreground">Confirm crew assignments and mark availability.</p>

            <div className="space-y-2">
              {crew.map((c) => (
                <div key={c.id} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-sm text-white ${
                    c.role === "manager" ? "bg-cabin-gold text-cabin-navy" : "bg-cabin-navy"
                  }`}>
                    {c.initials}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-cabin-navy">{c.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {c.role === "manager" ? "🏆 Manager" : "Zone " + c.zone + " Attendant"}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleCrewStatus(c.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      c.status === "available"
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : "bg-gray-100 text-gray-500 border border-gray-300"
                    }`}
                  >
                    {c.status === "available" ? "✓ Available" : "On Break"}
                  </button>
                </div>
              ))}
            </div>

            <button onClick={() => setStep(4)} className="flex items-center gap-2 text-cabin-navy font-bold text-sm hover:opacity-70">
              Next: Service Timeline <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 max-w-lg">
            <h2 className="text-xl font-black text-cabin-navy">Service Timeline</h2>
            <p className="text-sm text-muted-foreground">Scheduled service rounds for {flightNumber}.</p>

            <div className="relative">
              <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-border" />
              {SERVICE_TIMELINE.map((item, i) => (
                <div key={i} className="relative flex items-start gap-4 pb-4">
                  <div className="w-9 h-9 bg-cabin-navy rounded-full flex items-center justify-center z-10 flex-shrink-0">
                    <Clock className="w-4 h-4 text-cabin-gold" />
                  </div>
                  <div className="bg-card border border-border rounded-xl px-4 py-3 flex-1">
                    <div className="font-black text-xs text-cabin-gold mb-0.5">{item.time}</div>
                    <div className="text-sm text-cabin-navy font-semibold">{item.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleActivate}
              disabled={isSubmitting}
              className="w-full bg-cabin-gold text-cabin-navy font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md"
            >
              <Plane className="w-5 h-5" />
              {isSubmitting ? "Activating flight..." : `Activate Flight — ${flightNumber}`}
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 max-w-lg rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  )
}
