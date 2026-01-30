/**
 * Knowledge Graph Engine
 *
 * Entity-relationship graph with temporal awareness for tracking:
 * - Characters and their relationships over time
 * - Locations and their connections
 * - Objects and ownership
 * - Events and causality
 * - Knowledge and secrets
 *
 * Features:
 * - Temporal queries (state at any point in narrative time)
 * - Path finding between entities
 * - Community detection
 * - Centrality analysis
 * - Change tracking
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  GraphNode,
  GraphEdge,
  EdgeChange,
  NodeType,
  EdgeType,
  GraphQuery,
  GraphQueryResult,
  Subgraph,
  GraphPath,
  NodeCentrality,
  CommunityDetection,
  KnowledgeGraphConfig
} from './types';
import { defaultKnowledgeGraphConfig } from './types';

// Re-export types
export * from './types';

// ============================================================================
// Knowledge Graph Engine
// ============================================================================

export class KnowledgeGraphEngine {
  // Node storage
  private nodes: Map<string, GraphNode> = new Map();
  private nodesByType: Map<NodeType, Set<string>> = new Map();
  private nodesByName: Map<string, string> = new Map(); // name -> nodeId

  // Edge storage
  private edges: Map<string, GraphEdge> = new Map();
  private edgesBySource: Map<string, Set<string>> = new Map();
  private edgesByTarget: Map<string, Set<string>> = new Map();
  private edgesByType: Map<EdgeType, Set<string>> = new Map();

  // Change tracking
  private changes: Map<string, EdgeChange> = new Map();
  private changesByEdge: Map<string, string[]> = new Map();

  // Cached analysis
  private centralityCache: Map<string, NodeCentrality> = new Map();
  private centralityCacheValid = false;

  // Configuration
  private config: KnowledgeGraphConfig;

  constructor(config: Partial<KnowledgeGraphConfig> = {}) {
    this.config = { ...defaultKnowledgeGraphConfig, ...config };
  }

  // ============================================================================
  // Node Management
  // ============================================================================

  /**
   * Create a new node
   */
  createNode(input: {
    nodeType: NodeType;
    name: string;
    aliases?: string[];
    properties?: Record<string, unknown>;
    introducedAt?: number;
    sourceSceneId?: string;
  }): GraphNode {
    // Check for existing node with same name
    const existingId = this.nodesByName.get(input.name.toLowerCase());
    if (existingId) {
      const existing = this.nodes.get(existingId);
      if (existing) {
        // Update existing node
        return this.updateNode(existingId, {
          sourceSceneIds: input.sourceSceneId
            ? [...existing.sourceSceneIds, input.sourceSceneId]
            : existing.sourceSceneIds
        })!;
      }
    }

    const node: GraphNode = {
      nodeId: uuidv4(),
      nodeType: input.nodeType,
      name: input.name,
      aliases: input.aliases || [],
      properties: input.properties || {},
      introducedAt: input.introducedAt,
      sourceSceneIds: input.sourceSceneId ? [input.sourceSceneId] : [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Store
    this.nodes.set(node.nodeId, node);

    // Index by type
    if (!this.nodesByType.has(node.nodeType)) {
      this.nodesByType.set(node.nodeType, new Set());
    }
    this.nodesByType.get(node.nodeType)!.add(node.nodeId);

    // Index by name
    this.nodesByName.set(node.name.toLowerCase(), node.nodeId);
    for (const alias of node.aliases) {
      this.nodesByName.set(alias.toLowerCase(), node.nodeId);
    }

    // Invalidate centrality cache
    this.centralityCacheValid = false;

    return node;
  }

  /**
   * Get a node by ID
   */
  getNode(nodeId: string): GraphNode | undefined {
    return this.nodes.get(nodeId);
  }

  /**
   * Find node by name or alias
   */
  findNodeByName(name: string): GraphNode | undefined {
    const nodeId = this.nodesByName.get(name.toLowerCase());
    return nodeId ? this.nodes.get(nodeId) : undefined;
  }

  /**
   * Update a node
   */
  updateNode(nodeId: string, updates: Partial<Omit<GraphNode, 'nodeId' | 'createdAt'>>): GraphNode | undefined {
    const node = this.nodes.get(nodeId);
    if (!node) return undefined;

    Object.assign(node, updates, { updatedAt: new Date() });

    // Update name index if name changed
    if (updates.name) {
      // Remove old name
      this.nodesByName.delete(node.name.toLowerCase());
      // Add new name
      this.nodesByName.set(updates.name.toLowerCase(), nodeId);
    }

    // Update alias index if aliases changed
    if (updates.aliases) {
      // Remove old aliases
      for (const alias of node.aliases) {
        if (this.nodesByName.get(alias.toLowerCase()) === nodeId) {
          this.nodesByName.delete(alias.toLowerCase());
        }
      }
      // Add new aliases
      for (const alias of updates.aliases) {
        this.nodesByName.set(alias.toLowerCase(), nodeId);
      }
    }

    return node;
  }

  /**
   * Get nodes by type
   */
  getNodesByType(nodeType: NodeType): GraphNode[] {
    const nodeIds = this.nodesByType.get(nodeType) || new Set();
    return Array.from(nodeIds)
      .map(id => this.nodes.get(id))
      .filter((n): n is GraphNode => n !== undefined);
  }

  // ============================================================================
  // Edge Management
  // ============================================================================

  /**
   * Create an edge between nodes
   */
  createEdge(input: {
    edgeType: EdgeType;
    sourceNodeId: string;
    targetNodeId: string;
    subtype?: string;
    strength?: number;
    sentiment?: 'positive' | 'negative' | 'neutral' | 'complex';
    bidirectional?: boolean;
    validFrom: number;
    validUntil?: number;
    properties?: Record<string, unknown>;
    sourceSceneId?: string;
  }): GraphEdge {
    // Verify nodes exist or auto-create
    if (!this.nodes.has(input.sourceNodeId)) {
      if (this.config.autoCreateNodes) {
        this.createNode({
          nodeType: 'concept',
          name: `Unknown_${input.sourceNodeId.slice(0, 8)}`
        });
      } else {
        throw new Error(`Source node not found: ${input.sourceNodeId}`);
      }
    }

    if (!this.nodes.has(input.targetNodeId)) {
      if (this.config.autoCreateNodes) {
        this.createNode({
          nodeType: 'concept',
          name: `Unknown_${input.targetNodeId.slice(0, 8)}`
        });
      } else {
        throw new Error(`Target node not found: ${input.targetNodeId}`);
      }
    }

    const isBidirectional = input.bidirectional ??
      this.config.bidirectionalTypes.includes(input.edgeType);

    const edge: GraphEdge = {
      edgeId: uuidv4(),
      edgeType: input.edgeType,
      sourceNodeId: input.sourceNodeId,
      targetNodeId: input.targetNodeId,
      subtype: input.subtype,
      strength: input.strength ?? this.config.defaultStrength,
      sentiment: input.sentiment || 'neutral',
      bidirectional: isBidirectional,
      validFrom: input.validFrom,
      validUntil: input.validUntil,
      properties: input.properties || {},
      sourceSceneIds: input.sourceSceneId ? [input.sourceSceneId] : [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Store
    this.edges.set(edge.edgeId, edge);

    // Index by source
    if (!this.edgesBySource.has(edge.sourceNodeId)) {
      this.edgesBySource.set(edge.sourceNodeId, new Set());
    }
    this.edgesBySource.get(edge.sourceNodeId)!.add(edge.edgeId);

    // Index by target
    if (!this.edgesByTarget.has(edge.targetNodeId)) {
      this.edgesByTarget.set(edge.targetNodeId, new Set());
    }
    this.edgesByTarget.get(edge.targetNodeId)!.add(edge.edgeId);

    // Index by type
    if (!this.edgesByType.has(edge.edgeType)) {
      this.edgesByType.set(edge.edgeType, new Set());
    }
    this.edgesByType.get(edge.edgeType)!.add(edge.edgeId);

    // Track change
    if (this.config.trackChanges) {
      this.recordChange(edge.edgeId, 'created', input.validFrom, edge, undefined, 'Edge created');
    }

    // Invalidate centrality cache
    this.centralityCacheValid = false;

    return edge;
  }

  /**
   * Get edge by ID
   */
  getEdge(edgeId: string): GraphEdge | undefined {
    return this.edges.get(edgeId);
  }

  /**
   * Update an edge
   */
  updateEdge(
    edgeId: string,
    updates: Partial<Omit<GraphEdge, 'edgeId' | 'sourceNodeId' | 'targetNodeId' | 'createdAt'>>,
    storyTime: number,
    reason?: string
  ): GraphEdge | undefined {
    const edge = this.edges.get(edgeId);
    if (!edge) return undefined;

    const previousValues = { ...edge };
    Object.assign(edge, updates, { updatedAt: new Date() });

    // Track change
    if (this.config.trackChanges) {
      this.recordChange(edgeId, 'modified', storyTime, updates, previousValues, reason || 'Edge modified');
    }

    return edge;
  }

  /**
   * End an edge (set validUntil)
   */
  endEdge(edgeId: string, storyTime: number, reason?: string): GraphEdge | undefined {
    return this.updateEdge(edgeId, { validUntil: storyTime }, storyTime, reason || 'Relationship ended');
  }

  /**
   * Get edges for a node
   */
  getEdgesForNode(
    nodeId: string,
    direction: 'outgoing' | 'incoming' | 'both' = 'both',
    atTime?: number
  ): GraphEdge[] {
    const edgeIds = new Set<string>();

    if (direction === 'outgoing' || direction === 'both') {
      const outgoing = this.edgesBySource.get(nodeId);
      if (outgoing) outgoing.forEach(id => edgeIds.add(id));
    }

    if (direction === 'incoming' || direction === 'both') {
      const incoming = this.edgesByTarget.get(nodeId);
      if (incoming) incoming.forEach(id => edgeIds.add(id));

      // Also add bidirectional edges where this node is target
      for (const edge of this.edges.values()) {
        if (edge.bidirectional && edge.targetNodeId === nodeId) {
          edgeIds.add(edge.edgeId);
        }
      }
    }

    let edges = Array.from(edgeIds)
      .map(id => this.edges.get(id))
      .filter((e): e is GraphEdge => e !== undefined);

    // Filter by time if specified
    if (atTime !== undefined) {
      edges = edges.filter(e =>
        e.validFrom <= atTime && (e.validUntil === undefined || e.validUntil >= atTime)
      );
    }

    return edges;
  }

  /**
   * Record an edge change
   */
  private recordChange(
    edgeId: string,
    changeType: EdgeChange['changeType'],
    storyTime: number,
    newValues?: Partial<GraphEdge>,
    previousValues?: Partial<GraphEdge>,
    reason = ''
  ): void {
    const change: EdgeChange = {
      changeId: uuidv4(),
      edgeId,
      changeType,
      storyTime,
      previousValues,
      newValues,
      reason,
      timestamp: new Date()
    };

    this.changes.set(change.changeId, change);

    if (!this.changesByEdge.has(edgeId)) {
      this.changesByEdge.set(edgeId, []);
    }
    this.changesByEdge.get(edgeId)!.push(change.changeId);
  }

  // ============================================================================
  // Querying
  // ============================================================================

  /**
   * Execute a graph query
   */
  query(query: GraphQuery): GraphQueryResult {
    const startTime = performance.now();
    let nodes: GraphNode[] = [];
    let edges: GraphEdge[] = [];

    // If starting from a specific node, do traversal
    if (query.startNodeId) {
      const result = this.traverse(
        query.startNodeId,
        query.maxDepth || 2,
        query.direction || 'both',
        query.atTime
      );
      nodes = result.nodes;
      edges = result.edges;
    } else {
      // Otherwise, filter all nodes and edges
      nodes = Array.from(this.nodes.values());
      edges = Array.from(this.edges.values());
    }

    // Filter nodes
    if (query.nodeIds) {
      const nodeIdSet = new Set(query.nodeIds);
      nodes = nodes.filter(n => nodeIdSet.has(n.nodeId));
    }

    if (query.nodeTypes) {
      const typeSet = new Set(query.nodeTypes);
      nodes = nodes.filter(n => typeSet.has(n.nodeType));
    }

    if (query.nodeNamePattern) {
      const pattern = new RegExp(query.nodeNamePattern, 'i');
      nodes = nodes.filter(n =>
        pattern.test(n.name) || n.aliases.some(a => pattern.test(a))
      );
    }

    // Filter edges
    if (query.edgeTypes) {
      const typeSet = new Set(query.edgeTypes);
      edges = edges.filter(e => typeSet.has(e.edgeType));
    }

    if (query.minStrength !== undefined) {
      edges = edges.filter(e => e.strength >= query.minStrength!);
    }

    if (query.sentiments) {
      const sentimentSet = new Set(query.sentiments);
      edges = edges.filter(e => sentimentSet.has(e.sentiment));
    }

    // Temporal filtering
    if (query.atTime !== undefined) {
      nodes = nodes.filter(n =>
        (n.introducedAt === undefined || n.introducedAt <= query.atTime!) &&
        (n.removedAt === undefined || n.removedAt >= query.atTime!)
      );
      edges = edges.filter(e =>
        e.validFrom <= query.atTime! &&
        (e.validUntil === undefined || e.validUntil >= query.atTime!)
      );
    }

    if (query.fromTime !== undefined) {
      nodes = nodes.filter(n =>
        n.introducedAt === undefined || n.introducedAt >= query.fromTime!
      );
      edges = edges.filter(e => e.validFrom >= query.fromTime!);
    }

    if (query.toTime !== undefined) {
      edges = edges.filter(e => e.validFrom <= query.toTime!);
    }

    // Apply limit
    if (query.limit) {
      nodes = nodes.slice(0, query.limit);
      edges = edges.slice(0, query.limit);
    }

    // Only include requested data
    if (query.includeNodes === false) nodes = [];
    if (query.includeEdges === false) edges = [];

    return {
      nodes,
      edges,
      queryTime: performance.now() - startTime,
      totalNodes: this.nodes.size,
      totalEdges: this.edges.size
    };
  }

  /**
   * Traverse the graph from a starting node
   */
  private traverse(
    startNodeId: string,
    maxDepth: number,
    direction: 'outgoing' | 'incoming' | 'both',
    atTime?: number
  ): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const visitedNodes = new Set<string>();
    const visitedEdges = new Set<string>();
    const queue: { nodeId: string; depth: number }[] = [{ nodeId: startNodeId, depth: 0 }];

    while (queue.length > 0) {
      const { nodeId, depth } = queue.shift()!;

      if (visitedNodes.has(nodeId) || depth > maxDepth) continue;
      visitedNodes.add(nodeId);

      // Get edges for this node
      const nodeEdges = this.getEdgesForNode(nodeId, direction, atTime);

      for (const edge of nodeEdges) {
        if (visitedEdges.has(edge.edgeId)) continue;
        visitedEdges.add(edge.edgeId);

        // Queue the other node
        const otherNodeId = edge.sourceNodeId === nodeId ? edge.targetNodeId : edge.sourceNodeId;
        if (!visitedNodes.has(otherNodeId)) {
          queue.push({ nodeId: otherNodeId, depth: depth + 1 });
        }
      }
    }

    return {
      nodes: Array.from(visitedNodes).map(id => this.nodes.get(id)).filter((n): n is GraphNode => n !== undefined),
      edges: Array.from(visitedEdges).map(id => this.edges.get(id)).filter((e): e is GraphEdge => e !== undefined)
    };
  }

  // ============================================================================
  // Path Finding
  // ============================================================================

  /**
   * Find shortest path between two nodes
   */
  findPath(
    startNodeId: string,
    endNodeId: string,
    options: {
      atTime?: number;
      maxDepth?: number;
      edgeTypes?: EdgeType[];
    } = {}
  ): GraphPath | null {
    const maxDepth = options.maxDepth || 10;

    // BFS for shortest path
    const queue: { nodeId: string; path: string[]; edges: string[] }[] = [
      { nodeId: startNodeId, path: [startNodeId], edges: [] }
    ];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const { nodeId, path, edges } = queue.shift()!;

      if (nodeId === endNodeId) {
        // Found path
        const pathEdges = edges.map(id => this.edges.get(id)).filter((e): e is GraphEdge => e !== undefined);
        const totalStrength = pathEdges.reduce((sum, e) => sum + e.strength, 0);

        return {
          pathId: uuidv4(),
          startNodeId,
          endNodeId,
          nodeIds: path,
          edgeIds: edges,
          length: edges.length,
          totalStrength,
          averageStrength: pathEdges.length > 0 ? totalStrength / pathEdges.length : 0,
          validAtTime: options.atTime
        };
      }

      if (visited.has(nodeId) || path.length > maxDepth) continue;
      visited.add(nodeId);

      // Get adjacent nodes
      let nodeEdges = this.getEdgesForNode(nodeId, 'both', options.atTime);

      // Filter by edge types if specified
      if (options.edgeTypes) {
        const typeSet = new Set(options.edgeTypes);
        nodeEdges = nodeEdges.filter(e => typeSet.has(e.edgeType));
      }

      for (const edge of nodeEdges) {
        const nextNodeId = edge.sourceNodeId === nodeId ? edge.targetNodeId : edge.sourceNodeId;
        if (!visited.has(nextNodeId)) {
          queue.push({
            nodeId: nextNodeId,
            path: [...path, nextNodeId],
            edges: [...edges, edge.edgeId]
          });
        }
      }
    }

    return null; // No path found
  }

  /**
   * Find all paths between two nodes
   */
  findAllPaths(
    startNodeId: string,
    endNodeId: string,
    options: {
      atTime?: number;
      maxDepth?: number;
      maxPaths?: number;
    } = {}
  ): GraphPath[] {
    const paths: GraphPath[] = [];
    const maxDepth = options.maxDepth || 5;
    const maxPaths = options.maxPaths || 10;

    const dfs = (nodeId: string, path: string[], edges: string[], visited: Set<string>): void => {
      if (paths.length >= maxPaths) return;
      if (path.length > maxDepth) return;

      if (nodeId === endNodeId) {
        const pathEdges = edges.map(id => this.edges.get(id)).filter((e): e is GraphEdge => e !== undefined);
        const totalStrength = pathEdges.reduce((sum, e) => sum + e.strength, 0);

        paths.push({
          pathId: uuidv4(),
          startNodeId,
          endNodeId,
          nodeIds: path,
          edgeIds: edges,
          length: edges.length,
          totalStrength,
          averageStrength: pathEdges.length > 0 ? totalStrength / pathEdges.length : 0,
          validAtTime: options.atTime
        });
        return;
      }

      visited.add(nodeId);

      const nodeEdges = this.getEdgesForNode(nodeId, 'both', options.atTime);

      for (const edge of nodeEdges) {
        const nextNodeId = edge.sourceNodeId === nodeId ? edge.targetNodeId : edge.sourceNodeId;
        if (!visited.has(nextNodeId)) {
          dfs(nextNodeId, [...path, nextNodeId], [...edges, edge.edgeId], new Set(visited));
        }
      }
    };

    dfs(startNodeId, [startNodeId], [], new Set());

    return paths;
  }

  // ============================================================================
  // Analysis
  // ============================================================================

  /**
   * Calculate centrality measures for all nodes
   */
  calculateCentrality(atTime?: number): Map<string, NodeCentrality> {
    if (this.centralityCacheValid && atTime === undefined) {
      return this.centralityCache;
    }

    const centrality = new Map<string, NodeCentrality>();

    for (const node of this.nodes.values()) {
      const edges = this.getEdgesForNode(node.nodeId, 'both', atTime);
      const inEdges = this.getEdgesForNode(node.nodeId, 'incoming', atTime);
      const outEdges = this.getEdgesForNode(node.nodeId, 'outgoing', atTime);

      centrality.set(node.nodeId, {
        nodeId: node.nodeId,
        nodeName: node.name,
        degree: edges.length,
        inDegree: inEdges.length,
        outDegree: outEdges.length
        // betweenness, closeness, pageRank require more complex algorithms
      });
    }

    if (atTime === undefined) {
      this.centralityCache = centrality;
      this.centralityCacheValid = true;
    }

    return centrality;
  }

  /**
   * Get most central nodes
   */
  getMostCentral(
    n = 10,
    metric: 'degree' | 'inDegree' | 'outDegree' = 'degree',
    atTime?: number
  ): NodeCentrality[] {
    const centrality = this.calculateCentrality(atTime);

    return Array.from(centrality.values())
      .sort((a, b) => b[metric] - a[metric])
      .slice(0, n);
  }

  /**
   * Detect communities (simple label propagation)
   */
  detectCommunities(atTime?: number): CommunityDetection {
    const labels = new Map<string, string>();
    const nodeIds = Array.from(this.nodes.keys());

    // Initialize each node with its own label
    for (const nodeId of nodeIds) {
      labels.set(nodeId, nodeId);
    }

    // Iterate until convergence
    let changed = true;
    let iterations = 0;
    const maxIterations = 100;

    while (changed && iterations < maxIterations) {
      changed = false;
      iterations++;

      // Shuffle nodes for random order
      const shuffled = [...nodeIds].sort(() => Math.random() - 0.5);

      for (const nodeId of shuffled) {
        const neighbors = this.getEdgesForNode(nodeId, 'both', atTime)
          .map(e => e.sourceNodeId === nodeId ? e.targetNodeId : e.sourceNodeId);

        if (neighbors.length === 0) continue;

        // Count neighbor labels
        const labelCounts = new Map<string, number>();
        for (const neighborId of neighbors) {
          const label = labels.get(neighborId)!;
          labelCounts.set(label, (labelCounts.get(label) || 0) + 1);
        }

        // Find most common label
        let maxCount = 0;
        let maxLabel = labels.get(nodeId)!;
        for (const [label, count] of labelCounts) {
          if (count > maxCount) {
            maxCount = count;
            maxLabel = label;
          }
        }

        if (maxLabel !== labels.get(nodeId)) {
          labels.set(nodeId, maxLabel);
          changed = true;
        }
      }
    }

    // Group nodes by label
    const communityMap = new Map<string, string[]>();
    for (const [nodeId, label] of labels) {
      if (!communityMap.has(label)) {
        communityMap.set(label, []);
      }
      communityMap.get(label)!.push(nodeId);
    }

    // Build community objects
    const communities: CommunityDetection['communities'] = [];
    for (const [communityId, members] of communityMap) {
      // Find central node
      const centrality = this.calculateCentrality(atTime);
      const centralNode = members
        .map(id => ({ id, degree: centrality.get(id)?.degree || 0 }))
        .sort((a, b) => b.degree - a.degree)[0];

      // Calculate density
      const internalEdges = this.edges.values();
      let edgeCount = 0;
      for (const edge of internalEdges) {
        if (members.includes(edge.sourceNodeId) && members.includes(edge.targetNodeId)) {
          edgeCount++;
        }
      }
      const maxEdges = members.length * (members.length - 1);
      const density = maxEdges > 0 ? edgeCount / maxEdges : 0;

      communities.push({
        communityId,
        nodeIds: members,
        centralNodeId: centralNode?.id || members[0],
        density
      });
    }

    // Sort by size
    communities.sort((a, b) => b.nodeIds.length - a.nodeIds.length);

    return {
      communities,
      modularity: 0 // Would need more complex calculation
    };
  }

  /**
   * Create a subgraph for a specific time range or entity set
   */
  createSubgraph(
    name: string,
    options: {
      nodeIds?: string[];
      nodeTypes?: NodeType[];
      fromTime?: number;
      toTime?: number;
      description?: string;
    }
  ): Subgraph {
    let nodes = Array.from(this.nodes.values());
    let edges = Array.from(this.edges.values());

    if (options.nodeIds) {
      const nodeIdSet = new Set(options.nodeIds);
      nodes = nodes.filter(n => nodeIdSet.has(n.nodeId));
    }

    if (options.nodeTypes) {
      const typeSet = new Set(options.nodeTypes);
      nodes = nodes.filter(n => typeSet.has(n.nodeType));
    }

    const nodeIdSet = new Set(nodes.map(n => n.nodeId));
    edges = edges.filter(e =>
      nodeIdSet.has(e.sourceNodeId) && nodeIdSet.has(e.targetNodeId)
    );

    if (options.fromTime !== undefined) {
      edges = edges.filter(e => e.validUntil === undefined || e.validUntil >= options.fromTime!);
    }

    if (options.toTime !== undefined) {
      edges = edges.filter(e => e.validFrom <= options.toTime!);
    }

    const nodeCount = nodes.length;
    const edgeCount = edges.length;
    const maxEdges = nodeCount * (nodeCount - 1);
    const density = maxEdges > 0 ? edgeCount / maxEdges : 0;

    return {
      subgraphId: uuidv4(),
      name,
      description: options.description || '',
      nodeIds: nodes.map(n => n.nodeId),
      edgeIds: edges.map(e => e.edgeId),
      fromTime: options.fromTime,
      toTime: options.toTime,
      nodeCount,
      edgeCount,
      density,
      createdAt: new Date()
    };
  }

  // ============================================================================
  // Statistics & Management
  // ============================================================================

  /**
   * Get graph statistics
   */
  getStats(): {
    nodeCount: number;
    nodesByType: Record<string, number>;
    edgeCount: number;
    edgesByType: Record<string, number>;
    density: number;
    changeCount: number;
  } {
    const nodesByType: Record<string, number> = {};
    for (const [type, ids] of this.nodesByType) {
      nodesByType[type] = ids.size;
    }

    const edgesByType: Record<string, number> = {};
    for (const [type, ids] of this.edgesByType) {
      edgesByType[type] = ids.size;
    }

    const n = this.nodes.size;
    const e = this.edges.size;
    const maxEdges = n * (n - 1);
    const density = maxEdges > 0 ? e / maxEdges : 0;

    return {
      nodeCount: n,
      nodesByType,
      edgeCount: e,
      edgesByType,
      density,
      changeCount: this.changes.size
    };
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.nodes.clear();
    this.nodesByType.clear();
    this.nodesByName.clear();
    this.edges.clear();
    this.edgesBySource.clear();
    this.edgesByTarget.clear();
    this.edgesByType.clear();
    this.changes.clear();
    this.changesByEdge.clear();
    this.centralityCache.clear();
    this.centralityCacheValid = false;
  }

  /**
   * Export to JSON
   */
  exportToJSON(): string {
    return JSON.stringify({
      nodes: Array.from(this.nodes.entries()),
      edges: Array.from(this.edges.entries()),
      changes: Array.from(this.changes.entries())
    }, null, 2);
  }

  /**
   * Import from JSON
   */
  importFromJSON(json: string): void {
    const data = JSON.parse(json);
    this.clear();

    // Import nodes
    for (const [id, node] of data.nodes) {
      this.nodes.set(id, node);

      if (!this.nodesByType.has(node.nodeType)) {
        this.nodesByType.set(node.nodeType, new Set());
      }
      this.nodesByType.get(node.nodeType)!.add(id);

      this.nodesByName.set(node.name.toLowerCase(), id);
      for (const alias of node.aliases) {
        this.nodesByName.set(alias.toLowerCase(), id);
      }
    }

    // Import edges
    for (const [id, edge] of data.edges) {
      this.edges.set(id, edge);

      if (!this.edgesBySource.has(edge.sourceNodeId)) {
        this.edgesBySource.set(edge.sourceNodeId, new Set());
      }
      this.edgesBySource.get(edge.sourceNodeId)!.add(id);

      if (!this.edgesByTarget.has(edge.targetNodeId)) {
        this.edgesByTarget.set(edge.targetNodeId, new Set());
      }
      this.edgesByTarget.get(edge.targetNodeId)!.add(id);

      if (!this.edgesByType.has(edge.edgeType)) {
        this.edgesByType.set(edge.edgeType, new Set());
      }
      this.edgesByType.get(edge.edgeType)!.add(id);
    }

    // Import changes
    for (const [id, change] of data.changes) {
      this.changes.set(id, change);

      if (!this.changesByEdge.has(change.edgeId)) {
        this.changesByEdge.set(change.edgeId, []);
      }
      this.changesByEdge.get(change.edgeId)!.push(id);
    }
  }
}

export default KnowledgeGraphEngine;
