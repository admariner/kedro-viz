import { HALF_PI, snap, angle, compare, groupByRow } from './common';
import { solveLoose, solveStrict } from './solver';
import {
  rowConstraint,
  layerConstraint,
  parallelConstraint,
  crossingConstraint,
  separationConstraint,
} from './constraints';
import { workflowNodeDetailsHeight } from '../../config';

/**
 * Finds positions for the given nodes relative to their edges.
 * Input nodes and edges are updated in-place.
 * Results are stored in the `x, y` properties on nodes.
 * @param {Object} params The layout parameters
 * @param {Array} params.nodes The input nodes
 * @param {Array} params.edges The input edges
 * @param {Object=} params.layers The node layers if specified
 * @param {Number} params.spaceX The minimum gap between nodes in X
 * @param {Number} params.spaceY The minimum gap between nodes in Y
 * @param {Number} params.spreadX Adjusts the gap for each node in X based on the number of connected edges it has
 * @param {Number} params.layerSpaceY The additional gap between nodes in Y between layers
 * @param {Number} params.iterations The number of solver iterations to perform
 * @returns {void}
 */
export const layout = ({
  nodes,
  edges,
  layers,
  spaceX,
  spaceY,
  spreadX,
  layerSpaceY,
  iterations,
  orientation,
  view,
}) => {
  // Height of the run status details rectangle in workflow view
  const extraVerticalGap = view === 'workflow' ? workflowNodeDetailsHeight : 0;

  let coordPrimary = 'x';
  let coordSecondary = 'y';

  if (orientation === 'horizontal') {
    coordPrimary = 'y';
    coordSecondary = 'x';
  }
  // Set initial positions for nodes
  for (const node of nodes) {
    node[coordPrimary] = 0;
    node[coordSecondary] = 0;
  }

  // layoutConfig used by constraints
  const layoutConfig = {
    orientation,
    spaceX,
    spaceY,
    spreadX,
    layerSpace: (spaceY + layerSpaceY) * 0.5,
    coordPrimary,
    coordSecondary,
    extraVerticalGap,
  };

  // Constraints to separate nodes into rows and layers
  const rowConstraints = createRowConstraints(edges, layoutConfig);
  const layerConstraints = createLayerConstraints(nodes, layers, layoutConfig);

  // Find the node positions given these constraints
  solveStrict([...rowConstraints, ...layerConstraints], layoutConfig, 1);

  // Find the solved rows using the node positions after solving
  const rows = groupByRow(nodes, orientation);

  // Constraints to avoid edges crossing and maintain parallel vertical edges
  const crossingConstraints = createCrossingConstraints(edges, layoutConfig);
  const parallelConstraints = createParallelConstraints(edges, layoutConfig);

  // Solve these constraints iteratively
  for (let i = 0; i < iterations; i += 1) {
    solveLoose(crossingConstraints, 1, layoutConfig);
    solveLoose(parallelConstraints, 50, layoutConfig);
  }

  // Constraints to maintain a minimum horizontal node spacing
  const separationConstraints = createSeparationConstraints(rows, layoutConfig);

  // Find the final node positions given these strict constraints
  solveStrict(
    [...separationConstraints, ...parallelConstraints],
    layoutConfig,
    1
  );

  // Adjust vertical spacing between rows for legibility
  expandDenseRows(edges, rows, coordSecondary, spaceY, orientation);
};

/**
 * Creates row constraints for the given edges.
 * @param {Array} edges The input edges
 * @returns {Array} The constraints
 */
const createRowConstraints = (edges, layoutConfig) =>
  edges.map((edge) => ({
    base: rowConstraint,
    property: layoutConfig.coordSecondary,
    a: edge.targetNode,
    b: edge.sourceNode,
    separation:
      layoutConfig.orientation === 'vertical'
        ? layoutConfig.spaceY + layoutConfig.extraVerticalGap
        : layoutConfig.spaceY,
  }));

/**
 * Creates layer constraints for the given nodes and layers.
 * @param {Array} nodes The input nodes
 * @param {Array=} layers The input layers if any
 * @returns {Array} The constraints
 */
