/**
 * Simple Hash-Based Router for SPA.
 * Loads partial HTML files from the /pages/ folder based on the URL hash.
 */
const routes = {
  home: 'pages/home.html',
  'hours-location': 'pages/hours-location.html',
  about: 'pages/about.html',
  'order-online': 'pages/order-online.html',
  contact: 'pages/contact.html',

  // The "menu" route
  menu: 'pages/menu.html',

  // Menu pages
  'gourmet-burgers': 'pages/gourmet-burgers.html',
  'wraps': 'pages/wraps.html',
  'sides': 'pages/sides.html',
  'pasta': 'pages/pasta.html',
  'main-course': 'pages/main-course.html',
  'chinese': 'pages/chinese.html',
  'og-momos': 'pages/og-momos.html',
  'cold-beverages': 'pages/cold-beverages.html',
  'hot-beverages': 'pages/hot-beverages.html',
  'desserts': 'pages/desserts.html',  // Fixed: Changed from 'deserts' to 'desserts'
  'indian': 'pages/indian.html'  // Fixed: Changed from 'indian' to match case
};

// State management for routes
const routeState = {
  currentHash: '',
  lastValidHash: '',
  isNavigating: false,
  loadAttempts: new Map(),
  maxAttempts: 3,
  debugMode: true
};

// Enhanced routes validation
function isValidRoute(hash) {
  return hash in routes;
}

// Debug logging
function debugLog(message, data = null) {
  if (routeState.debugMode) {
    console.log(`[Router] ${message}`, data || '');
  }
}

// Preload common assets to improve page load times
function preloadAssets() {
  // List of common assets to preload
  const commonAssets = [
    'assets/menu/GOURMET BURGERS.svg',
    'assets/menu/WRAPS.svg',
    'assets/menu/SIDES.svg',
    'assets/menu/PASTA.svg',
    'assets/menu/MAIN COURSE.svg',
    'assets/menu/CHINESE.svg',
    'assets/menu/momos.svg',
    'assets/menu/COLD BEVERAGES.svg',
    'assets/menu/HOT BEVERAGES.svg',
    'assets/menu/DESSERTS.svg',  // Fixed: Added missing desserts SVG
    'assets/menu/INDIAN.svg',  // Fixed: Added proper Indian SVG path
    'assets/Blaze PNG 3.svg',
    'assets/About.svg',
    'assets/Get D.svg'  // Added Get D.svg to preload
  ];
  
  // Create image objects to preload
  commonAssets.forEach(src => {
    const img = new Image();
    img.src = src;
  });
}

// Debounce function to limit function calls
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Enhanced loadContent function with retry mechanism
function loadContent(forcedHash = null) {
  const hash = forcedHash || window.location.hash.slice(1) || 'home';
  debugLog('Attempting to load content for hash:', hash);

  // Validate route
  if (!isValidRoute(hash)) {
    debugLog('Invalid route detected:', hash);
    window.location.hash = routeState.lastValidHash || 'home';
    return;
  }

  // Prevent duplicate loads
  if (hash === routeState.currentHash && !forcedHash) {
    debugLog('Preventing duplicate load:', hash);
    return;
  }

  // Track attempts
  const attempts = routeState.loadAttempts.get(hash) || 0;
  if (attempts >= routeState.maxAttempts) {
    debugLog('Max attempts reached for:', hash);
    window.location.hash = routeState.lastValidHash || 'home';
    return;
  }

  routeState.loadAttempts.set(hash, attempts + 1);
  const appElement = document.getElementById('app');
  
  // Set navigation state
  routeState.isNavigating = true;
  routeState.currentHash = hash;

  debugLog('Loading content:', hash);
  
  // Remove loaded class for transition
  appElement.classList.remove('loaded');

  // Load content with timeout
  const loadTimeout = setTimeout(() => {
    debugLog('Load timeout reached for:', hash);
    handleLoadError(hash);
  }, 5000); // 5 second timeout

  fetch(routes[hash], {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  })
    .then(response => {
      clearTimeout(loadTimeout);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.text();
    })
    .then(html => {
      // Verify we're still wanting this content
      if (hash === (window.location.hash.slice(1) || 'home')) {
        debugLog('Content loaded successfully:', hash);
        
        // Update DOM
        appElement.innerHTML = html;
        
        // Reset state
        routeState.isNavigating = false;
        routeState.lastValidHash = hash;
        routeState.loadAttempts.delete(hash);
        
        // Initialize components
        requestAnimationFrame(() => {
          appElement.classList.add('loaded');
          initializePageComponents(hash);
        });

        // Store successful navigation
        localStorage.setItem('lastValidRoute', hash);
      }
    })
    .catch(error => {
      clearTimeout(loadTimeout);
      debugLog('Load error:', error);
      handleLoadError(hash);
    });
}

function handleLoadError(hash) {
  if (routeState.isNavigating) {
    routeState.isNavigating = false;
    const fallbackHash = routeState.lastValidHash || 'home';
    
    debugLog('Handling load error, falling back to:', fallbackHash);
    
    if (hash !== fallbackHash) {
      window.location.hash = fallbackHash;
    }
  }
}

