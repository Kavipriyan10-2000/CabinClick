// CabinClick – Crew Side Types & Mock Data

export type RequestCategory =
  | "drinks"
  | "food"
  | "comfort"
  | "hygiene"
  | "practical"
  | "medical"
  | "sos"
  | "custom"

export type RequestStatus = "pending" | "acknowledged" | "in-progress" | "delivered" | "cancelled"
export type RequestPriority = "normal" | "high" | "sos"

export type CrewRequest = {
  id: string
  seat: string
  zone: "A" | "B" | "C"
  item: string
  itemKey?: string
  category: RequestCategory
  originalLanguage: string
  originalText?: string
  translatedText: string
  status: RequestStatus
  priority: RequestPriority
  submittedAt: Date
  acknowledgedAt?: Date
  deliveredAt?: Date
  assignedTo?: string
  quantity?: number
  notes?: string
}

export type SeatStatus = "empty" | "occupied" | "pending" | "serving" | "delivered" | "sos"

export type SeatData = {
  id: string
  row: number
  col: string
  zone: "A" | "B" | "C"
  class: "business" | "economy"
  status: SeatStatus
  passenger?: string
  requestId?: string
}

export type CrewMember = {
  id: string
  name: string
  initials: string
  role: "attendant" | "manager"
  zone: "A" | "B" | "C" | "all"
  status: "available" | "serving" | "break"
  activeRequest?: string
}

export type FlightInfo = {
  flightNumber: string
  origin: string
  destination: string
  departure: string // ISO string
  arrival: string
  aircraft: string
  totalSeats: number
  occupiedSeats: number
  phase: "pre-flight" | "boarding" | "in-flight" | "landing" | "post-flight"
}

// ─── Mock Flight ────────────────────────────────────────────────────────────

export const MOCK_FLIGHT: FlightInfo = {
  flightNumber: "LH441",
  origin: "FRA",
  destination: "JFK",
  departure: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
  arrival: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),   // 6h from now
  aircraft: "Boeing 747-8",
  totalSeats: 99,
  occupiedSeats: 84,
  phase: "in-flight",
}

// ─── Mock Crew ───────────────────────────────────────────────────────────────

export const MOCK_CREW: CrewMember[] = [
  { id: "c1", name: "Anna Weber",   initials: "AW", role: "manager",   zone: "all", status: "available" },
  { id: "c2", name: "Thomas Bauer", initials: "TB", role: "attendant", zone: "A",   status: "serving" },
  { id: "c3", name: "Sara Müller",  initials: "SM", role: "attendant", zone: "B",   status: "available" },
  { id: "c4", name: "Kenji Tanaka", initials: "KT", role: "attendant", zone: "C",   status: "serving" },
  { id: "c5", name: "Lena Fischer", initials: "LF", role: "attendant", zone: "B",   status: "break" },
]

// ─── Mock Requests ───────────────────────────────────────────────────────────

const now = Date.now()

export const INITIAL_REQUESTS: CrewRequest[] = [
  {
    id: "r1",
    seat: "14A",
    zone: "B",
    item: "Still Water",
    itemKey: "water",
    category: "drinks",
    originalLanguage: "DE",
    originalText: "Ich möchte bitte ein Glas Wasser",
    translatedText: "Still Water × 2",
    status: "pending",
    priority: "normal",
    submittedAt: new Date(now - 3 * 60000),
    quantity: 2,
  },
  {
    id: "r2",
    seat: "6B",
    zone: "A",
    item: "Chicken Pasta",
    itemKey: "chickenPasta",
    category: "food",
    originalLanguage: "EN",
    translatedText: "Chicken Pasta (no onions)",
    status: "acknowledged",
    priority: "normal",
    submittedAt: new Date(now - 7 * 60000),
    acknowledgedAt: new Date(now - 5 * 60000),
    assignedTo: "c2",
    notes: "No onions please",
  },
  {
    id: "r3",
    seat: "24C",
    zone: "C",
    item: "Blanket",
    itemKey: "blanket",
    category: "comfort",
    originalLanguage: "ZH",
    originalText: "我需要一条毯子",
    translatedText: "Extra Blanket",
    status: "in-progress",
    priority: "normal",
    submittedAt: new Date(now - 12 * 60000),
    acknowledgedAt: new Date(now - 10 * 60000),
    assignedTo: "c4",
  },
  {
    id: "r4",
    seat: "18C",
    zone: "B",
    item: "MEDICAL – Headache",
    category: "medical",
    originalLanguage: "TR",
    originalText: "Baş ağrım var, ilaç lazım",
    translatedText: "Headache – needs painkiller",
    status: "pending",
    priority: "high",
    submittedAt: new Date(now - 1.5 * 60000),
  },
  {
    id: "r5",
    seat: "30B",
    zone: "C",
    item: "Orange Juice",
    itemKey: "orangeJuice",
    category: "drinks",
    originalLanguage: "FR",
    originalText: "Un jus d'orange s'il vous plaît",
    translatedText: "Orange Juice",
    status: "delivered",
    priority: "normal",
    submittedAt: new Date(now - 18 * 60000),
    acknowledgedAt: new Date(now - 16 * 60000),
    deliveredAt: new Date(now - 9 * 60000),
    assignedTo: "c4",
  },
  {
    id: "r6",
    seat: "2A",
    zone: "A",
    item: "Custom: Pillow adjustment",
    category: "custom",
    originalLanguage: "EN",
    translatedText: "Would like pillow support for back",
    status: "pending",
    priority: "normal",
    submittedAt: new Date(now - 2 * 60000),
  },
  {
    id: "r7",
    seat: "16B",
    zone: "B",
    item: "Champagne",
    itemKey: "champagne",
    category: "drinks",
    originalLanguage: "ES",
    originalText: "Una copa de champán por favor",
    translatedText: "Champagne × 1",
    status: "pending",
    priority: "normal",
    submittedAt: new Date(now - 4 * 60000),
    quantity: 1,
  },
  {
    id: "r8",
    seat: "27A",
    zone: "C",
    item: "Headphones",
    itemKey: "headphones",
    category: "practical",
    originalLanguage: "JA",
    originalText: "ヘッドフォンをお願いします",
    translatedText: "Headphones",
    status: "acknowledged",
    priority: "normal",
    submittedAt: new Date(now - 8 * 60000),
    acknowledgedAt: new Date(now - 6 * 60000),
    assignedTo: "c4",
  },
]

