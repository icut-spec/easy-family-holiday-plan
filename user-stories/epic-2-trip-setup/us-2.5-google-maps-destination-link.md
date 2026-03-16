# US-2.5 — Google Maps destination link

**As a user**, I want an auto-generated "Open in Google Maps" link based on my destination input, so that I can quickly visualize where I'm going.

## Acceptance criteria

- A clickable "Open in Google Maps" link appears once a destination is entered
- Link opens `https://www.google.com/maps/search/<destination>` in a new tab
- Link updates immediately when the destination changes
- Link is not shown if destination is empty
