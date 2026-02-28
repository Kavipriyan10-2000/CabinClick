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
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000/api/v1"

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
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
  return apiFetch<CrewMemberListResponse>("/crew/members")
}

export async function registerFlight(payload: FlightRegistrationRequest) {
  return apiFetch<FlightRegistrationResponse>("/flights/register", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function ensureFlightRegistration(
  payload: FlightRegistrationRequest,
) {
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
  return apiFetch<PassengerSeatAccessResponse>(`/seats/${seatNumber}/access`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function listPassengerRequests(seatNumber: string) {
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
  return apiFetch<CrewAccessResponse>("/crew/access", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function getCrewRequestQueue(params: {
  crew_member_code?: string
  preferred_language?: BackendLanguage
}) {
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
