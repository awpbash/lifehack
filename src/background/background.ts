/// <reference types="chrome"/>

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

interface ProductInfo {
  name: string;
  price: string;
  image: string;
  url: string;
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    enabled: true,
    stats: {
      analyzed: 0,
      co2Saved: 0,
      ecoChoices: 0,
    },
  });
});

// Handle message for sustainability data
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSustainabilityData") {
    setTimeout(() => {
      const mockData = generateMockSustainabilityData(request.productInfo);
      sendResponse(mockData);
    }, 500);
    return true; // required for async sendResponse
  }
});

function generateMockSustainabilityData(productInfo: ProductInfo): SustainabilityData {
  const brands: Record<string, { score: number; carbonFootprint: number; waterUsage: string; recyclable: number }> = {
    nike: { score: 65, carbonFootprint: 8.2, waterUsage: "High", recyclable: 45 },
    adidas: { score: 78, carbonFootprint: 6.1, waterUsage: "Medium", recyclable: 67 },
    patagonia: { score: 92, carbonFootprint: 2.3, waterUsage: "Low", recyclable: 89 },
    apple: { score: 71, carbonFootprint: 12.5, waterUsage: "Medium", recyclable: 78 },
    samsung: { score: 68, carbonFootprint: 14.2, waterUsage: "High", recyclable: 56 },
    default: { score: 55, carbonFootprint: 10.5, waterUsage: "Medium", recyclable: 40 },
  };

  const productName = productInfo.name.toLowerCase();
  let brandData = brands.default;

  for (const brand in brands) {
    if (productName.includes(brand)) {
      brandData = brands[brand];
      break;
    }
  }

  return {
    sustainabilityScore: brandData.score,
    carbonFootprint: brandData.carbonFootprint,
    waterUsage: brandData.waterUsage,
    recyclableContent: brandData.recyclable,
    certifications:
      brandData.score > 80
        ? ["B-Corp", "Fair Trade"]
        : brandData.score > 60
        ? ["Fair Trade"]
        : [],
    alternatives: generateAlternatives(productInfo, brandData.score),
  };
}

function generateAlternatives(productInfo: ProductInfo, currentScore: number): Alternative[] {
  if (currentScore >= 85) return [];

  const alternatives: Alternative[] = [
    {
      name: "EcoChoice Alternative",
      brand: "GreenBrand",
      score: Math.min(95, currentScore + 20),
      price: "$" + (Math.random() * 50 + 20).toFixed(2),
      savings: Math.floor(Math.random() * 30 + 10) + "% less CO₂",
    },
    {
      name: "Sustainable Option",
      brand: "EarthFirst",
      score: Math.min(90, currentScore + 15),
      price: "$" + (Math.random() * 40 + 25).toFixed(2),
      savings: Math.floor(Math.random() * 25 + 15) + "% less water",
    },
  ];

  return alternatives.slice(0, Math.floor(Math.random() * 2) + 1);
}