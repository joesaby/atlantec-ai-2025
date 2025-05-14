import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";

export default function GraphVisualization() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);

  // Fetch graph data from the API - our backend now handles the query directly
  useEffect(() => {
    async function fetchGraphData() {
      let responseText = null;

      try {
        setIsLoading(true);
        console.log("Fetching graph data from API...");

        const response = await fetch("/api/neo4j-graph", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        });

        console.log("Response status:", response.status);
        responseText = await response.text();
        console.log("Response text length:", responseText.length);

        if (!response.ok) {
          throw new Error(
            `HTTP error! Status: ${
              response.status
            }, Body: ${responseText.substring(0, 200)}...`
          );
        }

        // Parse the text response to JSON
        let data;
        try {
          data = JSON.parse(responseText);
          console.log("Parsed response data:", data);
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          throw new Error(`Failed to parse response: ${parseError.message}`);
        }

        // Check if the graphData property exists in the response
        if (!data.graphData) {
          console.error("No graphData in response:", data);
          throw new Error("The response does not contain graphData");
        }

        // Log node and link counts for debugging
        console.log(
          `Received ${data.graphData.nodes.length} nodes and ${data.graphData.links.length} links`
        );

        // Process nodes and links for the visualization
        const processedData = processGraphData(data.graphData);
        setGraphData(processedData);

        setError(null);
        setDebugInfo(null);
      } catch (err) {
        console.error("Error fetching graph data:", err);
        setError("Failed to load graph visualization. Please try again later.");
        setDebugInfo({
          message: err.message,
          responseText: responseText
            ? responseText.substring(0, 500) + "..."
            : null,
          stack: err.stack,
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchGraphData();
  }, []);

  // Helper function to process the graph data for visualization
  function processGraphData(data) {
    // Create a map of nodes by ID for faster lookups
    const nodeMap = new Map();

    // Process nodes and create a map
    const nodes = data.nodes.map((node) => {
      const processedNode = {
        id: node.id,
        label: node.label || node.properties?.name || "Unnamed",
        group: node.group || "Unknown",
        properties: node.properties || {},
        radius: getNodeRadius(node.group),
      };

      nodeMap.set(node.id, processedNode);
      return processedNode;
    });

    console.log(`Processed ${nodes.length} nodes for visualization`);

    // Process links with proper references to nodes
    const links = data.links
      .filter((link) => {
        // Only include links where both source and target exist
        return nodeMap.has(link.source) && nodeMap.has(link.target);
      })
      .map((link) => ({
        id: link.id,
        // Store string IDs here, D3 will resolve them to objects later
        source: link.source,
        target: link.target,
        type: link.type,
        properties: link.properties || {},
      }));

    console.log(`Processed ${links.length} links for visualization`);

    return { nodes, links };
  }

  // Helper function to determine node radius based on type
  function getNodeRadius(type) {
    switch (type) {
      case "Plant":
        return 12;
      case "County":
        return 15;
      case "Month":
        return 10;
      case "SoilType":
        return 12;
      case "PollinatorType":
        return 11;
      default:
        return 8;
    }
  }

  // Helper function to get colors for different node types
  function getColorForNodeType(type) {
    const colorMap = {
      Plant: "#4CAF50", // Green
      SoilType: "#8B4513", // Brown
      County: "#1E88E5", // Blue
      Month: "#9C27B0", // Purple
      PollinatorType: "#FFEB3B", // Yellow
      GardeningTask: "#FF5722", // Orange
      Season: "#03A9F4", // Light Blue
      GrowingCondition: "#795548", // Dark Brown
    };

    return colorMap[type] || "#9E9E9E"; // Default gray
  }

  // Helper function to get line style based on relationship type
  function getLineStyleForRelationship(type) {
    const styleMap = {
      growsWellIn: { width: 2, dash: "none" },
      companionTo: { width: 2, dash: "4,2" }, // Dashed
      antagonisticTo: { width: 3, dash: "2,2" }, // Dotted
      suitableFor: { width: 1.5, dash: "none" },
      adjacentTo: { width: 1, dash: "1,1" }, // Dotted
      plantIn: { width: 1.5, dash: "4,1" }, // Dash-dot
      harvestIn: { width: 1.5, dash: "4,1" }, // Dash-dot
      hasDominantSoil: { width: 2.5, dash: "none" },
      suitableForGrowing: { width: 2, dash: "4,2" },
      growTogether: { width: 2, dash: "none" },
      recommendedPlant: { width: 2.5, dash: "none" },
      activeIn: { width: 1.5, dash: "none" },
      attracts: { width: 1.5, dash: "none" },
      supportsPollinators: { width: 1.5, dash: "none" },
    };

    return styleMap[type] || { width: 1.5, dash: "none" }; // Default
  }

  // Create D3 force-directed graph visualization
  useEffect(() => {
    if (isLoading || error || !graphData.nodes.length || !svgRef.current) {
      return;
    }

    console.log("Creating visualization...");
    console.log(
      `Nodes: ${graphData.nodes.length}, Links: ${graphData.links.length}`
    );

    // Clear any existing visualization
    d3.select(svgRef.current).selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Create the SVG container
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");

    // Create a tooltip div
    const tooltip = d3
      .select(tooltipRef.current)
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("text-align", "left")
      .style("background", "white")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("box-shadow", "0 4px 8px rgba(0, 0, 0, 0.1)")
      .style("font-size", "12px")
      .style("max-width", "250px");

    // Create a map of nodes by ID for resolving links
    const nodeById = new Map(graphData.nodes.map((node) => [node.id, node]));

    // Create actual link objects with references to node objects
    const links = graphData.links.map((link) => ({
      ...link,
      source: nodeById.get(link.source),
      target: nodeById.get(link.target),
    }));

    // Check all links are valid
    const validLinks = links.filter((link) => link.source && link.target);

    console.log(
      `${validLinks.length} of ${links.length} links are valid for visualization`
    );

    // Create a force simulation
    const simulation = d3
      .forceSimulation(graphData.nodes)
      .force(
        "link",
        d3
          .forceLink(validLinks)
          .id((d) => d.id)
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "collision",
        d3.forceCollide().radius((d) => d.radius * 1.5)
      );

    // Add zoom capabilities
    const zoom = d3
      .zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Create a container group for all elements
    const g = svg.append("g");

    // Add relationship legend
    const legend = g
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - 150}, 20)`);

    const relationshipTypes = [
      { type: "growsWellIn", label: "Grows in" },
      { type: "companionTo", label: "Companion" },
      { type: "antagonisticTo", label: "Antagonistic" },
      { type: "suitableFor", label: "Suitable for" },
      { type: "plantIn", label: "Plant in" },
      { type: "harvestIn", label: "Harvest in" },
      { type: "growTogether", label: "Grow together" },
      { type: "recommendedPlant", label: "Recommended" },
    ];

    relationshipTypes.forEach((rel, i) => {
      const style = getLineStyleForRelationship(rel.type);

      legend
        .append("line")
        .attr("x1", 0)
        .attr("y1", i * 20)
        .attr("x2", 20)
        .attr("y2", i * 20)
        .attr("stroke", "#555")
        .attr("stroke-width", style.width)
        .style("stroke-dasharray", style.dash);

      legend
        .append("text")
        .attr("x", 25)
        .attr("y", i * 20 + 4)
        .text(rel.label)
        .attr("font-size", "10px");
    });

    // Create a group for all links
    const link = g
      .append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(validLinks)
      .join("line")
      .attr("stroke-width", (d) => getLineStyleForRelationship(d.type).width)
      .style(
        "stroke-dasharray",
        (d) => getLineStyleForRelationship(d.type).dash
      );

    // Create a group for all link labels
    const linkText = g
      .append("g")
      .attr("class", "link-labels")
      .selectAll("text")
      .data(validLinks)
      .join("text")
      .attr("font-size", "8px")
      .attr("text-anchor", "middle")
      .attr("dy", "-5px")
      .text((d) => d.type);

    // Create a group for all nodes
    const node = g
      .append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(graphData.nodes)
      .join("circle")
      .attr("r", (d) => d.radius)
      .attr("fill", (d) => getColorForNodeType(d.group))
      .call(drag(simulation));

    // Create a group for all node labels
    const text = g
      .append("g")
      .attr("class", "node-labels")
      .selectAll("text")
      .data(graphData.nodes)
      .join("text")
      .attr("font-size", "8px")
      .attr("text-anchor", "middle")
      .attr("dy", (d) => -d.radius - 5)
      .text((d) => d.label);

    // Add interactivity
    node
      .on("mouseover", (event, d) => {
        // Highlight this node and connected nodes
        node.attr("opacity", (n) => (isConnected(d, n) ? 1 : 0.2));
        link.attr("opacity", (l) =>
          l.source.id === d.id || l.target.id === d.id ? 1 : 0.1
        );
        text.attr("opacity", (n) => (isConnected(d, n) ? 1 : 0.2));

        // Show tooltip
        tooltip.transition().duration(200).style("opacity", 0.9);

        // Format node properties for display
        const properties = Object.entries(d.properties)
          .filter(([key]) => !["neo4jId", "size", "color"].includes(key)) // Exclude internal properties
          .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
          .join("<br>");

        tooltip
          .html(`<strong>${d.group}: ${d.label}</strong><br>${properties}`)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", () => {
        // Restore original appearance
        node.attr("opacity", 1);
        link.attr("opacity", 0.6);
        text.attr("opacity", 1);

        tooltip.transition().duration(500).style("opacity", 0);
      })
      .on("click", (event, d) => {
        // Find connected nodes and their relationships
        const connections = [];

        validLinks.forEach((link) => {
          if (link.source.id === d.id) {
            connections.push({
              type: link.type,
              direction: "outgoing",
              node: link.target,
            });
          } else if (link.target.id === d.id) {
            connections.push({
              type: link.type,
              direction: "incoming",
              node: link.source,
            });
          }
        });

        // Construct a formatted message showing the relationships
        let message = `${d.group}: ${d.label}\n\n`;
        message += "Properties:\n";
        message += Object.entries(d.properties)
          .filter(([key]) => !["neo4jId", "size", "color"].includes(key))
          .map(([key, value]) => `${key}: ${value}`)
          .join("\n");

        message += "\n\nConnections:\n";
        if (connections.length === 0) {
          message += "No connections";
        } else {
          connections.forEach((conn) => {
            const direction = conn.direction === "outgoing" ? "→" : "←";
            message += `${conn.node.label} (${conn.node.group}) ${direction} ${conn.type}\n`;
          });
        }

        alert(message);
      });

    // Function to check if two nodes are connected
    function isConnected(a, b) {
      if (a.id === b.id) return true; // Same node

      // Check if there's a link between the nodes
      return validLinks.some(
        (link) =>
          (link.source.id === a.id && link.target.id === b.id) ||
          (link.source.id === b.id && link.target.id === a.id)
      );
    }

    // Update positions on each tick of the simulation
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      linkText
        .attr("x", (d) => (d.source.x + d.target.x) / 2)
        .attr("y", (d) => (d.source.y + d.target.y) / 2);

      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

      text.attr("x", (d) => d.x).attr("y", (d) => d.y);
    });

    // Drag functionality for nodes
    function drag(simulation) {
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }

      return d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }

    // Cleanup function
    return () => {
      simulation.stop();
    };
  }, [graphData, isLoading, error]);

  return (
    <div className="graph-visualization">
      <h2 className="text-2xl font-bold text-emerald-700 mb-4">
        Knowledge Graph Visualization
      </h2>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          <p className="ml-3 text-emerald-700">Loading graph data...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          <p>{error}</p>
          {debugInfo && (
            <div className="mt-3 text-xs">
              <details>
                <summary className="cursor-pointer font-semibold">
                  Debug Information (Developers Only)
                </summary>
                <pre className="mt-2 p-2 bg-red-50 overflow-auto whitespace-pre-wrap">
                  <strong>Error:</strong> {debugInfo.message}
                  {debugInfo.responseText && (
                    <>
                      <br />
                      <br />
                      <strong>Response:</strong>
                      <br />
                      {debugInfo.responseText}
                    </>
                  )}
                  {debugInfo.stack && (
                    <>
                      <br />
                      <br />
                      <strong>Stack:</strong>
                      <br />
                      {debugInfo.stack}
                    </>
                  )}
                </pre>
              </details>
            </div>
          )}
        </div>
      )}

      {!isLoading && !error && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-4">
            This visualization shows the relationships between plants, soil
            types, counties, and other entities in our Irish gardening knowledge
            graph. Hover over any node to highlight its connections, and click
            on a node to see its detailed relationships. You can zoom, pan, and
            drag nodes to explore the graph.
          </p>

          <div className="flex justify-between items-center mb-3">
            <div>
              <strong>Nodes:</strong> {graphData.nodes.length} |
              <strong> Links:</strong> {graphData.links.length}
            </div>
            <button
              className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-3 py-1 rounded text-sm"
              onClick={() => {
                if (svgRef.current) {
                  d3.select(svgRef.current).selectAll("*").remove();
                  // Force re-render by updating state with a copy
                  setGraphData({ ...graphData });
                }
              }}
            >
              Rearrange Graph
            </button>
          </div>

          <div
            className="graph-container border border-gray-200 rounded-lg bg-white"
            style={{ height: "600px", width: "100%", position: "relative" }}
          >
            <svg ref={svgRef} width="100%" height="100%"></svg>
            <div ref={tooltipRef}></div>
          </div>

          <div className="flex flex-wrap gap-3 mt-4 text-sm">
            <div className="flex items-center">
              <span
                className="w-4 h-4 inline-block mr-1 rounded-full"
                style={{ backgroundColor: "#4CAF50" }}
              ></span>
              <span>Plants</span>
            </div>
            <div className="flex items-center">
              <span
                className="w-4 h-4 inline-block mr-1 rounded-full"
                style={{ backgroundColor: "#8B4513" }}
              ></span>
              <span>Soil Types</span>
            </div>
            <div className="flex items-center">
              <span
                className="w-4 h-4 inline-block mr-1 rounded-full"
                style={{ backgroundColor: "#1E88E5" }}
              ></span>
              <span>Counties</span>
            </div>
            <div className="flex items-center">
              <span
                className="w-4 h-4 inline-block mr-1 rounded-full"
                style={{ backgroundColor: "#9C27B0" }}
              ></span>
              <span>Months</span>
            </div>
            <div className="flex items-center">
              <span
                className="w-4 h-4 inline-block mr-1 rounded-full"
                style={{ backgroundColor: "#FFEB3B" }}
              ></span>
              <span>Pollinators</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
