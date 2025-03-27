/**
 * Skills Renderer
 * Specialized module for rendering skills with DOS-style visualization
 */

class SkillsRenderer {
    constructor() {
        // Empty constructor as we don't need state
        console.log("Skills renderer initialized");
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
        
        // Make a DOS-style drive volume name from the skill name
        const volumeName = skillName.toUpperCase().replace(/[^A-Z0-9]/g, '_').substring(0, 8);
        
        // Current date in DOS format MM-DD-YYYY
        const now = new Date();
        const dosDate = `${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}-${now.getFullYear()}`;
        
        // Start building the directory listing
        let html = `
        <div class="skill-files">
            <div class="skill-files-header white-168-text">C:\\${volumeName}> DIR /W<span class="dos-cursor">_</span></div>
            <div class="skill-files-list">
                <div class="white-168-text" style="margin-bottom: 5px;">Directory of C:\\${volumeName}</div>`;
        
        // Generate each sub-skill as a "file"
        for (let i = 0; i < subSkills.length; i++) {
            // Generate a random "file size" between 4KB and 64KB
            const fileSize = Math.floor(Math.random() * 60000) + 4000;
            
            // Use alternating colors for the files
            const fileColor = i % 2 === 0 ? 'cyan' : 'green';
            
            // Clean up the sub-skill name for a DOS-compatible filename (8.3 format)
            let fileName = subSkills[i].trim().toUpperCase().replace(/[^A-Z0-9]/g, '_');
            // Ensure maximum 8 chars for name
            if (fileName.length > 8) fileName = fileName.substring(0, 8);
            
            html += `
                <div class="skill-file">
                    <span class="${fileColor}-168-text skill-file-icon">■</span>
                    <span class="${fileColor}-168-text skill-file-name">${fileName}</span>
                    <span class="white-168-text skill-file-ext">.DLL</span>
                    <span class="skill-file-size">${fileSize} bytes</span>
                    <span class="white-168-text" style="margin-left: 10px;">${dosDate}</span>
                </div>`;
        }
        
        // Add volume information as a footer (like in DOS)
        const totalFiles = subSkills.length;
        const bytesUsed = subSkills.reduce((total, _) => {
            return total + Math.floor(Math.random() * 60000) + 4000;
        }, 0);
        const freeSpace = 655360 - bytesUsed; // 640KB ought to be enough for anybody
        
        html += `
                <div class="skill-volume-info">
                    <div>${totalFiles} file(s) ${bytesUsed.toLocaleString()} bytes</div>
                    <div>${freeSpace.toLocaleString()} bytes free</div>
                </div>
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
}

// Initialize skills renderer as soon as the script loads
const skillsRenderer = new SkillsRenderer();

// Make it globally available
window.skillsRenderer = skillsRenderer;

// Also initialize when DOM is ready to ensure it's available
document.addEventListener('DOMContentLoaded', function() {
    console.log('Skills renderer ready');
    window.skillsRenderer = skillsRenderer;
});
