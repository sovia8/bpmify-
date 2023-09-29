// background.js

// Function to store the access token securely in chrome.storage
function storeAccessToken(accessToken) {
    chrome.storage.local.set({ 'access_token': accessToken }, function() {
        console.log('Access token stored successfully.');
    });
}

// Function to retrieve the access token from chrome.storage
function getAccessToken(callback) {
    chrome.storage.local.get(['access_token'], function(result) {
        const accessToken = result.access_token;
        if (accessToken) {
            callback(accessToken);
        } else {
            console.error('Access token not found.');
        }
    });
}

// Function to fetch song information using the access token
function getSongInfo(accessToken) {
    const apiUrl = 'https://api.spotify.com/v1/me/player/currently-playing';

    fetch(apiUrl, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    })
    .then(response => response.json())
    .then(data => {
        // Extract BPM and perform any desired actions with the song data.
        const bpm = data.track.tempo;
        console.log(`BPM: ${bpm}`);
        // You can send this BPM value to your popup.js or perform other actions here.
    })
    .catch(error => {
        console.error('Error fetching song information:', error);
    });
}

// Listener for messages from popup.js
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'exchangeCodeForToken') {
        const code = request.code;
        const clientId = 'f9e8675000f54ddf9e0c21c143b6e4b3'; // Replace with your actual Spotify client ID
        const clientSecret = '67b4d9634f584e5c8c7197a08a5b0892'; // Replace with your actual Spotify client secret
        const redirectUri = 'https://ahaccdcojcnmdijhmbgehnbaljjakeac.chromiumapp.org/oauth2'; // Replace with your extension's ID
        const tokenUrl = 'https://accounts.spotify.com/api/token';

        // Prepare the request body
        const data = new URLSearchParams();
        data.append('code', code);
        data.append('grant_type', 'authorization_code');
        data.append('redirect_uri', redirectUri);

        // Create the request headers for basic authentication
        const headers = {
            'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret),
            'Content-Type': 'application/x-www-form-urlencoded'
        };

        // Make a POST request to exchange code for tokens
        fetch(tokenUrl, {
            method: 'POST',
            body: data,
            headers: headers,
        })
        .then(response => response.json())
        .then(tokens => {
            // Store the access token securely
            const accessToken = tokens.access_token;
            storeAccessToken(accessToken);

            // Send the tokens back to popup.js for storage
            chrome.runtime.sendMessage({ action: 'storeTokens', tokens });
        })
        .catch(error => {
            console.error('Error exchanging code for tokens:', error);
        });
    }
});
