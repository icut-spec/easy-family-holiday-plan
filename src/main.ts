import { loadState } from './store'
import { onRouteChange, currentRoute } from './router'
import type { Route } from './router'
import { mount as mountLanding } from './pages/LandingPage'
import { mount as mountAuth } from './pages/AuthPage'
import { mount as mountTrips } from './pages/TripsPage'
import { mount as mountTripPage } from './pages/TripPage'

// Boot: load persisted state
loadState()

const appEl = document.getElementById('app') as HTMLElement

function render(route: Route): void {
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

// Register router handler
onRouteChange(render)

// Render current route on boot (DOMContentLoaded fires the dispatch,
// but also trigger immediately in case it already fired)
render(currentRoute())
