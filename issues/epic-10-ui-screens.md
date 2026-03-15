# Epic 10: UI Screens & Design

> A clean, consistent UI across all app screens. Every screen has a clear purpose, a defined layout, and a good first impression.

---

## US-10.1 — Landing Page: Hero section

**As a visitor**, I want to see a compelling hero section on the landing page, so that I immediately understand what the app does and feel motivated to sign up.

**Acceptance criteria:**
- Full-width hero section at the top of the landing page
- Headline: "Travel planning for families and pets."
- Subheadline: short value proposition (e.g. "Plan itineraries, packing lists and pet-friendly activities — all in one place.")
- Primary CTA button: "Get started free" → links to sign-up page
- Hero background: illustration or subtle pattern; looks good on mobile and desktop

**GitHub Issue:** #41

---

## US-10.2 — Landing Page: App explanation & features section

**As a visitor**, I want to see a clear explanation of what the app does and its key features, so that I can decide if it's right for my family.

**Acceptance criteria:**
- "How it works" section: 3-step explainer (Create a trip → Add your family & pets → Plan everything)
- Features section: at least 4 feature cards with icon, title, short description:
  - Day-by-day itinerary
  - Pet-friendly map
  - Smart packing list
  - Budget tracker
- Section is responsive: 2-column grid on desktop, 1 column on mobile

**GitHub Issue:** #42

---

## US-10.3 — Landing Page: Sign-up CTA section

**As a visitor**, I want a clear sign-up prompt at the bottom of the landing page, so that I can create an account without scrolling back to the top.

**Acceptance criteria:**
- Dedicated CTA section near the footer with headline and "Sign up free" button
- Links to the sign-up page
- Optionally shows a social proof line (e.g. "Join hundreds of families planning better trips")

**GitHub Issue:** #43

---

## US-10.4 — Sign-up / Login Page UI

**As a new or returning user**, I want a clean, simple authentication page, so that signing up or logging in feels fast and trustworthy.

**Acceptance criteria:**
- Tabbed or toggled layout: "Sign up" / "Log in" on the same page
- Sign-up fields: name, email, password
- Login fields: email, password
- "Continue with Google" button (OAuth)
- Inline validation errors (e.g. "Email already in use", "Password too short")
- Link back to the landing page
- Responsive: works well on mobile

**GitHub Issue:** #44

---

## US-10.5 — Dashboard: My Trips screen

**As a logged-in user**, I want a dashboard that shows all my trips at a glance, so that I can quickly navigate to the one I'm planning.

**Acceptance criteria:**
- Page heading: "My Trips"
- Each trip shown as a card: trip name, destination, date range, traveller summary (e.g. "2 adults · 1 child · 1 dog")
- "➕ Create Trip" button, prominent at the top
- Empty state: "No trips yet. Start planning your first trip!"
- Cards are clickable and navigate to the Trip Overview page

**GitHub Issue:** #45

---

## US-10.6 — Trip Overview Page

**As a user**, I want a Trip Overview page that shows a summary of my trip and provides navigation to all planning sections, so that I have one central hub for the trip.

**Acceptance criteria:**
- Trip name and destination shown prominently as the page heading
- Key details visible: dates, duration, traveller count, budget
- Navigation tabs or sidebar: Overview · Itinerary · Map · Packing List · Budget
- Overview tab shows a summary card for each section (e.g. "3 itinerary days · 24 packing items · €700 budget")
- Back link to "My Trips" dashboard

**GitHub Issue:** #46

---

## US-10.7 — Itinerary Page UI

**As a user**, I want a clean day-by-day itinerary page, so that I can see the whole trip plan at a glance and easily add or edit activities.

**Acceptance criteria:**
- Each day shown as a labelled section (e.g. "Day 1 — Mon 12 Jul")
- Activities listed in time order: time + title (e.g. "10:00 Park Walk", "12:30 Lunch", "16:00 Museum")
- Per-activity actions: ✏ edit, ❌ delete
- "➕ Add activity" button per day
- Empty day shows a prompt: "No activities yet. Add your first one."

**GitHub Issue:** #47

---

## US-10.8 — Map Page UI

**As a user**, I want a full-screen map page centred on my destination, so that I can visually explore pet-friendly places and saved activities.

**Acceptance criteria:**
- Full-width embedded Google Map centred on `trip.destination`
- Coloured pins: parks (green), pet-friendly restaurants (orange), veterinarians (red), saved activities (blue)
- Sidebar or bottom sheet listing the places shown on the map
- Clicking a pin shows a popup with name, category, address, and "Get Directions" link
- Map is responsive; on mobile the sidebar becomes a collapsible bottom sheet

**GitHub Issue:** #48

---

## US-10.9 — Packing List Page UI

**As a user**, I want a well-organised packing list page with clear category sections, so that packing is fast and stress-free.

**Acceptance criteria:**
- Sections: Family (Clothes, Passport, Chargers), Pet (Dog food, Leash, Toys), plus existing categories (Documents, Essentials, Kids, Activities)
- Each item has a checkbox, label, and remove button
- Checked items move to the bottom of their section or show with a strikethrough
- "➕ Add item" form at the bottom
- Progress bar at the top: "12 / 24 packed"

**GitHub Issue:** #49

---

## US-10.10 — Budget Page UI

**As a user**, I want a simple, readable budget page that shows my spending by category and a running total, so that I can stay on track financially.

**Acceptance criteria:**
- Expense rows: category label + amount (e.g. "Hotel · €400", "Food · €200", "Activities · €100")
- Running total at the bottom: "Total · €700"
- Visual indicator if total exceeds the trip budget (e.g. red highlight)
- "➕ Add expense" form: category (select), description, amount
- Category options: Hotel, Food, Transport, Activities, Other

**GitHub Issue:** #50
