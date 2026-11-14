import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const TOAST_META = {
  success: {
    label: 'Thành công',
    icon: CheckCircle2,
  },
  error: {
    label: 'Thông báo lỗi',
    icon: AlertCircle,
  },
  warning: {
    label: 'Cảnh báo',
    icon: AlertTriangle,
  },
  info: {
    label: 'Thông báo',
    icon: Info,
  },
};

const Toast = ({ type = 'info', message, onClose }) => {
  if (!message) return null;

  const normalizedType = TOAST_META[type] ? type : 'info';
  const { label, icon: IconComponent } = TOAST_META[normalizedType];

  return (
    <div
      className={`toast toast-${normalizedType}`}
      role={normalizedType === 'error' ? 'alert' : 'status'}
      aria-live={normalizedType === 'error' ? 'assertive' : 'polite'}
    >
      <div className="toast-icon" aria-hidden="true">
        <IconComponent size={19} strokeWidth={2.1} />
      </div>
      <div className="toast-body">
        <span className="toast-kicker">{label}</span>
        <div className="toast-message">{message}</div>
      </div>
      {onClose && (
        <button
          type="button"
          className="toast-close"
          onClick={onClose}
          aria-label="Đóng thông báo"
        >
          <X size={16} strokeWidth={2} />
        </button>
      )}
    </div>
  );
};

export default Toast;
