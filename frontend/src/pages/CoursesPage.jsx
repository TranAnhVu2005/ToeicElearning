import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Edit2,
  Trash2,
  AlertTriangle,
  Settings,
  Plus,
  Filter,
  Check,
  RotateCcw,
  Clock3,
  Layers,
} from 'lucide-react';
import { examService } from '../services/examService';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';
import Toast from '../components/common/Toast';
import heroBg from '../assets/img/coursepage/thuvien.jpg';
import coursePageBg from '../assets/img/coursepage/biasach.jpg';

const CoursesPage = () => {
  const { isAdmin } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Filter State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'FULL' | 'LISTENING' | 'READING'
  const [vipFilter, setVipFilter] = useState('ALL'); // 'ALL' | 'FREE' | 'VIP'
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
        setToast({
          type: 'success',
          message: res.data === 'ARCHIVED'
            ? `Đề "${selectedTest.titleTest}" đã được gỡ khỏi catalog và chuyển về bản nháp để giữ lịch sử.`
            : `Đề "${selectedTest.titleTest}" chưa có lịch sử và đã được xóa.`,
        });
        setDeleteModalOpen(false);
      } else {
        setToast({ type: 'error', message: res.message || 'Không thể xóa đề thi.' });
      }
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Lỗi máy chủ khi xóa đề thi.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Fetch tests from Backend API GET /api/exam/list
  const fetchTests = useCallback(async (page, search, sort, dir, category, vip) => {
    setLoading(true);
    setError(null);
    try {
      const isVipParam = vip === 'VIP' ? true : vip === 'FREE' ? false : null;
      const res = await examService.getTests(page, pageSize, search, sort, dir, 'PUBLISHED', category.toUpperCase(), isVipParam);
      if (res.code === 1000 && res.data) {
        let content = res.data.content || [];
        // Lọc dự phòng phía client đảm bảo kết quả chính xác tuyệt đối
        if (vip === 'VIP') {
          content = content.filter((t) => t.isVip === true);
        } else if (vip === 'FREE') {
          content = content.filter((t) => !t.isVip);
        }
        setTests(content);
        setCurrentPage(res.data.pageNumber || 1);
        const derivedTotalElements = vip !== 'ALL' && res.data.content?.length !== content.length
          ? content.length
          : (res.data.totalElements ?? content.length);
        const derivedTotalPages = vip !== 'ALL' && res.data.content?.length !== content.length
          ? Math.max(1, Math.ceil(content.length / pageSize))
          : (res.data.totalPages || 1);
        setTotalPages(derivedTotalPages);
        setTotalElements(derivedTotalElements);
      } else {
        setError(res.message || 'Không thể lấy danh sách đề thi');
      }
    } catch {
      setError('Lỗi kết nối máy chủ khi tải danh sách đề thi.');
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  // Initial load and filter effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTests(currentPage, searchTerm, sortBy, direction, activeFilter, vipFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [currentPage, searchTerm, sortBy, direction, activeFilter, vipFilter, fetchTests]);

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
    } else if (val === 'date-asc') {
      setSortBy('createdAt');
      setDirection('ASC');
    } else {
      setSortBy('createdAt');
      setDirection('DESC');
    }
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setActiveFilter('ALL');
    setVipFilter('ALL');
    setSortBy('createdAt');
    setDirection('DESC');
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(
    searchTerm ||
    vipFilter !== 'ALL' ||
    activeFilter !== 'ALL' ||
    sortBy !== 'createdAt' ||
    direction !== 'DESC'
  );

  return (
    <div className="courses-page neo-courses-page bg-[#F8FAFC]">
      {/* Page Header Banner with Seamless Fade */}
      <div
        className="page-header-banner neo-courses-hero relative overflow-hidden"
        style={{
          '--courses-hero-bg': `linear-gradient(to bottom, rgba(248, 250, 252, 0.55) 0%, rgba(248, 250, 252, 0.45) 45%, rgba(248, 250, 252, 0.85) 80%, #F8FAFC 100%), url("${heroBg}")`,
          backgroundImage: `linear-gradient(to bottom, rgba(248, 250, 252, 0.55) 0%, rgba(248, 250, 252, 0.45) 45%, rgba(248, 250, 252, 0.85) 80%, #F8FAFC 100%), url("${heroBg}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 42%',
          backgroundRepeat: 'no-repeat',
          borderBottom: 'none',
        }}
      >
        <div className="container flex flex-col items-center justify-center text-center">
          <div>
            <h1
              className="neo-courses-title text-3xl sm:text-4xl lg:text-[46px] font-extrabold tracking-tight text-slate-900"
              style={{
                textShadow: '0 2px 12px rgba(255, 255, 255, 0.95), 0 1px 3px rgba(255, 255, 255, 0.9)',
              }}
            >
              Thư viện đề thi <span className="text-[#1D4ED8] underline decoration-[#1D4ED8]/70 underline-offset-8">TOEIC</span>
            </h1>
            <p
              className="mt-2 text-sm sm:text-base font-semibold text-slate-800 max-w-2xl mx-auto leading-relaxed"
              style={{
                textShadow: '0 1px 8px rgba(255, 255, 255, 0.95)',
              }}
            >
              Khám phá và chọn đề thi phù hợp.
            </p>
          </div>
          {isAdmin && (
            <div className="mt-4">
              <Link
                to="/admin/tests?action=create"
                className="neo-button neo-button-primary inline-flex items-center gap-2 font-semibold shadow-sm"
              >
                <Plus size={18} /> Soạn đề thi mới
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Main Catalog Content Section with Matching Seamless Fade */}
      <div
        className="courses-middle-content relative"
        style={{
          '--courses-catalog-bg': `linear-gradient(to bottom, #F8FAFC 0%, rgba(248, 250, 252, 0.96) 40px, rgba(255, 255, 255, 0.85) 120px, rgba(248, 250, 252, 0.88) 100%), url("${coursePageBg}")`,
          backgroundImage: `linear-gradient(to bottom, #F8FAFC 0%, rgba(248, 250, 252, 0.96) 40px, rgba(255, 255, 255, 0.85) 120px, rgba(248, 250, 252, 0.88) 100%), url("${coursePageBg}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="container section-padding py-8">
          {/* Horizontal Search Bar on Top */}
          <div className="mb-6 border border-slate-200/90 bg-white/95 backdrop-blur-sm p-3 sm:p-4 shadow-sm">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Tìm kiếm theo tên đề thi..."
                className="w-full border border-slate-300 bg-white py-2.5 pl-11 pr-10 text-sm text-slate-800 placeholder-slate-400 focus:border-[#1D4ED8] focus:outline-none"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-lg text-slate-400 hover:text-slate-700 leading-none"
                  title="Xóa từ khóa tìm kiếm"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* 2-Column Layout: Left Sidebar Filter + Right Main Catalog */}
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[280px_1fr]">
            {/* ================= LEFT SIDEBAR FILTER ================= */}
            <aside className="space-y-6">
              <div className="border border-slate-200/90 bg-white/95 backdrop-blur-sm p-5 shadow-sm space-y-6">
                {/* Header & Reset Button */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
                    <Filter size={15} className="text-[#1D4ED8]" /> Bộ lọc
                  </h2>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#1D4ED8] hover:underline"
                    >
                      <RotateCcw size={12} /> Đặt lại
                    </button>
                  )}
                </div>

                {/* 1. Lọc theo gói đề thi (Đề thường / Đề VIP) */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">
                    Loại đề thi
                  </label>
                  <div className="space-y-1.5">
                    {[
                      { value: 'ALL', label: 'Tất cả' },
                      { value: 'FREE', label: 'Đề có sẵn' },
                      { value: 'VIP', label: 'Đề có phí' },
                    ].map((pkg) => (
                      <button
                        key={pkg.value}
                        type="button"
                        onClick={() => { setVipFilter(pkg.value); setCurrentPage(1); }}
                        className={`flex w-full items-center justify-between border px-3 py-2 text-xs font-semibold transition-colors ${vipFilter === pkg.value
                          ? 'border-[#1D4ED8] bg-[#EFF6FF] text-[#1D4ED8]'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                      >
                        <span>{pkg.label}</span>
                        {vipFilter === pkg.value && <Check size={14} className="text-[#1D4ED8]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Sắp xếp kết quả */}
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">
                    Sắp xếp theo
                  </label>
                  <select
                    value={sortBy === 'titleTest' ? `name-${direction.toLowerCase()}` : (direction === 'ASC' ? 'date-asc' : 'date-desc')}
                    onChange={handleSortChange}
                    className="w-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#1D4ED8] focus:outline-none"
                  >
                    <option value="date-desc">Mới nhất</option>
                    <option value="date-asc">Cũ nhất</option>
                    <option value="name-asc">Tên đề: A - Z</option>
                    <option value="name-desc">Tên đề: Z - A</option>
                  </select>
                </div>

                {/* 3. Khu vực Quản trị (Chỉ hiển thị cho ADMIN) */}
                {isAdmin && (
                  <div className="space-y-2 border-t border-slate-200 pt-4">
                    <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">
                      Quản trị viên
                    </label>
                    <Link
                      to="/admin/tests?action=create"
                      className="flex w-full items-center justify-center gap-1.5 border border-[#1D4ED8] bg-[#1D4ED8] py-2 text-xs font-semibold text-white transition-colors hover:bg-[#173ea8]"
                    >
                      <Plus size={14} /> Soạn đề thi mới
                    </Link>
                    <Link
                      to="/admin/tests"
                      className="flex w-full items-center justify-center gap-1.5 border border-slate-300 bg-white py-2 text-xs font-semibold text-slate-800 transition-colors hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
                    >
                      <Settings size={14} /> Quản trị đề thi
                    </Link>
                  </div>
                )}
              </div>
            </aside>

            {/* ================= RIGHT MAIN CATALOG ================= */}
            <main className="space-y-6 min-w-0">
              {/* Top result info banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 border border-slate-200/90 bg-white/95 backdrop-blur-sm px-5 py-3 shadow-sm">
                <span className="text-xs font-semibold text-slate-700">
                  Tìm thấy <strong className="font-bold text-slate-900">{totalElements}</strong> bộ đề thi
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {vipFilter !== 'ALL' && (
                    <span className="inline-flex items-center gap-1 border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-[#1D4ED8]">
                      {vipFilter === 'VIP' ? 'Đề có phí' : 'Đề có sẵn'}
                      <button
                        type="button"
                        onClick={() => setVipFilter('ALL')}
                        className="ml-0.5 text-slate-500 hover:text-red-600"
                        title="Bỏ lọc gói đề"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {activeFilter !== 'ALL' && (
                    <span className="inline-flex items-center gap-1 border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-[#1D4ED8]">
                      {activeFilter === 'FULL'
                        ? 'Full Test (200 câu)'
                        : activeFilter === 'LISTENING'
                          ? 'Có Listening'
                          : 'Có Reading'}
                      <button
                        type="button"
                        onClick={() => setActiveFilter('ALL')}
                        className="ml-0.5 text-slate-500 hover:text-red-600"
                        title="Bỏ lọc cấu trúc"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {searchTerm && (
                    <span className="inline-flex items-center gap-1 border border-slate-300 bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-800">
                      "{searchTerm}"
                      <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        className="ml-0.5 text-slate-500 hover:text-red-600"
                        title="Xóa từ khóa tìm kiếm"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="border border-white/20 bg-white/95 backdrop-blur-md p-12 text-center shadow-md">
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      border: '3px solid var(--border-light)',
                      borderTopColor: 'var(--primary)',
                      animation: 'spin 1s linear infinite',
                      margin: '0 auto 12px',
                    }}
                  />
                  <p className="text-xs font-medium text-slate-600">
                    Đang tải danh sách bài thi từ hệ thống...
                  </p>
                </div>
              )}

              {/* Error State */}
              {!loading && error && (
                <div className="border border-red-200 bg-white/95 backdrop-blur-md p-6 text-center text-red-900 shadow-md">
                  <AlertCircle size={28} className="mx-auto mb-2 text-red-600" />
                  <h4 className="font-bold text-sm">Không thể tải danh sách đề thi</h4>
                  <p className="mt-1 text-xs text-red-700">{error}</p>
                  <button
                    type="button"
                    className="mt-4 border border-red-600 bg-red-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                    onClick={() => fetchTests(currentPage, searchTerm, sortBy, direction, activeFilter, vipFilter)}
                  >
                    Thử lại ngay
                  </button>
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && tests.length === 0 && (
                <div className="border border-white/20 bg-white/95 backdrop-blur-md p-12 text-center shadow-md">
                  <BookOpen size={40} className="mx-auto mb-3 text-slate-300" />
                  <h3 className="text-base font-bold text-slate-900">
                    Không tìm thấy đề thi phù hợp
                  </h3>
                  <p className="mx-auto mt-1 max-w-md text-xs text-slate-600">
                    {searchTerm
                      ? `Không có bộ đề thi nào khớp với từ khóa "${searchTerm}".`
                      : 'Không có bộ đề thi nào khớp với bộ lọc hiện tại.'}
                  </p>
                  <button
                    type="button"
                    className="mt-4 border border-[#1D4ED8] bg-[#1D4ED8] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#173ea8]"
                    onClick={handleResetFilters}
                  >
                    Đặt lại tất cả bộ lọc
                  </button>
                </div>
              )}

              {/* Tests Grid */}
              {!loading && !error && tests.length > 0 && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {tests.map((test) => {
                    const date = test.createdAt ? new Date(test.createdAt).toLocaleDateString('vi-VN') : null;
                    return (
                      <article
                        key={test.id}
                        className="flex flex-col sm:flex-row items-stretch border border-slate-200/90 bg-white/95 hover:bg-white backdrop-blur-sm p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all gap-4 sm:gap-5"
                      >
                        {/* Compact cover image */}
                        <Link
                          to={`/courses/${test.id}`}
                          className="flex w-full sm:w-[108px] h-28 sm:h-[136px] shrink-0 items-center justify-center border border-slate-200 bg-slate-50 overflow-hidden"
                          title={`Xem chi tiết đề: ${test.titleTest}`}
                        >
                          {test.coverImageUrl ? (
                            <img
                              src={test.coverImageUrl}
                              alt={`Ảnh bìa: ${test.titleTest}`}
                              loading="lazy"
                              className="h-full w-full object-contain p-1"
                            />
                          ) : (
                            <span className="text-xs text-slate-400">Chưa có ảnh</span>
                          )}
                        </Link>

                        {/* Content block */}
                        <div className="flex flex-1 flex-col justify-between min-w-0">
                          <div>
                            {/* Meta Tags */}
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                                <Layers size={13} className="text-[#1D4ED8]" /> Đề TOEIC
                              </span>
                              {date && (
                                <span className="inline-flex items-center gap-1 font-medium text-slate-500">
                                  <Clock3 size={13} /> {date}
                                </span>
                              )}
                              <span
                                className={`border px-2 py-0.5 text-[10px] font-bold uppercase ${test.isVip
                                  ? 'border-[#1D4ED8] bg-[#EFF6FF] text-[#1D4ED8]'
                                  : 'border-slate-300 bg-slate-100 text-slate-700'
                                  }`}
                              >
                                {test.isVip
                                  ? `VIP · ${new Intl.NumberFormat('vi-VN').format(Number(test.vipPriceVnd || 0))} ₫`
                                  : 'Miễn phí'}
                              </span>
                            </div>

                            {/* Title */}
                            <h3 className="mt-2 text-base sm:text-lg font-semibold text-slate-900 leading-snug line-clamp-2">
                              <Link
                                to={`/courses/${test.id}`}
                                className="hover:text-[#1D4ED8] transition-colors"
                              >
                                {test.titleTest}
                              </Link>
                            </h3>
                          </div>

                          {/* Actions Row */}
                          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                            <span className="text-xs text-slate-500 font-medium">
                              Luyện Part hoặc Full Test
                            </span>
                            <div className="flex items-center gap-2">
                              {isAdmin && (
                                <div className="flex items-center gap-1 mr-1">
                                  <Link
                                    to={`/admin/tests?editId=${test.id}`}
                                    className="border border-slate-300 bg-white p-1.5 text-slate-700 hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
                                    title="Chỉnh sửa đề thi"
                                  >
                                    <Edit2 size={13} />
                                  </Link>
                                  <button
                                    type="button"
                                    className="border border-red-200 bg-red-50 p-1.5 text-red-700 hover:bg-red-100"
                                    onClick={() => handleOpenDeleteModal(test)}
                                    title="Gỡ / Xóa đề thi"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              )}
                              <Link
                                to={`/courses/${test.id}`}
                                className="inline-flex min-h-[34px] items-center gap-1.5 border border-[#1D4ED8] bg-[#1D4ED8] px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#173ea8]"
                              >
                                Chi tiết đề <ChevronRight size={14} />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              {/* Pagination Bar */}
              {!loading && !error && totalPages > 1 && (
                <div className="p-3 bg-white/95 backdrop-blur-sm border border-slate-200/90 shadow-sm flex items-center justify-center gap-2 mt-8">
                  <button
                    type="button"
                    className="neo-button neo-button-light"
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
                      className={`neo-button ${pageNum === currentPage ? 'neo-button-primary' : 'neo-button-light'}`}
                      onClick={() => setCurrentPage(pageNum)}
                      style={{ width: 36, height: 36, padding: 0 }}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    type="button"
                    className="neo-button neo-button-light"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    Trang sau <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      {/* ADMIN ACTION MODALS */}
      {isAdmin && (
        <>
          {/* DELETE TEST MODAL */}
          <Modal
            isOpen={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            title="Xác nhận xóa hoặc gỡ đề thi"
          >
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <AlertTriangle size={48} color="#ef4444" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#0f172a' }}>
                Bạn có chắc chắn muốn gỡ đề thi này khỏi catalog?
              </h4>
              <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: '#64748b' }}>
                Đề <strong>"{selectedTest?.titleTest}"</strong> sẽ không còn xuất hiện trong catalog. Nếu đã có lượt làm hoặc giao dịch, hệ thống chuyển đề về bản nháp để giữ lịch sử; nếu chưa có, đề sẽ bị xóa cùng nội dung.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                <button
                  type="button"
                  className="neo-button neo-button-light"
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={actionLoading}
                >
                  Hủy thao tác
                </button>
                <button
                  type="button"
                  className="neo-button"
                  style={{ backgroundColor: '#ef4444', color: '#fff', borderColor: '#b91c1c' }}
                  onClick={handleConfirmDelete}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Đang xử lý...' : 'Xác nhận gỡ đề'}
                </button>
              </div>
            </div>
          </Modal>
        </>
      )}

      {/* Toast Alert */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default CoursesPage;
