import { getState, setState } from '../store'
import type { TripRecord, PackingItem } from '../types'
import { mergePacking, groupByCategory } from '../utils/packingUtils'

export function mountPacking(el: HTMLElement, tripRecord: TripRecord): void {
  renderPacking(el, tripRecord)
}

function getTripRecord(tripRecord: TripRecord): TripRecord {
  return getState().trips.find((t) => t.id === tripRecord.id) ?? tripRecord
}

function saveTripRecord(updated: TripRecord): void {
  const state = getState()
  setState({ trips: state.trips.map((t) => (t.id === updated.id ? updated : t)) })
}

function renderPacking(el: HTMLElement, tripRecord: TripRecord): void {
  const fresh = getTripRecord(tripRecord)
  const t = fresh.trip
  const hasKids = fresh.members.some((m) => m.type === 'child')
  const hasPets = fresh.members.some((m) => m.type === 'pet')

  // Auto-merge seed items
  const merged = mergePacking(fresh.packingItems, t.holidayType, hasKids, hasPets)
  if (merged.length !== fresh.packingItems.length) {
    const updated = { ...fresh, packingItems: merged }
    saveTripRecord(updated)
    fresh.packingItems = merged
  }

  const total = merged.length
  const checked = merged.filter((i) => i.checked).length
  const pct = total > 0 ? Math.round((checked / total) * 100) : 0

  const grouped = groupByCategory(merged)

  el.innerHTML = `
    <div class="packing-page">
      <div class="pack-progress-card">
        <div class="pack-progress-label">
          <span>${checked} / ${total} packed</span>
          <span>${pct}%</span>
        </div>
        <div class="pack-progress-bar-bg">
          <div class="pack-progress-bar-fill" style="width:${pct}%"></div>
        </div>
      </div>

      <div class="pack-categories">
        ${grouped.size === 0
          ? `<div class="empty-state"><p class="empty-state-title">No items yet.</p></div>`
          : [...grouped.entries()].map(([cat, items]) => renderCategory(cat, items)).join('')}
      </div>

      <div class="pack-add-card">
        <form class="pack-add-form" id="packing-add-form">
          <input class="form-input" type="text" id="packing-new-item" placeholder="Add custom item…" required />
          <button type="submit" class="btn btn--primary">Add</button>
        </form>
      </div>
    </div>
  `

  bindPackingEvents(el, fresh)
}

function renderCategory(category: string, items: PackingItem[]): string {
  const catChecked = items.filter((i) => i.checked).length
  return `
    <section class="pack-category">
      <h3 class="pack-category-title">
        ${escHtml(category)}
        <span class="pack-category-count">${catChecked}/${items.length}</span>
      </h3>
      <ul class="pack-items">
        ${items.map((item) => `
          <li class="pack-item ${item.checked ? 'pack-item--checked' : ''}">
            <label class="pack-item-label">
              <input
                class="pack-checkbox"
                type="checkbox"
                data-id="${escHtml(item.id)}"
                ${item.checked ? 'checked' : ''}
              />
              <span>${escHtml(item.label)}</span>
            </label>
            <button class="pack-remove-btn" data-id="${escHtml(item.id)}" aria-label="Remove item">✕</button>
          </li>
        `).join('')}
      </ul>
    </section>
  `
}

function bindPackingEvents(el: HTMLElement, tripRecord: TripRecord): void {
  // Toggle checked
  el.querySelectorAll<HTMLInputElement>('.pack-checkbox').forEach((cb) => {
    cb.addEventListener('change', () => {
      const id = cb.dataset.id!
      const fresh = getTripRecord(tripRecord)
      const packingItems = fresh.packingItems.map((i) =>
        i.id === id ? { ...i, checked: cb.checked } : i
      )
      saveTripRecord({ ...fresh, packingItems })
      renderPacking(el, fresh)
    })
  })

  // Remove item
  el.querySelectorAll<HTMLButtonElement>('.pack-remove-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id!
      const fresh = getTripRecord(tripRecord)
      const packingItems = fresh.packingItems.filter((i) => i.id !== id)
      saveTripRecord({ ...fresh, packingItems })
      renderPacking(el, fresh)
    })
  })

  // Add custom item
  el.querySelector<HTMLFormElement>('#packing-add-form')?.addEventListener('submit', (e) => {
    e.preventDefault()
    const input = el.querySelector<HTMLInputElement>('#packing-new-item')!
    const label = input.value.trim()
    if (!label) return
    const fresh = getTripRecord(tripRecord)
    const newItem: PackingItem = {
      id: crypto.randomUUID(),
      label,
      checked: false,
      category: 'Custom',
    }
    saveTripRecord({ ...fresh, packingItems: [...fresh.packingItems, newItem] })
    input.value = ''
    renderPacking(el, fresh)
  })
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
