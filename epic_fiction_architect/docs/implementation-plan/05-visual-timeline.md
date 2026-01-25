# Visual Timeline/Graph View Specification

## Purpose

Provide interactive visualization tools for navigating and understanding complex narratives spanning 1000+ years with multiple POV characters, plot threads, and causal relationships. Enable writers to see the big picture while maintaining granular control over story elements.

## Visualization Types

### 1. Timeline View
Linear/branching visualization of events across time with character tracks

### 2. Relationship Graph
Network visualization of character relationships and their evolution

### 3. Plot Thread Graph
Causal flow diagram showing how plot threads connect and influence each other

### 4. Location Timeline
Geographic-temporal view showing where characters are over time

### 5. Scene Corkboard
Card-based view for organizing and reordering scenes

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Visualization System                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                │
│  │    Data      │     │  Rendering   │     │ Interaction  │                │
│  │   Layer      │ ──► │   Engine     │ ──► │   Handler    │                │
│  └──────────────┘     └──────────────┘     └──────────────┘                │
│         │                    │                    │                         │
│         ▼                    ▼                    ▼                         │
│  - Story bible data   - D3.js / Canvas   - Pan/zoom                        │
│  - Timeline events    - WebGL for scale  - Selection                       │
│  - Relationships      - SVG for detail   - Filtering                       │
│  - Scene metadata     - Layout engines   - Editing                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Core Interfaces

```typescript
interface VisualizationEngine {
  // Create visualization
  createVisualization(
    type: VisualizationType,
    data: VisualizationData,
    options: VisualizationOptions
  ): Visualization;

  // Update data
  updateData(visualization: Visualization, data: VisualizationData): void;

  // Export
  exportImage(visualization: Visualization, format: 'png' | 'svg' | 'pdf'): Promise<Buffer>;
  exportInteractive(visualization: Visualization): Promise<string>; // HTML
}

type VisualizationType =
  | 'timeline'
  | 'relationship-graph'
  | 'plot-thread-graph'
  | 'location-timeline'
  | 'scene-corkboard'
  | 'character-arc'
  | 'causality-map';

interface VisualizationData {
  // Time-based data
  events?: TimelineEvent[];
  dateRange?: { start: Date; end: Date };

  // Entity data
  characters?: Character[];
  locations?: Location[];
  plotThreads?: PlotThread[];

  // Relationship data
  relationships?: Relationship[];

  // Scene data
  scenes?: Scene[];
  chapters?: Chapter[];
}

interface VisualizationOptions {
  // Dimensions
  width: number;
  height: number;
  responsive: boolean;

  // Rendering
  renderer: 'svg' | 'canvas' | 'webgl';
  theme: VisualizationTheme;

  // Interaction
  interactive: boolean;
  zoomable: boolean;
  pannable: boolean;
  selectable: boolean;

  // Display
  showLabels: boolean;
  showLegend: boolean;
  showMinimap: boolean;

  // Filtering
  filters?: VisualizationFilter[];
}

interface VisualizationTheme {
  background: string;
  foreground: string;
  accent: string;

  // Entity colors
  characterColors: Record<string, string>;
  locationColors: Record<string, string>;
  plotThreadColors: Record<string, string>;

  // Fonts
  fontFamily: string;
  fontSize: {
    small: number;
    medium: number;
    large: number;
  };

  // Lines and shapes
  lineWidth: number;
  nodeSize: number;
  borderRadius: number;
}
```

## Timeline View

