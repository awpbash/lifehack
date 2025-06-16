/// <reference types="chrome"/>

interface ProductInfo {
  name: string;
  price: string;
  image: string;
  url: string;
}

interface SustainabilityData {
  sustainabilityScore: number;
  carbonFootprint: number;
  waterUsage: string;
  recyclableContent: number;
  certifications: string[];
  alternatives: Alternative[];
}

interface Alternative {
  name: string;
  brand: string;
  score: number;
  price: string;
  savings: string;
}

let isEnabled = true;
let sustainabilityWidget: HTMLElement | null = null;

// Initialize
chrome.storage.local.get(["enabled"], (result) => {
  isEnabled = result.enabled !== false;
  if (isEnabled) {
    initializeSustainabilityTracker();
  }
});

// Listen for toggle messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggle") {
    isEnabled = request.enabled;
    if (isEnabled) {
      initializeSustainabilityTracker();
    } else {
      removeSustainabilityTracker();
    }
  }
});

function initializeSustainabilityTracker(): void {
  // Remove existing tracker
  removeSustainabilityTracker();

  // Add hover listeners to product elements
  const productSelectors = [
    '[data-testid*="product"]',
    ".product",
    ".item",
    '[class*="product"]',
    '[id*="product"]',
    "article",
    ".card",
  ];

  productSelectors.forEach((selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      if (isProductElement(element as HTMLElement)) {
        addProductHoverListener(element as HTMLElement);
      }
    });
  });
}

function isProductElement(element: HTMLElement): boolean {
  const text = element.textContent?.toLowerCase() || "";
  const hasPrice = /\$\d+|\d+\.\d+|price/i.test(text);
  const hasProductKeywords = /buy|add to cart|product|item/i.test(text);
  const hasImages = element.querySelector("img");

  return (hasPrice || hasProductKeywords) && !!hasImages && text.length > 10;
}

function addProductHoverListener(element: HTMLElement): void {
  let hoverTimeout: number;

  element.addEventListener("mouseenter", (e) => {
    hoverTimeout = setTimeout(() => {
      showSustainabilityWidget(e.target as HTMLElement);
    }, 800);
  });

  element.addEventListener("mouseleave", () => {
    clearTimeout(hoverTimeout);
    hideSustainabilityWidget();
  });
}

function showSustainabilityWidget(productElement: HTMLElement): void {
  if (sustainabilityWidget) {
    hideSustainabilityWidget();
  }

  const productInfo = extractProductInfo(productElement);
  const rect = productElement.getBoundingClientRect();

  sustainabilityWidget = createSustainabilityWidget(productInfo);
  document.body.appendChild(sustainabilityWidget);

  // Position widget
  const widgetRect = sustainabilityWidget.getBoundingClientRect();
  let top = rect.top + window.scrollY - widgetRect.height - 10;
  let left = rect.left + window.scrollX + rect.width / 2 - widgetRect.width / 2;

  // Adjust if widget goes off screen
  if (top < window.scrollY) {
    top = rect.bottom + window.scrollY + 10;
  }
  if (left < 0) {
    left = 10;
  }
  if (left + widgetRect.width > window.innerWidth) {
    left = window.innerWidth - widgetRect.width - 10;
  }

  sustainabilityWidget.style.top = top + "px";
  sustainabilityWidget.style.left = left + "px";

  // Animate in
  setTimeout(() => {
    sustainabilityWidget?.classList.add("eco-widget-visible");
  }, 10);

  // Load sustainability data
  loadSustainabilityData(productInfo);
}

function extractProductInfo(element: HTMLElement): ProductInfo {
  const titleElement = element.querySelector('h1, h2, h3, h4, [class*="title"], [class*="name"]') as HTMLElement;
  const priceElement = element.querySelector('[class*="price"], .price') as HTMLElement;
  const imageElement = element.querySelector("img") as HTMLImageElement;

  return {
    name: titleElement ? titleElement.textContent?.trim() || "Unknown Product" : "Unknown Product",
    price: priceElement ? priceElement.textContent?.trim() || "" : "",
    image: imageElement ? imageElement.src : "",
    url: window.location.href,
  };
}

function createSustainabilityWidget(productInfo: ProductInfo): HTMLElement {
  const widget = document.createElement("div");
  widget.className = "eco-sustainability-widget";
  widget.innerHTML = `
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
  `;

  // Add expand/collapse functionality
  const expandBtn = widget.querySelector(".eco-expand-btn") as HTMLButtonElement;
  const expandIcon = widget.querySelector(".eco-expand-icon") as HTMLElement;

  expandBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isExpanded = widget.classList.contains("eco-expanded");

    if (isExpanded) {
      widget.classList.remove("eco-expanded");
      expandIcon.textContent = "▼";
      (expandBtn.querySelector("span") as HTMLElement).textContent = "More Details";
    } else {
      widget.classList.add("eco-expanded");
      expandIcon.textContent = "▲";
      (expandBtn.querySelector("span") as HTMLElement).textContent = "Less Details";
    }
  });

  // Prevent widget from closing when clicking inside
  widget.addEventListener("mouseenter", () => {
    clearTimeout((widget as any).hideTimeout);
  });

  widget.addEventListener("mouseleave", () => {
    (widget as any).hideTimeout = setTimeout(() => {
      hideSustainabilityWidget();
    }, 300);
  });

  return widget;
}

