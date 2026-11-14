import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  MapPin,
  Pause,
  Phone,
  Play,
  UserCheck,
} from 'lucide-react';
import heroLibraryBg from '../assets/img/coursepage/thuvien.jpg';
import ctuAdminImg from '../assets/img/ctu/nhadieuhanh.jpg';
import ctuTurtleHallImg from '../assets/img/ctu/hoitruongrua.jpg';
import ctuCampusImg from '../assets/img/ctu/daihoccantho.jpg';
import ctuPanoramaImg from '../assets/img/ctu/toancanh.jpg';
import studyDeskImg from '../assets/img/home-optimized/lambai.jpg';
import zaloLogoImg from '../assets/img/zalo_email/zalo.png';
import gmailLogoImg from '../assets/img/zalo_email/email.png';

const CTU_SLIDES = [
  {
    image: ctuAdminImg,
    label: 'Nhà điều hành — Đại học Cần Thơ',
  },
  {
    image: ctuTurtleHallImg,
    label: 'Hội trường Rùa — Đại học Cần Thơ',
  },
  {
    image: ctuCampusImg,
    label: 'Cổng trường Đại học Cần Thơ',
  },
  {
    image: ctuPanoramaImg,
    label: 'Toàn cảnh Đại học Cần Thơ',
  },
];

const contactChannels = [
  {
    image: zaloLogoImg,
    imageAlt: 'Biểu tượng Zalo',
    label: 'Điện thoại / Zalo trực tiếp',
    value: '0359 906 510',
    href: 'tel:0359906510',
    actionLabel: 'Gọi ngay 0359 906 510',
    note: 'Khi bạn có vấn đề khẩn cấp cần xử lý, hãy liên hệ ngay với chúng tôi.',
  },
  {
    image: gmailLogoImg,
    imageAlt: 'Biểu tượng Gmail',
    label: 'Hộp thư điện tử',
    value: 'trananhvu314159@gmail.com',
    href: 'mailto:trananhvu314159@gmail.com',
    actionLabel: 'Gửi email hỗ trợ',
    note: 'Tiếp nhận góp ý nội dung đề thi, đề xuất tính năng và trao đổi về hồ sơ giảng viên.',
  },
];

const supportNotes = [
  {
    step: '01',
    title: 'Báo lỗi audio, hình ảnh hoặc đáp án câu hỏi',
    detail: 'Vui lòng ghi rõ tên đề thi, phần và số câu.',
  },
  {
    step: '02',
    title: 'Hỗ trợ tài khoản, lớp học và giao dịch VNPAY',
    detail: 'Cung cấp email đăng nhập hoặc mã giao dịch VNPAY một cách chính xác.',
  },
  {
    step: '03',
    title: 'Góp ý trải nghiệm phòng thi & tính năng mới',
    detail: 'Mọi đóng góp về giao diện làm bài, tốc độ phát audio hoặc tính năng ôn tập đều được ghi nhận để hoàn thiện hệ thống.',
  },
];

