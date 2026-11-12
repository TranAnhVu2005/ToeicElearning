import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, BarChart3, ChevronLeft, ChevronRight, RefreshCw, Users } from 'lucide-react';
import { adminService } from '../../services/adminService';
import AdminNavTabs from '../../components/common/AdminNavTabs';

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
    if (response.code !== 1000 || !Array.isArray(response.data)) {
      throw new Error(response.message || 'Không tải được số lượt làm bài.');
    }
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
    return () => {
      active = false;
    };
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
        if (active) {
          setAuditState({
            key: auditRequestKey,
            data: null,
            error: err.response?.data?.message || err.message || 'Không tải được nhật ký quản trị.',
          });
        }
      });
    return () => {
      active = false;
    };
  }, [auditPage, auditRequestKey]);

  const loading = metricsState.key !== metricsRequestKey;
  const refreshing = loading && metricsRefresh > 0;
  const error = loading ? '' : metricsState.error;
  const daily = loading ? [] : metricsState.daily;
  const auditLoading = auditState.key !== auditRequestKey;
  const auditError = auditLoading ? '' : auditState.error;
  const currentAuditData = auditLoading ? null : auditState.data;

  const maxCount = Math.max(
    1,
    ...daily.flatMap((item) => [Number(item.startedAttempts || 0), Number(item.submittedAttempts || 0)])
  );

  return (
    <main className="admin-page min-h-screen bg-white px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-widest text-[#1D4ED8]">
              <Activity size={16} /> Khu vực quản trị
            </div>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Tổng quan hoạt động</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Theo dõi hiện diện gần đây, nhật ký thao tác và các lượt làm bài đã được máy chủ ghi nhận.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMetricsRefresh((version) => version + 1)}
            disabled={refreshing}
            className="editorial-button-secondary inline-flex min-h-10 items-center gap-2 px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} /> Làm mới
          </button>
        </header>

        <AdminNavTabs />

        {overview?.generatedAt && (
          <p className="mb-4 text-right font-mono text-xs text-slate-500">
            Cập nhật lúc {overview.generatedAt.replace('T', ' ')} ({overview.timeZone || 'Asia/Ho_Chi_Minh'})
          </p>
        )}

        {error && (
          <div role="alert" className="mb-5 border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
            {error}
          </div>
        )}

        <section aria-label="Chỉ số hiện tại" className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <article className="border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <Users size={16} className="text-[#1D4ED8]" /> Đang hoạt động
            </div>
            <p className="mt-3 font-mono text-4xl font-bold tabular-nums text-slate-900">
              {loading ? '—' : overview?.activeUsers ?? 0}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Có heartbeat trong {overview?.activeWindowMinutes ?? 5} phút gần nhất; tính tài khoản chưa bị khóa.
            </p>
          </article>

          <article className="border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <Activity size={16} className="text-[#1D4ED8]" /> Lượt bắt đầu hôm nay
            </div>
            <p className="mt-3 font-mono text-4xl font-bold tabular-nums text-[#1D4ED8]">
              {loading ? '—' : overview?.startedAttemptsToday ?? 0}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Đếm session mới được tạo trong ngày; resume session không tính thêm.
            </p>
          </article>

          <article className="border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <BarChart3 size={16} className="text-[#1D4ED8]" /> Lượt đã nộp hôm nay
            </div>
            <p className="mt-3 font-mono text-4xl font-bold tabular-nums text-slate-900">
              {loading ? '—' : overview?.submittedAttemptsToday ?? 0}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Ngày {overview?.reportingDate || today}, múi giờ {overview?.timeZone || 'Asia/Ho_Chi_Minh'}.
            </p>
          </article>
        </section>

        <section aria-labelledby="audit-title" className="mb-8 border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-[#F8FAFC] p-4 sm:p-5">
            <div>
              <h2 id="audit-title" className="text-lg font-bold text-slate-900">
                Nhật ký thao tác quản trị & hệ thống
              </h2>
              <p className="mt-1 text-xs text-slate-600">
                Ghi nhận đăng nhập, quản trị đề, khóa tài khoản, duyệt giáo viên, lớp học và trạng thái thanh toán VNPAY.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAuditPage((page) => Math.max(1, page - 1))}
                disabled={auditLoading || auditPage <= 1}
                aria-label="Trang nhật ký trước"
                className="editorial-button-secondary flex min-h-9 min-w-9 items-center justify-center disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="min-w-20 text-center font-mono text-xs font-semibold text-slate-700">
                {currentAuditData ? `${currentAuditData.pageNumber}/${Math.max(1, currentAuditData.totalPages)}` : `${auditPage}/…`}
              </span>
              <button
                type="button"
                onClick={() => setAuditPage((page) => page + 1)}
                disabled={auditLoading || !currentAuditData || currentAuditData.isLast}
                aria-label="Trang nhật ký tiếp"
                className="editorial-button-secondary flex min-h-9 min-w-9 items-center justify-center disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {auditError && (
            <div
              role="alert"
              className="m-4 flex flex-wrap items-center justify-between gap-3 border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-800"
            >
              <span>{auditError}</span>
              <button
                type="button"
                onClick={() => setAuditRetry((retry) => retry + 1)}
                className="editorial-button-secondary px-3 py-1.5 text-xs font-semibold"
              >
                Thử lại
              </button>
            </div>
          )}

          {auditLoading ? (
            <p className="p-8 text-center text-sm text-slate-500" role="status">
              Đang tải nhật ký…
            </p>
          ) : currentAuditData?.content?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600">
                  <tr>
                    <th scope="col" className="p-3">Thời điểm</th>
                    <th scope="col" className="p-3">Thao tác</th>
                    <th scope="col" className="p-3">Đối tượng</th>
                    <th scope="col" className="p-3">Tài khoản thực hiện</th>
                    <th scope="col" className="p-3">Thay đổi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {currentAuditData.content.map((event) => (
                    <tr key={event.id} className="hover:bg-slate-50/70">
                      <td className="whitespace-nowrap p-3 font-mono text-xs text-slate-600">
                        {event.occurredAtUtc?.replace('T', ' ') || '—'} UTC
                      </td>
                      <td className="p-3 font-mono text-xs font-bold text-slate-900">{event.action}</td>
                      <td className="p-3 text-xs text-slate-700">
                        {event.targetType} · <span className="font-mono">{event.targetId}</span>
                      </td>
                      <td className="p-3 font-mono text-xs text-slate-600">{event.actorUserId || 'Hệ thống'}</td>
                      <td className="p-3 text-xs text-slate-700">{event.details || event.outcome}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : !auditError && currentAuditData ? (
            <p className="p-8 text-center text-sm text-slate-500">Chưa có thao tác nào được ghi nhận.</p>
          ) : null}
        </section>

        <section className="border border-slate-200 bg-white">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 bg-[#F8FAFC] p-4 sm:p-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Lượt bắt đầu và nộp theo ngày</h2>
              <p className="mt-1 text-xs text-slate-600">
                Bắt đầu đếm session mới; nộp đếm kết quả đã lưu. Resume session không tạo lượt bắt đầu mới.
              </p>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Từ ngày
                <input
                  type="date"
                  value={from}
                  max={to || today}
                  onChange={(event) => setFrom(event.target.value)}
                  className="mt-1 block min-h-9 border border-slate-300 bg-white px-2.5 font-mono text-xs text-slate-900"
                />
              </label>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Đến ngày
                <input
                  type="date"
                  value={to}
                  min={from}
                  max={today}
                  onChange={(event) => setTo(event.target.value)}
                  className="mt-1 block min-h-9 border border-slate-300 bg-white px-2.5 font-mono text-xs text-slate-900"
                />
              </label>
            </div>
          </div>

          {loading ? (
            <p className="p-8 text-center text-sm text-slate-500" role="status">
              Đang tải số liệu…
            </p>
          ) : error ? (
            <p className="p-8 text-center text-sm font-medium text-red-700" role="alert">
              Không thể tải chuỗi số liệu cho khoảng ngày này.
            </p>
          ) : daily.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-500">Không có dữ liệu trong khoảng ngày này.</p>
          ) : (
            <div className="space-y-3 p-4 sm:p-5">
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold uppercase tracking-wider text-slate-600" aria-label="Chú giải biểu đồ">
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden="true" className="h-3 w-3 bg-[#1D4ED8]" /> Bắt đầu
                </span>
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden="true" className="h-3 w-3 bg-slate-900" /> Đã nộp
                </span>
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
                  { label: 'Bắt đầu', count: started, color: 'bg-[#1D4ED8]' },
                  { label: 'Đã nộp', count: submitted, color: 'bg-slate-900' },
                ];
                return (
                  <div
                    key={item.date}
                    className="grid grid-cols-[54px_1fr] items-center gap-x-3 gap-y-1.5 text-sm sm:grid-cols-[76px_1fr] sm:gap-x-4"
                  >
                    <time dateTime={item.date} className="row-span-2 font-mono text-xs font-bold text-slate-700">
                      {dateLabel}
                    </time>
                    {rows.map((row) => (
                      <div key={row.label} className="grid grid-cols-[60px_1fr_36px] items-center gap-2 sm:grid-cols-[76px_1fr_44px]">
                        <span className="text-xs text-slate-600">{row.label}</span>
                        <div className="h-4 border border-slate-200 bg-slate-100" role="img" aria-label={`${row.label}: ${row.count}`}>
                          <div
                            className={`h-full min-w-0 ${row.color}`}
                            style={{ width: `${row.count === 0 ? 0 : Math.max(2, (row.count / maxCount) * 100)}%` }}
                          />
                        </div>
                        <span className="text-right font-mono text-xs font-bold tabular-nums text-slate-900">{row.count}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
          <footer className="border-t border-slate-200 bg-[#F8FAFC] px-4 py-3 text-xs text-slate-500 sm:px-5">
            Chỉ trả số liệu tổng hợp, không có danh tính học viên, đáp án hay nội dung bài làm.
          </footer>
        </section>
      </div>
    </main>
  );
};

export default AdminDashboardPage;
