/**
 * Contact Manager
 * Handles loading and processing contact information from a separate file
 * Protects email and other sensitive information from automated scraping
 */

class ContactManager {
    constructor() {
        this.contactInfo = null;
        this.loaded = false;
        
        // Bind handlers to preserve 'this' context
        this.handleEmailClick = this.handleEmailClick.bind(this);
        this.handleSideMenuEmail = this.handleSideMenuEmail.bind(this);
        this.handleFooterEmail = this.handleFooterEmail.bind(this);
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
            
            // Notify content manager to refresh content with contact info
            if (window.contentManager) {
                window.contentManager.refreshContactInfo();
            }
            
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
                // Set the href and add target attributes for external links
                link.href = linkUrl;
                
                // Always open external links in a new tab
                if (linkUrl.startsWith('http') || linkUrl.startsWith('//')) {
                    link.setAttribute('target', '_blank');
                    link.setAttribute('rel', 'noopener noreferrer');
                }
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
        // Set global handlers for use in HTML onclick
        window.handleEmailClick = this.handleEmailClick;
        window.handleSideMenuEmail = this.handleSideMenuEmail;
        window.copyEmailToClipboard = this.copyEmailToClipboard;
        
        // Find existing email links and attach handlers
        document.querySelectorAll('.email-link:not(.sidemenu-email)').forEach(link => {
            // Remove existing handlers to avoid duplicates
            link.removeEventListener('click', this.handleEmailClick);
            link.removeEventListener('click', this.handleFooterEmail);
            
            // Status bar/footer email links are in the statusbar
            if (link.closest('.tui-statusbar')) {
                link.addEventListener('click', this.handleFooterEmail);
            } else {
                link.addEventListener('click', this.handleEmailClick);
            }
        });
        
        document.querySelectorAll('.sidemenu-email').forEach(link => {
            link.removeEventListener('click', this.handleSideMenuEmail);
            link.addEventListener('click', this.handleSideMenuEmail);
        });
    }
    
