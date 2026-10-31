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
  PENDING: 'bg-amber-200',
  SUCCESS: 'bg-lime-200',
  FAILED: 'bg-rose-200',
  CANCELLED: 'bg-[#f1eedf]',
  EXPIRED: 'bg-rose-200',
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
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadApplication(); }, [loadApplication]);

  const startPayment = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const response = await teacherApplicationService.apply(statement.trim());
      if (response.code !== 1000 || !response.data?.checkoutUrl) throw new Error(response.message || 'Không tạo được giao dịch thanh toán.');
      window.location.assign(response.data.checkoutUrl);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không thể khởi tạo thanh toán.');
      setSubmitting(false);
    }
  };

  const canApply = !application || application.status === 'REJECTED' || application.status === 'PENDING_PAYMENT';

  return (
    <main className="min-h-[70vh] bg-[#fffdf2] px-4 py-10 text-[#111] sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 border-2 border-black bg-[#FFE600] p-6 shadow-[5px_5px_0_#111] sm:p-8">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest"><ClipboardList size={17} /> Đăng ký giảng viên</div>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">Trở thành giáo viên</h1>
          <p className="mt-3 max-w-xl font-semibold">Thanh toán phí đăng ký để gửi hồ sơ xét duyệt. Quyền giáo viên chỉ được cấp sau khi quản trị viên duyệt.</p>
        </header>

        {error && <div role="alert" className="mb-5 border-2 border-black bg-rose-200 p-4 font-bold">{error}</div>}

        {loading ? <div className="border-2 border-black bg-white p-8 text-center font-bold">Đang tải trạng thái hồ sơ…</div> : (
          <>
            {application && <section className="mb-5 border-2 border-black bg-white p-5 shadow-[3px_3px_0_#111]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><p className="text-xs font-black uppercase tracking-wide">Trạng thái hồ sơ</p><p className="mt-1 text-lg font-black">{statusText[application.status] || application.status}</p></div>
                <span className={`border-2 border-black px-3 py-1 text-xs font-black ${paymentStatusStyle[application.paymentStatus] || 'bg-white'}`}>Thanh toán: {paymentStatusText[application.paymentStatus] || 'Chưa tạo'}</span>
              </div>
              {application.amount != null && <p className="mt-3 text-sm font-semibold">Phí đã ghi nhận: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(application.amount))}</p>}
              {application.transactionReference && <p className="mt-2 break-all font-mono text-xs text-[#333]">Mã giao dịch: {application.transactionReference}</p>}
              {application.paymentStatus === 'EXPIRED' && <p role="status" className="mt-3 border-l-4 border-rose-600 bg-rose-50 p-3 text-sm font-semibold">Giao dịch hết thời hạn chờ xác nhận. Để tránh thanh toán trùng, hệ thống đang yêu cầu đối soát VNPAY trước khi tạo giao dịch mới. Vui lòng liên hệ quản trị viên và cung cấp mã giao dịch.</p>}
              {application.status === 'PENDING_REVIEW' && application.paymentStatus === 'SUCCESS' && <p className="mt-3 border-l-4 border-lime-700 bg-lime-50 p-3 text-sm font-semibold">Khoản phí đã được xác nhận. Hồ sơ đang chờ quản trị viên xét duyệt; quyền giáo viên sẽ được cấp sau khi hồ sơ được duyệt.</p>}
              {application.reviewReason && <p className="mt-3 border-l-4 border-black bg-[#f1eedf] p-3 text-sm font-semibold">Phản hồi: {application.reviewReason}</p>}
              {application.status === 'APPROVED' && <p className="mt-3 flex items-center gap-2 font-bold"><BadgeCheck size={18} /> Bạn có thể bắt đầu sử dụng các chức năng dành cho giáo viên.</p>}
            </section>}

            {canApply && <form onSubmit={startPayment} className="space-y-4 border-2 border-black bg-white p-5 shadow-[4px_4px_0_#111] sm:p-6">
              <label className="block"><span className="mb-1 block text-sm font-black">Giới thiệu ngắn (không bắt buộc)</span><textarea value={statement} onChange={(event) => setStatement(event.target.value)} maxLength={1000} rows={4} className="w-full border-2 border-black bg-[#fffdf2] p-3 font-medium focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#FF5B93]" placeholder="Kinh nghiệm hoặc mục tiêu giảng dạy của bạn" /></label>
              <p className="text-sm font-semibold">Mức phí được máy chủ cấu hình. Trạng thái thanh toán được xác nhận qua IPN VNPAY.</p>
              <button type="submit" disabled={submitting} className="inline-flex min-h-12 items-center justify-center gap-2 border-2 border-black bg-[#FFE600] px-5 py-3 font-black shadow-[3px_3px_0_#111] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-60">
                {submitting ? <RefreshCw size={17} className="animate-spin" /> : <ArrowUpRight size={17} />}
                {application?.status === 'PENDING_PAYMENT' ? 'Tiếp tục thanh toán' : 'Gửi hồ sơ và thanh toán'}
              </button>
            </form>}

            <button type="button" onClick={loadApplication} className="mt-5 inline-flex min-h-10 items-center gap-2 border-2 border-black bg-white px-4 py-2 text-sm font-black"><RefreshCw size={15} /> Cập nhật trạng thái</button>
          </>
        )}
      </div>
    </main>
  );
};

export default TeacherApplicationPage;
