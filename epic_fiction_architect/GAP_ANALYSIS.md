# Epic Fiction Architect - Gap Analysis

## Comparison Against Fiction Writing Tools Across the Internet

**Analysis Date:** January 2026
**Tools Researched:** Scrivener, World Anvil, Campfire Writing, Plottr, Aeon Timeline, AutoCrit, ProWritingAid, bibisco, Novelcrafter, One Stop For Writers, Fantasy Name Generators, Vulgarlang, and 50+ other tools.

---

## Current Engines (13 Total)

| Engine | Status | Coverage |
|--------|--------|----------|
| Database (SQLite/FTS5) | ✅ Complete | Core storage, full-text search |
| Compile Engine | ✅ Complete | DOCX, EPUB, PDF, HTML, Markdown |
| Calendar Engine | ✅ Complete | Custom fantasy calendars |
| Age Calculator | ✅ Complete | Non-human aging curves |
| Productivity Tracker | ✅ Complete | Sessions, sprints, goals |
| Embeddings Engine | ✅ Complete | Semantic search |
| Story Bible (SCORE) | ✅ Complete | AI context, retrieval |
| Summarization Guard | ✅ Complete | Detail preservation |
| Predictive Narrative | ✅ Complete | Causal graphs, cascade sim |
| Consistency Checker | ✅ Complete | Contradiction detection |
| Writing Craft Analyzer | ✅ Complete | Emotional arcs, pacing, show/tell |
| Writing Rules Engine | ✅ Complete | Banned patterns/phrases |
| Map Visualizer | ✅ Complete | ASCII, SVG, Leaflet |

---

## IDENTIFIED GAPS (Prioritized)

### TIER 1: HIGH IMPACT - Core Worldbuilding (Missing in most novel software)

#### 1. Character Relationship Engine
**Found In:** Campfire, World Anvil, PlotForge, Story Architect
**Gap Level:** 🔴 Critical

| Feature | We Have | Industry Has |
|---------|---------|--------------|
| Relationship types | ❌ | 100+ types (Campfire) |
| Family tree visualization | ❌ | Full genealogy trees |
| Relationship evolution over time | ❌ | Timeline-linked changes |
| Faction/alliance mapping | ❌ | Political web visualization |
| Relationship strength ratings | ❌ | 1-10 strength + status |
| Visual graph rendering | ❌ | Interactive node graphs |

**Recommendation:** Build `RelationshipEngine` with:
- Graph-based relationship storage
- Temporal relationship states (allies→enemies→reluctant allies)
- Faction system with membership hierarchies
- Visual export (ASCII graph, SVG, D3.js interactive)

---

#### 2. Plot Structure Templates Engine
**Found In:** Plottr, Save the Cat, Dabble, Scrivener, The Novel Factory
**Gap Level:** 🔴 Critical

| Structure | We Have | Industry Has |
|-----------|---------|--------------|
| Save the Cat (15 beats) | ❌ | Full templates |
| Three-Act Structure | ❌ | Customizable acts |
| Hero's Journey (17 stages) | ❌ | Full templates |
| Seven-Point Story | ❌ | Full templates |
| Snowflake Method | ❌ | Expandable templates |
| Scene-Sequel (Swain) | ❌ | Goal-Conflict-Disaster |
| Romance beats | ❌ | Genre-specific |
| Mystery/Thriller beats | ❌ | Genre-specific |

**Recommendation:** Build `PlotTemplateEngine` with:
- 20+ structure templates
- Beat sheet generation
- Template customization
- Progress tracking per beat
- Auto-suggest next beat based on position

---

#### 3. Magic/Power System Designer
**Found In:** Campfire (Magic Module), World Anvil, Seventh Sanctum
**Gap Level:** 🟡 High

| Feature | We Have | Industry Has |
|---------|---------|--------------|
| Ability/spell registry | ❌ | Full spell databases |
| Cost/limitation tracking | ❌ | Resource systems |
| Power scaling | ❌ | Level/tier systems |
| Inheritance rules | ❌ | Bloodline tracking |
| Source categorization | ❌ | Magic types/schools |
| Consistency validation | ⚠️ Partial | Rule enforcement |

**Recommendation:** Build `PowerSystemEngine` with:
- Ability definitions (name, cost, effect, limitations)
- Power sources (mana, ki, divine, technological)
- Scaling rules with balance checking
- Character-ability linking
- Consistency rules integration

---

#### 4. Culture/Religion Designer
**Found In:** Campfire, World Anvil
**Gap Level:** 🟡 High

| Feature | We Have | Industry Has |
|---------|---------|--------------|
| Belief systems | ❌ | Pantheon builders |
| Customs/traditions | ❌ | Holiday/ritual tracking |
| Social hierarchies | ❌ | Class systems |
| Clothing/food/art | ❌ | Cultural detail templates |
| Language integration | ❌ | Naming conventions |
| Calendar integration | ⚠️ Partial | Religious holidays |

