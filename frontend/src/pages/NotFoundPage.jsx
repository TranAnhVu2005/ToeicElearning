import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <main className="min-h-[75vh] bg-[#FFFDF2] text-[#111111] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full border-[3px] border-[#111111] bg-white p-8 sm:p-10 text-center shadow-[6px_6px_0_#111111]">
        <div className="inline-block border-2 border-[#111111] bg-[#FFE600] px-4 py-1 text-sm font-black uppercase tracking-widest shadow-[3px_3px_0_#111111] mb-4">
          Lỗi 404
        </div>
        <h1 className="text-6xl sm:text-7xl font-black text-[#111111] leading-none mb-3">
          404
        </h1>
        <h2 className="text-2xl font-black mb-3">
          Không tìm thấy trang
        </h2>
        <p className="font-semibold text-[#444444] text-sm mb-6 leading-relaxed">
          Địa chỉ trang web bạn yêu cầu không tồn tại, đã bị gỡ bỏ hoặc đã chuyển sang đường dẫn khác.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 border-2 border-[#111111] bg-[#FFE600] px-5 py-2.5 font-black text-sm shadow-[3px_3px_0_#111111] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#111111]"
          >
            <Home size={17} /> Về trang chủ
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 border-2 border-[#111111] bg-white px-5 py-2.5 font-black text-sm shadow-[3px_3px_0_#111111] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#111111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#111111]"
          >
            <ArrowLeft size={17} /> Quay lại
          </button>
        </div>
      </div>
    </main>
  );
};

export default NotFoundPage;
