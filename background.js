// Function to request the current URL from the active tab
function getCurrentUrl(callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        const url = tabs[0].url;
        callback(url);
      } else {
        callback(null);
      }
    });
  }
  
  // Function to send a message to the content script with the current URL
  function sendCurrentUrlMessage() {
    getCurrentUrl((url) => {
      if (url) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const tab = tabs[0];
          chrome.tabs.sendMessage(tab.id, { action: 'setUrl', url: url }, (response) => {
            if (response && response.tempo) {
              updatePopup(response.tempo);
            } else {
              updatePopup(null);
            }
          });
        });
      }
    });
  }
  
  // Function to update the popup with the tempo value
  function updatePopup(tempo) {
    chrome.action.setPopup({ popup: 'popup.html' }, () => {
      chrome.runtime.sendMessage({ action: 'updateTempo', tempo: tempo });
    });
  }
  
  // Event listener for receiving messages from content script or popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getCurrentUrl') {
      getCurrentUrl((url) => {
        sendResponse({ url: url });
      });
      return true;
    }
  });
  
  // Event listener for extension startup
  chrome.runtime.onStartup.addListener(sendCurrentUrlMessage);
  
  // Event listener for extension installation or update
  chrome.runtime.onInstalled.addListener(sendCurrentUrlMessage);
  
  // Event listener for tab updates
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.active) {
      sendCurrentUrlMessage();
    }
  });
  