"use client"

import { AlertTriangle, Info, Check, Droplet, Leaf, Circle, Square } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { CabinHeader } from "@/components/cabin-header"
import Image from "next/image"

type SnackDetailProps = {
  onBack: () => void
  onConfirm: () => void
  itemName?: string
  isSubmitting?: boolean
}

const ingredients = [
  { icon: Square, name: "Wheat Flour", desc: "Main base, contains gluten", pct: "45%" },
  { icon: Droplet, name: "Milk Solids", desc: "Adds richness, contains lactose", pct: "12%" },
  { icon: Circle, name: "Whole Eggs", desc: "Binding agent", pct: "8%" },
  { icon: Leaf, name: "Herbs & Spices", desc: "Seasoning blend", pct: "2%" },
]

const allergens = ["Gluten", "Dairy", "Nuts"]

export function SnackDetail({
  onBack,
  onConfirm,
  itemName,
  isSubmitting = false,
}: SnackDetailProps) {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CabinHeader showBack onBack={onBack} showUser />

      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-cabin-navy mb-2">
          {itemName || t.snack}
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-md">
          {t.snackDescription}
        </p>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Image and allergens */}
          <div className="md:w-1/2">
            <div className="rounded-xl overflow-hidden mb-4">
              <Image
                src="/images/snack.jpg"
                alt="Premium in-flight snack"
                width={400}
                height={300}
                className="w-full h-48 object-cover"
              />
            </div>

            <div className="border-l-4 border-cabin-gold bg-[#FFF9E6] rounded-r-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-cabin-gold" />
                <span className="text-cabin-gold font-bold text-xs">
                  {t.containsAllergens}
                </span>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                {t.allergenWarning}
              </p>
            </div>

            <p className="text-cabin-navy font-bold text-xs tracking-wider mb-2">
              {t.detectedAllergens}
            </p>
            <div className="flex gap-2">
              {allergens.map((a) => (
                <span
                  key={a}
                  className="px-3 py-1.5 bg-muted rounded-full text-cabin-navy text-xs font-medium"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>

          {/* Ingredients */}
          <div className="md:w-1/2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-cabin-navy font-bold text-lg">{t.ingredients}</h2>
              <span className="text-muted-foreground text-xs">{t.perServing}</span>
            </div>

            <div className="flex flex-col gap-3">
              {ingredients.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-3 bg-card rounded-xl p-3 border border-border"
                >
                  <div className="w-10 h-10 bg-[#E8F0FE] rounded-full flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-cabin-navy" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-cabin-navy text-sm">
                      {item.name}
                    </p>
                    <p className="text-muted-foreground text-xs">{item.desc}</p>
                  </div>
                  <span className="text-muted-foreground text-sm font-medium">
                    {item.pct}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
              <div>
                <p className="text-muted-foreground text-xs">{t.totalCalories}</p>
                <p className="text-cabin-navy font-bold text-xl">340 kcal</p>
              </div>
              <button
                className="w-8 h-8 bg-cabin-navy rounded-full flex items-center justify-center"
                aria-label="More information"
              >
                <Info className="w-4 h-4 text-[#FFFFFF]" />
              </button>
            </div>

            <button
              onClick={onConfirm}
              disabled={isSubmitting}
              className="w-full mt-6 bg-cabin-navy text-[#FFFFFF] font-semibold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.98]"
            >
              {isSubmitting ? "Submitting..." : t.confirmRequest}
              <Check className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
