import { getState, setState } from '../store'
import { navigate } from '../router'
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
            <a href="#landing" class="btn btn--ghost btn--sm" id="header-home">Home</a>
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
      <div class="modal">
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

function openModal(el: HTMLElement): void {
  el.querySelector('#create-trip-modal')?.classList.remove('hidden')
  el.querySelector<HTMLInputElement>('#new-trip-title')?.focus()
}

function closeModal(el: HTMLElement): void {
  el.querySelector('#create-trip-modal')?.classList.add('hidden')
  const form = el.querySelector<HTMLFormElement>('#create-trip-form')
  form?.reset()
}

function bindEvents(el: HTMLElement): void {
  el.querySelector('#new-trip-btn')?.addEventListener('click', () => openModal(el))
  el.querySelector('#new-trip-empty-btn')?.addEventListener('click', () => openModal(el))
  el.querySelector('#modal-close')?.addEventListener('click', () => closeModal(el))
  el.querySelector('#modal-cancel')?.addEventListener('click', () => closeModal(el))
  el.querySelector('#modal-backdrop')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal(el)
  })

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

    const newTrip: TripRecord = {
      id: crypto.randomUUID(),
      title,
      trip: {
        destination: dest,
        startDate,
        endDate,
        budget: 0,
        holidayType: 'other',
        petFriendly: false,
      },
      members: [],
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
