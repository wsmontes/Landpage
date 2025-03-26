/**
 * Terminal UI functionality for the portfolio
 */

// Handle responsive layout
function handleResponsiveLayout() {
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    const contentArea = document.querySelector('.content-area');
    
    // Calculate proper height based on screen size
    if (windowWidth <= 575) {
        // Small phones - scrollable body
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
        
        if (contentArea) {
            contentArea.style.height = 'auto';
            contentArea.style.maxHeight = 'none';
            contentArea.style.overflowY = 'visible';
        }
    } else if (windowWidth <= 767) {
        // Tablets - scrollable body with some constraints
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
        
        if (contentArea) {
            contentArea.style.height = 'auto';
            contentArea.style.maxHeight = `${windowHeight - 150}px`;
            contentArea.style.overflowY = 'visible';
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

// Initialize terminal UI
function initTerminalUI() {
    // Initial setup
    handleResponsiveLayout();
    optimizeNavbar();
    initTouchOptimizations();
    
    // Add event listeners for window resize
    window.addEventListener('resize', function() {
        handleResponsiveLayout();
        optimizeNavbar();
    });
}

// Run when DOM is loaded
document.addEventListener('DOMContentLoaded', initTerminalUI);
