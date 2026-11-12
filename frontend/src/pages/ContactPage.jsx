import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock, Mail, MapPin, Phone } from 'lucide-react';

const contactChannels = [
  {
    icon: Phone,
    label: 'Điện thoại / Zalo hỗ trợ',
    value: '0359 906 510',
    href: 'tel:0359906510',
    note: 'Liên hệ trực tiếp khi cần hỗ trợ tài khoản, lớp học hoặc báo lỗi nội dung đề thi.',
  },
  {
    icon: Mail,
    label: 'Hộp thư điện tử',
    value: 'support@toeiclearning.vn',
    href: 'mailto:support@toeiclearning.vn',
    note: 'Gửi góp ý học thuật, câu hỏi về đề thi TOEIC hoặc hồ sơ giảng viên.',
  },
  {
    icon: MapPin,
    label: 'Đơn vị thực hiện',
    value: 'Trường CNTT & TT — Đại học Cần Thơ',
    href: null,
    note: 'Học phần Niên luận ngành Công nghệ thông tin (CT446E).',
  },
];

const supportNotes = [
  {
    title: 'Báo lỗi audio, hình ảnh hoặc đáp án câu hỏi',
    detail: 'Ghi rõ tên đề thi, Part và số câu (ví dụ: ETS 2026 Test 01 · Part 3 · Câu 41) để quản trị viên đối chiếu nhanh.',
  },
  {
    title: 'Hỗ trợ tài khoản, lớp học và đề thi VIP',
    detail: 'Cung cấp email đăng nhập hoặc mã tham chiếu VNPAY (TxnRef) khi cần kiểm tra quyền truy cập đề thi.',
  },
];

const ContactPage = () => {
  return (
    <main className="contact-page min-h-screen bg-white px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="border-b border-slate-200 pb-6">
          <p className="editorial-eyebrow font-mono text-xs font-semibold uppercase tracking-widest text-[#1D4ED8]">
            LIÊN HỆ & HỖ TRỢ HỌC VIÊN
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900 sm:text-4xl">
            Kết nối với nhóm phát triển TOEIC Learning
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
            Chúng tôi luôn sẵn sàng tiếp nhận phản hồi về nội dung câu hỏi Part 1–7, hỗ trợ kỹ thuật phòng thi trực tuyến và xét duyệt hồ sơ giảng viên.
          </p>
        </header>

        <section className="grid gap-5 md:grid-cols-3" aria-label="Kênh liên hệ trực tiếp">
          {contactChannels.map((channel) => {
            const Icon = channel.icon;
            return (
              <article
                key={channel.label}
                className="flex flex-col justify-between border border-slate-200 bg-white p-6"
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center border border-slate-200 bg-[#EFF6FF] text-[#1D4ED8]">
                    <Icon size={18} aria-hidden="true" />
                  </div>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {channel.label}
                  </p>
                  {channel.href ? (
                    <a
                      href={channel.href}
                      className="mt-1.5 block font-mono text-lg font-bold text-slate-900 hover:text-[#1D4ED8] hover:underline"
                    >
                      {channel.value}
                    </a>
                  ) : (
                    <p className="mt-1.5 text-lg font-semibold text-slate-900">{channel.value}</p>
                  )}
                </div>
                <p className="mt-3 border-t border-slate-100 pt-3 text-sm leading-relaxed text-slate-600">
                  {channel.note}
                </p>
              </article>
            );
          })}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1D4ED8]">
              <Clock size={15} aria-hidden="true" />
              <span>Hướng dẫn gửi yêu cầu hỗ trợ nhanh</span>
            </div>
            <div className="mt-4 space-y-3">
              {supportNotes.map((item) => (
                <div key={item.title} className="border border-slate-200 bg-slate-50/70 p-4">
                  <h2 className="text-base font-semibold text-slate-900">{item.title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="flex flex-col justify-between border border-slate-200 bg-slate-50/70 p-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-600">
                <BookOpen size={15} aria-hidden="true" />
                <span>Lối tắt học tập</span>
              </div>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">
                Tiếp tục lộ trình luyện thi TOEIC
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Mở danh mục đề thi chuẩn cấu trúc 7 Part hoặc rèn kỹ năng nghe chép chính tả theo từng câu.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/courses"
                className="inline-flex min-h-[42px] items-center gap-2 border border-[#1D4ED8] bg-[#1D4ED8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#173ea8]"
              >
                Khám phá đề thi <ArrowRight size={15} />
              </Link>
              <Link
                to="/practice"
                className="inline-flex min-h-[42px] items-center border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
              >
                Luyện theo Part
              </Link>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
};

export default ContactPage;
