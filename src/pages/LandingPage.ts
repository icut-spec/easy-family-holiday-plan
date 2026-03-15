import { navigate } from '../router'

export function mount(el: HTMLElement): void {
  el.innerHTML = `
    <div class="landing-page">

      <!-- Hero (US-10.1) -->
      <section class="hero">
        <div class="hero-inner">
          <div class="hero-text">
            <h1 class="hero-headline">Travel planning for<br>families and pets.</h1>
            <p class="hero-sub">Plan itineraries, packing lists and pet-friendly activities — all in one place.</p>
            <div class="hero-actions">
              <a href="#auth/signup" class="btn btn--primary btn--lg">Get started free</a>
              <a href="#auth/login" class="btn btn--ghost btn--lg">Log in</a>
            </div>
          </div>
          <div class="hero-illustration" aria-hidden="true">
            <div class="hero-illustration-inner">
              <span class="hero-emoji">✈️</span>
              <span class="hero-emoji">🐾</span>
              <span class="hero-emoji">🗺️</span>
              <span class="hero-emoji">🧳</span>
            </div>
          </div>
        </div>
      </section>

      <!-- How it works (US-10.2) -->
      <section class="how-it-works">
        <div class="section-inner">
          <h2 class="section-title">How it works</h2>
          <ol class="steps-list">
            <li class="step-item">
              <div class="step-number">1</div>
              <div class="step-content">
                <h3>Create a trip</h3>
                <p>Add a destination, dates, budget and holiday type.</p>
              </div>
            </li>
            <li class="step-item">
              <div class="step-number">2</div>
              <div class="step-content">
                <h3>Add your family &amp; pets</h3>
                <p>Tell us who's coming — adults, children, and your furry friends.</p>
              </div>
            </li>
            <li class="step-item">
              <div class="step-number">3</div>
              <div class="step-content">
                <h3>Plan everything</h3>
                <p>Build your itinerary, explore the pet-friendly map, pack smarter, and track spending.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <!-- Features (US-10.2) -->
      <section class="features">
        <div class="section-inner">
          <h2 class="section-title">Everything your family needs</h2>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">🗓️</div>
              <h3>Day-by-day itinerary</h3>
              <p>Build a detailed schedule for every day of your trip, with activity suggestions built in.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🗺️</div>
              <h3>Pet-friendly map</h3>
              <p>Discover dog parks, pet-friendly restaurants and vets near your destination.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🧳</div>
              <h3>Smart packing list</h3>
              <p>Auto-generated checklists tailored to your destination, trip type, and who's travelling.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">💶</div>
              <h3>Budget tracker</h3>
              <p>Set a budget, log expenses by category, and see exactly where your money is going.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA (US-10.3) -->
      <section class="landing-cta">
        <div class="section-inner landing-cta-inner">
          <h2>Ready to plan your next adventure?</h2>
          <p class="landing-cta-sub">Join families planning better trips — for the whole crew, including the dog.</p>
          <a href="#auth/signup" class="btn btn--primary btn--lg">Sign up free</a>
        </div>
      </section>

      <footer class="landing-footer">
        <p>Planning a trip with family and pets &copy; ${new Date().getFullYear()}</p>
      </footer>

    </div>
  `

  // Handle CTA clicks via JS as well (progressive enhancement)
  el.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault()
      navigate(a.getAttribute('href')!.slice(1))
    })
  })
}
