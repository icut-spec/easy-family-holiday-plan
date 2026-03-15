import { getState, setState } from '../store'
import type { FamilyMember } from '../types'

export function mount(el: HTMLElement): void {
  render(el)
}

function render(el: HTMLElement): void {
  const { members, trip } = getState()

  const adults = members.filter((m) => m.type === 'adult')
  const children = members.filter((m) => m.type === 'child')
  const pets = members.filter((m) => m.type === 'pet')

  el.innerHTML = `
    <div class="family-setup">
      <h2 class="section-title">Family Setup</h2>

      <!-- US-3.4 Pet-friendly toggle -->
      <div class="pet-toggle-bar">
        <span class="pet-toggle-label">Pet-friendly trip</span>
        <label class="toggle-switch">
          <input
            type="checkbox"
            id="pet-friendly-toggle"
            ${trip.petFriendly ? 'checked' : ''}
          />
          <span class="toggle-slider"></span>
        </label>
        <span class="pet-toggle-hint">
          ${trip.petFriendly ? 'Showing pet-friendly options only' : 'Showing all options'}
        </span>
      </div>

      <!-- US-3.1 Adults -->
      <div class="member-section">
        <div class="member-section-header">
          <h3 class="member-section-title">👨‍👩‍👧 Adults <span class="member-count">${adults.length}</span></h3>
          <button class="btn-add" id="add-adult" type="button">+ Add Adult</button>
        </div>
        <div class="member-list" id="adults-list">
          ${adults.length === 0 ? renderEmptyState('No adults added yet.') : adults.map(renderAdultCard).join('')}
        </div>
      </div>

      <!-- US-3.2 Children -->
      <div class="member-section">
        <div class="member-section-header">
          <h3 class="member-section-title">🧒 Children <span class="member-count">${children.length}</span></h3>
          <button class="btn-add" id="add-child" type="button">+ Add Child</button>
        </div>
        <div class="member-list" id="children-list">
          ${children.length === 0 ? renderEmptyState('No children added yet.') : children.map(renderChildCard).join('')}
        </div>
      </div>

      <!-- US-3.3 Pets -->
      <div class="member-section">
        <div class="member-section-header">
          <h3 class="member-section-title">🐾 Pets <span class="member-count">${pets.length}</span></h3>
          <button class="btn-add" id="add-pet" type="button">+ Add Pet</button>
        </div>
        <div class="member-list" id="pets-list">
          ${pets.length === 0 ? renderEmptyState('No pets added yet.') : pets.map(renderPetCard).join('')}
        </div>
      </div>

      <!-- Summary -->
      <div class="family-summary">
        ${renderSummary(adults.length, children.length, pets.length)}
      </div>
    </div>
  `

  bindEvents(el)
}

// ── Render helpers ──────────────────────────────────────────────

function renderAdultCard(m: FamilyMember): string {
  return `
    <div class="member-card" data-id="${m.id}">
      <span class="member-icon">👤</span>
      <input
        class="member-name-input"
        type="text"
        placeholder="Name"
        value="${escHtml(m.name)}"
        data-id="${m.id}"
        data-field="name"
      />
      <button class="btn-remove" data-id="${m.id}" title="Remove">✕</button>
    </div>
  `
}

function renderChildCard(m: FamilyMember): string {
  return `
    <div class="member-card" data-id="${m.id}">
      <span class="member-icon">🧒</span>
      <input
        class="member-name-input"
        type="text"
        placeholder="Name"
        value="${escHtml(m.name)}"
        data-id="${m.id}"
        data-field="name"
      />
      <input
        class="member-age-input"
        type="number"
        placeholder="Age"
        min="0"
        max="17"
        value="${m.age !== undefined ? m.age : ''}"
        data-id="${m.id}"
        data-field="age"
      />
      <button class="btn-remove" data-id="${m.id}" title="Remove">✕</button>
    </div>
  `
}

