/**
 * Script to view all data in the Neo4j database
 *
 * Run with: node src/view-all-neo4j-data.js
 */

import {
  neo4jDriver,
  verifyConnectivity,
  closeDriver,
} from "./database/neo4j-client.js";
import logger from "./utils/unified-logger.js";

async function getAllNodeLabels() {
  const session = neo4jDriver.session();
  try {
    const result = await session.run("CALL db.labels()");
    return result.records.map((record) => record.get("label"));
  } finally {
    await session.close();
  }
}

async function getAllRelationshipTypes() {
  const session = neo4jDriver.session();
  try {
    const result = await session.run("CALL db.relationshipTypes()");
    return result.records.map((record) => record.get("relationshipType"));
  } finally {
    await session.close();
  }
}

async function getNodesWithLabel(label) {
  const session = neo4jDriver.session();
  try {
    const result = await session.run(`MATCH (n:${label}) RETURN n`);
    return result.records.map((record) => {
      const node = record.get("n");
      return {
        id: node.identity, // Fixed: removed toInt() call since integers are already converted
        labels: node.labels,
        properties: node.properties,
      };
    });
  } finally {
    await session.close();
  }
}

async function getAllRelationships() {
  const session = neo4jDriver.session();
  try {
    const result = await session.run("MATCH (a)-[r]->(b) RETURN a, r, b");
    return result.records.map((record) => {
      const source = record.get("a");
      const relationship = record.get("r");
      const target = record.get("b");

      return {
        source: {
          id: source.identity, // Fixed: removed toInt() call
          labels: source.labels,
          properties: source.properties,
        },
        relationship: {
          id: relationship.identity, // Fixed: removed toInt() call
          type: relationship.type,
          properties: relationship.properties,
        },
        target: {
          id: target.identity, // Fixed: removed toInt() call
          labels: target.labels,
          properties: target.properties,
        },
      };
    });
  } finally {
    await session.close();
  }
}

async function viewAllDatabaseData() {
  try {
    // Verify connection
    const connectionStatus = await verifyConnectivity();
    if (!connectionStatus.connected) {
      logger.error("Failed to connect to Neo4j database");
      return;
    }

    logger.info("🌟 Connected to Neo4j database successfully! 🌟\n");

    // Get all node labels
    const labels = await getAllNodeLabels();
    logger.info(
      `📋 Found ${labels.length} node labels: ${labels.join(", ")}\n`
    );

    // Get all nodes by label
    logger.info("📊 NODE DATA BY LABEL:");
    logger.info("====================");

    for (const label of labels) {
      const nodes = await getNodesWithLabel(label);
      logger.info(`\n🏷️  ${label} (${nodes.length} nodes):`);

      if (nodes.length === 0) {
        logger.info("   No nodes found with this label");
      } else {
        nodes.forEach((node, i) => {
          logger.info(`   Node #${i + 1} (ID: ${node.id}):`);
          logger.info(
            `   Properties: ${JSON.stringify(node.properties, null, 2)}`
          );
        });
      }
    }

    // Get all relationship types
    const relationshipTypes = await getAllRelationshipTypes();
    logger.info(
      `\n\n🔗 Found ${
        relationshipTypes.length
      } relationship types: ${relationshipTypes.join(", ")}\n`
    );

    // Get all relationships
    const relationships = await getAllRelationships();
    logger.info(`\n🔄 RELATIONSHIPS (${relationships.length} total):`);
    logger.info("======================");

    if (relationships.length === 0) {
      logger.info("   No relationships found in the database");
    } else {
      relationships.forEach((rel, i) => {
        logger.info(`\n   Relationship #${i + 1}:`);
        logger.info(`   Type: ${rel.relationship.type}`);
        logger.info(
          `   Source (${rel.source.labels.join(", ")}): ${JSON.stringify(
            rel.source.properties,
            null,
            2
          )}`
        );
        logger.info(
          `   Target (${rel.target.labels.join(", ")}): ${JSON.stringify(
            rel.target.properties,
            null,
            2
          )}`
        );
        if (Object.keys(rel.relationship.properties).length > 0) {
          logger.info(
            `   Relationship Properties: ${JSON.stringify(
              rel.relationship.properties,
              null,
              2
            )}`
          );
        }
      });
    }

    logger.info("\n\n📊 DATABASE SUMMARY:");
    logger.info("==================");
    logger.info(`   Total Node Labels: ${labels.length}`);
    logger.info(`   Total Relationship Types: ${relationshipTypes.length}`);

    let totalNodes = 0;
    for (const label of labels) {
      const count = (await getNodesWithLabel(label)).length;
      totalNodes += count;
      logger.info(`   ${label} Nodes: ${count}`);
    }

    logger.info(`   Total Nodes: ${totalNodes}`);
    logger.info(`   Total Relationships: ${relationships.length}`);
  } catch (error) {
    logger.error("Error viewing database data:", error);
  } finally {
    // Close the driver
    await closeDriver();
  }
}

// Run the main function
viewAllDatabaseData();
