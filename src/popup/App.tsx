import React, { useEffect, useState } from "react";
import "./index.css";
import ratings from "../../ratings.json";

type Rating = {
  overall: number;
  link: string;
  description: string;
  planet: number[];
  people: number[];
  animal: number[];
};

interface Stats {
  analyzed: number;
  co2Saved: number;
  ecoChoices: number;
}

function App() {
  const [stats, setStats] = useState<Stats>({
    analyzed: 0,
    co2Saved: 0,
    ecoChoices: 0,
  });
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs[0]?.url;
    let brand = "unknown";
    console.log("Current tab URL:", url);

    if (url) {
      try {
        const hostname = new URL(url).hostname;
        console.log("Current URL:", url);
        console.log("Hostname:", hostname);
        const parts = hostname.split(".").filter(Boolean);
        brand = parts.length >= 2 ? parts[parts.length - 2] : hostname;
        //console.log("Detected brand:", brand);
        // concatenate the brand with https://
        brand = `https://${hostname}/`;
        console.log("Brand URL:", brand);
        window.localStorage['brand'] = brand; // Store the brand URL globally for use in other parts of the extension

      } catch (e) {
        console.error("Invalid URL format", e);
      }
    }

    const storeData = ratings[brand as keyof typeof ratings] as Rating | undefined;
    console.log("Store data:", storeData);
    // Then load local storage *after* resolving storeData
    chrome.storage.local.get(["enabled"], (result) => {
      setIsEnabled(result.enabled !== false);

      if (storeData) {
        setStats({
          analyzed: storeData.planet?.[0] ?? 0,
          co2Saved: storeData.people?.[0] ?? 0,
          ecoChoices: storeData.animal?.[0] ?? 0,
        });
      }
    });
  });
}, []);


  const handleToggle = () => {
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);
    chrome.storage.local.set({ enabled: newEnabled });
  };

  return (
    <>
      <div className="header">
        <div className="logo">🌱 EcoCart</div>
        <div className="tagline">Sustainable Shopping Assistant</div>
      </div>

      <div className="stats">
        <div className="stat-item">
          <span>Planet</span>
          <span id="analyzed-count">{stats.analyzed}/5</span>
        </div>
        <div className="stat-item">
          <span>People</span>
          <span id="co2-saved">{stats.co2Saved}/5</span>
        </div>
        <div className="stat-item">
          <span>Animals</span>
          <span id="eco-choices">{stats.ecoChoices}/5</span>
        </div>
      </div>

      <div className="toggle">
        <span>Enable EcoCart</span>
        <div
          className={`switch ${isEnabled ? "active" : ""}`}
          id="toggle-switch"
          onClick={handleToggle}
        ></div>
      </div>
    </>
  );
}

export default App;