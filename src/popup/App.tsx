import React, { useEffect, useState } from "react";
import "./index.css";

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
    // Load saved stats and enabled state
    chrome.storage.local.get(["stats", "enabled"], (result) => {
      if (result.stats) {
        setStats(result.stats);
      }
      setIsEnabled(result.enabled !== false);
    });
  }, []);

  const handleToggle = () => {
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);

    // Save to storage
    chrome.storage.local.set({ enabled: newEnabled });

    // Send message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "toggle",
          enabled: newEnabled,
        });
      }
    });
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
          <span id="analyzed-count">0/5</span>
        </div>
        <div className="stat-item">
          <span>People</span>
          <span id="co2-saved">0/5</span>
        </div>
        <div className="stat-item">
          <span>Animals</span>
          <span id="eco-choices">0/5</span>
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
