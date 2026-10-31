import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, CheckCheck, LoaderCircle } from 'lucide-react';
import { notificationService } from '../services/notificationService';

const formatVietnamDateTime = (value) => {
  if (!value) return '';
  const hasZone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(value);
  const date = new Date(hasZone ? value : `${value}+07:00`);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(date);
};

const NotificationsPage = () => {
  const [items, setItems] = useState([]);
  const [pageInfo, setPageInfo] = useState({ pageNumber: 1, pageSize: 20, totalElements: 0, totalPages: 0, isFirst: true, isLast: true });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const loadPage = async () => {
      setLoading(true); setError('');
      try {
        const response = await notificationService.getMine({ page, size: 20 });
        if (response.code !== 1000) throw new Error(response.message || 'Không tải được thông báo.');
        if (active) {
          const data = response.data || {};
          setItems(data.content || []);
          setPageInfo({ pageNumber: data.pageNumber || page, pageSize: data.pageSize || 20, totalElements: data.totalElements || 0, totalPages: data.totalPages || 0, isFirst: Boolean(data.isFirst), isLast: Boolean(data.isLast) });
        }
      } catch (err) {
        if (active) setError(err.response?.data?.message || err.message || 'Không tải được thông báo.');
      } finally { if (active) setLoading(false); }
    };
    loadPage();
    return () => { active = false; };
  }, [page]);

  const markRead = async (item) => {
    if (item.read) return;
    setBusy(true);
    try {
      const response = await notificationService.markRead(item.id);
      if (response.code === 1000) setItems((list) => list.map((entry) => entry.id === item.id ? { ...entry, read: true } : entry));
    } catch (err) { setError(err.response?.data?.message || 'Không cập nhật được thông báo.'); }
    finally { setBusy(false); }
  };

  const markAllRead = async () => {
    setBusy(true);
    try {
      const response = await notificationService.markAllRead();
      if (response.code === 1000) setItems((list) => list.map((item) => ({ ...item, read: true })));
    } catch (err) { setError(err.response?.data?.message || 'Không cập nhật được thông báo.'); }
    finally { setBusy(false); }
  };

  return (
    <main className="min-h-[70vh] bg-[#fffdf5] px-4 py-10 text-slate-950 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <header className="mb-7 flex flex-wrap items-end justify-between gap-4 border-2 border-black bg-[#d7f36b] p-6 shadow-[5px_5px_0_#111]">
          <div><p className="flex items-center gap-2 text-xs font-black uppercase tracking-widest"><Bell size={17} /> Cập nhật của bạn</p><h1 className="mt-2 text-3xl font-black">Thông báo</h1></div>
          <button type="button" disabled={busy} onClick={markAllRead} className="inline-flex items-center gap-2 border-2 border-black bg-white px-3 py-2 text-sm font-black disabled:opacity-50"><CheckCheck size={16} /> Đánh dấu đã đọc</button>
        </header>
        {error && <div role="alert" className="mb-4 border-2 border-black bg-rose-200 p-3 font-bold">{error}</div>}
        {loading ? <div className="flex justify-center py-14"><LoaderCircle className="animate-spin" /></div> : items.length === 0 ? <div className="border-2 border-dashed border-black bg-white p-10 text-center font-bold">Bạn chưa có thông báo.</div> : (
          <div className="space-y-3">{items.map((item) => <article key={item.id} className={`border-2 border-black p-5 shadow-[3px_3px_0_#111] ${item.read ? 'bg-white' : 'bg-sky-100'}`}>
            <div className="flex items-start justify-between gap-4"><div><h2 className="font-black">{item.title}</h2><p className="mt-1 whitespace-pre-wrap text-sm">{item.content}</p><time dateTime={item.createdAt || undefined} className="mt-2 block text-xs font-semibold text-slate-600">{formatVietnamDateTime(item.createdAt)}</time></div>{!item.read && <span className="h-3 w-3 flex-none rounded-full border border-black bg-[#d7f36b]" aria-label="Chưa đọc" />}</div>
            <div className="mt-3 flex flex-wrap gap-3">{item.link && <Link to={item.link} onClick={() => markRead(item)} className="font-black underline underline-offset-2">Mở nội dung</Link>}{!item.read && <button type="button" disabled={busy} onClick={() => markRead(item)} className="inline-flex items-center gap-1 text-sm font-bold disabled:opacity-50"><Check size={14} /> Đánh dấu đã đọc</button>}</div>
          </article>)}</div>
        )}
        {!loading && pageInfo.totalPages > 1 && <nav className="mt-6 flex items-center justify-between gap-3 border-2 border-black bg-white p-3 shadow-[3px_3px_0_#111]" aria-label="Phân trang thông báo"><button type="button" disabled={pageInfo.pageNumber <= 1 || busy} onClick={() => setPage((current) => Math.max(1, current - 1))} className="border-2 border-black bg-[#FFE600] px-3 py-2 text-sm font-black disabled:opacity-50">Trang trước</button><span className="text-sm font-bold" aria-live="polite">Trang {pageInfo.pageNumber} / {pageInfo.totalPages} · {pageInfo.totalElements} thông báo</span><button type="button" disabled={pageInfo.pageNumber >= pageInfo.totalPages || busy} onClick={() => setPage((current) => Math.min(pageInfo.totalPages, current + 1))} className="border-2 border-black bg-[#FFE600] px-3 py-2 text-sm font-black disabled:opacity-50">Trang sau</button></nav>}
      </div>
    </main>
  );
};

export default NotificationsPage;
