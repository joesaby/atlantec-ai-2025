import React, { useState, useEffect } from "react";

const IrishNativeSpeciesGuide = () => {
  const [activeTab, setActiveTab] = useState("plants");
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Collection of Irish native species
  const speciesData = {
    plants: [
      {
        name: "Common Primrose",
        scientific: "Primula vulgaris",
        description:
          "A native perennial with pale yellow flowers, common in hedgerows and woodland edges across Ireland.",
        benefits: [
          "Early nectar source for pollinators",
          "Food for butterfly caterpillars",
          "Indicator of ancient woodland",
        ],
        habitat: "Woodland edges, hedgerows, banks",
        flowering: "February to May",
        image: "primrose.jpg",
      },
      {
        name: "Foxglove",
        scientific: "Digitalis purpurea",
        description:
          "A tall biennial plant with distinctive tubular purple flowers arranged in spikes.",
        benefits: [
          "Major food source for bumblebees",
          "Colonizes disturbed ground",
          "Medicinal properties",
        ],
        habitat: "Woodland clearings, hedgerows, rocky places",
        flowering: "June to August",
        image: "foxglove.jpg",
      },
      {
        name: "Hawthorn",
        scientific: "Crataegus monogyna",
        description:
          "A thorny native tree or shrub with white flowers in spring and red berries in autumn.",
        benefits: [
          "Excellent nesting site for birds",
          "Food source for 150+ insect species",
          "Autumn berries feed birds",
        ],
        habitat: "Hedgerows, woodland edges, scrubland",
        flowering: "May",
        image: "hawthorn.jpg",
      },
      {
        name: "Wild Garlic",
        scientific: "Allium ursinum",
        description:
          "A bulbous perennial herb with distinctive garlic scent and star-like white flowers.",
        benefits: [
          "Early food source for pollinators",
          "Natural pest repellent",
          "Edible leaves and flowers",
        ],
        habitat: "Ancient woodland, damp shaded areas",
        flowering: "April to June",
        image: "wild-garlic.jpg",
      },
      {
        name: "Bird's-foot Trefoil",
        scientific: "Lotus corniculatus",
        description:
          "A small perennial with yellow flowers that turn orange-red as they age.",
        benefits: [
          "Food plant for 160+ insect species",
          "Key butterfly larval food",
          "Nitrogen-fixing",
        ],
        habitat: "Grasslands, meadows, coastal areas",
        flowering: "May to September",
        image: "birds-foot-trefoil.jpg",
      },
    ],
    birds: [
      {
        name: "Robin",
        scientific: "Erithacus rubecula",
        description:
          "A small bird with an orange-red breast, brown back and rounded body.",
        benefits: [
          "Controls garden pests",
          "Indicator of garden health",
          "Year-round garden resident",
        ],
        habitat: "Gardens, woodland, hedgerows",
        nesting: "March to June",
        attracts: [
          "Dense shrubs",
          "Open compost heaps",
          "Ground feeding areas",
        ],
      },
      {
        name: "Goldfinch",
        scientific: "Carduelis carduelis",
        description:
          "A small, colorful finch with red face, black and white head, and gold wing bars.",
        benefits: [
          "Controls weed seeds",
          "Adds color and song to gardens",
          "Indicator of plant diversity",
        ],
        habitat: "Gardens, parkland, open woodland",
        nesting: "April to August",
        attracts: ["Teasels", "Thistles", "Sunflowers", "Nyjer seed feeders"],
      },
      {
        name: "Wren",
        scientific: "Troglodytes troglodytes",
        description:
          "Tiny brown bird with a distinctive cocked tail and surprisingly loud song.",
        benefits: [
          "Major consumer of garden insects",
          "Indicator of habitat complexity",
          "Cultural significance in Ireland",
        ],
        habitat: "Gardens, woodland, hedgerows",
        nesting: "April to July",
        attracts: ["Dense shrubs", "Brush piles", "Log piles", "Ivy cover"],
      },
    ],
    insects: [
      {
        name: "Red-tailed Bumblebee",
        scientific: "Bombus lapidarius",
        description:
          "Black bumblebee with bright red tail. Queens and workers have yellow bands.",
        benefits: [
          "Excellent pollinator",
          "Long tongue reaches deep flowers",
          "Active in cool weather",
        ],
        habitat: "Gardens, meadows, farmland",
        active: "March to October",
        attracts: ["Clover", "Knapweed", "Lavender", "Bee hotels"],
      },
      {
        name: "Peacock Butterfly",
        scientific: "Aglais io",
        description:
          "Large butterfly with distinctive eyespots on each wing resembling peacock feathers.",
        benefits: [
          "Pollinator for many plants",
          "Educational value",
          "Indicator of habitat quality",
        ],
        habitat: "Gardens, meadows, woodland edges",
        active: "March to October",
        attracts: [
          "Nettles for caterpillars",
          "Buddleia",
          "Sedum",
          "Rotting fruit",
        ],
      },
      {
        name: "Seven-spot Ladybird",
        scientific: "Coccinella septempunctata",
        description: "Red beetle with seven black spots, native to Ireland.",
        benefits: [
          "Controls aphids (each can eat 5000 in lifetime)",
          "Indicator of low pesticide use",
          "Educational value",
        ],
        habitat: "Gardens, meadows, hedgerows",
        active: "April to October",
        attracts: [
          "Aphid-rich plants",
          "Umbellifer flowers",
          "Leaf litter for overwintering",
        ],
      },
    ],
    mammals: [
      {
        name: "Hedgehog",
        scientific: "Erinaceus europaeus",
        description:
          "Small mammal covered in spines with brown snout. Nocturnal garden visitor.",
        benefits: [
          "Controls slugs and snails",
          "Indicator of garden connectivity",
          "Cultural significance",
        ],
        habitat: "Gardens, hedgerows, woodland edges",
        active: "April to October (hibernates in winter)",
        attracts: [
          "Leaf piles",
          "Log piles",
          "Hedgehog houses",
          "Gap under fences",
        ],
      },
      {
        name: "Irish Stoat",
        scientific: "Mustela erminea hibernica",
        description:
          "Small, slender carnivore with brown back and white belly. Irish subspecies.",
        benefits: [
          "Controls rodent populations",
          "Indicator of healthy ecosystem",
          "Protected native species",
        ],
        habitat: "Stone walls, hedgerows, woodland edges",
        active: "Year-round",
        attracts: ["Stone walls", "Dense ground cover", "Natural areas"],
      },
      {
        name: "Pygmy Shrew",
        scientific: "Sorex minutus",
        description:
          "Tiny mammal with pointed snout, one of Ireland's smallest mammals.",
        benefits: [
          "Controls garden insects and invertebrates",
          "Indicator of low pesticide use",
        ],
        habitat: "Gardens, grassland, woodland",
        active: "Year-round, mainly nocturnal",
        attracts: ["Long grass areas", "Log piles", "Stone walls"],
      },
    ],
  };

  // Filter species based on search term
  const filteredSpecies =
    searchTerm.trim() !== ""
      ? speciesData[activeTab].filter(
          (species) =>
            species.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            species.scientific.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : speciesData[activeTab];

  return (
    <div className="bg-base-200 p-5 rounded-lg">
      <h4 className="font-semibold mb-4">Irish Native Species Guide</h4>

      {/* Search and category tabs */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between mb-4">
        <div className="tabs tabs-boxed bg-base-300">
          <button
            className={`tab ${activeTab === "plants" ? "tab-active" : ""}`}
            onClick={() => {
              setActiveTab("plants");
              setSelectedSpecies(null);
            }}
          >
            Plants
          </button>
          <button
            className={`tab ${activeTab === "birds" ? "tab-active" : ""}`}
            onClick={() => {
              setActiveTab("birds");
              setSelectedSpecies(null);
            }}
          >
            Birds
          </button>
          <button
            className={`tab ${activeTab === "insects" ? "tab-active" : ""}`}
            onClick={() => {
              setActiveTab("insects");
              setSelectedSpecies(null);
            }}
          >
            Insects
          </button>
          <button
            className={`tab ${activeTab === "mammals" ? "tab-active" : ""}`}
            onClick={() => {
              setActiveTab("mammals");
              setSelectedSpecies(null);
            }}
          >
            Mammals
          </button>
        </div>

        <div className="form-control">
          <div className="input-group input-group-sm">
            <input
              type="text"
              placeholder="Search species..."
              className="input input-bordered input-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              className="btn btn-sm btn-square"
              onClick={() => setSearchTerm("")}
            >
              {searchTerm ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {selectedSpecies ? (
        // Species detail view
        <div className="bg-base-100 p-4 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <h5 className="font-bold">{selectedSpecies.name}</h5>
              <p className="text-sm italic opacity-70">
                {selectedSpecies.scientific}
              </p>
            </div>
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => setSelectedSpecies(null)}
            >
              Back to list
            </button>
          </div>

          {selectedSpecies.image && (
            <div className="mt-3 flex justify-center">
              <img
                src={`/images/plants/${selectedSpecies.image}`}
                alt={selectedSpecies.name}
                className="rounded-lg max-h-40 object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/placeholder-plant.jpg";
                }}
              />
            </div>
          )}

          <div className="divider my-2"></div>

          <div className="text-sm">
            <p>{selectedSpecies.description}</p>

            <div className="mt-3">
              <h6 className="font-medium">Benefits for Biodiversity:</h6>
              <ul className="list-disc pl-5 mt-1">
                {selectedSpecies.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>

            <div className="mt-3">
              <h6 className="font-medium">Natural Habitat:</h6>
              <p>{selectedSpecies.habitat}</p>
            </div>

            {/* Conditional fields based on species type */}
            {selectedSpecies.flowering && (
              <div className="mt-3">
                <h6 className="font-medium">Flowering Period:</h6>
                <p>{selectedSpecies.flowering}</p>
              </div>
            )}

            {selectedSpecies.nesting && (
              <div className="mt-3">
                <h6 className="font-medium">Nesting Season:</h6>
                <p>{selectedSpecies.nesting}</p>
              </div>
            )}

            {selectedSpecies.active && (
              <div className="mt-3">
                <h6 className="font-medium">Active Period:</h6>
                <p>{selectedSpecies.active}</p>
              </div>
            )}

            {selectedSpecies.attracts && (
              <div className="mt-3">
                <h6 className="font-medium">How to Attract to Your Garden:</h6>
                <ul className="list-disc pl-5 mt-1">
                  {typeof selectedSpecies.attracts === "string" ? (
                    <li>{selectedSpecies.attracts}</li>
                  ) : (
                    selectedSpecies.attracts.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-center">
            <a
              href={`https://www.biodiversityireland.ie/search/?q=${encodeURIComponent(
                selectedSpecies.scientific
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-outline"
            >
              Learn more at Biodiversity Ireland
            </a>
          </div>
        </div>
      ) : (
        // Species list view
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredSpecies.length > 0 ? (
            filteredSpecies.map((species, index) => (
              <div
                key={index}
                className="bg-base-100 p-3 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedSpecies(species)}
              >
                <h5 className="font-medium">{species.name}</h5>
                <p className="text-xs italic opacity-70">
                  {species.scientific}
                </p>
                <div className="divider my-1"></div>
                <p className="text-xs line-clamp-2">{species.description}</p>
                <button className="btn btn-xs btn-link mt-1 no-underline hover:underline">
                  View details
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center p-4">
              <p>No species found matching "{searchTerm}"</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 p-3 bg-success bg-opacity-10 rounded-lg border border-success">
        <p className="text-xs font-medium">
          <strong>Did you know?</strong> Ireland has fewer native species than
          mainland Europe due to its island status and the last ice age. This
          makes protecting our native species especially important!
        </p>
      </div>
    </div>
  );
};

export default IrishNativeSpeciesGuide;
