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
      console.error("Failed to connect to Neo4j database");
      return;
    }

    console.log("🌟 Connected to Neo4j database successfully! 🌟\n");

    // Get all node labels
    const labels = await getAllNodeLabels();
    console.log(
      `📋 Found ${labels.length} node labels: ${labels.join(", ")}\n`
    );

    // Get all nodes by label
    console.log("📊 NODE DATA BY LABEL:");
    console.log("====================");

    for (const label of labels) {
      const nodes = await getNodesWithLabel(label);
      console.log(`\n🏷️  ${label} (${nodes.length} nodes):`);

      if (nodes.length === 0) {
        console.log("   No nodes found with this label");
      } else {
        nodes.forEach((node, i) => {
          console.log(`   Node #${i + 1} (ID: ${node.id}):`);
          console.log(
            `   Properties: ${JSON.stringify(node.properties, null, 2)}`
          );
        });
      }
    }

    // Get all relationship types
    const relationshipTypes = await getAllRelationshipTypes();
    console.log(
      `\n\n🔗 Found ${
        relationshipTypes.length
      } relationship types: ${relationshipTypes.join(", ")}\n`
    );

    // Get all relationships
    const relationships = await getAllRelationships();
    console.log(`\n🔄 RELATIONSHIPS (${relationships.length} total):`);
    console.log("======================");

    if (relationships.length === 0) {
      console.log("   No relationships found in the database");
    } else {
      relationships.forEach((rel, i) => {
        console.log(`\n   Relationship #${i + 1}:`);
        console.log(`   Type: ${rel.relationship.type}`);
        console.log(
          `   Source (${rel.source.labels.join(", ")}): ${JSON.stringify(
            rel.source.properties,
            null,
            2
          )}`
        );
        console.log(
          `   Target (${rel.target.labels.join(", ")}): ${JSON.stringify(
            rel.target.properties,
            null,
            2
          )}`
        );
        if (Object.keys(rel.relationship.properties).length > 0) {
          console.log(
            `   Relationship Properties: ${JSON.stringify(
              rel.relationship.properties,
              null,
              2
            )}`
          );
        }
      });
    }

    console.log("\n\n📊 DATABASE SUMMARY:");
    console.log("==================");
    console.log(`   Total Node Labels: ${labels.length}`);
    console.log(`   Total Relationship Types: ${relationshipTypes.length}`);

    let totalNodes = 0;
    for (const label of labels) {
      const count = (await getNodesWithLabel(label)).length;
      totalNodes += count;
      console.log(`   ${label} Nodes: ${count}`);
    }

    console.log(`   Total Nodes: ${totalNodes}`);
    console.log(`   Total Relationships: ${relationships.length}`);
  } catch (error) {
    console.error("Error viewing database data:", error);
  } finally {
    // Close the driver
    await closeDriver();
  }
}

// Run the main function
viewAllDatabaseData();
