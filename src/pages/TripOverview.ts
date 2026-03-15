import type { TripRecord } from '../types'
import { navigate } from '../router'

export function mountOverview(el: HTMLElement, tripRecord: TripRecord): void {
  const t = tripRecord.trip
  const members = tripRecord.members
  const adults = members.filter((m) => m.type === 'adult').length
  const children = members.filter((m) => m.type === 'child').length
  const pets = members.filter((m) => m.type === 'pet').length

  const dateRange = t.startDate && t.endDate
    ? `${formatDate(t.startDate)} – ${formatDate(t.endDate)}`
    : 'Dates TBD'

  const nights = t.startDate && t.endDate
    ? Math.round((new Date(t.endDate).getTime() - new Date(t.startDate).getTime()) / 86400000)
    : 0

  const duration = nights > 0 ? `${nights} night${nights !== 1 ? 's' : ''}` : '—'

  const travellers: string[] = []
  if (adults > 0) travellers.push(`${adults} adult${adults !== 1 ? 's' : ''}`)
  if (children > 0) travellers.push(`${children} child${children !== 1 ? 'ren' : ''}`)
  if (pets > 0) travellers.push(`${pets} pet${pets !== 1 ? 's' : ''}`)
  const travellersText = travellers.join(' · ') || 'Just me'

  const itineraryDays = tripRecord.itinerary.length
  const packingCount = tripRecord.packingItems.length
  const packedCount = tripRecord.packingItems.filter((p) => p.checked).length
  const totalBudget = tripRecord.budget.reduce((sum, e) => sum + e.amount, 0)
  const budgetLimit = t.budget

  el.innerHTML = `
    <div class="overview-page">

      <!-- Key details card -->
      <section class="overview-section">
        <div class="overview-details-card">
          <div class="overview-detail">
            <span class="overview-detail-label">Dates</span>
            <span class="overview-detail-value">📅 ${escHtml(dateRange)}</span>
          </div>
          <div class="overview-detail">
            <span class="overview-detail-label">Duration</span>
            <span class="overview-detail-value">🌙 ${escHtml(duration)}</span>
          </div>
          <div class="overview-detail">
            <span class="overview-detail-label">Travellers</span>
            <span class="overview-detail-value">👨‍👩‍👧 ${escHtml(travellersText)}</span>
          </div>
          <div class="overview-detail">
            <span class="overview-detail-label">Budget</span>
            <span class="overview-detail-value">💶 ${budgetLimit > 0 ? `€${budgetLimit.toLocaleString()}` : 'Not set'}</span>
          </div>
          <div class="overview-detail">
            <span class="overview-detail-label">Holiday type</span>
            <span class="overview-detail-value">${holidayEmoji(t.holidayType)} ${capitalise(t.holidayType)}</span>
          </div>
          ${t.petFriendly ? `<div class="overview-detail"><span class="overview-detail-label">Pet-friendly</span><span class="overview-detail-value">🐾 Yes</span></div>` : ''}
        </div>
      </section>

      <!-- Section summary cards -->
      <section class="overview-section">
        <h2 class="overview-section-title">Planning progress</h2>
        <div class="overview-cards">
          <button class="overview-card" data-nav="itinerary">
            <div class="overview-card-icon">🗓️</div>
            <div class="overview-card-body">
              <h3>Itinerary</h3>
              <p>${itineraryDays > 0 ? `${itineraryDays} day${itineraryDays !== 1 ? 's' : ''} planned` : 'Not started'}</p>
            </div>
            <span class="overview-card-arrow">→</span>
          </button>
          <button class="overview-card" data-nav="packing">
            <div class="overview-card-icon">🧳</div>
            <div class="overview-card-body">
              <h3>Packing List</h3>
              <p>${packingCount > 0 ? `${packedCount} / ${packingCount} packed` : 'Not started'}</p>
            </div>
            <span class="overview-card-arrow">→</span>
          </button>
          <button class="overview-card" data-nav="budget">
            <div class="overview-card-icon">💶</div>
            <div class="overview-card-body">
              <h3>Budget</h3>
              <p>${totalBudget > 0 ? `€${totalBudget.toLocaleString()} spent${budgetLimit > 0 ? ` of €${budgetLimit.toLocaleString()}` : ''}` : 'No expenses yet'}</p>
            </div>
            <span class="overview-card-arrow">→</span>
          </button>
          <button class="overview-card" data-nav="map">
            <div class="overview-card-icon">🗺️</div>
            <div class="overview-card-body">
              <h3>Map</h3>
              <p>Pet-friendly places near ${t.destination ? escHtml(t.destination) : 'your destination'}</p>
            </div>
            <span class="overview-card-arrow">→</span>
          </button>
        </div>
      </section>

    </div>
  `

  // Navigate to inner tabs when overview cards are clicked
  el.querySelectorAll<HTMLButtonElement>('.overview-card').forEach((card) => {
    card.addEventListener('click', () => {
      const tab = card.dataset.nav
      if (tab) navigate(`trip/${tripRecord.id}/${tab}`)
    })
  })
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function holidayEmoji(type: string): string {
  const map: Record<string, string> = { beach: '🏖️', mountains: '⛰️', city: '🏙️', camping: '⛺', other: '✈️' }
  return map[type] ?? '✈️'
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
