// Tab navigation functionality
function initTabNavigation() {
    document.querySelectorAll('.tui-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            // Hide all tab content
            document.querySelectorAll('.tui-tab-content').forEach(content => {
                content.style.display = 'none';
            });
            
            // Remove active class from all tabs
            document.querySelectorAll('.tui-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Show the selected tab content and mark tab as active
            const contentId = this.getAttribute('data-tab-content');
            document.getElementById(contentId).style.display = 'block';
            this.classList.add('active');
        });
    });
    
    // Show initial tab
    document.getElementById('about').style.display = 'block';
}

// Handle anchor links for navigation
function initAnchorLinks() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            
            // Trigger click on corresponding tab
            const tabElement = document.querySelector(`.tui-tab[data-tab-content="${targetId}"]`);
            if (tabElement) {
                tabElement.click();
                
                // For mobile: Close sidenav when a menu item is clicked
                if (window.innerWidth <= 768) {
                    const sidenav = document.querySelector('.tui-sidenav');
                    if (sidenav && sidenav.classList.contains('active')) {
                        sidenav.classList.remove('active');
                    }
                }
            }
        });
    });
}

// Responsive layout adjustments
function handleResize() {
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    const contentArea = document.querySelector('.content-area');
    const navHeight = document.querySelector('.tui-nav').offsetHeight;
    const tabsHeight = document.querySelector('.tui-tabs').offsetHeight;
    const statusbarHeight = document.querySelector('.tui-statusbar').offsetHeight;
    
    if (window.innerWidth <= 768) {
        // Mobile: scrolling happens on the body instead
        contentArea.style.height = 'auto';
        contentArea.style.maxHeight = 'none';
        
        // Reset body/html overflow for mobile
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
    } else {
        // Desktop: calculate exact content area height
        const availableHeight = windowHeight - navHeight - tabsHeight - statusbarHeight - 40;
        contentArea.style.height = `${availableHeight}px`;
        
        // Keep the terminal-like overflow only on desktop
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
    }
    
    // Adjust project cards layout on large screens
    if (windowWidth >= 1600) {
        const projectCards = document.querySelectorAll('#projects .project-card');
        const projectsContainer = document.querySelector('#projects .section-content');
        
        if (projectCards.length > 0 && projectsContainer) {
            projectsContainer.style.display = 'block';
            projectCards.forEach(card => {
                card.style.display = 'inline-block';
                card.style.width = 'calc(50% - 20px)';
                card.style.margin = '10px';
            });
        }
    }
}

// Email obfuscation function
function revealEmail(event) {
    event.preventDefault();
    const user = "wmontes";
    const domain = "gmail.com";
    const email = user + "@" + domain;
    
    // Update all email links
    document.querySelectorAll('.email-link').forEach(link => {
        link.href = "mailto:" + email;
        
        // Keep any styled spans inside
        if (link.querySelector('span')) {
            const spanElement = link.querySelector('span');
            const spanText = spanElement.textContent;
            link.innerHTML = `<span class="${spanElement.className}">${spanText}</span>mail: ${email}`;
        } else {
            link.textContent = email;
        }
    });
    
    return true;
}

// Mobile touch optimizations
function initTouchOptimizations() {
    // Add passive touch handlers for better scrolling performance
    const contentArea = document.querySelector('.content-area');
    if (contentArea) {
        contentArea.addEventListener('touchstart', function() {}, {passive: true});
        contentArea.addEventListener('touchmove', function() {}, {passive: true});
    }
    
    // Disable double-tap zoom on mobile
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
}

// Initialize all functionality
function init() {
    initTabNavigation();
    initAnchorLinks();
    handleResize();
    initTouchOptimizations();
    
    // Add event listeners
    window.addEventListener('resize', handleResize);
    
    // Make email links functional
    document.querySelectorAll('.email-link').forEach(link => {
        link.addEventListener('click', revealEmail);
    });
}

// Run when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
