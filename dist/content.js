async function w(t){try{console.log("Starting carbon footprint calculation for:",t);try{const[e,o,r]=await Promise.all([fetch(chrome.runtime.getURL("weights.json")).then(async n=>{if(!n.ok)throw new Error(`Failed to fetch weights.json: ${n.status} ${n.statusText}`);return n.json()}),fetch(chrome.runtime.getURL("locations.json")).then(async n=>{if(!n.ok)throw new Error(`Failed to fetch locations.json: ${n.status} ${n.statusText}`);return n.json()}),fetch(chrome.runtime.getURL("carbonIntensity.json")).then(async n=>{if(!n.ok)throw new Error(`Failed to fetch carbonIntensity.json: ${n.status} ${n.statusText}`);return n.json()})]);console.log("Loaded data:",{weights:e,locations:o,carbonIntensity:r});const a=e[t.name]||.5;if(console.log("Using weight:",a),!a)throw new Error(`No weight data found for product: ${t.name}`);const c=o[t.brand];console.log("WOWOWOOW",t),console.log("Found location for brand:",c);const l=r[c];console.log("Found carbon intensity:",l);const i=a*30*(l/1e3);return console.log("Calculated carbon footprint:",i),Number(i.toFixed(2))}catch(e){throw console.error("Error loading JSON data:",e),e}}catch(e){throw console.error("Error calculating carbon footprint:",e),e}}let g=!0,s=null;chrome.storage.local.get(["enabled"],t=>{g=t.enabled!==!1,g&&f()});chrome.runtime.onMessage.addListener((t,e,o)=>{t.action==="toggle"&&(g=t.enabled,g?f():m())});function f(){m(),s=b(),document.body.appendChild(s);const t=document.createElement("style");t.textContent=`
    .eco-sustainability-widget {
      position: fixed;
      bottom: 32px;
      right: 32px;
      z-index: 9999;
      background: none;
    }
    .eco-widget {

    }

    .eco-earth-img {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .eco-earth-img:hover {
      transform: scale(1.1);
    }
  `,document.head.appendChild(t);const e=chrome.runtime.getURL("happy earth.png"),o=s.querySelector(".eco-earth-img");o&&(o.src=e,o.alt="Happy Earth"),y()}function b(){const t=document.createElement("div");return t.className="eco-sustainability-widget",t.innerHTML=`
    <div class="eco-widget">
      <img class="eco-earth-img" src="" alt="Happy Earth" />
      <div class="eco-score-item">
        <span class="eco-icon">🌍</span>
        <span class="eco-score-value eco-carbon-value">--</span>
        <span class="eco-score-label">kg CO₂</span>
      </div>
    </div>
    `,t}async function y(){try{const t=x();if(!t)return;const e=t.brand;try{const o=chrome.runtime.getURL("weights.json"),r=await fetch(o);if(!r.ok)throw new Error(`Failed to fetch weights.json: ${r.status} ${r.statusText}`);const c=(await r.json())[t.name]||.5,l={name:t.name,weight:c,brand:e},i=await w(l);if(s){const n=s.querySelector(".eco-earth-img"),h=s.querySelector(".eco-carbon-value");if(h&&(h.textContent=i.toFixed(2)),n){const u=chrome.runtime.getURL("happy_earth.png"),d=chrome.runtime.getURL("sad_earth.png");n.src=i<=.1?u:d,n.alt=i<=2?"Happy Earth":"Sad Earth"}}}catch(o){throw console.error("Error fetching weights.json:",o),o}}catch(t){console.error("Error loading sustainability data:",t)}}function x(){var t,e;try{const o=document.querySelector('article, .card, [class*="product"], [id*="product"]');if(console.log("Found product container:",o),!o)return console.error("Could not find product container"),null;const r=o.querySelector('h1, h2, h3, h4, [class*="title"], [class*="name"]'),a=o.querySelector('[class*="price"], .price'),c=o.querySelector("img");console.log("Found elements:",{title:r==null?void 0:r.textContent,price:a==null?void 0:a.textContent,image:c==null?void 0:c.src});const l=((t=r==null?void 0:r.textContent)==null?void 0:t.trim())||"Unknown Product",i=((e=a==null?void 0:a.textContent)==null?void 0:e.trim())||"",n=(c==null?void 0:c.src)||"",h=window.location.href,u=new URL(h).hostname,d=u.split(".").filter(Boolean),p=d.length>=2?d[d.length-2]:u;return console.log("Extracted brand from URL:",p),{name:l,price:i,image:n,url:h,brand:p}}catch(o){return console.error("Error extracting product info:",o),null}}function m(){s&&(s.remove(),s=null)}