function loadSustainabilityData(productInfo: ProductInfo): void {
  chrome.runtime.sendMessage(
    {
      action: "getSustainabilityData",
      productInfo: productInfo,
    },
    (response: SustainabilityData) => {
      if (response && sustainabilityWidget) {
        updateWidgetWithData(response);
      }
    },
  );
}

function updateWidgetWithData(data: SustainabilityData): void {
  if (!sustainabilityWidget) return;

  // Hide loading
  const loadingElement = sustainabilityWidget.querySelector(".eco-loading") as HTMLElement;
  if (loadingElement) {
    loadingElement.style.display = "none";
  }

  // Update score
  const scoreValue = sustainabilityWidget.querySelector(".eco-score-value") as HTMLElement;
  const scoreCircle = sustainabilityWidget.querySelector(".eco-score-circle") as HTMLElement;
  if (scoreValue) {
    scoreValue.textContent = data.sustainabilityScore.toString();
  }

  // Color code the score
  if (scoreCircle) {
    if (data.sustainabilityScore >= 80) {
      scoreCircle.classList.add("eco-score-excellent");
    } else if (data.sustainabilityScore >= 60) {
      scoreCircle.classList.add("eco-score-good");
    } else {
      scoreCircle.classList.add("eco-score-poor");
    }
  }

  // Update quick info
  const quickItems = sustainabilityWidget.querySelectorAll(".eco-quick-item .eco-value");
  if (quickItems[0]) (quickItems[0] as HTMLElement).textContent = data.carbonFootprint + " kg";
  if (quickItems[1]) (quickItems[1] as HTMLElement).textContent = data.waterUsage;

  // Update detailed metrics
  const metrics = sustainabilityWidget.querySelectorAll(".eco-metric");

  // Carbon footprint
  if (metrics[0]) {
    const valueEl = metrics[0].querySelector(".eco-metric-value") as HTMLElement;
    const fillEl = metrics[0].querySelector(".eco-metric-fill") as HTMLElement;
    if (valueEl) valueEl.textContent = data.carbonFootprint + " kg CO₂";
    if (fillEl) {
      const carbonPercent = Math.max(0, 100 - (data.carbonFootprint / 20) * 100);
      fillEl.style.width = carbonPercent + "%";
    }
  }

  // Water usage
  if (metrics[1]) {
    const valueEl = metrics[1].querySelector(".eco-metric-value") as HTMLElement;
    const fillEl = metrics[1].querySelector(".eco-metric-fill") as HTMLElement;
    if (valueEl) valueEl.textContent = data.waterUsage;
    if (fillEl) {
      const waterPercent = data.waterUsage === "Low" ? 80 : data.waterUsage === "Medium" ? 50 : 20;
      fillEl.style.width = waterPercent + "%";
    }
  }

  // Recyclable content
  if (metrics[2]) {
    const valueEl = metrics[2].querySelector(".eco-metric-value") as HTMLElement;
    const fillEl = metrics[2].querySelector(".eco-metric-fill") as HTMLElement;
    if (valueEl) valueEl.textContent = data.recyclableContent + "%";
    if (fillEl) fillEl.style.width = data.recyclableContent + "%";
  }

  // Update certifications
  const certList = sustainabilityWidget.querySelector(".eco-cert-list") as HTMLElement;
  if (certList) {
    if (data.certifications.length > 0) {
      certList.innerHTML = data.certifications.map((cert) => `<span class="eco-cert-badge">${cert}</span>`).join("");
    } else {
      certList.innerHTML = '<span class="eco-no-certs">No certifications found</span>';
    }
  }

  // Update alternatives
  const altList = sustainabilityWidget.querySelector(".eco-alt-list") as HTMLElement;
  const altSection = sustainabilityWidget.querySelector(".eco-alternatives") as HTMLElement;
  if (altList && altSection) {
    if (data.alternatives.length > 0) {
      altList.innerHTML = data.alternatives
        .map(
          (alt) => `
        <div class="eco-alternative">
          <div class="eco-alt-header">
            <span class="eco-alt-name">${alt.name}</span>
            <span class="eco-alt-score">${alt.score}/100</span>
          </div>
          <div class="eco-alt-details">
            <span class="eco-alt-brand">${alt.brand}</span>
            <span class="eco-alt-price">${alt.price}</span>
          </div>
          <div class="eco-alt-savings">${alt.savings}</div>
        </div>
      `,
        )
        .join("");
    } else {
      altSection.style.display = "none";
    }
  }

  // Update stats
  updateStats();
}

function updateStats(): void {
  chrome.storage.local.get(["stats"], (result) => {
    const stats = result.stats || { analyzed: 0, co2Saved: 0, ecoChoices: 0 };
    stats.analyzed += 1;
    stats.co2Saved += Math.random() * 2; // Mock CO2 savings
    chrome.storage.local.set({ stats });
  });
}

function hideSustainabilityWidget(): void {
  if (sustainabilityWidget) {
    sustainabilityWidget.classList.remove("eco-widget-visible");
    setTimeout(() => {
      if (sustainabilityWidget && sustainabilityWidget.parentNode) {
        sustainabilityWidget.parentNode.removeChild(sustainabilityWidget);
      }
      sustainabilityWidget = null;
    }, 300);
  }
}

function removeSustainabilityTracker(): void {
  hideSustainabilityWidget();
}

