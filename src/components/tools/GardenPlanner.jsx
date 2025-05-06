import React, { useState, useEffect, useRef } from "react";

const GardenPlanner = ({ initialGarden = null }) => {
  // Garden settings & state
  const [gardenSettings, setGardenSettings] = useState({
    width: initialGarden?.width || 3, // meters
    length: initialGarden?.length || 4, // meters
    gridSize: initialGarden?.gridSize || 0.5, // meters per grid cell
    name: initialGarden?.name || "My Garden",
  });

  const [plants, setPlants] = useState(initialGarden?.plants || []);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [placementMode, setPlacementMode] = useState(false);
  const [viewMode, setViewMode] = useState("plan"); // 'plan', '3d'
  const [currentTool, setCurrentTool] = useState("plants"); // 'plants', 'structures', 'paths'
  const [structures, setStructures] = useState(initialGarden?.structures || []);
  const [paths, setPaths] = useState(initialGarden?.paths || []);
  const [activeItem, setActiveItem] = useState(null);
  const [deleted, setDeleted] = useState({
    plants: [],
    structures: [],
    paths: [],
  });
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [tooltip, setTooltip] = useState({ show: false, text: "", x: 0, y: 0 });

  // Available plant catalog
  const [availablePlants, setAvailablePlants] = useState([]);
  const [structures3DModels, setStructures3DModels] = useState({});
  const [filteredCatalog, setFilteredCatalog] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTags, setFilterTags] = useState([]);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Plant catalog mock data
  // This would typically come from an API
  useEffect(() => {
    // Mock data - In a real app, fetch from API
    const mockPlantCatalog = [
      {
        id: "tomato",
        name: "Tomato",
        latinName: "Solanum lycopersicum",
        category: "vegetables",
        spacing: 0.5, // meters
        height: 1.2, // meters
        width: 0.6, // meters - plant spread
        growthMonths: [5, 6, 7, 8, 9], // May to September
        harvestMonths: [7, 8, 9], // July to September
        waterNeeds: "Medium",
        sunNeeds: "Full Sun",
        tags: ["vegetable", "annual", "edible"],
        companionPlants: ["basil", "marigold", "onion"],
        avoidPlants: ["potato", "fennel"],
        color: "#e74c3c", // for display in plan view
        icon: "🍅",
        nativeToIreland: false,
        hardiness: "H3",
        imageUrl: "/assets/plants/tomato.jpg",
      },
      {
        id: "carrot",
        name: "Carrot",
        latinName: "Daucus carota",
        category: "vegetables",
        spacing: 0.1, // meters
        height: 0.3, // meters
        width: 0.1, // meters - plant spread
        growthMonths: [3, 4, 5, 6, 7, 8], // March to August
        harvestMonths: [6, 7, 8, 9, 10], // June to October
        waterNeeds: "Medium",
        sunNeeds: "Full Sun",
        tags: ["vegetable", "annual", "edible", "root"],
        companionPlants: ["onion", "leek", "rosemary"],
        avoidPlants: ["dill", "parsley"],
        color: "#e67e22", // for display in plan view
        icon: "🥕",
        nativeToIreland: false,
        hardiness: "H5",
        imageUrl: "/assets/plants/carrot.jpg",
      },
      {
        id: "potato",
        name: "Potato",
        latinName: "Solanum tuberosum",
        category: "vegetables",
        spacing: 0.3, // meters
        height: 0.6, // meters
        width: 0.4, // meters - plant spread
        growthMonths: [3, 4, 5, 6, 7], // March to July
        harvestMonths: [6, 7, 8, 9], // June to September
        waterNeeds: "Medium",
        sunNeeds: "Full Sun",
        tags: ["vegetable", "annual", "edible", "root"],
        companionPlants: ["cabbage", "corn", "beans"],
        avoidPlants: ["tomato", "cucumber", "sunflower"],
        color: "#9b59b6", // for display in plan view
        icon: "🥔",
        nativeToIreland: false,
        hardiness: "H4",
        imageUrl: "/assets/plants/potato.jpg",
      },
      {
        id: "cabbage",
        name: "Cabbage",
        latinName: "Brassica oleracea var. capitata",
        category: "vegetables",
        spacing: 0.5, // meters
        height: 0.4, // meters
        width: 0.5, // meters - plant spread
        growthMonths: [3, 4, 5, 6, 7, 8, 9], // March to September
        harvestMonths: [6, 7, 8, 9, 10, 11], // June to November
        waterNeeds: "Medium",
        sunNeeds: "Full Sun",
        tags: ["vegetable", "annual", "edible"],
        companionPlants: ["potato", "celery", "dill"],
        avoidPlants: ["strawberry", "tomato", "grape"],
        color: "#2ecc71", // for display in plan view
        icon: "🥬",
        nativeToIreland: false,
        hardiness: "H5",
        imageUrl: "/assets/plants/cabbage.jpg",
      },
      {
        id: "wildflower",
        name: "Irish Wildflower Mix",
        latinName: "Various",
        category: "flowers",
        spacing: 0.2, // meters
        height: 0.6, // meters
        width: 0.3, // meters - plant spread
        growthMonths: [3, 4, 5, 6, 7, 8], // March to August
        harvestMonths: [],
        waterNeeds: "Low",
        sunNeeds: "Full Sun",
        tags: ["flower", "perennial", "native", "pollinator"],
        companionPlants: ["most plants"],
        avoidPlants: [],
        color: "#f1c40f", // for display in plan view
        icon: "🌼",
        nativeToIreland: true,
        hardiness: "H7",
        imageUrl: "/assets/plants/wildflower.jpg",
      },
      {
        id: "thyme",
        name: "Thyme",
        latinName: "Thymus vulgaris",
        category: "herbs",
        spacing: 0.3, // meters
        height: 0.3, // meters
        width: 0.3, // meters - plant spread
        growthMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // All year
        harvestMonths: [4, 5, 6, 7, 8, 9], // April to September
        waterNeeds: "Low",
        sunNeeds: "Full Sun",
        tags: ["herb", "perennial", "edible", "pollinator"],
        companionPlants: ["strawberry", "cabbage", "tomato"],
        avoidPlants: [],
        color: "#27ae60", // for display in plan view
        icon: "🌿",
        nativeToIreland: false,
        hardiness: "H5",
        imageUrl: "/assets/plants/thyme.jpg",
      },
    ];

    const mockStructures3DModels = {
      shed: { url: "/assets/models/shed.gltf", scale: 1 },
      greenhouse: { url: "/assets/models/greenhouse.gltf", scale: 1 },
      raisedBed: { url: "/assets/models/raised-bed.gltf", scale: 1 },
      fence: { url: "/assets/models/fence.gltf", scale: 1 },
      water: { url: "/assets/models/water-barrel.gltf", scale: 1 },
    };

    setAvailablePlants(mockPlantCatalog);
    setFilteredCatalog(mockPlantCatalog);
    setStructures3DModels(mockStructures3DModels);
  }, []);

  // Filter plants based on search and tags
  useEffect(() => {
    let filtered = [...availablePlants];

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (plant) =>
          plant.name.toLowerCase().includes(term) ||
          plant.latinName.toLowerCase().includes(term)
      );
    }

    if (filterTags.length > 0) {
      filtered = filtered.filter((plant) =>
        filterTags.some((tag) => plant.tags.includes(tag))
      );
    }

    setFilteredCatalog(filtered);
  }, [searchTerm, filterTags, availablePlants]);

  // Base structure categories for the UI
  const structureCategories = [
    {
      id: "buildings",
      name: "Buildings",
      items: [
        {
          id: "shed",
          name: "Shed",
          width: 2,
          length: 3,
          height: 2.5,
          color: "#8d6e63",
        },
        {
          id: "greenhouse",
          name: "Greenhouse",
          width: 2,
          length: 3,
          height: 2.5,
          color: "#b3e5fc",
        },
      ],
    },
    {
      id: "beds",
      name: "Garden Beds",
      items: [
        {
          id: "raisedBed",
          name: "Raised Bed",
          width: 1,
          length: 2,
          height: 0.5,
          color: "#795548",
        },
        {
          id: "squareBed",
          name: "Square Bed",
          width: 1,
          length: 1,
          height: 0.5,
          color: "#795548",
        },
      ],
    },
    {
      id: "features",
      name: "Features",
      items: [
        {
          id: "fence",
          name: "Fence Section",
          width: 0.1,
          length: 1,
          height: 1.8,
          color: "#a1887f",
        },
        {
          id: "water",
          name: "Water Barrel",
          width: 0.6,
          length: 0.6,
          height: 1,
          color: "#42a5f5",
        },
      ],
    },
  ];

  // Update canvas when garden settings or plants change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const gridCount = {
      width: Math.ceil(gardenSettings.width / gardenSettings.gridSize),
      height: Math.ceil(gardenSettings.length / gardenSettings.gridSize),
    };

    // Set canvas size based on container
    if (containerRef.current) {
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const aspectRatio = gardenSettings.width / gardenSettings.length;

      let canvasWidth, canvasHeight;
      if (rect.width / rect.height > aspectRatio) {
        // Container is wider than needed
        canvasHeight = rect.height - 40; // Padding
        canvasWidth = canvasHeight * aspectRatio;
      } else {
        // Container is taller than needed
        canvasWidth = rect.width - 40; // Padding
        canvasHeight = canvasWidth / aspectRatio;
      }

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
    }

    // Calculate pixels per grid
    const pxPerGridX = canvas.width / gridCount.width;
    const pxPerGridY = canvas.height / gridCount.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = "#8bc34a33"; // Light green with transparency
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "#bbb";
    ctx.lineWidth = 1;

    // Draw horizontal grid lines
    for (let i = 0; i <= gridCount.height; i++) {
      const y = i * pxPerGridY;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw vertical grid lines
    for (let i = 0; i <= gridCount.width; i++) {
      const x = i * pxPerGridX;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Draw paths
    paths.forEach((path) => {
      ctx.fillStyle = path.color || "#a1887f";

      const x = path.x * pxPerGridX;
      const y = path.y * pxPerGridY;
      const width = path.width * pxPerGridX;
      const height = path.length * pxPerGridY;

      // Draw path with rounded corners
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, 5);
      ctx.fill();
    });

    // Draw structures
    structures.forEach((structure) => {
      ctx.fillStyle = structure.color || "#8d6e63";

      const x = structure.x * pxPerGridX;
      const y = structure.y * pxPerGridY;
      const width = structure.width * pxPerGridX;
      const height = structure.length * pxPerGridY;

      // Draw structure
      ctx.fillRect(x, y, width, height);

      // Draw structure name
      ctx.fillStyle = "#fff";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.fillText(structure.name, x + width / 2, y + height / 2);
    });

    // Draw plants
    plants.forEach((plant) => {
      const plantInfo = availablePlants.find((p) => p.id === plant.typeId) || {
        color: "#3498db",
        name: "Unknown Plant",
        icon: "🌱",
      };

      // Calculate plant position and size
      const plantSize = Math.min(pxPerGridX, pxPerGridY) * plant.size;
      const x = plant.x * pxPerGridX - plantSize / 2 + pxPerGridX / 2;
      const y = plant.y * pxPerGridY - plantSize / 2 + pxPerGridY / 2;

      // Draw plant circle
      ctx.fillStyle = plantInfo.color || "#3498db";
      ctx.beginPath();
      ctx.arc(
        x + plantSize / 2,
        y + plantSize / 2,
        plantSize / 2,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Draw plant icon or first letter
      ctx.fillStyle = "#fff";
      ctx.font = `${plantSize * 0.6}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const icon = plantInfo.icon || plantInfo.name.charAt(0);
      ctx.fillText(icon, x + plantSize / 2, y + plantSize / 2);
    });
  }, [gardenSettings, plants, structures, paths, availablePlants]);

  // Handle canvas click for plant placement
  const handleCanvasClick = (e) => {
    if (!placementMode || !selectedPlant) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert click position to grid coordinates
    const gridCount = {
      width: Math.ceil(gardenSettings.width / gardenSettings.gridSize),
      height: Math.ceil(gardenSettings.length / gardenSettings.gridSize),
    };

    const pxPerGridX = canvas.width / gridCount.width;
    const pxPerGridY = canvas.height / gridCount.height;

    const gridX = Math.floor(x / pxPerGridX);
    const gridY = Math.floor(y / pxPerGridY);

    // Add plant to garden
    const plantSize = selectedPlant.width / gardenSettings.gridSize;
    const newPlant = {
      id: `plant-${Date.now()}`,
      typeId: selectedPlant.id,
      x: gridX,
      y: gridY,
      size: plantSize,
      plantedDate: new Date().toISOString(),
    };

    // Check if this space is already occupied
    const isOccupied = plants.some(
      (plant) => plant.x === gridX && plant.y === gridY
    );

    if (!isOccupied) {
      // Save current state for undo
      saveStateForUndo();

      setPlants((prev) => [...prev, newPlant]);

      // Optionally exit placement mode after placing
      // setPlacementMode(false);
    } else {
      setTooltip({
        show: true,
        text: "This space is already occupied",
        x: e.clientX,
        y: e.clientY,
      });

      setTimeout(() => {
        setTooltip({ show: false, text: "", x: 0, y: 0 });
      }, 2000);
    }
  };

  // Function to save current state for undo
  const saveStateForUndo = () => {
    setUndoStack((prev) => [
      ...prev,
      {
        plants: [...plants],
        structures: [...structures],
        paths: [...paths],
      },
    ]);
    setRedoStack([]); // Clear redo stack after new action
  };

  // Handle undo
  const handleUndo = () => {
    if (undoStack.length === 0) return;

    // Save current state to redo stack
    setRedoStack((prev) => [
      ...prev,
      {
        plants: [...plants],
        structures: [...structures],
        paths: [...paths],
      },
    ]);

    // Pop last state from undo stack
    const lastState = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));

    // Apply the state
    setPlants(lastState.plants);
    setStructures(lastState.structures);
    setPaths(lastState.paths);
  };

  // Handle redo
  const handleRedo = () => {
    if (redoStack.length === 0) return;

    // Save current state to undo stack
    setUndoStack((prev) => [
      ...prev,
      {
        plants: [...plants],
        structures: [...structures],
        paths: [...paths],
      },
    ]);

    // Pop last state from redo stack
    const nextState = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));

    // Apply the state
    setPlants(nextState.plants);
    setStructures(nextState.structures);
    setPaths(nextState.paths);
  };

  // Function to add a structure to the garden
  const addStructure = (structureType) => {
    const structureDef = structureCategories
      .flatMap((cat) => cat.items)
      .find((item) => item.id === structureType);

    if (!structureDef) return;

    saveStateForUndo();

    // Add structure at a default position
    const newStructure = {
      id: `structure-${Date.now()}`,
      typeId: structureDef.id,
      name: structureDef.name,
      x: 1, // Default position
      y: 1, // Default position
      width: structureDef.width / gardenSettings.gridSize,
      length: structureDef.length / gardenSettings.gridSize,
      height: structureDef.height,
      color: structureDef.color,
    };

    setStructures((prev) => [...prev, newStructure]);
    setCurrentTool("select");
  };

  // Calculate companion planting compatibility
  const calculateCompanionCompatibility = () => {
    // Group plants by position to analyze only plants that are adjacent
    const plantsByPosition = {};
    plants.forEach((plant) => {
      const key = `${plant.x}-${plant.y}`;
      if (!plantsByPosition[key]) plantsByPosition[key] = [];
      plantsByPosition[key].push(plant);
    });

    // Check for companion plant conflicts
    const conflicts = [];
    const benefits = [];

    plants.forEach((plant) => {
      const plantInfo = availablePlants.find((p) => p.id === plant.typeId);
      if (!plantInfo) return;

      // Check 8 adjacent grid cells for other plants
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (dx === 0 && dy === 0) continue; // Skip self

          const adjacentKey = `${plant.x + dx}-${plant.y + dy}`;
          const adjacentPlants = plantsByPosition[adjacentKey] || [];

          adjacentPlants.forEach((adjPlant) => {
            const adjPlantInfo = availablePlants.find(
              (p) => p.id === adjPlant.typeId
            );
            if (!adjPlantInfo) return;

            // Check for conflicts (plants to avoid)
            if (plantInfo.avoidPlants?.includes(adjPlantInfo.id)) {
              conflicts.push({
                plant1: plant,
                plant2: adjPlant,
                reason: `${plantInfo.name} should not be planted near ${adjPlantInfo.name}`,
              });
            }

            // Check for benefits (companion plants)
            if (plantInfo.companionPlants?.includes(adjPlantInfo.id)) {
              benefits.push({
                plant1: plant,
                plant2: adjPlant,
                reason: `${plantInfo.name} benefits from being planted near ${adjPlantInfo.name}`,
              });
            }
          });
        }
      }
    });

    return { conflicts, benefits };
  };

  // Function to export garden plan
  const exportGarden = () => {
    const gardenData = {
      ...gardenSettings,
      plants: plants.map((plant) => ({
        ...plant,
        plantInfo: availablePlants.find((p) => p.id === plant.typeId),
      })),
      structures,
      paths,
      compatibility: calculateCompanionCompatibility(),
    };

    const jsonString = JSON.stringify(gardenData, null, 2);
    const dataBlob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${gardenSettings.name
      .replace(/\s+/g, "-")
      .toLowerCase()}-plan.json`;
    link.click();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Garden Planner Header */}
      <div className="bg-green-700 text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Garden Planner</h2>
          <input
            type="text"
            value={gardenSettings.name}
            onChange={(e) =>
              setGardenSettings({ ...gardenSettings, name: e.target.value })
            }
            className="bg-green-800 text-white px-2 py-1 rounded border border-green-600"
            aria-label="Garden name"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className={`p-2 rounded ${
              undoStack.length === 0
                ? "bg-green-800 text-green-600"
                : "bg-green-600 hover:bg-green-500"
            }`}
            title="Undo"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
              />
            </svg>
          </button>

          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className={`p-2 rounded ${
              redoStack.length === 0
                ? "bg-green-800 text-green-600"
                : "bg-green-600 hover:bg-green-500"
            }`}
            title="Redo"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 10h7m0 0v2m0-2l-6 6m-7-16l6 6m-6-6v12"
              />
            </svg>
          </button>

          <button
            onClick={exportGarden}
            className="bg-green-600 hover:bg-green-500 p-2 rounded"
            title="Export Garden Plan"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Garden Settings */}
      <div className="bg-green-50 p-3 border-b border-green-200 flex flex-wrap gap-4">
        <div className="flex items-center">
          <label className="text-sm font-medium mr-2">Width (m):</label>
          <input
            type="number"
            value={gardenSettings.width}
            onChange={(e) =>
              setGardenSettings({
                ...gardenSettings,
                width: parseFloat(e.target.value) || 1,
              })
            }
            className="w-16 px-2 py-1 border rounded"
            min="1"
            max="20"
            step="0.5"
          />
        </div>

        <div className="flex items-center">
          <label className="text-sm font-medium mr-2">Length (m):</label>
          <input
            type="number"
            value={gardenSettings.length}
            onChange={(e) =>
              setGardenSettings({
                ...gardenSettings,
                length: parseFloat(e.target.value) || 1,
              })
            }
            className="w-16 px-2 py-1 border rounded"
            min="1"
            max="20"
            step="0.5"
          />
        </div>

        <div className="flex items-center">
          <label className="text-sm font-medium mr-2">Grid Size (m):</label>
          <select
            value={gardenSettings.gridSize}
            onChange={(e) =>
              setGardenSettings({
                ...gardenSettings,
                gridSize: parseFloat(e.target.value),
              })
            }
            className="px-2 py-1 border rounded"
          >
            <option value="0.1">0.1m</option>
            <option value="0.25">0.25m</option>
            <option value="0.5">0.5m</option>
            <option value="1">1m</option>
          </select>
        </div>

        <div className="flex items-center">
          <label className="text-sm font-medium mr-2">View:</label>
          <div className="flex border rounded overflow-hidden">
            <button
              onClick={() => setViewMode("plan")}
              className={`px-3 py-1 ${
                viewMode === "plan" ? "bg-green-600 text-white" : "bg-white"
              }`}
            >
              Plan
            </button>
            <button
              onClick={() => setViewMode("3d")}
              className={`px-3 py-1 ${
                viewMode === "3d" ? "bg-green-600 text-white" : "bg-white"
              }`}
            >
              3D
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-grow overflow-hidden">
        {/* Left Sidebar: Catalog */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          {/* Tool Selection */}
          <div className="p-3 border-b border-gray-200">
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentTool("plants")}
                className={`flex-1 p-2 text-sm font-medium rounded-l ${
                  currentTool === "plants"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100"
                }`}
              >
                Plants
              </button>
              <button
                onClick={() => setCurrentTool("structures")}
                className={`flex-1 p-2 text-sm font-medium ${
                  currentTool === "structures"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100"
                }`}
              >
                Structures
              </button>
              <button
                onClick={() => setCurrentTool("paths")}
                className={`flex-1 p-2 text-sm font-medium rounded-r ${
                  currentTool === "paths"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100"
                }`}
              >
                Paths
              </button>
            </div>
          </div>

          {/* Search & Filter (for plants) */}
          {currentTool === "plants" && (
            <div className="p-3 border-b border-gray-200">
              <input
                type="text"
                placeholder="Search plants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />

              <div className="mt-2 flex flex-wrap gap-1">
                {[
                  "vegetable",
                  "herb",
                  "flower",
                  "native",
                  "perennial",
                  "annual",
                ].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      if (filterTags.includes(tag)) {
                        setFilterTags(filterTags.filter((t) => t !== tag));
                      } else {
                        setFilterTags([...filterTags, tag]);
                      }
                    }}
                    className={`text-xs px-2 py-1 rounded-full ${
                      filterTags.includes(tag)
                        ? "bg-green-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Plant Catalog */}
          {currentTool === "plants" && (
            <div className="flex-grow overflow-y-auto p-3">
              <h3 className="text-sm font-semibold mb-2">Plants</h3>
              <div className="space-y-2">
                {filteredCatalog.map((plant) => (
                  <div
                    key={plant.id}
                    onClick={() => {
                      setSelectedPlant(plant);
                      setPlacementMode(true);
                    }}
                    className={`border rounded p-2 cursor-pointer hover:bg-green-50 flex items-center ${
                      selectedPlant?.id === plant.id && placementMode
                        ? "bg-green-100 border-green-600"
                        : ""
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center mr-2"
                      style={{ backgroundColor: plant.color || "#3498db" }}
                    >
                      <span>{plant.icon || plant.name.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="font-medium text-sm">{plant.name}</div>
                      <div className="text-xs text-gray-500 italic">
                        {plant.latinName}
                      </div>
                    </div>
                  </div>
                ))}

                {filteredCatalog.length === 0 && (
                  <div className="text-gray-500 text-sm">
                    No plants match your filter
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Structure Catalog */}
          {currentTool === "structures" && (
            <div className="flex-grow overflow-y-auto p-3">
              {structureCategories.map((category) => (
                <div key={category.id} className="mb-4">
                  <h3 className="text-sm font-semibold mb-2">
                    {category.name}
                  </h3>
                  <div className="space-y-2">
                    {category.items.map((structure) => (
                      <div
                        key={structure.id}
                        onClick={() => addStructure(structure.id)}
                        className={`border rounded p-2 cursor-pointer hover:bg-green-50 flex items-center`}
                      >
                        <div
                          className="w-8 h-8 rounded flex items-center justify-center mr-2"
                          style={{
                            backgroundColor: structure.color || "#8d6e63",
                          }}
                        ></div>
                        <div className="font-medium text-sm">
                          {structure.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Path Tools */}
          {currentTool === "paths" && (
            <div className="flex-grow overflow-y-auto p-3">
              <h3 className="text-sm font-semibold mb-2">Path Tools</h3>
              <div className="space-y-4">
                <div className="border rounded p-3">
                  <h4 className="text-xs font-medium mb-2">Path Type</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="bg-amber-100 border border-amber-300 rounded p-2 text-center text-sm">
                      Gravel
                    </button>
                    <button className="bg-gray-100 border border-gray-300 rounded p-2 text-center text-sm">
                      Stone
                    </button>
                    <button className="bg-green-100 border border-green-300 rounded p-2 text-center text-sm">
                      Grass
                    </button>
                    <button className="bg-amber-200 border border-amber-400 rounded p-2 text-center text-sm">
                      Wood Chip
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Click and drag on garden to create path
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Garden Canvas */}
        <div className="flex-grow p-4 flex flex-col" ref={containerRef}>
          {/* Garden Visualization */}
          {viewMode === "plan" && (
            <div className="flex-grow flex items-center justify-center bg-gray-100 rounded">
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="border border-gray-300 rounded shadow"
              />
            </div>
          )}

          {viewMode === "3d" && (
            <div className="flex-grow flex items-center justify-center bg-gray-100 rounded">
              <div className="text-center p-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <p className="mt-2 text-gray-600">
                  3D view would render here with a WebGL engine
                </p>
                <p className="text-sm text-gray-500">
                  Using 3D models of plants, structures and terrain
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Info Panel */}
        <div className="w-64 bg-white border-l border-gray-200">
          <div className="p-3 border-b border-gray-200">
            <h3 className="font-semibold">Garden Information</h3>
          </div>

          <div className="p-3">
            <h4 className="text-sm font-medium mb-2">Plants</h4>
            <p className="text-sm">{plants.length} plants in garden</p>

            <h4 className="text-sm font-medium mt-4 mb-2">Garden Size</h4>
            <p className="text-sm">
              {gardenSettings.width}m × {gardenSettings.length}m (
              {(gardenSettings.width * gardenSettings.length).toFixed(1)} m²)
            </p>

            <h4 className="text-sm font-medium mt-4 mb-2">Current Month</h4>
            <p className="text-sm">May, 2025</p>

            {/* Companion Planting Analysis */}
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Planting Analysis</h4>

              {plants.length > 1 ? (
                <>
                  {calculateCompanionCompatibility().conflicts.length > 0 ? (
                    <div className="text-red-600 text-xs">
                      ⚠️ Some plants may conflict with each other
                    </div>
                  ) : (
                    <div className="text-green-600 text-xs">
                      ✓ No planting conflicts detected
                    </div>
                  )}

                  {calculateCompanionCompatibility().benefits.length > 0 ? (
                    <div className="text-green-600 text-xs mt-1">
                      ✓ Some plants are beneficial companions
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="text-xs text-gray-500">
                  Add more plants to see companion analysis
                </div>
              )}
            </div>

            <button
              onClick={() => {
                if (plants.length > 0) {
                  alert("View detailed companion planting report");
                } else {
                  alert("Add some plants to generate a report");
                }
              }}
              className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-4 rounded"
            >
              View Full Report
            </button>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip.show && (
        <div
          className="fixed bg-gray-800 text-white px-3 py-1 rounded text-sm shadow-lg z-50"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 30,
            transform: "translateX(-50%)",
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
};

export default GardenPlanner;
