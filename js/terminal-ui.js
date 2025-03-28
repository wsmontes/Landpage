/**
 * Terminal UI functionality for the portfolio
 */

// Handle responsive layout
function handleResponsiveLayout() {
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    const contentArea = document.querySelector('.content-area');
    
    // Detect iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                 (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    // Calculate proper height based on screen size
    if (windowWidth <= 767) { // Both small and tablet sizes
        // Mobile & tablets - scrollable body
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
        
        if (contentArea) {
            contentArea.style.height = 'auto';
            contentArea.style.maxHeight = 'none';
            contentArea.style.overflowY = 'visible';
            
            // Add iOS specific rules
            if (isIOS) {
                contentArea.style.webkitOverflowScrolling = 'touch';
                
                // Force redraw on iOS
                setTimeout(() => {
                    contentArea.style.display = 'none';
                    // Force reflow
                    void contentArea.offsetHeight;
                    contentArea.style.display = 'block';
                }, 50);
            }
        }
    } else {
        // Desktop - terminal style with fixed container
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        
        if (contentArea) {
            // Account for navbar, tabs, and status bar
            const navHeight = document.querySelector('.tui-nav')?.offsetHeight || 30;
            const tabsHeight = document.querySelector('.tui-tabs')?.offsetHeight || 30;
            const statusbarHeight = document.querySelector('.tui-statusbar')?.offsetHeight || 30;
            
            const availableHeight = windowHeight - navHeight - tabsHeight - statusbarHeight - 40;
            contentArea.style.height = `${availableHeight}px`;
            contentArea.style.overflowY = 'auto';
        }
    }
}

// Optimize navbar for different screen sizes
function optimizeNavbar() {
    const navbar = document.querySelector('.tui-nav');
    if (!navbar) return;
    
    const navItems = navbar.querySelector('ul');
    const clock = navbar.querySelector('.tui-datetime');
    const hamburger = navbar.querySelector('.tui-sidenav-button');
    
    // Ensure correct ordering and positioning
    if (hamburger) {
        hamburger.style.display = 'inline-block';
        hamburger.style.marginLeft = '5px';
    }
    
    if (clock) {
        clock.style.marginRight = '5px';
        clock.style.textAlign = 'right';
    }
    
    // Adjust navbar height on very small screens for better touch targets
    if (window.innerWidth <= 340) {
        navbar.style.height = '35px';
        if (hamburger) hamburger.style.fontSize = '1.3em';
    } else {
        navbar.style.height = '30px';
        if (hamburger) hamburger.style.fontSize = '1.2em';
    }
}

// Mobile touch optimizations
function initTouchOptimizations() {
    // Add passive touch handlers for better scrolling performance
    const contentArea = document.querySelector('.content-area');
    if (contentArea) {
        contentArea.addEventListener('touchstart', function() {}, {passive: true});
        contentArea.addEventListener('touchmove', function() {}, {passive: true});
    }
    
    // Make dropdown menus more touch-friendly
    const dropdowns = document.querySelectorAll('.tui-dropdown');
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('touchstart', function(e) {
            // Toggle dropdown on touch
            const content = this.querySelector('.tui-dropdown-content');
            if (content) {
                if (content.style.display === 'block') {
                    content.style.display = 'none';
                } else {
                    content.style.display = 'block';
                }
                e.preventDefault(); // Prevent immediate closing
            }
        });
    });
}

// Handle dropdown menu behavior
function setupDropdownBehavior() {
    const sourceCodeDropdown = document.querySelector('.source-code-dropdown .tui-dropdown');
    const dropdownContent = document.querySelector('.source-code-dropdown .tui-dropdown-content');
    
    if (!sourceCodeDropdown || !dropdownContent) return;
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        // Check if click is outside the dropdown
        if (!sourceCodeDropdown.contains(event.target)) {
            dropdownContent.style.display = 'none';
        }
    });
    
    // Prevent dropdown from closing when clicking inside it
    dropdownContent.addEventListener('click', function(event) {
        event.stopPropagation();
    });
    
    // Toggle dropdown when clicking the trigger
    const dropdownTrigger = sourceCodeDropdown.querySelector('a');
    if (dropdownTrigger) {
        dropdownTrigger.addEventListener('click', function(event) {
            // Toggle display
            const isVisible = dropdownContent.style.display === 'block';
            dropdownContent.style.display = isVisible ? 'none' : 'block';
            event.preventDefault();
            event.stopPropagation();
        });
    }
}

/**
 * Initialize two-touch behavior for mobile footer
 * First touch: Show text, Second touch: Follow link
 */
function initTwoTouchFooter() {
    if (window.innerWidth > 575) return; // Only for mobile
    
    const footerItems = document.querySelectorAll('.tui-statusbar ul li');
    
    footerItems.forEach(item => {
        const link = item.querySelector('a');
        if (!link) return;
        
        // Remove existing click handlers to prevent conflicts
        item.removeEventListener('click', handleFooterItemClick);
        
        // Add new click handler
        item.addEventListener('click', handleFooterItemClick);
    });
}

/**
 * Handle click on footer item for two-touch behavior
 */
function handleFooterItemClick(e) {
    const item = this;
    const link = item.querySelector('a');
    
    // If this is the source code dropdown, handle differently
    const isSourceCode = item.classList.contains('source-code-dropdown');
    
    // Check if this is the first touch (not expanded yet)
    if (!item.classList.contains('touch-expanded')) {
        e.preventDefault(); // Prevent default action
        e.stopPropagation(); // Stop event propagation
        
        // Remove expanded class from all items
        document.querySelectorAll('.tui-statusbar ul li').forEach(i => {
            i.classList.remove('touch-expanded');
        });
        
        // Add expanded class to this item
        item.classList.add('touch-expanded');
        
        // Set a higher flex value to show the text
        item.style.flex = '3';
        
        // Show the text
        const textSpan = link.querySelector('span + span');
        if (textSpan) {
            textSpan.style.position = 'static';
            textSpan.style.opacity = '1';
            textSpan.style.marginLeft = '4px';
        }
        
        // Make the link work on second touch
        if (link) {
            link.classList.add('touch-expanded');
        }
        return;
    }
    
    // Let the event propagate for the second touch (link will work normally)
}

// Initialize terminal UI
function initTerminalUI() {
    // Initial setup
    handleResponsiveLayout();
    optimizeNavbar();
    initTouchOptimizations();
    setupDropdownBehavior(); // Add this line to initialize dropdown behavior
    initTwoTouchFooter(); // Initialize two-touch behavior for mobile footer
    
    // Add event listeners for window resize
    window.addEventListener('resize', function() {
        handleResponsiveLayout();
        optimizeNavbar();
        initTwoTouchFooter(); // Re-initialize two-touch behavior when screen size changes
    });
    
    // Handle iOS orientation changes specifically
    window.addEventListener('orientationchange', function() {
        // Allow time for the orientation change to complete
        setTimeout(handleResponsiveLayout, 100);
    });
}

// Run when DOM is loaded
document.addEventListener('DOMContentLoaded', initTerminalUI);