function initializePageComponents(hash) {
  debugLog('Initializing components for:', hash);
  
  // Initialize all required components
  initSmoothScrolling();
  handleImageLoading();
  setupLazyLoadingIframes();
  updateHorizontalNav();
  setActiveNavItem(hash);
}

// Enhanced navigation handling
function handleNavigation(event) {
  const hash = window.location.hash.slice(1) || 'home';
  debugLog('Navigation event:', hash);

  if (routeState.isNavigating) {
    debugLog('Navigation already in progress, waiting...');
    return;
  }

  if (!isValidRoute(hash)) {
    debugLog('Invalid route in navigation:', hash);
    event.preventDefault();
    window.location.hash = routeState.lastValidHash || 'home';
    return;
  }

  loadContent();
}

// Initialize router
function initRouter() {
  debugLog('Initializing router');
  
  // Load initial route
  const initialHash = window.location.hash.slice(1) || 'home';
  routeState.lastValidHash = localStorage.getItem('lastValidRoute') || 'home';
  
  // Set up navigation listeners
  window.removeEventListener('hashchange', handleNavigation);
  window.addEventListener('hashchange', handleNavigation);
  
  // Load initial content
  loadContent(initialHash);
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  debugLog('DOM loaded, initializing application');
  initRouter();
});

