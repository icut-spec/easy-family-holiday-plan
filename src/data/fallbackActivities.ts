import type { Activity, HolidayType } from '../types'

type FallbackActivity = Omit<Activity, 'id' | 'googleMapsUrl' | 'source'>

const fallbackData: Record<HolidayType, FallbackActivity[]> = {
  beach: [
    { name: 'Snorkeling', description: 'Explore underwater life along the coast.', petFriendly: false },
    { name: 'Beach Volleyball', description: 'Fun for all ages on the sand.', petFriendly: true },
    { name: 'Sunset Walk', description: 'A relaxing stroll along the shoreline at dusk.', petFriendly: true },
    { name: 'Sandcastle Building', description: 'Classic beach fun for kids and families.', petFriendly: true },
  ],
  mountains: [
    { name: 'Hiking', description: 'Explore scenic mountain trails at your own pace.', petFriendly: true },
    { name: 'Cable Car Ride', description: 'Take in breathtaking views from above.', petFriendly: false },
    { name: 'Mountain Biking', description: 'Thrilling trails for adventurous riders.', petFriendly: false },
    { name: 'Stargazing', description: 'Clear mountain skies make for incredible night views.', petFriendly: true },
  ],
  city: [
    { name: 'Museum Visit', description: 'Discover local history, art and culture.', petFriendly: false },
    { name: 'City Walking Tour', description: 'Explore landmarks and hidden gems on foot.', petFriendly: true },
    { name: 'Local Food Market', description: 'Taste fresh produce and regional specialities.', petFriendly: true },
    { name: 'Zoo', description: 'A full day of wildlife for kids and families.', petFriendly: false },
  ],
  camping: [
    { name: 'Campfire Night', description: 'Gather around the fire for stories and s\'mores.', petFriendly: true },
    { name: 'Nature Trail', description: 'Follow marked paths through forests and meadows.', petFriendly: true },
    { name: 'Bird Watching', description: 'Spot local wildlife with binoculars at dawn.', petFriendly: true },
    { name: 'Kayaking', description: 'Paddle through calm lakes or gentle rivers.', petFriendly: false },
  ],
  other: [
    { name: 'Picnic in the Park', description: 'Relax outdoors with food and family.', petFriendly: true },
    { name: 'Cycling', description: 'Explore the area on two wheels.', petFriendly: true },
    { name: 'Swimming', description: 'Cool off at a local pool or lake.', petFriendly: false },
    { name: 'Board Games Night', description: 'Stay in and enjoy classic family games.', petFriendly: true },
  ],
}

export function getFallbackActivities(
  holidayType: HolidayType,
  destination: string
): Activity[] {
  return fallbackData[holidayType].map((a, i) => ({
    ...a,
    id: `fallback-${holidayType}-${i}`,
    source: 'fallback' as const,
    googleMapsUrl: `https://www.google.com/maps/search/${encodeURIComponent(a.name + ' ' + destination)}`,
  }))
}
