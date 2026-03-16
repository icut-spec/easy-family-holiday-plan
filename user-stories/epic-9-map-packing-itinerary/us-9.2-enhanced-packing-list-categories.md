# US-9.2 — Enhanced packing list categories

**As a user**, I want the packing list to include Family and Pets categories with relevant default items, so that I don't forget essentials for everyone.

## Acceptance criteria

- **Family** category is always present and includes: Clothes, Family passports/ID, Phone chargers (all devices)
- **Pets** category includes: Pet food, Leash, Pet carrier, Vet records, Pet toys
- All existing category logic (Kids, Beach, Mountains, etc.) is preserved
- New seed items are merged into the list without removing previously added or checked items
- No duplicate items are added on re-seed
- Category order follows the defined `CATEGORY_ORDER` constant
