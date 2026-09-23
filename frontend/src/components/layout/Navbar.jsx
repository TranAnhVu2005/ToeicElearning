import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen,
  User,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  ChevronDown
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isTeacher, canManageTests, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
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
            <span>
              <Mail size={13} strokeWidth={1.5} /> trananhvu314159@gmail.com
            </span>
            <span>
              <Phone size={13} strokeWidth={1.5} /> 0359906510
            </span>
            <span className="hidden-mobile">
              <MapPin size={13} strokeWidth={1.5} /> Trường Đại Học Cần Thơ (CTU)
            </span>
          </div>
          <div className="topbar-right">
            <span>Hệ thống luyện thi ToeicElearning chuẩn ETS 2026</span>
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
            <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Giới thiệu
            </NavLink>
            <NavLink to="/contact" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Liên hệ
            </NavLink>
            {canManageTests && (
              <NavLink to="/admin/tests" className={() => `nav-link ${isAdminActive ? 'active' : ''}`}>
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
                      e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.userName || 'User') + '&background=198754&color=fff';
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

                    {canManageTests && (
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
            {canManageTests && (
              <NavLink
                to="/admin/tests"
                className={`mobile-nav-link ${isAdminActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <ShieldCheck size={16} style={{ marginRight: 8 }} /> Quản trị hệ thống
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
