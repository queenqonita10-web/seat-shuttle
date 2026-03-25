# 🚀 Phase 2.2 Execution Plan
**Admin Dashboard Development + Auth Refinements**

**Project**: PYU-GO Seat-Shuttle  
**Duration**: 2-3 weeks (15-20 hours dev + 3-4 hours auth fixes)  
**Target**: Staging deployment end of phase  
**Status**: PLANNING → EXECUTION

---

## 📊 Phase Overview

### Scope
- **Admin Dashboard**: 10 new pages + 12 data hooks
- **Auth Refinements**: Fix 3 critical issues from Phase 2.1 review
- **Backend**: New admin RLS policies + data endpoints
- **Testing**: 30+ new tests for admin features

### Success Criteria
- ✅ All 10 admin pages functional with real data
- ✅ Authentication issues R1-R3 resolved + tested
- ✅ 150+ tests passing (current 142 + 30 new)
- ✅ Build successful, zero errors
- ✅ Staging deployment ready

### High-Level Timeline
```
Week 1: Auth fixes + Backend setup
  └─ R1: useAuth race condition fix (2 hrs)
  └─ R2: Session validation (2 hrs)
  └─ R3: Email verification setup (2 hrs)
  └─ Admin RLS policies (4 hrs)
  └─ Admin data hooks (6 hrs)

Week 2: Admin UI Implementation
  └─ Admin Dashboard page (3 hrs)
  └─ Admin CRUD pages (8 hrs)
  └─ Testing & integration (4 hrs)

Week 3: Refinement & Deployment
  └─ Bug fixes & polish (3 hrs)
  └─ Load testing (2 hrs)
  └─ Staging deployment (1 hr)
```

---

## 🔧 Part 1: Auth Refinements (Hours 1-6)

### Refinement #1: Fix useAuth Race Condition (R1)
**File**: [src/hooks/useAuth.tsx](src/hooks/useAuth.tsx)  
**Time**: 2 hours (1.5 dev + 0.5 test)

#### Current Problem
```typescript
// ❌ Unreliable setTimeout hack
if (session?.user) {
  setTimeout(async () => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .maybeSingle();
    setRole((data?.role as AppRole) ?? null);
    setLoading(false);
  }, 0);
}
```

#### Implementation
```typescript
// ✅ Proper async handling with error management
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        try {
          const { data, error } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id)
            .single();
          
          if (error) {
            console.error("Failed to fetch role:", error);
            setRole(null);
          } else {
            setRole((data.role as AppRole) ?? null);
          }
        } catch (err) {
          console.error("Unexpected role fetch error:", err);
          setRole(null);
        }
      } else {
        setRole(null);
      }
      
      setLoading(false);
    }
  );

  // Check existing session AFTER setting up listener
  supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
    if (existingSession?.user) {
      // Role will be fetched by the listener
      setSession(existingSession);
      setUser(existingSession.user);
    } else {
      setSession(null);
      setUser(null);
      setLoading(false);
    }
  });

  return () => subscription.unsubscribe();
}, []);
```

#### Testing
```typescript
// Add to src/test/auth.test.ts
describe("useAuth - Role Fetch Recovery", () => {
  it("should handle failed role fetch gracefully", async () => {
    // Mock role query to fail
    (supabase.from as any).mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ 
            data: null, 
            error: { message: "Not found" } 
          })
        })
      })
    });

    // User should be logged in but with no role
    // ProtectedRoute should redirect to /
  });

  it("should set loading=false in all code paths", () => {
    // Test: no session → loading false
    // Test: session + role fetch success → loading false
    // Test: session + role fetch fail → loading false
  });
});
```

**Acceptance Criteria**:
- [x] No setTimeout
- [x] Error handling for failed role fetch
- [x] Loading state set in all paths
- [x] Tests pass (0 race condition failures)

---

### Refinement #2: Add Session Validation (R2)
**File**: Create [src/hooks/useSessionValidation.ts](src/hooks/useSessionValidation.ts)  
**Time**: 2 hours (1.5 dev + 0.5 test)