const createLayerConstraints = (nodes, layers, layoutConfig) => {
  const layerConstraints = [];

  // Early out if no layers defined
  if (!layers) {
    return layerConstraints;
  }

  // Group the nodes for each layer
  const layerGroups = layers.map((name) =>
    nodes.filter((node) => node.nearestLayer === name)
  );

  // For each layer of nodes
  for (let i = 0; i < layerGroups.length - 1; i += 1) {
    const layerNodes = layerGroups[i];
    const nextLayerNodes = layerGroups[i + 1];

    // Create a temporary intermediary node for the layer
    const intermediary = { id: `layer-${i}`, x: 0, y: 0 };

    // Constrain each node in the layer to above the intermediary
    for (const node of layerNodes) {
      layerConstraints.push({
        base: layerConstraint,
        property: layoutConfig.coordSecondary,
        a: intermediary,
        b: node,
      });
    }

    // Constrain each node in the next layer to below the intermediary
    for (const node of nextLayerNodes) {
      layerConstraints.push({
        base: layerConstraint,
        property: layoutConfig.coordSecondary,
        a: node,
        b: intermediary,
      });
    }
  }

  return layerConstraints;
};

/**
 * Creates crossing constraints for the given edges.
 * @param {Array} edges The input edges
 * @param {Object} layoutConfig The constraint layoutConfig
 * @param {Number} layoutConfig.spaceX The minimum gap between nodes in X
 * @returns {Array} The constraints
 */
const createCrossingConstraints = (edges, layoutConfig) => {
  const { spaceX, coordPrimary } = layoutConfig;
  const crossingConstraints = [];

  // For every pair of edges
  for (let i = 0; i < edges.length; i += 1) {
    const edgeA = edges[i];
    const { sourceNode: sourceA, targetNode: targetA } = edgeA;

    // Count the connected edges
    const edgeADegree =
      sourceA.sources.length +
      sourceA.targets.length +
      targetA.sources.length +
      targetA.targets.length;

    for (let j = i + 1; j < edges.length; j += 1) {
      const edgeB = edges[j];
      const { sourceNode: sourceB, targetNode: targetB } = edgeB;

      // Skip if edges are not intersecting by row so can't cross
      if (sourceA.row >= targetB.row || targetA.row <= sourceB.row) {
        continue;
      }

      // Count the connected edges
      const edgeBDegree =
        sourceB.sources.length +
        sourceB.targets.length +
        targetB.sources.length +
        targetB.targets.length;

      crossingConstraints.push({
        base: crossingConstraint,
        property: coordPrimary,
        edgeA: edgeA,
        edgeB: edgeB,
        // The required horizontal spacing between connected nodes
        separationA: sourceA.width * 0.5 + spaceX + sourceB.width * 0.5,
        separationB: targetA.width * 0.5 + spaceX + targetB.width * 0.5,
        // Evenly distribute the constraint
        strength: 1 / Math.max(1, (edgeADegree + edgeBDegree) / 4),
      });
    }
  }

  return crossingConstraints;
};

/**
 * Creates parallel constraints for the given edges.
 * Returns object with additional arrays that identify these special cases:
 * - edges connected to single-degree nodes at either end
 * - edges connected to single-degree nodes at both ends
 * @param {Array} edges The input edges
 * @returns {Object} An object containing the constraints
 */
const createParallelConstraints = (edges, layoutConfig) =>
  edges.map(({ sourceNode, targetNode }) => ({
    base: parallelConstraint,
    property: layoutConfig.coordPrimary,
    a: sourceNode,
    b: targetNode,
    // Evenly distribute the constraint
    strength:
      0.6 /
      Math.max(1, sourceNode.targets.length + targetNode.sources.length - 2),
  }));

/**
 * Creates separation constraints between adjacent nodes within the same layer.
 * The direction (horizontal or vertical) depends on the primary coordinate,
 * which is determined by the layout orientation.
 * @param {Array} rows The rows containing nodes
 * @returns {Array} The constraints
 */