    /**
     * Copy email to clipboard
     * @param {string} email - Email to copy
     * @returns {Promise} - Promise that resolves when copying is complete
     */
    copyEmailToClipboard(email) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(email);
        } else {
            // Fallback for browsers without clipboard API
            const textarea = document.createElement('textarea');
            textarea.value = email;
            textarea.style.position = 'absolute';
            textarea.style.left = '-9999px';
            document.body.appendChild(textarea);
            textarea.select();
            
            try {
                document.execCommand('copy');
                return Promise.resolve();
            } catch (err) {
                return Promise.reject(err);
            } finally {
                document.body.removeChild(textarea);
            }
        }
    }
    
    /**
     * Handle standard email link click (Contact page)
     * First click reveals email, second click copies to clipboard
     * @param {Event} event - Click event
     */
    handleEmailClick(event) {
        event.preventDefault();
        const email = this.getEmail();
        const link = event.target.closest('.email-link');
        
        if (!link) return;
        
        // If the email is already displayed (link text contains the email)
        if (link.textContent.includes(email)) {
            // First, remove any existing copied indicators
            const existingIndicators = link.querySelectorAll('.copied-indicator');
            existingIndicators.forEach(indicator => indicator.remove());
            
            // Copy to clipboard
            this.copyEmailToClipboard(email).then(() => {
                // Show "Copied!" temporarily but keep the email visible
                const tempElement = document.createElement('span');
                tempElement.className = 'copied-indicator red-168-text'; // Changed to red
                tempElement.textContent = ' (Copied!)';
                link.appendChild(tempElement);
                
                // After 3 seconds, remove the "Copied!" indicator but keep email visible
                setTimeout(() => {
                    const indicator = link.querySelector('.copied-indicator');
                    if (indicator) {
                        indicator.remove();
                    }
                }, 3000);
            }).catch(err => {
                console.error('Could not copy text: ', err);
            });
        } else {
            // First click - reveal email
            if (link.querySelector('span')) {
                const spanElement = link.querySelector('span');
                const spanText = spanElement.textContent;
                link.innerHTML = `<span class="${spanElement.className}">${spanText}</span> ${email}`;
            } else {
                link.textContent = email;
            }
        }
    }
    
    /**
     * Handle sidemenu email link click
     * Special behavior for side menu that resets to "Email" text
     * @param {Event} event - Click event
     */
    handleSideMenuEmail(event) {
        event.preventDefault();
        const email = this.getEmail();
        const link = event.target.closest('.sidemenu-email');
        
        if (!link) return;
        
        // If the email is already displayed (link text contains the email)
        if (link.textContent.includes(email)) {
            // Copy to clipboard
            this.copyEmailToClipboard(email).then(() => {
                // Change text to "Copied"
                link.innerHTML = '<span class="red-168-text">E</span>mail <span class="red-168-text">(Copied!)</span>'; // Changed to red
                
                // After 3 seconds, revert back to just showing "Email"
                setTimeout(() => {
                    link.innerHTML = '<span class="red-168-text">E</span>mail';
                }, 3000);
            }).catch(err => {
                console.error('Could not copy text: ', err);
            });
        } else {
            // First click - reveal email
            link.innerHTML = '<span class="red-168-text">E</span>mail: ' + email;
            
            // Do NOT automatically reset after timeout - this was causing strange behavior
            // Let the user click again to copy and reset
        }
    }
    
    /**
     * Handle footer email link click (Footer behavior)
     * Similar to standard but preserves styling
     * @param {Event} event - Click event
     */
    handleFooterEmail(event) {
        event.preventDefault();
        const email = this.getEmail();
        const link = event.target.closest('.email-link');
        
        if (!link) return;
        
        // Get the F4 span if it exists
        const f4Span = link.querySelector('span.red-168-text');
        const f4Text = f4Span ? f4Span.outerHTML + ' ' : '';
        
        // If the email is already displayed (link text contains the email)
        if (link.textContent.includes(email)) {
            // First, remove any existing copied indicators
            const existingIndicators = link.querySelectorAll('.copied-indicator');
            existingIndicators.forEach(indicator => indicator.remove());
            
            // Copy to clipboard
            this.copyEmailToClipboard(email).then(() => {
                // Show "Copied!" temporarily but keep the email visible
                const tempElement = document.createElement('span');
                tempElement.className = 'copied-indicator red-168-text'; // Changed to red
                tempElement.textContent = ' (Copied!)';
                
                // Keep the F4 and email, just add the indicator
                link.innerHTML = f4Text + email;
                link.appendChild(tempElement);
                
                // After 3 seconds, remove the "Copied!" indicator but keep email visible
                setTimeout(() => {
                    const indicator = link.querySelector('.copied-indicator');
                    if (indicator) {
                        indicator.remove();
                    }
                }, 3000);
            }).catch(err => {
                console.error('Could not copy text: ', err);
            });
        } else {
            // First click - reveal email
            link.innerHTML = f4Text + email;
        }
    }
    
    /**
     * Process a text string and replace link/email placeholders
     * Used by the content-manager
     * @param {string} text - Text to process
     * @returns {string} - Text with replaced placeholders
     */
    processText(text) {
        // Replace markdown links that contain {{link:type}} placeholders
        text = text.replace(/\[([^\]]+)\]\(\{\{link:([a-z]+)\}\}\)/g, (match, linkText, type) => {
            const url = this.getLink(type);
            if (url === '#') return match; // Don't replace if link not found
            
            return `<a href="${url}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
        });
        
        // Replace any remaining {{link:type}} placeholders with just the URL
        text = text.replace(/\{\{link:([a-z]+)\}\}/g, (match, type) => {
            return this.getLink(type);
        });
        
        // Replace {{email}} with clickable email link
        text = text.replace(/\{\{email\}\}/g, '<a href="#" class="email-link">Click to reveal email</a>');
        
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
