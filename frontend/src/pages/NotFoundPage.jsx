import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="flex-center" style={{ minHeight: '70vh', padding: '40px 20px', textAlign: 'center' }}>
      <div>
        <h1 style={{ fontSize: '6rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1 }}>404</h1>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '16px 0 8px' }}>Không tìm thấy trang</h2>
        <p className="text-muted" style={{ maxWidth: 450, margin: '0 auto 24px' }}>
          Địa chỉ trang web bạn yêu cầu không tồn tại hoặc đã được di chuyển sang một liên kết khác.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link to="/" className="btn btn-primary">
            <Home size={18} /> Về trang chủ
          </Link>
          <button onClick={() => window.history.back()} className="btn btn-outline">
            <ArrowLeft size={18} /> Quay lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
