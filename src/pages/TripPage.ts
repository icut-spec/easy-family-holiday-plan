import { getState, setState } from '../store'
import { navigate } from '../router'
import { signOut } from '../lib/auth'
import type { TripTab } from '../router'
import type { TripRecord } from '../types'
import { mountItinerary } from './TripItinerary'
import { mountMap } from './TripMap'
import { mountPacking } from './TripPacking'
import { mountBudget } from './TripBudget'
import { mountOverview } from './TripOverview'

export function mount(el: HTMLElement, tripId: string, tab: TripTab = 'overview'): void {
  const state = getState()
  const tripRecord = state.trips.find((t) => t.id === tripId)

  if (!tripRecord) {
    el.innerHTML = `
      <div class="page">
        <div class="not-found">
          <p>Trip not found.</p>
          <a href="#trips" class="btn btn--primary">Back to My Trips</a>
        </div>
      </div>
    `
    return
  }

  // Ensure currentTripId is set
  if (state.currentTripId !== tripId) {
    setState({ currentTripId: tripId })
  }

  renderShell(el, tripRecord, tab)
}

function renderShell(el: HTMLElement, tripRecord: TripRecord, activeTab: TripTab): void {
  const tabs: { id: TripTab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '🏠' },
    { id: 'itinerary', label: 'Itinerary', icon: '🗓️' },
    { id: 'map', label: 'Map', icon: '🗺️' },
    { id: 'packing', label: 'Packing', icon: '🧳' },
    { id: 'budget', label: 'Budget', icon: '💶' },
  ]

  el.innerHTML = `
    <div class="page trip-page">
      <header class="page-header">
        <div class="page-header-inner">
          <a href="#trips" class="btn btn--ghost btn--sm page-back" id="back-to-trips">← My Trips</a>
          <div class="page-header-title-group">
            <h1 class="page-header-title">${escHtml(tripRecord.title)}</h1>
            <span class="page-header-sub">📍 ${escHtml(tripRecord.trip.destination || 'No destination')}</span>
          </div>
          <div class="page-header-actions">
            <button class="btn btn--ghost btn--sm" id="header-logout">Log out</button>
          </div>
        </div>
      </header>

      <nav class="trip-tab-bar" role="tablist">
        ${tabs.map((t) => `
          <button
            class="trip-tab-btn ${t.id === activeTab ? 'trip-tab-btn--active' : ''}"
            data-tab="${t.id}"
            data-trip-id="${escHtml(tripRecord.id)}"
            role="tab"
            aria-selected="${t.id === activeTab}"
          >
            <span class="trip-tab-icon" aria-hidden="true">${t.icon}</span>
            <span class="trip-tab-label">${t.label}</span>
          </button>
        `).join('')}
      </nav>

      <main class="trip-tab-content" id="trip-tab-content"></main>
    </div>
  `

  // Mount the active tab content
  const contentEl = el.querySelector<HTMLElement>('#trip-tab-content')!
  mountTab(contentEl, tripRecord, activeTab)

  // Tab navigation
  el.querySelectorAll<HTMLButtonElement>('.trip-tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab as TripTab
      const id = btn.dataset.tripId!
      navigate(`trip/${id}/${tab}`)
    })
  })

  // Back link
  el.querySelector('#back-to-trips')?.addEventListener('click', (e) => {
    e.preventDefault()
    navigate('trips')
  })

  // Logout
  el.querySelector('#header-logout')?.addEventListener('click', async () => {
    await signOut()
    // onAuthChange in main.ts will clear state and navigate to landing
  })
}

function mountTab(el: HTMLElement, tripRecord: TripRecord, tab: TripTab): void {
  switch (tab) {
    case 'overview': mountOverview(el, tripRecord); break
    case 'itinerary': mountItinerary(el, tripRecord); break
    case 'map': mountMap(el, tripRecord); break
    case 'packing': mountPacking(el, tripRecord); break
    case 'budget': mountBudget(el, tripRecord); break
  }
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
