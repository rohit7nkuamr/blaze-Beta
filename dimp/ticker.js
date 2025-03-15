/*************************************************************
 * Ticker Navigator (ticker.js)
 * A high-quality horizontal scroller that detects the most
 * visible button after the user stops scrolling (debounced).
 * When the detection fires, it triggers a page switch.
 *
 * All navigator text is red (#b91c1c) at 40% opacity by default,
 * with the active button at 100% opacity.
 *************************************************************/

export function initTicker({
  containerId,
  buttons,
  tickSoundSrc,
  separatorSrc,
  fontFamily = 'sans-serif'
}) {
  injectTickerStyles(fontFamily);

  const containerEl = document.getElementById(containerId);
  if (!containerEl) {
    console.error(`Ticker: Container element with ID "${containerId}" not found.`);
    return;
  }

  const navigatorContainer = document.createElement('div');
  navigatorContainer.classList.add('ticker-navigator-container');

  const navigatorScrollable = document.createElement('div');
  navigatorScrollable.classList.add('ticker-navigator-scrollable');
  navigatorScrollable.setAttribute('id', `${containerId}-scrollable`);

  buttons.forEach((btn, index) => {
    const buttonEl = document.createElement('button');
    buttonEl.classList.add('ticker-nav-button');
    buttonEl.textContent = btn.label;
    buttonEl.dataset.page = btn.page;
    navigatorScrollable.appendChild(buttonEl);

    if (index < buttons.length - 1) {
      const separatorEl = document.createElement('img');
      separatorEl.classList.add('ticker-separator-svg');
      separatorEl.src = separatorSrc;
      separatorEl.alt = 'separator';
      navigatorScrollable.appendChild(separatorEl);
    }
  });

  navigatorContainer.appendChild(navigatorScrollable);
  containerEl.appendChild(navigatorContainer);

  // Optional tick sound
  let tickSoundEl = null;
  if (tickSoundSrc) {
    tickSoundEl = document.createElement('audio');
    tickSoundEl.id = `${containerId}-tickSound`;
    tickSoundEl.src = tickSoundSrc;
    tickSoundEl.preload = 'auto';
    containerEl.appendChild(tickSoundEl);
  }

  // Click logic: on button click, scroll smoothly to that button.
  const navButtons = Array.from(navigatorScrollable.querySelectorAll('.ticker-nav-button'));
  navButtons.forEach(button => {
    button.addEventListener('click', () => {
      navigatorScrollable.scrollTo({
        left: button.offsetLeft,
        behavior: 'smooth'
      });
    });
  });

  // Debounce timer for scroll events.
  let scrollTimeout = null;
  let currentSelectedIndex = null;
  let isManualScrolling = false;
  const debounceDelay = 200; // milliseconds

  // Track touch events for manual scrolling detection
  navigatorScrollable.addEventListener('touchstart', () => {
    isManualScrolling = true;
  }, { passive: true });

  navigatorScrollable.addEventListener('touchend', () => {
    // Set a small timeout to allow the scroll to settle
    setTimeout(() => {
      isManualScrolling = false;
    }, 50);
  }, { passive: true });

  // Enhanced scroll event that detects edge buttons
  navigatorScrollable.addEventListener('scroll', () => {
    if (scrollTimeout) clearTimeout(scrollTimeout);
    
    // Check for buttons hitting screen edges during manual scrolling
    if (isManualScrolling) {
      detectEdgeButtons();
    }
    
    // Still use the debounced detection for when scrolling stops
    scrollTimeout = setTimeout(() => {
      detectMostVisibleButton();
    }, debounceDelay);
  });
  
  window.addEventListener('load', () => {
    setTimeout(detectMostVisibleButton, debounceDelay);
  });

  // Function to detect buttons that hit the screen edges during scrolling
  function detectEdgeButtons() {
    const containerRect = navigatorScrollable.getBoundingClientRect();
    const leftEdge = containerRect.left;
    const rightEdge = containerRect.right;
    
    // Check each button to see if it's at the edge
    navButtons.forEach((btn, index) => {
      if (index === currentSelectedIndex) return; // Skip current button
      
      const btnRect = btn.getBoundingClientRect();
      
      // Check if button's right edge is just entering the left side of the screen
      if (btnRect.right >= leftEdge && btnRect.right <= leftEdge + btnRect.width / 2) {
        updateSelected(index);
        return;
      }
      
      // Check if button's left edge is just entering the right side of the screen
      if (btnRect.left <= rightEdge && btnRect.left >= rightEdge - btnRect.width / 2) {
        updateSelected(index);
        return;
      }
    });
  }

  function detectMostVisibleButton() {
    const containerRect = navigatorScrollable.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;
    let candidateIndex = null;
    let candidateDistance = Infinity;

    navButtons.forEach((btn, index) => {
      const btnRect = btn.getBoundingClientRect();
      const btnCenter = btnRect.left + btnRect.width / 2;
      const distance = Math.abs(btnCenter - containerCenter);
      if (distance < candidateDistance) {
        candidateDistance = distance;
        candidateIndex = index;
      }
    });

    if (candidateIndex !== null && candidateIndex !== currentSelectedIndex) {
      updateSelected(candidateIndex);
    }
  }

  function updateSelected(index) {
    if (currentSelectedIndex !== null && navButtons[currentSelectedIndex]) {
      navButtons[currentSelectedIndex].classList.remove('selected');
    }
    currentSelectedIndex = index;
    navButtons[index].classList.add('selected');
    switchPage(navButtons[index].dataset.page);
    playTickSound(tickSoundEl);
    provideHapticFeedback();
  }

  function switchPage(pageName) {
    if (window.location.hash !== '#' + pageName) {
      window.location.hash = '#' + pageName;
      console.log(`Switching to page: ${pageName}`);
    }
  }

  function playTickSound(audioEl) {
    if (!audioEl) return;
    audioEl.currentTime = 0;
    audioEl.play().catch(err => {
      console.warn('Tick sound play was blocked:', err);
    });
  }

  function provideHapticFeedback() {
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  }
}

function injectTickerStyles(fontFamily) {
  if (document.getElementById('tickerStyles')) return;
  const styleEl = document.createElement('style');
  styleEl.id = 'tickerStyles';
  styleEl.textContent = `
    .ticker-navigator-container {
      width: 100vw;
      overflow: hidden;
      background-color: #fff;
      position: relative;
    }
    .ticker-navigator-scrollable {
      display: flex;
      flex-direction: row;
      align-items: center;
      overflow-x: auto;
      /* Removed scroll-snap to allow free sliding */
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
      width: 100%;
      -ms-overflow-style: none; /* IE/Edge */
      scrollbar-width: none; /* Firefox */
    }
    
    .ticker-navigator-scrollable::-webkit-scrollbar {
      display: none; /* Chrome/Safari */
      width: 0;
      height: 0;
    }
    .ticker-navigator-scrollable::-webkit-scrollbar {
      display: none;
    }
    .ticker-nav-button {
      flex: 0 0 auto;
      border: none;
      background: none;
      padding: 1rem;
      font-size: 1rem;
      color: #b91c1c;
      opacity: 0.4;
      cursor: pointer;
      font-family: ${fontFamily};
      transition: opacity 0.2s ease;
    }
    .ticker-nav-button:focus {
      outline: none;
    }
    .ticker-nav-button.selected {
      opacity: 1;
      font-weight: bold;
    }
    .ticker-separator-svg {
      flex: 0 0 auto;
      width: 10px;
      height: auto;
      margin: 0 2px;
    }
  `;
  document.head.appendChild(styleEl);
}