// Add this new function to ensure correct navigation state
function setActiveNavItem(hash) {
  debugLog('Setting active nav item:', hash);
  
  requestAnimationFrame(() => {
    const navItems = document.querySelectorAll('.horizontal-nav-item');
    navItems.forEach(item => {
      const itemHash = item.getAttribute('href')?.substring(1);
      if (itemHash === hash) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  });
}

// Function to fix SVG paths to ensure they load correctly
function fixSvgPaths() {
  // Fix menu SVG paths
  const menuSvgs = document.querySelectorAll('.menu-svg');
  menuSvgs.forEach(svg => {
    const src = svg.getAttribute('src');
    if (src && !src.startsWith('./') && !src.startsWith('/')) {
      svg.setAttribute('src', './' + src);
    }
  });
  
  // Fix separator SVG paths
  const separators = document.querySelectorAll('.nav-separator');
  separators.forEach(separator => {
    const src = separator.getAttribute('src');
    if (src && !src.startsWith('./') && !src.startsWith('/')) {
      separator.setAttribute('src', './' + src);
    }
  });
}

// Function to adjust SVG images to fill the available width
function adjustSvgImages() {
  // Use requestAnimationFrame for better performance
  requestAnimationFrame(() => {
    // Adjust About.svg specifically
    const aboutSvg = document.querySelector('img[src="assets/About.svg"]');
    if (aboutSvg) {
      aboutSvg.style.width = '100%';
      aboutSvg.style.maxWidth = '430px';
      aboutSvg.style.objectFit = 'contain';
      aboutSvg.style.display = 'block';
      aboutSvg.style.margin = '0 auto';
    }
    
    // Adjust all menu SVGs
    const menuSvgs = document.querySelectorAll('.menu-svg');
    menuSvgs.forEach(svg => {
      if (svg) {
        svg.style.maxWidth = '100%';
        svg.style.height = 'auto';
        svg.style.display = 'block';
        svg.style.margin = '0 auto';
      }
    });
  });
}

// highlight side nav links
function setActiveLink(hash) {
  const navItems = document.querySelectorAll('.side-nav a');
  navItems.forEach(link => {
    if (link.getAttribute('href') === '#' + hash) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Optimize the updateHorizontalNav function
const updateHorizontalNav = debounce(function() {
  const horizontalNav = document.querySelector('.horizontal-nav');
  if (!horizontalNav) return;
  
  const activeItem = horizontalNav.querySelector('.horizontal-nav-item.active');
  if (!activeItem) return;
  
  const navContainer = horizontalNav.querySelector('.nav-container');
  if (!navContainer) return;
  
  // Calculate scroll position to center the active item
  const itemRect = activeItem.getBoundingClientRect();
  const navRect = navContainer.getBoundingClientRect();
  const scrollLeft = activeItem.offsetLeft - (navRect.width / 2) + (itemRect.width / 2);
  
  // Use smooth scrolling for better UX
  navContainer.scrollTo({
    left: scrollLeft,
    behavior: 'smooth'
  });
}, 50);

// Add a function to enable haptic feedback during horizontal navigation scrolling
function enableHapticScrollFeedback() {
  const navContainer = document.querySelector('.nav-container');
  if (!navContainer || !('vibrate' in navigator)) return;
  
  // Get all navigation items including dots
  const allItems = navContainer.querySelectorAll('.horizontal-nav-item, .nav-dot');
  if (allItems.length === 0) return;
  
  // Store the last item that triggered haptic feedback to avoid repeated triggers
  let lastTriggeredItem = null;
  
  // Track scroll position to determine direction
  let lastScrollLeft = navContainer.scrollLeft;
  
  // Add momentum scrolling resistance
  navContainer.style.scrollSnapType = 'x mandatory';
  
  // Make all items snap points
  allItems.forEach(item => {
    item.style.scrollSnapAlign = 'center';
  });
  
  // Create an IntersectionObserver to detect when items are centered in view
  const options = {
    root: navContainer,
    rootMargin: '0px',
    threshold: 0.75 // Trigger when item is 75% visible
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // Only trigger for items that are becoming visible and are different from the last triggered item
      if (entry.isIntersecting && entry.target !== lastTriggeredItem) {
        // Determine scroll direction
        const scrollDirection = navContainer.scrollLeft > lastScrollLeft ? 'right' : 'left';
        lastScrollLeft = navContainer.scrollLeft;
        
        // Store this item as the last triggered
        lastTriggeredItem = entry.target;
        
        // Provide haptic feedback
        if (entry.target.classList.contains('horizontal-nav-item')) {
          // Stronger vibration for menu items
          navigator.vibrate(20);
          
          // Navigate to this section
          const href = entry.target.getAttribute('href');
          if (href && href.startsWith('#')) {
            window.location.hash = href.substring(1);
          }
        } else if (entry.target.classList.contains('nav-dot')) {
          // Lighter vibration for dots
          navigator.vibrate(10);
          
          // Find the next menu item after this dot and navigate to it
          let nextItem = entry.target.nextElementSibling;
          while (nextItem && !nextItem.classList.contains('horizontal-nav-item')) {
            nextItem = nextItem.nextElementSibling;
          }
          
          if (nextItem) {
            const href = nextItem.getAttribute('href');
            if (href && href.startsWith('#')) {
              window.location.hash = href.substring(1);
            }
          }
        }
        
        // Add a visual pulse effect
        entry.target.classList.add('scroll-pulse');
        setTimeout(() => {
          entry.target.classList.remove('scroll-pulse');
        }, 300);
      }
    });
  }, options);
  
  // Observe all items
  allItems.forEach(item => observer.observe(item));
  
  // Also add touch event listeners for more responsive feedback
  let touchScrolling = false;
  let lastTouchX = 0;
  let touchStartTime = 0;
  let touchVelocity = 0;
  
  navContainer.addEventListener('touchstart', (e) => {
    touchScrolling = true;
    lastTouchX = e.touches[0].clientX;
    lastScrollLeft = navContainer.scrollLeft;
    touchStartTime = Date.now();
    touchVelocity = 0;
  }, { passive: true });
  
  navContainer.addEventListener('touchmove', (e) => {
    if (!touchScrolling) return;
    
    const touchX = e.touches[0].clientX;
    const touchDiff = touchX - lastTouchX;
    const timeDiff = Date.now() - touchStartTime;
    
    // Calculate velocity (pixels per millisecond)
    if (timeDiff > 0) {
      touchVelocity = touchDiff / timeDiff;
    }
    
    // If significant movement detected
    if (Math.abs(touchDiff) > 10) {
      // Find the item currently in the center of the view
      const containerCenter = navContainer.getBoundingClientRect().left + navContainer.offsetWidth / 2;
      
      // Find the closest item to the center
      let closestItem = null;
      let closestDistance = Infinity;
      
      allItems.forEach(item => {
        const itemRect = item.getBoundingClientRect();
        const itemCenter = itemRect.left + itemRect.width / 2;
        const distance = Math.abs(containerCenter - itemCenter);
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestItem = item;
        }
      });
      
      // If we found a closest item and it's different from the last triggered
      if (closestItem && closestItem !== lastTriggeredItem && closestDistance < 30) {
        lastTriggeredItem = closestItem;
        
        // Provide haptic feedback based on item type
        if (closestItem.classList.contains('horizontal-nav-item')) {
          // Stronger vibration for menu items
          navigator.vibrate(20);
          
          // Navigate to this section if scrolling fast enough
          if (Math.abs(touchVelocity) > 0.5) {
            const href = closestItem.getAttribute('href');
            if (href && href.startsWith('#')) {
              window.location.hash = href.substring(1);
            }
          }
        } else if (closestItem.classList.contains('nav-dot')) {
          navigator.vibrate(10);
          
          // Navigate to next section if scrolling fast enough
          if (Math.abs(touchVelocity) > 0.5) {
            let nextItem = closestItem.nextElementSibling;
            while (nextItem && !nextItem.classList.contains('horizontal-nav-item')) {
              nextItem = nextItem.nextElementSibling;
            }
            
            if (nextItem) {
              const href = nextItem.getAttribute('href');
              if (href && href.startsWith('#')) {
                window.location.hash = href.substring(1);
              }
            }
          }
        }
        
        // Add visual feedback
        closestItem.classList.add('scroll-pulse');
        setTimeout(() => {
          closestItem.classList.remove('scroll-pulse');
        }, 300);
      }
      
      lastTouchX = touchX;
      touchStartTime = Date.now();
    }
  }, { passive: true });
  
  navContainer.addEventListener('touchend', () => {
    touchScrolling = false;
  }, { passive: true });
}

// Setup lazy loading for iframes to improve performance
function setupLazyLoadingIframes() {
  // Only load iframes when they're in the viewport
  const iframes = document.querySelectorAll('iframe[data-src]');
  
  if (iframes.length === 0) return;
  
  const lazyLoadIframe = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const iframe = entry.target;
        iframe.src = iframe.dataset.src;
        iframe.removeAttribute('data-src');
        observer.unobserve(iframe);
      }
    });
  };
  
  const iframeObserver = new IntersectionObserver(lazyLoadIframe, {
    rootMargin: '200px 0px', // Load iframe when it's within 200px of viewport
    threshold: 0.01
  });
  
  iframes.forEach(iframe => {
    iframeObserver.observe(iframe);
  });
}

