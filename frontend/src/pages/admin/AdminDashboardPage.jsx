import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  GraduationCap,
  RefreshCw,
  ShieldCheck,
  UserCog,
  Users,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import AdminPageHeader from '../../components/common/AdminPageHeader';
import auditHeaderBg from '../../assets/img/hero/background_sach.jpg';

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
const formatVietnamTimestamp = (value, { assumeUtc = false } = {}) => {
  if (!value) return '—';
  const raw = String(value).trim();
  const hasZone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(raw);
  const normalized = assumeUtc && !hasZone ? `${raw}Z` : raw;
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return raw.replace('T', ' ');
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: REPORTING_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour12: false,
  }).format(parsed);
};
const formatReportingDateLabel = (isoDate) => {
  if (!isoDate) return '—';
  const parsed = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: REPORTING_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(parsed);
};

const TARGET_TYPE_LABELS = {
  USER: 'Tài khoản',
  AUTHENTICATION: 'Xác thực đăng nhập',
  TEST: 'Đề thi',
  TEACHER_APPLICATION: 'Hồ sơ giáo viên',
  PAYMENT: 'Giao dịch VNPAY',
  PAYMENT_TRANSACTION: 'Giao dịch VNPAY',
  CLASSROOM: 'Lớp học',
  ASSIGNMENT: 'Bài tập lớp',
};

const AUDIT_ACTION_LABELS = {
  LOGIN_SUCCESS: { label: 'Đăng nhập hệ thống', icon: ShieldCheck },
  LOGIN_SUCCEEDED: { label: 'Đăng nhập hệ thống', icon: ShieldCheck },
  LOGIN_FAILED: { label: 'Đăng nhập thất bại', icon: ShieldCheck },
  REGISTER: { label: 'Đăng ký tài khoản mới', icon: UserCog },
  PASSWORD_CHANGE: { label: 'Thay đổi mật khẩu', icon: ShieldCheck },
  PASSWORD_SET: { label: 'Thiết lập mật khẩu', icon: ShieldCheck },
  LOCK_USER: { label: 'Khóa tài khoản người dùng', icon: UserCog },
  ADMIN_LOCK_USER: { label: 'Khóa tài khoản người dùng', icon: UserCog },
  UNLOCK_USER: { label: 'Mở khóa tài khoản người dùng', icon: UserCog },
  ADMIN_UNLOCK_USER: { label: 'Mở khóa tài khoản người dùng', icon: UserCog },
  CREATE_TEST: { label: 'Khởi tạo đề thi', icon: BookOpen },
  TEST_CREATE: { label: 'Khởi tạo đề thi', icon: BookOpen },
  UPDATE_TEST: { label: 'Cập nhật nội dung đề thi', icon: BookOpen },
  TEST_UPDATE: { label: 'Cập nhật nội dung đề thi', icon: BookOpen },
  DELETE_TEST: { label: 'Xóa hoặc lưu trữ đề thi', icon: BookOpen },
  TEST_DELETE: { label: 'Xóa hoặc lưu trữ đề thi', icon: BookOpen },
  PUBLISH_TEST: { label: 'Xuất bản đề thi', icon: BookOpen },
  TEST_PUBLISH: { label: 'Xuất bản đề thi', icon: BookOpen },
  DRAFT_TEST: { label: 'Chuyển đề thi về bản nháp', icon: BookOpen },
  TEST_DRAFT: { label: 'Chuyển đề thi về bản nháp', icon: BookOpen },
  APPROVE_TEACHER_APPLICATION: { label: 'Duyệt hồ sơ giáo viên', icon: GraduationCap },
  TEACHER_APPLICATION_APPROVE: { label: 'Duyệt hồ sơ giáo viên', icon: GraduationCap },
  REJECT_TEACHER_APPLICATION: { label: 'Từ chối hồ sơ giáo viên', icon: GraduationCap },
  TEACHER_APPLICATION_REJECT: { label: 'Từ chối hồ sơ giáo viên', icon: GraduationCap },
  VNPAY_IPN: { label: 'Xác nhận thanh toán VNPAY', icon: CreditCard },
  PAYMENT_VNPAY_IPN: { label: 'Xác nhận thanh toán VNPAY', icon: CreditCard },
};

