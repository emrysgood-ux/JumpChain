/**
 * Epic Fiction Architect - Map Visualization Engine
 *
 * Multi-format map generation for fiction worldbuilding:
 * - ASCII maps for terminal/console display
 * - SVG vector graphics for scalable maps
 * - Real-world map integration (Leaflet/OpenStreetMap coordinates)
 * - Procedural terrain generation
 * - Interactive HTML map export
 *
 * Inspired by:
 * - Azgaar's Fantasy Map Generator
 * - Watabou's Procgen tools
 * - MapSCII (ASCII world maps)
 * - Leaflet.js for real-world overlays
 */

import {v4 as uuidv4} from 'uuid';

// ============================================================================
// TYPES
// ============================================================================

export interface MapPoint {
  id: string;
  x: number;
  y: number;
  label?: string;
  type: PointType;
  metadata?: Record<string, unknown>;
}

export interface MapRegion {
  id: string;
  name: string;
  points: {x: number; y: number}[]; // Polygon vertices
  fill?: string;
  type: RegionType;
  metadata?: Record<string, unknown>;
}

export interface MapPath {
  id: string;
  name?: string;
  points: {x: number; y: number}[];
  type: PathType;
  metadata?: Record<string, unknown>;
}

export interface MapLayer {
  id: string;
  name: string;
  visible: boolean;
  zIndex: number;
  points: MapPoint[];
  regions: MapRegion[];
  paths: MapPath[];
}

export type PointType =
  | 'city'
  | 'town'
  | 'village'
  | 'castle'
  | 'ruins'
  | 'temple'
  | 'shrine'
  | 'landmark'
  | 'mountain'
  | 'cave'
  | 'port'
  | 'bridge'
  | 'custom';

export type RegionType =
  | 'kingdom'
  | 'province'
  | 'forest'
  | 'desert'
  | 'water'
  | 'mountain_range'
  | 'swamp'
  | 'plains'
  | 'tundra'
  | 'custom';

export type PathType =
  | 'road'
  | 'river'
  | 'border'
  | 'trade_route'
  | 'trail'
  | 'coastline'
  | 'custom';

export type TerrainType =
  | 'ocean'
  | 'shallow_water'
  | 'beach'
  | 'plains'
  | 'forest'
  | 'dense_forest'
  | 'hills'
  | 'mountain'
  | 'snow'
  | 'desert'
  | 'swamp';

export interface MapConfig {
  width: number;
  height: number;
  name: string;
  scale?: number; // units per pixel (e.g., "1 mile per pixel")
  scaleUnit?: string;
  realWorldBounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export interface WorldMap {
  id: string;
  config: MapConfig;
  layers: MapLayer[];
  terrain?: TerrainType[][];
  metadata: Record<string, unknown>;
}

// ASCII rendering options
export interface ASCIIRenderOptions {
  width?: number;
  height?: number;
  showLabels?: boolean;
  showPaths?: boolean;
  showRegions?: boolean;
  charset?: 'basic' | 'extended' | 'braille';
}

// SVG rendering options
export interface SVGRenderOptions {
  width?: number;
  height?: number;
  showLabels?: boolean;
  showGrid?: boolean;
  interactive?: boolean;
  theme?: 'fantasy' | 'modern' | 'satellite' | 'minimal';
}

// HTML/Leaflet export options
export interface LeafletExportOptions {
  title?: string;
  tileProvider?: 'osm' | 'satellite' | 'custom' | 'none';
  customTileUrl?: string;
  initialZoom?: number;
  maxZoom?: number;
  includeSearch?: boolean;
  includeLayerControl?: boolean;
}

// ============================================================================
// ASCII CHARACTER SETS
// ============================================================================

const ASCII_CHARS = {
  basic: {
    ocean: '~',
    shallow_water: '.',
    beach: ':',
    plains: ' ',
    forest: 't',
    dense_forest: 'T',
    hills: 'n',
    mountain: 'M',
    snow: '*',
    desert: '.',
    swamp: '%',
    city: '@',
    town: 'o',
    village: '.',
    castle: '#',
    ruins: 'x',
    temple: '+',
    shrine: '+',
    landmark: '!',
    mountain_point: '^',
    cave: 'O',
    port: 'P',
    bridge: '=',
    road: '-',
    river: '~',
    border: '|',
    trail: '.',
    unknown: '?'
  },
  extended: {
    ocean: '≈',
    shallow_water: '~',
    beach: '░',
    plains: '·',
    forest: '♣',
    dense_forest: '♠',
    hills: '∩',
    mountain: '▲',
    snow: '❄',
    desert: '∴',
    swamp: '≋',
    city: '◉',
    town: '●',
    village: '○',
    castle: '♜',
    ruins: '☠',
    temple: '†',
    shrine: '⛩',
    landmark: '★',
    mountain_point: '△',
    cave: '◯',
    port: '⚓',
    bridge: '═',
    road: '─',
    river: '〜',
    border: '│',
    trail: '·',
    unknown: '?'
  },
  braille: {
    ocean: '⠿',
    shallow_water: '⠶',
    beach: '⠒',
    plains: '⠀',
    forest: '⠗',
    dense_forest: '⠿',
    hills: '⠦',
    mountain: '⠛',
    snow: '⠾',
    desert: '⠂',
    swamp: '⠻',
    city: '⣿',
    town: '⣾',
    village: '⡆',
    castle: '⣷',
    ruins: '⡵',
    temple: '⣴',
    shrine: '⣴',
    landmark: '⣿',
    mountain_point: '⢕',
    cave: '⡏',
    port: '⣎',
    bridge: '⠤',
    road: '⠒',
    river: '⠾',
    border: '⡇',
    trail: '⠐',
    unknown: '⠿'
  }
};

// ============================================================================
// SVG THEMES
// ============================================================================

const SVG_THEMES = {
  fantasy: {
    ocean: '#1a5276',
    shallow_water: '#3498db',
    beach: '#f5deb3',
    plains: '#90EE90',
    forest: '#228B22',
    dense_forest: '#006400',
    hills: '#9ACD32',
    mountain: '#808080',
    snow: '#FFFAFA',
    desert: '#F4A460',
    swamp: '#556B2F',
    border: '#8B4513',
    road: '#D2691E',
    river: '#4169E1',
    city: '#FFD700',
    text: '#2C3E50',
    background: '#F5F5DC'
  },
  modern: {
    ocean: '#0077BE',
    shallow_water: '#00A3E0',
    beach: '#FFE4B5',
    plains: '#C5E1A5',
    forest: '#4CAF50',
    dense_forest: '#2E7D32',
    hills: '#AED581',
    mountain: '#9E9E9E',
    snow: '#FAFAFA',
    desert: '#FFCC80',
    swamp: '#689F38',
    border: '#616161',
    road: '#424242',
    river: '#2196F3',
    city: '#F44336',
    text: '#212121',
    background: '#ECEFF1'
  },
  satellite: {
    ocean: '#0A2239',
    shallow_water: '#1B4965',
    beach: '#E8D5B7',
    plains: '#606C38',
    forest: '#283618',
    dense_forest: '#1B2615',
    hills: '#6B705C',
    mountain: '#4A4E69',
    snow: '#F2E9E4',
    desert: '#BC6C25',
    swamp: '#344E41',
    border: '#3D405B',
    road: '#B5838D',
    river: '#457B9D',
    city: '#E63946',
    text: '#F1FAEE',
    background: '#1D3557'
  },
  minimal: {
    ocean: '#E3F2FD',
    shallow_water: '#BBDEFB',
    beach: '#FFF3E0',
    plains: '#E8F5E9',
    forest: '#C8E6C9',
    dense_forest: '#A5D6A7',
    hills: '#DCEDC8',
    mountain: '#ECEFF1',
    snow: '#FFFFFF',
    desert: '#FFE0B2',
    swamp: '#D7CCC8',
    border: '#90A4AE',
    road: '#78909C',
    river: '#64B5F6',
    city: '#EF5350',
    text: '#37474F',
    background: '#FAFAFA'
  }
};

// ============================================================================
// PROCEDURAL GENERATION HELPERS
// ============================================================================

/**
 * Simple Perlin-like noise for terrain generation
 */
function simpleNoise(x: number, y: number, seed: number = 12345): number {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
  return n - Math.floor(n);
}

/**
 * Fractal noise for more natural terrain
 */
function fractalNoise(
  x: number,
  y: number,
  octaves: number = 4,
  persistence: number = 0.5,
  seed: number = 12345
): number {
  let total = 0;
  let frequency = 1;
  let amplitude = 1;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    total += simpleNoise(x * frequency, y * frequency, seed + i * 1000) * amplitude;
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= 2;
  }

