/**
 * Epic Fiction Architect - Map Visualization Engine
 *
 * Multi-format map generation for fiction worldbuilding:
 * - ASCII maps for terminal/console display
 * - SVG vector graphics for scalable maps
 * - Real-world map integration (Leaflet/OpenStreetMap)
 * - Procedural terrain generation
 * - Interactive HTML map export
 */

export {
  MapVisualizer,
  default
} from './map-visualizer';

export type {
  MapPoint,
  MapRegion,
  MapPath,
  MapLayer,
  PointType,
  RegionType,
  PathType,
  TerrainType,
  MapConfig,
  WorldMap,
  ASCIIRenderOptions,
  SVGRenderOptions,
  LeafletExportOptions
} from './map-visualizer';
