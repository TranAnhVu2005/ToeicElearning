import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, BookOpen, CheckCircle, AlertTriangle } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import Toast from '../components/common/Toast';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    userPassword: '',
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if kicked out due to account locking
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('locked') === 'true') {
      setErrorMsg('Tài khoản của bạn đã bị Khóa bởi Quản trị viên. Bạn đã bị đăng xuất khỏi hệ thống.');
    }
  }, [location.search]);

  const redirectPath = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errorMsg) setErrorMsg('');
  };

  const handleRoleRedirect = (loggedUser) => {
    const roleStr = loggedUser.role || loggedUser.roleName || loggedUser.role?.roleName;
    if (roleStr === 'ROLE_ADMIN') {
      navigate('/admin/users');
    } else if (roleStr === 'ROLE_TEACHER') {
      navigate('/admin/tests');
    } else {
      navigate(redirectPath);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.emailOrPhone.trim() || !formData.userPassword) {
      setErrorMsg('Vui lòng nhập Email hoặc Số điện thoại và Mật khẩu.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg('');
      const loggedUser = await login(formData);
      handleRoleRedirect(loggedUser);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại!';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsLoading(true);
      setErrorMsg('');
      if (!credentialResponse?.credential) {
        throw new Error('Không nhận được thông tin xác thực từ Google');
      }
      const loggedUser = await loginWithGoogle(credentialResponse.credential);
      handleRoleRedirect(loggedUser);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Đăng nhập bằng tài khoản Google thất bại. Vui lòng thử lại!';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setErrorMsg('Đăng nhập Google thất bại hoặc bạn đã hủy liên kết.');
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
                  <span className="logo-title" style={{ color: '#fff' }}>Toeic<span>Elearning</span></span>
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
              <p className="auth-subtitle">Đăng nhập bằng Email hoặc Số điện thoại</p>
            </div>

            {errorMsg && (
              <div style={{ marginBottom: 20 }}>
                <Toast type="error" message={errorMsg} onClose={() => setErrorMsg('')} />
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label" htmlFor="emailOrPhone">
                  Email hoặc Số điện thoại <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <div className="input-with-icon">
                  <span className="input-icon"><Mail size={18} /></span>
                  <input
                    type="text"
                    id="emailOrPhone"
                    name="emailOrPhone"
                    className="form-control"
                    placeholder="ví_dụ@gmail.com hoặc 0912345678"
                    value={formData.emailOrPhone}
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

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                margin: '22px 0 18px',
                color: 'var(--text-muted, #718096)',
                fontSize: '0.82rem',
                fontWeight: 600,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color, #e2e8f0)' }} />
              <span style={{ padding: '0 12px' }}>Hoặc tiếp tục với</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color, #e2e8f0)' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: 16 }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                theme="outline"
                size="large"
                shape="rectangular"
                text="continue_with"
                locale="vi"
              />
            </div>

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
