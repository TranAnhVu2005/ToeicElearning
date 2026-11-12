import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BadgeCheck, CircleAlert, Clock3, CreditCard, RefreshCw } from 'lucide-react';
import { teacherApplicationService } from '../services/teacherApplicationService';

const PaymentResultPage = () => {
  const [searchParams] = useSearchParams();
  const transactionReference = searchParams.get('txnRef') || '';
  const verification = searchParams.get('verification');
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (verification === 'invalid' || !/^[a-f\d]{32}$/i.test(transactionReference)) {
      setError('Không xác minh được thông tin điều hướng thanh toán. Hãy xem trạng thái từ hồ sơ của bạn.');
      setChecking(false);
      return undefined;
    }
    let active = true;
    let attempts = 0;
    let timeoutId;
    const check = async () => {
      try {
        const response = await teacherApplicationService.getPayments(transactionReference);
        if (!active) return;
        if (response.code === 1000 && response.data) {
          setPayment(response.data);
          setError('');
          if (response.data.status !== 'PENDING') {
            setChecking(false);
            return;
          }
        }
      } catch (err) {
        if (active) setError(err.response?.data?.message || 'Không thể tra cứu giao dịch của tài khoản này.');
      }
      attempts += 1;
      if (attempts >= 12) setChecking(false);
      else if (active) timeoutId = window.setTimeout(check, 5000);
    };
    check();
    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [transactionReference, verification, retryCount]);

  const success = payment?.status === 'SUCCESS';
  const failed = payment?.status === 'FAILED' || payment?.status === 'EXPIRED';
  const cancelled = payment?.status === 'CANCELLED';
  const vipPurchase = payment?.productType === 'TEST_VIP';
  const retryVerification = () => {
    setPayment(null);
    setError('');
    setChecking(true);
    setRetryCount((count) => count + 1);
  };

  return (
    <main className="payment-result-page min-h-[75vh] bg-white px-4 py-12 text-slate-900 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-2xl border border-slate-200 bg-white p-6 sm:p-9">
        <p className="editorial-eyebrow inline-flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-widest text-[#1D4ED8]">
          <CreditCard size={15} /> ĐỐI SOÁT GIAO DỊCH VNPAY
        </p>

        <div className="mt-4 flex items-center gap-3">
          <div
            className={`inline-flex h-11 w-11 shrink-0 items-center justify-center border ${
              success
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : failed || cancelled || error
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : 'border-blue-200 bg-[#EFF6FF] text-[#1D4ED8]'
            }`}
          >
            {success ? (
              <BadgeCheck size={22} />
            ) : failed || cancelled || error ? (
              <CircleAlert size={22} />
            ) : checking ? (
              <RefreshCw size={20} className="animate-spin" />
            ) : (
              <Clock3 size={20} />
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            {success
              ? 'Đã xác nhận thanh toán'
              : cancelled
                ? 'Giao dịch đã hủy'
                : failed
                  ? 'Thanh toán chưa thành công'
                  : checking
                    ? 'Đang xác minh thanh toán'
                    : 'Chưa thể xác minh giao dịch'}
          </h1>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          {success
            ? vipPurchase
              ? 'VNPAY đã xác nhận giao dịch. Đề VIP đã được mở khóa vĩnh viễn cho tài khoản của bạn.'
              : 'VNPAY đã xác nhận giao dịch ở máy chủ. Hồ sơ giáo viên đang chờ quản trị viên duyệt.'
            : cancelled
              ? 'Giao dịch đã được ghi nhận là đã hủy. Bạn có thể bắt đầu một giao dịch mới từ trang sản phẩm hoặc hồ sơ.'
              : failed
                ? 'Giao dịch không được ghi nhận thành công. Bạn có thể kiểm tra hồ sơ hoặc thử lại.'
                : payment?.status === 'PENDING'
                  ? 'Giao dịch vẫn đang chờ xác nhận từ VNPAY. Trang chuyển hướng không quyết định kết quả thanh toán.'
                  : checking
                    ? 'Trang chuyển hướng không quyết định kết quả. Hệ thống đang chờ xác nhận IPN từ VNPAY.'
                    : 'Chưa nhận được trạng thái xác nhận từ máy chủ. Hãy kiểm tra lại hoặc mở lịch sử thanh toán.'}
        </p>

        {transactionReference && (
          <p className="mt-4 break-all border border-slate-200 bg-[#F8FAFC] p-3 font-mono text-xs text-slate-700">
            Mã giao dịch: <strong className="text-slate-900">{transactionReference}</strong>
          </p>
        )}

        {error && (
          <p role="alert" className="mt-4 border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
            {error}
          </p>
        )}

        {!payment && checking && (
          <p className="mt-3 text-sm text-slate-500">Đang kiểm tra trạng thái trên máy chủ…</p>
        )}

        {!checking && !success && !failed && !cancelled && payment?.status === 'PENDING' && (
          <p className="mt-3 text-sm text-slate-500">Nếu vừa thanh toán, hãy chờ IPN hoặc kiểm tra lại sau.</p>
        )}

        <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-200 pt-5">
          {vipPurchase && payment?.testId ? (
            <Link to={`/courses/${payment.testId}`} className="editorial-button-primary px-4 py-2 text-sm font-semibold">
              {success ? 'Mở đề đã mua' : 'Quay lại đề VIP'}
            </Link>
          ) : (
            <Link to="/teacher/application" className="editorial-button-primary px-4 py-2 text-sm font-semibold">
              Mở hồ sơ giáo viên
            </Link>
          )}
          <Link to="/profile?tab=payments" className="editorial-button-secondary px-4 py-2 text-sm font-semibold">
            Lịch sử thanh toán
          </Link>
          {!checking && !success && !failed && !cancelled && transactionReference && verification !== 'invalid' && (
            <button
              type="button"
              onClick={retryVerification}
              className="editorial-button-secondary inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold"
            >
              <RefreshCw size={15} /> Kiểm tra lại
            </button>
          )}
          <Link to="/" className="editorial-button-secondary px-4 py-2 text-sm font-semibold">
            Về trang chủ
          </Link>
        </div>
      </section>
    </main>
  );
};

export default PaymentResultPage;
