/**
 * Contact Manager
 * Handles loading and processing contact information from a separate file
 * Protects email and other sensitive information from automated scraping
 */

class ContactManager {
    constructor() {
        this.contactInfo = null;
        this.loaded = false;
    }
    
    /**
     * Initialize the contact manager
     * @returns {Promise} Promise that resolves when contact info is loaded
     */
    async init() {
        try {
            // Add a random parameter to avoid caching
            const response = await fetch(`contact-info.json?t=${new Date().getTime()}`);
            if (!response.ok) {
                throw new Error('Failed to load contact information');
            }
            this.contactInfo = await response.json();
            this.loaded = true;
            
            // Replace placeholders in content with actual links
            this.replacePlaceholders();
            
            // Set up email click handlers
            this.setupEmailHandlers();
            
            return true;
        } catch (error) {
            console.error('Error loading contact information:', error);
            return false;
        }
    }
    
    /**
     * Get email address from obfuscated parts
     * @returns {string} Assembled email address
     */
    getEmail() {
        if (!this.loaded || !this.contactInfo || !this.contactInfo.email) {
            return 'Email unavailable';
        }
        
        const email = this.contactInfo.email;
        return `${email.prefix}${email.middle}${email.suffix}@${email.domain}${email.tld}`;
    }
    
    /**
     * Get URL for a specific link type
     * @param {string} type - Link type (linkedin, github, etc.)
     * @returns {string} URL for the link type
     */
    getLink(type) {
        if (!this.loaded || !this.contactInfo || !this.contactInfo.links || !this.contactInfo.links[type]) {
            return '#';
        }
        return this.contactInfo.links[type];
    }
    
    /**
     * Replace all placeholders in the document with actual links
     */
    replacePlaceholders() {
        // Replace all link placeholders in link tags
        document.querySelectorAll('a[data-link-type]').forEach(link => {
            const linkType = link.getAttribute('data-link-type');
            const linkUrl = this.getLink(linkType);
            if (linkUrl !== '#') {
                link.href = linkUrl;
            }
        });
        
        // Allow content-manager to use contact info
        if (window.contentManager) {
            window.contentManager.contactManager = this;
        }
    }
    
    /**
     * Set up custom email handlers
     */
    setupEmailHandlers() {
        // Override the global email click handlers
        window.handleEmailClick = (event) => {
            event.preventDefault();
            const email = this.getEmail();
            if (email) {
                const link = event.target.closest('a');
                link.href = `mailto:${email}`;
                link.textContent = email;
            }
        };
        
        window.handleSideMenuEmail = (event) => {
            event.preventDefault();
            const email = this.getEmail();
            if (email) {
                const link = event.target.closest('a');
                link.href = `mailto:${email}`;
                window.location.href = `mailto:${email}`;
            }
        };
    }
    
    /**
     * Process a text string and replace link/email placeholders
     * Used by the content-manager
     * @param {string} text - Text to process
     * @returns {string} - Text with replaced placeholders
     */
    processText(text) {
        // Replace {{link:type}} with actual links
        text = text.replace(/\{\{link:([a-z]+)\}\}/g, (match, type) => {
            return this.getLink(type);
        });
        
        // Replace {{email}} with obfuscated email reference
        text = text.replace(/\{\{email\}\}/g, '[Click to reveal email](mailto:email)');
        
        return text;
    }
}

// Initialize when DOM is ready
domReady(function() {
    const contactManager = new ContactManager();
    contactManager.init();
    
    // Make contactManager accessible globally
    window.contactManager = contactManager;
});
