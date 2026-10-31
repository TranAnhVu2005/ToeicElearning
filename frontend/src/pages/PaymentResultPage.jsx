import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BadgeCheck, CircleAlert, Clock3, RefreshCw } from 'lucide-react';
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
          if (response.data.status !== 'PENDING') { setChecking(false); return; }
        }
      } catch (err) {
        if (active) setError(err.response?.data?.message || 'Không thể tra cứu giao dịch của tài khoản này.');
      }
      attempts += 1;
      if (attempts >= 12) setChecking(false);
      else if (active) timeoutId = window.setTimeout(check, 5000);
    };
    check();
    return () => { active = false; window.clearTimeout(timeoutId); };
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
    <main className="min-h-[70vh] bg-[#fffdf2] px-4 py-12 text-[#111] sm:px-6">
      <section className="mx-auto max-w-2xl border-2 border-black bg-white p-6 shadow-[5px_5px_0_#111] sm:p-9">
        <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center border-2 border-black ${success ? 'bg-lime-200' : failed || error ? 'bg-rose-200' : 'bg-[#FFE600]'}`}>
          {success ? <BadgeCheck size={25} /> : failed || cancelled || error ? <CircleAlert size={25} /> : checking ? <RefreshCw size={23} className="animate-spin" /> : <Clock3 size={23} />}
        </div>
        <h1 className="text-3xl font-black">{success ? 'Đã xác nhận thanh toán' : cancelled ? 'Giao dịch đã hủy' : failed ? 'Thanh toán chưa thành công' : checking ? 'Đang xác minh thanh toán' : 'Chưa thể xác minh giao dịch'}</h1>
        <p className="mt-3 font-semibold">{success
          ? vipPurchase ? 'VNPAY đã xác nhận giao dịch. Đề VIP đã được mở khóa vĩnh viễn cho tài khoản của bạn.' : 'VNPAY đã xác nhận giao dịch ở máy chủ. Hồ sơ giáo viên đang chờ quản trị viên duyệt.'
          : cancelled ? 'Giao dịch đã được ghi nhận là đã hủy. Bạn có thể bắt đầu một giao dịch mới từ trang sản phẩm hoặc hồ sơ.'
            : failed ? 'Giao dịch không được ghi nhận thành công. Bạn có thể kiểm tra hồ sơ hoặc thử lại.'
              : payment?.status === 'PENDING' ? 'Giao dịch vẫn đang chờ xác nhận từ VNPAY. Trang chuyển hướng không quyết định kết quả thanh toán.'
                : checking ? 'Trang chuyển hướng không quyết định kết quả. Hệ thống đang chờ xác nhận IPN từ VNPAY.'
                  : 'Chưa nhận được trạng thái xác nhận từ máy chủ. Hãy kiểm tra lại hoặc mở lịch sử thanh toán.'}</p>
        {transactionReference && <p className="mt-4 break-all border-2 border-black bg-[#f1eedf] p-3 font-mono text-xs">Mã giao dịch: {transactionReference}</p>}
        {error && <p role="alert" className="mt-4 border-2 border-black bg-rose-200 p-3 text-sm font-bold">{error}</p>}
        {!payment && checking && <p className="mt-3 text-sm font-semibold">Đang kiểm tra trạng thái trên máy chủ…</p>}
        {!checking && !success && !failed && !cancelled && payment?.status === 'PENDING' && <p className="mt-3 text-sm font-semibold">Nếu vừa thanh toán, hãy chờ IPN hoặc kiểm tra lại sau.</p>}
        <div className="mt-6 flex flex-wrap gap-3">{vipPurchase && payment?.testId ? <Link to={`/courses/${payment.testId}`} className="border-2 border-black bg-[#FFE600] px-4 py-2 font-black shadow-[3px_3px_0_#111]">{success ? 'Mở đề đã mua' : 'Quay lại đề VIP'}</Link> : <Link to="/teacher/application" className="border-2 border-black bg-[#FFE600] px-4 py-2 font-black shadow-[3px_3px_0_#111]">Mở hồ sơ giáo viên</Link>}<Link to="/profile?tab=payments" className="border-2 border-black bg-white px-4 py-2 font-black shadow-[3px_3px_0_#111]">Lịch sử thanh toán</Link>{!checking && !success && !failed && !cancelled && transactionReference && verification !== 'invalid' && <button type="button" onClick={retryVerification} className="inline-flex items-center gap-2 border-2 border-black bg-white px-4 py-2 font-black shadow-[3px_3px_0_#111]"><RefreshCw size={16} /> Kiểm tra lại</button>}<Link to="/" className="border-2 border-black bg-white px-4 py-2 font-black">Về trang chủ</Link></div>
      </section>
    </main>
  );
};

export default PaymentResultPage;
