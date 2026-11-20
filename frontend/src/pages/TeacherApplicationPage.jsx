import React, { useCallback, useEffect, useState } from 'react';
import { ArrowUpRight, BadgeCheck, ClipboardList, RefreshCw } from 'lucide-react';
import { teacherApplicationService } from '../services/teacherApplicationService';
import teacherBgImage from '../assets/img/teacher-application/teacher.png';

const statusText = {
  PENDING_PAYMENT: 'Chờ thanh toán',
  PENDING_REVIEW: 'Đã thanh toán · Chờ quản trị viên duyệt',
  APPROVED: 'Đã duyệt · Tài khoản có quyền giáo viên',
  REJECTED: 'Chưa được duyệt',
};

const paymentStatusText = {
  PENDING: 'Đang chờ PayOS xác nhận',
  SUCCESS: 'Thanh toán thành công',
  FAILED: 'Thanh toán thất bại',
  CANCELLED: 'Đã hủy giao dịch',
  EXPIRED: 'Giao dịch hết hạn',
};

const paymentStatusStyle = {
  PENDING: 'border-amber-200 bg-amber-50 text-amber-800',
  SUCCESS: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  FAILED: 'border-red-200 bg-red-50 text-red-700',
  CANCELLED: 'border-slate-300 bg-slate-100 text-slate-700',
  EXPIRED: 'border-red-200 bg-red-50 text-red-700',
};