```typescript
interface TimelineVisualization {
  // Configuration
  config: TimelineConfig;

  // Data
  events: TimelineEvent[];
  tracks: TimelineTrack[];

  // Interaction
  onEventClick: (event: TimelineEvent) => void;
  onEventHover: (event: TimelineEvent) => void;
  onRangeSelect: (range: DateRange) => void;

  // Navigation
  zoomTo(range: DateRange): void;
  panTo(date: Date): void;
  fitToContent(): void;

  // Filtering
  setFilter(filter: TimelineFilter): void;
  highlightEvents(eventIds: string[]): void;
}

interface TimelineConfig {
  // Time scale
  scale: 'linear' | 'logarithmic' | 'adaptive';
  minScale: TimeUnit;  // e.g., 'hour', 'day', 'month', 'year', 'decade'
  maxScale: TimeUnit;

  // Tracks
  trackMode: 'character' | 'location' | 'plot-thread' | 'custom';
  trackHeight: number;
  trackSpacing: number;
  collapsibleTracks: boolean;

  // Events
  eventStyle: 'point' | 'span' | 'auto';
  eventClustering: boolean;
  clusterThreshold: number;

  // Today line / current story position
  showCurrentPosition: boolean;
  currentPositionDate?: Date;

  // Eras / periods
  showEras: boolean;
  eras?: Era[];
}

interface TimelineTrack {
  id: string;
  name: string;
  type: 'character' | 'location' | 'plot-thread' | 'custom';
  entityId?: string;
  color: string;
  collapsed: boolean;
  events: TimelineEvent[];
  subTracks?: TimelineTrack[];
}

interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  date: Date;
  endDate?: Date;  // For spans
  trackId: string;
  type: EventType;
  importance: 'minor' | 'normal' | 'major' | 'critical';

  // Links
  characters: string[];
  locations: string[];
  plotThreads: string[];
  scenes?: string[];

  // Visual
  icon?: string;
  color?: string;

  // Connections
  causedBy?: string[];  // Event IDs
  causes?: string[];    // Event IDs
}

interface Era {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  color: string;
  description?: string;
}

class TimelineRenderer {
  private svg: d3.Selection<SVGElement>;
  private xScale: d3.ScaleTime;
  private yScale: d3.ScaleBand;
  private zoom: d3.ZoomBehavior;

  render(data: TimelineVisualization): void {
    this.setupScales(data);
    this.renderTracks(data.tracks);
    this.renderEvents(data.events);
    this.renderConnections(data.events);
    this.renderAxes(data.config);
    this.setupInteraction(data);
  }

  private renderEvents(events: TimelineEvent[]): void {
    const eventGroups = this.svg.selectAll('.event')
      .data(events)
      .enter()
      .append('g')
      .attr('class', 'event')
      .attr('transform', d => `translate(${this.xScale(d.date)}, ${this.yScale(d.trackId)})`);

    // Point events
    eventGroups.filter(d => !d.endDate)
      .append('circle')
      .attr('r', d => this.getEventRadius(d))
      .attr('fill', d => d.color || this.getTrackColor(d.trackId));

    // Span events
    eventGroups.filter(d => d.endDate)
      .append('rect')
      .attr('width', d => this.xScale(d.endDate!) - this.xScale(d.date))
      .attr('height', 20)
      .attr('fill', d => d.color || this.getTrackColor(d.trackId))
      .attr('opacity', 0.7);

    // Labels
    eventGroups.append('text')
      .text(d => d.title)
      .attr('x', 10)
      .attr('y', 5)
      .attr('class', 'event-label');
  }

  private renderConnections(events: TimelineEvent[]): void {
    // Draw causal connections between events
    const connections: Connection[] = [];

    for (const event of events) {
      if (event.causes) {
        for (const causeId of event.causes) {
          const causeEvent = events.find(e => e.id === causeId);
          if (causeEvent) {
            connections.push({
              source: event,
              target: causeEvent,
              type: 'causal'
            });
          }
        }
      }
    }

    const linkGenerator = d3.linkHorizontal()
      .x(d => this.xScale(d.date))
      .y(d => this.yScale(d.trackId) + this.yScale.bandwidth() / 2);

    this.svg.selectAll('.connection')
      .data(connections)
      .enter()
      .append('path')
      .attr('class', 'connection')
      .attr('d', d => linkGenerator({ source: d.source, target: d.target }))
      .attr('stroke', '#999')
      .attr('stroke-dasharray', '5,5')
      .attr('fill', 'none')
      .attr('marker-end', 'url(#arrow)');
  }
}
```

## Relationship Graph