**Recommendation:** Build `CultureEngine` with:
- Religion/pantheon system
- Social structure templates
- Tradition/custom tracking
- Cross-culture relationship tracking
- Integration with Calendar Engine

---

### TIER 2: HIGH IMPACT - Writing Quality Tools

#### 5. POV Analyzer
**Found In:** AutoCrit
**Gap Level:** 🟡 High

| Feature | We Have | Industry Has |
|---------|---------|--------------|
| Head-hopping detection | ❌ | Automatic flagging |
| POV consistency check | ❌ | Scene-level validation |
| Deep vs shallow POV | ❌ | Metrics and suggestions |
| Thought verb detection | ❌ | Filter word flagging |
| "I" word frequency (1st) | ❌ | Density analysis |

**Recommendation:** Build `POVAnalyzer` with:
- Perspective markers detection
- Scene POV character tracking
- Head-hop detection via pronoun/name shifts
- Filter word identification (thought, felt, knew, etc.)
- Deep POV strengthening suggestions

---

#### 6. Word Frequency Analyzer
**Found In:** ProWritingAid, AutoCrit, Scrivener, Hermetic
**Gap Level:** 🟡 High

| Feature | We Have | Industry Has |
|---------|---------|--------------|
| Word frequency counts | ❌ | Full manuscript analysis |
| Crutch word detection | ❌ | Personal pattern learning |
| Overused word alerts | ❌ | Proximity-based alerts |
| Word cloud generation | ❌ | Visual word density |
| Custom banned word lists | ⚠️ Partial (Rules) | Per-project lists |

**Recommendation:** Build `WordFrequencyAnalyzer` with:
- Full manuscript word counting
- Configurable crutch word lists
- Proximity alerts (same word within N paragraphs)
- Word cloud data export
- Integration with Writing Rules Engine

---

#### 7. Scene Metadata Tagging System
**Found In:** Novelcrafter, Scrivener, Plottr
**Gap Level:** 🟡 High

| Feature | We Have | Industry Has |
|---------|---------|--------------|
| POV character per scene | ❌ | Dropdown selection |
| Setting/location tag | ❌ | Linked to location DB |
| Plot thread tags | ❌ | Multiple thread tracking |
| Tension/stakes level | ❌ | 1-10 rating system |
| Time/date stamp | ⚠️ Partial | Calendar integration |
| Custom metadata fields | ❌ | User-defined fields |
| Color coding | ❌ | Visual organization |

**Recommendation:** Build `SceneMetadataEngine` with:
- Flexible metadata schema per project
- Pre-built common fields (POV, setting, tension, threads)
- Filtering and querying by metadata
- Visual summary reports
- Timeline integration

---

### TIER 3: MEDIUM IMPACT - Generator Tools

#### 8. Name Generators
**Found In:** Fantasy Name Generators, Seventh Sanctum, donjon, ProWritingAid
**Gap Level:** 🟠 Medium

| Feature | We Have | Industry Has |
|---------|---------|--------------|
| Character names | ❌ | 1400+ generators |
| Place names | ❌ | Region-specific |
| Species/culture names | ❌ | Culture-linked |
| Phonetic rules | ❌ | Consistency systems |
| Name meaning lookup | ❌ | Etymology integration |

**Recommendation:** Build `NameGenerator` with:
- Phonetic rule templates
- Culture-linked name patterns
- Name meaning/etymology tracking
- Collision detection (no duplicate names)
- Markov chain generation

---

#### 9. Conlang/Language Creator
**Found In:** Vulgarlang, Grapheion, Language Creation Kit
**Gap Level:** 🟠 Medium

| Feature | We Have | Industry Has |
|---------|---------|--------------|
| Phonology rules | ❌ | Sound system designer |
| Grammar templates | ❌ | Syntax rule builder |
| Vocabulary builder | ❌ | Dictionary management |
| Script generator | ❌ | Alphabet creation |
| Translation helper | ❌ | Phrase translator |

**Recommendation:** Build `ConlangEngine` with:
- Phoneme inventory system
- Basic grammar rules (word order, conjugation)
- Vocabulary storage with etymology
- Phrase translation helper
- Consistency validation

---

#### 10. Item/Artifact Registry
**Found In:** Campfire (Items Module), World Anvil
**Gap Level:** 🟠 Medium

| Feature | We Have | Industry Has |
|---------|---------|--------------|
| Item database | ❌ | Full cataloging |
| Magical properties | ❌ | Power integration |
| Ownership history | ❌ | Timeline tracking |
| Rarity/value system | ❌ | Economic integration |
| Visual representation | ❌ | Image attachment |

**Recommendation:** Build `ItemRegistry` with:
- Item categorization (weapons, artifacts, technology)
- Property system linked to Magic Engine
- Ownership chain tracking
- Significance/plot importance flagging
- Consistency checker integration

---

### TIER 4: NICE TO HAVE - Enhancement Tools

