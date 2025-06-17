import React, { useEffect, useState } from "react";
import "./alternatives.css";

interface ProductResult {
  image: string;
  source: string;
  brand: string;
}

interface AlternativesProps {
  defaultQuery: string;
}

const Alternatives: React.FC<AlternativesProps> = ({ defaultQuery }) => {
  const [query, setQuery] = useState<string>(defaultQuery || "");
  const [results, setResults] = useState<ProductResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setQuery(defaultQuery);  // Update if defaultQuery changes
  }, [defaultQuery]);

  useEffect(() => {
    const bingImageSearch = async (q: string, limit = 5) => {
      if (!q || q.length < 3) return;
      setLoading(true);
      try {
        const encoded = encodeURIComponent("buy " + q);
        const res = await fetch(`https://www.bing.com/images/search?q=${encoded}&form=HDRSC2`);
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, "text/html");
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
          } catch {}
        }
        setResults(data);
      } catch (err) {
        console.error("❌ Bing fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    if (query) bingImageSearch(query);
  }, [query]);

  return (
    <div className="alt-container">
      <h2>🛍️ Sustainable Alternatives</h2>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="alt-search"
      />
      {loading ? <p>Loading...</p> : (
        <div className="alt-results-scroll">
          {results.map((item, i) => (
            <a href={item.source} target="_blank" key={i} className="alt-item">
              <img src={item.image} alt="alt" className="alt-img" />
              <div className="alt-brand">{item.brand}</div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default Alternatives;
