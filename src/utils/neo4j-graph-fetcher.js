/**
 * Neo4j Graph Data Fetcher
 *
 * Utility to fetch garden network data from Neo4j in a format suitable
 * for visualization with react-force-graph.
 */

import neo4j from "neo4j-driver";

// Neo4j connection
const createDriver = () => {
  const uri = process.env.NEO4J_URI || "neo4j://localhost:7687";
  const user = process.env.NEO4J_USER || "neo4j";
  const password = process.env.NEO4J_PASSWORD || "password";

  return neo4j.driver(
    uri,
    neo4j.auth.basic(user, password),
    { maxConnectionLifetime: 3 * 60 * 60 * 1000 } // 3 hours
  );
};

/**
 * Fetch all nodes and relationships from Neo4j
 * @returns {Promise<Object>} Object with nodes and relationships arrays
 */
export const fetchCompleteGraph = async () => {
  const driver = createDriver();
  const session = driver.session();

  try {
    // Fetch all nodes
    const nodesResult = await session.run(`
      MATCH (n)
      RETURN n, labels(n) as labels
    `);

    const nodes = nodesResult.records.map((record) => {
      const node = record.get("n");
      const labels = record.get("labels");

      return {
        id: node.identity.toString(),
        labels: labels,
        properties: node.properties,
      };
    });

    // Fetch all relationships
    const relsResult = await session.run(`
      MATCH (source)-[r]->(target)
      RETURN source, r, target, type(r) as type
    `);

    const relationships = relsResult.records.map((record) => {
      const rel = record.get("r");
      const source = record.get("source");
      const target = record.get("target");
      const type = record.get("type");

      return {
        id: rel.identity.toString(),
        type: type,
        startNode: source.identity.toString(),
        endNode: target.identity.toString(),
        properties: rel.properties,
      };
    });

    return { nodes, relationships };
  } finally {
    await session.close();
    await driver.close();
  }
};

/**
 * Fetch a subgraph focused on specific node types, relationship types or filters
 * @param {Object} filters - Filters to apply when fetching the graph
 * @returns {Promise<Object>} Object with filtered nodes and relationships
 */
export const fetchFilteredGraph = async (filters = {}) => {
  const driver = createDriver();
  const session = driver.session();

  try {
    let nodeLabels = filters.nodeLabels || [];
    let relationshipTypes = filters.relationshipTypes || [];
    let county = filters.county;

    // Base query parts
    let nodeMatch = "MATCH (n)";
    let relMatch = "MATCH (source)-[r]->(target)";
    let whereClause = [];

    // Build where clause based on filters
    if (nodeLabels.length > 0) {
      const labelConditions = nodeLabels
        .map((label) => `n:${label}`)
        .join(" OR ");
      whereClause.push(`(${labelConditions})`);
    }

    if (relationshipTypes.length > 0) {
      relMatch = `MATCH (source)-[r:${relationshipTypes.join("|")}]->(target)`;
    }

    // County-specific query for plants suitable in that county
    if (county) {
      const countyQuery = `
        MATCH (c:County {id: $county})-[:suitableFor|recommendedPlant]->(p:Plant)
        OPTIONAL MATCH (p)-[r1]-(other)
        RETURN p as n, r1 as r, other as related
        UNION
        MATCH (c:County {id: $county})
        RETURN c as n, null as r, null as related
      `;

      const result = await session.run(countyQuery, { county });

      // Process nodes and relationships from county query
      const nodeMap = new Map();
      const relSet = new Map();

      result.records.forEach((record) => {
        const node = record.get("n");
        const rel = record.get("r");
        const related = record.get("related");

        if (node) {
          nodeMap.set(node.identity.toString(), {
            id: node.identity.toString(),
            labels: node.labels,
            properties: node.properties,
          });
        }

        if (related) {
          nodeMap.set(related.identity.toString(), {
            id: related.identity.toString(),
            labels: related.labels,
            properties: related.properties,
          });
        }

        if (rel) {
          relSet.set(rel.identity.toString(), {
            id: rel.identity.toString(),
            type: rel.type,
            startNode: rel.start.toString(),
            endNode: rel.end.toString(),
            properties: rel.properties,
          });
        }
      });

      return {
        nodes: Array.from(nodeMap.values()),
        relationships: Array.from(relSet.values()),
      };
    }

    // Build and execute the query for nodes
    const whereStr =
      whereClause.length > 0 ? "WHERE " + whereClause.join(" AND ") : "";
    const nodeQuery = `${nodeMatch} ${whereStr} RETURN n, labels(n) as labels`;

    const nodesResult = await session.run(nodeQuery);

    const nodes = nodesResult.records.map((record) => {
      const node = record.get("n");
      const labels = record.get("labels");

      return {
        id: node.identity.toString(),
        labels: labels,
        properties: node.properties,
      };
    });

    // If we have nodes, get their relationships
    let relationships = [];
    if (nodes.length > 0) {
      const nodeIds = nodes.map((n) => n.id);

      const relQuery = `
        ${relMatch}
        WHERE source.id IN $nodeIds OR target.id IN $nodeIds
        RETURN source, r, target, type(r) as type
      `;

      const relsResult = await session.run(relQuery, { nodeIds });

      relationships = relsResult.records.map((record) => {
        const rel = record.get("r");
        const source = record.get("source");
        const target = record.get("target");
        const type = record.get("type");

        return {
          id: rel.identity.toString(),
          type: type,
          startNode: source.identity.toString(),
          endNode: target.identity.toString(),
          properties: rel.properties,
        };
      });
    }

    return { nodes, relationships };
  } finally {
    await session.close();
    await driver.close();
  }
};

