"use client"

import { useState } from "react"
import { ArrowRight, Check, Plus, Minus } from "lucide-react"
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
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  const categoryLabels: Record<string, string> = {
    drinks: t.drinks,
    food: t.food,
    comfort: t.comfort,
    hygiene: t.hygiene,
    practical: t.practical,
    medical: t.medical,
  }

  const currentItems = SERVICE_ITEMS[activeTab] || SERVICE_ITEMS.drinks
  const showQuantity = activeTab === "drinks" || activeTab === "food"

  function getQty(key: string) {
    return quantities[key] ?? 1
  }

  function changeQty(key: string, delta: number) {
    setQuantities((prev) => ({
      ...prev,
      [key]: Math.max(1, Math.min(5, (prev[key] ?? 1) + delta)),
    }))
  }

  function handleItemClick(itemKey: string) {
    setSelectedItem(itemKey)
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
            const isSelected = selectedItem === item.key
            const qty = getQty(item.key)

            return (
              <button
                key={item.key}
                onClick={() => handleItemClick(item.key)}
                className={`relative bg-card rounded-xl p-4 flex flex-col items-center gap-2 border-2 transition-all ${
                  isSelected
                    ? "border-cabin-gold shadow-md scale-[1.02]"
                    : "border-border hover:border-cabin-gold/50 hover:shadow-sm"
                }`}
                aria-pressed={isSelected}
              >
                {isSelected && (
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

                {/* Quantity selector for drinks/food */}
                {showQuantity && isSelected && (
                  <div
                    className="flex items-center gap-2 mt-1 bg-muted rounded-lg px-2 py-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); changeQty(item.key, -1) }}
                      className="w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center hover:border-cabin-navy transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3 text-cabin-navy" />
                    </button>
                    <span className="text-cabin-navy font-bold text-sm w-4 text-center">{qty}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); changeQty(item.key, 1) }}
                      className="w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center hover:border-cabin-navy transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3 text-cabin-navy" />
                    </button>
                  </div>
                )}
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
          className="w-full max-w-2xl mx-auto bg-cabin-gold text-cabin-navy font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99]"
        >
          {t.confirmSelection}
          {selectedItem && showQuantity && getQty(selectedItem) > 1 && (
            <span className="bg-cabin-navy text-cabin-gold text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {getQty(selectedItem)}
            </span>
          )}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
