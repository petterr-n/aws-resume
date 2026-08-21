import { useEffect, useRef, useState } from "react";

/**
 * Adds a fade-and-rise as an element scrolls into view.
 *
 * Uses IntersectionObserver rather than a scroll listener, so it costs nothing
 * while idle, and disconnects after firing once — the animation is an entrance,
 * not a state the element should keep re-entering.
 */
export function useReveal() {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, shown ? "reveal reveal-in" : "reveal"];
}
