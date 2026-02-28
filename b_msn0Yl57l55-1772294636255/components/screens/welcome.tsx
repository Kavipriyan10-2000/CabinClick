"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { QrCode, Camera, Keyboard, ChevronRight, Wifi, X, AlertCircle } from "lucide-react"
import { CabinLogo } from "@/components/cabin-logo"
import jsQR from "jsqr"

type WelcomeProps = {
  onBoard: (seatInfo: { seat: string; flight: string; route: string }) => void
}

type Mode = "idle" | "scanning" | "manual"

const DEMO_SEATS = ["12A", "14A", "14B", "16C", "18F", "22D", "30A"]

export function Welcome({ onBoard }: WelcomeProps) {
  const [mode, setMode] = useState<Mode>("idle")
  const [manualSeat, setManualSeat] = useState("")
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [scanStatus, setScanStatus] = useState<"scanning" | "found">("scanning")
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => stopCamera()
  }, [stopCamera])

  const scanFrame = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(scanFrame)
      return
    }
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height)
    if (code) {
      setScanStatus("found")
      stopCamera()
      // Parse QR: expect format "seat=14A&flight=LH441&route=FRA-JFK" or just seat number
      try {
        const params = new URLSearchParams(code.data.includes("?") ? code.data.split("?")[1] : code.data)
        onBoard({
          seat: params.get("seat") || code.data,
          flight: params.get("flight") || "LH441",
          route: params.get("route") || "FRANKFURT → NEW YORK",
        })
      } catch {
        onBoard({ seat: code.data, flight: "LH441", route: "FRANKFURT → NEW YORK" })
      }
      return
    }
    rafRef.current = requestAnimationFrame(scanFrame)
  }, [onBoard, stopCamera])

  async function startCamera() {
    setCameraError(null)
    setMode("scanning")
    setScanStatus("scanning")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        rafRef.current = requestAnimationFrame(scanFrame)
      }
    } catch {
      setCameraError("Camera access denied. Use manual entry instead.")
      setMode("idle")
    }
  }

  function handleManualBoard() {
    const seat = manualSeat.toUpperCase().trim()
    if (!seat) return
    onBoard({ seat, flight: "LH441", route: "FRANKFURT → NEW YORK" })
  }

  function closeScanner() {
    stopCamera()
    setMode("idle")
    setCameraError(null)
  }

  return (
    <div className="min-h-screen flex flex-col bg-cabin-navy overflow-hidden">
      {/* Hero section */}
      <div
        className={`flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-6 transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {/* Logo */}
        <CabinLogo size="xl" variant="light" showText className="mb-10" />

        {/* Boarding pass card */}
        <div className="w-full max-w-sm">
          {/* Boarding pass top */}
          <div className="bg-white rounded-t-3xl px-6 pt-6 pb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Flight</span>
              <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Class</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-black text-cabin-navy">LH 441</span>
              <span className="text-2xl font-black text-cabin-navy">Economy</span>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="text-center">
                <p className="text-3xl font-black text-cabin-navy">FRA</p>
                <p className="text-xs text-muted-foreground font-medium">Frankfurt</p>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-center gap-1">
                  <div className="flex-1 h-px bg-muted" />
                  <div className="w-2 h-2 bg-cabin-gold rounded-full" />
                  <div className="flex-1 h-px border-t-2 border-dashed border-muted" />
                  <div className="w-2 h-2 bg-cabin-navy rounded-full" />
                  <div className="flex-1 h-px bg-muted" />
                </div>
                <p className="text-[10px] text-muted-foreground">8h 20m</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-cabin-navy">JFK</p>
                <p className="text-xs text-muted-foreground font-medium">New York</p>
              </div>
            </div>

            <div className="flex justify-between border-t border-dashed border-border pt-3">
              <div>
                <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Date</p>
                <p className="text-sm font-bold text-cabin-navy">
                  {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Boarding</p>
                <p className="text-sm font-bold text-cabin-navy">
                  {new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Gate</p>
                <p className="text-sm font-bold text-cabin-navy">B22</p>
              </div>
            </div>
          </div>

          {/* Tear line */}
          <div className="bg-white flex items-center gap-0 relative">
            <div className="w-5 h-10 bg-cabin-navy rounded-r-full" />
            <div className="flex-1 border-t-2 border-dashed border-border mx-2" />
            <div className="w-5 h-10 bg-cabin-navy rounded-l-full" />
          </div>

          {/* Boarding pass bottom — QR section */}
          <div className="bg-white rounded-b-3xl px-6 pt-4 pb-6">
            <p className="text-center text-[11px] font-bold text-muted-foreground tracking-widest uppercase mb-3">
              Scan seat QR to begin
            </p>
            <div className="flex gap-3">
              <button
                onClick={startCamera}
                className="flex-1 bg-cabin-navy text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all"
              >
                <Camera className="w-4 h-4" />
                Scan QR
              </button>
              <button
                onClick={() => setMode("manual")}
                className="flex-1 border-2 border-cabin-navy text-cabin-navy font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-cabin-navy hover:text-white active:scale-[0.98] transition-all"
              >
                <Keyboard className="w-4 h-4" />
                Enter Seat
              </button>
            </div>
            {cameraError && (
              <div className="mt-3 flex items-center gap-2 text-cabin-red text-xs">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                {cameraError}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-4 text-center">
        <div className="flex items-center justify-center gap-1 text-white/40 text-xs">
          <Wifi className="w-3 h-3" />
          <span>Powered by CabinClick · Onboard WiFi</span>
        </div>
      </div>

      {/* QR Scanner modal */}
      {mode === "scanning" && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="flex items-center justify-between px-4 py-4 safe-area-top">
            <span className="text-white font-bold">Scan seat QR code</span>
            <button onClick={closeScanner} className="text-white/70 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 relative flex items-center justify-center">
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Scanning overlay */}
            <div className="relative z-10 w-64 h-64">
              {/* Corner brackets */}
              {["top-0 left-0 border-t-4 border-l-4 rounded-tl-xl",
                "top-0 right-0 border-t-4 border-r-4 rounded-tr-xl",
                "bottom-0 left-0 border-b-4 border-l-4 rounded-bl-xl",
                "bottom-0 right-0 border-b-4 border-r-4 rounded-br-xl",
              ].map((cls) => (
                <div key={cls} className={`absolute w-10 h-10 border-cabin-gold ${cls}`} />
              ))}

              {/* Animated scan line */}
              {scanStatus === "scanning" && (
                <div className="absolute inset-x-2 top-2 h-0.5 bg-cabin-gold animate-bounce" />
              )}
              {scanStatus === "found" && (
                <div className="absolute inset-0 bg-cabin-success/20 rounded-xl flex items-center justify-center">
                  <div className="w-16 h-16 bg-cabin-success rounded-full flex items-center justify-center">
                    <QrCode className="w-8 h-8 text-white" />
                  </div>
                </div>
              )}
            </div>

            <p className="absolute bottom-16 text-white/80 text-sm text-center px-8">
              Point camera at the QR code on your seat display
            </p>
          </div>
        </div>
      )}

      {/* Manual seat entry modal */}
      {mode === "manual" && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-cabin-navy">Enter Seat Number</h2>
              <button onClick={() => setMode("idle")} className="text-muted-foreground hover:text-cabin-navy">
                <X className="w-5 h-5" />
              </button>
            </div>

            <input
              type="text"
              value={manualSeat}
              onChange={(e) => setManualSeat(e.target.value.toUpperCase())}
              placeholder="e.g. 14A"
              maxLength={4}
              className="w-full text-center text-4xl font-black text-cabin-navy tracking-widest border-b-4 border-cabin-navy pb-3 mb-6 bg-transparent focus:outline-none placeholder:text-muted-foreground/30"
              autoFocus
            />

            {/* Quick pick demo seats */}
            <p className="text-xs text-muted-foreground font-medium mb-3">Quick select:</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {DEMO_SEATS.map((s) => (
                <button
                  key={s}
                  onClick={() => setManualSeat(s)}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-bold transition-all ${
                    manualSeat === s
                      ? "bg-cabin-navy text-white border-cabin-navy"
                      : "border-border text-cabin-navy hover:border-cabin-navy"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <button
              onClick={handleManualBoard}
              disabled={!manualSeat.trim()}
              className="w-full bg-cabin-navy text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
            >
              Board Now
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
