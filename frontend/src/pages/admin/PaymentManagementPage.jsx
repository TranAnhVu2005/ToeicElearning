import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, CreditCard, LoaderCircle, RefreshCw, Search } from 'lucide-react';
import { adminService } from '../../services/adminService';

const statusLabel = {
  PENDING: 'Đang xử lý', SUCCESS: 'Thành công', FAILED: 'Thất bại', CANCELLED: 'Đã hủy', EXPIRED: 'Hết hạn',
};
const productLabel = {
  TEACHER_APPLICATION: 'Đăng ký giáo viên',
  TEST_VIP: 'Mua đề VIP',
};

const formatVnd = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(amount || 0));
const formatVietnamDateTime = (value) => {
  if (!value) return '—';
  const hasZone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(value);
  const date = new Date(hasZone ? value : `${value}+07:00`);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(date);
};

const PaymentManagementPage = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [keywordDraft, setKeywordDraft] = useState('');
  const [filters, setFilters] = useState({ keyword: '', status: '', productType: '', fromDate: '', toDate: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedPaymentId, setExpandedPaymentId] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({});
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const requestGeneration = useRef(0);
  const detailRequestGeneration = useRef(0);
  const invalidDateRange = Boolean(filters.fromDate && filters.toDate && filters.fromDate > filters.toDate);

  const loadPayments = useCallback(async () => {
    const requestId = ++requestGeneration.current;
    if (filters.fromDate && filters.toDate && filters.fromDate > filters.toDate) {
      setRows([]); setTotalPages(0); setTotalElements(0); setError('Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.'); setLoading(false);
      return;
    }
    setLoading(true); setError('');
    const params = {
      numberPage: page,
      sizeOfPage: 20,
      sortBy: 'paymentDate',
      direction: 'DESC',
      ...(filters.keyword ? { keyword: filters.keyword } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.productType ? { productType: filters.productType } : {}),
      ...(filters.fromDate ? { fromDate: `${filters.fromDate}T00:00:00` } : {}),
      ...(filters.toDate ? { toDate: `${filters.toDate}T23:59:59.999999999` } : {}),
    };
    try {
      const response = await adminService.getPayments(params);
      if (requestId !== requestGeneration.current) return;
      if (response.code !== 1000 || !response.data) throw new Error(response.message || 'Không tải được lịch sử giao dịch.');
      setRows(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
      setTotalElements(response.data.totalElements || 0);
    } catch (err) {
      if (requestId === requestGeneration.current) {
        setRows([]); setTotalPages(0); setTotalElements(0);
        setError(err.response?.data?.message || err.message || 'Không tải được lịch sử giao dịch.');
      }
    } finally { if (requestId === requestGeneration.current) setLoading(false); }
  }, [filters, page]);

  useEffect(() => {
    loadPayments();
    return () => { requestGeneration.current += 1; };
  }, [loadPayments]);

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setFilters((current) => ({ ...current, keyword: keywordDraft.trim() }));
  };

  const togglePaymentDetails = async (paymentId) => {
    if (expandedPaymentId === paymentId) {
      detailRequestGeneration.current += 1;
      setExpandedPaymentId('');
      setDetailLoading(false);
      setDetailError('');
      return;
    }
    setExpandedPaymentId(paymentId);
    setDetailError('');
    if (paymentDetails[paymentId]) return;

    const requestId = ++detailRequestGeneration.current;
    setDetailLoading(true);
    try {
      const response = await adminService.getPaymentDetails(paymentId);
      if (requestId !== detailRequestGeneration.current) return;
      if (response.code !== 1000 || !response.data) throw new Error(response.message || 'Không tải được chi tiết giao dịch.');
      setPaymentDetails((current) => ({ ...current, [paymentId]: response.data }));
    } catch (err) {
      if (requestId === detailRequestGeneration.current) {
        setDetailError(err.response?.data?.message || err.message || 'Không tải được chi tiết giao dịch.');
      }
    } finally {
      if (requestId === detailRequestGeneration.current) setDetailLoading(false);
    }
  };

  return (
    <main className="min-h-[70vh] bg-[#fffdf5] px-4 py-10 text-slate-950 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-7 flex flex-wrap items-center justify-between gap-4 border-2 border-black bg-[#FFE600] p-6 shadow-[5px_5px_0_#111]">
          <div><div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest"><CreditCard size={18} /> Khu vực quản trị</div>
          <h1 className="mt-2 text-3xl font-black">Lịch sử thanh toán</h1>
          <p className="mt-2 font-semibold">Tra cứu giao dịch đã ghi nhận trong hệ thống. Trang này chỉ đọc trạng thái lưu ở máy chủ.</p></div>
          <button type="button" onClick={loadPayments} disabled={loading || invalidDateRange} className="inline-flex items-center gap-2 border-2 border-black bg-white px-4 py-2 font-black shadow-[3px_3px_0_#111] disabled:opacity-50"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Làm mới</button>
        </header>

        <div className="mb-5 border-2 border-black bg-amber-100 p-4 text-sm font-semibold">
          Giao dịch cũ có thể chưa lưu loại sản phẩm. Đây là màn tra cứu; trạng thái chỉ do callback thanh toán đã xác minh cập nhật.
        </div>

        {error && <div role="alert" className="mb-4 border-2 border-black bg-rose-200 p-4 font-bold">{error}</div>}

        <form onSubmit={handleSearch} className="mb-5 grid gap-3 border-2 border-black bg-white p-4 shadow-[3px_3px_0_#111] sm:grid-cols-2 xl:grid-cols-6">
          <label className="sm:col-span-2 xl:col-span-1"><span className="mb-1 block text-xs font-black uppercase">Người trả / email / mã GD</span><input value={keywordDraft} onChange={(event) => setKeywordDraft(event.target.value)} maxLength={120} placeholder="Nhập từ khóa" className="w-full border-2 border-black px-3 py-2" /></label>
          <label><span className="mb-1 block text-xs font-black uppercase">Trạng thái</span><select value={filters.status} onChange={(event) => { setPage(1); setFilters((current) => ({ ...current, status: event.target.value })); }} className="w-full border-2 border-black bg-white px-3 py-2"><option value="">Tất cả</option><option value="PENDING">Đang xử lý</option><option value="SUCCESS">Thành công</option><option value="FAILED">Thất bại</option><option value="CANCELLED">Đã hủy</option><option value="EXPIRED">Hết hạn</option></select></label>
          <label><span className="mb-1 block text-xs font-black uppercase">Loại sản phẩm</span><select value={filters.productType} onChange={(event) => { setPage(1); setFilters((current) => ({ ...current, productType: event.target.value })); }} className="w-full border-2 border-black bg-white px-3 py-2"><option value="">Tất cả</option><option value="TEACHER_APPLICATION">Đăng ký giáo viên</option><option value="TEST_VIP">Mua đề VIP</option></select></label>
          <label><span className="mb-1 block text-xs font-black uppercase">Từ ngày</span><input type="date" value={filters.fromDate} onChange={(event) => { setPage(1); setFilters((current) => ({ ...current, fromDate: event.target.value })); }} className="w-full border-2 border-black px-3 py-2" /></label>
          <label><span className="mb-1 block text-xs font-black uppercase">Đến ngày</span><input type="date" value={filters.toDate} onChange={(event) => { setPage(1); setFilters((current) => ({ ...current, toDate: event.target.value })); }} className="w-full border-2 border-black px-3 py-2" /></label>
          <button disabled={invalidDateRange} className="inline-flex items-center justify-center gap-2 border-2 border-black bg-black px-4 py-2 font-black text-white disabled:opacity-50"><Search size={16} /> Tìm kiếm</button>
        </form>
        {invalidDateRange && <p role="alert" className="-mt-3 mb-5 border-2 border-black bg-rose-200 p-3 text-sm font-bold">Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.</p>}

        <section className="overflow-hidden border-2 border-black bg-white shadow-[4px_4px_0_#111]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black px-4 py-3"><h2 className="font-black">Giao dịch</h2><span className="text-sm font-bold">{totalElements} bản ghi</span></div>
          {loading ? <p className="p-8 text-center font-bold">Đang tải giao dịch…</p> : error ? <p className="p-8 text-center font-bold">Không thể tải giao dịch. Hãy kiểm tra bộ lọc hoặc thử làm mới.</p> : rows.length === 0 ? <p className="p-8 text-center font-bold">Không tìm thấy giao dịch phù hợp.</p> : (
            <div className="overflow-x-auto"><table className="w-full min-w-[1120px] border-collapse text-left text-sm"><thead className="bg-black text-white"><tr>{['Người thanh toán', 'Sản phẩm', 'Mã giao dịch', 'Số tiền', 'Trạng thái', 'Tạo lúc', 'Thanh toán lúc', ''].map((heading, index) => <th key={heading || `details-${index}`} className="border-b-2 border-black px-4 py-3 text-xs font-black uppercase">{heading}</th>)}</tr></thead><tbody>{rows.map((row) => {
              const detail = paymentDetails[row.id];
              const expanded = expandedPaymentId === row.id;
              return <React.Fragment key={row.id}>
                <tr className="border-b border-slate-200">
                  <td className="px-4 py-3"><span className="block font-black">{row.payerName}</span><span className="text-xs text-slate-600">{row.payerEmail}</span></td>
                  <td className="px-4 py-3"><span className="block font-bold">{productLabel[row.productType] || row.productType || 'Chưa xác định'}</span>{row.productName && <span className="text-xs text-slate-600">{row.productName}</span>}</td>
                  <td className="px-4 py-3 font-mono text-xs">{row.transactionReference}</td>
                  <td className="px-4 py-3 font-black">{formatVnd(row.amount)}</td>
                  <td className="px-4 py-3"><span className={`inline-block border border-black px-2 py-1 text-xs font-black ${row.status === 'SUCCESS' ? 'bg-lime-200' : row.status === 'FAILED' || row.status === 'CANCELLED' || row.status === 'EXPIRED' ? 'bg-rose-200' : 'bg-amber-200'}`}>{statusLabel[row.status] || row.status || 'Chưa xác định'}</span></td>
                  <td className="px-4 py-3">{formatVietnamDateTime(row.paymentDate)}</td>
                  <td className="px-4 py-3">{formatVietnamDateTime(row.paidAt)}</td>
                  <td className="px-4 py-3"><button type="button" aria-label={`${expanded ? 'Ẩn' : 'Xem'} chi tiết giao dịch ${row.transactionReference}`} aria-expanded={expanded} onClick={() => togglePaymentDetails(row.id)} className="inline-flex items-center gap-1 border-2 border-black bg-[#FFE600] px-3 py-2 text-xs font-black shadow-[2px_2px_0_#111]">{expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />} Chi tiết</button></td>
                </tr>
                {expanded && <tr id={`payment-details-${row.id}`} className="border-b-2 border-black bg-[#fffdf2]"><td colSpan={8} className="p-4">
                  {detailLoading && <p className="flex items-center gap-2 font-bold"><LoaderCircle size={16} className="animate-spin" /> Đang tải chi tiết giao dịch…</p>}
                  {detailError && <p role="alert" className="border-2 border-black bg-rose-200 p-3 font-bold">{detailError}</p>}
                  {detail && <dl className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
                    <div><dt className="text-xs font-black uppercase">ID giao dịch nội bộ</dt><dd className="mt-1 break-all font-mono">{detail.id}</dd></div>
                    <div><dt className="text-xs font-black uppercase">Mã giao dịch VNPAY</dt><dd className="mt-1 break-all font-mono">{detail.providerTransactionNumber || 'Chưa nhận được'}</dd></div>
                    <div><dt className="text-xs font-black uppercase">Mã phản hồi VNPAY</dt><dd className="mt-1 font-mono">{detail.providerResponseCode || 'Chưa nhận được'}</dd></div>
                    <div><dt className="text-xs font-black uppercase">Trạng thái xử lý VNPAY</dt><dd className="mt-1 font-mono">{detail.providerTransactionStatus || 'Chưa nhận được'}</dd></div>
                    <div><dt className="text-xs font-black uppercase">ID người thanh toán</dt><dd className="mt-1 break-all font-mono">{detail.payerId}</dd></div>
                    <div><dt className="text-xs font-black uppercase">Loại tiền</dt><dd className="mt-1">{detail.currency || 'VND'}</dd></div>
                    <div><dt className="text-xs font-black uppercase">Thời điểm thanh toán</dt><dd className="mt-1">{formatVietnamDateTime(detail.paidAt)}</dd></div>
                  </dl>}
                </td></tr>}
              </React.Fragment>;
            })}</tbody></table></div>
          )}
          <div className="flex items-center justify-between border-t-2 border-black px-4 py-3"><span className="text-xs font-bold">Trang {totalPages ? page : 0} / {totalPages}</span><div className="flex gap-2"><button disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)} className="border-2 border-black px-3 py-1.5 text-sm font-black disabled:opacity-40">Trước</button><button disabled={page >= totalPages || loading} onClick={() => setPage((current) => current + 1)} className="border-2 border-black px-3 py-1.5 text-sm font-black disabled:opacity-40">Sau</button></div></div>
        </section>
      </div>
    </main>
  );
};

export default PaymentManagementPage;
