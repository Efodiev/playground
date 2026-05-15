---
Task ID: 1
Agent: main
Task: Debug and fix white screen issue

Work Log:
- Investigated white screen problem - found dev server was crashing/not running
- Found useEffect dependency bug: seedDatabase callback had [fetchApproved, fetchPending, fetchStats] dependencies which changed on every filter change, causing infinite re-renders
- Fixed seedDatabase to have [] dependencies (run once on mount)
- Fixed cross-origin request warning by updating allowedDevOrigins in next.config.ts
- Created reliable server spawn script (spawn-server.sh) that keeps server alive
- Verified all API endpoints return correct data
- Verified page loads with 46567 bytes of HTML content

Stage Summary:
- Root cause: Server was crashing due to (1) useEffect dependency loop causing excessive API calls and memory usage, (2) server process not surviving shell termination
- Fixed: seedDatabase useCallback deps changed from [fetchApproved, fetchPending, fetchStats] to []
- Fixed: allowedDevOrigins updated with correct format
- Server now runs stably using spawn-server.sh with auto-restart loop
- All 14 approved + 2 pending playgrounds load correctly
