# WORKFLOW IMPROVEMENT RESEARCH
**Category:** Research
**Last Updated:** 2025-12-16
**Purpose:** Document best practices from industry for future implementation

---

## 1. MARKDOWN LINTING (markdownlint)

**Source:** Industry standard for docs-as-code workflows

**What It Does:**
- Validates markdown syntax against configurable rules
- Catches formatting inconsistencies automatically
- Integrates with CI/CD pipelines

**Applicable Rules for Our Project:**
- MD001: Heading levels should increment by one
- MD013: Line length limits (configurable)
- MD029: Ordered list numbering
- MD041: First line should be top-level heading

**Implementation:**
```bash
npm install -g markdownlint-cli
markdownlint "**/*.md" --config .markdownlint.json
```

**Configuration File (.markdownlint.json):**
```json
{
  "MD013": { "line_length": 120 },
  "MD033": false,
  "MD041": true
}
```

**Value for Project:** Prevents formatting drift between sessions; catches broken markdown before it accumulates.

---

## 2. PROSE LINTING (Vale)

**Source:** vale.sh — open-source prose linter

**What It Does:**
- Enforces custom style guides automatically
- Catches filter words, passive voice, jargon
- Supports custom vocabulary and rules

**Applicable for Our Project:**

### Custom Vale Rules We Could Create:

**forbidden_words.yml:**
```yaml
extends: existence
message: "Forbidden word '%s' in Sheldon POV (Phase I)"
level: error
tokens:
  - cosmos
  - sailor
  - ryoko
  - washu
  - jurai
  - tsunami
  - kagato
  - ayeka
  - sasami
  - galaxy police
  - royal tree
  - lambda
```

**filter_words.yml (Law 28):**
```yaml
extends: existence
message: "Filter word detected: '%s' — consider removing"
level: warning
tokens:
  - seemed to
  - appeared to
  - felt like
  - could see
  - could hear
  - realized
  - noticed
  - wondered
```

**Value for Project:** Automates Law 28 (Filter Words) and Law 9/26 (Forbidden Words) enforcement.

---

## 3. YAML FRONT MATTER

**Source:** Jekyll, Hugo, GitHub Docs standard

**What It Does:**
- Embeds structured metadata at top of markdown files
- Machine-readable, human-editable
- Enables automated processing and validation

**Proposed Format for Bible Files:**

```yaml
---
title: "Sheldon Character Profile"
category: character
version: 14.2.1
last_updated: 2025-12-16
codex_laws: [1, 9, 26, 66]
phase_visibility: [1, 2, 3]
related_files:
  - knowledge_states/sheldon_phase1.md
  - timeline/day_001.md
tags: [protagonist, cosmic, phase-locked]
---
```

**Benefits:**
- Automated version tracking per file
- Link validation between files
- Phase visibility enforcement
- Law compliance tagging

---

## 4. JSON SCHEMA VALIDATION

**Source:** json-schema.org standard

**What It Does:**
- Validates configuration files against defined structure
- Catches missing required fields
- Ensures type correctness

**Applicable Schemas:**

**thread_entry.schema.json:**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["id", "name", "opened", "type", "status"],
  "properties": {
    "id": { "type": "string", "pattern": "^THREAD-[0-9]{3}$" },
    "name": { "type": "string" },
    "opened": { "type": "string" },
    "type": { "enum": ["PLOT", "SUBPLOT", "ARC", "RELATIONSHIP", "MYSTERY"] },
    "status": { "enum": ["ACTIVE", "DORMANT", "RESOLVED", "ORPHANED"] },
    "last_touched": { "type": "string" },
    "resolution": { "type": "string" }
  }
}
```

**Value for Project:** Ensures tracking files maintain consistent structure.

---

## 5. SEMANTIC VERSIONING FOR DOCUMENTS (SemVerDoc)

**Source:** semverdoc.org — adaptation of semver for documents

**Rules (adapted for our project):**

| Increment | When |
|-----------|------|
| MAJOR (X.0.0) | Architecture change, structural reorganization |
| MINOR (x.Y.0) | New content added, content removed, new files |
| PATCH (x.y.Z) | Typo fixes, formatting, minor corrections |

**Current Application:**
- Codex: v5.1.1 (MAJOR.MINOR.PATCH)
- Bible: v14.2.1 (tracks with Codex via formula)

**Already Implemented:** Our version coupling (Law 94) follows this pattern.

---

## 6. VERSION CONTROL CONCEPTS FROM GIT

**Source:** Software development best practices

**Applicable Concepts:**

### Branching (Not Yet Implemented)
- Create "branches" for experimental scenes
- Merge successful experiments back to main
- Discard failed experiments without loss

### Commit Messages (Adaptable)
Standard format for change documentation:
```
[TYPE] Brief description

