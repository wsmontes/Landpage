/**
 * Mobile Scroll Fix
 * Addresses iOS and mobile-specific scrolling issues
 */
(function() {
    // Run as soon as possible
    document.addEventListener('DOMContentLoaded', initMobileScrollFix);
    
    // If DOM is already loaded, run immediately
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
        initMobileScrollFix();
    }
    
    function initMobileScrollFix() {
        // Check if mobile or resized to mobile width
        function checkMobile() {
            const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const isMobileWidth = window.innerWidth < 768;
            
            if (isMobileDevice || isMobileWidth) {
                document.documentElement.classList.add('mobile-view');
                applyMobileFixes();
            } else {
                document.documentElement.classList.remove('mobile-view');
                removeMobileFixes();
            }
        }
        
        // Apply specific mobile fixes
        function applyMobileFixes() {
            // Remove the no-tui-scroll class which might be preventing scrolling
            document.documentElement.classList.remove('no-tui-scroll');
            
            // iOS specific fix - prevents elastic bouncing
            document.addEventListener('touchmove', preventBounce, { passive: false });
            
            // Force proper height calculations
            resetViewportHeight();
            
            // Fix any potential scroll traps
            const contentArea = document.querySelector('.content-area');
            if (contentArea) {
                contentArea.style.maxHeight = 'none';
                contentArea.style.overflow = 'visible';
            }
            
            // Ensure tab content is visible
            const tabContents = document.querySelectorAll('.tui-tab-content');
            tabContents.forEach(tab => {
                if (tab.classList.contains('active')) {
                    tab.style.maxHeight = 'none';
                    tab.style.overflow = 'visible';
                }
            });
        }
        
        // Remove mobile-specific fixes when not needed
        function removeMobileFixes() {
            document.removeEventListener('touchmove', preventBounce);
            document.documentElement.classList.add('no-tui-scroll');
            
            // Reset any styles we modified
            const contentArea = document.querySelector('.content-area');
            if (contentArea) {
                contentArea.style.maxHeight = '';
                contentArea.style.overflow = '';
            }
            
            const tabContents = document.querySelectorAll('.tui-tab-content');
            tabContents.forEach(tab => {
                tab.style.maxHeight = '';
                tab.style.overflow = '';
            });
        }
        
        // Prevent bounce scrolling on iOS but allow normal scrolling
        function preventBounce(e) {
            // Only prevent default if we're at the boundary
            const scrollY = window.scrollY;
            const scrollHeight = document.body.scrollHeight;
            const innerHeight = window.innerHeight;
            
            // At top and trying to scroll up, or at bottom and trying to scroll down
            if ((scrollY <= 0 && e.touches[0].screenY > e.touches[0].screenY) || 
                (scrollY + innerHeight >= scrollHeight && e.touches[0].screenY < e.touches[0].screenY)) {
                e.preventDefault();
            }
        }
        
        // Set viewport height correctly (fix for iOS issue)
        function resetViewportHeight() {
            // iOS sometimes reports incorrect viewport height
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
            
            // Use this custom property in your fullscreen containers:
            // height: calc(var(--vh, 1vh) * 100);
        }
        
        // Run on initial load
        checkMobile();
        
        // Run when window is resized
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                checkMobile();
                resetViewportHeight();
            }, 250);
        });
        
        // Run when orientation changes
        window.addEventListener('orientationchange', function() {
            checkMobile();
            // Small delay to ensure iOS has updated correctly
            setTimeout(resetViewportHeight, 50);
        });
    }
})();
