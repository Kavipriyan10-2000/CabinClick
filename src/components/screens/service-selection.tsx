"use client"

import { useState } from "react"
import { ArrowRight, Check, ShoppingBag } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { CabinHeader } from "@/components/cabin-header"
import { SERVICE_ITEMS } from "@/lib/service-items"

type ServiceSelectionProps = {
  onBack: () => void
  onConfirm: (item: string) => void
  onItemDetail: (item: string) => void
  category?: string
}

const CATEGORIES = ["drinks", "food", "comfort", "hygiene", "practical", "medical"] as const

export function ServiceSelection({
  onBack,
  onConfirm,
  onItemDetail,
  category = "drinks",
}: ServiceSelectionProps) {
  const { t } = useLanguage()
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState(category)

  const categoryLabels: Record<string, string> = {
    drinks: t.drinks,
    food: t.food,
    comfort: t.comfort,
    hygiene: t.hygiene,
    practical: t.practical,
    medical: t.medical,
  }

  const currentItems = SERVICE_ITEMS[activeTab] || SERVICE_ITEMS.drinks

  function handleItemClick(itemKey: string) {
    setSelectedItem(itemKey)
    // For food items, tap opens detail view
    if (activeTab === "food") {
      onItemDetail(itemKey)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CabinHeader showBack onBack={onBack} title={categoryLabels[activeTab]} />

      {/* Category tabs */}
      <nav className="bg-card border-b border-border overflow-x-auto" aria-label="Service categories">
        <div className="flex px-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveTab(cat)
                setSelectedItem(null)
              }}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === cat
                  ? "border-cabin-gold text-cabin-navy"
                  : "border-transparent text-muted-foreground hover:text-cabin-navy"
              }`}
              aria-current={activeTab === cat ? "page" : undefined}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </div>
      </nav>

      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {currentItems.map((item) => {
            const label = (t as Record<string, string>)[item.labelKey] || item.labelKey
            const desc = (t as Record<string, string>)[item.descKey] || item.descKey

            return (
              <button
                key={item.key}
                onClick={() => handleItemClick(item.key)}
                className={`relative bg-card rounded-xl p-5 flex flex-col items-center gap-2 border-2 transition-all ${
                  selectedItem === item.key
                    ? "border-cabin-gold shadow-md"
                    : "border-border hover:border-cabin-gold/50"
                }`}
                aria-pressed={selectedItem === item.key}
              >
                {selectedItem === item.key && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-cabin-gold rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-cabin-navy" />
                  </div>
                )}
                <div className="w-12 h-12 bg-[#E8F0FE] rounded-full flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-cabin-navy" />
                </div>
                <span className="text-cabin-navy font-semibold text-sm text-center">
                  {label}
                </span>
                <span className="text-muted-foreground text-xs text-center leading-relaxed">
                  {desc}
                </span>
              </button>
            )
          })}
        </div>
      </main>

      {/* Confirm button */}
      <div className="sticky bottom-0 px-4 pb-4 pt-2 bg-gradient-to-t from-background to-transparent">
        <button
          onClick={() => selectedItem && onConfirm(selectedItem)}
          disabled={!selectedItem}
          className="w-full max-w-2xl mx-auto bg-cabin-gold text-cabin-navy font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t.confirmSelection}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
