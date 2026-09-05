import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Play, Award, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const HeroSection = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-grid">
          {/* Left Content */}
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={16} /> Nền tảng học TOEIC hiện đại #1 CTU
            </div>
            <h1 className="hero-title">
              Chinh phục điểm số <span className="highlight">TOEIC 850+</span> dễ dàng hơn bao giờ hết
            </h1>
            <p className="hero-description">
              Hệ thống hóa toàn bộ kiến thức 7 phần thi TOEIC Listening & Reading. Ngân hàng đề bám sát đề thi thật ETS với lời giải chi tiết và phương pháp phản xạ độc quyền.
            </p>

            <div className="hero-actions">
              <Link to={isAuthenticated ? '/practice' : '/register'} className="btn btn-primary btn-lg">
                {isAuthenticated ? 'Bắt đầu luyện tập ngay' : 'Đăng ký học thử miễn phí'} <ArrowRight size={20} />
              </Link>
              <Link to="/about" className="btn btn-outline btn-lg">
                Tìm hiểu thêm
              </Link>
            </div>

            {/* Quick check points */}
            <div className="hero-checkpoints">
              <div className="checkpoint-item">
                <CheckCircle2 size={18} color="var(--primary)" />
                <span>Format ETS mới nhất</span>
              </div>
              <div className="checkpoint-item">
                <CheckCircle2 size={18} color="var(--primary)" />
                <span>Phân tích lộ trình học tập</span>
              </div>
              <div className="checkpoint-item">
                <CheckCircle2 size={18} color="var(--primary)" />
                <span>Miễn phí 100% cho sinh viên</span>
              </div>
            </div>
          </div>

          {/* Right Visual Card */}
          <div className="hero-visual">
            <div className="hero-image-card">
              <img
                src="/images/course-1.webp"
                alt="TOEIC Study"
                className="hero-main-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80';
                }}
              />

              {/* Floating Stat Badge 1 */}
              <div className="floating-badge badge-top-right">
                <div className="floating-badge-icon">
                  <Award size={22} color="var(--primary)" />
                </div>
                <div>
                  <div className="badge-value">98.5%</div>
                  <div className="badge-label">Học viên đạt mục tiêu</div>
                </div>
              </div>

              {/* Floating Stat Badge 2 */}
              <div className="floating-badge badge-bottom-left">
                <div className="floating-badge-icon" style={{ background: '#fef3c7' }}>
                  <Sparkles size={22} color="var(--accent)" />
                </div>
                <div>
                  <div className="badge-value">7 Parts</div>
                  <div className="badge-label">Đầy đủ đề & đáp án</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
