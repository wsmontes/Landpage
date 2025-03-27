/**
 * Photo Loader
 * Creates a pixelated loading effect like an old video game
 */

class PhotoLoader {
    constructor(options = {}) {
        this.options = Object.assign({
            imagePath: 'images/wagner.jpeg',
            containerId: 'about-photo-container',
            canvasId: 'about-photo-canvas',
            duration: 5000, // 5 seconds animation
            startPixelation: 24, // Start extremely pixelated (more 8-bit like)
            endPixelation: 1, // End with no pixelation (normal image)
            colorReduction: true, // Use reduced color palette during animation
            frameRate: 30 // Frames per second
        }, options);
        
        this.container = null;
        this.canvas = null;
        this.ctx = null;
        this.image = new Image();
        this.initialized = false;
        this.animationStartTime = null;
        this.loaded = false;
        this.observer = null;
    }
    
    /**
     * Initialize the photo loader
     */
    init() {
        console.log('PhotoLoader init called');
        // Setup observer to detect when content is loaded
        
        this.setupContentObserver();
        
        // Also try directly
        setTimeout(() => {
            this.setupPhoto();
        }, 500);
    }
    
    /**
     * Setup a mutation observer to detect when content is loaded
     */
    setupContentObserver() {
        // Create an observer to watch for changes in the about section
        const aboutSection = document.getElementById('about');
        if (!aboutSection) {
            console.error('About section not found');
            return;
        }
        
        console.log('Setting up observer for about section');
        
        // Set up mutation observer to watch for content changes
        this.observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    console.log('Content changed in about section, setting up photo');
                    // Content has been added, try to set up the photo
                    this.setupPhoto();
                    
                    // Once we've processed content being added, we can disconnect
                    this.observer.disconnect();
                    break;
                }
            }
        });
        
        // Start observing
        this.observer.observe(aboutSection, { childList: true, subtree: true });
    }
    
    /**
     * Set up the photo after content is loaded
     */
    setupPhoto() {
        console.log('Setting up photo');
        
        // Check if we already created the container
        if (document.getElementById(this.options.containerId)) {
            console.log('Photo container already exists');
            return;
        }
        
        // Create the container for the photo
        this.container = this.createPhotoContainer();
        if (!this.container) {
            console.error('Failed to create photo container');
            return;
        }
        
        console.log('Photo container created');
        
        // Create the canvas for the animation
        this.canvas = document.createElement('canvas');
        this.canvas.id = this.options.canvasId;
        this.canvas.className = 'about-photo-canvas';
        this.container.appendChild(this.canvas);
        
        // Add scanline effect (will be removed after animation)
        const scanlines = document.createElement('div');
        scanlines.className = 'about-photo-scan animation-active';
        this.container.appendChild(scanlines);
        
        // Add loading label
        const label = document.createElement('div');
        label.className = 'about-photo-label';
        label.textContent = 'LOADING...';
        this.container.appendChild(label);
        
        // Setup the canvas context
        this.ctx = this.canvas.getContext('2d');
        
        // Load the image
        this.image.crossOrigin = "Anonymous";
        this.image.onload = () => {
            console.log('Image loaded successfully, dimensions:', this.image.width, 'x', this.image.height);
            this.loaded = true;
            
            // Set canvas dimensions based on the image
            this.canvas.width = this.image.width;
            this.canvas.height = this.image.height;
            
            // Start the animation
            this.startAnimation();
            
            // Update the label and remove effects after animation completes
            setTimeout(() => {
                // Draw the final high-quality image
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.imageSmoothingEnabled = true;
                this.ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
                
                // Remove scanline animation when complete
                const scanlineElement = this.container.querySelector('.about-photo-scan');
                if (scanlineElement) {
                    scanlineElement.classList.remove('animation-active');
                    scanlineElement.style.background = 'none';
                }
                
                // Get label and prepare for typing effect
                const label = this.container.querySelector('.about-photo-label');
                if (label) {
                    // Clear current text
                    label.textContent = '';
                    
                    // Text to type
                    const textToType = 'ID: WAGNER MONTES';
                    let charIndex = 0;
                    
                    // Typing effect
                    const typingInterval = setInterval(() => {
                        if (charIndex < textToType.length) {
                            label.textContent += textToType.charAt(charIndex);
                            charIndex++;
                        } else {
                            // Typing complete
                            clearInterval(typingInterval);
                            
                            // Hide text after 5 seconds
                            setTimeout(() => {
                                // Fade out effect
                                label.style.transition = 'opacity 1s ease-out';
                                label.style.opacity = '0';
                                
                                // Remove element after fade out
                                setTimeout(() => {
                                    label.style.display = 'none';
                                }, 1000);
                            }, 5000);
                        }
                    }, 100); // Typing speed: 100ms per character
                }
            }, this.options.duration);
        };
        
        this.image.onerror = (e) => {
            console.error('Error loading image:', e);
            // Show error in container
            this.container.innerHTML = '<div style="color: red; padding: 10px;">Error loading image</div>';
        };
        
        console.log('Loading image from:', this.options.imagePath);
        this.image.src = this.options.imagePath;
        this.initialized = true;
    }
    
    /**
     * Create the photo container and inject it to the about section
     */
    createPhotoContainer() {
        // Find the about section
        const aboutSection = document.getElementById('about');
        if (!aboutSection) {
            console.error('About section not found');
            return null;
        }
        
        // Find the content area
        const sectionContent = aboutSection.querySelector('.section-content');
        if (!sectionContent) {
            console.error('Section content not found');
            return null;
        }
        
        console.log('Found section content');
        
        // Check if content has been loaded yet
        const content = sectionContent.innerHTML.trim();
        if (!content || content === '<div class="loading">Loading content...</div>') {
            console.log('Content not loaded yet');
            return null;
        }
        
        // Get all existing content nodes to process
        const contentNodes = Array.from(sectionContent.childNodes);
        
        // Find the title and divider
        let titleElement = null;
        let dividerElement = null;
        
        // Look for the title (h3 with # PROFESSIONAL PROFILE) and divider (---)
        contentNodes.forEach(node => {
            if (node.nodeName === 'H3' && node.textContent.includes('PROFESSIONAL PROFILE')) {
                titleElement = node;
            } else if (node.classList && node.classList.contains('tui-divider')) {
                dividerElement = node;
            }
        });
        
        // Create the main layout - first clear existing content
        sectionContent.innerHTML = '';
        
        // Re-add the title and divider with proper styling
        if (titleElement) {
            const newTitle = document.createElement('h3');
            newTitle.className = 'cyan-168-text mt-2 mb-2';
            newTitle.textContent = 'PROFESSIONAL PROFILE';
            sectionContent.appendChild(newTitle);
        } else {
            // Create a default title if none exists
            const newTitle = document.createElement('h3');
            newTitle.className = 'cyan-168-text mt-2 mb-2';
            newTitle.textContent = 'PROFESSIONAL PROFILE';
            sectionContent.appendChild(newTitle);
        }
        
        if (dividerElement) {
            const newDivider = document.createElement('div');
            newDivider.className = 'tui-divider mb-3 mt-1';
            sectionContent.appendChild(newDivider);
        } else {
            // Create a default divider if none exists
            const newDivider = document.createElement('div');
            newDivider.className = 'tui-divider mb-3 mt-1';
            sectionContent.appendChild(newDivider);
        }
        
        // Create a wrapper for the intro section (photo + initial text)
        const introDiv = document.createElement('div');
        introDiv.className = 'about-intro';
        
        // Create photo container - now placed FIRST for left positioning
        const photoDiv = document.createElement('div');
        photoDiv.id = this.options.containerId;
        photoDiv.className = 'about-photo-container';
        
        // Create a div to wrap the text content - now placed SECOND for right positioning
        const textDiv = document.createElement('div');
        textDiv.className = 'about-text';
        
        // Find the name (green text) and subtitle (white text) elements
        let nameElement = null;
        let subtitleElement = null;
        let firstParagraph = null;
        
        contentNodes.forEach(node => {
            if (node.classList && node.classList.contains('green-168-text')) {
                nameElement = node;
            } else if (nameElement && node.classList && node.classList.contains('white-168-text')) {
                subtitleElement = node;
            } else if (node.nodeName === 'P' && !firstParagraph && 
                      (!nameElement || (node !== nameElement && node !== subtitleElement))) {
                firstParagraph = node;
            }
        });
        
        // Add name and subtitle to text div if found
        if (nameElement) {
            textDiv.appendChild(nameElement.cloneNode(true));
        }
        
        if (subtitleElement) {
            textDiv.appendChild(subtitleElement.cloneNode(true));
            
            // Add spacing element between subtitle and first paragraph
            // Increase the height to match the double line break in about.txt
            const spacer = document.createElement('div');
            spacer.style.height = '32px'; // Doubled from 16px to match two line breaks
            spacer.className = 'subtitle-spacer';
            textDiv.appendChild(spacer);
        }
        
        // Add the first paragraph if found
        if (firstParagraph) {
            textDiv.appendChild(firstParagraph.cloneNode(true));
        }
        
        // Add elements to intro div - photo FIRST, then text
        introDiv.appendChild(photoDiv);
        introDiv.appendChild(textDiv);
        
        // Add the intro section to the content
        sectionContent.appendChild(introDiv);
        
        // Create content area for the rest of the text
        const restContent = document.createElement('div');
        restContent.className = 'about-content';
        
        // Add remaining content (skip what we've already added and the title/divider)
        let skipNodes = [nameElement, subtitleElement, firstParagraph, titleElement, dividerElement].filter(Boolean);
        let addedContentYet = false; // Flag to track if we've added any real content yet
        
        contentNodes.forEach(node => {
            // Skip nodes we've already processed
            if (skipNodes.includes(node)) {
                return;
            }
            
            // Skip ALL text nodes that are completely empty or only whitespace
            if (node.nodeType === Node.TEXT_NODE && (!node.textContent.trim() || /^\s*$/.test(node.textContent))) {
                return;
            }
            
            // If we're adding first real content, don't start with BR tags
            if (!addedContentYet && node.nodeName === 'BR') {
                return;
            }
            
            // We've found actual content to add
            addedContentYet = true;
            
            // Only add meaningful content
            restContent.appendChild(node.cloneNode(true));
        });
        
        // Add rest of content
        sectionContent.appendChild(restContent);
        
        console.log('Inserted about intro with photo on left, text on right');
        return photoDiv;
    }
    
    /**
     * Start the pixelation animation
     */
    startAnimation() {
        if (!this.loaded) {
            console.error('Cannot start animation: image not loaded');
            return;
        }
        
        console.log('Starting animation');
        this.animationStartTime = Date.now();
        this.animateFrame();
    }
    
    /**
     * Animate a single frame of the pixelation effect
     */
    animateFrame() {
        // Calculate elapsed time
        const now = Date.now();
        const elapsed = now - this.animationStartTime;
        const progress = Math.min(elapsed / this.options.duration, 1);
        
        // Calculate current pixelation level based on progress
        // Use a stepped progression for an 8-bit game feel
        let easeProgress = progress;
        
        // Make the progression stepped like game console loading
        if (progress < 0.2) {
            // Very pixelated for first 20%
            easeProgress = 0.1;
        } else if (progress < 0.4) {
            // Jump to next quality level
            easeProgress = 0.3;
        } else if (progress < 0.6) {
            easeProgress = 0.5;
        } else if (progress < 0.8) {
            easeProgress = 0.7;
        } else if (progress < 0.95) {
            easeProgress = 0.85;
        } else {
            // Final quality
            easeProgress = 1;
        }
        
        const pixelSize = Math.max(
            this.options.endPixelation,
            this.options.startPixelation - 
                (this.options.startPixelation - this.options.endPixelation) * easeProgress
        );
        
        // Draw the pixelated image
        this.drawPixelatedImage(pixelSize, easeProgress);
        
        // Request the next frame if animation is not complete
        if (progress < 1) {
            requestAnimationFrame(() => this.animateFrame());
        }
    }
    
    /**
     * Draw the image with specified pixelation level
     * @param {number} pixelSize - Size of the pixels
     * @param {number} progress - Animation progress (0-1)
     */
    drawPixelatedImage(pixelSize, progress) {
        if (!this.ctx || !this.canvas) {
            console.error('Cannot draw: context or canvas is missing');
            return;
        }
        
        const { width, height } = this.canvas;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, width, height);
        
        // Calculate the size of the pixelated version
        const scaledWidth = Math.floor(width / pixelSize);
        const scaledHeight = Math.floor(height / pixelSize);
        
        // Draw scaled down image (pixelated)
        this.ctx.imageSmoothingEnabled = false;
        
        // First draw small
        this.ctx.drawImage(
            this.image,
            0, 0, width, height,
            0, 0, scaledWidth, scaledHeight
        );
        
        // Apply video game effect when progress is less than 100%
        if (progress < 1 && this.options.colorReduction) {
            // Get image data to manipulate pixels
            const imageData = this.ctx.getImageData(0, 0, scaledWidth, scaledHeight);
            const data = imageData.data;
            
            // Apply color reduction (8-bit style)
            for (let i = 0; i < data.length; i += 4) {
                // Calculate color depth based on progress (fewer colors at start)
                // Start with very limited color palette, gradually increase
                const colorLevels = Math.floor(2 + progress * 14); // 2 to 16 levels
                
                // Reduce color depth
                data[i] = Math.floor(data[i] / 255 * colorLevels) * (255 / colorLevels); // R
                data[i+1] = Math.floor(data[i+1] / 255 * colorLevels) * (255 / colorLevels); // G
                data[i+2] = Math.floor(data[i+2] / 255 * colorLevels) * (255 / colorLevels); // B
            }
            
            // Put the modified image data back
            this.ctx.putImageData(imageData, 0, 0);
        }
        
        // Then scale back up with pixelation
        this.ctx.drawImage(
            this.canvas,
            0, 0, scaledWidth, scaledHeight,
            0, 0, width, height
        );
        
        // Optionally add some color shifts or noise for early stages
        if (progress < 0.5) {
            // Add subtle color noise/artifacts early in loading
            this.ctx.globalCompositeOperation = 'overlay';
            this.ctx.fillStyle = `rgba(0, ${Math.floor(150 * (1-progress*2))}, ${Math.floor(150 * (1-progress*2))}, ${0.1 - progress * 0.2})`;
            this.ctx.fillRect(0, 0, width, height);
            this.ctx.globalCompositeOperation = 'source-over';
        }
    }
}

// Wait for content to be loaded and for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing photo loader');
    
    // Create the photo loader instance
    const photoLoader = new PhotoLoader();
    window.photoLoader = photoLoader; // Keep reference for debugging
    
    // Initialize it
    photoLoader.init();
    
    // Also handle tab switching - reinitialize when about tab is clicked
    document.querySelectorAll('.tui-tab').forEach(tab => {
        if (tab.getAttribute('data-tab-content') === 'about') {
            tab.addEventListener('click', function() {
                console.log('About tab clicked');
                // Short delay to allow content to be shown
                setTimeout(() => {
                    photoLoader.setupPhoto();
                }, 100);
            });
        }
    });
});
