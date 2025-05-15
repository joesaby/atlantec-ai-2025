import React, { useState, useEffect } from "react";
import { getAllUserProgress } from "../../utils/sustainability-store";

const BiodiversityCommunity = () => {
  const [communityTips, setCommunityTips] = useState([]);
  const [newTip, setNewTip] = useState({
    title: "",
    description: "",
    category: "native-plants",
    author: "",
    location: "Galway", // Default location
  });
  const [isAddingTip, setIsAddingTip] = useState(false);
  const [filter, setFilter] = useState("all");

  // Load existing community tips from local storage
  useEffect(() => {
    try {
      const savedTips = localStorage.getItem("biodiversity-community-tips");
      if (savedTips) {
        setCommunityTips(JSON.parse(savedTips));
      } else {
        // Initialize with sample tips
        const sampleTips = [
          {
            id: "tip-1",
            title: "Attracting Hedgehogs",
            description:
              "I've created small gaps (13cm x 13cm) at the base of my garden fence to allow hedgehogs to travel between gardens. This has increased hedgehog sightings in my Dublin suburb.",
            category: "wildlife-habitats",
            author: "Mary O'Connor",
            location: "Dublin",
            date: "2025-04-15T12:00:00",
            likes: 14,
          },
          {
            id: "tip-2",
            title: "Success with Irish Wildflower Meadow",
            description:
              "I turned 30% of my lawn into a wildflower meadow using Yellow Rattle to reduce grass vigor, then sowed native Irish meadow seeds. Now seeing 6 bee species regularly!",
            category: "pollinators",
            author: "Sean Murphy",
            location: "Cork",
            date: "2025-05-01T09:30:00",
            likes: 23,
          },
          {
            id: "tip-3",
            title: "Native Berry Hedge Experience",
            description:
              "I replaced my garden border with a mixed native hedge including hawthorn, blackthorn, and holly. This winter it was filled with thrushes and finches feeding on the berries.",
            category: "native-plants",
            author: "Aoife Kelly",
            location: "Galway",
            date: "2025-03-10T15:45:00",
            likes: 19,
          },
        ];
        localStorage.setItem(
          "biodiversity-community-tips",
          JSON.stringify(sampleTips)
        );
        setCommunityTips(sampleTips);
      }
    } catch (err) {
      console.error("Error loading community tips:", err);
    }
  }, []);

  // Save new tip to local storage
  const saveTip = () => {
    if (!newTip.title.trim() || !newTip.description.trim()) {
      alert("Please enter a title and description for your tip");
      return;
    }

    if (!newTip.author.trim()) {
      alert("Please enter your name");
      return;
    }

    const tip = {
      ...newTip,
      id: `tip-${Date.now()}`,
      date: new Date().toISOString(),
      likes: 0,
    };

    const updatedTips = [...communityTips, tip];
    setCommunityTips(updatedTips);

    localStorage.setItem(
      "biodiversity-community-tips",
      JSON.stringify(updatedTips)
    );

    // Reset the form
    setNewTip({
      title: "",
      description: "",
      category: "native-plants",
      author: "",
      location: "Galway",
    });
    setIsAddingTip(false);
  };

  // Handle liking a tip
  const handleLike = (tipId) => {
    const updatedTips = communityTips.map((tip) =>
      tip.id === tipId ? { ...tip, likes: (tip.likes || 0) + 1 } : tip
    );
    setCommunityTips(updatedTips);
    localStorage.setItem(
      "biodiversity-community-tips",
      JSON.stringify(updatedTips)
    );
  };

  // Filter tips by category
  const filteredTips =
    filter === "all"
      ? communityTips
      : communityTips.filter((tip) => tip.category === filter);

  return (
    <div className="bg-base-100 rounded-lg p-5">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Garden Biodiversity Community</h2>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setIsAddingTip(true)}
        >
          Share Your Tip
        </button>
      </div>

      {/* Filter Categories */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          className={`badge badge-lg ${
            filter === "all" ? "badge-primary" : "badge-outline"
          }`}
          onClick={() => setFilter("all")}
        >
          All Tips
        </button>
        <button
          className={`badge badge-lg ${
            filter === "native-plants" ? "badge-primary" : "badge-outline"
          }`}
          onClick={() => setFilter("native-plants")}
        >
          Native Plants
        </button>
        <button
          className={`badge badge-lg ${
            filter === "pollinators" ? "badge-primary" : "badge-outline"
          }`}
          onClick={() => setFilter("pollinators")}
        >
          Pollinators
        </button>
        <button
          className={`badge badge-lg ${
            filter === "wildlife-habitats" ? "badge-primary" : "badge-outline"
          }`}
          onClick={() => setFilter("wildlife-habitats")}
        >
          Wildlife Habitats
        </button>
      </div>

      {isAddingTip ? (
        <div className="bg-base-200 p-4 rounded-lg mb-6">
          <h3 className="font-bold mb-3">Share Your Biodiversity Tip</h3>
          <div className="form-control mb-3">
            <label className="label">
              <span className="label-text">Tip Title</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={newTip.title}
              onChange={(e) => setNewTip({ ...newTip, title: e.target.value })}
              placeholder="E.g., My successful wildflower meadow"
            />
          </div>

          <div className="form-control mb-3">
            <label className="label">
              <span className="label-text">Tip Category</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={newTip.category}
              onChange={(e) =>
                setNewTip({ ...newTip, category: e.target.value })
              }
            >
              <option value="native-plants">Native Plants</option>
              <option value="pollinators">Pollinators</option>
              <option value="wildlife-habitats">Wildlife Habitats</option>
              <option value="organic-methods">Organic Methods</option>
              <option value="water-features">Water Features</option>
            </select>
          </div>

          <div className="form-control mb-3">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-24 w-full"
              value={newTip.description}
              onChange={(e) =>
                setNewTip({ ...newTip, description: e.target.value })
              }
              placeholder="Share what worked for you, what results you saw, and any specific advice for Irish gardeners..."
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Your Name</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={newTip.author}
                onChange={(e) =>
                  setNewTip({ ...newTip, author: e.target.value })
                }
                placeholder="Your name"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Location in Ireland</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={newTip.location}
                onChange={(e) =>
                  setNewTip({ ...newTip, location: e.target.value })
                }
                placeholder="County or city"
              />
            </div>
          </div>

          <div className="flex justify-end mt-4 gap-2">
            <button
              className="btn btn-outline"
              onClick={() => setIsAddingTip(false)}
            >
              Cancel
            </button>
            <button className="btn btn-primary" onClick={saveTip}>
              Share Tip
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Community tips section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTips.length > 0 ? (
              filteredTips
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((tip) => (
                  <div key={tip.id} className="card bg-base-200 shadow-md">
                    <div className="card-body">
                      <div className="flex justify-between items-start">
                        <h3 className="card-title text-md">{tip.title}</h3>
                        <span className="badge badge-accent">
                          {tip.category === "native-plants"
                            ? "Native Plants"
                            : tip.category === "pollinators"
                            ? "Pollinators"
                            : tip.category === "wildlife-habitats"
                            ? "Wildlife Habitats"
                            : tip.category === "organic-methods"
                            ? "Organic Methods"
                            : "Water Features"}
                        </span>
                      </div>
                      <p className="text-sm mt-2">{tip.description}</p>
                      <div className="flex justify-between items-center mt-3 text-sm">
                        <div>
                          <span className="font-medium">{tip.author}</span> from{" "}
                          <span>{tip.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>{tip.likes || 0}</span>
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => handleLike(tip.id)}
                          >
                            👍
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="col-span-2 text-center py-10">
                <p>
                  No tips found for this category. Be the first to share one!
                </p>
              </div>
            )}
          </div>
        </>
      )}

      <div className="mt-6 p-4 bg-info bg-opacity-10 rounded-lg">
        <h4 className="font-semibold mb-2">How Community Sharing Helps</h4>
        <p className="text-sm">
          Learning from each other's experiences helps to preserve and enhance
          Irish biodiversity. Your local knowledge is valuable for adapting
          conservation practices to Ireland's unique climate and ecosystems.
        </p>
      </div>
    </div>
  );
};

export default BiodiversityCommunity;
