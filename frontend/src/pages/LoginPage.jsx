import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Lock, LogIn, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/common/Toast';
import studyBackground from '../assets/img/hero/toeic_980_co_ban_tay.jpg';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ emailOrPhone: '', userPassword: '' });
  const [errorMsg, setErrorMsg] = useState(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('locked') === 'true') {
      return 'Tài khoản của bạn đã bị Khóa bởi Quản trị viên. Bạn đã bị đăng xuất khỏi hệ thống.';
    }
    if (params.get('passwordChanged') === 'true') {
      return 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại bằng mật khẩu mới.';
    }
    if (params.get('passwordSet') === 'true') {
      return 'Đã thiết lập mật khẩu. Vui lòng đăng nhập bằng email hoặc số điện thoại và mật khẩu mới.';
    }
    return '';
  });
  const [isLoading, setIsLoading] = useState(false);

  const { login, loginWithGoogle } = useAuth();
  const redirectPath = location.state?.from?.pathname || '/';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleRoleRedirect = (loggedUser) => {
    const roleStr = loggedUser.role || loggedUser.roleName || loggedUser.role?.roleName;
    if (roleStr === 'ROLE_ADMIN') {
      navigate('/admin/dashboard');
    } else if (roleStr === 'ROLE_TEACHER') {
      navigate('/classrooms');
    } else {
      navigate(redirectPath);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
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
      const data = err.response?.data;
      const isLocked = Number(data?.code) === 2009 || err.response?.status === 403;
      const msg = data?.message || (isLocked ? 'Tài khoản của bạn đã bị khóa, vui lòng liên hệ quản trị viên' : null) || err.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại!';
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
      const data = err.response?.data;
      const isLocked = Number(data?.code) === 2009 || err.response?.status === 403;
      const msg = data?.message || (isLocked ? 'Tài khoản của bạn đã bị khóa, vui lòng liên hệ quản trị viên' : null) || err.message || 'Đăng nhập bằng tài khoản Google thất bại. Vui lòng thử lại!';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setErrorMsg('Đăng nhập Google thất bại hoặc bạn đã hủy liên kết.');
  };

  return (
    <main className="auth-page-wrapper">
      <div className="container">
        <div className="auth-card-container">
          <div className="auth-visual-side">
            <img className="auth-visual-image" src={studyBackground} alt="Tài liệu luyện thi TOEIC trên bàn học" />
            <div className="auth-visual-overlay" aria-hidden="true" />
          </div>

          <section className="auth-form-side" aria-labelledby="login-title">
            <header className="auth-header">
              <p className="auth-kicker">TOEIC ELEARNING</p>
              <h1 id="login-title" className="auth-title">Chào mừng trở lại!</h1>
              <p className="auth-subtitle">Đăng nhập bằng Email hoặc Số điện thoại</p>
            </header>

            {errorMsg && (
              <div className="auth-alert">
                <Toast type="error" message={errorMsg} onClose={() => setErrorMsg('')} />
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label" htmlFor="emailOrPhone">Email hoặc Số điện thoại <span className="auth-required">*</span></label>
                <div className="input-with-icon">
                  <span className="input-icon" aria-hidden="true"><Mail size={18} /></span>
                  <input id="emailOrPhone" name="emailOrPhone" type="text" className="form-control" placeholder="Nhập email hoặc số điện thoại đã đăng ký..." autoComplete="username" value={formData.emailOrPhone} onChange={handleChange} required disabled={isLoading} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="userPassword">Mật khẩu <span className="auth-required">*</span></label>
                <div className="input-with-icon">
                  <span className="input-icon" aria-hidden="true"><Lock size={18} /></span>
                  <input id="userPassword" name="userPassword" type="password" className="form-control" placeholder="Nhập mật khẩu..." autoComplete="current-password" value={formData.userPassword} onChange={handleChange} required disabled={isLoading} />
                </div>
              </div>

              <button type="submit" className="btn btn-primary auth-submit" disabled={isLoading}>
                {isLoading ? (
                  <span className="auth-submit-content"><span className="loading-spinner-sm" /> Đang đăng nhập...</span>
                ) : (
                  <span className="auth-submit-content"><LogIn size={18} aria-hidden="true" /> Đăng nhập</span>
                )}
              </button>
            </form>

            <div className="auth-divider" aria-hidden="true"><span>Hoặc tiếp tục với</span></div>
            <div className="auth-google">
              <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} useOneTap={false} theme="outline" size="large" shape="rectangular" text="continue_with" locale="vi" />
            </div>

            <p className="auth-footer">
              Chưa có tài khoản? <Link to="/register" className="auth-link">Đăng ký ngay</Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
