import { getState, setState } from '../store'
import type { Trip, HolidayType } from '../types'

export function mount(el: HTMLElement): void {
  render(el)
}

function render(el: HTMLElement): void {
  const state = getState()
  const trip = state.trip

  el.innerHTML = `
    <div class="trip-setup">
      <h2 class="section-title">Trip Setup</h2>

      <div class="form-card">

        <!-- US-2.1 Destination -->
        <div class="form-group">
          <label class="form-label" for="destination">Destination</label>
          <input
            class="form-input"
            type="text"
            id="destination"
            name="destination"
            placeholder="e.g. Bali, Munich, Barcelona"
            value="${escHtml(trip.destination)}"
            autocomplete="off"
          />
        </div>

        <!-- US-2.2 Travel Dates -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="startDate">Start Date</label>
            <input
              class="form-input"
              type="date"
              id="startDate"
              name="startDate"
              value="${escHtml(trip.startDate)}"
            />
          </div>
          <div class="form-group">
            <label class="form-label" for="endDate">End Date</label>
            <input
              class="form-input"
              type="date"
              id="endDate"
              name="endDate"
              value="${escHtml(trip.endDate)}"
            />
          </div>
        </div>

        <!-- US-2.2 Duration badge -->
        <div id="duration-badge" class="duration-badge ${getDuration(trip.startDate, trip.endDate) ? '' : 'hidden'}">
          ${getDuration(trip.startDate, trip.endDate)}
        </div>

        <!-- US-2.3 Budget -->
        <div class="form-group">
          <label class="form-label" for="budget">Budget (€)</label>
          <input
            class="form-input"
            type="number"
            id="budget"
            name="budget"
            placeholder="e.g. 2000"
            min="0"
            value="${trip.budget > 0 ? trip.budget : ''}"
          />
        </div>

        <!-- US-2.4 Holiday Type -->
        <div class="form-group">
          <label class="form-label">Holiday Type</label>
          <div class="holiday-type-group">
            ${renderHolidayTypes(trip.holidayType)}
          </div>
        </div>

        <!-- US-2.5 Google Maps Link -->
        <div id="maps-link-container" class="maps-link-container ${trip.destination ? '' : 'hidden'}">
          <a
            id="maps-link"
            class="maps-link"
            href="https://www.google.com/maps/search/${encodeURIComponent(trip.destination)}"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open "${escHtml(trip.destination)}" in Google Maps
          </a>
        </div>

      </div>
    </div>
  `

  bindEvents(el)
}

function bindEvents(el: HTMLElement): void {
  // Destination input
  const destInput = el.querySelector<HTMLInputElement>('#destination')
  destInput?.addEventListener('input', () => {
    updateTrip(el, { destination: destInput.value.trim() })
    updateMapsLink(el, destInput.value.trim())
  })

  // Start date
  const startInput = el.querySelector<HTMLInputElement>('#startDate')
  startInput?.addEventListener('change', () => {
    updateTrip(el, { startDate: startInput.value })
    updateDuration(el)
  })

  // End date
  const endInput = el.querySelector<HTMLInputElement>('#endDate')
  endInput?.addEventListener('change', () => {
    updateTrip(el, { endDate: endInput.value })
    updateDuration(el)
  })

  // Budget
  const budgetInput = el.querySelector<HTMLInputElement>('#budget')
  budgetInput?.addEventListener('input', () => {
    const val = parseFloat(budgetInput.value)
    updateTrip(el, { budget: isNaN(val) ? 0 : val })
  })

  // Holiday type buttons
  el.querySelectorAll<HTMLButtonElement>('.holiday-type-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.type as HolidayType
      el.querySelectorAll('.holiday-type-btn').forEach((b) =>
        b.classList.remove('active')
      )
      btn.classList.add('active')
      updateTrip(el, { holidayType: type })
    })
  })
}

function updateTrip(_el: HTMLElement, partial: Partial<Trip>): void {
  const state = getState()
  setState({ trip: { ...state.trip, ...partial } })
}

function updateMapsLink(el: HTMLElement, destination: string): void {
  const container = el.querySelector<HTMLElement>('#maps-link-container')
  const link = el.querySelector<HTMLAnchorElement>('#maps-link')
  if (!container || !link) return

  if (destination) {
    link.href = `https://www.google.com/maps/search/${encodeURIComponent(destination)}`
    link.textContent = `Open "${destination}" in Google Maps`
    container.classList.remove('hidden')
  } else {
    container.classList.add('hidden')
  }
}

function updateDuration(el: HTMLElement): void {
  const state = getState()
  const badge = el.querySelector<HTMLElement>('#duration-badge')
  if (!badge) return
  const label = getDuration(state.trip.startDate, state.trip.endDate)
  if (label) {
    badge.textContent = label
    badge.classList.remove('hidden')
  } else {
    badge.classList.add('hidden')
  }
}

function getDuration(start: string, end: string): string {
  if (!start || !end) return ''
  const s = new Date(start)
  const e = new Date(end)
  const days = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24))
  if (days <= 0) return ''
  return `${days} night${days !== 1 ? 's' : ''}`
}

function renderHolidayTypes(current: HolidayType): string {
  const types: { value: HolidayType; label: string; emoji: string }[] = [
    { value: 'beach', label: 'Beach', emoji: '🏖️' },
    { value: 'mountains', label: 'Mountains', emoji: '⛰️' },
    { value: 'city', label: 'City', emoji: '🏙️' },
    { value: 'camping', label: 'Camping', emoji: '⛺' },
    { value: 'other', label: 'Other', emoji: '✈️' },
  ]
  return types
    .map(
      (t) => `
      <button
        class="holiday-type-btn ${current === t.value ? 'active' : ''}"
        data-type="${t.value}"
        type="button"
      >
        <span class="holiday-type-emoji">${t.emoji}</span>
        <span>${t.label}</span>
      </button>
    `
    )
    .join('')
}

function escHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
