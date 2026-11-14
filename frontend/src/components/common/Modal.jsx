import React, { useEffect, useId } from 'react';
import { X } from 'lucide-react';

const TAILWIND_MAX_WIDTH_MAP = {
  'max-w-sm': '384px',
  'max-w-md': '480px',
  'max-w-lg': '540px',
  'max-w-xl': '600px',
  'max-w-2xl': '672px',
  'max-w-3xl': '768px',
  'max-w-4xl': '896px',
  'max-w-5xl': '1024px',
};

const Modal = ({ isOpen, onClose, title, children, footer, maxWidth = '500px', className = '' }) => {
  const titleId = useId();
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const resolvedMaxWidth = TAILWIND_MAX_WIDTH_MAP[maxWidth] || maxWidth || '500px';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={`modal-container ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        style={{
          '--modal-max-width': resolvedMaxWidth,
          maxWidth: resolvedMaxWidth,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div className="modal-header">
          <h3 id={titleId} className="modal-title">{title}</h3>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Đóng hộp thoại"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>
        <div className="modal-body" style={{ overflowY: 'auto', flex: 1 }}>{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
