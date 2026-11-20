import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  Check,
  Clock,
  CreditCard,
  FileText,
  GraduationCap,
  Inbox,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { notificationService } from '../services/notificationService';
import Pagination from '../components/common/Pagination';
import Toast from '../components/common/Toast';
import headerBgImage from '../assets/img/notifications/newspaper.jpg';
import bodyBgImage from '../assets/img/notifications/thu_bao_quanh.png';
import bellIcon from '../assets/img/notifications/bell.svg';
import { TOBY_IMAGES } from '../components/common/TobyMascot';

const PAGE_SIZE = 12;

const CATEGORY_TABS = [
  { key: 'ALL', label: 'Tất cả thông báo', icon: Inbox },
  { key: 'EXAM', label: 'Kết quả thi', icon: Award },
  { key: 'ASSIGNMENT', label: 'Bài tập lớp', icon: FileText },
  { key: 'CLASSROOM', label: 'Lớp học và tài liệu', icon: GraduationCap },
  { key: 'PAYMENT', label: 'Thanh toán', icon: CreditCard },
  { key: 'SYSTEM', label: 'Hồ sơ', icon: ShieldCheck },
];

const TYPE_METADATA = {
  EXAM_RESULT: {
    badge: 'Kết quả bài thi',
    category: 'EXAM',
    icon: Award,
    ctaLabel: 'Xem kết quả',
  },
  ASSIGNMENT: {
    badge: 'Bài tập lớp',
    category: 'ASSIGNMENT',
    icon: FileText,
    ctaLabel: 'Vào lớp học',
  },
  ASSIGNMENT_CREATED: {
    badge: 'Bài tập mới',
    category: 'ASSIGNMENT',
    icon: FileText,
    ctaLabel: 'Làm bài tập',
  },
  ASSIGNMENT_DEADLINE_CHANGED: {
    badge: 'Cập nhật hạn nộp',
    category: 'ASSIGNMENT',
    icon: Clock,
    ctaLabel: 'Xem hạn nộp',
  },
  ASSIGNMENT_FEEDBACK: {
    badge: 'Nhận xét giáo viên',
    category: 'ASSIGNMENT',
    icon: MessageSquare,
    ctaLabel: 'Xem nhận xét',
  },
  ASSIGNMENT_SUBMITTED: {
    badge: 'Nộp bài tập',
    category: 'ASSIGNMENT',
    icon: FileText,
    ctaLabel: 'Xem bài nộp',
  },
  CLASSROOM: {
    badge: 'Lớp học',
    category: 'CLASSROOM',
    icon: GraduationCap,
    ctaLabel: 'Vào lớp học',
  },
  CLASSROOM_JOIN_REQUEST: {
    badge: 'Yêu cầu vào lớp',
    category: 'CLASSROOM',
    icon: GraduationCap,
    ctaLabel: 'Duyệt thành viên',
  },
  CLASSROOM_MEMBER_APPROVED: {
    badge: 'Đã duyệt vào lớp',
    category: 'CLASSROOM',
    icon: GraduationCap,
    ctaLabel: 'Vào lớp học',
  },
  CLASSROOM_MEMBER_STATUS: {
    badge: 'Thành viên lớp học',
    category: 'CLASSROOM',
    icon: GraduationCap,
    ctaLabel: 'Xem lớp học',
  },
  CLASSROOM_MATERIAL: {
    badge: 'Tài liệu lớp mới',
    category: 'CLASSROOM',
    icon: BookOpen,
    ctaLabel: 'Xem tài liệu',
  },
  PAYMENT: {
    badge: 'Thanh toán PayOS',
    category: 'PAYMENT',
    icon: CreditCard,
    ctaLabel: 'Xem giao dịch',
  },
  TEST_VIP_PURCHASE: {
    badge: 'Mở khóa đề VIP',
    category: 'PAYMENT',
    icon: CreditCard,
    ctaLabel: 'Làm đề ngay',
  },
  TEACHER_APPLICATION_PAYMENT: {
    badge: 'Phí đăng ký giáo viên',
    category: 'PAYMENT',
    icon: CreditCard,
    ctaLabel: 'Xem hồ sơ',
  },
  TEACHER_APPLICATION: {
    badge: 'Hồ sơ giáo viên',
    category: 'SYSTEM',
    icon: GraduationCap,
    ctaLabel: 'Xem hồ sơ',
  },
  TEACHER_APPLICATION_SUBMITTED: {
    badge: 'Duyệt giáo viên',
    category: 'SYSTEM',
    icon: ShieldCheck,
    ctaLabel: 'Duyệt hồ sơ',
  },
  ACCOUNT_SECURITY: {
    badge: 'Bảo mật tài khoản',
    category: 'SYSTEM',
    icon: ShieldCheck,
    ctaLabel: 'Xem hồ sơ',
  },
  COMMENT_MODERATED: {
    badge: 'Thảo luận đề thi',
    category: 'SYSTEM',
    icon: MessageSquare,
    ctaLabel: 'Xem đề thi',
  },
  WELCOME: {
    badge: 'Chào mừng',
    category: 'SYSTEM',
    icon: BookOpen,
    ctaLabel: 'Xem kho đề',
  },
  SYSTEM: {
    badge: 'Hệ thống',
    category: 'SYSTEM',
    icon: Bell,
    ctaLabel: 'Xem chi tiết',
  },
};

