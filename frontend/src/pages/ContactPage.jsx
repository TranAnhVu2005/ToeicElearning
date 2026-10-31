import React, { useState } from 'react';
import { Mail, Send } from 'lucide-react';
import Toast from '../components/common/Toast';

const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL?.trim();

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [toast, setToast] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!SUPPORT_EMAIL) {
      setToast({ type: 'error', message: 'Kênh email hỗ trợ chưa được cấu hình. Vui lòng liên hệ quản trị viên của hệ thống.' });
      return;
    }
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setToast({ type: 'error', message: 'Vui lòng điền họ tên, email và nội dung cần hỗ trợ.' });
      return;
    }

    const subject = encodeURIComponent(formData.subject.trim() || 'Yêu cầu hỗ trợ TOEIC Learning');
    const body = encodeURIComponent(`Họ tên: ${formData.name.trim()}\nEmail phản hồi: ${formData.email.trim()}\n\n${formData.message.trim()}`);
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    setToast({ type: 'success', message: 'Đã mở ứng dụng email. Hãy kiểm tra nội dung và bấm Gửi trong ứng dụng để hoàn tất.' });
  };

  const inputClass = 'mt-2 min-h-12 w-full border-2 border-black bg-white px-3 py-2 text-sm font-semibold outline-none placeholder:font-medium placeholder:text-slate-500 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#FF5B93]';

  return (
    <main className="min-h-[75vh] bg-[#f5f0df] px-4 py-10 text-black sm:px-6 sm:py-16">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      <div className="mx-auto max-w-6xl">
        <header className="grid gap-8 border-b-4 border-black pb-10 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="mb-4 inline-flex border-2 border-black bg-[#FF5B93] px-3 py-1 text-xs font-black uppercase tracking-widest shadow-[3px_3px_0_#111]">Liên hệ & hỗ trợ</p>
            <h1 className="max-w-3xl text-4xl font-black leading-[0.98] tracking-tight sm:text-6xl">Cần trợ giúp?<br /><span className="underline decoration-[#FFE600] decoration-8 underline-offset-4">Hãy gửi lời nhắn.</span></h1>
            <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-slate-800 sm:text-lg">Gửi góp ý hoặc câu hỏi về TOEIC Learning. Biểu mẫu sẽ soạn email để bạn xem lại và tự gửi.</p>
          </div>
          <div className="grid h-20 w-20 place-items-center border-2 border-black bg-[#FFE600] shadow-[5px_5px_0_#111] md:h-24 md:w-24">
            <Mail aria-hidden="true" size={42} strokeWidth={2.5} />
          </div>
        </header>

        <div className="grid gap-8 py-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(260px,0.7fr)] lg:py-14">
          <section className="border-2 border-black bg-white p-5 shadow-[6px_6px_0_#111] sm:p-8">
            <div className="mb-7 border-b-2 border-black pb-5">
              <p className="text-xs font-black uppercase tracking-widest text-slate-600">Soạn thư</p>
              <h2 className="mt-2 text-2xl font-black sm:text-3xl">Gửi yêu cầu hỗ trợ</h2>
              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-700">Tin nhắn chưa được gửi cho đến khi bạn xác nhận gửi trong ứng dụng email.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-black" htmlFor="contact-name">Họ và tên <span aria-hidden="true">*</span>
                  <input id="contact-name" className={inputClass} name="name" type="text" autoComplete="name" maxLength={120} required value={formData.name} onChange={handleChange} placeholder="Nguyễn Văn A" />
                </label>
                <label className="block text-sm font-black" htmlFor="contact-email">Email phản hồi <span aria-hidden="true">*</span>
                  <input id="contact-email" className={inputClass} name="email" type="email" autoComplete="email" maxLength={254} required value={formData.email} onChange={handleChange} placeholder="email@example.com" />
                </label>
              </div>
              <label className="block text-sm font-black" htmlFor="contact-subject">Chủ đề
                <input id="contact-subject" className={inputClass} name="subject" type="text" maxLength={160} value={formData.subject} onChange={handleChange} placeholder="Ví dụ: Góp ý câu hỏi Part 3" />
              </label>
              <label className="block text-sm font-black" htmlFor="contact-message">Nội dung <span aria-hidden="true">*</span>
                <textarea id="contact-message" className={`${inputClass} min-h-36 resize-y`} name="message" rows={5} maxLength={5000} required value={formData.message} onChange={handleChange} placeholder="Mô tả câu hỏi hoặc vấn đề bạn gặp phải..." />
              </label>
              <button type="submit" disabled={!SUPPORT_EMAIL} className="inline-flex min-h-12 items-center justify-center gap-2 border-2 border-black bg-[#FFE600] px-5 py-3 font-black shadow-[4px_4px_0_#111] transition-transform hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#111] active:translate-x-1 active:translate-y-1 active:shadow-none focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#FF5B93] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-600 disabled:shadow-none">
                <Send aria-hidden="true" size={17} strokeWidth={2.5} /> Soạn email hỗ trợ
              </button>
            </form>
          </section>

          <aside className="space-y-5">
            <section className="border-2 border-black bg-[#FFE600] p-5 shadow-[6px_6px_0_#111] sm:p-7">
              <p className="text-xs font-black uppercase tracking-widest">Kênh liên hệ</p>
              <h2 className="mt-3 text-2xl font-black">Email hỗ trợ</h2>
              {SUPPORT_EMAIL ? <a className="mt-4 inline-block break-all text-base font-black underline decoration-2 underline-offset-4 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> : <p className="mt-4 border-2 border-black bg-white p-3 text-sm font-bold">Email hỗ trợ chưa được cấu hình.</p>}
              <p className="mt-5 border-t-2 border-black pt-4 text-sm font-semibold leading-relaxed">{SUPPORT_EMAIL ? 'Nếu thiết bị chưa thiết lập ứng dụng email, bạn có thể gửi thư trực tiếp đến địa chỉ này.' : 'Quản trị viên cần cấu hình VITE_SUPPORT_EMAIL để bật biểu mẫu liên hệ.'}</p>
            </section>
            <section className="border-2 border-black bg-white p-5 shadow-[6px_6px_0_#111] sm:p-7">
              <p className="text-xs font-black uppercase tracking-widest text-slate-600">Thông tin gửi thư</p>
              <ul className="mt-4 space-y-3 text-sm font-semibold leading-relaxed text-slate-800">
                <li className="border-l-4 border-[#FF5B93] pl-3">Tên và email của bạn được điền vào nội dung thư.</li>
                <li className="border-l-4 border-[#FFE600] pl-3">Bạn có thể chỉnh sửa thư trước khi gửi.</li>
                <li className="border-l-4 border-black pl-3">Trang này không lưu nội dung biểu mẫu trên hệ thống.</li>
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default ContactPage;
