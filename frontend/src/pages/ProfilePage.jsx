import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { userService } from '../services/userService';
import { examService } from '../services/examService';
import UserAvatar from '../components/common/UserAvatar';
import {
  User,
  Mail,
  Phone,
  Lock,
  Save,
  Shield,
  Upload,
  Camera,
  Check,
  Receipt,
  LoaderCircle,
  RefreshCw,
  Clock,
  ExternalLink,
  Flame,
  Trophy,
  Award,
  Sparkles,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import Toast from '../components/common/Toast';
import { teacherApplicationService } from '../services/teacherApplicationService';
import { GoogleLogin } from '@react-oauth/google';
import heroBg from '../assets/img/coursepage/thuvien.jpg';
import sidebarCoverBg from '../assets/img/coursepage/biasach.jpg';

const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => {
    const tab = new URLSearchParams(window.location.search).get('tab');
    return tab === 'payments' || tab === 'history' || tab === 'password' ? tab : 'profile';
  });
  const [paymentRows, setPaymentRows] = useState([]);
  const [paymentPage, setPaymentPage] = useState(1);
  const [paymentPages, setPaymentPages] = useState(0);
  const [paymentTotal, setPaymentTotal] = useState(0);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentRefresh, setPaymentRefresh] = useState(0);
  const fileInputRef = useRef(null);

  // Test History State
  const [testHistory, setTestHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [historyRefresh, setHistoryRefresh] = useState(0);
  const [historyFilter, setHistoryFilter] = useState('ALL'); // ALL | FULL | PART

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

  useEffect(() => {
    if (activeTab !== 'history') return undefined;
    let active = true;
    setHistoryLoading(true);
    setHistoryError('');
    examService.getTestHistory()
      .then((response) => {
        if (!active) return;
        if (response.code === 1000 && Array.isArray(response.data)) {
          setTestHistory(response.data);
        } else {
          setTestHistory([]);
        }
      })
      .catch((error) => {
        if (active) setHistoryError(error.response?.data?.message || error.message || 'Không tải được lịch sử làm bài.');
      })
      .finally(() => {
        if (active) setHistoryLoading(false);
      });
    return () => { active = false; };
  }, [activeTab, historyRefresh]);


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
            userAvatar: res.data.userAvatar || '',
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
        userAvatar: user.userAvatar || '',
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
  const currentStreak = Number(user?.currentStreak ?? 0);
  const highestStreak = Number(user?.highestStreak ?? 0);
  const bestScore = Number(user?.totalScore ?? 0);
  const bestScorePercent = Math.min(100, Math.round((bestScore / 990) * 100));
  const isAtRecordStreak = currentStreak > 0 && currentStreak >= highestStreak;

  return (
    <div className="profile-page min-h-screen bg-[#F8FAFC] pb-16 text-slate-900">
      {/* Editorial Hero & Achievement Showcase Header */}
      <section
        className="relative overflow-hidden border-b border-slate-200 bg-white"
        style={{
          backgroundImage: `linear-gradient(108deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.94) 55%, rgba(239,246,255,0.88) 100%), url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container py-8 lg:py-10">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 border border-blue-200 bg-blue-50/90 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#1D4ED8]">
                <Sparkles size={13} /> Tài khoản & Thành tích học tập
              </div>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Hồ Sơ Của Bạn
              </h1>
              <p className="mt-2 text-base leading-relaxed text-slate-600">
                Quản lý thông tin định danh, bảo mật tài khoản và theo dõi chuỗi ngày luyện tập TOEIC kỷ lục của bạn.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className={`inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${
                  isAdmin
                    ? 'border-blue-300 bg-blue-50 text-[#1D4ED8]'
                    : isTeacher
                    ? 'border-amber-300 bg-amber-50 text-amber-800'
                    : 'border-slate-300 bg-white text-slate-700'
                }`}
              >
                <CheckCircle2 size={14} className="text-[#1D4ED8]" />
                {roleLabel}
              </span>
              {user?.userEmail && (
                <span className="inline-flex items-center gap-1.5 border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  <Mail size={13} className="text-slate-400" />
                  {user.userEmail}
                </span>
              )}
            </div>
          </div>

          {/* Prominent Streak & Record Spotlight Strip */}
          <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Card 1: Current Streak */}
            <div className="relative overflow-hidden border border-amber-300/90 bg-gradient-to-br from-amber-50/95 via-white to-orange-50/80 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.1em] text-amber-800">
                    <Flame size={15} className="fill-amber-500 text-amber-600" />
                    Chuỗi ngày học (Streak)
                  </span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <strong className="text-3xl font-bold tabular-nums tracking-tight text-slate-950 sm:text-4xl">
                      {currentStreak}
                    </strong>
                    <span className="text-base font-bold text-amber-800">ngày liên tiếp</span>
                  </div>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-amber-200 bg-amber-100/80 text-amber-600 shadow-xs">
                  <Flame size={24} className={currentStreak > 0 ? 'fill-amber-500 text-amber-600' : 'text-amber-500'} />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-amber-200/70 pt-2.5 text-xs">
                <span className="font-semibold text-amber-900/80">
                  {currentStreak > 0
                    ? 'Đang duy trì nhịp độ luyện thi mỗi ngày'
                    : 'Hoàn thành 1 bài tập hôm nay để kích hoạt chuỗi'}
                </span>
                <span className="shrink-0 border border-amber-300 bg-amber-100/90 px-2 py-0.5 text-[11px] font-bold text-amber-900">
                  {currentStreak > 0 ? 'Đang hoạt động' : 'Chưa mở chuỗi'}
                </span>
              </div>
            </div>

            {/* Card 2: Personal Best Streak Record */}
            <div className="relative overflow-hidden border border-blue-300/90 bg-gradient-to-br from-blue-50/95 via-white to-indigo-50/75 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.1em] text-[#1D4ED8]">
                    <Trophy size={15} className="text-[#1D4ED8]" />
                    Kỷ lục chuỗi ngày học
                  </span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <strong className="text-3xl font-bold tabular-nums tracking-tight text-[#1D4ED8] sm:text-4xl">
                      {highestStreak}
                    </strong>
                    <span className="text-base font-bold text-slate-700">ngày kỷ lục</span>
                  </div>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-blue-200 bg-blue-100/80 text-[#1D4ED8] shadow-xs">
                  <Trophy size={23} />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-blue-200/70 pt-2.5 text-xs">
                <span className="font-semibold text-slate-600">
                  {isAtRecordStreak
                    ? 'Tuyệt vời! Bạn đang ở đỉnh kỷ lục cá nhân'
                    : 'Mốc duy trì học tập liên tục dài nhất'}
                </span>
                <span className="shrink-0 border border-blue-200 bg-blue-100/80 px-2 py-0.5 text-[11px] font-bold text-[#1D4ED8]">
                  {isAtRecordStreak ? 'Đỉnh kỷ lục' : 'Kỷ lục cá nhân'}
                </span>
              </div>
            </div>

            {/* Card 3: Highest Accumulated / TOEIC Score */}
            <div className="relative overflow-hidden border border-emerald-300/90 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/70 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.1em] text-emerald-800">
                    <Award size={15} className="text-emerald-700" />
                    Điểm tích lũy cao nhất
                  </span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <strong className="text-3xl font-bold tabular-nums tracking-tight text-slate-950 sm:text-4xl">
                      {bestScore}
                    </strong>
                    <span className="text-sm font-bold text-emerald-800">/ 990 điểm</span>
                  </div>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-emerald-200 bg-emerald-100/80 text-emerald-700 shadow-xs">
                  <Award size={24} />
                </div>
              </div>
              <div className="mt-3 border-t border-emerald-200/70 pt-2.5">
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">Tiến độ mốc 990 TOEIC</span>
                  <span className="font-bold tabular-nums text-emerald-800">{bestScorePercent}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden bg-emerald-100">
                  <div
                    className="h-full bg-emerald-600 transition-all duration-300"
                    style={{ width: `${bestScorePercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container pt-8">
        <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[320px_minmax(0,1fr)]">
          {/* Left Sidebar Card */}
          <aside className="profile-sidebar-card overflow-hidden !p-0">
            {/* Decorative Sidebar Cover */}
            <div
              className="h-24 w-full border-b border-slate-200 bg-slate-900"
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.82) 0%, rgba(29,78,216,0.72) 100%), url(${sidebarCoverBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />

            <div className="px-5 pb-6">
              {/* Overlapping Avatar Block */}
              <div className="-mt-12 flex flex-col items-center text-center">
                <div className="relative inline-block">
                  <UserAvatar
                    src={previewAvatarUrl || profileData.userAvatar}
                    alt={user?.userName || 'Người dùng'}
                    className="profile-avatar-large !mb-0 !h-24 !w-24 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Tải ảnh đại diện từ thiết bị"
                    className=" absolute bottom-0.5 right-0.5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-[#1D4ED8] text-white shadow-md transition-colors hover:bg-[#173ea8]"
                  >
                    <Camera size={15} />
                  </button>
                </div>

                <h2 className="mt-3 text-xl font-bold text-slate-950">
                  {user?.userName || 'Học viên'}
                </h2>
                <p className="mt-0.5 break-all text-sm text-slate-500">{user?.userEmail}</p>
                <span
                  className={`mt-2.5 inline-flex items-center gap-1.5 border px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                    isAdmin
                      ? 'border-blue-200 bg-blue-50 text-[#1D4ED8]'
                      : isTeacher
                      ? 'border-amber-200 bg-amber-50 text-amber-800'
                      : 'border-slate-200 bg-slate-100 text-slate-700'
                  }`}
                >
                  {roleLabel}
                </span>
              </div>

              {/* Highlighted Sidebar Streak & Record Summary (spacious 2-row layout, no cramped 3-line text) */}
              <div className="mt-5 space-y-2 border-t border-slate-200 pt-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="border border-amber-200/90 bg-amber-50/60 px-3 py-2.5 text-left">
                    <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amber-800">
                      <Flame size={13} className="fill-amber-500 text-amber-600" />
                      Streak
                    </span>
                    <strong className="mt-1 block text-lg font-bold tabular-nums text-slate-950">
                      {currentStreak} <span className="text-xs font-semibold text-amber-900">ngày</span>
                    </strong>
                  </div>

                  <div className="border border-blue-200/90 bg-blue-50/60 px-3 py-2.5 text-left">
                    <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#1D4ED8]">
                      <Trophy size={13} className="text-[#1D4ED8]" />
                      Kỷ lục
                    </span>
                    <strong className="mt-1 block text-lg font-bold tabular-nums text-[#1D4ED8]">
                      {highestStreak} <span className="text-xs font-semibold text-slate-600">ngày</span>
                    </strong>
                  </div>
                </div>

                <div className="flex items-center justify-between border border-emerald-200/80 bg-emerald-50/50 px-3.5 py-2.5">
                  <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-900">
                    <Award size={14} className="text-emerald-700" />
                    Điểm tích lũy
                  </span>
                  <strong className="text-base font-bold tabular-nums text-emerald-800">
                    {bestScore} <span className="text-xs font-normal text-slate-500">/ 990</span>
                  </strong>
                </div>
              </div>

              {/* Navigation Tabs */}
              <nav className="profile-nav-tabs mt-5 flex flex-col gap-1.5 pt-4" aria-label="Điều hướng hồ sơ">
                <button
                  type="button"
                  className={`flex w-full items-center justify-between border-l-3 px-3.5 py-2.5 text-left text-sm font-bold transition-colors ${
                    activeTab === 'profile'
                      ? 'border-l-[#1D4ED8] bg-blue-50/90 text-[#1D4ED8]'
                      : 'border-l-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                  }`}
                  onClick={() => {
                    window.history.replaceState(null, '', '?tab=profile');
                    setActiveTab('profile');
                  }}
                >
                  <span className="flex items-center gap-2.5">
                    <User size={17} /> Thông tin cá nhân
                  </span>
                </button>

                <button
                  type="button"
                  className={`flex w-full items-center justify-between border-l-3 px-3.5 py-2.5 text-left text-sm font-bold transition-colors ${
                    activeTab === 'history'
                      ? 'border-l-[#1D4ED8] bg-blue-50/90 text-[#1D4ED8]'
                      : 'border-l-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                  }`}
                  onClick={() => {
                    window.history.replaceState(null, '', '?tab=history');
                    setActiveTab('history');
                  }}
                >
                  <span className="flex items-center gap-2.5">
                    <Clock size={17} /> Lịch sử làm bài
                  </span>
                  {testHistory.length > 0 && (
                    <span className="border border-slate-200 bg-white px-2 py-0.5 text-xs font-bold tabular-nums text-slate-600">
                      {testHistory.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  className={`flex w-full items-center justify-between border-l-3 px-3.5 py-2.5 text-left text-sm font-bold transition-colors ${
                    activeTab === 'password'
                      ? 'border-l-[#1D4ED8] bg-blue-50/90 text-[#1D4ED8]'
                      : 'border-l-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                  }`}
                  onClick={() => {
                    window.history.replaceState(null, '', '?tab=password');
                    setActiveTab('password');
                  }}
                >
                  <span className="flex items-center gap-2.5">
                    <Lock size={17} /> Đổi mật khẩu
                  </span>
                </button>

                <button
                  type="button"
                  className={`flex w-full items-center justify-between border-l-3 px-3.5 py-2.5 text-left text-sm font-bold transition-colors ${
                    activeTab === 'payments'
                      ? 'border-l-[#1D4ED8] bg-blue-50/90 text-[#1D4ED8]'
                      : 'border-l-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                  }`}
                  onClick={() => {
                    window.history.replaceState(null, '', '?tab=payments');
                    setPaymentPage(1);
                    setActiveTab('payments');
                  }}
                >
                  <span className="flex items-center gap-2.5">
                    <Receipt size={17} /> Thanh toán
                  </span>
                  {paymentTotal > 0 && (
                    <span className="border border-slate-200 bg-white px-2 py-0.5 text-xs font-bold tabular-nums text-slate-600">
                      {paymentTotal}
                    </span>
                  )}
                </button>
              </nav>
            </div>
          </aside>

          {/* Right Content Area */}
          <div className="profile-content-card min-w-0 !p-6 sm:!p-8">
            {activeTab === 'profile' && (
              <div>
                <div className="profile-card-header mb-6 border-b border-slate-200 pb-5">
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#1D4ED8]">
                    Hồ sơ định danh
                  </span>
                  <h2 className="mt-1 text-2xl font-bold text-slate-950">Chỉnh sửa thông tin cá nhân</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Cập nhật họ tên, địa chỉ email, số điện thoại liên hệ và ảnh đại diện hiển thị trên hệ thống.
                  </p>
                </div>

                {profileToast && (
                  <div className="mb-6">
                    <Toast
                      type={profileToast.type}
                      message={profileToast.message}
                      onClose={() => setProfileToast(null)}
                    />
                  </div>
                )}

                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  {/* Avatar Selection Section */}
                  <div className="border border-slate-200 bg-slate-50/70 p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <UserAvatar
                          src={previewAvatarUrl || profileData.userAvatar}
                          alt={user?.userName || 'Người dùng'}
                          className="h-16 w-16 shrink-0 rounded-full border-2 border-white object-cover shadow-sm"
                        />
                        <div>
                          <label className="block text-base font-bold text-slate-900">
                            Ảnh đại diện tài khoản
                          </label>
                          <p className="mt-0.5 text-xs text-slate-600">
                            {selectedAvatarFile
                              ? `Đã chọn tệp: ${selectedAvatarFile.name}`
                              : 'Hỗ trợ định dạng PNG, JPG hoặc JPEG (dung lượng tối đa 5 MB).'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5">
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
                          className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 border border-[#1D4ED8] bg-[#1D4ED8] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#173ea8] disabled:opacity-50"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={profileLoading}
                        >
                          <Upload size={15} />
                          {selectedAvatarFile ? 'Chọn ảnh khác' : 'Chọn ảnh từ thiết bị'}
                        </button>
                        {selectedAvatarFile && (
                          <button
                            type="button"
                            className="inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 border border-red-300 bg-white px-3.5 py-2 text-xs font-bold text-red-700 transition-colors hover:bg-red-50"
                            onClick={handleCancelSelectedFile}
                          >
                            Hủy ảnh vừa chọn
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-3.5 flex items-start gap-2 border-t border-slate-200/80 pt-3 text-xs text-emerald-800">
                      <Check size={15} className="mt-0.5 shrink-0 text-emerald-600" />
                      <span>
                        Ảnh được xem trước tức thì. Khi bạn nhấn <strong>&ldquo;Lưu thay đổi&rdquo;</strong> bên dưới, hệ thống sẽ tải ảnh lên Cloudinary và cập nhật hồ sơ.
                      </span>
                    </div>
                  </div>

                  {/* Form Fields Grid */}
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="form-group !mb-0 sm:col-span-2">
                      <label className="form-label mb-1.5 block" htmlFor="userEmail">
                        Địa chỉ Email <span className="text-red-600">*</span>
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

                    <div className="form-group !mb-0">
                      <label className="form-label mb-1.5 block" htmlFor="userName">
                        Họ và tên <span className="text-red-600">*</span>
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

                    <div className="form-group !mb-0">
                      <label className="form-label mb-1.5 block" htmlFor="userNumberphone">
                        Số điện thoại <span className="text-red-600">*</span>
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
                  </div>

                  <div className="flex items-center justify-end border-t border-slate-200 pt-5">
                    <button
                      type="submit"
                      className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 border border-[#1D4ED8] bg-[#1D4ED8] px-6 py-2.5 text-sm font-bold text-white shadow-xs transition-colors hover:bg-[#173ea8] disabled:opacity-50"
                      disabled={profileLoading}
                    >
                      {profileLoading ? (
                        <>
                          <LoaderCircle size={17} className="animate-spin" /> Đang lưu...
                        </>
                      ) : (
                        <>
                          <Save size={17} /> Lưu thay đổi
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'password' && (
              <div>
                <div className="profile-card-header mb-6 border-b border-slate-200 pb-5">
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#1D4ED8]">
                    Bảo mật tài khoản
                  </span>
                  <h2 className="mt-1 text-2xl font-bold text-slate-950">Thay đổi mật khẩu</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Sử dụng mật khẩu tối thiểu 6 ký tự để bảo vệ an toàn cho tài khoản và lịch sử học tập của bạn.
                  </p>
                </div>

                {passwordToast && (
                  <div className="mb-6">
                    <Toast
                      type={passwordToast.type}
                      message={passwordToast.message}
                      onClose={() => setPasswordToast(null)}
                    />
                  </div>
                )}

                {canSetLocalPassword === null ? (
                  passwordCapabilityError ? (
                    <div role="alert" className="flex flex-wrap items-center justify-between gap-3 border border-red-300 bg-red-50 p-4 font-semibold text-red-800">
                      <span>Không tải được trạng thái bảo mật tài khoản.</span>
                      <button
                        type="button"
                        className="border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-800 hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
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
                    <div role="status" className="border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-600">
                      Đang tải trạng thái bảo mật tài khoản…
                    </div>
                  )
                ) : canSetLocalPassword ? (
                  <div className="max-w-xl border border-slate-200 bg-slate-50/70 p-6">
                    <p className="mb-5 text-sm leading-relaxed text-slate-700">
                      Tài khoản này đăng nhập bằng Google và chưa có mật khẩu cục bộ. Nhập mật khẩu mới, sau đó xác minh lại Google để thiết lập.
                    </p>
                    <div className="space-y-4">
                      <div className="form-group !mb-0">
                        <label className="form-label mb-1.5 block" htmlFor="newUserPassword">Mật khẩu mới</label>
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
                      <div className="form-group !mb-0">
                        <label className="form-label mb-1.5 block" htmlFor="confirmNewPassword">Xác nhận mật khẩu mới</label>
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
                    </div>
                    <div className="mt-5 flex flex-col items-start gap-2 border-t border-slate-200 pt-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Xác minh tài khoản Google</span>
                      {passwordLoading ? (
                        <span className="flex items-center gap-2 border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
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
                  <form onSubmit={handlePasswordSubmit} className="max-w-xl space-y-5">
                    <div className="form-group !mb-0">
                      <label className="form-label mb-1.5 block" htmlFor="oldUserPassword">
                        Mật khẩu hiện tại <span className="text-red-600">*</span>
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

                    <div className="form-group !mb-0">
                      <label className="form-label mb-1.5 block" htmlFor="newUserPassword">
                        Mật khẩu mới <span className="text-red-600">*</span>
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

                    <div className="form-group !mb-0">
                      <label className="form-label mb-1.5 block" htmlFor="confirmNewPassword">
                        Xác nhận mật khẩu mới <span className="text-red-600">*</span>
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

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 border border-[#1D4ED8] bg-[#1D4ED8] px-6 py-2.5 text-sm font-bold text-white shadow-xs transition-colors hover:bg-[#173ea8] disabled:opacity-50"
                        disabled={passwordLoading}
                      >
                        {passwordLoading ? (
                          <>
                            <LoaderCircle size={17} className="animate-spin" /> Đang cập nhật...
                          </>
                        ) : (
                          <>
                            <Shield size={17} /> Cập nhật mật khẩu
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <section className="text-slate-900">
                <div className="profile-card-header mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-5">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#1D4ED8]">
                      Nhật ký luyện tập
                    </span>
                    <h2 className="mt-1 text-2xl font-bold text-slate-950">Lịch sử làm bài thi</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Toàn bộ kết quả bài thi thử TOEIC và các lượt luyện tập bạn đã hoàn thành ({testHistory.length} lượt làm bài).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHistoryRefresh((c) => c + 1)}
                    disabled={historyLoading}
                    className="inline-flex cursor-pointer items-center gap-2 border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 transition-colors hover:border-[#1D4ED8] hover:text-[#1D4ED8] disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={historyLoading ? 'animate-spin' : ''} /> Làm mới
                  </button>
                </div>

                {/* Filter Chips */}
                {testHistory.length > 0 && (
                  <div className="mb-5 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setHistoryFilter('ALL')}
                      className={`cursor-pointer border px-4 py-1.5 text-xs font-bold tabular-nums transition-colors ${
                        historyFilter === 'ALL'
                          ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-[#1D4ED8] hover:text-[#1D4ED8]'
                      }`}
                    >
                      Tất cả ({testHistory.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setHistoryFilter('FULL')}
                      className={`cursor-pointer border px-4 py-1.5 text-xs font-bold tabular-nums transition-colors ${
                        historyFilter === 'FULL'
                          ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-[#1D4ED8] hover:text-[#1D4ED8]'
                      }`}
                    >
                      Full Test ({testHistory.filter((item) => (item.partName || '').toLowerCase().includes('full')).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setHistoryFilter('PART')}
                      className={`cursor-pointer border px-4 py-1.5 text-xs font-bold tabular-nums transition-colors ${
                        historyFilter === 'PART'
                          ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-[#1D4ED8] hover:text-[#1D4ED8]'
                      }`}
                    >
                      Luyện tập Part ({testHistory.filter((item) => !(item.partName || '').toLowerCase().includes('full')).length})
                    </button>
                  </div>
                )}

                {historyError && (
                  <div role="alert" className="mb-4 border border-red-300 bg-red-50 p-3.5 text-sm font-medium text-red-800">
                    {historyError}
                  </div>
                )}

                {historyLoading ? (
                  <div role="status" className="flex items-center justify-center gap-2 border border-slate-200 bg-slate-50 p-8 text-sm font-semibold text-slate-600">
                    <LoaderCircle size={18} className="animate-spin text-[#1D4ED8]" /> Đang nạp lịch sử làm bài...
                  </div>
                ) : testHistory.length === 0 ? (
                  <div className="border border-slate-200 bg-slate-50/50 p-12 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center border border-slate-200 bg-white text-slate-400">
                      <Clock size={26} />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-slate-900">Chưa có lịch sử làm bài</h3>
                    <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                      Bạn chưa hoàn thành bài thi thử hay bài luyện tập nào. Hãy thử sức ngay với kho đề thi TOEIC chuẩn ETS!
                    </p>
                    <div className="mt-6">
                      <Link
                        to="/courses"
                        className="inline-flex items-center gap-2 border border-[#1D4ED8] bg-[#1D4ED8] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#173ea8]"
                      >
                        Khám phá đề thi ngay
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {testHistory
                      .filter((item) => {
                        if (historyFilter === 'FULL') return (item.partName || '').toLowerCase().includes('full');
                        if (historyFilter === 'PART') return !(item.partName || '').toLowerCase().includes('full');
                        return true;
                      })
                      .map((attempt) => {
                        const accuracy =
                          attempt.totalCount > 0
                            ? Math.round((attempt.correctCount / attempt.totalCount) * 100)
                            : 0;
                        const dateFormatted = attempt.createdAt
                          ? new Date(attempt.createdAt).toLocaleString('vi-VN', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })
                          : '—';

                        return (
                          <article
                            key={attempt.id}
                            className="flex flex-col justify-between gap-4 border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-sm sm:flex-row sm:items-center"
                          >
                            <div className="min-w-0 flex-1 space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-[#1D4ED8]">
                                  {attempt.partName || attempt.typePractice || 'Bài thi'}
                                </span>
                                {attempt.sourceResultId && (
                                  <span className="border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-xs font-bold text-purple-700">
                                    Luyện lại câu sai
                                  </span>
                                )}
                                <span className="inline-flex items-center gap-1 text-xs font-medium tabular-nums text-slate-500">
                                  <Calendar size={12} /> {dateFormatted}
                                </span>
                              </div>

                              <h3 className="truncate text-lg font-bold text-slate-950">
                                {attempt.testTitleId || 'Đề thi TOEIC'}
                              </h3>

                              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                                <span>
                                  Thời gian:{' '}
                                  <strong className="font-bold tabular-nums text-slate-900">
                                    {attempt.timeSpentFormatted || `${Math.floor((attempt.totalTime || 0) / 60)} phút`}
                                  </strong>
                                </span>
                                <span>
                                  Đúng:{' '}
                                  <strong className="font-bold tabular-nums text-slate-900">
                                    {attempt.correctCount} / {attempt.totalCount}
                                  </strong>{' '}
                                  <span className="font-semibold tabular-nums text-slate-500">({accuracy}%)</span>
                                </span>
                                {attempt.scoreType === 'ESTIMATED_SCALED' && (
                                  <span>
                                    LC: <strong className="font-bold tabular-nums text-slate-900">{attempt.listeningScore}</strong> · RC:{' '}
                                    <strong className="font-bold tabular-nums text-slate-900">{attempt.readingScore}</strong>
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-4 border-t border-slate-100 pt-3 sm:border-t-0 sm:pt-0">
                              <div className="border-r border-slate-200 pr-4 text-right">
                                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                  {attempt.scoreType === 'ESTIMATED_SCALED' ? 'Điểm ước tính' : 'Kết quả'}
                                </span>
                                <span className="mt-0.5 block text-xl font-bold tabular-nums text-[#1D4ED8]">
                                  {attempt.scoreType === 'ESTIMATED_SCALED'
                                    ? `${attempt.totalScore} / 990`
                                    : `${attempt.correctCount} câu`}
                                </span>
                              </div>

                              <Link
                                to={`/results/${attempt.id}`}
                                className="inline-flex min-h-[38px] items-center gap-1.5 border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 transition-colors hover:border-[#1D4ED8] hover:bg-blue-50/40 hover:text-[#1D4ED8]"
                              >
                                Xem lại bài <ExternalLink size={13} />
                              </Link>
                            </div>
                          </article>
                        );
                      })}
                  </div>
                )}
              </section>
            )}

            {activeTab === 'payments' && (
              <section className="text-slate-900">
                <div className="profile-card-header mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-5">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#1D4ED8]">
                      Lịch sử giao dịch
                    </span>
                    <h2 className="mt-1 text-2xl font-bold text-slate-950">Lịch sử thanh toán</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Các giao dịch VNPAY gắn với tài khoản này · <strong className="tabular-nums">{paymentTotal}</strong> giao dịch
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPaymentRefresh((current) => current + 1)}
                    disabled={paymentLoading}
                    className="inline-flex cursor-pointer items-center gap-2 border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 transition-colors hover:border-[#1D4ED8] hover:text-[#1D4ED8] disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={paymentLoading ? 'animate-spin' : ''} /> Tải lại
                  </button>
                </div>
                {paymentError && (
                  <div role="alert" className="mb-4 border border-red-300 bg-red-50 p-3.5 text-sm font-medium text-red-800">
                    {paymentError}
                  </div>
                )}
                {paymentLoading ? (
                  <div className="flex items-center justify-center gap-2 border border-slate-200 bg-slate-50 p-8 text-sm font-semibold text-slate-600">
                    <LoaderCircle size={18} className="animate-spin text-[#1D4ED8]" /> Đang tải giao dịch…
                  </div>
                ) : paymentRows.length === 0 ? (
                  <div className="border border-slate-200 bg-slate-50/60 p-10 text-center text-sm font-medium text-slate-600">
                    Bạn chưa có giao dịch thanh toán nào.
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 bg-white">
                    <table className="w-full min-w-[650px] border-collapse text-left text-sm">
                      <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-600">
                        <tr>
                          <th className="p-3.5">Sản phẩm</th>
                          <th className="p-3.5">Số tiền</th>
                          <th className="p-3.5">Trạng thái</th>
                          <th className="p-3.5">Thời gian</th>
                          <th className="p-3.5">Mã giao dịch</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {paymentRows.map((payment) => {
                          const statusLabels = { PENDING: 'Đang xử lý', SUCCESS: 'Thành công', FAILED: 'Thất bại', CANCELLED: 'Đã hủy', EXPIRED: 'Hết hạn' };
                          const statusColors = {
                            PENDING: 'border-amber-200 bg-amber-50 text-amber-800',
                            SUCCESS: 'border-emerald-200 bg-emerald-50 text-emerald-800',
                            FAILED: 'border-red-200 bg-red-50 text-red-800',
                            CANCELLED: 'border-slate-300 bg-slate-100 text-slate-700',
                            EXPIRED: 'border-slate-300 bg-slate-100 text-slate-700',
                          };
                          const product = payment.productName || (payment.productType === 'TEACHER_APPLICATION' ? 'Đăng ký giáo viên' : payment.productType === 'TEST_VIP' ? 'Đề VIP' : 'Sản phẩm');
                          const timestamp = payment.paidAt || payment.createdAt;
                          const displayTime = timestamp ? new Date(`${timestamp}+07:00`).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : '—';
                          return (
                            <tr key={payment.transactionReference} className="align-top hover:bg-slate-50/80">
                              <td className="p-3.5 font-bold text-slate-900">
                                {product}
                                {payment.productType === 'TEST_VIP' && (
                                  <span className="mt-0.5 block text-xs font-normal text-slate-500">Quyền truy cập vĩnh viễn</span>
                                )}
                              </td>
                              <td className="p-3.5 font-bold tabular-nums text-slate-900">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(payment.amount || 0))}
                              </td>
                              <td className="p-3.5">
                                <span className={`inline-block border px-2.5 py-0.5 text-xs font-bold ${statusColors[payment.status] || 'border-slate-300 bg-white text-slate-700'}`}>
                                  {statusLabels[payment.status] || 'Chưa rõ'}
                                </span>
                              </td>
                              <td className="p-3.5 text-xs font-medium tabular-nums text-slate-600">{displayTime}</td>
                              <td className="max-w-44 break-all p-3.5 font-mono text-xs text-slate-700">{payment.transactionReference}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
                {!paymentLoading && paymentPages > 1 && (
                  <nav className="mt-4 flex items-center justify-between gap-3 border border-slate-200 bg-white p-3" aria-label="Phân trang lịch sử thanh toán">
                    <button
                      type="button"
                      disabled={paymentPage <= 1}
                      onClick={() => setPaymentPage((current) => current - 1)}
                      className="cursor-pointer border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 transition-colors hover:border-[#1D4ED8] hover:text-[#1D4ED8] disabled:opacity-40"
                    >
                      Trang trước
                    </button>
                    <span className="text-sm font-bold tabular-nums text-slate-700" aria-live="polite">
                      Trang {paymentPage} / {paymentPages}
                    </span>
                    <button
                      type="button"
                      disabled={paymentPage >= paymentPages}
                      onClick={() => setPaymentPage((current) => current + 1)}
                      className="cursor-pointer border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 transition-colors hover:border-[#1D4ED8] hover:text-[#1D4ED8] disabled:opacity-40"
                    >
                      Trang sau
                    </button>
                  </nav>
                )}
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
