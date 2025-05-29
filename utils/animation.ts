/**
 * Utility functions for animations throughout the website
 */

/**
 * Initializes scroll animations for elements with the 'animate-on-scroll' class
 * This function can be called after dynamic content is loaded
 */
export const initScrollAnimations = (): IntersectionObserver | null => {
  if (typeof window !== 'undefined') {
    const animateOnScrollElements = document.querySelectorAll('.animate-on-scroll');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });
    
    animateOnScrollElements.forEach(element => {
      observer.observe(element);
    });
    
    return observer;
  }
  return null;
};

/**
 * Adds a pulse animation to an element
 * @param element The element to animate
 * @param duration Duration of the animation in milliseconds
 */
export const addPulseAnimation = (element: HTMLElement, duration = 1000): void => {
  if (!element) return;
  
  element.style.animation = `pulse ${duration}ms ease`;
  
  // Remove animation after it completes
  setTimeout(() => {
    element.style.animation = '';
  }, duration);
};

/**
 * Adds staggered animations to a list of elements
 * @param elements NodeList or array of elements to animate
 * @param animationClass The CSS animation class to add
 * @param delayBetween Delay between each element's animation in milliseconds
 */
export const addStaggeredAnimations = (
  elements: NodeListOf<Element> | HTMLElement[],
  animationClass = 'fade-in',
  delayBetween = 100
): void => {
  if (!elements || !elements.length) return;
  
  Array.from(elements).forEach((element, index) => {
    const htmlElement = element as HTMLElement;
    setTimeout(() => {
      htmlElement.classList.add(animationClass);
    }, index * delayBetween);
  });
};

/**
 * Reinitializes animations on page navigation
 * Call this function when the route changes
 */
export const refreshAnimations = (): void => {
  if (typeof window !== 'undefined') {
    // Reset any existing animations
    const animatedElements = document.querySelectorAll('[class*="fade-"], [class*="scale-"]');
    animatedElements.forEach(element => {
      // Force a reflow to restart animations
      element.classList.remove('visible');
      // Cast to HTMLElement to access offsetWidth
      void (element as HTMLElement).offsetWidth; // Trigger reflow
      element.classList.add('visible');
    });
    
    // Reinitialize scroll animations
    initScrollAnimations();
  }
}; 