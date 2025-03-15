// dissolve-animation.js - Dissolve animations for menu transitions

// Self-executing function to avoid global scope pollution
(function() {
  // List of all menu sections in order
  const menuSections = [
    'gourmet-burgers',
    'wraps',
    'sides',
    'pasta',
    'main-course',
    'chinese',
    'og-momos',
    'cold-beverages',
    'hot-beverages'
  ];

  // Cache DOM references
  let menuContainer;
  
  // Variables for animations
  let animating = false;
  
  // Debounce function to limit function calls
  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  // Initialize when DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    // Wait for the content to load before initializing
    setTimeout(initMenuContainer, 300);
  });

  // Initialize when hash changes (page navigation)
  window.addEventListener('hashchange', function() {
    // Wait for the content to load before initializing
    setTimeout(initMenuContainer, 300);
  });

  // Function to initialize menu container
  function initMenuContainer() {
    // Only run this on pages that have the menu container
    menuContainer = document.querySelector('.menu-container');
    if (!menuContainer) return;
  }
  
  // Function to animate the dissolve transition - optimized for performance
  function animateDissolveTransition(direction, targetSection) {
    // Set animating flag to prevent multiple transitions
    animating = true;
    
    // Get the current menu image
    const menuSvg = document.querySelector('.menu-svg');
    if (!menuSvg) {
      // If no image, just navigate
      window.location.hash = '#' + targetSection;
      animating = false;
      return;
    }
    
    // Create a snapshot of the current image
    const snapshot = menuSvg.cloneNode(true);
    
    // Use getBoundingClientRect for more accurate positioning
    const rect = menuSvg.getBoundingClientRect();
    snapshot.style.position = 'absolute';
    snapshot.style.top = rect.top + 'px';
    snapshot.style.left = rect.left + 'px';
    snapshot.style.width = rect.width + 'px';
    snapshot.style.height = rect.height + 'px';
    snapshot.style.zIndex = '5';
    
    // Use transform for better performance
    snapshot.style.transform = 'translate3d(0,0,0)';
    snapshot.style.willChange = 'transform, opacity';
    
    // Add the snapshot to the container
    menuContainer.appendChild(snapshot);
    
    // Update horizontal navigation before changing the hash
    updateHorizontalNavForSwipe(targetSection);
    
    // Use requestAnimationFrame for smoother animations
    requestAnimationFrame(() => {
      // Add the appropriate dissolve-out class based on direction
      if (direction === 'next') {
        snapshot.classList.add('dissolve-next-out');
      } else {
        snapshot.classList.add('dissolve-prev-out');
      }
      
      // Navigate to the target section
      window.location.hash = '#' + targetSection;
    });
    
    // Listen for the hashchange event to complete the animation
    const hashChangeHandler = function() {
      // Remove the event listener
      window.removeEventListener('hashchange', hashChangeHandler);
      
      // Get the new menu image
      setTimeout(() => {
        const newMenuSvg = document.querySelector('.menu-svg');
        if (newMenuSvg) {
          // Prepare for animation
          newMenuSvg.style.willChange = 'transform, opacity';
          
          // Add the appropriate dissolve-in class based on direction
          requestAnimationFrame(() => {
            if (direction === 'next') {
              newMenuSvg.classList.add('dissolve-next-in');
            } else {
              newMenuSvg.classList.add('dissolve-prev-in');
            }
            
            // Remove the classes after animation completes
            setTimeout(() => {
              newMenuSvg.classList.remove('dissolve-next-in', 'dissolve-prev-in');
              newMenuSvg.style.willChange = 'auto';
              
              // Remove the snapshot
              if (snapshot.parentNode) {
                snapshot.parentNode.removeChild(snapshot);
              }
              
              // Reset animating flag
              animating = false;
              
              // Reinitialize menu container
              setTimeout(initMenuContainer, 100);
            }, 500);
          });
        } else {
          // If no new image, just reset
          animating = false;
        }
      }, 50);
    };
    
    // Add the hashchange event listener
    window.addEventListener('hashchange', hashChangeHandler);
  }
  
  // Function to update horizontal navigation during navigation
  function updateHorizontalNavForSwipe(targetSection) {
    const horizontalNav = document.querySelector('.horizontal-nav');
    if (!horizontalNav) return;
    
    // Remove active class from all items
    const navItems = horizontalNav.querySelectorAll('.horizontal-nav-item');
    navItems.forEach(item => {
      item.classList.remove('active');
      
      // Get the href attribute and extract the section name
      const href = item.getAttribute('href');
      if (href && href === '#' + targetSection) {
        item.classList.add('active');
      }
    });
    
    // Get the active item
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
  }
  
  // Handle window resize
  window.addEventListener('resize', debounce(() => {
    // Update window width for calculations
    windowWidth = window.innerWidth;
  }, 100));
})();
