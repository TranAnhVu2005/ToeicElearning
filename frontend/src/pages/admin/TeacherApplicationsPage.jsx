import React, { useCallback, useEffect, useState } from 'react';
import { BadgeCheck, ClipboardCheck, RefreshCw, Search, X } from 'lucide-react';
import { teacherApplicationService } from '../../services/teacherApplicationService';

const statusNames = {
  PENDING_PAYMENT: 'Chờ thanh toán', PENDING_REVIEW: 'Chờ duyệt', APPROVED: 'Đã duyệt', REJECTED: 'Từ chối',
};
const amountText = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(value || 0));

const TeacherApplicationsPage = () => {
  const [status, setStatus] = useState('PENDING_REVIEW');
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await teacherApplicationService.list({ status, page, size: 20 });
      if (response.code !== 1000 || !response.data) throw new Error(response.message || 'Không tải được hồ sơ.');
      setRows(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
      setTotalElements(response.data.totalElements || 0);
    } catch (err) { setError(err.response?.data?.message || err.message || 'Không tải được hồ sơ.'); }
    finally { setLoading(false); }
  }, [page, status]);

  useEffect(() => { load(); }, [load]);

  const approve = async (id) => {
    setBusyId(id); setError('');
    try {
      const response = await teacherApplicationService.approve(id);
      if (response.code !== 1000) throw new Error(response.message || 'Không thể duyệt hồ sơ.');
      await load();
    } catch (err) { setError(err.response?.data?.message || err.message || 'Không thể duyệt hồ sơ.'); }
    finally { setBusyId(''); }
  };

  const reject = async (event) => {
    event.preventDefault();
    if (!rejecting) return;
    setBusyId(rejecting.id); setError('');
    try {
      const response = await teacherApplicationService.reject(rejecting.id, reason.trim());
      if (response.code !== 1000) throw new Error(response.message || 'Không thể từ chối hồ sơ.');
      setRejecting(null); setReason(''); await load();
    } catch (err) { setError(err.response?.data?.message || err.message || 'Không thể từ chối hồ sơ.'); }
    finally { setBusyId(''); }
  };

  return (
    <main className="min-h-[70vh] bg-[#fffdf2] px-4 py-8 text-[#111] sm:px-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4 border-2 border-black bg-[#FFE600] p-5 shadow-[5px_5px_0_#111] sm:p-7">
          <div><div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest"><ClipboardCheck size={17} /> Khu vực quản trị</div><h1 className="mt-2 text-3xl font-black sm:text-4xl">Hồ sơ giáo viên</h1><p className="mt-2 font-semibold">Chỉ hồ sơ đã thanh toán thành công mới được duyệt. Duyệt hồ sơ mới cấp quyền giáo viên.</p></div>
          <button type="button" onClick={load} disabled={loading} className="inline-flex min-h-11 items-center gap-2 border-2 border-black bg-white px-4 py-2 font-black shadow-[3px_3px_0_#111]"><RefreshCw size={16} /> Làm mới</button>
        </header>
        {error && <div role="alert" className="mb-4 border-2 border-black bg-rose-200 p-4 font-bold">{error}</div>}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-2 border-black bg-white p-4">
          <label className="flex items-center gap-2 text-sm font-black"><Search size={16} /> Trạng thái<select value={status} onChange={(event) => { setPage(1); setStatus(event.target.value); }} className="min-h-10 border-2 border-black bg-white px-2"><option value="">Tất cả</option><option value="PENDING_PAYMENT">Chờ thanh toán</option><option value="PENDING_REVIEW">Chờ duyệt</option><option value="APPROVED">Đã duyệt</option><option value="REJECTED">Từ chối</option></select></label>
          <span className="text-sm font-bold">{totalElements} hồ sơ</span>
        </div>
        <section className="overflow-hidden border-2 border-black bg-white shadow-[4px_4px_0_#111]">
          {loading ? <p className="p-8 text-center font-bold">Đang tải hồ sơ…</p> : rows.length === 0 ? <p className="p-8 text-center font-bold">Không có hồ sơ trong trạng thái này.</p> : (
            <div className="overflow-x-auto"><table className="w-full min-w-[1000px] border-collapse text-left text-sm"><thead className="bg-[#f1eedf]"><tr>{['Ứng viên', 'Thông tin', 'Hồ sơ', 'Thanh toán', 'Trạng thái', 'Thao tác'].map((label) => <th key={label} className="border-b-2 border-black px-4 py-3 text-xs font-black uppercase">{label}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.id} className="border-b border-black/15 align-top last:border-0"><td className="px-4 py-4"><strong className="block">{row.userName}</strong><span className="text-xs">{row.userEmail}</span></td><td className="max-w-xs whitespace-pre-wrap px-4 py-4">{row.statement || '—'}</td><td className="px-4 py-4 text-xs">{row.createdAt ? new Date(row.createdAt).toLocaleString('vi-VN') : '—'}</td><td className="px-4 py-4"><span className={`inline-block border border-black px-2 py-1 text-xs font-black ${row.paymentStatus === 'SUCCESS' ? 'bg-lime-200' : row.paymentStatus === 'FAILED' ? 'bg-rose-200' : 'bg-amber-200'}`}>{row.paymentStatus || '—'}</span><span className="mt-1 block font-bold">{amountText(row.amount)}</span><span className="mt-1 block break-all font-mono text-[10px]">{row.transactionReference || ''}</span></td><td className="px-4 py-4 font-bold">{statusNames[row.status] || row.status}</td><td className="px-4 py-4">{row.status === 'PENDING_REVIEW' && <div className="flex gap-2"><button type="button" disabled={busyId === row.id || row.paymentStatus !== 'SUCCESS'} onClick={() => approve(row.id)} className="inline-flex items-center gap-1 border-2 border-black bg-lime-200 px-3 py-2 text-xs font-black disabled:opacity-50"><BadgeCheck size={14} /> Duyệt</button><button type="button" disabled={busyId === row.id} onClick={() => { setRejecting(row); setReason(''); }} className="border-2 border-black bg-rose-200 px-3 py-2 text-xs font-black disabled:opacity-50">Từ chối</button></div>}</td></tr>)}</tbody></table></div>
          )}
          <div className="flex items-center justify-between border-t-2 border-black px-4 py-3"><span className="text-xs font-bold">Trang {totalPages ? page : 0} / {totalPages}</span><div className="flex gap-2"><button disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)} className="border-2 border-black px-3 py-1.5 text-sm font-black disabled:opacity-40">Trước</button><button disabled={page >= totalPages || loading} onClick={() => setPage((value) => value + 1)} className="border-2 border-black px-3 py-1.5 text-sm font-black disabled:opacity-40">Sau</button></div></div>
        </section>
      </div>

      {rejecting && <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" role="presentation"><form onSubmit={reject} className="w-full max-w-lg border-2 border-black bg-[#fffdf2] p-5 shadow-[6px_6px_0_#111]" role="dialog" aria-modal="true" aria-labelledby="reject-title"><div className="flex items-center justify-between"><h2 id="reject-title" className="text-xl font-black">Từ chối hồ sơ</h2><button type="button" onClick={() => setRejecting(null)} aria-label="Đóng" className="border-2 border-black bg-white p-2"><X size={17} /></button></div><p className="mt-2 text-sm font-semibold">Lý do sẽ hiển thị cho ứng viên.</p><label className="mt-4 block text-sm font-black">Lý do<textarea required minLength={2} maxLength={500} rows={4} value={reason} onChange={(event) => setReason(event.target.value)} className="mt-1 w-full border-2 border-black bg-white p-3 font-medium focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#FF5B93]" /></label><div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setRejecting(null)} className="border-2 border-black bg-white px-4 py-2 font-black">Hủy</button><button type="submit" disabled={busyId === rejecting.id || reason.trim().length < 2} className="border-2 border-black bg-rose-200 px-4 py-2 font-black disabled:opacity-50">Xác nhận từ chối</button></div></form></div>}
    </main>
  );
};

export default TeacherApplicationsPage;
