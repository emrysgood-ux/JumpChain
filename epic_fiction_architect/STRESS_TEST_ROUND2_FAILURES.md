# Epic Fiction Architect - ROUND 2 STRESS TEST FAILURES

## 🚨 CRITICAL DISCOVERY: COMPLETE SCHEMA/CODE MISMATCH

**The SQL schema and TypeScript implementation are INCOMPATIBLE.**

The application would **crash immediately** on first database access because:
- Column names don't match
- Table relationships are inverted
- Data models are fundamentally different

---

## Schema vs Code Comparison

### Table: `projects`

| Column | Schema | TypeScript | Status |
|--------|--------|------------|--------|
| name/title | `title` | `name` | ❌ MISMATCH |
| subtitle | ✅ | ❌ | ❌ Missing |
| premise | ✅ | ❌ | ❌ Missing |
| description | ❌ | ✅ | ❌ Missing |
| default_calendar_id | ❌ | ✅ | ❌ Missing |

**Result:** INSERT/SELECT would fail with `no such column: name`

---

### Table: `story_elements`

| Column | Schema | TypeScript | Status |
|--------|--------|------------|--------|
| type column | `element_type` | `type` | ❌ MISMATCH |
| color_label | ✅ | ❌ | ❌ Missing |
| icon | ✅ | ❌ | ❌ Missing |
| tags | ❌ | ✅ | ❌ Missing |
| metadata | ❌ | ✅ | ❌ Missing |

**Result:** INSERT would fail with `no such column: type`

---

### Table: `scenes` - CRITICAL ARCHITECTURE DIFFERENCE

| Aspect | Schema | TypeScript |
|--------|--------|------------|
| **Primary Key** | `id REFERENCES containers(id)` | `id` (standalone UUID) |
| **Relationship** | Scene IS a container | Scene BELONGS TO container |
| **Insert Pattern** | 1. Create container with type='scene'<br>2. Insert into scenes with SAME id | 1. Create container<br>2. Insert scene with `container_id` reference |

```
SCHEMA MODEL (scene is subtype):
┌─────────────┐
│ containers  │
│ id = "abc"  │◄──┐
│ type="scene"│   │
└─────────────┘   │ SAME ID
┌─────────────┐   │
│   scenes    │   │
│ id = "abc"  │───┘
└─────────────┘

TYPESCRIPT MODEL (scene is child):
┌─────────────┐
│ containers  │
│ id = "abc"  │◄──────────────┐
└─────────────┘               │ FOREIGN KEY
┌─────────────┐               │
│   scenes    │               │
│ id = "xyz"  │               │
│container_id │───────────────┘
└─────────────┘
```

**Result:** TypeScript creates orphaned scenes that violate schema constraints.

---

### Table: `species_aging` - INCOMPATIBLE MODELS

**Schema Model:** Single multiplier
```sql
species_id | aging_rate | max_lifespan
-----------|------------|-------------
juraian    | 0.1        | 5000         -- Ages 10x slower than human
```

**TypeScript Model:** Aging curve points
```typescript
{
  chronologicalAge: 200, apparentAge: 20,   // At 200, looks 20
  chronologicalAge: 1000, apparentAge: 30,  // At 1000, looks 30
  // Non-linear interpolation between points
}
```

**Why This Matters:**
- Schema: Juraian at 1000 years = 100 apparent age (1000 × 0.1)
- TypeScript: Juraian at 1000 years = 30 apparent age (from curve)
- **Yosho's age would be WRONG by 70 years**

---

### Table: `embeddings`

| Aspect | Schema | TypeScript |
|--------|--------|------------|
| Storage | `embedding BLOB` | `vector JSON` (number[]) |
| Type Column | `source_type` | `entity_type` |
| ID Column | `source_id` | `entity_id` |

**Result:**
- Storing JSON into BLOB corrupts data
- Reading BLOB as JSON crashes
- No vector similarity search possible on BLOB

---

## New Bugs Discovered (Round 2)

