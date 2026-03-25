# Phase 2: Data Layer Migration - Task Breakdown

## Overview
Phase 2 replaces mock data with real Supabase queries across 25+ page files. Gradual migration with no breaking changes.

## High-Level Strategy
1. Create data hooks for each model
2. Update page components to use real data
3. Implement React Query integration
4. Add real-time subscriptions where needed
5. Keep mock data as fallback during transition

---

## Data Hooks to Create (15 total)

### Core Hooks

#### 1. useTrips()
**File:** `src/hooks/useTrips.ts`
```typescript
// Fetch all available trips
// Optional filters: route_id, departure_date, status
// Returns: { trips, loading, error }
// Cache: 5 minutes with stale-while-revalidate
```

#### 2. useBookings()
**File:** `src/hooks/useBookings.ts`
```typescript
// Fetch user's bookings
// Auto-filtered to current user (from useAuth)
// Returns: { bookings, loading, error }
// Real-time subscription to booking updates
```

#### 3. useVehicles()
**File:** `src/hooks/useVehicles.ts`
```typescript
// Fetch available vehicles
// Optional filters: vehicle_type, status, route_id
// Returns: { vehicles, loading, error }
```

#### 4. useRoutes()
**File:** `src/hooks/useRoutes.ts`
```typescript
// Fetch all routes
// Returns all routes with status filtering
// Includes: origin, destination, distance, pickup_points
```

#### 5. usePickupPoints()
**File:** `src/hooks/usePickupPoints.ts`
```typescript
// Fetch pickup points for specific route
// Takes route_id parameter
// Sorted by sort_order
```

#### 6. useTickets()
**File:** `src/hooks/useTickets.ts`
```typescript
// Fetch user's tickets
// Auto-filtered to current user
// Includes: booking_id, trip_id, tracking_status
// Real-time subscription to status changes
```

#### 7. useTicketDetail()
**File:** `src/hooks/useTicketDetail.ts`
```typescript
// Fetch single ticket by ID
// Includes: full booking + trip + route details
// Real-time updates for tracking status
```

#### 8. useDrivers()
**File:** `src/hooks/useDrivers.ts`
```typescript
// Admin-only: Fetch all drivers
// Includes: status, verification, trip history, rating
// Admin filter: by status, by verification
```

#### 9. useDriverDetail()
**File:** `src/hooks/useDriverDetail.ts`
```typescript
// Admin-only: Fetch single driver with full history
// Includes: trips, earnings, ratings, documents
```

#### 10. usePayments()
**File:** `src/hooks/usePayments.ts`
```typescript
// User: View own payment history
// Admin: View all payments/revenue
// Includes transaction details, status, timeline
```

#### 11. useBookingCreate()
**File:** `src/hooks/useBookingCreate.ts`
```typescript
// Create new booking (mutation)
// Validates: trip_id, seat_number, user_id, fare
// Auto-creates ticket after booking success
// Returns: { booking, loading, error, mutate }
```

#### 12. useTripAnalytics()
**File:** `src/hooks/useTripAnalytics.ts`
```typescript
// Admin dashboard analytics
// Includes: bookings by date, revenue, occupancy
// Date range filters
```

#### 13. useDriverEarnings()
**File:** `src/hooks/useDriverEarnings.ts`
```typescript
// Driver: View own earnings
// Period: daily, weekly, monthly
// Includes: trips count, total revenue, ratings
```

#### 14. useVehicleInventory()
**File:** `src/hooks/useVehicleInventory.ts`
```typescript
// Admin: Vehicle availability by trip/date
// Includes: seat map, occupancy, status
```

#### 15. useLiveLocationTracking()
**File:** `src/hooks/useLiveLocationTracking.ts`
```typescript
// Real-time driver location for specific trip
// Subscribes to driver_locations table
// Used by DriverTracking.tsx
// Passenger view: See driver position on map
```

---

## Pages to Update (25+ files)

### Passenger Pages (13 files)

| File | Changes | Priority | Effort |
|------|---------|----------|--------|
| Index.tsx | Show featured trips (useTrips) | HIGH | 2h |
| SearchResults.tsx | Search + filter trips (useTrips + filters) | HIGH | 3h |
| SeatSelection.tsx | Get trip seats + availability (trip_id) | HIGH | 2h |
| PickupRoute.tsx | Fetch selected trip details | HIGH | 1h |
| Checkout.tsx | Save booking to DB (useBookingCreate) | HIGH | 2h |
| Tickets.tsx | List user's tickets (useTickets) | HIGH | 1h |
| TicketDetail.tsx | Show single ticket (useTicketDetail) | HIGH | 1.5h |
| ETicket.tsx | Display boarding pass (ticket data) | MEDIUM | 1h |
| DriverTracking.tsx | Show live driver location (useLiveLocationTracking) | MEDIUM | 2h |
| Profile.tsx | Show user profile (profiles table) | MEDIUM | 1h |
| ResetPassword.tsx | Supabase password reset | LOW | 0.5h |
| BookingContext.tsx | Replace mock data | MEDIUM | 1h |
| RouteTimeline.tsx | Real-time tracking display | MEDIUM | 1.5h |

