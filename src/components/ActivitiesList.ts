import { getState } from '../store'
import type { Activity, HolidayType } from '../types'
import { getFallbackActivities } from '../data/fallbackActivities'

// Google Maps Places API key from env
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined

// Query map per holiday type
const QUERY_MAP: Record<HolidayType, string> = {
  beach: 'beach activities',
  mountains: 'mountain hiking',
  city: 'city sightseeing',
  camping: 'camping sites',
  other: 'family activities',
}

// Module-level cache so we don't re-fetch on every re-render
let _cachedActivities: Activity[] = []
let _cachedKey = '' // destination + holidayType

export function mount(el: HTMLElement): void {
  render(el)
}

async function render(el: HTMLElement): Promise<void> {
  const { trip } = getState()

  // Empty state: no destination set
  if (!trip.destination) {
    el.innerHTML = `
      <div class="activities-wrap">
        <h2 class="section-title">Activities</h2>
        <div class="empty-state">
          <span class="empty-icon">🗺️</span>
          <p>Enter a destination in <strong>Trip Setup</strong> to see activity suggestions.</p>
        </div>
      </div>
    `
    return
  }

  // Show loading state
  el.innerHTML = `
    <div class="activities-wrap">
      <h2 class="section-title">Activities near <em>${escHtml(trip.destination)}</em></h2>
      <div class="activities-toolbar">
        ${renderPetFilterBtn(trip.petFriendly)}
      </div>
      <div class="loading-state">
        <span class="loading-spinner"></span>
        <p>Finding activities near ${escHtml(trip.destination)}…</p>
      </div>
    </div>
  `

  // Fetch or use cache
  const cacheKey = `${trip.destination}|${trip.holidayType}`
  if (_cachedKey !== cacheKey) {
    _cachedActivities = await fetchActivities(trip.destination, trip.holidayType)
    _cachedKey = cacheKey
  }

  renderActivities(el, _cachedActivities)
}

function renderActivities(el: HTMLElement, activities: Activity[]): void {
  const { trip } = getState()

  const filtered = trip.petFriendly
    ? activities.filter((a) => a.petFriendly)
    : activities

  const wrap = el.querySelector('.activities-wrap')
  if (!wrap) return

  // Replace loading with toolbar + cards
  wrap.innerHTML = `
    <h2 class="section-title">Activities near <em>${escHtml(trip.destination)}</em></h2>
    <div class="activities-toolbar">
      ${renderPetFilterBtn(trip.petFriendly)}
      <span class="activities-source-badge ${activities[0]?.source === 'api' ? 'badge-api' : 'badge-fallback'}">
        ${activities[0]?.source === 'api' ? '🌐 Live suggestions' : '📋 Suggested activities'}
      </span>
    </div>
    ${
      filtered.length === 0
        ? `<div class="empty-state">
             <span class="empty-icon">🐾</span>
             <p>No pet-friendly activities found. Try turning off the pet filter.</p>
           </div>`
        : `<div class="activities-grid">
             ${filtered.map(renderActivityCard).join('')}
           </div>`
    }
  `

  // Pet filter toggle
  wrap.querySelector('#pet-filter-btn')?.addEventListener('click', () => {
    const state = getState()
    // Re-render with flipped pet filter (read from trip state)
    const petFriendly = !state.trip.petFriendly
    // Temporarily update display without saving to store (store is controlled by FamilySetup)
    const filtered2 = petFriendly
      ? _cachedActivities.filter((a) => a.petFriendly)
      : _cachedActivities

    const btn = wrap.querySelector<HTMLButtonElement>('#pet-filter-btn')
    if (btn) {
      btn.classList.toggle('active', petFriendly)
      btn.textContent = petFriendly ? '🐾 Pet-friendly only: ON' : '🐾 Pet-friendly only: OFF'
    }

    const grid = wrap.querySelector('.activities-grid')
    const emptyEl = wrap.querySelector('.empty-state')

    if (filtered2.length === 0) {
      if (grid) grid.remove()
      if (!emptyEl) {
        const div = document.createElement('div')
        div.className = 'empty-state'
        div.innerHTML = `<span class="empty-icon">🐾</span><p>No pet-friendly activities found. Try turning off the pet filter.</p>`
        wrap.appendChild(div)
      }
    } else {
      if (emptyEl) emptyEl.remove()
      if (grid) {
        grid.innerHTML = filtered2.map(renderActivityCard).join('')
      } else {
        const div = document.createElement('div')
        div.className = 'activities-grid'
        div.innerHTML = filtered2.map(renderActivityCard).join('')
        wrap.appendChild(div)
      }
    }
  })
}

function renderPetFilterBtn(active: boolean): string {
  return `
    <button id="pet-filter-btn" class="pet-filter-btn ${active ? 'active' : ''}" type="button">
      🐾 Pet-friendly only: ${active ? 'ON' : 'OFF'}
    </button>
  `
}

function renderActivityCard(a: Activity): string {
  return `
    <div class="activity-card">
      <div class="activity-card-header">
        <span class="activity-name">${escHtml(a.name)}</span>
        ${a.petFriendly
          ? '<span class="pet-badge pet-yes">🐾 Pet-friendly</span>'
          : '<span class="pet-badge pet-no">🚫 No pets</span>'}
      </div>
      <p class="activity-description">${escHtml(a.description)}</p>
      <a
        class="activity-maps-link"
        href="${a.googleMapsUrl}"
        target="_blank"
        rel="noopener noreferrer"
      >
        📍 Show on Google Maps
      </a>
    </div>
  `
}

// ── Places API fetch ─────────────────────────────────────────────

async function fetchActivities(
  destination: string,
  holidayType: HolidayType
): Promise<Activity[]> {
  if (!API_KEY) {
    return getFallbackActivities(holidayType, destination)
  }

  try {
    const query = `${QUERY_MAP[holidayType]} near ${destination}`
    const url =
      `https://maps.googleapis.com/maps/api/place/textsearch/json` +
      `?query=${encodeURIComponent(query)}&key=${API_KEY}`

    const res = await fetch(url)
    if (!res.ok) throw new Error('Places API error')

    const data = (await res.json()) as {
      status: string
      results: {
        place_id: string
        name: string
        formatted_address?: string
        types?: string[]
      }[]
    }

    if (data.status !== 'OK' || !data.results.length) {
      return getFallbackActivities(holidayType, destination)
    }

    const petFriendlyTypes = ['park', 'campground', 'natural_feature', 'beach']

    return data.results.slice(0, 4).map((r) => {
      const isPetFriendly = r.types
        ? r.types.some((t) => petFriendlyTypes.includes(t))
        : false
      return {
        id: r.place_id,
        name: r.name,
        description: r.formatted_address ?? '',
        petFriendly: isPetFriendly,
        googleMapsUrl: `https://www.google.com/maps/search/${encodeURIComponent(r.name + ' ' + destination)}`,
        source: 'api' as const,
      }
    })
  } catch {
    return getFallbackActivities(holidayType, destination)
  }
}

function escHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
