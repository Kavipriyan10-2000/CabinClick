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
  totalSeats: 74,
  occupiedSeats: 61,
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
    seat: "22C",
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
    seat: "18F",
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
    seat: "30D",
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
    seat: "11B",
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
    seat: "25E",
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

const BUSINESS_COLS = ["A", "B", "C", "D"]
const ECONOMY_COLS  = ["A", "B", "C", "D", "E", "F"]

export const MOCK_SEATS: SeatData[] = [
  // Zone A – Business (rows 1–6)
  ...([1, 2, 3, 4, 5, 6] as number[]).flatMap((row) =>
    BUSINESS_COLS.map((col) => {
      const id = `${row}${col}`
      if (id === "2A") return makeSeat(row, col, "business", "A", "pending", "Mr. Harrison",  "r6")
      if (id === "6B") return makeSeat(row, col, "business", "A", "serving", "Ms. Dupont",    "r2")
      if ([1, 3].includes(row) && col === "A") return makeSeat(row, col, "business", "A", "empty")
      if (row === 4 && col === "D") return makeSeat(row, col, "business", "A", "empty")
      return makeSeat(row, col, "business", "A", "occupied", "Passenger")
    })
  ),
  // Zone B – Economy front (rows 10–20)
  ...([10,11,12,13,14,15,16,17,18,19,20] as number[]).flatMap((row) =>
    ECONOMY_COLS.map((col) => {
      const id = `${row}${col}`
      if (id === "14A") return makeSeat(row, col, "economy", "B", "pending",  "Müller, K.",    "r1")
      if (id === "11B") return makeSeat(row, col, "economy", "B", "pending",  "García, M.",    "r7")
      if (id === "18F") return makeSeat(row, col, "economy", "B", "pending",  "Yilmaz, A.",    "r4")
      if ([10,13,16].includes(row) && ["D","E","F"].includes(col)) return makeSeat(row, col, "economy", "B", "empty")
      return makeSeat(row, col, "economy", "B", "occupied", "Passenger")
    })
  ),
  // Zone C – Economy rear (rows 21–30)
  ...([21,22,23,24,25,26,27,28,29,30] as number[]).flatMap((row) =>
    ECONOMY_COLS.map((col) => {
      const id = `${row}${col}`
      if (id === "22C") return makeSeat(row, col, "economy", "C", "serving",   "Chen, L.",     "r3")
      if (id === "25E") return makeSeat(row, col, "economy", "C", "serving",   "Yamamoto, H.", "r8")
      if (id === "30D") return makeSeat(row, col, "economy", "C", "delivered", "Leclerc, J.",  "r5")
      if ([24,27,29].includes(row) && ["A","B"].includes(col)) return makeSeat(row, col, "economy", "C", "empty")
      return makeSeat(row, col, "economy", "C", "occupied", "Passenger")
    })
  ),
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
