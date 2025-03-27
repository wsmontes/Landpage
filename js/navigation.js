/**
 * Navigation functionality for the terminal portfolio
 */

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
            if (contentId && document.getElementById(contentId)) {
                document.getElementById(contentId).style.display = 'block';
                this.classList.add('active');
            }
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
                closeSidenav();
            }
        });
    });
}

// Close sidenav
function closeSidenav() {
    const sidenav = document.querySelector('.tui-sidenav');
    if (sidenav && sidenav.classList.contains('active')) {
        sidenav.classList.remove('active');
    }
}

// Setup click-outside functionality for sidenav
function setupSidenavClickOutside() {
    const sideNav = document.querySelector('.tui-sidenav');
    const sideNavButton = document.querySelector('.tui-sidenav-button');
    
    // Add click event to the document
    document.addEventListener('click', function(event) {
        // Check if sidenav is active
        if (sideNav && sideNav.classList.contains('active')) {
            // Check if the click was outside the sidenav and not on the toggle button
            if (!sideNav.contains(event.target) && 
                !sideNavButton.contains(event.target)) {
                closeSidenav();
            }
        }
    });
    
    // Prevent clicks inside sidenav from closing it
    sideNav.addEventListener('click', function(event) {
        event.stopPropagation();
    });
}

// Handle F10 dropdown behavior for touch devices
function initF10TouchBehavior() {
    const sourceCodeDropdown = document.querySelector('.source-code-dropdown .tui-dropdown > a');
    
    if (sourceCodeDropdown) {
        sourceCodeDropdown.addEventListener('click', function(event) {
            const dropdownContent = this.nextElementSibling;
            const isOpen = dropdownContent.style.display === 'block';
            const isMobile = window.innerWidth <= 991;
            
            // If on mobile and dropdown is already open, navigate to the href
            if (isMobile && isOpen) {
                window.location.href = this.getAttribute('href');
                event.preventDefault(); // Prevent default just for this line execution
                return;
            }
            
            // If it's the first click, let the default dropdown behavior happen
            // The TUI CSS will handle showing the dropdown
        });
    }
}

// Initialize all navigation functionality
function initNavigation() {
    initTabNavigation();
    initAnchorLinks();
    setupSidenavClickOutside();
    initF10TouchBehavior(); // Add this line to initialize the F10 touch behavior
}

// Add the functions to the global scope so they can be called from HTML onclick

// Remove the duplicate email routines defined here since they conflict with contact-manager.js
// Comment out or delete the following email functions:

// function handleEmailClick(event) {
//     event.preventDefault();
//     const email = "wmontes@gmail.com";
//     const link = event.target.closest('.email-link');
//     if (link.textContent.includes(email)) {
//         navigator.clipboard.writeText(email).then(() => {
//             const originalContent = link.innerHTML;
//             link.innerHTML = link.innerHTML.replace(email, '<span class="green-168-text">Copied!</span>');
//             setTimeout(() => {
//                 link.innerHTML = originalContent;
//             }, 3000);
//         }).catch(err => {
//             console.error('Could not copy text: ', err);
//         });
//     } else {
//         if (link.querySelector('span')) {
//             const spanElement = link.querySelector('span');
//             const spanText = spanElement.textContent;
//             link.innerHTML = `<span class="${spanElement.className}">${spanText}</span> ${email}`;
//         } else {
//             link.textContent = email;
//         }
//     }
// }

// function handleSideMenuEmail(event) {
//     event.preventDefault();
//     const email = "wmontes@gmail.com";
//     const link = event.target.closest('.sidemenu-email');
//     if (link.textContent.includes(email)) {
//         navigator.clipboard.writeText(email).then(() => {
//             link.innerHTML = '<span class="red-168-text">E</span>mail <span class="green-168-text">(Copied!)</span>';
//             setTimeout(() => {
//                 link.innerHTML = '<span class="red-168-text">E</span>mail';
//             }, 3000);
//         }).catch(err => {
//             console.error('Could not copy text: ', err);
//         });
//     } else {
//         link.innerHTML = '<span class="red-168-text">E</span>mail: ' + email;
//         setTimeout(() => {
//             link.innerHTML = '<span class="red-168-text">E</span>mail';
//         }, 5000);
//     }
// }

// Remove duplicate global assignments for email handlers.
// Comment out or delete the following lines:
// window.handleEmailClick = handleEmailClick;
// window.handleSideMenuEmail = handleSideMenuEmail;

// Run when DOM is loaded
document.addEventListener('DOMContentLoaded', initNavigation);
