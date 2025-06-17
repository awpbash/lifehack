// Fixed energy consumption per kg of product (kWh/kg)
const ENERGY_PER_KG = 0.5; // adjust based on your data

interface ProductData {
  name: string;
  weight: number;
  brand: string;
}

export async function calculateCarbonFootprint(productData: ProductData): Promise<number> {
  try {
    console.log('Starting carbon footprint calculation for:', productData);
    
    // Load all required data
    try {
      const [weightsData, locationsData, carbonIntensityData] = await Promise.all([
        fetch(chrome.runtime.getURL('weights.json')).then(async res => {
          if (!res.ok) throw new Error(`Failed to fetch weights.json: ${res.status} ${res.statusText}`);
          return res.json();
        }),
        fetch(chrome.runtime.getURL('locations.json')).then(async res => {
          if (!res.ok) throw new Error(`Failed to fetch locations.json: ${res.status} ${res.statusText}`);
          return res.json();
        }),
        fetch(chrome.runtime.getURL('carbonIntensity.json')).then(async res => {
          if (!res.ok) throw new Error(`Failed to fetch carbonIntensity.json: ${res.status} ${res.statusText}`);
          return res.json();
        })
      ]);

      console.log('Loaded data:', {
        weights: weightsData,
        locations: locationsData,
        carbonIntensity: carbonIntensityData
      });

      // Get the weight for the product from weights.json
      const weight = weightsData[productData.name] || 0.5; // Fallback to 0.5 if not found
      console.log('Using weight:', weight);
      
      if (!weight) {
        throw new Error(`No weight data found for product: ${productData.name}`);
      }

      // Get the brand's location from locations.json
      const location = locationsData[productData.brand];
      console.log('WOWOWOOW', productData)
      console.log('Found location for brand:', location);
      
      // if (!location) {
      //   throw new Error(`No location data found for brand: ${productData.brand}`);
      // }

      // Get the location's carbon intensity from carbonIntensity.json
      const carbonIntensity = carbonIntensityData[location];
      console.log('Found carbon intensity:', carbonIntensity);
      
      // if (!carbonIntensity) {
      //   throw new Error(`No carbon intensity data found for location: ${location}`);
      // }

      // Calculate carbon footprint
      // Formula: weight (kg) * energy per kg (kWh/kg) * carbon intensity (gCO2/kWh)
      const carbonFootprint = weight * ENERGY_PER_KG * (carbonIntensity / 1000); // Convert gCO2 to kgCO2
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
