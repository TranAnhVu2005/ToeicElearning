import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, MessageSquareText } from 'lucide-react';
import brandLogo from '../../assets/img/logo1.png';
import { TOBY_IMAGES } from '../common/TobyMascot';
import { openAiAssistant } from '../../services/aiService';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="container">
        {/* Duolingo-inspired Nuna Daily Practice Footer Banner */}
        <div className="mb-8 flex flex-col items-center justify-between gap-4 border border-blue-200/90 bg-gradient-to-r from-[#EFF6FF] via-white to-[#F8FAFC] p-5 sm:flex-row sm:p-6">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <div className="flex shrink-0 items-center gap-2">
              <img
                src={TOBY_IMAGES.cheering}
                alt="Chú cún Nuna vẫy tay cổ vũ"
                className="h-16 w-16 rounded-xl border border-blue-200 bg-white object-contain p-1 shadow-2xs"
              />
              <img
                src={TOBY_IMAGES.trophy}
                alt="Chú cún Nuna nâng cúp TOEIC"
                className="hidden h-16 w-16 rounded-xl border border-amber-200 bg-white object-contain p-1 shadow-2xs md:block"
              />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1D4ED8]">
                <Sparkles size={13} />
                <span>🐾 Góc nhắn nhủ từ chú cún Nuna</span>
              </span>
              <h3 className="mt-1 text-lg font-bold text-slate-900">
                Chỉ 15 phút luyện TOEIC mỗi ngày cùng Nuna để bứt phá mục tiêu 990!
              </h3>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-600 sm:text-sm">
                Giữ chuỗi Streak học tập, luyện nghe chép chính tả Dictation và hỏi Nuna AI bất cứ câu nào bạn còn phân vân.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-center gap-2.5">
            <Link
              to="/courses"
              className="inline-flex items-center gap-1.5 border border-[#1D4ED8] bg-[#1D4ED8] px-4 py-2.5 text-xs font-bold text-white no-underline transition-colors hover:bg-[#1E40AF]"
            >
              <span>Làm đề cùng Nuna</span>
              <ArrowRight size={14} />
            </Link>
            <button
              type="button"
              onClick={() =>
                openAiAssistant({
                  autoPrompt: 'Chào Nuna! Hãy gợi ý cho mình mẹo học TOEIC mỗi ngày để giữ chuỗi Streak nhé!',
                })
              }
              className="inline-flex cursor-pointer items-center gap-1.5 border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 transition-colors hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
            >
              <MessageSquareText size={14} className="text-[#1D4ED8]" />
              <span>Hỏi Trợ lý AI Nuna</span>
            </button>
          </div>
        </div>

        <div className="footer-grid">
          {/* Col 1: Brand & About */}
          <div className="footer-col">
            <div className="footer-brand">
              <div className="footer-logo-mark">
                <img src={brandLogo} alt="" />
              </div>
              <span className="logo-title">
                TOEIC <span>ELearning</span>
              </span>
            </div>
            <p className="footer-desc">
              TOEIC Learning hỗ trợ luyện theo từng phần, làm toàn bộ bài thi, nghe chép chính tả và xem lại kết quả chi tiết cùng chú cún đồng hành Nuna.
            </p>
            <div className="mt-3 flex items-center gap-2.5 border border-slate-200 bg-[#F8FAFC] p-2.5">
              <img
                src={TOBY_IMAGES.heart}
                alt="Cún Nuna thả tim"
                className="h-10 w-10 shrink-0 rounded-lg border border-blue-100 bg-white object-contain p-0.5"
              />
              <span className="text-xs leading-snug text-slate-600">
                <strong className="block font-bold text-slate-900">🐾 Linh vật Nuna đồng hành 24/7</strong>
                Luôn xuất hiện nhắc nhở ôn tập và giải đáp mọi câu hỏi TOEIC của bạn.
              </span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Liên kết nhanh</h4>
            <ul className="footer-links">
              <li><Link to="/"><ArrowRight size={14} /> Trang chủ</Link></li>
              <li><Link to="/courses"><ArrowRight size={14} /> Kho đề thi TOEIC</Link></li>
              <li><Link to="/classrooms"><ArrowRight size={14} /> Không gian Lớp học</Link></li>
              <li><Link to="/contact"><ArrowRight size={14} /> Liên hệ & Hỗ trợ</Link></li>
              <li><Link to="/login"><ArrowRight size={14} /> Đăng nhập hệ thống</Link></li>
              <li><Link to="/register"><ArrowRight size={14} /> Đăng ký tài khoản</Link></li>
            </ul>
          </div>

          {/* Col 3: Learning paths and Nuna encouragement */}
          <div className="footer-col">
            <h4 className="footer-heading">Bắt đầu học cùng Nuna</h4>
            <div className="mb-3 flex items-center gap-3 border border-blue-100 bg-[#EFF6FF]/60 p-2.5">
              <img
                src={TOBY_IMAGES.encouragement}
                alt="Nuna cổ vũ chỉ một bài nữa thôi"
                className="h-12 w-18 shrink-0 rounded-lg bg-white object-contain p-0.5"
              />
              <p className="text-xs leading-relaxed text-slate-700">
                Chọn đề thi phù hợp để làm Full Test 200 câu hoặc luyện tập từng Part theo mục tiêu cá nhân.
              </p>
            </div>
            <ul className="footer-links">
              <li><Link to="/courses"><ArrowRight size={14} /> Khám phá đề thi</Link></li>
              <li><Link to="/profile"><ArrowRight size={14} /> Theo dõi Streak & Kỷ lục</Link></li>
              <li><Link to="/contact"><ArrowRight size={14} /> Liên hệ hỗ trợ</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="footer-bottom flex flex-col items-center justify-between gap-2 sm:flex-row">
          <p>
            © {new Date().getFullYear()} TOEIC Learning - Trần Anh Vũ - Zalo: 0359906510
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <img
              src={TOBY_IMAGES.studying}
              alt=""
              className="h-5 w-5 object-contain"
            />
            <span>Đồng hành học tập cùng chú cún Nuna 🐾</span>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