#### Implementation
```typescript
// src/hooks/useSessionValidation.ts
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export function useSessionValidation() {
  const { user, session } = useAuth();
  const warningShownRef = useRef(false);

  useEffect(() => {
    if (!session) return;

    // Check session every 5 minutes
    const validationInterval = setInterval(async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error || !data.session) {
        // Session invalid - user needs to re-login
        console.warn("Session expired or invalid");
        toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
        window.location.href = "/auth";
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Check again when tab receives focus (user might have idle for a while)
    const handleFocus = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        toast.error("Sesi Anda telah berakhir.");
        window.location.href = "/auth";
      }
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(validationInterval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [session]);
}
```

#### Integration in App.tsx
```typescript
import { useSessionValidation } from "@/hooks/useSessionValidation";

function App() {
  useSessionValidation(); // Added at app root
  
  return (
    // ... existing routes
  );
}
```

#### Testing
```typescript
describe("useSessionValidation", () => {
  it("should validate session periodically", () => {
    jest.useFakeTimers();
    // Mock session validation
    // Advance time 5 minutes
    // Verify session check called
  });

  it("should redirect to login on expired session", () => {
    // Mock getSession to return error
    // Verify window.location.href === "/auth"
    // Verify toast error shown
  });
});
```

**Acceptance Criteria**:
- [x] Session validated every 5 minutes
- [x] Re-validation on tab focus
- [x] User redirected on expired session
- [x] Error toast shown before redirect
- [x] Tests verify redirect behavior

---

### Refinement #3: Enable Email Verification (R3)
**Files**: [src/pages/Auth.tsx](src/pages/Auth.tsx), create [src/pages/EmailVerification.tsx](src/pages/EmailVerification.tsx)  
**Time**: 2 hours (1.5 dev + 0.5 test)

#### Supabase Configuration (Admin Panel)
1. Go to Authentication → Providers → Email
2. Enable "Confirm email"
3. Set email verification link to: `https://your-domain.com/verify-email?token={token}&type=email_change`

#### Update Auth.tsx
```typescript
const [showVerificationMessage, setShowVerificationMessage] = useState(false);

const handleRegister = async (e: React.FormEvent) => {
  // ... existing validation and signup

  // Show verification message
  setShowVerificationMessage(true);
  
  toast.success("Silakan cek email Anda untuk verifikasi akun");
  
  // Clear form
  setRegisterEmail("");
  setRegisterPassword("");
};

// In JSX:
{showVerificationMessage && (
  <Alert>
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>
      Email verifikasi telah dikirim. Silakan cek inbox Anda dan klik link untuk mengaktifkan akun.
    </AlertDescription>
  </Alert>
)}
```

#### Create Email Verification Page
```typescript
// src/pages/EmailVerification.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Check, AlertCircle } from "lucide-react";

export default function EmailVerification() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const hash = window.location.hash;
        
        if (!hash.includes("type=email_change")) {
          setStatus("error");
          setMessage("Link verifikasi tidak valid");
          return;
        }

        // Supabase automatically processes URL fragments
        // Wait a moment for Supabase to process
        await new Promise(resolve => setTimeout(resolve, 1000));

        const { data, error } = await supabase.auth.getSession();
        
        if (error || !data.session) {
          setStatus("error");
          setMessage("Email verifikasi gagal. Silakan coba lagi.");
          return;
        }

        setStatus("success");
        setMessage("Email berhasil diverifikasi!");
        toast.success("Email berhasil diverifikasi!");

        // Redirect to home after 2 seconds
        setTimeout(() => navigate("/"), 2000);
      } catch (err) {
        setStatus("error");
        setMessage("Terjadi kesalahan. Silakan coba lagi.");
      }
    };

    verifyEmail();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center space-y-4">
          {status === "loading" && (
            <>
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground">Memverifikasi email...</p>
            </>
          )}
          
          {status === "success" && (
            <>
              <Check className="h-8 w-8 mx-auto text-green-600" />
              <p className="font-semibold">{message}</p>
              <p className="text-xs text-muted-foreground">Mengalihkan ke beranda...</p>
            </>
          )}
          
          {status === "error" && (
            <>
              <AlertCircle className="h-8 w-8 mx-auto text-red-600" />
              <p className="font-semibold">{message}</p>
              <button
                onClick={() => navigate("/auth")}
                className="text-xs text-primary hover:underline"
              >
                Kembali ke login
              </button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

#### Update Routing (in main routing file)
```typescript
import EmailVerification from "@/pages/EmailVerification";

