/**
 * Utility functions for handling touch events on mobile devices
 */

interface TouchPosition {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  direction: 'horizontal' | 'vertical' | null;
}

/**
 * Initialize touch events for swipe gestures
 * @param element The element to add touch events to
 * @param onSwipeLeft Callback function for left swipe
 * @param onSwipeRight Callback function for right swipe
 * @param onSwipeUp Callback function for up swipe
 * @param onSwipeDown Callback function for down swipe
 * @param threshold Minimum distance required for a swipe (default: 50px)
 * @returns Cleanup function to remove event listeners
 */
export const initSwipeEvents = (
  element: HTMLElement,
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onSwipeUp?: () => void,
  onSwipeDown?: () => void,
  threshold = 50
): (() => void) => {
  if (!element) return () => {};
  
  const touchPosition: TouchPosition = {
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    direction: null,
  };
  
  const handleTouchStart = (e: TouchEvent) => {
    touchPosition.startX = e.touches[0].clientX;
    touchPosition.startY = e.touches[0].clientY;
  };
  
  const handleTouchMove = (e: TouchEvent) => {
    touchPosition.endX = e.touches[0].clientX;
    touchPosition.endY = e.touches[0].clientY;
    
    // Determine primary direction of movement
    const diffX = Math.abs(touchPosition.endX - touchPosition.startX);
    const diffY = Math.abs(touchPosition.endY - touchPosition.startY);
    
    touchPosition.direction = diffX > diffY ? 'horizontal' : 'vertical';
    
    // If horizontal swipe, prevent default to avoid page scrolling
    if (touchPosition.direction === 'horizontal' && Math.abs(diffX) > threshold) {
      e.preventDefault();
    }
  };
  
  const handleTouchEnd = () => {
    const diffX = touchPosition.endX - touchPosition.startX;
    const diffY = touchPosition.endY - touchPosition.startY;
    
    // Check if swipe distance exceeds threshold
    if (Math.abs(diffX) > threshold || Math.abs(diffY) > threshold) {
      if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal swipe
        if (diffX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (diffX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      } else {
        // Vertical swipe
        if (diffY > 0 && onSwipeDown) {
          onSwipeDown();
        } else if (diffY < 0 && onSwipeUp) {
          onSwipeUp();
        }
      }
    }
    
    // Reset values
    touchPosition.startX = 0;
    touchPosition.startY = 0;
    touchPosition.endX = 0;
    touchPosition.endY = 0;
    touchPosition.direction = null;
  };
  
  // Add event listeners
  element.addEventListener('touchstart', handleTouchStart, { passive: true });
  element.addEventListener('touchmove', handleTouchMove, { passive: false });
  element.addEventListener('touchend', handleTouchEnd, { passive: true });
  
  // Return cleanup function
  return () => {
    element.removeEventListener('touchstart', handleTouchStart);
    element.removeEventListener('touchmove', handleTouchMove);
    element.removeEventListener('touchend', handleTouchEnd);
  };
};

/**
 * Detect if the current device is a touch device
 * @returns Boolean indicating if the device supports touch
 */
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * Add tap highlight effect to an element
 * @param element The element to add tap highlight to
 * @returns Cleanup function to remove event listeners
 */
export const addTapHighlight = (element: HTMLElement): (() => void) => {
  if (!element) return () => {};
  
  const handleTouchStart = () => {
    element.classList.add('tap-highlight');
  };
  
  const handleTouchEnd = () => {
    setTimeout(() => {
      element.classList.remove('tap-highlight');
    }, 150);
  };
  
  element.addEventListener('touchstart', handleTouchStart, { passive: true });
  element.addEventListener('touchend', handleTouchEnd, { passive: true });
  element.addEventListener('touchcancel', handleTouchEnd, { passive: true });
  
  return () => {
    element.removeEventListener('touchstart', handleTouchStart);
    element.removeEventListener('touchend', handleTouchEnd);
    element.removeEventListener('touchcancel', handleTouchEnd);
  };
}; 