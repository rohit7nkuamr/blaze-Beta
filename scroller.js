const scrollers = document.querySelectorAll(".scroller");

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  addAnimation(scrollers);
}

function addAnimation() {
  scrollers.forEach(scroller => {
    scroller.setAttribute("data-animated", true);
    
    const scrollerInner = scroller.querySelector(".scroller__inner");
    if (!scrollerInner) return;
    
    const scrollerContent = Array.from(scrollerInner.children);
    
    // Duplicate content for smooth infinite scroll
    scrollerContent.forEach(item => {
      const duplicatedItem = item.cloneNode(true);
      duplicatedItem.setAttribute('aria-hidden', true);
      scrollerInner.appendChild(duplicatedItem);
    });
  });
}

// Add smooth pause on hover
scrollers.forEach(scroller => {
  scroller.addEventListener('mouseenter', () => {
    const inner = scroller.querySelector('.scroller__inner');
    if (inner) {
      inner.style.animationPlayState = 'paused';
    }
  });
  
  scroller.addEventListener('mouseleave', () => {
    const inner = scroller.querySelector('.scroller__inner');
    if (inner) {
      inner.style.animationPlayState = 'running';
    }
  });
}); // Close the forEach loop
