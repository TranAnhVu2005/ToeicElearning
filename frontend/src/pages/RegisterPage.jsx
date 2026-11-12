import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Lock, Mail, Phone, User, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/common/Toast';
import studyBackground from '../assets/img/hero/toeic_980_co_ban_tay.jpg';

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

  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleRoleRedirect = (loggedUser) => {
    const roleStr = loggedUser.role || loggedUser.roleName || loggedUser.role?.roleName;
    if (roleStr === 'ROLE_ADMIN') {
      navigate('/admin/dashboard');
    } else if (roleStr === 'ROLE_TEACHER') {
      navigate('/classrooms');
    } else {
      navigate('/');
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
      const msg = err.response?.data?.message || err.message || 'Đăng ký/Đăng nhập bằng tài khoản Google thất bại. Vui lòng thử lại!';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setErrorMsg('Đăng nhập Google thất bại hoặc bạn đã đóng cửa sổ đăng nhập.');
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const validateForm = () => {
    if (!formData.userName || formData.userName.length < 4 || formData.userName.length > 30) {
      return 'Họ và tên phải từ 4 đến 30 ký tự.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.userEmail)) return 'Email không hợp lệ.';

    const phoneRegex = /^0[0-9]{9}$/;
    if (!phoneRegex.test(formData.userNumberphone)) {
      return 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng số 0 (ví dụ: 0912345678).';
    }
    if (!formData.userPassword || formData.userPassword.length < 6) {
      return 'Mật khẩu phải có ít nhất 6 ký tự.';
    }
    if (formData.userPassword !== formData.confirmPassword) return 'Mật khẩu xác nhận không trùng khớp.';
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg('');
      const registerPayload = { ...formData };
      delete registerPayload.confirmPassword;
      await register(registerPayload);
      navigate('/courses');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Đăng ký không thành công. Vui lòng thử lại!';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="auth-page-wrapper">
      <div className="container">
        <div className="auth-card-container">
          <div className="auth-visual-side">
            <img className="auth-visual-image" src={studyBackground} alt="Tài liệu luyện thi TOEIC trên bàn học" />
            <div className="auth-visual-overlay" aria-hidden="true" />
          </div>

          <section className="auth-form-side" aria-labelledby="register-title">
            <header className="auth-header">
              <p className="auth-kicker">TOEIC ELEARNING</p>
              <h1 id="register-title" className="auth-title">Đăng Ký Tài Khoản</h1>
              <p className="auth-subtitle">Trở thành thành viên ToeicElearning chỉ trong 1 phút</p>
            </header>

            {errorMsg && (
              <div className="auth-alert">
                <Toast type="error" message={errorMsg} onClose={() => setErrorMsg('')} />
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label" htmlFor="userName">Họ và tên <span className="auth-required">*</span></label>
                <div className="input-with-icon">
                  <span className="input-icon" aria-hidden="true"><User size={18} /></span>
                  <input id="userName" name="userName" type="text" className="form-control" placeholder="Nhập họ và tên..." autoComplete="name" value={formData.userName} onChange={handleChange} required disabled={isLoading} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="userEmail">Địa chỉ Email <span className="auth-required">*</span></label>
                <div className="input-with-icon">
                  <span className="input-icon" aria-hidden="true"><Mail size={18} /></span>
                  <input id="userEmail" name="userEmail" type="email" className="form-control" placeholder="Nhập địa chỉ email..." autoComplete="email" value={formData.userEmail} onChange={handleChange} required disabled={isLoading} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="userNumberphone">Số điện thoại <span className="auth-required">*</span></label>
                <div className="input-with-icon">
                  <span className="input-icon" aria-hidden="true"><Phone size={18} /></span>
                  <input id="userNumberphone" name="userNumberphone" type="tel" className="form-control" placeholder="Nhập số điện thoại..." autoComplete="tel" inputMode="tel" value={formData.userNumberphone} onChange={handleChange} required disabled={isLoading} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="userPassword">Mật khẩu <span className="auth-required">*</span></label>
                <div className="input-with-icon">
                  <span className="input-icon" aria-hidden="true"><Lock size={18} /></span>
                  <input id="userPassword" name="userPassword" type="password" className="form-control" placeholder="Nhập mật khẩu..." autoComplete="new-password" value={formData.userPassword} onChange={handleChange} required disabled={isLoading} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">Xác nhận mật khẩu <span className="auth-required">*</span></label>
                <div className="input-with-icon">
                  <span className="input-icon" aria-hidden="true"><Lock size={18} /></span>
                  <input id="confirmPassword" name="confirmPassword" type="password" className="form-control" placeholder="Nhập lại mật khẩu..." autoComplete="new-password" value={formData.confirmPassword} onChange={handleChange} required disabled={isLoading} />
                </div>
              </div>

              <button type="submit" className="btn btn-primary auth-submit" disabled={isLoading}>
                {isLoading ? (
                  <span className="auth-submit-content"><span className="loading-spinner-sm" /> Đang khởi tạo tài khoản...</span>
                ) : (
                  <span className="auth-submit-content"><UserPlus size={18} aria-hidden="true" /> Đăng ký thành viên</span>
                )}
              </button>
            </form>

            <div className="auth-divider" aria-hidden="true"><span>Hoặc tiếp tục với</span></div>
            <div className="auth-google">
              <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} useOneTap={false} theme="outline" size="large" shape="rectangular" text="continue_with" locale="vi" />
            </div>

            <p className="auth-footer">
              Đã có tài khoản? <Link to="/login" className="auth-link">Đăng nhập ngay</Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
};

export default RegisterPage;
