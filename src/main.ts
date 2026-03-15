import { loadState } from './store'
import { mount as mountTrip } from './components/TripSetup'
import { mount as mountFamily } from './components/FamilySetup'
import { mount as mountActivities } from './components/ActivitiesList'
import { mount as mountPacking } from './components/PackingList'

// Boot: load persisted state
loadState()

// Mount all components into their sections
const tripEl = document.getElementById('tab-trip') as HTMLElement
const familyEl = document.getElementById('tab-family') as HTMLElement
const activitiesEl = document.getElementById('tab-activities') as HTMLElement
const packingEl = document.getElementById('tab-packing') as HTMLElement

mountTrip(tripEl)
mountFamily(familyEl)
mountActivities(activitiesEl)
mountPacking(packingEl)

// Tab navigation
const tabBtns = document.querySelectorAll<HTMLButtonElement>('.tab-btn')
const tabSections = document.querySelectorAll<HTMLElement>('.tab-section')

tabBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab

    // Update active tab button
    tabBtns.forEach((b) => b.classList.remove('active'))
    btn.classList.add('active')

    // Show target section, hide others
    tabSections.forEach((section) => {
      if (section.id === `tab-${target}`) {
        section.classList.remove('hidden')
      } else {
        section.classList.add('hidden')
      }
    })
  })
})
