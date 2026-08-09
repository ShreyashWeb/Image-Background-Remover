import React, { useState, useRef, useEffect } from 'react';
import { RotateCw, RefreshCw } from 'lucide-react';

const EditorStage = ({
  subjectUrl,
  originalUrl,
  backgroundType,    // 'transparent', 'color', 'gradient', 'image'
  backgroundValue,   // hex code, gradient css, or img src
  bgBlur,
  brightness,
  contrast,
  saturation,
  shadowEnabled,
  shadowColor,
  shadowBlur,
  shadowOffset,
  outlineEnabled,
  outlineColor,
  outlineSize,
  flipH,
  flipV,
  rotation,
  position,
  scale,
  setPosition,
  setScale,
  setRotation,
  mode,              // 'editor', 'slider'
  sliderOriginalSrc, // original image source for slider
  isSidebarCollapsed
}) => {
  const stageRef = useRef(null);
  const subjectRef = useRef(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [positionStart, setPositionStart] = useState({ x: 0, y: 0 });
  
  const [isRotating, setIsRotating] = useState(false);
  const [rotationStartAngle, setRotationStartAngle] = useState(0);
  const [baseRotation, setBaseRotation] = useState(0);
  
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartSize, setResizeStartSize] = useState({ width: 0, height: 0 });
  const [resizeStartScale, setResizeStartScale] = useState(1);
  const [resizeStartMouse, setResizeStartMouse] = useState({ x: 0, y: 0 });
  
  // Default sizes for image relative to container
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  // Reset image size when URL changes
  useEffect(() => {
    if (!subjectUrl) return;
    const img = new Image();
    img.src = subjectUrl;
    img.onload = () => {
      // Calculate fit size inside a 400x400 bounding box
      const maxW = 400;
      const maxH = 400;
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      
      const ratio = w / h;
      if (w > maxW) {
        w = maxW;
        h = w / ratio;
      }
      if (h > maxH) {
        h = maxH;
        w = h * ratio;
      }
      
      setImageSize({ width: w, height: h });
      // Reset position to center, scale to 1, rotation to 0
      setPosition({ x: 0, y: 0 });
      setScale(1);
      setRotation(0);
    };
  }, [subjectUrl]);

  // Handle Drag Start
  const handleDragStart = (e) => {
    if (e.target.closest('.resize-handle') || e.target.closest('.rotate-handle')) {
      return; // Handled separately
    }
    e.preventDefault();
    setIsDragging(true);
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    setDragStart({ x: clientX, y: clientY });
    setPositionStart({ ...position });
  };

  // Handle Rotation Start
  const handleRotateStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsRotating(true);
    
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    // Calculate center of the subject image
    const rect = subjectRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate angle of click from center
    const angle = Math.atan2(clientY - centerY, clientX - centerX);
    setRotationStartAngle(angle);
    setBaseRotation(rotation);
  };

  // Handle Resize Start
  const handleResizeStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    setResizeStartMouse({ x: clientX, y: clientY });
    setResizeStartScale(scale);
  };

  // Global mousemove / touchmove listeners for dragging, rotating, resizing
  useEffect(() => {
    const handleMove = (e) => {
      const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
      const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);
      
      if (clientX === undefined || clientY === undefined) return;

      if (isDragging) {
        const dx = clientX - dragStart.x;
        const dy = clientY - dragStart.y;
        setPosition({
          x: positionStart.x + dx,
          y: positionStart.y + dy
        });
      } else if (isRotating && subjectRef.current) {
        const rect = subjectRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const currentAngle = Math.atan2(clientY - centerY, clientX - centerX);
        const deltaAngle = currentAngle - rotationStartAngle;
        const deg = baseRotation + (deltaAngle * 180) / Math.PI;
        setRotation(Math.round(deg));
      } else if (isResizing) {
        // Calculate drag distance from starting click point
        const dx = clientX - resizeStartMouse.x;
        const dy = clientY - resizeStartMouse.y;
        
        // Simple distance-based scaling multiplier
        const dist = Math.sqrt(dx * dx + dy * dy);
        const direction = dx + dy > 0 ? 1 : -1;
        const factor = 0.005; // speed multiplier
        const newScale = Math.max(0.1, Math.min(4.0, resizeStartScale + direction * dist * factor));
        setScale(newScale);
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
      setIsRotating(false);
      setIsResizing(false);
    };

    if (isDragging || isRotating || isResizing) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, isRotating, isResizing, dragStart, positionStart, rotationStartAngle, baseRotation, resizeStartMouse, resizeStartScale, position, scale, rotation]);

  // Construct inline style for subject filters
  const filterStyle = {
    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
  };

  // Construct shadow filters
  let shadowFilter = '';
  if (shadowEnabled) {
    // Drop shadow color is passed as color. If hex or rgb, apply it.
    // CSS drop-shadow accepts: color x-offset y-offset blur
    shadowFilter = `drop-shadow(${shadowOffset}px ${shadowOffset}px ${shadowBlur}px ${shadowColor})`;
  }

  // Construct outline filters
  let outlineFilter = '';
  if (outlineEnabled && outlineSize > 0) {
    // Standard CSS stroke/outline around transparent image is simulated using text-shadow/drop-shadow or outline.
    // A clean way is using SVG filter, but multiple drop-shadows work well in browser:
    const size = outlineSize;
    const color = outlineColor;
    outlineFilter = `
      drop-shadow(${size}px 0px 0px ${color}) 
      drop-shadow(-${size}px 0px 0px ${color}) 
      drop-shadow(0px ${size}px 0px ${color}) 
      drop-shadow(0px -${size}px 0px ${color})
    `;
  }

  // Combine filters
  const combinedFilter = `${filterStyle.filter} ${shadowFilter} ${outlineFilter}`.trim();

  // Construct flip transform class
  let flipClass = '';
  if (flipH && flipV) flipClass = 'flip-both';
  else if (flipH) flipClass = 'flip-h';
  else if (flipV) flipClass = 'flip-v';

  // Construct background style for stage background layer
  const stageBackgroundStyle = {};
  if (backgroundType === 'color') {
    stageBackgroundStyle.backgroundColor = backgroundValue;
  } else if (backgroundType === 'gradient') {
    stageBackgroundStyle.background = backgroundValue;
  } else if (backgroundType === 'image' && backgroundValue) {
    stageBackgroundStyle.backgroundImage = `url(${backgroundValue})`;
    stageBackgroundStyle.backgroundSize = 'cover';
    stageBackgroundStyle.backgroundPosition = 'center';
    if (bgBlur > 0) {
      stageBackgroundStyle.filter = `blur(${bgBlur}px)`;
    }
  }

  // Draw subject style
  const subjectStyle = {
    width: `${imageSize.width * scale}px`,
    height: `${imageSize.height * scale}px`,
    transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
    zIndex: 2,
  };

  return (
    <div className="canvas-container" ref={stageRef}>
      {/* If mode is editor, show interactive stage */}
      {mode === 'editor' ? (
        <div className="compositor-stage">
          {/* Background layer */}
          {backgroundType !== 'transparent' && (
            <div 
              className="stage-background-layer"
              style={stageBackgroundStyle}
            />
          )}

          {/* Foreground Subject */}
          {subjectUrl && (
            <div 
              ref={subjectRef}
              className="subject-wrapper selected"
              style={subjectStyle}
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
            >
              <img 
                src={subjectUrl} 
                alt="Subject" 
                className={`subject-image ${flipClass}`}
                style={{ filter: combinedFilter, width: '100%', height: '100%' }}
              />

              {/* Rotation Handle */}
              <div 
                className="rotate-handle" 
                onMouseDown={handleRotateStart}
                onTouchStart={handleRotateStart}
                title="Rotate object"
              >
                <RefreshCw size={10} />
                <div className="rotate-line" />
              </div>

              {/* Resize Handles */}
              <div className="resize-handle handle-nw" onMouseDown={handleResizeStart} onTouchStart={handleResizeStart}></div>
              <div className="resize-handle handle-ne" onMouseDown={handleResizeStart} onTouchStart={handleResizeStart}></div>
              <div className="resize-handle handle-se" onMouseDown={handleResizeStart} onTouchStart={handleResizeStart}></div>
              <div className="resize-handle handle-sw" onMouseDown={handleResizeStart} onTouchStart={handleResizeStart}></div>
            </div>
          )}
        </div>
      ) : (
        // Slider mode: comparison between original and edited
        <div style={{ width: '100%', height: '100%' }}>
          {/* We will render the BeforeAfterSlider component here from App.jsx, so this container just hosts it. */}
        </div>
      )}
    </div>
  );
};

export default EditorStage;
export { RotateCw };
