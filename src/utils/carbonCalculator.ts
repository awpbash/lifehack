// Fixed energy consumption per kg of product (kWh/kg)
const ENERGY_PER_KG = 30; // estimated value which is fixed
const MATERIAL_IMPACT = 20; // estimated value which is fixed

interface ProductData {
  name: string;
  weight: number;
  brand: string;
}

interface Rating {
  overall: number;
  link : string;
  description: string;
  planet: [number, number];
  people: [number, number];
  animal: [number, number];
  location: string;
  brand: string;
}

export async function calculateCarbonFootprint(productData: ProductData): Promise<number> {
  try {
    console.log('Starting carbon footprint calculation for:', productData);
    
    // Load all required data
    try {
      const [weightsData, carbonIntensityData, ratingsData] = await Promise.all([
        fetch(chrome.runtime.getURL('weights.json')).then(async res => {
          if (!res.ok) throw new Error(`Failed to fetch weights.json: ${res.status} ${res.statusText}`);
          return res.json();
        }),
        fetch(chrome.runtime.getURL('carbonIntensity.json')).then(async res => {
          if (!res.ok) throw new Error(`Failed to fetch carbonIntensity.json: ${res.status} ${res.statusText}`);
          return res.json();
        }),
        fetch(chrome.runtime.getURL('ratings.json')).then(async res => {
          if (!res.ok) throw new Error(`Failed to fetch locations.json: ${res.status} ${res.statusText}`);
          return res.json();
        }),
      ]);

      const locationsData: Record<string, string> = {};

      Object.keys(ratingsData).forEach((key: string) => {
        const rating = ratingsData[key];
        if (rating && rating.location && rating.brand) {
          locationsData[rating.brand] = rating.location;
        }
      });

      console.log('Loaded data:', {
        weights: weightsData,
        locations: locationsData,
        carbonIntensity: carbonIntensityData
      });

      // Get the weight for the product from weights.json
      const weight = productData.weight // Fallback to 0.5 if not found
      console.log('Using weight:', weight);
      
      if (!weight) {
        throw new Error(`No weight data found for product: ${productData.name}`);
      }

      // Get the brand's location from ratings.json
      const location = locationsData[productData.brand];
      console.log('WOWOWOOW', productData)
      console.log('Found location for brand:', location);
      
      // if (!location) {
      //   throw new Error(`No location data found for brand: ${productData.brand}`);
      // }

      // Get the location's carbon intensity from carbonIntensity.json
      const key = Object.keys(carbonIntensityData).find(k => k.toLowerCase() === location.toLowerCase());
      if (!key) {
        throw new Error(`No carbon intensity data found for location: ${location}`);
      }
      const carbonIntensity = carbonIntensityData[key];
      console.log('Found carbon intensity:', carbonIntensity);
      
      // if (!carbonIntensity) {
      //   throw new Error(`No carbon intensity data found for location: ${location}`);
      // }

      // Calculate carbon footprint
      // Formula: weight (kg) * energy per kg (kWh/kg) * carbon intensity (gCO2/kWh)
      const carbonFootprint = weight * ENERGY_PER_KG * (carbonIntensity / 1000) + MATERIAL_IMPACT; // Convert gCO2 to kgCO2
      console.log('Calculated carbon footprint:', carbonFootprint);

      return Number(carbonFootprint.toFixed(2));
    } catch (error) {
      console.error('Error loading JSON data:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error calculating carbon footprint:', error);
    throw error;
  }
}
