import React, { useEffect, useState } from "react";
import "./index.css";
import ratings from "../../ratings.json";
import Alternatives from "./Alternatives";
import StatBlock from './StatBlock'; 
import logo from '../icons/logo.png';
import background from '../icons/background.png';
import animalsLogo from '../icons/animals.png';
import peopleLogo from '../icons/people.png';
import planetLogo from '../icons/planet.png';

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

  const apiKey = import.meta.env.VITE_API_KEY;
  console.log(apiKey)

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
    <div className="wrapper">
      <div className="top-bg" style={{backgroundImage: `url(${background})`,}}>
        <div className="header-container">
          <div className="header">
              <div className="header-title">EcoCart</div> 
              <div className="tagline">Sustainable Shopping Assistant</div>
          </div>
        </div>
      

      <div className="content">
        <div className="card-container">
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
          <div className="flip-card">
            <div className="flip-card-inner">
              <div className="flip-card-front stats-card">
                <div className="statBlock-container">
                  <StatBlock icon={planetLogo} label="Planet" score={stats.analyzed} />
                  <StatBlock icon={peopleLogo} label="People" score={stats.co2Saved} />
                  <StatBlock icon={animalsLogo} label="Animals" score={stats.ecoChoices} />   
                </div>
              </div>
              <div className="flip-card-back stats-card">
                <div className="back-content">
                  <strong>Add other metrics here</strong>
                </div>
              </div>
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
      </div>
      </div>
    </div>
  );
}

export default App;