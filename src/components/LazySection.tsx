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
const LazySection: React.FC<LazySectionProps> = ({ id, children, minHeight = "200px" }) => {
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Listen for force-mount events from sidebar navigation
  useEffect(() => {
    if (mounted) return;

    const handleForceMount = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail === id) {
        setMounted(true);
      }
    };

    window.addEventListener('force-mount-section', handleForceMount);
    return () => window.removeEventListener('force-mount-section', handleForceMount);
  }, [mounted, id]);

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

  return (
    <div id={id} ref={ref}>
      {mounted ? children : <div style={{ minHeight }} />}
    </div>
  );
};

export default LazySection;