const getAuditActionMeta = (action) => {
  if (!action) return { label: 'Thao tác hệ thống', icon: Activity };
  const upper = String(action).toUpperCase();
  if (AUDIT_ACTION_LABELS[upper]) return AUDIT_ACTION_LABELS[upper];
  if (upper.includes('PAYMENT') || upper.includes('VNPAY')) return { label: action.replaceAll('_', ' '), icon: CreditCard };
  if (upper.includes('TEACHER')) return { label: action.replaceAll('_', ' '), icon: GraduationCap };
  if (upper.includes('TEST') || upper.includes('EXAM')) return { label: action.replaceAll('_', ' '), icon: BookOpen };
  if (upper.includes('USER') || upper.includes('LOCK')) return { label: action.replaceAll('_', ' '), icon: UserCog };
  if (upper.includes('LOGIN') || upper.includes('PASSWORD') || upper.includes('AUTH')) return { label: action.replaceAll('_', ' '), icon: ShieldCheck };
  return { label: action.replaceAll('_', ' '), icon: Activity };
};

const shortenTechId = (value) => {
  if (!value) return '';
  const text = String(value);
  if (text.length <= 18) return text;
  return `${text.slice(0, 8)}…${text.slice(-4)}`;
};

const getOutcomeStyle = (outcome) => {
  const upper = String(outcome || '').toUpperCase();
  if (upper === 'SUCCESS' || upper === 'OK' || upper === 'ALLOWED') {
    return { label: 'Thành công', cls: 'border-emerald-200 bg-emerald-50 text-emerald-800' };
  }
  if (upper === 'FAILURE' || upper === 'FAILED' || upper === 'DENIED' || upper === 'ERROR') {
    return { label: 'Thất bại', cls: 'border-red-200 bg-red-50 text-red-700' };
  }
  return { label: outcome || 'Đã ghi nhận', cls: 'border-slate-200 bg-slate-100 text-slate-700' };
};

const formatAuditDetails = (event) => {
  const action = String(event?.action || '').toUpperCase();
  const targetType = String(event?.targetType || '').toUpperCase();
  const targetId = String(event?.targetId || '').trim();
  const rawDetails = String(event?.details || '').trim();

  if (targetType === 'AUTHENTICATION' || action.includes('LOGIN')) {
    const isGoogle = targetId === 'GOOGLE_LOGIN' || rawDetails.includes('google');
    const methodText = isGoogle ? 'tài khoản Google' : 'email hoặc số điện thoại';
    return action.includes('FAILED')
      ? `Thử đăng nhập bằng ${methodText} nhưng không thành công.`
      : `Đăng nhập thành công bằng ${methodText}.`;
  }

  const targetLabel = TARGET_TYPE_LABELS[targetType] || 'Hệ thống';
  const shortTarget = targetId && targetId !== 'LOCAL_LOGIN' && targetId !== 'GOOGLE_LOGIN'
    ? shortenTechId(targetId)
    : '';

  let readableDetails = rawDetails
    .replaceAll('identifier=email-or-phone', 'Phương thức: Email / SĐT')
    .replaceAll('identifier=google', 'Phương thức: Google')
    .replaceAll('isLocked=true', 'Đã khóa tài khoản')
    .replaceAll('isLocked=false', 'Đã mở khóa tài khoản')
    .replaceAll('locked=true', 'Đã khóa tài khoản')
    .replaceAll('locked=false', 'Đã mở khóa tài khoản')
    .replaceAll('status=PUBLISHED', 'Trạng thái: Đã xuất bản')
    .replaceAll('status=DRAFT', 'Trạng thái: Bản nháp')
    .replaceAll('approved=true', 'Kết quả: Đã duyệt')
    .replaceAll('approved=false', 'Kết quả: Từ chối')
    .replace(/\breason=/g, 'Lý do: ');

  if (shortTarget && readableDetails) {
    return `${targetLabel} (${shortTarget}) — ${readableDetails}`;
  }
  if (readableDetails) {
    return `${targetLabel} — ${readableDetails}`;
  }
  if (shortTarget) {
    return `Đối tượng: ${targetLabel} (${shortTarget})`;
  }
  return targetLabel;
};

