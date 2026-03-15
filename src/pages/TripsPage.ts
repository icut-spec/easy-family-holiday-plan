import { getState, setState } from '../store'
import { navigate } from '../router'
import { signOut } from '../lib/auth'
import { onSyncStatus } from '../lib/sync'
import type { TripRecord } from '../types'

export function mount(el: HTMLElement): void {
  render(el)
}

function render(el: HTMLElement): void {
  const { trips } = getState()

  el.innerHTML = `
    <div class="page trips-page">
      <header class="page-header">
        <div class="page-header-inner">
          <span class="page-logo">✈️🐾</span>
          <h1 class="page-header-title">My Trips</h1>
          <div class="page-header-actions">
            <span class="sync-indicator" id="sync-indicator" aria-live="polite"></span>
            <button class="btn btn--ghost btn--sm" id="header-logout">Log out</button>
          </div>
        </div>
      </header>

      <main class="page-main">
        <div class="trips-toolbar">
          <h2 class="trips-heading">My Trips</h2>
          <button class="btn btn--primary" id="new-trip-btn">➕ Create Trip</button>
        </div>

        ${trips.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">🗺️</div>
            <p class="empty-state-title">No trips yet.</p>
            <p class="empty-state-sub">Start planning your first trip!</p>
            <button class="btn btn--primary" id="new-trip-empty-btn">Create your first trip</button>
          </div>
        ` : `
          <div class="trips-grid">
            ${trips.map((t) => tripCard(t)).join('')}
          </div>
        `}
      </main>
    </div>

    <!-- Create trip modal -->
    <div class="modal-backdrop hidden" id="create-trip-modal">
      <div class="modal modal--wide">
        <div class="modal-header">
          <h2>New Trip</h2>
          <button class="modal-close" id="modal-close" aria-label="Close">✕</button>
        </div>
        <form class="modal-form" id="create-trip-form" novalidate>
          <div class="form-group">
            <label class="form-label" for="new-trip-title">Trip name</label>
            <input class="form-input" type="text" id="new-trip-title" placeholder='e.g. "Summer in Paris"' required />
          </div>
          <div class="form-group">
            <label class="form-label" for="new-trip-dest">Destination</label>
            <input class="form-input" type="text" id="new-trip-dest" placeholder="e.g. Paris" required />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="new-trip-start">Start date</label>
              <input class="form-input" type="date" id="new-trip-start" />
            </div>
            <div class="form-group">
              <label class="form-label" for="new-trip-end">End date</label>
              <input class="form-input" type="date" id="new-trip-end" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Holiday type</label>
            <div class="holiday-type-group" id="holiday-type-group">
              ${(['beach','mountains','city','camping','other'] as const).map((ht) => `
                <label class="holiday-type-pill ${ht === 'other' ? 'holiday-type-pill--active' : ''}" data-ht="${ht}">
                  <input type="radio" name="holiday-type" value="${ht}" ${ht === 'other' ? 'checked' : ''} />
                  ${holidayTypeLabel(ht)}
                </label>
              `).join('')}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Travellers</label>
            <div class="stepper-group">
              <div class="stepper-row">
                <span class="stepper-label">🧑 Adults</span>
                <div class="stepper-controls">
                  <button type="button" class="stepper-btn" id="adults-dec" aria-label="Decrease adults">−</button>
                  <span class="stepper-value" id="adults-val">1</span>
                  <button type="button" class="stepper-btn" id="adults-inc" aria-label="Increase adults">+</button>
                </div>
              </div>
              <div class="stepper-row">
                <span class="stepper-label">🧒 Children</span>
                <div class="stepper-controls">
                  <button type="button" class="stepper-btn" id="children-dec" aria-label="Decrease children">−</button>
                  <span class="stepper-value" id="children-val">0</span>
                  <button type="button" class="stepper-btn" id="children-inc" aria-label="Increase children">+</button>
                </div>
              </div>
              <div class="stepper-row">
                <span class="stepper-label">🐾 Pets</span>
                <div class="stepper-controls">
                  <button type="button" class="stepper-btn" id="pets-dec" aria-label="Decrease pets">−</button>
                  <span class="stepper-value" id="pets-val">0</span>
                  <button type="button" class="stepper-btn" id="pets-inc" aria-label="Increase pets">+</button>
                </div>
              </div>
              <div class="stepper-row stepper-row--pet-type hidden" id="pet-type-row">
                <span class="stepper-label">Pet type</span>
                <select class="form-input stepper-pet-select" id="pet-type-select">
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                  <option value="Rabbit">Rabbit</option>
                  <option value="Bird">Bird</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="new-trip-budget">Budget (€, optional)</label>
            <div class="budget-input-wrap">
              <span class="budget-currency">€</span>
              <input class="form-input budget-amount-input" type="number" id="new-trip-budget" placeholder="e.g. 2000" min="0" step="1" />
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn--ghost" id="modal-cancel">Cancel</button>
            <button type="submit" class="btn btn--primary">Create Trip</button>
          </div>
        </form>
      </div>
    </div>
  `

  bindEvents(el)
}

function tripCard(t: TripRecord): string {
  const adults = t.members.filter((m) => m.type === 'adult').length
  const children = t.members.filter((m) => m.type === 'child').length
  const pets = t.members.filter((m) => m.type === 'pet').length
  const parts: string[] = []
  if (adults > 0) parts.push(`${adults} adult${adults !== 1 ? 's' : ''}`)
  if (children > 0) parts.push(`${children} child${children !== 1 ? 'ren' : ''}`)
  if (pets > 0) parts.push(`${pets} pet${pets !== 1 ? 's' : ''}`)
  const travellers = parts.join(' · ') || 'Just me'

  const dateRange = t.trip.startDate && t.trip.endDate
    ? `${formatDate(t.trip.startDate)} – ${formatDate(t.trip.endDate)}`
    : 'Dates TBD'

  return `
    <article class="trip-card" data-trip-id="${escHtml(t.id)}">
      <div class="trip-card-body">
        <h3 class="trip-card-title">${escHtml(t.title)}</h3>
        <p class="trip-card-dest">📍 ${escHtml(t.trip.destination || 'No destination')}</p>
        <p class="trip-card-dates">📅 ${escHtml(dateRange)}</p>
        <p class="trip-card-travellers">👨‍👩‍👧 ${escHtml(travellers)}</p>
      </div>
      <div class="trip-card-footer">
        <button class="btn btn--primary btn--sm trip-open-btn" data-trip-id="${escHtml(t.id)}">Open →</button>
        <button class="btn btn--ghost btn--sm trip-delete-btn" data-trip-id="${escHtml(t.id)}" aria-label="Delete trip">🗑</button>
      </div>
    </article>
  `
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function holidayTypeLabel(ht: string): string {
  const labels: Record<string, string> = {
    beach: '🏖️ Beach',
    mountains: '⛰️ Mountains',
    city: '🏙️ City',
    camping: '⛺ Camping',
    other: '✈️ Other',
  }
  return labels[ht] ?? ht
}

function openModal(el: HTMLElement): void {
  el.querySelector('#create-trip-modal')?.classList.remove('hidden')
  el.querySelector<HTMLInputElement>('#new-trip-title')?.focus()
  bindModalSteppers(el)
  bindHolidayTypePills(el)
}

function closeModal(el: HTMLElement): void {
  el.querySelector('#create-trip-modal')?.classList.add('hidden')
  const form = el.querySelector<HTMLFormElement>('#create-trip-form')
  form?.reset()
  // Reset stepper display values and pet type row
  const adultsVal = el.querySelector<HTMLElement>('#adults-val')
  const childrenVal = el.querySelector<HTMLElement>('#children-val')
  const petsVal = el.querySelector<HTMLElement>('#pets-val')
  const petTypeRow = el.querySelector<HTMLElement>('#pet-type-row')
  if (adultsVal) adultsVal.textContent = '1'
  if (childrenVal) childrenVal.textContent = '0'
  if (petsVal) petsVal.textContent = '0'
  if (petTypeRow) petTypeRow.classList.add('hidden')
  // Reset active pill
  el.querySelectorAll('.holiday-type-pill').forEach((p) => p.classList.remove('holiday-type-pill--active'))
  el.querySelector('.holiday-type-pill[data-ht="other"]')?.classList.add('holiday-type-pill--active')
}

function makeStepper(el: HTMLElement, decId: string, incId: string, valId: string, min: number, onChange?: (v: number) => void): void {
  const valEl = el.querySelector<HTMLElement>(`#${valId}`)
  let value = parseInt(valEl?.textContent ?? '0', 10)

  el.querySelector(`#${decId}`)?.addEventListener('click', () => {
    if (value <= min) return
    value--
    if (valEl) valEl.textContent = String(value)
    onChange?.(value)
  })
  el.querySelector(`#${incId}`)?.addEventListener('click', () => {
    value++
    if (valEl) valEl.textContent = String(value)
    onChange?.(value)
  })
}

