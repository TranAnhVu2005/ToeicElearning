import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Search,
  Lock,
  Unlock,
  Shield,
  ShieldCheck,
  UserCheck,
  AlertTriangle,
  RefreshCw,
  Clock,
  ArrowUpDown,
  BookOpen,
} from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';

const UserManagementPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  
  // Search state with debouncing
  const [searchInput, setSearchInput] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  
  const [sortBy, setSortBy] = useState('createdAt');
  const [direction, setDirection] = useState('DESC');

  // Status toggle confirmation modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Bulletproof helper to extract locked status from any representation (boolean, 1/0, string, any key)
  const getIsLocked = (userObj) => {
    if (!userObj) return false;
    const val = userObj.isLocked ?? userObj.locked ?? userObj.is_locked;
    if (val === true || val === 1 || val === '1' || val === 'true') return true;
    return false;
  };

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Debounce search input (350ms) to avoid lagging on every keystroke
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(searchInput);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Fetch users from backend (GET /api/admin/users)
  const fetchUsers = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await adminService.getUsers(currentPage, pageSize, debouncedKeyword, sortBy, direction);
      if (res.code === 1000 && res.data) {
        setLoadError(false);
        setUsers(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      setLoadError(true);
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Không thể tải danh sách người dùng.',
      });
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [currentPage, pageSize, debouncedKeyword, sortBy, direction]);

  useEffect(() => {
    fetchUsers(true);
  }, [fetchUsers]);

  // Open modal to confirm status change
  const handleOpenStatusModal = (user) => {
    setSelectedUser(user);
    setStatusModalOpen(true);
  };

  // Execute lock/unlock
  const handleConfirmStatusChange = async () => {
    if (!selectedUser || actionLoading) return;
    
    const targetId = selectedUser.id;
    const currentLockedStatus = getIsLocked(selectedUser);
    const nextIsLocked = !currentLockedStatus; // Flip isLocked boolean
    
    try {
      setActionLoading(true);

      // 1. Optimistic update: Update state immediately so UI changes without delay
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === targetId ? { ...u, isLocked: nextIsLocked, locked: nextIsLocked } : u))
      );
      
      // Close modal right away
      setStatusModalOpen(false);

      // 2. Call backend API
      const res = await adminService.changeUserStatus(targetId, nextIsLocked);
      if (res.code === 1000) {
        setToast({
          type: 'success',
          message: `Đã ${nextIsLocked ? 'khóa' : 'mở khóa'} tài khoản ${selectedUser.userEmail} thành công!`,
        });
        // Silent sync from backend
        fetchUsers(false);
      } else {
        // Revert on error response
        setUsers((prevUsers) =>
          prevUsers.map((u) => (u.id === targetId ? { ...u, isLocked: currentLockedStatus, locked: currentLockedStatus } : u))
        );
        setToast({
          type: 'error',
          message: res.message || 'Thao tác không thành công.',
        });
      }
    } catch (err) {
      // Revert on failure
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === targetId ? { ...u, isLocked: currentLockedStatus, locked: currentLockedStatus } : u))
      );
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Thao tác không thành công. Vui lòng thử lại!',
      });
    } finally {
      setActionLoading(false);
      setSelectedUser(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setDirection((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortBy(field);
      setDirection('DESC');
    }
    setCurrentPage(1);
  };

  return (
    <div className="admin-page-wrapper user-management-page">
      <div className="container section-padding">
        <header className="user-management-heading">
          <div className="user-management-title-row">
            <div className="user-management-title-icon"><Users size={25} /></div>
            <div>
              <p className="user-management-eyebrow">QUẢN TRỊ / TÀI KHOẢN</p>
              <h1>Quản lý người dùng</h1>
              <p className="user-management-description">Tra cứu tài khoản và kiểm soát quyền truy cập hệ thống.</p>
            </div>
          </div>
          <nav className="user-management-tabs" aria-label="Điều hướng quản trị">
            <Link to="/admin/tests"><BookOpen size={17} /> Quản lý đề thi</Link>
            <span className="is-active" aria-current="page"><Users size={17} /> Người dùng <b>{totalElements}</b></span>
          </nav>
        </header>

        {/* Toast Alert */}
        {toast && (
          <div className="user-management-toast">
            <Toast
              type={toast.type}
              message={toast.message}
              onClose={() => setToast(null)}
            />
          </div>
        )}

        {/* Overview Stats Bar */}
        <div className="admin-stats-bar user-management-stats">
          <div className="admin-stat-card">
            <div className="admin-stat-icon stat-icon-yellow">
              <Users size={24} />
            </div>
            <div>
              <div className="admin-stat-count">{totalElements}</div>
              <div className="admin-stat-label">Tổng số tài khoản</div>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon stat-icon-pink">
              <UserCheck size={24} />
            </div>
            <div>
              <div className="admin-stat-count">
                {users.filter((u) => !getIsLocked(u)).length}
              </div>
              <div className="admin-stat-label">Đang hoạt động (Trang này)</div>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon stat-icon-paper">
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="admin-stat-count">
                {users.filter((u) => u.roleName === 'ROLE_ADMIN').length}
              </div>
              <div className="admin-stat-label">Quản trị viên (Trang này)</div>
            </div>
          </div>
        </div>

        {/* Search & Actions Toolbar */}
        <div className="table-toolbar-card user-management-toolbar">
          <div className="toolbar-search-box">
            <Search size={18} aria-hidden="true" />
            <input
              type="text"
              placeholder="Tìm theo tên, email hoặc số điện thoại..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="toolbar-search-input"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="user-search-clear" aria-label="Xóa từ khóa tìm kiếm"
              >
                ✕
              </button>
            )}
          </div>

          <div className="user-toolbar-actions">
              <button
                className="btn btn-outline btn-sm user-refresh-button"
              onClick={() => fetchUsers(true)}
              disabled={loading}
              title="Làm mới dữ liệu"
            >
              <RefreshCw size={16} className={loading ? 'spin' : ''} /> Làm mới
            </button>
          </div>
        </div>

        {/* Users Data Table */}
        <div className="table-responsive-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="user-number-column">
                  STT
                </th>
                <th className="user-sortable">
                  <button type="button" onClick={() => toggleSort('userName')}>
                    Người dùng <ArrowUpDown size={12} aria-hidden="true" />
                  </button>
                </th>
                <th>Số điện thoại</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th className="user-sortable">
                  <button type="button" onClick={() => toggleSort('createdAt')}>
                    Ngày tạo <ArrowUpDown size={12} aria-hidden="true" />
                  </button>
                </th>
                <th style={{ textAlign: 'right' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="user-table-state">
                    <div className="loading-spinner" style={{ margin: '0 auto 12px' }} />
                    <p className="text-muted">Đang tải danh sách người dùng...</p>
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan="7" className="user-table-state">
                    <p>Không tải được danh sách tài khoản. Hãy thử tải lại.</p>
                    <button type="button" className="btn btn-outline btn-sm user-refresh-button" onClick={() => fetchUsers(true)}>
                      <RefreshCw size={15} /> Thử lại
                    </button>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="user-table-state">
                    <p className="text-muted">Không tìm thấy tài khoản nào khớp với từ khóa tìm kiếm.</p>
                  </td>
                </tr>
              ) : (
                users.map((item, index) => {
                  const stt = (currentPage - 1) * pageSize + index + 1;
                  const isSelf = currentUser?.id === item.id;
                  const locked = getIsLocked(item);
                  return (
                    <tr key={item.id}>
                      <td className="user-number-cell">
                        #{stt.toString().padStart(2, '0')}
                      </td>
                      <td>
                        <div className="user-table-cell">
                          <img
                            src={item.userAvatar || '/images/default-avatar.svg'}
                            alt={item.userName || 'User'}
                            className="user-avatar-small"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/images/default-avatar.svg';
                            }}
                          />
                          <div>
                            <div className="user-table-name">
                              {item.userName} {isSelf && <span className="user-self-tag">Bạn</span>}
                            </div>
                            <div className="user-table-email">{item.userEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="user-table-phone">{item.userNumberphone || '-'}</span>
                      </td>
                      <td>
                        <span className={`user-role-tag ${item.roleName === 'ROLE_ADMIN' ? 'is-admin' : 'is-learner'}`}>
                          {item.roleName === 'ROLE_ADMIN' ? (
                            <span className="user-tag-content">
                              <Shield size={12} /> Admin
                            </span>
                          ) : (
                            'Học viên'
                          )}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`user-status-tag ${locked ? 'is-locked' : 'is-active'}`}
                        >
                          {locked ? 'Đã khóa' : 'Hoạt động'}
                        </span>
                      </td>
                      <td>
                        <div className="user-created-date">
                          <Clock size={13} /> {formatDate(item.createdAt)}
                        </div>
                      </td>
                      <td className="user-action-cell">
                        <button
                          className={`btn btn-sm user-lock-button ${locked ? 'is-unlock' : 'is-lock'}`}
                          onClick={() => handleOpenStatusModal(item)}
                          disabled={isSelf}
                          title={isSelf ? 'Không thể tự khóa tài khoản của chính mình' : locked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                        >
                          {locked ? (
                            <span className="user-tag-content">
                              <Unlock size={13} /> Mở khóa
                            </span>
                          ) : (
                            <span className="user-tag-content">
                              <Lock size={13} /> Khóa
                            </span>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Pagination Footer */}
          <div className="table-pagination-footer">
            <div className="table-meta-text">
              Hiển thị <strong>{users.length}</strong> / <strong>{totalElements}</strong> người dùng
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => !actionLoading && setStatusModalOpen(false)}
        title={getIsLocked(selectedUser) ? 'Xác nhận mở khóa tài khoản' : 'Xác nhận khóa tài khoản'}
        footer={
          <>
            <button
              className="btn btn-outline"
              onClick={() => setStatusModalOpen(false)}
              disabled={actionLoading}
            >
              Hủy bỏ
            </button>
            <button
              className={`btn ${getIsLocked(selectedUser) ? 'btn-primary' : 'btn-danger'}`}
              onClick={handleConfirmStatusChange}
              disabled={actionLoading}
            >
              {actionLoading ? 'Đang xử lý...' : getIsLocked(selectedUser) ? 'Mở khóa ngay' : 'Khóa ngay'}
            </button>
          </>
        }
      >
        <div className="user-status-confirmation">
          <div
            style={{
              padding: 12,
              border: '2px solid #111111',
              background: getIsLocked(selectedUser) ? '#FFE600' : '#FF5B93',
              color: '#111111',
            }}
          >
            <AlertTriangle size={24} />
          </div>
          <div>
            <p style={{ fontWeight: 600, color: 'var(--gray-900)', marginBottom: 6 }}>
              Bạn có chắc chắn muốn {getIsLocked(selectedUser) ? 'mở khóa' : 'khóa'} tài khoản này?
            </p>
            <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)', marginBottom: 8 }}>
              Người dùng: <strong>{selectedUser?.userName}</strong> ({selectedUser?.userEmail})
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>
              {getIsLocked(selectedUser)
                ? 'Tài khoản sẽ được mở khóa và có thể đăng nhập, sử dụng hệ thống bình thường.'
                : 'Sau khi khóa, người dùng sẽ không thể đăng nhập hoặc làm bài thi trên hệ thống.'}
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagementPage;