// Add route:
<Route path="/verify-email" element={<EmailVerification />} />
```

**Acceptance Criteria**:
- [x] Supabase email verification enabled
- [x] Verification link sent on signup
- [x] Verification page created and working
- [x] User redirected after verification
- [x] Tests verify verification flow

---

## 🛠️ Part 2: Admin Backend Setup (Hours 7-16)

### Admin RLS Policies
**File**: Create [supabase/migrations/20260327000000_admin_tables_rls.sql](supabase/migrations/20260327000000_admin_tables_rls.sql)

```sql
-- Admin-specific access policies

-- 1. Admin Dashboard: View trip statistics
CREATE POLICY "Admins can view all trips" ON public.trips
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all bookings" ON public.bookings
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all routes" ON public.routes
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- 2. Admin CRUD: Trips
CREATE POLICY "Admins can create trips" ON public.trips
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update trips" ON public.trips
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete trips" ON public.trips
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- 3. Admin CRUD: Routes
CREATE POLICY "Admins can manage routes" ON public.routes
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 4. Admin CRUD: Vehicles
CREATE POLICY "Admins can manage vehicles" ON public.vehicles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage drivers" ON public.drivers
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Similar patterns for: payments, users, seat_layouts, vehicle_types

-- 5. Audit logging endpoint (view only)
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
```

---

### Admin Data Hooks
**Location**: [src/hooks/admin/](src/hooks/admin/)

#### Hook 1: useAdminDashboard.ts
```typescript
// Fetch dashboard statistics
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_admin_dashboard_stats");
      if (error) throw error;
      return data;
    },
  });
}
```

#### Hook 2: useAdminTrips.ts
```typescript
// CRUD operations for trips
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAdminTrips() {
  return useQuery({
    queryKey: ["admin-trips"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trips")
        .select("*, routes(name), vehicles(name), drivers(name)");
      if (error) throw error;
      return data;
    },
  });
}

export function useAdminTripCreate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (trip: any) => {
      const { data, error } = await supabase
        .from("trips")
        .insert([trip])
        .select();
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-trips"] });
    },
  });
}

