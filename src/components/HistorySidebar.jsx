import React from 'react';
import { History, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

const HistorySidebar = ({ items, activeIndex, onItemSelect, isCollapsed, onToggle }) => {
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className={`history-sidebar glass-panel ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={16} /> History
        </span>
        <button className="sidebar-toggle-btn" onClick={onToggle} title="Collapse sidebar">
          <ChevronLeft size={16} />
        </button>
      </div>

      <div className="history-list">
        {items.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '150px', color: 'var(--text-muted)', fontSize: '0.8rem', gap: '8px', textAlign: 'center' }}>
            <ImageIcon size={24} />
            <span>No processed images in this session yet</span>
          </div>
        ) : (
          items.map((item, idx) => (
            <div 
              key={item.id || idx}
              className={`history-item ${idx === activeIndex ? 'active' : ''}`}
              onClick={() => onItemSelect(idx)}
            >
              <div className="history-thumb">
                <img src={item.thumbnailUrl || item.transparentUrl} alt={item.name} />
              </div>
              <div className="history-details">
                <span className="history-name">{item.name}</span>
                <span className="history-size">{formatBytes(item.size || 0)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistorySidebar;
export { ChevronRight }; // We export ChevronRight in case the main App needs to show the expand trigger.
