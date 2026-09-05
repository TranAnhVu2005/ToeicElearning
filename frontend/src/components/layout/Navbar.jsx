import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
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
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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
              <Mail size={14} /> contact@toeiclearning.edu.vn
            </span>
            <span>
              <Phone size={14} /> +84 (0) 292 3832 663
            </span>
            <span className="hidden-mobile">
              <MapPin size={14} /> Đại học Cần Thơ (CTU)
            </span>
          </div>
          <div className="topbar-right">
            <span>Nền tảng luyện thi TOEIC trực tuyến chuẩn format mới</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="main-navbar">
        <div className="container navbar-container">
          {/* Brand Logo */}
          <Link to="/" className="brand-logo">
            <div className="logo-icon-wrapper">
              <BookOpen size={24} color="#ffffff" />
            </div>
            <div className="logo-text">
              <span className="logo-title">TOEIC<span>PRO</span></span>
              <span className="logo-subtitle">Học viện Tiếng Anh CTU</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="nav-links">
            <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Trang chủ
            </NavLink>
            <NavLink to="/practice" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Luyện thi
            </NavLink>
            <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Giới thiệu
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
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
                    src={user.userAvatar || '/images/teacher-1.webp'}
                    alt={user.userName || 'User'}
                    className="user-avatar-small"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.userName || 'User') + '&background=198754&color=fff';
                    }}
                  />
                  <span className="user-name-display">{user.userName || user.userEmail}</span>
                  <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'none' }} />
                </button>

                {dropdownOpen && (
                  <div className="user-dropdown-menu">
                    <div className="dropdown-user-info">
                      <p className="dropdown-user-name">{user.userName || 'Học viên'}</p>
                      <p className="dropdown-user-email">{user.userEmail}</p>
                      <span className={`badge ${isAdmin ? 'badge-primary' : 'badge-neutral'}`} style={{ marginTop: 4 }}>
                        {isAdmin ? 'Quản trị viên' : 'Học viên'}
                      </span>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid var(--gray-100)', margin: '6px 0' }} />

                    <Link
                      to="/profile"
                      className="dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User size={16} /> Hồ sơ cá nhân
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin/users"
                        className="dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <ShieldCheck size={16} /> Quản lý người dùng
                      </Link>
                    )}

                    <hr style={{ border: 'none', borderTop: '1px solid var(--gray-100)', margin: '6px 0' }} />

                    <button
                      className="dropdown-item dropdown-logout-btn"
                      onClick={handleLogout}
                    >
                      <LogOut size={16} /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons-group">
                <Link to="/login" className="btn btn-outline btn-sm">
                  Đăng nhập
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
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
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
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
            {isAdmin && (
              <NavLink
                to="/admin/users"
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Quản trị hệ thống
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
