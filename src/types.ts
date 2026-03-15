export type HolidayType = 'beach' | 'mountains' | 'city' | 'camping' | 'other'

export interface Trip {
  destination: string
  startDate: string
  endDate: string
  budget: number
  holidayType: HolidayType
  petFriendly: boolean
}

export interface FamilyMember {
  id: string
  type: 'adult' | 'child' | 'pet'
  name: string
  age?: number
  petType?: string
}

export interface Activity {
  id: string
  name: string
  description: string
  petFriendly: boolean
  googleMapsUrl: string
  source: 'api' | 'fallback'
}

export interface PackingItem {
  id: string
  label: string
  checked: boolean
  category: string
  requiredFor?: ('kids' | 'pets' | 'beach' | 'mountains' | 'city' | 'camping')[]
}

export interface AppState {
  trip: Trip
  members: FamilyMember[]
  packingItems: PackingItem[]
}