// Preload images for faster loading
function preloadImages() {
  // Create Intersection Observer for SVGs
  const svgObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const svg = entry.target;
        if (svg.dataset.src) {
          svg.src = svg.dataset.src;
          svg.removeAttribute('data-src');
          svgObserver.unobserve(svg);
        }
      }
    });
  }, {
    rootMargin: '50px 0px', // Start loading when SVG is 50px from viewport
    threshold: 0.1
  });

  // Convert all SVG images to lazy load
  const svgImages = document.querySelectorAll('.menu-svg, img[src$=".svg"]');
  svgImages.forEach(svg => {
    const currentSrc = svg.getAttribute('src');
    if (currentSrc) {
      svg.setAttribute('data-src', currentSrc);
      svg.removeAttribute('src');
      svgObserver.observe(svg);
    }
  });
}

// Function to enable haptic feedback for horizontal scrolling with iPhone dock-like behavior
function enableHapticScrollFeedback() {
  const navContainer = document.querySelector('.nav-container');
  if (!navContainer || !('vibrate' in navigator)) return;
  
  const allItems = navContainer.querySelectorAll('.horizontal-nav-item');
  if (allItems.length === 0) return;
  
  let lastTriggeredItem = null;
  const initialScrollLeft = navContainer.scrollLeft;
  
  // Add scroll event listener for edge detection
  navContainer.addEventListener('scroll', () => {
    const containerRect = navContainer.getBoundingClientRect();
    const containerLeft = containerRect.left;
    const containerRight = containerRect.right;
    
    allItems.forEach(item => {
      const itemRect = item.getBoundingClientRect();
      const itemLeft = itemRect.left;
      const itemRight = itemRect.right;
      
      // Check if item touches either edge of the container
      if ((Math.abs(itemLeft - containerLeft) < 1 || Math.abs(itemRight - containerRight) < 1) && 
          item !== lastTriggeredItem) {
        lastTriggeredItem = item;
        
        // Navigate to the section
        const href = item.getAttribute('href');
        if (href && href.startsWith('#')) {
          window.location.hash = href.substring(1);
          navigator.vibrate(20);
          
          item.classList.add('scroll-pulse');
          setTimeout(() => {
            item.classList.remove('scroll-pulse');
          }, 300);
        }
      }
    });
  }, { passive: true });
  
  // Create edge indicators
  const leftIndicator = document.createElement('div');
  leftIndicator.className = 'edge-indicator left';
  
  const rightIndicator = document.createElement('div');
  rightIndicator.className = 'edge-indicator right';
  
  const horizontalNav = document.querySelector('.horizontal-nav');
  horizontalNav.appendChild(leftIndicator);
  horizontalNav.appendChild(rightIndicator);
  
  let scrollVelocity = 0;
  let lastScrollTime = 0;
  let isAtLeftEdge = true;
  let isAtRightEdge = false;
  let lastItemTriggered = null;
  
  // Check if we can use the vibration API
  const canVibrate = 'vibrate' in navigator;
  
  // Get all navigation items for edge detection
  const navItems = document.querySelectorAll('.horizontal-nav-item');
  const navDots = document.querySelectorAll('.nav-dot');
  
  // Function to detect items at screen edges and trigger navigation
  function detectEdgeItems() {
    const containerRect = navContainer.getBoundingClientRect();
    const leftEdge = containerRect.left;
    const rightEdge = containerRect.right;
    
    // Check each navigation item with improved edge detection
    navItems.forEach(item => {
      if (item === lastItemTriggered) return;
      
      const itemRect = item.getBoundingClientRect();
      const itemWidth = itemRect.width;
      
      // Improved edge detection thresholds
      const leftThreshold = itemWidth * 0.3; // 30% of item width
      const rightThreshold = itemWidth * 0.3;
      
      // Check if item is entering from left
      if (itemRect.right >= leftEdge && itemRect.right <= leftEdge + leftThreshold) {
        handleEdgeNavigation(item);
        return;
      }
      
      // Check if item is entering from right
      if (itemRect.left <= rightEdge && itemRect.left >= rightEdge - rightThreshold) {
        handleEdgeNavigation(item);
        return;
      }
    });
  }

  function handleEdgeNavigation(item) {
    const href = item.getAttribute('href');
    if (!href || !href.startsWith('#') || window.location.hash === href) return;
    
    // Visual feedback
    item.classList.add('scroll-pulse');
    setTimeout(() => item.classList.remove('scroll-pulse'), 300);
    
    // Haptic feedback with improved pattern
    if (canVibrate) {
      navigator.vibrate([20, 10, 20]);
    }
    
    // Store as last triggered and navigate
    lastItemTriggered = item;
    window.location.hash = href;
  }
  
  // Track scroll events for velocity calculation and edge detection
  navContainer.addEventListener('scroll', () => {
    const now = performance.now();
    const dt = now - lastScrollTime;
    
    // Call detectEdgeItems function to check for items at screen edges
    detectEdgeItems();
    
    if (dt > 0) {
      // Calculate scroll velocity in pixels per millisecond
      scrollVelocity = (navContainer.scrollLeft - lastScrollLeft) / dt;
      
      // Check if we're at the edges
      const newIsAtLeftEdge = navContainer.scrollLeft <= 10;
      const newIsAtRightEdge = navContainer.scrollLeft >= (navContainer.scrollWidth - navContainer.clientWidth - 10);
      
      // Trigger edge haptic feedback and visual indicators
      if (newIsAtLeftEdge !== isAtLeftEdge) {
        isAtLeftEdge = newIsAtLeftEdge;
        if (isAtLeftEdge && scrollVelocity < -0.3) {
          // Left edge reached with significant velocity
          if (canVibrate) navigator.vibrate(30);
          leftIndicator.classList.add('visible');
          setTimeout(() => leftIndicator.classList.remove('visible'), 500);
        }
      }
      
      if (newIsAtRightEdge !== isAtRightEdge) {
        isAtRightEdge = newIsAtRightEdge;
        if (isAtRightEdge && scrollVelocity > 0.3) {
          // Right edge reached with significant velocity
          if (canVibrate) navigator.vibrate(30);
          rightIndicator.classList.add('visible');
          setTimeout(() => rightIndicator.classList.remove('visible'), 500);
        }
      }
    }
    
    lastScrollLeft = navContainer.scrollLeft;
    lastScrollTime = now;
  });
  
  // Touch events for better mobile experience
  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartTime = 0;
  
  navContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartTime = performance.now();
  }, { passive: true });
  
  navContainer.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const touchEndTime = performance.now();
    const touchDuration = touchEndTime - touchStartTime;
    
    // Calculate swipe velocity
    const touchDistance = touchEndX - touchStartX;
    const touchVelocity = Math.abs(touchDistance / touchDuration);
    
    // If it was a fast swipe, trigger haptic feedback
    if (touchVelocity > 1.0) {
      if (canVibrate) navigator.vibrate(15);
      
      // Show edge indicators for fast swipes
      if (touchDistance < 0 && !isAtRightEdge) {
        rightIndicator.classList.add('visible');
        setTimeout(() => rightIndicator.classList.remove('visible'), 500);
      } else if (touchDistance > 0 && !isAtLeftEdge) {
        leftIndicator.classList.add('visible');
        setTimeout(() => leftIndicator.classList.remove('visible'), 500);
      }
    }
  }, { passive: true });
}

