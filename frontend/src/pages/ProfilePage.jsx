import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { User, Mail, Phone, Lock, Save, Shield, CheckCircle, Image as ImageIcon } from 'lucide-react';
import Toast from '../components/common/Toast';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'password'

  // Profile Edit State
  const [profileData, setProfileData] = useState({
    userName: '',
    userNumberphone: '',
    userAvatar: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileToast, setProfileToast] = useState(null);

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordToast, setPasswordToast] = useState(null);

  // Initialize data from current user context
  useEffect(() => {
    if (user) {
      setProfileData({
        userName: user.userName || '',
        userNumberphone: user.userNumberphone || '',
        userAvatar: user.userAvatar || '/images/teacher-1.webp',
      });
    }
  }, [user]);

  // Handle Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileToast(null);

    // Validation
    if (!profileData.userName || profileData.userName.length < 4 || profileData.userName.length > 30) {
      setProfileToast({ type: 'error', message: 'Họ và tên phải từ 4 đến 30 ký tự.' });
      return;
    }
    const phoneRegex = /^0[0-9]{9}$/;
    if (!phoneRegex.test(profileData.userNumberphone)) {
      setProfileToast({ type: 'error', message: 'Số điện thoại phải gồm 10 chữ số (bắt đầu bằng 0).' });
      return;
    }

    try {
      setProfileLoading(true);
      const res = await userService.updateProfile({
        userName: profileData.userName,
        userNumberphone: profileData.userNumberphone,
        userAvatar: profileData.userAvatar,
      });

      if (res.code === 1000 && res.data) {
        updateUser(res.data);
        setProfileToast({ type: 'success', message: 'Cập nhật thông tin cá nhân thành công!' });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Cập nhật thất bại. Vui lòng thử lại!';
      setProfileToast({ type: 'error', message: msg });
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle Password Change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordToast(null);

    if (!passwordData.currentPassword) {
      setPasswordToast({ type: 'error', message: 'Vui lòng nhập mật khẩu hiện tại.' });
      return;
    }
    if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
      setPasswordToast({ type: 'error', message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setPasswordToast({ type: 'error', message: 'Mật khẩu xác nhận không khớp.' });
      return;
    }

    try {
      setPasswordLoading(false);
      setPasswordLoading(true);
      const res = await userService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (res.code === 1000) {
        setPasswordToast({ type: 'success', message: 'Đổi mật khẩu thành công! Mật khẩu mới đã được cập nhật.' });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
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

  const avatarOptions = [
    '/images/teacher-1.webp',
    '/images/teacher-2.webp',
    '/images/teacher-3.webp',
    '/images/course-1.webp',
  ];

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
              <img
                src={profileData.userAvatar || '/images/teacher-1.webp'}
                alt={user?.userName || 'User'}
                className="profile-avatar-large"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.userName || 'User') + '&background=198754&color=fff';
                }}
              />
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
                  <p className="text-muted">Cập nhật họ tên, số điện thoại và ảnh đại diện của bạn.</p>
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
                  <div className="form-group">
                    <label className="form-label">Địa chỉ Email (Định danh không đổi)</label>
                    <div className="input-with-icon">
                      <span className="input-icon"><Mail size={18} /></span>
                      <input
                        type="text"
                        className="form-control"
                        value={user?.userEmail || ''}
                        disabled
                        style={{ backgroundColor: 'var(--gray-100)', cursor: 'not-allowed' }}
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

                  <div className="form-group">
                    <label className="form-label">Chọn ảnh đại diện có sẵn hoặc dán link ảnh</label>
                    <div className="avatar-selection-grid">
                      {avatarOptions.map((av, idx) => (
                        <img
                          key={idx}
                          src={av}
                          alt={`Avatar ${idx + 1}`}
                          className={`avatar-option-item ${profileData.userAvatar === av ? 'selected' : ''}`}
                          onClick={() => setProfileData({ ...profileData, userAvatar: av })}
                        />
                      ))}
                    </div>
                    <div className="input-with-icon" style={{ marginTop: 10 }}>
                      <span className="input-icon"><ImageIcon size={18} /></span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Hoặc dán URL ảnh đại diện..."
                        value={profileData.userAvatar}
                        onChange={(e) => setProfileData({ ...profileData, userAvatar: e.target.value })}
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
                    <label className="form-label" htmlFor="currentPassword">
                      Mật khẩu hiện tại <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <div className="input-with-icon">
                      <span className="input-icon"><Lock size={18} /></span>
                      <input
                        type="password"
                        id="currentPassword"
                        className="form-control"
                        placeholder="Nhập mật khẩu hiện tại..."
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        required
                        disabled={passwordLoading}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="newPassword">
                      Mật khẩu mới <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <div className="input-with-icon">
                      <span className="input-icon"><Lock size={18} /></span>
                      <input
                        type="password"
                        id="newPassword"
                        className="form-control"
                        placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)..."
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
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