  return total / maxValue;
}

/**
 * Get terrain type from elevation and moisture
 */
function getTerrainFromValues(elevation: number, moisture: number): TerrainType {
  if (elevation < 0.3) return 'ocean';
  if (elevation < 0.35) return 'shallow_water';
  if (elevation < 0.4) return 'beach';
  if (elevation > 0.85) return 'snow';
  if (elevation > 0.7) return 'mountain';
  if (elevation > 0.55) return 'hills';

  // Moisture-based biomes for middle elevations
  if (moisture < 0.2) return 'desert';
  if (moisture < 0.4) return 'plains';
  if (moisture > 0.8) return 'swamp';
  if (moisture > 0.6) return 'dense_forest';
  return 'forest';
}

// ============================================================================
// MAP VISUALIZER ENGINE
// ============================================================================

export class MapVisualizer {
  private maps: Map<string, WorldMap> = new Map();

  // ==========================================================================
  // MAP CREATION
  // ==========================================================================

  /**
   * Create a new empty map
   */
  createMap(config: MapConfig): WorldMap {
    const map: WorldMap = {
      id: uuidv4(),
      config,
      layers: [
        {
          id: 'default',
          name: 'Default Layer',
          visible: true,
          zIndex: 0,
          points: [],
          regions: [],
          paths: []
        }
      ],
      metadata: {}
    };

    this.maps.set(map.id, map);
    return map;
  }

  /**
   * Generate procedural terrain for a map
   */
  generateTerrain(
    mapId: string,
    options: {
      seed?: number;
      waterLevel?: number;
      mountainLevel?: number;
      moistureSeed?: number;
    } = {}
  ): TerrainType[][] {
    const map = this.maps.get(mapId);
    if (!map) throw new Error(`Map ${mapId} not found`);

    const {
      seed = Math.floor(Math.random() * 100000),
      waterLevel = 0.35,
      mountainLevel: _mountainLevel = 0.7,
      moistureSeed = seed + 5000
    } = options;
    void _mountainLevel; // Reserved for future terrain detail levels

    const terrain: TerrainType[][] = [];

    for (let y = 0; y < map.config.height; y++) {
      terrain[y] = [];
      for (let x = 0; x < map.config.width; x++) {
        // Normalize coordinates
        const nx = x / map.config.width;
        const ny = y / map.config.height;

        // Generate elevation using fractal noise
        let elevation = fractalNoise(nx * 4, ny * 4, 6, 0.5, seed);

        // Add island mask (higher in center, lower at edges)
        const dx = nx - 0.5;
        const dy = ny - 0.5;
        const distFromCenter = Math.sqrt(dx * dx + dy * dy) * 2;
        elevation = elevation * (1 - distFromCenter * 0.5);

        // Generate moisture
        const moisture = fractalNoise(nx * 3, ny * 3, 4, 0.6, moistureSeed);

        // Adjust for water and mountain levels
        const adjustedElevation =
          elevation < waterLevel
            ? elevation / waterLevel * 0.35
            : 0.35 + (elevation - waterLevel) / (1 - waterLevel) * 0.65;

        terrain[y][x] = getTerrainFromValues(adjustedElevation, moisture);
      }
    }

    map.terrain = terrain;
    return terrain;
  }