const parseHcmTimestamp = (rawValue) => {
  if (!rawValue) return null;
  if (rawValue instanceof Date) return Number.isNaN(rawValue.getTime()) ? null : rawValue;
  const text = String(rawValue).trim();
  if (!text) return null;
  const hasOffset = /[zZ]|[+-]\d{2}:?\d{2}$/.test(text);
  const normalized = hasOffset ? text : `${text.replace(' ', 'T')}+07:00`;
  const parsed = new Date(normalized);
  if (!Number.isNaN(parsed.getTime())) return parsed;
  const fallback = new Date(text);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
};

const formatNotificationTimestamp = (rawValue) => {
  const date = parseHcmTimestamp(rawValue);
  if (!date) return { absolute: '', relative: '' };

  const absolute = new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour12: false,
  }).format(date);

  const diffSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  let relative = 'Vừa xong';
  if (diffSeconds >= 86400 * 7) {
    relative = '';
  } else if (diffSeconds >= 86400) {
    relative = `${Math.floor(diffSeconds / 86400)} ngày trước`;
  } else if (diffSeconds >= 3600) {
    relative = `${Math.floor(diffSeconds / 3600)} giờ trước`;
  } else if (diffSeconds >= 60) {
    relative = `${Math.floor(diffSeconds / 60)} phút trước`;
  }

  return { absolute, relative };
};

const getMetaForNotification = (item) => {
  const rawType = String(item?.type || 'SYSTEM').toUpperCase();
  if (TYPE_METADATA[rawType]) {
    return TYPE_METADATA[rawType];
  }
  const cat = String(item?.category || 'SYSTEM').toUpperCase();
  if (cat === 'EXAM') return TYPE_METADATA.EXAM_RESULT;
  if (cat === 'ASSIGNMENT') return TYPE_METADATA.ASSIGNMENT;
  if (cat === 'CLASSROOM') return TYPE_METADATA.CLASSROOM;
  if (cat === 'PAYMENT') return TYPE_METADATA.PAYMENT;
  return TYPE_METADATA.SYSTEM;
};

const resolveCtaLabel = (item, meta) => {
  const link = item?.link || item?.referenceUrl || '';
  if (link.startsWith('/results/')) return 'Xem kết quả và lời giải chi tiết';
  if (link.startsWith('/courses/')) return 'Mở trang đề thi';
  if (link === '/courses') return 'Khám phá thư viện đề thi';
  if (link.startsWith('/classrooms')) return 'Mở không gian lớp học';
  if (link.startsWith('/admin/teacher-applications')) return 'Mở trang duyệt hồ sơ giáo viên';
  if (link.startsWith('/teacher/application')) return 'Xem hồ sơ đăng ký giáo viên';
  if (link.startsWith('/profile')) return 'Mở hồ sơ tài khoản';
  return meta.ctaLabel || 'Mở nội dung liên quan';
};

