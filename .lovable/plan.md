

# Real-Time Driver Tracking UI

## Current State
The existing DriverTracking page has a basic dot-based route visualization and a simple status card. It lacks a map-like feel, driver info, progress bar, stop-by-stop detail, and overall polish.

## Plan

### 1. Simulated Map Area (top section)
- Replace the flat dot row with a **curved SVG path** on a styled map-like background (using a subtle grid pattern or gradient to simulate a map)
- Animate a **bus icon along the path** that moves between stops
- Show pickup point markers along the path with the user's stop highlighted
- Add a pulsing "live" indicator badge in the corner

### 2. Driver Info Card
- Add a card below the map showing: driver name, vehicle plate number, vehicle type (e.g., "HI ACE"), and a small avatar placeholder
- Star rating display

### 3. Enhanced Progress Section
- Replace simple status text with a **vertical timeline/stepper** showing all stops from start to the user's pickup
- Each stop shows: name, time, and status (passed ✓, current with pulse animation, upcoming)
- A **progress bar** at the top showing percentage complete (driverPosition / pickupOrder)

### 4. Improved ETA Display
- Large countdown timer with minutes and seconds
- "Arriving in" label with the stop name
- When arrived: green celebration state with checkmark animation

### 5. Action Buttons
- "Contact Driver" with phone icon
- "Share Location" button
- "Cancel Ride" as a text link

### Files Modified
- `src/pages/DriverTracking.tsx` — full rewrite of the tracking UI with map simulation, driver info, vertical timeline, enhanced ETA, and action buttons

