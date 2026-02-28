"use client"

import { useState, useCallback } from "react"
import { LanguageProvider } from "@/lib/language-context"
import { LanguageSelection } from "@/components/screens/language-selection"
import { Dashboard } from "@/components/screens/dashboard"
import { ServiceSelection } from "@/components/screens/service-selection"
import { SnackDetail } from "@/components/screens/snack-detail"
import { CustomRequest } from "@/components/screens/custom-request"
import { RequestTracking } from "@/components/screens/request-tracking"
import { SOSFlow } from "@/components/screens/sos-flow"
import { FeedbackSurvey } from "@/components/screens/feedback-survey"
import { ThankYou } from "@/components/screens/thank-you"

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

export default function CabinClickApp() {
  const [screen, setScreen] = useState<Screen>("language")
  const [selectedCategory, setSelectedCategory] = useState("drinks")
  const [selectedItemName, setSelectedItemName] = useState("Water")
  const [history, setHistory] = useState<Screen[]>([])

  const navigate = useCallback(
    (to: Screen) => {
      setHistory((prev) => [...prev, screen])
      setScreen(to)
    },
    [screen]
  )

  const goBack = useCallback(() => {
    const prev = history[history.length - 1]
    if (prev) {
      setHistory((h) => h.slice(0, -1))
      setScreen(prev)
    } else {
      setScreen("dashboard")
    }
  }, [history])

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background">
        {screen === "language" && (
          <LanguageSelection onContinue={() => navigate("dashboard")} />
        )}

        {screen === "dashboard" && (
          <Dashboard
            onServiceSelect={(service) => {
              setSelectedCategory(service)
              navigate("service-selection")
            }}
            onCustomRequest={() => navigate("custom-request")}
            onSOS={() => navigate("sos")}
            onRequestDetails={() => navigate("request-tracking")}
            onFeedback={() => navigate("feedback")}
          />
        )}

        {screen === "service-selection" && (
          <ServiceSelection
            category={selectedCategory}
            onBack={goBack}
            onConfirm={(item) => {
              setSelectedItemName(item)
              navigate("request-tracking")
            }}
            onItemDetail={(item) => {
              setSelectedItemName(item)
              navigate("snack-detail")
            }}
          />
        )}

        {screen === "snack-detail" && (
          <SnackDetail
            onBack={goBack}
            onConfirm={() => navigate("request-tracking")}
          />
        )}

        {screen === "custom-request" && (
          <CustomRequest
            onBack={goBack}
            onConfirm={() => navigate("request-tracking")}
          />
        )}

        {screen === "request-tracking" && (
          <RequestTracking
            itemName={selectedItemName}
            onBack={() => {
              setHistory([])
              setScreen("dashboard")
            }}
          />
        )}

        {screen === "sos" && (
          <SOSFlow
            onCancel={goBack}
            onComplete={() => {
              setHistory([])
              setScreen("dashboard")
            }}
            seat="14A"
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
    </LanguageProvider>
  )
}
