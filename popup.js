// Function to initiate the Spotify authentication flow
function authenticateWithSpotify() {
    // Redirect the user to Spotify's authorization URL.
    const clientId = 'f9e8675000f54ddf9e0c21c143b6e4b3'; // Replace with your actual Spotify client ID
    const redirectUri = chrome.identity.getRedirectURL();

    // Define the scopes you need (e.g., user-read-playback-state) and encode them.
    const scopes = encodeURIComponent('user-read-playback-state');
    
    // Construct the authentication URL
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&response_type=code`;

    // Launch the authentication URL in a new tab
    chrome.tabs.create({ url: authUrl }, (tab) => {
        // Listen for changes in the URL of the newly created tab.
        // When the user is redirected back to your extension, we'll capture the code.
        chrome.webNavigation.onCompleted.addListener(function onTabComplete(details) {
            if (details.tabId === tab.id) {
                // Extract the code from the URL
                const code = new URL(details.url).searchParams.get('code');
                if (code) {
                    // Send the code to your background script for token exchange.
                    chrome.runtime.sendMessage({ action: 'getToken', code });
                }
                // Close the tab since we don't need it anymore
                chrome.tabs.remove(tab.id);
                // Remove the listener to prevent capturing other tab completions
                chrome.webNavigation.onCompleted.removeListener(onTabComplete);
            }
        });
    });
}

// Add an event listener to trigger authentication when a button is clicked.
document.getElementById('auth-button').addEventListener('click', authenticateWithSpotify);

