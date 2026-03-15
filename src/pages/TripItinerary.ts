import { getState, setState } from '../store'
import type { TripRecord, ItineraryDay, ItineraryActivity } from '../types'

export function mountItinerary(el: HTMLElement, tripRecord: TripRecord): void {
  renderItinerary(el, tripRecord)
}

function getTripRecord(tripRecord: TripRecord): TripRecord {
  // Always read fresh from store
  return getState().trips.find((t) => t.id === tripRecord.id) ?? tripRecord
}

function saveTripRecord(updated: TripRecord): void {
  const state = getState()
  const trips = state.trips.map((t) => (t.id === updated.id ? updated : t))
  setState({ trips })
}

function buildScaffold(tripRecord: TripRecord): ItineraryDay[] {
  if (!tripRecord.trip.startDate || !tripRecord.trip.endDate) return tripRecord.itinerary
  const start = new Date(tripRecord.trip.startDate)
  const end = new Date(tripRecord.trip.endDate)
  const days: ItineraryDay[] = []
  const cursor = new Date(start)
  while (cursor <= end) {
    const iso = cursor.toISOString().slice(0, 10)
    const existing = tripRecord.itinerary.find((d) => d.date === iso)
    days.push(existing ?? { date: iso, activities: [] })
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

function renderItinerary(el: HTMLElement, tripRecord: TripRecord): void {
  const fresh = getTripRecord(tripRecord)
  const days = buildScaffold(fresh)

  if (days.length === 0) {
    el.innerHTML = `
      <div class="itinerary-page">
        <div class="empty-state">
          <div class="empty-state-icon">🗓️</div>
          <p class="empty-state-title">No dates set.</p>
          <p class="empty-state-sub">Set start and end dates on your trip to build an itinerary.</p>
        </div>
      </div>
    `
    return
  }

  el.innerHTML = `
    <div class="itinerary-page">
      ${days.map((day, i) => renderDay(day, i + 1)).join('')}
    </div>
  `

  bindItineraryEvents(el, fresh)
}

function renderDay(day: ItineraryDay, dayNum: number): string {
  const label = new Date(day.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
  const acts = day.activities
    .slice()
    .sort((a, b) => a.time.localeCompare(b.time))

  return `
    <section class="itinerary-day" data-date="${escHtml(day.date)}">
      <div class="itinerary-day-header">
        <h2 class="itinerary-day-title">Day ${dayNum} <span class="itinerary-day-date">— ${escHtml(label)}</span></h2>
      </div>

      <ul class="itinerary-activities" data-date="${escHtml(day.date)}">
        ${acts.length === 0
          ? `<li class="itinerary-empty">No activities yet. Add your first one.</li>`
          : acts.map((a) => renderActivity(a, day.date)).join('')}
      </ul>

      <div class="itinerary-add-row">
        <form class="itinerary-add-form" data-date="${escHtml(day.date)}">
          <input class="form-input itinerary-time-input" type="time" name="time" value="09:00" aria-label="Time" />
          <input class="form-input itinerary-title-input" type="text" name="title" placeholder="Activity name" aria-label="Activity name" required />
          <button type="submit" class="btn btn--primary btn--sm">Add</button>
        </form>
      </div>
    </section>
  `
}

function renderActivity(activity: ItineraryActivity, date: string): string {
  return `
    <li class="itinerary-activity" data-id="${escHtml(activity.id)}" data-date="${escHtml(date)}">
      <span class="itinerary-activity-time">${escHtml(activity.time)}</span>
      <span class="itinerary-activity-title">${escHtml(activity.title)}</span>
      <div class="itinerary-activity-actions">
        <button class="itinerary-edit-btn btn btn--ghost btn--xs" data-id="${escHtml(activity.id)}" data-date="${escHtml(date)}" aria-label="Edit activity">✏️</button>
        <button class="itinerary-delete-btn btn btn--ghost btn--xs" data-id="${escHtml(activity.id)}" data-date="${escHtml(date)}" aria-label="Delete activity">❌</button>
      </div>
    </li>
  `
}

function bindItineraryEvents(el: HTMLElement, tripRecord: TripRecord): void {
  // Add activity
  el.querySelectorAll<HTMLFormElement>('.itinerary-add-form').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault()
      const date = form.dataset.date!
      const timeInput = form.querySelector<HTMLInputElement>('[name="time"]')!
      const titleInput = form.querySelector<HTMLInputElement>('[name="title"]')!
      const title = titleInput.value.trim()
      if (!title) return

      const fresh = getTripRecord(tripRecord)
      const days = buildScaffold(fresh)
      const day = days.find((d) => d.date === date)
      if (!day) return

      const newActivity: ItineraryActivity = {
        id: crypto.randomUUID(),
        time: timeInput.value || '09:00',
        title,
      }
      day.activities.push(newActivity)
      const updated = { ...fresh, itinerary: days }
      saveTripRecord(updated)
      renderItinerary(el, updated)
    })
  })

  // Delete activity
  el.querySelectorAll<HTMLButtonElement>('.itinerary-delete-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id!
      const date = btn.dataset.date!
      const fresh = getTripRecord(tripRecord)
      const days = buildScaffold(fresh).map((d) => {
        if (d.date !== date) return d
        return { ...d, activities: d.activities.filter((a) => a.id !== id) }
      })
      const updated = { ...fresh, itinerary: days }
      saveTripRecord(updated)
      renderItinerary(el, updated)
    })
  })

  // Inline edit activity (replace li with an edit form)
  el.querySelectorAll<HTMLButtonElement>('.itinerary-edit-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id!
      const date = btn.dataset.date!
      const fresh = getTripRecord(tripRecord)
      const days = buildScaffold(fresh)
      const day = days.find((d) => d.date === date)
      const act = day?.activities.find((a) => a.id === id)
      if (!act) return

      const li = el.querySelector<HTMLLIElement>(`.itinerary-activity[data-id="${id}"]`)
      if (!li) return

      li.innerHTML = `
        <form class="itinerary-inline-edit" data-id="${escHtml(id)}" data-date="${escHtml(date)}">
          <input class="form-input itinerary-time-input" type="time" name="time" value="${escHtml(act.time)}" />
          <input class="form-input itinerary-title-input" type="text" name="title" value="${escHtml(act.title)}" required />
          <button type="submit" class="btn btn--primary btn--xs">Save</button>
          <button type="button" class="itinerary-edit-cancel btn btn--ghost btn--xs">Cancel</button>
        </form>
      `

      li.querySelector<HTMLFormElement>('.itinerary-inline-edit')?.addEventListener('submit', (e) => {
        e.preventDefault()
        const newTime = li.querySelector<HTMLInputElement>('[name="time"]')!.value
        const newTitle = li.querySelector<HTMLInputElement>('[name="title"]')!.value.trim()
        if (!newTitle) return
        const updatedDays = buildScaffold(getTripRecord(tripRecord)).map((d) => {
          if (d.date !== date) return d
          return { ...d, activities: d.activities.map((a) => a.id === id ? { ...a, time: newTime, title: newTitle } : a) }
        })
        const updated = { ...getTripRecord(tripRecord), itinerary: updatedDays }
        saveTripRecord(updated)
        renderItinerary(el, updated)
      })

      li.querySelector('.itinerary-edit-cancel')?.addEventListener('click', () => {
        renderItinerary(el, getTripRecord(tripRecord))
      })
    })
  })
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
