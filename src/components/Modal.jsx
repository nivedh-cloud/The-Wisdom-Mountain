import React from 'react';

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth = '600px',
  closeLabel = 'Close'
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content-wrapper"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth, width: '90vw' }}
      >
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button
            onClick={onClose}
            className="modal-close-button"
            title={closeLabel}
            aria-label={closeLabel}
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}
