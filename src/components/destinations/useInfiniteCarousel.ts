import React, { useEffect, useRef } from 'react';

interface InfiniteCarousel {
  containerRef: React.RefObject<HTMLDivElement | null>;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
  handleTouchStart: () => void;
  handleContainerClick: () => void;
}

/**
 * rAF-driven infinite auto-scroll loop for the destination carousel.
 * Pauses while hovered / touched / clicked, resumes on pointer leave
 * (and on window scroll when the pointer is not over the strip).
 *
 * `deps` re-creates the loop whenever the rendered card list can change
 * (same dependency list the original inline effect used).
 */
export function useInfiniteCarousel(deps: React.DependencyList): InfiniteCarousel {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isPausedRef = useRef<boolean>(false);
  const isMouseOverRef = useRef<boolean>(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrameId: number;
    const speed = 0.8;

    const animateScroll = () => {
      if (container && !isPausedRef.current) {
        container.scrollLeft += speed;

        // Loop back to the start if we have scrolled to the absolute end
        const maxScrollLeft = container.scrollWidth - container.clientWidth;
        if (container.scrollLeft >= maxScrollLeft - 1) {
          container.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(animateScroll);
    };

    animationFrameId = requestAnimationFrame(animateScroll);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    const handleWindowScroll = () => {
      if (!isMouseOverRef.current) {
        isPausedRef.current = false;
      }
    };

    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleWindowScroll);
    };
  }, []);

  const handleMouseEnter = () => {
    isMouseOverRef.current = true;
    isPausedRef.current = true;
  };

  const handleMouseLeave = () => {
    isMouseOverRef.current = false;
    isPausedRef.current = false;
  };

  const handleTouchStart = () => {
    isPausedRef.current = true;
  };

  const handleContainerClick = () => {
    isPausedRef.current = true;
  };

  return {
    containerRef,
    handleMouseEnter,
    handleMouseLeave,
    handleTouchStart,
    handleContainerClick,
  };
}
