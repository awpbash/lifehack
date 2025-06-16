/// <reference types="chrome"/>

chrome.runtime.onInstalled.addListener(() => {
  console.log('EcoCart+ background active');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_SUSTAINABILITY_SCORE') {
    // Call backend or use cached score logic here
    sendResponse({ score: 'B+', reason: 'Uses recycled materials but high emissions' });
  }
});