```typescript
interface RelationshipGraph {
  config: GraphConfig;
  nodes: GraphNode[];
  edges: GraphEdge[];

  // Interaction
  onNodeClick: (node: GraphNode) => void;
  onEdgeClick: (edge: GraphEdge) => void;

  // Layout
  setLayout(layout: GraphLayout): void;
  runPhysicsSimulation(): void;
  pinNode(nodeId: string, position: Position): void;

  // Filtering
  filterByRelationshipType(types: string[]): void;
  filterByTimeRange(range: DateRange): void;
  highlightPath(nodeIds: string[]): void;
}

interface GraphConfig {
  // Layout
  layout: GraphLayout;
  nodeSpacing: number;
  levelSpacing: number;

  // Physics (for force-directed)
  physics?: {
    enabled: boolean;
    gravity: number;
    repulsion: number;
    linkStrength: number;
    damping: number;
  };

  // Display
  nodeSize: 'fixed' | 'degree' | 'importance';
  edgeWidth: 'fixed' | 'strength' | 'frequency';
  showEdgeLabels: boolean;
  curvedEdges: boolean;

  // Grouping
  groupBy?: 'faction' | 'family' | 'location' | 'none';
  showGroups: boolean;
}

type GraphLayout =
  | 'force-directed'
  | 'hierarchical'
  | 'radial'
  | 'grid'
  | 'circular'
  | 'custom';

interface GraphNode {
  id: string;
  label: string;
  type: 'character' | 'faction' | 'location' | 'concept';
  data: any;  // Original entity data

  // Visual
  size?: number;
  color?: string;
  icon?: string;
  shape?: 'circle' | 'square' | 'diamond' | 'custom';

  // Position (for custom layout)
  x?: number;
  y?: number;
  fixed?: boolean;

  // Grouping
  group?: string;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: RelationshipType;
  label?: string;

  // Attributes
  strength: number;      // -1 to 1 (negative = antagonistic)
  bidirectional: boolean;

  // Time-based
  startDate?: Date;
  endDate?: Date;

  // Visual
  width?: number;
  color?: string;
  style?: 'solid' | 'dashed' | 'dotted';
}

type RelationshipType =
  | 'family'
  | 'romantic'
  | 'friendship'
  | 'rivalry'
  | 'professional'
  | 'mentor'
  | 'enemy'
  | 'custom';

class RelationshipGraphRenderer {
  private simulation: d3.Simulation;

  render(graph: RelationshipGraph): void {
    this.initializeSimulation(graph);
    this.renderEdges(graph.edges);
    this.renderNodes(graph.nodes);
    this.setupDragging(graph.nodes);
  }

  private initializeSimulation(graph: RelationshipGraph): void {
    if (graph.config.layout !== 'force-directed') {
      this.applyStaticLayout(graph);
      return;
    }

    this.simulation = d3.forceSimulation(graph.nodes)
      .force('link', d3.forceLink(graph.edges)
        .id(d => d.id)
        .strength(d => Math.abs(d.strength) * graph.config.physics!.linkStrength))
      .force('charge', d3.forceManyBody()
        .strength(-graph.config.physics!.repulsion))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .force('collision', d3.forceCollide()
        .radius(d => this.getNodeRadius(d) + graph.config.nodeSpacing));

    this.simulation.on('tick', () => this.updatePositions());
  }

  // Time-slider integration
  filterByTime(date: Date): void {
    // Show only relationships active at given date
    const activeEdges = this.edges.filter(edge => {
      if (edge.startDate && date < edge.startDate) return false;
      if (edge.endDate && date > edge.endDate) return false;
      return true;
    });

    this.updateVisibleEdges(activeEdges);
  }
}
```

## Plot Thread Graph

