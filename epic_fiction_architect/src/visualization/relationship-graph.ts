/**
 * Epic Fiction Architect - Relationship Graph Visualizer
 *
 * D3.js force-directed graph visualization for character relationships.
 * Supports:
 * - Interactive node dragging
 * - Zoom and pan
 * - Temporal filtering (view relationships at specific story time)
 * - Color coding by relationship type
 * - Centrality-based node sizing
 */

import type {
  GraphNode,
  GraphLink,
  GraphData,
  RelationshipGraphConfig,
  RelationshipColorScheme,
  SVGExportOptions
} from './types';

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const defaultColorScheme: RelationshipColorScheme = {
  family: '#8B4513',      // Saddle brown
  romantic: '#FF69B4',    // Hot pink
  friendship: '#4169E1',  // Royal blue
  professional: '#808080', // Gray
  antagonistic: '#DC143C', // Crimson
  neutral: '#A9A9A9'      // Dark gray
};

const defaultConfig: RelationshipGraphConfig = {
  width: 800,
  height: 600,
  nodeRadius: 10,
  linkWidth: 2,
  colorScheme: defaultColorScheme,
  showLabels: true,
  showArrows: true,
  enableZoom: true,
  enableDrag: true,
  chargeStrength: -300,
  linkDistance: 100
};

// ============================================================================
// RELATIONSHIP GRAPH ENGINE
// ============================================================================

export class RelationshipGraphVisualizer {
  private config: RelationshipGraphConfig;
  private graphData: GraphData | null = null;

