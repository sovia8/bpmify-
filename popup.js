function getBPMFromContentScript() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'getBPM' }, (response) => {
      resolve(response);
    });
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const response = await getBPMFromContentScript();
  if (response && response.bpm) {
    document.getElementById('bpm-value').textContent = 'BPM: ' + response.bpm;
  } else {
    document.getElementById('bpm-value').textContent = 'BPM not available.';
  }
});