```typescript
interface PlotThreadGraph {
  config: PlotThreadConfig;
  threads: PlotThreadNode[];
  connections: ThreadConnection[];

  // Interaction
  onThreadClick: (thread: PlotThreadNode) => void;
  onConnectionClick: (connection: ThreadConnection) => void;

  // Analysis
  findCriticalPath(): PlotThreadNode[];
  findDependencies(threadId: string): PlotThreadNode[];
  findDependents(threadId: string): PlotThreadNode[];
}

interface PlotThreadConfig {
  // Layout
  layout: 'left-to-right' | 'top-to-bottom' | 'radial';
  alignByTimeline: boolean;

  // Display
  threadHeight: number;
  showMilestones: boolean;
  showSceneMarkers: boolean;
  colorByArc: boolean;
  colorByStatus: boolean;

  // Filtering
  showCompleted: boolean;
  showAbandoned: boolean;
  minImportance: number;
}

interface PlotThreadNode {
  id: string;
  name: string;
  description: string;
  arc: string;

  // Timeline
  startDate: Date;
  endDate?: Date;
  milestones: Milestone[];

  // Status
  status: 'setup' | 'rising' | 'climax' | 'resolution' | 'completed' | 'abandoned';
  completionPercentage: number;

  // Importance
  importance: number;  // 1-10
  type: 'main' | 'subplot' | 'micro';

  // Connections
  dependencies: string[];  // Thread IDs this depends on
  dependents: string[];    // Thread IDs depending on this
  relatedThreads: string[];

  // Scenes
  scenes: string[];        // Scene IDs
}

interface ThreadConnection {
  id: string;
  source: string;
  target: string;
  type: 'dependency' | 'causal' | 'thematic' | 'character-link';
  strength: number;
  description?: string;
}

interface Milestone {
  id: string;
  name: string;
  date: Date;
  sceneId?: string;
  completed: boolean;
}

class PlotThreadGraphRenderer {
  render(graph: PlotThreadGraph): void {
    // Determine layout positions
    const layout = this.calculateLayout(graph);

    // Render thread lanes
    this.renderThreadLanes(graph.threads, layout);

    // Render milestones
    if (graph.config.showMilestones) {
      this.renderMilestones(graph.threads);
    }

    // Render connections
    this.renderConnections(graph.connections);

    // Render scene markers
    if (graph.config.showSceneMarkers) {
      this.renderSceneMarkers(graph.threads);
    }
  }

  private renderThreadLanes(threads: PlotThreadNode[], layout: LayoutResult): void {
    for (const thread of threads) {
      const lane = this.svg.append('g')
        .attr('class', 'thread-lane')
        .attr('transform', `translate(0, ${layout.getY(thread.id)})`);

      // Background bar
      lane.append('rect')
        .attr('x', layout.getX(thread.startDate))
        .attr('width', layout.getX(thread.endDate || new Date()) - layout.getX(thread.startDate))
        .attr('height', this.config.threadHeight)
        .attr('fill', this.getThreadColor(thread))
        .attr('opacity', 0.3);

      // Progress bar
      const progressWidth = (layout.getX(thread.endDate || new Date()) - layout.getX(thread.startDate))
        * (thread.completionPercentage / 100);

      lane.append('rect')
        .attr('x', layout.getX(thread.startDate))
        .attr('width', progressWidth)
        .attr('height', this.config.threadHeight)
        .attr('fill', this.getThreadColor(thread))
        .attr('opacity', 0.7);

      // Label
      lane.append('text')
        .text(thread.name)
        .attr('x', layout.getX(thread.startDate) + 5)
        .attr('y', this.config.threadHeight / 2 + 4)
        .attr('class', 'thread-label');
    }
  }
}
```

## Scene Corkboard

