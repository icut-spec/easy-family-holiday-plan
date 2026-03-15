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

export interface ItineraryActivity {
  id: string
  time: string   // e.g. "10:00"
  title: string
}

export interface ItineraryDay {
  date: string                    // ISO date string e.g. "2025-07-01"
  activities: ItineraryActivity[]
}

export interface BudgetEntry {
  id: string
  category: 'Hotel' | 'Food' | 'Transport' | 'Activities' | 'Other'
  description: string
  amount: number
}

export interface TripRecord {
  id: string
  title: string
  trip: Trip
  members: FamilyMember[]
  packingItems: PackingItem[]
  itinerary: ItineraryDay[]
  budget: BudgetEntry[]
  createdAt: string   // ISO timestamp
}

export interface AppState {
  trip: Trip
  members: FamilyMember[]
  packingItems: PackingItem[]
  trips: TripRecord[]
  currentTripId: string | null
}
