import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/adminService';
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
  Clock
} from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Status toggle confirmation modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Fetch users from backend
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers(currentPage, pageSize, searchTerm);
      if (res.code === 1000 && res.data) {
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
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Search input handler
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // reset to page 1 on search
  };

  // Open modal to confirm status change
  const handleOpenStatusModal = (user) => {
    setSelectedUser(user);
    setStatusModalOpen(true);
  };

  // Execute lock/unlock
  const handleConfirmStatusChange = async () => {
    if (!selectedUser) return;
    try {
      setActionLoading(true);
      const nextStatus = !selectedUser.userStatus; // flip boolean status
      const res = await adminService.changeUserStatus(selectedUser.id, nextStatus);

      if (res.code === 1000) {
        setToast({
          type: 'success',
          message: `Đã ${nextStatus ? 'mở khóa' : 'khóa'} tài khoản ${selectedUser.userEmail} thành công!`,
        });
        setStatusModalOpen(false);
        fetchUsers(); // Refresh table
      }
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Thao tác không thành công. Vui lòng thử lại!',
      });
    } finally {
      setActionLoading(false);
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
                {users.filter((u) => u.userStatus).length}
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
              value={searchTerm}
              onChange={handleSearchChange}
              className="toolbar-search-input"
            />
          </div>

          <button
            className="btn btn-outline btn-sm"
            onClick={() => fetchUsers()}
            disabled={loading}
            title="Làm mới dữ liệu"
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} /> Làm mới
          </button>
        </div>

        {/* Users Data Table */}
        <div className="table-responsive-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Người dùng</th>
                <th>Liên hệ</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
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
                users.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', color: 'var(--gray-500)' }}>#{item.id}</span>
                    </td>
                    <td>
                      <div className="user-table-cell">
                        <div className="user-avatar-initials">
                          {item.userName ? item.userName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="user-table-name">{item.userName}</div>
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
                      <span className={`badge ${item.userStatus ? 'badge-primary' : 'badge-danger'}`}>
                        {item.userStatus ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--gray-500)', fontSize: '0.85rem' }}>
                        <Clock size={13} /> {formatDate(item.createdAt)}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className={`btn btn-sm ${item.userStatus ? 'btn-danger' : 'btn-primary'}`}
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        onClick={() => handleOpenStatusModal(item)}
                        title={item.userStatus ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                      >
                        {item.userStatus ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Lock size={13} /> Khóa
                          </span>
                        ) : (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Unlock size={13} /> Mở khóa
                          </span>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
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
        onClose={() => setStatusModalOpen(false)}
        title={selectedUser?.userStatus ? 'Xác nhận khóa tài khoản' : 'Xác nhận mở khóa tài khoản'}
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
              className={`btn ${selectedUser?.userStatus ? 'btn-danger' : 'btn-primary'}`}
              onClick={handleConfirmStatusChange}
              disabled={actionLoading}
            >
              {actionLoading ? 'Đang xử lý...' : selectedUser?.userStatus ? 'Khóa ngay' : 'Mở khóa ngay'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div
            style={{
              padding: 12,
              borderRadius: '50%',
              background: selectedUser?.userStatus ? '#fee2e2' : '#e6f4ea',
              color: selectedUser?.userStatus ? 'var(--danger)' : 'var(--primary)',
            }}
          >
            <AlertTriangle size={24} />
          </div>
          <div>
            <p style={{ fontWeight: 600, color: 'var(--gray-900)', marginBottom: 6 }}>
              Bạn có chắc chắn muốn {selectedUser?.userStatus ? 'khóa' : 'mở khóa'} tài khoản này?
            </p>
            <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)', marginBottom: 8 }}>
              Người dùng: <strong>{selectedUser?.userName}</strong> ({selectedUser?.userEmail})
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>
              {selectedUser?.userStatus
                ? 'Sau khi khóa, người dùng sẽ không thể đăng nhập hoặc thực hiện các hoạt động làm bài trên hệ thống.'
                : 'Tài khoản sẽ được kích hoạt trở lại và có thể đăng nhập bình thường.'}
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagementPage;
