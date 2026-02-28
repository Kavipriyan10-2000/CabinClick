"use client"

import { useEffect, useRef, useState } from "react"
import { Mic, Keyboard, Info, Send } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { CabinHeader } from "@/components/cabin-header"

type CustomRequestProps = {
  onBack: () => void
  onConfirm: (requestText: string) => void
  onVoiceConfirm: (audioBlob: Blob) => Promise<boolean>
  isSubmitting?: boolean
}

const MICROPHONE_HINT =
  "Tap the microphone to allow access and send a voice request."
const MICROPHONE_UNSUPPORTED_MESSAGE =
  "Microphone recording is not supported in this browser."
const MICROPHONE_DENIED_MESSAGE =
  "Microphone permission is required for voice requests."
const MICROPHONE_EMPTY_MESSAGE =
  "No voice input was captured. Please try again."
const MICROPHONE_FAILED_MESSAGE =
  "Voice request could not be sent. Please type your request."

export function CustomRequest({
  onBack,
  onConfirm,
  onVoiceConfirm,
  isSubmitting = false,
}: CustomRequestProps) {
  const { t, locale } = useLanguage()
  const [requestText, setRequestText] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isVoiceSubmitting, setIsVoiceSubmitting] = useState(false)
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])

  function stopMediaStream() {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop())
    mediaStreamRef.current = null
  }

  async function processRecordedAudio(mimeType: string) {
    const audioBlob = new Blob(recordedChunksRef.current, { type: mimeType })
    recordedChunksRef.current = []
    stopMediaStream()
    setIsRecording(false)

    if (audioBlob.size === 0) {
      setVoiceError(MICROPHONE_EMPTY_MESSAGE)
      return
    }

    setIsVoiceSubmitting(true)
    setVoiceError(null)

    try {
      const didSubmit = await onVoiceConfirm(audioBlob)
      if (!didSubmit) {
        setVoiceError(MICROPHONE_FAILED_MESSAGE)
      }
    } catch {
      setVoiceError(MICROPHONE_FAILED_MESSAGE)
    } finally {
      setIsVoiceSubmitting(false)
    }
  }

  async function startRecording() {
    if (
      typeof window === "undefined" ||
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setVoiceError(MICROPHONE_UNSUPPORTED_MESSAGE)
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream
      recordedChunksRef.current = []
      setVoiceError(null)

      const preferredMimeTypes = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"]
      const supportedMimeType = preferredMimeTypes.find((mimeType) =>
        typeof MediaRecorder.isTypeSupported === "function"
          ? MediaRecorder.isTypeSupported(mimeType)
          : false,
      )
      const recorder = supportedMimeType
        ? new MediaRecorder(stream, { mimeType: supportedMimeType })
        : new MediaRecorder(stream)

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data)
        }
      }
      recorder.onstop = () => {
        void processRecordedAudio(recorder.mimeType || "audio/webm")
      }

      mediaRecorderRef.current = recorder
      recorder.start()
      setIsRecording(true)
    } catch (error) {
      stopMediaStream()
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        setVoiceError(MICROPHONE_DENIED_MESSAGE)
        return
      }
      setVoiceError("Unable to access microphone. Please try again.")
    }
  }

  async function handleVoiceToggle() {
    if (isSubmitting || isVoiceSubmitting) {
      return
    }

    if (isRecording) {
      mediaRecorderRef.current?.stop()
      return
    }

    await startRecording()
  }

  function handleSubmit() {
    const trimmedRequest = requestText.trim()
    if (!trimmedRequest || isSubmitting || isVoiceSubmitting || isRecording) {
      return
    }
    onConfirm(trimmedRequest)
  }

  useEffect(() => {
    return () => {
      const recorder = mediaRecorderRef.current
      if (recorder && recorder.state !== "inactive") {
        recorder.ondataavailable = null
        recorder.onstop = null
        recorder.stop()
      }
      stopMediaStream()
    }
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CabinHeader showBack onBack={onBack} title={t.customRequestTitle} />

      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full flex flex-col">
        <div className="bg-card rounded-2xl border border-border p-4 mb-4 flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <textarea
              value={requestText}
              onChange={(event) => setRequestText(event.target.value)}
              placeholder={t.yourRequestPlaceholder}
              className="flex-1 resize-none text-cabin-navy text-base bg-transparent focus:outline-none min-h-[160px] placeholder:text-muted-foreground"
              aria-label="Enter your request"
            />
            <span className="px-2 py-1 bg-muted rounded text-xs font-bold text-cabin-navy ml-2 flex-shrink-0">
              {locale.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border">
            <button
              disabled={isSubmitting || isVoiceSubmitting}
              className="text-muted-foreground transition-colors disabled:opacity-40"
              aria-label="Type your request"
            >
              <Keyboard className="w-5 h-5" />
            </button>
            <button
              onClick={() => void handleVoiceToggle()}
              disabled={isSubmitting || isVoiceSubmitting}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all disabled:opacity-40 ${
                isRecording ? "bg-cabin-red scale-110" : "bg-cabin-gold hover:scale-105"
              }`}
              aria-label={isRecording ? "Stop recording" : "Start voice recording"}
            >
              <Mic className={`w-6 h-6 ${isRecording ? "text-card" : "text-cabin-navy"}`} />
            </button>
            <div className="w-5" />
          </div>
        </div>

        <p className="text-xs text-muted-foreground mb-2">{MICROPHONE_HINT}</p>
        {isRecording && (
          <p className="text-xs text-cabin-navy mb-2">
            Recording... tap the microphone again to send.
          </p>
        )}
        {voiceError && <p className="text-xs text-cabin-red mb-2">{voiceError}</p>}

        <button
          onClick={handleSubmit}
          disabled={
            !requestText.trim() ||
            isSubmitting ||
            isVoiceSubmitting ||
            isRecording
          }
          className="w-full bg-cabin-navy text-card font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed mb-4 flex items-center justify-center gap-2"
        >
          {isSubmitting ? "Submitting..." : t.sendRequest}
          <Send className="w-4 h-4" />
        </button>

        <div className="mt-auto pt-4 flex items-center justify-center gap-2 text-muted-foreground text-xs">
          <Info className="w-3.5 h-3.5" />
          <span>{t.flightRelatedOnly}</span>
        </div>
      </main>
    </div>
  )
}
