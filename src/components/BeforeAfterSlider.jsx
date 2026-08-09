import React, { useState, useRef, useEffect } from 'react';
import { ChevronsLeftRight } from 'lucide-react';

const BeforeAfterSlider = ({ originalSrc, editedSrc }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseDown = () => {
    isDragging.current = true;
  };

  const handleTouchStart = () => {
    isDragging.current = true;
  };

  useEffect(() => {
    const handleMouseUp = () => {
      isDragging.current = false;
    };

    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      handleMove(e.clientX);
    };

    const handleTouchMove = (e) => {
      if (!isDragging.current) return;
      if (e.touches && e.touches[0]) {
        handleMove(e.touches[0].clientX);
      }
    };

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchend', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <div className="slider-view-wrapper" ref={containerRef}>
      {/* Background layer: Original Image (Before) */}
      <div className="slider-image-layer slider-image-before">
        <img 
          src={originalSrc} 
          alt="Original" 
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
        <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
          Original
        </div>
      </div>

      {/* Foreground layer: Processed Image (After) */}
      <div 
        className="slider-image-layer slider-image-after"
        style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
      >
        {/* We can use the exported composite image or raw transparent png. Since the editedSrc is a dataURL or Blob URL of the composite/bg-removed image, we display it here. */}
        <img 
          src={editedSrc} 
          alt="Processed" 
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
        <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'var(--color-primary)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
          Result
        </div>
      </div>

      {/* Divider line */}
      <div 
        className="slider-divider-line"
        style={{ left: `${sliderPosition}%` }}
      ></div>

      {/* Slider handle */}
      <div 
        className="slider-divider-handle"
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <ChevronsLeftRight size={20} />
      </div>
    </div>
  );
};

export default BeforeAfterSlider;
