/**
 * API endpoint to fetch Neo4j graph data for visualization
 */

import { neo4jDriver } from "../../database/neo4j-client.js";

export const prerender = false;

export async function POST({ request }) {
  try {
    const { query, limit = 1000 } = await request.json();

    // Execute Neo4j query directly
    const session = neo4jDriver.session();
    let result;

    try {
      if (query && query.trim() !== "") {
        // If a query is provided, use it to filter the graph
        console.log(`Filtering graph data with query: ${query}`);

        // Use full-text search to find matching nodes
        const nodesQuery = `
          MATCH (n)
          WHERE n.name =~ $queryPattern OR n.description =~ $queryPattern OR any(label IN labels(n) WHERE label =~ $queryPattern)
          WITH collect(n) as matchedNodes
          RETURN matchedNodes as nodes
        `;

        const nodesResult = await session.run(nodesQuery, {
          queryPattern: `(?i).*${query}.*`, // Case-insensitive regex pattern
        });

        const matchedNodes = nodesResult.records[0].get("nodes") || [];
        console.log(
          `Found ${matchedNodes.length} nodes matching query: ${query}`
        );

        if (matchedNodes.length === 0) {
          // If no matches found, return the full graph instead of empty graph
          console.log(
            `No matches found for query: ${query}, returning full graph`
          );

          // First query - get all nodes
          const allNodesQuery = `
            MATCH (n)
            RETURN COLLECT(n) as nodes
          `;

          const allNodesResult = await session.run(allNodesQuery);
          const allNodes = allNodesResult.records[0].get("nodes") || [];

          console.log(`Returning ${allNodes.length} nodes from full graph`);

          // Second query - get all relationships directly with RETURN
          const allRelsQuery = `
            MATCH (a)-[r]->(b)
            RETURN COLLECT({
              stringId: toString(id(r)),
              type: type(r),
              source: toString(id(a)),
              target: toString(id(b)),
              properties: properties(r)
            }) as relationships
          `;

          const allRelsResult = await session.run(allRelsQuery);
          const allRels = allRelsResult.records[0].get("relationships") || [];

          console.log(
            `Returning ${allRels.length} relationships from full graph`
          );

          result = {
            nodes: allNodes,
            relationships: allRels,
          };
        } else {
          // Get relationships between the matched nodes
          const relsQuery = `
            MATCH (a)-[r]->(b)
            WHERE id(a) IN $nodeIds AND id(b) IN $nodeIds
            WITH collect({
              stringId: toString(id(r)),
              type: type(r),
              source: toString(id(a)),
              target: toString(id(b)),
              properties: properties(r)
            }) as filteredRels
            RETURN filteredRels as relationships
          `;

          const nodeIds = matchedNodes.map((node) => node.identity.toNumber());
          const relsResult = await session.run(relsQuery, { nodeIds });
          const filteredRels = relsResult.records[0].get("relationships") || [];

          console.log(
            `Found ${filteredRels.length} relationships between matched nodes`
          );

          result = {
            nodes: matchedNodes,
            relationships: filteredRels,
          };
        }
      } else {
        // If no query is provided, return the full graph
        // First query - get all nodes
        const nodesQuery = `
          MATCH (n)
          RETURN COLLECT(n) as nodes
        `;

        const nodesResult = await session.run(nodesQuery);
        const allNodes = nodesResult.records[0].get("nodes") || [];

        console.log(`Found ${allNodes.length} nodes in database`);

        // Second query - get all relationships directly with RETURN
        // Using string concatenation for ID to avoid Infinity issues
        const relsQuery = `
          MATCH (a)-[r]->(b)
          RETURN COLLECT({
            stringId: toString(id(r)),
            type: type(r),
            source: toString(id(a)),
            target: toString(id(b)),
            properties: properties(r)
          }) as relationships
        `;

        const relsResult = await session.run(relsQuery);
        const allRels = relsResult.records[0].get("relationships") || [];

        console.log(
          `Found ${allRels.length} relationships with direct ID mapping`
        );

        // Debug the first few relationships
        if (allRels.length > 0) {
          console.log("First 3 relationships:", allRels.slice(0, 3));
        }

        // Combine the results manually
        result = {
          nodes: allNodes,
          relationships: allRels,
        };
      }
    } finally {
      await session.close();
    }

    // Transform Neo4j records into a format suitable for force-graph
    const graphData = transformNeo4jToGraphData(result);
    console.log(
      `Transformed to ${graphData.nodes.length} nodes and ${graphData.links.length} links`
    );

    return new Response(
      JSON.stringify({
        graphData,
        debug: {
          nodeCount: result.nodes.length,
          relationshipCount: result.relationships.length,
          query: query || "none",
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching graph data:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to fetch graph data. " + error.message,
        stack: error.stack,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * Transform Neo4j records into a format suitable for force-graph visualization
 * Completely rewritten to handle pre-processed relationship data
 */
function transformNeo4jToGraphData(data) {
  const nodes = new Map();
  const links = new Map();
  let linkCounter = 0;

  // Process all nodes
  data.nodes.forEach((node) => {
    const nodeId = node.identity.toString();

    if (!nodes.has(nodeId)) {
      const labels = node.labels || [];
      nodes.set(nodeId, {
        id: nodeId,
        label: node.properties.name || labels[0] || `Node ${nodeId}`,
        group: labels[0] || "Unknown",
        properties: node.properties || {},
      });
    }
  });

  // Process all relationships - now using pre-processed data
  data.relationships.forEach((rel) => {
    try {
      // Generate a unique ID for each relationship
      linkCounter++;
      const linkId = `rel_${linkCounter}`;

      // Use the provided string IDs or convert if needed
      const sourceId = rel.source || "";
      const targetId = rel.target || "";

      // Skip relationships with missing source or target
      if (!sourceId || !targetId) {
        console.warn("Skipping relationship with missing source/target:", rel);
        return;
      }

      // Only add the relationship if both nodes exist
      if (nodes.has(sourceId) && nodes.has(targetId)) {
        links.set(linkId, {
          id: linkId,
          source: sourceId,
          target: targetId,
          type: rel.type,
          properties: rel.properties || {},
        });
      } else {
        console.warn(
          `Skipping relationship ${linkId}, missing nodes: source(${sourceId}) exists: ${nodes.has(
            sourceId
          )}, target(${targetId}) exists: ${nodes.has(targetId)}`
        );
      }
    } catch (error) {
      console.error("Error processing relationship:", error, rel);
    }
  });

  console.log(`Processed ${nodes.size} nodes and ${links.size} links`);

  // Log a few sample links for debugging
  const sampleLinks = Array.from(links.values()).slice(0, 3);
  if (sampleLinks.length > 0) {
    console.log("Sample links:", sampleLinks);
  }

  return {
    nodes: Array.from(nodes.values()),
    links: Array.from(links.values()),
  };
}
