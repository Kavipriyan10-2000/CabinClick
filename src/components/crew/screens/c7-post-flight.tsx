"use client"

import { Star, Clock, TrendingUp, AlertTriangle, Users, MessageSquare, Award } from "lucide-react"
import type { CrewRequest, CrewMember } from "@/lib/crew-types"
import { CATEGORY_ICONS } from "@/lib/crew-types"

type C7PostFlightProps = {
  requests: CrewRequest[]
  crew: CrewMember[]
  flightNumber: string
  route: string
}

function avgResponseMs(reqs: CrewRequest[]): number {
  const timed = reqs.filter((r) => r.acknowledgedAt)
  if (!timed.length) return 0
  const sum = timed.reduce((acc, r) => acc + (r.acknowledgedAt!.getTime() - r.submittedAt.getTime()), 0)
  return sum / timed.length
}

function formatMs(ms: number): string {
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

const FEEDBACK_MOCK = [
  { category: "Service Speed",  score: 4.6 },
  { category: "Friendliness",   score: 4.8 },
  { category: "Food Quality",   score: 4.3 },
  { category: "Comfort",        score: 4.5 },
  { category: "Overall",        score: 4.6 },
]

const CATEGORY_ORDER = ["drinks", "food", "comfort", "hygiene", "practical", "medical", "custom", "sos"] as const

export function C7PostFlight({ requests, crew, flightNumber, route }: C7PostFlightProps) {
  const totalRequests = requests.length
  const delivered     = requests.filter((r) => r.status === "delivered").length
  const sosList       = requests.filter((r) => r.category === "sos" || r.priority === "sos")
  const avgResp       = avgResponseMs(requests)
  const satisfactionAvg = FEEDBACK_MOCK.find((f) => f.category === "Overall")?.score ?? 0

  // By category
  const byCategory = CATEGORY_ORDER.map((cat) => ({
    cat,
    count: requests.filter((r) => r.category === cat).length,
  })).filter((x) => x.count > 0)

  const maxCount = Math.max(...byCategory.map((x) => x.count), 1)

  // Crew activity
  const crewActivity = crew.map((c) => ({
    ...c,
    handled: requests.filter((r) => r.assignedTo === c.id).length,
  }))

  return (
    <div className="overflow-y-auto h-full px-4 py-4">
      {/* Header */}
      <div className="bg-cabin-navy rounded-2xl p-5 mb-5 text-white">
        <div className="text-xs text-white/50 font-semibold tracking-wide mb-1">POST-FLIGHT SUMMARY</div>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-black text-cabin-gold">{flightNumber}</div>
            <div className="text-white/70 text-sm mt-0.5">{route}</div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-cabin-gold">
              <Star className="w-4 h-4 fill-cabin-gold" />
              <span className="text-2xl font-black">{satisfactionAvg.toFixed(1)}</span>
            </div>
            <div className="text-white/50 text-xs">Satisfaction</div>
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <div className="text-3xl font-black text-cabin-navy">{totalRequests}</div>
          <div className="text-xs text-muted-foreground mt-1">Total Requests</div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <div className="text-3xl font-black text-cabin-success">{delivered}</div>
          <div className="text-xs text-muted-foreground mt-1">Delivered</div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <div className={`text-3xl font-black ${sosList.length > 0 ? "text-cabin-red" : "text-cabin-success"}`}>
            {sosList.length}
          </div>
          <div className="text-xs text-muted-foreground mt-1">SOS Alerts</div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <div className="text-3xl font-black text-blue-600">{formatMs(avgResp)}</div>
          <div className="text-xs text-muted-foreground mt-1">Avg. Response</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        {/* Requests by category */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-cabin-navy" />
            <h3 className="font-black text-cabin-navy text-sm">Requests by Category</h3>
          </div>
          <div className="space-y-2">
            {byCategory.map(({ cat, count }) => (
              <div key={cat} className="flex items-center gap-2">
                <span className="text-base w-6 text-center">{CATEGORY_ICONS[cat as keyof typeof CATEGORY_ICONS]}</span>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cabin-navy rounded-full transition-all duration-700"
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-cabin-navy w-4 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback scores */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-cabin-navy" />
            <h3 className="font-black text-cabin-navy text-sm">Passenger Feedback</h3>
          </div>
          <div className="space-y-2.5">
            {FEEDBACK_MOCK.map((f) => (
              <div key={f.category}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs text-muted-foreground">{f.category}</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-cabin-gold fill-cabin-gold" />
                    <span className="text-xs font-black text-cabin-navy">{f.score.toFixed(1)}</span>
                  </div>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cabin-gold rounded-full"
                    style={{ width: `${(f.score / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        {/* Crew activity */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-cabin-navy" />
            <h3 className="font-black text-cabin-navy text-sm">Crew Activity</h3>
          </div>
          <div className="space-y-2">
            {crewActivity.sort((a, b) => b.handled - a.handled).map((c) => (
              <div key={c.id} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0 ${
                  c.role === "manager" ? "bg-cabin-gold text-cabin-navy" : "bg-cabin-navy"
                }`}>
                  {c.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-cabin-navy truncate">{c.name}</div>
                  <div className="h-1.5 bg-muted rounded-full mt-0.5">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: c.handled > 0 ? `${(c.handled / Math.max(...crewActivity.map(x => x.handled), 1)) * 100}%` : "5%" }}
                    />
                  </div>
                </div>
                <span className="text-xs font-black text-cabin-navy">{c.handled}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SOS log */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-cabin-red" />
            <h3 className="font-black text-cabin-navy text-sm">SOS Log</h3>
          </div>
          {sosList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Award className="w-8 h-8 text-cabin-success mb-2" />
              <p className="text-xs font-semibold text-cabin-success">No SOS incidents</p>
              <p className="text-xs text-muted-foreground">Excellent flight!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sosList.map((r) => (
                <div key={r.id} className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-red-700">Seat {r.seat}</span>
                    <span className="text-xs text-red-500">
                      {r.submittedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-xs text-red-600">{r.translatedText}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Response: {r.acknowledgedAt ? formatMs(r.acknowledgedAt.getTime() - r.submittedAt.getTime()) : "—"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Response time breakdown */}
      <div className="bg-card border border-border rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-cabin-navy" />
          <h3 className="font-black text-cabin-navy text-sm">Response Time Breakdown</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-xl font-black text-cabin-success">{requests.filter((r) => r.acknowledgedAt && (r.acknowledgedAt.getTime() - r.submittedAt.getTime()) < 120000).length}</div>
            <div className="text-xs text-muted-foreground">Under 2 min</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-black text-cabin-gold">{requests.filter((r) => r.acknowledgedAt && (r.acknowledgedAt.getTime() - r.submittedAt.getTime()) >= 120000 && (r.acknowledgedAt.getTime() - r.submittedAt.getTime()) < 300000).length}</div>
            <div className="text-xs text-muted-foreground">2–5 min</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-black text-cabin-red">{requests.filter((r) => r.acknowledgedAt && (r.acknowledgedAt.getTime() - r.submittedAt.getTime()) >= 300000).length}</div>
            <div className="text-xs text-muted-foreground">Over 5 min</div>
          </div>
        </div>
      </div>
    </div>
  )
}
