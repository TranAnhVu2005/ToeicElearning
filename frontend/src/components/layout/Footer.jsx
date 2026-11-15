import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageSquareText } from 'lucide-react';
import brandLogo from '../../assets/img/layout/logo1.png';
import { TOBY_IMAGES } from '../common/TobyMascot';
import { openAiAssistant } from '../../services/aiService';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="container">
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
                Nuna, người bạn đồng hành luôn xuất hiện nhắc nhở ôn tập và giải đáp mọi câu hỏi TOEIC của bạn.
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
                Chọn đề thi phù hợp, dành ra 120 phút để làm fulltest hoặc luyện tập từng Part theo mục tiêu cá nhân.
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
