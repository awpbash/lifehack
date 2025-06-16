import React, { useEffect, useState } from 'react';
import './index.css';

function App() {
  const [stats, setStats] = useState({ carbon: 0, plastic: 0 });

  useEffect(() => {
    chrome.storage.local.get(['ecoStats'], (result) => {
      if (result.ecoStats) setStats(result.ecoStats);
    });
  }, []);

  return (
    <div className="app">
      <h1>🌿 EcoCart+</h1>
      <p>🌍 Carbon Saved: {stats.carbon.toFixed(2)} kg</p>
      <p>🧴 Plastic Avoided: {stats.plastic.toFixed(2)} kg</p>
    </div>
  );
}

export default App;