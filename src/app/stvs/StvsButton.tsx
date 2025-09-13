import React, { useState } from "react";

interface StvsButtonProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const StvsButton: React.FC<StvsButtonProps> = ({ label, active = false, onClick, style }) => {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      className="absolute flex flex-col items-center justify-center rounded-md border-2 border-gray-700 transition-all select-none bg-zinc-950"
      style={{
        boxShadow: pressed ? '0 1px 2px #111' : '0 2px 8px #111',
        transform: pressed ? 'scale(0.96) translateY(2px)' : 'none',
        fontFamily: 'impact',
        overflow: 'hidden',
        transition: 'box-shadow 0.1s, transform 0.1s',
        ...style,
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      onClick={onClick}
    >
          {/* Horizontal line through the middle */}
          <div
            className="absolute left-0 w-full"
            style={{
              top: '50%',
              height: '2.5px',
              background: 'rgba(255,255,255,0.95)',
              boxShadow: 'none',
              transform: 'translateY(-50%)',
              zIndex: 5,
            }}
          />
          <span
            className="absolute top-2 left-1/2 -translate-x-1/2 z-10 font-normal text-white tracking-widest"
            style={{
              letterSpacing: 0,
              fontFamily: `'Arial Rounded MT'`,
              textShadow: 'none',
              fontSize: 'clamp(0.8rem, 1.5vw, 1.3rem)',
              maxWidth: '90%',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              textAlign: 'center',
              lineHeight: 1.1,
            }}
            title={label}
          >
            {label}
          </span>
          {/* Gloss overlay (should be on top of line and text) */}
          <div
            className="absolute left-0 top-0 w-full h-1/2 rounded-t-md pointer-events-none"
            style={{
              background: 'linear-gradient(180deg,rgba(255,255,255,0.35) 0%,rgba(255,255,255,0.10) 60%,rgba(255, 255, 255, 0) 100%)',
              zIndex: 20,
            }}
          />
          {/* Diodes absolutely positioned near the line, not affecting text layout */}
          <div className="absolute left-1/2 -translate-x-1/2 z-10 flex gap-2" style={{ top: 'calc(50% + 8px)' }}>
            <span className="w-2 h-2 rounded-full bg-amber-500 shadow" style={{
              boxShadow: '0 0 8px 2px #ffcc00ff, 0 0 2px #ffcc00ff',
              filter: 'brightness(1.2) drop-shadow(0 0 6px #ffcc00ff)',
            }} />
            <span className="w-2 h-2 rounded-full bg-amber-500 shadow" style={{
              boxShadow: '0 0 8px 2px #ffcc00ff, 0 0 2px #ffcc00ff',
              filter: 'brightness(1.2) drop-shadow(0 0 6px #ffcc00ff)',
            }} />
          </div>
        </button>
  );
};

export default StvsButton;
