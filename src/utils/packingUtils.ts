import type { PackingItem, HolidayType } from '../types'

// ── Seed data ──────────────────────────────────────────────────────────────

interface SeedItem {
  label: string
  category: string
  requiredFor?: PackingItem['requiredFor']
}

export const SEED_ITEMS: SeedItem[] = [
  // Always
  { label: 'Passports / ID', category: 'Documents' },
  { label: 'Travel insurance docs', category: 'Documents' },
  { label: 'Booking confirmations', category: 'Documents' },
  { label: 'Phone charger', category: 'Essentials' },
  { label: 'First aid kit', category: 'Essentials' },
  { label: 'Snacks', category: 'Essentials' },
  { label: 'Medications', category: 'Essentials' },
  { label: 'Toiletries', category: 'Clothing' },
  // Kids
  { label: 'Sunscreen (kids)', category: 'Kids', requiredFor: ['kids'] },
  { label: 'Extra clothes (kids)', category: 'Kids', requiredFor: ['kids'] },
  { label: 'Toys / games', category: 'Kids', requiredFor: ['kids'] },
  { label: "Kids' medicine", category: 'Kids', requiredFor: ['kids'] },
  // Pets
  { label: 'Pet food', category: 'Pets', requiredFor: ['pets'] },
  { label: 'Leash', category: 'Pets', requiredFor: ['pets'] },
  { label: 'Pet carrier', category: 'Pets', requiredFor: ['pets'] },
  { label: 'Vet records', category: 'Pets', requiredFor: ['pets'] },
  // Beach
  { label: 'Swimwear', category: 'Activities', requiredFor: ['beach'] },
  { label: 'Beach towels', category: 'Activities', requiredFor: ['beach'] },
  { label: 'Sunglasses', category: 'Activities', requiredFor: ['beach'] },
  { label: 'Flip flops', category: 'Activities', requiredFor: ['beach'] },
  { label: 'Sunscreen', category: 'Activities', requiredFor: ['beach'] },
  // Mountains
  { label: 'Warm jacket', category: 'Activities', requiredFor: ['mountains'] },
  { label: 'Hiking boots', category: 'Activities', requiredFor: ['mountains'] },
  { label: 'Thermos', category: 'Activities', requiredFor: ['mountains'] },
  { label: 'Map / compass', category: 'Activities', requiredFor: ['mountains'] },
  // City
  { label: 'Comfortable shoes', category: 'Activities', requiredFor: ['city'] },
  { label: 'City map / guide', category: 'Activities', requiredFor: ['city'] },
  { label: 'Day bag / backpack', category: 'Activities', requiredFor: ['city'] },
  // Camping
  { label: 'Tent', category: 'Activities', requiredFor: ['camping'] },
  { label: 'Sleeping bag', category: 'Activities', requiredFor: ['camping'] },
  { label: 'Torch / headlamp', category: 'Activities', requiredFor: ['camping'] },
  { label: 'Insect repellent', category: 'Activities', requiredFor: ['camping'] },
]

// Stable category ordering
export const CATEGORY_ORDER = ['Documents', 'Essentials', 'Clothing', 'Kids', 'Pets', 'Activities', 'Custom']

// ── Pure helpers ───────────────────────────────────────────────────────────

export function isRelevant(
  item: SeedItem,
  holidayType: HolidayType,
  hasKids: boolean,
  hasPets: boolean
): boolean {
  if (!item.requiredFor) return true
  return item.requiredFor.some(cond => {
    if (cond === 'kids') return hasKids
    if (cond === 'pets') return hasPets
    return cond === holidayType
  })
}

/**
 * Merge seed items into an existing packing list.
 *
 * Rules:
 * - Custom items (category === 'Custom') are always kept.
 * - Seed items that are still relevant are kept (preserving checked state).
 * - Seed items no longer relevant are removed UNLESS they were checked.
 * - New relevant seed items not yet in the list are appended as unchecked.
 */
export function mergePacking(
  existing: PackingItem[],
  holidayType: HolidayType,
  hasKids: boolean,
  hasPets: boolean,
  makeId: () => string = () => Math.random().toString(36).slice(2, 10)
): PackingItem[] {
  const relevantSeeds = SEED_ITEMS.filter(s => isRelevant(s, holidayType, hasKids, hasPets))
  const relevantLabels = new Set(relevantSeeds.map(s => s.label))

  const kept = existing.filter(item => {
    if (item.category === 'Custom') return true
    if (relevantLabels.has(item.label)) return true
    return item.checked
  })

  const keptLabels = new Set(kept.map(i => i.label))

  const newItems: PackingItem[] = relevantSeeds
    .filter(s => !keptLabels.has(s.label))
    .map(s => ({
      id: makeId(),
      label: s.label,
      category: s.category,
      checked: false,
      requiredFor: s.requiredFor,
    }))

  return [...kept, ...newItems]
}

export function groupByCategory(items: PackingItem[]): Map<string, PackingItem[]> {
  const map = new Map<string, PackingItem[]>()
  for (const cat of CATEGORY_ORDER) map.set(cat, [])
  for (const item of items) {
    const cat = CATEGORY_ORDER.includes(item.category) ? item.category : 'Custom'
    const bucket = map.get(cat) ?? []
    bucket.push(item)
    map.set(cat, bucket)
  }
  for (const [k, v] of map) if (v.length === 0) map.delete(k)
  return map
}
