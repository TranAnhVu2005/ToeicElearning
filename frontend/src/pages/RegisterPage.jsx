import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Lock, UserPlus, BookOpen, CheckCircle } from 'lucide-react';
import Toast from '../components/common/Toast';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    userNumberphone: '',
    userPassword: '',
    confirmPassword: '',
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errorMsg) setErrorMsg('');
  };

  const validateForm = () => {
    if (!formData.userName || formData.userName.length < 4 || formData.userName.length > 30) {
      return 'Họ và tên phải từ 4 đến 30 ký tự.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.userEmail)) {
      return 'Email không hợp lệ.';
    }
    const phoneRegex = /^0[0-9]{9}$/;
    if (!phoneRegex.test(formData.userNumberphone)) {
      return 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng số 0 (ví dụ: 0912345678).';
    }
    if (!formData.userPassword || formData.userPassword.length < 6) {
      return 'Mật khẩu phải có ít nhất 6 ký tự.';
    }
    if (formData.userPassword !== formData.confirmPassword) {
      return 'Mật khẩu xác nhận không trùng khớp.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg('');
      const { confirmPassword, ...registerPayload } = formData;
      await register(registerPayload);
      navigate('/practice');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Đăng ký không thành công. Vui lòng thử lại!';
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
              <h2 className="auth-visual-title">Bắt Đầu Hành Trình Chinh Phục TOEIC Hôm Nay</h2>
              <p className="auth-visual-desc">
                Tạo tài khoản miễn phí để truy cập trọn bộ đề thi thử, lời giải chi tiết và tính năng phân tích điểm số tự động.
              </p>

              <div className="auth-features-list">
                <div className="auth-feature-item">
                  <CheckCircle size={18} color="#48bb78" />
                  <span>Miễn phí 100% cho mọi học viên & sinh viên</span>
                </div>
                <div className="auth-feature-item">
                  <CheckCircle size={18} color="#48bb78" />
                  <span>Cập nhật đề thi ETS mới nhất 2026</span>
                </div>
                <div className="auth-feature-item">
                  <CheckCircle size={18} color="#48bb78" />
                  <span>Luyện thi linh hoạt theo từng Part hoặc full đề</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Side */}
          <div className="auth-form-side">
            <div className="auth-header">
              <h2 className="auth-title">Đăng ký tài khoản</h2>
              <p className="auth-subtitle">Trở thành thành viên TOEIC PRO chỉ trong 1 phút</p>
            </div>

            {errorMsg && (
              <div style={{ marginBottom: 20 }}>
                <Toast type="error" message={errorMsg} onClose={() => setErrorMsg('')} />
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label" htmlFor="userName">
                  Họ và tên <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <div className="input-with-icon">
                  <span className="input-icon"><User size={18} /></span>
                  <input
                    type="text"
                    id="userName"
                    name="userName"
                    className="form-control"
                    placeholder="Nguyễn Văn A"
                    value={formData.userName}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="userEmail">
                  Địa chỉ Email <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <div className="input-with-icon">
                  <span className="input-icon"><Mail size={18} /></span>
                  <input
                    type="email"
                    id="userEmail"
                    name="userEmail"
                    className="form-control"
                    placeholder="nguyenvana@gmail.com"
                    value={formData.userEmail}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="userNumberphone">
                  Số điện thoại <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <div className="input-with-icon">
                  <span className="input-icon"><Phone size={18} /></span>
                  <input
                    type="tel"
                    id="userNumberphone"
                    name="userNumberphone"
                    className="form-control"
                    placeholder="0912345678 (10 số)"
                    value={formData.userNumberphone}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="userPassword">
                  Mật khẩu <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <div className="input-with-icon">
                  <span className="input-icon"><Lock size={18} /></span>
                  <input
                    type="password"
                    id="userPassword"
                    name="userPassword"
                    className="form-control"
                    placeholder="Ít nhất 6 ký tự..."
                    value={formData.userPassword}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">
                  Xác nhận mật khẩu <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <div className="input-with-icon">
                  <span className="input-icon"><Lock size={18} /></span>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className="form-control"
                    placeholder="Nhập lại mật khẩu..."
                    value={formData.confirmPassword}
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
                    <div className="loading-spinner-sm" /> Đang khởi tạo tài khoản...
                  </span>
                ) : (
                  <span className="flex-center" style={{ gap: 8 }}>
                    <UserPlus size={18} /> Đăng ký thành viên
                  </span>
                )}
              </button>
            </form>

            <div className="auth-footer">
              Đã có tài khoản?{' '}
              <Link to="/login" className="auth-link">
                Đăng nhập ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
