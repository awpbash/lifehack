// src/pages/Alternatives.tsx
import React, { useEffect, useState } from "react";
import "./alternatives.css";

interface ProductResult {
  image: string;
  source: string;
  brand: string;
}

const Alternatives = () => {
  const [query, setQuery] = useState("eco friendly dress");
  const [results, setResults] = useState<ProductResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bingImageSearch = async (query: string, limit = 5) => {
      try {
        const encoded = encodeURIComponent("buy " + query);
        const res = await fetch(`https://www.bing.com/images/search?q=${encoded}&form=HDRSC2`, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
          }
        });

        const html = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const anchors = doc.querySelectorAll("a.iusc");

        const data: ProductResult[] = [];
        for (let a of anchors) {
          const mAttr = a.getAttribute("m");
          if (!mAttr) continue;
          try {
            const m = JSON.parse(mAttr);
            if (m.murl && m.purl) {
              const brand = new URL(m.purl).hostname.split(".").slice(-2, -1)[0];
              data.push({ image: m.murl, source: m.purl, brand });
              if (data.length >= limit) break;
            }
          } catch (e) {
            continue;
          }
        }
        setResults(data);
      } catch (e) {
        console.error("Failed to fetch images", e);
      } finally {
        setLoading(false);
      }
    };

    bingImageSearch(query);
  }, [query]);

  return (
    <div className="alt-container">
      <h2>🛍️ Sustainable Alternatives</h2>
      <input
        type="text"
        placeholder="Enter product name..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="alt-search"
      />
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="alt-results-scroll">
          {results.map((item, i) => (
            <a href={item.source} target="_blank" key={i} className="alt-item">
              <img src={item.image} alt="alternative" className="alt-img" />
              <div className="alt-brand">{item.brand}</div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default Alternatives;
