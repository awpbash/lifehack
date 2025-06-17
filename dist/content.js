async function w(o){try{console.log("Starting carbon footprint calculation for:",o);try{const[n,e,c]=await Promise.all([fetch(chrome.runtime.getURL("weights.json")).then(async t=>{if(!t.ok)throw new Error(`Failed to fetch weights.json: ${t.status} ${t.statusText}`);return t.json()}),fetch(chrome.runtime.getURL("locations.json")).then(async t=>{if(!t.ok)throw new Error(`Failed to fetch locations.json: ${t.status} ${t.statusText}`);return t.json()}),fetch(chrome.runtime.getURL("carbonIntensity.json")).then(async t=>{if(!t.ok)throw new Error(`Failed to fetch carbonIntensity.json: ${t.status} ${t.statusText}`);return t.json()})]);console.log("Loaded data:",{weights:n,locations:e,carbonIntensity:c});const s=n[o.name]||.5;if(console.log("Using weight:",s),!s)throw new Error(`No weight data found for product: ${o.name}`);const r=e[o.brand];if(console.log("Found location for brand:",r),!r)throw new Error(`No location data found for brand: ${o.brand}`);const a=c[r];if(console.log("Found carbon intensity:",a),!a)throw new Error(`No carbon intensity data found for location: ${r}`);const i=s*.5*(a/1e3);return console.log("Calculated carbon footprint:",i),Number(i.toFixed(2))}catch(n){throw console.error("Error loading JSON data:",n),n}}catch(n){throw console.error("Error calculating carbon footprint:",n),n}}let u=!0,l=null;chrome.storage.local.get(["enabled"],o=>{u=o.enabled!==!1,u&&b()});chrome.runtime.onMessage.addListener((o,n,e)=>{o.action==="toggle"&&(u=o.enabled,u?b():f())});function b(){f(),l=m(),document.body.appendChild(l);const o=document.createElement("style");o.textContent=`
    .eco-sustainability-widget {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 9999;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 10px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: Arial, sans-serif;
    }
    .eco-widget-content {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .eco-header {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .eco-logo {
      font-size: 24px;
    }
    .eco-title {
      font-weight: bold;
      font-size: 16px;
    }
    .eco-score {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    .eco-score-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .eco-score-value {
      font-weight: bold;
    }
    .eco-close-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 20px;
      padding: 5px;
    }
  `,document.head.appendChild(o),document.body.style.paddingTop="60px",y()}function m(){const o=document.createElement("div");return o.className="eco-sustainability-widget",o.innerHTML=`
    <div class="eco-widget-content">
      <div class="eco-header">
        <div class="eco-logo">🌱</div>
        <div class="eco-title">Carbon Footprint Tracker</div>
      </div>
      
      <div class="eco-score">
        <div class="eco-score-item">
          <span class="eco-icon">🌍</span>
          <span class="eco-score-value">--</span>
          <span class="eco-score-label">kg CO₂</span>
        </div>
        <div class="eco-score-item">
          <span class="eco-icon">💧</span>
          <span class="eco-score-value">--</span>
          <span class="eco-score-label">L water</span>
        </div>
      </div>

      <button class="eco-close-btn">×</button>
    </div>
  `,o.querySelector(".eco-close-btn").addEventListener("click",()=>{f()}),o}async function y(){try{const o=x();if(console.log("Extracted product info:",o),!o){console.error("Could not extract product information");return}const n=o.brand;console.log("Using brand from product info:",n);try{const e=chrome.runtime.getURL("weights.json");console.log("Fetching weights from:",e);const c=await fetch(e);if(!c.ok)throw new Error(`Failed to fetch weights.json: ${c.status} ${c.statusText}`);const s=await c.json();console.log("Successfully loaded weights data:",s);const r=s[o.name]||.5;console.log("Looked up weight:",r);const a={name:o.name,weight:r,brand:n};console.log("Constructed ProductData:",a);const i=await w(a);if(console.log("Calculated carbon footprint:",i),l){const t=l.querySelector(".eco-score-item:first-child .eco-score-value");console.log("Carbon value element found:",t),t?(t.textContent=i.toFixed(2),console.log("Updated carbon value element with:",i.toFixed(2))):console.error("Carbon value element not found");const d=l.querySelector(".eco-score-item:last-child .eco-score-value");d&&(d.textContent="--")}}catch(e){throw console.error("Error fetching weights.json:",e),e}}catch(o){console.error("Error loading sustainability data:",o)}}function x(){var o,n;try{const e=document.querySelector('article, .card, [class*="product"], [id*="product"]');if(console.log("Found product container:",e),!e)return console.error("Could not find product container"),null;const c=e.querySelector('h1, h2, h3, h4, [class*="title"], [class*="name"]'),s=e.querySelector('[class*="price"], .price'),r=e.querySelector("img");console.log("Found elements:",{title:c==null?void 0:c.textContent,price:s==null?void 0:s.textContent,image:r==null?void 0:r.src});const a=((o=c==null?void 0:c.textContent)==null?void 0:o.trim())||"Unknown Product",i=((n=s==null?void 0:s.textContent)==null?void 0:n.trim())||"",t=(r==null?void 0:r.src)||"",d=window.location.href,p=new URL(d).hostname,g=p.split(".").filter(Boolean),h=g.length>=2?g[g.length-2]:p;return console.log("Extracted brand from URL:",h),{name:a,price:i,image:t,url:d,brand:h}}catch(e){return console.error("Error extracting product info:",e),null}}function f(){l&&(l.remove(),l=null,document.body.style.paddingTop="")}
