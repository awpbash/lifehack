/// <reference types="chrome"/>
import './content.css';
import { calculateCarbonFootprint } from '../utils/carbonCalculator';

interface ProductInfo {
  name: string;
  price: string;
  image: string;
  url: string;
  brand: string;
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

  // Create and add the fixed header widget
  sustainabilityWidget = createSustainabilityWidget();
  document.body.appendChild(sustainabilityWidget);

  // Add styles to ensure the widget stays at the top
  const style = document.createElement('style');
  style.textContent = `
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
  `;
  document.head.appendChild(style);

  // Add padding to body to prevent content from being hidden under the widget
  document.body.style.paddingTop = '60px';

  // Load initial sustainability data
  loadSustainabilityData();
}

function createSustainabilityWidget(): HTMLElement {
  const widget = document.createElement("div");
  widget.className = "eco-sustainability-widget";
  widget.innerHTML = `
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
  `;

  // Add close button functionality
  const closeBtn = widget.querySelector(".eco-close-btn") as HTMLButtonElement;
  closeBtn.addEventListener("click", () => {
    removeSustainabilityTracker();
  });

  return widget;
}

async function loadSustainabilityData(): Promise<void> {
  try {
    const productInfo = extractProductInfo();
    console.log('Extracted product info:', productInfo);

    if (!productInfo) {
      console.error('Could not extract product information');
      return;
    }

    // Use the brand that was already extracted in extractProductInfo
    const brand = productInfo.brand;
    console.log('Using brand from product info:', brand);

    // Load weights.json to look up the weight for the product
    try {
      const weightsUrl = chrome.runtime.getURL('weights.json');
      console.log('Fetching weights from:', weightsUrl);
      const weightsResponse = await fetch(weightsUrl);
      if (!weightsResponse.ok) {
        throw new Error(`Failed to fetch weights.json: ${weightsResponse.status} ${weightsResponse.statusText}`);
      }
      const weightsData = await weightsResponse.json();
      console.log('Successfully loaded weights data:', weightsData);

      const weight = weightsData[productInfo.name] || 0.5; // Fallback to 0.5 if not found
      console.log('Looked up weight:', weight);

      const productData = {
        name: productInfo.name,
        weight: weight,
        brand: brand
      };
      console.log('Constructed ProductData:', productData);

      const carbonFootprint = await calculateCarbonFootprint(productData);
      console.log('Calculated carbon footprint:', carbonFootprint);

      // Update the widget values
      if (sustainabilityWidget) {
        const carbonValueElement = sustainabilityWidget.querySelector('.eco-score-item:first-child .eco-score-value');
        console.log('Carbon value element found:', carbonValueElement);
        if (carbonValueElement) {
          carbonValueElement.textContent = carbonFootprint.toFixed(2);
          console.log('Updated carbon value element with:', carbonFootprint.toFixed(2));
        } else {
          console.error('Carbon value element not found');
        }

        // TODO: Implement water usage calculation
        const waterValueElement = sustainabilityWidget.querySelector('.eco-score-item:last-child .eco-score-value');
        if (waterValueElement) {
          waterValueElement.textContent = '--'; // Placeholder until water calculation is implemented
        }
      }
    } catch (error) {
      console.error('Error fetching weights.json:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error loading sustainability data:', error);
  }
}

function extractProductInfo(): ProductInfo | null {
  try {
    // Find the product container
    const productContainer = document.querySelector('article, .card, [class*="product"], [id*="product"]');
    console.log('Found product container:', productContainer);
    
    if (!productContainer) {
      console.error('Could not find product container');
      return null;
    }

    // Extract product information
    const titleElement = productContainer.querySelector('h1, h2, h3, h4, [class*="title"], [class*="name"]');
    const priceElement = productContainer.querySelector('[class*="price"], .price');
    const imageElement = productContainer.querySelector('img');

    console.log('Found elements:', {
      title: titleElement?.textContent,
      price: priceElement?.textContent,
      image: imageElement?.src
    });

    const productName = titleElement?.textContent?.trim() || 'Unknown Product';
    const productPrice = priceElement?.textContent?.trim() || '';
    const productImage = imageElement?.src || '';
    const productUrl = window.location.href;

    // Extract brand from URL
    const hostname = new URL(productUrl).hostname;
    const parts = hostname.split('.').filter(Boolean);
    const productBrand = parts.length >= 2 ? parts[parts.length - 2] : hostname;

    console.log('Extracted brand from URL:', productBrand);

    return {
      name: productName,
      price: productPrice,
      image: productImage,
      url: productUrl,
      brand: productBrand
    };
  } catch (error) {
    console.error('Error extracting product info:', error);
    return null;
  }
}

function removeSustainabilityTracker(): void {
  if (sustainabilityWidget) {
    sustainabilityWidget.remove();
    sustainabilityWidget = null;
    document.body.style.paddingTop = '';
  }
}

