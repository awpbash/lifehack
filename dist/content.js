async function C(t){try{console.log("Starting carbon footprint calculation for:",t);try{const[n,e,c]=await Promise.all([fetch(chrome.runtime.getURL("weights.json")).then(async o=>{if(!o.ok)throw new Error(`Failed to fetch weights.json: ${o.status} ${o.statusText}`);return o.json()}),fetch(chrome.runtime.getURL("carbonIntensity.json")).then(async o=>{if(!o.ok)throw new Error(`Failed to fetch carbonIntensity.json: ${o.status} ${o.statusText}`);return o.json()}),fetch(chrome.runtime.getURL("ratings.json")).then(async o=>{if(!o.ok)throw new Error(`Failed to fetch locations.json: ${o.status} ${o.statusText}`);return o.json()})]),r={};Object.keys(c).forEach(o=>{const i=c[o];i&&i.location&&i.brand&&(r[i.brand]=i.location)}),console.log("Loaded data:",{weights:n,locations:r,carbonIntensity:e});const s=t.weight;if(console.log("Using weight:",s),!s)throw new Error(`No weight data found for product: ${t.name}`);const d=r[t.brand];console.log("WOWOWOOW",t),console.log("Found location for brand:",d);const g=Object.keys(e).find(o=>o.toLowerCase()===d.toLowerCase());if(!g)throw new Error(`No carbon intensity data found for location: ${d}`);const u=e[g];console.log("Found carbon intensity:",u);const h=s*30*(u/1e3)+20;return console.log("Calculated carbon footprint:",h),Number(h.toFixed(2))}catch(n){throw console.error("Error loading JSON data:",n),n}}catch(n){throw console.error("Error calculating carbon footprint:",n),n}}let w=!0,l=null;chrome.storage.local.get(["enabled"],t=>{w=t.enabled!==!1,w&&y()});chrome.runtime.onMessage.addListener((t,n,e)=>{t.action==="toggle"&&(w=t.enabled,w?y():b())});function y(){b(),l=j(),document.body.appendChild(l);const t=document.createElement("style");t.textContent=`
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
  `,document.head.appendChild(t);const n=chrome.runtime.getURL("happy_earth.png"),e=l.querySelector(".eco-earth-img");e&&(e.src=n,e.alt="Happy Earth"),R()}function j(){const t=document.createElement("div");return t.className="eco-sustainability-widget",t.innerHTML=`
    <div class="eco-widget">
      <div class="eco-earth-text">Click to learn more</div>
      <img class="eco-earth-img" src="" alt="Happy Earth" />
      <div class="eco-score-item">
        <span class="eco-icon">🌍</span>
        <span class="eco-score-value eco-carbon-value">--</span>
        <span class="eco-score-label">kg CO₂</span>
      </div>
    </div>
    `,t}async function R(){try{const t=k();if(!t)return;const n=t.brand;try{const e=chrome.runtime.getURL("weights.json"),c=await fetch(e);if(!c.ok)throw new Error(`Failed to fetch weights.json: ${c.status} ${c.statusText}`);const r=await c.json(),s=await fetch(chrome.runtime.getURL("ratings.json")).then(a=>a.json()),d=t.name.toLowerCase(),u=Object.keys(r).map(a=>a.toLowerCase()).find(a=>d.includes(a)),h=u?Object.keys(r).find(a=>a.toLowerCase()===u):null,o=r[h||""]||.5,i={name:t.name,weight:o,brand:n},p=await C(i),x=`https://${n}/`,f=s[x];if(console.log("Brand stats:",f),l){const a=l.querySelector(".eco-earth-img"),m=l.querySelector(".eco-carbon-value");if(m&&(m.textContent=p.toFixed(2)),a){const E=chrome.runtime.getURL("happy_earth.png"),L=chrome.runtime.getURL("sad_earth.png");(f==null?void 0:f.overall)>=4?(a.src=E,a.alt="Happy Earth"):(a.src=L,a.alt="Sad Earth")}}}catch(e){throw console.error("Error fetching weights.json:",e),e}}catch(t){console.error("Error loading sustainability data:",t)}}function k(){var t,n;try{const e=document.querySelector('article, .card, [class*="product"], [id*="product"]');if(console.log("Found product container:",e),!e)return console.error("Could not find product container"),null;const c=e.querySelector("[class*=product][class*=name], [class*=product][class*=title], [id*=product][id*=name], [id*=product][id*=title], [data-auto-id*=product][data-auto-id*=title], [data-auto-id*=product][data-auto-id*=name]"),r=e.querySelector('[class*="price"], .price'),s=e.querySelector("img");console.log("Found elements:",{title:c,price:r==null?void 0:r.textContent,image:s==null?void 0:s.src});const d=((t=c==null?void 0:c.textContent)==null?void 0:t.trim().toLowerCase())||"Unknown Product",g=((n=r==null?void 0:r.textContent)==null?void 0:n.trim())||"",u=(s==null?void 0:s.src)||"",h=window.location.href,o=new URL(h).hostname,i=o.split(".").filter(Boolean),p=i.length>=2?i[i.length-2]:o;return console.log("Extracted brand from URL:",p),{name:d,price:g,image:u,url:h,brand:p}}catch(e){return console.error("Error extracting product info:",e),null}}function b(){l&&(l.remove(),l=null)}
