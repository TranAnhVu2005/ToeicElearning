import React, { useCallback, useEffect, useState } from 'react';
import { BadgeCheck, ClipboardCheck, RefreshCw, Search, X } from 'lucide-react';
import { teacherApplicationService } from '../../services/teacherApplicationService';
import AdminNavTabs from '../../components/common/AdminNavTabs';

const statusNames = {
  PENDING_PAYMENT: 'Chờ thanh toán',
  PENDING_REVIEW: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
};
const amountText = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(
    Number(value || 0)
  );

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
    setLoading(true);
    setError('');
    try {
      const response = await teacherApplicationService.list({ status, page, size: 20 });
      if (response.code !== 1000 || !response.data) throw new Error(response.message || 'Không tải được hồ sơ.');
      setRows(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
      setTotalElements(response.data.totalElements || 0);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không tải được hồ sơ.');
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    load();
  }, [load]);

  const approve = async (id) => {
    setBusyId(id);
    setError('');
    try {
      const response = await teacherApplicationService.approve(id);
      if (response.code !== 1000) throw new Error(response.message || 'Không thể duyệt hồ sơ.');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không thể duyệt hồ sơ.');
    } finally {
      setBusyId('');
    }
  };

  const reject = async (event) => {
    event.preventDefault();
    if (!rejecting) return;
    setBusyId(rejecting.id);
    setError('');
    try {
      const response = await teacherApplicationService.reject(rejecting.id, reason.trim());
      if (response.code !== 1000) throw new Error(response.message || 'Không thể từ chối hồ sơ.');
      setRejecting(null);
      setReason('');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không thể từ chối hồ sơ.');
    } finally {
      setBusyId('');
    }
  };

  return (
    <main className="admin-page min-h-screen bg-white px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-widest text-[#1D4ED8]">
              <ClipboardCheck size={16} /> Khu vực quản trị
            </div>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Hồ sơ giáo viên</h1>
            <p className="mt-2 text-sm text-slate-600">
              Chỉ hồ sơ đã thanh toán thành công mới được duyệt. Duyệt hồ sơ mới cấp quyền giáo viên.
            </p>
          </div>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="editorial-button-secondary inline-flex min-h-10 items-center gap-2 px-4 py-2 text-sm font-semibold"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Làm mới
          </button>
        </header>

        <AdminNavTabs />

        {error && (
          <div role="alert" className="mb-5 border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
            {error}
          </div>
        )}

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border border-slate-200 bg-[#F8FAFC] p-4">
          <label className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-slate-700">
            <Search size={15} className="text-[#1D4ED8]" /> Trạng thái
            <select
              value={status}
              onChange={(event) => {
                setPage(1);
                setStatus(event.target.value);
              }}
              className="min-h-9 border border-slate-300 bg-white px-3 text-sm font-normal normal-case text-slate-900 outline-none focus:border-[#1D4ED8]"
            >
              <option value="">Tất cả</option>
              <option value="PENDING_PAYMENT">Chờ thanh toán</option>
              <option value="PENDING_REVIEW">Chờ duyệt</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="REJECTED">Từ chối</option>
            </select>
          </label>
          <span className="font-mono text-xs font-semibold text-slate-600">{totalElements} hồ sơ</span>
        </div>

        <section className="overflow-hidden border border-slate-200 bg-white">
          {loading ? (
            <p className="p-8 text-center text-sm text-slate-500">Đang tải hồ sơ…</p>
          ) : rows.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-500">Không có hồ sơ trong trạng thái này.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600">
                  <tr>
                    {['Ứng viên', 'Thông tin', 'Hồ sơ', 'Thanh toán', 'Trạng thái', 'Thao tác'].map((label) => (
                      <th key={label} className="px-4 py-3">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {rows.map((row) => (
                    <tr key={row.id} className="align-top hover:bg-slate-50/70">
                      <td className="px-4 py-4">
                        <strong className="block text-slate-900">{row.userName}</strong>
                        <span className="font-mono text-xs text-slate-500">{row.userEmail}</span>
                      </td>
                      <td className="max-w-xs whitespace-pre-wrap px-4 py-4 text-slate-700">{row.statement || '—'}</td>
                      <td className="px-4 py-4 font-mono text-xs text-slate-600">
                        {row.createdAt ? new Date(row.createdAt).toLocaleString('vi-VN') : '—'}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-block border px-2 py-0.5 text-xs font-semibold ${
                            row.paymentStatus === 'SUCCESS'
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                              : row.paymentStatus === 'FAILED'
                                ? 'border-red-200 bg-red-50 text-red-700'
                                : 'border-amber-200 bg-amber-50 text-amber-800'
                          }`}
                        >
                          {row.paymentStatus || '—'}
                        </span>
                        <span className="mt-1 block font-mono font-bold text-slate-900">{amountText(row.amount)}</span>
                        <span className="mt-1 block break-all font-mono text-[10px] text-slate-500">
                          {row.transactionReference || ''}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-semibold text-slate-800">{statusNames[row.status] || row.status}</td>
                      <td className="px-4 py-4">
                        {row.status === 'PENDING_REVIEW' && (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={busyId === row.id || row.paymentStatus !== 'SUCCESS'}
                              onClick={() => approve(row.id)}
                              className="editorial-button-primary inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
                            >
                              <BadgeCheck size={14} /> Duyệt
                            </button>
                            <button
                              type="button"
                              disabled={busyId === row.id}
                              onClick={() => {
                                setRejecting(row);
                                setReason('');
                              }}
                              className="border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                            >
                              Từ chối
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-slate-200 bg-[#F8FAFC] px-4 py-3">
            <span className="font-mono text-xs font-semibold text-slate-600">
              Trang {totalPages ? page : 0} / {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1 || loading}
                onClick={() => setPage((value) => value - 1)}
                className="editorial-button-secondary px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
              >
                Trước
              </button>
              <button
                disabled={page >= totalPages || loading}
                onClick={() => setPage((value) => value + 1)}
                className="editorial-button-secondary px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          </div>
        </section>
      </div>

      {rejecting && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="presentation">
          <form
            onSubmit={reject}
            className="w-full max-w-lg border border-slate-200 bg-white p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reject-title"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 id="reject-title" className="text-lg font-bold text-slate-900">
                Từ chối hồ sơ
              </h2>
              <button
                type="button"
                onClick={() => setRejecting(null)}
                aria-label="Đóng"
                className="border border-slate-200 bg-white p-1.5 text-slate-600 hover:text-slate-900"
              >
                <X size={16} />
              </button>
            </div>
            <p className="mt-3 text-xs text-slate-600">Lý do sẽ hiển thị cho ứng viên.</p>
            <label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Lý do
              <textarea
                required
                minLength={2}
                maxLength={500}
                rows={4}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                className="mt-1.5 w-full border border-slate-300 bg-white p-3 text-sm font-normal normal-case text-slate-900 outline-none focus:border-[#1D4ED8]"
              />
            </label>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejecting(null)}
                className="editorial-button-secondary px-4 py-2 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={busyId === rejecting.id || reason.trim().length < 2}
                className="border border-red-600 bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                Xác nhận từ chối
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
};

export default TeacherApplicationsPage;
