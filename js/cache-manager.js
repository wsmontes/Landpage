/**
 * Cache Manager
 * Handles version checking and cache busting for the website
 */

class CacheManager {
    constructor() {
        // Set the current version of the site
        // This should be updated whenever significant changes are made
        this.currentVersion = '1.0.0';
        this.versionStorageKey = 'wsmontes_site_version';
    }

    /**
     * Initialize the cache manager
     */
    init() {
        // Check if we need to reload due to a version change
        const shouldReload = this.checkVersionAndUpdate();
        
        if (shouldReload) {
            // If version changed, clear cache and reload
            this.clearCacheAndReload();
        }
    }

    /**
     * Check stored version against current version
     * @returns {boolean} True if the version has changed
     */
    checkVersionAndUpdate() {
        // Get the stored version (if any)
        const storedVersion = localStorage.getItem(this.versionStorageKey);
        
        // If no stored version or version is different, update and return true
        if (!storedVersion || storedVersion !== this.currentVersion) {
            // Store the new version
            localStorage.setItem(this.versionStorageKey, this.currentVersion);
            
            // Return true to indicate version change
            return true;
        }
        
        // No version change
        return false;
    }

    /**
     * Clear browser cache and reload the page
     */
    clearCacheAndReload() {
        // Create a timestamp for cache busting
        const cacheBuster = Date.now();
        
        // Add cache busting parameter to the URL
        const currentUrl = window.location.href;
        const separator = currentUrl.includes('?') ? '&' : '?';
        const newUrl = `${currentUrl}${separator}cache=${cacheBuster}`;
        
        // Navigate to the new URL which forces a reload
        window.location.href = newUrl;
    }

    /**
     * Add a manual refresh button for users
     * Useful when changes may not be visible
     */
    addRefreshButton() {
        const button = document.createElement('button');
        button.className = 'tui-button refresh-cache-button';
        button.innerHTML = 'Refresh Content';
        button.style.position = 'fixed';
        button.style.bottom = '50px';
        button.style.right = '10px';
        button.style.zIndex = '999';
        
        button.addEventListener('click', () => {
            // Clear stored version to force refresh
            localStorage.removeItem(this.versionStorageKey);
            // Reload with cache busting
            this.clearCacheAndReload();
        });
        
        document.body.appendChild(button);
    }
}

// Run immediately before DOM is fully loaded to catch early requests
const cacheManager = new CacheManager();

// Check version on page load (before DOM ready)
window.addEventListener('load', function() {
    cacheManager.init();
    
    // Optionally add refresh button (uncomment if needed)
    // cacheManager.addRefreshButton();
    
    // Make cacheManager accessible globally
    window.cacheManager = cacheManager;
});
