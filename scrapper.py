import requests
from bs4 import BeautifulSoup
import urllib.parse
import json
from urllib.parse import urlparse

def get_domain_name(url):
    try:
        hostname = urlparse(url).hostname
        if hostname is None:
            return "unknown"
        # Strip subdomains (e.g. www.walmart.com → walmart)
        parts = hostname.split('.')
        if len(parts) >= 2:
            return parts[-2]  # e.g. walmart from www.walmart.com
        return hostname
    except:
        return "unknown"

def bing_image_search(query, limit=10):
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/119.0.0.0 Safari/537.36"
        )
    }

    query_encoded = urllib.parse.quote(query)
    url = f"https://www.bing.com/images/search?q={query_encoded}&form=HDRSC2"

    res = requests.get(url, headers=headers)
    soup = BeautifulSoup(res.text, "html.parser")

    image_data = []

    for a in soup.select("a.iusc"):
        m_json = a.get("m")
        if m_json:
            try:
                data = json.loads(m_json)
                image_url = data.get("murl")
                page_url = data.get("purl")
                if image_url and page_url:
                    brand = get_domain_name(page_url)
                    image_data.append({
                        "image": image_url,
                        "source": page_url,
                        "brand": brand
                    })
            except json.JSONDecodeError:
                continue

        if len(image_data) >= limit:
            break

    return image_data

# === MAIN ===
if __name__ == "__main__":
    query = input("Search Bing Images for: ")
    results = bing_image_search("buy " + query)

    if not results:
        print("❌ No results found or blocked.")
    else:
        print(f"\nTop {len(results)} image URLs for '{query}':\n")
        for i, url in enumerate(results, 1):
            print(f"{i}. {url}")
