import { useEffect, useRef, type RefObject, useState, useCallback } from 'react';

export function useScrollToBottom<T extends HTMLElement>(): [
  RefObject<T>,
  RefObject<T>,
  () => void
] {
  const containerRef = useRef<T>(null);
  const endRef = useRef<T>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Function to force scrolling to the bottom
  const forceScrollToBottom = useCallback(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      setShouldAutoScroll(true);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const end = endRef.current;

    if (container && end) {
      // Track if user has manually scrolled up
      const handleScroll = () => {
        if (!container) return;
        
        const isAtBottom = Math.abs(
          (container.scrollHeight - container.scrollTop) - container.clientHeight
        ) < 10;
        
        setShouldAutoScroll(isAtBottom);
      };
      
      container.addEventListener('scroll', handleScroll);

      const observer = new MutationObserver(() => {
        // Only auto-scroll if we're already at the bottom or haven't scrolled up manually
        if (shouldAutoScroll) {
          end.scrollIntoView({ behavior: 'instant', block: 'end' });
        }
      });

      observer.observe(container, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      });

      return () => {
        observer.disconnect();
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [shouldAutoScroll]);

  return [containerRef, endRef, forceScrollToBottom];
}
