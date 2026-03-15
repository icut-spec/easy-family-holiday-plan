import { describe, it, expect } from 'vitest'
import {
  isRelevant,
  mergePacking,
  groupByCategory,
  SEED_ITEMS,
  CATEGORY_ORDER,
} from '../src/utils/packingUtils'
import type { PackingItem } from '../src/types'

// ── Deterministic ID for tests ─────────────────────────────────────────────
let idCounter = 0
function makeId() {
  return `test-id-${++idCounter}`
}

// ── isRelevant ─────────────────────────────────────────────────────────────

describe('isRelevant', () => {
  it('returns true for items with no requiredFor (always-include)', () => {
    const item = { label: 'Passports / ID', category: 'Documents' }
    expect(isRelevant(item, 'other', false, false)).toBe(true)
    expect(isRelevant(item, 'beach', true, true)).toBe(true)
  })

  it('returns true for kids items when hasKids is true', () => {
    const item = { label: 'Toys / games', category: 'Kids', requiredFor: ['kids'] as PackingItem['requiredFor'] }
    expect(isRelevant(item, 'other', true, false)).toBe(true)
  })

  it('returns false for kids items when hasKids is false', () => {
    const item = { label: 'Toys / games', category: 'Kids', requiredFor: ['kids'] as PackingItem['requiredFor'] }
    expect(isRelevant(item, 'other', false, false)).toBe(false)
  })

  it('returns true for pets items when hasPets is true', () => {
    const item = { label: 'Pet food', category: 'Pets', requiredFor: ['pets'] as PackingItem['requiredFor'] }
    expect(isRelevant(item, 'other', false, true)).toBe(true)
  })

  it('returns false for pets items when hasPets is false', () => {
    const item = { label: 'Pet food', category: 'Pets', requiredFor: ['pets'] as PackingItem['requiredFor'] }
    expect(isRelevant(item, 'other', false, false)).toBe(false)
  })

  it('returns true for holiday-type items when type matches', () => {
    const item = { label: 'Swimwear', category: 'Activities', requiredFor: ['beach'] as PackingItem['requiredFor'] }
    expect(isRelevant(item, 'beach', false, false)).toBe(true)
  })

  it('returns false for holiday-type items when type does not match', () => {
    const item = { label: 'Swimwear', category: 'Activities', requiredFor: ['beach'] as PackingItem['requiredFor'] }
    expect(isRelevant(item, 'mountains', false, false)).toBe(false)
  })
})

// ── mergePacking ───────────────────────────────────────────────────────────

