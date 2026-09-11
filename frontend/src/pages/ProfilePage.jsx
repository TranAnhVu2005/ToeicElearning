import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { uploadAvatar } from '../services/uploadService';
import { User, Mail, Phone, Lock, Save, Shield, Upload, Camera, Check, Info, RefreshCw } from 'lucide-react';
import Toast from '../components/common/Toast';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'password'
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


  // Fetch fresh profile on mount
  useEffect(() => {
    const fetchFreshProfile = async () => {
      try {
        const res = await userService.getProfile();
        if (res.code === 1000 && res.data) {
          updateUser(res.data);
          setProfileData({
            userName: res.data.userName || '',
            userEmail: res.data.userEmail || '',
            userNumberphone: res.data.userNumberphone || '',
            userAvatar: res.data.userAvatar || '/images/default-avatar.svg',
          });
        }
      } catch (err) {
        console.error('Profile check error:', err);
      }
    };
    fetchFreshProfile();
  }, []);

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

    if (!file.type.startsWith('image/')) {
      setProfileToast({ type: 'error', message: 'Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, WebP).' });
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
        setPasswordToast({ type: 'success', message: 'Đổi mật khẩu thành công! Mật khẩu mới đã được cập nhật.' });
        setPasswordData({
          oldUserPassword: '',
          newUserPassword: '',
          confirmNewPassword: '',
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ!';
      setPasswordToast({ type: 'error', message: msg });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="profile-page bg-gray-50">
      {/* Header Banner */}
      <div className="page-header-banner">
        <div className="container">
          <span className="badge badge-primary" style={{ marginBottom: 8 }}>Tài khoản cá nhân</span>
          <h1 className="page-title">Hồ Sơ Của Bạn</h1>
          <p className="page-subtitle">Quản lý thông tin tài khoản, bảo mật và ảnh đại diện học viên.</p>
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
                    e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.userName || 'User') + '&background=198754&color=fff';
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
              <span className={`badge ${user?.role === 'ROLE_ADMIN' || user?.role?.roleName === 'ROLE_ADMIN' ? 'badge-primary' : 'badge-neutral'}`} style={{ marginTop: 6 }}>
                {user?.role === 'ROLE_ADMIN' || user?.role?.roleName === 'ROLE_ADMIN' ? 'Quản trị viên hệ thống' : 'Học viên TOEIC'}
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
                          accept="image/png, image/jpeg, image/webp"
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
                          {selectedAvatarFile ? `Đã chọn: ${selectedAvatarFile.name}` : 'Hỗ trợ file PNG, JPG, JPEG, WebP'}
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
