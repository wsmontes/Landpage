/**
 * Content Manager
 * Handles loading content from txt files and parsing them into HTML
 */

class ContentManager {
    constructor() {
        this.contentPath = 'content/';
        // Change 'experience' to 'projects' to match the HTML tab ID
        this.sections = ['about', 'skills', 'projects', 'contact'];
        // Map sections to their content files if different
        this.sectionFiles = {
            'projects': 'experience'
        };
        this.contentCache = {};
        this.lastUpdated = {};
    }

    /**
     * Initialize the content manager
     */
    init() {
        // Load all content initially
        this.loadAllContent();
        
        // Add refresh button to each section
        this.addRefreshButtons();
        
        // Add keyboard shortcut for refresh (Ctrl+R)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                this.refreshCurrentSection();
            }
        });
    }

    /**
     * Add refresh buttons to each section
     */
    addRefreshButtons() {
        const tabContents = document.querySelectorAll('.tui-tab-content');
        tabContents.forEach(content => {
            const refreshButton = document.createElement('button');
            refreshButton.className = 'tui-button refresh-button';
            refreshButton.innerHTML = '↻ Refresh';
            refreshButton.addEventListener('click', () => {
                this.refreshSection(content.id);
            });
            
            // Add button to the section header
            const header = content.querySelector('h3') || content.querySelector('div');
            if (header) {
                header.style.position = 'relative';
                refreshButton.style.position = 'absolute';
                refreshButton.style.right = '10px';
                refreshButton.style.top = '0';
                header.appendChild(refreshButton);
            } else {
                content.insertBefore(refreshButton, content.firstChild);
            }
        });
    }

    /**
     * Refresh the currently visible section
     */
    refreshCurrentSection() {
        const activeTab = document.querySelector('.tui-tab.active');
        if (activeTab) {
            const section = activeTab.getAttribute('data-tab-content');
            this.refreshSection(section);
        }
    }

    /**
     * Refresh a specific section's content
     * @param {string} section - Section ID to refresh
     */
    refreshSection(section) {
        // Add loading indicator
        const sectionElement = document.getElementById(section);
        const contentArea = sectionElement.querySelector('.section-content');
        
        if (contentArea) {
            contentArea.innerHTML = '<div class="loading">Loading content...</div>';
            
            // Force browser to ignore cache
            this.loadContent(section, true)
                .then(() => {
                    // Update last updated timestamp
                    this.lastUpdated[section] = new Date();
                    
                    // Update footer with last updated time if exists
                    const footer = sectionElement.querySelector('.content-footer');
                    if (footer) {
                        footer.textContent = `Last updated: ${this.lastUpdated[section].toLocaleString()}`;
                    } else {
                        const newFooter = document.createElement('div');
                        newFooter.className = 'content-footer';
                        newFooter.textContent = `Last updated: ${this.lastUpdated[section].toLocaleString()}`;
                        sectionElement.appendChild(newFooter);
                    }
                });
        }
    }

    /**
     * Refresh content that depends on contact info
     * Called when contact manager is loaded
     */
    refreshContactInfo() {
        // Reload contact section specifically
        this.refreshSection('contact');
        
        // If any other sections use contact info, reload them too
        // For example, if about section has contact info:
        // this.refreshSection('about');
    }

    /**
     * Load all content sections
     */
    loadAllContent() {
        this.sections.forEach(section => {
            this.loadContent(section);
        });
    }

    /**
     * Load content for a specific section
     * @param {string} section - Section ID to load
     * @param {boolean} forceRefresh - Whether to force refresh from server
     * @returns {Promise} - Promise that resolves when content is loaded
     */
    loadContent(section, forceRefresh = false) {
        // Get the correct file name (may be different from section ID)
        const fileName = this.sectionFiles[section] || section;
        const url = `${this.contentPath}${fileName}.txt${forceRefresh ? '?t=' + new Date().getTime() : ''}`;
        
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load ${section} content`);
                }
                return response.text();
            })
            .then(text => {
                // Cache the content
                this.contentCache[section] = text;
                
                // Parse and render the content
                this.renderContent(section, text);
                
                // Update last updated time
                this.lastUpdated[section] = new Date();
            })
            .catch(error => {
                console.error('Error loading content:', error);
                // Display error in the section
                const sectionElement = document.getElementById(section);
                const contentArea = sectionElement.querySelector('.section-content');
                if (contentArea) {
                    contentArea.innerHTML = `<div class="error">Failed to load content: ${error.message}</div>`;
                }
            });
    }

    /**
     * Parse and render content for a section
     * @param {string} section - Section ID to render
     * @param {string} text - Text content to parse and render
     */
    renderContent(section, text) {
        const sectionElement = document.getElementById(section);
        const contentArea = sectionElement.querySelector('.section-content');
        
        if (contentArea) {
            // Process text with contact manager if available
            if (window.contactManager && window.contactManager.loaded) {
                text = window.contactManager.processText(text);
            }
            
            // Parse the text content and convert to HTML
            const html = this.parseTextToHtml(text);
            contentArea.innerHTML = html;
            
            // Add footer with last updated time
            const footer = document.createElement('div');
            footer.className = 'content-footer';
            footer.textContent = `Last updated: ${this.lastUpdated[section] ? this.lastUpdated[section].toLocaleString() : new Date().toLocaleString()}`;
            contentArea.appendChild(footer);
            
            // Reattach event handlers for newly created email links
            if (window.contactManager && window.contactManager.loaded) {
                window.contactManager.setupEmailHandlers();
            }
        }
    }

    /**
     * Parse text content with custom format to HTML
     * @param {string} text - Text content to parse
     * @returns {string} - HTML representation of the text
     */
    parseTextToHtml(text) {
        // Process line by line
        const lines = text.split('\n');
        let html = '';
        let inCodeBlock = false;
        let inTableBlock = false;
        let inPanelBlock = false;
        let currentPanel = '';
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            
            // Skip empty lines outside of special blocks
            if (!line && !inCodeBlock && !inTableBlock && !inPanelBlock) {
                html += '<br>';
                continue;
            }
            
            // Handle code blocks
            if (line === '```') {
                if (inCodeBlock) {
                    html += '</pre>';
                    inCodeBlock = false;
                } else {
                    html += '<pre class="white-255-text">';
                    inCodeBlock = true;
                }
                continue;
            }
            
            // Inside code block
            if (inCodeBlock) {
                html += line + '\n';
                continue;
            }
            
            // Handle table blocks
            if (line === '@table') {
                html += '<table class="tui-table contact-table"><tbody>';
                inTableBlock = true;
                continue;
            }
            
            if (inTableBlock && line === '@end') {
                html += '</tbody></table>';
                inTableBlock = false;
                continue;
            }
            
            if (inTableBlock) {
                // Parse table row: column1|column2
                const cells = line.split('|');
                if (cells.length >= 2) {
                    html += '<tr>';
                    html += `<td class="yellow-168-text">${this.parseInlineFormatting(cells[0])}</td>`;
                    html += `<td>${this.parseInlineFormatting(cells[1])}</td>`;
                    html += '</tr>';
                }
                continue;
            }
            
            // Handle panel blocks
            if (line.startsWith('@panel:')) {
                const title = line.substring(7).trim();
                html += `
                <div class="project-card tui-panel white-168">
                    <div class="tui-panel-header">
                        <span class="tui-panel-title blue-255-text">${title}</span>
                    </div>
                    <div class="tui-panel-content black-255-text">`;
                inPanelBlock = true;
                currentPanel = '';
                continue;
            }
            
            if (inPanelBlock && line === '@end') {
                // Process the panel content
                const panelLines = currentPanel.split('\n');
                let panelHtml = '';
                
                // First line is the description
                if (panelLines.length > 0) {
                    panelHtml += `<p>${this.parseInlineFormatting(panelLines[0])}</p><br>`;
                }
                
                // Remaining lines are key-value pairs
                for (let j = 1; j < panelLines.length; j++) {
                    if (panelLines[j].includes(':')) {
                        const [key, value] = panelLines[j].split(':', 2);
                        panelHtml += `<div><span class="red-168-text">${key}:</span> ${value.trim()}</div>`;
                    } else {
                        panelHtml += `<div>${panelLines[j]}</div>`;
                    }
                }
                
                html += panelHtml;
                html += '</div></div>';
                inPanelBlock = false;
                continue;
            }
            
            if (inPanelBlock) {
                currentPanel += line + '\n';
                continue;
            }
            
            // Handle skill bars
            if (line.startsWith('@skill:')) {
                const parts = line.substring(7).split(':');
                if (parts.length >= 3) {
                    const skillName = parts[0];
                    const percentage = parts[1];
                    const colorClass = parts[2] + '-168';
                    
                    html += `
                    <div class="skill-bar">
                        <span class="yellow-168-text">${skillName}</span>
                        <div class="tui-progress-bar inline-block valign-middle" style="width: 300px; margin-left: 20px;">
                            <span class="tui-progress-label black-text">${percentage}%</span>
                            <span class="tui-progress ${colorClass}" style="width: ${percentage}%"></span>
                        </div>
                    </div>`;
                }
                continue;
            }
            
            // Handle headings
            if (line.startsWith('# ')) {
                const heading = line.substring(2);
                html += `<h3 class="cyan-168-text">${heading}</h3>`;
                continue;
            }
            
            if (line.startsWith('## ')) {
                const heading = line.substring(3);
                html += `<h4 class="cyan-168-text">${heading}</h4>`;
                continue;
            }
            
            // Handle dividers
            if (line === '---') {
                html += '<div class="tui-divider"></div>';
                continue;
            }
            
            // Handle colored text
            if (line.startsWith('$')) {
                const match = line.match(/^\$([a-z]+):(.*)/);
                if (match) {
                    const color = match[1];
                    const text = match[2];
                    html += `<div class="${color}-168-text">${text}</div>`;
                    continue;
                }
            }
            
            // Regular paragraph text
            html += `<p>${this.parseInlineFormatting(line)}</p>`;
        }
        
        return html;
    }

    /**
     * Parse inline formatting like bold, italic, links
     * @param {string} text - Text to parse
     * @returns {string} - HTML with inline formatting
     */
    parseInlineFormatting(text) {
        // Convert markdown-style links: [text](url)
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
        
        // Convert bold: **text** or __text__
        text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');
        
        // Convert italic: *text* or _text_
        text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        text = text.replace(/_([^_]+)_/g, '<em>$1</em>');
        
        return text;
    }
}

// Initialize the content manager when the DOM is ready
domReady(function() {
    const contentManager = new ContentManager();
    contentManager.init();
    
    // Make contentManager accessible globally
    window.contentManager = contentManager;
});
