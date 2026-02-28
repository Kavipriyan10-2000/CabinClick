"use client"

import { useState, useEffect } from "react"
import {
  Wine,
  UtensilsCrossed,
  Sofa,
  Droplets,
  Headphones,
  Shield,
  AlertTriangle,
  Droplet,
  MessageSquare,
  Clock,
} from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { CabinHeader } from "@/components/cabin-header"

type DashboardProps = {
  seatInfo?: { seat: string; flight: string; route: string }
  onServiceSelect: (service: string) => void
  onCustomRequest: () => void
  onSOS: () => void
  onRequestDetails: () => void
  onFeedback: () => void
}

function useLiveClock() {
  const [time, setTime] = useState(() => new Date())
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])
  return time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export function Dashboard({
  onServiceSelect,
  onCustomRequest,
  onSOS,
  onRequestDetails,
  onFeedback,
  seatInfo = { seat: "14A", flight: "LH441", route: "FRANKFURT u2192 NEW YORK" },
}: DashboardProps) {
  const { t } = useLanguage()
  const currentTime = useLiveClock()
  const [progressPct, setProgressPct] = useState(0)

  // Animate progress bar on mount
  useEffect(() => {
    const timer = setTimeout(() => setProgressPct(55), 300)
    return () => clearTimeout(timer)
  }, [])

  const services = [
    { key: "drinks", icon: Wine, label: t.drinks },
    { key: "food", icon: UtensilsCrossed, label: t.food },
    { key: "comfort", icon: Sofa, label: t.comfort },
    { key: "hygiene", icon: Droplets, label: t.hygiene },
    { key: "practical", icon: Headphones, label: t.practical },
    { key: "medical", icon: Shield, label: t.medical },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CabinHeader
        showFlightInfo
        flightNumber={seatInfo.flight}
        route={"FRANKFURT \u2192 NEW YORK"}
        seat={seatInfo.seat}
        showUser
      />

      <main className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full">
        {/* Meal service notice */}
        <div className="bg-[#FFF9E6] rounded-xl px-4 py-3 mb-4 flex items-center justify-center gap-2">
          <UtensilsCrossed className="w-4 h-4 text-cabin-gold" />
          <span className="text-cabin-navy text-sm font-medium">
            {t.mealServiceNotice}
          </span>
        </div>

        {/* Flight status card */}
        <div className="rounded-xl overflow-hidden mb-4 shadow-sm">
          <div className="relative h-36 bg-gradient-to-b from-[#5B8EC9] to-[#A8C8E8] flex items-end">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F4D]/40 to-transparent" />
            {/* Live clock */}
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
              <Clock className="w-3 h-3 text-white" />
              <span className="text-white text-xs font-bold">{currentTime}</span>
            </div>
            <div className="relative z-10 flex items-end justify-between w-full px-4 pb-3">
              <div>
                <p className="text-[#E8F0FE] text-xs">{t.flightStatus}</p>
                <p className="text-[#FFFFFF] font-bold text-lg">{t.cruising}</p>
              </div>
              <div className="text-right">
                <p className="text-[#E8F0FE] text-xs">{t.altitude}</p>
                <p className="text-[#FFFFFF] font-bold text-lg">38,000ft</p>
              </div>
            </div>
          </div>
          <div className="bg-card px-4 py-3">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-cabin-navy font-medium">Frankfurt</span>
              <span className="text-muted-foreground">
                {"4h 30m "}
                {t.remaining}
              </span>
              <span className="text-cabin-navy font-medium">New York</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className="bg-cabin-gold h-1.5 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Active request */}
        <button
          onClick={onRequestDetails}
          className="w-full bg-card rounded-xl px-4 py-3 mb-6 flex items-center gap-3 shadow-sm border border-border hover:border-cabin-gold/50 hover:shadow-md transition-all active:scale-[0.99]"
          aria-label="View active request details"
        >
          <div className="w-10 h-10 bg-[#E8F0FE] rounded-full flex items-center justify-center">
            <Droplet className="w-5 h-5 text-cabin-navy" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-cabin-navy text-sm">
              {t.activeRequest}: {t.water}
            </p>
            <p className="text-xs">
              <span className="text-[#3B82F6]">{t.acknowledged}</span>
              <span className="text-muted-foreground">
                {" \u00b7 "}
                {t.estimatedTime}
              </span>
            </p>
          </div>
          <span className="text-cabin-navy text-xs font-bold">{t.details}</span>
        </button>

        {/* Services */}
        <p className="text-cabin-navy font-bold text-xs tracking-wider mb-3 uppercase">
          {t.services}
        </p>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {services.map((svc, i) => (
            <button
              key={svc.key}
              onClick={() => onServiceSelect(svc.key)}
              style={{ animationDelay: `${i * 60}ms` }}
              className="bg-card rounded-xl p-4 flex flex-col items-center gap-2 shadow-sm border border-border hover:border-cabin-gold/50 hover:shadow-md transition-all active:scale-95"
            >
              <div className="w-10 h-10 bg-[#E8F0FE] rounded-full flex items-center justify-center">
                <svc.icon className="w-5 h-5 text-cabin-navy" />
              </div>
              <span className="text-cabin-navy text-xs font-medium">
                {svc.label}
              </span>
            </button>
          ))}
        </div>

        {/* Custom request */}
        <button
          onClick={onCustomRequest}
          className="w-full bg-card border-2 border-cabin-navy rounded-xl py-3.5 text-cabin-navy font-semibold text-sm hover:bg-cabin-navy hover:text-[#FFFFFF] transition-colors mb-3 active:scale-[0.99]"
        >
          {t.customRequest}
        </button>

        {/* Feedback button */}
        <button
          onClick={onFeedback}
          className="w-full bg-card border border-border rounded-xl py-3 text-cabin-navy font-medium text-sm hover:border-cabin-gold/50 transition-colors mb-6 flex items-center justify-center gap-2 active:scale-[0.99]"
        >
          <MessageSquare className="w-4 h-4" />
          {t.submitFeedback}
        </button>
      </main>

      {/* SOS button */}
      <div className="sticky bottom-0 px-4 pb-4 pt-2 bg-gradient-to-t from-background to-transparent">
        <button
          onClick={onSOS}
          className="w-full max-w-2xl mx-auto bg-cabin-red text-[#FFFFFF] font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.98]"
        >
          <AlertTriangle className="w-5 h-5" />
          {t.callCrewSOS}
        </button>
      </div>
    </div>
  )
}