### Bug #24: Schema/Code Incompatibility
- **Severity:** 🔴 CRITICAL
- **Impact:** Application completely non-functional
- **Fix:** Rewrite schema.sql to match database.ts

### Bug #25: Word Count Trigger Inaccurate
- **Severity:** 🟡 MEDIUM
- **Location:** schema.sql:857
- **Issue:** `length(content) - length(replace(content, ' ', '')) + 1`
  - Empty string returns 1 (should be 0)
  - Multiple spaces overcounts
  - Unicode spaces ignored

### Bug #26: Moon Cycle Can Be Zero
- **Severity:** 🟡 MEDIUM
- **Issue:** No CHECK constraint on `cycle_length`
- **Impact:** Division by zero in phase calculation

### Bug #27: Recursive CTE Infinite Loop
- **Severity:** 🟡 MEDIUM
- **Location:** schema.sql:907 (writing_streaks view)
- **Issue:** No recursion limit

### Bug #28: Multiple Default Calendars
- **Severity:** 🟢 LOW
- **Issue:** No unique constraint on `is_default` per project

### Bug #29: BLOB Embeddings Prevent Search
- **Severity:** 🟠 HIGH
- **Issue:** SQLite can't compare BLOBs for similarity
- **Impact:** All embeddings loaded into memory for search

### Bug #30: Scene/Container Relationship Inverted
- **Severity:** 🔴 CRITICAL
- **Issue:** Schema vs TypeScript use opposite patterns
- **Impact:** Data corruption or constraint violations

### Bug #31-37: Various validation and index issues

---

## Integration Test Failures

| Test | Expected | Actual |
|------|----------|--------|
| Create project | Success | `no such column: name` |
| Create scene | Success | `scenes.container_id does not exist` |
| Calculate age | Apparent age | Wrong model (multiplier vs curve) |
| FTS search | Results | `no such table: scenes_fts` |
| Store embedding | Success | Data corruption (JSON→BLOB) |
| Get promises | Success | `no such column: planted_scene_id` |

---

## Cumulative Bug Count

| Round | Bugs | Critical | High | Medium | Low |
|-------|------|----------|------|--------|-----|
| Round 1 | 23 | 4 | 6 | 8 | 5 |
| Round 2 | 14 | 3 | 5 | 4 | 2 |
| **TOTAL** | **37** | **7** | **11** | **12** | **7** |

---

## Root Cause Analysis

```
The system has TWO parallel implementations that were never reconciled:

spec documents ──► schema.sql (database design)
       │
       ├─► types.ts (TypeScript interfaces)
       │       │
       │       └─► database.ts (DIFFERENT from schema)
       │
       └─► Priority_Gap_Analysis.md (more features)
                │
                └─► types.ts additions (circular)
```

**Result:** Schema represents "design intent", TypeScript represents "implementation intent". They diverged completely.

---

## Recommended Fix Strategy

### Option A: Fix Schema to Match Code (RECOMMENDED)
**Effort: 20-30 hours**

1. Generate new schema from TypeScript types
2. Write migration script for any existing data
3. Add validation constraints
4. Create proper indexes

### Option B: Fix Code to Match Schema
**Effort: 40-60 hours**

1. Rewrite database.ts query layer
2. Change scene/container relationship pattern
3. Implement multiplier-based aging (loses functionality)
4. Change all column references

### Option C: Full Redesign
**Effort: 80-100 hours**

Not recommended - too much work already invested.

---

## Immediate Actions Required

1. **STOP** attempting to use the system
2. Choose fix strategy (recommend Option A)
3. Write migration/regeneration script
4. Add comprehensive integration tests
5. Implement schema validation at startup

---

## Conclusion

The Epic Fiction Architect has excellent architectural design in the TypeScript layer, but the SQL schema was written from different source documents and never validated against the actual code.

**This is a documentation/implementation sync failure, not a design failure.**

The TypeScript implementation is more complete and should be the source of truth for schema regeneration.
