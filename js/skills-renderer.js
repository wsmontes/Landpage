/**
 * Skills Renderer
 * Specialized module for rendering skills with DOS-style visualization
 */

class SkillsRenderer {
    constructor() {
        // Empty constructor as we don't need state
        console.log("Skills renderer initialized");
        this.expandedSubskill = null;
        this.setupDocumentClickListener();
        this.subskillContents = {}; // Store subskill contents from the main file
    }

    /**
     * Generate HTML for a skill bar with DOS-style file directory
     * @param {string} skillName - Name of the skill
     * @param {number} years - Years of experience 
     * @param {string} colorClass - Color class (without the -168 suffix)
     * @param {number} maxYears - Maximum years for the bar scale
     * @param {string[]} subSkills - Array of sub-skills
     * @returns {string} - HTML for the skill bar
     */
    renderSkill(skillName, years, colorClass, maxYears = 10, subSkills = []) {
        // Generate the ASCII skill bar
        let barFilled = '';
        let barEmpty = '';
        
        // Create filled portion using full blocks
        for (let f = 0; f < years; f++) {
            barFilled += '█';
        }
        
        // Create empty portion using medium shade blocks
        for (let e = 0; e < (maxYears - years); e++) {
            barEmpty += '▒';
        }
        
        // Create the skill info HTML (left side)
        const skillInfoHtml = `
        <div class="skill-info">
            <div class="yellow-168-text skill-name">${skillName}</div>
            <div class="skill-year-container">
                <div class="skill-meter">
                    <span class="skill-year-bar ${colorClass}-168-text">[${barFilled}<span class="white-168-text">${barEmpty}</span>]</span>
                    <span class="skill-year-label cyan-168-text">${years} Years</span>
                </div>
            </div>
        </div>`;
        
        // Create DOS-style file directory listing if there are sub-skills
        let subSkillsHtml = '';
        if (subSkills.length > 0) {
            subSkillsHtml = this.renderSubSkills(skillName, subSkills);
        }
        
        // Combine the parts
        return `<div class="skill-bar">${skillInfoHtml}${subSkillsHtml}</div>`;
    }
    
    /**
     * Generate HTML for a DOS-style file directory of sub-skills
     * @param {string} skillName - Name of the parent skill 
     * @param {string[]} subSkills - Array of sub-skills
     * @returns {string} - HTML for the DOS-style directory
     */
    renderSubSkills(skillName, subSkills) {
        if (!subSkills.length) return '';
        
        // Make directory name from the full skill name, replacing spaces with underscores
        const volumeName = skillName.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '');
        
        // Start building the directory listing - removed command line header
        let html = `
        <div class="skill-files">
            <div class="skill-files-list">
                <div class="white-168-text" style="margin-bottom: 5px;">Directory of C:\\${volumeName}</div>`;
        
        // Generate each sub-skill as a "file"
        for (let i = 0; i < subSkills.length; i++) {
            // Use alternating colors for the files
            const fileColor = i % 2 === 0 ? 'cyan' : 'green';
            
            // Clean up the sub-skill name for a DOS-compatible filename
            let fileName = subSkills[i].trim().toUpperCase().replace(/[^A-Z0-9]/g, '_');
            
            // Create a data attribute for skill identification
            const skillId = `${skillName.replace(/\s+/g, '_')}_${fileName}`.replace(/[^a-zA-Z0-9_]/g, '_');
            
            html += `
                <div class="skill-file" data-skill-id="${skillId}" data-skill-name="${skillName}" data-subskill-name="${subSkills[i].trim()}">
                    <span class="${fileColor}-168-text skill-file-icon">■</span>
                    <span class="${fileColor}-168-text skill-file-name">${fileName}</span>
                    <div class="subskill-content" id="subskill-content-${skillId}" style="display: none;">
                        <div class="subskill-loading">Loading...</div>
                    </div>
                </div>`;
        }
        
        // Close the HTML structure without adding volume information
        html += `
            </div>
        </div>`;
        
