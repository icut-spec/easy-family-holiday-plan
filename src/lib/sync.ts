/**
 * src/lib/sync.ts
 * Syncs app state (trips) between Supabase and localStorage.
 *
 * Strategy:
 * - On user sign-in  → loadTripsFromDB() → replaces localStorage trips with DB data
 * - On state change  → syncTripToDB()    → upserts a single TripRecord to DB
 * - On user sign-out → nothing to do (localStorage stays, user must clear manually)
 *
 * All functions are no-ops when Supabase is not configured.
 *
 * Note: supabase.from() calls use a typed `any` cast because hand-written
 * database types do not always satisfy the strict generic overloads in
 * @supabase/supabase-js v2.99. The runtime behaviour is correct.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { supabase as _supabase } from './supabase'
import { setState, getState } from '../store'
import type { TripRecord, FamilyMember, PackingItem, ItineraryDay, BudgetEntry } from '../types'

// Cast to any once here so all .from() chains compile without overload errors.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = _supabase as any

// Indicator state ─────────────────────────────────────────────────────────────

type SyncStatus = 'idle' | 'saving' | 'saved' | 'error'
type SyncStatusCallback = (status: SyncStatus) => void

const _listeners: SyncStatusCallback[] = []
let _status: SyncStatus = 'idle'

export function onSyncStatus(cb: SyncStatusCallback): void {
  _listeners.push(cb)
}

function setStatus(s: SyncStatus): void {
  _status = s
  _listeners.forEach((cb) => cb(s))
}

export function getSyncStatus(): SyncStatus {
  return _status
}

// ─── Load trips from DB ───────────────────────────────────────────────────────

export async function loadTripsFromDB(userId: string): Promise<void> {
  if (!db) return

  const { data: rows, error } = await db
    .from('trips')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error || !rows) return

  // For each trip row, fetch its related data in parallel
  const trips: TripRecord[] = await Promise.all(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rows.map((row: any) => fetchFullTrip(row.id, row)),
  )

  setState({ trips, currentTripId: getState().currentTripId })
}

// ─── Upsert a single TripRecord to DB ────────────────────────────────────────

export async function syncTripToDB(trip: TripRecord, userId: string): Promise<void> {
  if (!db) return

  setStatus('saving')

  try {
    // 1. Upsert the trips row
    const { error: tripErr } = await db.from('trips').upsert({
      id: trip.id,
      user_id: userId,
      title: trip.title,
      destination: trip.trip.destination,
      start_date: trip.trip.startDate || new Date().toISOString().slice(0, 10),
      end_date: trip.trip.endDate || new Date().toISOString().slice(0, 10),
      adults: trip.members.filter((m: FamilyMember) => m.type === 'adult').length,
      children: trip.members.filter((m: FamilyMember) => m.type === 'child').length,
      pets: trip.members.filter((m: FamilyMember) => m.type === 'pet').length,
      pet_type: trip.members.find((m: FamilyMember) => m.type === 'pet')?.petType ?? null,
      budget: trip.trip.budget,
      holiday_type: trip.trip.holidayType,
      pet_friendly: trip.trip.petFriendly,
      created_at: trip.createdAt,
    })

    if (tripErr) throw tripErr

    // 2. Packing items: delete + reinsert (simple bulk sync)
    await db.from('packing_items').delete().eq('trip_id', trip.id)

    if (trip.packingItems.length > 0) {
      const { error: packErr } = await db.from('packing_items').insert(
        trip.packingItems.map((item: PackingItem) => ({
          id: item.id,
          trip_id: trip.id,
          item_name: item.label,
          category: item.category,
          checked: item.checked,
        })),
      )
      if (packErr) throw packErr
    }

    // 3. Activities (itinerary): delete + reinsert
    await db.from('activities').delete().eq('trip_id', trip.id)

    const activityRows = trip.itinerary.flatMap((day: ItineraryDay) =>
      day.activities.map((act) => ({
        id: act.id,
        trip_id: trip.id,
        title: act.title,
        date: day.date,
        time: act.time || null,
        location: null,
        notes: null,
      })),
    )

    if (activityRows.length > 0) {
      const { error: actErr } = await db.from('activities').insert(activityRows)
      if (actErr) throw actErr
    }

    // 4. Budget entries: delete + reinsert
    await db.from('budget').delete().eq('trip_id', trip.id)

    if (trip.budget.length > 0) {
      const { error: budgetErr } = await db.from('budget').insert(
        trip.budget.map((entry: BudgetEntry) => ({
          id: entry.id,
          trip_id: trip.id,
          category: entry.category,
          amount: entry.amount,
          description: entry.description,
        })),
      )
      if (budgetErr) throw budgetErr
    }

    setStatus('saved')
    // Reset to idle after 2 s
    setTimeout(() => setStatus('idle'), 2000)
  } catch {
    setStatus('error')
  }
}

// ─── Delete a trip from DB ───────────────────────────────────────────────────

export async function deleteTripFromDB(tripId: string): Promise<void> {
  if (!db) return
  await db.from('trips').delete().eq('id', tripId)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function fetchFullTrip(
  tripId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  row: any,
): Promise<TripRecord> {
  if (!db) {
    return rowToTripRecord(row, [], [], [])
  }

  const [packRes, actRes, budgetRes] = await Promise.all([
    db.from('packing_items').select('*').eq('trip_id', tripId),
    db.from('activities').select('*').eq('trip_id', tripId).order('date').order('time'),
    db.from('budget').select('*').eq('trip_id', tripId).order('created_at'),
  ])

  return rowToTripRecord(
    row,
    packRes.data ?? [],
    actRes.data ?? [],
    budgetRes.data ?? [],
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToTripRecord(row: any, packRows: any[], actRows: any[], budgetRows: any[]): TripRecord {
  // Rebuild itinerary grouped by date
  const dayMap = new Map<string, ItineraryDay>()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const a of actRows as any[]) {
    if (!dayMap.has(a.date)) dayMap.set(a.date, { date: a.date, activities: [] })
    dayMap.get(a.date)!.activities.push({ id: a.id, time: a.time ?? '', title: a.title })
  }

  const packingItems: PackingItem[] = (packRows as any[]).map((p) => ({
    id: p.id,
    label: p.item_name,
    category: p.category,
    checked: p.checked,
  }))

  const budget: BudgetEntry[] = (budgetRows as any[]).map((b) => ({
    id: b.id,
    category: b.category as BudgetEntry['category'],
    description: b.description,
    amount: Number(b.amount),
  }))

  // Members are not yet in DB — start empty (will be added in Epic 8)
  const members: FamilyMember[] = []

  return {
    id: row.id,
    title: row.title,
    createdAt: row.created_at,
    trip: {
      destination: row.destination,
      startDate: row.start_date,
      endDate: row.end_date,
      budget: Number(row.budget),
      holidayType: row.holiday_type,
      petFriendly: row.pet_friendly,
    },
    members,
    packingItems,
    itinerary: Array.from(dayMap.values()),
    budget,
  }
}