describe('mergePacking', () => {
  it('starts with empty list and populates always-include items', () => {
    const result = mergePacking([], 'other', false, false, makeId)
    const labels = result.map(i => i.label)
    expect(labels).toContain('Passports / ID')
    expect(labels).toContain('Phone charger')
    expect(labels).toContain('First aid kit')
    // Family category always included
    expect(labels).toContain('Clothes')
    expect(labels).toContain('Phone chargers (all devices)')
  })

  it('includes beach items when holidayType is beach', () => {
    const result = mergePacking([], 'beach', false, false, makeId)
    const labels = result.map(i => i.label)
    expect(labels).toContain('Swimwear')
    expect(labels).toContain('Beach towels')
    expect(labels).toContain('Flip flops')
  })

  it('does not include beach items for non-beach trip', () => {
    const result = mergePacking([], 'city', false, false, makeId)
    const labels = result.map(i => i.label)
    expect(labels).not.toContain('Swimwear')
    expect(labels).not.toContain('Beach towels')
  })

  it('includes kids items when hasKids is true', () => {
    const result = mergePacking([], 'other', true, false, makeId)
    const labels = result.map(i => i.label)
    expect(labels).toContain('Toys / games')
    expect(labels).toContain("Kids' medicine")
  })

  it('does not include kids items when hasKids is false', () => {
    const result = mergePacking([], 'other', false, false, makeId)
    const labels = result.map(i => i.label)
    expect(labels).not.toContain('Toys / games')
  })

  it('includes pets items when hasPets is true', () => {
    const result = mergePacking([], 'other', false, true, makeId)
    const labels = result.map(i => i.label)
    expect(labels).toContain('Pet food')
    expect(labels).toContain('Leash')
    expect(labels).toContain('Pet toys')
  })

  it('preserves checked state of existing items', () => {
    const existing: PackingItem[] = [{
      id: 'x1', label: 'Passports / ID', category: 'Documents', checked: true,
    }]
    const result = mergePacking(existing, 'other', false, false, makeId)
    const passport = result.find(i => i.label === 'Passports / ID')
    expect(passport?.checked).toBe(true)
  })

  it('does not duplicate existing items', () => {
    const existing: PackingItem[] = [{
      id: 'x1', label: 'Passports / ID', category: 'Documents', checked: false,
    }]
    const result = mergePacking(existing, 'other', false, false, makeId)
    const passports = result.filter(i => i.label === 'Passports / ID')
    expect(passports).toHaveLength(1)
  })

  it('keeps custom items always, regardless of trip context', () => {
    const existing: PackingItem[] = [{
      id: 'c1', label: 'My guitar', category: 'Custom', checked: false,
    }]
    const result = mergePacking(existing, 'other', false, false, makeId)
    expect(result.some(i => i.label === 'My guitar')).toBe(true)
  })

  it('removes irrelevant seed items that are NOT checked', () => {
    // Start with beach items already in list (from a previous beach trip)
    const existing: PackingItem[] = [{
      id: 'b1', label: 'Swimwear', category: 'Activities', checked: false, requiredFor: ['beach'],
    }]
    // Switch to city trip
    const result = mergePacking(existing, 'city', false, false, makeId)
    expect(result.some(i => i.label === 'Swimwear')).toBe(false)
  })

  it('retains irrelevant seed items that WERE checked (already packed)', () => {
    const existing: PackingItem[] = [{
      id: 'b1', label: 'Swimwear', category: 'Activities', checked: true, requiredFor: ['beach'],
    }]
    const result = mergePacking(existing, 'city', false, false, makeId)
    expect(result.some(i => i.label === 'Swimwear')).toBe(true)
  })

  it('all new items start as unchecked', () => {
    const result = mergePacking([], 'camping', true, true, makeId)
    expect(result.every(i => i.checked === false)).toBe(true)
  })
})

// ── groupByCategory ────────────────────────────────────────────────────────

describe('groupByCategory', () => {
  it('returns a map with only non-empty categories', () => {
    const items: PackingItem[] = [
      { id: '1', label: 'Passports / ID', category: 'Documents', checked: false },
      { id: '2', label: 'Phone charger', category: 'Essentials', checked: false },
    ]
    const grouped = groupByCategory(items)
    expect(grouped.has('Documents')).toBe(true)
    expect(grouped.has('Essentials')).toBe(true)
    expect(grouped.has('Kids')).toBe(false)
  })

  it('respects CATEGORY_ORDER key order', () => {
    const items = SEED_ITEMS.map((s, i) => ({
      id: String(i),
      label: s.label,
      category: s.category,
      checked: false,
    }))
    const keys = [...groupByCategory(items).keys()]
    const expectedOrder = CATEGORY_ORDER.filter(c => keys.includes(c))
    expect(keys).toEqual(expectedOrder)
  })

  it('puts unknown category items into Custom bucket', () => {
    const items: PackingItem[] = [{
      id: '99', label: 'Weird item', category: 'SomethingRandom', checked: false,
    }]
    const grouped = groupByCategory(items)
    expect(grouped.has('Custom')).toBe(true)
    expect(grouped.get('Custom')![0].label).toBe('Weird item')
  })

  it('correctly distributes multiple categories', () => {
    const items: PackingItem[] = [
      { id: '1', label: 'Passport', category: 'Documents', checked: false },
      { id: '2', label: 'Charger', category: 'Essentials', checked: false },
      { id: '3', label: 'My hat', category: 'Custom', checked: false },
    ]
    const grouped = groupByCategory(items)
    expect(grouped.get('Documents')).toHaveLength(1)
    expect(grouped.get('Essentials')).toHaveLength(1)
    expect(grouped.get('Custom')).toHaveLength(1)
  })
})
