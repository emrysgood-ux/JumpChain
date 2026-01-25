# Epic Fiction Architect: Comprehensive Improvement Recommendations

## Executive Summary

This document presents a deep-dive analysis of potential improvements for Epic Fiction Architect based on extensive research into:
- Fiction writing software trends and competitor features
- AI writing assistant innovations
- Worldbuilding and narrative tools
- Writing quality analysis and NLP techniques
- Collaborative and productivity features
- Web serial and fanfiction community needs
- Academic research on narrative generation and coherence

---

## Table of Contents

1. [AI & LLM Enhancements](#1-ai--llm-enhancements)
2. [Story Coherence & Consistency](#2-story-coherence--consistency)
3. [Worldbuilding System Improvements](#3-worldbuilding-system-improvements)
4. [Writing Quality Analysis](#4-writing-quality-analysis)
5. [Timeline & Narrative Structure](#5-timeline--narrative-structure)
6. [Character Management](#6-character-management)
7. [Productivity & Gamification](#7-productivity--gamification)
8. [Export & Publishing](#8-export--publishing)
9. [Community & Platform Features](#9-community--platform-features)
10. [Technical Architecture](#10-technical-architecture)
11. [JumpChain-Specific Enhancements](#11-jumpchain-specific-enhancements)
12. [Interactive Fiction Support](#12-interactive-fiction-support)
13. [Multimedia Integration](#13-multimedia-integration)

---

## 1. AI & LLM Enhancements

### 1.1 Advanced RAG (Retrieval Augmented Generation) Implementation

**Current State:** The tool has an Embeddings Engine and Story Bible for AI context.

**Recommended Improvements:**

#### Hybrid Search Strategy
- Implement hybrid search combining keyword-based (TF-IDF) and semantic search (embeddings)
- This addresses different query types - sometimes exact matches matter, sometimes semantic similarity
- Source: [Prompt Engineering Guide - RAG](https://www.promptingguide.ai/research/rag)

#### Recursive Retrieval
- Implement recursive retrieval that starts with small semantic chunks and progressively retrieves larger context windows
- Balances efficiency with context richness for AI prompts
- Source: [AWS - What is RAG](https://aws.amazon.com/what-is/retrieval-augmented-generation/)

#### StepBack Prompting
- Add abstraction layer that produces concepts and principles to guide AI reasoning
- Leads to better-grounded responses in creative writing context
- Particularly useful for maintaining thematic consistency

#### Context Chunking Strategies
- **Sentence-level:** For dialogue and short prose
- **Paragraph-level:** For scene descriptions
- **Scene-level:** For plot continuity checks
- **Chapter-level:** For arc consistency

### 1.2 Multi-Model Support (NovelCrafter Approach)

**Recommendation:** Allow users to connect multiple AI providers:
- OpenAI (GPT-4, GPT-4o)
- Anthropic (Claude Opus, Sonnet, Haiku)
- Google (Gemini)
- Meta (Llama via local hosting)
- Local models (Ollama, LM Studio)

**Benefits:**
- Users can optimize cost by using cheaper models for simple tasks
- Different models excel at different creative tasks
- Privacy-conscious users can run local models
- Source: [Sudowrite vs NovelCrafter Comparison](https://sudowrite.com/blog/sudowrite-vs-novelcrafter-the-ultimate-ai-showdown-for-novelists/)

### 1.3 Purpose-Built Writing Model Integration

**Research Finding:** Sudowrite's "Muse" model, trained specifically on fiction, outperforms general-purpose models for creative writing.

**Recommendations:**
- Consider fine-tuning options for specialized writing tasks
- Implement model selection based on task type:
  - Dialogue generation → conversational models
  - Prose description → literary models
  - Technical exposition → general models

### 1.4 Character Voice Consistency Engine

**Problem:** AI often blends character voices, breaking immersion.

**Solution:** Implement a Character Voice Profile System:
```
Character: Marcus
- Speech patterns: Formal, uses archaic terms
- Vocabulary level: Academic
- Common phrases: ["Indeed," "As it were," "One might argue"]
- Emotional expression: Reserved, subtle
- POV considerations: Third-person limited
```

**Implementation:**
- Store detailed voice profiles in the Codex
- Inject character profiles into AI prompts automatically
- Validate generated dialogue against character profiles
- Flag inconsistencies for author review
- Source: [QuillBot AI Dialogue Generator](https://quillbot.com/ai-writing-tools/ai-dialogue-generator)

### 1.5 Show-Don't-Tell Enforcement

**Research Finding:** LLMs consistently struggle with show-don't-tell principle.

**Recommendation:** Implement a specialized prompt engineering layer that:
- Detects "telling" passages (emotional state declarations, direct exposition)
- Suggests sensory alternatives
- Rewrites passages to show emotions through actions, dialogue, physical sensations
- Source: [Prompt Engineering for Fiction Writers](https://aomukai.com/2024/01/14/prompt-engineering-for-fiction-writers/)

---

## 2. Story Coherence & Consistency

### 2.1 SCORE Framework Implementation

**Research Breakthrough:** The SCORE (Story Coherence and Retrieval Enhancement) framework achieves:
- 23.6% higher coherence than baseline GPT models
- 89.7% emotional consistency
- 41.8% fewer hallucinations

**Components to Implement:**

#### Dynamic State Tracking
- Monitor objects and characters via symbolic logic
- Track: location, possession, knowledge state, emotional state, relationships
- Alert when AI generates contradictions

#### Hierarchical Summarization
- Implement episode-level summaries
- Scene → Chapter → Arc → Book hierarchy
- Use for long-range context retrieval

#### Hybrid Retrieval System
- Combine TF-IDF (exact term matching) with semantic embeddings
- Weight by recency and relevance
- Source: [arXiv SCORE Paper](https://arxiv.org/html/2503.23512v1)

### 2.2 Enhanced Consistency Checking

**Current State:** Consistency Checker exists for contradictions.

**Recommended Enhancements:**

#### Temporal Consistency
- Ensure events happen in logical order
- Flag impossible sequences (character in two places simultaneously)
- Track time passage between scenes

#### Spatial Consistency
- Verify locations and movements make sense
- Integrate with map system for validation
- Track travel times between locations

#### Character Knowledge Tracking
- Track what each character knows/doesn't know
- Flag when characters act on information they shouldn't have
- Implement "dramatic irony" tagging for intentional exceptions

#### Entity Attribute Tracking
- Physical descriptions (eye color, height, scars)
- Relationships status changes
- Power levels/abilities progression

### 2.3 Coreference Resolution Enhancement

**Technical Need:** Better tracking of pronouns and references throughout narrative.

**Implementation:**
- Use BookNLP or similar literary NLP tools
- Build character mention graphs
- Track pronoun resolution confidence
- Flag ambiguous references for author clarification

---

## 3. Worldbuilding System Improvements

### 3.1 Enhanced Magic System Designer

**Current State:** Magic System Designer with rules and limitations.

**Recommended Enhancements Based on Sanderson's Laws:**

#### First Law Implementation
- Track "reader understanding" score for each magic element
- Higher understanding = more suitable for solving conflicts
- Warn when using poorly-explained magic as plot resolution

#### Second Law: Limitations Tracker
- Emphasize limitations over powers in UI
- Cost/consequence tracking for each ability
- "Interesting failure modes" suggestions
- Source: Brandon Sanderson's Laws of Magic

#### Third Law: Expansion Alerts
- Detect when new powers are being added
- Prompt: "Have you fully explored existing abilities?"
- Suggest combinations of existing powers before adding new ones

### 3.2 ConlangCrafter Integration

**Research Finding:** ConlangCrafter uses LLMs for automatic constructed language generation.

**Recommended Features:**
- Phonology generation (plausible sound inventories)
- Morphology/syntax patterns
- Lexicon constrained by phonological rules
- Integration with existing Conlang Engine
- Source: [Vulgarlang - Conlang Generator](https://www.vulgarlang.com/)

### 3.3 Culture Coherence Validator

**Recommendation:** AI-powered culture consistency checking:
- Economic system → common professions alignment
- Religious beliefs → naming conventions
- Technology level → available tools/weapons
- Climate/geography → clothing, architecture, food

### 3.4 Ecology Simulation

**Enhancement to Ecology System:**
- Food chain stability calculations
- Population dynamics modeling
- Environmental change cascades
- Seasonal variations
- Migration pattern generation

---

## 4. Writing Quality Analysis

### 4.1 Pacing Analysis Engine

**Research Finding:** Pacing is about pressure control, not just speed.

**Implementation Features:**

#### Sentence Rhythm Analysis
- Short sentences → tension, urgency, action
- Long sentences → reflection, description, calm
- Analyze rhythm patterns per scene
- Suggest rhythm adjustments based on scene type
- Source: [Mastering Pacing - Sudowrite](https://sudowrite.com/blog/mastering-pacing-how-to-control-your-storys-rhythm-and-write-pacing-like-a-pro/)

#### Scene-Sequel Pattern Detection
- Detect Scene (Goal → Conflict → Disaster)
- Detect Sequel (Reaction → Dilemma → Decision)
- Alert if story is "all Scene" (breathless) or "all Sequel" (slow)
- Visualize Scene/Sequel rhythm across chapters

#### Tension Curve Visualization
- Graph tension levels across the narrative
- Compare to expected curves for genre (thriller vs literary)
- Identify flat spots and suggest tension injection points

### 4.2 Prose Style Analysis

**New Engine Recommendation:** StyleAnalyzer

**Features:**
- Voice consistency detection across chapters
- POV slip detection (especially first → third person)
- Tense consistency checking
- Passive voice percentage analysis
- Cliché density scoring
- Unique phrase identification ("author fingerprint")

### 4.3 Enhanced Writing Rules Engine

**Current State:** Detects banned patterns and phrases.

**Recommended Additions:**

#### Genre-Specific Rule Sets
- Romance: emotional beat requirements, chemistry markers
- Thriller: chapter ending hooks, cliffhanger detection
- Fantasy: magic system consistency, world detail balance
- Literary: theme reinforcement, symbolic pattern tracking

#### Configurable Severity Levels
- Error: Must fix (POV slips, tense changes)
- Warning: Should review (adverb overuse, clichés)
- Suggestion: Consider (sentence variety, rhythm)

### 4.4 Emotional Arc Analyzer

**Enhancement:**
- Track protagonist's emotional state scene-by-scene
- Visualize emotional journey
- Compare to expected emotional beats for story structure
- Detect emotional whiplash (too rapid changes)
- Ensure satisfying emotional resolution

---

## 5. Timeline & Narrative Structure

### 5.1 Story Structure Templates

**Current State:** StoryStructureEngine with Save the Cat, Hero's Journey, etc.

**Recommended Additions:**

#### Additional Structures
- **Dan Harmon's Story Circle** (8-step simplified Hero's Journey)
- **Kishōtenketsu** (4-act East Asian structure without conflict)
- **Seven-Point Story Structure** (Dan Wells)
- **Fichtean Curve** (crisis-driven)
- **In Medias Res** templates
- Source: [Save the Cat Beat Sheet - Kindlepreneur](https://kindlepreneur.com/save-the-cat-beat-sheet/)

#### Beat Sheet Percentage Tracking
- Show where beats should fall (e.g., "Midpoint at 50%")
- Alert when beats are misplaced
- Flexible percentage ranges for different genres

### 5.2 Framing Device Support

**Research Finding:** Frame stories require special structural support.

**New Features:**
- Prologue/Epilogue management
- Nested narrative tracking (Chinese box narratives)
- Interlude insertion points
- Frame narrator vs. story narrator distinction
- Unreliable narrator markers
- Dream vision / false document tagging
- Source: [What Is a Framing Device - Fictionary](https://fictionary.co/journal/framing-device/)

### 5.3 Subplot Coordination

**Enhancement to Timeline Management:**
- Parallel subplot timelines
- Intersection point identification
- Subplot resolution tracking
- Thematic link mapping between subplots
- Pacing coordination across subplots

### 5.4 Multi-POV Timeline View

**For stories with multiple viewpoint characters:**
- Individual character timelines
- Overlay view showing chronological order
- "What does Character X know at this point?"
- POV chapter assignment recommendations

---

## 6. Character Management

### 6.1 Character Relationship Mapping

**Research Finding:** Relationship maps are essential for complex narratives.

**Recommended Features:**
- Visual relationship graph (nodes = characters, edges = relationships)
- Relationship type classification:
  - Family (parent, sibling, spouse)
  - Professional (mentor, rival, colleague)
  - Emotional (friend, enemy, love interest)
- Relationship evolution tracking over time
- Conflict web visualization
- Faction/group clustering
- Source: [Milanote Character Relationship Map](https://milanote.com/templates/creative-writing/character-relationship-map)

### 6.2 Character Arc Templates

**Pre-built arc patterns:**
- Positive change arc (flaw → growth → transformation)
- Negative change arc (fall from grace)
- Flat arc (steadfast character changes others)
- Redemption arc
- Corruption arc
- Coming-of-age arc

**Tracking Features:**
- Arc beat milestones
- "Ghost" (wound from past) tracking
- "Lie" (false belief) and "Truth" tracking
- Want vs. Need distinction

### 6.3 Dialogue Fingerprinting

**AI Feature:**
- Analyze existing dialogue to extract patterns
- Generate character-specific vocabulary lists
- Detect dialogue that sounds "out of character"
- Suggest character-appropriate alternatives

### 6.4 Character Generation Pipeline Enhancement

**Current State:** AutoCharacterPipeline exists.

**Recommended Additions:**
- Trait randomization with coherence constraints
- Background generation based on world parameters
- Automatic motivation/goal generation
- Family tree generator
- Backstory conflict generator

---

## 7. Productivity & Gamification

### 7.1 Writing Streak System

**Research Finding:** Gamification significantly increases writing consistency.

**Features to Implement:**
- Daily writing streaks
- Streak freeze days (for emergencies)
- Milestone badges (7 days, 30 days, 100 days, 365 days)
- Streak recovery challenges

### 7.2 Word Count Gamification

**Features:**
- Daily/weekly/monthly word count goals
- Progress bars with satisfying animations
- XP/level system based on consistent writing
- Achievement badges:
  - "First Chapter Complete"
  - "10K Words"
  - "First Draft Done"
  - "Novel-Length Achievement" (50K, 80K, 100K+)

### 7.3 Writing Sprints

**Features:**
- Timed writing sessions (15, 25, 45 minutes)
- Distraction-free mode
- Post-sprint statistics
- Sprint history tracking
- Community sprint challenges (for future)

### 7.4 NaNoWriMo Integration

**For November Novel Writing Month:**
- 50K word goal tracking
- Daily pace calculator
- Catch-up projections
- NaNoWriMo-specific achievements

### 7.5 Smart Goal Recommendations

**AI-powered:**
- Analyze historical writing patterns
- Suggest realistic daily goals
- Identify optimal writing times
- Predict project completion dates

---

## 8. Export & Publishing

### 8.1 Enhanced Compile Engine

**Current State:** Export to DOCX, EPUB, PDF, HTML, Markdown.

**Recommended Enhancements:**

#### Professional Formatting Presets
- KDP (Kindle Direct Publishing) specifications
- IngramSpark print specifications
- Smashwords formatting guidelines
- Apple Books requirements

#### Style Customization
- Scene break styles (ornamental, numbered, simple)
- Chapter heading fonts and styles
- Drop caps for chapter openings
- Running headers/footers

### 8.2 Platform-Specific Export

**New Export Targets:**
- **Royal Road:** Chapter formatting, author notes sections
- **Archive of Our Own:** Tag suggestion, content warnings, work skin support
- **Wattpad:** Part/chapter structure, inline comments support
- **Kindle Vella:** Episode structure, serialization optimization
- Source: [Royal Road Analytics](https://www.royalroad.com/support/knowledgebase/110)

### 8.3 Series Bible Export

**For multi-book projects:**
- Character reference sheets
- World glossary
- Timeline summary
- Map exports
- Relationship diagrams

### 8.4 Audiobook Preparation

**Features:**
- Text-to-speech preview integration
- Pronunciation guide generation
- Sound effect cue markers
- Chapter timestamp generation
- Integration with AI TTS services (ElevenLabs, PlayAI)
- Source: [ElevenLabs Audiobooks](https://elevenlabs.io/use-cases/audiobooks)

---

## 9. Community & Platform Features

### 9.1 AO3-Inspired Tagging System

**Research Finding:** AO3's folksonomy tagging is powerful for discovery.

**Features to Implement:**
- User-defined tags with autocomplete
- Tag categories:
  - Warnings (content alerts)
  - Fandoms
  - Characters
  - Relationships (A/B for romantic, A & B for platonic)
  - Additional tags (tropes, moods, themes)
- Tag wrangling system for synonyms
- Source: [AO3 Tagging System - Fanlore](https://fanlore.org/wiki/AO3_Tagging_System)

### 9.2 Reader Analytics Dashboard

**Modeled on Royal Road Premium:**
- Rating distribution graphs
- Rating timeline with chapter releases
- Pageviews per day/chapter
- Reader activity per chapter
- Traffic referrer analysis
- User retention graphs (drop-off points)
- Source: [Royal Road Analytics](https://www.royalroad.com/support/knowledgebase/110)

### 9.3 Beta Reader Management

**Features:**
- Invite beta readers with limited access
- Comment collection and organization
- Feedback request prompts per chapter
- Version comparison (what beta readers saw vs. current)

### 9.4 Writing Group Support

**Future Feature:**
- Shared project libraries
- Collaborative worldbuilding
- Writing challenge coordination
- Group word count competitions

---

## 10. Technical Architecture

### 10.1 SQLite FTS5 Optimization

**Current State:** Uses SQLite with FTS5 for full-text search.

**Recommended Optimizations:**

#### Tokenizer Selection
- Use `porter` tokenizer for stemming (run → running → ran all match "run")
- Consider `trigram` for partial matching in names
- Source: [SQLite FTS5 Extension](https://sqlite.org/fts5.html)

#### Index Optimization
- Implement periodic index optimization (`INSERT INTO fts_table(fts_table) VALUES('optimize')`)
- Monitor index integrity
- Source: [SQLite FTS5 Guide - Medium](https://medium.com/@johnidouglasmarangon/full-text-search-in-sqlite-a-practical-guide-80a69c3f42a4)

#### Relevance Ranking
- Implement BM25 ranking for search results
- Weight columns differently (title > content)
- Add recency boost for recent scenes

### 10.2 Tauri 2.0 Desktop App Implementation

**Current State:** Designed for Tauri 2.0 but not implemented.

**Implementation Recommendations:**

#### Cross-Platform Targets
- Windows, macOS, Linux (desktop)
- iOS and Android (mobile) - Tauri 2.0 feature

#### Performance Benefits
- App size under 10MB (vs. Electron's 100MB+)
- Memory usage ~30-40MB idle
- Native system integration
- Source: [Tauri vs Electron 2025](https://www.raftlabs.com/blog/tauri-vs-electron-pros-cons/)

#### Security
- Principle of least privilege for OS API calls
- Explicit permission system
- Security audit considerations

### 10.3 CRDT Implementation for Collaboration

**Current State:** Yjs support planned.

**Recommendations:**

#### Implementation Options
- **Yjs:** High performance, widely adopted
- **Automerge:** JSON-like API, good for complex data
- Consider hybrid: Yjs for text, custom CRDTs for metadata

#### Sync Architecture
- Local-first with optional cloud sync
- Peer-to-peer sync option
- Conflict visualization for manual resolution when needed

### 10.4 Embedding Model Selection

**Current State:** Uses @xenova/transformers for local embeddings.

**Recommendations:**
- Offer multiple embedding model options:
  - `all-MiniLM-L6-v2` (fast, good for general text)
  - `all-mpnet-base-v2` (better quality, slower)
  - `sentence-transformers` models fine-tuned on fiction
- Allow API-based embeddings (OpenAI, Cohere) as option
- Source: [Pinecone - Vector Similarity](https://www.pinecone.io/learn/vector-similarity/)

---

## 11. JumpChain-Specific Enhancements

### 11.1 Jump Document Parser

**Feature:** Import official Jump documents (PDFs/text) and automatically:
- Extract perks, items, drawbacks
- Parse point costs
- Identify companion options
- Build purchasable options database

### 11.2 Build Planner

**Features:**
- Point budget tracking (typically 1000 CP per jump)
- Drawback point additions
- Perk prerequisite tracking
- "What can I afford?" suggestions

### 11.3 Power Synergy Explorer

**Enhancement to Power Synergy Engine:**
- AI-powered synergy suggestions
- "Broken combo" warnings
- Cross-jump synergy tracking
- Narrative justification generator for combinations

### 11.4 Chain Failure Tracking

**For stories with consequences:**
- Death/failure conditions per jump
- Chain failure (permanent death) tracking
- Resurrection/extra life item management
- "Close call" narrative beats

### 11.5 Gauntlet Mode Support

**For limited-power scenarios:**
- Power lockout tracking
- Gauntlet-specific inventories
- Completion rewards tracking

### 11.6 Spark/Benefactor System

**End-game tracking:**
- Spark achievement conditions
- Post-spark power levels
- Benefactor role-play support
- New jumper creation tools

---

## 12. Interactive Fiction Support

### 12.1 Branching Narrative Export

**Export to Interactive Fiction Formats:**
- **Twine** (HTML-based IF)
- **Ink** (Inkle's narrative scripting language)
- **ChoiceScript** (Choice of Games format)
- **Ren'Py** (Visual novel engine)
- Source: [Twinery.org](https://twinery.org/)

### 12.2 Branch Visualization

**Features:**
- Visual branching tree view
- Branch length comparison
- "True path" designation
- Dead-end warnings
- Branch convergence points

### 12.3 Variable Tracking

**For interactive stories:**
- Reader state variables
- Flag/boolean tracking
- Numerical stat management
- Inventory systems

### 12.4 Choice Design Assistant

**AI-powered:**
- Suggest meaningful choices (not just flavor)
- Identify false choices (all lead to same outcome)
- Balance branch content
- Source: [Ink Web Tutorial](https://www.inklestudios.com/ink/web-tutorial/)

---

## 13. Multimedia Integration

### 13.1 AI Image Generation Integration

**For character portraits and scene illustrations:**

#### Recommended Integrations
- **Midjourney API** (highest quality, character consistency via 'cref')
- **DALL-E 3** (best text rendering, ChatGPT integration)
- **Stable Diffusion** (local/free, batch generation)
- Source: [AI Illustration Tools Review - Lovart](https://www.lovart.ai/blog/ai-illustration-tools-review)

#### Features
- Character portrait generation from descriptions
- Scene visualization
- Map illustration
- Consistent character appearance across images

### 13.2 Audio Integration

**Text-to-Speech:**
- Chapter narration preview
- Character voice assignment
- Multiple voice support for dialogue
- Export to audiobook format
- Source: [novelistAI TTS](https://novelistai.com/features/audiobook)

### 13.3 Map Enhancement

**Current State:** ASCII, SVG, Leaflet/OpenStreetMap rendering.

**Recommended Additions:**
- AI-assisted map generation from descriptions
- Height map / topography support
- Political boundary layers
- Historical map versions (show border changes over time)
- Travel route planning with time calculations
- Source: [Kumu - Relationship Mapping](https://kumu.io/)

---

## Priority Implementation Matrix

### High Impact, Lower Effort
1. Story structure templates expansion (Save the Cat variations)
2. Writing streak/gamification system
3. Character relationship visualization
4. FTS5 optimization with Porter stemmer
5. Platform-specific export presets

### High Impact, Higher Effort
1. SCORE framework implementation for coherence
2. Advanced RAG with hybrid search
3. Multi-model AI support
4. Tauri desktop app
5. Interactive fiction export

### Medium Impact, Lower Effort
1. Pacing rhythm analyzer
2. Writing sprint mode
3. Beta reader management
4. Enhanced dialogue fingerprinting
5. Jump document parser

### Medium Impact, Higher Effort
1. CRDT collaborative editing
2. AI image generation integration
3. Reader analytics dashboard
4. ConlangCrafter integration
5. TTS audiobook preview

---

## Research Sources

### AI Writing Tools
- [The 11 Best AI Tools for Writing Fiction](https://blog.mylifenote.ai/the-11-best-ai-tools-for-writing-fiction-in-2026/)
- [Claude for Indie Authors](https://scribecount.com/author-resource/artificial-intelligence/claude-for-indie-authors)
- [Sudowrite vs NovelCrafter Comparison](https://sudowrite.com/blog/sudowrite-vs-novelcrafter-the-ultimate-ai-showdown-for-novelists/)
- [Best AI Writing Tools 2025 - Kindlepreneur](https://kindlepreneur.com/best-ai-writing-tools/)

### RAG & AI Research
- [RAG for LLMs - Prompt Engineering Guide](https://www.promptingguide.ai/research/rag)
- [SCORE: Story Coherence and Retrieval Enhancement](https://arxiv.org/html/2503.23512v1)
- [Awesome-Story-Generation GitHub](https://github.com/yingpengma/Awesome-Story-Generation)
- [NexusSum: Hierarchical LLM Agents for Narrative Summarization](https://arxiv.org/html/2505.24575v1)

### Writing Software
- [Aeon Timeline vs Plottr Comparison](https://slashdot.org/software/comparison/Aeon-Timeline-vs-Plottr/)
- [Royal Road Analytics](https://www.royalroad.com/support/knowledgebase/110)
- [Save the Cat Beat Sheet - Kindlepreneur](https://kindlepreneur.com/save-the-cat-beat-sheet/)
- [novelWriter - Open Source](https://github.com/vkbo/novelWriter)

### Worldbuilding & Conlangs
- [Vulgarlang Conlang Generator](https://www.vulgarlang.com/)
- [PolyGlot Language Construction Kit](https://draquet.github.io/PolyGlot/)

### Technical
- [SQLite FTS5 Extension](https://sqlite.org/fts5.html)
- [Tauri 2.0 Development](https://v2.tauri.app/start/)
- [Pinecone - Vector Similarity](https://www.pinecone.io/learn/vector-similarity/)

### Community Features
- [AO3 Tagging System - Fanlore](https://fanlore.org/wiki/AO3_Tagging_System)
- [JumpChain Community](https://jumpchain.net/)

### Multimedia
- [ElevenLabs Audiobooks](https://elevenlabs.io/use-cases/audiobooks)
- [AI Image Generator Comparison 2025](https://www.lovart.ai/blog/ai-illustration-tools-review)
- [Twine Interactive Fiction](https://twinery.org/)

---

*Document generated: January 2026*
*Research conducted for Epic Fiction Architect improvement planning*
