export type BackendLanguage = "en" | "de"

export type FlightRegistrationRequest = {
  flight_number: string
  origin: string
  destination: string
  departure_date: string
}

export type FlightRegistrationResponse = {
  flight_id: string
  flight_number: string
  origin: string
  destination: string
  departure_date: string
  status: string
  created_at: string
  message: string
}

export type PassengerSeatAccessResponse = {
  access_id: string
  status: string
  created_at: string
  flight_number: string
  seat_number: string
  cabin_section: string | null
  available_actions: string[]
  message: string
}

export type PassengerRequestRecord = {
  request_id: string
  flight_id: string
  seat_number: string
  category: string
  source: string
  status: "submitted" | "being_served" | "completed" | "cancelled"
  request_text: string
  source_language: BackendLanguage
  translated_text: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export type PassengerRequestListResponse = {
  flight_id: string
  seat_number: string
  items: PassengerRequestRecord[]
  message: string
}

export type CrewAccessResponse = {
  access_id: string
  flight_id: string
  flight_number: string
  crew_member_id: string
  crew_member_code: string
  device_id: string
  status: string
  created_at: string
  message: string
}

export type CrewMemberSummary = {
  crew_member_id: string
  full_name: string
  role: string
  device_id: string | null
  assigned_zone: string | null
  preferred_language: BackendLanguage
}

export type CrewMemberListResponse = {
  flight_id: string
  flight_number: string
  members: CrewMemberSummary[]
  message: string
}

export type CrewQueueRequestRecord = {
  request_id: string
  flight_id: string
  seat_number: string
  category: string
  request_text: string
  display_text: string
  language: BackendLanguage
  created_at: string
}

export type CrewQueueRequestListResponse = {
  flight_id: string
  flight_number: string
  items: CrewQueueRequestRecord[]
  message: string
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, "") || ""
const USE_MOCK_BACKEND = API_BASE_URL.length === 0

type MockState = {
  flight: FlightRegistrationRequest
  flightId: string
  crewMembers: CrewMemberSummary[]
  requestsBySeat: Map<string, PassengerRequestRecord[]>
  requestCounter: number
  accessCounter: number
}

const mockState: MockState = {
  flight: {
    flight_number: "LH441",
    origin: "Frankfurt",
    destination: "New York",
    departure_date: new Date().toISOString().slice(0, 10),
  },
  flightId: "flight-demo",
  crewMembers: [],
  requestsBySeat: new Map(),
  requestCounter: 0,
  accessCounter: 0,
}

function nowIso() {
  return new Date().toISOString()
}

function getMockFlight() {
  return mockState.flight
}

function setMockFlight(payload: FlightRegistrationRequest) {
  mockState.flight = payload
}

function getMockSeatRequests(seatNumber: string) {
  return mockState.requestsBySeat.get(seatNumber) || []
}

function setMockSeatRequests(
  seatNumber: string,
  requests: PassengerRequestRecord[],
) {
  mockState.requestsBySeat.set(seatNumber, requests)
}

function getAllMockRequests() {
  const allRequests: PassengerRequestRecord[] = []
  for (const requests of mockState.requestsBySeat.values()) {
    allRequests.push(...requests)
  }
  return allRequests
}

function sortByNewest<T extends { created_at: string }>(items: T[]) {
  return [...items].sort((a, b) => b.created_at.localeCompare(a.created_at))
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError(
      "Missing NEXT_PUBLIC_API_BASE_URL. Configure backend URL or run in demo mode.",
      500,
    )
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  })

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`

    try {
      const body = await response.json()
      if (typeof body?.detail === "string") {
        message = body.detail
      } else if (typeof body?.message === "string") {
        message = body.message
      }
    } catch {
      // Ignore non-JSON error bodies.
    }

    throw new ApiError(message, response.status)
  }

  return response.json() as Promise<T>
}

export function toBackendLanguage(locale: string): BackendLanguage {
  return locale === "de" ? "de" : "en"
}

export async function getCrewMembers() {
  if (USE_MOCK_BACKEND) {
    const flight = getMockFlight()
    return {
      flight_id: mockState.flightId,
      flight_number: flight.flight_number,
      members: mockState.crewMembers,
      message: "Demo crew members loaded.",
    } satisfies CrewMemberListResponse
  }

  return apiFetch<CrewMemberListResponse>("/crew/members")
}

export async function registerFlight(payload: FlightRegistrationRequest) {
  if (USE_MOCK_BACKEND) {
    setMockFlight(payload)
    return {
      flight_id: mockState.flightId,
      flight_number: payload.flight_number,
      origin: payload.origin,
      destination: payload.destination,
      departure_date: payload.departure_date,
      status: "active",
      created_at: nowIso(),
      message: "Demo flight registered.",
    } satisfies FlightRegistrationResponse
  }

  return apiFetch<FlightRegistrationResponse>("/flights/register", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function ensureFlightRegistration(
  payload: FlightRegistrationRequest,
) {
  if (USE_MOCK_BACKEND) {
    return registerFlight(payload)
  }

  try {
    const activeFlight = await getCrewMembers()
    if (activeFlight.flight_number === payload.flight_number) {
      return activeFlight
    }
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 404) {
      throw error
    }
  }

  return registerFlight(payload)
}

export async function createSeatAccess(
  seatNumber: string,
  payload: {
    qr_token: string
    device_label?: string
    preferred_language: BackendLanguage
    metadata?: Record<string, unknown>
  },
) {
  if (USE_MOCK_BACKEND) {
    const flight = getMockFlight()
    mockState.accessCounter += 1
    return {
      access_id: `access-${mockState.accessCounter}`,
      status: "active",
      created_at: nowIso(),
      flight_number: flight.flight_number,
      seat_number: seatNumber,
      cabin_section: null,
      available_actions: ["request_service", "sos", "feedback"],
      message: "Demo seat access created.",
    } satisfies PassengerSeatAccessResponse
  }

  return apiFetch<PassengerSeatAccessResponse>(`/seats/${seatNumber}/access`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function listPassengerRequests(seatNumber: string) {
  if (USE_MOCK_BACKEND) {
    return {
      flight_id: mockState.flightId,
      seat_number: seatNumber,
      items: sortByNewest(getMockSeatRequests(seatNumber)),
      message: "Demo passenger requests loaded.",
    } satisfies PassengerRequestListResponse
  }

  return apiFetch<PassengerRequestListResponse>(`/seats/${seatNumber}/requests`)
}

export async function createPassengerRequest(
  seatNumber: string,
  payload: {
    category: string
    request_text: string
    source: "typed" | "speech" | "quick_action"
    source_language: BackendLanguage
    metadata?: Record<string, unknown>
  },
) {
  if (USE_MOCK_BACKEND) {
    mockState.requestCounter += 1
    const createdAt = nowIso()
    const request: PassengerRequestRecord = {
      request_id: `req-${mockState.requestCounter}`,
      flight_id: mockState.flightId,
      seat_number: seatNumber,
      category: payload.category,
      source: payload.source,
      status: "submitted",
      request_text: payload.request_text,
      source_language: payload.source_language,
      translated_text: payload.request_text,
      metadata: payload.metadata || {},
      created_at: createdAt,
      updated_at: createdAt,
    }

    setMockSeatRequests(seatNumber, [request, ...getMockSeatRequests(seatNumber)])
    return request
  }

  return apiFetch<PassengerRequestRecord>(`/seats/${seatNumber}/requests`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function createCrewAccess(payload: {
  crew_member_code: string
  device_id: string
  full_name?: string
  role: "purser" | "lead" | "attendant"
  assigned_zone?: string
  preferred_language: BackendLanguage
}) {
  if (USE_MOCK_BACKEND) {
    const existingMemberIndex = mockState.crewMembers.findIndex(
      (member) => member.crew_member_id === `crew-${payload.crew_member_code}`,
    )

    const crewMember: CrewMemberSummary = {
      crew_member_id: `crew-${payload.crew_member_code}`,
      full_name: payload.full_name || "Cabin Crew Web",
      role: payload.role,
      device_id: payload.device_id,
      assigned_zone: payload.assigned_zone || null,
      preferred_language: payload.preferred_language,
    }

    if (existingMemberIndex >= 0) {
      mockState.crewMembers[existingMemberIndex] = crewMember
    } else {
      mockState.crewMembers.push(crewMember)
    }

    return {
      access_id: `crew-access-${payload.crew_member_code}`,
      flight_id: mockState.flightId,
      flight_number: getMockFlight().flight_number,
      crew_member_id: crewMember.crew_member_id,
      crew_member_code: payload.crew_member_code,
      device_id: payload.device_id,
      status: "active",
      created_at: nowIso(),
      message: "Demo crew access created.",
    } satisfies CrewAccessResponse
  }

  return apiFetch<CrewAccessResponse>("/crew/access", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function getCrewRequestQueue(params: {
  crew_member_code?: string
  preferred_language?: BackendLanguage
}) {
  if (USE_MOCK_BACKEND) {
    const items = sortByNewest(getAllMockRequests()).map(
      (request) =>
        ({
          request_id: request.request_id,
          flight_id: request.flight_id,
          seat_number: request.seat_number,
          category: request.category,
          request_text: request.request_text,
          display_text: request.translated_text || request.request_text,
          language: request.source_language,
          created_at: request.created_at,
        }) satisfies CrewQueueRequestRecord,
    )

    return {
      flight_id: mockState.flightId,
      flight_number: getMockFlight().flight_number,
      items,
      message: "Demo request queue loaded.",
    } satisfies CrewQueueRequestListResponse
  }

  const searchParams = new URLSearchParams()
  if (params.crew_member_code) {
    searchParams.set("crew_member_code", params.crew_member_code)
  }
  if (params.preferred_language) {
    searchParams.set("preferred_language", params.preferred_language)
  }

  const suffix = searchParams.toString()
  return apiFetch<CrewQueueRequestListResponse>(
    `/crew/request-queue${suffix ? `?${suffix}` : ""}`,
  )
}