function renderPetCard(m: FamilyMember): string {
  const petTypes = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Other']
  return `
    <div class="member-card" data-id="${m.id}">
      <span class="member-icon">🐾</span>
      <input
        class="member-name-input"
        type="text"
        placeholder="Name"
        value="${escHtml(m.name)}"
        data-id="${m.id}"
        data-field="name"
      />
      <select
        class="member-pettype-select"
        data-id="${m.id}"
        data-field="petType"
      >
        ${petTypes
          .map(
            (t) =>
              `<option value="${t}" ${m.petType === t ? 'selected' : ''}>${t}</option>`
          )
          .join('')}
      </select>
      <button class="btn-remove" data-id="${m.id}" title="Remove">✕</button>
    </div>
  `
}

function renderEmptyState(msg: string): string {
  return `<p class="member-empty">${msg}</p>`
}

function renderSummary(adults: number, children: number, pets: number): string {
  if (adults === 0 && children === 0 && pets === 0) {
    return `<p class="summary-empty">Add family members above to see your trip summary.</p>`
  }
  const parts: string[] = []
  if (adults > 0) parts.push(`${adults} adult${adults !== 1 ? 's' : ''}`)
  if (children > 0) parts.push(`${children} child${children !== 1 ? 'ren' : ''}`)
  if (pets > 0) parts.push(`${pets} pet${pets !== 1 ? 's' : ''}`)
  return `<p class="summary-text">Travelling with: <strong>${parts.join(', ')}</strong></p>`
}

// ── Events ──────────────────────────────────────────────────────

function bindEvents(el: HTMLElement): void {
  // Add buttons
  el.querySelector('#add-adult')?.addEventListener('click', () => {
    addMember(el, { type: 'adult', name: '' })
  })
  el.querySelector('#add-child')?.addEventListener('click', () => {
    addMember(el, { type: 'child', name: '', age: undefined })
  })
  el.querySelector('#add-pet')?.addEventListener('click', () => {
    addMember(el, { type: 'pet', name: '', petType: 'Dog' })
  })

  // Remove buttons (delegated)
  el.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.btn-remove')
    if (!btn) return
    const id = btn.dataset.id
    if (!id) return
    removeMember(el, id)
  })

  // Name / age / petType inputs (delegated)
  el.addEventListener('input', (e) => {
    const input = e.target as HTMLInputElement | HTMLSelectElement
    const id = input.dataset.id
    const field = input.dataset.field
    if (!id || !field) return
    updateMember(el, id, field, input.value)
  })

  el.addEventListener('change', (e) => {
    const input = e.target as HTMLSelectElement
    const id = input.dataset.id
    const field = input.dataset.field
    if (!id || !field) return
    updateMember(el, id, field, input.value)
  })

  // Pet-friendly toggle
  el.querySelector<HTMLInputElement>('#pet-friendly-toggle')?.addEventListener('change', (e) => {
    const checked = (e.target as HTMLInputElement).checked
    const state = getState()
    setState({ trip: { ...state.trip, petFriendly: checked } })
    const hint = el.querySelector<HTMLElement>('.pet-toggle-hint')
    if (hint) {
      hint.textContent = checked ? 'Showing pet-friendly options only' : 'Showing all options'
    }
  })
}

// ── State helpers ────────────────────────────────────────────────

function addMember(el: HTMLElement, partial: Omit<FamilyMember, 'id'>): void {
  const state = getState()
  const newMember: FamilyMember = {
    id: crypto.randomUUID(),
    ...partial,
  }
  setState({ members: [...state.members, newMember] })
  render(el)
}

function removeMember(el: HTMLElement, id: string): void {
  const state = getState()
  setState({ members: state.members.filter((m) => m.id !== id) })
  render(el)
}

function updateMember(
  _el: HTMLElement,
  id: string,
  field: string,
  value: string
): void {
  const state = getState()
  const updated = state.members.map((m) => {
    if (m.id !== id) return m
    if (field === 'age') return { ...m, age: value === '' ? undefined : parseInt(value, 10) }
    return { ...m, [field]: value }
  })
  setState({ members: updated })
}

// ── Utils ────────────────────────────────────────────────────────

function escHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