// Add a function to make horizontal nav scrollable with touch/mouse
function enableHorizontalDrag() {
  const horizNav = document.querySelector('.horizontal-nav');
  if (!horizNav) return;
  
  let isDown = false;
  let startX;
  let scrollLeft;
  
  // Add haptic feedback to navigation items
  const navItems = horizNav.querySelectorAll('.horizontal-nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      // Provide haptic feedback when clicking on navigation items
      if ('vibrate' in navigator) {
        navigator.vibrate(20);
      }
    });
  });
  
  // Add dots between menu items for visual separation and haptic feedback
  const navContainer = horizNav.querySelector('.nav-container');
  if (navContainer) {
    // First, remove any existing dots to avoid duplicates
    const existingDots = navContainer.querySelectorAll('.nav-dot');
    existingDots.forEach(dot => dot.remove());
    
    // Add dots between menu items
    const items = Array.from(navContainer.querySelectorAll('.horizontal-nav-item'));
    for (let i = 0; i < items.length - 1; i++) {
      const dot = document.createElement('span');
      dot.className = 'nav-dot';
      dot.innerHTML = '•';
      
      // Insert the dot after the current item
      if (items[i].nextSibling) {
        navContainer.insertBefore(dot, items[i].nextSibling);
      } else {
        navContainer.appendChild(dot);
      }
      
      // Add haptic feedback to dots
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        // Provide stronger haptic feedback for dots
        if ('vibrate' in navigator) {
          navigator.vibrate([10, 30, 10]);
        }
      });
    }
  }
  
  horizNav.addEventListener('mousedown', (e) => {
    isDown = true;
    horizNav.style.cursor = 'grabbing';
    startX = e.pageX - horizNav.offsetLeft;
    scrollLeft = horizNav.scrollLeft;
  });
  
  horizNav.addEventListener('mouseleave', () => {
    isDown = false;
    horizNav.style.cursor = 'grab';
  });
  
  horizNav.addEventListener('mouseup', () => {
    isDown = false;
    horizNav.style.cursor = 'grab';
  });
  
  horizNav.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - horizNav.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    horizNav.scrollLeft = scrollLeft - walk;
  });
}

