"use client"

import { useCallback, useEffect, useState } from "react"
import { LanguageProvider, useLanguage } from "@/lib/language-context"
import { LanguageSelection } from "@/components/screens/language-selection"
import { Dashboard } from "@/components/screens/dashboard"
import { ServiceSelection } from "@/components/screens/service-selection"
import { SnackDetail } from "@/components/screens/snack-detail"
import { CustomRequest } from "@/components/screens/custom-request"
import { RequestTracking } from "@/components/screens/request-tracking"
import { SOSFlow } from "@/components/screens/sos-flow"
import { FeedbackSurvey } from "@/components/screens/feedback-survey"
import { ThankYou } from "@/components/screens/thank-you"
import { SERVICE_ITEMS } from "@/lib/service-items"
import {
  ApiError,
  type PassengerRequestRecord,
  createPassengerRequest,
  createVoicePassengerRequest,
  createSeatAccess,
  ensureFlightRegistration,
  listPassengerRequests,
  toBackendLanguage,
} from "@/lib/backend-api"

type Screen =
  | "language"
  | "dashboard"
  | "service-selection"
  | "snack-detail"
  | "custom-request"
  | "request-tracking"
  | "sos"
  | "feedback"
  | "thank-you"

type SeatInfo = {
  seat: string
  flightNumber: string
  route: string
  origin: string
  destination: string
}

const DEFAULT_SEAT_INFO: SeatInfo = {
  seat: "10A",
  flightNumber: "LH441",
  route: "FRANKFURT → NEW YORK",
  origin: "Frankfurt",
  destination: "New York",
}

