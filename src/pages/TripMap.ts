import type { TripRecord } from '../types'

// Extend window for Google Maps callback
declare global {
  interface Window {
    __mapsCallback?: () => void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google?: any
  }
}

export function mountMap(el: HTMLElement, tripRecord: TripRecord): void {
  const dest = tripRecord.trip.destination
  const apiKey = (import.meta as unknown as { env: { VITE_GOOGLE_MAPS_API_KEY?: string } }).env.VITE_GOOGLE_MAPS_API_KEY

  if (!dest) {
    el.innerHTML = `
      <div class="map-page">
        <div class="empty-state">
          <div class="empty-state-icon">🗺️</div>
          <p class="empty-state-title">No destination set.</p>
          <p class="empty-state-sub">Set a destination for your trip to explore the map.</p>
        </div>
      </div>
    `
    return
  }

  const encodedDest = encodeURIComponent(dest)

  el.innerHTML = `
    <div class="map-page">
      <div class="map-layout">
        <aside class="map-sidebar">
          <h2 class="map-sidebar-title">📍 ${escHtml(dest)}</h2>
          <p class="map-sidebar-sub">Pet-friendly places near your destination</p>

          <div class="map-legend">
            <div class="map-legend-item"><span class="map-pin map-pin--green"></span> Parks &amp; dog parks</div>
            <div class="map-legend-item"><span class="map-pin map-pin--orange"></span> Pet-friendly restaurants</div>
            <div class="map-legend-item"><span class="map-pin map-pin--red"></span> Veterinarians</div>
          </div>

          <div id="map-places-list" class="map-places-list">
            ${apiKey ? `<p class="map-places-loading">Loading nearby places…</p>` : ''}
          </div>

          <div class="map-actions">
            <a
              href="https://www.google.com/maps/search/pet+friendly+places+near+${encodedDest}"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn--primary btn--full"
            >
              🗺️ Open in Google Maps
            </a>
            <a
              href="https://www.google.com/maps/search/dog+park+near+${encodedDest}"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn--ghost btn--full"
            >
              🌳 Dog parks
            </a>
            <a
              href="https://www.google.com/maps/search/veterinarian+near+${encodedDest}"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn--ghost btn--full"
            >
              🏥 Veterinarians
            </a>
            <a
              href="https://www.google.com/maps/search/pet+friendly+restaurant+near+${encodedDest}"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn--ghost btn--full"
            >
              🍽️ Pet-friendly restaurants
            </a>
          </div>
        </aside>

        <div class="map-embed-wrap">
          ${apiKey
            ? `<div id="map-canvas" class="map-canvas"></div>`
            : `<div class="map-fallback">
                <div class="map-fallback-inner">
                  <p class="map-fallback-icon">🗺️</p>
                  <p class="map-fallback-title">Interactive map</p>
                  <p class="map-fallback-sub">Add a Google Maps API key to enable the embedded map.</p>
                  <p class="map-fallback-sub">Use the links on the left to explore pet-friendly places.</p>
                </div>
              </div>`
          }
        </div>
      </div>
    </div>
  `

  if (apiKey) {
    initMapsApi(el, dest, apiKey)
  }
}

// ── Google Maps JS API integration ─────────────────────────────────────────

const CATEGORIES: { label: string; query: string; pinColor: string; icon: string }[] = [
  { label: 'Parks & dog parks', query: 'dog park', pinColor: '#22c55e', icon: '🌳' },
  { label: 'Pet-friendly restaurants', query: 'pet friendly restaurant', pinColor: '#f97316', icon: '🍽️' },
  { label: 'Veterinarians', query: 'veterinarian', pinColor: '#ef4444', icon: '🏥' },
]

function initMapsApi(el: HTMLElement, destination: string, apiKey: string): void {
  // If Maps JS API is already loaded, init directly
  if (window.google?.maps) {
    loadMap(el, destination)
    return
  }

  // Load Maps JS API script (once)
  if (!document.getElementById('gmaps-script')) {
    const callbackName = '__mapsCallback'
    window[callbackName] = () => loadMap(el, destination)

    const script = document.createElement('script')
    script.id = 'gmaps-script'
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&callback=${callbackName}`
    script.async = true
    script.defer = true
    script.onerror = () => showMapError(el)
    document.head.appendChild(script)
  } else {
    // Script tag exists but callback may have fired already — wait a tick
    setTimeout(() => {
      if (window.google?.maps) loadMap(el, destination)
      else showMapError(el)
    }, 2000)
  }
}

function loadMap(el: HTMLElement, destination: string): void {
  const canvas = el.querySelector<HTMLElement>('#map-canvas')
  if (!canvas || !window.google?.maps) return

  const geocoder = new window.google.maps.Geocoder()
  geocoder.geocode({ address: destination }, (results: any[], status: string) => {
    if (status !== 'OK' || !results?.length) {
      showMapError(el)
      return
    }

    const location = results[0].geometry.location
    const map = new window.google.maps.Map(canvas, {
      center: location,
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
    })

    const service = new window.google.maps.places.PlacesService(map)
    const listEl = el.querySelector<HTMLElement>('#map-places-list')
    if (listEl) listEl.innerHTML = ''

    CATEGORIES.forEach(({ label, query, pinColor, icon }) => {
    const request = {
        query: `${query} near ${destination}`,
        location,
        radius: 5000,
      }

      service.textSearch(request, (places: any[], searchStatus: string) => {
        if (searchStatus !== window.google!.maps.places.PlacesServiceStatus.OK || !places) return

        const top: any[] = places.slice(0, 5)

        // Add section to sidebar
        if (listEl && top.length > 0) {
          const section = document.createElement('div')
          section.className = 'map-places-section'
          section.innerHTML = `
            <h4 class="map-places-category">${icon} ${escHtml(label)}</h4>
            <ul class="map-places-items">
              ${top.map((p: any) => `
                <li class="map-places-item">
                  <span class="map-places-name">${escHtml(p.name ?? '')}</span>
                  <span class="map-places-addr">${escHtml(p.formatted_address ?? '')}</span>
                  <a
                    class="map-places-directions"
                    href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent((p.name ?? '') + ' ' + (p.formatted_address ?? ''))}"
                    target="_blank"
                    rel="noopener noreferrer"
                  >Get Directions →</a>
                </li>
              `).join('')}
            </ul>
          `
          listEl.appendChild(section)
        }

        // Add markers to map
        top.forEach((place: any) => {
          if (!place.geometry?.location) return
          // eslint-disable-next-line no-new
          new window.google!.maps.Marker({
            map,
            position: place.geometry.location,
            title: place.name,
            icon: {
              path: window.google!.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: pinColor,
              fillOpacity: 0.9,
              strokeColor: '#fff',
              strokeWeight: 2,
            },
          })
        })
      })
    })
  })
}

function showMapError(el: HTMLElement): void {
  const canvas = el.querySelector<HTMLElement>('#map-canvas')
  if (canvas) {
    canvas.innerHTML = `
      <div class="map-fallback">
        <div class="map-fallback-inner">
          <p class="map-fallback-icon">⚠️</p>
          <p class="map-fallback-title">Map could not load</p>
          <p class="map-fallback-sub">Check your Google Maps API key or use the links on the left.</p>
        </div>
      </div>
    `
  }
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
