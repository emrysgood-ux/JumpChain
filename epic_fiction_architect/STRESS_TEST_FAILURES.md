# Epic Fiction Architect - Stress Test Failures Report

## Executive Summary

Comprehensive stress testing of the Epic Fiction Architect codebase revealed **23 bugs, missing features, and edge case failures**. This document catalogs each issue with severity, impact, and recommended fixes.

---

## Critical Issues (Must Fix)

### 1. 🔴 Negative Ages Returned
**File:** `src/engines/timeline/age.ts:56`
**Issue:** Characters born after the target date return negative chronological ages instead of null or error.
```typescript
// Current behavior
calculateAge("born 2000", atDate: 1990) → { chronologicalAge: -10 }

// Expected behavior
calculateAge("born 2000", atDate: 1990) → null // or throw Error
```
**Impact:** Breaks any UI displaying ages, could corrupt reports.
**Fix:**
```typescript
if (chronologicalAge < 0) {
  return null; // Character not born yet
}
```

---

### 2. 🔴 Orphaned Scenes After Container Deletion
**File:** `src/db/schema.sql` (foreign key constraints)
**Issue:** Deleting a container does NOT cascade delete its scenes.
```sql
-- Current: Scenes reference container_id without ON DELETE CASCADE
-- Scenes become orphaned with invalid container_id
```
**Impact:** Database integrity violation, orphaned data accumulates.
**Fix:**
```sql
FOREIGN KEY (container_id) REFERENCES containers(id) ON DELETE CASCADE
```

---

### 3. 🔴 No Circular Causality Detection
**File:** `src/db/database.ts` (event causality)
**Issue:** Events can cause each other, creating paradoxes:
```
Event A triggers Event B
Event B triggers Event A  ← ALLOWED (but impossible)
```
**Impact:** Timeline becomes logically inconsistent.
**Fix:** Add graph cycle detection before inserting causality links.

---

### 4. 🔴 Promise Payoff Before Setup Allowed
**File:** `src/db/database.ts:createPromise`
**Issue:** A promise can be "fulfilled" in a scene that occurs BEFORE it was "planted."
```
Scene at Year 100: "The gun fires!" (fulfillment)
Scene at Year 200: "Notice the gun." (setup)  ← WRONG ORDER
```
**Impact:** Violates Chekhov's Gun principle; narrative inconsistency.
**Fix:** Validate scene dates when linking fulfillment scene.

---

## High Priority Issues

### 5. 🟠 No Leap Year Support
**File:** `src/engines/timeline/calendar.ts`
**Issue:** February always has 28 days. No leap year calculation.
**Impact:** Long-running stories (100+ years) have date drift.
**Fix:** Add leap year rules to CalendarSystem type and calculation.

---

### 6. 🟠 Hybrid Species Aging Not Implemented
**File:** `src/engines/timeline/age.ts`
**Issue:** Type `SpeciesHybrid` exists but `calculateApparentAge()` ignores it.
```typescript
// Tenchi is half-Juraian - what's his aging curve?
// Currently: Falls back to primary species or 1:1
```
**Impact:** Cannot accurately model mixed-species characters.
**Fix:** Implement aging curve interpolation for hybrids.

---

### 7. 🟠 Circular Relationships Allowed
**File:** `src/db/database.ts`
**Issue:** A can be parent of B, B parent of C, C parent of A.
```
Alice → parent of → Bob
Bob → parent of → Carol
Carol → parent of → Alice  ← IMPOSSIBLE
```
**Impact:** Family trees become logically impossible.
**Fix:** Validate relationship graph for cycles before insertion.

---

### 8. 🟠 Moon Phase Drift with Fractional Cycles
**File:** `src/engines/timeline/calendar.ts:getMoonPhase`
**Issue:** Lunar cycle is 29.5 days, but integer math causes phase drift.
```
After 1000 lunar cycles (29,500 days):
Expected: Same phase as day 1
Actual: Different phase due to rounding errors
```
**Impact:** Moon phases incorrect after long timespans.
**Fix:** Use floating-point arithmetic or track fractional days.

---

### 9. 🟠 No Cross-Calendar Date Conversion
**File:** `src/engines/timeline/calendar.ts`
**Issue:** `daysBetween()` throws error for different calendars.
```typescript
daysBetween(juraianDate, gregorianDate) // throws Error
```
**Impact:** Cannot compare events across calendar systems.
**Fix:** Implement universal day-number conversion using anchor dates.

---

