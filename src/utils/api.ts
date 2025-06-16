export async function fetchBrandScore(brand: string) {
  const res = await fetch(`https://your-backend.com/score?brand=${encodeURIComponent(brand)}`);
  if (!res.ok) throw new Error('Failed to fetch score');
  return res.json();
}