---
Task ID: 1-7
Agent: main
Task: Add districts/settlements to ПЛОЩАДКА app with cascading select, auto-detect, and DB updates

Work Log:
- Added `district` field to Playground model in Prisma schema
- Ran db:push to sync schema changes
- Updated seed route with district information for all 16 playgrounds
- Updated API routes: GET /api/playgrounds now supports `district` filter param, POST now accepts `district`
- Replaced flat CITIES array with structured DISTRICTS data (7 districts, ~130 settlements with lat/lng)
- Added helper functions: sortSettlements(), getAllSettlements(), findNearestSettlement(), getDistrictForSettlement()
- Added formDistrict state and cascading district→settlement select in Add form
- Updated MapPicker with onLocationSelect callback for auto-detecting nearest settlement
- Shows "Определено: [city] ([district] район)" badge when auto-detect triggers
- Updated filter dropdowns in Home and Registry tabs with district→settlement cascading filters
- Added filterDistrict state and district query param to fetchApproved
- Added type import for leaflet (type L from "leaflet") to fix TypeScript issues
- Hydration mismatch already addressed with suppressHydrationWarning on html and body
- Lint passes cleanly, DB seeded with 16 records including district field

Stage Summary:
- All 7 districts of Transnistria with settlements and coordinates added
- Cascading select works: district first, then settlement (city first, then alphabetical)
- Auto-detect nearest settlement when clicking on map in Add form
- District filtering works in API and frontend
- All existing features preserved (map, registry, admin, detail modal)
