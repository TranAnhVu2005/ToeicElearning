import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, BarChart3, ChevronLeft, ChevronRight, RefreshCw, Users } from 'lucide-react';
import { adminService } from '../../services/adminService';

const REPORTING_TIME_ZONE = 'Asia/Ho_Chi_Minh';
const formatReportingDate = (date) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
  timeZone: REPORTING_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
};
const shiftDate = (date, days) => {
  const shifted = new Date(`${date}T00:00:00Z`);
  shifted.setUTCDate(shifted.getUTCDate() + days);
  return shifted.toISOString().slice(0, 10);
};

const AdminDashboardPage = () => {
  const today = useMemo(() => formatReportingDate(new Date()), []);
  const [from, setFrom] = useState(() => shiftDate(today, -13));
  const [to, setTo] = useState(today);
  const [overview, setOverview] = useState(null);
  const [metricsRefresh, setMetricsRefresh] = useState(0);
  const [metricsState, setMetricsState] = useState({ key: '', daily: [], error: '' });
  const [auditPage, setAuditPage] = useState(1);
  const [auditRetry, setAuditRetry] = useState(0);
  const [auditState, setAuditState] = useState({ key: '', data: null, error: '' });
  const metricsRequestKey = `${from}/${to}/${metricsRefresh}`;
  const auditRequestKey = `${auditPage}/${auditRetry}`;

  const loadOverview = useCallback(async (updateState = true) => {
    const response = await adminService.getMetricsOverview();
    if (response.code !== 1000 || !response.data) throw new Error(response.message || 'Không tải được tổng quan.');
    if (updateState) setOverview(response.data);
    return response.data;
  }, []);

  const loadDaily = useCallback(async () => {
    if (!from || !to || from > to) throw new Error('Khoảng ngày không hợp lệ.');
    const response = await adminService.getDailyTestMetrics(from, to);
    if (response.code !== 1000 || !Array.isArray(response.data)) throw new Error(response.message || 'Không tải được số lượt làm bài.');
    return response.data;
  }, [from, to]);

  useEffect(() => {
    let active = true;
    Promise.all([loadOverview(false), loadDaily()])
      .then(([nextOverview, nextDaily]) => {
        if (!active) return;
        setOverview(nextOverview);
        setMetricsState({ key: metricsRequestKey, daily: nextDaily, error: '' });
      })
      .catch((err) => {
        if (!active) return;
        setMetricsState({
          key: metricsRequestKey,
          daily: [],
          error: err.response?.data?.message || err.message || 'Không thể tải dữ liệu dashboard.',
        });
      });
    return () => { active = false; };
  }, [loadDaily, loadOverview, metricsRequestKey]);
  useEffect(() => {
    const interval = window.setInterval(() => loadOverview().catch(() => {}), 60_000);
    return () => window.clearInterval(interval);
  }, [loadOverview]);

  useEffect(() => {
    let active = true;
    adminService.getAuditEvents(auditPage, 20)
      .then((response) => {
        if (!active) return;
        if (response.code !== 1000 || !response.data) throw new Error(response.message || 'Không tải được nhật ký quản trị.');
        setAuditState({ key: auditRequestKey, data: response.data, error: '' });
      })
      .catch((err) => {
        if (active) setAuditState({
          key: auditRequestKey,
          data: null,
          error: err.response?.data?.message || err.message || 'Không tải được nhật ký quản trị.',
        });
      });
    return () => { active = false; };
  }, [auditPage, auditRequestKey]);

  const loading = metricsState.key !== metricsRequestKey;
  const refreshing = loading && metricsRefresh > 0;
  const error = loading ? '' : metricsState.error;
  const daily = loading ? [] : metricsState.daily;
  const auditLoading = auditState.key !== auditRequestKey;
  const auditError = auditLoading ? '' : auditState.error;
  const currentAuditData = auditLoading ? null : auditState.data;

  const maxCount = Math.max(1, ...daily.flatMap((item) => [Number(item.startedAttempts || 0), Number(item.submittedAttempts || 0)]));

  return (
    <main className="min-h-[70vh] bg-[#fffdf2] px-4 py-8 text-[#111] sm:px-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4 border-2 border-black bg-[#FFE600] p-5 shadow-[5px_5px_0_#111] sm:p-7">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest"><Activity size={17} /> Khu vực quản trị</div>
            <h1 className="mt-2 text-3xl font-black sm:text-4xl">Tổng quan hoạt động</h1>
            <p className="mt-2 max-w-2xl font-semibold">Theo dõi hiện diện gần đây và các lượt làm bài đã được máy chủ ghi nhận.</p>
          </div>
          <button type="button" onClick={() => setMetricsRefresh((version) => version + 1)} disabled={refreshing} className="inline-flex min-h-11 items-center gap-2 border-2 border-black bg-white px-4 py-2 font-black shadow-[3px_3px_0_#111] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-60">
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} /> Làm mới
          </button>
        </header>
        {overview?.generatedAt && <p className="mb-5 text-right text-xs font-bold">Cập nhật lúc {overview.generatedAt.replace('T', ' ')} ({overview.timeZone || 'Asia/Ho_Chi_Minh'})</p>}

        {error && <div role="alert" className="mb-5 border-2 border-black bg-rose-200 p-4 font-bold">{error}</div>}

        <section aria-label="Chỉ số hiện tại" className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <article className="border-2 border-black bg-white p-5 shadow-[4px_4px_0_#111]">
            <div className="flex items-center gap-2 text-sm font-black uppercase"><Users size={18} /> Đang hoạt động</div>
            <p className="mt-3 text-4xl font-black tabular-nums">{loading ? '—' : overview?.activeUsers ?? 0}</p>
            <p className="mt-2 text-sm font-semibold">Có heartbeat trong {overview?.activeWindowMinutes ?? 5} phút gần nhất; tính tài khoản chưa bị khóa.</p>
          </article>
          <article className="border-2 border-black bg-[#FFE600] p-5 text-black shadow-[4px_4px_0_#111]">
            <div className="flex items-center gap-2 text-sm font-black uppercase"><Activity size={18} /> Lượt bắt đầu hôm nay</div>
            <p className="mt-3 text-4xl font-black tabular-nums">{loading ? '—' : overview?.startedAttemptsToday ?? 0}</p>
            <p className="mt-2 text-sm font-semibold">Đếm session mới được tạo trong ngày; resume session không tính thêm.</p>
          </article>
          <article className="border-2 border-black bg-[#FF5B93] p-5 text-black shadow-[4px_4px_0_#111]">
            <div className="flex items-center gap-2 text-sm font-black uppercase"><BarChart3 size={18} /> Lượt đã nộp hôm nay</div>
            <p className="mt-3 text-4xl font-black tabular-nums">{loading ? '—' : overview?.submittedAttemptsToday ?? 0}</p>
            <p className="mt-2 text-sm font-semibold">Ngày {overview?.reportingDate || today}, múi giờ {overview?.timeZone || 'Asia/Ho_Chi_Minh'}.</p>
          </article>
        </section>

        <section aria-labelledby="audit-title" className="mb-6 border-2 border-black bg-white shadow-[4px_4px_0_#111]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black bg-[#f1eedf] p-4 sm:p-5">
            <div><h2 id="audit-title" className="text-xl font-black">Nhật ký thao tác nhạy cảm</h2><p className="mt-1 text-sm font-semibold">Ghi nhận khóa tài khoản, duyệt giáo viên và trạng thái thanh toán từ VNPAY.</p></div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setAuditPage((page) => Math.max(1, page - 1))} disabled={auditLoading || auditPage <= 1} aria-label="Trang nhật ký trước" className="flex min-h-11 min-w-11 items-center justify-center border-2 border-black bg-white shadow-[2px_2px_0_#111] focus-visible:outline focus-visible:outline-4 focus-visible:outline-[#FF5B93] disabled:opacity-50"><ChevronLeft size={18} /></button>
              <span className="min-w-20 text-center text-sm font-black">{currentAuditData ? `${currentAuditData.pageNumber}/${Math.max(1, currentAuditData.totalPages)}` : `${auditPage}/…`}</span>
              <button type="button" onClick={() => setAuditPage((page) => page + 1)} disabled={auditLoading || !currentAuditData || currentAuditData.isLast} aria-label="Trang nhật ký tiếp" className="flex min-h-11 min-w-11 items-center justify-center border-2 border-black bg-[#FFE600] shadow-[2px_2px_0_#111] focus-visible:outline focus-visible:outline-4 focus-visible:outline-[#FF5B93] disabled:opacity-50"><ChevronRight size={18} /></button>
            </div>
          </div>
          {auditError && <div role="alert" className="m-4 flex flex-wrap items-center justify-between gap-3 border-2 border-black bg-rose-200 p-3 font-bold"><span>{auditError}</span><button type="button" onClick={() => setAuditRetry((retry) => retry + 1)} className="min-h-10 border-2 border-black bg-white px-3 shadow-[2px_2px_0_#111] focus-visible:outline focus-visible:outline-4 focus-visible:outline-[#FF5B93]">Thử lại</button></div>}
          {auditLoading ? <p className="p-8 text-center font-bold" role="status">Đang tải nhật ký…</p> : currentAuditData?.content?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead className="bg-[#FFE600] text-xs font-black uppercase"><tr><th scope="col" className="border-b-2 border-black p-3">Thời điểm</th><th scope="col" className="border-b-2 border-black p-3">Thao tác</th><th scope="col" className="border-b-2 border-black p-3">Đối tượng</th><th scope="col" className="border-b-2 border-black p-3">Tài khoản thực hiện</th><th scope="col" className="border-b-2 border-black p-3">Thay đổi</th></tr></thead>
                <tbody>{currentAuditData.content.map((event) => <tr key={event.id} className="odd:bg-white even:bg-[#fffdf2]"><td className="border-b border-black/20 p-3 whitespace-nowrap">{event.occurredAtUtc?.replace('T', ' ') || '—'} UTC</td><td className="border-b border-black/20 p-3 font-black">{event.action}</td><td className="border-b border-black/20 p-3">{event.targetType} · <span className="font-mono text-xs">{event.targetId}</span></td><td className="border-b border-black/20 p-3 font-mono text-xs">{event.actorUserId || 'Hệ thống'}</td><td className="border-b border-black/20 p-3">{event.details || event.outcome}</td></tr>)}</tbody>
              </table>
            </div>
          ) : !auditError && currentAuditData ? <p className="p-8 text-center font-bold">Chưa có thao tác nào được ghi nhận.</p> : null}
          <footer className="border-t-2 border-black px-4 py-3 text-xs font-semibold">Nhật ký hiện bao phủ một phần các thao tác; chưa bao gồm đăng nhập, quản trị đề và lớp học.</footer>
        </section>

        <section className="border-2 border-black bg-white shadow-[4px_4px_0_#111]">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-black p-4 sm:p-5">
            <div><h2 className="text-xl font-black">Lượt bắt đầu và nộp theo ngày</h2><p className="mt-1 text-sm font-semibold">Bắt đầu đếm session mới; nộp đếm kết quả đã lưu. Resume session không tạo lượt bắt đầu mới.</p></div>
            <div className="flex flex-wrap items-end gap-3">
              <label className="text-xs font-black uppercase">Từ ngày<input type="date" value={from} max={to || today} onChange={(event) => setFrom(event.target.value)} className="mt-1 block min-h-10 border-2 border-black bg-white px-2 text-sm font-semibold" /></label>
              <label className="text-xs font-black uppercase">Đến ngày<input type="date" value={to} min={from} max={today} onChange={(event) => setTo(event.target.value)} className="mt-1 block min-h-10 border-2 border-black bg-white px-2 text-sm font-semibold" /></label>
            </div>
          </div>
          {loading ? <p className="p-8 text-center font-bold" role="status">Đang tải số liệu…</p> : error ? <p className="p-8 text-center font-bold text-rose-800" role="alert">Không thể tải chuỗi số liệu cho khoảng ngày này.</p> : daily.length === 0 ? <p className="p-8 text-center font-bold">Không có dữ liệu trong khoảng ngày này.</p> : (
            <div className="space-y-3 p-4 sm:p-5">
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-black uppercase" aria-label="Chú giải biểu đồ">
                <span className="inline-flex items-center gap-2"><span aria-hidden="true" className="h-3 w-3 border border-black bg-[#FFE600]" /> Bắt đầu</span>
                <span className="inline-flex items-center gap-2"><span aria-hidden="true" className="h-3 w-3 border border-black bg-[#FF5B93]" /> Đã nộp</span>
              </div>
              {daily.map((item) => {
                const started = Number(item.startedAttempts || 0);
                const submitted = Number(item.submittedAttempts || 0);
                const dateLabel = new Intl.DateTimeFormat('vi-VN', {
                  timeZone: REPORTING_TIME_ZONE,
                  day: '2-digit',
                  month: '2-digit',
                }).format(new Date(`${item.date}T00:00:00Z`));
                const rows = [
                  { label: 'Bắt đầu', count: started, color: 'bg-[#FFE600]' },
                  { label: 'Đã nộp', count: submitted, color: 'bg-[#FF5B93]' },
                ];
                return <div key={item.date} className="grid grid-cols-[54px_1fr] items-center gap-x-3 gap-y-2 text-sm sm:grid-cols-[76px_1fr] sm:gap-x-4">
                  <time dateTime={item.date} className="row-span-2 font-bold">{dateLabel}</time>
                  {rows.map((row) => <div key={row.label} className="grid grid-cols-[60px_1fr_36px] items-center gap-2 sm:grid-cols-[76px_1fr_44px]">
                    <span className="text-xs font-semibold">{row.label}</span>
                    <div className="h-5 border-2 border-black bg-[#f1eedf]" role="img" aria-label={`${row.label}: ${row.count}`}>
                      <div className={`h-full min-w-0 ${row.color}`} style={{ width: `${row.count === 0 ? 0 : Math.max(2, (row.count / maxCount) * 100)}%` }} />
                    </div>
                    <span className="text-right font-black tabular-nums">{row.count}</span>
                  </div>)}
                </div>;
              })}
            </div>
          )}
          <footer className="border-t-2 border-black bg-[#f1eedf] px-4 py-3 text-xs font-semibold sm:px-5">Chỉ trả số liệu tổng hợp, không có danh tính học viên, đáp án hay nội dung bài làm.</footer>
        </section>
      </div>
    </main>
  );
};

export default AdminDashboardPage;
