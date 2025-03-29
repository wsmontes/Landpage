// Mobile Scrolling Fix
document.addEventListener('DOMContentLoaded', function() {
    // Detect mobile/tablet
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile || window.innerWidth < 768) {
        // Fix for iOS momentum scrolling issues
        document.addEventListener('touchmove', function(e) {
            // Allow default scrolling behavior
        }, { passive: true });
        
        // Find any elements that might be causing scroll issues
        const fixedElements = document.querySelectorAll('.fixed-element, [style*="position: fixed"], [style*="position:fixed"]');
        fixedElements.forEach(el => {
            // On iOS, transform: translate3d(0,0,0) forces hardware acceleration
            el.style.transform = 'translate3d(0,0,0)';
        });
        
        // Fix body height issues that can cause scroll bouncing
        function setBodyHeight() {
            document.body.style.height = window.innerHeight + 'px';
        }
        
        window.addEventListener('resize', setBodyHeight);
        setBodyHeight();
    }
});
