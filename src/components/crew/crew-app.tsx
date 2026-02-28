"use client"

import { useCallback, useEffect, useState } from "react"
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
import { C1Preflight } from "@/components/crew/screens/c1-preflight"
import { C2RequestQueue } from "@/components/crew/screens/c2-request-queue"
import { C3TripPlan } from "@/components/crew/screens/c3-trip-plan"
import { C4SOSAlert } from "@/components/crew/screens/c4-sos-alert"
import { C5NotificationComposer } from "@/components/crew/screens/c5-notification-composer"
import { C6SeatMap } from "@/components/crew/screens/c6-seat-map"
import { C7PostFlight } from "@/components/crew/screens/c7-post-flight"
import {
  MOCK_FLIGHT,
  MOCK_SEATS,
  MOCK_CREW,
  type CrewRequest,
  type CrewMember,
} from "@/lib/crew-types"
import {
  ApiError,
  MOCK_BACKEND_STORAGE_KEY,
  createCrewAccess,
  ensureFlightRegistration,
  getCrewMembers,
  getCrewRequestQueue,
  isUsingMockBackend,
  toBackendLanguage,
  type CrewMemberSummary,
  type CrewQueueRequestRecord,
} from "@/lib/backend-api"

type CrewScreen =
  | "preflight"
  | "queue"
  | "trip"
  | "seatmap"
  | "compose"
  | "summary"

const NAV_ITEMS: { id: CrewScreen; icon: React.ElementType; label: string }[] = [
  { id: "queue", icon: ListOrdered, label: "Requests" },
  { id: "seatmap", icon: Map, label: "Seat Map" },
  { id: "trip", icon: Route, label: "Trip Plan" },
  { id: "compose", icon: Bell, label: "Notify" },
  { id: "summary", icon: BarChart3, label: "Summary" },
  { id: "preflight", icon: Settings, label: "Setup" },
]

type FlightDraft = {
  flightNumber: string
  route: string
}

type RequestStatusOverride = Record<string, CrewRequest["status"]>

function useLiveClock() {
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  )

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      )
    }, 10000)

    return () => clearInterval(intervalId)
  }, [])

  return time
}

