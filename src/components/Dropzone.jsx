import React, { useState } from 'react';
import { UploadCloud, Image, User, ShoppingBag, Heart, Leaf, Camera } from 'lucide-react';

const Dropzone = ({ onImageSelect, onCameraOpen }) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onImageSelect(file);
      }
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        onImageSelect(file);
      }
    }
  };

  const handleSampleClick = async (sampleName, fileName) => {
    try {
      const response = await fetch(`/samples/${fileName}`);
      const blob = await response.blob();
      const file = new File([blob], `${sampleName}.png`, { type: 'image/png' });
      onImageSelect(file);
    } catch (error) {
      console.error('Error loading sample image:', error);
    }
  };

  const samples = [
    { name: 'Portrait', file: 'portrait.png', icon: User, label: 'Model Studio' },
    { name: 'Product', file: 'product.png', icon: ShoppingBag, label: 'E-commerce Red Sneaker' },
    { name: 'Pet', file: 'pet.png', icon: Heart, label: 'Fluffy Cat' },
    { name: 'Plant', file: 'plant.png', icon: Leaf, label: 'Monstera Leaf' },
  ];

  return (
    <div className="landing-container">
      <div className="hero-section">
        <h1 className="hero-title">Remove Image Backgrounds Instantly</h1>
        <p className="hero-subtitle">
          Create premium portraits, product mockups, and high-impact graphics. 
          100% free, runs entirely in your browser with local AI.
        </p>
      </div>

      <div 
        className={`dropzone glass-panel ${isDragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-upload').click()}
      >
        <input 
          id="file-upload" 
          type="file" 
          style={{ display: 'none' }} 
          accept="image/*"
          onChange={handleFileInput}
        />
        
        <div className="dropzone-icon-container">
          <UploadCloud size={40} />
        </div>
        
        <h2 className="dropzone-title">Drag & drop your image here</h2>
        <p className="dropzone-subtitle">or click to browse your computer</p>
        
        <button 
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCameraOpen();
          }}
          style={{
            marginTop: '0.5rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-glass)',
            color: 'var(--text-primary)',
            padding: '8px 18px',
            borderRadius: '20px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem',
            fontWeight: '600',
            transition: 'all var(--transition-fast)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'var(--color-primary)';
            e.currentTarget.style.boxShadow = '0 0 10px var(--glow-primary)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <Camera size={14} /> Take Photo with Camera
        </button>
        
        <div className="dropzone-badge" style={{ marginTop: '1.5rem' }}>
          Supports PNG, JPEG, WEBP up to 10MB
        </div>
      </div>

      <div className="samples-container">
        <h3 className="samples-title">Or try these sample templates:</h3>
        <div className="samples-grid">
          {samples.map((sample) => {
            const Icon = sample.icon;
            return (
              <div 
                key={sample.name} 
                className="sample-card glass-panel"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSampleClick(sample.name, sample.file);
                }}
              >
                <img src={`/samples/${sample.file}`} alt={sample.label} />
                <div className="sample-card-label">
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <Icon size={12} /> {sample.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dropzone;
