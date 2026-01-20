# Epic Fiction Architect - Worldbuilding Engine Gap Analysis

## Deep Comparison Against Worldbuilding Tools Across the Internet

**Analysis Date:** January 2026
**Focus:** Worldbuilding-specific features for fictional universes

---

## Tools Researched

### Major Worldbuilding Platforms
| Platform | Focus | Users |
|----------|-------|-------|
| [World Anvil](https://www.worldanvil.com/) | Wiki + RPG + Writing | 1.5M+ |
| [Campfire Writing](https://www.campfirewriting.com/) | Modular Worldbuilding | 500K+ |
| [LegendKeeper](https://www.legendkeeper.com/) | Wiki + Maps + Whiteboards | 5K+ |
| [Kanka](https://kanka.io/) | RPG Campaign Manager | 100K+ |
| [One Stop For Writers](https://onestopforwriters.com/) | Thesaurus + Surveys | 50K+ |

### Procedural Generators
| Tool | Specialization |
|------|----------------|
| [Azgaar's FMG](https://azgaar.github.io/Fantasy-Map-Generator/) | World maps, cultures, religions, routes |
| [Watabou Procgen](https://watabou.github.io/) | Cities, villages, dungeons, mansions |
| [donjon](https://donjon.bin.sh/) | Dungeons, NPCs, shops, encounters |
| [Seventh Sanctum](https://www.seventhsanctum.com/) | Names, creatures, magic, cultures |
| [Fantasy Name Generators](https://www.fantasynamegenerators.com/) | 1400+ name generators |
| [Chaotic Shiny](https://www.chaoticshiny.com/) | Civilizations, cultures, religions |

### Specialized Tools
| Tool | Feature |
|------|---------|
| [Vulgarlang](https://www.vulgarlang.com/) | Constructed language generator |
| [Armoria](https://azgaar.github.io/Armoria/) | Heraldry/coat of arms |
| [CoaMaker](https://coamaker.com/) | Coat of arms designer |
| [Aeon Timeline](https://www.aeontimeline.com/) | Complex timeline management |

---

## Current Epic Fiction Architect Coverage

### ✅ What We Have (Strong)
| Engine | Worldbuilding Application |
|--------|---------------------------|
| Calendar Engine | Custom fantasy calendars with moons, seasons |
| Age Calculator | Non-human species aging curves |
| Map Visualizer | ASCII, SVG, Leaflet map rendering |
| Consistency Checker | World rule validation |
| Cascade Simulator | Butterfly effect on world events |
| Story Bible | Centralized world knowledge |

### ⚠️ Partial Coverage
| Feature | Our Coverage | Industry Standard |
|---------|--------------|-------------------|
| Timelines | Calendar events | Multi-track visual timelines |
| Locations | Map points | Full location wiki articles |
| Characters | Basic tracking | Full relationship graphs |

---

## IDENTIFIED WORLDBUILDING GAPS

### 🔴 CRITICAL: Core Worldbuilding Systems

---

#### Gap 1: Species/Creature Designer
**Found In:** Campfire (Species Module), World Anvil (Species Template), Seventh Sanctum, LitRPG Adventures

**Industry Features:**
| Feature | Campfire | World Anvil | Seventh Sanctum |
|---------|----------|-------------|-----------------|
| Physical attributes | ✅ | ✅ | ✅ |
| Behavior patterns | ✅ | ✅ | ❌ |
| Habitat/biome | ✅ | ✅ | ✅ |
| Diet/ecology | ✅ | ✅ | ❌ |
| Life cycle | ✅ | ✅ | ❌ |
| Reproduction | ✅ | ✅ | ❌ |
| Intelligence level | ✅ | ✅ | ✅ |
| Magical properties | ✅ | ✅ | ✅ |
| Cultural significance | ✅ | ✅ | ❌ |
| Evolutionary history | ❌ | ✅ | ❌ |
| Random generation | ❌ | ✅ | ✅ |

**We Have:** Age Calculator (aging curves only)
**Gap Level:** 🔴 Critical

**Recommended Implementation:**
```typescript
interface Species {
  id: string;
  name: string;
  classification: 'sentient' | 'animal' | 'plant' | 'magical' | 'construct';

  // Physical
  physiology: {
    baseForm: string;
    size: SizeCategory;
    lifespan: LifespanCurve; // Links to Age Calculator
    senses: string[];
    locomotion: string[];
  };

  // Ecological
  ecology: {
    habitat: Biome[];
    diet: DietType;
    predators: string[];
    prey: string[];
    role: EcologicalRole;
  };

  // Cultural (for sentient)
  culture?: {
    languages: string[];
    religions: string[];
    government: GovernmentType;
    technology: TechLevel;
  };

  // Magical
  innateAbilities?: Ability[];
  magicAffinity?: MagicType[];

  // Consistency rules
  worldRules: ConsistencyRule[];
}
```

---

#### Gap 2: Culture/Civilization Designer
**Found In:** Campfire (Cultures Module), World Anvil, Chaotic Shiny, One Stop For Writers

**Industry Features:**
| Feature | Campfire | World Anvil | Chaotic Shiny |
|---------|----------|-------------|---------------|
| Customs/traditions | ✅ | ✅ | ✅ |
| Social hierarchy | ✅ | ✅ | ✅ |
| Government types | ✅ | ✅ | ✅ |
| Laws & justice | ✅ | ✅ | ✅ |
| Art & architecture | ✅ | ✅ | ❌ |
| Clothing/fashion | ✅ | ✅ | ❌ |
| Food/cuisine | ✅ | ✅ | ❌ |
| Music/entertainment | ✅ | ✅ | ❌ |
| Naming conventions | ✅ | ✅ | ✅ |
| Taboos/superstitions | ✅ | ✅ | ✅ |
| Rites of passage | ✅ | ✅ | ✅ |
| Random generation | ❌ | ✅ | ✅ |

**We Have:** Nothing
**Gap Level:** 🔴 Critical

**Recommended Implementation:**
```typescript
interface Culture {
  id: string;
  name: string;
  species: string[]; // Which species practice this culture

  // Social Structure
  social: {
    hierarchy: SocialClass[];
    government: GovernmentType;
    laws: Law[];
    familyStructure: FamilyType;
    genderRoles: GenderSystem;
  };

  // Daily Life
  lifestyle: {
    clothing: ClothingStyle[];
    cuisine: Cuisine;
    housing: ArchitectureStyle;
    occupations: Occupation[];
  };

  // Beliefs
  beliefs: {
    religions: string[]; // Links to Religion entities
    superstitions: string[];
    taboos: string[];
    values: string[];
  };

  // Expression
  expression: {
    language: string; // Links to Conlang
    artForms: string[];
    music: MusicStyle;
    literature: LiteraryTradition;
  };

  // Ceremonies
  ceremonies: {
    birthRites: Ceremony;
    comingOfAge: Ceremony;
    marriage: Ceremony;
    death: Ceremony;
    holidays: Holiday[]; // Links to Calendar
  };

  // History
  history: {
    origin: string;
    majorEvents: HistoricalEvent[];
    relations: CulturalRelation[]; // With other cultures
  };
}
```

---

#### Gap 3: Religion/Pantheon Designer
**Found In:** Campfire (Religions Module), World Anvil, Chaotic Shiny

**Industry Features:**
| Feature | Campfire | World Anvil | Chaotic Shiny |
|---------|----------|-------------|---------------|
| Deity profiles | ✅ | ✅ | ✅ |
| Pantheon structure | ✅ | ✅ | ✅ |
| Creation myths | ✅ | ✅ | ✅ |
| Sacred texts | ✅ | ✅ | ❌ |
| Clergy hierarchy | ✅ | ✅ | ❌ |
| Holy sites | ✅ | ✅ | ❌ |
| Religious practices | ✅ | ✅ | ✅ |
| Schisms/sects | ✅ | ✅ | ❌ |
| Afterlife beliefs | ✅ | ✅ | ❌ |
| Divine interventions | ✅ | ✅ | ❌ |
| Religious holidays | ✅ | ✅ | ✅ |
| Random generation | ❌ | ✅ | ✅ |

**We Have:** Calendar can track holidays, but no religion system
**Gap Level:** 🔴 Critical

---

#### Gap 4: Magic/Power System Designer
**Found In:** Campfire (Magic Module), World Anvil, Seventh Sanctum

**Industry Features:**
| Feature | Campfire | World Anvil | We Have |
|---------|----------|-------------|---------|
| Magic sources | ✅ | ✅ | ❌ |
| Spell/ability registry | ✅ | ✅ | ❌ |
| Costs & limitations | ✅ | ✅ | ❌ |
| Power scaling | ✅ | ✅ | ❌ |
| Schools/disciplines | ✅ | ✅ | ❌ |
| Learning requirements | ✅ | ✅ | ❌ |
| Magical items | ✅ | ✅ | ❌ |
| Enchantment rules | ✅ | ✅ | ❌ |
| Magical creatures | ✅ | ✅ | ❌ |
| Rule enforcement | ❌ | ❌ | ⚠️ Partial |

**We Have:** Consistency Checker can validate rules, but no magic system definition
**Gap Level:** 🔴 Critical

---

#### Gap 5: Location/Settlement Designer
**Found In:** World Anvil (Settlement Template), Campfire, donjon, Watabou

**Industry Features:**
| Feature | World Anvil | Watabou | donjon |
|---------|-------------|---------|--------|
| Settlement types | ✅ | ✅ | ✅ |
| Population tracking | ✅ | ❌ | ✅ |
| District/zone mapping | ✅ | ✅ | ❌ |
| Building catalog | ✅ | ✅ | ✅ |
| Economy/trade | ✅ | ❌ | ✅ |
| Government | ✅ | ❌ | ❌ |
| Notable NPCs | ✅ | ❌ | ✅ |
| History | ✅ | ❌ | ❌ |
| Visual map gen | ❌ | ✅ | ✅ |
| 3D visualization | ❌ | ✅ | ❌ |

**We Have:** Map Visualizer (points on map, but no settlement data model)
**Gap Level:** 🔴 Critical

---

### 🟡 HIGH: Generator Systems

---

#### Gap 6: Name Generation System
**Found In:** Fantasy Name Generators (1400+ generators), Seventh Sanctum, donjon

**Industry Features:**
| Category | FNG Count | Seventh Sanctum | donjon |
|----------|-----------|-----------------|--------|
| Human names (by culture) | 200+ | ✅ | ✅ |
| Fantasy race names | 100+ | ✅ | ✅ |
| Place names | 150+ | ✅ | ✅ |
| Tavern/inn names | ✅ | ✅ | ✅ |
| Ship names | 50+ | ✅ | ❌ |
| Organization names | 30+ | ✅ | ❌ |
| Title/epithet | 20+ | ✅ | ❌ |
| Creature names | 50+ | ✅ | ❌ |
| Phonetic rules | ❌ | ❌ | ❌ |
| Culture-linked | ❌ | ❌ | ❌ |

**We Have:** Nothing
**Gap Level:** 🟡 High

**Recommended Implementation:**
```typescript
interface NameGenerator {
  // Phonetic system
  phonemes: {
    consonants: string[];
    vowels: string[];
    clusters: string[];
    forbidden: string[];
  };

  // Syllable patterns
  patterns: {
    start: string[];  // CV, CVC, V...
    middle: string[];
    end: string[];
    minSyllables: number;
    maxSyllables: number;
  };

  // Cultural rules
  cultural: {
    prefixes: { meaning: string; form: string }[];
    suffixes: { meaning: string; form: string }[];
    namingConventions: NamingConvention;
    genderMarkers?: GenderMarker[];
  };

  // Methods
  generate(options: NameOptions): string;
  generateBatch(count: number, options: NameOptions): string[];
  validateName(name: string): ValidationResult;
}
```

---

#### Gap 7: Conlang/Language System
**Found In:** Vulgarlang (industry leader)

**Vulgarlang Features:**
| Feature | Vulgarlang | We Have |
|---------|------------|---------|
| Phoneme inventory | ✅ | ❌ |
| Phonotactics | ✅ | ❌ |
| Syllable structure | ✅ | ❌ |
| Grammar rules | ✅ | ❌ |
| Word order (SOV, SVO) | ✅ | ❌ |
| Noun cases | ✅ | ❌ |
| Verb conjugation | ✅ | ❌ |
| Vocabulary (4000 words) | ✅ | ❌ |
| Etymology tracking | ✅ | ❌ |
| Spelling system | ✅ | ❌ |
| IPA support | ✅ | ❌ |
| Translator | ✅ | ❌ |
| 10 quadrillion combinations | ✅ | ❌ |

**We Have:** Nothing
**Gap Level:** 🟡 High

---

#### Gap 8: History/Timeline Generator
**Found In:** World Anvil, Chaotic Shiny, Fantasist.net, BasedLabs

**Industry Features:**
| Feature | World Anvil | Chaotic Shiny | Aeon Timeline |
|---------|-------------|---------------|---------------|
| Event generation | ✅ | ✅ | ❌ |
| Cause-effect chains | ❌ | ✅ | ✅ |
| Era/period markers | ✅ | ✅ | ✅ |
| Character lifelines | ✅ | ❌ | ✅ |
| Parallel timelines | ✅ | ❌ | ✅ |
| Event dependencies | ❌ | ✅ | ✅ |
| Random event types | ✅ | ✅ | ❌ |
| Visual timeline | ✅ | ❌ | ✅ |

**We Have:** Calendar (events), Cascade Simulator (cause-effect), but no history generator
**Gap Level:** 🟡 High

---

#### Gap 9: Ecology/Biome System
**Found In:** World Anvil, Azgaar FMG, Getz Model guides

**Industry Features:**
| Feature | World Anvil | Azgaar FMG | We Have |
|---------|-------------|------------|---------|
| Biome definitions | ✅ | ✅ | ❌ |
| Climate zones | ✅ | ✅ | ❌ |
| Flora catalog | ✅ | ❌ | ❌ |
| Fauna catalog | ✅ | ❌ | ❌ |
| Food chains | ✅ | ❌ | ❌ |
| Resource distribution | ✅ | ✅ | ❌ |
| Terrain generation | ❌ | ✅ | ✅ |
| Climate simulation | ❌ | ✅ | ❌ |

**We Have:** Map Visualizer has terrain generation
**Gap Level:** 🟡 High

---

#### Gap 10: Economy/Trade System
**Found In:** World Anvil, guides (Worldbuilding Workshop, Lost Kingdom)

**Industry Features:**
| Feature | Guides Recommend | We Have |
|---------|------------------|---------|
| Currency system | ✅ | ❌ |
| Resource types | ✅ | ❌ |
| Trade routes | ✅ | ⚠️ Map paths |
| Supply/demand | ✅ | ❌ |
| Guild systems | ✅ | ❌ |
| Price fluctuation | ✅ | ❌ |
| Economic types | ✅ | ❌ |
| Taxation | ✅ | ❌ |

**We Have:** Map paths can show trade routes
**Gap Level:** 🟡 High

---

### 🟠 MEDIUM: Visual & Reference Systems

---

#### Gap 11: Heraldry/Symbol Designer
**Found In:** Armoria, CoaMaker, Fantasy Name Generators

**Industry Features:**
| Feature | Armoria | CoaMaker | FNG |
|---------|---------|----------|-----|
| Shield shapes | ✅ | ✅ | ✅ |
| Charges/symbols | ✅ | ✅ | ✅ |
| Color schemes | ✅ | ✅ | ✅ |
| Tincture rules | ✅ | ❌ | ❌ |
| Crest elements | ✅ | ✅ | ✅ |
| Motto support | ✅ | ✅ | ❌ |
| SVG export | ✅ | ✅ | ❌ |
| Random generation | ✅ | ✅ | ✅ |

**We Have:** Nothing
**Gap Level:** 🟠 Medium

---

#### Gap 12: Family Tree/Lineage System
**Found In:** World Anvil (Bloodlines), Roll for Fantasy, mcdemarco.net

**Industry Features:**
| Feature | World Anvil | Roll for Fantasy | We Have |
|---------|-------------|------------------|---------|
| Parent-child links | ✅ | ✅ | ❌ |
| Marriage tracking | ✅ | ✅ | ❌ |
| Dynasty view | ✅ | ✅ | ❌ |
| Generation numbering | ✅ | ✅ | ❌ |
| Inheritance rules | ✅ | ❌ | ❌ |
| Visual tree | ✅ | ✅ | ❌ |
| Random generation | ❌ | ✅ | ❌ |
| Timeline integration | ✅ | ❌ | ❌ |

**We Have:** Nothing (Relationship Engine would cover this)
**Gap Level:** 🟠 Medium (covered by Relationship Engine gap)

---

#### Gap 13: Item/Artifact Registry
**Found In:** Campfire (Items Module), World Anvil, donjon (Magic Shop)

**Industry Features:**
| Feature | Campfire | World Anvil | donjon |
|---------|----------|-------------|--------|
| Item categories | ✅ | ✅ | ✅ |
| Magical properties | ✅ | ✅ | ✅ |
| Rarity system | ✅ | ✅ | ✅ |
| Value/price | ✅ | ✅ | ✅ |
| History/provenance | ✅ | ✅ | ❌ |
| Current owner | ✅ | ✅ | ❌ |
| Visual attachment | ✅ | ✅ | ❌ |
| Random generation | ❌ | ✅ | ✅ |

**We Have:** Nothing
**Gap Level:** 🟠 Medium

---

#### Gap 14: Astronomy/Cosmology System
**Found In:** RanGen (Solar System), Atomic Rockets, Planet Construction Kit

**Industry Features:**
| Feature | RanGen | Atomic Rockets | We Have |
|---------|--------|----------------|---------|
| Star types | ✅ | ✅ | ❌ |
| Planet generation | ✅ | ✅ | ❌ |
| Moon systems | ✅ | ✅ | ⚠️ Calendar |
| Orbital mechanics | ❌ | ✅ | ❌ |
| Habitable zones | ❌ | ✅ | ❌ |
| Day/night cycles | ❌ | ✅ | ⚠️ Calendar |
| Season calculation | ❌ | ✅ | ⚠️ Calendar |
| Binary systems | ✅ | ✅ | ❌ |

**We Have:** Calendar has moons and seasons
**Gap Level:** 🟠 Medium

---

#### Gap 15: Technology/Era Progression
**Found In:** Civ Tech Tree datasets, Chaotic Shiny (Civilization Generator)

**Industry Features:**
| Feature | Civ Model | Chaotic Shiny | We Have |
|---------|-----------|---------------|---------|
| Tech eras | ✅ | ✅ | ❌ |
| Prerequisites | ✅ | ❌ | ❌ |
| Discovery events | ✅ | ✅ | ❌ |
| Societal impact | ✅ | ✅ | ❌ |
| Alternative paths | ✅ | ❌ | ❌ |
| Magitech integration | ❌ | ✅ | ❌ |

**We Have:** Nothing
**Gap Level:** 🟠 Medium

---

### 🟢 ENHANCEMENT: Wiki & Export Systems

---

#### Gap 16: Wiki/Encyclopedia System
**Found In:** World Anvil, LegendKeeper, Kanka

**Industry Features:**
| Feature | World Anvil | LegendKeeper | Kanka |
|---------|-------------|--------------|-------|
| Article templates | 28+ | ✅ | 20+ |
| Auto-linking | ✅ | ✅ | ✅ |
| @mentions | ✅ | ✅ | ✅ |
| Inline creation | ✅ | ✅ | ❌ |
| Categories/tags | ✅ | ✅ | ✅ |
| Search (3 chars) | ✅ | ✅ | ✅ |
| Secrets/spoilers | ✅ | ✅ | ✅ |
| Public sharing | ✅ | ✅ | ✅ |
| Themes (20+) | ✅ | ❌ | ❌ |
| Export (HTML/JSON) | ✅ | ✅ | ✅ |

**We Have:** Story Bible (AI-focused, not wiki-style)
**Gap Level:** 🟢 Enhancement

---

#### Gap 17: Collaborative Whiteboards
**Found In:** LegendKeeper

**Features:**
- Freeform canvas
- Flow charts
- Relationship visualization
- Wiki element integration
- Real-time collaboration

**We Have:** Nothing
**Gap Level:** 🟢 Enhancement

---

## PRIORITY IMPLEMENTATION ORDER

### Phase 1: Core Worldbuilding (Highest Impact)
| Priority | Gap | Reason |
|----------|-----|--------|
| 1 | **Species/Creature Designer** | Foundation for all life in world |
| 2 | **Culture/Civilization Designer** | Defines societies |
| 3 | **Religion/Pantheon Designer** | Belief systems drive conflict |
| 4 | **Magic/Power System Designer** | Fantasy essential |
| 5 | **Location/Settlement Designer** | Where stories happen |

### Phase 2: Generator Systems
| Priority | Gap | Reason |
|----------|-----|--------|
| 6 | **Name Generation System** | Universal need |
| 7 | **History/Timeline Generator** | World depth |
| 8 | **Ecology/Biome System** | Environmental realism |
| 9 | **Economy/Trade System** | Drives politics |

### Phase 3: Specialized Systems
| Priority | Gap | Reason |
|----------|-----|--------|
| 10 | **Conlang/Language System** | Immersion tool |
| 11 | **Item/Artifact Registry** | Plot devices |
| 12 | **Heraldry/Symbol Designer** | Visual worldbuilding |
| 13 | **Astronomy/Cosmology** | Sci-fi/hard fantasy |
| 14 | **Technology Progression** | Era management |

### Phase 4: Platform Features
| Priority | Gap | Reason |
|----------|-----|--------|
| 15 | **Wiki/Encyclopedia** | Organization |
| 16 | **Family Tree System** | Dynasties (via Relationship Engine) |
| 17 | **Collaborative Whiteboards** | Team projects |

---

## COMPETITIVE ADVANTAGES TO MAINTAIN

### Unique Features (No Competitor Has)
| Feature | Our Engine | Competitor Gap |
|---------|------------|----------------|
| Predictive Narrative | Causal graphs | None have this |
| Cascade Simulation | Butterfly effects | None have this |
| Non-Human Aging | Species curves | Basic or none |
| 300M+ Word Scale | Designed for epic | Most cap at novel-length |
| Consistency Validation | Automated | Manual only |
| Semantic Search | Embeddings | Basic text search |
| Writing Craft Analysis | Emotional arcs | Basic metrics |

### Integration Opportunities
Our existing engines create unique synergies:

1. **Species + Age Calculator** = Lifespan-aware species
2. **Culture + Calendar** = Holiday integration
3. **Religion + Calendar** = Religious observances
4. **Magic + Consistency Checker** = Rule enforcement
5. **Location + Map Visualizer** = Visual settlements
6. **History + Cascade Simulator** = Causal history
7. **Economy + Map Visualizer** = Trade route visualization

---

## ARCHITECTURE RECOMMENDATION

### Unified Entity System
```typescript
// All worldbuilding entities share base
interface WorldEntity {
  id: string;
  type: EntityType;
  name: string;
  aliases: string[];
  description: string;
  tags: string[];

  // Cross-references
  references: EntityReference[];

  // Temporal validity
  existsFrom?: TimelinePosition;
  existsUntil?: TimelinePosition;

  // Consistency rules
  rules: ConsistencyRule[];

  // AI context
  aiContext: string; // For Story Bible
}

type EntityType =
  | 'species' | 'culture' | 'religion' | 'magic_system'
  | 'location' | 'settlement' | 'item' | 'organization'
  | 'language' | 'technology' | 'biome' | 'celestial_body';
```

### Generator Framework
```typescript
interface Generator<T> {
  // Configuration
  config: GeneratorConfig;

  // Generation
  generate(options?: GenerateOptions): T;
  generateBatch(count: number, options?: GenerateOptions): T[];

  // Seeding for reproducibility
  seed(value: number): void;

  // Cultural/thematic presets
  applyPreset(preset: string): void;

  // Validation
  validate(item: T): ValidationResult;
}
```

---

## SOURCES

### Major Platforms
- [World Anvil](https://www.worldanvil.com/)
- [World Anvil Templates](https://www.worldanvil.com/features/worldbuilding-templates)
- [Campfire Writing](https://www.campfirewriting.com/worldbuilding-tools)
- [LegendKeeper](https://www.legendkeeper.com/features/)
- [Kanka](https://kanka.io/)
- [One Stop For Writers](https://onestopforwriters.com/features-tools)

### Generators
- [Azgaar's Fantasy Map Generator](https://azgaar.github.io/Fantasy-Map-Generator/)
- [Watabou Procgen Arcana](https://watabou.github.io/)
- [donjon RPG Tools](https://donjon.bin.sh/)
- [Seventh Sanctum](https://www.seventhsanctum.com/)
- [Fantasy Name Generators](https://www.fantasynamegenerators.com/)
- [Chaotic Shiny](https://www.chaoticshiny.com/)
- [Vulgarlang](https://www.vulgarlang.com/)

### Specialized Tools
- [Armoria Heraldry](https://azgaar.github.io/Armoria/)
- [CoaMaker](https://coamaker.com/)
- [Aeon Timeline](https://www.aeontimeline.com/)
- [RanGen Solar System](https://www.rangen.co.uk/world/solargen.php)

### Guides & Resources
- [Atomic Rockets - Worldbuilding](https://www.projectrho.com/public_html/rocket/worldbuilding.php)
- [Worldbuilding Workshop](https://worldbuildingworkshop.com/)
- [Imagine Forest](https://www.imagineforest.com/)