function formatError(error: unknown) {
  if (error instanceof ApiError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return "Something went wrong while contacting the backend."
}

function CabinClickFlow() {
  const { locale, t } = useLanguage()
  const [screen, setScreen] = useState<Screen>("language")
  const [seatInfo] = useState(DEFAULT_SEAT_INFO)
  const [selectedCategory, setSelectedCategory] = useState("drinks")
  const [selectedItemKey, setSelectedItemKey] = useState("water")
  const [history, setHistory] = useState<Screen[]>([])
  const [passengerReady, setPassengerReady] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false)
  const [activeRequest, setActiveRequest] = useState<PassengerRequestRecord | null>(null)
  const [flowError, setFlowError] = useState<string | null>(null)

  const navigate = useCallback(
    (to: Screen) => {
      setHistory((prev) => [...prev, screen])
      setScreen(to)
    },
    [screen],
  )

  const goBack = useCallback(() => {
    const previousScreen = history[history.length - 1]
    if (previousScreen) {
      setHistory((currentHistory) => currentHistory.slice(0, -1))
      setScreen(previousScreen)
      return
    }

    setScreen("dashboard")
  }, [history])

  const resolveItemLabel = useCallback(
    (itemKey: string) => {
      for (const group of Object.values(SERVICE_ITEMS)) {
        const item = group.find((entry) => entry.key === itemKey)
        if (item) {
          return (t as Record<string, string>)[item.labelKey] || item.labelKey
        }
      }

      return itemKey
    },
    [t],
  )

  const syncPassengerRequests = useCallback(async () => {
    if (!passengerReady) {
      return
    }

    try {
      const response = await listPassengerRequests(seatInfo.seat)
      setActiveRequest(
        response.items.find(
          (request) =>
            request.status !== "completed" && request.status !== "cancelled",
        ) || response.items[0] || null,
      )
    } catch (error) {
      setFlowError(formatError(error))
    }
  }, [passengerReady, seatInfo.seat])

  useEffect(() => {
    if (!passengerReady) {
      return
    }

    void syncPassengerRequests()
    const intervalId = window.setInterval(() => {
      void syncPassengerRequests()
    }, 8000)

    return () => window.clearInterval(intervalId)
  }, [passengerReady, syncPassengerRequests])

  const initializePassengerSession = useCallback(async () => {
    setIsInitializing(true)
    setFlowError(null)

    try {
      await ensureFlightRegistration({
        flight_number: seatInfo.flightNumber,
        origin: seatInfo.origin,
        destination: seatInfo.destination,
        departure_date: new Date().toISOString().slice(0, 10),
      })

      await createSeatAccess(seatInfo.seat, {
        qr_token: `seat-${seatInfo.seat}-${seatInfo.flightNumber}`,
        device_label: "nextjs-passenger-web",
        preferred_language: toBackendLanguage(locale),
        metadata: {
          route: seatInfo.route,
        },
      })

      setPassengerReady(true)
      const response = await listPassengerRequests(seatInfo.seat)
      setActiveRequest(
        response.items.find(
          (request) =>
            request.status !== "completed" && request.status !== "cancelled",
        ) || response.items[0] || null,
      )
      navigate("dashboard")
    } catch (error) {
      setFlowError(formatError(error))
    } finally {
      setIsInitializing(false)
    }
  }, [locale, navigate, seatInfo])

  const submitRequest = useCallback(
    async ({
      category,
      requestText,
      source,
      metadata,
      nextScreen = "request-tracking",
      audioBlob,
    }: {
      category: string
      requestText: string
      source: "typed" | "quick_action" | "speech"
      metadata?: Record<string, unknown>
      nextScreen?: Screen
      audioBlob?: Blob
    }) => {
      setIsSubmittingRequest(true)
      setFlowError(null)

      try {
        if (!passengerReady) {
          await initializePassengerSession()
        }

        let request: PassengerRequestRecord
        if (source === "speech") {
          if (!audioBlob) {
            throw new Error("Voice recording is missing.")
          }
          request = await createVoicePassengerRequest(seatInfo.seat, {
            audio: audioBlob,
            source_language: toBackendLanguage(locale),
          })
        } else {
          request = await createPassengerRequest(seatInfo.seat, {
            category,
            request_text: requestText,
            source,
            source_language: toBackendLanguage(locale),
            metadata: metadata || {},
          })
        }

        setActiveRequest(request)
        setHistory([])
        setScreen(nextScreen)
        return true
      } catch (error) {
        setFlowError(formatError(error))
        return false
      } finally {
        setIsSubmittingRequest(false)
      }
    },
    [initializePassengerSession, locale, passengerReady, seatInfo.seat],
  )

  return (
    <div className="min-h-screen bg-background">
      {flowError && (
        <div className="mx-auto max-w-2xl px-4 pt-4">
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {flowError}
          </div>
        </div>
      )}

      {screen === "language" && (
        <LanguageSelection
          isLoading={isInitializing}
          onContinue={() => void initializePassengerSession()}
        />
      )}

      {screen === "dashboard" && (
        <Dashboard
          seatInfo={seatInfo}
          activeRequest={activeRequest}
          onServiceSelect={(service) => {
            setSelectedCategory(service)
            navigate("service-selection")
          }}
          onCustomRequest={() => navigate("custom-request")}
          onSOS={() => navigate("sos")}
          onRequestDetails={() => {
            if (activeRequest) {
              navigate("request-tracking")
            }
          }}
          onFeedback={() => navigate("feedback")}
        />
      )}

      {screen === "service-selection" && (
        <ServiceSelection
          category={selectedCategory}
          isSubmitting={isSubmittingRequest}
          onBack={goBack}
          onConfirm={(itemKey) => {
            const itemLabel = resolveItemLabel(itemKey)
            setSelectedItemKey(itemKey)
            void submitRequest({
              category: selectedCategory,
              requestText: itemLabel,
              source: "quick_action",
              metadata: {
                item_key: itemKey,
              },
            })
          }}
          onItemDetail={(itemKey) => {
            setSelectedItemKey(itemKey)
            navigate("snack-detail")
          }}
        />
      )}

      {screen === "snack-detail" && (
        <SnackDetail
          isSubmitting={isSubmittingRequest}
          itemName={resolveItemLabel(selectedItemKey)}
          onBack={goBack}
          onConfirm={() =>
            void submitRequest({
              category: selectedCategory,
              requestText: resolveItemLabel(selectedItemKey),
              source: "quick_action",
              metadata: {
                item_key: selectedItemKey,
              },
            })
          }
        />
      )}

      {screen === "custom-request" && (
        <CustomRequest
          isSubmitting={isSubmittingRequest}
          onBack={goBack}
          onConfirm={(requestText) =>
            void submitRequest({
              category: "custom",
              requestText,
              source: "typed",
            })
          }
          onVoiceConfirm={(audioBlob) =>
            submitRequest({
              category: "custom",
              requestText: "",
              source: "speech",
              audioBlob,
            })
          }
        />
      )}

      {screen === "request-tracking" && (
        <RequestTracking
          itemName={
            activeRequest?.request_text || resolveItemLabel(selectedItemKey)
          }
          request={activeRequest}
          seatInfo={seatInfo}
          onBack={() => {
            setHistory([])
            setScreen("dashboard")
          }}
        />
      )}

      {screen === "sos" && (
        <SOSFlow
          isSubmitting={isSubmittingRequest}
          onCancel={goBack}
          onComplete={() => {
            setHistory([])
            setScreen("dashboard")
          }}
          onConfirm={() =>
            submitRequest({
              category: "sos",
              requestText: "SOS assistance needed at seat",
              source: "quick_action",
              nextScreen: "sos",
            })
          }
          seat={seatInfo.seat}
        />
      )}

      {screen === "feedback" && (
        <FeedbackSurvey
          onBack={goBack}
          onComplete={() => navigate("thank-you")}
        />
      )}

      {screen === "thank-you" && (
        <ThankYou
          onDone={() => {
            setHistory([])
            setScreen("dashboard")
          }}
        />
      )}
    </div>
  )
}

export default function CabinClickApp() {
  return (
    <LanguageProvider>
      <CabinClickFlow />
    </LanguageProvider>
  )
}