const ContactPage = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = () => setPrefersReducedMotion(motionQuery.matches);
    syncPreference();
    motionQuery.addEventListener?.('change', syncPreference);
    return () => motionQuery.removeEventListener?.('change', syncPreference);
  }, []);

  useEffect(() => {
    if (isPaused || prefersReducedMotion) return undefined;
    const timer = window.setInterval(() => {
      if (!document.hidden) {
        setActiveSlide((prev) => (prev + 1) % CTU_SLIDES.length);
      }
    }, 5500);
    return () => window.clearInterval(timer);
  }, [isPaused, prefersReducedMotion]);

  const goToSlide = (nextIndex) => {
    setActiveSlide((nextIndex + CTU_SLIDES.length) % CTU_SLIDES.length);
  };

  const currentSlide = CTU_SLIDES[activeSlide] || CTU_SLIDES[0];

  return (
    <main className="contact-page min-h-screen bg-[#F8FAFC] text-[#111827]">
      {/* Editorial Photo Header Banner with Seamless Fade */}
      <section
        className="relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(248, 250, 252, 0.58) 0%, rgba(248, 250, 252, 0.45) 45%, rgba(248, 250, 252, 0.85) 84%, #F8FAFC 100%), url("${heroLibraryBg}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 42%',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2.5">
              <h1
                className="text-3xl font-semibold tracking-tight text-[#111111] sm:text-4xl"
                style={{
                  textShadow: '0 2px 12px rgba(255, 255, 255, 0.95), 0 1px 3px rgba(255, 255, 255, 0.9)',
                }}
              >
                Liên hệ
              </h1>

              <p
                className="max-w-2xl text-[15px] font-semibold leading-relaxed text-[#1E293B]"
                style={{
                  textShadow: '0 1px 8px rgba(255, 255, 255, 0.95)',
                }}
              >
                Tiếp nhận phản hồi về nội dung đề thi, hỗ trợ kỹ thuật khi gặp sự cố trong xử lý giao dịch, hồ sơ giáo viên.
              </p>
            </div>

            {/* Maintainer Identity Card on Banner */}
            <div className="shrink-0 rounded-[2px] border border-[#CBD5E1] bg-white/94 px-5 py-4 backdrop-blur-sm lg:min-w-[270px]">
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[2px] border border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]">
                  <UserCheck size={19} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <strong className="block text-lg font-semibold leading-tight text-[#111111]">
                    Trần Anh Vũ
                  </strong>
                  <a
                    href="tel:0359906510"
                    className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1D4ED8] hover:underline"
                  >
                    <Phone size={13} aria-hidden="true" />
                    <span>0359 906 510</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area with Auto-Rotating CTU Campus Slider Backdrop */}
      <div className="relative overflow-hidden pb-16">
        {/* Background Crossfade Slides */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {CTU_SLIDES.map((slide, index) => (
            <div
              key={slide.label}
              className={`absolute inset-0 bg-cover bg-no-repeat transition-opacity duration-1000 ease-in-out ${index === activeSlide ? 'opacity-100' : 'opacity-0'
                }`}
              style={{
                backgroundImage: `url("${slide.image}")`,
                backgroundPosition: 'center 38%',
              }}
            />
          ))}
          {/* Seamless Top Fade + Subtle Readability Veil */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, #F8FAFC 0%, rgba(248, 250, 252, 0.72) 64px, rgba(248, 250, 252, 0.26) 180px, rgba(248, 250, 252, 0.22) 75%, rgba(248, 250, 252, 0.56) 100%)',
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl space-y-8 px-4 pt-8 sm:px-6 lg:px-8">
          {/* 2 Direct Contact Channels */}
          <section className="grid gap-6 md:grid-cols-2" aria-label="Kênh liên hệ trực tiếp">
            {contactChannels.map((channel) => (
              <article
                key={channel.label}
                className="flex flex-col justify-between rounded-[2px] border border-[#D1D5DB] bg-white/94 p-6 backdrop-blur-md transition-colors hover:border-[#9CA3AF]"
              >
                <div>
                  <div className="flex items-center gap-3.5 border-b border-[#E5E7EB] pb-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[2px] border border-[#D1D5DB] bg-white p-1.5">
                      <img
                        src={channel.image}
                        alt={channel.imageAlt}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#4B5563]">
                      {channel.label}
                    </p>
                  </div>

                  {channel.href ? (
                    <a
                      href={channel.href}
                      className="mt-4 block break-all text-xl font-semibold text-[#111111] hover:text-[#1D4ED8] hover:underline"
                    >
                      {channel.value}
                    </a>
                  ) : (
                    <p className="mt-4 text-xl font-semibold text-[#111111]">{channel.value}</p>
                  )}

                  {channel.note && (
                    <p className="mt-2.5 text-sm leading-relaxed text-[#4B5563]">
                      {channel.note}
                    </p>
                  )}
                </div>

                {channel.href && channel.actionLabel && (
                  <div className="mt-5 border-t border-[#E5E7EB] pt-3.5">
                    <a
                      href={channel.href}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1D4ED8] hover:text-[#1E40AF] hover:underline"
                    >
                      <span>{channel.actionLabel}</span>
                      <ArrowRight size={14} aria-hidden="true" />
                    </a>
                  </div>
                )}
              </article>
            ))}
          </section>

          {/* Bottom 2-Column Section: Editorial Support Guide + Learning Shortcut */}
          <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
            {/* Support Guidelines - Flat Editorial List with Thin Dividers (No Nested Cards) */}
            <div className="rounded-[2px] border border-[#D1D5DB] bg-white/94 p-6 backdrop-blur-md">
              <div className="border-b border-[#E5E7EB] pb-3.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#1D4ED8]">
                  Mô tả chính xác yêu cầu hỗ trợ khi liên hệ
                </p>
              </div>

              <ol className="divide-y divide-[#E5E7EB]">
                {supportNotes.map((item) => (
                  <li
                    key={item.title}
                    className="flex items-baseline gap-4 py-4 first:pt-4 last:pb-1"
                  >
                    <span className="shrink-0 text-sm font-semibold text-[#6B7280] tabular-nums">
                      {item.step}
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-base font-semibold text-[#111111]">{item.title}</h2>
                      <p className="mt-1 text-sm leading-relaxed text-[#4B5563]">{item.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Learning Shortcut Card - Clean Editorial Image Crop + Typography */}
            <aside className="flex flex-col justify-between overflow-hidden rounded-[2px] border border-[#D1D5DB] bg-white/94 backdrop-blur-md">
              <div className="h-44 w-full overflow-hidden border-b border-[#D1D5DB] bg-[#F1F5F9]">
                <img
                  src={studyDeskImg}
                  alt="Không gian học tập và luyện thi TOEIC"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex flex-1 flex-col justify-between p-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#1D4ED8]">
                    Mỗi góp ý của bạn là những điều đáng quý mà chúng tôi sẽ chắt lọc để nâng cấp hệ thống của mình
                  </p>

                  <p className="mt-2 text-sm leading-relaxed text-[#4B5563]">
                    Cùng tạo ra một cộng đồng học tiếng Anh "sạch", "đẹp" và cùng nhau tiến bộ nhé.
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap gap-3 border-t border-[#E5E7EB] pt-4">
                  <Link
                    to="/courses"
                    className="inline-flex min-h-[42px] items-center gap-2 rounded-[2px] border border-[#1D4ED8] bg-[#1D4ED8] px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-[#173ea8]"
                  >
                    <span>Khám phá đề thi</span>
                    <ArrowRight size={15} aria-hidden="true" />
                  </Link>

                </div>
              </div>
            </aside>
          </section>

          {/* CTU Campus Slider Controls Bar */}
          <div
            className="flex flex-wrap items-center justify-between gap-3 rounded-[2px] border border-[#CBD5E1]/95 bg-white/92 px-4 py-3 backdrop-blur-md"
            aria-label="Điều khiển ảnh nền Đại học Cần Thơ"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-[#334155]">
              <MapPin size={14} className="shrink-0 text-[#1D4ED8]" aria-hidden="true" />
              <span>{currentSlide.label}</span>
              <span className="text-[#64748B] tabular-nums">
                ({activeSlide + 1}/{CTU_SLIDES.length})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goToSlide(activeSlide - 1)}
                aria-label="Ảnh khuôn viên CTU trước"
                title="Ảnh trước"
                className="ctu-slider-dot inline-flex h-8 w-8 items-center justify-center rounded-[2px] border border-[#CBD5E1] bg-white text-[#334155] transition-colors hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
              >
                <ChevronLeft size={15} aria-hidden="true" />
              </button>

              <div className="flex items-center gap-1.5 px-1" role="tablist" aria-label="Chọn ảnh khuôn viên CTU">
                {CTU_SLIDES.map((slide, index) => {
                  const isActive = index === activeSlide;
                  return (
                    <button
                      key={slide.label}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-label={`Xem ảnh ${index + 1}: ${slide.label}`}
                      onClick={() => goToSlide(index)}
                      className={`ctu-slider-dot h-2.5 rounded-[2px] transition-all ${isActive
                        ? 'w-7 bg-[#1D4ED8]'
                        : 'w-2.5 bg-[#CBD5E1] hover:bg-[#94A3B8]'
                        }`}
                    />
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => goToSlide(activeSlide + 1)}
                aria-label="Ảnh khuôn viên CTU tiếp theo"
                title="Ảnh tiếp theo"
                className="ctu-slider-dot inline-flex h-8 w-8 items-center justify-center rounded-[2px] border border-[#CBD5E1] bg-white text-[#334155] transition-colors hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
              >
                <ChevronRight size={15} aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => setIsPaused((prev) => !prev)}
                aria-label={isPaused ? 'Tiếp tục tự chuyển ảnh nền' : 'Tạm dừng tự chuyển ảnh nền'}
                title={isPaused ? 'Tiếp tục tự chuyển ảnh' : 'Tạm dừng tự chuyển ảnh'}
                className="ctu-slider-dot inline-flex h-8 w-8 items-center justify-center rounded-[2px] border border-[#CBD5E1] bg-white text-[#334155] transition-colors hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
              >
                {isPaused ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ContactPage;