- Detail 1
- Detail 2

Affects: file1.md, file2.md
Laws: 28, 65
```

Types: ADD, FIX, UPDATE, REMOVE, RESTRUCTURE

### Snapshots
- Like Scrivener's snapshot feature
- Preserve state before major edits
- Enable rollback without full version bump

**Value for Project:** Better change tracking, safer experimentation.

---

## 7. FICTION SOFTWARE PATTERNS (Scrivener/Plottr)

**Source:** Scrivener, Plottr, World Anvil, Campfire

### Binder Pattern (Already Implemented)
Our modular architecture mirrors Scrivener's binder:
- `/characters/` = Character folder
- `/locations/` = Places folder
- `/timeline/` = Scenes/chapters
- `_INDEX.md` = Project navigator

### Corkboard Pattern (Potential)
Visual scene arrangement — could implement as:
- Mermaid diagram in `scene_registry.md`
- Or dedicated `corkboard.md` with visual layout

### Collections Pattern (Potential)
- Group scenes by POV character
- Group scenes by timeline
- Group scenes by thread

### Snapshots (From Stress Test)
Before major rewrites:
1. Copy current scene to `_ARCHIVE/`
2. Name with date: `day_001_SNAPSHOT_2025-12-16.md`
3. Proceed with edits
4. Delete snapshot after verification OR keep for reference

---

## 8. SERIES BIBLE BEST PRACTICES

**Source:** Plottr, World Anvil, professional TV series bibles

### Continuity Tracking
- Character attribute consistency (eye color, height, etc.)
- Timeline consistency (what day is it?)
- Relationship status tracking
- Item/object tracking (where is the Tenchi-ken?)

### Cross-Reference System
Our wiki-style links (`[[file.md]]`) implement this.

### Unresolved Thread Log
Our `thread_registry.md` implements this.

### Future Planning Section
Our `days_023-028.md` implements chapter planning.

---

## 9. AUTOMATION TOOL STACK (Proposed)

| Tool | Purpose | Priority |
|------|---------|----------|
| markdownlint | Format validation | HIGH |
| Vale | Prose style enforcement | HIGH |
| Python regex scanner | Forbidden words (existing) | DONE |
| Python version validator | Coupling check (existing) | DONE |
| JSON Schema validator | Config structure | MEDIUM |
| Link checker | Wiki-link validation | MEDIUM |

---

## 10. IMPLEMENTATION ROADMAP

### Phase 1 (Current Session)
- [x] Document research findings
- [x] Identify applicable patterns
- [ ] Add to Codex as recommendations

### Phase 2 (Future Session)
- [ ] Create Vale configuration for Law 28/Law 9
- [ ] Add YAML front matter to key files
- [ ] Create JSON schemas for tracking files

### Phase 3 (When Needed)
- [ ] Implement snapshot system
- [ ] Create visual corkboard
- [ ] Add collections/filtering

---

## SOURCES

1. markdownlint: https://github.com/DavidAnson/markdownlint
2. Vale prose linter: https://vale.sh/
3. YAML Front Matter: https://jekyllrb.com/docs/front-matter/
4. JSON Schema: https://json-schema.org/
5. SemVerDoc: https://semverdoc.org/
6. Scrivener: https://www.literatureandlatte.com/scrivener/
7. Plottr: https://plottr.com/
8. World Anvil: https://www.worldanvil.com/

---

**END OF WORKFLOW RESEARCH**
