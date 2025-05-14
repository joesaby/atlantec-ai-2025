import React, { useState } from "react";
import { getAllUserProgress } from "../../utils/sustainability-store";

const CommunityImpact = () => {
  const [activeTab, setActiveTab] = useState("sharing");
  const [shareMessageSent, setShareMessageSent] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [userProgress] = useState(getAllUserProgress());

  // Simulate sharing sustainability results
  const handleShareResults = (e) => {
    e.preventDefault();

    // Calculate total sustainability impact
    const activePracticeCount = userProgress.activePractices.length;
    const score = userProgress.score;
    const formattedMessage =
      `I'm making my garden more sustainable! I've implemented ${activePracticeCount} sustainable practices ` +
      `and reached a sustainability score of ${score}/100. Join me in gardening for a greener Ireland! ` +
      (shareMessage ? `\n\nMy gardening tip: ${shareMessage}` : "");

    // Pretend to share (in a real app, this would connect to social media APIs)
    console.log("Sharing sustainability results:", formattedMessage);
    setShareMessageSent(true);
    setTimeout(() => {
      setShareMessageSent(false);
      setShareMessage("");
    }, 3000);
  };

  // Community impact data - in a real app, this would come from a database
  const communityImpactData = {
    // Number of Irish gardeners using the app
    totalUsers: 5847,

    // Average sustainable practices implemented per user
    avgPractices: 8.3,

    // Total practices implemented across all users
    totalPractices: 48530,

    // Estimated environmental impact
    impact: {
      waterSaved: 3500000, // liters
      carbonReduced: 48000, // kg CO2e
      composted: 75000, // kg
      foodGrown: 23000, // kg
    },
  };

  // Calculate the user's contribution as a percentage of the community total
  const calculateUserContribution = (metric, communityTotal) => {
    // Default contribution is 0%
    if (!userProgress || !communityTotal) return 0;

    // For practices, calculate based on active practices
    if (metric === "practices") {
      const userPractices = userProgress.activePractices.length;
      return Math.round((userPractices / communityTotal) * 100 * 100) / 100;
    }

    // For water, calculate based on water conservation practices
    if (metric === "water") {
      const waterPractices = userProgress.activePractices.filter(
        (p) => p.id && p.id.startsWith("water-")
      ).length;
      const estimatedSaved = waterPractices * 1000; // Rough estimate of 1000L per practice
      return Math.round((estimatedSaved / communityTotal) * 100 * 100) / 100;
    }

    // For carbon, base on active practices and harvests
    if (metric === "carbon") {
      const carbonPractices = userProgress.activePractices.filter(
        (p) =>
          p.id && (p.id.includes("compost") || p.id.startsWith("biodiversity"))
      ).length;
      const harvests = (userProgress.resourceUsage.harvest || []).length;
      const estimatedCarbon = carbonPractices * 100 + harvests * 5;
      return Math.round((estimatedCarbon / communityTotal) * 100 * 100) / 100;
    }

    return 0;
  };

  // Generate nearby sustainability initiatives - simulated data for Ireland
  const nearbyInitiatives = [
    {
      name: "Community Garden Network",
      description:
        "A network of community gardens across Ireland focused on sustainable growing and education",
      website: "https://communitygardenireland.ie",
      locations: "Nationwide",
    },
    {
      name: "GIY (Grow It Yourself)",
      description:
        "Supports people to grow food at home, school, work and in the community",
      website: "https://giy.ie",
      locations: "Waterford & Nationwide",
    },
    {
      name: "Irish Seed Savers Association",
      description:
        "Conserves and distributes traditional Irish food crop varieties",
      website: "https://irishseedsavers.ie",
      locations: "Co. Clare & Nationwide",
    },
    {
      name: "Sustainable Energy Communities",
      description:
        "Local communities working together to reduce energy consumption through gardening and food production",
      website:
        "https://www.seai.ie/community-energy/sustainable-energy-communities/",
      locations: "Nationwide",
    },
  ];

  // Local gardening events - simulated data
  const localEvents = [
    {
      name: "Seed Swap Meet",
      date: "June 12, 2025",
      location: "Phoenix Park, Dublin",
      description: "Bring your saved seeds to swap with other gardeners",
    },
    {
      name: "Sustainable Gardening Workshop",
      date: "June 18, 2025",
      location: "Botanic Gardens, Dublin",
      description:
        "Learn organic pest control and water conservation techniques",
    },
    {
      name: "Community Composting Day",
      date: "June 25, 2025",
      location: "Various Locations",
      description: "Learn about community composting initiatives in your area",
    },
    {
      name: "Native Plant Sale",
      date: "July 2, 2025",
      location: "Airfield Estate, Dublin",
      description: "Purchase native Irish plants from local growers",
    },
  ];

  return (
    <div className="bg-base-100 rounded-lg shadow-lg p-6 mb-8">
      <h3 className="text-xl font-bold mb-4">Community Impact</h3>

      <div className="tabs tabs-boxed mb-6">
        <a
          className={`tab ${activeTab === "sharing" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("sharing")}
        >
          Share Your Impact
        </a>
        <a
          className={`tab ${activeTab === "community" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("community")}
        >
          Community Stats
        </a>
        <a
          className={`tab ${activeTab === "initiatives" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("initiatives")}
        >
          Local Initiatives
        </a>
        <a
          className={`tab ${activeTab === "events" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("events")}
        >
          Events
        </a>
      </div>

      {/* Share Your Impact Tab */}
      {activeTab === "sharing" && (
        <div>
          <p className="mb-4">
            Share your sustainability journey to inspire others in your
            community to adopt eco-friendly gardening practices.
          </p>

          <div className="bg-base-200 p-4 rounded-lg mb-6">
            <h4 className="font-medium mb-3">
              Your Sustainability Achievements
            </h4>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                You've implemented{" "}
                <span className="font-bold">
                  {userProgress.activePractices.length}
                </span>{" "}
                sustainable practices
              </li>
              <li>
                Your sustainability score:{" "}
                <span className="font-bold">{userProgress.score}/100</span>
              </li>
              <li>
                You're supporting{" "}
                <span className="font-bold">
                  {
                    Object.values(userProgress.sdgScores || {}).filter(
                      (score) => score > 0
                    ).length
                  }
                </span>{" "}
                UN Sustainable Development Goals
              </li>
            </ul>
          </div>

          <form onSubmit={handleShareResults}>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">
                  Share a gardening sustainability tip (optional)
                </span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24"
                placeholder="Share your favorite sustainability tip..."
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
              ></textarea>
            </div>

            <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
              <button
                type="submit"
                className="btn btn-primary gap-2"
                disabled={shareMessageSent}
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
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                Share Results
              </button>

              {shareMessageSent && (
                <span className="inline-flex items-center text-success">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Shared successfully!
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Community Stats Tab */}
      {activeTab === "community" && (
        <div>
          <p className="mb-4">
            See how your sustainable gardening efforts contribute to the wider
            community impact across Ireland.
          </p>

          <div className="stats stats-vertical lg:stats-horizontal shadow w-full mb-6">
            <div className="stat">
              <div className="stat-title">Irish Gardeners</div>
              <div className="stat-value text-primary">
                {communityImpactData.totalUsers.toLocaleString()}
              </div>
              <div className="stat-desc">Using this app</div>
            </div>

            <div className="stat">
              <div className="stat-title">Sustainable Practices</div>
              <div className="stat-value">
                {communityImpactData.totalPractices.toLocaleString()}
              </div>
              <div className="stat-desc">Implemented in total</div>
            </div>

            <div className="stat">
              <div className="stat-title">Average Practices</div>
              <div className="stat-value">
                {communityImpactData.avgPractices}
              </div>
              <div className="stat-desc">Per gardener</div>
            </div>
          </div>

          <h4 className="font-semibold mt-8 mb-3">
            Community Environmental Impact
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-base-200 p-4 rounded-lg">
              <div className="stat-title">Water Saved</div>
              <div className="stat-value text-info text-2xl">
                {(communityImpactData.impact.waterSaved / 1000).toFixed(1)}k L
              </div>
              <div className="stat-desc mt-2">
                Your contribution:{" "}
                {calculateUserContribution(
                  "water",
                  communityImpactData.impact.waterSaved
                )}
                %
              </div>
              <progress
                className="progress progress-info w-full mt-1"
                value={calculateUserContribution(
                  "water",
                  communityImpactData.impact.waterSaved
                )}
                max="100"
              ></progress>
            </div>

            <div className="bg-base-200 p-4 rounded-lg">
              <div className="stat-title">Carbon Reduced</div>
              <div className="stat-value text-success text-2xl">
                {(communityImpactData.impact.carbonReduced / 1000).toFixed(1)}k
                kg
              </div>
              <div className="stat-desc mt-2">
                Your contribution:{" "}
                {calculateUserContribution(
                  "carbon",
                  communityImpactData.impact.carbonReduced
                )}
                %
              </div>
              <progress
                className="progress progress-success w-full mt-1"
                value={calculateUserContribution(
                  "carbon",
                  communityImpactData.impact.carbonReduced
                )}
                max="100"
              ></progress>
            </div>

            <div className="bg-base-200 p-4 rounded-lg">
              <div className="stat-title">Waste Composted</div>
              <div className="stat-value text-warning text-2xl">
                {(communityImpactData.impact.composted / 1000).toFixed(1)}k kg
              </div>
              <div className="stat-desc mt-2">Kept out of landfills</div>
            </div>

            <div className="bg-base-200 p-4 rounded-lg">
              <div className="stat-title">Food Grown</div>
              <div className="stat-value text-2xl">
                {(communityImpactData.impact.foodGrown / 1000).toFixed(1)}k kg
              </div>
              <div className="stat-desc mt-2">Reducing food miles</div>
            </div>
          </div>
        </div>
      )}

      {/* Local Initiatives Tab */}
      {activeTab === "initiatives" && (
        <div>
          <p className="mb-4">
            Connect with local initiatives to enhance your sustainable gardening
            journey and make an even bigger impact.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nearbyInitiatives.map((initiative, index) => (
              <div key={index} className="bg-base-200 p-4 rounded-lg">
                <h4 className="font-semibold">{initiative.name}</h4>
                <p className="text-sm mt-1 mb-2">{initiative.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs badge">{initiative.locations}</span>
                  <a
                    href={initiative.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link link-primary text-sm"
                  >
                    Visit Website
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-base-300 p-4 rounded-lg text-center">
            <p className="font-semibold">
              Want to list your local initiative here?
            </p>
            <p className="text-sm mt-1">
              Contact us to add your sustainable gardening community group or
              initiative
            </p>
            <button className="btn btn-sm btn-outline mt-2">
              Submit Initiative
            </button>
          </div>
        </div>
      )}

      {/* Events Tab */}
      {activeTab === "events" && (
        <div>
          <p className="mb-4">
            Discover sustainable gardening events happening near you in Ireland.
          </p>

          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {localEvents.map((event, index) => (
                  <tr key={index}>
                    <td className="font-medium">{event.name}</td>
                    <td>{event.date}</td>
                    <td>{event.location}</td>
                    <td>
                      <div className="flex items-center">
                        <span className="text-sm mr-2">
                          {event.description}
                        </span>
                        <button className="btn btn-xs btn-outline">Info</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 text-center">
            <button className="btn btn-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              View Full Calendar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityImpact;
