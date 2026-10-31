import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Headphones, BookOpen, Clock3, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const HeroSection = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="hero-section neo-hero">
      <div className="container neo-hero-grid">
        <div className="neo-hero-copy">
          <div className="neo-eyebrow"><Sparkles size={15} /> TOEIC LEARNING · CTU</div>
          <h1 className="neo-hero-title">Luyện chắc từng phần.<br /><span>Vững vàng ngày thi.</span></h1>
          <p className="neo-hero-description">
            Luyện theo từng Part hoặc làm bài thi thử có giới hạn thời gian. Xem lại câu trả lời và lời giải sau khi nộp bài.
          </p>
          <div className="neo-hero-actions">
            <Link to={isAuthenticated ? '/practice' : '/register'} className="neo-button neo-button-primary">
              {isAuthenticated ? 'Bắt đầu luyện tập' : 'Tạo tài khoản'} <ArrowRight size={18} />
            </Link>
            <Link to="/courses" className="neo-button neo-button-secondary">Khám phá đề thi</Link>
          </div>
          <p className="neo-hero-note">Nghe và Đọc · 7 Parts · Có chế độ luyện và thi thử</p>
        </div>

        <div className="neo-hero-art" aria-label="Tổng quan cấu trúc bài thi TOEIC">
          <div className="neo-art-sticker">LUYỆN TẬP<br />THEO MỤC TIÊU</div>
          <div className="neo-exam-card">
            <div className="neo-exam-card-top"><span>TOEIC PRACTICE</span><span className="neo-live-dot" aria-hidden="true" /></div>
            <h2>Chọn cách<br />bạn muốn học.</h2>
            <div className="neo-mode-row"><span className="neo-mode-icon neo-mode-yellow"><Headphones size={20} /></span><span><strong>Listening</strong><small>Part 1–4 · 100 câu</small></span><ArrowRight size={17} /></div>
            <div className="neo-mode-row"><span className="neo-mode-icon neo-mode-pink"><BookOpen size={20} /></span><span><strong>Reading</strong><small>Part 5–7 · 100 câu</small></span><ArrowRight size={17} /></div>
            <div className="neo-exam-card-footer"><Clock3 size={15} /> Full test TOEIC · 120 phút</div>
          </div>
          <div className="neo-art-number" aria-hidden="true">07</div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