const createSeparationConstraints = (rows, layoutConfig) => {
  const { spaceX, coordPrimary, spreadX, orientation, extraVerticalGap } =
    layoutConfig;
  const separationConstraints = [];

  // For each row of nodes
  for (let i = 0; i < rows.length; i += 1) {
    const rowNodes = rows[i];

    // Stable sort row nodes horizontally, breaks ties with ids
    rowNodes.sort((a, b) =>
      compare(a[coordPrimary], b[coordPrimary], a.id, b.id)
    );

    // Update constraints given sorted row node order
    for (let j = 0; j < rowNodes.length - 1; j += 1) {
      const nodeA = rowNodes[j];
      const nodeB = rowNodes[j + 1];

      // Count the connected edges
      const degreeA = Math.max(
        1,
        nodeA.targets.length + nodeA.sources.length - 2
      );
      const degreeB = Math.max(
        1,
        nodeB.targets.length + nodeB.sources.length - 2
      );

      // Allow more spacing for nodes with more edges
      const spread = Math.min(10, degreeA * degreeB * spreadX);
      const space = snap(spread * spaceX, spaceX);

      const separation =
        orientation === 'horizontal'
          ? nodeA.height + nodeB.height + extraVerticalGap
          : nodeA.width * 0.5 + space + nodeB.width * 0.5 + extraVerticalGap;

      separationConstraints.push({
        base: separationConstraint,
        property: coordPrimary,
        a: nodeA,
        b: nodeB,
        separation,
      });
    }
  }

  return separationConstraints;
};

/**
 * Adds additional spacing in Y relative to row density, see function `rowDensity` for definition.
 * Node positions are updated in-place
 * @param {Array} edges The input edges
 * @param {Array} rows The input rows of nodes
 * @param {Number} spaceY The spacing between nodes in Y
 * @param {Number} [scale=1.25] The amount of expansion to apply relative to row density
 * @param {Number} [unit=0.25] The unit size for rounding expansion relative to spaceY
 */
const expandDenseRows = (
  edges,
  rows,
  coordSecondary,
  spaceY,
  orientation,
  scale = 1.25,
  unit = 0.25
) => {
  const densities = rowDensity(edges, orientation);
  const spaceYUnit = Math.round(spaceY * unit);
  let currentOffset = 0;

  // Add spacing based relative to row density
  for (let i = 0; i < rows.length - 1; i += 1) {
    const density = densities[i] || 0;

    // Round offset to a common unit amount to improve vertical rhythm
    const offset = snap(density * scale * spaceY, spaceYUnit);

    if (orientation === 'horizontal') {
      const maxWidthInCurrentRow = Math.max(
        ...rows[i].map((node) => node.width)
      );
      const maxWidthInNextRow = Math.max(
        ...rows[i + 1].map((node) => node.width)
      );
      currentOffset +=
        offset + maxWidthInCurrentRow * 0.5 + maxWidthInNextRow * 0.5;
    } else {
      currentOffset += offset;
    }

    // Apply offset to all nodes following the current node
    for (const node of rows[i + 1]) {
      node[coordSecondary] += currentOffset;
    }
  }
};

/**
 * Estimates an average 'density' for each row based on average edge angle at that row.
 * Rows with edges close to horizontal are more 'dense' than rows with straight vertical edges.
 * Rows are determined by each edge's source and target node Y positions.
 * Intermediate row edges are assumed always vertical as a simplification, only the start end rows are measured.
 * Returns a list of values in `(0, 1)` where `0` means all edges on that row are vertical and `1` means all horizontal
 * @param {Array} edges The input edges
 * @returns {Array} The density of each row
 */
const rowDensity = (edges, orientation) => {
  const rows = {};

  for (const edge of edges) {
    // Find the normalized angle of the edge source and target nodes, relative to the X axis
    const edgeAngle =
      Math.abs(angle(edge.targetNode, edge.sourceNode, orientation) - HALF_PI) /
      HALF_PI;

    const sourceRow = edge.sourceNode.row;
    const targetRow = edge.targetNode.row - 1;

    // Add angle to the source row total
    rows[sourceRow] = rows[sourceRow] || [0, 0];
    rows[sourceRow][0] += edgeAngle;
    rows[sourceRow][1] += 1;

    if (targetRow !== sourceRow) {
      // Add angle to the target row total
      rows[targetRow] = rows[targetRow] || [0, 0];
      rows[targetRow][0] += edgeAngle;
      rows[targetRow][1] += 1;
    }
  }

  // Find the average angle for each row
  for (const row in rows) {
    rows[row] = rows[row][0] / (rows[row][1] || 1);
  }

  return Object.values(rows);
};
