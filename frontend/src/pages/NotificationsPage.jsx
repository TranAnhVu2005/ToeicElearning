import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  Check,
  CheckCheck,
  Clock,
  CreditCard,
  FileText,
  Filter,
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
import headerBgImage from '../assets/img/hero/background_sach.jpg';

const PAGE_SIZE = 12;

const CATEGORY_TABS = [
  { key: 'ALL', label: 'Tất cả thông báo', icon: Inbox },
  { key: 'EXAM', label: 'Kết quả thi', icon: Award },
  { key: 'ASSIGNMENT', label: 'Bài tập lớp', icon: FileText },
  { key: 'CLASSROOM', label: 'Lớp học & Tài liệu', icon: GraduationCap },
  { key: 'PAYMENT', label: 'Thanh toán & VIP', icon: CreditCard },
  { key: 'SYSTEM', label: 'Hồ sơ & Hệ thống', icon: ShieldCheck },
];

const TYPE_METADATA = {
  EXAM_RESULT: {
    badge: 'Kết quả bài thi',
    category: 'EXAM',
    icon: Award,
    ctaLabel: 'Xem chi tiết kết quả & lời giải',
  },
  ASSIGNMENT: {
    badge: 'Bài tập lớp',
    category: 'ASSIGNMENT',
    icon: FileText,
    ctaLabel: 'Mở trang lớp học',
  },
  ASSIGNMENT_CREATED: {
    badge: 'Bài tập mới',
    category: 'ASSIGNMENT',
    icon: FileText,
    ctaLabel: 'Mở bài tập trong lớp học',
  },
  ASSIGNMENT_DEADLINE_CHANGED: {
    badge: 'Cập nhật hạn nộp',
    category: 'ASSIGNMENT',
    icon: Clock,
    ctaLabel: 'Xem hạn nộp bài tập',
  },
  ASSIGNMENT_FEEDBACK: {
    badge: 'Nhận xét giáo viên',
    category: 'ASSIGNMENT',
    icon: MessageSquare,
    ctaLabel: 'Xem bài làm & nhận xét',
  },
  ASSIGNMENT_SUBMITTED: {
    badge: 'Nộp bài tập',
    category: 'ASSIGNMENT',
    icon: FileText,
    ctaLabel: 'Chấm & nhận xét trong lớp học',
  },
  CLASSROOM: {
    badge: 'Lớp học',
    category: 'CLASSROOM',
    icon: GraduationCap,
    ctaLabel: 'Mở không gian lớp học',
  },
  CLASSROOM_JOIN_REQUEST: {
    badge: 'Yêu cầu vào lớp',
    category: 'CLASSROOM',
    icon: GraduationCap,
    ctaLabel: 'Duyệt thành viên trong lớp học',
  },
  CLASSROOM_MEMBER_APPROVED: {
    badge: 'Đã duyệt vào lớp',
    category: 'CLASSROOM',
    icon: GraduationCap,
    ctaLabel: 'Truy cập lớp học ngay',
  },
  CLASSROOM_MEMBER_STATUS: {
    badge: 'Thành viên lớp học',
    category: 'CLASSROOM',
    icon: GraduationCap,
    ctaLabel: 'Xem danh sách lớp học',
  },
  CLASSROOM_MATERIAL: {
    badge: 'Tài liệu lớp mới',
    category: 'CLASSROOM',
    icon: BookOpen,
    ctaLabel: 'Xem & tải tài liệu PDF',
  },
  PAYMENT: {
    badge: 'Thanh toán VNPAY',
    category: 'PAYMENT',
    icon: CreditCard,
    ctaLabel: 'Xem thông tin giao dịch',
  },
  TEST_VIP_PURCHASE: {
    badge: 'Mở khóa đề VIP',
    category: 'PAYMENT',
    icon: CreditCard,
    ctaLabel: 'Vào luyện đề VIP ngay',
  },
  TEACHER_APPLICATION_PAYMENT: {
    badge: 'Phí đăng ký giáo viên',
    category: 'PAYMENT',
    icon: CreditCard,
    ctaLabel: 'Xem trạng thái hồ sơ giáo viên',
  },
  TEACHER_APPLICATION: {
    badge: 'Hồ sơ giáo viên',
    category: 'SYSTEM',
    icon: GraduationCap,
    ctaLabel: 'Xem chi tiết hồ sơ',
  },
  TEACHER_APPLICATION_SUBMITTED: {
    badge: 'Duyệt giáo viên',
    category: 'SYSTEM',
    icon: ShieldCheck,
    ctaLabel: 'Mở trang duyệt hồ sơ giáo viên',
  },
  ACCOUNT_SECURITY: {
    badge: 'Bảo mật tài khoản',
    category: 'SYSTEM',
    icon: ShieldCheck,
    ctaLabel: 'Kiểm tra hồ sơ cá nhân',
  },
  COMMENT_MODERATED: {
    badge: 'Thảo luận đề thi',
    category: 'SYSTEM',
    icon: MessageSquare,
    ctaLabel: 'Mở trang đề thi',
  },
  WELCOME: {
    badge: 'Chào mừng',
    category: 'SYSTEM',
    icon: BookOpen,
    ctaLabel: 'Khám phá thư viện đề thi TOEIC',
  },
  SYSTEM: {
    badge: 'Hệ thống',
    category: 'SYSTEM',
    icon: Bell,
    ctaLabel: 'Xem nội dung liên quan',
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
  if (link.startsWith('/results/')) return 'Xem kết quả & lời giải chi tiết';
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
    <div className="notifications-page min-h-screen bg-[#F8FAFC] text-[#111827] pb-16">
      <Toast
        type={toast?.type}
        message={toast?.message}
        onClose={() => setToast(null)}
      />

      {/* Editorial Header Banner with Photo Background */}
      <section
        className="relative overflow-hidden border-b border-[#CBD5E1]"
        style={{
          backgroundImage: `linear-gradient(120deg, rgba(255, 255, 255, 0.90) 0%, rgba(248, 250, 252, 0.80) 48%, rgba(241, 245, 249, 0.92) 100%), url("${headerBgImage}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 42%',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-2 rounded-[2px] border border-[#BFDBFE] bg-white/90 px-3 py-1 text-xs font-semibold text-[#1D4ED8] backdrop-blur-sm">
                <Bell size={14} />
                <span>Hộp thư thông báo cá nhân</span>
              </div>
              <h1
                className="text-3xl font-semibold tracking-tight text-[#111111] sm:text-4xl"
                style={{
                  textShadow: '0 1px 10px rgba(255, 255, 255, 0.9)',
                }}
              >
                Thông báo
              </h1>
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
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
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
                  const Icon = tab.icon;
                  const isActive = category === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => handleSelectCategory(tab.key)}
                      className={`flex min-h-[40px] w-full items-center justify-between gap-2.5 rounded-[2px] border px-3 py-2 text-left text-sm font-semibold transition-colors ${isActive
                        ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white'
                        : 'border-transparent bg-white text-[#374151] hover:border-[#D1D5DB] hover:bg-[#F8FAFC] hover:text-[#1D4ED8]'
                        }`}
                    >
                      <span className="inline-flex items-center gap-2.5">
                        <Icon size={16} className="shrink-0" />
                        <span>{tab.label}</span>
                      </span>
                      {tab.key === 'ALL' && (
                        <span
                          className={`rounded-[2px] px-1.5 py-0.5 text-xs font-semibold tabular-nums ${isActive
                            ? 'bg-white/20 text-white'
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
                  <span className="inline-flex items-center gap-2">
                    <Filter size={14} />
                    <span>Chỉ hiện chưa đọc</span>
                  </span>
                  <span className="rounded-[2px] bg-[#EFF6FF] px-1.5 py-0.5 text-xs font-semibold text-[#1D4ED8] tabular-nums">
                    {unreadCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  disabled={unreadCount === 0 || bulkBusy}
                  className="flex min-h-[38px] w-full items-center justify-center gap-1.5 rounded-[2px] border border-[#1D4ED8] bg-[#1D4ED8] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1E40AF] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckCheck size={15} />
                  <span>Đánh dấu tất cả đã đọc</span>
                </button>

                <button
                  type="button"
                  onClick={() => fetchNotifications()}
                  disabled={loading}
                  className="flex min-h-[38px] w-full items-center justify-center gap-1.5 rounded-[2px] border border-[#D1D5DB] bg-white px-3 py-2 text-xs font-semibold text-[#374151] transition-colors hover:border-[#1D4ED8] hover:text-[#1D4ED8] disabled:opacity-50"
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin text-[#1D4ED8]' : ''} />
                  <span>Làm mới danh sách</span>
                </button>

                {readTotalCount > 0 && (
                  <button
                    type="button"
                    onClick={handleDeleteReadNotifications}
                    disabled={bulkBusy}
                    className="flex min-h-[38px] w-full items-center justify-center gap-1.5 rounded-[2px] border border-[#D1D5DB] bg-white px-3 py-2 text-xs font-semibold text-[#4B5563] transition-colors hover:border-[#DC2626] hover:text-[#DC2626] disabled:opacity-50"
                    title="Xóa toàn bộ các thông báo đã đọc để dọn gọn hộp thư"
                  >
                    <Trash2 size={14} />
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
              <div className="rounded-[2px] border border-[#D1D5DB] bg-white p-12 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-[2px] border border-[#D1D5DB] bg-[#F8FAFC] text-[#4B5563]">
                  <Bell size={22} />
                </div>
                <h2 className="text-lg font-semibold text-[#111111]">
                  {unreadOnly
                    ? 'Không có thông báo chưa đọc nào'
                    : category !== 'ALL'
                      ? 'Chưa có thông báo nào trong mục này'
                      : 'Hộp thư thông báo của bạn đang trống'}
                </h2>
                <p className="mx-auto mt-1.5 max-w-lg text-sm leading-relaxed text-[#4B5563]">
                  {unreadOnly
                    ? 'Bạn đã đọc hết tất cả thông báo trong danh mục này. Nhấn xem toàn bộ thông báo để tra cứu lịch sử cũ.'
                    : 'Khi bạn hoàn thành bài thi TOEIC, nhận bài tập hoặc tài liệu từ lớp học, hoặc thực hiện giao dịch mở khóa đề VIP, thông báo chi tiết sẽ xuất hiện tại đây.'}
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
                  <Link
                    to="/courses"
                    className="inline-flex min-h-[38px] items-center gap-1.5 rounded-[2px] border border-[#1D4ED8] bg-[#1D4ED8] px-4 py-2 text-xs font-semibold text-white no-underline hover:bg-[#1E40AF]"
                  >
                    <BookOpen size={14} />
                    <span>Vào thư viện đề thi TOEIC</span>
                  </Link>
                </div>
              </div>
            ) : items.length > 0 ? (
              /* Notification List */
              <div className="space-y-3">
                {items.map((item) => {
                  const id = item.id || item.notificationId;
                  const isRead = Boolean(item.read ?? item.isRead);
                  const targetLink = item.link || item.referenceUrl || '';
                  const meta = getMetaForNotification(item);
                  const IconComponent = meta.icon || Bell;
                  const ctaText = resolveCtaLabel(item, meta);
                  const { absolute, relative } = formatNotificationTimestamp(item.createdAt);
                  const isBusy = actionBusyId === id;

                  return (
                    <article
                      key={id}
                      className={`rounded-[2px] border p-5 transition-colors ${isRead
                        ? 'border-[#D1D5DB] bg-white hover:border-[#9CA3AF]'
                        : 'border-[#BFDBFE] border-l-[3px] border-l-[#1D4ED8] bg-[#EFF6FF]/65'
                        }`}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-3.5 min-w-0 flex-1">
                          {/* Icon Box */}
                          <div
                            className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[2px] border ${isRead
                              ? 'border-[#D1D5DB] bg-[#F8FAFC] text-[#4B5563]'
                              : 'border-[#BFDBFE] bg-white text-[#1D4ED8]'
                              }`}
                            aria-hidden="true"
                          >
                            <IconComponent size={18} />
                          </div>

                          {/* Content Column */}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`inline-flex items-center rounded-[2px] border px-2 py-0.5 text-xs font-semibold ${isRead
                                  ? 'border-[#D1D5DB] bg-[#F8FAFC] text-[#374151]'
                                  : 'border-[#BFDBFE] bg-white text-[#1D4ED8]'
                                  }`}
                              >
                                {meta.badge}
                              </span>

                              {!isRead && (
                                <span className="inline-flex items-center gap-1 rounded-[2px] border border-[#1D4ED8] bg-[#1D4ED8] px-2 py-0.5 text-[11px] font-semibold text-white">
                                  Chưa đọc
                                </span>
                              )}

                              {absolute && (
                                <span className="inline-flex items-center gap-1 text-xs text-[#6B7280] tabular-nums">
                                  <Clock size={12} className="shrink-0" />
                                  <span>{absolute}</span>
                                  {relative && <span>· {relative}</span>}
                                </span>
                              )}
                            </div>

                            <h2
                              className={`mt-2 text-lg leading-snug ${isRead ? 'font-medium text-[#111827]' : 'font-semibold text-[#111111]'
                                }`}
                            >
                              {item.title}
                            </h2>

                            <p className="mt-1 whitespace-pre-wrap text-[15px] leading-relaxed text-[#374151]">
                              {item.content}
                            </p>

                            {targetLink && (
                              <div className="mt-3">
                                <Link
                                  to={targetLink}
                                  onClick={() => {
                                    if (!isRead) {
                                      handleMarkRead(id, { silentToast: true });
                                    }
                                  }}
                                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1D4ED8] hover:text-[#1E40AF] hover:underline"
                                >
                                  <span>{ctaText}</span>
                                  <ArrowRight size={14} />
                                </Link>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Item Actions */}
                        <div className="flex shrink-0 items-center gap-2 self-end sm:self-start">
                          {!isRead && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleMarkRead(id)}
                              className="inline-flex min-h-[34px] items-center gap-1.5 rounded-[2px] border border-[#D1D5DB] bg-white px-3 py-1.5 text-xs font-semibold text-[#111827] transition-colors hover:border-[#1D4ED8] hover:text-[#1D4ED8] disabled:opacity-50"
                              title="Đánh dấu thông báo này là đã đọc"
                            >
                              <Check size={13} className="text-[#1D4ED8]" />
                              <span>Đã đọc</span>
                            </button>
                          )}

                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleDeleteNotification(id)}
                            className="inline-flex min-h-[34px] items-center gap-1 rounded-[2px] border border-[#D1D5DB] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#6B7280] transition-colors hover:border-[#DC2626] hover:text-[#DC2626] disabled:opacity-50"
                            title="Xóa thông báo này"
                            aria-label={`Xóa thông báo: ${item.title}`}
                          >
                            <Trash2 size={13} />
                            <span className="sm:hidden">Xóa</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pt-4">
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
  );
};

export default NotificationsPage;
