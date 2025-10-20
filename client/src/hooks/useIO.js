import { useEffect, useRef, useState } from 'react';

export default function useIO(threshold = 0.1, selector = '[data-item-id]') {
  const [visibleItems, setVisibleItems] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const itemId = entry.target.dataset.itemId;
          if (itemId) {
            const delay = parseInt(entry.target.dataset.delay) || 0;
            setTimeout(() => {
              setVisibleItems(prev => ({ ...prev, [itemId]: true }));
            }, delay);
          }

          setIsVisible(true);
        }
      });
    },
      { threshold }
    );

    if (ref.current) {
      if (selector) {
        const items = ref.current.querySelectorAll('[data-item-id]');
        items.forEach(item => observer.observe(item));
      } else {
        observer.observe(ref.current);
      }
    }

    return () => observer.disconnect();

  }, [threshold, selector]);

  return { ref, visibleItems, isVisible };
}