// Similar: useAdminTripUpdate, useAdminTripDelete
```

#### Hook 3: useAdminRoutes.ts
```typescript
// Similar pattern for routes CRUD
```

#### Other Admin Hooks (9 more)
- useAdminBookings
- useAdminVehicles
- useAdminDrivers
- useAdminPayments
- useAdminUsers
- useAdminSeatLayouts
- useAdminAnalytics
- useAdminMonitoring
- useAdminPricing

**Total**: 12 admin data hooks

---

## 🎨 Part 3: Admin UI Pages (Hours 17-28)

### Page Structure
```
src/pages/admin/
├─ Dashboard.tsx          (3 hours)
├─ Bookings.tsx          (1.5 hours)
├─ Trips.tsx             (2 hours)
├─ Routes.tsx            (2 hours)
├─ Vehicles.tsx          (1.5 hours)
├─ Drivers.tsx           (1.5 hours)
├─ Analytics.tsx         (1.5 hours)
├─ Monitoring.tsx        (1.5 hours)
├─ Pricing.tsx           (1 hour)
└─ SeatMap.tsx           (1 hour)
```

### Page 1: Dashboard (3 hours)
**File**: [src/pages/admin/Dashboard.tsx](src/pages/admin/Dashboard.tsx)

```typescript
import { useAdminDashboard } from "@/hooks/admin/useAdminDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const { data: stats, isLoading, error } = useAdminDashboard();

  if (isLoading) return <Loader2 className="animate-spin" />;
  if (error) return <div>Error loading dashboard</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Trips</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.activeTrips || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              Rp {(stats?.totalRevenue || 0).toLocaleString("id-ID")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.activeDrivers || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.monthlyUsers || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts, recent activity, etc. */}
    </div>
  );
}
```

### Page 2: Trips Management (2 hours)
**File**: [src/pages/admin/Trips.tsx](src/pages/admin/Trips.tsx)

```typescript
// CRUD interface for trips
// - Table with trip list, filters
// - Create/Edit modal
// - Delete confirmation
// - Real-time updates
```

### Pages 3-10: Similar Structure
Each page follows pattern:
1. Load data with hook
2. Display in table/cards
3. Modal for create/edit
4. Delete confirmation
5. Error handling
6. Loading states

---

## 🧪 Part 4: Testing & Validation (Hours 29-32)

### Admin Feature Tests (40+ tests)
**Location**: [src/test/admin.test.ts](src/test/admin.test.ts)

```typescript
describe("Admin Dashboard", () => {
  // Fetch and display tests
  it("should display active trips count", () => {});
  it("should display revenue statistics", () => {});
  
  // CRUD tests
  it("should create new trip", () => {});
  it("should update trip details", () => {});
  it("should delete trip", () => {});
  
  // Authorization tests
  it("should prevent non-admin access", () => {});
  
  // Edge cases
  it("should handle empty data", () => {});
  it("should handle API errors", () => {});
});
```

### Integration Tests
```typescript
// Full flow: login as admin → create trip → verify in list → update → delete
```

**Target**: 180+ tests passing (current 142 + 40 new - 2 modified)

---

## 📈 Implementation Checkpoints

### Checkpoint 1: Auth Refinements Complete ✅
**When**: Day 1 (after 6 hours)
```
- [ ] R1: useAuth race condition fixed
- [ ] R2: Session validation implemented
- [ ] R3: Email verification setup
- [ ] All auth tests passing
- [ ] Build successful
- [ ] No regressions to existing pages
```

### Checkpoint 2: Admin Backend Ready ✅
**When**: Day 3 (after 16 hours)
```
- [ ] Admin RLS policies deployed
- [ ] 12 admin hooks created
- [ ] TypeScript interfaces defined
- [ ] Database queries tested in Supabase console
- [ ] No permission errors
```

### Checkpoint 3: Admin UI Complete ✅
**When**: Day 7 (after 28 hours)
```
- [ ] All 10 admin pages implemented
- [ ] CRUD operations working
- [ ] Real-time updates functional
- [ ] Error handling in place
- [ ] Responsive design verified
```

### Checkpoint 4: Testing & Deployment ✅
**When**: Day 9 (after 32 hours)
```
- [ ] 180+ tests passing
- [ ] Build production-ready
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Ready for staging deployment
```

---

## 🚢 Deployment Strategy

### Pre-Deployment Checklist
- [ ] All 180+ tests passing
- [ ] Build succeeds without warnings
- [ ] Admin pages protected with RLS
- [ ] Auth refinements working
- [ ] No console errors in dev tools
- [ ] Mobile responsiveness verified
- [ ] Sample data loaded for demo

### Staging Deployment
```bash
# 1. Create staging database snapshot
# 2. Deploy migrations to staging
# 3. Deploy updated code to staging
# 4. Run smoke tests
# 5. Admin team validates workflows
# 6. Performance monitoring enabled
```

### Rollback Plan
- Keep Phase 2.1 branch available
- If critical issues: revert admin routes, keep auth fixes
- Monitor error logs 24 hours post-deployment

---

## 📋 Detailed Task Breakdown

### Task List for Implementation
```
PHASE 2.2 EXECUTION TASKS:

🔧 AUTH REFINEMENTS (6 hrs)
  ├─ [ ] Fix useAuth race condition (2 hrs)
  ├─ [ ] Add session validation hook (2 hrs)
  └─ [ ] Setup email verification (2 hrs)

