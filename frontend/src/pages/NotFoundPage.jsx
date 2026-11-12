import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <main className="not-found-page min-h-[75vh] bg-white px-4 py-16 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl border border-slate-200 bg-white p-8 text-center sm:p-10">
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-[#1D4ED8]">
          MÃ TRẠNG THÁI 404
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900 sm:text-4xl">
          Không tìm thấy trang yêu cầu
        </h1>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          Đường dẫn bạn vừa truy cập không tồn tại hoặc đã được thay đổi. Hãy quay về trang chủ hoặc mở thư viện đề thi TOEIC để tiếp tục học tập.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex min-h-[42px] items-center gap-2 border border-[#1D4ED8] bg-[#1D4ED8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#173ea8]"
          >
            <Home size={16} /> Về trang chủ
          </Link>
          <Link
            to="/courses"
            className="inline-flex min-h-[42px] items-center gap-2 border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
          >
            <BookOpen size={16} /> Kho đề thi TOEIC
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex min-h-[42px] items-center gap-1.5 border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400"
          >
            <ArrowLeft size={15} /> Quay lại
          </button>
        </div>
      </div>
    </main>
  );
};

export default NotFoundPage;
