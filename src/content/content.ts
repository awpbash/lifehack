const elements = document.querySelectorAll('[class*=product], [class*=item], [class*=card]');
const cart = [...elements].map(el => ({
  name: el.querySelector('h1, h2, .name')?.textContent || '',
  price: el.querySelector('.price')?.textContent || ''
}));

const carbon = cart.length * 2.5;
const plastic = cart.length * 0.1;

chrome.storage.local.get(['ecoStats'], (result) => {
  const prev = result.ecoStats || { carbon: 0, plastic: 0 };
  chrome.storage.local.set({
    ecoStats: {
      carbon: prev.carbon + carbon,
      plastic: prev.plastic + plastic
    }
  });
});