const formatPeriodTick = (period, mode) => {
  if (!period) return '';
  if (mode === 'MONTHLY') {
    const [year, month] = String(period).split('-');
    return year && month ? `T${Number(month)}/${year.slice(2)}` : period;
  }
  const parts = String(period).split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}`;
  }
  return period;
};

const formatPeriodFull = (period, mode) => {
  if (!period) return '';
  if (mode === 'MONTHLY') {
    const [year, month] = String(period).split('-');
    return year && month ? `Tháng ${Number(month)}/${year}` : period;
  }
  return formatReportingDateLabel(period);
};

/**
 * Editorial grouped vertical column chart with gridlines, value labels, and responsive scroll.
 */
const ActivityColumnChart = ({
  title,
  subtitle,
  data,
  mode,
  series,
  summaryItems,
  loading,
  error,
}) => {
  const maxVal = Math.max(
    1,
    ...data.flatMap((point) => series.map((item) => Number(point[item.key] || 0)))
  );
  const midVal = Math.round(maxVal / 2);

  return (
    <article className="flex flex-col overflow-hidden border border-slate-300/90 bg-white/95">
      <div className="border-b border-slate-200 bg-[#F8FAFC] px-5 py-4">
        <h3 className="text-base font-semibold text-[#111111]">{title}</h3>
        {summaryItems?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-200/80 pt-3">
            {summaryItems.map((item) => (
              <div key={item.label} className="flex items-baseline gap-2">
                <span className="text-xs text-slate-500">{item.label}:</span>
                <span className={`text-sm font-semibold tabular-nums ${item.tone || 'text-[#111111]'}`}>
                  {loading ? '—' : item.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div className="mb-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-700" aria-label="Chú giải">
          {series.map((item) => (
            <span key={item.key} className="inline-flex items-center gap-2">
              <span aria-hidden="true" className="h-3 w-3 rounded-[1px]" style={{ backgroundColor: item.color }} />
              {item.label}
            </span>
          ))}
        </div>

        {loading ? (
          <p className="py-16 text-center text-sm text-slate-500" role="status">
            Đang tải dữ liệu biểu đồ…
          </p>
        ) : error ? (
          <p className="py-16 text-center text-sm font-medium text-red-700" role="alert">
            {error}
          </p>
        ) : data.length === 0 ? (
          <p className="py-16 text-center text-sm text-slate-500">Chưa có dữ liệu trong khoảng thời gian này.</p>
        ) : (
          <div className="overflow-x-auto pb-1">
            <div
              className="flex min-w-full flex-col"
              style={{
                minWidth: data.length > 16 ? `${data.length * 42}px` : '460px',
              }}
            >
              <div className="flex items-stretch">
                {/* Y-axis labels */}
                <div className="flex w-10 shrink-0 flex-col justify-between pt-6 pr-2.5 text-right text-[11px] font-medium tabular-nums text-slate-400">
                  <span>{maxVal}</span>
                  <span>{midVal}</span>
                  <span>0</span>
                </div>

                {/* Plot area */}
                <div className="relative flex-1 pt-6">
                  <div className="pointer-events-none absolute inset-x-0 top-6 bottom-0 flex flex-col justify-between">
                    <div className="border-t border-dashed border-slate-200" />
                    <div className="border-t border-dashed border-slate-200" />
                    <div className="border-t border-slate-300" />
                  </div>

                  <div
                    className="relative grid h-44 items-end gap-2 px-1"
                    style={{ gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))` }}
                  >
                    {data.map((point) => {
                      const fullLabel = formatPeriodFull(point.period, mode);
                      const tooltip = `${fullLabel}: ${series
                        .map((item) => `${item.label} ${Number(point[item.key] || 0)}`)
                        .join(' · ')}`;
                      return (
                        <div
                          key={point.period}
                          className="group flex h-full items-end justify-center gap-1 rounded-t-[2px] px-0.5 transition-colors hover:bg-slate-100/70"
                          title={tooltip}
                        >
                          {series.map((item) => {
                            const val = Number(point[item.key] || 0);
                            const pct = val === 0 ? 0 : Math.max(4, Math.round((val / maxVal) * 100));
                            return (
                              <div key={item.key} className="relative flex h-full flex-1 max-w-[18px] flex-col items-center justify-end">
                                {val > 0 && (
                                  <span
                                    className="mb-1 whitespace-nowrap text-[11px] font-semibold leading-none tabular-nums text-slate-700"
                                  >
                                    {val}
                                  </span>
                                )}
                                <div
                                  className="w-full rounded-t-[2px] transition-opacity duration-150 group-hover:opacity-90"
                                  style={{
                                    height: `${pct}%`,
                                    backgroundColor: item.color,
                                  }}
                                  role="img"
                                  aria-label={`${fullLabel} - ${item.label}: ${val}`}
                                />
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* X-axis labels row — completely below the baseline so bars never overlap */}
              <div className="flex items-start pt-2">
                <div className="w-10 shrink-0" aria-hidden="true" />
                <div
                  className="grid flex-1 gap-2 px-1 text-center"
                  style={{ gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))` }}
                >
                  {data.map((point) => (
                    <span
                      key={point.period}
                      className="truncate text-[11px] font-medium tabular-nums text-slate-600"
                      title={formatPeriodFull(point.period, mode)}
                    >
                      {formatPeriodTick(point.period, mode)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
};

const AdminDashboardPage = () => {
  const today = useMemo(() => formatReportingDate(new Date()), []);
  const [chartGranularity, setChartGranularity] = useState('DAILY'); // 'DAILY' | 'MONTHLY'
  const [from, setFrom] = useState(() => shiftDate(today, -13));
  const [to, setTo] = useState(today);
  const [monthCount, setMonthCount] = useState(6);
  const [overview, setOverview] = useState(null);
  const [metricsRefresh, setMetricsRefresh] = useState(0);
  const [metricsState, setMetricsState] = useState({ key: '', series: [], error: '' });
  const [auditPage, setAuditPage] = useState(1);
  const [auditRetry, setAuditRetry] = useState(0);
  const [auditState, setAuditState] = useState({ key: '', data: null, error: '' });
  const metricsRequestKey =
    chartGranularity === 'MONTHLY'
      ? `MONTHLY/${monthCount}/${metricsRefresh}`
      : `DAILY/${from}/${to}/${metricsRefresh}`;
  const auditRequestKey = `${auditPage}/${auditRetry}`;

  const loadOverview = useCallback(async (updateState = true) => {
    const response = await adminService.getMetricsOverview();
    if (response.code !== 1000 || !response.data) throw new Error(response.message || 'Không tải được tổng quan.');
    if (updateState) setOverview(response.data);
    return response.data;
  }, []);

  const loadActivitySeries = useCallback(async () => {
    if (chartGranularity === 'MONTHLY') {
      const response = await adminService.getMonthlyActivityMetrics(monthCount);
      if (response.code !== 1000 || !Array.isArray(response.data)) {
        throw new Error(response.message || 'Không tải được số liệu theo tháng.');
      }
      return response.data;
    }
    if (!from || !to || from > to) throw new Error('Khoảng ngày không hợp lệ.');
    const response = await adminService.getDailyActivityMetrics(from, to);
    if (response.code !== 1000 || !Array.isArray(response.data)) {
      throw new Error(response.message || 'Không tải được số liệu theo ngày.');
    }
    return response.data;
  }, [chartGranularity, from, monthCount, to]);

  useEffect(() => {
    let active = true;
    Promise.all([loadOverview(false), loadActivitySeries()])
      .then(([nextOverview, nextSeries]) => {
        if (!active) return;
        setOverview(nextOverview);
        setMetricsState({ key: metricsRequestKey, series: nextSeries, error: '' });
      })
      .catch((err) => {
        if (!active) return;
        setMetricsState({
          key: metricsRequestKey,
          series: [],
          error: err.response?.data?.message || err.message || 'Không thể tải dữ liệu dashboard.',
        });
      });
    return () => {
      active = false;
    };
  }, [loadActivitySeries, loadOverview, metricsRequestKey]);

  useEffect(() => {
    const interval = window.setInterval(() => loadOverview().catch(() => { }), 60_000);
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
  const activitySeries = useMemo(
    () => (loading ? [] : metricsState.series),
    [loading, metricsState.series]
  );
  const auditLoading = auditState.key !== auditRequestKey;
  const auditError = auditLoading ? '' : auditState.error;
  const currentAuditData = auditLoading ? null : auditState.data;

  const totals = useMemo(() => {
    return activitySeries.reduce(
      (acc, point) => ({
        uniqueLoginUsers: acc.uniqueLoginUsers + Number(point.uniqueLoginUsers || 0),
        loginCount: acc.loginCount + Number(point.loginCount || 0),
        startedAttempts: acc.startedAttempts + Number(point.startedAttempts || 0),
        submittedAttempts: acc.submittedAttempts + Number(point.submittedAttempts || 0),
      }),
      { uniqueLoginUsers: 0, loginCount: 0, startedAttempts: 0, submittedAttempts: 0 }
    );
  }, [activitySeries]);

  const completionRate =
    totals.startedAttempts > 0
      ? Math.round((totals.submittedAttempts / totals.startedAttempts) * 100)
      : 0;

  return (
    <main className="admin-page min-h-screen pb-12 text-slate-900">
      <AdminPageHeader
        eyebrow="Khu vực quản trị"
        eyebrowIcon={Activity}
        title="Tổng quan hoạt động"
        description="Theo dõi hiện diện gần đây, nhật ký thao tác và các lượt làm bài đã được máy chủ ghi nhận."
        actions={
          <button
            type="button"
            onClick={() => setMetricsRefresh((version) => version + 1)}
            disabled={refreshing}
            className="editorial-button-secondary inline-flex min-h-10 items-center gap-2 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} /> Làm mới
          </button>
        }
      />

      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        {overview?.generatedAt && (
          <p className="mb-4 text-right text-xs text-slate-500">
            Cập nhật lúc {formatVietnamTimestamp(overview.generatedAt)} ({overview.timeZone || 'Asia/Ho_Chi_Minh'})
          </p>
        )}

        {error && (
          <div role="alert" className="mb-5 border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
            {error}
          </div>
        )}

        <section
          aria-label="Chỉ số hiện tại"
          className="mb-6 grid divide-y divide-slate-200 border border-slate-300/90 bg-white/95 sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4"
        >
          {[
            {
              label: 'Đang hoạt động',
              icon: Users,
              value: overview?.activeUsers ?? 0,
              tone: 'text-[#111111]',
              note: `${overview?.activeWindowMinutes ?? 5} phút gần nhất`,
            },
            {
              label: 'Đăng nhập hôm nay',
              icon: ShieldCheck,
              value: overview?.uniqueLoginsToday ?? 0,
              tone: 'text-[#1D4ED8]',
              note: loading
                ? 'Đang tổng hợp…'
                : `${overview?.loginCountToday ?? 0} lượt · ${overview?.uniqueLoginsThisMonth ?? 0} người/tháng`,
            },
            {
              label: 'Bắt đầu thi hôm nay',
              icon: Activity,
              value: overview?.startedAttemptsToday ?? 0,
              tone: 'text-[#111111]',
              note: loading
                ? 'Đang tổng hợp…'
                : `Tháng này: ${overview?.startedAttemptsThisMonth ?? 0} lượt`,
            },
            {
              label: 'Đã nộp hôm nay',
              icon: BarChart3,
              value: overview?.submittedAttemptsToday ?? 0,
              tone: 'text-[#0F766E]',
              note: loading
                ? `Ngày ${formatReportingDateLabel(overview?.reportingDate || today)}`
                : `Tháng này: ${overview?.submittedAttemptsThisMonth ?? 0} bài`,
            },
          ].map((kpi) => {
            const KpiIcon = kpi.icon;
            return (
              <div key={kpi.label} className="flex flex-col justify-between px-4 py-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    {kpi.label}
                  </span>
                </div>
                <div className="mt-1.5 flex items-baseline justify-between gap-2">
                  <p className={`text-2xl font-semibold leading-none tabular-nums ${kpi.tone}`}>
                    {loading ? '—' : kpi.value}
                  </p>
                  <p className="truncate text-xs text-slate-500" title={kpi.note}>
                    {kpi.note}
                  </p>
                </div>
              </div>
            );
          })}
        </section>

        <section aria-labelledby="audit-title" className="mb-8 overflow-hidden border border-slate-300/90 bg-white/95">
          <div
            className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-cover bg-center p-4 sm:px-6 sm:py-5"
            style={{
              backgroundImage: `linear-gradient(90deg, rgba(255, 255, 255, 0.94) 0%, rgba(248, 250, 252, 0.88) 65%, rgba(241, 245, 249, 0.94) 100%), url("${auditHeaderBg}")`,
            }}
          >
            <div>
              <h2 id="audit-title" className="text-xl font-medium text-[#111111]">
                Nhật ký hệ thống
              </h2>
              <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                Ghi nhận đăng nhập, quản trị đề, khóa tài khoản, duyệt giáo viên, lớp học và trạng thái thanh toán VNPAY.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAuditPage((page) => Math.max(1, page - 1))}
                disabled={auditLoading || auditPage <= 1}
                aria-label="Trang nhật ký trước"
                className="editorial-button-secondary flex min-h-9 min-w-9 items-center justify-center bg-white disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="min-w-20 text-center text-xs font-semibold tabular-nums text-slate-700">
                {currentAuditData ? `${currentAuditData.pageNumber} / ${Math.max(1, currentAuditData.totalPages)}` : `${auditPage} / …`}
              </span>
              <button
                type="button"
                onClick={() => setAuditPage((page) => page + 1)}
                disabled={auditLoading || !currentAuditData || currentAuditData.isLast}
                aria-label="Trang nhật ký tiếp"
                className="editorial-button-secondary flex min-h-9 min-w-9 items-center justify-center bg-white disabled:opacity-50"
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
            <ul className="divide-y divide-slate-200/90" aria-label="Danh sách nhật ký hoạt động">
              {currentAuditData.content.map((event) => {
                const actionMeta = getAuditActionMeta(event.action);
                const outcomeMeta = getOutcomeStyle(event.outcome);
                const descriptionText = formatAuditDetails(event);
                return (
                  <li
                    key={event.id}
                    className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-slate-50/90 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[2px] border border-slate-200 bg-[#EFF6FF] text-[#1D4ED8]">
                        {React.createElement(actionMeta.icon, { size: 17, 'aria-hidden': true })}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-[#111111] sm:text-base">
                            {actionMeta.label}
                          </span>
                          <span className={`inline-block rounded-[2px] border px-2 py-0.5 text-[11px] font-semibold ${outcomeMeta.cls}`}>
                            {outcomeMeta.label}
                          </span>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-sm" title={event.targetId || ''}>
                          {descriptionText}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-row items-center justify-between gap-4 pl-12 text-xs text-slate-500 sm:flex-col sm:items-end sm:gap-1 sm:pl-0 sm:text-right">
                      <span className="inline-flex items-center gap-1.5 font-medium tabular-nums text-slate-700">
                        <Clock size={13} className="text-slate-400" aria-hidden="true" />
                        {formatVietnamTimestamp(event.occurredAtUtc, { assumeUtc: true })}
                      </span>
                      <span>
                        Người thực hiện:{' '}
                        {event.actorUserId ? (
                          <span title={`ID tài khoản: ${event.actorUserId}`} className="font-medium text-slate-700">
                            Tài khoản #{String(event.actorUserId).slice(0, 8)}
                          </span>
                        ) : (
                          <span className="font-medium text-slate-700">Hệ thống tự động</span>
                        )}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : !auditError && currentAuditData ? (
            <p className="p-8 text-center text-sm text-slate-500">Chưa có thao tác nào được ghi nhận.</p>
          ) : null}
        </section>

        <section aria-labelledby="charts-title" className="space-y-4">
          <div
            className="flex flex-wrap items-end justify-between gap-4 border border-slate-300/90 bg-white/95 bg-cover bg-center p-4 sm:px-6 sm:py-5"
            style={{
              backgroundImage: `linear-gradient(90deg, rgba(255, 255, 255, 0.94) 0%, rgba(248, 250, 252, 0.88) 65%, rgba(241, 245, 249, 0.94) 100%), url("${auditHeaderBg}")`,
            }}
          >
            <div>
              <h2 id="charts-title" className="text-xl font-medium text-[#111111]">
                Biểu đồ đăng nhập & lượt thi {chartGranularity === 'MONTHLY' ? 'theo tháng' : 'theo ngày'}
              </h2>
              <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                Theo dõi xu hướng người dùng truy cập và mức độ hoàn thành bài thi trên toàn hệ thống (múi giờ {REPORTING_TIME_ZONE}).
              </p>
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <div className="inline-flex rounded-[2px] border border-slate-300 bg-white p-0.5" role="group" aria-label="Chế độ thống kê">
                <button
                  type="button"
                  onClick={() => setChartGranularity('DAILY')}
                  className={`min-h-[34px] px-3 py-1 text-xs font-semibold transition-colors ${chartGranularity === 'DAILY'
                    ? 'bg-[#1D4ED8] text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                    }`}
                >
                  Theo ngày
                </button>
                <button
                  type="button"
                  onClick={() => setChartGranularity('MONTHLY')}
                  className={`min-h-[34px] px-3 py-1 text-xs font-semibold transition-colors ${chartGranularity === 'MONTHLY'
                    ? 'bg-[#1D4ED8] text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                    }`}
                >
                  Theo tháng
                </button>
              </div>

              {chartGranularity === 'DAILY' ? (
                <div className="flex flex-wrap items-end gap-2">
                  <div className="flex gap-1">
                    {[
                      { label: '7 ngày', days: 6 },
                      { label: '14 ngày', days: 13 },
                      { label: '30 ngày', days: 29 },
                    ].map((preset) => (
                      <button
                        key={preset.days}
                        type="button"
                        onClick={() => {
                          setFrom(shiftDate(today, -preset.days));
                          setTo(today);
                        }}
                        className="editorial-button-secondary min-h-9 bg-white px-2.5 text-xs font-semibold"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Từ ngày
                    <input
                      type="date"
                      value={from}
                      max={to || today}
                      onChange={(event) => setFrom(event.target.value)}
                      className="mt-1 block min-h-9 border border-slate-300 bg-white px-2.5 text-xs text-slate-900"
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
                      className="mt-1 block min-h-9 border border-slate-300 bg-white px-2.5 text-xs text-slate-900"
                    />
                  </label>
                </div>
              ) : (
                <div className="flex gap-1.5" role="group" aria-label="Số tháng hiển thị">
                  {[3, 6, 12].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setMonthCount(count)}
                      className={`min-h-9 border px-3 text-xs font-semibold transition-colors ${monthCount === count
                        ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white'
                        : 'border-slate-300 bg-white text-slate-700 hover:border-[#1D4ED8] hover:text-[#1D4ED8]'
                        }`}
                    >
                      {count} tháng gần đây
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <ActivityColumnChart
              title="Số lượng người đăng nhập"
              subtitle="Phân biệt số tài khoản duy nhất đăng nhập và tổng lượt đăng nhập thành công."
              data={activitySeries}
              mode={chartGranularity}
              loading={loading}
              error={error}
              series={[
                { key: 'uniqueLoginUsers', label: 'Người dùng duy nhất', color: '#1D4ED8' },
                { key: 'loginCount', label: 'Tổng lượt đăng nhập', color: '#60A5FA' },
              ]}
              summaryItems={[
                { label: 'Số người dùng đăng nhập/ngày)', value: totals.uniqueLoginUsers, tone: 'text-[#1D4ED8]' },
                { label: 'Tổng lượt đăng nhập', value: totals.loginCount, tone: 'text-[#2563EB]' },
              ]}
            />

            <ActivityColumnChart
              title="Số lượt thi"
              subtitle="Bắt đầu đếm session mới; đã nộp đếm bài đã chấm lưu kết quả."
              data={activitySeries}
              mode={chartGranularity}
              loading={loading}
              error={error}
              series={[
                { key: 'startedAttempts', label: 'Lượt bắt đầu', color: '#1D4ED8' },
                { key: 'submittedAttempts', label: 'Lượt đã nộp', color: '#0D9488' },
              ]}
              summaryItems={[
                { label: 'Tổng lượt bắt đầu', value: totals.startedAttempts, tone: 'text-[#1D4ED8]' },
                { label: 'Tổng lượt đã nộp', value: totals.submittedAttempts, tone: 'text-[#0F766E]' },
                { label: 'Tỉ lệ hoàn thành', value: `${completionRate}%` },
              ]}
            />
          </div>

          <p className="border border-slate-300/90 bg-white/95 px-4 py-3 text-xs text-slate-500 sm:px-5">
            Chỉ trả số liệu tổng hợp, không có danh tính học viên, đáp án hay nội dung bài làm.
          </p>
        </section>
      </div>
    </main>
  );
};

export default AdminDashboardPage;
