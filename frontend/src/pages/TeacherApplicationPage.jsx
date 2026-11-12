import React, { useCallback, useEffect, useState } from 'react';
import { ArrowUpRight, BadgeCheck, ClipboardList, RefreshCw } from 'lucide-react';
import { teacherApplicationService } from '../services/teacherApplicationService';

const statusText = {
  PENDING_PAYMENT: 'Chờ thanh toán',
  PENDING_REVIEW: 'Đã thanh toán · Chờ quản trị viên duyệt',
  APPROVED: 'Đã duyệt · Tài khoản có quyền giáo viên',
  REJECTED: 'Chưa được duyệt',
};

const paymentStatusText = {
  PENDING: 'Đang chờ VNPAY xác nhận',
  SUCCESS: 'Thanh toán thành công',
  FAILED: 'Thanh toán thất bại',
  CANCELLED: 'Đã hủy giao dịch',
  EXPIRED: 'Giao dịch hết hạn, cần đối soát',
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
        throw new Error(response.message || 'Không tạo được giao dịch thanh toán.');
      }
      window.location.assign(response.data.checkoutUrl);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không thể khởi tạo thanh toán.');
      setSubmitting(false);
    }
  };

  const canApply = !application || application.status === 'REJECTED' || application.status === 'PENDING_PAYMENT';

  return (
    <main className="teacher-application-page min-h-[75vh] bg-white px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-widest text-[#1D4ED8]">
            <ClipboardList size={16} /> Đăng ký giảng viên
          </div>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Trở thành giáo viên</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-600">
            Thanh toán phí đăng ký để gửi hồ sơ xét duyệt. Quyền giáo viên chỉ được cấp sau khi quản trị viên duyệt.
          </p>
        </header>

        {error && (
          <div role="alert" className="mb-5 border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
            {error}
          </div>
        )}

        {loading ? (
          <div className="border border-slate-200 bg-[#F8FAFC] p-8 text-center text-sm text-slate-600">
            Đang tải trạng thái hồ sơ…
          </div>
        ) : (
          <>
            {application && (
              <section className="mb-6 border border-slate-200 bg-white p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Trạng thái hồ sơ
                    </p>
                    <p className="mt-1 text-lg font-bold text-slate-900">
                      {statusText[application.status] || application.status}
                    </p>
                  </div>
                  <span
                    className={`border px-3 py-1 text-xs font-semibold ${
                      paymentStatusStyle[application.paymentStatus] || 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    Thanh toán: {paymentStatusText[application.paymentStatus] || 'Chưa tạo'}
                  </span>
                </div>
                {application.amount != null && (
                  <p className="mt-3 font-mono text-sm font-semibold text-slate-800">
                    Phí đã ghi nhận:{' '}
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                      maximumFractionDigits: 0,
                    }).format(Number(application.amount))}
                  </p>
                )}
                {application.transactionReference && (
                  <p className="mt-1.5 break-all font-mono text-xs text-slate-500">
                    Mã giao dịch: {application.transactionReference}
                  </p>
                )}
                {application.paymentStatus === 'EXPIRED' && (
                  <p
                    role="status"
                    className="mt-3 border-l-4 border-red-500 bg-red-50 p-3 text-xs font-medium text-red-800"
                  >
                    Giao dịch hết thời hạn chờ xác nhận. Để tránh thanh toán trùng, hệ thống đang yêu cầu đối soát VNPAY
                    trước khi tạo giao dịch mới. Vui lòng liên hệ quản trị viên và cung cấp mã giao dịch.
                  </p>
                )}
                {application.status === 'PENDING_REVIEW' && application.paymentStatus === 'SUCCESS' && (
                  <p className="mt-3 border-l-4 border-emerald-600 bg-emerald-50 p-3 text-xs font-medium text-emerald-900">
                    Khoản phí đã được xác nhận. Hồ sơ đang chờ quản trị viên xét duyệt; quyền giáo viên sẽ được cấp sau khi
                    hồ sơ được duyệt.
                  </p>
                )}
                {application.reviewReason && (
                  <p className="mt-3 border-l-4 border-slate-400 bg-slate-50 p-3 text-xs font-medium text-slate-700">
                    Phản hồi: {application.reviewReason}
                  </p>
                )}
                {application.status === 'APPROVED' && (
                  <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-emerald-700">
                    <BadgeCheck size={18} /> Bạn có thể bắt đầu sử dụng các chức năng dành cho giáo viên.
                  </p>
                )}
              </section>
            )}

            {canApply && (
              <form onSubmit={startPayment} className="space-y-4 border border-slate-200 bg-white p-5 sm:p-6">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Giới thiệu ngắn (không bắt buộc)
                  </span>
                  <textarea
                    value={statement}
                    onChange={(event) => setStatement(event.target.value)}
                    maxLength={1000}
                    rows={4}
                    className="w-full border border-slate-300 bg-white p-3 text-sm text-slate-900 outline-none focus:border-[#1D4ED8]"
                    placeholder="Kinh nghiệm hoặc mục tiêu giảng dạy của bạn"
                  />
                </label>
                <p className="text-xs text-slate-500">
                  Mức phí được máy chủ cấu hình. Trạng thái thanh toán được xác nhận qua IPN VNPAY.
                </p>
                <button
                  type="submit"
                  disabled={submitting}
                  className="editorial-button-primary inline-flex min-h-11 items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
                >
                  {submitting ? <RefreshCw size={16} className="animate-spin" /> : <ArrowUpRight size={16} />}
                  {application?.status === 'PENDING_PAYMENT' ? 'Tiếp tục thanh toán' : 'Gửi hồ sơ và thanh toán'}
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={loadApplication}
              className="editorial-button-secondary mt-5 inline-flex min-h-10 items-center gap-2 px-4 py-2 text-xs font-semibold"
            >
              <RefreshCw size={14} /> Cập nhật trạng thái
            </button>
          </>
        )}
      </div>
    </main>
  );
};

export default TeacherApplicationPage;
