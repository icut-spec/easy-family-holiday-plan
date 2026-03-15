import type { AppState, Trip } from './types'

const STORAGE_KEY = 'efhp-state'

const defaultTrip: Trip = {
  destination: '',
  startDate: '',
  endDate: '',
  budget: 0,
  holidayType: 'other',
  petFriendly: false,
}

const defaultState: AppState = {
  trip: defaultTrip,
  members: [],
  packingItems: [],
  trips: [],
  currentTripId: null,
}

let _state: AppState = { ...defaultState }

export function loadState(): AppState {
  try {
    const raw = (globalThis.localStorage ?? localStorage).getItem(STORAGE_KEY)
    if (!raw) {
      _state = { ...defaultState, trip: { ...defaultTrip } }
      return _state
    }
    const parsed = JSON.parse(raw) as Partial<AppState>
    // Migrate old state that may not have trips/currentTripId
    _state = {
      ...defaultState,
      ...parsed,
      trip: { ...defaultTrip, ...(parsed.trip ?? {}) },
      trips: parsed.trips ?? [],
      currentTripId: parsed.currentTripId ?? null,
    }
    return _state
  } catch {
    _state = { ...defaultState, trip: { ...defaultTrip } }
    return _state
  }
}

export function saveState(state: AppState): void {
  _state = state
  ;(globalThis.localStorage ?? localStorage).setItem(STORAGE_KEY, JSON.stringify(state))
}

export function getState(): AppState {
  return _state
}

export function setState(partial: Partial<AppState>): void {
  _state = { ..._state, ...partial }
  saveState(_state)
}
