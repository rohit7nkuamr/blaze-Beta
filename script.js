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
  menu: 'pages/menu.html',
  'gourmet-burgers': 'pages/gourmet-burgers.html',
  'wraps': 'pages/wraps.html',
  'sides': 'pages/sides.html',
  'pasta': 'pages/pasta.html',
  'main-course': 'pages/main-course.html',
  'chinese': 'pages/chinese.html',
  'og-momos': 'pages/og-momos.html',
  'cold-beverages': 'pages/cold-beverages.html',
  'hot-beverages': 'pages/hot-beverages.html',
  'desserts': 'pages/desserts.html',
  'indian': 'pages/indian.html'
};

// State management for routes
const routeState = {
  currentHash: window.location.hash.slice(1) || 'home',
  lastValidHash: '',
  isNavigating: false,
  loadAttempts: new Map(),
  maxAttempts: 3,
  debugMode: true
};

function loadContent(forcedHash = null) {
  // If the argument is an event, get the hash from window.location
  const hash = (forcedHash && typeof forcedHash === 'string') 
    ? forcedHash 
    : window.location.hash.slice(1) || 'home';
  
  const appElement = document.getElementById('app');
  
  if (!appElement) {
    console.error('App element not found');
    return;
  }

  // Prevent duplicate loads
  if (hash === routeState.currentHash && !forcedHash) {
    return;
  }

  // Validate route
  if (!routes[hash]) {
    console.warn(`Invalid route: ${hash}, defaulting to home`);
    window.location.hash = 'home';
    return;
  }

  routeState.currentHash = hash;
  appElement.classList.remove('loaded');

  // Show loading indicator
  const loadingIndicator = document.getElementById('loading-indicator');
  if (loadingIndicator) {
    loadingIndicator.style.display = 'flex';
  }

  fetch(routes[hash])
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    })
    .then(html => {
      appElement.innerHTML = html;
      
      // Initialize components
      requestAnimationFrame(() => {
        appElement.classList.add('loaded');
        initializePageComponents(hash);
      });

      // Hide loading indicator
      if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
      }

      routeState.lastValidHash = hash;
      localStorage.setItem('lastValidRoute', hash);
    })
    .catch(error => {
      console.error('Error loading content:', error);
      if (hash !== 'home') {
        window.location.hash = 'home';
      }
    });
}

function updateHorizontalNav() {
  const horizontalNav = document.querySelector('.horizontal-nav');
  if (!horizontalNav) return;

  const navItems = horizontalNav.querySelectorAll('.horizontal-nav-item');
  const currentHash = window.location.hash.slice(1) || 'home';

  navItems.forEach(item => {
    const href = item.getAttribute('href').slice(1);
    item.classList.toggle('active', href === currentHash);
  });
}

function initializePageComponents(hash) {
  // Update navigation
  const navItems = document.querySelectorAll('.horizontal-nav-item');
  navItems.forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('href') === `#${hash}`) {
      item.classList.add('active');
    }
  });

  // Handle image loading
  const images = document.querySelectorAll('img[data-src]');
  images.forEach(img => {
    if (!img.src || img.src.includes('data:image')) {
      img.src = img.dataset.src;
    }
  });

  // Update horizontal nav
  updateHorizontalNav();
}

// Initialize router
function initRouter() {
  const initialHash = window.location.hash.slice(1) || 'home';
  
  // Set up navigation listeners
  window.removeEventListener('hashchange', loadContent);
  window.addEventListener('hashchange', loadContent);
  
  // Load initial content
  loadContent(initialHash);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initRouter();
  
  // Handle hamburger menu
  const hamburger = document.querySelector('.hamburger');
  const sideNav = document.querySelector('.side-nav');
  
  if (hamburger && sideNav) {
    hamburger.addEventListener('click', () => {
      sideNav.classList.toggle('open');
      hamburger.classList.toggle('active');
    });
  }
});

// Export functions for use in other scripts
window.loadContent = loadContent;
window.initializePageComponents = initializePageComponents;