  /**
   * Create a map from real-world coordinates (for overlay on OpenStreetMap)
   */
  createRealWorldMap(
    name: string,
    bounds: {north: number; south: number; east: number; west: number},
    pixelWidth: number = 800,
    pixelHeight: number = 600
  ): WorldMap {
    const config: MapConfig = {
      width: pixelWidth,
      height: pixelHeight,
      name,
      realWorldBounds: bounds,
      scale: (bounds.east - bounds.west) / pixelWidth,
      scaleUnit: 'degrees'
    };

    return this.createMap(config);
  }

  // ==========================================================================
  // MAP ELEMENTS
  // ==========================================================================

  /**
   * Add a point to the map
   */
  addPoint(
    mapId: string,
    point: Omit<MapPoint, 'id'>,
    layerId: string = 'default'
  ): MapPoint {
    const map = this.maps.get(mapId);
    if (!map) throw new Error(`Map ${mapId} not found`);

    const layer = map.layers.find(l => l.id === layerId);
    if (!layer) throw new Error(`Layer ${layerId} not found`);

    const fullPoint: MapPoint = {...point, id: uuidv4()};
    layer.points.push(fullPoint);
    return fullPoint;
  }

  /**
   * Add a region to the map
   */
  addRegion(
    mapId: string,
    region: Omit<MapRegion, 'id'>,
    layerId: string = 'default'
  ): MapRegion {
    const map = this.maps.get(mapId);
    if (!map) throw new Error(`Map ${mapId} not found`);

    const layer = map.layers.find(l => l.id === layerId);
    if (!layer) throw new Error(`Layer ${layerId} not found`);

    const fullRegion: MapRegion = {...region, id: uuidv4()};
    layer.regions.push(fullRegion);
    return fullRegion;
  }

  /**
   * Add a path to the map
   */
  addPath(
    mapId: string,
    path: Omit<MapPath, 'id'>,
    layerId: string = 'default'
  ): MapPath {
    const map = this.maps.get(mapId);
    if (!map) throw new Error(`Map ${mapId} not found`);

    const layer = map.layers.find(l => l.id === layerId);
    if (!layer) throw new Error(`Layer ${layerId} not found`);

    const fullPath: MapPath = {...path, id: uuidv4()};
    layer.paths.push(fullPath);
    return fullPath;
  }

  /**
   * Add a new layer
   */
  addLayer(mapId: string, name: string, zIndex?: number): MapLayer {
    const map = this.maps.get(mapId);
    if (!map) throw new Error(`Map ${mapId} not found`);

    const layer: MapLayer = {
      id: uuidv4(),
      name,
      visible: true,
      zIndex: zIndex ?? map.layers.length,
      points: [],
      regions: [],
      paths: []
    };

    map.layers.push(layer);
    map.layers.sort((a, b) => a.zIndex - b.zIndex);
    return layer;
  }

  /**
   * Convert real-world coordinates to map pixel coordinates
   */
  realWorldToPixel(
    mapId: string,
    lat: number,
    lon: number
  ): {x: number; y: number} | null {
    const map = this.maps.get(mapId);
    if (!map || !map.config.realWorldBounds) return null;

    const {north, south, east, west} = map.config.realWorldBounds;
    const {width, height} = map.config;

    const x = ((lon - west) / (east - west)) * width;
    const y = ((north - lat) / (north - south)) * height;

    return {x, y};
  }

  /**
   * Add a point using real-world coordinates
   */
  addRealWorldPoint(
    mapId: string,
    lat: number,
    lon: number,
    point: Omit<MapPoint, 'id' | 'x' | 'y'>,
    layerId: string = 'default'
  ): MapPoint | null {
    const coords = this.realWorldToPixel(mapId, lat, lon);
    if (!coords) return null;

    return this.addPoint(mapId, {...point, x: coords.x, y: coords.y}, layerId);
  }

  // ==========================================================================
  // ASCII RENDERING
  // ==========================================================================

