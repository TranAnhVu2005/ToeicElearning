import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '70vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            background: 'var(--neo-paper, #FFFDF2)',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          <div
            style={{
              maxWidth: '600px',
              width: '100%',
              background: '#ffffff',
              border: '3px solid #111111',
              borderRadius: '2px',
              padding: '2.5rem',
              boxShadow: '6px 6px 0 #111111',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                background: '#FF5B93',
                color: '#ffffff',
                border: '2px solid #111111',
                borderRadius: '2px',
                boxShadow: '3px 3px 0 #111111',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <AlertTriangle size={32} />
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#111111', marginBottom: '0.75rem' }}>
              Đã xảy ra lỗi khi tải giao diện
            </h2>

            <p style={{ color: '#444444', fontSize: '0.95rem', fontWeight: '600', marginBottom: '1.75rem', lineHeight: 1.6 }}>
              Hệ thống vừa phát hiện sự cố không mong muốn trong thành phần hiển thị. Vui lòng thử tải lại trang hoặc quay về trang chủ.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={this.handleReload}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  border: '2px solid #111111',
                  borderRadius: '2px',
                  background: '#FFE600',
                  color: '#111111',
                  fontWeight: '900',
                  boxShadow: '3px 3px 0 #111111',
                  cursor: 'pointer',
                  transition: 'transform 0.1s, box-shadow 0.1s',
                }}
              >
                <RefreshCw size={18} />
                Tải lại trang
              </button>

              <button
                onClick={this.handleGoHome}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  border: '2px solid #111111',
                  borderRadius: '2px',
                  background: '#ffffff',
                  color: '#111111',
                  fontWeight: '900',
                  boxShadow: '3px 3px 0 #111111',
                  cursor: 'pointer',
                  transition: 'transform 0.1s, box-shadow 0.1s',
                }}
              >
                <Home size={18} />
                Về Trang Chủ
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
