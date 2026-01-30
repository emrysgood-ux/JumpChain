/**
 * Epic Fiction Architect - Visualization Module
 *
 * Provides visual components for story planning and analysis:
 * - RelationshipGraphVisualizer: D3.js force-directed relationship graphs
 * - TimelineView: Narrative and chronological timeline views
 * - CorkboardView: Scrivener-style index card layouts
 *
 * All visualizers support:
 * - SVG export for print/static use
 * - HTML export with full interactivity
 * - JSON data export
 */

// Types
export type {
  // Graph types
  GraphNode,
  GraphLink,
  GraphData,
  RelationshipColorScheme,
  RelationshipGraphConfig,

  // Timeline types
  TimelineItem,
  TimelineViewConfig,
  TimelineLane,
  EmotionalArcPoint,

  // Corkboard types
  IndexCard,
  CorkboardConfig,
  CardStatus,
  CardColorScheme,
  GridLayout,

  // Export types
  SVGExportOptions,
  HTMLExportOptions,
  VisualizationFormat
} from './types';

// Visualizers
export { RelationshipGraphVisualizer } from './relationship-graph';
export { TimelineView } from './timeline-view';
export { CorkboardView } from './corkboard-view';

// Default exports
export { default as RelationshipGraph } from './relationship-graph';
export { default as Timeline } from './timeline-view';
export { default as Corkboard } from './corkboard-view';