/**
 * Get available node labels and relationship types for filtering
 * @returns {Promise<Object>} Object with nodeLabels and relationshipTypes arrays
 */
export const fetchGraphMetadata = async () => {
  const driver = createDriver();
  const session = driver.session();

  try {
    // Get node labels
    const labelsQuery = `
      CALL db.labels() YIELD label
      RETURN label ORDER BY label
    `;

    const labelsResult = await session.run(labelsQuery);
    const nodeLabels = labelsResult.records.map((record) =>
      record.get("label")
    );

    // Get relationship types
    const relTypesQuery = `
      CALL db.relationshipTypes() YIELD relationshipType
      RETURN relationshipType ORDER BY relationshipType
    `;

    const relTypesResult = await session.run(relTypesQuery);
    const relationshipTypes = relTypesResult.records.map((record) =>
      record.get("relationshipType")
    );

    // Get county IDs for filtering
    const countiesQuery = `
      MATCH (c:County)
      RETURN c.id as id, c.name as name
      ORDER BY c.name
    `;

    const countiesResult = await session.run(countiesQuery);
    const counties = countiesResult.records.map((record) => ({
      id: record.get("id"),
      name: record.get("name"),
    }));

    return { nodeLabels, relationshipTypes, counties };
  } finally {
    await session.close();
    await driver.close();
  }
};

/**
 * Get county-specific plant recommendations based on soil type and weather
 * @param {string} countyId - The ID of the county to get recommendations for
 * @returns {Promise<Array>} Array of recommended plants for the county
 */
export const getCountyPlantRecommendations = async (countyId) => {
  const driver = createDriver();
  const session = driver.session();

  try {
    const query = `
      MATCH (c:County {id: $countyId})-[:suitableFor]->(p:Plant)
      RETURN p.id as id, p.name as name
      UNION
      MATCH (c:County {id: $countyId})-[:recommendedPlant]->(p:Plant)
      RETURN p.id as id, p.name as name
    `;

    const result = await session.run(query, { countyId });

    return result.records.map((record) => ({
      id: record.get("id"),
      name: record.get("name"),
    }));
  } finally {
    await session.close();
    await driver.close();
  }
};
