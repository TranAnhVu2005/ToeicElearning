
import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import myCustomIcon from '../../assets/img/logo1.png';
import UserAvatar from '../common/UserAvatar';
import {
  Activity,
  GraduationCap,
  BookOpen,
  User,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  ChevronDown,
  Bell,
} from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { userService } from '../../services/userService';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isTeacher, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminActive = location.pathname.startsWith('/admin');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // Close menus after navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  // Load unread notifications
  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadNotifications(0);
      return;
    }

    let active = true;

    notificationService.getUnreadCount()
      .then((response) => {
        if (active && response.code === 1000) {
          setUnreadNotifications(
            response.data?.unreadCount || 0
          );
        }
      })
      .catch(() => { });

    return () => {
      active = false;
    };
  }, [isAuthenticated, location.pathname]);

  // User heartbeat
  useEffect(() => {
    if (!isAuthenticated) return undefined;

    const sendHeartbeat = () => {
      if (document.visibilityState === 'visible') {
        userService.heartbeat().catch(() => { });
      }
    };

    sendHeartbeat();

    const intervalId = window.setInterval(
      sendHeartbeat,
      60_000
    );

    document.addEventListener(
      'visibilitychange',
      sendHeartbeat
    );

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener(
        'visibilitychange',
        sendHeartbeat
      );
    };
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  // Retro navigation styles
  const navLinkClass = ({ isActive }) =>
    `relative inline-flex min-h-[42px] items-center justify-center
     whitespace-nowrap px-3 text-[14px] font-semibold
     transition-colors duration-150
     focus-visible:outline-none focus-visible:ring-2
     focus-visible:ring-[#4D35C9] focus-visible:ring-offset-2
     ${isActive
      ? 'text-[#4D35C9] after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:bg-[#4D35C9]'
      : 'text-[#625B6D] hover:text-[#4D35C9]'
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `flex min-h-[44px] items-center gap-3 border-b
     border-[#E5E0ED] px-3 py-3 text-[15px] font-medium
     transition-colors duration-150
     ${isActive
      ? 'bg-[#EEE9FF] text-[#4D35C9]'
      : 'text-[#17131F] hover:bg-[#F7F4FF]'
    }`;

  const dropdownItemClass =
    'flex w-full items-center gap-3 rounded-md px-3 py-2.5 ' +
    'text-left text-[14px] text-[#17131F] transition-colors ' +
    'hover:bg-[#EEE9FF] hover:text-[#4D35C9] ' +
    'focus-visible:outline-none focus-visible:ring-2 ' +
    'focus-visible:ring-inset focus-visible:ring-[#4D35C9]';

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FFFCF8]">
      {/* Main navbar */}
      <nav
        aria-label="Điều hướng chính"
        className="border-b border-[#2A2433]/15 bg-[#FFFCF8]"
      >
        <div className="mx-auto flex min-h-[88px] w-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

          {/* Brand */}
          <Link
            to="/"
            className="group flex shrink-0 items-center gap-3 rounded-sm no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D35C9] focus-visible:ring-offset-4"
          >
            {/* Logo image */}
            <div className="brand-logo-mark relative flex w-[88px] shrink-0 items-center justify-center overflow-hidden bg-white p-0.5 transition-colors duration-150">
              <img
                src={myCustomIcon}
                alt=""
                className="h-full w-full object-contain"
              />
            </div>

            {/* Brand name */}
            <div className="flex flex-col justify-center">
              <span
                className="whitespace-nowrap text-[23px] font-bold leading-tight tracking-[-0.7px] text-[#17131F]"
              >
                <span className="font-normal">
                  TOEIC
                </span>
                <span className="ml-1 text-[#4D35C9]">
                  ELearning
                </span>
              </span>
            </div>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden flex-1 items-center justify-center gap-1 xl:flex">

            <NavLink
              to="/"
              end
              className={navLinkClass}
            >
              Trang chủ
            </NavLink>

            <NavLink
              to="/courses"
              className={navLinkClass}
            >
              Đề thi
            </NavLink>

            <NavLink
              to="/practice"
              className={navLinkClass}
            >
              Luyện thi
            </NavLink>

            {isAuthenticated && !isAdmin && (
              <NavLink
                to="/classrooms"
                className={navLinkClass}
              >
                Lớp học
              </NavLink>
            )}

            {isAuthenticated && !isAdmin && !isTeacher && (
              <NavLink
                to="/teacher/application"
                className={navLinkClass}
              >
                Đăng ký giáo viên
              </NavLink>
            )}

            {isAuthenticated && (
              <NavLink
                to="/notifications"
                className={navLinkClass}
              >
                <span className="relative flex items-center gap-1.5">
                  Thông báo

                  {unreadNotifications > 0 && (
                    <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#4D35C9] px-1 text-[11px] font-bold text-white">
                      {unreadNotifications > 99
                        ? '99+'
                        : unreadNotifications}
                    </span>
                  )}
                </span>
              </NavLink>
            )}

            <NavLink
              to="/about"
              className={navLinkClass}
            >
              Giới thiệu
            </NavLink>

            <NavLink
              to="/contact"
              className={navLinkClass}
            >
              Liên hệ
            </NavLink>

            {isAdmin && (
              <NavLink
                to="/admin/dashboard"
                className={() =>
                  `relative inline-flex min-h-[42px] items-center gap-1.5 whitespace-nowrap px-3 text-[14px] font-semibold transition-colors
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D35C9]
                  ${isAdminActive
                    ? 'text-[#4D35C9] after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:bg-[#4D35C9]'
                    : 'text-[#625B6D] hover:text-[#4D35C9]'
                  }`
                }
              >
                Quản trị
              </NavLink>
            )}
          </div>

          {/* Right actions */}
          <div className="flex shrink-0 items-center gap-2">

            {/* Authenticated user */}
            {isAuthenticated && user ? (
              <div
                className="relative"
                ref={dropdownRef}
              >
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                  aria-label="Menu tài khoản"
                  className="flex min-h-[44px] items-center gap-2 border border-[#2A2433]/20 bg-white px-2.5 py-1.5 text-[#17131F] transition-colors hover:border-[#4D35C9] hover:bg-[#EEE9FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D35C9] focus-visible:ring-offset-2 sm:gap-2.5 sm:px-3"
                >
                  <UserAvatar
                    src={user.userAvatar}
                    className="h-8 w-8 rounded-full border border-[#E5E0ED] object-cover"
                  />

                  <span className="hidden max-w-[120px] truncate text-[14px] font-semibold sm:block">
                    {user.userName || user.userEmail}
                  </span>

                  <ChevronDown
                    size={15}
                    className={`transition-transform duration-150 ${dropdownOpen ? 'rotate-180' : ''
                      }`}
                  />
                </button>

                {/* Account dropdown */}
                {dropdownOpen && (
                  <div
                    className="absolute right-0 top-[calc(100%+8px)] z-50 w-[280px] border border-[#2A2433]/25 bg-[#FFFCF8] shadow-[0_4px_12px_rgba(23,19,31,0.08)]"
                    role="menu"
                  >
                    {/* Account information */}
                    <div className="border-b border-[#E5E0ED] bg-[#EEE9FF]/50 p-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          src={user.userAvatar}
                          className="h-10 w-10 rounded-full border border-[#E5E0ED] object-cover"
                        />

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[14px] font-bold text-[#17131F]">
                            {user.userName || 'Học viên'}
                          </p>

                          <p className="mt-0.5 truncate text-[12px] text-[#625B6D]">
                            {user.userEmail}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`mt-3 inline-flex items-center border px-2 py-1 text-[12px] font-semibold ${isAdmin
                          ? 'border-[#4D35C9]/25 bg-[#EEE9FF] text-[#2D1B8F]'
                          : isTeacher
                            ? 'border-[#FFCDB2] bg-[#FFF0E7] text-[#92400E]'
                            : 'border-[#E5E0ED] bg-white text-[#625B6D]'
                          }`}
                      >
                        {isAdmin
                          ? 'Quản trị viên'
                          : isTeacher
                            ? 'Giảng viên'
                            : 'Học viên'}
                      </span>
                    </div>

                    {/* Account links */}
                    <div className="space-y-0.5 p-2">
                      <Link
                        to="/profile"
                        role="menuitem"
                        className={dropdownItemClass}
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User size={16} />
                        Hồ sơ cá nhân
                      </Link>

                      <Link
                        to="/notifications"
                        role="menuitem"
                        className={dropdownItemClass}
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Bell size={16} />
                        <span className="flex-1">Thông báo</span>

                        {unreadNotifications > 0 && (
                          <span className="font-mono text-[12px] font-semibold text-[#4D35C9]">
                            {unreadNotifications}
                          </span>
                        )}
                      </Link>

                      {!isAdmin && !isTeacher && (
                        <Link
                          to="/teacher/application"
                          role="menuitem"
                          className={dropdownItemClass}
                          onClick={() => setDropdownOpen(false)}
                        >
                          <GraduationCap size={16} />
                          Hồ sơ giáo viên
                        </Link>
                      )}

                      {isAdmin && (
                        <>
                          <div className="my-2 border-t border-[#E5E0ED]" />

                          <Link
                            to="/admin/teacher-applications"
                            role="menuitem"
                            className={dropdownItemClass}
                            onClick={() => setDropdownOpen(false)}
                          >
                            <GraduationCap size={16} />
                            Duyệt hồ sơ giáo viên
                          </Link>

                          <Link
                            to="/admin/dashboard"
                            role="menuitem"
                            className={dropdownItemClass}
                            onClick={() => setDropdownOpen(false)}
                          >
                            <Activity size={16} />
                            Tổng quan hệ thống
                          </Link>

                          <Link
                            to="/admin/tests"
                            role="menuitem"
                            className={dropdownItemClass}
                            onClick={() => setDropdownOpen(false)}
                          >
                            <BookOpen size={16} />
                            Quản lý đề thi
                          </Link>

                          <Link
                            to="/admin/users"
                            role="menuitem"
                            className={dropdownItemClass}
                            onClick={() => setDropdownOpen(false)}
                          >
                            <ShieldCheck size={16} />
                            Quản lý người dùng
                          </Link>

                          <Link
                            to="/admin/payments"
                            role="menuitem"
                            className={dropdownItemClass}
                            onClick={() => setDropdownOpen(false)}
                          >
                            <ShieldCheck size={16} />
                            Lịch sử thanh toán
                          </Link>
                        </>
                      )}

                      <div className="my-2 border-t border-[#E5E0ED]" />

                      <button
                        type="button"
                        role="menuitem"
                        className="flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left text-[14px] font-medium text-[#B42318] transition-colors hover:bg-[#FFF0E7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#B42318]"
                        onClick={handleLogout}
                      >
                        <LogOut size={16} />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Guest actions */
              <div className="hidden items-center gap-2 sm:flex">
                <Link
                  to="/login"
                  className="inline-flex min-h-[42px] items-center justify-center border border-[#2A2433]/40 bg-transparent px-3.5 text-[14px] font-semibold text-[#17131F] transition-colors hover:border-[#4D35C9] hover:bg-[#EEE9FF] hover:text-[#4D35C9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D35C9]"
                >
                  Đăng nhập
                </Link>

                <Link
                  to="/register"
                  className="inline-flex min-h-[42px] items-center justify-center border border-[#4D35C9] bg-[#4D35C9] px-3.5 text-[14px] font-semibold text-white transition-colors hover:border-[#2D1B8F] hover:bg-[#2D1B8F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D35C9] focus-visible:ring-offset-2"
                >
                  Đăng ký ngay
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={
                mobileMenuOpen
                  ? 'Đóng menu điều hướng'
                  : 'Mở menu điều hướng'
              }
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              className="inline-flex h-11 w-11 items-center justify-center border border-[#2A2433]/25 bg-white text-[#17131F] transition-colors hover:border-[#4D35C9] hover:bg-[#EEE9FF] hover:text-[#4D35C9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D35C9] xl:hidden"
            >
              {mobileMenuOpen ? (
                <X size={20} />
              ) : (
                <Menu size={20} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile navigation panel */}
        <div
          id="mobile-navigation"
          aria-label="Điều hướng trên thiết bị nhỏ"
          hidden={!mobileMenuOpen}
          className="border-t border-[#2A2433]/15 bg-[#FFFCF8] xl:hidden"
        >
          <div className="mx-auto max-w-[1200px] px-4 py-3 sm:px-6 lg:px-8">

            <div className="border border-[#2A2433]/15 bg-white">

              <NavLink
                to="/"
                end
                className={mobileLinkClass}
                onClick={closeMobileMenu}
              >
                Trang chủ
              </NavLink>

              <NavLink
                to="/courses"
                className={mobileLinkClass}
                onClick={closeMobileMenu}
              >
                <BookOpen size={17} />
                Khóa học &amp; Đề thi
              </NavLink>

              <NavLink
                to="/practice"
                className={mobileLinkClass}
                onClick={closeMobileMenu}
              >
                <Activity size={17} />
                Luyện thi
              </NavLink>

              {isAuthenticated && !isAdmin && (
                <NavLink
                  to="/classrooms"
                  className={mobileLinkClass}
                  onClick={closeMobileMenu}
                >
                  <GraduationCap size={17} />
                  Lớp học
                </NavLink>
              )}

              {isAuthenticated && !isAdmin && !isTeacher && (
                <NavLink
                  to="/teacher/application"
                  className={mobileLinkClass}
                  onClick={closeMobileMenu}
                >
                  <GraduationCap size={17} />
                  Hồ sơ giáo viên
                </NavLink>
              )}

              {isAuthenticated && (
                <NavLink
                  to="/notifications"
                  className={mobileLinkClass}
                  onClick={closeMobileMenu}
                >
                  <Bell size={17} />
                  <span className="flex-1">Thông báo</span>

                  {unreadNotifications > 0 && (
                    <span className="font-mono text-[12px] font-semibold text-[#4D35C9]">
                      {unreadNotifications}
                    </span>
                  )}
                </NavLink>
              )}

              <NavLink
                to="/about"
                className={mobileLinkClass}
                onClick={closeMobileMenu}
              >
                Giới thiệu
              </NavLink>

              <NavLink
                to="/contact"
                className={mobileLinkClass}
                onClick={closeMobileMenu}
              >
                Liên hệ
              </NavLink>

              {isAdmin && (
                <>
                  <NavLink
                    to="/admin/dashboard"
                    className={mobileLinkClass}
                    onClick={closeMobileMenu}
                  >
                    <Activity size={17} />
                    Tổng quan quản trị
                  </NavLink>

                  <NavLink
                    to="/admin/teacher-applications"
                    className={mobileLinkClass}
                    onClick={closeMobileMenu}
                  >
                    <GraduationCap size={17} />
                    Duyệt hồ sơ giáo viên
                  </NavLink>

                  <NavLink
                    to="/admin/tests"
                    className={mobileLinkClass}
                    onClick={closeMobileMenu}
                  >
                    <BookOpen size={17} />
                    Quản lý đề thi
                  </NavLink>

                  <NavLink
                    to="/admin/users"
                    className={mobileLinkClass}
                    onClick={closeMobileMenu}
                  >
                    <ShieldCheck size={17} />
                    Quản lý người dùng
                  </NavLink>

                  <NavLink
                    to="/admin/payments"
                    className={mobileLinkClass}
                    onClick={closeMobileMenu}
                  >
                    <ShieldCheck size={17} />
                    Lịch sử thanh toán
                  </NavLink>
                </>
              )}
            </div>

            {/* Mobile account actions */}
            <div className="mt-3 border border-[#2A2433]/15 bg-white p-3">
              {isAuthenticated ? (
                <>
                  <div className="mb-3 flex items-center gap-3 border-b border-[#E5E0ED] pb-3">
                    <UserAvatar
                      src={user?.userAvatar}
                      className="h-10 w-10 rounded-full border border-[#E5E0ED] object-cover"
                    />

                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-bold text-[#17131F]">
                        {user?.userName || 'Học viên'}
                      </p>
                      <p className="truncate text-[12px] text-[#625B6D]">
                        {user?.userEmail}
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    className="flex min-h-[44px] items-center gap-3 px-2 text-[14px] font-medium text-[#17131F] hover:bg-[#EEE9FF] hover:text-[#4D35C9]"
                    onClick={closeMobileMenu}
                  >
                    <User size={17} />
                    Hồ sơ cá nhân
                  </Link>

                  <button
                    type="button"
                    className="mt-2 flex min-h-[44px] w-full items-center gap-3 border border-[#B42318]/30 bg-white px-3 text-[14px] font-semibold text-[#B42318] transition-colors hover:bg-[#FFF0E7]"
                    onClick={handleLogout}
                  >
                    <LogOut size={17} />
                    Đăng xuất
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    className="flex min-h-[44px] items-center justify-center border border-[#2A2433]/40 text-[14px] font-semibold text-[#17131F] transition-colors hover:bg-[#EEE9FF] hover:text-[#4D35C9]"
                    onClick={closeMobileMenu}
                  >
                    Đăng nhập
                  </Link>

                  <Link
                    to="/register"
                    className="flex min-h-[44px] items-center justify-center border border-[#4D35C9] bg-[#4D35C9] text-[14px] font-semibold text-white transition-colors hover:bg-[#2D1B8F]"
                    onClick={closeMobileMenu}
                  >
                    Đăng ký ngay
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
