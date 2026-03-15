import { loadState, setState, onStateChange } from './store'
import { onRouteChange, currentRoute, navigate } from './router'
import type { Route } from './router'
import { mount as mountLanding } from './pages/LandingPage'
import { mount as mountAuth } from './pages/AuthPage'
import { mount as mountTrips } from './pages/TripsPage'
import { mount as mountTripPage } from './pages/TripPage'
import { onAuthChange, getSession, getUser } from './lib/auth'
import { loadTripsFromDB, syncTripToDB } from './lib/sync'

// Boot: load persisted state from localStorage
loadState()

const appEl = document.getElementById('app') as HTMLElement

// ─── Auth guard ───────────────────────────────────────────────────────────────
// Protected routes require an active session.
const PROTECTED: Route['name'][] = ['trips', 'trip']

async function isAuthenticated(): Promise<boolean> {
  const session = await getSession()
  return session !== null
}

// ─── Renderer ────────────────────────────────────────────────────────────────

async function render(route: Route): Promise<void> {
  // Guard protected routes
  if ((PROTECTED as string[]).includes(route.name)) {
    const authed = await isAuthenticated()
    if (!authed) {
      navigate('auth/login')
      return
    }
  }

  // Clear the app root
  appEl.innerHTML = ''

  switch (route.name) {
    case 'landing':
      mountLanding(appEl)
      break

    case 'auth':
      mountAuth(appEl, route.mode ?? 'signup')
      break

    case 'trips':
      mountTrips(appEl)
      break

    case 'trip':
      mountTripPage(appEl, route.tripId, route.tab ?? 'overview')
      break

    default:
      mountLanding(appEl)
  }
}

// ─── Auth state listener ──────────────────────────────────────────────────────

onAuthChange(async (user) => {
  if (user) {
    // Signed in: pull the latest data from DB, then re-render current route
    await loadTripsFromDB(user.id)
    render(currentRoute())
  } else {
    // Signed out: clear trips from state and go to landing
    setState({ trips: [], currentTripId: null })
    navigate('landing')
  }
})

// ─── State → DB sync ─────────────────────────────────────────────────────────
// Whenever a trip is mutated, push the changed trip record to Supabase.

onStateChange(async (state) => {
  const user = await getUser()
  if (!user) return

  // Sync every trip that was affected. For simplicity in MVP: sync the
  // currentTripId if set, otherwise sync nothing (create-trip is handled
  // separately via syncTripToDB on the TripsPage after setState).
  const tripId = state.currentTripId
  if (!tripId) return
  const trip = state.trips.find((t) => t.id === tripId)
  if (trip) await syncTripToDB(trip, user.id)
})

// ─── Router ───────────────────────────────────────────────────────────────────

onRouteChange(render)

// Render current route on boot
render(currentRoute())
