/// <reference types="chrome"/>
import "./content.css";
import { calculateCarbonFootprint } from "../utils/carbonCalculator";

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

let currentUrl = window.location.href;
let urlCheckInterval: NodeJS.Timeout | null = null;

function startUrlMonitoring(): void {
    if (urlCheckInterval) return;

    urlCheckInterval = setInterval(() => {
        if (window.location.href !== currentUrl) {
            console.log(
                "🔄 URL changed from",
                currentUrl,
                "to",
                window.location.href,
            );
            currentUrl = window.location.href;

            setTimeout(() => {
                if (isEnabled) {
                    initializeSustainabilityTracker();
                }
            }, 1000);
        }
    }, 500);
}

function stopUrlMonitoring(): void {
    if (urlCheckInterval) {
        clearInterval(urlCheckInterval);
        urlCheckInterval = null;
    }
}

// Initialize
chrome.storage.local.get(["enabled"], (result) => {
    isEnabled = result.enabled !== false;
    if (isEnabled) {
        initializeSustainabilityTracker();
        startUrlMonitoring(); // ADD THIS LINE
    }
});

function removeSustainabilityTracker(): void {
    console.log(sustainabilityWidget);
    if (sustainabilityWidget) {
        sustainabilityWidget.remove();
        sustainabilityWidget = null;
    }
}

// Listen for toggle messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(request);
    if (request.action === "toggle") {
        isEnabled = request.enabled !== false;
        if (isEnabled) {
            initializeSustainabilityTracker();
            startUrlMonitoring(); // ADD THIS LINE
        } else {
            removeSustainabilityTracker();
            startUrlMonitoring(); // ADD THIS LINE
        }
    }
});

