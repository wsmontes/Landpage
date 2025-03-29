/**
 * Debug Helper
 * Utility functions for debugging the portfolio site
 */

// Enable debug mode
const DEBUG_MODE = false;

// Create a debug console logger that can be toggled
function debugLog(...args) {
    if (DEBUG_MODE) {
        console.log('[DEBUG]', ...args);
    }
}

// Function to inspect an object's contents
function inspectObject(obj, label = 'Object Inspection') {
    if (!DEBUG_MODE) return;
    
    console.group(label);
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            console.log(`${key}:`, obj[key]);
        }
    }
    console.groupEnd();
}

// Create a visual debug panel
function createDebugPanel() {
    if (!DEBUG_MODE) return;
    
    const panel = document.createElement('div');
    panel.style.position = 'fixed';
    panel.style.bottom = '50px';
    panel.style.right = '10px';
    panel.style.backgroundColor = 'rgba(0,0,0,0.8)';
    panel.style.color = '#00ff00';
    panel.style.padding = '10px';
    panel.style.zIndex = '9999';
    panel.style.fontSize = '12px';
    panel.style.fontFamily = 'monospace';
    panel.style.maxHeight = '200px';
    panel.style.overflowY = 'auto';
    panel.style.border = '1px solid #00aa00';
    panel.style.width = '300px';
    panel.id = 'debug-panel';
    
    const header = document.createElement('div');
    header.textContent = 'DEBUG CONSOLE';
    header.style.borderBottom = '1px solid #00aa00';
    header.style.marginBottom = '5px';
    header.style.paddingBottom = '5px';
    
    const content = document.createElement('div');
    content.id = 'debug-content';
    
    panel.appendChild(header);
    panel.appendChild(content);
    
    document.body.appendChild(panel);
    
    return panel;
}

// Add message to the debug panel
function addDebugMessage(message, type = 'info') {
    if (!DEBUG_MODE) return;
    
    const panel = document.getElementById('debug-panel') || createDebugPanel();
    const content = document.getElementById('debug-content');
    
    const messageElem = document.createElement('div');
    messageElem.style.marginBottom = '3px';
    
    // Color based on message type
    switch (type) {
        case 'error':
            messageElem.style.color = '#ff0000';
            break;
        case 'warning':
            messageElem.style.color = '#ffff00';
            break;
        case 'success':
            messageElem.style.color = '#00ff00';
            break;
        default:
            messageElem.style.color = '#00aaaa';
    }
    
    messageElem.textContent = `${new Date().toLocaleTimeString()} - ${message}`;
    content.appendChild(messageElem);
    
    // Auto-scroll to bottom
}

// Initialize the debug tools when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (DEBUG_MODE) {
        // Comment out the debug panel creation
        // createDebugPanel();
        addDebugMessage('Debug tools initialized', 'success');
        
        // Check if the required components are loaded
        setTimeout(() => {
            if (window.skillsRenderer) {
                addDebugMessage('Skills renderer is available', 'success');
            } else {
                addDebugMessage('Skills renderer is NOT available!', 'error');
            }
            
            if (window.contentManager) {
                addDebugMessage('Content manager is available', 'success');
            } else {
                addDebugMessage('Content manager is NOT available!', 'error');
            }
        }, 1000);
    }
});

// Make the debug functions globally available
window.debugLog = debugLog;
window.inspectObject = inspectObject;
window.addDebugMessage = addDebugMessage;


});