// ─── Mock Seat Map ────────────────────────────────────────────────────────────

function makeSeat(
  row: number,
  col: string,
  seatClass: "business" | "economy",
  zone: "A" | "B" | "C",
  status: SeatStatus = "occupied",
  passenger?: string,
  requestId?: string,
): SeatData {
  return { id: `${row}${col}`, row, col, zone, class: seatClass, status, passenger, requestId }
}

const ECONOMY_COLS  = ["A", "B", "C"]
const ZONE_ROWS = {
  A: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  B: [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
  C: [23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
} as const

const SPECIAL_SEATS: Record<
  string,
  Pick<SeatData, "status" | "passenger" | "requestId">
> = {
  "2A": { status: "pending", passenger: "Mr. Harrison", requestId: "r6" },
  "6B": { status: "serving", passenger: "Ms. Dupont", requestId: "r2" },
  "14A": { status: "pending", passenger: "Müller, K.", requestId: "r1" },
  "16B": { status: "pending", passenger: "García, M.", requestId: "r7" },
  "18C": { status: "pending", passenger: "Yilmaz, A.", requestId: "r4" },
  "24C": { status: "serving", passenger: "Chen, L.", requestId: "r3" },
  "27A": { status: "serving", passenger: "Yamamoto, H.", requestId: "r8" },
  "30B": { status: "delivered", passenger: "Leclerc, J.", requestId: "r5" },
}

const EMPTY_SEATS = new Set([
  "1A",
  "3A",
  "7C",
  "12C",
  "15A",
  "19B",
  "21C",
  "23A",
  "26B",
  "29C",
  "31A",
  "33C",
])

function buildZoneSeats(
  zone: "A" | "B" | "C",
  rows: readonly number[],
  seatClass: "business" | "economy",
) {
  return rows.flatMap((row) =>
    ECONOMY_COLS.map((col) => {
      const id = `${row}${col}`
      const special = SPECIAL_SEATS[id]

      if (special) {
        return makeSeat(
          row,
          col,
          seatClass,
          zone,
          special.status,
          special.passenger,
          special.requestId,
        )
      }

      if (EMPTY_SEATS.has(id)) {
        return makeSeat(row, col, seatClass, zone, "empty")
      }

      return makeSeat(row, col, seatClass, zone, "occupied", "Passenger")
    }),
  )
}

export const MOCK_SEATS: SeatData[] = [
  ...buildZoneSeats("A", ZONE_ROWS.A, "business"),
  ...buildZoneSeats("B", ZONE_ROWS.B, "economy"),
  ...buildZoneSeats("C", ZONE_ROWS.C, "economy"),
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const LANGUAGE_FLAGS: Record<string, string> = {
  EN: "🇬🇧", DE: "🇩🇪", FR: "🇫🇷", ES: "🇪🇸",
  AR: "🇸🇦", ZH: "🇨🇳", JA: "🇯🇵", TR: "🇹🇷",
}

export const CATEGORY_ICONS: Record<RequestCategory, string> = {
  drinks:   "🥤",
  food:     "🍽️",
  comfort:  "🛏️",
  hygiene:  "🧴",
  practical:"🎧",
  medical:  "💊",
  sos:      "🆘",
  custom:   "✍️",
}

export function minutesAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 60000)
  if (diff < 1) return "just now"
  if (diff === 1) return "1m ago"
  return `${diff}m ago`
}

export function statusColor(status: RequestStatus): string {
  switch (status) {
    case "pending":      return "bg-amber-100 text-amber-800 border-amber-300"
    case "acknowledged": return "bg-blue-100 text-blue-800 border-blue-300"
    case "in-progress":  return "bg-purple-100 text-purple-800 border-purple-300"
    case "delivered":    return "bg-green-100 text-green-800 border-green-300"
    case "cancelled":    return "bg-gray-100 text-gray-500 border-gray-300"
    default:             return "bg-gray-100 text-gray-600 border-gray-300"
  }
}

export function seatStatusColor(status: SeatStatus): string {
  switch (status) {
    case "empty":     return "bg-gray-100 border-gray-200 text-gray-300"
    case "occupied":  return "bg-white border-gray-300 text-gray-600"
    case "pending":   return "bg-amber-400 border-amber-500 text-amber-900"
    case "serving":   return "bg-blue-500 border-blue-600 text-white"
    case "delivered": return "bg-green-400 border-green-500 text-green-900"
    case "sos":       return "bg-red-500 border-red-600 text-white animate-pulse"
    default:          return "bg-white border-gray-300 text-gray-600"
  }
}