#### 11. Timeline Visualizer (Enhanced)
**Found In:** Aeon Timeline, Plottr, World Anvil
**Gap Level:** 🟢 Enhancement

| Feature | We Have | Industry Has |
|---------|---------|--------------|
| Basic timeline | ⚠️ Calendar | Multi-track visualization |
| Character lifelines | ❌ | Birth-death spans |
| Event dependencies | ⚠️ Causal graph | Visual arrows |
| Parallel timelines | ❌ | Multiple reality tracks |
| Zoom levels | ❌ | Year→day granularity |

---

#### 12. Subplot Manager
**Found In:** Plottr, Scrivener, Fictionary
**Gap Level:** 🟢 Enhancement

| Feature | We Have | Industry Has |
|---------|---------|--------------|
| Multiple plot threads | ⚠️ Causal | Color-coded lines |
| Thread weaving view | ❌ | Visual interleaving |
| Convergence tracking | ⚠️ Causal | Meeting points |
| Thread resolution | ❌ | Completion tracking |

---

#### 13. Encyclopedia/Wiki Export
**Found In:** World Anvil, Campfire
**Gap Level:** 🟢 Enhancement

| Feature | We Have | Industry Has |
|---------|---------|--------------|
| Inter-linked articles | ⚠️ Story Bible | Wiki-style links |
| Spoiler protection | ❌ | Reader view modes |
| Public sharing | ❌ | Web publication |
| Category navigation | ⚠️ Tags | Hierarchical nav |

---

## PRIORITY IMPLEMENTATION ORDER

Based on:
- Impact on 300M+ word narratives
- Uniqueness (not easily done elsewhere)
- Integration synergy with existing engines

### Phase 1: Core Worldbuilding
1. **Character Relationship Engine** - Critical for epic casts
2. **Plot Structure Templates** - Universal need
3. **Scene Metadata Tagging** - Organization backbone

### Phase 2: Craft Enhancement
4. **POV Analyzer** - Quality control
5. **Word Frequency Analyzer** - Polish tool
6. **Magic/Power System Designer** - Fantasy essential

### Phase 3: World Depth
7. **Culture/Religion Designer** - Depth tool
8. **Name Generators** - Convenience
9. **Item/Artifact Registry** - Tracking

### Phase 4: Advanced Features
10. **Conlang Engine** - Niche but powerful
11. **Timeline Visualizer** (Enhanced) - Already have foundation
12. **Subplot Manager** - Enhancement
13. **Encyclopedia Export** - Publication ready

---

## COMPETITIVE ANALYSIS SUMMARY

| Tool | Strengths | We Excel At |
|------|-----------|-------------|
| **World Anvil** | Wiki, templates, community | AI context, semantic search |
| **Campfire** | Modular, visual | Causal prediction, cascade sim |
| **Plottr** | Visual timeline, templates | Consistency checking, age calc |
| **Scrivener** | Writing environment | Craft analysis, rules engine |
| **AutoCrit** | Prose analysis | Emotional arcs, show/tell |
| **Aeon Timeline** | Timeline visualization | Calendar systems, non-human aging |

### Our Unique Advantages (Keep Building On)
1. **Predictive Narrative Engine** - No competitor has this
2. **Cascade Simulator** - Butterfly effect analysis unique
3. **Non-Human Aging** - No one else does this
4. **Custom Fantasy Calendars** - Limited elsewhere
5. **300M+ Word Scale Design** - No competitor targets this
6. **Consistency Checker** - Most comprehensive
7. **SCORE Framework** - AI-optimized context

---

## Sources

### Writing Software
- [Scrivener](https://www.literatureandlatte.com/scrivener/overview)
- [Plottr](https://plottr.com/features/)
- [Campfire Writing](https://www.campfirewriting.com/)
- [bibisco](https://bibisco.com/)
- [Novelcrafter](https://www.novelcrafter.com/features)

### Worldbuilding Platforms
- [World Anvil](https://www.worldanvil.com/)
- [World Anvil 2025 Features](https://blog.worldanvil.com/worldanvil/dev-news/world-anvil-new-features-2025/)

### Craft Analysis Tools
- [AutoCrit POV](https://www.autocrit.com/editing/support/pov-consistency/)
- [ProWritingAid Pacing](https://prowritingaid.com/art/344/How-to-use...-The-Pacing-Check.aspx)
- [One Stop For Writers](https://onestopforwriters.com/features-tools)

### Generators & Utilities
- [Vulgarlang Conlang](https://www.vulgarlang.com/)
- [Fantasy Name Generators](https://www.fantasynamegenerators.com/)
- [donjon RPG Tools](https://donjon.bin.sh/)
- [Seventh Sanctum](https://www.seventhsanctum.com/)

### Story Structure
- [Save the Cat Beat Sheet](https://reedsy.com/blog/guide/story-structure/save-the-cat-beat-sheet/)
- [Aeon Timeline](https://www.aeontimeline.com/)