🛠️ ADMIN BACKEND (10 hrs)
  ├─ [ ] Create RLS migration (1 hr)
  ├─ [ ] useAdminDashboard hook (1 hr)
  ├─ [ ] useAdminTrips hook (1 hr)
  ├─ [ ] useAdminRoutes hook (1 hr)
  ├─ [ ] useAdminBookings hook (0.5 hrs)
  ├─ [ ] useAdminVehicles hook (0.5 hrs)
  ├─ [ ] useAdminDrivers hook (0.5 hrs)
  ├─ [ ] useAdminPayments hook (0.5 hrs)
  ├─ [ ] useAdminAnalytics hook (1 hr)
  ├─ [ ] useAdminMonitoring hook (1 hr)
  └─ [ ] useAdminPricing hook (1 hr)

🎨 ADMIN UI (12 hrs)
  ├─ [ ] Dashboard page (3 hrs)
  ├─ [ ] Trips CRUD page (2 hrs)
  ├─ [ ] Routes CRUD page (2 hrs)
  ├─ [ ] Bookings view page (1.5 hrs)
  ├─ [ ] Vehicles CRUD page (1.5 hrs)
  ├─ [ ] Drivers CRUD page (1 hr)
  ├─ [ ] Analytics/Reports (1 hr)
  └─ [ ] Other pages (0.5 hrs)

🧪 TESTING (4 hrs)
  ├─ [ ] Admin CRUD tests (2 hrs)
  ├─ [ ] Authorization tests (1 hr)
  └─ [ ] Integration tests (1 hr)

📊 REFINEMENT & REVIEW (2 hrs)
  ├─ [ ] Code review & quality gates (1 hr)
  ├─ [ ] Bug fixes & polish (0.5 hrs)
  └─ [ ] Documentation (0.5 hrs)
```

---

## 🎯 Success Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Tests Passing | 180+ | TBD |
| Build Success | Zero errors | TBD |
| Admin Functions | 10/10 pages | TBD |
| Auth Fixes | 3/3 complete | TBD |
| Code Coverage | 80%+ | TBD |
| Performance | < 2s load time | TBD |
| Deploy Readiness | ✅ Ready | TBD |

---

## 📞 Decision Points & Blockers

### Question 1: Admin Email Notifications
**Should admin get email when:**
- New booking created?
- Driver goes offline?
- Payment fails?

**Decision**: [ ] Yes (requires email service) [ ] No (in-app only)

### Question 2: Analytics Depth
**Should dashboard show:**
- Basic stats (trips, revenue, drivers)?
- Advanced charts (trends, peak hours)?
- Real-time metrics (live trips, active users)?

**Decision**: [ ] Basic only [ ] With charts [ ] Full realtime

### Question 3: Mobile Admin
**Should admin pages work on mobile?**
- Yes: (ensure responsive design)
- No: (desktop-only dashboard)

**Decision**: [ ] Mobile-first [ ] Desktop-first [ ] Responsive required

---

## 🔄 Iteration & Feedback

### Weekly Sync Points
- **Day 1 End**: Auth refinements complete, backend started
- **Day 4 End**: Admin backend done, UI work started
- **Day 8 End**: Admin UI complete, testing underway
- **Day 10 End**: All tests passing, ready for staging

### Beta Testing
- Internal: Admin team tests all workflows
- Staging: 48-hour validation before production

---

## 📝 Success Criteria Summary

✅ **Phase 2.2 is complete when:**
1. All 10 admin pages implemented and functional
2. 3 auth refinements (R1-R3) deployed and tested
3. 180+ tests passing (100% pass rate)
4. Build successful with zero errors
5. Staging deployment verified
6. Admin team sign-off on functionality
7. Documentation complete

---

**Next Step**: Start with Auth Refinement #1 (useAuth race condition fix)  
**Ready to proceed?** → Confirm or adjust scope

---

**Document Version**: 1.0  
**Created**: March 26, 2026  
**Status**: READY FOR EXECUTION  
**Estimated Completion**: April 7, 2026 (2-3 weeks)
