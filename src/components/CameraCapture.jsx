import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw } from 'lucide-react';

const CameraCapture = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [devices, setDevices] = useState([]);
  const [activeDeviceIdx, setActiveDeviceIdx] = useState(0);
  const [isCameraLoading, setIsCameraLoading] = useState(true);

  // Stop current video stream
  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Start video stream using selected camera device
  const startStream = async (deviceId) => {
    setIsCameraLoading(true);
    stopStream();
    setError(null);
    try {
      const constraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: 'user' },
        audio: false
      };
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setIsCameraLoading(false);
    } catch (err) {
      console.error('Error accessing webcam:', err);
      setError('Could not access your camera. Please check permissions and try again.');
      setIsCameraLoading(false);
    }
  };

  // Find camera devices
  useEffect(() => {
    const initDevices = async () => {
      try {
        // Request temporary stream to ensure camera permission is active and label details are visible
        const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
        tempStream.getTracks().forEach(track => track.stop());

        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);
        
        if (videoDevices.length > 0) {
          startStream(videoDevices[0].deviceId);
        } else {
          startStream(null);
        }
      } catch (err) {
        console.error('Error listing camera devices:', err);
        startStream(null);
      }
    };

    initDevices();
    return () => {
      stopStream();
    };
  }, []);

  // Switch camera if multiple cameras are available
  const handleSwitchCamera = () => {
    if (devices.length < 2) return;
    const nextIdx = (activeDeviceIdx + 1) % devices.length;
    setActiveDeviceIdx(nextIdx);
    startStream(devices[nextIdx].deviceId);
  };

  // Snap photo from video feed
  const handleCapture = () => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    
    // Set canvas dimensions to match video natural resolution
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    const ctx = canvas.getContext('2d');
    
    // Mirror the snapshot image if using front camera (facingMode user)
    // To match how user sees themselves in video mirror mode
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `camera-shot-${Date.now()}.png`, { type: 'image/png' });
        onCapture(file);
        stopStream();
      }
    }, 'image/png');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(3, 4, 8, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(16px)',
      animation: 'fade-in 0.3s ease-out'
    }}>
      <div className="glass-panel" style={{
        position: 'relative',
        width: '90%',
        maxWidth: '640px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-glass-active)',
        boxShadow: 'var(--shadow-glow)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--display)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Camera size={20} className="brand-icon" /> Take Photo
          </h2>
          <button 
            onClick={() => {
              stopStream();
              onClose();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              transition: 'background var(--transition-fast)'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Video stream container */}
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4/3',
          background: '#000',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          border: '1px solid var(--border-glass)'
        }}>
          {error ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              padding: '2rem',
              color: 'var(--color-accent)',
              textAlign: 'center',
              fontSize: '0.9rem',
              gap: '12px'
            }}>
              <X size={32} />
              <p>{error}</p>
            </div>
          ) : (
            <>
              {isCameraLoading && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#000',
                  zIndex: 2,
                  color: 'var(--text-secondary)',
                  fontSize: '0.85rem'
                }}>
                  <RefreshCw size={24} className="spinner-ring" style={{ animation: 'spin 1s linear infinite', border: 'none', borderTopColor: 'transparent' }} />
                </div>
              )}
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)' // Mirror feed for natural view
                }}
              />
            </>
          )}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', marginTop: '0.5rem' }}>
          {devices.length > 1 && (
            <button 
              onClick={handleSwitchCamera}
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all var(--transition-fast)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary)';
                e.currentTarget.style.color = 'var(--color-primary)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-glass)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              title="Switch camera device"
            >
              <RefreshCw size={18} />
            </button>
          )}

          <button 
            onClick={handleCapture}
            disabled={isCameraLoading || error}
            style={{
              background: 'linear-gradient(135deg, var(--color-primary) 0%, #6d28d9 100%)',
              color: 'var(--text-primary)',
              border: 'none',
              cursor: 'pointer',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(139, 92, 246, 0.4)',
              transition: 'all var(--transition-normal)',
              opacity: (isCameraLoading || error) ? 0.5 : 1
            }}
            onMouseOver={(e) => {
              if (isCameraLoading || error) return;
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 0 25px rgba(139, 92, 246, 0.6)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 0 15px rgba(139, 92, 246, 0.4)';
            }}
            title="Snap Photo"
          >
            <Camera size={28} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;
