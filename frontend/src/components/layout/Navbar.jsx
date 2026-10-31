import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) { setUnreadNotifications(0); return; }
    let active = true;
    notificationService.getUnreadCount().then((response) => {
      if (active && response.code === 1000) setUnreadNotifications(response.data?.unreadCount || 0);
    }).catch(() => {});
    return () => { active = false; };
  }, [isAuthenticated, location.pathname]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    const sendHeartbeat = () => {
      if (document.visibilityState === 'visible') userService.heartbeat().catch(() => {});
    };
    sendHeartbeat();
    const intervalId = window.setInterval(sendHeartbeat, 60_000);
    document.addEventListener('visibilitychange', sendHeartbeat);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', sendHeartbeat);
    };
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="site-header">
      {/* Top Bar */}
      <div className="topbar">
        <div className="container topbar-container">
          <div className="topbar-left">
            <span>TOEIC LISTENING &amp; READING</span>
          </div>
          <div className="topbar-right">
            <span>Luyện theo Part hoặc làm full test</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="main-navbar">
        <div className="container navbar-container">
          {/* Brand Logo */}
          <Link to="/" className="brand-logo group">
            <div className="logo-icon-wrapper group-hover:scale-105 transition-transform duration-300">
              <BookOpen size={22} color="#ffffff" strokeWidth={1.5} />
            </div>
            <div className="logo-text">
              <span className="logo-title">Toeic<span>Elearning</span></span>
              <span className="logo-subtitle">Trường Đại Học Cần Thơ</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="nav-links">
            <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Trang chủ
            </NavLink>
            <NavLink to="/courses" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Khóa học & Đề thi
            </NavLink>
            <NavLink to="/practice" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Luyện thi
            </NavLink>
            {isAuthenticated && !isAdmin && (
              <NavLink to="/classrooms" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Lớp học
              </NavLink>
            )}
            {isAuthenticated && !isAdmin && !isTeacher && (
              <NavLink to="/teacher/application" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Đăng ký giáo viên
              </NavLink>
            )}
            {isAuthenticated && <NavLink to="/notifications" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Thông báo{unreadNotifications > 0 ? ` (${unreadNotifications})` : ''}
            </NavLink>}
            <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Giới thiệu
            </NavLink>
            <NavLink to="/contact" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Liên hệ
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin/dashboard" className={() => `nav-link ${isAdminActive ? 'active' : ''}`}>
                Quản trị
              </NavLink>
            )}
          </div>

          {/* Right Section: Auth buttons / User Profile Dropdown */}
          <div className="nav-actions">
            {isAuthenticated && user ? (
              <div className="user-menu-wrapper" ref={dropdownRef}>
                <button
                  className="user-profile-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-expanded={dropdownOpen}
                >
                  <img
                    src={user.userAvatar || '/images/default-avatar.svg'}
                    alt={user.userName || 'User'}
                    className="user-avatar-small"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/default-avatar.svg';
                    }}
                  />
                  <span className="user-name-display">{user.userName || user.userEmail}</span>
                  <ChevronDown size={14} strokeWidth={1.5} style={{ transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'none' }} />
                </button>

                {dropdownOpen && (
                  <div className="user-dropdown-menu">
                    <div className="dropdown-user-info">
                      <p className="dropdown-user-name">{user.userName || 'Học viên'}</p>
                      <p className="dropdown-user-email">{user.userEmail}</p>
                      <span className={`badge ${isAdmin ? 'badge-primary' : isTeacher ? 'badge-secondary' : 'badge-neutral'}`} style={{ marginTop: 4 }}>
                        {isAdmin ? 'Quản trị viên' : isTeacher ? 'Giảng viên' : 'Học viên'}
                      </span>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid var(--gray-100)', margin: '6px 0' }} />

                    <Link
                      to="/profile"
                      className="dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User size={15} strokeWidth={1.5} /> Hồ sơ cá nhân
                    </Link>

                    <Link to="/notifications" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <Bell size={15} strokeWidth={1.5} /> Thông báo{unreadNotifications > 0 ? ` (${unreadNotifications})` : ''}
                    </Link>

                    {!isAdmin && !isTeacher && <Link to="/teacher/application" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <GraduationCap size={15} strokeWidth={1.5} /> Hồ sơ giáo viên
                    </Link>}

                    {isAdmin && (
                      <Link to="/admin/teacher-applications" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <GraduationCap size={15} strokeWidth={1.5} /> Duyệt hồ sơ giáo viên
                      </Link>
                    )}

                    {isAdmin && (
                      <Link to="/admin/dashboard" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <Activity size={15} strokeWidth={1.5} /> Tổng quan hệ thống
                      </Link>
                    )}

                    {isAdmin && (
                      <Link
                        to="/admin/tests"
                        className="dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <BookOpen size={15} strokeWidth={1.5} /> Quản lý đề thi
                      </Link>
                    )}

                    {isAdmin && (
                      <Link
                        to="/admin/users"
                        className="dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <ShieldCheck size={15} strokeWidth={1.5} /> Quản lý người dùng
                      </Link>
                    )}

                    {isAdmin && (
                      <Link
                        to="/admin/payments"
                        className="dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <ShieldCheck size={15} strokeWidth={1.5} /> Lịch sử thanh toán
                      </Link>
                    )}

                    <hr style={{ border: 'none', borderTop: '1px solid var(--gray-100)', margin: '6px 0' }} />

                    <button
                      className="dropdown-item dropdown-logout-btn"
                      onClick={handleLogout}
                    >
                      <LogOut size={15} strokeWidth={1.5} /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons-group">
                <Link to="/login" className="btn btn-outline btn-sm btn-press">
                  Đăng nhập
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm btn-press shadow-xs">
                  Đăng ký ngay
                </Link>
              </div>
            )}

            {/* Mobile Toggle Button */}
            <button
              className="mobile-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="mobile-nav-panel">
            <NavLink
              to="/"
              end
              className="mobile-nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Trang chủ
            </NavLink>
            <NavLink
              to="/courses"
              className="mobile-nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Khóa học & Đề thi
            </NavLink>
            <NavLink
              to="/practice"
              className="mobile-nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Luyện thi
            </NavLink>
            {isAuthenticated && !isAdmin && (
              <NavLink
                to="/classrooms"
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Lớp học
              </NavLink>
            )}
            {isAuthenticated && <NavLink to="/notifications" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              Thông báo{unreadNotifications > 0 ? ` (${unreadNotifications})` : ''}
            </NavLink>}
            {isAuthenticated && !isAdmin && !isTeacher && <NavLink to="/teacher/application" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              <GraduationCap size={16} style={{ marginRight: 8 }} /> Hồ sơ giáo viên
            </NavLink>}
            <NavLink
              to="/about"
              className="mobile-nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Giới thiệu
            </NavLink>
            <NavLink
              to="/contact"
              className="mobile-nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Liên hệ
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin/teacher-applications" className={`mobile-nav-link ${isAdminActive ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                <GraduationCap size={16} style={{ marginRight: 8 }} /> Duyệt hồ sơ giáo viên
              </NavLink>
            )}
            {isAdmin && (
              <NavLink
                to="/admin/dashboard"
                className={`mobile-nav-link ${isAdminActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <ShieldCheck size={16} style={{ marginRight: 8 }} /> Tổng quan quản trị
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin/payments" className={`mobile-nav-link ${isAdminActive ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                <ShieldCheck size={16} style={{ marginRight: 8 }} /> Lịch sử thanh toán
              </NavLink>
            )}


            {isAuthenticated ? (
              <div className="mobile-auth-section">
                <Link
                  to="/profile"
                  className="mobile-nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User size={16} style={{ marginRight: 8 }} /> Hồ sơ cá nhân
                </Link>
                <button
                  className="btn btn-danger btn-sm"
                  style={{ width: '100%', marginTop: 8 }}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                >
                  <LogOut size={16} style={{ marginRight: 6 }} /> Đăng xuất
                </button>
              </div>
            ) : (
              <div className="mobile-auth-section" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                <Link
                  to="/login"
                  className="btn btn-outline"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Đăng ký ngay
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
