"use client"

import { useState, useEffect, useCallback } from "react"
import {
  ListOrdered,
  Map,
  Route,
  Bell,
  BarChart3,
  Settings,
  Plane,
  Wifi,
  Clock,
  AlertTriangle,
} from "lucide-react"
import { C1Preflight }              from "@/components/crew/screens/c1-preflight"
import { C2RequestQueue }           from "@/components/crew/screens/c2-request-queue"
import { C3TripPlan }               from "@/components/crew/screens/c3-trip-plan"
import { C4SOSAlert }               from "@/components/crew/screens/c4-sos-alert"
import { C5NotificationComposer }   from "@/components/crew/screens/c5-notification-composer"
import { C6SeatMap }                from "@/components/crew/screens/c6-seat-map"
import { C7PostFlight }             from "@/components/crew/screens/c7-post-flight"
import {
  INITIAL_REQUESTS,
  MOCK_SEATS,
  MOCK_CREW,
  MOCK_FLIGHT,
  type CrewRequest,
  type SeatData,
} from "@/lib/crew-types"

type CrewScreen = "preflight" | "queue" | "trip" | "seatmap" | "compose" | "summary"

const NAV_ITEMS: { id: CrewScreen; icon: React.ElementType; label: string }[] = [
  { id: "queue",    icon: ListOrdered, label: "Requests" },
  { id: "seatmap",  icon: Map,         label: "Seat Map" },
  { id: "trip",     icon: Route,       label: "Trip Plan" },
  { id: "compose",  icon: Bell,        label: "Notify" },
  { id: "summary",  icon: BarChart3,   label: "Summary" },
  { id: "preflight",icon: Settings,    label: "Setup" },
]

function useLiveClock() {
  const [time, setTime] = useState(() => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
  useEffect(() => {
    const iv = setInterval(() => setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })), 10000)
    return () => clearInterval(iv)
  }, [])
  return time
}