        return html;
    }
    
    /**
     * Parse a skill line from content file
     * Format: @skill:Name:Years:Color:MaxYears@SubSkill1@SubSkill2...
     * @param {string} line - Line to parse
     * @returns {object|null} - Parsed skill object or null if invalid
     */
    parseSkillLine(line) {
        if (!line.startsWith('@skill:')) return null;
        
        // Split the main parts by colon
        const mainParts = line.substring(7).split(':');
        if (mainParts.length < 3) return null;
        
        // Initialize the skill object
        const skill = {
            name: mainParts[0],
            years: parseInt(mainParts[1], 10),
            color: mainParts[2],
            maxYears: 10,
            subSkills: []
        };
        
        // Handle the maxYears and subSkills part
        if (mainParts.length >= 4) {
            // The fourth part may contain both maxYears and subSkills
            const fourthPart = mainParts[3];
            
            if (fourthPart.includes('@')) {
                // It contains subSkills
                const parts = fourthPart.split('@');
                
                // First part might be maxYears
                if (parts[0] && !isNaN(parseInt(parts[0], 10))) {
                    skill.maxYears = parseInt(parts[0], 10);
                }
                
                // Rest are subSkills
                skill.subSkills = parts.slice(1).filter(s => s.trim() !== '');
            } else {
                // It's just maxYears
                skill.maxYears = parseInt(fourthPart, 10);
            }
        }
        
        // Handle old format or additional parts
        if (mainParts.length >= 5) {
            const subSkillsPart = mainParts[4];
            if (subSkillsPart.includes('@')) {
                const additionalSubSkills = subSkillsPart.split('@').filter(s => s.trim() !== '');
                skill.subSkills = skill.subSkills.concat(additionalSubSkills);
            }
        }
        
        console.log('Parsed skill:', skill); // For debugging
        return skill;
    }
    
    /**
     * Parse the skills content and extract subskill detailed content
     * @param {string} content - The full skills.txt content
     */
    parseSkillsContent(content) {
        if (!content) return;
        
        // Split into lines for processing
        const lines = content.split('\n');
        let currentParentSkill = null;
        let currentSubskill = null;
        let collectingContent = false;
        let currentContent = '';
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Detect skill definition
            if (line.startsWith('@skill:')) {
                const skillLine = this.parseSkillLine(line);
                if (skillLine) {
                    currentParentSkill = skillLine.name;
                }
                continue;
            }
            
            // Detect subskill content start
            if (line.startsWith('@subskill:')) {
                // Save previous subskill content if we were collecting it
                if (collectingContent && currentParentSkill && currentSubskill) {
                    this.saveSubskillContent(currentParentSkill, currentSubskill, currentContent);
                }
                
                // Parse new subskill definition
                const parts = line.substring(10).split(':');
                if (parts.length >= 2) {
                    currentParentSkill = parts[0];
                    currentSubskill = parts[1];
                    collectingContent = true;
                    currentContent = '';
                }
                continue;
            }
            
            // Detect subskill content end
            if (line === '@endsubskill') {
                if (collectingContent && currentParentSkill && currentSubskill) {
                    this.saveSubskillContent(currentParentSkill, currentSubskill, currentContent);
                }
                collectingContent = false;
                currentContent = '';
                continue;
            }
            
            // Collect content if we're inside a subskill definition
            if (collectingContent) {
                currentContent += line + '\n';
            }
        }
        
        // Save any remaining content
        if (collectingContent && currentParentSkill && currentSubskill) {
            this.saveSubskillContent(currentParentSkill, currentSubskill, currentContent);
        }
    }
    
    /**
     * Save extracted subskill content to the cache
     * @param {string} parentSkill - Parent skill name
     * @param {string} subskill - Subskill name
     * @param {string} content - Content for the subskill
     */
    saveSubskillContent(parentSkill, subskill, content) {
        // Create a unique key for this subskill
        const key = `${parentSkill}_${subskill}`.replace(/\s+/g, '_');
        this.subskillContents[key] = content.trim();
    }
    
    /**
     * Setup event listeners for subskill click functionality
     * This should be called after the skills are rendered to the DOM
     */
    setupSubskillListeners() {
        document.querySelectorAll('.skill-file').forEach(file => {
            // Remove existing listeners to prevent duplicates
            file.removeEventListener('click', this.handleSubskillClick);
            
            // Add click listener
            file.addEventListener('click', (e) => this.handleSubskillClick(e));
        });
    }
    
    /**
     * Handle click on a subskill file
     * @param {Event} e - Click event
     */
    handleSubskillClick(e) {
        // Get the skill file element
        const skillFile = e.currentTarget;
        const skillId = skillFile.getAttribute('data-skill-id');
        const skillName = skillFile.getAttribute('data-skill-name');
        const subskillName = skillFile.getAttribute('data-subskill-name');
        
        // Get the content container
        const contentContainer = skillFile.querySelector('.subskill-content');
        
        // If we're clicking the same skill that's already expanded, just close it
        if (this.expandedSubskill === skillId && contentContainer.style.display !== 'none') {
            contentContainer.style.display = 'none';
            this.expandedSubskill = null;
            return;
        }
        
        // Close any previously opened subskill
        if (this.expandedSubskill) {
            const previousContent = document.querySelector(`#subskill-content-${this.expandedSubskill}`);
            if (previousContent) {
                previousContent.style.display = 'none';
            }
        }
        
        // Set this as the expanded subskill
        this.expandedSubskill = skillId;
        
        // Show the content container
        contentContainer.style.display = 'block';
        
        // Load content if it hasn't been loaded yet
        if (contentContainer.querySelector('.subskill-loading')) {
            this.loadSubskillContent(skillName, subskillName, contentContainer);
        }
        
        // Prevent the event from bubbling up to document
        e.stopPropagation();
    }
    
    /**
     * Load content for a specific subskill
     * @param {string} skillName - Name of the parent skill
     * @param {string} subskillName - Name of the subskill
     * @param {HTMLElement} container - Container to load content into
     */
    loadSubskillContent(skillName, subskillName, container) {
        // First check if we have the content in our cache
        const key = `${skillName}_${subskillName}`.replace(/\s+/g, '_');
        
        if (this.subskillContents[key]) {
            // We have pre-loaded content from the main skills file
            let text = this.subskillContents[key];
            
            // If content manager is available, process links and other formatting
            if (window.contentManager) {
                text = window.contentManager.parseTextToHtml(text);
            }
            
            // Update the container with the content
            container.innerHTML = `<div class="subskill-content-inner white-168-text">${text}</div>`;
            return;
        }
        
        // Fallback to the old method of fetching separate files
        const fileName = `${skillName.replace(/\s+/g, '_')}_${subskillName.replace(/\s+/g, '_')}`.replace(/[^a-zA-Z0-9_]/g, '_');
        const filePath = `content/subskills/${fileName}.txt`;
        
        // Fetch the content
        fetch(filePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`No content available for ${subskillName}`);
                }
                return response.text();
            })
            .then(text => {
                // If content manager is available, process links and other formatting
                if (window.contentManager) {
                    text = window.contentManager.parseTextToHtml(text);
                }
                
                // Update the container with the content
                container.innerHTML = `<div class="subskill-content-inner white-168-text">${text}</div>`;
            })
            .catch(error => {
                // Show placeholder content for missing files
                container.innerHTML = `
                <div class="subskill-content-inner">
                    <p class="cyan-168-text">${subskillName}</p>
                    <p class="white-168-text">Detailed information about ${subskillName} within ${skillName}.</p>
                    <p class="yellow-168-text">Add content using the @subskill:${skillName}:${subskillName} format in skills.txt</p>
                </div>`;
            });
    }
    
    /**
     * Setup a document-wide click listener to close expanded subskill when clicking outside
     */
    setupDocumentClickListener() {
        document.addEventListener('click', (e) => {
            // If we have an expanded subskill and click is outside any skill file
            if (this.expandedSubskill && !e.target.closest('.skill-file')) {
                const contentContainer = document.querySelector(`#subskill-content-${this.expandedSubskill}`);
                if (contentContainer) {
                    contentContainer.style.display = 'none';
                }
                this.expandedSubskill = null;
            }
        });
    }
}

// Initialize skills renderer as soon as the script loads
const skillsRenderer = new SkillsRenderer();

// Make it globally available
window.skillsRenderer = skillsRenderer;

// Also initialize when DOM is ready to ensure it's available
document.addEventListener('DOMContentLoaded', function() {
    console.log('Skills renderer ready');
    window.skillsRenderer = skillsRenderer;
    
    // Load the skills content to extract subskill details
    fetch('content/skills.txt')
        .then(response => response.text())
        .then(content => {
            window.skillsRenderer.parseSkillsContent(content);
        })
        .catch(error => {
            console.error('Error loading skills content:', error);
        })
        .finally(() => {
            // Setup additional functionality after content is loaded
            setTimeout(() => {
                window.skillsRenderer.setupSubskillListeners();
            }, 1000);
        });
});
