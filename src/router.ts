export type Route =
  | { name: 'landing' }
  | { name: 'auth'; mode?: 'login' | 'signup' }
  | { name: 'trips' }
  | { name: 'trip'; tripId: string; tab?: TripTab }

export type TripTab = 'overview' | 'itinerary' | 'map' | 'packing' | 'budget'

type RouteHandler = (route: Route) => void

const _handlers: RouteHandler[] = []

export function onRouteChange(handler: RouteHandler): void {
  _handlers.push(handler)
}

function parse(hash: string): Route {
  const h = hash.replace(/^#\/?/, '')
  if (!h || h === 'landing') return { name: 'landing' }
  if (h === 'auth' || h === 'auth/login') return { name: 'auth', mode: 'login' }
  if (h === 'auth/signup') return { name: 'auth', mode: 'signup' }
  if (h === 'trips') return { name: 'trips' }
  const tripMatch = h.match(/^trip\/([^/]+)(?:\/(.+))?$/)
  if (tripMatch) {
    const tripId = tripMatch[1]
    const tab = (tripMatch[2] as TripTab | undefined) ?? 'overview'
    return { name: 'trip', tripId, tab }
  }
  return { name: 'landing' }
}

function dispatch(): void {
  const route = parse(window.location.hash)
  _handlers.forEach((h) => h(route))
}

export function navigate(hash: string): void {
  window.location.hash = hash
}

export function currentRoute(): Route {
  return parse(window.location.hash)
}

// Boot: listen to hash changes
window.addEventListener('hashchange', dispatch)
// Fire once on load
window.addEventListener('DOMContentLoaded', dispatch)
