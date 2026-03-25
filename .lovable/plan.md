# Shuttle Booking App — Implementation Plan

## Overview

A mobile-first shuttle booking app with a Traveloka-inspired clean UI, featuring multi-pickup point selection (J1–J17), interactive seat selection, and driver tracking. Blue primary / green secondary color scheme.

## Screens & Flow

### 1. Home Screen

- Hero section with shuttle illustration/icon
- Pickup point dropdown (J1–J17 with labels like "J1 - Terminal Utama")
- Destination selector
- Date picker
- "Search Tickets" CTA button
- Bottom navigation bar (Home, My Tickets, Track, Profile)

### 2. Search Results

- Filter/sort bar (time, price)
- Trip cards showing: departure time, estimated pickup time at selected point, price, remaining seats with urgency badge ("Only 2 left!")
- Skeleton loading states

### 3. Seat Selection (Core Feature)

- Interactive bus seat grid layout (4 columns: 2-aisle-2)
- Color-coded seats: available (white/light), selected (blue), booked (gray)
- Legend bar
- Tap animation on selection
- Bottom summary bar with seat number + price + "Continue" CTA

### 4. Pickup Route Visualization

- Horizontal/vertical stepper showing J1 → J2 → ... → Destination
- Selected pickup point highlighted in blue
- Estimated pickup time displayed prominently
- Simple timeline/route view

### 5. Checkout

- Booking summary card (pickup, seat, time, price)
- Payment method selector (e-wallet, bank transfer, QR)
- "Pay Now" CTA

### 6. E-Ticket

- QR code display
- Trip details card (route, seat, pickup point, time)
- "Paid" status badge
- Share/download options

### 7. Driver Tracking

- Simulated map view with driver marker
- ETA display
- Status text ("Driver is approaching J5")
- "Contact Driver" button

## Technical Approach

- All screens as React pages with React Router
- Mock data for routes, trips, seats, bookings
- Shared state via React Context for booking flow
- Tailwind for mobile-first responsive design
- Lucide icons throughout
- Framer Motion-style animations via Tailwind for micro-interactions
- Custom color scheme (blue primary, green secondary)

## Data Models (Mock)

- **Routes**: id, name (Rayon A–D), pickup points array
- **Pickup Points**: id (J1–J17), label, order, time offset
- **Trips**: id, route, departure time, price, seats
- **Seats**: id, number, status (available/booked/selected)
- **Bookings**: id, trip, seat, pickup point, payment status