export function CrewApp() {
  const [activated, setActivated]       = useState(false)
  const [flightNumber, setFlightNumber] = useState(MOCK_FLIGHT.flightNumber)
  const [screen, setScreen]             = useState<CrewScreen>("queue")
  const [requests, setRequests]         = useState<CrewRequest[]>(INITIAL_REQUESTS)
  const [seats]                         = useState(MOCK_SEATS)
  const [crew]                          = useState(MOCK_CREW)
  const [tripRequests, setTripRequests] = useState<CrewRequest[]>([])
  const [activeSOS, setActiveSOS]       = useState<CrewRequest | null>(null)
  const clock                           = useLiveClock()

  // Simulate incoming SOS after 20s (demo only)
  useEffect(() => {
    if (!activated) return
    const timer = setTimeout(() => {
      const sosReq: CrewRequest = {
        id: "sos-demo",
        seat: "19C",
        zone: "B",
        item: "SOS Emergency",
        category: "sos",
        originalLanguage: "DE",
        originalText: "Ich fühle mich sehr unwohl, mir ist schlecht",
        translatedText: "Feeling very unwell, nauseous",
        status: "pending",
        priority: "sos",
        submittedAt: new Date(),
      }
      setRequests((prev) => [sosReq, ...prev])
      setActiveSOS(sosReq)
    }, 20000)
    return () => clearTimeout(timer)
  }, [activated])

  const handleAcknowledge = useCallback((id: string) => {
    setRequests((prev) =>
      prev.map((r) => r.id === id ? { ...r, status: "acknowledged", acknowledgedAt: new Date() } : r)
    )
  }, [])

  const handleSOSAcknowledge = useCallback((id: string, assignedTo: string) => {
    setRequests((prev) =>
      prev.map((r) => r.id === id ? { ...r, status: "acknowledged", acknowledgedAt: new Date(), assignedTo } : r)
    )
    setActiveSOS(null)
  }, [])

  const handleStartTrip = useCallback((tripReqs: CrewRequest[]) => {
    setTripRequests(tripReqs)
    setScreen("trip")
  }, [])

  const handleDelivered = useCallback((id: string) => {
    setRequests((prev) =>
      prev.map((r) => r.id === id ? { ...r, status: "delivered", deliveredAt: new Date() } : r)
    )
  }, [])

  const handleTripComplete = useCallback(() => {
    setTripRequests([])
    setScreen("queue")
  }, [])

  const handleSeatClick = useCallback((_seat: SeatData) => {
    // Could open a detail panel or jump to the related request
  }, [])

  const pendingCount  = requests.filter((r) => r.status === "pending").length
  const sosCount      = requests.filter((r) => r.category === "sos").length

  // Pre-flight gate
  if (!activated) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-3 bg-cabin-navy border-b border-white/10">
          <div className="flex items-center gap-3">
            <Plane className="w-5 h-5 text-cabin-gold" />
            <span className="font-black text-white text-base">CabinClick <span className="text-cabin-gold">Crew</span></span>
          </div>
          <div className="flex items-center gap-3 text-white/60 text-xs">
            <Wifi className="w-4 h-4" />
            <span>Onboard WiFi</span>
          </div>
        </header>

        <div className="flex-1">
          <C1Preflight onActivate={(fn) => { setFlightNumber(fn); setActivated(true) }} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* SOS Overlay */}
      {activeSOS && (
        <C4SOSAlert
          request={activeSOS}
          crew={crew}
          onAcknowledge={handleSOSAcknowledge}
          onDismiss={() => setActiveSOS(null)}
        />
      )}

      {/* iPad-style header */}
      <header className="flex items-center justify-between px-6 py-2.5 bg-cabin-navy border-b border-white/10 z-10">
        <div className="flex items-center gap-3">
          <Plane className="w-4 h-4 text-cabin-gold" />
          <span className="font-black text-white text-sm">CabinClick <span className="text-cabin-gold">Crew</span></span>
          <div className="h-4 w-px bg-white/20" />
          <span className="text-cabin-gold text-sm font-black">{flightNumber}</span>
          <span className="text-white/60 text-xs">{MOCK_FLIGHT.origin} → {MOCK_FLIGHT.destination}</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Crew avatars */}
          <div className="flex -space-x-2">
            {crew.slice(0, 4).map((c) => (
              <div
                key={c.id}
                title={c.name}
                className={`w-7 h-7 rounded-full border-2 border-cabin-navy flex items-center justify-center text-[10px] font-black text-white ${
                  c.status === "available" ? "bg-cabin-success" :
                  c.status === "serving"   ? "bg-blue-500" :
                  "bg-gray-400"
                }`}
              >
                {c.initials}
              </div>
            ))}
          </div>

          {/* SOS indicator */}
          {sosCount > 0 && (
            <button
              onClick={() => {
                const s = requests.find((r) => r.category === "sos")
                if (s) setActiveSOS(s)
              }}
              className="flex items-center gap-1.5 px-2 py-1 bg-red-600 rounded-lg text-white text-xs font-black animate-pulse"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              SOS
            </button>
          )}

          <div className="flex items-center gap-1.5 text-white/60 text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-bold">{clock}</span>
          </div>

          <div className="flex items-center gap-1.5 text-white/60 text-xs">
            <Wifi className="w-3.5 h-3.5" />
          </div>
        </div>
      </header>

      {/* Main layout: sidebar + content */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar navigation */}
        <nav className="w-20 bg-cabin-navy/95 flex flex-col items-center py-4 gap-1 border-r border-white/5">
          {NAV_ITEMS.map(({ id, icon: Icon, label }) => {
            const isActive = screen === id
            const badge = id === "queue" ? pendingCount : 0

            return (
              <button
                key={id}
                onClick={() => setScreen(id)}
                className={`relative w-14 flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? "bg-cabin-gold/20 text-cabin-gold"
                    : "text-white/50 hover:text-white/80 hover:bg-white/5"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-semibold leading-none">{label}</span>
                {badge > 0 && (
                  <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-cabin-gold text-cabin-navy rounded-full flex items-center justify-center text-[9px] font-black">
                    {badge > 9 ? "9+" : badge}
                  </div>
                )}
              </button>
            )
          })}
        </nav>

        {/* Content area */}
        <main className="flex-1 min-h-0 overflow-hidden bg-background">
          {/* Screen title bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-card">
            <h1 className="font-black text-cabin-navy text-base">
              {screen === "queue"    && "Live Request Queue"}
              {screen === "seatmap"  && "Seat Map Overview"}
              {screen === "trip"     && "Trip Plan"}
              {screen === "compose"  && "Notification Composer"}
              {screen === "summary"  && "Post-Flight Summary"}
              {screen === "preflight"&& "Flight Setup"}
            </h1>
            <div className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
            </div>
          </div>

          {/* Screen content */}
          <div className="h-[calc(100vh-108px)] overflow-hidden">
            {screen === "queue" && (
              <C2RequestQueue
                requests={requests}
                crew={crew}
                onAcknowledge={handleAcknowledge}
                onStartTrip={handleStartTrip}
                onSOSClick={setActiveSOS}
              />
            )}

            {screen === "seatmap" && (
              <C6SeatMap
                seats={seats}
                requests={requests}
                crew={crew}
                onSeatClick={handleSeatClick}
              />
            )}

            {screen === "trip" && (
              <C3TripPlan
                requests={tripRequests.length > 0 ? tripRequests : requests.filter((r) => r.status !== "delivered")}
                onDelivered={handleDelivered}
                onComplete={handleTripComplete}
                onAddRequest={(r) => setRequests((prev) => [...prev, r])}
              />
            )}

            {screen === "compose" && <C5NotificationComposer />}

            {screen === "summary" && (
              <C7PostFlight
                requests={requests}
                crew={crew}
                flightNumber={flightNumber}
                route={`${MOCK_FLIGHT.origin} → ${MOCK_FLIGHT.destination}`}
              />
            )}

            {screen === "preflight" && (
              <C1Preflight onActivate={(fn) => { setFlightNumber(fn); setScreen("queue") }} />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