```typescript
interface SceneCorkboard {
  config: CorkboardConfig;
  cards: SceneCard[];
  columns: CorkboardColumn[];

  // Organization
  moveCard(cardId: string, columnId: string, position: number): void;
  createColumn(name: string, position?: number): CorkboardColumn;
  deleteColumn(columnId: string): void;

  // Card operations
  createCard(scene: Partial<Scene>): SceneCard;
  updateCard(cardId: string, updates: Partial<SceneCard>): void;
  deleteCard(cardId: string): void;

  // Filtering
  setFilter(filter: CardFilter): void;
  setColorCoding(mode: ColorCodingMode): void;
}

interface CorkboardConfig {
  // Layout
  columnWidth: number;
  cardHeight: number;
  cardSpacing: number;

  // Display
  showWordCount: boolean;
  showPOV: boolean;
  showStatus: boolean;
  showTags: boolean;

  // Organization
  columnMode: 'chapter' | 'status' | 'pov' | 'custom';
  sortWithinColumn: 'sequence' | 'date' | 'manual';

  // Interaction
  dragEnabled: boolean;
  multiSelect: boolean;
}

interface CorkboardColumn {
  id: string;
  name: string;
  position: number;
  collapsed: boolean;
  cardIds: string[];
  color?: string;
}

interface SceneCard {
  id: string;
  sceneId: string;

  // Display content
  title: string;
  synopsis: string;
  wordCount: number;
  pov: string;
  location: string;
  date: string;
  status: SceneStatus;
  tags: string[];

  // Visual
  color?: string;
  pinned: boolean;
  flagged: boolean;
  notes?: string;

  // Position
  columnId: string;
  position: number;
}

type ColorCodingMode =
  | 'pov'
  | 'status'
  | 'location'
  | 'plot-thread'
  | 'custom'
  | 'none';

class SceneCorkboardRenderer {
  private dragState: DragState | null = null;

  render(corkboard: SceneCorkboard): void {
    this.renderColumns(corkboard.columns);
    this.renderCards(corkboard.cards, corkboard.columns);
    this.setupDragAndDrop(corkboard);
  }

  private renderColumns(columns: CorkboardColumn[]): void {
    const columnElements = this.container.selectAll('.column')
      .data(columns)
      .enter()
      .append('div')
      .attr('class', 'column')
      .style('width', `${this.config.columnWidth}px`);

    // Column header
    columnElements.append('div')
      .attr('class', 'column-header')
      .html(d => `
        <span class="column-title">${d.name}</span>
        <span class="column-count">${d.cardIds.length}</span>
      `);

    // Column body (drop zone)
    columnElements.append('div')
      .attr('class', 'column-body')
      .attr('data-column-id', d => d.id);
  }

  private renderCards(cards: SceneCard[], columns: CorkboardColumn[]): void {
    for (const column of columns) {
      const columnCards = cards
        .filter(c => c.columnId === column.id)
        .sort((a, b) => a.position - b.position);

      const cardElements = d3.select(`[data-column-id="${column.id}"]`)
        .selectAll('.card')
        .data(columnCards)
        .enter()
        .append('div')
        .attr('class', 'card')
        .attr('draggable', this.config.dragEnabled)
        .style('background-color', d => d.color || this.getColorForCard(d));

      // Card content
      cardElements.html(d => `
        <div class="card-header">
          <span class="card-title">${d.title}</span>
          ${d.pinned ? '<span class="pin">📌</span>' : ''}
          ${d.flagged ? '<span class="flag">🚩</span>' : ''}
        </div>
        <div class="card-synopsis">${this.truncate(d.synopsis, 100)}</div>
        <div class="card-footer">
          <span class="word-count">${d.wordCount} words</span>
          <span class="pov">${d.pov}</span>
          <span class="status status-${d.status}">${d.status}</span>
        </div>
        ${d.tags.length > 0 ? `
          <div class="card-tags">
            ${d.tags.map(t => `<span class="tag">${t}</span>`).join('')}
          </div>
        ` : ''}
      `);
    }
  }

  private setupDragAndDrop(corkboard: SceneCorkboard): void {
    // Implement drag-and-drop for card reordering
    const cards = this.container.selectAll('.card');

    cards.on('dragstart', (event, d) => {
      this.dragState = {
        cardId: d.id,
        sourceColumn: d.columnId,
        sourcePosition: d.position
      };
      event.dataTransfer.effectAllowed = 'move';
    });

    const columns = this.container.selectAll('.column-body');

    columns.on('dragover', (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    });

    columns.on('drop', (event) => {
      event.preventDefault();
      if (!this.dragState) return;

      const targetColumn = event.currentTarget.dataset.columnId;
      const targetPosition = this.calculateDropPosition(event);

      corkboard.moveCard(this.dragState.cardId, targetColumn, targetPosition);
      this.dragState = null;
    });
  }
}
```

## Navigation & Interaction

