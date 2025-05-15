/**
 * Export Neo4j Database to CSV Files
 *
 * This script extracts all nodes and relationships from a Neo4j database and exports them to CSV files.
 * Each node label and relationship type will be exported to a separate CSV file.
 */

import {
  neo4jDriver,
  verifyConnectivity,
  closeDriver,
} from "./database/neo4j-client.js";
import { Parser } from "json2csv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, "..", "exports");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Helper function to flatten nested objects for CSV export
function flattenObject(obj, prefix = "") {
  return Object.keys(obj).reduce((acc, key) => {
    const propKey = prefix ? `${prefix}_${key}` : key;

    if (
      typeof obj[key] === "object" &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      Object.assign(acc, flattenObject(obj[key], propKey));
    } else if (Array.isArray(obj[key])) {
      acc[propKey] = JSON.stringify(obj[key]);
    } else {
      acc[propKey] = obj[key];
    }

    return acc;
  }, {});
}

// Get all node labels from the database
async function getAllNodeLabels() {
  const session = neo4jDriver.session();
  try {
    const result = await session.run("CALL db.labels()");
    return result.records.map((record) => record.get("label"));
  } finally {
    await session.close();
  }
}

// Get all relationship types from the database
async function getAllRelationshipTypes() {
  const session = neo4jDriver.session();
  try {
    const result = await session.run("CALL db.relationshipTypes()");
    return result.records.map((record) => record.get("relationshipType"));
  } finally {
    await session.close();
  }
}

// Export nodes with a specific label to CSV
async function exportNodesWithLabel(label) {
  const session = neo4jDriver.session();
  try {
    console.log(`Exporting ${label} nodes...`);

    // Query to get all nodes with this label
    const query = `MATCH (n:${label}) RETURN n`;
    const result = await session.run(query);

    if (result.records.length === 0) {
      console.log(`No ${label} nodes found.`);
      return;
    }

    // Process node data
    const nodes = result.records.map((record) => {
      const node = record.get("n");
      const nodeData = {
        _id: node.identity.toString(),
        ...node.properties,
      };
      return flattenObject(nodeData);
    });

    // Generate CSV
    const fields = Array.from(
      new Set(nodes.flatMap((node) => Object.keys(node)))
    ).sort();

    const parser = new Parser({ fields });
    const csv = parser.parse(nodes);

    // Save to file
    const filename = path.join(outputDir, `nodes_${label}.csv`);
    fs.writeFileSync(filename, csv);

    console.log(`Exported ${nodes.length} ${label} nodes to ${filename}`);
    return { label, count: nodes.length, filename };
  } catch (error) {
    console.error(`Error exporting ${label} nodes:`, error);
    return { label, error: error.message };
  } finally {
    await session.close();
  }
}

// Export relationships with a specific type to CSV
async function exportRelationshipsWithType(type) {
  const session = neo4jDriver.session();
  try {
    console.log(`Exporting ${type} relationships...`);

    // Query to get all relationships with this type
    const query = `
      MATCH (source)-[r:${type}]->(target)
      RETURN source, r, target
    `;
    const result = await session.run(query);

    if (result.records.length === 0) {
      console.log(`No ${type} relationships found.`);
      return;
    }

    // Process relationship data
    const relationships = result.records.map((record) => {
      const source = record.get("source");
      const rel = record.get("r");
      const target = record.get("target");

      const relData = {
        _id: rel.identity.toString(),
        _source_id: source.identity.toString(),
        _source_labels: source.labels.join(";"),
        _source_name: source.properties.name || "",
        _target_id: target.identity.toString(),
        _target_labels: target.labels.join(";"),
        _target_name: target.properties.name || "",
        ...rel.properties,
      };

      return flattenObject(relData);
    });

    // Generate CSV
    const fields = Array.from(
      new Set(relationships.flatMap((rel) => Object.keys(rel)))
    ).sort();

    const parser = new Parser({ fields });
    const csv = parser.parse(relationships);

    // Save to file
    const filename = path.join(outputDir, `relationships_${type}.csv`);
    fs.writeFileSync(filename, csv);

    console.log(
      `Exported ${relationships.length} ${type} relationships to ${filename}`
    );
    return { type, count: relationships.length, filename };
  } catch (error) {
    console.error(`Error exporting ${type} relationships:`, error);
    return { type, error: error.message };
  } finally {
    await session.close();
  }
}

// Main export function
async function exportAllNeo4jDataToCsv() {
  try {
    // Verify database connection
    const connectionStatus = await verifyConnectivity();
    if (!connectionStatus.connected) {
      console.error("❌ Failed to connect to Neo4j database");
      return;
    }

    console.log("✅ Connected to Neo4j database");
    console.log(`📁 Export directory: ${outputDir}`);

    // Get all node labels
    const nodeLabels = await getAllNodeLabels();
    console.log(
      `Found ${nodeLabels.length} node labels: ${nodeLabels.join(", ")}`
    );

    // Export nodes for each label
    const nodeExportResults = [];
    for (const label of nodeLabels) {
      const result = await exportNodesWithLabel(label);
      nodeExportResults.push(result);
    }

    // Get all relationship types
    const relationshipTypes = await getAllRelationshipTypes();
    console.log(
      `Found ${
        relationshipTypes.length
      } relationship types: ${relationshipTypes.join(", ")}`
    );

    // Export relationships for each type
    const relationshipExportResults = [];
    for (const type of relationshipTypes) {
      const result = await exportRelationshipsWithType(type);
      relationshipExportResults.push(result);
    }

    // Generate summary report
    console.log("\n📊 EXPORT SUMMARY");
    console.log("=================");

    console.log("\nNode Exports:");
    nodeExportResults.forEach((result) => {
      if (result && result.count) {
        console.log(`✅ ${result.label}: ${result.count} nodes`);
      } else if (result && result.error) {
        console.log(`❌ ${result.label}: ${result.error}`);
      }
    });

    console.log("\nRelationship Exports:");
    relationshipExportResults.forEach((result) => {
      if (result && result.count) {
        console.log(`✅ ${result.type}: ${result.count} relationships`);
      } else if (result && result.error) {
        console.log(`❌ ${result.type}: ${result.error}`);
      }
    });

    console.log("\n✅ Export completed successfully!");
    console.log(`📁 All CSV files have been exported to: ${outputDir}`);
  } catch (error) {
    console.error("Error exporting Neo4j data:", error);
  } finally {
    // Close the driver
    await closeDriver();
  }
}

// Run the export
exportAllNeo4jDataToCsv();
