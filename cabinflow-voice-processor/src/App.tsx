/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import { Mic, Square, Upload, Loader2, Plane, CheckCircle2, AlertCircle, Volume2, History } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// --- Types ---
interface ProcessingResult {
  language?: string;
  originalText?: string;
  englishTranslation?: string;
  extractedItems?: string[];
  responseToPassenger?: string;
  isValid: boolean;
  rawOutput: string;
}

interface HistoryItem extends ProcessingResult {
  id: string;
  timestamp: Date;
}

// --- Constants ---
const SYSTEM_INSTRUCTION = `
You are CabinFlow Voice Processor, an AI assistant for in-flight cabin service.
Your task is to process passenger audio.
You must:
Detect the spoken language.
Transcribe exactly what the passenger said.
Translate it into clean, grammatically correct English.
Identify ALL requested items.
Separate items into:
Available onboard
Not available onboard
Respond appropriately.

Available onboard items include realistic economy cabin service items such as:
drinks (water, tea, coffee, juice, soft drinks, alcohol)
food (snacks, meals, baby food, warm milk)
comfort (blanket, pillow, headphones, eye mask, earplugs)
hygiene (tissues, napkins, toothbrush, toothpaste, wipes)
assistance (seat issue, tray issue, overhead bin help, USB help)
medical (motion sickness bag, feeling unwell, medication, emergency help)

Items NOT available onboard include:
Personal electronics (phones, laptops, chargers not provided by airline)
Outside food delivery (pizza, restaurant food, Uber Eats)
Shopping requests
Hotel booking
Transportation booking
Any external service

OUTPUT FORMAT (READABLE TEXT ONLY)
Language detected: <language name>
Passenger said: "<original transcription>"
English translation: "<clean corrected English sentence>"

If there are valid items:
Items being sent to crew:
item 1
item 2

If there are invalid items:
Message to passenger (in original language):
"<polite explanation stating which items cannot be provided>"

Rules:
Do NOT output JSON.
Do NOT use markdown.
Extract ALL mentioned items.
Do NOT invent items.
If mixed request, accept valid items and politely decline invalid ones.
Passenger message must always be in original language.
Tone must be calm and professional.
You are an operational cabin voice processor, not a chatbot.
`;

