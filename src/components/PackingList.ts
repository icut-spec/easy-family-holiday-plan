import { getState, setState } from '../store'
import type { PackingItem } from '../types'
import { mergePacking, groupByCategory } from '../utils/packingUtils'

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
      id: Math.random().toString(36).slice(2, 10),
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