const NotificationsPage = () => {
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalAllCount, setTotalAllCount] = useState(0);
  const [category, setCategory] = useState('ALL');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionBusyId, setActionBusyId] = useState(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const fetchNotifications = useCallback(async ({
    targetCategory = category,
    targetUnreadOnly = unreadOnly,
    targetPage = page,
    silent = false,
  } = {}) => {
    const reqId = ++requestIdRef.current;
    if (!silent) {
      setLoading(true);
    }
    setError('');

    try {
      const [listResponse, countResponse] = await Promise.all([
        notificationService.getMine({
          unreadOnly: targetUnreadOnly,
          category: targetCategory,
          page: targetPage,
          size: PAGE_SIZE,
        }),
        notificationService.getUnreadCount(),
      ]);

      if (reqId !== requestIdRef.current) return;

      if (listResponse?.code === 1000) {
        const pageData = listResponse.data;
        const contentList = Array.isArray(pageData?.content)
          ? pageData.content
          : Array.isArray(pageData)
            ? pageData
            : [];
        setItems(contentList);
        setTotalPages(Math.max(1, Number(pageData?.totalPages) || 1));
        setTotalElements(Number(pageData?.totalElements ?? contentList.length) || 0);
      } else {
        setError(listResponse?.message || 'Không thể tải danh sách thông báo.');
      }

      if (countResponse?.code === 1000) {
        const nextUnread = Number(countResponse.data?.unreadCount) || 0;
        const nextTotal = Number(countResponse.data?.totalCount);
        setUnreadCount(nextUnread);
        if (!Number.isNaN(nextTotal) && nextTotal >= 0) {
          setTotalAllCount(nextTotal);
        } else if (targetCategory === 'ALL' && !targetUnreadOnly) {
          setTotalAllCount(Number(listResponse?.data?.totalElements) || 0);
        }
      }
    } catch (err) {
      if (reqId !== requestIdRef.current) return;
      setError(err.response?.data?.message || 'Không thể tải danh sách thông báo. Vui lòng thử lại.');
    } finally {
      if (reqId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [category, page, unreadOnly]);

  useEffect(() => {
    fetchNotifications({
      targetCategory: category,
      targetUnreadOnly: unreadOnly,
      targetPage: page,
    });
  }, [category, unreadOnly, page, fetchNotifications]);

  const handleSelectCategory = (nextCategory) => {
    if (nextCategory === category && page === 1) return;
    setCategory(nextCategory);
    setPage(1);
  };

  const handleToggleUnreadOnly = () => {
    setUnreadOnly((prev) => !prev);
    setPage(1);
  };

  const handleMarkRead = async (notificationId, { silentToast = false } = {}) => {
    if (!notificationId) return;
    setActionBusyId(notificationId);
    try {
      await notificationService.markRead(notificationId);
      setItems((prev) =>
        prev.map((item) =>
          (item.id || item.notificationId) === notificationId
            ? { ...item, read: true, isRead: true }
            : item
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      if (!silentToast) {
        setToast({ type: 'success', message: 'Đã đánh dấu thông báo là đã đọc.' });
      }
      if (unreadOnly) {
        await fetchNotifications({ silent: true });
      }
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Không thể đánh dấu thông báo đã đọc.',
      });
    } finally {
      setActionBusyId(null);
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0 || bulkBusy) return;
    setBulkBusy(true);
    try {
      const res = await notificationService.markAllRead();
      const updated = Number(res?.data?.updatedCount) || unreadCount;
      setUnreadCount(0);
      setItems((prev) => prev.map((item) => ({ ...item, read: true, isRead: true })));
      setToast({
        type: 'success',
        message: `Đã đánh dấu tất cả (${updated}) thông báo là đã đọc.`,
      });
      await fetchNotifications({ silent: true });
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Không thể đánh dấu tất cả thông báo đã đọc.',
      });
    } finally {
      setBulkBusy(false);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (!notificationId) return;
    setActionBusyId(notificationId);
    try {
      await notificationService.deleteNotification(notificationId);
      setToast({ type: 'info', message: 'Đã xóa thông báo khỏi hộp thư.' });
      const nextPage = items.length === 1 && page > 1 ? page - 1 : page;
      if (nextPage !== page) {
        setPage(nextPage);
      } else {
        await fetchNotifications({ targetPage: nextPage, silent: true });
      }
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Không thể xóa thông báo.',
      });
    } finally {
      setActionBusyId(null);
    }
  };

  const handleDeleteReadNotifications = async () => {
    const readCount = Math.max(0, totalAllCount - unreadCount);
    if (readCount === 0 || bulkBusy) return;
    setBulkBusy(true);
    try {
      const res = await notificationService.deleteReadNotifications();
      const deleted = Number(res?.data?.deletedCount) || readCount;
      setToast({
        type: 'info',
        message: `Đã dọn sạch ${deleted} thông báo đã đọc.`,
      });
      setPage(1);
      await fetchNotifications({ targetPage: 1, silent: true });
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Không thể xóa các thông báo đã đọc.',
      });
    } finally {
      setBulkBusy(false);
    }
  };

  const readTotalCount = Math.max(0, totalAllCount - unreadCount);
  const activeCategoryObj = CATEGORY_TABS.find((t) => t.key === category) || CATEGORY_TABS[0];

  return (
    <div
      className="notifications-page min-h-screen text-[#111827]"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(255, 255, 255, 0.88) 0%, rgba(248, 250, 252, 0.72) 240px, rgba(248, 250, 252, 0.78) 100%), url("${bodyBgImage}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <Toast
        type={toast?.type}
        message={toast?.message}
        onClose={() => setToast(null)}
      />

      {/* Header with Newspaper Photo seamlessly fading into Envelope Canvas */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(248, 250, 252, 0.72) 0%, rgba(248, 250, 252, 0.62) 55%, rgba(248, 250, 252, 0.92) 100%), url("${headerBgImage}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 42%',
            backgroundRepeat: 'no-repeat',
            filter: 'grayscale(100%) contrast(0.92) brightness(1.06)',
            WebkitMaskImage: 'linear-gradient(180deg, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.78) 62%, rgba(0, 0, 0, 0) 100%)',
            maskImage: 'linear-gradient(180deg, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.78) 62%, rgba(0, 0, 0, 0) 100%)',
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 pt-10 pb-7 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3.5">
                <img
                  src={bellIcon}
                  alt=""
                  className="h-10 w-10 shrink-0 object-contain sm:h-11 sm:w-11"
                />
                <h1
                  className="text-3xl font-semibold tracking-tight text-[#111111] sm:text-4xl"
                  style={{
                    textShadow: '0 1px 10px rgba(255, 255, 255, 0.9)',
                  }}
                >
                  Thông báo
                </h1>
              </div>
              <p
                className="max-w-2xl text-[15px] font-medium leading-relaxed text-[#334155]"
                style={{
                  textShadow: '0 1px 6px rgba(255, 255, 255, 0.85)',
                }}
              >
                Theo dõi kết quả bài thi TOEIC, bài tập và tài liệu lớp học, trạng thái duyệt hồ sơ giáo viên, giao dịch mở khóa đề VIP và bảo mật tài khoản.
              </p>
            </div>

            {/* Quick Summary Stats */}
            <div className="grid grid-cols-3 gap-3 sm:min-w-[350px]">
              <div className="rounded-[2px] border border-[#CBD5E1] bg-white/92 px-3.5 py-2.5 backdrop-blur-sm">
                <span className="block text-xs font-medium text-[#475569]">Tất cả</span>
                <strong className="mt-0.5 block text-xl font-semibold text-[#111111] tabular-nums">
                  {totalAllCount}
                </strong>
              </div>
              <div className="rounded-[2px] border border-[#93C5FD] bg-[#EFF6FF]/95 px-3.5 py-2.5 backdrop-blur-sm">
                <span className="block text-xs font-medium text-[#1E40AF]">Chưa đọc</span>
                <strong className="mt-0.5 block text-xl font-semibold text-[#1D4ED8] tabular-nums">
                  {unreadCount}
                </strong>
              </div>
              <div className="rounded-[2px] border border-[#CBD5E1] bg-white/92 px-3.5 py-2.5 backdrop-blur-sm">
                <span className="block text-xs font-medium text-[#475569]">Đã đọc</span>
                <strong className="mt-0.5 block text-xl font-semibold text-[#111111] tabular-nums">
                  {readTotalCount}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main 2-Column Content Area: Left Filter Sidebar + Right Notification List */}
      <div className="pb-16">
        <div className="mx-auto max-w-6xl px-4 pt-3 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[270px_minmax(0,1fr)] lg:items-start">
            {/* Left Filter Sidebar */}
            <aside className="space-y-4 lg:sticky lg:top-24" aria-label="Bộ lọc và thao tác thông báo">
              {/* Category Filter Box */}
              <div className="rounded-[2px] border border-[#D1D5DB] bg-white p-4">
                <div className="mb-3 flex items-center justify-between border-b border-[#E5E7EB] pb-2.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#374151]">
                    Danh mục thông báo
                  </span>
                  {(category !== 'ALL' || unreadOnly) && (
                    <button
                      type="button"
                      onClick={() => {
                        setCategory('ALL');
                        setUnreadOnly(false);
                        setPage(1);
                      }}
                      className="text-xs font-semibold text-[#1D4ED8] hover:underline"
                    >
                      Đặt lại
                    </button>
                  )}
                </div>

                <div
                  className="flex flex-col gap-1.5"
                  role="tablist"
                  aria-orientation="vertical"
                  aria-label="Phân loại thông báo"
                >
                  {CATEGORY_TABS.map((tab) => {
                    const isActive = category === tab.key;
                    return (
                      <button
                        key={tab.key}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => handleSelectCategory(tab.key)}
                        className={`flex min-h-[40px] w-full items-center justify-between gap-2.5 border-0 border-b-2 bg-transparent px-2 py-2 text-left text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-2 ${isActive
                          ? 'border-[#1D4ED8] text-[#1D4ED8]'
                          : 'border-transparent text-[#374151] hover:border-[#CBD5E1] hover:text-[#1D4ED8]'
                          }`}
                      >
                        <span className="inline-flex items-center gap-2.5">
                          <span>{tab.label}</span>
                        </span>
                        {tab.key === 'ALL' && (
                          <span
                            className={`rounded-[2px] px-1.5 py-0.5 text-xs font-semibold tabular-nums ${isActive
                              ? 'bg-[#EFF6FF] text-[#1D4ED8]'
                              : 'bg-[#F3F4F6] text-[#4B5563]'
                              }`}
                          >
                            {totalAllCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status & Quick Actions Box */}
              <div className="rounded-[2px] border border-[#D1D5DB] bg-white p-4">
                <div className="mb-3 border-b border-[#E5E7EB] pb-2.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#374151]">
                    Bộ lọc
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleToggleUnreadOnly}
                    aria-pressed={unreadOnly}
                    className={`flex min-h-[38px] w-full items-center justify-between gap-2 rounded-[2px] border px-3 py-2 text-xs font-semibold transition-colors ${unreadOnly
                      ? 'border-[#1D4ED8] bg-[#EFF6FF] text-[#1D4ED8]'
                      : 'border-[#D1D5DB] bg-white text-[#374151] hover:border-[#1D4ED8] hover:text-[#1D4ED8]'
                      }`}
                  >
                    <span>Chỉ hiện chưa đọc</span>
                    <span className="rounded-[2px] bg-[#EFF6FF] px-1.5 py-0.5 text-xs font-semibold text-[#1D4ED8] tabular-nums">
                      {unreadCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    disabled={unreadCount === 0 || bulkBusy}
                    className="flex min-h-[38px] w-full items-center justify-center rounded-[2px] border border-[#1D4ED8] bg-[#1D4ED8] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1E40AF] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span>Đánh dấu tất cả đã đọc</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fetchNotifications()}
                    disabled={loading}
                    className="flex min-h-[38px] w-full items-center justify-center rounded-[2px] border border-[#D1D5DB] bg-white px-3 py-2 text-xs font-semibold text-[#374151] transition-colors hover:border-[#1D4ED8] hover:text-[#1D4ED8] disabled:opacity-50"
                  >
                    <span>{loading ? 'Đang làm mới...' : 'Làm mới danh sách'}</span>
                  </button>

                  {readTotalCount > 0 && (
                    <button
                      type="button"
                      onClick={handleDeleteReadNotifications}
                      disabled={bulkBusy}
                      className="flex min-h-[38px] w-full items-center justify-center rounded-[2px] border border-[#D1D5DB] bg-white px-3 py-2 text-xs font-semibold text-[#4B5563] transition-colors hover:border-[#DC2626] hover:text-[#DC2626] disabled:opacity-50"
                      title="Xóa toàn bộ các thông báo đã đọc để dọn gọn hộp thư"
                    >
                      <span>Xóa đã đọc ({readTotalCount})</span>
                    </button>
                  )}
                </div>


              </div>
            </aside>

            {/* Right Main Notification List Column */}
            <div className="min-w-0">
              {/* Active View Header Bar */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-[2px] border border-[#D1D5DB] bg-white px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-[#111111]">
                    {activeCategoryObj.label}
                  </span>
                  {unreadOnly && (
                    <span className="inline-flex items-center rounded-[2px] border border-[#BFDBFE] bg-[#EFF6FF] px-2 py-0.5 text-xs font-semibold text-[#1D4ED8]">
                      Đang lọc: Chưa đọc
                    </span>
                  )}
                </div>
                <div className="text-xs font-medium text-[#4B5563] tabular-nums">
                  {!loading && (
                    <span>
                      Hiển thị <strong className="text-[#111111]">{items.length}</strong> /{' '}
                      <strong className="text-[#111111]">{totalElements}</strong> thông báo
                      {totalPages > 1 ? ` · Trang ${page}/${totalPages}` : ''}
                    </span>
                  )}
                </div>
              </div>

              {/* Error State */}
              {error && (
                <div
                  role="alert"
                  className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[2px] border border-[#FECACA] bg-[#FEF2F2] p-4 text-sm text-[#991B1B]"
                >
                  <div className="flex items-center gap-2.5 font-medium">
                    <AlertCircle size={18} className="shrink-0 text-[#DC2626]" />
                    <span>{error}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => fetchNotifications()}
                    className="inline-flex min-h-[36px] items-center gap-1.5 rounded-[2px] border border-[#FCA5A5] bg-white px-3 py-1.5 text-xs font-semibold text-[#991B1B] hover:bg-[#FEE2E2]"
                  >
                    <RefreshCw size={13} />
                    <span>Thử tải lại</span>
                  </button>
                </div>
              )}

              {/* Loading State */}
              {loading ? (
                <div
                  className="rounded-[2px] border border-[#D1D5DB] bg-white p-12 text-center"
                  role="status"
                  aria-live="polite"
                >
                  <RefreshCw size={24} className="mx-auto mb-3 animate-spin text-[#1D4ED8]" />
                  <p className="text-base font-semibold text-[#111827]">
                    Đang tải danh sách thông báo...
                  </p>
                  <p className="mt-1 text-sm text-[#6B7280]">
                    Hệ thống đang đồng bộ hộp thư thông báo mới nhất của bạn.
                  </p>
                </div>
              ) : !error && items.length === 0 ? (
                /* Empty State */
                <div className="notification-feed-card bg-[#F4F6FA] p-12 text-center">
                  <img
                    src={TOBY_IMAGES.sleeping}
                    alt="Chưa có thông báo"
                    className="mx-auto mb-3 h-20 w-28 object-contain"
                  />
                  <h2 className="text-lg font-semibold text-[#111111]">
                    {unreadOnly
                      ? 'Không có thông báo chưa đọc'
                      : category !== 'ALL'
                        ? 'Chưa có thông báo nào trong mục này'
                        : 'Chưa có thông báo nào'}
                  </h2>
                  <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-[#4B5563]">
                    {unreadOnly
                      ? 'Bạn đã xem hết các thông báo trong danh mục này.'
                      : 'Các cập nhật về kết quả thi, bài tập lớp học và giao dịch sẽ hiển thị tại đây.'}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                    {(unreadOnly || category !== 'ALL') && (
                      <button
                        type="button"
                        onClick={() => {
                          setCategory('ALL');
                          setUnreadOnly(false);
                          setPage(1);
                        }}
                        className="inline-flex min-h-[38px] items-center gap-1.5 rounded-[2px] border border-[#D1D5DB] bg-white px-4 py-2 text-xs font-semibold text-[#111827] hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
                      >
                        Xem toàn bộ thông báo
                      </button>
                    )}
                  </div>
                </div>
              ) : items.length > 0 ? (
                /* Soft Rounded Notification Feed */
                <div className="space-y-2.5">
                  {items.map((item) => {
                    const id = item.id || item.notificationId;
                    const isRead = Boolean(item.read ?? item.isRead);
                    const targetLink = item.link || item.referenceUrl || '';
                    const meta = getMetaForNotification(item);
                    const IconComponent = meta.icon || Bell;
                    const ctaText = resolveCtaLabel(item, meta);
                    const { absolute, relative } = formatNotificationTimestamp(item.createdAt);
                    const isBusy = actionBusyId === id;

                    const toneMap = {
                      EXAM: 'bg-[#D1FAE5] text-[#047857]',
                      ASSIGNMENT: 'bg-[#FFE4CC] text-[#C2410C]',
                      CLASSROOM: 'bg-[#DBEAFE] text-[#1D4ED8]',
                      PAYMENT: 'bg-[#EDE9FE] text-[#6D28D9]',
                      SYSTEM: 'bg-[#E2E8F0] text-[#475569]',
                    };
                    const circleTone = toneMap[meta.category] || toneMap.SYSTEM;

                    return (
                      <article
                        key={id}
                        className={`notification-feed-card group flex items-center gap-4 px-5 py-3.5 transition-colors ${isRead
                          ? 'bg-[#F4F6FA] hover:bg-[#EAEFF7]'
                          : 'bg-[#EBF2FF] hover:bg-[#E1ECFF]'
                          }`}
                      >
                        <div
                          className={`notification-feed-icon flex h-10 w-10 shrink-0 items-center justify-center ${circleTone}`}
                          aria-hidden="true"
                        >
                          <IconComponent size={18} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h2
                              className={`truncate text-[15px] leading-snug ${isRead ? 'font-medium text-[#1F2937]' : 'font-semibold text-[#0F172A]'
                                }`}
                            >
                              {item.title}
                            </h2>
                            {!isRead && (
                              <span
                                className="h-2 w-2 shrink-0 rounded-full bg-[#1D4ED8]"
                                aria-label="Chưa đọc"
                              />
                            )}
                          </div>

                          <p className="mt-0.5 line-clamp-2 text-[13.5px] leading-relaxed text-[#475569]">
                            {item.content}
                          </p>

                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#64748B]">
                            <span className="tabular-nums">
                              {relative || absolute}
                              {relative && absolute ? ` · ${absolute}` : ''}
                            </span>
                            {targetLink && (
                              <Link
                                to={targetLink}
                                onClick={() => {
                                  if (!isRead) {
                                    handleMarkRead(id, { silentToast: true });
                                  }
                                }}
                                className="inline-flex items-center gap-1 font-medium text-[#1D4ED8] no-underline transition-colors hover:text-[#1E40AF] hover:underline"
                              >
                                <span>{ctaText}</span>
                                <ArrowRight size={12} />
                              </Link>
                            )}
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                          {!isRead && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleMarkRead(id)}
                              className="notification-feed-action-btn inline-flex h-8 w-8 cursor-pointer items-center justify-center text-[#1D4ED8] transition-colors hover:bg-[#DBEAFE] disabled:opacity-50"
                              title="Đánh dấu đã đọc"
                              aria-label="Đánh dấu đã đọc"
                            >
                              <Check size={15} />
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleDeleteNotification(id)}
                            className="notification-feed-action-btn inline-flex h-8 w-8 cursor-pointer items-center justify-center text-[#64748B] transition-colors hover:bg-rose-100 hover:text-rose-600 disabled:opacity-50"
                            title="Xóa thông báo"
                            aria-label={`Xóa thông báo: ${item.title}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </article>
                    );
                  })}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="pt-2">
                      <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={(nextPage) => setPage(nextPage)}
                      />
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
