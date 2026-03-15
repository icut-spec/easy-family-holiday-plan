import type { TripRecord } from '../types'

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
            <div class="map-legend-item"><span class="map-pin map-pin--blue"></span> Saved activities</div>
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
              🐕 Dog parks
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
            ? `<iframe
                class="map-iframe"
                loading="lazy"
                allowfullscreen
                referrerpolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps/embed/v1/search?key=${encodeURIComponent(apiKey)}&q=pet+friendly+${encodedDest}"
              ></iframe>`
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
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
