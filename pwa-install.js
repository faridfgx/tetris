// PWA Install Logic
let deferredPrompt;
const installButton = document.getElementById('install-button');

// Check if the app is already installed
window.addEventListener('load', () => {
    // Detect if the app is in standalone mode (already installed)
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true) {
        console.log('App is running in standalone mode (installed)');
    }
});

// Listen for the beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the default browser prompt
    e.preventDefault();
    
    // Store the event for later use
    deferredPrompt = e;
    
    // Show the install button
    if (installButton) {
        installButton.classList.remove('hidden');
        
        // Add click handler for install button
        installButton.addEventListener('click', installApp);
    }
});

// Function to handle app installation
function installApp() {
    if (!deferredPrompt) {
        return;
    }
    
    // Show the browser's install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the installation');
            // Hide install button after installation
            if (installButton) {
                installButton.classList.add('hidden');
            }
        } else {
            console.log('User dismissed the installation');
        }
        
        // Reset the deferred prompt variable
        deferredPrompt = null;
    });
}

// Handle the case when the app is successfully installed
window.addEventListener('appinstalled', (evt) => {
    console.log('App was installed successfully');
    // Hide install button after installation
    if (installButton) {
        installButton.classList.add('hidden');
    }
});

// Detect platform and provide iOS installation guidance
if (installButton && /iPad|iPhone|iPod/.test(navigator.userAgent)) {
    installButton.textContent = 'Install Guide';
    installButton.classList.remove('hidden');
    
    installButton.addEventListener('click', () => {
        // Show iOS-specific installation instructions
        const gameContainer = document.querySelector('.game-container');
        const iosInstructions = document.createElement('div');
        iosInstructions.className = 'overlay-screen';
        iosInstructions.innerHTML = `
            <h2>Install on iOS</h2>
            <ol style="text-align: left; margin: 20px 0;">
                <li>Tap the Share button <span style="font-size: 20px;">⎙</span></li>
                <li>Scroll down and tap "Add to Home Screen"</li>
                <li>Tap "Add" in the top right</li>
            </ol>
            <button id="close-ios-guide">Close</button>
        `;
        
        gameContainer.appendChild(iosInstructions);
        
        // Add close button functionality
        document.getElementById('close-ios-guide').addEventListener('click', () => {
            iosInstructions.remove();
        });
    });
}