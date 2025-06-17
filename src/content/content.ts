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
  removeSustainabilityTracker();

  sustainabilityWidget = createSustainabilityWidget();
  document.body.appendChild(sustainabilityWidget);

  const style = document.createElement('style');
  style.textContent = `
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
  `;
  document.head.appendChild(style);

  // ✅ Set happy earth directly
  const happyEarth = chrome.runtime.getURL('happy earth.png');
  const earthImg = sustainabilityWidget.querySelector('.eco-earth-img') as HTMLImageElement;
  // console.log('Happy Earth image URL:', happyEarth);
  // console.log('Earth image element:', earthImg);
  if (earthImg) {
    earthImg.src = happyEarth;
    earthImg.alt = 'Happy Earth';
  }

  loadSustainabilityData();
  
}


function createSustainabilityWidget(): HTMLElement {
  const widget = document.createElement("div");
  widget.className = "eco-sustainability-widget";
  widget.innerHTML = `
    <div class="eco-widget">
      <img class="eco-earth-img" src="" alt="Happy Earth" />
      <div class="eco-score-item">
        <span class="eco-icon">🌍</span>
        <span class="eco-score-value eco-carbon-value">--</span>
        <span class="eco-score-label">kg CO₂</span>
      </div>
    </div>
    `;
  return widget;
}

async function loadSustainabilityData(): Promise<void> {
  try {
    const productInfo = extractProductInfo();
    if (!productInfo) return;
    const brand = productInfo.brand;
    try {
      const weightsUrl = chrome.runtime.getURL('weights.json');
      const weightsResponse = await fetch(weightsUrl);
      if (!weightsResponse.ok) throw new Error(`Failed to fetch weights.json: ${weightsResponse.status} ${weightsResponse.statusText}`);
      const weightsData = await weightsResponse.json();


      const weight = weightsData[productInfo.name] || 0.5;
      const productData = { name: productInfo.name, weight: weight, brand: brand };
      const carbonFootprint = await calculateCarbonFootprint(productData);
      // Update the widget values
      if (sustainabilityWidget) {
        const earthImg = sustainabilityWidget.querySelector('.eco-earth-img') as HTMLImageElement;
        const carbonValue = sustainabilityWidget.querySelector('.eco-carbon-value') as HTMLDivElement;
        if (carbonValue) carbonValue.textContent = carbonFootprint.toFixed(2);
        if (earthImg) {
          const happyEarth = chrome.runtime.getURL('happy_earth.png');
          const sadEarth = chrome.runtime.getURL('sad_earth.png');
          earthImg.src = carbonFootprint <= 30 ? happyEarth : sadEarth;
          earthImg.alt = carbonFootprint <= 30 ? 'Happy Earth' : 'Sad Earth';
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
  }
}