  constructor(config: Partial<RelationshipGraphConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Set graph data
   */
  setData(data: GraphData): void {
    this.graphData = data;
    this.computeNodeMetrics();
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<RelationshipGraphConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Compute node metrics (connection count, centrality)
   */
  private computeNodeMetrics(): void {
    if (!this.graphData) return;

    const { nodes, links } = this.graphData;

    // Reset metrics
    for (const node of nodes) {
      node.connectionCount = 0;
      node.centralityScore = 0;
    }

    // Count connections
    for (const link of links) {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;

      const sourceNode = nodes.find(n => n.id === sourceId);
      const targetNode = nodes.find(n => n.id === targetId);

      if (sourceNode) sourceNode.connectionCount = (sourceNode.connectionCount || 0) + 1;
      if (targetNode) targetNode.connectionCount = (targetNode.connectionCount || 0) + 1;
    }

    // Compute centrality (simple degree centrality)
    const maxConnections = Math.max(...nodes.map(n => n.connectionCount || 0));
    for (const node of nodes) {
      node.centralityScore = maxConnections > 0
        ? (node.connectionCount || 0) / maxConnections
        : 0;
    }
  }

  /**
   * Filter graph data by temporal constraints
   */
  filterByTime(chapter?: number, _dateRange?: { start: string; end: string }): GraphData {
    if (!this.graphData) return { nodes: [], links: [] };

    let filteredLinks = [...this.graphData.links];

    if (chapter !== undefined) {
      filteredLinks = filteredLinks.filter(link => {
        const startChapter = link.startChapter ?? 0;
        const endChapter = link.endChapter ?? Infinity;
        return chapter >= startChapter && chapter <= endChapter;
      });
    }

    // Get nodes that have at least one connection after filtering
    const connectedNodeIds = new Set<string>();
    for (const link of filteredLinks) {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;
      connectedNodeIds.add(sourceId);
      connectedNodeIds.add(targetId);
    }

    const filteredNodes = this.graphData.nodes.filter(node =>
      connectedNodeIds.has(node.id)
    );

    return { nodes: filteredNodes, links: filteredLinks };
  }

  /**
   * Get node color based on type or group
   */
  getNodeColor(node: GraphNode): string {
    const colors: Record<string, string> = {
      character: '#4CAF50',
      location: '#2196F3',
      organization: '#9C27B0',
      event: '#FF9800'
    };
    return colors[node.type] || '#607D8B';
  }

  /**
   * Get link color based on relationship type
   */
  getLinkColor(link: GraphLink): string {
    const type = link.type.toLowerCase();

    // Family relationships
    if (['parent', 'child', 'sibling', 'spouse', 'grandparent', 'grandchild', 'cousin'].includes(type)) {
      return this.config.colorScheme.family;
    }

    // Romantic relationships
    if (['romantic_interest', 'dating', 'engaged', 'married', 'ex_partner', 'unrequited_love'].includes(type)) {
      return this.config.colorScheme.romantic;
    }

    // Friendship/social
    if (['friend', 'best_friend', 'ally', 'acquaintance'].includes(type)) {
      return this.config.colorScheme.friendship;
    }

    // Professional
    if (['employer', 'employee', 'mentor', 'mentee', 'colleague', 'business_partner'].includes(type)) {
      return this.config.colorScheme.professional;
    }

    // Antagonistic
    if (['enemy', 'rival', 'nemesis'].includes(type)) {
      return this.config.colorScheme.antagonistic;
    }

    return this.config.colorScheme.neutral;
  }

  /**
   * Get node radius based on importance or centrality
   */
  getNodeRadius(node: GraphNode): number {
    if (typeof this.config.nodeRadius === 'function') {
      return this.config.nodeRadius(node);
    }

    const baseRadius = this.config.nodeRadius;
    const centralityMultiplier = 1 + (node.centralityScore || 0);
    return baseRadius * centralityMultiplier;
  }

  /**
   * Get link width based on strength
   */
  getLinkWidth(link: GraphLink): number {
    if (typeof this.config.linkWidth === 'function') {
      return this.config.linkWidth(link);
    }

    const baseWidth = this.config.linkWidth;
    return baseWidth * (0.5 + link.strength * 0.5);
  }

  /**
   * Render to SVG string
   */
  renderToSVG(options: Partial<SVGExportOptions> = {}): string {
    if (!this.graphData) return '<svg></svg>';

    const width = options.width || this.config.width;
    const height = options.height || this.config.height;
    const backgroundColor = options.backgroundColor || '#ffffff';

    // Simple static layout (for export, not interactive)
    const nodes = this.graphData.nodes;
    const links = this.graphData.links;

    // Position nodes in a circle for static export
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;

    nodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / nodes.length;
      node.x = centerX + radius * Math.cos(angle);
      node.y = centerY + radius * Math.sin(angle);
    });

    // Build SVG
    const svgLines: string[] = [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
      `  <rect width="100%" height="100%" fill="${backgroundColor}"/>`,
      '  <g class="links">'
    ];

    // Render links
    for (const link of links) {
      const sourceNode = nodes.find(n => n.id === (typeof link.source === 'string' ? link.source : link.source.id));
      const targetNode = nodes.find(n => n.id === (typeof link.target === 'string' ? link.target : link.target.id));

      if (sourceNode?.x !== undefined && sourceNode?.y !== undefined &&
          targetNode?.x !== undefined && targetNode?.y !== undefined) {
        const color = this.getLinkColor(link);
        const width = this.getLinkWidth(link);
        svgLines.push(
          `    <line x1="${sourceNode.x}" y1="${sourceNode.y}" x2="${targetNode.x}" y2="${targetNode.y}" ` +
          `stroke="${color}" stroke-width="${width}" opacity="0.6"/>`
        );
      }
    }

    svgLines.push('  </g>');
    svgLines.push('  <g class="nodes">');

    // Render nodes
    for (const node of nodes) {
      if (node.x !== undefined && node.y !== undefined) {
        const color = this.getNodeColor(node);
        const radius = this.getNodeRadius(node);

        svgLines.push(
          `    <circle cx="${node.x}" cy="${node.y}" r="${radius}" fill="${color}" stroke="#fff" stroke-width="2"/>`
        );

        if (this.config.showLabels) {
          svgLines.push(
            `    <text x="${node.x}" y="${node.y + radius + 12}" text-anchor="middle" font-size="10" fill="#333">${this.escapeXml(node.name)}</text>`
          );
        }
      }
    }

    svgLines.push('  </g>');
    svgLines.push('</svg>');

    return svgLines.join('\n');
  }

  /**
   * Render to standalone HTML with D3 interactivity
   */
  renderToHTML(): string {
    if (!this.graphData) return '<html><body>No data</body></html>';

    const { width, height } = this.config;
    const nodesJson = JSON.stringify(this.graphData.nodes);
    const linksJson = JSON.stringify(this.graphData.links);
    const configJson = JSON.stringify(this.config);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relationship Graph</title>
  <script src="https://d3js.org/d3.v7.min.js"></script>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; }
    svg { display: block; }
    .node { cursor: pointer; }
    .node:hover { stroke-width: 3px; }
    .link { stroke-opacity: 0.6; }
    .label { pointer-events: none; user-select: none; }
    .tooltip {
      position: absolute;
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s;
    }
  </style>
</head>
<body>
  <div id="graph"></div>
  <div class="tooltip" id="tooltip"></div>
  <script>
    const nodes = ${nodesJson};
    const links = ${linksJson};
    const config = ${configJson};

    const width = ${width};
    const height = ${height};

    const svg = d3.select('#graph')
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g');

    // Zoom behavior
    if (config.enableZoom) {
      const zoom = d3.zoom()
        .scaleExtent([0.1, 10])
        .on('zoom', (event) => g.attr('transform', event.transform));
      svg.call(zoom);
    }