function formatError(error: unknown) {
  if (error instanceof ApiError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return "Crew backend connection failed."
}

function getOrCreateCrewIdentity() {
  const storedCode = window.localStorage.getItem("cabinclick-crew-code")
  const storedDeviceId = window.localStorage.getItem("cabinclick-crew-device-id")

  const crewCode = storedCode || "crew-001"
  const deviceId =
    storedDeviceId || `ipad-web-${Math.random().toString(36).slice(2, 10)}`

  window.localStorage.setItem("cabinclick-crew-code", crewCode)
  window.localStorage.setItem("cabinclick-crew-device-id", deviceId)

  return { crewCode, deviceId }
}

function deriveZone(seatNumber: string): "A" | "B" | "C" {
  const rowNumber = Number.parseInt(seatNumber, 10)
  if (rowNumber >= 1 && rowNumber <= 5) {
    return "A"
  }
  if (rowNumber >= 10 && rowNumber <= 13) {
    return "B"
  }
  return "C"
}

function normalizeCrewRole(role: string): CrewMember["role"] {
  return role === "purser" || role === "lead" ? "manager" : "attendant"
}

function normalizeRequestCategory(category: string): CrewRequest["category"] {
  if (category === "sos") {
    return "sos"
  }
  if (category === "medical") {
    return "medical"
  }
  if (
    category === "drinks" ||
    category === "food" ||
    category === "comfort" ||
    category === "hygiene" ||
    category === "practical"
  ) {
    return category
  }
  return "custom"
}

function mapCrewMembers(members: CrewMemberSummary[]): CrewMember[] {
  if (members.length === 0) {
    return MOCK_CREW
  }

  return members.map((member, index) => {
    const nameParts = member.full_name.split(" ")
    const initials = nameParts
      .slice(0, 2)
      .map((part) => part[0] || "")
      .join("")
      .toUpperCase()

    return {
      id: member.crew_member_id,
      name: member.full_name,
      initials: initials || `C${index + 1}`,
      role: normalizeCrewRole(member.role),
      zone:
        member.assigned_zone === "A" ||
        member.assigned_zone === "B" ||
        member.assigned_zone === "C"
          ? member.assigned_zone
          : "all",
      status: member.device_id ? "available" : "break",
    }
  })
}

function mapQueueRequests(
  items: CrewQueueRequestRecord[],
  statusOverrides: RequestStatusOverride,
): CrewRequest[] {
  return items.map((item) => {
    const category = normalizeRequestCategory(item.category)
    const priority =
      category === "sos" ? "sos" : category === "medical" ? "high" : "normal"

    return {
      id: item.request_id,
      seat: item.seat_number,
      zone: deriveZone(item.seat_number),
      item: item.request_text,
      category,
      originalLanguage: item.language.toUpperCase(),
      translatedText: item.display_text,
      originalText: item.request_text,
      status: statusOverrides[item.request_id] || "pending",
      priority,
      submittedAt: new Date(item.created_at),
    }
  })
}

function parseRoute(route: string) {
  const [origin, destination] = route.split("→").map((value) => value.trim())
  return {
    origin: origin || "Frankfurt",
    destination: destination || "New York",
  }
}

export function CrewApp() {
  const [activated, setActivated] = useState(false)
  const [isActivating, setIsActivating] = useState(false)
  const [crewError, setCrewError] = useState<string | null>(null)
  const [screen, setScreen] = useState<CrewScreen>("queue")
  const [flightDraft, setFlightDraft] = useState<FlightDraft>({
    flightNumber: MOCK_FLIGHT.flightNumber,
    route: `${MOCK_FLIGHT.origin} → ${MOCK_FLIGHT.destination}`,
  })
  const [requests, setRequests] = useState<CrewRequest[]>([])
  const [requestStatusOverrides, setRequestStatusOverrides] =
    useState<RequestStatusOverride>({})
  const [seats] = useState(MOCK_SEATS)
  const [crew, setCrew] = useState<CrewMember[]>(MOCK_CREW)
  const [tripRequests, setTripRequests] = useState<CrewRequest[]>([])
  const [activeSOS, setActiveSOS] = useState<CrewRequest | null>(null)
  const [crewMemberCode, setCrewMemberCode] = useState<string | null>(null)
  const clock = useLiveClock()

  const loadCrewData = useCallback(async () => {
    if (!crewMemberCode) {
      return
    }

    try {
      const [membersResponse, queueResponse] = await Promise.all([
        getCrewMembers(),
        getCrewRequestQueue({
          crew_member_code: crewMemberCode,
          preferred_language: "en",
        }),
      ])

      setCrew(mapCrewMembers(membersResponse.members))
      setRequests(mapQueueRequests(queueResponse.items, requestStatusOverrides))
      setCrewError(null)
    } catch (error) {
      setCrewError(formatError(error))
    }
  }, [crewMemberCode, requestStatusOverrides])

  useEffect(() => {
    if (!activated || !crewMemberCode) {
      return
    }

    void loadCrewData()
    const intervalId = window.setInterval(() => {
      void loadCrewData()
    }, 8000)

    return () => window.clearInterval(intervalId)
  }, [activated, crewMemberCode, loadCrewData])

  useEffect(() => {
    if (!activated || !isUsingMockBackend()) {
      return
    }

    const handleStorageUpdate = (event: StorageEvent) => {
      if (event.key !== MOCK_BACKEND_STORAGE_KEY) {
        return
      }

      void loadCrewData()
    }

    window.addEventListener("storage", handleStorageUpdate)
    return () => window.removeEventListener("storage", handleStorageUpdate)
  }, [activated, loadCrewData])

  useEffect(() => {
    const activeSosRequest =
      requests.find((request) => request.category === "sos") || null
    setActiveSOS(activeSosRequest)
  }, [requests])

  const activateCrewWorkspace = useCallback(
    async ({
      flightNumber,
      route,
    }: {
      flightNumber: string
      route: string
      departureTime: string
    }) => {
      setIsActivating(true)
      setCrewError(null)

      try {
        const { origin, destination } = parseRoute(route)
        const { crewCode, deviceId } = getOrCreateCrewIdentity()

        await ensureFlightRegistration({
          flight_number: flightNumber,
          origin,
          destination,
          departure_date: new Date().toISOString().slice(0, 10),
        })

        await createCrewAccess({
          crew_member_code: crewCode,
          device_id: deviceId,
          full_name: "Cabin Crew Web",
          role: "attendant",
          assigned_zone: "B",
          preferred_language: toBackendLanguage("en"),
        })

        setCrewMemberCode(crewCode)
        setFlightDraft({
          flightNumber,
          route,
        })
        setActivated(true)
        setScreen("queue")
      } catch (error) {
        setCrewError(formatError(error))
        throw error
      } finally {
        setIsActivating(false)
      }
    },
    [],
  )

  const handleAcknowledge = useCallback((requestId: string) => {
    setRequestStatusOverrides((current) => ({
      ...current,
      [requestId]: "acknowledged",
    }))
    setRequests((currentRequests) =>
      currentRequests.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status: "acknowledged",
              acknowledgedAt: new Date(),
            }
          : request,
      ),
    )
  }, [])

  const handleSOSAcknowledge = useCallback((requestId: string, assignedTo: string) => {
    setRequestStatusOverrides((current) => ({
      ...current,
      [requestId]: "acknowledged",
    }))
    setRequests((currentRequests) =>
      currentRequests.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status: "acknowledged",
              acknowledgedAt: new Date(),
              assignedTo,
            }
          : request,
      ),
    )
    setActiveSOS(null)
  }, [])

  const handleStartTrip = useCallback((zoneRequests: CrewRequest[]) => {
    setTripRequests(zoneRequests)
    setScreen("trip")
  }, [])

  const handleDelivered = useCallback((requestId: string) => {
    setRequestStatusOverrides((current) => ({
      ...current,
      [requestId]: "delivered",
    }))
    setRequests((currentRequests) =>
      currentRequests.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status: "delivered",
              deliveredAt: new Date(),
            }
          : request,
      ),
    )
  }, [])

  const handleTripComplete = useCallback(() => {
    setTripRequests([])
    setScreen("queue")
  }, [])

  const handleSeatClick = useCallback(() => {
    // Seat interactions remain visual for now.
  }, [])

  const pendingCount = requests.filter((request) => request.status === "pending").length
  const sosCount = requests.filter((request) => request.category === "sos").length

  if (!activated) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="flex items-center justify-between px-6 py-3 bg-cabin-navy border-b border-white/10">
          <div className="flex items-center gap-3">
            <Plane className="w-5 h-5 text-cabin-gold" />
            <span className="font-black text-white text-base">
              CabinClick <span className="text-cabin-gold">Crew</span>
            </span>
          </div>
          <div className="flex items-center gap-3 text-white/60 text-xs">
            <Wifi className="w-4 h-4" />
            <span>Onboard WiFi</span>
          </div>
        </header>

        <div className="flex-1">
          <C1Preflight
            errorMessage={crewError}
            isSubmitting={isActivating}
            onActivate={(details) => activateCrewWorkspace(details)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {activeSOS && (
        <C4SOSAlert
          request={activeSOS}
          crew={crew}
          onAcknowledge={handleSOSAcknowledge}
          onDismiss={() => setActiveSOS(null)}
        />
      )}

      <header className="flex items-center justify-between px-6 py-2.5 bg-cabin-navy border-b border-white/10 z-10">
        <div className="flex items-center gap-3">
          <Plane className="w-4 h-4 text-cabin-gold" />
          <span className="font-black text-white text-sm">
            CabinClick <span className="text-cabin-gold">Crew</span>
          </span>
          <div className="h-4 w-px bg-white/20" />
          <span className="text-cabin-gold text-sm font-black">
            {flightDraft.flightNumber}
          </span>
          <span className="text-white/60 text-xs">{flightDraft.route}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {crew.slice(0, 4).map((member) => (
              <div
                key={member.id}
                title={member.name}
                className={`w-7 h-7 rounded-full border-2 border-cabin-navy flex items-center justify-center text-[10px] font-black text-white ${
                  member.status === "available"
                    ? "bg-cabin-success"
                    : member.status === "serving"
                      ? "bg-blue-500"
                      : "bg-gray-400"
                }`}
              >
                {member.initials}
              </div>
            ))}
          </div>

          {sosCount > 0 && (
            <button
              onClick={() => {
                const sosRequest = requests.find(
                  (request) => request.category === "sos",
                )
                if (sosRequest) {
                  setActiveSOS(sosRequest)
                }
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

      {crewError && (
        <div className="px-5 pt-4">
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {crewError}
          </div>
        </div>
      )}

      <div className="flex flex-1 min-h-0">
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
                <span className="text-[10px] font-semibold leading-none">
                  {label}
                </span>
                {badge > 0 && (
                  <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-cabin-gold text-cabin-navy rounded-full flex items-center justify-center text-[9px] font-black">
                    {badge > 9 ? "9+" : badge}
                  </div>
                )}
              </button>
            )
          })}
        </nav>

        <main className="flex-1 min-h-0 overflow-hidden bg-background">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-card">
            <h1 className="font-black text-cabin-navy text-base">
              {screen === "queue" && "Live Request Queue"}
              {screen === "seatmap" && "Seat Map Overview"}
              {screen === "trip" && "Trip Plan"}
              {screen === "compose" && "Notification Composer"}
              {screen === "summary" && "Post-Flight Summary"}
              {screen === "preflight" && "Flight Setup"}
            </h1>
            <div className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString([], {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>

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
                requests={
                  tripRequests.length > 0
                    ? tripRequests
                    : requests.filter((request) => request.status !== "delivered")
                }
                onDelivered={handleDelivered}
                onComplete={handleTripComplete}
                onAddRequest={(request) =>
                  setRequests((currentRequests) => [...currentRequests, request])
                }
              />
            )}

            {screen === "compose" && <C5NotificationComposer />}

            {screen === "summary" && (
              <C7PostFlight
                requests={requests}
                crew={crew}
                flightNumber={flightDraft.flightNumber}
                route={flightDraft.route}
              />
            )}

            {screen === "preflight" && (
              <C1Preflight
                errorMessage={crewError}
                isSubmitting={isActivating}
                onActivate={(details) => activateCrewWorkspace(details)}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
