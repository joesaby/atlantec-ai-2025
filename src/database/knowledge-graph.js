import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, "../../garden-knowledge.sqlite"));

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS nodes (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    properties TEXT NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS edges (
    id TEXT PRIMARY KEY,
    source TEXT NOT NULL,
    target TEXT NOT NULL,
    type TEXT NOT NULL,
    properties TEXT,
    FOREIGN KEY (source) REFERENCES nodes(id),
    FOREIGN KEY (target) REFERENCES nodes(id)
  );
  
  CREATE INDEX IF NOT EXISTS idx_nodes_type ON nodes(type);
  CREATE INDEX IF NOT EXISTS idx_edges_source ON edges(source);
  CREATE INDEX IF NOT EXISTS idx_edges_target ON edges(target);
  CREATE INDEX IF NOT EXISTS idx_edges_type ON edges(type);
`);

export const graphDb = {
  // Add a node to the knowledge graph
  addNode(id, type, properties) {
    const stmt = db.prepare(
      "INSERT OR REPLACE INTO nodes (id, type, properties) VALUES (?, ?, ?)"
    );
    stmt.run(id, type, JSON.stringify(properties));
  },

  // Add an edge between nodes
  addEdge(source, target, type, properties = {}) {
    const id = `${source}-${type}-${target}`;
    const stmt = db.prepare(
      "INSERT OR REPLACE INTO edges (id, source, target, type, properties) VALUES (?, ?, ?, ?, ?)"
    );
    stmt.run(id, source, target, type, JSON.stringify(properties));
  },

  // Get node by ID
  getNode(id) {
    const stmt = db.prepare("SELECT * FROM nodes WHERE id = ?");
    const node = stmt.get(id);
    if (node) {
      node.properties = JSON.parse(node.properties);
    }
    return node;
  },

  // Get nodes by type
  getNodesByType(type) {
    const stmt = db.prepare("SELECT * FROM nodes WHERE type = ?");
    const nodes = stmt.all(type);
    return nodes.map((node) => ({
      ...node,
      properties: JSON.parse(node.properties),
    }));
  },

  // Get connected nodes (1-hop neighbors)
  getConnectedNodes(nodeId) {
    const stmt = db.prepare(`
      SELECT n.*, e.type as edge_type, e.properties as edge_properties
      FROM edges e
      JOIN nodes n ON e.target = n.id
      WHERE e.source = ?
    `);
    const nodes = stmt.all(nodeId);
    return nodes.map((node) => ({
      ...node,
      properties: JSON.parse(node.properties),
      edge_properties: JSON.parse(node.edge_properties),
    }));
  },

  // Query for plants suitable for specific conditions
  findPlantsBySuitability(conditions) {
    const { soilType, sunExposure, season } = conditions;

    // Build query based on provided conditions
    let query = `
      SELECT DISTINCT p.id, p.properties
      FROM nodes p
      WHERE p.type = 'Plant'
    `;

    const params = [];

    if (soilType) {
      query += `
        AND EXISTS (
          SELECT 1 FROM edges e
          JOIN nodes s ON e.target = s.id
          WHERE e.source = p.id
          AND e.type = 'THRIVES_IN'
          AND s.type = 'SoilType'
          AND s.id = ?
        )
      `;
      params.push(soilType);
    }

    if (sunExposure) {
      query += `
        AND EXISTS (
          SELECT 1 FROM edges e
          JOIN nodes s ON e.target = s.id
          WHERE e.source = p.id
          AND e.type = 'NEEDS'
          AND s.type = 'SunExposure'
          AND s.id = ?
        )
      `;
      params.push(sunExposure);
    }

    if (season) {
      query += `
        AND EXISTS (
          SELECT 1 FROM edges e
          JOIN nodes s ON e.target = s.id
          WHERE e.source = p.id
          AND e.type = 'GROWS_BEST_IN'
          AND s.type = 'Season'
          AND s.id = ?
        )
      `;
      params.push(season);
    }

    const stmt = db.prepare(query);
    const plants = stmt.all(...params);
    return plants.map((plant) => ({
      id: plant.id,
      properties: JSON.parse(plant.properties),
    }));
  },
};
