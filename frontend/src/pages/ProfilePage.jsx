import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { User, Mail, Phone, Lock, Save, Shield, Upload, Camera, Check, Link as LinkIcon, Info } from 'lucide-react';
import Toast from '../components/common/Toast';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'password'
  const [avatarMode, setAvatarMode] = useState('preset'); // 'preset' | 'upload' | 'url'
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

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    oldUserPassword: '',
    newUserPassword: '',
    confirmNewPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordToast, setPasswordToast] = useState(null);

  // 12 diverse, colorful cartoon/animated avatars (under 80 chars, safe for DB VARCHAR(255))
  const avatarOptions = [
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Luna&backgroundColor=ffd5dc',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Milo&backgroundColor=c0aede',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Bella&backgroundColor=d1d4f9',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Leo&backgroundColor=ffdfbf',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Chloe&backgroundColor=b6e3f4',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Oliver&backgroundColor=ffd5dc',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Sophie&backgroundColor=c0aede',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Jack&backgroundColor=d1d4f9',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Zoe&backgroundColor=ffdfbf',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Rocky&backgroundColor=b6e3f4',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Spark&backgroundColor=ffd5dc',
  ];

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

  // Handle local file upload with canvas downscaling
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setProfileToast({ type: 'error', message: 'Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, WebP).' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Draw to 120x120 square
        const canvas = document.createElement('canvas');
        const size = 120;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Center crop
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setProfileData((prev) => ({ ...prev, userAvatar: dataUrl }));
        setProfileToast({
          type: 'info',
          message: 'Đã nạp ảnh vào khung xem trước! Hãy bấm "Lưu thay đổi" để gửi lên hệ thống.',
        });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
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
      const res = await userService.updateProfile({
        userName: profileData.userName,
        userEmail: profileData.userEmail,
        userNumberphone: profileData.userNumberphone,
        userAvatar: profileData.userAvatar,
      });

      if (res.code === 1000 && res.data) {
        updateUser(res.data);
        setProfileToast({ type: 'success', message: 'Cập nhật thông tin & ảnh đại diện thành công!' });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Cập nhật thất bại. Vui lòng thử lại!';
      
      // Detailed guide if database column constraint fails due to base64 length
      if (err.response?.data?.code === 1004 || errorMsg.includes('ràng buộc')) {
        setProfileToast({
          type: 'error',
          message: 'Lỗi độ dài dữ liệu ảnh: Cột user_avatar trong MySQL mặc định là VARCHAR(255) nên không chứa được chuỗi ảnh tải lên (Base64). Bạn vui lòng chọn ảnh mẫu có sẵn hoặc đổi cột user_avatar thành LONGTEXT trong backend nhé!',
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
                  src={profileData.userAvatar || '/images/default-avatar.svg'}
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
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                      <label className="form-label" style={{ margin: 0 }}>
                        Ảnh đại diện tài khoản
                      </label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          type="button"
                          className={`btn btn-sm ${avatarMode === 'preset' ? 'btn-primary' : 'btn-outline'}`}
                          style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                          onClick={() => setAvatarMode('preset')}
                        >
                          Ảnh mẫu có sẵn
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm ${avatarMode === 'upload' ? 'btn-primary' : 'btn-outline'}`}
                          style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                          onClick={() => setAvatarMode('upload')}
                        >
                          <Upload size={13} /> Tải từ máy
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm ${avatarMode === 'url' ? 'btn-primary' : 'btn-outline'}`}
                          style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                          onClick={() => setAvatarMode('url')}
                        >
                          <LinkIcon size={13} /> Dán link URL
                        </button>
                      </div>
                    </div>

                    {/* Mode 1: Presets (100% fits VARCHAR(255)) */}
                    {avatarMode === 'preset' && (
                      <div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: 12 }}>
                          Chọn 1 trong 12 ảnh đại diện hoạt hình bên dưới:
                        </p>
                        <div className="avatar-selection-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                          {avatarOptions.map((av, idx) => {
                            const isSelected = profileData.userAvatar === av;
                            return (
                              <div
                                key={idx}
                                style={{ position: 'relative', cursor: 'pointer' }}
                                onClick={() => setProfileData({ ...profileData, userAvatar: av })}
                                title={`Avatar mẫu ${idx + 1}`}
                              >
                                <img
                                  src={av}
                                  alt={`Avatar ${idx + 1}`}
                                  className={`avatar-option-item ${isSelected ? 'selected' : ''}`}
                                  style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover' }}
                                />
                                {isSelected && (
                                  <span
                                    style={{
                                      position: 'absolute',
                                      top: -2,
                                      right: -2,
                                      background: 'var(--primary)',
                                      color: '#fff',
                                      borderRadius: '50%',
                                      width: 18,
                                      height: 18,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      border: '1.5px solid #fff',
                                    }}
                                  >
                                    <Check size={11} strokeWidth={3} />
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Mode 2: Upload from Computer */}
                    {avatarMode === 'upload' && (
                      <div style={{ background: '#f8fafc', padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                          <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleFileUpload}
                          />
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload size={15} /> Chọn file ảnh từ thiết bị
                          </button>
                          <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                            Hỗ trợ JPG, PNG, WebP (Tự động cắt vuông)
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginTop: 10, fontSize: '0.8rem', color: 'var(--gray-600)' }}>
                          <Info size={15} style={{ flexShrink: 0, marginTop: 1, color: 'var(--primary)' }} />
                          <span>
                            Lưu ý: Để lưu được ảnh tải lên từ máy tính, backend cần hỗ trợ kiểu <code>LONGTEXT</code> cho thuộc tính <code>user_avatar</code>.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Mode 3: Direct URL */}
                    {avatarMode === 'url' && (
                      <div style={{ marginTop: 8 }}>
                        <div className="input-with-icon">
                          <span className="input-icon"><LinkIcon size={16} /></span>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Dán link ảnh online (ví dụ: https://...)"
                            value={profileData.userAvatar}
                            onChange={(e) => setProfileData({ ...profileData, userAvatar: e.target.value })}
                            disabled={profileLoading}
                          />
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: 4, display: 'block' }}>
                          Có thể dùng link ảnh từ Imgur, Unsplash hoặc các nguồn ảnh trực tuyến.
                        </span>
                      </div>
                    )}
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
