---
Task ID: 3
Agent: main
Task: Replace detail modal with full-page playground detail view

Work Log:
- Created `/home/z/my-project/src/components/PlaygroundDetail.tsx` — full-page detail component with:
  - Hero Gallery Bento (12-col grid: main photo 8 cols + side photos 4 cols)
  - Primary Info Section (district label, star rating, name, description, like/share buttons)
  - Bento Details Grid (7+5 cols): description/equipment left, map/status/info right
  - Reviews Section (mock data placeholder)
  - Mini Leaflet map (non-interactive) with "Открыть карту" button
  - Sticky back button bar that hides the main nav when active
- Updated `src/app/page.tsx`:
  - Added "detail" to ViewTab type
  - Added `previousTab` state for back navigation
  - Replaced modal with full-page PlaygroundDetail component rendered inside `<main>`
  - Nav bar hides (translate-y-full) when on detail page
  - Footer and FAB hidden when on detail page
  - All playground click handlers now set previousTab and navigate to detail
  - Fixed duplicate import in PlaygroundDetail.tsx (Fence as Railing)
- Lint passes with zero errors

Stage Summary:
- Detail view is now a full page instead of a modal
- Apple-style bento layout with photo gallery, equipment icons, map, status card
- Smooth transitions: nav hides, back button returns to previous tab
- Reviews section placeholder with mock data
