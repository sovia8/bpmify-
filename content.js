chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  const tab = tabs[0];
  const url = tab.url;

  const trackId = extractTrackId(url);
  if (trackId) {
    getBpm(trackId);
  } else {
    displayError();
  }
});

function extractTrackId(url) {
  const regex = /\/track\/([A-Za-z0-9]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function getBpm(trackId) {
  const apiUrl = `https://api.spotify.com/v1/audio-features/${trackId}`;

  chrome.runtime.sendMessage({ message: "getToken" }, function (response) {
    const accessToken = response.accessToken;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };

    fetch(apiUrl, { headers })
      .then((response) => response.json())
      .then((data) => {
        const bpm = data.tempo;
        if (bpm) {
          displayBpm(bpm);
        } else {
          displayError();
        }
      })
      .catch((error) => {
        console.error(error);
        displayError();
      });
  });
}

function displayBpm(bpm) {
  const popup = document.getElementById("popup");
  popup.textContent = `BPM: ${bpm.toFixed(2)}`;
}

function displayError() {
  const popup = document.getElementById("popup");
  popup.textContent = "BPM not available.";
}
