/**
 * Epic Fiction Architect - Visualization Types
 *
 * Type definitions for visual components:
 * - Relationship graphs (D3 force-directed)
 * - Timeline views (narrative vs chronological)
 * - Corkboard/index card views
 */

// ============================================================================
// RELATIONSHIP GRAPH TYPES
// ============================================================================

/**
 * Node in a relationship graph
 */
export interface GraphNode {
  id: string;
  name: string;
  type: 'character' | 'location' | 'organization' | 'event';
  group?: string;
  importance: number; // 1-10 scale
  imageUrl?: string;

  // D3 simulation properties (set by force simulation)
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;

  // Computed properties
  connectionCount?: number;
  centralityScore?: number;
}

/**
 * Link between nodes in a relationship graph
 */
export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  type: string; // Relationship type (e.g., 'parent', 'friend', 'ally')
  strength: number; // 0-1 scale
  sentiment: 'positive' | 'neutral' | 'negative';
  bidirectional: boolean;
  label?: string;
  startChapter?: number;
  endChapter?: number;
}

/**
 * Complete graph data structure
 */
export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

/**
 * Color scheme for relationship types
 */
export interface RelationshipColorScheme {
  family: string;
  romantic: string;
  friendship: string;
  professional: string;
  antagonistic: string;
  neutral: string;
  [key: string]: string;
}

/**
 * Configuration for relationship graph visualization
 */
export interface RelationshipGraphConfig {
  width: number;
  height: number;
  nodeRadius: number | ((node: GraphNode) => number);
  linkWidth: number | ((link: GraphLink) => number);
  colorScheme: RelationshipColorScheme;
  showLabels: boolean;
  showArrows: boolean;
  enableZoom: boolean;
  enableDrag: boolean;
  chargeStrength: number;
  linkDistance: number;
  temporalFilter?: {
    chapter?: number;
    dateRange?: { start: string; end: string };
  };
  highlightedNodes?: string[];
  highlightedLinks?: string[];
}

// ============================================================================
// TIMELINE VIEW TYPES
// ============================================================================

/**
 * Timeline item (scene, chapter, event)
 */
export interface TimelineItem {
  id: string;
  title: string;
  type: 'scene' | 'chapter' | 'event' | 'milestone';
  narrativeOrder: number; // Reading order
  storyTime: string; // In-story date/time
  storyTimeNumeric: number; // For sorting
  duration?: number; // In story-time units
  characters: string[];
  location?: string;
  emotionalIntensity?: number; // 0-1 scale
  wordCount?: number;
  status: 'draft' | 'complete' | 'needs-revision';
}

/**
 * Timeline configuration
 */
export interface TimelineViewConfig {
  mode: 'narrative' | 'chronological' | 'dual';
  zoomLevel: 'scene' | 'chapter' | 'arc' | 'book' | 'full';
  showEmotionalArc: boolean;
  showCharacterPresence: boolean;
  showWordCounts: boolean;
  colorBy: 'status' | 'pov' | 'emotion' | 'location';
  orientation: 'horizontal' | 'vertical';
  itemHeight: number;
  padding: number;
}

/**
 * Timeline lane (for character presence tracking)
 */
export interface TimelineLane {
  id: string;
  label: string;
  items: TimelineItem[];
  color: string;
}

/**
 * Emotional arc data point
 */
export interface EmotionalArcPoint {
  position: number; // 0-1 normalized position in narrative
  intensity: number; // 0-1 emotional intensity
  type: 'positive' | 'negative' | 'neutral';
  label?: string;
}

// ============================================================================
// CORKBOARD VIEW TYPES
// ============================================================================

/**
 * Card status for corkboard view
 */
export type CardStatus =
  | 'idea'
  | 'outline'
  | 'draft'
  | 'revision'
  | 'complete'
  | 'on-hold';

/**
 * Index card for corkboard view
 */
export interface IndexCard {
  id: string;
  type: 'scene' | 'chapter' | 'character' | 'location' | 'note';
  title: string;
  synopsis: string;
  content?: string;
  status: CardStatus;
  color: string;
  position: {
    row: number;
    col: number;
  };
  size: 'small' | 'medium' | 'large';
  metadata: {
    wordCount?: number;
    targetWordCount?: number;
    povCharacter?: string;
    emotionalBeat?: string;
    tags?: string[];
    dueDate?: string;
    priority?: 'low' | 'medium' | 'high';
  };
  connections?: string[]; // IDs of connected cards
  containerId?: string; // Parent container ID
}

/**
 * Corkboard configuration
 */
export interface CorkboardConfig {
  columns: number;
  cardWidth: number;
  cardHeight: number;
  gap: number;
  showSynopsis: boolean;
  showMetadata: boolean;
  showConnections: boolean;
  colorScheme: 'status' | 'pov' | 'emotion' | 'custom';
  enableDragDrop: boolean;
  enableMultiSelect: boolean;
  sortBy: 'position' | 'status' | 'wordCount' | 'dueDate';
}

/**
 * Card color schemes
 */
export interface CardColorScheme {
  idea: string;
  outline: string;
  draft: string;
  revision: string;
  complete: string;
  'on-hold': string;
}

/**
 * Grid layout for corkboard
 */
export interface GridLayout {
  cards: IndexCard[];
  rows: number;
  cols: number;
  totalWidth: number;
  totalHeight: number;
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

/**
 * SVG export options
 */
export interface SVGExportOptions {
  width: number;
  height: number;
  backgroundColor?: string;
  includeStyles: boolean;
  filename?: string;
}

/**
 * HTML export options
 */
export interface HTMLExportOptions {
  includeCSS: boolean;
  includeJS: boolean;
  interactive: boolean;
  standalone: boolean;
}

/**
 * Visualization output formats
 */
export type VisualizationFormat = 'svg' | 'html' | 'png' | 'json';