  /**
   * Render map as ASCII art
   */
  renderASCII(mapId: string, options: ASCIIRenderOptions = {}): string {
    const map = this.maps.get(mapId);
    if (!map) throw new Error(`Map ${mapId} not found`);

    const {
      width = Math.min(map.config.width, 120),
      height = Math.min(map.config.height, 40),
      showLabels = true,
      showPaths = true,
      showRegions: _showRegions = true,
      charset = 'extended'
    } = options;
    void _showRegions; // Reserved for future region rendering

    const chars = ASCII_CHARS[charset] as Record<string, string>;
    const scaleX = map.config.width / width;
    const scaleY = map.config.height / height;

    // Initialize grid
    const grid: string[][] = [];
    for (let y = 0; y < height; y++) {
      grid[y] = [];
      for (let x = 0; x < width; x++) {
        // Get terrain if available
        if (map.terrain) {
          const terrainX = Math.floor(x * scaleX);
          const terrainY = Math.floor(y * scaleY);
          const terrain = map.terrain[terrainY]?.[terrainX] || 'plains';
          grid[y][x] = chars[terrain] || chars.unknown;
        } else {
          grid[y][x] = chars.plains;
        }
      }
    }

    // Draw paths
    if (showPaths) {
      for (const layer of map.layers.filter(l => l.visible)) {
        for (const path of layer.paths) {
          const pathChar = chars[path.type] || chars.road;
          for (let i = 0; i < path.points.length - 1; i++) {
            const start = path.points[i];
            const end = path.points[i + 1];
            this.drawASCIILine(
              grid,
              Math.floor(start.x / scaleX),
              Math.floor(start.y / scaleY),
              Math.floor(end.x / scaleX),
              Math.floor(end.y / scaleY),
              pathChar,
              width,
              height
            );
          }
        }
      }
    }

    // Draw points
    for (const layer of map.layers.filter(l => l.visible)) {
      for (const point of layer.points) {
        const px = Math.floor(point.x / scaleX);
        const py = Math.floor(point.y / scaleY);
        if (px >= 0 && px < width && py >= 0 && py < height) {
          const pointChar = chars[point.type] || chars.landmark;
          grid[py][px] = pointChar;
        }
      }
    }

    // Build output string
    const lines: string[] = [];

    // Title
    lines.push('┌' + '─'.repeat(width + 2) + '┐');
    const title = ` ${map.config.name} `;
    const padding = Math.floor((width + 2 - title.length) / 2);
    lines.push('│' + ' '.repeat(padding) + title + ' '.repeat(width + 2 - padding - title.length) + '│');
    lines.push('├' + '─'.repeat(width + 2) + '┤');

    // Map content
    for (const row of grid) {
      lines.push('│ ' + row.join('') + ' │');
    }

    // Footer
    lines.push('└' + '─'.repeat(width + 2) + '┘');

    // Legend
    if (showLabels) {
      lines.push('');
      lines.push('Legend:');
      const legendItems: string[] = [];
      for (const layer of map.layers.filter(l => l.visible)) {
        for (const point of layer.points) {
          if (point.label) {
            const pointChar = chars[point.type] || chars.landmark;
            legendItems.push(`  ${pointChar} ${point.label}`);
          }
        }
      }
      lines.push(...legendItems.slice(0, 10));
      if (legendItems.length > 10) {
        lines.push(`  ... and ${legendItems.length - 10} more`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Draw a line on ASCII grid using Bresenham's algorithm
   */
  private drawASCIILine(
    grid: string[][],
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    char: string,
    width: number,
    height: number
  ): void {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    let x = x0;
    let y = y0;

    while (true) {
      if (x >= 0 && x < width && y >= 0 && y < height) {
        grid[y][x] = char;
      }

      if (x === x1 && y === y1) break;

      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
  }

  // ==========================================================================
  // SVG RENDERING
  // ==========================================================================

  /**
   * Render map as SVG
   */
  renderSVG(mapId: string, options: SVGRenderOptions = {}): string {
    const map = this.maps.get(mapId);
    if (!map) throw new Error(`Map ${mapId} not found`);

    const {
      width = map.config.width,
      height = map.config.height,
      showLabels = true,
      showGrid = false,
      interactive = true,
      theme = 'fantasy'
    } = options;

    const colors = SVG_THEMES[theme];
    const scaleX = width / map.config.width;
    const scaleY = height / map.config.height;

    const svgParts: string[] = [];

    // SVG header
    svgParts.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`);

    // Styles
    svgParts.push(`<style>
      .map-point { cursor: pointer; }
      .map-point:hover { filter: brightness(1.2); }
      .map-label { font-family: 'Georgia', serif; font-size: 12px; fill: ${colors.text}; }
      .map-region { opacity: 0.7; }
      .map-path { fill: none; stroke-linecap: round; stroke-linejoin: round; }
    </style>`);

    // Background
    svgParts.push(`<rect width="${width}" height="${height}" fill="${colors.background}"/>`);

    // Terrain
    if (map.terrain) {
      const cellWidth = width / map.config.width;
      const cellHeight = height / map.config.height;

      for (let y = 0; y < map.config.height; y++) {
        for (let x = 0; x < map.config.width; x++) {
          const terrain = map.terrain[y][x];
          const color = colors[terrain as keyof typeof colors] || colors.plains;
          svgParts.push(
            `<rect x="${x * cellWidth}" y="${y * cellHeight}" width="${cellWidth + 0.5}" height="${cellHeight + 0.5}" fill="${color}"/>`
          );
        }
      }
    }

    // Grid
    if (showGrid) {
      const gridSize = 50;
      svgParts.push(`<g stroke="${colors.border}" stroke-opacity="0.2" stroke-width="0.5">`);
      for (let x = 0; x <= width; x += gridSize) {
        svgParts.push(`<line x1="${x}" y1="0" x2="${x}" y2="${height}"/>`);
      }
      for (let y = 0; y <= height; y += gridSize) {
        svgParts.push(`<line x1="0" y1="${y}" x2="${width}" y2="${y}"/>`);
      }
      svgParts.push('</g>');
    }

    // Regions
    for (const layer of map.layers.filter(l => l.visible)) {
      for (const region of layer.regions) {
        const points = region.points
          .map(p => `${p.x * scaleX},${p.y * scaleY}`)
          .join(' ');
        const fill = region.fill || colors[region.type as keyof typeof colors] || colors.plains;
        svgParts.push(
          `<polygon class="map-region" points="${points}" fill="${fill}" stroke="${colors.border}" stroke-width="1"` +
          (interactive ? ` data-id="${region.id}" data-name="${region.name}"` : '') +
          `/>`
        );
      }
    }

    // Paths
    for (const layer of map.layers.filter(l => l.visible)) {
      for (const path of layer.paths) {
        const d = path.points
          .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x * scaleX} ${p.y * scaleY}`)
          .join(' ');
        const stroke = colors[path.type as keyof typeof colors] || colors.road;
        const strokeWidth = path.type === 'river' ? 3 : path.type === 'road' ? 2 : 1;
        svgParts.push(
          `<path class="map-path" d="${d}" stroke="${stroke}" stroke-width="${strokeWidth}"` +
          (interactive ? ` data-id="${path.id}" data-name="${path.name || ''}"` : '') +
          `/>`
        );
      }
    }

    // Points
    for (const layer of map.layers.filter(l => l.visible)) {
      for (const point of layer.points) {
        const x = point.x * scaleX;
        const y = point.y * scaleY;
        const color = colors[point.type as keyof typeof colors] || colors.city;
        const radius = point.type === 'city' ? 8 : point.type === 'town' ? 5 : 3;

        svgParts.push(
          `<circle class="map-point" cx="${x}" cy="${y}" r="${radius}" fill="${color}" stroke="${colors.text}" stroke-width="1"` +
          (interactive ? ` data-id="${point.id}" data-type="${point.type}"` : '') +
          `/>`
        );

        if (showLabels && point.label) {
          svgParts.push(
            `<text class="map-label" x="${x + radius + 3}" y="${y + 4}">${this.escapeXML(point.label)}</text>`
          );
        }
      }
    }

    // Title
    svgParts.push(
      `<text x="${width / 2}" y="25" text-anchor="middle" class="map-label" style="font-size: 18px; font-weight: bold;">${this.escapeXML(map.config.name)}</text>`
    );

    // Scale bar
    if (map.config.scale && map.config.scaleUnit) {
      const scaleBarWidth = 100;
      const scaleValue = (scaleBarWidth / scaleX) * map.config.scale;
      svgParts.push(`<g transform="translate(20, ${height - 30})">`);
      svgParts.push(`<rect x="0" y="0" width="${scaleBarWidth}" height="5" fill="${colors.text}"/>`);
      svgParts.push(`<text x="${scaleBarWidth / 2}" y="20" text-anchor="middle" class="map-label">${scaleValue.toFixed(1)} ${map.config.scaleUnit}</text>`);
      svgParts.push('</g>');
    }

    svgParts.push('</svg>');

    return svgParts.join('\n');
  }

  private escapeXML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  // ==========================================================================
  // INTERACTIVE HTML/LEAFLET EXPORT
  // ==========================================================================

  /**
   * Export map as interactive HTML with Leaflet.js
   */
  exportLeafletHTML(mapId: string, options: LeafletExportOptions = {}): string {
    const map = this.maps.get(mapId);
    if (!map) throw new Error(`Map ${mapId} not found`);

    const {
      title = map.config.name,
      tileProvider = map.config.realWorldBounds ? 'osm' : 'none',
      customTileUrl,
      initialZoom = 10,
      maxZoom = 18,
      includeSearch: _includeSearch = false,
      includeLayerControl = true
    } = options;
    void _includeSearch; // Reserved for future search functionality

    // Determine center
    let centerLat = 0;
    let centerLon = 0;

    if (map.config.realWorldBounds) {
      const {north, south, east, west} = map.config.realWorldBounds;
      centerLat = (north + south) / 2;
      centerLon = (east + west) / 2;
    }

    // Build markers JavaScript
    const markersJS: string[] = [];
    for (const layer of map.layers) {
      markersJS.push(`// Layer: ${layer.name}`);
      markersJS.push(`var layer_${layer.id.replace(/-/g, '_')} = L.layerGroup();`);

      for (const point of layer.points) {
        let lat: number, lon: number;

        if (map.config.realWorldBounds) {
          // Convert pixel to lat/lon
          const {north, south, east, west} = map.config.realWorldBounds;
          lon = west + (point.x / map.config.width) * (east - west);
          lat = north - (point.y / map.config.height) * (north - south);
        } else {
          lat = -point.y; // Use negative y for simple pixel coords
          lon = point.x;
        }

        const popupContent = point.label
          ? `<b>${this.escapeXML(point.label)}</b><br>Type: ${point.type}`
          : `Type: ${point.type}`;

        markersJS.push(
          `L.marker([${lat}, ${lon}]).bindPopup('${popupContent}').addTo(layer_${layer.id.replace(/-/g, '_')});`
        );
      }

      markersJS.push(`layer_${layer.id.replace(/-/g, '_')}.addTo(map);`);
    }

    // Build paths JavaScript
    const pathsJS: string[] = [];
    for (const layer of map.layers) {
      for (const path of layer.paths) {
        const coords = path.points.map(p => {
          if (map.config.realWorldBounds) {
            const {north, south, east, west} = map.config.realWorldBounds;
            const lon = west + (p.x / map.config.width) * (east - west);
            const lat = north - (p.y / map.config.height) * (north - south);
            return `[${lat}, ${lon}]`;
          }
          return `[${-p.y}, ${p.x}]`;
        });

        const color = path.type === 'river' ? '#4169E1' : path.type === 'road' ? '#8B4513' : '#666666';
        pathsJS.push(
          `L.polyline([${coords.join(', ')}], {color: '${color}', weight: 3}).addTo(map);`
        );
      }
    }

    // Tile layer
    let tileLayerJS = '';
    if (tileProvider === 'osm') {
      tileLayerJS = `L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: ${maxZoom}
      }).addTo(map);`;
    } else if (tileProvider === 'satellite') {
      tileLayerJS = `L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri',
        maxZoom: ${maxZoom}
      }).addTo(map);`;
    } else if (tileProvider === 'custom' && customTileUrl) {
      tileLayerJS = `L.tileLayer('${customTileUrl}', {
        maxZoom: ${maxZoom}
      }).addTo(map);`;
    }

    // Layer control
    const layerControlJS = includeLayerControl && map.layers.length > 1
      ? `
      var overlays = {
        ${map.layers.map(l => `"${l.name}": layer_${l.id.replace(/-/g, '_')}`).join(',\n        ')}
      };
      L.control.layers(null, overlays).addTo(map);
      `
      : '';

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeXML(title)}</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body { margin: 0; padding: 0; }
    #map { width: 100vw; height: 100vh; }
    .map-title {
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
      background: rgba(255,255,255,0.9);
      padding: 10px 20px;
      border-radius: 5px;
      font-family: Georgia, serif;
      font-size: 24px;
      font-weight: bold;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    }
  </style>
</head>
<body>
  <div class="map-title">${this.escapeXML(title)}</div>
  <div id="map"></div>
  <script>
    var map = L.map('map').setView([${centerLat}, ${centerLon}], ${initialZoom});

    ${tileLayerJS}

    ${markersJS.join('\n    ')}

    ${pathsJS.join('\n    ')}

    ${layerControlJS}

    ${map.config.realWorldBounds ? `
    // Fit to bounds
    map.fitBounds([
      [${map.config.realWorldBounds.south}, ${map.config.realWorldBounds.west}],
      [${map.config.realWorldBounds.north}, ${map.config.realWorldBounds.east}]
    ]);
    ` : ''}
  </script>
</body>
</html>`;
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  /**
   * Get a map by ID
   */
  getMap(mapId: string): WorldMap | undefined {
    return this.maps.get(mapId);
  }

  /**
   * Get all maps
   */
  getAllMaps(): WorldMap[] {
    return Array.from(this.maps.values());
  }

  /**
   * Export map data as JSON
   */
  exportJSON(mapId: string): string {
    const map = this.maps.get(mapId);
    if (!map) throw new Error(`Map ${mapId} not found`);
    return JSON.stringify(map, null, 2);
  }

  /**
   * Import map from JSON
   */
  importJSON(json: string): WorldMap {
    const map = JSON.parse(json) as WorldMap;
    this.maps.set(map.id, map);
    return map;
  }

  /**
   * Create Masaki Village map (Tenchi Muyo example)
   */
  createMasakiVillageMap(): WorldMap {
    // Real coordinates for Okayama Prefecture area
    const map = this.createRealWorldMap(
      'Masaki Village & Surroundings',
      {
        north: 34.75,
        south: 34.55,
        east: 133.95,
        west: 133.65
      },
      800,
      600
    );

    // Add locations layer
    const locationsLayer = this.addLayer(map.id, 'Locations', 1);

    // Add Masaki Estate locations (approximate positions)
    this.addRealWorldPoint(map.id, 34.68, 133.78, {
      label: 'Masaki House',
      type: 'castle',
      metadata: {description: 'Main residence of the Masaki family'}
    }, locationsLayer.id);

    this.addRealWorldPoint(map.id, 34.69, 133.79, {
      label: 'Masaki Shrine',
      type: 'shrine',
      metadata: {description: 'Shinto shrine, 320 stone steps'}
    }, locationsLayer.id);

    this.addRealWorldPoint(map.id, 34.695, 133.795, {
      label: "Ryoko's Cave",
      type: 'cave',
      metadata: {description: 'Sealed cave where Ryoko was imprisoned for 700 years'}
    }, locationsLayer.id);

    this.addRealWorldPoint(map.id, 34.698, 133.80, {
      label: 'Funaho-ki (Sacred Tree)',
      type: 'landmark',
      metadata: {description: "Core of Yosho's royal tree-ship"}
    }, locationsLayer.id);

    this.addRealWorldPoint(map.id, 34.675, 133.775, {
      label: 'Lake',
      type: 'landmark',
      metadata: {description: 'Lake adjacent to Masaki House'}
    }, locationsLayer.id);

    this.addRealWorldPoint(map.id, 34.67, 133.77, {
      label: 'Carrot Fields',
      type: 'village',
      metadata: {description: "Ryo-Ohki's favorite place"}
    }, locationsLayer.id);

    // Real-world reference points
    this.addRealWorldPoint(map.id, 34.60, 133.77, {
      label: 'Kurashiki City',
      type: 'city',
      metadata: {description: 'Nearby city, train connection'}
    }, locationsLayer.id);

    this.addRealWorldPoint(map.id, 34.66, 133.85, {
      label: 'Tarojinja Shrine (Real)',
      type: 'temple',
      metadata: {description: 'Real-world inspiration for Masaki Shrine'}
    }, locationsLayer.id);

    this.addRealWorldPoint(map.id, 34.72, 133.75, {
      label: 'Takahashi City',
      type: 'town',
      metadata: {description: "Kajishima's hometown"}
    }, locationsLayer.id);

    // Add paths
    this.addPath(map.id, {
      name: 'Path to Shrine',
      points: [
        {x: 400, y: 350}, // House
        {x: 420, y: 320},
        {x: 450, y: 280}  // Shrine
      ],
      type: 'trail'
    }, locationsLayer.id);

    this.addPath(map.id, {
      name: 'Road to Kurashiki',
      points: [
        {x: 400, y: 350},
        {x: 380, y: 400},
        {x: 350, y: 480},
        {x: 400, y: 550}
      ],
      type: 'road'
    }, locationsLayer.id);

    return map;
  }

  // ==========================================================================
  // AMALGAM/REALITY-FICTION OVERLAY METHODS
  // ==========================================================================

  /**
   * Export an interactive HTML map with fictional overlay layers
   * for amalgam universes that mix real-world locations with fictional elements
   */
  exportAmalgamMapHTML(
    mapId: string,
    options: {
      title?: string;
      realWorldLayer?: boolean;
      fictionalLayer?: boolean;
      showLegend?: boolean;
      customStyles?: {
        realWorldMarkerColor?: string;
        fictionalMarkerColor?: string;
        hiddenMarkerColor?: string;
      };
      amalgamInfo?: {
        worldName: string;
        realityType: string;
        divergencePoint?: string;
        mundaneAwareness?: string;
      };
    } = {}
  ): string {
    const map = this.maps.get(mapId);
    if (!map) throw new Error(`Map ${mapId} not found`);

    const {
      title = map.config.name,
      realWorldLayer = true,
      fictionalLayer = true,
      showLegend = true,
      customStyles = {},
      amalgamInfo
    } = options;

    const realColor = customStyles.realWorldMarkerColor ?? '#3498db';
    const fictionColor = customStyles.fictionalMarkerColor ?? '#9b59b6';
    const hiddenColor = customStyles.hiddenMarkerColor ?? '#e74c3c';

    // Determine center from bounds or default
    let centerLat = 0, centerLon = 0;
    if (map.config.realWorldBounds) {
      const {north, south, east, west} = map.config.realWorldBounds;
      centerLat = (north + south) / 2;
      centerLon = (east + west) / 2;
    }

    // Build layers JavaScript
    const layersJS: string[] = [];

    for (const layer of map.layers) {
      const safeLayerId = layer.id.replace(/-/g, '_');
      layersJS.push(`var layer_${safeLayerId} = L.layerGroup();`);

      for (const point of layer.points) {
        let lat: number, lon: number;

        if (map.config.realWorldBounds) {
          const {north, south, east, west} = map.config.realWorldBounds;
          lon = west + (point.x / map.config.width) * (east - west);
          lat = north - (point.y / map.config.height) * (north - south);
        } else {
          lat = -point.y;
          lon = point.x;
        }

        // Determine marker type based on metadata
        const isHidden = point.metadata?.hidden === true;
        const isRealWorld = point.metadata?.realWorld === true;

        let markerColor = fictionColor;
        let markerType = 'fictional';
        if (isRealWorld) {
          markerColor = realColor;
          markerType = 'real-world';
        } else if (isHidden) {
          markerColor = hiddenColor;
          markerType = 'hidden';
        }
        // Note: fictional is the default case when not real-world or hidden

        // Custom icon with color
        const iconJS = `L.divIcon({
          className: 'amalgam-marker ${markerType}',
          html: '<div style="background-color: ${markerColor}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>',
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        })`;

        const popupParts = [`<b>${this.escapeXML(point.label ?? 'Unknown')}</b>`];
        popupParts.push(`<br><i>Type: ${point.type}</i>`);
        popupParts.push(`<br><span class="marker-type ${markerType}">${markerType.toUpperCase()}</span>`);

        if (point.metadata?.description) {
          popupParts.push(`<br>${this.escapeXML(String(point.metadata.description))}`);
        }
        if (point.metadata?.realWorldName) {
          popupParts.push(`<br><small>Real-world: ${this.escapeXML(String(point.metadata.realWorldName))}</small>`);
        }
        if (point.metadata?.mundanePerception) {
          popupParts.push(`<br><small>Mundanes see: ${this.escapeXML(String(point.metadata.mundanePerception))}</small>`);
        }

        layersJS.push(`
          L.marker([${lat}, ${lon}], {icon: ${iconJS}})
            .bindPopup('${popupParts.join('')}')
            .addTo(layer_${safeLayerId});
        `);
      }

      // Add paths
      for (const path of layer.paths) {
        const coords = path.points.map(p => {
          if (map.config.realWorldBounds) {
            const {north, south, east, west} = map.config.realWorldBounds;
            const lon = west + (p.x / map.config.width) * (east - west);
            const lat = north - (p.y / map.config.height) * (north - south);
            return `[${lat}, ${lon}]`;
          }
          return `[${-p.y}, ${p.x}]`;
        });

        const pathColor = path.metadata?.fictional ? fictionColor :
                         path.type === 'river' ? '#4169E1' :
                         path.type === 'road' ? '#8B4513' : '#666666';

        layersJS.push(`
          L.polyline([${coords.join(', ')}], {color: '${pathColor}', weight: 3})
            .addTo(layer_${safeLayerId});
        `);
      }

      layersJS.push(`layer_${safeLayerId}.addTo(map);`);
    }

    // Layer control
    const layerControlJS = map.layers.length > 1 ? `
      var overlays = {
        ${map.layers.map(l => `"${l.name}": layer_${l.id.replace(/-/g, '_')}`).join(',\n        ')}
      };
      L.control.layers(baseMaps, overlays).addTo(map);
    ` : '';

    // Info box with amalgam details
    const infoBoxHTML = amalgamInfo ? `
      <div class="amalgam-info">
        <h3>${this.escapeXML(amalgamInfo.worldName)}</h3>
        <p><strong>Reality Type:</strong> ${this.escapeXML(amalgamInfo.realityType)}</p>
        ${amalgamInfo.divergencePoint ? `<p><strong>Divergence:</strong> ${this.escapeXML(amalgamInfo.divergencePoint)}</p>` : ''}
        ${amalgamInfo.mundaneAwareness ? `<p><strong>Mundane Awareness:</strong> ${this.escapeXML(amalgamInfo.mundaneAwareness)}</p>` : ''}
      </div>
    ` : '';

    // Legend
    const legendHTML = showLegend ? `
      <div class="map-legend">
        <h4>Legend</h4>
        ${realWorldLayer ? `<div><span class="legend-marker" style="background-color: ${realColor}"></span> Real-World Location</div>` : ''}
        ${fictionalLayer ? `<div><span class="legend-marker" style="background-color: ${fictionColor}"></span> Fictional Location</div>` : ''}
        ${fictionalLayer ? `<div><span class="legend-marker" style="background-color: ${hiddenColor}"></span> Hidden/Secret Location</div>` : ''}
      </div>
    ` : '';

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeXML(title)} - Amalgam Map</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    #map { width: 100vw; height: 100vh; }

    .map-title {
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
      background: rgba(255,255,255,0.95);
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 20px;
      font-weight: bold;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    }

    .amalgam-info {
      position: absolute;
      top: 60px;
      right: 10px;
      z-index: 1000;
      background: rgba(255,255,255,0.95);
      padding: 15px;
      border-radius: 8px;
      max-width: 300px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    }
    .amalgam-info h3 { margin: 0 0 10px 0; color: #2c3e50; }
    .amalgam-info p { margin: 5px 0; font-size: 12px; }

    .map-legend {
      position: absolute;
      bottom: 30px;
      left: 10px;
      z-index: 1000;
      background: rgba(255,255,255,0.95);
      padding: 10px 15px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    }
    .map-legend h4 { margin: 0 0 8px 0; font-size: 14px; }
    .map-legend div { font-size: 12px; margin: 4px 0; display: flex; align-items: center; }
    .legend-marker {
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-right: 8px;
      border: 2px solid white;
      box-shadow: 0 0 2px rgba(0,0,0,0.3);
    }

    .marker-type {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 10px;
      margin-top: 4px;
    }
    .marker-type.real-world { background: ${realColor}; color: white; }
    .marker-type.fictional { background: ${fictionColor}; color: white; }
    .marker-type.hidden { background: ${hiddenColor}; color: white; }

    .leaflet-popup-content { min-width: 150px; }
  </style>
</head>
<body>
  <div class="map-title">${this.escapeXML(title)}</div>
  ${infoBoxHTML}
  ${legendHTML}
  <div id="map"></div>
  <script>
    var map = L.map('map').setView([${centerLat}, ${centerLon}], 12);

    // Base map layers
    var osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    });

    var satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri',
      maxZoom: 19
    });

    var baseMaps = {
      "Street Map": osmLayer,
      "Satellite": satelliteLayer
    };

    osmLayer.addTo(map);

    ${layersJS.join('\n    ')}

    ${layerControlJS}

    ${map.config.realWorldBounds ? `
    map.fitBounds([
      [${map.config.realWorldBounds.south}, ${map.config.realWorldBounds.west}],
      [${map.config.realWorldBounds.north}, ${map.config.realWorldBounds.east}]
    ]);
    ` : ''}
  </script>
</body>
</html>`;
  }

  /**
   * Add a fictional overlay point to a real-world map
   */
  addFictionalOverlayPoint(
    mapId: string,
    lat: number,
    lon: number,
    data: {
      label: string;
      type: PointType;
      description?: string;
      realWorldName?: string;
      isFictional?: boolean;
      isHidden?: boolean;
      mundanePerception?: string;
      accessRequirements?: string[];
    },
    layerId: string = 'default'
  ): MapPoint | null {
    const coords = this.realWorldToPixel(mapId, lat, lon);
    if (!coords) return null;

    return this.addPoint(mapId, {
      x: coords.x,
      y: coords.y,
      label: data.label,
      type: data.type,
      metadata: {
        description: data.description,
        realWorldName: data.realWorldName,
        fictional: data.isFictional ?? true,
        hidden: data.isHidden ?? false,
        realWorld: false,
        mundanePerception: data.mundanePerception,
        accessRequirements: data.accessRequirements
      }
    }, layerId);
  }

  /**
   * Add a real-world reference point to a fictional overlay map
   */
  addRealWorldReferencePoint(
    mapId: string,
    lat: number,
    lon: number,
    data: {
      label: string;
      type: PointType;
      description?: string;
      fictionalSignificance?: string;
    },
    layerId: string = 'default'
  ): MapPoint | null {
    const coords = this.realWorldToPixel(mapId, lat, lon);
    if (!coords) return null;

    return this.addPoint(mapId, {
      x: coords.x,
      y: coords.y,
      label: data.label,
      type: data.type,
      metadata: {
        description: data.description,
        fictional: false,
        hidden: false,
        realWorld: true,
        fictionalSignificance: data.fictionalSignificance
      }
    }, layerId);
  }

  /**
   * Create an amalgam location layer for mixing real and fictional elements
   */
  createAmalgamLayer(
    mapId: string,
    name: string,
    layerType: 'fictional' | 'real_reference' | 'hidden' | 'mixed'
  ): MapLayer {
    const layer = this.addLayer(mapId, name);

    // Store layer type in map metadata
    const map = this.maps.get(mapId);
    if (map) {
      if (!map.metadata.amalgamLayers) {
        map.metadata.amalgamLayers = {};
      }
      (map.metadata.amalgamLayers as Record<string, string>)[layer.id] = layerType;
    }

    return layer;
  }
}

export default MapVisualizer;
