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
  class: "business" | "premium-economy" | "economy"
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
  totalSeats: 288,
  occupiedSeats: 259,
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
    seat: "10A",
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
    seat: "3C",
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
    seat: "34J",
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
    seat: "12F",
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
    seat: "46H",
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
    seat: "11D",
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
    seat: "39C",
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
  seatClass: "business" | "premium-economy" | "economy",
  zone: "A" | "B" | "C",
  status: SeatStatus = "occupied",
  passenger?: string,
  requestId?: string,
): SeatData {
  return { id: `${row}${col}`, row, col, zone, class: seatClass, status, passenger, requestId }
}

const BUSINESS_COLS = ["A", "C", "D", "F", "G", "J"] as const
const ECONOMY_COLS = ["A", "B", "C", "D", "E", "F", "G", "H", "J"] as const

const range = (start: number, end: number) =>
  Array.from({ length: end - start + 1 }, (_, index) => start + index)

const ZONE_LAYOUT = {
  A: {
    rows: range(1, 5),
    cols: BUSINESS_COLS,
    seatClass: "business" as const,
  },
  B: {
    rows: range(10, 13),
    cols: BUSINESS_COLS,
    seatClass: "premium-economy" as const,
  },
  C: {
    rows: [...range(30, 41), ...range(44, 57)],
    cols: ECONOMY_COLS,
    seatClass: "economy" as const,
  },
} as const

const SPECIAL_SEATS: Record<
  string,
  Pick<SeatData, "status" | "passenger" | "requestId">
> = {
  "2A": { status: "pending", passenger: "Mr. Harrison", requestId: "r6" },
  "3C": { status: "serving", passenger: "Ms. Dupont", requestId: "r2" },
  "10A": { status: "pending", passenger: "Müller, K.", requestId: "r1" },
  "11D": { status: "pending", passenger: "García, M.", requestId: "r7" },
  "12F": { status: "pending", passenger: "Yilmaz, A.", requestId: "r4" },
  "34J": { status: "serving", passenger: "Chen, L.", requestId: "r3" },
  "39C": { status: "serving", passenger: "Yamamoto, H.", requestId: "r8" },
  "46H": { status: "delivered", passenger: "Leclerc, J.", requestId: "r5" },
}

const EMPTY_SEATS = new Set([
  "1A",
  "1J",
  "4D",
  "5G",
  "10C",
  "11G",
  "12A",
  "13J",
  "30B",
  "31H",
  "32E",
  "33A",
  "35F",
  "36J",
  "37D",
  "38B",
  "40H",
  "41C",
  "44A",
  "45J",
  "47E",
  "49B",
  "50H",
  "52D",
  "53A",
  "54J",
  "55E",
  "56C",
  "57G",
])

function buildZoneSeats(
  zone: "A" | "B" | "C",
  rows: readonly number[],
  cols: readonly string[],
  seatClass: "business" | "premium-economy" | "economy",
) {
  return rows.flatMap((row) =>
    cols.map((col) => {
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
  ...buildZoneSeats("A", ZONE_LAYOUT.A.rows, ZONE_LAYOUT.A.cols, ZONE_LAYOUT.A.seatClass),
  ...buildZoneSeats("B", ZONE_LAYOUT.B.rows, ZONE_LAYOUT.B.cols, ZONE_LAYOUT.B.seatClass),
  ...buildZoneSeats("C", ZONE_LAYOUT.C.rows, ZONE_LAYOUT.C.cols, ZONE_LAYOUT.C.seatClass),
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
