import React from 'react';
import { Cpu } from 'lucide-react';

const LoadingIndicator = ({ status, progress }) => {
  // Determine user friendly messages based on status keys
  let title = 'Processing Image...';
  let desc = 'Using advanced local AI model to extract the subject. This may take a few seconds.';

  if (status && status.toLowerCase().includes('fetch')) {
    title = 'Downloading AI Model...';
    desc = 'Downloading the neural network components. This only happens on the first run and is cached for future uses.';
  } else if (status && status.toLowerCase().includes('onnx')) {
    title = 'Initializing ONNX Runtime...';
    desc = 'Setting up WebAssembly/WebGPU accelerators to process on your hardware.';
  } else if (status && status.toLowerCase().includes('compute')) {
    title = 'Analyzing Image Pixels...';
    desc = 'Running deep segmentation network. Finding foreground subject boundaries.';
  }

  const roundedPercent = Math.round(progress || 0);

  return (
    <div className="loading-panel glass-panel">
      <div className="spinner-outer">
        <div className="spinner-ring"></div>
        <div className="spinner-ring-inner"></div>
        <div className="spinner-logo">
          <Cpu size={36} />
        </div>
      </div>

      <div>
        <h2 className="loading-text">{title}</h2>
        <p className="loading-desc">{desc}</p>
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
        <div className="progress-container">
          <div 
            className="progress-bar" 
            style={{ width: `${roundedPercent}%` }}
          ></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <span>{status || 'Running neural model'}</span>
          <span className="progress-percent">{roundedPercent}%</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator;