export default function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // --- Audio Recording Logic ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        await processAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Microphone access denied. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Stop all tracks to release the microphone
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  // --- Gemini API Integration ---
  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(",")[1];
        
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [
            {
              parts: [
                { text: "Process this in-flight service request audio." },
                {
                  inlineData: {
                    mimeType: audioBlob.type || "audio/webm",
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.1, // Low temperature for consistent formatting
          },
        });

        const text = response.text || "";
        parseResult(text);
      };
    } catch (err) {
      console.error("Error processing audio:", err);
      setError("Failed to process audio. Please try again.");
      setIsProcessing(false);
    }
  };

  const parseResult = (text: string) => {
    const lines = text.split("\n").map(l => l.trim()).filter(l => l);
    const resultObj: Partial<ProcessingResult> = { 
      rawOutput: text, 
      isValid: true, // Default to true, will be set based on presence of items/messages
      extractedItems: []
    };

    let isExtractingItems = false;
    let isExtractingMessage = false;

    lines.forEach(line => {
      if (line.startsWith("Language detected:")) {
        resultObj.language = line.replace("Language detected:", "").trim();
        isExtractingItems = false;
        isExtractingMessage = false;
      }
      else if (line.startsWith("Passenger said:")) {
        resultObj.originalText = line.replace("Passenger said:", "").trim().replace(/^"(.*)"$/, "$1");
        isExtractingItems = false;
        isExtractingMessage = false;
      }
      else if (line.startsWith("English translation:")) {
        resultObj.englishTranslation = line.replace("English translation:", "").trim().replace(/^"(.*)"$/, "$1");
        isExtractingItems = false;
        isExtractingMessage = false;
      }
      else if (line.startsWith("Items being sent to crew:")) {
        isExtractingItems = true;
        isExtractingMessage = false;
      }
      else if (line.startsWith("Message to passenger (in original language):") || line.startsWith("Message to passenger:")) {
        isExtractingMessage = true;
        isExtractingItems = false;
      }
      else if (isExtractingItems) {
        resultObj.extractedItems?.push(line);
      }
      else if (isExtractingMessage) {
        const msg = line.replace(/^"(.*)"$/, "$1");
        resultObj.responseToPassenger = resultObj.responseToPassenger ? resultObj.responseToPassenger + " " + msg : msg;
      }
    });

    // If there's a message to the passenger, it means there was at least one invalid item
    // If there are no items for the crew, it's fully invalid
    const finalResult = resultObj as ProcessingResult;
    finalResult.isValid = (finalResult.extractedItems?.length || 0) > 0;
    
    setResult(finalResult);
    setHistory(prev => [{ ...finalResult, id: Math.random().toString(36).substr(2, 9), timestamp: new Date() }, ...prev].slice(0, 10));
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Header */}
      <header className="border-b border-[#141414] p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-[#141414] p-2 rounded-lg">
            <Plane className="text-[#E4E3E0] w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif italic text-2xl tracking-tight leading-none">CabinFlow</h1>
            <p className="text-[10px] uppercase tracking-widest opacity-50 font-mono mt-1">Voice Processor v1.0</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest opacity-50 font-mono">Status</span>
            <span className="flex items-center gap-2 text-xs font-mono">
              <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></span>
              {isRecording ? 'RECORDING' : 'READY'}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls Section */}
        <section className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-[#141414] p-6 rounded-2xl shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
            <h2 className="font-serif italic text-lg mb-4">Audio Input</h2>
            
            <div className="space-y-4">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`w-full py-8 rounded-xl border-2 border-[#141414] flex flex-col items-center justify-center gap-4 transition-all active:translate-y-1 active:shadow-none ${
                  isRecording 
                    ? 'bg-red-50 border-red-500 text-red-600 shadow-[0px_4px_0px_0px_rgba(239,68,68,1)]' 
                    : 'bg-[#E4E3E0] hover:bg-[#D4D3D0] shadow-[0px_4px_0px_0px_rgba(20,20,20,1)]'
                }`}
              >
                {isRecording ? (
                  <>
                    <Square className="w-10 h-10 fill-current" />
                    <span className="font-mono text-sm font-bold tracking-widest uppercase">Stop Recording</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-10 h-10" />
                    <span className="font-mono text-sm font-bold tracking-widest uppercase">Start Recording</span>
                  </>
                )}
              </button>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}
          </div>

          <div className="bg-[#141414] text-[#E4E3E0] p-6 rounded-2xl shadow-[4px_4px_0px_0px_rgba(228,227,224,1)]">
            <h2 className="font-serif italic text-lg mb-4 opacity-80">System Status</h2>
            <div className="space-y-3 font-mono text-[10px] uppercase tracking-widest">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="opacity-50">Engine</span>
                <span>Gemini 3.1 Flash</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="opacity-50">Latency</span>
                <span>~1.2s</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-50">Context</span>
                <span>Cabin Service</span>
              </div>
            </div>
          </div>
        </section>

        {/* Results Section */}
        <section className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {isProcessing ? (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full min-h-[400px] bg-white border border-[#141414] rounded-2xl flex flex-col items-center justify-center p-12 text-center shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]"
              >
                <Loader2 className="w-12 h-12 animate-spin mb-6 opacity-20" />
                <h3 className="font-serif italic text-2xl mb-2">Processing Audio...</h3>
                <p className="text-sm opacity-50 max-w-xs mx-auto">Analyzing language, transcribing, and extracting service intent.</p>
              </motion.div>
            ) : result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-[#141414] rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]"
              >
                <div className={`p-4 flex justify-between items-center border-b border-[#141414] ${result.isValid ? 'bg-green-50' : result.responseToPassenger ? 'bg-amber-50' : 'bg-red-50'}`}>
                  <div className="flex items-center gap-2">
                    {result.isValid && !result.responseToPassenger ? (
                      <CheckCircle2 className="text-green-600 w-5 h-5" />
                    ) : result.isValid && result.responseToPassenger ? (
                      <AlertCircle className="text-amber-600 w-5 h-5" />
                    ) : (
                      <AlertCircle className="text-red-600 w-5 h-5" />
                    )}
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest">
                      {result.isValid && !result.responseToPassenger ? 'Valid Service Request' : 
                       result.isValid && result.responseToPassenger ? 'Mixed Request / Partial Fulfillment' :
                       'Invalid Request / Decline'}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] opacity-50">{new Date().toLocaleTimeString()}</span>
                </div>

                <div className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest opacity-50 font-mono">Detected Language</label>
                      <p className="text-xl font-serif italic">{result.language || 'Unknown'}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest opacity-50 font-mono">Items Sent to Crew</label>
                      <div className="flex flex-wrap gap-2">
                        {result.extractedItems && result.extractedItems.length > 0 ? (
                          result.extractedItems.map((item, idx) => (
                            <span key={idx} className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border bg-[#141414] text-[#E4E3E0] border-[#141414]">
                              {item}
                            </span>
                          ))
                        ) : (
                          <p className="text-xl font-mono font-bold uppercase opacity-30">None</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest opacity-50 font-mono">Original Transcription</label>
                      <div className="bg-[#E4E3E0] p-4 rounded-xl border border-[#141414]/10 italic">
                        "{result.originalText}"
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest opacity-50 font-mono">English Translation</label>
                      <div className="bg-[#141414] text-[#E4E3E0] p-4 rounded-xl font-medium">
                        {result.englishTranslation}
                      </div>
                    </div>

                    {result.responseToPassenger && (
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-amber-600 font-mono">Message to Passenger</label>
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-900 italic">
                          "{result.responseToPassenger}"
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full min-h-[400px] border-2 border-dashed border-[#141414]/20 rounded-2xl flex flex-col items-center justify-center p-12 text-center">
                <Volume2 className="w-12 h-12 mb-6 opacity-10" />
                <h3 className="font-serif italic text-2xl mb-2 opacity-30">Waiting for Input</h3>
                <p className="text-sm opacity-20 max-w-xs mx-auto">Record a passenger request to begin processing.</p>
              </div>
            )}
          </AnimatePresence>

          {/* History List */}
          {history.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 opacity-50">
                <History className="w-4 h-4" />
                <h3 className="font-mono text-[10px] uppercase tracking-widest font-bold">Recent Requests</h3>
              </div>
              <div className="space-y-2">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setResult(item)}
                    className="w-full bg-white border border-[#141414] p-4 rounded-xl flex items-center justify-between hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${item.isValid ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                      <div className="text-left">
                        <p className="font-mono text-xs font-bold uppercase">
                          {item.extractedItems && item.extractedItems.length > 0 
                            ? item.extractedItems.join(", ") 
                            : 'Invalid Request'}
                        </p>
                        <p className="text-[10px] opacity-50">{item.language} • {item.timestamp.toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity font-mono text-[10px] uppercase tracking-widest">View Details →</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="max-w-6xl mx-auto p-6 mt-12 border-t border-[#141414]/10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] uppercase tracking-widest opacity-30 font-mono">© 2026 CabinFlow Systems Inc.</p>
          <div className="flex gap-6">
            <a href="#" className="text-[10px] uppercase tracking-widest opacity-30 hover:opacity-100 font-mono transition-opacity">Documentation</a>
            <a href="#" className="text-[10px] uppercase tracking-widest opacity-30 hover:opacity-100 font-mono transition-opacity">Privacy Policy</a>
            <a href="#" className="text-[10px] uppercase tracking-widest opacity-30 hover:opacity-100 font-mono transition-opacity">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
