import {
  Droplet,
  Coffee,
  Wine,
  Circle,
  Triangle,
  Moon,
  Square,
  Hexagon,
  Star,
  Sofa,
  EyeOff,
  Headphones,
  Home,
  Shirt,
  Droplets,
  Sparkles,
  Heart,
  Hand,
  Leaf,
  Plug,
  BookOpen,
  PenLine,
  Wifi,
  Smile,
  Pill,
  Shield,
  Thermometer,
  AlertCircle,
  Wind,
  Activity,
  type LucideIcon,
} from "lucide-react"

export type ServiceItem = {
  key: string
  icon: LucideIcon
  labelKey: string
  descKey: string
}

export const SERVICE_ITEMS: Record<string, ServiceItem[]> = {
  drinks: [
    { key: "water", icon: Droplet, labelKey: "water", descKey: "waterDesc" },
    { key: "juice", icon: Wine, labelKey: "juice", descKey: "juiceDesc" },
    { key: "tea", icon: Coffee, labelKey: "tea", descKey: "teaDesc" },
    { key: "coffee", icon: Coffee, labelKey: "coffee", descKey: "coffeeDesc" },
    { key: "soft-drink", icon: Droplets, labelKey: "softDrink", descKey: "softDrinkDesc" },
    { key: "alcoholic", icon: Wine, labelKey: "alcoholicBeverage", descKey: "alcoholicBeverageDesc" },
  ],
  food: [
    { key: "cookies", icon: Circle, labelKey: "cookies", descKey: "cookiesDesc" },
    { key: "chips", icon: Triangle, labelKey: "chips", descKey: "chipsDesc" },
    { key: "croissant", icon: Moon, labelKey: "croissant", descKey: "croissantDesc" },
    { key: "sandwich", icon: Square, labelKey: "sandwich", descKey: "sandwichDesc" },
    { key: "nuts", icon: Hexagon, labelKey: "nutsSnack", descKey: "nutsDesc" },
    { key: "icecream", icon: Star, labelKey: "iceCream", descKey: "iceCreamDesc" },
  ],
  comfort: [
    { key: "blanket", icon: Sofa, labelKey: "blanket", descKey: "blanketDesc" },
    { key: "pillow", icon: Moon, labelKey: "pillow", descKey: "pillowDesc" },
    { key: "eyemask", icon: EyeOff, labelKey: "eyeMask", descKey: "eyeMaskDesc" },
    { key: "earplugs", icon: Headphones, labelKey: "earPlugs", descKey: "earPlugsDesc" },
    { key: "slippers", icon: Home, labelKey: "slippers", descKey: "slippersDesc" },
    { key: "socks", icon: Shirt, labelKey: "socks", descKey: "socksDesc" },
  ],
  hygiene: [
    { key: "wipes", icon: Droplets, labelKey: "wetWipes", descKey: "wetWipesDesc" },
    { key: "sanitizer", icon: Sparkles, labelKey: "handSanitizer", descKey: "handSanitizerDesc" },
    { key: "toothbrush", icon: Heart, labelKey: "toothbrushKit", descKey: "toothbrushKitDesc" },
    { key: "tissues", icon: Hand, labelKey: "tissues", descKey: "tissuesDesc" },
    { key: "lipbalm", icon: Leaf, labelKey: "lipBalm", descKey: "lipBalmDesc" },
    { key: "skincare", icon: Sparkles, labelKey: "skincareKit", descKey: "skincareKitDesc" },
  ],
  practical: [
    { key: "headphones", icon: Headphones, labelKey: "headphonesItem", descKey: "headphonesItemDesc" },
    { key: "charger", icon: Plug, labelKey: "usbCharger", descKey: "usbChargerDesc" },
    { key: "magazine", icon: BookOpen, labelKey: "magazine", descKey: "magazineDesc" },
    { key: "pen", icon: PenLine, labelKey: "penPaper", descKey: "penPaperDesc" },
    { key: "wifi", icon: Wifi, labelKey: "wifiPass", descKey: "wifiPassDesc" },
    { key: "kidskit", icon: Smile, labelKey: "kidsKit", descKey: "kidsKitDesc" },
  ],
  medical: [
    { key: "painkiller", icon: Pill, labelKey: "painRelief", descKey: "painReliefDesc" },
    { key: "bandaid", icon: Shield, labelKey: "firstAidKit", descKey: "firstAidKitDesc" },
    { key: "thermometer", icon: Thermometer, labelKey: "thermometer", descKey: "thermometerDesc" },
    { key: "motionsick", icon: AlertCircle, labelKey: "motionSickness", descKey: "motionSicknessDesc" },
    { key: "oxygen", icon: Wind, labelKey: "oxygenMask", descKey: "oxygenMaskDesc" },
    { key: "doctor", icon: Activity, labelKey: "callDoctor", descKey: "callDoctorDesc" },
  ],
}
