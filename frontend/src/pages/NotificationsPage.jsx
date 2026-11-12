import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bell, CheckCheck, RefreshCw } from 'lucide-react';
import { notificationService } from '../services/notificationService';

const TYPE_BADGE = {
  TEACHER_APPLICATION: 'Hồ sơ giáo viên',
  CLASSROOM: 'Lớp học',
  ASSIGNMENT: 'Bài tập',
  PAYMENT: 'Thanh toán VNPAY',
  SYSTEM: 'Hệ thống',
};

const NotificationsPage = () => {
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const [listResponse, countResponse] = await Promise.all([
        notificationService.getMyNotifications(),
        notificationService.getUnreadCount(),
      ]);
      if (listResponse.code === 1000) {
        setItems(Array.isArray(listResponse.data) ? listResponse.data : []);
      }
      if (countResponse.code === 1000) {
        setUnreadCount(countResponse.data?.unreadCount || 0);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải thông báo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      await loadNotifications();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể đánh dấu đã đọc.');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      await loadNotifications();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể đánh dấu tất cả đã đọc.');
    }
  };

  return (
    <main className="notifications-page min-h-screen bg-white px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 border-b border-slate-200 pb-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="editorial-eyebrow inline-flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-widest text-[#1D4ED8]">
                <Bell size={14} /> HỘP THƯ THÔNG BÁO
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900 sm:text-4xl">
                Thông báo hệ thống
              </h1>
              <p className="mt-2 text-base text-slate-600">
                Hiện có <strong className="font-mono text-slate-900">{unreadCount}</strong> thông báo chưa đọc về lớp học, bài tập, thanh toán và hồ sơ tài khoản.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={loadNotifications}
                disabled={loading}
                className="inline-flex min-h-[40px] items-center gap-2 border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
              >
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                Làm mới
              </button>
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={unreadCount === 0}
                className="inline-flex min-h-[40px] items-center gap-2 border border-[#1D4ED8] bg-[#1D4ED8] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#173ea8] disabled:opacity-50"
              >
                <CheckCheck size={16} />
                Đánh dấu tất cả đã đọc
              </button>
            </div>
          </div>
        </header>

        {error && (
          <div role="alert" className="mb-6 border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
            {error}
          </div>
        )}

        {loading ? (
          <div className="border border-slate-200 bg-slate-50/70 p-10 text-center text-sm text-slate-600" role="status">
            Đang tải danh sách thông báo...
          </div>
        ) : items.length === 0 ? (
          <div className="border border-slate-200 bg-slate-50/50 p-12 text-center">
            <Bell size={28} className="mx-auto mb-3 text-slate-400" />
            <p className="text-base font-semibold text-slate-800">Bạn chưa có thông báo nào</p>
            <p className="mt-1 text-sm text-slate-500">
              Các thông báo mới về lớp học, chấm bài tập, duyệt hồ sơ giáo viên và giao dịch sẽ xuất hiện tại đây.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <article
                key={item.notificationId}
                className={`border p-5 transition-colors ${
                  item.isRead
                    ? 'border-slate-200 bg-white'
                    : 'border-l-4 border-slate-300 border-l-[#1D4ED8] bg-[#EFF6FF]/40'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="border border-slate-300 bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-700">
                        {TYPE_BADGE[item.type] || item.type}
                      </span>
                      {!item.isRead && (
                        <span className="border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-[#1D4ED8]">
                          Mới
                        </span>
                      )}
                      <span className="font-mono text-xs text-slate-500">
                        {item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : ''}
                      </span>
                    </div>
                    <h2 className="mt-2.5 text-lg font-semibold text-slate-900">{item.title}</h2>
                    <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                      {item.content}
                    </p>
                    {item.referenceUrl && (
                      <Link
                        to={item.referenceUrl}
                        onClick={() => !item.isRead && handleMarkRead(item.notificationId)}
                        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1D4ED8] hover:underline"
                      >
                        Mở nội dung liên quan <ArrowRight size={14} />
                      </Link>
                    )}
                  </div>

                  {!item.isRead && (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(item.notificationId)}
                      className="border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
                    >
                      Đã đọc
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default NotificationsPage;
