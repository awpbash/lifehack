let r=!0,c=null;chrome.storage.local.get(["enabled"],e=>{r=e.enabled!==!1,r&&f()});chrome.runtime.onMessage.addListener((e,t,s)=>{e.action==="toggle"&&(r=e.enabled,r?f():g())});function f(){g(),['[data-testid*="product"]',".product",".item",'[class*="product"]','[id*="product"]',"article",".card"].forEach(t=>{document.querySelectorAll(t).forEach(o=>{y(o)&&h(o)})})}function y(e){var i;const t=((i=e.textContent)==null?void 0:i.toLowerCase())||"",s=/\$\d+|\d+\.\d+|price/i.test(t),o=/buy|add to cart|product|item/i.test(t),a=e.querySelector("img");return(s||o)&&!!a&&t.length>10}function h(e){let t;e.addEventListener("mouseenter",s=>{t=setTimeout(()=>{w(s.target)},800)}),e.addEventListener("mouseleave",()=>{clearTimeout(t),d()})}function w(e){c&&d();const t=S(e),s=e.getBoundingClientRect();c=b(),document.body.appendChild(c);const o=c.getBoundingClientRect();let a=s.top+window.scrollY-o.height-10,i=s.left+window.scrollX+s.width/2-o.width/2;a<window.scrollY&&(a=s.bottom+window.scrollY+10),i<0&&(i=10),i+o.width>window.innerWidth&&(i=window.innerWidth-o.width-10),c.style.top=a+"px",c.style.left=i+"px",setTimeout(()=>{c==null||c.classList.add("eco-widget-visible")},10),x(t)}function S(e){var a,i;const t=e.querySelector('h1, h2, h3, h4, [class*="title"], [class*="name"]'),s=e.querySelector('[class*="price"], .price'),o=e.querySelector("img");return{name:t&&((a=t.textContent)==null?void 0:a.trim())||"Unknown Product",price:s&&((i=s.textContent)==null?void 0:i.trim())||"",image:o?o.src:"",url:window.location.href}}function b(e){const t=document.createElement("div");t.className="eco-sustainability-widget",t.innerHTML=`
    <div class="eco-widget-content">
      <div class="eco-header">
        <div class="eco-logo">🌱</div>
        <div class="eco-title">EcoCart</div>
        <div class="eco-loading">
          <div class="eco-spinner"></div>
        </div>
      </div>
      
      <div class="eco-compact-view">
        <div class="eco-score-circle">
          <div class="eco-score-value">--</div>
          <div class="eco-score-label">Eco Score</div>
        </div>
        <div class="eco-quick-info">
          <div class="eco-quick-item">
            <span class="eco-icon">🌍</span>
            <span class="eco-value">--</span>
          </div>
          <div class="eco-quick-item">
            <span class="eco-icon">💧</span>
            <span class="eco-value">--</span>
          </div>
        </div>
        <button class="eco-expand-btn">
          <span>More Details</span>
          <span class="eco-expand-icon">▼</span>
        </button>
      </div>
      
      <div class="eco-expanded-view">
        <div class="eco-metrics">
          <div class="eco-metric">
            <div class="eco-metric-header">
              <span class="eco-metric-icon">🌍</span>
              <span class="eco-metric-title">Carbon Footprint</span>
            </div>
            <div class="eco-metric-value">-- kg CO₂</div>
            <div class="eco-metric-bar">
              <div class="eco-metric-fill carbon"></div>
            </div>
          </div>
          
          <div class="eco-metric">
            <div class="eco-metric-header">
              <span class="eco-metric-icon">💧</span>
              <span class="eco-metric-title">Water Usage</span>
            </div>
            <div class="eco-metric-value">--</div>
            <div class="eco-metric-bar">
              <div class="eco-metric-fill water"></div>
            </div>
          </div>
          
          <div class="eco-metric">
            <div class="eco-metric-header">
              <span class="eco-metric-icon">♻️</span>
              <span class="eco-metric-title">Recyclable Content</span>
            </div>
            <div class="eco-metric-value">--%</div>
            <div class="eco-metric-bar">
              <div class="eco-metric-fill recyclable"></div>
            </div>
          </div>
        </div>
        
        <div class="eco-certifications">
          <div class="eco-cert-title">Certifications</div>
          <div class="eco-cert-list"></div>
        </div>
        
        <div class="eco-alternatives">
          <div class="eco-alt-title">🌿 Better Alternatives</div>
          <div class="eco-alt-list"></div>
        </div>
      </div>
    </div>
  `;const s=t.querySelector(".eco-expand-btn"),o=t.querySelector(".eco-expand-icon");return s.addEventListener("click",a=>{a.stopPropagation(),t.classList.contains("eco-expanded")?(t.classList.remove("eco-expanded"),o.textContent="▼",s.querySelector("span").textContent="More Details"):(t.classList.add("eco-expanded"),o.textContent="▲",s.querySelector("span").textContent="Less Details")}),t.addEventListener("mouseenter",()=>{clearTimeout(t.hideTimeout)}),t.addEventListener("mouseleave",()=>{t.hideTimeout=setTimeout(()=>{d()},300)}),t}function x(e){chrome.runtime.sendMessage({action:"getSustainabilityData",productInfo:e},t=>{t&&c&&C(t)})}function C(e){if(!c)return;const t=c.querySelector(".eco-loading");t&&(t.style.display="none");const s=c.querySelector(".eco-score-value"),o=c.querySelector(".eco-score-circle");s&&(s.textContent=e.sustainabilityScore.toString()),o&&(e.sustainabilityScore>=80?o.classList.add("eco-score-excellent"):e.sustainabilityScore>=60?o.classList.add("eco-score-good"):o.classList.add("eco-score-poor"));const a=c.querySelectorAll(".eco-quick-item .eco-value");a[0]&&(a[0].textContent=e.carbonFootprint+" kg"),a[1]&&(a[1].textContent=e.waterUsage);const i=c.querySelectorAll(".eco-metric");if(i[0]){const n=i[0].querySelector(".eco-metric-value"),l=i[0].querySelector(".eco-metric-fill");if(n&&(n.textContent=e.carbonFootprint+" kg CO₂"),l){const u=Math.max(0,100-e.carbonFootprint/20*100);l.style.width=u+"%"}}if(i[1]){const n=i[1].querySelector(".eco-metric-value"),l=i[1].querySelector(".eco-metric-fill");if(n&&(n.textContent=e.waterUsage),l){const u=e.waterUsage==="Low"?80:e.waterUsage==="Medium"?50:20;l.style.width=u+"%"}}if(i[2]){const n=i[2].querySelector(".eco-metric-value"),l=i[2].querySelector(".eco-metric-fill");n&&(n.textContent=e.recyclableContent+"%"),l&&(l.style.width=e.recyclableContent+"%")}const v=c.querySelector(".eco-cert-list");v&&(e.certifications.length>0?v.innerHTML=e.certifications.map(n=>`<span class="eco-cert-badge">${n}</span>`).join(""):v.innerHTML='<span class="eco-no-certs">No certifications found</span>');const p=c.querySelector(".eco-alt-list"),m=c.querySelector(".eco-alternatives");p&&m&&(e.alternatives.length>0?p.innerHTML=e.alternatives.map(n=>`
        <div class="eco-alternative">
          <div class="eco-alt-header">
            <span class="eco-alt-name">${n.name}</span>
            <span class="eco-alt-score">${n.score}/100</span>
          </div>
          <div class="eco-alt-details">
            <span class="eco-alt-brand">${n.brand}</span>
            <span class="eco-alt-price">${n.price}</span>
          </div>
          <div class="eco-alt-savings">${n.savings}</div>
        </div>
      `).join(""):m.style.display="none"),q()}function q(){chrome.storage.local.get(["stats"],e=>{const t=e.stats||{analyzed:0,co2Saved:0,ecoChoices:0};t.analyzed+=1,t.co2Saved+=Math.random()*2,chrome.storage.local.set({stats:t})})}function d(){c&&(c.classList.remove("eco-widget-visible"),setTimeout(()=>{c&&c.parentNode&&c.parentNode.removeChild(c),c=null},300))}function g(){d()}