const TeacherApplicationPage = () => {
  const [application, setApplication] = useState(null);
  const [statement, setStatement] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadApplication = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await teacherApplicationService.getMine();
      if (response.code !== 1000) throw new Error(response.message || 'Không tải được hồ sơ.');
      setApplication(response.data || null);
      if (response.data?.statement) setStatement(response.data.statement);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không tải được hồ sơ.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplication();
  }, [loadApplication]);

  const startPayment = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const response = await teacherApplicationService.apply(statement.trim());
      if (response.code !== 1000 || !response.data?.checkoutUrl) {
        throw new Error(response.message || 'Không tạo được giao dịch thanh toán PayOS.');
      }
      window.location.assign(response.data.checkoutUrl);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không thể khởi tạo thanh toán PayOS.');
      setSubmitting(false);
    }
  };

  const canApply = !application || application.status === 'REJECTED' || application.status === 'PENDING_PAYMENT';

  return (
    <div className="teacher-application-page relative min-h-[calc(100vh-72px)] overflow-hidden px-4 py-10 text-[#111827] sm:px-6 lg:px-8 lg:py-12">
      {/* Background Classroom Illustration */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
        <img
          src={teacherBgImage}
          alt=""
          className="h-full w-full object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(248, 250, 252, 0.56) 0%, rgba(241, 245, 249, 0.64) 55%, rgba(248, 250, 252, 0.72) 100%)',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        {/* Editorial Page Header */}
        <header className="mb-6 rounded-[2px] border border-[#D1D5DB] bg-white/92 p-6 backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#1D4ED8]">
                <ClipboardList size={15} />
                <span>Đăng ký giảng viên</span>
              </div>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#111111] sm:text-4xl">
                Trở thành giáo viên
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#4B5563]">
                Thanh toán phí đăng ký chỉ{' '}
                <strong className="font-semibold tabular-nums text-[red]">2.000 ₫</strong> qua PayOS để gửi hồ sơ
                xét duyệt. Bạn sẽ trở thành giáo viên ngay sau khi quản trị viên phê duyệt.
              </p>
            </div>
            <button
              type="button"
              onClick={loadApplication}
              disabled={loading}
              className="editorial-button-secondary inline-flex min-h-11 items-center gap-2 rounded-[2px] px-4 py-2 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-2 disabled:opacity-60"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Cập nhật trạng thái</span>
            </button>
          </div>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-[2px] border border-red-200 bg-red-50/95 p-4 text-sm font-medium text-red-800 backdrop-blur-sm"
          >
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-[2px] border border-[#D1D5DB] bg-white/92 p-10 text-center text-sm text-[#5B6472] backdrop-blur-sm">
            Đang tải trạng thái hồ sơ…
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            {/* Main Column: Status & Application Form */}
            <div className="space-y-6">
              {application && (
                <section className="rounded-[2px] border border-[#D1D5DB] bg-white/94 p-6 backdrop-blur-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E5E7EB] pb-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#5B6472]">
                        Trạng thái hồ sơ
                      </p>
                      <p className="mt-1 text-lg font-bold text-[#111111]">
                        {statusText[application.status] || application.status}
                      </p>
                    </div>
                    <span
                      className={`rounded-[2px] border px-3 py-1 text-xs font-semibold ${paymentStatusStyle[application.paymentStatus] ||
                        'border-[#D1D5DB] bg-[#F8FAFC] text-[#374151]'
                        }`}
                    >
                      Thanh toán: {paymentStatusText[application.paymentStatus] || 'Chưa tạo'}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <p className="font-semibold tabular-nums text-[#111827]">
                      Phí đăng ký xét duyệt:{' '}
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                        maximumFractionDigits: 0,
                      }).format(Number(application.amount ?? 2000))}
                    </p>
                    {application.transactionReference && (
                      <p className="break-all text-xs text-[#5B6472]">
                        Mã đơn hàng PayOS:{' '}
                        <span className="font-mono text-[#111827]">{application.transactionReference}</span>
                      </p>
                    )}
                  </div>

                  {application.paymentStatus === 'EXPIRED' && (
                    <p
                      role="status"
                      className="mt-4 rounded-[2px] border-l-4 border-amber-500 bg-amber-50 p-3 text-xs font-medium text-amber-900"
                    >
                      Liên kết thanh toán trước đó đã hết hạn. Bạn có thể bấm nút bên dưới để tạo mã QR PayOS mới.
                    </p>
                  )}
                  {application.status === 'PENDING_REVIEW' && application.paymentStatus === 'SUCCESS' && (
                    <p className="mt-4 rounded-[2px] border-l-4 border-emerald-600 bg-emerald-50 p-3 text-xs font-medium text-emerald-900">
                      Khoản phí đã được xác nhận qua PayOS. Hồ sơ đang chờ quản trị viên xét duyệt; quyền giáo viên sẽ
                      được cấp sau khi hồ sơ được duyệt.
                    </p>
                  )}
                  {application.reviewReason && (
                    <p className="mt-4 rounded-[2px] border-l-4 border-slate-400 bg-slate-50 p-3 text-xs font-medium text-slate-700">
                      Phản hồi: {application.reviewReason}
                    </p>
                  )}
                  {application.status === 'APPROVED' && (
                    <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-emerald-700">
                      <BadgeCheck size={18} /> Bạn có thể bắt đầu sử dụng các chức năng dành cho giáo viên.
                    </p>
                  )}
                </section>
              )}

              {canApply && (
                <form
                  onSubmit={startPayment}
                  className="space-y-5 rounded-[2px] border border-[#D1D5DB] bg-white/94 p-6 backdrop-blur-sm"
                >
                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#374151]">
                      Giới thiệu ngắn (không bắt buộc)
                    </span>
                    <textarea
                      value={statement}
                      onChange={(event) => setStatement(event.target.value)}
                      maxLength={1000}
                      rows={5}
                      className="w-full rounded-[2px] border border-[#CBD5E1] bg-white p-3.5 text-sm leading-relaxed text-[#111827] outline-none transition-colors focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/15"
                      placeholder="Kinh nghiệm hoặc mục tiêu giảng dạy của bạn"
                    />
                  </label>

                  <div className="flex flex-col gap-4 border-t border-[#E5E7EB] pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="editorial-button-primary inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-[2px] px-5 py-2.5 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-2 disabled:opacity-60"
                    >
                      {submitting ? <RefreshCw size={16} className="animate-spin" /> : <ArrowUpRight size={16} />}
                      <span>
                        {application?.status === 'PENDING_PAYMENT'
                          ? 'Thanh toán 2.000 ₫ qua PayOS'
                          : 'Gửi hồ sơ và thanh toán'}
                      </span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Right Sidebar: Process Guide */}
            <aside className="rounded-[2px] border border-[#D1D5DB] bg-white/92 p-6 backdrop-blur-sm">
              <h2 className="border-b border-[#E5E7EB] pb-3 text-xs font-semibold uppercase tracking-wider text-[#374151]">
                Hướng dẫn quy trình xét duyệt
              </h2>
              <ol className="mt-4 space-y-4 text-sm">
                <li className="flex gap-3">
                  <span className="mt-0.5 text-xs font-semibold tabular-nums text-[#1D4ED8]">01</span>
                  <div>
                    <p className="font-semibold text-[#111111]">Gửi hồ sơ và thanh toán</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-[#5B6472]">
                      Điền giới thiệu ngắn và hoàn tất phí xét duyệt chỉ{' '}
                      <span className="tabular-nums font-semibold text-[red]">2.000 ₫</span>
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 text-xs font-semibold tabular-nums text-[#1D4ED8]">02</span>
                  <div>
                    <p className="font-semibold text-[#111111]">Xác nhận và duyệt hồ sơ</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-[#5B6472]">
                      Hệ thống ghi nhận thanh toán tự động và chuyển hồ sơ tới quản trị viên xem xét.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 text-xs font-semibold tabular-nums text-[#1D4ED8]">03</span>
                  <div>
                    <p className="font-semibold text-[#111111]">Mở không gian giảng dạy</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-[#5B6472]">
                      Sau khi được duyệt, bạn có thể tạo lớp học, giao bài tập và đăng tài liệu cho học viên.
                    </p>
                  </div>
                </li>
              </ol>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherApplicationPage;
