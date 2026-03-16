# US-5.1 — Auto-generate packing list

**As a user**, I want the packing list to be automatically populated based on my holiday type, whether kids are coming, and whether pets are coming, so that I don't forget relevant items.

## Acceptance criteria

- Packing list is seeded automatically when a trip is created or updated
- Seed logic follows these rules:

| Condition | Items added |
|---|---|
| Always | Passports, first aid kit, phone charger, snacks |
| Kids present | Sunscreen, extra clothes, toys, kids' medicine |
| Pets present | Pet food, leash, pet carrier, vet records |
| Beach | Swimwear, towels, sunglasses, flip flops |
| Mountains | Warm jacket, hiking boots, thermos, map |
| City | Comfortable shoes, city map, day bag |
| Camping | Tent, sleeping bag, torch, insect repellent |

- Previously checked items are not unchecked when the list is re-seeded
- Duplicate items are not added if they already exist