function initializeSustainabilityTracker(): void {
    removeSustainabilityTracker();

    sustainabilityWidget = createSustainabilityWidget();
    console.log(sustainabilityWidget);
    document.body.appendChild(sustainabilityWidget);

    const style = document.createElement("style");
    style.textContent = `
    .eco-sustainability-widget {
      position: fixed;
      top: 32px;
      right: 32px;
      z-index: 9999;
      background: none;
    }
    .eco-widget {

    }

    .eco-earth-img {
      width: 120px;
      height: 120px;
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
    const happyEarth = chrome.runtime.getURL("happy_earth.png");
    const earthImg = sustainabilityWidget.querySelector(
        ".eco-earth-img",
    ) as HTMLImageElement;
    // console.log('Happy Earth image URL:', happyEarth);
    // console.log('Earth image element:', earthImg);
    if (earthImg) {
        earthImg.src = happyEarth;
        earthImg.alt = "Happy Earth";
        earthImg.addEventListener("click", () => {
            console.log("🌍 Earth icon clicked");
            togglePopup();
        });

        loadSustainabilityData();
    }

    function createSustainabilityWidget(): HTMLElement {
        const widget = document.createElement("div");
        widget.className = "eco-sustainability-widget";
        widget.innerHTML = `
    <div class="eco-widget">
      <div class="eco-earth-text">Click to learn more</div>
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
            console.log("PRODYUCT INFO:", productInfo);
            if (!productInfo) return;
            const brand = productInfo.brand;
            try {
                const weightsUrl = chrome.runtime.getURL("weights.json");
                const weightsResponse = await fetch(weightsUrl);
                if (!weightsResponse.ok)
                    throw new Error(
                        `Failed to fetch weights.json: ${weightsResponse.status} ${weightsResponse.statusText}`,
                    );
                const weightsData = await weightsResponse.json();

                const ratingsData = await fetch(
                    chrome.runtime.getURL("ratings.json"),
                ).then((res) => res.json());

                const rawName = productInfo.name.toLowerCase();
                const weightKeys = Object.keys(weightsData).map((k) => k.toLowerCase());
                const matchedKey = weightKeys.find((key) => rawName.includes(key));
                const finalKey = matchedKey
                    ? Object.keys(weightsData).find((k) => k.toLowerCase() === matchedKey)
                    : null;
                const true_weight = weightsData[finalKey || ""] || 0.5;

                const productData = {
                    name: productInfo.name,
                    weight: true_weight,
                    brand: brand,
                };
                const carbonFootprint = await calculateCarbonFootprint(productData);
                const brandLink = `https://${brand}/`;
                const stats = ratingsData[brandLink];
                console.log("Brand stats:", stats);
                // Update widget
                if (sustainabilityWidget) {
                    const earthImg = sustainabilityWidget.querySelector(
                        ".eco-earth-img",
                    ) as HTMLImageElement;
                    const carbonValue = sustainabilityWidget.querySelector(
                        ".eco-carbon-value",
                    ) as HTMLDivElement;
                    if (carbonValue) carbonValue.textContent = carbonFootprint.toFixed(2);
                    if (earthImg) {
                        const happyEarth = chrome.runtime.getURL("happy_earth.png");
                        const sadEarth = chrome.runtime.getURL("sad_earth.png");
                        if (stats?.overall >= 4) {
                            earthImg.src = happyEarth;
                            earthImg.alt = "Happy Earth";
                        } else {
                            earthImg.src = sadEarth;
                            earthImg.alt = "Sad Earth";
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching weights.json:", error);
                throw error;
            }
        } catch (error) {
            console.error("Error loading sustainability data:", error);
        }
    }

    function extractProductInfo(): ProductInfo | null {
        try {
            // Find the product container
            const productContainer = document.querySelector(
                "[class*=product][class*=name], [class*=product][class*=title], [id*=product][id*=name], [id*=product][id*=title], [data-auto-id*=product][data-auto-id*=title], [data-auto-id*=product][data-auto-id*=name]",
            );
            console.log("Found product container:", productContainer);

            if (!productContainer) {
                console.error("Could not find product container");
                return null;
            }

            // Extract product information
            const titleElement = document.querySelector(
                "[class*=product][class*=name], [class*=product][class*=title], [id*=product][id*=name], [id*=product][id*=title], [data-auto-id*=product][data-auto-id*=title], [data-auto-id*=product][data-auto-id*=name]",
            );
            const priceElement = productContainer.querySelector(
                '[class*="price"], .price',
            );
            const imageElement = productContainer.querySelector("img");

            const apiKey = import.meta.env.VITE_API_KEY;
            // console.log("Found elements:", {
            //   title: titleElement,
            //   price: priceElement?.textContent,
            //   image: imageElement?.src,
            // });

            const rawName =
                titleElement?.textContent?.trim().toLowerCase() || "Unknown Product";
            const productPrice = priceElement?.textContent?.trim() || "";
            const productImage = imageElement?.src || "";
            const productUrl = window.location.href;

            // Extract brand from URL
            const hostname = new URL(productUrl).hostname;
            const parts = hostname.split(".").filter(Boolean);
            const productBrand =
                parts.length >= 2 ? parts[parts.length - 2] : hostname;

            console.log("Extracted brand from URL:", productBrand);

            return {
                name: rawName,
                price: productPrice,
                image: productImage,
                url: productUrl,
                brand: productBrand,
            };
        } catch (error) {
            console.error("Error extracting product info:", error);
            return null;
        }
    }

    function sendToOpenAI(prompt: string): void {
        // Retrieve API key from environment variable or configuration
        const apikey = import.meta.env.VITE_API_KEY;
        fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apikey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages: [
                    { role: "system", content: "You are a sustainability analyst." },
                    { role: "user", content: prompt },
                ],
                temperature: 0.7,
            }),
        })
            .then((res: Response) => res.json())
            .then((data: any) => {
                const reply = data.choices?.[0]?.message?.content;
                console.log("🌍 OpenAI response:", reply);
                renderPopupTable(reply || "No data returned");
            })
            .catch((err: unknown) => console.error("❌ OpenAI Error:", err));
    }

    let currentPopup: HTMLElement | null = null;

    function togglePopup(): void {
        // If popup is open, remove it
        if (currentPopup) {
            currentPopup.remove();
            currentPopup = null;
            return;
        }

        // Create popup container
        const popup = document.createElement("div");
        popup.className = "eco-popup";
        popup.id = "eco-popup";
        popup.style.position = "fixed";
        popup.style.bottom = "110px";
        popup.style.right = "32px";
        popup.style.zIndex = "10000";
        popup.style.background = "#fff";
        popup.style.border = "1px solid #ddd";
        popup.style.borderRadius = "12px";
        popup.style.boxShadow = "0 4px 16px rgba(0,0,0,0.15)";
        popup.style.padding = "24px 20px 20px 20px";
        popup.style.minWidth = "320px";
        popup.style.maxWidth = "400px";
        popup.style.fontFamily = "inherit";

        const closeBtn = document.createElement("button");
        closeBtn.textContent = "×";
        closeBtn.style.position = "absolute";
        closeBtn.style.top = "8px";
        closeBtn.style.right = "12px";
        closeBtn.style.background = "none";
        closeBtn.style.border = "none";
        closeBtn.style.fontSize = "1.5rem";
        closeBtn.style.cursor = "pointer";
        closeBtn.onclick = () => {
            popup.remove();
            currentPopup = null;
        };
        popup.appendChild(closeBtn);

        const placeholder = document.createElement("div");
        placeholder.id = "eco-popup-content";
        placeholder.innerHTML = "<em>Loading sustainability analysis...</em>";
        popup.appendChild(placeholder);

        document.body.appendChild(popup);
        currentPopup = popup;

        const productInfo = extractProductInfo();
        if (!productInfo) {
            placeholder.innerHTML = "❌ Could not extract product info.";
            return;
        }
        const prompt = `Using information found at this URL: ${productInfo.url}, extract the product name, brand, and material. Then, evaluate the product's sustainability in four categories:

Material (e.g. natural, recycled, toxic, biodegradable)

Production (e.g. ethical sourcing, labor, water usage, emissions)

Durability (e.g. long-lasting, disposable, wear resistance)

End-of-life (e.g. recyclable, compostable, landfill)

For each category, please have one word rating it poor/moderate/good, 1-2 lines of insights on why based on credible sources <35 words, and one actionable tip for the user <20 words.
I want it in this format: 
Material:
- Verdict:
- Insight:
- Tip:`;
        console.log("🌍 Sending prompt to OpenAI:", prompt);
        sendToOpenAI(prompt);
    }
}
function renderPopupTable(response: string): void {
    const container = document.getElementById("eco-popup-content");
    if (!container) return;
    container.innerHTML = "";

    // Add style once
    if (!document.getElementById("eco-popup-style")) {
        const style = document.createElement("style");
        style.id = "eco-popup-style";
        style.textContent = `
      .eco-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        min-height: 250px;
        transition: all 0.3s ease;
      }

      .eco-quadrant {
        background: #e7f5e9;
        padding: 20px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-size: 14px;
        border-radius: 12px;
        cursor: pointer;
        position: relative;
        transition: all 0.3s ease;
      }

      .eco-expanded {
        grid-column: 1 / span 2;
        grid-row: 1 / span 2;
        z-index: 1;
        position: relative;
      }

      .eco-close-btn {
        position: absolute;
        top: 8px;
        right: 12px;
        background: white;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        z-index: 10;
        color: #222;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        line-height: 30px;
        text-align: center;
        box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      }
    `;
        document.head.appendChild(style);
    }

    // Header + earth image
    const heading = document.createElement("h3");
    heading.textContent = "Find out more!";
    heading.style.textAlign = "center";
    heading.style.marginBottom = "10px";
    heading.style.fontSize = "1.2rem";
    heading.style.fontWeight = "bold";

    const earthImg = document.createElement("img");
    earthImg.src = chrome.runtime.getURL("sad_earth.png");
    earthImg.alt = "Earth";
    earthImg.style.width = "80px";
    earthImg.style.display = "block";
    earthImg.style.margin = "0 auto 10px auto";

    container.appendChild(heading);
    container.appendChild(earthImg);

    const grid = document.createElement("div");
    grid.className = "eco-grid";

    const categories = [
        { label: "Material", icon: "♻️" },
        { label: "Production", icon: "🏭" },
        { label: "Durability", icon: "🧱" },
        { label: "End-of-life", icon: "🪦" },
    ];

    categories.forEach(({ label, icon }) => {
        const cell = document.createElement("div");

        // Robust regex to get: Verdict, Insight, Tip for each label
        // Robust full block extraction for this label:
        const regex = new RegExp(
            `${label}:\\s*[-–]\\s*Verdict:\\s*(.*?)\\s*[-–]\\s*Insight:\\s*([\\s\\S]*?)\\s*[-–]\\s*Tip:\\s*([\\s\\S]*?)(?=\\n[A-Z][a-zA-Z\\s-]*:|$)`,
            "i",
        );
        const match = response.match(regex);

        let verdict = "Unknown",
            insight = "No info",
            tip = "No tip";
        if (match) {
            verdict = match[1].trim();
            insight = match[2].trim();
            tip = match[3].trim();
        }

        // Compact view for the quadrant
        cell.className = "eco-quadrant";
        cell.innerHTML = `
      <div style="font-size: 1.5rem">${icon}</div>
      <div style="margin-top: 6px; font-weight: 600;">${label}</div>
    `;

        // Click → expand with formatted content
        cell.addEventListener("click", () => {
            const all = grid.querySelectorAll(".eco-quadrant");
            all.forEach((q) => {
                if (q !== cell) (q as HTMLElement).style.display = "none";
            });

            cell.classList.add("eco-expanded");
            cell.style.position = "relative";
            cell.innerHTML = `
        <button class="eco-close-btn">×</button>
        <div style="font-size: 2rem; text-align:center; margin-top: 10px;">${icon}</div>
        <h3 style="text-align:center; margin: 10px 0;">${label}</h3>
        <p style="text-align:center; font-weight:bold;">Verdict: ${verdict}</p>
        <p style="text-align:left; margin-top: 10px;"><strong>Insight:</strong><br>${insight}</p>
        <p style="text-align:left; margin-top: 10px;"><strong>Tip:</strong><br>${tip}</p>
      `;

            const close = cell.querySelector(".eco-close-btn") as HTMLButtonElement;
            close.onclick = () => renderPopupTable(response);
        });

        grid.appendChild(cell);
    });

    container.appendChild(grid);
}
