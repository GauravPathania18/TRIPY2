import { useState, useEffect } from 'react';

interface AutoHideHeader {
  isScrolled: boolean;
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
}

/**
 * Scroll behavior for the main header:
 * - near the top (<= 40px) the header is transparent and always visible
 * - scrolling down past 100px collapses the header (unless the mobile menu is open)
 * - scrolling up more than 10px reveals it again
 */
export function useAutoHideHeader(mobileMenuOpen: boolean): AutoHideHeader {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 40) {
        setIsScrolled(false);
        setIsVisible(true);
      } else {
        setIsScrolled(true);
        // Scroll down: collapse navbar. Scroll up: optionally expand or keep collapsed.
        // But do not collapse if mobile menu is open
        if (currentScrollY > lastScrollY && currentScrollY > 100 && !mobileMenuOpen) {
          setIsVisible(false);
        } else if (currentScrollY < lastScrollY && Math.abs(currentScrollY - lastScrollY) > 10) {
          // If scrolling up significantly, auto-reveal for friendly UX
          setIsVisible(true);
        }
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, mobileMenuOpen]);

  return { isScrolled, isVisible, setIsVisible };
}

export default useAutoHideHeader;