// Add a function to handle scrollbar styling based on browser support
function handleScrollbarStyling() {
  const horizNav = document.querySelector('.horizontal-nav');
  if (!horizNav) return;
  
  // Check if the user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // If the user doesn't prefer reduced motion, add the hide-scrollbar class
  if (!prefersReducedMotion) {
    horizNav.classList.add('hide-scrollbar');
  }
}

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Preload assets for faster loading
  preloadAssets();
  
  // Initial content load
  loadContent();
  
  // Listen for hash changes
  window.addEventListener('hashchange', loadContent);
  
  // Apply scrollbar hiding
  applyScrollbarHiding();
});
  
  // Set up side navigation
  const hamburger = document.querySelector('.hamburger');
  const sideNav = document.querySelector('.side-nav');
  
  // Toggle side nav
  hamburger.addEventListener('click', () => {
    sideNav.classList.toggle('open');
    hamburger.classList.toggle('active'); // Toggle active class for cross animation
  });
  
  // Close side nav when clicking navigation links
  document.querySelectorAll('.side-nav a').forEach(link => {
    link.addEventListener('click', () => {
      // Don't close for phone number links
      if (!link.getAttribute('href').startsWith('tel:')) {
        sideNav.classList.remove('open');
        hamburger.classList.remove('active');
      }
    });
  });
  
  // Close side nav when clicking outside
  document.addEventListener('click', (e) => {
    if (!sideNav.contains(e.target) && !hamburger.contains(e.target) && sideNav.classList.contains('open')) {
      sideNav.classList.remove('open');
      hamburger.classList.remove('active');
    }
  });
  
  // Enable service worker for caching
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/service-worker.js').then(function(registration) {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, function(err) {
        console.log('ServiceWorker registration failed: ', err);
      });
    });
  }
  
  // Add resize event listener to adjust SVG images when window is resized
  window.addEventListener('resize', debounce(() => {
    adjustSvgImages();
    updateHorizontalNav();
  }, 100));
  
  // Enable horizontal drag scrolling
  enableHorizontalDrag();
  
  // Handle scrollbar styling
  handleScrollbarStyling();
  
  // Initialize haptic scroll feedback
  setTimeout(enableHapticScrollFeedback, 500);
;

// Re-initialize haptic feedback when hash changes
window.addEventListener('hashchange', function() {
  // Wait for the content to load before initializing
  setTimeout(enableHapticScrollFeedback, 500);
});

// Handle hash changes
window.addEventListener('hashchange', loadContent);

// Add transition styles to the app element
document.addEventListener('DOMContentLoaded', () => {
  const appElement = document.getElementById('app');
  if (appElement) {
    appElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  }
  
  // Call the lazy loading setup function when content is loaded
  setupLazyLoadingIframes();
});