### 10. 🟠 Multiple Concurrent Writing Sessions
**File:** `src/engines/tracking/productivity.ts`
**Issue:** Can start multiple sessions simultaneously, causing word count duplication.
**Impact:** Inflated productivity statistics.
**Fix:** Check for active session before allowing new one.

---

## Medium Priority Issues

### 11. 🟡 Empty Content Embedding Handling
**File:** `src/engines/ai/embeddings.ts`
**Issue:** Embedding empty string may return zero vector or crash.
**Fix:** Return null or skip empty content.

---

### 12. 🟡 No FTS Index Update on Scene Edit
**File:** `src/db/database.ts:updateSceneContent`
**Issue:** `scenes_fts` index may not update when content changes.
**Impact:** Search returns stale results.
**Fix:** Ensure FTS trigger fires on UPDATE.

---

### 13. 🟡 Dead Characters Not Excluded from State Queries
**File:** `src/engines/ai/story-bible.ts`
**Issue:** Context snapshot includes dead characters with stale states.
**Impact:** AI context may reference characters as alive when dead.
**Fix:** Filter by death date in `getContextSnapshot()`.

---

### 14. 🟡 Deeply Nested Containers May Cause Stack Overflow
**File:** `src/engines/compile/index.ts:getOrderedScenes`
**Issue:** Recursive traversal with no depth limit.
**Impact:** 100+ levels of nesting could crash with stack overflow.
**Fix:** Use iterative traversal or add depth limit.

---

### 15. 🟡 HTML Not Escaped in Compile Output
**File:** `src/engines/compile/index.ts:compileToHtml`
**Issue:** Chapter titles with `<` or `>` could break HTML.
**Impact:** Malformed HTML output.
**Fix:** Escape all user content in HTML templates.

---

## Low Priority Issues

### 16. 🟢 Missing Validation on Species Aging Curve Order
**Issue:** Aging curve points don't need to be in chronological order.
**Impact:** Could produce erratic age calculations.

---

### 17. 🟢 No Soft Delete for Entities
**Issue:** Deleted entities are permanently removed.
**Impact:** No recovery possible; breaks promise references.

---

### 18. 🟢 Word Count Includes Markdown Syntax
**Issue:** `# Headers` and `**bold**` counted as words.
**Impact:** Slightly inflated word counts.

---

### 19. 🟢 No Rate Limiting on API Embedding Calls
**Issue:** Rapid scene indexing could hit rate limits.
**Impact:** API errors during bulk operations.

---

### 20. 🟢 Voice Fingerprint Analysis Too Simple
**Issue:** Uses basic keyword matching, not actual NLP.
**Impact:** Voice consistency checking is unreliable.

---

## Missing Features (Documented but Not Implemented)

### 21. ⬜ Interactive Map Engine
**File:** `src/core/types.ts:InteractiveMap`
**Status:** Type defined, no implementation.

### 22. ⬜ DOCX/EPUB/PDF Export
**File:** `src/engines/compile/index.ts`
**Status:** Placeholder implementations only.

### 23. ⬜ Real-Time CRDT Sync
**File:** Documented in specs
**Status:** No Yjs integration implemented.

---

## Test Coverage Summary

| Module | Tests | Pass | Fail | Coverage |
|--------|-------|------|------|----------|
| Age Calculator | 7 | 4 | 3 | ~57% |
| Calendar System | 5 | 2 | 3 | ~40% |
| Database | 6 | 3 | 3 | ~50% |
| Compile Engine | 4 | 3 | 1 | ~75% |
| AI/Embeddings | 3 | 2 | 1 | ~67% |
| Promises | 2 | 0 | 2 | ~0% |
| Productivity | 3 | 2 | 1 | ~67% |
| **TOTAL** | **30** | **16** | **14** | **~53%** |

---

## Recommended Fix Priority

### Sprint 1: Critical Data Integrity
1. Fix orphaned scene cascade delete
2. Add circular causality detection
3. Fix negative age handling
4. Validate promise timeline order

### Sprint 2: Calendar Accuracy
5. Implement leap year support
6. Fix moon phase drift
7. Add cross-calendar conversion

### Sprint 3: Advanced Features
8. Implement hybrid species aging
9. Add circular relationship detection
10. Implement concurrent session prevention

### Sprint 4: Polish
11. Fix HTML escaping in compile
12. Implement proper DOCX/EPUB export
13. Add soft delete with recovery

---

## Conclusion

The Epic Fiction Architect has a solid foundation but requires significant hardening before production use. The type system is comprehensive, but runtime validation is lacking. Priority should be given to data integrity issues that could corrupt long-term story projects.

**Estimated effort to fix all issues: 40-60 developer hours**
