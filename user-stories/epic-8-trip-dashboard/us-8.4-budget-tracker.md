# US-8.4 — Budget tracker

**As a user**, I want to set a total budget for the trip and track expenses per category, so that I can stay within my spending limit.

## Acceptance criteria

- Total budget field is editable directly on the Budget tab (pre-filled from trip creation if set)
- Expense categories: Accommodation, Transport, Food, Activities, Other
- User can add expense line items with a description and amount
- Running total is displayed vs the budget limit
- A visual indicator (e.g. red highlight or warning message) appears when total expenses exceed the budget
- All budget data is persisted to state and synced to Supabase if logged in