function bindModalSteppers(el: HTMLElement): void {
  makeStepper(el, 'adults-dec', 'adults-inc', 'adults-val', 1)
  makeStepper(el, 'children-dec', 'children-inc', 'children-val', 0)
  makeStepper(el, 'pets-dec', 'pets-inc', 'pets-val', 0, (v) => {
    const petTypeRow = el.querySelector<HTMLElement>('#pet-type-row')
    if (petTypeRow) petTypeRow.classList.toggle('hidden', v === 0)
  })
}

function bindHolidayTypePills(el: HTMLElement): void {
  el.querySelectorAll<HTMLElement>('.holiday-type-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      el.querySelectorAll('.holiday-type-pill').forEach((p) => p.classList.remove('holiday-type-pill--active'))
      pill.classList.add('holiday-type-pill--active')
    })
  })
}

function bindEvents(el: HTMLElement): void {
  el.querySelector('#new-trip-btn')?.addEventListener('click', () => openModal(el))
  el.querySelector('#new-trip-empty-btn')?.addEventListener('click', () => openModal(el))
  el.querySelector('#modal-close')?.addEventListener('click', () => closeModal(el))
  el.querySelector('#modal-cancel')?.addEventListener('click', () => closeModal(el))
  el.querySelector('#modal-backdrop')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal(el)
  })

  el.querySelector('#header-logout')?.addEventListener('click', async () => {
    await signOut()
    // onAuthChange in main.ts will clear state and navigate to landing
  })

  // Sync status indicator
  const syncEl = el.querySelector<HTMLElement>('#sync-indicator')
  if (syncEl) {
    onSyncStatus((status) => {
      if (status === 'saving') { syncEl.textContent = 'Saving…'; syncEl.className = 'sync-indicator sync-indicator--saving' }
      else if (status === 'saved') { syncEl.textContent = 'Saved'; syncEl.className = 'sync-indicator sync-indicator--saved' }
      else if (status === 'error') { syncEl.textContent = 'Sync error'; syncEl.className = 'sync-indicator sync-indicator--error' }
      else { syncEl.textContent = ''; syncEl.className = 'sync-indicator' }
    })
  }

  el.querySelector('#header-home')?.addEventListener('click', (e) => {
    e.preventDefault()
    navigate('landing')
  })

  // Create trip form submit
  el.querySelector('#create-trip-form')?.addEventListener('submit', (e) => {
    e.preventDefault()
    const title = (el.querySelector<HTMLInputElement>('#new-trip-title')?.value ?? '').trim()
    const dest = (el.querySelector<HTMLInputElement>('#new-trip-dest')?.value ?? '').trim()
    if (!title || !dest) return

    const startDate = el.querySelector<HTMLInputElement>('#new-trip-start')?.value ?? ''
    const endDate = el.querySelector<HTMLInputElement>('#new-trip-end')?.value ?? ''

    const adults = parseInt(el.querySelector<HTMLElement>('#adults-val')?.textContent ?? '1', 10)
    const children = parseInt(el.querySelector<HTMLElement>('#children-val')?.textContent ?? '0', 10)
    const pets = parseInt(el.querySelector<HTMLElement>('#pets-val')?.textContent ?? '0', 10)
    const petType = el.querySelector<HTMLSelectElement>('#pet-type-select')?.value ?? 'Dog'
    const holidayType = (el.querySelector<HTMLInputElement>('input[name="holiday-type"]:checked')?.value ?? 'other') as TripRecord['trip']['holidayType']
    const budgetStr = el.querySelector<HTMLInputElement>('#new-trip-budget')?.value ?? ''
    const budget = budgetStr ? parseFloat(budgetStr) : 0

    // Build member list from stepper values
    const members: TripRecord['members'] = []
    for (let i = 1; i <= adults; i++) members.push({ id: crypto.randomUUID(), type: 'adult', name: `Adult ${i}` })
    for (let i = 1; i <= children; i++) members.push({ id: crypto.randomUUID(), type: 'child', name: `Child ${i}` })
    for (let i = 1; i <= pets; i++) members.push({ id: crypto.randomUUID(), type: 'pet', name: `${petType} ${i}`, petType })

    const newTrip: TripRecord = {
      id: crypto.randomUUID(),
      title,
      trip: {
        destination: dest,
        startDate,
        endDate,
        budget,
        holidayType,
        petFriendly: pets > 0,
      },
      members,
      packingItems: [],
      itinerary: [],
      budget: [],
      createdAt: new Date().toISOString(),
    }

    const state = getState()
    setState({ trips: [...state.trips, newTrip], currentTripId: newTrip.id })
    closeModal(el)
    navigate(`trip/${newTrip.id}/overview`)
  })

  // Open trip cards
  el.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    const openBtn = target.closest<HTMLElement>('.trip-open-btn')
    if (openBtn) {
      const id = openBtn.dataset.tripId
      if (id) navigate(`trip/${id}/overview`)
      return
    }
    const deleteBtn = target.closest<HTMLElement>('.trip-delete-btn')
    if (deleteBtn) {
      const id = deleteBtn.dataset.tripId
      if (!id) return
      if (!window.confirm('Delete this trip? This cannot be undone.')) return
      const state = getState()
      const trips = state.trips.filter((t) => t.id !== id)
      const currentTripId = state.currentTripId === id ? null : state.currentTripId
      setState({ trips, currentTripId })
      render(el)
    }
  })
}
