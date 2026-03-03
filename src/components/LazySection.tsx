import React, { useState, useRef, useEffect, ReactNode } from "react";

interface LazySectionProps {
  id: string;
  children: ReactNode;
  minHeight?: string;
}

/**
 * Only mounts children once the section is near the viewport (within 600px).
 * Once mounted, children stay mounted to preserve state.
 */
const LazySection: React.FC<LazySectionProps> = ({ id, children, minHeight = "80px" }) => {
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mounted) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMounted(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px" }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [mounted]);

  // Also mount immediately if scrollIntoView targets this element
  useEffect(() => {
    if (mounted) return;
    const el = ref.current;
    if (!el) return;

    const handleScroll = () => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 600 && rect.bottom > -600) {
        setMounted(true);
      }
    };

    // Check on next frame in case scrollIntoView was called
    const frameId = requestAnimationFrame(handleScroll);
    return () => cancelAnimationFrame(frameId);
  });

  return (
    <div id={id} ref={ref}>
      {mounted ? children : <div style={{ minHeight }} />}
    </div>
  );
};

export default LazySection;