// Function to enable haptic feedback for horizontal scrolling with iPhone dock-like behavior
function enableHapticScrollFeedback() {
  const navContainer = document.querySelector('.nav-container');
  if (!navContainer) return;
  
  // Create edge indicators
  const leftIndicator = document.createElement('div');
  leftIndicator.className = 'edge-indicator left';
  
  const rightIndicator = document.createElement('div');
  rightIndicator.className = 'edge-indicator right';
  
  const horizontalNav = document.querySelector('.horizontal-nav');
  horizontalNav.appendChild(leftIndicator);
  horizontalNav.appendChild(rightIndicator);
  
  // Initialize scroll tracking variables
  let scrollVelocity = 0;
  let lastScrollTime = 0;
  let lastScrollLeft = navContainer.scrollLeft;
  let isAtLeftEdge = true;
  let isAtRightEdge = false;
  let lastItemTriggered = null;
  
  // Check if we can use the vibration API
  const canVibrate = 'vibrate' in navigator;
  
  // Get all navigation items for edge detection
  const navItems = document.querySelectorAll('.horizontal-nav-item');
  const navDots = document.querySelectorAll('.nav-dot');
  
  // Function to detect items at screen edges and trigger navigation
  function detectEdgeItems() {
    const containerRect = navContainer.getBoundingClientRect();
    const leftEdge = containerRect.left;
    const rightEdge = containerRect.right;
    
    // Check each navigation item
    navItems.forEach(item => {
      if (item === lastItemTriggered) return; // Skip if this was the last triggered item
      
      const itemRect = item.getBoundingClientRect();
      const href = item.getAttribute('href');
      
      if (!href || !href.startsWith('#')) return;
      
      // Check if item's right edge is entering the left side of the screen
      if (itemRect.right >= leftEdge && itemRect.right <= leftEdge + itemRect.width / 2) {
        if (window.location.hash !== href) {
          // Apply visual feedback
          item.classList.add('scroll-pulse');
          setTimeout(() => item.classList.remove('scroll-pulse'), 300);
          
          // Haptic feedback
          if (canVibrate) navigator.vibrate([20, 10, 20]);
          
          // Store as last triggered and navigate
          lastItemTriggered = item;
          
          // Use pushState to update URL without triggering a page reload
          history.pushState(null, '', href);
          
          // Manually trigger the navigation
          const targetSection = document.querySelector(href);
          if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth' });
          }
        }
        return;
      }
      
      // Check if item's left edge is entering the right side of the screen
      if (itemRect.left <= rightEdge && itemRect.left >= rightEdge - itemRect.width / 2) {
        // Item is at the right edge, navigate to this section
        const href = item.getAttribute('href');
        if (href && href.startsWith('#')) {
          const sectionId = href.substring(1);
          if (window.location.hash !== href) {
            // Apply visual feedback
            item.classList.add('scroll-pulse');
            setTimeout(() => item.classList.remove('scroll-pulse'), 300);
            
            // Haptic feedback
            if (canVibrate) navigator.vibrate(20);
            
            // Store as last triggered to prevent repeated triggers
            lastItemTriggered = item;
            
            // Navigate to the section
            window.location.hash = href;
          }
        }
        return;
      }
    });
    
    // Also check nav dots with similar logic
    navDots.forEach((dot, index) => {
      if (dot === lastItemTriggered) return;
      
      const dotRect = dot.getBoundingClientRect();
      
      // Check if dot is at either edge
      if ((dotRect.right >= leftEdge && dotRect.right <= leftEdge + dotRect.width / 2) ||
          (dotRect.left <= rightEdge && dotRect.left >= rightEdge - dotRect.width / 2)) {
        
        // Apply visual feedback
        dot.classList.add('scroll-pulse');
        setTimeout(() => dot.classList.remove('scroll-pulse'), 300);
        
        // Haptic feedback
        if (canVibrate) navigator.vibrate(10);
        
        // Store as last triggered
        lastItemTriggered = dot;
      }
    });
  }
  
  // Track scroll events for velocity calculation and edge detection
  navContainer.addEventListener('scroll', () => {
    const now = performance.now();
    const dt = now - lastScrollTime;
    
    if (dt > 0) {
      // Calculate scroll velocity in pixels per millisecond
      scrollVelocity = (navContainer.scrollLeft - lastScrollLeft) / dt;
      
      // Check if we're at the edges
      const newIsAtLeftEdge = navContainer.scrollLeft <= 10;
      const newIsAtRightEdge = navContainer.scrollLeft >= (navContainer.scrollWidth - navContainer.clientWidth - 10);
      
      // Trigger edge haptic feedback and visual indicators
      if (newIsAtLeftEdge !== isAtLeftEdge) {
        isAtLeftEdge = newIsAtLeftEdge;
        if (isAtLeftEdge && scrollVelocity < -0.3) {
          // Left edge reached with significant velocity
          if (canVibrate) navigator.vibrate(30);
          leftIndicator.classList.add('visible');
          setTimeout(() => leftIndicator.classList.remove('visible'), 500);
        }
      }
      
      if (newIsAtRightEdge !== isAtRightEdge) {
        isAtRightEdge = newIsAtRightEdge;
        if (isAtRightEdge && scrollVelocity > 0.3) {
          // Right edge reached with significant velocity
          if (canVibrate) navigator.vibrate(30);
          rightIndicator.classList.add('visible');
          setTimeout(() => rightIndicator.classList.remove('visible'), 500);
        }
      }
    }
    
    lastScrollLeft = navContainer.scrollLeft;
    lastScrollTime = now;
  });
  
  // Touch events for better mobile experience
  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartTime = 0;
  
  navContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartTime = performance.now();
  }, { passive: true });
  
  navContainer.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const touchEndTime = performance.now();
    const touchDuration = touchEndTime - touchStartTime;
    
    // Calculate swipe velocity
    const touchDistance = touchEndX - touchStartX;
    const touchVelocity = Math.abs(touchDistance / touchDuration);
    
    // If it was a fast swipe, trigger haptic feedback
    if (touchVelocity > 1.0) {
      if (canVibrate) navigator.vibrate(15);
      
      // Show edge indicators for fast swipes
      if (touchDistance < 0 && !isAtRightEdge) {
        rightIndicator.classList.add('visible');
        setTimeout(() => rightIndicator.classList.remove('visible'), 500);
      } else if (touchDistance > 0 && !isAtLeftEdge) {
        leftIndicator.classList.add('visible');
        setTimeout(() => leftIndicator.classList.remove('visible'), 500);
      }
    }
  }, { passive: true });
}
document.addEventListener('DOMContentLoaded', () => {
  // Side navigation is already set up outside this event listener
  // No need to add duplicate event listeners here
});


