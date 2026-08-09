import React, { useState, useEffect, useRef } from 'react';
import { Camera, Image as ImageIcon, Sparkles, HelpCircle, History, Menu, Trash2 } from 'lucide-react';
import { removeBackground } from '@imgly/background-removal';

// Component imports
import Dropzone from './components/Dropzone';
import LoadingIndicator from './components/LoadingIndicator';
import EditorStage from './components/EditorStage';
import ControlPanel from './components/ControlPanel';
import BeforeAfterSlider from './components/BeforeAfterSlider';
import HistorySidebar from './components/HistorySidebar';
import CameraCapture from './components/CameraCapture';

function App() {
  // Session History List
  const [historyItems, setHistoryItems] = useState([]);
  const [activeHistoryIdx, setActiveHistoryIdx] = useState(-1);

  // Layout states
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // App running states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState('');
  const [processProgress, setProcessProgress] = useState(0);
  const [error, setError] = useState(null);

  // Editor mode: 'editor' or 'slider'
  const [editorMode, setEditorMode] = useState('editor');
  const [activeTab, setActiveTab] = useState('backgrounds');

  // Stage states for subject positioning
  const [subjectPosition, setSubjectPosition] = useState({ x: 0, y: 0 });
  const [subjectScale, setSubjectScale] = useState(1);
  const [subjectRotation, setSubjectRotation] = useState(0);

  // Stage filters states
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  // Background states
  const [backgroundType, setBackgroundType] = useState('transparent'); // transparent, color, gradient, image
  const [backgroundValue, setBackgroundValue] = useState('');
  const [bgBlur, setBgBlur] = useState(0);

  // Subject Visual effects states
  const [shadowEnabled, setShadowEnabled] = useState(false);
  const [shadowColor, setShadowColor] = useState('#000000');
  const [shadowBlur, setShadowBlur] = useState(10);
  const [shadowOffset, setShadowOffset] = useState(8);

  const [outlineEnabled, setOutlineEnabled] = useState(false);
  const [outlineColor, setOutlineColor] = useState('#ffffff');
  const [outlineSize, setOutlineSize] = useState(4);

  // Export settings
  const [exportFormat, setExportFormat] = useState('png'); // png, jpeg
  const [exportQuality, setExportQuality] = useState(0.9);

  // Active loaded image references
  const activeItem = activeHistoryIdx >= 0 ? historyItems[activeHistoryIdx] : null;

  // Process selected image file
  const handleImageSelect = async (file) => {
    setIsProcessing(true);
    setError(null);
    setProcessProgress(0);
    setProcessStatus('Initializing AI...');

    try {
      // Create local URL for original image
      const originalUrl = URL.createObjectURL(file);
      
      // Get image dimensions
      const originalDimensions = await new Promise((resolve) => {
        const img = new Image();
        img.src = originalUrl;
        img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      });

      // Run background removal model
      const config = {
        progress: (key, current, total) => {
          setProcessStatus(`${key}`);
          const pct = (current / total) * 100;
          setProcessProgress(pct);
        }
      };

      const resultBlob = await removeBackground(file, config);
      const transparentUrl = URL.createObjectURL(resultBlob);

      // Create a thumbnail URL (smaller version or same transparent url)
      const thumbnailUrl = transparentUrl;

      const newItem = {
        id: `img-${Date.now()}`,
        name: file.name.split('.')[0] || 'Image',
        size: file.size,
        originalUrl,
        transparentUrl,
        thumbnailUrl,
        dimensions: originalDimensions,
        file
      };

      setHistoryItems(prev => [newItem, ...prev]);
      setActiveHistoryIdx(0);
      setIsProcessing(false);
      setEditorMode('editor');
    } catch (err) {
      console.error('AI background removal error:', err);
      setError('Background removal failed. Please try a different image or try again.');
      setIsProcessing(false);
    }
  };

  // Upload custom background image handler
  const handleUploadBgImage = (url) => {
    setBackgroundType('image');
    setBackgroundValue(url);
  };

  // Reset current subject position edits
  const handleResetEdits = () => {
    setSubjectPosition({ x: 0, y: 0 });
    setSubjectScale(1);
    setSubjectRotation(0);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setFlipH(false);
    setFlipV(false);
    setShadowEnabled(false);
    setOutlineEnabled(false);
    setBgBlur(0);
  };

  // Perform canvas compositing and trigger file download
  const handleDownload = async () => {
    if (!activeItem) return;

    // 1. Create offscreen canvas
    const canvas = document.createElement('canvas');
    const origW = activeItem.dimensions.width;
    const origH = activeItem.dimensions.height;
    canvas.width = origW;
    canvas.height = origH;
    const ctx = canvas.getContext('2d');

    // 2. Draw Background Layer
    if (backgroundType === 'color') {
      ctx.fillStyle = backgroundValue;
      ctx.fillRect(0, 0, origW, origH);
    } else if (backgroundType === 'gradient') {
      // Simple parse of color presets from CSS
      let colors = ['#f43f5e', '#8b5cf6']; // fallback
      const matches = backgroundValue.match(/#[0-9a-fA-F]{6}/g);
      if (matches && matches.length >= 2) {
        colors = matches;
      }
      const grad = ctx.createLinearGradient(0, 0, origW, origH);
      colors.forEach((col, idx) => {
        grad.addColorStop(idx / (colors.length - 1), col);
      });
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, origW, origH);
    } else if (backgroundType === 'image' && backgroundValue) {
      const bgImg = new Image();
      bgImg.src = backgroundValue;
      await new Promise(resolve => bgImg.onload = resolve);
      
      if (bgBlur > 0) {
        // Calculate preview scale ratio (fitted stage dimension vs original)
        // Stage displays image in a bounded box. Let's find scale.
        // We will default to a 400px wide reference for scale, or calculate ratio.
        const maxW = 400;
        const maxH = 400;
        let w = origW;
        let h = origH;
        const ratio = w / h;
        if (w > maxW) {
          w = maxW;
          h = w / ratio;
        }
        if (h > maxH) {
          h = maxH;
          w = h * ratio;
        }
        const scaleRatio = origW / w;
        ctx.filter = `blur(${bgBlur * scaleRatio}px)`;
      }
      ctx.drawImage(bgImg, 0, 0, origW, origH);
      ctx.filter = 'none';
    }

    // 3. Draw Foreground Layer
    const subjImg = new Image();
    subjImg.src = activeItem.transparentUrl;
    await new Promise(resolve => subjImg.onload = resolve);

    // Calculate scale ratio of subject
    const maxW = 400;
    const maxH = 400;
    let w = origW;
    let h = origH;
    const ratio = w / h;
    if (w > maxW) {
      w = maxW;
      h = w / ratio;
    }
    if (h > maxH) {
      h = maxH;
      w = h * ratio;
    }
    const previewScaleRatio = w / origW;

    // Target dimensions & offsets on original resolution
    const exportW = origW * subjectScale;
    const exportH = origH * subjectScale;
    const exportX = origW / 2 + subjectPosition.x / previewScaleRatio;
    const exportY = origH / 2 + subjectPosition.y / previewScaleRatio;

    ctx.save();
    ctx.translate(exportX, exportY);
    ctx.rotate((subjectRotation * Math.PI) / 180);

    // Flip context if needed
    let sx = 1;
    let sy = 1;
    if (flipH) sx = -1;
    if (flipV) sy = -1;
    ctx.scale(sx, sy);

    // Apply color filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

    // Draw Shadow
    if (shadowEnabled) {
      const scaleMultiplier = 1 / previewScaleRatio;
      ctx.shadowColor = shadowColor;
      ctx.shadowBlur = shadowBlur * scaleMultiplier;
      ctx.shadowOffsetX = shadowOffset * scaleMultiplier;
      ctx.shadowOffsetY = shadowOffset * scaleMultiplier;
    }

    // Draw Outline / Stroke
    if (outlineEnabled && outlineSize > 0) {
      // Create temporary offscreen canvas to mask colors
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = exportW;
      tempCanvas.height = exportH;
      const tempCtx = tempCanvas.getContext('2d');

      // Draw image scaled
      tempCtx.drawImage(subjImg, 0, 0, exportW, exportH);

      // Mask with stroke color
      tempCtx.globalCompositeOperation = 'source-in';
      tempCtx.fillStyle = outlineColor;
      tempCtx.fillRect(0, 0, exportW, exportH);

      // Draw outlines offset in a circle
      const step = Math.PI / 8; // 16 steps
      const radius = outlineSize / previewScaleRatio;
      for (let angle = 0; angle < 2 * Math.PI; angle += step) {
        const ox = Math.cos(angle) * radius;
        const oy = Math.sin(angle) * radius;
        ctx.drawImage(tempCanvas, -exportW / 2 + ox, -exportH / 2 + oy, exportW, exportH);
      }
    }

    // Draw main foreground image
    ctx.drawImage(subjImg, -exportW / 2, -exportH / 2, exportW, exportH);
    ctx.restore();

    // 4. Trigger download
    const type = exportFormat === 'png' ? 'image/png' : 'image/jpeg';
    const quality = exportFormat === 'png' ? undefined : exportQuality;
    
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeItem.name}-backdrop.${exportFormat}`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }, type, quality);
  };

  // Close camera modal and take photo
  const handleCameraCapture = (file) => {
    setIsCameraOpen(false);
    handleImageSelect(file);
  };

  // Delete history item
  const handleDeleteHistoryItem = (index, e) => {
    e.stopPropagation();
    const itemToDelete = historyItems[index];
    
    // Revoke object URLs to save memory
    URL.revokeObjectURL(itemToDelete.originalUrl);
    URL.revokeObjectURL(itemToDelete.transparentUrl);
    
    const newItems = historyItems.filter((_, idx) => idx !== index);
    setHistoryItems(newItems);
    
    if (newItems.length === 0) {
      setActiveHistoryIdx(-1);
    } else if (activeHistoryIdx === index) {
      setActiveHistoryIdx(0);
    } else if (activeHistoryIdx > index) {
      setActiveHistoryIdx(prev => prev - 1);
    }
  };

  return (
    <>
      {/* Background neon glows */}
      <div className="glow-blob blob-1"></div>
      <div className="glow-blob blob-2"></div>

      {/* Header bar */}
      <header className="app-header">
        <div className="brand">
          <Sparkles className="brand-icon" size={24} />
          <span className="brand-name">BackdropAI</span>
          <span className="brand-tag">v1.0</span>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {activeItem && (
            <button 
              className="reset-btn" 
              onClick={() => {
                // Clear active image to go back to dropzone
                setActiveHistoryIdx(-1);
                handleResetEdits();
              }}
              style={{ fontSize: '0.85rem', padding: '8px 14px' }}
            >
              Upload New Image
            </button>
          )}
          <a 
            href="https://github.com/imgly/background-removal" 
            target="_blank" 
            rel="noreferrer"
            style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontSize: '0.85rem' }}
          >
            <HelpCircle size={14} /> Docs
          </a>
        </div>
      </header>

      {/* Main app container */}
      <div className="app-container">
        
        {/* History Sidebar */}
        {activeItem && (
          <HistorySidebar 
            items={historyItems}
            activeIndex={activeHistoryIdx}
            onItemSelect={(idx) => {
              setActiveHistoryIdx(idx);
              handleResetEdits();
            }}
            isCollapsed={isSidebarCollapsed}
            onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        )}

        {/* Collapsed Sidebar Restore trigger */}
        {activeItem && isSidebarCollapsed && (
          <button 
            onClick={() => setIsSidebarCollapsed(false)}
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              zIndex: 10,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-glass)',
              color: 'var(--text-primary)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)'
            }}
            title="Restore sidebar"
          >
            <Menu size={16} />
          </button>
        )}

        {/* Center Main Stage Content */}
        <main className="main-content">
          {error && (
            <div className="glass-panel" style={{ padding: '1.5rem 2rem', border: '1px solid rgba(244, 63, 94, 0.4)', borderRadius: 'var(--radius-md)', textAlign: 'center', marginBottom: '1.5rem', maxWidth: '400px' }}>
              <span style={{ color: 'var(--color-accent)', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Error Occurred</span>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>
              <button className="reset-btn" onClick={() => setError(null)} style={{ margin: '0 auto' }}>Dismiss</button>
            </div>
          )}

          {isProcessing ? (
            // Process loading view
            <LoadingIndicator 
              status={processStatus}
              progress={processProgress}
            />
          ) : activeItem ? (
            // Editor Dashboard
            <div className="editor-layout">
              {/* Interactive preview stage (Left side) */}
              <div className="stage-section">
                
                <div className="stage-header-row">
                  <div className="stage-title">
                    <ImageIcon size={18} color="var(--color-secondary)" />
                    <span>Stage Workspace</span>
                  </div>

                  <div className="mode-toggle-group">
                    <button 
                      className={`mode-toggle-btn ${editorMode === 'editor' ? 'active' : ''}`}
                      onClick={() => setEditorMode('editor')}
                    >
                      Editor Mode
                    </button>
                    <button 
                      className={`mode-toggle-btn ${editorMode === 'slider' ? 'active' : ''}`}
                      onClick={() => setEditorMode('slider')}
                    >
                      Compare Slider
                    </button>
                  </div>
                </div>

                {/* Stage layout */}
                {editorMode === 'editor' ? (
                  <EditorStage 
                    subjectUrl={activeItem.transparentUrl}
                    originalUrl={activeItem.originalUrl}
                    backgroundType={backgroundType}
                    backgroundValue={backgroundValue}
                    bgBlur={bgBlur}
                    brightness={brightness}
                    contrast={contrast}
                    saturation={saturation}
                    shadowEnabled={shadowEnabled}
                    shadowColor={shadowColor}
                    shadowBlur={shadowBlur}
                    shadowOffset={shadowOffset}
                    outlineEnabled={outlineEnabled}
                    outlineColor={outlineColor}
                    outlineSize={outlineSize}
                    flipH={flipH}
                    flipV={flipV}
                    rotation={subjectRotation}
                    position={subjectPosition}
                    scale={subjectScale}
                    setPosition={setSubjectPosition}
                    setScale={setSubjectScale}
                    setRotation={setSubjectRotation}
                    mode="editor"
                    isSidebarCollapsed={isSidebarCollapsed}
                  />
                ) : (
                  // Before/After comparison wipe slider
                  <div className="canvas-container">
                    <BeforeAfterSlider 
                      originalSrc={activeItem.originalUrl}
                      editedSrc={activeItem.transparentUrl}
                    />
                  </div>
                )}

                {/* Footer options */}
                <div className="stage-footer-tools">
                  <div className="stage-info">
                    <span>Resolution: <strong>{activeItem.dimensions.width} × {activeItem.dimensions.height}</strong></span>
                    <span>Mode: <strong>Client AI local model</strong></span>
                  </div>
                  <button className="reset-btn" onClick={handleResetEdits}>
                    Reset Placement & Filters
                  </button>
                </div>
              </div>

              {/* Side control configuration panel (Right side) */}
              <ControlPanel 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                backgroundType={backgroundType}
                setBackgroundType={setBackgroundType}
                backgroundValue={backgroundValue}
                setBackgroundValue={setBackgroundValue}
                bgBlur={bgBlur}
                setBgBlur={setBgBlur}
                onUploadBgImage={handleUploadBgImage}
                brightness={brightness}
                setBrightness={setBrightness}
                contrast={contrast}
                setContrast={setContrast}
                saturation={saturation}
                setSaturation={setSaturation}
                rotation={subjectRotation}
                setRotation={setSubjectRotation}
                flipH={flipH}
                setFlipH={setFlipH}
                flipV={flipV}
                setFlipV={setFlipV}
                shadowEnabled={shadowEnabled}
                setShadowEnabled={setShadowEnabled}
                shadowColor={shadowColor}
                setShadowColor={setShadowColor}
                shadowBlur={shadowBlur}
                setShadowBlur={setShadowBlur}
                shadowOffset={shadowOffset}
                setShadowOffset={setShadowOffset}
                outlineEnabled={outlineEnabled}
                setOutlineEnabled={setOutlineEnabled}
                outlineColor={outlineColor}
                setOutlineColor={setOutlineColor}
                outlineSize={outlineSize}
                setOutlineSize={setOutlineSize}
                exportFormat={exportFormat}
                setExportFormat={setExportFormat}
                exportQuality={exportQuality}
                setExportQuality={setExportQuality}
                onDownload={handleDownload}
              />
            </div>
          ) : (
            // Landing dropzone view
            <Dropzone 
              onImageSelect={handleImageSelect}
              onCameraOpen={() => setIsCameraOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Webcam Take Photo Modal */}
      {isCameraOpen && (
        <CameraCapture 
          onCapture={handleCameraCapture}
          onClose={() => setIsCameraOpen(false)}
        />
      )}
    </>
  );
}

export default App;
