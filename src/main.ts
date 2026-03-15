import { getState, setState, loadState } from './store'
import { mount as mountTrip } from './components/TripSetup'
import { mount as mountFamily } from './components/FamilySetup'
import { mount as mountActivities } from './components/ActivitiesList'
import { mount as mountPacking } from './components/PackingList'

// Boot: load persisted state
loadState()

// Mount all components into their sections
const tripEl = document.getElementById('tab-trip') as HTMLElement
const familyEl = document.getElementById('tab-family') as HTMLElement
const activitiesEl = document.getElementById('tab-activities') as HTMLElement
const packingEl = document.getElementById('tab-packing') as HTMLElement

mountTrip(tripEl)
mountFamily(familyEl)
mountActivities(activitiesEl)
mountPacking(packingEl)

// Tab navigation
const tabBtns = document.querySelectorAll<HTMLButtonElement>('.tab-btn')
const tabSections = document.querySelectorAll<HTMLElement>('.tab-section')

tabBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab

    // Update active tab button
    tabBtns.forEach((b) => b.classList.remove('active'))
    btn.classList.add('active')

    // Show target section, hide others
    tabSections.forEach((section) => {
      if (section.id === `tab-${target}`) {
        section.classList.remove('hidden')
      } else {
        section.classList.add('hidden')
      }
    })

    // Refresh summary on every tab switch
    renderSummary()
  })
})

// ── US-6.3 Trip Summary ─────────────────────────────────────────

const summaryEl = document.getElementById('trip-summary') as HTMLElement

function renderSummary(): void {
  const { trip, members } = getState()

  const hasDestination = trip.destination.trim() !== ''
  const hasDates = trip.startDate && trip.endDate

  if (!hasDestination && members.length === 0) {
    summaryEl.classList.add('hidden')
    return
  }

  summaryEl.classList.remove('hidden')

  const adults = members.filter((m) => m.type === 'adult').length
  const children = members.filter((m) => m.type === 'child').length
  const pets = members.filter((m) => m.type === 'pet').length

  const travelersText = buildTravelersText(adults, children, pets)
  const datesText = hasDates ? formatDateRange(trip.startDate, trip.endDate) : ''
  const budgetText = trip.budget > 0 ? `€${trip.budget.toLocaleString()}` : ''

  const typeEmoji: Record<string, string> = {
    beach: '🏖️', mountains: '⛰️', city: '🏙️', camping: '⛺', other: '✈️',
  }
  const emoji = typeEmoji[trip.holidayType] ?? '✈️'

  const chips: string[] = []
  if (hasDestination) chips.push(`<span class="summary-chip summary-chip--dest">${emoji} ${escHtml(trip.destination)}</span>`)
  if (datesText) chips.push(`<span class="summary-chip">📅 ${escHtml(datesText)}</span>`)
  if (travelersText) chips.push(`<span class="summary-chip">👨‍👩‍👧 ${escHtml(travelersText)}</span>`)
  if (budgetText) chips.push(`<span class="summary-chip">💶 ${escHtml(budgetText)}</span>`)

  summaryEl.innerHTML = chips.join('')
}

function buildTravelersText(adults: number, children: number, pets: number): string {
  const parts: string[] = []
  if (adults > 0) parts.push(`${adults} adult${adults !== 1 ? 's' : ''}`)
  if (children > 0) parts.push(`${children} child${children !== 1 ? 'ren' : ''}`)
  if (pets > 0) parts.push(`${pets} pet${pets !== 1 ? 's' : ''}`)
  return parts.join(', ')
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start)
  const e = new Date(end)
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
  const days = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24))
  const label = days > 0 ? ` (${days}n)` : ''
  return `${s.toLocaleDateString('en-GB', opts)} – ${e.toLocaleDateString('en-GB', opts)}${label}`
}

function escHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// Render summary on initial load
renderSummary()

// Re-render summary whenever state changes: hook into setState via a polling
// approach on tab-trip / tab-family inputs
document.addEventListener('input', () => renderSummary())
document.addEventListener('change', () => renderSummary())

// ── US-6.4 Reset / Start New Plan ──────────────────────────────

const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement

resetBtn.addEventListener('click', () => {
  const confirmed = window.confirm(
    'Start a new plan? This will clear all trip data, family members, activities and your packing list.'
  )
  if (!confirmed) return

  // Clear state
  setState({
    trip: {
      destination: '',
      startDate: '',
      endDate: '',
      budget: 0,
      holidayType: 'other',
      petFriendly: false,
    },
    members: [],
    packingItems: [],
  })

  // Re-mount all tabs
  mountTrip(tripEl)
  mountFamily(familyEl)
  mountActivities(activitiesEl)
  mountPacking(packingEl)

  // Go back to first tab
  tabBtns.forEach((b) => b.classList.remove('active'))
  tabBtns[0].classList.add('active')
  tabSections.forEach((s, i) => {
    if (i === 0) s.classList.remove('hidden')
    else s.classList.add('hidden')
  })

  renderSummary()
})