    // Force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(config.linkDistance))
      .force('charge', d3.forceManyBody().strength(config.chargeStrength))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => getNodeRadius(d) + 5));

    // Draw links
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('class', 'link')
      .attr('stroke', d => getLinkColor(d.type))
      .attr('stroke-width', d => config.linkWidth * (0.5 + d.strength * 0.5));

    // Draw nodes
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('class', 'node')
      .attr('r', d => getNodeRadius(d))
      .attr('fill', d => getNodeColor(d.type))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Add labels
    if (config.showLabels) {
      const labels = g.append('g')
        .attr('class', 'labels')
        .selectAll('text')
        .data(nodes)
        .join('text')
        .attr('class', 'label')
        .text(d => d.name)
        .attr('font-size', 10)
        .attr('text-anchor', 'middle')
        .attr('dy', d => getNodeRadius(d) + 12);

      simulation.on('tick', () => {
        link
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);
        node
          .attr('cx', d => d.x)
          .attr('cy', d => d.y);
        labels
          .attr('x', d => d.x)
          .attr('y', d => d.y);
      });
    } else {
      simulation.on('tick', () => {
        link
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);
        node
          .attr('cx', d => d.x)
          .attr('cy', d => d.y);
      });
    }

    // Drag behavior
    if (config.enableDrag) {
      node.call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));
    }

    // Tooltip
    const tooltip = d3.select('#tooltip');
    node.on('mouseover', (event, d) => {
      tooltip.style('opacity', 1)
        .html(d.name + '<br>Connections: ' + (d.connectionCount || 0))
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px');
    }).on('mouseout', () => {
      tooltip.style('opacity', 0);
    });

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    function getNodeColor(type) {
      const colors = {
        character: '#4CAF50',
        location: '#2196F3',
        organization: '#9C27B0',
        event: '#FF9800'
      };
      return colors[type] || '#607D8B';
    }

    function getLinkColor(type) {
      const t = type.toLowerCase();
      if (['parent', 'child', 'sibling', 'spouse'].includes(t)) return '${this.config.colorScheme.family}';
      if (['romantic_interest', 'dating', 'married'].includes(t)) return '${this.config.colorScheme.romantic}';
      if (['friend', 'best_friend', 'ally'].includes(t)) return '${this.config.colorScheme.friendship}';
      if (['employer', 'employee', 'mentor'].includes(t)) return '${this.config.colorScheme.professional}';
      if (['enemy', 'rival', 'nemesis'].includes(t)) return '${this.config.colorScheme.antagonistic}';
      return '${this.config.colorScheme.neutral}';
    }

    function getNodeRadius(d) {
      const base = config.nodeRadius;
      const centrality = d.centralityScore || 0;
      return base * (1 + centrality);
    }
  </script>
</body>
</html>`;
  }

  /**
   * Get graph data in JSON format
   */
  getGraphJSON(): string {
    return JSON.stringify(this.graphData, null, 2);
  }

  /**
   * Get statistics about the graph
   */
  getStatistics(): {
    nodeCount: number;
    linkCount: number;
    avgConnections: number;
    mostConnected: GraphNode | null;
    clusters: number;
  } {
    if (!this.graphData) {
      return {
        nodeCount: 0,
        linkCount: 0,
        avgConnections: 0,
        mostConnected: null,
        clusters: 0
      };
    }

    const { nodes, links } = this.graphData;

    const avgConnections = nodes.length > 0
      ? nodes.reduce((sum, n) => sum + (n.connectionCount || 0), 0) / nodes.length
      : 0;

    const mostConnected = nodes.length > 0
      ? nodes.reduce((max, n) => (n.connectionCount || 0) > (max.connectionCount || 0) ? n : max)
      : null;

    return {
      nodeCount: nodes.length,
      linkCount: links.length,
      avgConnections: Math.round(avgConnections * 10) / 10,
      mostConnected,
      clusters: this.estimateClusters()
    };
  }

  /**
   * Estimate number of clusters using simple connected components
   */
  private estimateClusters(): number {
    if (!this.graphData || this.graphData.nodes.length === 0) return 0;

    const { nodes, links } = this.graphData;
    const visited = new Set<string>();
    let clusterCount = 0;

    const adjacency = new Map<string, Set<string>>();
    for (const node of nodes) {
      adjacency.set(node.id, new Set());
    }

    for (const link of links) {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;
      adjacency.get(sourceId)?.add(targetId);
      adjacency.get(targetId)?.add(sourceId);
    }

    for (const node of nodes) {
      if (!visited.has(node.id)) {
        clusterCount++;
        const queue = [node.id];

        while (queue.length > 0) {
          const current = queue.shift()!;
          if (visited.has(current)) continue;
          visited.add(current);

          const neighbors = adjacency.get(current) || new Set();
          for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
              queue.push(neighbor);
            }
          }
        }
      }
    }

    return clusterCount;
  }

  /**
   * Escape XML special characters
   */
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

export default RelationshipGraphVisualizer;
