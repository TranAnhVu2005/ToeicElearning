import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle, BookOpen, CheckCircle } from 'lucide-react';
import Toast from '../components/common/Toast';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    userEmail: '',
    userPassword: '',
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.userEmail.trim() || !formData.userPassword) {
      setErrorMsg('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg('');
      const loggedUser = await login(formData);
      // Navigate to admin panel if user is admin, else previous or home page
      if (loggedUser.role === 'ROLE_ADMIN' || loggedUser.role?.roleName === 'ROLE_ADMIN') {
        navigate('/admin/users');
      } else {
        navigate(redirectPath);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại!';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="container">
        <div className="auth-card-container">
          {/* Left Visual Side */}
          <div className="auth-visual-side">
            <div className="auth-visual-content">
              <div className="brand-logo" style={{ marginBottom: 20 }}>
                <div className="logo-icon-wrapper">
                  <BookOpen size={24} color="#ffffff" />
                </div>
                <div className="logo-text">
                  <span className="logo-title" style={{ color: '#fff' }}>TOEIC<span>PRO</span></span>
                </div>
              </div>
              <h2 className="auth-visual-title">Học Tiếng Anh Thông Minh, Đạt Điểm Cao Dễ Dàng</h2>
              <p className="auth-visual-desc">
                Đăng nhập để tiếp tục lộ trình học tập được cá nhân hóa và theo dõi tiến độ thi thử hàng tuần.
              </p>

              <div className="auth-features-list">
                <div className="auth-feature-item">
                  <CheckCircle size={18} color="#48bb78" />
                  <span>Kho đề 5000+ câu hỏi cập nhật liên tục</span>
                </div>
                <div className="auth-feature-item">
                  <CheckCircle size={18} color="#48bb78" />
                  <span>Chấm điểm và phân tích đáp án chi tiết</span>
                </div>
                <div className="auth-feature-item">
                  <CheckCircle size={18} color="#48bb78" />
                  <span>Lưu lịch sử bài làm & phân tích lỗi sai</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Side */}
          <div className="auth-form-side">
            <div className="auth-header">
              <h2 className="auth-title">Chào mừng trở lại!</h2>
              <p className="auth-subtitle">Vui lòng đăng nhập vào tài khoản của bạn</p>
            </div>

            {errorMsg && (
              <div style={{ marginBottom: 20 }}>
                <Toast type="error" message={errorMsg} onClose={() => setErrorMsg('')} />
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label" htmlFor="userEmail">
                  Email học viên <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <div className="input-with-icon">
                  <span className="input-icon"><Mail size={18} /></span>
                  <input
                    type="email"
                    id="userEmail"
                    name="userEmail"
                    className="form-control"
                    placeholder="ví_dụ@gmail.com"
                    value={formData.userEmail}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label" htmlFor="userPassword">
                    Mật khẩu <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                </div>
                <div className="input-with-icon">
                  <span className="input-icon"><Lock size={18} /></span>
                  <input
                    type="password"
                    id="userPassword"
                    name="userPassword"
                    className="form-control"
                    placeholder="Nhập mật khẩu..."
                    value={formData.userPassword}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 8 }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex-center" style={{ gap: 8 }}>
                    <div className="loading-spinner-sm" /> Đang đăng nhập...
                  </span>
                ) : (
                  <span className="flex-center" style={{ gap: 8 }}>
                    <LogIn size={18} /> Đăng nhập
                  </span>
                )}
              </button>
            </form>

            <div className="auth-footer">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="auth-link">
                Đăng ký ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