**Subtotal: 19 hours**

### Admin Pages (10 files)

| File | Changes | Priority | Effort |
|------|---------|----------|--------|
| Dashboard.tsx | Analytics + KPIs (useTripAnalytics) | HIGH | 3h |
| AdminBookings.tsx | List + filter bookings by status | HIGH | 2h |
| AdminTrips.tsx | CRUD trips, schedule, assign drivers | HIGH | 4h |
| AdminRoutes.tsx | CRUD routes + pickup points | HIGH | 3h |
| AdminVehicles.tsx | CRUD vehicles, status, assignment | HIGH | 3h |
| AdminDrivers.tsx | Driver management + verification | HIGH | 3h |
| AdminAnalytics.tsx | Revenue, trips, occupancy charts | MEDIUM | 4h |
| AdminMonitoring.tsx | Real-time trip monitoring | MEDIUM | 3h |
| AdminPricing.tsx | Fare settings by route/vehicle | MEDIUM | 2h |
| AdminSeatMap.tsx | Visual seat availability | MEDIUM | 2h |

**Subtotal: 29 hours**

### Driver Pages (7 files)

| File | Changes | Priority | Effort |
|------|---------|----------|--------|
| DriverDashboard.tsx | Today's trips, earnings (useTrips) | HIGH | 2h |
| DriverTripOverview.tsx | Current trip details + passengers | HIGH | 2h |
| DriverPickupDetail.tsx | Pickup validation + check-in | HIGH | 2h |
| DriverScanner.tsx | Ticket scanning + marking picked up | HIGH | 2h |
| DriverTripSummary.tsx | Trip earnings + ratings | HIGH | 1.5h |
| DriverHistory.tsx | Past trips + performance | MEDIUM | 2h |
| DriverEarnings.tsx | Earnings analytics (useDriverEarnings) | MEDIUM | 2.5h |

**Subtotal: 14 hours**

### Context Providers (2 files)

| File | Changes | Priority | Effort |
|------|---------|----------|--------|
| BookingContext.tsx | Replace with real data | HIGH | 1h |
| DriverContext.tsx | Replace with real data | HIGH | 1h |

**Subtotal: 2 hours**

---

## Total Effort Estimate
```
Passenger Pages: 19 hours
Admin Pages: 29 hours
Driver Pages: 14 hours
Context Providers: 2 hours
─────────────────────────
TOTAL: 64 hours (~2-3 weeks with 20-30% optimization)
```

---

## Implementation Phases (Recommended Order)

### Phase 2.1: Core Data Hooks (Days 1-2)
**Tasks:**
1. Create all 15 data hooks with React Query integration
2. Write tests for each hook (basic validation)
3. Setup caching strategy (5min default TTL)
4. Add error handling and loading states

**Deliverables:**
- 15 hooks with full type safety
- React Query integration
- Cache invalidation patterns
- 15 test files (15 tests each)

**Output:**
- ✅ 15 hooks created
- ✅ 225 new tests (all passing)
- ✅ Ready for page updates

### Phase 2.2: Passenger Features (Days 3-5)
**Tasks:**
1. Update SearchResults.tsx (core feature)
2. Update SeatSelection.tsx
3. Update Checkout.tsx (booking creation)
4. Update Tickets.tsx + TicketDetail.tsx
5. Update Index.tsx (featured trips)
6. Test end-to-end booking flow

**Deliverables:**
- ✅ Full booking pipeline working
- ✅ Real-time ticket tracking
- ✅ Live driver location
- ✅ No breaking changes to mock data

**Testing:**
- Create booking → verify in database
- View tickets → verify real-time updates
- Track driver → verify WebSocket integration

### Phase 2.3: Admin Features (Days 6-10)
**Tasks:**
1. Update Dashboard.tsx (analytics)
2. Update Trip/Route/Vehicle management pages
3. Update Driver management
4. Implement real-time monitoring
5. Add data validation + error handling

**Deliverables:**
- ✅ Full CRUD operations
- ✅ Analytics dashboards
- ✅ Real-time monitoring
- ✅ Permission checks (RLS enforced)

