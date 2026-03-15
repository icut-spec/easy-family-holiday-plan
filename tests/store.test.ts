import { describe, it, expect, beforeEach } from 'vitest'
import { loadState, getState, setState, saveState } from '../src/store'
import type { AppState } from '../src/types'

// ── localStorage mock ──────────────────────────────────────────────────────

const store: Record<string, string> = {}

const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value },
  removeItem: (key: string) => { delete store[key] },
  clear: () => { Object.keys(store).forEach(k => delete store[k]) },
}

// @ts-expect-error – injecting mock into global
globalThis.localStorage = localStorageMock

// ── Helpers ────────────────────────────────────────────────────────────────

function freshState(): AppState {
  return {
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
  }
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('store', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  describe('loadState', () => {
    it('returns default state when localStorage is empty', () => {
      const state = loadState()
      expect(state.trip.destination).toBe('')
      expect(state.members).toEqual([])
      expect(state.packingItems).toEqual([])
      expect(state.trip.holidayType).toBe('other')
    })

    it('returns default state when localStorage contains invalid JSON', () => {
      store['efhp-state'] = '{ not valid json }'
      const state = loadState()
      expect(state.trip.destination).toBe('')
      expect(state.members).toEqual([])
    })

    it('restores previously saved state', () => {
      const saved: AppState = {
        ...freshState(),
        trip: { ...freshState().trip, destination: 'Barcelona', budget: 1500 },
      }
      store['efhp-state'] = JSON.stringify(saved)
      const state = loadState()
      expect(state.trip.destination).toBe('Barcelona')
      expect(state.trip.budget).toBe(1500)
    })
  })

  describe('saveState / getState', () => {
    it('getState reflects the last loaded state', () => {
      loadState()
      expect(getState().trip.destination).toBe('')
    })

    it('saveState persists state to localStorage', () => {
      loadState()
      const s = getState()
      saveState({ ...s, trip: { ...s.trip, destination: 'Tokyo' } })
      const raw = store['efhp-state']
      expect(JSON.parse(raw).trip.destination).toBe('Tokyo')
    })

    it('getState returns updated value after saveState', () => {
      loadState()
      const s = getState()
      saveState({ ...s, trip: { ...s.trip, destination: 'Tokyo' } })
      expect(getState().trip.destination).toBe('Tokyo')
    })
  })

  describe('setState', () => {
    it('merges partial state shallowly', () => {
      loadState()
      setState({ trip: { ...getState().trip, destination: 'Paris', budget: 2000 } })
      expect(getState().trip.destination).toBe('Paris')
      expect(getState().trip.budget).toBe(2000)
    })

    it('persists merged state to localStorage', () => {
      loadState()
      setState({ trip: { ...getState().trip, destination: 'Rome' } })
      const raw = store['efhp-state']
      expect(JSON.parse(raw).trip.destination).toBe('Rome')
    })

    it('does not overwrite unrelated fields when patching trip', () => {
      loadState()
      setState({ trip: { ...getState().trip, holidayType: 'beach' } })
      setState({ trip: { ...getState().trip, destination: 'Bali' } })
      expect(getState().trip.holidayType).toBe('beach')
      expect(getState().trip.destination).toBe('Bali')
    })

    it('appends members correctly', () => {
      loadState()
      const member = { id: 'abc', type: 'adult' as const, name: 'Alice' }
      setState({ members: [member] })
      expect(getState().members).toHaveLength(1)
      expect(getState().members[0].name).toBe('Alice')
    })
  })
})
