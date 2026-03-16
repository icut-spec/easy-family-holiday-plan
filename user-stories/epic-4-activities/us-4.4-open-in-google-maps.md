# US-4.4 — Open in Google Maps per activity

**As a user**, I want each activity card to have an "Open in Google Maps" link that searches for that activity near my destination, so that I can instantly see where it is on the map.

## Acceptance criteria

- Each activity card includes an "Open in Google Maps" link
- Link format: `https://www.google.com/maps/search/<activity+name>+<destination>`
- Link opens in a new browser tab
- Link is present for both API-fetched and fallback activities
