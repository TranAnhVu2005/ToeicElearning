import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Clock,
  CheckCircle2,
  PlayCircle,
  FileText,
  Filter,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Award,
  AlertCircle,
  Edit2,
  Trash2,
  Save,
  AlertTriangle,
  Settings,
  Plus,
} from 'lucide-react';
import { examService } from '../services/examService';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';
import Toast from '../components/common/Toast';

const courseImages = [
  '/images/courses-2.webp',
  '/images/courses-3.webp',
  '/images/courses-8.webp',
  '/images/courses-12.webp',
  '/images/education-8.webp',
  '/images/campus-4.webp',
];

const CoursesPage = () => {
  const { isAdmin } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Filter State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(9);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'full' | 'listening' | 'reading'
  const [sortBy, setSortBy] = useState('createdAt');
  const [direction, setDirection] = useState('DESC');

  // Admin Quick Action Modal States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleOpenDeleteModal = (test) => {
    setSelectedTest(test);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTest) return;
    try {
      setActionLoading(true);
      const res = await examService.deleteTest(selectedTest.id);
      if (res.code === 1000) {
        setTests((prev) => prev.filter((t) => t.id !== selectedTest.id));
        setToast({ type: 'success', message: `Đã xóa đề thi "${selectedTest.titleTest}" thành công!` });
        setDeleteModalOpen(false);
      } else {
        setToast({ type: 'error', message: res.message || 'Không thể xóa đề thi.' });
      }
    } catch (err) {
      console.error('Delete test error:', err);
      setToast({ type: 'error', message: err.response?.data?.message || 'Lỗi máy chủ khi xóa đề thi.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Fetch tests from Backend API GET /api/exam/list
  const fetchTests = useCallback(async (page, search, sort, dir) => {
    setLoading(true);
    setError(null);
    try {
      const res = await examService.getTests(page, pageSize, search, sort, dir, 'PUBLISHED');
      if (res.code === 1000 && res.data) {
        setTests(res.data.content || []);

        setCurrentPage(res.data.pageNumber || 1);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements || 0);
      } else {
        setError(res.message || 'Không thể lấy danh sách đề thi');
      }
    } catch (err) {
      console.error('Error fetching tests:', err);
      setError('Lỗi kết nối máy chủ khi tải danh sách đề thi.');
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  // Initial load and filter effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTests(currentPage, searchTerm, sortBy, direction);
    }, 300);
    return () => clearTimeout(timer);
  }, [currentPage, searchTerm, sortBy, direction, fetchTests]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    const val = e.target.value;
    if (val === 'name-asc') {
      setSortBy('titleTest');
      setDirection('ASC');
    } else if (val === 'name-desc') {
      setSortBy('titleTest');
      setDirection('DESC');
    } else {
      setSortBy('createdAt');
      setDirection('DESC');
    }
    setCurrentPage(1);
  };

  return (
    <div className="courses-page" style={{ backgroundColor: 'var(--bg-page)', minHeight: '100vh' }}>
      {/* Page Header Banner (Academica Page Title) */}
      <div className="page-header-banner">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-primary text-xs tracking-wider">
                TRƯỜNG ĐẠI HỌC CẦN THƠ
              </span>
              <span className="badge badge-neutral text-xs">
                ToeicElearning 2026
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">
              Kho Khóa Học & Bộ Đề Thi ToeicElearning
            </h1>
            <p className="text-slate-500 text-sm max-w-2xl">
              Hệ thống luyện thi ToeicElearning trực tuyến chuẩn cấu trúc 7 phần của Trường Đại Học Cần Thơ, có giải thích đáp án chi tiết và tính điểm tự động.
            </p>
          </div>
          {isAdmin && (
            <Link
              to="/admin/tests?action=create"
              className="btn btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm md:text-base font-bold shadow-md hover:shadow-lg transition-all"
            >
              <Plus size={18} /> Soạn đề thi mới
            </Link>
          )}
        </div>
      </div>

      {/* Main Content Section */}
      <div className="container section-padding">
        {/* Toolbar & Filter Bar (Academica .courses-2 toolbar) */}
        <div
          style={{
            backgroundColor: 'var(--card-bg, #ffffff)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px 24px',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: 280, flex: '1 1 300px' }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Tìm kiếm theo tên bài thi, bộ đề..."
              style={{
                width: '100%',
                padding: '10px 16px 10px 42px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border)',
                backgroundColor: 'var(--bg-page)',
                color: 'var(--text-main, #1e293b)',
                fontSize: '0.92rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Filter Tag Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`btn btn-sm ${activeFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveFilter('all')}
            >
              Tất cả ({totalElements})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${activeFilter === 'full' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveFilter('full')}
            >
              Full Test (120p)
            </button>
            <button
              type="button"
              className={`btn btn-sm ${activeFilter === 'listening' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveFilter('listening')}
            >
              Phần Nghe (Part 1-4)
            </button>
            <button
              type="button"
              className={`btn btn-sm ${activeFilter === 'reading' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveFilter('reading')}
            >
              Phần Đọc (Part 5-7)
            </button>
          </div>

          {/* Sort Dropdown & Admin Access */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--gray-500)', whiteSpace: 'nowrap' }}>Sắp xếp:</span>
              <select
                onChange={handleSortChange}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border)',
                  backgroundColor: 'var(--bg-page)',
                  color: 'var(--text-main, #1e293b)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="date-desc">Mới nhất</option>
                <option value="name-asc">Tên đề: A - Z</option>
                <option value="name-desc">Tên đề: Z - A</option>
              </select>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-2">
                <Link
                  to="/admin/tests?action=create"
                  className="btn btn-primary btn-sm inline-flex items-center gap-1.5 font-bold shadow-xs hover:shadow-md transition-all"
                >
                  <Plus size={15} /> Soạn đề thi mới
                </Link>

                <Link
                  to="/admin/tests"
                  className="btn btn-outline btn-sm inline-flex items-center gap-1.5 font-bold"
                >
                  <Settings size={15} /> Quản trị đề thi
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                border: '4px solid var(--border-light)',
                borderTopColor: 'var(--primary)',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px',
              }}
            />
            <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.95rem' }}>
              Đang tải danh sách bài thi từ hệ thống...
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div
            style={{
              padding: 24,
              borderRadius: 'var(--radius-lg)',
              backgroundColor: '#fef2f2',
              border: '1.5px solid #fca5a5',
              color: '#991b1b',
              textAlign: 'center',
              marginBottom: 32,
            }}
          >
            <AlertCircle size={32} style={{ margin: '0 auto 8px', color: '#ef4444' }} />
            <h4 style={{ margin: '0 0 6px 0', fontWeight: 700 }}>Không thể tải đề thi</h4>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem' }}>{error}</p>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={() => fetchTests(currentPage, searchTerm, sortBy, direction)}
            >
              Thử lại ngay
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && tests.length === 0 && (
          <div
            style={{
              backgroundColor: 'var(--card-bg, #ffffff)',
              borderRadius: 'var(--radius-lg)',
              padding: '60px 24px',
              textAlign: 'center',
              border: '1px solid var(--border-light)',
            }}
          >
            <BookOpen size={48} color="var(--primary)" style={{ margin: '0 auto 16px', opacity: 0.6 }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main, #1e293b)', margin: '0 0 8px 0' }}>
              Chưa tìm thấy đề thi phù hợp
            </h3>
            <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.9rem', maxWidth: 460, margin: '0 auto 20px auto' }}>
              Không có bộ đề thi nào khớp với từ khóa "{searchTerm}". Vui lòng thử lại với từ khóa khác hoặc xóa bộ lọc.
            </p>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                setSearchTerm('');
                setActiveFilter('all');
              }}
            >
              Xóa bộ lọc tìm kiếm
            </button>
          </div>
        )}

        {/* Tests Grid (Academica .courses-2 .program-card Grid) */}
        {!loading && !error && tests.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 28,
            }}
          >
            {tests.map((test, index) => {
              const imageSrc = courseImages[index % courseImages.length];
              const contextCount = test.contextQuestions?.length || 0;
              const formattedDate = test.createdAt
                ? new Date(test.createdAt).toLocaleDateString('vi-VN')
                : 'Mới cập nhật';

              return (
                <div
                  key={test.id}
                  className="program-card"
                  style={{
                    backgroundColor: 'var(--card-bg, #ffffff)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-sm)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all var(--transition-smooth)',
                  }}
                >
                  {/* Card Thumbnail Image & Ribbon */}
                  <div style={{ position: 'relative', height: 200, overflow: 'hidden', backgroundColor: '#e2e8f0' }}>
                    <img
                      src={imageSrc}
                      alt={test.titleTest}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                    />
                    {/* Ribbon Tag */}
                    <span
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        padding: '4px 10px',
                        borderRadius: 20,
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        letterSpacing: '0.5px',
                        backgroundColor: '#198754',
                        color: '#ffffff',
                        boxShadow: 'var(--shadow-md)',
                      }}
                    >
                      FREE TEST
                    </span>
                    <span
                      style={{
                        position: 'absolute',
                        bottom: 12,
                        left: 12,
                        padding: '3px 8px',
                        borderRadius: 6,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        backgroundColor: 'rgba(15, 23, 42, 0.75)',
                        color: '#ffffff',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      Format ETS
                    </span>
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: 24, display: 'flex', flexDirection: 'column', flex: 1 }}>
                    {/* Category Tags */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                        TOEIC Full Test
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                        {formattedDate}
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      style={{
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        color: 'var(--text-main, #1e293b)',
                        marginBottom: 10,
                        lineHeight: 1.4,
                      }}
                    >
                      {test.titleTest}
                    </h3>

                    {/* Brief Description */}
                    <p
                      style={{
                        fontSize: '0.88rem',
                        color: 'var(--text-muted, #64748b)',
                        lineHeight: 1.6,
                        marginBottom: 18,
                        flex: 1,
                      }}
                    >
                      Đề thi thử đầy đủ các kỹ năng Nghe và Đọc theo chuẩn format kỳ thi TOEIC quốc tế. Có giải thích chi tiết từng câu.
                    </p>

                    {/* Metrics Row */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 0',
                        borderTop: '1px solid var(--border-light)',
                        borderBottom: '1px solid var(--border-light)',
                        marginBottom: 20,
                        fontSize: '0.82rem',
                        color: 'var(--gray-600)',
                        fontWeight: 600,
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Clock size={15} color="var(--primary)" /> 120 phút
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Layers size={15} color="var(--primary)" /> {contextCount} cụm phần
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Award size={15} color="#eab308" /> Điểm max 990
                      </span>
                    </div>

                    {/* Action Buttons Footer */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                      <Link
                        to={`/courses/${test.id}`}
                        className="btn btn-outline btn-sm"
                        style={{ textDecoration: 'none', textAlign: 'center', justifyContent: 'center' }}
                      >
                        Chi tiết đề
                      </Link>
                      <Link
                        to={`/courses/${test.id}/take`}
                        className="btn btn-primary btn-sm"
                        style={{ textDecoration: 'none', textAlign: 'center', justifyContent: 'center', gap: 6 }}
                      >
                        <PlayCircle size={15} /> Làm bài ngay
                      </Link>
                    </div>

                    {/* Quick Admin Actions Row (Only visible to Admin) */}
                    {isAdmin && (
                      <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-dashed border-gray-200 text-xs">
                        <span className="text-gray-500 font-semibold">Quản trị đề:</span>
                        <div className="flex gap-1.5">
                          <Link
                            to={`/admin/tests?editId=${test.id}`}
                            className="btn btn-outline btn-sm px-2.5 py-1 text-xs gap-1 font-bold inline-flex items-center"
                            title="Chỉnh sửa toàn bộ cấu trúc đề thi"
                          >
                            <Edit2 size={13} /> Sửa
                          </Link>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm px-2.5 py-1 text-xs gap-1 font-bold inline-flex items-center text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleOpenDeleteModal(test)}
                          >
                            <Trash2 size={13} /> Xóa
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Bar */}
        {!loading && !error && totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginTop: 48,
            }}
          >
            <button
              type="button"
              className="btn btn-outline btn-sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <ChevronLeft size={16} /> Trang trước
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                className={`btn btn-sm ${pageNum === currentPage ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setCurrentPage(pageNum)}
                style={{ width: 36, height: 36, padding: 0 }}
              >
                {pageNum}
              </button>
            ))}

            <button
              type="button"
              className="btn btn-outline btn-sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              Trang sau <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* ADMIN ACTION MODALS */}
      {isAdmin && (
        <>
          {/* DELETE TEST MODAL */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Xác nhận xóa đề thi"
      >
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <AlertTriangle size={48} color="#ef4444" style={{ margin: '0 auto 12px' }} />
          <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#0f172a' }}>
            Bạn có chắc chắn muốn xóa bài thi này?
          </h4>
          <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: '#64748b' }}>
            Đề thi <strong>"{selectedTest?.titleTest}"</strong> sẽ bị xóa vĩnh viễn khỏi hệ thống. Thao tác này không thể hoàn tác.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            <button
              type="button"
              className="btn btn-outline"
              disabled={actionLoading}
              onClick={() => setDeleteModalOpen(false)}
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              className="btn btn-danger"
              disabled={actionLoading}
              onClick={handleConfirmDelete}
              style={{ gap: 6 }}
            >
              <Trash2 size={16} /> {actionLoading ? 'Đang xóa...' : 'Xác nhận xóa'}
            </button>
            </div>
          </div>
        </Modal>
      </>
    )}

      {/* Toast Notification */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
          <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
