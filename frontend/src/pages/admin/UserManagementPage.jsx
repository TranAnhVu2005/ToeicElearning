import React, { useState, useEffect, useCallback } from 'react';
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
  ArrowUpDown
} from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';

const UserManagementPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
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
        console.log('Fetched admin users from backend:', res.data.content);
        setUsers(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      console.error('Fetch users error:', err);
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
      console.log('Change status response:', res);

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
      console.error('Change status error:', err);
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
    <div className="admin-page-wrapper bg-gray-50">
      {/* Admin Header Banner */}
      <div className="page-header-banner">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span className="badge badge-primary">Hệ thống quản trị</span>
            <span className="badge badge-warning">Quyền Admin</span>
          </div>
          <h1 className="page-title">Quản Lý Người Dùng</h1>
          <p className="page-subtitle">
            Theo dõi, tìm kiếm và phân quyền trạng thái hoạt động của học viên trong hệ thống.
          </p>
        </div>
      </div>

      <div className="container section-padding">
        {/* Toast Alert */}
        {toast && (
          <div style={{ marginBottom: 20 }}>
            <Toast
              type={toast.type}
              message={toast.message}
              onClose={() => setToast(null)}
            />
          </div>
        )}

        {/* Overview Stats Bar */}
        <div className="admin-stats-bar">
          <div className="admin-stat-card">
            <div className="admin-stat-icon" style={{ background: '#e6f4ea', color: 'var(--primary)' }}>
              <Users size={24} />
            </div>
            <div>
              <div className="admin-stat-count">{totalElements}</div>
              <div className="admin-stat-label">Tổng số tài khoản</div>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
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
            <div className="admin-stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
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
        <div className="table-toolbar-card">
          <div className="toolbar-search-box">
            <Search size={18} color="var(--gray-400)" />
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
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', fontSize: '0.85rem' }}
              >
                ✕
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn btn-outline btn-sm"
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
                <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort('id')}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    ID <ArrowUpDown size={12} />
                  </span>
                </th>
                <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort('userName')}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    Người dùng <ArrowUpDown size={12} />
                  </span>
                </th>
                <th>Số điện thoại</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort('createdAt')}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    Ngày tạo <ArrowUpDown size={12} />
                  </span>
                </th>
                <th style={{ textAlign: 'right' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div className="loading-spinner" style={{ margin: '0 auto 12px' }} />
                    <p className="text-muted">Đang tải danh sách người dùng...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px 0' }}>
                    <p className="text-muted">Không tìm thấy tài khoản nào khớp với từ khóa tìm kiếm.</p>
                  </td>
                </tr>
              ) : (
                users.map((item) => {
                  const isSelf = currentUser?.id === item.id;
                  const locked = getIsLocked(item);
                  return (
                    <tr key={item.id}>
                      <td>
                        <span style={{ fontFamily: 'monospace', color: 'var(--gray-500)', fontSize: '0.8rem' }}>
                          #{item.id ? item.id.substring(0, 8) + '...' : '-'}
                        </span>
                      </td>
                      <td>
                        <div className="user-table-cell">
                          <img
                            src={item.userAvatar || '/images/default-avatar.svg'}
                            alt={item.userName || 'User'}
                            className="user-avatar-small"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(item.userName || 'User') + '&background=198754&color=fff';
                            }}
                          />
                          <div>
                            <div className="user-table-name">
                              {item.userName} {isSelf && <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>Bạn</span>}
                            </div>
                            <div className="user-table-email">{item.userEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="user-table-phone">{item.userNumberphone || '-'}</span>
                      </td>
                      <td>
                        <span className={`badge ${item.roleName === 'ROLE_ADMIN' ? 'badge-primary' : 'badge-neutral'}`}>
                          {item.roleName === 'ROLE_ADMIN' ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <Shield size={12} /> Admin
                            </span>
                          ) : (
                            'Học viên'
                          )}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${locked ? 'badge-danger' : 'badge-primary'}`}
                          style={{ transition: 'all 0.2s ease' }}
                        >
                          {locked ? 'Đã khóa' : 'Hoạt động'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--gray-500)', fontSize: '0.85rem' }}>
                          <Clock size={13} /> {formatDate(item.createdAt)}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className={`btn btn-sm ${locked ? 'btn-primary' : 'btn-danger'}`}
                          style={{ padding: '6px 12px', fontSize: '0.8rem', transition: 'all 0.15s ease' }}
                          onClick={() => handleOpenStatusModal(item)}
                          disabled={isSelf}
                          title={isSelf ? 'Không thể tự khóa tài khoản của chính mình' : locked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                        >
                          {locked ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Unlock size={13} /> Mở khóa
                            </span>
                          ) : (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
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
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div
            style={{
              padding: 12,
              borderRadius: '50%',
              background: getIsLocked(selectedUser) ? '#e6f4ea' : '#fee2e2',
              color: getIsLocked(selectedUser) ? 'var(--primary)' : 'var(--danger)',
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
