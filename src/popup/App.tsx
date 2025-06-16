import React, { useEffect, useState } from "react";
import "./index.css";
import ratings from "../../ratings.json";
import Alternatives from "./Alternatives";

type Rating = {
  overall: number;
  link: string;
  description: string;
  planet: number[];
  people: number[];
  animal: number[];
};

interface Stats {
  overall: number;
  analyzed: number;
  co2Saved: number;
  ecoChoices: number;
}

function App() {
  const [stats, setStats] = useState<Stats>({
    overall: 0,
    analyzed: 0,
    co2Saved: 0,
    ecoChoices: 0,
  });
  const [isEnabled, setIsEnabled] = useState(true);
  const [brandUrl, setBrandUrl] = useState<string>("unknown");
  const [showAlternatives, setShowAlternatives] = useState(false);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0]?.url;
      if (!url) return;

      try {
        const hostname = new URL(url).hostname;
        const parts = hostname.split(".").filter(Boolean);
        const brand = parts.length >= 2 ? parts[parts.length - 2] : hostname;
        const brandFormatted = `https://${hostname}/`;
        window.localStorage["brand"] = brandFormatted;
        const brandlink = ratings[brandFormatted as keyof typeof ratings]?.brand || "";
        setBrandUrl(brandlink);
        const storeData = ratings[brandFormatted as keyof typeof ratings] as Rating | undefined;

        chrome.storage.local.get(["enabled"], (result) => {
          setIsEnabled(result.enabled !== false);

          if (storeData) {
            setStats({
              overall: storeData.overall ?? 0,
              analyzed: storeData.planet?.[0] ?? 0,
              co2Saved: storeData.people?.[0] ?? 0,
              ecoChoices: storeData.animal?.[0] ?? 0,
            });
          }
        });
      } catch (e) {
        console.error("Error parsing URL:", e);
      }
    });
  }, []);

  const handleToggle = () => {
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);
    chrome.storage.local.set({ enabled: newEnabled });
  };

  const getRatingColor = (rating: number): string => {
    switch (rating) {
      case 5: return "#2e7d32";
      case 4: return "#66bb6a";
      case 3: return "#fdd835";
      case 2: return "#ef5350";
      case 1: return "#c62828";
      default: return "#bdbdbd";
    }
  };

  return (
    <div className="container">
      <div className="header">
        <div className="logo">🌱 EcoCart</div>
        <div className="tagline">Sustainable Shopping Assistant</div>
      </div>

      <div className="overall-score">
        <div className="stars-container">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className={`star ${i < stats.overall ? "filled" : ""}`}
              style={{ color: i < stats.overall ? getRatingColor(stats.overall) : "#ccc" }}
            >
              ★
            </span>
          ))}
        </div>
        <div className="score-label">Overall Score: {stats.overall}/5</div>
      </div>

      <div className="stats-card">
        <div className="stat">
          <label>🌍 Planet</label>
          <span>{stats.analyzed}/5</span>
        </div>
        <div className="stat">
          <label>👥 People</label>
          <span>{stats.co2Saved}/5</span>
        </div>
        <div className="stat">
          <label>🦊 Animals</label>
          <span>{stats.ecoChoices}/5</span>
        </div>
      </div>

      <div className="toggle-row">
        <span className="toggle-label">Enable EcoCart</span>
        <div
          className={`toggle-switch ${isEnabled ? "enabled" : ""}`}
          onClick={handleToggle}
        >
          <div className="toggle-knob" />
        </div>
      </div>

      <div className="links-row">
        <a
          href={`https://directory.goodonyou.eco/brand/${brandUrl}`}
          target="_blank"
          className="action-button"
        >
          🌐 Brand Info
        </a>
        <button
          className="action-button"
          onClick={() => setShowAlternatives(!showAlternatives)}
        >
          🛍️ Sustainable Alternatives
        </button>
      </div>

      {showAlternatives && <Alternatives />}

      <footer>
        <a
          href="https://ecocart.io"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn more about EcoCart →
        </a>
      </footer>
    </div>
  );
}

export default App;