```typescript
interface VisualizationInteraction {
  // Selection
  select(ids: string[]): void;
  clearSelection(): void;
  getSelection(): string[];

  // Navigation
  zoomIn(): void;
  zoomOut(): void;
  zoomToFit(): void;
  zoomToSelection(): void;
  panTo(x: number, y: number): void;

  // Search
  search(query: string): SearchResult[];
  highlightSearchResults(results: SearchResult[]): void;

  // Filtering
  setFilter(filter: VisualizationFilter): void;
  clearFilters(): void;

  // Time navigation (for time-based views)
  setCurrentTime(date: Date): void;
  playTimeline(speed: number): void;
  pauseTimeline(): void;
}

interface VisualizationFilter {
  // Entity filters
  characters?: string[];
  locations?: string[];
  plotThreads?: string[];

  // Time filters
  dateRange?: DateRange;

  // Attribute filters
  importance?: { min: number; max: number };
  status?: string[];
  tags?: string[];

  // Visibility
  showConnections?: boolean;
  showLabels?: boolean;
}

interface SearchResult {
  id: string;
  type: 'event' | 'character' | 'location' | 'thread' | 'scene';
  label: string;
  matchedField: string;
  matchedText: string;
  score: number;
}
```

## Integration with Story Bible

```typescript
interface StoryBibleVisualizationBridge {
  // Generate visualization data from story bible
  generateTimelineData(storyBible: StoryBible): TimelineVisualizationData;
  generateRelationshipData(storyBible: StoryBible): RelationshipGraphData;
  generatePlotThreadData(storyBible: StoryBible): PlotThreadGraphData;

  // Sync changes
  onVisualizationEdit(edit: VisualizationEdit): StoryBibleUpdate[];
  onStoryBibleChange(change: StoryBibleChange): VisualizationUpdate[];
}

interface VisualizationEdit {
  type: 'move' | 'connect' | 'disconnect' | 'create' | 'delete' | 'update';
  entityType: string;
  entityId: string;
  data: any;
}
```

## Performance Optimization

For 1000+ year timelines with thousands of events:

```typescript
interface PerformanceOptimizer {
  // Level of detail
  setLOD(level: 'high' | 'medium' | 'low'): void;

  // Culling
  enableViewportCulling(enabled: boolean): void;
  setRenderBuffer(pixels: number): void;

  // Aggregation
  enableEventClustering(enabled: boolean, threshold: number): void;
  enableTrackCollapsing(enabled: boolean): void;

  // Rendering
  useWebGL(enabled: boolean): void;
  setTargetFPS(fps: number): void;
}

class AdaptiveRenderer {
  private lodThresholds = {
    high: 1000,    // Full detail under 1000 visible items
    medium: 5000,  // Reduced detail under 5000
    low: Infinity  // Minimal detail beyond
  };

  render(data: VisualizationData, viewport: Viewport): void {
    const visibleItems = this.countVisibleItems(data, viewport);

    if (visibleItems < this.lodThresholds.high) {
      this.renderHighDetail(data, viewport);
    } else if (visibleItems < this.lodThresholds.medium) {
      this.renderMediumDetail(data, viewport);
    } else {
      this.renderLowDetail(data, viewport);
    }
  }

  private renderLowDetail(data: VisualizationData, viewport: Viewport): void {
    // Cluster nearby events
    const clusters = this.clusterEvents(data.events, viewport.scale);

    // Render only cluster markers
    for (const cluster of clusters) {
      this.renderClusterMarker(cluster);
    }
  }
}
```

## Implementation Phases

### Phase 1: Timeline View
- [ ] Basic timeline rendering
- [ ] Event display (points and spans)
- [ ] Track system (character/location/thread)
- [ ] Zoom and pan navigation
- [ ] Basic filtering

### Phase 2: Relationship Graph
- [ ] Force-directed layout
- [ ] Node and edge rendering
- [ ] Relationship type visualization
- [ ] Time-based filtering
- [ ] Path highlighting

### Phase 3: Plot Thread Graph
- [ ] Thread lane rendering
- [ ] Milestone markers
- [ ] Dependency connections
- [ ] Progress visualization
- [ ] Critical path analysis

### Phase 4: Scene Corkboard
- [ ] Card rendering
- [ ] Column layout
- [ ] Drag-and-drop reordering
- [ ] Color coding modes
- [ ] Scene editing integration

### Phase 5: Performance & Polish
- [ ] WebGL rendering for scale
- [ ] Event clustering
- [ ] Adaptive level of detail
- [ ] Export functionality
- [ ] Minimap navigation