// Apply scrollbar hiding based on browser support
function applyScrollbarHiding() {
  // Test for Firefox scrollbar-width support
  const style = document.createElement('style');
  try {
    style.appendChild(document.createTextNode(':root{scrollbar-width:none}'));
    document.head.appendChild(style);
    const isScrollbarWidthSupported = getComputedStyle(document.documentElement).scrollbarWidth === 'none';
    document.head.removeChild(style);
    
    if (isScrollbarWidthSupported) {
      // Apply the class only if scrollbar-width is supported
      const navContainers = document.querySelectorAll('.nav-container');
      navContainers.forEach(container => {
        container.classList.add('hide-scrollbar');
      });
    }
  } catch (e) {
    // If there's an error, the property is not supported
    console.log('scrollbar-width not supported in this browser');
  }
}

// Scroller functionality moved to scroller.js
// Add smooth image loading
function handleImageLoading() {
  const images = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.addEventListener('load', () => {
          img.classList.add('loaded');
        });
        observer.unobserve(img);
      }
    });
  });

  images.forEach(img => imageObserver.observe(img));
}

// Smooth page transitions
function loadContent() {
  const appElement = document.getElementById('app');
  const hash = window.location.hash.slice(1) || 'home';
  
  // Prevent reloading the same page
  if (hash === currentHash) {
    return;
  }
  
  // Prevent unwanted redirects
  if (!routes[hash]) {
    console.warn(`Route "${hash}" not found, defaulting to home`);
    window.location.hash = 'home';
    return;
  }
  
  // Store the current hash
  currentHash = hash;
  
  // Remove loaded class for transition out
  appElement.classList.remove('loaded');
  
  // Track the current page load attempt
  const currentPage = hash;
  
  setTimeout(() => {
    // Check if the hash hasn't changed during the timeout
    if (currentPage === window.location.hash.slice(1)) {
      const page = routes[hash];
      fetch(page, {
        // Add cache control
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to load ${page}`);
          }
          return response.text();
        })
        .then(html => {
          // Verify we're still on the same page before updating
          if (currentPage === window.location.hash.slice(1)) {
            appElement.innerHTML = html;
            
            // Add loaded class for transition in
            requestAnimationFrame(() => {
              appElement.classList.add('loaded');
            });
            
            // Initialize components
            initSmoothScrolling();
            handleImageLoading();
            setupLazyLoadingIframes();
            updateHorizontalNav();
            
            // Ensure the correct active state in navigation
            setActiveNavItem(hash);
            
            // Store last successful navigation
            sessionStorage.setItem('lastValidRoute', hash);
          }
        })
        .catch(error => {
          console.error('Page load failed:', error);
          // Restore last known good route
          const lastValidRoute = sessionStorage.getItem('lastValidRoute') || 'home';
          if (hash !== lastValidRoute) {
            window.location.hash = lastValidRoute;
          }
        });
    }
  }, 300);
}

// Add this new function to ensure correct navigation state
function setActiveNavItem(hash) {
  requestAnimationFrame(() => {
    const horizontalNavItems = document.querySelectorAll('.horizontal-nav-item');
    horizontalNavItems.forEach(item => {
      const itemHash = item.getAttribute('href').substring(1);
      if (itemHash === hash) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  });
}

// Smooth scrolling for internal links
function initSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// Optimize scroll performance
function optimizeScroll() {
  let ticking = false;
  
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        // Your scroll handlers here
        updateHorizontalNav();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  loadContent();
  initSmoothScrolling();
  optimizeScroll();
  handleImageLoading();
  
  // Enable smooth navigation
  enableHapticScrollFeedback();
});

// Add this function to handle navigation clicks
function handleNavClick(event) {
  const link = event.target.closest('.horizontal-nav-item');
  if (link) {
    event.preventDefault();
    const href = link.getAttribute('href');
    const targetRoute = href.substring(1); // Remove the #
    
    if (routes[targetRoute]) {
      window.location.hash = targetRoute;
    }
  }
}

// Initialize navigation handling
document.addEventListener('DOMContentLoaded', () => {
  loadContent();
  
  // Add click handler for navigation
  document.addEventListener('click', handleNavClick);
  
  // Store initial route
  const initialHash = window.location.hash.slice(1) || 'home';
  if (routes[initialHash]) {
    sessionStorage.setItem('lastValidRoute', initialHash);
  }
});

// Modify the hashchange event listener
window.removeEventListener('hashchange', loadContent); // Remove any existing listeners
window.addEventListener('hashchange', (event) => {
  event.preventDefault();
  const newHash = window.location.hash.slice(1);
  
  // Prevent navigation to invalid routes
  if (!routes[newHash]) {
    const lastValidRoute = sessionStorage.getItem('lastValidRoute') || 'home';
    window.location.hash = lastValidRoute;
    return;
  }
  
  loadContent();
});
