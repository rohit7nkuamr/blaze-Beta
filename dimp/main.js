const scrollers = document.querySelectorAll(".scroller")

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  addAnimation(scrollers)
}

function addAnimation() {
    scrollers.forEach(scroller => {
        scroller.setAttribute("data-animated", true)

         const scrollerInner = scroller.querySelector(".scroller__inner")
         const scrollerContent = Array.from(scrollerInner.children);

         console.log(scrollerContent);
    });
}