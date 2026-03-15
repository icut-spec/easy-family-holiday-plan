import { getState, setState } from '../store'
import type { PackingItem, HolidayType } from '../types'

// ── Seed data ──────────────────────────────────────────────────────────────

interface SeedItem {
  label: string
  category: string
  requiredFor?: PackingItem['requiredFor']
}

const SEED_ITEMS: SeedItem[] = [
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
const CATEGORY_ORDER = ['Documents', 'Essentials', 'Clothing', 'Kids', 'Pets', 'Activities', 'Custom']

// ── Helpers ────────────────────────────────────────────────────────────────

function makeId(): string {
  return Math.random().toString(36).slice(2, 10)
}

function isRelevant(item: SeedItem, holidayType: HolidayType, hasKids: boolean, hasPets: boolean): boolean {
  if (!item.requiredFor) return true
  return item.requiredFor.some(cond => {
    if (cond === 'kids') return hasKids
    if (cond === 'pets') return hasPets
    return cond === holidayType
  })
}

/**
 * Merge seed items into existing packingItems list.
 * - Items already present (by label) are kept as-is (preserving checked state).
 * - New relevant seed items are appended as unchecked.
 * - Custom items (category === 'Custom') are always kept.
 * - Old seed items that are no longer relevant are removed unless checked.
 */
function mergePacking(
  existing: PackingItem[],
  holidayType: HolidayType,
  hasKids: boolean,
  hasPets: boolean
): PackingItem[] {
  const relevantSeeds = SEED_ITEMS.filter(s => isRelevant(s, holidayType, hasKids, hasPets))
  const relevantLabels = new Set(relevantSeeds.map(s => s.label))

  // Keep custom items + seed items that are still relevant or were manually checked
  const kept = existing.filter(item => {
    if (item.category === 'Custom') return true
    if (relevantLabels.has(item.label)) return true
    // Keep if checked (user consciously packed it)
    return item.checked
  })

  const keptLabels = new Set(kept.map(i => i.label))

  // Append new relevant seeds not yet in list
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

function groupByCategory(items: PackingItem[]): Map<string, PackingItem[]> {
  const map = new Map<string, PackingItem[]>()
  for (const cat of CATEGORY_ORDER) map.set(cat, [])
  for (const item of items) {
    const cat = item.category in Object.fromEntries(map) ? item.category : 'Custom'
    const bucket = map.get(cat) ?? []
    bucket.push(item)
    map.set(cat, bucket)
  }
  // Remove empty buckets
  for (const [k, v] of map) if (v.length === 0) map.delete(k)
  return map
}

// ── Render ─────────────────────────────────────────────────────────────────

function renderList(container: HTMLElement): void {
  const state = getState()
  const { trip, members, packingItems } = state

  const hasKids = members.some(m => m.type === 'child')
  const hasPets = members.some(m => m.type === 'pet')

  // Merge on every render so changes to trip/family are reflected
  const merged = mergePacking(packingItems, trip.holidayType, hasKids, hasPets)
  // Persist merge result quietly if it changed
  if (merged.length !== packingItems.length) {
    setState({ packingItems: merged })
  }

  const checkedCount = merged.filter(i => i.checked).length
  const totalCount = merged.length
  const progress = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0

  const grouped = groupByCategory(merged)

  let categoriesHtml = ''
  for (const [cat, items] of grouped) {
    const checkedInCat = items.filter(i => i.checked).length
    const itemsHtml = items
      .map(
        item => `
      <li class="pack-item${item.checked ? ' pack-item--checked' : ''}" data-id="${item.id}">
        <label class="pack-item-label">
          <input type="checkbox" class="pack-checkbox" data-id="${item.id}"${item.checked ? ' checked' : ''}>
          <span class="pack-item-text">${escapeHtml(item.label)}</span>
        </label>
        <button class="pack-remove-btn" data-id="${item.id}" title="Remove item" aria-label="Remove ${escapeHtml(item.label)}">&#x2715;</button>
      </li>`
      )
      .join('')

    categoriesHtml += `
      <section class="pack-category">
        <h3 class="pack-category-title">
          ${escapeHtml(cat)}
          <span class="pack-cat-count">${checkedInCat}/${items.length}</span>
        </h3>
        <ul class="pack-item-list">${itemsHtml}</ul>
      </section>`
  }

  const emptyState =
    totalCount === 0
      ? `<div class="empty-state"><span class="empty-icon">🧳</span><p>No items yet. Fill in your trip details and family members to get a personalised packing list.</p></div>`
      : ''

  container.innerHTML = `
    <div class="packing-wrap">
      <h2 class="section-title">Packing List</h2>

      <div class="pack-progress-card">
        <div class="pack-progress-header">
          <span class="pack-progress-label">Packed</span>
          <span class="pack-progress-count">${checkedCount} / ${totalCount}</span>
        </div>
        <div class="pack-progress-bar-bg">
          <div class="pack-progress-bar-fill" style="width:${progress}%"></div>
        </div>
      </div>

      ${emptyState}

      <div class="pack-categories">
        ${categoriesHtml}
      </div>

      <div class="pack-add-card">
        <h3 class="pack-add-title">Add custom item</h3>
        <form class="pack-add-form" id="pack-add-form">
          <input
            type="text"
            id="pack-custom-input"
            class="form-input pack-custom-input"
            placeholder="e.g. Travel pillow"
            maxlength="80"
            autocomplete="off"
          >
          <button type="submit" class="btn-add pack-add-btn">Add</button>
        </form>
      </div>
    </div>
  `

  // ── Event listeners ──

  // Checkboxes
  container.querySelectorAll<HTMLInputElement>('.pack-checkbox').forEach(cb => {
    cb.addEventListener('change', () => {
      const id = cb.dataset.id!
      const items = getState().packingItems.map(i =>
        i.id === id ? { ...i, checked: cb.checked } : i
      )
      setState({ packingItems: items })
      renderList(container)
    })
  })

  // Remove buttons
  container.querySelectorAll<HTMLButtonElement>('.pack-remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id!
      const items = getState().packingItems.filter(i => i.id !== id)
      setState({ packingItems: items })
      renderList(container)
    })
  })

  // Add custom item form
  const form = container.querySelector<HTMLFormElement>('#pack-add-form')!
  const input = container.querySelector<HTMLInputElement>('#pack-custom-input')!
  form.addEventListener('submit', e => {
    e.preventDefault()
    const label = input.value.trim()
    if (!label) return
    const newItem: PackingItem = {
      id: makeId(),
      label,
      category: 'Custom',
      checked: false,
    }
    setState({ packingItems: [...getState().packingItems, newItem] })
    renderList(container)
  })
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// ── Mount ──────────────────────────────────────────────────────────────────

export function mount(el: HTMLElement): void {
  renderList(el)
}
