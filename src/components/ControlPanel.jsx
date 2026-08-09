import React from 'react';
import { 
  Palette, Sliders, Sparkles, Download, 
  FlipHorizontal, FlipVertical, Upload, Check 
} from 'lucide-react';

const ControlPanel = ({
  activeTab,
  setActiveTab,
  
  // Background State
  backgroundType,
  setBackgroundType,
  backgroundValue,
  setBackgroundValue,
  bgBlur,
  setBgBlur,
  onUploadBgImage,

  // Adjustments State
  brightness,
  setBrightness,
  contrast,
  setContrast,
  saturation,
  setSaturation,
  rotation,
  setRotation,
  flipH,
  setFlipH,
  flipV,
  setFlipV,

  // Effects State
  shadowEnabled,
  setShadowEnabled,
  shadowColor,
  setShadowColor,
  shadowBlur,
  setShadowBlur,
  shadowOffset,
  setShadowOffset,
  
  outlineEnabled,
  setOutlineEnabled,
  outlineColor,
  setOutlineColor,
  outlineSize,
  setOutlineSize,

  // Export State
  exportFormat,
  setExportFormat,
  exportQuality,
  setExportQuality,
  onDownload
}) => {

  const tabs = [
    { id: 'backgrounds', label: 'Backgrounds', icon: Palette },
    { id: 'adjustments', label: 'Adjustments', icon: Sliders },
    { id: 'effects', label: 'Effects', icon: Sparkles },
    { id: 'export', label: 'Export', icon: Download },
  ];

  // Presets
  const solidColors = [
    '#000000', '#ffffff', '#ef4444', '#f97316', '#f59e0b', 
    '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef'
  ];

  const gradientPresets = [
    { name: 'Sunset Glow', css: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { name: 'Cosmic Purple', css: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { name: 'Ocean Breeze', css: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { name: 'Neon Cyberpunk', css: 'linear-gradient(135deg, #f43f5e 0%, #8b5cf6 100%)' },
    { name: 'Golden Aurora', css: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)' },
    { name: 'Silver Satin', css: 'linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)' }
  ];

  const stockBackgrounds = [
    { name: 'Cyberpunk Grid', file: '/backgrounds/cyberpunk.png' },
    { name: 'Modern Office', file: '/backgrounds/office.png' }
  ];

  const handleBgImageUploadClick = () => {
    document.getElementById('bg-image-upload').click();
  };

  const handleBgImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        onUploadBgImage(url);
      }
    }
  };

  return (
    <div className="controls-panel glass-panel">
      {/* Tab bar header */}
      <div className="tabs-header">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content bodies */}
      <div className="tabs-content">
        
        {/* Backgrounds Tab */}
        {activeTab === 'backgrounds' && (
          <>
            <div className="control-section">
              <span className="section-title">Mode</span>
              <div className="format-toggle">
                <button 
                  className={`format-btn ${backgroundType === 'transparent' ? 'active' : ''}`}
                  onClick={() => { setBackgroundType('transparent'); setBackgroundValue(''); }}
                >
                  Transparent
                </button>
                <button 
                  className={`format-btn ${backgroundType === 'color' ? 'active' : ''}`}
                  onClick={() => { setBackgroundType('color'); setBackgroundValue('#000000'); }}
                >
                  Solid Color
                </button>
                <button 
                  className={`format-btn ${backgroundType === 'gradient' ? 'active' : ''}`}
                  onClick={() => { setBackgroundType('gradient'); setBackgroundValue(gradientPresets[0].css); }}
                >
                  Gradient
                </button>
                <button 
                  className={`format-btn ${backgroundType === 'image' ? 'active' : ''}`}
                  onClick={() => { setBackgroundType('image'); setBackgroundValue(stockBackgrounds[0].file); }}
                >
                  Image
                </button>
              </div>
            </div>

            {/* Solid Colors selection */}
            {backgroundType === 'color' && (
              <div className="control-section">
                <span className="section-title">Color Palette</span>
                <div className="bg-picker-grid">
                  {solidColors.map((color) => (
                    <button
                      key={color}
                      className={`picker-btn ${backgroundValue === color ? 'active' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setBackgroundValue(color)}
                    />
                  ))}
                </div>
                <div className="color-picker-input-wrapper" style={{ marginTop: '0.5rem' }}>
                  <input 
                    type="color" 
                    className="native-color-picker"
                    value={solidColors.includes(backgroundValue) ? backgroundValue : '#8b5cf6'}
                    onChange={(e) => setBackgroundValue(e.target.value)}
                  />
                  <span className="color-hex-label">{backgroundValue}</span>
                </div>
              </div>
            )}

            {/* Gradients Selection */}
            {backgroundType === 'gradient' && (
              <div className="control-section">
                <span className="section-title">Presets Gradients</span>
                <div className="bg-picker-grid">
                  {gradientPresets.map((preset) => (
                    <button
                      key={preset.name}
                      className={`picker-btn ${backgroundValue === preset.css ? 'active' : ''}`}
                      style={{ background: preset.css }}
                      onClick={() => setBackgroundValue(preset.css)}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Stock Backgrounds Selection */}
            {backgroundType === 'image' && (
              <div className="control-section">
                <span className="section-title">Background Images</span>
                <div className="bg-images-grid">
                  {stockBackgrounds.map((bg) => (
                    <div
                      key={bg.name}
                      className={`bg-thumb-card ${backgroundValue === bg.file ? 'active' : ''}`}
                      onClick={() => setBackgroundValue(bg.file)}
                    >
                      <img src={bg.file} alt={bg.name} />
                      {backgroundValue === bg.file && (
                        <div style={{ position: 'absolute', top: '4px', right: '4px', background: 'var(--color-primary)', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={10} color="#fff" />
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Upload background button */}
                  <div 
                    className="bg-thumb-card upload-bg-card"
                    onClick={handleBgImageUploadClick}
                  >
                    <Upload size={16} />
                    <span>Upload Custom</span>
                    <input 
                      id="bg-image-upload" 
                      type="file" 
                      style={{ display: 'none' }} 
                      accept="image/*"
                      onChange={handleBgImageChange}
                    />
                  </div>
                </div>

                {/* Background blur setting */}
                <div className="slider-group" style={{ marginTop: '1rem' }}>
                  <div className="slider-label-row">
                    <span>Portrait Background Blur</span>
                    <span className="slider-value">{bgBlur}px</span>
                  </div>
                  <input 
                    type="range" 
                    className="custom-range"
                    min="0" 
                    max="40" 
                    value={bgBlur} 
                    onChange={(e) => setBgBlur(parseInt(e.target.value))}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* Adjustments Tab */}
        {activeTab === 'adjustments' && (
          <>
            <div className="control-section">
              <span className="section-title">Color Tweaks</span>
              
              <div className="slider-group">
                <div className="slider-label-row">
                  <span>Brightness</span>
                  <span className="slider-value">{brightness}%</span>
                </div>
                <input 
                  type="range" 
                  className="custom-range" 
                  min="50" 
                  max="150" 
                  value={brightness}
                  onChange={(e) => setBrightness(parseInt(e.target.value))}
                />
              </div>

              <div className="slider-group">
                <div className="slider-label-row">
                  <span>Contrast</span>
                  <span className="slider-value">{contrast}%</span>
                </div>
                <input 
                  type="range" 
                  className="custom-range" 
                  min="50" 
                  max="150" 
                  value={contrast}
                  onChange={(e) => setContrast(parseInt(e.target.value))}
                />
              </div>

              <div className="slider-group">
                <div className="slider-label-row">
                  <span>Saturation</span>
                  <span className="slider-value">{saturation}%</span>
                </div>
                <input 
                  type="range" 
                  className="custom-range" 
                  min="0" 
                  max="200" 
                  value={saturation}
                  onChange={(e) => setSaturation(parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="control-section">
              <span className="section-title">Transforms</span>
              
              <div className="slider-group">
                <div className="slider-label-row">
                  <span>Rotation Angle</span>
                  <span className="slider-value">{rotation}°</span>
                </div>
                <input 
                  type="range" 
                  className="custom-range" 
                  min="-180" 
                  max="180" 
                  value={rotation}
                  onChange={(e) => setRotation(parseInt(e.target.value))}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button 
                  className={`reset-btn ${flipH ? 'active' : ''}`}
                  onClick={() => setFlipH(!flipH)}
                  style={{ flex: 1, padding: '10px' }}
                >
                  <FlipHorizontal size={14} /> Flip Horiz
                </button>
                <button 
                  className={`reset-btn ${flipV ? 'active' : ''}`}
                  onClick={() => setFlipV(!flipV)}
                  style={{ flex: 1, padding: '10px' }}
                >
                  <FlipVertical size={14} /> Flip Vert
                </button>
              </div>
            </div>
          </>
        )}

        {/* Effects Tab */}
        {activeTab === 'effects' && (
          <>
            {/* Outline Section */}
            <div className="control-section">
              <div className="switch-row">
                <span className="section-title" style={{ margin: 0 }}>Thumbnail Outline</span>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={outlineEnabled}
                    onChange={(e) => setOutlineEnabled(e.target.checked)}
                  />
                  <span className="switch-slider"></span>
                </label>
              </div>

              {outlineEnabled && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                  <div className="slider-group">
                    <div className="slider-label-row">
                      <span>Stroke Thickness</span>
                      <span className="slider-value">{outlineSize}px</span>
                    </div>
                    <input 
                      type="range" 
                      className="custom-range" 
                      min="1" 
                      max="15" 
                      value={outlineSize}
                      onChange={(e) => setOutlineSize(parseInt(e.target.value))}
                    />
                  </div>
                  <div className="color-picker-input-wrapper">
                    <input 
                      type="color" 
                      className="native-color-picker" 
                      value={outlineColor}
                      onChange={(e) => setOutlineColor(e.target.value)}
                    />
                    <span className="color-hex-label">{outlineColor}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Drop Shadow Section */}
            <div className="control-section">
              <div className="switch-row">
                <span className="section-title" style={{ margin: 0 }}>Drop Shadow</span>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={shadowEnabled}
                    onChange={(e) => setShadowEnabled(e.target.checked)}
                  />
                  <span className="switch-slider"></span>
                </label>
              </div>

              {shadowEnabled && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                  <div className="slider-group">
                    <div className="slider-label-row">
                      <span>Shadow Blur</span>
                      <span className="slider-value">{shadowBlur}px</span>
                    </div>
                    <input 
                      type="range" 
                      className="custom-range" 
                      min="1" 
                      max="30" 
                      value={shadowBlur}
                      onChange={(e) => setShadowBlur(parseInt(e.target.value))}
                    />
                  </div>

                  <div className="slider-group">
                    <div className="slider-label-row">
                      <span>Offset Position</span>
                      <span className="slider-value">{shadowOffset}px</span>
                    </div>
                    <input 
                      type="range" 
                      className="custom-range" 
                      min="0" 
                      max="30" 
                      value={shadowOffset}
                      onChange={(e) => setShadowOffset(parseInt(e.target.value))}
                    />
                  </div>

                  <div className="color-picker-input-wrapper">
                    <input 
                      type="color" 
                      className="native-color-picker" 
                      value={shadowColor}
                      onChange={(e) => setShadowColor(e.target.value)}
                    />
                    <span className="color-hex-label">{shadowColor}</span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Export Tab */}
        {activeTab === 'export' && (
          <div className="export-panel">
            <div className="control-section">
              <span className="section-title">Output Format</span>
              <div className="format-toggle">
                <button 
                  className={`format-btn ${exportFormat === 'png' ? 'active' : ''}`}
                  onClick={() => setExportFormat('png')}
                >
                  PNG (Transparent)
                </button>
                <button 
                  className={`format-btn ${exportFormat === 'jpeg' ? 'active' : ''}`}
                  onClick={() => setExportFormat('jpeg')}
                >
                  JPEG (Compact)
                </button>
              </div>
            </div>

            {exportFormat === 'jpeg' && (
              <div className="control-section">
                <div className="slider-group">
                  <div className="slider-label-row">
                    <span>JPEG Export Quality</span>
                    <span className="slider-value">{Math.round(exportQuality * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    className="custom-range" 
                    min="0.1" 
                    max="1.0" 
                    step="0.05"
                    value={exportQuality}
                    onChange={(e) => setExportQuality(parseFloat(e.target.value))}
                  />
                </div>
              </div>
            )}

            <button 
              className="download-btn"
              onClick={onDownload}
              style={{ marginTop: '1rem' }}
            >
              <Download size={18} />
              <span>Download Image</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default ControlPanel;
