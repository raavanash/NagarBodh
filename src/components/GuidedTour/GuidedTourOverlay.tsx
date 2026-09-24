import React, { useEffect, useState } from 'react';

interface GuidedTourOverlayProps {
  targetRect: DOMRect | null;
  onOverlayClick?: () => void;
}

export const GuidedTourOverlay: React.FC<GuidedTourOverlayProps> = ({ targetRect, onOverlayClick }) => {
  const [viewport, setViewport] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const padding = 6;
  const borderRadius = 8;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9990,
        pointerEvents: 'none'
      }}
    >
      <svg
        width={viewport.width}
        height={viewport.height}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
      >
        <defs>
          <mask id="guided-tour-spotlight-mask">
            {/* White area = visible backdrop */}
            <rect x="0" y="0" width={viewport.width} height={viewport.height} fill="#ffffff" />
            {/* Black area = cut out spotlight hole */}
            {targetRect && (
              <rect
                x={targetRect.left - padding}
                y={targetRect.top - padding}
                width={targetRect.width + padding * 2}
                height={targetRect.height + padding * 2}
                rx={borderRadius}
                ry={borderRadius}
                fill="#000000"
              />
            )}
          </mask>
        </defs>

        {/* Dimmed Backdrop Mask */}
        <rect
          x="0"
          y="0"
          width={viewport.width}
          height={viewport.height}
          fill="rgba(15, 23, 42, 0.65)"
          mask="url(#guided-tour-spotlight-mask)"
          style={{ pointerEvents: 'auto' }}
          onClick={onOverlayClick}
        />

        {/* Highlight Pulse Ring around Target */}
        {targetRect && (
          <rect
            x={targetRect.left - padding}
            y={targetRect.top - padding}
            width={targetRect.width + padding * 2}
            height={targetRect.height + padding * 2}
            rx={borderRadius}
            ry={borderRadius}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeDasharray="6 4"
            style={{
              pointerEvents: 'none',
              filter: 'drop-shadow(0 0 8px rgba(37, 99, 235, 0.6))'
            }}
          />
        )}
      </svg>
    </div>
  );
};
