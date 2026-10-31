import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import { User, Mail, Phone, Lock, Save, Shield, Upload, Camera, Check, Receipt, LoaderCircle, RefreshCw } from 'lucide-react';
import Toast from '../components/common/Toast';
import { teacherApplicationService } from '../services/teacherApplicationService';
import { GoogleLogin } from '@react-oauth/google';

const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => new URLSearchParams(window.location.search).get('tab') === 'payments' ? 'payments' : 'profile');
  const [paymentRows, setPaymentRows] = useState([]);
  const [paymentPage, setPaymentPage] = useState(1);
  const [paymentPages, setPaymentPages] = useState(0);
  const [paymentTotal, setPaymentTotal] = useState(0);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentRefresh, setPaymentRefresh] = useState(0);
  const fileInputRef = useRef(null);

  // Profile Edit State
  const [profileData, setProfileData] = useState({
    userName: '',
    userEmail: '',
    userNumberphone: '',
    userAvatar: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileToast, setProfileToast] = useState(null);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState(null);

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    oldUserPassword: '',
    newUserPassword: '',
    confirmNewPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordToast, setPasswordToast] = useState(null);
  const [canSetLocalPassword, setCanSetLocalPassword] = useState(null);
  const [passwordCapabilityError, setPasswordCapabilityError] = useState(false);
  const [profileRefresh, setProfileRefresh] = useState(0);

  useEffect(() => {
    if (activeTab !== 'payments') return undefined;
    let active = true;
    setPaymentLoading(true);
    setPaymentError('');
    teacherApplicationService.listPayments({ page: paymentPage, size: 10 })
      .then((response) => {
        if (!active) return;
        if (response.code !== 1000) throw new Error(response.message || 'Không tải được lịch sử thanh toán.');
        const data = response.data || {};
        setPaymentRows(data.content || []);
        setPaymentPages(data.totalPages || 0);
        setPaymentTotal(data.totalElements || 0);
      })
      .catch((error) => { if (active) setPaymentError(error.response?.data?.message || error.message || 'Không tải được lịch sử thanh toán.'); })
      .finally(() => { if (active) setPaymentLoading(false); });
    return () => { active = false; };
  }, [activeTab, paymentPage, paymentRefresh]);


  // Fetch fresh profile on mount
  useEffect(() => {
    let active = true;
    const fetchFreshProfile = async () => {
      try {
        const res = await userService.getProfile();
        if (res.code !== 1000 || !res.data) throw new Error('Không tải được hồ sơ tài khoản.');
        if (active) {
          updateUser(res.data);
          setCanSetLocalPassword(Boolean(res.data.canSetLocalPassword));
          setPasswordCapabilityError(false);
          setProfileData({
            userName: res.data.userName || '',
            userEmail: res.data.userEmail || '',
            userNumberphone: res.data.userNumberphone || '',
            userAvatar: res.data.userAvatar || '/images/default-avatar.svg',
          });
        }
      } catch {
        if (active) setPasswordCapabilityError(true);
      }
    };
    fetchFreshProfile();
    return () => { active = false; };
  }, [updateUser, profileRefresh]);

  // Initialize data from current user context
  useEffect(() => {
    if (user) {
      setProfileData({
        userName: user.userName || '',
        userEmail: user.userEmail || '',
        userNumberphone: user.userNumberphone || '',
        userAvatar: user.userAvatar || '/images/default-avatar.svg',
      });
    }
  }, [user]);

  // Handle local file selection with instant preview (0 network requests!)
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setProfileToast({ type: 'error', message: 'Chọn ảnh PNG hoặc JPEG có kích thước tối đa 5 MB.' });
      return;
    }

    // Tạo URL xem trước ngay lập tức từ bộ nhớ trình duyệt mà không tốn 1 byte mạng
    const localPreview = URL.createObjectURL(file);
    setSelectedAvatarFile(file);
    setPreviewAvatarUrl(localPreview);
    setProfileToast({
      type: 'info',
      message: 'Đã nạp ảnh xem trước! Bấm nút "Lưu thay đổi" bên dưới để hệ thống cập nhật vào tài khoản.',
    });
  };

  const handleCancelSelectedFile = () => {
    setSelectedAvatarFile(null);
    if (previewAvatarUrl) {
      URL.revokeObjectURL(previewAvatarUrl);
      setPreviewAvatarUrl(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
    setProfileToast({ type: 'info', message: 'Đã hủy chọn ảnh mới, giữ lại ảnh đại diện cũ.' });
  };

  // Handle Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileToast(null);

    // Validation
    if (!profileData.userName || profileData.userName.length < 4 || profileData.userName.length > 30) {
      setProfileToast({ type: 'error', message: 'Họ và tên phải từ 4 đến 30 ký tự.' });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (profileData.userEmail && !emailRegex.test(profileData.userEmail)) {
      setProfileToast({ type: 'error', message: 'Email không đúng định dạng.' });
      return;
    }
    const phoneRegex = /^0[0-9]{9}$/;
    if (!phoneRegex.test(profileData.userNumberphone)) {
      setProfileToast({ type: 'error', message: 'Số điện thoại phải gồm 10 chữ số (bắt đầu bằng 0).' });
      return;
    }

    try {
      setProfileLoading(true);
      // Gửi ĐÚNG 1 REQUEST DUY NHẤT: Backend tự tải lên Cloudinary và lưu MySQL
      const res = await userService.updateProfile({
        userName: profileData.userName,
        userEmail: profileData.userEmail,
        userNumberphone: profileData.userNumberphone,
        file: selectedAvatarFile, // Gửi file nếu người dùng chọn ảnh mới từ máy
      });

      if (res.code === 1000 && res.data) {
        updateUser(res.data);
        setSelectedAvatarFile(null);
        setPreviewAvatarUrl(null);
        setProfileData((prev) => ({
          ...prev,
          userAvatar: res.data.userAvatar || prev.userAvatar,
        }));
        setProfileToast({ type: 'success', message: 'Cập nhật thông tin & ảnh đại diện thành công!' });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Cập nhật thất bại. Vui lòng thử lại!';
      
      // Detailed guide if database column constraint fails due to base64 length
      if (err.response?.data?.code === 1004 || errorMsg.includes('ràng buộc')) {
        setProfileToast({
          type: 'error',
          message: 'Lỗi lưu trữ ảnh: Đường dẫn ảnh vượt quá độ dài cho phép. Vui lòng tải file ảnh trực tiếp từ máy để hệ thống tự tối ưu qua Cloudinary nhé!',
        });
      } else {
        setProfileToast({ type: 'error', message: errorMsg });
      }
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle Password Change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordToast(null);

    if (!passwordData.oldUserPassword) {
      setPasswordToast({ type: 'error', message: 'Vui lòng nhập mật khẩu cũ.' });
      return;
    }
    if (!passwordData.newUserPassword || passwordData.newUserPassword.length < 6) {
      setPasswordToast({ type: 'error', message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      return;
    }
    if (passwordData.newUserPassword === passwordData.oldUserPassword) {
      setPasswordToast({ type: 'error', message: 'Mật khẩu mới không được trùng với mật khẩu cũ.' });
      return;
    }
    if (passwordData.newUserPassword !== passwordData.confirmNewPassword) {
      setPasswordToast({ type: 'error', message: 'Mật khẩu xác nhận không khớp.' });
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await userService.changePassword({
        oldUserPassword: passwordData.oldUserPassword,
        newUserPassword: passwordData.newUserPassword,
      });

      if (res.code === 1000) {
        logout();
        navigate('/login?passwordChanged=true', { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ!';
      setPasswordToast({ type: 'error', message: msg });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleGooglePasswordSetup = async (credentialResponse) => {
    setPasswordToast(null);
    if (!credentialResponse?.credential) {
      setPasswordToast({ type: 'error', message: 'Google chưa xác nhận tài khoản. Vui lòng thử lại.' });
      return;
    }
    if (!passwordData.newUserPassword || passwordData.newUserPassword.length < 6 || passwordData.newUserPassword.length > 100) {
      setPasswordToast({ type: 'error', message: 'Mật khẩu mới phải có từ 6 đến 100 ký tự.' });
      return;
    }
    if (passwordData.newUserPassword !== passwordData.confirmNewPassword) {
      setPasswordToast({ type: 'error', message: 'Mật khẩu xác nhận không khớp.' });
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await userService.setLocalPassword({
        googleIdToken: credentialResponse.credential,
        newUserPassword: passwordData.newUserPassword,
      });
      if (res.code !== 1000) throw new Error(res.message || 'Không thể thiết lập mật khẩu.');
      logout();
      navigate('/login?passwordSet=true', { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Không thể thiết lập mật khẩu.';
      setPasswordToast({ type: 'error', message });
    } finally {
      setPasswordLoading(false);
    }
  };

  const roleName = typeof user?.role === 'string' ? user.role : user?.role?.roleName || user?.roleName;
  const isAdmin = roleName === 'ROLE_ADMIN';
  const isTeacher = roleName === 'ROLE_TEACHER';
  const roleLabel = isAdmin ? 'Quản trị viên hệ thống' : isTeacher ? 'Giáo viên TOEIC' : 'Học viên TOEIC';

  return (
    <div className="profile-page neo-brutal-profile">
      {/* Header Banner */}
      <div className="page-header-banner">
        <div className="container">
          <span className="badge badge-primary" style={{ marginBottom: 8 }}>Tài khoản cá nhân</span>
          <h1 className="page-title">Hồ Sơ Của Bạn</h1>
          <p className="page-subtitle">Quản lý thông tin tài khoản, bảo mật và ảnh đại diện của bạn.</p>
        </div>
      </div>

      <div className="container section-padding">
        <div className="profile-layout">
          {/* Left Sidebar Card */}
          <div className="profile-sidebar-card">
            <div className="profile-avatar-block">
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img
                  src={previewAvatarUrl || profileData.userAvatar || '/images/default-avatar.svg'}
                  alt={user?.userName || 'User'}
                  className="profile-avatar-large"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/default-avatar.svg';
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Tải ảnh đại diện từ thiết bị"
                  style={{
                    position: 'absolute',
                    bottom: 14,
                    right: 4,
                    backgroundColor: 'var(--primary)',
                    color: '#fff',
                    border: '2px solid #fff',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-md)',
                  }}
                >
                  <Camera size={16} />
                </button>
              </div>

              <h3 className="profile-card-name">{user?.userName || 'Học viên'}</h3>
              <p className="profile-card-email">{user?.userEmail}</p>
              <span className={`badge ${isAdmin ? 'badge-primary' : isTeacher ? 'badge-warning' : 'badge-neutral'}`} style={{ marginTop: 6 }}>
                {roleLabel}
              </span>
            </div>

            <div className="profile-nav-tabs">
              <button
                className={`profile-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <User size={18} /> Thông tin cá nhân
              </button>
              <button
                className={`profile-tab-btn ${activeTab === 'password' ? 'active' : ''}`}
                onClick={() => setActiveTab('password')}
              >
                <Lock size={18} /> Đổi mật khẩu
              </button>
              <button
                className={`profile-tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
                onClick={() => { setPaymentPage(1); setActiveTab('payments'); }}
              >
                <Receipt size={18} /> Thanh toán
              </button>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="profile-content-card">
            {activeTab === 'profile' && (
              <div>
                <div className="profile-card-header">
                  <h2 className="profile-section-title">Chỉnh sửa thông tin</h2>
                  <p className="text-muted">Cập nhật họ tên, email, số điện thoại và ảnh đại diện của bạn.</p>
                </div>

                {profileToast && (
                  <div style={{ marginBottom: 20 }}>
                    <Toast
                      type={profileToast.type}
                      message={profileToast.message}
                      onClose={() => setProfileToast(null)}
                    />
                  </div>
                )}

                <form onSubmit={handleProfileSubmit}>
                  {/* Avatar Selection Section */}
                  <div className="form-group" style={{ marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border-light)' }}>
                    <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>
                      Ảnh đại diện tài khoản
                    </label>

                    <div style={{ background: '#f8fafc', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/png, image/jpeg,.png,.jpg,.jpeg"
                          style={{ display: 'none' }}
                          onChange={handleFileUpload}
                          disabled={profileLoading}
                        />
                        <button
                          type="button"
                          className="btn btn-primary btn-sm inline-flex items-center gap-2"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={profileLoading}
                        >
                          <Upload size={15} /> {selectedAvatarFile ? 'Chọn ảnh khác' : 'Chọn ảnh đại diện từ thiết bị'}
                        </button>
                        {selectedAvatarFile && (
                          <button
                            type="button"
                            className="btn btn-outline btn-sm text-red-600 border-red-300 hover:bg-red-50"
                            onClick={handleCancelSelectedFile}
                          >
                            Hủy ảnh vừa chọn
                          </button>
                        )}
                        <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                          {selectedAvatarFile ? `Đã chọn: ${selectedAvatarFile.name}` : 'Hỗ trợ PNG/JPEG tối đa 5 MB'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginTop: 12, fontSize: '0.8rem', color: '#15803d' }}>
                        <Check size={15} style={{ flexShrink: 0, marginTop: 1, color: '#16a34a' }} />
                        <span>
                          Ảnh được nạp xem trước tức thì trên khung tròn bên trái. Khi bạn bấm nút <strong>"Lưu thay đổi"</strong> bên dưới, hệ thống mới chính thức tải ảnh lên Cloudinary và cập nhật tài khoản.
                        </span>
                      </div>
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
                        className="form-control"
                        value={profileData.userEmail}
                        onChange={(e) => setProfileData({ ...profileData, userEmail: e.target.value })}
                        required
                        disabled={profileLoading}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="userName">
                      Họ và tên <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <div className="input-with-icon">
                      <span className="input-icon"><User size={18} /></span>
                      <input
                        type="text"
                        id="userName"
                        className="form-control"
                        value={profileData.userName}
                        onChange={(e) => setProfileData({ ...profileData, userName: e.target.value })}
                        required
                        disabled={profileLoading}
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
                        className="form-control"
                        value={profileData.userNumberphone}
                        onChange={(e) => setProfileData({ ...profileData, userNumberphone: e.target.value })}
                        required
                        disabled={profileLoading}
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: 24 }}>
                    <button type="submit" className="btn btn-primary" disabled={profileLoading}>
                      {profileLoading ? (
                        <span className="flex-center" style={{ gap: 8 }}>
                          <div className="loading-spinner-sm" /> Đang lưu...
                        </span>
                      ) : (
                        <span className="flex-center" style={{ gap: 8 }}>
                          <Save size={18} /> Lưu thay đổi
                        </span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'password' && (
              <div>
                <div className="profile-card-header">
                  <h2 className="profile-section-title">Thay đổi mật khẩu</h2>
                  <p className="text-muted">Đảm bảo mật khẩu của bạn có ít nhất 6 ký tự để bảo vệ an toàn tài khoản.</p>
                </div>

                {passwordToast && (
                  <div style={{ marginBottom: 20 }}>
                    <Toast
                      type={passwordToast.type}
                      message={passwordToast.message}
                      onClose={() => setPasswordToast(null)}
                    />
                  </div>
                )}

                {canSetLocalPassword === null ? (
                  passwordCapabilityError ? (
                    <div role="alert" className="flex flex-wrap items-center justify-between gap-3 border-2 border-black bg-rose-100 p-4 font-bold shadow-[3px_3px_0_#111]">
                      <span>Không tải được trạng thái bảo mật tài khoản.</span>
                      <button
                        type="button"
                        className="border-2 border-black bg-[#FFE600] px-3 py-2 text-sm font-black"
                        onClick={() => {
                          setCanSetLocalPassword(null);
                          setPasswordCapabilityError(false);
                          setProfileRefresh((current) => current + 1);
                        }}
                      >
                        Thử lại
                      </button>
                    </div>
                  ) : (
                    <div role="status" className="border-2 border-black bg-white p-4 font-bold shadow-[3px_3px_0_#111]">
                      Đang tải trạng thái bảo mật tài khoản…
                    </div>
                  )
                ) : canSetLocalPassword ? (
                  <div className="max-w-xl border-2 border-black bg-[#FFFDF2] p-5 shadow-[4px_4px_0_#111]">
                    <p className="mb-4 text-sm font-semibold text-[#222]">
                      Tài khoản này đăng nhập bằng Google và chưa có mật khẩu cục bộ. Nhập mật khẩu mới, sau đó xác minh lại Google để thiết lập.
                    </p>
                    <div className="form-group">
                      <label className="form-label" htmlFor="newUserPassword">Mật khẩu mới</label>
                      <div className="input-with-icon">
                        <span className="input-icon"><Lock size={18} /></span>
                        <input
                          type="password" id="newUserPassword" className="form-control"
                          autoComplete="new-password" minLength={6} maxLength={100}
                          value={passwordData.newUserPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newUserPassword: e.target.value })}
                          disabled={passwordLoading}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="confirmNewPassword">Xác nhận mật khẩu mới</label>
                      <div className="input-with-icon">
                        <span className="input-icon"><Lock size={18} /></span>
                        <input
                          type="password" id="confirmNewPassword" className="form-control"
                          autoComplete="new-password" minLength={6} maxLength={100}
                          value={passwordData.confirmNewPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
                          disabled={passwordLoading}
                        />
                      </div>
                    </div>
                    <div className="mt-5 flex flex-col items-start gap-2">
                      <span className="text-xs font-bold uppercase tracking-wide">Xác minh tài khoản Google</span>
                      {passwordLoading ? (
                        <span className="flex items-center gap-2 border-2 border-black bg-[#FFE600] px-4 py-2 font-black">
                          <LoaderCircle size={16} className="animate-spin" /> Đang thiết lập…
                        </span>
                      ) : (
                        <GoogleLogin
                          onSuccess={handleGooglePasswordSetup}
                          onError={() => setPasswordToast({ type: 'error', message: 'Xác minh Google thất bại hoặc đã bị hủy.' })}
                          useOneTap={false} prompt="select_account" theme="outline" size="large"
                          shape="rectangular" text="continue_with" locale="vi"
                        />
                      )}
                    </div>
                  </div>
                ) : (
                <form onSubmit={handlePasswordSubmit}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="oldUserPassword">
                      Mật khẩu hiện tại <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <div className="input-with-icon">
                      <span className="input-icon"><Lock size={18} /></span>
                      <input
                        type="password"
                        id="oldUserPassword"
                        className="form-control"
                        placeholder="Nhập mật khẩu hiện tại..."
                        value={passwordData.oldUserPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, oldUserPassword: e.target.value })}
                        required
                        disabled={passwordLoading}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="newUserPassword">
                      Mật khẩu mới <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <div className="input-with-icon">
                      <span className="input-icon"><Lock size={18} /></span>
                      <input
                        type="password"
                        id="newUserPassword"
                        className="form-control"
                        placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)..."
                        value={passwordData.newUserPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newUserPassword: e.target.value })}
                        required
                        disabled={passwordLoading}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="confirmNewPassword">
                      Xác nhận mật khẩu mới <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <div className="input-with-icon">
                      <span className="input-icon"><Lock size={18} /></span>
                      <input
                        type="password"
                        id="confirmNewPassword"
                        className="form-control"
                        placeholder="Nhập lại mật khẩu mới..."
                        value={passwordData.confirmNewPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
                        required
                        disabled={passwordLoading}
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: 24 }}>
                    <button type="submit" className="btn btn-primary" disabled={passwordLoading}>
                      {passwordLoading ? (
                        <span className="flex-center" style={{ gap: 8 }}>
                          <div className="loading-spinner-sm" /> Đang cập nhật...
                        </span>
                      ) : (
                        <span className="flex-center" style={{ gap: 8 }}>
                          <Shield size={18} /> Cập nhật mật khẩu
                        </span>
                      )}
                    </button>
                  </div>
                </form>
                )}
              </div>
            )}

            {activeTab === 'payments' && (
              <section className="text-[#111]">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b-2 border-black pb-4">
                  <div><h2 className="text-2xl font-black">Lịch sử thanh toán</h2><p className="mt-1 text-sm font-semibold">Giao dịch gắn với tài khoản này · {paymentTotal} giao dịch</p></div>
                  <button type="button" onClick={() => setPaymentRefresh((current) => current + 1)} disabled={paymentLoading} className="inline-flex items-center gap-2 border-2 border-black bg-white px-3 py-2 text-sm font-black disabled:opacity-50"><RefreshCw size={15} /> Tải lại</button>
                </div>
                {paymentError && <div role="alert" className="mb-4 border-2 border-black bg-rose-200 p-3 font-bold">{paymentError}</div>}
                {paymentLoading ? <div className="flex items-center justify-center gap-2 border-2 border-black bg-white p-8 font-bold"><LoaderCircle size={18} className="animate-spin" /> Đang tải giao dịch…</div>
                  : paymentRows.length === 0 ? <div className="border-2 border-dashed border-black bg-white p-8 text-center font-bold">Bạn chưa có giao dịch thanh toán nào.</div>
                    : <div className="overflow-x-auto border-2 border-black bg-white shadow-[3px_3px_0_#111]"><table className="w-full min-w-[650px] border-collapse text-left text-sm"><thead className="bg-black text-white"><tr><th className="p-3">Sản phẩm</th><th className="p-3">Số tiền</th><th className="p-3">Trạng thái</th><th className="p-3">Thời gian</th><th className="p-3">Mã giao dịch</th></tr></thead><tbody>{paymentRows.map((payment) => {
                      const statusLabels = { PENDING: 'Đang xử lý', SUCCESS: 'Thành công', FAILED: 'Thất bại', CANCELLED: 'Đã hủy', EXPIRED: 'Hết hạn' };
                      const statusColors = { PENDING: 'bg-amber-200', SUCCESS: 'bg-lime-200', FAILED: 'bg-rose-200', CANCELLED: 'bg-[#f1eedf]', EXPIRED: 'bg-rose-200' };
                      const product = payment.productName || (payment.productType === 'TEACHER_APPLICATION' ? 'Đăng ký giáo viên' : payment.productType === 'TEST_VIP' ? 'Đề VIP' : 'Sản phẩm');
                      const timestamp = payment.paidAt || payment.createdAt;
                      const displayTime = timestamp ? new Date(`${timestamp}+07:00`).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : '—';
                      return <tr key={payment.transactionReference} className="border-t border-black/20 align-top"><td className="p-3 font-bold">{product}{payment.productType === 'TEST_VIP' && <span className="mt-1 block text-xs font-semibold">Quyền truy cập vĩnh viễn</span>}</td><td className="p-3 font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(payment.amount || 0))}</td><td className="p-3"><span className={`inline-block border border-black px-2 py-1 text-xs font-black ${statusColors[payment.status] || 'bg-white'}`}>{statusLabels[payment.status] || 'Chưa rõ'}</span></td><td className="p-3">{displayTime}</td><td className="max-w-40 break-all p-3 font-mono text-xs">{payment.transactionReference}</td></tr>;
                    })}</tbody></table></div>}
                {!paymentLoading && paymentPages > 1 && <nav className="mt-4 flex items-center justify-between gap-3 border-2 border-black bg-white p-3" aria-label="Phân trang lịch sử thanh toán"><button type="button" disabled={paymentPage <= 1} onClick={() => setPaymentPage((current) => current - 1)} className="border-2 border-black bg-[#FFE600] px-3 py-2 text-sm font-black disabled:opacity-40">Trang trước</button><span className="text-sm font-bold" aria-live="polite">Trang {paymentPage} / {paymentPages}</span><button type="button" disabled={paymentPage >= paymentPages} onClick={() => setPaymentPage((current) => current + 1)} className="border-2 border-black bg-[#FFE600] px-3 py-2 text-sm font-black disabled:opacity-40">Trang sau</button></nav>}
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