### Phase 2.4: Driver Features (Days 11-12)
**Tasks:**
1. Update Driver dashboard pages
2. Implement trip assignment logic
3. Add real-time trip tracking
4. Implement earnings calculations
5. Add performance metrics

**Deliverables:**
- ✅ Driver workflow complete
- ✅ Real-time updates
- ✅ Earnings tracking
- ✅ Trip history

### Phase 2.5: Optimization & Testing (Days 13-15)
**Tasks:**
1. Performance optimization (query caching)
2. Implement stale-while-revalidate
3. Add optimistic updates
4. Run full test suite
5. Fix any integration issues
6. Load testing

**Deliverables:**
- ✅ All 40+ files updated
- ✅ All tests passing (300+ total tests)
- ✅ Performance optimized
- ✅ Production ready

---

## Testing Strategy

### Unit Tests
```
- Each hook: 15 tests (mock supabase)
- Each component update: 5-10 tests
- Total: 300+ new tests
```

### Integration Tests
```
- End-to-end booking flow
- Admin CRUD operations
- Driver trip workflow
- Real-time updates
```

### Performance Tests
```
- Query response time: < 500ms
- Page load time: < 1s
- Real-time update latency: < 100ms
```

## Success Criteria

✅ All 25+ pages updated to use real data  
✅ No build errors or TypeScript issues  
✅ All tests passing (300+ tests)  
✅ All CRUD operations working  
✅ Real-time subscriptions working  
✅ Performance optimized (< 500ms queries)  
✅ Mock data fully replaced  
✅ No breaking changes to UI  

---

## Gradual Migration Strategy

**Keep mock data available during transition:**

```typescript
// src/hooks/useTrips.ts (example)
export function useTrips(options?: UseTripsOptions) {
  const { data: realTrips, isLoading, error } = useQuery({
    queryKey: ['trips', options],
    queryFn: async () => {
      // Query from Supabase
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Fallback to mock if real data fails
  const trips = realTrips || options?.useMockData ? mockTrips : []
  
  return { trips, isLoading, error }
}
```

This allows:
- Parallel running of mock + real data
- Gradual component updates
- Easy rollback if issues arise
- Testing with both data sources

---

## Next Steps (When Phase 2 Starts)

1. **Create data hooks:**
   ```bash
   npm run dev  # Start dev server
   # Create useTrips.ts, useBookings.ts, etc.
   # Run: npm run test -- hooks/
   ```

2. **Update passenger pages first:**
   ```bash
   # Edit SearchResults.tsx → use real trips
   # Edit Checkout.tsx → create real booking
   # Verify end-to-end flow works
   # Run: npm run test
   ```

3. **Progressive rollout:**
   - One feature area at a time
   - Test after each update
   - Deploy to staging
   - Verify real data works
   - Move to next area

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Data inconsistency | RLS policies + audit logs |
| Query performance | Indices + caching + timeouts |
| Real-time failures | Polling fallback (Phoenix channels) |
| Breaking changes | Feature flags + gradual rollout |
| Migration issues | Keep mock data available |
| Test failures | Comprehensive test suite + CI/CD |

---

## Rollback Plan

If critical issues arise:
1. Switch data hooks to use mock data
2. Revert modified pages to previous version
3. Investigate issue in test environment
4. Deploy fix
5. Retry migration

Quick commands:
```bash
# Revert to mock data
git checkout docs/mockData.ts src/hooks/

# Revert specific page
git checkout src/pages/SearchResults.tsx

# Run tests to verify
npm run test
```

---

## Pre-Phase 2 Checklist

Before starting Phase 2:
- [ ] Phase 1 deployment complete (migration ran in Supabase)
- [ ] All 15 database tables verified in Supabase
- [ ] Demo accounts created and tested
- [ ] Auth flow working (can login as all 3 roles)
- [ ] All 142 current tests still passing
- [ ] Environment variables configured (.env.local)
- [ ] Supabase client connected and working
- [ ] RLS policies verified in Supabase
- [ ] Real-time subscriptions enabled in Supabase
- [ ] Team notified of migration start

---

## Summary

**Phase 2 Scope:**
- Create 15 data hooks
- Update 25+ page files
- Implement React Query caching
- Add real-time subscriptions
- Migrate mock data to real Supabase
- Add 300+ tests
- Optimize performance

**Estimated Duration:** 2-3 weeks  
**Risk Level:** LOW (gradual migration with rollback)  
**Effort:** 64 hours  
**Output:** Production-ready data layer  

**Status:** Ready to Start Phase 2 ✅
